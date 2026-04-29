import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Github, Shield, Zap, Clock, CheckCircle2, AlertCircle, Loader2, Rocket } from 'lucide-react';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (subdomain: string) => void;
  chosenSubdomain: string;
  setChosenSubdomain: (val: string) => void;
  selectedDomainId: string;
  availableDomains: any[];
  isPublishing?: boolean;
}

const MotionDiv = motion.div as any;

type ValidationState = { ok: boolean; message: string } | null;

const validateSubdomain = (value: string): ValidationState => {
  if (!value) return null;
  if (value.length < 3) return { ok: false, message: 'Minimum 3 characters required' };
  if (value.length > 30) return { ok: false, message: 'Maximum 30 characters' };
  if (!/^[a-z]/.test(value)) return { ok: false, message: 'Must begin with a letter' };
  if (!/^[a-z0-9-]+$/.test(value)) return { ok: false, message: 'Only lowercase letters, numbers, and hyphens' };
  if (value.endsWith('-')) return { ok: false, message: 'Cannot end with a hyphen' };
  if (value.includes('--')) return { ok: false, message: 'No consecutive hyphens allowed' };
  return { ok: true, message: `${value}.seeqme.com is available` };
};

const WHAT_HAPPENS = [
  { icon: Github, label: 'Files pushed to a private GitHub repo' },
  { icon: Globe, label: "Deployed across Cloudflare's global CDN" },
  { icon: Shield, label: 'SSL certificate auto-provisioned' },
  { icon: Zap, label: 'Your URL goes live in ~2 minutes' },
];

const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isOpen, onClose, onConfirm,
  chosenSubdomain, setChosenSubdomain,
  selectedDomainId, availableDomains,
  isPublishing = false,
}) => {
  const [validation, setValidation] = useState<ValidationState>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setChosenSubdomain(raw);
    setValidation(validateSubdomain(raw));
  }, [setChosenSubdomain]);

  useEffect(() => {
    if (chosenSubdomain) setValidation(validateSubdomain(chosenSubdomain));
  }, []);

  const canDeploy = selectedDomainId === 'subdomain'
    ? validation?.ok === true
    : !!availableDomains.find(d => d.id === selectedDomainId);

  const displayDomain = selectedDomainId === 'subdomain'
    ? `${chosenSubdomain || 'your-name'}.seeqme.com`
    : availableDomains.find(d => d.id === selectedDomainId)?.domain ?? '';

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
                      <Rocket className="w-4 h-4 text-teal-600" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Publish Portfolio</h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Your site will be live, indexed, and SSL-secured.
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

            <div className="px-7 py-6 space-y-5">
              {/* Subdomain input */}
              {selectedDomainId === 'subdomain' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Your Portfolio URL
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={chosenSubdomain}
                      onChange={handleChange}
                      disabled={isPublishing}
                      placeholder="your-name"
                      maxLength={30}
                      className={`w-full bg-slate-50 border rounded-2xl py-3.5 pl-5 pr-[120px] text-base font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white transition-all ${
                        validation === null
                          ? 'border-slate-200 focus:border-teal-400'
                          : validation.ok
                          ? 'border-emerald-400 bg-emerald-50/50 focus:border-emerald-500'
                          : 'border-red-300 bg-red-50/50 focus:border-red-400'
                      }`}
                    />
                    <span className="absolute right-4 text-xs text-slate-400 font-semibold pointer-events-none">
                      .seeqme.com
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {validation && (
                      <MotionDiv
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={`flex items-center gap-2 text-xs font-semibold ${validation.ok ? 'text-emerald-600' : 'text-red-500'}`}
                      >
                        {validation.ok
                          ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        {validation.message}
                      </MotionDiv>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Custom domain display */}
              {availableDomains.length > 0 && selectedDomainId !== 'subdomain' && (
                <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-100 rounded-2xl">
                  <Globe className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-0.5">Custom Domain</p>
                    <p className="text-sm font-bold text-teal-900">{displayDomain}</p>
                  </div>
                </div>
              )}

              {/* Live preview badge */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                </span>
                <p className="text-sm text-slate-600 font-medium">
                  Will publish at{' '}
                  <span className="font-bold text-slate-900">{displayDomain || 'your-name.seeqme.com'}</span>
                </p>
              </div>

              {/* What happens */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">What happens next</p>
                <div className="grid grid-cols-2 gap-2">
                  {WHAT_HAPPENS.map(({ icon: Icon, label }, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <Icon className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-600 font-medium leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  Typically live within 2–3 minutes
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  disabled={isPublishing}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(chosenSubdomain)}
                  disabled={!canDeploy || isPublishing}
                  className="flex-1 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-lg shadow-teal-600/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPublishing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
                  ) : (
                    <><Rocket className="w-4 h-4" /> Publish Now</>
                  )}
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
