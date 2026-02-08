
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

export const TESTIMONIALS_BENTO = (content: any) => {
  const items = content.items || [];
  return `
      <section id="testimonials" data-section="testimonials" class="py-24 px-6 bg-[var(--surface)]/10">
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
              'Name: ' + name + '\n' +
              'Email: ' + senderEmail + '\n\n' +
              'Message:\n' + message
            );
            
            window.location.href = 'mailto:${content.email}?subject=' + subject + '&body=' + body;
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
        <p class="text-xl text-slate-400 font-medium max-w-2xl mx-auto" data-field="contact-bio">${content.bio || 'Available for global collaborations and high-impact projects.'}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
        <div class="p-10 bg-slate-900/50 border border-white/5 rounded-[3rem] backdrop-blur-xl hover:border-teal-500/30 transition-all group">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-teal-500 mb-6">Direct Line</p>
          <a href="mailto:${content.email}" class="text-2xl md:text-3xl font-bold text-white group-hover:text-teal-400 transition-colors break-words" data-field="contact-email">${content.email}</a>
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
              window.location.href = 'mailto:${content.email}?subject=' + subject + '&body=' + body;
            });
          }
        })();
      </script>
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
               window.location.href = 'mailto:${content.email}?subject=' + mailtoSubject + '&body=' + mailtoBody;
             });
           }
         })();
       </script>
    </div>
  </section>
`;

export const TESTIMONIALS_CAROUSEL = (content: any) => {
  const items = content.items || [];
  return `
   <section id="testimonials" data-section="testimonials" class="py-24 px-6 overflow-hidden">
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
   <section id="testimonials" data-section="testimonials" class="py-24 px-6 bg-[var(--surface)]/30">
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
   <section id="testimonials" data-section="testimonials" class="py-24 px-6 overflow-hidden">
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

export const TestimonialRegistry: any = {
  TESTIMONIALS_BENTO,
  TESTIMONIALS_CAROUSEL,
  TESTIMONIALS_GRID_PHOTOS,
  TESTIMONIALS_QUOTE_WALL
};

export const ContactRegistry: any = {
  CONTACT_SPLIT,
  CONTACT_NEON_MODERN,
  CONTACT_SOCIAL_ONLY,
  CONTACT_CARD_SIMPLE,
  CONTACT_FORM_FULL
};
