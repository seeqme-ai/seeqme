import { Manifest } from "@/types";

export const DEV_BRUTALIST: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Engineering',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#00ff00',
            secondary: '#000000',
            background: '#ffffff',
            surface: '#f0f0f0',
            text: '#000000',
            heading: '#000000',
        },
        typography: {
            headingFont: 'Space Mono',
            bodyFont: 'Space Mono',
            monoFont: 'Space Mono',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-black font-mono transition-all duration-300" id="main-header">
                    <div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                        <a href="#" class="text-xl font-bold uppercase tracking-tighter bg-[#00ff00] px-2 py-1 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-bold text-black hover:bg-black hover:text-[#00ff00] px-2 py-1 transition-colors uppercase">
                                {{label}}
                            </a>
                            {{/each}}
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-black z-50 relative w-10 h-10 flex items-center justify-center border-2 border-black bg-white">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300 border-2 border-black m-4">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-4xl font-black uppercase tracking-tighter text-black hover:bg-[#00ff00] px-4 py-2 border-2 border-transparent hover:border-black transition-all transform translate-y-4 opacity-0">
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
                username: 'DEV_NULL',
                navLinks: [
                    { label: 'Source', link: '#projects' },
                    { label: 'Stack', link: '#skills' },
                    { label: 'Changelog', link: '#experience' },
                    { label: 'Ping', link: '#contact' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="min-h-screen p-4 pt-34 border-b-2 border-black font-mono">
                    <div class="border-2 border-black h-full p-4 md:p-12 relative">
                        <div class="absolute top-0 left-0 bg-black text-white px-2 py-1 text-sm">index.html</div>
                        <div class="absolute top-0 right-0 p-2">
                             <span class="w-3 h-3 bg-red-500 rounded-full inline-block border border-black"></span>
                             <span class="w-3 h-3 bg-yellow-500 rounded-full inline-block border border-black"></span>
                             <span class="w-3 h-3 bg-green-500 rounded-full inline-block border border-black"></span>
                        </div>
                        
                        <div class="mt-20">
                            <p class="mb-4 text-gray-500">&lt;h1&gt;</p>
                            <h1 class="text-5xl md:text-8xl font-black uppercase mb-8 ml-4 md:ml-8 leading-tight">
                                {{{name}}}
                            </h1>
                            <p class="mb-8 text-gray-500">&lt;/h1&gt;</p>
                            
                            <p class="mb-4 text-gray-500">&lt;bio&gt;</p>
                            <p class="text-xl md:text-2xl ml-4 md:ml-8 max-w-3xl leading-relaxed">
                                {{heroTagline}}
                            </p>
                            <p class="mb-12 text-gray-500">&lt;/bio&gt;</p>
                            
                            <div class="flex flex-col md:flex-row gap-4 ml-4 md:ml-8">
                                <a href="#projects" class="inline-block border-2 border-black bg-white px-8 py-3 hover:bg-black hover:text-[#00ff00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                                </a>
                                <a href="{{cta.link}}" class="inline-block border-2 border-black bg-[#00ff00] px-8 py-3 hover:bg-[#00cc00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                                    {{cta.text}}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'FULL STACK<br/><span class="bg-[#00ff00] px-2 text-black">ENGINEER</span>',
                statusTag: 'Now Accepting Commissions',
                heroTagline: 'Building scalable systems with Go, Rust, and React. Obsessed with performance and memory safety.',
                cta: { text: "await contact()", link: '#contact' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'skills',
            type: 'skills',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="max-w-7xl mx-auto px-4 py-10 md:py-20 font-mono">
                    <h2 class="text-3xl font-bold border-b-2 border-black pb-2 mb-12">DEPENDENCIES</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {{#each skills}}
                        <div class="border-2 border-black p-4 hover:bg-[#00ff00] transition-colors cursor-crosshair">
                            <h3 class="font-bold text-lg mb-2">{{name}}</h3>
                            <div class="w-full bg-gray-200 h-2 border border-black rounded-none">
                                <div class="bg-black h-full" style="width: {{level}}%"></div>
                            </div>
                            <span class="text-xs mt-2 block">{{level}}%</span>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                skills: [
                    { name: 'TypeScript', level: 95 },
                    { name: 'Rust', level: 80 },
                    { name: 'Go', level: 85 },
                    { name: 'Docker', level: 90 },
                    { name: 'Kubernetes', level: 75 },
                    { name: 'AWS', level: 80 },
                    { name: 'GraphQL', level: 90 },
                    { name: 'Postgres', level: 85 }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'github-stats',
            type: 'stats',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="border-y-2 border-black bg-gray-100 py-12 px-4 font-mono overflow-x-auto">
                    <div class="max-w-5xl mx-auto">
                         <div class="text-xs mb-4">git commit -m "year in review"</div>
                         <!-- Mock GitHub contribution interaction -->
                         <div class="flex gap-1">
                            {{#each days}}
                                <div class="w-3 h-3 border border-black/20 {{this}}"></div>
                            {{/each}}
                         </div>
                         <div class="flex justify-between mt-4 text-sm font-bold">
                            <span>1,337 CONTRIBUTIONS IN THE LAST YEAR</span>
                            <span>LONGEST STREAK: 42 DAYS</span>
                         </div>
                    </div>
                </section>
            `,
            content: {
                days: Array(52 * 7).fill('').map(() => Math.random() > 0.5 ? 'bg-[#00ff00]' : 'bg-white')
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="max-w-7xl mx-auto px-4 py-10 md:py-20 font-mono" id="projects">
                     <h2 class="text-3xl font-bold border-b-2 border-black pb-2 mb-12">REPOSITORIES</h2>
                     <div class="space-y-8">
                        {{#each projects}}
                        <div class="border-2 border-black p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white relative">
                            <div class="absolute top-4 right-4 text-xs border border-black px-2 py-1 rounded-full">{{status}}</div>
                            <h3 class="text-2xl font-bold mb-2 flex items-center gap-2">
                                <i class="fas fa-folder text-yellow-500"></i> {{title}}
                            </h3>
                            <p class="text-gray-600 mb-6 max-w-xl">{{description}}</p>
                            
                            <div class="mb-6">
                                <span class="text-xs uppercase font-bold mb-2 block">Stack:</span>
                                <div class="flex gap-2">
                                    {{#each stack}}
                                    <span class="bg-gray-100 border border-black px-2 py-1 text-xs">{{this}}</span>
                                    {{/each}}
                                </div>
                            </div>
                            
                             <div class="flex gap-4 border-t-2 border-black/10 pt-4">
                                <a href="#" class="flex items-center gap-2 text-sm font-bold hover:underline"><i class="fab fa-github"></i> Source</a>
                                <a href="#" class="flex items-center gap-2 text-sm font-bold hover:underline"><i class="fas fa-external-link-alt"></i> Live Demo</a>
                            </div>
                        </div>
                        {{/each}}
                     </div>
                </section>
            `,
            content: {
                projects: [
                    { title: 'hyper-db', description: 'A lightweight, in-memory key-value store optimized for high concurrency.', status: 'Public', stack: ['Rust', 'Tokio', 'RocksDB'] },
                    { title: 'cloud-deploy-cli', description: 'Command line tool for seamless deployments to AWS ECS.', status: 'Beta', stack: ['Go', 'Cobra', 'AWS SDK'] },
                    { title: 'pixel-editor', description: 'Web-based sprite editor for game developers.', status: 'Live', stack: ['React', 'Canvas API', 'WASM'] }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'terminal',
            type: 'about',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="bg-[#1a1a1a] p-4 md:p-12 font-mono text-sm leading-6">
                    <div class="max-w-3xl mx-auto bg-black border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
                        <div class="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                             <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                             <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                             <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                             <div class="ml-4 text-gray-400">user@devbox:~</div>
                        </div>
                        <div class="p-6 text-green-400">
                            <div class="mb-4">
                                <span class="text-blue-400">user@devbox</span>:<span class="text-blue-200">~</span>$ cat about.txt
                            </div>
                            <div class="mb-4 text-gray-300">
                                {{terminalText}}
                            </div>
                             <div class="mb-4">
                                <span class="text-blue-400">user@devbox</span>:<span class="text-blue-200">~</span>$ ls -la interests/
                            </div>
                            <div class="mb-4 text-gray-300">
                                {{#each interests}}
                                drwxr-xr-x  {{this}}<br/>
                                {{/each}}
                            </div>
                             <div class="animate-pulse">
                                <span class="text-blue-400">user@devbox</span>:<span class="text-blue-200">~</span>$ _
                            </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                terminalText: "I am a software engineer with 6+ years of experience in distributed systems.\\nI believe in open source, rigorous code reviews, and tabs over spaces.\\nCurrently exploring WebAssembly and edge computing.",
                interests: ['keyboard-building', 'retro-gaming', 'coffee-brewing', 'linux-customization']
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'experience',
            type: 'experience',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="max-w-7xl mx-auto px-4 py-10 md:py-20 font-mono">
                    <h2 class="text-3xl font-bold border-b-2 border-black pb-2 mb-12">CHANGELOG</h2>
                    <div class="relative border-l-2 border-black ml-4 space-y-12 pl-8">
                        {{#each jobs}}
                        <div class="relative">
                            <div class="absolute -left-[41px] top-1 w-6 h-6 bg-white border-2 border-black rounded-full flex items-center justify-center">
                                <div class="w-2 h-2 bg-black rounded-full"></div>
                            </div>
                             <h3 class="text-xl font-bold">{{role}} @ {{company}}</h3>
                             <div class="text-sm text-gray-500 mb-4">{{period}}</div>
                             <ul class="list-disc list-inside space-y-2 text-sm max-w-2xl">
                                {{#each bullets}}
                                <li>{{this}}</li>
                                {{/each}}
                             </ul>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                jobs: [
                    { role: 'Senior Backend Engineer', company: 'TechCorp', period: '2022 - present', bullets: ['Migrated monolith to microservices using Go.', 'Reduced infrastructure costs by 40%.', 'Mentored junior developers.'] },
                    { role: 'Software Engineer', company: 'StartUp Inc', period: '2020 - 2022', bullets: ['Built core payment processing engine.', 'Implemented CI/CD pipelines.'] }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'blog',
            type: 'blog',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="bg-[#f0f0f0] border-y-2 border-black py-12 md:py-20 font-mono">
                    <div class="max-w-5xl mx-auto px-4">
                         <h2 class="text-3xl font-bold mb-12">LATEST_POSTS</h2>
                         <div class="space-y-4">
                            {{#each posts}}
                            <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-black/20 pb-4">
                                <div>
                                    <div class="text-xs text-gray-500 mb-1">{{date}}</div>
                                    <a href="#" class="text-xl font-bold hover:text-[#00ff00] hover:bg-black transition-colors">{{title}}</a>
                                </div>
                                <div class="text-xs border border-black px-2 rounded-full">{{tag}}</div>
                            </div>
                            {{/each}}
                         </div>
                    </div>
                </section>
            `,
            content: {
                posts: [
                    { title: 'Why I Switched from Python to Go', date: '2025-01-15', tag: 'Opinion' },
                    { title: 'Understanding Mutex Locks', date: '2024-12-22', tag: 'Tutorial' },
                    { title: 'My Vim Configuration', date: '2024-11-05', tag: 'Tools' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="max-w-4xl mx-auto px-4 py-16 md:py-32 font-mono text-center" id="contact">
                    <div class="border-2 border-black p-8 md:p-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                        <h2 class="text-4xl font-bold mb-8">{{title}}</h2>
                        <p class="mb-12">{{description}}</p>
                        
                        <form id="contact-form-{{id}}" class="max-w-md mx-auto space-y-6 text-left">
                             <div>
                                <label class="block text-xs font-bold uppercase mb-2">Identify</label>
                                <input type="text" id="name-{{id}}" placeholder="Your Name" required class="w-full bg-gray-50 border-2 border-black p-3 focus:outline-none focus:bg-[#00ff00]/20 font-bold" />
                             </div>
                             <div>
                                <label class="block text-xs font-bold uppercase mb-2">Subject</label>
                                <input type="text" id="subject-{{id}}" placeholder="Inquiry Type" required class="w-full bg-gray-50 border-2 border-black p-3 focus:outline-none focus:bg-[#00ff00]/20 font-bold" />
                             </div>
                             <div>
                                <label class="block text-xs font-bold uppercase mb-2">Payload</label>
                                <textarea id="message-{{id}}" rows="4" placeholder="Brief" required class="w-full bg-gray-50 border-2 border-black p-3 focus:outline-none focus:bg-[#00ff00]/20 font-bold resize-none"></textarea>
                             </div>
                             <button type="submit" class="w-full bg-black text-[#00ff00] font-bold uppercase py-4 hover:bg-[#00cc00] hover:text-black border-2 border-black transition-colors">
                                Execute
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
                                    window.open('mailto:{{email}}?subject=' + mailtoSubject + '&body=' + mailtoBody, '_blank', 'noopener,noreferrer');
                                });
                            }
                        })();
                    </script>
                </section>
            `,
            content: {
                title: "Ready to compile?",
                description: "I'm currently open for new opportunities. Send a packet.",
                email: 'dev@email.com'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="bg-black text-[#00ff00] p-8 md:p-12 text-center font-mono text-xs border-t-2 border-[#00ff00]">
                    <div class="mb-4 text-2xl font-bold">{{footerHeading}}</div>
                    <a target="_blank"
                            rel="noopener noreferrer" href="mailto:{{footerEmail}}" class="inline-block border border-[#00ff00] px-4 py-2 mb-8 hover:bg-[#00ff00] hover:text-black transition-colors">
                        {{footerEmail}}
                    </a>
                    <p>{{copyright}}</p>
                </footer>
            `,
            content: {
                footerHeading: 'EOF',
                footerEmail: 'dev@email.com',
                copyright: '© 2025 DEV_NULL. ALL RIGHTS RESERVED.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};
