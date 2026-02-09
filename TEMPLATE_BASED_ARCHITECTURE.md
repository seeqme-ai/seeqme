# Template-Based AI Architecture System

## Overview

Instead of the AI generating random component architectures, it now uses your **17+ proven templates** as the primary architectural basis. This ensures:

- ✅ **Consistency** - All portfolios follow proven template patterns
- ✅ **Quality** - Architectures are based on tested, successful designs
- ✅ **Niche-Appropriate** - Each niche gets templates-derived architectures
- ✅ **Professional** - No more random component mixing

## How It Works

### 1. Template Blueprint Extraction

When CV is uploaded, the system:
1. **Detects niche** from CV keywords (Engineering, Creative, Business, etc.)
2. **Loads template blueprints** for that niche
3. **Extracts architectural patterns** from templates:
   - Section ordering (Header → Hero → Projects → etc.)
   - Component types used
   - Color schemes
   - Typography choices
4. **Injects guidance** into AI prompt

### 2. Template-Based AI Generation

The AI prompt now includes:

```
🎨 TEMPLATE-BASED ARCHITECTURE (PRIMARY GUIDE):
You have access to 17+ proven portfolio templates with specific block patterns for each niche.
Your generated manifest MUST follow these proven architectural patterns, NOT random component selection.

CRITICAL RULES:
1. Analyze the provided template blueprints - these are your architectural reference
2. Generate manifests that follow similar section flows and patterns
3. Use template color schemes and typography as baseline
4. Match the niche-specific block ordering
5. Apply template patterns to ensure consistency and professional quality
```

### 3. Niche-Specific Architecture Guidance

Each niche receives detailed guidance based on analyzed templates:

#### Engineering/Tech
```
PROVEN SECTION ORDERING:
1. HEADER - Navigation
2. HERO - Technical introduction (HERO_CYBER_MONO, HERO_DARK_SASS)
3. STATS - Key metrics/achievements
4. SKILLS - Technical stack (SKILLS_GRID_ICONS, SKILLS_DARK_SASS)
5. PROJECTS - Showcase work (PROJ_GITHUB_STYLE, PROJ_BENTO_GRID)
6. EXPERIENCE - Work history (EXP_TIMELINE_VERTICAL)
7-10. OPTIONAL
11. CONTACT - CTA
12. FOOTER

COLOR SCHEME: CYBER_NEON (dark, cyan/purple)
TYPOGRAPHY: JetBrains Mono (code), Space Grotesk (headings), Inter (body)
```

#### Creative/Design/Photography
```
PROVEN SECTION ORDERING:
1. HEADER - Minimalist navigation
2. HERO - Bold visual (HERO_VISUALIST, GALLERY_MASONRY_GLASS)
3. ABOUT - Artist philosophy
4. PROJECTS/GALLERY - Visual work (PROJ_MASONRY, GALLERY_MASONRY_GLASS)
5. TESTIMONIALS - Client quotes
6-9. OPTIONAL
10. CONTACT - Social CTA
11. FOOTER

COLOR SCHEME: VIBRANT_BLOOM or MINIMAL_PAPER
TYPOGRAPHY: Playfair Display (headings), Inter (body)
CRITICAL: High-quality imagery, minimize text, maximize visuals
```

#### Business/Executive
```
PROVEN SECTION ORDERING:
1. HEADER - Professional nav
2. HERO - Executive presence (HERO_EXECUTIVE with professional photo)
3. STATS - Business metrics (STATS_COUNTER_GRID)
4. ABOUT - Executive biography
5. SERVICES - Service offerings (SERVICES_AGENCY_GRID)
6. EXPERIENCE - Career (EXP_CARDS_GRID)
7. TESTIMONIALS - Client success
8-10. OPTIONAL
11. CONTACT - Lead capture
12. FOOTER

COLOR SCHEME: LUXURY_GOLD or OCEANIC_MIST
TYPOGRAPHY: Lora (headings), Inter (body)
```

#### Other Niches
Similar detailed guidance provided for:
- Finance/Analyst
- Medical/Healthcare
- Sales
- Marketing
- Agency/Freelancer
- Student/Academic

---

## Implementation Details

### Files Involved

1. **Backend Services**
   - `backend/internal/services/template_blueprint.go` - Template extraction and blueprint generation
   - `backend/internal/services/niche_detector.go` - Niche detection + manifest guidance
   - `backend/internal/services/ai_provider.go` - Updated with template guidance in prompt
   - `backend/internal/handlers/ai.go` - Loads blueprints and injects guidance

2. **Template Files** (your existing 17+ templates)
   - `/templates/creative/index.ts`
   - `/templates/engineering/index.ts`
   - `/templates/executive/index.ts`
   - `/templates/additional/index.ts`
   - `/templates/modern/*` (minimalist, dark_sass, 3d_designer, agency_vysion, etc.)

### Data Flow

```
User Uploads CV
    ↓
Backend CV Extraction
    ↓
Niche Auto-Detection (keyword scanning)
    ↓
Load Template Blueprints for Niche
    ↓
Extract Architecture Patterns (section ordering, components, colors)
    ↓
Generate Manifest Guidance from Templates
    ↓
Inject Guidance into AI Prompt
    ↓
AI Generation (follows template patterns)
    ↓
Portfolio Created (template-based architecture)
    ↓
Render to HTML/CSS
```

---

## Benefits

### 1. Consistency
All portfolios in same niche follow proven architectural patterns.

### 2. Quality Assurance
Blueprints are extracted from your best-performing 17+ templates.

### 3. Niche Appropriateness
Each industry gets specialized architecture (not generic).

### 4. Professional Output
AI creates unique designs while respecting template wisdom.

### 5. Faster Generation
AI has clear architectural guidance, reduces hallucinations.

### 6. Maintainability
Update templates → all future portfolios use new patterns.

---

## Niche-Specific Architectures

### Engineering/Tech
- **Hero**: Dark, technical, code-focused
- **Projects**: GitHub-style, bento grids
- **Skills**: Icon grids, tech tags
- **Experience**: Timeline with technical milestones
- **Color**: Cyan/Purple (CYBER_NEON)
- **Typography**: JetBrains Mono, Space Grotesk

### Creative/Design
- **Hero**: Large visual, magazine-style
- **Projects**: Masonry galleries, fullscreen carousel
- **Focus**: Imagery over text
- **Testimonials**: Client work examples
- **Color**: Vibrant or minimal
- **Typography**: Playfair Display, artistic fonts

### Business/Executive
- **Hero**: Professional photo, credentials
- **Stats**: Prominent metrics, impact
- **Services**: Clear service offerings
- **Testimonials**: Client success stories
- **Color**: Gold/Blue (professional)
- **Typography**: Serif (traditional trust)

### Finance
- **Stats**: Large numbers, financial metrics
- **About**: Certifications (CPA, CFA)
- **Services**: Financial services offered
- **Color**: Professional blue with green accents
- **Typography**: Data-focused sans-serif

### Medical/Healthcare
- **Credentials**: Licenses, board certification
- **Specialties**: Medical focus areas
- **Testimonials**: Patient/colleague quotes
- **Color**: Medical blue (trust)
- **Typography**: Clear, professional

### Sales
- **Stats**: Quota, revenue, deal size
- **Testimonials**: Client/manager quotes
- **Energy**: Bold, dynamic colors
- **Color**: Bold, vibrant
- **Typography**: Impact-focused

### Marketing
- **Stats**: Campaign metrics, ROI, engagement
- **Projects**: Campaign case studies
- **Focus**: Performance metrics
- **Color**: Bold marketing colors
- **Typography**: Modern, bold

### Agency/Freelancer
- **Logos**: Client roster prominently
- **Projects**: Case studies with results
- **Process**: Workflow/methodology
- **Testimonials**: Extensive client feedback
- **Color**: Bold brand colors
- **Typography**: Distinctive, memorable

### Student/Academic
- **Education**: Degree, GPA, honors
- **Projects**: Academic and personal projects
- **Internships**: Part-time work, internships
- **Color**: Clean, minimal
- **Typography**: Modern, approachable

---

## Template Analysis

Each of your 17+ templates is automatically analyzed to extract:

```typescript
interface TemplateBlueprint {
  templateId: string;
  niche: string;
  blockPattern: [
    { order: 0, type: 'header', purpose: 'Navigation' },
    { order: 1, type: 'hero', purpose: 'Impactful introduction' },
    { order: 2, type: 'stats', purpose: 'Key metrics' },
    // ... more blocks
  ];
  theme: 'light' | 'dark';
  colorPalette: { primary, secondary, background, etc. };
  typography: { headingFont, bodyFont, monoFont };
}
```

When AI generates a portfolio for that niche, it:
1. **Follows** the same section ordering
2. **Uses** similar components
3. **Applies** same color scheme
4. **Matches** typography choices
5. **Preserves** professional structure

---

## AI Prompt Enhancement

The template-based guidance added to AI prompt:

```
🎨 TEMPLATE-BASED ARCHITECTURE (PRIMARY GUIDE):
You have access to 17+ proven portfolio templates with specific block patterns for each niche.
Your generated manifest MUST follow these proven architectural patterns.

[Detailed manifest guidance for specific niche]

NICHE-SPECIFIC MANIFEST STRUCTURE:
1. HEADER - Navigation and branding
2. HERO - [specific hero type for niche]
3. [Section-specific guidance]
...
12. FOOTER - Site footer

CRITICAL RULES:
1. Follow template section ordering
2. Use template color schemes
3. Apply template typography
4. Match niche-specific components
5. Ensure 10-15 sections total
```

---

## Future Enhancements

1. **Dynamic Blueprint Learning** - Extract new patterns from user-created templates
2. **Hybrid Generation** - Combine multiple template patterns for unique results
3. **Template Versioning** - Track template updates and apply to future generations
4. **A/B Testing** - Test different template-based architectures
5. **Custom Templates** - Allow users to create and save custom template patterns
6. **ML Pattern Recognition** - ML-based template similarity detection

---

## Testing

To verify template-based generation:

1. **Upload Engineering CV**
   - ✅ Should get dark, technical hero
   - ✅ Should have STATS → SKILLS → PROJECTS flow
   - ✅ Should use cyan/purple (CYBER_NEON)
   - ✅ Should use JetBrains Mono for code

2. **Upload Designer CV**
   - ✅ Should get visual hero (HERO_VISUALIST)
   - ✅ Should have gallery/masonry projects
   - ✅ Should use VIBRANT_BLOOM colors
   - ✅ Should prioritize images over text

3. **Upload Executive CV**
   - ✅ Should get professional hero
   - ✅ Should have STATS section prominently
   - ✅ Should use professional colors (gold/blue)
   - ✅ Should emphasize business metrics

4. **Verify Section Ordering**
   - ✅ Matches template niche flow
   - ✅ Header first, footer last
   - ✅ 10-15 sections total
   - ✅ No random component placement

---

## Configuration

Template blueprints are extracted automatically from your existing templates:
- `/templates/creative/index.ts`
- `/templates/engineering/index.ts`
- `/templates/executive/index.ts`
- `/templates/additional/index.ts`
- `/templates/modern/` (all 10+ templates)

No manual configuration needed - system auto-discovers template patterns.

---

## Summary

Your 17+ templates are now the **foundation** for all AI-generated portfolios:
- ✅ Not random component selection
- ✅ Proven template patterns
- ✅ Niche-appropriate architectures
- ✅ Professional, consistent output
- ✅ Template-guided AI generation

All new portfolios follow your template blueprints while remaining unique to each CV.
