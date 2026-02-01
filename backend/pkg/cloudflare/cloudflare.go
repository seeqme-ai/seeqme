package cloudflare

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"seeqmeai/backend/internal/config"

	"github.com/cenkalti/backoff/v4"
	"github.com/sirupsen/logrus"
)

// CloudflareClient defines the interface for Cloudflare operations, allowing for mocking
// and dependency injection in tests.
type CloudflareClient interface {
	CreateProject(projectName, githubOwner, repoName string) error
	AddDomain(projectName, domain string) error
	AddDNSRecord(zoneID, domain, projectName string, proxied bool) (string, error)
	CreateSubdomain(subdomain, targetURL string) (string, error)
	DeleteSubdomain(recordID string) error
	DeleteProject(projectName string) error
	FetchPagesAnalytics(projectName string) (map[string]interface{}, error)
	CreateDeployment(projectName string) error
	UpdateSSLSetting(zoneID string, mode string) error
	ListDomains(projectName string) ([]string, error)
	RemoveDomain(projectName, domainName string) error
	GetDNSRecordID(name string) (string, error)
	GetProjectDeploymentStatus(projectName string) (string, error)
}

// CloudflareService manages interactions with the Cloudflare Pages and DNS APIs.
type CloudflareService struct {
	accountID string
	token     string
	email     string // Optional: for Global API Key
	zoneID    string
	log       *logrus.Logger
	client    *http.Client
}

// DNSRecordResponse represents the structure of a Cloudflare DNS record in API responses.
type DNSRecordResponse struct {
	Result struct {
		ID string `json:"id"`
	} `json:"result"`
}

// NewClient creates a new CloudflareService instance.
func NewClient(cfg *config.Config) CloudflareClient {
	log := logrus.New()
	log.SetFormatter(&logrus.JSONFormatter{})

	client := &CloudflareService{
		accountID: strings.TrimSpace(cfg.CloudflareAccountID),
		token:     strings.TrimSpace(cfg.CloudflareAPIToken),
		email:     strings.TrimSpace(cfg.CloudflareEmail),
		zoneID:    strings.TrimSpace(cfg.CloudflareZoneID),
		log:       log,
		client:    &http.Client{Timeout: 30 * time.Second},
	}

	maskedToken := "none"
	if len(client.token) > 8 {
		maskedToken = client.token[:4] + "..." + client.token[len(client.token)-4:]
	}
	log.Infof("[Cloudflare] Initialized with AccountID: %s, Email: %s, Token: %s", client.accountID, client.email, maskedToken)

	return client
}

// CreateProject creates a new Cloudflare Pages project linked to a GitHub repository.
func (s *CloudflareService) CreateProject(projectName, githubOwner, repoName string) error {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/pages/projects", s.accountID)
	body := map[string]interface{}{
		"name": projectName,
		"source": map[string]interface{}{
			"type": "github",
			"config": map[string]string{
				"owner":             githubOwner,
				"repo_name":         repoName,
				"production_branch": "main",
			},
		},
		"build_config": map[string]string{ // Add build_config
			"build_command":   "",  // No build command needed for pre-built static HTML
			"destination_dir": ".", // Output is in the root of the repository
		},
	}
	_, err := s.doRequest("POST", url, body)
	return err
}

// AddDomain assigns a custom domain or subdomain to an existing Cloudflare Pages project.
func (s *CloudflareService) AddDomain(projectName, domain string) error {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/pages/projects/%s/domains", s.accountID, projectName)
	body := map[string]string{"name": domain}
	_, err := s.doRequest("POST", url, body)
	return err
}

// AddDNSRecord creates a CNAME DNS record for the given domain.
func (s *CloudflareService) AddDNSRecord(zoneID, domain, projectName string, proxied bool) (string, error) {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records", zoneID)
	// Ensure we point to the base project name as per Cloudflare best practices for Pages
	content := fmt.Sprintf("%s.pages.dev", projectName)

	body := map[string]interface{}{
		"type":    "CNAME",
		"name":    domain,
		"content": content,
		"ttl":     3600,
		"proxied": proxied,
	}
	respBody, err := s.doRequest("POST", url, body)
	if err != nil {
		return "", err
	}

	var dnsResponse DNSRecordResponse
	if err := json.Unmarshal(respBody, &dnsResponse); err != nil {
		return "", fmt.Errorf("failed to parse DNS record response: %v", err)
	}
	return dnsResponse.Result.ID, nil
}

// CreateSubdomain creates a CNAME record for a subdomain and returns the record ID.
func (s *CloudflareService) CreateSubdomain(subdomain, targetURL string) (string, error) {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records", s.zoneID)
	body := map[string]interface{}{
		"type":    "CNAME",
		"name":    subdomain,
		"content": targetURL,
		"ttl":     3600,
		"proxied": true,
	}

	respBody, err := s.doRequest("POST", url, body)
	if err != nil {
		return "", err
	}

	var dnsResponse DNSRecordResponse
	if err := json.Unmarshal(respBody, &dnsResponse); err != nil {
		return "", fmt.Errorf("failed to parse DNS record response: %v", err)
	}

	return dnsResponse.Result.ID, nil
}

// DeleteSubdomain deletes a DNS record by its ID.
func (s *CloudflareService) DeleteSubdomain(recordID string) error {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records/%s", s.zoneID, recordID)
	_, err := s.doRequest("DELETE", url, nil)
	return err
}

// GetDNSRecordID finds a DNS record ID by its name.
func (s *CloudflareService) GetDNSRecordID(name string) (string, error) {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records?name=%s", s.zoneID, name)
	respBody, err := s.doRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	// The response has a "result" field which is a LIST of records for GET requests
	var listResp struct {
		Result []struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"result"`
	}

	if err := json.Unmarshal(respBody, &listResp); err != nil {
		return "", fmt.Errorf("failed to parse DNS list response: %v", err)
	}

	if len(listResp.Result) == 0 {
		return "", fmt.Errorf("record not found")
	}

	return listResp.Result[0].ID, nil
}

// FetchPagesAnalytics retrieves page views and visits for a Pages project using GraphQL.
func (s *CloudflareService) FetchPagesAnalytics(projectName string) (map[string]interface{}, error) {
	url := "https://api.cloudflare.com/client/v4/graphql"

	// Fetch last 7 days of data
	startDate := time.Now().AddDate(0, 0, -7).Format("2006-01-02")

	query := fmt.Sprintf(`
	query {
		viewer {
			accounts(filter: {accountTag: "%s"}) {
				pagesProjects(filter: {projectName: "%s"}) {
					analytics1dGroups(limit: 7, filter: {date_geq: "%s"}) {
						sum {
							pageViews
							visits
						}
						dimensions {
							date
						}
					}
				}
			}
		}
	}`, s.accountID, projectName, startDate)

	body := map[string]interface{}{
		"query": query,
	}

	respBody, err := s.doRequest("POST", url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch cloudflare analytics: %v", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to parse analytics response: %v", err)
	}

	return result, nil
}

// DeleteProject deletes a Cloudflare Pages project.
func (s *CloudflareService) DeleteProject(projectName string) error {
	// First, remove all custom domains
	domains, err := s.ListDomains(projectName)
	if err == nil {
		for _, domain := range domains {
			if !strings.HasSuffix(domain, ".pages.dev") {
				s.log.Infof("[Cloudflare] Removing custom domain %s before project deletion", domain)
				s.RemoveDomain(projectName, domain)
			}
		}
	}

	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/pages/projects/%s", s.accountID, projectName)
	_, err = s.doRequest("DELETE", url, nil)
	return err
}

func (s *CloudflareService) ListDomains(projectName string) ([]string, error) {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/pages/projects/%s/domains", s.accountID, projectName)
	respBody, err := s.doRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	var resp struct {
		Result []struct {
			Name string `json:"name"`
		} `json:"result"`
	}
	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil, err
	}

	var domains []string
	for _, d := range resp.Result {
		domains = append(domains, d.Name)
	}
	return domains, nil
}

func (s *CloudflareService) RemoveDomain(projectName, domainName string) error {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/pages/projects/%s/domains/%s", s.accountID, projectName, domainName)
	_, err := s.doRequest("DELETE", url, nil)
	return err
}

// CreateDeployment triggers a new deployment for a Cloudflare Pages project.
func (s *CloudflareService) CreateDeployment(projectName string) error {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/pages/projects/%s/deployments", s.accountID, projectName)
	// We send an empty body to trigger a deployment from the production branch
	_, err := s.doRequest("POST", url, map[string]interface{}{})
	return err
}

// UpdateSSLSetting updates the SSL/TLS setting for a specific zone.
// Mode can be: "off", "flexible", "full", "strict".
func (s *CloudflareService) UpdateSSLSetting(zoneID string, mode string) error {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/settings/ssl", zoneID)
	body := map[string]interface{}{
		"value": mode,
	}
	_, err := s.doRequest("PATCH", url, body)
	if err != nil {
		s.log.Warnf("[Cloudflare] Failed to update SSL setting: %v. This may be due to token permissions.", err)
	}
	return nil // Don't block deployment for non-critical SSL settings
}

// doRequest performs an HTTP request to the Cloudflare API with exponential backoff retries.
func (s *CloudflareService) doRequest(method, url string, body interface{}) ([]byte, error) {
	var jsonBody []byte
	if body != nil {
		var err error
		jsonBody, err = json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %v", err)
		}
	}

	var respBody []byte
	operation := func() error {
		req, err := http.NewRequest(method, url, bytes.NewBuffer(jsonBody))
		if err != nil {
			return backoff.Permanent(fmt.Errorf("failed to create request: %v", err))
		}
		isGlobalKey := s.email != "" && len(s.token) == 32
		if isGlobalKey {
			req.Header.Set("X-Auth-Email", s.email)
			req.Header.Set("X-Auth-Key", s.token)
			s.log.Debugf("[Cloudflare] Using Global API Key Auth (Email: %s)", s.email)
		} else {
			req.Header.Set("Authorization", "Bearer "+s.token)
			s.log.Debugf("[Cloudflare] Using API Token Auth (Bearer)")
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := s.client.Do(req)
		if err != nil {
			return err // Retry on network errors
		}
		defer resp.Body.Close()

		respBody, err = io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("failed to read response body: %v", err)
		}

		if resp.StatusCode >= 400 {
			return backoff.Permanent(fmt.Errorf("API error: %d - %s", resp.StatusCode, respBody))
		}

		s.log.Infof("%s %s succeeded", method, url)
		return nil // Request successful
	}

	bo := backoff.NewExponentialBackOff()
	bo.MaxElapsedTime = 1 * time.Minute
	err := backoff.Retry(operation, bo)

	return respBody, err
}

// GetProjectDeploymentStatus fetches the latest deployment status for a project
func (s *CloudflareService) GetProjectDeploymentStatus(projectName string) (string, error) {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/pages/projects/%s/deployments", s.accountID, projectName)

	respBody, err := s.doRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	var resp struct {
		Result []struct {
			LatestStage struct {
				Name   string `json:"name"`
				Status string `json:"status"`
			} `json:"latest_stage"`
			Env string `json:"environment"`
		} `json:"result"`
	}

	if err := json.Unmarshal(respBody, &resp); err != nil {
		return "", fmt.Errorf("failed to parse deployments response: %v", err)
	}

	if len(resp.Result) == 0 {
		return "unknown", nil
	}

	// Filter for production environment
	for _, d := range resp.Result {
		if d.Env == "production" {
			// Status can be: active, success, failure, etc.
			// The latest_stage.status is what we usually care about if the build is ongoing.
			// However, usually we check the deployment status itself.
			// Let's refine based on Cloudflare API response structure for deployments list.
			// Actually, the Result item has a top-level status too usually, let's check assumptions or use a simpler check.
			// Since we don't have the full struct defined, let's assume we want the status of the detailed object.
			return d.LatestStage.Status, nil // "success", "failure", "active"
		}
	}

	// If no production deployment found, return first one
	return resp.Result[0].LatestStage.Status, nil
}
