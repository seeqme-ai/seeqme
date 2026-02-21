import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Layout, MessageCircle, Shield, Search, ExternalLink,
    CheckCircle, Send, Paperclip, Loader2,
    Trash2, Zap, FileEdit, Plus, ArrowLeft
} from 'lucide-react';
import apiClient, { adminService } from '@/services/apiService';
import { db } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp, set, query, limitToLast } from 'firebase/database';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

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

type ConfirmAction = 'deploy' | 'create' | 'delete' | null;

interface PendingAction {
    type: ConfirmAction;
    id?: string;
}

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'chats' | 'users' | 'portfolios'>('overview');
    const [users, setUsers] = useState<any[]>([]);
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
    const [targetUserId, setTargetUserId] = useState('');
    const [pendingAction, setPendingAction] = useState<PendingAction>({ type: null });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [mobileChatView, setMobileChatView] = useState<'list' | 'chat'>('list');

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

    // --- Confirm Modal helpers ---
    const openConfirm = (action: ConfirmAction, id?: string) => {
        setPendingAction({ type: action, id });
        setIsConfirmOpen(true);
    };

    const closeConfirm = () => {
        setIsConfirmOpen(false);
        setPendingAction({ type: null });
        setIsActionLoading(false);
    };

    const handleConfirm = async () => {
        setIsActionLoading(true);
        try {
            if (pendingAction.type === 'deploy' && pendingAction.id) {
                await toast.promise(adminService.deployOnBehalf(pendingAction.id), {
                    loading: 'Orchestrating deployment...',
                    success: 'Deployment live!',
                    error: 'Deployment failed.'
                });
                fetchData();
            } else if (pendingAction.type === 'create') {
                if (!targetUserId) { toast.error('Select a target user first.'); return; }
                const payload = { themeId: 'neo-brutalism', title: 'Admin Created Portfolio', targetUserId };
                await toast.promise(apiClient.post('/portfolios', payload), {
                    loading: 'Scaffolding portfolio...',
                    success: 'Portfolio created successfully!',
                    error: 'Failed to create portfolio.'
                });
                setIsCreatingPortfolio(false);
                setTargetUserId('');
                fetchData();
            } else if (pendingAction.type === 'delete' && pendingAction.id) {
                await toast.promise(adminService.deletePortfolio(pendingAction.id), {
                    loading: 'Deleting portfolio...',
                    success: 'Portfolio deleted.',
                    error: 'Deletion failed.'
                });
                fetchData();
            }
        } finally {
            closeConfirm();
        }
    };

    const getConfirmConfig = () => {
        switch (pendingAction.type) {
            case 'deploy':
                return {
                    title: 'Deploy Portfolio',
                    description: 'This will trigger a live deployment for this user\'s portfolio. Continue?',
                    confirmText: 'Deploy Now',
                    variant: 'info' as const,
                };
            case 'create':
                return {
                    title: 'Create Portfolio',
                    description: 'Create a new portfolio instance on behalf of the selected user?',
                    confirmText: 'Create Instance',
                    variant: 'info' as const,
                };
            case 'delete':
                return {
                    title: 'Delete Portfolio',
                    description: 'This action is permanent and cannot be undone. Are you sure?',
                    confirmText: 'Delete',
                    variant: 'danger' as const,
                    isDestructive: true,
                };
            default:
                return { title: '', description: '', confirmText: 'Confirm', variant: 'info' as const };
        }
    };

    const filteredPortfolios = portfolios.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.domain?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const confirmConfig = getConfirmConfig();

    const tabs = [
        { id: 'overview', icon: Zap, label: 'Overview' },
        { id: 'chats', icon: MessageCircle, label: 'Chats' },
        { id: 'users', icon: Users, label: 'Users' },
        { id: 'portfolios', icon: Layout, label: 'Portfolios' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col gap-5 py-6 sm:py-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-teal-600" />
                            Platform Command
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-0.5">Global oversight and user orchestration</p>
                    </div>

                    {activeTab === 'portfolios' && (
                        <button
                            onClick={() => setIsCreatingPortfolio(true)}
                            className="bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-black/10 hover:bg-teal-600 transition-colors flex items-center gap-2 self-start sm:self-auto"
                        >
                            <Plus className="w-4 h-4" /> Create for User
                        </button>
                    )}
                </div>

                {/* Tab Bar – scrollable on mobile */}
                <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 w-max min-w-full sm:w-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id
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

                {/* Search Bar */}
                {activeTab !== 'overview' && activeTab !== 'chats' && (
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-medium focus:ring-0 focus:border-teal-500 transition-all shadow-sm"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-h-[400px]">
                    {loading && (
                        <div className="h-full flex items-center justify-center py-24">
                            <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                        </div>
                    )}

                    {!loading && (
                        <AnimatePresence mode="wait">

                            {/* Overview */}
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                                >
                                    <StatCard label="Total Users" value={users.length} icon={Users} color="bg-blue-500" />
                                    <StatCard label="Portfolios" value={portfolios.length} icon={Layout} color="bg-purple-500" />
                                    <StatCard label="Live Sites" value={portfolios.filter(p => p.isPublished).length} icon={CheckCircle} color="bg-teal-500" />
                                    <StatCard label="Active Chats" value={chatSummaries.length} icon={MessageCircle} color="bg-rose-500" />
                                </motion.div>
                            )}

                            {/* Chats */}
                            {activeTab === 'chats' && (
                                <motion.div
                                    key="chats"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                                    style={{ height: 'clamp(400px, 60vh, 640px)' }}
                                >
                                    <div className="flex h-full">
                                        {/* Chat List – hidden on mobile when chat is open */}
                                        <div className={`${selectedChat && mobileChatView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-72 lg:w-80 border-r border-slate-100 flex-col shrink-0`}>
                                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conversations</h4>
                                            </div>
                                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                                {chatSummaries.length === 0 && (
                                                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                                                        <MessageCircle className="w-10 h-10 mb-3 text-slate-300" />
                                                        <p className="text-sm font-bold text-slate-500">No conversations yet</p>
                                                    </div>
                                                )}
                                                {chatSummaries.map((summary) => (
                                                    <button
                                                        key={summary.userId}
                                                        onClick={() => {
                                                            setSelectedChat(summary.userId);
                                                            setMobileChatView('chat');
                                                        }}
                                                        className={`w-full p-4 flex flex-col gap-1 text-left transition-all border-b border-slate-50 ${selectedChat === summary.userId ? 'bg-teal-50/50 border-r-4 border-r-teal-500' : 'hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="font-bold text-sm text-slate-800 truncate">{summary.userName}</span>
                                                            <span className="text-[10px] text-slate-400 shrink-0">
                                                                {new Date(summary.lastTimestamp).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate">{summary.lastMessage}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Chat Window */}
                                        <div className={`${selectedChat && mobileChatView === 'chat' ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-50/20 min-w-0`}>
                                            {selectedChat ? (
                                                <>
                                                    {/* Chat header */}
                                                    <div className="p-3 sm:p-4 border-b border-white bg-white/50 backdrop-blur-sm flex items-center gap-3">
                                                        {/* Back button on mobile */}
                                                        <button
                                                            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                                                            onClick={() => { setMobileChatView('list'); setSelectedChat(null); }}
                                                        >
                                                            <ArrowLeft className="w-4 h-4" />
                                                        </button>
                                                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                            {(chatSummaries.find(s => s.userId === selectedChat)?.userName || 'Guest')[0]}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-800 text-sm truncate">{chatSummaries.find(s => s.userId === selectedChat)?.userName || 'Anonymous Guest'}</p>
                                                            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-tight">
                                                                {selectedChat?.startsWith('dev_') ? 'Prospecting Guest' : 'Authenticated User'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Messages */}
                                                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
                                                        {chatMessages.map((msg) => (
                                                            <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                                <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-3.5 text-sm ${msg.isAdmin
                                                                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/10'
                                                                    : 'bg-white text-slate-800 border border-white shadow-sm'
                                                                    }`}>
                                                                    {msg.fileUrl ? (
                                                                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-bold underline mb-1">
                                                                            <Paperclip className="w-4 h-4" /> Attached File
                                                                        </a>
                                                                    ) : (
                                                                        <p>{msg.text}</p>
                                                                    )}
                                                                    <p className="text-[10px] mt-1.5 opacity-50 font-medium">
                                                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div ref={messagesEndRef} />
                                                    </div>

                                                    {/* Reply form */}
                                                    <form onSubmit={handleSendReply} className="p-3 sm:p-4 bg-white border-t border-slate-100 flex gap-2 sm:gap-3">
                                                        <input
                                                            type="text"
                                                            value={replyMessage}
                                                            onChange={(e) => setReplyMessage(e.target.value)}
                                                            placeholder="Type admin response..."
                                                            className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 min-w-0"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={isSending || !replyMessage.trim()}
                                                            className="bg-teal-600 text-white p-3 rounded-2xl hover:bg-teal-700 transition-all disabled:opacity-50 shrink-0"
                                                        >
                                                            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                                        </button>
                                                    </form>
                                                </>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-8">
                                                    <MessageCircle className="w-14 h-14 mb-4 text-slate-300" />
                                                    <h3 className="text-lg font-bold text-slate-800">Select a conversation</h3>
                                                    <p className="text-sm font-medium text-slate-500">Click on a user chat to start responding in real-time</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Users */}
                            {activeTab === 'users' && (
                                <motion.div
                                    key="users"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {/* Desktop table */}
                                    <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
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
                                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
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

                                    {/* Mobile card list */}
                                    <div className="md:hidden flex flex-col gap-3">
                                        {filteredUsers.map((u) => (
                                            <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg shrink-0">
                                                    {u.fullName?.[0] || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 text-sm truncate">{u.fullName}</p>
                                                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {u.isVerified ? 'Verified' : 'Pending'}
                                                        </span>
                                                        <span className={`text-[10px] font-bold uppercase ${u.roles?.includes('admin') ? 'text-teal-600' : 'text-slate-400'}`}>
                                                            {u.roles?.join(', ') || 'user'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-400 shrink-0">{new Date(u.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Portfolios */}
                            {activeTab === 'portfolios' && (
                                <motion.div
                                    key="portfolios"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                                >
                                    {filteredPortfolios.map((p) => (
                                        <div key={p.id} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between group">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${p.isPublished ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'}`}>
                                                        <Layout className="w-5 h-5" />
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.isPublished ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                        {p.isPublished ? 'Live' : 'Draft'}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition-colors text-sm sm:text-base">{p.title}</h3>
                                                <p className="text-xs text-slate-500 mb-3 font-medium italic">Owner: {users.find(u => u.id === p.userId)?.fullName || 'Guest'}</p>
                                                {p.domain && (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-4 truncate">
                                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                                        {p.domain}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => window.open(`/builder?id=${p.id}`, '_blank')}
                                                    className="flex-1 bg-teal-50 text-teal-600 hover:bg-teal-100 text-[10px] font-black p-3 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-1.5"
                                                >
                                                    <FileEdit className="w-3 h-3" /> Studio
                                                </button>
                                                {!p.isPublished && (
                                                    <button
                                                        onClick={() => openConfirm('deploy', p.id)}
                                                        className="flex-1 bg-slate-900 text-white text-[10px] font-black p-3 rounded-xl hover:bg-teal-600 transition-all uppercase tracking-widest shadow-lg shadow-slate-950/20 flex items-center justify-center gap-1.5"
                                                    >
                                                        <Zap className="w-3 h-3 text-teal-400" /> Deploy
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openConfirm('delete', p.id)}
                                                    className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Create Portfolio Modal */}
            <AnimatePresence>
                {isCreatingPortfolio && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreatingPortfolio(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-5 sm:p-6 border-b border-slate-100">
                                <h2 className="text-xl font-black text-slate-900">Create on Behalf</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Select a user to generate a portfolio instance for.</p>
                            </div>
                            <div className="p-5 sm:p-6 space-y-4">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Target User</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium focus:border-teal-500 focus:ring-0"
                                    value={targetUserId}
                                    onChange={(e) => setTargetUserId(e.target.value)}
                                >
                                    <option value="">Select a user...</option>
                                    {users.filter(u => u.isVerified).map(user => (
                                        <option key={user.id} value={user.id}>{user.fullName} ({user.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsCreatingPortfolio(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreatingPortfolio(false);
                                        openConfirm('create');
                                    }}
                                    disabled={!targetUserId}
                                    className="bg-slate-900 text-white font-bold px-7 py-2.5 rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-all flex items-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Create Instance
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={closeConfirm}
                onConfirm={handleConfirm}
                title={confirmConfig.title}
                description={confirmConfig.description}
                confirmText={confirmConfig.confirmText}
                variant={confirmConfig.variant}
                isDestructive={pendingAction.type === 'delete'}
                isLoading={isActionLoading}
            />
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 flex items-center gap-4 sm:gap-5">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-black/5 shrink-0`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{value}</p>
        </div>
    </div>
);

export default AdminDashboard;
