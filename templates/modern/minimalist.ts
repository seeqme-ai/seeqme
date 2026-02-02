import { Manifest } from "@/types";

export const MINIMALIST_CREATOR: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Virtual Assistant',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#a8a29e', // Stone
            secondary: '#78716c',
            background: '#fafaf9', // Stone 50
            surface: '#ffffff',
            text: '#44403c', // Stone 700
            heading: '#1c1917', // Stone 900
        },
        typography: {
            headingFont: 'Playfair Display',
            bodyFont: 'Lato',
            monoFont: 'Courier Prime',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-[#fafaf9] border-b border-[#e7e5e4] transition-all duration-300" id="main-header">
                    <div class="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                        <a href="#" class="text-xl font-serif font-bold text-[#44403c] tracking-wide">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-xs font-bold uppercase tracking-widest text-[#78716c] hover:text-[#44403c] transition-colors">
                                {{label}}
                            </a>
                            {{/each}}
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-[#44403c] z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-[#fafaf9] z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-2xl font-serif text-[#44403c] hover:text-[#78716c] transition-all transform translate-y-4 opacity-0">
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
                username: 'EMILY CHEN',
                navLinks: [
                    { label: 'Philosophy', link: '#about' },
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
                <section class="min-h-screen pt-20 flex items-center bg-[#fafaf9] px-6">
                    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div class="order-2 md:order-1">
                            <p class="text-xs font-bold uppercase tracking-[0.2em] text-[#a8a29e] mb-6">{{statusTag}}</p>
                            <h1 class="text-5xl md:text-7xl font-serif text-[#1c1917] mb-8 leading-tight">
                                {{name}}
                            </h1>
                            <p class="text-lg text-[#57534e] mb-10 max-w-md leading-relaxed">
                                {{heroTagline}}
                            </p>
                            <div class="flex gap-4">
                                <a href="{{cta.link}}" class="px-8 py-3 bg-[#44403c] text-[#fafaf9] font-bold text-sm uppercase tracking-wider hover:bg-[#1c1917] transition-colors">
                                    {{cta.text}}
                                </a>
                                <a href="#contact" class="px-8 py-3 bg-transparent border border-[#a8a29e] text-[#57534e] font-bold text-sm uppercase tracking-wider hover:border-[#44403c] hover:text-[#1c1917] transition-colors">
                                    Book Discovery Call
                                </a>
                            </div>
                            <div class="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#78716c]">
                                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Currently Accepting Clients
                            </div>
                        </div>
                        <div class="order-1 md:order-2 relative aspect-[3/4] md:aspect-square">
                            <img src="{{avatarImage}}" class="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700 rounded-sm" />
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'Your Chaos, Managed.',
                statusTag: 'Executive Virtual Assistant',
                heroTagline: 'I help busy executives and founders reclaim 20+ hours a week. Executive administration, inbox management, and travel coordination.',
                avatarImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800',
                cta: { text: 'View Services', link: '#services' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'trust-bar',
            type: 'logos',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-12 bg-[#fafaf9] border-y border-[#e7e5e4]">
                    <div class="max-w-6xl mx-auto px-6 text-center">
                        <p class="text-xs font-bold uppercase tracking-[0.2em] text-[#a8a29e] mb-8">As seen in / Tools</p>
                        <div class="flex flex-wrap justify-center gap-12 grayscale opacity-50 text-2xl text-[#78716c]">
                            {{#each clients}}
                            <div class="flex items-center gap-2 font-mono font-bold text-sm uppercase tracking-widest">{{this}}</div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                clients: ['Slack', 'Notion', 'Google Workspace', 'HubSpot']
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'problems',
            type: 'about',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 bg-[#fafaf9] px-6" id="about">
                    <div class="max-w-4xl mx-auto text-center">
                        <h2 class="text-3xl font-serif mb-16 italic text-[#44403c]">{{headline}}</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {{#each problems}}
                            <div class="p-6 border border-[#e7e5e4] hover:border-[#a8a29e] transition-colors bg-white/50">
                                <p class="text-[#57534e] text-sm leading-relaxed">{{this}}</p>
                            </div>
                            {{/each}}
                        </div>
                        <p class="mt-16 text-xl font-bold text-[#44403c] italic">{{bio}}</p>
                    </div>
                </section>
            `,
            content: {
                headline: "Do you feel like...",
                problems: [
                    "Your inbox is a black hole where opportunities go to die?",
                    "You're double-booked constantly and missing important family events?",
                    "You're spending more time on admin than on growing your business?"
                ],
                bio: "I can fix that."
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'services',
            type: 'services',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 bg-[#f5f5f4] px-6" id="services">
                    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
                        <div class="md:col-span-4">
                            <h2 class="text-4xl font-serif mb-6">{{title}}</h2>
                            <p class="text-[#78716c] mb-8">{{label}}</p>
                            <div class="w-16 h-1 bg-[#a8a29e]"></div>
                        </div>
                        <div class="md:col-span-8 space-y-12">
                            {{#each services}}
                            <div class="flex flex-col md:flex-row gap-6 items-start pb-12 border-b border-[#e7e5e4] last:border-0 last:pb-0">
                                <div class="flex-1">
                                    <h3 class="text-2xl font-serif mb-3">{{title}}</h3>
                                    <p class="text-[#57534e] text-sm mb-4 leading-relaxed">{{desc}}</p>
                                </div>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'My Services',
                label: 'Specialized support for high-performing individuals.',
                services: [
                    { title: 'Inbox Management', desc: 'I reach Inbox Zero daily so you only see what matters. Filtering, labeling, and drafting responses.' },
                    { title: 'Calendar Tetris', desc: 'No more conflicts. I manage your time like a strategic asset including travel logistics.' },
                    { title: 'Executive Admin', desc: 'The catch-all for your business operations. Invoicing, expenses, and project tracking.' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'about-me',
            type: 'about',
            componentId: 'GEN_TEMPLATE',
            template: `
                 <section class="py-24 bg-[#fafaf9] px-6">
                    <div class="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
                        <div class="w-full md:w-1/3 aspect-[3/4]">
                            <img src="{{image}}" class="w-full h-full object-cover grayscale rounded-sm" />
                        </div>
                        <div class="w-full md:w-2/3">
                            <h2 class="text-3xl font-serif mb-6">Hi, I'm {{headline}}.</h2>
                            <p class="text-[#57534e] mb-6 leading-relaxed">{{bio}}</p>
                            <p class="text-[#1c1917] font-bold italic mb-8">My goal is simple: to give you your brain space back.</p>
                        </div>
                    </div>
                 </section>
            `,
            content: {
                headline: "Jessica",
                image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800",
                bio: "I'm a Type-A organizer who loves checklists more than chocolate. With 5 years of experience supporting C-level executives in Tech and Finance, I know how to anticipate needs before they arise.",
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 bg-[#f5f5f4] px-6 text-center" id="contact">
                    <div class="max-w-2xl mx-auto">
                        <div class="w-16 h-16 bg-[#e7e5e4] mx-auto rounded-full flex items-center justify-center mb-8">
                            <i class="fas fa-paper-plane text-[#a8a29e] text-xl"></i>
                        </div>
                        <h2 class="text-3xl font-serif mb-6">{{title}}</h2>
                        <p class="text-[#78716c] mb-10 leading-relaxed">{{description}}</p>
                        
                        <form id="contact-form-{{id}}" class="space-y-6 text-left bg-white p-8 md:p-12 shadow-sm border border-[#e7e5e4]">
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-widest text-[#a8a29e] mb-2">Name</label>
                                <input type="text" id="name-{{id}}" required class="w-full bg-[#fafaf9] border-b border-[#e7e5e4] p-3 focus:outline-none focus:border-[#44403c] transition-colors" />
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-widest text-[#a8a29e] mb-2">Needs</label>
                                <textarea id="message-{{id}}" rows="4" required class="w-full bg-[#fafaf9] border-b border-[#e7e5e4] p-3 focus:outline-none focus:border-[#44403c] transition-colors resize-none"></textarea>
                            </div>
                            <button type="submit" class="w-full py-4 bg-[#44403c] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#1c1917] transition-colors">
                                Send Inquiry
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
                                    const mailtoSubject = encodeURIComponent('Inquiry from ' + name);
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
                title: "Let's get organized.",
                description: "Ready to hand off the busy work? Fill out the form below to book a free 15-minute discovery call.",
                email: 'hello@jessicaadmin.com',
                label: 'Contact'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                 <footer class="py-12 px-6 bg-[#fafaf9] text-center text-[#a8a29e] text-xs uppercase tracking-widest border-t border-[#e7e5e4]">
                     <a href="mailto:{{footerEmail}}" class="block mb-6 hover:text-[#44403c] transition-colors lowercase font-serif italic text-lg tracking-normal">{{footerEmail}}</a>
                     <h3 class="font-serif mb-4 text-[#44403c] normal-case italic text-xl">{{footerHeading}}</h3>
                    <p>{{copyright}}</p>
                 </footer>
            `,
            content: {
                footerHeading: "Your Partner in Productivity",
                footerEmail: 'hello@jessicaadmin.com',
                copyright: "© 2025 Jessica Admin Services"
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};
