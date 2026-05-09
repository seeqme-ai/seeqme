// ============================================================
// SEEQME PROJECT EXTENDED REGISTRY — 12 additional project section styles
// ============================================================

const imgFallbackExt = `onerror="this.onerror=null;this.style.background='linear-gradient(135deg,var(--primary) 20%,var(--surface))';this.style.minHeight='200px';"`;

const getTechExt = (item: any): string[] => {
  if (Array.isArray(item.tech)) return item.tech;
  if (Array.isArray(item.technologies)) return item.technologies;
  if (typeof item.tech === 'string') return item.tech.split(',').map((t: string) => t.trim()).filter(Boolean);
  if (typeof item.tags === 'string') return item.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  if (Array.isArray(item.tags)) return item.tags;
  return [];
};

const techPillsExt = (item: any, max = 5) =>
  getTechExt(item).slice(0, max).map((t: string) =>
    `<span class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider whitespace-nowrap"
           style="background:color-mix(in srgb,var(--primary) 12%,var(--surface));color:var(--primary);border:1px solid color-mix(in srgb,var(--primary) 25%,transparent);">${t}</span>`
  ).join('');

const extLinks = (item: any) => `
  <div class="flex items-center gap-4 flex-wrap">
    ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"
       class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
       style="background:var(--primary);color:var(--bg);">
      <i class="fas fa-external-link-alt"></i> Live Demo
    </a>` : ''}
    ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener"
       class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition-all duration-300 hover:scale-105"
       style="border-color:var(--primary);color:var(--primary);">
      <i class="fab fa-github"></i> Code
    </a>` : ''}
  </div>`;

const gradientPlaceholder = (index: number) => {
  const gradients = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#0ea5e9,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#ec4899,#8b5cf6)',
    'linear-gradient(135deg,#f97316,#eab308)',
  ];
  return gradients[index % gradients.length];
};

export const ProjectExtendedRegistry: Record<string, (content: any) => string> = {

  // ─── 1. PROJ_ALTERNATING_ROWS ───────────────────────────────────────────────
  PROJ_ALTERNATING_ROWS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-16 space-y-4">
      <div class="flex items-center gap-3">
        <div class="h-px w-12" style="background:var(--primary);"></div>
        <span class="text-xs font-black uppercase tracking-[0.3em]" style="color:var(--primary);">Selected Work</span>
      </div>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
      ${content.subtitle ? `<p class="text-lg text-[var(--text)] opacity-60 max-w-xl">${content.subtitle}</p>` : ''}
    </div>
    <div class="flex flex-col gap-20">
      ${items.map((item: any, i: number) => `
      <div class="flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-center group">
        <!-- Image -->
        <div class="w-full lg:w-1/2 flex-shrink-0">
          <div class="aspect-video rounded-2xl overflow-hidden relative shadow-2xl group-hover:shadow-[0_30px_60px_-10px] transition-all duration-500"
               style="background:${gradientPlaceholder(i)};">
            ${item.image ? `<img src="${item.image}" alt="${item.title || ''}" ${imgFallbackExt} loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />` : ''}
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 style="background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 20%,transparent),transparent);"></div>
          </div>
        </div>
        <!-- Content -->
        <div class="w-full lg:w-1/2 space-y-5">
          <span class="text-xs font-black uppercase tracking-[0.3em] opacity-50 text-[var(--text)]">Project ${String(i + 1).padStart(2, '0')}</span>
          <h3 class="text-3xl md:text-4xl font-black text-[var(--heading)] leading-tight">${item.title || 'Untitled Project'}</h3>
          <p class="text-[var(--text)] opacity-70 leading-relaxed text-base">${item.description || ''}</p>
          <div class="flex flex-wrap gap-2">${techPillsExt(item)}</div>
          ${extLinks(item)}
        </div>
      </div>
      ${i < items.length - 1 ? `<div class="border-t border-[var(--text)]/10"></div>` : ''}
      `).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 2. PROJ_SPOTLIGHT ──────────────────────────────────────────────────────
  PROJ_SPOTLIGHT: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    const featured = items[0];
    const rest = items.slice(1);
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.3em]" style="color:var(--primary);">Featured Work</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60">${content.subtitle}</p>` : ''}
    </div>
    ${featured ? `
    <!-- Hero Project -->
    <div class="relative rounded-3xl overflow-hidden mb-12 group"
         style="background:linear-gradient(135deg,var(--surface),color-mix(in srgb,var(--primary) 10%,var(--surface)));">
      <div class="absolute inset-0" style="background:${gradientPlaceholder(0)};opacity:0.08;"></div>
      ${featured.image ? `<img src="${featured.image}" alt="${featured.title || ''}" ${imgFallbackExt} loading="lazy" class="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500" />` : ''}
      <div class="relative z-10 p-10 md:p-16">
        <div class="max-w-3xl space-y-6">
          <span class="inline-block text-xs font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full"
                style="background:color-mix(in srgb,var(--primary) 15%,transparent);color:var(--primary);">Hero Project</span>
          <h3 class="text-4xl md:text-5xl font-black text-[var(--heading)] leading-tight">${featured.title || 'Featured Project'}</h3>
          <p class="text-[var(--text)] opacity-70 text-lg leading-relaxed max-w-2xl">${featured.description || ''}</p>
          <div class="flex flex-wrap gap-2">${techPillsExt(featured, 6)}</div>
          ${extLinks(featured)}
        </div>
      </div>
    </div>` : ''}
    <!-- Other Projects -->
    ${rest.length > 0 ? `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${rest.map((item: any, i: number) => `
      <div class="rounded-2xl p-6 border border-[var(--text)]/10 hover:border-[var(--primary)]/40 transition-all duration-300 hover:shadow-xl group"
           style="background:var(--surface);">
        <div class="w-full h-2 rounded-full mb-5" style="background:${gradientPlaceholder(i + 1)};"></div>
        <h4 class="text-lg font-black text-[var(--heading)] mb-2 group-hover:text-[color:var(--primary)] transition-colors">${item.title || 'Project'}</h4>
        <p class="text-[var(--text)] opacity-60 text-sm leading-relaxed line-clamp-2 mb-4">${item.description || ''}</p>
        <div class="flex flex-wrap gap-1.5 mb-4">${techPillsExt(item, 3)}</div>
        <div class="flex items-center gap-3">
          ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="text-xs font-bold transition-all hover:scale-105" style="color:var(--primary);"><i class="fas fa-external-link-alt mr-1"></i>Live</a>` : ''}
          ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener" class="text-xs font-bold opacity-50 hover:opacity-100 transition-all text-[var(--text)]"><i class="fab fa-github mr-1"></i>Code</a>` : ''}
        </div>
      </div>`).join('')}
    </div>` : ''}
  </div>
</section>`;
  },

  // ─── 3. PROJ_MAGAZINE_GRID ──────────────────────────────────────────────────
  PROJ_MAGAZINE_GRID: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-3">
        <span class="text-xs font-black uppercase tracking-[0.3em]" style="color:var(--primary);">Portfolio</span>
        <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
      </div>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-xs">${content.subtitle}</p>` : ''}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px]">
      ${items.map((item: any, i: number) => `
      <div class="${i === 0 ? 'md:col-span-2 md:row-span-2' : ''} relative rounded-2xl overflow-hidden group cursor-pointer"
           style="background:${gradientPlaceholder(i)};">
        ${item.image ? `<img src="${item.image}" alt="${item.title || ''}" ${imgFallbackExt} loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />` : ''}
        <div class="absolute inset-0 transition-opacity duration-300"
             style="background:linear-gradient(to top, rgba(0,0,0,0.85) ${i === 0 ? '40%' : '60%'}, rgba(0,0,0,0.1) 100%);"></div>
        <div class="absolute bottom-0 left-0 right-0 p-${i === 0 ? '10' : '6'} space-y-2">
          <div class="flex flex-wrap gap-1.5">${techPillsExt(item, i === 0 ? 5 : 2)}</div>
          <h3 class="${i === 0 ? 'text-3xl md:text-4xl' : 'text-xl'} font-black text-[var(--bg)] leading-tight">${item.title || 'Project'}</h3>
          ${i === 0 ? `<p class="text-sm text-[var(--bg)] opacity-70 max-w-lg line-clamp-2">${item.description || ''}</p>` : ''}
          ${i === 0 ? extLinks(item) : `
          <div class="flex gap-3 opacity-80">
            ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="text-xs font-bold text-[var(--bg)] opacity-80 hover:opacity-100"><i class="fas fa-arrow-right"></i></a>` : ''}
          </div>`}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 4. PROJ_NEON_CARDS ─────────────────────────────────────────────────────
  PROJ_NEON_CARDS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--surface)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-14 text-center space-y-4">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Work</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg mx-auto">${content.subtitle}</p>` : ''}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${items.map((item: any, i: number) => `
      <div class="relative rounded-2xl p-6 border-t-2 group transition-all duration-300 hover:-translate-y-2"
           style="background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:24px 24px;background-color:color-mix(in srgb,var(--bg) 60%,var(--surface));border-top-color:var(--primary);border-left:1px solid color-mix(in srgb,var(--primary) 10%,transparent);border-right:1px solid color-mix(in srgb,var(--primary) 10%,transparent);border-bottom:1px solid color-mix(in srgb,var(--primary) 10%,transparent);box-shadow:0 0 0 0 color-mix(in srgb,var(--primary) 0%,transparent);"
           onmouseover="this.style.boxShadow='0 8px 40px -8px color-mix(in srgb,var(--primary) 40%,transparent),0 0 0 1px color-mix(in srgb,var(--primary) 20%,transparent)'"
           onmouseout="this.style.boxShadow='0 0 0 0 transparent'">
        <div class="flex items-center justify-between mb-5">
          <span class="text-xs font-black uppercase tracking-[0.3em] opacity-40 text-[var(--text)]">${String(i + 1).padStart(2, '0')}</span>
          <div class="flex gap-2">
            ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110" style="background:color-mix(in srgb,var(--primary) 15%,transparent);color:var(--primary);"><i class="fas fa-external-link-alt text-xs"></i></a>` : ''}
            ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener" class="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 opacity-60 hover:opacity-100" style="background:color-mix(in srgb,var(--text) 10%,transparent);color:var(--text);"><i class="fab fa-github text-xs"></i></a>` : ''}
          </div>
        </div>
        <h3 class="text-xl font-black mb-2 bg-clip-text text-transparent"
            style="background-image:linear-gradient(135deg,var(--heading),var(--primary));">${item.title || 'Project'}</h3>
        <p class="text-sm text-[var(--text)] opacity-60 leading-relaxed mb-4 line-clamp-3">${item.description || ''}</p>
        <div class="flex flex-wrap gap-1.5">${techPillsExt(item, 4)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 5. PROJ_GLASS_CARDS ────────────────────────────────────────────────────
  PROJ_GLASS_CARDS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--bg)] overflow-hidden">
  <!-- Background blobs -->
  <div class="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none -translate-x-1/2 -translate-y-1/4"
       style="background:radial-gradient(circle,var(--primary),transparent 70%);filter:blur(80px);"></div>
  <div class="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none translate-x-1/3 translate-y-1/4"
       style="background:radial-gradient(circle,var(--secondary, var(--primary)),transparent 70%);filter:blur(80px);"></div>
  <div class="relative z-10 max-w-7xl mx-auto px-6">
    <div class="mb-14 space-y-4">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Portfolio</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg">${content.subtitle}</p>` : ''}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${items.map((item: any, i: number) => `
      <div class="relative rounded-2xl p-7 border border-white/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group"
           style="background:color-mix(in srgb,var(--surface) 30%,transparent);">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-sm font-black"
             style="background:color-mix(in srgb,var(--primary) 15%,transparent);color:var(--primary);">
          ${String(i + 1).padStart(2, '0')}
        </div>
        <h3 class="text-xl font-black text-[var(--heading)] mb-3 relative">
          ${item.title || 'Project'}
          <span class="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                style="background:var(--primary);"></span>
        </h3>
        <p class="text-sm text-[var(--text)] opacity-60 leading-relaxed mb-4 line-clamp-3">${item.description || ''}</p>
        <div class="flex flex-wrap gap-1.5 mb-5">${techPillsExt(item, 4)}</div>
        <div class="flex items-center gap-3">
          ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="text-xs font-bold transition-all hover:scale-105" style="color:var(--primary);"><i class="fas fa-external-link-alt mr-1"></i>Live</a>` : ''}
          ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener" class="text-xs font-bold opacity-50 hover:opacity-100 transition-all text-[var(--text)]"><i class="fab fa-github mr-1"></i>Code</a>` : ''}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 6. PROJ_NUMBERED_SHOWCASE ──────────────────────────────────────────────
  PROJ_NUMBERED_SHOWCASE: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-2">
        <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Selected Work</span>
        <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
      </div>
      ${content.subtitle ? `<p class="text-sm text-[var(--text)] opacity-60 max-w-xs">${content.subtitle}</p>` : ''}
    </div>
    <div class="flex flex-col divide-y divide-[var(--text)]/10">
      ${items.map((item: any, i: number) => `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 py-10 items-center group hover:bg-[var(--surface)]/30 transition-colors duration-300 px-4 -mx-4 rounded-xl">
        <!-- Number -->
        <div class="lg:col-span-2">
          <span class="text-7xl md:text-8xl font-black opacity-10 group-hover:opacity-20 transition-opacity duration-300 text-[var(--heading)] leading-none select-none">${String(i + 1).padStart(2, '0')}</span>
        </div>
        <!-- Name + Tech -->
        <div class="lg:col-span-5 space-y-3">
          <h3 class="text-2xl md:text-3xl font-black text-[var(--heading)] group-hover:text-[color:var(--primary)] transition-colors duration-300">${item.title || 'Project'}</h3>
          <div class="flex flex-wrap gap-1.5">${techPillsExt(item, 5)}</div>
        </div>
        <!-- Description + Button -->
        <div class="lg:col-span-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p class="text-sm text-[var(--text)] opacity-60 leading-relaxed line-clamp-2 max-w-xs">${item.description || ''}</p>
          <div class="flex items-center gap-3 flex-shrink-0">
            ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"
               class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group-hover:translate-x-1"
               style="background:var(--primary);color:var(--bg);">
              <i class="fas fa-arrow-right text-xs"></i>
            </a>` : ''}
            ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener"
               class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-60 hover:opacity-100"
               style="border:1px solid var(--text);color:var(--text);">
              <i class="fab fa-github text-xs"></i>
            </a>` : ''}
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 7. PROJ_HORIZONTAL_CARDS ───────────────────────────────────────────────
  PROJ_HORIZONTAL_CARDS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-5xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Projects</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg">${content.subtitle}</p>` : ''}
    </div>
    <div class="flex flex-col gap-4">
      ${items.map((item: any, i: number) => `
      <div class="flex flex-col sm:flex-row rounded-2xl overflow-hidden border border-[var(--text)]/10 hover:border-[var(--primary)]/40 group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
           style="background:var(--surface);">
        <!-- Color strip / image -->
        <div class="sm:w-1/3 min-h-[160px] sm:min-h-0 flex-shrink-0 relative overflow-hidden"
             style="background:${gradientPlaceholder(i)};">
          ${item.image ? `<img src="${item.image}" alt="${item.title || ''}" ${imgFallbackExt} loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />` : ''}
        </div>
        <!-- Content -->
        <div class="flex-1 p-6 flex flex-col justify-between gap-4">
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-4">
              <h3 class="text-xl font-black text-[var(--heading)]">${item.title || 'Project'}</h3>
              <span class="text-xs font-black opacity-30 text-[var(--text)] flex-shrink-0">${String(i + 1).padStart(2, '0')}</span>
            </div>
            <p class="text-sm text-[var(--text)] opacity-60 leading-relaxed line-clamp-2">${item.description || ''}</p>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap gap-1.5">${techPillsExt(item, 4)}</div>
            <div class="flex items-center gap-3">
              ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="text-xs font-bold transition-all hover:scale-105" style="color:var(--primary);"><i class="fas fa-external-link-alt mr-1"></i>Live</a>` : ''}
              ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener" class="text-xs font-bold opacity-50 hover:opacity-100 transition-all text-[var(--text)]"><i class="fab fa-github mr-1"></i>Code</a>` : ''}
            </div>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 8. PROJ_COMPACT_GRID ───────────────────────────────────────────────────
  PROJ_COMPACT_GRID: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-12 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Work</span>
      <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      ${items.map((item: any, i: number) => `
      <div class="rounded-xl p-5 border border-[var(--text)]/10 hover:border-[var(--primary)]/40 group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
           style="background:var(--surface);">
        <div class="flex items-center justify-between mb-4">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:color-mix(in srgb,var(--primary) 12%,transparent);">
            <i class="fas fa-code text-sm" style="color:var(--primary);"></i>
          </div>
          <div class="flex items-center gap-2">
            ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="opacity-0 group-hover:opacity-100 transition-all text-xs" style="color:var(--primary);"><i class="fas fa-external-link-alt"></i></a>` : ''}
            ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener" class="opacity-0 group-hover:opacity-100 transition-all text-xs opacity-60 hover:opacity-100 text-[var(--text)]"><i class="fab fa-github"></i></a>` : ''}
          </div>
        </div>
        <h3 class="text-sm font-black text-[var(--heading)] mb-1.5 line-clamp-1">${item.title || 'Project'}</h3>
        <p class="text-xs text-[var(--text)] opacity-60 leading-relaxed line-clamp-2 mb-3">${item.description || ''}</p>
        <div class="flex flex-wrap gap-1">
          ${getTechExt(item).slice(0, 2).map((t: string) =>
            `<span class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style="background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary);">${t}</span>`
          ).join('')}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 9. PROJ_DARK_SHOWCASE ──────────────────────────────────────────────────
  PROJ_DARK_SHOWCASE: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--surface)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Showcase</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg">${content.subtitle}</p>` : ''}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      ${items.map((item: any, i: number) => `
      <div class="relative rounded-2xl overflow-hidden min-h-[420px] flex flex-col justify-end group"
           style="background:${gradientPlaceholder(i)};">
        ${item.image ? `<img src="${item.image}" alt="${item.title || ''}" ${imgFallbackExt} loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />` : ''}
        <div class="absolute inset-0 transition-all duration-500"
             style="background:linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.05) 100%);"></div>
        <div class="relative z-10 p-8 space-y-4">
          <div class="flex flex-wrap gap-1.5">${techPillsExt(item, 4)}</div>
          <h3 class="text-2xl md:text-3xl font-black text-[var(--bg)] leading-tight">${item.title || 'Project'}</h3>
          <p class="text-sm text-[var(--bg)] opacity-70 line-clamp-2 max-w-sm">${item.description || ''}</p>
          <div class="flex items-center gap-3 pt-2">
            ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"
               class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
               style="background:var(--primary);color:var(--bg);">
              <i class="fas fa-external-link-alt"></i> View Project
            </a>` : ''}
            ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener"
               class="w-9 h-9 rounded-full flex items-center justify-center border border-white/30 text-[var(--bg)] hover:bg-white/20 transition-all">
              <i class="fab fa-github text-sm"></i>
            </a>` : ''}
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 10. PROJ_AGENCY_CASE_STUDY ─────────────────────────────────────────────
  PROJ_AGENCY_CASE_STUDY: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-2">
        <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Case Studies</span>
        <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
      </div>
    </div>
    <div class="flex flex-col">
      ${items.map((item: any, i: number) => `
      <div class="border-t border-[var(--text)]/15 py-14">
        <div class="flex flex-col lg:flex-row lg:items-start gap-8">
          <!-- Project name -->
          <div class="lg:w-1/3">
            <span class="text-xs font-black uppercase tracking-[0.3em] opacity-40 text-[var(--text)] block mb-3">${String(i + 1).padStart(2, '0')} / Project</span>
            <h3 class="text-3xl md:text-4xl font-black text-[var(--heading)] leading-tight">${item.title || 'Project'}</h3>
            <div class="flex flex-wrap gap-1.5 mt-4">${techPillsExt(item, 4)}</div>
            <div class="mt-5 flex gap-3">
              ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="text-xs font-bold" style="color:var(--primary);"><i class="fas fa-external-link-alt mr-1"></i>Live</a>` : ''}
              ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener" class="text-xs font-bold opacity-50 hover:opacity-100 transition-all text-[var(--text)]"><i class="fab fa-github mr-1"></i>Repo</a>` : ''}
            </div>
          </div>
          <!-- Three columns -->
          <div class="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            <div>
              <h4 class="text-xs font-black uppercase tracking-[0.3em] mb-3" style="color:var(--primary);">Overview</h4>
              <p class="text-sm text-[var(--text)] opacity-70 leading-relaxed">${item.description || 'Project overview and context.'}</p>
            </div>
            <div>
              <h4 class="text-xs font-black uppercase tracking-[0.3em] mb-3" style="color:var(--primary);">Approach</h4>
              <p class="text-sm text-[var(--text)] opacity-70 leading-relaxed">${item.approach || item.challenge || 'Modern architecture and engineering best practices applied throughout the project lifecycle.'}</p>
            </div>
            <div>
              <h4 class="text-xs font-black uppercase tracking-[0.3em] mb-3" style="color:var(--primary);">Outcome</h4>
              <p class="text-sm text-[var(--text)] opacity-70 leading-relaxed">${item.result || item.outcome || 'Delivered on time, exceeding performance benchmarks and client expectations.'}</p>
            </div>
          </div>
        </div>
      </div>`).join('')}
      <div class="border-t border-[var(--text)]/15"></div>
    </div>
  </div>
</section>`;
  },

  // ─── 11. PROJ_SIDE_BY_SIDE_GRID ─────────────────────────────────────────────
  PROJ_SIDE_BY_SIDE_GRID: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Portfolio</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg">${content.subtitle}</p>` : ''}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      ${items.map((item: any, i: number) => `
      <div class="rounded-2xl overflow-hidden border border-[var(--text)]/10 hover:border-[var(--primary)]/30 group transition-all duration-300 hover:shadow-xl"
           style="background:var(--surface);">
        <!-- Header bar -->
        <div class="px-6 py-4 flex items-center gap-3" style="background:color-mix(in srgb,var(--primary) 12%,var(--surface));">
          <span class="text-xs font-black uppercase tracking-[0.3em] opacity-60 text-[var(--text)]">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="flex-1 text-base font-black text-[var(--heading)] truncate">${item.title || 'Project'}</h3>
          <div class="flex items-center gap-2">
            ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110" style="background:var(--primary);color:var(--bg);"><i class="fas fa-external-link-alt" style="font-size:10px;"></i></a>` : ''}
            ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener" class="w-7 h-7 rounded-full flex items-center justify-center border border-[var(--text)]/20 transition-all hover:scale-110 opacity-70 hover:opacity-100 text-[var(--text)]"><i class="fab fa-github" style="font-size:10px;"></i></a>` : ''}
          </div>
        </div>
        <!-- Body -->
        <div class="p-6 space-y-4">
          <p class="text-sm text-[var(--text)] opacity-60 leading-relaxed line-clamp-3">${item.description || ''}</p>
          <div class="flex flex-wrap gap-1.5">${techPillsExt(item, 5)}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 12. PROJ_FULLWIDTH_SCROLL ──────────────────────────────────────────────
  PROJ_FULLWIDTH_SCROLL: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="projects" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="mb-12 max-w-7xl mx-auto px-6">
    <div class="space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Projects</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="projects-title">${content.title || 'Projects'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg">${content.subtitle}</p>` : ''}
    </div>
  </div>
  <div class="overflow-x-auto pb-6" style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;">
    <div class="flex gap-5 px-6" style="width:max-content;">
      ${items.map((item: any, i: number) => `
      <div class="flex-shrink-0 rounded-2xl overflow-hidden border border-[var(--text)]/10 hover:border-[var(--primary)]/40 group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
           style="width:320px;scroll-snap-align:start;background:var(--surface);">
        <!-- Image placeholder -->
        <div class="w-full relative overflow-hidden" style="height:200px;background:${gradientPlaceholder(i)};">
          ${item.image ? `<img src="${item.image}" alt="${item.title || ''}" ${imgFallbackExt} loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />` : ''}
          <div class="absolute top-4 right-4 flex gap-2">
            ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 text-[var(--bg)] hover:scale-110 transition-all" style="background:rgba(0,0,0,0.4);"><i class="fas fa-external-link-alt text-xs"></i></a>` : ''}
            ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener" class="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 text-[var(--bg)] hover:scale-110 transition-all" style="background:rgba(0,0,0,0.4);"><i class="fab fa-github text-xs"></i></a>` : ''}
          </div>
        </div>
        <!-- Content -->
        <div class="p-5 space-y-3">
          <h3 class="text-base font-black text-[var(--heading)] line-clamp-1">${item.title || 'Project'}</h3>
          <p class="text-xs text-[var(--text)] opacity-60 leading-relaxed line-clamp-2">${item.description || ''}</p>
          <div class="flex flex-wrap gap-1">${techPillsExt(item, 3)}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

};
