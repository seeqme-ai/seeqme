import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Paperclip, X, User, Shield, Loader2, FileText, Image as ImageIcon, BotIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { ref, push, onValue, serverTimestamp, set, query, limitToLast } from 'firebase/database';
import { useAuth } from '@/context/auth-context';
import { cloudinaryService } from '@/services/cloudinaryService';
import { toast } from 'sonner';

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
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // Firebase real-time listener
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const chatRef = ref(db, `chats/${user.id}/messages`);
        const q = query(chatRef, limitToLast(50));

        const unsubscribe = onValue(q, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messageList = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val,
                })) as Message[];
                setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
            }
        });

        return () => unsubscribe();
    }, [isAuthenticated, user?.id]);

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

            // Update last activity for admin view
            const summaryRef = ref(db, `chat_summaries/${user.id}`);
            await set(summaryRef, {
                userId: user.id,
                userName: user.fullName,
                lastMessage: textPayload,
                lastTimestamp: serverTimestamp(),
                unreadCount: 0,
            });
        } catch (err: any) {
            console.error('Failed to send message:', err);
            toast.error(`Relay Error: ${err.message || 'Unknown'}`);
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
            toast.error(err.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="fixed bottom-2 right-6 z-[9999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-2 w-[90vw] sm:w-[380px] h-[500px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-teal-500 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <BotIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-tight">Support</h3>
                                    <p className="text-[10px] opacity-80 font-medium uppercase tracking-widest">Online</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/50">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
                                        <MessageCircle className="w-8 h-8 text-teal-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-800">Start a conversation</p>
                                        <p className="text-xs text-slate-500">Our admin team is ready to help you with your portfolio.</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'} group`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.isAdmin
                                                ? 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none'
                                                : 'bg-teal-500 text-white shadow-md shadow-teal-500/10 rounded-tr-none'
                                                }`}
                                        >
                                            {msg.isAdmin && (
                                                <p className="text-[9px] font-black uppercase tracking-tighter mb-1 opacity-50 flex items-center gap-1">
                                                    <Shield className="w-2 h-2" /> Admin Response
                                                </p>
                                            )}

                                            {msg.fileUrl ? (
                                                <a
                                                    href={msg.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center gap-2 p-2 rounded-lg mb-1 transition-all ${msg.isAdmin ? 'bg-slate-50 hover:bg-slate-100 text-teal-600' : 'bg-white/10 hover:bg-white/20 text-white'
                                                        }`}
                                                >
                                                    {msg.fileType?.startsWith('image/') ? (
                                                        <img src={msg.fileUrl} alt="attachment" className="w-12 h-12 rounded object-cover" />
                                                    ) : (
                                                        <FileText className="w-5 h-5" />
                                                    )}
                                                    <div className="overflow-hidden">
                                                        <p className="text-[10px] font-bold truncate max-w-[150px]">{msg.fileName || 'View file'}</p>
                                                        <p className="text-[9px] opacity-70 uppercase font-black">Download Attachment</p>
                                                    </div>
                                                </a>
                                            ) : (
                                                <p className="leading-relaxed">{msg.text}</p>
                                            )}

                                            <p className={`text-[9px] mt-1 font-medium opacity-50 text-right`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 shrink-0">
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept="image/*,.pdf,.doc,.docx"
                                />
                                <button
                                    type="button"
                                    disabled={isUploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-slate-400 hover:text-teal-500 transition-colors disabled:opacity-50"
                                >
                                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isUploading}
                                    className="p-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all disabled:opacity-50 active:scale-95"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 bg-teal-500 text-white rounded-2xl shadow-[0_10px_30px_rgba(20,184,166,0.3)] flex items-center justify-center hover:bg-teal-600 transition-all transform active:scale-95 hover:rotate-3 group relative"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                        >
                            <X className="w-4 h-4" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="msg"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative"
                        >
                            <MessageCircle className="w-7 h-7" />
                            {/* Pulse effect */}
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-teal-500 rounded-full animate-ping"></div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-teal-500 rounded-full"></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </div>
    );
};

export default ChatBot;
