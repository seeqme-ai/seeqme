package database

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"

	"seeqmeai/backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Professional mock user profiles
var mockUserProfiles = []struct {
	email    string
	fullName string
	role     string
	location string
	avatar   string
	country  string
	niche    string
}{
	{"sarah.chen@seeqme.io", "Sarah Chen", "Principal Design Engineer", "Singapore", "#8b5cf6", "Singapore", "Design"},
	{"marcus.thorne@seeqme.io", "Marcus Thorne", "Product Lead", "London", "#0ea5e9", "UK", "Product"},
	{"elena.rodriguez@seeqme.io", "Elena Rodriguez", "AI Research Lead", "Madrid", "#14b8a6", "Spain", "Engineering"},
	{"david.okoro@seeqme.io", "David Okoro", "Venture Partner", "Lagos", "#f59e0b", "Nigeria", "Startup"},
	{"alex.kim@seeqme.io", "Alex Kim", "Backend Architect", "Seoul", "#ec4899", "South Korea", "Engineering"},
	{"priya.desai@seeqme.io", "Priya Desai", "Data Science Lead", "Bangalore", "#06b6d4", "India", "Data"},
	{"james.weber@seeqme.io", "James Weber", "Founding Engineer", "Berlin", "#10b981", "Germany", "Engineering"},
	{"zainab.ahmed@seeqme.io", "Zainab Ahmed", "Growth Strategist", "Dubai", "#f97316", "UAE", "Growth"},
	{"lucas.santos@seeqme.io", "Lucas Santos", "Full-stack Developer", "São Paulo", "#8b5cf6", "Brazil", "Engineering"},
	{"michelle.wang@seeqme.io", "Michelle Wang", "Product Designer", "Toronto", "#0ea5e9", "Canada", "Design"},
}

// Realistic post content templates by niche
var postTemplates = map[string][]string{
	"Design": {
		"Just finished refactoring our design system's token architecture. Moving from static variables to a multi-tiered semantic system has reduced our UI debt by nearly 40%. The key was establishing a 'base -> semantic -> component' flow that designers actually enjoy using in Figma. 🎨",
		"Spent the last week diving into accessibility standards for our new component library. WCAG 2.1 AA compliance isn't a feature—it's the bare minimum. Proper contrast ratios and keyboard navigation should be baked in from day one.",
		"The best design systems aren't about having the most components. They're about having the most *intentional* constraints. Less freedom = more consistency. More consistency = faster shipping.",
		"Working on a full redesign of our analytics dashboard. Moving from table-heavy to visual-first. The data speaks louder when you actually let it breathe. Performance metrics 📊",
		"Design critique this morning surfaced an interesting debate: should we optimize for pixel perfection or user outcomes? The answer is embarrassingly obvious in retrospect.",
	},
	"Product": {
		"The future of networking isn't about having 500+ connections; it's about the density of your professional cluster. We're seeing that users with smaller, high-similarity meshes are 3x more likely to secure high-value partnerships. Quality > Quantity.",
		"Growth metrics update: We've reached 10k nodes in the Lagos cluster alone. Professional similarity mapping is reducing cold-outreach friction by 60%. 🚀",
		"Most PMs ignore 'Internal Velocity' as a metric. If your engineers are fighting the codebase, they aren't fighting for the user. Fix the pipes first. 🛠️",
		"Reviewing our retention curves and realizing that the magic happens in weeks 3-5. If a user hasn't had a meaningful professional interaction by then, they churn. Everything flows from that insight.",
		"The best product insights don't come from dashboards—they come from sitting in user interviews and feeling the friction. Numbers confirm hypotheses. Conversations generate them.",
	},
	"Engineering": {
		"Agentic workflows are completely shifting how we think about IDEs. We're no longer just 'autocompleting' code; we're collaborating with agents that understand the broader architectural context. 🤖",
		"The transition from SVG to Canvas for our 1,200-node mesh visualization was a game changer. Framer Motion is still handling the UI micro-interactions beautifully. Performance is now our bottleneck.",
		"Spent 3 days debugging a race condition in our real-time sync layer. Turned out we were using the wrong comparison operator in our timestamp validation. Always test edge cases.",
		"TypeScript strict mode caught a bug that would've shipped to production. Worth every byte of type definitions. If you're not using strict mode, you're leaving money on the table.",
		"Building a feature that works at scale is 10% inspiration and 90% database optimization. We just shaved 40ms off our feed load time by rethinking our aggregation pipeline.",
	},
	"Startup": {
		"Just finalized a seed round for a SeeqMe cluster in the fintech space. The networking density here is 3x higher than traditional platforms. Looking forward to seeing how this ecosystem compounds. 📈",
		"The tech ecosystem in West Africa is maturing rapidly. We're seeing a shift from simple consumer-facing apps to deep infrastructure solutions in logistics and fintech. The resilience is incredible.",
		"Raising capital is 20% pitch quality and 80% relationships. The best investors are already in your network. Build authentically, and the rest follows.",
		"First user interviews for our new B2B product. The pain point is real. Now the question is: is it *our* problem to solve? Not everything worth solving is worth our time to solve.",
		"Thinking about the 10-year vision for SeeqMe. The mesh isn't just a social network—it's infrastructure for the knowledge economy. Everything else is execution.",
	},
	"Data": {
		"We're now tracking 50+ signals in our similarity algorithm. The model is more accurate but the interpretation is becoming opaque. Explainability is becoming as important as accuracy.",
		"SQL is still the most underrated tool in a data professional's arsenal. I just solved a 3-day aggregation problem with a single query optimization. Raw power.",
		"Building a real-time analytics pipeline with Kafka and ClickHouse. The throughput is phenomenal. Latency dropped from 5s to 200ms. Data-driven decisions now mean something.",
		"Anomaly detection in user behavior helped us catch a bot network before it inflated our metrics. Good data hygiene is defensive and offensive at the same time.",
		"ETL is unsexy but it's where 80% of data quality issues live. Garbage in, garbage out. Invest in your pipelines before you invest in your dashboards.",
	},
	"Growth": {
		"We've doubled our viral coefficient by focusing on organic referrals instead of paid acquisition. Word-of-mouth from professionals is the strongest channel we have.",
		"Email open rates spiked 35% after we started personalizing subject lines based on user niche. Relevance matters more than frequency.",
		"Testing a new onboarding flow. Early results show a 45% improvement in conversion to first meaningful interaction. Small iterations compound.",
		"Analyzing our churn cohorts revealed that the key retention lever is 'first meaningful professional interaction'. Everything we build now optimizes for that moment.",
		"The best growth hack is a product that people actually want. Every attempt to game the system ends in diminishing returns. Build value first, scale second.",
	},
}

// Realistic comments for cross-user interaction
var commentTemplates = []string{
	"This is spot on. We're seeing the same pattern in our data.",
	"Great insight. The nuance here is often missed.",
	"This resonates. Have you considered the [adjacent angle]?",
	"Couldn't agree more. The execution complexity is usually underestimated though.",
	"This is the real differentiator. Most people miss it.",
	"Love this perspective. Would be curious to hear how you'd solve [challenge].",
	"The data backs this up. We measured it and got similar results.",
	"This is a timely reminder. Easy to forget when you're in the weeds.",
	"Interesting take. What's your timeline on this?",
	"This deserves more attention. Sharing with the team.",
}

func generateSlug(author string, content string, index int) string {
	// Create URL-friendly slug from author name and content
	words := strings.Split(author, " ")
	slug := strings.ToLower(strings.Join(words, "-"))

	// Add first few words of content
	contentWords := strings.Fields(content)
	for i := 0; i < 2 && i < len(contentWords); i++ {
		w := strings.ToLower(strings.TrimSuffix(strings.TrimSuffix(contentWords[i], ","), "."))
		if len(w) > 0 && !strings.Contains("the,a,an,is,are,was,were", w) {
			slug += "-" + w
		}
	}

	// Add index and timestamp for uniqueness
	slug += fmt.Sprintf("-%d-%d", index, time.Now().UnixNano()%10000)
	return slug
}

func SeedSocialData() {
	db := Client.Database(DBName)

	// Check if mock data already seeded
	usersCount, _ := db.Collection("users").CountDocuments(context.Background(), bson.M{"isMock": true})
	if usersCount >= 10 {
		log.Println("[Seed] Mock data already seeded. Skipping.")
		return
	}

	log.Println("[Seed] Starting comprehensive mock data generation...")

	// 1. Create 10 Mock Users
	var mockUserIDs []primitive.ObjectID
	var mockUsersToInsert []interface{}

	for _, profile := range mockUserProfiles {
		userID := primitive.NewObjectID()
		mockUserIDs = append(mockUserIDs, userID)

		user := models.User{
			ID:           userID,
			Email:        profile.email,
			FullName:     profile.fullName,
			AvatarURL:    profile.avatar,
			Country:      profile.country,
			IsMock:       true,
			IsActive:     true,
			IsVerified:   true,
			AuthProvider: "local",
			CreatedAt:    time.Now().Add(-time.Duration(rand.Intn(60)+30) * 24 * time.Hour),
		}
		mockUsersToInsert = append(mockUsersToInsert, user)
	}

	_, err := db.Collection("users").InsertMany(context.Background(), mockUsersToInsert)
	if err != nil {
		log.Printf("[Seed] Error inserting mock users: %v", err)
		return
	}
	log.Printf("[Seed] Created 10 mock users")

	// 2. Create Social Nodes for Mesh
	var nodesToInsert []interface{}
	for i, profile := range mockUserProfiles {
		node := models.SocialNode{
			ID:         mockUserIDs[i].Hex(),
			UserID:     mockUserIDs[i].Hex(),
			Name:       profile.fullName,
			Role:       profile.role,
			Similarity: 70 + rand.Intn(25),
			Avatar:     profile.avatar,
			Group:      (i % 3) + 1,
			Skills:     getSkillsForNiche(profile.niche),
		}
		nodesToInsert = append(nodesToInsert, node)
	}

	db.Collection("social_nodes").InsertMany(context.Background(), nodesToInsert)
	log.Printf("[Seed] Created 10 social nodes")

	// 3. Create 500 Posts (50 per user)
	var postsToInsert []interface{}
	var postsByUserID = make(map[primitive.ObjectID][]models.Post)

	for userIdx, profile := range mockUserProfiles {
		userID := mockUserIDs[userIdx]
		niche := profile.niche
		templates := postTemplates[niche]

		for postIdx := 0; postIdx < 50; postIdx++ {
			// Realistic time distribution - spread across last 60 days
			hoursAgo := rand.Intn(60*24) + rand.Intn(12)
			createdAt := time.Now().Add(-time.Duration(hoursAgo) * time.Hour)

			// Select content from templates
			content := templates[rand.Intn(len(templates))]

			// Realistic likes distribution
			likes := rand.Intn(200) + 5

			// Generate slug
			slug := generateSlug(profile.fullName, content, postIdx)

			post := models.Post{
				ID:         primitive.NewObjectID(),
				AuthorID:   userID,
				Author:     profile.fullName,
				Role:       profile.role,
				Location:   profile.location,
				Avatar:     profile.avatar,
				Similarity: 70 + rand.Intn(25),
				Content:    content,
				Tag:        niche,
				Likes:      likes,
				Reposts:    likes / 10,
				IsMock:     true,
				Slug:       slug,
				SEOTitle:   profile.fullName + " on SeeqMe Mesh",
				SEODesc:    content[:min(len(content), 160)],
				Timestamp:  formatTimeAgo(createdAt),
				CreatedAt:  createdAt,
				SavedBy:    []string{},
				Comments:   []models.Comment{},
			}

			postsByUserID[userID] = append(postsByUserID[userID], post)
			postsToInsert = append(postsToInsert, post)
		}
	}

	_, err = db.Collection("posts").InsertMany(context.Background(), postsToInsert)
	if err != nil {
		log.Printf("[Seed] Error inserting posts: %v", err)
		return
	}
	log.Printf("[Seed] Created 500 posts (50 per user)")

	// 4. Add realistic comments to posts (cross-user engagement)
	commentCount := 0
	for userIdx, userID := range mockUserIDs {
		posts := postsByUserID[userID]

		for _, post := range posts {
			// 60% of posts have comments
			if rand.Float32() > 0.4 {
				// 1-5 comments per post
				numComments := rand.Intn(4) + 1

				for c := 0; c < numComments; c++ {
					// Random commenter from other users
					commenterIdx := rand.Intn(len(mockUserIDs))
					if commenterIdx == userIdx {
						commenterIdx = (commenterIdx + 1) % len(mockUserIDs)
					}

					commenterID := mockUserIDs[commenterIdx]
					commenterProfile := mockUserProfiles[commenterIdx]

					comment := models.Comment{
						ID:        primitive.NewObjectID(),
						PostID:    post.ID,
						AuthorID:  commenterID,
						Author:    commenterProfile.fullName,
						Avatar:    commenterProfile.avatar,
						Content:   commentTemplates[rand.Intn(len(commentTemplates))],
						CreatedAt: post.CreatedAt.Add(time.Duration(rand.Intn(48)+1) * time.Hour),
					}

					// Update post with comment
					db.Collection("posts").UpdateOne(
						context.Background(),
						bson.M{"_id": post.ID},
						bson.M{"$push": bson.M{"comments": comment}},
					)

					commentCount++
				}
			}
		}
	}
	log.Printf("[Seed] Added %d comments to posts", commentCount)

	// 5. Seed Trending Tags
	trendingCount, _ := db.Collection("trending").CountDocuments(context.Background(), bson.M{})
	if trendingCount == 0 {
		trending := []interface{}{
			models.TrendingItem{ID: primitive.NewObjectID(), Tag: "AI", Posts: 1204},
			models.TrendingItem{ID: primitive.NewObjectID(), Tag: "Engineering", Posts: 950},
			models.TrendingItem{ID: primitive.NewObjectID(), Tag: "Product", Posts: 830},
			models.TrendingItem{ID: primitive.NewObjectID(), Tag: "SeeqMe", Posts: 720},
			models.TrendingItem{ID: primitive.NewObjectID(), Tag: "Design", Posts: 580},
		}
		db.Collection("trending").InsertMany(context.Background(), trending)
		log.Println("[Seed] Trending data seeded")
	}

	// 6. Seed Suggested Users
	suggestedCount, _ := db.Collection("suggested_users").CountDocuments(context.Background(), bson.M{})
	if suggestedCount == 0 {
		suggested := []interface{}{
			models.SuggestedUser{ID: primitive.NewObjectID(), Name: "Kemi Lawal", Role: "Data Scientist", Location: "Berlin, DE", Avatar: "#0ea5e9", Similarity: 78},
			models.SuggestedUser{ID: primitive.NewObjectID(), Name: "Aisha Musa", Role: "Backend Engineer", Location: "Nairobi, KE", Avatar: "#8b5cf6", Similarity: 76},
		}
		db.Collection("suggested_users").InsertMany(context.Background(), suggested)
		log.Println("[Seed] Suggested users seeded")
	}

	log.Println("[Seed] ✅ Comprehensive mock data seeding completed! 10 users, 500 posts, realistic comments and engagement")
}

// Helper functions
func getSkillsForNiche(niche string) []string {
	skillsByNiche := map[string][]string{
		"Design":      {"Figma", "UI/UX", "Design Systems", "Prototyping", "Accessibility"},
		"Product":     {"Product Strategy", "Analytics", "User Research", "Roadmapping", "Metrics"},
		"Engineering": {"Go", "TypeScript", "System Design", "Performance", "Databases"},
		"Startup":     {"Fundraising", "Business Strategy", "Market Analysis", "Networking", "Operations"},
		"Data":        {"SQL", "Python", "Analytics", "ML", "Data Engineering"},
		"Growth":      {"Growth Strategy", "Analytics", "User Acquisition", "Retention", "Viral Loops"},
	}

	skills := skillsByNiche[niche]
	if skills == nil {
		skills = []string{"Networking", "Collaboration", "Innovation"}
	}

	return skills
}

func formatTimeAgo(t time.Time) string {
	duration := time.Since(t)
	hours := int(duration.Hours())

	if hours < 1 {
		return "Just now"
	} else if hours < 24 {
		return fmt.Sprintf("%dh ago", hours)
	} else if hours < 168 {
		return fmt.Sprintf("%dd ago", hours/24)
	} else {
		return fmt.Sprintf("%dw ago", hours/168)
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
