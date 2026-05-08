import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

const MotionDiv = motion.div as any;

const THOUGHTS = [
  'Analyzing your career history...',
  'Extracting key achievements...',
  'Crafting a compelling narrative...',
  'Selecting the perfect typography...',
  'Building semantic HTML structure...',
  'Optimizing for search engines...',
  'Balancing visual hierarchy...',
  'Polishing every sentence...',
  'Generating JSON-LD schema...',
  'Tuning responsive breakpoints...',
  'Adding subtle micro-animations...',
  'Finalizing color harmony...',
  'Wiring up social meta tags...',
  'Crafting your project descriptions...',
];

const STAGES = [
  { label: 'Parsing your profile',   id: 'parse'    },
  { label: 'Structuring your story', id: 'structure' },
  { label: 'Writing your content',   id: 'write'     },
  { label: 'Designing your layout',  id: 'design'    },
  { label: 'Compiling your site',    id: 'compile'   },
];

const RING_RADIUS = 64;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface BuilderLoaderProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  zIndex?: number;
}

const BuilderLoader: React.FC<BuilderLoaderProps> = ({ title, currentStep, totalSteps, zIndex = 9999 }) => {
  const progress = Math.min(Math.round(((currentStep + 1) / totalSteps) * 100), 100);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);
  const activeStageIndex = Math.min(Math.floor((progress / 100) * STAGES.length), STAGES.length - 1);

  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setThoughtIndex(i => (i + 1) % THOUGHTS.length), 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const target = progress;
    const id = setInterval(() => {
      setDisplayProgress(prev => prev < target ? Math.min(prev + 1, target) : prev);
    }, 18);
    return () => clearInterval(id);
  }, [progress]);

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex, background: '#050810' }}
    >
      {/* ─── Aurora background ─────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[400px] rounded-full bg-teal-500/[0.055] blur-[120px] aurora-1" />
        <div className="absolute -bottom-40 right-1/4 w-[450px] h-[380px] rounded-full bg-indigo-500/[0.04] blur-[110px] aurora-2" />
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* one-time sweep */}
        <motion.div
          className="absolute inset-y-0 w-[600px] bg-gradient-to-r from-transparent via-teal-400/[0.018] to-transparent"
          initial={{ x: '-600px' }}
          animate={{ x: 'calc(100vw + 600px)' }}
          transition={{ duration: 3.5, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
        />
      </div>

      {/* ─── Main layout ───────────────────────────────── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-20 w-full max-w-3xl px-6">

        {/* ── LEFT: Progress ring ── */}
        <div className="flex flex-col items-center gap-5 shrink-0">

          {/* Ring + glow */}
          <div className="relative">
            {/* Ambient glow behind ring */}
            <div
              className="absolute inset-0 rounded-full bg-teal-500/10 blur-3xl scale-[1.6] transition-opacity duration-700"
              style={{ opacity: 0.2 + (progress / 100) * 0.6 }}
            />

            <svg width="192" height="192" viewBox="0 0 192 192" className="relative z-10">
              <defs>
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
                <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Track */}
              <circle cx="96" cy="96" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />

              {/* Progress arc */}
              <motion.circle
                cx="96" cy="96" r={RING_RADIUS}
                fill="none"
                stroke="url(#ring-grad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                filter="url(#ring-glow)"
                transform="rotate(-90 96 96)"
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            </svg>

            {/* Center number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <MotionDiv
                  key={Math.floor(displayProgress / 5)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="text-[2.8rem] font-black text-white tracking-tight tabular-nums leading-none"
                >
                  {displayProgress}
                </MotionDiv>
              </AnimatePresence>
              <span className="text-[9px] font-bold text-slate-600 tracking-[0.35em] uppercase mt-1">percent</span>
            </div>
          </div>

          {/* Title + thought ticker */}
          <div className="text-center max-w-[200px]">
            <AnimatePresence mode="wait">
              <MotionDiv
                key={title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-bold text-white mb-2 leading-snug"
              >
                {title}
              </MotionDiv>
            </AnimatePresence>

            <div className="h-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <MotionDiv
                  key={thoughtIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="text-[11px] text-slate-500 font-medium leading-none"
                >
                  {THOUGHTS[thoughtIndex]}
                </MotionDiv>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Pipeline steps ── */}
        <div className="flex flex-col gap-2 w-full max-w-xs">

          <p className="text-[9px] font-bold uppercase tracking-[0.38em] text-slate-600 mb-2">
            Build Pipeline
          </p>

          {STAGES.map((stage, i) => {
            const isDone   = i < activeStageIndex;
            const isActive = i === activeStageIndex;
            const isPending = i > activeStageIndex;

            return (
              <MotionDiv
                key={stage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.09, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-500 ${
                  isActive  ? 'bg-white/[0.045] border border-teal-500/20' :
                  isDone    ? 'bg-white/[0.015] border border-transparent' :
                  /* pending */ 'border border-transparent'
                }`}
              >
                {/* Icon */}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isDone   ? 'bg-teal-500/15' :
                  isActive ? 'bg-white/8' :
                  /* pending */ 'bg-white/[0.03]'
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>

                {/* Label */}
                <span className={`text-sm font-semibold transition-all duration-500 flex-1 ${
                  isDone   ? 'text-teal-400/80' :
                  isActive ? 'text-white' :
                  /* pending */ 'text-slate-700'
                }`}>
                  {stage.label}
                </span>

                {/* Active pulse dots */}
                {isActive && (
                  <div className="flex gap-1 shrink-0">
                    {[0, 1, 2].map(j => (
                      <MotionDiv
                        key={j}
                        className="w-1 h-1 rounded-full bg-teal-400"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.4, delay: j * 0.25, repeat: Infinity }}
                      />
                    ))}
                  </div>
                )}
              </MotionDiv>
            );
          })}
        </div>
      </div>

      <style>{`
        .aurora-1 { animation: aurora-drift-1 14s ease-in-out infinite; }
        .aurora-2 { animation: aurora-drift-2 18s ease-in-out infinite; }
        @keyframes aurora-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(50px, -40px) scale(1.08); }
          66%       { transform: translate(-30px, 30px) scale(0.94); }
        }
        @keyframes aurora-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-40px, 25px) scale(1.06); }
          66%       { transform: translate(30px, -20px) scale(0.92); }
        }
      `}</style>
    </MotionDiv>
  );
};

export default BuilderLoader;





