import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, ExternalLink, Loader, XCircle, X, Globe, Share2, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SuccessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  domain?: string;
  status: 'deploying' | 'completed' | 'failed';
  logs?: string[];
}

const MotionDiv = motion.div as any;

const DEPLOY_STEPS = [
  'Pushing files to GitHub…',
  'Provisioning CDN edge nodes…',
  'Installing SSL certificate…',
  'Propagating globally…',
  'Going live…',
];

const DeployingView: React.FC<{ logs: string[] }> = ({ logs }) => {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStepIdx(i => Math.min(i + 1, DEPLOY_STEPS.length - 1)), 2800);
    return () => clearInterval(t);
  }, []);

  const currentMessage = logs.length > 0 ? logs[logs.length - 1] : DEPLOY_STEPS[stepIdx];

  return (
    <div className="flex flex-col items-center text-center py-4">
      {/* Animated spinner ring */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Globe className="w-7 h-7 text-teal-500" />
        </div>
      </div>

      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
        Deploying your portfolio…
      </h2>
      <p className="text-sm text-slate-500 font-medium mb-8">
        This typically takes 2–3 minutes. Sit tight — your site is on its way.
      </p>

      {/* Step progress */}
      <div className="w-full max-w-sm space-y-2 mb-6">
        {DEPLOY_STEPS.map((step, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${i <= stepIdx ? 'bg-teal-50' : 'bg-slate-50'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              i < stepIdx ? 'bg-teal-500' : i === stepIdx ? 'border-2 border-teal-500' : 'border-2 border-slate-200'
            }`}>
              {i < stepIdx && <Check className="w-3 h-3 text-white" />}
              {i === stepIdx && <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />}
            </div>
            <span className={`text-xs font-semibold ${i <= stepIdx ? 'text-slate-700' : 'text-slate-400'}`}>
              {i < stepIdx ? step.replace('…', ' ✓') : step}
            </span>
          </div>
        ))}
      </div>

      {/* Live log */}
      {logs.length > 0 && (
        <div className="w-full max-w-sm px-4 py-3 bg-slate-900 rounded-2xl text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Live output</p>
          <p className="text-xs text-teal-400 font-mono leading-relaxed">{currentMessage}</p>
        </div>
      )}
    </div>
  );
};

const SuccessView: React.FC<{ url: string; onShare: () => void }> = ({ url, onShare }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('URL copied to clipboard');
  };

  return (
    <div className="flex flex-col items-center text-center py-4">
      {/* Success badge */}
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-teal-500/30">
          <Check className="w-9 h-9 text-white" strokeWidth={3} />
        </div>
        <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-xl animate-pulse" />
      </div>

      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
        Your portfolio is live.
      </h2>
      <p className="text-sm text-slate-500 font-medium mb-8 max-w-sm">
        It's live, indexed, and ready to make an impression. Share it with the world.
      </p>

      {/* URL display */}
      <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-2xl p-1 mb-8">
        <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-100">
          <Globe className="w-4 h-4 text-teal-500 shrink-0" />
          <span className="text-sm font-semibold text-slate-800 truncate flex-1 text-left">{url}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700 shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-center font-medium text-slate-400 mt-2 mb-1">
          🌐 SSL secured · 🚀 Deployed globally
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-sm font-bold text-slate-700 transition-all"
        >
          <Share2 className="w-4 h-4" /> Share
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-lg shadow-teal-600/20 transition-all"
        >
          <ExternalLink className="w-4 h-4" /> Open Site
        </a>
      </div>
    </div>
  );
};

const FailedView: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="flex flex-col items-center text-center py-4">
    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-8">
      <AlertTriangle className="w-9 h-9 text-red-500" />
    </div>
    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Deployment failed</h2>
    <p className="text-sm text-slate-500 font-medium mb-8 max-w-sm">
      Something went wrong during deployment. Check your internet connection and try again, or contact support.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all"
      >
        <RefreshCw className="w-4 h-4" /> Try again
      </button>
    )}
  </div>
);

const SuccessDrawer: React.FC<SuccessDrawerProps> = ({ isOpen, onClose, url, domain, status, logs = [] }) => {
  const finalUrl = url || (domain ? `https://${domain}` : '');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Portfolio', text: 'Check out my portfolio — built with SeeqMe AI!', url: finalUrl });
      } catch { /* user dismissed */ }
    } else {
      navigator.clipboard.writeText(finalUrl);
      toast.success('URL copied to clipboard');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={status !== 'deploying' ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999]"
          />

          {/* Drawer */}
          <MotionDiv
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-[10000] bg-white rounded-t-[2rem] border-t border-slate-100 shadow-2xl shadow-slate-900/30 px-6 pt-5 pb-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="max-w-md mx-auto">
              {status === 'deploying' && <DeployingView logs={logs} />}
              {status === 'completed' && <SuccessView url={finalUrl} onShare={handleShare} />}
              {status === 'failed' && <FailedView />}
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};

export default SuccessDrawer;
