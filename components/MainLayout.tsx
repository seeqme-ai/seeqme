import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { Instagram, Menu, X, Shield, MessageSquare } from 'lucide-react';

const MotionDiv = motion.div as any;

interface MainLayoutProps {
  children: React.ReactNode;
}

import ChatBot from './ChatBot';

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-teal-500 selection:text-slate-950 overflow-x-hidden">
      {/* Real-time Support Chat */}
      <ChatBot />

      {/* --- REDESIGNED HEADER: Floating Pill Style --- */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100] px-6 py-3 flex justify-between items-center rounded-2xl border border-white/10 bg-white/60  backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2">

            <img src="/seeqme-logo-black.png" alt="Logo" className="h-7 w-auto transition-transform group-hover:scale-110 block" />
            <span className="text-lg font-bold tracking-tighter text-foreground">SeeQMe</span>
          </div>
        </div>

        <nav className="hidden lg:flex gap-8 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
          <button onClick={() => navigate('/dashboard')} className="hover:text-teal-500 transition-colors">Projects</button>
          <button onClick={() => navigate('/#templates')} className="hover:text-teal-500 transition-colors">Templates</button>
          <button onClick={() => navigate('/contact')} className="hover:text-teal-500 transition-colors">Contact Us</button>
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin
            </button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button className="px-5 py-2 rounded-xl text-[10px] font-bold bg-teal-500 text-white transition-all active:scale-95" onClick={() => navigate('/auth/signup')}>
                Get Started
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 bg-muted/50 px-4 py-1.5 rounded-full hover:bg-muted transition-all">
              <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {user?.fullName?.[0] || 'U'}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Dashboard</span>
            </button>
          )}
          <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <MotionDiv initial={{ opacity: 0, y: '-100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '-100%' }} className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center gap-10 text-center">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-10 right-10 p-4 rounded-full bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 transition-all font-bold"><X className="w-5 h-5" /></button>
            <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className="text-3xl font-bold tracking-tight hover:text-teal-500 transition-colors">DASHBOARD</button>
            <button onClick={() => { navigate('/#templates'); setMobileMenuOpen(false); }} className="text-3xl font-bold tracking-tight hover:text-teal-500 transition-colors">TEMPLATES</button>
            <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }} className="text-3xl font-bold tracking-tight hover:text-teal-500 transition-colors">CONTACT US</button>
            {!isAuthenticated && (
              <div className="flex flex-col gap-6 mt-8">
                <button onClick={() => navigate('/auth/login')} className="text-lg font-semibold text-muted-foreground hover:text-foreground">Sign In</button>
                <button onClick={() => navigate('/auth/signup')} className="text-lg font-bold bg-teal-600 text-white px-12 py-4 rounded-full">Sign Up</button>
              </div>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>

      <main className="relative pt-28"> {/* Adjusted padding-top for fixed header */}
        {children}
      </main>

      <footer className=" px-6 md:px-12 mt-20 border-t border-border bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Branding & Socials */}
            <div className="col-span-1 sm:col-span-2 space-y-8">
              <div className="flex items-center gap-4">

                <img src="/seeqme-logo-black.png" alt="SeeqMe Logo" className="h-8 w-auto block " />
                <span className="text-lg font-bold tracking-tight">SeeQMe AI</span>
              </div>

              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                Elevating professional identities through generative intelligence. Build your digital legacy in minutes, not days.
              </p>

              <div className="flex gap-3">
                {[
                  { Icon: Instagram, label: 'Instagram' },
                  { Icon: ICONS.Linkedin, label: 'LinkedIn' },
                  { Icon: ICONS.Share, label: 'Share' }
                ].map(({ Icon, label }) => (
                  <button
                    key={label}
                    className="p-3 bg-background rounded-xl hover:bg-teal-500/10 text-muted-foreground hover:text-teal-500 transition-all border border-border group"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-6 mt-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">
                Compliance
              </h4>
              <nav className="flex flex-col gap-4 text-sm  text-muted-foreground">
                <a href="/privacy-policy" className="hover:text-foreground hover:translate-x-1 transition-all">Privacy Policy</a>
                <a href="/terms-of-service" className="hover:text-foreground hover:translate-x-1 transition-all">Terms of Service</a>
              </nav>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              <span>© {new Date().getFullYear()} SEEQME AI</span>
              <span className="hidden md:block text-border">•</span>
              <span>ALL RIGHTS RESERVED.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;