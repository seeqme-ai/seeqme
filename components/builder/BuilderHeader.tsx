import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2, Undo2, Globe, Pencil, Loader2, Rocket, Compass } from 'lucide-react';
import { BuildStatus, PortfolioData } from '@/types';

interface BuilderHeaderProps {
  status: BuildStatus;
  isPublishing: boolean;
  data: PortfolioData | null;
  historyLength: number;
  onRemix: () => void;
  onUndo: () => void;
  onDeploy: () => void;
  onOpenEditor: () => void;
  onGuide?: () => void;
  currentTheme?: 'dark' | 'light';
}

const MotionDiv = motion.div as any;

const ACTIVE_STATUSES: BuildStatus[] = ['generating', 'analyzing', 'styling', 'synthesizing'];

const STATUS_CONFIG: Record<string, { dot: string; label: string; pulse: boolean }> = {
  generating:   { dot: 'bg-amber-400',  label: 'Generating…',  pulse: true },
  analyzing:    { dot: 'bg-amber-400',  label: 'Analyzing…',   pulse: true },
  styling:      { dot: 'bg-amber-400',  label: 'Styling…',     pulse: true },
  synthesizing: { dot: 'bg-amber-400',  label: 'Polishing…',   pulse: true },
  deploying:    { dot: 'bg-blue-400',   label: 'Publishing…',  pulse: true },
  ready:        { dot: 'bg-emerald-500', label: 'Ready',        pulse: false },
  completed:    { dot: 'bg-emerald-500', label: 'Live',         pulse: false },
  idle:         { dot: 'bg-slate-400',  label: 'Draft',         pulse: false },
};

const BuilderHeader: React.FC<BuilderHeaderProps> = ({
  status, isPublishing, data, historyLength,
  onRemix, onUndo, onDeploy, onOpenEditor, onGuide,
}) => {
  const navigate = useNavigate();
  const isGenerating = ACTIVE_STATUSES.includes(status);

  const [guideSeen, setGuideSeen] = useState(
    () => localStorage.getItem('seeqme_guide_seen') === 'true'
  );

  const handleGuideClick = () => {
    if (!guideSeen) {
      setGuideSeen(true);
      localStorage.setItem('seeqme_guide_seen', 'true');
    }
    onGuide?.();
  };
  const statusCfg = STATUS_CONFIG[isPublishing ? 'deploying' : status] ?? STATUS_CONFIG.idle;

  const isDeployed = data && !data.id.startsWith('portfolio-') &&
    ((data as any).url || (data as any).subdomain || (data as any).status === 'completed');
  const deployLabel = isPublishing ? 'Publishing…' : isDeployed ? 'Redeploy' : 'Publish';

  const showUndo = historyLength > 0 || (data && !data.id?.startsWith('portfolio-'));

  return (
    <MotionDiv
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="fixed top-0 w-full z-[100] bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm"
    >
      <div className="max-w-full px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3">

        {/* Left: back + status */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-1 hover:bg-slate-100 rounded-full transition-colors shrink-0"
            title="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              {statusCfg.pulse && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusCfg.dot} opacity-75`} />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusCfg.dot}`} />
            </span>
            <span className="text-xs font-semibold text-slate-500">{statusCfg.label}</span>
          </div>
        </div>

        {/* Center: remix + undo */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              data-tour="remix-button"
              onClick={onRemix}
              disabled={isGenerating}
              className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-2 rounded-full text-[11px] font-bold text-violet-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Generate a new layout — your content stays"
            >
              {isGenerating
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Wand2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isGenerating ? 'Working…' : 'Remix'}</span>
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              <div className="bg-slate-900 text-white text-[10px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                New layout, same content
              </div>
            </div>
          </div>

          {showUndo && (
            <button
              data-tour="undo-button"
              onClick={onUndo}
              title="Undo last change"
              className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full text-rose-500 transition-all active:scale-95"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: guide + edit + publish */}
        <div className="flex items-center gap-2">
          {onGuide && (
            <div className="relative group">
              {/* Pulse ring — shown until the user clicks Guide once */}
              {!guideSeen && (
                <span className="absolute -inset-1 rounded-full animate-ping bg-teal-400/30 pointer-events-none" />
              )}
              <button
                onClick={handleGuideClick}
                className={`relative flex items-center gap-1.5 border px-2.5 py-2 rounded-full text-[11px] font-semibold transition-all active:scale-95 ${
                  guideSeen
                    ? 'border-dashed border-slate-300 bg-white hover:bg-slate-50 hover:border-teal-400 text-slate-500 hover:text-teal-600'
                    : 'border-teal-400 bg-teal-50 text-teal-600 hover:bg-teal-100'
                }`}
                title="Take a tour of the builder"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Guide</span>
              </button>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div className="bg-slate-900 text-white text-[10px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  Take a tour
                </div>
              </div>
            </div>
          )}

          <button
            data-tour="edit-section"
            onClick={onOpenEditor}
            className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 rounded-full text-xs font-semibold text-slate-700 transition-all active:scale-95"
            title="Edit portfolio sections"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            data-tour="deploy-button"
            onClick={onDeploy}
            disabled={isPublishing || isGenerating}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${
              isPublishing
                ? 'bg-amber-500 text-white'
                : isDeployed
                ? 'bg-slate-900 hover:bg-slate-700 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
            }`}
          >
            {isPublishing
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : isDeployed
              ? <Globe className="w-3.5 h-3.5" />
              : <Rocket className="w-3.5 h-3.5" />}
            <span>{deployLabel}</span>
          </button>
        </div>
      </div>
    </MotionDiv>
  );
};

export default React.memo(BuilderHeader);
