import React from 'react';
import { motion } from 'framer-motion';

const MonetaryPolicy = () => {
    return (
        <div className="text-foreground selection:bg-teal-500 selection:text-slate-950 font-[Poppins]">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-center mb-4">
                        Monetary Policy
                    </h1>
                    <p className="text-center text-muted-foreground mb-16">Effective Date: January 13, 2026</p>

                    <div className="prose prose-lg prose-invert mx-auto text-muted-foreground space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Pricing and Payments</h2>
                            <p>
                                All prices posted on the SeeqMe AI website are subject to change without notice. The price charged for a product or service will be the price in effect at the time the order is placed.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Currency</h2>
                            <p>
                                All transactions are processed in US Dollars (USD) unless otherwise clearly stated. If you are paying with a foreign currency, your bank may apply conversion fees.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Subscription Billing</h2>
                            <p>
                                Subscriptions are billed in advance on a recurring basis (monthly or annually). By adding a payment method, you authorize us to charge the applicable subscription fees automatically.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Failed Payments</h2>
                            <p>
                                If a payment fails, we will attempt to retry the transaction. If payment cannot be secured, your account access may be suspended until payment is updated.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Taxes</h2>
                            <p>
                                You are responsible for any applicable sales, use, or value-added taxes based on your location. These will be calculated and added to your bill where required by law.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default React.memo(MonetaryPolicy);
