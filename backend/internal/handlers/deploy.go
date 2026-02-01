package handlers

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"seeqmeai/backend/internal/services"

	"github.com/gin-gonic/gin"
)

// injectAnalyticsScript injects analytics tracking code into HTML
func (h *Handler) injectAnalyticsScript(htmlContent string, portfolioID string) string {
	analyticsTag := fmt.Sprintf(
		`<script>
		window._seeqme = { portfolioId: '%s', pageUrl: window.location.href };
	</script>
	<script src="/analytics.js" defer></script></head>`,
		portfolioID,
	)

	// Replace closing </head> tag with analytics injection
	if strings.Contains(htmlContent, "</head>") {
		return strings.Replace(htmlContent, "</head>", analyticsTag, 1)
	}

	// Fallback: append to end if no </head> tag
	return htmlContent + analyticsTag
}

// generateAnalyticsScript generates the client-side analytics script
func (h *Handler) generateAnalyticsScript() string {
	return `
(function() {
  if (!window._seeqme) return;

  const portfolioId = window._seeqme.portfolioId;
  const backendUrl = '%s'; 

  // Track page view
  function trackPageView() {
    const payload = {
      portfolioId: portfolioId,
      eventType: 'page_view',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    };

    navigator.sendBeacon(backendUrl + '/api/v1/analytics/track', JSON.stringify(payload));
  }

  // Track clicks on portfolio links
  function trackLinkClick(event) {
    const target = event.target.closest('a');
    if (!target) return;

    const payload = {
      portfolioId: portfolioId,
      eventType: 'link_click',
      timestamp: new Date().toISOString(),
      linkUrl: target.href,
      linkText: target.textContent,
    };

    navigator.sendBeacon(backendUrl + '/api/v1/analytics/track', JSON.stringify(payload));
  }

  // Initialize tracking
  document.addEventListener('DOMContentLoaded', trackPageView);
  document.addEventListener('click', trackLinkClick);

  // Track page visibility changes
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
      trackPageView();
    }
  });
})();
`
}

// DeployRequest defines the structure for the incoming deployment request payload.
// It includes project details and the static content (HTML, CSS, JS) to be deployed.
type DeployRequest struct {
	ProjectName string `json:"projectName" binding:"required"` 
	Domain      string `json:"domain" binding:"required"`      
	HTML        string `json:"html"`                           
	CSS         string `json:"css"`                            
	JS          string `json:"js"`                           
}

// DeployHandler handles the HTTP request to initiate a portfolio deployment.
// It receives static content, saves it to a temporary directory, and then
// orchestrates the deployment to GitHub and Cloudflare Pages.
func (h *Handler) DeployHandler(c *gin.Context) {
	var req DeployRequest
	// Bind the incoming JSON request body to the DeployRequest struct.
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Load application configuration, including API keys and credentials.
	cfg := h.Config
	// Initialize the Orchestrator service with the loaded configuration.
	orchestrator := services.NewOrchestrator(cfg)

	// Create a unique temporary directory to store the static files (HTML, CSS, JS).
	// This directory will serve as the source for the Git push operation.
	tempSrcDir, err := ioutil.TempDir("", "deploy-src-")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to create temp dir: %v", err)})
		return
	}
	// Ensure the temporary directory is removed after the function completes.
	defer os.RemoveAll(tempSrcDir)

	// Inject analytics script into HTML
	htmlWithAnalytics := h.injectAnalyticsScript(req.HTML, req.ProjectName)

	// Write the provided HTML, CSS, and JS content into files within the temporary directory.
	if err := ioutil.WriteFile(filepath.Join(tempSrcDir, "index.html"), []byte(htmlWithAnalytics), 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to write index.html: %v", err)})
		return
	}
	if err := ioutil.WriteFile(filepath.Join(tempSrcDir, "style.css"), []byte(req.CSS), 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to write style.css: %v", err)})
		return
	}
	if err := ioutil.WriteFile(filepath.Join(tempSrcDir, "script.js"), []byte(req.JS), 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to write script.js: %v", err)})
		return
	}

	// Write analytics.js for client-side tracking
	backendURL := strings.TrimRight(h.Config.BackendURL, "/")

	analyticsJS := fmt.Sprintf(h.generateAnalyticsScript(), backendURL)
	if err := ioutil.WriteFile(filepath.Join(tempSrcDir, "analytics.js"), []byte(analyticsJS), 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to write analytics.js: %v", err)})
		return
	}

	// Call the orchestrator to execute the deployment workflow.
	// This involves GitHub repository operations and Cloudflare Pages setup.
	userEmail := c.MustGet("userEmail").(string) // Get user email from context

	// Define a simple streamLog for this handler (since it's not tied to a specific portfolio WebSocket)
	streamLog := func(message string, logType string) {
		log.Printf("[DeployHandlerLog] %s: %s", logType, message)
	}

	dnsRecordID, err := orchestrator.Deploy(req.ProjectName, req.Domain, tempSrcDir, userEmail, streamLog)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("deployment failed: %v", err)})
		return
	}

	// Respond with a success message if the deployment process was initiated successfully.
	// We might want to return the dnsRecordID or other deployment info here if needed by the frontend.
	c.JSON(http.StatusOK, gin.H{"message": "Deployment initiated successfully!", "dnsRecordID": dnsRecordID})
}
