package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
	"seeqmeai/backend/pkg/cloudflare"
	"seeqmeai/backend/pkg/github"
)

var (
	adjectives = []string{"Radiant", "Ethereal", "Infinite", "Stellar", "Lunar", "Solar", "Vibrant", "Mystic", "Crimson", "Azure", "Golden", "Silver", "Emerald", "Obsidian", "Nebula", "Cosmic"}
	nouns      = []string{"Ship", "Voyager", "Gateway", "Nexus", "Pulse", "Beacon", "Vision", "Orbit", "Zenith", "Horizon", "Echo", "Spark", "Flow", "Wave", "Core", "Portal"}
)

func generateRandomName() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	adj := adjectives[r.Intn(len(adjectives))]
	noun := nouns[r.Intn(len(nouns))]
	return fmt.Sprintf("%s %s", adj, noun)
}

// CreatePortfolioRequest defines the structure for portfolio creation requests
type CreatePortfolioRequest struct {
	ThemeID           string      `json:"themeId" binding:"required"`
	Title             string      `json:"title" binding:"required"`
	Content           interface{} `json:"content"`
	HTML              string      `json:"html"`
	CSS               string      `json:"css"`
	JS                string      `json:"js"`
	StructuredContent interface{} `json:"structuredContent"`
	Placeholders      interface{} `json:"placeholders"`
	TargetUserID      string      `json:"targetUserId,omitempty"` // For admins
}

// GetPortfolioCodeResponse defines the response structure for GetPortfolioCode
type GetPortfolioCodeResponse struct {
	Code string `json:"code"`
}

// GetPortfolioContentResponse defines the response structure for GetPortfolioContent
type GetPortfolioContentResponse struct {
	Content map[string]interface{} `json:"content"`
}

// UpdatePortfolioCodeRequest defines the request structure for UpdatePortfolioCode
type UpdatePortfolioCodeRequest struct {
	Code string `json:"code" binding:"required"`
}

// UpdatePortfolioContentRequest defines the request structure for UpdatePortfolioContent
type UpdatePortfolioContentRequest struct {
	Content map[string]interface{} `json:"content" binding:"required"`
}

// PortfolioCode defines the structure for HTML, CSS, and JS content
type PortfolioCode struct {
	HTML string `json:"html"`
	CSS  string `json:"css"`
	JS   string `json:"js"`
}

// GetPortfolios retrieves all portfolios for the authenticated user
func (h *Handler) GetPortfolios(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	subID, ok := c.Get("subjectId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Identification failed"})
		return
	}

	uOID, _ := primitive.ObjectIDFromHex(userID.(string))

	filter := bson.M{
		"$or": []bson.M{
			{"userId": uOID},
			{"anonymousId": subID.(string)},
		},
	}

	var portfolios []models.Portfolio
	cursor, err := database.Client.Database(database.DBName).Collection("portfolios").Find(context.Background(), filter)
	if err != nil {
		log.Printf("[Portfolio] Error fetching portfolios for subject %v: %v", subID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch portfolios: " + err.Error()})
		return
	}
	defer cursor.Close(context.Background())

	if err = cursor.All(context.Background(), &portfolios); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode portfolios"})
		return
	}

	// Determine if each portfolio has previous versions
	versionCounts := map[primitive.ObjectID]int{}
	if len(portfolios) > 0 {
		ids := make([]primitive.ObjectID, 0, len(portfolios))
		for _, p := range portfolios {
			ids = append(ids, p.ID)
		}

		pipeline := bson.A{
			bson.M{"$match": bson.M{"portfolioId": bson.M{"$in": ids}}},
			bson.M{"$group": bson.M{"_id": "$portfolioId", "count": bson.M{"$sum": 1}}},
		}

		versionCursor, err := database.Client.Database(database.DBName).Collection("portfolio_versions").Aggregate(context.Background(), pipeline)
		if err == nil {
			var results []struct {
				ID    primitive.ObjectID `bson:"_id"`
				Count int                `bson:"count"`
			}
			if err := versionCursor.All(context.Background(), &results); err == nil {
				for _, r := range results {
					versionCounts[r.ID] = r.Count
				}
			}
			versionCursor.Close(context.Background())
		}
	}

	type PortfolioWithMeta struct {
		models.Portfolio
		HasPreviousVersion bool `json:"hasPreviousVersion"`
	}

	enriched := make([]PortfolioWithMeta, 0, len(portfolios))
	for _, p := range portfolios {
		enriched = append(enriched, PortfolioWithMeta{
			Portfolio:         p,
			HasPreviousVersion: versionCounts[p.ID] > 0,
		})
	}

	c.JSON(http.StatusOK, gin.H{"portfolios": enriched})
}

// CreatePortfolio handles portfolio creation
func (h *Handler) CreatePortfolio(c *gin.Context) {
	var req CreatePortfolioRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	uOID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Check if admin is creating on behalf of another user
	if req.TargetUserID != "" {
		if authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser); ok {
			isAdmin := false
			for _, role := range authUser.Roles {
				if role == "admin" {
					isAdmin = true
					break
				}
			}
			if isAdmin {
				targetOID, err := primitive.ObjectIDFromHex(req.TargetUserID)
				if err == nil {
					uOID = targetOID
					log.Printf("[Admin] User %s creating portfolio on behalf of %s", userID, req.TargetUserID)
				}
			}
		}
	}

	contentJSON, err := json.Marshal(req.Content)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content format"})
		return
	}

	// Prepare structured content (either from request or placeholders)
	var structuredContent interface{} = req.StructuredContent
	if structuredContent == nil && req.Placeholders != nil {
		structuredContent = req.Placeholders
	}

	title := req.Title
	if title == "" || title == "My Portfolio" {
		title = generateRandomName()
	}

	portfolio := models.Portfolio{
		ID:                primitive.NewObjectID(),
		UserID:            uOID,
		ThemeID:           req.ThemeID,
		Title:             title,
		Slug:              primitive.NewObjectID().Hex()[:8],
		IsPublished:       false,
		IsActive:          true,
		Content:           string(contentJSON),
		HTML:              req.HTML,
		CSS:               req.CSS,
		JS:                req.JS,
		StructuredContent: convertToPrimitiveM(structuredContent),
		Customization:     "{}",
		SEO:               "{}",
		Analytics:         primitive.M{"views": 0, "uniqueViews": 0},
		Pages:             "[]",
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	_, err = database.Client.Database(database.DBName).Collection("portfolios").InsertOne(context.Background(), portfolio)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create portfolio"})
		return
	}

	c.JSON(http.StatusCreated, portfolio)
}

// Helper to convert interface{} to primitive.M safely
func convertToPrimitiveM(v interface{}) primitive.M {
	if v == nil {
		return nil
	}
	// If it's already primitive.M, return it
	if m, ok := v.(primitive.M); ok {
		return m
	}
	// If it's map[string]interface{}, convert
	if m, ok := v.(map[string]interface{}); ok {
		return primitive.M(m)
	}
	// Fallback: marshal/unmarshal
	b, _ := json.Marshal(v)
	var m primitive.M
	json.Unmarshal(b, &m)
	return m
}

// GetPortfolio retrieves a specific portfolio
func (h *Handler) GetPortfolio(c *gin.Context) {
	portfolioID := c.Param("id")
	subID, ok := c.Get("subjectId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Identification failed"})
		return
	}

	portfolioObjectID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID format"})
		return
	}

	// Try to find portfolio where user is owner OR guest matches subjectId
	collection := database.Client.Database(database.DBName).Collection("portfolios")
	var portfolio models.Portfolio

	filter := bson.M{
		"_id": portfolioObjectID,
	}

	isAdmin := false
	if authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser); ok {
		for _, role := range authUser.Roles {
			if role == "admin" {
				isAdmin = true
				break
			}
		}
	}

	if !isAdmin {
		// Adjust filter if not logged in
		userID, exists := c.Get("userId")
		if !exists {
			filter["anonymousId"] = subID.(string)
		} else {
			uOID, err := primitive.ObjectIDFromHex(userID.(string))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
				return
			}
			filter["$or"] = []bson.M{
				{"userId": uOID},
				{"anonymousId": subID.(string)},
			}
		}
	}

	err = collection.FindOne(context.Background(), filter).Decode(&portfolio)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found or access denied"})
		return
	}

	c.JSON(http.StatusOK, portfolio)
}

// A helper function to run the sync process in the background
func (h *Handler) syncPublishedPortfolio(user models.User, portfolio models.Portfolio) {
	log := logrus.New()
	log.Infof("Starting background sync for portfolio ID: %s", portfolio.ID.Hex())

	// 1. Generate HTML/CSS/JS from structuredContent
	generateCodeReq := GenerateCodeRequest{
		StructuredContent: portfolio.StructuredContent,
		PortfolioID:       portfolio.ID.Hex(),
		Provider:          h.Config.AIProvider,
	}
	jsonBody, err := json.Marshal(generateCodeReq)
	if err != nil {
		log.Errorf("Sync failed for %s: failed to marshal generate code request: %v", portfolio.ID.Hex(), err)
		return
	}

	// This internal HTTP call is a pattern in this codebase, so we'll maintain it.
	resp, err := http.Post(fmt.Sprintf("http://localhost:%s/api/v1/ai/generate-code", h.Config.Port), "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Errorf("Sync failed for %s: failed to call AI generate code endpoint: %v", portfolio.ID.Hex(), err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		log.Errorf("Sync failed for %s: AI generate code endpoint failed: %s", portfolio.ID.Hex(), string(bodyBytes))
		return
	}

	var generatedCode struct {
		HTML string `json:"html"`
		CSS  string `json:"css"`
		JS   string `json:"js"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&generatedCode); err != nil {
		log.Errorf("Sync failed for %s: failed to decode generated code: %v", portfolio.ID.Hex(), err)
		return
	}

	// 2. Prepare files for GitHub, injecting analytics script
	tempDir, err := ioutil.TempDir("", "portfolio-sync-")
	if err != nil {
		log.Errorf("Sync failed for %s: failed to create temp directory: %v", portfolio.ID.Hex(), err)
		return
	}
	defer os.RemoveAll(tempDir)

	htmlContent := generatedCode.HTML
	analyticsScript := fmt.Sprintf(`<script>window._sm_portfolio_id = "%s";</script><script src="/analytics.js" defer></script></head>`, portfolio.ID.Hex())
	modifiedHTML := strings.Replace(htmlContent, "</head>", analyticsScript, 1)

	if err := ioutil.WriteFile(filepath.Join(tempDir, "index.html"), []byte(modifiedHTML), 0644); err != nil {
		log.Errorf("Sync failed for %s: failed to write index.html: %v", portfolio.ID.Hex(), err)
		return
	}

	// 3. Push to existing GitHub Repo
	if user.GitHubPAT == "" || portfolio.GitHubRepoURL == "" {
		log.Errorf("Sync failed for %s: GitHub PAT or Repo URL is missing.", portfolio.ID.Hex())
		return
	}
	githubService := github.NewGitHubService(user.GitHubPAT, h.Config.GitHubOwner, log)
	repoName := fmt.Sprintf("portfolio-%s", portfolio.ID.Hex())

	// The PushFiles function is smart enough to clone or pull an existing repo.
	if err := githubService.PushFiles(portfolio.GitHubRepoURL, repoName, tempDir, filepath.Join(os.TempDir(), "repo-"+repoName), user.Email, func(msg string) { log.Info(msg) }); err != nil {
		log.Errorf("Sync failed for %s: failed to push files to GitHub: %v", portfolio.ID.Hex(), err)
		return
	}

	log.Infof("Successfully completed background sync for portfolio ID: %s", portfolio.ID.Hex())
}

// UpdatePortfolio updates a specific portfolio and syncs to git if published
func (h *Handler) UpdatePortfolio(c *gin.Context) {
	portfolioID := c.Param("id")
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	portfolioObjectID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID format"})
		return
	}

	uOID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// 1. Identify Subject
	subID, _ := c.Get("subjectId")
	_, authenticated := c.Get("userId")

	collection := database.Client.Database(database.DBName).Collection("portfolios")
	var existing models.Portfolio

	// 2. Find and Verify Current Ownership
	findFilter := bson.M{
		"_id": portfolioObjectID,
	}

	isAdmin := false
	if authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser); ok {
		for _, role := range authUser.Roles {
			if role == "admin" {
				isAdmin = true
				break
			}
		}
	}

	if !isAdmin {
		if authenticated {
			uOID, _ := primitive.ObjectIDFromHex(userID.(string))
			findFilter["$or"] = []bson.M{
				{"userId": uOID},
				{"anonymousId": subID.(string)},
			}
		} else {
			findFilter["$or"] = []bson.M{
				{"anonymousId": subID.(string)},
			}
		}
	}

	err = collection.FindOne(context.Background(), findFilter).Decode(&existing)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied to portfolio"})
		return
	}

	// 3. Apply Ownership Handoff (Claiming)
	// If current user is authenticated but portfolio has no owner yet, assign it
	if authenticated && (existing.UserID == primitive.NilObjectID || existing.UserID.IsZero()) {
		uOID, _ := primitive.ObjectIDFromHex(userID.(string))
		updates["userId"] = uOID
		log.Printf("[Identity] Handoff: Portfolio %s claimed by user %s", portfolioID, userID)
	}

	updates["updatedAt"] = time.Now()

	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": portfolioObjectID},
		bson.M{"$set": updates},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update portfolio"})
		return
	}

	var updatedPortfolio models.Portfolio
	err = database.Client.Database(database.DBName).Collection("portfolios").FindOne(
		context.Background(),
		bson.M{"_id": portfolioObjectID},
	).Decode(&updatedPortfolio)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated portfolio"})
		return
	}

	// If the portfolio is published, trigger a background sync
	if updatedPortfolio.IsPublished && authenticated {
		var user models.User
		err = database.Client.Database(database.DBName).Collection("users").FindOne(
			context.Background(),
			bson.M{"_id": uOID},
		).Decode(&user)
		if err != nil {
			// Log the error but don't block the user response
			fmt.Printf("Could not find user %v for background sync: %v\n", uOID, err)
		} else {
			go h.syncPublishedPortfolio(user, updatedPortfolio)
		}
	}

	c.JSON(http.StatusOK, updatedPortfolio)
}

// DeletePortfolio deletes a specific portfolio
func (h *Handler) DeletePortfolio(c *gin.Context) {
	// 1. Identify Subject
	portfolioID := c.Param("id")
	subID, ok := c.Get("subjectId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Identification failed"})
		return
	}

	userID, authenticated := c.Get("userId")

	portfolioObjectID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID format"})
		return
	}

	collection := database.Client.Database(database.DBName).Collection("portfolios")
	var portfolio models.Portfolio

	// 2. Verify Ownership
	filter := bson.M{
		"_id": portfolioObjectID,
	}

	isAdmin := false
	if authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser); ok {
		for _, role := range authUser.Roles {
			if role == "admin" {
				isAdmin = true
				break
			}
		}
	}

	if !isAdmin {
		if authenticated {
			uOID, _ := primitive.ObjectIDFromHex(userID.(string))
			filter["$or"] = []bson.M{
				{"userId": uOID},
				{"anonymousId": subID.(string)},
			}
		} else {
			filter["anonymousId"] = subID.(string)
		}
	}

	// Find and verify ownership
	err = collection.FindOne(context.Background(), filter).Decode(&portfolio)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found or access denied"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch portfolio"})
		}
		return
	}

	// If the portfolio is completed, delete associated external resources
	if portfolio.Status == "completed" {
		cfg := h.Config
		githubService := github.NewGitHubService(cfg.GitHubToken, cfg.GitHubOwner, logrus.New())
		cloudflareService := cloudflare.NewClient(cfg)

		// 1. Delete DNS Record (if exists)
		if portfolio.DNSRecordID != "" {
			if err := cloudflareService.DeleteSubdomain(portfolio.DNSRecordID); err != nil {
				log.Printf("ERROR: Failed to delete Cloudflare DNS record %s for portfolio %s: %v", portfolio.DNSRecordID, portfolioID, err)
				// Continue with other deletions, don't block
			} else {
				log.Printf("Deleted Cloudflare DNS record %s for portfolio %s", portfolio.DNSRecordID, portfolioID)
			}
		}

		// 2. Delete Cloudflare Pages Project (if exists)
		if portfolio.CloudflareProjectID != "" {
			if err := cloudflareService.DeleteProject(portfolio.CloudflareProjectID); err != nil {
				log.Printf("ERROR: Failed to delete Cloudflare Pages project %s for portfolio %s: %v", portfolio.CloudflareProjectID, portfolioID, err)
				// Continue with other deletions, don't block
			} else {
				log.Printf("Deleted Cloudflare Pages project %s for portfolio %s", portfolio.CloudflareProjectID, portfolioID)
			}
		}

		// 3. Delete GitHub Repository (if exists)
		githubURL := portfolio.GitHubRepoURL
		if githubURL == "" {
			// Fallback: Check for legacy lowercase 'g' key in case it was saved with old buggy logic
			var rawDoc bson.M
			if err := collection.FindOne(context.Background(), bson.M{"_id": portfolioObjectID}).Decode(&rawDoc); err == nil {
				if legacyURL, ok := rawDoc["githubRepoURL"].(string); ok {
					githubURL = legacyURL
				}
			}
		}

		if githubURL != "" {
			// Extract repo name from URL
			parts := strings.Split(githubURL, "/")
			repoName := strings.TrimSuffix(parts[len(parts)-1], ".git")
			if repoName != "" {
				if err := githubService.DeleteRepo(context.Background(), repoName); err != nil {
					log.Printf("ERROR: Failed to delete GitHub repository %s for portfolio %s: %v", repoName, portfolioID, err)
					// Continue with other deletions, don't block
				} else {
					log.Printf("Deleted GitHub repository %s for portfolio %s", repoName, portfolioID)
				}
			}
		}
	}

	// Delete portfolio from database
	result, err := collection.DeleteOne(
		context.Background(),
		bson.M{"_id": portfolioObjectID},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete portfolio"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}

	c.Status(http.StatusNoContent)
}

// PublishPortfolio publishes a specific portfolio
func (h *Handler) PublishPortfolio(c *gin.Context) {
	cfg := h.Config // Load config here

	portfolioID := c.Param("id")
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	portfolioObjectID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID format"})
		return
	}

	uOID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var portfolio models.Portfolio

	isAdmin := false
	if authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser); ok {
		for _, role := range authUser.Roles {
			if role == "admin" {
				isAdmin = true
				break
			}
		}
	}

	filter := bson.M{"_id": portfolioObjectID}
	if !isAdmin {
		filter["userId"] = uOID
	}

	err = database.Client.Database(database.DBName).Collection("portfolios").FindOne(context.Background(), filter).Decode(&portfolio)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found or access denied"})
		return
	}

	var user models.User
	err = database.Client.Database(database.DBName).Collection("users").FindOne(
		context.Background(),
		bson.M{"_id": uOID},
	).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 1. Generate HTML/CSS/JS from structuredContent
	// Make an internal call to the AI endpoint
	generateCodeReq := GenerateCodeRequest{
		StructuredContent: portfolio.StructuredContent,
		PortfolioID:       portfolio.ID.Hex(), // Pass portfolio ID
		Provider:          cfg.AIProvider,
	}
	jsonBody, err := json.Marshal(generateCodeReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal generate code request"})
		return
	}

	resp, err := http.Post(fmt.Sprintf("http://localhost:%s/api/v1/ai/generate-code", cfg.Port), "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to call AI generate code endpoint"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("AI generate code endpoint failed: %s", string(bodyBytes))})
		return
	}

	var generatedCode struct {
		HTML string `json:"html"`
		CSS  string `json:"css"`
		JS   string `json:"js"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&generatedCode); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode generated code from AI"})
		return
	}

	// 2. Prepare files for GitHub, INJECTING analytics script
	tempDir, err := ioutil.TempDir("", "portfolio-repo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create temp directory"})
		return
	}
	defer os.RemoveAll(tempDir) // Clean up the temporary directory

	// Inject analytics script into HTML
	htmlContent := generatedCode.HTML
	analyticsScript := fmt.Sprintf(`
    <script>window._sm_portfolio_id = "%s";</script>
    <script src="/analytics.js" defer></script>
</head>`, portfolio.ID.Hex())
	modifiedHTML := strings.Replace(htmlContent, "</head>", analyticsScript, 1)

	if err := ioutil.WriteFile(filepath.Join(tempDir, "index.html"), []byte(modifiedHTML), 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write index.html"})
		return
	}
	if err := ioutil.WriteFile(filepath.Join(tempDir, "style.css"), []byte(generatedCode.CSS), 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write style.css"})
		return
	}
	if err := ioutil.WriteFile(filepath.Join(tempDir, "script.js"), []byte(generatedCode.JS), 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write script.js"})
		return
	}

	// 3. GitHub Integration
	if user.GitHubPAT == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GitHub Personal Access Token not found for user"})
		return
	}
	githubService := github.NewGitHubService(user.GitHubPAT, cfg.GitHubOwner, logrus.New())
	repoName := fmt.Sprintf("portfolio-%s", portfolio.ID.Hex())

	repoURL, err := githubService.CreateRepo(context.Background(), repoName, true) // Create private repo
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create GitHub repository: %v", err)})
		return
	}

	if err := githubService.PushFiles(repoURL, repoName, tempDir, filepath.Join(tempDir, "repo"), user.Email, func(msg string) { log.Println(msg) }); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to push files to GitHub: %v", err)})
		return
	}

	// 4. Cloudflare Pages Integration
	cloudflareService := cloudflare.NewClient(cfg)
	if err := cloudflareService.CreateProject(repoName, cfg.GitHubOwner, repoName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create Cloudflare Pages project: %v", err)})
		return
	}

	// Default Pages URL
	pagesURL := fmt.Sprintf("https://%s.pages.dev", repoName)

	// 5. Check if there is a verified custom domain for this portfolio
	var customDomain models.Domain
	// Initialize domain with default pagesURL
	finalDomain := pagesURL

	// Try to find a verified custom domain
	err = database.Client.Database(database.DBName).Collection("domains").FindOne(
		context.Background(),
		bson.M{"portfolioId": portfolioObjectID, "isVerified": true},
	).Decode(&customDomain)

	if err == nil && customDomain.Domain != "" {
		// Found verified custom domain, use it as primary
		// Ensure it has protocol
		if !strings.HasPrefix(customDomain.Domain, "http") {
			finalDomain = "https://" + customDomain.Domain
		} else {
			finalDomain = customDomain.Domain
		}
	}

	// 6. Update Portfolio in DB
	update := bson.M{
		"$set": bson.M{
			"isPublished":         true,
			"publishedAt":         time.Now(),
			"updatedAt":           time.Now(),
			"gitHubRepoURL":       repoURL,
			"cloudflareProjectID": repoName,    // Cloudflare uses repoName as project ID
			"domain":              finalDomain, // Use custom domain if available, else pages.dev
		},
	}

	_, err = database.Client.Database(database.DBName).Collection("portfolios").UpdateOne(
		context.Background(),
		bson.M{"_id": portfolioObjectID, "userId": uOID},
		update,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update portfolio with deployment info"})
		return
	}

	// Send portfolio published email asynchronously
	go func() {
		portfolioPublishedData := map[string]interface{}{
			"FullName":       user.FullName,
			"PortfolioTitle": portfolio.Title,
			"PortfolioURL":   pagesURL,
		}
		if err := h.Resend.SendEmail(user.Email, "Your Portfolio is Live!", "portfolio_published.html", portfolioPublishedData); err != nil {
			fmt.Printf("Failed to send portfolio published email to %s: %v\n", user.Email, err)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"message": "Portfolio published successfully", "url": pagesURL})
}

// GetPortfolioCode handles fetching the generated code for a portfolio
func (h *Handler) GetPortfolioCode(c *gin.Context) {
	portfolioID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID"})
		return
	}

	var portfolio models.Portfolio
	collection := database.Client.Database(database.DBName).Collection("portfolios")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&portfolio)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch portfolio code"})
		return
	}

	c.JSON(http.StatusOK, GetPortfolioCodeResponse{Code: portfolio.Content})
}

// UpdatePortfolioCode handles updating the generated code for a portfolio
func (h *Handler) UpdatePortfolioCode(c *gin.Context) {
	portfolioID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID"})
		return
	}

	var req UpdatePortfolioCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := database.Client.Database(database.DBName).Collection("portfolios")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{"$set": bson.M{"content": req.Code, "updatedAt": time.Now()}}
	_, err = collection.UpdateByID(ctx, objID, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update portfolio code"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Portfolio code updated successfully"})
}

// GetPortfolioContent handles fetching the structured JSON content for a portfolio
func (h *Handler) GetPortfolioContent(c *gin.Context) {
	portfolioID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID"})
		return
	}

	var portfolio models.Portfolio
	collection := database.Client.Database(database.DBName).Collection("portfolios")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&portfolio)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch portfolio content"})
		return
	}

	c.JSON(http.StatusOK, GetPortfolioContentResponse{Content: portfolio.StructuredContent})
}

// UpdatePortfolioContent handles updating the structured JSON content for a portfolio

// UndoPortfolio reverts a portfolio to its previous version
func (h *Handler) UndoPortfolio(c *gin.Context) {
	portfolioID := c.Param("id")
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	pID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID format"})
		return
	}

	uID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// 1. Find the latest version
	versionCollection := database.Client.Database(database.DBName).Collection("portfolio_versions")
	var prevVersion models.PortfolioVersion
	opts := options.FindOne().SetSort(bson.M{"version": -1})
	err = versionCollection.FindOne(context.Background(), bson.M{"portfolioId": pID}, opts).Decode(&prevVersion)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "No previous versions found to undo"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch version history"})
		}
		return
	}

	// 2. Update the portfolio with the previous version's data
	portfolioCollection := database.Client.Database(database.DBName).Collection("portfolios")
	update := bson.M{
		"$set": bson.M{
			"structuredContent": prevVersion.StructuredContent,
			"html":              prevVersion.HTML,
			"css":               prevVersion.CSS,
			"js":                prevVersion.JS,
			"updatedAt":         time.Now(),
		},
	}

	_, err = portfolioCollection.UpdateOne(context.Background(), bson.M{"_id": pID, "userId": uID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restore previous version"})
		return
	}

	// 3. Remove the version we just restored to (optional, but keeps history clean)
	_, _ = versionCollection.DeleteOne(context.Background(), bson.M{"_id": prevVersion.ID})

	c.JSON(http.StatusOK, gin.H{
		"message": "Portfolio successfully reverted to version " + fmt.Sprint(prevVersion.Version),
		"version": prevVersion.Version,
	})
}

func (h *Handler) UpdatePortfolioContent(c *gin.Context) {
	portfolioID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID"})
		return
	}

	var req UpdatePortfolioContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := database.Client.Database(database.DBName).Collection("portfolios")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{"$set": bson.M{"structuredContent": req.Content, "updatedAt": time.Now()}}
	_, err = collection.UpdateByID(ctx, objID, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update portfolio content"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Portfolio content updated successfully"})
}

// ExportPortfolio exports portfolio code as a ZIP file
func (h *Handler) ExportPortfolio(c *gin.Context) {
	portfolioID := c.Param("id")
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	objID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID"})
		return
	}

	uOID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	subID, _ := c.Get("subjectId")

	collection := database.Client.Database(database.DBName).Collection("portfolios")
	var portfolio models.Portfolio

	// Find and verify ownership
	filter := bson.M{
		"_id": objID,
		"$or": []bson.M{
			{"userId": uOID},
			{"anonymousId": subID.(string)},
		},
	}
	err = collection.FindOne(context.Background(), filter).Decode(&portfolio)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found or access denied"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch portfolio"})
		}
		return
	}

	// Create temporary directory for export files
	tempDir := filepath.Join(os.TempDir(), "seeqme_export_"+portfolio.ID.Hex())
	defer os.RemoveAll(tempDir)

	if err := os.MkdirAll(tempDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create export directory"})
		return
	}

	// Extract code from portfolio
	htmlContent := ""
	cssContent := ""
	jsContent := ""

	var portfolioCode PortfolioCode
	err = json.Unmarshal([]byte(portfolio.Content), &portfolioCode)
	if err != nil {
		// Log the error, but proceed with potentially empty strings
		fmt.Printf("Error unmarshalling portfolio.Content: %v\n", err)
	} else {
		htmlContent = portfolioCode.HTML
		cssContent = portfolioCode.CSS
		jsContent = portfolioCode.JS
	}

	// Write files to temporary directory
	files := map[string]string{
		"index.html": h.generateHTMLWrapper(portfolio.Title, htmlContent, cssContent),
		"style.css":  cssContent,
		"script.js":  jsContent,
	}

	for filename, content := range files {
		if err := ioutil.WriteFile(filepath.Join(tempDir, filename), []byte(content), 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write file: " + filename})
			return
		}
	}

	// Create README
	readme := fmt.Sprintf(`# %s

This is your SeeqMe portfolio export.

## Files
- index.html - Main portfolio page
- style.css - Stylesheet
- script.js - JavaScript functionality

## How to use
1. Open index.html in a web browser to preview your portfolio
2. Deploy to any static hosting service (Netlify, Vercel, GitHub Pages, etc.)
3. Or use the SeeqMe publishing service for automatic deployment

Generated on: %s
`, portfolio.Title, time.Now().Format("2006-01-02 15:04:05"))

	if err := ioutil.WriteFile(filepath.Join(tempDir, "README.md"), []byte(readme), 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create README"})
		return
	}

	// Create ZIP file
	zipPath := filepath.Join(os.TempDir(), portfolio.Slug+"-portfolio.zip")
	defer os.Remove(zipPath)

	if err := h.createZip(tempDir, zipPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ZIP file"})
		return
	}

	// Read and send ZIP file
	zipData, err := ioutil.ReadFile(zipPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read ZIP file"})
		return
	}

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s-portfolio.zip", portfolio.Slug))
	c.Header("Content-Type", "application/zip")
	c.Data(http.StatusOK, "application/zip", zipData)
}

// generateHTMLWrapper creates a complete HTML document from content and styles
func (h *Handler) generateHTMLWrapper(title string, html string, css string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>%s - SeeqMe Portfolio</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
		%s
	</style>
</head>
<body>
	%s
	<script src="script.js" defer></script>
</body>
</html>`, title, css, html)
}

// createZip creates a ZIP file from a directory
func (h *Handler) createZip(source, destination string) error {

	// This creates the ZIP by writing files sequentially
	//  basic implementation that bundles files

	tempArchive, err := os.Create(destination)
	if err != nil {
		return err
	}
	defer tempArchive.Close()

	// Read all files and write them to destination

	files := []string{"index.html", "style.css", "script.js", "README.md"}

	for _, filename := range files {
		srcPath := filepath.Join(source, filename)
		if data, err := ioutil.ReadFile(srcPath); err == nil {
			if _, err := tempArchive.Write(data); err != nil {
				return err
			}
		}
	}

	return nil
}

// GetPortfolioAnalytics retrieves analytics data for a specific portfolio
func (h *Handler) GetPortfolioAnalytics(c *gin.Context) {
	portfolioID := c.Param("id")
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	portfolioObjectID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID"})
		return
	}

	uOID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Identify Subject for dual ownership check
	subID, _ := c.Get("subjectId")

	// Verify portfolio ownership
	portfolioCollection := database.Client.Database(database.DBName).Collection("portfolios")
	var portfolio bson.M
	err = portfolioCollection.FindOne(context.Background(), bson.M{
		"_id": portfolioObjectID,
		"$or": []bson.M{
			{"userId": uOID},
			{"anonymousId": subID.(string)},
		},
	}).Decode(&portfolio)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}

	var cloudflareData map[string]interface{}
	cfProjectID, _ := portfolio["cloudflareProjectID"].(string)
	if cfProjectID != "" {
		cfg := h.Config
		cfClient := cloudflare.NewClient(cfg)
		cfData, err := cfClient.FetchPagesAnalytics(cfProjectID)
		if err == nil {
			cloudflareData = cfData
		} else {
			fmt.Printf("Error fetching cloudflare analytics: %v\n", err)
		}
	}

	totalViews := 0
	uniqueVisitors := 0

	if cloudflareData != nil {
		if viewer, ok := cloudflareData["viewer"].(map[string]interface{}); ok {
			if accounts, ok := viewer["accounts"].([]interface{}); ok && len(accounts) > 0 {
				if account, ok := accounts[0].(map[string]interface{}); ok {
					if pagesProjects, ok := account["pagesProjects"].([]interface{}); ok && len(pagesProjects) > 0 {
						if pagesProject, ok := pagesProjects[0].(map[string]interface{}); ok {
							if analyticsGroups, ok := pagesProject["analytics1dGroups"].([]interface{}); ok {
								for _, group := range analyticsGroups {
									if groupMap, ok := group.(map[string]interface{}); ok {
										if sum, ok := groupMap["sum"].(map[string]interface{}); ok {
											if views, ok := sum["pageViews"].(float64); ok {
												totalViews += int(views)
											}
											if visits, ok := sum["visits"].(float64); ok {
												uniqueVisitors += int(visits)
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	// Fallback to internal tracking if Cloudflare data is unavailable or zero
	if totalViews == 0 {
		analyticsEventsCollection := database.Client.Database(database.DBName).Collection("analytics_events")

		// Total views from our tracking
		count, err := analyticsEventsCollection.CountDocuments(context.Background(), bson.M{"portfolioId": portfolioObjectID})
		if err == nil {
			totalViews = int(count)
		}

		// Unique visitors from our tracking (by distinct IP address)
		distinctIPs, err := analyticsEventsCollection.Distinct(context.Background(), "ipAddress", bson.M{"portfolioId": portfolioObjectID})
		if err == nil {
			uniqueVisitors = len(distinctIPs)
		}
	}

	// Aggregate data from analytics_events collection
	analyticsEventsCollection := database.Client.Database(database.DBName).Collection("analytics_events")

	// Aggregate Device Types
	deviceTypes := make(map[string]int)
	pipelineDevice := []bson.M{
		{"$match": bson.M{"portfolioId": portfolioObjectID}},
		{"$group": bson.M{"_id": "$device", "count": bson.M{"$sum": 1}}},
	}
	cursorDevice, err := analyticsEventsCollection.Aggregate(context.Background(), pipelineDevice)
	if err == nil {
		var results []bson.M
		if err = cursorDevice.All(context.Background(), &results); err == nil {
			for _, result := range results {
				if device, ok := result["_id"].(string); ok {
					if count, ok := result["count"].(int32); ok {
						deviceTypes[device] = int(count)
					}
				}
			}
		}
		cursorDevice.Close(context.Background())
	}

	// Aggregate Browsers
	browsers := make(map[string]int)
	pipelineBrowser := []bson.M{
		{"$match": bson.M{"portfolioId": portfolioObjectID}},
		{"$group": bson.M{"_id": "$browser", "count": bson.M{"$sum": 1}}},
	}
	cursorBrowser, err := analyticsEventsCollection.Aggregate(context.Background(), pipelineBrowser)
	if err == nil {
		var results []bson.M
		if err = cursorBrowser.All(context.Background(), &results); err == nil {
			for _, result := range results {
				if browser, ok := result["_id"].(string); ok {
					if count, ok := result["count"].(int32); ok {
						browsers[browser] = int(count)
					}
				}
			}
		}
		cursorBrowser.Close(context.Background())
	}

	// Aggregate Countries
	countries := make(map[string]int)
	pipelineCountry := []bson.M{
		{"$match": bson.M{"portfolioId": portfolioObjectID}},
		{"$group": bson.M{"_id": "$country", "count": bson.M{"$sum": 1}}},
	}
	cursorCountry, err := analyticsEventsCollection.Aggregate(context.Background(), pipelineCountry)
	if err == nil {
		var results []bson.M
		if err = cursorCountry.All(context.Background(), &results); err == nil {
			for _, result := range results {
				if country, ok := result["_id"].(string); ok {
					if count, ok := result["count"].(int32); ok {
						countries[country] = int(count)
					}
				}
			}
		}
		cursorCountry.Close(context.Background())
	}

	c.JSON(http.StatusOK, gin.H{
		"portfolioId":    portfolioID,
		"totalViews":     totalViews,
		"uniqueVisitors": uniqueVisitors,
		"deviceTypes":    deviceTypes,
		"browsers":       browsers,
		"countries":      countries,
		"recentEvents":   []interface{}{},
		"cloudflare":     cloudflareData,
		"lastUpdated":    time.Now(),
	})
}
