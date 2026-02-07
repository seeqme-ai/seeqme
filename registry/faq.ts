/**
 * FAQ REGISTRY
 * Modern, beautifully designed FAQ sections.
 */

export const FAQ_ACCORDION_NEON = (content: any) => `
    <section data-section="faq" class="py-24 px-6 bg-[var(--bg)]">
        <div class="max-w-4xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-xs font-black uppercase tracking-[0.5em] text-[var(--primary)] mb-4">${content.label || 'Common Queries'}</h2>
                <h3 class="text-5xl font-black uppercase tracking-tighter">${content.title || 'FAQ'}</h3>
            </div>
            <div class="space-y-4">
                ${(content.items || []).map((faq: any, i: number) => `
                <div class="group border border-white/5 bg-[var(--surface)] hover:border-[var(--primary)]/30 rounded-2xl overflow-hidden transition-all duration-500">
                    <button class="w-full p-8 text-left flex justify-between items-center transition-colors">
                        <span class="text-xl font-bold uppercase tracking-tight">${faq.question}</span>
                        <span class="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-[var(--bg)] transition-all">&plus;</span>
                    </button>
                    <div class="px-8 pb-8 opacity-60 leading-relaxed font-medium">
                        ${faq.answer}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
`;

export const FAQRegistry: any = {
    FAQ_ACCORDION_NEON
};
