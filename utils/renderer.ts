
import { Manifest, ManifestSection } from '../types';
import { Registry } from '../registry';
import { DESIGN_SCHEMES } from '../registry/schemes';

/**
 * Production-grade Template Engine
 * Renders HTML by replacing {{key}} placeholders, handling loops (#each) and conditionals (#if).
 */
const renderGenerativeTemplate = (template: string, content: any): string => {
  let rendered = template.replace(/```[a-z]*\n([\s\S]*?)\n```/gi, '$1').replace(/```/g, '').trim();

  const handleLoop = (input: string, context: any): string => {
    let result = '';
    let pos = 0;
    const openRegex = /{{#each\s+([\w.]+)\s*}}/g;

    while (pos < input.length) {
      openRegex.lastIndex = pos;
      const match = openRegex.exec(input);
      if (!match) {
        result += input.substring(pos);
        break;
      }

      const startMatch = match.index;
      result += input.substring(pos, startMatch);

      const arrayPath = match[1];
      const openingTag = match[0];
      const openTagEnd = startMatch + openingTag.length;

      // Find the balanced closing tag: {{/each}} (allowing spaces like {{ /each }})
      let depth = 1;
      let searchPos = openTagEnd;
      let closeMatchIndex = -1;
      let closeTagLength = 0;

      const innerTagRegex = /{{#each\s+[\w.]+\s*}}|{{\s*\/each\s*}}/g;
      innerTagRegex.lastIndex = searchPos;

      let innerMatch;
      while ((innerMatch = innerTagRegex.exec(input)) !== null) {
        if (innerMatch[0].startsWith('{{#each')) {
          depth++;
        } else {
          depth--;
          if (depth === 0) {
            closeMatchIndex = innerMatch.index;
            closeTagLength = innerMatch[0].length;
            break;
          }
        }
      }

      if (closeMatchIndex !== -1 && arrayPath) {
        const blockContent = input.substring(openTagEnd, closeMatchIndex);
        const array = getValueByPath(context, arrayPath);

        if (Array.isArray(array)) {
          result += array.map((item, index) => {
            const itemContext = typeof item === 'object' && item !== null
              ? { ...item, this: item, parent: context, '@index': index + 1 }
              : { this: item, parent: context, '@index': index + 1 };
            return renderGenerativeTemplate(blockContent, itemContext);
          }).join('');
        }
        pos = closeMatchIndex + closeTagLength;
      } else {
        // Unbalanced or no path: just append the opening tag and continue
        result += openingTag;
        pos = openTagEnd;
      }
    }
    return result;
  };

  rendered = handleLoop(rendered, content);

  // 2. Handle Conditionals: {{#if field}}...{{/if}} - allowing whitespace
  const ifRegex = /{{#if\s+([\w.]+)\s*}}([\s\S]*?){{\s*\/if\s*}}/g;
  rendered = rendered.replace(ifRegex, (_, path, blockContent) => {
    const value = getValueByPath(content, path);
    return value ? renderGenerativeTemplate(blockContent, content) : '';
  });

  // 3. Handle HTML Value Replacements: {{{key}}}
  const htmlRegex = /{{{\s*([\w.\s]+)\s*}}}/g;
  rendered = rendered.replace(htmlRegex, (_, path) => {
    const value = getValueByPath(content, path.trim());
    return value === undefined || value === null ? '' : String(value);
  });

  // 4. Handle Simple Value Replacements: {{key}}
  const valueRegex = /{{\s*([\w.@\s]+)\s*}}/g;
  rendered = rendered.replace(valueRegex, (_, path) => {
    const cleanPath = path.trim();
    const value = getValueByPath(content, cleanPath);

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) return value.join(', ');
      return value.text || value.label || value.value || JSON.stringify(value);
    }

    return value === undefined || value === null ? '' : String(value);
  });

  return rendered;
};

/**
 * Utility to fetch nested values from an object using a dot-notation path
 */
const getValueByPath = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;
  if (path === 'this') {
    return (typeof obj === 'object' && obj !== null && 'this' in obj) ? obj.this : obj;
  }
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const renderManifest = (manifest: Manifest, showBranding: boolean = false): string => {
  const { sections, metadata } = manifest;

  // 1. Resolve Global Config & Design Scheme
  const userConfig: any = manifest.globalConfig || {};
  const schemeId = userConfig.theme || 'dark';
  const scheme = DESIGN_SCHEMES[schemeId] || {
    id: 'DEFAULT',
    theme: schemeId === 'light' ? 'light' : 'dark',
    palette: userConfig.colorPalette || {
      primary: '#00f2ff',
      secondary: '#00d1ff',
      background: schemeId === 'light' ? '#f8fafc' : '#020617',
      surface: schemeId === 'light' ? '#ffffff' : '#0f172a',
      text: schemeId === 'light' ? '#334155' : '#94a3b8',
      heading: schemeId === 'light' ? '#0f172a' : '#ffffff'
    },
    typography: userConfig.typography || {
      headingFont: 'Space Grotesk',
      bodyFont: 'Inter',
      monoFont: 'JetBrains Mono'
    }
  };

  const { palette: colorPalette, typography, theme } = scheme;

  //  Generate CSS Variables for Theming
  const cssVariables = `
    :root {
      --primary: ${colorPalette.primary};
      --secondary: ${colorPalette.secondary};
      --bg: ${colorPalette.background};
      --surface: ${colorPalette.surface};
      --text: ${colorPalette.text};
      --heading: ${colorPalette.heading};
    }
    
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: '${typography.bodyFont}', sans-serif;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: '${typography.headingFont}', serif;
      color: var(--heading);
    }
    
    .font-mono {
      font-family: '${typography.monoFont}', monospace;
    }
    
    /* Utility for smooth scrolling */
    html {
      scroll-behavior: smooth;
    }
    
    /* Animations */
    .slide-up {
      animation: slideUp 0.8s ease-out forwards;
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  // Generate Google Fonts Links
  const fontFamilies = [typography.headingFont, typography.bodyFont, typography.monoFont]
    .filter(Boolean)
    .map(f => f.replace(/\s+/g, '+'))
    .join('&family=');

  const fontsLink = fontFamilies
    ? `<link href="https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap" rel="stylesheet">`
    : '';

  //  Assemble Sections
  const typeCounters: Record<string, number> = {};
  const renderedSections = sections
    .filter(s => s.settings?.isVisible !== false)
    .map((section: ManifestSection) => {
      // Ensure section ID exists for navigation
      if (!section.id) {
        const type = section.type || 'section';
        typeCounters[type] = (typeCounters[type] || 0) + 1;
        section.id = type === 'section' ? `section-${typeCounters[type]}` : type;
        if (typeCounters[type] > 1) section.id += `-${typeCounters[type]}`;
      }

      // Check for Generative Template (Custom AI View)
      if (section.template) {
        try {
          const html = renderGenerativeTemplate(section.template, section.content);
          const paddingClass = section.settings?.padding === 'large' ? 'py-32' : section.settings?.padding === 'small' ? 'py-12' : '';
          return `
          <div id="${section.id}" class="${paddingClass}">
            ${html}
          </div>
        `;
        } catch (err) {
          console.error(`[Renderer] Error rendering Generative Template for ${section.id}:`, err);
          return `<!-- Render error in Generative Template ${section.id} -->`;
        }
      }

      //  Fallback to Registry Component
      const componentFn = Registry[section.componentId];
      if (!componentFn) {
        console.warn(`[Renderer] Component ${section.componentId} not found in Registry.`);
        return `<!-- Component ${section.componentId} not found -->`;
      }

      try {
        const html = componentFn(section.content);
        // Apply settings like padding and visibility if necessary (most components handle their own padding but we can wrap)
        const paddingClass = section.settings?.padding === 'large' ? 'py-16 md:py-32' : section.settings?.padding === 'medium' ? 'py-10 md:py-20' : section.settings?.padding === 'small' ? 'py-8 md:py-12' : '';

        return `
          <div id="${section.id}" class="${paddingClass}">
            ${html}
          </div>
        `;
      } catch (err) {
        console.error(`[Renderer] Error rendering component ${section.componentId}:`, err);
        return `<!-- Render error in ${section.componentId} -->`;
      }
    })
    .join('\n');

  // Construct Final HTML
  // Extract SEO Data
  const heroSection = sections.find(s => s.type === 'hero');
  const heroContent = heroSection?.content || {};
  const pageTitle = heroContent.name ? `${heroContent.name} | ${heroContent.title || 'Portfolio'}` : 'Professional Portfolio';
  const pageDescription = heroContent.bio || heroContent.description || 'Welcome to my professional portfolio.';
  const pageImage = heroContent.image || '';

  const brandingHTML = showBranding ? `
    <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <a href="https://seeqme.com" target="_blank" rel="noopener noreferrer" 
         class="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-2xl hover:scale-105 transition-transform group">
        <span class="text-[10px] font-medium text-white/60 tracking-wider uppercase">Powered by</span>
        <span class="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">SeeqMe</span>
      </a>
    </div>
  ` : '';

  const FALLBACK_IMG_DATA_URI =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80' fill='none'>" +
      "<rect x='2' y='2' width='116' height='76' rx='10' stroke='currentColor' stroke-width='4'/>" +
      "<path d='M20 56l22-18 16 12 18-16 24 22' stroke='currentColor' stroke-width='4' fill='none'/>" +
      "<circle cx='40' cy='28' r='6' fill='currentColor'/>" +
      "</svg>"
    );

  return `
<!DOCTYPE html>
<html lang="en" class="${theme}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDescription}">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${pageDescription}">
    <meta property="og:image" content="${pageImage}">
    <meta property="og:type" content="website">
    <script src="https://cdn.tailwindcss.com"></script>
    ${fontsLink}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      ${cssVariables}
      /* Custom scrollbar */
      ::-webkit-scrollbar { width: 10px; }
      ::-webkit-scrollbar-track { background: var(--bg); }
      ::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 5px; }
      ::-webkit-scrollbar-thumb:hover { opacity: 0.8; }
      
      /* Hide scrollbar utility */
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="transition-colors duration-500 relative min-h-screen font-body">
    <main>
      ${renderedSections}
    </main>
    ${brandingHTML}
    <script>
       const __SEEQME_FALLBACK_IMG = "${FALLBACK_IMG_DATA_URI}";
       const __applyImageFallback = (img) => {
          if (!img || img.dataset?.fallbackApplied) return;
          img.dataset.fallbackApplied = "true";
          img.onerror = function() {
             if (img.src !== __SEEQME_FALLBACK_IMG) {
                img.src = __SEEQME_FALLBACK_IMG;
                img.classList.add("opacity-40");
             }
          };
       };

       document.querySelectorAll("img").forEach(__applyImageFallback);

       // Unified smooth-scroll and animation script
       document.addEventListener('DOMContentLoaded', () => {
          document.querySelectorAll("img").forEach(__applyImageFallback);

          // Global smooth-scroll listener for all anchor links
          document.body.addEventListener('click', function(e) {
             const link = e.target.closest('a[href^="#"]');
             if (link) {
                const targetId = link.getAttribute('href').substring(1);
                if (!targetId) return;
                const target = document.getElementById(targetId);
                if (target) {
                   e.preventDefault();
                   target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                   // Close mobile menus if they exist (standard class)
                   const mobileMenu = document.querySelector('[data-mobile-menu]');
                   if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                      mobileMenu.classList.add('hidden');
                   }
                }
             }
          });

          // Intersection observer for entrance animations
          const observer = new IntersectionObserver((entries) => {
             entries.forEach(entry => {
                if (entry.isIntersecting) {
                   entry.target.classList.add('slide-up');
                }
             });
          }, { threshold: 0.1 });
          
          document.querySelectorAll('section, [data-section]').forEach(s => observer.observe(s));
       });
    </script>
</body>
</html>
  `.trim();
};
