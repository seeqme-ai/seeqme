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

const PortfolioSystemPrompt = `You are a Senior Portfolio Architect.
Return ONLY valid JSON for a Manifest with this exact top-level shape:
{
  "metadata": { "version": "1.0", "niche": "...", "generatedAt": "ISO-8601" },
  "globalConfig": {
    "theme": "...",
    "colorPalette": { "primary": "...", "secondary": "...", "background": "...", "surface": "...", "text": "...", "heading": "..." },
    "typography": { "headingFont": "...", "bodyFont": "...", "monoFont": "..." }
  },
  "sections": [ ... ]
}

STRICT SCHEMA RULES:
1. Use "componentId" (never "component").
2. Use "content" (never "props" or "data").
3. Every section must include: id, type, componentId, content, settings.
4. settings must include: isVisible (boolean), padding ("small" | "medium" | "large").
5. Header navLinks must target real section ids (for example "#projects" must map to section id "projects").

ARCHITECTURE QUALITY RULES:
1. Build complete, rich structures using registry components across categories:
   header, hero, stats/about, skills, projects, experience, testimonials or logos, contact, footer.
2. Prefer 8-14 sections when source content supports it; avoid thin outputs.
3. Mix patterns from template blueprints creatively; do not clone one template order verbatim.
4. Ensure mobile-ready navigation by using a header component with a working mobile menu pattern.
5. Keep contact and footer near the end.

CONTENT RULES:
1. Use provided CV/prompt data as source of truth.
2. Do not invent employers, degrees, or metrics.
3. If a field is missing, use safe professional defaults (not empty strings).
4. Keep project/experience text concise and readable.

THEME RULES:
1. globalConfig must always be populated with non-empty values.
2. Never output empty strings for colorPalette or typography.
3. Keep palette coherent and accessible.

OUTPUT RULE:
Return only JSON. No markdown, no explanations.`
const EditSystemPrompt = `You are a Senior Portfolio Architect. Your task is to modify a user's Portfolio Manifest (JSON) based on their instructions.

STRICT SCHEMA ENFORCEMENT:
1. ALWAYS use "componentId", NEVER "component".
2. ALWAYS use "content", NEVER "props" or "data" for section data.
3. Keep the Manifest V1.0 structure: metadata, globalConfig, and sections[].
4. Return ONLY valid JSON. No markdown. No explanations.

CONTENT FIDELITY:
- Preserve all existing user content UNLESS the instruction explicitly asks to change it.
- Never reset text fields to generic placeholders during a UI refinement.
- If a user has provided custom project descriptions, bio, or contact info, keep them exactly as they are in the updated Manifest.

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
