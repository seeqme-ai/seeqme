import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Zap, ShieldCheck, ArrowRight, X, Globe } from "lucide-react";

interface PaymentRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const MotionDiv = motion.div as any;

const PERKS = [
  {
    icon: ShieldCheck,
    title: 'Personal subdomain',
    desc: 'Your own yourname.seeqme.com — secured with SSL and deployed globally.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: Globe,
    title: 'Global CDN delivery',
    desc: 'Served from edge nodes worldwide so your portfolio loads fast, everywhere.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'Search visibility',
    desc: 'Google-indexed from day one so recruiters and clients can find you.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

const PaymentRequiredModal: React.FC<PaymentRequiredModalProps> = ({
  isOpen, onClose, onProceed,
}) => {
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
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Your portfolio is ready</h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Unlock publishing to make it live and visible to the world.
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
              {/* Perks */}
              <div className="space-y-3">
                {PERKS.map(({ icon: Icon, title, desc, color, bg }) => (
                  <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-0.5">{title}</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-400 font-medium text-center">
                Your design is saved. Publishing is the only remaining step.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
                >
                  Later
                </button>
                <button
                  onClick={onProceed}
                  className="flex-1 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-lg shadow-teal-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Go Live <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentRequiredModal;
