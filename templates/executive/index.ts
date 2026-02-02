
import { Template, Manifest } from "@/types";

export const MOCK_MANIFEST_EXECUTIVE: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Executive Leadership',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'dark',
        colorPalette: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#cbd5e1',
            heading: '#ffffff',
        },
        typography: {
            headingFont: 'Inter',
            bodyFont: 'Inter',
            monoFont: 'Inter',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-[#0f172a] border-b border-slate-800 transition-all duration-300" id="main-header">
                    <div class="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                        <a href="#" class="text-xl font-bold tracking-tight text-white uppercase">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-10">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                                {{label}}
                            </a>
                            {{/each}}
                            <a href="#contact" class="bg-white text-slate-900 px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors">Inquire</a>
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-white z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-[#0f172a] z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-2xl font-bold text-white hover:text-slate-400 transition-all transform translate-y-4 opacity-0">
                            {{label}}
                        </a>
                        {{/each}}
                        <a href="#contact" class="mobile-link text-xl font-bold text-slate-400 opacity-0 translate-y-4 transition-all delay-100">Inquire</a>
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
                                const allLinks = document.querySelectorAll('a[href^="#"]');
                                allLinks.forEach(anchor => {
                                    anchor.addEventListener('click', function (e) {
                                        e.preventDefault();
                                        const targetId = this.getAttribute('href').substring(1);
                                        const target = document.getElementById(targetId);
                                        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                                    });
                                });
                            }
                        })();
                    </script>
                </header>
            `,
            content: {
                username: 'SARAH JENKINS',
                navLinks: [
                    { label: 'Vision', link: '#about' },
                    { label: 'Impact', link: '#projects' },
                    { label: 'Career', link: '#experience' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero-exec',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="min-h-[80vh] flex items-center justify-center pt-24 px-6 relative bg-[#0f172a]">
                    <div class="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                         <div class="order-2 md:order-1">
                            <h2 class="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{{statusTag}}</h2>
                            <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">{{name}}</h1>
                            <div class="h-1 w-20 bg-white mb-8"></div>
                            <p class="text-xl text-slate-300 leading-relaxed mb-8">{{heroTagline}}</p>
                            <a href="{{cta.link}}" class="text-white border-b-2 border-white pb-1 hover:text-slate-300 hover:border-slate-300 transition-colors inline-block uppercase tracking-wider text-sm font-bold">
                                {{cta.text}}
                            </a>
                         </div>
                         <div class="order-1 md:order-2 relative aspect-[4/5] md:aspect-square">
                            <div class="absolute inset-0 border-2 border-slate-700 transform translate-x-4 translate-y-4"></div>
                            <img src="{{avatarImage}}" class="w-full h-full object-cover relative z-10 grayscale hover:grayscale-0 transition-all duration-700" />
                         </div>
                    </div>
                </section>
            `,
            content: {
                name: 'Sarah Jenkins',
                statusTag: 'Chief Operations Officer',
                heroTagline: 'Scale-up specialist with a focus on operational excellence and digital transformation in fintech.',
                avatarImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800',
                cta: { text: 'View Strategy', link: '#about' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'about-exec',
            type: 'about',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 bg-[#1e293b]" id="about">
                    <div class="max-w-7xl mx-auto">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div>
                                <h2 class="text-3xl font-bold text-white mb-6">{{title}}</h2>
                                <p class="text-slate-300 leading-relaxed text-lg">{{content}}</p>
                            </div>
                            <div class="grid grid-cols-1 gap-8">
                                {{#each stats}}
                                <div class="border-t border-slate-600 pt-4">
                                    <div class="text-5xl font-bold text-white mb-2">{{value}}</div>
                                    <div class="text-sm text-slate-400 uppercase tracking-widest">{{label}}</div>
                                </div>
                                {{/each}}
                            </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Leadership Impact',
                content: 'Proven track record of scaling operations from startup to IPO. Expertise in building high-performance teams and implementing data-driven strategies.',
                stats: [
                    { label: 'Team Members Led', value: '250+' },
                    { label: 'Revenue Growth', value: '340%' },
                    { label: 'Markets Expanded', value: '12' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects-exec',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-7xl mx-auto" id="projects">
                    <h2 class="text-3xl font-bold text-white mb-12 border-l-4 border-white pl-6">{{title}}</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {{#each items}}
                        <div class="bg-[#1e293b] p-8 group hover:bg-[#253248] transition-colors">
                            <div class="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">{{tags}}</div>
                            <h3 class="text-2xl font-bold text-white mb-4">{{title}}</h3>
                            <p class="text-slate-300 mb-6">{{description}}</p>
                            <a href="{{link}}" class="text-white text-sm font-bold border-b border-transparent group-hover:border-white transition-all inline-block hover:pb-1">View Case Study</a>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Strategic Initiatives',
                items: [
                    {
                        title: 'Digital Transformation',
                        description: 'Led company-wide digital transformation, modernizing legacy systems and implementing cloud infrastructure.',
                        tags: 'AWS, Terraform, Kubernetes',
                        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800',
                        link: '#'
                    },
                    {
                        title: 'Global Expansion',
                        description: 'Orchestrated entry into 8 new international markets, establishing regional partnerships and operations.',
                        tags: 'Strategy, Operations, M&A',
                        image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800',
                        link: '#'
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'exp-exec',
            type: 'experience',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 bg-[#1e293b]" id="experience">
                    <div class="max-w-4xl mx-auto">
                        <h2 class="text-3xl font-bold text-white text-center mb-16">{{title}}</h2>
                        <div class="space-y-8">
                            {{#each items}}
                            <div class="border border-slate-700 p-8 flex flex-col md:flex-row gap-8 items-start">
                                <div class="md:w-1/4">
                                    <div class="text-slate-400 font-mono text-sm">{{period}}</div>
                                </div>
                                <div class="md:w-3/4">
                                    <h3 class="text-xl font-bold text-white mb-2">{{role}}</h3>
                                    <div class="text-slate-300 font-medium mb-4">{{company}}</div>
                                    <p class="text-slate-400">{{description}}</p>
                                </div>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Career Milestones',
                items: [
                    {
                        role: 'Chief Operations Officer',
                        company: 'FinTech Ventures Inc.',
                        period: '2020 - Present',
                        description: 'Leading operations for a Series C fintech startup. Scaled team from 50 to 250+ employees.'
                    },
                    {
                        role: 'VP of Operations',
                        company: 'Digital Bank Corp',
                        period: '2016 - 2020',
                        description: 'Managed day-to-day operations and drove operational efficiency initiatives.'
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact-exec',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 bg-[#0f172a]" id="contact">
                    <div class="max-w-4xl mx-auto text-center">
                        <h2 class="text-4xl font-bold text-white mb-8">{{title}}</h2>
                        <div class="w-24 h-1 bg-white mx-auto mb-12"></div>
                        <div class="flex flex-col md:flex-row justify-center gap-12 text-center">
                            <div>
                                <div class="text-slate-400 text-xs uppercase tracking-widest mb-2">Email</div>
                                <a href="mailto:{{email}}" class="text-xl text-white hover:text-slate-300 font-serif block">{{email}}</a>
                            </div>
                            <div>
                                <div class="text-slate-400 text-xs uppercase tracking-widest mb-2">Office</div>
                                <div class="text-xl text-white font-serif">{{location}}</div>
                            </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Connect',
                email: 'sarah@executive.com',
                phone: '+1 (415) 555-0142',
                location: 'San Francisco, CA / Remote'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer-exec',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-12 bg-[#020617] text-center text-slate-500 text-xs uppercase tracking-widest">
                    <div class="mb-4 text-white font-bold text-sm tracking-[0.2em]">{{footerHeading}}</div>
                    <p>{{copyright}}</p>
                    <a href="mailto:{{footerEmail}}" class="block mt-2 hover:text-white transition-colors">{{footerEmail}}</a>
                </footer>
            `,
            content: {
                footerHeading: 'SARAH JENKINS',
                footerEmail: 'sarah@executive.com',
                copyright: '© 2025 Sarah Jenkins. All rights reserved.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};

// PRODUCT STRATEGY & LEADERSHIP TEMPLATE
export const PRODUCT_STRATEGY_DARK: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Product Management',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'dark',
        colorPalette: {
            primary: '#8b5cf6',
            secondary: '#06b6d4',
            background: '#030712',
            surface: '#111827',
            text: '#9ca3af',
            heading: '#f9fafb',
        },
        typography: {
            headingFont: 'Outfit',
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
                <header class="fixed top-0 left-0 right-0 z-50 bg-[#030712] border-b border-violet-900/20" id="main-header">
                    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <a href="#" class="flex items-center gap-2 font-bold text-xl text-white tracking-tight">

                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-medium text-slate-400 hover:text-violet-400 transition-colors">
                                {{label}}
                            </a>
                            {{/each}}
                            <a href="#contact" class="bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20">Work With Me</a>
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-white z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-[#030712] z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-2xl font-bold text-white hover:text-violet-400 transition-all transform translate-y-4 opacity-0">
                            {{label}}
                        </a>
                        {{/each}}
                        <a href="#contact" class="mobile-link text-xl font-bold text-violet-400 opacity-0 translate-y-4 transition-all delay-100">Work With Me</a>
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
                                const allLinks = document.querySelectorAll('a[href^="#"]');
                                allLinks.forEach(anchor => {
                                    anchor.addEventListener('click', function (e) {
                                        e.preventDefault();
                                        const targetId = this.getAttribute('href').substring(1);
                                        const target = document.getElementById(targetId);
                                        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                                    });
                                });
                            }
                        })();
                    </script>
                </header>
            `,
            content: {
                username: 'ElenaRossi',
                navLinks: [
                    { label: 'Stats', link: '#stats-pm' },
                    { label: 'Roadmap', link: '#projects-pm' },
                    { label: 'Contact', link: '#contact-pm' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero-pm',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative overflow-hidden">
                    <div class="inline-block px-4 py-1.5 rounded-full bg-violet-900/30 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider mb-8">
                        {{statusTag}}
                    </div>
                    <h1 class="text-5xl md:text-7xl font-bold text-white mb-8 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                        {{name}}
                    </h1>
                    <p class="text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
                        {{heroTagline}}
                    </p>
                    <div class="flex gap-4">
                        <a href="{{cta.link}}" class="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors">
                            {{cta.text}}
                        </a>
                    </div>
                </section>
            `,
            content: {
                name: 'Elena Rossi',
                statusTag: 'Product Strategy & Leadership',
                heroTagline: 'Bridging user needs with technical possibilities. Expert in zero-to-one product launches and scaling platform ecosystems for global markets.',
                avatarImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
                cta: { text: 'View Case Studies', link: '#projects-pm' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'stats-pm',
            type: 'stats',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-12 border-y border-violet-900/20 bg-[#060c1c]" id="stats-pm">
                    <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {{#each stats}}
                        <div class="text-center p-6 rounded-2xl bg-violet-900/5 hover:bg-violet-900/10 transition-colors border border-violet-500/10">
                            <div class="text-3xl md:text-4xl font-bold text-white mb-2">{{value}}</div>
                            <div class="text-xs font-bold text-violet-400 uppercase tracking-wide">{{label}}</div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Product Impact',
                stats: [
                    { value: '10+', label: 'Products Launched' },
                    { value: '50M+', label: 'Daily Users' },
                    { value: 'x4', label: 'Retention Growth' },
                    { value: '98%', label: 'CSAT Score' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects-pm',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-7xl mx-auto" id="projects-pm">
                    <div class="flex justify-between items-end mb-12">
                         <h2 class="text-3xl font-bold text-white">Strategic Roadmap</h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {{#each items}}
                        <div class="bg-[#111827] rounded-3xl p-8 border border-white/5 hover:border-violet-500/50 transition-all group">
                            <div class="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-400 text-2xl mb-6 group-hover:scale-110 transition-transform">
                                <i class="fas fa-layer-group"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-white mb-4">{{title}}</h3>
                            <p class="text-slate-400 leading-relaxed mb-6">{{description}}</p>
                            <div class="flex flex-wrap gap-2 mb-6">
                                <span class="bg-violet-900/30 text-violet-300 px-3 py-1 rounded-full text-xs font-bold">{{technologies}}</span>
                            </div>
                            <a href="{{link}}" class="text-white text-sm font-bold flex items-center gap-2 hover:gap-4 transition-all">Read Analysis <i class="fas fa-arrow-right text-violet-500"></i></a>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Strategic Roadmap',
                items: [
                    {
                        title: 'Ecosystem Migration',
                        description: 'Managed the migration of 2M users to a new core engine without downtime, resulting in 40% performance gain.',
                        technologies: 'Product Strategy',
                        link: '#'
                    },
                    {
                        title: 'AI Discovery Flow',
                        description: 'Launched the first AI-driven discovery engine in the retail niche, driving a $15M revenue lift within 6 months.',
                        technologies: 'AI/ML Growth',
                        link: '#'
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact-pm',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6" id="contact-pm">
                    <div class="max-w-4xl mx-auto bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-violet-900/50">
                        <div class="relative z-10">
                            <h2 class="text-4xl font-bold mb-6">Let's build the future.</h2>
                            <p class="text-violet-100 mb-12 text-lg">Open for consulting and leadership roles.</p>
                            <div class="flex flex-col md:flex-row justify-center gap-6">
                                <a href="mailto:{{email}}" class="bg-white text-violet-700 px-8 py-4 rounded-xl font-bold hover:bg-violet-50 transition-colors shadow-lg">
                                    {{email}}
                                </a>
                                {{#each socials}}
                                <a href="{{url}}" class="bg-violet-800/50 backdrop-blur-sm border border-violet-400/30 px-8 py-4 rounded-xl font-bold hover:bg-violet-800 transition-colors flex items-center justify-center gap-2">
                                    <i class="fab fa-{{platform}}"></i> {{platform}}
                                </a>
                                {{/each}}
                            </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Get In Touch',
                email: 'rossi.elena@product.sm',
                socials: [
                    { platform: 'linkedin', url: 'https://linkedin.com/in/elenarossi' },
                    { platform: 'twitter', url: 'https://twitter.com/rossiproduction' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer-pm',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-12 text-center text-slate-600 text-sm">
                    <div class="mb-4 text-white font-bold text-lg tracking-tight flex items-center justify-center gap-2">
                         <div class="w-6 h-6 rounded bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white text-[10px]">P</div>
                         {{footerHeading}}
                    </div>
                    <p>{{copyright}}</p>
                    <a href="mailto:{{footerEmail}}" class="block mt-2 hover:text-violet-400 transition-colors">{{footerEmail}}</a>
                </footer>
            `,
            content: {
                footerHeading: 'Elena Rossi',
                footerEmail: 'rossi.elena@product.sm',
                copyright: '© 2025 Elena Rossi. All rights reserved.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};

export const EXECUTIVE_TEMPLATES: Template[] = [
    {
        id: "executive_bold",
        name: "Executive Bold",
        niche: "Executive",
        preview: "/templates/screenshots/executive_bold1.png",
        structuredContent: MOCK_MANIFEST_EXECUTIVE,
        html: "",
        css: ""
    },
    {
        id: "product_strategy_dark",
        name: "Product Strategy",
        niche: "Executive",
        preview: "/templates/screenshots/product_strategy1.png",
        structuredContent: PRODUCT_STRATEGY_DARK,
        html: "",
        css: ""
    }
];
