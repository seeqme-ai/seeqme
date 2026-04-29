
// ─── Contact Registry ─────────────────────────────────────────────────────────
// All components return pure HTML strings. Tailwind CDN + FA 6 + CSS vars.

const getSocialIcon = (platform: string): string => {
  const p = (platform || '').toLowerCase();
  const map: Record<string, string> = {
    github: 'fab fa-github',
    linkedin: 'fab fa-linkedin',
    twitter: 'fab fa-twitter',
    x: 'fab fa-x-twitter',
    instagram: 'fab fa-instagram',
    dribbble: 'fab fa-dribbble',
    behance: 'fab fa-behance',
    youtube: 'fab fa-youtube',
    tiktok: 'fab fa-tiktok',
    discord: 'fab fa-discord',
    medium: 'fab fa-medium',
    dev: 'fab fa-dev',
    stackoverflow: 'fab fa-stack-overflow',
    facebook: 'fab fa-facebook',
    pinterest: 'fab fa-pinterest',
    telegram: 'fab fa-telegram',
    twitch: 'fab fa-twitch',
    snapchat: 'fab fa-snapchat',
    reddit: 'fab fa-reddit',
    spotify: 'fab fa-spotify',
  };
  for (const [key, icon] of Object.entries(map)) {
    if (p.includes(key)) return icon;
  }
  return 'fas fa-link';
};

// ── Shared mailto submit script factory ─────────────────────────────────────
const mailtoScript = (formId: string, email: string, fields: { name: string; email: string; subject?: string; message: string }) => `
<script>
(function() {
  var form = document.getElementById('${formId}');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var nameEl = document.getElementById('${fields.name}');
    var emailEl = document.getElementById('${fields.email}');
    var subjectEl = ${fields.subject ? `document.getElementById('${fields.subject}')` : 'null'};
    var msgEl = document.getElementById('${fields.message}');
    var name = nameEl ? nameEl.value : '';
    var senderEmail = emailEl ? emailEl.value : '';
    var subject = subjectEl ? subjectEl.value : ('Portfolio Inquiry from ' + name);
    var message = msgEl ? msgEl.value : '';
    var mailSubject = encodeURIComponent('Portfolio Inquiry from ' + name + (subjectEl ? ': ' + subject : ''));
    var mailBody = encodeURIComponent('Name: ' + name + '\\nEmail: ' + senderEmail + (subjectEl ? '\\nSubject: ' + subject : '') + '\\n\\nMessage:\\n' + message);
    window.open('mailto:${email}?subject=' + mailSubject + '&body=' + mailBody, '_blank', 'noopener,noreferrer');
  });
})();
</script>`;

// ─────────────────────────────────────────────────────────────────────────────

export const CONTACT_SPLIT = (content: any) => {
  const email = content.email || '';
  const socials = content.socials || [];
  return `
  <section id="contact" data-section="contact" class="py-28 px-6 border-t border-[var(--text)]/5">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

      <!-- Left: contact info -->
      <div class="space-y-12">
        <div class="space-y-4">
          <p class="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">${content.label || 'Contact'}</p>
          <h2 class="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95]" data-field="contact-title">
            ${content.title || "Let's Work Together"}
          </h2>
        </div>

        <div class="space-y-8">
          <!-- Email -->
          ${email ? `
          <div>
            <p class="text-[9px] font-black uppercase tracking-[0.4em] opacity-35 mb-2">Email</p>
            <a href="mailto:${email}" class="text-2xl md:text-3xl font-bold hover:text-[var(--primary)] transition-colors underline decoration-2 underline-offset-8 decoration-[var(--primary)]/20 break-all" data-field="contact-email">
              ${email}
            </a>
          </div>` : ''}

          <!-- Phone -->
          ${content.phone ? `
          <div>
            <p class="text-[9px] font-black uppercase tracking-[0.4em] opacity-35 mb-2">Phone</p>
            <a href="tel:${content.phone}" class="text-2xl font-bold hover:text-[var(--primary)] transition-colors" data-field="contact-phone">
              ${content.phone}
            </a>
          </div>` : ''}

          <!-- Location -->
          ${content.location ? `
          <div>
            <p class="text-[9px] font-black uppercase tracking-[0.4em] opacity-35 mb-2">Location</p>
            <p class="text-xl font-bold opacity-80" data-field="contact-location">
              <i class="fas fa-location-dot text-[var(--primary)] mr-2 text-sm"></i>${content.location}
            </p>
          </div>` : ''}

          <!-- Social links -->
          ${socials.length > 0 ? `
          <div>
            <p class="text-[9px] font-black uppercase tracking-[0.4em] opacity-35 mb-4">Find Me Online</p>
            <div class="flex flex-wrap gap-3">
              ${socials.map((s: any) => {
                const icon = getSocialIcon(s.platform || s.name || '');
                const url = s.link || s.url || '#';
                const label = s.platform || s.name || 'Social';
                return `
                <a href="${url}" target="_blank" rel="noopener noreferrer"
                   class="w-11 h-11 rounded-xl bg-[var(--surface)] border border-[var(--text)]/10 flex items-center justify-center hover:bg-[var(--primary)] hover:text-[var(--bg)] hover:border-[var(--primary)] transition-all duration-300 group"
                   aria-label="${label}">
                  <i class="${icon} text-base group-hover:scale-110 transition-transform"></i>
                </a>`;
              }).join('')}
            </div>
          </div>` : ''}
        </div>
      </div>

      <!-- Right: frosted-glass contact form -->
      <div class="bg-[var(--surface)]/80 backdrop-blur-xl border border-[var(--text)]/10 rounded-[2.5rem] p-10 md:p-12 shadow-2xl">
        <h3 class="text-xl font-black uppercase tracking-widest mb-8">Send a Message</h3>
        <form id="contact-split-form" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Your Name</label>
            <input id="split-name" type="text" placeholder="Full Name" required
              class="w-full bg-transparent border-b-2 border-[var(--text)]/10 py-3.5 focus:outline-none focus:border-[var(--primary)] transition-colors font-semibold text-[var(--heading)] placeholder:opacity-30" />
          </div>
          <div class="space-y-2">
            <label class="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Your Email</label>
            <input id="split-email" type="email" placeholder="you@example.com" required
              class="w-full bg-transparent border-b-2 border-[var(--text)]/10 py-3.5 focus:outline-none focus:border-[var(--primary)] transition-colors font-semibold text-[var(--heading)] placeholder:opacity-30" />
          </div>
          <div class="space-y-2">
            <label class="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Message</label>
            <textarea id="split-message" rows="5" placeholder="Tell me about your project..." required
              class="w-full bg-transparent border-b-2 border-[var(--text)]/10 py-3.5 focus:outline-none focus:border-[var(--primary)] transition-colors font-semibold text-[var(--heading)] placeholder:opacity-30 resize-none"></textarea>
          </div>
          <button type="submit"
            class="w-full py-5 bg-[var(--primary)] text-[var(--bg)] font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-lg">
            Send Message <i class="fas fa-paper-plane ml-2"></i>
          </button>
        </form>
      </div>

    </div>
    ${mailtoScript('contact-split-form', email, { name: 'split-name', email: 'split-email', message: 'split-message' })}
  </section>
  `;
};

export const CONTACT_NEON_MODERN = (content: any) => {
  const email = content.email || '';
  const socials = content.socials || [];
  return `
  <section id="contact" data-section="contact" class="py-36 px-6 relative overflow-hidden bg-[#020817]">

    <!-- Ambient glow -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-[var(--primary)]/8 blur-[150px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-[40vw] h-[40vh] bg-[var(--secondary,#7000ff)]/6 blur-[120px] rounded-full pointer-events-none"></div>

    <div class="max-w-4xl mx-auto relative z-10 text-center space-y-16">

      <!-- Headline -->
      <div class="space-y-5">
        <p class="text-[9px] font-black uppercase tracking-[0.6em] text-[var(--primary)]">${content.label || 'Contact'}</p>
        <h2 class="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white" data-field="contact-title"
            style="text-shadow: 0 0 40px color-mix(in srgb, var(--primary) 40%, transparent);">
          ${content.title || 'Ready to Start?'}
        </h2>
        <p class="text-xl text-white/50 font-medium max-w-xl mx-auto leading-relaxed" data-field="contact-bio">
          ${content.bio || content.description || 'Crafting excellence for high-impact projects worldwide.'}
        </p>
      </div>

      <!-- Email neon link -->
      ${email ? `
      <a href="mailto:${email}" data-field="contact-email"
         class="block text-2xl md:text-4xl font-bold text-[var(--primary)] hover:opacity-80 transition-opacity break-all"
         style="text-shadow: 0 0 30px color-mix(in srgb, var(--primary) 60%, transparent);">
        ${email}
      </a>` : ''}

      <!-- Social pill buttons -->
      ${socials.length > 0 ? `
      <div class="flex flex-wrap justify-center gap-3">
        ${socials.map((s: any) => {
          const icon = getSocialIcon(s.platform || s.name || '');
          const url = s.link || s.url || '#';
          const label = s.platform || s.name || 'Social';
          return `
          <a href="${url}" target="_blank" rel="noopener noreferrer"
             class="flex items-center gap-2.5 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white hover:bg-[var(--primary)] hover:text-[var(--bg)] hover:border-[var(--primary)] transition-all duration-300"
             style="hover-box-shadow: 0 0 20px color-mix(in srgb, var(--primary) 50%, transparent);">
            <i class="${icon} text-sm"></i> ${label}
          </a>`;
        }).join('')}
      </div>` : ''}

      <!-- Form -->
      <form id="contact-neon-form" class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-14 space-y-6 text-left">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Name</label>
            <input type="text" id="neon-name" placeholder="Your Name" required
              class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-medium placeholder:text-white/20" />
          </div>
          <div class="space-y-2">
            <label class="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Email</label>
            <input type="email" id="neon-email" placeholder="you@example.com" required
              class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-medium placeholder:text-white/20" />
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Message</label>
          <textarea id="neon-message" rows="5" placeholder="How can we collaborate?" required
            class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-medium placeholder:text-white/20 resize-none"></textarea>
        </div>
        <button type="submit"
          class="w-full py-5 bg-[var(--primary)] text-[var(--bg)] font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:opacity-90 transition-all"
          style="box-shadow: 0 20px 50px -10px color-mix(in srgb, var(--primary) 50%, transparent);">
          Send Message <i class="fas fa-paper-plane ml-2"></i>
        </button>
      </form>

      <p class="text-white/20 text-xs font-bold uppercase tracking-widest">
        <i class="fas fa-clock mr-2"></i> Typical response within 24 hours
      </p>

    </div>
    ${mailtoScript('contact-neon-form', email, { name: 'neon-name', email: 'neon-email', message: 'neon-message' })}
  </section>
  `;
};

export const CONTACT_SOCIAL_ONLY = (content: any) => {
  const socials = content.socials || [];
  const email = content.email || '';
  return `
  <section id="contact" data-section="contact" class="py-28 px-6 text-center">
    <div class="max-w-4xl mx-auto space-y-14">

      <div class="space-y-4">
        <p class="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">${content.label || 'Connect'}</p>
        <h2 class="text-4xl md:text-6xl font-black tracking-tighter" data-field="contact-title">
          ${content.title || 'Find Me Online'}
        </h2>
        ${content.description ? `<p class="text-lg opacity-55 max-w-xl mx-auto">${content.description}</p>` : ''}
      </div>

      <!-- Social platform cards grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${socials.map((s: any) => {
          const icon = getSocialIcon(s.platform || s.name || '');
          const url = s.link || s.url || '#';
          const label = s.platform || s.name || 'Social';
          return `
          <a href="${url}" target="_blank" rel="noopener noreferrer"
             class="group flex flex-col items-center gap-4 p-8 bg-[var(--surface)] border border-[var(--text)]/5 rounded-3xl hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all duration-400">
            <i class="${icon} text-3xl group-hover:text-[var(--bg)] transition-colors duration-300"></i>
            <div class="text-center">
              <p class="text-xs font-black uppercase tracking-widest group-hover:text-[var(--bg)] transition-colors">${label}</p>
              <p class="text-[9px] opacity-40 mt-1 group-hover:opacity-70 transition-opacity group-hover:text-[var(--bg)]">Connect &rarr;</p>
            </div>
          </a>`;
        }).join('')}
        ${socials.length === 0 ? '<p class="col-span-full text-sm opacity-40">No social links provided.</p>' : ''}
      </div>

      <!-- Email CTA -->
      ${email ? `
      <div class="pt-4">
        <a href="mailto:${email}"
           class="inline-flex items-center gap-3 px-8 py-4 bg-[var(--primary)] text-[var(--bg)] font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-all duration-300 shadow-lg">
          <i class="fas fa-envelope"></i> ${email}
        </a>
      </div>` : ''}

    </div>
  </section>
  `;
};

export const CONTACT_CARD_SIMPLE = (content: any) => {
  const email = content.email || '';
  const socials = content.socials || [];
  return `
  <section id="contact" data-section="contact" class="py-28 px-6">
    <div class="max-w-2xl mx-auto">
      <div class="relative bg-[var(--surface)] border border-[var(--text)]/10 rounded-[3rem] p-12 md:p-16 shadow-2xl overflow-hidden text-center">

        <!-- Decorative blob -->
        <div class="absolute top-0 right-0 w-56 h-56 bg-[var(--primary)]/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-40 h-40 bg-[var(--primary)]/5 blur-[60px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div class="relative z-10 space-y-10">
          <div class="space-y-3">
            <p class="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">${content.label || 'Contact'}</p>
            <h2 class="text-4xl md:text-5xl font-black tracking-tighter" data-field="contact-title">
              ${content.title || "Let's Connect"}
            </h2>
          </div>

          <!-- Email -->
          ${email ? `
          <div class="space-y-2">
            <p class="text-[9px] font-black uppercase tracking-[0.35em] opacity-35">Email</p>
            <a href="mailto:${email}"
               class="text-2xl md:text-3xl font-bold hover:text-[var(--primary)] transition-colors break-all underline decoration-4 decoration-[var(--primary)]/20"
               data-field="contact-email">${email}</a>
          </div>` : ''}

          <!-- Phone -->
          ${content.phone ? `
          <div class="space-y-2">
            <p class="text-[9px] font-black uppercase tracking-[0.35em] opacity-35">Phone</p>
            <a href="tel:${content.phone}" class="text-xl font-bold hover:text-[var(--primary)] transition-colors" data-field="contact-phone">${content.phone}</a>
          </div>` : ''}

          <!-- Location -->
          ${content.location ? `
          <p class="text-base opacity-50" data-field="contact-location">
            <i class="fas fa-location-dot text-[var(--primary)] mr-2"></i>${content.location}
          </p>` : ''}

          <!-- Social links row -->
          ${socials.length > 0 ? `
          <div class="flex flex-wrap justify-center gap-3 pt-2">
            ${socials.map((s: any) => {
              const icon = getSocialIcon(s.platform || s.name || '');
              const url = s.link || s.url || '#';
              const label = s.platform || s.name || 'Social';
              return `
              <a href="${url}" target="_blank" rel="noopener noreferrer"
                 class="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--text)]/10 flex items-center justify-center hover:bg-[var(--primary)] hover:text-[var(--bg)] hover:border-[var(--primary)] transition-all duration-300"
                 aria-label="${label}">
                <i class="${icon} text-sm"></i>
              </a>`;
            }).join('')}
          </div>` : ''}

          <!-- CTA button -->
          ${email ? `
          <a href="mailto:${email}"
             class="inline-flex items-center gap-3 px-8 py-4 bg-[var(--primary)] text-[var(--bg)] font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-all duration-300 shadow-lg">
            <i class="fas fa-envelope"></i> Send me an email
          </a>` : ''}
        </div>
      </div>
    </div>
  </section>
  `;
};

export const CONTACT_FORM_FULL = (content: any) => {
  const email = content.email || '';
  const socials = content.socials || [];
  return `
  <section id="contact" data-section="contact" class="py-28 px-6 border-t border-[var(--text)]/5">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

      <!-- Left: context panel -->
      <div class="lg:col-span-5 space-y-10">
        <div class="space-y-4">
          <p class="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">${content.label || 'New Project'}</p>
          <h2 class="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]" data-field="contact-title">
            ${content.title || "Start a Project"}
          </h2>
        </div>

        <p class="text-xl opacity-60 leading-[1.85]" data-field="contact-content">
          ${content.content || content.description || 'Tell me about your project and I\'ll get back to you with how we can make it happen.'}
        </p>

        <div class="grid grid-cols-2 gap-6">
          <div class="p-6 bg-[var(--surface)] rounded-2xl border border-[var(--text)]/5">
            <p class="text-[9px] font-black uppercase tracking-[0.35em] opacity-35 mb-2">Response Time</p>
            <p class="font-bold text-sm"><i class="fas fa-clock text-[var(--primary)] mr-2"></i>24–48 Hours</p>
          </div>
          <div class="p-6 bg-[var(--surface)] rounded-2xl border border-[var(--text)]/5">
            <p class="text-[9px] font-black uppercase tracking-[0.35em] opacity-35 mb-2">Availability</p>
            <p class="font-bold text-sm"><i class="fas fa-circle text-green-500 mr-2"></i>Open to Work</p>
          </div>
        </div>

        ${email ? `
        <div class="space-y-2">
          <p class="text-[9px] font-black uppercase tracking-[0.35em] opacity-35">Or email directly</p>
          <a href="mailto:${email}" class="text-lg font-bold hover:text-[var(--primary)] transition-colors break-all" data-field="contact-email">${email}</a>
        </div>` : ''}

        ${socials.length > 0 ? `
        <div class="flex flex-wrap gap-3">
          ${socials.map((s: any) => {
            const icon = getSocialIcon(s.platform || s.name || '');
            const url = s.link || s.url || '#';
            const label = s.platform || s.name || 'Social';
            return `
            <a href="${url}" target="_blank" rel="noopener noreferrer"
               class="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--text)]/10 flex items-center justify-center hover:bg-[var(--primary)] hover:text-[var(--bg)] transition-all duration-300"
               aria-label="${label}">
              <i class="${icon} text-sm"></i>
            </a>`;
          }).join('')}
        </div>` : ''}
      </div>

      <!-- Right: full form -->
      <div class="lg:col-span-7 bg-[var(--surface)] border border-[var(--text)]/5 rounded-[2.5rem] p-10 md:p-14 shadow-xl">
        <form id="contact-full-form" class="space-y-6">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Full Name *</label>
              <input id="full-name" type="text" placeholder="Jane Smith" required
                class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-xl px-5 py-3.5 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all font-medium" />
            </div>
            <div class="space-y-2">
              <label class="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Company</label>
              <input id="full-company" type="text" placeholder="Acme Inc."
                class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-xl px-5 py-3.5 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all font-medium" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Email Address *</label>
            <input id="full-email" type="email" placeholder="jane@acme.com" required
              class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-xl px-5 py-3.5 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all font-medium" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Budget Range</label>
              <select id="full-budget"
                class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-xl px-5 py-3.5 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all font-medium appearance-none cursor-pointer">
                <option value="">Select range...</option>
                <option value="sub5k">Under $5,000</option>
                <option value="5-15k">$5,000 – $15,000</option>
                <option value="15-50k">$15,000 – $50,000</option>
                <option value="50k+">$50,000+</option>
                <option value="tbd">Let's discuss</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Project Type</label>
              <select id="full-type"
                class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-xl px-5 py-3.5 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all font-medium appearance-none cursor-pointer">
                <option value="">Select type...</option>
                <option value="website">Website / Web App</option>
                <option value="mobile">Mobile App</option>
                <option value="design">Design / Branding</option>
                <option value="consulting">Consulting</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Project Details *</label>
            <textarea id="full-message" rows="6" placeholder="Tell me about your project, goals, and timeline..." required
              class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-xl px-5 py-3.5 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all font-medium resize-none"></textarea>
          </div>

          <button type="submit"
            class="w-full py-5 bg-[var(--primary)] text-[var(--bg)] font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:opacity-90 hover:scale-[1.01] transition-all duration-300 shadow-lg">
            Submit Project Brief <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </form>
      </div>

    </div>
    <script>
    (function() {
      var form = document.getElementById('contact-full-form');
      if (!form) return;
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = (document.getElementById('full-name') || {}).value || '';
        var company = (document.getElementById('full-company') || {}).value || '';
        var senderEmail = (document.getElementById('full-email') || {}).value || '';
        var budget = (document.getElementById('full-budget') || {}).value || '';
        var type = (document.getElementById('full-type') || {}).value || '';
        var message = (document.getElementById('full-message') || {}).value || '';
        var sub = encodeURIComponent('Project Brief from ' + name + (company ? ' (' + company + ')' : ''));
        var body = encodeURIComponent(
          'Name: ' + name + '\\n' +
          'Company: ' + company + '\\n' +
          'Email: ' + senderEmail + '\\n' +
          'Budget: ' + budget + '\\n' +
          'Project Type: ' + type + '\\n\\n' +
          'Details:\\n' + message
        );
        window.open('mailto:${email}?subject=' + sub + '&body=' + body, '_blank', 'noopener,noreferrer');
      });
    })();
    </script>
  </section>
  `;
};

// ── Legacy/alias components kept for backward compatibility ──────────────────

export const FORM_MINIMALIST = (content: any) => {
  const email = content.email || '';
  return `
  <section id="contact" data-section="contact" class="py-24 px-6 bg-[var(--surface)]/30 text-center">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-3xl font-bold mb-4 text-[var(--heading)]" data-field="contact-title">${content.title || "Let's Connect"}</h2>
      <p class="text-[var(--text)] opacity-65 mb-10 leading-relaxed">${content.description || "Send me a message and I'll get back to you shortly."}</p>
      <form id="form-minimalist" class="space-y-6 text-left bg-[var(--bg)] p-8 md:p-12 shadow-sm border border-[var(--text)]/5 rounded-2xl">
        <div class="space-y-2">
          <label class="text-[9px] font-black uppercase tracking-widest opacity-45">Name</label>
          <input type="text" id="min-name" required class="w-full bg-[var(--surface)] border-b border-[var(--text)]/10 p-3 focus:outline-none focus:border-[var(--primary)] transition-colors text-[var(--heading)]" />
        </div>
        <div class="space-y-2">
          <label class="text-[9px] font-black uppercase tracking-widest opacity-45">Email</label>
          <input type="email" id="min-email" required class="w-full bg-[var(--surface)] border-b border-[var(--text)]/10 p-3 focus:outline-none focus:border-[var(--primary)] transition-colors text-[var(--heading)]" />
        </div>
        <div class="space-y-2">
          <label class="text-[9px] font-black uppercase tracking-widest opacity-45">Message</label>
          <textarea id="min-message" rows="4" required class="w-full bg-[var(--surface)] border-b border-[var(--text)]/10 p-3 focus:outline-none focus:border-[var(--primary)] transition-colors resize-none text-[var(--heading)]"></textarea>
        </div>
        <button type="submit" class="w-full py-4 bg-[var(--heading)] text-[var(--bg)] font-bold uppercase tracking-widest text-xs hover:bg-[var(--primary)] transition-colors rounded-lg">
          Send Message
        </button>
      </form>
    </div>
    ${mailtoScript('form-minimalist', email, { name: 'min-name', email: 'min-email', message: 'min-message' })}
  </section>
  `;
};

export const FORM_ELEGANT_SPLIT = (content: any) => {
  const email = content.email || '';
  return `
  <section id="contact" data-section="contact" class="py-24 px-6">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-14">
        <span class="text-[var(--primary)] font-bold tracking-widest text-xs uppercase">${content.label || 'Contact'}</span>
        <h2 class="text-4xl md:text-5xl font-black text-[var(--heading)] mt-4 tracking-tighter">${content.title || 'Get in Touch'}</h2>
        <p class="text-[var(--text)] opacity-55 mt-4 max-w-lg mx-auto">${content.description || "Let's work together."}</p>
      </div>
      <div class="bg-[var(--surface)] rounded-[2rem] p-8 md:p-12 shadow-xl border border-[var(--text)]/5">
        <form id="form-elegant" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[9px] font-black uppercase tracking-widest opacity-40">Name</label>
              <input type="text" id="eles-name" required class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-[9px] font-black uppercase tracking-widest opacity-40">Email</label>
              <input type="email" id="eles-email" required class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-[9px] font-black uppercase tracking-widest opacity-40">Message</label>
            <textarea id="eles-message" rows="5" required class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none"></textarea>
          </div>
          <button type="submit" class="w-full py-4 bg-[var(--primary)] text-[var(--bg)] font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-all shadow-lg active:scale-[0.98] text-xs">
            Send Message
          </button>
        </form>
      </div>
    </div>
    ${mailtoScript('form-elegant', email, { name: 'eles-name', email: 'eles-email', message: 'eles-message' })}
  </section>
  `;
};

export const FORM_TECH_AUDIT = (content: any) => {
  const email = content.email || '';
  return `
  <section id="contact" data-section="contact" class="py-32 px-6 bg-[var(--bg)] text-center">
    <div class="max-w-2xl mx-auto bg-[var(--surface)]/50 backdrop-blur-md p-12 rounded-3xl border border-[var(--text)]/10 shadow-2xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-[50px] rounded-full pointer-events-none"></div>
      <h2 class="text-3xl font-bold text-[var(--heading)] mb-4 relative z-10">${content.title || 'Book an Audit'}</h2>
      <p class="text-[var(--text)] opacity-55 mb-10 relative z-10">${content.description || 'Stop wasting time on manual tasks.'}</p>
      <form id="form-tech-audit" class="space-y-6 text-left max-w-md mx-auto relative z-10">
        <div class="space-y-2">
          <label class="text-[9px] font-black uppercase tracking-widest text-[var(--primary)]">Name</label>
          <input type="text" id="audit-name" required class="w-full bg-[var(--bg)] border border-[var(--text)]/20 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all font-mono text-sm" />
        </div>
        <div class="space-y-2">
          <label class="text-[9px] font-black uppercase tracking-widest text-[var(--primary)]">Email</label>
          <input type="email" id="audit-email" required class="w-full bg-[var(--bg)] border border-[var(--text)]/20 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all font-mono text-sm" />
        </div>
        <div class="space-y-2">
          <label class="text-[9px] font-black uppercase tracking-widest text-[var(--primary)]">What do you need audited?</label>
          <textarea id="audit-message" rows="4" required class="w-full bg-[var(--bg)] border border-[var(--text)]/20 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none font-mono text-sm"></textarea>
        </div>
        <button type="submit" class="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary,var(--primary))] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg tracking-wider uppercase text-xs">
          Request Audit
        </button>
      </form>
    </div>
    ${mailtoScript('form-tech-audit', email, { name: 'audit-name', email: 'audit-email', message: 'audit-message' })}
  </section>
  `;
};

export const CONTACT_DARK_SASS = (content: any) => {
  const email = content.email || '';
  return `
  <section id="contact" data-section="contact" class="py-32 px-6 bg-[#0f172a] text-center">
    <div class="max-w-2xl mx-auto bg-slate-800 p-12 rounded-3xl border border-slate-700 shadow-xl">
      <h2 class="text-3xl font-bold text-white mb-4">${content.title || "Let's Talk"}</h2>
      <p class="text-slate-400 mb-10">${content.description || content.bio || ''}</p>
      <form id="contact-dark-sass" class="space-y-6 text-left max-w-md mx-auto">
        <div class="space-y-2">
          <label class="text-[9px] font-black uppercase tracking-widest text-slate-400">Name</label>
          <input type="text" id="ds-name" placeholder="Your Name" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all" />
        </div>
        <div class="space-y-2">
          <label class="text-[9px] font-black uppercase tracking-widest text-slate-400">Email</label>
          <input type="email" id="ds-email" placeholder="you@example.com" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all" />
        </div>
        <div class="space-y-2">
          <label class="text-[9px] font-black uppercase tracking-widest text-slate-400">Message</label>
          <textarea id="ds-message" rows="4" placeholder="What can I help you with?" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all resize-none"></textarea>
        </div>
        <button type="submit" class="w-full py-4 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg">
          Send Message
        </button>
      </form>
    </div>
    ${mailtoScript('contact-dark-sass', email, { name: 'ds-name', email: 'ds-email', message: 'ds-message' })}
  </section>
  `;
};

export const CONTACT_MINIMAL_SIMPLE = (content: any) => {
  const email = content.email || '';
  return `
  <section id="contact" data-section="contact" class="py-24 px-6 bg-stone-900 text-white text-center">
    <h2 class="text-4xl font-serif italic mb-6" data-field="contact-title">${content.title || "Let's Connect"}</h2>
    <p class="text-stone-400 mb-12 max-w-lg mx-auto">${content.subtitle || 'Ready to start your project?'}</p>
    <form id="contact-minimal-simple" class="max-w-md mx-auto space-y-4 text-left">
      <div>
        <label class="text-xs uppercase font-bold tracking-widest text-stone-500 mb-2 block">Name</label>
        <input type="text" id="ms-name" required class="w-full bg-stone-800 border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-stone-500 focus:outline-none" />
      </div>
      <div>
        <label class="text-xs uppercase font-bold tracking-widest text-stone-500 mb-2 block">Email</label>
        <input type="email" id="ms-email" required class="w-full bg-stone-800 border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-stone-500 focus:outline-none" />
      </div>
      <div>
        <label class="text-xs uppercase font-bold tracking-widest text-stone-500 mb-2 block">Message</label>
        <textarea id="ms-message" rows="4" required class="w-full bg-stone-800 border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-stone-500 focus:outline-none resize-none"></textarea>
      </div>
      <button type="submit" class="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-stone-200 transition-colors mt-2">
        Send Request
      </button>
    </form>
    ${mailtoScript('contact-minimal-simple', email, { name: 'ms-name', email: 'ms-email', message: 'ms-message' })}
  </section>
  `;
};

export const ContactRegistry: Record<string, (content: any) => string> = {
  CONTACT_SPLIT,
  CONTACT_NEON_MODERN,
  CONTACT_SOCIAL_ONLY,
  CONTACT_CARD_SIMPLE,
  CONTACT_FORM_FULL,
  FORM_MINIMALIST,
  FORM_ELEGANT_SPLIT,
  FORM_TECH_AUDIT,
  CONTACT_DARK_SASS,
  CONTACT_MINIMAL_SIMPLE,
};
