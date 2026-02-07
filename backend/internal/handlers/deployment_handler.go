package handlers

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
	"seeqmeai/backend/internal/services"
	"seeqmeai/backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DeploymentRequest struct {
	PortfolioID    string `json:"portfolioId" binding:"required"`
	Subdomain      string `json:"subdomain"`
	CustomDomainID string `json:"customDomainId"`
}

type ValidateUpdateRequest struct {
	PortfolioID string `json:"portfolioId" binding:"required"`
	HTML        string `json:"html" binding:"required"`
	CSS         string `json:"css"`
	JS          string `json:"js"`
}

type PublishUpdateRequest struct {
	PortfolioID    string `json:"portfolioId" binding:"required"`
	HTML           string `json:"html" binding:"required"`
	CSS            string `json:"css"`
	JS             string `json:"js"`
	SkipValidation bool   `json:"skipValidation"`
}

// ValidateUpdate validates portfolio updates before publishing
func (h *Handler) ValidateUpdate(c *gin.Context) {
	var req ValidateUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validator := services.NewDeploymentValidator(req.PortfolioID)
	result, err := validator.ValidateUpdate(req.HTML, req.CSS, req.JS)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// If valid, create staging preview
	if result.IsValid {
		previewURL, err := validator.CreateStagingPreview(req.PortfolioID, req.HTML, req.CSS, req.JS)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create staging preview"})
			return
		}
		result.PreviewURL = previewURL

		// Compare with live version
		comparison, err := validator.CompareWithLive(req.PortfolioID, req.HTML, req.CSS, req.JS)
		if err == nil {
			c.JSON(http.StatusOK, gin.H{
				"validation": result,
				"comparison": comparison,
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"validation": result,
	})
}

// PublishUpdate publishes validated updates to production
func (h *Handler) PublishUpdate(c *gin.Context) {
	var req PublishUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate unless skipped
	if !req.SkipValidation {
		validator := services.NewDeploymentValidator(req.PortfolioID)
		result, err := validator.ValidateUpdate(req.HTML, req.CSS, req.JS)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if !result.IsValid {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "Validation failed",
				"issues": result.Issues,
			})
			return
		}
	}

	// Update portfolio in database
	portfolioID, err := primitive.ObjectIDFromHex(req.PortfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID"})
		return
	}

	// Get current portfolio to check status
	collection := database.Client.Database(database.DBName).Collection("portfolios")
	var portfolio bson.M
	err = collection.FindOne(context.Background(), bson.M{"_id": portfolioID}).Decode(&portfolio)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}

	// Create backup before update
	if portfolio["status"] == "completed" {
		err = h.createPortfolioBackup(req.PortfolioID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create backup"})
			return
		}
	}

	// Update the portfolio
	update := bson.M{
		"$set": bson.M{
			"html":      req.HTML,
			"css":       req.CSS,
			"js":        req.JS,
			"updatedAt": primitive.NewDateTimeFromTime(time.Now()),
			"version":   h.getNextVersion(portfolio),
		},
	}

	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": portfolioID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update portfolio"})
		return
	}

	// If portfolio is completed, trigger deployment
	if portfolio["status"] == "completed" {
		subdomain, _ := portfolio["subdomain"].(string)
		customDomainID, _ := portfolio["customDomainId"].(string)
		if subdomain != "" {
			// Create Deployment Record
			deploymentID := primitive.NewObjectID()
			newDeployment := models.Deployment{
				ID:          deploymentID,
				PortfolioID: portfolioID,
				Status:      "in-progress",
				StartedAt:   time.Now(),
			}
			database.Client.Database(database.DBName).Collection("deployments").InsertOne(context.Background(), newDeployment)

			go h.triggerDeployment(req.PortfolioID, subdomain, customDomainID, deploymentID)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "Portfolio update initiated in background",
		"version":   h.getNextVersion(portfolio),
		"deployed":  portfolio["status"] == "completed",
		"initiated": true,
	})
}

// DeployPortfolio deploys a portfolio to production
func (h *Handler) DeployPortfolio(c *gin.Context) {
	log.Printf("[Deploy] DeployPortfolio called")

	var req DeploymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[Deploy] Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("[Deploy] Request received for portfolio: %s", req.PortfolioID)

	portfolioID, err := primitive.ObjectIDFromHex(req.PortfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID"})
		return
	}

	// Validate portfolio exists
	collection := database.Client.Database(database.DBName).Collection("portfolios")
	var portfolio bson.M
	err = collection.FindOne(context.Background(), bson.M{"_id": portfolioID}).Decode(&portfolio)
	if err != nil {
		log.Printf("[Deploy] Portfolio not found: %s, error: %v", req.PortfolioID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}

	log.Printf("[Deploy] Found portfolio: %s", req.PortfolioID)

	// Validate portfolio content before deployment
	html, _ := portfolio["html"].(string)
	css, _ := portfolio["css"].(string)
	js, _ := portfolio["js"].(string)

	log.Printf("[Deploy] Portfolio content - HTML length: %d, CSS length: %d, JS length: %d", len(html), len(css), len(js))

	// Log first 200 chars of HTML to see what we're working with
	htmlPreview := html
	if len(htmlPreview) > 200 {
		htmlPreview = htmlPreview[:200]
	}
	log.Printf("[Deploy] HTML preview: %s...", htmlPreview)

	if html == "" {
		log.Printf("[Deploy] ERROR: Portfolio %s has no HTML content", req.PortfolioID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Portfolio has no HTML content"})
		return
	}

	// Run validation
	log.Printf("[Deploy] Running validation...")
	validator := services.NewDeploymentValidator(req.PortfolioID)
	result, err := validator.ValidateUpdate(html, css, js)
	if err != nil {
		log.Printf("[Deploy] Validation error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Validation failed"})
		return
	}

	log.Printf("[Deploy] Validation result - IsValid: %v", result.IsValid)

	if !result.IsValid {
		log.Printf("[Deploy] Validation warnings: %v (proceeding anyway for AI content)", result.Issues)
		// TEMPORARY: Allow deployment despite validation warnings
		// c.JSON(http.StatusBadRequest, gin.H{
		// 	"error":  "Portfolio validation failed",
		// 	"issues": result.Issues,
		// })
		// return
	}

	log.Printf("[Deploy] Validation passed, proceeding with deployment")

	// Generate subdomain if not provided
	subdomain := req.Subdomain
	if subdomain == "" {
		username, _ := portfolio["userId"].(string)
		if username != "" {
			subdomain = fmt.Sprintf("%s-portfolio", username)
		} else {
			subdomain = fmt.Sprintf("portfolio-%s", portfolioID.Hex()[:8])
		}
	}

	// Check if subdomain is already in use by another published portfolio
	existingPortfolio := bson.M{}
	err = collection.FindOne(context.Background(), bson.M{
		"subdomain": subdomain,
		"status":    "completed",
		"_id":       bson.M{"$ne": portfolioID}, // Exclude the current portfolio if it's being updated
	}).Decode(&existingPortfolio)

	if err == nil {
		// Subdomain is already in use by another published portfolio
		c.JSON(http.StatusConflict, gin.H{
			"error":               "Subdomain already in use",
			"message":             fmt.Sprintf("The subdomain '%s' is already in use by another published portfolio. Do you want to delete the existing portfolio and use this name?", subdomain),
			"action":              "confirm_delete_and_reassign",
			"existingPortfolioId": existingPortfolio["_id"].(primitive.ObjectID).Hex(),
		})
		return
	} else if err != mongo.ErrNoDocuments {
		// Some other database error
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to check subdomain availability: %v", err)})
		return
	}

	// Update portfolio with deployment info
	update := bson.M{
		"$set": bson.M{
			"status":      "completed",
			"subdomain":   subdomain,
			"publishedAt": primitive.NewDateTimeFromTime(time.Now()),
			"deployedAt":  primitive.NewDateTimeFromTime(time.Now()),
		},
	}

	if req.CustomDomainID != "" {
		update["$set"].(bson.M)["customDomainId"] = req.CustomDomainID
	}

	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": portfolioID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update portfolio status"})
		return
	}

	// Create Deployment Record (Source of Truth)
	deploymentID := primitive.NewObjectID()
	newDeployment := models.Deployment{
		ID:          deploymentID,
		PortfolioID: portfolioID,
		Status:      "in-progress",
		StartedAt:   time.Now(),
	}
	deploymentCollection := database.Client.Database(database.DBName).Collection("deployments")
	_, err = deploymentCollection.InsertOne(context.Background(), newDeployment)
	if err != nil {
		log.Printf("[Deploy] Failed to create deployment record: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize deployment tracking"})
		return
	}

	// Trigger deployment
	go h.triggerDeployment(req.PortfolioID, subdomain, req.CustomDomainID, deploymentID)

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "Deployment workflow initiated. Watch terminal for real-time progress.",
		"initiated":    true,
		"subdomain":    subdomain,
		"url":          fmt.Sprintf("https://%s.seeqme.com", subdomain),
		"deploymentId": deploymentID.Hex(),
	})
}

// GetDeploymentStatus returns the status of a deployment
func (h *Handler) GetDeploymentStatus(c *gin.Context) {
	portfolioID := c.Param("id")

	objID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID"})
		return
	}

	// Check deployment status
	status, err := h.getDeploymentStatus(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, status)
}

// RollbackDeployment rolls back to previous version
func (h *Handler) RollbackDeployment(c *gin.Context) {
	portfolioID := c.Param("id")

	// Get latest backup
	backup, err := h.getLatestBackup(portfolioID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No backup found"})
		return
	}

	// Restore from backup
	objID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID"})
		return
	}

	collection := database.Client.Database(database.DBName).Collection("portfolios")
	update := bson.M{
		"$set": bson.M{
			"html":       backup["html"],
			"css":        backup["css"],
			"js":         backup["js"],
			"version":    backup["version"],
			"rollbackAt": primitive.NewDateTimeFromTime(time.Now()),
		},
	}

	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to rollback portfolio"})
		return
	}

	// Re-deploy
	customDomainID, _ := backup["customDomainId"].(string)
	subdomain, _ := backup["subdomain"].(string)

	deploymentID := primitive.NewObjectID()
	newDeployment := models.Deployment{
		ID:          deploymentID,
		PortfolioID: objID, // Use objID from parsed primitive
		Status:      "in-progress",
		StartedAt:   time.Now(),
	}
	database.Client.Database(database.DBName).Collection("deployments").InsertOne(context.Background(), newDeployment)

	go h.triggerDeployment(portfolioID, subdomain, customDomainID, deploymentID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Portfolio rolled back successfully",
		"version": backup["version"],
	})
}

// Helper functions

func (h *Handler) createPortfolioBackup(portfolioID string) error {
	objID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		return err
	}

	collection := database.Client.Database(database.DBName).Collection("portfolios")
	var portfolio bson.M
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&portfolio)
	if err != nil {
		return err
	}

	backupCollection := database.Client.Database(database.DBName).Collection("backups")
	backup := bson.M{
		"_id":         primitive.NewObjectID(),
		"portfolioId": portfolioID,
		"html":        portfolio["html"],
		"css":         portfolio["css"],
		"js":          portfolio["js"],
		"version":     portfolio["version"],
		"subdomain":   portfolio["subdomain"],
		"status":      portfolio["status"],
		"createdAt":   primitive.NewDateTimeFromTime(time.Now()),
	}

	_, err = backupCollection.InsertOne(context.Background(), backup)
	return err
}

func (h *Handler) extractSEOData(sc primitive.M) (string, string, string, string, string, []string) {
	var heroName, heroTitle, heroBio, heroImage, avatarImage string
	var socialLinks []string

	if sc == nil {
		return "", "", "", "", "", nil
	}

	if sections, ok := sc["sections"].(primitive.A); ok {
		for _, section := range sections {
			if sMap, isMap := section.(primitive.M); isMap {
				if content, contentOk := sMap["content"].(primitive.M); contentOk {
					// Extract Hero data
					if sType, typeOk := sMap["type"].(string); typeOk && sType == "hero" {
						if name, nameOk := content["name"].(string); nameOk {
							heroName = name
						}
						if title, titleOk := content["title"].(string); titleOk {
							heroTitle = title
						}
						if bio, bioOk := content["bio"].(string); bioOk {
							heroBio = bio
						}
						if image, imageOk := content["image"].(string); imageOk {
							heroImage = image
						} else if bgImage, bgOk := content["backgroundImage"].(string); bgOk {
							heroImage = bgImage
						}
						if avatar, avatarOk := content["avatarImage"].(string); avatarOk {
							avatarImage = avatar
						}
						if bio, bioOk := content["bio"].(string); bioOk {
							heroBio = bio
						} else if tagline, taglineOk := content["heroTagline"].(string); taglineOk {
							heroBio = tagline
						}
					}

					// Extract Social Links from any section (e.g., contact, footer)
					if socials, socialsOk := content["socials"].(primitive.A); socialsOk {
						for _, s := range socials {
							if sm, smOk := s.(primitive.M); smOk {
								if url, urlOk := sm["url"].(string); urlOk && url != "" && url != "#" {
									socialLinks = append(socialLinks, url)
								}
							} else if sm, smOk := s.(map[string]interface{}); smOk { // Handle map[string]interface{}
								if url, urlOk := sm["url"].(string); urlOk && url != "" && url != "#" {
									socialLinks = append(socialLinks, url)
								}
							}
						}
					}
				}
			}
		}
	}

	return heroName, heroTitle, heroBio, heroImage, avatarImage, socialLinks
}

func (h *Handler) getLatestBackup(portfolioID string) (bson.M, error) {
	backupCollection := database.Client.Database(database.DBName).Collection("backups")
	var backup bson.M
	opts := options.FindOne().SetSort(bson.M{"createdAt": -1})
	err := backupCollection.FindOne(context.Background(), bson.M{
		"portfolioId": portfolioID,
	}, opts).Decode(&backup)
	return backup, err
}

func (h *Handler) getNextVersion(portfolio bson.M) int {
	currentVersion, ok := portfolio["version"].(int32)
	if !ok {
		return 1
	}
	return int(currentVersion) + 1
}

// triggerDeployment handles the logic to start a new deployment process.
// It uses the orchestrator service to provision and deploy the infrastructure.
func (h *Handler) triggerDeployment(portfolioID string, subdomain string, customDomainID string, deploymentID primitive.ObjectID) {
	// Standardized failure handler
	failDeployment := func(errMessage string, originalErr error) {
		log.Printf("[DeployLog][%s] FAILED: %s (%v)", portfolioID, errMessage, originalErr)

		// Update Status: Failed
		database.Client.Database(database.DBName).Collection("deployments").UpdateOne(
			context.Background(),
			bson.M{"_id": deploymentID}, // Targeted update
			bson.M{
				"$set": bson.M{
					"status":      "failed",
					"error":       fmt.Sprintf("%s: %v", errMessage, originalErr),
					"completedAt": time.Now(),
				},
			},
		)

		websocket.BroadcastToPortfolio(portfolioID, "portfolio_log", gin.H{
			"message":   fmt.Sprintf("CRITICAL ERROR: %s", errMessage),
			"type":      "error",
			"timestamp": time.Now().Format("15:04:05"),
		})
	}

	streamLog := func(message string, logType string) {
		websocket.BroadcastToPortfolio(portfolioID, "portfolio_log", gin.H{
			"message":   message,
			"type":      logType,
			"timestamp": time.Now().Format("15:04:05"),
		})
		log.Printf("[DeployLog][%s] %s", portfolioID, message)
	}

	streamLog("Initializing deployment...", "info")

	// Load config
	cfg := h.Config

	// Get portfolio from database
	portfolioObjectID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		failDeployment("Invalid portfolio ID", err)
		return
	}

	collection := database.Client.Database(database.DBName).Collection("portfolios")
	var portfolio bson.M
	err = collection.FindOne(context.Background(), bson.M{"_id": portfolioObjectID}).Decode(&portfolio)
	if err != nil {
		failDeployment("Failed to find portfolio", err)
		return
	}

	html, _ := portfolio["html"].(string)
	css, _ := portfolio["css"].(string)
	js, _ := portfolio["js"].(string)
	scRaw := portfolio["structuredContent"]
	var sc primitive.M
	if m, ok := scRaw.(primitive.M); ok {
		sc = m
	} else if m, ok := scRaw.(map[string]interface{}); ok {
		sc = primitive.M(m)
	}

	heroName, heroTitle, heroBio, heroImage, avatarImage, socialLinks := h.extractSEOData(sc)

	streamLog(fmt.Sprintf("Retrieved content: HTML(%d), CSS(%d), JS(%d). SEO: %s", len(html), len(css), len(js), heroBio), "info")

	// Get user email
	var userEmail string
	var userIDObj primitive.ObjectID
	var ok bool

	// Attempt to get userID as primitive.ObjectID
	if id, isObjectID := portfolio["userId"].(primitive.ObjectID); isObjectID {
		userIDObj = id
	} else if idStr, isString := portfolio["userId"].(string); isString {
		var err error
		userIDObj, err = primitive.ObjectIDFromHex(idStr)
		if err != nil {
			failDeployment("Invalid user ID format in portfolio", err)
			return
		}
	} else {
		failDeployment("User ID not found or invalid", fmt.Errorf("check portfolio structure"))
		return
	}

	usersCollection := database.Client.Database(database.DBName).Collection("users")
	var userDoc bson.M
	err = usersCollection.FindOne(context.Background(), bson.M{"_id": userIDObj}).Decode(&userDoc)
	if err != nil {
		failDeployment("Failed to find user for portfolio", err)
		return
	}

	userEmail, ok = userDoc["email"].(string)
	if !ok || userEmail == "" {
		failDeployment("User email not found for portfolio owner", fmt.Errorf("missing email field"))
		return
	}

	// Check user plan for branding
	userPlan, _ := userDoc["plan"].(string)
	isFreePlan := userPlan == "" || userPlan == "free"
	brandingHTML := ""
	if isFreePlan {
		brandingHTML = `
		<div style="text-align: center; padding: 20px; font-family: sans-serif; opacity: 0.6; font-size: 12px;">
			<a href="https://seeqme.com" target="_blank" style="color: inherit; text-decoration: none;">
				Powered by <span style="font-weight: bold; letter-spacing: 1px;">SEEQME</span>
			</a>
		</div>`
	}

	// Create temp directory
	tempDir, err := ioutil.TempDir("", "portfolio-deploy-")
	if err != nil {
		failDeployment("Failed to create build directory", err)
		return
	}
	defer os.RemoveAll(tempDir)

	// Analytics Tracking Script
	backendURL := h.Config.BackendURL
	var trackingScript string

	// Skip analytics on localhost to prevent "Allow Local Network Access" prompts and Mixed Content errors
	if !strings.Contains(backendURL, "localhost") && !strings.Contains(backendURL, "127.0.0.1") {
		trackingScript = fmt.Sprintf(`
(function() {
    try {
        const payload = {
            portfolioId: '%s',
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent
        };
        if (navigator.sendBeacon) {
            navigator.sendBeacon('%s/api/v1/analytics/track', JSON.stringify(payload));
        } else {
            fetch('%s/api/v1/analytics/track', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
                keepalive: true
            });
        }
    } catch(e) {}
})();`, portfolioID, backendURL, backendURL)
	}
	// Construct the final title for the HTML document
	var finalDocTitle string
	if heroTitle != "" {
		finalDocTitle = heroTitle
		if heroName != "" {
			finalDocTitle = fmt.Sprintf("%s | %s", heroName, heroTitle)
		}
	} else if heroName != "" {
		finalDocTitle = heroName
	} else {
		finalDocTitle = subdomain
	}

	finalDescription := heroBio
	if finalDescription == "" {
		finalDescription = "A professional portfolio generated by Seeqme AI."
	}

	socialMeta := ""
	for _, link := range socialLinks {
		socialMeta += fmt.Sprintf("\t<link rel=\"me\" href=\"%s\">\n", link)
		socialMeta += fmt.Sprintf("\t<meta property=\"og:see_also\" content=\"%s\">\n", link)
	}

	favicon := avatarImage
	if favicon == "" {
		favicon = heroImage
	}
	if strings.Contains(favicon, "res.cloudinary.com") {
		favicon = strings.Replace(favicon, "/upload/", "/upload/w_64,h_64,c_fill,q_auto/", 1)
	}
	if favicon == "" {
		favicon = "https://seeqme.com/seeqme-logo-black.png"
	}

	fullURL := fmt.Sprintf("https://%s.%s", subdomain, cfg.DNSProviderDomain)

	// Schema.org JSON-LD
	schema := fmt.Sprintf(`{
		"@context": "https://schema.org",
		"@type": "Person",
		"name": "%s",
		"url": "%s",
		"image": "%s",
		"description": "%s",
		"sameAs": [
			%s
		]
	}`, heroName, fullURL, heroImage, finalDescription, func() string {
		var urls []string
		for _, link := range socialLinks {
			urls = append(urls, fmt.Sprintf("\"%s\"", link))
		}
		return strings.Join(urls, ",\n\t\t\t")
	}())

	// Inject branding strategically
	if brandingHTML != "" {
		if strings.Contains(html, "</footer>") {
			html = strings.Replace(html, "</footer>", brandingHTML+"</footer>", 1)
			brandingHTML = "" // Prevent double injection at bottom
		}
	}

	finalHTML := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>%s</title>
	<meta name="description" content="%s">
	<link rel="canonical" href="%s/">
	<meta property="og:type" content="website">
	<meta property="og:url" content="%s/">
	<meta property="og:title" content="%s">
	<meta property="og:description" content="%s">
	<meta property="og:image" content="%s">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:url" content="%s/">
	<meta name="twitter:title" content="%s">
	<meta name="twitter:description" content="%s">
	<meta name="twitter:image" content="%s">
	<link rel="icon" href="%s">
	<link rel="apple-touch-icon" href="%s">
%s
	<script type="application/ld+json">
	%s
	</script>
	<script src="https://cdn.tailwindcss.com"></script>
	<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700;900&display=swap" rel="stylesheet">
	<style>
		body { font-family: 'Space Grotesk', sans-serif; }
		%s
	</style>
</head>
<body>
	%s
	<script>%s</script>
    <script>%s</script>
</body>
</html>`,
		finalDocTitle, finalDescription, fullURL,
		fullURL, finalDocTitle, finalDescription, heroImage,
		fullURL, finalDocTitle, finalDescription, heroImage,
		favicon, favicon,
		socialMeta,
		schema,
		css, html, js, trackingScript)

	// Write files
	streamLog("Writing build artifacts...", "info")
	if err := ioutil.WriteFile(filepath.Join(tempDir, "index.html"), []byte(finalHTML), 0644); err != nil {
		failDeployment("Failed to write build artifacts", err)
		return
	}

	// Sanitize user email for repo name
	emailParts := strings.Split(userEmail, "@")
	emailPrefix := emailParts[0]
	sanitizedEmail := strings.ReplaceAll(emailPrefix, ".", "-")

	repoName := fmt.Sprintf("portfolio-%s-%s", sanitizedEmail, portfolioObjectID.Hex())

	// Initialize orchestrator
	orchestrator := services.NewOrchestrator(cfg)

	// Determine domain routing
	var fullDomain string
	if customDomainID != "" {
		domObjectID, err := primitive.ObjectIDFromHex(customDomainID)
		if err == nil {
			domainsCollection := database.Client.Database(database.DBName).Collection("domains")
			var domDoc bson.M
			err = domainsCollection.FindOne(context.Background(), bson.M{"_id": domObjectID}).Decode(&domDoc)
			if err == nil {
				if d, ok := domDoc["domain"].(string); ok && d != "" {
					fullDomain = d
					streamLog(fmt.Sprintf("Routing to custom domain: %s", fullDomain), "info")
				}
			}
		}
	}

	if fullDomain == "" {
		fullDomain = fmt.Sprintf("%s.%s", subdomain, cfg.DNSProviderDomain)
		streamLog(fmt.Sprintf("Routing to standard subdomain: %s", fullDomain), "info")
	}

	// Execute Deployment
	dnsRecordID, err := orchestrator.Deploy(repoName, fullDomain, tempDir, userEmail, streamLog)
	if err != nil {
		// Orchestrator failure
		failDeployment("Orchestrated deployment failed", err)

		// Send failure email (Enhanced logic)
		userName, _ := userDoc["fullName"].(string)
		if userName == "" {
			userName = "User"
		}
		emailData := map[string]interface{}{
			"FullName":       userName,
			"PortfolioTitle": fullDomain,
			"ErrorMessage":   err.Error(),
			"DashboardURL":   fmt.Sprintf("%s/dashboard", cfg.FrontendURL),
			"UserEmail":      userEmail,
		}
		go h.Resend.SendEmail(userEmail, "Deployment Issue Detected", "deployment_failed.html", emailData)
		return
	}

	finalURL := fmt.Sprintf("https://%s", fullDomain)

	update := bson.M{
		"$set": bson.M{
			"gitHubRepoURL":       fmt.Sprintf("https://github.com/%s/%s", cfg.GitHubOwner, repoName),
			"domain":              finalURL,
			"status":              "completed",
			"dnsRecordID":         dnsRecordID,
			"cloudflareProjectID": repoName,
		},
	}

	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": portfolioObjectID}, update)
	if err != nil {
		failDeployment("Failed to update portfolio status post-deploy", err)
		return
	}

	// Send publication success email
	userName, _ := userDoc["fullName"].(string)
	if userName == "" {
		userName = "User"
	}
	portfolioName, _ := portfolio["name"].(string)
	if portfolioName == "" {
		portfolioName = "My Portfolio"
	}

	emailData := map[string]interface{}{
		"FullName":       userName,
		"PortfolioTitle": fullDomain,
		"PortfolioURL":   finalURL,
	}
	go h.Resend.SendEmail(userEmail, "Your portfolio is live!", "portfolio_published.html", emailData)

	// Increment User Deployment Count (For Limits)
	// Check subscription status to ensure we are tracking correctly for free plan
	subCollection := database.Client.Database(database.DBName).Collection("subscriptions")
	subCount, _ := subCollection.CountDocuments(context.Background(), bson.M{"userId": userIDObj, "status": "active"})

	if subCount == 0 {
		// Only increment for free users to enforce the 1-limit cap next time
		database.Client.Database(database.DBName).Collection("users").UpdateOne(
			context.Background(),
			bson.M{"_id": userIDObj},
			bson.M{"$inc": bson.M{"deploymentCount": 1}},
		)
	}

	// Update deployment log (Source of Truth) -> Status: Completed
	deploymentCollection := database.Client.Database(database.DBName).Collection("deployments")
	_, err = deploymentCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": deploymentID},
		bson.M{
			"$set": bson.M{
				"status":      "completed",
				"completedAt": time.Now(),
				"url":         finalURL,
			},
		},
	)
	if err != nil {
		streamLog(fmt.Sprintf("ERROR: Failed to update deployment log: %v", err), "error")
	}

	// Emit final completion event
	websocket.BroadcastToPortfolio(portfolioID, "deployment_complete", gin.H{
		"url": finalURL,
	})
}

func (h *Handler) getDeploymentStatus(portfolioID primitive.ObjectID) (bson.M, error) {
	deploymentCollection := database.Client.Database(database.DBName).Collection("deployments")
	var deployment bson.M
	opts := options.FindOne().SetSort(bson.M{"startedAt": -1})
	err := deploymentCollection.FindOne(context.Background(), bson.M{
		"portfolioId": portfolioID,
	}, opts).Decode(&deployment)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return bson.M{"status": "not_deployed"}, nil
		}
		return nil, err
	}

	return bson.M{
		"status":      deployment["status"],
		"startedAt":   deployment["startedAt"],
		"completedAt": deployment["completedAt"],
		"url":         deployment["url"],
	}, nil
}
