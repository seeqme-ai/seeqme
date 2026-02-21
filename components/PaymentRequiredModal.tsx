import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Zap, ShieldCheck, ArrowRight, X } from "lucide-react";

interface PaymentRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const PaymentRequiredModal: React.FC<PaymentRequiredModalProps> = ({
  isOpen,
  onClose,
  onProceed,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-border">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center mb-3">
              <Rocket className="w-5 h-5 text-teal-500" />
            </div>

            <h2 className="text-xl font-semibold">Your Portfolio Is Ready</h2>
            <p className="text-sm text-muted-foreground mt-1">
              One final step to make it live and visible to the world.
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 text-sm">
            <p className="text-muted-foreground">
              Your payment activates:
            </p>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Secure Live URL</p>
                <p className="text-muted-foreground text-xs">
                  We provision your personal subdomain and global CDN hosting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Search Visibility</p>
                <p className="text-muted-foreground text-xs">
                  Google indexing & optimization so recruiters can find you.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Your work is already saved. This simply unlocks publishing.
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition"
            >
              Later
            </button>

            <button
              onClick={onProceed}
              className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              Go Live
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentRequiredModal;