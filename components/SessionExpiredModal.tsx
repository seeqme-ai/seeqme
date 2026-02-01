import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

interface SessionExpiredModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogin = () => {
        logout();
        onClose();
        navigate('/auth');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-white  border border-slate-200  p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />

                        <div className="mx-auto w-16 h-16 bg-rose-50  rounded-2xl flex items-center justify-center mb-6 text-rose-500">
                            <Lock className="w-8 h-8" />
                        </div>

                        <h2 className="text-xl font-display font-bold text-slate-900 mb-2">
                            Session Expired
                        </h2>

                        <p className="text-sm text-slate-500  mb-8 leading-relaxed">
                            Your security session has timed out. Please sign in again to continue working on your portfolio.
                        </p>

                        <Button
                            onClick={handleLogin}
                            className="w-full bg-slate-900  text-white  hover:bg-slate-800 h-11 rounded-xl font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Sign In Again
                        </Button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SessionExpiredModal;
