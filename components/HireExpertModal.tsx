import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Code, Code2 } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { toast } from 'sonner';

interface HireExpertModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HireExpertModal: React.FC<HireExpertModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
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
        const slackWebhookUrl = import.meta.env.VITE_SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/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';

        if (!slackWebhookUrl) {
            console.error('Slack webhook URL not configured.');
            toast.error('System configuration error. Please try again later.');
            setIsSubmitting(false);
            return;
        }

        const payload = {
            text: `*🚨 New Expert Design Request!*`,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "New Custom Design Request"
                    }
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Name:*\n${fullName}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Email:*\n${email}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Auth Status:*\n${user ? '✅ Registered User' : '❌ Guest'}`
                        }
                    ]
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Request Details:*\n_${details || "No additional details provided."}_`
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `Received at ${new Date().toLocaleString()}`
                        }
                    ]
                }
            ]
        };

        try {
            await fetch(slackWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify(payload)
            });

            toast.success("Request sent! An expert will contact you shortly.");
            setDetails('');
            onClose();
        } catch (error) {
            console.error('Slack notification failed:', error);
            toast.error('Failed to send request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center min-h-screen px-4 font-inter">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 border border-slate-100 flex flex-col"
                    >
                        {/* Header */}
                        <div className="relative overflow-hidden bg-teal-600 p-8 text-white shrink-0">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <Code className="w-32 h-32 text-teal-400 rotate-12" />
                            </div>

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-teal-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-inner">
                                    <Code2 className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight mb-2 text-white">Hire an Expert Designer</h2>
                                <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-[85%]">
                                    Need a highly customized, sophisticated portfolio? Connect directly with our elite designers and developers.
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Jane Doe"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:ring-0 focus:border-teal-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="jane@example.com"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:ring-0 focus:border-teal-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Details (Optional)
                                    </label>
                                    <textarea
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        placeholder="Tell us what you're looking for..."
                                        rows={4}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:ring-0 focus:border-teal-500 transition-colors resize-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-sm font-medium text-slate-500 text-center mb-4">
                                    Someone will reach out to you shortly.
                                </p>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-teal-600/25 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Request
                                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
