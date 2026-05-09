// ============================================================
// SEEQME EDUCATION REGISTRY — 5 education section styles
// ============================================================

const eduSchool = (item: any): string => item.school || item.institution || item.university || '';
const eduDegree = (item: any): string => item.degree || item.program || item.qualification || 'Degree';
const eduYear = (item: any): string => item.year || item.period || item.dates || '';
const eduGPA = (item: any): string | null => item.gpa ? `GPA: ${item.gpa}` : null;
const eduHonors = (item: any): string | null => item.honors || item.distinction || null;

export const EducationRegistry: Record<string, (content: any) => string> = {

  // ─── 1. EDUCATION_TIMELINE ───────────────────────────────────────────────
  EDUCATION_TIMELINE: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="education" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-4xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Education</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="education-title">${content.title || 'Education'}</h2>
    </div>
    <div class="relative">
      <!-- Timeline spine -->
      <div class="absolute left-5 top-0 bottom-0 w-px" style="background:linear-gradient(to bottom,var(--primary),color-mix(in srgb,var(--primary) 20%,transparent));"></div>
      <div class="flex flex-col gap-10">
        ${items.map((item: any, i: number) => `
        <div class="flex gap-8 items-start relative pl-14">
          <!-- Dot with initial -->
          <div class="absolute left-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 z-10 flex-shrink-0"
               style="background:var(--bg);border-color:var(--primary);color:var(--primary);">
            ${(eduSchool(item) || 'U').charAt(0).toUpperCase()}
          </div>
          <!-- Content -->
          <div class="flex-1 rounded-2xl p-7 border border-[var(--text)]/10 hover:border-[var(--primary)]/30 transition-all duration-300 hover:shadow-lg"
               style="background:var(--surface);">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div>
                <h3 class="text-xl font-black text-[var(--heading)]">${eduDegree(item)}</h3>
                <p class="text-sm font-bold opacity-60 text-[var(--text)] mt-1">${eduSchool(item)}</p>
              </div>
              <span class="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex-shrink-0"
                    style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);">${eduYear(item)}</span>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              ${eduGPA(item) ? `<span class="text-xs font-bold px-3 py-1 rounded-full" style="background:color-mix(in srgb,var(--text) 8%,transparent);color:var(--text);opacity:0.7;">${eduGPA(item)}</span>` : ''}
              ${eduHonors(item) ? `<span class="text-xs font-bold px-3 py-1 rounded-full" style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);">${eduHonors(item)}</span>` : ''}
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>`;
  },

  // ─── 2. EDUCATION_CARDS_GRID ─────────────────────────────────────────────
  EDUCATION_CARDS_GRID: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="education" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 text-center space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Education</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="education-title">${content.title || 'Education'}</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${items.map((item: any, i: number) => `
      <div class="rounded-2xl p-8 border border-[var(--text)]/10 hover:border-[var(--primary)]/40 group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
           style="background:var(--surface);">
        <i class="fas fa-graduation-cap text-3xl mb-6 block group-hover:scale-110 transition-transform duration-300" style="color:var(--primary);"></i>
        <h3 class="text-lg font-black text-[var(--heading)] mb-2">${eduDegree(item)}</h3>
        <p class="text-sm font-bold opacity-60 text-[var(--text)] mb-4">${eduSchool(item)}</p>
        <div class="flex flex-wrap gap-2">
          <span class="text-xs font-bold px-3 py-1.5 rounded-full"
                style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);">${eduYear(item)}</span>
          ${eduGPA(item) ? `<span class="text-xs font-bold px-3 py-1.5 rounded-full" style="background:color-mix(in srgb,var(--text) 8%,transparent);color:var(--text);opacity:0.7;">${eduGPA(item)}</span>` : ''}
          ${eduHonors(item) ? `<span class="text-xs font-bold px-3 py-1.5 rounded-full" style="background:color-mix(in srgb,var(--primary) 8%,transparent);color:var(--primary);">${eduHonors(item)}</span>` : ''}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 3. EDUCATION_MINIMAL_LIST ───────────────────────────────────────────
  EDUCATION_MINIMAL_LIST: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="education" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-3xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Education</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="education-title">${content.title || 'Education'}</h2>
    </div>
    <div class="flex flex-col">
      ${items.map((item: any) => `
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-7 border-t border-[var(--text)]/10 group hover:bg-[var(--surface)]/30 transition-colors duration-200 px-2 -mx-2 rounded-lg">
        <div class="flex-1">
          <h3 class="text-base font-black text-[var(--heading)] mb-1">${eduDegree(item)}</h3>
          <p class="text-sm text-[var(--text)] opacity-60">${eduSchool(item)}</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap flex-shrink-0">
          <span class="text-xs font-black uppercase tracking-wider opacity-50 text-[var(--text)]">${eduYear(item)}</span>
          ${eduGPA(item) ? `<span class="text-xs font-bold px-2.5 py-1 rounded-full" style="background:color-mix(in srgb,var(--text) 8%,transparent);color:var(--text);opacity:0.7;">${eduGPA(item)}</span>` : ''}
          ${eduHonors(item) ? `<span class="text-xs font-bold px-2.5 py-1 rounded-full" style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);">${eduHonors(item)}</span>` : ''}
        </div>
      </div>`).join('')}
      <div class="border-t border-[var(--text)]/10"></div>
    </div>
  </div>
</section>`;
  },

  // ─── 4. EDUCATION_BENTO ──────────────────────────────────────────────────
  EDUCATION_BENTO: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    const primary = items[0];
    const rest = items.slice(1);
    return `
<section data-section="education" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Education</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="education-title">${content.title || 'Education'}</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
      ${primary ? `
      <!-- Primary / featured degree -->
      <div class="md:col-span-2 rounded-2xl p-10 flex flex-col justify-between gap-8"
           style="background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 12%,var(--surface)),var(--surface));min-height:220px;">
        <i class="fas fa-graduation-cap text-3xl" style="color:var(--primary);"></i>
        <div>
          <div class="flex flex-wrap items-center gap-3 mb-3">
            <span class="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full"
                  style="background:color-mix(in srgb,var(--primary) 15%,transparent);color:var(--primary);">${eduYear(primary)}</span>
            ${eduGPA(primary) ? `<span class="text-xs font-bold px-3 py-1.5 rounded-full" style="background:color-mix(in srgb,var(--text) 8%,transparent);color:var(--text);opacity:0.7;">${eduGPA(primary)}</span>` : ''}
            ${eduHonors(primary) ? `<span class="text-xs font-bold px-3 py-1.5 rounded-full" style="background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary);">${eduHonors(primary)}</span>` : ''}
          </div>
          <h3 class="text-2xl md:text-3xl font-black text-[var(--heading)] mb-2">${eduDegree(primary)}</h3>
          <p class="text-base font-bold opacity-60 text-[var(--text)]">${eduSchool(primary)}</p>
        </div>
      </div>` : ''}
      ${rest.map((item: any, i: number) => `
      <div class="rounded-2xl p-7 border border-[var(--text)]/10 hover:border-[var(--primary)]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between gap-4"
           style="background:${i % 2 === 0 ? 'var(--surface)' : 'color-mix(in srgb,var(--surface) 60%,var(--bg))'};">
        <div>
          <span class="text-xs font-black uppercase tracking-wider opacity-50 text-[var(--text)] block mb-3">${eduYear(item)}</span>
          <h3 class="text-lg font-black text-[var(--heading)] mb-1">${eduDegree(item)}</h3>
          <p class="text-sm opacity-60 text-[var(--text)]">${eduSchool(item)}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          ${eduGPA(item) ? `<span class="text-xs font-bold px-2.5 py-1 rounded-full" style="background:color-mix(in srgb,var(--text) 8%,transparent);color:var(--text);opacity:0.7;">${eduGPA(item)}</span>` : ''}
          ${eduHonors(item) ? `<span class="text-xs font-bold px-2.5 py-1 rounded-full" style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);">${eduHonors(item)}</span>` : ''}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

  // ─── 5. EDUCATION_CREATIVE ───────────────────────────────────────────────
  EDUCATION_CREATIVE: (content: any) => {
    const items = Array.isArray(content.items) ? content.items : [];
    return `
<section data-section="education" class="relative py-20 md:py-28 bg-[var(--bg)]">
  <div class="max-w-5xl mx-auto px-6">
    <div class="mb-14 space-y-3">
      <span class="text-xs font-black uppercase tracking-[0.4em]" style="color:var(--primary);">Education</span>
      <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-[var(--heading)]" data-field="education-title">${content.title || 'Education'}</h2>
    </div>
    <div class="flex flex-col gap-12">
      ${items.map((item: any, i: number) => `
      <div class="flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center group">
        <!-- Year side -->
        <div class="lg:w-1/3 flex-shrink-0 text-center lg:text-${i % 2 === 0 ? 'right' : 'left'}">
          <p class="font-black text-[var(--heading)] leading-none select-none"
             style="font-size:clamp(3rem,8vw,6rem);opacity:0.1;line-height:1;">${eduYear(item) || '—'}</p>
          <p class="text-xs font-black uppercase tracking-[0.3em] mt-2" style="color:var(--primary);">Year</p>
        </div>
        <!-- Connector line (desktop) -->
        <div class="hidden lg:block w-12 flex-shrink-0 h-px" style="background:var(--primary);opacity:0.3;"></div>
        <!-- Details card -->
        <div class="flex-1 rounded-2xl p-8 border border-[var(--text)]/10 hover:border-[var(--primary)]/40 transition-all duration-300 hover:shadow-xl group-hover:-translate-y-1"
             style="background:var(--surface);">
          <i class="fas fa-graduation-cap text-2xl mb-4 block" style="color:var(--primary);"></i>
          <h3 class="text-xl font-black text-[var(--heading)] mb-2">${eduDegree(item)}</h3>
          <p class="text-sm font-bold opacity-60 text-[var(--text)] mb-4">${eduSchool(item)}</p>
          <div class="flex flex-wrap gap-2">
            ${eduGPA(item) ? `<span class="text-xs font-bold px-3 py-1.5 rounded-full" style="background:color-mix(in srgb,var(--text) 8%,transparent);color:var(--text);opacity:0.7;">${eduGPA(item)}</span>` : ''}
            ${eduHonors(item) ? `<span class="text-xs font-bold px-3 py-1.5 rounded-full" style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);">${eduHonors(item)}</span>` : ''}
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  },

};
