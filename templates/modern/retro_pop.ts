import { Manifest } from "@/types";

export const RETRO_POP: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'UGC Creator',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#ff00ff', // Magenta
            secondary: '#ffff00', // Yellow
            background: '#ffffff',
            surface: '#f3f4f6',
            text: '#1f2937',
            heading: '#111827',
        },
        typography: {
            headingFont: 'Dela Gothic One',
            bodyFont: 'Space Grotesk',
            monoFont: 'Courier Prime',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black transition-all duration-300" id="main-header">
                    <div class="max-w-[1400px] mx-auto px-4 h-20 flex items-center justify-between">
                        <a href="#" class="text-2xl font-black italic tracking-tighter text-black transform -rotate-2 hover:rotate-0 transition-transform bg-yellow-300 px-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-black uppercase tracking-widest text-black hover:text-pink-500 hover:-translate-y-1 transition-all">
                                {{label}}
                            </a>
                            {{/each}}
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-black z-50 relative w-12 h-12 flex items-center justify-center bg-pink-500 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <i class="fas fa-bars text-xl text-white transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-yellow-300 z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-5xl font-black text-black uppercase italic tracking-tighter hover:text-white hover:stroke-black transition-all transform translate-y-4 opacity-0 border-b-4 border-black pb-2">
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
                username: 'POP.STAR',
                navLinks: [
                    { label: 'Work', link: '#portfolio' },
                    { label: 'Stats', link: '#stats' },
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
                <section class="min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden bg-white pt-24">
                    <div class="fixed top-24 right-4 z-40 rotate-3">
                         <a href="{{cta.link}}" class="bg-black text-white px-6 py-2 rounded-full font-bold shadow-[4px_4px_0px_0px_rgba(255,0,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,0,255,1)] transition-all border-2 border-black">
                            {{cta.text}}
                         </a>
                    </div>

                    <div class="bg-yellow-300 inline-block px-4 py-1 border-2 border-black font-bold mb-8 rotate-[-2deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                         ✨ {{statusTag}} ✨
                    </div>
                    
                    <h1 class="text-6xl md:text-8xl font-black text-black leading-none mb-6 relative z-10">
                        {{{name}}}
                    </h1>
                    
                    <p class="text-xl font-bold max-w-2xl mb-12 border-2 border-black p-4 rounded-xl bg-cyan-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                         {{heroTagline}}
                    </p>
                    
                    <div class="grid grid-cols-2 gap-4 w-full max-w-md">
                        <div class="aspect-[9/16] bg-black rounded-xl overflow-hidden border-2 border-black relative rotate-[-1deg]">
                             <img src="{{avatarImage}}" alt="Creator avatar" loading="lazy" referrerpolicy="no-referrer" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600';" />
                             <div class="absolute inset-0 flex items-center justify-center">
                                <i class="fab fa-tiktok text-white text-4xl drop-shadow-md"></i>
                             </div>
                        </div>
                         <div class="aspect-[9/16] bg-black rounded-xl overflow-hidden border-2 border-black relative rotate-[2deg]">
                             <img src="{{backgroundImage}}" alt="Creator background" loading="lazy" referrerpolicy="no-referrer" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600';" />
                             <div class="absolute inset-0 flex items-center justify-center">
                                <i class="fab fa-instagram text-white text-4xl drop-shadow-md"></i>
                             </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'STOP MAKING<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">BORING ADS</span>',
                statusTag: 'UGC & CONTENT CREATION',
                heroTagline: 'I create scroll-stopping videos for brands that actually want to convert Gen Z.',
                avatarImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
                backgroundImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
                cta: { text: 'Work With Me!', link: '#contact' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'marquee',
            type: 'logos',
            componentId: 'GEN_TEMPLATE',
            template: `
                <div class="bg-black text-white py-4 overflow-hidden border-y-4 border-black rotate-[-1deg] mb-12">
                     <div class="whitespace-nowrap animate-marquee font-black text-2xl uppercase tracking-widest">
                        {{text}}
                     </div>
                </div>
            `,
            content: {
                text: 'TIKTOK • REELS • SHORTS • UGC • ADS • TIKTOK • REELS • SHORTS • UGC • ADS • TIKTOK • REELS • SHORTS • UGC • ADS'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'stats',
            type: 'stats',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-12 px-6" id="stats">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
                        {{#each stats}}
                        <div class="bg-pink-200 border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div class="text-3xl font-black mb-1">{{value}}</div>
                            <div class="font-bold text-xs uppercase">{{label}}</div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                stats: [
                    { value: '1.2M', label: 'Views' },
                    { value: '4.5%', label: 'CTR' },
                    { value: '50+', label: 'Videos' },
                    { value: 'ROAS', label: 'Machine' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'portfolio',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-6xl mx-auto" id="portfolio">
                    <h2 class="text-4xl font-black bg-black text-white inline-block px-4 py-2 mb-12 rotate-[-2deg]">{{title}}</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {{#each projects}}
                        <div class="border-2 border-black rounded-2xl p-4 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                             <div class="aspect-[9/16] bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                                <img src="{{image}}" alt="{{title}}" loading="lazy" referrerpolicy="no-referrer" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1556228578-8d4e927cfa12?w=600';" />
                                <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                                    <i class="fas fa-play text-white text-4xl drop-shadow-lg"></i>
                                </div>
                             </div>
                             <h3 class="font-black text-xl uppercase mb-1">{{title}}</h3>
                             <p class="font-bold text-pink-500 text-sm">{{tech}}</p>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'THE WORK',
                projects: [
                    { title: 'Skincare Routine', tech: 'Voiceover ASMR', image: 'https://images.unsplash.com/photo-1556228578-8d4e927cfa12?w=600' },
                    { title: 'Tech Unboxing', tech: 'Unboxing / Review', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600' },
                    { title: 'Fashion Haul', tech: 'Try-on Haul', image: 'https://images.unsplash.com/photo-1529139574466-a302d2052574?w=600' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },

        {
            id: 'contact',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 text-center" id="contact">
                    <div class="max-w-2xl mx-auto">
                        <h2 class="text-5xl font-black mb-8">{{title}}</h2>
                        
                        <form id="contact-form-{{id}}" class="max-w-md mx-auto space-y-4 border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-1">
                            <input type="text" id="name-{{id}}" placeholder="YOUR NAME" required class="w-full bg-gray-100 border-2 border-black p-4 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all" />
                            <textarea id="message-{{id}}" placeholder="WHAT'S THE VIBE?" required class="w-full bg-gray-100 border-2 border-black p-4 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all h-32 resize-none"></textarea>
                            <button type="submit" class="w-full bg-black text-white font-black py-4 hover:bg-gray-800 border-2 border-transparent hover:border-black transition-all transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(255,0,255,1)]">
                                SEND IT 🚀
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
                                    const mailtoSubject = encodeURIComponent('Viral Collab Inquiry from ' + name);
                                    const mailtoBody = encodeURIComponent('Name: ' + name + '\r\n\r\nMessage:\r\n' + message);
                                    window.open('mailto:{{email}}?subject=' + mailtoSubject + '&body=' + mailtoBody, '_blank', 'noopener,noreferrer');
                                });
                            }
                        })();
                    </script>
                </section>
            `,
            content: {
                title: "Let's make you viral.",
                email: 'ugc@creator.com',
                label: 'Contact'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="bg-black text-white py-12 text-center font-bold uppercase tracking-widest border-t-4 border-yellow-300">
                     <p class="mb-2 italic text-pink-500 text-xl">{{footerHeading}}</p>
                     <a target="_blank"
                        rel="noopener noreferrer" href="mailto:{{footerEmail}}" class="text-pink-100 hover:text-white transition-colors block mb-4">{{footerEmail}}</a>
                     <p>{{copyright}}</p>
                </footer>
            `,
            content: {
                footerHeading: 'VIBES_ONLY',
                footerEmail: 'ugc@creator.com',
                copyright: '© 2025 POP.STAR. ALL RIGHTS RESERVED'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};
