import React from 'react';
import { motion } from 'framer-motion';

interface BuilderLoaderProps {
    title: string;
    currentStep: number;
    totalSteps: number;
    zIndex?: number;
}

const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;

const BuilderLoader: React.FC<BuilderLoaderProps> = ({ title, currentStep, totalSteps, zIndex = 9999 }) => {
    const progressPercentage = Math.round(((currentStep + 1) / totalSteps) * 100);

    return (
        <MotionDiv
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm px-4 sm:px-6`}
            style={{ zIndex }}
        >
            <div className="w-full max-w-xl md:max-w-2xl space-y-12 md:space-y-16">
                <div className="flex flex-col items-center">
                    <div className="relative mb-8 md:mb-12">
                        {/* Pulsating dot animation with progress percentage */}
                        <div className="relative flex h-20 w-20 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping"></span>
                            <MotionSpan
                                className="relative inline-flex rounded-full h-20 w-20 bg-gradient-to-br from-teal-400 to-teal-600 items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/30"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MotionSpan
                                    key={progressPercentage}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {progressPercentage}%
                                </MotionSpan>
                            </MotionSpan>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full max-w-xs mb-6">
                        <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                            <MotionDiv
                                className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                        </div>
                    </div>

                    <MotionSpan
                        key={title}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-lg font-medium tracking-tight text-center leading-tight text-muted-foreground"
                    >
                        {title}
                    </MotionSpan>
                </div>
            </div>
        </MotionDiv>
    );
};

export default BuilderLoader;
