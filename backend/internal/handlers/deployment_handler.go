package handlers

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
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
	nextVersion := h.getNextVersion(portfolio)
	update := bson.M{
		"$set": bson.M{
			"html":      req.HTML,
			"css":       req.CSS,
			"js":        req.JS,
			"updatedAt": primitive.NewDateTimeFromTime(time.Now()),
			"version":   nextVersion,
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
		"version":   nextVersion,
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

	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}
	userIDObj, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Validate portfolio exists
	collection := database.Client.Database(database.DBName).Collection("portfolios")
	var portfolio bson.M
	err = collection.FindOne(context.Background(), bson.M{"_id": portfolioID, "userId": userIDObj}).Decode(&portfolio)
	if err != nil {
		log.Printf("[Deploy] Portfolio not found: %s, error: %v", req.PortfolioID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}

	status, _ := portfolio["status"].(string)

	// Check Hedera x402 payment as an alternative to subscription.
	// If a valid Hedera payment exists for this user, allow the deployment regardless of plan.
	hederaPaid := ConsumeHederaPayment(c, userIDObj)

	if !hederaPaid {
		// Enforce plan limits server-side to prevent bypassing frontend checks.
		var subscription models.Subscription
		subErr := database.Client.Database(database.DBName).Collection("subscriptions").
			FindOne(context.Background(), bson.M{"userId": userIDObj, "status": "active"}).
			Decode(&subscription)

		planID := "free"
		if subErr == nil && subscription.PlanID != "" {
			planID = strings.ToLower(subscription.PlanID)
		}

		if planID == "free" {
			c.JSON(http.StatusPaymentRequired, gin.H{
				"error": "A paid plan or Hedera payment is required to deploy your portfolio.",
			})
			return
		}

		if planID == "pro" && status != "completed" {
			deployedCount, countErr := collection.CountDocuments(context.Background(), bson.M{
				"userId": userIDObj,
				"status": "completed",
			})
			if countErr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate plan limits"})
				return
			}
			if deployedCount >= 1 {
				c.JSON(http.StatusPaymentRequired, gin.H{
					"error": "Professional plan allows only one deployed portfolio. Upgrade to Premium to deploy more.",
				})
				return
			}
		}
	} else {
		log.Printf("[Deploy] Hedera payment accepted for user %s — skipping subscription check", userIDObj.Hex())
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
		existingID := ""
		if oid, ok := existingPortfolio["_id"].(primitive.ObjectID); ok {
			existingID = oid.Hex()
		}
		c.JSON(http.StatusConflict, gin.H{
			"error":               "Subdomain already in use",
			"message":             fmt.Sprintf("The subdomain '%s' is already in use by another published portfolio. Do you want to delete the existing portfolio and use this name?", subdomain),
			"action":              "confirm_delete_and_reassign",
			"existingPortfolioId": existingID,
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

	// Send FCM notification for deployment initiated
	go h.sendFCMNotificationToUser(context.Background(), userIDObj,
		"Portfolio Deployment Initiated",
		fmt.Sprintf("Your portfolio '%s' is now building. We'll notify you when it's live!", subdomain),
		map[string]string{"portfolioId": req.PortfolioID, "status": "building"})

	// Trigger deployment
	go h.triggerDeployment(req.PortfolioID, subdomain, req.CustomDomainID, deploymentID)

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "Deployment workflow initiated. Watch terminal for real-time progress.",
		"initiated":    true,
		"subdomain":    subdomain,
		"url":          fmt.Sprintf("https://%s.%s", subdomain, h.Config.DNSProviderDomain),
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

// triggerDeployment handles the logic to start a new deployment process.
// It uses the orchestrator service to provision and deploy the infrastructure.
func (h *Handler) triggerDeployment(portfolioID string, subdomain string, customDomainID string, deploymentID primitive.ObjectID) {
	sessionID := deploymentID.Hex()

	// Mirroring failure to session
	failDeployment := func(errMessage string, originalErr error) {
		services.GlobalSessionManager.AddLog(sessionID, "CRITICAL ERROR: "+errMessage)
		services.GlobalSessionManager.CloseSession(sessionID, "failed", "")

		log.Printf("[DeployLog][%s] FAILED: %s (%v)", portfolioID, errMessage, originalErr)

		// Update Deployment record: failed
		database.Client.Database(database.DBName).Collection("deployments").UpdateOne(
			context.Background(),
			bson.M{"_id": deploymentID},
			bson.M{
				"$set": bson.M{
					"status":      "failed",
					"error":       fmt.Sprintf("%s: %v", errMessage, originalErr),
					"completedAt": time.Now(),
				},
			},
		)

		// ✅ Roll back the portfolio so it's not stuck as "completed"
		if portfolioObjectID, parseErr := primitive.ObjectIDFromHex(portfolioID); parseErr == nil {
			database.Client.Database(database.DBName).Collection("portfolios").UpdateOne(
				context.Background(),
				bson.M{"_id": portfolioObjectID},
				bson.M{
					"$set": bson.M{
						"status":    "pending",
						"domain":    "",
						"subdomain": "",
					},
					"$unset": bson.M{
						"publishedAt": "",
						"deployedAt":  "",
					},
				},
			)
			log.Printf("[DeployLog][%s] Portfolio rolled back to 'pending' after failed deployment", portfolioID)
		}

		websocket.BroadcastToPortfolio(portfolioID, "portfolio_log", gin.H{
			"message":   fmt.Sprintf("CRITICAL ERROR: %s", errMessage),
			"type":      "error",
			"timestamp": time.Now().Format("15:04:05"),
		})

		// Also broadcast a status event so the frontend knows the portfolio is no longer live
		websocket.BroadcastToPortfolio(portfolioID, "deployment_failed", gin.H{
			"portfolioId": portfolioID,
			"error":       fmt.Sprintf("%s: %v", errMessage, originalErr),
			"timestamp":   time.Now().Format("15:04:05"),
		})
	}

	streamLog := func(message string, logType string) {
		// Mirror to SessionManager
		services.GlobalSessionManager.AddLog(sessionID, message)

		websocket.BroadcastToPortfolio(portfolioID, "portfolio_log", gin.H{
			"message":   message,
			"type":      logType,
			"timestamp": time.Now().Format("15:04:05"),
		})
		log.Printf("[DeployLog][%s] %s", portfolioID, message)
	}
	cfg := h.Config

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

	// Create session for tracking
	userIDStr := ""
	if uid, ok := portfolio["userId"].(primitive.ObjectID); ok {
		userIDStr = uid.Hex()
	} else if uidStr, ok := portfolio["userId"].(string); ok {
		userIDStr = uidStr
	}

	services.GlobalSessionManager.CreateSession(userIDStr, portfolioID, sessionID, "deployment")

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

	// Resolve the final public domain FIRST so all SEO tags, canonical URLs,
	// sitemap, and robots.txt use the correct address (especially for custom domains).
	fullDomain := fmt.Sprintf("%s.%s", subdomain, cfg.DNSProviderDomain)
	if customDomainID != "" {
		domObjectID, err := primitive.ObjectIDFromHex(customDomainID)
		if err == nil {
			domainsCollection := database.Client.Database(database.DBName).Collection("domains")
			var domDoc bson.M
			if err = domainsCollection.FindOne(context.Background(), bson.M{"_id": domObjectID}).Decode(&domDoc); err == nil {
				if d, ok := domDoc["domain"].(string); ok && d != "" {
					fullDomain = d
				}
			}
		}
	}
	fullURL := fmt.Sprintf("https://%s", fullDomain)

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

	// Check subscription plan for branding
	planId := ""
	var subscription models.Subscription
	subErr := database.Client.Database(database.DBName).
		Collection("subscriptions").
		FindOne(context.Background(), bson.M{"userId": userIDObj, "status": "active"}).
		Decode(&subscription)
	if subErr == nil {
		planId = strings.ToLower(subscription.PlanID)
	}
	showBranding := planId == "pro"
	brandingHTML := ""
	if showBranding {
		brandingHTML = `
		<div style="text-align: center; padding: 20px; font-family: sans-serif; opacity: 0.6; font-size: 12px;">
			<a href="https://seeqme.com" target="_blank" style="color: inherit; text-decoration: none;">
				Powered by <span style="font-weight: bold; letter-spacing: 1px;">SEEQME</span>
			</a>
		</div>`
	}

	// Create temp directory
	tempDir, err := os.MkdirTemp("", "portfolio-deploy-")
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
        var payload = JSON.stringify({
            portfolioId: '%s',
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent
        });
        var endpoint = '%s/api/v1/analytics/track';
        if (navigator.sendBeacon) {
            navigator.sendBeacon(endpoint, new Blob([payload], {type: 'application/json'}));
        } else {
            fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: payload,
                keepalive: true
            });
        }
    } catch(e) {}
})();`, portfolioID, backendURL)
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
		// Circular/Rounded Square Favicon: 64x64, Fill, Rounded Corners (r_16), PNG for safeguards
		favicon = strings.Replace(favicon, "/upload/", "/upload/w_64,h_64,c_fill,r_16,f_png,q_auto/", 1)
	}
	if favicon == "" {
		favicon = "https://seeqme.com/seeqme-logo-black.png"
	}

	// Download the favicon into the deploy bundle so it's served from the same domain.
	// Google only shows favicons that are hosted on the same origin as the page.
	faviconLocalPath := filepath.Join(tempDir, "favicon.png")
	if dlErr := downloadFile(favicon, faviconLocalPath); dlErr == nil {
		favicon = "/favicon.png" // serve same-domain relative path
	} else {
		log.Printf("[Deploy] Could not download favicon (%v) — using remote URL as fallback", dlErr)
	}

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

	// Inject branding before </body> for reliability (not </footer> which may not exist)
	if brandingHTML != "" {
		if strings.Contains(html, "</body>") {
			html = strings.Replace(html, "</body>", brandingHTML+"</body>", 1)
			brandingHTML = "" // Prevent double injection at bottom
		}
	}

	// Check if the HTML is already a complete document (Manifest V2)
	isCompleteDoc := strings.Contains(strings.ToLower(html), "<!doctype")

	// SEO head block — injected into both complete docs and legacy-wrapped HTML
	seoHead := fmt.Sprintf(
		"\t<meta charset=\"UTF-8\">\n"+
			"\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"+
			"\t<meta name=\"robots\" content=\"index, follow\">\n"+
			"\t<title>%s</title>\n"+
			"\t<meta name=\"description\" content=\"%s\">\n"+
			"\t<link rel=\"canonical\" href=\"%s/\">\n"+
			"\t<meta property=\"og:type\" content=\"website\">\n"+
			"\t<meta property=\"og:url\" content=\"%s/\">\n"+
			"\t<meta property=\"og:title\" content=\"%s\">\n"+
			"\t<meta property=\"og:description\" content=\"%s\">\n"+
			"\t<meta property=\"og:image\" content=\"%s\">\n"+
			"\t<meta name=\"twitter:card\" content=\"summary_large_image\">\n"+
			"\t<meta name=\"twitter:url\" content=\"%s/\">\n"+
			"\t<meta name=\"twitter:title\" content=\"%s\">\n"+
			"\t<meta name=\"twitter:description\" content=\"%s\">\n"+
			"\t<meta name=\"twitter:image\" content=\"%s\">\n"+
			"\t<link rel=\"icon\" href=\"%s\">\n"+
			"\t<link rel=\"apple-touch-icon\" href=\"%s\">\n"+
			"%s"+
			"\t<script type=\"application/ld+json\">%s</script>\n",
		finalDocTitle, finalDescription,
		fullURL, fullURL, finalDocTitle, finalDescription, heroImage,
		fullURL, finalDocTitle, finalDescription, heroImage,
		favicon, favicon,
		socialMeta, schema,
	)

	var finalHTML string
	if isCompleteDoc {
		streamLog("Full document detected — injecting SEO tags and analytics.", "info")
		finalHTML = html

		// Inject SEO head block before </head> (replace once; strip charset/title if already present)
		if strings.Contains(finalHTML, "</head>") {
			finalHTML = strings.Replace(finalHTML, "</head>", seoHead+"</head>", 1)
		} else if idx := strings.Index(strings.ToLower(finalHTML), "<head>"); idx != -1 {
			finalHTML = finalHTML[:idx+6] + "\n" + seoHead + finalHTML[idx+6:]
		} else {
			// No <head> at all — prepend a minimal one
			finalHTML = strings.Replace(finalHTML, "<html", "<html><head>\n"+seoHead+"</head>", 1)
		}

		// Inject analytics tracking before </body>
		if trackingScript != "" {
			if strings.Contains(finalHTML, "</body>") {
				finalHTML = strings.Replace(finalHTML, "</body>", fmt.Sprintf("<script>%s</script>\n</body>", trackingScript), 1)
			} else {
				finalHTML += fmt.Sprintf("<script>%s</script>", trackingScript)
			}
		}
	} else {
		// Legacy behavior: wrap in full HTML template
		finalHTML = fmt.Sprintf("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n%s"+
			"\t<script src=\"https://cdn.tailwindcss.com\"></script>\n"+
			"\t<link href=\"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700;900&display=swap\" rel=\"stylesheet\">\n"+
			"\t<style>body { font-family: 'Space Grotesk', sans-serif; }\n%s\n\t</style>\n"+
			"</head>\n<body>\n%s\n<script>%s</script>\n<script>%s</script>\n</body>\n</html>",
			seoHead, css, html, js, trackingScript)
	}

	// Write files
	streamLog("Writing build artifacts...", "info")
	if err := os.WriteFile(filepath.Join(tempDir, "index.html"), []byte(finalHTML), 0644); err != nil {
		failDeployment("Failed to write build artifacts", err)
		return
	}

	// Generate robots.txt
	robotsTxt := fmt.Sprintf("User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml", fullURL)
	if err := os.WriteFile(filepath.Join(tempDir, "robots.txt"), []byte(robotsTxt), 0644); err != nil {
		log.Printf("[Deploy] Failed to write robots.txt: %v", err)
	}

	// Generate sitemap.xml
	sitemap := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>%s/</loc>
    <lastmod>%s</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`, fullURL, time.Now().Format("2006-01-02"))
	if err := os.WriteFile(filepath.Join(tempDir, "sitemap.xml"), []byte(sitemap), 0644); err != nil {
		log.Printf("[Deploy] Failed to write sitemap.xml: %v", err)
	}

	repoName := fmt.Sprintf("portfolio-%s", portfolioObjectID.Hex())

	// Initialize orchestrator
	orchestrator := services.NewOrchestrator(cfg)

	streamLog(fmt.Sprintf("Routing to domain: %s", fullDomain), "info")

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

	// Wait for edge reachability before reporting completed to reduce immediate 522s after deploy.
	propagationPending := false
	if err := h.waitForSiteReadiness(finalURL, 3*time.Minute, 10*time.Second, streamLog); err != nil {
		propagationPending = true
		// We still continue as deployment can be valid while DNS/edge propagation completes.
		streamLog("Edge propagation is still in progress. The site may take 1-3 minutes to become reachable globally.", "warn")
	}

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
	emailData := map[string]interface{}{
		"FullName":       userName,
		"PortfolioTitle": fullDomain,
		"PortfolioURL":   finalURL,
	}
	go h.Resend.SendEmail(userEmail, "Your portfolio is live!", "portfolio_published.html", emailData)

	// Send FCM notification for deployment completed
	go h.sendFCMNotificationToUser(context.Background(), userIDObj,
		"Portfolio Live!",
		fmt.Sprintf("Your portfolio '%s' has been successfully deployed and is now live at %s!", subdomain, finalURL),
		map[string]string{"portfolioId": portfolioID, "status": "deployed", "url": finalURL})

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
		"url":                finalURL,
		"propagationPending": propagationPending,
	})

	// Close session in SessionManager
	services.GlobalSessionManager.CloseSession(sessionID, "completed", finalURL)

	// Ping search engines so they discover and index the new portfolio quickly
	go pingSearchEngines(fmt.Sprintf("https://%s/sitemap.xml", fullDomain))
}

func (h *Handler) sendFCMNotificationToUser(ctx context.Context, userID primitive.ObjectID, title, body string, data map[string]string) {
	if h.FCMService == nil {
		log.Println("[FCM] FCM Service not initialized. Skipping notification.")
		return
	}

	var user models.User
	err := database.Client.Database(database.DBName).Collection("users").FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		log.Printf("[FCM] Failed to find user %s for notification: %v", userID.Hex(), err)
		return
	}

	if user.FCMToken == "" || user.IsMock {
		log.Printf("[FCM] User %s has no FCM token or is a mock user. Skipping notification.", userID.Hex())
		return
	}

	err = h.FCMService.SendNotificationWithData(user.FCMToken, title, body, data)
	if err != nil {
		log.Printf("[FCM] Failed to send FCM notification to user %s (token %s): %v", userID.Hex(), user.FCMToken, err)
	} else {
		log.Printf("[FCM] Successfully sent FCM notification to user %s (token %s)", userID.Hex(), user.FCMToken)
	}
}

// downloadFile fetches srcURL and writes the body to destPath.
func downloadFile(srcURL, destPath string) error {
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(srcURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP %d", resp.StatusCode)
	}
	f, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = io.Copy(f, resp.Body)
	return err
}

func pingSearchEngines(sitemapURL string) {
	encoded := url.QueryEscape(sitemapURL)
	endpoints := []string{
		"https://www.google.com/ping?sitemap=" + encoded,
		"https://www.bing.com/ping?sitemap=" + encoded,
	}
	client := &http.Client{Timeout: 10 * time.Second}
	for _, endpoint := range endpoints {
		resp, err := client.Get(endpoint)
		if err != nil {
			log.Printf("[SEO] Ping failed (%s): %v", endpoint, err)
			continue
		}
		resp.Body.Close()
		log.Printf("[SEO] Pinged %s → HTTP %d", endpoint, resp.StatusCode)
	}
}

func (h *Handler) waitForSiteReadiness(url string, timeout time.Duration, interval time.Duration, streamLog func(string, string)) error {
	deadline := time.Now().Add(timeout)
	client := &http.Client{Timeout: 8 * time.Second}
	attempt := 0

	for time.Now().Before(deadline) {
		attempt++
		streamLog(fmt.Sprintf("Verifying edge readiness (attempt %d)...", attempt), "info")

		resp, err := client.Get(url)
		if err == nil && resp != nil {
			status := resp.StatusCode
			resp.Body.Close()
			if status >= 200 && status < 400 {
				streamLog("Edge network ready. Site is reachable.", "success")
				return nil
			}
			// 522 and other 5xx are treated as not-ready yet.
			streamLog(fmt.Sprintf("Edge not ready yet (HTTP %d). Retrying...", status), "warn")
		} else if err != nil {
			streamLog(fmt.Sprintf("Edge check pending (%v). Retrying...", err), "warn")
		}

		time.Sleep(interval)
	}

	return fmt.Errorf("timed out waiting for site readiness: %s", url)
}
