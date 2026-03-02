import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
   Users, MessageCircle, Settings, FileEdit, Send,
    Menu, X, LogOut, Zap, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const hasPageAccess = (key: string) => {
        const access = user?.adminPageAccess;
        if (!Array.isArray(access) || access.length === 0) return true;
        return access.includes(key);
    };

    const navItems = [
        { icon: Zap, label: 'Overview', path: '/admin', end: true, key: 'overview' },
        { icon: MessageCircle, label: 'Chats', path: '/admin/chats', key: 'chats' },
        { icon: Users, label: 'User', path: '/admin/users', key: 'users' },
        { icon: Globe, label: 'Portfolios', path: '/admin/portfolios', key: 'portfolios' },
        { icon: FileEdit, label: 'Templates', path: '/admin/templates', key: 'templates' },
        { icon: Send, label: 'Notifications', path: '/admin/notifications', key: 'notifications' },
        { icon: Settings, label: 'System Config', path: '/admin/config', key: 'config' },
    ].filter((item) => hasPageAccess(item.key));

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="hidden lg:flex flex-col bg-slate-900 text-white relative z-50 transition-all duration-300"
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 gap-3 border-b border-white/5 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                         <img src='/seeqme-logo-black.png' className="w-6 h-6 text-slate-950" />
                    </div>
                    {isSidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-black text-xl tracking-tight whitespace-nowrap"
                        >
                        <span className="text-teal-400 font-bold">Admin</span>
                        </motion.span>
                    )}
                </div>


                {/* Nav Links */}
                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative
                                ${isActive
                                    ? 'bg-teal-500 text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.2)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 ${isSidebarOpen ? '' : 'mx-auto'}`} />
                            {isSidebarOpen && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {isSidebarOpen && <span className="text-sm font-bold">Sign Out</span>}
                    </button>

                    {isSidebarOpen && (
                        <div className="mt-4 p-4 rounded-2xl bg-white/5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 font-black">
                                {user?.fullName?.[0] || 'A'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black truncate">{user?.fullName || 'Administrator'}</p>
                                
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="absolute -right-3 top-24 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-slate-950 shadow-lg border-2 border-slate-900 group-hover:scale-110 transition-transform"
                    >
                        <Menu className="w-3 h-3" />
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-6 z-[60] border-b border-white/5">
                <div className="flex items-center gap-3">
                    <span className="font-black text-white text-lg">Admin</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[70]"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed inset-y-0 left-0 w-80 bg-slate-900 z-[80] flex flex-col p-6 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-10 pt-4">
                                <span className="font-black text-2xl text-white">Admin</span>
                            </div>

                            <nav className="space-y-3 flex-1">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.label}
                                        to={item.path}
                                        end={item.end}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                            flex items-center gap-4 px-5 py-4 rounded-2xl transition-all
                                            ${isActive
                                                ? 'bg-teal-500 text-slate-950 shadow-lg'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                        `}
                                    >
                                        <item.icon className="w-6 h-6" />
                                        <span className="text-base font-bold tracking-tight">{item.label}</span>
                                    </NavLink>
                                ))}
                            </nav>

                            <button
                                onClick={handleLogout}
                                className="mt-auto flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold"
                            >
                                <LogOut className="w-6 h-6" />
                                <span>Sign Out</span>
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col min-w-0 h-screen lg:h-auto overflow-y-auto bg-slate-50 relative pt-16 lg:pt-0">
                <div className="p-4">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
