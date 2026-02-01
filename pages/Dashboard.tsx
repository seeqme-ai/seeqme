import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { portfolioService, subscriptionService } from '../services/apiService';
import { Portfolio } from '../types';
import {
  Calendar, Loader, MoreVertical, ExternalLink,
  Trash2, Edit3, BarChart3, Globe, Layers, Zap,
  Plus, ArrowUpRight, Activity, MousePointer2
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

const Dashboard: React.FC<{ onNew: () => void; onEdit: (p: Portfolio) => void }> = ({ onNew, onEdit }) => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

        {/* ENHANCED HEADER */}
        <header className="relative flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-3">
           
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-none">
              Your <span className="bg-clip-text">Portfolios</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md">
              You have <span className="text-slate-900 font-bold">{portfolios.length} projects</span> in your workshop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="hidden sm:flex items-center gap-4 p-1.5 pl-4 bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm">

              <div className="pr-4 border-r border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase italic leading-none">Status</p>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{subscription?.planId || 'Starter'}</p>
              </div>
              <Button onClick={() => navigate('/plans')} variant="ghost" className="h-9 rounded-xl hover:bg-teal-50 text-teal-600 font-bold text-xs uppercase">
                Upgrade <Zap className="w-3 h-3 ml-1 fill-current" />
              </Button>
            </div>

            <Button onClick={onNew} className="h-14 px-8 rounded-2xl bg-teal-600 hover:bg-teal-600 text-white shadow-2xl shadow-slate-900/20 group transition-all duration-300">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              <span className="font-bold tracking-tight">Create New</span>
            </Button>
          </div>
        </header>


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
                className="group relative flex flex-col bg-white border border-slate-200 rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:border-teal-500/30 overflow-hidden"
              >
                {/* Decorative Background Gradient */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors" />

                {/* Card Preview Area */}
                <div className="relative h-44 w-full rounded-[1.8rem] bg-slate-50 border border-slate-100 mb-6 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-100/50 to-slate-200/20" />
                  <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Globe className="w-8 h-8 text-slate-300 group-hover:text-teal-500 transition-colors" />
                  </div>

                  {/* Floating Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex gap-2 transition-all duration-300">
                    {p.subdomain && (
                      <a href={`https://${p.subdomain}.seeqme.com`} target="_blank" className="p-3 backdrop-blur-sm rounded-xl bg-teal-600 text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="px-3 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider ${p.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : p.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {p.status === 'published' ? '• Published' : p.status === 'failed' ? '• Failed' : '• Draft'}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl bg-white shadow-2xl">
                        <DropdownMenuItem onClick={() => onEdit(p)} className="flex gap-3 p-3 rounded-xl focus:bg-slate-50 cursor-pointer">
                          <Edit3 className="w-4 h-4 text-teal-600" /> <span className="font-semibold">Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/portfolio/${p.id}/analytics`)} className="flex gap-3 p-3 rounded-xl focus:bg-slate-50 cursor-pointer">
                          <BarChart3 className="w-4 h-4 text-blue-600" /> <span className="font-semibold">Analytics</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem onClick={() => setDeleteConfirm(p.id!)} className="flex gap-3 p-3 rounded-xl focus:bg-red-50 text-red-500 focus:text-red-500 cursor-pointer">
                          <Trash2 className="w-4 h-4" /> <span className="font-semibold">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-1 truncate group-hover:text-teal-600 transition-colors">
                    {p.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-6">
                    <MousePointer2 className="w-3 h-3" />
                    <span>{p.subdomain ? `${p.subdomain}.seeqme.com` : 'No domain assigned'}</span>
                  </div>

                  {/* SUBSTANCE: QUICK STATS */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Created</p>
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        {new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={() => onEdit(p)} className="flex-1 h-12 rounded-2xl bg-teal-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Customise
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* CREATIVE EMPTY STATE */}
          {portfolios.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center relative z-10">
                  <Layers className="w-10 h-10 text-teal-500 animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full" />
              </div>
              <h2 className="text-base text-slate-900 mb-3">Your canvas is empty</h2>

              <Button onClick={onNew} size="lg" className="h-14 px-10 rounded-2xl bg-teal-600 text-white font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all">
                Launch Portfolio
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* REFINED DELETE MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-200 max-w-md w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)]"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">Delete Project?</h4>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                This will permanently erase <span className="font-bold text-slate-900">all assets</span> and your public URL. This action is irreversible.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-100">
                  Keep Project
                </Button>
                <Button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-14 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20">
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default React.memo(Dashboard);