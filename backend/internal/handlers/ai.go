package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
	"seeqmeai/backend/internal/services"
	"seeqmeai/backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (h *Handler) GeneratePortfolio(c *gin.Context) {
	var req GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}
	provider := req.Provider
	if provider == "" {
		provider = h.Config.AIProvider
	}
	if provider == "" {
		provider = "gemini"
	}

	// --- Limit Enforcement Logic (Authenticated Users Only) ---
	if userID != nil {
		userObjID, _ := primitive.ObjectIDFromHex(userID.(string))
		subCollection := database.Client.Database(database.DBName).Collection("subscriptions")
		subCount, _ := subCollection.CountDocuments(context.Background(), bson.M{"userId": userObjID, "status": "active"})

		if subCount == 0 {
			userCollection := database.Client.Database(database.DBName).Collection("users")
			var userDoc models.User
			err := userCollection.FindOne(context.Background(), bson.M{"_id": userObjID}).Decode(&userDoc)
			if err == nil {
				if userDoc.PromptCount >= 3 {
					c.JSON(http.StatusPaymentRequired, gin.H{
						"error": "Free Plan Limit Reached. Upgrade to continue building.",
						"code":  "LIMIT_REACHED",
					})
					return
				}
				// Increment Usage
				_, _ = userCollection.UpdateOne(context.Background(), bson.M{"_id": userObjID}, bson.M{"$inc": bson.M{"promptCount": 1}})
			}
		}
	}

	aiProvider, err := services.NewAIProvider(provider)
	if err != nil {
		log.Printf("[AI] Error creating provider %s: %v", provider, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[AI] Starting portfolio generation with provider: %s", provider)

	// Helper for streaming logs
	sessionID := req.SessionID
	if sessionID == "" {
		sessionID = primitive.NewObjectID().Hex()
	}
	// Determine Portfolio ID
	var portfolioID primitive.ObjectID
	isExisting := false
	if req.PortfolioID != "" {
		if id, err := primitive.ObjectIDFromHex(req.PortfolioID); err == nil {
			portfolioID = id
			isExisting = true

			// Ownership check for existing portfolio
			var existingPortfolio models.Portfolio
			err := database.Client.Database(database.DBName).Collection("portfolios").FindOne(
				context.Background(),
				bson.M{"_id": portfolioID},
			).Decode(&existingPortfolio)

			if err == nil {
				// Verify ownership
				subjectID, _ := c.Get("subjectId")
				subjectIDStr := ""
				if subjectID != nil {
					subjectIDStr = subjectID.(string)
				}

				canEdit := false
				if userID != nil && existingPortfolio.UserID.Hex() == userID.(string) {
					canEdit = true
				} else if existingPortfolio.AnonymousID == subjectIDStr {
					canEdit = true
				}

				if !canEdit {
					c.JSON(http.StatusForbidden, gin.H{"error": "Access denied to portfolio"})
					return
				}
			}
		}
	}

	if !isExisting {
		portfolioID = primitive.NewObjectID()
	}

	// If it's a redesign/remix of an existing portfolio, use its ID for logs
	// Otherwise, broadcast to the user room for initial creation logs
	logTargetID := portfolioID.Hex()
	if req.PortfolioID != "" {
		logTargetID = req.PortfolioID
	}

	streamLog := func(message string, logType string) {
		// Always broadcast to session room for technical progress tracking
		websocket.Manager.BroadcastToRoom("session:"+sessionID, "portfolio_log", gin.H{
			"message":   message,
			"type":      logType,
			"timestamp": time.Now().Format("15:04:05"),
		})

		// Use SubjectID for broad room broadcasting (covers both authenticated and anonymous)
		subjectID, _ := c.Get("subjectId")
		if subjectID != nil {
			websocket.BroadcastToUser(subjectID.(string), "portfolio_log", gin.H{
				"message":   message,
				"type":      logType,
				"timestamp": time.Now().Format("15:04:05"),
			})
		}

		log.Printf("[AI Log][%s] %s", logTargetID, message)
	}

	streamLog("Handshake established. Initializing AI core...", "info")
	streamLog(fmt.Sprintf("Provider selected: %s", provider), "info")
	// Detect and scrape LinkedIn URL if present
	linkedinURLPattern := `https?://[a-z]{2,3}\.linkedin\.com/in/[a-zA-Z0-9-]+`
	re := regexp.MustCompile(linkedinURLPattern)
	linkedinURL := re.FindString(req.Prompt)

	promptWithLinkedIn := req.Prompt
	if linkedinURL != "" {
		streamLog(fmt.Sprintf("LinkedIn trail detected: %s. Initiating extraction...", linkedinURL), "info")
		profile, err := h.ScrapeLinkedInProfile(linkedinURL)
		if err == nil {
			streamLog(fmt.Sprintf("Profile DNA extracted for %s. Weaving into blueprint...", profile.Name), "success")
			promptWithLinkedIn += "\n\n=== ENRICHED PROFILE DATA (LINKEDIN) ===\n" + generatePortfolioPrompt(*profile)
		} else {
			streamLog(fmt.Sprintf("Warning: LinkedIn extraction failed: %v", err), "warn")
		}
	}

	// Read file content (URL vs Raw Text) and append to prompt
	promptWithFiles := promptWithLinkedIn
	for _, file := range req.Files {
		var content string
		if strings.HasPrefix(file.Content, "http://") || strings.HasPrefix(file.Content, "https://") {
			// It's a URL (e.g. Cloudinary)
			resp, err := http.Get(file.Content)
			if err != nil {
				log.Printf("[AI] Failed to download file %s: %v", file.Filename, err)
				continue
			}
			defer resp.Body.Close()
			body, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				log.Printf("[AI] Failed to read body of file %s: %v", file.Filename, err)
				continue
			}
			content = string(body)
		} else {
			// It's raw text (e.g. from local CV extraction)
			content = file.Content
		}

		if len(content) > 0 {
			promptWithFiles += fmt.Sprintf("\n\n--- File: %s (%s) ---\n%s", file.Filename, file.Type, content)
		}
	}

	// AUTO-DETECT NICHE from CV content if not explicitly provided
	detectedNiche := req.Niche
	if detectedNiche == "" && len(promptWithFiles) > 0 {
		detectedNiche = services.DetectNiche(promptWithFiles)
		streamLog(fmt.Sprintf("Niche auto-detected: %s", detectedNiche), "info")
	}

	// Add niche and theme context to prompt
	if detectedNiche != "" {
		promptWithFiles += fmt.Sprintf("\n\nNiche/Profession: %s", detectedNiche)

		// Add template-based architectural guidance
		// Build template library from registry blueprints
		templateLibrary := services.BuildTemplateLibraryFromRegistry()
		if templateLibrary != nil && len(templateLibrary.Blueprints) > 0 {
			templateGuidance := services.GenerateManifestGuidance(templateLibrary, detectedNiche)
			promptWithFiles += fmt.Sprintf("\n\n%s", templateGuidance)
			streamLog(fmt.Sprintf("Applied template-based architecture for %s using %d blueprints", detectedNiche, len(templateLibrary.Blueprints)), "info")
		} else {
			// Fallback to niche blueprint if template library not available
			blueprint := services.GetNicheBlueprint(detectedNiche)
			promptWithFiles += fmt.Sprintf("\n\n%s", blueprint)
			streamLog(fmt.Sprintf("Applied niche-based guidance for %s", detectedNiche), "info")
		}
	}
	if req.Theme != "" {
		promptWithFiles += fmt.Sprintf("\n\nTheme Preference: %s", req.Theme)
	}

	streamLog("Analyzing input and synthesizing portfolio...", "info")

	var generatedCode string
	subID, ok := c.Get("subjectId")
	sessionUserID := c.ClientIP()
	if ok {
		sessionUserID = subID.(string)
	}
	session := services.GlobalSessionManager.CreateSession(sessionUserID, portfolioID.Hex(), sessionID)

	// Simplified generation call using centralized prompt from services
	sysPrompt := services.PortfolioSystemPrompt
	if req.SystemPrompt != "" {
		sysPrompt = req.SystemPrompt
	}

	generatedCode, err = aiProvider.Generate(promptWithFiles, sysPrompt, func(chunk string) {
		websocket.Manager.BroadcastToRoom("session:"+session.ID, "ai:chunk", chunk)
	})

	if err != nil {
		log.Printf("[AI] Generation failed: %v", err)
		if strings.Contains(err.Error(), "status 429") || strings.Contains(err.Error(), "RESOURCE_EXHAUSTED") {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "AI Quota Exceeded. Please try again later.",
				"details": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate portfolio: " + err.Error()})
		return
	}

	streamLog("Blueprint generated. Parsing structure...", "info")

	log.Printf("[AI] Raw response from provider: %s", generatedCode)
	var manifest models.Manifest
	if err := json.Unmarshal([]byte(generatedCode), &manifest); err != nil {
		log.Printf("[AI] Failed to parse Manifest: %v\nRaw Code: %s", err, generatedCode)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse Manifest: " + err.Error()})
		return
	}

	// Save the portfolio to database
	portfolioDoc := bson.M{
		"_id":               portfolioID,
		"name":              "AI Generated Portfolio",
		"slug":              primitive.NewObjectID().Hex()[:8],
		"structuredContent": manifest, // The Manifest is now the structured content
		"html":              "",       // Will be populated by frontend renderer
		"css":               "",
		"js":                "",
		"status":            "draft",
		"createdAt":         primitive.NewDateTimeFromTime(time.Now()),
	}

	if userID != nil {
		userObjID, _ := primitive.ObjectIDFromHex(userID.(string))
		portfolioDoc["userId"] = userObjID
	}
	// Save detected niche (takes precedence, fallback to req.Niche if needed)
	nicheToSave := detectedNiche
	if nicheToSave == "" && req.Niche != "" {
		nicheToSave = req.Niche
	}
	if nicheToSave != "" {
		portfolioDoc["niche"] = nicheToSave
	}
	if req.Theme != "" {
		portfolioDoc["theme"] = req.Theme
	}
	if isExisting {
		// Update existing
		_, err = database.Client.Database(database.DBName).Collection("portfolios").UpdateOne(
			context.Background(),
			bson.M{"_id": portfolioID},
			bson.M{"$set": bson.M{
				"structuredContent": manifest,
				"updatedAt":         primitive.NewDateTimeFromTime(time.Now()),
				"status":            "draft", // Reset to draft on major regeneration
			}},
		)
	} else {
		// Insert new
		portfolioDoc["_id"] = portfolioID
		_, err = database.Client.Database(database.DBName).Collection("portfolios").InsertOne(
			context.Background(),
			portfolioDoc,
		)
	}
	if err != nil {
		log.Printf("[AI] DB Insert error: %v", err)
		streamLog("CRITICAL: Failed to commit portfolio to storage.", "error")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save portfolio to database: " + err.Error()})
		return
	}

	streamLog("Commit successful.", "success")
	c.JSON(http.StatusOK, gin.H{
		"portfolioId":       portfolioID.Hex(),
		"sessionId":         sessionID,
		"structuredContent": manifest,
	})
}

// savePortfolioVersion captures a snapshot of the current portfolio state
func (h *Handler) savePortfolioVersion(portfolioID primitive.ObjectID, label string) error {
	var p models.Portfolio
	collection := database.Client.Database(database.DBName).Collection("portfolios")
	err := collection.FindOne(context.Background(), bson.M{"_id": portfolioID}).Decode(&p)
	if err != nil {
		return err
	}

	// Get latest version number
	versionCollection := database.Client.Database(database.DBName).Collection("portfolio_versions")
	opts := options.FindOne().SetSort(bson.M{"version": -1})
	var lastVersion models.PortfolioVersion
	var newVersionNum int = 1
	err = versionCollection.FindOne(context.Background(), bson.M{"portfolioId": portfolioID}, opts).Decode(&lastVersion)
	if err == nil {
		newVersionNum = lastVersion.Version + 1
	}

	version := models.PortfolioVersion{
		ID:                primitive.NewObjectID(),
		PortfolioID:       portfolioID,
		StructuredContent: p.StructuredContent,
		HTML:              p.HTML,
		CSS:               p.CSS,
		JS:                p.JS,
		Version:           newVersionNum,
		Label:             label,
		CreatedAt:         time.Now(),
	}

	_, err = versionCollection.InsertOne(context.Background(), version)
	return err
}

func (h *Handler) EditPortfolioWithAI(c *gin.Context) {
	var req EditWithAIRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}
	provider := req.Provider
	if provider == "" {
		provider = h.Config.AIProvider
	}
	if provider == "" {
		provider = "gemini"
	}
	aiProvider, err := services.NewAIProvider(provider)
	if err != nil {
		log.Printf("[AI Edit] Error creating provider %s: %v", provider, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// --- Limit Enforcement Logic (Edit) ---
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))
	subCollection := database.Client.Database(database.DBName).Collection("subscriptions")
	subCount, _ := subCollection.CountDocuments(context.Background(), bson.M{"userId": userObjID, "status": "active"})

	if subCount == 0 {
		userCollection := database.Client.Database(database.DBName).Collection("users")
		var userDoc models.User
		err := userCollection.FindOne(context.Background(), bson.M{"_id": userObjID}).Decode(&userDoc)
		if err == nil {
			if userDoc.PromptCount >= 3 {
				c.JSON(http.StatusPaymentRequired, gin.H{
					"error": "Free Plan Limit Reached. Upgrade to continue building.",
					"code":  "LIMIT_REACHED",
				})
				return
			}
			// Increment Usage
			_, _ = userCollection.UpdateOne(context.Background(), bson.M{"_id": userObjID}, bson.M{"$inc": bson.M{"promptCount": 1}})
		}
	}

	structuredContentJSON, err := json.Marshal(req.StructuredContent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize structured content"})
		return
	}

	// Detected LinkedIn trail if any
	linkedinURLPattern := `https?://[a-z]{2,3}\.linkedin\.com/in/[a-zA-Z0-9-]+`
	re := regexp.MustCompile(linkedinURLPattern)
	linkedinURL := re.FindString(req.Instruction)

	promptWithLinkedIn := req.Instruction
	if linkedinURL != "" {
		profile, err := h.ScrapeLinkedInProfile(linkedinURL)
		if err == nil {
			promptWithLinkedIn += "\n\n=== ENRICHED PROFILE DATA (LINKEDIN) ===\n" + generatePortfolioPrompt(*profile)
		}
	}

	// Prepare prompt with files
	promptWithFiles := promptWithLinkedIn
	for _, file := range req.Files {
		var content string
		if strings.HasPrefix(file.Content, "http://") || strings.HasPrefix(file.Content, "https://") {
			resp, err := http.Get(file.Content)
			if err == nil {
				defer resp.Body.Close()
				body, _ := ioutil.ReadAll(resp.Body)
				content = string(body)
			}
		} else {
			content = file.Content
		}
		if len(content) > 0 {
			promptWithFiles += fmt.Sprintf("\n\n--- Attached File: %s (%s) ---\n%s", file.Filename, file.Type, content)
		}
	}

	finalPrompt := "Current portfolio structure (JSON):\n" +
		string(structuredContentJSON) +
		"\n\nUser Instruction: " + promptWithFiles

	// Log request context
	subID, _ := c.Get("subjectId")
	subjectIDStr := ""
	if subID != nil {
		subjectIDStr = subID.(string)
	}

	if req.PortfolioID != "" {
		websocket.BroadcastToPortfolio(req.PortfolioID, "portfolio_log", gin.H{
			"message":   fmt.Sprintf("AI Protocol: Analyzing refinement request - '%s'", req.Instruction),
			"type":      "info",
			"timestamp": time.Now().Format("15:04:05"),
		})

		// Save current state as a version before remixing
		pID, _ := primitive.ObjectIDFromHex(req.PortfolioID)
		h.savePortfolioVersion(pID, fmt.Sprintf("Before AI Remix: %s", req.Instruction))
	} else if subjectIDStr != "" {
		websocket.BroadcastToUser(subjectIDStr, "portfolio_log", gin.H{
			"message":   fmt.Sprintf("AI Protocol: Analyzing refinement request - '%s'", req.Instruction),
			"type":      "info",
			"timestamp": time.Now().Format("15:04:05"),
		})
	}

	log.Printf("[AI Edit] Submitting prompt to %s", provider)
	sysPrompt := services.EditSystemPrompt
	if req.SystemPrompt != "" {
		sysPrompt = req.SystemPrompt
	}

	updatedContent, err := aiProvider.Generate(finalPrompt, sysPrompt, nil)
	if err != nil {
		log.Printf("[AI Edit] Error from provider: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to edit portfolio: " + err.Error()})
		return
	}

	log.Printf("[AI Edit] Raw result: %s", updatedContent)
	cleanedResult := services.CleanAIJSON(updatedContent)

	var updatedManifest models.Manifest
	if err := json.Unmarshal([]byte(cleanedResult), &updatedManifest); err != nil {
		log.Printf("[AI Edit] Failed to parse result: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse updated Manifest"})
		return
	}
	c.JSON(http.StatusOK, updatedManifest)
}

// GenerateCode handles internal requests to generate final source code from a Manifest
func (h *Handler) GenerateCode(c *gin.Context) {
	var req GenerateCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	provider := req.Provider
	if provider == "" {
		provider = h.Config.AIProvider
	}
	if provider == "" {
		provider = "gemini"
	}
	aiProvider, err := services.NewAIProvider(provider)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	structuredContentJSON, err := json.Marshal(req.StructuredContent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize structured content"})
		return
	}

	// --- Design Persona Injection ---
	personas := []string{
		"Create a **Swiss International Style** portfolio. Focus on: Grid systems, asymmetric layouts, sans-serif typography (Helvetica/Inter), negative space, and high contrast. Use a strict typographic hierarchy.",
		"Create a **Neo-Brutalism** style portfolio. Focus on: Bold layouts, high-contrast borders, raw aesthetics, vibrant (almost clashing) accent colors, and large typography. Use shadows and outlines explicitly.",
		"Create a **Minimalist Luxury** style portfolio. Focus on: Sophisticated simplicity, serif headings (Playfair Display), plentiful whitespace, muted/monochrome color palette with gold/silver accents, and subtle micro-animations.",
		"Create a **Glassmorphism & Gradient** style portfolio. Focus on: Translucency, frosted glass effects, vibrant background blurs, rounded cards, and modern sans-serif fonts. Give it a futuristic, tech-forward feel.",
		"Create a **Magazine / Editorial** style portfolio. Focus on: Large imagery, interesting text wrapping, strong headlines, and a layout that feels like a high-end fashion or design magazine. Mix serif and sans-serif fonts.",
	}
	// Simple random selection based on time
	selectedPersona := personas[time.Now().UnixNano()%int64(len(personas))]

	prompt := fmt.Sprintf(`Act as a Senior Identity Designer. %s
Generate complete HTML, CSS, and JavaScript code for this portfolio structure.
Use PLACEHOLDER TAGS (e.g. {HERO_NAME}, {PROJ_LIST}, {EXP_LIST}) instead of hardcoded text.
Follow these rules:
1. High-fidelity, professional aesthetics matching the persona.
2. Flawless dark/light mode color wisdom.
3. Google Fonts (Outfit/Inter/Playfair) and FontAwesome icons (no emojis).
4. Flawless responsiveness.
Structure: %s`, selectedPersona, string(structuredContentJSON))

	if req.PortfolioID != "" {
		websocket.BroadcastToPortfolio(req.PortfolioID, "portfolio_log", gin.H{
			"message":   "AI Code Synthesis: Compiling visual logic...",
			"type":      "info",
			"timestamp": time.Now().Format("15:04:05"),
		})
	} else {
		// Fallback to broad SubjectID broadcast if portfolioId is missing during code gen
		subID, _ := c.Get("subjectId")
		if subID != nil {
			websocket.BroadcastToUser(subID.(string), "portfolio_log", gin.H{
				"message":   "AI Code Synthesis: Compiling visual logic...",
				"type":      "info",
				"timestamp": time.Now().Format("15:04:05"),
			})
		}
	}

	generatedCodeJSON, err := aiProvider.Generate(prompt, "", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate code from structured content"})
		return
	}

	var generatedCode struct {
		HTML string `json:"html"`
		CSS  string `json:"css"`
		JS   string `json:"js"`
	}
	if err := json.Unmarshal([]byte(generatedCodeJSON), &generatedCode); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse AI response into code format"})
		return
	}

	// Update the portfolio in database if portfolioId is provided
	if req.PortfolioID != "" {
		portfolioID, err := primitive.ObjectIDFromHex(req.PortfolioID)
		if err == nil {
			_, err = database.Client.Database(database.DBName).Collection("portfolios").UpdateOne(
				context.Background(),
				bson.M{"_id": portfolioID},
				bson.M{"$set": bson.M{
					"html": generatedCode.HTML,
					"css":  generatedCode.CSS,
					"js":   generatedCode.JS,
				}},
			)
			if err != nil {
				// Log but don't fail the request
				fmt.Printf("Failed to update portfolio: %v\n", err)
			}
		}
	}

	c.JSON(http.StatusOK, generatedCode)
}
