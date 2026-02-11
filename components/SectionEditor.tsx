import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { produce } from 'immer';
import set from 'lodash/set';
import debounce from 'lodash/debounce';
import { ICONS } from '@/constants';
import { FileText, Trash2, Type, Eye, EyeOff, Loader2, Loader, ChevronUp, ChevronDown, ChevronRight, RefreshCw, Layers, Pencil } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import cloudinaryService from '@/services/cloudinaryService';
import { toast } from 'sonner';  
import { RegistryMetadata } from '@/registry/metadata';

const MotionDiv = motion.div as any;

// Helper to get available components for a section category
const getAvailableComponents = (category: string) => {
    return Object.values(RegistryMetadata)
        .filter(m => m.category === category)
        .map(m => m.id);
};

const extractPublicId = (url: string) => {
    if (!url || !url.includes('cloudinary')) return null;
    const regex = /\/v\d+\/(.+)\.[a-z]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

interface SectionEditorProps {
    structuredContent: any;
    onUpdate: (newContent: any) => void;
    isOpen: boolean;
    onClose: () => void;
}


const isImageUrl = (value: string) => {
    if (typeof value !== 'string') return false;
    if (value.startsWith('data:image')) return true;
    // Cloudinary, Unsplash, or common extensions
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

    // Heuristic: Check if the path implies this is an image even if currently empty or missing
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

    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase());
};


const SmartInput = ({ path, value, onContentChange }) => {
    const type = getTypeName(value, path);
    const label = humanize(path.split('.').pop() || '');
    const [imageMode, setImageMode] = useState<'link' | 'upload'>('link');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e: any) => onContentChange(path, e.target.value);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                // If there's an existing cloudinary image, delete it
                const oldPublicId = extractPublicId(value);
                if (oldPublicId) {
                    await cloudinaryService.deleteFile(oldPublicId);
                }

                const result = await cloudinaryService.uploadFile(file);

                if (result && (result.url || result.secureUrl)) {
                    const newUrl = result.secureUrl || result.url;
                    onContentChange(path, newUrl);
                    toast.success('Image uploaded to Cloudinary');
                } else {
                    throw new Error('Upload response missing URL');
                }
            } catch (err: any) {
                console.error('[SmartInput] Upload failed:', err);
                toast.error(err.message || 'Failed to upload image');
            } finally {
                setIsUploading(false);
            }
        }
    };

    switch (type) {
        case 'boolean':
            return (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</label>
                    <button
                        onClick={() => onContentChange(path, !value)}
                        className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-teal-500' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${value ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            );
        case 'image':
            return (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">{label}</label>
                        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                            <button
                                onClick={() => setImageMode('link')}
                                className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${imageMode === 'link' ? 'bg-white shadow text-teal-600' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Link
                            </button>
                            <button
                                onClick={() => setImageMode('upload')}
                                className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${imageMode === 'upload' ? 'bg-white shadow text-teal-600' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Upload
                            </button>
                        </div>
                    </div>

                    {value && (
                        <div className="relative group w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                        </div>
                    )}

                    {imageMode === 'link' ? (
                        <div className="relative">
                            <ICONS.Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={value}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                            />
                        </div>
                    ) : (
                        <div
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                            className={`w-full border-2 border-dashed border-slate-200 rounded-xl py-4 flex flex-col items-center justify-center cursor-pointer transition-all group ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-teal-500/50 hover:bg-teal-50'}`}
                        >
                            {isUploading ? (
                                <Loader className="text-teal-500 animate-spin mb-2" />
                            ) : (
                                <ICONS.Upload className="w-5 h-5 text-slate-400 group-hover:text-teal-500 mb-2 transition-colors" />
                            )}
                            <span className="text-xs font-medium text-slate-500 group-hover:text-teal-600">
                                {isUploading ? 'Uploading...' : 'Click to Select File'}
                            </span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={isUploading}
                            />
                        </div>
                    )}
                </div>
            );
        case 'rich-text':
            return (
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">{label}</label>
                    <textarea
                        value={value}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium placeholder:text-slate-400 min-h-[100px] max-h-40 text-slate-900 leading-relaxed shadow-sm"
                    />
                </div>
            );
        case 'text':
        default:

            return (
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">{label}</label>
                    <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={value}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                </div>
            );
    }
};

// --- Recursive Node Editor ---

const JsonNodeEditor = ({ path, node, onContentChange }) => {
    const type = getTypeName(node, path);

    if (type === 'list') {
        const sampleItem = node[0] || (node.length > 0 ? node[0] : { value: '' });
        // Heuristic for simple arrays of strings vs objects
        const isSimpleArray = typeof sampleItem === 'string';

        const addItem = () => {
            const newItem = isSimpleArray
                ? "New Item"
                : Object.keys(sampleItem).reduce((acc, key) => ({ ...acc, [key]: `New ${humanize(key)}` }), {});

            onContentChange(path, [...node, newItem]);
        };

        const recursiveDeleteFromCloudinary = async (val: any) => {
            if (typeof val === 'string') {
                const publicId = extractPublicId(val);
                if (publicId) await cloudinaryService.deleteFile(publicId);
            } else if (typeof val === 'object' && val !== null) {
                for (const subVal of Object.values(val)) {
                    await recursiveDeleteFromCloudinary(subVal);
                }
            }
        };

        const removeItem = async (index: number) => {
            const itemToRemove = node[index];
            await recursiveDeleteFromCloudinary(itemToRemove);

            const newItems = [...node];
            newItems.splice(index, 1);
            onContentChange(path, newItems);
        };

        return (
            <div className="space-y-3">
                {node.map((item: any, index: number) => {
                    const isObject = typeof item === 'object' && item !== null;
                    const title = isObject ? (item.title || item.name || item.header || `Item ${index + 1}`) : `Item ${index + 1}`;

                    return (
                        <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-teal-500/50 transition-all group/item">
                            {/* Item Header */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate max-w-[200px]">
                                    {isSimpleArray ? `Value ${index + 1}` : title}
                                </span>
                                <button
                                    onClick={() => removeItem(index)}
                                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                    title="Remove Item"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Item Content */}
                            <div className="p-4">
                                <JsonNodeEditor path={`${path}[${index}]`} node={item} onContentChange={onContentChange} />
                            </div>
                        </div>
                    );
                })}

                <button
                    onClick={addItem}
                    className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-teal-600 hover:border-teal-500 hover:bg-teal-50 transition-all flex items-center justify-center gap-2"
                >
                    <ICONS.Plus className="w-3.5 h-3.5" /> Add {humanize(path.split('.').pop() || 'Item')}
                </button>
            </div>
        );
    }

    if (type === 'object') {
        return (
            <div className="grid grid-cols-1 gap-5">
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

const SectionEditor: React.FC<SectionEditorProps> = ({ structuredContent, onUpdate, isOpen, onClose }) => {
    // Local state to keep track of changes before syncing to parent
    const [localContent, setLocalContent] = useState(structuredContent);

    // Default to expanding the last section in the list (most likely the one just added)
    const [expandedSection, setExpandedSection] = useState<string | null>(
        localContent?.sections?.length > 0 ? localContent.sections[localContent.sections.length - 1].id : null
    );

    // Sync local state when external content changes (e.g. when opening)
    useEffect(() => {
        if (isOpen) {
            setLocalContent(structuredContent);
        }
    }, [isOpen, structuredContent]);

    // Debounced update function to prevent excessive parent re-renders
    const debouncedUpdate = useRef(
        debounce((content: any) => {
            onUpdate(content);
        }, 500)
    ).current;

    // Cleanup debounce on unmount and ensure final changes are saved
    useEffect(() => {
        return () => {
            debouncedUpdate.cancel();
        };
    }, [debouncedUpdate]);

    const isV1 = localContent?.metadata?.version === '1.0';

    const handleContentChange = (path: string, value: any) => {
        const newContent = produce(localContent, (draft: any) => {
            set(draft, path, value);
        });

        // 1. Update local state immediately for snappy UI
        setLocalContent(newContent);

        // 2. Schedule parent update with debounce
        debouncedUpdate(newContent);
    };

    const handleSaveAndClose = () => {
        debouncedUpdate.flush(); // Force any pending updates
        onClose();
    };

    const reorderSection = (index: number, direction: 'up' | 'down') => {
        if (!isV1) return;
        const newSections = [...localContent.sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSections.length) return;

        const temp = newSections[index];
        newSections[index] = newSections[targetIndex];
        newSections[targetIndex] = temp;

        handleContentChange('sections', newSections);
    };

    const swapComponent = (index: number) => {
        if (!isV1) return;
        const section = localContent.sections[index];
        const available = getAvailableComponents(section.type as any);
        if (available.length <= 1) {
            toast.info(`Only one ${section.type} style available in registry`);
            return;
        }

        const currentIdx = available.indexOf(section.componentId);
        const nextId = available[(currentIdx + 1) % available.length];

        handleContentChange(`sections.${index}.componentId`, nextId);
        toast.success(`Swapped to ${humanize(nextId)}`);
    };

    const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);

    const deleteSection = (index: number) => {
        setSectionToDelete(index);
    };

    const confirmDeleteSection = () => {
        if (sectionToDelete === null) return;
        const newSections = [...localContent.sections];
        newSections.splice(sectionToDelete, 1);
        handleContentChange('sections', newSections);
        setSectionToDelete(null);
        toast.success("Section removed");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm" onClick={handleSaveAndClose}>
                    <MotionDiv
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-teal-600" />
                                    Content Editor
                                    <span className="text-[10px] font-medium text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full ml-2 border border-teal-200">Auto-saved</span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Customize your content
                                </p>
                            </div>
                            <button onClick={handleSaveAndClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                                <ICONS.X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {isV1 ? (
                                <>
                                    {/* Global config (Theming) */}
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Layers className="w-4 h-4 text-teal-600" />
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Global Aesthetics</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Creative Direction</label>
                                                <div className="relative">
                                                    <select
                                                        value={localContent.globalConfig.theme}
                                                        onChange={(e) => handleContentChange('globalConfig.theme', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-4 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-bold text-slate-900 appearance-none cursor-pointer shadow-sm"
                                                    >
                                                        <optgroup label="Core Themes">
                                                            <option value="dark">Midnight (Standard Dark)</option>
                                                            <option value="light">Paper (Standard Light)</option>
                                                        </optgroup>
                                                        <optgroup label="Signature Schemes">
                                                            <option value="CYBER_NEON">Cyber Neon (Vivid)</option>
                                                            <option value="MINIMAL_PAPER">Minimal Paper (Clean)</option>
                                                            <option value="LUXURY_GOLD">Luxury Gold (Premium)</option>
                                                            <option value="VIBRANT_BLOOM">Vibrant Bloom (Creative)</option>
                                                            <option value="DEEP_FOREST">Deep Forest (Organic)</option>
                                                            <option value="OCEANIC_MIST">Oceanic Mist (Calm)</option>
                                                            <option value="COFFEE_BEAST">Coffee Beast (Warm)</option>
                                                        </optgroup>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <ChevronDown className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sections list */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 pl-2">Layout Sections</h3>
                                            <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 border border-slate-200 rounded-full">{localContent.sections.length} Units</span>
                                        </div>

                                        <div className="space-y-4">
                                            {localContent.sections.map((section: any, idx: number) => (
                                                <div key={section.id} className="relative group/section">
                                                    <div className={`p-4 rounded-2xl border transition-all ${expandedSection === section.id ? 'bg-white shadow-md border-teal-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                        <div className="flex items-center gap-4">
                                                            {/* Reorder controls */}
                                                            <div className="flex flex-col gap-1  transition-opacity">
                                                                <button onClick={() => reorderSection(idx, 'up')} className="p-1 text-slate-400 hover:text-teal-600"><ChevronUp className="w-3 h-3" /></button>
                                                                <button onClick={() => reorderSection(idx, 'down')} className="p-1 text-slate-400 hover:text-teal-600"><ChevronDown className="w-3 h-3" /></button>
                                                            </div>

                                                            <div className="flex items-center gap-3 flex-1 cursor-pointer group/title" onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}>
                                                                <div className={`p-1.5 rounded-full transition-colors ${expandedSection === section.id ? 'bg-teal-50 text-teal-600' : 'text-slate-400 group-hover/title:text-slate-600'}`}>
                                                                    {expandedSection === section.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-teal-600 opacity-80 flex items-center gap-2">
                                                                        {section.type}
                                                                        {!expandedSection && <span className="opacity-0 group-hover/title:opacity-100 transition-opacity text-slate-400 flex items-center gap-1"><Pencil className="w-3 h-3" /> Edit</span>}
                                                                    </p>
                                                                    <p className="text-[9px] font-bold text-slate-900">{humanize(section.componentId)}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => swapComponent(idx)}
                                                                    className="p-2 bg-slate-100 rounded-lg hover:bg-teal-50 text-slate-500 hover:text-teal-600 transition-all"
                                                                    title="Swap Variation"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleContentChange(`sections.${idx}.settings.isVisible`, !section.settings?.isVisible)}
                                                                    className={`p-2 rounded-lg transition-all ${section.settings?.isVisible !== false ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'}`}
                                                                >
                                                                    {section.settings?.isVisible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                                </button>
                                                                <button onClick={() => deleteSection(idx)} className="p-2 text-rose-500 transition-opacity">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <AnimatePresence>
                                                            {expandedSection === section.id && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="pt-6 mt-4 border-t border-slate-100 space-y-6">
                                                                        <JsonNodeEditor path={`sections.${idx}.content`} node={section.content} onContentChange={handleContentChange} />
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {localContent && Object.entries(localContent).map(([key, value]) => (
                                        <div key={key} className="space-y-4">
                                            <div className="flex items-center gap-3 sticky top-0 bg-white/95 backdrop-blur-md py-3 z-[5] -mx-2 px-2 border-b border-slate-100 mb-4 shadow-sm">
                                                <div className="w-1 h-4 bg-teal-500 rounded-full" />
                                                <h3 className="text-sm text-slate-900">{humanize(key)}</h3>
                                                <div className="flex-1" />
                                                <button
                                                    onClick={() => {
                                                        const currentSections = localContent.settings?.sections || {};
                                                        const isVisible = currentSections[key] !== false;
                                                        handleContentChange(`settings.sections.${key}`, !isVisible);
                                                    }}
                                                    className={`p-1.5 rounded-md transition-all ${(localContent.settings?.sections?.[key] !== false)
                                                        ? 'text-teal-600 hover:bg-teal-50'
                                                        : 'text-slate-400 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    {localContent.settings?.sections?.[key] !== false ? (
                                                        <Eye className="w-4 h-4" />
                                                    ) : (
                                                        <EyeOff className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="pl-3 border-l border-slate-200 space-y-6">
                                                <JsonNodeEditor path={key} node={value} onContentChange={handleContentChange} />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50">
                            <button onClick={handleSaveAndClose} className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-teal-900/10 transition-all flex items-center justify-center gap-2">
                                <ICONS.Check className="w-4 h-4" /> Save Changes
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
        </AnimatePresence>
    );
};

export default SectionEditor