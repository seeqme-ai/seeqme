import { Template, Manifest } from "@/types";

export const MOCK_MANIFEST_CREATIVE: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Creative & Art Direction',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#6366f1',
            secondary: '#4338ca',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#475569',
            heading: '#0f172a',
        },
        typography: {
            headingFont: 'Playfair Display',
            bodyFont: 'Inter',
            monoFont: 'Outfit',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-indigo-100 transition-all duration-300" id="main-header">
                    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <a href="#" class="font-serif text-2xl font-bold tracking-tight text-indigo-900">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                                {{label}}
                            </a>
                            {{/each}}
                            <a href="#contact" class="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">Let's Talk</a>
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-indigo-900 z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-3xl font-serif font-bold text-indigo-900 hover:text-indigo-600 transition-all transform translate-y-4 opacity-0">
                            {{label}}
                        </a>
                        {{/each}}
                        <a href="#contact" class="mobile-link text-xl font-medium text-indigo-500 opacity-0 translate-y-4 transition-all delay-100">Let's Talk</a>
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
                username: 'ELARA VANCE',
                navLinks: [
                    { label: 'Work', link: '#projects' },
                    { label: 'About', link: '#about' },
                    { label: 'Skills', link: '#skills' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero-c1',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div class="flex-1 space-y-8">
                        <span class="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium tracking-wide">
                            {{statusTag}}
                        </span>
                        <h1 class="text-5xl md:text-7xl font-serif font-bold text-slate-900 leading-tight">
                            {{{heroTagline}}}
                        </h1>
                        <p class="text-xl text-slate-600 max-w-lg leading-relaxed">
                            {{name}}
                        </p>
                        <a href="{{cta.link}}" class="inline-flex items-center gap-2 text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1 hover:text-indigo-800 hover:border-indigo-800 transition-colors">
                            {{cta.text}} <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                    <div class="flex-1 relative">
                        <div class="absolute inset-0 bg-indigo-200 rounded-full blur-[100px] opacity-30"></div>
                        <img src="{{avatarImage}}" class="relative z-10 w-full rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700" alt="Hero Image" />
                    </div>
                </section>
            `,
            content: {
                name: 'ELARA VANCE',
                statusTag: 'Art Director & Designer',
                heroTagline: 'Blurring the line between digital & art.<br/><span class="text-xl md:text-2xl text-slate-500 font-normal">Creating memorable visual languages for bold brands.</span>',
                avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800',
                cta: { text: 'View Portfolio', link: '#projects' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'about-c1',
            type: 'about',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 bg-slate-50" id="about">
                     <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div class="order-2 md:order-1 relative">
                            <img src="{{image}}" class="w-full h-auto rounded-lg shadow-xl" />
                            <div class="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-serif italic">
                                Est. 2018
                            </div>
                        </div>
                        <div class="order-1 md:order-2 space-y-6">
                            <h2 class="text-3xl md:text-4xl font-serif font-bold text-slate-900">{{title}}</h2>
                            <p class="text-lg text-slate-600 leading-relaxed">{{content}}</p>
                        </div>
                     </div>
                </section>
            `,
            content: {
                title: 'Creative Philosophy',
                content: 'I believe design is intelligence made visible. My approach combines classical art principles with cutting-edge web technologies to create experiences that aren\'t just seen, but felt.',
                image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects-c1',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-7xl mx-auto" id="projects">
                    <h2 class="text-3xl font-serif font-bold mb-12 text-slate-900">{{title}}</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {{#each items}}
                        <div class="group relative overflow-hidden rounded-2xl cursor-pointer">
                            <img src="{{image}}" class="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                                <span class="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-2">{{technologies}}</span>
                                <h3 class="text-white text-2xl font-bold mb-2">{{title}}</h3>
                                <p class="text-slate-300 text-sm">{{description}}</p>
                            </div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Selected Works',
                items: [
                    {
                        title: 'Lumina Fashion',
                        description: 'Rebranding a heritage luxury house for the digital age.',
                        technologies: 'Branding, Web Design',
                        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800',
                        link: '#'
                    },
                    {
                        title: 'Echo Festival',
                        description: 'Interactive 3D site for a global music event.',
                        technologies: 'Three.js, WebGL',
                        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800',
                        link: '#'
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'skills-c1',
            type: 'skills',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-20 px-6 max-w-7xl mx-auto" id="skills">
                    <h2 class="text-2xl font-bold text-center mb-12 text-slate-400 uppercase tracking-widest">{{title}}</h2>
                    <div class="flex flex-wrap justify-center gap-4 text-center">
                        {{#each skills}}
                        <div class="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-600 font-medium shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                            {{name}}
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Craft & Tools',
                skills: [
                    { name: 'Art Direction' },
                    { name: 'Brand Identity' },
                    { name: 'Motion Design' },
                    { name: 'WebGL' },
                    { name: 'Cinema 4D' },
                    { name: 'Figma' },
                    { name: 'Typography' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact-c1',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 bg-indigo-900 text-white" id="contact">
                    <div class="max-w-4xl mx-auto text-center">
                        <h2 class="text-4xl md:text-5xl font-serif font-bold mb-8">{{title}}</h2>
                        <p class="text-indigo-200 text-xl mb-12">Ready to start a project? Let's build something extraordinary together.</p>
                        
                        <div class="flex flex-col md:flex-row justify-center gap-8 mb-16">
                             <a href="mailto:{{email}}" class="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-indigo-900 rounded-full font-bold hover:bg-indigo-50 transition-colors">
                                <i class="fas fa-envelope"></i> {{email}}
                             </a>
                             <span class="inline-flex items-center justify-center gap-3 px-8 py-4 border border-indigo-700 rounded-full text-indigo-200">
                                <i class="fas fa-map-marker-alt"></i> {{location}}
                             </span>
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Let\'s Create',
                email: 'elara@creative.com',
                phone: '+1 (213) 555-0199',
                location: 'Los Angeles, CA'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer-c1',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-12 bg-indigo-950 text-indigo-400 text-center text-sm">
                    <div class="mb-4 text-white font-serif text-xl font-bold">{{footerHeading}}</div>
                    <p>{{copyright}}</p>
                    <a href="mailto:{{footerEmail}}" class="block mt-2 hover:text-white transition-colors">{{footerEmail}}</a>
                </footer>
            `,
            content: {
                footerHeading: 'ELARA VANCE',
                footerEmail: 'elara@creative.com',
                copyright: '© 2025 Elara Vance. All rights reserved.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};

// PHOTOGRAPHY PORTFOLIO TEMPLATE
export const PHOTOGRAPHY_MINIMAL: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Photography & Visual Arts',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#000000',
            secondary: '#737373',
            background: '#ffffff',
            surface: '#f5f5f5',
            text: '#262626',
            heading: '#000000',
        },
        typography: {
            headingFont: 'Playfair Display',
            bodyFont: 'Inter',
            monoFont: 'Outfit',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100" id="main-header">
                    <div class="max-w-[1800px] mx-auto px-8 h-24 flex items-center justify-between">
                        <a href="#" class="font-serif text-3xl font-black tracking-tighter text-black uppercase">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors">
                                {{label}}
                            </a>
                            {{/each}}
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-black z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-3xl font-serif font-black text-black uppercase tracking-widest hover:text-gray-500 transition-all transform translate-y-4 opacity-0">
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
                username: 'JULIAN BLACK',
                navLinks: [
                    { label: 'Gallery', link: '#projects-photo' },
                    { label: 'Contact', link: '#contact-photo' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero-photo',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="h-screen flex flex-col justify-center items-center text-center px-6 pt-24 relative overflow-hidden">
                    <div class="absolute inset-0 z-0">
                        <img src="{{backgroundImage}}" class="w-full h-full object-cover opacity-20 grayscale" />
                        <div class="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                    </div>
                    <div class="relative z-10 max-w-4xl mx-auto">
                        <h1 class="text-6xl md:text-9xl font-serif font-black text-black mb-6 tracking-tighter">{{{heroTagline}}}</h1>
                        <p class="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto italic mb-12">{{name}}</p>
                        <a href="{{cta.link}}" class="inline-block border border-black px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all">
                            {{cta.text}}
                        </a>
                    </div>
                </section>
            `,
            content: {
                name: 'Julian Black',
                statusTag: 'Minimalist Photographer',
                heroTagline: 'UNSEEN<br/><span class="text-xl md:text-2xl text-gray-400 font-normal italic">Capturing the unseen moments.</span>',
                backgroundImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800',
                cta: { text: 'Enter Gallery', link: '#projects-photo' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects-photo',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-[1800px] mx-auto" id="projects-photo">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {{#each items}}
                        <div class="group relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer">
                            <img src="{{image}}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center text-white text-center p-8">
                                <h3 class="text-3xl font-serif italic mb-2">{{title}}</h3>
                                <p class="text-xs uppercase tracking-widest font-bold opacity-80">{{technologies}}</p>
                            </div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'The Gallery',
                items: [
                    {
                        title: 'Shadow & Light',
                        description: 'A study on high-contrast architectural forms in Tokyo.',
                        technologies: 'Editorial, B&W',
                        image: 'https://images.unsplash.com/photo-1449156059431-789955fa190a?w=800',
                        link: '#'
                    },
                    {
                        title: 'Vogue X Paris',
                        description: 'Mainstream commercial shoot for luxury autumn collection.',
                        technologies: 'Fashion, Studio',
                        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
                        link: '#'
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact-photo',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 text-center" id="contact-photo">
                    <h2 class="text-5xl font-serif italic mb-8">{{title}}</h2>
                    <a href="mailto:{{email}}" class="text-2xl md:text-5xl font-black uppercase hover:text-gray-500 transition-colors border-b-4 border-black pb-2 inline-block mb-12">
                        {{email}}
                    </a>
                    <div class="flex justify-center gap-8 text-xl">
                        {{#each socials}}
                        <a href="{{url}}" class="hover:opacity-50 transition-opacity uppercase text-xs font-bold tracking-widest">{{platform}}</a>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Inquiries',
                email: 'studio@jblack.com',
                socials: [
                    { platform: 'Instagram', url: '#' },
                    { platform: 'Behance', url: '#' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer-photo',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-12 text-center text-xs uppercase tracking-widest text-gray-400">
                    <div class="mb-4 text-black font-serif text-lg font-bold tracking-widest">{{footerHeading}}</div>
                    <p>{{copyright}}</p>
                    <a href="mailto:{{footerEmail}}" class="block mt-2 hover:text-black transition-colors">{{footerEmail}}</a>
                </footer>
            `,
            content: {
                footerHeading: 'JULIAN BLACK',
                footerEmail: 'studio@jblack.com',
                copyright: '© 2025 Julian Black Studio. All rights reserved.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};

export const CREATIVE_TEMPLATES: Template[] = [
    {
        id: "visual_artist",
        name: "Visual Artist (Ethereal)",
        niche: "Creative",
        preview: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800",
        structuredContent: MOCK_MANIFEST_CREATIVE,
        html: "",
        css: ""
    },
    {
        id: "photography_minimal",
        name: "High-End Photography",
        niche: "Creative",
        preview: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800",
        structuredContent: PHOTOGRAPHY_MINIMAL,
        html: "",
        css: ""
    }
];
