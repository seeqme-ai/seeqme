package handlers

import (
	"context"
	"time"

	"seeqmeai/backend/internal/database"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// createPortfolioBackup creates a backup of a portfolio before updates
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
	now := time.Now()
	backup := bson.M{
		"_id":         primitive.NewObjectID(),
		"portfolioId": portfolioID,
		"html":        portfolio["html"],
		"css":         portfolio["css"],
		"js":          portfolio["js"],
		"version":     portfolio["version"],
		"subdomain":   portfolio["subdomain"],
		"status":      portfolio["status"],
		"createdAt":   primitive.NewDateTimeFromTime(now),
		"expiresAt":   primitive.NewDateTimeFromTime(now.Add(30 * 24 * time.Hour)), // 30-day TTL
	}

	_, err = backupCollection.InsertOne(context.Background(), backup)
	return err
}

// extractSEOData extracts hero name, title, bio, image, avatar, and social links from structured content
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
						// Fallback to heroTagline if bio wasn't found earlier
						if heroBio == "" {
							if tagline, taglineOk := content["heroTagline"].(string); taglineOk {
								heroBio = tagline
							}
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

// getLatestBackup retrieves the most recent backup for a portfolio
func (h *Handler) getLatestBackup(portfolioID string) (bson.M, error) {
	backupCollection := database.Client.Database(database.DBName).Collection("backups")
	var backup bson.M
	opts := options.FindOne().SetSort(bson.M{"createdAt": -1})
	err := backupCollection.FindOne(context.Background(), bson.M{
		"portfolioId": portfolioID,
	}, opts).Decode(&backup)
	return backup, err
}

// getNextVersion returns the next version number for a portfolio
func (h *Handler) getNextVersion(portfolio bson.M) int {
	currentVersion, ok := portfolio["version"].(int32)
	if !ok {
		return 1
	}
	return int(currentVersion) + 1
}

// getDeploymentStatus returns the latest deployment status for a portfolio
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
