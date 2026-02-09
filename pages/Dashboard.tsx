import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { portfolioService, subscriptionService } from '../services/apiService';
import { Portfolio } from '../types';
import {
  Calendar, Loader, MoreVertical, ExternalLink,
  Trash2, Edit3, BarChart3, Globe, Layers, Zap,
  Plus,  MousePointer2
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import ConnectDomainModal from '../components/ConnectDomainModal';

const Dashboard: React.FC<{ onNew: () => void; onEdit: (p: Portfolio) => void }> = ({ onNew, onEdit }) => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [connectDomainPortfolio, setConnectDomainPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    Promise.all([fetchPortfolios(), fetchSubscription()]);
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await subscriptionService.getSubscription();
      setSubscription(data);
    } catch (err) { console.error(err); }
  };

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getPortfolios();
      setPortfolios(data.portfolios || []);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await portfolioService.deletePortfolio(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
      toast.success('Project deleted');
    } catch (error: any) {
      toast.error('Could not delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConnectDomainClick = (p: Portfolio) => {
    // Plan validation
    const currentPlan = subscription?.planId?.toLowerCase() || 'starter';
    const canConnect = currentPlan === 'professional' || currentPlan === 'elite' || currentPlan === 'pro';

    if (!canConnect) {
      toast.error('Upgrade Required', {
        description: 'Custom domains are available on the Professional and Elite plans.',
        action: {
          label: 'View Plans',
          onClick: () => navigate('/plans')
        }
      });
      return;
    }

    setConnectDomainPortfolio(p);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader className="text-teal-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-4 pb-24 space-y-12">

        {/* ENHANCED RESPONSIVE HEADER */}
        <header className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900 leading-none">
              Your <span className="bg-clip-text">Portfolios</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md">
              You have <span className="text-slate-900 font-bold">{portfolios.length} projects</span> in your workshop.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Plan Status + Upgrade - now fully responsive */}
            <div className="flex items-center gap-4 px-4 py-3 bg-white/50 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm w-full sm:w-auto">
              <div className="sm:pr-4 sm:border-r sm:border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase italic leading-none">Status</p>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{subscription?.planId || 'Starter'}</p>
              </div>
              <Button 
                onClick={() => navigate('/plans')} 
                variant="ghost" 
                className="h-9 rounded-xl hover:bg-teal-50 text-teal-600 font-bold text-xs uppercase ml-auto sm:ml-0"
              >
                Upgrade <Zap className="w-3 h-3 ml-1 fill-current" />
              </Button>
            </div>

            {/* Create New Button - full width on mobile for better touch target */}
            <Button 
              onClick={onNew} 
              className="h-14 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/10 group transition-all duration-300 w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              <span className="font-bold tracking-tight">Create New</span>
            </Button>
          </div>
        </header>

        {/* Rest of the component remains unchanged */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {portfolios.map((p, idx) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:border-teal-500/30 overflow-hidden"
              >
                {/* Decorative Background Gradient */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors" />

                {/* Card Preview Area */}
                <div className="relative h-32 sm:h-44 w-full rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 mb-4 sm:mb-6 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-100/50 to-slate-200/20" />
                  <div className="relative z-10 w-12 sm:w-16 h-12 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Globe className="w-6 sm:w-8 h-6 sm:h-8 text-slate-300 group-hover:text-teal-500 transition-colors" />
                  </div>

                  {/* Floating Action Buttons */}
                  <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex gap-1 sm:gap-2 transition-all duration-300">
                    {p.subdomain && (
                      <a href={`https://${p.subdomain}.seeqme.com`} target="_blank" className="p-2 sm:p-3 backdrop-blur-sm rounded-lg sm:rounded-xl bg-teal-600 text-white transition-colors hover:bg-teal-700">
                        <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="px-2 sm:px-3 flex-1">
                  <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                    <Badge className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider flex-shrink-0 ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : p.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {p.status === 'completed' ? '• Published' : p.status === 'failed' ? '• Failed' : '• Draft'}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-slate-100 flex-shrink-0">
                          <MoreVertical className="w-3 sm:w-4 h-3 sm:h-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 sm:w-56 p-2 rounded-xl sm:rounded-2xl bg-white shadow-2xl">
                        <DropdownMenuItem onClick={() => onEdit(p)} className="flex gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl focus:bg-slate-50 cursor-pointer text-sm sm:text-base">
                          <Edit3 className="w-4 h-4 text-teal-600 flex-shrink-0" /> <span className="font-semibold">Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/portfolio/${p.id}/analytics`)} className="flex gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl focus:bg-slate-50 cursor-pointer text-sm sm:text-base">
                          <BarChart3 className="w-4 h-4 text-blue-600 flex-shrink-0" /> <span className="font-semibold">Analytics</span>
                        </DropdownMenuItem>
                        {p.status === 'completed' && !p.customDomain && (
                          <DropdownMenuItem onClick={() => handleConnectDomainClick(p)} className="flex gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl focus:bg-slate-50 cursor-pointer text-sm sm:text-base">
                            <Globe className="w-4 h-4 text-teal-600 flex-shrink-0" /> <span className="font-semibold">Connect Domain</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem onClick={() => setDeleteConfirm(p.id!)} className="flex gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl focus:bg-red-50 text-red-500 focus:text-red-500 cursor-pointer text-sm sm:text-base">
                          <Trash2 className="w-4 h-4 flex-shrink-0" /> <span className="font-semibold">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="text-base sm:text-xl font-black text-slate-900 mb-1 truncate group-hover:text-teal-600 transition-colors">
                    {p.name}
                  </h3>

                  <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400 text-[11px] sm:text-xs font-semibold mb-4 sm:mb-6 truncate">
                    <MousePointer2 className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{p.customDomain || (p.subdomain ? `${p.subdomain}.seeqme.com` : 'No domain assigned')}</span>
                  </div>

                  {/* QUICK STATS */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 py-3 sm:py-4 border-t border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Created</p>
                      <div className="flex items-center gap-1 text-slate-700 font-bold text-[11px] sm:text-xs">
                        <Calendar className="w-3 h-3 text-teal-500 flex-shrink-0" />
                        {new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 flex gap-2">
                  <Button 
                    onClick={() => onEdit(p)} 
                    className="flex-1 h-9 sm:h-12 rounded-lg sm:rounded-2xl bg-teal-500 text-white border border-teal-600 font-bold text-[11px] sm:text-xs uppercase tracking-widest hover:bg-teal-600 transition-all"
                  >
                    Customise
                  </Button>
                  
                  {p.customDomain && (
                    <a 
                      href={`https://${p.customDomain}`} 
                      target="_blank" 
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 h-9 sm:h-12 rounded-lg sm:rounded-2xl bg-teal-600 text-white font-bold text-[11px] sm:text-xs uppercase tracking-widest hover:bg-teal-700 transition-all"
                    >
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* EMPTY STATE */}
          {portfolios.length === 0 && (
            <div className="col-span-full py-12 sm:py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-[3rem] bg-slate-50/50">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 sm:w-24 h-16 sm:h-24 bg-white rounded-xl sm:rounded-[2rem] shadow-2xl flex items-center justify-center relative z-10">
                  <Layers className="w-8 sm:w-10 h-8 sm:h-10 text-teal-500 animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full" />
              </div>
              <h2 className="text-sm sm:text-base text-slate-900 mb-3 sm:mb-4">Your canvas is empty</h2>

              <Button 
                onClick={onNew} 
                size="lg" 
                className="h-10 sm:h-14 px-6 sm:px-10 rounded-lg sm:rounded-2xl bg-teal-600 text-white text-sm sm:text-base font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
              >
                Launch Portfolio
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-900/40">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-6 sm:p-10 rounded-xl sm:rounded-[2.5rem] border border-slate-200 max-w-md w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)]"
            >
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-red-50 rounded-lg sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Trash2 className="w-6 sm:w-8 h-6 sm:h-8 text-red-500" />
              </div>
              <h4 className="text-lg sm:text-2xl font-black text-slate-900 mb-2">Delete Project?</h4>
              <p className="text-sm sm:text-base text-slate-500 font-medium mb-6 sm:mb-8 leading-relaxed">
                This will permanently erase <span className="font-bold text-slate-900">all assets</span> and your public URL. This action is irreversible.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setDeleteConfirm(null)} 
                  className="flex-1 h-10 sm:h-14 rounded-lg sm:rounded-2xl font-bold text-slate-500 hover:bg-slate-100 text-sm sm:text-base"
                >
                  Keep Project
                </Button>
                <Button 
                  onClick={() => handleDelete(deleteConfirm)} 
                  className="flex-1 h-10 sm:h-14 rounded-lg sm:rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 text-sm sm:text-base"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <ConnectDomainModal
        isOpen={!!connectDomainPortfolio}
        onClose={() => setConnectDomainPortfolio(null)}
        portfolioId={connectDomainPortfolio?.id || ''}
        portfolioName={connectDomainPortfolio?.name || 'Your Project'}
        onSuccess={fetchPortfolios}
      />
    </DashboardLayout>
  );
};

export default React.memo(Dashboard);