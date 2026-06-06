package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
	"seeqmeai/backend/internal/services"
)

type AgentDeployRequest struct {
	Prompt    string `json:"prompt" binding:"required"`
	Style     string `json:"style"`
	Subdomain string `json:"subdomain" binding:"required"`
}

type AgentDeployResponse struct {
	URL         string `json:"url"`
	Subdomain   string `json:"subdomain"`
	PortfolioID string `json:"portfolioId"`
	Status      string `json:"status"`
	Message     string `json:"message"`
}

// AgentDeployPortfolio is called by the Hedera MCP agent after verifying x402 payment.
func (h *Handler) AgentDeployPortfolio(c *gin.Context) {
	// Verify agent secret
	authHeader := c.GetHeader("Authorization")
	token := strings.TrimPrefix(authHeader, "Bearer ")
	if token == "" || token != h.Config.AgentSecret || h.Config.AgentSecret == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid agent authorization"})
		return
	}

	var req AgentDeployRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	subdomain := sanitiseSubdomain(strings.ToLower(req.Subdomain))
	if len(subdomain) < 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Subdomain must be at least 3 characters"})
		return
	}

	style := req.Style
	if style == "" {
		style = "modern"
	}

	log.Printf("[AgentDeploy] Generating portfolio — subdomain=%s style=%s", subdomain, style)

	// Generate portfolio HTML from prompt using the configured AI provider
	provider := h.Config.AIProvider
	if provider == "" {
		provider = "gemini"
	}
	aiProvider, err := services.NewAIProvider(provider)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI provider unavailable"})
		return
	}

	sysPrompt := fmt.Sprintf(`You are an expert web developer. Generate a complete, single-file HTML portfolio website.
Style: %s. The portfolio must be production-ready, responsive, and visually impressive.
Return ONLY raw HTML (no markdown, no code fences). Include all CSS in a <style> tag and JS in a <script> tag.`, style)

	userPrompt := fmt.Sprintf("Create a professional portfolio website for: %s", req.Prompt)

	generatedHTML, genErr := aiProvider.Generate(userPrompt, sysPrompt, nil)
	if genErr != nil {
		log.Printf("[AgentDeploy] AI generation error: %v", genErr)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Portfolio generation failed: " + genErr.Error()})
		return
	}

	// Create portfolio record under the dedicated agent user
	agentUserID := h.getOrCreateAgentUser()
	portfolioID := primitive.NewObjectID()

	_, insertErr := database.Client.Database(database.DBName).Collection("portfolios").InsertOne(
		context.Background(),
		bson.M{
			"_id":       portfolioID,
			"userId":    agentUserID,
			"name":      subdomain + " portfolio",
			"subdomain": subdomain,
			"html":      generatedHTML,
			"css":       "",
			"js":        "",
			"status":    "draft",
			"source":    "hedera-agent",
			"createdAt": primitive.NewDateTimeFromTime(time.Now()),
			"updatedAt": primitive.NewDateTimeFromTime(time.Now()),
		},
	)
	if insertErr != nil {
		log.Printf("[AgentDeploy] DB insert error: %v", insertErr)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save portfolio"})
		return
	}

	// Trigger async deployment
	deploymentID := primitive.NewObjectID()
	database.Client.Database(database.DBName).Collection("deployments").InsertOne(
		context.Background(),
		models.Deployment{
			ID:          deploymentID,
			PortfolioID: portfolioID,
			Status:      "in-progress",
			StartedAt:   time.Now(),
		},
	)
	go h.triggerDeployment(portfolioID.Hex(), subdomain, "", deploymentID)

	liveURL := "https://" + subdomain + ".seeqme.com"
	log.Printf("[AgentDeploy] Deployment triggered — portfolioId=%s url=%s", portfolioID.Hex(), liveURL)

	c.JSON(http.StatusOK, AgentDeployResponse{
		URL:         liveURL,
		Subdomain:   subdomain,
		PortfolioID: portfolioID.Hex(),
		Status:      "deploying",
		Message:     "Your portfolio is deploying. It will be live at " + liveURL + " in ~2 minutes.",
	})
}

func sanitiseSubdomain(s string) string {
	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			b.WriteRune(r)
		}
	}
	result := strings.Trim(b.String(), "-")
	if len(result) > 30 {
		result = result[:30]
	}
	return result
}

func (h *Handler) getOrCreateAgentUser() primitive.ObjectID {
	coll := database.Client.Database(database.DBName).Collection("users")
	var user bson.M
	if err := coll.FindOne(context.Background(), bson.M{"email": "agent@seeqme.internal"}).Decode(&user); err == nil {
		if id, ok := user["_id"].(primitive.ObjectID); ok {
			return id
		}
	}
	id := primitive.NewObjectID()
	coll.InsertOne(context.Background(), bson.M{
		"_id":      id,
		"email":    "agent@seeqme.internal",
		"fullName": "Hedera Agent",
		"roles":    []string{"agent"},
		"createdAt": primitive.NewDateTimeFromTime(time.Now()),
	})
	return id
}
