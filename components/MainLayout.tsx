import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { Instagram, Menu, X, Shield,Code2 } from 'lucide-react';
import ChatBot from './ChatBot';
import Footer from './Footer';
import { HireExpertModal } from './HireExpertModal';

const MotionDiv = motion.div as any;

interface MainLayoutProps {
  children: React.ReactNode;
}


const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleOpenExpert = () => setIsHireModalOpen(true);
    window.addEventListener('open-hire-expert', handleOpenExpert);
    return () => window.removeEventListener('open-hire-expert', handleOpenExpert);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-teal-500 selection:text-slate-950 overflow-x-hidden">
      <ChatBot />

      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100] px-6 py-3 flex justify-between items-center rounded-2xl border border-white/10 bg-white/60  backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2">

            <img src="/seeqme-logo-black.png" alt="Logo" className="h-7 w-auto transition-transform group-hover:scale-110 block" />
            <span className="text-lg font-bold text-foreground">SeeQMe</span>
          </div>
        </div>

        <nav className="hidden lg:flex gap-8 text-[11px] font-bold uppercase text-muted-foreground/80 items-center">
          <button onClick={() => navigate('/dashboard')} className="hover:text-teal-500 transition-colors">Projects</button>
          <button onClick={() => navigate('/templates')} className="hover:text-teal-500 transition-colors">Templates</button>
          <button onClick={() => navigate('/contact')} className="hover:text-teal-500 transition-colors">Contact Us</button>
          <div className="relative group flex items-center">
            <button onClick={() => setIsHireModalOpen(true)} className="text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1">
              <Code2 className="w-3 h-3" /> Hire Expert
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-active:opacity-100 group-active:visible transition-all shadow-xl z-50 text-center pointer-events-none normal-case font-medium">
              Need a custom layout? Let our elite designers build it for you.
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
            </div>
          </div>
          {user?.roles?.includes('admin') && (
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
              <span className="text-[10px] font-bold uppercase  hidden sm:inline">Dashboard</span>
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
            <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className="text-3xl font-bold hover:text-teal-500 transition-colors">DASHBOARD</button>
            <button onClick={() => { navigate('/templates'); setMobileMenuOpen(false); }} className="text-3xl font-bold hover:text-teal-500 transition-colors">TEMPLATES</button>
            <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }} className="text-3xl font-bold  hover:text-teal-500 transition-colors">CONTACT US</button>
            <button onClick={() => { window.dispatchEvent(new Event('open-hire-expert')); setMobileMenuOpen(false); }} className="text-3xl font-bold hover:text-teal-500 text-teal-600 transition-colors flex items-center gap-2"><Code2 className="w-6 h-6" /> HIRE EXPERT</button>
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

      <Footer />
      <HireExpertModal isOpen={isHireModalOpen} onClose={() => setIsHireModalOpen(false)} />
    </div>
  );
};

export default MainLayout;