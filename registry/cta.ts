// CTA (Call-to-Action) Components - High-Conversion, Modern

export const CTA_HERO_INLINE = (content: any) => `
  <section class="py-32 px-6 text-center bg-gradient-to-br from-[var(--primary)]/10 to-transparent">
    <div class="max-w-4xl mx-auto space-y-8">
      <h2 class="text-[clamp(2.5rem,8vw,5rem)] font-black leading-[0.9]" data-field="cta-title">
        ${content.title || 'Ready to Start?'}
      </h2>
      <p class="text-xl md:text-2xl opacity-70 max-w-2xl mx-auto" data-field="cta-subtitle">
        ${content.subtitle || "Let's build something exceptional together."}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a href="${content.primaryLink || '#contact'}" 
           class="px-12 py-5 rounded-full bg-[var(--primary)] text-[var(--bg)] font-black uppercase tracking-wider hover:scale-105 transition-all shadow-xl">
          ${content.primaryText || 'Get Started'}
        </a>
        <a href="${content.secondaryLink || '#about'}" 
           class="px-12 py-5 rounded-full border-2 border-[var(--text)]/20 hover:border-[var(--primary)] font-bold transition-all">
          ${content.secondaryText || 'Learn More'}
        </a>
      </div>
    </div>
  </section>
`;

export const CTA_SPLIT_VISUAL = (content: any) => `
  <section class="py-24 px-6">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <div class="inline-block px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black uppercase tracking-wider">
          ${content.badge || 'Limited Availability'}
        </div>
        <h2 class="text-4xl md:text-6xl font-black leading-tight" data-field="cta-title">
          ${content.title || 'Transform Your Vision'}
        </h2>
        <p class="text-lg opacity-60 leading-relaxed" data-field="cta-description">
          ${content.description || 'Partner with an expert to bring your ideas to life with precision and creativity.'}
        </p>
        <a href="${content.ctaLink || '#contact'}" 
           class="inline-block px-10 py-5 rounded-2xl bg-[var(--primary)] text-[var(--bg)] font-black hover:scale-105 transition-transform shadow-lg">
          ${content.ctaText || 'Book a Call'}
        </a>
      </div>
      <div class="relative aspect-square rounded-[3rem] overflow-hidden bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20">
        <img src="${content.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'}" 
             class="w-full h-full object-cover" data-field="cta-image" />
      </div>
    </div>
  </section>
`;

export const CTA_BANNER_STICKY = (content: any) => `
  <div class="fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-500" id="sticky-cta">
    <div class="bg-[var(--primary)] text-[var(--bg)] px-6 py-4 shadow-2xl">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-center sm:text-left">
          <p class="font-black text-lg" data-field="cta-banner-title">
            ${content.title || '🚀 Special Offer: 20% Off This Month'}
          </p>
          <p class="text-sm opacity-90" data-field="cta-banner-subtitle">
            ${content.subtitle || 'Limited slots available for new projects.'}
          </p>
        </div>
        <div class="flex gap-3">
          <a href="${content.ctaLink || '#contact'}" 
             class="px-8 py-3 rounded-full bg-[var(--bg)] text-[var(--primary)] font-black hover:scale-105 transition-transform whitespace-nowrap">
            ${content.ctaText || 'Claim Offer'}
          </a>
          <button onclick="document.getElementById('sticky-cta').style.transform='translateY(100%)'" 
                  class="px-4 py-3 rounded-full hover:bg-white/10 transition-colors">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
`;

export const CTA_CENTERED_BOLD = (content: any) => `
  <section class="py-32 px-6 text-center relative overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-10"></div>
    <div class="relative z-10 max-w-5xl mx-auto space-y-12">
      <h2 class="text-[clamp(3rem,12vw,8rem)] font-black leading-[0.8] uppercase" data-field="cta-title">
        ${content.title || "Let's Work"}
      </h2>
      <p class="text-2xl md:text-3xl font-medium opacity-70 max-w-3xl mx-auto" data-field="cta-subtitle">
        ${content.subtitle || 'Turn your ambitious ideas into reality with expert execution.'}
      </p>
      <a href="${content.ctaLink || '#contact'}" 
         class="inline-block px-16 py-6 rounded-full bg-[var(--text)] text-[var(--bg)] font-black text-xl uppercase tracking-wider hover:scale-110 transition-all shadow-2xl">
        ${content.ctaText || 'Start Project'}
      </a>
    </div>
  </section>
`;

export const CTA_CARD_HOVER = (content: any) => `
  <section class="py-24 px-6">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      ${(content.options || [
    { title: 'Consultation', description: 'Free 30-min strategy call', link: '#', price: 'Free' },
    { title: 'Project', description: 'Full-service development', link: '#', price: 'Custom' },
    { title: 'Retainer', description: 'Ongoing support & updates', link: '#', price: 'Monthly' }
  ]).map((option: any) => `
        <a href="${option.link}" 
           class="group p-8 rounded-[2rem] bg-[var(--surface)] border border-[var(--text)]/10 hover:border-[var(--primary)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div class="space-y-4">
            <div class="text-sm font-black uppercase tracking-wider opacity-40 group-hover:text-[var(--primary)] transition-colors">
              ${option.price}
            </div>
            <h3 class="text-3xl font-black">${option.title}</h3>
            <p class="opacity-60 leading-relaxed">${option.description}</p>
            <div class="pt-4 flex items-center gap-2 text-[var(--primary)] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Learn More <span class="transform group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>
        </a>
      `).join('')}
    </div>
  </section>
`;

export const CTA_NEWSLETTER_INLINE = (content: any) => `
  <section data-section="cta" class="py-24 px-6 bg-[var(--surface)]/30 border-y border-white/5">
    <div class="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
       <div class="flex-1 space-y-4">
          <h2 class="text-3xl font-black uppercase tracking-tight">${content.title || 'Stay in the Loop'}</h2>
          <p class="text-lg opacity-60">${content.subtitle || 'Get exclusive updates on new builds and industry insights.'}</p>
       </div>
       <form class="w-full md:w-auto flex gap-3">
          <input type="email" placeholder="your@email.com" class="px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--primary)] transition-all font-bold" />
          <button class="px-8 py-4 bg-[var(--primary)] text-[var(--bg)] font-black uppercase text-xs tracking-widest rounded-xl hover:opacity-90 transition-opacity">Join</button>
       </form>
    </div>
  </section>
`;

export const CTA_CONTACT_MINI = (content: any) => `
  <section data-section="cta" class="py-24 px-6">
    <div class="max-w-5xl mx-auto bg-[var(--primary)] rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden group">
       <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity"></div>
       <div class="space-y-6 relative z-10 max-w-md">
          <h2 class="text-5xl font-black text-[var(--bg)] leading-none uppercase tracking-tighter">${content.title || 'Start Now'}</h2>
          <p class="text-xl text-[var(--bg)]/70 font-medium">${content.subtitle || "Ready to ship your next big idea? Let's discuss the roadmap."}</p>
       </div>
       <a href="${content.ctaLink || '#contact'}" class="relative z-10 px-12 py-6 bg-[var(--bg)] text-[var(--primary)] rounded-2xl font-black uppercase italic tracking-widest text-sm hover:scale-105 transition-transform shadow-xl">
          Get in Touch
       </a>
    </div>
  </section>
`;

export const CTA_GRADIENT_BANNER = (content: any) => `
  <section data-section="cta" class="relative py-32 px-6 overflow-hidden bg-black flex items-center justify-center">
    <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
    <div class="relative z-10 text-center space-y-12">
       <h2 class="text-6xl md:text-[10vw] font-black text-white italic tracking-tighter leading-none opacity-40 uppercase">PUSH LIMITS</h2>
       <div class="max-w-3xl mx-auto space-y-8">
          <p class="text-2xl md:text-4xl font-bold text-white uppercase">${content.title || 'Transform your digital presence today.'}</p>
          <a href="${content.ctaLink || '#contact'}" class="inline-block px-16 py-6 bg-white text-black rounded-full font-black uppercase tracking-[0.4em] text-xs hover:bg-[var(--primary)] transition-colors">Launch Project</a>
       </div>
    </div>
  </section>
`;

export const CTARegistry: any = {
  CTA_HERO_INLINE,
  CTA_SPLIT_VISUAL,
  CTA_BANNER_STICKY,
  CTA_CENTERED_BOLD,
  CTA_CARD_HOVER,
  CTA_NEWSLETTER_INLINE,
  CTA_CONTACT_MINI,
  CTA_GRADIENT_BANNER
};

