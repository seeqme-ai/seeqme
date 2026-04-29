// ============================================================
// SEEQME HERO REGISTRY — World-class portfolio hero sections
// All components use Tailwind CDN + CSS variables:
// --primary, --secondary, --bg, --surface, --text, --heading
// Font Awesome 6 available. Images use loading="lazy".
// ============================================================

const socialIcon = (platform: string) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('github'))    return 'fab fa-github';
  if (p.includes('linkedin'))  return 'fab fa-linkedin';
  if (p.includes('twitter') || p.includes('x.com')) return 'fab fa-twitter';
  if (p.includes('instagram')) return 'fab fa-instagram';
  if (p.includes('dribbble'))  return 'fab fa-dribbble';
  if (p.includes('behance'))   return 'fab fa-behance';
  if (p.includes('youtube'))   return 'fab fa-youtube';
  if (p.includes('medium'))    return 'fab fa-medium';
  if (p.includes('dev'))       return 'fab fa-dev';
  if (p.includes('discord'))   return 'fab fa-discord';
  if (p.includes('facebook'))  return 'fab fa-facebook';
  if (p.includes('tiktok'))    return 'fab fa-tiktok';
  if (p.includes('mail') || p.includes('@')) return 'fas fa-envelope';
  return 'fas fa-link';
};

const renderSocials = (socials: any[], className = 'flex items-center gap-4') => {
  if (!Array.isArray(socials) || socials.length === 0) return '';
  return `<div class="${className}">
    ${socials.map(s => `
      <a href="${s.url || s.link || '#'}" target="_blank" rel="noopener noreferrer"
         class="opacity-50 hover:opacity-100 hover:text-[var(--primary)] transition-all duration-200 hover:scale-110 transform inline-block"
         aria-label="${s.platform || 'Social link'}">
        <i class="${socialIcon(s.platform || s.name || '')} text-xl"></i>
      </a>`).join('')}
  </div>`;
};

const imgFallback = `onerror="this.onerror=null;this.style.background='linear-gradient(135deg,var(--primary)20,var(--surface))';this.style.display='flex';"`;

// ─── 1. HERO_MODERN_SPLIT ───────────────────────────────────
export const HERO_MODERN_SPLIT = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex items-center overflow-hidden bg-[var(--bg)] pt-20">
  <!-- Decorative blobs -->
  <div class="absolute inset-0 pointer-events-none overflow-hidden">
    <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20" style="background:radial-gradient(circle,var(--primary),transparent 70%);filter:blur(80px);animation:pulse 6s ease-in-out infinite;"></div>
    <div class="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full opacity-10" style="background:radial-gradient(circle,var(--secondary),transparent 70%);filter:blur(60px);"></div>
  </div>
  <div class="max-w-7xl mx-auto px-6 py-16 lg:py-24 w-full relative z-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <!-- Left: Content -->
      <div class="space-y-8 order-2 lg:order-1">
        <!-- Eyebrow -->
        <div class="flex items-center gap-3">
          <div class="h-px w-10 bg-[var(--primary)]"></div>
          <span class="text-[var(--primary)] text-xs font-bold uppercase tracking-[0.2em]">${content.availability || 'Available for work'}</span>
        </div>
        <!-- Name -->
        <h1 class="text-5xl md:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.88] text-[var(--heading)]" data-field="hero-name">
          ${content.name || 'Your Name'}
        </h1>
        <!-- Gradient title -->
        <p class="text-xl md:text-2xl font-bold" data-field="hero-title"
           style="background:linear-gradient(135deg,var(--primary),var(--secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
          ${content.title || 'Creative Professional'}
        </p>
        <!-- Bio -->
        <p class="text-base md:text-lg leading-relaxed opacity-60 max-w-xl" data-field="hero-bio">
          ${content.bio || 'Building remarkable digital experiences that leave a lasting impression.'}
        </p>
        <!-- CTAs -->
        <div class="flex flex-wrap gap-4 pt-2">
          <a href="${content.cta?.link || '#projects'}"
             class="inline-flex items-center gap-3 px-8 py-4 font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
             style="background:var(--primary);color:var(--bg);box-shadow:0 8px 32px color-mix(in srgb,var(--primary) 30%,transparent);"
             data-field="hero-ctaText">
            ${content.cta?.text || 'View My Work'}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
          ${content.resumeLink ? `<a href="${content.resumeLink}" target="_blank" rel="noopener"
             class="inline-flex items-center gap-3 px-8 py-4 font-bold rounded-2xl border-2 transition-all duration-300 hover:scale-105"
             style="border-color:var(--primary);color:var(--primary);">
            <i class="fas fa-file-arrow-down"></i> Resume
          </a>` : ''}
        </div>
        <!-- Socials -->
        ${renderSocials(content.socials || [])}
      </div>
      <!-- Right: Image -->
      <div class="relative order-1 lg:order-2 flex justify-center lg:justify-end">
        <div class="relative w-72 h-80 md:w-96 md:h-[480px]">
          <!-- Decorative border behind -->
          <div class="absolute inset-0 rounded-[2.5rem] border-2 rotate-3 transition-transform duration-500"
               style="border-color:color-mix(in srgb,var(--primary) 40%,transparent);"></div>
          <!-- Image -->
          <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
               ${imgFallback}
               class="relative z-10 w-full h-full object-cover rounded-[2rem] shadow-2xl hover:rotate-0 transition-transform duration-700" />
          <!-- Floating: location badge -->
          ${content.location ? `<div class="absolute -bottom-4 -left-4 z-20 px-4 py-2.5 rounded-2xl border shadow-xl backdrop-blur-md"
               style="background:color-mix(in srgb,var(--surface) 80%,transparent);border-color:color-mix(in srgb,var(--text) 10%,transparent);">
            <p class="text-[10px] font-bold opacity-50 uppercase tracking-widest">Based in</p>
            <p class="text-sm font-black text-[var(--heading)]" data-field="hero-location">${content.location}</p>
          </div>` : ''}
          <!-- Floating: status badge -->
          <div class="absolute -top-4 -right-4 z-20 px-4 py-2 rounded-2xl shadow-xl"
               style="background:var(--primary);color:var(--bg);">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-current animate-pulse"></div>
              <p class="text-[10px] font-black uppercase tracking-wider">${content.badge || 'Open to Work'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ─── 2. HERO_CENTERED_MINIMAL ────────────────────────────────
export const HERO_CENTERED_MINIMAL = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden bg-[var(--bg)]">
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-10"
         style="background:radial-gradient(circle,var(--primary),transparent 60%);filter:blur(100px);"></div>
  </div>
  <div class="max-w-3xl mx-auto relative z-10 space-y-8">
    <!-- Avatar -->
    <div class="relative w-24 h-24 mx-auto">
      <div class="absolute inset-0 rounded-full animate-ping opacity-20" style="background:var(--primary);animation-duration:3s;"></div>
      <div class="relative w-24 h-24 rounded-full border-4 overflow-hidden shadow-xl" style="border-color:color-mix(in srgb,var(--primary) 60%,transparent);">
        <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
             ${imgFallback} class="w-full h-full object-cover" data-field="hero-image" />
      </div>
    </div>
    <!-- Name -->
    <h1 class="text-5xl md:text-7xl font-black tracking-tighter text-[var(--heading)]" data-field="hero-name">
      ${content.name || 'Your Name'}
    </h1>
    <!-- Title -->
    <p class="text-lg md:text-xl font-bold uppercase tracking-[0.2em]" style="color:var(--primary);" data-field="hero-title">
      ${content.title || 'Creative Professional'}
    </p>
    <!-- Bio -->
    <p class="text-base md:text-lg opacity-60 leading-relaxed max-w-2xl" data-field="hero-bio">
      ${content.bio || 'Crafting digital experiences that inspire and endure.'}
    </p>
    <!-- CTA -->
    <div class="flex flex-wrap justify-center gap-4 pt-4">
      <a href="${content.cta?.link || '#contact'}"
         class="px-8 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg"
         style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
        ${content.cta?.text || 'Get in Touch'}
      </a>
      <a href="${content.cta2?.link || '#projects'}"
         class="px-8 py-4 rounded-full font-bold transition-all hover:scale-105 border-2"
         style="border-color:color-mix(in srgb,var(--text) 20%,transparent);color:var(--heading);">
        ${content.cta2?.text || 'See My Work'}
      </a>
    </div>
    <!-- Socials -->
    ${renderSocials(content.socials || [], 'flex items-center justify-center gap-6 pt-2')}
  </div>
</section>`;

// ─── 3. HERO_CYBER_MONO ──────────────────────────────────────
export const HERO_CYBER_MONO = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex items-center py-24 px-6 overflow-hidden" style="background:#050505;font-family:'JetBrains Mono',monospace;">
  <!-- Grid dot bg -->
  <div class="absolute inset-0 opacity-[0.04]"
       style="background-image:radial-gradient(var(--primary) 1px,transparent 1px);background-size:36px 36px;"></div>
  <!-- Glow -->
  <div class="absolute top-0 left-1/3 w-[500px] h-[500px] opacity-10 pointer-events-none"
       style="background:radial-gradient(circle,var(--primary),transparent 60%);filter:blur(80px);"></div>
  <div class="max-w-6xl mx-auto w-full relative z-10">
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
      <!-- Code panel: left 3 cols -->
      <div class="lg:col-span-3 space-y-8">
        <div class="space-y-2">
          <p class="text-xs" style="color:color-mix(in srgb,var(--primary) 60%,transparent);">// portfolio.config.ts</p>
          <h1 class="text-4xl md:text-6xl xl:text-7xl font-black tracking-tighter" style="color:#fff;" data-field="hero-name">
            <span style="color:var(--primary);">></span> ${content.name || 'DEVELOPER'}
            <span class="inline-block w-1 h-12 ml-2 align-middle" style="background:var(--primary);animation:blink 1s step-end infinite;"></span>
          </h1>
        </div>
        <!-- Terminal card -->
        <div class="rounded-2xl border overflow-hidden shadow-2xl" style="background:#0d0d0d;border-color:color-mix(in srgb,var(--primary) 20%,transparent);">
          <!-- Terminal bar -->
          <div class="flex items-center gap-2 px-4 py-3 border-b" style="background:#111;border-color:color-mix(in srgb,var(--primary) 10%,transparent);">
            <span class="w-3 h-3 rounded-full" style="background:#ff5f57;"></span>
            <span class="w-3 h-3 rounded-full" style="background:#febc2e;"></span>
            <span class="w-3 h-3 rounded-full" style="background:#28c840;"></span>
            <span class="ml-3 text-xs opacity-30">~/portfolio</span>
          </div>
          <div class="p-6 text-sm leading-relaxed space-y-2" style="color:#ccc;">
            <p><span style="color:var(--primary);">$</span> <span style="color:#7dd3fc;">cat</span> whoami.json</p>
            <pre class="text-xs leading-loose" style="color:#94a3b8;">{
  <span style="color:var(--primary);">"role"</span>: <span style="color:#86efac;">"${content.title || 'Software Engineer'}"</span>,
  <span style="color:var(--primary);">"status"</span>: <span style="color:#86efac;">"${content.availability || 'open_to_work'}"</span>,
  <span style="color:var(--primary);">"bio"</span>: <span style="color:#86efac;">"${(content.bio || 'Building scalable systems.').slice(0,60)}..."</span>
}</pre>
            <p><span style="color:var(--primary);">$</span> <span class="inline-block w-2 h-4 align-middle" style="background:var(--primary);animation:blink 1s step-end infinite;"></span></p>
          </div>
        </div>
        <!-- CTAs -->
        <div class="flex flex-wrap gap-4">
          <a href="${content.cta?.link || '#projects'}"
             class="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:shadow-lg"
             style="background:var(--primary);color:#050505;" data-field="hero-ctaText">
            [ ${content.cta?.text || 'View Projects'} ]
          </a>
          ${renderSocials(content.socials || [], 'flex items-center gap-4')}
        </div>
      </div>
      <!-- Image: right 2 cols -->
      ${content.image ? `<div class="hidden lg:flex lg:col-span-2 justify-center">
        <div class="relative w-64 h-80">
          <div class="absolute inset-0 rounded-2xl opacity-30" style="background:var(--primary);filter:blur(30px);"></div>
          <img src="${content.image}" alt="${content.name || 'Profile'}" loading="lazy"
               ${imgFallback} data-field="hero-image"
               class="relative z-10 w-full h-full object-cover rounded-2xl"
               style="filter:grayscale(20%);border:1px solid color-mix(in srgb,var(--primary) 30%,transparent);" />
        </div>
      </div>` : ''}
    </div>
  </div>
  <style>@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}</style>
</section>`;

// ─── 4. HERO_VISUALIST ───────────────────────────────────────
export const HERO_VISUALIST = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex items-end overflow-hidden bg-[var(--bg)]">
  <!-- Full BG image -->
  <div class="absolute inset-0 z-0">
    <img src="${content.image || ''}" alt="Background" loading="lazy" ${imgFallback}
         class="w-full h-full object-cover transition-transform duration-[15s] hover:scale-105 ease-out" data-field="hero-image" />
    <div class="absolute inset-0" style="background:linear-gradient(to top,var(--bg) 40%,color-mix(in srgb,var(--bg) 40%,transparent) 70%,transparent);"></div>
  </div>
  <div class="max-w-7xl mx-auto px-6 pb-16 md:pb-24 w-full relative z-10">
    <div class="max-w-3xl space-y-6">
      <!-- Title pill -->
      <div class="inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md border"
           style="background:color-mix(in srgb,var(--surface) 40%,transparent);border-color:color-mix(in srgb,var(--primary) 30%,transparent);">
        <div class="w-2 h-2 rounded-full animate-pulse" style="background:var(--primary);"></div>
        <span class="text-xs font-bold uppercase tracking-widest" style="color:var(--primary);" data-field="hero-title">${content.title || 'Visual Artist'}</span>
      </div>
      <!-- Name -->
      <h1 class="text-6xl md:text-8xl xl:text-[9rem] font-black tracking-tighter leading-none text-white drop-shadow-2xl" data-field="hero-name">
        ${content.name || 'Your Name'}
      </h1>
      <!-- Divider + bio row -->
      <div class="flex items-start gap-6">
        <div class="w-px h-16 opacity-30 mt-1" style="background:var(--primary);"></div>
        <p class="text-base md:text-lg opacity-75 leading-relaxed max-w-md text-white" data-field="hero-bio">
          ${content.bio || 'Creating visual stories that transcend boundaries.'}
        </p>
      </div>
      <!-- Bottom row: CTA + socials -->
      <div class="flex flex-wrap items-center gap-6 pt-4">
        <a href="${content.cta?.link || '#projects'}"
           class="px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-2xl"
           style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
          ${content.cta?.text || 'Explore Work'}
        </a>
        ${renderSocials(content.socials || [], 'flex items-center gap-5')}
      </div>
    </div>
  </div>
</section>`;

// ─── 5. HERO_EXECUTIVE ───────────────────────────────────────
export const HERO_EXECUTIVE = (content: any) => `
<section data-section="hero" class="relative py-32 md:py-40 px-6 bg-[var(--bg)] border-b" style="border-color:color-mix(in srgb,var(--primary) 10%,transparent);">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
      <!-- Left: 8 cols -->
      <div class="lg:col-span-8 space-y-8">
        <p class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);" data-field="hero-title">
          ${content.title || 'Executive Leader'}
        </p>
        <h1 class="text-6xl md:text-8xl xl:text-[7vw] font-black tracking-tighter leading-[0.85] uppercase text-[var(--heading)]" data-field="hero-name">
          ${content.name || 'Your Name'}
        </h1>
        <div class="h-px w-24" style="background:var(--primary);"></div>
      </div>
      <!-- Right: 4 cols -->
      <div class="lg:col-span-4 space-y-8">
        <p class="text-lg md:text-xl opacity-60 leading-relaxed italic" data-field="hero-bio">
          &ldquo;${content.bio || 'Leading with purpose and delivering exceptional outcomes at every scale.'}&rdquo;
        </p>
        <div class="space-y-4">
          <a href="${content.cta?.link || '#contact'}"
             class="flex items-center gap-4 font-bold text-lg group transition-colors hover:opacity-70"
             style="color:var(--heading);" data-field="hero-ctaText">
            ${content.cta?.text || 'Request Consultation'}
            <span class="transform group-hover:translate-x-2 transition-transform text-2xl" style="color:var(--primary);">→</span>
          </a>
          ${content.location ? `<p class="text-sm opacity-40 uppercase tracking-widest">📍 ${content.location}</p>` : ''}
        </div>
        ${renderSocials(content.socials || [])}
      </div>
    </div>
    ${content.image ? `<div class="mt-16 md:mt-24">
      <img src="${content.image}" alt="${content.name || 'Profile'}" loading="lazy" ${imgFallback}
           data-field="hero-image"
           class="w-full h-64 md:h-[55vh] object-cover rounded-3xl shadow-2xl" />
    </div>` : ''}
  </div>
</section>`;

// ─── 6. HERO_GLASS_FLOATING ──────────────────────────────────
export const HERO_GLASS_FLOATING = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-[var(--bg)]">
  <!-- Gradient mesh -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-0 left-0 w-full h-full opacity-30"
         style="background:conic-gradient(from 180deg at 50% 50%,var(--primary)00,var(--primary)20,var(--secondary)10,var(--primary)00);filter:blur(60px);"></div>
    <div class="absolute top-20 right-20 w-80 h-80 rounded-full opacity-20"
         style="background:radial-gradient(circle,var(--primary),transparent);filter:blur(60px);animation:pulse 5s ease-in-out infinite;"></div>
    <div class="absolute bottom-20 left-20 w-60 h-60 rounded-full opacity-15"
         style="background:radial-gradient(circle,var(--secondary),transparent);filter:blur(40px);animation:pulse 7s ease-in-out infinite reverse;"></div>
  </div>
  <div class="max-w-5xl w-full relative z-10">
    <!-- Main glass card -->
    <div class="rounded-[3rem] p-8 md:p-12 shadow-2xl border backdrop-blur-xl"
         style="background:color-mix(in srgb,var(--surface) 60%,transparent);border-color:color-mix(in srgb,var(--text) 10%,transparent);">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <!-- Avatar -->
        <div class="md:col-span-4 flex justify-center">
          <div class="relative w-48 h-48 md:w-64 md:h-64">
            <div class="absolute inset-0 rounded-[2rem] opacity-40" style="background:var(--primary);filter:blur(20px);"></div>
            <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
                 ${imgFallback} data-field="hero-image"
                 class="relative z-10 w-full h-full object-cover rounded-[2rem] shadow-xl" />
          </div>
        </div>
        <!-- Content -->
        <div class="md:col-span-8 space-y-6">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.3em] mb-3" style="color:var(--primary);" data-field="hero-title">
              ${content.title || 'Creative Professional'}
            </p>
            <h1 class="text-4xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="hero-name">
              ${content.name || 'Your Name'}
            </h1>
          </div>
          <p class="text-base md:text-lg opacity-65 leading-relaxed" data-field="hero-bio">
            ${content.bio || 'Designing experiences that connect people and brands meaningfully.'}
          </p>
          <div class="flex flex-wrap gap-3">
            <a href="${content.cta?.link || '#contact'}"
               class="px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-105 shadow-lg"
               style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
              ${content.cta?.text || 'Let\'s Work Together'}
            </a>
            ${content.resumeLink ? `<a href="${content.resumeLink}" target="_blank"
               class="px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-105 border"
               style="border-color:color-mix(in srgb,var(--text) 20%,transparent);">
              Download CV
            </a>` : ''}
          </div>
          ${renderSocials(content.socials || [])}
        </div>
      </div>
    </div>
    <!-- Floating stat cards -->
    <div class="flex flex-wrap justify-center gap-4 mt-6">
      ${(content.stats || [{ label: 'Years Exp.', value: '5+' }, { label: 'Projects', value: '50+' }]).map((s: any) => `
        <div class="px-6 py-3 rounded-2xl border backdrop-blur-md shadow-lg"
             style="background:color-mix(in srgb,var(--surface) 70%,transparent);border-color:color-mix(in srgb,var(--text) 10%,transparent);">
          <p class="text-xl font-black text-[var(--heading)]">${s.value || '5+'}</p>
          <p class="text-[10px] uppercase tracking-widest opacity-50">${s.label || 'Experience'}</p>
        </div>`).join('')}
    </div>
  </div>
</section>`;

// ─── 7. HERO_NEOBRUTALIST ────────────────────────────────────
export const HERO_NEOBRUTALIST = (content: any) => `
<section data-section="hero" class="min-h-screen flex items-center px-6 py-24 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto w-full">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div class="space-y-8">
        <!-- Pill badge -->
        <div class="inline-block px-5 py-2 bg-[var(--primary)] font-black text-xs uppercase tracking-widest text-[var(--bg)] border-4 border-[var(--heading)] shadow-[4px_4px_0px_var(--heading)]">
          ${content.title || 'Developer / Designer'}
        </div>
        <!-- Name -->
        <h1 class="text-6xl md:text-8xl font-black uppercase leading-[0.85] text-[var(--heading)]" data-field="hero-name"
            style="text-shadow:4px 4px 0px color-mix(in srgb,var(--primary) 30%,transparent);">
          ${content.name || 'Your Name'}
        </h1>
        <!-- Bio box -->
        <div class="p-6 border-4 border-[var(--heading)] shadow-[6px_6px_0px_var(--primary)]" style="background:var(--surface);">
          <p class="text-base md:text-lg leading-relaxed opacity-75" data-field="hero-bio">
            ${content.bio || 'Creating bold digital experiences that demand attention and inspire action.'}
          </p>
        </div>
        <!-- CTA -->
        <div class="flex flex-wrap gap-4">
          <a href="${content.cta?.link || '#projects'}"
             class="px-8 py-4 font-black text-sm uppercase tracking-widest border-4 border-[var(--heading)] shadow-[4px_4px_0px_var(--heading)] transition-all hover:shadow-none hover:translate-x-1 hover:translate-y-1"
             style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
            ${content.cta?.text || 'See My Work →'}
          </a>
        </div>
        ${renderSocials(content.socials || [])}
      </div>
      <!-- Image -->
      <div class="relative">
        <div class="absolute inset-0 border-4 border-[var(--heading)] translate-x-4 translate-y-4" style="background:var(--primary);opacity:0.3;"></div>
        <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
             ${imgFallback} data-field="hero-image"
             class="relative z-10 w-full aspect-[4/5] object-cover border-4 border-[var(--heading)] shadow-[8px_8px_0px_var(--heading)]" />
      </div>
    </div>
  </div>
</section>`;

// ─── 8. HERO_MINIMAL_LEFT ────────────────────────────────────
export const HERO_MINIMAL_LEFT = (content: any) => `
<section data-section="hero" class="min-h-screen flex items-center px-6 py-24 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
    <div class="space-y-10">
      <div class="space-y-4">
        <p class="text-xs font-bold uppercase tracking-[0.4em] opacity-40" data-field="hero-title">
          ${content.title || 'Product Designer'}
        </p>
        <h1 class="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-[var(--heading)]" data-field="hero-name">
          ${content.name || 'Your Name'}
        </h1>
      </div>
      <div class="h-px w-12" style="background:var(--primary);"></div>
      <p class="text-base md:text-lg opacity-55 leading-relaxed max-w-sm" data-field="hero-bio">
        ${content.bio || 'I craft minimal, purposeful digital products that solve real problems.'}
      </p>
      <div class="flex flex-col gap-4">
        <a href="${content.cta?.link || '#work'}"
           class="inline-flex items-center gap-3 font-bold text-sm group hover:opacity-70 transition-opacity"
           style="color:var(--heading);" data-field="hero-ctaText">
          ${content.cta?.text || 'View Work'}
          <span class="transform group-hover:translate-x-2 transition-transform text-lg" style="color:var(--primary);">→</span>
        </a>
        ${renderSocials(content.socials || [])}
      </div>
    </div>
    <!-- Minimal image -->
    <div class="relative">
      <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
           ${imgFallback} data-field="hero-image"
           class="w-full aspect-[3/4] object-cover rounded-3xl shadow-xl" />
      ${content.location ? `<div class="absolute bottom-6 left-6 px-4 py-2 rounded-xl backdrop-blur-md border text-sm font-semibold"
           style="background:color-mix(in srgb,var(--bg) 80%,transparent);border-color:color-mix(in srgb,var(--text) 15%,transparent);">
        📍 ${content.location}
      </div>` : ''}
    </div>
  </div>
</section>`;

// ─── 9. HERO_STACKED_BOLD ────────────────────────────────────
export const HERO_STACKED_BOLD = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex items-center overflow-hidden bg-[var(--bg)]">
  <!-- Background decorative text -->
  <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
    <span class="text-[20vw] font-black uppercase opacity-[0.03] whitespace-nowrap" style="color:var(--heading);">PORTFOLIO</span>
  </div>
  <div class="max-w-7xl mx-auto px-6 py-24 w-full relative z-10">
    <!-- Eyebrow -->
    <div class="flex items-center gap-4 mb-12">
      <div class="w-8 h-8 rounded-full" style="background:var(--primary);"></div>
      <span class="text-xs font-black uppercase tracking-[0.3em] opacity-60">${content.title || 'Creative Developer'}</span>
      <div class="h-px flex-1 opacity-10" style="background:var(--text);"></div>
    </div>
    <!-- Giant stacked name -->
    <h1 class="text-[15vw] md:text-[12vw] font-black tracking-tighter leading-[0.8] uppercase text-[var(--heading)] mb-12" data-field="hero-name">
      ${(content.name || 'Your Name').split(' ').map((word: string, i: number) =>
        `<span class="${i % 2 === 1 ? 'block ml-[10vw]' : 'block'}">${word}</span>`
      ).join('')}
    </h1>
    <!-- Bottom bar -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-t pt-8"
         style="border-color:color-mix(in srgb,var(--text) 10%,transparent);">
      <p class="text-base md:text-lg opacity-55 max-w-md leading-relaxed" data-field="hero-bio">
        ${content.bio || 'Building the future of digital experiences, one pixel at a time.'}
      </p>
      <div class="flex items-center gap-6 shrink-0">
        <a href="${content.cta?.link || '#projects'}"
           class="px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105"
           style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
          ${content.cta?.text || 'Explore'}
        </a>
        ${renderSocials(content.socials || [])}
      </div>
    </div>
  </div>
</section>`;

// ─── 10. HERO_GRID_LAYOUT ────────────────────────────────────
export const HERO_GRID_LAYOUT = (content: any) => `
<section data-section="hero" class="min-h-screen bg-[var(--bg)] p-6 flex items-center">
  <div class="max-w-7xl mx-auto w-full">
    <div class="grid grid-cols-12 grid-rows-auto gap-4 min-h-[80vh]">
      <!-- Name cell: large -->
      <div class="col-span-12 md:col-span-8 row-span-1 flex flex-col justify-end p-8 rounded-3xl border"
           style="background:var(--surface);border-color:color-mix(in srgb,var(--text) 8%,transparent);">
        <p class="text-xs font-black uppercase tracking-[0.4em] mb-4 opacity-40">${content.title || 'Software Engineer'}</p>
        <h1 class="text-5xl md:text-7xl font-black tracking-tighter leading-none text-[var(--heading)]" data-field="hero-name">
          ${content.name || 'Your Name'}
        </h1>
      </div>
      <!-- Image cell -->
      <div class="col-span-12 md:col-span-4 row-span-2 rounded-3xl overflow-hidden min-h-64">
        <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
             ${imgFallback} data-field="hero-image"
             class="w-full h-full object-cover min-h-64" />
      </div>
      <!-- Bio + CTA cell -->
      <div class="col-span-12 md:col-span-5 p-8 rounded-3xl flex flex-col justify-between gap-6 border"
           style="background:var(--surface);border-color:color-mix(in srgb,var(--text) 8%,transparent);">
        <p class="text-base opacity-60 leading-relaxed" data-field="hero-bio">
          ${content.bio || 'Architecting elegant solutions to complex digital challenges.'}
        </p>
        <a href="${content.cta?.link || '#projects'}"
           class="inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm w-fit transition-all hover:scale-105"
           style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
          ${content.cta?.text || 'View Projects'} →
        </a>
      </div>
      <!-- Stat cells -->
      <div class="col-span-6 md:col-span-3 p-6 rounded-3xl flex flex-col justify-center items-center text-center border"
           style="background:color-mix(in srgb,var(--primary) 10%,transparent);border-color:color-mix(in srgb,var(--primary) 20%,transparent);">
        <span class="text-4xl font-black text-[var(--heading)]">${content.years || '5'}+</span>
        <span class="text-[10px] uppercase tracking-widest opacity-50 mt-1">Years Exp.</span>
      </div>
      <!-- Socials cell -->
      <div class="col-span-6 md:col-span-4 p-6 rounded-3xl flex flex-col justify-center border"
           style="background:var(--surface);border-color:color-mix(in srgb,var(--text) 8%,transparent);">
        ${renderSocials(content.socials || [], 'flex flex-wrap items-center gap-4')}
        ${content.location ? `<p class="text-xs opacity-40 mt-3 uppercase tracking-widest">📍 ${content.location}</p>` : ''}
      </div>
    </div>
  </div>
</section>`;

// ─── 11. HERO_DYNAMIC_GRADIENT ───────────────────────────────
export const HERO_DYNAMIC_GRADIENT = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex items-center justify-center text-center px-6 py-24 overflow-hidden">
  <!-- Animated gradient bg -->
  <div class="absolute inset-0 z-0" style="background:linear-gradient(-45deg,var(--bg),color-mix(in srgb,var(--primary) 15%,var(--bg)),color-mix(in srgb,var(--secondary) 10%,var(--bg)),var(--bg));background-size:400% 400%;animation:gradientShift 12s ease infinite;"></div>
  <!-- Orbs -->
  <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 blur-[80px] animate-pulse" style="background:var(--primary);"></div>
  <div class="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-[60px] animate-pulse" style="background:var(--secondary);animation-delay:2s;"></div>
  <div class="max-w-5xl mx-auto relative z-10 space-y-8">
    <p class="text-xs font-black uppercase tracking-[0.4em] opacity-60" data-field="hero-title">${content.title || 'Creative Professional'}</p>
    <h1 class="text-5xl md:text-8xl xl:text-9xl font-black tracking-tighter leading-none text-[var(--heading)] drop-shadow-2xl" data-field="hero-name">
      ${content.name || 'Your Name'}
    </h1>
    <p class="text-lg md:text-xl opacity-60 max-w-2xl mx-auto leading-relaxed" data-field="hero-bio">
      ${content.bio || 'Transforming ideas into extraordinary digital experiences.'}
    </p>
    <div class="flex flex-wrap justify-center gap-4 pt-4">
      <a href="${content.cta?.link || '#work'}"
         class="px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-2xl"
         style="background:var(--primary);color:var(--bg);box-shadow:0 20px 60px color-mix(in srgb,var(--primary) 40%,transparent);"
         data-field="hero-ctaText">
        ${content.cta?.text || 'Explore Work'}
      </a>
    </div>
    ${renderSocials(content.socials || [], 'flex items-center justify-center gap-6 mt-4')}
  </div>
  <style>@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}</style>
</section>`;

// ─── 12. HERO_MINIMAL_ELEGANCE ───────────────────────────────
export const HERO_MINIMAL_ELEGANCE = (content: any) => `
<section data-section="hero" class="min-h-screen flex items-center justify-center px-6 py-24 bg-[var(--bg)]">
  <div class="max-w-4xl mx-auto text-center space-y-10 relative z-10">
    <!-- Rotating badge -->
    <div class="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 200 200" class="w-full h-full animate-spin" style="animation-duration:20s;">
        <defs><path id="circle-text" d="M 100,100 m -80,0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"/></defs>
        <text class="fill-current opacity-60 text-[10px]" style="fill:var(--primary);font-size:13px;font-weight:800;letter-spacing:8px;">
          <textPath href="#circle-text">${content.badgeText || 'AVAILABLE · CREATIVE · PROFESSIONAL ·'}</textPath>
        </text>
      </svg>
      <div class="absolute inset-0 flex items-center justify-center">
        <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
             ${imgFallback} data-field="hero-image"
             class="w-20 h-20 object-cover rounded-full border-2" style="border-color:var(--primary);" />
      </div>
    </div>
    <div class="space-y-4">
      <p class="text-xs uppercase tracking-[0.5em] opacity-40">${content.title || 'Designer & Creator'}</p>
      <h1 class="text-5xl md:text-7xl font-black tracking-tighter text-[var(--heading)]" data-field="hero-name">
        ${content.name || 'Your Name'}
      </h1>
    </div>
    <p class="text-lg opacity-60 max-w-xl mx-auto leading-relaxed" data-field="hero-bio">
      ${content.bio || 'Crafting refined digital experiences with intentional design and exceptional craft.'}
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <a href="${content.cta?.link || '#work'}"
         class="px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105"
         style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
        ${content.cta?.text || 'View Portfolio'}
      </a>
    </div>
    ${renderSocials(content.socials || [], 'flex items-center justify-center gap-6')}
  </div>
</section>`;

// ─── 13. HERO_TERMINAL_STYLE ─────────────────────────────────
export const HERO_TERMINAL_STYLE = (content: any) => `
<section data-section="hero" class="min-h-screen flex items-center justify-center px-6 py-24" style="background:#0a0a0a;">
  <div class="w-full max-w-3xl">
    <!-- Terminal window -->
    <div class="rounded-2xl overflow-hidden shadow-2xl border" style="border-color:#333;">
      <!-- Title bar -->
      <div class="flex items-center gap-2 px-5 py-3" style="background:#1a1a1a;">
        <span class="w-3 h-3 rounded-full" style="background:#ff5f57;"></span>
        <span class="w-3 h-3 rounded-full" style="background:#febc2e;"></span>
        <span class="w-3 h-3 rounded-full" style="background:#28c840;"></span>
        <span class="ml-3 text-xs text-gray-500 font-mono">bash — portfolio.sh</span>
      </div>
      <!-- Terminal body -->
      <div class="p-8 font-mono text-sm leading-8 space-y-1" style="background:#0d0d0d;color:#e5e5e5;min-height:420px;">
        <p><span style="color:#28c840;">visitor@seeqme</span><span style="color:#888;">:</span><span style="color:#7dd3fc;">~</span><span style="color:#888;">$</span> <span class="opacity-70">./portfolio.sh --user</span></p>
        <p class="opacity-60 text-xs">Loading user profile...</p>
        <p>&nbsp;</p>
        <p><span style="color:#febc2e;">NAME:</span> <span class="text-white font-bold text-base" data-field="hero-name">${content.name || 'Your Name'}</span></p>
        <p><span style="color:#febc2e;">ROLE:</span> <span style="color:#86efac;" data-field="hero-title">${content.title || 'Full Stack Engineer'}</span></p>
        ${content.location ? `<p><span style="color:#febc2e;">LOCATION:</span> <span style="color:#93c5fd;">${content.location}</span></p>` : ''}
        <p>&nbsp;</p>
        <p><span style="color:#febc2e;">BIO:</span></p>
        <p class="pl-4 opacity-70 max-w-xl leading-relaxed" data-field="hero-bio">&ldquo;${content.bio || 'Building robust systems and exceptional user experiences at scale.'}&rdquo;</p>
        <p>&nbsp;</p>
        <p><span style="color:#febc2e;">STACK:</span> <span style="color:#c4b5fd;">${Array.isArray(content.skills) ? content.skills.slice(0,5).join(' · ') : 'React · Go · TypeScript'}</span></p>
        <p>&nbsp;</p>
        <p><span style="color:#28c840;">visitor@seeqme</span><span style="color:#888;">:</span><span style="color:#7dd3fc;">~</span><span style="color:#888;">$</span> <a href="${content.cta?.link || '#contact'}" style="color:var(--primary);text-decoration:underline;" data-field="hero-ctaText">${content.cta?.text || 'contact --hire'}</a> <span class="inline-block w-2 h-4 align-middle" style="background:var(--primary);animation:blink 1s step-end infinite;"></span></p>
      </div>
    </div>
    <!-- Socials below terminal -->
    <div class="mt-6 flex justify-center">
      ${renderSocials(content.socials || [], 'flex items-center gap-6')}
    </div>
  </div>
  <style>@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}</style>
</section>`;

// ─── 14. HERO_VIDEO_BG ───────────────────────────────────────
export const HERO_VIDEO_BG = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg)]">
  ${content.videoUrl ? `
  <video class="absolute inset-0 w-full h-full object-cover z-0 opacity-30" autoplay muted loop playsinline>
    <source src="${content.videoUrl}" type="video/mp4">
  </video>` : `
  <div class="absolute inset-0 z-0 opacity-20" style="background:linear-gradient(135deg,var(--primary),var(--secondary));"></div>`}
  <div class="absolute inset-0 z-0" style="background:linear-gradient(to top,var(--bg) 30%,color-mix(in srgb,var(--bg) 60%,transparent));"></div>
  <div class="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
    <h1 class="text-6xl md:text-9xl font-black tracking-tighter leading-none text-[var(--heading)] drop-shadow-2xl" data-field="hero-name">
      ${content.name || 'Your Name'}
    </h1>
    <p class="text-xl md:text-3xl font-bold opacity-70" data-field="hero-title">${content.title || 'Filmmaker & Creator'}</p>
    <p class="text-lg opacity-55 max-w-2xl mx-auto leading-relaxed" data-field="hero-bio">${content.bio || 'Creating immersive visual narratives that captivate and inspire.'}</p>
    <a href="${content.cta?.link || '#work'}"
       class="inline-flex items-center gap-3 px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-2xl"
       style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
      ${content.cta?.text || 'Watch Showreel'}
      <i class="fas fa-play text-xs"></i>
    </a>
  </div>
</section>`;

// ─── 15. HERO_MAGAZINE ───────────────────────────────────────
export const HERO_MAGAZINE = (content: any) => `
<section data-section="hero" class="min-h-screen bg-[var(--bg)] overflow-hidden">
  <!-- Masthead -->
  <div class="px-6 py-4 border-b flex justify-between items-center" style="border-color:var(--heading);background:var(--heading);color:var(--bg);">
    <span class="text-[10px] font-black uppercase tracking-[0.4em]">Portfolio — Issue ${new Date().getFullYear()}</span>
    <span class="text-[10px] font-black uppercase tracking-[0.4em]">${content.location || 'Global'}</span>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-12 min-h-[90vh]">
    <!-- Left: typography col -->
    <div class="md:col-span-7 px-8 md:px-12 py-12 flex flex-col justify-between border-r" style="border-color:color-mix(in srgb,var(--text) 10%,transparent);">
      <div class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="px-4 py-2 font-black text-xs uppercase tracking-widest" style="background:var(--primary);color:var(--bg);">
            ${content.title || 'Featured Creator'}
          </div>
        </div>
        <h1 class="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] uppercase text-[var(--heading)]" data-field="hero-name">
          ${content.name?.split(' ').join('<br>') || 'Your<br>Name'}
        </h1>
      </div>
      <div class="space-y-6">
        <p class="text-lg opacity-60 leading-relaxed max-w-lg" data-field="hero-bio">
          ${content.bio || 'A defining voice in contemporary creative practice — pushing boundaries and redefining what\'s possible.'}
        </p>
        <div class="flex items-center gap-6">
          <a href="${content.cta?.link || '#work'}"
             class="px-8 py-4 font-black text-sm uppercase tracking-widest transition-all hover:scale-105"
             style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
            ${content.cta?.text || 'Read Feature'}
          </a>
          ${renderSocials(content.socials || [])}
        </div>
      </div>
    </div>
    <!-- Right: image -->
    <div class="md:col-span-5">
      <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
           ${imgFallback} data-field="hero-image"
           class="w-full h-full object-cover min-h-72"
           style="filter:contrast(1.05);" />
    </div>
  </div>
</section>`;

// ─── 16. HERO_PARALLAX_LAYERS ────────────────────────────────
export const HERO_PARALLAX_LAYERS = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex items-center overflow-hidden bg-[var(--bg)]" id="hero-parallax">
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute inset-0 opacity-5" style="background:radial-gradient(ellipse at center,var(--primary),transparent 70%);"></div>
    <div class="absolute -top-20 left-1/4 w-[400px] h-[600px] opacity-8 transform -skew-y-6"
         style="background:linear-gradient(to bottom,var(--primary)15,transparent);filter:blur(40px);"></div>
  </div>
  <div class="max-w-7xl mx-auto px-6 py-24 w-full relative z-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div class="space-y-8">
        <div class="space-y-2">
          <p class="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">${content.title || 'Creative Technologist'}</p>
          <h1 class="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-[var(--heading)]" data-field="hero-name">
            ${content.name || 'Your Name'}
          </h1>
        </div>
        <div class="w-16 h-1 rounded-full" style="background:linear-gradient(to right,var(--primary),var(--secondary));"></div>
        <p class="text-lg opacity-60 leading-relaxed max-w-md" data-field="hero-bio">
          ${content.bio || 'Layering technology, design, and storytelling into multi-dimensional experiences.'}
        </p>
        <div class="flex flex-wrap gap-4">
          <a href="${content.cta?.link || '#work'}"
             class="px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 shadow-lg"
             style="background:linear-gradient(135deg,var(--primary),var(--secondary));color:var(--bg);"
             data-field="hero-ctaText">
            ${content.cta?.text || 'Explore Layers'}
          </a>
        </div>
        ${renderSocials(content.socials || [])}
      </div>
      <div class="relative h-[500px]">
        <!-- Layered image stack -->
        <div class="absolute bottom-0 right-0 w-72 h-80 rounded-3xl overflow-hidden shadow-xl"
             style="transform:rotate(-3deg);z-index:1;background:color-mix(in srgb,var(--primary) 20%,var(--surface));"></div>
        <div class="absolute bottom-4 right-4 w-72 h-80 rounded-3xl overflow-hidden shadow-xl" style="z-index:2;">
          <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
               ${imgFallback} data-field="hero-image"
               class="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </div>
</section>`;

// ─── 17. HERO_CIRCLE_AVATAR ──────────────────────────────────
export const HERO_CIRCLE_AVATAR = (content: any) => `
<section data-section="hero" class="min-h-screen flex items-center justify-center px-6 py-24 bg-[var(--bg)]">
  <div class="text-center space-y-8 max-w-3xl mx-auto">
    <!-- Large circle avatar -->
    <div class="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
      <div class="absolute inset-0 rounded-full opacity-20 scale-110 animate-pulse"
           style="background:radial-gradient(circle,var(--primary),transparent 70%);filter:blur(20px);"></div>
      <div class="absolute inset-0 rounded-full border-4 opacity-30" style="border-color:var(--primary);transform:scale(1.05);"></div>
      <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
           ${imgFallback} data-field="hero-image"
           class="relative z-10 w-full h-full object-cover rounded-full shadow-2xl border-4"
           style="border-color:color-mix(in srgb,var(--primary) 40%,transparent);" />
    </div>
    <!-- Name -->
    <div class="space-y-2">
      <h1 class="text-5xl md:text-7xl font-black tracking-tighter text-[var(--heading)]" data-field="hero-name">
        ${content.name || 'Dr. Your Name'}
      </h1>
      <p class="text-base md:text-lg font-bold uppercase tracking-[0.2em] opacity-60" data-field="hero-title">
        ${content.title || 'Professional Title'}
      </p>
    </div>
    <!-- Divider -->
    <div class="flex items-center justify-center gap-4">
      <div class="h-px w-16 opacity-20" style="background:var(--text);"></div>
      <div class="w-2 h-2 rounded-full" style="background:var(--primary);"></div>
      <div class="h-px w-16 opacity-20" style="background:var(--text);"></div>
    </div>
    <p class="text-base opacity-60 leading-relaxed" data-field="hero-bio">
      ${content.bio || 'Dedicated professional committed to excellence and evidence-based practice.'}
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <a href="${content.cta?.link || '#contact'}"
         class="px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105"
         style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
        ${content.cta?.text || 'Book Consultation'}
      </a>
    </div>
    ${renderSocials(content.socials || [], 'flex justify-center gap-6')}
  </div>
</section>`;

// ─── 18. HERO_SPLIT_DIAGONAL ─────────────────────────────────
export const HERO_SPLIT_DIAGONAL = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex items-stretch overflow-hidden bg-[var(--bg)]">
  <div class="flex flex-col lg:flex-row w-full">
    <!-- Left: text -->
    <div class="flex-1 flex flex-col justify-center px-8 md:px-16 py-24 relative z-10 space-y-8">
      <p class="text-xs font-black uppercase tracking-[0.4em] opacity-40">${content.title || 'Designer'}</p>
      <h1 class="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-[var(--heading)]" data-field="hero-name">
        ${content.name || 'Your Name'}
      </h1>
      <div class="h-1 w-16 rounded-full" style="background:var(--primary);"></div>
      <p class="text-lg opacity-60 leading-relaxed max-w-md" data-field="hero-bio">
        ${content.bio || 'Creating sharp, diagonal design systems that slice through the noise.'}
      </p>
      <div class="flex flex-wrap gap-4">
        <a href="${content.cta?.link || '#work'}"
           class="px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105"
           style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
          ${content.cta?.text || 'View Work'}
        </a>
      </div>
      ${renderSocials(content.socials || [])}
    </div>
    <!-- Right: image with clip-path diagonal -->
    <div class="relative flex-1 min-h-64 md:min-h-screen overflow-hidden"
         style="clip-path:polygon(8% 0,100% 0,100% 100%,0% 100%);">
      <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
           ${imgFallback} data-field="hero-image"
           class="w-full h-full object-cover object-center" style="min-height:100%;" />
      <div class="absolute inset-0" style="background:linear-gradient(to right,var(--bg) 5%,transparent 30%);"></div>
    </div>
  </div>
</section>`;

// ─── 19. HERO_GRADIENT_TEXT ──────────────────────────────────
export const HERO_GRADIENT_TEXT = (content: any) => `
<section data-section="hero" class="min-h-screen flex items-center justify-center px-6 py-24 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto text-center space-y-8">
    <p class="text-xs font-bold uppercase tracking-[0.5em] opacity-40">${content.title || 'Building the future'}</p>
    <h1 class="text-7xl md:text-[12vw] font-black tracking-tighter leading-none" data-field="hero-name"
        style="background:linear-gradient(135deg,var(--heading) 0%,var(--primary) 50%,var(--secondary) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
      ${content.name || 'Your Name'}
    </h1>
    <p class="text-xl md:text-2xl opacity-55 max-w-2xl mx-auto leading-relaxed" data-field="hero-bio">
      ${content.bio || 'Crafting gradient-powered digital experiences that leave people speechless.'}
    </p>
    <div class="flex flex-wrap justify-center gap-4 pt-4">
      <a href="${content.cta?.link || '#work'}"
         class="px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-xl"
         style="background:linear-gradient(135deg,var(--primary),var(--secondary));color:var(--bg);"
         data-field="hero-ctaText">
        ${content.cta?.text || 'See My Work'}
      </a>
    </div>
    ${renderSocials(content.socials || [], 'flex justify-center gap-6 mt-4')}
  </div>
</section>`;

// ─── 20. HERO_CARD_STACK ─────────────────────────────────────
export const HERO_CARD_STACK = (content: any) => `
<section data-section="hero" class="min-h-screen flex items-center px-6 py-24 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
    <div class="space-y-8">
      <p class="text-xs font-black uppercase tracking-[0.4em] opacity-40">${content.title || 'Full Stack Developer'}</p>
      <h1 class="text-5xl md:text-7xl font-black tracking-tighter text-[var(--heading)]" data-field="hero-name">
        ${content.name || 'Your Name'}
      </h1>
      <p class="text-lg opacity-60 leading-relaxed" data-field="hero-bio">
        ${content.bio || 'Stacking solutions, one card at a time — building products people love.'}
      </p>
      <div class="flex flex-wrap gap-4">
        <a href="${content.cta?.link || '#work'}"
           class="px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105"
           style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
          ${content.cta?.text || 'View Stack'}
        </a>
      </div>
      ${renderSocials(content.socials || [])}
    </div>
    <!-- Card stack -->
    <div class="relative h-80 md:h-96">
      <div class="absolute inset-0 rounded-3xl border shadow-xl" style="background:color-mix(in srgb,var(--primary) 8%,var(--surface));border-color:color-mix(in srgb,var(--primary) 20%,transparent);transform:rotate(6deg);"></div>
      <div class="absolute inset-0 rounded-3xl border shadow-xl" style="background:color-mix(in srgb,var(--primary) 15%,var(--surface));border-color:color-mix(in srgb,var(--primary) 30%,transparent);transform:rotate(3deg);"></div>
      <div class="absolute inset-0 rounded-3xl border shadow-2xl overflow-hidden" style="background:var(--surface);border-color:color-mix(in srgb,var(--primary) 30%,transparent);">
        <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
             ${imgFallback} data-field="hero-image"
             class="w-full h-full object-cover" />
        <div class="absolute bottom-6 left-6 right-6 px-4 py-3 rounded-2xl backdrop-blur-md border"
             style="background:color-mix(in srgb,var(--bg) 80%,transparent);border-color:color-mix(in srgb,var(--text) 10%,transparent);">
          <p class="text-sm font-black text-[var(--heading)]">${content.name || 'Your Name'}</p>
          <p class="text-xs opacity-50">${content.title || 'Developer'}</p>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ─── 21. HERO_SIDEBAR_LEFT ───────────────────────────────────
export const HERO_SIDEBAR_LEFT = (content: any) => `
<section data-section="hero" class="min-h-screen flex bg-[var(--bg)]">
  <!-- Left sidebar -->
  <div class="w-16 md:w-24 shrink-0 flex flex-col items-center justify-between py-8 border-r"
       style="border-color:color-mix(in srgb,var(--text) 8%,transparent);">
    <div class="flex flex-col items-center gap-6">
      <div class="w-8 h-8 rounded-lg" style="background:var(--primary);"></div>
    </div>
    <!-- Vertical name -->
    <p class="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 hidden md:block"
       style="writing-mode:vertical-rl;transform:rotate(180deg);">
      ${content.name || 'Portfolio'}
    </p>
    <div class="flex flex-col items-center gap-4">
      ${(content.socials || []).slice(0, 3).map((s: any) => `
        <a href="${s.url || s.link || '#'}" target="_blank" rel="noopener"
           class="opacity-40 hover:opacity-100 hover:text-[var(--primary)] transition-all">
          <i class="${socialIcon(s.platform || '')} text-lg"></i>
        </a>`).join('')}
    </div>
  </div>
  <!-- Main content -->
  <div class="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 space-y-8">
    <p class="text-xs font-black uppercase tracking-[0.4em] opacity-40">${content.title || 'Creative Agency'}</p>
    <h1 class="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] text-[var(--heading)]" data-field="hero-name">
      ${content.name || 'Your Name'}
    </h1>
    <p class="text-lg opacity-60 leading-relaxed max-w-xl" data-field="hero-bio">
      ${content.bio || 'Navigating the intersection of creativity and technology to deliver transformative results.'}
    </p>
    <div class="flex flex-wrap gap-4">
      <a href="${content.cta?.link || '#work'}"
         class="px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105"
         style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
        ${content.cta?.text || 'Enter Portfolio'}
      </a>
    </div>
  </div>
  <!-- Right: image -->
  <div class="hidden lg:block w-80 xl:w-96">
    <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
         ${imgFallback} data-field="hero-image"
         class="w-full h-full object-cover" />
  </div>
</section>`;

// ─── 22. HERO_PHOTO_MOSAIC ───────────────────────────────────
export const HERO_PHOTO_MOSAIC = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex items-center overflow-hidden bg-[var(--bg)]">
  <!-- Mosaic background grid -->
  <div class="absolute inset-0 z-0 grid grid-cols-3 opacity-20">
    ${[0,1,2,3,4,5].map(i => `
      <div class="overflow-hidden">
        <img src="${content.image || ''}" alt="" loading="lazy" aria-hidden="true"
             class="w-full h-full object-cover" style="filter:grayscale(50%)saturate(50%);transform:scale(1.1);" />
      </div>`).join('')}
  </div>
  <div class="absolute inset-0 z-0" style="background:linear-gradient(135deg,var(--bg) 40%,color-mix(in srgb,var(--bg) 70%,transparent));"></div>
  <div class="max-w-7xl mx-auto px-6 py-24 w-full relative z-10">
    <div class="max-w-3xl space-y-8">
      <p class="text-xs font-black uppercase tracking-[0.5em] opacity-60" style="color:var(--primary);">${content.title || 'Photographer & Artist'}</p>
      <h1 class="text-7xl md:text-[11vw] font-black tracking-tighter leading-[0.85] text-[var(--heading)]" data-field="hero-name">
        ${content.name || 'Your Name'}
      </h1>
      <p class="text-lg opacity-65 max-w-md leading-relaxed" data-field="hero-bio">
        ${content.bio || 'Capturing moments, crafting stories, creating art that endures.'}
      </p>
      <div class="flex flex-wrap gap-4">
        <a href="${content.cta?.link || '#gallery'}"
           class="px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-xl"
           style="background:var(--primary);color:var(--bg);" data-field="hero-ctaText">
          ${content.cta?.text || 'View Gallery'}
        </a>
        ${renderSocials(content.socials || [])}
      </div>
    </div>
  </div>
</section>`;

// ─── 23. HERO_GLITCH_TEXT ────────────────────────────────────
export const HERO_GLITCH_TEXT = (content: any) => `
<section data-section="hero" class="min-h-screen flex items-center justify-center px-6 py-24" style="background:#050505;">
  <div class="max-w-5xl mx-auto text-center space-y-8 relative z-10">
    <p class="text-xs font-mono uppercase tracking-[0.5em] opacity-40 text-white">${content.title || 'Cyber Developer'}</p>
    <div class="relative inline-block">
      <h1 class="text-6xl md:text-9xl font-black tracking-tighter text-white glitch-text" data-field="hero-name"
          data-text="${content.name || 'GLITCH'}">
        ${content.name || 'GLITCH'}
      </h1>
    </div>
    <p class="text-base md:text-lg opacity-50 max-w-xl mx-auto leading-relaxed text-white" data-field="hero-bio">
      ${content.bio || 'Breaking the matrix, one line of code at a time.'}
    </p>
    <a href="${content.cta?.link || '#work'}"
       class="inline-flex items-center gap-3 px-8 py-4 font-black text-sm uppercase tracking-widest border-2 transition-all hover:scale-105"
       style="border-color:var(--primary);color:var(--primary);" data-field="hero-ctaText">
      [ ${content.cta?.text || 'Enter System'} ]
    </a>
    ${renderSocials(content.socials || [], 'flex justify-center gap-6 mt-4')}
  </div>
  <style>
    .glitch-text { position:relative; }
    .glitch-text::before,.glitch-text::after {
      content:attr(data-text); position:absolute; top:0; left:0; width:100%;
    }
    .glitch-text::before {
      color:var(--primary); animation:glitch1 3s infinite;
      clip-path:polygon(0 0,100% 0,100% 35%,0 35%);
    }
    .glitch-text::after {
      color:var(--secondary,#ff6b6b); animation:glitch2 3s infinite;
      clip-path:polygon(0 65%,100% 65%,100% 100%,0 100%);
    }
    @keyframes glitch1{0%,90%,100%{transform:none;opacity:0}91%{transform:translateX(-3px);opacity:0.8}93%{transform:translateX(3px)}95%{transform:translateX(-1px);opacity:0}}
    @keyframes glitch2{0%,85%,100%{transform:none;opacity:0}86%{transform:translateX(3px);opacity:0.6}89%{transform:translateX(-2px);opacity:0}}
  </style>
</section>`;

// ─── 24. HERO_SMOOTH_SWEEP ───────────────────────────────────
export const HERO_SMOOTH_SWEEP = (content: any) => `
<section data-section="hero" class="relative min-h-screen flex items-center overflow-hidden bg-[var(--bg)]">
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute inset-0 opacity-40"
         style="background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 10%,transparent) 0%,transparent 60%);"></div>
    <div class="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 rounded-full"
         style="background:radial-gradient(circle,var(--primary),transparent 60%);filter:blur(80px);"></div>
  </div>
  <div class="max-w-7xl mx-auto px-6 py-24 w-full relative z-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div class="space-y-8">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold"
               style="border-color:color-mix(in srgb,var(--primary) 30%,transparent);color:var(--primary);">
            <span class="w-2 h-2 rounded-full animate-pulse" style="background:var(--primary);"></span>
            ${content.availability || 'Open to Opportunities'}
          </div>
        </div>
        <h1 class="text-5xl md:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.88] text-[var(--heading)]" data-field="hero-name">
          ${content.name || 'Your Name'}
        </h1>
        <p class="text-xl font-bold opacity-70" data-field="hero-title" style="color:var(--primary);">
          ${content.title || 'Product Designer & Developer'}
        </p>
        <p class="text-base md:text-lg opacity-55 leading-relaxed max-w-lg" data-field="hero-bio">
          ${content.bio || 'I sweep through complex problems and deliver elegant, purposeful solutions that truly matter.'}
        </p>
        <div class="flex flex-wrap gap-4">
          <a href="${content.cta?.link || '#work'}"
             class="px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 hover:shadow-xl"
             style="background:var(--primary);color:var(--bg);box-shadow:0 4px 20px color-mix(in srgb,var(--primary) 25%,transparent);"
             data-field="hero-ctaText">
            ${content.cta?.text || 'View My Work'}
          </a>
          <a href="${content.cta2?.link || '#about'}"
             class="px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 border"
             style="border-color:color-mix(in srgb,var(--text) 20%,transparent);">
            About Me
          </a>
        </div>
        ${renderSocials(content.socials || [])}
      </div>
      <div class="relative flex justify-center lg:justify-end">
        <div class="relative w-80 h-96">
          <div class="absolute inset-0 rounded-[3rem] rotate-3 opacity-30"
               style="background:linear-gradient(135deg,var(--primary),var(--secondary));filter:blur(20px);"></div>
          <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
               ${imgFallback} data-field="hero-image"
               class="relative z-10 w-full h-full object-cover rounded-[2.5rem] shadow-2xl" />
        </div>
      </div>
    </div>
  </div>
</section>`;

// ─── 25. HERO_GRID_PORTRAIT ──────────────────────────────────
export const HERO_GRID_PORTRAIT = (content: any) => `
<section data-section="hero" class="min-h-screen flex items-stretch overflow-hidden bg-[var(--bg)]">
  <div class="flex flex-col lg:flex-row w-full">
    <!-- Image: 55% -->
    <div class="lg:w-[55%] relative overflow-hidden min-h-72">
      <img src="${content.image || ''}" alt="${content.name || 'Profile'}" loading="lazy"
           ${imgFallback} data-field="hero-image"
           class="w-full h-full object-cover" style="min-height:100%;" />
      <div class="absolute inset-0 lg:hidden" style="background:linear-gradient(to bottom,transparent 40%,var(--bg));"></div>
      <!-- Diagonal number watermark -->
      <div class="absolute bottom-8 left-8 hidden lg:block">
        <span class="text-[6rem] font-black opacity-10 text-white leading-none select-none">01</span>
      </div>
    </div>
    <!-- Content: 45% -->
    <div class="lg:w-[45%] flex flex-col justify-center px-8 md:px-12 lg:px-16 py-16 space-y-8">
      <div class="space-y-4">
        <p class="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">${content.title || 'Visual Director'}</p>
        <h1 class="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] text-[var(--heading)]" data-field="hero-name">
          ${content.name || 'Your Name'}
        </h1>
        <div class="h-0.5 w-12" style="background:var(--primary);"></div>
      </div>
      <p class="text-base md:text-lg opacity-60 leading-relaxed" data-field="hero-bio">
        ${content.bio || 'Directing visual narratives with precision and creative boldness across all mediums.'}
      </p>
      <div class="space-y-4">
        <a href="${content.cta?.link || '#work'}"
           class="flex items-center gap-4 font-bold text-base group w-fit"
           style="color:var(--heading);" data-field="hero-ctaText">
          ${content.cta?.text || 'View Portfolio'}
          <span class="transform group-hover:translate-x-2 transition-transform text-xl" style="color:var(--primary);">→</span>
        </a>
        ${content.location ? `<p class="text-xs opacity-40 uppercase tracking-widest">📍 ${content.location}</p>` : ''}
        ${renderSocials(content.socials || [])}
      </div>
    </div>
  </div>
</section>`;

// ─── Registry export ─────────────────────────────────────────
export const HeroRegistry = {
  HERO_MODERN_SPLIT,
  HERO_CENTERED_MINIMAL,
  HERO_CYBER_MONO,
  HERO_VISUALIST,
  HERO_EXECUTIVE,
  HERO_GLASS_FLOATING,
  HERO_NEOBRUTALIST,
  HERO_MINIMAL_LEFT,
  HERO_STACKED_BOLD,
  HERO_GRID_LAYOUT,
  HERO_DYNAMIC_GRADIENT,
  HERO_MINIMAL_ELEGANCE,
  HERO_TERMINAL_STYLE,
  HERO_VIDEO_BG,
  HERO_MAGAZINE,
  HERO_PARALLAX_LAYERS,
  HERO_CIRCLE_AVATAR,
  HERO_SPLIT_DIAGONAL,
  HERO_GRADIENT_TEXT,
  HERO_CARD_STACK,
  HERO_SIDEBAR_LEFT,
  HERO_PHOTO_MOSAIC,
  HERO_GLITCH_TEXT,
  HERO_SMOOTH_SWEEP,
  HERO_GRID_PORTRAIT,
};
