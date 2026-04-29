
export interface ComponentMetadata {
    id: string;
    name: string;
    category: 'header' | 'hero' | 'about' | 'projects' | 'experience' | 'skills' | 'contact' | 'testimonials' | 'footer' | 'cta' | 'stats' | 'services' | 'pricing' | 'faq' | 'logos' | 'process' | 'blog' | 'gallery' | 'team';
    niche?: string[];
    previewImage?: string;
    description?: string;
}

export const RegistryMetadata: Record<string, ComponentMetadata> = {
    // HEROES
    HERO_MODERN_SPLIT: { id: 'HERO_MODERN_SPLIT', name: 'Modern Split', category: 'hero', niche: ['Creative', 'General'], description: 'Split layout with high-impact typography.' },
    HERO_CENTERED_MINIMAL: { id: 'HERO_CENTERED_MINIMAL', name: 'Centered Minimal', category: 'hero', niche: ['General', 'Academic'], description: 'Balanced centered layout with focus on content.' },
    HERO_CYBER_MONO: { id: 'HERO_CYBER_MONO', name: 'Cyber Mono', category: 'hero', niche: ['Engineering', 'Tech'], description: 'Monospaced technical feel.' },
    HERO_VISUALIST: { id: 'HERO_VISUALIST', name: 'Visualist', category: 'hero', niche: ['Creative', 'Photography'], description: 'Full-width visual impact.' },
    HERO_EXECUTIVE: { id: 'HERO_EXECUTIVE', name: 'Executive Bold', category: 'hero', niche: ['Business', 'Consulting'], description: 'Authoritative layout for leaders.' },
    HERO_DYNAMIC_GRADIENT: { id: 'HERO_DYNAMIC_GRADIENT', name: 'Dynamic Gradient', category: 'hero', niche: ['Creative', 'Tech'], description: 'Animated backgrounds with high-impact type.' },
    HERO_MINIMAL_ELEGANCE: { id: 'HERO_MINIMAL_ELEGANCE', name: 'Minimal Elegance', category: 'hero', niche: ['Luxury', 'Creative'], description: 'Sophisticated layout with spinning text badge.' },
    HERO_GLASS_FLOATING: { id: 'HERO_GLASS_FLOATING', name: 'Glass Floating', category: 'hero', niche: ['Creative', 'General'], description: 'Glassmorphic cards over soft backgrounds.' },
    HERO_NEOBRUTALIST: { id: 'HERO_NEOBRUTALIST', name: 'Neo-Brutalist', category: 'hero', niche: ['Startup', 'Creative'], description: 'Bold borders and high contrast.' },
    HERO_GRID_LAYOUT: { id: 'HERO_GRID_LAYOUT', name: 'Grid Architecture', category: 'hero', niche: ['Engineering', 'Architecture'], description: 'Structure-heavy grid for precise identities.' },
    HERO_MINIMAL_LEFT: { id: 'HERO_MINIMAL_LEFT', name: 'Minimal Left', category: 'hero', niche: ['Academic', 'Simple'], description: 'Ultra-clean left-aligned layout.' },
    HERO_STACKED_BOLD: { id: 'HERO_STACKED_BOLD', name: 'Stacked Bold', category: 'hero', niche: ['Fashion', 'Creative'], description: 'Vertical typography with image overlay.' },
    HERO_TERMINAL_STYLE: { id: 'HERO_TERMINAL_STYLE', name: 'Terminal CLI', category: 'hero', niche: ['Tech', 'DevOps'], description: 'Full terminal aesthetic with interactive feel.' },
    HERO_VIDEO_BG: { id: 'HERO_VIDEO_BG', name: 'Cinematic Video', category: 'hero', niche: ['Media', 'Agency'], description: 'Immersive video background layout.' },
    HERO_MAGAZINE: { id: 'HERO_MAGAZINE', name: 'Editorial Magazine', category: 'hero', niche: ['Fashion', 'Media'], description: 'Magazine cover style with serif typography.' },
    HERO_PARALLAX_LAYERS: { id: 'HERO_PARALLAX_LAYERS', name: 'Parallax Horizon', category: 'hero', niche: ['Creative', 'Gaming'], description: 'Multi-layer depth with parallax scroll.' },
    HERO_CIRCLE_AVATAR: { id: 'HERO_CIRCLE_AVATAR', name: 'Professional Circle', category: 'hero', niche: ['Medical', 'Legal'], description: 'Large centered avatar with radial text.' },
    HERO_SPLIT_DIAGONAL: { id: 'HERO_SPLIT_DIAGONAL', name: 'Diagonal Split', category: 'hero', niche: ['Design', 'Creative'], description: 'Skewed layout separating text and visual.' },
    HERO_GRADIENT_TEXT: { id: 'HERO_GRADIENT_TEXT', name: 'Gradient Bold', category: 'hero', niche: ['Startup', 'Impact'], description: 'Oversized gradient typography focus.' },
    HERO_CARD_STACK: { id: 'HERO_CARD_STACK', name: 'Resource Stack', category: 'hero', niche: ['Startup', 'Developer'], description: 'Stacked card reveal layout.' },
    HERO_SIDEBAR_LEFT: { id: 'HERO_SIDEBAR_LEFT', name: 'Navigational Side', category: 'hero', niche: ['Portfolio', 'Agency'], description: 'Fixed left sidebar with main content right.' },
    HERO_PHOTO_MOSAIC: { id: 'HERO_PHOTO_MOSAIC', name: 'Photo Mosaic', category: 'hero', niche: ['Photography', 'Artist'], description: 'Collage background for visual portfolios.' },
    HERO_AGENCY_VIBRANT: { id: 'HERO_AGENCY_VIBRANT', name: 'Agency Vibrant', category: 'hero', niche: ['Agency', 'Marketing'], description: 'Bold split layout with pulsating availability badge.' },
    HERO_MINIMAL_CREATOR: { id: 'HERO_MINIMAL_CREATOR', name: 'Minimal Creator', category: 'hero', niche: ['Creator', 'Minimalist'], description: 'Centered profile with large serif tagline.' },
    HERO_MINIMALIST_CREATOR: { id: 'HERO_MINIMALIST_CREATOR', name: 'Minimalist Creator', category: 'hero', niche: ['Virtual Assistant', 'Minimalist'], description: 'Clean split layout with grayscale imagery.' },
    HERO_GLITCH_TEXT: { id: 'HERO_GLITCH_TEXT', name: 'Cyber Glitch', category: 'hero', niche: ['Tech', 'Creative'], description: 'Glitch effect typography focus.' },
    HERO_SMOOTH_SWEEP: { id: 'HERO_SMOOTH_SWEEP', name: 'Smooth Sweep', category: 'hero', niche: ['Modern', 'Agency'], description: 'Identity standard layout with pulse effects.' },
    HERO_GRID_PORTRAIT: { id: 'HERO_GRID_PORTRAIT', name: 'Grid Portrait', category: 'hero', niche: ['Portfolio', 'Artist'], description: 'Large portrait image with diagonal text.' },
    HERO_DARK_SASS: { id: 'HERO_DARK_SASS', name: 'Dark SASS Hero', category: 'hero', niche: ['Tech', 'SaaS'], description: 'Immersive dark hero with glowing radial accents.' },

    // PROJECTS
    PROJ_BENTO_GRID: { id: 'PROJ_BENTO_GRID', name: 'Bento Grid', category: 'projects', niche: ['Tech', 'Creative'], description: 'Modern mosaic layout.' },
    PROJ_MINIMAL_CARDS: { id: 'PROJ_MINIMAL_CARDS', name: 'Minimal Cards', category: 'projects', niche: ['General'], description: 'Simple, elegant card grid.' },
    PROJ_GITHUB_STYLE: { id: 'PROJ_GITHUB_STYLE', name: 'Github Style', category: 'projects', niche: ['Engineering'], description: 'Repository-style list view.' },
    PROJ_STACKED_LIST: { id: 'PROJ_STACKED_LIST', name: 'Stacked List', category: 'projects', niche: ['Consulting', 'Business'], description: 'Clean vertical list.' },
    PROJ_CAROUSEL_FULLSCREEN: { id: 'PROJ_CAROUSEL_FULLSCREEN', name: 'Fullscreen Carousel', category: 'projects', niche: ['Photography', 'Creative'], description: 'Immersive sliding experience.' },
    PROJ_MASONRY: { id: 'PROJ_MASONRY', name: 'Masonry Gallery', category: 'projects', niche: ['Creative', 'Art'], description: 'Adaptive columns for various image sizes.' },
    PROJ_CASE_STUDY: { id: 'PROJ_CASE_STUDY', name: 'Deep Case Study', category: 'projects', niche: ['Agency', 'UX'], description: 'Process-focused vertical layout.' },
    PROJ_THUMBNAIL_GRID: { id: 'PROJ_THUMBNAIL_GRID', name: 'Compact Grid', category: 'projects', niche: ['Creative', 'Photography'], description: 'Small tiles that expand on hover.' },
    PROJ_FEATURED_SINGLE: { id: 'PROJ_FEATURED_SINGLE', name: 'Featured Work', category: 'projects', niche: ['Minimalist'], description: 'Focuses on one major masterpiece.' },
    PROJ_TIMELINE_VERTICAL: { id: 'PROJ_TIMELINE_VERTICAL', name: 'Chronological Works', category: 'projects', niche: ['Chronological'], description: 'Projects mapped along a timeline.' },
    PROJ_AGENCY_CASE_STUDY: { id: 'PROJ_AGENCY_CASE_STUDY', name: 'Agency Case Study', category: 'projects', niche: ['Agency'], description: 'Result-oriented case study cards with metrics.' },
    PROJ_DARK_SASS: { id: 'PROJ_DARK_SASS', name: 'Dark SASS Projects', category: 'projects', niche: ['Tech'], description: 'Detailed project cards with tech badges and icons.' },

    // SKILLS
    SKILLS_MARQUEE: { id: 'SKILLS_MARQUEE', name: 'Infinite Marquee', category: 'skills', niche: ['General'], description: 'Scrolling ticker style.' },
    SKILLS_GRID_ICONS: { id: 'SKILLS_GRID_ICONS', name: 'Icon Grid', category: 'skills', niche: ['Tech', 'Creative'], description: 'Grid with visual icons.' },
    SKILLS_PROGRESS_BARS: { id: 'SKILLS_PROGRESS_BARS', name: 'Level Meters', category: 'skills', niche: ['General', 'Engineering'], description: 'Visual proficiency bars.' },
    SKILLS_TAGS_CLOUD: { id: 'SKILLS_TAGS_CLOUD', name: 'Tag Cloud', category: 'skills', niche: ['Creative'], description: 'Scattered layout for many skills.' },
    SKILLS_HEXAGON_GRID: { id: 'SKILLS_HEXAGON_GRID', name: 'Honeycomb Hex', category: 'skills', niche: ['Tech', 'Gaming'], description: 'Futuristic hexagon honeycomb.' },
    SKILLS_RADAR_CHART: { id: 'SKILLS_RADAR_CHART', name: 'Radar Spider', category: 'skills', niche: ['Data', 'Tech'], description: 'Multi-dimensional competence chart.' },
    SKILLS_AGENCY: { id: 'SKILLS_AGENCY', name: 'Agency Stack', category: 'skills', niche: ['Agency'], description: 'Tech stack icons with labels.' },
    SKILLS_DARK_SASS: { id: 'SKILLS_DARK_SASS', name: 'Dark SASS Stack', category: 'skills', niche: ['Tech'], description: 'Grid of specialized tool cards with hover states.' },

    // --- ENGINEERING ---
    SKILLS_ENG_BENTO: { id: 'SKILLS_ENG_BENTO', name: 'Engineering Bento', category: 'skills', niche: ['Engineering', 'Tech'], description: 'Bento-style grid with tech icons.' },
    SKILLS_ENG_TERMINAL: { id: 'SKILLS_ENG_TERMINAL', name: 'Terminal Manifest', category: 'skills', niche: ['Engineering', 'DevOps'], description: 'Code-centric terminal display of skills.' },
    SKILLS_ENG_CIRCUIT: { id: 'SKILLS_ENG_CIRCUIT', name: 'Circuit Architecture', category: 'skills', niche: ['Engineering', 'Systems'], description: 'Interconnected circuit-style skill nodes.' },

    // --- CREATIVE ---
    SKILLS_CREATIVE_MASONRY: { id: 'SKILLS_CREATIVE_MASONRY', name: 'Creative Masonry', category: 'skills', niche: ['Creative', 'Design'], description: 'Irregular masonry layout for creative tools.' },
    SKILLS_CREATIVE_PALETTE: { id: 'SKILLS_CREATIVE_PALETTE', name: 'Tool Palette', category: 'skills', niche: ['Creative', 'Art'], description: 'Progress-style bars representing a creative palette.' },
    SKILLS_CREATIVE_CARDS: { id: 'SKILLS_CREATIVE_CARDS', name: 'Arsenal Cards', category: 'skills', niche: ['Creative', 'General'], description: 'Vertical playing cards for skills.' },

    // --- BUSINESS ---
    SKILLS_BIZ_CARDS: { id: 'SKILLS_BIZ_CARDS', name: 'Business Competencies', category: 'skills', niche: ['Business', 'Management'], description: 'Professional cards with progress indicators.' },
    SKILLS_BIZ_LIST: { id: 'SKILLS_BIZ_LIST', name: 'Expertise Overview', category: 'skills', niche: ['Business', 'Consulting'], description: 'Clean list with dot-based proficiency.' },
    SKILLS_BIZ_PIE: { id: 'SKILLS_BIZ_PIE', name: 'Skill Distribution', category: 'skills', niche: ['Business', 'Data'], description: 'Circular charts showing skill distribution.' },

    // --- FINANCE ---
    SKILLS_FIN_MATRIX: { id: 'SKILLS_FIN_MATRIX', name: 'Skill Matrix', category: 'skills', niche: ['Finance', 'Data'], description: 'Data-heavy table matrix for skills.' },
    SKILLS_FIN_TICKER: { id: 'SKILLS_FIN_TICKER', name: 'Market Ticker', category: 'skills', niche: ['Finance', 'Business'], description: 'Scrolling stock-style ticker for skills.' },
    SKILLS_FIN_CHART: { id: 'SKILLS_FIN_CHART', name: 'Proficiency Chart', category: 'skills', niche: ['Finance', 'Analytics'], description: 'Bar chart showing skill distribution.' },

    // --- MARKETING ---
    SKILLS_MKT_FUNNEL: { id: 'SKILLS_MKT_FUNNEL', name: 'Growth Funnel', category: 'skills', niche: ['Marketing', 'Growth'], description: 'Funnel-style layout for marketing stack.' },
    SKILLS_MKT_BUBBLES: { id: 'SKILLS_MKT_BUBBLES', name: 'Ecosystem Bubbles', category: 'skills', niche: ['Marketing', 'Social'], description: 'Interactive bubble cloud of tools.' },
    SKILLS_MKT_CAROUSEL: { id: 'SKILLS_MKT_CAROUSEL', name: 'Platform Carousel', category: 'skills', niche: ['Marketing', 'Media'], description: 'Bold scrolling carousel of platforms.' },

    // --- AGENCY ---
    SKILLS_AGC_NEOBRUTAL: { id: 'SKILLS_AGC_NEOBRUTAL', name: 'Neobrutalist Skills', category: 'skills', niche: ['Agency', 'Creative'], description: 'High-contrast bold skill cards.' },
    SKILLS_AGC_GLASS: { id: 'SKILLS_AGC_GLASS', name: 'Glass Prowess', category: 'skills', niche: ['Agency', 'Modern'], description: 'Glassmorphic nodes with floating blobs.' },
    SKILLS_AGC_MINIMAL: { id: 'SKILLS_AGC_MINIMAL', name: 'Minimal Expertise', category: 'skills', niche: ['Agency', 'Minimalist'], description: 'Large typographic list with hover reveal.' },

    // EXPERIENCE
    EXP_TIMELINE_VERTICAL: { id: 'EXP_TIMELINE_VERTICAL', name: 'Vertical Timeline', category: 'experience', niche: ['General'], description: 'Alternating professional journey.' },
    EXP_ACCORDION_MINIMAL: { id: 'EXP_ACCORDION_MINIMAL', name: 'Collapsible List', category: 'experience', niche: ['Tech', 'Compact'], description: 'Space-saving expandable items.' },
    EXP_CARDS_GRID: { id: 'EXP_CARDS_GRID', name: 'Role Cards', category: 'experience', niche: ['General', 'Creative'], description: 'Grid of company-branded cards.' },
    EXP_HORIZONTAL_SCROLL: { id: 'EXP_HORIZONTAL_SCROLL', name: 'Career Horizon', category: 'experience', niche: ['Modern', 'Creative'], description: 'Horizontal scrolling history.' },
    EXP_TABS_SWITCH: { id: 'EXP_TABS_SWITCH', name: 'Tabbed Careers', category: 'experience', niche: ['Corporate', 'Compact'], description: 'Switch between roles via tabs.' },
    EXP_SIDEBAR_LIST: { id: 'EXP_SIDEBAR_LIST', name: 'Legacy Sidebar', category: 'experience', niche: ['Corporate', 'Detailed'], description: 'Navigable list with side details.' },
    EXP_GLASSMORPHIC: { id: 'EXP_GLASSMORPHIC', name: 'Glass Cards', category: 'experience', niche: ['Modern', 'Creative'], description: 'Glassmorphic frosted role cards.' },
    EXP_MAGAZINE: { id: 'EXP_MAGAZINE', name: 'Editorial', category: 'experience', niche: ['Creative', 'Agency'], description: 'Magazine-style featured role layout.' },
    EXP_NUMBERED_LIST: { id: 'EXP_NUMBERED_LIST', name: 'Numbered Roles', category: 'experience', niche: ['Minimal', 'General'], description: 'Clean numbered list of positions.' },

    // ABOUT
    ABOUT_NARRATIVE: { id: 'ABOUT_NARRATIVE', name: 'Philosophy', category: 'about', niche: ['General'], description: 'Story-focused centered text.' },
    ABOUT_STATS: { id: 'ABOUT_STATS', name: 'Stats Grid', category: 'about', niche: ['Business'], description: 'Highlight data points.' },
    ABOUT_IMAGE_WRAP: { id: 'ABOUT_IMAGE_WRAP', name: 'Image Side', category: 'about', niche: ['Creative'], description: 'Image paired with highlights.' },
    ABOUT_GLASS_DECONSTRUCTED: { id: 'ABOUT_GLASS_DECONSTRUCTED', name: 'Deconstructed Glass', category: 'about', niche: ['Tech', 'Creative'], description: 'Multi-image glassmorphic layout.' },
    ABOUT_TIMELINE_PERSONAL: { id: 'ABOUT_TIMELINE_PERSONAL', name: 'Personal Journey', category: 'about', niche: ['General', 'Academic'], description: 'Life milestones timeline.' },
    ABOUT_SPLIT_COLUMNS: { id: 'ABOUT_SPLIT_COLUMNS', name: 'Dual Column', category: 'about', niche: ['Consulting', 'Business'], description: 'Image and text side-by-side.' },
    ABOUT_QUOTE_FOCUS: { id: 'ABOUT_QUOTE_FOCUS', name: 'Manifesto Quote', category: 'about', niche: ['Creative', 'Leader'], description: 'Large quote centerpiece.' },
    ABOUT_VIDEO_INTRO: { id: 'ABOUT_VIDEO_INTRO', name: 'Video Story', category: 'about', niche: ['Influencer', 'Media'], description: 'Video introduction layout.' },
    ABOUT_METRICS_FOCUS: { id: 'ABOUT_METRICS_FOCUS', name: 'ROI Performance', category: 'about', niche: ['Finance', 'Business'], description: 'Focus on growth statistics.' },
    ABOUT_MINIMAL_PROBLEMS: { id: 'ABOUT_MINIMAL_PROBLEMS', name: 'Problem Agitator', category: 'about', niche: ['Copywriting'], description: 'Pain-point focused list with solution reveal.' },
    ABOUT_MINIMAL_BIO: { id: 'ABOUT_MINIMAL_BIO', name: 'Minimal Bio', category: 'about', niche: ['Personal'], description: 'Clean split bio with stats.' },

    // TESTIMONIALS
    TESTIMONIALS_BENTO: { id: 'TESTIMONIALS_BENTO', name: 'Bento Social', category: 'testimonials', niche: ['General'], description: 'Clean bento grid proof.' },
    TESTIMONIALS_CAROUSEL: { id: 'TESTIMONIALS_CAROUSEL', name: 'Global Recommends', category: 'testimonials', niche: ['General'], description: 'Sliding carousel of quotes.' },
    TESTIMONIALS_GRID_PHOTOS: { id: 'TESTIMONIALS_GRID_PHOTOS', name: 'Client Portraits', category: 'testimonials', niche: ['Trust', 'Photography'], description: 'Grid with client headshots.' },
    TESTIMONIALS_QUOTE_WALL: { id: 'TESTIMONIALS_QUOTE_WALL', name: 'Wall of Gratitude', category: 'testimonials', niche: ['Social Proof'], description: 'Dense wall of short praises.' },
    TESTIMONIALS_AGENCY_QUOTES: { id: 'TESTIMONIALS_AGENCY_QUOTES', name: 'Agency Quotes', category: 'testimonials', niche: ['Agency'], description: 'High-impact client success stories.' },
    TESTIMONIALS_MINIMAL_SINGLE: { id: 'TESTIMONIALS_MINIMAL_SINGLE', name: 'Minimal Quote', category: 'testimonials', niche: ['Minimalist'], description: 'Single centered testimonial focus.' },

    // CONTACT
    CONTACT_SPLIT: { id: 'CONTACT_SPLIT', name: 'Split Direct', category: 'contact', niche: ['General'], description: 'Contact info paired with form.' },
    CONTACT_NEON_MODERN: { id: 'CONTACT_NEON_MODERN', name: 'Neon Connection', category: 'contact', niche: ['Tech', 'Creative'], description: 'High-contrast dark form.' },
    CONTACT_SOCIAL_ONLY: { id: 'CONTACT_SOCIAL_ONLY', name: 'Grid Relay', category: 'contact', niche: ['Influencer', 'Modern'], description: 'Icon-focused link grid.' },
    CONTACT_CARD_SIMPLE: { id: 'CONTACT_CARD_SIMPLE', name: 'Clean Coordinates', category: 'contact', niche: ['General', 'Minimal'], description: 'Centered contact card.' },
    CONTACT_FORM_FULL: { id: 'CONTACT_FORM_FULL', name: 'Secure Inquiry', category: 'contact', niche: ['Corporate', 'B2B'], description: 'In-depth professional form.' },
    CONTACT_MINIMAL_SIMPLE: { id: 'CONTACT_MINIMAL_SIMPLE', name: 'Minimal Contact', category: 'contact', niche: ['Minimalist'], description: 'Clean form on dark background.' },
    CONTACT_DARK_SASS: { id: 'CONTACT_DARK_SASS', name: 'Dark SASS Contact', category: 'contact', niche: ['Tech'], description: 'Audit-focused contact form with gradient action.' },

    // FOOTERS
    FOOTER_MINIMAL: { id: 'FOOTER_MINIMAL', name: 'Minimal One-line', category: 'footer', description: 'Simple socials + copyright.' },
    FOOTER_SOCIAL_HEAVY: { id: 'FOOTER_SOCIAL_HEAVY', name: 'Social Anchor', category: 'footer', description: 'Large social icons + CTA.' },
    FOOTER_NEWSLETTER: { id: 'FOOTER_NEWSLETTER', name: 'Engage Footer', category: 'footer', description: 'Includes newsletter signup.' },
    FOOTER_MULTI_COLUMN: { id: 'FOOTER_MULTI_COLUMN', name: 'Corporate Info', category: 'footer', description: 'Multi-nav columns for agencies.' },
    FOOTER_STICKY_CTA: { id: 'FOOTER_STICKY_CTA', name: 'Navigational CTA', category: 'footer', description: 'Sticky banner style.' },
    FOOTER_DARK_DETAILED: { id: 'FOOTER_DARK_DETAILED', name: 'System Detailed', category: 'footer', description: 'Dark high-info layout.' },
    FOOTER_SINGLE_LINE: { id: 'FOOTER_SINGLE_LINE', name: 'Edition Line', category: 'footer', description: 'Ultra-minimal textual line.' },
    FOOTER_BRAND_FOCUS: { id: 'FOOTER_BRAND_FOCUS', name: 'Legacy Brand', category: 'footer', description: 'Large brand typography centerpiece.' },
    FOOTER_AGENCY_BOLD: { id: 'FOOTER_AGENCY_BOLD', name: 'Agency Bold', category: 'footer', description: 'High-contrast footer with social focus.' },
    FOOTER_MINIMAL_SIMPLE: { id: 'FOOTER_MINIMAL_SIMPLE', name: 'Minimal Simple', category: 'footer', description: 'Just copyright.' },
    FOOTER_DARK_SASS: { id: 'FOOTER_DARK_SASS', name: 'Dark SASS Footer', category: 'footer', description: 'Minimalist mono-font footer with brand focus.' },

    // STATS
    STATS_COUNTER_GRID: { id: 'STATS_COUNTER_GRID', name: 'Digital Counters', category: 'stats', description: 'Animated performance metrics.' },
    STATS_TIMELINE: { id: 'STATS_TIMELINE', name: 'Growth Steps', category: 'stats', description: 'Milestones mapped in time.' },
    STATS_CIRCULAR_PROGRESS: { id: 'STATS_CIRCULAR_PROGRESS', name: 'Radial Mastery', category: 'stats', description: 'Pie charts for skill areas.' },
    STATS_ANIMATED_COUNTERS: { id: 'STATS_ANIMATED_COUNTERS', name: 'Impact Numbers', category: 'stats', description: 'Large bold numeric data.' },
    STATS_ICON_CARDS: { id: 'STATS_ICON_CARDS', name: 'Metrics Grid', category: 'stats', description: 'Stat cards with illustrative icons.' },
    STATS_MINIMAL_INLINE: { id: 'STATS_MINIMAL_INLINE', name: 'Inline Metrics', category: 'stats', description: 'Compact horizontal stats row.' },
    STATS_LARGE_NUMBERS: { id: 'STATS_LARGE_NUMBERS', name: 'Bold Performance', category: 'stats', description: 'Oversized numbers as background art.' },
    STATS_AGENCY_TICKER: { id: 'STATS_AGENCY_TICKER', name: 'Agency Ticker', category: 'stats', description: 'Horizontal stats strip.' },

    // CTAs
    CTA_HERO_INLINE: { id: 'CTA_HERO_INLINE', name: 'Launchpad', category: 'cta', description: 'Hero-style centered action.' },
    CTA_SPLIT_VISUAL: { id: 'CTA_SPLIT_VISUAL', name: 'Visual Hook', category: 'cta', description: 'Image-paired conversation starter.' },
    CTA_BANNER_STICKY: { id: 'CTA_BANNER_STICKY', name: 'Urgency Banner', category: 'cta', description: 'Bottom sticky sales bar.' },
    CTA_CENTERED_BOLD: { id: 'CTA_CENTERED_BOLD', name: 'Impact Prompt', category: 'cta', description: 'Fullscreen bold command.' },
    CTA_NEWSLETTER_INLINE: { id: 'CTA_NEWSLETTER_INLINE', name: 'Community Join', category: 'cta', description: 'Direct newsletter acquisition.' },
    CTA_CONTACT_MINI: { id: 'CTA_CONTACT_MINI', name: 'Shortcut Deck', category: 'cta', description: 'Compact direct link card.' },

    // SERVICES
    SERVICES_GLOW_GRID: { id: 'SERVICES_GLOW_GRID', name: 'Neon Glow Grid', category: 'services', niche: ['Tech', 'Agency'], description: 'High-tech grid with interactive glow states.' },
    SERVICES_CARDS_INTERACTIVE: { id: 'SERVICES_CARDS_INTERACTIVE', name: 'Interactive Cards', category: 'services', description: 'Grid of floating cards with hover effects.' },
    SERVICES_GLASS_BENTO: { id: 'SERVICES_GLASS_BENTO', name: 'Glass Bento Service', category: 'services', description: 'Glassmorphic bento layout for capabilities.' },
    SERVICES_LIST_MINIMAL: { id: 'SERVICES_LIST_MINIMAL', name: 'Process Flow List', category: 'services', description: 'Minimalist list with animated arrows.' },
    SERVICES_AGENCY_GRID: { id: 'SERVICES_AGENCY_GRID', name: 'Agency Services', category: 'services', description: 'Grid with icons and feature bullets.' },
    SERVICES_MINIMAL_LIST: { id: 'SERVICES_MINIMAL_LIST', name: 'Minimal Services', category: 'services', description: 'Clean list of services with bullets.' },
    SERVICES_DARK_SASS: { id: 'SERVICES_DARK_SASS', name: 'Dark SASS Services', category: 'services', description: 'Clean dark cards for service offerings.' },

    // PRICING
    PRICING_MODERN_TIERS: { id: 'PRICING_MODERN_TIERS', name: 'Investment Tiers', category: 'pricing', description: 'Modern, clean pricing cards with feature lists.' },
    PRICING_MINIMAL_CARDS: { id: 'PRICING_MINIMAL_CARDS', name: 'Minimal Pricing', category: 'pricing', description: 'Clean pricing cards with simple options.' },

    // FAQ
    FAQ_ACCORDION_NEON: { id: 'FAQ_ACCORDION_NEON', name: 'Neon Questions', category: 'faq', description: 'Stylish accordion with neon accents.' },

    // HEADERS
    HEADER_MINIMALIST: { id: 'HEADER_MINIMALIST', name: 'Minimal Header', category: 'header', niche: ['General'], description: 'Clean logo with right-aligned nav.' },
    HEADER_AGENCY_VIBRANT: { id: 'HEADER_AGENCY_VIBRANT', name: 'Vibrant Agency', category: 'header', niche: ['Agency'], description: 'Bold with hover effects and CTA.' },
    HEADER_TECH_GLOW: { id: 'HEADER_TECH_GLOW', name: 'Tech Glow', category: 'header', niche: ['Tech'], description: 'Dark mode with glowing accents.' },
    HEADER_MINIMALIST_CREATOR: { id: 'HEADER_MINIMALIST_CREATOR', name: 'Minimalist Creator Header', category: 'header', niche: ['Minimalist'], description: 'Clean serif branding with simple navigation.' },
    HEADER_DARK_SASS: { id: 'HEADER_DARK_SASS', name: 'Dark SASS Header', category: 'header', niche: ['Tech', 'SaaS'], description: 'Dark backdrop-blur header with modern navigation.' },

    // FORMS (Categorized under Contact)
    FORM_MINIMALIST: { id: 'FORM_MINIMALIST', name: 'Minimal Form', category: 'contact', niche: ['General'], description: 'Simple name and message fields.' },
    FORM_ELEGANT_SPLIT: { id: 'FORM_ELEGANT_SPLIT', name: 'Elegant Split Form', category: 'contact', niche: ['Business'], description: 'Split layout with detailed inputs.' },
    FORM_TECH_AUDIT: { id: 'FORM_TECH_AUDIT', name: 'Tech Audit Form', category: 'contact', niche: ['Tech'], description: 'specialized fields for system audits.' },

    // LOGOS
    LOGOS_STRIP_CLEAN: { id: 'LOGOS_STRIP_CLEAN', name: 'Trust Marquee', category: 'logos', description: 'Infinite scrolling logo strip for social proof.' },
    LOGOS_MINIMAL_TRUST: { id: 'LOGOS_MINIMAL_TRUST', name: 'Minimal Trust', category: 'logos', description: 'Centered static logo row.' },

    // PROCESS
    PROCESS_STEPS_VERTICAL: { id: 'PROCESS_STEPS_VERTICAL', name: 'Protocol Pipeline', category: 'process', description: 'Vertical step-by-step methodology showcase.' },
    PROCESS_TYPOGRAPHIC_STEPS: { id: 'PROCESS_TYPOGRAPHIC_STEPS', name: 'Typographic Steps', category: 'process', description: 'Numbered methodology with large serif typography.' },

    // TYPOGRAPHIC BOLD
    HERO_TYPOGRAPHIC_BOLD: { id: 'HERO_TYPOGRAPHIC_BOLD', name: 'Typographic Bold Hero', category: 'hero', niche: ['Content', 'Editorial'], description: 'Editorial-style hero with strong serif typography.' },
    STATS_TYPOGRAPHIC_GRID: { id: 'STATS_TYPOGRAPHIC_GRID', name: 'Typographic Stats', category: 'stats', description: 'Hoverable stat grid with serif emphasis.' },
    PROJ_TYPOGRAPHIC_LIST: { id: 'PROJ_TYPOGRAPHIC_LIST', name: 'Typographic Projects', category: 'projects', niche: ['Content', 'Editorial'], description: 'Timeline-style project list with hover images.' },
    SERVICES_TYPOGRAPHIC_COLS: { id: 'SERVICES_TYPOGRAPHIC_COLS', name: 'Typographic Services', category: 'services', description: 'Three-column service list with serif headings.' },
    CONTACT_TYPOGRAPHIC_CENTER: { id: 'CONTACT_TYPOGRAPHIC_CENTER', name: 'Typographic Contact', category: 'contact', description: 'Centered serif CTA.' },
    FOOTER_TYPOGRAPHIC_SIMPLE: { id: 'FOOTER_TYPOGRAPHIC_SIMPLE', name: 'Typographic Footer', category: 'footer', description: 'Minimal footer with uppercase links.' },

    // TEAM
    TEAM_GRID_EDITORIAL: { id: 'TEAM_GRID_EDITORIAL', name: 'Editorial Team', category: 'team', description: 'Professional team grid with grayscale portraits and hover effects.' },

    // GALLERY
    GALLERY_MASONRY_GLASS: { id: 'GALLERY_MASONRY_GLASS', name: 'Masonry Glass Gallery', category: 'gallery', description: 'Glassmorphic masonry layout for visual artifacts.' },
};

export const getComponentsByCategory = (category: string) => {
    return Object.values(RegistryMetadata).filter(m => m.category === category);
};
