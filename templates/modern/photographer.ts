import { Manifest } from "@/types";

export const PHOTOGRAPHER_GALLERY: Manifest = {
    metadata: {
        version: '2.0',
        niche: 'High-End Photography',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#1a1a1a',
            secondary: '#e5e5e5',
            background: '#ffffff',
            surface: '#f9fafb',
            text: '#374151',
            heading: '#111827',
        },
        typography: {
            headingFont: 'Playfair Display',
            bodyFont: 'Montserrat',
            monoFont: 'Cormorant Garamond',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md transition-all duration-300 border-b border-gray-100" id="main-header">
                    <div class="max-w-[1800px] mx-auto px-8 h-24 flex items-center justify-between">
                        <a href="#" class="text-3xl font-serif font-black tracking-tighter text-black uppercase hover:opacity-70 transition-opacity">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-12">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors">
                                {{label}}
                            </a>
                            {{/each}}
                            <a href="#contact" class="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-colors">Book Session</a>
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-black z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-4xl font-serif text-black italic hover:text-gray-500 transition-all transform translate-y-4 opacity-0">
                            {{label}}
                        </a>
                        {{/each}}
                        <a href="#contact" class="mobile-link text-xl font-bold uppercase tracking-[0.2em] text-black opacity-0 translate-y-4 transition-all delay-100 mt-8">Book Session</a>
                    </div>
                    <script>
                        (function() {
                            const btn = document.getElementById('mobile-menu-btn-{{id}}');
                            const menu = document.getElementById('mobile-menu-{{id}}');
                            const icon = document.getElementById('menu-icon-{{id}}');
                            const links = menu.querySelectorAll('.mobile-link');
                            let isOpen = false;
                            
                            // Mobile menu toggle
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
                                
                                // Smooth scroll for ALL anchor links
                                document.addEventListener('click', function(e) {
                                    const anchor = e.target.closest('a[href^="#"]');
                                    if (anchor) {
                                        e.preventDefault();
                                        const targetId = anchor.getAttribute('href').substring(1);
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
                username: 'LUMIÈRE',
                navLinks: [
                    { label: 'Work', link: '#portfolio' },
                    { label: 'Services', link: '#services' },
                    { label: 'About', link: '#about' },
                    { label: 'Journal', link: '#press' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="h-screen relative flex items-center justify-center overflow-hidden">
                    <div class="absolute inset-0 z-0">
                         <img src="{{backgroundImage}}" class="w-full h-full object-cover animate-kenburns" />
                         <div class="absolute inset-0 bg-black/20"></div>
                    </div>
                    <div class="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
                        <div class="inline-block px-4 py-1 border border-white/30 rounded-full bg-white/10 backdrop-blur-sm mb-8">
                             <span class="text-[10px] font-bold uppercase tracking-[0.3em]">{{statusTag}}</span>
                        </div>
                        <h1 class="text-6xl md:text-9xl font-serif italic mb-8 tracking-tighter loading-fade-up">{{name}}</h1>
                        <p class="text-lg md:text-2xl font-light mb-12 max-w-2xl mx-auto loading-fade-up delay-100 opacity-90">{{heroTagline}}</p>
                        <div class="flex flex-col md:flex-row gap-6 justify-center loading-fade-up delay-200">
                             <a href="{{cta.link}}" class="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors">{{cta.text}}</a>
                             <a href="#about" class="px-10 py-4 border border-white text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors">Studio Profile</a>
                        </div>
                    </div>
                    
                    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                        <i class="fas fa-arrow-down text-white/50 text-xl"></i>
                    </div>

                    <style>
                        @keyframes kenburns {
                            0% { transform: scale(1); }
                            100% { transform: scale(1.1); }
                        }
                        .animate-kenburns {
                            animation: kenburns 20s ease-out infinite alternate;
                        }
                        .loading-fade-up {
                            animation: fadeUp 1s ease-out forwards;
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        .delay-100 { animation-delay: 0.2s; }
                        .delay-200 { animation-delay: 0.4s; }
                        
                        @keyframes fadeUp {
                            to { opacity: 1; transform: translateY(0); }
                        }
                    </style>
                </section>
            `,
            content: {
                name: 'Lumière',
                statusTag: 'Taking Bookings 2025',
                heroTagline: 'Capturing the quiet moments between the chaos. specializing in editorial, fashion, and fine art photography.',
                backgroundImage: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=1600',
                cta: { text: "View Portfolio", link: '#portfolio' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'about',
            type: 'about',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 max-w-7xl mx-auto" id="about">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div class="relative">
                            <div class="absolute -top-10 -left-10 w-40 h-40 bg-gray-100 rounded-full z-0"></div>
                            <img src="{{avatarImage}}" class="relative z-10 w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" />
                            <div class="absolute -bottom-10 -right-10 w-full h-full border border-black/10 z-0"></div>
                        </div>
                        <div class="space-y-8">
                            <h2 class="text-lg font-bold uppercase tracking-[0.4em] text-gray-400">The Artist</h2>
                            <h3 class="text-5xl md:text-6xl font-serif italic leading-none">{{title}}</h3>
                            <div class="w-20 h-1 bg-black"></div>
                            <p class="text-xl text-gray-600 font-light leading-relaxed">
                                {{content}}
                            </p>
                            <div class="grid grid-cols-3 gap-8 pt-8 border-t border-gray-100">
                                {{#each stats}}
                                <div>
                                    <div class="text-3xl font-serif font-bold">{{value}}</div>
                                    <div class="text-[10px] uppercase tracking-widest text-gray-400 mt-2">{{label}}</div>
                                </div>
                                {{/each}}
                            </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Seeing Light Differently',
                content: 'Founded in 2018, Lumière has been featured in Vogue, Harper\'s Bazaar, and W Magazine. We believe photography is not just about capturing an image, but evoking an emotion. Our approach is minimal, raw, and focused on the human connection.',
                avatarImage: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800',
                stats: [
                    { value: '500+', label: 'Shoots' },
                    { value: '15+', label: 'Countries' },
                    { value: '40+', label: 'Awards' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'portfolio',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="px-6 py-24 bg-[#fafafa]" id="portfolio">
                    <div class="max-w-[1800px] mx-auto text-center mb-20">
                        <h2 class="text-5xl font-serif italic mb-6">Selected Works</h2>
                        <div class="flex justify-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
                            <button class="text-black border-b border-black pb-1">All</button>
                            <button class="hover:text-black transition-colors">Editorial</button>
                            <button class="hover:text-black transition-colors">Campaign</button>
                            <button class="hover:text-black transition-colors">Portrait</button>
                        </div>
                    </div>
                
                    <div class="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 max-w-[1800px] mx-auto px-6">
                        {{#each items}}
                        <div class="group relative break-inside-avoid cursor-pointer overflow-hidden">
                            <img src="{{image}}" class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale hover:grayscale-0" />
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                                <span class="text-white font-serif text-2xl italic translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">{{name}}</span>
                                <span class="text-white/60 text-xs uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-200">{{category}}</span>
                            </div>
                        </div>
                        {{/each}}
                    </div>
                    
                    <div class="text-center mt-20">
                        <a href="#" class="inline-block px-12 py-4 border border-black hover:bg-black hover:text-white transition-all uppercase text-xs font-bold tracking-widest">View Full Archive</a>
                    </div>
                </section>
            `,
            content: {
                items: [
                    { name: 'Ethereal Dreams', category: 'Editorial', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800' },
                    { name: 'Urban Solitude', category: 'Fine Art', image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800' },
                    { name: 'Velvet Noir', category: 'Commercial', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800' },
                    { name: 'Desert Mirage', category: 'Travel', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800' },
                    { name: 'Raw Emotion', category: 'Portrait', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800' },
                    { name: 'Geometric Shadows', category: 'Architecture', image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800' },
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'services',
            type: 'services',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 bg-black text-white" id="services">
                    <div class="max-w-7xl mx-auto">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20">
                            <div>
                                <h2 class="text-6xl font-serif italic mb-8">Investment</h2>
                                <p class="text-gray-400 text-lg leading-relaxed max-w-md">
                                    We offer bespoke photography packages tailored to your specific needs. From intimate portraits to large-scale commercial campaigns.
                                </p>
                            </div>
                            <div class="space-y-12">
                                {{#each services}}
                                <div class="border-b border-white/20 pb-12 group">
                                    <div class="flex justify-between items-baseline mb-4">
                                        <h3 class="text-3xl font-serif group-hover:italic transition-all">{{title}}</h3>
                                        <span class="text-lg font-mono text-gray-500">{{price}}</span>
                                    </div>
                                    <p class="text-gray-400 mb-6 max-w-lg">{{description}}</p>
                                    <ul class="grid grid-cols-2 gap-2 text-sm text-gray-500">
                                        {{#each features}}
                                        <li class="flex items-center gap-2"><div class="w-1 h-1 bg-white rounded-full"></div> {{this}}</li>
                                        {{/each}}
                                    </ul>
                                </div>
                                {{/each}}
                            </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                services: [
                    {
                        title: 'Editorial Campaign',
                        price: 'from $5,000',
                        description: 'Full-day creative direction and photography for brands looking to make a statement.',
                        features: ['Creative Direction', '8 Hours Coverage', 'Locations & Scouting', 'High-End Retouching']
                    },
                    {
                        title: 'Portrait Session',
                        price: 'from $850',
                        description: 'Intimate studio or location sessions focusing on authenticity and personality.',
                        features: ['2 Hours Coverage', '2 Outfit Changes', '20 Retouched Images', 'Online Gallery']
                    },
                    {
                        title: 'Event Coverage',
                        price: 'Custom',
                        description: 'Discreet and artistic documentation of exclusive events and celebrations.',
                        features: ['Unlimited Coverage', 'Second Shooter', 'Sneak Peeks (24h)', 'Full Collection']
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'runway',
            type: 'video',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 bg-[#fafafa]" id="runway">
                     <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div class="order-2 md:order-1">
                            <div class="text-xs font-bold uppercase tracking-widest mb-4 text-gray-400">Behind the Scenes</div>
                            <h2 class="text-5xl font-serif mb-6 leading-tight">The Art of <span class="italic text-gray-400">Creation</span></h2>
                            <p class="text-gray-600 mb-8 leading-relaxed text-lg font-light">
                                Every image tells a story, but the process is where the magic happens. We immerse ourselves in the environment, light, and subject to capture the unseen.
                            </p>
                            <a href="#" class="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:gap-4 transition-all">
                                Watch Full Process <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                        <div class="order-1 md:order-2 aspect-[4/3] bg-black relative group overflow-hidden shadow-2xl">
                            <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="w-24 h-24 border border-white/30 rounded-full flex items-center justify-center text-white cursor-pointer backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all duration-300">
                                    <i class="fas fa-play text-2xl ml-1"></i>
                                </div>
                            </div>
                        </div>
                     </div>
                </section>
            `,
            content: {},
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'testimonials',
            type: 'testimonials',
            componentId: 'GEN_TEMPLATE',
            template: `
               <section class="py-24 px-6 bg-white border-t border-gray-100">
                    <div class="max-w-4xl mx-auto text-center">
                        <i class="fas fa-quote-left text-4xl text-gray-200 mb-8"></i>
                        <h2 class="text-3xl md:text-5xl font-serif italic mb-12 leading-tight text-gray-900">
                            "{{quote}}"
                        </h2>
                        <div class="flex flex-col items-center gap-2">
                             <img src="{{avatar}}" class="w-16 h-16 rounded-full object-cover grayscale mb-2" />
                             <span class="font-bold uppercase tracking-widest text-xs">{{author}}</span>
                             <span class="text-gray-400 text-xs font-serif italic">{{role}}</span>
                        </div>
                    </div>
               </section>
            `,
            content: {
                quote: 'The most professional and intuitive photographer I have ever worked with. Lumière captured exactly what we needed before we even knew we needed it.',
                author: 'Sarah Jenkins',
                role: 'Creative Director, Vogue Italia',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'press',
            type: 'logos',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-20 border-y border-gray-100 text-center bg-[#fafafa]">
                    <p class="text-[10px] font-bold uppercase tracking-[0.3em] mb-12 text-gray-400">As Featured In</p>
                     <div class="flex flex-wrap justify-center gap-16 md:gap-24 font-serif italic text-3xl text-gray-300">
                        <span class="hover:text-black transition-colors">Vogue</span>
                        <span class="hover:text-black transition-colors">Vanity Fair</span>
                        <span class="hover:text-black transition-colors">Harper's Bazaar</span>
                        <span class="hover:text-black transition-colors">Elle</span>
                        <span class="hover:text-black transition-colors">GQ</span>
                     </div>
                </section>
            `,
            content: {},
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="bg-white py-32 px-6 text-center" id="contact">
                    <div class="max-w-2xl mx-auto">
                        <h2 class="text-5xl font-serif italic mb-6">Inquire</h2>
                        <p class="text-gray-500 mb-12 font-light text-lg">Available for commissions worldwide.<br/>Please tell us a bit about your project.</p>
                        
                        <form id="contact-form-{{id}}" class="space-y-8 text-left">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div class="group">
                                    <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block group-focus-within:text-black transition-colors">Name</label>
                                    <input type="text" id="name-{{id}}" required class="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors font-serif text-lg" />
                                </div>
                                <div class="group">
                                    <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block group-focus-within:text-black transition-colors">Email</label>
                                    <input type="email" id="email-{{id}}" required class="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors font-serif text-lg" />
                                </div>
                            </div>
                            <div class="group">
                                <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block group-focus-within:text-black transition-colors">Message</label>
                                <textarea id="message-{{id}}" required class="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors font-serif text-lg resize-none h-32"></textarea>
                            </div>
                            <div class="text-center pt-8">
                                <button type="submit" class="px-16 py-5 uppercase text-xs font-bold tracking-[0.2em] bg-black text-white hover:bg-gray-800 transition-colors">Send Request</button>
                            </div>
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
                                    const subject = 'Inquiry from ' + name;
                                    const mailtoSubject = encodeURIComponent(subject);
                                    const mailtoBody = encodeURIComponent('Name: ' + name + '\\r\\n\\r\\nMessage:\\r\\n' + message);
                                    window.open('mailto:{{email}}?subject=' + mailtoSubject + '&body=' + mailtoBody, '_blank', 'noopener,noreferrer');
                                });
                            }
                        })();
                    </script>
                </section>
            `,
            content: { email: 'concierge@maisonelan.com' },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-16 px-6 bg-black text-white border-t border-white/10">
                    <div class="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div class="text-center md:text-left">
                            <div class="text-2xl font-serif font-black tracking-tight mb-2">{{footerHeading}}</div>
                            <div class="text-xs text-gray-500 uppercase tracking-widest">Fine Art Photography</div>
                        </div>
                        
                        <div class="flex gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
                             <a href="#" class="hover:text-white transition-colors">Instagram</a>
                             <a href="#" class="hover:text-white transition-colors">Behance</a>
                             <a href="#" class="hover:text-white transition-colors">Pinterest</a>
                        </div>
                        
                        <div class="text-right">
                             <a target="_blank"
                             rel="noopener noreferrer" href="mailto:{{footerEmail}}" class="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-white transition-colors block mb-2">{{footerEmail}}</a>
                             <div class="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                                {{copyright}}
                             </div>
                        </div>
                    </div>
                </footer>
            `,
            content: {
                footerHeading: 'LUMIÈRE',
                footerEmail: 'studio@lumiere.com',
                copyright: '© 2025 Lumière Studio. All rights reserved.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};
