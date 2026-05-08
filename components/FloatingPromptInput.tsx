import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, X, FileText, Image as ImageIcon, Loader, Paperclip, Wand2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { uploadService } from '@/services/apiService';

interface FloatingPromptInputProps {
  onSubmit: (prompt: string, mode: 'refine' | 'new', file?: any) => void;
  isGenerating: boolean;
  className?: string;
  onToggleTerminal?: () => void;
  initialMode?: 'refine' | 'new';
}

const MotionDiv = motion.div as any;

const MODE_CONFIG = {
  refine: {
    label: 'Refine',
    icon: <Wand2 className="w-3.5 h-3.5" />,
    placeholder: 'Describe what to change — colors, layout, copy, sections…',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    activeColor: 'bg-teal-600 text-white shadow-lg shadow-teal-600/20',
    hint: 'Refine: tweak the existing design',
  },
  new: {
    label: 'Rebuild',
    icon: <Plus className="w-3.5 h-3.5" />,
    placeholder: 'Describe a fresh design direction, niche, or style…',
    color: 'bg-violet-50 text-violet-700 border-violet-200',
    activeColor: 'bg-violet-600 text-white shadow-lg shadow-violet-600/20',
    hint: 'Rebuild: generate a completely new portfolio',
  },
} as const;

const FloatingPromptInput: React.FC<FloatingPromptInputProps> = ({
  onSubmit, isGenerating, className, onToggleTerminal, initialMode = 'refine',
}) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'refine' | 'new'>(initialMode);
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; content?: string; url?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [prompt]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsUploading(true);
    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const { content } = await uploadService.extractCV(file);
        setSelectedFile({ name: file.name, type: 'document', content });
        toast.success('CV attached');
      } else if (file.type.startsWith('image/')) {
        const { url } = await uploadService.uploadFile(file);
        setSelectedFile({ name: file.name, type: 'image', url });
        toast.success('Image attached');
      } else {
        toast.error('Please upload a PDF or image file.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not upload file. Please try again.');
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
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const modeConfig = MODE_CONFIG[mode];
  const hasContent = prompt.trim() || selectedFile;

  return (
    <div className={`fixed bottom-0 left-12 right-0 px-4 pb-4 z-40 ${className}`}>
      <div className="max-w-2xl mx-auto">
        <MotionDiv
          layout
          data-tour="floating-input"
          className="bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl shadow-slate-900/10 rounded-3xl overflow-hidden"
        >
          {/* Mode switcher — always visible */}
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-slate-100">
            {(Object.keys(MODE_CONFIG) as Array<'refine' | 'new'>).map(m => {
              const cfg = MODE_CONFIG[m];
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all border ${
                    isActive ? cfg.activeColor : `${cfg.color} border-transparent hover:border-current`
                  }`}
                >
                  {cfg.icon}
                  {cfg.label}
                </button>
              );
            })}
            <span className="ml-2 text-[10px] text-slate-400 font-medium hidden sm:block">
              {modeConfig.hint}
            </span>

            {/* Terminal toggle */}
            {onToggleTerminal && (
              <button
                type="button"
                onClick={onToggleTerminal}
                title="Toggle build logs"
                className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                Logs
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="relative">
            {/* File attachment indicator */}
            <AnimatePresence>
              {selectedFile && (
                <MotionDiv
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-4 mt-3"
                >
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                    {selectedFile.type === 'image'
                      ? <ImageIcon className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                      : <FileText className="w-3.5 h-3.5 text-teal-500 shrink-0" />}
                    <span className="text-xs font-semibold text-slate-600 truncate flex-1">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>

            {/* Text input row */}
            <div className="flex items-end gap-2 px-4 py-3">
              {/* Attach file */}
              <div className="shrink-0">
                <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isGenerating}
                  title="Attach file"
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40"
                >
                  {isUploading ? <Loader className="w-4 h-4 animate-spin text-teal-500" /> : <Paperclip className="w-4 h-4" />}
                </button>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={modeConfig.placeholder}
                rows={1}
                disabled={isGenerating}
                className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-slate-900 placeholder:text-slate-300 resize-none max-h-[160px] py-2 leading-relaxed"
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={!hasContent || isGenerating}
                className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  hasContent && !isGenerating
                    ? mode === 'refine'
                      ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20'
                      : 'bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-600/20'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </MotionDiv>
      </div>
    </div>
  );
};

export default FloatingPromptInput;
