package services

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
)

// PersonProfile is the canonical structured representation of a person extracted
// from raw CV/prompt text during Phase 1 of the two-phase generation pipeline.
type PersonProfile struct {
	Name           string          `json:"name"`
	Title          string          `json:"title"`
	Email          string          `json:"email"`
	Phone          string          `json:"phone"`
	Location       string          `json:"location"`
	Website        string          `json:"website,omitempty"`
	Summary        string          `json:"summary"`
	Availability   string          `json:"availability,omitempty"`
	Skills         []SkillCategory `json:"skills"`
	Experiences    []WorkExperience `json:"experiences"`
	Projects       []ProjectEntry  `json:"projects"`
	Education      []EducationEntry `json:"education"`
	Certifications []CertEntry     `json:"certifications"`
	Socials        []SocialEntry   `json:"socials"`
	Stats          []StatEntry     `json:"stats"`
}

type SkillCategory struct {
	Category string   `json:"category"`
	Items    []string `json:"items"`
}

type WorkExperience struct {
	Company      string   `json:"company"`
	Position     string   `json:"position"`
	Period       string   `json:"period"`
	Description  string   `json:"description"`
	Achievements []string `json:"achievements"`
}

type ProjectEntry struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tech        []string `json:"tech"`
	Link        string   `json:"link"`
	GitHub      string   `json:"github"`
	Image       string   `json:"image,omitempty"`
}

type EducationEntry struct {
	School string `json:"school"`
	Degree string `json:"degree"`
	Year   string `json:"year"`
	GPA    string `json:"gpa,omitempty"`
	Honors string `json:"honors,omitempty"`
}

type CertEntry struct {
	Name   string `json:"name"`
	Issuer string `json:"issuer"`
	Year   string `json:"year"`
}

type SocialEntry struct {
	Platform string `json:"platform"`
	URL      string `json:"url"`
}

type StatEntry struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

const ProfileExtractionSystemPrompt = `You are a precise structured data extractor. Extract professional information from the provided CV/resume/prompt text and return ONLY valid JSON.

EXTRACTION RULES:
1. Extract ONLY information present in the source. Never fabricate employers, degrees, or metrics.
2. Use "" for missing string fields and [] for missing arrays — never null, never omit.
3. summary: Write a concise 2-4 sentence professional summary using the person's own experience.
4. availability: Extract if stated; default to "Open to opportunities" if absent.
5. skills: Group into logical categories (e.g. "Languages", "Frameworks", "Tools", "Cloud", "Databases").
6. stats: Derive 3-5 impactful metrics directly from the CV (e.g. "5+ Years Experience", "12 Projects Shipped", "3 Certifications"). Base these on real data.
7. experiences.achievements: Extract bullet-point achievements per role, keeping quantified results.
8. Return ONLY the JSON object. No markdown fences. No explanation text.

OUTPUT SCHEMA (follow exactly):
{
  "name": "string",
  "title": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "website": "string",
  "summary": "string",
  "availability": "string",
  "skills": [{ "category": "string", "items": ["string"] }],
  "experiences": [{
    "company": "string",
    "position": "string",
    "period": "string",
    "description": "string",
    "achievements": ["string"]
  }],
  "projects": [{
    "title": "string",
    "description": "string",
    "tech": ["string"],
    "link": "string",
    "github": "string"
  }],
  "education": [{ "school": "string", "degree": "string", "year": "string", "gpa": "string", "honors": "string" }],
  "certifications": [{ "name": "string", "issuer": "string", "year": "string" }],
  "socials": [{ "platform": "string", "url": "string" }],
  "stats": [{ "label": "string", "value": "string" }]
}`

// ExtractPersonProfile runs a focused AI call to extract a typed PersonProfile from raw CV text.
// This is Phase 1 of the two-phase generation pipeline. Input is truncated at 6000 chars to
// keep the extraction call fast and within token limits.
func ExtractPersonProfile(provider AIProvider, rawInput string) (*PersonProfile, error) {
	if strings.TrimSpace(rawInput) == "" {
		return nil, fmt.Errorf("empty input")
	}

	input := rawInput
	if len(input) > 6000 {
		input = input[:6000]
	}

	raw, err := provider.Generate(input, ProfileExtractionSystemPrompt, nil)
	if err != nil {
		return nil, fmt.Errorf("extraction call failed: %w", err)
	}

	cleaned := CleanAIJSON(raw)

	var profile PersonProfile
	if err := json.Unmarshal([]byte(cleaned), &profile); err != nil {
		log.Printf("[ProfileExtractor] JSON parse error: %v\nRaw output: %.500s", err, cleaned)
		return nil, fmt.Errorf("profile parse failed: %w", err)
	}

	log.Printf("[ProfileExtractor] Extracted: name=%q title=%q skills=%d experiences=%d projects=%d",
		profile.Name, profile.Title, len(profile.Skills), len(profile.Experiences), len(profile.Projects))

	return &profile, nil
}

// BuildProfilePrompt serialises a PersonProfile into a structured prompt block for Phase 2.
// The AI architect receives typed, pre-parsed data instead of raw text, which allows it to
// map fields correctly (e.g. profile.summary → hero.content.bio).
func BuildProfilePrompt(profile *PersonProfile) string {
	data, _ := json.MarshalIndent(profile, "", "  ")
	return fmt.Sprintf(
		"=== STRUCTURED PERSON PROFILE (authoritative source — map all content fields from this) ===\n"+
			"hero.content.name = profile.name\n"+
			"hero.content.title = profile.title\n"+
			"hero.content.bio = profile.summary\n"+
			"hero.content.availability = profile.availability\n"+
			"hero.content.socials = profile.socials\n"+
			"skills.content.categories = profile.skills\n"+
			"experience.content.items = profile.experiences\n"+
			"projects.content.items = profile.projects (map tech → technologies)\n"+
			"stats.content.items = profile.stats\n"+
			"contact.content.email = profile.email, .phone = profile.phone, .location = profile.location, .socials = profile.socials\n"+
			"footer.content.name = profile.name, .socials = profile.socials\n\n"+
			"%s\n"+
			"=== END PROFILE ===",
		string(data),
	)
}

// FlattenProfileForNiche returns a compact string from a PersonProfile suitable for
// keyword-based niche detection — more signal-dense than raw CV text.
func FlattenProfileForNiche(profile *PersonProfile) string {
	parts := []string{profile.Title, profile.Summary}
	for _, sc := range profile.Skills {
		parts = append(parts, sc.Category)
		parts = append(parts, sc.Items...)
	}
	for _, exp := range profile.Experiences {
		parts = append(parts, exp.Position, exp.Company)
	}
	return strings.Join(parts, " ")
}
