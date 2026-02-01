
import { Manifest, ManifestSection } from '../types';
import { Registry } from '../registry';
import { DESIGN_SCHEMES } from '../registry/schemes';

/**
 * Production-grade Template Engine
 * Renders HTML by replacing {{key}} placeholders, handling loops (#each) and conditionals (#if).
 */
const renderGenerativeTemplate = (template: string, content: any): string => {
  let rendered = template;

  // 1. Handle Iterations: {{#each arrayName}}...{{/each}}
  const eachRegex = /{{#each\s+([\w.]+)}}([\s\S]*?){{\/each}}/g;
  rendered = rendered.replace(eachRegex, (_, arrayPath, blockContent) => {
    const array = getValueByPath(content, arrayPath);
    if (!Array.isArray(array)) return '';

    return array.map((item, index) => {
      const context = typeof item === 'object'
        ? { ...item, parent: content, '@index': index + 1 }
        : { this: item, parent: content, '@index': index + 1 };
      return renderGenerativeTemplate(blockContent, context);
    }).join('');
  });

  // 2. Handle Conditionals: {{#if field}}...{{/if}}
  const ifRegex = /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g;
  rendered = rendered.replace(ifRegex, (_, path, blockContent) => {
    const value = getValueByPath(content, path);
    return value ? blockContent : '';
  });

  // 3. Handle HTML Value Replacements: {{{key}}} (Triple stash)
  const htmlRegex = /{{{([\w.]+)}}}/g;
  rendered = rendered.replace(htmlRegex, (_, path) => {
    const value = getValueByPath(content, path);
    return value === undefined || value === null ? '' : String(value);
  });

  // 4. Handle Simple Value Replacements: {{key}}
  const valueRegex = /{{([\w.@]+)}}/g;
  rendered = rendered.replace(valueRegex, (_, path) => {
    const value = getValueByPath(content, path);
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

export const renderManifest = (manifest: Manifest, isFree: boolean = false): string => {
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
  const renderedSections = sections
    .filter(s => s.settings?.isVisible !== false)
    .map((section: ManifestSection) => {
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

  const brandingHTML = isFree ? `
    <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <a href="https://seeqme.ai" target="_blank" rel="noopener noreferrer" 
         class="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-2xl hover:scale-105 transition-transform group">
        <span class="text-[10px] font-medium text-white/60 tracking-wider uppercase">Powered by</span>
        <span class="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">SeeqMe.ai</span>
      </a>
    </div>
  ` : '';

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
<body class="transition-colors duration-500 relative min-h-screen">
    <main>
      ${renderedSections}
    </main>
    ${brandingHTML}
    <script>
       // Minimal hydration/interaction script
       document.addEventListener('DOMContentLoaded', () => {
          // Add intersection observers for animations
          const observer = new IntersectionObserver((entries) => {
             entries.forEach(entry => {
                if (entry.isIntersecting) {
                   entry.target.classList.add('slide-up');
                }
             });
          }, { threshold: 0.1 });
          
          document.querySelectorAll('section').forEach(s => observer.observe(s));
       });
    </script>
</body>
</html>
  `.trim();
};
