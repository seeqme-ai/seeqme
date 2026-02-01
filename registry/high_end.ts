/**
 * REFINED COMPONENT CATEGORIES
 * Services, Pricing, FAQ, Team, Logos, Process
 */

// --- SERVICES ---
export const SERVICES_GLOW_GRID = (content: any) => {
  const items = content.items || [];
  return `
  <section data-section="services" class="py-24 px-6 overflow-hidden">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
        <div class="max-w-xl">
          <span class="text-xs font-black uppercase tracking-[0.5em] text-[var(--primary)] opacity-60">Solutions</span>
          <h2 class="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mt-4">${content.title || 'Elite Services'}</h2>
        </div>
        <p class="max-w-xs text-lg opacity-40 font-medium leading-relaxed">${content.description || 'Systematic approaches to contemporary challenges.'}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-[3rem] overflow-hidden">
        ${items.map((s: any) => `
          <div class="p-12 bg-[var(--bg)] group hover:bg-[var(--primary)] transition-all duration-700">
            <div class="w-14 h-14 bg-[var(--surface)] p-3 rounded-2xl mb-8 border border-white/5 shadow-2xl group-hover:bg-white group-hover:scale-110 transition-all">
              <span class="text-2xl">${s.icon || '⚡'}</span>
            </div>
            <h3 class="text-2xl font-black uppercase mb-4 group-hover:text-[var(--bg)] transition-colors">${s.title}</h3>
            <p class="text-lg opacity-50 font-medium leading-relaxed group-hover:text-[var(--bg)] group-hover:opacity-70 transition-all">${s.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

// --- PRICING ---
export const PRICING_MODERN_TIERS = (content: any) => {
  const items = content.items || [];
  return `
  <section data-section="pricing" class="py-24 px-6 bg-[var(--surface)]/30 border-y border-white/5">
    <div class="max-w-7xl mx-auto space-y-16">
      <div class="text-center space-y-4">
        <h2 class="text-xs font-black uppercase tracking-[0.5em] opacity-40">Value Structure</h2>
        <h3 class="text-5xl font-black uppercase tracking-tighter">${content.title || 'Investment Plans'}</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${items.map((plan: any) => `
          <div class="p-12 bg-[var(--bg)] border border-white/10 rounded-[4rem] flex flex-col justify-between group hover:border-[var(--primary)] transition-all ${plan.featured ? 'ring-2 ring-[var(--primary)] scale-105 z-10' : ''}">
            <div class="space-y-6">
              <div class="flex justify-between items-start">
                <span class="px-4 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest opacity-60">${plan.name}</span>
                ${plan.featured ? '<span class="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">Most Selected</span>' : ''}
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-6xl font-black italic tracking-tighter">${plan.price}</span>
                <span class="text-lg opacity-40">/${plan.period || 'mo'}</span>
              </div>
              <ul class="space-y-4 pt-4 border-t border-white/5">
                ${(plan.features || []).map((f: string) => `
                  <li class="flex items-center gap-3 text-sm font-medium opacity-60">
                    <span class="text-[var(--primary)] font-black">✓</span> ${f}
                  </li>
                `).join('')}
              </ul>
            </div>
            <a href="${plan.link || '#'}" class="mt-12 w-full py-5 bg-[var(--surface)] text-center rounded-2xl font-black uppercase text-xs tracking-widest group-hover:bg-[var(--primary)] group-hover:text-[var(--bg)] transition-all">Begin Engagement</a>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

// --- FAQ ---
export const FAQ_ACCORDION_NEON = (content: any) => {
  const items = content.items || [];
  return `
  <section data-section="faq" class="py-24 px-6 overflow-hidden">
    <div class="max-w-4xl mx-auto space-y-16">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div class="md:col-span-4 italic text-7xl font-black leading-[0.8] tracking-tighter opacity-10 uppercase">QUEST<br/>IONS</div>
        <div class="md:col-span-8 space-y-1">
          ${items.map((item: any) => `
            <div class="py-10 border-t border-white/5 group cursor-pointer">
              <div class="flex justify-between items-center group-hover:translate-x-2 transition-transform">
                <h4 class="text-2xl font-black uppercase group-hover:text-[var(--primary)] transition-colors">${item.question}</h4>
                <span class="text-[var(--primary)] text-2xl group-hover:rotate-90 transition-transform">+</span>
              </div>
              <p class="mt-6 text-xl opacity-40 font-medium leading-relaxed max-w-2xl">${item.answer}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>
  `;
};

// --- LOGOS / TRUST ---
export const LOGOS_STRIP_CLEAN = (content: any) => {
  const items = content.logos || content.items || [];
  return `
  <section data-section="logos" class="py-12 border-y border-white/5 overflow-hidden">
    <div class="flex gap-20 animate-marquee items-center justify-center opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
      ${[...items, ...items].map((logo: any) => `
        <div class="shrink-0 flex items-center gap-4">
           <img src="${logo.url || logo}" class="h-8 md:h-12 w-auto object-contain" />
           ${logo.name ? `<span class="font-black uppercase text-xs tracking-widest">${logo.name}</span>` : ''}
        </div>
      `).join('')}
    </div>
  </section>
  <style>
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee { animation: marquee 30s linear infinite; }
  </style>
  `;
};

// --- PROCESS ---
export const PROCESS_STEPS_VERTICAL = (content: any) => {
  const items = content.items || [];
  return `
  <section data-section="process" class="py-24 px-6">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
      <div class="sticky top-24 self-start space-y-8">
        <h2 class="text-xs font-black uppercase tracking-[0.5em] text-[var(--primary)]">The Protocol</h2>
        <h3 class="text-6xl font-black uppercase italic leading-none tracking-tighter">${content.title || 'Engineering Pipeline'}</h3>
        <p class="text-xl opacity-40 leading-relaxed font-medium">${content.description || 'A deterministic flow from architecture to deployment.'}</p>
      </div>
      <div class="space-y-24">
        ${items.map((step: any, i: number) => `
          <div class="relative pl-24 group">
            <span class="absolute left-0 top-0 text-[10vw] font-black leading-none opacity-5 group-hover:opacity-10 transition-opacity">0${i + 1}</span>
            <div class="space-y-4">
              <h4 class="text-4xl font-black uppercase group-hover:text-[var(--primary)] transition-colors">${step.title}</h4>
              <p class="text-xl opacity-50 leading-relaxed font-medium">${step.description}</p>
            </div>
            <div class="absolute left-12 top-0 bottom-0 w-px bg-white/5 rounded-full overflow-hidden">
               <div class="h-1/3 bg-[var(--primary)] group-hover:h-full transition-all duration-1000"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

// --- GALLERY ---
export const GALLERY_MASONRY_GLASS = (content: any) => {
  const images = content.images || [];
  return `
  <section data-section="gallery" class="py-24 px-6 bg-[var(--surface)]/10">
    <div class="max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
      ${images.map((img: any) => `
        <div class="relative group rounded-[2rem] overflow-hidden break-inside-avoid border border-white/5 shadow-2xl">
          <img src="${img.url || img}" class="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-8">
            ${img.caption ? `<p class="text-white font-black uppercase text-xs tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform">${img.caption}</p>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  `;
};

// --- TEAM ---
export const TEAM_GRID_EDITORIAL = (content: any) => {
  const members = content.members || [];
  return `
  <section data-section="team" class="py-24 px-6">
    <div class="max-w-7xl mx-auto space-y-20">
      <div class="flex items-center gap-8">
        <h2 class="text-7xl font-black uppercase italic tracking-tighter leading-none">${content.title || 'The collective'}</h2>
        <div class="h-px flex-1 bg-white/10"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${members.map((m: any) => `
          <div class="group relative aspect-[3/4] bg-[var(--surface)] rounded-[3rem] overflow-hidden">
             <img src="${m.image}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
             <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-all">
                <h4 class="text-2xl font-black text-white uppercase">${m.name}</h4>
                <p class="text-sm text-[var(--primary)] font-bold uppercase tracking-widest">${m.role}</p>
             </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

export const HighEndRegistry: any = {
  SERVICES_GLOW_GRID,
  PRICING_MODERN_TIERS,
  FAQ_ACCORDION_NEON,
  LOGOS_STRIP_CLEAN,
  PROCESS_STEPS_VERTICAL,
  GALLERY_MASONRY_GLASS,
  TEAM_GRID_EDITORIAL
};

