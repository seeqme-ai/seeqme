
export const FORM_MINIMALIST = (content: any) => `
    <section data-section="contact" class="py-24 px-6 bg-[var(--surface)]/30 text-center">
        <div class="max-w-2xl mx-auto">
            <h2 class="text-3xl font-serif mb-6 text-[var(--heading)]">${content.title || "Let's Connect"}</h2>
            <p class="text-[var(--text)] opacity-70 mb-10 leading-relaxed">${content.description || "Send me a message and I'll get back to you shortly."}</p>
            
            <form id="form-minimal-{{id}}" class="space-y-6 text-left bg-[var(--bg)] p-8 md:p-12 shadow-sm border border-[var(--text)]/5 transition-all hover:shadow-md">
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
    <section data-section="contact" class="max-w-4xl mx-auto px-6 py-16 md:py-32" id="contact">
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
                        <input type="text" id="name-{{id}}" required class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-[var(--text)] opacity-40">Topic</label>
                        <input type="text" id="subject-{{id}}" required class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all" />
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-[var(--text)] opacity-40">Message</label>
                    <textarea id="message-{{id}}" rows="4" required class="w-full bg-[var(--bg)] border border-[var(--text)]/10 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none"></textarea>
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
    <section class="py-32 px-6 bg-[var(--bg)] text-center" id="contact">
        <div class="max-w-2xl mx-auto bg-[var(--surface)]/50 backdrop-blur-md p-12 rounded-3xl border border-[var(--text)]/10 shadow-2xl relative overflow-hidden">
             <div class="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-[50px] rounded-full"></div>
            
            <h2 class="text-3xl font-bold text-[var(--heading)] mb-6 relative z-10">${content.title || 'Book an Audit'}</h2>
            <p class="text-[var(--text)] opacity-60 mb-10 relative z-10">${content.description || 'Stop wasting time on manual tasks.'}</p>
            
             <form id="form-tech-{{id}}" class="space-y-6 text-left max-w-md mx-auto relative z-10">
                <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Target System</label>
                    <input type="text" id="system-{{id}}" placeholder="e.g. CRM, Onboarding..." required class="w-full bg-[var(--bg)] border border-[var(--text)]/20 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all font-mono text-sm" />
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Pain Points</label>
                    <textarea id="message-{{id}}" rows="3" required class="w-full bg-[var(--bg)] border border-[var(--text)]/20 rounded-lg px-4 py-3 text-[var(--heading)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none font-mono text-sm"></textarea>
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

export const FormRegistry = {
    FORM_MINIMALIST,
    FORM_ELEGANT_SPLIT,
    FORM_TECH_AUDIT
};

