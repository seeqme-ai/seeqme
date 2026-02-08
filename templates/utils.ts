
/**
 * UTILITY: CLIENT-SIDE HTML GENERATOR (ROBUST FALLBACK)
 */
export const generateTemplateHTML = (
    layout: string,
    niche: string,
    theme: "dark" | "light",
    content: any
): string => {
    
    const isDark = theme === "dark";
    const bg = isDark ? "bg-slate-900" : "bg-white";
    const text = isDark ? "text-slate-100" : "text-slate-900";
    const accent = isDark ? "text-teal-400" : "text-teal-600";
    const surface = isDark ? "bg-slate-800" : "bg-slate-50";
    const border = isDark ? "border-slate-700" : "border-slate-200";

    // Common Header/Nav (Injected based on layout)
    const navLinks = (content.sections || ['about', 'projects', 'contact'])
        .map((s: string) => `<a href="#${s}" class="hover:${accent} transition-colors capitalize">${s}</a>`)
        .join('');

    // 1. HERO SECTION GENERATOR
    const heroSection = `
     <header class="min-h-[80vh] flex flex-col justify-center ${layout === 'SIDEBAR_NAVI' ? '' : 'items-center text-center'} px-6 relative overflow-hidden">
       ${layout !== 'SIDEBAR_NAVI' ? `<nav class="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
          <span class="font-bold text-xl tracking-tighter">${content.hero?.name || 'Portfolio'}</span>
          <div class="space-x-6 text-sm font-medium hidden md:block">${navLinks}</div>
       </nav>` : ''}
       
       <div class="relative z-10 max-w-4xl animate-fade-in-up">
         ${content.hero?.image ? `<img src="${content.hero.image}" class="w-32 h-32 rounded-full object-cover mb-8 ${layout === 'SIDEBAR_NAVI' ? '' : 'mx-auto'} border-4 ${border}" alt="Profile" />` : ''}
         <h1 class="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
           ${content.hero?.title || 'Creator'}
         </h1>
         <p class="text-xl md:text-2xl opacity-80 max-w-2xl ${layout === 'SIDEBAR_NAVI' ? '' : 'mx-auto'} mb-10 leading-relaxed">
           ${content.hero?.bio || 'Building things for the web.'}
         </p>
         <div class="flex gap-4 ${layout === 'SIDEBAR_NAVI' ? '' : 'justify-center'}">
           <a href="${content.hero?.ctaLink || '#contact'}" class="px-8 py-4 rounded-full bg-teal-600 text-white font-bold hover:bg-teal-500 transition-all transform hover:scale-105 shadow-lg shadow-teal-500/25">
             ${content.hero?.ctaText || 'Get in Touch'}
           </a>
           ${content.socials?.[0]?.url ? `<a href="${content.socials[0].url}" target="_blank" class="px-8 py-4 rounded-full border ${border} hover:${surface} font-medium transition-all">Social</a>` : ''}
         </div>
       </div>
     </header>
   `;

    // 2. CONTENT SECTIONS GENERATOR
    let mainContent = '';

    // About
    if (content.about) {
        mainContent += `
       <section id="about" class="py-24 px-6">
         <div class="max-w-3xl ${layout === 'SIDEBAR_NAVI' ? '' : 'mx-auto'}">
           <h2 class="text-3xl font-bold mb-8 flex items-center gap-3">
             <span class="${accent}">01.</span> About
           </h2>
           <div class="prose ${isDark ? 'prose-invert' : ''} prose-lg">
             <p>${content.about.summary || ''}</p>
           </div>
           
           ${content.skills ? `
             <div class="mt-12">
               <h3 class="text-sm font-bold uppercase tracking-wider opacity-60 mb-6">Technologies</h3>
               <div class="flex flex-wrap gap-3">
                 ${content.skills.map((s: string) => `<span class="px-4 py-2 rounded-lg ${surface} border ${border} text-sm font-medium">${s}</span>`).join('')}
               </div>
             </div>
           ` : ''}
         </div>
       </section>
     `;
    }

    // Projects
    if (content.projects?.length) {
        const projectCards = content.projects.map((p: any) => `
       <article class="group relative rounded-3xl overflow-hidden ${surface} border ${border} transition-all hover:-translate-y-1 hover:shadow-xl">
         <div class="aspect-video overflow-hidden bg-slate-200 dark:bg-slate-700">
            ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="${p.title}" />` : ''}
         </div>
         <div class="p-8">
           <h3 class="text-xl font-bold mb-3">${p.title}</h3>
           <p class="opacity-70 text-sm leading-relaxed mb-6 line-clamp-3">${p.description}</p>
           <div class="flex flex-wrap gap-2 mb-6">
              ${p.technologies ? p.technologies.split(',').map((t: string) => `<span class="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 opacity-75">${t.trim()}</span>`).join('') : ''}
           </div>
           <a href="${p.link || '#'}" class="inline-flex items-center text-sm font-bold ${accent} hover:underline">
             View Project <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
           </a>
         </div>
       </article>
     `).join('');

        mainContent += `
       <section id="projects" class="py-24 px-6 ${isDark ? 'bg-white/5' : 'bg-slate-100'}">
         <div class="max-w-7xl ${layout === 'SIDEBAR_NAVI' ? '' : 'mx-auto'}">
           <h2 class="text-3xl font-bold mb-12 flex items-center gap-3">
             <span class="${accent}">02.</span> Selected Work
           </h2>
           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             ${projectCards}
           </div>
         </div>
       </section>
     `;
    }

    // Work History
    if (content.workHistory?.length) {
        const workHistoryItems = content.workHistory
            .map(
                (w: any) => `
       <article class="${surface} border ${border} p-6 rounded-lg transition-all hover:shadow-md">
         <h3 class="text-lg font-bold mb-1" data-field="position">${w.position}</h3>
         <p class="text-sm opacity-80 mb-2" data-field="company">${w.company}</p>
         <p class="text-xs ${accent} font-medium mb-3" data-field="period">${w.period}</p>
         <p class="text-sm opacity-70" data-field="description">${w.description}</p>
       </article>
     `
            )
            .join("");

        mainContent += `
       <section id="workHistory" class="py-24 px-6">
         <div class="max-w-7xl ${layout === "SIDEBAR_NAVI" ? "" : "mx-auto"}">
           <h2 class="text-3xl font-bold mb-12 flex items-center gap-3">
             <span class="${accent}">03.</span> Work History
           </h2>
           <div id="experience-list" class="grid grid-cols-1 md:grid-cols-2 gap-8">
             ${workHistoryItems}
           </div>
         </div>
       </section>
     `;
    }

    // Education
    if (content.education?.length) {
        const educationItems = content.education
            .map(
                (e: any) => `
       <article class="${surface} border ${border} p-6 rounded-lg transition-all hover:shadow-md">
         <h3 class="text-lg font-bold mb-1" data-field="school">${e.school}</h3>
         <p class="text-sm opacity-80 mb-2" data-field="degree">${e.degree}</p>
         <p class="text-xs ${accent} font-medium" data-field="year">${e.year}</p>
         ${e.description
                        ? `<p class="text-sm opacity-70 mt-3" data-field="description">${e.description}</p>`
                        : ""
                    }
       </article>
     `
            )
            .join("");

        mainContent += `
       <section id="education" class="py-24 px-6 ${isDark ? "bg-white/5" : "bg-slate-100"
            }">
         <div class="max-w-7xl ${layout === "SIDEBAR_NAVI" ? "" : "mx-auto"}">
           <h2 class="text-3xl font-bold mb-12 flex items-center gap-3">
             <span class="${accent}">04.</span> Education
           </h2>
           <div id="education-list" class="grid grid-cols-1 md:grid-cols-2 gap-8">
             ${educationItems}
           </div>
         </div>
       </section>
     `;
    }

    // Certifications
    if (content.certifications?.length) {
        const certificationItems = content.certifications
            .map(
                (c: any) => `
       <article class="${surface} border ${border} p-6 rounded-lg transition-all hover:shadow-md">
         <h3 class="text-lg font-bold mb-1" data-field="name">${c.name}</h3>
         <p class="text-sm opacity-80 mb-2" data-field="issuer">${c.issuer}</p>
         <p class="text-xs ${accent} font-medium" data-field="year">${c.year}</p>
       </article>
     `
            )
            .join("");

        mainContent += `
       <section id="certifications" class="py-24 px-6">
         <div class="max-w-7xl ${layout === "SIDEBAR_NAVI" ? "" : "mx-auto"}">
           <h2 class="text-3xl font-bold mb-12 flex items-center gap-3">
             <span class="${accent}">05.</span> Certifications
           </h2>
           <div id="certifications-list" class="grid grid-cols-1 md:grid-cols-2 gap-8">
             ${certificationItems}
           </div>
         </div>
       </section>
     `;
    }

    // Blog (Posts)
    if (content.blog?.posts?.length) {
        const blogItems = content.blog.posts
            .map(
                (b: any) => `
       <article class="${surface} border ${border} p-6 rounded-lg transition-all hover:shadow-md">
         ${b.image
                        ? `<img src="${b.image}" data-field="image" class="w-full h-40 object-cover rounded-md mb-4" alt="${b.title}" />`
                        : ""
                    }
         <h3 class="text-lg font-bold mb-1" data-field="title">${b.title}</h3>
         <p class="text-sm opacity-80 mb-2" data-field="excerpt">${b.excerpt}</p>
         <p class="text-xs ${accent} font-medium" data-field="date">${b.date}</p>
         <a href="${b.link || "#"
                    }" class="inline-flex items-center text-sm font-bold ${accent} hover:underline" data-field="link">Read More</a>
       </article>
     `
            )
            .join("");

        mainContent += `
       <section id="blog" class="py-24 px-6 ${isDark ? "bg-white/5" : "bg-slate-100"
            }">
         <div class="max-w-7xl ${layout === "SIDEBAR_NAVI" ? "" : "mx-auto"}">
           <h2 class="text-3xl font-bold mb-12 flex items-center gap-3">
             <span class="${accent}">06.</span> ${content.blog.title || "Blog"}
           </h2>
           <div id="blog-posts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             ${blogItems}
           </div>
         </div>
       </section>
     `;
    }

    // Testimonials
    if (content.testimonials?.length) {
        const testimonialItems = content.testimonials
            .map(
                (t: any) => `
       <article class="${surface} border ${border} p-6 rounded-lg transition-all hover:shadow-md">
         <p class="text-lg italic mb-4" data-field="text">"${t.content}"</p>
         <h3 class="font-bold" data-field="author">${t.author}</h3>
         <p class="text-sm opacity-80" data-field="role">${t.role}</p>
       </article>
     `
            )
            .join("");

        mainContent += `
       <section id="testimonials" class="py-24 px-6">
         <div class="max-w-7xl ${layout === "SIDEBAR_NAVI" ? "" : "mx-auto"}">
           <h2 class="text-3xl font-bold mb-12 flex items-center gap-3">
             <span class="${accent}">07.</span> Testimonials
           </h2>
           <div id="testimonials-list" class="grid grid-cols-1 md:grid-cols-2 gap-8">
             ${testimonialItems}
           </div>
         </div>
       </section>
     `;
    }

    // Contact
    if (content.contact) {
        mainContent += `
       <section id="contact" class="py-24 px-6 ${isDark ? "bg-white/5" : "bg-slate-100"
            }">
         <div class="max-w-3xl ${layout === "SIDEBAR_NAVI" ? "" : "mx-auto"
            } text-center">
           <h2 class="text-3xl font-bold mb-8 flex items-center gap-3 ${layout === "SIDEBAR_NAVI" ? "" : "justify-center"
            }">
             <span class="${accent}">08.</span> Contact
           </h2>
           <p class="text-xl opacity-80 mb-8" data-field="contact-bio">${content.contact.bio ||
            "Feel free to reach out for collaborations or just a chat!"
            }</p>
           <a href="mailto:${content.contact.email
            }" class="text-2xl font-bold ${accent} hover:underline" data-field="contact-email">${content.contact.email
            }</a>
           ${content.contact.phone
                ? `<p class="text-lg opacity-80 mt-4" data-field="contact-phone">${content.contact.phone}</p>`
                : ""
            }
           ${content.contact.location
                ? `<p class="text-lg opacity-80" data-field="contact-location">${content.contact.location}</p>`
                : ""
            }
         </div>
       </section>
     `;
    }

    // Socials
    if (content.socials?.length) {
        const socialLinks = content.socials
            .map(
                (s: any) => `
       <a href="${s.url
                    }" target="_blank" class="text-2xl ${accent} hover:opacity-70 transition-opacity" data-field="url">
         <i class="fab fa-${s.platform.toLowerCase()}"></i>
       </a>
     `
            )
            .join("");

        mainContent += `
       <section id="socials" class="py-12 px-6 text-center">
         <div class="max-w-7xl ${layout === "SIDEBAR_NAVI" ? "" : "mx-auto"}">
           <div id="socials-list" class="flex justify-center gap-6">
             ${socialLinks}
           </div>
         </div>
       </section>
     `;
    }

    // 3. LAYOUT WRAPPERS
    let bodyContent = '';

    if (layout === 'SIDEBAR_NAVI') {
        bodyContent = `
       <div class="flex flex-col lg:flex-row min-h-screen">
         <aside class="lg:w-80 lg:h-screen lg:fixed top-0 left-0 ${surface} border-r ${border} p-8 flex flex-col justify-between z-50">
            <div>
              <div class="font-bold text-2xl tracking-tighter mb-12">${content.hero?.name?.split(' ')[0] || 'Portfolio'}.</div>
              <nav class="space-y-4 flex flex-col items-start">
                ${navLinks.replace(/class="/g, 'class="text-lg font-medium opacity-70 hover:opacity-100 transition-opacity ')}
              </nav>
            </div>
            <div class="text-xs opacity-40">
              &copy; ${new Date().getFullYear()} ${content.hero?.name || 'Creator'}
            </div>
         </aside>
         <main class="lg:pl-80 w-full relative">
            ${heroSection}
            ${mainContent}
         </main>
       </div>
     `;
    } else {
        // Default / Minimal / Vertical
        bodyContent = `
       <main class="relative">
         ${heroSection}
         ${mainContent}
         <footer class="py-12 text-center opacity-40 text-sm border-t ${border} mt-24">
           <p>&copy; ${new Date().getFullYear()} ${content.hero?.name}. Built with SeeqMe.</p>
         </footer>
       </main>
     `;
    }

    return `
 <!DOCTYPE html>
 <html lang="en" class="scroll-smooth">
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>${content.hero?.name || niche} - Portfolio</title>
     <script src="https://cdn.tailwindcss.com"></script>
     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
     <script>
       tailwind.config = {
         theme: {
           extend: {
             fontFamily: {
               sans: ['Inter', 'sans-serif'],
               display: ['Playfair Display', 'serif'],
             },
             animation: {
               'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
             },
             keyframes: {
               fadeInUp: {
                 '0%': { opacity: '0', transform: 'translateY(20px)' },
                 '100%': { opacity: '1', transform: 'translateY(0)' },
               }
             }
           }
         }
       }
     </script>
     <style>
       body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
       h1, h2, h3 { font-family: ${layout === 'ELEGANT_SPLIT' ? "'Playfair Display', serif" : "'Inter', sans-serif"}; }
     </style>
 </head>
 <body class="${bg} ${text} antialiased selection:bg-teal-500 selection:text-white">
     ${bodyContent}
 </body>
 </html>`;
};

