import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Loader, MoreVertical, ExternalLink,
  Trash2, Edit3, BarChart3, Globe, Layers, Zap,
  Plus, RefreshCw, ArrowUpRight, Clock, CheckCircle2,
  AlertCircle, FileCode2, CreditCard, Bookmark, MessageSquare,
  Heart, UserMinus, FileText, Users as UsersIcon
} from 'lucide-react';
import { Portfolio } from '../types';
import { portfolioService, subscriptionService, deploymentService, sessionService, socialService } from '../services/apiService';
import { socketService } from '../services/socketService';
import SuccessDrawer from '../components/SuccessDrawer';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '../components/DashboardLayout';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import ConnectDomainModal from '../components/ConnectDomainModal';
import BusinessCardModal from '../components/BusinessCardModal';
import { Skeleton } from '../components/ui/skeleton';
import { useAuth } from '../context/auth-context';

const STATUS_CONFIG = {
  completed: {
    label: 'Live',
    dot: 'bg-emerald-500',
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  failed: {
    label: 'Failed',
    dot: 'bg-red-500',
    badge: 'text-red-600 bg-red-50 border-red-100',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  draft: {
    label: 'Draft',
    dot: 'bg-slate-400',
    badge: 'text-slate-500 bg-slate-50 border-slate-200',
    icon: <FileCode2 className="w-3 h-3" />,
  },
};

const PortfolioCard: React.FC<{
  portfolio: Portfolio;
  idx: number;
  onEdit: () => void;
  onDelete: () => void;
  onAnalytics: () => void;
  onConnectDomain: () => void;
  onRollback: () => void;
  onSwapTemplate: () => void;
  onCard: () => void;
}> = ({ portfolio: p, idx, onEdit, onDelete, onAnalytics, onConnectDomain, onRollback, onSwapTemplate, onCard }) => {
  const statusKey = (p.status === 'completed' ? 'completed' : p.status === 'failed' ? 'failed' : 'draft') as keyof typeof STATUS_CONFIG;
  const status = STATUS_CONFIG[statusKey];
  const liveUrl = p.customDomain ? `https://${p.customDomain}` : p.subdomain ? `https://${p.subdomain}.seeqme.com` : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all duration-300"
    >
      {/* Preview area */}
      <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Color accent based on status */}
        <div className={`absolute top-0 right-0 w-48 h-48 -mr-16 -mt-16 rounded-full blur-3xl opacity-30 ${p.status === 'completed' ? 'bg-teal-400' : p.status === 'failed' ? 'bg-red-400' : 'bg-slate-300'}`} />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Globe className={`w-7 h-7 ${p.status === 'completed' ? 'text-teal-500' : 'text-slate-300'}`} />
          </div>
        </div>

        {/* Top-left: status badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${status.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </div>

        {/* Top-right: More menu */}
        <div className="absolute top-2.5 right-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/80 hover:bg-white border border-slate-100 shadow-sm backdrop-blur-sm">
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1 rounded-lg bg-white border border-slate-200" style={{boxShadow:'0 4px 16px rgba(0,0,0,0.08)'}}>
              <DropdownMenuItem onClick={onEdit} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700">
                <Edit3 className="w-4 h-4 text-teal-600 shrink-0" /> Edit portfolio
              </DropdownMenuItem>
              {p.status === 'completed' && (
                <DropdownMenuItem onClick={onAnalytics} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700">
                  <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" /> View analytics
                </DropdownMenuItem>
              )}
              {p.status === 'completed' && !p.customDomain && (
                <DropdownMenuItem onClick={onConnectDomain} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700">
                  <Globe className="w-4 h-4 text-violet-600 shrink-0" /> Connect a domain
                </DropdownMenuItem>
              )}
              {p.status === 'completed' && p.hasPreviousVersion && (
                <DropdownMenuItem onClick={onRollback} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700">
                  <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" /> Rollback version
                </DropdownMenuItem>
              )}
              {p.status === 'completed' && (
                <DropdownMenuItem onClick={onSwapTemplate} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700">
                  <Layers className="w-4 h-4 text-indigo-600 shrink-0" /> Change template
                </DropdownMenuItem>
              )}
              {p.status === 'completed' && (
                <DropdownMenuItem onClick={onCard} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700">
                  <CreditCard className="w-4 h-4 text-teal-600 shrink-0" /> Business card & QR
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="my-1 bg-slate-100" />
              <DropdownMenuItem onClick={onDelete} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 cursor-pointer text-sm font-medium text-red-500">
                <Trash2 className="w-4 h-4 shrink-0" /> Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Live link quick-access */}
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-full opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            Visit site <ArrowUpRight className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-base font-bold text-slate-900 mb-1 truncate leading-tight">
          {p.name}
        </h3>

        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-5 truncate">
          <Globe className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {p.customDomain || (p.subdomain ? `${p.subdomain}.seeqme.com` : 'Not yet published')}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-50 mb-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          {p.status === 'completed' && (
            <div className="flex items-center gap-1 text-teal-600">
              <CheckCircle2 className="w-3 h-3" />
              <span>Live</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={onEdit}
            className="flex-1 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-[50px] text-xs font-medium tracking-wide transition-colors active:scale-95"
          >
            Edit
          </button>
          {liveUrl ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 h-9 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-[50px] text-xs font-medium text-slate-700 transition-colors"
            >
              View Live <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <button
              onClick={onEdit}
              className="flex-1 h-9 border border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 rounded-[50px] text-xs font-medium text-slate-500 transition-colors"
            >
              Publish
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

const Dashboard: React.FC<{ onNew: () => void; onEdit: (p: Portfolio) => void }> = ({ onNew, onEdit }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteInFlightRef = useRef(false);
  const [connectDomainPortfolio, setConnectDomainPortfolio] = useState<Portfolio | null>(null);
  const [cardPortfolio, setCardPortfolio] = useState<Portfolio | null>(null);
  const [isDeployDrawerOpen, setIsDeployDrawerOpen] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'deploying' | 'completed' | 'failed'>('deploying');
  const [deployUrl, setDeployUrl] = useState('');
  const [deployDomain, setDeployDomain] = useState('');
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'portfolios' | 'posts' | 'saved'>('portfolios');
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);

  useEffect(() => {
    fetchPortfolios();
    fetchSubscription();
    const checkActiveSession = async () => {
      try {
        const activeSession = await sessionService.getActiveSession();
        if (activeSession?.status === 'active' && (activeSession.type === 'deployment' || activeSession.type === 'rollback')) {
          setDeployStatus('deploying');
          setDeployLogs(activeSession.logs.map((l: string) => l.replace(/\[.*?\] /, '')));
          setIsDeployDrawerOpen(true);
          socketService.subscribeToSession(activeSession.id);
        }
      } catch { /* no active session */ }
    };
    checkActiveSession();
    fetchSocialData();
  }, [navigate]);

  const fetchSocialData = async () => {
    try {
      setSocialLoading(true);
      const [postsRes, savedRes, connRes] = await Promise.all([
        socialService.getMyPosts(),
        socialService.getSavedPosts(),
        socialService.getConnections()
      ]);
      setMyPosts(postsRes.posts || []);
      setSavedPosts(savedRes.posts || []);
      setConnections(connRes.accepted || []);
    } catch { /* ignore */ }
    finally { setSocialLoading(false); }
  };

  const fetchSubscription = async () => {
    try { setSubscription(await subscriptionService.getSubscription()); } catch { /* ignore */ }
  };

  const fetchPortfolios = async () => {
    try { setLoading(true); const data = await portfolioService.getPortfolios(); setPortfolios(data.portfolios || []); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!id || deleteInFlightRef.current) return;
    deleteInFlightRef.current = true;
    try {
      setIsDeleting(true);
      await portfolioService.deletePortfolio(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
      toast.success('Project permanently deleted.');
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setPortfolios(prev => prev.filter(p => p.id !== id));
        setDeleteConfirm(null);
        toast.success('Project removed.');
      } else { toast.error('Could not delete this project. Please try again.'); }
    } finally { setIsDeleting(false); deleteInFlightRef.current = false; }
  };

  const handleConnectDomainClick = (p: Portfolio) => {
    const plan = subscription?.planId?.toLowerCase() || 'free';
    if (plan !== 'pro' && plan !== 'premium') {
      toast.error('Custom domains require a Pro or Premium plan.', {
        action: { label: 'Upgrade', onClick: () => navigate('/plans') },
      });
      return;
    }
    setConnectDomainPortfolio(p);
  };

  const handleRollback = async (p: Portfolio) => {
    if (!p.id) return;
    try {
      setDeployStatus('deploying');
      setDeployLogs(['Initiating rollback…']);
      setDeployDomain(p.subdomain || '');
      setIsDeployDrawerOpen(true);
      socketService.connect();
      socketService.subscribeToPortfolio(p.id);
      socketService.setCallbacks(
        (log: any) => { const msg = log.message || (typeof log === 'string' ? log : ''); if (msg) setDeployLogs(prev => [...prev, msg]); },
        (data: any) => { setDeployUrl(data.url); setDeployStatus('completed'); fetchPortfolios(); toast.success('Rollback successful'); socketService.unsubscribeFromPortfolio(p.id!); },
        (error: any) => { setDeployStatus('failed'); toast.error(`Rollback failed: ${error.message || 'Unknown error'}`); socketService.unsubscribeFromPortfolio(p.id!); }
      );
      await deploymentService.rollbackDeployment(p.id);
    } catch (err: any) {
      setIsDeployDrawerOpen(false);
      toast.error(`Rollback failed: ${err.message || 'Could not initiate rollback'}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto py-6 pb-24 space-y-10">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-xl bg-slate-100" />
              <Skeleton className="h-4 w-64 rounded-lg bg-slate-50" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-12 w-36 rounded-2xl bg-slate-100" />
              <Skeleton className="h-12 w-36 rounded-2xl bg-teal-100" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-100 overflow-hidden bg-white">
                <Skeleton className="h-40 w-full bg-slate-50" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4 rounded-lg bg-slate-100" />
                  <Skeleton className="h-3.5 w-1/2 rounded-md bg-slate-50" />
                  <div className="flex gap-2.5 pt-2">
                    <Skeleton className="flex-1 h-10 rounded-xl bg-teal-50" />
                    <Skeleton className="flex-1 h-10 rounded-xl bg-slate-50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Dashboard — SeeqMe AI</title>
        <meta name="description" content="Manage your AI-generated portfolios, track performance, and publish your professional presence." />
      </Helmet>

      <div className="max-w-7xl mx-auto py-6 pb-28 space-y-10">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Your Portfolios</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {portfolios.length === 0
                ? 'No projects yet — create your first one below.'
                : `${portfolios.length} project${portfolios.length !== 1 ? 's' : ''} in your workspace`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Plan badge */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-lg">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Current plan</p>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{subscription?.planId || 'Free'}</p>
              </div>
              <button
                onClick={() => navigate('/plans')}
                className="flex items-center gap-1.5 ml-2 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-[50px] text-xs font-medium transition-colors"
              >
                <Zap className="w-3 h-3" /> Upgrade
              </button>
            </div>

            {/* Create new */}
            <button
              onClick={onNew}
              className="flex items-center justify-center gap-2 h-12 px-6 bg-slate-900 hover:bg-black text-white rounded-[50px] text-sm font-medium active:scale-95 transition-colors w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              New Portfolio
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('portfolios')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === 'portfolios' ? 'text-teal-600 border-teal-600' : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4" /> Portfolios
            {portfolios.length > 0 && <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">{portfolios.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === 'posts' ? 'text-teal-600 border-teal-500' : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            <FileText className="w-4 h-4" />Posts
            {myPosts.length > 0 && <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">{myPosts.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === 'saved' ? 'text-teal-600 border-teal-500' : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            <Bookmark className="w-4 h-4" /> Saved
            {savedPosts.length > 0 && <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">{savedPosts.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('connections' as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-px hidden sm:flex ${
              activeTab as any === 'connections' ? 'text-teal-600 border-teal-500' : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            <UsersIcon className="w-4 h-4" /> Connections
            {connections.length > 0 && <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">{connections.length}</span>}
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'portfolios' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {portfolios.length === 0 ? (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-lg bg-white">
                    <div className="w-14 h-14 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center mb-6">
                        <Layers className="w-8 h-8 text-teal-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">No Portfolios Yet</h2>
                    <p className="text-sm text-slate-400 font-medium mb-8 max-w-xs">
                      You haven't created any portfolios yet. Create one to start building.
                    </p>
                    <button
                      onClick={onNew}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-[50px] text-sm font-medium active:scale-95 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Portfolio
                    </button>
                  </div>
                ) : (
                  portfolios.map((p, idx) => (
                    <PortfolioCard
                      key={p.id}
                      portfolio={p}
                      idx={idx}
                      onEdit={() => onEdit(p)}
                      onDelete={() => setDeleteConfirm(p.id!)}
                      onAnalytics={() => navigate(`/portfolio/${p.id}/analytics`)}
                      onConnectDomain={() => handleConnectDomainClick(p)}
                      onRollback={() => handleRollback(p)}
                      onSwapTemplate={() => navigate(`/portfolio/${p.id}/template-preview`)}
                      onCard={() => setCardPortfolio(p)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          )}

          {(activeTab === 'posts' || activeTab === 'saved') && (
            <div className="max-w-2xl mx-auto space-y-4">
              {socialLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
                    <div className="h-3 bg-slate-100 rounded w-24 mb-4" />
                    <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                  </div>
                ))
              ) : (
                (activeTab === 'posts' ? myPosts : savedPosts).length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-6 text-slate-300">
                      {activeTab === 'posts' ? <FileText className="w-8 h-8" /> : <Bookmark className="w-8 h-8" />}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">No {activeTab} yet</h3>
                    <p className="text-sm text-slate-400 font-medium max-w-[240px]">Explore the mesh to find insights or share your professional journey.</p>
                    <button onClick={() => navigate('/app/feed')} className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-[50px] text-sm font-bold shadow-lg shadow-slate-200 transition-all hover:bg-black active:scale-95">Browse Feed</button>
                  </div>
                ) : (
                  (activeTab === 'posts' ? myPosts : savedPosts).map((post, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={post.id}
                      className="bg-white border border-slate-200 rounded-3xl p-6 group hover:border-teal-500/30 hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-pointer relative overflow-hidden"
                      onClick={() => navigate(`/app/feed/post/${post.slug || post.id}`)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                            {user?.fullName?.charAt(0) || 'Y'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{user?.fullName || 'You'}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">{post.timestamp || 'Just now'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400"><Heart className="w-3.5 h-3.5" /> {post.likes || 0}</div>
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400"><MessageSquare className="w-3.5 h-3.5" /> {post.comments?.length || 0}</div>
                        </div>
                      </div>
                      <p className="text-[14px] text-slate-700 font-medium leading-relaxed mb-4">{post.content}</p>
                      <div className="flex items-center justify-between mt-auto">
                        {post.tag && (
                          <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-widest border border-teal-100">
                            {post.tag}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-300 group-hover:text-teal-400 transition-colors uppercase tracking-widest flex items-center gap-1">
                          View details <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  ))
                )
              )}
            </div>
          )}

          {activeTab as any === 'connections' && (
            <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
               {connections.length === 0 ? (
                 <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                    <UsersIcon className="w-12 h-12 text-slate-100 mb-4" />
                    <p className="text-slate-400 font-medium text-sm">No active connections in your mesh.</p>
                    <button onClick={() => navigate('/app/mesh')} className="mt-4 text-teal-600 font-bold text-sm hover:underline">Explore the Mesh</button>
                 </div>
               ) : connections.map((c) => (
                 <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-black">
                        {c.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{c.role}</p>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/portfolio/${c.id}`)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-teal-500 transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className="bg-white rounded-lg border border-slate-200 max-w-sm w-full p-7" style={{boxShadow:'0 4px 24px rgba(0,0,0,0.10)'}}
            >
              <div className="w-10 h-10 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-2">Delete this project?</h4>
              <p className="text-sm text-slate-500 font-medium mb-7 leading-relaxed">
                This will permanently remove the portfolio, its files, and your public URL. <span className="text-slate-800 font-bold">This cannot be undone.</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-[50px] border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Keep it
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-[50px] bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <><Loader className="w-4 h-4 animate-spin" /> Deleting…</> : 'Yes, delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BusinessCardModal
        isOpen={!!cardPortfolio}
        onClose={() => setCardPortfolio(null)}
        portfolio={cardPortfolio!}
      />

      <ConnectDomainModal
        isOpen={!!connectDomainPortfolio}
        onClose={() => setConnectDomainPortfolio(null)}
        portfolioId={connectDomainPortfolio?.id || ''}
        portfolioName={connectDomainPortfolio?.name || 'Your Project'}
        onSuccess={fetchPortfolios}
      />

      <SuccessDrawer
        isOpen={isDeployDrawerOpen}
        onClose={() => setIsDeployDrawerOpen(false)}
        url={deployUrl}
        domain={deployDomain}
        status={deployStatus}
        logs={deployLogs}
      />
    </DashboardLayout>
  );
};

export default React.memo(Dashboard);
