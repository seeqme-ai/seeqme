import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Globe, Plus, Trash2, ExternalLink, ShieldCheck, AlertCircle, Loader, Check, Copy } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { domainService, portfolioService } from '../services/apiService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Portfolio } from '../types';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const DomainsPage: React.FC = () => {
    const [domains, setDomains] = useState<any[]>([]);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newDomain, setNewDomain] = useState('');
    const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
    const [isVerifying, setIsVerifying] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

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
            toast.error('Failed to load domain data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomain || !selectedPortfolioId) {
            toast.error('Please provide a domain and select a project');
            return;
        }

        try {
            setIsAdding(true);
            await domainService.createDomain(newDomain.toLowerCase(), selectedPortfolioId);
            toast.success('Domain linked. Follow the setup guide to verify.');
            setNewDomain('');
            setSelectedPortfolioId('');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to link domain');
        } finally {
            setIsAdding(false);
        }
    };

    const handleVerify = async (id: string) => {
        try {
            setIsVerifying(id);
            await domainService.verifyDomain(id);
            toast.success('Domain verification successful!');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Verification failed. Check DNS propagation.');
        } finally {
            setIsVerifying(null);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;

        try {
            setIsDeleting(true);
            await domainService.deleteDomain(deleteConfirmId);
            toast.success('Domain disconnected');
            fetchData();
        } catch (error) {
            toast.error('Failed to disconnect domain');
        } finally {
            setIsDeleting(false);
            setDeleteConfirmId(null);
        }
    };

    const copyToClipboard = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
        toast.success('Copied to clipboard');
    };

    const isRootDomain = (domain: string) => {
        const parts = domain.split('.');
        return parts.length === 2;
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12 pb-20 text-left">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">Custom Domains</h1>
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
                            Power your brand with unique web identity
                        </p>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Setup Guide & List */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* 3-Step Guide */}
                        <section className="bg-teal-500/5 border border-teal-500/10 rounded-[2.5rem] p-10">
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                Domain Setup Guide
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                                        <h3 className="font-bold text-sm uppercase tracking-wider">Connect</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Enter your domain name and link it to a project in the sidebar.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                                        <h3 className="font-bold text-sm uppercase tracking-wider">Configure DNS</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Update your DNS records at your registrar with the values provided.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                                        <h3 className="font-bold text-sm uppercase tracking-wider">Verify</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Wait 5-10 mins for propagation, then click "Verify DNS" to go live.</p>
                                </div>
                            </div>
                        </section>

                        <div className="space-y-6">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <Globe className="w-6 h-6 text-teal-600" />
                                Active Domains
                            </h2>

                            {loading ? (
                                <div className="py-20 flex justify-center">
                                    <Loader className="animate-spin text-teal-500 w-10 h-10" />
                                </div>
                            ) : domains.length === 0 ? (
                                <div className="bg-card border-2 border-dashed border-border rounded-[2.5rem] p-24 flex flex-col items-center opacity-40 text-center">
                                    <Globe className="w-16 h-16 mb-4 text-muted-foreground" />
                                    <p className="text-lg font-bold text-muted-foreground mb-2">No custom domains found</p>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Connect your first domain in the sidebar</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {domains.map((domain) => (
                                        <motion.div
                                            key={domain.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-card border border-border rounded-[2rem] overflow-hidden group hover:border-teal-500/30 transition-all shadow-sm"
                                        >
                                            <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border bg-muted/20">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm 
                                                        ${domain.isVerified ? 'bg-teal-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                        <Globe className="w-7 h-7" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-xl font-black tracking-tight">{domain.domain}</h3>
                                                            {domain.isVerified && (
                                                                <a href={`https://${domain.domain}`} target="_blank" rel="noopener" className="p-2 bg-background border border-border rounded-lg hover:text-teal-500 transition-colors">
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-1">
                                                            Project: <span className="text-foreground">{domain.portfolioName || 'My Portfolio'}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {!domain.isVerified && (
                                                        <Button
                                                            onClick={() => handleVerify(domain.id)}
                                                            disabled={isVerifying === domain.id}
                                                            className="h-12 px-8 bg-amber-500 text-white hover:bg-black rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
                                                        >
                                                            {isVerifying === domain.id ? <Loader className="w-4 h-4 animate-spin" /> : 'Verify DNS Status'}
                                                        </Button>
                                                    )}
                                                    {domain.isVerified && (
                                                        <div className="flex items-center gap-3 px-6 py-3 bg-teal-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-500/20">
                                                            <ShieldCheck className="w-4 h-4" />
                                                            Live & Valid
                                                        </div>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(domain.id)}
                                                        className="h-12 w-12 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl border border-border"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {!domain.isVerified && (
                                                <div className="p-8 space-y-6">
                                                    <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Technical Configuration
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div className="space-y-3">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</p>
                                                            <div className="p-4 bg-muted/50 rounded-xl border border-border font-mono text-sm font-bold flex justify-between items-center group/item">
                                                                <span>{isRootDomain(domain.domain) ? 'A Record' : 'CNAME'}</span>
                                                                <button onClick={() => copyToClipboard(isRootDomain(domain.domain) ? 'A' : 'CNAME', `type-${domain.id}`)} className="text-muted-foreground hover:text-teal-500">
                                                                    {copiedField === `type-${domain.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Host / Name</p>
                                                            <div className="p-4 bg-muted/50 rounded-xl border border-border font-mono text-sm font-bold flex justify-between items-center group/item">
                                                                <span>{isRootDomain(domain.domain) ? '@' : domain.domain.split('.')[0]}</span>
                                                                <button onClick={() => copyToClipboard(isRootDomain(domain.domain) ? '@' : domain.domain.split('.')[0], `host-${domain.id}`)} className="text-muted-foreground hover:text-teal-500">
                                                                    {copiedField === `host-${domain.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2 space-y-3">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Value / Points To</p>
                                                            <div className="p-4 bg-muted/50 rounded-xl border border-border font-mono text-sm font-bold flex justify-between items-center group/item">
                                                                <span className="truncate mr-4">
                                                                    {isRootDomain(domain.domain) ? '172.66.44.17' : `portfolio-${domain.portfolioID}.pages.dev`}
                                                                </span>
                                                                <button onClick={() => copyToClipboard(isRootDomain(domain.domain) ? '172.66.44.17' : `portfolio-${domain.portfolioID}.pages.dev`, `val-${domain.id}`)} className="text-muted-foreground hover:text-teal-500 shrink-0">
                                                                    {copiedField === `val-${domain.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Connect Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="border-border bg-card shadow-xl rounded-[2.5rem] sticky top-24 overflow-hidden">
                            <div className="bg-teal-600 p-8 text-white">
                                <h2 className="text-2xl font-black tracking-tight mb-2">Connect New</h2>
                                <p className="text-teal-100 text-xs font-semibold uppercase tracking-widest opacity-80">Link your own domain name</p>
                            </div>
                            <CardContent className="p-8">
                                <form onSubmit={handleAddDomain} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Domain Name</Label>
                                            <Input
                                                placeholder="e.g. portfolio.com"
                                                value={newDomain}
                                                onChange={(e) => setNewDomain(e.target.value)}
                                                className="bg-muted/50 border-border rounded-xl p-6 h-14 font-black text-sm focus:ring-teal-500 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Target Project</Label>
                                            <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
                                                <SelectTrigger className="w-full bg-muted/50 border border-border rounded-xl p-4 h-14 font-bold text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                                                    <SelectValue placeholder="Identify Project..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-card border-border rounded-xl">
                                                    {portfolios.map(p => (
                                                        <SelectItem key={p.id} value={p.id || ''} className="font-bold text-sm py-3">{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-15 bg-black text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-teal-600 shadow-2xl transition-all active:scale-95 py-6 group"
                                        disabled={isAdding}
                                    >
                                        {isAdding ? <Loader className="w-5 h-5 animate-spin" /> : <><Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" /> Connect Domain</>}
                                    </Button>
                                </form>

                                <div className="mt-8 pt-8 border-t border-border space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Why custom domains?</h4>
                                    <ul className="space-y-3">
                                        {[
                                            'Premium brand perception',
                                            'Improved SEO rankings',
                                            'Custom email support',
                                            'Permanent web identity'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs font-semibold text-foreground/70">
                                                <div className="w-1 h-1 rounded-full bg-teal-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteConfirmId !== null}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={confirmDelete}
                title="Disconnect Domain?"
                description="This will immediately remove your custom domain from the global edge network. Your site will revert to its original Seeqme subdomain."
                confirmText="Disconnect Now"
                cancelText="Keep My Domain"
                isDestructive
                isLoading={isDeleting}
                variant="danger"
            />
        </DashboardLayout>
    );
};

export default React.memo(DomainsPage);
