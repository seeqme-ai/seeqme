export const PRICING_MINIMAL_CARDS = (content: any) => `
    <section id="pricing" data-section="pricing" class="py-24 px-6 bg-white border-t border-stone-100">
        <div class="max-w-5xl mx-auto">
             <h2 class="text-3xl font-serif text-center mb-16 italic" data-field="price-title">${content.title || 'Simple Pricing'}</h2>
             <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                 ${(content.plans || []).map((p: any) => `
                <div class="border border-stone-200 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow ${p.featured ? 'bg-stone-50 ring-2 ring-stone-900' : ''} relative">
                    ${p.featured ? '<div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900 text-white px-3 py-1 text-xs uppercase tracking-widest font-bold rounded-full">Best Value</div>' : ''}
                    <h3 class="font-bold text-lg mb-2">${p.name}</h3>
                    <div class="text-3xl font-serif mb-6">${p.price}<span class="text-sm font-sans text-stone-500">/mo</span></div>
                    <div class="text-sm text-stone-500 mb-8">${p.hours || ''}</div>
                    <a href="#contact" class="block w-full py-3 border border-stone-900 rounded-lg font-bold hover:bg-stone-900 hover:text-white transition-colors">Select</a>
                </div>
                 `).join('')}
             </div>
        </div>
    </section>
`;

export const PRICING_MODERN_TIERS = (content: any) => {
  const items = content.items || content.plans || [];
  return `
  <section id="pricing" data-section="pricing" class="py-24 px-6 bg-[var(--surface)]/30 border-y border-white/5">
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
            <a href="${plan.link || '#contact'}" class="mt-12 w-full py-5 bg-[var(--surface)] text-center rounded-2xl font-black uppercase text-xs tracking-widest group-hover:bg-[var(--primary)] group-hover:text-[var(--bg)] transition-all">Begin Engagement</a>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

export const PricingRegistry: any = {
  PRICING_MINIMAL_CARDS,
  PRICING_MODERN_TIERS
};
