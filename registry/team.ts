/**
 * TEAM REGISTRY
 * Professional team and member showcases.
 */

export const TEAM_GRID_EDITORIAL = (content: any) => `
    <section data-section="team" class="py-24 px-6">
        <div class="max-w-7xl mx-auto space-y-20">
            <div class="flex flex-col md:flex-row justify-between items-end gap-8">
                <div class="max-w-xl">
                    <h2 class="text-xs font-black uppercase tracking-[0.5em] text-[var(--primary)] opacity-60">Human Capital</h2>
                    <h3 class="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mt-4">${content.title || 'Leadership'}</h3>
                </div>
                <p class="max-w-xs text-lg opacity-40 font-medium leading-relaxed">${content.description || 'The strategic minds behind our most impactful initiatives.'}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 rounded-[3rem] overflow-hidden">
                ${(content.members || []).map((member: any) => `
                <div class="bg-[var(--bg)] p-12 space-y-8 group hover:bg-[var(--surface)] transition-all duration-700">
                    <div class="aspect-square rounded-[2rem] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                        <img src="${member.image}" class="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 class="text-2xl font-black uppercase leading-none">${member.name}</h4>
                        <p class="text-[10px] font-black uppercase tracking-widest opacity-40 mt-4">${member.role}</p>
                    </div>
                    <div class="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${(member.socials || []).map((s: any) => `
                        <a href="${s.link}" class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[var(--primary)] hover:text-[var(--bg)] transition-all"><i class="fab fa-${s.platform.toLowerCase()} text-xs"></i></a>
                        `).join('')}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
`;

export const TeamRegistry: any = {
    TEAM_GRID_EDITORIAL
};
