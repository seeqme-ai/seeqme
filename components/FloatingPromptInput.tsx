import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, ArrowUp, X, FileText, Image as ImageIcon, Loader, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadService } from '@/services/apiService';

interface FloatingPromptInputProps {
    onSubmit: (prompt: string, mode: 'refine' | 'new', file?: any) => void;
    isGenerating: boolean;
    className?: string;
    onToggleTerminal?: () => void;
}

const FloatingPromptInput: React.FC<FloatingPromptInputProps> = ({ onSubmit, isGenerating, className, onToggleTerminal }) => {
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState<'refine' | 'new'>('refine');
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; content?: string; url?: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [prompt]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset file input after selection
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        setIsUploading(true);
        try {
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                // CV / Document extraction
                const { content } = await uploadService.extractCV(file);
                setSelectedFile({ name: file.name, type: 'document', content });
                toast.success('Document analyzed successfully');
            } else if (file.type.startsWith('image/')) {
                // Image upload
                const { url } = await uploadService.uploadFile(file);
                setSelectedFile({ name: file.name, type: 'image', url });
                toast.success('Image attached');
            } else {
                toast.error('Unsupported file type. Please upload PDF or Image.');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to process file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!prompt.trim() && !selectedFile) return;

        onSubmit(prompt, mode, selectedFile);
        setPrompt('');
        setSelectedFile(null);
        setIsExpanded(false);

        // Reset height
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className={`fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40 ${className}`}>
            {/* File Indicator - Shows above input */}
            <AnimatePresence>
                {selectedFile && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="mb-3 bg-white rounded-lg p-2 flex items-center gap-2 border border-slate-200 shadow-lg"
                    >
                        {selectedFile.type === 'image' ? <ImageIcon className="w-4 h-4 text-purple-500" /> : <FileText className="w-4 h-4 text-teal-500" />}
                        <span className="text-xs font-medium max-w-[150px] truncate text-slate-700">{selectedFile.name}</span>
                        <button type="button" onClick={() => setSelectedFile(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 ml-auto">
                            <X className="w-3 h-3" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                layout
                data-tour="floating-input"
                className={`bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-2xl overflow-hidden transition-all ${isExpanded ? 'rounded-3xl' : 'rounded-full'}`}
            >
                <form onSubmit={handleSubmit} className="relative">

                    {/* Expanded Header (Mode Selection) */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 p-4 border-b border-slate-100"
                            >
                                <button
                                    type="button"
                                    onClick={() => setMode('refine')}
                                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${mode === 'refine' ? 'bg-teal-500/10 text-teal-600 border border-teal-500/20' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Refine
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('new')}
                                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${mode === 'new' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Build
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-end gap-2 p-2">

                        {onToggleTerminal && (
                            <button
                                type="button"
                                onClick={onToggleTerminal}
                                className="p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
                                title="Toggle Terminal"
                            >
                                <Code2 className="w-5 h-5" />
                            </button>
                        )}

                        {/* File Upload Button */}
                        <div className="relative">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*,application/pdf"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || isGenerating}
                                className="p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                            >
                                {isUploading ? <Loader className="w-5 h-5 animate-spin text-teal-500" /> : <Paperclip className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Text Input */}
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onFocus={() => setIsExpanded(true)}
                            onKeyDown={handleKeyDown}
                            placeholder={mode === 'refine' ? "Ask AI to change colors, layout, or content..." : "Describe your new portfolio niche & style..."}
                            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 py-3 max-h-[200px] resize-none"
                            rows={1}
                            disabled={isGenerating}
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={(!prompt.trim() && !selectedFile) || isGenerating}
                            className={`p-3 rounded-full transition-all duration-300 shadow-lg ${(!prompt.trim() && !selectedFile) ? 'bg-slate-100 text-slate-300' : 'bg-teal-500  text-white hover:shadow-teal-500/25'
                                }`}
                        >
                            {isGenerating ? <Loader className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default FloatingPromptInput;