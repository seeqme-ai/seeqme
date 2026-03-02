import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ICONS } from '@/constants';
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
    currentTheme?: 'dark' | 'light';
}

const MotionDiv = motion.div as any;

const BuilderHeader: React.FC<BuilderHeaderProps> = ({
    status,
    isPublishing,
    data,
    historyLength,
    onRemix,
    onUndo,
    onDeploy,
    onOpenEditor,
}) => {
    const navigate = useNavigate();

    return (
        <MotionDiv
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 w-full z-[100] border-b border-border bg-background/80 backdrop-blur-xl"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-teal-500/10 rounded-full transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-border hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                        <button
                            data-tour="remix-button"
                            onClick={onRemix}
                            className="flex items-center gap-2 bg-teal-500/10 border border-primary/20 px-4 py-2 rounded-full text-[11px] font-semibold hover:bg-teal-500/20 transition-all active:scale-95 shadow-sm"
                        >
                            <ICONS.Remix className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Remix Design</span>
                        </button>
                        {(historyLength > 0 || (data && !data.id.startsWith('portfolio-'))) && (
                            <button
                                data-tour="undo-button"
                                onClick={onUndo}
                                title="Undo Last Action"
                                className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 hover:bg-rose-500/20 transition-all active:scale-95"
                            >
                                <ICONS.Undo className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        data-tour="edit-section"
                        onClick={onOpenEditor}
                        className="flex items-center gap-2 bg-teal-500 text-white border border-primary/20 px-3 sm:px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-teal-600 transition-all active:scale-95 shadow-md"
                        title="Edit Content"
                    >
                        <ICONS.Settings className="w-4 h-4" /> <span className="hidden sm:inline">Edit Content</span>
                    </button>
                    <button
                        data-tour="deploy-button"
                        onClick={onDeploy}
                        disabled={isPublishing}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold transition-all active:scale-95 shadow-md disabled:opacity-70 disabled:cursor-not-allowed ${isPublishing ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
                    >
                        {isPublishing ? <ICONS.Loader className="w-4 h-4 animate-spin" /> : <ICONS.Globe className="w-4 h-4" />}
                        <span>
                            {isPublishing
                                ? 'Publishing'
                                : (data && !data.id.startsWith('portfolio-') && ((data as any).url || (data as any).subdomain || (data as any).status === 'completed') ? 'Redeploy' : 'Publish')}
                        </span>
                    </button>
                </div>
            </div>
        </MotionDiv>
    );
};

export default React.memo(BuilderHeader);
