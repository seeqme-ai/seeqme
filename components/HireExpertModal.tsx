import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { toast } from 'sonner';

interface HireExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MotionDiv = motion.div as any;

export const HireExpertModal: React.FC<HireExpertModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    setIsSubmitting(true);

    const webhookUrl = import.meta.env.VITE_SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/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';
    const payload = {
      text: `*New Expert Design Request*`,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: 'New Custom Design Request' } },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Name:*\n${fullName}` },
            { type: 'mrkdwn', text: `*Email:*\n${email}` },
            { type: 'mrkdwn', text: `*Auth:*\n${user ? '✅ Registered' : '❌ Guest'}` },
          ],
        },
        { type: 'section', text: { type: 'mrkdwn', text: `*Details:*\n_${details || 'None provided.'}_` } },
        { type: 'context', elements: [{ type: 'mrkdwn', text: `Received at ${new Date().toLocaleString()}` }] },
      ],
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: JSON.stringify(payload),
      });
      toast.success('Request received — our team will be in touch shortly.');
      setDetails('');
      onClose();
    } catch {
      toast.error('Could not send your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b border-slate-100 shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
                      <Zap className="w-4 h-4 text-violet-600" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Work with an expert</h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Need something truly bespoke? Our designers will handle every detail.
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-400 focus:bg-white rounded-2xl py-3.5 px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-400 focus:bg-white rounded-2xl py-3.5 px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  What are you looking for? <span className="normal-case font-medium text-slate-300">(optional)</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe your vision, industry, style preferences, or anything else that matters to you…"
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-400 focus:bg-white rounded-2xl py-3.5 px-5 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              <p className="text-xs text-slate-400 font-medium text-center pt-1">
                A member of our team will reach out within 24 hours.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-lg shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : <><Send className="w-4 h-4" /> Send Request</>}
              </button>
            </form>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};
