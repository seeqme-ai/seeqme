import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Globe, Plus, X, Trash2, AlertCircle, Loader,
    Check, Copy, ExternalLink, ShieldCheck, ChevronRight, Search
} from 'lucide-react';

import DashboardLayout from '../components/DashboardLayout';
import { domainService, portfolioService } from '../services/apiService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Portfolio } from '../types';
import { ConfirmModal } from '../components/ui/ConfirmModal';
const DomainsPage: React.FC = () => {
    const [domains, setDomains] = useState<any[]>([]);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newDomain, setNewDomain] = useState('');
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('none');
    const [setupModalDomain, setSetupModalDomain] = useState<any | null>(null);
    const [isVerifying, setIsVerifying] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    // Polling logic for domain verification
    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        if (isPolling && setupModalDomain) {
            pollInterval = setInterval(async () => {
                try {
                    const result = await domainService.verifyDomain(setupModalDomain.id);
                    if (result.verified) {
                        toast.success('Domain verified and live!');
                        setIsPolling(false);
                        setSetupModalDomain(null);
                        fetchData();
                    }
                } catch (error) {
                    // Silently continue polling
                }
            }, 5000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [isPolling, setupModalDomain]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [domainsData, portfoliosData] = await Promise.all([
                domainService.getDomains(),
                portfolioService.getPortfolios()
            ]);
            setDomains(domainsData.domains || []);
            setPortfolios(portfoliosData.portfolios || []);
        } catch (error) {
            toast.error('Failed to load domains');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomain) return;
        try {
            setIsAdding(true);
            const portfolioId = selectedPortfolioId === 'none' ? '' : selectedPortfolioId;
            const domain = await domainService.createDomain(newDomain.toLowerCase(), portfolioId);
            toast.success('Domain added successfully');
            setNewDomain('');
            setSelectedPortfolioId('none');
            await fetchData();
            if (domain.isCustom) setSetupModalDomain(domain);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to add domain');
        } finally {
            setIsAdding(false);
        }
    };

    const handleVerify = async (id: string) => {
        try {
            setIsVerifying(id);
            const result = await domainService.verifyDomain(id);
            if (result.verified) {
                toast.success('Domain verification successful!');
                fetchData();
                setSetupModalDomain(null);
            } else {
                toast.error('Not verified yet. DNS changes can take up to 24 hours to propagate.');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Verification failed. Check DNS propagation.');
        } finally {
            setIsVerifying(null);
        }
    };

    const handleUpdateDomainPortfolio = async (domainId: string, portfolioId: string) => {
        try {
            setIsUpdating(domainId);
            await domainService.updateDomain(domainId, portfolioId);
            toast.success('Domain linked successfully');
            await fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update domain');
        } finally {
            setIsUpdating(null);
        }
    };

    const isRootDomain = (domain: string) => {
        const parts = domain.split('.');
        return parts.length === 2;
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-6 py-10">

                    {/* Minimal Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Domains</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your Custom Domains</p>
                        </div>

                    </header>

                    <div className="grid lg:grid-cols-12 gap-10">

                        {/* Action Card: Add Domain */}
                        <aside className="lg:col-span-4 order-last lg:order-first">
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl sticky top-8">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Add Domain</h2>
                                <form onSubmit={handleAddDomain} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Domain URL</Label>
                                        <Input
                                            placeholder="yourdomain.com"
                                            value={newDomain}
                                            onChange={(e) => setNewDomain(e.target.value)}
                                            className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-teal-500 dark:focus:ring-teal-500/50 h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Link to Project</Label>
                                        <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
                                            <SelectTrigger className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 h-11">
                                                <SelectValue placeholder="Select project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None (Parked)</SelectItem>
                                                {portfolios.map(p => (
                                                    <SelectItem key={p.id} value={p.id!}>{p.title || p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        disabled={isAdding}
                                        className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white font-bold h-11 rounded-xl transition-all shadow-lg shadow-teal-600/10"
                                    >
                                        {isAdding ? <Loader className="w-4 h-4 animate-spin" /> : 'Connect Domain'}
                                    </Button>
                                </form>
                            </div>
                        </aside>

                        {/* List Section */}
                        <main className="lg:col-span-8">
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                        <Loader className="text-teal-500 animate-spin mb-2" />
                                        <span className="text-sm text-zinc-400">Loading...</span>
                                    </div>
                                ) : domains.length === 0 ? (
                                    <div className="h-64 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center p-8">
                                        <Globe className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-4" />
                                        <p className="text-zinc-500 dark:text-zinc-400">No domains found. Start by adding one on the left.</p>
                                    </div>
                                ) : (
                                    domains.map((domain) => (
                                        <div
                                            key={domain.id}
                                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-teal-500/50 dark:hover:border-teal-500/30 transition-all shadow-sm"
                                        >
                                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                                <div className={`p-3 rounded-xl shrink-0 ${domain.isVerified ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                                    <Globe className="w-6 h-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-bold text-zinc-900 dark:text-white truncate tracking-tight">{domain.domain}</span>
                                                        {domain.isVerified ? (
                                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                                                                <Check className="w-3 h-3" /> Live
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-black uppercase tracking-tighter bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                                                Link:
                                                            </p>
                                                            <Select
                                                                disabled={isUpdating === domain.id}
                                                                defaultValue={domain.portfolioId || 'none'}
                                                                onValueChange={(val) => handleUpdateDomainPortfolio(domain.id, val === 'none' ? '' : val)}
                                                            >
                                                                <SelectTrigger className="h-6 min-w-[100px] bg-zinc-100 dark:bg-zinc-800 border-none text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 focus:ring-0">
                                                                    <SelectValue placeholder="Do not link" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">Do not link</SelectItem>
                                                                    {portfolios.map((p) => (
                                                                        <SelectItem key={p.id} value={p.id!}>
                                                                            {p.title || p.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <span className="text-zinc-200 dark:text-zinc-800 hidden md:inline">•</span>
                                                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                                            {domain.isCustom ? 'Custom Domain' : 'Subdomain'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                                                {!domain.isVerified && domain.isCustom && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSetupModalDomain(domain)}
                                                        className="text-xs border-zinc-200 dark:border-zinc-700 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                                                    >
                                                        Setup DNS
                                                    </Button>
                                                )}
                                                {domain.isVerified && (
                                                    <a
                                                        href={`https://${domain.domain}`}
                                                        target="_blank"
                                                        className="p-2 text-zinc-400 hover:text-teal-500 transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteConfirmId(domain.id)}
                                                    className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {/* Modern Compact Modal */}
            <AnimatePresence>
                {setupModalDomain && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
                            onClick={() => setSetupModalDomain(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">DNS Configuration</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Update your records to point to our servers.</p>
                                </div>
                                <button onClick={() => setSetupModalDomain(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50 p-4 rounded-xl mb-8 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed font-medium">
                                    Log in to your registrar (like GoDaddy or Namecheap) and add the following record.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                                    <div className="col-span-2">Type</div>
                                    <div className="col-span-3">Host</div>
                                    <div className="col-span-7 text-right px-2">Value</div>
                                </div>

                                <div className="grid grid-cols-12 gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl items-center">
                                    <div className="col-span-2 font-mono font-bold text-teal-600">
                                        {isRootDomain(setupModalDomain.domain) ? 'A' : 'CNAME'}
                                    </div>
                                    <div className="col-span-3 font-mono text-zinc-600 dark:text-zinc-400">
                                        {isRootDomain(setupModalDomain.domain) ? '@' : setupModalDomain.domain.split('.')[0]}
                                    </div>
                                    <div className="col-span-7 flex items-center justify-end gap-3 overflow-hidden">
                                        <span className="font-mono text-sm text-zinc-900 dark:text-white truncate">
                                            {isRootDomain(setupModalDomain.domain) ? '172.66.44.17' : `portfolio-${setupModalDomain.portfolioId || 'id'}.pages.dev`}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const val = isRootDomain(setupModalDomain.domain) ? '172.66.44.17' : `portfolio-${setupModalDomain.portfolioId || 'id'}.pages.dev`;
                                                navigator.clipboard.writeText(val);
                                                toast.success('Copied to clipboard');
                                            }}
                                            className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsPolling(true)}
                                disabled={isPolling || isVerifying === setupModalDomain.id}
                                className="w-full mt-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold h-12 rounded-xl"
                            >
                                {isPolling || isVerifying === setupModalDomain.id ? (
                                    <><Loader className="w-4 h-4 animate-spin mr-2" /> Verifying...</>
                                ) : (
                                    'Verify Connection'
                                )}
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={deleteConfirmId !== null}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={async () => {
                    if (!deleteConfirmId) return;
                    setIsDeleting(true);
                    try {
                        await domainService.deleteDomain(deleteConfirmId);
                        toast.success('Domain removed');
                        fetchData();
                    } finally {
                        setIsDeleting(false);
                        setDeleteConfirmId(null);
                    }
                }}
                title="Remove Domain?"
                description="This will permanently remove this domain from your account. This action is irreversible."
                confirmText="Remove"
                cancelText="Keep Domain"
                isDestructive
                isLoading={isDeleting}
            />
        </DashboardLayout>
    );
};

export default DomainsPage;