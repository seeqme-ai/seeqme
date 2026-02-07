export const LOGOS_MINIMAL_TRUST = (content: any) => `
    <section data-section="logos" class="py-12 border-y border-stone-200 bg-white">
        <p class="text-center text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">${content.title || 'As seen in / Tools'}</p>
        <div class="flex flex-wrap justify-center gap-12 text-stone-400 grayscale opacity-70">
             ${(content.partners || []).map((p: any) => `
             <span class="text-xl font-bold flex items-center gap-2"><i class="${p.icon}"></i> ${p.name}</span>
             `).join('')}
        </div>
    </section>
`;

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

export const LogoRegistry: any = {
    LOGOS_MINIMAL_TRUST,
    LOGOS_STRIP_CLEAN
};
