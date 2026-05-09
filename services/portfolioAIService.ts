import { aiService } from './apiService';
import { PortfolioData } from '../types';
import { renderManifest } from '../utils/renderer';
import { Registry } from '../registry';

const portfolioSchema = {
  type: 'object',
  properties: {
    html: { type: 'string', description: 'Complete body HTML with data-field attributes for all dynamic content.' },
    css: { type: 'string', description: 'CSS styles for the layout.' },
    js: { type: 'string', description: 'JS interactivity if needed.' },
    structuredContent: {
      type: 'object',
      properties: {
        hero: { type: 'object' },
        about: { type: 'object' },
        skills: { type: 'array', items: { type: 'string' } },
        projects: { type: 'array' },
        workHistory: { type: 'array' },
        education: { type: 'array' },
        blog: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            posts: { type: 'array' }
          }
        },
        certifications: { type: 'array' },
        testimonials: { type: 'array' },
        contact: { type: 'object' }
      }
    }
  },
  required: ['html', 'css', 'js', 'structuredContent']
};

const REGISTRY_COMPONENT_IDS = new Set(Object.keys(Registry || {}));
const FALLBACK_COMPONENT_BY_TYPE: Record<string, string> = {
  header: 'HEADER_MINIMALIST',
  hero: 'HERO_MODERN_SPLIT',
  about: 'ABOUT_NARRATIVE',
  skills: 'SKILLS_MARQUEE',
  projects: 'PROJ_MINIMAL_CARDS',
  experience: 'EXP_TIMELINE_VERTICAL',
  testimonials: 'TESTIMONIALS_BENTO',
  contact: 'CONTACT_SPLIT',
  footer: 'FOOTER_MINIMAL',
  stats: 'STATS_COUNTER_GRID',
  services: 'SERVICES_MINIMAL_LIST',
  cta: 'CTA_HERO_INLINE',
  faq: 'FAQ_ACCORDION_NEON',
  pricing: 'PRICING_MINIMAL_CARDS',
  logos: 'LOGOS_STRIP_CLEAN',
  process: 'PROCESS_STEPS_VERTICAL',
  gallery: 'GALLERY_MASONRY_GLASS',
  team: 'TEAM_GRID_EDITORIAL',
  education: 'EDUCATION_TIMELINE',
  awards: 'AWARDS_SHOWCASE',
  certifications: 'EDUCATION_CARDS_GRID',
  achievements: 'AWARDS_COMPACT_LIST',
};

const INVALID_LITERAL_VALUES = new Set(['undefined', 'null', '[object object]', 'nan']);

function isPoisonedString(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  if (INVALID_LITERAL_VALUES.has(normalized)) return true;
  if (normalized.startsWith('mailto:undefined')) return true;
  return false;
}

function cleanString(value: any, fallback: string = ''): string {
  if (value === undefined || value === null) return fallback;
  const str = String(value).trim();
  return isPoisonedString(str) ? fallback : str;
}

function sanitizeHref(value: any, fallback: string = '#'): string {
  const href = cleanString(value, fallback);
  if (!href) return fallback;
  return href;
}

function sanitizeDeep<T = any>(value: T): T {
  if (value === undefined || value === null) return value;
  if (typeof value === 'string') {
    return cleanString(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDeep(item)) as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, any> = {};
    Object.entries(value as Record<string, any>).forEach(([k, v]) => {
      out[k] = sanitizeDeep(v);
    });
    return out as T;
  }
  return value;
}

function resolveComponentId(rawComponentId: any, rawType?: any): string {
  const componentId = cleanString(rawComponentId);
  if (componentId && REGISTRY_COMPONENT_IDS.has(componentId)) return componentId;

  const inferredType = cleanString(rawType).toLowerCase() || inferTypeFromComponentId(componentId || '').toLowerCase();
  const fallback = FALLBACK_COMPONENT_BY_TYPE[inferredType];
  if (fallback && REGISTRY_COMPONENT_IDS.has(fallback)) {
    return fallback;
  }

  return 'HERO_MODERN_SPLIT';
}

function normalizeManifestSections(sections: any[]): any[] {
  if (!Array.isArray(sections)) return [];
  const normalized = sections.map((section: any, index: number) => {
    const resolvedComponentId = resolveComponentId(section?.componentId || section?.component, section?.type);
    const resolvedType = cleanString(section?.type) || inferTypeFromComponentId(resolvedComponentId);
    const normalizedContent = normalizeSectionContent(
      resolvedComponentId,
      section?.content || section?.props || section?.data
    );

    return {
      ...section,
      id: cleanString(section?.id, `${resolvedType || 'section'}-${index + 1}`),
      type: resolvedType,
      componentId: resolvedComponentId,
      content: sanitizeDeep(normalizedContent),
      settings: section?.settings || { isVisible: true, padding: 'medium' },
      template: cleanString(resolvedComponentId) === 'GEN_TEMPLATE' ? section?.template : undefined
    };
  });

  return harmonizeHeaderNavLinks(normalized);
}

function harmonizeHeaderNavLinks(sections: any[]): any[] {
  if (!Array.isArray(sections) || sections.length === 0) return sections;

  const firstNonHeader = sections.find((s: any) => cleanString(s?.type).toLowerCase() !== 'header')?.id || 'home';
  const sectionIds = new Set(
    sections
      .map((s: any) => cleanString(s?.id))
      .filter(Boolean)
  );

  const targetByType: Record<string, string> = {};
  sections.forEach((s: any) => {
    const t = cleanString(s?.type).toLowerCase();
    const id = cleanString(s?.id);
    if (t && id && !targetByType[t]) targetByType[t] = id;
  });

  const resolveBestTarget = (label: string): string => {
    const l = cleanString(label).toLowerCase();
    if (l.includes('home')) return targetByType.hero || targetByType.home || firstNonHeader;
    if (l.includes('about')) return targetByType.about || firstNonHeader;
    if (l.includes('skill')) return targetByType.skills || firstNonHeader;
    if (l.includes('project') || l.includes('work')) return targetByType.projects || firstNonHeader;
    if (l.includes('experience') || l.includes('career')) return targetByType.experience || firstNonHeader;
    if (l.includes('testimonial')) return targetByType.testimonials || firstNonHeader;
    if (l.includes('service')) return targetByType.services || firstNonHeader;
    if (l.includes('pricing') || l.includes('plan')) return targetByType.pricing || firstNonHeader;
    if (l.includes('contact')) return targetByType.contact || targetByType.footer || firstNonHeader;
    if (l.includes('blog')) return targetByType.blog || firstNonHeader;
    return firstNonHeader;
  };

  const isValidHashLink = (link: string): boolean => {
    if (!link.startsWith('#')) return false;
    const id = cleanString(link.slice(1));
    return !!id && sectionIds.has(id);
  };

  return sections.map((section: any) => {
    if (cleanString(section?.type).toLowerCase() !== 'header') return section;
    const content = section.content || {};
    const navLinks = Array.isArray(content.navLinks) ? content.navLinks : [];
    const normalizedNavLinks = navLinks.map((nav: any) => {
      const label = cleanString(nav?.label || nav?.name, 'Section');
      const rawLink = cleanString(nav?.link || nav?.url, '#');
      const finalLink = isValidHashLink(rawLink) ? rawLink : `#${resolveBestTarget(label)}`;
      return { ...nav, label, link: finalLink };
    });

    const ctaLinkRaw = cleanString(content?.cta?.link, '#');
    const ctaResolved = isValidHashLink(ctaLinkRaw)
      ? ctaLinkRaw
      : (targetByType.contact ? `#${targetByType.contact}` : `#${firstNonHeader}`);

    return {
      ...section,
      content: {
        ...content,
        navLinks: normalizedNavLinks,
        cta: content.cta ? { ...content.cta, link: ctaResolved } : content.cta
      }
    };
  });
}

// Helper to extract structuredContent from HTML using data-field attributes
function extractStructuredContentFromHtml(html: string): any {
  if (!html) return {};

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const structuredContent: any = {};

    // Extract Hero section
    const heroName = doc.querySelector('[data-field="hero-name"]')?.textContent?.trim();
    const heroTitle = doc.querySelector('[data-field="hero-title"]')?.textContent?.trim();
    const heroBio = doc.querySelector('[data-field="hero-bio"]')?.textContent?.trim();
    const heroImage = doc.querySelector('[data-field="hero-image"]')?.getAttribute('src');
    const heroCtaText = doc.querySelector('[data-field="hero-ctaText"]')?.textContent?.trim();
    const heroCtaLink = doc.querySelector('[data-field="hero-ctaLink"]')?.getAttribute('href');

    if (heroName || heroTitle || heroBio) {
      structuredContent.hero = {
        name: heroName || '',
        title: heroTitle || '',
        bio: heroBio || '',
        image: heroImage || '',
        ctaText: heroCtaText || 'Get in Touch',
        ctaLink: heroCtaLink || '#contact'
      };
    }

    // Extract About/Summary
    const aboutSummary = doc.querySelector('[data-field="about-summary"]')?.textContent?.trim();
    if (aboutSummary) {
      structuredContent.about = { summary: aboutSummary };
    }

    // Extract Skills (from list)
    const skillsList = doc.getElementById('skills-list');
    if (skillsList) {
      const skillItems = Array.from(skillsList.querySelectorAll('[data-field="title"]'));
      structuredContent.skills = skillItems.map(el => el.textContent?.trim() || '');
    }

    // Extract Projects
    const projectsList = doc.getElementById('projects-list');
    if (projectsList) {
      const projectItems = Array.from(projectsList.children);
      structuredContent.projects = projectItems.map(item => ({
        title: item.querySelector('[data-field="title"]')?.textContent?.trim() || '',
        description: item.querySelector('[data-field="desc"]')?.textContent?.trim() || '',
        technologies: item.querySelector('[data-field="technologies"]')?.textContent?.trim() || '',
        link: item.querySelector('[data-field="live"]')?.getAttribute('href') || '',
        image: item.querySelector('[data-field="img"]')?.getAttribute('src') || ''
      }));
    }

    // Extract Work History/Experience
    const experienceList = doc.getElementById('experience-list');
    if (experienceList) {
      const expItems = Array.from(experienceList.children);
      structuredContent.workHistory = expItems.map(item => ({
        company: item.querySelector('[data-field="company"]')?.textContent?.trim() || '',
        position: item.querySelector('[data-field="position"]')?.textContent?.trim() || '',
        period: item.querySelector('[data-field="period"]')?.textContent?.trim() || '',
        description: item.querySelector('[data-field="description"]')?.textContent?.trim() || ''
      }));
    }

    // Extract Education
    const educationList = doc.getElementById('education-list');
    if (educationList) {
      const eduItems = Array.from(educationList.children);
      structuredContent.education = eduItems.map(item => ({
        school: item.querySelector('[data-field="school"]')?.textContent?.trim() || '',
        degree: item.querySelector('[data-field="degree"]')?.textContent?.trim() || '',
        year: item.querySelector('[data-field="year"]')?.textContent?.trim() || '',
        description: item.querySelector('[data-field="description"]')?.textContent?.trim() || ''
      }));
    }

    // Extract Blog Posts
    const blogList = doc.getElementById('blog-posts');
    if (blogList) {
      const blogTitle = doc.querySelector('#blog h2')?.textContent?.trim() || 'Blog';
      const postItems = Array.from(blogList.children);
      structuredContent.blog = {
        title: blogTitle,
        posts: postItems.map(item => ({
          title: item.querySelector('[data-field="title"]')?.textContent?.trim() || '',
          date: item.querySelector('[data-field="date"]')?.textContent?.trim() || '',
          excerpt: item.querySelector('[data-field="excerpt"]')?.textContent?.trim() || '',
          link: item.querySelector('[data-field="link"]')?.getAttribute('href') || '',
          image: item.querySelector('[data-field="image"]')?.getAttribute('src') || ''
        }))
      };
    }

    // Extract Certifications
    const certsList = doc.getElementById('certifications-list');
    if (certsList) {
      const certItems = Array.from(certsList.children);
      structuredContent.certifications = certItems.map(item => ({
        name: item.querySelector('[data-field="name"]')?.textContent?.trim() || '',
        issuer: item.querySelector('[data-field="issuer"]')?.textContent?.trim() || '',
        year: item.querySelector('[data-field="year"]')?.textContent?.trim() || ''
      }));
    }

    // Extract Testimonials
    const testList = doc.getElementById('testimonials-list');
    if (testList) {
      const testItems = Array.from(testList.children);
      structuredContent.testimonials = testItems.map(item => ({
        text: item.querySelector('[data-field="text"]')?.textContent?.trim() || '',
        author: item.querySelector('[data-field="author"]')?.textContent?.trim() || '',
        role: item.querySelector('[data-field="role"]')?.textContent?.trim() || ''
      }));
    }

    // Extract Contact
    const contactEmail = doc.querySelector('[data-field="contact-email"]') || doc.querySelector('[data-field="email"]');
    const contactPhone = doc.querySelector('[data-field="contact-phone"]') || doc.querySelector('[data-field="phone"]');
    const contactLocation = doc.querySelector('[data-field="contact-location"]') || doc.querySelector('[data-field="location"]');

    if (contactEmail || contactPhone || contactLocation) {
      structuredContent.contact = {
        email: contactEmail?.textContent?.trim() || '',
        phone: contactPhone?.textContent?.trim() || '',
        location: contactLocation?.textContent?.trim() || ''
      };
    }

    // Extract Socials
    const socialsList = doc.getElementById('socials-list');
    if (socialsList) {
      const socialItems = Array.from(socialsList.querySelectorAll('[data-field="url"]'));
      structuredContent.socials = socialItems.map(el => {
        const parent = el.closest('a');
        return {
          platform: parent?.getAttribute('title') || el.textContent?.trim() || '',
          url: el.getAttribute('href') || el.textContent?.trim() || ''
        };
      });
    }

    // Extract Section Titles
    const sectionTitles: any = {};
    const titleFields = ['hero', 'summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'awards', 'references', 'contact', 'socials'];
    titleFields.forEach(field => {
      const el = doc.querySelector(`[data-field="sectionTitles-${field}"]`);
      if (el?.textContent?.trim()) {
        sectionTitles[field] = el.textContent.trim();
      }
    });
    if (Object.keys(sectionTitles).length > 0) {
      structuredContent.sectionTitles = sectionTitles;
    }

    return structuredContent;
  } catch (e) {
    console.warn('[PortfolioAIService] Failed to extract structuredContent from HTML:', e);
    return {};
  }
}

// Helper to extract AI-designed item templates from the raw HTML
function extractTemplatesFromHtml(html: string): Record<string, string> {
  const templates: Record<string, string> = {};
  if (!html) return templates;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const lists = [
      { id: 'projects-list', key: 'PROJ_LIST' },
      { id: 'experience-list', key: 'EXP_LIST' },
      { id: 'skills-list', key: 'SKILLS_LIST' },
      { id: 'testimonials-list', key: 'TESTIMONIAL_LIST' },
      { id: 'socials-list', key: 'SOCIAL_LIST' }
    ];

    lists.forEach(list => {
      const container = doc.getElementById(list.id);
      if (container) {
        if (container.firstElementChild) {
          templates[list.key] = container.firstElementChild.outerHTML;
        } else if (container.textContent?.includes('{')) {
          // If no element but has placeholder text, we keep it as is
          templates[list.key] = container.innerHTML;
        }
      }
    });
  } catch (e) {
    console.warn('[PortfolioAIService] Failed to extract templates:', e);
  }
  return templates;
}

export async function generatePortfolio(input: {
  type: string,
  value: string,
  baseHtml?: string,
  files?: any[],
  sessionId?: string,
  portfolioId?: string,
  templateId?: string,
  niche?: string,
  lockToTemplate?: boolean,
  selectedTemplateManifest?: any,
  templateCandidates?: Array<{ id: string; niche?: string; structuredContent?: any }>,
  templateSelectionNonce?: string
}) {
  try {
    const response = await aiService.generatePortfolio({
      value: input.value,
      template: input.baseHtml,
      files: input.files,
      sessionId: input.sessionId,
      portfolioId: input.portfolioId,
      niche: input.niche
    });

    // Parse the stringified code data from the backend
    let aiCode: any = {};
    if (response.data) {
      try {
        aiCode = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      } catch (e) {
        console.error("[PortfolioAIService] Failed to parse AI code data:", e);
      }
    }

    let html = aiCode.html || '';
    // Surgical Strip: Remove scripts that override hydration or are AI-hallucinated, but KEEP CDNs (Tailwind, FA, etc.)
    const scriptRegex = /<script\b[^>]*>([\s\S]*?(window\.structuredContent|DOMContentLoaded|\.innerHTML\s*=)[\s\S]*?)<\/script>/gi;
    html = html.replace(scriptRegex, '');

    // Extract templates from the AI-generated HTML
    const extractedTemplates = extractTemplatesFromHtml(html);

    // Use AI-provided structuredContent if available
    let structuredContent = response.structuredContent;

    // CRITICAL: If the entire aiCode object looks like a Manifest (has sections), use it as structuredContent
    if (!structuredContent && aiCode && aiCode.sections && Array.isArray(aiCode.sections)) {

      structuredContent = aiCode;
    }

    if (!structuredContent || Object.keys(structuredContent).length === 0) {

      structuredContent = extractStructuredContentFromHtml(html);
    }

    // Check if already in Manifest format (has sections array) or needs normalization
    let sc: any;
    if (structuredContent?.sections && Array.isArray(structuredContent.sections)) {
      // Already in Manifest format, but normalize section keys (AI may use component/props instead of componentId/content)
      const normalizedSections = normalizeManifestSections(structuredContent.sections);

      sc = {
        ...structuredContent,
        sections: normalizedSections,
        metadata: structuredContent.metadata || { version: '1.0', niche: 'General', generatedAt: new Date().toISOString() }
      };
      sc = ensureManifestDefaults(sc);

    } else {
      // Flat content format, needs normalization
      sc = normalizeToManifest(structuredContent, 'MODERN_VERTICAL');

    }

    // Template-locked mode: preserve a professional template skeleton and only inject user data.
    if (input.lockToTemplate) {
      const profileFromManifest = extractProfileFromManifest(sc);
      const profileFromRaw = extractProfileFromRawInput(input.value, input.files);
      const profile = mergeDefined(profileFromManifest, profileFromRaw || {});
      const templateManifest = pickTemplateManifestForProfile({
        selectedTemplateManifest: input.selectedTemplateManifest,
        templateCandidates: input.templateCandidates,
        profile,
        targetNiche: input.niche || sc?.metadata?.niche,
        selectionSeed: `${textFromInputSources(input.value, input.files).slice(0, 1500)}|${cleanString(input.niche)}|${cleanString(input.templateId)}|${cleanString(input.templateSelectionNonce)}`
      });
      if (templateManifest?.sections?.length) {
        sc = materializeTemplateWithProfile(templateManifest, profile, input.niche || sc?.metadata?.niche || 'General');
      }
    }

    // Always render from sanitized manifest to keep output strictly registry-aligned.
    if (sc) {
      try {
        html = renderManifest(sc);
      } catch (err) {
        console.error('[PortfolioAIService] Failed to generate HTML from Manifest:', err);
      }
    }

    const portfolioData: PortfolioData = {
      id: response.portfolioId || `node-${Date.now()}`,
      name: 'AI Generated Portfolio',
      html: html,
      css: aiCode.css || '',
      js: aiCode.js || '',
      structuredContent: sc,
      theme: 'light',
      layout: 'MODERN_VERTICAL' as any,
      templates: extractedTemplates // Include extracted templates
    };


    return portfolioData;
  } catch (error: any) {
    console.error(error);
    throw error
  }
}
export async function refinePortfolio(currentData: PortfolioData, prompt: string, files?: any[]) {
  try {
    addLog(`Refining node with prompt: ${prompt}...`);
    // Pass current structuredContent directly to AI
    const updatedStructuredContent = await aiService.editPortfolio(currentData.structuredContent, prompt, currentData.id, files);

    addLog(`Synthesizing updated visual structure...`);

    // Normalize sections and ensure metadata is preserved
    const normalizedSections = normalizeManifestSections(updatedStructuredContent.sections || []);

    // CRITICAL: If the AI returned a Manifest structure, we keep it but ensure sections are normalized
    let sc = {
      ...updatedStructuredContent,
      sections: normalizedSections,
      metadata: updatedStructuredContent.metadata || currentData.structuredContent?.metadata || {
        version: '1.0',
        generatedAt: new Date().toISOString()
      }
    };

    // Preserve user-entered content on refinement (UI polish only)
    if (currentData.structuredContent?.sections && sc.sections) {
      sc = {
        ...sc,
        sections: mergeSectionsPreserveContent(
          currentData.structuredContent.sections,
          sc.sections,
          { preserveComponentId: true }
        )
      };
    }

    // After content is merged safely, regenerate code
    const finalCode = await aiService.generateCode(sc, currentData.id);

    return {
      ...currentData,
      html: finalCode.html || currentData.html,
      css: finalCode.css || currentData.css,
      js: finalCode.js || currentData.js,
      structuredContent: sc
    };
  } catch (error: any) {
    console.error('Refinement Loop Error:', error);
    throw error
  }
}

export async function redesignLayout(currentData: PortfolioData) {
  try {
    addLog(`Initiating AI Visual Redesign...`);
    // We use the same edit endpoint but with a specific instruction for visual overhaul
    const response = await aiService.generatePortfolio({
      type: 'omni',
      value: `Architect a new layout structure for this portfolio. 
      ROLE: You are a System Architect.
      TASK: Select the optimal 'componentId' for each section from the Registry.
      - Hero: Choose from active HERO_* components.
      - Projects: Choose from PROJ_* components.
      - Skills: Choose from SKILLS_* components.
      
      STRICT RULES: 
      - Every section MUST use "componentId" (not "component").
      - Every section MUST use "content" (not "props" or "data").
      - DO NOT MODIFY ANY TEXT CONTENT. Maintain all professional descriptions, metrics, and labels exactly as provided.
      - THIS IS A UI-ONLY REMIX. Focus on componentId selection and globalConfig styles.
      
      OUTPUT: Return a valid Manifest JSON.`,
      baseHtml: currentData.html,
      structuredContent: currentData.structuredContent,
      portfolioId: currentData.id
    } as any);



    // Parse the stringified code data from the backend
    let aiCode: any = {};
    if (response.data) {
      try {
        aiCode = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      } catch (e) {
        console.error("Failed to parse AI code data:", e);
      }
    }

    // Use AI-provided structuredContent if available, otherwise extract from HTML
    let structuredContent = response.structuredContent;
    let html = aiCode.html || response.html || currentData.html;

    // Surgical Strip from redesigned HTML
    const scriptRegex = /<script\b[^>]*>([\s\S]*?(window\.structuredContent|DOMContentLoaded|\.innerHTML\s*=)[\s\S]*?)<\/script>/gi;
    html = html.replace(scriptRegex, '');

    if (!structuredContent || Object.keys(structuredContent).length === 0) {

      structuredContent = extractStructuredContentFromHtml(html);
    }

    // CRITICAL: Structural Merge to ensure content preservation during Remix
    // If AI changed content fields during remix, we revert them to original structuredContent
    // while keeping the new componentId and styles.
    if (structuredContent?.sections && currentData.structuredContent?.sections) {
      structuredContent.sections = mergeSectionsPreserveContent(
        currentData.structuredContent.sections,
        structuredContent.sections,
        { preserveComponentId: false }
      );
    }

    const sc = normalizeToManifest(structuredContent || currentData.structuredContent, currentData.layout);

    return {
      ...currentData,
      id: response.portfolioId || currentData.id,
      html: html,
      css: aiCode.css || response.css || currentData.css,
      js: aiCode.js || response.js || currentData.js,
      structuredContent: sc
    };
  } catch (error: any) {
    console.error('Redesign Loop Error:', error);
    throw error
  }
}

// Internal log helper with consistent formatting
function addLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '→';

}

function mergeSectionsPreserveContent(
  originalSections: any[],
  updatedSections: any[],
  options: { preserveComponentId: boolean }
) {
  const originalById = new Map<string, any>();
  const originalByType = new Map<string, any[]>();

  originalSections.forEach((section: any) => {
    if (section?.id) originalById.set(section.id, section);
    const type = section?.type || '';
    if (!originalByType.has(type)) originalByType.set(type, []);
    originalByType.get(type)!.push(section);
  });

  return updatedSections.map((section: any) => {
    let original = section?.id ? originalById.get(section.id) : undefined;
    if (!original && section?.type && originalByType.get(section.type)?.length) {
      original = originalByType.get(section.type)!.shift();
    }
    if (!original) return section;

    return {
      ...section,
      componentId: options.preserveComponentId ? (original.componentId || section.componentId) : section.componentId,
      template: options.preserveComponentId ? (original.template || section.template) : section.template,
      content: original.content ?? section.content
    };
  });
}
// Normalizes content fields to match what Registry components expect
export function normalizeSectionContent(componentId: string, content: any): any {
  if (!content) return {};
  content = sanitizeDeep(content);
  const id = componentId ? componentId.toUpperCase() : '';

  // HEADER normalization
  if (id.startsWith('HEADER')) {
    const normalizedNavLinks = Array.isArray(content.navLinks)
      ? content.navLinks.map((nav: any, index: number) => ({
        label: cleanString(nav?.label || nav?.name, `Section ${index + 1}`),
        link: sanitizeHref(nav?.link ?? nav?.url, '#')
      }))
      : [];

    return {
      ...content,
      name: cleanString(content.name || content.username || content.brand || content.logoText, 'Portfolio'),
      username: cleanString(content.username || content.name || content.brand || content.logoText, 'Portfolio'),
      navLinks: normalizedNavLinks.length > 0 ? normalizedNavLinks : [
        { label: 'Home', link: '#hero' },
        { label: 'Projects', link: '#projects' },
        { label: 'Contact', link: '#contact' }
      ],
      cta: content.cta ? {
        text: cleanString(content.cta.text || content.cta.label, 'Contact'),
        link: sanitizeHref(content.cta.link, '#contact')
      } : undefined
    };
  }

  // HERO normalization
  if (id.startsWith('HERO')) {
    return {
      name: cleanString(content.name || content.title || content.userName),
      title: cleanString(content.title || content.subtitle || content.role || content.tagline),
      bio: cleanString(content.bio || content.description || content.summary),
      image: cleanString(content.image || content.backgroundImage || content.profileImage),
      greeting: cleanString(content.greeting || content.hello, 'Hello, I am'),
      highlights: Array.isArray(content.highlights) ? content.highlights : [],
      cta: content.cta || {
        text: cleanString(content.primaryCta?.label || content.ctaText, 'Explore Work'),
        link: sanitizeHref(content.primaryCta?.link || content.ctaLink, '#projects')
      },
      ...content
    };
  }

  // ABOUT normalization
  if (id.startsWith('ABOUT')) {
    return {
      title: content.title || content.heading || 'About Me',
      content: content.content || (content.paragraphs ? content.paragraphs.join('\n\n') : '') || content.description || content.bio || '',
      image: content.image || content.backgroundImage || '',
      label: content.label || content.tagline || '',
      highlights: Array.isArray(content.highlights) ? content.highlights : [],
      stats: Array.isArray(content.stats) ? content.stats : [],
      ...content
    };
  }

  // PROJECTS normalization
  if (id.startsWith('PROJ')) {
    const items = content.projects || content.items || [];
    return {
      title: content.title || content.heading || 'Selected Works',
      items: items.map((p: any) => ({
        title: p.title || '',
        description: p.description || p.desc || '',
        image: p.image || p.img || '',
        link: p.link || p.url || '#',
        tech: p.tech || p.tags || p.technologies || []
      })),
      ...content
    };
  }

  // EXPERIENCE normalization
  if (id.startsWith('EXP')) {
    const items = content.experiences || content.items || content.educationEntries || [];
    return {
      title: content.title || content.heading || 'Professional Timeline',
      items: items.map((e: any) => ({
        role: e.role || e.title || e.degree || '',
        company: e.company || e.institution || e.school || '',
        period: e.period || e.duration || e.year || '',
        description: e.description || e.desc || ''
      })),
      ...content
    };
  }

  // CONTACT normalization
  if (id.startsWith('CONTACT')) {
    const socials = content.socials || content.socialLinks || content.links || [];
    return {
      title: cleanString(content.title || content.heading, "Let's Connect"),
      email: cleanString(content.email),
      phone: cleanString(content.phone),
      location: cleanString(content.location),
      socials: Array.isArray(socials) ? socials.map((s: any) => ({
        platform: cleanString(s.platform || s.name, 'Platform'),
        link: sanitizeHref(s.link || s.url, '#')
      })) : [],
      ...content
    };
  }

  // STATS normalization
  if (id.startsWith('STATS')) {
    const items = content.stats || content.items || [];
    const milestones = content.milestones || content.timeline || [];
    const skills = content.skills || content.progress || [];
    const achievements = content.achievements || content.badges || [];
    const before = content.before || [];
    const after = content.after || [];
    return {
      title: content.title || content.heading || 'Impact',
      subtitle: content.subtitle || content.label || '',
      stats: Array.isArray(items) ? items.map((s: any) => ({
        label: s.label || s.title || '',
        value: s.value || s.count || '0',
        description: s.description || s.desc || ''
      })) : [],
      milestones: Array.isArray(milestones) ? milestones.map((m: any) => ({
        year: m.year || m.date || '',
        metric: m.metric || m.value || '',
        description: m.description || m.desc || ''
      })) : [],
      skills: Array.isArray(skills) ? skills.map((s: any) => ({
        name: s.name || s.label || '',
        percentage: s.percentage || s.value || 0
      })) : [],
      achievements: Array.isArray(achievements) ? achievements.map((a: any) => ({
        icon: a.icon || 'Trophy',
        title: a.title || a.label || '',
        year: a.year || a.date || ''
      })) : [],
      before: Array.isArray(before) ? before.map((b: any) => ({
        metric: b.metric || b.label || '',
        value: b.value || ''
      })) : [],
      after: Array.isArray(after) ? after.map((b: any) => ({
        metric: b.metric || b.label || '',
        value: b.value || ''
      })) : [],
      ...content
    };
  }

  // SERVICES normalization
  if (id.startsWith('SERVICES')) {
    const items = content.services || content.items || [];
    return {
      title: content.title || content.heading || 'Core Services',
      items: Array.isArray(items) ? items.map((s: any) => ({
        title: s.title || s.name || '',
        description: s.description || s.desc || '',
        icon: s.icon || 'star'
      })) : [],
      ...content
    };
  }

  // PRICING normalization
  if (id.startsWith('PRICING')) {
    const items = content.items || content.plans || [];
    return {
      title: content.title || content.heading || 'Pricing',
      items: Array.isArray(items) ? items.map((p: any) => ({
        name: p.name || p.title || '',
        price: p.price || p.amount || '',
        period: p.period || p.billing || 'mo',
        features: Array.isArray(p.features) ? p.features : [],
        featured: !!p.featured,
        link: p.link || p.url || '#contact'
      })) : [],
      plans: Array.isArray(items) ? items.map((p: any) => ({
        name: p.name || p.title || '',
        price: p.price || p.amount || '',
        hours: p.hours || '',
        featured: !!p.featured
      })) : [],
      ...content
    };
  }

  // LOGOS normalization
  if (id.startsWith('LOGOS')) {
    const items = content.logos || content.items || content.partners || [];
    return {
      title: content.title || content.heading || 'As seen in',
      logos: Array.isArray(items) ? items.map((l: any) => ({
        url: l.url || l.image || l.logo || l,
        name: l.name || l.label || ''
      })) : [],
      partners: Array.isArray(items) ? items.map((l: any) => ({
        name: l.name || l.label || '',
        icon: l.icon || ''
      })) : [],
      ...content
    };
  }

  // PROCESS normalization
  if (id.startsWith('PROCESS')) {
    const steps = content.steps || content.items || [];
    return {
      title: content.title || content.heading || 'Process',
      description: content.description || content.desc || '',
      steps: Array.isArray(steps) ? steps.map((s: any) => ({
        title: s.title || s.name || '',
        description: s.description || s.desc || ''
      })) : [],
      ...content
    };
  }

  // GALLERY normalization
  if (id.startsWith('GALLERY')) {
    const items = content.items || content.images || content.gallery || [];
    return {
      title: content.title || content.heading || 'Gallery',
      label: content.label || content.subtitle || 'Artifacts',
      items: Array.isArray(items) ? items.map((g: any) => ({
        image: g.image || g.url || g.src || '',
        title: g.title || g.name || '',
        category: g.category || g.tag || ''
      })) : [],
      ...content
    };
  }

  // TEAM normalization
  if (id.startsWith('TEAM')) {
    const members = content.members || content.items || [];
    return {
      title: content.title || content.heading || 'Team',
      description: content.description || content.desc || '',
      members: Array.isArray(members) ? members.map((m: any) => ({
        name: m.name || m.title || '',
        role: m.role || m.position || '',
        image: m.image || m.avatar || '',
        socials: Array.isArray(m.socials) ? m.socials : []
      })) : [],
      ...content
    };
  }

  // FAQ normalization
  if (id.startsWith('FAQ')) {
    const items = content.items || content.faqs || content.questions || [];
    return {
      title: content.title || content.heading || 'FAQs',
      items: Array.isArray(items) ? items.map((f: any) => ({
        question: f.question || f.title || '',
        answer: f.answer || f.content || f.description || ''
      })) : [],
      ...content
    };
  }

  // CTA normalization
  if (id.startsWith('CTA')) {
    return {
      title: content.title || content.heading || 'Lets Work Together',
      subtitle: content.subtitle || content.label || '',
      description: content.description || content.desc || '',
      cta: content.cta || {
        text: content.ctaText || 'Get Started',
        link: content.ctaLink || '#contact'
      },
      ...content
    };
  }

  // TESTIMONIAL normalization
  if (id.startsWith('TESTIMONIAL')) {
    const items = content.items || content.testimonials || [];
    return {
      title: content.title || content.heading || 'Testimonials',
      items: Array.isArray(items) ? items.map((t: any) => ({
        text: t.text || t.content || t.quote || '',
        author: t.author || t.name || '',
        role: t.role || t.title || ''
      })) : [],
      ...content
    };
  }

  // SKILLS normalization for marquee/ticker-like components that expect string arrays.
  if (id.startsWith('SKILLS')) {
    const rawSkills = content.skills || content.items || [];
    if (id.includes('MARQUEE') && Array.isArray(rawSkills)) {
      const labels = rawSkills
        .map((s: any) => {
          if (typeof s === 'string') return cleanString(s, '');
          if (s && typeof s === 'object') return cleanString(s.name || s.title || s.label, '');
          return '';
        })
        .filter(Boolean);
      return {
        ...content,
        skills: labels
      };
    }
  }

  // FOOTER normalization
  if (id.startsWith('FOOTER')) {
    const rawSocials = content.socials || content.links || content.socialLinks || [];
    const socials = Array.isArray(rawSocials) ? rawSocials.map((s: any, index: number) => {
      if (typeof s === 'string') {
        return { platform: s, name: s, url: '#', link: '#' };
      }
      const platform = s.platform || s.name || s.label || `Link ${index + 1}`;
      const url = sanitizeHref(s.url || s.link, '#');
      return {
        platform: cleanString(platform, `Link ${index + 1}`),
        name: cleanString(platform, `Link ${index + 1}`),
        url,
        link: url
      };
    }) : [];

    const normalizedLinks = Array.isArray(content.links)
      ? content.links.map((l: any) => {
        if (typeof l === 'string') return l;
        return l.label || l.name || l.title || '';
      }).filter(Boolean)
      : [];

    return {
      ...content,
      name: cleanString(content.name || content.logoText || content.brand || content.username, 'Portfolio'),
      logoText: cleanString(content.logoText || content.name || content.brand || content.username, 'Portfolio'),
      copyright: cleanString(content.copyright),
      email: cleanString(content.email || content.footerEmail),
      footerEmail: cleanString(content.footerEmail || content.email),
      socials,
      links: normalizedLinks.length > 0 ? normalizedLinks : content.links || []
    };
  }

  return content;
}

// Infer section type from component ID (e.g., HERO_CYBER_MONO → hero)
export function inferTypeFromComponentId(componentId: string): string {
  if (!componentId) return 'unknown';
  const id = componentId.toUpperCase();
  if (id.startsWith('HEADER')) return 'header';
  if (id.startsWith('HERO')) return 'hero';
  if (id.startsWith('ABOUT')) return 'about';
  if (id.startsWith('PROJ')) return 'projects';
  if (id.startsWith('EXP')) return 'experience';
  if (id.startsWith('SKILL')) return 'skills';
  if (id.startsWith('CONTACT') || id.startsWith('FORM')) return 'contact';
  if (id.startsWith('FOOTER')) return 'footer';
  if (id.startsWith('CTA')) return 'cta';
  if (id.startsWith('STATS')) return 'stats';
  if (id.startsWith('SERVICES')) return 'services';
  if (id.startsWith('TESTIMONIAL')) return 'testimonials';
  if (id.startsWith('FAQ')) return 'faq';
  if (id.startsWith('PRICING')) return 'pricing';
  if (id.startsWith('TEAM')) return 'team';
  if (id.startsWith('GALLERY')) return 'gallery';
  if (id.startsWith('PROCESS')) return 'process';
  if (id.startsWith('LOGOS')) return 'logos';
  if (id.startsWith('BLOG')) return 'blog';
  return 'section';
}

// Helper functions
function transformStructuredContentToPlaceholders(structuredContent: any, templates: Record<string, string> = {}): any[] {
  if (!structuredContent) return []; // Ensure we return array

  const placeholders: any[] = [];

  // Transform hero section
  if (structuredContent.hero) {
    placeholders.push({
      id: 'HERO_NAME',
      label: 'Full Identity',
      currentValue: structuredContent.hero?.name || '',
      type: 'text'
    });
    placeholders.push({
      id: 'HERO_TITLE',
      label: 'Core Protocol (Role)',
      currentValue: structuredContent.hero?.title || '',
      type: 'text'
    });
    placeholders.push({
      id: 'HERO_VAL_PROP',
      label: 'Strategic Narrative',
      currentValue: structuredContent.hero?.bio || structuredContent.about?.summary || '',
      type: 'rich-text'
    });
    placeholders.push({
      id: 'HERO_IMG',
      label: 'Identity Media',
      currentValue: structuredContent.hero?.image || '',
      type: 'image'
    });
    placeholders.push({
      id: 'HERO_CTA_TEXT',
      label: 'Main Action Text',
      currentValue: structuredContent.hero?.ctaText || 'Get in Touch',
      type: 'text'
    });
    placeholders.push({
      id: 'HERO_CTA_LINK',
      label: 'Main Action Link',
      currentValue: structuredContent.hero?.ctaLink || '#contact',
      type: 'link'
    });
  }

  // Transform section titles
  if (structuredContent.sectionTitles) {
    placeholders.push({
      id: 'ABOUT_TITLE',
      label: 'About Section Title',
      currentValue: structuredContent.sectionTitles.about || 'Professional Narrative',
      type: 'text'
    });
    placeholders.push({
      id: 'SKILLS_TITLE',
      label: 'Skills Section Title',
      currentValue: structuredContent.sectionTitles.skills || 'Neural Stack',
      type: 'text'
    });
    placeholders.push({
      id: 'PROJ_TITLE',
      label: 'Projects Section Title',
      currentValue: structuredContent.sectionTitles.projects || 'Artifact Repository',
      type: 'text'
    });
    placeholders.push({
      id: 'EXP_TITLE',
      label: 'Experience Section Title',
      currentValue: structuredContent.sectionTitles.experience || 'Career Sequence',
      type: 'text'
    });
    placeholders.push({
      id: 'TESTIMONIAL_TITLE',
      label: 'Testimonials Section Title',
      currentValue: structuredContent.sectionTitles.testimonials || 'Peer Validation',
      type: 'text'
    });
    placeholders.push({
      id: 'CONTACT_TITLE',
      label: 'Contact Section Title',
      currentValue: structuredContent.sectionTitles.contact || 'Direct Handshake',
      type: 'text'
    });
  }

  // Transform about section (now merged into HERO_VAL_PROP)
  // if (structuredContent.about) {
  //   placeholders.push({
  //     id: 'SUMMARY_TEXT',
  //     label: 'Executive Summary',
  //     currentValue: structuredContent.about?.summary || '',
  //     type: 'rich-text'
  //   });
  // }

  // Transform skills section
  if (structuredContent.skills) {
    placeholders.push({
      id: 'SKILLS_LIST',
      label: 'Neural Stack (Skills)',
      currentValue: Array.isArray(structuredContent.skills) ? structuredContent.skills.join(', ') : '',
      type: 'list', // Template expects list or string-injected list
      listItems: Array.isArray(structuredContent.skills) ? structuredContent.skills.map(s => ({ title: s })) : [],
      listSchema: [{ key: 'title', label: 'Skill', type: 'text' }],
      listItemTemplate: templates['SKILLS_LIST'] || `<div class="px-6 py-3 bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300 hover:border-teal-500/30 hover:text-teal-400 transition-all duration-300 cursor-default shadow-lg" data-field="title">{title}</div>`
    });
  }

  // Transform projects section
  if (structuredContent.projects) {
    const listItems = (structuredContent.projects || []).map((p: any, idx: number) => ({
      id: `project_${idx}`,
      title: p.title || '',
      desc: p.description || '',
      technologies: p.technologies || '',
      live: p.link || '',
      linkText: p.linkText || 'Explore Portfolio DNA',
      img: p.image || ''
    }));

    placeholders.push({
      id: 'PROJ_LIST',
      label: 'Projects',
      currentValue: '',
      type: 'list',
      listItems,
      listSchema: [
        { key: 'title', label: 'Name', type: 'text' },
        { key: 'desc', label: 'Description', type: 'rich-text' },
        { key: 'technologies', label: 'Stack', type: 'text' },
        { key: 'linkText', label: 'Button Text', type: 'text' },
        { key: 'live', label: 'Link URL', type: 'link' },
        { key: 'img', label: 'Media URL', type: 'image' }
      ],
      listItemTemplate: templates['PROJ_LIST'] || `
        <div class="project-item mb-16 p-12 rounded-[50px] bg-slate-900/50 backdrop-blur-xl border border-white/5 relative overflow-hidden group hover:border-teal-500/30 transition-all duration-700">
          <div class="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          {img ? <img src="{img}" data-field="img" class="w-full h-64 object-cover rounded-[32px] mb-10 border border-white/5" /> : ''}
          <div class="relative z-10">
            <h3 class="text-4xl font-bold tracking-tight mb-4 flex items-center gap-4" data-field="title">
              {title}
              <i class="fa-solid fa-arrow-up-right-from-square text-teal-500/50 text-base group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
            </h3>
            <p class="text-slate-400 text-lg mb-8 leading-relaxed font-medium" data-field="desc">{desc}</p>
            <div class="flex flex-wrap gap-3 mb-10">
               <span class="px-5 py-2 bg-slate-800/80 rounded-full text-[11px] font-bold uppercase tracking-widest text-teal-400 border border-teal-500/10 shadow-lg shadow-teal-500/5" data-field="technologies">{technologies}</span>
            </div>
            <a href="{live}" target="_blank" class="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.3em] text-white/70 hover:text-teal-400 transition-all group/btn" data-field="live">
              {linkText} 
              <span class="w-8 h-[1px] bg-teal-500/30 group-hover/btn:w-12 transition-all"></span>
            </a>
          </div>
        </div>
      `
    });
  }

  // Transform work history section
  if (structuredContent.workHistory) {
    const listItems = (structuredContent.workHistory || []).map((w: any, idx: number) => ({
      id: `work_${idx}`,
      company: w.company || '',
      role: w.position || '',
      date: w.period || '',
      desc: w.description || ''
    }));

    placeholders.push({
      id: 'EXP_LIST',
      label: 'Career Sequence (Experience)',
      currentValue: '',
      type: 'list',
      listItems,
      listSchema: [
        { key: 'company', label: 'Institution', type: 'text' },
        { key: 'role', label: 'Role', type: 'text' },
        { key: 'date', label: 'Timeline', type: 'text' },
        { key: 'desc', label: 'Narrative', type: 'rich-text' }
      ],
      listItemTemplate: templates['EXP_LIST'] || `
        <div class="experience-item mb-16 relative pl-12 border-l border-white/5">
          <div class="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
          <div class="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
               <h3 class="text-4xl font-black uppercase italic tracking-tighter leading-none" data-field="role">{role}</h3>
               <p class="text-teal-500 text-sm font-black uppercase tracking-[0.3em] mt-2">{company}</p>
            </div>
            <span class="px-6 py-2 bg-slate-900 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">{date}</span>
          </div>
          <p class="text-slate-500 text-xl leading-relaxed italic">{desc}</p>
        </div>
      `
    });
  }

  // Transform contact section
  if (structuredContent.contact) {
    placeholders.push({
      id: 'EMAIL',
      label: 'Verified Email',
      currentValue: structuredContent.contact?.email || '',
      type: 'text'
    });
    placeholders.push({
      id: 'PHONE',
      label: 'Secure Line (Phone)',
      currentValue: structuredContent.contact?.phone || '',
      type: 'text'
    });
    placeholders.push({
      id: 'LOCATION',
      label: 'Geospatial Node (Location)',
      currentValue: structuredContent.contact?.location || '',
      type: 'text'
    });
  }

  // Transform socials
  if (structuredContent.socials || structuredContent.contact?.linkedin) {
    const listItems = (structuredContent.socials || []).map((s: any, idx: number) => ({
      id: `social_${idx}`,
      name: s.platform || '',
      url: s.url || ''
    }));

    if (structuredContent.contact?.linkedin) {
      listItems.push({ id: 'social_li', name: 'LinkedIn', url: structuredContent.contact.linkedin });
    }

    placeholders.push({
      id: 'SOCIAL_LIST',
      label: 'Verified Channels (Socials)',
      currentValue: '',
      type: 'list',
      listItems,
      listSchema: [
        { key: 'name', label: 'Platform', type: 'text' },
        { key: 'url', label: 'Link URL', type: 'link' }
      ],
      listItemTemplate: templates['SOCIAL_LIST'] || `<a href="{url}" target="_blank" class="p-6 bg-slate-900 border border-white/5 rounded-full text-slate-500 hover:text-teal-400 hover:border-teal-500/30 transition-all uppercase text-[10px] font-black tracking-widest">{name}</a>`
    });
  }

  // Transform testimonials section
  if (structuredContent.testimonials) {
    const listItems = (structuredContent.testimonials || []).map((t: any, idx: number) => ({
      id: `testi_${idx}`,
      name: t.name || '',
      role: t.role || '',
      content: t.content || ''
    }));

    placeholders.push({
      id: 'TESTIMONIAL_LIST',
      label: 'Peer Validation (Testimonials)',
      currentValue: '',
      type: 'list',
      listItems,
      listSchema: [
        { key: 'name', label: 'Source Identity', type: 'text' },
        { key: 'role', label: 'Professional Role', type: 'text' },
        { key: 'content', label: 'Validation Statement', type: 'rich-text' }
      ],
      listItemTemplate: templates['TESTIMONIAL_LIST'] || `
        <div class="testimonial-item p-10 rounded-[40px] bg-slate-900/40 border border-white/5 relative group hover:border-teal-500/30 transition-all duration-500">
           <i class="fa-solid fa-quote-left text-teal-500/20 text-5xl absolute top-8 left-8 group-hover:text-teal-500/30 transition-colors"></i>
           <div class="relative z-10 pt-12">
             <p class="text-slate-300 text-lg leading-relaxed italic mb-8 font-medium">"{content}"</p>
             <div>
               <h4 class="text-white font-black uppercase tracking-tighter text-2xl">{name}</h4>
               <p class="text-teal-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">{role}</p>
             </div>
           </div>
        </div>
      `
    });
  }

  return placeholders;
}

export function transformPlaceholdersToStructuredContent(placeholders: any[]): any {
  const structuredContent: any = {};

  const getPlaceholderValue = (id: string) => {
    return placeholders.find(p => p.id === id);
  };

  const heroName = getPlaceholderValue('HERO_NAME');
  const heroTitle = getPlaceholderValue('HERO_TITLE');
  const heroValProp = getPlaceholderValue('HERO_VAL_PROP');
  const heroImg = getPlaceholderValue('HERO_IMG');

  if (heroName || heroTitle || heroValProp || heroImg) {
    const heroCtaText = getPlaceholderValue('HERO_CTA_TEXT');
    const heroCtaLink = getPlaceholderValue('HERO_CTA_LINK');
    structuredContent.hero = {
      name: heroName?.currentValue || '',
      title: heroTitle?.currentValue || '',
      bio: heroValProp?.currentValue || '',
      image: heroImg?.currentValue || '',
      ctaText: heroCtaText?.currentValue || 'Get in Touch',
      ctaLink: heroCtaLink?.currentValue || '#contact'
    };
  }

  // Section Titles
  const aboutTitle = getPlaceholderValue('ABOUT_TITLE');
  const skillsTitle = getPlaceholderValue('SKILLS_TITLE');
  const projTitle = getPlaceholderValue('PROJ_TITLE');
  const expTitle = getPlaceholderValue('EXP_TITLE');
  const testimonialTitle = getPlaceholderValue('TESTIMONIAL_TITLE');
  const contactTitle = getPlaceholderValue('CONTACT_TITLE');

  if (aboutTitle || skillsTitle || projTitle || expTitle || testimonialTitle || contactTitle) {
    structuredContent.sectionTitles = {
      about: aboutTitle?.currentValue || 'Professional Narrative',
      skills: skillsTitle?.currentValue || 'Neural Stack',
      projects: projTitle?.currentValue || 'Artifact Repository',
      experience: expTitle?.currentValue || 'Career Sequence',
      testimonials: testimonialTitle?.currentValue || 'Peer Validation',
      contact: contactTitle?.currentValue || 'Direct Handshake'
    };
  }

  // Summary is now part of HERO_VAL_PROP
  // const summary = getPlaceholderValue('SUMMARY_TEXT');
  // if (summary) {
  //   structuredContent.about = {
  //     summary: summary.currentValue
  //   };
  // }

  const skills = getPlaceholderValue('SKILLS_LIST');
  if (skills?.listItems) {
    structuredContent.skills = skills.listItems.map((s: any) => s.title);
  }

  const projects = getPlaceholderValue('PROJ_LIST');
  if (projects?.listItems) {
    structuredContent.projects = projects.listItems.map((p: any) => ({
      title: p.title,
      description: p.desc,
      technologies: p.technologies,
      link: p.live,
      image: p.img
    }));
  }

  const experience = getPlaceholderValue('EXP_LIST');
  if (experience?.listItems) {
    structuredContent.workHistory = experience.listItems.map((e: any) => ({
      company: e.company,
      position: e.role,
      period: e.date,
      description: e.desc
    }));
  }

  const email = getPlaceholderValue('EMAIL');
  const phone = getPlaceholderValue('PHONE');
  const location = getPlaceholderValue('LOCATION');

  if (email || phone || location) {
    structuredContent.contact = {
      email: email?.currentValue || '',
      phone: phone?.currentValue || '',
      location: location?.currentValue || ''
    };
  }

  const socials = getPlaceholderValue('SOCIAL_LIST');
  if (socials?.listItems) {
    structuredContent.socials = socials.listItems.map((s: any) => ({
      platform: s.name,
      url: s.url
    }));
  }

  const testimonials = getPlaceholderValue('TESTIMONIAL_LIST');
  if (testimonials?.listItems) {
    structuredContent.testimonials = testimonials.listItems.map((t: any) => ({
      name: t.name,
      role: t.role,
      content: t.content
    }));
  }

  return structuredContent;
}

function hasValue(value: any): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return cleanString(value) !== '';
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function textFromInputSources(prompt?: string, files?: any[]): string {
  const parts: string[] = [];
  if (typeof prompt === 'string' && prompt.trim()) parts.push(prompt.trim());
  if (Array.isArray(files)) {
    files.forEach((f: any) => {
      const content = typeof f?.content === 'string' ? f.content : (typeof f?.url === 'string' ? '' : '');
      if (content && content.trim()) parts.push(content.trim());
    });
  }
  return parts.join('\n\n');
}

function extractNameFromText(text: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const nameLike = lines.find((line) => {
    if (line.length < 3 || line.length > 60) return false;
    if (/@|https?:\/\/|www\.|objective|summary|experience|education|skills|projects|contact/i.test(line)) return false;
    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 4) return false;
    return words.every((w) => /^[A-Za-z][A-Za-z'.-]*$/.test(w));
  });
  return cleanString(nameLike, '');
}

function extractTitleFromText(text: string, name?: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const roleRegex = /(engineer|developer|designer|architect|manager|consultant|specialist|analyst|lead|director|founder|product|devops|sre|marketer|writer|photographer|creator)/i;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (name && line.toLowerCase() === name.toLowerCase()) {
      const next = lines[i + 1] || '';
      if (roleRegex.test(next) && next.length <= 120) return cleanString(next, '');
    }
    if (roleRegex.test(line) && line.length <= 120 && !/@|https?:\/\//i.test(line)) return cleanString(line, '');
  }
  return '';
}

function extractSummaryFromText(text: string): string {
  const normalized = text.replace(/\r/g, '');
  const headingMatch = normalized.match(/(?:^|\n)(summary|profile|about|objective)\s*:?\s*\n([\s\S]{40,500}?)(?:\n\s*\n|$)/i);
  if (headingMatch?.[2]) {
    return cleanString(headingMatch[2].replace(/\n+/g, ' ').trim(), '');
  }

  const sentences = normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 60 && !/@|https?:\/\//i.test(line));
  return cleanString(sentences[0] || '', '');
}

function extractSkillsFromText(text: string): string[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const skills: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^skills\s*:?\s*$/i.test(line) && lines[i + 1]) {
      lines[i + 1].split(/,|\||•|·/).forEach((token) => {
        const s = cleanString(token, '');
        if (s && s.length <= 30) skills.push(s);
      });
    }
    if (/^(skills|tech stack|technologies)\s*:/i.test(line)) {
      line.replace(/^(skills|tech stack|technologies)\s*:/i, '').split(/,|\||•|·/).forEach((token) => {
        const s = cleanString(token, '');
        if (s && s.length <= 30) skills.push(s);
      });
    }
  }
  return Array.from(new Set(skills)).slice(0, 24);
}

function extractProfileFromRawInput(prompt?: string, files?: any[]) {
  const text = textFromInputSources(prompt, files);
  if (!text) return null;

  const name = extractNameFromText(text);
  const title = extractTitleFromText(text, name);
  const bio = extractSummaryFromText(text);
  const email = cleanString(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0], '');
  const phone = cleanString(text.match(/(?:\+\d{1,3}\s*)?(?:\(?\d{2,4}\)?[\s.-]*)?\d{3,4}[\s.-]*\d{3,4}/)?.[0], '');
  const linkedin = cleanString(text.match(/https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[^\s)]+/i)?.[0], '');
  const github = cleanString(text.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i)?.[0], '');
  const skills = extractSkillsFromText(text);

  const socials: any[] = [];
  if (linkedin) socials.push({ platform: 'LinkedIn', url: linkedin });
  if (github) socials.push({ platform: 'GitHub', url: github });

  return {
    hero: {
      name,
      title,
      bio,
      ctaText: 'Get in Touch',
      ctaLink: '#contact'
    },
    contact: {
      email,
      phone
    },
    socials,
    skills
  };
}

function mergeDefined(base: any, updates: any): any {
  if (!hasValue(updates)) return base;
  if (Array.isArray(base) || Array.isArray(updates)) {
    return hasValue(updates) ? updates : base;
  }
  if (typeof base === 'object' && base !== null && typeof updates === 'object' && updates !== null) {
    const out: Record<string, any> = { ...base };
    Object.entries(updates).forEach(([k, v]) => {
      out[k] = mergeDefined(base?.[k], v);
    });
    return out;
  }
  return updates;
}

function extractProfileFromManifest(manifest: any) {
  const profile: any = {
    hero: {},
    about: {},
    skills: [] as string[],
    projects: [] as any[],
    experience: [] as any[],
    testimonials: [] as any[],
    contact: {},
    socials: [] as any[],
    stats: [] as any[],
    services: [] as any[],
    pricing: [] as any[],
    faq: [] as any[],
    process: [] as any[],
    cta: {}
  };

  const sections = Array.isArray(manifest?.sections) ? manifest.sections : [];
  sections.forEach((section: any) => {
    const type = cleanString(section?.type).toLowerCase();
    const c = normalizeSectionContent(section?.componentId || '', section?.content || {});

    if (type === 'hero') {
      profile.hero = {
        name: cleanString(c.name || c.username),
        title: cleanString(c.title || c.statusTag),
        bio: cleanString(c.bio || c.heroTagline || c.description),
        image: cleanString(c.image || c.avatarImage || c.profileImage),
        ctaText: cleanString(c?.cta?.text || c.ctaText),
        ctaLink: sanitizeHref(c?.cta?.link || c.ctaLink, '#contact')
      };
    }
    if (type === 'about') {
      profile.about = {
        title: cleanString(c.title),
        content: cleanString(c.content || c.description || c.bio)
      };
    }
    if (type === 'skills') {
      const raw = c.skills || c.items || c.tags || [];
      if (Array.isArray(raw)) {
        raw.forEach((s: any) => {
          if (typeof s === 'string') {
            const val = cleanString(s);
            if (val) profile.skills.push(val);
          } else if (s && typeof s === 'object') {
            if (Array.isArray(s.items)) {
              s.items.forEach((item: any) => {
                const val = cleanString(item?.name || item?.title || item);
                if (val) profile.skills.push(val);
              });
            } else {
              const val = cleanString(s.name || s.title || s.label);
              if (val) profile.skills.push(val);
            }
          }
        });
      }
    }
    if (type === 'projects') {
      const items = Array.isArray(c.items) ? c.items : (Array.isArray(c.projects) ? c.projects : []);
      profile.projects.push(...items.map((p: any) => ({
        title: cleanString(p.title),
        description: cleanString(p.description || p.desc),
        technologies: Array.isArray(p.tech) ? p.tech.join(', ') : cleanString(p.technologies || p.tech),
        image: cleanString(p.image || p.img),
        link: sanitizeHref(p.link || p.url, '#')
      })).filter((p: any) => hasValue(p.title) || hasValue(p.description)));
    }
    if (type === 'experience') {
      const items = Array.isArray(c.items) ? c.items : (Array.isArray(c.experiences) ? c.experiences : []);
      profile.experience.push(...items.map((e: any) => ({
        role: cleanString(e.role || e.position || e.title),
        company: cleanString(e.company),
        period: cleanString(e.period || e.date || e.duration),
        description: cleanString(e.description || e.desc)
      })).filter((e: any) => hasValue(e.role) || hasValue(e.company)));
    }
    if (type === 'testimonials') {
      const items = Array.isArray(c.items) ? c.items : (Array.isArray(c.testimonials) ? c.testimonials : []);
      profile.testimonials.push(...items.map((t: any) => ({
        name: cleanString(t.name || t.author),
        role: cleanString(t.role || t.title),
        content: cleanString(t.content || t.text || t.quote)
      })).filter((t: any) => hasValue(t.content)));
    }
    if (type === 'stats') {
      const stats = Array.isArray(c.stats) ? c.stats : [];
      profile.stats.push(...stats.map((s: any) => ({
        label: cleanString(s.label || s.title),
        value: cleanString(s.value || s.count),
        description: cleanString(s.description || s.desc)
      })).filter((s: any) => hasValue(s.label) || hasValue(s.value)));
    }
    if (type === 'services') {
      const items = Array.isArray(c.items) ? c.items : (Array.isArray(c.services) ? c.services : []);
      profile.services.push(...items.map((s: any) => ({
        title: cleanString(s.title || s.name),
        description: cleanString(s.description || s.desc)
      })).filter((s: any) => hasValue(s.title)));
    }
    if (type === 'pricing') {
      const items = Array.isArray(c.items) ? c.items : (Array.isArray(c.plans) ? c.plans : []);
      profile.pricing.push(...items.map((p: any) => ({
        name: cleanString(p.name || p.title),
        price: cleanString(p.price || p.amount),
        features: Array.isArray(p.features) ? p.features : []
      })).filter((p: any) => hasValue(p.name)));
    }
    if (type === 'faq') {
      const items = Array.isArray(c.items) ? c.items : [];
      profile.faq.push(...items.map((f: any) => ({
        question: cleanString(f.question || f.title),
        answer: cleanString(f.answer || f.content || f.description)
      })).filter((f: any) => hasValue(f.question)));
    }
    if (type === 'process') {
      const steps = Array.isArray(c.steps) ? c.steps : (Array.isArray(c.items) ? c.items : []);
      profile.process.push(...steps.map((s: any) => ({
        title: cleanString(s.title || s.name),
        description: cleanString(s.description || s.desc)
      })).filter((s: any) => hasValue(s.title)));
    }
    if (type === 'cta') {
      profile.cta = {
        title: cleanString(c.title || c.heading),
        description: cleanString(c.description || c.desc),
        buttonText: cleanString(c.buttonText || c?.cta?.text || c.ctaText),
        buttonLink: sanitizeHref(c.buttonLink || c?.cta?.link || c.ctaLink, '#contact')
      };
    }
    if (type === 'contact') {
      profile.contact = {
        title: cleanString(c.title),
        email: cleanString(c.email),
        phone: cleanString(c.phone),
        location: cleanString(c.location)
      };
      const socials = Array.isArray(c.socials) ? c.socials : [];
      profile.socials.push(...socials.map((s: any) => ({
        platform: cleanString(s.platform || s.name),
        url: sanitizeHref(s.url || s.link, '#')
      })).filter((s: any) => hasValue(s.platform)));
    }
  });

  // Deduplicate skills while preserving order.
  profile.skills = Array.from(new Set(profile.skills));
  return profile;
}

function scoreTemplateForProfile(templateManifest: any, profile: any, targetNiche?: string): number {
  const sections = Array.isArray(templateManifest?.sections) ? templateManifest.sections : [];
  if (sections.length === 0) return -1;

  const sectionTypes = new Set(sections.map((s: any) => cleanString(s?.type).toLowerCase()).filter(Boolean));
  let score = 0;

  if (targetNiche && cleanString(templateManifest?.metadata?.niche).toLowerCase().includes(cleanString(targetNiche).toLowerCase())) {
    score += 40;
  }
  if (profile?.projects?.length && sectionTypes.has('projects')) score += 20;
  if (profile?.experience?.length && sectionTypes.has('experience')) score += 15;
  if (profile?.skills?.length && sectionTypes.has('skills')) score += 15;
  if (hasValue(profile?.about?.content) && sectionTypes.has('about')) score += 10;
  if (hasValue(profile?.contact?.email) && sectionTypes.has('contact')) score += 10;
  if (hasValue(profile?.hero?.name) && sectionTypes.has('hero')) score += 10;

  return score + Math.min(sections.length, 12);
}

function pickTemplateManifestForProfile(input: {
  selectedTemplateManifest?: any;
  templateCandidates?: Array<{ id: string; niche?: string; structuredContent?: any }>;
  profile: any;
  targetNiche?: string;
  selectionSeed?: string;
}): any | null {
  const selected = input.selectedTemplateManifest;
  if (selected?.sections?.length) {
    return selected;
  }

  const candidates = (input.templateCandidates || [])
    .map((t) => t.structuredContent)
    .filter((sc: any) => sc?.sections?.length);
  if (candidates.length === 0) return null;

  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: scoreTemplateForProfile(candidate, input.profile, input.targetNiche)
    }))
    .sort((a, b) => b.score - a.score);

  const bestScore = ranked[0]?.score ?? -1;
  // Keep quality high but allow more stylistic variation across good fits.
  const topBand = ranked.filter((x) => x.score >= bestScore - 12).slice(0, 8);
  if (topBand.length <= 1) return topBand[0]?.candidate || candidates[0];

  const seed = cleanString(input.selectionSeed, JSON.stringify(input.profile));
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % topBand.length;
  return topBand[index].candidate;
}

function mapSkillsIntoTemplate(templateSkills: any, incoming: string[]): any {
  if (!Array.isArray(templateSkills) || incoming.length === 0) return templateSkills;
  const first = templateSkills[0];
  if (typeof first === 'string') {
    return incoming;
  }
  if (first && typeof first === 'object' && Array.isArray(first.items)) {
    const buckets = templateSkills.length || 1;
    const chunkSize = Math.ceil(incoming.length / buckets);
    return templateSkills.map((bucket: any, idx: number) => ({
      ...bucket,
      items: incoming.slice(idx * chunkSize, (idx + 1) * chunkSize)
    }));
  }
  return incoming.map((name) => ({ ...(first || {}), name }));
}

function fillSectionContent(type: string, baseContent: any, profile: any): any {
  const content = { ...(baseContent || {}) };

  if (type === 'header') {
    const updates: any = {};
    if (hasValue(profile?.hero?.name)) {
      updates.username = profile.hero.name;
      updates.name = profile.hero.name;
    }
    return mergeDefined(content, updates);
  }

  if (type === 'hero') {
    const updates: any = {
      name: profile?.hero?.name,
      title: profile?.hero?.title,
      bio: profile?.hero?.bio,
      heroTagline: profile?.hero?.bio,
      image: profile?.hero?.image,
      avatarImage: profile?.hero?.image,
      cta: {
        ...(content?.cta || {}),
        text: profile?.hero?.ctaText,
        link: profile?.hero?.ctaLink
      }
    };
    return mergeDefined(content, updates);
  }

  if (type === 'about') {
    return mergeDefined(content, {
      title: profile?.about?.title,
      content: profile?.about?.content
    });
  }

  if (type === 'skills') {
    const mappedSkills = mapSkillsIntoTemplate(content.skills || content.items, profile?.skills || []);
    const updates: any = {};
    if (Array.isArray(content.skills)) updates.skills = mappedSkills;
    if (Array.isArray(content.items)) updates.items = mappedSkills;
    return mergeDefined(content, updates);
  }

  if (type === 'projects' && profile?.projects?.length) {
    const baseItems = Array.isArray(content.items) ? content.items : (Array.isArray(content.projects) ? content.projects : []);
    const example = (baseItems[0] && typeof baseItems[0] === 'object') ? baseItems[0] : {};
    const items = profile.projects.map((p: any) => ({
      ...example,
      title: p.title || example.title,
      description: p.description || example.description || example.desc,
      desc: p.description || example.desc,
      technologies: p.technologies || example.technologies,
      tech: p.technologies || example.tech,
      image: p.image || example.image || example.img,
      img: p.image || example.img,
      link: p.link || example.link || '#'
    }));
    if (Array.isArray(content.items)) return { ...content, items };
    if (Array.isArray(content.projects)) return { ...content, projects: items };
  }

  if (type === 'experience' && profile?.experience?.length) {
    const baseItems = Array.isArray(content.items) ? content.items : (Array.isArray(content.experiences) ? content.experiences : []);
    const example = (baseItems[0] && typeof baseItems[0] === 'object') ? baseItems[0] : {};
    const items = profile.experience.map((e: any) => ({
      ...example,
      role: e.role || example.role || example.position,
      title: e.role || example.title,
      company: e.company || example.company,
      period: e.period || example.period || example.date,
      date: e.period || example.date,
      description: e.description || example.description || example.desc,
      desc: e.description || example.desc
    }));
    if (Array.isArray(content.items)) return { ...content, items };
    if (Array.isArray(content.experiences)) return { ...content, experiences: items };
  }

  if (type === 'stats' && profile?.stats?.length) {
    const baseItems = Array.isArray(content.stats) ? content.stats : (Array.isArray(content.items) ? content.items : []);
    const example = (baseItems[0] && typeof baseItems[0] === 'object') ? baseItems[0] : {};
    const stats = profile.stats.map((s: any) => ({
      ...example,
      label: s.label || example.label || example.title,
      title: s.label || example.title,
      value: s.value || example.value || example.count,
      description: s.description || example.description || example.desc
    }));
    if (Array.isArray(content.stats)) return { ...content, stats };
    if (Array.isArray(content.items)) return { ...content, items: stats };
  }

  if (type === 'services' && profile?.services?.length) {
    const baseItems = Array.isArray(content.items) ? content.items : (Array.isArray(content.services) ? content.services : []);
    const example = (baseItems[0] && typeof baseItems[0] === 'object') ? baseItems[0] : {};
    const items = profile.services.map((s: any) => ({
      ...example,
      title: s.title || example.title || example.name,
      name: s.title || example.name,
      description: s.description || example.description || example.desc,
      desc: s.description || example.desc
    }));
    if (Array.isArray(content.items)) return { ...content, items };
    if (Array.isArray(content.services)) return { ...content, services: items };
  }

  if (type === 'pricing' && profile?.pricing?.length) {
    const baseItems = Array.isArray(content.items) ? content.items : (Array.isArray(content.plans) ? content.plans : []);
    const example = (baseItems[0] && typeof baseItems[0] === 'object') ? baseItems[0] : {};
    const items = profile.pricing.map((p: any) => ({
      ...example,
      name: p.name || example.name || example.title,
      title: p.name || example.title,
      price: p.price || example.price || example.amount,
      features: Array.isArray(p.features) && p.features.length > 0 ? p.features : (Array.isArray(example.features) ? example.features : [])
    }));
    if (Array.isArray(content.items)) return { ...content, items };
    if (Array.isArray(content.plans)) return { ...content, plans: items };
  }

  if (type === 'faq' && profile?.faq?.length) {
    const baseItems = Array.isArray(content.items) ? content.items : [];
    const example = (baseItems[0] && typeof baseItems[0] === 'object') ? baseItems[0] : {};
    const items = profile.faq.map((f: any) => ({
      ...example,
      question: f.question || example.question || example.title,
      answer: f.answer || example.answer || example.content || example.description
    }));
    if (Array.isArray(content.items)) return { ...content, items };
  }

  if (type === 'process' && profile?.process?.length) {
    const baseItems = Array.isArray(content.steps) ? content.steps : (Array.isArray(content.items) ? content.items : []);
    const example = (baseItems[0] && typeof baseItems[0] === 'object') ? baseItems[0] : {};
    const steps = profile.process.map((s: any) => ({
      ...example,
      title: s.title || example.title || example.name,
      name: s.title || example.name,
      description: s.description || example.description || example.desc,
      desc: s.description || example.desc
    }));
    if (Array.isArray(content.steps)) return { ...content, steps };
    if (Array.isArray(content.items)) return { ...content, items: steps };
  }

  if (type === 'cta') {
    const defaultText = profile?.hero?.ctaText || profile?.cta?.buttonText || content?.buttonText || content?.cta?.text || content?.ctaText;
    const defaultLink = profile?.hero?.ctaLink || profile?.cta?.buttonLink || content?.buttonLink || content?.cta?.link || content?.ctaLink || '#contact';
    const updates: any = {
      title: profile?.cta?.title || content?.title,
      description: profile?.cta?.description || content?.description,
      buttonText: defaultText,
      ctaText: defaultText,
      buttonLink: defaultLink,
      ctaLink: defaultLink,
      cta: {
        ...(content?.cta || {}),
        text: defaultText,
        link: defaultLink
      }
    };
    return mergeDefined(content, updates);
  }

  if (type === 'testimonials' && profile?.testimonials?.length) {
    const baseItems = Array.isArray(content.items) ? content.items : (Array.isArray(content.testimonials) ? content.testimonials : []);
    const example = (baseItems[0] && typeof baseItems[0] === 'object') ? baseItems[0] : {};
    const items = profile.testimonials.map((t: any) => ({
      ...example,
      name: t.name || example.name || example.author,
      author: t.name || example.author,
      role: t.role || example.role,
      content: t.content || example.content || example.text,
      text: t.content || example.text,
      quote: t.content || example.quote
    }));
    if (Array.isArray(content.items)) return { ...content, items };
    if (Array.isArray(content.testimonials)) return { ...content, testimonials: items };
  }

  if (type === 'contact') {
    const updates: any = {
      title: profile?.contact?.title,
      email: profile?.contact?.email,
      phone: profile?.contact?.phone,
      location: profile?.contact?.location
    };
    if (Array.isArray(content.socials) && profile?.socials?.length) {
      updates.socials = profile.socials;
    }
    return mergeDefined(content, updates);
  }

  if (type === 'footer') {
    const updates: any = {};
    if (hasValue(profile?.hero?.name)) updates.footerHeading = profile.hero.name;
    if (hasValue(profile?.contact?.email)) {
      updates.footerEmail = profile.contact.email;
      updates.email = profile.contact.email;
    }
    if (hasValue(profile?.hero?.name)) {
      updates.name = profile.hero.name;
      updates.logoText = profile.hero.name;
      updates.brand = profile.hero.name;
    }
    if (Array.isArray(content.socials) && profile?.socials?.length) {
      updates.socials = profile.socials.map((s: any) => ({
        platform: s.platform,
        name: s.platform,
        link: s.url,
        url: s.url
      }));
    }
    return mergeDefined(content, updates);
  }

  return content;
}

function isLikelyImageFieldKey(key: string): boolean {
  return /(image|img|photo|avatar|logo|icon|thumbnail|thumb|cover|banner|background|src|media|portrait)/i.test(key);
}

function normalizePlaceholderImageValue(value: any): string {
  const current = cleanString(value, '');
  if (!current) return '/placeholder.svg';
  const lower = current.toLowerCase();
  if (lower.includes('via.placeholder.com') || lower.includes('placehold.co') || lower.includes('placeholder.com')) {
    return '/placeholder.svg';
  }
  return current;
}

function applyImagePlaceholderDeep(value: any, parentKey: string = ''): any {
  if (Array.isArray(value)) {
    return value.map((item) => applyImagePlaceholderDeep(item, parentKey));
  }

  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    Object.entries(value).forEach(([key, raw]) => {
      if (isLikelyImageFieldKey(key)) {
        out[key] = normalizePlaceholderImageValue(raw);
      } else {
        out[key] = applyImagePlaceholderDeep(raw, key);
      }
    });
    return out;
  }

  if (isLikelyImageFieldKey(parentKey)) {
    return normalizePlaceholderImageValue(value);
  }

  return value;
}

function materializeTemplateWithProfile(templateManifest: any, profile: any, niche: string): any {
  const cloned = JSON.parse(JSON.stringify(templateManifest || {}));
  const sections = Array.isArray(cloned?.sections) ? cloned.sections : [];
  const filledSections = sections.map((section: any) => {
    const type = cleanString(section?.type).toLowerCase();
    const filledContent = fillSectionContent(type, section?.content || {}, profile);
    return {
      ...section,
      // Initial-build policy: all missing image-like fields resolve to a valid placeholder.
      content: applyImagePlaceholderDeep(filledContent)
    };
  });

  const manifest = {
    ...cloned,
    metadata: {
      ...(cloned?.metadata || {}),
      version: '1.0',
      niche: niche || cloned?.metadata?.niche || 'General',
      generatedAt: new Date().toISOString()
    },
    sections: normalizeManifestSections(filledSections)
  };

  return ensureManifestDefaults(manifest);
}

export function normalizeToManifest(flatContent: any, layout: string = 'MODERN_VERTICAL'): any {
  // If already in Manifest format with sections, return as-is
  if (flatContent?.sections && Array.isArray(flatContent.sections)) {
    return ensureManifestDefaults({
      ...flatContent,
      sections: normalizeManifestSections(flatContent.sections)
    });
  }

  const sections: any[] = [];

  // Map Hero
  if (flatContent.hero) {
    sections.push({
      id: 'hero-1',
      type: 'hero',
      componentId: layout === 'SIDEBAR_NAVI' ? 'HERO_SIDEBAR' : 'HERO_MODERN_SPLIT',
      content: flatContent.hero,
      settings: { isVisible: true, padding: 'medium' }
    });
  }

  // Map About
  if (flatContent.about) {
    sections.push({
      id: 'about-1',
      type: 'about',
      componentId: 'ABOUT_NARRATIVE',
      content: {
        title: flatContent.sectionTitles?.about || 'Professional Narrative',
        content: flatContent.about.summary
      },
      settings: { isVisible: true, padding: 'medium' }
    });
  }

  // Map Skills
  if (flatContent.skills && flatContent.skills.length > 0) {
    sections.push({
      id: 'skills-1',
      type: 'skills',
      componentId: 'SKILLS_MARQUEE',
      content: {
        title: flatContent.sectionTitles?.skills || 'Neural Stack',
        skills: flatContent.skills
      },
      settings: { isVisible: true, padding: 'medium' }
    });
  }

  // Map Projects
  if (flatContent.projects && flatContent.projects.length > 0) {
    sections.push({
      id: 'projects-1',
      type: 'projects',
      componentId: 'PROJ_MINIMAL_CARDS',
      content: {
        title: flatContent.sectionTitles?.projects || 'Selected Works',
        items: flatContent.projects.map((p: any) => ({
          title: p.title,
          description: p.description,
          image: p.image,
          link: p.link,
          tech: p.technologies ? p.technologies.split(',').map((t: string) => t.trim()) : []
        }))
      },
      settings: { isVisible: true, padding: 'medium' }
    });
  }

  // Map Experience
  if (flatContent.workHistory && flatContent.workHistory.length > 0) {
    sections.push({
      id: 'exp-1',
      type: 'experience',
      componentId: 'EXP_TIMELINE_VERTICAL',
      content: {
        title: flatContent.sectionTitles?.experience || 'Professional Timeline',
        items: flatContent.workHistory.map((w: any) => ({
          role: w.position,
          company: w.company,
          period: w.period,
          description: w.description
        }))
      },
      settings: { isVisible: true, padding: 'medium' }
    });
  }

  // Map Contact
  if (flatContent.contact) {
    sections.push({
      id: 'contact-1',
      type: 'contact',
      componentId: 'CONTACT_SPLIT',
      content: {
        title: flatContent.sectionTitles?.contact || "Let's Connect",
        email: flatContent.contact.email,
        phone: flatContent.contact.phone,
        location: flatContent.contact.location
      },
      settings: { isVisible: true, padding: 'medium' }
    });
  }

  return {
    metadata: {
      version: '1.0',
      niche: 'General',
      generatedAt: new Date().toISOString()
    },
    globalConfig: {
      theme: 'dark',
      colorPalette: {
        primary: '#00f2ff',
        secondary: '#00d1ff',
        background: '#020617',
        surface: '#0f172a',
        text: '#94a3b8',
        heading: '#ffffff'
      },
      typography: {
        headingFont: 'Space Grotesk',
        bodyFont: 'Inter',
        monoFont: 'JetBrains Mono'
      }
    },
    sections: normalizeManifestSections(sections)
  };
}

function ensureManifestDefaults(manifest: any): any {
  const fallback = {
    metadata: {
      version: '1.0',
      niche: 'General',
      generatedAt: new Date().toISOString()
    },
    globalConfig: {
      theme: 'dark',
      colorPalette: {
        primary: '#00f2ff',
        secondary: '#00d1ff',
        background: '#020617',
        surface: '#0f172a',
        text: '#94a3b8',
        heading: '#ffffff'
      },
      typography: {
        headingFont: 'Space Grotesk',
        bodyFont: 'Inter',
        monoFont: 'JetBrains Mono'
      }
    }
  };

  const merged = {
    ...manifest,
    metadata: {
      ...fallback.metadata,
      ...(manifest?.metadata || {})
    },
    globalConfig: {
      ...fallback.globalConfig,
      ...(manifest?.globalConfig || {}),
      colorPalette: {
        ...fallback.globalConfig.colorPalette,
        ...(manifest?.globalConfig?.colorPalette || {})
      },
      typography: {
        ...fallback.globalConfig.typography,
        ...(manifest?.globalConfig?.typography || {})
      }
    }
  };

  // Prevent empty-string theme values from breaking CSS variables and scheme resolution.
  if (!merged.globalConfig?.theme || !String(merged.globalConfig.theme).trim()) {
    merged.globalConfig.theme = fallback.globalConfig.theme;
  }

  return merged;
}

