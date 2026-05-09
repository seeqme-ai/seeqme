// ============================================================
// SEEQME SKILLS EXTENDED REGISTRY — 10 additional skills section styles
// ============================================================

const getSkillName = (skill: any): string =>
  typeof skill === 'string' ? skill : (skill.name || skill.label || skill.value || 'Skill');

const skillIconMap: Record<string, string> = {
  javascript: 'fab fa-js', typescript: 'fab fa-js', react: 'fab fa-react',
  vue: 'fab fa-vuejs', angular: 'fab fa-angular', node: 'fab fa-node-js',
  nodejs: 'fab fa-node-js', python: 'fab fa-python', java: 'fab fa-java',
  php: 'fab fa-php', html: 'fab fa-html5', css: 'fab fa-css3-alt',
  sass: 'fab fa-sass', docker: 'fab fa-docker', git: 'fab fa-git-alt',
  github: 'fab fa-github', aws: 'fab fa-aws', figma: 'fab fa-figma',
  linux: 'fab fa-linux', wordpress: 'fab fa-wordpress',
  swift: 'fab fa-swift', android: 'fab fa-android', apple: 'fab fa-apple',
  database: 'fas fa-database', sql: 'fas fa-database', mongodb: 'fas fa-leaf',
  graphql: 'fas fa-project-diagram', api: 'fas fa-plug', rest: 'fas fa-plug',
  design: 'fas fa-pen-nib', ux: 'fas fa-pencil-ruler', ui: 'fas fa-layer-group',
  cloud: 'fas fa-cloud', security: 'fas fa-shield-alt', testing: 'fas fa-vial',
  devops: 'fas fa-cogs', mobile: 'fas fa-mobile-alt', web: 'fas fa-globe',
  machine: 'fas fa-brain', ml: 'fas fa-brain', ai: 'fas fa-robot',
};

const getSkillFAIcon = (name: string): string => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(skillIconMap)) {
    if (lower.includes(key)) return icon;
  }
  return 'fas fa-code';
};

const flattenSkills = (content: any): string[] => {
  if (Array.isArray(content.categories)) {
    return content.categories.flatMap((c: any) =>
      Array.isArray(c.items) ? c.items.map(getSkillName) : []
    );
  }
  if (Array.isArray(content.items)) return content.items.map(getSkillName);
  return [];
};

export const SkillsExtendedRegistry: Record<string, (content: any) => string> = {

  // ─── 1. SKILLS_CATEGORY_TABS ─────────────────────────────────────────────
  SKILLS_CATEGORY_TABS: (content: any) => {
    const categories = Array.isArray(content.categories) ? content.categories : [];
    const uid = `skt-${Math.random().toString(36).slice(2, 7)}`;
    return `
<section data-section="skills" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-12 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Skills</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="skills-title">${content.title || 'Skills'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg">${content.subtitle}</p>` : ''}
    </div>
    <!-- Tab bar -->
    <div class="overflow-x-auto pb-1 mb-10" style="-webkit-overflow-scrolling:touch;">
      <div class="flex gap-2" style="width:max-content;">
        ${categories.map((cat: any, i: number) => `
        <button onclick="document.querySelectorAll('.${uid}-panel').forEach(p=>p.style.display='none');document.getElementById('${uid}-p${i}').style.display='grid';document.querySelectorAll('.${uid}-tab').forEach(t=>{t.style.background='transparent';t.style.color='var(--text)';t.style.opacity='0.5';});this.style.background='var(--primary)';this.style.color='var(--bg)';this.style.opacity='1';"
               class="${uid}-tab text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap"
               style="background:${i === 0 ? 'var(--primary)' : 'var(--surface)'};color:${i === 0 ? 'var(--bg)' : 'var(--text)'};opacity:${i === 0 ? '1' : '0.6'};">
          ${cat.name || `Category ${i + 1}`}
        </button>`).join('')}
      </div>
    </div>
    <!-- Panels -->
    ${categories.map((cat: any, i: number) => `
    <div id="${uid}-p${i}" class="${uid}-panel gap-4" style="display:${i === 0 ? 'grid' : 'none'};grid-template-columns:repeat(auto-fill,minmax(120px,1fr));">
      ${(Array.isArray(cat.items) ? cat.items : []).map((skill: any) => `
      <div class="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[var(--text)]/10 hover:border-[var(--primary)]/40 group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
           style="background:var(--surface);">
        <i class="${getSkillFAIcon(getSkillName(skill))} text-2xl group-hover:scale-110 transition-transform duration-300" style="color:var(--primary);"></i>
        <span class="text-xs font-bold text-center text-[var(--text)] opacity-80">${getSkillName(skill)}</span>
      </div>`).join('')}
    </div>`).join('')}
  </div>
</section>`;
  },

  // ─── 2. SKILLS_CARD_FLIP ─────────────────────────────────────────────────
  SKILLS_CARD_FLIP: (content: any) => {
    const categories = Array.isArray(content.categories) ? content.categories : [];
    return `
<section data-section="skills" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 text-center space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Skills</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="skills-title">${content.title || 'Skills'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg mx-auto">${content.subtitle}</p>` : ''}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${categories.map((cat: any) => {
        const skillList = Array.isArray(cat.items) ? cat.items : [];
        return `
      <div class="flip-card" style="perspective:1000px;height:220px;">
        <div class="flip-card-inner relative w-full h-full" style="transition:transform 0.6s;transform-style:preserve-3d;">
          <!-- Front -->
          <div class="flip-card-front absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-4 border border-[var(--text)]/10"
               style="backface-visibility:hidden;background:var(--surface);">
            <i class="${getSkillFAIcon(cat.name || '')} text-4xl" style="color:var(--primary);"></i>
            <h3 class="text-lg font-black text-[var(--heading)] text-center">${cat.name || 'Category'}</h3>
            <span class="text-xs font-bold opacity-50 text-[var(--text)]">${skillList.length} skills · hover to see</span>
          </div>
          <!-- Back -->
          <div class="flip-card-back absolute inset-0 rounded-2xl p-6 overflow-y-auto border"
               style="backface-visibility:hidden;transform:rotateY(180deg);background:color-mix(in srgb,var(--primary) 8%,var(--surface));border-color:color-mix(in srgb,var(--primary) 30%,transparent);">
            <h4 class="text-xs font-black uppercase tracking-wider mb-4" style="color:var(--primary);">${cat.name || 'Category'}</h4>
            <div class="flex flex-wrap gap-1.5">
              ${skillList.map((s: any) => `
              <span class="text-xs px-2.5 py-1 rounded-full font-bold text-[var(--text)] opacity-80"
                    style="background:color-mix(in srgb,var(--text) 10%,transparent);">${getSkillName(s)}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
      }).join('')}
    </div>
  </div>
  <style>
    .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
  </style>
</section>`;
  },

  // ─── 3. SKILLS_NEON_GRID ─────────────────────────────────────────────────
  SKILLS_NEON_GRID: (content: any) => {
    const allSkills = flattenSkills(content);
    return `
<section data-section="skills" class="relative py-20 md:py-28 bg-[var(--surface)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 text-center space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Stack</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="skills-title">${content.title || 'Skills'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg mx-auto">${content.subtitle}</p>` : ''}
    </div>
    <div class="flex flex-wrap justify-center gap-3">
      ${allSkills.map((skill: string) => `
      <span class="relative text-sm font-bold px-5 py-2.5 rounded-full border transition-all duration-300 cursor-default select-none group"
            style="background:color-mix(in srgb,var(--primary) 5%,var(--bg));border-color:color-mix(in srgb,var(--primary) 30%,transparent);color:var(--primary);"
            onmouseover="this.style.boxShadow='0 0 20px color-mix(in srgb,var(--primary) 50%,transparent)';this.style.borderColor='var(--primary)';this.style.background='color-mix(in srgb,var(--primary) 15%,var(--bg))';"
            onmouseout="this.style.boxShadow='none';this.style.borderColor='color-mix(in srgb,var(--primary) 30%,transparent)';this.style.background='color-mix(in srgb,var(--primary) 5%,var(--bg))';">
        ${skill}
      </span>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 4. SKILLS_WORD_CLOUD ────────────────────────────────────────────────
  SKILLS_WORD_CLOUD: (content: any) => {
    const allSkills = flattenSkills(content);
    const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];
    const colors = ['var(--primary)', 'var(--secondary, var(--primary))', 'var(--text)', 'var(--heading)'];
    return `
<section data-section="skills" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-5xl mx-auto px-6 text-center">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Skills</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="skills-title">${content.title || 'Skills'}</h2>
    </div>
    <div class="flex flex-wrap justify-center items-baseline gap-x-5 gap-y-3">
      ${allSkills.map((skill: string, i: number) => {
        const size = sizes[i % sizes.length];
        const color = colors[i % colors.length];
        return `<span class="${size} font-black transition-all duration-300 hover:scale-110 cursor-default select-none"
                      style="color:${color};opacity:${0.5 + (i % 3) * 0.2};">${skill}</span>`;
      }).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 5. SKILLS_ICON_SHOWCASE ────────────────────────────────────────────
  SKILLS_ICON_SHOWCASE: (content: any) => {
    const categories = Array.isArray(content.categories) ? content.categories : [];
    return `
<section data-section="skills" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-14 text-center space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Skills</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="skills-title">${content.title || 'Skills'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg mx-auto">${content.subtitle}</p>` : ''}
    </div>
    ${categories.map((cat: any) => `
    <div class="mb-12">
      <h3 class="text-xs font-black uppercase tracking-[0.4em] mb-8 text-center opacity-50 text-[var(--text)]">${cat.name || 'Category'}</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-5">
        ${(Array.isArray(cat.items) ? cat.items : []).map((skill: any) => `
        <div class="flex flex-col items-center gap-3 p-5 rounded-2xl group cursor-default transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[var(--text)]/10 hover:border-[var(--primary)]/30"
             style="background:var(--surface);">
          <i class="${getSkillFAIcon(getSkillName(skill))} text-3xl group-hover:scale-125 transition-transform duration-300" style="color:var(--primary);"></i>
          <span class="text-xs font-bold text-center text-[var(--text)] opacity-70">${getSkillName(skill)}</span>
        </div>`).join('')}
      </div>
    </div>`).join('')}
  </div>
</section>`;
  },

  // ─── 6. SKILLS_MINIMAL_ROWS ─────────────────────────────────────────────
  SKILLS_MINIMAL_ROWS: (content: any) => {
    const categories = Array.isArray(content.categories) ? content.categories : [];
    return `
<section data-section="skills" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-4xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Skills</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="skills-title">${content.title || 'Skills'}</h2>
    </div>
    <div class="flex flex-col">
      ${categories.map((cat: any) => {
        const skills = (Array.isArray(cat.items) ? cat.items : []).map(getSkillName).join(', ');
        return `
      <div class="flex flex-col sm:flex-row sm:items-baseline gap-4 py-6 border-t border-[var(--text)]/10">
        <div class="sm:w-1/3 flex-shrink-0">
          <span class="text-sm font-black uppercase tracking-[0.25em]" style="color:var(--primary);">${cat.name || 'Category'}</span>
        </div>
        <div class="flex-1">
          <p class="text-sm text-[var(--text)] opacity-70 leading-relaxed">${skills}</p>
        </div>
      </div>`;
      }).join('')}
      <div class="border-t border-[var(--text)]/10"></div>
    </div>
  </div>
</section>`;
  },

  // ─── 7. SKILLS_DARK_BENTO ───────────────────────────────────────────────
  SKILLS_DARK_BENTO: (content: any) => {
    const categories = Array.isArray(content.categories) ? content.categories : [];
    return `
<section data-section="skills" class="relative py-20 md:py-28 bg-[var(--surface)]">
  <div class="max-w-7xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Expertise</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="skills-title">${content.title || 'Skills'}</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
      <!-- Statement cell -->
      <div class="lg:col-span-1 rounded-2xl p-8 flex flex-col justify-end min-h-[200px]"
           style="background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 20%,var(--bg)),var(--bg));">
        <p class="text-xl font-black text-[var(--heading)] leading-tight">${content.subtitle || 'A carefully honed set of skills for modern digital work.'}</p>
      </div>
      ${categories.map((cat: any, i: number) => `
      <div class="${i === 0 ? 'lg:col-span-2' : ''} rounded-2xl p-7 border border-[var(--text)]/10 hover:border-[var(--primary)]/30 transition-all duration-300"
           style="background:color-mix(in srgb,var(--bg) 60%,var(--surface));">
        <h3 class="text-xs font-black uppercase tracking-[0.3em] mb-5" style="color:var(--primary);">${cat.name || 'Category'}</h3>
        <div class="flex flex-wrap gap-2">
          ${(Array.isArray(cat.items) ? cat.items : []).map((s: any) => `
          <span class="text-xs font-bold px-3 py-1.5 rounded-full text-[var(--text)] opacity-80"
                style="background:color-mix(in srgb,var(--text) 8%,transparent);border:1px solid color-mix(in srgb,var(--text) 12%,transparent);">${getSkillName(s)}</span>`).join('')}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 8. SKILLS_GAUGE_RINGS ──────────────────────────────────────────────
  SKILLS_GAUGE_RINGS: (content: any) => {
    const categories = Array.isArray(content.categories) ? content.categories : [];
    const defaultPcts = [95, 90, 88, 85, 92];
    const R = 44;
    const C = 2 * Math.PI * R;
    return `
<section data-section="skills" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 text-center space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Expertise</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="skills-title">${content.title || 'Skills'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg mx-auto">${content.subtitle}</p>` : ''}
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
      ${categories.slice(0, 5).map((cat: any, i: number) => {
        const pct = cat.level || defaultPcts[i % defaultPcts.length];
        const dash = (pct / 100) * C;
        const uid = `ring-${i}-${Math.random().toString(36).slice(2, 5)}`;
        return `
      <div class="flex flex-col items-center gap-4">
        <div class="relative w-28 h-28">
          <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="${R}" fill="none" stroke-width="8"
                    style="stroke:color-mix(in srgb,var(--primary) 12%,transparent);"></circle>
            <circle cx="50" cy="50" r="${R}" fill="none" stroke-width="8"
                    stroke-linecap="round"
                    style="stroke:var(--primary);stroke-dasharray:${dash.toFixed(1)} ${C.toFixed(1)};"
                    class="${uid}-ring">
            </circle>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xl font-black text-[var(--heading)]">${pct}%</span>
          </div>
        </div>
        <div class="text-center">
          <p class="text-sm font-black text-[var(--heading)]">${cat.name || `Category ${i + 1}`}</p>
          <p class="text-xs text-[var(--text)] opacity-50 mt-1">${(Array.isArray(cat.items) ? cat.items : []).length} skills</p>
        </div>
      </div>`;
      }).join('')}
    </div>
  </div>
  <style>
    @keyframes skillRingDraw {
      from { stroke-dasharray: 0 ${C.toFixed(1)}; }
    }
    section[data-section="skills"] circle:last-child {
      animation: skillRingDraw 1.2s ease-out forwards;
    }
  </style>
</section>`;
  },

  // ─── 9. SKILLS_FLOATING_PILLS ───────────────────────────────────────────
  SKILLS_FLOATING_PILLS: (content: any) => {
    const allSkills = flattenSkills(content);
    const rotations = ['rotate-1', '-rotate-2', 'rotate-3', '-rotate-1', 'rotate-2', '-rotate-3', 'rotate-0'];
    return `
<section data-section="skills" class="relative py-20 md:py-28 bg-[var(--bg)] overflow-hidden">
  <div class="absolute inset-0 pointer-events-none opacity-5"
       style="background-image:radial-gradient(var(--primary) 1px,transparent 1px);background-size:32px 32px;"></div>
  <div class="relative max-w-6xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Skills</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="skills-title">${content.title || 'Skills'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg">${content.subtitle}</p>` : ''}
    </div>
    <div class="flex flex-wrap gap-3 justify-center">
      ${allSkills.map((skill: string, i: number) => {
        const rot = rotations[i % rotations.length];
        const isAccent = i % 5 === 0;
        return `
      <span class="${rot} inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border transition-all duration-300 hover:scale-110 hover:-translate-y-1 cursor-default select-none"
            style="${isAccent ? 'background:var(--primary);color:var(--bg);border-color:var(--primary);' : 'background:var(--surface);color:var(--text);border-color:color-mix(in srgb,var(--text) 15%,transparent);'}">
        <i class="${getSkillFAIcon(skill)} text-xs"></i>${skill}
      </span>`;
      }).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 10. SKILLS_COMPACT_TAGS ────────────────────────────────────────────
  SKILLS_COMPACT_TAGS: (content: any) => {
    const categories = Array.isArray(content.categories) ? content.categories : [];
    return `
<section data-section="skills" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-5xl mx-auto px-6">
    <div class="mb-12 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Skills</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="skills-title">${content.title || 'Skills'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg">${content.subtitle}</p>` : ''}
    </div>
    <div class="space-y-6">
      ${categories.map((cat: any) => `
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-black uppercase tracking-[0.25em] mr-2 flex-shrink-0" style="color:var(--primary);">${cat.name || 'Category'}</span>
        <span class="w-px h-4 opacity-30 flex-shrink-0" style="background:var(--text);"></span>
        ${(Array.isArray(cat.items) ? cat.items : []).map((s: any) => `
        <span class="text-xs font-medium px-2.5 py-1 rounded-md text-[var(--text)] opacity-70 transition-all duration-200 hover:opacity-100 hover:text-[color:var(--primary)] cursor-default"
              style="background:color-mix(in srgb,var(--text) 6%,transparent);">${getSkillName(s)}</span>`).join('')}
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

};
