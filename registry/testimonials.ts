
export const TESTIMONIALS_BENTO = (content: any) => {
    const items = content.items || [];
    return `
      <section data-section="testimonials" class="py-24 px-6 bg-[var(--surface)]/10">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <h2 class="text-5xl font-black uppercase italic tracking-tighter" data-field="testimonials-title">${content.title || 'Client Feedback'}</h2>
            <p class="text-sm font-bold opacity-40 uppercase tracking-widest">Verified Endorsements</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${items.map((item: any, i: number) => `
              <div class="p-10 bg-[var(--bg)] border border-[var(--text)]/5 rounded-[2.5rem] shadow-xl ${i === 1 ? 'md:scale-105 relative z-10 border-[var(--primary)]/20' : ''}">
                <div class="flex gap-1 text-[var(--primary)] mb-6">
                   ${Array(5).fill('★').join('')}
                </div>
                <p class="text-lg font-medium italic opacity-80 mb-8 leading-relaxed">"${item.text || item.quote || item.content || 'Missing testimonial text.'}"</p>
                <div class="flex items-center gap-4">
                   <div class="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                      <img src="${item.avatar || item.image}" class="w-full h-full object-cover" />
                   </div>
                   <div>
                      <p class="font-black uppercase text-xs tracking-widest">${item.author || item.name || 'Anonymous'}</p>
                      <p class="text-[10px] opacity-40 uppercase font-black">${item.role} ${item.company ? `@ ${item.company}` : ''}</p>
                   </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
};

export const TESTIMONIALS_CAROUSEL = (content: any) => {
    const items = content.items || [];
    return `
   <section data-section="testimonials" class="py-24 px-6 overflow-hidden">
     <div class="max-w-7xl mx-auto space-y-16">
        <h2 class="text-xs font-black uppercase tracking-[0.5em] opacity-40 text-center">Global Commendations</h2>
        <div class="flex gap-8 overflow-x-auto no-scrollbar pb-12">
           ${items.map((item: any) => `
              <div class="min-w-[320px] md:min-w-[450px] p-12 bg-[var(--surface)] border border-white/5 rounded-[4rem] flex flex-col justify-between shrink-0 group hover:border-[var(--primary)] transition-all">
                 <p class="text-2xl font-medium leading-relaxed italic opacity-80 mb-12">"${item.text}"</p>
                 <div class="flex items-center gap-6">
                    <img src="${item.avatar}" class="w-16 h-16 rounded-3xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div>
                       <p class="font-black uppercase text-xs tracking-widest">${item.author}</p>
                       <p class="text-[10px] opacity-40 uppercase font-black">${item.role}</p>
                    </div>
                 </div>
              </div>
           `).join('')}
        </div>
     </div>
   </section>
   `;
};

export const TESTIMONIALS_GRID_PHOTOS = (content: any) => {
    const items = content.items || [];
    return `
   <section data-section="testimonials" class="py-24 px-6 bg-[var(--surface)]/30">
     <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${items.map((item: any) => `
           <div class="space-y-8 p-6">
              <div class="aspect-square rounded-[3rem] overflow-hidden shadow-2xl skew-x-1">
                 <img src="${item.avatar}" class="w-full h-full object-cover" />
              </div>
              <div class="space-y-4">
                 <p class="text-lg opacity-60 leading-relaxed italic">"${item.text}"</p>
                 <div class="flex items-center gap-4">
                    <div class="h-px w-8 bg-[var(--primary)]"></div>
                    <p class="font-black uppercase text-[10px] tracking-widest">${item.author}, ${item.company}</p>
                 </div>
              </div>
           </div>
        `).join('')}
     </div>
   </section>
   `;
};

export const TESTIMONIALS_QUOTE_WALL = (content: any) => {
    const items = content.items || [];
    return `
   <section data-section="testimonials" class="py-24 px-6 overflow-hidden">
     <div class="max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        ${items.map((item: any) => `
           <div class="break-inside-avoid p-10 bg-[var(--surface)] border border-white/5 rounded-3xl space-y-6">
              <div class="flex gap-1 text-[var(--primary)] text-xs">
                 ${Array(5).fill('★').join('')}
              </div>
              <p class="text-base opacity-70 leading-relaxed italic">"${item.text}"</p>
              <div class="flex items-center gap-4">
                 <div class="w-10 h-10 rounded-full bg-[var(--bg)] flex items-center justify-center font-black text-xs uppercase">${item.author ? item.author[0] : 'U'}</div>
                 <p class="font-black uppercase text-[10px] tracking-widest opacity-60">${item.author}</p>
              </div>
           </div>
        `).join('')}
     </div>
   </section>
   `;
};

export const TESTIMONIALS_AGENCY_QUOTES = (content: any) => `
    <section data-section="testimonials" class="py-24 px-6 bg-red-600 text-white">
         <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
            <div class="md:w-1/3">
                <h2 class="text-4xl font-black mb-6" data-field="test-title">${content.title || 'Client Love'}</h2>
                <p class="text-lg opacity-90" data-field="test-desc">${content.desc || "Don't just take my word for it. Here's what founders are saying."}</p>
                <div class="mt-8 flex gap-2 text-2xl">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </div>
            </div>
            <div class="md:w-2/3 grid gap-8">
                 ${(content.testimonials || []).map((t: any) => `
                 <blockquote class="bg-white text-black p-8 rounded-2xl shadow-xl last:bg-black/20 last:backdrop-blur-lg last:border last:border-white/20 last:text-white">
                    <p class="text-xl font-bold italic mb-6">"${t.quote}"</p>
                    <cite class="flex items-center gap-4 not-italic">
                        ${t.image ? `<img src="${t.image}" class="w-12 h-12 rounded-full border-2 border-red-100" />` : ''}
                        <div>
                            <div class="font-bold">${t.name}</div>
                            <div class="text-xs uppercase tracking-wide opacity-70">${t.role}</div>
                        </div>
                    </cite>
                 </blockquote>
                 `).join('')}
            </div>
         </div>
    </section>
`;

export const TESTIMONIALS_MINIMAL_SINGLE = (content: any) => `
    <section data-section="testimonials" class="py-20 px-6 bg-[#fafaf9]">
        <div class="max-w-3xl mx-auto text-center">
            <i class="fas fa-quote-left text-4xl text-stone-300 mb-8"></i>
            ${(content.testimonials || []).map((t: any) => `
            <div class="mb-12 last:mb-0">
                <p class="text-2xl font-serif italic text-stone-800 mb-8 leading-relaxed">
                    "${t.quote}"
                </p>
                <div class="font-bold text-stone-900">${t.name}</div>
                <div class="text-sm text-stone-500">${t.role}</div>
            </div>
            `).join('')}
        </div>
    </section>
`;

export const TestimonialRegistry: any = {
    TESTIMONIALS_BENTO,
    TESTIMONIALS_CAROUSEL,
    TESTIMONIALS_GRID_PHOTOS,
    TESTIMONIALS_QUOTE_WALL,
    TESTIMONIALS_AGENCY_QUOTES,
    TESTIMONIALS_MINIMAL_SINGLE
};
