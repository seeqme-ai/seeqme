package services

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"seeqmeai/backend/internal/config"
	"seeqmeai/backend/pkg/cloudflare"
	"seeqmeai/backend/pkg/github"

	"github.com/sirupsen/logrus"
)

type Orchestrator struct {
	github     *github.GitHubService
	cloudflare cloudflare.CloudflareClient
	log        *logrus.Logger
	config     *config.Config
}

// NewOrchestrator creates a new Orchestrator instance.
// It initializes GitHub and Cloudflare services with configurations loaded from the app config.
func NewOrchestrator(cfg *config.Config) *Orchestrator {
	log := logrus.New()
	log.SetFormatter(&logrus.TextFormatter{FullTimestamp: true})

	return &Orchestrator{
		github:     github.NewGitHubService(cfg.GitHubToken, cfg.GitHubOwner, log),
		cloudflare: cloudflare.NewClient(cfg),
		log:        log,
		config:     cfg,
	}
}

// Deploy orchestrates the entire deployment workflow for a portfolio.
// This includes creating a GitHub repository, pushing static files, creating a
// Cloudflare Pages project, and configuring the domain/DNS.
// srcDir is the path to the directory containing the static files to be deployed.
func (o *Orchestrator) Deploy(projectName, domain, srcDir, userEmail string, streamLog func(message string, logType string)) (string, error) {
	// Create a unique temporary directory for Git operations.
	// This ensures isolation for concurrent deployments.
	gitTempDir, err := os.MkdirTemp("", "git-repo-")
	if err != nil {
		return "", fmt.Errorf("failed to create git temp dir: %v", err)
	}
	defer os.RemoveAll(gitTempDir) // Clean up the temporary directory after function exits

	// Create or get GitHub repository.
	// The repository name is derived from the project name.
	repoURL, err := o.github.CreateRepo(context.Background(), projectName, false) // 'false' for public repo
	if err != nil {
		return "", fmt.Errorf("github repo operation failed: %v", err)
	}

	// Push static files to the GitHub repository.
	// This triggers a new deployment on Cloudflare Pages if integrated.
	statusUpdate := func(msg string) {
		streamLog(fmt.Sprintf("Source Control Sync: %s", msg), "info")
	}
	if err := o.github.PushFiles(repoURL, projectName, srcDir, gitTempDir, userEmail, statusUpdate); err != nil {
		return "", fmt.Errorf("github push failed: %v", err)
	}

	// Create Cloudflare Pages project.
	// Links the GitHub repository to Cloudflare for continuous deployment.
	if err := o.cloudflare.CreateProject(projectName, o.config.GitHubOwner, projectName); err != nil {
		if !strings.Contains(err.Error(), "409") {
			return "", fmt.Errorf("project creation failed: %v", err)
		}
		o.log.Infof("Cloudflare project %s already exists, skipping creation", projectName)
	}

	//  Add custom domain.
	if err := o.cloudflare.AddDomain(projectName, domain); err != nil {
		// Code 8000018: "You have already added this custom domain" (Status 400)
		if !strings.Contains(err.Error(), "409") && !strings.Contains(err.Error(), "8000018") && !strings.Contains(err.Error(), "already added") {
			return "", fmt.Errorf("domain assignment failed: %v", err)
		}
		o.log.Infof("Cloudflare domain %s already assigned to %s", domain, projectName)
	}

	//  Trigger initial deployment.
	// Cloudflare Pages doesn't always auto-deploy on initial project creation via API.
	streamLog("Initializing global deployment network...", "info")
	if err := o.cloudflare.CreateDeployment(projectName); err != nil {
		o.log.Warnf("Failed to trigger initial deployment: %v", err)
		// We don't fail the whole operation if this fails, as GitHub push might still trigger it.
	}

	// Poll Cloudflare for deployment status
	streamLog("Waiting for edge propagation...", "info")
	maxRetries := 60 // 5 minutes (5s interval)
	for i := 0; i < maxRetries; i++ {
		time.Sleep(5 * time.Second)
		status, err := o.cloudflare.GetProjectDeploymentStatus(projectName)
		if err != nil {
			o.log.Warnf("Failed to poll deployment status: %v", err)
			continue
		}

		if status == "success" {
			streamLog("Deployment verification successful!", "success")
			break
		} else if status == "failure" {
			return "", fmt.Errorf("edge deployment failed")
		} else {
			streamLog(fmt.Sprintf("Optimization Status: %s...", status), "info")
		}

		if i == maxRetries-1 {
			streamLog("Optimization is taking longer than expected, but proceeding...", "warn")
		}
	}

	// Ensure SSL is set to "Full" to avoid 522 errors.
	streamLog("Configuring SSL/TLS for secure handshake...", "info")
	if err := o.cloudflare.UpdateSSLSetting(o.config.CloudflareZoneID, "full"); err != nil {
		o.log.Warnf("Failed to update SSL setting: %v", err)
	}

	// Configure Domain and DNS
	// Determine if we are deploying to a system subdomain (e.g., .seeqme.com) or a custom domain.
	dnsProviderDomain := o.config.DNSProviderDomain
	if dnsProviderDomain == "" {
		dnsProviderDomain = "seeqme.com"
	}

	isSystemSubdomain := strings.HasSuffix(domain, dnsProviderDomain)

	if !isSystemSubdomain {
		// CASE: CUSTOM DOMAIN (e.g., my-brand.com)
		// Skip Internal DNS Creation (The user manages their own DNS via CNAME).
		streamLog(fmt.Sprintf("Configuring custom domain %s (External DNS)...", domain), "info")

		// Ensure domain is added to Cloudflare Pages
		if err := o.cloudflare.AddDomain(projectName, domain); err != nil {
			// We might get "already active" errors, which are safe to ignore for custom domains provided verification passed.
			if !strings.Contains(err.Error(), "409") {
				o.log.Warnf("Failed to add custom domain to Pages project: %v", err)
			}
		}

		// Domain Swap / Cleanup: Remove any existing system subdomains to keep routing clean.
		existingDomains, err := o.cloudflare.ListDomains(projectName)
		if err == nil {
			for _, d := range existingDomains {
				// If we find a system subdomain that is NOT the current target domain, remove it.
				if strings.HasSuffix(d, dnsProviderDomain) && d != domain {
					streamLog(fmt.Sprintf("Removing system subdomain alias to enforce custom domain: %s", d), "info")

					// Remove from Pages
					if err := o.cloudflare.RemoveDomain(projectName, d); err != nil {
						o.log.Warnf("Failed to remove domain alias %s: %v", d, err)
					}

					// Remove from DNS (CNAME)
					// We need to find the record ID first.
					recordID, err := o.cloudflare.GetDNSRecordID(d)
					if err == nil && recordID != "" {
						if err := o.cloudflare.DeleteSubdomain(recordID); err != nil {
							o.log.Warnf("Failed to delete DNS record for %s: %v", d, err)
						} else {
							streamLog(fmt.Sprintf("Cleaned up DNS record for %s", d), "info")
						}
					}
				}
			}
		}

	} else {
		// CASE: SYSTEM SUBDOMAIN (e.g., app.seeqme.com)
		//  Create Internal DNS Record in our Zone
		streamLog("Propagating DNS records...", "info")
		dnsRecordID, err := o.cloudflare.AddDNSRecord(o.config.CloudflareZoneID, domain, projectName, false)
		if err != nil {
			// Code 81053: "An A, AAAA, or CNAME record with that host already exists"
			if strings.Contains(err.Error(), "81053") {
				streamLog("DNS record already exists, skipping creation...", "info")
				// We don't return an error. We also don't have the ID, but that's acceptable as we can look it up later.
				dnsRecordID = ""
			} else {
				// If it fails with any other error, we return error as this is critical for system subdomains
				return "", fmt.Errorf("cloudflare DNS record creation failed: %v", err)
			}
		}

		//  Add Domain to Pages project
		// Note: AddDNSRecord returns ID but doesn't add to Pages, so we must add it.
		// Cloudflare often auto-adds if CNAME validates, but explicit add is safer.
		// However, AddDNSRecord for Pages usually implies we want to route it.
		// The original code returned `dnsRecordID`.

		// Only strictly required if Pages doesn't auto-pick it up, but `AddDomain` is safe.
		if err := o.cloudflare.AddDomain(projectName, domain); err != nil {
			if !strings.Contains(err.Error(), "already active") {
				o.log.Warnf("Warning: Failed to explicitly attach domain to Pages project: %v", err)
			}
		}

		// Return the record ID for tracking
		streamLog(fmt.Sprintf("✅ Deployed! Site live at https://%s, domain: %s", domain, domain), "success")
		return dnsRecordID, nil
	}

	streamLog(fmt.Sprintf("✅ Deployed! Site live at https://%s", domain), "success")
	return "", nil
}
