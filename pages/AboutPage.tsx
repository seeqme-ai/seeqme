import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Zap, Globe, Users, Shield, ArrowRight, Cpu, BarChart3,
  Layers, Sparkles, CheckCircle2, Target, Heart, Lightbulb,
} from 'lucide-react';

const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── Stat chip ─── */
const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-900/4">
    <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
    <span className="text-xs font-semibold text-slate-500 text-center leading-snug">{label}</span>
  </div>
);

/* ─── Pillar card ─── */
const Pillar: React.FC<{ icon: React.ElementType; color: string; bg: string; title: string; body: string }> = ({
  icon: Icon, color, bg, title, body,
}) => (
  <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 group">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <h3 className="text-[15px] font-black text-slate-900 mb-1.5 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
    </div>
  </div>
);

/* ─── Value card ─── */
const Value: React.FC<{ icon: React.ElementType; title: string; body: string }> = ({ icon: Icon, title, body }) => (
  <MotionDiv {...fadeUp()} className="flex gap-4">
    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-teal-600" />
    </div>
    <div>
      <h4 className="text-[14px] font-black text-slate-900 mb-1">{title}</h4>
      <p className="text-[13px] text-slate-500 leading-relaxed">{body}</p>
    </div>
  </MotionDiv>
);

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Helmet>
        <title>About — SeeqMe AI</title>
        <meta
          name="description"
          content="Learn about SeeqMe — the AI-powered professional identity platform that builds your portfolio, deploys it live in seconds, and connects you with the people who matter."
        />
        <meta property="og:title" content="About — SeeqMe AI" />
        <meta
          property="og:description"
          content="We're building the professional identity layer for the internet. AI-crafted portfolios, real-time professional discovery, and a global mesh network."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://seeqme.com/about" />
        <link rel="canonical" href="https://seeqme.com/about" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About — SeeqMe AI" />
        <meta name="twitter:description" content="AI-crafted portfolios, deployed globally, indexed by Google from day one." />
      </Helmet>

      {/* ══ HERO ══ */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 60% 0%, rgba(20,184,166,0.09) 0%, transparent 65%), #020817',
        }}
      >
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.016)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.016)_1px,transparent_1px)] bg-[size:52px_52px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-500/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-teal-500/[0.07] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-24 text-center">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-8"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
              <span className="relative rounded-full h-1.5 w-1.5 bg-teal-400" />
            </span>
            Our mission
          </MotionDiv>

          <MotionH1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2.6rem,7vw,5rem)] font-black tracking-[-0.045em] leading-[0.9] text-white mb-7"
          >
            Built for the professionals
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-teal-600">
              the world should already know.
            </span>
          </MotionH1>

          <MotionP
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="text-[17px] text-slate-400 leading-relaxed font-medium max-w-2xl mx-auto mb-10"
          >
            SeeqMe is where ambitious professionals build a digital presence that actually gets them noticed —
            with AI-generated portfolios, a global professional mesh, and discoverability built in from day one.
          </MotionP>

          <MotionDiv
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/builder"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-black rounded-full shadow-lg shadow-teal-500/25 transition-all active:scale-95"
            >
              Start building free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/plans"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-full transition-all"
            >
              See plans
            </Link>
          </MotionDiv>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="bg-slate-50 border-y border-slate-100 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: '2,400+', label: 'Professionals on the platform' },
              { value: '60s',    label: 'Average CV-to-live-site time' },
              { value: '180+',   label: 'Countries represented' },
              { value: '99.9%',  label: 'Deployment uptime' },
            ].map(s => (
              <MotionDiv key={s.value} {...fadeUp()}>
                <Stat {...s} />
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STORY ══ */}
      <section className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <MotionDiv {...fadeUp()}>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-4">Our story</p>
            <h2 className="text-4xl font-black tracking-tight leading-[1.05] mb-6">
              Great professionals
              <br />
              <span className="text-slate-400">shouldn't be invisible.</span>
            </h2>
            <div className="space-y-4 text-[15px] text-slate-600 leading-relaxed">
              <p>
                We built SeeqMe because we kept watching talented engineers, designers, writers, and founders
                get overlooked — not because their work wasn't exceptional, but because their online presence
                didn't reflect it. A LinkedIn profile buried in a feed. A resume that never gets opened.
                A GitHub full of work nobody else can navigate.
              </p>
              <p>
                The tools that existed either took hours to set up, required design skills most people
                don't have, or produced generic output that looked like everyone else. We believed there
                was a better way: give every professional an AI that knows how to tell their story — and
                then put that story in front of the right people.
              </p>
              <p>
                SeeqMe is the result. A platform that takes your CV or a few sentences and builds a
                stunning, SEO-optimized, fully deployed portfolio in under 60 seconds — then connects
                you to a network of professionals who are actively looking for exactly what you offer.
              </p>
            </div>
          </MotionDiv>

          <MotionDiv {...fadeUp(0.1)} className="relative">
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px]" />
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-5">
                {[
                  { check: true, text: 'Upload your CV or type a prompt' },
                  { check: true, text: 'AI writes your bio, projects & skills' },
                  { check: true, text: 'Portfolio deployed to a live URL' },
                  { check: true, text: 'Google-indexed from day one' },
                  { check: true, text: 'Connect your custom domain' },
                  { check: true, text: 'Discovered via professional mesh' },
                ].map(({ check, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-500/15 border border-teal-500/25 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-teal-400" />
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-teal-500 text-slate-950 text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-xl shadow-teal-500/30 rotate-2">
              Free to start
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* ══ THREE PILLARS ══ */}
      <section className="bg-slate-50 border-y border-slate-100 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <MotionDiv {...fadeUp()} className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-3">What we're building</p>
            <h2 className="text-4xl font-black tracking-tight leading-tight">
              Three products.{' '}
              <span className="text-slate-400">One platform.</span>
            </h2>
          </MotionDiv>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: Cpu,
                color: 'text-teal-600',
                bg: 'bg-teal-50 border border-teal-100',
                title: 'AI Portfolio Builder',
                body: 'Upload a CV or type a prompt. The AI writes your bio, structures your projects, generates tailored copy, and deploys a fully live portfolio — all in under 60 seconds.',
              },
              {
                icon: Globe,
                color: 'text-violet-600',
                bg: 'bg-violet-50 border border-violet-100',
                title: 'Professional Mesh',
                body: 'A real-time discovery network where you appear to the people actively searching for your skills. Recruiters, collaborators, clients, and investors — all looking for someone like you.',
              },
              {
                icon: BarChart3,
                color: 'text-amber-600',
                bg: 'bg-amber-50 border border-amber-100',
                title: 'Portfolio Analytics',
                body: 'Know exactly who is viewing your portfolio, where they came from, and which sections hold their attention. Data that turns passive visitors into active opportunities.',
              },
            ].map((p, i) => (
              <MotionDiv key={p.title} {...fadeUp(i * 0.08)}>
                <Pillar {...p} />
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <MotionDiv {...fadeUp()} className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-3">Capabilities</p>
          <h2 className="text-4xl font-black tracking-tight leading-tight">
            Everything a professional needs.
            <br />
            <span className="text-slate-400">Nothing they don't.</span>
          </h2>
        </MotionDiv>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
          {[
            { icon: Sparkles, title: 'AI-generated content', body: 'Your bio, skill summaries, project descriptions, and headlines — all written by AI, tuned to your industry.' },
            { icon: Zap,      title: 'Live in 60 seconds',  body: 'From CV upload to a publicly accessible, HTTPS-secured URL. No hosting setup. No DNS headaches.' },
            { icon: Globe,    title: 'Custom domains',       body: 'Connect any domain you own in one click. Automatic SSL provisioning. Professional URLs that you actually own.' },
            { icon: Layers,   title: 'Template library',    body: 'Dozens of professionally designed templates covering every niche — tech, design, finance, creative, and more.' },
            { icon: Target,   title: 'SEO out of the box',  body: 'Every portfolio ships with structured metadata, Open Graph tags, canonical URLs, and a sitemap entry.' },
            { icon: Shield,   title: 'Enterprise security', body: 'SOC 2-aligned infrastructure, end-to-end HTTPS, and data residency options for teams that need it.' },
          ].map((f, i) => (
            <MotionDiv key={f.title} {...fadeUp(i * 0.05)} className="flex gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <f.icon className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="text-[14px] font-black text-slate-900 mb-1">{f.title}</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            </MotionDiv>
          ))}
        </div>
      </section>

      {/* ══ VALUES ══ */}
      <section className="bg-slate-50 border-y border-slate-100 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <MotionDiv {...fadeUp()}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-4">What we stand for</p>
              <h2 className="text-4xl font-black tracking-tight leading-[1.05] mb-6">
                Principles we
                <br />
                <span className="text-slate-400">don't compromise on.</span>
              </h2>
              <p className="text-[15px] text-slate-500 leading-relaxed">
                We build for the long term. That means being honest about what the product does,
                protecting user data like it's our own, and shipping features that genuinely matter
                to the professionals who trust us with their identity online.
              </p>
            </MotionDiv>

            <div className="space-y-7">
              {[
                {
                  icon: Heart,
                  title: 'Built around real users',
                  body: 'Every feature ships because a professional asked for it. We talk to our users constantly and build what they actually need — not what looks good in a deck.',
                },
                {
                  icon: Shield,
                  title: 'Your data is yours',
                  body: 'We will never sell your professional data, use it to train third-party models without consent, or share it without explicit permission. Full stop.',
                },
                {
                  icon: Lightbulb,
                  title: 'Honest AI',
                  body: 'Our AI suggests. You decide. Every piece of generated content is editable, overridable, and presented as a starting point — not a final answer.',
                },
                {
                  icon: Users,
                  title: 'Accessibility first',
                  body: 'Every template meets WCAG 2.1 AA contrast standards. Screen-reader compatible HTML. Professional portfolios that everyone can read.',
                },
              ].map(v => (
                <Value key={v.title} {...v} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHO WE SERVE ══ */}
      <section className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <MotionDiv {...fadeUp()} className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-3">Who uses SeeqMe</p>
          <h2 className="text-4xl font-black tracking-tight">
            Every kind of professional.
          </h2>
        </MotionDiv>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            'Software Engineers', 'Product Designers', 'Data Scientists',
            'Product Managers', 'Founders', 'Marketers',
            'Researchers', 'Content Creators', 'Consultants',
            'Architects', 'Finance Analysts', 'Legal Professionals',
          ].map((role, i) => (
            <MotionDiv
              key={role}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center text-center px-3 py-3 rounded-xl bg-white border border-slate-100 text-[11px] font-semibold text-slate-600 shadow-sm hover:border-teal-200 hover:text-teal-700 transition-colors cursor-default"
            >
              {role}
            </MotionDiv>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:52px_52px]" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-56 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 sm:py-32 text-center">
          <MotionDiv {...fadeUp()}>
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/15 flex items-center justify-center mx-auto mb-8 shadow-[0_0_32px_rgba(20,184,166,0.15)]">
              <Zap className="w-6 h-6 text-teal-400" />
            </div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight text-white leading-[1.05] mb-5">
              Ready to get seen?
            </h2>
            <p className="text-[16px] text-slate-400 font-medium leading-relaxed mb-10 max-w-xl mx-auto">
              Upload your CV or type a prompt and have your portfolio live in under 60 seconds —
              no credit card required, no design skills needed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/builder"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-black rounded-full shadow-xl shadow-teal-500/25 transition-all active:scale-95"
              >
                Build my portfolio <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-full transition-all"
              >
                Talk to the team
              </Link>
            </div>
          </MotionDiv>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
