package services

import (
	"strings"
)

// NicheResult carries both the broad niche and a more specific sub-niche.
// Sub-niches feed more targeted component guidance, reducing same-niche repetition.
type NicheResult struct {
	Niche    string // e.g. "Engineering"
	SubNiche string // e.g. "ml-ai", "frontend", "devops"
}

// DetectNicheDetailed returns both niche and sub-niche for a given CV/prompt text.
func DetectNicheDetailed(content string) NicheResult {
	niche := DetectNiche(content)
	return NicheResult{
		Niche:    niche,
		SubNiche: detectSubNiche(strings.ToLower(content), niche),
	}
}

func detectSubNiche(lower, niche string) string {
	has := func(keywords ...string) bool {
		for _, k := range keywords {
			if strings.Contains(lower, k) {
				return true
			}
		}
		return false
	}

	switch niche {
	case "Engineering":
		if has("machine learning", "deep learning", "neural network", "llm", "tensorflow", "pytorch", "ai engineer", "data scientist", "nlp", "computer vision") {
			return "ml-ai"
		}
		if has("devops", "kubernetes", "docker", "ci/cd", "infrastructure", "sre", "platform engineer", "terraform", "ansible") {
			return "devops"
		}
		if has("react", "vue", "angular", "frontend", "next.js", "svelte", "ui engineer", "css", "tailwind", "webpack") {
			return "frontend"
		}
		if has("android", "ios", "flutter", "swift", "kotlin", "react native", "mobile developer") {
			return "mobile"
		}
		if has("blockchain", "solidity", "web3", "smart contract", "defi", "ethereum") {
			return "blockchain"
		}
		if has("data engineer", "spark", "hadoop", "kafka", "airflow", "dbt", "etl", "data pipeline") {
			return "data-engineering"
		}
		return "fullstack"

	case "Creative":
		if has("photographer", "photography", "portrait", "wedding photo", "lightroom", "photoshoot") {
			return "photography"
		}
		if has("motion", "animation", "after effects", "cinema 4d", "blender", "3d artist", "vfx") {
			return "motion"
		}
		if has("ux", "user experience", "product design", "interaction design", "wireframe", "user research", "usability") {
			return "ux-ui"
		}
		if has("brand", "branding", "logo design", "identity", "art director", "brand strategist") {
			return "branding"
		}
		if has("illustration", "illustrator", "vector", "comic", "character design") {
			return "illustration"
		}
		return "graphic-design"

	case "Business":
		if has("startup", "founder", "co-founder", "entrepreneur", "venture", "seed", "series a") {
			return "startup"
		}
		if has("consultant", "consulting", "advisory", "management consulting", "strategy consulting") {
			return "consulting"
		}
		if has("product manager", "product management", "product owner", "roadmap", "agile product") {
			return "product"
		}
		if has("operations", "coo", "supply chain", "logistics", "process improvement") {
			return "operations"
		}
		return "executive"

	case "Marketing":
		if has("growth", "growth hacker", "a/b test", "acquisition", "retention", "funnel", "conversion rate") {
			return "growth"
		}
		if has("content", "copywriting", "editorial", "seo writer", "content strategist") {
			return "content"
		}
		if has("social media", "instagram", "tiktok", "influencer", "community manager") {
			return "social"
		}
		if has("performance", "paid ads", "google ads", "facebook ads", "sem", "ppc", "media buyer") {
			return "performance"
		}
		return "digital"

	case "Finance":
		if has("investment", "portfolio manager", "asset management", "hedge fund", "trader", "equity", "derivatives") {
			return "investment"
		}
		if has("cpa", "tax", "audit", "accounting", "chartered accountant") {
			return "accounting"
		}
		if has("risk", "compliance", "regulatory", "basel", "solvency") {
			return "risk"
		}
		return "analyst"

	case "Agency":
		if has("freelance", "freelancer", "solopreneur", "independent contractor") {
			return "freelance"
		}
		return "agency"
	}

	return ""
}

// NicheDetector analyzes CV content and detects professional niche
type NicheDetector struct {
	content string
}

// DetectNiche analyzes the CV content and returns the detected niche
func DetectNiche(cvContent string) string {
	if cvContent == "" {
		return "General"
	}

	lowerContent := strings.ToLower(cvContent)

	// Score-based detection for more accurate niche identification
	scores := map[string]int{
		"Engineering": 0,
		"Creative":    0,
		"Business":    0,
		"Finance":     0,
		"Medical":     0,
		"Sales":       0,
		"Marketing":   0,
		"Agency":      0,
		"Academic":    0,
	}

	// Engineering keywords
	engineeringKeywords := []string{
		"software engineer", "developer", "python", "javascript", "typescript", "golang", "rust", "java",
		"cloud", "aws", "azure", "gcp", "kubernetes", "docker", "ci/cd", "devops", "backend",
		"full stack", "frontend", "react", "vue", "angular", "node.js", "database", "sql",
		"api", "rest", "graphql", "microservices", "linux", "unix", "git", "github",
		"code review", "agile", "scrum", "technical", "algorithm", "data structure",
		"machine learning", "ml", "ai", "deep learning", "neural", "tensorflow", "pytorch",
		"data science", "python", "r programming", "spark", "hadoop", "etl",
		"system design", "architecture", "infrastructure", "deployment",
	}

	// Creative keywords
	creativeKeywords := []string{
		"designer", "design", "ux", "ui", "figma", "adobe", "photoshop", "illustrator",
		"art director", "graphic design", "branding", "visual", "creative director",
		"photographer", "photography", "motion", "animation", "video", "cinema",
		"illustrator", "typography", "layout", "composition", "aesthetics",
		"web designer", "interaction design", "product design", "3d design",
	}

	// Business/Executive keywords
	businessKeywords := []string{
		"ceo", "cfo", "coo", "cto", "manager", "director", "executive", "leader",
		"business development", "strategy", "consulting", "consultant",
		"project management", "product manager", "program manager", "operations",
		"business analyst", "sales", "account executive", "sales manager",
		"revenue", "profit", "p&l", "budget", "financial", "investment",
		"team lead", "team manager", "leadership", "management",
	}

	// Finance keywords
	financeKeywords := []string{
		"accountant", "accounting", "financial", "finance", "cpa", "chartered accountant",
		"auditor", "auditing", "investment", "portfolio", "trading", "trader",
		"banking", "banker", "credit", "loan", "mortgage", "insurance",
		"tax", "taxation", "analyst", "financial analyst", "budget analyst",
		"actuarial", "actuary", "modeling", "valuation", "risk management",
	}

	// Medical keywords
	medicalKeywords := []string{
		"doctor", "physician", "surgeon", "dentist", "nurse", "healthcare",
		"medical", "clinical", "hospital", "patient", "diagnosis", "treatment",
		"medicine", "pharmaceutical", "therapy", "rehabilitation", "nursing",
		"radiology", "cardiology", "pediatrics", "psychiatry", "psychology",
		"health", "medical degree", "md", "rn", "lpn", "clinical experience",
	}

	// Sales keywords
	salesKeywords := []string{
		"sales", "salesperson", "account executive", "business development",
		"sales representative", "territory manager", "quota", "pipeline",
		"client acquisition", "relationship management", "crm",
		"closing", "negotiation", "persuasion", "outbound", "inside sales",
	}

	// Marketing keywords
	marketingKeywords := []string{
		"marketing", "marketing manager", "marketing director", "product marketing",
		"campaign", "digital marketing", "seo", "sem", "ppc", "email marketing",
		"social media", "content marketing", "brand", "branding", "market research",
		"analytics", "conversion", "funnel", "growth", "a/b testing", "user acquisition",
	}

	// Agency keywords
	agencyKeywords := []string{
		"freelancer", "freelance", "agency", "consultant", "consultant designer",
		"contract", "project-based", "client work", "portfolio projects",
		"service provider", "contractor", "vendor", "independent", "solopreneur",
		"client management", "proposal", "deliverables", "retainer",
	}

	// Academic keywords
	academicKeywords := []string{
		"student", "university", "college", "degree", "bachelor", "master", "phd",
		"academic", "research", "thesis", "dissertation", "publication",
		"teaching assistant", "gpa", "honors", "scholarship", "intern",
		"coursework", "graduate", "undergrad", "internship", "entry level",
	}

	// Calculate scores
	for _, keyword := range engineeringKeywords {
		if strings.Contains(lowerContent, keyword) {
			scores["Engineering"] += 2
		}
	}

	for _, keyword := range creativeKeywords {
		if strings.Contains(lowerContent, keyword) {
			scores["Creative"] += 2
		}
	}

	for _, keyword := range businessKeywords {
		if strings.Contains(lowerContent, keyword) {
			scores["Business"] += 2
		}
	}

	for _, keyword := range financeKeywords {
		if strings.Contains(lowerContent, keyword) {
			scores["Finance"] += 2
		}
	}

	for _, keyword := range medicalKeywords {
		if strings.Contains(lowerContent, keyword) {
			scores["Medical"] += 2
		}
	}

	for _, keyword := range salesKeywords {
		if strings.Contains(lowerContent, keyword) {
			scores["Sales"] += 2
		}
	}

	for _, keyword := range marketingKeywords {
		if strings.Contains(lowerContent, keyword) {
			scores["Marketing"] += 2
		}
	}

	for _, keyword := range agencyKeywords {
		if strings.Contains(lowerContent, keyword) {
			scores["Agency"] += 2
		}
	}

	for _, keyword := range academicKeywords {
		if strings.Contains(lowerContent, keyword) {
			scores["Academic"] += 1
		}
	}

	// Find the highest scoring niche
	var bestNiche string
	maxScore := 0

	for niche, score := range scores {
		if score > maxScore {
			maxScore = score
			bestNiche = niche
		}
	}

	// If Academic has a high score, prioritize it for students
	if scores["Academic"] >= 3 {
		return "Academic"
	}

	// If no clear winner, default to "Business" as a safe fallback
	if bestNiche == "" {
		return "Business"
	}

	return bestNiche
}

// GetNicheBlueprint returns architecture recommendations for a detected niche
func GetNicheBlueprint(niche string) string {
	blueprints := map[string]string{
		"Engineering": `NICHE: Engineering/Tech
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → STATS → SKILLS → PROJECTS → EXPERIENCE → CONTACT → FOOTER
- Recommended Hero: HERO_CYBER_MONO, HERO_TERMINAL_STYLE, or HERO_GRID_LAYOUT for technical feel
- Recommended Projects: PROJ_GITHUB_STYLE, PROJ_BENTO_GRID, or PROJ_NEON_CARDS for showcasing code/work
- Recommended Skills: SKILLS_ENG_BENTO, SKILLS_ENG_TERMINAL, SKILLS_ENG_CIRCUIT, or SKILLS_NEON_GRID
- Recommended Experience: EXP_TIMELINE_VERTICAL or EXP_BENTO_CARDS for career progression
- Recommended Stats: STATS_NEON_COUNTERS or STATS_COUNTER_GRID for technical metrics
- Color Scheme: CYBER_NEON (dark with cyan/purple) or dark tech-focused themes
- Typography: JetBrains Mono for code examples, Inter for body
CRITICAL: Highlight technical achievements, metrics, open-source contributions, and technology stack prominently.`,

		"Creative": `NICHE: Creative/Design/Photography
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → ABOUT → PROJECTS/GALLERY → TESTIMONIALS → CONTACT → FOOTER
- Recommended Hero: HERO_VISUALIST, HERO_GLASS_FLOATING, or HERO_PHOTO_MOSAIC with strong imagery
- Recommended Projects: PROJ_MASONRY, PROJ_MAGAZINE_GRID, or GALLERY_MASONRY_GLASS to showcase visual work
- Recommended Skills: SKILLS_CREATIVE_MASONRY, SKILLS_CREATIVE_PALETTE, SKILLS_CREATIVE_CARDS, or SKILLS_WORD_CLOUD
- Recommended About: ABOUT_IMAGE_WRAP or ABOUT_BENTO_CREATIVE with strong visual emphasis
- Recommended Contact: CONTACT_NEON_MODERN, CONTACT_CREATIVE, or CONTACT_SOCIAL_ONLY
- Color Scheme: VIBRANT_BLOOM or MINIMAL_PAPER with creative color accents
- Typography: Playfair Display for headings, Outfit for body
CRITICAL: Portfolio images and visual hierarchy are paramount. Use high-quality Unsplash images.`,

		"Business": `NICHE: Business/Executive/Consulting
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → STATS → ABOUT → SERVICES → EXPERIENCE → TESTIMONIALS → CONTACT → FOOTER
- Recommended Hero: HERO_EXECUTIVE, HERO_CENTERED_MINIMAL, or HERO_MINIMAL_ELEGANCE with professional photo
- Recommended Stats: STATS_COUNTER_GRID, STATS_ANIMATED_COUNTERS, or STATS_BENTO_GRID showing impact
- Recommended Projects: PROJ_CASE_STUDY or PROJ_AGENCY_CASE_STUDY for business results
- Recommended Skills: SKILLS_BIZ_CARDS, SKILLS_BIZ_LIST, or SKILLS_BIZ_PIE
- Recommended Experience: EXP_CARDS_GRID, EXP_SPLIT_CONTENT, or EXP_TIMELINE_VERTICAL
- Recommended Contact: CONTACT_FORM_FULL or CONTACT_SPLIT for lead capture
- Color Scheme: LUXURY_GOLD or OCEANIC_MIST for corporate trust
- Typography: Lora or Fraunces for headings, Inter for body
CRITICAL: Focus on business impact, metrics, ROI, and leadership credentials.`,

		"Finance": `NICHE: Finance/Analyst
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → STATS → ABOUT → SKILLS → EXPERIENCE → CONTACT → FOOTER
- Recommended Hero: HERO_EXECUTIVE or HERO_MINIMAL_ELEGANCE
- Recommended Stats: STATS_COUNTER_GRID, STATS_LARGE_NUMBERS, or STATS_GLASS_CARDS showing financial achievements
- Recommended Skills: SKILLS_FIN_MATRIX, SKILLS_FIN_TICKER, or SKILLS_FIN_CHART
- Recommended About: ABOUT_METRICS_FOCUS or ABOUT_SPLIT_COLUMNS highlighting analytical skills
- Recommended Experience: EXP_TIMELINE_VERTICAL or EXP_MINIMAL_CLEAN
- Recommended Contact: CONTACT_FORM_FULL or CONTACT_SPLIT
- Color Scheme: Professional dark with subtle blue/green accents
- Typography: IBM Plex Sans for professional data look
CRITICAL: Emphasize analytical skills, certifications (CPA, CFA), and quantifiable financial impact.`,

		"Medical": `NICHE: Medical/Healthcare
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → ABOUT → EDUCATION → EXPERIENCE → TESTIMONIALS → CONTACT → FOOTER
- Recommended Hero: HERO_CENTERED_MINIMAL or HERO_EXECUTIVE with professional imagery
- Recommended About: ABOUT_NARRATIVE or ABOUT_STATS with clinical expertise
- Recommended Education: EDUCATION_TIMELINE or EDUCATION_BENTO for degrees and certifications
- Recommended Experience: EXP_TIMELINE_VERTICAL or EXP_CARDS_GRID for medical career progression
- Recommended Contact: CONTACT_FORM_FULL for patient/collaboration inquiries
- Color Scheme: OCEANIC_MIST (blue/teal for trust) or clean professional
- Typography: Clean sans-serif like Inter or Outfit
CRITICAL: Emphasize patient care experience, medical degrees (MD, RN, etc.), and certifications.`,

		"Sales": `NICHE: Sales
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → STATS → ABOUT → SKILLS → EXPERIENCE → TESTIMONIALS → CONTACT → FOOTER
- Recommended Hero: HERO_DYNAMIC_GRADIENT, HERO_STACKED_BOLD, or HERO_MODERN_SPLIT for energy
- Recommended Stats: STATS_COUNTER_GRID or STATS_ANIMATED_COUNTERS showing quota attainment and revenue impact
- Recommended Experience: EXP_TIMELINE_VERTICAL or EXP_SPLIT_CONTENT showing career progression
- Recommended Testimonials: TESTIMONIALS_GRID_PHOTOS or TESTIMONIALS_FEATURED from satisfied clients
- Recommended Contact: CONTACT_FORM_FULL or CONTACT_SPLIT for lead capture
- Color Scheme: VIBRANT_BLOOM or bold, energetic colors
- Typography: Bold fonts for impact (Outfit Bold, DM Serif Display)
CRITICAL: Highlight sales achievements, quota metrics, revenue numbers, and client testimonials prominently.`,

		"Marketing": `NICHE: Marketing
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → STATS → SKILLS → PROJECTS → EXPERIENCE → CONTACT → FOOTER
- Recommended Hero: HERO_DYNAMIC_GRADIENT, HERO_MODERN_SPLIT, or HERO_GRADIENT_TEXT for creative energy
- Recommended Stats: STATS_COUNTER_GRID or STATS_AGENCY_TICKER showing campaign performance and growth metrics
- Recommended Skills: SKILLS_MKT_FUNNEL, SKILLS_MKT_BUBBLES, or SKILLS_MKT_CAROUSEL
- Recommended Projects: PROJ_BENTO_GRID, PROJ_MAGAZINE_GRID, or PROJ_MASONRY for campaign showcases
- Recommended Experience: EXP_TIMELINE_VERTICAL or EXP_AGENCY_BOLD for career growth
- Recommended Contact: CONTACT_FORM_FULL or CONTACT_CREATIVE for collaboration inquiries
- Color Scheme: VIBRANT_BLOOM with marketing colors
- Typography: Bold, modern fonts (Outfit, DM Sans)
CRITICAL: Showcase marketing campaigns, growth achievements, and creative work prominently.`,

		"Agency": `NICHE: Agency/Freelancer
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → LOGOS/CLIENTS → SERVICES → PROJECTS → TESTIMONIALS → PROCESS → CONTACT → FOOTER
- Recommended Hero: HERO_NEOBRUTALIST, HERO_SMOOTH_SWEEP, or HERO_STACKED_BOLD
- Recommended Projects: PROJ_AGENCY_CASE_STUDY, PROJ_SPOTLIGHT, or PROJ_GLASS_CARDS with client results
- Recommended Skills: SKILLS_AGC_NEOBRUTAL, SKILLS_AGC_GLASS, or SKILLS_AGC_MINIMAL
- Recommended Services: SERVICES_AGENCY_GRID or SERVICES_GLOW_GRID highlighting service offerings
- Recommended Testimonials: TESTIMONIALS_GRID_PHOTOS or TESTIMONIALS_MASONRY from past clients
- Recommended Logos: LOGOS_STRIP_CLEAN for client credibility
- Recommended Contact: CONTACT_FORM_FULL or CONTACT_BENTO for project inquiries
- Color Scheme: Bold contrasting themes with strong brand colors
- Typography: Modern, bold fonts for impact
CRITICAL: Showcase client work, testimonials, service expertise, and proven results prominently.`,

		"Academic": `NICHE: Student/Academic/Entry-Level
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → ABOUT → EDUCATION → SKILLS → PROJECTS → EXPERIENCE → CONTACT → FOOTER
- Recommended Hero: HERO_CENTERED_MINIMAL, HERO_MINIMAL_LEFT, or HERO_CIRCLE_AVATAR for fresh approach
- Recommended About: ABOUT_NARRATIVE or ABOUT_CENTERED_CLEAN with academic background and goals
- Recommended Education: EDUCATION_TIMELINE or EDUCATION_CARDS_GRID highlighting degree, GPA, honors
- Recommended Projects: PROJ_MINIMAL_CARDS, PROJ_THUMBNAIL_GRID, or PROJ_COMPACT_GRID for academic/hobby projects
- Recommended Skills: SKILLS_TAGS_CLOUD, SKILLS_PROGRESS_BARS, or SKILLS_FLOATING_PILLS
- Recommended Experience: EXP_TIMELINE_VERTICAL or EXP_COMPACT_ROWS including internships and part-time work
- Recommended Contact: CONTACT_CARD_SIMPLE or CONTACT_MINIMAL_SIMPLE
- Color Scheme: Clean, minimal themes (light modern or MINIMAL_PAPER)
- Typography: Clean sans-serif (Outfit, Inter)
CRITICAL: Emphasize education, academic achievements, and growth potential. Include internships and academic projects.`,
	}

	if blueprint, exists := blueprints[niche]; exists {
		return blueprint
	}

	// Default blueprint for unknown niches
	return `NICHE: General Professional
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → ABOUT → SKILLS → PROJECTS → EXPERIENCE → CONTACT → FOOTER
- Use professional, clean design with balanced layout
- Focus on clarity and accessibility`
}
