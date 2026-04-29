package services

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"seeqmeai/backend/internal/config"
	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
	"seeqmeai/backend/pkg/resend"
)

type SocialEmailWorker struct {
	Resend *resend.Resend
	Config *config.Config
}

func NewSocialEmailWorker(cfg *config.Config) *SocialEmailWorker {
	return &SocialEmailWorker{
		Resend: resend.New(cfg),
		Config: cfg,
	}
}

func (w *SocialEmailWorker) Start(ctx context.Context) {
	// Run every day at a specific time (e.g., 9 AM)
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			w.ProcessTrendingBatch()
		case <-ctx.Done():
			return
		}
	}
}

func (w *SocialEmailWorker) ProcessTrendingBatch() {
	log.Println("[SocialEmail] Processing daily trending batch...")

	// 1. Get trending posts
	var trendingPosts []models.Post
	cursor, _ := database.Client.Database(database.DBName).Collection("posts").Find(
		context.Background(),
		bson.M{"likes": bson.M{"$gt": 5}}, // Example "trending" criteria
	)
	cursor.All(context.Background(), &trendingPosts)

	if len(trendingPosts) == 0 {
		log.Println("[SocialEmail] No trending posts found, skipping batch.")
		return
	}

	// 2. Fetch a batch of users (max 100 per day to stay within limit)
	// We use a "lastNotifiedAt" field to rotate through users
	
	filter := bson.M{
		"isMock": bson.M{"$ne": true},
		"$or": []bson.M{
			{"lastNotifiedAt": nil},
			{"lastNotifiedAt": bson.M{"$lt": time.Now().Add(-3 * 24 * time.Hour)}}, // Re-notify every 3 days max
		},
	}
	
	// Re-using database patterns
	opts := options.Find().SetLimit(100).SetSort(bson.M{"lastNotifiedAt": 1})
	cursor, err := database.Client.Database(database.DBName).Collection("users").Find(context.Background(), filter, opts)
	if err != nil {
		log.Printf("[SocialEmail] Error fetching users: %v", err)
		return
	}
	
	count := 0
	for cursor.Next(context.Background()) && count < 100 {
		var u models.User
		cursor.Decode(&u)
		
		// 3. Send email
		err := w.Resend.SendEmail(u.Email, "SeeqMe Mesh: What's Trending in Your Network", "trending_batch.html", map[string]interface{}{
			"FullName": u.FullName,
			"Posts":    trendingPosts,
			"Year":     time.Now().Year(),
		})
		
		if err == nil {
			// Update last notified
			database.Client.Database(database.DBName).Collection("users").UpdateOne(
				context.Background(),
				bson.M{"_id": u.ID},
				bson.M{"$set": bson.M{"lastNotifiedAt": time.Now()}},
			)
			count++
		}
	}

	log.Printf("[SocialEmail] Batch completed. Sent to %d users.", count)
}
