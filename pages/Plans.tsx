import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ICONS } from '../constants';
import { configService, subscriptionService } from '../services/apiService';
import { usePaystackPayment } from 'react-paystack';
import { useAuth } from '../context/auth-context';
import { toast } from 'sonner';
import { Loader, Check, X as XIcon, Zap, Globe, BarChart3, Shield, Headphones, Code2 } from 'lucide-react';
import { PAYSTACK_PUBLIC_KEY } from '../lib/env';
import DeploymentPaymentModal from '../components/DeploymentPaymentModal';

const MotionDiv = motion.div as any;

interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: { usd: number; ngn: number };
  features: { text: string; included: boolean }[];
  recommended?: boolean;
  cta: string;
  limits: { portfolios: number; customDomain: boolean };
}

interface RawPricingPlan {
  id?: string;
  name?: string;
  tagline?: string;
  price?: { usd?: number; ngn?: number };
  features?: string[] | { text?: string; included?: boolean }[];
  recommended?: boolean;
  cta?: string;
  limits?: { portfolios?: number; customDomain?: boolean };
}

const FREE_PLAN: Plan = {
  id: 'free',
  name: 'Free',
  tagline: 'Build your identity. Enter the mesh.',
  price: { usd: 0, ngn: 0 },
  cta: 'Get started free',
  features: [
    { text: '1 portfolio (draft only)', included: true },
    { text: 'AI-generated copy & design', included: true },
    { text: 'All template styles', included: true },
    { text: 'Browse the mesh', included: true },
    { text: 'Publish to seeqme.com', included: false },
    { text: 'Mesh node — discoverable', included: false },
    { text: 'Custom domain', included: false },
    { text: 'Visitor analytics', included: false },
  ],
  limits: { portfolios: 1, customDomain: false },
};

const DEFAULT_PAID_PLANS: Plan[] = [
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Live portfolio + full mesh presence.',
    price: { usd: 3, ngn: 2000 },
    recommended: true,
    cta: 'Start Pro',
    features: [
      { text: '1 published portfolio', included: true },
      { text: 'AI-generated copy & design', included: true },
      { text: 'All template styles', included: true },
      { text: 'Mesh node — fully discoverable', included: true },
      { text: 'Published on seeqme.com', included: true },
      { text: 'Custom domain + SSL', included: true },
      { text: 'SEO + Google indexing', included: true },
      { text: 'Visitor analytics', included: false },
    ],
    limits: { portfolios: 1, customDomain: true },
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Maximum visibility across the mesh.',
    price: { usd: 5, ngn: 5000 },
    cta: 'Go Premium',
    features: [
      { text: '5 published portfolios', included: true },
      { text: 'AI-generated copy & design', included: true },
      { text: 'All template styles', included: true },
      { text: 'Mesh node + priority ranking', included: true },
      { text: 'Multiple custom domains + SSL', included: true },
      { text: 'Advanced visitor analytics', included: true },
      { text: 'Mesh insights — who found you', included: true },
      { text: 'Remove SeeqMe branding', included: true },
    ],
    limits: { portfolios: 5, customDomain: true },
  },
];

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'domain': <Globe className="w-4 h-4" />,
  'analytics': <BarChart3 className="w-4 h-4" />,
  'ssl': <Shield className="w-4 h-4" />,
  'support': <Headphones className="w-4 h-4" />,
  'api': <Code2 className="w-4 h-4" />,
};

const normalizePlanFromConfig = (raw: RawPricingPlan, fallback?: Plan): Plan => {
  const normalizedFeatures = Array.isArray(raw?.features)
    ? raw.features
      .map((feature: any) => {
        if (typeof feature === 'string') {
          return { text: feature, included: true };
        }
        if (feature && typeof feature === 'object') {
          return {
            text: String(feature.text || ''),
            included: feature.included !== false
          };
        }
        return null;
      })
      .filter((f): f is { text: string; included: boolean } => !!f && !!f.text.trim())
    : (fallback?.features || []);

  return {
    id: raw?.id || fallback?.id || '',
    name: raw?.name || fallback?.name || 'Plan',
    tagline: raw?.tagline || fallback?.tagline || '',
    price: {
      usd: Number(raw?.price?.usd ?? fallback?.price?.usd ?? 0),
      ngn: Number(raw?.price?.ngn ?? fallback?.price?.ngn ?? 0),
    },
    features: normalizedFeatures,
    recommended: Boolean(raw?.recommended ?? fallback?.recommended),
    cta: raw?.cta || fallback?.cta || 'Choose Plan',
    limits: {
      portfolios: Number(raw?.limits?.portfolios ?? fallback?.limits?.portfolios ?? 0),
      customDomain: Boolean(raw?.limits?.customDomain ?? fallback?.limits?.customDomain),
    },
  };
};

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const queryParams = new URLSearchParams(window.location.search);
  const redirectUrl = queryParams.get('redirect');
  const autoDeploy = queryParams.get('autoDeploy');
  const isBuilderCheckout = Boolean(redirectUrl || autoDeploy);

  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isSyncing, setIsSyncing] = useState(false);
  const [paidPlans, setPaidPlans] = useState<Plan[]>(DEFAULT_PAID_PLANS);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<Plan | null>(null);
  const [paystackLaunchPlan, setPaystackLaunchPlan] = useState<Plan | null>(null);

  const paystackPublicKey = PAYSTACK_PUBLIC_KEY;

  useEffect(() => {
    setCurrency(user?.country === 'Nigeria' ? 'NGN' : 'USD');
  }, [user?.country]);

  useEffect(() => {
    const loadPlans = async () => {
      setIsLoadingPlans(true);
      try {
        const data = await configService.getPricing();
        if (Array.isArray(data?.pricingPlans) && data.pricingPlans.length) {
          const fallbackById = new Map(DEFAULT_PAID_PLANS.map((plan) => [plan.id, plan]));
          const normalized = data.pricingPlans
            .map((plan: RawPricingPlan) => normalizePlanFromConfig(plan, plan?.id ? fallbackById.get(plan.id) : undefined))
            .filter((plan: Plan) => !!plan.id);
          if (normalized.length) setPaidPlans(normalized);
        }
      } catch { /* use defaults */ } finally { setIsLoadingPlans(false); }
    };
    loadPlans();
  }, []);

  const paystackConfig = {
    reference: paystackLaunchPlan ? `${Date.now()}` : '0',
    email: user?.email || '',
    amount: paystackLaunchPlan
      ? Math.round(((currency === 'USD' ? paystackLaunchPlan.price.usd : paystackLaunchPlan.price.ngn) * (billingCycle === 'yearly' ? 10 : 1)) * 1.075) * 100
      : 0,
    publicKey: paystackPublicKey || '',
    currency,
  };

  const initializePaystackPayment = usePaystackPayment(paystackConfig as any);

  const handleSubscriptionSuccess = async (
    paymentReference: string,
    planId: string,
    gateway: 'paystack' | 'hedera',
  ) => {
    setIsSyncing(true);
    const plan = paidPlans.find(p => p.id === planId);
    const basePrice = currency === 'USD' ? plan?.price.usd : plan?.price.ngn;
    const finalPrice = billingCycle === 'yearly' ? (basePrice || 0) * 10 : (basePrice || 0);
    try {
      await subscriptionService.verifyPayment(paymentReference, planId, gateway, billingCycle, finalPrice, currency);
      toast.success('Your subscription is now active — welcome to SeeqMe!');
      navigate(redirectUrl ? `${redirectUrl}${autoDeploy ? `?autoDeploy=${autoDeploy}` : ''}` : '/dashboard');
    } catch {
      toast.error('Payment received but verification failed. Contact support with your reference.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!paystackLaunchPlan) return;
    if (!paystackPublicKey) {
      toast.error('Paystack is unavailable right now. Please try another gateway.');
      setPaystackLaunchPlan(null);
      return;
    }

    initializePaystackPayment(
      (reference: any) => {
        const plan = paystackLaunchPlan;
        setPaystackLaunchPlan(null);
        if (plan) {
          handleSubscriptionSuccess(reference?.reference || '', plan.id, 'paystack');
        }
      },
      () => {
        toast.info('Payment cancelled');
        setPaystackLaunchPlan(null);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paystackLaunchPlan]);

  const handlePlanClick = (plan: Plan) => {
    if (plan.id === 'free') {
      navigate('/dashboard');
      return;
    }

    if (!user) {
      navigate('/auth/login', { state: { from: '/plans' } });
      return;
    }

    if (isBuilderCheckout && paystackPublicKey) {
      setPaystackLaunchPlan(plan);
      return;
    }

    setSelectedPaymentPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handleGatewayModalPaystack = () => {
    if (!selectedPaymentPlan) return;
    setIsPaymentModalOpen(false);
    setPaystackLaunchPlan(selectedPaymentPlan);
  };

  const handleGatewayModalHedera = async (encodedReceipt: string) => {
    if (!selectedPaymentPlan) return;
    setIsPaymentModalOpen(false);
    await handleSubscriptionSuccess(encodedReceipt, selectedPaymentPlan.id, 'hedera');
  };

  const allPlans = [FREE_PLAN, ...paidPlans];

  const getPlanPrice = (plan: Plan) => {
    const base = currency === 'USD' ? plan.price.usd : plan.price.ngn;
    return billingCycle === 'yearly' ? Math.round(base * 10) : base;
  };

  const formatPrice = (plan: Plan) => {
    const p = getPlanPrice(plan);
    if (p === 0) return 'Free';
    return `${currency === 'USD' ? '$' : '₦'}${p.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground flex flex-col font-sans">
      <Helmet>
        <title>Pricing — SeeqMe</title>
        <meta name="description" content="Simple, transparent pricing for SeeqMe. Build your portfolio, enter the professional discovery mesh, and get found. Free to start." />
        <link rel="canonical" href="https://seeqme.com/plans" />
        <meta property="og:title" content="Pricing — SeeqMe AI Portfolio Builder" />
        <meta property="og:description" content="Simple, transparent pricing for AI-generated portfolios. Free to start, upgrade when you need more." />
        <meta property="og:url" content="https://seeqme.com/plans" />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* Overlay */}
      {(isSyncing || isLoadingPlans) && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader className="text-teal-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              {isSyncing ? 'Verifying your payment…' : 'Loading plans…'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/seeqme-logo-white.png" alt="SeeqMe" className="h-7 w-auto brightness-0" />
          </div>
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
            <ICONS.X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 pt-28 pb-24 px-6">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* Page heading */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest">
              Pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-slate-900 leading-tight">
              Build your node.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-700">
                Own your discovery.
              </span>
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              No hidden fees. Cancel any time. Your portfolio and mesh presence, fully yours.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-4 mt-2 p-1.5 bg-slate-100 rounded-full">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                Yearly
                <span className="px-1.5 py-0.5 rounded-full bg-teal-500 text-white text-[9px] font-black">SAVE 17%</span>
              </button>
            </div>

            {/* Currency selector */}
            <div className="flex items-center justify-center gap-3 mt-2">
              {(['USD', 'NGN'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${currency === c ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  {c === 'USD' ? '🇺🇸 USD' : '🇳🇬 NGN'}
                </button>
              ))}
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allPlans.map((plan, idx) => {
              const displayPrice = getPlanPrice(plan);
              const basePrice = currency === 'USD' ? plan.price.usd : plan.price.ngn;
              const vatPrice = Math.round(displayPrice * 1.075);
              const isFree = plan.id === 'free';

              return (
                <MotionDiv
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex flex-col rounded-3xl border p-8 transition-all ${plan.recommended
                      ? 'bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/20 text-white'
                      : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:shadow-md'
                    }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                      Most Popular
                    </div>
                  )}

                  {/* Plan name + tagline */}
                  <div className="mb-6">
                    <h3 className={`text-lg font-black uppercase tracking-tight mb-1 ${plan.recommended ? 'text-white' : 'text-slate-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs font-medium ${plan.recommended ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black tracking-tight ${plan.recommended ? 'text-white' : 'text-slate-900'}`}>
                        {formatPrice(plan)}
                      </span>
                      {!isFree && (
                        <span className={`text-xs font-semibold ${plan.recommended ? 'text-slate-500' : 'text-slate-400'}`}>
                          /{billingCycle === 'yearly' ? 'yr' : 'mo'}
                        </span>
                      )}
                    </div>
                    {!isFree && billingCycle === 'yearly' && (
                      <p className={`text-xs font-medium mt-1 ${plan.recommended ? 'text-teal-400' : 'text-teal-600'}`}>
                        = {currency === 'USD' ? '$' : '₦'}{basePrice.toLocaleString()}/mo — 2 months free
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <div key={i} className={`flex items-center gap-3 text-sm ${f.included ? (plan.recommended ? 'text-slate-200' : 'text-slate-700') : (plan.recommended ? 'text-slate-400' : 'text-slate-400')}`}>
                        {f.included ? (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.recommended ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.recommended ? 'bg-white/10' : 'bg-slate-100'}`}>
                            <XIcon className="w-3 h-3" />
                          </div>
                        )}
                        <span className={`font-medium ${!f.included ? 'line-through opacity-60' : ''}`}>{f.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 ${plan.recommended
                        ? 'bg-teal-500 text-white hover:bg-teal-400 shadow-lg shadow-teal-500/30'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                  >
                    {plan.cta}
                  </button>

                  {!isFree && (
                    <p className={`text-center text-[10px] font-medium mt-3 ${plan.recommended ? 'text-slate-500' : 'text-slate-400'}`}>
                      Includes 7.5% VAT · Cancel anytime
                    </p>
                  )}
                </MotionDiv>
              );
            })}
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 font-medium pt-4">
            {[
              { icon: <Shield className="w-4 h-4" />, label: 'Paystack · HBAR accepted' },
              { icon: <Globe className="w-4 h-4" />, label: 'Global CDN delivery' },
              { icon: <Zap className="w-4 h-4" />, label: 'Instant activation' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-slate-300">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </main>

      <DeploymentPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPaymentPlan(null);
        }}
        onPaystackProceed={handleGatewayModalPaystack}
        onHederaSuccess={handleGatewayModalHedera}
        planId={selectedPaymentPlan?.id || 'pro'}
      />
    </div>
  );
};

export default React.memo(Plans);
