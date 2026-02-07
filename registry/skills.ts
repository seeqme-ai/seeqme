export const SKILLS_MARQUEE = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
  <section data-section="skills" class="py-20 bg-[var(--text)] text-[var(--bg)] overflow-hidden">
    <div class="flex whitespace-nowrap animate-marquee">
      ${[...items, ...items].map((item: string) => `
        <span class="text-6xl md:text-8xl font-black uppercase tracking-tighter mx-12 flex items-center gap-8">
           ${item} <div class="w-4 h-4 rotate-45 bg-[var(--primary)]"></div>
        </span>
      `).join('')}
    </div>
  </section>
  <style>
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      animation: marquee 20s linear infinite;
    }
  </style>
  `;
};

export const SKILLS_GRID_ICONS = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
  <section data-section="skills" class="py-32 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
         <div class="space-y-8">
            <h2 class="text-6xl font-black uppercase leading-[0.9]" data-field="skills-title">${content.title || 'Technical<br/>Arsenal'}</h2>
            <p class="text-xl opacity-60 leading-relaxed" data-field="skills-description">
               A comprehensive toolkit optimized for modern digital challenges.
            </p>
            <div class="flex gap-4">
               <div class="px-6 py-3 bg-[var(--surface)] border border-[var(--text)]/10 rounded-2xl text-xs font-black uppercase">Tools</div>
               <div class="px-6 py-3 bg-[var(--surface)] border border-[var(--text)]/10 rounded-2xl text-xs font-black uppercase">Expertise</div>
            </div>
         </div>
         <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
            ${items.map((skill: any) => `
               <div class="p-8 bg-[var(--surface)] border border-[var(--text)]/5 rounded-[2rem] text-center group hover:border-[var(--primary)] transition-all">
                  <div class="w-12 h-12 mx-auto mb-4 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all flex items-center justify-center">
                     <span class="text-3xl font-black text-[var(--primary)]">λ</span>
                  </div>
                  <p class="font-bold text-sm uppercase tracking-widest">${typeof skill === 'string' ? skill : (skill.name || skill.value || 'New Skill')}</p>
               </div>
            `).join('')}
         </div>
      </div>
    </div>
  </section>
  `;
};

export const SKILLS_PROGRESS_BARS = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
  <section data-section="skills" class="py-24 px-6 bg-[var(--surface)]/20">
    <div class="max-w-4xl mx-auto space-y-12">
      <div class="text-center">
         <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tighter" data-field="skills-title">${content.title || 'Technical Proficiency'}</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8">
        ${items.map((skill: any) => {
        const name = typeof skill === 'string' ? skill : (skill.name || skill.value);
        const level = skill.level || 85;
        return `
          <div class="space-y-2">
            <div class="flex justify-between text-xs font-black uppercase tracking-widest">
               <span>${name}</span>
               <span class="opacity-40">${level}%</span>
            </div>
            <div class="h-2 bg-[var(--text)]/10 rounded-full overflow-hidden">
               <div class="h-full bg-[var(--primary)] rounded-full slide-up" style="width: ${level}%"></div>
            </div>
          </div>
          `;
    }).join('')}
      </div>
    </div>
  </section>
  `;
};

export const SKILLS_TAGS_CLOUD = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
  <section data-section="skills" class="py-24 px-6">
    <div class="max-w-5xl mx-auto text-center space-y-12">
      <h2 class="text-sm font-black uppercase tracking-[0.4em] opacity-40">${content.title || 'Expertise Cloud'}</h2>
      <div class="flex flex-wrap justify-center gap-4">
        ${items.map((skill: any, i: number) => `
          <span class="px-8 py-4 bg-[var(--surface)] border border-[var(--text)]/5 rounded-2xl font-bold uppercase tracking-widest hover:bg-[var(--primary)] hover:text-[var(--bg)] transition-all cursor-default scale-${(i % 3) === 0 ? '110' : '100'}">
            ${typeof skill === 'string' ? skill : (skill.name || skill.value)}
          </span>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

export const SKILLS_HEXAGON_GRID = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
  <section data-section="skills" class="py-24 px-6 overflow-hidden">
    <div class="max-w-7xl mx-auto flex flex-col items-center">
      <h2 class="text-6xl font-black uppercase mb-20 text-center" data-field="skills-title">${content.title || 'Power Grid'}</h2>
      <div class="flex flex-wrap justify-center gap-8 max-w-4xl">
        ${items.slice(0, 12).map((skill: any) => `
          <div class="w-32 h-36 bg-[var(--surface)] relative flex items-center justify-center group hover:scale-110 transition-transform cursor-pointer" style="clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);">
             <div class="absolute inset-1 bg-[var(--bg)] group-hover:bg-[var(--primary)] transition-colors" style="clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);"></div>
             <p class="relative z-10 font-black text-[10px] uppercase tracking-tighter text-center px-4 group-hover:text-[var(--bg)] transition-colors">${typeof skill === 'string' ? skill : (skill.name || skill.value)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

export const SKILLS_RADAR_CHART = (content: any) => `
  <section data-section="skills" class="py-24 px-6">
    <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
      <div class="space-y-6">
         <h2 class="text-5xl font-black uppercase tracking-tighter">${content.title || 'Skill Balance'}</h2>
         <p class="text-xl opacity-60 leading-relaxed">${content.description || 'A multi-dimensional view of my core competencies and specialized knowledge.'}</p>
      </div>
      <div class="relative aspect-square bg-[var(--surface)] rounded-full border border-[var(--text)]/10 p-12 overflow-hidden shadow-2xl">
         <div class="absolute inset-0 opacity-10" style="background: repeating-radial-gradient(circle, var(--text) 0, var(--text) 1px, transparent 1px, transparent 40px);"></div>
         <svg viewBox="0 0 100 100" class="w-full h-full relative z-10 drop-shadow-2xl">
            <polygon points="50,10 90,40 75,90 25,90 10,40" fill="var(--primary)" fill-opacity="0.3" stroke="var(--primary)" stroke-width="0.5" />
            <circle cx="50" cy="50" r="1" fill="var(--primary)" />
         </svg>
         <div class="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase">Logic</div>
         <div class="absolute top-1/3 right-4 text-[10px] font-black uppercase">Design</div>
         <div class="absolute bottom-4 right-1/4 text-[10px] font-black uppercase">Strategy</div>
         <div class="absolute bottom-4 left-1/4 text-[10px] font-black uppercase">Growth</div>
         <div class="absolute top-1/3 left-4 text-[10px] font-black uppercase">Code</div>
      </div>
    </div>
  </section>
`;


export const SKILLS_DARK_SASS = (content: any) => `
    <section class="py-20 px-6 bg-[#0f172a]">
        <div class="max-w-6xl mx-auto">
            <h2 class="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">${content.title}</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${(content.tools || []).map((tool: any) => `
                <div class="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4 hover:border-violet-500 hover:bg-slate-800 transition-all cursor-default">
                    <div class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                        ${tool.icon}
                    </div>
                    <div class="font-bold text-white">${tool.name}</div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
`;

export const SKILLS_AGENCY = (content: any) => `
    <section data-section="skills" class="py-20 px-6 text-center">
        <p class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8" data-field="skills-title">${content.title || 'My Tech Stack'}</p>
        <div class="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale">
            ${(content.skills || []).map((skill: any) => `
            <div class="flex flex-col items-center gap-2">
                 ${skill.icon ? `<i class="${skill.icon} text-4xl"></i>` : ''}
                 <span class="text-xl font-black font-sans">${skill.name}</span>
            </div>
            `).join('')}
        </div>
    </section>
`;

export const SkillsRegistry: any = {
    SKILLS_MARQUEE,
    SKILLS_GRID_ICONS,
    SKILLS_PROGRESS_BARS,
    SKILLS_TAGS_CLOUD,
    SKILLS_HEXAGON_GRID,
    SKILLS_RADAR_CHART,
    SKILLS_DARK_SASS,
    SKILLS_AGENCY
};
