
export const PROJ_BENTO_GRID = (content: any) => {
   const items = content.items || content.projects || [];
   return `
  <section data-section="projects" class="py-24 px-6 overflow-hidden">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16 space-y-4">
        <h2 class="text-4xl md:text-6xl font-black uppercase tracking-tighter" data-field="projects-title">${content.title || 'Selected Projects'}</h2>
        <div class="h-1 w-24 bg-[var(--primary)]"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min md:h-[1200px]">
        ${items[0] ? (() => {
         const tech = Array.isArray(items[0].tech) ? items[0].tech : (items[0].technologies || items[0].tech || '').split(',').map((t: any) => t.trim()).filter(Boolean);
         return `
        <div class="md:col-span-8 md:row-span-1 bg-[var(--surface)] border border-[var(--text)]/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group shadow-xl relative min-h-[400px]">
           <img src="${items[0].image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
           <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/90 via-[var(--bg)]/20 to-transparent p-8 md:p-12 flex flex-col justify-end">
              <h3 class="text-2xl md:text-3xl font-black mb-2">${items[0].title}</h3>
              <p class="text-base md:text-lg opacity-80 mb-4 line-clamp-2 md:line-clamp-none">${items[0].description}</p>
              <div class="flex flex-wrap gap-2">
                 ${tech.map((t: string) => `<span class="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase">${t}</span>`).join('')}
              </div>
           </div>
        </div>
        `;
      })() : ''}
        ${items[1] ? `
        <div class="md:col-span-4 md:row-span-1 bg-[var(--surface)] border border-[var(--text)]/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group shadow-xl relative min-h-[300px]">
           <img src="${items[1].image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
           <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/90 via-transparent p-6 md:p-8 flex flex-col justify-end">
              <h3 class="text-xl md:text-2xl font-black mb-2">${items[1].title}</h3>
              <p class="text-sm opacity-80 line-clamp-3">${items[1].description}</p>
           </div>
        </div>
        ` : ''}
        ${items[2] ? `
        <div class="md:col-span-4 md:row-span-1 bg-[var(--surface)] border border-[var(--text)]/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group shadow-xl relative min-h-[300px]">
           <img src="${items[2].image}" class="w-full h-full object-cover" />
           <div class="absolute inset-0 bg-[var(--primary)] text-[var(--bg)] p-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center text-center">
              <h3 class="text-2xl md:text-3xl font-black mb-4">${items[2].title}</h3>
              <a href="${items[2].link}" class="text-sm font-black underline uppercase tracking-widest">View Project</a>
           </div>
        </div>
        ` : ''}
        ${items[3] ? `
        <div class="md:col-span-8 md:row-span-1 bg-[var(--surface)] border border-[var(--text)]/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative group shadow-xl min-h-[400px]">
           <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span class="text-[8rem] md:text-[15rem] font-black uppercase">WORK</span>
           </div>
           <div class="p-8 md:p-12 relative z-10 h-full flex flex-col justify-between">
              <div class="flex justify-between items-start">
                 <h3 class="text-3xl md:text-5xl font-black max-w-md">${items[3].title}</h3>
                 <span class="text-4xl md:text-6xl font-black opacity-10">04</span>
              </div>
              <div>
                 <p class="text-lg md:text-xl opacity-60 mb-8 max-w-xl line-clamp-3 md:line-clamp-none">${items[3].description}</p>
                 <a href="${items[3].link}" class="inline-flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] group-hover:gap-6 transition-all">
                    Explore Case Study <span class="text-2xl text-[var(--primary)]">→</span>
                 </a>
              </div>
           </div>
        </div>
        ` : ''}
      </div>
    </div>
  </section>
  `;
};

export const PROJ_MINIMAL_CARDS = (content: any) => {
   const items = content.items || content.projects || [];
   return `
  <section data-section="projects" class="py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-8">
        <h2 class="text-5xl md:text-8xl font-black tracking-tighter uppercase" data-field="projects-title">${content.title || 'Work'}</h2>
        <p class="text-lg md:text-xl opacity-60 max-w-md pb-4 border-b border-[var(--text)]/10" data-field="projects-description">
           Digital masterpieces crafted with precision and purpose.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        ${items.map((item: any, i: number) => {
      const tech = Array.isArray(item.tech) ? item.tech : (item.technologies || item.tech || '').split(',').map((t: any) => t.trim()).filter(Boolean);
      return `
          <div class="group cursor-pointer">
            <div class="aspect-[4/5] overflow-hidden rounded-[2rem] bg-[var(--surface)] mb-8 border border-[var(--text)]/5 relative shadow-lg hover:shadow-2xl transition-all duration-500">
              <img src="${item.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-300 z-10">
                 <span class="text-[var(--bg)] text-xl font-bold">↗</span>
              </div>
              <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div class="space-y-3 px-2">
              <div class="flex flex-wrap gap-2">
                ${tech.slice(0, 3).map((t: string) => `<span class="text-[10px] font-black px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md uppercase tracking-widest">${t}</span>`).join('')}
              </div>
              <h3 class="text-2xl md:text-3xl font-black tracking-tight group-hover:text-[var(--primary)] transition-colors">${item.title}</h3>
              <p class="text-sm opacity-50 line-clamp-2 leading-relaxed">${item.description}</p>
            </div>
          </div>
        `;
   }).join('')}
      </div>
    </div>
  </section>
  `;
};

export const PROJ_STACKED_LIST = (content: any) => {
   const items = content.items || content.projects || [];
   return `
  <section data-section="projects" class="py-24 px-6 border-t border-[var(--text)]/5">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-xs font-black uppercase tracking-[0.5em] text-[var(--primary)] mb-20 text-center" data-field="projects-subtitle">Archive of Projects</h2>
      <div class="space-y-px bg-[var(--text)]/5">
        ${items.map((item: any) => {
      const tech = Array.isArray(item.tech) ? item.tech : (item.technologies || item.tech || '').split(',').map((t: any) => t.trim()).filter(Boolean);
      return `
          <div class="bg-[var(--bg)] py-16 group flex flex-col md:flex-row gap-12 items-center hover:px-8 transition-all duration-500 cursor-pointer border-b border-[var(--text)]/5">
            <div class="w-full md:w-1/3 aspect-video overflow-hidden rounded-xl bg-[var(--surface)]">
               <img src="${item.image}" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <div class="flex-1 space-y-4">
               <div class="flex justify-between items-start">
                  <h3 class="text-4xl font-black group-hover:text-[var(--primary)] transition-colors">${item.title}</h3>
                  <span class="text-sm font-mono opacity-40">${item.year || '2024'}</span>
               </div>
               <p class="text-lg opacity-50 max-w-xl">${item.description}</p>
               <div class="flex gap-4">
                  ${tech.map((t: string) => `<span class="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">${t}</span>`).join('')}
               </div>
            </div>
          </div>
        `;
   }).join('')}
      </div>
    </div>
  </section>
  `;
};

export const PROJ_CAROUSEL_FULLSCREEN = (content: any) => {
   const items = content.items || [];
   return `
   <section data-section="projects" class="py-24 px-6 relative overflow-hidden">
      <div class="max-w-7xl mx-auto mb-20">
         <h2 class="text-8xl font-black uppercase tracking-tighter opacity-10 absolute -top-10 left-0 leading-none">PROJECTS</h2>
         <h3 class="text-4xl font-black relative z-10" data-field="projects-title">Portfolio Favorites</h3>
      </div>
      <div class="flex gap-8 overflow-x-auto pb-12 no-scrollbar px-6">
         ${items.map((item: any) => `
            <div class="min-w-[400px] md:min-w-[600px] h-[700px] bg-[var(--surface)] rounded-[3rem] overflow-hidden relative group shrink-0 shadow-2xl">
               <img src="${item.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
               <div class="absolute inset-0 bg-gradient-to-tr from-[var(--bg)] via-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
               <div class="absolute bottom-12 left-12 right-12 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <h4 class="text-5xl font-black mb-4 uppercase italic tracking-tighter">${item.title}</h4>
                  <p class="text-lg opacity-80 mb-8 line-clamp-3">${item.description}</p>
                  <a href="${item.link}" class="px-8 py-4 bg-[var(--primary)] text-[var(--bg)] font-black uppercase tracking-widest rounded-2xl inline-block hover:scale-110 transition-transform">Details</a>
               </div>
            </div>
         `).join('')}
      </div>
   </section>
   `;
};

export const PROJ_GITHUB_STYLE = (content: any) => {
   const items = content.items || content.projects || [];
   return `
   <section data-section="projects" class="py-24 px-6 font-mono">
      <div class="max-w-6xl mx-auto">
         <div class="flex border-b border-[var(--text)]/10 mb-12 pb-4 items-center gap-4">
            <span class="text-[var(--primary)]">λ</span>
            <h2 class="text-xl font-bold uppercase tracking-widest" data-field="projects-title">Repository of Builds</h2>
         </div>
         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${items.map((item: any) => {
      const tech = Array.isArray(item.tech) ? item.tech : (item.technologies || item.tech || '').split(',').map((t: any) => t.trim()).filter(Boolean);
      return `
               <div class="p-8 bg-[var(--surface)] border border-[var(--text)]/10 rounded-xl hover:border-[var(--primary)]/50 transition-all group relative overflow-hidden">
                  <div class="absolute top-0 left-0 w-1 h-full bg-[var(--primary)] transition-all scale-y-0 group-hover:scale-y-100"></div>
                  <div class="flex justify-between mb-4">
                     <h3 class="text-lg font-black text-[var(--primary)] underline decoration-2 underline-offset-4">${item.title}</h3>
                     <span class="text-[10px] px-2 py-0.5 border border-[var(--text)]/10 rounded-full font-bold uppercase">Public</span>
                  </div>
                  <p class="text-sm opacity-60 mb-6 h-10 line-clamp-2">${item.description}</p>
                  <div class="flex items-center gap-4 text-[10px] font-bold">
                     <div class="flex items-center gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-[var(--primary)]"></div>
                        <span>${tech[0] || 'Modern Tech'}</span>
                     </div>
                     <span class="opacity-40">Modified 2 days ago</span>
                  </div>
               </div>
            `;
   }).join('')}
         </div>
      </div>
   </section>
   `;
};

export const PROJ_MASONRY = (content: any) => {
   const items = content.items || content.projects || [];
   return `
   <section data-section="projects" class="py-24 px-6 bg-[var(--surface)]/10">
     <div class="max-w-7xl mx-auto space-y-16">
       <h2 class="text-4xl font-black uppercase tracking-widest text-center">${content.title || 'Creative Portfolio'}</h2>
       <div class="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
         ${items.map((item: any) => `
           <div class="break-inside-avoid bg-[var(--surface)] rounded-[2rem] overflow-hidden group shadow-lg hover:shadow-2xl transition-all">
             <img src="${item.image}" class="w-full h-auto object-cover group-hover:scale-105 transition-transform" />
             <div class="p-8 space-y-4">
                <h3 class="text-2xl font-black uppercase">${item.title}</h3>
                <p class="text-sm opacity-60 leading-relaxed">${item.description}</p>
             </div>
           </div>
         `).join('')}
       </div>
     </div>
   </section>
   `;
};

export const PROJ_CASE_STUDY = (content: any) => {
   const items = content.items || content.projects || [];
   return `
   <section data-section="projects" class="py-24 px-6 border-y border-[var(--text)]/5">
     <div class="max-w-5xl mx-auto space-y-32">
       ${items.slice(0, 3).map((item: any, i: number) => `
         <div class="group grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div class="md:col-span-7 ${i % 2 === 0 ? '' : 'md:order-2'} aspect-video bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl">
               <img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            </div>
            <div class="md:col-span-5 ${i % 2 === 0 ? '' : 'md:order-1'} space-y-8">
               <div class="space-y-2">
                  <p class="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)]">Case Study ${i + 1}</p>
                  <h3 class="text-4xl md:text-5xl font-black uppercase leading-none">${item.title}</h3>
               </div>
               <p class="text-xl opacity-60 leading-relaxed">${item.description}</p>
               <a href="${item.link}" class="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest border-b-2 border-[var(--primary)] pb-2 hover:gap-6 transition-all">Read Process <span>→</span></a>
            </div>
         </div>
       `).join('')}
     </div>
   </section>
   `;
};

export const PROJ_THUMBNAIL_GRID = (content: any) => {
   const items = content.items || content.projects || [];
   return `
   <section data-section="projects" class="py-24 px-6">
     <div class="max-w-7xl mx-auto">
       <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
         ${items.map((item: any) => `
           <div class="aspect-square relative group overflow-hidden cursor-pointer">
              <img src="${item.image}" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-[var(--primary)] opacity-0 group-hover:opacity-90 transition-opacity flex flex-col justify-center items-center text-center p-4">
                 <h4 class="text-[10px] font-black uppercase text-[var(--bg)]">${item.title}</h4>
              </div>
           </div>
         `).join('')}
       </div>
     </div>
   </section>
   `;
};

export const PROJ_FEATURED_SINGLE = (content: any) => {
   const items = content.items || content.projects || [];
   const item = items[0] || {};
   return `
   <section data-section="projects" class="py-24 px-6">
     <div class="max-w-7xl mx-auto">
        <div class="relative h-[80vh] flex items-center justify-center text-center overflow-hidden rounded-[4rem] shadow-2xl">
           <img src="${item.image}" class="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-[20s] hover:scale-125" />
           <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg)] to-transparent"></div>
           <div class="relative z-10 max-w-3xl space-y-8 px-6">
              <span class="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 text-white">Latest Masterpiece</span>
              <h3 class="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter">${item.title}</h3>
              <p class="text-xl text-white/60 leading-relaxed font-medium">${item.description}</p>
              <div class="pt-8">
                 <a href="${item.link}" class="px-12 py-5 bg-[var(--primary)] text-[var(--bg)] rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform">See it live</a>
              </div>
           </div>
        </div>
     </div>
   </section>
   `;
};

export const PROJ_TIMELINE_VERTICAL = (content: any) => {
   const items = content.items || content.projects || [];
   return `
   <section data-section="projects" class="py-24 px-6">
     <div class="max-w-4xl mx-auto space-y-24 relative before:absolute before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-[var(--text)]/10">
       ${items.map((item: any, i: number) => `
         <div class="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div class="absolute left-1/2 -top-4 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--bg)] border-4 border-[var(--primary)] z-10 flex items-center justify-center font-black text-[10px]">
               ${i + 1}
            </div>
            <div class="${i % 2 === 0 ? 'md:text-right' : 'md:order-2'}">
               <h3 class="text-3xl font-black uppercase mb-4">${item.title}</h3>
               <p class="text-base opacity-60 leading-relaxed">${item.description}</p>
            </div>
            <div class="${i % 2 === 0 ? '' : 'md:order-1'} aspect-video rounded-3xl overflow-hidden shadow-xl">
               <img src="${item.image}" class="w-full h-full object-cover" />
            </div>
         </div>
       `).join('')}
     </div>
   </section>
   `;
};

export const PROJ_3D_PERSPECTIVE = (content: any) => {
   const items = content.items || content.projects || [];
   return `
   <section data-section="projects" class="py-24 px-6 overflow-hidden">
     <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        ${items.map((item: any) => `
           <div class="group relative" style="perspective: 1000px">
              <div class="relative aspect-[3/4] rounded-[3rem] overflow-hidden bg-slate-900 border border-white/10 transition-all duration-700 transform-gpu group-hover:rotate-y-12 group-hover:rotate-x-6 group-hover:-translate-y-4 group-hover:shadow-[20px_20px_60px_rgba(0,0,0,0.5)]">
                 <img src="${item.image}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                 <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex flex-col justify-end p-10">
                    <h4 class="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">${item.title}</h4>
                    <p class="text-sm text-white/50 font-medium">${item.description}</p>
                 </div>
              </div>
           </div>
        `).join('')}
     </div>
   </section>
   `;
};

export const PROJ_LIST_PREVIEW = (content: any) => {
   const items = content.items || content.projects || [];
   return `
   <section data-section="projects" class="py-24 px-6">
     <div class="max-w-5xl mx-auto">
        <h2 class="text-xs font-black uppercase tracking-[0.5em] opacity-30 mb-20 text-center">Selected Projects (0${items.length})</h2>
        <div class="space-y-1">
           ${items.map((item: any, i: number) => `
              <div class="group py-12 border-b border-black/5 flex justify-between items-center cursor-pointer hover:px-8 transition-all">
                 <div class="flex items-baseline gap-12">
                    <span class="text-[10px] font-black opacity-20">0${i + 1}</span>
                    <h3 class="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none group-hover:text-[var(--primary)] transition-colors">${item.title}</h3>
                 </div>
                 <div class="hidden md:block w-48 aspect-video rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 -translate-x-12 group-hover:translate-x-0 transition-all scale-75 group-hover:scale-100 shadow-2xl">
                    <img src="${item.image}" class="w-full h-full object-cover" />
                 </div>
              </div>
           `).join('')}
        </div>
     </div>
   </section>
   `;
};

export const PROJ_OVERLAP_SLOTS = (content: any) => {
   const items = content.items || content.projects || [];
   return `
   <section data-section="projects" class="py-24 px-6">
     <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4">
        ${items.slice(0, 4).map((item: any, i: number) => `
           <div class="${i === 0 || i === 3 ? 'md:col-span-7' : 'md:col-span-5'} aspect-video overflow-hidden rounded-[3rem] group relative shadow-xl hover:shadow-2xl transition-all">
              <img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-center items-center text-center p-12">
                 <h3 class="text-3xl font-black text-white uppercase italic mb-4">${item.title}</h3>
                 <p class="text-sm text-white/70">${item.description}</p>
                 <a href="${item.link || '#'}" class="mt-8 px-8 py-3 bg-[var(--primary)] text-black rounded-xl font-black uppercase text-[10px] tracking-widest">Case Study</a>
              </div>
           </div>
        `).join('')}
     </div>
   </section>
   `;
};

export const ProjectRegistry: any = {
   PROJ_BENTO_GRID,
   PROJ_MINIMAL_CARDS,
   PROJ_STACKED_LIST,
   PROJ_CAROUSEL_FULLSCREEN,
   PROJ_GITHUB_STYLE,
   PROJ_MASONRY,
   PROJ_CASE_STUDY,
   PROJ_THUMBNAIL_GRID,
   PROJ_FEATURED_SINGLE,
   PROJ_TIMELINE_VERTICAL,
   PROJ_3D_PERSPECTIVE,
   PROJ_LIST_PREVIEW,
   PROJ_OVERLAP_SLOTS
};

