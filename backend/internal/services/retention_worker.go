package services

import (
	"context"
	"fmt"
	"time"

	"seeqmeai/backend/internal/config"
	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
	"seeqmeai/backend/pkg/resend"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type RetentionWorker struct {
	db     *mongo.Database
	Resend *resend.Resend
}

func NewRetentionWorker(cfg *config.Config) *RetentionWorker {
	return &RetentionWorker{
		db:     database.Client.Database(database.DBName),
		Resend: resend.New(cfg),
	}
}

func (w *RetentionWorker) Start(ctx context.Context) {
	// Check every 12 hours
	ticker := time.NewTicker(12 * time.Hour)
	defer ticker.Stop()

	// Initial check on start
	w.ProcessRetentionEmails(ctx)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.ProcessRetentionEmails(ctx)
		}
	}
}

func (w *RetentionWorker) ProcessRetentionEmails(ctx context.Context) {
	now := time.Now()
	// Half-week interval (approx 3.5 days) to ensure max 2 per week
	notificationThreshold := now.Add(-84 * time.Hour)

	// Find portfolios that are:
	// 1. Not published
	// 2. Created at least 24 hours ago (give them some time)
	// 3. Not notified in the last 3.5 days
	filter := bson.M{
		"isPublished": false,
		"createdAt":   bson.M{"$lt": now.Add(-24 * time.Hour)},
		"$or": []bson.M{
			{"lastNotifiedAt": bson.M{"$exists": false}},
			{"lastNotifiedAt": nil},
			{"lastNotifiedAt": bson.M{"$lt": notificationThreshold}},
		},
	}

	cursor, err := w.db.Collection("portfolios").Find(ctx, filter)
	if err != nil {
		fmt.Printf("[RetentionWorker] Error finding portfolios: %v\n", err)
		return
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var portfolio models.Portfolio
		if err := cursor.Decode(&portfolio); err != nil {
			continue
		}

		w.SendRetentionEmail(ctx, portfolio)
	}
}

func (w *RetentionWorker) SendRetentionEmail(ctx context.Context, portfolio models.Portfolio) {
	// Fetch user
	var user models.User
	err := w.db.Collection("users").FindOne(ctx, bson.M{"_id": portfolio.UserID}).Decode(&user)
	if err != nil {
		fmt.Printf("[RetentionWorker] Error finding user %s for portfolio %s: %v\n", portfolio.UserID.Hex(), portfolio.ID.Hex(), err)
		return
	}

	if user.Email == "" {
		return
	}

	emailData := map[string]interface{}{
		"FullName":       user.FullName,
		"PortfolioTitle": portfolio.Title,
		"DashboardURL":   "https://seeqme.com/dashboard", // Adjust as needed
		"Year":           time.Now().Year(),
	}

	err = w.Resend.SendEmail(user.Email, "Ready to Go Live? Claim Your Professional Edge", "retention.html", emailData)
	if err != nil {
		fmt.Printf("[RetentionWorker] Error sending email to %s: %v\n", user.Email, err)
		return
	}

	// Update portfolio to record notification time
	now := time.Now()
	_, err = w.db.Collection("portfolios").UpdateOne(ctx, bson.M{"_id": portfolio.ID}, bson.M{
		"$set": bson.M{
			"lastNotifiedAt": &now,
		},
	})
	if err != nil {
		fmt.Printf("[RetentionWorker] Error updating portfolio %s notification time: %v\n", portfolio.ID.Hex(), err)
	} else {
		fmt.Printf("[RetentionWorker] Sent retention email to %s for portfolio %s\n", user.Email, portfolio.ID.Hex())
	}
}
