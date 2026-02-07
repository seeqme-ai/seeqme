
export const STATS_AGENCY_TICKER = (content: any) => `
    <div data-section="stats" class="bg-black text-white py-8 border-y border-gray-800">
        <div class="flex flex-wrap justify-around text-center gap-8 px-6">
            ${content.stats?.map((stat: any) => `
            <div>
                <div class="text-4xl md:text-5xl font-black text-red-500 mb-1">${stat.value}</div>
                <div class="text-xs uppercase tracking-widest font-bold text-gray-400">${stat.label}</div>
            </div>
            `).join('') || ''}
        </div>
    </div>
`;

export const PROJ_AGENCY_CASE_STUDY = (content: any) => `
    <section data-section="projects" class="max-w-7xl mx-auto px-6 py-24 md:py-32" id="results">
         <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
                <div class="text-red-600 font-bold uppercase tracking-widest text-sm mb-4">Case Studies</div>
                <h2 class="text-4xl md:text-6xl font-black leading-tight text-gray-900" data-field="proj-title">
                    ${content.title || 'Proof is in<br/>the numbers.'}
                </h2>
            </div>
            <p class="text-lg text-gray-500 max-w-sm" data-field="proj-desc">
                ${content.desc || "I don't just make things look pretty. I focus on ROI, community growth, and tangible business outcomes."}
            </p>
         </div>
         
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${content.projects?.map((project: any) => `
            <div class="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div class="relative h-64 overflow-hidden">
                    <img src="${project.image}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold rounded-full text-red-600">
                        ${project.metric}
                    </div>
                </div>
                <div class="p-8">
                    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">${project.client}</div>
                    <h3 class="text-2xl font-bold mb-4 group-hover:text-red-600 transition-colors">${project.title}</h3>
                    <p class="text-gray-600 text-sm leading-relaxed">${project.desc}</p>
                    <div class="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between text-xs font-bold uppercase">
                        <span>Read Case Study</span>
                        <span class="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-red-600 transition-colors">&rarr;</span>
                    </div>
                </div>
            </div>
            `).join('') || ''}
         </div>
    </section>
`;

export const SERVICES_AGENCY_GRID = (content: any) => `
    <section data-section="services" class="bg-black text-white py-24 md:py-32 px-6">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-20">
                <h2 class="text-4xl md:text-5xl font-black mb-6" data-field="serv-title">${content.title || 'How I Can Help'}</h2>
                 <p class="text-xl text-gray-400 max-w-2xl mx-auto" data-field="serv-desc">${content.desc || 'Flexible engagement models designed for growth-stage businesses.'}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${content.services?.map((service: any) => `
                <div class="bg-gray-900 p-10 rounded-3xl border border-gray-800 hover:border-red-600 transition-colors relative group">
                    <div class="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-3xl mb-8 border border-gray-800 group-hover:text-red-500 transition-colors">
                        <i class="${service.icon}"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">${service.title}</h3>
                    <p class="text-gray-400 mb-8 leading-relaxed">${service.desc}</p>
                    <ul class="space-y-4 mb-8 text-sm font-medium text-gray-300">
                        ${service.features?.map((feature: string) => `
                        <li class="flex items-center gap-3"><i class="fas fa-check text-red-500"></i> <span>${feature}</span></li>
                        `).join('') || ''}
                    </ul>
                    <a href="#contact" target="_blank" rel="noopener" onclick="event.preventDefault()" class="block w-full py-4 bg-white text-black text-center font-bold rounded-xl hover:bg-red-600 hover:text-white transition-colors">Inquire Now</a>
                </div>
                `).join('') || ''}
            </div>
        </div>
    </section>
`;

export const TESTIMONIALS_AGENCY_QUOTES = (content: any) => `
    <section data-section="testimonials" class="py-24 px-6 bg-red-600 text-white">
         <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
            <div class="md:w-1/3">
                <h2 class="text-4xl font-black mb-6" data-field="test-title">${content.title || 'Client Love'}</h2>
                <p class="text-lg opacity-90" data-field="test-desc">${content.desc || "Don't just take my word for it. Here's what founders are saying."}</p>
                <div class="mt-8 flex gap-2 text-2xl">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </div>
            </div>
            <div class="md:w-2/3 grid gap-8">
                 ${content.testimonials?.map((t: any) => `
                 <blockquote class="bg-white text-black p-8 rounded-2xl shadow-xl last:bg-black/20 last:backdrop-blur-lg last:border last:border-white/20 last:text-white">
                    <p class="text-xl font-bold italic mb-6">"${t.quote}"</p>
                    <cite class="flex items-center gap-4 not-italic">
                        ${t.image ? `<img src="${t.image}" class="w-12 h-12 rounded-full border-2 border-red-100" />` : ''}
                        <div>
                            <div class="font-bold">${t.name}</div>
                            <div class="text-xs uppercase tracking-wide opacity-70">${t.role}</div>
                        </div>
                    </cite>
                 </blockquote>
                 `).join('') || ''}
            </div>
         </div>
    </section>
`;

export const SKILLS_AGENCY = (content: any) => `
    <section data-section="skills" class="py-20 px-6 text-center">
        <p class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8" data-field="skills-title">${content.title || 'My Tech Stack'}</p>
        <div class="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale">
            ${content.skills?.map((skill: any) => `
            <div class="flex flex-col items-center gap-2">
                 ${skill.icon ? `<i class="${skill.icon} text-4xl"></i>` : ''}
                 <span class="text-xl font-black font-sans">${skill.name}</span>
            </div>
            `).join('') || ''}
        </div>
    </section>
`;

export const FOOTER_AGENCY_BOLD = (content: any) => `
    <footer data-section="footer" class="bg-black text-white py-16 px-6 text-center">
         <h2 class="text-4xl md:text-6xl font-black mb-8" data-field="cta-text">${content.ctaText || 'Ready to grow?'}</h2>
         <a href="mailto:${content.email}" target="_blank" rel="noopener" class="text-2xl md:text-4xl text-red-500 hover:text-white transition-colors underline decoration-2 underline-offset-8" data-field="email">${content.email}</a>
         
         <div class="flex justify-center gap-8 mt-12 text-2xl">
            ${content.socials?.map((social: any) => `
            <a href="${social.url}" target="_blank" rel="noopener" class="hover:text-red-500"><i class="${social.icon}"></i></a>
            `).join('') || ''}
         </div>
         <div class="mt-16 text-gray-600 text-sm uppercase tracking-widest" data-field="copyright">
            &copy; ${content.year} ${content.copyright}.
         </div>
    </footer>
`;

export const LOGOS_MINIMAL_TRUST = (content: any) => `
    <section data-section="logos" class="py-12 border-y border-stone-200 bg-white">
        <p class="text-center text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">As seen in / Tools</p>
        <div class="flex flex-wrap justify-center gap-12 text-stone-400 grayscale opacity-70">
             ${content.partners?.map((p: any) => `
             <span class="text-xl font-bold flex items-center gap-2"><i class="${p.icon}"></i> ${p.name}</span>
             `).join('') || ''}
        </div>
    </section>
`;


export const SERVICES_MINIMAL_LIST = (content: any) => `
    <section data-section="services" class="py-24 px-6 bg-stone-900 text-stone-100" id="services">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-serif italic mb-4" data-field="serv-title">${content.title || 'My Services'}</h2>
                <p class="text-stone-400" data-field="serv-desc">${content.desc || 'Specialized support for high-performing individuals.'}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${content.services?.map((s: any) => `
                <div class="bg-stone-800 p-8 rounded-lg hover:bg-stone-700 transition-colors">
                    <h3 class="text-xl font-bold mb-4 font-serif">${s.title}</h3>
                    <p class="text-stone-400 text-sm mb-6 leading-relaxed">${s.desc}</p>
                    <ul class="space-y-2 text-sm text-stone-300">
                        ${s.bullets?.map((b: string) => `
                        <li class="flex items-center gap-2"><span class="text-stone-500">•</span> ${b}</li>
                        `).join('') || ''}
                    </ul>
                </div>
                `).join('') || ''}
            </div>
        </div>
    </section>
`;


export const PRICING_MINIMAL_CARDS = (content: any) => `
    <section data-section="pricing" class="py-24 px-6 bg-white border-t border-stone-100">
        <div class="max-w-5xl mx-auto">
             <h2 class="text-3xl font-serif text-center mb-16 italic" data-field="price-title">${content.title || 'Simple Pricing'}</h2>
             <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                 ${content.plans?.map((p: any) => `
                <div class="border border-stone-200 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow ${p.featured ? 'bg-stone-50 ring-2 ring-stone-900' : ''} relative">
                    ${p.featured ? '<div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900 text-white px-3 py-1 text-xs uppercase tracking-widest font-bold rounded-full">Best Value</div>' : ''}
                    <h3 class="font-bold text-lg mb-2">${p.name}</h3>
                    <div class="text-3xl font-serif mb-6">${p.price}<span class="text-sm font-sans text-stone-500">/mo</span></div>
                    <div class="text-sm text-stone-500 mb-8">${p.hours}</div>
                    <a href="#contact" target="_blank" rel="noopener" onclick="event.preventDefault()" class="block w-full py-3 border border-stone-900 rounded-lg font-bold hover:bg-stone-900 hover:text-white transition-colors">Select</a>
                </div>
                 `).join('') || ''}
             </div>
        </div>
    </section>
`;

export const TESTIMONIALS_MINIMAL_SINGLE = (content: any) => `
    <section data-section="testimonials" class="py-20 px-6 bg-[#fafaf9]">
        <div class="max-w-3xl mx-auto text-center">
            <i class="fas fa-quote-left text-4xl text-stone-300 mb-8"></i>
            ${content.testimonials?.map((t: any) => `
            <div class="mb-12 last:mb-0">
                <p class="text-2xl font-serif italic text-stone-800 mb-8 leading-relaxed">
                    "${t.quote}"
                </p>
                <div class="font-bold text-stone-900">${t.name}</div>
                <div class="text-sm text-stone-500">${t.role}</div>
            </div>
            `).join('') || ''}
        </div>
    </section>
`;

export const CONTACT_MINIMAL_SIMPLE = (content: any) => `
    <section data-section="contact" class="py-24 px-6 bg-stone-900 text-white text-center" id="contact">
        <h2 class="text-4xl font-serif italic mb-8" data-field="cta-heading">${content.ctaHeading || content.title || 'Let\'s Connect'}</h2>
        <p class="text-stone-400 mb-12 max-w-lg mx-auto" data-field="cta-sub">
            ${content.ctaSub || content.subtitle || 'Ready to start your project?'}
        </p>
        <form class="max-w-md mx-auto space-y-4 text-left">
            <div>
                <label class="text-xs uppercase font-bold tracking-widest text-stone-500 mb-2 block">Name</label>
                <input type="text" class="w-full bg-stone-800 border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-stone-500" />
            </div>
             <div>
                <label class="text-xs uppercase font-bold tracking-widest text-stone-500 mb-2 block">Email</label>
                <input type="email" class="w-full bg-stone-800 border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-stone-500" />
            </div>
            <button class="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-stone-200 transition-colors mt-4">Send Request</button>
        </form>
    </section>
`;

export const FOOTER_MINIMAL_SIMPLE = (content: any) => `
    <footer data-section="footer" class="py-12 text-center text-xs text-stone-400 bg-stone-900 border-t border-stone-800">
        <p>&copy; ${content.year} ${content.copyright}. All rights reserved.</p>
    </footer>
`;

export const AgencyMinimalRegistry = {
    STATS_AGENCY_TICKER,
    PROJ_AGENCY_CASE_STUDY,
    SERVICES_AGENCY_GRID,
    TESTIMONIALS_AGENCY_QUOTES,
    SKILLS_AGENCY,
    FOOTER_AGENCY_BOLD,
    LOGOS_MINIMAL_TRUST,
    SERVICES_MINIMAL_LIST,
    PRICING_MINIMAL_CARDS,
    TESTIMONIALS_MINIMAL_SINGLE,
    CONTACT_MINIMAL_SIMPLE,
    FOOTER_MINIMAL_SIMPLE
};
