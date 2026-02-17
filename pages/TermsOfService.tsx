import React from 'react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
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
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-500 font-medium">Effective Date: January 13, 2026</p>
          <div className="h-1.5 w-20 bg-teal-500 mx-auto mt-6 rounded-full" />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sticky Quick Nav */}
          <aside className="hidden lg:block w-64 h-fit sticky top-10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Contents</p>
            <nav className="space-y-4 border-l-2 border-slate-100 pl-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((n) => (
                <a key={n} href={`#section-${n}`} className="block text-sm hover:text-teal-600 transition-colors">
                  Section {n}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 space-y-16 pb-20"
          >
            <motion.section variants={itemVariants} id="section-1">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="text-teal-500">1.</span> Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing or using the SeeqMe AI platform, website, and services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and all applicable laws and regulations. If you do not agree with any part of these Terms, you are prohibited from using or accessing the Service. These Terms constitute a legally binding agreement between you and SeeqMe AI ("Company," "we," "us," or "our").
              </p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-2">
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. Changes to Terms</h2>
              <p>
                We reserve the right to modify or revise these Terms at any time, at our sole discretion. We will notify you of any changes by posting the new Terms on this page and updating the "Effective Date" at the top. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. It is your responsibility to review these Terms periodically for changes.
              </p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-3">
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
              <p>
                To access certain features of the Service, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate your account if any information provided during the registration process or thereafter proves to be inaccurate, false, or incomplete.
              </p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-4" className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Service Plans and Subscriptions</h2>
              <p className="mb-6">
                SeeqMe AI offers various subscription plans (e.g., Starter, Professional, Elite) with different features, limits, and pricing. Details of these plans are available on our "Plans" page.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none">
                <li className="text-sm"><strong className="text-slate-900 block mb-1">Subscription:</strong> Your subscription will automatically renew at the end of each billing cycle (monthly or yearly) unless you cancel it.</li>
                <li className="text-sm"><strong className="text-slate-900 block mb-1">Billing:</strong> By purchasing a subscription, you authorize us to charge your payment method on a recurring basis for the applicable subscription fees, plus any applicable taxes.</li>
                <li className="text-sm"><strong className="text-slate-900 block mb-1">Price Changes:</strong> We reserve the right to change our subscription fees at any time. Any price changes will take effect after reasonable notice to you.</li>
                <li className="text-sm"><strong className="text-slate-900 block mb-1">Cancellation:</strong> You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing cycle, and you will continue to have access to the Service until then.</li>
              </ul>
            </motion.section>

            <motion.section variants={itemVariants} id="section-5" className="border-2 border-teal-500/20 p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-slate-900 mb-4">5. No Refunds Policy</h2>
              <p className="text-slate-900 font-semibold mb-4">
                All sales are final. We do not offer refunds, returns, or exchanges for any subscriptions, services, or digital products purchased through SeeqMe AI. This policy applies regardless of usage, satisfaction, or any changes to your circumstances. By subscribing to our Service, you acknowledge and agree to this no-refund policy.
              </p>
              <p className="text-sm text-slate-500">
                In exceptional circumstances, such as proven technical issues directly attributable to SeeqMe AI that prevent the core functionality of the service from being delivered and cannot be resolved by our support team, we may, at our sole discretion, consider alternative resolutions. However, this does not imply any obligation to provide a refund.
              </p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">6. User Conduct and Content</h2>
              <p className="mb-4">You are solely responsible for all content you upload, publish, display, link to, or otherwise make available via the Service. You agree not to use the Service to:</p>
              <div className="space-y-3">
                {[
                  "Upload or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.",
                  "Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.",
                  "Upload or transmit any content that infringes any patent, trademark, trade secret, copyright, or other proprietary rights of any party.",
                  "Engage in any activity that interferes with or disrupts the Service or the servers and networks connected to the Service.",
                  "Attempt to gain unauthorized access to the Service, other accounts, computer systems, or networks connected to the Service."
                ].map((text, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 text-sm border border-slate-100">
                    <span className="text-teal-500 font-bold">•</span>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 italic text-sm">We reserve the right to remove any content that violates these Terms or is otherwise objectionable, at our sole discretion, without prior notice.</p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-7">
              <h2 className="text-xl font-bold text-slate-900 mb-4">7. Intellectual Property Rights</h2>
              <p>All intellectual property rights in the Service, including but not limited to copyrights, trademarks, service marks, trade names, and logos, are owned by SeeqMe AI or its licensors. You are granted a limited, non-exclusive, non-transferable, revocable license to use the Service for your personal and business use, subject to these Terms. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service, except as generally permitted by the Service's functionality.</p>
              <p className="mt-4">You retain all intellectual property rights in the content you create and upload to the Service. By uploading content, you grant SeeqMe AI a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the content in connection with the Service and SeeqMe AI's (and its successors' and affiliates') business, including without limitation for promoting and redistributing part or all of the Service (and derivative works thereof) in any media formats and through any media channels.</p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-8" className="bg-slate-900 text-slate-300 p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-xs uppercase font-mono leading-relaxed">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE PURSUANT TO APPLICABLE LAW, SEEQME AI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND TITLE...
              </p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-9">
              <h2 className="text-xl font-bold text-slate-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-xs uppercase font-mono leading-relaxed mb-4">
                IN NO EVENT SHALL SEEQME AI, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES...
              </p>
              <p className="text-xs uppercase font-mono leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SEEQME AI ASSUMES NO LIABILITY OR RESPONSIBILITY FOR ANY (I) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT...
              </p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-10">
              <h2 className="text-xl font-bold text-slate-900 mb-4">10. Indemnification</h2>
              <p>You agree to defend, indemnify, and hold harmless SeeqMe AI and its licensees and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password; b) a breach of these Terms; or c) Content posted on the Service.</p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-11">
              <h2 className="text-xl font-bold text-slate-900 mb-4">11. Governing Law and Dispute Resolution</h2>
              <p>These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.</p>
              <p className="mt-4">Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach, termination, or invalidity thereof, shall be settled by arbitration in accordance with the [Specify Arbitration Rules, e.g., rules of the American Arbitration Association] and judgment on the award rendered by the arbitrator(s) may be entered in any court having jurisdiction thereof. The place of arbitration shall be [Your City, Your Country/State].</p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-12">
              <h2 className="text-xl font-bold text-slate-900 mb-4">12. Termination</h2>
              <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. If you wish to terminate your account, you may simply discontinue using the Service. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-13">
              <h2 className="text-xl font-bold text-slate-900 mb-4">13. Miscellaneous</h2>
              <p>These Terms constitute the entire agreement between you and SeeqMe AI regarding our Service, and supersede and replace any prior agreements we might have had between us regarding the Service. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>
            </motion.section>

            <motion.section variants={itemVariants} id="section-14" className="pt-10 border-t border-slate-100 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Contact Us</h2>
              <p className="mb-4">Questions about these Terms?</p>
              <a href="mailto:support@seeqme.com" className="text-teal-600 font-bold text-lg hover:underline underline-offset-4 decoration-2">
                support@seeqme.com
              </a>
            </motion.section>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TermsOfService);