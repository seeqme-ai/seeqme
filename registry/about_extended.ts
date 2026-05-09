// ============================================================
// SEEQME ABOUT EXTENDED REGISTRY — 6 additional about section styles
// ============================================================

const imgFallbackAbout = `onerror="this.onerror=null;this.style.background='linear-gradient(135deg,var(--primary) 20%,var(--surface))';"`;

export const AboutExtendedRegistry: Record<string, (content: any) => string> = {

  // ─── 1. ABOUT_BENTO_CREATIVE ─────────────────────────────────────────────
  ABOUT_BENTO_CREATIVE: (content: any) => {
    const highlights = Array.isArray(content.highlights) ? content.highlights : [];
    return `
<section data-section="about" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-12 space-y-2">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">About</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="about-title">${content.title || 'About Me'}</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
      <!-- Full-width name card -->
      <div class="md:col-span-3 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6"
           style="background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 15%,var(--surface)),var(--surface));">
        ${content.image ? `
        <div class="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2" style="border-color:var(--primary);">
          <img src="${content.image}" alt="${content.name || ''}" ${imgFallbackAbout} class="w-full h-full object-cover" />
        </div>` : ''}
        <div class="flex-1">
          <h3 class="text-3xl md:text-4xl font-black text-[var(--heading)] leading-tight">${content.name || 'Your Name'}</h3>
        </div>
        ${content.cta?.link ? `
        <a href="${content.cta.link}" class="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
           style="background:var(--primary);color:var(--bg);">
          ${content.cta.text || 'Get in Touch'} <i class="fas fa-arrow-right"></i>
        </a>` : ''}
      </div>
      <!-- Bio card -->
      <div class="md:col-span-2 rounded-2xl p-8" style="background:var(--surface);">
        <p class="text-base text-[var(--text)] opacity-70 leading-loose">${content.bio || 'A passionate professional dedicated to creating meaningful work.'}</p>
      </div>
      <!-- Highlights count card -->
      <div class="rounded-2xl p-8 flex flex-col justify-between gap-6"
           style="background:color-mix(in srgb,var(--primary) 10%,var(--surface));">
        <i class="fas fa-star text-2xl" style="color:var(--primary);"></i>
        <div>
          <p class="text-5xl font-black text-[var(--heading)]">${highlights.length || 0}</p>
          <p class="text-xs font-black uppercase tracking-wider opacity-50 text-[var(--text)] mt-1">Key Highlights</p>
        </div>
      </div>
      <!-- Highlights row -->
      ${highlights.map((h: string) => `
      <div class="rounded-2xl p-6 border border-[var(--text)]/10 hover:border-[var(--primary)]/30 transition-all duration-300 hover:-translate-y-1"
           style="background:var(--surface);">
        <i class="fas fa-check-circle mb-3 text-lg" style="color:var(--primary);"></i>
        <p class="text-sm font-bold text-[var(--text)] opacity-80">${h}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 2. ABOUT_DARK_SPLIT ─────────────────────────────────────────────────
  ABOUT_DARK_SPLIT: (content: any) => {
    const highlights = Array.isArray(content.highlights) ? content.highlights : [];
    return `
<section data-section="about" class="relative py-20 md:py-28 bg-[var(--surface)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
      <!-- Image -->
      <div class="w-full lg:w-2/5 flex-shrink-0 flex justify-center">
        <div class="relative">
          <div class="w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden border-4 relative z-10"
               style="border-color:var(--primary);">
            ${content.image
              ? `<img src="${content.image}" alt="${content.name || ''}" ${imgFallbackAbout} class="w-full h-full object-cover" />`
              : `<div class="w-full h-full flex items-center justify-center text-7xl font-black" style="background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 50%,var(--bg)));color:var(--bg);">${(content.name || 'U').charAt(0)}</div>`}
          </div>
          <!-- Decorative offset box -->
          <div class="absolute -bottom-4 -right-4 w-full h-full rounded-3xl border-2 z-0"
               style="border-color:color-mix(in srgb,var(--primary) 30%,transparent);"></div>
        </div>
      </div>
      <!-- Content -->
      <div class="flex-1 space-y-7">
        <div>
          <span class="text-xs font-black uppercase tracking-[0.4em] block mb-3" style="color:var(--primary);">About</span>
          <h2 class="text-4xl md:text-5xl font-black text-[var(--heading)] leading-tight" data-field="about-title">${content.name || 'Your Name'}</h2>
          <p class="text-lg font-bold mt-2 bg-clip-text text-transparent"
             style="background-image:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 60%,var(--text)));">${content.title || ''}</p>
        </div>
        <p class="text-base text-[var(--text)] opacity-70 leading-loose max-w-xl">${content.bio || ''}</p>
        ${highlights.length > 0 ? `
        <ul class="space-y-3">
          ${highlights.map((h: string) => `
          <li class="flex items-start gap-3 text-sm text-[var(--text)] opacity-70">
            <i class="fas fa-arrow-right mt-0.5 flex-shrink-0" style="color:var(--primary);"></i>${h}
          </li>`).join('')}
        </ul>` : ''}
        ${content.cta?.link ? `
        <a href="${content.cta.link}" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105 hover:shadow-xl mt-2"
           style="background:var(--primary);color:var(--bg);">
          ${content.cta.text || 'Let\'s Connect'} <i class="fas fa-arrow-right"></i>
        </a>` : ''}
      </div>
    </div>
  </div>
</section>`;
  },

  // ─── 3. ABOUT_MAGAZINE_STORY ─────────────────────────────────────────────
  ABOUT_MAGAZINE_STORY: (content: any) => {
    const highlights = Array.isArray(content.highlights) ? content.highlights : [];
    const bio = content.bio || '';
    const pullQuote = bio.split('.')[0] + (bio.includes('.') ? '.' : '');
    const restBio = bio.slice(pullQuote.length).trim();
    return `
<section data-section="about" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-10 flex items-center gap-3">
      <div class="h-px flex-1" style="background:var(--primary);"></div>
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">About</span>
      <div class="h-px flex-1" style="background:var(--primary);"></div>
    </div>
    <!-- Pull quote -->
    <blockquote class="text-3xl md:text-4xl lg:text-5xl font-black italic text-[var(--heading)] leading-tight mb-14 max-w-5xl"
                data-field="about-bio-pullquote">
      "${pullQuote || content.name || 'A professional dedicated to excellence.'}"
    </blockquote>
    <!-- Two-column body -->
    <div class="flex flex-col lg:flex-row gap-12 mb-14">
      <!-- Bio text -->
      <div class="lg:w-1/2">
        <p class="text-base text-[var(--text)] opacity-70 leading-loose">${restBio || bio}</p>
      </div>
      <!-- Image + highlights -->
      <div class="lg:w-1/2 flex flex-col gap-6">
        ${content.image ? `
        <div class="rounded-2xl overflow-hidden aspect-video">
          <img src="${content.image}" alt="${content.name || ''}" ${imgFallbackAbout} class="w-full h-full object-cover" />
        </div>` : ''}
        <div class="rounded-2xl p-6 border border-[var(--text)]/10" style="background:var(--surface);">
          <h4 class="text-xs font-black uppercase tracking-[0.3em] mb-4" style="color:var(--primary);">Highlights</h4>
          <ul class="space-y-2">
            ${highlights.map((h: string) => `
            <li class="flex items-start gap-2 text-sm text-[var(--text)] opacity-70">
              <span class="mt-1 flex-shrink-0" style="color:var(--primary);">◆</span>${h}
            </li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
    <!-- CTA banner -->
    ${content.cta?.link ? `
    <div class="rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
         style="background:var(--primary);">
      <p class="text-lg font-black text-[var(--bg)]">${content.cta.text || 'Ready to work together?'}</p>
      <a href="${content.cta.link}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 bg-[var(--bg)] flex-shrink-0" style="color:var(--primary);">
        Get In Touch <i class="fas fa-arrow-right"></i>
      </a>
    </div>` : ''}
  </div>
</section>`;
  },

  // ─── 4. ABOUT_CENTERED_CLEAN ─────────────────────────────────────────────
  ABOUT_CENTERED_CLEAN: (content: any) => {
    const highlights = Array.isArray(content.highlights) ? content.highlights : [];
    return `
<section data-section="about" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <!-- Avatar -->
    ${content.image ? `
    <div class="w-28 h-28 rounded-full overflow-hidden mx-auto mb-8 border-4" style="border-color:var(--primary);">
      <img src="${content.image}" alt="${content.name || ''}" ${imgFallbackAbout} class="w-full h-full object-cover" />
    </div>` : `
    <div class="w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl font-black border-4"
         style="border-color:var(--primary);background:color-mix(in srgb,var(--primary) 15%,var(--surface));color:var(--primary);">
      ${(content.name || 'U').charAt(0)}
    </div>`}
    <!-- Name + title -->
    <span class="text-xs font-black uppercase tracking-[0.4em] mb-4 block" style="color:var(--primary);">About</span>
    <h2 class="text-4xl md:text-5xl font-black text-[var(--heading)] mb-2 tracking-tight" data-field="about-name">${content.name || 'Your Name'}</h2>
    ${content.title ? `<p class="text-lg font-bold mb-6 opacity-60 text-[var(--text)]">${content.title}</p>` : ''}
    <!-- Bio -->
    <p class="text-base text-[var(--text)] opacity-70 leading-loose max-w-2xl mx-auto mb-12">${content.bio || ''}</p>
    <!-- Highlights grid -->
    ${highlights.length > 0 ? `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      ${highlights.map((h: string) => `
      <div class="rounded-2xl p-5 border border-[var(--text)]/10 hover:border-[var(--primary)]/30 transition-all duration-300"
           style="background:var(--surface);">
        <i class="fas fa-check-circle mb-3 text-base" style="color:var(--primary);"></i>
        <p class="text-sm text-[var(--text)] opacity-70">${h}</p>
      </div>`).join('')}
    </div>` : ''}
    <!-- CTA -->
    ${content.cta?.link ? `
    <a href="${content.cta.link}" class="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105 hover:shadow-xl"
       style="background:var(--primary);color:var(--bg);">
      ${content.cta.text || 'Let\'s Talk'} <i class="fas fa-arrow-right"></i>
    </a>` : ''}
  </div>
</section>`;
  },

  // ─── 5. ABOUT_CREATIVE_DIAGONAL ──────────────────────────────────────────
  ABOUT_CREATIVE_DIAGONAL: (content: any) => {
    const highlights = Array.isArray(content.highlights) ? content.highlights : [];
    return `
<section data-section="about" class="relative py-20 md:py-28 bg-[var(--bg)] overflow-hidden">
  <!-- Diagonal stripe -->
  <div class="absolute inset-0 pointer-events-none" style="z-index:0;">
    <div class="absolute -top-20 -left-20 w-[140%] h-[60%]"
         style="background:color-mix(in srgb,var(--primary) 6%,transparent);transform:skewY(-4deg);transform-origin:top left;"></div>
  </div>
  <div class="relative z-10 max-w-6xl mx-auto px-6">
    <div class="mb-12">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">About</span>
    </div>
    <div class="flex flex-col lg:flex-row gap-12 items-center">
      <!-- Image -->
      <div class="w-full lg:w-2/5 flex-shrink-0">
        <div class="relative w-full max-w-sm mx-auto">
          <div class="rounded-3xl overflow-hidden shadow-2xl" style="aspect-ratio:4/5;">
            ${content.image
              ? `<img src="${content.image}" alt="${content.name || ''}" ${imgFallbackAbout} class="w-full h-full object-cover" />`
              : `<div class="w-full h-full flex items-center justify-center text-8xl font-black" style="background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 50%,var(--surface)));color:var(--bg);">${(content.name || 'U').charAt(0)}</div>`}
          </div>
          <!-- Floating badge -->
          <div class="absolute -bottom-5 -right-5 rounded-2xl px-5 py-4 shadow-xl"
               style="background:var(--primary);">
            <p class="text-xs font-black text-[var(--bg)] uppercase tracking-wider">Available</p>
            <p class="text-lg font-black text-[var(--bg)]">For Work</p>
          </div>
        </div>
      </div>
      <!-- Text content -->
      <div class="flex-1 space-y-7">
        <h2 class="text-4xl md:text-5xl font-black text-[var(--heading)] leading-tight tracking-tight" data-field="about-name">${content.name || 'Your Name'}</h2>
        <p class="text-base text-[var(--text)] opacity-70 leading-loose">${content.bio || ''}</p>
        ${highlights.length > 0 ? `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${highlights.map((h: string) => `
          <div class="flex items-start gap-2 text-sm text-[var(--text)] opacity-70">
            <i class="fas fa-arrow-right mt-0.5 flex-shrink-0" style="color:var(--primary);"></i>${h}
          </div>`).join('')}
        </div>` : ''}
        ${content.cta?.link ? `
        <a href="${content.cta.link}" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105 hover:shadow-xl"
           style="background:var(--primary);color:var(--bg);">
          ${content.cta.text || 'Get In Touch'} <i class="fas fa-arrow-right"></i>
        </a>` : ''}
      </div>
    </div>
  </div>
</section>`;
  },

  // ─── 6. ABOUT_SKILLS_INLINE ──────────────────────────────────────────────
  ABOUT_SKILLS_INLINE: (content: any) => {
    const highlights = Array.isArray(content.highlights) ? content.highlights : [];
    return `
<section data-section="about" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <!-- Top: name + bio in 2-col -->
    <div class="flex flex-col lg:flex-row gap-12 items-start mb-14">
      <!-- Left -->
      <div class="lg:w-1/2 space-y-5">
        <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">About</span>
        <h2 class="text-5xl md:text-6xl font-black text-[var(--heading)] leading-tight tracking-tight" data-field="about-name">${content.name || 'Your Name'}</h2>
        ${content.title ? `<p class="text-lg font-bold opacity-60 text-[var(--text)]">${content.title}</p>` : ''}
      </div>
      <!-- Right -->
      <div class="lg:w-1/2 space-y-5 lg:pt-14">
        ${content.image ? `
        <div class="w-16 h-16 rounded-2xl overflow-hidden border-2 mb-3" style="border-color:var(--primary);">
          <img src="${content.image}" alt="${content.name || ''}" ${imgFallbackAbout} class="w-full h-full object-cover" />
        </div>` : ''}
        <p class="text-base text-[var(--text)] opacity-70 leading-loose">${content.bio || ''}</p>
        ${content.cta?.link ? `
        <a href="${content.cta.link}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
           style="background:var(--primary);color:var(--bg);">
          ${content.cta.text || 'Get In Touch'} <i class="fas fa-arrow-right"></i>
        </a>` : ''}
      </div>
    </div>
    <!-- Skills preview -->
    ${highlights.length > 0 ? `
    <div class="border-t border-[var(--text)]/10 pt-10">
      <h3 class="text-xs font-black uppercase tracking-[0.4em] mb-6 opacity-50 text-[var(--text)]">What I Work With</h3>
      <div class="flex flex-wrap gap-2">
        ${highlights.map((h: string, i: number) => `
        <span class="text-sm font-bold px-4 py-2 rounded-full border transition-all duration-300 hover:scale-105 cursor-default"
              style="${i % 4 === 0 ? 'background:var(--primary);color:var(--bg);border-color:var(--primary);' : 'background:var(--surface);color:var(--text);border-color:color-mix(in srgb,var(--text) 15%,transparent);opacity:0.9;'}">
          ${h}
        </span>`).join('')}
      </div>
    </div>` : ''}
  </div>
</section>`;
  },

};
