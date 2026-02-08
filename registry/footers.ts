// Footer Components - Professional, Modern, Responsive

export const FOOTER_MINIMAL = (content: any) => `
  <footer class="py-12 px-6 border-t border-[var(--text)]/10">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <p class="text-sm opacity-60" data-field="footer-copyright">
        © ${new Date().getFullYear()} ${content.name || 'Portfolio'}. All rights reserved.
      </p>
      <div class="flex gap-6">
        ${(content.socials || []).map((social: any) => `
          <a href="${social.url}" target="_blank" rel="noopener" class="text-[var(--text)] opacity-60 hover:opacity-100 hover:text-[var(--primary)] transition-all" aria-label="${social.platform}">
            <i class="fab fa-${social.platform.toLowerCase()} text-xl"></i>
          </a>
        `).join('')}
      </div>
    </div>
  </footer>
`;

export const FOOTER_SOCIAL_HEAVY = (content: any) => `
  <footer class="py-16 px-6 bg-[var(--surface)]">
    <div class="max-w-7xl mx-auto">
      <div class="text-center space-y-8 mb-12">
        <h3 class="text-3xl md:text-5xl font-black" data-field="footer-cta">${content.ctaText || "Let's Connect"}</h3>
        <div class="flex flex-wrap justify-center gap-4">
          ${(content.socials || []).map((social: any) => `
            <a href="${social.url}" target="_blank" rel="noopener" 
               class="w-14 h-14 rounded-full bg-[var(--primary)]/10 hover:bg-[var(--primary)] flex items-center justify-center transition-all hover:scale-110 group">
              <i class="fab fa-${social.platform.toLowerCase()} text-xl group-hover:text-[var(--bg)]"></i>
            </a>
          `).join('')}
        </div>
      </div>
      <div class="text-center text-sm opacity-40 border-t border-[var(--text)]/10 pt-8">
        <p>© ${new Date().getFullYear()} ${content.name}. Crafted with precision.</p>
      </div>
    </div>
  </footer>
`;

export const FOOTER_NEWSLETTER = (content: any) => `
  <footer class="py-20 px-6 bg-gradient-to-t from-[var(--surface)] to-transparent">
    <div class="max-w-7xl mx-auto mt-12 pt-8 border-t border-[var(--text)]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-40">
      <p>© ${new Date().getFullYear()} ${content.name}</p>
    </div>
  </footer>
`;

export const FOOTER_MULTI_COLUMN = (content: any) => `
  <footer class="py-20 px-6 bg-[var(--surface)]">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
      <div class="space-y-4">
        <h4 class="text-2xl font-black" data-field="footer-brand">${content.name || 'Portfolio'}</h4>
        <p class="text-sm opacity-60 leading-relaxed" data-field="footer-tagline">
          ${content.tagline || 'Building exceptional digital experiences.'}
        </p>
      </div>
      <div class="space-y-4">
        <h5 class="font-bold uppercase tracking-wider text-xs opacity-40">Quick Links</h5>
        <nav class="flex flex-col gap-2">
          ${(content.links || ['About', 'Projects', 'Contact']).map((link: string) => `
            <a href="#${link.toLowerCase()}" class="text-sm opacity-60 hover:opacity-100 hover:text-[var(--primary)] transition-all">
              ${link}
            </a>
          `).join('')}
        </nav>
      </div>
      <div class="space-y-4">
        <h5 class="font-bold uppercase tracking-wider text-xs opacity-40">Contact</h5>
        <div class="space-y-2 text-sm opacity-60">
          <p data-field="footer-email">${content.email || 'hello@example.com'}</p>
          <p data-field="footer-location">${content.location || 'Remote'}</p>
        </div>
      </div>
      <div class="space-y-4">
        <h5 class="font-bold uppercase tracking-wider text-xs opacity-40">Follow</h5>
        <div class="flex gap-3">
          ${(content.socials || []).map((social: any) => `
            <a href="${social.url}" target="_blank" rel="noopener" class="w-10 h-10 rounded-lg bg-[var(--bg)] flex items-center justify-center hover:bg-[var(--primary)] hover:text-[var(--bg)] transition-all">
              <i class="fab fa-${social.platform.toLowerCase()}"></i>
            </a>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="max-w-7xl mx-auto pt-8 border-t border-[var(--text)]/10 text-center text-xs opacity-40">
      <p>© ${new Date().getFullYear()} ${content.name}. All rights reserved.</p>
    </div>
  </footer>
`;

export const FOOTER_STICKY_CTA = (content: any) => `
  <footer class="sticky bottom-0 z-40 backdrop-blur-xl bg-[var(--surface)]/80 border-t border-[var(--text)]/10">
    <div class="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="text-center md:text-left">
        <p class="font-bold text-lg" data-field="footer-sticky-title">
          ${content.stickyTitle || 'Ready to work together?'}
        </p>
        <p class="text-sm opacity-60" data-field="footer-sticky-subtitle">
          ${content.stickySubtitle || "Let's create something amazing."}
        </p>
      </div>
      <a href="${content.ctaLink || '#contact'}" 
         class="px-8 py-4 rounded-full bg-[var(--primary)] text-[var(--bg)] font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-lg whitespace-nowrap">
        ${content.ctaText || 'Get in Touch'}
      </a>
    </div>
  </footer>
`;

export const FOOTER_DARK_DETAILED = (content: any) => `
  <footer class="py-24 px-6 bg-[#0a0a0a] text-white border-t border-white/5">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
       <div class="md:col-span-4 space-y-8">
          <h4 class="text-3xl font-black italic tracking-tighter">${content.name || 'Company Name'}</h4>
          <p class="text-gray-500 leading-relaxed text-lg">${content.tagline || 'Engineering high-impact digital solutions for global industry leaders.'}</p>
          <div class="flex gap-4">
             ${(content.socials || []).map((s: any) => `<a href="${s.url}" target="_blank" rel="noopener" class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[var(--primary)] transition-all"><i class="fab fa-${s.platform.toLowerCase()}"></i></a>`).join('')}
          </div>
       </div>
       <div class="md:col-span-4 p-8 bg-zinc-900 rounded-3xl border border-white/5">
          <h5 class="text-lg font-black mb-4">Start a conversation</h5>
          <p class="text-sm text-gray-400 mb-6 font-medium">Ready to discuss your next project? Drop me a line.</p>
          <a href="mailto:${content.email || 'hello@example.com'}" class="text-[var(--primary)] font-black uppercase tracking-widest text-xs underline decoration-2 underline-offset-8">Send Email ↗</a>
       </div>
    </div>
    <div class="max-w-7xl mx-auto pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
       <p>© ${new Date().getFullYear()} ${content.name}</p>
    </div>
  </footer>
`;

export const FOOTER_SINGLE_LINE = (content: any) => `
  <footer class="py-12 px-6 border-t border-[var(--text)]/5">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.5em] opacity-40">
       <p>${content.name || 'Portfolio'} // ALL RIGHTS RESERVED</p>
       <div class="flex gap-8">
          ${(content.socials || []).map((s: any) => `<a href="${s.url}" target="_blank" rel="noopener" class="hover:text-[var(--primary)] transition-colors">${s.platform}</a>`).join('')}
       </div>
       <p>EDITION ${new Date().getFullYear()}</p>
    </div>
  </footer>
`;

export const FOOTER_BRAND_FOCUS = (content: any) => `
  <footer class="py-32 px-6 text-center space-y-16">
    <h4 class="text-[15vw] font-black tracking-tighter leading-none opacity-5 uppercase select-none">${content.name || 'BRAND'}</h4>
    <div class="max-w-4xl mx-auto space-y-12">
       <div class="flex justify-center gap-12">
          ${(content.socials || []).map((s: any) => `<a href="${s.url}" target="_blank" rel="noopener" class="text-sm font-black uppercase tracking-widest hover:text-[var(--primary)] transition-colors">${s.platform}</a>`).join('')}
       </div>
       <div class="h-px w-full bg-[var(--text)]/5"></div>
       <div class="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
          <p>© ${new Date().getFullYear()} ${content.name || 'Brand'}</p>
          <a href="mailto:${content.email || 'contact@brand.com'}" class="hover:text-[var(--primary)] transition-colors">${content.email || 'contact@brand.com'}</a>

       </div>
    </div>
  </footer>
`;


export const FOOTER_DARK_SASS = (content: any) => `
     <footer class="py-12 px-6 bg-[#0f172a] text-center text-slate-600 text-xs font-mono border-t border-slate-800">
         <a href="mailto:${content.footerEmail || content.email}" class="block mb-8 text-xl text-slate-400 hover:text-cyan-400 transition-colors">${content.footerEmail || content.email}</a>
         <h3 class="font-bold text-white mb-4 text-sm">${content.footerHeading || content.name || 'SYSTEM'}</h3>
        <p>${content.copyright || `© ${new Date().getFullYear()} ${content.name || 'SYSTEM'}. ALL RIGHTS RESERVED.`}</p>
     </footer>
`;

export const FOOTER_AGENCY_BOLD = (content: any) => `
    <footer data-section="footer" class="bg-black text-white py-16 px-6 text-center">
         <h2 class="text-4xl md:text-6xl font-black mb-8" data-field="cta-text">${content.ctaText || 'Ready to grow?'}</h2>
         <a href="mailto:${content.email}" target="_blank" rel="noopener" class="text-2xl md:text-4xl text-red-500 hover:text-white transition-colors underline decoration-2 underline-offset-8" data-field="email">${content.email}</a>
         
         <div class="flex justify-center gap-8 mt-12 text-2xl">
            ${(content.socials || []).map((social: any) => `
            <a href="${social.url}" target="_blank" rel="noopener" class="hover:text-red-500"><i class="${social.icon}"></i></a>
            `).join('')}
         </div>
         <div class="mt-16 text-gray-600 text-sm uppercase tracking-widest" data-field="copyright">
            &copy; ${content.year || new Date().getFullYear()} ${content.copyright || 'All rights reserved'}.
         </div>
    </footer>
`;

export const FOOTER_MINIMAL_SIMPLE = (content: any) => `
    <footer data-section="footer" class="py-12 text-center text-xs text-stone-400 bg-stone-900 border-t border-stone-800">
        <p>&copy; ${content.year || new Date().getFullYear()} ${content.copyright || 'All rights reserved'}. All rights reserved.</p>
    </footer>
`;

export const FooterRegistry: any = {
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
  FOOTER_MINIMAL_SIMPLE
};
