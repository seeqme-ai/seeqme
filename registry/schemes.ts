/**
 * DESIGN SCHEMES
 * Curated high-end color palettes and typography pairs.
 * AI uses these to define the "Vibe" of a portfolio.
 */

export interface DesignScheme {
    id: string;
    name: string;
    theme: 'dark' | 'light';
    palette: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        text: string;
        heading: string;
    };
    typography: {
        heading: string;
        body: string;
        mono: string;
    };
}

export const DESIGN_SCHEMES: Record<string, DesignScheme> = {
    CYBER_NEON: {
        id: 'CYBER_NEON',
        name: 'Cyber Neon',
        theme: 'dark',
        palette: { primary: '#00f2ff', secondary: '#7000ff', background: '#020617', surface: '#0f172a', text: '#94a3b8', heading: '#ffffff' },
        typography: { heading: 'Space Grotesk', body: 'Inter', mono: 'JetBrains Mono' }
    },
    MINIMAL_PAPER: {
        id: 'MINIMAL_PAPER',
        name: 'Minimal Paper',
        theme: 'light',
        palette: { primary: '#18181b', secondary: '#71717a', background: '#fafafa', surface: '#ffffff', text: '#3f3f46', heading: '#09090b' },
        typography: { heading: 'Fraunces', body: 'Outfit', mono: 'IBM Plex Mono' }
    },
    LUXURY_GOLD: {
        id: 'LUXURY_GOLD',
        name: 'Luxury Gold',
        theme: 'dark',
        palette: { primary: '#d4af37', secondary: '#1c1c1c', background: '#0a0a0a', surface: '#141414', text: '#a0a0a0', heading: '#ffffff' },
        typography: { heading: 'Cormorant Garamond', body: 'Montserrat', mono: 'Courier Prime' }
    },
    VIBRANT_BLOOM: {
        id: 'VIBRANT_BLOOM',
        name: 'Vibrant Bloom',
        theme: 'light',
        palette: { primary: '#f43f5e', secondary: '#fb923c', background: '#fff1f2', surface: '#ffffff', text: '#881337', heading: '#4c0519' },
        typography: { heading: 'Bricolage Grotesque', body: 'Plus Jakarta Sans', mono: 'Fira Code' }
    },
    DEEP_FOREST: {
        id: 'DEEP_FOREST',
        name: 'Deep Forest',
        theme: 'dark',
        palette: { primary: '#22c55e', secondary: '#14532d', background: '#052e16', surface: '#064e3b', text: '#dcfce7', heading: '#ffffff' },
        typography: { heading: 'Syne', body: 'DM Sans', mono: 'Source Code Pro' }
    },
    OCEANIC_MIST: {
        id: 'OCEANIC_MIST',
        name: 'Oceanic Mist',
        theme: 'light',
        palette: { primary: '#0ea5e9', secondary: '#0369a1', background: '#f0f9ff', surface: '#ffffff', text: '#0c4a6e', heading: '#082f49' },
        typography: { heading: 'Clash Display', body: 'Satoshi', mono: 'Space Mono' }
    },
    COFFEE_BEAST: {
        id: 'COFFEE_BEAST',
        name: 'Coffee Beast',
        theme: 'light',
        palette: { primary: '#78350f', secondary: '#d97706', background: '#fef3c7', surface: '#fffbeb', text: '#451a03', heading: '#000000' },
        typography: { heading: 'Playfair Display', body: 'Lora', mono: 'Inconsolata' }
    }
};
