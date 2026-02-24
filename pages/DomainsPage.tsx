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
import { Helmet } from 'react-helmet-async';
// Validate domain format
const validateDomain = (domain: string): { valid: boolean; error?: string } => {
    if (!domain || domain.trim() === '') {
        return { valid: false, error: 'Domain is required' };
    }

    const trimmedDomain = domain.trim().toLowerCase();

    // Check for www prefix
    if (trimmedDomain.startsWith('www.')) {
        return { valid: false, error: 'Enter domain without www prefix (e.g., example.com)' };
    }

    // Check for protocol prefix
    if (trimmedDomain.startsWith('http://') || trimmedDomain.startsWith('https://')) {
        return { valid: false, error: 'Enter domain without http:// or https://' };
    }

    // Valid domain pattern: alphanumeric + hyphens, followed by TLD
    const domainPattern = /^(?!-)(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!domainPattern.test(trimmedDomain)) {
        return { valid: false, error: 'Invalid domain format (e.g., example.com or sub.example.com)' };
    }

    // Check for valid TLD length (at least 2 characters)
    const parts = trimmedDomain.split('.');
    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
        return { valid: false, error: 'Invalid top-level domain' };
    }

    return { valid: true };
};

const DomainsPage: React.FC = () => {
    const [domains, setDomains] = useState<any[]>([]);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newDomain, setNewDomain] = useState('');
    const [domainError, setDomainError] = useState<string | null>(null);
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

        // Validate domain format before submission
        const validation = validateDomain(newDomain);
        if (!validation.valid) {
            setDomainError(validation.error || 'Invalid domain');
            toast.error(validation.error || 'Invalid domain format');
            return;
        }

        setDomainError(null);

        try {
            setIsAdding(true);
            const portfolioId = selectedPortfolioId === 'none' ? '' : selectedPortfolioId;
            const cleanDomain = newDomain.trim().toLowerCase();
            const domain = await domainService.createDomain(cleanDomain, portfolioId);

            // Determine if this is a custom domain (not a seeqme.com subdomain)
            const isCustomDomain = !cleanDomain.endsWith('.seeqme.com') && !cleanDomain.includes('seeqme.com');

            if (isCustomDomain) {
                // Always show DNS setup modal for custom domains - they MUST configure DNS
                toast.success('Domain added! Please configure your DNS records.');
                setNewDomain('');
                setSelectedPortfolioId('none');
                await fetchData();
                // Force open the DNS setup modal with the created domain
                setSetupModalDomain({ ...domain, isCustom: true });
                setIsPolling(true);  // Start polling for verification
            } else {
                // Subdomain - no DNS setup needed
                toast.success('Subdomain added successfully!');
                setNewDomain('');
                setSelectedPortfolioId('none');
                await fetchData();
            }
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
            <Helmet>
                <title>Domain Management - SeeqMe AI</title>
                <meta name="description" content="Connect and manage custom domains for your portfolios on SeeqMe AI. Ensure your projects are accessible via your own branding." />
                <meta property="og:title" content="Domain Management - SeeqMe AI" />
                <meta property="og:description" content="Connect and manage custom domains for your portfolios on SeeqMe AI. Ensure your projects are accessible via your own branding." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://seeqme.com/domains" />
            </Helmet>
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 py-12">

                    {/* Header Section */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-3">
                            <Globe className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Domains</h1>
                        </div>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">Connect custom domains and manage your online presence</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* Sidebar: Add Domain Form */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-8">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-teal-600" />
                                    Add New Domain
                                </h2>
                                <form onSubmit={handleAddDomain} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Domain Name</Label>
                                        <Input
                                            placeholder="example.com"
                                            value={newDomain}
                                            onChange={(e) => {
                                                setNewDomain(e.target.value);
                                                if (domainError) setDomainError(null);
                                            }}
                                            className={`bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-500/50 h-11 rounded-lg ${domainError ? 'border-red-500 dark:border-red-500' : ''}`}
                                        />
                                        {domainError && (
                                            <p className="text-red-500 dark:text-red-400 text-sm flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                {domainError}
                                            </p>
                                        )}
                                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">e.g., yourdomain.com</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Link to Portfolio</Label>
                                        <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
                                            <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 h-11 rounded-lg">
                                                <SelectValue placeholder="Select a portfolio" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Portfolio</SelectItem>
                                                {portfolios.map(p => (
                                                    <SelectItem key={p.id} value={p.id!}>{p.title || p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Optional - Link your portfolio later</p>
                                    </div>

                                    <Button
                                        disabled={isAdding}
                                        className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold h-11 rounded-lg transition-all shadow-md"
                                    >
                                        {isAdding ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin mr-2" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Connect Domain
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Main Content: Domains List */}
                        <div className="lg:col-span-2">
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="h-80 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                        <Loader className="w-10 h-10 text-teal-500 animate-spin mb-3" />
                                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading domains...</p>
                                    </div>
                                ) : domains.length === 0 ? (
                                    <div className="h-80 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center p-8">
                                        <Globe className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4" />
                                        <p className="text-zinc-600 dark:text-zinc-400 font-medium text-lg">No domains connected yet</p>
                                        <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">Add your first domain on the left to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {domains.map((domain) => (
                                            <motion.div
                                                key={domain.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:border-teal-500/50 dark:hover:border-teal-500/30 transition-all shadow-sm hover:shadow-md"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    {/* Domain Info */}
                                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                                        <div className={`p-3 rounded-lg shrink-0 ${domain.isVerified ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'}`}>
                                                            <Globe className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                                <span className="text-lg font-bold text-zinc-900 dark:text-white truncate font-mono">{domain.domain}</span>
                                                                {domain.isVerified ? (
                                                                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                                                        <Check className="w-3.5 h-3.5" />
                                                                        Active
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                                        Pending Setup
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                                                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                                                    <span className="font-medium">Portfolio:</span>
                                                                    <Select
                                                                        disabled={isUpdating === domain.id}
                                                                        defaultValue={domain.portfolioId || 'none'}
                                                                        onValueChange={(val) => handleUpdateDomainPortfolio(domain.id, val === 'none' ? '' : val)}
                                                                    >
                                                                        <SelectTrigger className="h-8 w-auto bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-xs rounded-md">
                                                                            <SelectValue placeholder="Select" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="none">Unlinked</SelectItem>
                                                                            {portfolios.map((p) => (
                                                                                <SelectItem key={p.id} value={p.id!}>
                                                                                    {p.title || p.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
                                                                <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                                                                    {domain.isCustom ? '🔗 Custom Domain' : '📌 Subdomain'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center gap-2 justify-end">
                                                        {!domain.isVerified && domain.isCustom && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSetupModalDomain(domain)}
                                                                className="text-sm border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-lg"
                                                            >
                                                                <ShieldCheck className="w-4 h-4 mr-1.5" />
                                                                Verify
                                                            </Button>
                                                        )}
                                                        {domain.isVerified && (
                                                            <a
                                                                href={`https://${domain.domain}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                                title="Visit domain"
                                                            >
                                                                <ExternalLink className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeleteConfirmId(domain.id)}
                                                            className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DNS Setup Modal */}
            <AnimatePresence>
                {setupModalDomain && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setSetupModalDomain(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-200"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Verify Domain</h3>
                                    <p className="text-teal-100 text-sm mt-1">Configure DNS records to activate {setupModalDomain.domain}</p>
                                </div>
                                <button
                                    onClick={() => setSetupModalDomain(null)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            <div className="p-8">
                                {/* Info Alert */}
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-8 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900 mb-1">How to Configure</p>
                                        <p className="text-xs text-blue-800 leading-relaxed">
                                            Log in to your domain registrar (GoDaddy, Namecheap, etc.) and add the DNS record below.
                                            DNS changes can take up to 24 hours to propagate.
                                        </p>
                                    </div>
                                </div>

                                {/* DNS Records Table */}
                                <div className="mb-8">
                                    <h4 className="text-sm font-bold text-zinc-600 mb-4 uppercase tracking-wider">
                                        Add this DNS record:
                                    </h4>
                                    <div className="bg-zinc-50 rounded-xl overflow-hidden border border-zinc-200">
                                        <div className="grid grid-cols-12 gap-4 p-4 bg-zinc-100 border-b border-zinc-200">
                                            <div className="col-span-2 font-bold text-xs uppercase tracking-wider text-zinc-600">Type</div>
                                            <div className="col-span-4 font-bold text-xs uppercase tracking-wider text-zinc-600">Name/Host</div>
                                            <div className="col-span-6 font-bold text-xs uppercase tracking-wider text-zinc-600">Value</div>
                                        </div>
                                        <div className="grid grid-cols-12 gap-4 p-5 items-center">
                                            <div className="col-span-2 font-mono font-bold text-lg text-teal-600">
                                                {isRootDomain(setupModalDomain.domain) ? 'A' : 'CNAME'}
                                            </div>
                                            <div className="col-span-4 font-mono text-sm font-semibold text-zinc-900">
                                                {isRootDomain(setupModalDomain.domain) ? '@' : setupModalDomain.domain.split('.')[0]}
                                            </div>
                                            <div className="col-span-6 flex items-center gap-3">
                                                <code className="font-mono text-sm bg-white px-3 py-2 rounded-lg text-zinc-900 font-semibold flex-1 overflow-x-auto">
                                                    {isRootDomain(setupModalDomain.domain) ? '172.66.44.17' : `portfolio-${setupModalDomain.portfolioId || 'id'}.pages.dev`}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        const val = isRootDomain(setupModalDomain.domain) ? '172.66.44.17' : `portfolio-${setupModalDomain.portfolioId || 'id'}.pages.dev`;
                                                        navigator.clipboard.writeText(val);
                                                        toast.success('Copied to clipboard!');
                                                    }}
                                                    className="p-2 hover:bg-zinc-200 rounded-lg transition-colors flex-shrink-0"
                                                    title="Copy to clipboard"
                                                >
                                                    <Copy className="w-5 h-5 text-zinc-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8">
                                    <p className="text-sm text-amber-900">
                                        <strong>Tip:</strong> After adding the DNS record, it may take a few minutes to a few hours for verification to complete.
                                        Click the button below to check the status.
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setSetupModalDomain(null)}
                                        variant="outline"
                                        className="flex-1 h-11 rounded-lg border-zinc-300"
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (isPolling) {
                                                setIsPolling(false);
                                                toast.success('Stopped polling for verification');
                                            } else {
                                                setIsPolling(true);
                                                toast.success('Checking DNS propagation...');
                                            }
                                        }}
                                        disabled={isVerifying === setupModalDomain.id}
                                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold h-11 rounded-lg transition-all"
                                    >
                                        {isPolling || isVerifying === setupModalDomain.id ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin mr-2" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-4 h-4 mr-2" />
                                                Verify Domain
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
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
