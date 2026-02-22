import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-white text-slate-600 selection:bg-teal-100 selection:text-teal-900 font-[Poppins] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 font-medium bg-slate-50 inline-block px-4 py-1 rounded-full text-sm">
            Effective Date: January 13, 2026
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-16">
          <aside className="hidden lg:block w-64 h-fit sticky top-10">
            <nav className="space-y-4 border-l-2 border-slate-100 pl-6 text-sm font-medium">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
                <a key={n} href={`#pp-section-${n}`} className="block hover:text-teal-600 transition-colors">
                  Section {n}
                </a>
              ))}
            </nav>
          </aside>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 space-y-20 pb-20"
          >
            <motion.section variants={itemVariants} id="pp-section-1">
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-lg leading-relaxed text-slate-700">
                SeeqMe AI ("Company," "we," "us," or "our") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website seeqme.com and use our services (collectively, the "Service").
              </p>
            </motion.section>

            <motion.section variants={itemVariants} id="pp-section-2">
              <h2 className="text-xl font-bold text-slate-900 mb-6">2. Information We Collect</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Personal Data", text: "Personally identifiable information, such as your name, email address, payment information, and demographic information." },
                  { title: "Derivative Data", text: "Information our servers automatically collect such as your IP address, browser type, and operating system." },
                  { title: "Financial Data", text: "Financial information related to your payment method. We store very limited, if any, financial information." },
                  { title: "Content Data", text: "Any content you create, upload, or generate using our Service, including text, images, and other media." }
                ].map((card, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-2">{card.title}</h3>
                    <p className="text-sm">{card.text}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section variants={itemVariants} id="pp-section-3">
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                {[
                  "Create and manage your account.", "Process transactions and invoices.", "Enable user communications.",
                  "Manage portfolios and content.", "Improve Service efficiency.", "Analyze usage trends.",
                  "Notify updates to the Service.", "Offer new products/services.", "Prevent fraudulent transactions.",
                  "Request feedback/customer support.", "Resolve disputes/troubleshoot.", "Send newsletter/marketing."
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm py-1 border-b border-slate-50">
                    <span className="text-teal-500">✓</span> {item}
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section variants={itemVariants} id="pp-section-4" className="bg-teal-50 p-8 rounded-3xl border border-teal-100/50">
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Disclosure of Your Information</h2>
              <p className="mb-4">We may share information we have collected about you in certain situations. Your information may be disclosed via Law, Third-Party Providers, Marketing Communications, Affiliates, Business Partners, or Sale/Bankruptcy.</p>
              <p className="font-bold text-teal-800">We do not sell, rent, or lease your personal information to third parties.</p>
            </motion.section>

            <motion.section variants={itemVariants} id="pp-section-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">6. Data Security</h2>
              <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no method of data transmission can be guaranteed against any interception.</p>
            </motion.section>

            <motion.section variants={itemVariants} id="pp-section-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">8. Your Privacy Rights</h2>
              <div className="flex flex-wrap gap-3">
                {["Right to Access", "Right to Rectification", "Right to Erasure", "Right to Restrict", "Right to Object", "Right to Data Portability"].map((right) => (
                  <span key={right} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium shadow-sm">
                    {right}
                  </span>
                ))}
              </div>
            </motion.section>

            <motion.section variants={itemVariants} id="pp-section-11" className="text-center pt-10 border-t border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
              <p className="mb-4 text-slate-500">For questions regarding your privacy, reach out to us:</p>
              <a
                href="mailto:support@seeqme.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 font-bold text-xl hover:text-teal-700"
              >
                support@seeqme.com
              </a>
            </motion.section>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PrivacyPolicy);