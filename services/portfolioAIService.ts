import { aiService } from './apiService';
import { PortfolioData } from '../types';
import { renderManifest } from '../utils/renderer';

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

export async function generatePortfolio(input: { type: string, value: string, baseHtml?: string, files?: any[], sessionId?: string, portfolioId?: string }) {
  try {
    const response = await aiService.generatePortfolio({
      value: input.value,
      template: input.baseHtml,
      files: input.files,
      sessionId: input.sessionId,
      portfolioId: input.portfolioId
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
      const normalizedSections = structuredContent.sections.map((section: any) => ({
        id: section.id,
        type: section.type || inferTypeFromComponentId(section.componentId || section.component),
        componentId: section.componentId || section.component,
        content: normalizeSectionContent(section.componentId || section.component, section.content || section.props || section.data),
        settings: section.settings || { isVisible: true, padding: 'medium' },
        template: section.template
      }));

      sc = {
        ...structuredContent,
        sections: normalizedSections,
        metadata: structuredContent.metadata || { version: '1.0', niche: 'General', generatedAt: new Date().toISOString() }
      };
     
    } else {
      // Flat content format, needs normalization
      sc = normalizeToManifest(structuredContent, 'MODERN_VERTICAL');
    
    }

    // Generate HTML from structured content if not provided by AI
    if ((!html || html.length < 100) && sc) {
   
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
    // After content is edited, we regenerate the code
    const finalCode = await aiService.generateCode(updatedStructuredContent, currentData.id);

    // Normalize sections and ensure metadata is preserved
    const normalizedSections = (updatedStructuredContent.sections || []).map((section: any) => ({
      ...section,
      type: section.type || inferTypeFromComponentId(section.componentId || section.component),
      componentId: section.componentId || section.component,
      content: normalizeSectionContent(section.componentId || section.component, section.content || section.props || section.data),
      settings: section.settings || { isVisible: true, padding: 'medium' }
    }));

    // CRITICAL: If the AI returned a Manifest structure, we keep it but ensure sections are normalized
    const sc = {
      ...updatedStructuredContent,
      sections: normalizedSections,
      metadata: updatedStructuredContent.metadata || currentData.structuredContent?.metadata || {
        version: '1.0',
        generatedAt: new Date().toISOString()
      }
    };

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
     
      structuredContent.sections = structuredContent.sections.map((section: any) => {
        const originalSection = currentData.structuredContent.sections.find((s: any) => s.type === section.type);
        if (originalSection) {
          return {
            ...section,
            content: originalSection.content // Restore original content fields
          };
        }
        return section;
      });
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

// Normalizes content fields to match what Registry components expect
function normalizeSectionContent(componentId: string, content: any): any {
  if (!content) return {};
  const id = componentId ? componentId.toUpperCase() : '';

  // HERO normalization
  if (id.startsWith('HERO')) {
    return {
      name: content.name || content.title || content.userName || '',
      title: content.title || content.subtitle || content.role || content.tagline || '',
      bio: content.bio || content.description || content.summary || '',
      image: content.image || content.backgroundImage || content.profileImage || '',
      greeting: content.greeting || content.hello || 'Hello, I am',
      highlights: Array.isArray(content.highlights) ? content.highlights : [],
      cta: content.cta || {
        text: content.primaryCta?.label || content.ctaText || 'Explore Work',
        link: content.primaryCta?.link || content.ctaLink || '#projects'
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
      title: content.title || content.heading || "Let's Connect",
      email: content.email || '',
      phone: content.phone || '',
      location: content.location || '',
      socials: Array.isArray(socials) ? socials.map((s: any) => ({
        platform: s.platform || s.name || 'Platform',
        link: s.link || s.url || '#'
      })) : [],
      ...content
    };
  }

  // STATS normalization
  if (id.startsWith('STATS')) {
    const items = content.stats || content.items || [];
    return {
      title: content.title || content.heading || 'Impact',
      stats: Array.isArray(items) ? items.map((s: any) => ({
        label: s.label || s.title || '',
        value: s.value || s.count || '0'
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

  return content;
}

// Infer section type from component ID (e.g., HERO_CYBER_MONO → hero)
function inferTypeFromComponentId(componentId: string): string {
  if (!componentId) return 'unknown';
  const id = componentId.toUpperCase();
  if (id.startsWith('HERO')) return 'hero';
  if (id.startsWith('ABOUT')) return 'about';
  if (id.startsWith('PROJ')) return 'projects';
  if (id.startsWith('EXP')) return 'experience';
  if (id.startsWith('SKILL')) return 'skills';
  if (id.startsWith('CONTACT')) return 'contact';
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

export function normalizeToManifest(flatContent: any, layout: string = 'MODERN_VERTICAL'): any {
  // If already in Manifest format with sections, return as-is
  if (flatContent?.sections && Array.isArray(flatContent.sections)) return flatContent;

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
    sections
  };
}
