
// ─── Experience Registry ──────────────────────────────────────────────────────
// All components return pure HTML strings. Tailwind CDN + FA 6 + CSS vars.

const role = (item: any) => item.role || item.title || item.position || 'Role';
const period = (item: any) => item.period || item.duration || item.date || '';
const desc = (item: any) => item.description || item.summary || '';
const points = (item: any): string[] => item.points || item.achievements || item.highlights || [];

// ─────────────────────────────────────────────────────────────────────────────

export const EXP_TIMELINE_VERTICAL = (content: any) => {
    const items = content.items || content.experiences || [];
    return `
<section id="experience" data-section="experience" class="py-24 px-6">
  <div class="max-w-4xl mx-auto">
    <div class="mb-16 text-center">
      <p class="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)] mb-3">${content.label || 'Career Path'}</p>
      <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tighter" data-field="experience-title">${content.title || 'Experience'}</h2>
    </div>
    <div class="relative">
      <!-- Timeline spine -->
      <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--primary)]/50 via-[var(--primary)]/20 to-transparent transform md:-translate-x-px"></div>
      <div class="space-y-12">
        ${items.map((item: any, i: number) => `
        <div class="relative flex flex-col md:flex-row gap-8 md:items-center">
          <!-- Dot -->
          <div class="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-[var(--primary)] border-2 border-[var(--bg)] shadow-lg shadow-[var(--primary)]/30 z-10 transform -translate-x-1/2 mt-6 md:mt-0"></div>
          <!-- Left side -->
          <div class="flex-1 pl-10 md:pl-0 md:pr-12 ${i % 2 === 0 ? 'md:text-right' : 'md:order-3 md:pl-12 md:pr-0'}">
            ${i % 2 === 0 ? `
              <span class="inline-block text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-2 px-3 py-1 bg-[var(--primary)]/10 rounded-full">${period(item)}</span>
              <h3 class="text-xl font-black uppercase leading-tight mb-1">${role(item)}</h3>
              <p class="font-bold opacity-50 text-sm uppercase tracking-wider">${item.company || ''}</p>
            ` : `
              <p class="text-sm opacity-50 leading-relaxed max-w-sm ${i % 2 !== 0 ? '' : 'ml-auto'}">${desc(item)}</p>
              ${points(item).length > 0 ? `
              <ul class="mt-3 space-y-1.5">
                ${points(item).slice(0, 3).map((p: string) => `
                <li class="flex items-start gap-2 text-sm opacity-60">
                  <span class="text-[var(--primary)] mt-0.5">▸</span>${p}
                </li>`).join('')}
              </ul>` : ''}
            `}
          </div>
          <!-- Spacer -->
          <div class="hidden md:block w-0 md:order-2"></div>
          <!-- Right side -->
          <div class="flex-1 ${i % 2 === 0 ? 'md:order-3 md:pl-12' : 'pl-10 md:pl-0 md:pr-12 md:text-right'}">
            ${i % 2 !== 0 ? `
              <span class="inline-block text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-2 px-3 py-1 bg-[var(--primary)]/10 rounded-full">${period(item)}</span>
              <h3 class="text-xl font-black uppercase leading-tight mb-1">${role(item)}</h3>
              <p class="font-bold opacity-50 text-sm uppercase tracking-wider">${item.company || ''}</p>
            ` : `
              <p class="text-sm opacity-50 leading-relaxed max-w-sm">${desc(item)}</p>
              ${points(item).length > 0 ? `
              <ul class="mt-3 space-y-1.5">
                ${points(item).slice(0, 3).map((p: string) => `
                <li class="flex items-start gap-2 text-sm opacity-60">
                  <span class="text-[var(--primary)] mt-0.5">▸</span>${p}
                </li>`).join('')}
              </ul>` : ''}
            `}
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </div>
</section>`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const EXP_ACCORDION_MINIMAL = (content: any) => {
    const items = content.items || content.experiences || [];
    return `
<section id="experience" data-section="experience" class="py-24 px-6 border-y border-[var(--text)]/5">
  <div class="max-w-5xl mx-auto">
    <div class="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
      <h2 class="text-5xl font-black uppercase italic tracking-tighter" data-field="experience-title">${content.title || 'Experience'}</h2>
      <p class="text-sm font-bold opacity-35 uppercase tracking-widest">${content.subtitle || 'Professional History'}</p>
    </div>
    <div class="divide-y divide-[var(--text)]/10">
      ${items.map((item: any, i: number) => `
      <details class="group py-8 cursor-pointer" ${i === 0 ? 'open' : ''}>
        <summary class="flex flex-col md:flex-row justify-between items-start md:items-center list-none gap-4 select-none">
          <div class="space-y-1">
            <p class="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70">${item.company || ''} ${period(item) ? `· ${period(item)}` : ''}</p>
            <h3 class="text-2xl md:text-3xl font-black group-open:text-[var(--primary)] transition-colors duration-300">${role(item)}</h3>
          </div>
          <div class="shrink-0 w-8 h-8 rounded-full border border-[var(--text)]/20 flex items-center justify-center group-open:bg-[var(--primary)] group-open:border-[var(--primary)] transition-all duration-300">
            <i class="fas fa-plus text-xs group-open:rotate-45 transition-transform duration-300 group-open:text-[var(--bg)]"></i>
          </div>
        </summary>
        <div class="mt-6 pt-6 border-t border-[var(--text)]/5 space-y-4">
          <p class="text-lg opacity-60 leading-relaxed max-w-3xl">${desc(item)}</p>
          ${points(item).length > 0 ? `
          <ul class="space-y-2.5 mt-4">
            ${points(item).map((p: string) => `
            <li class="flex items-start gap-3 text-sm opacity-70">
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0"></span>${p}
            </li>`).join('')}
          </ul>` : ''}
        </div>
      </details>
      `).join('')}
    </div>
  </div>
</section>`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const EXP_CARDS_GRID = (content: any) => {
    const items = content.items || content.experiences || [];
    return `
<section id="experience" data-section="experience" class="py-24 px-6">
  <div class="max-w-7xl mx-auto space-y-16">
    <div class="flex flex-col md:flex-row justify-between items-end gap-4">
      <h2 class="text-5xl font-black uppercase tracking-tighter leading-none" data-field="experience-title">${content.title || 'Career Path'}</h2>
      <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-35">${content.subtitle || 'Role Archive'}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${items.map((item: any, i: number) => `
      <div class="group relative p-8 bg-[var(--surface)] border border-[var(--text)]/5 rounded-3xl space-y-6 hover:border-[var(--primary)]/30 hover:shadow-xl hover:shadow-[var(--primary)]/5 transition-all duration-500">
        <!-- Top: logo letter + period -->
        <div class="flex items-start justify-between">
          <div class="w-12 h-12 bg-[var(--primary)]/10 group-hover:bg-[var(--primary)] rounded-2xl flex items-center justify-center font-black text-[var(--primary)] group-hover:text-[var(--bg)] text-lg transition-all duration-300">
            ${(item.company || 'X')[0].toUpperCase()}
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest py-1.5 px-3 bg-[var(--bg)] border border-[var(--text)]/10 rounded-full opacity-60">${period(item)}</span>
        </div>
        <!-- Content -->
        <div class="space-y-1.5">
          <h3 class="text-xl font-black uppercase leading-tight group-hover:text-[var(--primary)] transition-colors duration-300">${role(item)}</h3>
          <p class="font-bold opacity-50 text-xs uppercase tracking-widest">${item.company || ''}</p>
        </div>
        <p class="text-sm opacity-50 leading-relaxed">${desc(item).substring(0, 120)}${desc(item).length > 120 ? '…' : ''}</p>
        <!-- Bottom: achievements count -->
        ${points(item).length > 0 ? `
        <div class="pt-4 border-t border-[var(--text)]/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
          <i class="fas fa-check-circle text-[var(--primary)] opacity-100"></i>
          ${points(item).length} key achievement${points(item).length > 1 ? 's' : ''}
        </div>` : ''}
      </div>
      `).join('')}
    </div>
  </div>
</section>`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const EXP_HORIZONTAL_SCROLL = (content: any) => {
    const items = content.items || content.experiences || [];
    return `
<section id="experience" data-section="experience" class="py-24 px-6 bg-[var(--surface)] overflow-hidden relative">
  <div class="absolute inset-0 opacity-5">
    <div class="absolute top-1/2 left-0 right-0 h-px bg-[var(--text)]"></div>
  </div>
  <div class="max-w-7xl mx-auto mb-12 relative z-10 flex items-end justify-between gap-4">
    <h2 class="text-4xl font-black uppercase tracking-widest" data-field="experience-title">${content.title || 'Experience'}</h2>
    <p class="text-[10px] font-black uppercase tracking-widest opacity-30 hidden md:block">Scroll to explore →</p>
  </div>
  <div class="flex gap-8 overflow-x-auto pb-8 px-1 snap-x snap-mandatory no-scrollbar relative z-10">
    ${items.map((item: any, i: number) => `
    <div class="min-w-[340px] md:min-w-[420px] p-10 bg-[var(--bg)] border border-[var(--text)]/10 rounded-3xl flex flex-col justify-between h-[420px] shrink-0 snap-start group hover:border-[var(--primary)]/40 transition-all duration-500">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">${period(item)}</span>
          <span class="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center font-black text-[var(--primary)] text-sm">
            ${String(i + 1).padStart(2, '0')}
          </span>
        </div>
        <div class="space-y-2">
          <h3 class="text-2xl font-black uppercase leading-tight group-hover:text-[var(--primary)] transition-colors duration-300">${role(item)}</h3>
          <p class="text-base font-bold opacity-50 uppercase tracking-widest text-sm">${item.company || ''}</p>
        </div>
      </div>
      <div class="space-y-4">
        <div class="h-px bg-[var(--text)]/10"></div>
        <p class="text-sm opacity-55 leading-relaxed">${desc(item).substring(0, 150)}${desc(item).length > 150 ? '…' : ''}</p>
        ${points(item).length > 0 ? `
        <div class="flex flex-wrap gap-2">
          ${points(item).slice(0, 2).map((p: string) => `
          <span class="text-[10px] px-2.5 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full font-bold">${p.substring(0, 40)}${p.length > 40 ? '…' : ''}</span>
          `).join('')}
        </div>` : ''}
      </div>
    </div>
    `).join('')}
  </div>
</section>
<style>.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}</style>`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const EXP_TABS_SWITCH = (content: any) => {
    const items = (content.items || content.experiences || []);
    const uid = `etabs${Math.floor(Math.random() * 99999)}`;
    return `
<section id="experience" data-section="experience" class="py-24 px-6 border-y border-[var(--text)]/5">
  <div class="max-w-5xl mx-auto">
    <div class="mb-12">
      <p class="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)] mb-3">${content.label || "Where I've Worked"}</p>
      <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tighter" data-field="experience-title">${content.title || 'Experience'}</h2>
    </div>
    <div id="${uid}-root" class="grid grid-cols-1 md:grid-cols-12 gap-8">
      <!-- Company tabs -->
      <div class="md:col-span-4 flex md:flex-col gap-2 overflow-x-auto no-scrollbar">
        ${items.map((item: any, i: number) => `
        <button
          onclick="(function(btn){
            var root = document.getElementById('${uid}-root');
            root.querySelectorAll('[data-tab]').forEach(function(p){p.setAttribute('hidden','');});
            root.querySelectorAll('[data-tab-btn]').forEach(function(b){b.setAttribute('data-active','0');});
            root.querySelector('[data-tab=\"${uid}-${i}\"]').removeAttribute('hidden');
            btn.setAttribute('data-active','1');
          })(this)"
          data-tab-btn="${uid}"
          data-active="${i === 0 ? '1' : '0'}"
          style="background:${i === 0 ? 'var(--primary)' : 'var(--surface)'}; color:${i === 0 ? 'var(--bg)' : 'var(--text)'}; opacity:${i === 0 ? '1' : '0.6'};"
          class="shrink-0 text-left px-5 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all duration-200 border border-[var(--text)]/10 hover:opacity-100"
          onmouseenter="if(this.getAttribute('data-active')!='1')this.style.opacity='1'"
          onmouseleave="if(this.getAttribute('data-active')!='1')this.style.opacity='0.6'"
        >${item.company || role(item)}</button>
        `).join('')}
      </div>
      <!-- Content panels -->
      <div class="md:col-span-8 min-h-[280px]">
        ${items.map((item: any, i: number) => `
        <div data-tab="${uid}-${i}" ${i !== 0 ? 'hidden' : ''} class="space-y-5">
          <div class="space-y-1">
            <h3 class="text-2xl md:text-3xl font-black uppercase leading-tight">${role(item)}</h3>
            <p class="text-base font-bold text-[var(--primary)]">${item.company || ''}</p>
            <p class="text-sm opacity-40 font-semibold uppercase tracking-widest">${period(item)}</p>
          </div>
          <div class="h-px bg-[var(--text)]/10"></div>
          <p class="text-base opacity-65 leading-relaxed">${desc(item)}</p>
          ${points(item).length > 0 ? `
          <ul class="space-y-3">
            ${points(item).map((p: string) => `
            <li class="flex items-start gap-3 text-sm">
              <span class="text-[var(--primary)] mt-0.5 shrink-0">▹</span>
              <span class="opacity-75">${p}</span>
            </li>`).join('')}
          </ul>` : ''}
        </div>
        `).join('')}
      </div>
    </div>
  </div>
</section>
<style>
.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
[data-tab-btn="${uid}"][data-active="1"]{background:var(--primary)!important;color:var(--bg)!important;opacity:1!important;}
</style>`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const EXP_SIDEBAR_LIST = (content: any) => {
    const items = content.items || content.experiences || [];
    return `
<section id="experience" data-section="experience" class="py-24 px-6">
  <div class="max-w-7xl mx-auto space-y-16">
    <div>
      <h2 class="text-6xl md:text-8xl font-black uppercase italic tracking-tighter opacity-[0.06] select-none">${content.bgWord || 'LEGACY'}</h2>
      <h3 class="text-4xl font-black uppercase tracking-tighter -mt-6 md:-mt-10" data-field="experience-title">${content.title || 'Work History'}</h3>
    </div>
    <div>
      ${items.map((item: any) => `
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-10 border-t border-[var(--text)]/10 group hover:bg-[var(--primary)]/3 transition-colors px-4 rounded-2xl -mx-4">
        <div class="md:col-span-2 text-[10px] font-black uppercase tracking-widest opacity-40 pt-1">${period(item)}</div>
        <div class="md:col-span-5 space-y-1.5">
          <h4 class="text-2xl font-black uppercase group-hover:text-[var(--primary)] transition-colors duration-300">${role(item)}</h4>
          <p class="text-sm font-bold opacity-50 uppercase tracking-wider">${item.company || ''}</p>
        </div>
        <div class="md:col-span-5">
          <p class="text-sm opacity-50 leading-relaxed">${desc(item)}</p>
          ${points(item).length > 0 ? `
          <ul class="mt-3 space-y-1">
            ${points(item).slice(0, 2).map((p: string) => `
            <li class="flex items-start gap-2 text-xs opacity-50">
              <span class="text-[var(--primary)] mt-0.5">·</span>${p}
            </li>`).join('')}
          </ul>` : ''}
        </div>
      </div>
      `).join('')}
    </div>
  </div>
</section>`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const EXP_GLASSMORPHIC = (content: any) => {
    const items = content.items || content.experiences || [];
    return `
<section id="experience" data-section="experience" class="py-24 px-6 relative overflow-hidden">
  <!-- Ambient blobs -->
  <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--primary)]/8 rounded-full blur-[150px] pointer-events-none"></div>
  <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--secondary,var(--primary))]/6 rounded-full blur-[120px] pointer-events-none"></div>

  <div class="max-w-5xl mx-auto relative z-10 space-y-16">
    <div class="text-center space-y-3">
      <p class="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">${content.label || 'Career'}</p>
      <h2 class="text-5xl font-black uppercase tracking-tighter" data-field="experience-title">${content.title || 'Experience'}</h2>
    </div>

    <div class="space-y-5">
      ${items.map((item: any, i: number) => `
      <div class="group relative p-8 bg-[var(--surface)]/50 backdrop-blur-xl border border-[var(--text)]/10 hover:border-[var(--primary)]/30 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--primary)]/5">
        <div class="flex flex-col md:flex-row md:items-center gap-6">
          <!-- Number -->
          <div class="text-6xl font-black opacity-5 group-hover:opacity-10 transition-opacity select-none absolute top-4 right-6">
            ${String(i + 1).padStart(2, '0')}
          </div>
          <!-- Company badge -->
          <div class="shrink-0 w-14 h-14 rounded-2xl bg-[var(--primary)]/10 group-hover:bg-[var(--primary)] flex items-center justify-center font-black text-[var(--primary)] group-hover:text-[var(--bg)] text-xl transition-all duration-300">
            ${(item.company || 'X')[0].toUpperCase()}
          </div>
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
              <h3 class="text-xl font-black uppercase group-hover:text-[var(--primary)] transition-colors">${role(item)}</h3>
              <span class="text-sm font-bold opacity-40">${item.company || ''}</span>
            </div>
            <p class="text-sm opacity-50 leading-relaxed max-w-2xl">${desc(item)}</p>
          </div>
          <!-- Period -->
          <div class="shrink-0 text-right">
            <span class="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 bg-[var(--primary)]/10 px-3 py-1.5 rounded-full">${period(item)}</span>
          </div>
        </div>
        ${points(item).length > 0 ? `
        <div class="mt-5 pt-5 border-t border-[var(--text)]/5 grid grid-cols-1 md:grid-cols-2 gap-2">
          ${points(item).slice(0, 4).map((p: string) => `
          <div class="flex items-start gap-2 text-xs opacity-55">
            <i class="fas fa-check-circle text-[var(--primary)] mt-0.5 shrink-0"></i>
            <span>${p}</span>
          </div>`).join('')}
        </div>` : ''}
      </div>
      `).join('')}
    </div>
  </div>
</section>`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const EXP_MAGAZINE = (content: any) => {
    const items = content.items || content.experiences || [];
    const featured = items[0];
    const rest = items.slice(1);
    return `
<section id="experience" data-section="experience" class="py-24 px-6 border-y border-[var(--text)]/10">
  <div class="max-w-7xl mx-auto space-y-16">
    <!-- Section header -->
    <div class="flex items-end justify-between border-b-4 border-[var(--heading)] pb-4">
      <h2 class="text-xs font-black uppercase tracking-[0.4em]" data-field="experience-title">${content.title || 'Experience'}</h2>
      <p class="text-xs opacity-35 uppercase tracking-widest">${content.subtitle || 'Professional Record'}</p>
    </div>

    ${featured ? `
    <!-- Featured (most recent) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <div class="lg:col-span-7 space-y-6">
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] mb-2">${period(featured)} · ${featured.company || ''}</p>
          <h3 class="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">${role(featured)}</h3>
        </div>
        <p class="text-xl opacity-60 leading-relaxed">${desc(featured)}</p>
        ${points(featured).length > 0 ? `
        <ul class="space-y-3">
          ${points(featured).slice(0, 4).map((p: string) => `
          <li class="flex items-start gap-3 text-sm">
            <span class="font-black text-[var(--primary)] mt-0.5">—</span>
            <span class="opacity-70">${p}</span>
          </li>`).join('')}
        </ul>` : ''}
      </div>
      <div class="lg:col-span-5 space-y-4">
        <div class="p-6 bg-[var(--primary)] text-[var(--bg)] rounded-2xl">
          <p class="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Current Role</p>
          <p class="text-2xl font-black uppercase">${featured.company || 'Company'}</p>
        </div>
        ${rest.slice(0, 3).map((item: any) => `
        <div class="p-5 bg-[var(--surface)] border border-[var(--text)]/5 rounded-2xl group hover:border-[var(--primary)]/20 transition-all">
          <div class="flex justify-between items-start gap-2">
            <div>
              <h4 class="font-black uppercase text-sm group-hover:text-[var(--primary)] transition-colors">${role(item)}</h4>
              <p class="text-xs opacity-40 font-bold">${item.company || ''}</p>
            </div>
            <span class="text-[10px] font-black opacity-35 shrink-0">${period(item)}</span>
          </div>
        </div>
        `).join('')}
      </div>
    </div>` : '<p class="text-sm opacity-40">No experience listed yet.</p>'}
  </div>
</section>`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const EXP_NUMBERED_LIST = (content: any) => {
    const items = content.items || content.experiences || [];
    return `
<section id="experience" data-section="experience" class="py-24 px-6">
  <div class="max-w-4xl mx-auto space-y-16">
    <div class="space-y-3">
      <p class="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">${content.label || 'Background'}</p>
      <h2 class="text-5xl font-black uppercase tracking-tighter" data-field="experience-title">${content.title || 'Experience'}</h2>
    </div>
    <div class="space-y-0">
      ${items.map((item: any, i: number) => `
      <div class="group grid grid-cols-12 gap-6 py-8 border-t border-[var(--text)]/10 hover:border-[var(--primary)]/30 transition-colors">
        <!-- Number -->
        <div class="col-span-2 md:col-span-1">
          <span class="text-3xl font-black opacity-15 group-hover:opacity-40 group-hover:text-[var(--primary)] transition-all">${String(i + 1).padStart(2, '0')}</span>
        </div>
        <!-- Content -->
        <div class="col-span-10 md:col-span-11 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2 space-y-2">
            <h3 class="text-2xl font-black uppercase group-hover:text-[var(--primary)] transition-colors duration-300">${role(item)}</h3>
            <div class="flex items-center gap-3 text-sm">
              <span class="font-bold opacity-60">${item.company || ''}</span>
              ${period(item) ? `<span class="opacity-30">·</span><span class="text-[10px] font-black uppercase tracking-widest opacity-40">${period(item)}</span>` : ''}
            </div>
            <p class="text-sm opacity-50 leading-relaxed mt-2">${desc(item)}</p>
          </div>
          ${points(item).length > 0 ? `
          <div class="space-y-1.5">
            ${points(item).slice(0, 3).map((p: string) => `
            <p class="text-xs opacity-50 flex items-start gap-2">
              <span class="text-[var(--primary)] mt-0.5 shrink-0">·</span>${p}
            </p>`).join('')}
          </div>` : ''}
        </div>
      </div>
      `).join('')}
    </div>
  </div>
</section>`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const ExperienceRegistry: any = {
    EXP_TIMELINE_VERTICAL,
    EXP_ACCORDION_MINIMAL,
    EXP_CARDS_GRID,
    EXP_HORIZONTAL_SCROLL,
    EXP_TABS_SWITCH,
    EXP_SIDEBAR_LIST,
    EXP_GLASSMORPHIC,
    EXP_MAGAZINE,
    EXP_NUMBERED_LIST,
};
