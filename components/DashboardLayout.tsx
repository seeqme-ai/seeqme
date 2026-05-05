import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Settings,
  LogOut,
  ChevronDown,
  Activity,
  User,
  Layers,
  Menu,
  Network,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './Footer';
import ChatBot from './ChatBot';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { name: 'Dashboard', icon: Layers, path: '/dashboard' },
    { name: 'Analytics', icon: Activity, path: '/dashboard/analytics' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];
  const platformItems = [
    { name: 'Feed',    icon: TrendingUp, path: '/app/feed'    },
    { name: 'Mesh',    icon: Network,    path: '/app/mesh'    },
  ];
  const isAdmin = Boolean(user?.roles?.includes('admin'));
  if (isAdmin) {
    navItems.push({ name: 'Admin', icon: User, path: '/admin' });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-white text-foreground overflow-hidden">
      <ChatBot />
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-border transition-all duration-300 ease-in-out relative
          ${isSidebarOpen ? 'w-72' : 'w-24'}
          shadow-none`}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center h-20 px-4 border-b border-border/50 ${!isSidebarOpen && 'justify-center'}`}>
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">

            <img
              src="/seeqme-logo-black.png"
              alt="SeeqMe"
              className="h-6 w-auto block"
            />
            {isSidebarOpen && (
              <span className="text-base font-bold text-foreground">SeeqMe</span>
            )}
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {isSidebarOpen && (
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 px-4 mb-3">Workspace</p>
          )}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative
                      ${!isSidebarOpen ? 'justify-center' : ''}
                      ${isActive(item.path)
                  ? 'bg-teal-500/10 text-teal-600 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.path) ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              {isSidebarOpen && (
                <span className="text-[13px] font-semibold whitespace-nowrap">{item.name}</span>
              )}
              {isActive(item.path) && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-teal-500 rounded-r-full"
                />
              )}
            </Link>
          ))}

          <div className="pt-4 pb-1">
            <div className="h-px bg-slate-100 mb-4" />
            {isSidebarOpen && (
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 px-4 mb-3">Platform</p>
            )}
            {platformItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative
                        ${!isSidebarOpen ? 'justify-center' : ''}
                        ${isActive(item.path)
                    ? 'bg-violet-500/10 text-violet-600 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.path) ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                {isSidebarOpen && (
                  <span className="text-[13px] font-semibold whitespace-nowrap">{item.name}</span>
                )}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="active-pill-platform"
                    className="absolute left-0 w-1 h-6 bg-violet-500 rounded-r-full"
                  />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer / User Info (Optional, keeping structure) */}
        <div className="p-4 bg-muted/30 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold shrink-0">
              {user?.fullName?.[0] || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="text-[11px] font-bold truncate">{user?.fullName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-24 w-6 h-6 bg-teal-500 rounded-full hidden lg:flex items-center justify-center text-slate-950 shadow-lg border-2 border-white group-hover:scale-110 transition-transform z-50"
        >
          <Menu className="w-3 h-3" />
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border flex flex-col shadow-2xl lg:hidden"
          >
            {/* Sidebar Header */}
            <div className="flex items-center h-20 px-4 border-b border-border/50">
              <Link to="/" className="flex items-center hover:opacity-80 transition-opacity" onClick={() => setIsMobileSidebarOpen(false)}>
                <img src="/seeqme-logo-black.png" alt="SeeqMe" className="h-6 w-auto block" />
                <span className="text-base font-bold text-foreground">SeeqMe</span>
              </Link>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 px-4 mb-3">Workspace</p>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative
                      ${isActive(item.path)
                      ? 'bg-teal-500/10 text-teal-600 shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.path) ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                  <span className="text-[13px] font-semibold whitespace-nowrap">{item.name}</span>
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="active-pill-mobile"
                      className="absolute left-0 w-1 h-6 bg-teal-500 rounded-r-full"
                    />
                  )}
                </Link>
              ))}
              <div className="pt-4 pb-1">
                <div className="h-px bg-slate-100 mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 px-4 mb-3">Platform</p>
                {platformItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative
                        ${isActive(item.path)
                        ? 'bg-violet-500/10 text-violet-600 shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.path) ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                    <span className="text-[13px] font-semibold whitespace-nowrap">{item.name}</span>
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="active-pill-mobile-platform"
                        className="absolute left-0 w-1 h-6 bg-violet-500 rounded-r-full"
                      />
                    )}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="p-4 bg-muted/30 border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold shrink-0">
                  {user?.fullName?.[0] || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold truncate">{user?.fullName}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 bg-white border-b border-border/50 sticky top-0 z-30">
          <div className="flex items-center gap-4 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileSidebar}
              className="rounded-xl"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <p className="text-base font-bold">
              {[...navItems, ...platformItems].find(i => isActive(i.path))?.name || 'Dashboard'}
            </p>
          </div>

          <div className="hidden lg:flex flex-col text-left">
            <p className="text-lg font-bold">
              {[...navItems, ...platformItems].find(i => isActive(i.path))?.name || 'Dashboard'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 flex items-center gap-3 px-3 rounded-2xl bg-white  hover:bg-muted transition-all">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-teal-500/20 bg-teal-500/10 flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-teal-500" />
                      )}
                    </div>
                    <div className="hidden md:flex flex-col items-start mr-1 text-left">
                      <span className="text-xs font-semibold leading-none mb-1">{user.fullName}</span>

                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-border bg-white z-[100]">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex flex-col space-y-1 text-left">
                      <p className="text-sm font-bold leading-none">{user.fullName}</p>
                      <p className="text-[10px] text-muted-foreground leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    className="flex items-center gap-3 p-3 rounded-xl focus:bg-teal-500/5 focus:text-teal-600 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = '/dashboard/settings')}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-xs font-semibold">Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-3 p-3 rounded-xl focus:bg-rose-500/5 focus:text-rose-500 transition-colors cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-semibold">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col">
            <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
