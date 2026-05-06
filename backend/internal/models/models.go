package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Context keys
type contextKey string

const UserContextKey contextKey = "user"
const AnonymousIDContextKey contextKey = "anonymousId"

// AuthenticatedUser represents the user information stored in the context
type AuthenticatedUser struct {
	ID    string
	Email string
	Roles []string
}

type User struct {
	ID                     primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email                  string             `bson:"email" json:"email"`
	Password               string             `bson:"password,omitempty" json:"-"`
	FullName               string             `bson:"fullName" json:"fullName"`
	Roles                  []string           `bson:"roles" json:"roles"`
	AdminPageAccess        []string           `bson:"adminPageAccess,omitempty" json:"adminPageAccess,omitempty"`
	IsActive               bool               `bson:"isActive" json:"isActive"`
	IsVerified             bool               `bson:"isVerified" json:"isVerified"`
	Country                string             `bson:"country,omitempty" json:"country,omitempty"`
	CreatedAt              time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt              time.Time          `bson:"updatedAt" json:"updatedAt"`
	GoogleID               string             `bson:"googleId,omitempty" json:"googleId,omitempty"`
	AvatarURL              string             `bson:"avatarUrl,omitempty" json:"avatarUrl,omitempty"`
	AuthProvider           string             `bson:"authProvider" json:"authProvider"` // e.g., "local", "google"
	PasswordResetToken     string             `bson:"passwordResetToken,omitempty" json:"-"`
	PasswordResetExpiresAt time.Time          `bson:"passwordResetExpiresAt,omitempty" json:"-"`
	GitHubPAT              string             `bson:"githubPat,omitempty" json:"-"`
	PromptCount            int                `bson:"promptCount" json:"promptCount"`         // For Free Plan limits
	DeploymentCount        int                `bson:"deploymentCount" json:"deploymentCount"` // For Free Plan limits
	IsMock                 bool               `bson:"isMock" json:"isMock"`
	FCMToken               string             `bson:"fcmToken,omitempty" json:"fcmToken,omitempty"`
}

type Portfolio struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID              primitive.ObjectID `bson:"userId" json:"userId"`
	ThemeID             string             `bson:"themeId" json:"themeId"`
	Title               string             `bson:"title" json:"title"`
	Slug                string             `bson:"slug" json:"slug"`
	Domain              string             `bson:"domain,omitempty" json:"domain,omitempty"`
	CustomDomain        string             `bson:"customDomain,omitempty" json:"customDomain,omitempty"`
	IsPublished         bool               `bson:"isPublished" json:"isPublished"`
	IsActive            bool               `bson:"isActive" json:"isActive"`
	Content             string             `bson:"content" json:"content"`
	HTML                string             `bson:"html,omitempty" json:"html,omitempty"`
	CSS                 string             `bson:"css,omitempty" json:"css,omitempty"`
	JS                  string             `bson:"js,omitempty" json:"js,omitempty"`
	StructuredContent   primitive.M        `bson:"structuredContent,omitempty" json:"structuredContent,omitempty"` // Stores the editable JSON content
	Customization       string             `bson:"customization" json:"customization"`
	SEO                 string             `bson:"seo" json:"seo"`
	Analytics           primitive.M        `bson:"analytics" json:"analytics"`
	Pages               string             `bson:"pages" json:"pages"`
	Niche               string             `bson:"niche,omitempty" json:"niche,omitempty"`
	Theme               string             `bson:"theme,omitempty" json:"theme,omitempty"`
	Subdomain           string             `bson:"subdomain,omitempty" json:"subdomain,omitempty"`
	Status              string             `bson:"status" json:"status"`
	CreatedAt           time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt           time.Time          `bson:"updatedAt" json:"updatedAt"`
	PublishedAt         *time.Time         `bson:"publishedAt,omitempty" json:"publishedAt,omitempty"`
	GitHubRepoURL       string             `bson:"gitHubRepoURL,omitempty" json:"gitHubRepoURL,omitempty"`
	CloudflareProjectID string             `bson:"cloudflareProjectID,omitempty" json:"cloudflareProjectID,omitempty"`
	DNSRecordID         string             `bson:"dnsRecordID,omitempty" json:"dnsRecordID,omitempty"` // New field
	LastNotifiedAt      *time.Time         `bson:"lastNotifiedAt,omitempty" json:"lastNotifiedAt,omitempty"`
	AnonymousID         string             `bson:"anonymousId,omitempty" json:"anonymousId,omitempty"`
}

type PortfolioVersion struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PortfolioID       primitive.ObjectID `bson:"portfolioId" json:"portfolioId"`
	StructuredContent primitive.M        `bson:"structuredContent" json:"structuredContent"`
	HTML              string             `bson:"html" json:"html"`
	CSS               string             `bson:"css" json:"css"`
	JS                string             `bson:"js" json:"js"`
	Version           int                `bson:"version" json:"version"`
	Label             string             `bson:"label" json:"label"` // e.g., "Initial Generation", "AI Remix"
	CreatedAt         time.Time          `bson:"createdAt" json:"createdAt"`
}

type AdminTemplate struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	TemplateID        string             `bson:"templateId" json:"templateId"`
	Name              string             `bson:"name" json:"name"`
	Niche             string             `bson:"niche" json:"niche"`
	Preview           string             `bson:"preview" json:"preview"`
	HTML              string             `bson:"html,omitempty" json:"html,omitempty"`
	CSS               string             `bson:"css,omitempty" json:"css,omitempty"`
	JS                string             `bson:"js,omitempty" json:"js,omitempty"`
	StructuredContent primitive.M        `bson:"structuredContent,omitempty" json:"structuredContent,omitempty"`
	CreatedAt         time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt         time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type Template struct {
	ID            string                 `bson:"_id" json:"id"`
	Name          string                 `bson:"name" json:"name"`
	Niche         string                 `bson:"niche" json:"niche"`
	Description   string                 `bson:"description" json:"description"`
	Preview       string                 `bson:"preview" json:"preview"`
	Sections      []string               `bson:"sections" json:"sections"`
	Features      []string               `bson:"features" json:"features"`
	Colors        map[string]string      `bson:"colors" json:"colors"`
	Fonts         map[string]string      `bson:"fonts" json:"fonts"`
	Structure     map[string]interface{} `bson:"structure" json:"structure"`
	IsAIGenerated bool                   `bson:"isAIGenerated" json:"isAIGenerated"`
	CreatedAt     time.Time              `bson:"createdAt" json:"createdAt"`
}

type Domain struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"userId" json:"userId"`
	PortfolioID primitive.ObjectID `bson:"portfolioId" json:"portfolioId"`
	Domain      string             `bson:"domain" json:"domain"`
	Subdomain   string             `bson:"subdomain" json:"subdomain"`
	IsCustom    bool               `bson:"isCustom" json:"isCustom"`
	IsVerified  bool               `bson:"isVerified" json:"isVerified"`
	SSLEnabled  bool               `bson:"sslEnabled" json:"sslEnabled"`
	Status      string             `bson:"status" json:"status"`
	DNSRecords  string             `bson:"dnsRecords" json:"dnsRecords"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type Subscription struct {
	ID                   primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID               primitive.ObjectID `bson:"userId" json:"userId"`
	PlanID               string             `bson:"planId" json:"planId"`
	StripeCustomerID     string             `bson:"stripeCustomerId" json:"stripeCustomerId"`
	StripeSubscriptionID string             `bson:"stripeSubscriptionId" json:"stripeSubscriptionId"`
	Status               string             `bson:"status" json:"status"`
	CurrentPeriodStart   time.Time          `bson:"currentPeriodStart" json:"currentPeriodStart"`
	CurrentPeriodEnd     time.Time          `bson:"currentPeriodEnd" json:"currentPeriodEnd"`
	CancelAtPeriodEnd    bool               `bson:"cancelAtPeriodEnd" json:"cancelAtPeriodEnd"`
	Amount               float64            `bson:"amount,omitempty" json:"amount,omitempty"`
	Currency             string             `bson:"currency,omitempty" json:"currency,omitempty"`
	CreatedAt            time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt            time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type AnalyticsEvent struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PortfolioID primitive.ObjectID `bson:"portfolioId" json:"portfolioId"`
	UserID      primitive.ObjectID `bson:"userId" json:"userId"` // Optional, if user is logged in
	SessionID   string             `bson:"sessionId" json:"sessionId"`
	EventType   string             `bson:"eventType" json:"eventType"` // e.g., "pageview", "event"
	Timestamp   time.Time          `bson:"timestamp" json:"timestamp"`

	// Pageview specific
	PageURL   string `bson:"pageUrl,omitempty" json:"pageUrl,omitempty"`
	PageTitle string `bson:"pageTitle,omitempty" json:"pageTitle,omitempty"`
	Referrer  string `bson:"referrer,omitempty" json:"referrer,omitempty"`

	// User/Device Info
	UserAgent        string `bson:"userAgent,omitempty" json:"userAgent,omitempty"`
	BrowserName      string `bson:"browserName,omitempty" json:"browserName,omitempty"`
	BrowserVersion   string `bson:"browserVersion,omitempty" json:"browserVersion,omitempty"`
	OSName           string `bson:"osName,omitempty" json:"osName,omitempty"`
	OSVersion        string `bson:"osVersion,omitempty" json:"osVersion,omitempty"`
	DeviceType       string `bson:"deviceType,omitempty" json:"deviceType,omitempty"` // e.g., "desktop", "mobile", "tablet"
	ScreenResolution string `bson:"screenResolution,omitempty" json:"screenResolution,omitempty"`
	Viewport         string `bson:"viewport,omitempty" json:"viewport,omitempty"`
	Language         string `bson:"language,omitempty" json:"language,omitempty"`
	Timezone         string `bson:"timezone,omitempty" json:"timezone,omitempty"`

	// Location Info (derived from IP)
	Country string `bson:"country,omitempty" json:"country,omitempty"`
	Region  string `bson:"region,omitempty" json:"region,omitempty"`
	City    string `bson:"city,omitempty" json:"city,omitempty"`

	// Event specific (for custom events)
	EventCategory   string                 `bson:"eventCategory,omitempty" json:"eventCategory,omitempty"`
	EventAction     string                 `bson:"eventAction,omitempty" json:"eventAction,omitempty"`
	EventLabel      string                 `bson:"eventLabel,omitempty" json:"eventLabel,omitempty"`
	EventValue      int                    `bson:"eventValue,omitempty" json:"eventValue,omitempty"`
	EventProperties map[string]interface{} `bson:"eventProperties,omitempty" json:"eventProperties,omitempty"`
}

type Manifest struct {
	Metadata     ManifestMetadata  `bson:"metadata" json:"metadata"`
	GlobalConfig GlobalConfig      `bson:"globalConfig" json:"globalConfig"`
	Sections     []ManifestSection `bson:"sections" json:"sections"`
}

type ManifestMetadata struct {
	Version     string `bson:"version" json:"version"`
	Niche       string `bson:"niche" json:"niche"`
	GeneratedAt string `bson:"generatedAt" json:"generatedAt"`
}

type GlobalConfig struct {
	Theme        string       `bson:"theme" json:"theme"`
	ColorPalette ColorPalette `bson:"colorPalette" json:"colorPalette"`
	Typography   Typography   `bson:"typography" json:"typography"`
}

type ColorPalette struct {
	Primary    string `bson:"primary" json:"primary"`
	Secondary  string `bson:"secondary" json:"secondary"`
	Background string `bson:"background" json:"background"`
	Surface    string `bson:"surface" json:"surface"`
	Text       string `bson:"text" json:"text"`
	Heading    string `bson:"heading" json:"heading"`
}

type Typography struct {
	HeadingFont string `bson:"headingFont" json:"headingFont"`
	BodyFont    string `bson:"bodyFont" json:"bodyFont"`
	MonoFont    string `bson:"monoFont" json:"monoFont"`
}

type ManifestSection struct {
	ID          string           `bson:"id" json:"id"`
	Type        string           `bson:"type" json:"type"`
	ComponentID string           `bson:"componentId" json:"componentId"`
	Content     interface{}      `bson:"content" json:"content"`
	Settings    *SectionSettings `bson:"settings,omitempty" json:"settings,omitempty"`
}
type SectionSettings struct {
	IsVisible bool   `bson:"isVisible" json:"isVisible"`
	Padding   string `bson:"padding" json:"padding"`
}

type Deployment struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PortfolioID primitive.ObjectID `bson:"portfolioId" json:"portfolioId"`
	Status      string             `bson:"status" json:"status"` // "queued", "building", "uploading", "completed", "failed"
	URL         string             `bson:"url,omitempty" json:"url,omitempty"`
	Error       string             `bson:"error,omitempty" json:"error,omitempty"`
	StartedAt   time.Time          `bson:"startedAt" json:"startedAt"`
	CompletedAt time.Time          `bson:"completedAt,omitempty" json:"completedAt,omitempty"`
}

// ── Social Feature Models ──

type SocialNode struct {
	ID         string   `bson:"_id" json:"id"`
	UserID     string   `bson:"userId" json:"userId"`
	Name       string   `bson:"name" json:"name"`
	Role       string   `bson:"role" json:"role"`
	Similarity int      `bson:"similarity" json:"similarity"`
	Avatar     string   `bson:"avatar" json:"avatar"`
	Group      int      `bson:"group" json:"group"`
	Skills     []string `bson:"skills" json:"skills"`
}

type Connection struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FromUserID   primitive.ObjectID `bson:"fromUserId" json:"fromUserId"`
	ToUserID     primitive.ObjectID `bson:"toUserId" json:"toUserId"`
	Status       string             `bson:"status" json:"status"` // "pending", "accepted", "blocked"
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type LinkPreview struct {
	URL         string `json:"url" bson:"url"`
	Title       string `json:"title" bson:"title"`
	Description string `json:"description" bson:"description"`
	Image       string `json:"image" bson:"image"`
	SiteName    string `json:"siteName" bson:"siteName"`
}

type Comment struct {
	ID        primitive.ObjectID  `json:"id" bson:"_id"`
	PostID    primitive.ObjectID  `json:"postId" bson:"postId"`
	ParentID  *primitive.ObjectID `json:"parentId,omitempty" bson:"parentId,omitempty"`
	AuthorID  primitive.ObjectID  `json:"authorId" bson:"authorId"`
	Author    string              `json:"author" bson:"author"`
	Avatar    string              `json:"avatar" bson:"avatar"`
	Content   string              `json:"content" bson:"content"`
	CreatedAt time.Time           `json:"createdAt" bson:"createdAt"`
}

type Post struct {
	ID             primitive.ObjectID  `json:"id" bson:"_id"`
	AuthorID       primitive.ObjectID  `json:"authorId" bson:"authorId"`
	OriginalPostID *primitive.ObjectID `json:"originalPostId,omitempty" bson:"originalPostId,omitempty"`
	Author         string              `json:"author" bson:"author"`
	Role           string              `json:"role" bson:"role"`
	Location       string              `json:"location" bson:"location"`
	Avatar         string              `json:"avatar" bson:"avatar"`
	Similarity     int                 `json:"similarity" bson:"similarity"`
	Content        string              `json:"content" bson:"content"`
	Tag            string              `json:"tag" bson:"tag"`
	Media          string              `json:"media" bson:"media"`
	Link           string              `json:"link" bson:"link"`
	LinkPreview    *LinkPreview        `json:"linkPreview" bson:"linkPreview"`
	Likes          int                 `json:"likes" bson:"likes"`
	Comments       []Comment           `json:"comments" bson:"comments"`
	Reposts        int                 `json:"reposts" bson:"reposts"`
	SavedBy        []string            `json:"savedBy" bson:"savedBy"`
	IsMock         bool                `json:"isMock" bson:"isMock"`
	Slug           string              `json:"slug" bson:"slug"`
	SEOTitle       string              `json:"seoTitle" bson:"seoTitle"`
	SEODesc        string              `json:"seoDesc" bson:"seoDesc"`
	Timestamp      string              `json:"timestamp" bson:"timestamp"`
	CreatedAt      time.Time           `json:"createdAt" bson:"createdAt"`
}

type Notification struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"userId" json:"userId"`
	FromID    primitive.ObjectID `bson:"fromId" json:"fromId"`
	FromName  string             `bson:"fromName" json:"fromName"`
	Type      string             `bson:"type" json:"type"` // "like", "comment", "repost", "connect_request", "connect_accept"
	PostID    *primitive.ObjectID `bson:"postId,omitempty" json:"postId,omitempty"`
	Message   string             `bson:"message" json:"message"`
	IsRead    bool               `bson:"isRead" json:"isRead"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

type TrendingItem struct {
	ID     primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Tag    string             `bson:"tag" json:"tag"`
	Posts  int                `bson:"posts" json:"posts"`
	Source string             `bson:"source" json:"source"` // "reddit", "inapp", ""
}

type RedditComment struct {
	ID     string `bson:"id" json:"id"`
	Author string `bson:"author" json:"author"`
	Body   string `bson:"body" json:"body"`
	Score  int    `bson:"score" json:"score"`
}

type RedditPost struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	RedditID    string             `bson:"redditId" json:"redditId"`
	Subreddit   string             `bson:"subreddit" json:"subreddit"`
	Title       string             `bson:"title" json:"title"`
	Selftext    string             `bson:"selftext" json:"selftext"`
	Author      string             `bson:"author" json:"author"`
	Score       int                `bson:"score" json:"score"`
	NumComments int                `bson:"numComments" json:"numComments"`
	Thumbnail   string             `bson:"thumbnail" json:"thumbnail"`
	URL         string             `bson:"url" json:"url"`
	Permalink   string             `bson:"permalink" json:"permalink"`
	Slug        string             `bson:"slug" json:"slug"`
	SEOTitle    string             `bson:"seoTitle" json:"seoTitle"`
	SEODesc     string             `bson:"seoDesc" json:"seoDesc"`
	Category    string             `bson:"category" json:"category"` // "hot", "rising"
	TopComments []RedditComment    `bson:"topComments" json:"topComments"`
	OurComments []Comment          `bson:"ourComments" json:"ourComments"`
	OurLikes    []string           `bson:"ourLikes" json:"ourLikes"` // user IDs who liked
	FetchedAt   time.Time          `bson:"fetchedAt" json:"fetchedAt"`
}

type SuggestedUser struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name       string             `bson:"name" json:"name"`
	Role       string             `bson:"role" json:"role"`
	Location   string             `bson:"location" json:"location"`
	Avatar     string             `bson:"avatar" json:"avatar"`
	Similarity int                `bson:"similarity" json:"similarity"`
}
