package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sort"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
)

// TrendingProvider is a pluggable interface for fetching trending topics
type TrendingProvider interface {
	FetchTrending(ctx context.Context, geo string) ([]models.TrendingItem, error)
}

// redditListing is a minimal shape for reddit listing JSON
type redditListing struct {
	Data struct {
		Children []struct {
			Data struct {
				ID          string  `json:"id"`
				Name        string  `json:"name"`
				Title       string  `json:"title"`
				Selftext    string  `json:"selftext"`
				Author      string  `json:"author"`
				Score       int     `json:"score"`
				NumComments int     `json:"num_comments"`
				Thumbnail   string  `json:"thumbnail"`
				URL         string  `json:"url"`
				Permalink   string  `json:"permalink"`
				Subreddit   string  `json:"subreddit"`
				IsVideo     bool    `json:"is_video"`
				Ups         int     `json:"ups"`
				Ratio       float64 `json:"upvote_ratio"`
			} `json:"data"`
		} `json:"children"`
	} `json:"data"`
}

// redditCommentsResponse minimal shape for a post's comments
type redditCommentsResponse []struct {
	Data struct {
		Children []struct {
			Kind string `json:"kind"`
			Data struct {
				ID     string `json:"id"`
				Author string `json:"author"`
				Body   string `json:"body"`
				Score  int    `json:"score"`
			} `json:"data"`
		} `json:"children"`
	} `json:"data"`
}

func redditSlug(subreddit, redditID string) string {
	return fmt.Sprintf("reddit-%s-%s", strings.ToLower(subreddit), redditID)
}

// RedditProvider fetches headlines from Reddit and extracts trending terms
type RedditProvider struct {
	Client *http.Client
}

func NewRedditProvider() *RedditProvider {
	return &RedditProvider{Client: &http.Client{Timeout: 10 * time.Second}}
}

func (r *RedditProvider) fetchListing(ctx context.Context, url string) (*redditListing, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	// Reddit expects a descriptive user-agent; generic agents are more likely to be throttled.
	req.Header.Set("User-Agent", "windows:seeqme.backend:v1.0 (by /u/seeqme)")
	req.Header.Set("Accept", "application/json")
	resp, err := r.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		snippet := strings.TrimSpace(string(body))
		if len(snippet) > 280 {
			snippet = snippet[:280]
		}
		return nil, fmt.Errorf("reddit listing request failed: %d %s (%s)", resp.StatusCode, resp.Status, snippet)
	}
	var listing redditListing
	if err := json.Unmarshal(body, &listing); err != nil {
		return nil, err
	}
	if len(listing.Data.Children) == 0 {
		return nil, fmt.Errorf("reddit listing returned no children for %s", url)
	}
	return &listing, nil
}

func (r *RedditProvider) FetchTrending(ctx context.Context, geo string) ([]models.TrendingItem, error) {
	listing, err := r.fetchListing(ctx, "https://www.reddit.com/r/all/hot.json?limit=100")
	if err != nil {
		return nil, err
	}

	stop := map[string]bool{
		"the": true, "a": true, "an": true, "in": true, "on": true, "and": true,
		"of": true, "for": true, "to": true, "is": true, "it": true, "at": true,
		"this": true, "that": true, "my": true, "your": true, "how": true,
		"why": true, "what": true, "was": true, "are": true, "with": true,
	}
	counts := map[string]int{}
	for _, ch := range listing.Data.Children {
		words := strings.FieldsFunc(ch.Data.Title, func(r rune) bool {
			return !(r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r >= '0' && r <= '9')
		})
		for _, w := range words {
			w = strings.ToLower(strings.TrimSpace(w))
			if len(w) < 4 || stop[w] {
				continue
			}
			counts[w] += ch.Data.Score/100 + 1
		}
	}

	type kv struct{ k string; v int }
	var arr []kv
	for k, v := range counts {
		arr = append(arr, kv{k, v})
	}
	sort.Slice(arr, func(i, j int) bool { return arr[i].v > arr[j].v })

	var items []models.TrendingItem
	for i := 0; i < len(arr) && i < 10; i++ {
		items = append(items, models.TrendingItem{
			ID:     primitive.NewObjectID(),
			Tag:    arr[i].k,
			Posts:  arr[i].v,
			Source: "reddit",
		})
	}
	return items, nil
}

// FetchAndStoreRedditPosts fetches hot+rising posts from professional subreddits
// and upserts them into the reddit_posts collection.
func (r *RedditProvider) FetchAndStoreRedditPosts(ctx context.Context) {
	db := database.Client.Database(database.DBName)
	coll := db.Collection("reddit_posts")

	categories := []struct {
		path string
		cat  string
	}{
		{"hot", "hot"},
		{"rising", "rising"},
	}

	subreddits := []string{
		"programming+webdev+technology+startups+entrepreneur+MachineLearning+cscareerquestions+devops+ProductManagement+UXDesign",
	}

	for _, sub := range subreddits {
		for _, cat := range categories {
			url := fmt.Sprintf("https://www.reddit.com/r/%s/%s.json?limit=25", sub, cat.path)
			listing, err := r.fetchListing(ctx, url)
			if err != nil {
				log.Printf("[Reddit] fetch error (%s %s): %v", sub, cat.cat, err)
				time.Sleep(2 * time.Second)
				continue
			}

			for _, ch := range listing.Data.Children {
				p := ch.Data
				if p.ID == "" || p.Score < 50 {
					continue
				}

				slug := redditSlug(p.Subreddit, p.ID)

				seoDesc := p.Selftext
				if len(seoDesc) > 160 {
					seoDesc = seoDesc[:160]
				}
				if seoDesc == "" {
					seoDesc = p.Title
				}

				thumbnail := p.Thumbnail
				if thumbnail == "self" || thumbnail == "default" || thumbnail == "nsfw" {
					thumbnail = ""
				}

				post := models.RedditPost{
					RedditID:    p.ID,
					Subreddit:   p.Subreddit,
					Title:       p.Title,
					Selftext:    p.Selftext,
					Author:      p.Author,
					Score:       p.Score,
					NumComments: p.NumComments,
					Thumbnail:   thumbnail,
					URL:         p.URL,
					Permalink:   "https://reddit.com" + p.Permalink,
					Slug:        slug,
					SEOTitle:    fmt.Sprintf("%s · r/%s on SeeqMe", p.Title, p.Subreddit),
					SEODesc:     seoDesc,
					Category:    cat.cat,
					FetchedAt:   time.Now(),
				}

				// Upsert by redditId
				opts := options.Update().SetUpsert(true)
				update := bson.M{
					"$set": bson.M{
						"score":       post.Score,
						"numComments": post.NumComments,
						"category":    post.Category,
						"fetchedAt":   post.FetchedAt,
					},
					"$setOnInsert": bson.M{
						"redditId":  post.RedditID,
						"subreddit": post.Subreddit,
						"title":     post.Title,
						"selftext":  post.Selftext,
						"author":    post.Author,
						"thumbnail": post.Thumbnail,
						"url":       post.URL,
						"permalink": post.Permalink,
						"slug":      post.Slug,
						"seoTitle":  post.SEOTitle,
						"seoDesc":   post.SEODesc,
						"ourComments": []models.Comment{},
						"ourLikes":    []string{},
						"topComments": []models.RedditComment{},
						"fetchedAt":   post.FetchedAt,
					},
				}
				_, err := coll.UpdateOne(ctx, bson.M{"redditId": p.ID}, update, opts)
				if err != nil {
					log.Printf("[Reddit] upsert error %s: %v", p.ID, err)
				}
			}

			// Be polite to Reddit's API
			time.Sleep(1500 * time.Millisecond)
		}
	}
	log.Println("[Reddit] reddit_posts collection updated")
}

// FetchRedditPostComments fetches top comments for a Reddit post and caches them.
func FetchRedditPostComments(ctx context.Context, subreddit, redditID string) ([]models.RedditComment, error) {
	client := &http.Client{Timeout: 8 * time.Second}
	url := fmt.Sprintf("https://www.reddit.com/r/%s/comments/%s.json?limit=10&depth=1", subreddit, redditID)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "windows:seeqme.backend:v1.0 (by /u/seeqme)")
	req.Header.Set("Accept", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		snippet := strings.TrimSpace(string(body))
		if len(snippet) > 280 {
			snippet = snippet[:280]
		}
		return nil, fmt.Errorf("reddit comments request failed: %d %s (%s)", resp.StatusCode, resp.Status, snippet)
	}

	var cr redditCommentsResponse
	if err := json.Unmarshal(body, &cr); err != nil || len(cr) < 2 {
		return nil, fmt.Errorf("failed to parse comments")
	}

	var comments []models.RedditComment
	for _, ch := range cr[1].Data.Children {
		if ch.Kind != "t1" || ch.Data.Author == "" || ch.Data.Body == "[deleted]" {
			continue
		}
		comments = append(comments, models.RedditComment{
			ID:     ch.Data.ID,
			Author: ch.Data.Author,
			Body:   ch.Data.Body,
			Score:  ch.Data.Score,
		})
		if len(comments) >= 5 {
			break
		}
	}
	return comments, nil
}

// TrendingWorker periodically refreshes the trending collection using providers
type TrendingWorker struct {
	Providers    []TrendingProvider
	Interval     time.Duration
	Geo          string
	RedditFetcher *RedditProvider
}

func NewTrendingWorker(providers []TrendingProvider, interval time.Duration, geo string) *TrendingWorker {
	return &TrendingWorker{
		Providers:    providers,
		Interval:     interval,
		Geo:          geo,
		RedditFetcher: NewRedditProvider(),
	}
}

func (w *TrendingWorker) Start(ctx context.Context) {
	ticker := time.NewTicker(w.Interval)
	defer ticker.Stop()

	// Initial run
	w.updateOnce(ctx)
	w.RedditFetcher.FetchAndStoreRedditPosts(ctx)

	postTicker := time.NewTicker(30 * time.Minute)
	defer postTicker.Stop()

	for {
		select {
		case <-ticker.C:
			w.updateOnce(ctx)
		case <-postTicker.C:
			w.RedditFetcher.FetchAndStoreRedditPosts(ctx)
		case <-ctx.Done():
			return
		}
	}
}

func (w *TrendingWorker) updateOnce(ctx context.Context) {
	db := database.Client.Database(database.DBName)
	combined := map[string]int{}

	for _, p := range w.Providers {
		items, err := p.FetchTrending(ctx, w.Geo)
		if err != nil {
			log.Printf("[Trending] provider error: %v", err)
			continue
		}
		for _, it := range items {
			combined[it.Tag] += it.Posts
		}
	}

	// Also count in-app post tags
	type postTag struct {
		Tag string `bson:"tag"`
	}
	cursor, err := db.Collection("posts").Find(ctx, bson.M{"tag": bson.M{"$ne": ""}},
		options.Find().SetProjection(bson.M{"tag": 1}))
	if err == nil {
		var tags []postTag
		cursor.All(ctx, &tags)
		for _, t := range tags {
			if t.Tag != "" {
				combined[strings.ToLower(t.Tag)] += 3
			}
		}
	}

	type kv struct{ k string; v int }
	var arr []kv
	for k, v := range combined {
		arr = append(arr, kv{k, v})
	}
	sort.Slice(arr, func(i, j int) bool { return arr[i].v > arr[j].v })

	var toInsert []interface{}
	for i := 0; i < len(arr) && i < 15; i++ {
		toInsert = append(toInsert, models.TrendingItem{
			ID:    primitive.NewObjectID(),
			Tag:   arr[i].k,
			Posts: arr[i].v,
		})
	}

	if len(toInsert) == 0 {
		log.Println("[Trending] no items fetched")
		return
	}

	ctx2, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	coll := db.Collection("trending")
	if err := coll.Drop(ctx2); err != nil {
		log.Printf("[Trending] drop collection error: %v", err)
	}
	if _, err := coll.InsertMany(ctx2, toInsert); err != nil {
		log.Printf("[Trending] insert error: %v", err)
		return
	}
	log.Printf("[Trending] updated %d trending tags", len(toInsert))
}
