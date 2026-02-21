import { Manifest } from "@/types";

export const STARTUP_LANDING: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Digital Freelancer',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'light',
        colorPalette: {
            primary: '#2563eb', // Blue
            secondary: '#1e293b', // Slate 800
            background: '#ffffff',
            surface: '#f8fafc', // Slate 50
            text: '#334155', // Slate 700
            heading: '#0f172a', // Slate 900
        },
        typography: {
            headingFont: 'Cabinet Grotesk',
            bodyFont: 'Satoshi',
            monoFont: 'JetBrains Mono',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'GEN_TEMPLATE',
            template: `
                <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 transition-all duration-300" id="main-header">
                    <div class="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                        <a href="#" class="font-black text-xl tracking-tight text-slate-900 uppercase">
                            {{username}}
                        </a>
                        <nav class="hidden md:flex items-center gap-8">
                            {{#each navLinks}}
                            <a href="{{link}}" class="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                                {{label}}
                            </a>
                            {{/each}}
                            <a href="#contact" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">Book Call</a>
                        </nav>
                        <button id="mobile-menu-btn-{{id}}" class="md:hidden text-slate-900 z-50 relative w-10 h-10 flex items-center justify-center">
                            <i class="fas fa-bars text-xl transition-all" id="menu-icon-{{id}}"></i>
                        </button>
                    </div>
                    <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                        {{#each navLinks}}
                        <a href="{{link}}" class="mobile-link text-2xl font-bold text-slate-900 hover:text-blue-600 transition-all transform translate-y-4 opacity-0">
                            {{label}}
                        </a>
                        {{/each}}
                        <a href="#contact" class="mobile-link text-2xl font-bold text-blue-600 opacity-0 translate-y-4 transition-all delay-100">Book Call</a>
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
                username: 'MARKETER.IO',
                navLinks: [
                    { label: 'Services', link: '#services' },
                    { label: 'Results', link: '#work' },
                    { label: 'FAQ', link: '#faq' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero',
            type: 'hero',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="pt-40 pb-20 px-6 max-w-6xl mx-auto text-center md:text-left">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                             <div class="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
                                <span class="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span> {{statusTag}}
                             </div>
                            <h1 class="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight leading-[1.1]">
                                {{{name}}}
                            </h1>
                            <p class="text-xl text-slate-500 mb-10 leading-relaxed">
                                {{{heroTagline}}}
                            </p>
                            <div class="flex flex-col sm:flex-row gap-4">
                                <a href="{{cta.link}}" class="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 text-center">
                                    {{cta.text}}
                                </a>
                                 <a href="#work" class="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl text-lg font-bold hover:bg-slate-50 transition-all text-center">
                                    View Casestudies
                                </a>
                            </div>
                            <div class="mt-8 flex items-center gap-4 text-sm text-slate-500 font-medium">
                                <div class="flex -space-x-2">
                                    <img src="https://i.pravatar.cc/100?u=1" class="w-8 h-8 rounded-full border-2 border-white" />
                                    <img src="https://i.pravatar.cc/100?u=2" class="w-8 h-8 rounded-full border-2 border-white" />
                                    <img src="https://i.pravatar.cc/100?u=3" class="w-8 h-8 rounded-full border-2 border-white" />
                                </div>
                                Trusted by 50+ Founders
                            </div>
                        </div>
                        <div class="relative">
                             <div class="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300 rounded-full blur-[50px] opacity-50"></div>
                             <div class="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-300 rounded-full blur-[80px] opacity-40"></div>
                             <div class="bg-white rounded-2xl shadow-2xl p-6 relative z-10 border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div class="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                    <div>
                                        <div class="text-xs text-slate-400 uppercase font-bold">Total Revenue</div>
                                        <div class="text-3xl font-black text-slate-900">$1,240,000</div>
                                    </div>
                                    <div class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">+127%</div>
                                </div>
                                <div class="space-y-4">
                                    <div class="flex justify-between text-sm">
                                        <span class="text-slate-500">Ad Spend</span>
                                        <span class="font-bold text-slate-900">$200,500</span>
                                    </div>
                                    <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div class="bg-blue-600 h-full w-[25%]"></div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </section>
            `,
            content: {
                name: 'I build funnels that <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">print money.</span>',
                statusTag: 'Available for new projects',
                heroTagline: "Hi, I'm Dave. I help SaaS companies and Consultants scale their paid traffic without burning cash.",
                cta: { text: "Book Strategy Call", link: '#contact' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'logos',
            type: 'logos',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-10 border-b border-slate-100 bg-slate-50/50">
                    <div class="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">{{title}}</div>
                    <div class="flex flex-wrap justify-center gap-12 md:gap-20 grayscale opacity-40 px-6">
                        {{#each logos}}
                        <span class="text-xl font-black font-sans">{{this}}</span>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                title: 'Trusted by innovative teams',
                logos: ['METRIC', 'FLOW', 'GHOST', 'SYNTH', 'QUANT']
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'services',
            type: 'services',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-6xl mx-auto" id="services">
                    <div class="text-center mb-16">
                        <h2 class="text-3xl font-bold text-slate-900 mb-4">How I can help you</h2>
                        <p class="text-slate-500 max-w-lg mx-auto">I don't do "general marketing". I specialize in three things.</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {{#each services}}
                        <div class="p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6">
                                {{icon}}
                            </div>
                            <h3 class="text-xl font-bold text-slate-900 mb-3">{{title}}</h3>
                            <p class="text-slate-500 text-sm leading-relaxed mb-6">{{desc}}</p>
                            <a href="#contact" class="text-blue-600 font-bold text-sm hover:underline">Learn more &rarr;</a>
                        </div>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                services: [
                    { title: 'Paid Ads Management', desc: 'Facebook, Instagram, and LinkedIn ads that actually convert cold traffic.', icon: '🎯' },
                    { title: 'Funnel Building', desc: 'High-converting landing pages and email sequences designed to sell.', icon: '🏗️' },
                    { title: 'Conversion Audit', desc: 'Deep dive into your analytics to find where you are leaking money.', icon: '🔍' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'work',
            type: 'projects',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 bg-slate-900 text-white" id="work">
                    <div class="max-w-6xl mx-auto">
                        <div class="flex justify-between items-end mb-16">
                             <h2 class="text-3xl font-bold">Recent Wins</h2>
                             <a href="#" class="text-slate-400 hover:text-white transition-colors text-sm font-bold">View Portfolio &rarr;</a>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {{#each cases}}
                            <div class="group cursor-pointer">
                                <div class="bg-slate-800 rounded-xl overflow-hidden mb-6 border border-slate-700 aspect-video relative">
                                    <img src="{{image}}" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                    <div class="absolute bottom-4 right-4 bg-green-500 text-black px-3 py-1 text-xs font-bold rounded-full">
                                        {{result}}
                                    </div>
                                </div>
                                <h3 class="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{{client}}</h3>
                                <p class="text-slate-400 text-sm">{{desc}}</p>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </section>
            `,
            content: {
                cases: [
                    { client: 'SaaS Platform', desc: 'Reduced CAC by 40% while scaling spend to $50k/mo.', result: '40% Lower CAC', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800' },
                    { client: 'Coaching Business', desc: 'Generated $250k in webinar sales in 30 days.', result: '$250k Revenue', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'testimonials',
            type: 'testimonials',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-24 px-6 max-w-4xl mx-auto text-center" id="testimonials">
                    <h2 class="text-3xl font-bold mb-16">{{title}}</h2>
                    <div class="bg-blue-50 p-12 rounded-[2rem] relative">
                         <i class="fas fa-quote-left text-4xl text-blue-200 absolute top-8 left-8"></i>
                         <p class="text-2xl font-medium text-slate-800 leading-relaxed mb-8 relative z-10">
                            "{{quote}}"
                         </p>
                         <div class="flex items-center justify-center gap-4">
                            <img src="{{authorImage}}" class="w-12 h-12 rounded-full" />
                            <div class="text-left">
                                <div class="font-bold text-slate-900">{{authorName}}</div>
                                <div class="text-xs text-slate-500 uppercase tracking-wide">{{authorRole}}</div>
                            </div>
                         </div>
                    </div>
                </section>
            `,
            content: {
                title: 'What founders say',
                quote: 'The team at Marketer.io completely transformed our growth engine. We went from burning cash to profitable scaling in under 60 days.',
                authorName: 'Sarah Jenkins',
                authorRole: 'CEO, TechFlow',
                authorImage: 'https://i.pravatar.cc/100?u=sarah'
            },
            settings: { isVisible: true, padding: 'none' }
        },

        {
            id: 'faq',
            type: 'faq',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-20 px-6 max-w-2xl mx-auto" id="faq">
                    <h2 class="text-2xl font-bold mb-8">FAQ</h2>
                    <div class="space-y-6">
                        {{#each faqs}}
                        <details class="group border-b border-slate-200 pb-4">
                            <summary class="flex justify-between items-center font-bold cursor-pointer list-none text-slate-900">
                                {{q}}
                                <span class="bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center text-xs group-open:rotate-45 transition-transform">+</span>
                            </summary>
                            <p class="mt-4 text-slate-600 leading-relaxed text-sm">{{a}}</p>
                        </details>
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                faqs: [
                    { q: 'Do you offer refunds?', a: 'For the audit, yes. If you don\'t find value, I refund 100%.' },
                    { q: 'How fast can we start?', a: 'I typically have a 2-week waitlist. Book a call to secure your spot.' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact',
            type: 'contact',
            componentId: 'GEN_TEMPLATE',
            template: `
                <section class="py-32 px-6" id="contact">
                    <div class="max-w-4xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/40">
                         <div class="relative z-10">
                            <h2 class="text-4xl md:text-5xl font-bold mb-6">{{title}}</h2>
                            <p class="text-xl text-blue-100 mb-12">{{description}}</p>
                             <form id="contact-form-{{id}}" class="max-w-md mx-auto space-y-4">
                                <input type="email" id="email-{{id}}" placeholder="Enter your email" required class="w-full px-6 py-4 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-400" />
                                <button type="submit" class="w-full px-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Book Strategy Call</button>
                             </form>
                             <p class="mt-6 text-sm text-blue-200">Or email me at <a target="_blank" rel="noopener noreferrer" href="mailto:{{email}}" class="underline hover:text-white">{{email}}</a></p>
                         </div>
                    </div>
                    <script>
                        (function() {
                            const form = document.getElementById('contact-form-{{id}}');
                            if (form) {
                                form.addEventListener('submit', function(e) {
                                    e.preventDefault();
                                    const email = document.getElementById('email-{{id}}').value;
                                    const subject = 'Strategy Call Request';
                                    const mailtoSubject = encodeURIComponent(subject);
                                    const mailtoBody = encodeURIComponent('I would like to book a strategy call.\r\n\r\nMy Email: ' + email);
                                    window.open('mailto:{{email}}?subject=' + mailtoSubject + '&body=' + mailtoBody, '_blank', 'noopener,noreferrer');
                                });
                            }
                        })();
                    </script>
                </section>
            `,
            content: {
                title: 'Ready to scale?',
                description: "Let's see if we're a good fit. No pressure sales.",
                email: 'dave@marketer.io'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'GEN_TEMPLATE',
            template: `
                <footer class="py-12 text-center text-slate-400 text-sm">
                    <div class="mb-4 text-slate-900 font-bold uppercase">{{footerHeading}}</div>
                    <p>{{copyright}}</p>
                    <a target="_blank"
                           rel="noopener noreferrer" href="mailto:{{footerEmail}}" class="block mt-2 hover:text-blue-600 transition-colors">{{footerEmail}}</a>
                </footer>
            `,
            content: {
                footerHeading: 'MARKETER.IO',
                copyright: '© 2025 Marketer.io. All rights reserved.',
                footerEmail: 'dave@marketer.io'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};
