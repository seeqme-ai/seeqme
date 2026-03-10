import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, FileText, Blocks } from 'lucide-react';
import BuilderLoader from '@/components/BuilderLoader';
import { BuildStatus } from '@/types';

interface BuilderViewportProps {
    status: BuildStatus;
    data: any | null;
    progress: number;
    refinementPrompt: string;
    isIframeLoading: boolean;
    iframeRef: React.RefObject<HTMLIFrameElement>;
    onIframeLoad: () => void;
}

const MotionDiv = motion.div as any;

const BuilderViewport: React.FC<BuilderViewportProps> = ({
    status,
    data,
    progress,
    refinementPrompt,
    isIframeLoading,
    iframeRef,
    onIframeLoad,
}) => {
    const isActivelyGenerating = status === 'synthesizing' || status === 'generating';
    const loaderTitle =
        status === 'generating'
            ? (refinementPrompt ? 'Refining...' : 'Remixing...')
            : 'Building...';
    const showSpinnerOverlay = isIframeLoading && !isActivelyGenerating;

    return (
        <div className="flex-1 relative overflow-hidden bg-background">
            <AnimatePresence mode="wait">
                {isActivelyGenerating ? (
                    <BuilderLoader
                        title={loaderTitle}
                        currentStep={progress}
                        totalSteps={100}
                    />
                ) : data ? (
                    <MotionDiv key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
                        {showSpinnerOverlay && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm transition-all duration-500">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader className='text-teal-500 animate-spin' />
                                </div>
                            </div>
                        )}
                        <iframe
                            ref={iframeRef}
                            onLoad={onIframeLoad}
                            className="w-full h-full border-none bg-white"
                            title="Artifact Viewport"
                        />
                    </MotionDiv>
                ) : (
                    <MotionDiv
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex items-center justify-center px-6"
                    >
                        {showSpinnerOverlay && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm transition-all duration-500">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader className='text-teal-500 animate-spin' />
                                </div>
                            </div>
                        )}
                        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
                            <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mb-4">
                                <Blocks className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base">Start Your Portfolio Build</h3>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                                Enter a build prompt or attach your CV to generate a personalized portfolio.
                            </p>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
};

export default React.memo(BuilderViewport);
