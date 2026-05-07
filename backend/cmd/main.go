package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"seeqmeai/backend/internal/config"
	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/handlers"

	"seeqmeai/backend/internal/middleware"
	"seeqmeai/backend/internal/services"
	"seeqmeai/backend/internal/websocket"
)

func main() {
	cfg := config.Load()

	// Initialize database
	database.InitDB(cfg.MongoURI, cfg.DatabaseName)
	defer database.CloseDB()

	if err := websocket.InitSocketIO(); err != nil {
		log.Fatalf("❌ Socket.IO initialization failed: %v", err)
	}

	// Start subscription worker
	subWorker := services.NewSubscriptionWorker(cfg)
	go subWorker.Start(context.Background())

	// Start retention worker (undeployed portfolios)
	retentionWorker := services.NewRetentionWorker(cfg)
	go retentionWorker.Start(context.Background())

	// Start backup cleanup worker (expired backups)
	backupWorker := services.NewBackupCleanupWorker()
	go backupWorker.Start(context.Background())

	// Start Sitemap worker
	sitemapWorker := services.NewSitemapWorker(cfg.FrontendURL)
	go sitemapWorker.Start(context.Background())

	// Start Social Email batch worker
	socialEmailWorker := services.NewSocialEmailWorker(cfg)
	go socialEmailWorker.Start(context.Background())

	// Seed mock users/posts and post on a rolling schedule (8 h interval)
	mockWorker := services.NewMockContentWorker(8 * time.Hour)
	go mockWorker.Start(context.Background())

	// Start trending worker — refreshes trending tags + Reddit posts every hour
	trendingWorker := services.NewTrendingWorker(
		[]services.TrendingProvider{services.NewRedditProvider()},
		1*time.Hour,
		"global",
	)
	go trendingWorker.Start(context.Background())

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			// Allow all origins to support custom domains and local development
			return true
		},
		AllowMethods:        []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:        []string{"Origin", "Content-Type", "Authorization", "X-Requested-With", "Upgrade", "X-Anonymous-ID"},
		ExposeHeaders:       []string{"Content-Length", "Access-Control-Allow-Origin"},
		AllowCredentials:    true,
		AllowPrivateNetwork: true,
	}))

	// It will identify a user if a valid token is present, but won't fail otherwise.
	r.Use(middleware.OptionalAuthMiddleware(cfg.JWTSecret))
	r.Use(middleware.IdentityMiddleware())

	// custom recovery middleware to ensure CORS headers are kept
	r.Use(func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[Recovery] Panic recovered: %v", err)
				c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
				c.Header("Access-Control-Allow-Credentials", "true")
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error (Recovered)"})
				c.Abort()
			}
		}()
		c.Next()
	})

	h := handlers.NewHandler(cfg)

	r.GET("/socket.io/*any", gin.WrapH(websocket.Server))
	r.POST("/socket.io/*any", gin.WrapH(websocket.Server))
	r.GET("/ws", websocket.Manager.HandleConnection)

	api := r.Group("/api/v1")
	{
		api.GET("/config/pricing", h.GetPricingConfig)
		api.GET("/templates", h.GetPublicTemplates)

		api.POST("/contact", h.ContactForm)
		api.POST("/analytics/track", h.TrackAnalytics)

		auth := api.Group("/auth")
		{
			auth.POST("/register", h.Register)
			auth.POST("/login", h.Login)
			auth.GET("/me", middleware.RequiredAuthMiddleware(), h.GetMe)
			auth.PUT("/me", middleware.RequiredAuthMiddleware(), h.UpdateUser)
			auth.POST("/fcm-token", middleware.RequiredAuthMiddleware(), h.UpdateFCMToken)
			auth.GET("/google/login", h.GoogleLogin)
			auth.GET("/google/callback", h.GoogleCallback)
			auth.POST("/google/verify-token", h.VerifyGoogleIDToken)
			auth.POST("/forgot-password", h.RequestPasswordReset)
			auth.POST("/reset-password", h.ResetPassword)
			auth.GET("/verify-reset-token", h.VerifyPasswordResetToken)
			auth.POST("/change-password", middleware.RequiredAuthMiddleware(), h.ChangePassword)
		}

		portfolios := api.Group("/portfolios")
		portfolios.Use(middleware.RequiredAuthMiddleware())
		{
			portfolios.GET("", h.GetPortfolios)
			portfolios.GET("/my-published", h.GetMyPublishedPortfolios)
			portfolios.POST("", h.CreatePortfolio)
			portfolios.GET("/:id", h.GetPortfolio)
			portfolios.PUT("/:id", h.UpdatePortfolio)
			portfolios.DELETE("/:id", h.DeletePortfolio)
			portfolios.POST("/:id/publish", h.PublishPortfolio)
			portfolios.GET("/:id/code", h.GetPortfolioCode)
			portfolios.PUT("/:id/code", h.UpdatePortfolioCode)
			portfolios.GET("/:id/content", h.GetPortfolioContent)
			portfolios.PUT("/:id/content", h.UpdatePortfolioContent)
			portfolios.GET("/:id/export", h.ExportPortfolio)
			portfolios.GET("/:id/analytics", h.GetPortfolioAnalytics)
			portfolios.POST("/:id/undo", h.UndoPortfolio)
		}

		domains := api.Group("/domains")
		domains.Use(middleware.RequiredAuthMiddleware())
		{
			domains.GET("", h.GetDomains)
			domains.POST("", h.CreateDomain)
			domains.GET("/:id", h.GetDomain)
			domains.PUT("/:id", h.UpdateDomain)
			domains.DELETE("/:id", h.DeleteDomain)
			domains.POST("/:id/verify", h.VerifyDomain)
		}

		ai := api.Group("/ai")
		{
			ai.POST("/generate", middleware.RequiredAuthMiddleware(), h.GeneratePortfolio)
			ai.POST("/edit", middleware.RequiredAuthMiddleware(), h.EditPortfolioWithAI)
			ai.POST("/generate-code", middleware.RequiredAuthMiddleware(), h.GenerateCode)
		}

		// Deployment management
		api.POST("/deployment/validate", middleware.RequiredAuthMiddleware(), h.ValidateUpdate)
		api.POST("/deployment/publish", middleware.RequiredAuthMiddleware(), h.PublishUpdate)
		api.POST("/deployment/deploy", middleware.RequiredAuthMiddleware(), h.DeployPortfolio)
		api.GET("/deployment/status/:id", middleware.RequiredAuthMiddleware(), h.GetDeploymentStatus)
		api.POST("/deployment/rollback/:id", middleware.RequiredAuthMiddleware(), h.RollbackDeployment)

		// Session Management
		api.GET("/sessions/active", middleware.RequiredAuthMiddleware(), h.GetActiveSession)
		api.GET("/sessions/:id", middleware.RequiredAuthMiddleware(), h.GetSession)

		api.POST("/upload", h.UploadFile)
		api.POST("/cv/extract", h.ExtractCVContent)

		// Admin Routes
		admin := api.Group("/admin")
		admin.Use(middleware.RequiredAuthMiddleware())
		admin.Use(middleware.AdminOnlyMiddleware())
		{
			admin.GET("/system-config", h.GetSystemConfig)
			admin.PUT("/system-config", h.UpdateSystemConfig)
			admin.POST("/system-config/reload", h.ReloadSystemConfig)

			admin.GET("/users", h.AdminGetUsers)
			admin.PUT("/users/:id/permissions", h.AdminUpdateUserAccess)
			admin.GET("/portfolios", h.AdminGetAllPortfolios)
			admin.GET("/stats", h.AdminGetStats)
			admin.POST("/portfolios/:id/deploy", h.AdminDeployPortfolio)
			admin.DELETE("/portfolios/:id", h.DeletePortfolio)
			admin.POST("/notifications/email", h.AdminSendEmail)
			admin.GET("/templates", h.AdminGetTemplates)
			admin.POST("/templates", h.AdminCreateTemplate)
			admin.PUT("/templates/:id", h.AdminUpdateTemplate)
			admin.DELETE("/templates/:id", h.AdminDeleteTemplate)

			// /social/seed removed — mock content is now managed by MockContentWorker
		}

		subscription := api.Group("/subscription")
		subscription.Use(middleware.RequiredAuthMiddleware())
		{
			subscription.GET("", h.GetSubscription)
			subscription.POST("/verify", h.VerifySubscription)
		}

		social := api.Group("/social")
		{
			social.GET("/mesh/nodes", h.GetMeshNodes)
			social.GET("/connections", middleware.RequiredAuthMiddleware(), h.GetConnections)
			social.POST("/connections/request", middleware.RequiredAuthMiddleware(), h.SendConnectionRequest)
			social.POST("/connections/:id/accept", middleware.RequiredAuthMiddleware(), h.AcceptConnectionRequest)
			social.POST("/connections/:id/reject", middleware.RequiredAuthMiddleware(), h.RejectConnectionRequest)
			social.GET("/notifications", middleware.RequiredAuthMiddleware(), h.GetNotifications)
			social.POST("/notifications/read", middleware.RequiredAuthMiddleware(), h.MarkNotificationsRead)
			social.GET("/feed", h.GetFeed)
			social.GET("/feed/following", middleware.RequiredAuthMiddleware(), h.GetFollowingFeed)
			social.GET("/feed/foryou", middleware.RequiredAuthMiddleware(), h.GetForYouFeed)
			social.POST("/feed", middleware.RequiredAuthMiddleware(), h.CreatePost)
			social.PUT("/feed/:id", middleware.RequiredAuthMiddleware(), h.UpdatePost)
			social.DELETE("/feed/:id", middleware.RequiredAuthMiddleware(), h.DeletePost)
			social.POST("/feed/:id/like", middleware.RequiredAuthMiddleware(), h.LikePost)
			social.DELETE("/feed/:id/like", middleware.RequiredAuthMiddleware(), h.UnlikePost)
			social.POST("/feed/:id/repost", middleware.RequiredAuthMiddleware(), h.RepostPost)
			social.POST("/feed/:id/save", middleware.RequiredAuthMiddleware(), h.SavePost)
			social.GET("/feed/my-posts", middleware.RequiredAuthMiddleware(), h.GetMyPosts)
			social.GET("/feed/saved", middleware.RequiredAuthMiddleware(), h.GetSavedPosts)
			social.POST("/feed/:id/comment", middleware.RequiredAuthMiddleware(), h.CommentOnPost)
			social.GET("/feed/post/:slug", h.GetPostBySlug)
			social.GET("/trending", h.GetTrending)
			social.GET("/feed/trending", h.GetTrendingFeed)
			social.GET("/suggested", h.GetSuggested)
			social.GET("/reddit/feed", h.GetRedditFeed)
			social.GET("/reddit/post/:slug", h.GetRedditPostBySlug)
			social.POST("/reddit/:id/like", middleware.RequiredAuthMiddleware(), h.LikeRedditPost)
			social.DELETE("/reddit/:id/like", middleware.RequiredAuthMiddleware(), h.UnlikeRedditPost)
			social.POST("/reddit/:id/comment", middleware.RequiredAuthMiddleware(), h.CommentOnRedditPost)
		}
	}

	// Setup static file serving for production
	setupStaticServing(r)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "All services are jiggy😁",
		})
	})

	log.Printf("Server starting on port %s", cfg.Port)
	log.Printf("Socket.IO server running")
	log.Printf("API available at http://0.0.0.0:%s/api/v1", cfg.Port)

	if err := r.Run("0.0.0.0:" + cfg.Port); err != nil {
		log.Fatalf("❌ Server failed to start: %v", err)
	}
}

// setupStaticServing configures Gin to serve frontend static files and handle SPA routing.
func setupStaticServing(r *gin.Engine) {
	// Helper to find the correct static file path
	findStaticFile := func(path string) (string, bool) {
		// Clean path
		if strings.HasSuffix(path, "/") {
			path += "index.html"
		}

		// Try ./dist first (Production / Docker)
		pathsToCheck := []string{"./dist", "../dist"}

		for _, base := range pathsToCheck {
			fullPath := filepath.Join(base, path)
			info, err := os.Stat(fullPath)
			if err == nil && !info.IsDir() {
				return fullPath, true
			}
		}
		return "", false
	}

	// Middleware to check if a static file exists in dist and serve it
	r.Use(func(c *gin.Context) {
		// Skip for API and socket.io
		if strings.HasPrefix(c.Request.URL.Path, "/api/v1") || strings.HasPrefix(c.Request.URL.Path, "/socket.io") {
			c.Next()
			return
		}

		path := c.Request.URL.Path
		if filePath, exists := findStaticFile(path); exists {
			// File exists, serve it
			// Set caching headers
			if strings.HasPrefix(path, "/assets/") {
				c.Header("Cache-Control", "public, max-age=31536000, immutable")
			} else {
				// Root files (index.html, icons, etc) should revalidate
				c.Header("Cache-Control", "no-cache")
			}

			c.File(filePath)
			c.Abort()
			return
		}

		c.Next()
	})

	// SPA Catch-all: If we got here, no static file was found and it's not an API route.
	// Serve index.html for client-side routing.
	r.NoRoute(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/api/v1") || strings.HasPrefix(c.Request.URL.Path, "/socket.io") {
			c.JSON(http.StatusNotFound, gin.H{"error": "API route not found"})
			return
		}

		// Try to find index.html in either location
		if indexPath, exists := findStaticFile("/index.html"); exists {
			c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
			c.File(indexPath)
			return
		}

		// Fallback specific error if index.html is completely missing
		c.String(http.StatusNotFound, "Frontend not built or index.html missing")
	})
}
