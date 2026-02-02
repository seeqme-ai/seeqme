import { Manifest } from "@/types";

export const THREED_DESIGNER: Manifest = {
    metadata: {
        version: '1.0',
        niche: '3D Artist',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'dark',
        colorPalette: {
            primary: '#ff00ff',
            secondary: '#00ffff',
            background: '#050505',
            surface: '#111111',
            text: '#cccccc',
            heading: '#ffffff',
        },
        typography: {
            headingFont: 'Outfit',
            bodyFont: 'DM Sans',
            monoFont: 'Space Mono',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10 transition-all duration-300" id="main-header">
                    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <!-- Brand / Username -->
                        <a href="#" class="text-xl font-black uppercase tracking-[0.2em] text-white hover:text-cyan-400 transition-colors z-50 relative">
                            {{username}}
                        </a>

                        <!-- Desktop Nav -->
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-xs font-mono font-medium text-gray-400 hover:text-white uppercase tracking-widest transition-colors relative group">
                                {{label}}
                                <span class="absolute -bottom-1 left-0 w-0 h-px bg-cyan-400 transition-all group-hover:w-full"></span>
                            </a>
                            {{/each}}
                        </nav>

                        <!-- Mobile Menu Button -->
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-white z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>

                    <!-- Mobile Menu Overlay -->
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 hover:to-cyan-400 transition-all transform translate-y-4 opacity-0">
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
                                        
                                        // Animate links in
                                        links.forEach((link, idx) => {
                                            setTimeout(() => {
                                                link.classList.remove('translate-y-4', 'opacity-0');
                                            }, 100 + (idx * 50));
                                        });
                                    } else {
                                        menu.classList.add('opacity-0', 'pointer-events-none');
                                        icon.classList.remove('fa-times');
                                        icon.classList.add('fa-bars');
                                        
                                        links.forEach(link => {
                                            link.classList.add('translate-y-4', 'opacity-0');
                                        });
                                    }
                                });

                                // Close on link click
                                links.forEach(link => {
                                    link.addEventListener('click', () => {
                                        isOpen = false;
                                        menu.classList.add('opacity-0', 'pointer-events-none');
                                        icon.classList.remove('fa-times');
                                        icon.classList.add('fa-bars');
                                    });
                                });

                                // Intercept all internal links for smooth scrolling
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
                username: 'KAITO',
                navLinks: [
                    { label: 'Work', link: '#projects' },
                    { label: 'Reel', link: '#reel' },
                    { label: 'About', link: '#about' },
                    { label: 'Process', link: '#process' },
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
                <section class="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#050505]">
                    <!-- Background Grid/Gradient -->
                    <div class="absolute inset-0 z-0 overflow-hidden">
                        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,rgba(5,5,5,1)_100%)]"></div>
                        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 40px 40px;"></div>
                        <img src="{{backgroundImage}}" class="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
                    </div>
                    
                    <div class="relative z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
                        <div class="text-left order-2 lg:order-1">
                            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-8">
                                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                {{statusTag}}
                            </div>
                            
                            <h1 class="text-4xl md:text-6xl md:text-5xl md:text-8xl xl:text-[140px] font-black uppercase tracking-tighter leading-[0.85] mb-8 text-white">
                                {{name}}
                            </h1>
                            
                            <p class="text-xl md:text-3xl font-light text-gray-400 mb-12 max-w-xl leading-tight">
                                {{heroTagline}}
                            </p>
                            
                            <div class="flex flex-wrap gap-6">
                                <a href="{{cta.link}}" class="px-10 py-5 bg-white text-black text-sm font-black uppercase tracking-widest rounded-full hover:bg-cyan-400 hover:scale-105 transition-all duration-300">
                                    {{cta.text}}
                                </a>
                                <a href="#projects" class="px-10 py-5 border border-white/10 text-white text-sm font-black uppercase tracking-widest rounded-full hover:bg-white/5 transition-all">
                                    Explore Archive
                                </a>
                            </div>
                        </div>

                        <div class="relative order-1 lg:order-2 flex justify-center">
                            <!-- Avatar Frame -->
                            <div class="relative w-64 h-64 md:w-96 md:h-96 group">
                                <div class="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 to-cyan-500 rounded-2xl rotate-6 blur-2xl opacity-20 group-hover:rotate-12 transition-transform duration-700"></div>
                                <div class="relative w-full h-full rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden p-2 backdrop-blur-3xl">
                                    <img src="{{avatarImage}}" class="w-full h-full object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-700" />
                                </div>
                                
                                <!-- Decorative UI elements -->
                                <div class="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-400 opacity-50"></div>
                                <div class="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-fuchsia-600 opacity-50"></div>
                            </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'KAITO',
                statusTag: '',
                heroTagline: 'Sculpting digital dimensions and hyper-realistic experiences.',
                backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600',
                avatarImage: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=600',
                cta: { text: 'Watch Reel', link: '#reel' }
            },
            settings: { isVisible: true, padding: 'large' }
        },
        {
            id: 'clients',
            type: 'logos',
            componentId: 'GEN_TEMPLATE',
            template: `
                <div class="border-y border-white/10 bg-black py-12 overflow-hidden items-center group">
                    <div class="flex whitespace-nowrap gap-8 md:gap-16 md:gap-32 animate-marquee-loop">
                        {{#each clients}}
                            <span class="text-xl md:text-3xl font-black font-mono text-white/30 hover:text-cyan-400 transition-colors uppercase tracking-widest">{{this}}</span>
                        {{/each}}
                        {{#each clients}}
                            <span class="text-xl md:text-3xl font-black font-mono text-white/30 hover:text-cyan-400 transition-colors uppercase tracking-widest">{{this}}</span>
                        {{/each}}
                    </div>
                    <style>
                        @keyframes marquee-x {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .animate-marquee-loop {
                            display: flex;
                            width: max-content;
                            animation: marquee-x 30s linear infinite;
                        }
                        .group:hover .animate-marquee-loop {
                            animation-play-state: paused;
                        }
                    </style>
                </div>
            `,
            content: {
                clients: ['EPIC GAMES', 'NIKE', 'ADIDAS', 'SONY', 'WIRED']
            },
            settings: { isVisible: true, padding: 'small' }
        },
        {
            id: 'about',
            type: 'about',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="max-w-6xl mx-auto px-6 py-10 md:py-20 md:py-16 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-10 md:gap-20 items-center">
                    <div class="order-2 md:order-1">
                        <div class="text-fuchsia-500 font-mono text-xs mb-4">01 // ABOUT</div>
                        <h2 class="text-3xl md:text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">{{headline}}</h2>
                        <p class="text-lg md:text-xl text-gray-400 leading-relaxed mb-8">
                            {{bio}}
                        </p>
                         <div class="flex flex-wrap gap-4">
                            {{#each socials}}
                            <a href="{{link}}" target="_blank" class="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-teal-500/50 transition-all">
                                <i class="fab fa-{{platform}}"></i>
                            </a>
                            {{/each}}
                        </div>
                    </div>
                     <div class="order-1 md:order-2 bg-gradient-to-tr from-fuchsia-600 to-cyan-600 p-[1px] rounded-3xl">
                        <div class="bg-black rounded-[23px] overflow-hidden relative aspect-square md:aspect-auto">
                             <img src="{{image}}" class="w-full h-full object-cover mix-blend-lighten opacity-80" />
                        </div>
                     </div>
                </section>
            `,
            content: {
                headline: 'Bending Reality. One Vert at a Time.',
                bio: 'I specialize in creating hyper-realistic environments and motion graphics that blur the line between the physical and digital worlds. My work explores themes of futurism, cyberpunk aesthetics, and synthetic nature.',
                image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800',
                socials: [
                    { platform: 'instagram', link: 'https://instagram.com' },
                    { platform: 'artstation', link: 'https://artstation.com' },
                    { platform: 'behance', link: 'https://behance.net' },
                    { platform: 'discord', link: 'https://discord.com' }
                ]
            },
            settings: { isVisible: true, padding: 'medium' }
        },
        {
            id: 'stack',
            type: 'skills',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="px-6 py-10 md:py-20 bg-[#080808]">
                     <div class="text-center mb-16">
                        <span class="text-cyan-400 font-mono text-xs">{{label}}</span>
                        <h2 class="text-3xl font-bold text-white mt-4">{{title}}</h2>
                     </div>
                     <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                        {{#each tools}}
                        <div class="p-6 bg-white/5 border border-white/5 hover:border-fuchsia-500/50 transition-colors rounded-xl text-center group">
                            <span class="block text-2xl mb-2 text-gray-400 group-hover:text-white transition-colors">{{this}}</span>
                        </div>
                        {{/each}}
                     </div>
                </section>
            `,
            content: {
                label: '02 // ARSENAL',
                title: 'The Toolbelt',
                tools: ['Cinema 4D', 'Octane', 'Redshift', 'Houdini', 'Unreal Engine 5', 'Substance', 'ZBrush', 'After Effects']
            },
            settings: { isVisible: true, padding: 'medium' }
        },
        {
            id: 'reel',
            type: 'video',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="max-w-7xl mx-auto px-6 py-16 md:py-32 text-center">
                    <div id="video-container-{{id}}" class="aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl shadow-fuchsia-900/20 relative border border-white/10">
                        <!-- Dynamic Player rendered via Script -->
                        <div class="flex items-center justify-center h-full text-white/20 font-mono text-sm">
                            Initializing Player...
                        </div>
                    </div>

                    <script>
                        (function() {
                            const container = document.getElementById('video-container-{{id}}');
                            const url = "{{videoUrl}}";
                            
                            function getPlayerHtml(vUrl) {
                                // YouTube Detection
                                if (vUrl.includes('youtube.com') || vUrl.includes('youtu.be')) {
                                    let embedUrl = vUrl;
                                    if (vUrl.includes('watch?v=')) {
                                        embedUrl = vUrl.replace('watch?v=', 'embed/');
                                    } else if (vUrl.includes('youtu.be/')) {
                                        embedUrl = 'https://www.youtube.com/embed/' + vUrl.split('/').pop();
                                    }
                                    return \`<iframe src="\${embedUrl}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\`;
                                }
                                
                                // Vimeo Detection
                                if (vUrl.includes('vimeo.com')) {
                                    const vimeoId = vUrl.split('/').pop();
                                    return \`<iframe src="https://player.vimeo.com/video/\${vimeoId}" class="w-full h-full" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>\`;
                                }

                                // Native Video (Cloudinary, MP4, etc.)
                                return \`<video controls class="w-full h-full object-cover">
                                            <source src="\${vUrl}" type="video/mp4">
                                            Your browser does not support the video tag.
                                        </video>\`;
                            }

                            if (container && url) {
                                container.innerHTML = getPlayerHtml(url);
                            }
                        })();
                    </script>
                </section>
            `,
            content: {
                videoUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ'
            },
            settings: { isVisible: true, padding: 'small' }
        },
        {
            id: 'projects',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                 <section class="max-w-7xl mx-auto px-6 py-16 md:py-32">
                     <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
                        <div>
                            <div class="text-fuchsia-500 font-mono text-xs mb-2">{{label}}</div>
                            <h2 class="text-4xl font-bold text-white">{{title}}</h2>
                        </div>
                        <a href="{{archiveLink}}" class="text-white hover:text-cyan-400 font-mono text-xs border-b border-white/20 pb-1">{{archiveLabel}}</a>
                     </div>
                     
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {{#each projects}}
                        <div class="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-900">
                            <img src="{{image}}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                                <h3 class="text-2xl font-bold text-white mb-2">{{title}}</h3>
                                <p class="text-sm text-gray-300 font-mono">{{tech}}</p>
                            </div>
                        </div>
                        {{/each}}
                     </div>
                 </section>
            `,
            content: {
                label: '03 // WORKS',
                title: 'Selected Projects',
                archiveLabel: 'VIEW ALL ARCHIVE',
                archiveLink: '#',
                projects: [
                    { title: 'Cyberpunk 2099', tech: 'Unreal Engine 5', image: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=800' },
                    { title: 'Fluid Dynamics', tech: 'Houdini + Redshift', image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800' },
                    { title: 'Neon Genesis', tech: 'Cinema 4D', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800' },
                    { title: 'Abstract Forms', tech: 'Blender', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800' }
                ]
            },
            settings: { isVisible: true, padding: 'medium' }
        },
        {
            id: 'nft',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                 <section class="px-6 py-10 md:py-20 bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
                    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                        <div class="flex-1 w-full">
                             <div class="text-cyan-400 font-mono text-xs mb-4">{{label}}</div>
                             <h2 class="text-4xl font-bold text-white mb-6">{{title}}</h2>
                             <p class="text-gray-400 mb-8 max-w-lg">
                                {{description}}
                             </p>
                             <div class="flex flex-wrap gap-4">
                                <a href="{{cta1.link}}" class="px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors">{{cta1.text}}</a>
                                <a href="{{cta2.link}}" class="px-6 py-3 border border-white/20 text-white rounded-lg font-bold hover:bg-white/10 transition-colors">{{cta2.text}}</a>
                             </div>
                        </div>
                        <div class="flex-1 w-full grid grid-cols-2 gap-4">
                            <div class="bg-gray-900 rounded-lg aspect-square overflow-hidden group">
                                <img src="{{image1}}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div class="bg-gray-800 rounded-lg aspect-square mt-8 overflow-hidden group">
                                <img src="{{image2}}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>
                    </div>
                 </section>
            `,
            content: {
                label: '04 // SIGNATURE SERIES',
                title: 'Transforming Concepts into Reality',
                description: 'Every project is a journey into the unknown. I combine technical precision with artistic vision to create digital experiences that leave a lasting impression.',
                cta1: { text: 'View Case Studies', link: '#projects' },
                cta2: { text: 'Collaborate with Me', link: 'mailto:contact@kaito.design' },
                image1: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800',
                image2: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800'
            },
            settings: { isVisible: true, padding: 'small' }
        },
        {
            id: 'process',
            type: 'process',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="max-w-7xl mx-auto px-6 py-16 md:py-32">
                     <div class="text-center mb-16">
                        <span class="text-fuchsia-500 font-mono text-xs">{{label}}</span>
                        <h2 class="text-3xl font-bold text-white mt-4">{{title}}</h2>
                     </div>
                     <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {{#each steps}}
                        <div class="relative">
                            <div class="text-4xl md:text-6xl font-black text-white/5 absolute -top-8 -left-4 font-sans">{{step}}</div>
                            <h3 class="text-xl font-bold text-white mb-4 relative z-10">{{title}}</h3>
                            <p class="text-sm text-gray-500 leading-relaxed">{{details}}</p>
                        </div>
                        {{/each}}
                     </div>
                </section>
            `,
            content: {
                label: '05 // WORKFLOW',
                title: 'From Concept to Render',
                steps: [
                    { step: '01', title: 'Sketching', details: 'Rough thumbnails and moodboarding to establish composition.' },
                    { step: '02', title: 'Blocking', details: 'Setting up basic geometry and camera angles in 3D space.' },
                    { step: '03', title: 'Details', details: 'High-poly sculpting, texturing, and lighting setups.' },
                    { step: '04', title: 'Post-Process', details: 'Color grading and compositing in After Effects.' }
                ]
            },
            settings: { isVisible: true, padding: 'medium' }
        },
        {
            id: 'faq',
            type: 'faq',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="max-w-3xl mx-auto px-6 py-10 md:py-20">
                     <h2 class="text-3xl font-bold text-white mb-12 text-center">{{title}}</h2>
                     <div class="space-y-4">
                        {{#each faqs}}
                        <div class="border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors">
                            <h3 class="text-lg font-bold text-white mb-2">{{q}}</h3>
                            <p class="text-gray-400 text-sm">{{a}}</p>
                        </div>
                        {{/each}}
                     </div>
                </section>
            `,
            content: {
                title: 'Inquiries',
                faqs: [
                    { q: 'Do you take commissions?', a: 'Yes, I am currently accepting new projects and commissions.' },
                    { q: 'What are your rates?', a: 'Project based. Please contact me with a brief for a quote.' }
                ]
            },
            settings: { isVisible: true, padding: 'medium' }
        },
        {
            id: 'contact',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="max-w-4xl mx-auto px-6 py-16 md:py-32">
                    <div class="text-center mb-16">
                        <span class="text-cyan-400 font-mono text-xs">{{label}}</span>
                        <h2 class="text-4xl md:text-7xl font-black text-white mt-4 uppercase tracking-tighter">{{title}}</h2>
                        <p class="text-gray-500 mt-4 font-medium">{{description}}</p>
                    </div>

                    <div class="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl">
                        <form id="contact-form-{{id}}" class="space-y-8">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black uppercase tracking-widest text-gray-500">Identity</label>
                                    <input type="text" id="name-{{id}}" placeholder="Your Name" required class="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all font-medium" />
                                </div>
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black uppercase tracking-widest text-gray-500">Subject</label>
                                    <input type="text" id="subject-{{id}}" placeholder="Project Type" required class="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all font-medium" />
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase tracking-widest text-gray-500">Brief</label>
                                <textarea id="message-{{id}}" rows="5" placeholder="Tell me about your vision..." required class="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all font-medium resize-none"></textarea>
                            </div>
                            <button type="submit" class="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-cyan-400 transition-all active:scale-[0.98]">
                               Send
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
                label: '06 // CONTACT',
                title: 'Start a Project',
                description: 'Ready to bring your concepts into the 3D realm? Let’s talk.',
                email: 'contact@kaito.design'
            },
            settings: { isVisible: true, padding: 'medium' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="border-t border-white/10 bg-black pt-20 md:pt-32 pb-20 px-6 text-center">
                    <div class="max-w-5xl mx-auto">
                        <h2 class="text-5xl md:text-8xl xl:text-[120px] font-black text-white mb-16 tracking-tighter leading-[0.85] uppercase">
                            {{footerHeading}}
                        </h2>
                        
                        <div class="flex flex-col items-center gap-8">
                            <a href="mailto:{{footerEmail}}" class="group relative px-8 py-4 border border-white/10 rounded-full text-lg md:text-2xl font-mono text-cyan-400 hover:text-white transition-colors overflow-hidden">
                                <span class="relative z-10">{{footerEmail}}</span>
                                <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            </a>
                            

                        </div>

                        <div class="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em]">
                            <div>{{copyright}}</div>
                            <div class="flex gap-8">
                                <a href="#" class="hover:text-white transition-colors">Privacy</a>
                                <a href="#" class="hover:text-white transition-colors">Cookies</a>
                            </div>
                        </div>
                    </div>
                </footer>
            `,
            content: {
                footerHeading: "Let's Shape the Unknown.",
                footerEmail: 'contact@kaito.design',
                copyright: '© 2025 KAITO. ALL RIGHTS RESERVED.'
            },
            settings: { isVisible: true, padding: 'small' }
        }
    ]
};
