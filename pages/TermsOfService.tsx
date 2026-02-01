import React from 'react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
  return (
    <div className="text-foreground selection:bg-teal-500 selection:text-slate-950 font-[Poppins]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-center mb-4">
            Terms of Service
          </h1>
          <p className="text-center text-muted-foreground mb-10">Effective Date: January 13, 2026</p>

          <div className="prose prose-lg prose-invert mx-auto text-muted-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using SeeqMe AI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-2">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on SeeqMe AI's website for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-2">3. Disclaimer</h2>
              <p>
                The materials on SeeqMe AI's website are provided on an 'as is' basis. SeeqMe AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-2">4. Limitations</h2>
              <p>
                In no event shall SeeqMe AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SeeqMe AI's website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-2">5. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-2">6. Refunds and Cancellations</h2>
              <p>
                All sales are final. We do not offer refunds, returns, or exchanges for any subscriptions or services purchased through SeeqMe AI, regardless of usage. You may cancel your subscription at any time to prevent future billing, but no prorated refunds will be issued for the remaining period.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(TermsOfService);
