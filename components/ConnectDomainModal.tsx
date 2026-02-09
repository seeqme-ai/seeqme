import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Copy, Check, Loader, AlertCircle, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { domainService } from '../services/apiService';

interface ConnectDomainModalProps {
    isOpen: boolean;
    onClose: () => void;
    portfolioId: string;
    portfolioName: string;
    onSuccess: () => void;
}

const ConnectDomainModal: React.FC<ConnectDomainModalProps> = ({ isOpen, onClose, portfolioId, portfolioName, onSuccess }) => {
    const [step, setStep] = useState<'input' | 'dns'>('input');
    const [domain, setDomain] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdDomain, setCreatedDomain] = useState<any>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        if (isPolling && createdDomain) {
            pollInterval = setInterval(async () => {
                try {
                    const result = await domainService.verifyDomain(createdDomain.id);
                    if (result.verified) {
                        toast.success('Domain verified and live!');
                        setIsPolling(false);
                        handleSuccess();
                    }
                } catch (error) {
                    // Silently continue
                }
            }, 5000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [isPolling, createdDomain]);

    const handleSuccess = () => {
        onSuccess();
        onClose();
        // Reset state
        setStep('input');
        setDomain('');
        setCreatedDomain(null);
    };

    const handleInitialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain) return;

        try {
            setIsSubmitting(true);
            const result = await domainService.createDomain(domain.toLowerCase(), portfolioId);
            setCreatedDomain(result);
            setStep('dns');
            toast.success('Domain node initialized');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to initialize domain');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
        toast.success('Protocol copied');
    };

    const isRootDomain = (d: string) => d.split('.').length === 2;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0  backdrop-blur-xl"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col mx-auto"
                >
                    {/* Header */}
                    <div className="p-2 bg-teal-600 text-white flex justify-between items-start relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32" />

                        <div className="relative z-10 space-y-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full border border-white/20 w-fit">
                                <Globe className="w-3 h-3 text-white" />
                                <span className="text-[9px] font-black uppercase  text-white">Domain Setup</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black ">
                                {step === 'input' ? 'Connect Domain' : 'DNS Settings'}
                            </h2>
                            <p className="text-slate-400 text-[10px] md:text-xs font-medium">Linking to <span className="text-white font-bold">{portfolioName}</span></p>
                        </div>

                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/80 transition-all relative z-10">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-8 flex-1 overflow-y-auto max-h-[70vh] no-scrollbar bg-white">
                        {step === 'input' ? (
                            <form onSubmit={handleInitialSubmit} className="space-y-6 md:space-y-8">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-bold uppercase  text-slate-400 ml-1">Enter Domain</Label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <Input
                                                placeholder="e.g. yourdomain.com"
                                                value={domain}
                                                onChange={(e) => setDomain(e.target.value)}
                                                className="pl-14 bg-white border-slate-200 focus:border-teal-500 rounded-xl h-14 md:h-16 font-bold text-base transition-all shadow-sm placeholder:text-slate-300 text-slate-900"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 p-2 md:p-6 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                                        <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0" />
                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-600 leading-relaxed">
                                            We'll automatically provision an SSL certificate for your domain through our global edge network.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !domain}
                                    className="w-full h-14 md:h-16 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs md:text-sm uppercase  rounded-xl shadow-lg shadow-teal-500/10 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : <>Connect Domain <ArrowRight className="w-4 h-4 ml-2" /></>}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-8 md:space-y-10">
                                <div className="p-5 md:p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <p className="text-[11px] md:text-sm font-bold text-slate-700 leading-relaxed">
                                        Add these records to your DNS provider.
                                        <span className="block text-teal-600 mt-1">IMPORTANT: If you use Cloudflare, set "Proxy Status" to "DNS Only" (Gray Cloud) to avoid Error 1014.</span>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold uppercase  text-slate-400 ml-1">DNS Record</Label>
                                    <div className="bg-slate-50 rounded-2xl p-6 md:p-8 space-y-6">
                                        <div className="grid grid-cols-2 gap-8 md:gap-12">
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase ">Type</p>
                                                <p className="text-lg font-bold text-slate-900">CNAME</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase ">Host</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-lg font-bold text-slate-900 truncate max-w-[80px] md:max-w-none">{isRootDomain(domain) ? '@' : domain.split('.')[0]}</p>
                                                    <button onClick={() => copyToClipboard(isRootDomain(domain) ? '@' : domain.split('.')[0], 'dns-host')} className="p-2 text-teal-400 hover:text-teal-300">
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-200 space-y-3">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase ">Value</p>
                                            <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                                                <p className="text-[11px] md:text-sm font-mono font-bold text-slate-600 truncate mr-4">
                                                    portfolio-{portfolioId}.pages.dev
                                                </p>
                                                <button
                                                    onClick={() => copyToClipboard(`portfolio-${portfolioId}.pages.dev`, 'dns-value')}
                                                    className="p-2 bg-teal-500 text-white rounded-lg shadow-md shadow-teal-500/10 active:scale-95"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex p-2 flex-col md:flex-row gap-4">
                                    <Button
                                        onClick={() => setIsPolling(true)}
                                        disabled={isPolling}
                                        className="flex-1 h-8 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase  rounded-xl shadow-lg shadow-teal-500/10 transition-all active:scale-95 order-1 md:order-2"
                                    >
                                        {isPolling ? <><Loader className="w-4 h-4 animate-spin mr-2" /> Verifying...</> : 'Verify Connection'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        className="px-4 h-8 border-slate-200 text-slate-500 font-bold text-xs uppercase  rounded-xl hover:bg-slate-50 transition-all order-2 md:order-1"
                                    >
                                        Skip for now
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Visual blobs */}
                    <div className="absolute inset-0 -z-10 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/5 blur-[100px] animate-pulse" />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConnectDomainModal;
