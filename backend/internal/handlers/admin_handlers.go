package handlers

import (
	"context"
	"net/http"
	"time"

	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SystemConfig struct {
	MaintenanceMode bool      `json:"maintenanceMode" bson:"maintenanceMode"`
	AllowSignups    bool      `json:"allowSignups" bson:"allowSignups"`
	AIModel         string    `json:"aiModel" bson:"aiModel"` // e.g., "gemini-1.5-flash"
	UpdatedAt       time.Time `json:"updatedAt" bson:"updatedAt"`
}

func (h *Handler) GetSystemConfig(c *gin.Context) {
	db := database.Client.Database(database.DBName)
	var config SystemConfig

	// Try to find existing config
	err := db.Collection("system_config").FindOne(context.Background(), bson.M{}).Decode(&config)
	if err != nil {
		// If not found, return default
		defaultConfig := SystemConfig{
			MaintenanceMode: false,
			AllowSignups:    true,
			AIModel:         "gemini-2.5-flash",
			UpdatedAt:       time.Now(),
		}
		c.JSON(http.StatusOK, defaultConfig)
		return
	}

	c.JSON(http.StatusOK, config)
}

func (h *Handler) UpdateSystemConfig(c *gin.Context) {
	var req SystemConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid config data"})
		return
	}

	req.UpdatedAt = time.Now()

	db := database.Client.Database(database.DBName)
	opts := options.Update().SetUpsert(true)

	// We use an empty filter assuming single config document, or can use a fixed ID
	_, err := db.Collection("system_config").UpdateOne(
		context.Background(),
		bson.M{}, // match the first one
		bson.M{"$set": req},
		opts,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update config"})
		return
	}

	c.JSON(http.StatusOK, req)
}

func (h *Handler) ReloadSystemConfig(c *gin.Context) {
	// dedicated endpoint to force reload if caching was implemented
	// For now, just return success
	c.JSON(http.StatusOK, gin.H{"status": "reloaded"})
}

// Admin Suite Handlers

func (h *Handler) AdminGetUsers(c *gin.Context) {
	db := database.Client.Database(database.DBName)
	cursor, err := db.Collection("users").Find(context.Background(), bson.M{}, options.Find().SetSort(bson.M{"createdAt": -1}))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	defer cursor.Close(context.Background())

	var users []models.User
	if err = cursor.All(context.Background(), &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

func (h *Handler) AdminGetAllPortfolios(c *gin.Context) {
	db := database.Client.Database(database.DBName)
	cursor, err := db.Collection("portfolios").Find(context.Background(), bson.M{}, options.Find().SetSort(bson.M{"updatedAt": -1}))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch portfolios"})
		return
	}
	defer cursor.Close(context.Background())

	var portfolios []models.Portfolio
	if err = cursor.All(context.Background(), &portfolios); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode portfolios"})
		return
	}

	c.JSON(http.StatusOK, portfolios)
}

func (h *Handler) AdminGetStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db := database.Client.Database(database.DBName)

	// Basic Stats
	totalUsers, _ := db.Collection("users").CountDocuments(ctx, bson.M{})
	totalPortfolios, _ := db.Collection("portfolios").CountDocuments(ctx, bson.M{})
	liveSites, _ := db.Collection("portfolios").CountDocuments(ctx, bson.M{"isPublished": true})

	//  Revenue calculation
	pipeline := bson.A{
		bson.M{"$group": bson.M{"_id": nil, "total": bson.M{"$sum": "$amount"}}},
	}
	cursor, err := db.Collection("subscriptions").Aggregate(ctx, pipeline)
	var totalRevenue float64
	if err == nil && cursor.Next(ctx) {
		var result struct {
			Total float64 `bson:"total"`
		}
		if err := cursor.Decode(&result); err == nil {
			totalRevenue = result.Total
		}
	}

	//  User & Revenue Growth (Last 30 days)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	// User Growth Pipeline
	userGrowthPipeline := bson.A{
		bson.M{"$match": bson.M{"createdAt": bson.M{"$gte": thirtyDaysAgo}}},
		bson.M{"$group": bson.M{
			"_id":   bson.M{"$dateToString": bson.M{"format": "%Y-%m-%d", "date": "$createdAt"}},
			"count": bson.M{"$sum": 1},
		}},
		bson.M{"$sort": bson.M{"_id": 1}},
	}
	uCursor, _ := db.Collection("users").Aggregate(ctx, userGrowthPipeline)
	var userGrowth []bson.M
	uCursor.All(ctx, &userGrowth)

	// Revenue Growth Pipeline
	revGrowthPipeline := bson.A{
		bson.M{"$match": bson.M{"createdAt": bson.M{"$gte": thirtyDaysAgo}}},
		bson.M{"$group": bson.M{
			"_id":   bson.M{"$dateToString": bson.M{"format": "%Y-%m-%d", "date": "$createdAt"}},
			"total": bson.M{"$sum": "$amount"},
		}},
		bson.M{"$sort": bson.M{"_id": 1}},
	}
	rCursor, _ := db.Collection("subscriptions").Aggregate(ctx, revGrowthPipeline)
	var revenueGrowth []bson.M
	rCursor.All(ctx, &revenueGrowth)

	c.JSON(http.StatusOK, gin.H{
		"totalUsers":      totalUsers,
		"totalPortfolios": totalPortfolios,
		"liveSites":       liveSites,
		"totalRevenue":    totalRevenue,
		"userGrowth":      userGrowth,
		"revenueGrowth":   revenueGrowth,
	})
}

func (h *Handler) AdminDeployPortfolio(c *gin.Context) {
	portfolioID := c.Param("id")
	pOID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID"})
		return
	}

	db := database.Client.Database(database.DBName)
	var portfolio models.Portfolio
	err = db.Collection("portfolios").FindOne(context.Background(), bson.M{"_id": pOID}).Decode(&portfolio)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}

	// Fetch user for this portfolio to get GitHub PAT
	var user models.User
	err = db.Collection("users").FindOne(context.Background(), bson.M{"_id": portfolio.UserID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Owner not found or has no active profile"})
		return
	}
	
	// impersonate for the publish handler
	c.Set("userId", user.ID.Hex())
	c.Set("userEmail", user.Email)
	c.Set("subjectId", user.ID.Hex()) // Crucial for GetPortfolio/PublishPortfolio logic

	h.PublishPortfolio(c)
}
