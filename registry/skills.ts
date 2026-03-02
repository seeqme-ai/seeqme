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
                     ${getSkillIcon(skill, 'w-8 h-8')}
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


export const SKILLS_DARK_SASS = (content: any) => `
    <section id="skills" data-section="skills" class="py-20 px-6 bg-[#0f172a]">
        <div class="max-w-6xl mx-auto">
            <h2 class="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">${content.title}</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${(content.tools || []).map((tool: any) => `
                <div class="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4 hover:border-violet-500 hover:bg-slate-800 transition-all cursor-default">
                    <div class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                        ${getSkillIcon(tool, 'w-6 h-6')}
                    </div>
                    <div class="font-bold text-white">${tool.name}</div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
`;

export const SKILLS_AGENCY = (content: any) => `
    <section id="skills" data-section="skills" class="py-20 px-6 text-center">
        <p class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8" data-field="skills-title">${content.title || 'My Tech Stack'}</p>
        <div class="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale">
            ${(content.skills || []).map((skill: any) => `
            <div class="flex flex-col items-center gap-2">
                 ${getSkillIcon(skill, 'w-10 h-10')}
                 <span class="text-xl font-black font-sans">${skill.name}</span>
            </div>
            `).join('')}
        </div>
    </section>
`;

import SkillIconCatalog from './skill-icons.json';

const DEFAULT_ICON_COLOR = '#94a3b8';
const FALLBACK_PALETTE = [
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#ef4444',
    '#10b981',
    '#6366f1',
    '#14b8a6'
];

type SkillIconEntry = {
    key: string;
    label: string;
    color: string;
    aliases?: string[];
    patterns?: string[];
};

const STANDARD_LABELS: Record<string, string> = {
    javascript: 'JS',
    typescript: 'TS',
    react: 'RE',
    nextjs: 'NX',
    vue: 'VU',
    angular: 'NG',
    nodejs: 'NJ',
    python: 'PY',
    go: 'GO',
    golang: 'GO',
    java: 'JA',
    csharp: 'CS',
    cpp: 'C++',
    php: 'PHP',
    ruby: 'RB',
    rails: 'RA',
    rust: 'RS',
    swift: 'SW',
    kotlin: 'KT',
    dart: 'DT',
    sql: 'SQL',
    postgresql: 'PG',
    mysql: 'MY',
    sqlite: 'SQ',
    mongodb: 'MG',
    redis: 'RD',
    kafka: 'KF',
    rabbitmq: 'RMQ',
    docker: 'DK',
    kubernetes: 'K8',
    aws: 'AWS',
    gcp: 'GCP',
    azure: 'AZ',
    git: 'GIT',
    github: 'GH',
    gitlab: 'GL',
    bitbucket: 'BB',
    linux: 'LX',
    tailwind: 'TW',
    figma: 'FIG',
    photoshop: 'PS',
    illustrator: 'AI',
    graphql: 'GQL',
    rest: 'RST',
    reactnative: 'RN',
    html: 'HTM',
    css: 'CSS',
    sass: 'SAS',
    bootstrap: 'BS',
    jquery: 'JQ',
    redux: 'RX',
    zustand: 'ZD',
    express: 'EX',
    nestjs: 'NS',
    fastapi: 'FA',
    flask: 'FL',
    django: 'DJ',
    spring: 'SP',
    dotnet: 'NET',
    terraform: 'TF',
    ansible: 'AN',
    githubactions: 'GHA',
    vercel: 'VC',
    netlify: 'NF',
    svelte: 'SV',
    nuxt: 'NUX',
    solidjs: 'SJ',
    threejs: '3J',
    unity: 'UN',
    unreal: 'UE',
    blender: 'BL',
    webflow: 'WF',
    notion: 'NO',
    slack: 'SL',
    jira: 'JR',
    trello: 'TR',
    figjam: 'FJ',
    adobexd: 'XD',
    communication: 'CO',
    leadership: 'LD',
    teamwork: 'TW',
    problemsolving: 'PS',
    criticalthinking: 'CT',
    adaptability: 'AD',
    timemanagement: 'TM',
    projectmanagement: 'PM',
    stakeholdermanagement: 'SM',
    negotiation: 'NG',
    conflictresolution: 'CR',
    decisionmaking: 'DM',
    presentation: 'PR',
    mentoring: 'MN',
    customerservice: 'CS',
    sales: 'SA',
    businessdevelopment: 'BD',
    marketing: 'MK',
    seo: 'SEO',
    contentwriting: 'CW',
    research: 'RS',
    dataanalysis: 'DA',
    excel: 'XL',
    powerbi: 'PB',
    tableau: 'TB',
    googleanalytics: 'GA',
    scrum: 'SC',
    agile: 'AG',
    kanban: 'KB',
    documentation: 'DOC',
    qa: 'QA',
    support: 'SUP',
    empathy: 'EM',
    creativity: 'CR',
    initiative: 'IN',
    accountability: 'AC',
    attentiontodetail: 'DT',
    organization: 'OR',
    planning: 'PL',
    prioritization: 'PR',
    riskmanagement: 'RM',
    changemanagement: 'CM',
    processimprovement: 'PI',
    rootcauseanalysis: 'RC',
    clientmanagement: 'CL',
    accountmanagement: 'AM',
    peoplemanagement: 'PM',
    hiring: 'HR',
    training: 'TR',
    budgeting: 'BD',
    forecasting: 'FC',
    reporting: 'RP',
    bookkeeping: 'BK',
    compliance: 'CP',
    privacy: 'PV',
    security: 'SC',
    operations: 'OP',
    logistics: 'LG',
    procurement: 'PC',
    qualitymanagement: 'QM',
    userresearch: 'UR',
    wireframing: 'WF',
    prototyping: 'PT',
    branding: 'BR',
    copywriting: 'CW',
    editing: 'ED',
    socialmedia: 'SM',
    emailmarketing: 'EM',
    crm: 'CRM',
    zendesk: 'ZD',
    hubspot: 'HS',
    salesforce: 'SF',
    msoffice: 'MS',
    powerpoint: 'PPT',
    word: 'WRD',
    outlook: 'OL',
    googlesheets: 'GSH',
    googledocs: 'GDC',
    googleslides: 'GLS',
    asana: 'AS',
    monday: 'MO',
    miro: 'MI',
    zoom: 'ZO',
    teams: 'TM',
    customersuccess: 'CS',
    productmanagement: 'PM',
    programmanagement: 'PG',
    operationsmanagement: 'OM',
    businessanalysis: 'BA'
};

const makeIconDataUri = (label: string, color: string) => {
    const safeLabel = label.slice(0, 3).toUpperCase();
    const svg =
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
        "<rect x='4' y='4' width='56' height='56' rx='12' fill='" + color + "'/>" +
        "<text x='32' y='38' font-family='Arial, sans-serif' font-size='18' font-weight='700' text-anchor='middle' fill='#0b0b0b'>" +
        safeLabel +
        "</text>" +
        "</svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
};

const hashToColor = (input: string) => {
    if (!input) return DEFAULT_ICON_COLOR;
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
        hash = (hash * 31 + input.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % FALLBACK_PALETTE.length;
    return FALLBACK_PALETTE[idx] || DEFAULT_ICON_COLOR;
};

function normalizeSkillName(raw: string) {
    const lower = raw.toLowerCase().trim();
    return lower
        .replace(/c\+\+/g, 'cplusplus')
        .replace(/c#/g, 'csharp')
        .replace(/\.net/g, 'dotnet')
        .replace(/node\.?js/g, 'nodejs')
        .replace(/react\.?js/g, 'react')
        .replace(/next\.?js/g, 'nextjs')
        .replace(/vue\.?js/g, 'vue')
        .replace(/nuxt\.?js/g, 'nuxtjs')
        .replace(/svelte\.?js/g, 'svelte')
        .replace(/[^a-z0-9]/g, '');
}

function getSkillInitials(raw: string) {
    const cleaned = raw.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
    if (!cleaned) return 'SK';
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

function normalizeKey(raw: string) {
    return normalizeSkillName(raw || '');
}

function getStandardLabel(entry: SkillIconEntry) {
    const key = normalizeKey(entry.key);
    const mapped = STANDARD_LABELS[key];
    if (mapped) return mapped;
    const labelFromKey = getSkillInitials(entry.key || '');
    const labelFromEntry = entry.label ? entry.label.slice(0, 3).toUpperCase() : '';
    return labelFromEntry || labelFromKey || 'SK';
}

const iconMap = new Map<string, string>();
const patternRules: Array<{ regex: RegExp; dataUri: string }> = [];

(SkillIconCatalog as SkillIconEntry[]).forEach((entry) => {
    const baseColor = entry.color || hashToColor(entry.key);
    const dataUri = makeIconDataUri(getStandardLabel(entry), baseColor);
    iconMap.set(normalizeSkillName(entry.key), dataUri);
    (entry.aliases || []).forEach((alias) => {
        iconMap.set(normalizeSkillName(alias), dataUri);
    });
    (entry.patterns || []).forEach((pattern) => {
        patternRules.push({ regex: new RegExp(pattern, 'i'), dataUri });
    });
});

const resolveSkillIcon = (name: string) => {
    const normalized = normalizeSkillName(name);
    const direct = iconMap.get(normalized);
    if (direct) return direct;
    for (const rule of patternRules) {
        if (rule.regex.test(name)) return rule.dataUri;
    }
    const initial = getSkillInitials(name);
    return makeIconDataUri(initial, hashToColor(normalizeSkillName(name)));
};

const getSkillIcon = (skill: any, classes: string = "w-8 h-8") => {
    const name = typeof skill === 'string' ? skill : (skill.name || skill.value || '');
    const dataUri = resolveSkillIcon(name || '');
    return `<img src="${dataUri}" alt="${name}" class="${classes}" />`;
};
const getSkillName = (skill: any) => typeof skill === 'string' ? skill : (skill.name || skill.value || 'Skill');

// --- ENGINEERING ---
export const SKILLS_ENG_BENTO = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-24 px-6 bg-[var(--bg)] text-[var(--text)]">
        <div class="max-w-6xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                <h2 class="text-4xl md:text-6xl font-black uppercase tracking-tighter" data-field="skills-title">${content.title || 'Tech Stack'}</h2>
                <p class="text-sm font-bold uppercase tracking-widest opacity-50 max-w-xs text-right hidden md:block">${content.description || 'Core technologies I work with'}</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                ${items.map((skill: any, i: number) => `
                <div class="group bg-[var(--surface)] border border-[var(--text)]/10 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-[var(--primary)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 ${i === 0 || i === 7 ? 'col-span-2 md:col-span-2 lg:col-span-2 row-span-2 aspect-square' : 'aspect-square'}">
                    <div class="text-[var(--primary)] group-hover:text-[var(--bg)] transition-colors duration-300">
                        ${getSkillIcon(skill, i === 0 || i === 7 ? 'w-16 h-16' : 'w-10 h-10')}
                    </div>
                    <span class="font-bold text-xs uppercase tracking-widest text-center">${getSkillName(skill)}</span>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
};

export const SKILLS_ENG_TERMINAL = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-24 px-6 bg-[#0a0a0a]">
        <div class="max-w-4xl mx-auto">
            <div class="rounded-xl overflow-hidden border border-[#333] shadow-2xl bg-[#111] font-mono">
                <div class="bg-[#222] px-4 py-3 flex items-center gap-2 border-b border-[#333]">
                    <div class="flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div class="mx-auto text-[#888] text-xs font-bold">~/skills/manifest.json</div>
                </div>
                <div class="p-6 md:p-8 text-[#0f0] text-sm md:text-base leading-relaxed">
                    <div class="flex mb-4">
                        <span class="text-[#f0f] mr-2">➜</span><span class="text-[#0ff] mr-2">~</span><span class="text-white">cat skills.json</span>
                    </div>
                    <div class="text-[#ddd]">
                        {<br/>
                        &nbsp;&nbsp;<span class="text-[#ffbd2e]">"competencies"</span>: [<br/>
                        ${items.map((skill: any, i: number) => `
                        &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#27c93f]">"${getSkillName(skill)}"</span>${i < items.length - 1 ? ',' : ''}
                        `).join('')}
                        <br/>&nbsp;&nbsp;]<br/>
                        }
                    </div>
                    <div class="flex mt-4 animate-pulse">
                        <span class="text-[#f0f] mr-2">➜</span><span class="text-[#0ff] mr-2">~</span><span class="w-2 h-5 bg-[#0f0] inline-block"></span>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
};

export const SKILLS_ENG_CIRCUIT = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-32 px-6 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(var(--text) 1px, transparent 1px); background-size: 40px 40px;"></div>
        <div class="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div class="w-full md:w-1/3">
                <div class="w-16 h-1 bg-[var(--primary)] mb-8"></div>
                <h2 class="text-5xl font-black uppercase leading-[0.9] mb-6" data-field="skills-title">${content.title || 'System<br/>Architecture'}</h2>
                <p class="text-sm font-bold uppercase tracking-widest opacity-60 leading-relaxed">${content.description || 'Interconnected technologies powering robust solutions.'}</p>
            </div>
            <div class="w-full md:w-2/3 flex flex-wrap justify-center gap-x-8 gap-y-12">
                ${items.map((skill: any) => `
                <div class="relative group flex flex-col items-center">
                    <div class="w-px h-8 bg-gradient-to-b from-transparent to-[var(--text)]/20 absolute -top-8 group-hover:to-[var(--primary)] transition-colors"></div>
                    <div class="w-16 h-16 rounded-full border-2 border-[var(--text)]/10 flex items-center justify-center bg-[var(--surface)] group-hover:border-[var(--primary)] group-hover:scale-110 transition-all shadow-xl z-10">
                        <div class="w-2 h-2 absolute -left-1 rounded-full bg-[var(--text)]/20 group-hover:bg-[var(--primary)]"></div>
                        <div class="w-2 h-2 absolute -right-1 rounded-full bg-[var(--text)]/20 group-hover:bg-[var(--primary)]"></div>
                        ${getSkillIcon(skill, 'w-8 h-8')}
                    </div>
                    <div class="w-px h-8 bg-gradient-to-t from-transparent to-[var(--text)]/20 absolute -bottom-8 group-hover:to-[var(--primary)] transition-colors"></div>
                    <span class="absolute -bottom-14 whitespace-nowrap text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">${getSkillName(skill)}</span>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
};

// --- CREATIVE ---
export const SKILLS_CREATIVE_MASONRY = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-24 px-6 bg-[var(--surface)] overflow-hidden">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-center text-4xl md:text-7xl font-black uppercase tracking-tighter mb-20" data-field="skills-title">${content.title || 'Creative Tools'}</h2>
            <div class="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                ${items.map((skill: any, i: number) => {
        const heights = ['h-32', 'h-48', 'h-40', 'h-56', 'h-64'];
        const height = heights[i % heights.length];
        const isColored = i % 3 === 0;
        return `
                    <div class="break-inside-avoid w-full ${height} rounded-3xl p-6 flex flex-col justify-end relative group overflow-hidden transition-transform hover:scale-[1.02] ${isColored ? 'bg-[var(--primary)] text-[var(--bg)]' : 'bg-[var(--bg)] text-[var(--text)] border border-[var(--text)]/10'}">
                        <div class="absolute top-6 left-6 opacity-30 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 origin-top-left ${isColored ? 'text-[var(--bg)]' : 'text-[var(--primary)]'}">
                            ${getSkillIcon(skill, 'w-12 h-12')}
                        </div>
                        <span class="font-black text-xl uppercase tracking-tighter relative z-10">${getSkillName(skill)}</span>
                    </div>
                    `;
    }).join('')}
            </div>
        </div>
    </section>`;
};

export const SKILLS_CREATIVE_PALETTE = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-32 px-6">
        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div class="lg:w-1/3 text-center lg:text-left">
                <span class="w-12 h-12 rounded-full border border-[var(--primary)] text-[var(--primary)] flex items-center justify-center text-xl mb-6 mx-auto lg:mx-0">✧</span>
                <h2 class="text-4xl md:text-5xl font-black uppercase leading-tight mb-4" data-field="skills-title">${content.title || 'My Palette'}</h2>
                <p class="text-lg opacity-60 leading-relaxed">${content.description || 'The mediums and tools through which I bring ideas to vivid life.'}</p>
            </div>
            <div class="lg:w-2/3 w-full flex flex-col gap-3">
                ${items.map((skill: any) => {
        const width = Math.floor(Math.random() * 40) + 60;
        return `
                    <div class="h-16 w-full bg-[var(--surface)] border border-[var(--text)]/5 rounded-full p-2 flex items-center gap-4 relative overflow-hidden group">
                        <div class="absolute top-0 left-0 bottom-0 bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors rounded-full z-0" style="width: ${width}%"></div>
                        <div class="w-12 h-12 rounded-full bg-[var(--bg)] flex items-center justify-center shadow-sm z-10 shrink-0 text-[var(--primary)]">${getSkillIcon(skill, 'w-6 h-6')}</div>
                        <span class="font-bold uppercase tracking-widest text-sm z-10">${getSkillName(skill)}</span>
                    </div>
                    `;
    }).join('')}
            </div>
        </div>
    </section>`;
};

export const SKILLS_CREATIVE_CARDS = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-32 px-6 bg-[var(--bg)] overflow-hidden">
        <div class="max-w-7xl mx-auto relative">
            <div class="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl -z-10"></div>
            <div class="text-center max-w-2xl mx-auto mb-20 space-y-6">
                <h2 class="text-5xl md:text-6xl font-black uppercase tracking-tighter" data-field="skills-title">${content.title || 'Arsenal'}</h2>
                <div class="w-24 h-1 bg-[var(--text)] mx-auto opacity-10"></div>
            </div>
            <div class="flex flex-wrap justify-center gap-6">
                ${items.map((skill: any, i: number) => `
                <div class="w-40 h-56 bg-[var(--surface)] border border-[var(--text)]/10 rounded-2xl p-6 flex flex-col items-center justify-between hover:-translate-y-4 hover:shadow-2xl hover:shadow-[var(--primary)]/20 transition-all duration-500 group">
                    <div class="w-full text-right opacity-20 font-mono text-xs">${String(i + 1).padStart(2, '0')}</div>
                    <div class="w-16 h-16 rounded-full bg-[var(--bg)] border border-[var(--text)]/5 text-[var(--text)] flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-[var(--bg)] transition-all duration-500">
                        ${getSkillIcon(skill, 'w-8 h-8')}
                    </div>
                    <div class="text-center font-bold text-sm uppercase tracking-widest leading-none">${getSkillName(skill)}</div>
                </div>`).join('')}
            </div>
        </div>
    </section>`;
};

// --- BUSINESS ---
export const SKILLS_BIZ_CARDS = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-24 px-6 bg-[var(--surface)]">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tight text-[var(--heading)]" data-field="skills-title">${content.title || 'Core Competencies'}</h2>
                <p class="mt-4 text-[var(--text)] opacity-70 max-w-2xl mx-auto">${content.description || 'Specialized skills driving strategic outcomes and operational excellence.'}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${items.map((skill: any) => `
                <div class="bg-[var(--bg)] border border-[var(--text)]/10 p-8 rounded-2xl hover:border-[var(--primary)] transition-all flex flex-col gap-4">
                    <div class="w-12 h-12 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-2">
                        ${getSkillIcon(skill, 'w-6 h-6')}
                    </div>
                    <h3 class="font-bold text-xl">${getSkillName(skill)}</h3>
                    <div class="w-full bg-[var(--text)]/5 h-1 md:h-2 mt-auto rounded-full overflow-hidden">
                        <div class="bg-[var(--primary)] h-full w-[85%] rounded-full"></div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
};

export const SKILLS_BIZ_LIST = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-24 px-6 bg-[var(--bg)] border-y border-[var(--text)]/10">
        <div class="max-w-4xl mx-auto">
            <h2 class="text-3xl font-bold mb-12" data-field="skills-title">${content.title || 'Expertise Overview'}</h2>
            <div class="flex flex-col gap-px bg-[var(--text)]/10">
                ${items.map((skill: any) => `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[var(--bg)] hover:bg-[var(--surface)] transition-colors group">
                    <div class="flex items-center gap-4 mb-4 sm:mb-0">
                        <div class="text-[var(--primary)] opacity-50 group-hover:opacity-100 transition-opacity">
                            ${getSkillIcon(skill, 'w-6 h-6')}
                        </div>
                        <span class="font-medium text-lg">${getSkillName(skill)}</span>
                    </div>
                    <div class="flex gap-2">
                        <div class="w-12 h-2 bg-[var(--primary)] rounded-full"></div>
                        <div class="w-12 h-2 bg-[var(--primary)] rounded-full"></div>
                        <div class="w-12 h-2 bg-[var(--primary)] rounded-full"></div>
                        <div class="w-12 h-2 bg-[var(--text)]/20 rounded-full"></div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
};

export const SKILLS_BIZ_PIE = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-24 px-6 bg-[var(--bg)]">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div class="md:w-1/2">
                <h2 class="text-4xl lg:text-5xl font-bold mb-6" data-field="skills-title">${content.title || 'Skills & Strengths'}</h2>
                <div class="h-1 w-20 bg-[var(--primary)] mb-8"></div>
                <p class="text-lg opacity-70 mb-8 leading-relaxed">${content.description || 'A balanced portfolio of analytical, strategic, and leadership capabilities honed through rigorous professional application.'}</p>
            </div>
            <div class="md:w-1/2 shrink-0 grid grid-cols-2 gap-6 w-full">
                ${items.slice(0, 4).map((skill: any) => `
                <div class="flex flex-col items-center justify-center p-8 bg-[var(--surface)] rounded-2xl border border-[var(--text)]/5 hover:shadow-xl transition-all">
                    <div class="w-20 h-20 rounded-full border-[6px] border-[var(--text)]/10 flex items-center justify-center mb-4 relative">
                        <svg class="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="var(--primary)" stroke-width="6" stroke-dasharray="200" stroke-dashoffset="30"></circle>
                        </svg>
                        ${getSkillIcon(skill, 'w-8 h-8')}
                    </div>
                    <span class="font-bold text-center">${getSkillName(skill)}</span>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
};

// --- FINANCE ---
export const SKILLS_FIN_MATRIX = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-24 px-6 bg-[#f8f9fa] dark:bg-[#0a0f18] text-slate-900 dark:text-slate-100 font-sans">
        <div class="max-w-6xl mx-auto">
            <div class="border-b-2 border-slate-200 dark:border-slate-800 pb-4 mb-8 flex justify-between items-end">
                <h2 class="text-2xl font-semibold uppercase tracking-wide" data-field="skills-title">${content.title || 'Skill Matrix'}</h2>
                <span class="text-sm font-mono text-emerald-600 dark:text-emerald-400">DATA UPDATED: RECENT</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead class="text-xs uppercase bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                        <tr>
                            <th class="px-6 py-4 font-semibold">Asset / Skill</th>
                            <th class="px-6 py-4 font-semibold">Category</th>
                            <th class="px-6 py-4 font-semibold text-right">Proficiency</th>
                            <th class="px-6 py-4 font-semibold text-right">Trend</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                        ${items.map((skill: any) => `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td class="px-6 py-4 font-medium flex items-center gap-3">
                                <div class="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                    ${getSkillIcon(skill, 'w-4 h-4')}
                                </div>
                                ${getSkillName(skill)}
                            </td>
                            <td class="px-6 py-4 text-slate-500">Core</td>
                            <td class="px-6 py-4 text-right font-mono">
                                <div class="flex items-center justify-end gap-2">
                                    <div class="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div class="h-full bg-emerald-500 w-[90%]"></div>
                                    </div>
                                    <span>High</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-emerald-500 text-right font-mono">+12.4% ▲</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </section>`;
};

export const SKILLS_FIN_TICKER = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    const array = [...items, ...items, ...items, ...items]; // Multiply to ensure scrolling
    return `
    <section id="skills" data-section="skills" class="py-16 bg-[#111] text-white border-y border-[#333] overflow-hidden flex flex-col gap-4">
        <h2 class="text-center text-[#888] font-mono text-xs uppercase tracking-[0.2em] mb-4" data-field="skills-title">${content.title || 'Market Indexes & Tools'}</h2>
        <div class="relative flex overflow-x-hidden group">
            <div class="animate-marquee whitespace-nowrap flex items-center gap-12 group-hover:[animation-play-state:paused] whitespace-nowrap">
                ${array.map((skill: any) => `
                <div class="flex items-center gap-3 font-mono">
                    <span class="text-[#888]">${getSkillIcon(skill, 'w-4 h-4')}</span>
                    <span class="font-bold">${getSkillName(skill).toUpperCase()}</span>
                    <span class="text-[#0f0] ml-2">▲ 99.9</span>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
};

export const SKILLS_FIN_CHART = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-24 px-6 bg-white dark:bg-[#050505] text-slate-900 dark:text-white">
        <div class="max-w-5xl mx-auto border border-slate-200 dark:border-[#222] p-8 rounded-xl shadow-sm">
            <div class="flex justify-between items-end mb-12">
                <div>
                    <h2 class="text-xl font-bold font-serif" data-field="skills-title">${content.title || 'Proficiency Distribution'}</h2>
                    <p class="text-sm text-slate-500 uppercase tracking-widest mt-2">${content.description || 'Year-over-Year competency accumulation'}</p>
                </div>
                <div class="hidden sm:flex gap-2 text-xs font-bold font-mono">
                    <span class="text-slate-400">1D</span><span class="text-slate-400">1W</span><span class="text-slate-400">1M</span><span class="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">ALL</span>
                </div>
            </div>
            
            <div class="h-64 flex items-end justify-between gap-2 md:gap-4 relative border-b border-slate-200 dark:border-[#333] pb-4">
                <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 hidden sm:flex">
                    <div class="border-b border-slate-500/50 w-full h-px"></div>
                    <div class="border-b border-slate-500/50 w-full h-px"></div>
                    <div class="border-b border-slate-500/50 w-full h-px"></div>
                    <div class="border-b border-slate-500/50 w-full h-px"></div>
                </div>
                ${items.map((skill: any) => {
        const height = Math.floor(Math.random() * 40) + 60; // 60-100%
        return `
                    <div class="w-full relative group flex flex-col items-center justify-end h-full">
                        <span class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 text-xs font-mono font-bold whitespace-nowrap bg-slate-800 text-white px-2 py-1 rounded z-10">${getSkillName(skill)}</span>
                        <div class="w-full bg-slate-200 dark:bg-[#222] hover:bg-indigo-500 dark:hover:bg-indigo-500 transition-colors rounded-t-md relative z-10 flex justify-center pt-2" style="height: ${height}%">
                            ${getSkillIcon(skill, 'w-4 h-4 opacity-50')}
                        </div>
                    </div>
                    `;
    }).join('')}
            </div>
        </div>
    </section>`;
};

// --- MARKETING ---
export const SKILLS_MKT_FUNNEL = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-24 px-6 bg-[var(--surface)] border-t border-[var(--text)]/10">
        <div class="max-w-5xl mx-auto">
            <div class="text-center mb-16">
                <span class="inline-block px-4 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold tracking-widest uppercase mb-4">Growth Engine</span>
                <h2 class="text-5xl font-black uppercase tracking-tighter" data-field="skills-title">${content.title || 'Marketing Stack'}</h2>
            </div>
            <div class="flex flex-col items-center gap-4">
                ${items.map((skill: any, i: number) => {
        const widthPct = 100 - (i * (60 / items.length));
        return `
                    <div class="h-16 bg-[var(--bg)] border border-[var(--primary)]/20 rounded-full flex items-center justify-between px-6 hover:bg-[var(--primary)] hover:text-[var(--bg)] transition-all group" style="width: ${widthPct}%">
                        <span class="font-bold uppercase tracking-widest text-sm translate-x-4 group-hover:translate-x-0 transition-transform">${getSkillName(skill)}</span>
                        <div class="w-10 h-10 rounded-full bg-[var(--surface)] text-[var(--primary)] flex items-center justify-center -translate-x-4 group-hover:translate-x-0 transition-transform">${getSkillIcon(skill, 'w-5 h-5')}</div>
                    </div>
                    `;
    }).join('')}
            </div>
        </div>
    </section>`;
};

export const SKILLS_MKT_BUBBLES = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-32 px-6 bg-[var(--bg)] overflow-hidden">
        <div class="max-w-7xl mx-auto flex flex-col items-center relative">
            <h2 class="text-6xl font-black uppercase tracking-tighter mb-20 text-center relative z-10" data-field="skills-title">${content.title || 'Ecosystem'}</h2>
            <div class="relative w-full max-w-4xl h-[600px] flex items-center justify-center">
                <div class="absolute inset-0 border border-[var(--text)]/5 rounded-full animate-pulse blur-sm"></div>
                ${items.map((skill: any, i: number) => {
        const size = Math.floor(Math.random() * 60) + 100;
        const angle = (i * (360 / items.length)) * (Math.PI / 180);
        const radius = 200 + Math.random() * 50;
        const top = `calc(50% + ${Math.sin(angle) * radius}px)`;
        const left = `calc(50% + ${Math.cos(angle) * radius}px)`;
        return `
                    <div class="absolute rounded-full bg-[var(--surface)] border border-[var(--primary)]/20 flex flex-col items-center justify-center shadow-2xl hover:bg-[var(--primary)] hover:text-[var(--bg)] hover:scale-110 transition-all cursor-pointer group" style="width: ${size}px; height: ${size}px; top: ${top}; left: ${left}; transform: translate(-50%, -50%);">
                        <div class="text-[var(--primary)] group-hover:text-[var(--bg)] transition-colors mb-2">${getSkillIcon(skill, 'w-8 h-8')}</div>
                        <span class="text-xs font-bold uppercase tracking-widest text-center px-2">${getSkillName(skill)}</span>
                    </div>
                    `;
    }).join('')}
                <div class="w-40 h-40 rounded-full bg-[var(--primary)] text-[var(--bg)] flex items-center justify-center font-black text-2xl uppercase tracking-tighter shadow-2xl z-20 mx-auto">CORE</div>
            </div>
        </div>
    </section>`;
};

export const SKILLS_MKT_CAROUSEL = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    const repeatedList = [...items, ...items, ...items];
    return `
    <section id="skills" data-section="skills" class="py-24 bg-[var(--primary)] text-[var(--bg)] overflow-hidden">
        <h2 class="text-center text-sm font-black uppercase tracking-[0.3em] mb-12 opacity-80" data-field="skills-title">${content.title || 'Mastered Platforms'}</h2>
        <div class="flex whitespace-nowrap overflow-x-hidden relative group">
            <div class="animate-marquee-slow flex items-center gap-16 group-hover:[animation-play-state:paused] whitespace-nowrap px-8">
                ${repeatedList.map((skill: any) => `
                <div class="flex items-center gap-4 hover:scale-110 transition-transform">
                    <div class="w-16 h-16 rounded-2xl bg-[var(--bg)] text-[var(--primary)] flex items-center justify-center shadow-lg">
                        ${getSkillIcon(skill, 'w-8 h-8')}
                    </div>
                    <span class="text-3xl font-black uppercase tracking-tighter">${getSkillName(skill)}</span>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
};

// --- AGENCY ---
export const SKILLS_AGC_NEOBRUTAL = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-32 px-6 bg-[#FFE500] text-black">
        <div class="max-w-7xl mx-auto border-8 border-black p-8 md:p-16 bg-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <h2 class="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-16 leading-none" data-field="skills-title">${content.title || 'Capabilities'}</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                ${items.map((skill: any) => `
                <div class="border-4 border-black p-6 bg-[#FF90E8] hover:bg-[#00E5FF] transition-colors flex flex-col items-start gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div class="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full">
                        ${getSkillIcon(skill, 'w-6 h-6')}
                    </div>
                    <span class="font-black text-xl uppercase tracking-tighter leading-none">${getSkillName(skill)}</span>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
};

export const SKILLS_AGC_GLASS = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-32 px-6 bg-slate-900 border-t border-white/10 relative overflow-hidden">
        <div class="absolute top-1/2 left-1/4 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div class="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div class="max-w-6xl mx-auto relative z-10">
            <h2 class="text-5xl font-bold text-white mb-16 text-center tracking-tight" data-field="skills-title">${content.title || 'Technical Prowess'}</h2>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                ${items.map((skill: any) => `
                <div class="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 transition-colors shadow-xl group">
                    <div class="text-white group-hover:scale-125 transition-transform duration-500">
                        ${getSkillIcon(skill, 'w-10 h-10')}
                    </div>
                    <span class="text-white font-medium text-sm tracking-wide text-center">${getSkillName(skill)}</span>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
};

export const SKILLS_AGC_MINIMAL = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
    <section id="skills" data-section="skills" class="py-32 px-6 bg-[var(--bg)] text-[var(--text)]">
        <div class="max-w-4xl mx-auto">
            <h2 class="text-sm font-bold uppercase tracking-[0.2em] mb-16" data-field="skills-title">${content.title || 'Expertise'}</h2>
            <div class="flex flex-col border-t border-[var(--text)]">
                ${items.map((skill: any, i: number) => `
                <div class="py-8 flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--text)]/20 hover:pl-8 transition-all duration-500 group">
                    <div class="flex items-center gap-8 mb-4 md:mb-0">
                        <span class="text-xs font-mono opacity-30 group-hover:opacity-100 transition-opacity">0${i + 1}</span>
                        <h3 class="text-4xl md:text-5xl font-normal tracking-tight group-hover:text-[var(--primary)] transition-colors">${getSkillName(skill)}</h3>
                    </div>
                    <div class="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity md:pr-4">
                        ${getSkillIcon(skill, 'w-8 h-8')}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
};

export const SKILLS_DARK_SAAS = (content: any) => {
    const items = content.skills || content.items || (content.skillsCategories ? content.skillsCategories.flatMap((c: any) => c.skills || []) : []);
    return `
  <section id="skills" data-section="skills" class="py-24 px-6 bg-slate-950 text-white border-y border-white/5 relative overflow-hidden">
    <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
    <div class="max-w-7xl mx-auto relative z-10">
      <div class="text-center mb-16 space-y-4">
        <h2 class="text-4xl md:text-5xl font-black tracking-tight" data-field="skills-title">${content.title || 'Technical Architecture'}</h2>
        <p class="text-slate-400 max-w-2xl mx-auto" data-field="skills-description">${content.description || 'Enterprise-grade frameworks and modern tooling deployed in production.'}</p>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        ${items.map((skill: any) => {
        const name = typeof skill === 'string' ? skill : (skill.name || skill.value || 'Skill');
        return `
          <div class="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-white/10 hover:border-teal-500/50 transition-all group cursor-default">
            <div class="w-10 h-10 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform shadow-inner shadow-black/50">
              ${getSkillIcon(skill, 'w-6 h-6')}
            </div>
            <span class="text-xs font-bold text-slate-300 group-hover:text-white transition-colors text-center uppercase tracking-wider">${name}</span>
          </div>
          `;
    }).join('')}
      </div>
    </div>
  </section>
  `;
};

export const SkillsRegistry: any = {
    SKILLS_MARQUEE,
    SKILLS_GRID_ICONS,
    SKILLS_PROGRESS_BARS,
    SKILLS_TAGS_CLOUD,
    SKILLS_HEXAGON_GRID,
    SKILLS_RADAR_CHART,
    SKILLS_DARK_SAAS,
    // Backward/AI alias: prompt/library may reference this older ID spelling.
    SKILLS_DARK_SASS,
    SKILLS_AGENCY,
    SKILLS_ENG_BENTO,
    SKILLS_ENG_TERMINAL,
    SKILLS_ENG_CIRCUIT,
    SKILLS_CREATIVE_MASONRY,
    SKILLS_CREATIVE_PALETTE,
    SKILLS_CREATIVE_CARDS,
    SKILLS_BIZ_CARDS,
    SKILLS_BIZ_LIST,
    SKILLS_BIZ_PIE,
    SKILLS_FIN_MATRIX,
    SKILLS_FIN_TICKER,
    SKILLS_FIN_CHART,
    SKILLS_MKT_FUNNEL,
    SKILLS_MKT_BUBBLES,
    SKILLS_MKT_CAROUSEL,
    SKILLS_AGC_NEOBRUTAL,
    SKILLS_AGC_GLASS,
    SKILLS_AGC_MINIMAL
};


