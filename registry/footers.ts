
// ─── Footer Registry ──────────────────────────────────────────────────────────
// All components return pure HTML strings. Tailwind CDN + FA 6 + CSS vars.

const year = new Date().getFullYear();

const socialIcon = (platform: string): string => {
  const p = (platform || '').toLowerCase();
  const map: Record<string, string> = {
    github: 'fab fa-github', linkedin: 'fab fa-linkedin', twitter: 'fab fa-twitter',
    x: 'fab fa-x-twitter', instagram: 'fab fa-instagram', dribbble: 'fab fa-dribbble',
    behance: 'fab fa-behance', youtube: 'fab fa-youtube', tiktok: 'fab fa-tiktok',
    discord: 'fab fa-discord', medium: 'fab fa-medium', dev: 'fab fa-dev',
    stackoverflow: 'fab fa-stack-overflow', facebook: 'fab fa-facebook',
    pinterest: 'fab fa-pinterest', telegram: 'fab fa-telegram', twitch: 'fab fa-twitch',
  };
  for (const [key, icon] of Object.entries(map)) {
    if (p.includes(key)) return icon;
  }
  return 'fas fa-link';
};

// ─────────────────────────────────────────────────────────────────────────────

export const FOOTER_MINIMAL = (content: any) => {
  const socials = content.socials || [];
  return `
  <footer class="py-10 px-6 border-t border-[var(--text)]/10 bg-[var(--bg)]">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5">
      <p class="text-sm opacity-50 font-medium" data-field="footer-copyright">
        &copy; ${year} ${content.name || 'Portfolio'}. All rights reserved.
      </p>
      <div class="flex items-center gap-5">
        ${socials.map((s: any) => {
          const icon = socialIcon(s.platform || s.name || '');
          const url = s.url || s.link || '#';
          const label = s.platform || s.name || 'Social';
          return `
          <a href="${url}" target="_blank" rel="noopener noreferrer"
             class="text-[var(--text)] opacity-50 hover:opacity-100 hover:text-[var(--primary)] transition-all duration-300"
             aria-label="${label}">
            <i class="${icon} text-lg"></i>
          </a>`;
        }).join('')}
      </div>
    </div>
  </footer>
  `;
};

export const FOOTER_SOCIAL_HEAVY = (content: any) => {
  const socials = content.socials || [];
  return `
  <footer class="py-20 px-6 bg-[var(--surface)]">
    <div class="max-w-5xl mx-auto text-center space-y-10">

      <!-- Large CTA text -->
      <div class="space-y-3">
        <h3 class="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter" data-field="footer-cta">
          ${content.ctaText || "Let's Create Together"}
        </h3>
        ${content.email ? `
        <a href="mailto:${content.email}" class="text-lg font-medium opacity-50 hover:opacity-100 hover:text-[var(--primary)] transition-all">
          ${content.email}
        </a>` : ''}
      </div>

      <!-- Large social icon circles -->
      ${socials.length > 0 ? `
      <div class="flex flex-wrap justify-center gap-4">
        ${socials.map((s: any) => {
          const icon = socialIcon(s.platform || s.name || '');
          const url = s.url || s.link || '#';
          const label = s.platform || s.name || 'Social';
          return `
          <a href="${url}" target="_blank" rel="noopener noreferrer"
             class="w-16 h-16 rounded-full bg-[var(--bg)] border border-[var(--text)]/10 flex items-center justify-center hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-[var(--bg)] hover:scale-110 transition-all duration-300 group"
             aria-label="${label}">
            <i class="${icon} text-xl group-hover:scale-110 transition-transform"></i>
          </a>`;
        }).join('')}
      </div>` : ''}

      <!-- Horizontal rule -->
      <div class="h-px bg-[var(--text)]/10 w-full"></div>

      <!-- Copyright -->
      <p class="text-sm opacity-35 font-medium">
        &copy; ${year} ${content.name || 'Portfolio'}. Crafted with precision.
      </p>
    </div>
  </footer>
  `;
};

export const FOOTER_NEWSLETTER = (content: any) => {
  const socials = content.socials || [];
  return `
  <footer class="py-20 px-6 bg-gradient-to-t from-[var(--surface)]/50 to-transparent border-t border-[var(--text)]/5">
    <div class="max-w-3xl mx-auto text-center space-y-10">

      <!-- Heading -->
      <div class="space-y-3">
        <h3 class="text-3xl md:text-4xl font-black tracking-tighter" data-field="footer-newsletter-title">
          ${content.newsletterTitle || 'Stay Connected'}
        </h3>
        <p class="text-base opacity-55 leading-relaxed">
          ${content.newsletterDescription || 'Get updates on new projects, articles, and insights.'}
        </p>
      </div>

      <!-- Newsletter input (UI only — no backend) -->
      <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onsubmit="event.preventDefault(); this.innerHTML='<p class=\\'text-[var(--primary)] font-bold\\'>Thanks for subscribing!</p>';">
        <input
          type="email"
          placeholder="your@email.com"
          class="flex-1 px-5 py-3.5 bg-[var(--surface)] border border-[var(--text)]/10 rounded-full focus:outline-none focus:border-[var(--primary)] transition-all font-medium text-sm"
        />
        <button type="submit"
          class="px-7 py-3.5 bg-[var(--primary)] text-[var(--bg)] font-black text-xs uppercase tracking-widest rounded-full hover:opacity-90 hover:scale-105 transition-all duration-300 whitespace-nowrap">
          Subscribe
        </button>
      </form>

      <!-- Social icons -->
      ${socials.length > 0 ? `
      <div class="flex justify-center gap-4">
        ${socials.map((s: any) => {
          const icon = socialIcon(s.platform || s.name || '');
          const url = s.url || s.link || '#';
          const label = s.platform || s.name || 'Social';
          return `
          <a href="${url}" target="_blank" rel="noopener noreferrer"
             class="text-[var(--text)] opacity-40 hover:opacity-100 hover:text-[var(--primary)] transition-all"
             aria-label="${label}">
            <i class="${icon} text-lg"></i>
          </a>`;
        }).join('')}
      </div>` : ''}

      <!-- Copyright -->
      <p class="text-xs opacity-35 font-medium border-t border-[var(--text)]/5 pt-6">
        &copy; ${year} ${content.name || 'Portfolio'}. All rights reserved.
      </p>
    </div>
  </footer>
  `;
};

export const FOOTER_MULTI_COLUMN = (content: any) => {
  const socials = content.socials || [];
  const links = content.links || ['About', 'Projects', 'Services', 'Contact'];
  return `
  <footer class="py-20 px-6 bg-[var(--surface)] border-t border-[var(--text)]/5">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">

        <!-- Brand column -->
        <div class="space-y-5 sm:col-span-2 md:col-span-1">
          <h4 class="text-2xl font-black tracking-tight" data-field="footer-brand">
            ${content.name || 'Portfolio'}
          </h4>
          <p class="text-sm opacity-55 leading-relaxed max-w-xs" data-field="footer-tagline">
            ${content.tagline || 'Building exceptional digital experiences one project at a time.'}
          </p>
        </div>

        <!-- Quick links -->
        <div class="space-y-5">
          <h5 class="text-[9px] font-black uppercase tracking-[0.45em] opacity-35">Quick Links</h5>
          <nav class="flex flex-col gap-2.5">
            ${links.map((link: string) => `
              <a href="#${typeof link === 'string' ? link.toLowerCase() : link}"
                 class="text-sm opacity-60 hover:opacity-100 hover:text-[var(--primary)] transition-all font-medium">
                ${typeof link === 'string' ? link : link}
              </a>
            `).join('')}
          </nav>
        </div>

        <!-- Connect (socials) -->
        <div class="space-y-5">
          <h5 class="text-[9px] font-black uppercase tracking-[0.45em] opacity-35">Connect</h5>
          <div class="flex flex-wrap gap-2.5">
            ${socials.map((s: any) => {
              const icon = socialIcon(s.platform || s.name || '');
              const url = s.url || s.link || '#';
              const label = s.platform || s.name || 'Social';
              return `
              <a href="${url}" target="_blank" rel="noopener noreferrer"
                 class="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--text)]/10 flex items-center justify-center hover:bg-[var(--primary)] hover:text-[var(--bg)] hover:border-[var(--primary)] transition-all duration-300"
                 aria-label="${label}">
                <i class="${icon} text-sm"></i>
              </a>`;
            }).join('')}
            ${socials.length === 0 ? '<p class="text-sm opacity-40">No socials yet</p>' : ''}
          </div>
          ${content.email ? `<a href="mailto:${content.email}" class="text-sm opacity-55 hover:text-[var(--primary)] transition-colors break-all">${content.email}</a>` : ''}
        </div>

        <!-- Legal -->
        <div class="space-y-5">
          <h5 class="text-[9px] font-black uppercase tracking-[0.45em] opacity-35">Legal</h5>
          <nav class="flex flex-col gap-2.5">
            <a href="#" class="text-sm opacity-60 hover:opacity-100 hover:text-[var(--primary)] transition-all font-medium">Privacy Policy</a>
            <a href="#" class="text-sm opacity-60 hover:opacity-100 hover:text-[var(--primary)] transition-all font-medium">Terms of Service</a>
            <a href="#" class="text-sm opacity-60 hover:opacity-100 hover:text-[var(--primary)] transition-all font-medium">Cookie Policy</a>
          </nav>
        </div>

      </div>

      <!-- Bottom bar -->
      <div class="pt-8 border-t border-[var(--text)]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-35">
        <p>&copy; ${year} ${content.name || 'Portfolio'}. All rights reserved.</p>
        <p>Built with <span class="text-[var(--primary)] opacity-100">SeeqMe</span></p>
      </div>
    </div>
  </footer>
  `;
};

export const FOOTER_STICKY_CTA = (content: any) => `
  <footer>
    <!-- Full-width CTA banner -->
    <div class="py-20 px-6 bg-[var(--primary)] text-[var(--bg)] text-center">
      <div class="max-w-4xl mx-auto space-y-6">
        <h3 class="text-4xl md:text-6xl font-black tracking-tighter" data-field="footer-sticky-title">
          ${content.stickyTitle || 'Ready to collaborate?'}
        </h3>
        <p class="text-lg opacity-75 max-w-xl mx-auto" data-field="footer-sticky-subtitle">
          ${content.stickySubtitle || "Let's build something remarkable together."}
        </p>
        <a href="${content.ctaLink || '#contact'}"
           class="inline-flex items-center gap-3 mt-4 px-10 py-5 bg-[var(--bg)] text-[var(--primary)] font-black uppercase tracking-[0.2em] text-sm rounded-full hover:scale-105 transition-transform duration-300 shadow-2xl">
          ${content.ctaText || 'Get in Touch'} <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>

    <!-- Thin copyright strip -->
    <div class="py-5 px-6 bg-[var(--bg)] border-t border-[var(--text)]/5">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs opacity-35">
        <p>&copy; ${new Date().getFullYear()} ${content.name || 'Portfolio'}. All rights reserved.</p>
        ${content.email ? `<a href="mailto:${content.email}" class="hover:opacity-100 hover:text-[var(--primary)] transition-all">${content.email}</a>` : ''}
      </div>
    </div>
  </footer>
`;

export const FOOTER_DARK_DETAILED = (content: any) => {
  const socials = content.socials || [];
  return `
  <footer class="py-24 px-6 bg-[#050505] text-white border-t border-white/5">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">

        <!-- Brand block -->
        <div class="md:col-span-5 space-y-8">
          <div class="space-y-3">
            <h4 class="text-3xl font-black tracking-tight" data-field="footer-brand">
              ${content.name || 'Portfolio'}
            </h4>
            <div class="h-0.5 w-12 bg-[var(--primary)]"></div>
          </div>
          <p class="text-white/50 leading-relaxed text-lg max-w-sm" data-field="footer-tagline">
            ${content.tagline || 'Engineering high-impact digital solutions for the world\'s best teams.'}
          </p>
          <!-- Social icons -->
          ${socials.length > 0 ? `
          <div class="flex flex-wrap gap-3">
            ${socials.map((s: any) => {
              const icon = socialIcon(s.platform || s.name || '');
              const url = s.url || s.link || '#';
              const label = s.platform || s.name || 'Social';
              return `
              <a href="${url}" target="_blank" rel="noopener noreferrer"
                 class="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--primary)] hover:text-[var(--bg)] hover:border-[var(--primary)] transition-all duration-300"
                 aria-label="${label}">
                <i class="${icon} text-sm"></i>
              </a>`;
            }).join('')}
          </div>` : ''}
        </div>

        <!-- Three column nav -->
        <div class="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div class="space-y-5">
            <h5 class="text-[9px] font-black uppercase tracking-[0.45em] text-white/30">Navigate</h5>
            <nav class="flex flex-col gap-3">
              ${(content.links || ['Home', 'About', 'Work', 'Contact']).map((l: string) => `
              <a href="#${l.toLowerCase()}" class="text-sm text-white/55 hover:text-white hover:text-[var(--primary)] transition-colors font-medium">${l}</a>
              `).join('')}
            </nav>
          </div>
          <div class="space-y-5">
            <h5 class="text-[9px] font-black uppercase tracking-[0.45em] text-white/30">Services</h5>
            <nav class="flex flex-col gap-3">
              ${(content.services || ['Design', 'Development', 'Strategy', 'Consulting']).map((s: string) => `
              <a href="#" class="text-sm text-white/55 hover:text-white transition-colors font-medium">${s}</a>
              `).join('')}
            </nav>
          </div>
          <div class="space-y-5">
            <h5 class="text-[9px] font-black uppercase tracking-[0.45em] text-white/30">Contact</h5>
            <div class="flex flex-col gap-3 text-sm text-white/55">
              ${content.email ? `<a href="mailto:${content.email}" class="hover:text-[var(--primary)] transition-colors">${content.email}</a>` : ''}
              ${content.location ? `<span>${content.location}</span>` : ''}
              ${content.phone ? `<a href="tel:${content.phone}" class="hover:text-[var(--primary)] transition-colors">${content.phone}</a>` : ''}
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom strip -->
      <div class="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
        <p>&copy; ${new Date().getFullYear()} ${content.name || 'Portfolio'}. All Rights Reserved.</p>
        <p>Built with <span class="text-[var(--primary)]/70">SeeqMe</span></p>
      </div>
    </div>
  </footer>
  `;
};

export const FOOTER_SINGLE_LINE = (content: any) => {
  const socials = content.socials || [];
  return `
  <footer class="py-8 px-6 border-t border-[var(--text)]/5 bg-[var(--bg)]">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.45em] opacity-35">
      <p>&copy; ${year} ${content.name || 'Portfolio'}</p>
      <div class="flex flex-wrap justify-center gap-6">
        ${socials.map((s: any) => {
          const url = s.url || s.link || '#';
          const label = s.platform || s.name || 'Social';
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--primary)] hover:opacity-100 transition-all">${label}</a>`;
        }).join('')}
      </div>
      <p>Edition ${year}</p>
    </div>
  </footer>
  `;
};

export const FOOTER_BRAND_FOCUS = (content: any) => {
  const socials = content.socials || [];
  const brandName = (content.name || 'BRAND').toUpperCase();
  return `
  <footer class="relative py-20 px-6 text-center overflow-hidden bg-[var(--bg)]">

    <!-- Oversized background brand name -->
    <div class="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
      <span class="text-[20vw] font-black tracking-tighter leading-none opacity-[0.04] uppercase whitespace-nowrap">
        ${brandName}
      </span>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto space-y-10">

      <!-- Social text links -->
      ${socials.length > 0 ? `
      <div class="flex flex-wrap justify-center gap-8">
        ${socials.map((s: any) => {
          const icon = socialIcon(s.platform || s.name || '');
          const url = s.url || s.link || '#';
          const label = s.platform || s.name || 'Social';
          return `
          <a href="${url}" target="_blank" rel="noopener noreferrer"
             class="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-[var(--primary)] transition-colors">
            <i class="${icon}"></i> ${label}
          </a>`;
        }).join('')}
      </div>` : ''}

      <!-- Horizontal divider -->
      <div class="h-px bg-[var(--text)]/5 w-full max-w-sm mx-auto"></div>

      <!-- Copyright + email -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-35">
        <p>&copy; ${year} ${content.name || 'Brand'}</p>
        ${content.email ? `<a href="mailto:${content.email}" class="hover:text-[var(--primary)] hover:opacity-100 transition-all">${content.email}</a>` : ''}
      </div>
    </div>
  </footer>
  `;
};

// ── Preserved extras ─────────────────────────────────────────────────────────

export const FOOTER_DARK_SASS = (content: any) => `
  <footer class="py-12 px-6 bg-[var(--bg)] text-center text-[var(--text)]/55 text-xs font-mono border-t border-[var(--text)]/5">
    ${content.email || content.footerEmail ? `
    <a href="mailto:${content.footerEmail || content.email}" class="block mb-8 text-xl text-[var(--text)]/75 hover:text-[var(--primary)] transition-colors">
      ${content.footerEmail || content.email}
    </a>` : ''}
    <h3 class="font-bold text-[var(--heading)] mb-3 text-sm">${content.name || 'SYSTEM'}</h3>
    <p>&copy; ${year} ${content.name || 'Portfolio'}. All Rights Reserved.</p>
  </footer>
`;

export const FOOTER_AGENCY_BOLD = (content: any) => {
  const socials = content.socials || [];
  return `
  <footer class="bg-[var(--bg)] text-[var(--text)] py-16 px-6 text-center border-t border-[var(--text)]/5">
    <h2 class="text-4xl md:text-6xl font-black mb-8 text-[var(--heading)]" data-field="footer-cta">
      ${content.ctaText || 'Ready to grow?'}
    </h2>
    ${content.email ? `
    <a href="mailto:${content.email}" class="text-2xl md:text-4xl text-[var(--primary)] hover:text-[var(--heading)] transition-colors underline decoration-2 underline-offset-8" data-field="footer-email">
      ${content.email}
    </a>` : ''}
    ${socials.length > 0 ? `
    <div class="flex justify-center gap-8 mt-12 text-2xl">
      ${socials.map((s: any) => {
        const icon = socialIcon(s.platform || s.name || '');
        const url = s.url || s.link || '#';
        const label = s.platform || s.name || 'Social';
        return `
        <a href="${url}" target="_blank" rel="noopener noreferrer"
           class="text-[var(--text)]/55 hover:text-[var(--primary)] transition-all"
           aria-label="${label}">
          <i class="${icon}"></i>
        </a>`;
      }).join('')}
    </div>` : ''}
    <div class="mt-16 opacity-35 text-sm uppercase tracking-widest">
      &copy; ${year} ${content.name || 'Portfolio'}. All rights reserved.
    </div>
  </footer>
  `;
};

export const FOOTER_MINIMAL_SIMPLE = (content: any) => `
  <footer class="py-10 text-center text-xs opacity-35 bg-[var(--bg)] border-t border-[var(--text)]/5">
    <p>&copy; ${year} ${content.name || 'Portfolio'}. All rights reserved.</p>
  </footer>
`;

export const FooterRegistry: Record<string, (content: any) => string> = {
  FOOTER_MINIMAL,
  FOOTER_SOCIAL_HEAVY,
  FOOTER_NEWSLETTER,
  FOOTER_MULTI_COLUMN,
  FOOTER_STICKY_CTA,
  FOOTER_DARK_DETAILED,
  FOOTER_SINGLE_LINE,
  FOOTER_BRAND_FOCUS,
  FOOTER_DARK_SASS,
  FOOTER_AGENCY_BOLD,
  FOOTER_MINIMAL_SIMPLE,
};
