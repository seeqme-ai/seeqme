import { Manifest } from "@/types";

export const TYPOGRAPHIC_BOLD: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Content Manager',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#000000',
            secondary: '#ffffff',
            background: '#ffffff',
            surface: '#f5f5f5',
            text: '#333333',
            heading: '#000000',
        },
        typography: {
            headingFont: 'Lora',
            bodyFont: 'Inter',
            monoFont: 'Roboto Mono',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black transition-all duration-300" id="main-header">
                    <div class="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                        <a href="#" class="text-2xl font-serif font-black tracking-tighter text-black uppercase hover:opacity-70 transition-opacity">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-12">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-mono uppercase tracking-widest text-gray-500 hover:text-black transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black after:transition-all hover:after:w-full">
                                {{label}}
                            </a>
                            {{/each}}
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-black z-50 relative w-10 h-10 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors">
                            <i class="fas fa-bars text-lg transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-12 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-4xl font-serif font-black uppercase text-black hover:text-gray-500 transition-all transform translate-y-4 opacity-0">
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
                username: 'ALEX.MORGAN',
                navLinks: [
                    { label: 'Work', link: '#portfolio' },
                    { label: 'Approach', link: '#approach' },
                    { label: 'Services', link: '#services' },
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
                <section class="min-h-screen pt-24 flex flex-col justify-center px-6 w-full max-w-[1400px] mx-auto border-x border-dashed border-gray-200">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span class="inline-block border border-black px-3 py-1 text-xs font-mono uppercase tracking-widest mb-8">{{statusTag}}</span>
                            <h1 class="text-6xl md:text-8xl font-serif font-black leading-[0.9] mb-8 tracking-tighter">
                                {{{name}}}<br/>
                                <span class="italic font-light opacity-50">{{highlight}}</span>
                            </h1>
                            <p class="text-xl md:text-2xl text-gray-500 font-light max-w-lg leading-relaxed mb-12">
                                {{heroTagline}}
                            </p>
                            <div class="flex gap-4">
                                {{#each services}}
                                <span class="bg-gray-100 px-4 py-2 text-xs font-bold uppercase tracking-wide">{{this}}</span>
                                {{/each}}
                            </div>
                        </div>
                        <div class="relative aspect-square md:aspect-[4/5] bg-gray-100 overflow-hidden grayscale contrast-125">
                            <img src="{{avatarImage}}" class="w-full h-full object-cover mix-blend-multiply opacity-90" />
                            <div class="absolute inset-0 border border-black/10"></div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'Words that build',
                highlight: 'communities.',
                heroTagline: 'I help brands find their voice. From editorial strategy to community management, I craft narratives that drive engagement and loyalty.',
                statusTag: 'Currently Accepting Clients',
                services: ['Strategy', 'Editorial', 'Community'],
                avatarImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200',
                cta: { text: "Work With Me", link: '#contact' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'stats',
            type: 'stats',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 border-y border-black bg-black text-white" id="results">
                    <div class="w-full max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {{#each stats}}
                        <div class="border-l border-white/20 pl-6 text-left">
                            <div class="text-5xl md:text-6xl font-serif font-black mb-2">{{value}}</div>
                            <div class="text-xs font-mono uppercase tracking-widest text-gray-400">{{label}}</div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                stats: [
                    { value: '300%', label: 'Organic Traffic Growth' },
                    { value: '50k+', label: 'Community Members' },
                    { value: 'Top 10', label: 'Newsletter Ranking' },
                    { value: '5.2%', label: 'Click-Through Rate' },
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'portfolio',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 w-full max-w-[1400px] mx-auto border-x border-dashed border-gray-200" id="portfolio">
                    <h2 class="text-sm font-mono uppercase tracking-widest mb-16 border-b border-black pb-4 inline-block">Selected Work ({{projects.length}})</h2>
                    <div class="space-y-24">
                        {{#each projects}}
                        <div class="group grid grid-cols-1 md:grid-cols-12 gap-8 items-start cursor-pointer">
                            <div class="md:col-span-2 text-xs font-mono text-gray-400 pt-2">{{year}}</div>
                            <div class="md:col-span-6">
                                <h3 class="text-4xl md:text-5xl font-serif font-bold mb-4 group-hover:underline decoration-1 underline-offset-4">{{title}}</h3>
                                <p class="text-lg text-gray-600 mb-6 max-w-xl">{{desc}}</p>
                                <div class="flex gap-4">
                                    {{#each tags}}
                                    <span class="text-xs font-bold uppercase border border-gray-200 px-2 py-1">{{this}}</span>
                                    {{/each}}
                                </div>
                            </div>
                            <div class="md:col-span-4 aspect-video overflow-hidden bg-gray-100 grayscale group-hover:grayscale-0 transition-all duration-500">
                                <img src="{{image}}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                            </div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                projects: [
                    { title: 'The Future of Remote Work', year: '2024', desc: 'A deep-dive editorial series for Dropbox featuring interviews with 50+ CEOs. Drove 200k unique views.', tags: ['Long-form', 'Interview', 'Strategy'], image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800' },
                    { title: 'Scaling Community', year: '2023', desc: 'Built and managed the discord community for a fintech unicorn, growing it from 0 to 15k active members.', tags: ['Community', 'Discord', 'Events'], image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800' },
                    { title: 'Brand Voice Overhaul', year: '2023', desc: 'Redefined the tone of voice for a legacy insurance brand, modernizing their communication across all channels.', tags: ['Branding', 'Copywriting'], image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'approach',
            type: 'process',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="bg-[#f8f8f8] py-32 px-6" id="approach">
                    <div class="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div class="md:col-span-1">
                            <h2 class="text-4xl font-serif font-black mb-6">{{title}}</h2>
                            <p class="text-gray-500 max-w-xs">I believe in substance over style. Every piece of content should have a clear job to do.</p>
                        </div>
                        <div class="md:col-span-2 grid grid-cols-1 gap-12">
                            {{#each steps}}
                            <div class="border-t border-black pt-8">
                                <div class="text-xs font-mono font-bold mb-4">0{{@index}}</div>
                                <h3 class="text-2xl font-bold mb-4 font-serif">{{title}}</h3>
                                <p class="text-gray-600 leading-relaxed">{{desc}}</p>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'My Methodology',
                steps: [
                    { title: 'Research & Insight', desc: 'Great content starts with listening. I dive deep into audience data, competitor gaps, and cultural trends before typing a word.' },
                    { title: 'Strategic Narrative', desc: 'I build content pillars that align with business goals, ensuring every piece of content serves a specific purpose in the funnel.' },
                    { title: 'Distribution', desc: 'Content is useless if no one sees it. I plan distribution channels—email, social, syndication—from day one.' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'services',
            type: 'services',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 w-full max-w-[1400px] mx-auto border-x border-dashed border-gray-200" id="services">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {{#each services}}
                        <div class="border border-black p-8 hover:bg-black hover:text-white transition-colors duration-300 group">
                            <h3 class="text-xl font-serif font-black mb-6">{{title}}</h3>
                            <ul class="space-y-3">
                                {{#each items}}
                                <li class="text-sm font-mono text-gray-500 group-hover:text-gray-400 flex items-center gap-2">
                                    <span class="w-1 h-1 bg-black group-hover:bg-white rounded-full"></span> {{this}}
                                </li>
                                {{/each}}
                            </ul>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                services: [
                    { title: 'Content Strategy', items: ['Editorial Calendar Planning', 'SEO Keyword Research', 'Competitor Analysis'] },
                    { title: 'Creation', items: ['Blog Posts & Articles', 'Whitepapers & E-books', 'Email Newsletters'] },
                    { title: 'Management', items: ['Social Media Management', 'Community Moderation', 'Freelancer Coordination'] }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 text-center border-t border-black bg-white" id="contact">
                    <div class="max-w-2xl mx-auto">
                        <h2 class="text-6xl md:text-8xl font-serif font-black mb-12 tracking-tighter">{{heading}}</h2>
                        <a href="mailto:{{email}}" class="inline-block text-lg font-mono uppercase tracking-widest border-b-2 border-black pb-2 hover:bg-black hover:text-white hover:px-4 transition-all duration-300">
                            {{ctaText}}
                        </a>
                         <form id="contact-form-{{id}}" class="hidden">
                             <!-- Hidden form for structure adherence, using direct mailto link above for aesthetic -->
                         </form>
                    </div>
                </section>
            `,
            content: {
                heading: "Let's tell your story.",
                email: 'alex@content.com',
                ctaText: 'Get in Touch'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-12 px-6 border-t border-gray-200 text-center">
                    <div class="flex flex-col gap-4">
                        <span class="font-serif font-black text-xl">{{footerHeading}}</span>
                        <div class="text-xs font-mono text-gray-400 uppercase tracking-widest">
                            &copy; {{copyright}}
                        </div>
                    </div>
                </footer>
            `,
            content: {
                footerHeading: 'ALEX.MORGAN',
                footerEmail: 'alex@content.com',
                copyright: '2025 All rights reserved.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};
