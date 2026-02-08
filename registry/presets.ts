/**
 * PRESET TEMPLATES REGISTRY
 * 100+ Production-Grade Combinations
 * These are used by the AI to instantly choose a cohesive design direction.
 */

const categories = ['Agency', 'Startup', 'Personal', 'Corporate', 'Creative', 'Technical', 'Luxury', 'E-commerce', 'Medical', 'Legal', 'Educational'];
const themes = ['CYBER_NEON', 'MINIMAL_PAPER', 'LUXURY_GOLD', 'VIBRANT_BLOOM', 'DEEP_FOREST', 'OCEANIC_MIST', 'COFFEE_BEAST', 'dark', 'light'];

const heroes = ['HERO_DYNAMIC_GRADIENT', 'HERO_GLITCH_TEXT', 'HERO_SMOOTH_SWEEP', 'HERO_GRID_PORTRAIT', 'HERO_MAGAZINE', 'HERO_TERMINAL_STYLE', 'HERO_VISUALIST'];
const projects = ['PROJ_BENTO_GRID', 'PROJ_3D_PERSPECTIVE', 'PROJ_MASONRY', 'PROJ_LIST_PREVIEW', 'PROJ_OVERLAP_SLOTS', 'PROJ_CASE_STUDY'];
const serviceStyles = ['SERVICES_GLOW_GRID', 'SERVICES_GLASS_BENTO', 'SERVICES_CARDS_INTERACTIVE', 'SERVICES_LIST_MINIMAL'];
const footers = ['FOOTER_DARK_DETAILED', 'FOOTER_BRAND_FOCUS', 'FOOTER_SOCIAL_HEAVY', 'FOOTER_NEWSLETTER'];

function generatePresets(count: number) {
    const presets = [];
    for (let i = 1; i <= count; i++) {
        const niche = categories[i % categories.length];
        const theme = themes[i % themes.length];

        presets.push({
            id: `TEMPLATE_${niche.toUpperCase()}_v${i}`,
            name: `${niche} Professional v${i}`,
            niche: niche,
            theme: theme,
            config: {
                sections: [
                    { type: 'hero', componentId: heroes[i % heroes.length] },
                    { type: 'logos', componentId: 'LOGOS_STRIP_CLEAN' },
                    { type: 'services', componentId: serviceStyles[i % serviceStyles.length] },
                    { type: 'projects', componentId: projects[i % projects.length] },
                    { type: 'stats', componentId: i % 2 === 0 ? 'STATS_ANIMATED_COUNTERS' : 'STATS_LARGE_NUMBERS' },
                    { type: 'testimonials', componentId: i % 2 === 0 ? 'TESTIMONIALS_CAROUSEL' : 'TESTIMONIALS_GRID_PHOTOS' },
                    { type: 'cta', componentId: 'CTA_CENTERED_BOLD' },
                    { type: 'faq', componentId: 'FAQ_ACCORDION_NEON' },
                    { type: 'footer', componentId: footers[i % footers.length] }
                ]
            }
        });
    }
    return presets;
}

export const PRESET_LAYOUTS = generatePresets(120);
