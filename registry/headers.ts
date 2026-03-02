
export const HEADER_MINIMALIST = (content: any) => `
    <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)] border-b border-[var(--text)]/10 transition-all duration-300" id="main-header">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="#" class="text-xl font-serif font-bold text-[var(--heading)] tracking-wide">
                ${content.username || content.name || 'Portfolio'}
            </a>
            <nav class="hidden md:flex items-center gap-8">
                ${(content.navLinks || []).map((nav: any) => `
                <a href="${nav.link}" class="text-xs font-bold uppercase tracking-widest text-[var(--text)] hover:text-[var(--primary)] transition-colors">
                    ${nav.label}
                </a>
                `).join('')}
                ${content.cta ? `
                <a href="${content.cta.link}" class="px-6 py-2 bg-[var(--primary)] text-[var(--bg)] text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm">
                    ${content.cta.text}
                </a>
                ` : ''}
            </nav>
            <button id="mobile-menu-btn-min" class="md:hidden text-[var(--text)] z-50 relative w-10 h-10 flex items-center justify-center">
                <i class="fas fa-bars text-xl transition-all" id="menu-icon-min"></i>
            </button>
        </div>
        <div id="mobile-menu-min" data-mobile-menu class="fixed inset-0 bg-[var(--bg)] z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
            ${(content.navLinks || []).map((nav: any) => `
            <a href="${nav.link}" class="mobile-link text-2xl font-serif text-[var(--heading)] hover:text-[var(--primary)] transition-all transform translate-y-4 opacity-0">
                ${nav.label}
            </a>
            `).join('')}
        </div>
        <script>
            (function() {
                const btn = document.getElementById('mobile-menu-btn-min');
                const menu = document.getElementById('mobile-menu-min');
                const icon = document.getElementById('menu-icon-min');
                const links = menu ? menu.querySelectorAll('.mobile-link') : [];
                let isOpen = false;
                if (btn && menu) {
                    btn.dataset.menuBound = '1';
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
                }
            })();
        </script>
    </header>
`;

export const HEADER_AGENCY_VIBRANT = (content: any) => `
    <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--surface)] md:bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--text)]/5 transition-all duration-300" id="main-header" style="background-color: var(--surface);">
        <div class="max-w-7xl mx-auto px-6 h-16 md:h-24 flex items-center justify-between">
            <a href="#home" class="text-2xl font-black uppercase tracking-wider text-[var(--heading)] hover:text-[var(--primary)] transition-colors relative z-50">
                ${content.username || content.name || 'AGENCY'}
            </a>
            <nav class="hidden md:flex items-center gap-10">
                ${(content.navLinks || []).map((nav: any) => `
                <a href="${nav.link || '#home'}" class="text-sm font-bold text-[var(--text)] hover:text-[var(--primary)] font-sans uppercase tracking-widest transition-colors relative group">
                    ${nav.label}
                    <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
                </a>
                `).join('')}
                <a href="${content.cta?.link || '#contact'}" class="bg-[var(--heading)] text-[var(--bg)] px-8 py-3 rounded-full text-xs font-bold uppercase hover:bg-[var(--primary)] transition-all transform hover:-translate-y-1 shadow-lg">
                    ${content.cta?.text || 'Start Project'}
                </a>
            </nav>
            <button id="mobile-menu-btn-agc" class="md:hidden text-[var(--heading)] z-[70] relative w-10 h-10 flex items-center justify-center">
                <i class="fas fa-bars text-xl transition-all" id="menu-icon-agc"></i>
            </button>
        </div>
        <div id="mobile-menu-agc" data-mobile-menu class="fixed inset-0 z-[60] bg-[var(--surface)] backdrop-blur-xl flex flex-col items-center justify-start gap-6 pt-24 pb-10 px-6 overflow-y-auto opacity-0 pointer-events-none transition-all duration-300" style="background-color: var(--surface);">
            ${(content.navLinks || []).map((nav: any) => `
            <a href="${nav.link || '#home'}" class="mobile-link text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--heading)] hover:text-[var(--primary)] transition-all transform translate-y-6 opacity-0 text-center">
                ${nav.label}
            </a>
            `).join('')}
             <a href="${content.cta?.link || '#contact'}" class="mobile-link text-lg font-bold text-[var(--primary)] opacity-0 translate-y-6 transition-all delay-100 uppercase border-b-2 border-[var(--primary)]">
                ${content.cta?.text || 'Start Project'}
            </a>
        </div>
        <script>
            (function() {
                const btn = document.getElementById('mobile-menu-btn-agc');
                const menu = document.getElementById('mobile-menu-agc');
                const icon = document.getElementById('menu-icon-agc');
                const links = menu ? menu.querySelectorAll('.mobile-link') : [];
                let isOpen = false;
                if (btn && menu) {
                    btn.dataset.menuBound = '1';
                    btn.addEventListener('click', () => {
                        isOpen = !isOpen;
                        if (isOpen) {
                            menu.classList.remove('opacity-0', 'pointer-events-none');
                            icon.classList.remove('fa-bars');
                            icon.classList.add('fa-times');
                            document.body.style.overflow = 'hidden';
                            links.forEach((link, idx) => setTimeout(() => link.classList.remove('translate-y-6', 'opacity-0'), 100 + (idx * 50)));
                        } else {
                            menu.classList.add('opacity-0', 'pointer-events-none');
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                            document.body.style.overflow = '';
                            links.forEach(link => link.classList.add('translate-y-6', 'opacity-0'));
                        }
                    });
                    links.forEach(link => link.addEventListener('click', () => {
                        isOpen = false;
                        menu.classList.add('opacity-0', 'pointer-events-none');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                        document.body.style.overflow = '';
                    }));
                }
            })();
        </script>
    </header>
`;

export const HEADER_TECH_GLOW = (content: any) => `
    <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)] border-b border-[var(--text)]/10 transition-all duration-300" id="main-header">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="#" class="text-xl font-mono font-bold tracking-tighter text-[var(--heading)] hover:text-[var(--primary)] transition-colors relative z-50 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
                ${content.username || content.name || 'SYSTEM'}
            </a>
            <nav class="hidden md:flex items-center gap-8">
                ${(content.navLinks || []).map((nav: any) => `
                <a href="${nav.link}" class="text-sm font-medium font-mono text-[var(--text)] hover:text-[var(--primary)] transition-colors">
                    <span class="text-[var(--primary)]/40 text-xs mr-1 opacity-0 hover:opacity-100 transition-opacity">></span>${nav.label}
                </a>
                `).join('')}
                ${content.cta ? `
                <a href="${content.cta.link}" class="px-5 py-2 border border-[var(--primary)]/50 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--bg)] transition-all rounded text-xs font-mono font-bold uppercase">
                    ${content.cta.text}
                </a>
                ` : ''}
            </nav>
            <button id="mobile-menu-btn-tech" class="md:hidden text-[var(--heading)] z-50 relative w-10 h-10 flex items-center justify-center border border-[var(--text)]/10 rounded">
                <i class="fas fa-bars text-lg transition-all" id="menu-icon-tech"></i>
            </button>
        </div>
        <div id="mobile-menu-tech" data-mobile-menu class="fixed inset-0 bg-[var(--bg)] z-40 flex flex-col items-center justify-center gap-6 opacity-0 pointer-events-none transition-all duration-300">
             ${(content.navLinks || []).map((nav: any) => `
            <a href="${nav.link}" class="mobile-link text-xl font-mono font-bold text-[var(--text)] hover:text-[var(--primary)] transition-all transform translate-x-10 opacity-0 flex items-center gap-2">
                <span class="text-[var(--primary)]">></span> ${nav.label}
            </a>
            `).join('')}
        </div>
        <script>
            (function() {
                const btn = document.getElementById('mobile-menu-btn-tech');
                const menu = document.getElementById('mobile-menu-tech');
                const icon = document.getElementById('menu-icon-tech');
                const links = menu ? menu.querySelectorAll('.mobile-link') : [];
                let isOpen = false;
                if (btn && menu) {
                    btn.dataset.menuBound = '1';
                    btn.addEventListener('click', () => {
                        isOpen = !isOpen;
                        if (isOpen) {
                            menu.classList.remove('opacity-0', 'pointer-events-none');
                            icon.classList.remove('fa-bars');
                            icon.classList.add('fa-times');
                            links.forEach((link, idx) => setTimeout(() => link.classList.remove('translate-x-10', 'opacity-0'), 100 + (idx * 50)));
                        } else {
                            menu.classList.add('opacity-0', 'pointer-events-none');
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                            links.forEach(link => link.classList.add('translate-x-10', 'opacity-0'));
                        }
                    });
                     links.forEach(link => link.addEventListener('click', () => {
                        isOpen = false;
                        menu.classList.add('opacity-0', 'pointer-events-none');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                     }));
                 }
             })();
         </script>
     </header>
`;

export const HEADER_MINIMALIST_CREATOR = (content: any) => `
     <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)] border-b border-[var(--text)]/10 transition-all duration-300" id="main-header">
         <div class="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
             <a href="#" class="text-xl font-serif font-bold text-[var(--heading)] tracking-wide">
                 ${content.username || content.name || 'Portfolio'}
             </a>
             <nav class="hidden md:flex items-center gap-8">
                 ${(content.navLinks || []).map((nav: any) => `
                 <a href="${nav.link}" class="text-xs font-bold uppercase tracking-widest text-[var(--text)]/60 hover:text-[var(--primary)] transition-colors">
                     ${nav.label}
                 </a>
                 `).join('')}
             </nav>
             <button id="mobile-menu-btn-min-creator" class="md:hidden text-[var(--text)] z-50 relative w-10 h-10 flex items-center justify-center">
                 <i class="fas fa-bars text-xl transition-all" id="menu-icon-min-creator"></i>
             </button>
         </div>
         <div id="mobile-menu-min-creator" data-mobile-menu class="fixed inset-0 bg-[var(--bg)] z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
             ${(content.navLinks || []).map((nav: any) => `
             <a href="${nav.link}" class="mobile-link text-2xl font-serif text-[var(--heading)] hover:text-[var(--primary)] transition-all transform translate-y-4 opacity-0">
                 ${nav.label}
             </a>
             `).join('')}
         </div>
         <script>
             (function() {
                 const btn = document.getElementById('mobile-menu-btn-min-creator');
                 const menu = document.getElementById('mobile-menu-min-creator');
                 const icon = document.getElementById('menu-icon-min-creator');
                 const links = menu ? menu.querySelectorAll('.mobile-link') : [];
                 let isOpen = false;
                 if (btn && menu) {
                     btn.dataset.menuBound = '1';
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
                 }
                 
                 // Event delegation for smooth scrolling
                 document.body.addEventListener('click', function(e) {
                     const link = e.target.closest('a[href^="#"]');
                     if (link) {
                         const targetId = link.getAttribute('href').substring(1);
                         const target = targetId ? document.getElementById(targetId) : null;
                         if (target) {
                             e.preventDefault();
                             target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                         }
                     }
                 });
             })();
         </script>
     </header>
 `;

export const HEADER_DARK_SASS = (content: any) => `
    <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--text)]/5 transition-all duration-300" id="main-header">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="#" class="text-xl font-bold tracking-tight text-[var(--heading)] hover:text-[var(--primary)] transition-colors relative z-50">
                ${content.username || content.name || 'SYSTEM'}
            </a>
            <nav class="hidden md:flex items-center gap-8">
                ${(content.navLinks || []).map((nav: any) => `
                <a href="${nav.link}" class="text-sm font-medium text-[var(--text)]/60 hover:text-[var(--primary)] transition-colors">
                    ${nav.label}
                </a>
                `).join('')}
            </nav>
            <button id="mobile-menu-btn-ds" class="md:hidden text-[var(--text)] z-50 relative w-10 h-10 flex items-center justify-center">
                <i class="fas fa-bars text-xl transition-all" id="menu-icon-ds"></i>
            </button>
        </div>
        <div id="mobile-menu-ds" data-mobile-menu class="fixed inset-0 bg-[var(--bg)] z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
            ${(content.navLinks || []).map((nav: any) => `
            <a href="${nav.link}" class="mobile-link text-3xl font-bold text-[var(--text)]/80 hover:text-[var(--primary)] transition-all transform translate-y-4 opacity-0">
                ${nav.label}
            </a>
            `).join('')}
        </div>
        <script>
            (function() {
                const btn = document.getElementById('mobile-menu-btn-ds');
                const menu = document.getElementById('mobile-menu-ds');
                const icon = document.getElementById('menu-icon-ds');
                const links = menu ? menu.querySelectorAll('.mobile-link') : [];
                let isOpen = false;
                if (btn && menu) {
                    btn.dataset.menuBound = '1';
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
                }
            })();
        </script>
    </header>
`;

export const HeaderRegistry: any = {
    HEADER_MINIMALIST,
    HEADER_AGENCY_VIBRANT,
    HEADER_TECH_GLOW,
    // Alias used by blueprint guidance in backend services.
    HEADER_TECH: HEADER_TECH_GLOW,
    HEADER_MINIMALIST_CREATOR,
    HEADER_DARK_SASS
};

declare global {
    interface Window { scrollHandlerBound: boolean; }
}
