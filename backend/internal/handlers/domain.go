package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
	"seeqmeai/backend/pkg/cloudflare"
)

type CreateDomainRequest struct {
	PortfolioID string `json:"portfolioId"`
	Domain      string `json:"domain"`
	IsCustom    bool   `json:"isCustom"`
}

type UpdateDomainRequest struct {
	PortfolioID string `json:"portfolioId"`
}

func (h *Handler) GetDomains(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var domains []models.Domain
	cursor, err := database.Client.Database(database.DBName).Collection("domains").Find(context.Background(), bson.M{"userId": userObjectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch domains"})
		return
	}
	defer cursor.Close(context.Background())

	if err = cursor.All(context.Background(), &domains); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode domains"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"domains": domains})
}

func (h *Handler) CreateDomain(c *gin.Context) {
	var req CreateDomainRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}
	userObjectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var portfolioObjectID primitive.ObjectID
	if req.PortfolioID != "" {
		portfolioObjectID, err = primitive.ObjectIDFromHex(req.PortfolioID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID format"})
			return
		}
	} else {
		portfolioObjectID = primitive.NilObjectID
	}

	subdomain := req.Domain
	if subdomain == "" {
		subdomain = primitive.NewObjectID().Hex()[:8]
	}

	domain := models.Domain{
		ID:          primitive.NewObjectID(),
		UserID:      userObjectID,
		PortfolioID: portfolioObjectID,
		Domain:      req.Domain,
		Subdomain:   subdomain,
		IsCustom:    req.IsCustom,
		IsVerified:  false,
		SSLEnabled:  true,
		Status:      "pending",
		DNSRecords:  "[]",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if req.IsCustom {
		dnsRecords := []map[string]interface{}{
			{
				"type":  "CNAME",
				"name":  "@",
				"value": "seeqme.com",
				"ttl":   3600,
			},
		}
		recordsJSON, _ := json.Marshal(dnsRecords)
		domain.DNSRecords = string(recordsJSON)
		domain.Status = "verification_pending"
	} else {
		cfg := h.Config
		cfClient := cloudflare.NewClient(cfg)
		targetURL := "seeqme-pages.pages.dev"

		recordID, err := cfClient.CreateSubdomain(subdomain, targetURL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to provision subdomain with Cloudflare",
				"details": err.Error(),
			})
			return
		}

		fullDomain := subdomain + ".seeqme.com"
		domain.Domain = fullDomain
		domain.IsVerified = true
		domain.Status = "active"

		dnsRecords := []map[string]interface{}{
			{
				"type":     "CNAME",
				"recordID": recordID,
			},
		}
		recordsJSON, _ := json.Marshal(dnsRecords)
		domain.DNSRecords = string(recordsJSON)
	}

	_, err = database.Client.Database(database.DBName).Collection("domains").InsertOne(context.Background(), domain)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create domain"})
		return
	}

	c.JSON(http.StatusCreated, domain)
}

func (h *Handler) UpdateDomain(c *gin.Context) {
	domainID := c.Param("id")
	var req UpdateDomainRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}
	userObjectID, _ := primitive.ObjectIDFromHex(userID.(string))
	domainObjectID, _ := primitive.ObjectIDFromHex(domainID)

	portfolioObjectID, err := primitive.ObjectIDFromHex(req.PortfolioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid portfolio ID format"})
		return
	}

	filter := bson.M{"_id": domainObjectID, "userId": userObjectID}
	update := bson.M{
		"$set": bson.M{
			"portfolioId": portfolioObjectID,
			"updatedAt":   time.Now(),
		},
	}

	result, err := database.Client.Database(database.DBName).Collection("domains").UpdateOne(context.Background(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update domain"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Domain not found or unauthorized"})
		return
	}

	// Sync to portfolio if domain is verified
	var domain models.Domain
	err = database.Client.Database(database.DBName).Collection("domains").FindOne(context.Background(), bson.M{"_id": domainObjectID}).Decode(&domain)
	if err == nil && domain.IsVerified {
		database.Client.Database(database.DBName).Collection("portfolios").UpdateOne(
			context.Background(),
			bson.M{"_id": portfolioObjectID, "userId": userObjectID},
			bson.M{"$set": bson.M{"customDomain": domain.Domain, "updatedAt": time.Now()}},
		)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Domain updated successfully"})
}

func (h *Handler) GetDomain(c *gin.Context) {
	domainID := c.Param("id")
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	domainObjectID, err := primitive.ObjectIDFromHex(domainID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid domain ID format"})
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var domain models.Domain
	err = database.Client.Database(database.DBName).Collection("domains").FindOne(context.Background(), bson.M{"_id": domainObjectID, "userId": userObjectID}).Decode(&domain)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Domain not found"})
		return
	}

	c.JSON(http.StatusOK, domain)
}

func (h *Handler) DeleteDomain(c *gin.Context) {
	domainID := c.Param("id")
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	domainObjectID, err := primitive.ObjectIDFromHex(domainID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid domain ID format"})
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var domain models.Domain
	err = database.Client.Database(database.DBName).Collection("domains").FindOne(context.Background(), bson.M{"_id": domainObjectID, "userId": userObjectID}).Decode(&domain)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Domain not found"})
		return
	}

	// If this is an auto-generated subdomain, delete from Cloudflare first
	if !domain.IsCustom && domain.DNSRecords != "" {
		var dnsRecords []map[string]interface{}
		if err := json.Unmarshal([]byte(domain.DNSRecords), &dnsRecords); err == nil {
			if len(dnsRecords) > 0 {
				if recordID, ok := dnsRecords[0]["recordID"].(string); ok && recordID != "" {
					cfg := h.Config
					cfClient := cloudflare.NewClient(cfg)
					if err := cfClient.DeleteSubdomain(recordID); err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"error":   "Failed to delete DNS record from Cloudflare",
							"details": err.Error(),
						})
						return
					}
				}
			}
		}
	}

	result, err := database.Client.Database(database.DBName).Collection("domains").DeleteOne(context.Background(), bson.M{"_id": domainObjectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete domain"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Domain not found"})
		return
	}

	// Clear from portfolio if it was linked
	if !domain.PortfolioID.IsZero() {
		database.Client.Database(database.DBName).Collection("portfolios").UpdateOne(
			context.Background(),
			bson.M{"_id": domain.PortfolioID, "userId": userObjectID, "customDomain": domain.Domain},
			bson.M{"$set": bson.M{"customDomain": "", "updatedAt": time.Now()}},
		)
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) VerifyDomain(c *gin.Context) {
	domainID := c.Param("id")
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	domainObjectID, err := primitive.ObjectIDFromHex(domainID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid domain ID format"})
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var domain models.Domain
	err = database.Client.Database(database.DBName).Collection("domains").FindOne(context.Background(), bson.M{"_id": domainObjectID, "userId": userObjectID}).Decode(&domain)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Domain not found"})
		return
	}

	if !domain.IsCustom {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only custom domains require verification."})
		return
	}

	// Fetch portfolio first to get the ID for the target CNAME
	var portfolio models.Portfolio
	err = database.Client.Database(database.DBName).Collection("portfolios").FindOne(context.Background(), bson.M{"_id": domain.PortfolioID}).Decode(&portfolio)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Associated portfolio not found"})
		return
	}

	// Perform DNS lookup to verify the CNAME record
	// The target is the Cloudflare Pages default subdomain for this project
	expectedTarget := fmt.Sprintf("portfolio-%s.pages.dev", portfolio.ID.Hex())
	cname, err := net.LookupCNAME(domain.Domain)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"verified": false,
			"error":    "DNS verification failed. CNAME record not found or configured incorrectly.",
			"details":  err.Error(),
		})
		return
	}

	// The result from LookupCNAME includes a trailing dot.
	if cname != expectedTarget+"." {
		c.JSON(http.StatusBadRequest, gin.H{
			"verified": false,
			"error":    fmt.Sprintf("CNAME record points to '%s', but should point to '%s'.", cname, expectedTarget),
		})
		return
	}

	// If DNS is verified, add the domain to the Cloudflare Pages project

	cfg := h.Config
	cfClient := cloudflare.NewClient(cfg)
	projectName := fmt.Sprintf("portfolio-%s", portfolio.ID.Hex())
	if err := cfClient.AddDomain(projectName, domain.Domain); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to add custom domain to Cloudflare project.",
			"details": err.Error(),
		})
		return
	}

	// Finally, update the database (Domain)
	_, err = database.Client.Database(database.DBName).Collection("domains").UpdateOne(
		context.Background(),
		bson.M{"_id": domainObjectID},
		bson.M{"$set": bson.M{"isVerified": true, "status": "active"}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update domain status in database."})
		return
	}

	// Sync to Portfolio
	database.Client.Database(database.DBName).Collection("portfolios").UpdateOne(
		context.Background(),
		bson.M{"_id": domain.PortfolioID},
		bson.M{"$set": bson.M{"customDomain": domain.Domain, "updatedAt": time.Now()}},
	)

	c.JSON(http.StatusOK, gin.H{
		"verified": true,
		"message":  "Domain verified and activated successfully!",
	})
}
