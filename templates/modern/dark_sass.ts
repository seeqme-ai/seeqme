import { Manifest } from "@/types";

export const DARK_SASS: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Tech Virtual Assistant',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'dark',
        colorPalette: {
            primary: '#8b5cf6', // Violet
            secondary: '#1e1b4b', // Indigo 950
            background: '#0f172a', // Slate 900
            surface: '#1e293b', // Slate 800
            text: '#e2e8f0', // Slate 200
            heading: '#f8fafc', // Slate 50
        },
        typography: {
            headingFont: 'Inter',
            bodyFont: 'Inter',
            monoFont: 'JetBrains Mono',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-[#0f172a] border-b border-white/5 transition-all duration-300" id="main-header">
                    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <a href="#" class="text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors relative z-50">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-medium text-slate-400 hover:text-violet-400 transition-colors">
                                {{label}}
                            </a>
                            {{/each}}
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-white z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-[#0f172a] z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-3xl font-bold text-slate-300 hover:text-cyan-400 transition-all transform translate-y-4 opacity-0">
                            {{label}}
                        </a>
                        {{/each}}
                    </div>
                    <script>
                        (function() {
                            const btn = document.getElementById('mobile-menu-btn-{{id}}');
                            const menu = document.getElementById('mobile-menu-{{id}}');
                            const icon = document.getElementById('menu-icon-{{id}}');
                            const links = menu.querySelectorAll('.mobile-link');
                            let isOpen = false;
                            if (btn && menu) {
                                btn.addEventListener('click', () => {
                                    isOpen = !isOpen;
                                    if (isOpen) {
                                        menu.classList.remove('opacity-0', 'pointer-events-none');
                                        icon.classList.remove('fa-bars');
                                        icon.classList.add('fa-times');
                                        links.forEach((link, idx) => setTimeout(() => link.classList.remove('translate-y-4', 'opacity-0'), 100 + (idx * 50)));
                                    } else {
                                        menu.classList.add('opacity-0', 'pointer-events-none');
                                        icon.classList.remove('fa-times');
                                        icon.classList.add('fa-bars');
                                        links.forEach(link => link.classList.add('translate-y-4', 'opacity-0'));
                                    }
                                });
                                links.forEach(link => link.addEventListener('click', () => {
                                    isOpen = false;
                                    menu.classList.add('opacity-0', 'pointer-events-none');
                                    icon.classList.remove('fa-times');
                                    icon.classList.add('fa-bars');
                                }));
                                // Event delegation for smooth scrolling
                                document.body.addEventListener('click', function(e) {
                                    const link = e.target.closest('a[href^="#"]');
                                    if (link) {
                                        e.preventDefault();
                                        const targetId = link.getAttribute('href').substring(1);
                                        const target = document.getElementById(targetId);
                                        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                                    }
                                });
                            }
                        })();
                    </script>
                </header>
            `,
            content: {
                username: 'SYSTEMS_ONLINE',
                navLinks: [
                    { label: 'Services', link: '#services' },
                    { label: 'Stack', link: '#stack' },
                    { label: 'Projects', link: '#projects' },
                    { label: 'Contact', link: '#contact' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="min-h-screen flex items-center justify-center bg-[#0f172a] text-white px-6 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-full">
                         <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full"></div>
                         <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full"></div>
                    </div>
                    
                    <div class="relative z-10 max-w-4xl text-center">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400 mb-8 hover:bg-slate-700 transition-colors cursor-pointer">
                            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            {{statusTag}}
                        </div>
                        <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                            {{name}}
                        </h1>
                        <p class="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {{heroTagline}}
                        </p>
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                             <a href="{{cta.link}}" class="px-8 py-4 bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/25">
                                {{cta.text}}
                             </a>
                             <a href="#projects" class="px-8 py-4 bg-slate-800 text-white border border-slate-700 rounded-lg font-bold hover:bg-slate-700 transition-all">
                                View Portfolio
                             </a>
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'I build the systems that run your business.',
                statusTag: 'Now accepting new system audits',
                heroTagline: 'Stop doing manual data entry. As a Tech VA & Automation Specialist, I connect your tools so you can sleep while your business scales.',
                cta: { text: 'Explore Automations', link: '#services' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'stack',
            type: 'skills',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-20 px-6 bg-[#0f172a]">
                    <div class="max-w-6xl mx-auto">
                        <h2 class="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">{{title}}</h2>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {{#each tools}}
                            <div class="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4 hover:border-violet-500 hover:bg-slate-800 transition-all cursor-default">
                                <div class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                                    {{icon}}
                                </div>
                                <div class="font-bold text-white">{{name}}</div>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Certified Expert In',
                tools: [
                    { name: 'Zapier', icon: '⚡' },
                    { name: 'Make.com', icon: '🟣' },
                    { name: 'Airtable', icon: '📊' },
                    { name: 'Notion', icon: '📝' },
                    { name: 'ClickUp', icon: '✅' },
                    { name: 'ActiveCampaign', icon: '📧' },
                    { name: 'Stripe', icon: '💳' },
                    { name: 'Shopify', icon: '🛍️' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'services',
            type: 'services',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 bg-[#0f172a]" id="services">
                    <div class="max-w-6xl mx-auto">
                         <div class="text-center mb-16">
                            <h2 class="text-3xl font-bold text-white mb-4">{{title}}</h2>
                            <p class="text-slate-400">{{label}}</p>
                         </div>
                         
                         <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {{#each services}}
                            <div class="group bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-2xl p-8 transition-all hover:-translate-y-1">
                                <div class="w-12 h-12 bg-violet-500/10 text-violet-400 rounded-lg flex items-center justify-center text-2xl mb-6 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                                    {{icon}}
                                </div>
                                <h3 class="text-xl font-bold text-white mb-4">{{title}}</h3>
                                <p class="text-slate-400 text-sm mb-6 leading-relaxed">{{desc}}</p>
                                <div class="text-xs font-mono text-cyan-400">
                                    {{price}}
                                </div>
                            </div>
                            {{/each}}
                         </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Operations as a Service',
                label: 'I replace your chaotic spreadsheets with automated workflows.',
                services: [
                    { title: 'Tech Stack Audit', desc: 'I map out your current tools, find redundancies, and recommend a streamlined stack to save you money.', icon: '🔍', price: 'One-time: $497' },
                    { title: 'Workflow Automation', desc: 'Custom Zaps and Make scenarios to automate onboarding, invoicing, and lead follow-up.', icon: '⚙️', price: 'Project based' },
                    { title: 'System Maintenance', desc: 'Monthly retainer to ensure your automations keep running and your data stays clean.', icon: '🛠️', price: 'Starting at $1k/mo' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 bg-[#0f172a]" id="projects">
                    <div class="max-w-5xl mx-auto">
                         <h2 class="text-3xl font-bold text-white mb-12 border-l-4 border-violet-500 pl-4">{{title}}</h2>
                         <div class="space-y-8">
                            {{#each projects}}
                            <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col md:flex-row gap-8 items-center">
                                <div class="w-full md:w-1/2 aspect-video bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 relative overflow-hidden group">
                                     <div class="absolute inset-0 flex items-center justify-center gap-2 opacity-50">
                                        <div class="w-8 h-8 rounded bg-orange-500"></div><div class="w-4 h-0.5 bg-slate-600"></div>
                                        <div class="w-8 h-8 rounded bg-blue-500"></div><div class="w-4 h-0.5 bg-slate-600"></div>
                                        <div class="w-8 h-8 rounded bg-green-500"></div>
                                     </div>
                                </div>
                                <div class="w-full md:w-1/2">
                                     <div class="text-xs font-bold uppercase text-violet-400 mb-2">{{tech}}</div>
                                     <h3 class="text-2xl font-bold text-white mb-4">{{title}}</h3>
                                     <p class="text-slate-400 text-sm leading-relaxed mb-6">{{desc}}</p>
                                </div>
                            </div>
                            {{/each}}
                         </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Recent Builds',
                projects: [
                    { title: 'Client Onboarding System', tech: 'Automation', desc: 'Reduced onboarding time from 3 days to 5 minutes. Automatically sends contracts, generates invoices in Xero, and creates ClickUp tasks.' },
                    { title: 'CRM Two-Way Sync', tech: 'Integration', desc: 'Built a custom sync between HubSpot and a proprietary SQL database using Make.com webhooks.' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 bg-[#0f172a] text-center" id="contact">
                    <div class="max-w-2xl mx-auto bg-slate-800 p-12 rounded-3xl border border-slate-700 shadow-xl">
                        <h2 class="text-3xl font-bold text-white mb-6">{{title}}</h2>
                        <p class="text-slate-400 mb-10">{{description}}</p>
                         <form id="contact-form-{{id}}" class="space-y-6 text-left max-w-md mx-auto">
                            <div class="space-y-2">
                                <label class="text-xs font-bold uppercase tracking-widest text-slate-400">Name</label>
                                <input type="text" id="name-{{id}}" placeholder="Your Name" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold uppercase tracking-widest text-slate-400">Automation Needs</label>
                                <textarea id="message-{{id}}" rows="3" placeholder="What repetitive tasks are killing your time?" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all resize-none"></textarea>
                            </div>
                            <button type="submit" class="w-full py-4 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg">
                                Book Audit
                            </button>
                        </form>
                    </div>
                    <script>
                        (function() {
                            const form = document.getElementById('contact-form-{{id}}');
                            if (form) {
                                form.addEventListener('submit', function(e) {
                                    e.preventDefault();
                                    const name = document.getElementById('name-{{id}}').value;
                                    const message = document.getElementById('message-{{id}}').value;
                                    const mailtoSubject = encodeURIComponent('Audit Request from ' + name);
                                    const mailtoBody = encodeURIComponent('Name: ' + name + '\r\n\r\nTarget Automation:\r\n' + message);
                                    const link = document.createElement('a');
                                    link.href = 'mailto:{{email}}?subject=' + mailtoSubject + '&body=' + mailtoBody;
                                    link.click();
                                });
                            }
                        })();
                    </script>
                </section>
            `,
            content: {
                title: 'Stop drowning in admin.',
                description: 'Book a free 20-minute audit call. I\'ll tell you exactly what can be automated.',
                email: 'tech@va.com',
                label: 'Contact'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                 <footer class="py-12 px-6 bg-[#0f172a] text-center text-slate-600 text-xs font-mono border-t border-slate-800">
                     <a href="mailto:{{footerEmail}}" class="block mb-8 text-xl text-slate-400 hover:text-cyan-400 transition-colors">{{footerEmail}}</a>
                     <h3 class="font-bold text-white mb-4 text-sm">{{footerHeading}}</h3>
                    <p>{{copyright}}</p>
                 </footer>
            `,
            content: {
                footerHeading: 'SYSTEMS_ONLINE',
                footerEmail: 'tech@va.com',
                copyright: '© 2025 SYSTEMS_ONLINE. ALL RIGHTS RESERVED.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};
