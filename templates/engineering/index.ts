import { Template, Manifest } from "@/types";

// COMPLETE PROFESSIONAL ENGINEERING TEMPLATE
export const COMPLETE_ENGINEERING_DARK: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Engineering & Technology',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'dark',
        colorPalette: {
            primary: '#00f2ff',
            secondary: '#7c3aed',
            background: '#020617',
            surface: '#0f172a',
            text: '#94a3b8',
            heading: '#ffffff',
        },
        typography: {
            headingFont: 'Space Grotesk',
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
                <header class="fixed top-0 left-0 right-0 z-50 bg-[#020617] border-b border-white/5 transition-all duration-300" id="main-header">
                    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <a href="#" class="font-mono text-xl font-bold tracking-tight text-white">
                            <span class="text-cyan-400">&lt;</span>{{username}} <span class="text-cyan-400">/&gt;</span>
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">
                                {{label}}
                            </a>
                            {{/each}}
                            <a href="#contact" class="border border-cyan-500/50 text-cyan-400 px-5 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500/10 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.15)]">Hire Me</a>
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-white z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-[#020617] z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-2xl font-mono text-white hover:text-cyan-400 transition-all transform translate-y-4 opacity-0">
                            {{label}}
                        </a>
                        {{/each}}
                        <a href="#contact" class="mobile-link text-xl font-mono text-cyan-400 opacity-0 translate-y-4 transition-all delay-100">Hire Me</a>
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
                username: 'ALEX_R',
                navLinks: [
                    { label: 'Projects', link: '#projects' },
                    { label: 'Skills', link: '#skills' },
                    { label: 'Experience', link: '#experience' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero-main',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col justify-center relative overflow-hidden">
                     <div class="absolute -top-20 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>
                     <div class="absolute bottom-0 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
                     
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                        <div class="space-y-6">
                            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                {{statusTag}}
                            </div>
                            <h1 class="text-5xl md:text-7xl font-bold text-white tracking-tight">
                                {{name}}
                            </h1>
                            <p class="text-lg text-slate-400 max-w-xl leading-relaxed">
                                {{heroTagline}}
                            </p>
                            <div class="flex gap-4 pt-4">
                                <a href="{{cta.link}}" class="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                                    {{cta.text}}
                                </a>
                                <a href="#contact" class="border border-slate-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                                    Contact
                                </a>
                            </div>
                        </div>
                        <div class="relative">
                            <div class="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-2xl transform rotate-3"></div>
                            <img src="{{avatarImage}}" class="relative rounded-2xl border border-white/10 shadow-2xl bg-slate-900 w-full object-cover" />
                        </div>
                     </div>
                </section>
            `,
            content: {
                name: 'Alex Rivera<br/><span class="text-2xl md:text-3xl text-slate-400 font-normal mt-4">Senior Full-Stack Engineer</span>',
                heroTagline: 'Building scalable systems and elegant solutions. Specialized in distributed architectures, cloud infrastructure, and high-performance applications.',
                statusTag: 'System Online',
                avatarImage: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=800',
                cta: {
                    text: 'View Projects',
                    link: '#projects'
                }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'stats-metrics',
            type: 'stats',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-12 border-y border-white/5 bg-[#050b1f]">
                    <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {{#each stats}}
                        <div class="text-center md:text-left">
                            <div class="text-4xl md:text-5xl font-bold text-white mb-2">{{value}}</div>
                            <div class="text-xs font-mono text-cyan-400 uppercase tracking-widest">{{label}}</div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Impact by Numbers',
                stats: [
                    { value: '50+', label: 'Projects Delivered' },
                    { value: '8', label: 'Years Experience' },
                    { value: '99.9%', label: 'Uptime Achieved' },
                    { value: '5M+', label: 'Users Served' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'skills-tech',
            type: 'skills',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-7xl mx-auto" id="skills">
                    <h2 class="text-2xl font-bold text-white mb-12 flex items-center gap-3">
                        <i class="fas fa-code text-cyan-500"></i> {{title}}
                    </h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {{#each skills}}
                        <div class="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-cyan-500/50 transition-colors group">
                            <i class="{{icon}} text-3xl text-slate-500 group-hover:text-cyan-400 mb-4 transition-colors"></i>
                            <div class="font-bold text-white">{{name}}</div>
                            <div class="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                                <div class="bg-cyan-500 h-full rounded-full" style="width: {{level}}%"></div>
                            </div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Technical Stack',
                skills: [
                    { name: 'TypeScript', icon: 'fab fa-js-square', level: 95 },
                    { name: 'React', icon: 'fab fa-react', level: 92 },
                    { name: 'Node.js', icon: 'fab fa-node-js', level: 90 },
                    { name: 'Python', icon: 'fab fa-python', level: 88 },
                    { name: 'Docker', icon: 'fab fa-docker', level: 85 },
                    { name: 'AWS', icon: 'fab fa-aws', level: 87 },
                    { name: 'PostgreSQL', icon: 'fas fa-database', level: 90 },
                    { name: 'GraphQL', icon: 'fas fa-project-diagram', level: 85 }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects-showcase',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-7xl mx-auto" id="projects">
                    <h2 class="text-2xl font-bold text-white mb-12 flex items-center gap-3">
                        <i class="fas fa-layer-group text-cyan-500"></i> {{title}}
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {{#each items}}
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-colors group">
                            <div class="h-64 overflow-hidden relative">
                                <img src="{{image}}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-100" />
                                {{#if featured}}
                                <div class="absolute top-4 right-4 bg-cyan-500 text-black text-xs font-bold px-2 py-1 rounded">FEATURED</div>
                                {{/if}}
                            </div>
                            <div class="p-8">
                                <div class="text-cyan-400 text-xs font-mono mb-2">{{technologies}}</div>
                                <h3 class="text-xl font-bold text-white mb-3">{{title}}</h3>
                                <p class="text-slate-400 text-sm leading-relaxed mb-6">{{description}}</p>
                                <a href="{{link}}" class="text-white font-bold text-sm hover:text-cyan-400 inline-flex items-center gap-2">
                                    View Code <i class="fab fa-github"></i>
                                </a>
                            </div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Featured Projects',
                items: [
                    {
                        title: 'CloudScale Platform',
                        description: 'Enterprise-grade cloud management platform serving 10K+ organizations. Built with microservices architecture, handling 1M+ requests/day.',
                        technologies: 'React, Node.js, Kubernetes, PostgreSQL',
                        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800',
                        link: '#',
                        featured: true
                    },
                    {
                        title: 'RealTime Analytics Engine',
                        description: 'High-performance data processing pipeline with sub-second latency. Processes 100GB+ data daily.',
                        technologies: 'Python, Apache Kafka, Redis, TimescaleDB',
                        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800',
                        link: '#'
                    },
                    {
                        title: 'DevOps Automation Suite',
                        description: 'CI/CD pipeline automation reducing deployment time by 80%. Integrated with GitHub, AWS, and Slack.',
                        technologies: 'Go, Terraform, GitHub Actions, AWS',
                        image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=800',
                        link: '#'
                    },
                    {
                        title: 'AI Code Assistant',
                        description: 'ML-powered code completion and refactoring tool. Trained on 50M+ lines of code.',
                        technologies: 'Python, TensorFlow, FastAPI, React',
                        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=800',
                        link: '#'
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'experience-timeline',
            type: 'experience',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-4xl mx-auto" id="experience">
                    <h2 class="text-2xl font-bold text-white mb-12 flex items-center gap-3">
                        <i class="fas fa-history text-cyan-500"></i> {{title}}
                    </h2>
                    <div class="border-l-2 border-slate-800 ml-3 space-y-12">
                        {{#each items}}
                        <div class="relative pl-8">
                            <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                            <div class="text-sm font-mono text-cyan-400 mb-1">{{date}}</div>
                            <h3 class="text-xl font-bold text-white">{{role}} <span class="text-slate-500">at</span> {{company}}</h3>
                            <p class="text-slate-400 mt-2 mb-4">{{description}}</p>
                            <ul class="space-y-1">
                                {{#each achievements}}
                                <li class="text-sm text-slate-500 flex items-start gap-2">
                                    <span class="text-cyan-500 mt-1">▹</span> {{this}}
                                </li>
                                {{/each}}
                            </ul>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Professional Journey',
                items: [
                    {
                        role: 'Senior Full-Stack Engineer',
                        company: 'TechCorp Inc.',
                        date: '2021 - Present',
                        description: 'Leading architecture and development of cloud-native applications. Mentoring junior engineers and establishing best practices.',
                        achievements: [
                            'Reduced infrastructure costs by 40%',
                            'Improved system performance by 3x',
                            'Led team of 5 engineers'
                        ]
                    },
                    {
                        role: 'Full-Stack Developer',
                        company: 'StartupXYZ',
                        date: '2019 - 2021',
                        description: 'Built core product features from scratch. Scaled platform to support 100K+ users.',
                        achievements: [
                            'Developed real-time collaboration features',
                            'Implemented microservices architecture',
                            'Achieved 99.9% uptime SLA'
                        ]
                    },
                    {
                        role: 'Software Engineer',
                        company: 'Digital Solutions Ltd.',
                        date: '2017 - 2019',
                        description: 'Developed web applications and RESTful APIs. Collaborated with cross-functional teams.',
                        achievements: [
                            'Delivered 15+ client projects',
                            'Reduced bug rate by 60%',
                            'Mentored 3 junior developers'
                        ]
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact-main',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6" id="contact">
                    <div class="max-w-4xl mx-auto bg-slate-900/50 border border-slate-800 p-12 rounded-3xl text-center backdrop-blur-sm">
                        <i class="fas fa-paper-plane text-4xl text-cyan-400 mb-6"></i>
                        <h2 class="text-3xl font-bold text-white mb-6">{{title}}</h2>
                        <a href="mailto:{{email}}" class="text-xl md:text-2xl font-mono text-cyan-400 hover:text-cyan-300 transition-colors border-b border-cyan-500/30 pb-1 inline-block mb-8">
                            {{email}}
                        </a>
                        <div class="flex justify-center gap-6">
                            {{#each socials}}
                            <a href="{{url}}" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-cyan-500 hover:text-black transition-all">
                                <i class="fab fa-{{platform}}"></i>
                            </a>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Initialize Handshake',
                email: 'alex.rivera@techmail.com',
                socials: [
                    { platform: 'github', url: 'https://github.com/alexrivera' },
                    { platform: 'linkedin', url: 'https://linkedin.com/in/alexrivera' },
                    { platform: 'twitter', url: 'https://twitter.com/alexrivera' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer-main',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-8 border-t border-slate-800 text-center text-slate-500 text-sm font-mono">
                    <div class="mb-4 text-white font-bold">{{footerHeading}}</div>
                    <p>{{copyright}}</p>
                </footer>
            `,
            content: {
                footerHeading: 'Alex Rivera',
                footerEmail: 'alex.rivera@techmail.com',
                copyright: 'Designed & Built by Alex Rivera. End of Line.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};

// CLOUD INFRASTRUCTURE & SYSTEMS TEMPLATE
export const CLOUD_INFRA_CYBER: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Cloud & Infrastructure Engineering',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'dark',
        colorPalette: {
            primary: '#10b981', // Emerald
            secondary: '#06b6d4', // Cyan
            background: '#0a0a0a',
            surface: '#171717',
            text: '#a3a3a3',
            heading: '#f5f5f5',
        },
        typography: {
            headingFont: 'Space Grotesk',
            bodyFont: 'Inter',
            monoFont: 'Fira Code',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-black border-b border-emerald-900/30 font-mono" id="main-header">
                    <div class="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span class="text-emerald-500 font-bold tracking-widest">{{username}}</span>
                        </div>
                        <nav class="hidden md:flex gap-8 text-xs text-emerald-700/80">
                            <a href="#stats-infra" class="hover:text-emerald-400 font-bold">[STATUS]</a>
                            <a href="#skills-infra" class="hover:text-emerald-400 font-bold">[STACK]</a>
                            <a href="#experience-infra" class="hover:text-emerald-400 font-bold">[LOGS]</a>
                            <a href="#projects-infra" class="hover:text-emerald-400 font-bold">[NODES]</a>
                            <a href="#contact-infra" class="hover:text-emerald-400 font-bold">[PING]</a>
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-emerald-500 z-50 relative w-10 h-10 flex items-center justify-center">
                             <i class="fas fa-terminal transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        <a href="#stats-infra" class="mobile-link text-xl font-mono text-emerald-500 hover:text-emerald-400 transition-all transform translate-y-4 opacity-0">[STATUS]</a>
                        <a href="#skills-infra" class="mobile-link text-xl font-mono text-emerald-500 hover:text-emerald-400 transition-all transform translate-y-4 opacity-0">[STACK]</a>
                        <a href="#experience-infra" class="mobile-link text-xl font-mono text-emerald-500 hover:text-emerald-400 transition-all transform translate-y-4 opacity-0">[LOGS]</a>
                        <a href="#projects-infra" class="mobile-link text-xl font-mono text-emerald-500 hover:text-emerald-400 transition-all transform translate-y-4 opacity-0">[NODES]</a>
                        <a href="#contact-infra" class="mobile-link text-xl font-mono text-emerald-500 hover:text-emerald-400 transition-all transform translate-y-4 opacity-0">[PING]</a>
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
                                        icon.classList.remove('fa-terminal');
                                        icon.classList.add('fa-times');
                                        document.body.style.overflow = 'hidden';
                                        links.forEach((link, idx) => setTimeout(() => link.classList.remove('translate-y-4', 'opacity-0'), 100 + (idx * 50)));
                                    } else {
                                        menu.classList.add('opacity-0', 'pointer-events-none');
                                        icon.classList.remove('fa-times');
                                        icon.classList.add('fa-terminal');
                                        document.body.style.overflow = '';
                                        links.forEach(link => link.classList.add('translate-y-4', 'opacity-0'));
                                    }
                                });
                                links.forEach(link => link.addEventListener('click', () => {
                                    isOpen = false;
                                    menu.classList.add('opacity-0', 'pointer-events-none');
                                    icon.classList.remove('fa-times');
                                    icon.classList.add('fa-terminal');
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
                username: 'ROOT@VIKRAM:~$'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero-infra',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="min-h-screen flex items-center justify-center bg-black text-emerald-500 font-mono pt-16 px-6 relative overflow-hidden">
                    <div class="absolute inset-0 z-0 opacity-20 pointer-events-none" style="background-image: radial-gradient(#10b981 1px, transparent 1px); background-size: 30px 30px;"></div>
                    
                    <div class="max-w-4xl w-full z-10 border border-emerald-900/50 bg-black/80 p-8 md:p-12 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                        <div class="flex items-center gap-2 text-xs text-emerald-800 mb-6 border-b border-emerald-900/30 pb-4">
                            <div class="w-3 h-3 rounded-full bg-red-500"></div>
                            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span class="ml-4">bash --login</span>
                        </div>
                        <h1 class="text-4xl md:text-6xl font-bold mb-6 text-emerald-400 glitch-text">
                            {{{name}}}
                        </h1>
                        <p class="text-emerald-700 mb-10 max-w-2xl leading-relaxed">
                             {{heroTagline}}
                        </p>
                        <div class="flex gap-4">
                            <a href="{{cta.link}}" class="bg-emerald-900/30 border border-emerald-500/50 text-emerald-400 px-6 py-3 hover:bg-emerald-500 hover:text-black transition-all duration-300">
                                {{cta.text}}
                            </a>
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'Vikram Singh<br/><span class="text-xl md:text-2xl text-emerald-600 block mt-4">Principal SRE & Cloud Architect</span>',
                statusTag: 'System Online',
                heroTagline: '> Architecting resilient, distributed systems for sub-millisecond precision. Kubernetes specialist with a focus on zero-trust security and automated scalability.',
                cta: { text: "./view_infrastructure.sh", link: '#projects-infra' }
            },
            settings: { isVisible: true, padding: 'none' }
        }
        ,
        {
            id: 'stats-infra',
            type: 'stats',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-20 px-6 bg-black font-mono border-t border-emerald-900/30" id="stats-infra">
                    <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                        {{#each stats}}
                        <div class="bg-emerald-950/10 border border-emerald-900/30 p-6">
                            <div class="text-3xl font-bold text-emerald-400 mb-2">{{value}}</div>
                            <div class="text-xs text-emerald-700 uppercase">{{label}}</div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                stats: [
                    { value: '99.999%', label: 'Uptime Reliability' },
                    { value: '500K+', label: 'Nodes Managed' },
                    { value: '<10ms', label: 'Global Latency' },
                    { value: '$20M', label: 'Cloud Cost Savings' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'skills-infra',
            type: 'skills',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 bg-black font-mono" id="skills-infra">
                    <div class="max-w-7xl mx-auto">
                        <p class="text-emerald-700 mb-8">> cat ./tech_stack.conf</p>
                        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {{#each skills}}
                            <div class="border border-emerald-900/30 p-4 hover:bg-emerald-900/10 hover:border-emerald-500/50 transition-all group">
                                <div class="text-emerald-400 font-bold mb-2">{{category}}</div>
                                <div class="space-y-1">
                                    {{#each items}}
                                    <div class="text-emerald-600/80 text-sm flex items-center gap-2">
                                        <span class="text-emerald-800 group-hover:text-emerald-500 transition-colors">▸</span> {{this}}
                                    </div>
                                    {{/each}}
                                </div>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                skills: [
                    { category: 'Cloud Platforms', items: ['AWS', 'GCP', 'Azure', 'DigitalOcean'] },
                    { category: 'Orchestration', items: ['Kubernetes', 'Docker Swarm', 'Nomad'] },
                    { category: 'IaC', items: ['Terraform', 'Pulumi', 'CloudFormation'] },
                    { category: 'Monitoring', items: ['Prometheus', 'Grafana', 'Datadog', 'PagerDuty'] }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'experience-infra',
            type: 'experience',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 bg-black font-mono" id="experience-infra">
                    <div class="max-w-4xl mx-auto">
                        <p class="text-emerald-700 mb-8">> git log --oneline ./career</p>
                        <div class="space-y-6">
                            {{#each items}}
                            <div class="border-l-2 border-emerald-900 pl-6 hover:border-emerald-500 transition-colors py-2">
                                <div class="flex flex-wrap items-baseline gap-4 mb-2">
                                    <h3 class="text-lg font-bold text-emerald-400">{{role}}</h3>
                                    <span class="text-emerald-700 text-sm">@ {{company}}</span>
                                </div>
                                <div class="text-emerald-800 text-xs mb-3">{{period}}</div>
                                <p class="text-emerald-600/80 text-sm">{{description}}</p>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                items: [
                    { role: 'Principal SRE', company: 'Global Tech Corp', period: '2021-PRESENT', description: 'Leading infrastructure for 500+ production services, ensuring 99.999% uptime across 20 regions.' },
                    { role: 'Senior DevOps Engineer', company: 'Cloud Scale Inc', period: '2018-2021', description: 'Built auto-scaling Kubernetes clusters handling 10M+ requests per minute.' },
                    { role: 'Cloud Infrastructure Engineer', company: 'StartupXYZ', period: '2015-2018', description: 'Migrated legacy infrastructure to cloud, reducing operational costs by 60%.' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects-infra',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 bg-black font-mono" id="projects-infra">
                    <div class="max-w-7xl mx-auto space-y-4">
                        <h2 class="text-emerald-500 mb-8">> ls -la ./core_systems</h2>
                        {{#each items}}
                        <div class="border border-emerald-900/30 p-6 hover:bg-emerald-900/10 transition-colors flex flex-col md:flex-row gap-6">
                             <div class="w-full md:w-48 h-32 bg-emerald-900/20 border border-emerald-900/30 flex items-center justify-center overflow-hidden">
                                <span class="text-4xl text-emerald-800"><i class="fas fa-server"></i></span>
                             </div>
                             <div class="flex-1">
                                <h3 class="text-xl font-bold text-emerald-400 mb-2">{{title}}</h3>
                                <div class="text-xs text-emerald-700 mb-4">{{technologies}}</div>
                                <p class="text-emerald-600/80 mb-4">{{description}}</p>
                                <a href="{{link}}" class="text-xs text-emerald-500 hover:text-emerald-300 underline">[ACCESS_LOGS]</a>
                             </div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                items: [
                    {
                        title: 'Zero-Trust Mesh',
                        description: 'Global service mesh implementation using Istio and SPIRE, serving 500+ microservices securely.',
                        technologies: 'SRE, Networking, Security',
                        link: '#'
                    },
                    {
                        title: 'Auto-Scaling Pipeline',
                        description: 'Custom KEDA-powered scaling logic that handles 10x traffic spikes automatically.',
                        technologies: 'Kubernetes, Go, Prometheus',
                        link: '#'
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact-infra',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 bg-black font-mono border-t border-emerald-900/30" id="contact-infra">
                    <div class="max-w-2xl mx-auto text-center">
                        <p class="text-emerald-700 mb-4">> ./initiate_contact.sh</p>
                        <a href="mailto:{{email}}" class="text-2xl md:text-4xl font-bold text-emerald-500 hover:text-emerald-400 hover:underline decoration-emerald-800 underline-offset-8 transition-all">
                            {{email}}
                        </a>
                        <div class="mt-12 flex justify-center gap-8">
                             {{#each socials}}
                                <a href="{{url}}" class="text-emerald-800 hover:text-emerald-500 text-sm">[{{platform}}]</a>
                             {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                email: 'v.singh@infra-ops.io',
                socials: [
                    { platform: 'github', url: 'https://github.com/vinfra' },
                    { platform: 'linkedin', url: 'https://linkedin.com/in/vinfra' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer-infra',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-6 bg-black text-center text-emerald-900 text-xs font-mono border-t border-emerald-900/20">
                    <div class="mb-2 text-emerald-500 font-bold uppercase">{{footerHeading}}</div>
                    <p>{{copyright}}</p>
                    <a href="mailto:{{footerEmail}}" class="block mt-2 hover:text-emerald-400 transition-colors">{{footerEmail}}</a>
                </footer>
            `,
            content: {
                footerHeading: 'VIKRAM SINGH',
                footerEmail: 'v.singh@infra-ops.io',
                copyright: 'SYSTEM STATUS: NOMINAL // 2025'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};

export const ENGINEERING_TEMPLATES: Template[] = [
    {
        id: "complete_engineering_dark",
        name: "Full-Stack Engineering",
        niche: "Engineering",
        preview: "/templates/screenshots/fullstack_engineering1.png",
        structuredContent: COMPLETE_ENGINEERING_DARK,
        html: "",
        css: ""
    },
    {
        id: "cloud_infra_cyber",
        name: "Cloud & Systems",
        niche: "Engineering",
        preview: "/templates/screenshots/cloud_system1.png",
        structuredContent: CLOUD_INFRA_CYBER,
        html: "",
        css: ""
    }
];
