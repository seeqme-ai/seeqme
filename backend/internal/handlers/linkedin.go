package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/chromedp/cdproto/cdp"
	"github.com/chromedp/chromedp"
	"github.com/gin-gonic/gin"
)

// LinkedInProfile represents the extracted profile data
type LinkedInProfile struct {
	Name       string       `json:"name"`
	Headline   string       `json:"headline"`
	Location   string       `json:"location"`
	About      string       `json:"about"`
	Email      string       `json:"email,omitempty"`
	Website    string       `json:"website,omitempty"`
	Experience []Experience `json:"experience"`
	Education  []Education  `json:"education"`
	Skills     []string     `json:"skills"`
}

type Experience struct {
	Company     string `json:"company"`
	Position    string `json:"position"`
	Period      string `json:"period"`
	Description string `json:"description"`
}

type Education struct {
	School string `json:"school"`
	Degree string `json:"degree"`
	Field  string `json:"field"`
	Period string `json:"period"`
}

// ExtractLinkedInProfile extracts profile data from LinkedIn URL using chromedp
func (h *Handler) ExtractLinkedInProfile(c *gin.Context) {
	var req struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profile, err := h.ScrapeLinkedInProfile(req.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// ScrapeLinkedInProfile is a helper function to scrape LinkedIn profile data
func (h *Handler) ScrapeLinkedInProfile(url string) (*LinkedInProfile, error) {
	// Validate LinkedIn URL
	if !isValidLinkedInURL(url) {
		return nil, fmt.Errorf("invalid LinkedIn URL format. Use https://www.linkedin.com/in/username/")
	}

	if h.Config.LinkedInEmail == "" || h.Config.LinkedInPassword == "" {
		log.Printf("⚠️ LinkedIn credentials not configured")
		return nil, fmt.Errorf("LinkedIn integration not fully configured on server")
	}

	// Setup chromedp options
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.UserAgent(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36`),
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	// Set timeout for entire operation
	ctx, cancel = context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	var profile LinkedInProfile
	var experienceNodes, educationNodes []*cdp.Node

	log.Printf("🚀 Starting LinkedIn extraction for: %s", url)

	err := chromedp.Run(ctx,
		// Login
		chromedp.Navigate(`https://www.linkedin.com/login`),
		chromedp.WaitVisible(`#username`, chromedp.ByID),
		chromedp.SendKeys(`#username`, h.Config.LinkedInEmail, chromedp.ByID),
		chromedp.SendKeys(`#password`, h.Config.LinkedInPassword, chromedp.ByID),
		chromedp.Click(`button[type="submit"]`, chromedp.ByQuery),

		// Wait for login to complete by checking for a known post-login element
		chromedp.WaitVisible(`.global-nav`, chromedp.ByQuery),

		// Navigate to profile
		chromedp.Navigate(url),
		chromedp.WaitVisible(`main#main-content, .scaffold-layout__main`, chromedp.ByQuery),

		//  Extract basic info
		chromedp.Text(`.text-heading-xlarge`, &profile.Name, chromedp.ByQuery),
		chromedp.Text(`.text-body-medium.break-words`, &profile.Headline, chromedp.ByQuery),
		chromedp.Text(`.text-body-small.inline.t-black--light.break-words`, &profile.Location, chromedp.ByQuery),

		// Extract About section
		chromedp.Text(`#about ~ .display-flex .pv-shared-text-with-see-more span`, &profile.About, chromedp.AtLeast(0), chromedp.ByQuery),

		//  Extract Experience
		chromedp.Nodes(`#experience ~ .display-flex .pvs-list__paged-list-item`, &experienceNodes, chromedp.AtLeast(0), chromedp.ByQuery),
	)

	if err != nil {
		log.Printf("❌ ChromeDP error: %v", err)
		return nil, fmt.Errorf("failed to extract LinkedIn profile. Ensure the URL is public and try again")
	}

	// Post-process Experience
	for _, node := range experienceNodes {
		var exp Experience
		_ = chromedp.Run(ctx,
			chromedp.Text(`span[aria-hidden="true"]`, &exp.Position, chromedp.ByQuery, chromedp.FromNode(node)),
			chromedp.Text(`.t-14.t-normal span[aria-hidden="true"]`, &exp.Company, chromedp.ByQuery, chromedp.FromNode(node)),
			chromedp.Text(`.t-14.t-normal.t-black--light span[aria-hidden="true"]`, &exp.Period, chromedp.ByQuery, chromedp.FromNode(node)),
		)
		if exp.Position != "" {
			profile.Experience = append(profile.Experience, exp)
		}
	}

	// Extract Education separately to avoid selector collisions
	_ = chromedp.Run(ctx,
		chromedp.Nodes(`#education ~ .display-flex .pvs-list__paged-list-item`, &educationNodes, chromedp.AtLeast(0), chromedp.ByQuery),
	)

	for _, node := range educationNodes {
		var edu Education
		_ = chromedp.Run(ctx,
			chromedp.Text(`span[aria-hidden="true"]`, &edu.School, chromedp.ByQuery, chromedp.FromNode(node)),
			chromedp.Text(`.t-14.t-normal span[aria-hidden="true"]`, &edu.Degree, chromedp.ByQuery, chromedp.FromNode(node)),
		)
		if edu.School != "" {
			profile.Education = append(profile.Education, edu)
		}
	}

	log.Printf("✅ Successfully extracted profile for %s", profile.Name)
	return &profile, nil
}

func isValidLinkedInURL(url string) bool {
	return strings.Contains(url, "linkedin.com/in/")
}

func extractLinkedInUsername(url string) string {
	pattern := `linkedin\.com/in/([\w-]+)`
	re := regexp.MustCompile(pattern)
	matches := re.FindStringSubmatch(url)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

func (h *Handler) GeneratePortfolioPromptFromLinkedIn(c *gin.Context) {
	var profile LinkedInProfile
	if err := c.ShouldBindJSON(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	prompt := generatePortfolioPrompt(profile)

	c.JSON(http.StatusOK, gin.H{
		"prompt":  prompt,
		"profile": profile,
	})
}

func generatePortfolioPrompt(profile LinkedInProfile) string {
	var prompt strings.Builder

	prompt.WriteString(fmt.Sprintf("Create a stunning, professional portfolio for %s.\n\n", profile.Name))

	if profile.Headline != "" {
		prompt.WriteString(fmt.Sprintf("Professional Title: %s.\n\n", profile.Headline))
	}

	if profile.Location != "" {
		prompt.WriteString(fmt.Sprintf("Location: %s.\n\n", profile.Location))
	}

	prompt.WriteString("=== ABOUT ===\n")
	prompt.WriteString(profile.About)
	prompt.WriteString("\n\n")

	if len(profile.Experience) > 0 {
		prompt.WriteString("=== WORK EXPERIENCE ===\n")
		for i, exp := range profile.Experience {
			prompt.WriteString(fmt.Sprintf("%d. %s at %s (%s)\n", i+1, exp.Position, exp.Company, exp.Period))
			if exp.Description != "" {
				prompt.WriteString(fmt.Sprintf("   %s\n", exp.Description))
			}
		}
		prompt.WriteString("\n")
	}

	if len(profile.Education) > 0 {
		prompt.WriteString("=== EDUCATION ===\n")
		for i, edu := range profile.Education {
			prompt.WriteString(fmt.Sprintf("%d. %s in %s from %s\n", i+1, edu.Degree, edu.Field, edu.School))
		}
		prompt.WriteString("\n")
	}

	if len(profile.Skills) > 0 {
		prompt.WriteString("=== SKILLS ===\n")
		prompt.WriteString(strings.Join(profile.Skills, ", "))
		prompt.WriteString("\n\n")
	}

	return prompt.String()
}
