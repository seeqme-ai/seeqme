package handlers

import (
	"context"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AdminSendEmailRequest struct {
	Subject       string   `json:"subject"`
	MessageTitle  string   `json:"messageTitle"`
	MessageBody   string   `json:"messageBody"`
	CtaUrl        string   `json:"ctaUrl"`
	CtaLabel      string   `json:"ctaLabel"`
	FooterNote    string   `json:"footerNote"`
	RecipientType string   `json:"recipientType"` // all | selected | custom
	UserIds       []string `json:"userIds"`
	Emails        []string `json:"emails"`
}

type AdminCreateTemplateRequest struct {
	TemplateID        string                 `json:"templateId"`
	Name              string                 `json:"name"`
	Niche             string                 `json:"niche"`
	Preview           string                 `json:"preview"`
	HTML              string                 `json:"html"`
	CSS               string                 `json:"css"`
	JS                string                 `json:"js"`
	StructuredContent map[string]interface{} `json:"structuredContent"`

	Notify       bool     `json:"notify"`
	NotifyTarget string   `json:"notifyTarget"` // all | niche | selected
	UserIds      []string `json:"userIds"`
	Highlights   []string `json:"highlights"`
	CtaUrl       string   `json:"ctaUrl"`
	CtaLabel     string   `json:"ctaLabel"`
	FooterNote   string   `json:"footerNote"`
}

type adminRecipient struct {
	Email    string
	FullName string
}

func (h *Handler) AdminSendEmail(c *gin.Context) {
	var req AdminSendEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	subject := strings.TrimSpace(req.Subject)
	messageBody := strings.TrimSpace(req.MessageBody)

	if subject == "" || messageBody == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Subject and message body are required"})
		return
	}

	recipients, err := h.resolveRecipients(req.RecipientType, req.UserIds, req.Emails, "")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(recipients) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No valid recipients found"})
		return
	}

	sent := 0
	failed := 0
	errors := []string{}

	for _, recipient := range recipients {
		name := strings.TrimSpace(recipient.FullName)
		if name == "" {
			name = "there"
		}
		emailData := map[string]interface{}{
			"FullName":    name,
			"MessageTitle": defaultIfEmpty(req.MessageTitle, "Announcement"),
			"MessageBody":  messageBody,
			"CtaUrl":       strings.TrimSpace(req.CtaUrl),
			"CtaLabel":     defaultIfEmpty(req.CtaLabel, "Open SeeqMe"),
			"FooterNote":   strings.TrimSpace(req.FooterNote),
		}
		if err := h.Resend.SendEmail(recipient.Email, subject, "admin_broadcast.html", emailData); err != nil {
			failed++
			errors = append(errors, recipient.Email+": "+err.Error())
		} else {
			sent++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"sent":   sent,
		"failed": failed,
		"errors": errors,
	})
}

func (h *Handler) AdminCreateTemplate(c *gin.Context) {
	var req AdminCreateTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	name := strings.TrimSpace(req.Name)
	niche := strings.TrimSpace(req.Niche)
	templateID := strings.TrimSpace(req.TemplateID)

	if name == "" || niche == "" || templateID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "templateId, name, and niche are required"})
		return
	}
	if req.StructuredContent == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "structuredContent is required for editable templates"})
		return
	}
	if err := validateTemplateManifest(req.StructuredContent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	template := models.AdminTemplate{
		ID:                primitive.NewObjectID(),
		TemplateID:        templateID,
		Name:              name,
		Niche:             niche,
		Preview:           strings.TrimSpace(req.Preview),
		HTML:              req.HTML,
		CSS:               req.CSS,
		JS:                req.JS,
		StructuredContent: req.StructuredContent,
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	db := database.Client.Database(database.DBName)
	_, err := db.Collection("admin_templates").InsertOne(context.Background(), template)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save template"})
		return
	}

	result := gin.H{"template": template}

	if req.Notify {
		recipients, rErr := h.resolveRecipients(req.NotifyTarget, req.UserIds, nil, niche)
		if rErr != nil {
			result["notifyError"] = rErr.Error()
		} else if len(recipients) == 0 {
			result["notifyError"] = "No recipients matched notification settings"
		} else {
			sent := 0
			failed := 0
			errors := []string{}

			for _, recipient := range recipients {
				name := strings.TrimSpace(recipient.FullName)
				if name == "" {
					name = "there"
				}
				emailData := map[string]interface{}{
					"FullName":      name,
					"TemplateName":  nameOrDefault(template.Name, "New Template"),
					"TemplateNiche": template.Niche,
					"Highlights":    req.Highlights,
					"CtaUrl":        strings.TrimSpace(req.CtaUrl),
					"CtaLabel":      defaultIfEmpty(req.CtaLabel, "Preview Template"),
					"FooterNote":    strings.TrimSpace(req.FooterNote),
				}
				if err := h.Resend.SendEmail(recipient.Email, "New template now available on SeeqMe", "template_launch.html", emailData); err != nil {
					failed++
					errors = append(errors, recipient.Email+": "+err.Error())
				} else {
					sent++
				}
			}

			result["notifySent"] = sent
			result["notifyFailed"] = failed
			result["notifyErrors"] = errors
		}
	}

	c.JSON(http.StatusCreated, result)
}

func (h *Handler) AdminUpdateTemplate(c *gin.Context) {
	templateObjectID := strings.TrimSpace(c.Param("id"))
	if templateObjectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "template id is required"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(templateObjectID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid template id"})
		return
	}

	var req AdminCreateTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	name := strings.TrimSpace(req.Name)
	niche := strings.TrimSpace(req.Niche)
	templateID := strings.TrimSpace(req.TemplateID)

	if name == "" || niche == "" || templateID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "templateId, name, and niche are required"})
		return
	}
	if req.StructuredContent == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "structuredContent is required for editable templates"})
		return
	}
	if err := validateTemplateManifest(req.StructuredContent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	updateDoc := bson.M{
		"$set": bson.M{
			"templateId":        templateID,
			"name":              name,
			"niche":             niche,
			"preview":           strings.TrimSpace(req.Preview),
			"html":              req.HTML,
			"css":               req.CSS,
			"js":                req.JS,
			"structuredContent": req.StructuredContent,
			"updatedAt":         now,
		},
	}

	db := database.Client.Database(database.DBName)
	result, err := db.Collection("admin_templates").UpdateByID(context.Background(), objectID, updateDoc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update template"})
		return
	}
	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}

	response := gin.H{"updated": true}

	if req.Notify {
		recipients, rErr := h.resolveRecipients(req.NotifyTarget, req.UserIds, nil, niche)
		if rErr != nil {
			response["notifyError"] = rErr.Error()
		} else if len(recipients) == 0 {
			response["notifyError"] = "No recipients matched notification settings"
		} else {
			sent := 0
			failed := 0
			errors := []string{}

			for _, recipient := range recipients {
				name := strings.TrimSpace(recipient.FullName)
				if name == "" {
					name = "there"
				}
				emailData := map[string]interface{}{
					"FullName":      name,
					"TemplateName":  nameOrDefault(req.Name, "Updated Template"),
					"TemplateNiche": niche,
					"Highlights":    req.Highlights,
					"CtaUrl":        strings.TrimSpace(req.CtaUrl),
					"CtaLabel":      defaultIfEmpty(req.CtaLabel, "Preview Template"),
					"FooterNote":    strings.TrimSpace(req.FooterNote),
				}
				if err := h.Resend.SendEmail(recipient.Email, "Template update now available on SeeqMe", "template_launch.html", emailData); err != nil {
					failed++
					errors = append(errors, recipient.Email+": "+err.Error())
				} else {
					sent++
				}
			}

			response["notifySent"] = sent
			response["notifyFailed"] = failed
			response["notifyErrors"] = errors
		}
	}

	c.JSON(http.StatusOK, response)
}

func (h *Handler) AdminDeleteTemplate(c *gin.Context) {
	templateObjectID := strings.TrimSpace(c.Param("id"))
	if templateObjectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "template id is required"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(templateObjectID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid template id"})
		return
	}

	db := database.Client.Database(database.DBName)
	result, err := db.Collection("admin_templates").DeleteOne(context.Background(), bson.M{"_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete template"})
		return
	}
	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (h *Handler) AdminGetTemplates(c *gin.Context) {
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

	c.JSON(http.StatusOK, templates)
}

func (h *Handler) resolveRecipients(recipientType string, userIds []string, emails []string, niche string) ([]adminRecipient, error) {
	db := database.Client.Database(database.DBName)
	recipients := []adminRecipient{}

	switch strings.ToLower(strings.TrimSpace(recipientType)) {
	case "all":
		cursor, err := db.Collection("users").Find(context.Background(), bson.M{})
		if err != nil {
			return nil, err
		}
		defer cursor.Close(context.Background())
		for cursor.Next(context.Background()) {
			var user models.User
			if err := cursor.Decode(&user); err == nil && strings.TrimSpace(user.Email) != "" {
				recipients = append(recipients, adminRecipient{Email: user.Email, FullName: user.FullName})
			}
		}
	case "selected":
		ids := toObjectIDs(userIds)
		if len(ids) == 0 {
			return nil, fmt.Errorf("select at least one user")
		}
		cursor, err := db.Collection("users").Find(context.Background(), bson.M{"_id": bson.M{"$in": ids}})
		if err != nil {
			return nil, err
		}
		defer cursor.Close(context.Background())
		for cursor.Next(context.Background()) {
			var user models.User
			if err := cursor.Decode(&user); err == nil && strings.TrimSpace(user.Email) != "" {
				recipients = append(recipients, adminRecipient{Email: user.Email, FullName: user.FullName})
			}
		}
	case "custom":
		for _, email := range emails {
			email = strings.TrimSpace(email)
			if email == "" || !strings.Contains(email, "@") {
				continue
			}
			recipients = append(recipients, adminRecipient{Email: email, FullName: ""})
		}
	case "niche":
		niche = strings.TrimSpace(niche)
		if niche == "" {
			return nil, fmt.Errorf("niche is required for niche targeting")
		}
		regex := primitive.Regex{Pattern: "^" + regexp.QuoteMeta(niche) + "$", Options: "i"}
		userIDs, err := db.Collection("portfolios").Distinct(context.Background(), "userId", bson.M{"niche": regex})
		if err != nil {
			return nil, err
		}
		objIDs := []primitive.ObjectID{}
		for _, id := range userIDs {
			switch v := id.(type) {
			case primitive.ObjectID:
				objIDs = append(objIDs, v)
			case string:
				if oid, err := primitive.ObjectIDFromHex(v); err == nil {
					objIDs = append(objIDs, oid)
				}
			}
		}
		if len(objIDs) == 0 {
			return recipients, nil
		}
		cursor, err := db.Collection("users").Find(context.Background(), bson.M{"_id": bson.M{"$in": objIDs}})
		if err != nil {
			return nil, err
		}
		defer cursor.Close(context.Background())
		for cursor.Next(context.Background()) {
			var user models.User
			if err := cursor.Decode(&user); err == nil && strings.TrimSpace(user.Email) != "" {
				recipients = append(recipients, adminRecipient{Email: user.Email, FullName: user.FullName})
			}
		}
	default:
		return nil, fmt.Errorf("invalid recipientType")
	}

	recipients = dedupeRecipients(recipients)
	return recipients, nil
}

func dedupeRecipients(list []adminRecipient) []adminRecipient {
	seen := map[string]bool{}
	out := []adminRecipient{}
	for _, r := range list {
		key := strings.ToLower(strings.TrimSpace(r.Email))
		if key == "" || seen[key] {
			continue
		}
		seen[key] = true
		out = append(out, r)
	}
	return out
}

func toObjectIDs(ids []string) []primitive.ObjectID {
	out := []primitive.ObjectID{}
	for _, id := range ids {
		id = strings.TrimSpace(id)
		if id == "" {
			continue
		}
		if oid, err := primitive.ObjectIDFromHex(id); err == nil {
			out = append(out, oid)
		}
	}
	return out
}

func defaultIfEmpty(val string, fallback string) string {
	if strings.TrimSpace(val) == "" {
		return fallback
	}
	return strings.TrimSpace(val)
}

func nameOrDefault(val string, fallback string) string {
	return defaultIfEmpty(val, fallback)
}

func validateTemplateManifest(payload map[string]interface{}) error {
	metadata, ok := payload["metadata"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("structuredContent.metadata is required")
	}
	if metadata["version"] == nil {
		return fmt.Errorf("structuredContent.metadata.version is required")
	}
	globalConfig, ok := payload["globalConfig"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("structuredContent.globalConfig is required")
	}
	if globalConfig["theme"] == nil {
		return fmt.Errorf("structuredContent.globalConfig.theme is required")
	}
	sectionsRaw, ok := payload["sections"].([]interface{})
	if !ok || len(sectionsRaw) == 0 {
		return fmt.Errorf("structuredContent.sections must be a non-empty array")
	}
	for idx, raw := range sectionsRaw {
		section, ok := raw.(map[string]interface{})
		if !ok {
			return fmt.Errorf("section %d is invalid", idx+1)
		}
		if strings.TrimSpace(fmt.Sprint(section["id"])) == "" {
			return fmt.Errorf("section %d is missing id", idx+1)
		}
		if strings.TrimSpace(fmt.Sprint(section["type"])) == "" {
			return fmt.Errorf("section %d is missing type", idx+1)
		}
		if strings.TrimSpace(fmt.Sprint(section["componentId"])) == "" {
			return fmt.Errorf("section %d is missing componentId", idx+1)
		}
		if _, ok := section["content"]; !ok {
			return fmt.Errorf("section %d is missing content", idx+1)
		}
	}
	return nil
}

 
