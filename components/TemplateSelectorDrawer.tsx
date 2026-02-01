import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PORTFOLIO_TEMPLATES } from '@/templates';
import { Layout, X, Plus, Layers, Search, Sparkles } from 'lucide-react';
import { RegistryMetadata } from '@/registry/metadata';

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (templateId: string) => void;
    onAddBlock?: (componentId: string) => void;
    currentTemplateId?: string;
}

const TemplateSelectorDrawer: React.FC<TemplateSelectorProps> = ({ isOpen, onClose, onSelect, onAddBlock, currentTemplateId }) => {
    const [activeTab, setActiveTab] = useState<'templates' | 'blocks'>('templates');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['hero', 'about', 'skills', 'experience', 'projects', 'testimonials', 'contact'];

    const filteredBlocks = Object.values(RegistryMetadata).filter(block => {
        const matchesSearch = block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            block.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end bg-black/20 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 bg-white z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                        Design Library
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold opacity-60">Architect your identity</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex p-1 bg-slate-100 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('templates')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'templates'
                                        ? 'bg-white text-teal-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <Layout className="w-4 h-4" />
                                    Templates
                                </button>
                                <button
                                    onClick={() => setActiveTab('blocks')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'blocks'
                                        ? 'bg-white text-teal-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <Layers className="w-4 h-4" />
                                    Blocks
                                </button>
                            </div>
                        </div>

                        {/* Search (only for blocks) */}
                        {activeTab === 'blocks' && (
                            <div className="px-6 pt-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search premium blocks..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {activeTab === 'templates' ? (
                                <div className="space-y-4">
                                    {PORTFOLIO_TEMPLATES.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => {
                                                onSelect(template.id);
                                                onClose();
                                            }}
                                            className={`w-full group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left ${currentTemplateId === template.id
                                                ? 'border-teal-500 bg-teal-50 shadow-teal-500/10 shadow-xl'
                                                : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white'
                                                }`}
                                        >
                                            <div className="h-36 bg-slate-200 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-slate-400/20 to-teal-500/20" />
                                                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end z-10">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${currentTemplateId === template.id ? 'bg-teal-500/10 border-teal-500/20 text-teal-700' : 'bg-white/50 border-white/50 text-slate-500'
                                                        }`}>
                                                        {template.niche}
                                                    </span>
                                                </div>
                                                {currentTemplateId === template.id && (
                                                    <div className="absolute top-3 right-3 bg-teal-500 text-white p-1.5 rounded-full shadow-lg">
                                                        <Sparkles className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4">
                                                <h3 className={`font-black uppercase tracking-tight transition-colors ${currentTemplateId === template.id ? 'text-teal-700' : 'text-slate-900 group-hover:text-teal-600'}`}>{template.name}</h3>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {categories.map(cat => {
                                        const blocksInCat = filteredBlocks.filter(b => b.category === cat);
                                        if (blocksInCat.length === 0) return null;

                                        return (
                                            <div key={cat} className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">{cat}s</h4>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {blocksInCat.map(block => (
                                                        <div
                                                            key={block.id}
                                                            className="group relative bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-teal-500/30 hover:bg-teal-50/30 transition-all flex items-center justify-between"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-slate-800">{block.name}</p>
                                                                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{block.description}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    onAddBlock?.(block.id);
                                                                    onClose();
                                                                }}
                                                                className="ml-4 p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-teal-600 hover:border-teal-200 hover:shadow-lg transition-all group-hover:scale-110"
                                                                title="Add to Portfolio"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TemplateSelectorDrawer;
