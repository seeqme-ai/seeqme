package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"seeqmeai/backend/internal/config"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const fcmSendEndpoint = "https://fcm.googleapis.com/v1/projects/%s/messages:send"

// FCMService handles sending Firebase Cloud Messages.
type FCMService struct {
	projectID           string
	serviceAccountKeyJSON string
	httpClient          *http.Client
	tokenSource         oauth2.TokenSource
}

// NewFCMService initializes a new FCMService.
func NewFCMService(cfg *config.Config) (*FCMService, error) {
	if cfg.FirebaseProjectID == "" || cfg.FirebaseServiceAccountKeyJSON == "" {
		log.Println("Firebase Project ID or Service Account Key JSON not provided. FCM service will be disabled.")
		return nil, nil // Return nil service if not configured
	}

	creds, err := google.CredentialsFromJSON(context.Background(), []byte(cfg.FirebaseServiceAccountKeyJSON),
		"https://www.googleapis.com/auth/firebase.messaging")
	if err != nil {
		return nil, fmt.Errorf("failed to create Google credentials from JSON: %w", err)
	}

	client := oauth2.NewClient(context.Background(), creds.TokenSource)

	return &FCMService{
		projectID:           cfg.FirebaseProjectID,
		serviceAccountKeyJSON: cfg.FirebaseServiceAccountKeyJSON,
		httpClient:          client,
		tokenSource:         creds.TokenSource,
	}, nil
}

// SendNotification sends a push notification to a specific FCM token.
func (s *FCMService) SendNotification(token, title, body string) error {
	if s == nil {
		log.Println("FCM service is not initialized. Skipping notification.")
		return nil // Do nothing if service is nil (not configured)
	}

	message := map[string]interface{}{
		"message": map[string]interface{}{
			"token": token,
			"notification": map[string]string{
				"title": title,
				"body":  body,
			},
			"data": map[string]string{
				"click_action": "FLUTTER_NOTIFICATION_CLICK", // Required for Flutter to handle notifications
				"status":       "done",
			},
		},
	}

	jsonBody, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal FCM message: %w", err)
	}

	req, err := http.NewRequest("POST", fmt.Sprintf(fcmSendEndpoint, s.projectID), bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create FCM request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	// The http.Client created with oauth2.NewClient automatically adds the Authorization header.

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send FCM request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errorBody bytes.Buffer
		errorBody.ReadFrom(resp.Body)
		return fmt.Errorf("FCM API returned status %d: %s", resp.StatusCode, errorBody.String())
	}

	log.Printf("[FCM] Notification sent successfully to token: %s", token)
	return nil
}

// SendNotificationWithData sends a push notification with custom data to a specific FCM token.
func (s *FCMService) SendNotificationWithData(token, title, body string, data map[string]string) error {
	if s == nil {
		log.Println("FCM service is not initialized. Skipping notification.")
		return nil // Do nothing if service is nil (not configured)
	}

	// Ensure click_action is present for Flutter
	if _, ok := data["click_action"]; !ok {
		data["click_action"] = "FLUTTER_NOTIFICATION_CLICK"
	}
	if _, ok := data["status"]; !ok {
		data["status"] = "done"
	}

	message := map[string]interface{}{
		"message": map[string]interface{}{
			"token": token,
			"notification": map[string]string{
				"title": title,
				"body":  body,
			},
			"data": data,
		},
	}

	jsonBody, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal FCM message: %w", err)
	}

	req, err := http.NewRequest("POST", fmt.Sprintf(fcmSendEndpoint, s.projectID), bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create FCM request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send FCM request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errorBody bytes.Buffer
		errorBody.ReadFrom(resp.Body)
		return fmt.Errorf("FCM API returned status %d: %s", resp.StatusCode, errorBody.String())
	}

	log.Printf("[FCM] Notification sent successfully to token: %s", token)
	return nil
}
