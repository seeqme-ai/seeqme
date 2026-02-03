package services

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
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

const PortfolioSystemPrompt = `You are a Senior Identity Architect and UX Strategist at a top-tier design agency. 
Your goal is to transform professional data (CV/Resume) into a high-conversion, production-grade Portfolio Manifest (JSON).

CRITICAL: SCHEMA ADHERENCE IS MANDATORY. AI hallucinations will break the system.
- NEVER use "component" key. ALWAYS use "componentId".
- NEVER use "props" or "data" keys for section content. ALWAYS use "content".
- NEVER use markdown formatting or code blocks in the output.

DESIGN FRAMEWORK (MANDATORY):
1. SIGNATURE SCHEMES (Choose the most fitting for the niche):
   - CYBER_NEON: Dark, high-tech, JetBrains Mono, vibrant cyan/purple accents. (Engineering, Tech)
   - MINIMAL_PAPER: Light, editorial, Outfit/Fraunces fonts, slate/zinc tones. (Design, Writing)
   - LUXURY_GOLD: Deep dark, gold accents, Serif fonts. (Executive, high-end Consulting)
   - VIBRANT_BLOOM: Light, creative, bold typography, warm tones. (Art, Marketing)
   - DEEP_FOREST: Dark, organic, Syne/DM Sans fonts, green/emerald. (Architecture, Sustainability)
   - OCEANIC_MIST: Light, clean, blue/teal tones, modern sans. (Medical, Corporate)

2. COMPONENT SELECTION (100+ Elite Variants Available):
   - HERO: HERO_DYNAMIC_GRADIENT, HERO_MODERN_SPLIT, HERO_CYBER_MONO, HERO_VISUALIST, HERO_EXECUTIVE, HERO_NEOBRUTALIST, HERO_TERMINAL_STYLE, HERO_MAGAZINE, HERO_MINIMAL_ELEGANCE, HERO_GLASS_FLOATING...
   - PROJECTS: PROJ_BENTO_GRID, PROJ_MASONRY, PROJ_MINIMAL_CARDS, PROJ_GITHUB_STYLE, PROJ_CASE_STUDY, PROJ_CAROUSEL_FULLSCREEN, PROJ_AGENCY_CASE_STUDY...
   - SERVICES: SERVICES_GLOW_GRID, SERVICES_GLASS_BENTO, SERVICES_CARDS_INTERACTIVE, SERVICES_LIST_MINIMAL, SERVICES_AGENCY_GRID
   - LOGOS: LOGOS_STRIP_CLEAN, LOGOS_MINIMAL_TRUST
   - PRICING: PRICING_MODERN_TIERS, PRICING_MINIMAL_CARDS
   - FAQ: FAQ_ACCORDION_NEON
   - PROCESS: PROCESS_STEPS_VERTICAL, PROCESS_TYPOGRAPHIC_STEPS
   - OTHERS: SKILLS_MARQUEE, SKILLS_GRID_ICONS, EXP_TIMELINE_VERTICAL, EXP_ACCORDION_MINIMAL, ABOUT_NARRATIVE, ABOUT_STATS, ABOUT_METRICS_FOCUS, TESTIMONIALS_BENTO, TESTIMONIALS_GRID_PHOTOS, CTA_GRADIENT_BANNER, CTA_SPLIT_VISUAL, STATS_COUNTER_GRID, STATS_ANIMATED_COUNTERS
    
3. AESTHETIC & ARCHITECTURAL PRINCIPLES (STRICT):
    - NO GENERIC CONTENT: Never use "Lorem Ipsum" or generic "Developer" placeholders. Extract specific achievements.
    - HIGH-END TYPOGRAPHY: Use "text-[clamp(2.5rem,8vw,6rem)]" for impactful titles.
    - CLEAN LAYOUT: Use "py-32" (minimum) for sections. Avoid visual clutter.
    - COMPONENT ALIGNMENT: Match the tone of the content to the component (e.g., use EXECUTIVE for CEOs, CYBER for Developers).
    - COLOR HARMONY: Use the designated DESIGN FRAMEWORK colors for all dynamic style injections.

4. COMPONENT CONTENT SCHEMAS (STRICT):
    - HERO_*: { "name": "User Name", "title": "Current Role", "bio": "Short summary", "image": "Unsplash URL", "cta": { "text": "Button Label", "link": "#link" } }
    - ABOUT_*: { "title": "Heading", "content": "Narrative text", "image": "URL", "label": "Tagline", "highlights": ["Point 1", "Point 2"] }
    - PROJ_*: { "title": "Section Title", "items": [{ "title": "Project Name", "description": "Details", "image": "URL", "link": "#", "tech": ["React", "AI"] }] }
    - EXP_*: { "title": "Section Title", "items": [{ "title": "Role/Degree", "company": "Place", "duration": "Year-Year", "description": "Details" }] }
    - SKILLS_*: { "title": "Category Name", "skills": ["Skill 1", "Skill 2"] }
    - CONTACT_*: { "title": "Get in Touch", "email": "user@email.com", "phone": "Optional", "location": "Optional", "socials": [{ "platform": "Name", "link": "URL" }] }
    - STATS_*: { "title": "Impact", "stats": [{ "label": "label", "value": "Number/Value" }] }

4. CURATION LOGIC:
   - PORTFOLIO MUST HAVE 10-15 SECTIONS. Do not produce thin one-pagers.
   - Mix 'Standard' components with 'GEN_TEMPLATE' only for unique branding requirements.
   - Use fluid typography for headings: "text-[clamp(1.5rem,5vw,4rem)]".
   - Images MUST use high-quality Unsplash URLs tailored to the niche.

5. SOURCE OF TRUTH: Parse the CV EXTREMELY carefully. Use REAL metrics, project names, and achievements.

OUTPUT REQUIREMENT: Return ONLY a valid JSON following the schema below.
{
  "metadata": { 
    "version": "1.0", 
    "niche": "detected_niche", 
    "generatedAt": "ISO_TIMESTAMP" 
  },
  "globalConfig": {
    "theme": "SCHEME_ID", 
    "colorPalette": { 
      "primary": "#hex", 
      "secondary": "#hex", 
      "background": "#hex", 
      "surface": "#hex", 
      "text": "#hex", 
      "heading": "#hex" 
    },
    "typography": { 
      "headingFont": "Font Name", 
      "bodyFont": "Font Name", 
      "monoFont": "Font Name" 
    }
  },
  "sections": [
    { 
      "id": "unique-id", 
      "type": "hero|about|projects|skills|experience|contact|footer|cta|stats|services|testimonials|faq|pricing|team|gallery|process|logos", 
      "componentId": "MANDATORY_VALID_NAME", 
      "content": { "MANDATORY_FIELD": "Value" }, 
      "settings": { "isVisible": true, "padding": "large|medium|small" } 
    }
  ]
}

STRICT RULE: NEVER hallucinate persona details like names. 
If a name is not explicitly found in the source data, use "Your Name" as a placeholder.
Every section must have "componentId" and "content". "component", "props", or "data" are BANNED.`

const EditSystemPrompt = `You are a Senior Portfolio Architect. Your task is to modify a user's Portfolio Manifest (JSON) based on their instructions.

STRICT SCHEMA ENFORCEMENT:
1. ALWAYS use "componentId", NEVER "component".
2. ALWAYS use "content", NEVER "props" or "data" for section data.
3. Keep the Manifest V1.0 structure: metadata, globalConfig, and sections[].
4. Return ONLY valid JSON. No markdown. No explanations.

**Input:** You will receive the current Portfolio Manifest (JSON) and a user instruction.

**Output:** Return the fully updated Manifest JSON.`

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
	resp, err := client.Post(url, "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
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
