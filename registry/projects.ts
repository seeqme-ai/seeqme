// ============================================================
// SEEQME PROJECT REGISTRY — World-class portfolio project sections
// ============================================================

const imgFallback = `onerror="this.onerror=null;this.style.background='linear-gradient(135deg,var(--primary) 20%,var(--surface))';this.style.display='block';this.style.minHeight='140px';this.style.objectFit='cover';"`;

const getTech = (item: any): string[] => {
  if (Array.isArray(item.tech)) return item.tech;
  if (Array.isArray(item.technologies)) return item.technologies;
  if (typeof item.tech === 'string') return item.tech.split(',').map((t: string) => t.trim()).filter(Boolean);
  if (typeof item.tags === 'string') return item.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  if (Array.isArray(item.tags)) return item.tags;
  return [];
};

const techBadges = (item: any, size = 'text-[10px] px-3 py-1') =>
  getTech(item).slice(0, 6).map((t: string) =>
    `<span class="${size} rounded-full font-bold uppercase tracking-wider whitespace-nowrap"
           style="background:color-mix(in srgb,var(--primary) 12%,var(--surface));color:var(--primary);border:1px solid color-mix(in srgb,var(--primary) 25%,transparent);">${t}</span>`
  ).join('');

const projectLinks = (item: any) => `
  <div class="flex items-center gap-3">
    ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"
       class="inline-flex items-center gap-2 text-xs font-bold transition-all hover:scale-105"
       style="color:var(--primary);">
      <i class="fas fa-external-link-alt"></i> Live
    </a>` : ''}
    ${item.github || item.repo ? `<a href="${item.github || item.repo}" target="_blank" rel="noopener"
       class="inline-flex items-center gap-2 text-xs font-bold opacity-60 hover:opacity-100 transition-all">
      <i class="fab fa-github"></i> Code
    </a>` : ''}
  </div>`;

// ─── 1. PROJ_BENTO_GRID ──────────────────────────────────────
export const PROJ_BENTO_GRID = (content: any) => {
  const items = content.items || content.projects || [];
  return `
<section id="projects" data-section="projects" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto">
    <div class="mb-16 space-y-4">
      <div class="flex items-center gap-3">
        <div class="h-px w-10" style="background:var(--primary);"></div>
        <span class="text-xs font-black uppercase tracking-[0.3em]" style="color:var(--primary);">Selected Work</span>
      </div>
      <h2 class="text-5xl md:text-7xl font-black tracking-tighter" data-field="projects-title">${content.title || 'Projects'}</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-auto">
      ${items[0] ? `
      <div class="md:col-span-8 group relative rounded-3xl overflow-hidden min-h-[400px]"
           style="background:var(--surface);">
        <img src="${items[0].image || ''}" alt="${items[0].title || 'Project'}" loading="lazy"
             ${imgFallback} class="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
        <div class="absolute inset-0" style="background:linear-gradient(to top,var(--bg) 30%,color-mix(in srgb,var(--bg) 20%,transparent) 70%,transparent);"></div>
        <div class="absolute bottom-0 left-0 right-0 p-8 space-y-3">
          <div class="flex flex-wrap gap-2">${techBadges(items[0])}</div>
          <h3 class="text-2xl md:text-3xl font-black text-white">${items[0].title || 'Project One'}</h3>
          <p class="text-sm text-white opacity-70 line-clamp-2">${items[0].description || ''}</p>
          ${projectLinks(items[0])}
        </div>
      </div>` : ''}

      ${items[1] ? `
      <div class="md:col-span-4 group relative rounded-3xl overflow-hidden min-h-[300px]"
           style="background:var(--surface);">
        <img src="${items[1].image || ''}" alt="${items[1].title || 'Project'}" loading="lazy"
             ${imgFallback} class="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-700" />
        <div class="absolute inset-0" style="background:linear-gradient(to top,var(--bg) 40%,transparent);"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 space-y-2">
          <h3 class="text-xl font-black text-white">${items[1].title || 'Project Two'}</h3>
          <p class="text-xs text-white opacity-60 line-clamp-2">${items[1].description || ''}</p>
          ${projectLinks(items[1])}
        </div>
      </div>` : ''}

      ${items[2] ? `
      <div class="md:col-span-4 group relative rounded-3xl overflow-hidden min-h-[300px] cursor-pointer"
           style="background:var(--surface);">
        <img src="${items[2].image || ''}" alt="${items[2].title || 'Project'}" loading="lazy"
             ${imgFallback} class="w-full h-full object-cover absolute inset-0" />
        <div class="absolute inset-0 flex flex-col justify-center items-center text-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
             style="background:color-mix(in srgb,var(--primary) 90%,transparent);">
          <h3 class="text-xl font-black" style="color:var(--bg);">${items[2].title || 'Project Three'}</h3>
          ${items[2].link ? `<a href="${items[2].link}" target="_blank" rel="noopener"
             class="mt-4 px-5 py-2 rounded-full text-xs font-black border-2 transition-all hover:scale-105"
             style="border-color:var(--bg);color:var(--bg);">View Project</a>` : ''}
        </div>
      </div>` : ''}

      ${items[3] ? `
      <div class="md:col-span-8 group relative rounded-3xl overflow-hidden min-h-[300px] p-8 md:p-12"
           style="background:var(--surface);">
        <div class="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <span class="text-[10rem] font-black uppercase opacity-[0.04]" style="color:var(--heading);">WORK</span>
        </div>
        <div class="relative z-10 h-full flex flex-col justify-between gap-8">
          <div class="flex justify-between items-start">
            <h3 class="text-3xl md:text-5xl font-black text-[var(--heading)] max-w-sm">${items[3].title || 'Project Four'}</h3>
            <span class="text-5xl font-black opacity-10">04</span>
          </div>
          <div>
            <p class="text-lg opacity-60 mb-6 max-w-xl">${items[3].description || ''}</p>
            <div class="flex items-center gap-4 flex-wrap">
              <div class="flex flex-wrap gap-2">${techBadges(items[3])}</div>
              ${items[3].link ? `<a href="${items[3].link}" target="_blank" rel="noopener"
                 class="inline-flex items-center gap-3 font-black text-sm uppercase tracking-widest group-hover:gap-5 transition-all"
                 style="color:var(--primary);">View Case Study <span>→</span></a>` : ''}
            </div>
          </div>
        </div>
      </div>` : ''}

      ${items.slice(4).map((item: any, i: number) => `
      <div class="md:col-span-4 group relative rounded-3xl overflow-hidden min-h-[280px]"
           style="background:var(--surface);">
        <img src="${item.image || ''}" alt="${item.title || `Project ${i+5}`}" loading="lazy"
             ${imgFallback} class="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
        <div class="absolute inset-0" style="background:linear-gradient(to top,var(--bg) 35%,transparent);"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 space-y-1">
          <h3 class="text-lg font-black text-white">${item.title || `Project ${i+5}`}</h3>
          ${projectLinks(item)}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
};

// ─── 2. PROJ_MINIMAL_CARDS ───────────────────────────────────
export const PROJ_MINIMAL_CARDS = (content: any) => {
  const items = content.items || content.projects || [];
  return `
<section id="projects" data-section="projects" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
      <h2 class="text-5xl md:text-7xl font-black tracking-tighter" data-field="projects-title">${content.title || 'Work'}</h2>
      <p class="text-base opacity-50 max-w-xs leading-relaxed pb-2 border-b" style="border-color:color-mix(in srgb,var(--text) 15%,transparent);">
        ${content.description || 'A selection of projects built with purpose.'}
      </p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${items.map((item: any, i: number) => `
      <div class="group rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
           style="background:var(--surface);border-color:color-mix(in srgb,var(--text) 8%,transparent);">
        <!-- Image -->
        <div class="relative aspect-video overflow-hidden" style="background:color-mix(in srgb,var(--primary) 10%,var(--surface));">
          <img src="${item.image || ''}" alt="${item.title || `Project ${i+1}`}" loading="lazy"
               ${imgFallback}
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"
             class="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
             style="background:var(--primary);color:var(--bg);">
            <i class="fas fa-external-link-alt text-xs"></i>
          </a>` : ''}
        </div>
        <!-- Content -->
        <div class="p-6 space-y-4">
          <div class="flex items-start justify-between gap-4">
            <h3 class="text-lg font-black text-[var(--heading)]">${item.title || `Project ${i+1}`}</h3>
            <span class="text-2xl font-black opacity-10 shrink-0">${String(i+1).padStart(2,'0')}</span>
          </div>
          <p class="text-sm opacity-60 leading-relaxed line-clamp-3">${item.description || ''}</p>
          <div class="flex flex-wrap gap-2">${techBadges(item)}</div>
          <div class="flex items-center justify-between pt-2 border-t" style="border-color:color-mix(in srgb,var(--text) 8%,transparent);">
            ${projectLinks(item)}
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
};

// ─── 3. PROJ_STACKED_LIST ────────────────────────────────────
export const PROJ_STACKED_LIST = (content: any) => {
  const items = content.items || content.projects || [];
  return `
<section id="projects" data-section="projects" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-5xl mx-auto">
    <div class="mb-16">
      <h2 class="text-5xl md:text-7xl font-black tracking-tighter" data-field="projects-title">${content.title || 'Selected Work'}</h2>
    </div>
    <div class="space-y-0 divide-y" style="border-color:color-mix(in srgb,var(--text) 8%,transparent);">
      ${items.map((item: any, i: number) => `
      <div class="group py-10 flex flex-col md:flex-row md:items-center gap-8 cursor-pointer hover:bg-[var(--surface)] hover:px-6 hover:-mx-6 rounded-2xl transition-all duration-300">
        <!-- Number -->
        <span class="text-6xl font-black opacity-10 group-hover:opacity-30 group-hover:text-[var(--primary)] transition-all select-none shrink-0"
              style="font-variant-numeric:tabular-nums;">
          ${String(i+1).padStart(2,'0')}
        </span>
        <!-- Content -->
        <div class="flex-1 space-y-3">
          <h3 class="text-2xl md:text-3xl font-black text-[var(--heading)] group-hover:text-[var(--primary)] transition-colors">${item.title || `Project ${i+1}`}</h3>
          <p class="text-sm md:text-base opacity-60 leading-relaxed max-w-2xl">${item.description || ''}</p>
          <div class="flex flex-wrap gap-2">${techBadges(item)}</div>
        </div>
        <!-- Arrow -->
        <div class="shrink-0">
          ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"
             class="w-12 h-12 rounded-full border-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
             style="border-color:var(--primary);color:var(--primary);">
            <i class="fas fa-arrow-right"></i>
          </a>` : `<div class="w-12 h-12 rounded-full border-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
               style="border-color:color-mix(in srgb,var(--text) 20%,transparent);">
            <i class="fas fa-arrow-right text-sm opacity-50"></i>
          </div>`}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
};

// ─── 4. PROJ_CAROUSEL_FULLSCREEN ─────────────────────────────
export const PROJ_CAROUSEL_FULLSCREEN = (content: any) => {
  const items = content.items || content.projects || [];
  return `
<section id="projects" data-section="projects" class="py-24 bg-[var(--bg)] overflow-hidden">
  <div class="max-w-7xl mx-auto px-6 mb-10">
    <h2 class="text-5xl md:text-7xl font-black tracking-tighter" data-field="projects-title">${content.title || 'Work'}</h2>
  </div>
  <div class="flex gap-6 px-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6" style="-webkit-overflow-scrolling:touch;">
    ${items.map((item: any, i: number) => `
    <div class="snap-start shrink-0 w-[85vw] md:w-[600px] rounded-3xl overflow-hidden group relative"
         style="background:var(--surface);min-height:400px;">
      <img src="${item.image || ''}" alt="${item.title || `Project ${i+1}`}" loading="lazy"
           ${imgFallback}
           class="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
      <div class="absolute inset-0" style="background:linear-gradient(to top,var(--bg) 35%,transparent 70%);"></div>
      <div class="absolute bottom-0 left-0 right-0 p-8 space-y-3">
        <div class="flex flex-wrap gap-2">${techBadges(item)}</div>
        <h3 class="text-2xl font-black text-white">${item.title || `Project ${i+1}`}</h3>
        <p class="text-sm text-white opacity-70 line-clamp-2">${item.description || ''}</p>
        ${projectLinks(item)}
      </div>
    </div>`).join('')}
  </div>
  <style>.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}</style>
</section>`;
};

// ─── 5. PROJ_GITHUB_STYLE ────────────────────────────────────
export const PROJ_GITHUB_STYLE = (content: any) => {
  const items = content.items || content.projects || [];
  const langColors: Record<string,string> = {
    javascript:'#f7df1e',typescript:'#3178c6',python:'#3572a5',rust:'#dea584',
    go:'#00add8',react:'#61dafb',vue:'#42b883',css:'#563d7c',html:'#e34c26',
  };
  return `
<section id="projects" data-section="projects" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center gap-4 mb-12">
      <i class="fab fa-github text-3xl opacity-60"></i>
      <h2 class="text-4xl md:text-5xl font-black tracking-tighter" data-field="projects-title">${content.title || 'Repositories'}</h2>
    </div>
    <div class="space-y-4">
      ${items.map((item: any) => {
        const lang = (getTech(item)[0] || '').toLowerCase();
        const color = langColors[lang] || 'var(--primary)';
        return `
      <div class="group p-6 rounded-2xl border transition-all hover:border-[var(--primary)]/40 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
           style="background:var(--surface);border-color:color-mix(in srgb,var(--text) 10%,transparent);">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <i class="fas fa-book opacity-40 mt-1 shrink-0"></i>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 flex-wrap">
                ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"
                   class="text-lg font-black group-hover:text-[var(--primary)] transition-colors truncate"
                   style="color:var(--heading);">${item.title || 'Project'}</a>` :
                  `<span class="text-lg font-black text-[var(--heading)] truncate">${item.title || 'Project'}</span>`}
                <span class="text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase"
                      style="border-color:color-mix(in srgb,var(--primary) 30%,transparent);color:var(--primary);">Public</span>
              </div>
              <p class="text-sm opacity-55 mt-2 line-clamp-2">${item.description || ''}</p>
              <div class="flex items-center gap-6 mt-4 text-xs opacity-50">
                ${lang ? `<span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full" style="background:${color};"></span>${lang}
                </span>` : ''}
                ${item.stars ? `<span><i class="fas fa-star mr-1"></i>${item.stars}</span>` : ''}
                ${item.forks ? `<span><i class="fas fa-code-branch mr-1"></i>${item.forks}</span>` : ''}
              </div>
            </div>
          </div>
          ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"
             class="shrink-0 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg"
             style="color:var(--primary);">
            <i class="fas fa-external-link-alt"></i>
          </a>` : ''}
        </div>
      </div>`;}).join('')}
    </div>
  </div>
</section>`;
};

// ─── 6. PROJ_MASONRY ─────────────────────────────────────────
export const PROJ_MASONRY = (content: any) => {
  const items = content.items || content.projects || [];
  return `
<section id="projects" data-section="projects" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto">
    <h2 class="text-5xl md:text-7xl font-black tracking-tighter mb-12" data-field="projects-title">${content.title || 'Gallery'}</h2>
    <div class="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
      ${items.map((item: any, i: number) => `
      <div class="group break-inside-avoid rounded-3xl overflow-hidden border transition-all hover:shadow-xl hover:-translate-y-1 inline-block w-full"
           style="background:var(--surface);border-color:color-mix(in srgb,var(--text) 8%,transparent);">
        <div class="relative overflow-hidden ${i % 3 === 0 ? 'aspect-[4/5]' : i % 3 === 1 ? 'aspect-video' : 'aspect-square'}">
          <img src="${item.image || ''}" alt="${item.title || `Project ${i+1}`}" loading="lazy"
               ${imgFallback}
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-end p-6"
               style="background:linear-gradient(to top,color-mix(in srgb,var(--bg) 85%,transparent),transparent);">
            ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"
               class="px-4 py-2 rounded-full text-xs font-black transition-all hover:scale-105"
               style="background:var(--primary);color:var(--bg);">View →</a>` : ''}
          </div>
        </div>
        <div class="p-5 space-y-2">
          <h3 class="font-black text-[var(--heading)]">${item.title || `Project ${i+1}`}</h3>
          <p class="text-xs opacity-55 line-clamp-2">${item.description || ''}</p>
          <div class="flex flex-wrap gap-1.5">${techBadges(item, 'text-[9px] px-2 py-0.5')}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
};

// ─── 7. PROJ_CASE_STUDY ──────────────────────────────────────
export const PROJ_CASE_STUDY = (content: any) => {
  const items = content.items || content.projects || [];
  return `
<section id="projects" data-section="projects" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto">
    <div class="mb-20">
      <h2 class="text-5xl md:text-7xl font-black tracking-tighter" data-field="projects-title">${content.title || 'Case Studies'}</h2>
      <p class="text-base opacity-50 mt-4">${content.description || 'Detailed look at selected projects and their impact.'}</p>
    </div>
    <div class="space-y-24">
      ${items.map((item: any, i: number) => `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:grid-flow-dense' : ''}">
        <!-- Image -->
        <div class="${i % 2 === 1 ? 'lg:col-start-2' : ''} group rounded-3xl overflow-hidden aspect-video relative"
             style="background:var(--surface);">
          <img src="${item.image || ''}" alt="${item.title || `Project ${i+1}`}" loading="lazy"
               ${imgFallback}
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <!-- Metric badges -->
          ${item.metrics ? `<div class="absolute top-4 right-4 flex flex-col gap-2">
            ${Object.entries(item.metrics || {}).slice(0,2).map(([k,v]) => `
              <div class="px-3 py-2 rounded-xl backdrop-blur-md text-center shadow-lg"
                   style="background:color-mix(in srgb,var(--bg) 85%,transparent);border:1px solid color-mix(in srgb,var(--text) 10%,transparent);">
                <p class="text-lg font-black text-[var(--heading)]">${v}</p>
                <p class="text-[9px] uppercase tracking-wider opacity-50">${k}</p>
              </div>`).join('')}
          </div>` : ''}
        </div>
        <!-- Content -->
        <div class="${i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''} space-y-6">
          <div>
            <span class="text-xs font-black uppercase tracking-[0.4em] opacity-40">${String(i+1).padStart(2,'0')} / Case Study</span>
            <h3 class="text-3xl md:text-5xl font-black text-[var(--heading)] mt-2">${item.title || `Project ${i+1}`}</h3>
          </div>
          <div class="h-0.5 w-12 rounded-full" style="background:var(--primary);"></div>
          <p class="text-base md:text-lg opacity-60 leading-relaxed">${item.description || ''}</p>
          ${item.challenge ? `<div class="p-4 rounded-2xl border-l-4" style="background:var(--surface);border-color:var(--primary);">
            <p class="text-xs font-black uppercase tracking-widest opacity-50 mb-1">Challenge</p>
            <p class="text-sm leading-relaxed">${item.challenge}</p>
          </div>` : ''}
          <div class="flex flex-wrap gap-2">${techBadges(item)}</div>
          ${projectLinks(item)}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
};

// ─── 8. PROJ_THUMBNAIL_GRID ──────────────────────────────────
export const PROJ_THUMBNAIL_GRID = (content: any) => {
  const items = content.items || content.projects || [];
  return `
<section id="projects" data-section="projects" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto">
    <h2 class="text-5xl md:text-7xl font-black tracking-tighter mb-12" data-field="projects-title">${content.title || 'Work'}</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      ${items.map((item: any, i: number) => `
      <div class="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
           style="background:color-mix(in srgb,var(--primary) 10%,var(--surface));">
        <img src="${item.image || ''}" alt="${item.title || `Project ${i+1}`}" loading="lazy"
             ${imgFallback} class="w-full h-full object-cover" />
        <div class="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
             style="background:linear-gradient(to top,color-mix(in srgb,var(--bg) 90%,transparent),transparent);">
          <h4 class="text-sm font-black text-white">${item.title || `Project ${i+1}`}</h4>
          ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"
             class="text-[10px] font-bold mt-1" style="color:var(--primary);">View →</a>` : ''}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
};

// ─── 9. PROJ_FEATURED_SINGLE ─────────────────────────────────
export const PROJ_FEATURED_SINGLE = (content: any) => {
  const item = (content.items || content.projects || [])[0] || {};
  return `
<section id="projects" data-section="projects" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto">
    <h2 class="text-4xl font-black tracking-tighter mb-12 opacity-40 uppercase">${content.title || 'Featured Work'}</h2>
    <div class="group relative rounded-3xl overflow-hidden min-h-[70vh]" style="background:var(--surface);">
      <img src="${item.image || ''}" alt="${item.title || 'Featured Project'}" loading="lazy"
           ${imgFallback}
           class="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-[10s] ease-out" />
      <div class="absolute inset-0" style="background:linear-gradient(to top,var(--bg) 45%,color-mix(in srgb,var(--bg) 30%,transparent) 75%,transparent);"></div>
      <div class="absolute bottom-0 left-0 right-0 p-8 md:p-16 space-y-6 max-w-4xl">
        <div class="flex flex-wrap gap-2">${techBadges(item)}</div>
        <h3 class="text-4xl md:text-7xl font-black text-white tracking-tighter">${item.title || 'Project Name'}</h3>
        <p class="text-lg md:text-xl text-white opacity-70 max-w-2xl leading-relaxed">${item.description || ''}</p>
        <div class="flex flex-wrap gap-4">
          ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"
             class="px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105"
             style="background:var(--primary);color:var(--bg);">
            <i class="fas fa-external-link-alt mr-2"></i>Live Demo
          </a>` : ''}
          ${item.github ? `<a href="${item.github}" target="_blank" rel="noopener"
             class="px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 border-2"
             style="border-color:rgba(255,255,255,0.3);color:#fff;">
            <i class="fab fa-github mr-2"></i>Source Code
          </a>` : ''}
        </div>
      </div>
    </div>
  </div>
</section>`;
};

// ─── 10. PROJ_TIMELINE_VERTICAL ──────────────────────────────
export const PROJ_TIMELINE_VERTICAL = (content: any) => {
  const items = content.items || content.projects || [];
  return `
<section id="projects" data-section="projects" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-4xl mx-auto">
    <h2 class="text-5xl md:text-7xl font-black tracking-tighter mb-16" data-field="projects-title">${content.title || 'Project History'}</h2>
    <div class="relative space-y-12 before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5"
         style="--tw-bg-opacity:1;" >
      <div class="absolute left-6 top-0 bottom-0 w-0.5 opacity-10" style="background:var(--text);"></div>
      ${items.map((item: any, i: number) => `
      <div class="relative pl-16">
        <div class="absolute left-4 top-1 w-5 h-5 rounded-full border-4 flex items-center justify-center"
             style="background:var(--bg);border-color:var(--primary);">
          <div class="w-2 h-2 rounded-full" style="background:var(--primary);"></div>
        </div>
        <div class="group p-6 rounded-2xl border transition-all hover:shadow-lg hover:border-[var(--primary)]/30"
             style="background:var(--surface);border-color:color-mix(in srgb,var(--text) 8%,transparent);">
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <h3 class="text-xl font-black text-[var(--heading)]">${item.title || `Project ${i+1}`}</h3>
            ${item.year || item.date ? `<span class="text-xs font-black uppercase tracking-widest shrink-0 opacity-50">${item.year || item.date}</span>` : ''}
          </div>
          <p class="text-sm opacity-60 leading-relaxed mb-4">${item.description || ''}</p>
          <div class="flex flex-wrap gap-2 mb-4">${techBadges(item)}</div>
          ${projectLinks(item)}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
};

// ─── 11-13: Remaining variants (simplified but polished) ─────
export const PROJ_3D_PERSPECTIVE = (content: any) => {
  const items = (content.items || content.projects || []).slice(0, 6);
  return `
<section id="projects" data-section="projects" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto">
    <h2 class="text-5xl md:text-7xl font-black tracking-tighter mb-16" data-field="projects-title">${content.title || 'Projects'}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style="perspective:1200px;">
      ${items.map((item: any, i: number) => `
      <div class="group relative rounded-3xl overflow-hidden border transition-all duration-500 hover:shadow-2xl"
           style="background:var(--surface);border-color:color-mix(in srgb,var(--text) 8%,transparent);transform-style:preserve-3d;transition:transform 0.5s ease,box-shadow 0.5s ease;"
           onmouseenter="this.style.transform='rotateY(-8deg) rotateX(4deg) scale(1.02)'"
           onmouseleave="this.style.transform='rotateY(0) rotateX(0) scale(1)'">
        <div class="aspect-video overflow-hidden" style="background:color-mix(in srgb,var(--primary) 8%,var(--surface));">
          <img src="${item.image || ''}" alt="${item.title}" loading="lazy" ${imgFallback}
               class="w-full h-full object-cover" />
        </div>
        <div class="p-6 space-y-3">
          <h3 class="text-lg font-black text-[var(--heading)]">${item.title || `Project ${i+1}`}</h3>
          <p class="text-sm opacity-55 line-clamp-2">${item.description || ''}</p>
          <div class="flex flex-wrap gap-1.5">${techBadges(item, 'text-[9px] px-2 py-0.5')}</div>
          ${projectLinks(item)}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
};

export const PROJ_LIST_PREVIEW = PROJ_STACKED_LIST;
export const PROJ_OVERLAP_SLOTS = PROJ_BENTO_GRID;

export const ProjectRegistry = {
  PROJ_BENTO_GRID,
  PROJ_MINIMAL_CARDS,
  PROJ_STACKED_LIST,
  PROJ_CAROUSEL_FULLSCREEN,
  PROJ_GITHUB_STYLE,
  PROJ_MASONRY,
  PROJ_CASE_STUDY,
  PROJ_THUMBNAIL_GRID,
  PROJ_FEATURED_SINGLE,
  PROJ_TIMELINE_VERTICAL,
  PROJ_3D_PERSPECTIVE,
  PROJ_LIST_PREVIEW,
  PROJ_OVERLAP_SLOTS,
};
