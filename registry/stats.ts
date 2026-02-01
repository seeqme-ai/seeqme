// Stats/Metrics Components - Data-Driven, Professional

export const STATS_COUNTER_GRID = (content: any) => `
  <section class="py-24 px-6 bg-[var(--surface)]">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-black mb-4" data-field="stats-title">
          ${content.title || 'Impact by Numbers'}
        </h2>
        <p class="text-lg opacity-60" data-field="stats-subtitle">
          ${content.subtitle || 'Proven track record of delivering results'}
        </p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        ${(content.stats || [
    { value: '500+', label: 'Projects Completed' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '15+', label: 'Years Experience' },
    { value: '50+', label: 'Awards Won' }
  ]).map((stat: any) => `
          <div class="text-center space-y-2 group">
            <div class="text-[clamp(2.5rem,6vw,4rem)] font-black text-[var(--primary)] group-hover:scale-110 transition-transform" data-field="stat-value">
              ${stat.value}
            </div>
            <div class="text-sm uppercase tracking-wider opacity-60 font-bold" data-field="stat-label">
              ${stat.label}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
`;

export const STATS_TIMELINE = (content: any) => `
  <section class="py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-4xl md:text-5xl font-black mb-16 text-center" data-field="stats-title">
        ${content.title || 'Growth Journey'}
      </h2>
      <div class="relative">
        <div class="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--text)]/10 hidden md:block"></div>
        <div class="space-y-12">
          ${(content.milestones || [
    { year: '2020', metric: '100K', description: 'First major milestone' },
    { year: '2022', metric: '500K', description: 'Expanded globally' },
    { year: '2024', metric: '1M+', description: 'Industry leader' }
  ]).map((milestone: any, index: number) => `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div class="${index % 2 === 0 ? 'md:text-right' : 'md:order-2'}">
                <div class="inline-block px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black uppercase mb-4">
                  ${milestone.year}
                </div>
                <div class="text-5xl md:text-6xl font-black mb-2">${milestone.metric}</div>
                <p class="text-lg opacity-60">${milestone.description}</p>
              </div>
              <div class="${index % 2 === 0 ? '' : 'md:order-1'}"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>
`;

export const STATS_CIRCULAR_PROGRESS = (content: any) => `
  <section class="py-24 px-6 bg-gradient-to-b from-transparent to-[var(--surface)]">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-4xl md:text-5xl font-black mb-16 text-center" data-field="stats-title">
        ${content.title || 'Expertise Breakdown'}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        ${(content.skills || [
    { name: 'Frontend', percentage: 95 },
    { name: 'Backend', percentage: 88 },
    { name: 'Design', percentage: 92 }
  ]).map((skill: any) => `
          <div class="text-center space-y-6">
            <div class="relative w-40 h-40 mx-auto">
              <svg class="transform -rotate-90 w-full h-full">
                <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="8" fill="none" class="text-[var(--text)]/10" />
                <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="8" fill="none" 
                        class="text-[var(--primary)]" 
                        stroke-dasharray="${2 * Math.PI * 70}" 
                        stroke-dashoffset="${2 * Math.PI * 70 * (1 - skill.percentage / 100)}"
                        stroke-linecap="round" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-3xl font-black">${skill.percentage}%</span>
              </div>
            </div>
            <h3 class="text-xl font-bold">${skill.name}</h3>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
`;

export const STATS_COMPARISON_TABLE = (content: any) => `
  <section class="py-24 px-6">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-4xl md:text-5xl font-black mb-16 text-center" data-field="stats-title">
        ${content.title || 'Before vs After'}
      </h2>
      <div class="grid grid-cols-2 gap-8">
        <div class="space-y-6">
          <h3 class="text-2xl font-black text-center pb-4 border-b border-[var(--text)]/10">Before</h3>
          ${(content.before || [
    { metric: 'Load Time', value: '4.2s' },
    { metric: 'Conversion', value: '2.1%' },
    { metric: 'Users', value: '10K/mo' }
  ]).map((item: any) => `
            <div class="p-4 rounded-xl bg-[var(--surface)] border border-[var(--text)]/10">
              <div class="text-sm opacity-60 mb-1">${item.metric}</div>
              <div class="text-2xl font-black opacity-40">${item.value}</div>
            </div>
          `).join('')}
        </div>
        <div class="space-y-6">
          <h3 class="text-2xl font-black text-center pb-4 border-b border-[var(--primary)]">After</h3>
          ${(content.after || [
    { metric: 'Load Time', value: '0.8s' },
    { metric: 'Conversion', value: '8.7%' },
    { metric: 'Users', value: '50K/mo' }
  ]).map((item: any) => `
            <div class="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]">
              <div class="text-sm opacity-60 mb-1">${item.metric}</div>
              <div class="text-2xl font-black text-[var(--primary)]">${item.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>
`;

export const STATS_ACHIEVEMENT_BADGES = (content: any) => `
  <section class="py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-4xl md:text-5xl font-black mb-16 text-center" data-field="stats-title">
        ${content.title || 'Achievements & Recognition'}
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        ${(content.achievements || [
    { icon: '🏆', title: 'Award Winner', year: '2024' },
    { icon: '⭐', title: 'Top Rated', year: '2023' },
    { icon: '🎯', title: 'Certified Expert', year: '2022' },
    { icon: '💎', title: 'Premium Partner', year: '2024' },
    { icon: '🚀', title: 'Innovation Leader', year: '2023' }
  ]).map((achievement: any) => `
          <div class="group text-center space-y-4 p-6 rounded-2xl hover:bg-[var(--surface)] transition-all cursor-pointer">
            <div class="text-6xl transform group-hover:scale-110 transition-transform">
              ${achievement.icon}
            </div>
            <div>
              <div class="font-bold text-sm mb-1">${achievement.title}</div>
              <div class="text-xs opacity-40">${achievement.year}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
`;

export const STATS_ANIMATED_COUNTERS = (content: any) => {
  const stats = content.stats || [];
  return `
   <section data-section="stats" class="py-24 px-6 bg-black text-white">
     <div class="max-w-7xl mx-auto space-y-16">
        <h2 class="text-xs font-black uppercase tracking-[0.5em] text-teal-400">Impact Metrics</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-12">
           ${stats.map((s: any) => `
              <div class="space-y-2">
                 <div class="text-7xl font-black tracking-tighter" data-field="stat-value">${s.value}</div>
                 <div class="h-1 w-8 bg-teal-400"></div>
                 <p class="text-sm font-bold uppercase tracking-widest opacity-40">${s.label}</p>
              </div>
           `).join('')}
        </div>
     </div>
   </section>
   `;
};

export const STATS_ICON_CARDS = (content: any) => {
  const stats = content.stats || [];
  return `
   <section data-section="stats" class="py-24 px-6">
     <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        ${stats.map((s: any) => `
           <div class="p-10 bg-[var(--surface)] border border-white/5 rounded-[2.5rem] flex flex-col items-center text-center group hover:bg-[var(--primary)] transition-all">
              <div class="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/10 transition-colors">
                 <span class="text-2xl">${s.icon || '📊'}</span>
              </div>
              <h3 class="text-4xl font-black mb-2 group-hover:text-[var(--bg)] transition-colors">${s.value}</h3>
              <p class="text-xs font-black uppercase tracking-widest opacity-40 group-hover:text-[var(--bg)]/60 transition-colors">${s.label}</p>
           </div>
        `).join('')}
     </div>
   </section>
   `;
};

export const STATS_MINIMAL_INLINE = (content: any) => {
  const stats = content.stats || [];
  return `
   <section data-section="stats" class="py-12 bg-[var(--surface)]/30 border-y border-white/5">
     <div class="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-12">
        ${stats.map((s: any) => `
           <div class="flex items-baseline gap-4">
              <span class="text-4xl font-black tracking-tight">${s.value}</span>
              <span class="text-xs font-bold uppercase tracking-widest opacity-40">${s.label}</span>
           </div>
        `).join('')}
     </div>
   </section>
   `;
};

export const STATS_LARGE_NUMBERS = (content: any) => {
  const stats = content.stats || [];
  return `
   <section data-section="stats" class="py-32 px-6 relative overflow-hidden">
     <div class="max-w-7xl mx-auto space-y-32">
        ${stats.slice(0, 2).map((s: any, i: number) => `
           <div class="flex flex-col ${i % 2 === 0 ? 'items-start' : 'items-end'} relative">
              <div class="text-[20vw] font-black leading-none opacity-5 absolute ${i % 2 === 0 ? 'left-0' : 'right-0'} -top-1/2 select-none">${s.value}</div>
              <div class="relative z-10 max-w-md ${i % 2 === 0 ? 'pl-8 border-l-4 border-[var(--primary)]' : 'pr-8 border-r-4 border-[var(--primary)] text-right'}">
                 <h3 class="text-6xl font-black mb-4 uppercase tracking-tighter">${s.value}</h3>
                 <p class="text-2xl font-bold opacity-60">${s.label}</p>
                 <p class="mt-4 text-sm opacity-40 leading-relaxed">${s.description || 'Consistently delivering high-value results across complex global benchmarks.'}</p>
              </div>
           </div>
        `).join('')}
     </div>
   </section>
   `;
};

export const StatsRegistry: any = {
  STATS_COUNTER_GRID,
  STATS_TIMELINE,
  STATS_CIRCULAR_PROGRESS,
  STATS_COMPARISON_TABLE,
  STATS_ACHIEVEMENT_BADGES,
  STATS_ANIMATED_COUNTERS,
  STATS_ICON_CARDS,
  STATS_MINIMAL_INLINE,
  STATS_LARGE_NUMBERS
};
