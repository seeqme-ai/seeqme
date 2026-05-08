import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import {
  Menu, X, Shield, Network, TrendingUp,
  LayoutDashboard, ChevronDown, LogOut, Settings,
} from 'lucide-react';
import ChatBot from './ChatBot';
import Footer from './Footer';
import { HireExpertModal } from './HireExpertModal';

const MotionDiv = motion.div as any;

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const NAV_LINKS = [
  { label: 'Templates', href: '/templates',   icon: null        },
  { label: 'Feed',      href: '/app/feed',    icon: TrendingUp  },
  { label: 'Mesh',      href: '/app/mesh',    icon: Network     },
  { label: 'Plans',     href: '/plans',       icon: null        },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideFooter = false }) => {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [hireOpen, setHireOpen]         = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = () => setHireOpen(true);
    window.addEventListener('open-hire-expert', handler);
    return () => window.removeEventListener('open-hire-expert', handler);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = () => setProfileOpen(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [profileOpen]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-teal-500 selection:text-white overflow-x-hidden">
      <ChatBot />

      {/* ── Navbar ── */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-[100] px-5 py-2.5 flex justify-between items-center rounded-2xl transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-200/60'
            : 'bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
        }`}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <img src="/seeqme-logo-black.png" alt="SeeqMe" className="h-6 w-auto transition-transform group-hover:scale-105" />
          <span className="text-[15px] font-bold text-slate-900 tracking-tight">SeeqMe</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all ${
                isActive(href)
                  ? 'bg-teal-50 text-teal-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {label}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all ${
                  isActive('/dashboard')
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            </>
          )}
          {user?.roles?.includes('admin') && (
            <>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-teal-600 hover:bg-teal-50 transition-all">
                <Shield className="w-3.5 h-3.5" /> Admin
              </button>
            </>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/auth/login')}
                className="hidden sm:block px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/auth/signup')}
                className="px-4 py-2 rounded-xl text-[12px] font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all active:scale-95"
              >
                Get started
              </button>
            </>
          ) : (
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setProfileOpen(p => !p)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-[11px] font-black text-white uppercase shrink-0">
                  {user?.fullName?.[0] || 'U'}
                </div>
                <span className="text-[12px] font-bold text-slate-700 hidden sm:block max-w-[100px] truncate">
                  {user?.fullName?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <MotionDiv
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 overflow-hidden py-1"
                  >
                    <div className="px-3.5 py-2.5 border-b border-slate-100">
                      <p className="text-[12px] font-bold text-slate-900 truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{user?.email}</p>
                    </div>
                    {[
                      { label: 'Dashboard',  href: '/dashboard',        icon: LayoutDashboard },
                      { label: 'Settings',   href: '/dashboard/settings', icon: Settings       },
                    ].map(({ label, href, icon: Icon }) => (
                      <button key={href} onClick={() => { navigate(href); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                      >
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        {label}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => { logout?.(); setProfileOpen(false); navigate('/'); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                      </button>
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] bg-white flex flex-col"
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img src="/seeqme-logo-black.png" alt="SeeqMe" className="h-6 w-auto" />
                <span className="text-[15px] font-bold text-slate-900">SeeqMe</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-5 py-6 space-y-1 overflow-y-auto">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">Platform</p>
              {NAV_LINKS.map(({ label, href, icon: Icon }) => (
                <button key={href} onClick={() => navigate(href)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${isActive(href) ? 'bg-teal-50 text-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {Icon && <Icon className="w-4 h-4" />} {label}
                </button>
              ))}
              {isAuthenticated && (
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <button onClick={() => navigate('/dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${isActive('/dashboard') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </button>
                </div>
              )}
            </nav>

            <div className="px-5 py-5 border-t border-slate-100">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <button onClick={() => navigate('/auth/signup')}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold active:scale-95 transition-all"
                  >
                    Get started — it's free
                  </button>
                  <button onClick={() => navigate('/auth/login')}
                    className="w-full py-3 text-slate-500 text-sm font-semibold hover:text-slate-800 transition-colors"
                  >
                    Sign in
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-black">
                      {user?.fullName?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { logout?.(); navigate('/'); setMobileOpen(false); }}
                    className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <main className="relative pt-20">
        {children}
      </main>

      {!hideFooter && <Footer />}

      <HireExpertModal isOpen={hireOpen} onClose={() => setHireOpen(false)} />
    </div>
  );
};

export default MainLayout;
