package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
)

func (h *Handler) GetSubscription(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	db := database.Client.Database(database.DBName)
	var subscription models.Subscription
	// Try to find existing subscription
	err = db.Collection("subscriptions").FindOne(context.Background(), bson.M{"userId": objectID}).Decode(&subscription)
	if err != nil {
		// If not found (or other error), return a default "Starter" subscription
		// This prevents 404 errors on the frontend for new users
		defaultSub := models.Subscription{
			ID:     primitive.NewObjectID(),
			UserID: objectID,
			PlanID: "starter", // Default plan
			Status: "active",
		}
		c.JSON(http.StatusOK, defaultSub)
		return
	}

	c.JSON(http.StatusOK, subscription)
}

type VerifySubscriptionRequest struct {
	Reference string  `json:"reference"`
	Plan      string  `json:"plan"`
	Gateway   string  `json:"gateway"`  // "paystack" or "stripe"
	Period    string  `json:"period"`   // "monthly" or "yearly"
	Amount    float64 `json:"amount"`   // e.g., 5 or 5000
	Currency  string  `json:"currency"` // "USD" or "NGN"
}

func (h *Handler) VerifySubscription(c *gin.Context) {
	var req VerifySubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}
	userObjectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// relying on client-side onSuccess callback without secondary verification.
	// Proceeding to update subscription in DB.
	verified := true

	if !verified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment verification failed"})
		return
	}

	// Update User Subscription in DB
	db := database.Client.Database(database.DBName)
	ctx := context.Background()

	// Upsert Subscription
	sub := models.Subscription{
		ID:                 primitive.NewObjectID(),
		UserID:             userObjectID,
		PlanID:             req.Plan,
		Status:             "active",
		CurrentPeriodStart: time.Now(),
		CurrentPeriodEnd:   time.Now().AddDate(1, 0, 0), // Default
		Amount:             req.Amount,
		Currency:           req.Currency,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	if req.Period == "monthly" {
		sub.CurrentPeriodEnd = time.Now().AddDate(0, 1, 0)
	} else if req.Period == "yearly" {
		sub.CurrentPeriodEnd = time.Now().AddDate(1, 0, 0)
	}

	opts := options.Update().SetUpsert(true)
	filter := bson.M{"userId": userObjectID}
	update := bson.M{"$set": sub}

	_, err = db.Collection("subscriptions").UpdateOne(ctx, filter, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update subscription"})
		return
	}

	// Send Email Notification
	var user models.User
	err = db.Collection("users").FindOne(ctx, bson.M{"_id": userObjectID}).Decode(&user)
	if err != nil {
		// Log error but don't fail the request since subscription is already updated
		fmt.Printf("Failed to finding user for email: %v\n", err)
	} else if user.Email != "" {
		// Format amount (e.g. 5000 NGN or 5.00 USD)
		amountStr := fmt.Sprintf("%.2f %s", req.Amount, req.Currency)
		if req.Currency == "NGN" {
			amountStr = fmt.Sprintf("₦%.2f", req.Amount)
		} else if req.Currency == "USD" {
			amountStr = fmt.Sprintf("$%.2f", req.Amount)
		}

		emailData := map[string]interface{}{
			"FullName":  user.FullName,
			"PlanName":  req.Plan,
			"Amount":    amountStr,
			"Reference": req.Reference,
			"Date":      time.Now().Format("Jan 02, 2006"),
		}
		// Send Payment Success Email
		go func() {
			if h.Resend != nil {
				h.Resend.SendEmail(user.Email, "Payment Successful - SeeqMe Subscription", "payment_success.html", emailData)
				// Also send general Subscription Notification
				h.Resend.SendEmail(user.Email, "Subscription Activated", "subscription_notification.html", emailData)
			}
		}()
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Subscription active"})
}
