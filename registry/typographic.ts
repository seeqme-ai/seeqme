
// TYPOGRAPHIC BOLD COMPONENTS

export const HERO_TYPOGRAPHIC_BOLD = (content: any) => `
    <section id="hero" data-section="hero" class="min-h-screen px-6 py-20 flex flex-col justify-between border-b-2 border-black">
         <nav class="flex justify-between items-center mb-20">
            <div class="font-bold tracking-tight" data-field="nav-logo">${content.logo || 'ALEX.CONTENT'}</div>
         </nav>
         
         <div class="max-w-5xl">
            <h1 class="text-6xl md:text-8xl font-serif font-medium leading-none mb-12 tracking-tight" data-field="hero-heading">
                ${content.heading || 'Words that build'}<br/>
                <span class="italic">${content.highlight || 'communities.'}</span>
            </h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-200 pt-12">
                <div class="space-y-8">
                    <p class="text-xl leading-relaxed text-gray-600" data-field="hero-bio">
                        ${content.bio}
                    </p>
                    ${content.image ? `<img src="${content.image}" class="w-full h-auto rounded-lg shadow-sm" data-field="hero-image" />` : ''}
                </div>
                <div class="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest">
                    ${content.services?.map((s: string) => `<span><i class="fas fa-check mr-2"></i> ${s}</span>`).join('') || ''}
                </div>
            </div>
         </div>
    </section>
`;

export const STATS_TYPOGRAPHIC_GRID = (content: any) => `
    <div id="stats" data-section="stats" class="grid grid-cols-2 md:grid-cols-4 border-b-2 border-black divide-x-2 divide-black">
         ${content.stats?.map((stat: any) => `
         <div class="p-12 hover:bg-black hover:text-white transition-colors group">
            <div class="text-5xl font-serif mb-2 group-hover:italic">${stat.value}</div>
            <div class="text-xs uppercase tracking-widest font-bold">${stat.label}</div>
         </div>
         `).join('') || ''}
    </div>
`;

export const PROJ_TYPOGRAPHIC_LIST = (content: any) => `
    <section id="projects" data-section="projects" class="border-b-2 border-black">
         <div class="p-6 border-b border-gray-200">
            <h2 class="text-sm font-bold uppercase tracking-widest" data-field="proj-heading">${content.heading || 'Selected Stories'}</h2>
         </div>
         
         ${content.projects?.map((project: any) => `
         <div class="group grid grid-cols-1 md:grid-cols-12 gap-8 p-12 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
            <div class="md:col-span-3 text-sm text-gray-500 font-serif italic">${project.year}</div>
            <div class="md:col-span-6">
                <h3 class="text-3xl font-serif font-medium mb-4 group-hover:underline decoration-1 underline-offset-4">${project.title}</h3>
                <p class="text-gray-600 leading-relaxed mb-6 max-w-xl">${project.desc}</p>
                <div class="flex gap-4 text-xs font-bold uppercase tracking-widest">
                    ${project.tags?.map((tag: string) => `<span class="bg-gray-200 px-2 py-1">${tag}</span>`).join('') || ''}
                </div>
            </div>
            <div class="md:col-span-3 flex items-center justify-end">
                 <img src="${project.image}" class="w-full aspect-[4/3] object-cover grayscale opacity-0 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 shadow-xl rotate-3 group-hover:rotate-0" />
            </div>
         </div>
         `).join('') || ''}
    </section>
`;

export const PROCESS_TYPOGRAPHIC_STEPS = (content: any) => `
    <section id="process" data-section="process" class="py-24 px-6 max-w-4xl mx-auto">
        <h2 class="text-4xl font-serif font-medium mb-16 text-center" data-field="process-heading">${content.heading || 'My Methodology'}</h2>
        <div class="space-y-12">
            ${content.steps?.map((step: any, i: number) => `
            <div class="flex flex-col md:flex-row gap-8 items-start">
                 <div class="text-6xl font-serif text-gray-200 font-bold leading-none">0${i + 1}</div>
                 <div>
                    <h3 class="text-xl font-bold uppercase tracking-widest mb-4">${step.title}</h3>
                    <p class="text-lg text-gray-600 leading-relaxed">${step.desc}</p>
                 </div>
            </div>
            `).join('') || ''}
        </div>
    </section>
`;

export const SERVICES_TYPOGRAPHIC_COLS = (content: any) => `
    <section id="services" data-section="services" class="bg-[#f5f5f5] py-24 px-6 border-y-2 border-black">
         <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            ${content.services?.map((service: any) => `
            <div class="border-t-2 border-black pt-6">
                <h3 class="text-2xl font-serif font-bold mb-4">${service.title}</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                    ${service.items?.map((item: string) => `<li>• ${item}</li>`).join('') || ''}
                </ul>
            </div>
            `).join('') || ''}
         </div>
    </section>
`;

export const CONTACT_TYPOGRAPHIC_CENTER = (content: any) => `
    <section data-section="contact" class="py-32 px-6 text-center" id="contact">
        <h2 class="text-5xl md:text-7xl font-serif mb-12" data-field="contact-heading">${content.heading || "Let's tell your story."}</h2>
        <a target="_blank" rel="noopener noreferrer" href="mailto:${content.email}" class="inline-block bg-black text-white px-12 py-5 rounded-full text-lg font-bold tracking-widest hover:scale-105 transition-transform" data-field="contact-cta">${content.ctaText || 'Get in Touch'}</a>
    </section>
`;

export const FOOTER_TYPOGRAPHIC_SIMPLE = (content: any) => `
    <footer data-section="footer" class="border-t-2 border-black py-12 px-6 flex flex-col md:flex-row justify-between items-center text-sm font-bold uppercase tracking-widest gap-6">
        <div data-field="footer-copy">© ${content.year || '2025'} ${content.company || 'Alex Content'}</div>
        <div class="space-x-8">
            ${content.links?.map((link: any) => `<a href="${link.url}" target="_blank" rel="noopener" class="hover:underline">${link.label}</a>`).join('') || ''}
        </div>
    </footer>
`;

export const TypographicRegistry = {
    HERO_TYPOGRAPHIC_BOLD,
    STATS_TYPOGRAPHIC_GRID,
    PROJ_TYPOGRAPHIC_LIST,
    PROCESS_TYPOGRAPHIC_STEPS,
    SERVICES_TYPOGRAPHIC_COLS,
    CONTACT_TYPOGRAPHIC_CENTER,
    FOOTER_TYPOGRAPHIC_SIMPLE
};
