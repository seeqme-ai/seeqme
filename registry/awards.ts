// ============================================================
// SEEQME AWARDS REGISTRY — 3 awards section styles
// ============================================================

const awardName = (item: any): string => item.name || item.title || item.award || 'Award';
const awardIssuer = (item: any): string => item.issuer || item.organization || item.from || '';
const awardYear = (item: any): string => String(item.year || item.date || '');
const awardDesc = (item: any): string => item.description || item.summary || '';

const trophyIcons = [
  'fas fa-trophy', 'fas fa-medal', 'fas fa-award', 'fas fa-star',
  'fas fa-crown', 'fas fa-certificate', 'fas fa-ribbon',
];

export const AwardsRegistry: Record<string, (content: any) => string> = {

  // ─── 1. AWARDS_SHOWCASE ──────────────────────────────────────────────────
  AWARDS_SHOWCASE: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="awards" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 text-center space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Recognition</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="awards-title">${content.title || 'Awards & Honors'}</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${items.map((item: any, i: number) => `
      <div class="rounded-2xl p-8 border border-[var(--text)]/10 hover:border-[var(--primary)]/40 group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl text-center"
           style="background:var(--surface);">
        <!-- Trophy icon with bounce animation on hover -->
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110"
             style="background:color-mix(in srgb,var(--primary) 12%,transparent);">
          <i class="${trophyIcons[i % trophyIcons.length]} text-2xl" style="color:var(--primary);"></i>
        </div>
        <h3 class="text-lg font-black text-[var(--heading)] mb-2 leading-tight">${awardName(item)}</h3>
        <p class="text-sm font-bold opacity-60 text-[var(--text)] mb-1">${awardIssuer(item)}</p>
        ${awardYear(item) ? `<span class="inline-block text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mt-2" style="background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary);">${awardYear(item)}</span>` : ''}
        ${awardDesc(item) ? `<p class="text-xs text-[var(--text)] opacity-50 leading-relaxed mt-3">${awardDesc(item)}</p>` : ''}
      </div>`).join('')}
    </div>
  </div>
  <style>
    [data-section="awards"] .group:hover i {
      animation: awardBounce 0.5s ease;
    }
    @keyframes awardBounce {
      0%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
      60% { transform: translateY(-2px); }
    }
  </style>
</section>`;
  },

  // ─── 2. AWARDS_COMPACT_LIST ──────────────────────────────────────────────
  AWARDS_COMPACT_LIST: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="awards" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-4xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Recognition</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="awards-title">${content.title || 'Awards'}</h2>
    </div>
    <div class="flex flex-col">
      ${items.map((item: any, i: number) => `
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 py-6 border-t border-[var(--text)]/10 group hover:bg-[var(--surface)]/40 transition-colors duration-200 px-3 -mx-3 rounded-xl">
        <!-- Year -->
        <div class="sm:w-20 flex-shrink-0">
          <span class="text-xs font-black uppercase tracking-[0.25em]" style="color:var(--primary);">${awardYear(item) || '—'}</span>
        </div>
        <!-- Award name -->
        <div class="flex-1">
          <h3 class="text-base font-black text-[var(--heading)] group-hover:text-[color:var(--primary)] transition-colors">${awardName(item)}</h3>
          ${awardDesc(item) ? `<p class="text-xs text-[var(--text)] opacity-50 mt-1 leading-relaxed line-clamp-1">${awardDesc(item)}</p>` : ''}
        </div>
        <!-- Issuer -->
        <div class="sm:text-right flex-shrink-0">
          <span class="text-sm font-bold opacity-50 text-[var(--text)]">${awardIssuer(item)}</span>
        </div>
        <!-- Icon -->
        <div class="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
             style="background:color-mix(in srgb,var(--primary) 12%,transparent);">
          <i class="${trophyIcons[i % trophyIcons.length]} text-xs" style="color:var(--primary);"></i>
        </div>
      </div>`).join('')}
      <div class="border-t border-[var(--text)]/10"></div>
    </div>
  </div>
</section>`;
  },

  // ─── 3. AWARDS_FEATURED ──────────────────────────────────────────────────
  AWARDS_FEATURED: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    const featured = items[0];
    const rest = items.slice(1, 4);
    return `
<section data-section="awards" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Recognition</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="awards-title">${content.title || 'Awards'}</h2>
    </div>
    ${featured ? `
    <!-- Featured award -->
    <div class="rounded-3xl p-10 md:p-14 mb-8 relative overflow-hidden"
         style="background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 60%,var(--surface)));">
      <!-- Background decorative icon -->
      <div class="absolute top-0 right-0 w-64 h-64 flex items-center justify-center opacity-10 pointer-events-none select-none -translate-y-8 translate-x-8">
        <i class="fas fa-trophy" style="font-size:10rem;color:var(--bg);"></i>
      </div>
      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
        <div class="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
             style="background:rgba(255,255,255,0.15);">
          <i class="fas fa-trophy text-4xl text-[var(--bg)]"></i>
        </div>
        <div>
          <span class="text-xs font-black uppercase tracking-[0.3em] text-[var(--bg)] opacity-70 block mb-2">Featured Award</span>
          <h3 class="text-3xl md:text-4xl font-black text-[var(--bg)] leading-tight mb-2">${awardName(featured)}</h3>
          <div class="flex flex-wrap items-center gap-3">
            ${awardIssuer(featured) ? `<span class="text-sm font-bold text-[var(--bg)] opacity-80">${awardIssuer(featured)}</span>` : ''}
            ${awardYear(featured) ? `<span class="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full" style="background:rgba(255,255,255,0.15);color:var(--bg);">${awardYear(featured)}</span>` : ''}
          </div>
          ${awardDesc(featured) ? `<p class="text-sm text-[var(--bg)] opacity-70 mt-3 max-w-xl leading-relaxed">${awardDesc(featured)}</p>` : ''}
        </div>
      </div>
    </div>` : ''}
    <!-- Other awards as pills -->
    ${rest.length > 0 ? `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      ${rest.map((item: any, i: number) => `
      <div class="rounded-2xl p-6 border border-[var(--text)]/10 hover:border-[var(--primary)]/40 group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
           style="background:var(--surface);">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style="background:color-mix(in srgb,var(--primary) 12%,transparent);">
            <i class="${trophyIcons[(i + 1) % trophyIcons.length]} text-sm" style="color:var(--primary);"></i>
          </div>
          ${awardYear(item) ? `<span class="text-xs font-black uppercase tracking-wider" style="color:var(--primary);">${awardYear(item)}</span>` : ''}
        </div>
        <h3 class="text-base font-black text-[var(--heading)] mb-1 leading-tight">${awardName(item)}</h3>
        <p class="text-xs font-bold opacity-50 text-[var(--text)]">${awardIssuer(item)}</p>
      </div>`).join('')}
    </div>` : ''}
  </div>
</section>`;
  },

};
