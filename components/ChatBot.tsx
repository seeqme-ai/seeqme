import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Send, Paperclip, X, Shield,
    Loader2, FileText, Maximize2, Minimize2,
    ChevronDown,
    Code2
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { ref, push, onValue, serverTimestamp, set, query, limitToLast } from 'firebase/database';
import { useAuth } from '@/context/auth-context';
import { cloudinaryService } from '@/services/cloudinaryService';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
    isAdmin?: boolean;
}

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastReadRef = useRef<number>(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };


    useEffect(() => {
        if (!user?.id) return;
        const stored = Number(localStorage.getItem(`chat_last_read_${user.id}`) || 0);
        lastReadRef.current = stored;
    }, [user?.id]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            const latest = messages[messages.length - 1]?.timestamp || Date.now();
            if (user?.id) {
                localStorage.setItem(`chat_last_read_${user.id}`, String(latest));
                lastReadRef.current = latest;
            }
            setUnreadCount(0);
        }
    }, [messages, isOpen, user?.id]);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const chatRef = ref(db, `chats/${user.id}/messages`);
        const q = query(chatRef, limitToLast(50));

        const unsubscribe = onValue(q, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messageList = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id, ...val,
                })) as Message[];

                const sortedMessages = messageList.sort((a, b) => a.timestamp - b.timestamp);
                setMessages(sortedMessages);
                if (!isOpen) {
                    const unread = sortedMessages.filter((msg) => msg.isAdmin && msg.timestamp > lastReadRef.current).length;
                    setUnreadCount(unread);
                }
            }
        });

        return () => unsubscribe();
    }, [isAuthenticated, user?.id, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!message.trim() || !user?.id) return;

        const textPayload = message.trim();
        setMessage('');

        try {
            const chatRef = ref(db, `chats/${user.id}/messages`);
            await push(chatRef, {
                senderId: user.id,
                senderName: user.fullName,
                text: textPayload,
                timestamp: serverTimestamp(),
                isAdmin: false,
            });

            // Update activity for admin view
            const summaryRef = ref(db, `chat_summaries/${user.id}`);
            await set(summaryRef, {
                userId: user.id,
                userName: user.fullName,
                lastMessage: textPayload,
                lastTimestamp: serverTimestamp(),
                unreadCount: 0,
            });

            const slackWebhookUrl = import.meta.env.VITE_SLACK_WEBHOOK_URL;
            if (slackWebhookUrl) {
                fetch(slackWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: JSON.stringify({
                        text: `*New Support Message from ${user.fullName}*`,
                        blocks: [
                            { type: "section", text: { type: "mrkdwn", text: `*${user.fullName}:*\n${textPayload}` } }
                        ]
                    })
                }).catch(console.error);
            }
        } catch (err: any) {
            toast.error(`Error: ${err.message}`);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;
        setIsUploading(true);
        try {
            const result = await cloudinaryService.uploadFile(file);
            const chatRef = ref(db, `chats/${user.id}/messages`);
            await push(chatRef, {
                senderId: user.id,
                senderName: user.fullName,
                text: `Sent an attachment: ${file.name}`,
                fileUrl: result.secureUrl,
                fileType: file.type,
                fileName: file.name,
                timestamp: serverTimestamp(),
                isAdmin: false,
            });
            toast.success('File attached successfully');
        } catch (err: any) {
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const hiddenRoutes = [
        '/builder',
        '/auth',
        '/settings',
        '/reset-password',
        '/dashboard/settings',
        '/admin',
    ];

    const shouldHide = hiddenRoutes.some((route) => location.pathname.startsWith(route));

    if (!isAuthenticated || shouldHide) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[10000] flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            width: isExpanded ? 'min(800px, calc(100vw - 3rem))' : 'min(400px, calc(100vw - 3rem))'
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto mb-4 flex flex-col bg-white rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden origin-bottom-right"
                        style={{ height: '70vh', maxHeight: '700px' }}
                    >
                        {/* Header */}
                        <div className="p-5 bg-teal-500 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                                    <img src='/seeqme-logo-black.png' className="w-7 h-7 object-contain grayscale brightness-200" alt="Logo" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm tracking-tight">Support</h3>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                            <span className="text-[10px] font-bold opacity-90 uppercase tracking-widest">Active Now</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {setIsOpen(false);window.dispatchEvent(new Event('open-hire-expert'))}}
                                    className="bg-white text-teal-600 px-3 py-1 text-[10px] font-bold uppercase rounded-lg hover:bg-teal-50 transition-colors flex items-center gap-1 shadow-sm"
                                >
                                    <Code2 className="w-3 h-3" /> Hire Expert
                                </button>
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                                >
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 no-scrollbar">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale">
                                    <MessageCircle className="w-12 h-12 mb-2" />
                                    <p className="text-sm font-medium">No messages yet</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`
                                            max-w-[85%] px-4 py-2.5 text-sm shadow-sm
                                            ${msg.isAdmin
                                                ? 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-none'
                                                : 'bg-teal-500 text-white rounded-2xl rounded-tr-none shadow-teal-500/10'}
                                        `}>
                                            {msg.isAdmin && (
                                                <p className="text-[9px] font-black uppercase tracking-tighter mb-1 opacity-40 flex items-center gap-1">
                                                    <Shield className="w-2 h-2" /> Kolade
                                                </p>
                                            )}
                                            {msg.fileUrl ? (
                                                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                                                    className={`flex items-center gap-3 p-2 rounded-xl mb-1 transition-all ${msg.isAdmin ? 'bg-slate-50' : 'bg-white/10'}`}>
                                                    {msg.fileType?.startsWith('image/') ? (
                                                        <img src={msg.fileUrl} className="w-12 h-12 rounded-lg object-cover" />
                                                    ) : (
                                                        <FileText className="w-5 h-5" />
                                                    )}
                                                    <p className="text-[10px] font-bold truncate max-w-[120px]">{msg.fileName || 'Attachment'}</p>
                                                </a>
                                            ) : (
                                                <p className="leading-relaxed">{msg.text}</p>
                                            )}
                                            <p className={`text-[9px] mt-1 opacity-50 ${msg.isAdmin ? 'text-left' : 'text-right'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                            <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/10 transition-all">
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx" />
                                <button
                                    type="button"
                                    disabled={isUploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-slate-400 hover:text-teal-600 transition-colors"
                                >
                                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent outline-none border-none text-sm focus:ring-0 placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isUploading}
                                    className="p-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-30 active:scale-90"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto w-16 h-16 bg-teal-500 text-white rounded-[1.5rem] shadow-[0_15px_35px_rgba(20,184,166,0.4)] flex items-center justify-center hover:bg-teal-600 transition-all transform hover:-translate-y-1 active:scale-95 group relative"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                            <X className="w-7 h-7" />
                        </motion.div>
                    ) : (
                        <motion.div key="msg" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                            <MessageCircle className="w-8 h-8 fill-current" />

                            {/* Pulse Glow Effect */}
                            <div className="absolute inset-0 bg-teal-400 rounded-[1.5rem] animate-ping opacity-20" />

                            {/* Unread Badge */}
                            {unreadCount > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 min-w-[24px] h-[24px] px-1.5 bg-rose-500 text-white text-[11px] font-bold rounded-full border-4 border-white flex items-center justify-center shadow-lg"
                                >
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </div>
    );
};

export default ChatBot;
