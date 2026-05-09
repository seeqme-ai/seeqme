// ============================================================
// SEEQME STATS EXTENDED REGISTRY — 6 additional stats section styles
// ============================================================

const statIcon = (item: any): string => {
  const icon = item.icon || '';
  if (icon.startsWith('fa')) return icon;
  const map: Record<string, string> = {
    users: 'fas fa-users', clients: 'fas fa-user-tie', projects: 'fas fa-briefcase',
    years: 'fas fa-calendar-alt', awards: 'fas fa-trophy', stars: 'fas fa-star',
    reviews: 'fas fa-star', code: 'fas fa-code', commits: 'fas fa-code-branch',
    revenue: 'fas fa-dollar-sign', growth: 'fas fa-chart-line', uptime: 'fas fa-server',
    countries: 'fas fa-globe', coffee: 'fas fa-coffee',
  };
  const lower = (item.label || item.title || '').toLowerCase();
  for (const [k, v] of Object.entries(map)) { if (lower.includes(k)) return v; }
  return 'fas fa-chart-bar';
};

export const StatsExtendedRegistry: Record<string, (content: any) => string> = {

  // ─── 1. STATS_BENTO_GRID ─────────────────────────────────────────────────
  STATS_BENTO_GRID: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="stats" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    ${content.title ? `
    <div class="mb-12 space-y-2">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Numbers</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="stats-title">${content.title}</h2>
    </div>` : ''}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
      ${items.map((item: any, i: number) => `
      <div class="${i === 0 ? 'sm:col-span-2' : ''} rounded-2xl p-8 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
           style="background:${i === 0 ? 'linear-gradient(135deg,color-mix(in srgb,var(--primary) 15%,var(--surface)),var(--surface))' : 'var(--surface)'};min-height:${i === 0 ? '180px' : '160px'};">
        <i class="${statIcon(item)} text-xl" style="color:var(--primary);opacity:0.7;"></i>
        <div>
          <p class="font-black text-[var(--heading)] leading-none mb-2" style="font-size:clamp(2.5rem,5vw,4rem);">${item.value || item.number || '0'}</p>
          <p class="text-xs font-black uppercase tracking-[0.25em] opacity-50 text-[var(--text)]">${item.label || item.title || 'Metric'}</p>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 2. STATS_NEON_COUNTERS ──────────────────────────────────────────────
  STATS_NEON_COUNTERS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="stats" class="relative py-20 md:py-28 bg-[var(--surface)]">
  <div class="max-w-6xl mx-auto px-6">
    ${content.title ? `
    <div class="mb-14 text-center space-y-2">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Impact</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]">${content.title}</h2>
    </div>` : ''}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[var(--text)]/10">
      ${items.map((item: any) => `
      <div class="flex flex-col items-center justify-center py-10 px-8 text-center group">
        <p class="font-black text-[var(--heading)] leading-none mb-3 transition-all duration-300"
           style="font-size:clamp(3rem,6vw,5rem);text-shadow:0 0 40px color-mix(in srgb,var(--primary) 60%,transparent);">${item.value || item.number || '0'}</p>
        <p class="text-xs font-black uppercase tracking-[0.3em] text-[var(--text)] opacity-50">${item.label || item.title || 'Metric'}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 3. STATS_HORIZONTAL_BARS ────────────────────────────────────────────
  STATS_HORIZONTAL_BARS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="stats" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-4xl mx-auto px-6">
    ${content.title ? `
    <div class="mb-14 space-y-2">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Stats</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]">${content.title}</h2>
    </div>` : ''}
    <div class="flex flex-col gap-8">
      ${items.map((item: any, i: number) => {
        const pct = typeof item.percentage === 'number' ? item.percentage : Math.min(95, 60 + i * 7);
        return `
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <i class="${statIcon(item)} text-sm" style="color:var(--primary);"></i>
            <span class="text-sm font-black text-[var(--heading)]">${item.label || item.title || 'Metric'}</span>
          </div>
          <span class="text-sm font-black text-[var(--heading)]">${item.value || item.number || `${pct}%`}</span>
        </div>
        <div class="h-2 rounded-full overflow-hidden" style="background:color-mix(in srgb,var(--primary) 12%,var(--surface));">
          <div class="h-full rounded-full transition-all duration-1000 ease-out"
               style="width:${pct}%;background:linear-gradient(90deg,var(--primary),color-mix(in srgb,var(--primary) 70%,var(--secondary,var(--primary))));"
               data-width="${pct}"></div>
        </div>
      </div>`;
      }).join('')}
    </div>
  </div>
  <script>
    (function(){
      var bars = document.querySelectorAll('[data-section="stats"] [data-width]');
      bars.forEach(function(bar){
        var target = bar.getAttribute('data-width');
        bar.style.width = '0%';
        requestAnimationFrame(function(){
          setTimeout(function(){ bar.style.width = target + '%'; }, 100);
        });
      });
    })();
  </script>
</section>`;
  },

  // ─── 4. STATS_GLASS_CARDS ────────────────────────────────────────────────
  STATS_GLASS_CARDS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="stats" class="relative py-20 md:py-28 bg-[var(--surface)] overflow-hidden">
  <!-- Background blob -->
  <div class="absolute inset-0 pointer-events-none overflow-hidden">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
         style="background:radial-gradient(circle,var(--primary),transparent 70%);filter:blur(80px);"></div>
  </div>
  <div class="relative z-10 max-w-6xl mx-auto px-6">
    ${content.title ? `
    <div class="mb-14 text-center space-y-2">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Stats</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]">${content.title}</h2>
    </div>` : ''}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      ${items.map((item: any) => `
      <div class="rounded-2xl p-7 border border-white/10 backdrop-blur-md text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
           style="background:rgba(255,255,255,0.05);">
        <i class="${statIcon(item)} text-2xl mb-4 block" style="color:var(--primary);"></i>
        <p class="font-black text-[var(--heading)] leading-none mb-2" style="font-size:clamp(2rem,4vw,3rem);">${item.value || item.number || '0'}</p>
        <p class="text-xs font-black uppercase tracking-[0.3em] opacity-50 text-[var(--text)]">${item.label || item.title || 'Metric'}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 5. STATS_BOLD_ROWS ──────────────────────────────────────────────────
  STATS_BOLD_ROWS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="stats" class="relative bg-[var(--bg)]">
  ${content.title ? `
  <div class="py-14 md:py-20 max-w-7xl mx-auto px-6">
    <span class="text-xs font-black uppercase tracking-[0.4em] block mb-3" style="color:var(--primary);">Numbers</span>
    <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]">${content.title}</h2>
  </div>` : ''}
  <div class="flex flex-col">
    ${items.map((item: any, i: number) => `
    <div class="flex flex-col sm:flex-row sm:items-center gap-6 px-6 md:px-16 py-10 md:py-14 border-t border-[var(--text)]/10 transition-colors duration-300 hover:bg-[var(--surface)]/50"
         style="background:${i % 2 === 0 ? 'var(--bg)' : 'var(--surface)/30'};">
      <div class="sm:w-1/3 flex-shrink-0">
        <p class="font-black text-[var(--heading)] leading-none" style="font-size:clamp(3rem,8vw,6rem);">${item.value || item.number || '0'}</p>
      </div>
      <div class="flex-1">
        <p class="text-lg font-black text-[var(--heading)] mb-2">${item.label || item.title || 'Metric'}</p>
        ${item.description ? `<p class="text-sm text-[var(--text)] opacity-60 leading-relaxed">${item.description}</p>` : ''}
      </div>
      <i class="${statIcon(item)} text-2xl flex-shrink-0 opacity-30 text-[var(--text)]"></i>
    </div>`).join('')}
    <div class="border-t border-[var(--text)]/10"></div>
  </div>
</section>`;
  },

  // ─── 6. STATS_AGENCY_TICKER ──────────────────────────────────────────────
  STATS_AGENCY_TICKER: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    const tickerItems = [...items, ...items]; // duplicate for seamless loop
    return `
<section data-section="stats" class="relative py-14 bg-[var(--surface)] overflow-hidden">
  ${content.title ? `
  <div class="max-w-7xl mx-auto px-6 mb-10">
    <h2 class="text-4xl font-black tracking-tighter text-[var(--heading)]">${content.title}</h2>
  </div>` : ''}
  <div class="overflow-hidden border-y border-[var(--text)]/10 py-6">
    <div class="flex items-center gap-0 whitespace-nowrap" style="animation:statsTickerScroll 20s linear infinite;width:max-content;">
      ${tickerItems.map((item: any) => `
      <span class="inline-flex items-center gap-4 px-10 text-xl md:text-2xl font-black text-[var(--heading)]">
        <span style="color:var(--primary);">·</span>
        <span>${item.value || item.number || '0'}</span>
        <span class="text-xs font-black uppercase tracking-[0.3em] opacity-50 text-[var(--text)]">${item.label || item.title || 'Metric'}</span>
      </span>`).join('')}
    </div>
  </div>
  <style>
    @keyframes statsTickerScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  </style>
</section>`;
  },

};
