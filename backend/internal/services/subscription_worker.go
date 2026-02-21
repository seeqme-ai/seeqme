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

type SubscriptionWorker struct {
	db     *mongo.Database
	Resend *resend.Resend
}

func NewSubscriptionWorker(cfg *config.Config) *SubscriptionWorker {
	return &SubscriptionWorker{
		db:     database.Client.Database(database.DBName),
		Resend: resend.New(cfg),
	}
}

func (w *SubscriptionWorker) Start(ctx context.Context) {
	ticker := time.NewTicker(7 * 24 * time.Hour)
	defer ticker.Stop()

	// Run once on start
	w.CheckSubscriptions(ctx)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.CheckSubscriptions(ctx)
		}
	}
}

func (w *SubscriptionWorker) CheckSubscriptions(ctx context.Context) {
	now := time.Now()

	// 1. Process Expired Subscriptions
	cursor, err := w.db.Collection("subscriptions").Find(ctx, bson.M{
		"status":           "active",
		"currentPeriodEnd": bson.M{"$lt": now},
	})
	if err == nil {
		defer cursor.Close(ctx)
		for cursor.Next(ctx) {
			var sub models.Subscription
			if err := cursor.Decode(&sub); err == nil {
				w.DowngradeSubscription(ctx, sub)
			}
		}
	}

	// 2. Process Expiring Soon (3 days)
	expiringSoon := now.AddDate(0, 0, 3)
	cursor, err = w.db.Collection("subscriptions").Find(ctx, bson.M{
		"status":           "active",
		"currentPeriodEnd": bson.M{"$lte": expiringSoon, "$gt": now},
	})
	if err == nil {
		defer cursor.Close(ctx)
		for cursor.Next(ctx) {
			var sub models.Subscription
			if err := cursor.Decode(&sub); err == nil {
				w.NotifyExpiringSoon(ctx, sub)
			}
		}
	}
}

func (w *SubscriptionWorker) DowngradeSubscription(ctx context.Context, sub models.Subscription) {
	_, err := w.db.Collection("subscriptions").UpdateByID(ctx, sub.ID, bson.M{
		"$set": bson.M{
			"status":    "expired",
			"planId":    "free",
			"updatedAt": time.Now(),
		},
	})
	if err != nil {
		fmt.Printf("Error downgrading subscription %s: %v\n", sub.ID.Hex(), err)
		return
	}

	// Fetch user to send email
	var user models.User
	err = w.db.Collection("users").FindOne(ctx, bson.M{"_id": sub.UserID}).Decode(&user)
	if err == nil && user.Email != "" {
		emailData := map[string]interface{}{
			"FullName": user.FullName,
			"PlanName": "Free",
			"Year":     time.Now().Year(),
		}
		w.Resend.SendEmail(user.Email, "Subscription Update - SeeqMe", "subscription_downgraded.html", emailData)
	}
}

func (w *SubscriptionWorker) NotifyExpiringSoon(ctx context.Context, sub models.Subscription) {
	// Optional: Check if already notified to avoid spamming

	var user models.User
	err := w.db.Collection("users").FindOne(ctx, bson.M{"_id": sub.UserID}).Decode(&user)
	if err == nil && user.Email != "" {
		emailData := map[string]interface{}{
			"FullName":   user.FullName,
			"PlanName":   sub.PlanID,
			"ExpiryDate": sub.CurrentPeriodEnd.Format("Jan 02, 2006"),
			"RenewURL":   "https://seeqme.com/plans",
			"Year":       time.Now().Year(),
		}
		w.Resend.SendEmail(user.Email, "Action Required: Your SeeqMe subscription expires soon", "subscription_expiring.html", emailData)
	}
}
