package database

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"seeqmeai/backend/internal/models"
)

func SeedSocialData() {
	db := Client.Database(DBName)

	// 1. Seed Mock Users (Engineered)
	usersCount, _ := db.Collection("users").CountDocuments(context.Background(), bson.M{"isMock": true})
	if usersCount == 0 {
		m1 := primitive.NewObjectID()
		m2 := primitive.NewObjectID()
		m3 := primitive.NewObjectID()
		
		mockUsers := []interface{}{
			models.User{
				ID:           m1,
				Email:        "ada.mock@seeqme.ai",
				FullName:     "Ada Okonkwo",
				AvatarURL:    "#8b5cf6",
				Country:      "Nigeria",
				IsMock:       true,
				IsActive:     true,
				IsVerified:   true,
				CreatedAt:    time.Now().Add(-100 * 24 * time.Hour),
			},
			models.User{
				ID:           m2,
				Email:        "tunde.mock@seeqme.ai",
				FullName:     "Tunde Kayode",
				AvatarURL:    "#0ea5e9",
				Country:      "Nigeria",
				IsMock:       true,
				IsActive:     true,
				IsVerified:   true,
				CreatedAt:    time.Now().Add(-120 * 24 * time.Hour),
			},
			models.User{
				ID:           m3,
				Email:        "chioma.mock@seeqme.ai",
				FullName:     "Chioma Ike",
				AvatarURL:    "#14b8a6",
				Country:      "Nigeria",
				IsMock:       true,
				IsActive:     true,
				IsVerified:   true,
				CreatedAt:    time.Now().Add(-80 * 24 * time.Hour),
			},
		}
		db.Collection("users").InsertMany(context.Background(), mockUsers)
		log.Println("[Seed] Mock users created")

		// 2. Seed Social Nodes (Mesh) linked to mock users
		nodes := []interface{}{
			models.SocialNode{ID: m1.Hex(), Name: "Ada Okonkwo", Role: "Senior Designer", Similarity: 89, Avatar: "#8b5cf6", Group: 1, Skills: []string{"Figma", "React", "UI/UX"}},
			models.SocialNode{ID: m2.Hex(), Name: "Tunde Kayode", Role: "Product Manager", Similarity: 74, Avatar: "#0ea5e9", Group: 2, Skills: []string{"Product", "SQL", "Strategy"}},
			models.SocialNode{ID: m3.Hex(), Name: "Chioma Ike", Role: "Frontend Dev", Similarity: 71, Avatar: "#14b8a6", Group: 1, Skills: []string{"Vue", "Tailwind", "D3.js"}},
		}
		db.Collection("social_nodes").InsertMany(context.Background(), nodes)
		log.Println("[Seed] Social nodes seeded")

		// 3. Seed Posts with Real Comments
		posts := []interface{}{
			models.Post{
				ID:        primitive.NewObjectID(),
				AuthorID:  m1,
				Author:    "Ada Okonkwo",
				Role:      "Senior Designer",
				Avatar:    "#8b5cf6",
				Content:   "Just published a deep dive into SeeqMe's organic mesh layout. We're using force-directed graphs to map professional similarity. It's not just a network, it's an ecosystem. 🌊 #ProductDesign #Mesh",
				Tag:       "Design",
				Link:      "https://seeqme.ai/blog/mesh-design",
				LinkPreview: &models.LinkPreview{
					URL:         "https://seeqme.ai/blog/mesh-design",
					Title:       "The Art of the Social Mesh",
					Description: "How we engineered a professional network that mimics biological systems.",
					Image:       "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070",
					SiteName:    "SeeqMe Engineering",
				},
				Likes:     142,
				Reposts:   24,
				IsMock:    true,
				Comments:  []models.Comment{
					{ID: primitive.NewObjectID(), Author: "Tunde Kayode", Avatar: "#0ea5e9", Content: "The performance on mobile is particularly impressive. Great work Ada!", CreatedAt: time.Now().Add(-1 * time.Hour)},
					{ID: primitive.NewObjectID(), Author: "Chioma Ike", Avatar: "#14b8a6", Content: "Love the sine-wave drift animations. Makes it feel alive.", CreatedAt: time.Now().Add(-30 * time.Minute)},
				},
				CreatedAt: time.Now().Add(-2 * time.Hour),
			},
			models.Post{
				ID:        primitive.NewObjectID(),
				AuthorID:  m2,
				Author:    "Tunde Kayode",
				Role:      "Product Manager",
				Avatar:    "#0ea5e9",
				Content:   "Growth metrics update: We've reached 10k nodes in the Lagos cluster alone. Professional similarity mapping is reducing cold-outreach friction by 60%. 🚀",
				Tag:       "Product",
				Likes:     85,
				Reposts:   12,
				IsMock:    true,
				Comments:  []models.Comment{
					{ID: primitive.NewObjectID(), Author: "Ada Okonkwo", Avatar: "#8b5cf6", Content: "60% is massive! The data doesn't lie.", CreatedAt: time.Now().Add(-4 * time.Hour)},
				},
				CreatedAt: time.Now().Add(-5 * time.Hour),
			},
		}
		db.Collection("posts").InsertMany(context.Background(), posts)
		log.Println("[Seed] Social posts with comments seeded")
	}

	// 4. Seed Trending
	trendingCount, _ := db.Collection("trending").CountDocuments(context.Background(), bson.M{})
	if trendingCount == 0 {
		trending := []interface{}{
			models.TrendingItem{ID: primitive.NewObjectID(), Tag: "Web3", Posts: 1204},
			models.TrendingItem{ID: primitive.NewObjectID(), Tag: "AI", Posts: 850},
			models.TrendingItem{ID: primitive.NewObjectID(), Tag: "SeeqMe", Posts: 430},
			models.TrendingItem{ID: primitive.NewObjectID(), Tag: "LagosTech", Posts: 215},
		}
		db.Collection("trending").InsertMany(context.Background(), trending)
		log.Println("[Seed] Trending data seeded")
	}

	// 5. Seed Suggested Users
	suggestedCount, _ := db.Collection("suggested_users").CountDocuments(context.Background(), bson.M{})
	if suggestedCount == 0 {
		suggested := []interface{}{
			models.SuggestedUser{ID: primitive.NewObjectID(), Name: "Kemi Lawal", Role: "Data Scientist", Location: "Berlin, DE", Avatar: "#0ea5e9", Similarity: 68},
			models.SuggestedUser{ID: primitive.NewObjectID(), Name: "Aisha Musa", Role: "Backend Engineer", Location: "Nairobi, KE", Avatar: "#8b5cf6", Similarity: 66},
		}
		db.Collection("suggested_users").InsertMany(context.Background(), suggested)
		log.Println("[Seed] Suggested users seeded")
	}
}
