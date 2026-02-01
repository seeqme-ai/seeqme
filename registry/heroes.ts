export const HERO_MODERN_SPLIT = (content: any) => `
  <section data-section="hero" class="relative min-h-[80vh] flex items-center py-12 md:py-24 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 w-full flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div class="space-y-6 md:space-y-8 relative z-10 w-full text-center lg:text-left">
        <h1 class="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase break-words" data-field="hero-name">
          ${content.name}
        </h1>
        <p class="text-lg md:text-2xl font-medium opacity-80" data-field="hero-title">
          ${content.title}
        </p>
        <p class="text-base md:text-lg opacity-60 leading-relaxed max-w-xl mx-auto lg:mx-0" data-field="hero-bio">
          ${content.bio}
        </p>
        <div class="pt-4">
          <a href="${content.cta?.link || '#'}" class="inline-block px-8 py-4 md:px-10 md:py-5 bg-[var(--primary)] text-[var(--bg)] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-[var(--primary)]/20" data-field="hero-ctaText">
            ${content.cta?.text || 'Review Work'}
          </a>
        </div>
      </div>
      <div class="relative w-full aspect-square max-w-md lg:max-w-full mx-auto">
        <div class="absolute inset-0 bg-gradient-to-tr from-[var(--primary)] to-transparent opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <img src="${content.image}" class="relative z-10 w-full h-full object-cover rounded-[2rem] md:rounded-[3rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500" data-field="hero-image" />
      </div>
    </div>
  </section>
`;

export const HERO_CENTERED_MINIMAL = (content: any) => `
  <section data-section="hero" class="min-h-[70vh] flex flex-col items-center justify-center text-center py-16 md:py-24">
    <div class="max-w-4xl mx-auto px-6 space-y-8">
      <div class="w-20 h-20 md:w-24 md:h-24 mx-auto mb-8 rounded-full border-4 border-[var(--primary)] p-1 overflow-hidden" data-field="hero-image-wrap">
        <img src="${content.image}" class="w-full h-full object-cover rounded-full" data-field="hero-image" />
      </div>
      <h1 class="text-4xl md:text-7xl font-black tracking-tight" data-field="hero-name">
        ${content.name}
      </h1>
      <p class="text-xl md:text-2xl font-bold text-[var(--primary)] uppercase tracking-widest" data-field="hero-title">
        ${content.title}
      </p>
      <p class="text-lg md:text-xl opacity-60 max-w-2xl mx-auto leading-relaxed" data-field="hero-bio">
         ${content.bio}
      </p>
      <div class="pt-8">
         <a href="${content.cta?.link || '#'}" class="px-8 py-4 border-2 border-[var(--primary)] text-[var(--primary)] font-bold uppercase tracking-widest rounded-full hover:bg-[var(--primary)] hover:text-[var(--bg)] transition-all" data-field="hero-ctaText">
            ${content.cta?.text || 'Get in Touch'}
         </a>
      </div>
    </div>
  </section>
`;

export const HERO_CYBER_MONO = (content: any) => `
  <section data-section="hero" class="min-h-screen flex items-center py-24 px-6 font-mono overflow-hidden relative">
   <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0); background-size: 40px 40px;"></div>
    <div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-12 items-center relative z-10">
      <div class="lg:col-span-1 space-y-6">
        <div class="inline-block px-3 py-1 bg-[var(--primary)] text-[var(--bg)] text-xs font-bold uppercase">
          PROTOCOL: SECURE_ID
        </div>
        <h1 class="text-4xl md:text-7xl font-black tracking-tighter uppercase" data-field="hero-name">
           <span class="text-[var(--primary)]">></span> ${content.name}
        </h1>
        <div class="p-6 bg-[var(--surface)] border border-[var(--primary)]/20 rounded-lg backdrop-blur-sm">
           <pre class="text-xs md:text-sm leading-relaxed overflow-x-auto"><code class="text-[var(--text)]">
{
  "role": "${content.title}",
  "status": "Available",
  "location": "Distributed",
  "bio": "${content.bio}"
}
           </code></pre>
        </div>
        <div class="pt-4 flex gap-6">
           <a href="${content.cta?.link || '#'}" class="text-[var(--primary)] border-b-2 border-[var(--primary)] pb-1 hover:opacity-70 transition-opacity" data-field="hero-ctaText">
              [ EXECUTE_CTA: ${content.cta?.text} ]
           </a>
        </div>
      </div>
      ${content.image ? `
      <div class="lg:col-span-1 flex items-center justify-center">
        <div class="relative w-full aspect-square max-w-sm">
          <div class="absolute inset-0 bg-[var(--primary)]/10 blur-[80px] rounded-full"></div>
          <img src="${content.image}" class="relative z-10 w-full h-full object-cover rounded-full border-4 border-[var(--primary)]/20 p-2" data-field="hero-image" />
        </div>
      </div>
      ` : '<div class="hidden lg:block"></div>'}
      <div class="hidden lg:block relative opacity-40 lg:col-span-1">
         <div class="absolute inset-0 bg-[var(--primary)]/10 blur-[100px]"></div>
         <div class="text-[var(--primary)]/30 text-[10px] leading-none select-none overflow-hidden h-[500px]">
            ${Array(50).fill('01011001 01101111 01110101 01101110 01100111 ').join('')}
         </div>
      </div>
    </div>
  </section>
`;

export const HERO_VISUALIST = (content: any) => `
  <section data-section="hero" class="relative h-[90vh] md:h-screen flex items-end py-24 overflow-hidden">
    <div class="absolute inset-0 z-0">
      <img src="${content.image}" class="w-full h-full object-cover transition-transform duration-[20s] hover:scale-110 ease-linear" data-field="hero-image" />
      <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent"></div>
    </div>
    <div class="max-w-7xl mx-auto px-6 w-full relative z-10">
      <div class="max-w-3xl space-y-6 slide-up">
        <h1 class="text-6xl md:text-9xl font-black tracking-tighter leading-none text-[var(--heading)] drop-shadow-2xl" data-field="hero-name">
           ${content.name}
        </h1>
        <div class="flex items-center gap-6">
           <div class="h-px w-12 md:w-24 bg-[var(--primary)]"></div>
           <p class="text-xl md:text-2xl font-bold uppercase tracking-widest" data-field="hero-title">
             ${content.title}
           </p>
        </div>
        <p class="text-lg opacity-80 max-w-xl" data-field="hero-bio">
           ${content.bio}
        </p>
      </div>
    </div>
  </section>
`;

export const HERO_EXECUTIVE = (content: any) => `
  <section data-section="hero" class="py-32 px-6 border-b border-[var(--primary)]/10">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        <div class="lg:col-span-2 space-y-6">
          <p class="text-[var(--primary)] text-sm font-black uppercase tracking-[0.3em]" data-field="hero-title-above">
            ${content.title}
          </p>
          <h1 class="text-6xl md:text-[8vw] font-black tracking-tighter leading-[0.85] uppercase" data-field="hero-name">
             ${content.name}
          </h1>
        </div>
        <div class="max-w-md space-y-8 lg:col-span-1">
           <p class="text-xl opacity-60 leading-relaxed italic" data-field="hero-bio">
              "${content.bio}"
           </p>
           <a href="${content.cta?.link || '#'}" class="flex items-center gap-4 text-xl font-bold hover:text-[var(--primary)] transition-colors group" data-field="hero-ctaText">
              ${content.cta?.text || 'Request Consultation'}
              <span class="transform group-hover:translate-x-2 transition-transform">→</span>
           </a>
        </div>
      </div>
      ${content.image ? `
      <div class="mt-16">
        <img src="${content.image}" class="w-full h-[50vh] object-cover rounded-[2rem] shadow-2xl" data-field="hero-image" />
      </div>
      ` : ''}
    </div>
  </section>
`;

export const HERO_GLASS_FLOATING = (content: any) => `
   <section data-section="hero" class="min-h-screen relative flex items-center justify-center p-6">
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--primary)] rounded-full blur-[100px] opacity-20 animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--secondary)] rounded-full blur-[140px] opacity-20"></div>
      
      <div class="relative z-10 max-w-5xl w-full bg-[var(--surface)]/40 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 md:p-24 shadow-2xl flex flex-col md:flex-row items-center gap-16">
         <div class="w-64 h-64 md:w-80 md:h-80 shrink-0 rounded-[3rem] overflow-hidden shadow-2xl rotate-3">
            <img src="${content.image}" class="w-full h-full object-cover scale-110" data-field="hero-image" />
         </div>
         <div class="space-y-8">
            <h1 class="text-5xl md:text-7xl font-black tracking-tight" data-field="hero-name">${content.name}</h1>
            <p class="text-2xl font-semibold opacity-70" data-field="hero-title">${content.title}</p>
            <p class="text-lg opacity-60 leading-relaxed" data-field="hero-bio">${content.bio}</p>
            <button class="px-10 py-5 bg-[var(--text)] text-[var(--bg)] rounded-3xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity" data-field="hero-ctaText">
               ${content.cta?.text}
            </button>
         </div>
      </div>
   </section>
`;

export const HERO_NEOBRUTALIST = (content: any) => `
   <section data-section="hero" class="py-24 px-6">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
         <div class="lg:col-span-8 bg-[var(--primary)] border-4 border-[var(--text)] p-12 shadow-[12px_12px_0_0_var(--text)]">
            <h1 class="text-6xl md:text-9xl font-black uppercase italic leading-none mb-6" data-field="hero-name">${content.name}</h1>
            <p class="text-2xl md:text-4xl font-black border-y-4 border-[var(--text)] py-4 mb-8" data-field="hero-title">${content.title}</p>
            <p class="text-xl font-bold max-w-2xl" data-field="hero-bio">${content.bio}</p>
         </div>
         <div class="lg:col-span-4 flex flex-col gap-12">
            <div class="aspect-square bg-[var(--surface)] border-4 border-[var(--text)] shadow-[12px_12px_0_0_var(--text)] overflow-hidden">
               <img src="${content.image}" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" data-field="hero-image" />
            </div>
            <a href="${content.cta?.link}" class="bg-[var(--text)] text-[var(--bg)] p-8 text-3xl font-black text-center uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" data-field="hero-ctaText">
               ${content.cta?.text}
            </a>
         </div>
      </div>
   </section>
`;

export const HERO_MINIMAL_LEFT = (content: any) => `
   <section data-section="hero" class="py-48 px-6">
      <div class="max-w-7xl mx-auto space-y-12">
         <p class="text-xl font-medium opacity-40 uppercase tracking-[0.4em]" data-field="hero-greeting">HELL0, I AM</p>
         <h1 class="text-7xl md:text-[10vw] font-black tracking-tighter leading-none" data-field="hero-name">${content.name}</h1>
         <div class="flex flex-col md:flex-row gap-12 md:items-center justify-between border-t border-[var(--text)]/10 pt-12">
            <p class="text-2xl md:text-4xl font-bold opacity-60" data-field="hero-title">${content.title}</p>
            <div class="max-w-md">
               <p class="text-lg opacity-50 mb-8" data-field="hero-bio">${content.bio}</p>
               <a href="${content.cta?.link}" class="text-sm font-black uppercase tracking-widest flex items-center gap-4 hover:gap-6 transition-all" data-field="hero-ctaText">
                  ${content.cta?.text} <span>→</span>
               </a>
            </div>
         </div>
      </div>
   </section>
`;

export const HERO_STACKED_BOLD = (content: any) => `
   <section data-section="hero" class="min-h-screen flex flex-col justify-end p-6 md:p-12 overflow-hidden">
      <div class="absolute inset-x-0 top-0 h-[70vh] z-0">
         <img src="${content.image}" class="w-full h-full object-cover opacity-80" data-field="hero-image" />
         <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent"></div>
      </div>
      <div class="relative z-10 max-w-7xl mx-auto w-full">
         <h1 class="text-[12vw] font-black leading-[0.8] mb-8" data-field="hero-name">
            ${content.name?.split(' ').map((word: string, i: number) => `<span class="${i % 2 === 0 ? 'text-[var(--text)]' : 'text-[var(--primary)]'} block">${word}</span>`).join('')}
         </h1>
         <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            <p class="text-2xl md:text-4xl font-black opacity-80 uppercase leading-none" data-field="hero-title">
               ${content.title}
            </p>
            <div class="space-y-6">
               <p class="text-lg opacity-60 max-w-sm" data-field="hero-bio">${content.bio}</p>
               <button class="w-full md:w-auto px-12 py-5 bg-[var(--primary)] text-[var(--bg)] font-black uppercase text-xs tracking-widest rounded-full" data-field="hero-ctaText">
                  ${content.cta?.text}
               </button>
            </div>
         </div>
      </div>
   </section>
`;

export const HERO_GRID_LAYOUT = (content: any) => `
   <section data-section="hero" class="py-24 px-6">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-[800px]">
         <div class="md:col-span-2 md:row-span-2 bg-[var(--surface)] rounded-[3rem] p-12 flex flex-col justify-between border border-[var(--text)]/5 shadow-2xl overflow-hidden relative group">
            <div class="absolute inset-0 bg-[var(--primary)] opacity-0 group-hover:opacity-5 transition-opacity"></div>
            <div class="relative z-10">
               <h1 class="text-6xl md:text-7xl font-black tracking-tighter mb-4" data-field="hero-name">${content.name}</h1>
               <p class="text-xl font-bold opacity-60" data-field="hero-title">${content.title}</p>
            </div>
            <p class="relative z-10 text-lg opacity-50" data-field="hero-bio">${content.bio}</p>
         </div>
         <div class="md:col-span-2 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
            <img src="${content.image}" class="w-full h-full object-cover" data-field="hero-image" />
         </div>
         <div class="bg-[var(--primary)] rounded-[3rem] p-8 flex items-center justify-center text-center shadow-xl">
            <p class="text-[var(--bg)] font-black text-2xl uppercase tracking-tighter">Identity Architect</p>
         </div>
         <div class="bg-[var(--surface)] border border-[var(--text)]/10 rounded-[3rem] p-8 flex items-center justify-center group cursor-pointer hover:bg-[var(--primary)] transition-all">
            <a href="${content.cta?.link || '#'}" class="text-sm font-black uppercase tracking-widest group-hover:text-[var(--bg)] transition-colors" data-field="hero-ctaText">
               ${content.cta?.text || 'Explore Work'} →
            </a>
         </div>
      </div>
   </section>
`;

export const HERO_DYNAMIC_GRADIENT = (content: any) => `
   <section data-section="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg)]">
      <div class="absolute inset-0 z-0">
         <div class="absolute top-0 -left-1/4 w-full h-full bg-[var(--primary)]/10 blur-[120px] rounded-full animate-pulse"></div>
         <div class="absolute bottom-0 -right-1/4 w-full h-full bg-[var(--secondary)]/10 blur-[120px] rounded-full animate-pulse" style="animation-delay: 2s"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-12">
         <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--text)]/10 backdrop-blur-md">
            <span class="w-2 h-2 rounded-full bg-[var(--primary)] animate-ping"></span>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">${content.status || 'Available for Projects'}</span>
         </div>

         <h1 class="text-7xl md:text-[12vw] font-black tracking-tighter leading-[0.8] uppercase flex flex-col">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[var(--heading)] to-[var(--primary)]">${content.name?.split(' ')[0]}</span>
            <span class="opacity-10">${content.name?.split(' ').slice(1).join(' ')}</span>
         </h1>

         <div class="max-w-2xl mx-auto space-y-8">
            <p class="text-2xl md:text-3xl font-medium opacity-70 leading-relaxed" data-field="hero-bio">${content.bio}</p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
               <a href="${content.cta?.link || '#'}" class="w-full sm:w-auto px-12 py-6 bg-[var(--primary)] text-[var(--bg)] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-lg" data-field="hero-ctaText">
                  ${content.cta?.text || 'Explore Portfolio'}
               </a>
               <p class="text-xs font-black uppercase tracking-[0.3em] opacity-40" data-field="hero-title">${content.title}</p>
            </div>
         </div>
      </div>

      <div class="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20">
         <span class="text-[10px] font-black uppercase tracking-[0.5em] rotate-90 mb-4">Scroll</span>
         <div class="w-px h-16 bg-gradient-to-b from-[var(--text)] to-transparent"></div>
      </div>
   </section>
`;

export const HERO_MINIMAL_ELEGANCE = (content: any) => `
   <section data-section="hero" class="min-h-screen flex items-center py-32 px-6">
      <div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-20">
         <div class="lg:col-span-7 space-y-12">
            <p class="text-[var(--primary)] font-black uppercase tracking-[0.4em] text-sm" data-field="hero-title">${content.title}</p>
            <h1 class="text-6xl md:text-8xl font-black tracking-tight leading-none italic" data-field="hero-name">
               ${content.name?.split(' ').map((n: string, i: number) => i === 0 ? n : `<span class="block opacity-20 not-italic">${n}</span>`).join('')}
            </h1>
            <div class="flex gap-12 items-center">
               <div class="w-20 h-px bg-[var(--text)]/20"></div>
               <p class="text-xl md:text-2xl opacity-60 leading-relaxed max-w-lg" data-field="hero-bio">${content.bio}</p>
            </div>
         </div>
         <div class="lg:col-span-5 relative">
            <div class="aspect-[4/5] overflow-hidden rounded-[4rem] group shadow-2xl">
               <img src="${content.image}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" data-field="hero-image" />
               <div class="absolute inset-0 bg-gradient-to-tr from-[var(--bg)]/40 to-transparent"></div>
            </div>
            <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--surface)] rounded-full border border-[var(--text)]/10 flex items-center justify-center p-8 backdrop-blur-xl animate-spin-slow">
               <svg viewBox="0 0 100 100" class="w-full h-full">
                  <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                  <text class="text-[10px] font-black uppercase tracking-[0.2em] fill-[var(--text)]">
                     <textPath xlink:href="#circlePath">Professional • Visionary • Expert • Creative •</textPath>
                  </text>
               </svg>
            </div>
         </div>
      </div>
      <style>
         @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
         }
         .animate-spin-slow {
            animation: spin-slow 12s linear infinite;
         }
      </style>
   </section>
`;

export const HERO_TERMINAL_STYLE = (content: any) => `
   <section data-section="hero" class="min-h-screen bg-[#0d1117] text-[#58a6ff] font-mono p-6 md:p-12 flex items-center">
      <div class="max-w-4xl mx-auto w-full bg-[#161b22] rounded-xl border border-[#30363d] shadow-2xl overflow-hidden">
         <div class="bg-[#21262d] px-4 py-2 flex gap-2 border-b border-[#30363d]">
            <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            <span class="ml-4 text-[10px] text-gray-500 uppercase tracking-widest">seeqme_cli_v1.0</span>
         </div>
         <div class="p-8 md:p-12 space-y-4">
            <div class="flex gap-4">
               <span class="text-[#8b949e]">$</span>
               <span class="text-white">whoami</span>
            </div>
            <div class="pl-8">
               <h1 class="text-3xl md:text-5xl font-bold text-[#58a6ff]" data-field="hero-name">${content.name}</h1>
            </div>
            <div class="flex gap-4 pt-4">
               <span class="text-[#8b949e]">$</span>
               <span class="text-white">describe --profile professional</span>
            </div>
            <div class="pl-8 text-[#8b949e] leading-relaxed">
               <p class="mb-2"><span class="text-[#d2a8ff]">Title:</span> ${content.title}</p>
               <p><span class="text-[#d2a8ff]">Bio:</span> ${content.bio}</p>
            </div>
            <div class="flex gap-4 pt-8">
               <span class="text-[#8b949e]">$</span>
               <span class="text-white">execute contact</span>
            </div>
            <div class="pl-8">
               <a href="${content.cta?.link || '#'}" class="inline-block px-6 py-2 border border-[#58a6ff] text-[#58a6ff] hover:bg-[#58a6ff] hover:text-white transition-all cursor-pointer">
                  ./run_callback.sh
               </a>
            </div>
         </div>
      </div>
   </section>
`;

export const HERO_VIDEO_BG = (content: any) => `
   <section data-section="hero" class="relative h-screen flex items-center justify-center text-center overflow-hidden bg-black">
      <div class="absolute inset-0 z-0">
         <!-- Fallback image as video placeholder -->
         <img src="${content.image || 'https://images.unsplash.com/photo-1492691523567-6170f0275df1?w=1600'}" class="w-full h-full object-cover opacity-40 scale-105" data-field="hero-image" />
         <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
      </div>
      <div class="relative z-10 max-w-5xl px-6 space-y-12">
         <h1 class="text-6xl md:text-[10vw] font-black tracking-tighter leading-none text-white uppercase italic" data-field="hero-name">${content.name}</h1>
         <div class="flex flex-col md:flex-row items-center justify-center gap-8">
            <p class="text-xl md:text-2xl font-bold text-teal-400 uppercase tracking-widest border-y border-teal-400/30 py-4" data-field="hero-title">${content.title}</p>
            <div class="h-px w-12 bg-white/20 hidden md:block"></div>
            <p class="text-lg text-white/60 max-w-md font-medium" data-field="hero-bio">${content.bio}</p>
         </div>
         <a href="${content.cta?.link || '#'}" class="inline-flex items-center gap-4 text-sm font-black uppercase tracking-[0.4em] text-white hover:text-teal-400 transition-colors group">
            <span class="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-teal-400">▶</span>
            ${content.ctaText || 'Watch Showreel'}
         </a>
      </div>
   </section>
`;

export const HERO_MAGAZINE = (content: any) => `
   <section data-section="hero" class="min-h-screen bg-[#f8f5f0] text-[#1a1a1a] p-6 md:p-12 font-serif">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 border-t-8 border-black pt-12">
         <div class="lg:col-span-8">
            <h1 class="text-[15vw] lg:text-[12vw] font-black leading-[0.8] uppercase tracking-tighter mb-8" data-field="hero-name">
               ${content.name}
            </h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mt-12">
               <div class="space-y-6">
                  <p class="text-3xl font-bold uppercase" data-field="hero-title">${content.title}</p>
                  <p class="text-xl leading-relaxed opacity-80" data-field="hero-bio">${content.bio}</p>
               </div>
               <div class="h-full flex flex-col justify-end items-end">
                  <p class="text-sm font-bold uppercase tracking-widest transform rotate-90 origin-right whitespace-nowrap mb-24 opacity-20">ISSUE NO.001 // SEEQME EDITORIAL</p>
                  <a href="${content.cta?.link || '#'}" class="px-12 py-6 bg-black text-white rounded-full font-black uppercase italic tracking-widest text-xs hover:scale-105 transition-transform shadow-2xl">
                     Full Feature
                  </a>
               </div>
            </div>
         </div>
         <div class="lg:col-span-4 relative">
            <div class="aspect-[3/4] overflow-hidden shadow-[20px_20px_0_0_#1a1a1a]">
               <img src="${content.image}" class="w-full h-full object-cover" data-field="hero-image" />
            </div>
            <div class="absolute -bottom-6 -left-6 bg-white p-6 shadow-xl max-w-[200px]">
               <p class="text-xs font-black uppercase tracking-widest mb-2 opacity-40">Location</p>
               <p class="text-sm font-bold">Based in London, UK. Working Globally.</p>
            </div>
         </div>
      </div>
   </section>
`;

export const HERO_PARALLAX_LAYERS = (content: any) => `
   <section data-section="hero" class="relative h-[120vh] overflow-hidden bg-[#020202]">
      <!-- Background Layers -->
      <div class="absolute inset-0 z-0">
         <div class="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20" 
              style="background-image: radial-gradient(circle at center, #6366f1 0%, transparent 70%);"></div>
      </div>
      
      <div class="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
         <div class="relative inline-block mb-12">
            <span class="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Pioneer of Digital Realm</span>
            <h1 class="text-8xl md:text-[14vw] font-black leading-none uppercase tracking-tighter text-white mix-blend-difference" data-field="hero-name">
               ${content.name}
            </h1>
         </div>

         <div class="grid grid-cols-1 md:grid-cols-3 gap-12 items-center w-full max-w-5xl mt-12">
            <div class="text-left space-y-4">
               <p class="text-xs font-black uppercase tracking-widest text-indigo-400">Core Expertise</p>
               <h3 class="text-2xl font-bold text-white uppercase" data-field="hero-title">${content.title}</h3>
            </div>
            <div class="relative aspect-square rounded-full border-2 border-indigo-500/20 p-4">
               <div class="absolute inset-0 rounded-full border border-indigo-500/40 animate-ping" style="animation-duration: 3s"></div>
               <img src="${content.image}" class="w-full h-full object-cover rounded-full shadow-[0_0_80px_-20px_rgba(99,102,241,0.5)]" data-field="hero-image" />
            </div>
            <div class="text-right flex flex-col items-end gap-6">
               <p class="text-sm text-white/50 leading-relaxed max-w-[250px]" data-field="hero-bio">${content.bio}</p>
               <a href="${content.cta?.link || '#'}" class="px-8 py-3 bg-indigo-600 text-white rounded-lg font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-indigo-600/30">Enter Workspace</a>
            </div>
         </div>
      </div>
   </section>
`;

export const HERO_CIRCLE_AVATAR = (content: any) => `
   <section data-section="hero" class="py-32 md:py-48 px-6 text-center">
      <div class="max-w-4xl mx-auto space-y-12">
         <div class="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-16 group">
            <div class="absolute inset-[-15px] border-2 border-dashed border-[var(--primary)]/20 rounded-full animate-spin-slow"></div>
            <div class="absolute inset-0 rounded-full shadow-2xl overflow-hidden">
               <img src="${content.image}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" data-field="hero-image" />
            </div>
            <div class="absolute bottom-4 right-4 w-12 h-12 bg-[var(--primary)] rounded-full border-4 border-[var(--bg)] flex items-center justify-center text-[var(--bg)] font-black">
               ✓
            </div>
         </div>
         <h1 class="text-5xl md:text-8xl font-black tracking-tight" data-field="hero-name">${content.name}</h1>
         <p class="text-xl md:text-2xl font-bold opacity-60 uppercase tracking-[0.2em]" data-field="hero-title">${content.title}</p>
         <div class="h-px w-24 bg-[var(--primary)] mx-auto"></div>
         <p class="text-lg md:text-xl opacity-50 max-w-2xl mx-auto leading-relaxed italic" data-field="hero-bio">
            "${content.bio}"
         </p>
         <div class="pt-12">
            <a href="${content.cta?.link || '#'}" class="text-sm font-black uppercase tracking-widest underline decoration-4 underline-offset-8 decoration-[var(--primary)] hover:text-[var(--primary)] transition-colors">
               ${content.cta?.text || 'Explore Background'}
            </a>
         </div>
      </div>
   </section>
`;

export const HERO_SPLIT_DIAGONAL = (content: any) => `
   <section data-section="hero" class="relative min-h-screen overflow-hidden flex items-center">
      <!-- Diagonal Background -->
      <div class="absolute inset-0 skew-y-6 translate-y-[-50%] bg-[var(--primary)]/5 border-b border-[var(--primary)]/10 z-0"></div>
      
      <div class="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
         <div class="space-y-10">
            <div class="inline-flex items-center gap-3 px-4 py-2 bg-[var(--surface)] border border-[var(--text)]/10 rounded-full">
               <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span class="text-[10px] font-black uppercase tracking-widest">Live Portfolio</span>
            </div>
            <h1 class="text-7xl md:text-[8vw] font-black leading-[0.8] uppercase tracking-tighter" data-field="hero-name">
               ${content.name?.split(' ').map((n: string, i: number) => i === 0 ? `<span>${n}</span>` : `<span class="block text-[var(--primary)]">${n}</span>`).join('')}
            </h1>
            <p class="text-2xl md:text-3xl font-medium opacity-60 leading-tight" data-field="hero-title">${content.title}</p>
            <p class="text-lg opacity-50 max-w-lg" data-field="hero-bio">${content.bio}</p>
            <div class="flex gap-6">
               <a href="${content.cta?.link || '#'}" class="px-10 py-5 bg-[var(--text)] text-[var(--bg)] font-black uppercase tracking-widest rounded-2xl hover:-translate-y-1 transition-transform">Get in Touch</a>
               <div class="flex -space-x-4">
                  ${[1, 2, 3].map(() => `<div class="w-12 h-12 rounded-full border-4 border-[var(--bg)] bg-slate-800"></div>`).join('')}
                  <div class="w-12 h-12 rounded-full border-4 border-[var(--bg)] bg-[var(--primary)] flex items-center justify-center text-[var(--bg)] text-xs font-bold">+12</div>
               </div>
            </div>
         </div>
         <div class="relative">
            <div class="absolute -inset-10 bg-[var(--primary)]/10 blur-[100px] rounded-full"></div>
            <div class="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl scale-95 hover:scale-100 transition-transform duration-700">
               <img src="${content.image}" class="w-full h-full object-cover" data-field="hero-image" />
            </div>
         </div>
      </div>
   </section>
`;

export const HERO_GRADIENT_TEXT = (content: any) => `
   <section data-section="hero" class="min-h-screen flex items-center justify-center text-center p-6 bg-black overflow-hidden relative">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05)_0%,transparent_70%)]"></div>
      <div class="max-w-7xl mx-auto space-y-16 relative z-10">
         <h1 class="text-8xl md:text-[18vw] font-black uppercase leading-[0.75] tracking-tightest mix-blend-screen" data-field="hero-name">
            <span class="bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-400 to-slate-800">${content.name}</span>
         </h1>
         <div class="max-w-3xl mx-auto space-y-8">
            <p class="text-2xl md:text-4xl font-bold text-white uppercase tracking-tighter" data-field="hero-title">${content.title}</p>
            <p class="text-xl text-slate-500 leading-relaxed" data-field="hero-bio">${content.bio}</p>
            <div class="pt-8">
               <a href="${content.cta?.link || '#'}" class="group relative px-12 py-6 inline-block overflow-hidden rounded-full font-black uppercase text-xs tracking-[0.2em]">
                  <div class="absolute inset-0 bg-white group-hover:bg-[#00f2ff] transition-colors"></div>
                  <span class="relative z-10 text-black">Start Discovery</span>
               </a>
            </div>
         </div>
      </div>
      <!-- Decorative background text -->
      <div class="absolute -bottom-20 -left-20 text-[30vw] font-black text-white/[0.02] select-none leading-none uppercase">BUILD</div>
   </section>
`;

export const HERO_CARD_STACK = (content: any) => `
   <section data-section="hero" class="py-32 px-6">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
         <div class="relative h-[600px] hidden md:block">
            <!-- Stacked Cards -->
            <div class="absolute top-0 right-0 w-64 h-80 bg-slate-900 rounded-3xl border border-white/10 shadow-2xl rotate-12 -translate-y-10 scale-90 opacity-40"></div>
            <div class="absolute top-20 right-20 w-64 h-80 bg-slate-800 rounded-3xl border border-white/10 shadow-2xl skew-y-6 scale-95 opacity-60"></div>
            <div class="absolute top-40 right-40 w-full h-[500px] bg-[var(--surface)] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden group">
               <img src="${content.image}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" data-field="hero-image" />
               <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 via-transparent"></div>
            </div>
         </div>
         <div class="space-y-8">
            <p class="text-[var(--primary)] font-black uppercase tracking-[0.5em] text-xs">Architecting Digital Futures</p>
            <h1 class="text-6xl md:text-8xl font-black tracking-tighter leading-none" data-field="hero-name">${content.name}</h1>
            <p class="text-2xl font-bold opacity-70" data-field="hero-title">${content.title}</p>
            <p class="text-lg opacity-50 leading-relaxed" data-field="hero-bio">${content.bio}</p>
            <div class="pt-8 grid grid-cols-2 gap-4">
               ${(content.stats || [{ label: 'Projects', value: '150+' }, { label: 'Clients', value: '80+' }]).map((s: any) => `
                  <div class="p-6 bg-[var(--surface)] rounded-2xl border border-white/5">
                     <p class="text-3xl font-black text-[var(--primary)] mb-1">${s.value}</p>
                     <p class="text-[10px] font-black uppercase tracking-widest opacity-40">${s.label}</p>
                  </div>
               `).join('')}
            </div>
            <div class="pt-8">
               <a href="${content.cta?.link || '#'}" class="w-full inline-block py-6 bg-[var(--primary)] text-[var(--bg)] rounded-3xl font-black uppercase tracking-[0.2em] text-center shadow-xl shadow-[var(--primary)]/20">${content.cta?.text || 'Explore Work'}</a>
            </div>
         </div>
      </div>
   </section>
`;

export const HERO_SIDEBAR_LEFT = (content: any) => `
   <section data-section="hero" class="min-h-screen flex flex-col md:flex-row bg-[#050505]">
      <!-- Fixed Left Sidebar for layout feel -->
      <div class="w-full md:w-32 lg:w-48 bg-black border-r border-white/5 flex flex-col justify-between py-12 items-center shrink-0">
         <div class="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center font-black text-black">S</div>
         <div class="hidden md:flex flex-col gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 whitespace-nowrap rotate-90">
            <span>Scroll Down</span>
            <span>Est. 2024</span>
         </div>
         <div class="flex flex-col gap-6 opacity-40">
            <i class="fab fa-twitter"></i>
            <i class="fab fa-github"></i>
         </div>
      </div>
      
      <div class="flex-1 p-6 md:p-24 flex flex-col justify-center">
         <div class="max-w-4xl space-y-12">
            <div class="space-y-4">
               <p class="text-sm font-bold uppercase tracking-widest text-[#666]" data-field="hero-title">${content.title}</p>
               <h1 class="text-7xl md:text-9xl font-black text-white italic tracking-tighter leading-none" data-field="hero-name">${content.name}</h1>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-end">
               <div class="space-y-6">
                  <p class="text-xl md:text-2xl text-white/60 leading-relaxed font-light" data-field="hero-bio">${content.bio}</p>
                  <a href="${content.cta?.link || '#'}" class="inline-flex items-center gap-6 group">
                     <span class="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest group-hover:bg-[var(--primary)] transition-colors">Start Case Study</span>
                     <span class="text-white text-2xl transform group-hover:translate-x-4 transition-transform">→</span>
                  </a>
               </div>
               <div class="aspect-square bg-slate-900 rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
                  <img src="${content.image}" class="w-full h-full object-cover" data-field="hero-image" />
               </div>
            </div>
         </div>
      </div>
   </section>
`;

export const HERO_PHOTO_MOSAIC = (content: any) => `
   <section data-section="hero" class="relative h-screen bg-[#111] overflow-hidden flex items-center p-6">
      <div class="absolute inset-0 grid grid-cols-4 md:grid-cols-8 grid-rows-1 gap-2 opacity-20 z-0">
         ${Array(8).fill(0).map(() => `<div class="bg-cover bg-center h-full rounded-lg" style="background-image: url('${content.image}')"></div>`).join('')}
         <div class="absolute inset-0 bg-gradient-to-r from-[#111] via-[#111]/80 to-transparent"></div>
      </div>
      
      <div class="relative z-10 max-w-5xl space-y-8">
         <div class="inline-block px-4 py-1 border border-white/20 rounded-full font-bold text-[10px] text-white/40 uppercase tracking-[0.3em]">Portfolio Edition 2024</div>
         <h1 class="text-7xl md:text-[10vw] font-black text-white leading-none tracking-tighter" data-field="hero-name">${content.name}</h1>
         <div class="max-w-2xl">
            <p class="text-2xl md:text-3xl font-bold text-white/80 mb-6 uppercase tracking-tight" data-field="hero-title">${content.title}</p>
            <p class="text-lg md:text-xl text-white/40 leading-relaxed" data-field="hero-bio">${content.bio}</p>
         </div>
         <div class="pt-8">
            <a href="${content.cta?.link || '#'}" class="px-12 py-6 border-2 border-white text-white font-black uppercase text-sm tracking-[0.2em] hover:bg-white hover:text-black transition-all">View Gallery</a>
         </div>
      </div>
   </section>
`;

export const HERO_GLITCH_TEXT = (content: any) => `
   <section data-section="hero" class="h-screen bg-black flex items-center justify-center overflow-hidden">
      <div class="relative z-10 text-center">
         <h1 class="text-[18vw] font-black leading-none uppercase mix-blend-difference tracking-tighter" data-field="hero-name">
            <span class="glitch" data-text="${content.name}">${content.name}</span>
         </h1>
         <div class="flex items-center justify-center gap-6 mt-12">
            <p class="text-xl font-bold uppercase tracking-[0.4em] text-white opacity-40" data-field="hero-title">${content.title}</p>
            <div class="h-px w-20 bg-white/20"></div>
            <a href="${content.cta?.link || '#'}" class="px-8 py-3 border border-white/20 text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">Engage</a>
         </div>
      </div>
      <style>
         .glitch { position: relative; color: white; mix-blend-mode: color-dodge; }
         .glitch::before, .glitch::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
         .glitch::before { left: 2px; text-shadow: -2px 0 #ff00c1; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim 5s infinite linear alternate-reverse; }
         .glitch::after { left: -2px; text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim2 5s infinite linear alternate-reverse; }
         @keyframes glitch-anim { 0% { clip: rect(31px, 9999px, 94px, 0); } 20% { clip: rect(62px, 9999px, 42px, 0); } 100% { clip: rect(67px, 9999px, 62px, 0); } }
         @keyframes glitch-anim2 { 0% { clip: rect(10px, 9999px, 85px, 0); } 30% { clip: rect(50px, 9999px, 12px, 0); } 100% { clip: rect(25px, 9999px, 95px, 0); } }
      </style>
   </section>
`;

export const HERO_SMOOTH_SWEEP = (content: any) => `
   <section data-section="hero" class="relative h-screen bg-[#050505] flex items-center p-6 md:p-24 overflow-hidden">
      <div class="absolute inset-y-0 left-0 w-1/2 bg-white opacity-[0.02] transform -skew-x-12 -translate-x-1/2"></div>
      <div class="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
         <div class="space-y-12">
            <span class="text-xs font-black uppercase tracking-[0.5em] text-[var(--primary)] animate-pulse">Identity Standard v1.0</span>
            <h1 class="text-7xl md:text-9xl font-black text-white leading-none tracking-tighter" data-field="hero-name">${content.name}</h1>
            <p class="text-2xl opacity-40 leading-relaxed max-w-md font-medium" data-field="hero-bio">${content.bio}</p>
            <div class="flex items-center gap-8">
               <a href="${content.cta?.link || '#'}" class="px-12 py-5 bg-[var(--primary)] text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">Get Started</a>
               <div class="space-y-1">
                  <p class="text-[10px] font-black uppercase tracking-widest opacity-20">Availability</p>
                  <p class="text-xs font-bold text-green-500 uppercase tracking-widest">Active for Hire</p>
               </div>
            </div>
         </div>
         <div class="relative aspect-[4/5] rounded-[4rem] overflow-hidden group">
            <div class="absolute inset-0 bg-[var(--primary)] opacity-20 transform translate-x-4 translate-y-4 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-1000"></div>
            <img src="${content.image}" class="relative z-10 w-full h-full object-cover rounded-[4rem] grayscale group-hover:grayscale-0 transition-all duration-1000" data-field="hero-image" />
         </div>
      </div>
   </section>
`;

export const HERO_GRID_PORTRAIT = (content: any) => `
   <section data-section="hero" class="h-screen bg-white text-black p-6 md:p-12 flex flex-col">
      <div class="flex justify-between items-center mb-12">
         <span class="font-black text-2xl tracking-tighter uppercase">${content.name?.split(' ')[0]}.</span>
         <div class="flex gap-4">
            <span class="text-[10px] font-black uppercase border border-black px-3 py-1 rounded-full">Archive 2024</span>
         </div>
      </div>
      <div class="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
         <div class="md:col-span-4 space-y-8 pb-12">
            <h2 class="text-2xl font-bold uppercase italic leading-none opacity-40" data-field="hero-title">${content.title}</h2>
            <p class="text-xl md:text-3xl font-medium leading-tight" data-field="hero-bio">${content.bio}</p>
            <a href="${content.cta?.link || '#'}" class="inline-block py-4 border-b-4 border-black font-black uppercase text-sm tracking-[0.3em]">View Portfolio</a>
         </div>
         <div class="md:col-span-8 h-full rounded-[3rem] overflow-hidden bg-slate-100 border border-black/5 relative shadow-inner">
            <img src="${content.image}" class="w-full h-full object-cover" data-field="hero-image" />
            <div class="absolute top-8 right-8 text-white mix-blend-difference">
               <h1 class="text-[15vw] font-black text-right leading-[0.75] uppercase italic" data-field="hero-name">${content.name}</h1>
            </div>
         </div>
      </div>
   </section>
`;

export const HeroRegistry: any = {
   HERO_MODERN_SPLIT,
   HERO_CENTERED_MINIMAL,
   HERO_CYBER_MONO,
   HERO_VISUALIST,
   HERO_EXECUTIVE,
   HERO_GLASS_FLOATING,
   HERO_NEOBRUTALIST,
   HERO_MINIMAL_LEFT,
   HERO_STACKED_BOLD,
   HERO_GRID_LAYOUT,
   HERO_DYNAMIC_GRADIENT,
   HERO_MINIMAL_ELEGANCE,
   HERO_TERMINAL_STYLE,
   HERO_VIDEO_BG,
   HERO_MAGAZINE,
   HERO_PARALLAX_LAYERS,
   HERO_CIRCLE_AVATAR,
   HERO_SPLIT_DIAGONAL,
   HERO_GRADIENT_TEXT,
   HERO_CARD_STACK,
   HERO_SIDEBAR_LEFT,
   HERO_PHOTO_MOSAIC,
   HERO_GLITCH_TEXT,
   HERO_SMOOTH_SWEEP,
   HERO_GRID_PORTRAIT
};


