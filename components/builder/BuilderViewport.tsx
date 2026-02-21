import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from 'lucide-react';
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
    return (
        <div className="flex-1 relative overflow-hidden bg-background">
            <AnimatePresence mode="wait">
                {((status === 'synthesizing' || status === 'generating') || (!data && status !== 'idle')) ? (
                    <BuilderLoader
                        title={status === 'generating'
                            ? (refinementPrompt ? "Refining..." : "Remixing...")
                            : "Building..."
                        }
                        currentStep={progress}
                        totalSteps={100}
                    />
                ) : (
                    <MotionDiv key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
                        {isIframeLoading && (
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
                )}
            </AnimatePresence>
        </div>
    );
};

export default React.memo(BuilderViewport);
