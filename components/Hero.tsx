import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;

const TICKER_ITEMS = [
  '2,400+ portfolios deployed',
  'Average 47 seconds to live',
  'Indexed by Google on day one',
  'Custom domains on every plan',
  'AI-written copy, zero blanks',
  'SSL-secured out of the box',
];

const PROOF_AVATARS = ['bg-teal-400', 'bg-violet-400', 'bg-sky-400', 'bg-amber-400', 'bg-rose-400'];

const HeroSection = () => {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTickerIndex(i => (i + 1) % TICKER_ITEMS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center text-center pt-20 pb-4 px-4 w-full overflow-hidden">

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-teal-500/[0.07] rounded-full blur-[140px]" />
        <div className="absolute top-24 -left-48 w-80 h-80 bg-violet-500/[0.05] rounded-full blur-[100px]" />
        <div className="absolute top-24 -right-48 w-80 h-80 bg-sky-500/[0.05] rounded-full blur-[100px]" />
      </div>

      {/* Live status ticker */}
      <MotionDiv
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-10 inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      >
        <span className="relative flex items-center justify-center w-2 h-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
          <span className="relative w-2 h-2 rounded-full bg-teal-500" />
        </span>
        <AnimatePresence mode="wait">
          <MotionSpan
            key={tickerIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
            className="text-xs font-semibold text-slate-600 tabular-nums min-w-[220px] text-left"
          >
            {TICKER_ITEMS[tickerIndex]}
          </MotionSpan>
        </AnimatePresence>
      </MotionDiv>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-5xl sm:text-6xl md:text-[6vw] lg:text-[5.5vw] font-black tracking-[-0.04em] leading-[0.88] mb-6 text-slate-900 max-w-5xl mx-auto"
      >
        From résumé
        <br />
        to{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-500 to-teal-700">
          live portfolio
        </span>
        <br />
        in 60 seconds.
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-lg md:text-xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed"
      >
        Upload your CV. Pick your style. Let AI craft a stunning portfolio and deploy it — live on the web, instantly.
      </motion.p>

      {/* Social proof row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {PROOF_AVATARS.map((c, i) => (
              <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white shadow-sm`} />
            ))}
          </div>
          <span className="text-sm text-slate-500 font-medium">
            Trusted by <span className="text-slate-900 font-bold">2,400+</span> professionals
          </span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          {[1,2,3,4,5].map(i => (
            <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
          <span className="text-sm text-slate-500 font-medium ml-1">4.9 out of 5</span>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
