/**
 * PROCESS REGISTRY
 * Visualizing workflows and methodologies.
 */

export const PROCESS_STEPS_VERTICAL = (content: any) => `
    <section data-section="process" class="py-24 px-6">
        <div class="max-w-5xl mx-auto flex flex-col md:flex-row gap-20">
            <div class="md:w-1/3">
                <div class="sticky top-24 space-y-6">
                    <h2 class="text-xs font-black uppercase tracking-[0.5em] opacity-40">Methodology</h2>
                    <h3 class="text-6xl font-black uppercase tracking-tighter leading-none">${content.title || 'Process'}</h3>
                    <p class="text-lg opacity-40 font-medium leading-relaxed">${content.description || 'A systematic evolution from concept to production.'}</p>
                </div>
            </div>
            <div class="md:w-2/3 space-y-24">
                ${(content.steps || []).map((step: any, i: number) => `
                <div class="relative pl-16 group">
                    <div class="absolute left-0 top-0 text-8xl font-black tracking-tighter opacity-5 group-hover:opacity-10 transition-opacity">0${i + 1}</div>
                    <div class="space-y-4">
                        <h4 class="text-3xl font-black uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors">${step.title}</h4>
                        <p class="text-xl opacity-60 leading-relaxed font-medium">${step.description}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
`;

export const ProcessRegistry: any = {
    PROCESS_STEPS_VERTICAL
};
