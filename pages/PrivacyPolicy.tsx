import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="text-foreground selection:bg-teal-500 selection:text-slate-950 font-[Poppins]">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-center mb-4">
            Privacy Policy
          </h1>
          <p className="text-center text-muted-foreground mb-10">Effective Date: January 13, 2026</p>

          <div className="prose prose-lg prose-invert mx-auto text-muted-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-2">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you create an account, build a portfolio, or communicate with us. This may include your name, email address, payment information, and any content you upload to your portfolio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-2">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to operate, maintain, and improve our services. Specifically, we use your data to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Provide and deliver the SeeqMe AI platform functionality.</li>
                <li>Process transactions and send related information.</li>
                <li>Send technical notices, updates, security alerts, and support messages.</li>
                <li>Respond to your comments, questions, and requests.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-2">3. Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. However, no internet transmission is completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-2">4. Sharing of Information</h2>
              <p>
                We do not share your personal information with third parties except as described in this policy, such as with vendors who need access to such information to carry out work on our behalf, or when required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-2">5. Your Rights</h2>
              <p>
                You may update, correct, or delete information about you at any time by logging into your online account or emailing us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-2">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at support@seeqme.ai.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(PrivacyPolicy);
