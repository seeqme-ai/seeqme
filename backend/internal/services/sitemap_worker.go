package services

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
)

type SitemapWorker struct {
	BaseURL string
}

func NewSitemapWorker(baseURL string) *SitemapWorker {
	return &SitemapWorker{BaseURL: baseURL}
}

func (w *SitemapWorker) Start(ctx context.Context) {
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	// Initial run
	w.UpdateSitemap()

	for {
		select {
		case <-ticker.C:
			w.UpdateSitemap()
		case <-ctx.Done():
			return
		}
	}
}

func (w *SitemapWorker) UpdateSitemap() {
	log.Println("[Sitemap] Starting daily update...")
	ctx := context.Background()

	var posts []models.Post
	cursor, err := database.Client.Database(database.DBName).Collection("posts").Find(ctx, bson.M{"isMock": bson.M{"$ne": true}})
	if err != nil {
		log.Printf("[Sitemap] Error fetching posts: %v", err)
		return
	}
	cursor.All(context.Background(), &posts)

	var redditPosts []models.RedditPost
	rcursor, rerr := database.Client.Database(database.DBName).Collection("reddit_posts").Find(ctx, bson.M{})
	if rerr == nil {
		rcursor.All(ctx, &redditPosts)
	}

	var portfolios []models.Portfolio
	cursor, _ = database.Client.Database(database.DBName).Collection("portfolios").Find(context.Background(), bson.M{"isPublished": true})
	cursor.All(context.Background(), &portfolios)

	sitemapContent := `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url><loc>` + w.BaseURL + `</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
	<url><loc>` + w.BaseURL + `/templates</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
	<url><loc>` + w.BaseURL + `/plans</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
	<url><loc>` + w.BaseURL + `/about</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
	<url><loc>` + w.BaseURL + `/contact</loc><changefreq>yearly</changefreq><priority>0.5</priority></url>
	<url><loc>` + w.BaseURL + `/app/feed</loc><changefreq>always</changefreq><priority>0.9</priority></url>
	<url><loc>` + w.BaseURL + `/app/mesh</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>
	<url><loc>` + w.BaseURL + `/privacy-policy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
	<url><loc>` + w.BaseURL + `/terms-of-service</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
	<url><loc>` + w.BaseURL + `/monetary-policy</loc><changefreq>yearly</changefreq><priority>0.2</priority></url>`

	// Add posts
	for _, p := range posts {
		if strings.TrimSpace(p.Slug) == "" {
			continue
		}
		sitemapContent += fmt.Sprintf("\n\t<url><loc>%s/app/feed/post/%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq></url>",
			w.BaseURL, p.Slug, p.CreatedAt.Format("2006-01-02"))
	}

	// Add Reddit post pages
	for _, rp := range redditPosts {
		if strings.TrimSpace(rp.Slug) == "" {
			continue
		}
		sitemapContent += fmt.Sprintf("\n\t<url><loc>%s/app/feed/reddit/%s</loc><lastmod>%s</lastmod><changefreq>daily</changefreq></url>",
			w.BaseURL, rp.Slug, rp.FetchedAt.Format("2006-01-02"))
	}

	// Add portfolios
	baseDomain := "seeqme.com"
	if u, err := url.Parse(w.BaseURL); err == nil {
		hostParts := strings.Split(u.Host, ":") // Remove port if present
		parts := strings.Split(hostParts[0], ".")
		if len(parts) >= 2 {
			baseDomain = strings.Join(parts[len(parts)-2:], ".")
		}
	}

	for _, p := range portfolios {
		url := w.BaseURL
		if p.CustomDomain != "" {
			url = "https://" + p.CustomDomain
		} else if p.Subdomain != "" {
			url = fmt.Sprintf("https://%s.%s", p.Subdomain, baseDomain)
		}
		sitemapContent += fmt.Sprintf("\n\t<url><loc>%s</loc><lastmod>%s</lastmod></url>",
			url, p.UpdatedAt.Format("2006-01-02"))
	}

	sitemapContent += "\n</urlset>"

	// Write to public directory
	distPath := "./dist/sitemap.xml"
	os.MkdirAll(filepath.Dir(distPath), 0755)
	err = os.WriteFile(distPath, []byte(sitemapContent), 0644)
	if err != nil {
		log.Printf("[Sitemap] Error writing sitemap: %v", err)
	} else {
		log.Println("[Sitemap] Sitemap updated successfully")
	}
}
