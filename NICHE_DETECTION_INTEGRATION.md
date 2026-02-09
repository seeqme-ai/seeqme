# Niche Detection Integration Flow

## Data Flow Diagram

```
┌─────────────────────────────────────┐
│  User Uploads CV                    │
│  (PDF/DOCX/TXT)                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Backend Extracts CV Content        │
│  (cv_handlers.go)                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  AUTO-DETECT NICHE                  │
│  services.DetectNiche(cvContent)    │
│                                      │
│  Scans for keywords:                │
│  - Engineering: Python, React, AWS  │
│  - Creative: Design, Figma, Adobe   │
│  - Business: CEO, Strategy, P&L     │
│  - Finance: CPA, Accounting, Trading│
│  - Medical: MD, Healthcare, Nurse   │
│  - Sales: Quota, Pipeline, Territory│
│  - Marketing: Campaign, Growth, SEO │
│  - Agency: Freelancer, Client work  │
│  - Academic: Student, Degree, GPA   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  GET NICHE BLUEPRINT                │
│  services.GetNicheBlueprint(niche)  │
│                                      │
│  Returns architecture guidance:     │
│  - Section Flow                     │
│  - Component Recommendations        │
│  - Color Scheme                     │
│  - Typography                       │
│  - Content Focus                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ENHANCE AI PROMPT                  │
│  with niche + blueprint             │
│                                      │
│  Before: Generic prompt             │
│  After: Specialized guidance        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  AI GENERATES PORTFOLIO             │
│  (OpenAI/Claude/Gemini)             │
│                                      │
│  Uses niche-specific:               │
│  ✓ Components                       │
│  ✓ Colors                           │
│  ✓ Typography                       │
│  ✓ Section Flow                     │
│  ✓ Content Emphasis                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  SAVE TO DATABASE                   │
│  portfolios collection              │
│                                      │
│  Stores:                            │
│  - structuredContent (Manifest)     │
│  - niche (detected)                 │
│  - theme                            │
│  - other metadata                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  RENDER PORTFOLIO                   │
│  (Frontend)                         │
│                                      │
│  Different architecture for:        │
│  - Engineer vs Designer             │
│  - Executive vs Student             │
│  - Agency vs Full-time              │
└─────────────────────────────────────┘
```

## Code Integration Points

### 1. AI Handler (`ai.go` - Line ~198)
```go
// AUTO-DETECT NICHE from CV content if not explicitly provided
detectedNiche := req.Niche
if detectedNiche == "" && len(promptWithFiles) > 0 {
    detectedNiche = services.DetectNiche(promptWithFiles)
    streamLog(fmt.Sprintf("Niche auto-detected: %s", detectedNiche), "info")
}

// Get blueprint and add to prompt
if detectedNiche != "" {
    blueprint := services.GetNicheBlueprint(detectedNiche)
    promptWithFiles += fmt.Sprintf("\n\n%s", blueprint)
}
```

### 2. Niche Detector Service (`niche_detector.go`)
```go
// Main detection function - analyzes CV text
func DetectNiche(cvContent string) string {
    // Keyword scoring for each niche
    // Returns detected niche (e.g., "Engineering", "Creative", etc.)
}

// Blueprint provider - gives AI detailed guidance
func GetNicheBlueprint(niche string) string {
    // Returns architecture recommendations
    // E.g., section flow, component suggestions, color scheme
}
```

### 3. Database Storage (`ai.go` - Line ~277)
```go
// Save detected niche in portfolio record
nicheToSave := detectedNiche
if nicheToSave != "" {
    portfolioDoc["niche"] = nicheToSave
}
```

## Example Execution Path for Software Engineer

```
Input CV:
├─ Title: "Senior Software Engineer"
├─ Skills: Python, JavaScript, React, AWS, Docker, Kubernetes
├─ Experience: Full Stack Development, Cloud Architecture
├─ Projects: Built microservices, deployed to AWS

Detection Flow:
Step 1: Scan for keywords
  ✓ "Software Engineer" → +1 Engineering score
  ✓ "Python" → +2 Engineering score
  ✓ "JavaScript" → +2 Engineering score
  ✓ "React" → +2 Engineering score
  ✓ "AWS" → +2 Engineering score
  ✓ "Docker" → +2 Engineering score
  ✓ "Kubernetes" → +2 Engineering score
  ✓ "Full Stack" → +2 Engineering score
  
  Total Engineering Score: 15 (HIGHEST)
  
Step 2: Detect niche → "Engineering"

Step 3: Get blueprint → Engineering-specific architecture

Blueprint Applied:
├─ Hero: HERO_CYBER_MONO (dark, technical)
├─ Color: CYBER_NEON (dark with cyan/purple)
├─ Typography: JetBrains Mono for code
├─ Section Flow: HERO → STATS → SKILLS → PROJECTS → EXPERIENCE → CONTACT
├─ Projects: PROJ_GITHUB_STYLE (code-focused showcase)
├─ Skills: SKILLS_GRID_ICONS (technical skill tags)

Result:
  Portfolio now showcases:
  ✓ Technical achievements prominently
  ✓ Tech stack visibility
  ✓ Code project demonstrations
  ✓ Dark, technical aesthetic
```

## Example Execution Path for Designer

```
Input CV:
├─ Title: "UX/UI Designer"
├─ Skills: Figma, Adobe Suite, Web Design, Typography
├─ Experience: Product Design, Branding
├─ Portfolio: Visual design work

Detection Flow:
Step 1: Scan for keywords
  ✓ "Designer" → +2 Creative score
  ✓ "Figma" → +2 Creative score
  ✓ "Adobe" → +2 Creative score
  ✓ "Web Design" → +2 Creative score
  ✓ "Typography" → +2 Creative score
  ✓ "Branding" → +2 Creative score
  
  Total Creative Score: 12 (HIGHEST)
  
Step 2: Detect niche → "Creative"

Step 3: Get blueprint → Creative-specific architecture

Blueprint Applied:
├─ Hero: HERO_VISUALIST (strong imagery focus)
├─ Color: VIBRANT_BLOOM (creative, bold colors)
├─ Typography: Playfair Display for impact
├─ Section Flow: HERO → ABOUT → PROJECTS/GALLERY → TESTIMONIALS → CONTACT
├─ Projects: GALLERY_MASONRY_GLASS (visual showcase)
├─ Skills: SKILLS_TAGS_CLOUD (design skill tags)

Result:
  Portfolio now showcases:
  ✓ Visual work prominence
  ✓ Gallery/masonry layouts
  ✓ Imagery and composition
  ✓ Creative, bold aesthetic
```

## Benefits

1. **Automatic** - No manual niche selection needed
2. **Accurate** - Keyword-based detection from actual CV content
3. **Specialized** - Each niche gets tailored architecture
4. **Flexible** - Fallback to defaults if detection uncertain
5. **Persistent** - Detected niche saved for future regenerations
6. **Extensible** - Easy to add new niches or keywords
