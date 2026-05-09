// ============================================================
// SEEQME CONTACT EXTENDED REGISTRY — 5 additional contact section styles
// ============================================================

const platformIcon: Record<string, string> = {
  github: 'fab fa-github', twitter: 'fab fa-twitter', x: 'fab fa-x-twitter',
  linkedin: 'fab fa-linkedin-in', instagram: 'fab fa-instagram', dribbble: 'fab fa-dribbble',
  behance: 'fab fa-behance', youtube: 'fab fa-youtube', facebook: 'fab fa-facebook-f',
  medium: 'fab fa-medium', dev: 'fab fa-dev', discord: 'fab fa-discord',
  telegram: 'fab fa-telegram-plane', whatsapp: 'fab fa-whatsapp',
  email: 'fas fa-envelope', mail: 'fas fa-envelope',
};

const getPlatformIcon = (platform: string): string => {
  const lower = (platform || '').toLowerCase();
  for (const [k, v] of Object.entries(platformIcon)) {
    if (lower.includes(k)) return v;
  }
  return 'fas fa-link';
};

export const ContactExtendedRegistry: Record<string, (content: any) => string> = {

  // ─── 1. CONTACT_BENTO ────────────────────────────────────────────────────
  CONTACT_BENTO: (content: any) => {
    const socials = Array.isArray(content.socials) ? content.socials : [];
    return `
<section data-section="contact" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-12 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Contact</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="contact-title">${content.title || 'Get In Touch'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-lg">${content.subtitle}</p>` : ''}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
      <!-- Contact details -->
      <div class="md:col-span-1 lg:col-span-2 rounded-2xl p-8 space-y-5" style="background:var(--surface);">
        <h3 class="text-sm font-black uppercase tracking-[0.3em] opacity-50 text-[var(--text)] mb-6">Contact Details</h3>
        ${content.email ? `
        <a href="mailto:${content.email}" class="flex items-center gap-4 group transition-all duration-200 hover:translate-x-1">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:color-mix(in srgb,var(--primary) 12%,transparent);">
            <i class="fas fa-envelope text-sm" style="color:var(--primary);"></i>
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-wider opacity-40 text-[var(--text)]">Email</p>
            <p class="text-sm font-bold text-[var(--heading)] group-hover:text-[color:var(--primary)] transition-colors">${content.email}</p>
          </div>
        </a>` : ''}
        ${content.phone ? `
        <a href="tel:${content.phone}" class="flex items-center gap-4 group transition-all duration-200 hover:translate-x-1">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:color-mix(in srgb,var(--primary) 12%,transparent);">
            <i class="fas fa-phone text-sm" style="color:var(--primary);"></i>
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-wider opacity-40 text-[var(--text)]">Phone</p>
            <p class="text-sm font-bold text-[var(--heading)] group-hover:text-[color:var(--primary)] transition-colors">${content.phone}</p>
          </div>
        </a>` : ''}
        ${content.location ? `
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:color-mix(in srgb,var(--primary) 12%,transparent);">
            <i class="fas fa-map-marker-alt text-sm" style="color:var(--primary);"></i>
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-wider opacity-40 text-[var(--text)]">Location</p>
            <p class="text-sm font-bold text-[var(--heading)]">${content.location}</p>
          </div>
        </div>` : ''}
      </div>
      <!-- Social links -->
      ${socials.length > 0 ? `
      <div class="rounded-2xl p-8" style="background:var(--surface);">
        <h3 class="text-sm font-black uppercase tracking-[0.3em] opacity-50 text-[var(--text)] mb-6">Socials</h3>
        <div class="grid grid-cols-3 gap-3">
          ${socials.map((s: any) => `
          <a href="${s.url || '#'}" target="_blank" rel="noopener"
             class="flex flex-col items-center gap-2 p-3 rounded-xl border border-[var(--text)]/10 hover:border-[var(--primary)]/40 transition-all duration-300 hover:scale-105 group"
             style="background:color-mix(in srgb,var(--bg) 50%,transparent);">
            <i class="${getPlatformIcon(s.platform)} text-lg group-hover:scale-110 transition-transform" style="color:var(--primary);"></i>
            <span class="text-[9px] font-black uppercase tracking-wider opacity-50 text-[var(--text)]">${s.platform || 'Link'}</span>
          </a>`).join('')}
        </div>
      </div>` : ''}
      <!-- CTA card -->
      ${content.cta ? `
      <div class="rounded-2xl p-8 flex flex-col justify-between gap-6"
           style="background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 70%,var(--surface)));">
        <i class="fas fa-paper-plane text-2xl text-[var(--bg)]"></i>
        <div>
          <p class="text-lg font-black text-[var(--bg)] leading-tight">${content.cta.text || 'Ready to work together?'}</p>
          ${content.email ? `
          <a href="mailto:${content.email}" class="inline-flex items-center gap-2 mt-4 text-sm font-bold text-[var(--bg)] opacity-80 hover:opacity-100 transition-all">
            Send a message <i class="fas fa-arrow-right"></i>
          </a>` : ''}
        </div>
      </div>` : ''}
    </div>
  </div>
</section>`;
  },

  // ─── 2. CONTACT_GLASSMORPHIC ─────────────────────────────────────────────
  CONTACT_GLASSMORPHIC: (content: any) => {
    const socials = Array.isArray(content.socials) ? content.socials : [];
    return `
<section data-section="contact" class="relative py-20 md:py-28 bg-[var(--surface)] overflow-hidden">
  <!-- Blob bg -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-30"
         style="background:radial-gradient(circle,var(--primary),transparent 70%);filter:blur(80px);"></div>
    <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
         style="background:radial-gradient(circle,var(--secondary,var(--primary)),transparent 70%);filter:blur(80px);"></div>
  </div>
  <div class="relative z-10 max-w-3xl mx-auto px-6">
    <div class="rounded-3xl p-10 md:p-14 border border-white/20 backdrop-blur-xl text-center"
         style="background:rgba(255,255,255,0.05);">
      <span class="text-xs font-black uppercase tracking-[0.4em] block mb-4" style="color:var(--primary);">Contact</span>
      <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-[var(--heading)] mb-3" data-field="contact-title">${content.title || 'Get In Touch'}</h2>
      ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 mb-10 max-w-md mx-auto">${content.subtitle}</p>` : '<div class="mb-10"></div>'}
      <!-- Contact info rows -->
      <div class="flex flex-col gap-4 mb-8">
        ${content.email ? `
        <a href="mailto:${content.email}" class="flex items-center justify-center gap-3 text-sm font-bold text-[var(--text)] opacity-80 hover:opacity-100 transition-all hover:text-[color:var(--primary)]">
          <i class="fas fa-envelope" style="color:var(--primary);"></i>${content.email}
        </a>` : ''}
        ${content.phone ? `
        <a href="tel:${content.phone}" class="flex items-center justify-center gap-3 text-sm font-bold text-[var(--text)] opacity-80 hover:opacity-100 transition-all hover:text-[color:var(--primary)]">
          <i class="fas fa-phone" style="color:var(--primary);"></i>${content.phone}
        </a>` : ''}
        ${content.location ? `
        <div class="flex items-center justify-center gap-3 text-sm font-bold text-[var(--text)] opacity-60">
          <i class="fas fa-map-marker-alt" style="color:var(--primary);"></i>${content.location}
        </div>` : ''}
      </div>
      <!-- Socials -->
      ${socials.length > 0 ? `
      <div class="flex justify-center gap-3 flex-wrap mb-8">
        ${socials.map((s: any) => `
        <a href="${s.url || '#'}" target="_blank" rel="noopener"
           class="w-11 h-11 rounded-full flex items-center justify-center border border-white/15 backdrop-blur-sm transition-all duration-300 hover:scale-110"
           style="background:rgba(255,255,255,0.08);"
           onmouseover="this.style.background='var(--primary)';this.style.borderColor='var(--primary)';"
           onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.borderColor='rgba(255,255,255,0.15)';">
          <i class="${getPlatformIcon(s.platform)} text-sm text-[var(--text)]"></i>
        </a>`).join('')}
      </div>` : ''}
      ${content.email ? `
      <a href="mailto:${content.email}" class="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105 hover:shadow-xl"
         style="background:var(--primary);color:var(--bg);">
        ${content.cta?.text || 'Send a Message'} <i class="fas fa-arrow-right"></i>
      </a>` : ''}
    </div>
  </div>
</section>`;
  },

  // ─── 3. CONTACT_DARK_MINIMAL ─────────────────────────────────────────────
  CONTACT_DARK_MINIMAL: (content: any) => {
    const socials = Array.isArray(content.socials) ? content.socials : [];
    return `
<section data-section="contact" class="relative py-20 md:py-28 bg-[var(--surface)]">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <span class="text-xs font-black uppercase tracking-[0.4em] block mb-6" style="color:var(--primary);">Contact</span>
    <h2 class="text-5xl md:text-7xl font-black tracking-tighter text-[var(--heading)] mb-12 leading-none" data-field="contact-title">${content.title || 'Let\'s Talk'}</h2>
    ${content.email ? `
    <a href="mailto:${content.email}"
       class="block text-2xl md:text-4xl font-black text-[var(--heading)] opacity-60 hover:opacity-100 transition-all duration-300 hover:text-[color:var(--primary)] mb-12 break-all">
      ${content.email}
    </a>` : ''}
    ${socials.length > 0 ? `
    <div class="flex justify-center gap-6 flex-wrap mb-10">
      ${socials.map((s: any) => `
      <a href="${s.url || '#'}" target="_blank" rel="noopener"
         class="w-12 h-12 rounded-full flex items-center justify-center border border-[var(--text)]/20 hover:border-[var(--primary)] transition-all duration-300 hover:scale-110 text-[var(--text)] opacity-60 hover:opacity-100"
         onmouseover="this.style.color='var(--primary)';"
         onmouseout="this.style.color='var(--text)';">
        <i class="${getPlatformIcon(s.platform)} text-base"></i>
      </a>`).join('')}
    </div>` : ''}
    ${content.location ? `
    <p class="text-xs font-black uppercase tracking-[0.3em] opacity-40 text-[var(--text)]">
      <i class="fas fa-map-marker-alt mr-2" style="color:var(--primary);"></i>${content.location}
    </p>` : ''}
  </div>
</section>`;
  },

  // ─── 4. CONTACT_CREATIVE ─────────────────────────────────────────────────
  CONTACT_CREATIVE: (content: any) => {
    const socials = Array.isArray(content.socials) ? content.socials : [];
    return `
<section data-section="contact" class="relative py-20 md:py-28 bg-[var(--bg)] overflow-hidden">
  <!-- Decorative large number / symbol -->
  <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style="z-index:0;">
    <span class="font-black text-[var(--primary)] opacity-[0.04]" style="font-size:clamp(12rem,25vw,20rem);">@</span>
  </div>
  <!-- Decorative CSS shapes -->
  <div class="absolute top-10 right-10 pointer-events-none" style="z-index:0;">
    <div class="w-40 h-40 rounded-full border-2 opacity-10" style="border-color:var(--primary);"></div>
    <div class="w-24 h-24 rounded-full border opacity-10 absolute top-8 left-8" style="border-color:var(--primary);"></div>
  </div>
  <div class="absolute bottom-10 left-10 pointer-events-none" style="z-index:0;">
    <div class="w-24 h-0.5 opacity-10" style="background:var(--primary);transform:rotate(45deg);"></div>
    <div class="w-16 h-0.5 opacity-10 mt-4" style="background:var(--primary);transform:rotate(45deg);"></div>
  </div>
  <div class="relative z-10 max-w-5xl mx-auto px-6">
    <div class="flex flex-col lg:flex-row gap-16 items-center">
      <!-- Content left -->
      <div class="flex-1 space-y-8">
        <div>
          <span class="text-xs font-black uppercase tracking-[0.4em] block mb-4" style="color:var(--primary);">Contact</span>
          <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)] leading-tight" data-field="contact-title">${content.title || 'Get In Touch'}</h2>
          ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 mt-4 max-w-sm">${content.subtitle}</p>` : ''}
        </div>
        <div class="flex flex-col gap-4">
          ${content.email ? `
          <a href="mailto:${content.email}" class="flex items-center gap-4 group">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0"
                 style="background:color-mix(in srgb,var(--primary) 12%,transparent);">
              <i class="fas fa-envelope" style="color:var(--primary);"></i>
            </div>
            <span class="text-sm font-bold text-[var(--text)] opacity-70 group-hover:opacity-100 group-hover:text-[color:var(--primary)] transition-all">${content.email}</span>
          </a>` : ''}
          ${content.phone ? `
          <a href="tel:${content.phone}" class="flex items-center gap-4 group">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0"
                 style="background:color-mix(in srgb,var(--primary) 12%,transparent);">
              <i class="fas fa-phone" style="color:var(--primary);"></i>
            </div>
            <span class="text-sm font-bold text-[var(--text)] opacity-70 group-hover:opacity-100 group-hover:text-[color:var(--primary)] transition-all">${content.phone}</span>
          </a>` : ''}
          ${content.location ? `
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                 style="background:color-mix(in srgb,var(--primary) 12%,transparent);">
              <i class="fas fa-map-marker-alt" style="color:var(--primary);"></i>
            </div>
            <span class="text-sm font-bold text-[var(--text)] opacity-60">${content.location}</span>
          </div>` : ''}
        </div>
        ${socials.length > 0 ? `
        <div class="flex gap-3 flex-wrap">
          ${socials.map((s: any) => `
          <a href="${s.url || '#'}" target="_blank" rel="noopener"
             class="w-11 h-11 rounded-full flex items-center justify-center border border-[var(--text)]/15 hover:border-[var(--primary)] transition-all duration-300 hover:scale-110 text-[var(--text)] opacity-60 hover:opacity-100"
             onmouseover="this.style.color='var(--primary)';"
             onmouseout="this.style.color='var(--text)';">
            <i class="${getPlatformIcon(s.platform)} text-sm"></i>
          </a>`).join('')}
        </div>` : ''}
      </div>
      <!-- Decorative right panel -->
      <div class="hidden lg:flex lg:w-2/5 flex-shrink-0 items-center justify-center">
        <div class="relative w-full max-w-xs">
          <div class="w-full aspect-square rounded-3xl border-2 opacity-20 rotate-12"
               style="border-color:var(--primary);"></div>
          <div class="absolute inset-4 rounded-3xl flex items-center justify-center -rotate-6"
               style="background:color-mix(in srgb,var(--primary) 8%,transparent);">
            <i class="fas fa-paper-plane text-5xl" style="color:var(--primary);opacity:0.4;"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
  },

  // ─── 5. CONTACT_FLOATING_CARD ────────────────────────────────────────────
  CONTACT_FLOATING_CARD: (content: any) => {
    const socials = Array.isArray(content.socials) ? content.socials : [];
    return `
<section data-section="contact" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-2xl mx-auto px-6">
    <!-- Floating card -->
    <div class="rounded-3xl p-10 md:p-14 shadow-2xl border border-[var(--text)]/10"
         style="background:var(--surface);">
      <div class="text-center mb-10">
        <span class="text-xs font-black uppercase tracking-[0.4em] block mb-4" style="color:var(--primary);">Contact</span>
        <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-[var(--heading)] mb-3" data-field="contact-title">${content.title || 'Get In Touch'}</h2>
        ${content.subtitle ? `<p class="text-base text-[var(--text)] opacity-60 max-w-sm mx-auto">${content.subtitle}</p>` : ''}
      </div>
      <!-- Contact info -->
      <div class="flex flex-col gap-3 mb-8">
        ${content.email ? `
        <a href="mailto:${content.email}" class="flex items-center gap-3 p-4 rounded-xl border border-[var(--text)]/10 hover:border-[var(--primary)]/40 group transition-all duration-200"
           style="background:color-mix(in srgb,var(--bg) 50%,transparent);">
          <i class="fas fa-envelope" style="color:var(--primary);"></i>
          <span class="text-sm font-bold text-[var(--text)] opacity-70 group-hover:opacity-100 group-hover:text-[color:var(--primary)] transition-all">${content.email}</span>
        </a>` : ''}
        ${content.phone ? `
        <a href="tel:${content.phone}" class="flex items-center gap-3 p-4 rounded-xl border border-[var(--text)]/10 hover:border-[var(--primary)]/40 group transition-all duration-200"
           style="background:color-mix(in srgb,var(--bg) 50%,transparent);">
          <i class="fas fa-phone" style="color:var(--primary);"></i>
          <span class="text-sm font-bold text-[var(--text)] opacity-70 group-hover:opacity-100 group-hover:text-[color:var(--primary)] transition-all">${content.phone}</span>
        </a>` : ''}
        ${content.location ? `
        <div class="flex items-center gap-3 p-4 rounded-xl border border-[var(--text)]/10" style="background:color-mix(in srgb,var(--bg) 50%,transparent);">
          <i class="fas fa-map-marker-alt" style="color:var(--primary);"></i>
          <span class="text-sm font-bold text-[var(--text)] opacity-60">${content.location}</span>
        </div>` : ''}
      </div>
      <!-- Simple form -->
      <form onsubmit="event.preventDefault();" class="flex flex-col gap-4 mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" placeholder="Your Name"
                 class="w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--text)] border border-[var(--text)]/15 outline-none transition-all duration-200 focus:border-[color:var(--primary)]"
                 style="background:color-mix(in srgb,var(--bg) 60%,transparent);" />
          <input type="email" placeholder="Your Email"
                 class="w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--text)] border border-[var(--text)]/15 outline-none transition-all duration-200 focus:border-[color:var(--primary)]"
                 style="background:color-mix(in srgb,var(--bg) 60%,transparent);" />
        </div>
        <textarea rows="4" placeholder="Your Message"
                  class="w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--text)] border border-[var(--text)]/15 outline-none transition-all duration-200 focus:border-[color:var(--primary)] resize-none"
                  style="background:color-mix(in srgb,var(--bg) 60%,transparent);"></textarea>
        <button type="submit"
                class="w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style="background:var(--primary);color:var(--bg);">
          ${content.cta?.text || 'Send Message'} <i class="fas fa-paper-plane ml-2"></i>
        </button>
      </form>
      <!-- Social links -->
      ${socials.length > 0 ? `
      <div class="flex justify-center gap-3 flex-wrap border-t border-[var(--text)]/10 pt-6">
        ${socials.map((s: any) => `
        <a href="${s.url || '#'}" target="_blank" rel="noopener"
           class="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--text)]/15 hover:border-[var(--primary)] transition-all duration-300 hover:scale-110 text-[var(--text)] opacity-60 hover:opacity-100"
           onmouseover="this.style.color='var(--primary)';"
           onmouseout="this.style.color='var(--text)';">
          <i class="${getPlatformIcon(s.platform)} text-sm"></i>
        </a>`).join('')}
      </div>` : ''}
    </div>
  </div>
</section>`;
  },

};
