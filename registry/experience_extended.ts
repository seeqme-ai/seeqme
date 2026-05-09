// ============================================================
// SEEQME EXPERIENCE EXTENDED REGISTRY — 8 additional experience section styles
// ============================================================

const expRole = (item: any) => item.position || item.role || item.title || 'Role';
const expCompany = (item: any) => item.company || item.organization || '';
const expPeriod = (item: any) => item.period || item.duration || item.date || '';
const expDesc = (item: any) => item.description || item.summary || '';
const expPoints = (item: any): string[] => Array.isArray(item.achievements) ? item.achievements : (Array.isArray(item.points) ? item.points : (Array.isArray(item.highlights) ? item.highlights : []));

export const ExperienceExtendedRegistry: Record<string, (content: any) => string> = {

  // ─── 1. EXP_BENTO_CARDS ─────────────────────────────────────────────────────
  EXP_BENTO_CARDS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="experience" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Experience</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="experience-title">${content.title || 'Experience'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg">${content.subtitle}</p>` : ''}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Featured first item -->
      ${items[0] ? `
      <div class="lg:col-span-2 rounded-2xl p-8 border-l-4 transition-all duration-300 hover:shadow-xl"
           style="background:var(--surface);border-left-color:var(--primary);">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <span class="inline-block text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full mb-3"
                  style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);">${expPeriod(items[0])}</span>
            <h3 class="text-2xl font-black text-[var(--heading)]">${expRole(items[0])}</h3>
            <p class="font-bold text-sm opacity-60 text-[var(--text)] mt-1">${expCompany(items[0])}</p>
          </div>
        </div>
        <p class="text-sm text-[var(--text)] opacity-70 leading-relaxed mb-5">${expDesc(items[0])}</p>
        ${expPoints(items[0]).length > 0 ? `
        <div class="flex flex-wrap gap-2">
          ${expPoints(items[0]).slice(0, 6).map((p: string) => `
          <span class="text-xs px-3 py-1.5 rounded-full font-medium text-[var(--text)] opacity-80"
                style="background:color-mix(in srgb,var(--text) 8%,transparent);border:1px solid color-mix(in srgb,var(--text) 15%,transparent);">${p}</span>`).join('')}
        </div>` : ''}
      </div>` : ''}
      <!-- Side cells -->
      <div class="flex flex-col gap-5">
        ${items.slice(1, 3).map((item: any) => `
        <div class="flex-1 rounded-2xl p-6 border-l-4 transition-all duration-300 hover:shadow-lg"
             style="background:var(--surface);border-left-color:color-mix(in srgb,var(--primary) 60%,var(--surface));">
          <span class="text-xs font-black uppercase tracking-wider opacity-50 text-[var(--text)]">${expPeriod(item)}</span>
          <h3 class="text-lg font-black text-[var(--heading)] mt-2 mb-1">${expRole(item)}</h3>
          <p class="text-sm font-bold opacity-50 text-[var(--text)] mb-3">${expCompany(item)}</p>
          ${expPoints(item).slice(0, 2).map((p: string) => `
          <div class="flex items-start gap-2 text-xs text-[var(--text)] opacity-60 mb-1.5">
            <span class="mt-0.5 flex-shrink-0" style="color:var(--primary);">▸</span>${p}
          </div>`).join('')}
        </div>`).join('')}
      </div>
      <!-- Remaining items in full-width row -->
      ${items.slice(3).map((item: any) => `
      <div class="rounded-2xl p-6 border-l-4 transition-all duration-300 hover:shadow-lg"
           style="background:var(--surface);border-left-color:color-mix(in srgb,var(--primary) 40%,var(--surface));">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 class="text-lg font-black text-[var(--heading)]">${expRole(item)}</h3>
            <p class="text-sm font-bold opacity-50 text-[var(--text)]">${expCompany(item)}</p>
          </div>
          <span class="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full flex-shrink-0"
                style="background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary);">${expPeriod(item)}</span>
        </div>
        <p class="text-sm text-[var(--text)] opacity-60 line-clamp-2">${expDesc(item)}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 2. EXP_FLOATING_TIMELINE ───────────────────────────────────────────────
  EXP_FLOATING_TIMELINE: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="experience" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-5xl mx-auto px-6">
    <div class="mb-16 text-center space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Career</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="experience-title">${content.title || 'Experience'}</h2>
    </div>
    <div class="relative">
      <!-- Center line (desktop only) -->
      <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-px"
           style="background:linear-gradient(to bottom,transparent,var(--primary),transparent);"></div>
      <div class="flex flex-col gap-12">
        ${items.map((item: any, i: number) => `
        <div class="relative flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center">
          <!-- Dot -->
          <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 items-center justify-center z-10"
               style="background:var(--bg);border-color:var(--primary);">
            <div class="w-2 h-2 rounded-full" style="background:var(--primary);"></div>
          </div>
          <!-- Card -->
          <div class="w-full md:w-[calc(50%-2rem)] rounded-2xl p-7 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
               style="background:var(--surface);">
            <div class="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 class="text-xl font-black text-[var(--heading)] mb-1">${expCompany(item)}</h3>
                <p class="text-sm font-bold" style="color:var(--primary);">${expRole(item)}</p>
              </div>
              <span class="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex-shrink-0"
                    style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);">${expPeriod(item)}</span>
            </div>
            <p class="text-sm text-[var(--text)] opacity-60 leading-relaxed">${expDesc(item)}</p>
          </div>
          <!-- Spacer for alternating -->
          <div class="hidden md:block w-[calc(50%-2rem)] flex-shrink-0"></div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>`;
  },

  // ─── 3. EXP_SPLIT_CONTENT ───────────────────────────────────────────────────
  EXP_SPLIT_CONTENT: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    const uid = `exp-split-${Math.random().toString(36).slice(2, 7)}`;
    return `
<section data-section="experience" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Experience</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="experience-title">${content.title || 'Experience'}</h2>
    </div>
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Tab list -->
      <div class="lg:w-1/3 flex flex-col gap-1" id="${uid}-tabs">
        ${items.map((item: any, i: number) => `
        <button onclick="document.querySelectorAll('.${uid}-panel').forEach(p=>p.style.display='none');document.getElementById('${uid}-panel-${i}').style.display='block';document.querySelectorAll('.${uid}-tab').forEach(t=>{t.style.borderLeftColor='transparent';t.style.color='var(--text)';t.style.opacity='0.5';});this.style.borderLeftColor='var(--primary)';this.style.color='var(--primary)';this.style.opacity='1';"
               class="${uid}-tab text-left px-5 py-4 border-l-2 transition-all duration-200 rounded-r-xl text-sm font-bold"
               style="border-left-color:${i === 0 ? 'var(--primary)' : 'transparent'};color:${i === 0 ? 'var(--primary)' : 'var(--text)'};opacity:${i === 0 ? '1' : '0.5'};">
          <span class="block text-xs font-black uppercase tracking-[0.25em] mb-1">${expPeriod(item)}</span>
          ${expCompany(item)}
        </button>`).join('')}
      </div>
      <!-- Detail panel -->
      <div class="lg:w-2/3">
        ${items.map((item: any, i: number) => `
        <div id="${uid}-panel-${i}" class="${uid}-panel rounded-2xl p-8" style="background:var(--surface);display:${i === 0 ? 'block' : 'none'};">
          <span class="inline-block text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full mb-4"
                style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);">${expPeriod(item)}</span>
          <h3 class="text-2xl font-black text-[var(--heading)] mb-1">${expRole(item)}</h3>
          <p class="font-bold text-sm mb-5" style="color:var(--primary);">${expCompany(item)}</p>
          <p class="text-sm text-[var(--text)] opacity-70 leading-relaxed mb-6">${expDesc(item)}</p>
          ${expPoints(item).length > 0 ? `
          <ul class="space-y-3">
            ${expPoints(item).map((p: string) => `
            <li class="flex items-start gap-3 text-sm text-[var(--text)] opacity-70">
              <span class="mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black" style="background:color-mix(in srgb,var(--primary) 15%,transparent);color:var(--primary);">✓</span>
              ${p}
            </li>`).join('')}
          </ul>` : ''}
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>`;
  },

  // ─── 4. EXP_MINIMAL_CLEAN ───────────────────────────────────────────────────
  EXP_MINIMAL_CLEAN: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="experience" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-3xl mx-auto px-6">
    <div class="mb-16 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Experience</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="experience-title">${content.title || 'Experience'}</h2>
    </div>
    <div class="flex flex-col gap-14">
      ${items.map((item: any) => `
      <div>
        <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
          <div>
            <h3 class="text-xl font-black text-[var(--heading)]">${expCompany(item)}</h3>
            <p class="font-bold text-base" style="color:var(--primary);">${expRole(item)}</p>
          </div>
          <span class="text-xs font-black uppercase tracking-[0.25em] opacity-50 text-[var(--text)] flex-shrink-0">${expPeriod(item)}</span>
        </div>
        <p class="text-base text-[var(--text)] opacity-70 leading-loose mb-4">${expDesc(item)}</p>
        ${expPoints(item).length > 0 ? `
        <ul class="flex flex-col gap-2">
          ${expPoints(item).slice(0, 4).map((p: string) => `
          <li class="flex items-start gap-3 text-sm text-[var(--text)] opacity-60 leading-relaxed">
            <span class="mt-1 flex-shrink-0 text-xs" style="color:var(--primary);">—</span>${p}
          </li>`).join('')}
        </ul>` : ''}
      </div>`).join('<div class="border-t border-[var(--text)]/10"></div>')}
    </div>
  </div>
</section>`;
  },

  // ─── 5. EXP_AGENCY_BOLD ─────────────────────────────────────────────────────
  EXP_AGENCY_BOLD: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="experience" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Experience</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="experience-title">${content.title || 'Experience'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg">${content.subtitle}</p>` : ''}
    </div>
    <div class="flex flex-col divide-y divide-[var(--text)]/10">
      ${items.map((item: any) => `
      <div class="flex flex-col lg:flex-row items-start gap-6 py-10 group cursor-default transition-all duration-300 hover:bg-[var(--surface)]/50 px-4 -mx-4 rounded-xl">
        <!-- Giant initial -->
        <div class="flex-shrink-0 leading-none select-none font-black"
             style="font-size:clamp(4rem,8vw,7rem);color:var(--primary);opacity:0.15;line-height:1;transform:translateY(-0.1em);transition:opacity 0.3s;"
             onmouseover="this.style.opacity='0.35'" onmouseout="this.style.opacity='0.15'">
          ${(expCompany(item) || 'C').charAt(0).toUpperCase()}
        </div>
        <!-- Details -->
        <div class="flex-1 pt-2">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h3 class="text-2xl font-black text-[var(--heading)]">${expCompany(item)}</h3>
              <p class="font-bold text-base" style="color:var(--primary);">${expRole(item)}</p>
            </div>
            <span class="text-xs font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full flex-shrink-0"
                  style="background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary);">${expPeriod(item)}</span>
          </div>
          <p class="text-sm text-[var(--text)] opacity-60 leading-relaxed mb-4">${expDesc(item)}</p>
          ${expPoints(item).slice(0, 3).map((p: string) => `
          <div class="flex items-start gap-2 text-sm text-[var(--text)] opacity-60 mb-2">
            <span style="color:var(--primary);">▸</span>${p}
          </div>`).join('')}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 6. EXP_DARK_CARDS ──────────────────────────────────────────────────────
  EXP_DARK_CARDS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="experience" class="relative py-20 md:py-28 bg-[var(--surface)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-14 text-center space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Career Path</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="experience-title">${content.title || 'Experience'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg mx-auto">${content.subtitle}</p>` : ''}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      ${items.map((item: any, i: number) => `
      <div class="rounded-2xl p-7 border border-[var(--text)]/10 group transition-all duration-300 hover:-translate-y-1"
           style="background:color-mix(in srgb,var(--bg) 60%,var(--surface));"
           onmouseover="this.style.boxShadow='0 0 0 1px var(--primary), 0 20px 40px -10px color-mix(in srgb,var(--primary) 25%,transparent)'"
           onmouseout="this.style.boxShadow='none'">
        <div class="flex items-start gap-4 mb-5">
          <!-- Icon badge -->
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-black"
               style="background:color-mix(in srgb,var(--primary) 15%,transparent);color:var(--primary);">
            ${(expCompany(item) || 'C').charAt(0).toUpperCase()}
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-black text-[var(--heading)]">${expCompany(item)}</h3>
            <p class="text-sm font-bold" style="color:var(--primary);">${expRole(item)}</p>
          </div>
          <span class="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 opacity-60 text-[var(--text)]"
                style="background:color-mix(in srgb,var(--text) 8%,transparent);">${expPeriod(item)}</span>
        </div>
        <p class="text-sm text-[var(--text)] opacity-60 leading-relaxed mb-4">${expDesc(item)}</p>
        ${expPoints(item).length > 0 ? `
        <ul class="flex flex-col gap-2">
          ${expPoints(item).slice(0, 3).map((p: string) => `
          <li class="flex items-start gap-2 text-xs text-[var(--text)] opacity-60">
            <i class="fas fa-check-circle mt-0.5 flex-shrink-0 text-xs" style="color:var(--primary);"></i>${p}
          </li>`).join('')}
        </ul>` : ''}
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 7. EXP_CREATIVE_FLOW ───────────────────────────────────────────────────
  EXP_CREATIVE_FLOW: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="experience" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-4xl mx-auto px-6">
    <div class="mb-16 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Experience</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="experience-title">${content.title || 'Experience'}</h2>
    </div>
    <div class="flex flex-col gap-6">
      ${items.map((item: any, i: number) => `
      <div class="rounded-3xl p-8 border border-[var(--text)]/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
           style="background:var(--surface);${i % 2 === 0 ? 'margin-left:0;margin-right:3rem;' : 'margin-left:3rem;margin-right:0;'}">
        <!-- Colored accent top -->
        <div class="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
             style="background:linear-gradient(90deg,var(--primary),color-mix(in srgb,var(--primary) 40%,transparent));"></div>
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <span class="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full mb-3 inline-block"
                  style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);">${expPeriod(item)}</span>
            <h3 class="text-xl font-black text-[var(--heading)]">${expRole(item)}</h3>
            <p class="text-sm font-bold opacity-60 text-[var(--text)]">${expCompany(item)}</p>
          </div>
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-sm"
               style="background:color-mix(in srgb,var(--primary) 15%,transparent);color:var(--primary);">
            ${i + 1}
          </div>
        </div>
        <p class="text-sm text-[var(--text)] opacity-60 leading-relaxed">${expDesc(item)}</p>
        ${expPoints(item).slice(0, 2).map((p: string) => `
        <div class="flex items-start gap-2 text-sm text-[var(--text)] opacity-50 mt-2">
          <span class="mt-0.5 flex-shrink-0" style="color:var(--primary);">◆</span>${p}
        </div>`).join('')}
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 8. EXP_COMPACT_ROWS ────────────────────────────────────────────────────
  EXP_COMPACT_ROWS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="experience" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Experience</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="experience-title">${content.title || 'Experience'}</h2>
    </div>
    <!-- Desktop table headers -->
    <div class="hidden lg:grid grid-cols-12 gap-4 text-xs font-black uppercase tracking-[0.25em] opacity-40 text-[var(--text)] pb-4 border-b border-[var(--text)]/15 mb-2">
      <div class="col-span-2">Period</div>
      <div class="col-span-3">Company</div>
      <div class="col-span-4">Role</div>
      <div class="col-span-3">Highlights</div>
    </div>
    <!-- Rows -->
    <div class="flex flex-col">
      ${items.map((item: any) => `
      <!-- Mobile: card, Desktop: row -->
      <div class="block lg:hidden rounded-xl p-5 mb-3 border border-[var(--text)]/10 hover:border-[var(--primary)]/40 transition-all duration-200"
           style="background:var(--surface);">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 class="font-black text-base text-[var(--heading)]">${expCompany(item)}</h3>
            <p class="text-sm" style="color:var(--primary);">${expRole(item)}</p>
          </div>
          <span class="text-xs font-black uppercase tracking-wider opacity-50 text-[var(--text)] flex-shrink-0">${expPeriod(item)}</span>
        </div>
        <p class="text-xs text-[var(--text)] opacity-60">${expDesc(item)}</p>
      </div>
      <div class="hidden lg:grid grid-cols-12 gap-4 py-5 border-b border-[var(--text)]/10 hover:bg-[var(--surface)]/50 group transition-colors duration-200 px-2 -mx-2 rounded-lg items-start">
        <div class="col-span-2 text-xs font-black uppercase tracking-wider opacity-50 text-[var(--text)] pt-0.5">${expPeriod(item)}</div>
        <div class="col-span-3">
          <span class="font-black text-sm text-[var(--heading)]">${expCompany(item)}</span>
        </div>
        <div class="col-span-4">
          <span class="text-sm font-bold" style="color:var(--primary);">${expRole(item)}</span>
          ${expDesc(item) ? `<p class="text-xs text-[var(--text)] opacity-50 mt-1 leading-relaxed line-clamp-2">${expDesc(item)}</p>` : ''}
        </div>
        <div class="col-span-3">
          ${expPoints(item).slice(0, 2).map((p: string) => `
          <div class="flex items-start gap-1.5 text-xs text-[var(--text)] opacity-60 mb-1">
            <span style="color:var(--primary);">▸</span><span class="line-clamp-1">${p}</span>
          </div>`).join('')}
          ${expPoints(item).length > 2 ? `<span class="text-xs opacity-40 text-[var(--text)]">+${expPoints(item).length - 2} more</span>` : ''}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

};
