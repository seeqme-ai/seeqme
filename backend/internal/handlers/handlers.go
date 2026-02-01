package handlers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"seeqmeai/backend/internal/config"
	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/pkg/geoip"
	"seeqmeai/backend/pkg/resend"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type Handler struct {
	Resend *resend.Resend
	Config *config.Config

	googleOauthConfig *oauth2.Config
	oauthStateString  string
}

func NewHandler(cfg *config.Config) *Handler {
	googleOauthConfig := &oauth2.Config{
		RedirectURL:  cfg.FrontendURL + "/api/v1/auth/google/callback",
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}

	return &Handler{
		Resend: resend.New(cfg),
		Config: cfg,

		googleOauthConfig: googleOauthConfig,
	}
}

type GenerateRequest struct {
	Prompt      string                 `json:"prompt" binding:"required"`
	Template    string                 `json:"template"`
	Preferences map[string]interface{} `json:"preferences"`
	Provider    string                 `json:"provider"`
	Files       []struct {
		Filename string `json:"filename"`
		Content  string `json:"content"`
		Type     string `json:"type"`
	} `json:"files"`
	Niche        string `json:"niche"`
	Theme        string `json:"theme"`
	PortfolioID  string `json:"portfolioId"`
	SessionID    string `json:"sessionId"`
	SystemPrompt string `json:"systemPrompt"`
}

type EditWithAIRequest struct {
	PortfolioID       string      `json:"portfolioId"`
	StructuredContent interface{} `json:"structuredContent" binding:"required"`
	Instruction       string      `json:"instruction" binding:"required"`
	Provider          string      `json:"provider"`
	Files             []struct {
		Filename string `json:"filename"`
		Content  string `json:"content"`
		Type     string `json:"type"`
	} `json:"files"`
	SystemPrompt string `json:"systemPrompt"`
}

type GenerateCodeRequest struct {
	StructuredContent interface{} `json:"structuredContent" binding:"required"`
	PortfolioID       string      `json:"portfolioId" binding:"required"`
	Provider          string      `json:"provider"`
}

type AnalyticsTrackRequest struct {
	PortfolioID string `json:"portfolioId" binding:"required"`
	URL         string `json:"url"`
	Referrer    string `json:"referrer"`
	UserAgent   string `json:"userAgent"`
}

type AnalyticsEvent struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	PortfolioID primitive.ObjectID `bson:"portfolioId"`
	Timestamp   time.Time          `bson:"timestamp"`
	Browser     string             `bson:"browser"`
	OS          string             `bson:"os"`
	Device      string             `bson:"device"`
	Country     string             `bson:"country"`
	IPAddress   string             `bson:"ipAddress"`
	URL         string             `bson:"url"`
	Referrer    string             `bson:"referrer"`
}

func (h *Handler) TrackAnalytics(c *gin.Context) {
	var req AnalyticsTrackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	portfolioObjectID, err := primitive.ObjectIDFromHex(req.PortfolioID)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	browser, os, device := parseUserAgent(req.UserAgent)
	clientIP := c.ClientIP()
	country := geoip.GetCountryFromIP(clientIP)

	event := AnalyticsEvent{
		ID:          primitive.NewObjectID(),
		PortfolioID: portfolioObjectID,
		Timestamp:   time.Now(),
		Browser:     browser,
		OS:          os,
		Device:      device,
		Country:     country,
		IPAddress:   clientIP,
		URL:         req.URL,
		Referrer:    req.Referrer,
	}

	_, err = database.Client.Database(database.DBName).Collection("analytics_events").InsertOne(context.Background(), event)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusNoContent)
}

func parseUserAgent(ua string) (browser, os, device string) {
	ua = strings.ToLower(ua)

	// Browser
	if strings.Contains(ua, "chrome") && !strings.Contains(ua, "chromium") {
		browser = "Chrome"
	} else if strings.Contains(ua, "firefox") {
		browser = "Firefox"
	} else if strings.Contains(ua, "safari") && !strings.Contains(ua, "chrome") {
		browser = "Safari"
	} else if strings.Contains(ua, "edge") {
		browser = "Edge"
	} else if strings.Contains(ua, "opera") || strings.Contains(ua, "opr") {
		browser = "Opera"
	} else {
		browser = "Unknown"
	}

	// OS
	if strings.Contains(ua, "windows") {
		os = "Windows"
	} else if strings.Contains(ua, "macintosh") || strings.Contains(ua, "mac os x") {
		os = "macOS"
	} else if strings.Contains(ua, "android") {
		os = "Android"
	} else if strings.Contains(ua, "iphone") || strings.Contains(ua, "ipad") || strings.Contains(ua, "ipod") {
		os = "iOS"
	} else if strings.Contains(ua, "linux") {
		os = "Linux"
	} else {
		os = "Unknown"
	}

	// Device
	if strings.Contains(ua, "mobile") || strings.Contains(ua, "android") || strings.Contains(ua, "iphone") || strings.Contains(ua, "ipod") {
		device = "Mobile"
	} else if strings.Contains(ua, "ipad") || (strings.Contains(ua, "tablet") && !strings.Contains(ua, "mobile")) {
		device = "Tablet"
	} else {
		device = "Desktop"
	}

	return
}
