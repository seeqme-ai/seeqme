import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS } from '../constants';
import { Activity, Check, Copy, ExternalLink, Loader, XCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import Confetti from 'react-confetti';

interface SuccessDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    domain?: string;
    status: 'deploying' | 'completed' | 'failed';
    logs?: string[];
}

const MotionDiv = motion.div as any;

const DynamicLoadingText = () => {
    const messages = [
        "Bundling artifacts...",
        "Building assets...",
        "Optimizing images...",
        "Deploying to Edge...",
        "Verifying global propagation...",
        "Finalizing setup..."
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % messages.length);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    return (
        <span className="inline-block min-w-[200px]">
            {messages[index]}
        </span>
    );
};

const SuccessDrawer: React.FC<SuccessDrawerProps> = ({ isOpen, onClose, url, domain, status, logs = [] }) => {
    const isSuccess = status === 'completed';

    const handleShare = async () => {
        const finalUrl = url || `https://${domain}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Professional Portfolio',
                    text: 'Check out my new portfolio built with Seeqme AI!',
                    url: finalUrl,
                });
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            navigator.clipboard.writeText(finalUrl);
            toast.success('URL copied to clipboard');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Confetti Rain */}
                    {isSuccess && (
                        <div className="fixed inset-0 z-[10001] pointer-events-none">
                            <Confetti
                                width={window.innerWidth}
                                height={window.innerHeight}
                                recycle={true}
                                numberOfPieces={200}
                                gravity={0.2}
                            />
                        </div>
                    )}

                    {/* Backdrop */}
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={isSuccess ? onClose : undefined}
                        className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999]"
                    />

                    {/* Drawer */}
                    <MotionDiv
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white/95  backdrop-blur-3xl border-t border-border rounded-t-3xl z-[10000] p-8 pb-10 shadow-[0_-20px_50px_rgba(20,184,166,0.15)]"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground group"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
                            <div className="w-12 h-1.5 bg-white/10 rounded-full mb-8" />

                            {status === 'deploying' ? (
                                <div className="flex items-center justify-center mb-6">
                                    <Loader className="w-6 h-6 text-teal-500 animate-spin" />
                                </div>
                            ) : isSuccess ? (
                                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                                    <Check className="w-8 h-8 text-slate-950" />
                                </div>
                            ) : ( // status === 'failed'
                                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                    <XCircle className="w-8 h-8 text-white" />
                                </div>
                            )}

                            <h2 className="text-2xl font-black tracking-tight mb-2 text-foreground">
                                {status === 'deploying' ? (
                                    logs.length > 0 ? logs[logs.length - 1] : <DynamicLoadingText />
                                ) : isSuccess ? 'Congratulations! Your site is live.' : 'Deployment Failed'}
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium mb-10">
                                {status === 'deploying' ? 'Please wait while we set everything up.' : isSuccess ? 'Your professional portfolio is now accessible to the world!' : 'Something went wrong during the deployment process.'}
                            </p>

                            {/* Live Dynamic Status */}
                            {status === 'deploying' && logs.length > 0 && (
                                <MotionDiv
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-8 px-5 py-3 rounded-xl bg-teal-500/5 border border-teal-500/10 w-full"
                                >
                                    <div className="flex items-center gap-2 text-teal-600 ">
                                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                                        <span className="text-[10px] font-semibold uppercase tracking-wider">Current Status:</span>
                                    </div>
                                    <p className="mt-2 text-sm font-medium text-foreground tracking-tight text-left">
                                        {logs[logs.length - 1]}
                                    </p>
                                </MotionDiv>
                            )}

                            {isSuccess ? (
                                <div className="w-full bg-muted/30 border border-border rounded-2xl p-6 mb-8 flex flex-col gap-4">
                                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                        <span>Production URL</span>
                                        <span className="text-teal-600 ">Live & Secure</span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border">
                                        <ICONS.Globe className="w-4 h-4 text-teal-500 shrink-0" />
                                        <span className="text-sm font-semibold text-foreground truncate flex-1 text-left">
                                            {url || `https://${domain}`}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const finalUrl = url || `https://${domain}`;
                                                navigator.clipboard.writeText(finalUrl);
                                                toast.success('URL copied to clipboard');
                                            }}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-10 text-center">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Your site will be live at:
                                    </p>
                                    <p className="text-sm font-bold text-teal-600  mt-1">
                                        https://{domain}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={handleShare}
                                    className={`flex-1 py-3.5 rounded-full text-sm font-semibold border border-border hover:bg-muted transition-all text-foreground flex items-center justify-center gap-2 ${!isSuccess ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <ICONS.Share className="w-4 h-4" />
                                    Share Site
                                </button>
                                <a
                                    href={url || `https://${domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex-1 py-3.5 rounded-full bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-all shadow-md flex items-center justify-center gap-2 ${status === 'deploying' ? 'opacity-20 pointer-events-none' : ''}`}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Site
                                </a>
                            </div>
                        </div>
                    </MotionDiv>
                </>
            )}
        </AnimatePresence>
    );
};

export default SuccessDrawer;
