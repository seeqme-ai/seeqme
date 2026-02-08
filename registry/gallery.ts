/**
 * GALLERY REGISTRY
 * Visual showcases and portfolios grids.
 */

export const GALLERY_MASONRY_GLASS = (content: any) => `
    <section id="gallery" data-section="gallery" class="py-24 px-6 bg-[var(--surface)]/10">
        <div class="max-w-7xl mx-auto space-y-16">
            <div class="text-center space-y-4">
                <h2 class="text-xs font-black uppercase tracking-[0.5em] opacity-40">${content.label || 'Artifacts'}</h2>
                <h3 class="text-6xl font-black uppercase tracking-tighter leading-none">${content.title || 'Gallery'}</h3>
            </div>
            <div class="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                ${(content.items || []).map((item: any) => `
                <div class="break-inside-avoid rounded-[2.5rem] overflow-hidden border border-white/5 relative group cursor-pointer shadow-2xl">
                    <img src="${item.image}" class="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                        <h4 class="text-xl font-black uppercase">${item.title}</h4>
                        <p class="text-xs font-bold opacity-60 uppercase tracking-widest mt-2">${item.category}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
`;

export const GalleryRegistry: any = {
    GALLERY_MASONRY_GLASS
};
