import { Manifest } from "@/types";

export const AGENCY_VYSION: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Social Media Manager',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#ff4d4d', // Vibrant Red for attention
            secondary: '#1a1a1a',
            background: '#ffffff',
            surface: '#f3f4f6',
            text: '#1f2937',
            heading: '#111827',
        },
        typography: {
            headingFont: 'Montserrat',
            bodyFont: 'Open Sans',
            monoFont: 'Roboto Mono',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 transition-all duration-300" id="main-header">
                    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <a href="#" class="text-xl font-black uppercase tracking-wider text-gray-900 hover:text-[#ff4d4d] transition-colors relative z-50">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-xs font-bold font-sans text-gray-500 hover:text-[#ff4d4d] uppercase tracking-widest transition-colors">
                                {{label}}
                            </a>
                            {{/each}}
                            <a href="#contact" class="bg-[#ff4d4d] text-white px-6 py-2 rounded-full text-xs font-bold uppercase hover:bg-black transition-all transform hover:-translate-y-0.5">Start Project</a>
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-gray-900 z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-3xl font-black uppercase tracking-tighter text-gray-900 hover:text-[#ff4d4d] transition-all transform translate-y-4 opacity-0">
                            {{label}}
                        </a>
                        {{/each}}
                        <a href="#contact" class="mobile-link text-xl font-bold text-[#ff4d4d] opacity-0 translate-y-4 transition-all delay-100 uppercase">Start Project</a>
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
                                        document.body.style.overflow = 'hidden';
                                        links.forEach((link, idx) => setTimeout(() => link.classList.remove('translate-y-4', 'opacity-0'), 100 + (idx * 50)));
                                    } else {
                                        menu.classList.add('opacity-0', 'pointer-events-none');
                                        icon.classList.remove('fa-times');
                                        icon.classList.add('fa-bars');
                                        document.body.style.overflow = '';
                                        links.forEach(link => link.classList.add('translate-y-4', 'opacity-0'));
                                    }
                                });
                                links.forEach(link => link.addEventListener('click', () => {
                                    isOpen = false;
                                    menu.classList.add('opacity-0', 'pointer-events-none');
                                    icon.classList.remove('fa-times');
                                    icon.classList.add('fa-bars');
                                    document.body.style.overflow = '';
                                }));
                                // Event delegation for smooth scrolling - works for all anchor links
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
                username: 'AGENCY VYSION',
                navLinks: [
                    { label: 'Services', link: '#services' },
                    { label: 'Work', link: '#results' },
                    { label: 'Testimonials', link: '#testimonials' },
                    { label: 'Contact', link: '#contact' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero',
            type: 'hero',
            componentId: 'HERO_AGENCY_VIBRANT',
            template: `
                <section class="relative min-h-screen bg-white overflow-hidden pt-20">
                    <div class="max-w-7xl mx-auto px-6 h-full flex items-center min-h-[calc(100vh-80px)]">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div class="relative z-10">
                                <span class="bg-[#ff4d4d] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block">
                                    {{statusTag}}
                                </span>
                                <h1 class="text-6xl md:text-8xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-8">
                                    {{{headline}}}
                                </h1>
                                <p class="text-xl text-gray-500 max-w-md leading-relaxed mb-10">
                                    {{heroTagline}}
                                </p>
                                <div class="flex flex-wrap gap-4">
                                    <a href="{{cta.link}}" class="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-[#ff4d4d] transition-colors shadow-xl shadow-gray-200">
                                        {{cta.text}}
                                    </a>
                                </div>
                                <div class="mt-12 flex items-center gap-4 border-t border-gray-100 pt-8">
                                    <div class="w-12 h-12 rounded-full overflow-hidden grayscale border-2 border-white shadow-sm">
                                        <img src="{{avatarImage}}" class="w-full h-full object-cover" />
                                    </div>
                                    <div class="text-left">
                                        <div class="text-xs font-bold uppercase tracking-widest text-gray-400">Strategy by</div>
                                        <div class="text-sm font-black text-gray-900">{{name}}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="relative">
                                <div class="absolute -top-20 -right-20 w-[120%] h-[120%] bg-gray-50 rounded-full blur-3xl opacity-50 -z-10"></div>
                                <div class="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl transform md:rotate-3 hover:rotate-0 transition-transform duration-700 group border-8 border-white">
                                    <img src="{{backgroundImage}}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'Sarah Jenkins',
                statusTag: 'Currently Accepting Clients',
                headline: 'I TURN<br/><span class="text-[#ff4d4d]">ATTENTION</span><br/>INTO REVENUE.',
                heroTagline: 'Stop posting into the void. I build data-driven social strategies for brands that want to dominate their niche.',
                avatarImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
                backgroundImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200',
                cta: { text: 'View Packages', link: '#services' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'stats-ticker',
            type: 'stats',
            componentId: 'STATS_AGENCY_TICKER',
            template: `
                <section class="bg-black py-12 px-6 overflow-hidden">
                    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                        {{#each stats}}
                        <div class="group">
                            <div class="text-5xl md:text-7xl font-black text-[#ff4d4d] group-hover:text-white transition-colors duration-300 tracking-tighter">{{value}}</div>
                            <div class="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mt-2">{{label}}</div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                stats: [
                    { value: '2.5M+', label: 'Reach Generated' },
                    { value: '150k', label: 'Followers Gained' },
                    { value: '400%', label: 'Avg. Engagement Increase' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'results',
            type: 'projects',
            componentId: 'PROJ_AGENCY_CASE_STUDY',
            template: `
                <section class="py-24 bg-white px-6" id="results">
                    <div class="max-w-7xl mx-auto">
                        <div class="mb-16">
                            <span class="text-[#ff4d4d] font-bold uppercase tracking-widest text-xs">{{label}}</span>
                            <h2 class="text-4xl md:text-5xl font-black text-gray-900 mt-4 tracking-tight">{{title}}</h2>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {{#each projects}}
                            <div class="group cursor-pointer">
                                <div class="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6">
                                    <img src="{{image}}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                                        <div class="text-white">
                                            <div class="text-3xl font-black mb-2">{{metric}}</div>
                                            <div class="text-sm font-bold uppercase tracking-widest text-white/70">{{client}}</div>
                                        </div>
                                    </div>
                                </div>
                                <h3 class="text-2xl font-black text-gray-900 mb-3">{{title}}</h3>
                                <p class="text-gray-500 text-sm leading-relaxed">{{desc}}</p>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                label: 'Case Studies',
                title: 'Proof is in the numbers.',
                projects: [
                    { client: 'Skincare Co.', title: 'Viral TikTok Campaign', metric: '+1.2M Views', image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800', desc: 'UGC-focused campaign that sold out inventory in 48 hours.' },
                    { client: 'Tech Startup', title: 'LinkedIn Thought Leadership', metric: '+15k Leads', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', desc: 'Repositioned founder brand, driving enterprise leads.' },
                    { client: 'Local Cafe', title: 'Instagram Aesthetics', metric: '+300% Foot Traffic', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', desc: 'Revamped visual identity driving weekend brunches.' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'services',
            type: 'services',
            componentId: 'SERVICES_AGENCY_GRID',
            template: `
                <section class="py-24 bg-gray-50 px-6 rounded-[4rem] mx-6" id="services">
                    <div class="max-w-7xl mx-auto">
                        <div class="max-w-xl mb-16">
                            <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">{{title}}</h2>
                            <p class="text-gray-500 text-lg leading-relaxed">{{label}}</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {{#each services}}
                            <div class="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                                <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:bg-[#ff4d4d] group-hover:text-white transition-colors">
                                    <i class="{{icon}}"></i>
                                </div>
                                <h3 class="text-2xl font-black text-gray-900 mb-4">{{title}}</h3>
                                <p class="text-gray-500 text-sm mb-6 leading-relaxed">{{desc}}</p>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'How I Can Help',
                label: 'Flexible engagement models designed for growth.',
                services: [
                    { title: 'Full Management', desc: 'Total takeover. I handle everything from strategy to posting.', icon: 'fas fa-crown' },
                    { title: 'Content Strategy', desc: 'I give you the roadmap; your team executes.', icon: 'fas fa-map' },
                    { title: 'UGC Creation', desc: 'High-converting video content for ads and organic.', icon: 'fas fa-video' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'brand-stack',
            type: 'skills',
            componentId: 'SKILLS_AGENCY',
            template: `
                <section class="py-20 px-6">
                    <div class="max-w-7xl mx-auto">
                        <span class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 block mb-12 text-center">{{title}}</span>
                        <div class="flex flex-wrap justify-center gap-12 items-center grayscale opacity-40">
                            {{#each tools}}
                            <div class="text-xl font-black uppercase tracking-tighter text-gray-900">{{name}}</div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'My Tech Stack',
                tools: [
                    { name: 'Figma' },
                    { name: 'Trello' },
                    { name: 'Canva' },
                    { name: 'Notion' },
                    { name: 'CapCut' },
                    { name: 'Later' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="max-w-4xl mx-auto px-6 py-16 md:py-32" id="contact">
                    <div class="text-center mb-16">
                        <span class="text-[#ff4d4d] font-bold tracking-widest text-xs uppercase">{{label}}</span>
                        <h2 class="text-4xl md:text-5xl font-black text-gray-900 mt-4">{{title}}</h2>
                        <p class="text-gray-500 mt-4 max-w-lg mx-auto">{{description}}</p>
                    </div>
                    <div class="bg-gray-50 rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100">
                        <form id="contact-form-{{id}}" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Name</label>
                                    <input type="text" id="name-{{id}}" placeholder="Your Name" required class="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#ff4d4d] transition-all" />
                                </div>
                                <div class="space-y-2">
                                    <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Topic</label>
                                    <input type="text" id="subject-{{id}}" placeholder="Project Type" required class="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#ff4d4d] transition-all" />
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Message</label>
                                <textarea id="message-{{id}}" rows="4" placeholder="How can I help you?" required class="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#ff4d4d] transition-all resize-none"></textarea>
                            </div>
                            <button type="submit" class="w-full py-4 bg-[#ff4d4d] text-white font-bold uppercase tracking-widest rounded-lg hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/20 transform active:scale-[0.98]">
                                Send Message
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
                                    const subject = document.getElementById('subject-{{id}}').value;
                                    const message = document.getElementById('message-{{id}}').value;
                                    const mailtoSubject = encodeURIComponent('Inquiry: ' + subject + ' (from ' + name + ')');
                                    const mailtoBody = encodeURIComponent('Name: ' + name + '\r\n\r\nMessage:\r\n' + message);
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
                label: 'Get In Touch',
                title: 'Ready to Scale?',
                description: 'Let’s build a strategy that actually converts.',
                email: 'hello@sarahsocial.com'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="border-t border-gray-100 bg-white pt-20 pb-10 px-6 text-center">
                    <div class="max-w-4xl mx-auto">
                        <h2 class="text-3xl md:text-5xl font-black text-gray-900 mb-12 tracking-tight">
                            {{footerHeading}}
                        </h2>
                         <div class="flex flex-col items-center gap-6">
                            <a href="mailto:{{footerEmail}}" class="text-xl md:text-2xl font-bold text-[#ff4d4d] hover:text-black transition-colors">
                                {{footerEmail}}
                            </a>
                        </div>
                        <div class="mt-20 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-widest">
                            <div>{{copyright}}</div>
                        </div>
                    </div>
                </footer>
            `,
            content: {
                footerHeading: "Let's Make Some Noise.",
                footerEmail: 'hello@sarahsocial.com',
                copyright: '© 2025 SARAH JENKINS. ALL RIGHTS RESERVED.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};
