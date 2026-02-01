
import { Template, Manifest } from "@/types";

export const DATA_SCIENCE_DARK: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Data Science & Machine Learning',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'dark',
        colorPalette: {
            primary: '#10b981',
            secondary: '#3b82f6',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#cbd5e1',
            heading: '#f1f5f9',
        },
        typography: {
            headingFont: 'Inter',
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
                <header class="fixed top-0 left-0 right-0 z-50 bg-[#0f172a] border-b border-emerald-900/30" id="main-header">
                    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <a href="#" class="font-mono text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            <i class="fas fa-network-wired text-emerald-500"></i> {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-mono text-slate-400 hover:text-emerald-400 transition-colors">
                                {{label}}
                            </a>
                            {{/each}}
                            <a href="#contact" class="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold font-mono hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">Collaborate</a>
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-white z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-[#0f172a] z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-2xl font-mono text-white hover:text-emerald-400 transition-all transform translate-y-4 opacity-0">
                            {{label}}
                        </a>
                        {{/each}}
                        <a href="#contact" class="mobile-link text-xl font-mono text-emerald-400 opacity-0 translate-y-4 transition-all delay-100">Collaborate</a>
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
                username: 'dr_sarah_chen',
                navLinks: [
                    { label: 'Research', link: '#about-ds' },
                    { label: 'Models', link: '#projects-ds' },
                    { label: 'History', link: '#experience-ds' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero-ds',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="min-h-screen flex items-center pt-20 px-6 bg-[#0f172a] relative overflow-hidden">
                    <div class="absolute inset-0 z-0">
                        <div class="absolute w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl -top-20 -right-20"></div>
                        <div class="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl bottom-0 -left-20"></div>
                    </div>
                    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                        <div class="space-y-8">
                            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full font-mono text-xs border border-emerald-500/20">
                                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                {{statusTag}}
                            </div>
                            <h1 class="text-5xl md:text-7xl font-bold text-white tracking-tight">
                                {{name}}
                            </h1>
                            <p class="text-slate-300 text-lg leading-relaxed max-w-lg">
                                {{heroTagline}}
                            </p>
                            <div class="flex gap-4">
                                <a href="{{cta.link}}" class="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                                    {{cta.text}}
                                </a>
                                <a href="#contact" class="px-8 py-3 rounded-lg font-bold text-white border border-slate-600 hover:bg-slate-800 transition-colors">
                                    Contact
                                </a>
                            </div>
                        </div>
                        <div class="relative rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl">
                             <div class="absolute top-0 left-0 right-0 h-10 bg-slate-900 flex items-center px-4 gap-2 border-b border-white/5">
                                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                             </div>
                             <img src="{{avatarImage}}" class="w-full object-cover" />
                             <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0f172a] to-transparent h-32"></div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'Dr. Sarah Chen',
                statusTag: 'Senior Data Scientist & ML Engineer',
                heroTagline: 'Building intelligent systems with machine learning. Specialized in NLP, computer vision, and predictive analytics at scale.',
                avatarImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800',
                cta: { text: 'View Research', link: '#projects-ds' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'stats-ds',
            type: 'stats',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-12 border-y border-white/5 bg-[#1e293b]">
                    <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {{#each stats}}
                        <div class="text-center">
                            <div class="text-3xl md:text-5xl font-bold text-white mb-2">{{value}}</div>
                            <div class="text-xs font-mono text-emerald-400 uppercase tracking-widest">{{label}}</div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Research Impact',
                stats: [
                    { value: '15+', label: 'Published Papers' },
                    { value: '95%', label: 'Model Accuracy' },
                    { value: '100M+', label: 'Data Points' },
                    { value: '20+', label: 'Models Deployed' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'about-ds',
            type: 'about',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-7xl mx-auto" id="about-ds">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div class="space-y-6">
                            <h2 class="text-3xl font-bold text-white mb-6">{{title}}</h2>
                            <p class="text-slate-300 leading-relaxed text-lg">{{content}}</p>
                            <div class="grid grid-cols-2 gap-4">
                                {{#each stats}}
                                <div class="bg-slate-800/50 p-4 rounded-lg border border-white/5">
                                    <div class="text-2xl font-bold text-emerald-400">{{value}}</div>
                                    <div class="text-xs text-slate-400">{{label}}</div>
                                </div>
                                {{/each}}
                            </div>
                        </div>
                        <div class="bg-slate-800 rounded-2xl p-8 border border-white/5">
                             <h3 class="text-xl font-bold text-white mb-6">Technical Arsenal</h3>
                             <div class="grid grid-cols-2 gap-4">
                                 <div class="space-y-2">
                                     <div class="text-xs text-slate-500 uppercase">Languages</div>
                                     <div class="font-mono text-emerald-300">Python, R, SQL, Julia, Scala</div>
                                 </div>
                                 <div class="space-y-2">
                                     <div class="text-xs text-slate-500 uppercase">Frameworks</div>
                                     <div class="font-mono text-emerald-300">PyTorch, TensorFlow, Scikit-learn</div>
                                 </div>
                                 <div class="space-y-2">
                                     <div class="text-xs text-slate-500 uppercase">Tools</div>
                                     <div class="font-mono text-emerald-300">Docker, Kubernetes, AWS SageMaker</div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Data-Driven Innovation',
                content: 'PhD in Machine Learning with 10+ years applying AI to real-world problems. Expert in deep learning, statistical modeling, and production ML systems. Published researcher and conference speaker.',
                stats: [
                    { label: 'ML Models', value: '50+' },
                    { label: 'Citations', value: '1200+' },
                    { label: 'Datasets', value: '30+' },
                    { label: 'Years', value: '10+' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects-ds',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-7xl mx-auto" id="projects-ds">
                    <h2 class="text-3xl font-bold text-white mb-12 flex items-center gap-3">
                        <i class="fas fa-project-diagram text-emerald-500"></i> {{title}}
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {{#each items}}
                        <div class="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all group">
                             <div class="h-48 overflow-hidden">
                                 <img src="{{image}}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                             </div>
                             <div class="p-6">
                                <h3 class="text-xl font-bold text-white mb-3">{{title}}</h3>
                                <p class="text-slate-400 text-sm mb-4">{{description}}</p>
                                <div class="text-xs font-mono text-emerald-400 bg-emerald-900/20 px-3 py-1 rounded inline-block">
                                    {{technologies}}
                                </div>
                                <a href="{{link}}" class="block mt-6 text-sm font-bold text-white hover:text-emerald-400 transition-colors">View Analysis &rarr;</a>
                             </div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'ML Projects & Research',
                items: [
                    {
                        title: 'Medical Image Classification',
                        description: 'Deep learning model for cancer detection achieving 97% accuracy. Deployed in 15 hospitals.',
                        technologies: 'PyTorch, ResNet',
                        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
                        link: '#'
                    },
                    {
                        title: 'NLP Sentiment Engine',
                        description: 'Real-time sentiment analysis processing 10M+ social media posts daily.',
                        technologies: 'BERT, Transformers',
                        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
                        link: '#'
                    },
                    {
                        title: 'Predictive Maintenance',
                        description: 'IoT sensor data analysis reducing equipment downtime by 60%. Saved $5M annually.',
                        technologies: 'LSTM, Spark',
                        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
                        link: '#'
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'experience-ds',
            type: 'experience',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-4xl mx-auto" id="experience-ds">
                    <h2 class="text-3xl font-bold text-white mb-12 text-center">{{title}}</h2>
                    <div class="relative border-l-2 border-emerald-900 ml-4 md:ml-0 md:pl-8 space-y-12">
                        {{#each items}}
                        <div class="relative md:flex gap-8 group">
                            <div class="absolute -left-[9px] md:-left-[41px] top-0 w-4 h-4 rounded-full bg-emerald-900 group-hover:bg-emerald-500 transition-colors border-4 border-[#0f172a]"></div>
                             <div class="md:w-32 pt-1 mb-2 md:mb-0">
                                <span class="font-mono text-emerald-500 text-sm">{{date}}</span>
                             </div>
                             <div class="flex-1 bg-slate-800/50 p-6 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                                <h3 class="text-xl font-bold text-white">{{role}}</h3>
                                <div class="text-slate-400 text-sm mb-4">{{company}}</div>
                                <p class="text-slate-300 mb-4">{{description}}</p>
                                <ul class="space-y-1">
                                    {{#each achievements}}
                                    <li class="text-sm text-slate-400 flex items-start gap-2">
                                        <span class="text-emerald-500">▹</span> {{this}}
                                    </li>
                                    {{/each}}
                                </ul>
                             </div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Career Path',
                items: [
                    {
                        role: 'Senior Data Scientist',
                        company: 'AI Research Lab',
                        date: '2020 - Present',
                        description: 'Leading ML research team developing production AI systems.',
                        achievements: [
                            'Developed medical AI saving 10K+ lives',
                            'Led team of 6 data scientists',
                            'Reduced model training time by 70%'
                        ]
                    },
                    {
                        role: 'Machine Learning Engineer',
                        company: 'Tech Startup',
                        date: '2017 - 2020',
                        description: 'Built recommendation engine serving 5M+ users.',
                        achievements: [
                            'Increased user engagement by 45%',
                            'Deployed 15+ ML models to production'
                        ]
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact-ds',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 bg-[#1e293b]" id="contact">
                    <div class="max-w-4xl mx-auto text-center">
                        <div class="inline-block p-4 rounded-full bg-emerald-900/30 text-emerald-400 mb-6">
                            <i class="fas fa-flask text-3xl"></i>
                        </div>
                        <h2 class="text-4xl font-bold text-white mb-6">{{title}}</h2>
                        <a href="mailto:{{email}}" class="text-2xl md:text-3xl font-mono text-emerald-400 hover:text-emerald-300 transition-colors border-b-2 border-emerald-900 hover:border-emerald-400 pb-1 inline-block mb-10">
                            {{email}}
                        </a>
                        <div class="flex justify-center gap-6">
                            {{#each socials}}
                            <a href="{{url}}" class="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all">
                                <i class="fab fa-{{platform}} text-xl"></i>
                            </a>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Scientific Collaboration',
                email: 'sarah.chen@mlresearch.ai',
                socials: [
                    { platform: 'github', url: 'https://github.com/sarahchen' },
                    { platform: 'linkedin', url: 'https://linkedin.com/in/sarahchen' },
                    { platform: 'twitter', url: 'https://twitter.com/sarahchen' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer-ds',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-12 bg-[#0f172a] text-center text-slate-500 text-sm font-mono border-t border-white/5">
                    <div class="mb-4 text-white font-bold text-lg tracking-tight">{{footerHeading}}</div>
                    <p>{{copyright}}</p>
                    <a href="mailto:{{footerEmail}}" class="block mt-2 hover:text-emerald-400 transition-colors">{{footerEmail}}</a>
                </footer>
            `,
            content: {
                footerHeading: 'Dr. Sarah Chen',
                footerEmail: 'sarah.chen@mlresearch.ai',
                copyright: '© 2025 Dr. Sarah Chen. Research & Development.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};

export const MARKETING_GROWTH_LIGHT: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Marketing & Growth',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#f43f5e',
            secondary: '#fbbf24',
            background: '#ffffff',
            surface: '#fff1f2',
            text: '#4b5563',
            heading: '#111827',
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
                <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-rose-100 transition-all duration-300" id="main-header">
                    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <a href="#" class="font-black text-2xl tracking-tighter text-rose-600 uppercase italic">
                            Growth<span class="text-slate-900">.Hack</span>
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-bold text-slate-600 hover:text-rose-600 transition-colors uppercase tracking-wide">
                                {{label}}
                            </a>
                            {{/each}}
                        <a href="#contact-growth" class="bg-rose-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/30 transform hover:-translate-y-0.5">Scale Now</a>
                    </nav>
                    <button id="mobile-menu-btn-{{id}}" class="md:hidden text-rose-600 z-50 relative w-10 h-10 flex items-center justify-center">
                        <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                    </button>
                </div>
                <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                    {{#each navLinks}}
                    <a href="{{link}}" class="mobile-link text-3xl font-black text-slate-900 hover:text-rose-600 transition-all transform translate-y-4 opacity-0 italic">
                        {{label}}
                    </a>
                    {{/each}}
                    <a href="#contact-growth" class="mobile-link text-xl font-bold text-rose-600 opacity-0 translate-y-4 transition-all delay-100 uppercase mt-4">Scale Now</a>
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
                username: 'MARCUS THORNE',
                navLinks: [
                    { label: 'Stats', link: '#stats-growth' },
                    { label: 'Cases', link: '#projects-growth' },
                    { label: 'Audit', link: '#contact-growth' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero-growth',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 overflow-hidden">
                    <div class="flex-1 space-y-8 relative z-10">
                        <div class="inline-block bg-yellow-400 text-black text-sm font-black uppercase italic transform -rotate-2 px-4 py-1 shadow-lg">
                            {{statusTag}}
                        </div>
                        <h1 class="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                            {{{heroTagline}}}
                        </h1>
                        <p class="text-xl text-slate-600 font-medium max-w-lg">
                            {{name}}
                        </p>
                        <div class="flex gap-4 pt-4">
                            <a href="{{cta.link}}" class="bg-rose-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-rose-700 hover:shadow-xl hover:shadow-rose-600/30 transition-all transform hover:-translate-y-1">
                                {{cta.text}}
                            </a>
                        </div>
                    </div>
                    <div class="flex-1 relative">
                        <div class="absolute inset-0 bg-yellow-300 rounded-full blur-[80px] opacity-20 transform translate-x-10 translate-y-10"></div>
                        <div class="relative bg-white p-2 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                             <img src="{{avatarImage}}" class="w-full rounded-2xl" />
                             <div class="absolute -bottom-6 -left-6 bg-black text-white p-6 rounded-2xl shadow-xl">
                                <div class="text-3xl font-black text-yellow-400">+400%</div>
                                <div class="text-xs font-bold uppercase tracking-widest">YOY Growth</div>
                             </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'Marcus Thorne',
                statusTag: '#1 Growth Marketer',
                heroTagline: 'UPLOAD<br/><span class="text-rose-600">REVENUE</span><br/>FASTER.',
                avatarImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800',
                cta: { text: 'Start Scaling', link: '#contact-growth' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'stats-growth',
            type: 'stats',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-20 bg-slate-900 w-full transform -skew-y-2 origin-top-left" id="stats-growth">
                    <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 transform skew-y-2">
                        {{#each stats}}
                        <div class="text-center text-white">
                            <div class="text-5xl md:text-6xl font-black text-yellow-400 mb-2">{{value}}</div>
                            <div class="text-sm font-bold uppercase tracking-widest opacity-80">{{label}}</div>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Performance Snapshot',
                stats: [
                    { value: '3x', label: 'Average ROI' },
                    { value: '12M+', label: 'Monthly Traffic' },
                    { value: '45%', label: 'LTV Increase' },
                    { value: '$100M', label: 'Ad Spend' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects-growth',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 max-w-7xl mx-auto" id="projects-growth">
                    <h2 class="text-4xl font-black text-slate-900 mb-16 text-center italic">GROWTH EXPERIMENTS</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {{#each items}}
                        <div class="group border-4 border-slate-900 rounded-3xl p-8 hover:bg-slate-50 transition-colors relative shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                            <div class="bg-rose-100 text-rose-600 font-bold px-4 py-1 rounded-full text-xs inline-block mb-4 border border-rose-200">{{technologies}}</div>
                            <h3 class="text-2xl font-black text-slate-900 mb-4">{{title}}</h3>
                            <p class="text-slate-600 font-medium mb-6">{{description}}</p>
                            <a href="{{link}}" class="font-black text-slate-900 underline decoration-4 decoration-yellow-400 hover:decoration-rose-500 transition-colors">See Results</a>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Case Studies',
                items: [
                    {
                        title: 'SaaS Viral Engine',
                        description: 'Architected referral program that led to 400% YOY organic growth using multi-tier reward logic.',
                        technologies: 'Virality Loop',
                        link: '#'
                    },
                    {
                        title: 'Fintech Precision Scaling',
                        description: 'Localized performance marketing across 12 markets, reducing CAC by 65%.',
                        technologies: 'Performance Marketing',
                        link: '#'
                    }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact-growth',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6" id="contact-growth">
                    <div class="max-w-4xl mx-auto bg-rose-600 rounded-[3rem] p-12 md:p-24 text-center text-white relative shadow-2xl">
                         <div class="relative z-10">
                            <h2 class="text-5xl md:text-7xl font-black italic mb-8">READY TO SCALE?</h2>
                            <p class="text-rose-100 text-xl font-bold mb-12">Limited availability for Q3. Secure your audit now.</p>
                            
                            <a href="mailto:{{email}}" class="bg-white text-rose-600 text-2xl md:text-4xl font-black px-12 py-6 rounded-2xl hover:scale-105 transition-transform inline-block shadow-xl">
                                {{email}}
                            </a>
                            
                            <div class="mt-12 flex justify-center gap-6">
                                {{#each socials}}
                                <a href="{{url}}" class="text-white hover:text-yellow-300 font-bold uppercase tracking-widest text-sm border-b-2 border-white/20 pb-1 hover:border-yellow-300">{{platform}}</a>
                                {{/each}}
                            </div>
                         </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Collaborate',
                email: 'marcus@growth.sm',
                socials: [
                    { platform: 'LinkedIn', url: 'https://linkedin.com/in/marcusthgrowth' },
                    { platform: 'Twitter', url: 'https://twitter.com/growth_marcus' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer-growth',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-12 text-center">
                    <div class="font-black text-2xl text-slate-200 uppercase italic mb-4">{{footerHeading}}</div>
                    <p class="text-slate-400 text-xs">{{copyright}}</p>
                    <a href="mailto:{{footerEmail}}" class="block mt-2 text-rose-600 font-bold hover:underline">{{footerEmail}}</a>
                </footer>
            `,
            content: {
                footerHeading: 'Growth never stops.',
                footerEmail: 'marcus@growth.sm',
                copyright: '© 2025 Marcus Thorne'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};

export const LEGAL_PROFESSIONAL_FORMAL: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Legal & Professional Services',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#1e293b',
            secondary: '#64748b',
            background: '#f8fafc',
            surface: '#ffffff',
            text: '#334155',
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
                <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-slate-900 shadow-sm" id="main-header">
                    <div class="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
                        <a href="#" class="flex flex-col">
                            <span class="font-serif text-2xl font-bold text-slate-900 tracking-tight leading-none">STERLING</span>
                            <span class="text-[0.6rem] uppercase tracking-[0.3em] text-slate-500 font-bold">Legal Counsel</span>
                        </a>
                        <nav class="hidden md:flex items-center gap-12">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 after:transition-all hover:after:w-full">
                                {{label}}
                            </a>
                            {{/each}}
                            <a href="#contact" class="bg-slate-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">Consultation</a>
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-slate-900 z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-2xl font-serif font-bold text-slate-900 hover:text-slate-600 transition-all transform translate-y-4 opacity-0">
                            {{label}}
                        </a>
                        {{/each}}
                        <a href="#contact" class="mobile-link text-xl font-bold uppercase tracking-widest text-slate-900 opacity-0 translate-y-4 transition-all delay-100">Consultation</a>
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
                username: 'STERLING',
                navLinks: [
                    { label: 'Firm', link: '#about-legal' },
                    { label: 'Practice', link: '#experience-legal' },
                    { label: 'Contact', link: '#contact-legal' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero-legal',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="min-h-[90vh] flex items-center bg-[#f8fafc] pt-24 px-6 relative">
                    <div class="absolute right-0 top-0 w-1/3 h-full bg-slate-200/50 hidden md:block"></div>
                    <div class="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                        <div class="space-y-10">
                            <div class="h-1 w-16 bg-slate-900"></div>
                            <h1 class="text-5xl md:text-7xl font-serif font-bold text-slate-900 leading-tight">
                                {{{heroTagline}}}
                            </h1>
                            <p class="text-xl text-slate-600 max-w-lg leading-relaxed font-light">
                                {{name}} | {{statusTag}}
                            </p>
                            <a href="{{cta.link}}" class="inline-block bg-slate-900 text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-colors">
                                {{cta.text}}
                            </a>
                        </div>
                        <div class="relative h-[600px] w-full">
                            <div class="absolute inset-0 bg-slate-900 transform translate-x-4 translate-y-4 hidden md:block"></div>
                            <img src="{{avatarImage}}" class="w-full h-full object-cover relative z-10 grayscale contrast-125" />
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'Jonathan Sterling',
                statusTag: 'Principal Counsel',
                heroTagline: 'Justice.<br/><span class="italic text-slate-500">Integrity.</span><br/>Results.',
                avatarImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200',
                cta: { text: 'Case Evaluation', link: '#contact-legal' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'about-legal',
            type: 'about',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 bg-white" id="about-legal">
                    <div class="max-w-5xl mx-auto text-center">
                        <div class="w-px h-24 bg-slate-300 mx-auto mb-12"></div>
                        <h2 class="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-8 leading-snug">{{content}}</h2>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-12 mt-20 border-t border-slate-100 pt-20">
                            {{#each stats}}
                            <div>
                                <div class="text-4xl font-serif font-bold text-slate-900 mb-2">{{value}}</div>
                                <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{label}}</div>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'A Legacy of Excellence',
                content: 'With two decades in the highest courts, our practice is built on a foundation of rigorous analysis and unwavering advocacy. We navigate the complexities of modern law with a focus on delivering outcomes.',
                stats: [
                    { value: '20+', label: 'Years Experience' },
                    { value: '92%', label: 'Success Rate' },
                    { value: '$2B+', label: 'Settlements' },
                    { value: '500+', label: 'Clients' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'experience-legal',
            type: 'experience',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 bg-[#f8fafc]" id="experience-legal">
                    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div class="md:col-span-1">
                            <h2 class="text-4xl font-serif font-bold text-slate-900 mb-6">Expertise</h2>
                            <p class="text-slate-500 leading-relaxed">Focusing on high-stakes sectors where precision is paramount.</p>
                        </div>
                        <div class="md:col-span-2 space-y-12">
                            {{#each items}}
                            <div class="bg-white p-10 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <h3 class="text-xl font-bold text-slate-900 mb-2 font-serif">{{role}}</h3>
                                <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{{company}}</div>
                                <p class="text-slate-600 leading-relaxed">{{description}}</p>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Practice Areas',
                items: [
                    { role: 'Corporate Governance', company: 'Strategic Advisory', period: 'Active', description: 'Ensuring compliance and ethical scaling for emerging multinational corporations.' },
                    { role: 'Intellectual Property', company: 'Global Protection', period: 'Active', description: 'Aggressive defense of digital assets and patent portfolios in cross-border disputes.' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact-legal',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6 bg-slate-900 text-white" id="contact-legal">
                    <div class="max-w-4xl mx-auto text-center">
                        <h2 class="text-4xl font-serif font-bold mb-12">Confidential Consultation</h2>
                        <a href="mailto:{{email}}" class="text-3xl md:text-5xl font-serif italic hover:text-slate-300 transition-colors border-b border-slate-700 pb-2 mb-12 inline-block">
                            {{email}}
                        </a>
                        <div class="mt-8 space-y-2">
                            <p class="text-slate-400 font-serif text-lg">{{location}}</p>
                            <p class="text-slate-500 text-sm uppercase tracking-widest">{{phone}}</p>
                        </div>
                    </div>
                </section>
            `,
            content: {
                title: 'Consult Counsel',
                email: 'j.sterling@lawfirm.sm',
                phone: '+1 (202) 555-0100',
                location: 'Washington, D.C.'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer-legal',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-12 bg-white text-center border-t border-slate-100">
                    <div class="text-slate-900 font-serif font-bold text-lg mb-2">{{footerHeading}}</div>
                    <p class="text-slate-400 text-xs uppercase tracking-widest">{{copyright}}</p>
                    <a href="mailto:{{footerEmail}}" class="block mt-2 text-slate-600 hover:text-slate-900 transition-colors text-xs">{{footerEmail}}</a>
                </footer>
            `,
            content: {
                footerHeading: 'STERLING',
                footerEmail: 'j.sterling@lawfirm.sm',
                copyright: '© 2025 Sterling Legal Counsel. All rights reserved.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};

export const ADDITIONAL_TEMPLATES: Template[] = [
    {
        id: "data_science_dark",
        name: "Data Science & ML",
        niche: "Data Science",
        preview: "/templates/screenshots/datascience_ml1.png",
        structuredContent: DATA_SCIENCE_DARK,
        html: "",
        css: ""
    },
    {
        id: "marketing_growth_light",
        name: "Marketing & Growth",
        niche: "Marketing",
        preview: "/templates/screenshots/marketing_growth1.png",
        structuredContent: MARKETING_GROWTH_LIGHT,
        html: "",
        css: ""
    },
    {
        id: "legal_professional_formal",
        name: "Elite Professional (Legal)",
        niche: "Professional Services",
        preview: "/templates/screenshots/legal_profession1.png",
        structuredContent: LEGAL_PROFESSIONAL_FORMAL,
        html: "",
        css: ""
    }
];
