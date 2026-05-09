package services

import (
	"bufio"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"seeqmeai/backend/internal/config"
	"strings"
	"time"
)

// Helper to clean JSON from AI responses
func CleanAIJSON(content string) string {
	content = strings.TrimSpace(content)
	if strings.HasPrefix(content, "```json") {
		content = strings.TrimPrefix(content, "```json")
		content = strings.TrimSuffix(content, "```")
	} else if strings.HasPrefix(content, "```") {
		content = strings.TrimPrefix(content, "```")
		content = strings.TrimSuffix(content, "```")
	}
	content = strings.TrimSpace(content)

	// Robustly escape newlines within string literals
	var buf bytes.Buffer
	inString := false
	escaped := false

	for _, r := range content {
		switch r {
		case '"':
			if !escaped {
				inString = !inString
			}
			buf.WriteRune(r)
			escaped = false
		case '\\':
			if inString && !escaped {
				escaped = true
			} else {
				escaped = false
			}
			buf.WriteRune(r)
		case '\n':
			if inString {
				buf.WriteString("\\n")
			} else {
				buf.WriteRune(r)
			}
			escaped = false
		default:
			buf.WriteRune(r)
			escaped = false
		}
	}

	return buf.String()
}

type AIProvider interface {
	Generate(prompt string, systemPrompt string, onChunk func(string)) (string, error)
	GenerateStructured(prompt string, schema interface{}) (interface{}, error)
}

type OpenAIProvider struct {
	APIKey string
	Model  string
}

type AnthropicProvider struct {
	APIKey string
	Model  string
}

type GeminiProvider struct {
	APIKey string
	Model  string
}

type DeepSeekProvider struct {
	APIKey string
	Model  string
}

func NewAIProvider(providerType string) (AIProvider, error) {
	cfg := config.Load()
	switch providerType {
	case "openai":
		apiKey := cfg.OPENAIAPIKEY
		if apiKey == "" {
			return nil, fmt.Errorf("OPENAI_API_KEY not set")
		}
		model := cfg.AIModel
		if model == "" {
			model = "gpt-4o"
		}
		return &OpenAIProvider{APIKey: apiKey, Model: model}, nil
	case "anthropic":
		apiKey := cfg.AnthropicAPIKey
		if apiKey == "" {
			return nil, fmt.Errorf("ANTHROPIC_API_KEY not set")
		}
		model := cfg.AIModel
		if model == "" {
			model = "claude-3-5-sonnet-20241022"
		}
		return &AnthropicProvider{APIKey: apiKey, Model: model}, nil
	case "gemini":
		apiKey := cfg.GEMINIAPIKEY
		if apiKey == "" {
			return nil, fmt.Errorf("GEMINI_API_KEY not set")
		}
		model := cfg.AIModel
		if model == "" {
			model = "gemini-2.5-flash"
		}
		return &GeminiProvider{APIKey: apiKey, Model: model}, nil
	case "deepseek":
		apiKey := os.Getenv("DEEPSEEK_API_KEY")
		if apiKey == "" {
			return nil, fmt.Errorf("DEEPSEEK_API_KEY not set")
		}
		model := cfg.AIModel
		if model == "" {
			model = "deepseek-chat"
		}
		return &DeepSeekProvider{APIKey: apiKey, Model: model}, nil
	default:
		return nil, fmt.Errorf("unknown provider: %s", providerType)
	}
}

const PortfolioSystemPrompt = `You are a Senior Portfolio Architect. Your output is consumed by a renderer that maps each section's componentId to a pre-built, fully responsive UI component.

Return ONLY valid JSON with this exact top-level shape:
{
  "metadata": { "version": "1.0", "niche": "...", "generatedAt": "ISO-8601" },
  "globalConfig": {
    "theme": "...",
    "colorPalette": { "primary": "#hex", "secondary": "#hex", "background": "#hex", "surface": "#hex", "text": "#hex", "heading": "#hex" },
    "typography": { "headingFont": "font-name", "bodyFont": "font-name", "monoFont": "font-name" }
  },
  "sections": [ { "id": "str", "type": "str", "componentId": "EXACT_ID", "content": {...}, "settings": { "isVisible": true, "padding": "medium" } } ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE COMPONENT LIBRARY (use ONLY these IDs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HEADERS (5):
  HEADER_MINIMALIST, HEADER_AGENCY_VIBRANT, HEADER_TECH_GLOW,
  HEADER_MINIMALIST_CREATOR, HEADER_DARK_SASS

HEROES (25):
  HERO_MODERN_SPLIT, HERO_CENTERED_MINIMAL, HERO_CYBER_MONO,
  HERO_VISUALIST, HERO_EXECUTIVE, HERO_GLASS_FLOATING, HERO_NEOBRUTALIST,
  HERO_MINIMAL_LEFT, HERO_STACKED_BOLD, HERO_GRID_LAYOUT, HERO_DYNAMIC_GRADIENT,
  HERO_MINIMAL_ELEGANCE, HERO_TERMINAL_STYLE, HERO_VIDEO_BG, HERO_MAGAZINE,
  HERO_PARALLAX_LAYERS, HERO_CIRCLE_AVATAR, HERO_SPLIT_DIAGONAL, HERO_GRADIENT_TEXT,
  HERO_CARD_STACK, HERO_SIDEBAR_LEFT, HERO_PHOTO_MOSAIC, HERO_GLITCH_TEXT,
  HERO_SMOOTH_SWEEP, HERO_GRID_PORTRAIT

ABOUT (15):
  ABOUT_NARRATIVE, ABOUT_STATS, ABOUT_IMAGE_WRAP, ABOUT_GLASS_DECONSTRUCTED,
  ABOUT_TIMELINE_PERSONAL, ABOUT_SPLIT_COLUMNS, ABOUT_QUOTE_FOCUS,
  ABOUT_VIDEO_INTRO, ABOUT_METRICS_FOCUS,
  ABOUT_BENTO_CREATIVE, ABOUT_DARK_SPLIT, ABOUT_MAGAZINE_STORY,
  ABOUT_CENTERED_CLEAN, ABOUT_CREATIVE_DIAGONAL, ABOUT_SKILLS_INLINE

SKILLS (36):
  SKILLS_MARQUEE, SKILLS_GRID_ICONS, SKILLS_PROGRESS_BARS, SKILLS_TAGS_CLOUD,
  SKILLS_HEXAGON_GRID, SKILLS_RADAR_CHART, SKILLS_DARK_SAAS, SKILLS_AGENCY,
  SKILLS_ENG_BENTO, SKILLS_ENG_TERMINAL, SKILLS_ENG_CIRCUIT,
  SKILLS_CREATIVE_MASONRY, SKILLS_CREATIVE_PALETTE, SKILLS_CREATIVE_CARDS,
  SKILLS_BIZ_CARDS, SKILLS_BIZ_LIST, SKILLS_BIZ_PIE,
  SKILLS_FIN_MATRIX, SKILLS_FIN_TICKER, SKILLS_FIN_CHART,
  SKILLS_MKT_FUNNEL, SKILLS_MKT_BUBBLES, SKILLS_MKT_CAROUSEL,
  SKILLS_AGC_NEOBRUTAL, SKILLS_AGC_GLASS, SKILLS_AGC_MINIMAL,
  SKILLS_CATEGORY_TABS, SKILLS_CARD_FLIP, SKILLS_NEON_GRID, SKILLS_WORD_CLOUD,
  SKILLS_ICON_SHOWCASE, SKILLS_MINIMAL_ROWS, SKILLS_DARK_BENTO,
  SKILLS_GAUGE_RINGS, SKILLS_FLOATING_PILLS, SKILLS_COMPACT_TAGS

PROJECTS (25):
  PROJ_BENTO_GRID, PROJ_MINIMAL_CARDS, PROJ_STACKED_LIST,
  PROJ_CAROUSEL_FULLSCREEN, PROJ_GITHUB_STYLE, PROJ_MASONRY, PROJ_CASE_STUDY,
  PROJ_THUMBNAIL_GRID, PROJ_FEATURED_SINGLE, PROJ_TIMELINE_VERTICAL,
  PROJ_3D_PERSPECTIVE, PROJ_LIST_PREVIEW, PROJ_OVERLAP_SLOTS,
  PROJ_ALTERNATING_ROWS, PROJ_SPOTLIGHT, PROJ_MAGAZINE_GRID,
  PROJ_NEON_CARDS, PROJ_GLASS_CARDS, PROJ_NUMBERED_SHOWCASE,
  PROJ_HORIZONTAL_CARDS, PROJ_COMPACT_GRID, PROJ_DARK_SHOWCASE,
  PROJ_AGENCY_CASE_STUDY, PROJ_SIDE_BY_SIDE_GRID, PROJ_FULLWIDTH_SCROLL

EXPERIENCE (17):
  EXP_TIMELINE_VERTICAL, EXP_ACCORDION_MINIMAL, EXP_CARDS_GRID,
  EXP_HORIZONTAL_SCROLL, EXP_TABS_SWITCH, EXP_SIDEBAR_LIST,
  EXP_GLASSMORPHIC, EXP_MAGAZINE, EXP_NUMBERED_LIST,
  EXP_BENTO_CARDS, EXP_FLOATING_TIMELINE, EXP_SPLIT_CONTENT,
  EXP_MINIMAL_CLEAN, EXP_AGENCY_BOLD, EXP_DARK_CARDS,
  EXP_CREATIVE_FLOW, EXP_COMPACT_ROWS

STATS (15):
  STATS_COUNTER_GRID, STATS_TIMELINE, STATS_CIRCULAR_PROGRESS,
  STATS_COMPARISON_TABLE, STATS_ACHIEVEMENT_BADGES, STATS_ANIMATED_COUNTERS,
  STATS_ICON_CARDS, STATS_MINIMAL_INLINE, STATS_LARGE_NUMBERS,
  STATS_BENTO_GRID, STATS_NEON_COUNTERS, STATS_HORIZONTAL_BARS,
  STATS_GLASS_CARDS, STATS_BOLD_ROWS, STATS_AGENCY_TICKER

TESTIMONIALS (10):
  TESTIMONIALS_BENTO, TESTIMONIALS_CAROUSEL, TESTIMONIALS_GRID_PHOTOS,
  TESTIMONIALS_QUOTE_WALL, TESTIMONIALS_MASONRY, TESTIMONIALS_DARK_GRID,
  TESTIMONIALS_FEATURED, TESTIMONIALS_COMPACT_LIST,
  TESTIMONIALS_SLIDER_CSS, TESTIMONIALS_NEON_CARDS

CONTACT (16):
  CONTACT_SPLIT, CONTACT_NEON_MODERN, CONTACT_SOCIAL_ONLY,
  CONTACT_CARD_SIMPLE, CONTACT_FORM_FULL, CONTACT_DARK_SASS,
  CONTACT_MINIMAL_SIMPLE, FORM_MINIMALIST, FORM_ELEGANT_SPLIT, FORM_TECH_AUDIT,
  CONTACT_BENTO, CONTACT_GLASSMORPHIC, CONTACT_DARK_MINIMAL,
  CONTACT_CREATIVE, CONTACT_FLOATING_CARD

FOOTERS (11):
  FOOTER_MINIMAL, FOOTER_SOCIAL_HEAVY, FOOTER_NEWSLETTER,
  FOOTER_MULTI_COLUMN, FOOTER_STICKY_CTA, FOOTER_DARK_DETAILED,
  FOOTER_SINGLE_LINE, FOOTER_BRAND_FOCUS, FOOTER_DARK_SASS,
  FOOTER_AGENCY_BOLD, FOOTER_MINIMAL_SIMPLE

CTA (7):
  CTA_HERO_INLINE, CTA_SPLIT_VISUAL, CTA_BANNER_STICKY,
  CTA_CENTERED_BOLD, CTA_CARD_HOVER, CTA_NEWSLETTER_INLINE, CTA_CONTACT_MINI

SERVICES (available):
  SERVICES_CARDS_INTERACTIVE, SERVICES_GLASS_BENTO, SERVICES_MINIMAL_LIST,
  SERVICES_AGENCY_GRID, SERVICES_LIST_MINIMAL

EDUCATION (5 — use for academic/education sections):
  EDUCATION_TIMELINE, EDUCATION_CARDS_GRID, EDUCATION_MINIMAL_LIST,
  EDUCATION_BENTO, EDUCATION_CREATIVE

AWARDS (3 — use for achievements/recognition sections):
  AWARDS_SHOWCASE, AWARDS_COMPACT_LIST, AWARDS_FEATURED

LOGOS (available): LOGOS_STRIP_CLEAN
PRICING (available): PRICING_MINIMAL_CARDS, PRICING_MODERN_TIERS
PROCESS (available): PROCESS_STEPS_VERTICAL
FAQ (available): FAQ_ACCORDION_NEON
GALLERY (available): GALLERY_MASONRY_GLASS
TEAM (available): TEAM_GRID_EDITORIAL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENT SCHEMAS — exact field names per type
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

header:       { "name": str, "navLinks": [{"label": str, "link": "#id"}], "cta": {"text": str, "link": "#id"} }
hero:         { "name": str, "title": str, "bio": str, "availability": str, "image": str, "resumeLink": str, "cta": {"text": str, "link": "#id"}, "socials": [{"platform": str, "url": str}] }
about:        { "title": str, "name": str, "bio": str, "image": str, "highlights": [str], "cta": {"text": str, "link": "#id"} }
skills:       { "title": str, "subtitle": str, "categories": [{"name": str, "items": [str]}] }
experience:   { "title": str, "subtitle": str, "items": [{"company": str, "position": str, "period": str, "description": str, "achievements": [str]}] }
projects:     { "title": str, "subtitle": str, "items": [{"title": str, "description": str, "technologies": [str], "link": str, "github": str, "image": str}] }
stats:        { "title": str, "items": [{"label": str, "value": str, "icon": str}] }
testimonials: { "title": str, "items": [{"text": str, "author": str, "role": str, "avatar": str}] }
services:     { "title": str, "subtitle": str, "items": [{"title": str, "description": str, "icon": str}] }
contact:      { "title": str, "subtitle": str, "email": str, "phone": str, "location": str, "socials": [{"platform": str, "url": str}], "cta": {"text": str} }
footer:       { "name": str, "tagline": str, "navLinks": [{"label": str, "link": "#id"}], "socials": [{"platform": str, "url": str}], "copyright": str }
education:    { "title": str, "items": [{"school": str, "degree": str, "year": str, "gpa": str, "honors": str}] }
awards:       { "title": str, "items": [{"name": str, "issuer": str, "year": str, "description": str}] }
certifications: { "title": str, "items": [{"name": str, "issuer": str, "year": str}] }
logos:        { "title": str, "items": [{"name": str, "logo": str}] }
pricing:      { "title": str, "subtitle": str, "tiers": [{"name": str, "price": str, "period": str, "features": [str], "cta": str, "highlighted": bool}] }
process:      { "title": str, "subtitle": str, "steps": [{"number": str, "title": str, "description": str}] }
faq:          { "title": str, "items": [{"question": str, "answer": str}] }
cta:          { "title": str, "subtitle": str, "cta": {"text": str, "link": "#id"} }
team:         { "title": str, "subtitle": str, "members": [{"name": str, "role": str, "bio": str, "image": str, "socials": [{"platform": str, "url": str}]}] }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCHEMA RULES (enforced — violations break rendering)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. "componentId" ONLY — never "component", "type_id", or any alias.
2. "content" ONLY — never "props", "data", or any alias.
3. Every section: { id, type, componentId, content, settings: { isVisible: true, padding: "medium" } }
4. projects.content.items → use "technologies" (string[]), never "tech" or "stack".
5. experience.content.items → always include "achievements" (string[]).
6. header navLinks "#link" values MUST match real section "id" values exactly.
7. colorPalette: all 6 fields required, all non-empty hex values.
8. componentId MUST be one of the exact IDs listed in the Component Library above.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCHITECTURE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION COUNT: 9-14 sections. Fewer is a failure for content-rich profiles.

REQUIRED SECTIONS (always present):
  • header (first) — use HEADER_*
  • hero (second) — use HERO_*
  • contact (second-to-last) — use CONTACT_*
  • footer (last) — use FOOTER_*

MIDDLE SECTIONS (select based on niche and available data):
  Engineering: stats → skills → projects → experience → [education if present]
  Creative: about → projects/gallery → skills → testimonials
  Business: stats → about → services → experience → testimonials
  Freelance/Agency: logos → services → projects → testimonials → process → pricing
  Academic: about → education → skills → projects → experience

DO NOT REPEAT component IDs — every section must use a different componentId.
VARIETY: Never use the same visual family twice (e.g. don't use both HERO_MODERN_SPLIT and HERO_CENTERED_MINIMAL).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENT MAPPING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Map profile data to section content with these exact bindings:
  hero.content.name          ← profile.name
  hero.content.title         ← profile.title
  hero.content.bio           ← profile.summary
  hero.content.availability  ← profile.availability
  hero.content.socials       ← profile.socials
  skills.content.categories  ← profile.skills (each {category, items})
  experience.content.items   ← profile.experiences (map achievements array)
  projects.content.items     ← profile.projects (map tech → technologies)
  stats.content.items        ← profile.stats
  contact.content.email      ← profile.email
  contact.content.phone      ← profile.phone
  contact.content.location   ← profile.location
  contact.content.socials    ← profile.socials
  footer.content.name        ← profile.name
  footer.content.socials     ← profile.socials
  education.content.items    ← profile.education
  awards.content.items       ← profile.certifications (or awards if present)

NEVER invent companies, degrees, metrics, or links not in the profile.
If a field is absent, use a professional default string — never empty "".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

globalConfig.colorPalette requirements:
  • primary: a vivid accent color matching the design mission
  • secondary: complementary accent (not identical to primary)
  • background: clean page background (white, near-white, or deep dark)
  • surface: card/panel background (slightly offset from background)
  • text: body text (high contrast on background)
  • heading: heading text (can match or slightly differ from text)

globalConfig.typography — always specify real Google Font names:
  Recommended pairings:
    Tech/Dev → headingFont: "JetBrains Mono", bodyFont: "Inter", monoFont: "Fira Code"
    Creative → headingFont: "Playfair Display", bodyFont: "Outfit", monoFont: "IBM Plex Mono"
    Business → headingFont: "Fraunces", bodyFont: "Inter", monoFont: "IBM Plex Mono"
    Minimal → headingFont: "DM Serif Display", bodyFont: "DM Sans", monoFont: "Fira Code"
    Bold/Agency → headingFont: "Syne", bodyFont: "Manrope", monoFont: "Source Code Pro"

OUTPUT: Return only the JSON object. No markdown. No explanation.`
const EditSystemPrompt = `You are a Senior Portfolio Architect. Modify the provided Portfolio Manifest JSON based on the user instruction.

STRICT SCHEMA ENFORCEMENT:
1. ALWAYS use "componentId", NEVER "component".
2. ALWAYS use "content", NEVER "props" or "data" for section data.
3. Keep the Manifest V1.0 structure: metadata, globalConfig, and sections[].
4. Return ONLY valid JSON. No markdown. No explanations.
5. projects.content.items must use "technologies" (array), experience.content.items must use "achievements" (array).

CONTENT SCHEMA — preserve these exact field names when editing:
hero: { name, title, bio, availability, image, resumeLink, cta:{text,link}, socials:[{platform,url}] }
skills: { title, subtitle, categories:[{name, items:[str]}] }
experience: { title, subtitle, items:[{company,position,period,description,achievements:[str]}] }
projects: { title, subtitle, items:[{title,description,technologies:[str],link,github,image}] }
stats: { title, items:[{label,value,icon}] }
contact: { title, subtitle, email, phone, location, socials:[{platform,url}], cta:{text} }
footer: { name, tagline, navLinks:[{label,link}], socials:[{platform,url}], copyright }

CONTENT FIDELITY:
- Preserve ALL existing user content unless the instruction explicitly requests a change.
- Never replace user-provided text (bio, project descriptions, company names) with generic placeholders during UI or layout edits.
- If the instruction is visual/structural only, keep every content field identical.

Input: current Manifest JSON + user instruction.
Output: the complete updated Manifest JSON.`

func (p *OpenAIProvider) Generate(prompt string, systemPrompt string, onChunk func(string)) (string, error) {
	url := "https://api.openai.com/v1/chat/completions"
	systemPromptToUse := systemPrompt
	if systemPromptToUse == "" {
		systemPromptToUse = PortfolioSystemPrompt
	}
	messages := []map[string]string{
		{"role": "system", "content": systemPromptToUse},
		{"role": "user", "content": prompt},
	}
	body := map[string]interface{}{
		"model":           p.Model,
		"messages":        messages,
		"stream":          true,
		"response_format": map[string]string{"type": "json_object"},
	}
	jsonBody, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.APIKey)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	var fullResponse string
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			if data == "[DONE]" {
				break
			}
			var result map[string]interface{}
			json.Unmarshal([]byte(data), &result)
			if choices, ok := result["choices"].([]interface{}); ok && len(choices) > 0 {
				if choice, ok := choices[0].(map[string]interface{}); ok {
					if delta, ok := choice["delta"].(map[string]interface{}); ok {
						if content, ok := delta["content"].(string); ok {
							fullResponse += content
							if onChunk != nil {
								onChunk(content)
							}
						}
					}
				}
			}
		}
	}
	return fullResponse, nil
}

func (p *OpenAIProvider) GenerateStructured(prompt string, schema interface{}) (interface{}, error) {
	return nil, fmt.Errorf("not implemented")
}

func (p *AnthropicProvider) Generate(prompt string, systemPrompt string, onChunk func(string)) (string, error) {
	url := "https://api.anthropic.com/v1/messages"
	systemPromptToUse := systemPrompt
	if systemPromptToUse == "" {
		systemPromptToUse = PortfolioSystemPrompt
	}
	body := map[string]interface{}{
		"model":      p.Model,
		"max_tokens": 4096,
		"system":     systemPromptToUse,
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"stream": true,
	}
	jsonBody, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", p.APIKey)
	req.Header.Set("anthropic-version", "2023-06-01")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	var fullResponse string
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			var result map[string]interface{}
			json.Unmarshal([]byte(data), &result)
			if typ, ok := result["type"].(string); ok && typ == "content_block_delta" {
				if delta, ok := result["delta"].(map[string]interface{}); ok {
					if text, ok := delta["text"].(string); ok {
						fullResponse += text
						if onChunk != nil {
							onChunk(text)
						}
					}
				}
			}
		}
	}
	return fullResponse, nil
}

func (p *AnthropicProvider) GenerateStructured(prompt string, schema interface{}) (interface{}, error) {
	return nil, fmt.Errorf("not implemented")
}

func (p *GeminiProvider) Generate(prompt string, systemPrompt string, onChunk func(string)) (string, error) {
	// Use generateContent instead of streamGenerateContent for simplicity and reliability if streaming logic is complex
	// Alternatively, properly parse the stream. Let's try to use non-streaming first to ensure correctness.
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", p.Model, p.APIKey)

	systemPromptToUse := systemPrompt
	if systemPromptToUse == "" {
		systemPromptToUse = PortfolioSystemPrompt
	}

	body := map[string]interface{}{
		"system_instruction": map[string]interface{}{
			"parts": []map[string]interface{}{
				{"text": systemPromptToUse},
			},
		},
		"contents": []map[string]interface{}{
			{
				"role": "user",
				"parts": []map[string]interface{}{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"temperature":        0.7,
			"topK":               40,
			"topP":               0.95,
			"maxOutputTokens":    16384,
			"response_mime_type": "application/json",
		},
	}

	jsonBody, _ := json.Marshal(body)
	client := &http.Client{
		Timeout: 2 * time.Minute,
	}
	var resp *http.Response
	var err error
	backoffs := []time.Duration{0, 800 * time.Millisecond, 1600 * time.Millisecond}
	for attempt := 0; attempt < len(backoffs); attempt++ {
		if backoffs[attempt] > 0 {
			time.Sleep(backoffs[attempt])
		}
		resp, err = client.Post(url, "application/json", bytes.NewBuffer(jsonBody))
		if err != nil {
			if shouldRetryGeminiTransport(err) && attempt < len(backoffs)-1 {
				log.Printf("[Gemini] transient transport error (attempt %d/%d): %v", attempt+1, len(backoffs), err)
				continue
			}
			return "", err
		}

		if resp.StatusCode == http.StatusTooManyRequests || resp.StatusCode >= 500 {
			if attempt < len(backoffs)-1 {
				log.Printf("[Gemini] transient status %d (attempt %d/%d), retrying", resp.StatusCode, attempt+1, len(backoffs))
				resp.Body.Close()
				resp = nil
				continue
			}
		}
		break
	}
	if resp == nil {
		return "", fmt.Errorf("gemini request failed after retries")
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		log.Printf("[Gemini] API Error! Status: %d, Body: %s", resp.StatusCode, string(responseBody))
		return "", fmt.Errorf("gemini api error (status %d): %s", resp.StatusCode, string(responseBody))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(responseBody, &result); err != nil {
		log.Printf("[Gemini] JSON Parse Error: %v, Body: %s", err, string(responseBody))
		return "", fmt.Errorf("failed to parse gemini response: %v", err)
	}
	log.Printf("[Gemini] Successfully received response candidates: %d", len(result["candidates"].([]interface{})))

	candidates, ok := result["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return "", fmt.Errorf("no candidates returned from gemini")
	}

	candidate, ok := candidates[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid candidate format")
	}

	finishReason, _ := candidate["finishReason"].(string)
	log.Printf("[Gemini] Generated response finishReason: %s", finishReason)

	content, ok := candidate["content"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid content format")
	}

	parts, ok := content["parts"].([]interface{})
	if !ok || len(parts) == 0 {
		return "", fmt.Errorf("no parts in gemini response")
	}

	part, ok := parts[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid part format")
	}

	text, ok := part["text"].(string)
	if !ok {
		return "", fmt.Errorf("text not found in gemini response")
	}

	if onChunk != nil {
		onChunk(text)
	}

	return text, nil
}

func shouldRetryGeminiTransport(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	if strings.Contains(msg, "no such host") || strings.Contains(msg, "temporary failure in name resolution") {
		return true
	}

	var dnsErr *net.DNSError
	if errors.As(err, &dnsErr) {
		return true
	}
	var netErr net.Error
	if errors.As(err, &netErr) {
		return netErr.Timeout() || netErr.Temporary()
	}
	return false
}

func (p *GeminiProvider) GenerateStructured(prompt string, schema interface{}) (interface{}, error) {
	return nil, fmt.Errorf("not implemented")
}

func (p *DeepSeekProvider) Generate(prompt string, systemPrompt string, onChunk func(string)) (string, error) {
	url := "https://api.deepseek.com/v1/chat/completions"
	messages := []map[string]string{
		{"role": "system", "content": PortfolioSystemPrompt},
		{"role": "user", "content": prompt},
	}
	body := map[string]interface{}{
		"model":           p.Model,
		"messages":        messages,
		"stream":          true,
		"response_format": map[string]string{"type": "json_object"},
	}
	jsonBody, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.APIKey)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	var fullResponse string
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			if data == "[DONE]" {
				break
			}
			var result map[string]interface{}
			json.Unmarshal([]byte(data), &result)
			if choices, ok := result["choices"].([]interface{}); ok && len(choices) > 0 {
				if choice, ok := choices[0].(map[string]interface{}); ok {
					if delta, ok := choice["delta"].(map[string]interface{}); ok {
						if content, ok := delta["content"].(string); ok {
							fullResponse += content
							if onChunk != nil {
								onChunk(content)
							}
						}
					}
				}
			}
		}
	}
	return fullResponse, nil
}

func (p *DeepSeekProvider) GenerateStructured(prompt string, schema interface{}) (interface{}, error) {
	return nil, fmt.Errorf("not implemented")
}
