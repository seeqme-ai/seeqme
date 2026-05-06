package services

import (
	"context"
	"log"
	"math/rand"
	"regexp"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
)

// mockAuthor defines a seed persona.
type mockAuthor struct {
	Email    string
	FullName string
	Role     string
	Location string
	Avatar   string
	Color    string // used as avatar background when no image URL
}

var mockAuthors = []mockAuthor{
	{
		Email:    "sarah.eng@mesh.io",
		FullName: "Sarah Chen",
		Role:     "Principal Design Engineer",
		Location: "Singapore",
		Avatar:   "#8b5cf6",
	},
	{
		Email:    "marcus.prod@mesh.io",
		FullName: "Marcus Thorne",
		Role:     "Head of Product",
		Location: "London",
		Avatar:   "#0ea5e9",
	},
	{
		Email:    "elena.ai@mesh.io",
		FullName: "Elena Rodriguez",
		Role:     "AI Research Lead",
		Location: "Madrid",
		Avatar:   "#14b8a6",
	},
	{
		Email:    "david.vc@mesh.io",
		FullName: "David Okoro",
		Role:     "Venture Partner",
		Location: "Lagos",
		Avatar:   "#f59e0b",
	},
	{
		Email:    "aisha.be@mesh.io",
		FullName: "Aisha Mwangi",
		Role:     "Senior Backend Engineer",
		Location: "Nairobi",
		Avatar:   "#ec4899",
	},
}

// contentPool is the curated library of seed posts.
// New entries are appended here when expanding the pool; existing ones are never re-posted.
var contentPool = []struct {
	AuthorIdx  int
	Content    string
	Tag        string
	BaseLikes  int
	BaseReposts int
	Comments   []struct{ AuthorIdx int; Text string }
}{
	{
		0,
		"Just finished refactoring our design system's token architecture. Moving from static variables to a multi-tiered semantic system reduced UI debt by nearly 40%. The key was establishing a 'base → semantic → component' flow that designers actually enjoy using in Figma.\n\nHas anyone experimented with automated token syncing between Figma and Style Dictionary?",
		"Design",
		124, 12,
		[]struct{ AuthorIdx int; Text string }{
			{1, "This is the token architecture post I needed today. We're still on static variables and the pain is real."},
			{2, "How long did the migration take? We've been putting this off for two sprints."},
		},
	},
	{
		1,
		"The future of networking isn't about having 500+ connections — it's about the density of your professional cluster. We're seeing that users with smaller, high-similarity meshes are 3x more likely to secure high-value partnerships than those with broad, generic networks.\n\nQuality over quantity is finally being mathematically enforced.",
		"Product",
		245, 56,
		[]struct{ AuthorIdx int; Text string }{
			{3, "This aligns with everything I'm seeing in early-stage deal flow. The warm intro from a close node beats 10 cold ones."},
			{0, "The graph density metric is something I want to visualise on the Mesh page. Are you publishing this research?"},
		},
	},
	{
		2,
		"Agentic workflows are completely shifting how we think about IDEs. We're no longer just 'autocompleting' code — we're collaborating with agents that understand the broader architectural context.\n\nThe next step is better state management for these agents so they can handle multi-file refactors without losing the mental model of the system.",
		"Engineering",
		89, 8,
		[]struct{ AuthorIdx int; Text string }{
			{4, "The context window is still the bottleneck. Until agents can hold a whole repo in memory, multi-file refactors will stay fragile."},
			{1, "Which agent are you using for this? Cursor, Copilot, or something custom?"},
		},
	},
	{
		3,
		"The tech ecosystem in West Africa is maturing rapidly. We're seeing a shift from consumer-facing apps to deep infrastructure solutions in logistics and fintech. The resilience shown by founders in this macro environment is incredible.\n\nLooking for early-stage teams building the 'rails' for the next decade.",
		"Startup",
		167, 31,
		[]struct{ AuthorIdx int; Text string }{
			{2, "The infrastructure layer is where the real moats are built. Agree completely."},
			{4, "What sectors are you most excited about right now?"},
		},
	},
	{
		4,
		"Hot take: the best engineering teams I've worked on spent 20% of each sprint on internal tooling. Not because it was required — because they understood that developer experience is a product metric.\n\nSlower to ship, faster to scale. The maths eventually works out.",
		"Opinion",
		203, 44,
		[]struct{ AuthorIdx int; Text string }{
			{0, "We introduced a 'DX Friday' — last Friday of the month is entirely internal tooling. Best decision this quarter."},
			{1, "Have you ever pitched this to a CPO? I'd love a template for that conversation."},
		},
	},
	{
		1,
		"Most PMs conflate 'user feedback' with 'feature requests'. Real product insight comes from watching users fail, not from listening to what they ask for.\n\nThe gap between what people say and what they do is where your roadmap lives.",
		"Product",
		311, 67,
		[]struct{ AuthorIdx int; Text string }{
			{2, "Jobs-to-be-done framing helps here. The 'hire/fire' lens cuts through the noise."},
			{3, "We switched to Maze for unmoderated testing last quarter. Night and day difference in signal quality."},
		},
	},
	{
		0,
		"We migrated our 1,200-node mesh visualisation from SVG to Canvas. Render time dropped from 340ms to 22ms at full load.\n\nFramer Motion still handles all micro-interactions outside the canvas. The split feels clean — declarative for UI chrome, imperative for the performance-critical viewport.",
		"Engineering",
		98, 11,
		[]struct{ AuthorIdx int; Text string }{
			{4, "Did you use OffscreenCanvas for the worker thread? That's where we saw the biggest jump."},
		},
	},
	{
		3,
		"Three things early-stage founders consistently underestimate:\n\n1. How long fundraising actually takes (add 3 months to whatever you think)\n2. The cost of a bad early hire (not just salary — team morale, re-hiring time, momentum)\n3. How much your second product decision matters more than your first\n\nThe first one gets all the press. The second and third one kill most companies.",
		"Startup",
		412, 88,
		[]struct{ AuthorIdx int; Text string }{
			{1, "The hiring point is criminally underrated. One wrong senior hire in year one can cost you 18 months."},
			{2, "The fundraising timeline is so real. We planned for 6 weeks and it took 5 months."},
		},
	},
	{
		2,
		"I've been running a quiet experiment: giving LLMs access to our internal Notion docs and asking them to answer engineering questions before I do.\n\nFor 70% of questions, the LLM answer was as good or better than mine. For the other 30%, it was confidently wrong in subtle ways that would cost us days.\n\nThe interface layer between humans and AI agents is the most important product problem of this decade.",
		"Engineering",
		276, 52,
		[]struct{ AuthorIdx int; Text string }{
			{0, "The 'confidently wrong' failure mode is the one that scares me most. How do you build trust signals into the interface?"},
			{4, "This is why eval-driven development matters as much as test-driven. You need to measure model quality continuously."},
		},
	},
	{
		4,
		"Unpopular opinion: microservices are overkill for 95% of teams under 50 engineers. The coordination overhead, distributed tracing tax, and deployment complexity compound faster than the scalability benefits materialise.\n\nA well-structured monolith with clean module boundaries gets you further, faster. Split when you have a real reason — not because the architecture diagram looks impressive.",
		"Engineering",
		389, 79,
		[]struct{ AuthorIdx int; Text string }{
			{1, "The 'because Netflix does it' reasoning has caused so much unnecessary complexity in startups."},
			{3, "We did the reverse journey last year — merged 11 services back into 3. Developer happiness went up, incident rate went down."},
		},
	},
	{
		1,
		"The best product decisions I've made weren't about adding features — they were about saying no to good ideas at the wrong time.\n\nOpportunity cost is invisible in roadmaps. Every 'yes' is a hidden 'no' to three other things your team could have shipped.",
		"Opinion",
		194, 41,
		[]struct{ AuthorIdx int; Text string }{
			{0, "We started including 'what we're NOT building this quarter' in our planning docs. Changed the entire conversation."},
		},
	},
	{
		3,
		"Seed-stage founders: stop optimising for valuation in your first round. Optimise for the quality of your lead investor.\n\nA great investor at a lower valuation will save you more money — in introductions, mis-hire prevention, and emotional capital — than you'll ever gain from squeezing an extra 10% on your cap table.",
		"Startup",
		267, 55,
		[]struct{ AuthorIdx int; Text string }{
			{2, "Seconded. Reference check your investors as hard as they reference check you."},
			{4, "The 'smart money vs. dumb money' framework should be table stakes by now. Still surprises me how many founders chase the valuation."},
		},
	},
}

var slugRx = regexp.MustCompile(`[^a-z0-9]+`)

func buildMockSlug(author, content string) string {
	words := strings.Fields(strings.ToLower(content))
	if len(words) > 6 {
		words = words[:6]
	}
	slug := slugRx.ReplaceAllString(strings.Join(words, "-"), "-")
	slug = strings.Trim(slug, "-")
	return slug + "-" + primitive.NewObjectID().Hex()[:7]
}

// MockContentWorker seeds initial content and posts new mock content periodically.
type MockContentWorker struct {
	Interval time.Duration // how often to post new content
}

func NewMockContentWorker(interval time.Duration) *MockContentWorker {
	return &MockContentWorker{Interval: interval}
}

func (w *MockContentWorker) Start(ctx context.Context) {
	// Always ensure mock users exist on startup.
	authorIDs := w.ensureMockUsers(ctx)

	// Seed all initial content once if the posts collection is sparse.
	w.seedInitialContent(ctx, authorIDs)

	// Then post new content periodically from the pool.
	ticker := time.NewTicker(w.Interval)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			w.postNextScheduled(ctx, authorIDs)
		case <-ctx.Done():
			return
		}
	}
}

// ensureMockUsers upserts mock author records and returns their DB IDs.
func (w *MockContentWorker) ensureMockUsers(ctx context.Context) []primitive.ObjectID {
	db := database.Client.Database(database.DBName)
	ids := make([]primitive.ObjectID, len(mockAuthors))

	for i, a := range mockAuthors {
		var existing models.User
		err := db.Collection("users").FindOne(ctx, bson.M{"email": a.Email}).Decode(&existing)
		if err == nil {
			ids[i] = existing.ID
			continue
		}
		newID := primitive.NewObjectID()
		u := models.User{
			ID:           newID,
			Email:        a.Email,
			FullName:     a.FullName,
			AvatarURL:    a.Avatar,
			Country:      a.Location,
			Roles:        []string{"user"},
			IsMock:       true,
			AuthProvider: "local",
			CreatedAt:    time.Now(),
		}
		db.Collection("users").UpdateOne(ctx,
			bson.M{"email": a.Email},
			bson.M{"$setOnInsert": u},
			options.Update().SetUpsert(true),
		)
		ids[i] = newID
	}
	return ids
}

// seedInitialContent posts every item in contentPool if the post count is below threshold.
func (w *MockContentWorker) seedInitialContent(ctx context.Context, authorIDs []primitive.ObjectID) {
	db := database.Client.Database(database.DBName)
	count, _ := db.Collection("posts").CountDocuments(ctx, bson.M{"isMock": true})
	if count >= int64(len(contentPool)) {
		// Already seeded; ensure slugs exist on any older records that are missing them.
		w.backfillSlugs(ctx)
		return
	}

	log.Println("[MockContent] Seeding initial content pool...")

	// Spread initial posts across the past 7 days so they feel organic.
	spread := 7 * 24 * time.Hour
	step := spread / time.Duration(len(contentPool))

	for idx, item := range contentPool {
		author := mockAuthors[item.AuthorIdx]
		authorID := authorIDs[item.AuthorIdx]
		postTime := time.Now().Add(-spread + time.Duration(idx)*step + time.Duration(rand.Intn(60))*time.Minute)

		slug := buildMockSlug(author.FullName, item.Content)
		seoDesc := item.Content
		if len(seoDesc) > 160 {
			seoDesc = seoDesc[:160]
		}

		postID := primitive.NewObjectID()
		var comments []models.Comment
		for ci, c := range item.Comments {
			commenter := mockAuthors[c.AuthorIdx]
			commenterID := authorIDs[c.AuthorIdx]
			comments = append(comments, models.Comment{
				ID:        primitive.NewObjectID(),
				PostID:    postID,
				AuthorID:  commenterID,
				Author:    commenter.FullName,
				Avatar:    commenter.Avatar,
				Content:   c.Text,
				CreatedAt: postTime.Add(time.Duration(ci+1) * 15 * time.Minute),
			})
		}
		if comments == nil {
			comments = []models.Comment{}
		}

		post := models.Post{
			ID:         postID,
			AuthorID:   authorID,
			Author:     author.FullName,
			Role:       author.Role,
			Location:   author.Location,
			Avatar:     author.Avatar,
			Similarity: 60 + rand.Intn(35),
			Content:    item.Content,
			Tag:        item.Tag,
			Likes:      item.BaseLikes,
			Reposts:    item.BaseReposts,
			Comments:   comments,
			SavedBy:    []string{},
			IsMock:     true,
			Slug:       slug,
			SEOTitle:   author.FullName + " on SeeqMe",
			SEODesc:    seoDesc,
			Timestamp:  "Just now",
			CreatedAt:  postTime,
		}

		// Upsert by content so re-seeding is idempotent.
		_, err := db.Collection("posts").UpdateOne(ctx,
			bson.M{"content": post.Content, "isMock": true},
			bson.M{"$setOnInsert": post},
			options.Update().SetUpsert(true),
		)
		if err != nil {
			log.Printf("[MockContent] seed error for post %d: %v", idx, err)
		}
	}
	log.Printf("[MockContent] Seeded %d posts.", len(contentPool))
}

// backfillSlugs patches any existing mock posts that are missing slugs.
func (w *MockContentWorker) backfillSlugs(ctx context.Context) {
	db := database.Client.Database(database.DBName)
	cursor, err := db.Collection("posts").Find(ctx, bson.M{"isMock": true, "$or": []bson.M{
		{"slug": ""},
		{"slug": bson.M{"$exists": false}},
	}})
	if err != nil {
		return
	}
	var posts []models.Post
	cursor.All(ctx, &posts)
	for _, p := range posts {
		slug := buildMockSlug(p.Author, p.Content)
		seoDesc := p.Content
		if len(seoDesc) > 160 {
			seoDesc = seoDesc[:160]
		}
		db.Collection("posts").UpdateOne(ctx,
			bson.M{"_id": p.ID},
			bson.M{"$set": bson.M{
				"slug":     slug,
				"seoTitle": p.Author + " on SeeqMe",
				"seoDesc":  seoDesc,
			}},
		)
	}
	if len(posts) > 0 {
		log.Printf("[MockContent] Backfilled slugs on %d legacy mock posts.", len(posts))
	}
}

// postNextScheduled picks one content item not yet posted in the last 24h and posts it.
func (w *MockContentWorker) postNextScheduled(ctx context.Context, authorIDs []primitive.ObjectID) {
	db := database.Client.Database(database.DBName)

	// Find the oldest mock post to determine which content index to post next.
	var existing []models.Post
	cursor, err := db.Collection("posts").Find(ctx,
		bson.M{"isMock": true},
		options.Find().SetProjection(bson.M{"content": 1}).SetSort(bson.M{"createdAt": 1}),
	)
	if err == nil {
		cursor.All(ctx, &existing)
	}

	existingContents := make(map[string]bool, len(existing))
	for _, p := range existing {
		existingContents[p.Content] = true
	}

	// Find a pool entry that hasn't been posted yet.
	var next *struct {
		AuthorIdx   int
		Content     string
		Tag         string
		BaseLikes   int
		BaseReposts int
		Comments    []struct{ AuthorIdx int; Text string }
	}
	for i := range contentPool {
		if !existingContents[contentPool[i].Content] {
			next = &contentPool[i]
			break
		}
	}

	if next == nil {
		// All pool items have been posted; nothing to schedule.
		return
	}

	author := mockAuthors[next.AuthorIdx]
	authorID := authorIDs[next.AuthorIdx]
	slug := buildMockSlug(author.FullName, next.Content)
	seoDesc := next.Content
	if len(seoDesc) > 160 {
		seoDesc = seoDesc[:160]
	}

	postID := primitive.NewObjectID()
	var comments []models.Comment
	for ci, c := range next.Comments {
		commenter := mockAuthors[c.AuthorIdx]
		commenterID := authorIDs[c.AuthorIdx]
		comments = append(comments, models.Comment{
			ID:        primitive.NewObjectID(),
			PostID:    postID,
			AuthorID:  commenterID,
			Author:    commenter.FullName,
			Avatar:    commenter.Avatar,
			Content:   c.Text,
			CreatedAt: time.Now().Add(time.Duration(ci+1) * 8 * time.Minute),
		})
	}
	if comments == nil {
		comments = []models.Comment{}
	}

	post := models.Post{
		ID:         postID,
		AuthorID:   authorID,
		Author:     author.FullName,
		Role:       author.Role,
		Location:   author.Location,
		Avatar:     author.Avatar,
		Similarity: 60 + rand.Intn(35),
		Content:    next.Content,
		Tag:        next.Tag,
		Likes:      next.BaseLikes,
		Reposts:    next.BaseReposts,
		Comments:   comments,
		SavedBy:    []string{},
		IsMock:     true,
		Slug:       slug,
		SEOTitle:   author.FullName + " on SeeqMe",
		SEODesc:    seoDesc,
		Timestamp:  "Just now",
		CreatedAt:  time.Now(),
	}

	if _, err := db.Collection("posts").InsertOne(ctx, post); err != nil {
		log.Printf("[MockContent] scheduled post error: %v", err)
		return
	}
	log.Printf("[MockContent] Scheduled post published: %s by %s", post.Slug, author.FullName)
}
