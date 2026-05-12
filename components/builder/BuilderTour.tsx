import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Lightbulb, Pencil, Layout,
  Wand2, TerminalSquare, Rocket, X,
} from 'lucide-react';

export interface TourStep {
  target: string;
  label: string;
  title: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  tip?: string;
}

export const BUILDER_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="sidebar-edit"]',
    label: 'Section Editor',
    title: 'Edit Every Section',
    description:
      'Open the full section editor to customize every part of your portfolio — text, fonts, colors, images, and links. All changes update live in the preview as you type.',
    icon: Pencil,
    accent: '#14b8a6',
    tip: 'Click any field and start typing — the preview updates instantly without saving.',
  },
  {
    target: '[data-tour="sidebar-blocks"]',
    label: 'Sections Panel',
    title: 'Sections & Blocks',
    description:
      'Expand to see every section in your portfolio at a glance. Reorder them with the arrows, toggle visibility with the eye icon, or click "+ Add Block" to inject premium components like Testimonials, Pricing, and Gallery.',
    icon: Layout,
    accent: '#8b5cf6',
    tip: 'Click any section row in the panel to highlight and scroll to it in the preview.',
  },
  {
    target: '[data-tour="sidebar-ai"]',
    label: 'AI Edit',
    title: 'AI Command Bar',
    description:
      'Your AI design assistant. Toggle it open and type any instruction — "make the hero more minimal", "rewrite the bio to sound more confident", or "switch to a dark monochrome palette".',
    icon: Wand2,
    accent: '#f59e0b',
    tip: 'Use Refine mode for targeted tweaks, or switch to Rebuild mode to regenerate the whole portfolio from your prompt.',
  },
  {
    target: '[data-tour="sidebar-console"]',
    label: 'Console',
    title: 'Console & Source Code',
    description:
      'Watch live build logs as the AI generates your portfolio. Switch to the "Source" tab to inspect the generated HTML, CSS, and JS — Pro users can edit the source directly.',
    icon: TerminalSquare,
    accent: '#64748b',
    tip: 'Errors, warnings, and deployment events all appear here in real-time.',
  },
  {
    target: '[data-tour="remix-button"]',
    label: 'Header',
    title: 'Remix Design',
    description:
      'Generate a completely new visual design while keeping all your content intact — your name, bio, projects, skills, and experience stay exactly as they are. Only the look changes.',
    icon: Wand2,
    accent: '#8b5cf6',
    tip: 'Every remix is saved in history. Use the undo button to restore any previous version.',
  },
  {
    target: '[data-tour="deploy-button"]',
    label: 'Header',
    title: 'Publish to the Web',
    description:
      'Deploy your portfolio globally — HTTPS, CDN, and automatic SEO metadata included. Your site will be Google-indexed from day one. Connect a custom domain after publishing.',
    icon: Rocket,
    accent: '#14b8a6',
    tip: 'Already published? Clicking Redeploy pushes your latest edits live in seconds.',
  },
];

/* ─── helpers ─── */

interface TargetBox {
  top: number; left: number; width: number; height: number;
  right: number; bottom: number;
}

interface TooltipPos {
  top: number; left: number;
  side: 'right' | 'bottom' | 'top' | 'left';
}

const TOOLTIP_W = 352;
const TOOLTIP_H_EST = 290;
const GAP = 16;

function getBox(selector: string): TargetBox | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
}

function calcPos(box: TargetBox, tw: number, th: number): TooltipPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const m = 12;
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const clampL = (l: number) => Math.max(m, Math.min(l, vw - tw - m));
  const clampT = (t: number) => Math.max(m, Math.min(t, vh - th - m));

  if (box.right + GAP + tw <= vw - m)
    return { side: 'right', left: box.right + GAP, top: clampT(cy - th / 2) };
  if (box.bottom + GAP + th <= vh - m)
    return { side: 'bottom', top: box.bottom + GAP, left: clampL(cx - tw / 2) };
  if (box.top - GAP - th >= m)
    return { side: 'top', top: box.top - GAP - th, left: clampL(cx - tw / 2) };
  return { side: 'left', left: Math.max(m, box.left - GAP - tw), top: clampT(cy - th / 2) };
}

/* ─── Arrow pointer ─── */
function Arrow({ side, accent }: { side: TooltipPos['side']; accent: string }) {
  const size = 8;
  const base: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    background: 'white',
    transform: 'rotate(45deg)',
    border: '1px solid rgba(0,0,0,0.06)',
  };
  const pos: Record<TooltipPos['side'], React.CSSProperties> = {
    right:  { left: -5,  top: '50%', marginTop: -size / 2, borderRight: 'none', borderTop: 'none' },
    left:   { right: -5, top: '50%', marginTop: -size / 2, borderLeft: 'none', borderBottom: 'none' },
    bottom: { top: -5,   left: '50%', marginLeft: -size / 2, borderBottom: 'none', borderRight: 'none' },
    top:    { bottom: -5, left: '50%', marginLeft: -size / 2, borderTop: 'none', borderLeft: 'none' },
  };
  return <div style={{ ...base, ...pos[side] }} />;
}

/* ─── Main component ─── */
interface BuilderTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: TourStep[];
}

const SP = 9; // spotlight padding

const BuilderTour: React.FC<BuilderTourProps> = ({
  isOpen,
  onClose,
  steps = BUILDER_TOUR_STEPS,
}) => {
  const [idx, setIdx] = useState(0);
  const [box, setBox] = useState<TargetBox | null>(null);
  const [tPos, setTPos] = useState<TooltipPos | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const step = steps[idx];
  const isFirst = idx === 0;
  const isLast = idx === steps.length - 1;

  const refresh = useCallback(() => {
    if (!step) return;
    const b = getBox(step.target);
    if (!b) return;
    setBox(b);
    const th = tipRef.current?.offsetHeight || TOOLTIP_H_EST;
    const tw = Math.min(TOOLTIP_W, window.innerWidth - 24);
    setTPos(calcPos(b, tw, th));
  }, [step]);

  useEffect(() => { if (isOpen) { setIdx(0); setBox(null); setTPos(null); } }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(refresh, 40);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);
    return () => { clearTimeout(t); window.removeEventListener('resize', refresh); window.removeEventListener('scroll', refresh, true); };
  }, [isOpen, idx, refresh]);

  // Remeasure tooltip height after render
  useEffect(() => {
    if (!isOpen || !box) return;
    const t = setTimeout(() => {
      const th = tipRef.current?.offsetHeight || TOOLTIP_H_EST;
      const tw = Math.min(TOOLTIP_W, window.innerWidth - 24);
      setTPos(calcPos(box, tw, th));
    }, 60);
    return () => clearTimeout(t);
  }, [isOpen, box]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && !isLast) setIdx(p => p + 1);
      if (e.key === 'ArrowLeft' && !isFirst) setIdx(p => p - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isFirst, isLast, onClose]);

  const tooltipW = Math.min(TOOLTIP_W, typeof window !== 'undefined' ? window.innerWidth - 24 : TOOLTIP_W);

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="builder-tour" style={{ position: 'fixed', inset: 0, zIndex: 99990, pointerEvents: 'none' }}>

          {/* ── Spotlight overlay: 4 panels ── */}
          {box && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ pointerEvents: 'auto' }}
            >
              {/* Top */}
              <div onClick={onClose} style={{ position: 'fixed', inset: `0 0 auto 0`, height: Math.max(0, box.top - SP), background: 'rgba(2,6,23,0.78)' }} />
              {/* Bottom */}
              <div onClick={onClose} style={{ position: 'fixed', inset: `${box.bottom + SP}px 0 0 0`, background: 'rgba(2,6,23,0.78)' }} />
              {/* Left */}
              <div onClick={onClose} style={{ position: 'fixed', top: box.top - SP, left: 0, width: Math.max(0, box.left - SP), height: box.height + SP * 2, background: 'rgba(2,6,23,0.78)' }} />
              {/* Right */}
              <div onClick={onClose} style={{ position: 'fixed', top: box.top - SP, left: box.right + SP, right: 0, height: box.height + SP * 2, background: 'rgba(2,6,23,0.78)' }} />
            </motion.div>
          )}

          {/* ── Pulse glow ring ── */}
          {box && (
            <motion.div
              key={`pulse-${idx}`}
              animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.12, 0.35] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'fixed',
                top: box.top - SP - 6,
                left: box.left - SP - 6,
                width: box.width + (SP + 6) * 2,
                height: box.height + (SP + 6) * 2,
                borderRadius: 18,
                border: `1.5px solid ${step.accent}`,
                background: `${step.accent}18`,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* ── Highlight ring with corner brackets ── */}
          {box && (
            <motion.div
              key={`ring-${idx}`}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 280 }}
              style={{
                position: 'fixed',
                top: box.top - SP,
                left: box.left - SP,
                width: box.width + SP * 2,
                height: box.height + SP * 2,
                borderRadius: 12,
                border: `1.5px solid ${step.accent}`,
                boxShadow: `0 0 0 2.5px ${step.accent}28, 0 0 24px ${step.accent}30`,
                pointerEvents: 'none',
              }}
            >
              {/* Corner brackets */}
              {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
                <div key={c} style={{
                  position: 'absolute',
                  width: 10, height: 10,
                  border: `2px solid ${step.accent}`,
                  ...(c === 'tl' ? { top: -2, left: -2, borderRight: 'none', borderBottom: 'none', borderRadius: '4px 0 0 0' } :
                    c === 'tr' ? { top: -2, right: -2, borderLeft: 'none', borderBottom: 'none', borderRadius: '0 4px 0 0' } :
                    c === 'bl' ? { bottom: -2, left: -2, borderRight: 'none', borderTop: 'none', borderRadius: '0 0 0 4px' } :
                                  { bottom: -2, right: -2, borderLeft: 'none', borderTop: 'none', borderRadius: '0 0 4px 0' }),
                }} />
              ))}
            </motion.div>
          )}

          {/* ── Tooltip card ── */}
          {tPos && (
            <motion.div
              ref={tipRef}
              key={`tip-${idx}`}
              initial={{ opacity: 0, y: tPos.side === 'bottom' ? -8 : tPos.side === 'top' ? 8 : 0, x: tPos.side === 'right' ? -8 : tPos.side === 'left' ? 8 : 0, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: tPos.top,
                left: tPos.left,
                width: tooltipW,
                zIndex: 99993,
                pointerEvents: 'auto',
              }}
              className="bg-white rounded-2xl shadow-[0_24px_72px_rgba(0,0,0,0.38),0_0_0_1px_rgba(0,0,0,0.05)] overflow-visible"
            >
              {/* Arrow pointer */}
              <Arrow side={tPos.side} accent={step.accent} />

              {/* Accent bar */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${step.accent}, ${step.accent}55)`, borderRadius: '12px 12px 0 0' }} />

              <div className="p-4 sm:p-5 rounded-b-2xl overflow-hidden">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      style={{ background: `${step.accent}14`, border: `1px solid ${step.accent}28` }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <step.icon style={{ color: step.accent }} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 leading-none mb-0.5">{step.label}</p>
                      <h3 className="text-[14px] font-black text-slate-900 leading-tight tracking-tight">{step.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0 -mr-1 -mt-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-[13px] text-slate-600 leading-[1.65] mb-3">{step.description}</p>

                {/* Tip */}
                {step.tip && (
                  <div
                    style={{ background: `${step.accent}08`, border: `1px solid ${step.accent}1a` }}
                    className="rounded-xl p-3 mb-4 flex gap-2.5"
                  >
                    <Lightbulb style={{ color: step.accent }} className="w-3.5 h-3.5 mt-[1px] shrink-0" />
                    <p className="text-[11px] text-slate-500 leading-relaxed">{step.tip}</p>
                  </div>
                )}

                {/* Navigation row */}
                <div className="flex items-center justify-between">
                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIdx(i)}
                        style={{
                          width: i === idx ? 18 : 5,
                          height: 5,
                          borderRadius: 99,
                          background: i === idx ? step.accent : '#e2e8f0',
                          transition: 'all 0.25s',
                        }}
                      />
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-1.5">
                    {!isFirst && (
                      <button
                        onClick={() => setIdx(p => p - 1)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => isLast ? onClose() : setIdx(p => p + 1)}
                      style={{ background: step.accent }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-[11px] font-black tracking-wide transition-opacity hover:opacity-90 active:scale-95"
                    >
                      {isLast ? 'Got it' : 'Next'}
                      {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{ borderTop: `1px solid ${step.accent}14`, background: `${step.accent}06` }}
                className="px-4 sm:px-5 py-2 flex items-center justify-between rounded-b-2xl"
              >
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.22em]">
                  {idx + 1} of {steps.length}
                </span>
                <button onClick={onClose} className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold transition-colors">
                  Skip tour
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default BuilderTour;
