import { Manifest } from "@/types";

export const GRID_ARCHITECT: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Architecture',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#262626',
            secondary: '#525252',
            background: '#e5e5e5',
            surface: '#ffffff',
            text: '#404040',
            heading: '#171717',
        },
        typography: {
            headingFont: 'Archivo',
            bodyFont: 'DM Sans',
            monoFont: 'JetBrains Mono',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black transition-all duration-300" id="main-header">
                    <div class="max-w-[1400px] mx-auto px-4 h-20 flex items-center justify-between">
                        <a href="#" class="text-2xl font-bold tracking-tighter text-black uppercase">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-12">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-bold text-gray-500 hover:text-black uppercase tracking-widest transition-colors">
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
                        <a href="{{link}}" class="mobile-link text-4xl font-black text-black uppercase tracking-tighter hover:text-gray-500 transition-all transform translate-y-4 opacity-0">
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
                username: 'STUDIO.',
                navLinks: [
                    { label: 'Work', link: '#projects' },
                    { label: 'Studio', link: '#about' },
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
                <section class="min-h-screen p-4 pt-24 bg-[#e5e5e5]">
                    <div class="h-full grid grid-cols-12 grid-rows-6 gap-4">
                        <div class="col-span-12 md:col-span-8 row-span-4 bg-white p-12 flex flex-col justify-between">
                            <h1 class="text-6xl md:text-8xl font-bold tracking-tight leading-none">
                                {{{name}}}
                            </h1>
                            <div class="flex justify-between items-end">
                                <p class="text-xl max-w-sm text-gray-500">
                                    {{heroTagline}}
                                </p>
                                <span class="text-xs font-mono rotate-[-90deg]">EST. 2025</span>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-4 row-span-4 bg-black overflow-hidden relative group">
                             <img src="{{backgroundImage}}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                             <div class="absolute bottom-4 left-4 text-white font-mono text-xs">
                                PROJECT: SKYLINE
                             </div>
                        </div>
                        <div class="col-span-6 md:col-span-3 row-span-2 bg-white p-6 flex flex-col justify-between hover:bg-black hover:text-white transition-colors cursor-pointer group">
                             <a href="{{cta.link}}" class="block h-full w-full flex flex-col justify-between">
                                 <span class="text-4xl font-bold group-hover:translate-x-2 transition-transform">&rarr;</span>
                                 <span class="font-mono text-xs uppercase">{{cta.text}}</span>
                             </a>
                        </div>
                        <div class="col-span-6 md:col-span-3 row-span-2 bg-[#d4d4d4] p-6">
                            <h3 class="font-bold text-xl mb-2">{{statusTag}}</h3>
                            <ul class="text-sm space-y-1 text-gray-600">
                                <li>Pritzker Prize Nominee</li>
                                <li>AIA Gold Medal</li>
                                <li>RIBA Stirling Prize</li>
                            </ul>
                        </div>
                        <div class="col-span-12 md:col-span-6 row-span-2 bg-white p-8 flex items-center justify-between">
                             <div>
                                <h3 class="text-2xl font-bold">Latest Publication</h3>
                                <p class="text-gray-500">The Future of Sustainable Cities</p>
                             </div>
                             <span class="text-4xl text-gray-300">01</span>
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'FORM<br/>FOLLOWS<br/>FUNCTION',
                statusTag: 'Awards',
                heroTagline: 'A multidisciplinary architecture studio focusing on sustainable urban development and brutalist revival.',
                backgroundImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
                cta: { text: "View Projects", link: '#projects' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'stats',
            type: 'stats',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="p-4 bg-[#e5e5e5]">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {{#each stats}}
                        <div class="bg-white p-8 hover:bg-black hover:text-white transition-colors">
                            <span class="block text-4xl font-bold mb-2">{{value}}</span>
                            <span class="text-xs font-mono uppercase tracking-wider">{{label}}</span>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                stats: [
                    { value: '142', label: 'Projects Built' },
                    { value: '18', label: 'International Awards' },
                    { value: '4', label: 'Continents' },
                    { value: '100%', label: 'Carbon Neutral' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'about',
            type: 'about',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="p-4 bg-[#e5e5e5]" id="about">
                    <div class="bg-white p-12 md:p-24 grid grid-cols-1 md:grid-cols-12 gap-12">
                        <div class="md:col-span-4 border-t-4 border-black pt-4">
                            <h2 class="text-4xl font-bold">{{title}}</h2>
                        </div>
                        <div class="md:col-span-8">
                            <p class="text-2xl md:text-4xl leading-tight font-light text-gray-800">
                                {{bio}}
                            </p>
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'The Studio',
                bio: "We don't just design buildings; we choreograph movement through space. Our philosophy is rooted in the belief that structure dictates behavior, and good design elevates the human experience."
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="p-4 bg-[#e5e5e5]" id="projects">
                     <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {{#each projects}}
                        <div class="aspect-[3/4] relative group overflow-hidden bg-white">
                            <img src="{{image}}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                                <span class="text-white font-mono text-xs mb-2">0{{id}} // {{location}}</span>
                                <h3 class="text-3xl font-bold text-white">{{title}}</h3>
                            </div>
                        </div>
                        {{/each}}
                     </div>
                </section>
            `,
            content: {
                projects: [
                    { id: 1, title: 'The Void', location: 'Tokyo', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800' },
                    { id: 2, title: 'Glass House', location: 'Oslo', image: 'https://images.unsplash.com/photo-1506158669146-619067b6816f?w=800' },
                    { id: 3, title: 'Concrete Jungle', location: 'New York', image: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=800' },
                    { id: 4, title: 'Desert Oasis', location: 'Dubai', image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800' },
                    { id: 5, title: 'Alpine Retreat', location: 'Swiss Alps', image: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=800' },
                    { id: 6, title: 'Museum of Light', location: 'Berlin', image: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=800' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'services',
            type: 'services',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="p-4 bg-[#e5e5e5]" id="services">
                    <div class="bg-[#171717] text-white p-12 md:p-24">
                        <h2 class="text-xs font-mono uppercase tracking-widest mb-16 text-gray-500">Our Services</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-12">
                            {{#each services}}
                            <div class="border-t border-gray-800 pt-6 group hover:border-white transition-colors">
                                <div class="flex justify-between items-baseline mb-4">
                                    <h3 class="text-2xl font-bold">{{title}}</h3>
                                    <span class="font-mono text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">EXPLORE</span>
                                </div>
                                <p class="text-gray-400 max-w-sm">{{desc}}</p>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                services: [
                    { title: 'Architecture', desc: 'Full-scale design from concept to construction administration.' },
                    { title: 'Interior Design', desc: 'Curating spaces that complement the architectural shell.' },
                    { title: 'Master Planning', desc: 'Urban development strategies for communities and cities.' },
                    { title: 'Sustainability', desc: 'LEED certification consulting and eco-design.' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'team',
            type: 'team',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="p-4 bg-[#e5e5e5]">
                     <div class="bg-white p-12">
                        <h2 class="text-4xl font-bold mb-12">Partners</h2>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {{#each members}}
                            <div class="grayscale hover:grayscale-0 transition-all">
                                <img src="{{image}}" class="w-full aspect-[3/4] object-cover mb-4" />
                                <h4 class="font-bold">{{name}}</h4>
                                <p class="text-xs font-mono text-gray-500">{{role}}</p>
                            </div>
                            {{/each}}
                        </div>
                     </div>
                </section>
            `,
            content: {
                members: [
                    { name: 'John Doe', role: 'Principal Architect', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800' },
                    { name: 'Jane Smith', role: 'Design Director', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800' },
                    { name: 'Michael Brown', role: 'Technical Lead', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800' },
                    { name: 'Emily White', role: 'Interior Lead', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'timeline',
            type: 'process',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="p-4 bg-[#e5e5e5]">
                    <div class="bg-white p-12 md:p-24">
                        <h2 class="text-4xl font-bold mb-16">History</h2>
                        <div class="border-l-2 border-black pl-12 space-y-16">
                            {{#each milestones}}
                            <div class="relative">
                                <span class="absolute -left-[54px] top-2 w-4 h-4 bg-black rounded-full"></span>
                                <span class="text-4xl font-bold block mb-2">{{year}}</span>
                                <h4 class="text-xl font-bold mb-2">{{title}}</h4>
                                <p class="text-gray-500 max-w-md">{{desc}}</p>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                milestones: [
                    { year: '2015', title: 'Studio Founded', desc: 'Established in a small loft in Brooklyn.' },
                    { year: '2018', title: 'First International Project', desc: 'Commissioned for a library in Copenhagen.' },
                    { year: '2022', title: 'Design Award', desc: 'Received the National Architecture Award.' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                 <section class="p-4 bg-[#e5e5e5]" id="contact">
                    <div class="bg-black text-white p-12 md:p-32 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                             <h2 class="text-6xl font-bold mb-8">{{title}}</h2>
                             <p class="text-xl text-gray-400 mb-12">{{description}}</p>
                             <div class="space-y-4 font-mono">
                                <p>{{email}}</p>
                                <p>+1 (212) 555-0199</p>
                             </div>
                        </div>
                        <form id="contact-form-{{id}}" class="space-y-6">
                            <input type="text" id="name-{{id}}" placeholder="Name" required class="w-full bg-transparent border-b border-white/20 py-4 focus:border-white focus:outline-none placeholder:text-gray-600" />
                            <input type="text" id="subject-{{id}}" placeholder="Project Type" required class="w-full bg-transparent border-b border-white/20 py-4 focus:border-white focus:outline-none placeholder:text-gray-600" />
                            <textarea id="message-{{id}}" placeholder="Project Details" required class="w-full bg-transparent border-b border-white/20 py-4 focus:border-white focus:outline-none placeholder:text-gray-600 h-32 resize-none"></textarea>
                            <button type="submit" class="bg-white text-black px-12 py-4 font-bold hover:bg-gray-200 transition-colors">Submit Inquiry</button>
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
                title: 'Start a Project',
                description: 'We are currently accepting new commissions.',
                email: 'info@studio.com'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="p-4 bg-[#e5e5e5]">
                    <div class="bg-white p-12 text-center">
                        <div class="font-bold text-2xl mb-4">{{footerHeading}}</div>
                         <a href="mailto:{{footerEmail}}" class="block mb-8 text-sm font-mono text-gray-500 uppercase hover:text-black transition-colors">
                            {{footerEmail}}
                         </a>
                         <p class="text-xs text-gray-400">{{copyright}}</p>
                    </div>
                </footer>
            `,
            content: {
                footerHeading: 'STUDIO.',
                footerEmail: 'info@studio.com',
                copyright: '© 2025 STUDIO. ALL RIGHTS RESERVED.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};
