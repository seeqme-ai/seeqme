import { HeaderRegistry } from './headers';
import { HeroRegistry } from './heroes';
import { AboutRegistry } from './about';
import { ExperienceRegistry } from './experience';
import { ProjectRegistry } from './projects';
import { SkillsRegistry } from './skills';
import { TestimonialRegistry } from './testimonials';
import { ContactRegistry } from './contact';
import { FooterRegistry } from './footers';
import { CTARegistry } from './cta';
import { StatsRegistry } from './stats';
import { ServicesRegistry } from './services';
import { TypographicRegistry } from './typographic';
import { LogoRegistry } from './logos';
import { PricingRegistry } from './pricing';
import { FAQRegistry } from './faq';
import { ProcessRegistry } from './process';
import { GalleryRegistry } from './gallery';
import { TeamRegistry } from './team';

export type RegistryComponent = (content: any) => string;

export const Registry: Record<string, RegistryComponent> = {
    ...HeaderRegistry,
    ...HeroRegistry,
    ...AboutRegistry,
    ...ExperienceRegistry,
    ...ProjectRegistry,
    ...SkillsRegistry,
    ...TestimonialRegistry,
    ...ContactRegistry,
    ...FooterRegistry,
    ...CTARegistry,
    ...StatsRegistry,
    ...ServicesRegistry,
    ...TypographicRegistry,
    ...LogoRegistry,
    ...PricingRegistry,
    ...FAQRegistry,
    ...ProcessRegistry,
    ...GalleryRegistry,
    ...TeamRegistry,

    HERO_MODERN_SPLIT: HeroRegistry.HERO_MODERN_SPLIT,
    HERO_CENTERED_MINIMAL: HeroRegistry.HERO_CENTERED_MINIMAL,
    HERO_CYBER_MONO: HeroRegistry.HERO_CYBER_MONO,
    HERO_VISUALIST: HeroRegistry.HERO_VISUALIST,
    HERO_EXECUTIVE: HeroRegistry.HERO_EXECUTIVE,
    HERO_GLASS_FLOATING: HeroRegistry.HERO_GLASS_FLOATING,
    HERO_NEOBRUTALIST: HeroRegistry.HERO_NEOBRUTALIST,
    HERO_MINIMAL_LEFT: HeroRegistry.HERO_MINIMAL_LEFT,
    HERO_STACKED_BOLD: HeroRegistry.HERO_STACKED_BOLD,
    HERO_GRID_LAYOUT: HeroRegistry.HERO_GRID_LAYOUT,
    HERO_DYNAMIC_GRADIENT: HeroRegistry.HERO_DYNAMIC_GRADIENT,
    HERO_MINIMAL_ELEGANCE: HeroRegistry.HERO_MINIMAL_ELEGANCE,
    HERO_TERMINAL_STYLE: HeroRegistry.HERO_TERMINAL_STYLE,
    HERO_VIDEO_BG: HeroRegistry.HERO_VIDEO_BG,
    HERO_MAGAZINE: HeroRegistry.HERO_MAGAZINE,
    HERO_PARALLAX_LAYERS: HeroRegistry.HERO_PARALLAX_LAYERS,
    HERO_CIRCLE_AVATAR: HeroRegistry.HERO_CIRCLE_AVATAR,
    HERO_SPLIT_DIAGONAL: HeroRegistry.HERO_SPLIT_DIAGONAL,
    HERO_GRADIENT_TEXT: HeroRegistry.HERO_GRADIENT_TEXT,
    HERO_CARD_STACK: HeroRegistry.HERO_CARD_STACK,
    HERO_SIDEBAR_LEFT: HeroRegistry.HERO_SIDEBAR_LEFT,
    HERO_PHOTO_MOSAIC: HeroRegistry.HERO_PHOTO_MOSAIC,
    HERO_GLITCH_TEXT: HeroRegistry.HERO_GLITCH_TEXT,
    HERO_SMOOTH_SWEEP: HeroRegistry.HERO_SMOOTH_SWEEP,
    HERO_GRID_PORTRAIT: HeroRegistry.HERO_GRID_PORTRAIT,

    PROJ_BENTO_GRID: ProjectRegistry.PROJ_BENTO_GRID,
    PROJ_MINIMAL_CARDS: ProjectRegistry.PROJ_MINIMAL_CARDS,
    PROJ_STACKED_LIST: ProjectRegistry.PROJ_STACKED_LIST,
    PROJ_CAROUSEL_FULLSCREEN: ProjectRegistry.PROJ_CAROUSEL_FULLSCREEN,
    PROJ_GITHUB_STYLE: ProjectRegistry.PROJ_GITHUB_STYLE,
    PROJ_MASONRY: ProjectRegistry.PROJ_MASONRY,
    PROJ_CASE_STUDY: ProjectRegistry.PROJ_CASE_STUDY,
    PROJ_THUMBNAIL_GRID: ProjectRegistry.PROJ_THUMBNAIL_GRID,
    PROJ_FEATURED_SINGLE: ProjectRegistry.PROJ_FEATURED_SINGLE,
    PROJ_TIMELINE_VERTICAL: ProjectRegistry.PROJ_TIMELINE_VERTICAL,
    PROJ_3D_PERSPECTIVE: ProjectRegistry.PROJ_3D_PERSPECTIVE,
    PROJ_LIST_PREVIEW: ProjectRegistry.PROJ_LIST_PREVIEW,
    PROJ_OVERLAP_SLOTS: ProjectRegistry.PROJ_OVERLAP_SLOTS,

    EXP_TIMELINE_VERTICAL: ExperienceRegistry.EXP_TIMELINE_VERTICAL,
    EXP_ACCORDION_MINIMAL: ExperienceRegistry.EXP_ACCORDION_MINIMAL,
    EXP_CARDS_GRID: ExperienceRegistry.EXP_CARDS_GRID,
    EXP_HORIZONTAL_SCROLL: ExperienceRegistry.EXP_HORIZONTAL_SCROLL,
    EXP_TABS_SWITCH: ExperienceRegistry.EXP_TABS_SWITCH,
    EXP_SIDEBAR_LIST: ExperienceRegistry.EXP_SIDEBAR_LIST,
    EXP_GLASSMORPHIC: ExperienceRegistry.EXP_GLASSMORPHIC,
    EXP_MAGAZINE: ExperienceRegistry.EXP_MAGAZINE,
    EXP_NUMBERED_LIST: ExperienceRegistry.EXP_NUMBERED_LIST,

    SKILLS_MARQUEE: SkillsRegistry.SKILLS_MARQUEE,
    SKILLS_GRID_ICONS: SkillsRegistry.SKILLS_GRID_ICONS,
    SKILLS_PROGRESS_BARS: SkillsRegistry.SKILLS_PROGRESS_BARS,
    SKILLS_TAGS_CLOUD: SkillsRegistry.SKILLS_TAGS_CLOUD,
    SKILLS_HEXAGON_GRID: SkillsRegistry.SKILLS_HEXAGON_GRID,
    SKILLS_RADAR_CHART: SkillsRegistry.SKILLS_RADAR_CHART,
    SKILLS_DARK_SAAS: SkillsRegistry.SKILLS_DARK_SAAS,
    SKILLS_AGENCY: SkillsRegistry.SKILLS_AGENCY,
    SKILLS_ENG_BENTO: SkillsRegistry.SKILLS_ENG_BENTO,
    SKILLS_ENG_TERMINAL: SkillsRegistry.SKILLS_ENG_TERMINAL,
    SKILLS_ENG_CIRCUIT: SkillsRegistry.SKILLS_ENG_CIRCUIT,
    SKILLS_CREATIVE_MASONRY: SkillsRegistry.SKILLS_CREATIVE_MASONRY,
    SKILLS_CREATIVE_PALETTE: SkillsRegistry.SKILLS_CREATIVE_PALETTE,
    SKILLS_CREATIVE_CARDS: SkillsRegistry.SKILLS_CREATIVE_CARDS,
    SKILLS_BIZ_CARDS: SkillsRegistry.SKILLS_BIZ_CARDS,
    SKILLS_BIZ_LIST: SkillsRegistry.SKILLS_BIZ_LIST,
    SKILLS_BIZ_PIE: SkillsRegistry.SKILLS_BIZ_PIE,
    SKILLS_FIN_MATRIX: SkillsRegistry.SKILLS_FIN_MATRIX,
    SKILLS_FIN_TICKER: SkillsRegistry.SKILLS_FIN_TICKER,
    SKILLS_FIN_CHART: SkillsRegistry.SKILLS_FIN_CHART,
    SKILLS_MKT_FUNNEL: SkillsRegistry.SKILLS_MKT_FUNNEL,
    SKILLS_MKT_BUBBLES: SkillsRegistry.SKILLS_MKT_BUBBLES,
    SKILLS_MKT_CAROUSEL: SkillsRegistry.SKILLS_MKT_CAROUSEL,
    SKILLS_AGC_NEOBRUTAL: SkillsRegistry.SKILLS_AGC_NEOBRUTAL,
    SKILLS_AGC_GLASS: SkillsRegistry.SKILLS_AGC_GLASS,
    SKILLS_AGC_MINIMAL: SkillsRegistry.SKILLS_AGC_MINIMAL,

    ABOUT_NARRATIVE: AboutRegistry.ABOUT_NARRATIVE,
    ABOUT_STATS: AboutRegistry.ABOUT_STATS,
    ABOUT_IMAGE_WRAP: AboutRegistry.ABOUT_IMAGE_WRAP,
    ABOUT_GLASS_DECONSTRUCTED: AboutRegistry.ABOUT_GLASS_DECONSTRUCTED,
    ABOUT_TIMELINE_PERSONAL: AboutRegistry.ABOUT_TIMELINE_PERSONAL,
    ABOUT_SPLIT_COLUMNS: AboutRegistry.ABOUT_SPLIT_COLUMNS,
    ABOUT_QUOTE_FOCUS: AboutRegistry.ABOUT_QUOTE_FOCUS,
    ABOUT_VIDEO_INTRO: AboutRegistry.ABOUT_VIDEO_INTRO,
    ABOUT_METRICS_FOCUS: AboutRegistry.ABOUT_METRICS_FOCUS,

    TESTIMONIALS_BENTO: TestimonialRegistry.TESTIMONIALS_BENTO,
    TESTIMONIALS_CAROUSEL: TestimonialRegistry.TESTIMONIALS_CAROUSEL,
    TESTIMONIALS_GRID_PHOTOS: TestimonialRegistry.TESTIMONIALS_GRID_PHOTOS,
    TESTIMONIALS_QUOTE_WALL: TestimonialRegistry.TESTIMONIALS_QUOTE_WALL,

    CONTACT_SPLIT: ContactRegistry.CONTACT_SPLIT,
    CONTACT_NEON_MODERN: ContactRegistry.CONTACT_NEON_MODERN,
    CONTACT_SOCIAL_ONLY: ContactRegistry.CONTACT_SOCIAL_ONLY,
    CONTACT_CARD_SIMPLE: ContactRegistry.CONTACT_CARD_SIMPLE,
    CONTACT_FORM_FULL: ContactRegistry.CONTACT_FORM_FULL,
    CONTACT_FORM_DARK: ContactRegistry.CONTACT_DARK_SASS,
    CONTACT_DARK_SASS: ContactRegistry.CONTACT_DARK_SASS,
    CONTACT_MINIMAL_SIMPLE: ContactRegistry.CONTACT_MINIMAL_SIMPLE,
    FORM_MINIMALIST: ContactRegistry.FORM_MINIMALIST,
    FORM_ELEGANT_SPLIT: ContactRegistry.FORM_ELEGANT_SPLIT,
    FORM_TECH_AUDIT: ContactRegistry.FORM_TECH_AUDIT,

    STATS_COUNTER_GRID: StatsRegistry.STATS_COUNTER_GRID,
    STATS_TIMELINE: StatsRegistry.STATS_TIMELINE,
    STATS_CIRCULAR_PROGRESS: StatsRegistry.STATS_CIRCULAR_PROGRESS,
    STATS_COMPARISON_TABLE: StatsRegistry.STATS_COMPARISON_TABLE,
    STATS_ACHIEVEMENT_BADGES: StatsRegistry.STATS_ACHIEVEMENT_BADGES,
    STATS_ANIMATED_COUNTERS: StatsRegistry.STATS_ANIMATED_COUNTERS,
    STATS_ICON_CARDS: StatsRegistry.STATS_ICON_CARDS,
    STATS_MINIMAL_INLINE: StatsRegistry.STATS_MINIMAL_INLINE,
    STATS_LARGE_NUMBERS: StatsRegistry.STATS_LARGE_NUMBERS,

    CTA_HERO_INLINE: CTARegistry.CTA_HERO_INLINE,
    CTA_SPLIT_VISUAL: CTARegistry.CTA_SPLIT_VISUAL,
    CTA_BANNER_STICKY: CTARegistry.CTA_BANNER_STICKY,
    CTA_CENTERED_BOLD: CTARegistry.CTA_CENTERED_BOLD,
    CTA_CARD_HOVER: CTARegistry.CTA_CARD_HOVER,
    CTA_NEWSLETTER_INLINE: CTARegistry.CTA_NEWSLETTER_INLINE,
    CTA_CONTACT_MINI: CTARegistry.CTA_CONTACT_MINI,

    FOOTER_MINIMAL: FooterRegistry.FOOTER_MINIMAL,
    FOOTER_SOCIAL_HEAVY: FooterRegistry.FOOTER_SOCIAL_HEAVY,
    FOOTER_NEWSLETTER: FooterRegistry.FOOTER_NEWSLETTER,
    FOOTER_MULTI_COLUMN: FooterRegistry.FOOTER_MULTI_COLUMN,
    FOOTER_STICKY_CTA: FooterRegistry.FOOTER_STICKY_CTA,
    FOOTER_DARK_DETAILED: FooterRegistry.FOOTER_DARK_DETAILED,
    FOOTER_SINGLE_LINE: FooterRegistry.FOOTER_SINGLE_LINE,
    FOOTER_BRAND_FOCUS: FooterRegistry.FOOTER_BRAND_FOCUS,
    FOOTER_DARK_SASS: FooterRegistry.FOOTER_DARK_SASS,
    FOOTER_AGENCY_BOLD: FooterRegistry.FOOTER_AGENCY_BOLD,
    FOOTER_MINIMAL_SIMPLE: FooterRegistry.FOOTER_MINIMAL_SIMPLE,
};


export const getComponent = (id: string) => {
    return Registry[id];
};
