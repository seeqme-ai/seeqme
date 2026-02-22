package resend

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"path/filepath"
	"runtime"
	"time"

	"seeqmeai/backend/internal/config"
)

type Resend struct {
	apiKey     string
	fromEmail  string
	templateFS *template.Template
}

func New(cfg *config.Config) *Resend {
	_, b, _, _ := runtime.Caller(0)
	basePath := filepath.Dir(b)
	pkgPath := filepath.Dir(basePath)
	templatePath := filepath.Join(pkgPath, "email_templates")

	return &Resend{
		apiKey:     cfg.ResendApiKey,
		fromEmail:  "support@seeqme.com",
		templateFS: template.Must(template.ParseGlob(filepath.Join(templatePath, "*.html"))),
	}
}

type EmailRequest struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Subject string `json:"subject"`
	Html    string `json:"html"`
}

// The data parameter should be a map[string]interface{} that matches the template's expected fields.
func (r *Resend) SendEmail(to, subject, templateName string, data map[string]interface{}) error {
	if r.apiKey == "" {
		return fmt.Errorf("resend API key not configured")
	}

	// Add current year to data
	data["Year"] = time.Now().Year()

	// Execute the template with the provided data
	var tplBuffer bytes.Buffer
	if err := r.templateFS.ExecuteTemplate(&tplBuffer, templateName, data); err != nil {
		return fmt.Errorf("failed to execute email template %s: %w", templateName, err)
	}

	emailReq := EmailRequest{
		From:    r.fromEmail,
		To:      to,
		Subject: subject,
		Html:    tplBuffer.String(),
	}

	jsonBody, err := json.Marshal(emailReq)
	if err != nil {
		return fmt.Errorf("failed to marshal email request: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create resend request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+r.apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email via resend: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errorBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errorBody)
		return fmt.Errorf("resend API returned status %d: %v", resp.StatusCode, errorBody)
	}

	return nil
}

// SendRawEmail sends a raw HTML email without templates.
func (r *Resend) SendRawEmail(to, subject, html string) error {
	if r.apiKey == "" {
		return fmt.Errorf("resend API key not configured")
	}

	emailReq := EmailRequest{
		From:    r.fromEmail,
		To:      to,
		Subject: subject,
		Html:    html,
	}

	jsonBody, err := json.Marshal(emailReq)
	if err != nil {
		return fmt.Errorf("failed to marshal email request: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create resend request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+r.apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email via resend: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errorBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errorBody)
		return fmt.Errorf("resend API returned status %d: %v", resp.StatusCode, errorBody)
	}

	return nil
}
