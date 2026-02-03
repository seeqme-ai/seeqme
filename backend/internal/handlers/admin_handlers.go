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

	// Since we are reusing the existing PublishPortfolio logic, we set up the context and call it internally
	// For a more robust implementation, we'd refactor PublishPortfolio into a service.
	// However, to maintain current patterns, we'll mimic the internal flow.

	// Create a new gin context with the target user's ID to "impersonate" for the publish handler
	// WARNING: This is a shortcut for MVP. Ideally, move deployment logic to seeqmeai/backend/internal/services.

	c.Set("userId", user.ID.Hex())
	c.Set("userEmail", user.Email)

	h.PublishPortfolio(c)
}
