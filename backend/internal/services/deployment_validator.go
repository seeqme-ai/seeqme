package services

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"seeqmeai/backend/internal/database"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// DeploymentValidator validates portfolio updates before deployment
type DeploymentValidator struct {
	portfolioID string
}

type ValidationResult struct {
	IsValid      bool     `json:"isValid"`
	Issues       []string `json:"issues"`
	Warnings     []string `json:"warnings"`
	PreviewURL   string   `json:"previewUrl,omitempty"`
	ValidationID string   `json:"validationId"`
	Timestamp    string   `json:"timestamp"`
}

func NewDeploymentValidator(portfolioID string) *DeploymentValidator {
	return &DeploymentValidator{
		portfolioID: portfolioID,
	}
}

func (v *DeploymentValidator) ValidateUpdate(html, css, js string) (*ValidationResult, error) {
	result := &ValidationResult{
		IsValid:      true,
		Issues:       []string{},
		Warnings:     []string{},
		ValidationID: primitive.NewObjectID().Hex(),
		Timestamp:    time.Now().Format(time.RFC3339),
	}

	v.validateHTML(html, result)

	v.validateCSS(css, result)

	v.validateJS(js, result)

	v.checkLinks(html, result)

	v.validateResponsiveness(html, css, result)

	v.validateMedia(html, css, result)

	v.validateAccessibility(html, result)

	v.checkPerformance(html, css, js, result)

	// Determine overall validity
	if len(result.Issues) > 0 {
		result.IsValid = false
	}

	return result, nil
}


func (v *DeploymentValidator) validateHTML(html string, result *ValidationResult) {
	// Check for proper HTML structure
	if !strings.Contains(html, "<!DOCTYPE html>") {
		result.Issues = append(result.Issues, "Missing DOCTYPE declaration")
	}
	if !strings.Contains(html, "<html") {
		result.Issues = append(result.Issues, "Missing <html> tag")
	}
	if !strings.Contains(html, "<head>") {
		result.Issues = append(result.Issues, "Missing <head> tag")
	}
	if !strings.Contains(html, "<body>") {
		result.Issues = append(result.Issues, "Missing <body> tag")
	}

	// Check for unclosed tags
	v.checkUnclosedTags(html, result)

	recommendedSections := []string{"header", "hero", "about", "skills", "projects", "experience", "testimonials", "contact", "footer"}
	for _, section := range recommendedSections {
		if !strings.Contains(strings.ToLower(html), section) {
			result.Warnings = append(result.Warnings, fmt.Sprintf("Missing recommended section: %s", section))
		}
	}

	// Check for broken iframes
	if strings.Contains(html, "<iframe") {
		if !v.validateIframes(html) {
			result.Issues = append(result.Issues, "Invalid iframe elements detected")
		}
	}
}

// validateCSS checks CSS syntax
func (v *DeploymentValidator) validateCSS(css string, result *ValidationResult) {
	if css == "" {
		result.Warnings = append(result.Warnings, "No CSS provided - portfolio may have no styling")
		return
	}

	// Check for unclosed braces
	openBraces := strings.Count(css, "{")
	closeBraces := strings.Count(css, "}")
	if openBraces != closeBraces {
		result.Issues = append(result.Issues, fmt.Sprintf("CSS: Unclosed braces detected (open: %d, close: %d)", openBraces, closeBraces))
	}

	// Check for syntax errors
	if strings.Contains(css, "}") && !strings.Contains(css, "{") {
		result.Issues = append(result.Issues, "CSS: Syntax error - closing brace without opening")
	}

	// Check for important usage (bad practice)
	if strings.Count(css, "!important") > 5 {
		result.Warnings = append(result.Warnings, "Excessive use of !important in CSS")
	}

	// Check for absolute positioning (can break responsiveness)
	if strings.Count(css, "position: absolute") > 10 {
		result.Warnings = append(result.Warnings, "Excessive use of absolute positioning may affect responsiveness")
	}
}

// validateJS checks JavaScript syntax
func (v *DeploymentValidator) validateJS(js string, result *ValidationResult) {
	if js == "" {
		return // JS is optional
	}

	// Check for common syntax errors
	openParens := strings.Count(js, "(")
	closeParens := strings.Count(js, ")")
	if openParens != closeParens {
		result.Issues = append(result.Issues, "JavaScript: Unclosed parentheses detected")
	}

	openBraces := strings.Count(js, "{")
	closeBraces := strings.Count(js, "}")
	if openBraces != closeBraces {
		result.Issues = append(result.Issues, "JavaScript: Unclosed braces detected")
	}

	// Check for console.log (should be removed in production)
	if strings.Contains(js, "console.log") {
		result.Warnings = append(result.Warnings, "JavaScript: console.log statements detected - remove in production")
	}

	// Check for eval (security risk)
	if strings.Contains(js, "eval(") {
		result.Issues = append(result.Issues, "JavaScript: eval() detected - security risk")
	}

	// Check for inline event handlers (bad practice)
	if strings.Contains(js, "onclick=") || strings.Contains(js, "onload=") {
		result.Warnings = append(result.Warnings, "JavaScript: Inline event handlers detected - use addEventListener instead")
	}
}

// checkLinks validates all links in the HTML
func (v *DeploymentValidator) checkLinks(html string, result *ValidationResult) {
	// Find all href attributes
	hrefRegex := regexp.MustCompile(`href=["']([^"']+)["']`)
	matches := hrefRegex.FindAllStringSubmatch(html, -1)

	for _, match := range matches {
		if len(match) > 1 {
			link := match[1]

			// Check for broken links
			if strings.HasPrefix(link, "http://") || strings.HasPrefix(link, "https://") {
				// External link - could validate reachability but skip for now
			} else if strings.HasPrefix(link, "/") {
				// Internal link - should be valid
			} else if strings.HasPrefix(link, "#") {
				// Anchor link - should exist
				anchor := strings.TrimPrefix(link, "#")
				if anchor != "" && !strings.Contains(html, fmt.Sprintf(`id="%s"`, anchor)) && !strings.Contains(html, fmt.Sprintf(`name="%s"`, anchor)) {
					result.Issues = append(result.Issues, fmt.Sprintf("Broken anchor link: #%s", anchor))
				}
			} else {
				// Relative link - check if file exists
				result.Warnings = append(result.Warnings, fmt.Sprintf("Relative link detected: %s - ensure file exists", link))
			}
		}
	}
}

// validateResponsiveness checks if the portfolio is responsive
func (v *DeploymentValidator) validateResponsiveness(html, css string, result *ValidationResult) {
	// Check for viewport meta tag
	if !strings.Contains(html, "viewport") {
		result.Issues = append(result.Issues, "Missing viewport meta tag - portfolio will not be responsive")
	}

	// Check for responsive CSS
	if !strings.Contains(css, "@media") && !strings.Contains(css, "max-width") {
		result.Warnings = append(result.Warnings, "No responsive CSS detected - add @media queries for mobile support")
	}

	// Check for mobile-first classes
	if !strings.Contains(html, "class=") {
		result.Warnings = append(result.Warnings, "No CSS classes detected - styling may be limited")
	}

	// Check for fixed widths (bad for responsiveness)
	if strings.Contains(css, "width:") && !strings.Contains(css, "max-width:") {
		result.Warnings = append(result.Warnings, "Fixed widths detected - consider using max-width for better responsiveness")
	}
}

// validateMedia checks if all media files are properly hosted
func (v *DeploymentValidator) validateMedia(html, css string, result *ValidationResult) {
	// Check for Cloudinary URLs (preferred)
	cloudinaryRegex := regexp.MustCompile(`https://res\.cloudinary\.com/[\w-]+/image/upload/[\w-]+`)

	// Check for images
	imgRegex := regexp.MustCompile(`<img[^>]+src=["']([^"']+)["']`)
	imgMatches := imgRegex.FindAllStringSubmatch(html, -1)

	for _, match := range imgMatches {
		if len(match) > 1 {
			src := match[1]

			// Warning if not using Cloudinary, but not an Issue anymore
			if !cloudinaryRegex.MatchString(src) && !strings.HasPrefix(src, "data:") {
				result.Warnings = append(result.Warnings, fmt.Sprintf("Image not hosted on Cloudinary: %s", src))
			}
		}
	}

	// Check for background images in CSS
	bgRegex := regexp.MustCompile(`background-image:\s*url\(["']?([^"')\s]+)["']?\)`)
	bgMatches := bgRegex.FindAllStringSubmatch(css, -1)

	for _, match := range bgMatches {
		if len(match) > 1 {
			url := match[1]
			if !cloudinaryRegex.MatchString(url) && !strings.HasPrefix(url, "data:") {
				result.Warnings = append(result.Warnings, fmt.Sprintf("Background image not on Cloudinary: %s", url))
			}
		}
	}
}

// validateAccessibility checks for accessibility issues
func (v *DeploymentValidator) validateAccessibility(html string, result *ValidationResult) {
	// Check for alt attributes on images
	imgRegex := regexp.MustCompile(`<img[^>]*?src=["'][^"']+["'][^>]*?>`)
	imgMatches := imgRegex.FindAllString(html, -1)

	for _, img := range imgMatches {
		if !strings.Contains(img, "alt=") {
			result.Issues = append(result.Issues, "Image missing alt attribute - accessibility issue")
		}
	}

	// Check for heading hierarchy
	hasH1 := strings.Contains(html, "<h1")
	hasH2 := strings.Contains(html, "<h2")

	if !hasH1 {
		result.Warnings = append(result.Warnings, "Missing h1 tag - should have one per page")
	}
	if hasH1 && !hasH2 {
		result.Warnings = append(result.Warnings, "Missing h2 tags - should have proper heading hierarchy")
	}

	// Check for form labels
	if strings.Contains(html, "<input") || strings.Contains(html, "<textarea") {
		if !strings.Contains(html, "label") {
			result.Warnings = append(result.Warnings, "Form inputs should have associated labels")
		}
	}

	
}

// checkPerformance checks for performance issues
func (v *DeploymentValidator) checkPerformance(html, css, js string, result *ValidationResult) {
	// Check file sizes
	if len(html) > 500000 { // 500KB
		result.Warnings = append(result.Warnings, "HTML file is large - consider minification")
	}
	if len(css) > 200000 { // 200KB
		result.Warnings = append(result.Warnings, "CSS file is large - consider minification")
	}
	if len(js) > 200000 { // 200KB
		result.Warnings = append(result.Warnings, "JavaScript file is large - consider minification")
	}

	// Check for inline styles (should be in CSS)
	if strings.Contains(html, "style=") {
		result.Warnings = append(result.Warnings, "Inline styles detected - move to CSS for better performance")
	}

	// Check for inline scripts
	if strings.Contains(html, "<script>") && !strings.Contains(html, "src=") {
		result.Warnings = append(result.Warnings, "Inline scripts detected - consider external files for better caching")
	}
}

// checkUnclosedTags checks for unclosed HTML tags
func (v *DeploymentValidator) checkUnclosedTags(html string, result *ValidationResult) {
	// check for common unclosed tags
	tagsToCheck := []string{"div", "p", "span", "a", "li", "section", "article"}

	for _, tag := range tagsToCheck {
		openTag := strings.Count(html, fmt.Sprintf("<%s", tag))
		closeTag := strings.Count(html, fmt.Sprintf("</%s>", tag))

		// Self-closing tags don't need closing
		selfClosing := strings.Count(html, fmt.Sprintf("<%s", tag)+"/>")
		openTag -= selfClosing

		if openTag > closeTag {
			result.Issues = append(result.Issues, fmt.Sprintf("Unclosed <%s> tags detected", tag))
		}
	}
}

// validateIframes validates iframe elements
func (v *DeploymentValidator) validateIframes(html string) bool {
	// Check if iframes have proper attributes
	iframeRegex := regexp.MustCompile(`<iframe[^>]*?>`)
	matches := iframeRegex.FindAllString(html, -1)

	for _, iframe := range matches {
		if !strings.Contains(iframe, "src=") {
			return false
		}
		if !strings.Contains(iframe, "title=") {
			// Warning only
		}
	}
	return true
}

// CreateStagingPreview creates a staging preview of the portfolio
func (v *DeploymentValidator) CreateStagingPreview(portfolioID string, html, css, js string) (string, error) {
	objID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		return "", err
	}

	collection := database.Client.Database(database.DBName).Collection("portfolios")
	var portfolio bson.M
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&portfolio)
	if err != nil {
		return "", err
	}

	// Create staging version
	stagingID := fmt.Sprintf("%s-staging-%d", portfolioID, time.Now().Unix())
	stagingDoc := bson.M{
		"_id":        primitive.NewObjectID(),
		"originalId": portfolioID,
		"stagingId":  stagingID,
		"html":       html,
		"css":        css,
		"js":         js,
		"createdAt":  primitive.NewDateTimeFromTime(time.Now()),
		"validationResult": ValidationResult{
			IsValid:   true,
			Timestamp: time.Now().Format(time.RFC3339),
		},
	}

	// Save to staging collection
	stagingCollection := database.Client.Database(database.DBName).Collection("staging")
	_, err = stagingCollection.InsertOne(context.Background(), stagingDoc)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("https://%s-staging.seeqme.com", stagingID), nil
}

// CompareWithLive compares staging version with live version
func (v *DeploymentValidator) CompareWithLive(portfolioID string, stagingHTML, stagingCSS, stagingJS string) (map[string]interface{}, error) {
	objID, err := primitive.ObjectIDFromHex(portfolioID)
	if err != nil {
		return nil, err
	}

	collection := database.Client.Database(database.DBName).Collection("portfolios")
	var portfolio bson.M
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&portfolio)
	if err != nil {
		return nil, err
	}

	liveHTML, _ := portfolio["html"].(string)
	liveCSS, _ := portfolio["css"].(string)
	liveJS, _ := portfolio["js"].(string)

	comparison := map[string]interface{}{
		"htmlChanged":     liveHTML != stagingHTML,
		"cssChanged":      liveCSS != stagingCSS,
		"jsChanged":       liveJS != stagingJS,
		"htmlSizeDiff":    len(stagingHTML) - len(liveHTML),
		"cssSizeDiff":     len(stagingCSS) - len(liveCSS),
		"jsSizeDiff":      len(stagingJS) - len(liveJS),
		"sectionsAdded":   v.detectSectionChanges(liveHTML, stagingHTML),
		"sectionsRemoved": v.detectRemovedSections(liveHTML, stagingHTML),
	}

	return comparison, nil
}

// detectSectionChanges detects which sections were added
func (v *DeploymentValidator) detectSectionChanges(oldHTML, newHTML string) []string {
	
	var added []string

	sections := []string{"header", "hero", "about", "skills", "projects", "experience", "education", "contact", "testimonials"}

	for _, section := range sections {
		if !strings.Contains(oldHTML, section) && strings.Contains(newHTML, section) {
			added = append(added, section)
		}
	}

	return added
}

// detectRemovedSections detects which sections were removed
func (v *DeploymentValidator) detectRemovedSections(oldHTML, newHTML string) []string {
	var removed []string

	sections := []string{"header", "hero", "about", "skills", "projects", "experience", "education", "contact", "testimonials"}

	for _, section := range sections {
		if strings.Contains(oldHTML, section) && !strings.Contains(newHTML, section) {
			removed = append(removed, section)
		}
	}

	return removed
}
