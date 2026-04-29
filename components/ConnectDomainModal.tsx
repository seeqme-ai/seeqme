import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Copy, Check, Loader2, AlertTriangle, ShieldCheck, ArrowRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { domainService } from '../services/apiService';

interface ConnectDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: string;
  portfolioName: string;
  onSuccess: () => void;
}

const MotionDiv = motion.div as any;

const ConnectDomainModal: React.FC<ConnectDomainModalProps> = ({
  isOpen, onClose, portfolioId, portfolioName, onSuccess,
}) => {
  const [step, setStep] = useState<'input' | 'dns'>('input');
  const [domain, setDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdDomain, setCreatedDomain] = useState<any>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && createdDomain) {
      interval = setInterval(async () => {
        try {
          const result = await domainService.verifyDomain(createdDomain.id);
          if (result.verified) {
            toast.success('Domain connected and live!');
            setIsPolling(false);
            onSuccess();
            onClose();
            setStep('input');
            setDomain('');
            setCreatedDomain(null);
          }
        } catch { /* continue polling */ }
      }, 5000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isPolling, createdDomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    try {
      setIsSubmitting(true);
      const result = await domainService.createDomain(domain.toLowerCase().trim(), portfolioId);
      setCreatedDomain(result);
      setStep('dns');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Could not add domain. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to clipboard');
  };

  const isRoot = (d: string) => d.split('.').length === 2;
  const cnameHost = domain ? (isRoot(domain) ? '@' : domain.split('.')[0]) : '';
  const cnameValue = `portfolio-${portfolioId}.pages.dev`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center">
                      <Globe className="w-4 h-4 text-teal-600" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      {step === 'input' ? 'Connect a Domain' : 'DNS Configuration'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {step === 'input'
                      ? <>Linking to <span className="font-bold text-slate-700">{portfolioName}</span></>
                      : 'Add the records below in your domain registrar.'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors -mr-1 -mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-7 py-6">
              <AnimatePresence mode="wait">
                {step === 'input' ? (
                  <MotionDiv
                    key="input"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.18 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          Your Domain
                        </label>
                        <div className="relative flex items-center">
                          <Globe className="absolute left-4 w-4 h-4 text-slate-300 pointer-events-none" />
                          <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="yourdomain.com"
                            required
                            className="w-full bg-slate-50 border border-slate-200 focus:border-teal-400 focus:bg-white rounded-2xl py-3.5 pl-11 pr-5 text-base font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-100 rounded-2xl">
                        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-teal-800 leading-relaxed">
                          An SSL certificate is automatically provisioned across our global CDN — no extra steps needed.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || !domain.trim()}
                        className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-lg shadow-teal-600/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up…</>
                          : <>Continue <ArrowRight className="w-4 h-4" /></>}
                      </button>
                    </form>
                  </MotionDiv>
                ) : (
                  <MotionDiv
                    key="dns"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5"
                  >
                    {/* Warning */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-amber-800 leading-relaxed">
                        If you use Cloudflare, set the proxy status to <strong>DNS Only</strong> (grey cloud) to avoid routing conflicts.
                      </p>
                    </div>

                    {/* DNS record */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">DNS Record</p>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Type</p>
                            <p className="text-sm font-bold text-slate-900">CNAME</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Host / Name</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 font-mono">{cnameHost}</p>
                              <button
                                onClick={() => copy(cnameHost, 'host')}
                                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                              >
                                {copiedField === 'host'
                                  ? <Check className="w-3.5 h-3.5 text-teal-500" />
                                  : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Value / Points to</p>
                          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
                            <p className="text-xs font-mono font-semibold text-slate-700 truncate mr-3">{cnameValue}</p>
                            <button
                              onClick={() => copy(cnameValue, 'value')}
                              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                            >
                              {copiedField === 'value'
                                ? <Check className="w-3.5 h-3.5" />
                                : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Polling status */}
                    {isPolling && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                        </span>
                        <p className="text-xs font-medium text-slate-600">Checking DNS propagation — this can take a few minutes…</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => { setStep('input'); setIsPolling(false); }}
                        className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        onClick={() => setIsPolling(true)}
                        disabled={isPolling}
                        className="flex-1 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-lg shadow-teal-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isPolling
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                          : <><ShieldCheck className="w-4 h-4" /> Verify Connection</>}
                      </button>
                    </div>

                    <p className="text-center text-[11px] text-slate-400 font-medium">
                      DNS changes typically propagate within 5–30 minutes.
                    </p>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConnectDomainModal;
