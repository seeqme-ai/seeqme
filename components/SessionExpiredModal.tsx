import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MotionDiv = motion.div as any;

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignIn = () => {
    logout();
    onClose();
    navigate('/auth');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden text-center"
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400" />

            <div className="px-7 pt-8 pb-7 space-y-5">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-rose-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Session expired</h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  For your security, you've been signed out after a period of inactivity. Sign in again to pick up where you left off.
                </p>
              </div>

              <button
                onClick={handleSignIn}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-lg shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Sign in again <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SessionExpiredModal;
