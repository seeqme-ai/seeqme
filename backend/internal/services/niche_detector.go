package services

import (
	"strings"
)

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
- Section Flow: HEADER → HERO (CYBER/TECH theme) → STATS → SKILLS → PROJECTS → EXPERIENCE → CONTACT → FOOTER
- Recommended Hero: HERO_CYBER_MONO or HERO_DARK_SASS for dark, technical feel
- Recommended Projects: PROJ_GITHUB_STYLE or PROJ_BENTO_GRID for showcasing code/work
- Recommended Skills: SKILLS_GRID_ICONS or SKILLS_DARK_SASS with tech tags
- Recommended Experience: EXP_TIMELINE_VERTICAL for career progression
- Color Scheme: CYBER_NEON (dark with cyan/purple) or dark tech-focused themes
- Typography: JetBrains Mono for code examples, Inter for body
CRITICAL: Highlight technical achievements, metrics, and technology stack prominently.`,

		"Creative": `NICHE: Creative/Design/Photography
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO (VISUAL theme) → ABOUT → PROJECTS/GALLERY → TESTIMONIALS → CONTACT → FOOTER
- Recommended Hero: HERO_VISUALIST or HERO_GLASS_FLOATING with strong imagery
- Recommended Projects: PROJ_MASONRY or GALLERY_MASONRY_GLASS to showcase visual work
- Recommended Skills: SKILLS_TAGS_CLOUD or SKILLS_MARQUEE
- Recommended About: ABOUT_IMAGE_WRAP with strong visual emphasis
- Recommended Contact: CONTACT_NEON_MODERN or CONTACT_SOCIAL_ONLY
- Color Scheme: VIBRANT_BLOOM or MINIMAL_PAPER with creative color accents
- Typography: Playfair Display for headings, Outfit for body
CRITICAL: Portfolio images and visual hierarchy are paramount. Use high-quality Unsplash images.`,

		"Business": `NICHE: Business/Executive/Consulting
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO (EXECUTIVE theme) → STATS → ABOUT → SERVICES/EXPERIENCE → TESTIMONIALS → CONTACT → FOOTER
- Recommended Hero: HERO_EXECUTIVE or HERO_CENTERED_MINIMAL with professional photo
- Recommended Stats: STATS_COUNTER_GRID or STATS_ANIMATED_COUNTERS showing impact
- Recommended Projects: PROJ_CASE_STUDY or PROJ_AGENCY_CASE_STUDY for business results
- Recommended Experience: EXP_CARDS_GRID or EXP_TIMELINE_VERTICAL
- Recommended Contact: CONTACT_FORM_FULL for lead capture
- Color Scheme: LUXURY_GOLD or OCEANIC_MIST for corporate trust
- Typography: Lora or Fraunces for headings, Inter for body
CRITICAL: Focus on business impact, metrics, ROI, and leadership credentials.`,

		"Finance": `NICHE: Finance/Analyst
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → STATS → ABOUT → SERVICES → EXPERIENCE → CONTACT → FOOTER
- Recommended Hero: HERO_EXECUTIVE or HERO_CENTERED_MINIMAL
- Recommended Stats: STATS_COUNTER_GRID, STATS_LARGE_NUMBERS showing financial achievements
- Recommended About: ABOUT_METRICS_FOCUS highlighting analytical skills
- Recommended Services: SERVICES_LIST_MINIMAL for financial services offered
- Recommended Contact: CONTACT_FORM_FULL
- Color Scheme: Professional dark with subtle blue/green accents
- Typography: IBM Plex Sans for professional data look
CRITICAL: Emphasize analytical skills, certifications (CPA, CFA), and quantifiable financial impact.`,

		"Medical": `NICHE: Medical/Healthcare
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → ABOUT → CERTIFICATIONS → EXPERIENCE → TESTIMONIALS → CONTACT → FOOTER
- Recommended Hero: HERO_CENTERED_MINIMAL with professional medical imagery
- Recommended About: ABOUT_NARRATIVE with clinical expertise
- Recommended Services: SERVICES_CARDS_INTERACTIVE highlighting medical specialties
- Recommended Experience: EXP_TIMELINE_VERTICAL for medical career progression
- Recommended Contact: CONTACT_FORM_FULL for patient/collaboration inquiries
- Color Scheme: OCEANIC_MIST (blue/teal for trust) or clean medical white/blue
- Typography: Clean sans-serif like Inter or Outfit
CRITICAL: Emphasize patient care experience, medical degrees (MD, RN, etc.), and certifications.`,

		"Sales": `NICHE: Sales
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → STATS (quota, revenue) → ABOUT → SKILLS → EXPERIENCE → TESTIMONIALS → CONTACT → FOOTER
- Recommended Hero: HERO_DYNAMIC_GRADIENT or HERO_AGENCY_VIBRANT for energy
- Recommended Stats: STATS_COUNTER_GRID showing quota attainment and revenue impact
- Recommended Experience: EXP_TIMELINE_VERTICAL showing career progression and territory growth
- Recommended Testimonials: TESTIMONIALS_GRID_PHOTOS from satisfied clients
- Recommended Contact: CONTACT_FORM_FULL for lead capture
- Color Scheme: VIBRANT_BLOOM or bold, energetic colors
- Typography: Bold fonts for impact (Outfit Bold, DM Serif Display)
CRITICAL: Highlight sales achievements, quota metrics, and client testimonials prominently.`,

		"Marketing": `NICHE: Marketing
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → STATS (campaigns, growth metrics) → SKILLS → PROJECTS → EXPERIENCE → CONTACT → FOOTER
- Recommended Hero: HERO_AGENCY_VIBRANT or HERO_MODERN_SPLIT for creative energy
- Recommended Stats: STATS_COUNTER_GRID showing campaign performance and growth metrics
- Recommended Projects: PROJ_BENTO_GRID or PROJ_MASONRY for campaign showcases
- Recommended Experience: EXP_TIMELINE_VERTICAL for career growth
- Recommended Contact: CONTACT_FORM_FULL for collaboration inquiries
- Color Scheme: VIBRANT_BLOOM with marketing colors
- Typography: Bold, modern fonts (Outfit, DM Sans)
CRITICAL: Showcase marketing campaigns, growth achievements, and creative work prominently.`,

		"Agency": `NICHE: Agency/Freelancer
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → LOGOS/CLIENTS → SERVICES → PROJECTS → TESTIMONIALS → PROCESS → PRICING → CONTACT → FOOTER
- Recommended Hero: HERO_AGENCY_VIBRANT or HERO_SMOOTH_SWEEP
- Recommended Projects: PROJ_AGENCY_CASE_STUDY with client results
- Recommended Services: SERVICES_AGENCY_GRID highlighting service offerings
- Recommended Testimonials: TESTIMONIALS_GRID_PHOTOS from past clients
- Recommended Logos: LOGOS_STRIP_CLEAN for client credibility
- Recommended Contact: CONTACT_FORM_FULL for project inquiries
- Color Scheme: VIBRANT or bold contrasting themes
- Typography: Modern, bold fonts for impact
CRITICAL: Showcase client work, testimonials, and service expertise prominently.`,

		"Academic": `NICHE: Student/Academic/Entry-Level
ARCHITECTURAL BLUEPRINT:
- Section Flow: HEADER → HERO → ABOUT → EDUCATION → SKILLS → PROJECTS → EXPERIENCE → CONTACT → FOOTER
- Recommended Hero: HERO_CENTERED_MINIMAL or HERO_MINIMAL_CREATOR for fresh approach
- Recommended About: ABOUT_NARRATIVE with academic background and goals
- Recommended Education: Custom section highlighting degree, GPA, honors
- Recommended Projects: PROJ_MINIMAL_CARDS or PROJ_THUMBNAIL_GRID for academic/hobby projects
- Recommended Skills: SKILLS_TAGS_CLOUD or SKILLS_PROGRESS_BARS
- Recommended Experience: EXP_TIMELINE_VERTICAL including internships and part-time work
- Recommended Contact: CONTACT_CARD_SIMPLE or CONTACT_MINIMAL_SIMPLE
- Color Scheme: Clean, minimal themes (MINIMAL_PAPER or light modern)
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
