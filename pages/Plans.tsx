import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';
import { subscriptionService } from '../services/apiService';
import { PaystackButton } from 'react-paystack';
import { useAuth } from '../context/auth-context';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

const MotionDiv = motion.div as any;

interface Plan {
    id: string;
    name: string;
    price: {
        usd: number;
        ngn: number;
    };
    features: string[];
    recommended?: boolean;
    limits: {
        portfolios: number;
        customDomain: boolean;
    };
}

const PLANS: Plan[] = [
    {
        id: 'pro',
        name: 'Professional',
        price: { usd: 3, ngn: 2000 },
        recommended: true,
        features: [
            '5 Portfolio Projects',
            'Advanced Customization',
            'Priority Support',
            'Custom Domain Connection',
            'Unlimited AI Re-generations',
            'SEO Optimization Tools',
            'SeeqMe Branding'
        ],
        limits: { portfolios: 2, customDomain: true }
    },
    {
        id: 'premium',
        name: 'Premium',
        price: { usd: 5, ngn: 5000 },
        features: [
            '5 Portfolios',
            'White-label Solution',
            '24/7 Dedicated Support',
            'Multiple Custom Domains',
            'Advanced Analytics (Visitor Tracking)',
            'Priority Feature Access',
            'API Access'
        ],
        limits: { portfolios:5, customDomain: true }
    }
];

const Plans: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const queryParams = new URLSearchParams(window.location.search);
    const redirectUrl = queryParams.get('redirect');
    const autoDeploy = queryParams.get('autoDeploy');

    const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (user?.country) {
            setCurrency(user.country === 'Nigeria' ? 'NGN' : 'USD');
        } else {
            setCurrency('NGN');
        }
    }, [user?.country]);

    const handlePaystackSuccess = async (reference: any, planId: string) => {
        setIsSyncing(true);
        const plan = PLANS.find(p => p.id === planId);
        const basePrice = currency === 'USD' ? plan?.price.usd : plan?.price.ngn;
        const finalPrice = billingCycle === 'yearly' ? (basePrice || 0) * 12 : (basePrice || 0);

        try {
            await subscriptionService.verifyPayment(
                reference.reference,
                planId,
                'paystack',
                billingCycle,
                finalPrice,
                currency
            );
            toast.success('Subscription activated successfully!');

            if (redirectUrl) {
                navigate(`${redirectUrl}${autoDeploy ? `?autoDeploy=${autoDeploy}` : ''}`);
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Verification failed", error);
            toast.error('Payment successful but verification failed. Please contact support.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handlePaystackClose = () => {
        toast.info('Payment cancelled');
    };

    const handleSubscribe = (planId: string) => {
        if (planId === 'free') {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-teal-500/20">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/seeqme-logo-white.png" alt="SeeqMe" className="h-8 w-auto brightness-0" />
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-muted transition-colors">
                        <ICONS.X className="w-6 h-6" />
                    </button>
                </div>
            </header>


            <main className="flex-1 pt-32 pb-20 px-6">
                {isSyncing && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
                        <div className="bg-white border border-border p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                            <Loader className="text-teal-500 animate-spin" />
                            <div className="text-center">
                                <h3 className="text-xl text-black font-bold">Verifying Payment...</h3>
                            </div>
                        </div>
                    </div>
                )}
                <div className="max-w-7xl mx-auto space-y-16">

                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-teal-500">Upgrade Your Presence</span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none">
                            Professional Tools for <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">Global Impact</span>
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                            Unlock the full potential of your digital identity with advanced features, custom domains, and professional analytics.
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-6 pt-8">
                            <span className={`text-xs font-bold uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
                            <button
                                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                className="w-16 h-8 rounded-full bg-muted border border-border relative p-1 transition-colors"
                            >
                                <div className={`w-6 h-6 rounded-full bg-teal-500 shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'}`} />
                            </button>
                            <span className={`text-xs font-bold uppercase tracking-widest ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Yearly <span className="text-teal-500 text-[10px] ml-2">(SAVE 20%)</span>
                            </span>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {PLANS.map((plan) => {
                            const isYearly = billingCycle === 'yearly';
                            const basePrice = currency === 'USD' ? plan.price.usd : plan.price.ngn;
                            const price = isYearly ? basePrice * 12 : basePrice; // Corrected: monthly_price * 12

                            return (
                                <MotionDiv
                                    key={plan.id}
                                    whileHover={{ y: -10 }}
                                    className={`relative p-8 rounded-[32px] border ${plan.recommended ? 'border-teal-500/50 bg-teal-500/5 shadow-2xl shadow-teal-500/10' : 'border-border bg-card'} flex flex-col gap-8 transition-all`}
                                >
                                    {plan.recommended && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black uppercase tracking-tighter">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold tracking-tighter">
                                                {currency === 'USD' ? '$' : '₦'}{price.toLocaleString()}
                                            </span>
                                            <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                                                /{isYearly ? 'yr' : 'mo'} {/* Corrected: 'yr' for yearly */}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                                <div className="w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                                                    <ICONS.Check className="w-3 h-3 text-teal-500" />
                                                </div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="w-full">
                                        <PaystackButton
                                            className={`w-full py-4 rounded-full text-xs font-bold transition-all active:scale-95 shadow-lg ${plan.recommended
                                                ? 'bg-teal-500 text-white hover:bg-teal-600'
                                                : 'bg-teal-500 text-white hover:bg-teal-500/90'
                                                }`}
                                            publicKey={window.location.hostname === 'localhost' ? (import.meta.env.VITE_PAYSTACK_TEST_PK || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) : (import.meta.env.VITE_PAYSTACK_LIVE_PK || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY)}

                                            email={user?.email || ''}
                                            amount={Math.round(price * 1.075 * 100)} // Paystack expects lowest currency unit with 7.5% VAT
                                            currency={currency}
                                            metadata={{
                                                custom_fields: [
                                                    { display_name: "Plan", variable_name: "plan", value: plan.id }
                                                ]
                                            }}
                                            text={`Pay ${currency === 'USD' ? '$' : '₦'}${Math.round(price * 1.075).toLocaleString()}`}
                                            onSuccess={(ref: any) => handlePaystackSuccess(ref, plan.id)}
                                            onClose={handlePaystackClose}
                                        />
                                    </div>
                                </MotionDiv>
                            );
                        })}
                    </div>

                </div>
            </main>

        </div>
    );
};

export default React.memo(Plans);
