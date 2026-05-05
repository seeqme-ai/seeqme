import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { ICONS } from '@/constants';
import { usePublicTemplates } from '@/hooks/usePublicTemplates';
import { useTemplate } from '@/context/template-context';
import { linkedinService } from '@/services/linkedinService';
import { useAuth } from '@/context/auth-context';
import {
  ArrowUpRight, Mic, Upload, X, FileText, Loader, ArrowRight,
  Globe, BarChart3, Search, ChevronRight,
  Zap, Rocket, Check, Github, Twitter, Linkedin,
  Network, Users, Share2, ArrowDown,
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { TemplateCardSkeleton } from '@/components/ui/TemplateSkeleton';
import { shuffleArray } from '@/utils';

const MotionDiv    = motion.div    as any;
const MotionCircle = motion.circle as any;
const MotionLine   = motion.line   as any;
const MotionText   = motion.text   as any;

/* ── Constants ── */

const INFRASTRUCTURE = ['OpenAI Embeddings', 'pgvector', 'Cloudflare CDN', 'Redis', 'Supabase', 'Resend'];
const PROOF_AVATARS  = ['bg-teal-400', 'bg-violet-400', 'bg-sky-400', 'bg-amber-400', 'bg-rose-400'];
const HERO_SKILLS    = ['React', 'TypeScript', 'Node.js', 'Python', 'Figma', 'AWS'];

const STATS = [
  { value: '1,200+', label: 'Nodes in the mesh' },
  { value: '47s',    label: 'Average time to live' },
  { value: '98%',    label: 'Google index rate' },
];

const STEPS = [
  {
    num: '01',
    icon: Upload,
    title: 'Build your identity',
    desc: 'Upload your CV. AI extracts your skills, experience, and tone — then writes your portfolio and publishes it to a live URL in under 60 seconds.',
    color: 'teal',
  },
  {
    num: '02',
    icon: Network,
    title: 'Enter the mesh',
    desc: 'Your profile is embedded as a 1536-dim vector, projected into the professional graph, and clustered with engineers, designers, and founders who match your work.',
    color: 'violet',
  },
  {
    num: '03',
    icon: Users,
    title: 'Attract the right people',
    desc: 'Recruiters, collaborators, and investors discover you through similarity — not keyword search. Post updates and watch them ripple through your cluster.',
    color: 'sky',
  },
];

const FEATURES = [
  {
    icon: Zap,
    tag: 'Portfolio',
    title: 'AI writes every word',
    desc: 'Paste your CV and walk away. Bio, experience, skills, and projects — generated, polished, and structured automatically.',
    accent: 'teal',
  },
  {
    icon: Rocket,
    tag: 'Portfolio',
    title: 'Live in under 60 seconds',
    desc: "Deployed to Cloudflare's global CDN on publish. No config, no waiting, no queue. Instant custom domain and SSL.",
    accent: 'teal',
  },
  {
    icon: Search,
    tag: 'Portfolio',
    title: 'Google-indexed from day one',
    desc: 'SEO meta tags, JSON-LD schema, and search engine pings wired into every deploy. You show up where it counts.',
    accent: 'teal',
  },
  {
    icon: Network,
    tag: 'Mesh',
    title: 'Similarity discovery',
    desc: 'Your embedding is matched against every profile in the graph. When cosine similarity exceeds 0.35, an edge forms and you become discoverable.',
    accent: 'violet',
  },
  {
    icon: Share2,
    tag: 'Mesh',
    title: 'Posts that ripple',
    desc: 'Every post is embedded and projected into the mesh. It lands near your cluster, fires a comet animation, and attracts the nodes most aligned with your content.',
    accent: 'violet',
  },
  {
    icon: BarChart3,
    tag: 'Analytics',
    title: 'Real-time visitor analytics',
    desc: 'Know who read your portfolio, which cluster they came from, how long they stayed, and whether they connected.',
    accent: 'sky',
  },
];

/* ── Mesh node/edge data for SVG visualization ── */

type MeshNode = {
  id: string; x: number; y: number; r: number;
  color: string; label?: string; role?: string; dim?: boolean;
};
type MeshEdge = {
  from: string; to: string; color: string; opacity: number; similarity?: string;
};

const MESH_NODES: MeshNode[] = [
  { id: 'you',    x: 450, y: 240, r: 13, color: '#14b8a6', label: 'You',       role: 'Your role'          },
  { id: 'ada',    x: 218, y: 138, r: 9,  color: '#8b5cf6', label: 'Ada O.',    role: 'Designer · Lagos'   },
  { id: 'tunde',  x: 652, y: 128, r: 9,  color: '#0ea5e9', label: 'Tunde K.', role: 'PM · Abuja'         },
  { id: 'chioma', x: 170, y: 342, r: 8,  color: '#14b8a6', label: 'Chioma',   role: 'Dev · Accra'        },
  { id: 'yemi',   x: 676, y: 355, r: 10, color: '#8b5cf6', label: 'Yemi',     role: 'Founder · London'   },
  { id: 'kemi',   x: 382, y: 72,  r: 7,  color: '#0ea5e9', label: 'Kemi',     role: 'Data · Berlin'      },
  { id: 'emeka',  x: 512, y: 402, r: 8,  color: '#14b8a6', label: 'Emeka',    role: 'Design · NYC'       },
  { id: 'aisha',  x: 328, y: 388, r: 7,  color: '#8b5cf6', label: 'Aisha',    role: 'Engineer · Nairobi' },
  // outer dim
  { id: 'o1', x: 74,  y: 82,  r: 4, color: '#334155', dim: true },
  { id: 'o2', x: 826, y: 165, r: 5, color: '#334155', dim: true },
  { id: 'o3', x: 62,  y: 432, r: 4, color: '#334155', dim: true },
  { id: 'o4', x: 820, y: 428, r: 5, color: '#334155', dim: true },
  { id: 'o5', x: 305, y: 462, r: 4, color: '#334155', dim: true },
  { id: 'o6', x: 596, y: 26,  r: 3, color: '#334155', dim: true },
  { id: 'o7', x: 755, y: 280, r: 4, color: '#334155', dim: true },
  { id: 'o8', x: 138, y: 218, r: 3, color: '#334155', dim: true },
];

const MESH_EDGES: MeshEdge[] = [
  { from: 'you',    to: 'ada',    color: '#14b8a6', opacity: 0.55, similarity: '89%' },
  { from: 'you',    to: 'tunde',  color: '#0ea5e9', opacity: 0.45, similarity: '74%' },
  { from: 'you',    to: 'chioma', color: '#14b8a6', opacity: 0.35 },
  { from: 'you',    to: 'yemi',   color: '#8b5cf6', opacity: 0.3  },
  { from: 'ada',    to: 'kemi',   color: '#8b5cf6', opacity: 0.28 },
  { from: 'tunde',  to: 'kemi',   color: '#0ea5e9', opacity: 0.28 },
  { from: 'chioma', to: 'emeka',  color: '#14b8a6', opacity: 0.38 },
  { from: 'yemi',   to: 'emeka',  color: '#8b5cf6', opacity: 0.25 },
  { from: 'aisha',  to: 'chioma', color: '#8b5cf6', opacity: 0.32 },
  { from: 'aisha',  to: 'emeka',  color: '#14b8a6', opacity: 0.25 },
  { from: 'ada',    to: 'chioma', color: '#475569', opacity: 0.2  },
  { from: 'tunde',  to: 'yemi',   color: '#475569', opacity: 0.18 },
];

/* ─── Hero background: grid + aurora ─── */
const HeroBg: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(20,184,166,0.18) 1.2px, transparent 1.2px)',
        backgroundSize: '56px 56px',
        backgroundPosition: '-1px -1px',
      }}
    />
    <div className="absolute -top-40 left-1/3 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-teal-400/[0.11] blur-[150px]" />
    <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full bg-violet-400/[0.07] blur-[130px]" />
    <div className="absolute bottom-10 -left-16 w-[360px] h-[360px] rounded-full bg-sky-400/[0.05] blur-[100px]" />
    <div className="absolute bottom-0 inset-x-0 h-72 bg-gradient-to-t from-white to-transparent" />
    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white/60 to-transparent" />
    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white/40 to-transparent" />
    <motion.div
      className="absolute inset-y-0 w-[600px] bg-gradient-to-r from-transparent via-teal-400/[0.02] to-transparent"
      initial={{ x: '-600px' }}
      animate={{ x: 'calc(100vw + 600px)' }}
      transition={{ duration: 3.4, ease: [0.25, 1, 0.5, 1], delay: 0.8 }}
    />
  </div>
);

/* ─── Animated hero portfolio card ─── */
const AnimatedPortfolioCard: React.FC = () => (
  <div className="relative select-none">
    <div className="absolute -inset-10 bg-gradient-to-br from-teal-400/14 via-transparent to-violet-400/10 rounded-[3rem] blur-3xl pointer-events-none" />
    <MotionDiv
      initial={{ opacity: 0, y: 36, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <MotionDiv
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.2 }}
      >
        <div
          className="relative w-[340px] rounded-[1.4rem] overflow-hidden bg-white"
          style={{ boxShadow: '0 32px 80px rgba(15,23,42,0.2), 0 0 0 1px rgba(15,23,42,0.06)' }}
        >
          {/* Chrome */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#f7f8fa] border-b border-slate-200/60">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400/80" />
            <div className="flex-1 mx-3 h-5 bg-slate-200/50 rounded-md flex items-center px-2.5 gap-1.5 overflow-hidden">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
              <span className="text-[10px] text-slate-400 font-medium truncate">janesmith.seeqme.com</span>
              <div className="ml-auto flex items-center gap-1 shrink-0">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-teal-500" />
                </span>
                <span className="text-[9px] text-teal-500 font-bold">LIVE</span>
              </div>
            </div>
          </div>

          {/* Portfolio body */}
          <div className="bg-[#0c1220]">
            <div className="relative h-14 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600/40 via-teal-400/25 to-violet-600/30" />
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
              <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-[#0c1220] to-transparent" />
            </div>

            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }} className="px-5 -mt-5 pb-5 space-y-3">
              <div className="flex items-end justify-between">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-300 to-teal-600 border-[2.5px] border-[#0c1220] shadow-lg shadow-teal-500/25" />
                  <MotionDiv
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.1, type: 'spring', stiffness: 340, damping: 18 }}
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-teal-500 border-2 border-[#0c1220] flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 text-white" />
                  </MotionDiv>
                </div>
                <MotionDiv
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="px-2.5 py-1 rounded-full bg-teal-500/12 border border-teal-500/20"
                >
                  <span className="text-[9px] font-bold text-teal-400 tracking-wide">Open to work</span>
                </MotionDiv>
              </div>

              <div>
                <MotionDiv
                  initial={{ clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ clipPath: 'inset(0 0% 0 0)' }}
                  transition={{ delay: 0.95, duration: 0.55, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <p className="text-white text-[14px] font-bold tracking-tight whitespace-nowrap">Jane Smith</p>
                </MotionDiv>
                <p className="text-slate-500 text-[11px] font-medium mt-0.5">Full-Stack Engineer · San Francisco</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {HERO_SKILLS.map((skill, i) => (
                  <MotionDiv
                    key={skill}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3 + i * 0.08, type: 'spring', stiffness: 400, damping: 22 }}
                    className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.09] text-[10px] font-semibold text-slate-400"
                  >
                    {skill}
                  </MotionDiv>
                ))}
              </div>

              <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.9, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-3 gap-1.5"
              >
                {[
                  { val: '12',   lbl: 'Projects',   accent: 'border-teal-500/20 bg-teal-500/[0.07]'   },
                  { val: '4.9k', lbl: 'Views/mo',   accent: 'border-violet-500/20 bg-violet-500/[0.07]' },
                  { val: '98',   lbl: 'SEO Score',  accent: 'border-sky-500/20 bg-sky-500/[0.07]'     },
                ].map(({ val, lbl, accent }) => (
                  <div key={lbl} className={`border ${accent} rounded-xl p-2.5 text-center`}>
                    <p className="text-[15px] font-black text-white leading-none mb-0.5">{val}</p>
                    <p className="text-[9px] text-slate-600 font-medium">{lbl}</p>
                  </div>
                ))}
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.35 }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.035] border border-white/[0.06]"
              >
                <span className="relative flex w-1.5 h-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-teal-400" />
                </span>
                <span className="text-[11px] text-slate-400 font-medium flex-1">3 recruiters viewed today</span>
                <span className="text-[10px] text-teal-500 font-bold">↑ 24%</span>
              </MotionDiv>
            </MotionDiv>
          </div>
        </div>
      </MotionDiv>
    </MotionDiv>

    {/* Floating: deployed */}
    <MotionDiv
      initial={{ opacity: 0, x: -20, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 2.6, duration: 0.5, type: 'spring', stiffness: 180, damping: 16 }}
      className="absolute -bottom-5 -left-10 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-900/12 border border-slate-100/80 px-3.5 py-2.5 flex items-center gap-2.5 z-10"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 shadow-md shadow-teal-500/30">
        <Check className="w-3.5 h-3.5 text-white" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-900 leading-none mb-0.5">Deployed to CDN</p>
        <p className="text-[10px] text-slate-400 font-medium">Cloudflare · 47ms TTFB</p>
      </div>
    </MotionDiv>

    {/* Floating: indexed */}
    <MotionDiv
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2.9, duration: 0.5, type: 'spring', stiffness: 180, damping: 16 }}
      className="absolute -top-4 -right-6 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg shadow-slate-900/10 border border-slate-100/80 px-3 py-2 flex items-center gap-1.5 z-10"
    >
      <div className="w-5 h-5 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
        <Search className="w-3 h-3 text-teal-600" />
      </div>
      <span className="text-[10px] font-bold text-slate-700">Indexed on Google</span>
    </MotionDiv>

    {/* Floating: recruiter */}
    <MotionDiv
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 3.2, type: 'spring', stiffness: 200, damping: 18 }}
      className="absolute top-[44%] -right-8 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg shadow-slate-900/10 border border-slate-100/80 px-3 py-2 flex items-center gap-2 z-10"
    >
      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 shrink-0" />
      <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">Recruiter viewed</span>
    </MotionDiv>
  </div>
);

/* ─── Mesh SVG visualization ─── */
const MeshViz: React.FC = () => {
  const getNode = (id: string) => MESH_NODES.find(n => n.id === id)!;

  return (
    <div className="relative w-full" style={{ paddingBottom: '53%' }}>
      <svg
        viewBox="0 0 900 480"
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="you-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </radialGradient>
          <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {MESH_EDGES.map((edge, i) => {
          const a = getNode(edge.from);
          const b = getNode(edge.to);
          const len = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
          return (
            <MotionLine
              key={i}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={edge.color}
              strokeWidth={1}
              strokeOpacity={edge.opacity}
              strokeDasharray={len}
              initial={{ strokeDashoffset: len }}
              whileInView={{ strokeDashoffset: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.9, ease: 'easeOut' }}
            />
          );
        })}

        {/* Similarity labels on key edges */}
        {MESH_EDGES.filter(e => e.similarity).map((edge, i) => {
          const a = getNode(edge.from);
          const b = getNode(edge.to);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          return (
            <MotionText
              key={`sim-${i}`}
              x={mx}
              y={my - 7}
              textAnchor="middle"
              fill="#14b8a6"
              fontSize={9}
              fontWeight={700}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.75 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2 + i * 0.15 }}
            >
              {edge.similarity}
            </MotionText>
          );
        })}

        {/* You-node halo pulse */}
        <MotionCircle
          cx={450} cy={240} r={36}
          fill="url(#you-halo)"
          animate={{ r: [36, 52, 36], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Dim outer nodes */}
        {MESH_NODES.filter(n => n.dim).map((n, i) => (
          <MotionCircle
            key={n.id}
            cx={n.x} cy={n.y} r={n.r}
            fill={n.color}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.35 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.05 }}
          />
        ))}

        {/* Main nodes + labels */}
        {MESH_NODES.filter(n => !n.dim).map((n, i) => (
          <g key={n.id} filter={n.id === 'you' ? 'url(#glow-filter)' : undefined}>
            <MotionCircle
              cx={n.x} cy={n.y} r={n.r}
              fill={n.color}
              initial={{ opacity: 0, r: 0 }}
              whileInView={{ opacity: n.id === 'you' ? 1 : 0.85, r: n.r }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.09, type: 'spring', stiffness: 260, damping: 20 }}
            />
            {n.label && (
              <motion.text
                x={n.x}
                y={n.y + n.r + 13}
                textAnchor="middle"
                fill="white"
                fontSize={n.id === 'you' ? 11 : 10}
                fontWeight={n.id === 'you' ? 800 : 600}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: n.id === 'you' ? 1 : 0.75 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.09 }}
              >
                {n.label}
              </motion.text>
            )}
            {n.role && n.id !== 'you' && (
              <motion.text
                x={n.x}
                y={n.y + n.r + 24}
                textAnchor="middle"
                fill="#64748b"
                fontSize={9}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.65 + i * 0.09 }}
              >
                {n.role}
              </motion.text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

/* ─── Footer ─── */
const Footer: React.FC = () => (
  <footer className="relative bg-[#020817] overflow-hidden">
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 bg-teal-500/[0.05] rounded-full blur-3xl pointer-events-none" />

    <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-10">
      <div className="flex flex-col md:flex-row md:items-start gap-12 md:gap-8 pb-12 border-b border-white/[0.06]">

        <div className="md:w-72 shrink-0">
          <div className="flex items-center gap-2.5 mb-4">
            <img src="/seeqme-logo-white.png" alt="SeeqMe" className="h-6 w-auto" />
            <span className="text-white font-bold text-sm tracking-tight">SeeqMe</span>
          </div>
          <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-7 max-w-[210px]">
            The professional identity network. Build your portfolio, join the mesh, get discovered.
          </p>
          <div className="flex gap-2">
            {([
              { Icon: Twitter,  href: 'https://twitter.com/seeqmeai',          label: 'Twitter'  },
              { Icon: Github,   href: 'https://github.com/seeqmeai',           label: 'GitHub'   },
              { Icon: Linkedin, href: 'https://linkedin.com/company/seeqmeai', label: 'LinkedIn' },
            ] as const).map(({ Icon, href, label }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-600 mb-5">Product</p>
            <ul className="space-y-3.5">
              {[['Builder', '/builder'], ['Templates', '/templates'], ['Plans', '/plans'], ['Mesh', '/app/mesh']].map(([l, h]) => (
                <li key={l}><Link to={h} className="text-[13px] text-slate-500 hover:text-slate-200 font-medium transition-colors duration-150">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-600 mb-5">Platform</p>
            <ul className="space-y-3.5">
              {[['Feed', '/app/feed'], ['Mesh', '/app/mesh'], ['Dashboard', '/dashboard'], ['Analytics', '/dashboard']].map(([l, h]) => (
                <li key={l}><Link to={h} className="text-[13px] text-slate-500 hover:text-slate-200 font-medium transition-colors duration-150">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-600 mb-5">Legal</p>
            <ul className="space-y-3.5">
              {[['Terms of Service', '/terms-of-service'], ['Privacy Policy', '/privacy-policy']].map(([l, h]) => (
                <li key={l}><Link to={h} className="text-[13px] text-slate-500 hover:text-slate-200 font-medium transition-colors duration-150">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-slate-700 font-medium">© 2026 SeeqMe AI. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-50" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-teal-500" />
          </span>
          <span className="text-[11px] text-slate-600 font-medium">All systems operational</span>
        </div>
      </div>
    </div>
  </footer>
);

/* ─── Page interface ─── */
interface LandingPageProps {
  onGetStarted: (initialData?: { type: string; value: string; templateId?: string }) => void;
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [selectedNiche, setSelectedNiche]   = useState('All');
  const [searchQuery, setSearchQuery]       = useState('');
  const [inputValue, setInputValue]         = useState('');
  const [isRecording, setIsRecording]       = useState(false);
  const [isDragging, setIsDragging]         = useState(false);
  const [selectedFile, setSelectedFile]     = useState<{ name: string; type: string; size: number; content?: string; url?: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading]       = useState(false);
  const [linkedInUrl]                       = useState('');
  const [displayLimit, setDisplayLimit]     = useState(12);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [focusedCard, setFocusedCard]       = useState<string | null>(null);
  const loaderRef   = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setSelectedTemplateId, setSynthesisInput } = useTemplate();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { templates, loading: templatesLoading } = usePublicTemplates();

  const shuffledTemplates  = useMemo(() => shuffleArray(templates), [templates]);
  const niches             = useMemo(() => ['All', ...new Set(templates.map(p => p.niche))], [templates]);
  const filteredTemplates  = useMemo(() => {
    const src = selectedNiche === 'All' ? shuffledTemplates : templates;
    return src.filter(tpl => {
      const matchNiche  = selectedNiche === 'All' || tpl.niche === selectedNiche;
      const matchSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || tpl.niche.toLowerCase().includes(searchQuery.toLowerCase());
      return matchNiche && matchSearch;
    });
  }, [selectedNiche, searchQuery, shuffledTemplates, templates]);
  const displayedTemplates = useMemo(() => filteredTemplates.slice(0, displayLimit), [filteredTemplates, displayLimit]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && filteredTemplates.length > 0 && !isFetchingMore) {
        setIsFetchingMore(true);
        setTimeout(() => { setDisplayLimit(p => p + 6); setIsFetchingMore(false); }, 600);
      }
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [filteredTemplates.length, isFetchingMore]);

  useEffect(() => { setDisplayLimit(12); }, [selectedNiche, searchQuery]);

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) { toast.error('Voice input not supported in this browser.'); return; }
    const r = new (window as any).webkitSpeechRecognition();
    r.onstart  = () => setIsRecording(true);
    r.onresult = (e: any) => { setInputValue(p => p + ' ' + e.results[0][0].transcript); setIsRecording(false); };
    r.onerror  = () => setIsRecording(false);
    r.onend    = () => setIsRecording(false);
    r.start();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!/\.(pdf|doc|docx|txt)$/i.test(file.name)) {
        toast.error('Please upload a PDF, DOC, or TXT file.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      await uploadFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true); setUploadProgress(0);
    try {
      const iv = setInterval(() => setUploadProgress(p => Math.min(p + 10, 90)), 200);
      const { uploadService } = await import('@/services/apiService');
      const { content } = await uploadService.extractCV(file);
      clearInterval(iv); setUploadProgress(100);
      setSelectedFile({ name: file.name, type: file.type, size: file.size, content });
    } catch (err: any) {
      toast.error(err.message || 'Could not parse your file.');
      setSelectedFile(null);
    } finally { setIsUploading(false); }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleBuild = async () => {
    if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
    if (!inputValue && !selectedFile && !linkedInUrl) { toast.error('Add a prompt or upload your CV to get started.'); return; }
    let fullInput = inputValue;
    if (selectedFile) {
      (window as any)._pendingFile = { filename: selectedFile.name, content: selectedFile.content || selectedFile.url, type: selectedFile.type };
      fullInput += '\n\n[Context: CV uploaded]';
    }
    if (linkedInUrl) fullInput += `\n\n[Context: LinkedIn Profile ${linkedInUrl}]`;
    fullInput += `\n\n[Niche: ${selectedNiche}]`;
    setSynthesisInput(fullInput);
    setSelectedTemplateId('');
    navigate('/builder');
  };

  return (
    <>
      <Helmet>
        <title>SeeqMe — The professional identity network</title>
        <meta name="description" content="Build your portfolio, join the professional discovery mesh, and get found by recruiters, collaborators, and investors who match your work. Free to start." />
        <link rel="canonical" href="https://seeqme.com/" />
        <meta property="og:title" content="SeeqMe — The professional identity network" />
        <meta property="og:description" content="Build your portfolio, enter the mesh, attract the right people." />
        <meta property="og:url" content="https://seeqme.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://seeqme.com/seeqme-logo-black.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SeeqMe — The professional identity network" />
        <meta name="twitter:description" content="Build your portfolio, enter the mesh, attract the right people." />
        <meta name="twitter:image" content="https://seeqme.com/seeqme-logo-black.png" />
      </Helmet>

      {/* ══════════ HERO ══════════ */}
      <div className="relative bg-white overflow-hidden">
        <HeroBg />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center mb-14 lg:mb-20">

            {/* Left */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6 max-w-lg mx-auto lg:mx-0">
             

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(2.6rem,7vw,4.8rem)] font-black tracking-[-0.045em] leading-[0.88] text-slate-900"
              >
                Build your profile.
                <br />
                <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                  The mesh finds your people.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="text-base md:text-[17px] text-slate-500 font-medium leading-relaxed max-w-md"
              >
                Upload your CV — AI builds your portfolio in 60 seconds. Your profile enters the professional discovery mesh and surfaces you to engineers, designers, and founders who match your work.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={() => document.getElementById('build')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                >
                  Build my profile <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/app/mesh')}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 border border-slate-200 hover:border-teal-300 bg-white text-slate-700 hover:text-teal-700 rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  Explore the mesh <Network className="w-4 h-4" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.44, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {PROOF_AVATARS.map((c, i) => <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white shadow-sm`} />)}
                  </div>
                  <span className="text-sm text-slate-500 font-medium">
                    <span className="text-slate-900 font-bold">1,200+</span> nodes in the mesh
                  </span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                  <span className="text-sm text-slate-400 font-medium ml-1">4.9 / 5</span>
                </div>
              </motion.div>
            </div>

            {/* Right: hero visual (desktop) */}
            <div className="hidden lg:flex justify-center items-center py-10">
              <AnimatedPortfolioCard />
            </div>
          </div>

          {/* Omni bar */}
          <MotionDiv
            id="build"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl mx-auto pb-28 scroll-mt-20"
            style={{ perspective: '1400px' }}
          >
            <MotionDiv
              initial={{ rotateX: 12 }}
              animate={{ rotateX: 0 }}
              transition={{ duration: 1.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'top center' }}
            >
              <div
                className={`rounded-2xl transition-all duration-300 ${isDragging ? 'shadow-[0_0_0_2px_rgba(13,148,136,0.4),0_24px_60px_rgba(15,23,42,0.18)]' : 'shadow-[0_0_0_1px_rgba(15,23,42,0.08),0_24px_60px_rgba(15,23,42,0.1)]'}`}
                onDragOver={(e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className="bg-white rounded-2xl overflow-hidden">
                  

                  <div className="px-5 pt-4 pb-2">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleBuild(); }}
                      placeholder="Describe your experience, paste your CV, or say what you do..."
                      className="w-full bg-transparent border-none focus:outline-none text-[15px] font-medium text-slate-800 placeholder:text-slate-300 resize-none min-h-[96px] max-h-[200px] leading-relaxed no-scrollbar"
                    />
                  </div>

                  <AnimatePresence>
                    {selectedFile && (
                      <MotionDiv
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-4 mb-3 px-3 py-2.5 bg-teal-50 border border-teal-100 rounded-xl flex items-center gap-3"
                      >
                        <div className="relative w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          {uploadProgress < 100 && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                              <span className="text-[9px] font-black text-teal-600">{uploadProgress}%</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-700 truncate">{selectedFile.name}</p>
                          <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wide">
                            {uploadProgress < 100 ? 'Parsing...' : 'CV analyzed — ready to build'}
                          </p>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </MotionDiv>
                    )}
                  </AnimatePresence>

                  <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                      <button onClick={startVoice} className={`p-2.5 rounded-xl transition-all ${isRecording ? 'text-rose-500 bg-rose-50 animate-pulse' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                        <Mic className="w-4 h-4" />
                      </button>
                      <button
                        disabled={isUploading || !!selectedFile?.name}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-40"
                      >
                        {isUploading ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Uploading…</> : <><Upload className="w-3.5 h-3.5" /> Upload CV</>}
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt" />
                    </div>
                    <button onClick={handleBuild} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold active:scale-95 transition-all">
                      Build <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 font-medium mt-3 select-none">
                Upload a CV or describe your role
                <span className="ml-2 opacity-50">⌘↵ to build</span>
              </p>
            </MotionDiv>
          </MotionDiv>
        </div>
      </div>

      {/* ══════════ MARQUEE ══════════ */}
      <div className="relative bg-white border-y border-slate-100 py-5 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="flex animate-[marquee_35s_linear_infinite] whitespace-nowrap gap-14 items-center">
          {[...INFRASTRUCTURE, ...INFRASTRUCTURE, ...INFRASTRUCTURE].map((name, idx) => (
            <span key={idx} className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase select-none">
              <span className="w-1 h-1 rounded-full bg-teal-400/60 shrink-0" />
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <div className="relative bg-[#060d18] py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Heading */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/[0.07] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-teal-400">How it works</span>
            </div>
            <h2 className="text-3xl md:text-[2.75rem] font-black tracking-[-0.04em] text-white leading-[0.95]">
              Three moves.
              <br />
              <span className="text-slate-500 font-semibold">Permanent presence.</span>
            </h2>
          </MotionDiv>

          {/* Step 1 */}
          <MotionDiv
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24"
          >
            {/* Text */}
            <div>
              <span className="text-[clamp(5rem,12vw,8rem)] font-black text-white/[0.04] leading-none select-none block -mb-4 -ml-1 tabular-nums">01</span>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
                  <Upload className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-teal-400">Build</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-4">
                Upload your CV.<br />Walk away.
              </h3>
              <p className="text-[14px] text-slate-400 font-medium leading-relaxed mb-6 max-w-sm">
                Drop your CV and our AI extracts skills, experience, and tone — then writes your bio, structures your projects, and deploys a live portfolio in under 60 seconds.
              </p>
              <div className="flex flex-wrap gap-2">
                {['60-second deploy', 'AI-written copy', 'Cloudflare CDN', 'Auto SSL'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-semibold text-slate-400">{tag}</span>
                ))}
              </div>
            </div>

            {/* Visual: Upload → Portfolio */}
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500/[0.05] rounded-3xl blur-3xl" />
              <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-3">
                {/* Upload zone */}
                <div className="border border-dashed border-teal-500/25 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-white truncate">resume_2026.pdf</p>
                    <div className="mt-1.5 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <MotionDiv
                        className="h-full bg-teal-500 rounded-full"
                        initial={{ width: '0%' }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-[10px] text-teal-400 font-semibold mt-1">Parsing skills, experience, tone…</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex flex-col items-center gap-1 py-1">
                    <ArrowDown className="w-4 h-4 text-slate-600" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-700">47 seconds</span>
                    <ArrowDown className="w-4 h-4 text-slate-600" />
                  </div>
                </div>

                {/* Portfolio card preview */}
                <div className="bg-[#0c1220] rounded-xl overflow-hidden border border-white/[0.06]">
                  <div className="h-8 bg-gradient-to-r from-teal-600/30 to-violet-600/20 relative">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 -mt-5 border-2 border-[#0c1220]" />
                      <div>
                        <p className="text-[12px] font-bold text-white">Jane Smith</p>
                        <p className="text-[10px] text-slate-500 font-medium">Full-Stack Engineer · San Francisco</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                      <span className="text-[9px] font-black text-teal-400">LIVE</span>
                    </div>
                  </div>
                  <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
                    {['React', 'TypeScript', 'Node.js', 'AWS'].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[9px] font-semibold text-slate-400">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-500/[0.08] border border-teal-500/15">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="text-[11px] font-bold text-teal-300">janesmith.seeqme.com is live · indexed in Google</span>
                </div>
              </div>
            </div>
          </MotionDiv>

          {/* Step 2 */}
          <MotionDiv
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24"
          >
            {/* Visual: Mini mesh (left on desktop) */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-violet-500/[0.05] rounded-3xl blur-3xl" />
              <div className="relative bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-white/[0.05]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Professional Mesh · Embedding</span>
                  <span className="flex items-center gap-1.5 text-[9px] font-black text-violet-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    Processing
                  </span>
                </div>
                {/* Simplified mesh SVG */}
                <div className="p-4">
                  <svg viewBox="0 0 320 200" className="w-full" style={{ overflow: 'visible' }}>
                    <defs>
                      <radialGradient id="hiw-halo" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {/* Static dim nodes */}
                    {[{x:48,y:42},{x:272,y:55},{x:38,y:158},{x:285,y:162},{x:160,y:18},{x:160,y:182}].map((n,i) => (
                      <circle key={i} cx={n.x} cy={n.y} r={4} fill="#1e293b" />
                    ))}
                    {/* Edges from "you" */}
                    {[
                      {x1:160,y1:100,x2:80,y2:55,c:'#14b8a6',o:0.5},
                      {x1:160,y1:100,x2:242,y2:62,c:'#0ea5e9',o:0.4},
                      {x1:160,y1:100,x2:68,y2:148,c:'#14b8a6',o:0.35},
                      {x1:160,y1:100,x2:256,y2:145,c:'#8b5cf6',o:0.3},
                      {x1:80,y1:55,x2:48,y2:42,c:'#475569',o:0.2},
                      {x1:242,y1:62,x2:272,y2:55,c:'#475569',o:0.2},
                    ].map((e,i) => {
                      const len = Math.sqrt((e.x2-e.x1)**2+(e.y2-e.y1)**2);
                      return (
                        <MotionLine key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                          stroke={e.c} strokeWidth={1} strokeOpacity={e.o}
                          strokeDasharray={len} initial={{strokeDashoffset:len}}
                          whileInView={{strokeDashoffset:0}} viewport={{once:true}}
                          transition={{delay:0.3+i*0.12,duration:0.7,ease:'easeOut'}}
                        />
                      );
                    })}
                    {/* Named nodes */}
                    {[
                      {x:80,y:55,c:'#8b5cf6',l:'Ada O.',r:'Designer'},
                      {x:242,y:62,c:'#0ea5e9',l:'Tunde K.',r:'PM'},
                      {x:68,y:148,c:'#14b8a6',l:'Chioma',r:'Dev'},
                      {x:256,y:145,c:'#8b5cf6',l:'Yemi',r:'Founder'},
                    ].map((n,i) => (
                      <g key={n.l}>
                        <MotionCircle cx={n.x} cy={n.y} r={7} fill={n.c}
                          initial={{opacity:0,r:0}} whileInView={{opacity:0.85,r:7}}
                          viewport={{once:true}} transition={{delay:0.5+i*0.1,type:'spring',stiffness:260,damping:20}}
                        />
                        <motion.text x={n.x} y={n.y+18} textAnchor="middle" fill="white" fontSize={8} fontWeight={600}
                          initial={{opacity:0}} whileInView={{opacity:0.7}} viewport={{once:true}}
                          transition={{delay:0.8+i*0.1}}
                        >{n.l}</motion.text>
                      </g>
                    ))}
                    {/* You */}
                    <MotionCircle cx={160} cy={100} r={36} fill="url(#hiw-halo)"
                      animate={{r:[36,48,36],opacity:[0.7,0,0.7]}}
                      transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
                    />
                    <circle cx={160} cy={100} r={11} fill="#8b5cf6" />
                    <motion.text x={160} y={120} textAnchor="middle" fill="#a78bfa" fontSize={9} fontWeight={800}
                      initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:0.4}}
                    >You</motion.text>
                  </svg>
                </div>

                <div className="px-4 pb-4 space-y-2">
                  <div className="flex items-center justify-between py-2 border-t border-white/[0.05]">
                    <span className="text-[11px] text-slate-500 font-medium">Vector dimensions</span>
                    <span className="text-[11px] font-black text-violet-400 font-mono">1536-dim</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-white/[0.05]">
                    <span className="text-[11px] text-slate-500 font-medium">Nearest neighbours found</span>
                    <span className="text-[11px] font-black text-teal-400 font-mono">4 edges formed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <span className="text-[clamp(5rem,12vw,8rem)] font-black text-white/[0.04] leading-none select-none block -mb-4 -ml-1 tabular-nums">02</span>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                  <Network className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-violet-400">Embed</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-4">
                Your profile becomes<br />a node in the graph.
              </h3>
              <p className="text-[14px] text-slate-400 font-medium leading-relaxed mb-6 max-w-sm">
                Every profile is embedded as a 1536-dimensional vector and projected into the professional graph. Cosine similarity above 0.35 forms an edge. You're connected to people who match your work — without searching.
              </p>
              <div className="flex flex-wrap gap-2">
                {['ada-002 embedding', 'UMAP projection', 'ANN matching', 'Nightly update'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-semibold text-slate-400">{tag}</span>
                ))}
              </div>
            </div>
          </MotionDiv>

          {/* Step 3 */}
          <MotionDiv
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          >
            {/* Text */}
            <div>
              <span className="text-[clamp(5rem,12vw,8rem)] font-black text-white/[0.04] leading-none select-none block -mb-4 -ml-1 tabular-nums">03</span>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-sky-400">Discover</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-4">
                The right people<br />find you.
              </h3>
              <p className="text-[14px] text-slate-400 font-medium leading-relaxed mb-6 max-w-sm">
                Recruiters, collaborators, and investors discover you through similarity — not keyword search. Post updates and they ripple through your cluster, landing precisely where they matter.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Zero cold outreach', 'Similarity-ranked', 'Posts as signals', 'Real-time alerts'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-semibold text-slate-400">{tag}</span>
                ))}
              </div>
            </div>

            {/* Visual: discovery notifications */}
            <div className="relative">
              <div className="absolute inset-0 bg-sky-500/[0.04] rounded-3xl blur-3xl" />
              <div className="relative space-y-2.5">
                {[
                  { icon: '👁', color: 'border-sky-500/20 bg-sky-500/[0.06]', iconColor: 'text-sky-400', title: 'Elena M. viewed your profile', sub: 'Senior Recruiter · Google · Mountain View', time: '2 min ago', badge: 'Recruiter' },
                  { icon: '🔗', color: 'border-teal-500/20 bg-teal-500/[0.06]', iconColor: 'text-teal-400', title: 'Ada O. wants to connect', sub: 'Designer · Lagos — 89% similarity match', time: '14 min ago', badge: 'Connection' },
                  { icon: '💬', color: 'border-violet-500/20 bg-violet-500/[0.06]', iconColor: 'text-violet-400', title: 'Tunde K. messaged you', sub: '"Your work on distributed systems is exactly what we need…"', time: '1 hr ago', badge: 'Message' },
                  { icon: '⭐', color: 'border-amber-500/20 bg-amber-500/[0.06]', iconColor: 'text-amber-400', title: 'Yemi A. saved your portfolio', sub: 'Founder · London — 63% similarity match', time: '3 hr ago', badge: 'Saved' },
                ].map(({ icon, color, iconColor, title, sub, time, badge }, i) => (
                  <MotionDiv
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border ${color} backdrop-blur-sm`}
                  >
                    <div className={`w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg shrink-0`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-[12px] font-bold text-white truncate">{title}</p>
                        <span className={`text-[9px] font-black uppercase tracking-wider shrink-0 ${iconColor}`}>{badge}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{sub}</p>
                    </div>
                    <span className="text-[10px] text-slate-700 font-medium shrink-0 tabular-nums">{time}</span>
                  </MotionDiv>
                ))}
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>

      {/* ══════════ STATS ══════════ */}
      <div className="relative bg-white py-20 px-4 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(20,184,166,0.03) 0%, transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {STATS.map(({ value, label }, i) => (
              <MotionDiv
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center py-10 sm:py-0"
              >
                <span className="text-[clamp(2.8rem,6vw,4rem)] font-black text-slate-900 tracking-tight tabular-nums leading-none">{value}</span>
                <span className="text-sm text-slate-400 font-medium mt-2.5">{label}</span>
              </MotionDiv>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ FEATURES ══════════ */}
      <div className="relative py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 15% 20%, rgba(20,184,166,0.09) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 80%, rgba(139,92,246,0.06) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 70% 10%, rgba(59,130,246,0.04) 0%, transparent 50%), #ffffff' }} />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.055) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-300/40 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent" />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white/60 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16"
          >
            <div>
             
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.035em] leading-tight text-slate-900 max-w-sm">
                Everything the platform
                <br />
                runs on.{' '}
                <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">All of it.</span>
              </h2>
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed sm:text-right">
              Portfolio generation, mesh embedding, social layer, and analytics — wired together from day one.
            </p>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, tag, title, desc, accent }, i) => {
              const tagColors: Record<string, string> = {
                Portfolio: 'bg-teal-50 text-teal-600 border-teal-100',
                Mesh:      'bg-violet-50 text-violet-600 border-violet-100',
                Analytics: 'bg-sky-50 text-sky-600 border-sky-100',
              };
              const iconColors: Record<string, string> = {
                teal:   'from-teal-50 to-teal-100/60 border-teal-100 text-teal-600',
                violet: 'from-violet-50 to-violet-100/60 border-violet-100 text-violet-600',
                sky:    'from-sky-50 to-sky-100/60 border-sky-100 text-sky-600',
              };
              return (
                <MotionDiv
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative bg-white rounded-2xl p-7 border border-slate-100/80 hover:border-teal-100 hover:shadow-xl hover:shadow-teal-500/[0.07] hover:-translate-y-1 transition-all duration-300 cursor-default shadow-sm shadow-slate-900/[0.04]"
                >
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ${iconColors[accent]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.3em] px-2 py-1 rounded-full border ${tagColors[tag]}`}>{tag}</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-slate-900 mb-2.5 tracking-tight leading-snug">{title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{desc}</p>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════ MESH SECTION ══════════ */}
      <div className="relative bg-[#060d18] py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-1/3 left-0 w-80 h-80 bg-teal-500/[0.08] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-violet-500/[0.07] rounded-full blur-3xl" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 items-center">

            {/* Left: copy */}
            <div className="lg:col-span-2">
              <MotionDiv
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/[0.07] mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-violet-400">Discovery Engine</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black tracking-[-0.04em] text-white leading-[0.95] mb-5">
                  You don't find people.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-teal-400">
                    They find you.
                  </span>
                </h2>

                <p className="text-[14px] text-slate-400 font-medium leading-relaxed mb-8">
                  Every profile is embedded as a 1536-dimensional vector and projected into a 2D professional graph using UMAP. Similarity above 0.35 cosine forms an edge. Posts become comets that land near their cluster and attract matching nodes.
                </p>

                <div className="space-y-4">
                  {[
                    { label: 'Similarity threshold',       value: '0.35 cosine'   },
                    { label: 'Nearest neighbours per node', value: 'Top 20 via ANN' },
                    { label: 'Mesh recomputation',          value: 'Nightly 2 AM'  },
                    { label: 'Embedding model',             value: 'ada-002 · 1536-dim' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                      <span className="text-[12px] text-slate-500 font-medium">{label}</span>
                      <span className="text-[12px] text-teal-400 font-bold font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </MotionDiv>
            </div>

            {/* Right: mesh visualization */}
            <MotionDiv
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.04] to-violet-500/[0.04]" />
                <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Professional Mesh · Live</span>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                      <span className="relative w-1.5 h-1.5 rounded-full bg-teal-500" />
                    </span>
                    <span className="text-[9px] text-teal-500 font-bold">2,400 nodes</span>
                  </div>
                </div>
                <div className="mt-6">
                  <MeshViz />
                </div>
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>

      {/* ══════════ TEMPLATES ══════════ */}
      <section className="relative bg-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 justify-between mb-14">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-teal-600 mb-3">Template library</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.035em] text-slate-900 leading-tight">
                Start with a design.
                <br />
                <span className="text-slate-400 font-medium">Make it yours.</span>
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:items-start">
              <div className="relative">
                <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by role or industry..."
                  className="w-full sm:w-64 bg-white border border-slate-200 rounded-full py-3 pl-11 pr-5 text-sm font-medium focus:border-slate-400 focus:ring-0 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {niches.map(n => (
                  <button
                    key={n}
                    onClick={() => setSelectedNiche(n)}
                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all border whitespace-nowrap ${selectedNiche === n ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            onClick={(e) => { if ((e.target as HTMLElement).closest('[data-card]') === null) setFocusedCard(null); }}
          >
            {displayedTemplates.map((tpl, i) => {
              const isFocused = focusedCard === tpl.id;
              const applyTemplate = () => {
                if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
                sessionStorage.setItem('seeqme_template_override', tpl.id);
                setSelectedTemplateId(tpl.id);
                setSynthesisInput('');
                onGetStarted({ type: 'template', value: tpl.id, templateId: tpl.id });
              };
              return (
                <MotionDiv
                  key={`${tpl.id}-${i}`}
                  data-card="true"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: (i % 3) * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setFocusedCard(isFocused ? null : tpl.id)}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${isFocused ? 'ring-2 ring-slate-900 ring-offset-2 shadow-2xl shadow-slate-900/15 -translate-y-1' : 'border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-900/6 hover:-translate-y-0.5'}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                    <img src={tpl.preview} alt={tpl.name} className={`w-full h-full object-cover transition-transform duration-700 ${isFocused ? 'scale-105' : 'group-hover:scale-105'}`} loading="lazy" />
                    <div className={`absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-transparent transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    {tpl.isNew && <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-teal-500 text-white text-[9px] font-black uppercase tracking-widest z-10">New</div>}
                    <AnimatePresence>
                      {isFocused && (
                        <MotionDiv
                          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.15 }}
                          className="absolute top-3 right-3 z-20"
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); setFocusedCard(null); }}
                        >
                          <div className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        </MotionDiv>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {isFocused && (
                        <MotionDiv
                          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute bottom-0 left-0 right-0 p-4 z-10"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <button onClick={applyTemplate} className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-sm font-bold shadow-xl active:scale-[0.98] transition-all">
                            <Check className="w-4 h-4" /> Use This Template
                          </button>
                        </MotionDiv>
                      )}
                    </AnimatePresence>
                    {!isFocused && (
                      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Select</span>
                        <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={`px-5 py-4 flex items-center justify-between transition-colors duration-300 ${isFocused ? 'bg-slate-950' : 'bg-white'}`}>
                    <div>
                      <h3 className={`text-sm font-bold tracking-tight ${isFocused ? 'text-white' : 'text-slate-900'}`}>{tpl.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isFocused ? 'text-teal-400' : 'text-teal-600'}`}>{tpl.niche}</span>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isFocused ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                      {isFocused ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </MotionDiv>
              );
            })}
            {(isFetchingMore || templatesLoading) && Array.from({ length: 3 }).map((_, i) => <TemplateCardSkeleton key={`sk-${i}`} />)}
          </div>

          <div ref={loaderRef} className="h-16 flex justify-center items-center mt-6">
            {isFetchingMore && <Loader className="w-5 h-5 animate-spin text-slate-300" />}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <div className="relative overflow-hidden bg-[#020817] py-28 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[420px] bg-teal-500/[0.11] rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-1/4 w-[320px] h-[320px] bg-violet-500/[0.08] rounded-full blur-[100px]" />
          <div className="absolute top-0 left-1/4 w-[240px] h-[240px] bg-sky-500/[0.06] rounded-full blur-[90px]" />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
        </div>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative z-10 max-w-xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/[0.07] mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-teal-400">Free to start</span>
          </div>
          <h2 className="text-4xl md:text-[3.2rem] font-black tracking-[-0.04em] text-white mb-5 leading-[0.93]">
            Join the mesh.
            <br />
            Get found.
          </h2>
          <p className="text-slate-400 text-base font-medium mb-10 leading-relaxed">
            Build your professional identity in 60 seconds. Your profile enters the discovery graph automatically. No cold outreach. No guesswork.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => document.getElementById('build')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center justify-center gap-2 px-7 py-3.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-500/25 active:scale-95 transition-all"
            >
              Build my profile <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/plans')}
              className="flex items-center justify-center gap-2 px-7 py-3.5 border border-white/15 hover:border-white/25 text-white/60 hover:text-white rounded-xl text-sm font-bold transition-all"
            >
              See pricing <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </MotionDiv>
      </div>

      {/* ══════════ FOOTER ══════════ */}
      <Footer />

      <ConfirmModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={() => navigate('/auth/signup')}
        title="Sign in to continue"
        description="Create a free account to build and publish your portfolio in under a minute."
        confirmText="Create Account"
        cancelText="Maybe later"
        variant="info"
      />

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default React.memo(LandingPage);
