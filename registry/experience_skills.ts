export const EXP_TIMELINE_VERTICAL = (content: any) => {
  const items = content.items || [];
  return `
  <section id="experience" data-section="experience" class="py-24 px-6">
    <div class="max-w-4xl mx-auto">
      <div class="mb-20 text-center">
        <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tighter" data-field="experience-title">${content.title || 'Career path'}</h2>
        <p class="text-[var(--primary)] font-bold uppercase tracking-widest mt-2" data-field="experience-subtitle">Professional Timeline</p>
      </div>
      <div class="space-y-12 relative before:absolute before:inset-y-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-[var(--text)]/10">
        ${items.map((item: any, i: number) => `
          <div class="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div class="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--primary)] border-4 border-[var(--bg)] z-10"></div>
            <div class="w-full md:w-1/2 pl-12 md:pl-0 md:pr-12 text-left md:text-right ${i % 2 === 0 ? 'md:order-1' : 'md:order-3'}">
               <span class="text-xs font-black text-[var(--primary)] uppercase tracking-widest mb-2 block">${item.period || item.duration}</span>
               <h3 class="text-2xl font-black uppercase leading-none mb-1">${item.role || item.title}</h3>
               <p class="text-lg font-bold opacity-60">${item.company}</p>
            </div>
            <div class="hidden md:block w-4 md:order-2"></div>
            <div class="w-full md:w-1/2 pl-12 md:pl-12 text-left ${i % 2 === 0 ? 'md:order-3' : 'md:order-1'}">
               <p class="text-sm opacity-50 leading-relaxed max-w-sm ${i % 2 === 0 ? '' : 'md:ml-auto md:text-right'}">${item.description || ''}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

export const EXP_ACCORDION_MINIMAL = (content: any) => {
  const items = content.items || [];
  return `
  <section id="experience" data-section="experience" class="py-24 px-6 border-y border-[var(--text)]/5 bg-[var(--surface)]/30">
    <div class="max-w-5xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
         <h2 class="text-5xl font-black uppercase italic tracking-tighter" data-field="experience-title">${content.title || 'Experience'}</h2>
         <p class="text-sm font-bold opacity-40 uppercase tracking-widest">Global Deployments</p>
      </div>
      <div class="divide-y divide-[var(--text)]/10">
        ${items.map((item: any) => `
          <details class="group py-8 cursor-pointer">
            <summary class="flex flex-col md:flex-row justify-between items-start md:items-center list-none">
               <div class="space-y-1">
                  <h3 class="text-3xl font-black group-open:text-[var(--primary)] transition-colors">${item.role || item.title}</h3>
                  <p class="text-lg font-bold opacity-60 uppercase tracking-wider">${item.company}</p>
               </div>
               <div class="flex items-center gap-6 mt-4 md:mt-0">
                  <span class="text-xs font-black uppercase tracking-widest opacity-40">${item.period || item.duration}</span>
                  <span class="text-2xl font-light transform group-open:rotate-45 transition-transform">+</span>
               </div>
            </summary>
            <div class="mt-8 pt-8 border-t border-[var(--text)]/5 text-lg opacity-60 leading-relaxed max-w-3xl">
               ${item.description}
               ${item.points ? `<ul class="mt-4 space-y-2">
                  ${item.points.map((p: string) => `<li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></div> ${p}</li>`).join('')}
               </ul>` : ''}
            </div>
          </details>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

export const SKILLS_MARQUEE = (content: any) => {
  const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
  return `
  <section id="skills" data-section="skills" class="py-20 bg-[var(--text)] text-[var(--bg)] overflow-hidden">
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
  <section id="skills" data-section="skills" class="py-32 px-6">
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
  <section id="skills" data-section="skills" class="py-24 px-6 bg-[var(--surface)]/20">
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
  <section id="skills" data-section="skills" class="py-24 px-6">
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
  <section id="skills" data-section="skills" class="py-24 px-6 overflow-hidden">
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
  <section id="skills" data-section="skills" class="py-24 px-6">
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

export const EXP_CARDS_GRID = (content: any) => {
  const items = content.items || [];
  return `
  <section id="experience" data-section="experience" class="py-24 px-6">
    <div class="max-w-7xl mx-auto space-y-16">
      <div class="flex justify-between items-end">
         <h2 class="text-5xl font-black uppercase tracking-tighter leading-none">${content.title || 'Career Path'}</h2>
         <p class="text-xs font-black uppercase tracking-[0.3em] opacity-40">Role Archive</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${items.map((item: any) => `
          <div class="p-10 bg-[var(--surface)] border border-[var(--text)]/5 rounded-[3rem] space-y-8 group hover:border-[var(--primary)]/20 transition-all shadow-xl">
             <div class="flex justify-between items-start">
                <div class="w-12 h-12 bg-[var(--primary)] rounded-2xl flex items-center justify-center font-black text-[var(--bg)] text-xl">
                   ${item.company ? item.company[0] : 'J'}
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest py-1 px-3 bg-white/5 rounded-full opacity-40">${item.period || item.duration}</span>
             </div>
             <div class="space-y-2">
                <h3 class="text-2xl font-black uppercase leading-tight group-hover:text-[var(--primary)] transition-colors">${item.role || item.title}</h3>
                <p class="font-bold opacity-60 uppercase tracking-widest text-xs">${item.company}</p>
             </div>
             <p class="text-sm opacity-50 leading-relaxed">${item.description || ''}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

export const EXP_HORIZONTAL_SCROLL = (content: any) => {
  const items = content.items || [];
  return `
  <section id="experience" data-section="experience" class="py-32 px-6 bg-black overflow-hidden relative">
    <div class="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2"></div>
    <div class="max-w-7xl mx-auto mb-20 relative z-10">
       <h2 class="text-4xl font-black uppercase text-white tracking-widest">Global Trajectory</h2>
    </div>
    <div class="flex gap-12 overflow-x-auto pb-12 px-6 no-scrollbar relative z-10">
      ${items.map((item: any) => `
        <div class="min-w-[400px] p-12 bg-zinc-900 border border-white/5 rounded-[4rem] flex flex-col justify-between h-[500px] shrink-0 group hover:border-zinc-700 transition-all">
           <div class="space-y-4">
              <span class="text-6xl font-black text-white/5 group-hover:text-[var(--primary)]/10 transition-colors">${(item.period || item.duration)?.split('-')[0] || '2024'}</span>
              <h3 class="text-3xl font-black text-white uppercase">${item.role || item.title}</h3>
              <p class="text-xl font-bold text-white/40 uppercase tracking-widest">${item.company}</p>
           </div>
           <p class="text-lg text-white/60 leading-relaxed">${item.description || ''}</p>
        </div>
      `).join('')}
    </div>
  </section>
  `;
};

export const EXP_TABS_SWITCH = (content: any) => {
  const items = content.items || [];
  return `
  <section id="experience" data-section="experience" class="py-24 px-6 border-y border-[var(--text)]/5">
    <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
      <div class="md:col-span-4 flex md:flex-col gap-4 overflow-x-auto no-scrollbar pb-4 md:pb-0">
        ${items.map((item: any, i: number) => `
          <button class="px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-left transition-all border-l-4 ${i === 0 ? 'bg-[var(--primary)] text-[var(--bg)] border-white/20' : 'bg-[var(--surface)] text-[var(--text)] opacity-40 border-transparent hover:opacity-100'}">
             ${item.company}
          </button>
        `).join('')}
      </div>
      <div class="md:col-span-8 space-y-8">
         ${items[0] ? `
            <div class="space-y-6">
               <div class="flex justify-between items-baseline">
                  <h3 class="text-4xl font-black uppercase">${items[0].role || items[0].title}</h3>
                  <span class="text-sm font-bold opacity-40">${items[0].period || items[0].duration}</span>
               </div>
               <p class="text-2xl font-medium text-[var(--primary)]">${items[0].company}</p>
               <div class="h-px w-full bg-[var(--text)]/10"></div>
               <p class="text-xl opacity-60 leading-relaxed">${items[0].description}</p>
               <ul class="space-y-4">
                  ${(items[0].points || []).map((p: string) => `
                     <li class="flex items-start gap-4">
                        <span class="text-[var(--primary)] mt-1">▹</span>
                        <span class="text-lg opacity-80">${p}</span>
                     </li>
                  `).join('')}
               </ul>
            </div>
         ` : ''}
      </div>
    </div>
  </section>
  `;
};

export const EXP_SIDEBAR_LIST = (content: any) => {
  const items = content.items || [];
  return `
  <section id="experience" data-section="experience" class="py-24 px-6">
    <div class="max-w-7xl mx-auto space-y-20">
      <h2 class="text-6xl md:text-9xl font-black uppercase italic tracking-tighter opacity-10">LEGACY</h2>
      <div class="space-y-1">
        ${items.map((item: any) => `
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-t border-[var(--text)]/10 group hover:bg-[var(--primary)]/5 transition-colors px-6">
             <div class="text-xs font-black uppercase tracking-widest opacity-40">${item.period}</div>
             <div class="md:col-span-2 space-y-4">
                <h3 class="text-4xl font-black uppercase group-hover:translate-x-4 transition-transform">${item.role}</h3>
                <p class="text-lg font-bold opacity-60 uppercase italic">${item.company}</p>
             </div>
             <div class="flex items-end justify-end">
                <p class="text-sm opacity-50 text-right max-w-[200px]">${item.description}</p>
             </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

export const ExperienceRegistry: any = {
  EXP_TIMELINE_VERTICAL,
  EXP_ACCORDION_MINIMAL,
  EXP_CARDS_GRID,
  EXP_HORIZONTAL_SCROLL,
  EXP_TABS_SWITCH,
  EXP_SIDEBAR_LIST
};

export const SkillsRegistry: any = {
  SKILLS_MARQUEE,
  SKILLS_GRID_ICONS,
  SKILLS_PROGRESS_BARS,
  SKILLS_TAGS_CLOUD,
  SKILLS_HEXAGON_GRID,
  SKILLS_RADAR_CHART
};
