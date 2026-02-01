export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: 'free' | 'pro' | 'enterprise';
}

export type BuildStatus = 'idle' | 'analyzing' | 'generating' | 'styling' | 'synthesizing' | 'ready' | 'deploying' | 'completed';

export interface ListItem {
  id: string;
  [key: string]: string;
}

export interface ListField {
  key: string;
  label: string;
  type: 'text' | 'image' | 'link' | 'rich-text';
}

export interface Placeholder {
  id: string;
  label: string;
  currentValue: string;
  type: 'image' | 'link' | 'text' | 'rich-text' | 'list';
  listItems?: ListItem[];
  listSchema?: ListField[];
  listItemTemplate?: string;
}

export interface PortfolioData {
  id: string;
  portfolioId?: string;
  name: string;
  html: string;
  css: string;
  js: string;
  structuredContent: any;
  theme: 'dark' | 'light';
  layout: LayoutType;
  niche?: string;
  subdomain?: string;
  templateId?: string;
  templates?: Record<string, string>;
}

export interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export interface Template {
  id: string;
  name: string;
  niche: string;
  preview: string;
  html: string;
  css: string;
  initialPlaceholders?: Placeholder[];
  structuredContent?: any;
  fonts?: { title: string; body: string; mono: string };
}

export interface Portfolio {
  id?: string;
  name: string;
  niche?: string;
  status?: 'draft' | 'published' | 'failed';
  subdomain?: string;
  githubRepo?: string;
  createdAt?: Date | string;
  html?: string;
  css?: string;
  js?: string;
  structuredContent?: any;
}

export enum LayoutType {
  MODERN_VERTICAL = 'MODERN_VERTICAL',
  MINIMAL_CENTERED = 'MINIMAL_CENTERED',
  BRUTALIST_OVERLAY = 'BRUTALIST_OVERLAY',
  ELEGANT_SPLIT = 'ELEGANT_SPLIT',
  BENTO_GRID = 'BENTO_GRID',
  NEON_CYBERPUNK = 'NEON_CYBERPUNK',
  BAUHAUS_GEO = 'BAUHAUS_GEO',
  SIDEBAR_NAVI = 'SIDEBAR_NAVI',
  MAGAZINE_STYLE = 'MAGAZINE_STYLE',
  TERMINAL_RETRO = 'TERMINAL_RETRO',
  GLASSMORPHISM = 'GLASSMORPHISM',
  MASONRY_FLOW = 'MASONRY_FLOW',
  FULLSCREEN_SNAP = 'FULLSCREEN_SNAP',
  NEUMORPHIC_SOFT = 'NEUMORPHIC_SOFT',
  RADIAL_ORGANIC = 'RADIAL_ORGANIC',
  FUTURISTIC_QUARTZ = 'FUTURISTIC_QUARTZ',
  ACADEMIC_FORMAL = 'ACADEMIC_FORMAL',
  STREET_AESTHETIC = 'STREET_AESTHETIC',
  MONOSPACE_DRAFT = 'MONOSPACE_DRAFT',
  GHOST_UI = 'GHOST_UI',
  TIMELINE = 'TIMELINE',
  CARD_STACK = 'CARD_STACK',
  MOSAIC = 'MOSAIC',
  ACCORDION = 'ACCORDION',
  TABBED = 'TABBED',
  PARALLAX = 'PARALLAX',
  FLIP_CARD = 'FLIP_CARD',
  TIMELINE_VERTICAL = 'TIMELINE_VERTICAL',
  GRID_MASONRY = 'GRID_MASONRY',
  HORIZONTAL_SCROLL = 'HORIZONTAL_SCROLL'
}

export interface Manifest {
  metadata: {
    version: string;
    niche: string;
    generatedAt: string;
  };
  globalConfig: {
    theme: string; // Resolves to DESIGN_SCHEMES (e.g. 'CYBER_NEON', 'dark', 'light')
    colorPalette: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      heading: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      monoFont: string;
    };
  };
  sections: Array<ManifestSection>;
}

export interface ManifestSection {
  id: string;
  type: 'header' | 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'contact' | 'testimonials' | 'education' | 'certifications' | 'blog' | 'footer' | 'cta' | 'stats' | 'services' | 'pricing' | 'faq' | 'logos' | 'process' | 'gallery' | 'team' | 'video';
  componentId: string;
  template?: string; // Used when componentId is 'GEN_TEMPLATE'
  content: any;
  settings: {
    isVisible?: boolean;
    padding?: 'small' | 'medium' | 'large' | 'none';
  };
}
