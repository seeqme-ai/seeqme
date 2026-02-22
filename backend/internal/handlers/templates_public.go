package handlers

import (
	"context"
	"net/http"
	"time"

	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PublicTemplateResponse struct {
	TemplateID        string                 `json:"templateId"`
	Name              string                 `json:"name"`
	Niche             string                 `json:"niche"`
	Preview           string                 `json:"preview"`
	HTML              string                 `json:"html,omitempty"`
	CSS               string                 `json:"css,omitempty"`
	JS                string                 `json:"js,omitempty"`
	StructuredContent map[string]interface{} `json:"structuredContent,omitempty"`
	CreatedAt         time.Time              `json:"createdAt"`
}

func (h *Handler) GetPublicTemplates(c *gin.Context) {
	db := database.Client.Database(database.DBName)
	opts := options.Find().SetSort(bson.M{"createdAt": -1})
	cursor, err := db.Collection("admin_templates").Find(context.Background(), bson.M{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch templates"})
		return
	}
	defer cursor.Close(context.Background())

	var templates []models.AdminTemplate
	if err := cursor.All(context.Background(), &templates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode templates"})
		return
	}

	resp := make([]PublicTemplateResponse, 0, len(templates))
	for _, tpl := range templates {
		resp = append(resp, PublicTemplateResponse{
			TemplateID:        tpl.TemplateID,
			Name:              tpl.Name,
			Niche:             tpl.Niche,
			Preview:           tpl.Preview,
			HTML:              tpl.HTML,
			CSS:               tpl.CSS,
			JS:                tpl.JS,
			StructuredContent: tpl.StructuredContent,
			CreatedAt:         tpl.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, resp)
}
