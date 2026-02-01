import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Layout, MessageCircle, Shield, Search, ExternalLink,
    CheckCircle, Clock, AlertCircle, Send, Paperclip, Loader2,
    ChevronRight, ArrowLeft, Filter, Download, Trash2, Zap
} from 'lucide-react';
import { adminService } from '@/services/apiService';
import { db } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp, set, query, limitToLast } from 'firebase/database';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

interface ChatSummary {
    userId: string;
    userName: string;
    lastMessage: string;
    lastTimestamp: number;
    unreadCount: number;
}

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

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'chats' | 'users' | 'portfolios'>('overview');
    const [users, setUsers] = useState<any[]>([]);
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Chat States
    const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchData();
        const summariesRef = ref(db, 'chat_summaries');
        const unsubscribe = onValue(summariesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const summaries = Object.values(data) as ChatSummary[];
                setChatSummaries(summaries.sort((a, b) => b.lastTimestamp - a.lastTimestamp));
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!selectedChat) return;

        const messagesRef = ref(db, `chats/${selectedChat}/messages`);
        const q = query(messagesRef, limitToLast(50));
        const unsubscribe = onValue(q, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messageList = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val,
                })) as Message[];
                setChatMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
            } else {
                setChatMessages([]);
            }
        });

        return () => unsubscribe();
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, portfoliosData] = await Promise.all([
                adminService.getUsers(),
                adminService.getAllPortfolios()
            ]);
            setUsers(usersData);
            setPortfolios(portfoliosData);
        } catch (err) {
            toast.error('Failed to load administrative data');
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!replyMessage.trim() || !selectedChat || !currentUser) return;

        setIsSending(true);
        try {
            const chatRef = ref(db, `chats/${selectedChat}/messages`);
            await push(chatRef, {
                senderId: currentUser.id,
                senderName: 'Admin Support',
                text: replyMessage.trim(),
                timestamp: serverTimestamp(),
                isAdmin: true,
            });

            // Update summary
            const summaryRef = ref(db, `chat_summaries/${selectedChat}`);
            await set(summaryRef, {
                userId: selectedChat,
                userName: chatSummaries.find(s => s.userId === selectedChat)?.userName || 'User',
                lastMessage: `Admin: ${replyMessage.trim()}`,
                lastTimestamp: serverTimestamp(),
                unreadCount: 0,
            });

            setReplyMessage('');
        } catch (err) {
            toast.error('Failed to send reply');
        } finally {
            setIsSending(false);
        }
    };

    const handleDeployOnBehalf = async (id: string) => {
        const confirm = window.confirm('Are you sure you want to trigger deployment for this user?');
        if (!confirm) return;

        toast.promise(adminService.deployOnBehalf(id), {
            loading: 'Orchestrating deployment...',
            success: 'Deployment live!',
            error: 'Deployment failed.'
        });
        fetchData(); // Refresh list
    };

    const filteredPortfolios = portfolios.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.domain?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
            <div className="max-w-7xl mx-auto w-full px-6 flex-1 flex flex-col gap-6 py-8">

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Shield className="w-8 h-8 text-teal-600" />
                            Platform Command
                        </h1>
                        <p className="text-slate-500 font-medium">Global oversight and user orchestration</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                        {[
                            { id: 'overview', icon: Zap, label: 'Overview' },
                            { id: 'chats', icon: MessageCircle, label: 'Chats' },
                            { id: 'users', icon: Users, label: 'Users' },
                            { id: 'portfolios', icon: Layout, label: 'Portfolios' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Bar (conditional) */}
                {activeTab !== 'overview' && activeTab !== 'chats' && (
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:ring-0 focus:border-teal-500 transition-all shadow-sm"
                        />
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 min-h-[500px]">
                    {loading && (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
                        </div>
                    )}

                    {!loading && (
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                                >
                                    <StatCard label="Total Users" value={users.length} icon={Users} color="bg-blue-500" />
                                    <StatCard label="Portfolios" value={portfolios.length} icon={Layout} color="bg-purple-500" />
                                    <StatCard label="Live Sites" value={portfolios.filter(p => p.isPublished).length} icon={CheckCircle} color="bg-teal-500" />
                                    <StatCard label="Active Chats" value={chatSummaries.length} icon={MessageCircle} color="bg-rose-500" />
                                </motion.div>
                            )}

                            {activeTab === 'chats' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-3xl shadow-sm border border-slate-100 flex h-[600px] overflow-hidden"
                                >
                                    {/* Chat List */}
                                    <div className="w-80 border-r border-slate-100 flex flex-col">
                                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Conversations</h4>
                                        </div>
                                        <div className="flex-1 overflow-y-auto no-scrollbar">
                                            {chatSummaries.map((summary) => (
                                                <button
                                                    key={summary.userId}
                                                    onClick={() => setSelectedChat(summary.userId)}
                                                    className={`w-full p-4 flex flex-col gap-1 text-left transition-all border-b border-slate-50 ${selectedChat === summary.userId ? 'bg-teal-50/50 border-r-4 border-r-teal-500' : 'hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-sm text-slate-800">{summary.userName}</span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(summary.lastTimestamp).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate">{summary.lastMessage}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chat Window */}
                                    <div className="flex-1 flex flex-col bg-slate-50/20">
                                        {selectedChat ? (
                                            <>
                                                <div className="p-4 border-b border-white bg-white/50 backdrop-blur-sm flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                                            {chatSummaries.find(s => s.userId === selectedChat)?.userName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{chatSummaries.find(s => s.userId === selectedChat)?.userName}</p>
                                                            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-tight">Active Conversation</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                                                    {chatMessages.map((msg) => (
                                                        <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[70%] rounded-2xl p-4 text-sm ${msg.isAdmin
                                                                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/10'
                                                                    : 'bg-white text-slate-800 border border-white'
                                                                }`}>
                                                                {msg.fileUrl ? (
                                                                    <a href={msg.fileUrl} target="_blank" className="flex items-center gap-2 font-bold underline mb-1">
                                                                        <Paperclip className="w-4 h-4" /> Attached File
                                                                    </a>
                                                                ) : (
                                                                    <p>{msg.text}</p>
                                                                )}
                                                                <p className="text-[10px] mt-2 opacity-50 font-medium">
                                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div ref={messagesEndRef} />
                                                </div>

                                                <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-slate-100 flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={replyMessage}
                                                        onChange={(e) => setReplyMessage(e.target.value)}
                                                        placeholder="Type admin response..."
                                                        className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-500/20"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={isSending || !replyMessage.trim()}
                                                        className="bg-teal-600 text-white p-3 rounded-2xl hover:bg-teal-700 transition-all disabled:opacity-50"
                                                    >
                                                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                                    </button>
                                                </form>
                                            </>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-8">
                                                <MessageCircle className="w-16 h-16 mb-4 text-slate-300" />
                                                <h3 className="text-xl font-bold text-slate-800">Select a conversation</h3>
                                                <p className="text-sm font-medium">Click on a user chat to start responding in real-time</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'users' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Joined</th>
                                                <th className="px-6 py-4">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                                                {u.fullName?.[0] || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{u.fullName}</p>
                                                                <p className="text-xs text-slate-500">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {u.isVerified ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs font-bold uppercase tracking-tighter ${u.roles?.includes('admin') ? 'text-teal-600' : 'text-slate-400'}`}>
                                                            {u.roles?.join(', ') || 'user'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'portfolios' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredPortfolios.map((p) => (
                                        <div key={p.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between group">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.isPublished ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'}`}>
                                                        <Layout className="w-6 h-6" />
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.isPublished ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                        {p.isPublished ? 'Live' : 'Draft'}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition-colors">{p.title}</h3>
                                                <p className="text-xs text-slate-500 mb-4 font-medium italic">Owner: {users.find(u => u.id === p.userId)?.fullName || 'Guest'}</p>
                                                {p.domain && (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-4 truncate">
                                                        <ExternalLink className="w-3 h-3" />
                                                        {p.domain}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                {!p.isPublished && (
                                                    <button
                                                        onClick={() => handleDeployOnBehalf(p.id)}
                                                        className="flex-1 bg-slate-900 text-white text-[10px] font-black p-3 rounded-xl hover:bg-teal-600 transition-all uppercase tracking-widest shadow-lg shadow-slate-950/20 flex items-center justify-center gap-2"
                                                    >
                                                        <Zap className="w-3 h-3 text-teal-400" /> Deploy Now
                                                    </button>
                                                )}
                                                <button className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-black/5`}>
            <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
    </div>
);

export default AdminDashboard;
