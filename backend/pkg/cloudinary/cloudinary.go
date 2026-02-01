package cloudinary

import (
	"bytes"
	"context"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"
)

type UploadResult struct {
	PublicID  string `json:"public_id"`
	URL       string `json:"url"`
	SecureURL string `json:"secure_url"`
}

func generateSignature(params map[string]string, apiSecret string) string {
	var keys []string
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var parts []string
	for _, k := range keys {
		parts = append(parts, fmt.Sprintf("%s=%s", k, params[k]))
	}

	raw := strings.Join(parts, "&") + apiSecret
	h := sha1.New()
	h.Write([]byte(raw))
	return hex.EncodeToString(h.Sum(nil))
}

func UploadFile(ctx context.Context, file multipart.File, filename string) (*UploadResult, error) {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		return nil, fmt.Errorf("cloudinary credentials not configured")
	}

	url := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/upload", cloudName)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, err
	}

	_, err = io.Copy(part, file)
	if err != nil {
		return nil, err
	}

	timestamp := fmt.Sprintf("%d", time.Now().Unix())
	params := map[string]string{
		"timestamp":     timestamp,
		"upload_preset": "ml_default",
	}

	signature := generateSignature(params, apiSecret)

	writer.WriteField("api_key", apiKey)
	writer.WriteField("timestamp", timestamp)
	writer.WriteField("upload_preset", "ml_default")
	writer.WriteField("signature", signature)

	writer.Close()

	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errorResult map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errorResult)
		return nil, fmt.Errorf("cloudinary upload failed with status %d: %v", resp.StatusCode, errorResult)
	}

	var result UploadResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func DeleteFile(ctx context.Context, publicID string) error {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		return fmt.Errorf("cloudinary credentials not configured")
	}

	url := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/destroy", cloudName)

	timestamp := fmt.Sprintf("%d", time.Now().Unix())
	params := map[string]string{
		"public_id": publicID,
		"timestamp": timestamp,
	}

	signature := generateSignature(params, apiSecret)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("public_id", publicID)
	writer.WriteField("api_key", apiKey)
	writer.WriteField("timestamp", timestamp)
	writer.WriteField("signature", signature)
	writer.Close()

	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errorResult map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errorResult)
		return fmt.Errorf("cloudinary delete failed: %v", errorResult)
	}

	return nil
}
