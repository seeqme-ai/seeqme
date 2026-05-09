// ============================================================
// SEEQME TESTIMONIALS EXTENDED REGISTRY — 6 additional testimonial section styles
// ============================================================

const avatarInitial = (item: any): string => {
  const name = item.author || item.name || 'A';
  return name.charAt(0).toUpperCase();
};

const avatarColors = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#0ea5e9,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
];

const avatarDiv = (item: any, i: number, size = 'w-10 h-10') => {
  if (item.avatar) {
    return `<img src="${item.avatar}" alt="${item.author || ''}" class="${size} rounded-full object-cover flex-shrink-0" onerror="this.onerror=null;this.style.background='${avatarColors[i % avatarColors.length]}';this.innerHTML='<span class=&quot;font-black text-white&quot;>${avatarInitial(item)}</span>';" />`;
  }
  return `<div class="${size} rounded-full flex items-center justify-center text-sm font-black text-[var(--bg)] flex-shrink-0" style="background:${avatarColors[i % avatarColors.length]};">${avatarInitial(item)}</div>`;
};

export const TestimonialsExtendedRegistry: Record<string, (content: any) => string> = {

  // ─── 1. TESTIMONIALS_MASONRY ─────────────────────────────────────────────
  TESTIMONIALS_MASONRY: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="testimonials" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 text-center space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Testimonials</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="testimonials-title">${content.title || 'What People Say'}</h2>
    </div>
    <!-- Masonry via CSS columns -->
    <div style="columns:1;column-gap:1.5rem;" class="md:columns-2 lg:columns-3">
      ${items.map((item: any, i: number) => `
      <div class="break-inside-avoid mb-6 rounded-2xl p-6 border border-[var(--text)]/10 hover:border-[var(--primary)]/30 transition-all duration-300 hover:shadow-lg"
           style="background:var(--surface);">
        <p class="text-sm text-[var(--text)] opacity-70 leading-relaxed mb-5">"${item.text || item.quote || ''}"</p>
        <div class="flex items-center gap-3">
          ${avatarDiv(item, i)}
          <div>
            <p class="text-sm font-black text-[var(--heading)]">${item.author || item.name || 'Anonymous'}</p>
            <p class="text-xs opacity-50 text-[var(--text)]">${item.role || item.position || ''}</p>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 2. TESTIMONIALS_DARK_GRID ───────────────────────────────────────────
  TESTIMONIALS_DARK_GRID: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="testimonials" class="relative py-20 md:py-28 bg-[var(--surface)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 text-center space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Testimonials</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="testimonials-title">${content.title || 'What People Say'}</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${items.map((item: any, i: number) => `
      <div class="rounded-2xl p-7 border border-[var(--text)]/10 group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
           style="background:color-mix(in srgb,var(--bg) 60%,var(--surface));">
        <!-- Big quote mark -->
        <div class="text-6xl font-black leading-none mb-4 select-none" style="color:var(--primary);opacity:0.6;">"</div>
        <p class="text-sm text-[var(--text)] opacity-70 leading-relaxed mb-7">${item.text || item.quote || ''}</p>
        <div class="flex items-center gap-3">
          ${avatarDiv(item, i)}
          <div>
            <p class="text-sm font-black text-[var(--heading)]">${item.author || item.name || 'Anonymous'}</p>
            <p class="text-xs opacity-50 text-[var(--text)]">${item.role || item.position || ''}</p>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 3. TESTIMONIALS_FEATURED ────────────────────────────────────────────
  TESTIMONIALS_FEATURED: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    const featured = items[0];
    const rest = items.slice(1, 4);
    return `
<section data-section="testimonials" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Testimonials</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="testimonials-title">${content.title || 'What People Say'}</h2>
    </div>
    ${featured ? `
    <!-- Featured quote -->
    <div class="rounded-3xl p-10 md:p-14 mb-8 relative overflow-hidden"
         style="background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 10%,var(--surface)),var(--surface));">
      <div class="absolute top-6 left-8 text-8xl font-black leading-none select-none pointer-events-none"
           style="color:var(--primary);opacity:0.12;">"</div>
      <blockquote class="relative z-10 text-2xl md:text-3xl font-black italic text-[var(--heading)] leading-relaxed mb-8 max-w-4xl">
        "${featured.text || featured.quote || ''}"
      </blockquote>
      <div class="flex items-center gap-4">
        ${avatarDiv(featured, 0, 'w-14 h-14')}
        <div>
          <p class="font-black text-base text-[var(--heading)]">${featured.author || featured.name || 'Anonymous'}</p>
          <p class="text-sm opacity-60 text-[var(--text)]">${featured.role || featured.position || ''}</p>
        </div>
      </div>
    </div>` : ''}
    <!-- Mini testimonials row -->
    ${rest.length > 0 ? `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      ${rest.map((item: any, i: number) => `
      <div class="rounded-2xl p-6 border border-[var(--text)]/10 hover:border-[var(--primary)]/30 transition-all duration-300"
           style="background:var(--surface);">
        <p class="text-sm text-[var(--text)] opacity-70 leading-relaxed mb-5 line-clamp-3">"${item.text || item.quote || ''}"</p>
        <div class="flex items-center gap-2">
          ${avatarDiv(item, i + 1, 'w-8 h-8')}
          <div>
            <p class="text-xs font-black text-[var(--heading)]">${item.author || item.name || 'Anonymous'}</p>
            <p class="text-xs opacity-50 text-[var(--text)]">${item.role || item.position || ''}</p>
          </div>
        </div>
      </div>`).join('')}
    </div>` : ''}
  </div>
</section>`;
  },

  // ─── 4. TESTIMONIALS_COMPACT_LIST ────────────────────────────────────────
  TESTIMONIALS_COMPACT_LIST: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="testimonials" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-4xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Testimonials</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="testimonials-title">${content.title || 'What People Say'}</h2>
    </div>
    <div class="flex flex-col divide-y divide-[var(--text)]/10">
      ${items.map((item: any, i: number) => `
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-8 group">
        <div class="flex items-start gap-3 flex-1">
          <span class="text-2xl font-black leading-none flex-shrink-0 mt-1" style="color:var(--primary);opacity:0.5;">"</span>
          <p class="text-base text-[var(--text)] opacity-70 italic leading-relaxed">${item.text || item.quote || ''}"</p>
        </div>
        <div class="flex items-center gap-2 sm:text-right sm:flex-shrink-0 sm:pl-8">
          ${avatarDiv(item, i, 'w-8 h-8')}
          <div>
            <p class="text-xs font-black text-[var(--heading)]">${item.author || item.name || 'Anonymous'}</p>
            <p class="text-xs opacity-50 text-[var(--text)]">${item.role || item.position || ''}</p>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 5. TESTIMONIALS_SLIDER_CSS ──────────────────────────────────────────
  TESTIMONIALS_SLIDER_CSS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    const uid = `tslider-${Math.random().toString(36).slice(2, 7)}`;
    return `
<section data-section="testimonials" class="relative py-20 md:py-28 bg-[var(--bg)] overflow-hidden">
  <div class="max-w-4xl mx-auto px-6">
    <div class="mb-14 text-center space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Testimonials</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="testimonials-title">${content.title || 'What People Say'}</h2>
    </div>
    <!-- Slides wrapper -->
    <div class="relative min-h-[300px]">
      ${items.map((item: any, i: number) => `
      <div id="${uid}-slide-${i}" class="absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-all duration-500"
           style="opacity:${i === 0 ? '1' : '0'};pointer-events:${i === 0 ? 'auto' : 'none'};">
        <div class="text-6xl font-black leading-none mb-6 select-none" style="color:var(--primary);opacity:0.4;">"</div>
        <blockquote class="text-xl md:text-2xl font-bold italic text-[var(--heading)] leading-relaxed mb-8 max-w-2xl">
          ${item.text || item.quote || ''}
        </blockquote>
        <div class="flex flex-col items-center gap-2">
          ${avatarDiv(item, i, 'w-12 h-12')}
          <p class="font-black text-sm text-[var(--heading)]">${item.author || item.name || 'Anonymous'}</p>
          <p class="text-xs opacity-50 text-[var(--text)]">${item.role || item.position || ''}</p>
        </div>
      </div>`).join('')}
    </div>
    <!-- Dots navigation -->
    <div class="flex justify-center gap-3 mt-8">
      ${items.map((_: any, i: number) => `
      <button onclick="(function(){
        var slides=document.querySelectorAll('[id^=${uid}-slide-]');
        var dots=document.querySelectorAll('.${uid}-dot');
        slides.forEach(function(s){s.style.opacity='0';s.style.pointerEvents='none';});
        dots.forEach(function(d){d.style.background='var(--text)';d.style.opacity='0.3';d.style.width='8px';});
        document.getElementById('${uid}-slide-${i}').style.opacity='1';
        document.getElementById('${uid}-slide-${i}').style.pointerEvents='auto';
        this.style.background='var(--primary)';this.style.opacity='1';this.style.width='24px';
      }).call(this);"
             class="${uid}-dot rounded-full transition-all duration-300 h-2 cursor-pointer"
             style="background:${i === 0 ? 'var(--primary)' : 'var(--text)'};opacity:${i === 0 ? '1' : '0.3'};width:${i === 0 ? '24px' : '8px'};border:none;outline:none;"></button>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 6. TESTIMONIALS_NEON_CARDS ──────────────────────────────────────────
  TESTIMONIALS_NEON_CARDS: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="testimonials" class="relative py-20 md:py-28 bg-[var(--surface)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Testimonials</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="testimonials-title">${content.title || 'What People Say'}</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${items.map((item: any, i: number) => `
      <div class="rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1 group"
           style="background:color-mix(in srgb,var(--bg) 70%,var(--surface));border-color:color-mix(in srgb,var(--primary) 30%,transparent);"
           onmouseover="this.style.boxShadow='0 0 30px color-mix(in srgb,var(--primary) 25%,transparent)';this.style.borderColor='var(--primary)';"
           onmouseout="this.style.boxShadow='none';this.style.borderColor='color-mix(in srgb,var(--primary) 30%,transparent)';">
        <span class="text-4xl font-black leading-none select-none block mb-4" style="color:var(--primary);">"</span>
        <p class="text-sm text-[var(--text)] opacity-70 leading-relaxed mb-6">${item.text || item.quote || ''}"</p>
        <div class="flex items-center gap-3 border-t border-[var(--text)]/10 pt-5">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
               style="background:color-mix(in srgb,var(--primary) 15%,transparent);color:var(--primary);">
            ${avatarInitial(item)}
          </div>
          <div>
            <p class="text-sm font-black text-[var(--heading)]">${item.author || item.name || 'Anonymous'}</p>
            <p class="text-xs opacity-50 text-[var(--text)]">${item.role || item.position || ''}</p>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

};
