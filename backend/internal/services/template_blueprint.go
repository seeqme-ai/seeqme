package services

import (
	"encoding/json"
	"fmt"
	"hash/fnv"
	"math/rand"
	"strings"
)

// contentHashSeed produces a deterministic int64 seed from the first 1500 chars of the
// content string. Using CV content as the seed means the same person always gets the
// same component rotation, while two different people in the same niche get different
// component suggestions — eliminating same-niche visual repetition without randomness.
func contentHashSeed(content string) int64 {
	if len(content) > 1500 {
		content = content[:1500]
	}
	h := fnv.New32a()
	h.Write([]byte(content))
	return int64(h.Sum32())
}

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
- Use only concrete registry component IDs (for example HERO_*, PROJ_*, SKILLS_*, CONTACT_*, FOOTER_*).
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

// GetNicheTemplateExamples returns up to 3 example blueprints for a niche, shuffled
// deterministically using the provided seed so the same CV content always produces the
// same architectural suggestions while different CVs in the same niche diverge.
func GetNicheTemplateExamples(library *TemplateLibrary, niche string, seed int64) []TemplateBlueprint {
	examples := make([]TemplateBlueprint, 0)
	r := rand.New(rand.NewSource(seed))

	if templates, ok := library.NicheTemplates[niche]; ok {
		shuffledIDs := make([]string, len(templates))
		copy(shuffledIDs, templates)
		r.Shuffle(len(shuffledIDs), func(i, j int) {
			shuffledIDs[i], shuffledIDs[j] = shuffledIDs[j], shuffledIDs[i]
		})
		for _, templateID := range shuffledIDs {
			for _, blueprint := range library.Blueprints {
				if blueprint.TemplateID == templateID {
					examples = append(examples, blueprint)
					if len(examples) >= 3 {
						return examples
					}
				}
			}
		}
	}

	// Cross-niche fallback: seed-shuffled global blueprints fill remaining slots.
	if len(examples) < 3 && len(library.Blueprints) > 0 {
		shuffled := make([]TemplateBlueprint, len(library.Blueprints))
		copy(shuffled, library.Blueprints)
		r.Shuffle(len(shuffled), func(i, j int) {
			shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
		})
		seen := map[string]bool{}
		for _, ex := range examples {
			seen[ex.TemplateID] = true
		}
		for _, bp := range shuffled {
			if len(examples) >= 3 {
				break
			}
			if !seen[bp.TemplateID] {
				examples = append(examples, bp)
				seen[bp.TemplateID] = true
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

// GenerateManifestGuidance creates detailed, creative architecture guidance from templates.
// contentSeed is a string derived from the user's raw input — its hash drives deterministic
// component rotation so two different people in the same niche receive different suggestions.
func GenerateManifestGuidance(library *TemplateLibrary, niche string, contentSeed string) string {
	seed := contentHashSeed(contentSeed)
	examples := GetNicheTemplateExamples(library, niche, seed)

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

AVAILABLE COMPONENT LIBRARY (160+ options — use ONLY IDs from this list):
HEADERS (5): HEADER_MINIMALIST, HEADER_AGENCY_VIBRANT, HEADER_TECH_GLOW, HEADER_MINIMALIST_CREATOR, HEADER_DARK_SASS
HEROES (25): HERO_MODERN_SPLIT, HERO_CYBER_MONO, HERO_VISUALIST, HERO_EXECUTIVE, HERO_GLASS_FLOATING, HERO_NEOBRUTALIST, HERO_MINIMAL_LEFT, HERO_STACKED_BOLD, HERO_GRID_LAYOUT, HERO_DYNAMIC_GRADIENT, HERO_CENTERED_MINIMAL, HERO_MINIMAL_ELEGANCE, HERO_TERMINAL_STYLE, HERO_VIDEO_BG, HERO_MAGAZINE, HERO_PARALLAX_LAYERS, HERO_CIRCLE_AVATAR, HERO_SPLIT_DIAGONAL, HERO_GRADIENT_TEXT, HERO_CARD_STACK, HERO_SIDEBAR_LEFT, HERO_PHOTO_MOSAIC, HERO_GLITCH_TEXT, HERO_SMOOTH_SWEEP, HERO_GRID_PORTRAIT
ABOUT (15): ABOUT_NARRATIVE, ABOUT_STATS, ABOUT_IMAGE_WRAP, ABOUT_GLASS_DECONSTRUCTED, ABOUT_TIMELINE_PERSONAL, ABOUT_SPLIT_COLUMNS, ABOUT_QUOTE_FOCUS, ABOUT_VIDEO_INTRO, ABOUT_METRICS_FOCUS, ABOUT_BENTO_CREATIVE, ABOUT_DARK_SPLIT, ABOUT_MAGAZINE_STORY, ABOUT_CENTERED_CLEAN, ABOUT_CREATIVE_DIAGONAL, ABOUT_SKILLS_INLINE
SKILLS (36): SKILLS_MARQUEE, SKILLS_GRID_ICONS, SKILLS_PROGRESS_BARS, SKILLS_TAGS_CLOUD, SKILLS_HEXAGON_GRID, SKILLS_RADAR_CHART, SKILLS_DARK_SAAS, SKILLS_AGENCY, SKILLS_ENG_BENTO, SKILLS_ENG_TERMINAL, SKILLS_ENG_CIRCUIT, SKILLS_CREATIVE_MASONRY, SKILLS_CREATIVE_PALETTE, SKILLS_CREATIVE_CARDS, SKILLS_BIZ_CARDS, SKILLS_BIZ_LIST, SKILLS_BIZ_PIE, SKILLS_FIN_MATRIX, SKILLS_FIN_TICKER, SKILLS_FIN_CHART, SKILLS_MKT_FUNNEL, SKILLS_MKT_BUBBLES, SKILLS_MKT_CAROUSEL, SKILLS_AGC_NEOBRUTAL, SKILLS_AGC_GLASS, SKILLS_AGC_MINIMAL, SKILLS_CATEGORY_TABS, SKILLS_CARD_FLIP, SKILLS_NEON_GRID, SKILLS_WORD_CLOUD, SKILLS_ICON_SHOWCASE, SKILLS_MINIMAL_ROWS, SKILLS_DARK_BENTO, SKILLS_GAUGE_RINGS, SKILLS_FLOATING_PILLS, SKILLS_COMPACT_TAGS
PROJECTS (25): PROJ_BENTO_GRID, PROJ_MINIMAL_CARDS, PROJ_STACKED_LIST, PROJ_CAROUSEL_FULLSCREEN, PROJ_GITHUB_STYLE, PROJ_MASONRY, PROJ_CASE_STUDY, PROJ_THUMBNAIL_GRID, PROJ_FEATURED_SINGLE, PROJ_TIMELINE_VERTICAL, PROJ_3D_PERSPECTIVE, PROJ_LIST_PREVIEW, PROJ_OVERLAP_SLOTS, PROJ_ALTERNATING_ROWS, PROJ_SPOTLIGHT, PROJ_MAGAZINE_GRID, PROJ_NEON_CARDS, PROJ_GLASS_CARDS, PROJ_NUMBERED_SHOWCASE, PROJ_HORIZONTAL_CARDS, PROJ_COMPACT_GRID, PROJ_DARK_SHOWCASE, PROJ_AGENCY_CASE_STUDY, PROJ_SIDE_BY_SIDE_GRID, PROJ_FULLWIDTH_SCROLL
EXPERIENCE (17): EXP_TIMELINE_VERTICAL, EXP_ACCORDION_MINIMAL, EXP_CARDS_GRID, EXP_HORIZONTAL_SCROLL, EXP_TABS_SWITCH, EXP_SIDEBAR_LIST, EXP_GLASSMORPHIC, EXP_MAGAZINE, EXP_NUMBERED_LIST, EXP_BENTO_CARDS, EXP_FLOATING_TIMELINE, EXP_SPLIT_CONTENT, EXP_MINIMAL_CLEAN, EXP_AGENCY_BOLD, EXP_DARK_CARDS, EXP_CREATIVE_FLOW, EXP_COMPACT_ROWS
STATS (15): STATS_COUNTER_GRID, STATS_TIMELINE, STATS_CIRCULAR_PROGRESS, STATS_COMPARISON_TABLE, STATS_ACHIEVEMENT_BADGES, STATS_ANIMATED_COUNTERS, STATS_ICON_CARDS, STATS_MINIMAL_INLINE, STATS_LARGE_NUMBERS, STATS_BENTO_GRID, STATS_NEON_COUNTERS, STATS_HORIZONTAL_BARS, STATS_GLASS_CARDS, STATS_BOLD_ROWS, STATS_AGENCY_TICKER
TESTIMONIALS (10): TESTIMONIALS_BENTO, TESTIMONIALS_CAROUSEL, TESTIMONIALS_GRID_PHOTOS, TESTIMONIALS_QUOTE_WALL, TESTIMONIALS_MASONRY, TESTIMONIALS_DARK_GRID, TESTIMONIALS_FEATURED, TESTIMONIALS_COMPACT_LIST, TESTIMONIALS_SLIDER_CSS, TESTIMONIALS_NEON_CARDS
CONTACT (16): CONTACT_SPLIT, CONTACT_NEON_MODERN, CONTACT_SOCIAL_ONLY, CONTACT_CARD_SIMPLE, CONTACT_FORM_FULL, CONTACT_DARK_SASS, CONTACT_MINIMAL_SIMPLE, FORM_MINIMALIST, FORM_ELEGANT_SPLIT, FORM_TECH_AUDIT, CONTACT_BENTO, CONTACT_GLASSMORPHIC, CONTACT_DARK_MINIMAL, CONTACT_CREATIVE, CONTACT_FLOATING_CARD
FOOTERS (11): FOOTER_MINIMAL, FOOTER_SOCIAL_HEAVY, FOOTER_NEWSLETTER, FOOTER_MULTI_COLUMN, FOOTER_STICKY_CTA, FOOTER_DARK_DETAILED, FOOTER_SINGLE_LINE, FOOTER_BRAND_FOCUS, FOOTER_DARK_SASS, FOOTER_AGENCY_BOLD, FOOTER_MINIMAL_SIMPLE
CTA (7): CTA_HERO_INLINE, CTA_SPLIT_VISUAL, CTA_BANNER_STICKY, CTA_CENTERED_BOLD, CTA_CARD_HOVER, CTA_NEWSLETTER_INLINE, CTA_CONTACT_MINI
EDUCATION (5): EDUCATION_TIMELINE, EDUCATION_CARDS_GRID, EDUCATION_MINIMAL_LIST, EDUCATION_BENTO, EDUCATION_CREATIVE
AWARDS (3): AWARDS_SHOWCASE, AWARDS_COMPACT_LIST, AWARDS_FEATURED
SERVICES: SERVICES_CARDS_INTERACTIVE, SERVICES_MINIMAL_LIST, SERVICES_AGENCY_GRID, SERVICES_LIST_MINIMAL

=== EXAMPLE CREATIVE APPROACHES ===

Engineering:
  Safe:  HEADER_TECH_GLOW → HERO_CYBER_MONO → STATS_COUNTER_GRID → SKILLS_ENG_BENTO → PROJ_GITHUB_STYLE → EXP_TIMELINE_VERTICAL → CONTACT_NEON_MODERN → FOOTER_DARK_DETAILED
  Bold:  HEADER_DARK_SASS → HERO_TERMINAL_STYLE → PROJ_ALTERNATING_ROWS → SKILLS_NEON_GRID → STATS_GLASS_CARDS → EXP_BENTO_CARDS → CONTACT_BENTO → FOOTER_DARK_SASS
  Creative: HEADER_MINIMALIST → HERO_GRID_PORTRAIT → STATS_BOLD_ROWS → SKILLS_GAUGE_RINGS → PROJ_NUMBERED_SHOWCASE → EXP_FLOATING_TIMELINE → CONTACT_GLASSMORPHIC → FOOTER_MINIMAL

Creative:
  Safe:  HEADER_MINIMALIST → HERO_VISUALIST → ABOUT_IMAGE_WRAP → PROJ_MASONRY → SKILLS_CREATIVE_PALETTE → TESTIMONIALS_GRID_PHOTOS → CONTACT_SOCIAL_ONLY → FOOTER_MINIMAL
  Bold:  HEADER_AGENCY_VIBRANT → HERO_MAGAZINE → PROJ_MAGAZINE_GRID → SKILLS_FLOATING_PILLS → TESTIMONIALS_FEATURED → ABOUT_MAGAZINE_STORY → CONTACT_CREATIVE → FOOTER_AGENCY_BOLD
  Minimal: HEADER_MINIMALIST_CREATOR → HERO_MINIMAL_LEFT → ABOUT_CENTERED_CLEAN → PROJ_SPOTLIGHT → SKILLS_MINIMAL_ROWS → CONTACT_DARK_MINIMAL → FOOTER_SINGLE_LINE

Business:
  Safe:  HEADER_MINIMALIST → HERO_EXECUTIVE → STATS_ANIMATED_COUNTERS → ABOUT_STATS → EXP_CARDS_GRID → TESTIMONIALS_BENTO → CONTACT_FORM_FULL → FOOTER_MULTI_COLUMN
  Bold:  HEADER_TECH_GLOW → HERO_STACKED_BOLD → STATS_NEON_COUNTERS → ABOUT_BENTO_CREATIVE → SERVICES_AGENCY_GRID → EXP_SPLIT_CONTENT → TESTIMONIALS_DARK_GRID → CONTACT_FLOATING_CARD → FOOTER_DARK_DETAILED
  Executive: HEADER_DARK_SASS → HERO_GRID_LAYOUT → STATS_LARGE_NUMBERS → ABOUT_DARK_SPLIT → EXP_COMPACT_ROWS → TESTIMONIALS_MASONRY → CONTACT_GLASSMORPHIC → FOOTER_BRAND_FOCUS

Freelancer/Agency:
  HEADER_AGENCY_VIBRANT → HERO_DYNAMIC_GRADIENT → LOGOS_STRIP_CLEAN → SERVICES_CARDS_INTERACTIVE → PROJ_AGENCY_CASE_STUDY → TESTIMONIALS_SLIDER_CSS → PROCESS_STEPS_VERTICAL → PRICING_MINIMAL_CARDS → CONTACT_SPLIT → FOOTER_STICKY_CTA

Academic/Student:
  HEADER_MINIMALIST → HERO_CENTERED_MINIMAL → ABOUT_CENTERED_CLEAN → EDUCATION_TIMELINE → SKILLS_COMPACT_TAGS → PROJ_COMPACT_GRID → EXP_MINIMAL_CLEAN → CONTACT_CARD_SIMPLE → FOOTER_MINIMAL_SIMPLE

Mix these patterns freely. The goal is MEMORABLE, not safe.
`

	// Append sub-niche specific component guidance to further differentiate output.
	nicheResult := DetectNicheDetailed(contentSeed)
	subNicheGuidance := getSubNicheComponentGuidance(nicheResult.Niche, nicheResult.SubNiche)
	if subNicheGuidance != "" {
		guidance += "\n" + subNicheGuidance
	}

	return guidance
}

// getSubNicheComponentGuidance returns focused component recommendations for a detected sub-niche.
// These override the generic niche suggestions to produce more role-appropriate UI choices.
func getSubNicheComponentGuidance(niche, subNiche string) string {
	type rec struct{ hero, skills, projects, experience, contact string }

	overrides := map[string]map[string]rec{
		"Engineering": {
			"ml-ai":            {hero: "HERO_CYBER_MONO or HERO_TERMINAL_STYLE or HERO_GRID_PORTRAIT", skills: "SKILLS_ENG_CIRCUIT or SKILLS_RADAR_CHART or SKILLS_GAUGE_RINGS", projects: "PROJ_ALTERNATING_ROWS or PROJ_CASE_STUDY or PROJ_BENTO_GRID", experience: "EXP_BENTO_CARDS or EXP_FLOATING_TIMELINE", contact: "CONTACT_NEON_MODERN or CONTACT_BENTO"},
			"devops":           {hero: "HERO_GRID_LAYOUT or HERO_STACKED_BOLD or HERO_GLITCH_TEXT", skills: "SKILLS_ENG_BENTO or SKILLS_DARK_BENTO or SKILLS_NEON_GRID", projects: "PROJ_GITHUB_STYLE or PROJ_NUMBERED_SHOWCASE or PROJ_COMPACT_GRID", experience: "EXP_COMPACT_ROWS or EXP_ACCORDION_MINIMAL", contact: "CONTACT_FORM_FULL or CONTACT_GLASSMORPHIC"},
			"frontend":         {hero: "HERO_MODERN_SPLIT or HERO_VISUALIST or HERO_SPLIT_DIAGONAL", skills: "SKILLS_MARQUEE or SKILLS_FLOATING_PILLS or SKILLS_CATEGORY_TABS", projects: "PROJ_MASONRY or PROJ_MAGAZINE_GRID or PROJ_GLASS_CARDS", experience: "EXP_CARDS_GRID or EXP_DARK_CARDS", contact: "CONTACT_SPLIT or CONTACT_FLOATING_CARD"},
			"mobile":           {hero: "HERO_GLASS_FLOATING or HERO_MINIMAL_LEFT or HERO_CIRCLE_AVATAR", skills: "SKILLS_ENG_BENTO or SKILLS_CARD_FLIP or SKILLS_COMPACT_TAGS", projects: "PROJ_SPOTLIGHT or PROJ_CAROUSEL_FULLSCREEN or PROJ_SIDE_BY_SIDE_GRID", experience: "EXP_CREATIVE_FLOW or EXP_TIMELINE_VERTICAL", contact: "CONTACT_CARD_SIMPLE or CONTACT_DARK_MINIMAL"},
			"data-engineering": {hero: "HERO_EXECUTIVE or HERO_STACKED_BOLD or HERO_GRID_LAYOUT", skills: "SKILLS_FIN_CHART or SKILLS_ENG_CIRCUIT or SKILLS_MINIMAL_ROWS", projects: "PROJ_ALTERNATING_ROWS or PROJ_DARK_SHOWCASE or PROJ_CASE_STUDY", experience: "EXP_TABS_SWITCH or EXP_SPLIT_CONTENT", contact: "CONTACT_FORM_FULL or CONTACT_BENTO"},
			"fullstack":        {hero: "HERO_NEOBRUTALIST or HERO_DYNAMIC_GRADIENT or HERO_PHOTO_MOSAIC", skills: "SKILLS_ENG_TERMINAL or SKILLS_HEXAGON_GRID or SKILLS_WORD_CLOUD", projects: "PROJ_BENTO_GRID or PROJ_3D_PERSPECTIVE or PROJ_NEON_CARDS", experience: "EXP_AGENCY_BOLD or EXP_SIDEBAR_LIST", contact: "CONTACT_NEON_MODERN or CONTACT_CREATIVE"},
			"blockchain":       {hero: "HERO_GLITCH_TEXT or HERO_CYBER_MONO or HERO_GRADIENT_TEXT", skills: "SKILLS_NEON_GRID or SKILLS_DARK_BENTO or SKILLS_ENG_CIRCUIT", projects: "PROJ_NEON_CARDS or PROJ_DARK_SHOWCASE or PROJ_NUMBERED_SHOWCASE", experience: "EXP_BENTO_CARDS or EXP_MAGAZINE", contact: "CONTACT_NEON_MODERN or CONTACT_DARK_MINIMAL"},
		},
		"Creative": {
			"photography":   {hero: "HERO_VISUALIST or HERO_PHOTO_MOSAIC or HERO_MAGAZINE", skills: "SKILLS_TAGS_CLOUD or SKILLS_CREATIVE_PALETTE or SKILLS_FLOATING_PILLS", projects: "PROJ_MASONRY or PROJ_MAGAZINE_GRID or PROJ_FULLWIDTH_SCROLL", experience: "EXP_ACCORDION_MINIMAL or EXP_MINIMAL_CLEAN", contact: "CONTACT_SOCIAL_ONLY or CONTACT_DARK_MINIMAL"},
			"motion":        {hero: "HERO_STACKED_BOLD or HERO_DYNAMIC_GRADIENT or HERO_VIDEO_BG", skills: "SKILLS_CREATIVE_CARDS or SKILLS_ICON_SHOWCASE or SKILLS_FLOATING_PILLS", projects: "PROJ_SPOTLIGHT or PROJ_CAROUSEL_FULLSCREEN or PROJ_MAGAZINE_GRID", experience: "EXP_CREATIVE_FLOW or EXP_TIMELINE_VERTICAL", contact: "CONTACT_NEON_MODERN or CONTACT_CREATIVE"},
			"ux-ui":         {hero: "HERO_MODERN_SPLIT or HERO_GLASS_FLOATING or HERO_SIDEBAR_LEFT", skills: "SKILLS_CREATIVE_MASONRY or SKILLS_PROGRESS_BARS or SKILLS_CATEGORY_TABS", projects: "PROJ_ALTERNATING_ROWS or PROJ_CASE_STUDY or PROJ_SPOTLIGHT", experience: "EXP_CARDS_GRID or EXP_SPLIT_CONTENT", contact: "CONTACT_SPLIT or CONTACT_FLOATING_CARD"},
			"branding":      {hero: "HERO_VISUALIST or HERO_MINIMAL_LEFT or HERO_GRADIENT_TEXT", skills: "SKILLS_CREATIVE_PALETTE or SKILLS_WORD_CLOUD or SKILLS_AGENCY", projects: "PROJ_MASONRY or PROJ_AGENCY_CASE_STUDY or PROJ_MAGAZINE_GRID", experience: "EXP_MAGAZINE or EXP_ACCORDION_MINIMAL", contact: "CONTACT_SOCIAL_ONLY or CONTACT_BENTO"},
			"illustration":  {hero: "HERO_VISUALIST or HERO_CARD_STACK or HERO_PHOTO_MOSAIC", skills: "SKILLS_FLOATING_PILLS or SKILLS_CREATIVE_MASONRY or SKILLS_WORD_CLOUD", projects: "PROJ_MASONRY or PROJ_THUMBNAIL_GRID or PROJ_FULLWIDTH_SCROLL", experience: "EXP_MINIMAL_CLEAN or EXP_ACCORDION_MINIMAL", contact: "CONTACT_SOCIAL_ONLY or CONTACT_CREATIVE"},
			"graphic-design": {hero: "HERO_NEOBRUTALIST or HERO_MAGAZINE or HERO_SPLIT_DIAGONAL", skills: "SKILLS_CREATIVE_CARDS or SKILLS_TAGS_CLOUD or SKILLS_COMPACT_TAGS", projects: "PROJ_BENTO_GRID or PROJ_MASONRY or PROJ_GLASS_CARDS", experience: "EXP_CARDS_GRID or EXP_FLOATING_TIMELINE", contact: "CONTACT_SPLIT or CONTACT_CREATIVE"},
		},
		"Business": {
			"startup":    {hero: "HERO_DYNAMIC_GRADIENT or HERO_NEOBRUTALIST or HERO_STACKED_BOLD", skills: "SKILLS_BIZ_CARDS or SKILLS_COMPACT_TAGS or SKILLS_WORD_CLOUD", projects: "PROJ_CASE_STUDY or PROJ_ALTERNATING_ROWS or PROJ_SPOTLIGHT", experience: "EXP_TIMELINE_VERTICAL or EXP_AGENCY_BOLD", contact: "CONTACT_FORM_FULL or CONTACT_FLOATING_CARD"},
			"consulting": {hero: "HERO_EXECUTIVE or HERO_CENTERED_MINIMAL or HERO_GRID_LAYOUT", skills: "SKILLS_BIZ_LIST or SKILLS_BIZ_PIE or SKILLS_MINIMAL_ROWS", projects: "PROJ_AGENCY_CASE_STUDY or PROJ_NUMBERED_SHOWCASE or PROJ_CASE_STUDY", experience: "EXP_CARDS_GRID or EXP_COMPACT_ROWS", contact: "CONTACT_FORM_FULL or CONTACT_BENTO"},
			"product":    {hero: "HERO_MODERN_SPLIT or HERO_GRID_LAYOUT or HERO_SIDEBAR_LEFT", skills: "SKILLS_BIZ_CARDS or SKILLS_RADAR_CHART or SKILLS_CATEGORY_TABS", projects: "PROJ_ALTERNATING_ROWS or PROJ_CASE_STUDY or PROJ_GLASS_CARDS", experience: "EXP_TABS_SWITCH or EXP_SPLIT_CONTENT", contact: "CONTACT_SPLIT or CONTACT_GLASSMORPHIC"},
			"executive":  {hero: "HERO_EXECUTIVE or HERO_STACKED_BOLD or HERO_GRID_PORTRAIT", skills: "SKILLS_BIZ_PIE or SKILLS_BIZ_LIST or SKILLS_GAUGE_RINGS", projects: "PROJ_AGENCY_CASE_STUDY or PROJ_HORIZONTAL_CARDS or PROJ_DARK_SHOWCASE", experience: "EXP_COMPACT_ROWS or EXP_SIDEBAR_LIST", contact: "CONTACT_FORM_FULL or CONTACT_GLASSMORPHIC"},
			"operations": {hero: "HERO_EXECUTIVE or HERO_MINIMAL_ELEGANCE or HERO_CENTERED_MINIMAL", skills: "SKILLS_BIZ_LIST or SKILLS_MINIMAL_ROWS or SKILLS_PROGRESS_BARS", projects: "PROJ_CASE_STUDY or PROJ_STACKED_LIST or PROJ_COMPACT_GRID", experience: "EXP_NUMBERED_LIST or EXP_COMPACT_ROWS", contact: "CONTACT_FORM_FULL or CONTACT_CARD_SIMPLE"},
		},
		"Marketing": {
			"growth":      {hero: "HERO_DYNAMIC_GRADIENT or HERO_NEOBRUTALIST or HERO_SMOOTH_SWEEP", skills: "SKILLS_MKT_FUNNEL or SKILLS_MKT_BUBBLES or SKILLS_GAUGE_RINGS", projects: "PROJ_BENTO_GRID or PROJ_ALTERNATING_ROWS or PROJ_SPOTLIGHT", experience: "EXP_TIMELINE_VERTICAL or EXP_BENTO_CARDS", contact: "CONTACT_FORM_FULL or CONTACT_FLOATING_CARD"},
			"content":     {hero: "HERO_MODERN_SPLIT or HERO_MINIMAL_LEFT or HERO_MAGAZINE", skills: "SKILLS_MKT_CAROUSEL or SKILLS_TAGS_CLOUD or SKILLS_WORD_CLOUD", projects: "PROJ_MASONRY or PROJ_MAGAZINE_GRID or PROJ_LIST_PREVIEW", experience: "EXP_ACCORDION_MINIMAL or EXP_MINIMAL_CLEAN", contact: "CONTACT_SPLIT or CONTACT_BENTO"},
			"social":      {hero: "HERO_VISUALIST or HERO_GLASS_FLOATING or HERO_CIRCLE_AVATAR", skills: "SKILLS_MKT_BUBBLES or SKILLS_FLOATING_PILLS or SKILLS_MARQUEE", projects: "PROJ_THUMBNAIL_GRID or PROJ_CAROUSEL_FULLSCREEN or PROJ_GLASS_CARDS", experience: "EXP_CARDS_GRID or EXP_CREATIVE_FLOW", contact: "CONTACT_SOCIAL_ONLY or CONTACT_CREATIVE"},
			"performance": {hero: "HERO_STACKED_BOLD or HERO_EXECUTIVE or HERO_GRID_LAYOUT", skills: "SKILLS_MKT_FUNNEL or SKILLS_FIN_CHART or SKILLS_PROGRESS_BARS", projects: "PROJ_CASE_STUDY or PROJ_ALTERNATING_ROWS or PROJ_NUMBERED_SHOWCASE", experience: "EXP_TIMELINE_VERTICAL or EXP_COMPACT_ROWS", contact: "CONTACT_FORM_FULL or CONTACT_BENTO"},
			"digital":     {hero: "HERO_DYNAMIC_GRADIENT or HERO_MODERN_SPLIT or HERO_SPLIT_DIAGONAL", skills: "SKILLS_MKT_CAROUSEL or SKILLS_MKT_BUBBLES or SKILLS_COMPACT_TAGS", projects: "PROJ_BENTO_GRID or PROJ_GLASS_CARDS or PROJ_SPOTLIGHT", experience: "EXP_CARDS_GRID or EXP_DARK_CARDS", contact: "CONTACT_SPLIT or CONTACT_GLASSMORPHIC"},
		},
		"Finance": {
			"investment": {hero: "HERO_EXECUTIVE or HERO_CENTERED_MINIMAL or HERO_STACKED_BOLD", skills: "SKILLS_FIN_TICKER or SKILLS_FIN_MATRIX or SKILLS_GAUGE_RINGS", projects: "PROJ_CASE_STUDY or PROJ_HORIZONTAL_CARDS or PROJ_COMPACT_GRID", experience: "EXP_TIMELINE_VERTICAL or EXP_COMPACT_ROWS", contact: "CONTACT_FORM_FULL or CONTACT_GLASSMORPHIC"},
			"accounting": {hero: "HERO_EXECUTIVE or HERO_MINIMAL_LEFT or HERO_MINIMAL_ELEGANCE", skills: "SKILLS_FIN_MATRIX or SKILLS_BIZ_LIST or SKILLS_MINIMAL_ROWS", projects: "PROJ_CASE_STUDY or PROJ_STACKED_LIST or PROJ_NUMBERED_SHOWCASE", experience: "EXP_CARDS_GRID or EXP_NUMBERED_LIST", contact: "CONTACT_FORM_FULL or CONTACT_CARD_SIMPLE"},
			"risk":       {hero: "HERO_GRID_LAYOUT or HERO_EXECUTIVE or HERO_STACKED_BOLD", skills: "SKILLS_FIN_CHART or SKILLS_RADAR_CHART or SKILLS_PROGRESS_BARS", projects: "PROJ_CASE_STUDY or PROJ_DARK_SHOWCASE or PROJ_ALTERNATING_ROWS", experience: "EXP_SIDEBAR_LIST or EXP_TABS_SWITCH", contact: "CONTACT_FORM_FULL or CONTACT_BENTO"},
			"analyst":    {hero: "HERO_STACKED_BOLD or HERO_GRID_LAYOUT or HERO_SIDEBAR_LEFT", skills: "SKILLS_FIN_CHART or SKILLS_RADAR_CHART or SKILLS_CATEGORY_TABS", projects: "PROJ_ALTERNATING_ROWS or PROJ_BENTO_GRID or PROJ_COMPACT_GRID", experience: "EXP_TIMELINE_VERTICAL or EXP_SPLIT_CONTENT", contact: "CONTACT_FORM_FULL or CONTACT_FLOATING_CARD"},
		},
		"Agency": {
			"freelance": {hero: "HERO_NEOBRUTALIST or HERO_MODERN_SPLIT or HERO_SMOOTH_SWEEP", skills: "SKILLS_AGC_NEOBRUTAL or SKILLS_FLOATING_PILLS or SKILLS_COMPACT_TAGS", projects: "PROJ_AGENCY_CASE_STUDY or PROJ_MASONRY or PROJ_ALTERNATING_ROWS", experience: "EXP_ACCORDION_MINIMAL or EXP_CREATIVE_FLOW", contact: "CONTACT_SPLIT or CONTACT_BENTO"},
			"agency":    {hero: "HERO_DYNAMIC_GRADIENT or HERO_STACKED_BOLD or HERO_MAGAZINE", skills: "SKILLS_AGC_GLASS or SKILLS_AGC_MINIMAL or SKILLS_ICON_SHOWCASE", projects: "PROJ_AGENCY_CASE_STUDY or PROJ_MAGAZINE_GRID or PROJ_DARK_SHOWCASE", experience: "EXP_AGENCY_BOLD or EXP_TIMELINE_VERTICAL", contact: "CONTACT_FORM_FULL or CONTACT_CREATIVE"},
		},
		"Academic": {
			"": {hero: "HERO_CENTERED_MINIMAL or HERO_MINIMAL_LEFT or HERO_CIRCLE_AVATAR", skills: "SKILLS_COMPACT_TAGS or SKILLS_PROGRESS_BARS or SKILLS_TAGS_CLOUD", projects: "PROJ_COMPACT_GRID or PROJ_MINIMAL_CARDS or PROJ_GITHUB_STYLE", experience: "EXP_MINIMAL_CLEAN or EXP_NUMBERED_LIST", contact: "CONTACT_CARD_SIMPLE or CONTACT_DARK_MINIMAL"},
		},
	}

	if subNiche == "" {
		return ""
	}

	nichemap, ok := overrides[niche]
	if !ok {
		return ""
	}
	r, ok := nichemap[subNiche]
	if !ok {
		return ""
	}

	return fmt.Sprintf(`
=== SUB-NICHE COMPONENT PREFERENCES: %s / %s ===
These specific components match this professional profile most closely. Prioritise them over generic choices:
  Hero:       %s
  Skills:     %s
  Projects:   %s
  Experience: %s
  Contact:    %s
You may deviate for creative reasons, but these are your highest-signal starting points.
`, niche, subNiche, r.hero, r.skills, r.projects, r.experience, r.contact)
}

// BuildTemplateLibraryFromRegistry creates a template library from predefined templates
// This serves as a fallback when template blueprints are loaded on demand
func BuildTemplateLibraryFromRegistry() *TemplateLibrary {
	library := &TemplateLibrary{
		Blueprints:     make([]TemplateBlueprint, 0),
		NicheTemplates: make(map[string][]string),
		BlockPatterns:  make(map[string][]string),
	}

	type blockDef struct {
		order       int
		blockType   string
		componentId string
		purpose     string
	}
	type tmplDef struct {
		id     string
		name   string
		niche  string
		theme  string
		blocks []blockDef
	}

	templates := map[string][]tmplDef{
		"Engineering": {
			{
				id: "eng_cyber_mono", name: "Cyber Mono Developer", niche: "Engineering", theme: "CYBER_NEON",
				blocks: []blockDef{
					{1, "header", "HEADER_TECH_GLOW", "Navigation with tech aesthetic"},
					{2, "hero", "HERO_CYBER_MONO", "High-impact tech intro"},
					{3, "stats", "STATS_COUNTER_GRID", "Technical metrics and impact"},
					{4, "skills", "SKILLS_ENG_BENTO", "Programming languages and tools"},
					{5, "projects", "PROJ_GITHUB_STYLE", "Code repositories showcase"},
					{6, "experience", "EXP_TIMELINE_VERTICAL", "Career progression"},
					{7, "contact", "CONTACT_NEON_MODERN", "Tech-focused contact"},
					{8, "footer", "FOOTER_DARK_DETAILED", "Credits and links"},
				},
			},
			{
				id: "eng_terminal", name: "Terminal Stack Engineer", niche: "Engineering", theme: "DARK_TECH",
				blocks: []blockDef{
					{1, "header", "HEADER_DARK_SASS", "Dark navigation"},
					{2, "hero", "HERO_TERMINAL_STYLE", "Terminal-style engineering intro"},
					{3, "stats", "STATS_NEON_COUNTERS", "Key metrics"},
					{4, "skills", "SKILLS_ENG_TERMINAL", "Technical skillset"},
					{5, "projects", "PROJ_BENTO_GRID", "Project showcase"},
					{6, "experience", "EXP_BENTO_CARDS", "Work history"},
					{7, "contact", "CONTACT_DARK_SASS", "Simple dark contact"},
					{8, "footer", "FOOTER_DARK_SASS", "Dark footer"},
				},
			},
			{
				id: "eng_modern_split", name: "Modern Full-Stack", niche: "Engineering", theme: "MODERN_LIGHT",
				blocks: []blockDef{
					{1, "header", "HEADER_MINIMALIST", "Clean navigation"},
					{2, "hero", "HERO_MODERN_SPLIT", "Split hero with photo"},
					{3, "about", "ABOUT_SKILLS_INLINE", "About with skills inline"},
					{4, "skills", "SKILLS_NEON_GRID", "Skills grid"},
					{5, "projects", "PROJ_ALTERNATING_ROWS", "Projects alternating layout"},
					{6, "experience", "EXP_CARDS_GRID", "Experience cards"},
					{7, "stats", "STATS_GLASS_CARDS", "Achievements"},
					{8, "contact", "CONTACT_SPLIT", "Contact split layout"},
					{9, "footer", "FOOTER_MINIMAL", "Minimal footer"},
				},
			},
		},
		"Creative": {
			{
				id: "creative_visual", name: "Visual Designer", niche: "Creative", theme: "VIBRANT_BLOOM",
				blocks: []blockDef{
					{1, "header", "HEADER_MINIMALIST", "Clean navigation"},
					{2, "hero", "HERO_VISUALIST", "Visual impact hero"},
					{3, "about", "ABOUT_IMAGE_WRAP", "Designer bio"},
					{4, "projects", "GALLERY_MASONRY_GLASS", "Portfolio gallery"},
					{5, "skills", "SKILLS_CREATIVE_PALETTE", "Design skills"},
					{6, "testimonials", "TESTIMONIALS_GRID_PHOTOS", "Client feedback"},
					{7, "contact", "CONTACT_SOCIAL_ONLY", "Social links"},
					{8, "footer", "FOOTER_MINIMAL", "Credits"},
				},
			},
			{
				id: "creative_magazine", name: "Magazine-Style Creative", niche: "Creative", theme: "EDITORIAL",
				blocks: []blockDef{
					{1, "header", "HEADER_AGENCY_VIBRANT", "Agency navigation"},
					{2, "hero", "HERO_MAGAZINE", "Editorial hero"},
					{3, "about", "ABOUT_MAGAZINE_STORY", "Story-driven about"},
					{4, "projects", "PROJ_MAGAZINE_GRID", "Magazine-style projects"},
					{5, "skills", "SKILLS_WORD_CLOUD", "Skills cloud"},
					{6, "testimonials", "TESTIMONIALS_MASONRY", "Masonry testimonials"},
					{7, "contact", "CONTACT_CREATIVE", "Creative contact"},
					{8, "footer", "FOOTER_AGENCY_BOLD", "Bold footer"},
				},
			},
			{
				id: "creative_minimal_photographer", name: "Minimal Photographer", niche: "Creative", theme: "MINIMAL_PAPER",
				blocks: []blockDef{
					{1, "header", "HEADER_MINIMALIST_CREATOR", "Minimal creator nav"},
					{2, "hero", "HERO_PHOTO_MOSAIC", "Photo mosaic hero"},
					{3, "projects", "PROJ_MASONRY", "Photo collections"},
					{4, "about", "ABOUT_CENTERED_CLEAN", "Clean about section"},
					{5, "skills", "SKILLS_COMPACT_TAGS", "Compact skill tags"},
					{6, "testimonials", "TESTIMONIALS_FEATURED", "Featured testimonial"},
					{7, "contact", "CONTACT_MINIMAL_SIMPLE", "Simple contact"},
					{8, "footer", "FOOTER_SINGLE_LINE", "Single line footer"},
				},
			},
		},
		"Business": {
			{
				id: "exec_luxury", name: "Executive Leadership", niche: "Business", theme: "LUXURY_GOLD",
				blocks: []blockDef{
					{1, "header", "HEADER_TECH_GLOW", "Professional navigation"},
					{2, "hero", "HERO_EXECUTIVE", "Executive intro"},
					{3, "stats", "STATS_ANIMATED_COUNTERS", "Business impact"},
					{4, "about", "ABOUT_STATS", "Executive bio with stats"},
					{5, "services", "SERVICES_AGENCY_GRID", "Services offered"},
					{6, "experience", "EXP_TIMELINE_VERTICAL", "Career history"},
					{7, "testimonials", "TESTIMONIALS_BENTO", "Client testimonials"},
					{8, "contact", "CONTACT_FORM_FULL", "Contact form"},
					{9, "footer", "FOOTER_MULTI_COLUMN", "Detailed footer"},
				},
			},
			{
				id: "business_startup", name: "Startup Founder", niche: "Business", theme: "VIBRANT",
				blocks: []blockDef{
					{1, "header", "HEADER_AGENCY_VIBRANT", "Dynamic navigation"},
					{2, "hero", "HERO_DYNAMIC_GRADIENT", "Startup vision hero"},
					{3, "stats", "STATS_AGENCY_TICKER", "Growth metrics ticker"},
					{4, "services", "SERVICES_CARDS_INTERACTIVE", "Product features"},
					{5, "projects", "PROJ_CASE_STUDY", "Success stories"},
					{6, "testimonials", "TESTIMONIALS_GRID_PHOTOS", "User testimonials"},
					{7, "cta", "CTA_SPLIT_VISUAL", "Call to action"},
					{8, "contact", "CONTACT_SPLIT", "Contact section"},
					{9, "footer", "FOOTER_STICKY_CTA", "Footer with CTA"},
				},
			},
			{
				id: "business_consultant", name: "Consultant / Advisor", niche: "Business", theme: "OCEANIC_MIST",
				blocks: []blockDef{
					{1, "header", "HEADER_MINIMALIST", "Clean navigation"},
					{2, "hero", "HERO_MINIMAL_ELEGANCE", "Elegant consultant intro"},
					{3, "about", "ABOUT_SPLIT_COLUMNS", "Split about section"},
					{4, "stats", "STATS_BENTO_GRID", "Achievement bento"},
					{5, "experience", "EXP_SPLIT_CONTENT", "Experience split view"},
					{6, "skills", "SKILLS_BIZ_PIE", "Business skills"},
					{7, "testimonials", "TESTIMONIALS_COMPACT_LIST", "Compact client quotes"},
					{8, "contact", "CONTACT_GLASSMORPHIC", "Glass contact form"},
					{9, "footer", "FOOTER_BRAND_FOCUS", "Brand-focused footer"},
				},
			},
		},
		"Finance": {
			{
				id: "finance_analyst", name: "Financial Analyst", niche: "Finance", theme: "OCEANIC_MIST",
				blocks: []blockDef{
					{1, "header", "HEADER_MINIMALIST", "Professional navigation"},
					{2, "hero", "HERO_EXECUTIVE", "Analyst intro"},
					{3, "stats", "STATS_COUNTER_GRID", "Financial metrics"},
					{4, "about", "ABOUT_METRICS_FOCUS", "Expertise focus"},
					{5, "skills", "SKILLS_FIN_MATRIX", "Financial skill matrix"},
					{6, "experience", "EXP_CARDS_GRID", "Career experience"},
					{7, "contact", "CONTACT_FORM_FULL", "Contact form"},
					{8, "footer", "FOOTER_DARK_DETAILED", "Detailed footer"},
				},
			},
			{
				id: "finance_quant", name: "Quantitative Finance", niche: "Finance", theme: "DARK_PRECISION",
				blocks: []blockDef{
					{1, "header", "HEADER_TECH_GLOW", "Tech-finance navigation"},
					{2, "hero", "HERO_STACKED_BOLD", "Bold finance intro"},
					{3, "stats", "STATS_LARGE_NUMBERS", "Key financial numbers"},
					{4, "skills", "SKILLS_FIN_CHART", "Quantitative skills"},
					{5, "experience", "EXP_TIMELINE_VERTICAL", "Career timeline"},
					{6, "about", "ABOUT_DARK_SPLIT", "Dark split about"},
					{7, "contact", "CONTACT_SPLIT", "Contact"},
					{8, "footer", "FOOTER_DARK_SASS", "Dark footer"},
				},
			},
		},
		"Marketing": {
			{
				id: "marketing_growth", name: "Growth Marketing", niche: "Marketing", theme: "VIBRANT_BLOOM",
				blocks: []blockDef{
					{1, "header", "HEADER_AGENCY_VIBRANT", "Agency navigation"},
					{2, "hero", "HERO_DYNAMIC_GRADIENT", "Marketing energy hero"},
					{3, "stats", "STATS_COUNTER_GRID", "Campaign metrics"},
					{4, "skills", "SKILLS_MKT_FUNNEL", "Marketing funnel skills"},
					{5, "projects", "PROJ_BENTO_GRID", "Campaign showcases"},
					{6, "experience", "EXP_TIMELINE_VERTICAL", "Work history"},
					{7, "contact", "CONTACT_FORM_FULL", "Contact"},
					{8, "footer", "FOOTER_NEWSLETTER", "Newsletter footer"},
				},
			},
			{
				id: "marketing_content", name: "Content & Social", niche: "Marketing", theme: "CREATIVE_WARM",
				blocks: []blockDef{
					{1, "header", "HEADER_MINIMALIST_CREATOR", "Creator navigation"},
					{2, "hero", "HERO_MODERN_SPLIT", "Content creator hero"},
					{3, "about", "ABOUT_NARRATIVE", "Creator story"},
					{4, "skills", "SKILLS_MKT_BUBBLES", "Content skills bubbles"},
					{5, "projects", "PROJ_MAGAZINE_GRID", "Content portfolio"},
					{6, "stats", "STATS_ANIMATED_COUNTERS", "Engagement metrics"},
					{7, "testimonials", "TESTIMONIALS_QUOTE_WALL", "Brand endorsements"},
					{8, "contact", "CONTACT_CREATIVE", "Creative contact"},
					{9, "footer", "FOOTER_MINIMAL", "Minimal footer"},
				},
			},
		},
		"Agency": {
			{
				id: "agency_full", name: "Full Service Agency", niche: "Agency", theme: "VIBRANT",
				blocks: []blockDef{
					{1, "header", "HEADER_AGENCY_VIBRANT", "Agency navigation"},
					{2, "hero", "HERO_STACKED_BOLD", "Agency bold hero"},
					{3, "logos", "LOGOS_STRIP_CLEAN", "Client logos"},
					{4, "services", "SERVICES_AGENCY_GRID", "Services grid"},
					{5, "projects", "PROJ_AGENCY_CASE_STUDY", "Case studies"},
					{6, "testimonials", "TESTIMONIALS_GRID_PHOTOS", "Client feedback"},
					{7, "process", "PROCESS_STEPS_VERTICAL", "Our process"},
					{8, "pricing", "PRICING_MODERN_TIERS", "Pricing tiers"},
					{9, "contact", "CONTACT_FORM_FULL", "Contact form"},
					{10, "footer", "FOOTER_STICKY_CTA", "Footer with CTA"},
				},
			},
			{
				id: "agency_freelancer", name: "Freelancer / Solopreneur", niche: "Agency", theme: "NEOBRUTALIST",
				blocks: []blockDef{
					{1, "header", "HEADER_MINIMALIST", "Clean nav"},
					{2, "hero", "HERO_NEOBRUTALIST", "Neobrutalist hero"},
					{3, "services", "SERVICES_CARDS_INTERACTIVE", "Service cards"},
					{4, "projects", "PROJ_SPOTLIGHT", "Spotlight projects"},
					{5, "skills", "SKILLS_AGC_NEOBRUTAL", "Agency skills neobrutalist"},
					{6, "testimonials", "TESTIMONIALS_FEATURED", "Featured testimonial"},
					{7, "contact", "CONTACT_BENTO", "Bento contact"},
					{8, "footer", "FOOTER_AGENCY_BOLD", "Bold footer"},
				},
			},
		},
		"Medical": {
			{
				id: "medical_professional", name: "Medical Professional", niche: "Medical", theme: "OCEANIC_MIST",
				blocks: []blockDef{
					{1, "header", "HEADER_MINIMALIST", "Professional navigation"},
					{2, "hero", "HERO_CENTERED_MINIMAL", "Professional medical intro"},
					{3, "about", "ABOUT_NARRATIVE", "Clinical expertise narrative"},
					{4, "education", "EDUCATION_TIMELINE", "Medical degrees timeline"},
					{5, "experience", "EXP_TIMELINE_VERTICAL", "Medical career progression"},
					{6, "skills", "SKILLS_BIZ_LIST", "Clinical specializations"},
					{7, "testimonials", "TESTIMONIALS_GRID_PHOTOS", "Patient/colleague feedback"},
					{8, "contact", "CONTACT_FORM_FULL", "Contact form"},
					{9, "footer", "FOOTER_MULTI_COLUMN", "Detailed footer"},
				},
			},
		},
		"Sales": {
			{
				id: "sales_energetic", name: "Sales Professional", niche: "Sales", theme: "VIBRANT_BLOOM",
				blocks: []blockDef{
					{1, "header", "HEADER_AGENCY_VIBRANT", "Dynamic navigation"},
					{2, "hero", "HERO_DYNAMIC_GRADIENT", "Energetic sales hero"},
					{3, "stats", "STATS_ANIMATED_COUNTERS", "Quota and revenue metrics"},
					{4, "about", "ABOUT_STATS", "Track record focus"},
					{5, "skills", "SKILLS_PROGRESS_BARS", "Sales competencies"},
					{6, "experience", "EXP_TIMELINE_VERTICAL", "Sales career timeline"},
					{7, "testimonials", "TESTIMONIALS_GRID_PHOTOS", "Client testimonials"},
					{8, "contact", "CONTACT_FORM_FULL", "Contact form"},
					{9, "footer", "FOOTER_MINIMAL", "Minimal footer"},
				},
			},
		},
		"Academic": {
			{
				id: "academic_student", name: "Student / Entry-Level", niche: "Academic", theme: "MINIMAL_CLEAN",
				blocks: []blockDef{
					{1, "header", "HEADER_MINIMALIST", "Clean navigation"},
					{2, "hero", "HERO_CENTERED_MINIMAL", "Clean student intro"},
					{3, "about", "ABOUT_CENTERED_CLEAN", "Academic background"},
					{4, "education", "EDUCATION_TIMELINE", "Degree timeline"},
					{5, "skills", "SKILLS_COMPACT_TAGS", "Skill tags"},
					{6, "projects", "PROJ_COMPACT_GRID", "Academic and hobby projects"},
					{7, "experience", "EXP_MINIMAL_CLEAN", "Internships and part-time work"},
					{8, "contact", "CONTACT_CARD_SIMPLE", "Simple contact card"},
					{9, "footer", "FOOTER_MINIMAL_SIMPLE", "Minimal footer"},
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
