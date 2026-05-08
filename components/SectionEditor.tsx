import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { produce } from 'immer';
import set from 'lodash/set';
import debounce from 'lodash/debounce';
import { ICONS } from '@/constants';
import {
    FileText, Trash2, Type, Eye, EyeOff, Loader2, Loader,
    ChevronUp, ChevronDown, ChevronRight, ChevronDown as ChevronDownIcon,
    RefreshCw, Layers, Pencil, Plus, X, Palette, Settings2, Globe,
    User, Briefcase, Code2, FolderOpen, Phone, Star, BarChart2,
    Cpu, Target, Image as ImageIcon, Footprints, MapPin, Mail,
    Link as LinkIcon, GripVertical, Check, Wand2, AlertTriangle,
    SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import cloudinaryService from '@/services/cloudinaryService';
import { toast } from 'sonner';
import { RegistryMetadata, getComponentsByCategory } from '@/registry/metadata';

const MotionDiv = motion.div as any;

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const SCHEME_PREVIEWS = [
    { id: 'dark', name: 'Midnight', primary: '#00f2ff', bg: '#020617', text: '#94a3b8' },
    { id: 'light', name: 'Paper', primary: '#6366f1', bg: '#f8fafc', text: '#334155' },
    { id: 'CYBER_NEON', name: 'Cyber', primary: '#39ff14', bg: '#050505', text: '#a0a0a0' },
    { id: 'LUXURY_GOLD', name: 'Gold', primary: '#D4AF37', bg: '#0a0a0a', text: '#c0a060' },
    { id: 'VIBRANT_BLOOM', name: 'Bloom', primary: '#ec4899', bg: '#fdf2f8', text: '#6b21a8' },
    { id: 'DEEP_FOREST', name: 'Forest', primary: '#22c55e', bg: '#052e16', text: '#86efac' },
    { id: 'OCEANIC_MIST', name: 'Ocean', primary: '#38bdf8', bg: '#0c1a26', text: '#7dd3fc' },
    { id: 'COFFEE_BEAST', name: 'Coffee', primary: '#D2691E', bg: '#1a0f09', text: '#C4A882' },
    { id: 'MINIMAL_PAPER', name: 'Linen', primary: '#334155', bg: '#f5f5f0', text: '#64748b' },
    { id: 'SOLAR_FLARE', name: 'Solar', primary: '#f97316', bg: '#0c0a00', text: '#fbbf24' },
];

const HEADING_FONTS = [
    'Inter', 'Space Grotesk', 'Syne', 'Fraunces', 'Playfair Display',
    'Cormorant Garamond', 'Bricolage Grotesque', 'DM Sans', 'Satoshi',
    'Clash Display', 'Outfit', 'Plus Jakarta Sans', 'Montserrat'
];
const BODY_FONTS = [
    'Inter', 'DM Sans', 'Outfit', 'Satoshi', 'Plus Jakarta Sans',
    'Montserrat', 'Lora', 'Source Sans Pro', 'Nunito', 'Raleway'
];

const SECTION_ICONS: Record<string, string> = {
    hero: '🏠',
    experience: '💼',
    skills: '🛠',
    projects: '🗂',
    about: '👤',
    contact: '📞',
    footer: '🦶',
    header: '📌',
    testimonials: '💬',
    stats: '📊',
    services: '⚙️',
    cta: '🎯',
    gallery: '🖼',
    pricing: '💳',
    faq: '❓',
    logos: '🏷',
    process: '🔄',
    blog: '📝',
    team: '👥',
    video: '🎬',
    education: '🎓',
    certifications: '🏆',
    default: '📄',
};

const ADD_SECTION_TYPES = [
    { type: 'hero', label: 'Hero', icon: '🏠', defaultComponentId: 'HERO_MODERN_SPLIT' },
    { type: 'experience', label: 'Experience', icon: '💼', defaultComponentId: 'EXP_TIMELINE_VERTICAL' },
    { type: 'skills', label: 'Skills', icon: '🛠', defaultComponentId: 'SKILLS_GRID_ICONS' },
    { type: 'projects', label: 'Projects', icon: '🗂', defaultComponentId: 'PROJ_BENTO_GRID' },
    { type: 'about', label: 'About', icon: '👤', defaultComponentId: 'ABOUT_NARRATIVE' },
    { type: 'contact', label: 'Contact', icon: '📞', defaultComponentId: 'CONTACT_SPLIT' },
    { type: 'testimonials', label: 'Testimonials', icon: '💬', defaultComponentId: 'TESTIMONIALS_BENTO' },
    { type: 'services', label: 'Services', icon: '⚙️', defaultComponentId: 'SERVICES_CARDS_INTERACTIVE' },
    { type: 'stats', label: 'Stats', icon: '📊', defaultComponentId: 'STATS_COUNTER_GRID' },
    { type: 'gallery', label: 'Gallery', icon: '🖼', defaultComponentId: 'GALLERY_MASONRY_GLASS' },
    { type: 'cta', label: 'CTA', icon: '🎯', defaultComponentId: 'CTA_HERO_INLINE' },
    { type: 'faq', label: 'FAQ', icon: '❓', defaultComponentId: 'FAQ_ACCORDION_NEON' },
    { type: 'footer', label: 'Footer', icon: '🦶', defaultComponentId: 'FOOTER_MINIMAL' },
];

const DEFAULT_SECTION_CONTENT: Record<string, any> = {
    hero: {
        fullName: 'Your Name',
        title: 'Professional Title',
        bio: 'A brief tagline or bio about yourself.',
        profileImage: '',
        ctaText: 'Get in Touch',
        ctaLink: '#contact',
        location: '',
        socialLinks: [],
    },
    experience: {
        title: 'Experience',
        items: [
            {
                company: 'Company Name',
                role: 'Your Role',
                period: '2022 – Present',
                description: 'What you accomplished here.',
                points: ['Key achievement one', 'Key achievement two'],
            },
        ],
    },
    skills: {
        title: 'Skills',
        skills: ['React', 'TypeScript', 'Node.js', 'Figma'],
    },
    projects: {
        title: 'Projects',
        items: [
            {
                title: 'Project Title',
                description: 'What this project does and why it matters.',
                image: '',
                tech: ['React', 'TypeScript'],
                link: '',
                github: '',
            },
        ],
    },
    about: {
        title: 'About Me',
        content: 'Tell your story here.',
        profileImage: '',
        highlights: ['Highlight one', 'Highlight two'],
        stats: [{ value: '5+', label: 'Years Experience' }],
    },
    contact: {
        title: 'Get in Touch',
        email: 'your@email.com',
        phone: '',
        location: '',
        socials: [],
    },
    testimonials: {
        title: 'What People Say',
        items: [
            { quote: 'Amazing work and great to collaborate with!', author: 'Client Name', role: 'CEO, Company', avatar: '' },
        ],
    },
    services: {
        title: 'Services',
        items: [
            { title: 'Service Name', description: 'What you offer.', icon: '⚡' },
        ],
    },
    stats: {
        title: 'Impact in Numbers',
        items: [
            { value: '50+', label: 'Projects Completed' },
            { value: '99%', label: 'Client Satisfaction' },
        ],
    },
    gallery: {
        title: 'Gallery',
        images: [],
    },
    cta: {
        headline: 'Ready to work together?',
        subheadline: "Let's build something great.",
        ctaText: 'Contact Me',
        ctaLink: '#contact',
    },
    faq: {
        title: 'FAQ',
        items: [
            { question: 'What services do you offer?', answer: 'I specialize in...' },
        ],
    },
    footer: {
        name: 'Your Name',
        tagline: 'Built with passion.',
        socialLinks: [],
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

const extractPublicId = (url: string) => {
    if (!url || !url.includes('cloudinary')) return null;
    const regex = /\/v\d+\/(.+)\.[a-z]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

const normalizeFaviconUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        return url.replace('/upload/', '/upload/w_64,h_64,c_fill,r_16,f_png,q_auto/');
    }
    return url;
};

const isImageUrl = (value: string) => {
    if (typeof value !== 'string') return false;
    if (value.startsWith('data:image')) return true;
    return /\.(jpg|jpeg|png|webp|avif|gif|svg|bmp|tiff)$/i.test(value.split('?')[0]) ||
        value.includes('cloudinary') ||
        value.includes('unsplash');
};

const isLongText = (value: string) => {
    if (typeof value !== 'string') return false;
    return value.length > 100 || value.includes('\n');
};

const getTypeName = (value: any, path: string = '') => {
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'list';
    if (typeof value === 'object' && value !== null) return 'object';
    const lowerPath = (path || '').toLowerCase();
    const isImageField = /(image|img|logo|avatar|photo|pic|icon|portrait|background|thumb|thumbnail|cover|banner|profile|src|gallery|brand|favicon)/.test(lowerPath);
    const isStringOrEmpty = typeof value === 'string' || value === null || value === undefined;
    if (isImageUrl(value) || (isImageField && isStringOrEmpty)) return 'image';
    if (isLongText(value)) return 'rich-text';
    return 'text';
};

const humanize = (str: string) => {
    if (!str) return '';
    if (str === 'ctaText') return 'Button Text';
    if (str === 'ctaLink') return 'Button Link';
    if (str === 'valProp') return 'Value Proposition';
    if (!isNaN(Number(str))) return `Item ${Number(str) + 1}`;
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INPUT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const inputBase = "w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-900 placeholder:text-slate-400 shadow-sm";
const labelBase = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5";

const FieldLabel: React.FC<{ label: string; required?: boolean }> = ({ label, required }) => (
    <label className={labelBase}>
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
);

interface SmartInputProps {
    path: string;
    value: any;
    onContentChange: (path: string, value: any) => void;
    label?: string;
    placeholder?: string;
    icon?: React.ReactNode;
    rows?: number;
}

const SmartInput: React.FC<SmartInputProps> = ({ path, value, onContentChange, label: overrideLabel, placeholder, icon, rows }) => {
    const type = getTypeName(value, path);
    const label = overrideLabel || humanize(path.split('.').pop() || '');
    const [imageMode, setImageMode] = useState<'link' | 'upload'>('link');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e: any) => onContentChange(path, e.target.value);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const oldPublicId = extractPublicId(value);
                if (oldPublicId) await cloudinaryService.deleteFile(oldPublicId);
                const result = await cloudinaryService.uploadFile(file);
                if (result && (result.url || result.secureUrl)) {
                    onContentChange(path, result.secureUrl || result.url);
                    toast.success('Image uploaded');
                } else {
                    throw new Error('Upload response missing URL');
                }
            } catch (err: any) {
                toast.error(err.message || 'Failed to upload image');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    if (type === 'boolean') {
        return (
            <div className="flex items-center justify-between py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className={labelBase + " mb-0"}>{label}</span>
                <button
                    onClick={() => onContentChange(path, !value)}
                    className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${value ? 'bg-teal-500' : 'bg-slate-200'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${value ? 'left-6' : 'left-1'}`} />
                </button>
            </div>
        );
    }

    if (type === 'image') {
        return (
            <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                    <FieldLabel label={label} />
                    <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        {(['link', 'upload'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setImageMode(mode)}
                                className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${imageMode === mode ? 'bg-white shadow text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {mode === 'link' ? 'URL' : 'Upload'}
                            </button>
                        ))}
                    </div>
                </div>
                {value && (
                    <div className="relative group w-full h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={value} alt="Preview" className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display = 'none'; }} />
                        <button
                            onClick={() => onContentChange(path, '')}
                            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
                {imageMode === 'link' ? (
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={value || ''}
                            onChange={handleChange}
                            placeholder={placeholder || 'https://...'}
                            className={inputBase + " pl-9"}
                        />
                    </div>
                ) : (
                    <div
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`w-full border-2 border-dashed border-slate-200 rounded-xl py-5 flex flex-col items-center justify-center cursor-pointer transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-teal-400 hover:bg-teal-50/50'}`}
                    >
                        {isUploading ? (
                            <Loader className="text-teal-500 w-5 h-5 animate-spin mb-1.5" />
                        ) : (
                            <ICONS.Upload className="w-5 h-5 text-slate-400 mb-1.5" />
                        )}
                        <span className="text-xs font-medium text-slate-500">
                            {isUploading ? 'Uploading…' : 'Click to choose file'}
                        </span>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                    </div>
                )}
            </div>
        );
    }

    if (type === 'rich-text' || rows) {
        const charCount = (value || '').length;
        return (
            <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                    <FieldLabel label={label} />
                    {charCount > 0 && <span className="text-[9px] text-slate-400">{charCount} chars</span>}
                </div>
                <textarea
                    value={value || ''}
                    onChange={handleChange}
                    placeholder={placeholder}
                    rows={rows || 4}
                    className={inputBase + " resize-y min-h-[80px]"}
                />
            </div>
        );
    }

    // Text
    const charCount = typeof value === 'string' ? value.length : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
                <FieldLabel label={label} />
                {charCount > 50 && <span className="text-[9px] text-slate-400">{charCount} chars</span>}
            </div>
            <div className="relative">
                {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">{icon}</span>}
                <input
                    type="text"
                    value={value || ''}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={inputBase + (icon ? " pl-9" : "")}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC JSON EDITOR (fallback)
// ─────────────────────────────────────────────────────────────────────────────

const JsonNodeEditor = ({ path, node, onContentChange }: any) => {
    const type = getTypeName(node, path);

    if (type === 'list') {
        const sampleItem = node[0] || { value: '' };
        const isSimpleArray = typeof sampleItem === 'string';

        const addItem = () => {
            const newItem = isSimpleArray
                ? 'New Item'
                : Object.keys(sampleItem).reduce((acc, key) => ({ ...acc, [key]: '' }), {});
            onContentChange(path, [...node, newItem]);
        };

        const removeItem = async (index: number) => {
            const itemToRemove = node[index];
            const cleanupCloudinary = async (val: any) => {
                if (typeof val === 'string') {
                    const pid = extractPublicId(val);
                    if (pid) await cloudinaryService.deleteFile(pid).catch(() => { });
                } else if (typeof val === 'object' && val !== null) {
                    for (const v of Object.values(val)) await cleanupCloudinary(v);
                }
            };
            await cleanupCloudinary(itemToRemove);
            const newItems = [...node];
            newItems.splice(index, 1);
            onContentChange(path, newItems);
        };

        return (
            <div className="space-y-2.5">
                {node.map((item: any, index: number) => {
                    const isObject = typeof item === 'object' && item !== null;
                    const title = isObject ? (item.title || item.name || item.header || item.company || `Item ${index + 1}`) : `Item ${index + 1}`;
                    return (
                        <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-teal-300 transition-colors">
                            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate max-w-[200px]">
                                    {isSimpleArray ? `Item ${index + 1}` : title}
                                </span>
                                <button onClick={() => removeItem(index)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="p-3 space-y-3">
                                <JsonNodeEditor path={`${path}[${index}]`} node={item} onContentChange={onContentChange} />
                            </div>
                        </div>
                    );
                })}
                <button
                    onClick={addItem}
                    className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-1.5"
                >
                    <Plus className="w-3 h-3" /> Add {humanize(path.split(/[.\[]/).pop() || 'Item')}
                </button>
            </div>
        );
    }

    if (type === 'object') {
        return (
            <div className="space-y-3.5">
                {Object.entries(node)
                    .filter(([key]) => !['primaryColor', 'secondaryColor', 'bgColor', 'textColor'].includes(key))
                    .map(([key, value]) => (
                        <JsonNodeEditor key={key} path={path ? `${path}.${key}` : key} node={value} onContentChange={onContentChange} />
                    ))}
            </div>
        );
    }

    return <SmartInput path={path} value={node} onContentChange={onContentChange} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// TAG LIST EDITOR (for simple string arrays like skills)
// ─────────────────────────────────────────────────────────────────────────────

const TagListEditor: React.FC<{ label: string; items: string[]; onChange: (items: string[]) => void }> = ({ label, items, onChange }) => {
    const [inputVal, setInputVal] = useState('');
    const addTag = () => {
        const v = inputVal.trim();
        if (v && !items.includes(v)) {
            onChange([...items, v]);
            setInputVal('');
        }
    };
    const removeTag = (i: number) => {
        const next = [...items];
        next.splice(i, 1);
        onChange(next);
    };
    return (
        <div className="space-y-2">
            <FieldLabel label={label} />
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2.5 bg-white border border-slate-200 rounded-xl">
                {items.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {tag}
                        <button onClick={() => removeTag(i)} className="text-teal-400 hover:text-rose-500 ml-0.5 transition-colors">
                            <X className="w-2.5 h-2.5" />
                        </button>
                    </span>
                ))}
                {items.length === 0 && <span className="text-[11px] text-slate-400 italic self-center">No items yet</span>}
            </div>
            <div className="flex gap-2">
                <input
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Type and press Enter…"
                    className={inputBase + " flex-1 py-2"}
                />
                <button onClick={addTag} className="px-3 py-2 bg-teal-500 text-white rounded-xl text-xs font-bold hover:bg-teal-600 transition-colors">
                    Add
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL LINKS EDITOR
// ─────────────────────────────────────────────────────────────────────────────

const SOCIAL_PLATFORMS = ['LinkedIn', 'GitHub', 'Twitter', 'Instagram', 'YouTube', 'Dribbble', 'Behance', 'Website', 'Email', 'Other'];

const SocialLinksEditor: React.FC<{ links: any[]; onChange: (links: any[]) => void }> = ({ links, onChange }) => {
    const addLink = () => onChange([...links, { platform: 'LinkedIn', url: '' }]);
    const removeLink = (i: number) => { const next = [...links]; next.splice(i, 1); onChange(next); };
    const updateLink = (i: number, key: string, val: string) => {
        const next = links.map((l, idx) => idx === i ? { ...l, [key]: val } : l);
        onChange(next);
    };
    return (
        <div className="space-y-2">
            <FieldLabel label="Social Links" />
            <div className="space-y-2">
                {links.map((link, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <select
                            value={link.platform || ''}
                            onChange={e => updateLink(i, 'platform', e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-2 bg-white text-slate-700 focus:outline-none focus:border-teal-500 w-28 flex-shrink-0"
                        >
                            {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input
                            type="text"
                            value={link.url || ''}
                            onChange={e => updateLink(i, 'url', e.target.value)}
                            placeholder="https://..."
                            className={inputBase + " flex-1 py-2"}
                        />
                        <button onClick={() => removeLink(i)} className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={addLink}
                className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors pt-1"
            >
                <Plus className="w-3 h-3" /> Add Link
            </button>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT-AWARE SECTION EDITORS
// ─────────────────────────────────────────────────────────────────────────────

const SectionFieldWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="space-y-4">{children}</div>
);

const Divider: React.FC<{ label: string }> = ({ label }) => (
    <div className="flex items-center gap-3 pt-1">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        <div className="h-px flex-1 bg-slate-200" />
    </div>
);

// --- HERO ---
const HeroEditor: React.FC<{ content: any; onChange: (key: string, val: any) => void }> = ({ content, onChange }) => (
    <SectionFieldWrapper>
        <SmartInput path="fullName" value={content.fullName || content.name || ''} onContentChange={(_, v) => { onChange('fullName', v); onChange('name', v); }}
            label="Full Name" icon={<User className="w-3.5 h-3.5" />} placeholder="Jane Doe" />
        <SmartInput path="title" value={content.title || content.headline || ''} onContentChange={(_, v) => onChange('title', v)}
            label="Professional Title" placeholder="Senior Product Designer" />
        <SmartInput path="bio" value={content.bio || ''} onContentChange={(_, v) => onChange('bio', v)}
            label="Bio / Tagline" rows={3} placeholder="A brief description of what you do…" />
        <SmartInput path="profileImage" value={content.profileImage || ''} onContentChange={(_, v) => onChange('profileImage', v)}
            label="Profile Photo" />
        <Divider label="Call to Action" />
        <div className="grid grid-cols-2 gap-3">
            <SmartInput path="ctaText" value={content.ctaText || ''} onContentChange={(_, v) => onChange('ctaText', v)}
                label="Button Text" placeholder="Get in Touch" />
            <SmartInput path="ctaLink" value={content.ctaLink || ''} onContentChange={(_, v) => onChange('ctaLink', v)}
                label="Button Link" icon={<LinkIcon className="w-3.5 h-3.5" />} placeholder="#contact" />
        </div>
        <SmartInput path="location" value={content.location || ''} onContentChange={(_, v) => onChange('location', v)}
            label="Location" icon={<MapPin className="w-3.5 h-3.5" />} placeholder="San Francisco, CA" />
        <Divider label="Social Links" />
        <SocialLinksEditor
            links={Array.isArray(content.socials) ? content.socials : Array.isArray(content.socialLinks) ? content.socialLinks : []}
            onChange={v => onChange('socials', v)}
        />
    </SectionFieldWrapper>
);

// --- EXPERIENCE ---
const ExperienceEditor: React.FC<{ content: any; onChange: (key: string, val: any) => void }> = ({ content, onChange }) => {
    // Read from `items` (registry standard), fall back to legacy `jobs` or `experiences`
    const items = Array.isArray(content.items) ? content.items
        : Array.isArray(content.jobs) ? content.jobs
        : Array.isArray(content.experiences) ? content.experiences
        : [];
    const saveKey = 'items';

    const updateItem = (i: number, key: string, val: any) => {
        const next = items.map((j: any, idx: number) => idx === i ? { ...j, [key]: val } : j);
        onChange(saveKey, next);
    };
    const addItem = () => onChange(saveKey, [...items, { company: 'Company', role: 'Role', period: '2024 – Present', description: '', points: [] }]);
    const removeItem = (i: number) => { const next = [...items]; next.splice(i, 1); onChange(saveKey, next); };

    return (
        <SectionFieldWrapper>
            <SmartInput path="title" value={content.title || content.sectionTitle || ''} onContentChange={(_, v) => onChange('title', v)} label="Section Title" />
            <Divider label="Experience Items" />
            <div className="space-y-4">
                {items.map((item: any, i: number) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.company || item.role || `Role ${i + 1}`}</span>
                            <button onClick={() => removeItem(i)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="p-3 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <SmartInput path={`${saveKey}[${i}].role`} value={item.role || item.title || ''} onContentChange={(_, v) => updateItem(i, 'role', v)} label="Job Title" />
                                <SmartInput path={`${saveKey}[${i}].company`} value={item.company || ''} onContentChange={(_, v) => updateItem(i, 'company', v)} label="Company" />
                            </div>
                            <SmartInput path={`${saveKey}[${i}].period`} value={item.period || item.duration || ''} onContentChange={(_, v) => updateItem(i, 'period', v)} label="Period" placeholder="2022 – Present" />
                            <SmartInput path={`${saveKey}[${i}].description`} value={item.description || item.summary || ''} onContentChange={(_, v) => updateItem(i, 'description', v)} label="Description" rows={2} />
                            <TagListEditor
                                label="Key Achievements"
                                items={Array.isArray(item.points) ? item.points : Array.isArray(item.bullets) ? item.bullets : []}
                                onChange={v => updateItem(i, 'points', v)}
                            />
                        </div>
                    </div>
                ))}
                <button onClick={addItem} className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-1.5">
                    <Plus className="w-3 h-3" /> Add Role
                </button>
            </div>
        </SectionFieldWrapper>
    );
};

// --- SKILLS ---
const SkillsEditor: React.FC<{ content: any; onChange: (key: string, val: any) => void }> = ({ content, onChange }) => {
    // Support multiple formats: plain array, object-of-categories, array-of-category-objects
    const catArray = Array.isArray(content.skillsCategories) ? content.skillsCategories : null;
    const catObject = content.skillsCategories && !Array.isArray(content.skillsCategories) && typeof content.skillsCategories === 'object' ? content.skillsCategories : null;
    const hasCategories = !!(catArray || catObject);

    return (
        <SectionFieldWrapper>
            <SmartInput path="title" value={content.title || content.sectionTitle || ''} onContentChange={(_, v) => onChange('title', v)} label="Section Title" />
            {hasCategories && catArray ? (
                // Array of { name, skills } objects
                <>
                    <Divider label="Skill Categories" />
                    {catArray.map((cat: any, i: number) => (
                        <div key={i}>
                            <TagListEditor
                                label={cat.name || cat.category || `Category ${i + 1}`}
                                items={Array.isArray(cat.skills) ? cat.skills : []}
                                onChange={v => {
                                    const next = catArray.map((c: any, idx: number) => idx === i ? { ...c, skills: v } : c);
                                    onChange('skillsCategories', next);
                                }}
                            />
                        </div>
                    ))}
                </>
            ) : hasCategories && catObject ? (
                // Object of { category: skillsArray }
                <>
                    <Divider label="Skill Categories" />
                    {Object.entries(catObject).map(([cat, skills]: [string, any]) => (
                        <div key={cat}>
                            <TagListEditor
                                label={humanize(cat)}
                                items={Array.isArray(skills) ? skills : []}
                                onChange={v => onChange('skillsCategories', { ...catObject, [cat]: v })}
                            />
                        </div>
                    ))}
                </>
            ) : (
                <>
                    <Divider label="Skills" />
                    <TagListEditor
                        label="All Skills"
                        items={Array.isArray(content.skills) ? content.skills : Array.isArray(content.items) ? content.items : []}
                        onChange={v => onChange('skills', v)}
                    />
                </>
            )}
        </SectionFieldWrapper>
    );
};

// --- PROJECTS ---
const ProjectsEditor: React.FC<{ content: any; onChange: (key: string, val: any) => void }> = ({ content, onChange }) => {
    // Read from `items` (registry standard), fall back to legacy `projects`
    const items = Array.isArray(content.items) ? content.items : Array.isArray(content.projects) ? content.projects : [];
    const saveKey = 'items';

    const updateItem = (i: number, key: string, val: any) => {
        const next = items.map((p: any, idx: number) => idx === i ? { ...p, [key]: val } : p);
        onChange(saveKey, next);
    };
    const addItem = () => onChange(saveKey, [...items, { title: 'New Project', description: '', image: '', tech: [], link: '', github: '' }]);
    const removeItem = (i: number) => { const next = [...items]; next.splice(i, 1); onChange(saveKey, next); };

    return (
        <SectionFieldWrapper>
            <SmartInput path="title" value={content.title || content.sectionTitle || ''} onContentChange={(_, v) => onChange('title', v)} label="Section Title" />
            <Divider label="Projects" />
            <div className="space-y-4">
                {items.map((project: any, i: number) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{project.title || `Project ${i + 1}`}</span>
                            <button onClick={() => removeItem(i)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="p-3 space-y-3">
                            <SmartInput path={`${saveKey}[${i}].title`} value={project.title || ''} onContentChange={(_, v) => updateItem(i, 'title', v)} label="Title" />
                            <SmartInput path={`${saveKey}[${i}].description`} value={project.description || ''} onContentChange={(_, v) => updateItem(i, 'description', v)} label="Description" rows={2} />
                            <SmartInput path={`${saveKey}[${i}].image`} value={project.image || ''} onContentChange={(_, v) => updateItem(i, 'image', v)} label="Project Image" />
                            <div className="grid grid-cols-2 gap-3">
                                <SmartInput path={`${saveKey}[${i}].link`} value={project.link || project.url || ''} onContentChange={(_, v) => updateItem(i, 'link', v)} label="Live URL" icon={<LinkIcon className="w-3.5 h-3.5" />} placeholder="https://..." />
                                <SmartInput path={`${saveKey}[${i}].github`} value={project.github || project.repo || ''} onContentChange={(_, v) => updateItem(i, 'github', v)} label="GitHub URL" icon={<LinkIcon className="w-3.5 h-3.5" />} placeholder="https://github.com/..." />
                            </div>
                            <TagListEditor
                                label="Tech Stack"
                                items={Array.isArray(project.tech) ? project.tech : Array.isArray(project.technologies) ? project.technologies : []}
                                onChange={v => updateItem(i, 'tech', v)}
                            />
                        </div>
                    </div>
                ))}
                <button onClick={addItem} className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-1.5">
                    <Plus className="w-3 h-3" /> Add Project
                </button>
            </div>
        </SectionFieldWrapper>
    );
};

// --- ABOUT ---
const AboutEditor: React.FC<{ content: any; onChange: (key: string, val: any) => void }> = ({ content, onChange }) => {
    const stats = Array.isArray(content.stats) ? content.stats : [];
    const updateStat = (i: number, key: string, val: string) => {
        const next = stats.map((s: any, idx: number) => idx === i ? { ...s, [key]: val } : s);
        onChange('stats', next);
    };
    return (
        <SectionFieldWrapper>
            <SmartInput path="title" value={content.title || content.sectionTitle || ''} onContentChange={(_, v) => onChange('title', v)} label="Section Title" />
            <SmartInput path="content" value={content.content || ''} onContentChange={(_, v) => onChange('content', v)} label="Content / Story" rows={5} />
            <SmartInput path="profileImage" value={content.profileImage || ''} onContentChange={(_, v) => onChange('profileImage', v)} label="Profile Image" />
            <TagListEditor label="Highlight Points" items={Array.isArray(content.highlights) ? content.highlights : []} onChange={v => onChange('highlights', v)} />
            <Divider label="Stats" />
            <div className="space-y-2">
                {stats.map((stat: any, i: number) => (
                    <div key={i} className="flex gap-2 items-center">
                        <input value={stat.value || ''} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="50+" className={inputBase + " py-2 w-24 flex-shrink-0 text-center font-bold"} />
                        <input value={stat.label || ''} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Projects Completed" className={inputBase + " flex-1 py-2"} />
                        <button onClick={() => { const next = [...stats]; next.splice(i, 1); onChange('stats', next); }} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
                <button onClick={() => onChange('stats', [...stats, { value: '', label: '' }])} className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors pt-0.5">
                    <Plus className="w-3 h-3" /> Add Stat
                </button>
            </div>
        </SectionFieldWrapper>
    );
};

// --- CONTACT ---
const ContactEditor: React.FC<{ content: any; onChange: (key: string, val: any) => void }> = ({ content, onChange }) => (
    <SectionFieldWrapper>
        <SmartInput path="title" value={content.title || content.sectionTitle || ''} onContentChange={(_, v) => onChange('title', v)} label="Section Title" />
        <SmartInput path="email" value={content.email || ''} onContentChange={(_, v) => onChange('email', v)} label="Email" icon={<Mail className="w-3.5 h-3.5" />} placeholder="you@example.com" />
        <SmartInput path="phone" value={content.phone || ''} onContentChange={(_, v) => onChange('phone', v)} label="Phone (optional)" placeholder="+1 (555) 000-0000" />
        <SmartInput path="location" value={content.location || ''} onContentChange={(_, v) => onChange('location', v)} label="Location" icon={<MapPin className="w-3.5 h-3.5" />} placeholder="New York, NY" />
        <Divider label="Social Links" />
        <SocialLinksEditor
            links={Array.isArray(content.socials) ? content.socials : Array.isArray(content.socialLinks) ? content.socialLinks : []}
            onChange={v => onChange('socials', v)}
        />
    </SectionFieldWrapper>
);

// --- SKILLS (enhanced) ---
// Already defined above — SkillsEditor is already correct (reads content.skills)

// --- TESTIMONIALS ---
const TestimonialsEditor: React.FC<{ content: any; onChange: (key: string, val: any) => void }> = ({ content, onChange }) => {
    const items = Array.isArray(content.items) ? content.items
        : Array.isArray(content.testimonials) ? content.testimonials : [];
    const saveKey = 'items';
    const updateItem = (i: number, key: string, val: any) => {
        const next = items.map((t: any, idx: number) => idx === i ? { ...t, [key]: val } : t);
        onChange(saveKey, next);
    };
    const addItem = () => onChange(saveKey, [...items, { quote: '', author: '', role: '', avatar: '' }]);
    const removeItem = (i: number) => { const next = [...items]; next.splice(i, 1); onChange(saveKey, next); };
    return (
        <SectionFieldWrapper>
            <SmartInput path="title" value={content.title || ''} onContentChange={(_, v) => onChange('title', v)} label="Section Title" />
            <Divider label="Testimonials" />
            <div className="space-y-4">
                {items.map((t: any, i: number) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.author || `Testimonial ${i + 1}`}</span>
                            <button onClick={() => removeItem(i)} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <div className="p-3 space-y-3">
                            <SmartInput path={`${saveKey}[${i}].quote`} value={t.quote || ''} onContentChange={(_, v) => updateItem(i, 'quote', v)} label="Quote" rows={3} />
                            <div className="grid grid-cols-2 gap-3">
                                <SmartInput path={`${saveKey}[${i}].author`} value={t.author || ''} onContentChange={(_, v) => updateItem(i, 'author', v)} label="Author" placeholder="Jane Doe" />
                                <SmartInput path={`${saveKey}[${i}].role`} value={t.role || t.title || ''} onContentChange={(_, v) => updateItem(i, 'role', v)} label="Role / Company" placeholder="CEO, Acme Inc." />
                            </div>
                            <SmartInput path={`${saveKey}[${i}].avatar`} value={t.avatar || t.image || ''} onContentChange={(_, v) => updateItem(i, 'avatar', v)} label="Avatar Photo" />
                        </div>
                    </div>
                ))}
                <button onClick={addItem} className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-1.5">
                    <Plus className="w-3 h-3" /> Add Testimonial
                </button>
            </div>
        </SectionFieldWrapper>
    );
};

// --- SERVICES ---
const ServicesEditor: React.FC<{ content: any; onChange: (key: string, val: any) => void }> = ({ content, onChange }) => {
    const items = Array.isArray(content.items) ? content.items
        : Array.isArray(content.services) ? content.services : [];
    const saveKey = 'items';
    const updateItem = (i: number, key: string, val: any) => {
        const next = items.map((s: any, idx: number) => idx === i ? { ...s, [key]: val } : s);
        onChange(saveKey, next);
    };
    const addItem = () => onChange(saveKey, [...items, { title: 'New Service', description: '', icon: '⚡' }]);
    const removeItem = (i: number) => { const next = [...items]; next.splice(i, 1); onChange(saveKey, next); };
    return (
        <SectionFieldWrapper>
            <SmartInput path="title" value={content.title || ''} onContentChange={(_, v) => onChange('title', v)} label="Section Title" />
            <Divider label="Services" />
            <div className="space-y-3">
                {items.map((s: any, i: number) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.title || `Service ${i + 1}`}</span>
                            <button onClick={() => removeItem(i)} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <div className="p-3 space-y-3">
                            <div className="grid grid-cols-[60px_1fr] gap-3">
                                <SmartInput path={`${saveKey}[${i}].icon`} value={s.icon || ''} onContentChange={(_, v) => updateItem(i, 'icon', v)} label="Icon" placeholder="⚡" />
                                <SmartInput path={`${saveKey}[${i}].title`} value={s.title || ''} onContentChange={(_, v) => updateItem(i, 'title', v)} label="Title" />
                            </div>
                            <SmartInput path={`${saveKey}[${i}].description`} value={s.description || ''} onContentChange={(_, v) => updateItem(i, 'description', v)} label="Description" rows={2} />
                        </div>
                    </div>
                ))}
                <button onClick={addItem} className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-1.5">
                    <Plus className="w-3 h-3" /> Add Service
                </button>
            </div>
        </SectionFieldWrapper>
    );
};

// --- STATS ---
const StatsEditor: React.FC<{ content: any; onChange: (key: string, val: any) => void }> = ({ content, onChange }) => {
    const items = Array.isArray(content.items) ? content.items
        : Array.isArray(content.stats) ? content.stats : [];
    const saveKey = 'items';
    const updateItem = (i: number, key: string, val: any) => {
        const next = items.map((s: any, idx: number) => idx === i ? { ...s, [key]: val } : s);
        onChange(saveKey, next);
    };
    const addItem = () => onChange(saveKey, [...items, { value: '100+', label: 'Metric' }]);
    const removeItem = (i: number) => { const next = [...items]; next.splice(i, 1); onChange(saveKey, next); };
    return (
        <SectionFieldWrapper>
            <SmartInput path="title" value={content.title || ''} onContentChange={(_, v) => onChange('title', v)} label="Section Title" />
            <Divider label="Stats" />
            <div className="space-y-2">
                {items.map((s: any, i: number) => (
                    <div key={i} className="flex gap-2 items-center">
                        <input value={s.value || ''} onChange={e => updateItem(i, 'value', e.target.value)} placeholder="50+" className={inputBase + " py-2 w-24 flex-shrink-0 text-center font-bold"} />
                        <input value={s.label || ''} onChange={e => updateItem(i, 'label', e.target.value)} placeholder="Projects Completed" className={inputBase + " flex-1 py-2"} />
                        <button onClick={() => removeItem(i)} className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                ))}
                <button onClick={addItem} className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors pt-1">
                    <Plus className="w-3 h-3" /> Add Stat
                </button>
            </div>
        </SectionFieldWrapper>
    );
};

// --- FOOTER ---
const FooterEditor: React.FC<{ content: any; onChange: (key: string, val: any) => void }> = ({ content, onChange }) => (
    <SectionFieldWrapper>
        <SmartInput path="name" value={content.name || ''} onContentChange={(_, v) => onChange('name', v)} label="Name / Brand" placeholder="Your Name" />
        <SmartInput path="tagline" value={content.tagline || ''} onContentChange={(_, v) => onChange('tagline', v)} label="Tagline" placeholder="Built with passion." />
        <SmartInput path="email" value={content.email || ''} onContentChange={(_, v) => onChange('email', v)} label="Email" icon={<Mail className="w-3.5 h-3.5" />} placeholder="you@example.com" />
        <SmartInput path="ctaText" value={content.ctaText || ''} onContentChange={(_, v) => onChange('ctaText', v)} label="CTA Text" placeholder="Let's Work Together" />
        <Divider label="Social Links" />
        <SocialLinksEditor
            links={Array.isArray(content.socials) ? content.socials : Array.isArray(content.socialLinks) ? content.socialLinks : []}
            onChange={v => onChange('socials', v)}
        />
    </SectionFieldWrapper>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CONTENT ROUTER
// ─────────────────────────────────────────────────────────────────────────────

const SectionContentEditor: React.FC<{ section: any; sectionIndex: number; onContentChange: (path: string, value: any) => void }> = ({ section, sectionIndex, onContentChange }) => {
    const contentPath = `sections.${sectionIndex}.content`;

    switch (section.type) {
        case 'hero':
            return <HeroEditor content={section.content || {}} onChange={(key, val) => onContentChange(`${contentPath}.${key}`, val)} />;
        case 'experience':
            return <ExperienceEditor content={section.content || {}} onChange={(key, val) => onContentChange(`${contentPath}.${key}`, val)} />;
        case 'skills':
            return <SkillsEditor content={section.content || {}} onChange={(key, val) => onContentChange(`${contentPath}.${key}`, val)} />;
        case 'projects':
            return <ProjectsEditor content={section.content || {}} onChange={(key, val) => onContentChange(`${contentPath}.${key}`, val)} />;
        case 'about':
            return <AboutEditor content={section.content || {}} onChange={(key, val) => onContentChange(`${contentPath}.${key}`, val)} />;
        case 'contact':
            return <ContactEditor content={section.content || {}} onChange={(key, val) => onContentChange(`${contentPath}.${key}`, val)} />;
        case 'testimonials':
            return <TestimonialsEditor content={section.content || {}} onChange={(key, val) => onContentChange(`${contentPath}.${key}`, val)} />;
        case 'services':
            return <ServicesEditor content={section.content || {}} onChange={(key, val) => onContentChange(`${contentPath}.${key}`, val)} />;
        case 'stats':
            return <StatsEditor content={section.content || {}} onChange={(key, val) => onContentChange(`${contentPath}.${key}`, val)} />;
        case 'footer':
            return <FooterEditor content={section.content || {}} onChange={(key, val) => onContentChange(`${contentPath}.${key}`, val)} />;
        default:
            return <JsonNodeEditor path={contentPath} node={section.content} onContentChange={onContentChange} />;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT STYLE SWITCHER
// ─────────────────────────────────────────────────────────────────────────────

const StyleSwitcher: React.FC<{ section: any; sectionIndex: number; onSwitch: (componentId: string) => void }> = ({ section, sectionIndex, onSwitch }) => {
    const [open, setOpen] = useState(false);
    const components = getComponentsByCategory(section.type);
    const current = RegistryMetadata[section.componentId];

    if (!components.length) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-700 transition-all"
            >
                <SlidersHorizontal className="w-3 h-3" />
                <span className="max-w-[120px] truncate">{current?.name || section.componentId}</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <MotionDiv
                            initial={{ opacity: 0, y: -4, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden max-h-72 overflow-y-auto"
                        >
                            <div className="px-3 py-2 border-b border-slate-100 sticky top-0 bg-white">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Switch Style</p>
                            </div>
                            <div className="py-1">
                                {components.map(comp => (
                                    <button
                                        key={comp.id}
                                        onClick={() => { onSwitch(comp.id); setOpen(false); }}
                                        className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 group ${comp.id === section.componentId ? 'bg-teal-50' : ''}`}
                                    >
                                        <div>
                                            <p className={`text-xs font-semibold ${comp.id === section.componentId ? 'text-teal-700' : 'text-slate-800'}`}>
                                                {comp.name}
                                            </p>
                                            {comp.description && (
                                                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{comp.description}</p>
                                            )}
                                        </div>
                                        {comp.id === section.componentId && (
                                            <Check className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </MotionDiv>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// COLOR SCHEME PICKER
// ─────────────────────────────────────────────────────────────────────────────

const ColorSchemePicker: React.FC<{ value: string; onChange: (id: string) => void }> = ({ value, onChange }) => (
    <div>
        <FieldLabel label="Color Scheme" />
        <div className="grid grid-cols-5 gap-3 mt-2">
            {SCHEME_PREVIEWS.map(scheme => {
                const isActive = value === scheme.id;
                return (
                    <button
                        key={scheme.id}
                        onClick={() => onChange(scheme.id)}
                        className="flex flex-col items-center gap-1.5 group"
                        title={scheme.name}
                    >
                        <div
                            className={`relative w-10 h-10 rounded-full border-2 transition-all shadow-sm ${isActive ? 'border-teal-500 scale-110 shadow-teal-200 shadow-md' : 'border-slate-200 hover:border-slate-400 hover:scale-105'}`}
                            style={{ background: `linear-gradient(135deg, ${scheme.bg} 50%, ${scheme.primary} 50%)` }}
                        >
                            {isActive && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                                </div>
                            )}
                        </div>
                        <span className={`text-[9px] font-bold leading-none text-center transition-colors ${isActive ? 'text-teal-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
                            {scheme.name}
                        </span>
                    </button>
                );
            })}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLE PANEL
// ─────────────────────────────────────────────────────────────────────────────

interface GlobalStylePanelProps {
    localContent: any;
    onContentChange: (path: string, value: any) => void;
    canUsePremiumAnalyticsScript: boolean;
}

const GlobalStylePanel: React.FC<GlobalStylePanelProps> = ({ localContent, onContentChange, canUsePremiumAnalyticsScript }) => {
    const [faviconMode, setFaviconMode] = useState<'link' | 'upload'>('link');
    const [isFaviconUploading, setIsFaviconUploading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsFaviconUploading(true);
        try {
            const oldFavicon = localContent?.globalConfig?.favicon || '';
            const oldPublicId = extractPublicId(oldFavicon);
            if (oldPublicId) await cloudinaryService.deleteFile(oldPublicId);
            const result = await cloudinaryService.uploadFile(file);
            const newUrl = result?.secureUrl || result?.url;
            if (!newUrl) throw new Error('Upload response missing URL');
            onContentChange('globalConfig.favicon', normalizeFaviconUrl(newUrl));
            toast.success('Favicon uploaded');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to upload favicon');
        } finally {
            setIsFaviconUploading(false);
        }
    };

    const gc = localContent?.globalConfig || {};

    return (
        <div className="space-y-7 p-1">
            {/* Color Scheme */}
            <ColorSchemePicker
                value={gc.theme || 'dark'}
                onChange={v => onContentChange('globalConfig.theme', v)}
            />

            {/* Typography */}
            <div className="space-y-3">
                <FieldLabel label="Typography" />
                <div className="space-y-2.5">
                    <div>
                        <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Heading Font</label>
                        <select
                            value={gc.typography?.headingFont || ''}
                            onChange={e => onContentChange('globalConfig.typography.headingFont', e.target.value)}
                            className={inputBase + " py-2"}
                        >
                            <option value="">Default</option>
                            {HEADING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Body Font</label>
                        <select
                            value={gc.typography?.bodyFont || ''}
                            onChange={e => onContentChange('globalConfig.typography.bodyFont', e.target.value)}
                            className={inputBase + " py-2"}
                        >
                            <option value="">Default</option>
                            {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Favicon */}
            <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                    <FieldLabel label="Favicon" />
                    <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        {(['link', 'upload'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setFaviconMode(mode)}
                                className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${faviconMode === mode ? 'bg-white shadow text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {mode === 'link' ? 'URL' : 'Upload'}
                            </button>
                        ))}
                    </div>
                </div>
                {gc.favicon && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white p-1 flex-shrink-0">
                            <img src={gc.favicon} alt="Favicon" className="w-full h-full object-contain" onError={(e: any) => { e.target.style.display = 'none'; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Favicon</p>
                            <p className="text-[10px] text-slate-400 truncate">{gc.favicon}</p>
                        </div>
                        <button onClick={() => onContentChange('globalConfig.favicon', '')} className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
                {faviconMode === 'link' ? (
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={gc.favicon || ''}
                            onChange={e => onContentChange('globalConfig.favicon', e.target.value)}
                            placeholder="https://.../favicon.png"
                            className={inputBase + " pl-9"}
                        />
                    </div>
                ) : (
                    <div
                        onClick={() => !isFaviconUploading && faviconInputRef.current?.click()}
                        className={`w-full border-2 border-dashed border-slate-200 rounded-xl py-5 flex flex-col items-center justify-center cursor-pointer transition-all ${isFaviconUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-teal-400 hover:bg-teal-50/50'}`}
                    >
                        {isFaviconUploading ? <Loader className="text-teal-500 w-5 h-5 animate-spin mb-1.5" /> : <ICONS.Upload className="w-5 h-5 text-slate-400 mb-1.5" />}
                        <span className="text-xs font-medium text-slate-500">{isFaviconUploading ? 'Uploading…' : 'Click to choose file'}</span>
                        <input ref={faviconInputRef} type="file" accept="image/x-icon,image/png,image/svg+xml,image/webp,image/jpeg" className="hidden" onChange={handleFaviconUpload} disabled={isFaviconUploading} />
                    </div>
                )}
            </div>

            {/* Advanced toggle */}
            <div>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <ChevronRight className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                    Advanced Settings
                </button>
                <AnimatePresence>
                    {showAdvanced && (
                        <MotionDiv
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <FieldLabel label="Analytics Script" />
                                    {!canUsePremiumAnalyticsScript && (
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Premium</span>
                                    )}
                                </div>
                                <textarea
                                    value={gc.analyticsScript || ''}
                                    onChange={e => onContentChange('globalConfig.analyticsScript', e.target.value)}
                                    placeholder={canUsePremiumAnalyticsScript ? 'Paste JS here (without <script> tags).' : 'Upgrade to Premium to use this feature.'}
                                    disabled={!canUsePremiumAnalyticsScript}
                                    rows={4}
                                    className={inputBase + ` resize-y min-h-[80px] ${!canUsePremiumAnalyticsScript ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                                />
                                <p className="text-[10px] text-slate-400 pl-0.5">
                                    {canUsePremiumAnalyticsScript ? 'Injected into <head> during publish.' : 'Available on Premium plans.'}
                                </p>
                            </div>
                        </MotionDiv>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADD SECTION MODAL
// ─────────────────────────────────────────────────────────────────────────────

const AddSectionModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (type: string, componentId: string) => void }> = ({ isOpen, onClose, onAdd }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                <MotionDiv
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e: any) => e.stopPropagation()}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10"
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Add Section</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">Choose a section type to add</p>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                        {ADD_SECTION_TYPES.map(({ type, label, icon, defaultComponentId }) => (
                            <button
                                key={type}
                                onClick={() => { onAdd(type, defaultComponentId); onClose(); }}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all group"
                            >
                                <span className="text-2xl">{icon}</span>
                                <span className="text-[10px] font-bold text-slate-600 group-hover:text-teal-700 transition-colors">{label}</span>
                            </button>
                        ))}
                    </div>
                </MotionDiv>
            </div>
        )}
    </AnimatePresence>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PROPS
// ─────────────────────────────────────────────────────────────────────────────

interface SectionEditorProps {
    structuredContent: any;
    onUpdate: (newContent: any) => void;
    isOpen: boolean;
    onClose: () => void;
    canUsePremiumAnalyticsScript?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const SectionEditor: React.FC<SectionEditorProps> = ({
    structuredContent,
    onUpdate,
    isOpen,
    onClose,
    canUsePremiumAnalyticsScript = false
}) => {
    const [localContent, setLocalContent] = useState(structuredContent);
    const [selectedPanel, setSelectedPanel] = useState<'global' | string>('global');
    const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [autoSaved, setAutoSaved] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const rightPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalContent(structuredContent);
        }
    }, [isOpen, structuredContent]);

    const debouncedUpdate = useRef(
        debounce((content: any) => {
            onUpdate(content);
            setAutoSaved(true);
            setTimeout(() => setAutoSaved(false), 2500);
        }, 500)
    ).current;

    useEffect(() => {
        return () => { debouncedUpdate.cancel(); };
    }, [debouncedUpdate]);

    const hasSectionLayout = Array.isArray(localContent?.sections);

    const handleContentChange = useCallback((path: string, value: any) => {
        const newContent = produce(localContent, (draft: any) => {
            set(draft, path, value);
        });
        setLocalContent(newContent);
        debouncedUpdate(newContent);
    }, [localContent, debouncedUpdate]);

    const handleSaveAndClose = () => {
        debouncedUpdate.flush();
        onClose();
    };

    const reorderSection = (index: number, direction: 'up' | 'down') => {
        if (!hasSectionLayout) return;
        const newSections = [...(localContent?.sections || [])];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSections.length) return;
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        handleContentChange('sections', newSections);
    };

    const confirmDeleteSection = () => {
        if (sectionToDelete === null) return;
        const newSections = [...(localContent?.sections || [])];
        const deletedId = newSections[sectionToDelete]?.id;
        newSections.splice(sectionToDelete, 1);
        handleContentChange('sections', newSections);
        setSectionToDelete(null);
        if (selectedPanel === deletedId) setSelectedPanel('global');
        toast.success('Section removed');
    };

    const addSection = (type: string, componentId: string) => {
        const newSection = {
            id: generateId(),
            type,
            componentId,
            content: DEFAULT_SECTION_CONTENT[type] || {},
            settings: { isVisible: true },
        };
        const newSections = [...(localContent?.sections || []), newSection];
        handleContentChange('sections', newSections);
        setSelectedPanel(newSection.id);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} section added`);
    };

    const sections: any[] = hasSectionLayout ? (localContent?.sections || []) : [];
    const selectedSectionIndex = sections.findIndex(s => s.id === selectedPanel);
    const selectedSection = selectedSectionIndex >= 0 ? sections[selectedSectionIndex] : null;

    // Scroll right panel to top when section changes
    useEffect(() => {
        if (rightPanelRef.current) {
            rightPanelRef.current.scrollTop = 0;
        }
    }, [selectedPanel]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex bg-black/50 backdrop-blur-sm"
                    onClick={handleSaveAndClose}
                >
                    <MotionDiv
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="relative flex flex-col h-full bg-white shadow-2xl"
                        style={{ width: '760px', maxWidth: '96vw' }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        {/* ── HEADER ── */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white z-10 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                {/* Sidebar toggle for small screens */}
                                <button
                                    onClick={() => setSidebarOpen(p => !p)}
                                    className="sm:hidden p-2 -ml-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                                    title="Toggle sections panel"
                                >
                                    <Layers className="w-4 h-4" />
                                </button>
                                <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
                                    <Wand2 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 leading-none">Portfolio Editor</h2>
                                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">Visual content editor</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <AnimatePresence>
                                    {autoSaved && (
                                        <MotionDiv
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-1.5 text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full"
                                        >
                                            <Check className="w-3 h-3" /> Saved
                                        </MotionDiv>
                                    )}
                                </AnimatePresence>
                                <button
                                    onClick={handleSaveAndClose}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ── BODY ── */}
                        <div className="flex flex-1 min-h-0 overflow-hidden relative">

                            {/* ── Mobile sidebar overlay ── */}
                            {sidebarOpen && (
                                <div
                                    className="sm:hidden fixed inset-0 z-[5] bg-black/30"
                                    onClick={() => setSidebarOpen(false)}
                                />
                            )}

                            {/* ── LEFT PANEL ── */}
                            <div className={`
                                bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden flex-shrink-0
                                transition-all duration-200 ease-in-out
                                sm:relative sm:w-[220px] sm:translate-x-0
                                fixed inset-y-0 left-0 z-[6] w-[240px]
                                ${sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full sm:translate-x-0'}
                            `}>

                                {/* Global style button */}
                                <div className="px-3 pt-3 pb-2 flex-shrink-0">
                                    <button
                                        onClick={() => { setSelectedPanel('global'); setSidebarOpen(false); }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${selectedPanel === 'global'
                                            ? 'bg-teal-500 text-white shadow-md shadow-teal-200'
                                            : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'
                                            }`}
                                    >
                                        <Palette className={`w-4 h-4 flex-shrink-0 ${selectedPanel === 'global' ? 'text-white' : 'text-slate-400'}`} />
                                        <span className="text-xs font-semibold">Global Style</span>
                                    </button>
                                </div>

                                <div className="px-4 pb-1.5 flex-shrink-0">
                                    <div className="h-px bg-slate-200" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2.5 mb-1">
                                        Sections
                                        <span className="ml-1.5 text-slate-300 font-semibold">{sections.length}</span>
                                    </p>
                                </div>

                                {/* Section list */}
                                <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
                                    {hasSectionLayout ? sections.map((section: any, idx: number) => {
                                        const isSelected = selectedPanel === section.id;
                                        const isVisible = section.settings?.isVisible !== false;
                                        const sectionIcon = SECTION_ICONS[section.type] || SECTION_ICONS.default;

                                        return (
                                            <div
                                                key={section.id}
                                                className={`group flex items-center gap-1.5 px-2 py-2 rounded-lg cursor-pointer transition-all ${isSelected
                                                    ? 'bg-teal-50 border-l-[3px] border-teal-500 pl-1.5'
                                                    : 'hover:bg-white border-l-[3px] border-transparent'
                                                    } ${!isVisible ? 'opacity-50' : ''}`}
                                                onClick={() => { setSelectedPanel(section.id); setSidebarOpen(false); }}
                                            >
                                                {/* Reorder */}
                                                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); reorderSection(idx, 'up'); }}
                                                        className="p-0.5 text-slate-400 hover:text-teal-600 transition-colors"
                                                        title="Move up"
                                                    >
                                                        <ChevronUp className="w-2.5 h-2.5" />
                                                    </button>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); reorderSection(idx, 'down'); }}
                                                        className="p-0.5 text-slate-400 hover:text-teal-600 transition-colors"
                                                        title="Move down"
                                                    >
                                                        <ChevronDown className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>

                                                {/* Icon */}
                                                <span className="text-sm flex-shrink-0">{sectionIcon}</span>

                                                {/* Name */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-teal-800' : 'text-slate-700'}`}>
                                                        {humanize(section.type)}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleContentChange(`sections.${idx}.settings.isVisible`, !isVisible); }}
                                                        className={`p-1 rounded transition-colors ${isVisible ? 'text-slate-400 hover:text-slate-600' : 'text-slate-300 hover:text-slate-500'}`}
                                                        title={isVisible ? 'Hide section' : 'Show section'}
                                                    >
                                                        {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                    </button>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); setSectionToDelete(idx); }}
                                                        className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                                                        title="Delete section"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="px-3 py-4 text-center">
                                           
                                        </div>
                                    )}
                                </div>

                                {/* Add section button */}
                                {hasSectionLayout && (
                                    <div className="px-3 py-3 flex-shrink-0 border-t border-slate-200">
                                        <button
                                            onClick={() => setShowAddModal(true)}
                                            className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50/50 transition-all"
                                        >
                                            <Plus className="w-3 h-3" /> Add Section
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* ── RIGHT PANEL ── */}
                            <div ref={rightPanelRef} className="flex-1 min-w-0 overflow-y-auto bg-white">
                                {selectedPanel === 'global' ? (
                                    <div className="p-6">
                                        {/* Panel header */}
                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Palette className="w-4 h-4 text-teal-500" />
                                                <h3 className="text-sm font-bold text-slate-900">Global Style</h3>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Controls color scheme, typography, and branding.</p>
                                        </div>
                                        <GlobalStylePanel
                                            localContent={localContent}
                                            onContentChange={handleContentChange}
                                            canUsePremiumAnalyticsScript={canUsePremiumAnalyticsScript}
                                        />
                                    </div>
                                ) : selectedSection ? (
                                    <div className="flex flex-col h-full">
                                        {/* Section panel header */}
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 sticky top-0 bg-white z-10">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="text-xl flex-shrink-0">{SECTION_ICONS[selectedSection.type] || SECTION_ICONS.default}</span>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold text-slate-900">{humanize(selectedSection.type)}</h3>
                                                    <p className="text-[10px] text-slate-400 truncate">{selectedSection.componentId}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* Visibility toggle */}
                                                <button
                                                    onClick={() => handleContentChange(`sections.${selectedSectionIndex}.settings.isVisible`, selectedSection.settings?.isVisible === false ? true : false)}
                                                    className={`p-2 rounded-lg transition-all ${selectedSection.settings?.isVisible !== false ? 'bg-teal-50 text-teal-600 hover:bg-teal-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                    title={selectedSection.settings?.isVisible !== false ? 'Hide section' : 'Show section'}
                                                >
                                                    {selectedSection.settings?.isVisible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                </button>
                                                {/* Style switcher */}
                                                <StyleSwitcher
                                                    section={selectedSection}
                                                    sectionIndex={selectedSectionIndex}
                                                    onSwitch={(componentId) => handleContentChange(`sections.${selectedSectionIndex}.componentId`, componentId)}
                                                />
                                            </div>
                                        </div>

                                        {/* Section editor content */}
                                        <div className="p-6 flex-1">
                                            <SectionContentEditor
                                                section={selectedSection}
                                                sectionIndex={selectedSectionIndex}
                                                onContentChange={handleContentChange}
                                            />
                                        </div>
                                    </div>
                                ) : !hasSectionLayout ? (
                                    /* Legacy format fallback */
                                    <div className="p-6 space-y-6">
                                        <div className="mb-6">
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">Content Editor</h3>
                                            <p className="text-[11px] text-slate-500">Edit all content fields below.</p>
                                        </div>
                                        {localContent && Object.entries(localContent).map(([key, value]) => (
                                            <div key={key} className="space-y-4">
                                                <div className="flex items-center gap-3 sticky top-0 bg-white/95 backdrop-blur-md py-3 z-[5] -mx-6 px-6 border-b border-slate-100 shadow-sm">
                                                    <div className="w-1 h-4 bg-teal-500 rounded-full" />
                                                    <h3 className="text-sm font-semibold text-slate-900">{humanize(key)}</h3>
                                                </div>
                                                <div className="pl-3 border-l border-slate-200 space-y-4">
                                                    <JsonNodeEditor path={key} node={value} onContentChange={handleContentChange} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* Empty state - no section selected */
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                            <Layers className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-700 mb-1">Select a Section</h3>
                                        <p className="text-[11px] text-slate-400 max-w-[200px]">Choose a section from the left panel to edit its content.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── FOOTER ── */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                            <p className="text-[10px] text-slate-400">Changes auto-save</p>
                            <button
                                onClick={handleSaveAndClose}
                                className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-200 transition-all"
                            >
                                <Check className="w-3.5 h-3.5" /> Done
                            </button>
                        </div>
                    </MotionDiv>
                </div>
            )}

            {/* Deletion Confirmation Modal */}
            <ConfirmModal
                isOpen={sectionToDelete !== null}
                onClose={() => setSectionToDelete(null)}
                onConfirm={confirmDeleteSection}
                title="Remove Section"
                description="Are you sure you want to remove this section? This action cannot be undone."
                confirmText="Remove Section"
                variant="danger"
                isDestructive={true}
            />

            {/* Add Section Modal */}
            <AddSectionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={addSection}
            />
        </AnimatePresence>
    );
};

export default SectionEditor;
