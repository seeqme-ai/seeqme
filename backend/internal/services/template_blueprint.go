package services

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"strings"
	"time"
)

// TemplateBlueprint represents the architectural structure of a template
type TemplateBlueprint struct {
	TemplateID   string                 `json:"templateId"`
	Niche        string                 `json:"niche"`
	Name         string                 `json:"name"`
	BlockPattern []TemplateBlockPattern `json:"blockPattern"`
	Theme        string                 `json:"theme"`
	ColorScheme  map[string]string      `json:"colorScheme"`
	Typography   map[string]string      `json:"typography"`
}

// TemplateBlockPattern represents a block in the template architecture
type TemplateBlockPattern struct {
	Order       int    `json:"order"`
	Type        string `json:"type"`
	ComponentId string `json:"componentId"`
	Purpose     string `json:"purpose"`
}

// TemplateLibrary holds all template blueprints organized by niche
type TemplateLibrary struct {
	Blueprints     []TemplateBlueprint `json:"blueprints"`
	NicheTemplates map[string][]string `json:"nicheTemplates"` // niche -> []templateIds
	BlockPatterns  map[string][]string `json:"blockPatterns"`  // section type -> []orderPatterns
}

// ExtractTemplateBlueprints parses template manifests and extracts architectural patterns
func ExtractTemplateBlueprints(templatesJSON string) (*TemplateLibrary, error) {
	var templates []map[string]interface{}
	if err := json.Unmarshal([]byte(templatesJSON), &templates); err != nil {
		return nil, fmt.Errorf("failed to parse templates: %v", err)
	}

	library := &TemplateLibrary{
		Blueprints:     make([]TemplateBlueprint, 0),
		NicheTemplates: make(map[string][]string),
		BlockPatterns:  make(map[string][]string),
	}

	for _, tmpl := range templates {
		blueprint, err := parseTemplateToBlueprint(tmpl)
		if err != nil {
			continue // Skip invalid templates
		}

		library.Blueprints = append(library.Blueprints, blueprint)

		// Index by niche
		if niche, ok := tmpl["niche"].(string); ok {
			library.NicheTemplates[niche] = append(library.NicheTemplates[niche], blueprint.TemplateID)
		}

		// Index block patterns by section type
		for _, block := range blueprint.BlockPattern {
			key := block.Type
			pattern := fmt.Sprintf("%d-%s-%s", block.Order, block.Type, block.ComponentId)
			library.BlockPatterns[key] = append(library.BlockPatterns[key], pattern)
		}
	}

	return library, nil
}

// parseTemplateToBlueprint converts a template manifest into a blueprint
func parseTemplateToBlueprint(tmpl map[string]interface{}) (TemplateBlueprint, error) {
	blueprint := TemplateBlueprint{
		BlockPattern: make([]TemplateBlockPattern, 0),
		ColorScheme:  make(map[string]string),
		Typography:   make(map[string]string),
	}

	// Extract metadata
	if metadata, ok := tmpl["metadata"].(map[string]interface{}); ok {
		if niche, ok := metadata["niche"].(string); ok {
			blueprint.Niche = niche
		}
	}

	// Extract global config
	if config, ok := tmpl["globalConfig"].(map[string]interface{}); ok {
		if theme, ok := config["theme"].(string); ok {
			blueprint.Theme = theme
		}

		if colors, ok := config["colorPalette"].(map[string]interface{}); ok {
			for k, v := range colors {
				if color, ok := v.(string); ok {
					blueprint.ColorScheme[k] = color
				}
			}
		}

		if typo, ok := config["typography"].(map[string]interface{}); ok {
			for k, v := range typo {
				if font, ok := v.(string); ok {
					blueprint.Typography[k] = font
				}
			}
		}
	}

	// Extract sections (blocks)
	if sections, ok := tmpl["sections"].([]interface{}); ok {
		for i, sec := range sections {
			if section, ok := sec.(map[string]interface{}); ok {
				pattern := TemplateBlockPattern{
					Order: i,
				}

				if sType, ok := section["type"].(string); ok {
					pattern.Type = sType
				}

				if compId, ok := section["componentId"].(string); ok {
					pattern.ComponentId = compId
				}

				// Infer purpose from type
				pattern.Purpose = inferBlockPurpose(pattern.Type, i)

				blueprint.BlockPattern = append(blueprint.BlockPattern, pattern)
			}
		}
	}

	if blueprint.TemplateID == "" {
		blueprint.TemplateID = "unknown"
	}

	return blueprint, nil
}

// inferBlockPurpose provides semantic meaning to each block
func inferBlockPurpose(blockType string, order int) string {
	purposes := map[string]string{
		"header":         "Navigation and branding",
		"hero":           "Impactful first impression",
		"about":          "Personal or professional background",
		"skills":         "Competencies and expertise",
		"projects":       "Portfolio work and achievements",
		"experience":     "Work history and career progression",
		"services":       "Service offerings and expertise areas",
		"testimonials":   "Social proof and credibility",
		"contact":        "Call-to-action and contact information",
		"footer":         "Bottom navigation and metadata",
		"cta":            "Secondary call-to-action",
		"stats":          "Metrics and quantifiable achievements",
		"pricing":        "Service or product pricing tiers",
		"faq":            "Frequently asked questions",
		"logos":          "Client or partner logos",
		"process":        "Workflow or methodology",
		"gallery":        "Visual work showcase",
		"team":           "Team members or collaborators",
		"video":          "Video content embedding",
		"education":      "Educational background",
		"certifications": "Professional certifications",
		"blog":           "Blog posts and articles",
	}

	if purpose, ok := purposes[blockType]; ok {
		return purpose
	}
	return "Custom section"
}

// GenerateAIPromptFromBlueprints creates AI guidance from template blueprints
func GenerateAIPromptFromBlueprints(library *TemplateLibrary, niche string) string {
	prompt := fmt.Sprintf(`
TEMPLATE-BASED ARCHITECTURE GUIDELINES:

You have access to %d proven portfolio template blueprints. Use these as your primary architectural basis.

`, len(library.Blueprints))

	// Add niche-specific templates if available
	if templates, ok := library.NicheTemplates[niche]; ok && len(templates) > 0 {
		prompt += fmt.Sprintf(`
RECOMMENDED TEMPLATES FOR NICHE: %s
These templates have been successfully used for this niche:
- %s

Analyze these templates to understand the proven block pattern and apply similar architecture to generated portfolio.
`, niche, strings.Join(templates, "\n- "))
	}

	// Add block pattern guidelines
	prompt += `
BLOCK PATTERN GUIDELINES:
Templates follow proven section ordering and component selection patterns. When generating portfolios:

1. HEADER: Always start with navigation/header block (order 0)
2. HERO: Follow with impactful hero section (order 1)
3. POSITIONING: Place content sections based on niche:
   - Engineering: Stats → Skills → Projects → Experience → Contact
   - Creative: About → Projects/Gallery → Testimonials → Contact
   - Business: Stats → About → Services/Experience → Testimonials → Contact
   - Freelancer: Logos → Services → Projects → Testimonials → Process → Pricing → Contact
4. FOOTER: Always end with footer block

COMPONENT SELECTION PRINCIPLES (from template analysis):
- Use GEN_TEMPLATE for custom, niche-specific designs
- Match component styling to template theme (light/dark)
- Ensure color scheme consistency across all blocks
- Follow typography hierarchy from template patterns

STRICT RULES:
1. NEVER deviate from proven template block patterns
2. ALWAYS use template niche as primary architectural guide
3. GENERATE sections that follow similar ordering as matching templates
4. PRESERVE template color schemes and typography choices
5. STRUCTURE manifest to mirror successful template architectures
`

	return prompt
}

// GetNicheTemplateExamples returns example template architectures for a niche
func GetNicheTemplateExamples(library *TemplateLibrary, niche string, limit int) []TemplateBlueprint {
	examples := make([]TemplateBlueprint, 0)

	if templates, ok := library.NicheTemplates[niche]; ok {
		// Shuffle niche template IDs to ensure variety
		shuffledIDs := make([]string, len(templates))
		copy(shuffledIDs, templates)
		rand.Seed(time.Now().UnixNano())
		rand.Shuffle(len(shuffledIDs), func(i, j int) {
			shuffledIDs[i], shuffledIDs[j] = shuffledIDs[j], shuffledIDs[i]
		})

		for _, templateID := range shuffledIDs {
			for _, blueprint := range library.Blueprints {
				if blueprint.TemplateID == templateID {
					examples = append(examples, blueprint)
					if len(examples) >= limit {
						return examples
					}
				}
			}
		}
	}

	return examples
}

// GetBlockPatternForType returns recommended block ordering for a section type
func GetBlockPatternForType(library *TemplateLibrary, sectionType string) []string {
	if patterns, ok := library.BlockPatterns[sectionType]; ok {
		return patterns
	}
	return []string{}
}

// GenerateManifestGuidance creates detailed, creative guidance from templates
// ENCOURAGES MIXING AND MATCHING instead of copying templates exactly
func GenerateManifestGuidance(library *TemplateLibrary, niche string) string {
	examples := GetNicheTemplateExamples(library, niche, 3)

	if len(examples) == 0 {
		// Fallback to any template if niche not found
		if len(library.Blueprints) > 0 {
			examples = []TemplateBlueprint{library.Blueprints[0]}
		}
	}

	guidance := `
=== CREATIVE ARCHITECTURE GUIDANCE ===

You have successful template blueprints as INSPIRATION sources, NOT prescriptive patterns.
Your task: MIX and MATCH components creatively to build something UNIQUE.

Each template below shows ONE working approach - your job is to combine ideas from MULTIPLE
templates and the registry to create fresh, memorable architectures.
`

	// Show the templates as diverse inspiration examples
	for i, blueprint := range examples {
		guidance += fmt.Sprintf(`

[INSPIRATION TEMPLATE %d: %s]
Theme: %s | Niche: %s
Section sequence:
`, i+1, blueprint.TemplateID, blueprint.Theme, blueprint.Niche)

		for _, block := range blueprint.BlockPattern {
			guidance += fmt.Sprintf(`  %d. %s (%s) - %s
`, block.Order, strings.ToUpper(block.Type), block.ComponentId, block.Purpose)
		}

		guidance += `
Ideas to steal: Notice the section order, component choices, visual flow.
Ideas to break: What if you used different components? Different order? Different colors?

`
	}

	guidance += `
=== YOUR CREATIVE CHALLENGE ===

DO THIS (Encouraged):
✓ Mix visual styles from different templates
✓ Reorder sections - unique openers, non-traditional flows
✓ Experiment with unexpected color combinations
✓ Combine best practices from multiple templates
✓ Use 8-16 sections based on content, not template precedent
✓ Try typography combinations not shown in examples
✓ Break niche conventions for memorability
✓ Pick specific registry components (HERO_CYBER_MONO, PROJ_MASONRY, etc.)

AVOID (Repetition killer):
✗ Don't copy any single template exactly
✗ Don't reuse the same section sequence repeatedly
✗ Don't match color schemes too closely to examples
✗ Don't use generic GEN_TEMPLATE - use specific registry components
✗ Don't replicate template structure verbatim

• Metadata.niche MUST match the detected professional niche
• Contact/footer sections MUST be at the end
• SMART NAVIGATION: Section "id" values (e.g., "projects", "skills") MUST exactly match the header "navLinks" link values (e.g., "#projects", "#skills") for flawless scrolling.
• Use REAL registry components: HERO_*, PROJ_*, SKILLS_*, STATS_*, EXP_*, CONTACT_*, FOOTER_*, HEADER_*
• Build cohesive color palettes (even if unconventional)
• Keep section purposes aligned with niche context

AVAILABLE COMPONENT LIBRARY (89+ options):
HEROES (11): HERO_MODERN_SPLIT, HERO_CYBER_MONO, HERO_VISUALIST, HERO_EXECUTIVE, HERO_GLASS_FLOATING, HERO_NEOBRUTALIST, HERO_MINIMAL_LEFT, HERO_STACKED_BOLD, HERO_GRID_LAYOUT, HERO_DYNAMIC_GRADIENT, HERO_CENTERED_MINIMAL
PROJECTS (16): PROJ_BENTO_GRID, PROJ_MASONRY, PROJ_CASE_STUDY, PROJ_CAROUSEL_FULLSCREEN, PROJ_GITHUB_STYLE, PROJ_3D_PERSPECTIVE, PROJ_FEATURED_SINGLE, PROJ_MINIMAL_CARDS, PROJ_STACKED_LIST, PROJ_THUMBNAIL_GRID, PROJ_TIMELINE_VERTICAL, PROJ_LIST_PREVIEW, PROJ_OVERLAP_SLOTS, PROJ_DARK_SASS, PROJ_AGENCY_CASE_STUDY
SKILLS (8): SKILLS_MARQUEE, SKILLS_GRID_ICONS, SKILLS_PROGRESS_BARS, SKILLS_TAGS_CLOUD, SKILLS_HEXAGON_GRID, SKILLS_RADAR_CHART, SKILLS_DARK_SASS, SKILLS_AGENCY
EXPERIENCE (6): EXP_TIMELINE_VERTICAL, EXP_ACCORDION_MINIMAL, EXP_CARDS_GRID, EXP_HORIZONTAL_SCROLL, EXP_TABS_SWITCH, EXP_SIDEBAR_LIST
CONTACT (11): CONTACT_SPLIT, CONTACT_NEON_MODERN, CONTACT_SOCIAL_ONLY, CONTACT_CARD_SIMPLE, CONTACT_FORM_FULL, FORM_MINIMALIST, FORM_ELEGANT_SPLIT, FORM_TECH_AUDIT, CONTACT_DARK_SASS, CONTACT_MINIMAL_SIMPLE
HEADERS (5): HEADER_MINIMALIST, HEADER_AGENCY_VIBRANT, HEADER_TECH_GLOW, HEADER_MINIMALIST_CREATOR, HEADER_DARK_SASS
FOOTERS (11): FOOTER_MINIMAL, FOOTER_SOCIAL_HEAVY, FOOTER_NEWSLETTER, FOOTER_MULTI_COLUMN, FOOTER_STICKY_CTA, FOOTER_DARK_DETAILED, FOOTER_SINGLE_LINE, FOOTER_BRAND_FOCUS, FOOTER_DARK_SASS, FOOTER_AGENCY_BOLD, FOOTER_MINIMAL_SIMPLE
STATS (10): STATS_COUNTER_GRID, STATS_TIMELINE, STATS_CIRCULAR_PROGRESS, STATS_COMPARISON_TABLE, STATS_ACHIEVEMENT_BADGES, STATS_ANIMATED_COUNTERS, STATS_ICON_CARDS, STATS_MINIMAL_INLINE, STATS_LARGE_NUMBERS, STATS_AGENCY_TICKER

=== EXAMPLE CREATIVE APPROACHES ===

Instead of: Engineering template (hero→stats→skills→projects→experience)
Try: Skills first (build credibility), unique hero (tech + personal), timeline projects, stats at end

Instead of: Creative template (hero→portfolio→skills→testimonials)
Try: Testimonial hook first, unique hero style, mixed portfolio styles, skills as grid not cards

Instead of: Business template (hero→about→services→experience→testimonials)
Try: Stat hook first, services at top, timeline with stats overlaid, testimonials as carousel

BE BOLD. The templates show safe choices. Create memorable combinations.
`

	return guidance
}

// BuildTemplateLibraryFromRegistry creates a template library from predefined templates
// This serves as a fallback when template blueprints are loaded on demand
func BuildTemplateLibraryFromRegistry() *TemplateLibrary {
	library := &TemplateLibrary{
		Blueprints:     make([]TemplateBlueprint, 0),
		NicheTemplates: make(map[string][]string),
		BlockPatterns:  make(map[string][]string),
	}

	// Define templates organized by niche
	// Each template includes its typical block structure
	templates := map[string][]struct {
		id     string
		name   string
		niche  string
		theme  string
		blocks []struct {
			order       int
			blockType   string
			componentId string
			purpose     string
		}
	}{
		"Engineering": {
			{
				id:    "eng_cyber_mono",
				name:  "Cyber Mono Developer",
				niche: "Engineering",
				theme: "CYBER_NEON",
				blocks: []struct {
					order       int
					blockType   string
					componentId string
					purpose     string
				}{
					{1, "header", "HEADER_TECH", "Navigation with tech aesthetic"},
					{2, "hero", "HERO_CYBER_MONO", "High-impact tech intro"},
					{3, "stats", "STATS_COUNTER_GRID", "Technical metrics and impact"},
					{4, "skills", "SKILLS_GRID_ICONS", "Programming languages and tools"},
					{5, "projects", "PROJ_GITHUB_STYLE", "Code repositories showcase"},
					{6, "experience", "EXP_TIMELINE_VERTICAL", "Career progression"},
					{7, "contact", "CONTACT_NEON_MODERN", "Tech-focused contact"},
					{8, "footer", "FOOTER_DARK_DETAILED", "Credits and links"},
				},
			},
			{
				id:    "eng_brutalist",
				name:  "Dev Brutalist",
				niche: "Engineering",
				theme: "DARK_TECH",
				blocks: []struct {
					order       int
					blockType   string
					componentId string
					purpose     string
				}{
					{1, "header", "HEADER_MINIMALIST", "Clean navigation"},
					{2, "hero", "HERO_DARK_SASS", "Bold engineering intro"},
					{3, "stats", "STATS_LARGE_NUMBERS", "Key achievements"},
					{4, "skills", "SKILLS_DARK_SASS", "Technical skillset"},
					{5, "projects", "PROJ_BENTO_GRID", "Project showcase"},
					{6, "experience", "EXP_ACCORDION_MINIMAL", "Work history"},
					{7, "contact", "CONTACT_DARK_SASS", "Simple contact form"},
					{8, "footer", "FOOTER_SINGLE_LINE", "Minimal footer"},
				},
			},
		},
		"Creative": {
			{
				id:    "creative_visual",
				name:  "Visual Designer",
				niche: "Creative",
				theme: "VIBRANT_BLOOM",
				blocks: []struct {
					order       int
					blockType   string
					componentId string
					purpose     string
				}{
					{1, "header", "HEADER_MINIMALIST", "Clean navigation"},
					{2, "hero", "HERO_VISUALIST", "Visual impact hero"},
					{3, "about", "ABOUT_IMAGE_WRAP", "Designer bio"},
					{4, "projects", "GALLERY_MASONRY_GLASS", "Portfolio gallery"},
					{5, "skills", "SKILLS_TAGS_CLOUD", "Design skills"},
					{6, "testimonials", "TESTIMONIALS_GRID_PHOTOS", "Client feedback"},
					{7, "contact", "CONTACT_SOCIAL_ONLY", "Social links"},
					{8, "footer", "FOOTER_MINIMAL", "Credits"},
				},
			},
			{
				id:    "creative_photographer",
				name:  "Photographer",
				niche: "Creative",
				theme: "MINIMAL_PAPER",
				blocks: []struct {
					order       int
					blockType   string
					componentId string
					purpose     string
				}{
					{1, "header", "HEADER_MINIMALIST", "Navigation"},
					{2, "hero", "HERO_GLASS_FLOATING", "Photo hero"},
					{3, "about", "ABOUT_NARRATIVE", "Photography philosophy"},
					{4, "projects", "PROJ_MASONRY", "Photo collections"},
					{5, "testimonials", "TESTIMONIALS_GRID_PHOTOS", "Client testimonials"},
					{6, "contact", "CONTACT_FORM_FULL", "Booking inquiries"},
					{7, "footer", "FOOTER_NEWSLETTER", "Newsletter signup"},
				},
			},
		},
		"Business": {
			{
				id:    "exec_luxury",
				name:  "Executive Leadership",
				niche: "Business",
				theme: "LUXURY_GOLD",
				blocks: []struct {
					order       int
					blockType   string
					componentId string
					purpose     string
				}{
					{1, "header", "HEADER_TECH_GLOW", "Professional navigation"},
					{2, "hero", "HERO_EXECUTIVE", "Executive intro"},
					{3, "stats", "STATS_ANIMATED_COUNTERS", "Business impact"},
					{4, "about", "ABOUT_STATS", "Executive bio"},
					{5, "services", "SERVICES_AGENCY_GRID", "Services offered"},
					{6, "experience", "EXP_TIMELINE_VERTICAL", "Career history"},
					{7, "testimonials", "TESTIMONIALS_BENTO", "Client testimonials"},
					{8, "contact", "CONTACT_FORM_FULL", "Contact form"},
					{9, "footer", "FOOTER_MULTI_COLUMN", "Detailed footer"},
				},
			},
			{
				id:    "business_startup",
				name:  "Startup Founder",
				niche: "Business",
				theme: "VIBRANT",
				blocks: []struct {
					order       int
					blockType   string
					componentId string
					purpose     string
				}{
					{1, "header", "HEADER_AGENCY_VIBRANT", "Dynamic navigation"},
					{2, "hero", "HERO_DYNAMIC_GRADIENT", "Startup vision"},
					{3, "stats", "STATS_TICKER", "Growth metrics"},
					{4, "services", "SERVICES_CARDS_INTERACTIVE", "Product features"},
					{5, "projects", "PROJ_CASE_STUDY", "Success stories"},
					{6, "testimonials", "TESTIMONIALS_BENTO", "User testimonials"},
					{7, "cta", "CTA_SPLIT_VISUAL", "Call to action"},
					{8, "contact", "CONTACT_SPLIT", "Contact section"},
				},
			},
		},
		"Finance": {
			{
				id:    "finance_analyst",
				name:  "Financial Analyst",
				niche: "Finance",
				theme: "OCEANIC_MIST",
				blocks: []struct {
					order       int
					blockType   string
					componentId string
					purpose     string
				}{
					{1, "header", "HEADER_MINIMALIST", "Professional navigation"},
					{2, "hero", "HERO_EXECUTIVE", "Analyst intro"},
					{3, "stats", "STATS_COUNTER_GRID", "Financial metrics"},
					{4, "about", "ABOUT_METRICS_FOCUS", "Expertise focus"},
					{5, "services", "SERVICES_LIST_MINIMAL", "Services"},
					{6, "experience", "EXP_CARDS_GRID", "Career experience"},
					{7, "contact", "CONTACT_FORM_FULL", "Contact"},
					{8, "footer", "FOOTER_DARK_DETAILED", "Footer"},
				},
			},
		},
		"Marketing": {
			{
				id:    "marketing_growth",
				name:  "Growth Marketing",
				niche: "Marketing",
				theme: "VIBRANT_BLOOM",
				blocks: []struct {
					order       int
					blockType   string
					componentId string
					purpose     string
				}{
					{1, "header", "HEADER_AGENCY_VIBRANT", "Navigation"},
					{2, "hero", "HERO_AGENCY_VIBRANT", "Marketing intro"},
					{3, "stats", "STATS_COUNTER_GRID", "Campaign metrics"},
					{4, "skills", "SKILLS_TAGS_CLOUD", "Marketing skills"},
					{5, "projects", "PROJ_BENTO_GRID", "Campaign showcases"},
					{6, "experience", "EXP_TIMELINE_VERTICAL", "Work history"},
					{7, "contact", "CONTACT_FORM_FULL", "Contact"},
					{8, "footer", "FOOTER_NEWSLETTER", "Newsletter"},
				},
			},
		},
		"Agency": {
			{
				id:    "agency_full",
				name:  "Full Service Agency",
				niche: "Agency",
				theme: "VIBRANT",
				blocks: []struct {
					order       int
					blockType   string
					componentId string
					purpose     string
				}{
					{1, "header", "HEADER_AGENCY_VIBRANT", "Navigation"},
					{2, "hero", "HERO_AGENCY_VIBRANT", "Agency vision"},
					{3, "logos", "LOGOS_STRIP_CLEAN", "Client logos"},
					{4, "services", "SERVICES_AGENCY_GRID", "Services"},
					{5, "projects", "PROJ_AGENCY_CASE_STUDY", "Case studies"},
					{6, "testimonials", "TESTIMONIALS_GRID_PHOTOS", "Client feedback"},
					{7, "process", "PROCESS_STEPS_VERTICAL", "Our process"},
					{8, "pricing", "PRICING_MODERN_TIERS", "Pricing"},
					{9, "contact", "CONTACT_FORM_FULL", "Contact"},
					{10, "footer", "FOOTER_STICKY_CTA", "Footer with CTA"},
				},
			},
		},
	}

	// Convert template definitions to blueprints
	for niche, nicheTemplates := range templates {
		for _, tmpl := range nicheTemplates {
			blueprint := TemplateBlueprint{
				TemplateID:   tmpl.id,
				Niche:        tmpl.niche,
				Name:         tmpl.name,
				Theme:        tmpl.theme,
				BlockPattern: make([]TemplateBlockPattern, 0),
				ColorScheme:  make(map[string]string),
				Typography:   make(map[string]string),
			}

			// Convert blocks to patterns
			for _, block := range tmpl.blocks {
				blueprint.BlockPattern = append(blueprint.BlockPattern, TemplateBlockPattern{
					Order:       block.order,
					Type:        block.blockType,
					ComponentId: block.componentId,
					Purpose:     block.purpose,
				})
			}

			library.Blueprints = append(library.Blueprints, blueprint)
			library.NicheTemplates[niche] = append(library.NicheTemplates[niche], tmpl.id)

			// Index block patterns
			for _, block := range blueprint.BlockPattern {
				key := block.Type
				pattern := fmt.Sprintf("%d-%s-%s", block.Order, block.Type, block.ComponentId)
				library.BlockPatterns[key] = append(library.BlockPatterns[key], pattern)
			}
		}
	}

	return library
}
