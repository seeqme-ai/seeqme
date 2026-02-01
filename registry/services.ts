/**
 * SERVICES REGISTRY
 * Modern, beautifully designed service showcases.
 */

export const SERVICES_CARDS_INTERACTIVE = (content: any) => {
   const items = content.items || [];
   return `
   <section data-section="services" class="py-24 px-6 bg-[var(--surface)]/20">
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
   <section data-section="services" class="py-24 px-6">
     <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="md:col-span-2 p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] flex flex-col justify-between">
           <h3 class="text-6xl font-black uppercase italic leading-none text-white/20">CRAFT</h3>
           <div class="space-y-4">
              <h4 class="text-4xl font-black uppercase">${items[0]?.title || 'Strategy'}</h4>
              <p class="text-lg opacity-60">${items[0]?.description}</p>
           </div>
        </div>
        <div class="md:col-span-2 p-12 bg-teal-500 rounded-[3rem] text-black">
           <div class="flex justify-between items-start mb-12 font-black uppercase tracking-[0.3em] text-xs">
              <span>Primary Service</span>
              <span>Available</span>
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
   <section data-section="services" class="py-32 px-6 border-y border-white/5">
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
                    <span class="text-xs font-black text-white/20">0${i+1}</span>
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

export const ServicesRegistry: any = {
   SERVICES_CARDS_INTERACTIVE,
   SERVICES_GLASS_BENTO,
   SERVICES_LIST_MINIMAL
};
