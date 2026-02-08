
export const ABOUT_NARRATIVE = (content: any) => `
  <section id="about" data-section="about" class="py-24 px-6 bg-[var(--surface)]/30">
    <div class="max-w-4xl mx-auto space-y-12">
      <div class="flex items-center gap-4">
        <div class="h-px flex-1 bg-[var(--primary)]/20"></div>
        <span class="text-xs font-black uppercase tracking-[0.4em] text-[var(--primary)]">${content.label || 'My Philosophy'}</span>
        <div class="h-px flex-1 bg-[var(--primary)]/20"></div>
      </div>
      <div class="space-y-8">
        <h2 class="text-4xl md:text-6xl font-black text-center leading-tight uppercase" data-field="about-title">${content.title || 'Driving innovation through design'}</h2>
        <div class="text-xl md:text-2xl opacity-70 leading-relaxed text-center font-medium max-w-3xl mx-auto" data-field="about-content">
          ${content.content || 'Share your professional story and what drives you.'}
        </div>
      </div>
    </div>
  </section>
`;

export const ABOUT_STATS = (content: any) => {
    const stats = content.stats || [];
    return `
  <section id="about" data-section="about" class="py-24 px-6">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div class="space-y-8">
        <h2 class="text-5xl md:text-7xl font-black uppercase tracking-tighter" data-field="about-title">${content.title || 'By the Numbers'}</h2>
        <p class="text-xl opacity-60 leading-relaxed" data-field="about-description">${content.description || content.content || 'Proven track record of delivering exceptional results.'}</p>
      </div>
      <div class="grid grid-cols-2 gap-8">
        ${stats.map((stat: any) => `
          <div class="p-8 bg-[var(--surface)] border border-[var(--text)]/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center group hover:bg-[var(--primary)] transition-all duration-500">
            <span class="text-5xl font-black mb-2 group-hover:text-[var(--bg)] transition-colors">${stat.value}</span>
            <span class="text-xs font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-[var(--bg)]">${stat.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
};

export const ABOUT_IMAGE_WRAP = (content: any) => `
  <section id="about" data-section="about" class="py-24 px-6 overflow-hidden">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
      <div class="lg:col-span-5 relative">
        <div class="absolute -top-10 -left-10 w-40 h-40 bg-[var(--primary)]/20 rounded-full blur-[80px]"></div>
        <img src="${content.image}" class="relative z-10 w-full aspect-[4/5] object-cover rounded-[3rem] shadow-2xl skew-y-2" data-field="about-image" />
      </div>
      <div class="lg:col-span-7 space-y-8">
        <h2 class="text-5xl md:text-6xl font-black tracking-tighter uppercase" data-field="about-title">${content.title || 'About Me'}</h2>
        <div class="text-xl opacity-60 leading-relaxed space-y-6" data-field="about-content">
          ${content.content || 'I am a creative professional dedicated to excellence in every project.'}
        </div>
        <div class="grid grid-cols-2 gap-8 pt-8 border-t border-[var(--text)]/10">
           ${(content.highlights || []).map((h: string) => `
              <div class="flex items-center gap-3">
                 <div class="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></div>
                 <span class="font-bold text-sm uppercase tracking-widest">${h}</span>
              </div>
           `).join('')}
        </div>
      </div>
    </div>
  </section>
`;

export const ABOUT_GLASS_DECONSTRUCTED = (content: any) => `
  <section id="about" data-section="about" class="py-32 px-6 relative">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
        <div class="space-y-12">
          <div class="space-y-6">
            <h2 class="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">${content.title || 'My Story'}</h2>
            <p class="text-2xl font-bold text-[var(--primary)] uppercase tracking-widest">${content.label || 'The Origin'}</p>
          </div>
          <div class="prose prose-2xl prose-invert opacity-70 leading-relaxed font-medium" data-field="about-content">
            ${content.content || 'From humble beginnings to global impact, this is the journey so far.'}
          </div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-tr from-[var(--primary)]/30 to-transparent blur-[120px] rounded-full"></div>
          <div class="grid grid-cols-2 gap-8 relative z-10">
            <div class="space-y-8 mt-12">
              <div class="aspect-square bg-[var(--surface)]/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                <img src="${content.image || content.image1}" class="w-full h-full object-cover" />
              </div>
              <div class="p-8 bg-[var(--primary)] text-[var(--bg)] rounded-[2rem] shadow-2xl">
                <p class="text-4xl font-black mb-1">10+</p>
                <p class="text-[10px] font-black uppercase tracking-widest opacity-60">Years of Mastery</p>
              </div>
            </div>
            <div class="space-y-8">
              <div class="p-8 bg-[var(--surface)]/80 backdrop-blur-3xl border border-white/20 rounded-[2rem] shadow-2xl">
                <p class="text-xs font-black uppercase tracking-widest opacity-60 mb-4">Core Principles</p>
                <ul class="space-y-4">
                  ${(content.highlights || ['Excellence', 'Speed', 'Precision']).map((h: string) => `
                    <li class="flex items-center gap-3 font-bold text-sm uppercase tracking-wider">
                       <div class="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></div> ${h}
                    </li>
                  `).join('')}
                </ul>
              </div>
              <div class="aspect-[4/5] bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl">
                <img src="${content.image2 || content.image}" class="w-full h-full object-cover grayscale" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`;

export const ABOUT_TIMELINE_PERSONAL = (content: any) => {
    const items = content.timeline || content.items || [];
    return `
   <section id="about" data-section="about" class="py-24 px-6 bg-[var(--surface)]/10">
     <div class="max-w-4xl mx-auto space-y-20">
       <h2 class="text-4xl font-black uppercase text-center">${content.title || 'My Journey'}</h2>
       <div class="space-y-12 relative before:absolute before:left-0 md:before:left-1/2 before:w-px before:h-full before:bg-[var(--text)]/10">
         ${items.map((item: any, i: number) => `
           <div class="relative pl-8 md:pl-0 md:grid md:grid-cols-2 md:gap-12 items-center">
              <div class="absolute left-[-4px] md:left-1/2 md:translate-x-[-50%] w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]"></div>
              <div class="${i % 2 === 0 ? 'md:text-right' : 'md:order-2'}">
                 <span class="text-xs font-black uppercase text-[var(--primary)] opacity-60">${item.year}</span>
                 <h3 class="text-2xl font-black uppercase">${item.title}</h3>
                 <p class="text-sm opacity-50 space-y-2">${item.description}</p>
              </div>
           </div>
         `).join('')}
       </div>
     </div>
   </section>
   `;
};

export const ABOUT_SPLIT_COLUMNS = (content: any) => `
  <section id="about" data-section="about" class="py-24 px-6">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
      <div class="space-y-8">
         <h2 class="text-6xl font-black uppercase leading-none italic">${content.title || 'Philosophy'}</h2>
         <div class="h-1 w-20 bg-black"></div>
         <p class="text-2xl font-medium opacity-80 leading-relaxed">${content.tagline || 'Breaking boundaries through design and technology.'}</p>
      </div>
      <div class="space-y-8 text-xl opacity-60 leading-relaxed">
         ${content.content || 'I believe that good design is invisible. It just works.'}
         <div class="pt-8">
            <img src="${content.image}" class="w-full h-[400px] object-cover rounded-[3rem] shadow-2xl" />
         </div>
      </div>
    </div>
  </section>
`;

export const ABOUT_QUOTE_FOCUS = (content: any) => `
  <section id="about" data-section="about" class="py-32 px-6 bg-black text-white text-center">
    <div class="max-w-5xl mx-auto space-y-12">
       <span class="text-6xl font-serif italic text-teal-400 opacity-40">"</span>
       <h2 class="text-4xl md:text-6xl font-bold leading-tight tracking-tight">${content.quote || content.title || 'Design is intelligence made visible.'}</h2>
       <div class="h-px w-24 bg-white/20 mx-auto"></div>
       <p class="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">${content.content}</p>
       <div class="flex items-center justify-center gap-4 pt-8">
          <img src="${content.image}" class="w-16 h-16 rounded-full object-cover grayscale" />
          <div class="text-left">
             <p class="font-black uppercase tracking-widest text-xs">${content.author || 'Prophetic Voice'}</p>
             <p class="text-[10px] opacity-40 uppercase">Visionary Lead</p>
          </div>
       </div>
    </div>
  </section>
`;

export const ABOUT_VIDEO_INTRO = (content: any) => `
  <section id="about" data-section="about" class="py-24 px-6">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
       <div class="lg:col-span-7 bg-slate-900 aspect-video rounded-[3rem] overflow-hidden relative shadow-2xl group cursor-pointer">
          <img src="${content.image}" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
          <div class="absolute inset-0 flex items-center justify-center">
             <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <div class="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-black border-b-[10px] border-b-transparent ml-1"></div>
             </div>
          </div>
       </div>
       <div class="lg:col-span-5 space-y-8">
          <h2 class="text-5xl font-black uppercase tracking-tighter">${content.title || 'Watch Intro'}</h2>
          <p class="text-xl opacity-60 leading-relaxed">${content.content || 'Get a glimpse into my creative process and how I work.'}</p>
          <div class="flex gap-4">
             <div class="p-6 bg-[var(--surface)] rounded-2xl border border-white/5">
                <p class="text-2xl font-black mb-1">5M+</p>
                <p class="text-[10px] font-black uppercase opacity-40">Views</p>
             </div>
             <div class="p-6 bg-[var(--surface)] rounded-2xl border border-white/5">
                <p class="text-2xl font-black mb-1">500+</p>
                <p class="text-[10px] font-black uppercase opacity-40">Episodes</p>
             </div>
          </div>
       </div>
    </div>
  </section>
`;

export const ABOUT_METRICS_FOCUS = (content: any) => {
    const stats = content.stats || [];
    return `
   <section id="about" data-section="about" class="py-24 px-6 border-y border-[var(--text)]/5">
     <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        <div class="lg:col-span-1 space-y-6">
           <h2 class="text-6xl font-black uppercase italic leading-[0.8]">ROI<br/><span class="text-[var(--primary)]">Driven</span></h2>
           <p class="text-lg opacity-60 leading-relaxed">${content.content}</p>
        </div>
        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           ${stats.map((s: any) => `
              <div class="p-10 bg-[var(--surface)] rounded-[2.5rem] border border-white/5 flex flex-col justify-between h-[250px]">
                 <p class="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">${s.label}</p>
                 <h3 class="text-6xl font-black tracking-tighter">${s.value}</h3>
                 <div class="h-1 w-12 bg-[var(--primary)]"></div>
              </div>
           `).join('')}
        </div>
     </div>
   </section>
   `;
};

export const AboutRegistry: any = {
    ABOUT_NARRATIVE,
    ABOUT_STATS,
    ABOUT_IMAGE_WRAP,
    ABOUT_GLASS_DECONSTRUCTED,
    ABOUT_TIMELINE_PERSONAL,
    ABOUT_SPLIT_COLUMNS,
    ABOUT_QUOTE_FOCUS,
    ABOUT_VIDEO_INTRO,
    ABOUT_METRICS_FOCUS
};
