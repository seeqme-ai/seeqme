import { Manifest } from "@/types";

export const PHOTOGRAPHER_GALLERY: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Fashion Designer',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#000000',
            secondary: '#d4d4d4',
            background: '#ffffff',
            surface: '#f5f5f5',
            text: '#171717',
            heading: '#000000',
        },
        typography: {
            headingFont: 'Cinzel',
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
                <header class="fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 border-b border-gray-100" id="main-header">
                    <div class="max-w-[1800px] mx-auto px-6 h-24 flex items-center justify-between">
                        <a href="#" class="text-2xl font-serif tracking-widest text-black uppercase hover:opacity-70 transition-opacity">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-12">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors">
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
                        <a href="{{link}}" class="mobile-link text-3xl font-serif text-black uppercase tracking-widest hover:text-gray-500 transition-all transform translate-y-4 opacity-0">
                            {{label}}
                        </a>
                        {{/each}}
                        <a href="#contact" class="mobile-link text-xl font-bold uppercase tracking-[0.2em] text-black opacity-0 translate-y-4 transition-all delay-100">Book Session</a>
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
                username: 'MAISON ÉLAN',
                navLinks: [
                    { label: 'Collection', link: '#collection' },
                    { label: 'Runway', link: '#runway' },
                    { label: 'Atelier', link: '#about' },
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
                <section class="h-[90vh] relative flex items-center justify-center overflow-hidden pt-24">
                    <img src="{{backgroundImage}}" class="absolute inset-0 w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
                    <div class="relative z-10 text-center bg-white/90 px-12 py-16 max-w-2xl shadow-2xl">
                        <div class="text-xs font-bold uppercase tracking-[0.3em] mb-6">{{statusTag}}</div>
                        <h1 class="text-6xl md:text-8xl font-serif mb-6">{{name}}</h1>
                        <p class="text-gray-600 font-light mb-10 italic">"{{heroTagline}}"</p>
                        <a href="{{cta.link}}" class="inline-block border-b border-black pb-1 text-sm uppercase tracking-widest hover:text-gray-500 transition-colors">{{cta.text}}</a>
                    </div>
                </section>
            `,
            content: {
                name: 'MAISON ÉLAN',
                statusTag: 'Latest Collection',
                heroTagline: 'Elegance is refusal.',
                backgroundImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1600',
                cta: { text: "View Collection", link: '#collection' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'about',
            type: 'about',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 max-w-4xl mx-auto text-center" id="about">
                    <h2 class="text-lg font-serif italic mb-8">The Atelier</h2>
                    <p class="text-2xl md:text-3xl font-light leading-relaxed text-gray-800">
                        We create garments for the modern muse. Sustainable fabrics, architectural silhouettes, and timeless design. Based in Milan, worn worldwide.
                    </p>
                </section>
            `,
            content: {},
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'collection',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="px-6 py-12" id="collection">
                    <div class="flex justify-between items-end mb-12 border-b border-gray-200 pb-4 max-w-7xl mx-auto">
                        <h2 class="text-4xl font-serif">The Lookbook</h2>
                        <div class="flex gap-8 text-sm uppercase tracking-widest text-gray-500">
                            <button class="text-black font-bold">All</button>
                            <button class="hover:text-black">Dresses</button>
                            <button class="hover:text-black">Outerwear</button>
                            <button class="hover:text-black">Accessories</button>
                        </div>
                    </div>
                
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 max-w-7xl mx-auto">
                        {{#each items}}
                        <div class="group cursor-pointer">
                            <div class="aspect-[3/4] overflow-hidden mb-4 bg-gray-100 relative">
                                <img src="{{image}}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div class="absolute bottom-0 left-0 w-full bg-white/90 py-4 px-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center">
                                    <span class="font-serif italic text-lg">{{price}}</span>
                                    <span class="text-xs uppercase tracking-widest border border-black px-2 py-1">Inquire</span>
                                </div>
                            </div>
                            <h3 class="font-bold text-sm uppercase tracking-wide mb-1">{{name}}</h3>
                            <p class="text-xs text-gray-500 capitalize">{{material}}</p>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                items: [
                    { name: 'The Silk Slip', price: '€450', material: '100% Mulberry Silk', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800' },
                    { name: 'Oversized Wool Coat', price: '€1,200', material: 'Merino Wool Blend', image: 'https://images.unsplash.com/photo-1539533018447-63fce0faa7e0?w=800' },
                    { name: 'Pleated Trousers', price: '€350', material: 'Organic Cotton', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800' },
                    { name: 'Structure Blazer', price: '€890', material: 'Linen / Silk', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800' },
                    { name: 'Evening Gown', price: '€2,500', material: 'Velvet', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800' },
                    { name: 'Knit Sweater', price: '€280', material: 'Cashmere', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800' },
                    { name: 'Leather Boots', price: '€650', material: 'Calfskin', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800' },
                    { name: 'Mini Bag', price: '€420', material: 'Vegan Leather', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'runway',
            type: 'video',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24" id="runway">
                     <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div class="aspect-video bg-black relative">
                            <img src="https://images.unsplash.com/photo-1537832816519-689ad163238b?w=1200" class="w-full h-full object-cover opacity-80" />
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="w-20 h-20 border-2 border-white rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-white hover:text-black transition-colors">
                                    <i class="fas fa-play text-2xl ml-1"></i>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="text-xs font-bold uppercase tracking-widest mb-4 text-gray-400">Runway</div>
                            <h2 class="text-4xl font-serif mb-6">SS25 Presentation</h2>
                            <p class="text-gray-600 mb-8 leading-relaxed">
                                A journey through light and shadow. Our latest runway show at Paris Fashion Week explored themes of celestial bodies and earthly textures.
                            </p>
                            <a href="#" class="font-bold border-b-2 border-black pb-1 hover:text-gray-600">Watch Full Show</a>
                        </div>
                     </div>
                </section>
            `,
            content: {},
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'press',
            type: 'logos',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 border-t border-gray-100 text-center">
                    <p class="text-xs font-bold uppercase tracking-widest mb-12">Featured In</p>
                     <div class="flex flex-wrap justify-center gap-16 font-serif italic text-2xl text-gray-400 grayscale">
                        <span>Vogue Italia</span>
                        <span>Harpers Bazaar</span>
                        <span>Elle</span>
                        <span>W Magazine</span>
                        <span>Business of Fashion</span>
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
                <section class="bg-[#f5f5f5] py-24 px-6 text-center" id="contact">
                    <div class="max-w-xl mx-auto">
                        <h2 class="text-3xl font-serif mb-4">Inquire</h2>
                        <p class="text-gray-500 mb-8 font-light italic">For appointments, press, and general inquiries.</p>
                        
                        <form id="contact-form-{{id}}" class="space-y-4 text-left">
                            <input type="text" id="name-{{id}}" placeholder="Your Name" required class="w-full bg-transparent border-b border-black py-4 focus:outline-none placeholder:text-gray-400 placeholder:italic placeholder:font-serif" />
                            <input type="email" id="email-{{id}}" placeholder="Your Email" required class="w-full bg-transparent border-b border-black py-4 focus:outline-none placeholder:text-gray-400 placeholder:italic placeholder:font-serif" />
                            <textarea id="message-{{id}}" placeholder="How can we help?" required class="w-full bg-transparent border-b border-black py-4 focus:outline-none placeholder:text-gray-400 placeholder:italic placeholder:font-serif resize-none h-32"></textarea>
                            <button type="submit" class="w-full py-4 mt-4 uppercase text-xs font-bold tracking-widest bg-black text-white hover:bg-gray-800 transition-colors">Send Message</button>
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
            content: { email: 'concierge@maisonelan.com' },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-12 px-6 flex flex-col md:flex-row justify-between items-center border-t border-gray-200">
                    <div class="text-2xl font-serif mb-4 md:mb-0">{{footerHeading}}</div>
                    <a href="mailto:{{footerEmail}}" class="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-black transition-colors">{{footerEmail}}</a>
                    <div class="text-xs text-gray-400 mt-4 md:mt-0 font-mono uppercase tracking-widest">
                        {{copyright}}
                    </div>
                </footer>
            `,
            content: {
                footerHeading: 'MAISON ÉLAN',
                footerEmail: 'concierge@maisonelan.com',
                copyright: '© 2025 Maison Élan. Milan, IT.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};
