
export const CONTACT_SPLIT = (content: any) => `
  <section id="contact" data-section="contact" class="py-24 px-6 border-t border-[var(--text)]/5">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
      <div class="space-y-12">
        <h2 class="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none" data-field="contact-title">${content.title || "Let's Talk"}</h2>
        <div class="space-y-8">
          <div class="group cursor-pointer">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Electronic Mail</p>
            <p class="text-3xl font-bold group-hover:text-[var(--primary)] transition-colors underline decoration-2 underline-offset-8 decoration-[var(--primary)]/20" data-field="contact-email">${content.email}</p>
          </div>
          ${content.phone ? `
          <div class="group cursor-pointer">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Direct Line</p>
            <p class="text-3xl font-bold group-hover:text-[var(--primary)] transition-colors underline decoration-2 underline-offset-8 decoration-[var(--primary)]/20" data-field="contact-phone">${content.phone}</p>
          </div>
          ` : ''}
          ${content.location ? `
          <div class="group cursor-pointer">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Location</p>
            <p class="text-3xl font-bold group-hover:text-[var(--primary)] transition-colors underline decoration-2 underline-offset-8 decoration-[var(--primary)]/20" data-field="contact-location">${content.location}</p>
          </div>
          ` : ''}
          <div class="group cursor-pointer">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Global Relay</p>
            <div class="flex gap-6 mt-4">
              ${(content.socials || []).map((s: any) => `
                <a href="${s.link || s.url}" class="text-sm font-black uppercase tracking-widest hover:text-[var(--primary)] transition-colors" target="_blank" rel="noopener noreferrer">${s.platform || 'Social'}</a>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="bg-[var(--surface)] border border-[var(--text)]/10 rounded-[3rem] p-12 shadow-2xl">
        <form id="portfolio-contact-form" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest opacity-40">Identity</label>
            <input id="contact-name" type="text" placeholder="Full Name" required class="w-full bg-transparent border-b-2 border-[var(--text)]/10 py-4 focus:outline-none focus:border-[var(--primary)] transition-colors font-bold" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest opacity-40">Coordinate</label>
            <input id="contact-email" type="email" placeholder="Email Address" required class="w-full bg-transparent border-b-2 border-[var(--text)]/10 py-4 focus:outline-none focus:border-[var(--primary)] transition-colors font-bold" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest opacity-40">Brief</label>
            <textarea id="contact-message" rows="4" placeholder="How can I assist you?" required class="w-full bg-transparent border-b-2 border-[var(--text)]/10 py-4 focus:outline-none focus:border-[var(--primary)] transition-colors font-bold resize-none"></textarea>
          </div>
          <button type="submit" class="w-full py-5 bg-[var(--primary)] text-[var(--bg)] font-black uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-opacity">Send</button>
        </form>
      </div>
    </div>
    <script>
      (function() {
        const form = document.getElementById('portfolio-contact-form');
        if (form) {
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            const senderEmail = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;
            
            const subject = encodeURIComponent('Portfolio Inquiry from ' + name);
            const body = encodeURIComponent(
              'Name: ' + name + '\\n' +
              'Email: ' + senderEmail + '\\n\\n' +
              'Message:\\n' + message
            );
            
            window.open('mailto:${content.email}?subject=' + subject + '&body=' + body, '_blank', 'noopener,noreferrer');
          });
        }
      })();
    </script>
  </section>
`;

export const CONTACT_NEON_MODERN = (content: any) => `
  <section id="contact" data-section="contact" class="py-32 px-6 relative overflow-hidden bg-slate-950">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-teal-500/5 blur-[120px] rounded-full"></div>
    <div class="max-w-4xl mx-auto relative z-10 text-center space-y-16">
      <div class="space-y-4">
        <h2 class="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white" data-field="contact-title">${content.title || "Ready to Start?"}</h2>
        <p class="text-xl text-slate-400 font-medium max-w-2xl mx-auto" data-field="contact-bio">${content.bio || 'Crafting excellence for global high-impact projects.'}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
        <div class="p-10 bg-slate-900/50 border border-white/5 rounded-[3rem] backdrop-blur-xl hover:border-teal-500/30 transition-all group">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-teal-500 mb-6">Direct Line</p>
          <a target="_blank" rel="noopener noreferrer" href="mailto:${content.email}" class="text-2xl md:text-3xl font-bold text-white group-hover:text-teal-400 transition-colors break-words" data-field="contact-email">${content.email}</a>
          <p class="text-slate-500 mt-4 font-medium" data-field="contact-location">${content.location || 'Distributed / Remote'}</p>
        </div>
        
        <div class="p-10 bg-slate-900/50 border border-white/5 rounded-[3rem] backdrop-blur-xl hover:border-teal-500/30 transition-all flex flex-col justify-between">
           <div>
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-teal-500 mb-6">Social Grid</p>
              <div class="flex flex-wrap gap-4">
                 ${(content.socials || []).map((s: any) => `
                    <a href="${s.link || s.url}" class="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">${s.platform}</a>
                 `).join('')}
              </div>
           </div>
           <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-8">Response Time: < 24h</p>
        </div>
      </div>
      
      <form id="contact-form-neon" class="bg-white/5 p-12 rounded-[4rem] border border-white/10 backdrop-blur-3xl space-y-8">
         <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input type="text" id="neon-name" placeholder="Your Name" required class="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-teal-500 transition-all font-medium" />
            <input type="email" id="neon-email" placeholder="Email Address" required class="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-teal-500 transition-all font-medium" />
         </div>
         <textarea rows="4" id="neon-message" placeholder="How can we collaborate?" required class="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-teal-500 transition-all font-medium resize-none"></textarea>
         <button type="submit" class="w-full py-6 bg-teal-500 text-slate-950 font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-teal-400 transition-all shadow-[0_20px_40px_-10px_rgba(20,184,166,0.3)]">Send</button>
      </form>
      <script>
        (function() {
          const form = document.getElementById('contact-form-neon');
          if (form) {
            form.addEventListener('submit', function(e) {
              e.preventDefault();
              const name = document.getElementById('neon-name').value;
              const email = document.getElementById('neon-email').value;
              const message = document.getElementById('neon-message').value;
              const subject = encodeURIComponent('Collaboration Inquiry from ' + name);
              const body = encodeURIComponent('Name: ' + name + '\\nEmail: ' + email + '\\n\\nMessage:\\n' + message);
              window.open('mailto:${content.email}?subject=' + subject + '&body=' + body, '_blank', 'noopener,noreferrer');
            });
          }
        })();
      </script>
    </div>
  </section>
`;

export const CONTACT_SOCIAL_ONLY = (content: any) => `
  <section id="contact" data-section="contact" class="py-24 px-6 text-center">
    <div class="max-w-4xl mx-auto space-y-12">
       <h2 class="text-sm font-black uppercase tracking-[0.5em] opacity-40">${content.title || 'Connect on the Grid'}</h2>
       <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          ${(content.socials || []).map((s: any) => `
             <a href="${s.link}" class="p-8 bg-[var(--surface)] border border-white/5 rounded-3xl group hover:bg-[var(--primary)] transition-all">
                <i class="fab fa-${s.platform.toLowerCase()} text-3xl group-hover:text-[var(--bg)] mb-4 block"></i>
                <p class="text-[10px] font-black uppercase tracking-widest group-hover:text-[var(--bg)]">${s.platform}</p>
             </a>
          `).join('')}
       </div>
       <p class="text-xl opacity-60 underline decoration-2 underline-offset-8 font-bold">${content.email}</p>
    </div>
  </section>
`;

export const CONTACT_CARD_SIMPLE = (content: any) => `
  <section id="contact" data-section="contact" class="py-24 px-6">
    <div class="max-w-3xl mx-auto bg-[var(--surface)] border border-white/10 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
       <div class="absolute top-0 right-0 w-40 h-40 bg-[var(--primary)] opacity-10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
       <div class="space-y-12 text-center relative z-10">
          <h2 class="text-5xl font-black uppercase tracking-tighter">${content.title || 'Start a Loop'}</h2>
          <div class="space-y-4">
             <p class="text-xs font-black uppercase tracking-[0.4em] opacity-40">Base Coordinates</p>
             <p class="text-3xl md:text-5xl font-bold break-words underline decoration-4 decoration-[var(--primary)]/30">${content.email}</p>
             <p class="text-lg opacity-50">${content.location || 'Distributed Node'}</p>
          </div>
          <div class="flex justify-center gap-8">
              ${(content.socials || []).map((s: any) => `
                 <a href="${s.link}" class="text-xs font-black uppercase tracking-widest hover:text-[var(--primary)] transition-colors">${s.platform}</a>
              `).join('')}
          </div>
       </div>
    </div>
  </section>
`;

export const CONTACT_FORM_FULL = (content: any) => `
  <section id="contact" data-section="contact" class="py-24 px-6 border-t border-white/5">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
       <div class="space-y-12">
          <h2 class="text-7xl font-black uppercase leading-none tracking-tighter">Secure<br/>Inquiry</h2>
          <p class="text-2xl text-white/50 leading-relaxed font-light">${content.content || 'Providing end-to-end expertise for high-stakes digital initiatives.'}</p>
          <div class="grid grid-cols-2 gap-8">
             <div class="space-y-2">
                <p class="text-[10px] font-black uppercase opacity-40">Response Protocol</p>
                <p class="font-bold">24-48 Hours</p>
             </div>
             <div class="space-y-2">
                <p class="text-[10px] font-black uppercase opacity-40">Encryption</p>
                <p class="font-bold">End-to-End</p>
             </div>
          </div>
       </div>
       <form id="contact-form-full" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
             <input type="text" id="full-name" placeholder="Name" required class="w-full bg-white/5 border border-white/10 rounded-xl p-5 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-bold" />
             <input type="text" id="full-subject" placeholder="Subject" required class="w-full bg-white/5 border border-white/10 rounded-xl p-5 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-bold" />
          </div>
          <textarea rows="6" id="full-message" placeholder="Message Details" required class="w-full bg-white/5 border border-white/10 rounded-xl p-5 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-bold resize-none"></textarea>
          <button type="submit" class="w-full py-6 bg-[var(--primary)] text-[var(--bg)] font-black uppercase text-xs tracking-[0.3em] rounded-xl hover:scale-105 transition-all">Engage Protocol</button>
       </form>
       <script>
         (function() {
           const form = document.getElementById('contact-form-full');
           if (form) {
             form.addEventListener('submit', function(e) {
               e.preventDefault();
               const name = document.getElementById('full-name').value;
               const subject = document.getElementById('full-subject').value;
               const message = document.getElementById('full-message').value;
               const mailtoSubject = encodeURIComponent('Inquiry: ' + subject + ' (from ' + name + ')');
               const mailtoBody = encodeURIComponent('Name: ' + name + '\\n\\nMessage:\\n' + message);
               window.open('mailto:${content.email}?subject=' + mailtoSubject + '&body=' + mailtoBody, '_blank', 'noopener,noreferrer');
             });
           }
         })();
       </script>
    </div>
  </section>
`;

export const FORM_MINIMALIST = (content: any) => `
    <section id="contact" data-section="contact" class="py-24 px-6 bg-[var(--surface)]/30 text-center">
        <div class="max-w-2xl mx-auto">
            <h2 class="text-3xl font-serif mb-6 text-[var(--heading)]">${content.title || "Let's Connect"}</h2>
            <p class="text-[var(--text)] opacity-70 mb-10 leading-relaxed">${content.description || "Send me a message and I'll get back to you shortly."}</p>
            
            <form id="form-minimal-{{id}}" class="space-y-6 text-left bg-[var(--background)] p-8 md:p-12 shadow-sm border border-[var(--text)]/5 transition-all hover:shadow-md">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-widest text-[var(--text)] opacity-50 mb-2">Name</label>
                    <input type="text" id="name-{{id}}" required class="w-full bg-[var(--surface)] border-b border-[var(--text)]/10 p-3 focus:outline-none focus:border-[var(--primary)] transition-colors text-[var(--heading)]" />
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-widest text-[var(--text)] opacity-50 mb-2">Message</label>
                    <textarea id="message-{{id}}" rows="4" required class="w-full bg-[var(--surface)] border-b border-[var(--text)]/10 p-3 focus:outline-none focus:border-[var(--primary)] transition-colors resize-none text-[var(--heading)]"></textarea>
                </div>
                <button type="submit" class="w-full py-4 bg-[var(--heading)] text-[var(--bg)] font-bold uppercase tracking-widest text-xs hover:bg-[var(--primary)] transition-colors">
                    Send Message
                </button>
            </form>
        </div>
        <script>
            (function() {
                const form = document.getElementById('form-minimal-{{id}}');
                if (form) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const name = document.getElementById('name-{{id}}').value;
                        const message = document.getElementById('message-{{id}}').value;
                        const subject = encodeURIComponent('Contact from ' + name);
                        const body = encodeURIComponent('Message: ' + message);
                        window.open('mailto:${content.email}?subject=' + subject + '&body=' + body, '_blank', 'noopener,noreferrer');
                    });
                }
            })();
        </script>
    </section>
`;

export const FORM_ELEGANT_SPLIT = (content: any) => `
    <section id="contact" data-section="contact" class="max-w-4xl mx-auto px-6 py-16 md:py-32" id="contact">
        <div class="text-center mb-16">
            <span class="text-[var(--primary)] font-bold tracking-widest text-xs uppercase">${content.label || 'Contact'}</span>
            <h2 class="text-4xl md:text-5xl font-black text-[var(--heading)] mt-4">${content.title || 'Get in Touch'}</h2>
            <p class="text-[var(--text)] opacity-60 mt-4 max-w-lg mx-auto">${content.description || "Let's work together."}</p>
        </div>
        <div class="bg-[var(--surface)] rounded-[2rem] p-8 md:p-12 shadow-xl border border-[var(--text)]/5">
            <form id="form-elegant-{{id}}" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-[var(--text)] opacity-40">Name</label>
                        <input type="text" id="name-{{id}}" required class="w-full bg-[var(--background)] border border-[var(--text)]/10 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-[var(--text)] opacity-40">Topic</label>
                        <input type="text" id="subject-{{id}}" required class="w-full bg-[var(--background)] border border-[var(--text)]/10 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all" />
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-[var(--text)] opacity-40">Message</label>
                    <textarea id="message-{{id}}" rows="4" required class="w-full bg-[var(--background)] border border-[var(--text)]/10 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none"></textarea>
                </div>
                <button type="submit" class="w-full py-4 bg-[var(--primary)] text-[var(--bg)] font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-all shadow-lg transform active:scale-[0.98]">
                    Send
                </button>
            </form>
        </div>
        <script>
             (function() {
                const form = document.getElementById('form-elegant-{{id}}');
                if (form) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const name = document.getElementById('name-{{id}}').value;
                        const subject = document.getElementById('subject-{{id}}').value;
                        const message = document.getElementById('message-{{id}}').value;
                        const body = encodeURIComponent('Name: ' + name + '\\nTopic: ' + subject + '\\n\\n' + message);
                        window.open('mailto:${content.email}?subject=' + encodeURIComponent(subject) + '&body=' + body, '_blank', 'noopener,noreferrer');
                    });
                }
            })();
        </script>
    </section>
`;

export const FORM_TECH_AUDIT = (content: any) => `
    <section class="py-32 px-6 bg-[var(--background)] text-center" id="contact">
        <div class="max-w-2xl mx-auto bg-[var(--surface)]/50 backdrop-blur-md p-12 rounded-3xl border border-[var(--text)]/10 shadow-2xl relative overflow-hidden">
             <div class="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-[50px] rounded-full"></div>
            
            <h2 class="text-3xl font-bold text-[var(--heading)] mb-6 relative z-10">${content.title || 'Book an Audit'}</h2>
            <p class="text-[var(--text)] opacity-60 mb-10 relative z-10">${content.description || 'Stop wasting time on manual tasks.'}</p>
            
             <form id="form-tech-{{id}}" class="space-y-6 text-left max-w-md mx-auto relative z-10">
                <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Target System</label>
                    <input type="text" id="system-{{id}}" placeholder="e.g. CRM, Onboarding..." required class="w-full bg-[var(--background)] border border-[var(--text)]/20 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all font-mono text-sm" />
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Pain Points</label>
                    <textarea id="message-{{id}}" rows="3" required class="w-full bg-[var(--background)] border border-[var(--text)]/20 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none font-mono text-sm"></textarea>
                </div>
                <button type="submit" class="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg tracking-wider uppercase text-xs">
                    Initialize Request
                </button>
            </form>
        </div>
        <script>
             (function() {
                const form = document.getElementById('form-tech-{{id}}');
                if (form) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const system = document.getElementById('system-{{id}}').value;
                        const message = document.getElementById('message-{{id}}').value;
                        const body = encodeURIComponent('System: ' + system + '\\n\\nIssues:\\n' + message);
                        window.open('mailto:${content.email}?subject=Audit Request&body=' + body, '_blank', 'noopener,noreferrer');
                    });
                }
            })();
        </script>
    </section>
`;


export const CONTACT_DARK_SASS = (content: any) => `
    <section class="py-32 px-6 bg-[#0f172a] text-center" id="contact">
        <div class="max-w-2xl mx-auto bg-slate-800 p-12 rounded-3xl border border-slate-700 shadow-xl">
            <h2 class="text-3xl font-bold text-white mb-6">${content.title}</h2>
            <p class="text-slate-400 mb-10">${content.description || content.bio || ''}</p>
             <form id="contact-form-ds" class="space-y-6 text-left max-w-md mx-auto">
                <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-400">Name</label>
                    <input type="text" id="name-ds" placeholder="Your Name" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all" />
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-400">Automation Needs</label>
                    <textarea id="message-ds" rows="3" placeholder="What repetitive tasks are killing your time?" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all resize-none"></textarea>
                </div>
                <button type="submit" class="w-full py-4 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg">
                    Book Audit
                </button>
            </form>
        </div>
        <script>
            (function() {
                const form = document.getElementById('contact-form-ds');
                if (form) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const name = document.getElementById('name-ds').value;
                        const message = document.getElementById('message-ds').value;
                        const mailtoSubject = encodeURIComponent('Audit Request from ' + name);
                        const mailtoBody = encodeURIComponent('Name: ' + name + '\\n\\nTarget Automation:\\n' + message);
                        window.open('mailto:${content.email || 'support@brandpodmedia.com'}?subject=' + mailtoSubject + '&body=' + mailtoBody, '_blank', 'noopener,noreferrer');
                    });
                }
            })();
        </script>
    </section>
`;

export const CONTACT_MINIMAL_SIMPLE = (content: any) => `
    <section id="contact" data-section="contact" class="py-24 px-6 bg-stone-900 text-white text-center" id="contact">
        <h2 class="text-4xl font-serif italic mb-8" data-field="cta-heading">${content.ctaHeading || content.title || 'Let\'s Connect'}</h2>
        <p class="text-stone-400 mb-12 max-w-lg mx-auto" data-field="cta-sub">
            ${content.ctaSub || content.subtitle || 'Ready to start your project?'}
        </p>
        <form id="contact-minimal-simple" class="max-w-md mx-auto space-y-4 text-left">
            <div>
                <label class="text-xs uppercase font-bold tracking-widest text-stone-500 mb-2 block">Name</label>
                <input type="text" id="minimal-name" required class="w-full bg-stone-800 border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-stone-500" />
            </div>
             <div>
                <label class="text-xs uppercase font-bold tracking-widest text-stone-500 mb-2 block">Email</label>
                <input type="email" id="minimal-email" required class="w-full bg-stone-800 border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-stone-500" />
            </div>
            <button type="submit" class="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-stone-200 transition-colors mt-4">Send Request</button>
        </form>
        <script>
            (function() {
                const form = document.getElementById('contact-minimal-simple');
                if (form) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const name = document.getElementById('minimal-name').value;
                        const email = document.getElementById('minimal-email').value;
                        const subject = encodeURIComponent('Inquiry from ' + name);
                        const body = encodeURIComponent('Name: ' + name + '\\nEmail: ' + email);
                        window.open('mailto:${content.email}?subject=' + subject + '&body=' + body, '_blank', 'noopener,noreferrer');
                    });
                }
            })();
        </script>
    </section>
`;

export const ContactRegistry: any = {
  CONTACT_SPLIT,
  CONTACT_NEON_MODERN,
  CONTACT_SOCIAL_ONLY,
  CONTACT_CARD_SIMPLE,
  CONTACT_FORM_FULL,
  FORM_MINIMALIST,
  FORM_ELEGANT_SPLIT,
  FORM_TECH_AUDIT,
  CONTACT_DARK_SASS,
  CONTACT_MINIMAL_SIMPLE
};
