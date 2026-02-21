import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS } from '@/constants';

interface DeploymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (subdomain: string) => void;
    chosenSubdomain: string;
    setChosenSubdomain: (val: string) => void;
    selectedDomainId: string;
    availableDomains: any[];
}

const MotionDiv = motion.div as any;

const DeploymentModal: React.FC<DeploymentModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    chosenSubdomain,
    setChosenSubdomain,
    selectedDomainId,
    availableDomains,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-3xl flex items-center justify-center p-6 text-foreground">
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-xl bg-white border border-border rounded-3xl p-8 md:p-10 shadow-0"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight mb-1">Launch to Production</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground mr-[-8px] mt-[-8px]"
                            >
                                <ICONS.X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                {selectedDomainId === 'subdomain' && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-muted-foreground ml-1">Configure Subdomain</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={chosenSubdomain}
                                                onChange={(e) => setChosenSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                                                className="w-full bg-muted/30 border border-border rounded-xl py-3.5 px-5 text-base font-semibold text-foreground focus:border-teal-500 focus:bg-background outline-none transition-all shadow-sm"
                                                placeholder="your-name"
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-semibold pointer-events-none text-sm">
                                                .seeqme.com
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center gap-2 px-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                    <p className="text-[xs] text-muted-foreground font-medium">
                                        <span className="text-teal-600 font-semibold">
                                            {selectedDomainId === 'subdomain'
                                                ? `${chosenSubdomain || '...'}.seeqme.com`
                                                : availableDomains.find(d => d.id === selectedDomainId)?.domain
                                            }
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/10 flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                                    <ICONS.Globe className="w-4 h-4 text-teal-600 " />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Global Distribution</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Your site will be optimized and deployed to our global edge network for 99.9% uptime.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-full text-sm font-semibold border border-border hover:bg-muted transition-all"
                                >
                                    Not Now
                                </button>
                                <button
                                    onClick={() => onConfirm(chosenSubdomain)}
                                    disabled={selectedDomainId === 'subdomain' && !chosenSubdomain}
                                    className="flex-1 py-4 rounded-full bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-all shadow-xl disabled:opacity-50"
                                >
                                    Deploy Now
                                </button>
                            </div>
                        </div>
                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    );
};

export default React.memo(DeploymentModal);
