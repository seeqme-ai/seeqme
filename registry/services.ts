/**
 * SERVICES REGISTRY
 * Modern, beautifully designed service showcases.
 */

export const SERVICES_CARDS_INTERACTIVE = (content: any) => {
   const items = content.items || [];
   return `
   <section id="services" data-section="services" class="py-24 px-6 bg-[var(--surface)]/20">
     <div class="max-w-7xl mx-auto space-y-16">
        <div class="text-center max-w-2xl mx-auto space-y-4">
           <h2 class="text-xs font-black uppercase tracking-[0.4em] text-[var(--primary)]">Capabilities</h2>
           <h3 class="text-5xl font-black uppercase tracking-tighter">${content.title || 'Solution Engineering'}</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           ${items.map((s: any) => `
              <div class="p-12 bg-[var(--bg)] border border-white/5 rounded-[4rem] group hover:border-[var(--primary)] transition-all cursor-pointer shadow-xl">
                 <div class="w-16 h-16 bg-[var(--primary)]/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <span class="text-2xl">${s.icon || '🛠️'}</span>
                 </div>
                 <h4 class="text-2xl font-black uppercase mb-4">${s.title}</h4>
                 <p class="text-lg opacity-50 leading-relaxed">${s.description}</p>
                 <div class="pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-xs font-black uppercase tracking-widest text-[var(--primary)]">Learn More ↗</span>
                 </div>
              </div>
           `).join('')}
        </div>
     </div>
   </section>
   `;
};

export const SERVICES_GLASS_BENTO = (content: any) => {
   const items = content.items || [];
   return `
   <section id="services" data-section="services" class="py-24 px-6">
     <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="md:col-span-2 p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] flex flex-col justify-between">
           <h3 class="text-6xl font-black uppercase italic leading-none text-white/20">CRAFT</h3>
           <div class="space-y-4">
              <h4 class="text-4xl font-black uppercase">${items[0]?.title || 'Strategy'}</h4>
              <p class="text-lg opacity-60">${items[0]?.description}</p>
           </div>
        </div>
        <div class="md:col-span-2 p-12 rounded-[3rem]" style="background:color-mix(in srgb,var(--primary) 85%,var(--bg));color:var(--bg);">
           <div class="flex justify-between items-start mb-12 font-black uppercase tracking-[0.3em] text-xs opacity-70">
              <span>Primary Service</span>
           </div>
           <h4 class="text-5xl font-black uppercase mb-6 leading-none">${items[1]?.title || 'Development'}</h4>
           <p class="text-xl font-medium opacity-80 leading-relaxed">${items[1]?.description}</p>
        </div>
        ${items.slice(2).map((s: any) => `
           <div class="md:col-span-1 p-10 bg-[var(--surface)] border border-white/5 rounded-[3rem] space-y-4">
              <span class="text-2xl">${s.icon || '⚡'}</span>
              <h4 class="text-xl font-black uppercase">${s.title}</h4>
              <p class="text-sm opacity-50 leading-relaxed">${s.description}</p>
           </div>
        `).join('')}
     </div>
   </section>
   `;
};

export const SERVICES_LIST_MINIMAL = (content: any) => {
   const items = content.items || [];
   return `
   <section id="services" data-section="services" class="py-32 px-6 border-y border-white/5">
     <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
           <h3 class="text-8xl font-black uppercase italic tracking-tighter opacity-10 leading-none mb-4">FLOW</h3>
           <h4 class="text-4xl font-black uppercase">${content.title || 'Our Process'}</h4>
           <p class="mt-8 text-xl opacity-60 leading-relaxed">${content.description || 'A systematic approach to solving complex architectural challenges.'}</p>
        </div>
        <div class="space-y-1">
           ${items.map((s: any, i: number) => `
              <div class="py-8 border-t border-white/5 flex justify-between items-center group cursor-pointer hover:px-4 transition-all">
                 <div class="flex items-center gap-8">
                    <span class="text-xs font-black text-white/20">0${i + 1}</span>
                    <h5 class="text-3xl font-black uppercase group-hover:text-[var(--primary)] transition-colors">${s.title}</h5>
                 </div>
                 <span class="text-2xl transform group-hover:rotate-45 transition-transform">→</span>
              </div>
           `).join('')}
        </div>
     </div>
   </section>
   `;
};


export const SERVICES_DARK_SASS = (content: any) => {
    const items = Array.isArray(content.items) ? content.items : (content.services || []);
    return `
<section id="services" data-section="services" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold text-[var(--heading)] mb-4" data-field="services-title">${content.title || 'Services'}</h2>
      <p class="text-[var(--text)] opacity-60">${content.description || content.label || ''}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      ${items.map((s: any) => `
      <div class="group border border-[var(--text)]/10 hover:border-[var(--primary)] rounded-2xl p-8 transition-all hover:-translate-y-1" style="background:var(--surface);">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-6 transition-colors group-hover:scale-110" style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);">
          ${s.icon || '⚡'}
        </div>
        <h3 class="text-xl font-bold text-[var(--heading)] mb-4">${s.title}</h3>
        <p class="text-[var(--text)] opacity-60 text-sm mb-6 leading-relaxed">${s.description || s.desc || ''}</p>
        ${s.price ? `<div class="text-xs font-mono" style="color:var(--primary);">${s.price}</div>` : ''}
      </div>`).join('')}
    </div>
  </div>
</section>`;
};

export const SERVICES_AGENCY_GRID = (content: any) => {
    const items = Array.isArray(content.items) ? content.items : (content.services || []);
    return `
<section id="services" data-section="services" class="py-24 md:py-32 px-6 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-20">
      <h2 class="text-4xl md:text-5xl font-black mb-6 text-[var(--heading)]" data-field="services-title">${content.title || 'How I Can Help'}</h2>
      <p class="text-xl text-[var(--text)] opacity-60 max-w-2xl mx-auto">${content.description || content.desc || 'Flexible engagement models designed for growth-stage businesses.'}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      ${items.map((service: any) => `
      <div class="group p-10 rounded-3xl border border-[var(--text)]/10 hover:border-[var(--primary)] transition-colors relative" style="background:var(--surface);">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 border border-[var(--text)]/10 group-hover:scale-110 transition-all" style="background:var(--bg);color:var(--primary);">
          ${service.icon ? `<i class="${service.icon}"></i>` : (service.emoji || '⚡')}
        </div>
        <h3 class="text-2xl font-bold mb-4 text-[var(--heading)]">${service.title}</h3>
        <p class="text-[var(--text)] opacity-60 mb-8 leading-relaxed">${service.description || service.desc || ''}</p>
        ${(service.features || []).length > 0 ? `
        <ul class="space-y-3 mb-8 text-sm font-medium text-[var(--text)] opacity-70">
          ${(service.features || []).map((feature: string) => `
          <li class="flex items-center gap-3"><i class="fas fa-check" style="color:var(--primary);"></i> <span>${feature}</span></li>`).join('')}
        </ul>` : ''}
        <a href="#contact" class="block w-full py-4 text-center font-bold rounded-xl transition-colors border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]" style="--tw-text-opacity:1;" onmouseover="this.style.color='var(--bg)'" onmouseout="this.style.color='var(--primary)'">Inquire Now</a>
      </div>`).join('')}
    </div>
  </div>
</section>`;
};

export const SERVICES_MINIMAL_LIST = (content: any) => {
    const items = Array.isArray(content.items) ? content.items : (content.services || []);
    return `
<section id="services" data-section="services" class="py-24 px-6 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-serif italic mb-4 text-[var(--heading)]" data-field="services-title">${content.title || 'My Services'}</h2>
      <p class="text-[var(--text)] opacity-60">${content.description || content.desc || 'Specialized support for high-performing individuals.'}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${items.map((s: any) => `
      <div class="p-8 rounded-xl border border-[var(--text)]/10 hover:border-[var(--primary)]/30 transition-colors" style="background:var(--surface);">
        <h3 class="text-xl font-bold mb-4 font-serif text-[var(--heading)]">${s.title}</h3>
        <p class="text-[var(--text)] opacity-60 text-sm mb-6 leading-relaxed">${s.description || s.desc || ''}</p>
        ${(s.bullets || s.features || []).length > 0 ? `
        <ul class="space-y-2 text-sm text-[var(--text)] opacity-70">
          ${(s.bullets || s.features || []).map((b: string) => `
          <li class="flex items-center gap-2"><span style="color:var(--primary);">•</span> ${b}</li>`).join('')}
        </ul>` : ''}
      </div>`).join('')}
    </div>
  </div>
</section>`;
};

export const SERVICES_GLOW_GRID = (content: any) => {
   const items = content.items || content.services || [];
   return `
  <section id="services" data-section="services" class="py-24 px-6 overflow-hidden">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
        <div class="max-w-xl">
          <span class="text-xs font-black uppercase tracking-[0.5em] text-[var(--primary)] opacity-60">Solutions</span>
          <h2 class="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mt-4">${content.title || 'Elite Services'}</h2>
        </div>
        <p class="max-w-xs text-lg opacity-40 font-medium leading-relaxed">${content.description || content.desc || 'Systematic approaches to contemporary challenges.'}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-[3rem] overflow-hidden">
        ${items.map((s: any) => `
          <div class="p-12 bg-[var(--bg)] group hover:bg-[var(--primary)] transition-all duration-700">
            <div class="w-14 h-14 bg-[var(--surface)] p-3 rounded-2xl mb-8 border border-white/5 shadow-2xl group-hover:bg-white group-hover:scale-110 transition-all">
              <span class="text-2xl">${s.icon || '⚡'}</span>
            </div>
            <h3 class="text-2xl font-black uppercase mb-4 group-hover:text-[var(--bg)] transition-colors">${s.title}</h3>
            <p class="text-lg opacity-50 font-medium leading-relaxed group-hover:text-[var(--bg)] group-hover:opacity-70 transition-all">${s.description || s.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

export const ServicesRegistry: any = {
   SERVICES_CARDS_INTERACTIVE,
   SERVICES_GLASS_BENTO,
   SERVICES_LIST_MINIMAL,
   SERVICES_DARK_SASS,
   SERVICES_AGENCY_GRID,
   SERVICES_MINIMAL_LIST,
   SERVICES_GLOW_GRID
};
