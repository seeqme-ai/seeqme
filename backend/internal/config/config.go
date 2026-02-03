package config

import (
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                string
	MongoURI            string
	DatabaseName        string
	JWTSecret           string
	StripeKey           string
	StripeWebhookSecret string
	RedisURL            string
	Environment         string
	AllowedOrigins      []string
	DNSProviderAPIKey   string
	DNSProviderDomain   string
	CloudinaryCloudName string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string
	ResendApiKey        string
	AIProvider          string
	AIModel             string
	GEMINIAPIKEY        string
	OPENAIAPIKEY        string
	GoogleClientID      string
	GoogleClientSecret  string
	GitHubClientID      string
	GitHubClientSecret  string
	FrontendURL         string
	BackendURL          string
	// GitHub and Cloudflare credentials for deployment orchestration
	GitHubToken         string
	GitHubOwner         string
	CloudflareAccountID string
	CloudflareAPIToken  string
	CloudflareEmail     string
	CloudflareZoneID    string
	MapboxAPIKey        string
	LinkedInEmail       string
	LinkedInPassword    string
	AnthropicAPIKey     string
}

func Load() *Config {
	// Load .env file in development
	wd, err := os.Getwd()
	if err != nil {
		log.Printf("Error getting current working directory: %v", err)
	}
	log.Printf("Current Working Directory: %s", wd)

	envPath := filepath.Join(wd, ".env")
	if content, readErr := os.ReadFile(envPath); readErr == nil {
		log.Printf(".env file content:\n%s", content)
	} else {
		log.Printf("Could not read .env file at %s: %v", envPath, readErr)
	}

	if err := godotenv.Load(envPath); err != nil {
		log.Printf("Error loading .env file from %s: %v", envPath, err)
		log.Println("Falling back to environment variables or defaults.")
	}

	config := &Config{
		Port:                getEnv("PORT", ""),
		MongoURI:            getEnv("MONGO_URI", ""),
		DatabaseName:        getEnv("DATABASE_NAME", ""),
		JWTSecret:           getEnv("JWT_SECRET", ""),
		StripeKey:           getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
		RedisURL:            getEnv("REDIS_URL", ""),
		Environment:         getEnv("ENVIRONMENT", "development"),
		DNSProviderAPIKey:   getEnv("DNS_PROVIDER_API_KEY", ""),
		DNSProviderDomain:   getEnv("DNS_PROVIDER_DOMAIN", ""),
		CloudinaryCloudName: getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryAPIKey:    getEnv("CLOUDINARY_API_KEY", ""),
		CloudinaryAPISecret: getEnv("CLOUDINARY_API_SECRET", ""),
		ResendApiKey:        getEnv("RESEND_API_KEY", ""),
		AIProvider:          getEnv("AI_PROVIDER", "gemini"),
		AIModel:             getEnv("AI_MODEL", "gemini-2.5-flash"),
		OPENAIAPIKEY:        getEnv("OPENAI_API_KEY", ""),
		GEMINIAPIKEY:        getEnv("GEMINI_API_KEY", ""),
		GoogleClientID:      getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret:  getEnv("GOOGLE_CLIENT_SECRET", ""),
		GitHubClientID:      getEnv("GITHUB_CLIENT_ID", ""),
		GitHubClientSecret:  getEnv("GITHUB_CLIENT_SECRET", ""),
		FrontendURL:         getEnv("FRONTEND_URL", ""),
		BackendURL:          getEnv("BACKEND_URL", "http://localhost:8080"),
		GitHubToken:         getEnv("GITHUB_TOKEN", ""),
		GitHubOwner:         getEnv("GITHUB_OWNER", ""),
		CloudflareAccountID: getEnv("CLOUDFLARE_ACCOUNT_ID", ""),
		CloudflareAPIToken:  getEnv("CLOUDFLARE_API_TOKEN", ""),
		CloudflareEmail:     getEnv("CLOUDFLARE_EMAIL", ""),
		CloudflareZoneID:    getEnv("CLOUDFLARE_ZONE_ID", ""),
		MapboxAPIKey:        getEnv("MAPBOX_API_KEY", ""),
		LinkedInEmail:       getEnv("LINKEDIN_EMAIL", ""),
		LinkedInPassword:    getEnv("LINKEDIN_PASSWORD", ""),
		AnthropicAPIKey:     getEnv("ANTHROPIC_API_KEY", ""),
	}

	log.Printf("Loaded MongoURI: %s", config.MongoURI)

	// Set allowed origins based on environment
	if config.Environment == "production" {
		config.AllowedOrigins = []string{
			getEnv("FRONTEND_URL", "https://seeqme.com"),
		}
	} else {

		config.AllowedOrigins = []string{
			"http://localhost:3000",
			"http://localhost:5173",
			"http://localhost:5174",
			"http://localhost:4173",
			"http://localhost:5000",
			"http://localhost:3001",
			"http://localhost:3002",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:5173",
		}

	}

	return config
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
