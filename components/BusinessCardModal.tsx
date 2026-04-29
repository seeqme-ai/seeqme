import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { X, Download, Printer, Mail, Phone, Globe, Check, Loader2, CreditCard, ChevronLeft, ChevronRight, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Portfolio } from '../types';

interface BusinessCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
}

type CardTemplate = 'studio' | 'noir' | 'pure' | 'gradient' | 'vivid';

const TEMPLATES: { id: CardTemplate; label: string; dot: string; desc: string }[] = [
  { id: 'studio',   label: 'Studio',   dot: 'bg-teal-500',   desc: 'Clean white' },
  { id: 'noir',     label: 'Noir',     dot: 'bg-slate-800',  desc: 'Dark minimal' },
  { id: 'pure',     label: 'Pure',     dot: 'bg-slate-300',  desc: 'Ultra-minimal' },
  { id: 'gradient', label: 'Gradient', dot: 'bg-gradient-to-br from-teal-400 to-emerald-500', desc: 'Teal gradient' },
  { id: 'vivid',    label: 'Vivid',    dot: 'bg-violet-600', desc: 'Bold violet' },
];

function extractCardData(portfolio: Portfolio) {
  const sc = portfolio.structuredContent;
  const sections: any[] = sc?.sections || [];
  let name = '', title = '', email = '', phone = '';

  for (const section of sections) {
    const c = section.content || {};
    if (!name && (c.fullName || c.name)) name = c.fullName || c.name;
    if (!title && c.title) title = c.title;
    if (!email && c.email) email = c.email;
    if (!phone && c.phone) phone = c.phone;
    if (!email && Array.isArray(c.socials)) {
      const emailSocial = c.socials.find((s: any) => s.platform?.toLowerCase() === 'email');
      if (emailSocial) email = emailSocial.url || emailSocial.handle;
    }
  }
  return { name, title, email, phone };
}

type CardProps = { name: string; title: string; email: string; phone: string; url: string; qr: string };

/* ── Studio — white + teal left stripe ──────────────────────────────────── */
const StudioCard: React.FC<CardProps> = ({ name, title, email, phone, url, qr }) => (
  <div className="relative w-[350px] h-[200px] bg-white rounded-xl shadow-2xl overflow-hidden flex"
    style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
    <div className="w-2.5 h-full bg-gradient-to-b from-teal-500 to-teal-700 shrink-0" />
    <div className="flex-1 flex flex-col justify-between px-5 py-4">
      <div>
        <p className="text-[17px] font-black text-slate-900 leading-tight tracking-tight">{name || 'Your Name'}</p>
        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mt-0.5">{title || 'Your Title'}</p>
      </div>
      <div className="space-y-1">
        {email && <div className="flex items-center gap-1.5"><Mail className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span className="text-[9px] font-medium text-slate-500 truncate">{email}</span></div>}
        {phone && <div className="flex items-center gap-1.5"><Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span className="text-[9px] font-medium text-slate-500">{phone}</span></div>}
        <div className="flex items-center gap-1.5"><Globe className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span className="text-[9px] font-medium text-slate-500 truncate">{url}</span></div>
      </div>
      <p className="text-[7px] font-bold uppercase tracking-widest text-slate-300">Built with SeeqMe AI</p>
    </div>
    <div className="flex items-center justify-center px-4">
      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
        {qr ? <img src={qr} alt="QR" className="w-[80px] h-[80px]" /> : <div className="w-[80px] h-[80px] bg-slate-100 animate-pulse rounded" />}
      </div>
    </div>
  </div>
);

/* ── Noir — dark slate + teal glow ──────────────────────────────────────── */
const NoirCard: React.FC<CardProps> = ({ name, title, email, phone, url, qr }) => (
  <div className="relative w-[350px] h-[200px] bg-[#0a0f1a] rounded-xl shadow-2xl overflow-hidden flex"
    style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
    <div className="absolute top-0 right-0 w-56 h-56 bg-teal-500/[0.08] rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-500/[0.05] rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none" />
    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-teal-500/30 to-transparent" />
    <div className="flex-1 flex flex-col justify-between px-6 py-5 relative z-10">
      <div>
        <p className="text-[17px] font-black text-white leading-tight tracking-tight">{name || 'Your Name'}</p>
        <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mt-0.5">{title || 'Your Title'}</p>
      </div>
      <div className="space-y-1">
        {email && <div className="flex items-center gap-1.5"><Mail className="w-2.5 h-2.5 text-slate-600 shrink-0" /><span className="text-[9px] font-medium text-slate-400 truncate">{email}</span></div>}
        {phone && <div className="flex items-center gap-1.5"><Phone className="w-2.5 h-2.5 text-slate-600 shrink-0" /><span className="text-[9px] font-medium text-slate-400">{phone}</span></div>}
        <div className="flex items-center gap-1.5"><Globe className="w-2.5 h-2.5 text-slate-600 shrink-0" /><span className="text-[9px] font-medium text-slate-400 truncate">{url}</span></div>
      </div>
      <p className="text-[7px] font-bold uppercase tracking-widest text-slate-700">Built with SeeqMe AI</p>
    </div>
    <div className="flex items-center justify-center px-5 relative z-10">
      <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
        {qr ? <div className="w-[76px] h-[76px] bg-white rounded-lg overflow-hidden p-1"><img src={qr} alt="QR" className="w-full h-full" /></div>
             : <div className="w-[76px] h-[76px] bg-white/10 animate-pulse rounded-lg" />}
      </div>
    </div>
  </div>
);

/* ── Pure — ultra-minimal white ─────────────────────────────────────────── */
const PureCard: React.FC<CardProps> = ({ name, title, email, phone, url, qr }) => (
  <div className="relative w-[350px] h-[200px] bg-white rounded-xl border border-slate-100 shadow-md overflow-hidden flex flex-col items-center justify-center gap-3 px-6"
    style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
    <div className="flex items-center gap-6 w-full">
      <div className="flex-1 space-y-1.5">
        <p className="text-[18px] font-black text-slate-900 leading-none tracking-tight">{name || 'Your Name'}</p>
        <p className="text-[9px] font-bold text-teal-600 uppercase tracking-widest">{title || 'Your Title'}</p>
        <div className="pt-2 space-y-0.5">
          {email && <p className="text-[9px] text-slate-400 font-medium truncate">{email}</p>}
          {phone && <p className="text-[9px] text-slate-400 font-medium">{phone}</p>}
          <p className="text-[9px] text-slate-400 font-medium truncate">{url}</p>
        </div>
      </div>
      <div className="shrink-0">
        {qr ? <img src={qr} alt="QR" className="w-[72px] h-[72px]" /> : <div className="w-[72px] h-[72px] bg-slate-100 animate-pulse rounded" />}
      </div>
    </div>
    <p className="absolute bottom-2 right-4 text-[6px] font-bold uppercase tracking-widest text-slate-200">seeqme.ai</p>
  </div>
);

/* ── Gradient — teal-to-emerald bg ──────────────────────────────────────── */
const GradientCard: React.FC<CardProps> = ({ name, title, email, phone, url, qr }) => (
  <div className="relative w-[350px] h-[200px] rounded-xl shadow-2xl overflow-hidden flex"
    style={{ background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', fontFamily: "'Inter', system-ui, sans-serif" }}>
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
    <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.06] rounded-full -mr-12 -mt-12 blur-2xl" />
    <div className="flex-1 flex flex-col justify-between px-6 py-5 relative z-10">
      <div>
        <p className="text-[18px] font-black text-white leading-tight tracking-tight">{name || 'Your Name'}</p>
        <p className="text-[10px] font-bold text-teal-100 uppercase tracking-widest mt-0.5">{title || 'Your Title'}</p>
      </div>
      <div className="space-y-1">
        {email && <div className="flex items-center gap-1.5"><Mail className="w-2.5 h-2.5 text-teal-200/70 shrink-0" /><span className="text-[9px] font-medium text-teal-100 truncate">{email}</span></div>}
        {phone && <div className="flex items-center gap-1.5"><Phone className="w-2.5 h-2.5 text-teal-200/70 shrink-0" /><span className="text-[9px] font-medium text-teal-100">{phone}</span></div>}
        <div className="flex items-center gap-1.5"><Globe className="w-2.5 h-2.5 text-teal-200/70 shrink-0" /><span className="text-[9px] font-medium text-teal-100 truncate">{url}</span></div>
      </div>
      <p className="text-[7px] font-bold uppercase tracking-widest text-teal-200/50">Built with SeeqMe AI</p>
    </div>
    <div className="flex items-center justify-center px-5 relative z-10">
      <div className="p-2 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm">
        {qr ? <div className="w-[76px] h-[76px] bg-white rounded-lg overflow-hidden p-1"><img src={qr} alt="QR" className="w-full h-full" /></div>
             : <div className="w-[76px] h-[76px] bg-white/20 animate-pulse rounded-lg" />}
      </div>
    </div>
  </div>
);

/* ── Vivid — deep violet ─────────────────────────────────────────────────── */
const VividCard: React.FC<CardProps> = ({ name, title, email, phone, url, qr }) => (
  <div className="relative w-[350px] h-[200px] rounded-xl shadow-2xl overflow-hidden flex"
    style={{ background: 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 100%)', fontFamily: "'Inter', system-ui, sans-serif" }}>
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/[0.12] rounded-full -mr-20 -mt-20 blur-3xl" />
    <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/[0.08] rounded-full -ml-10 -mb-10 blur-2xl" />
    <div className="flex-1 flex flex-col justify-between px-6 py-5 relative z-10">
      <div>
        <p className="text-[18px] font-black text-white leading-tight tracking-tight">{name || 'Your Name'}</p>
        <p className="text-[10px] font-bold text-violet-300 uppercase tracking-widest mt-0.5">{title || 'Your Title'}</p>
      </div>
      <div className="space-y-1">
        {email && <div className="flex items-center gap-1.5"><Mail className="w-2.5 h-2.5 text-violet-500 shrink-0" /><span className="text-[9px] font-medium text-violet-300 truncate">{email}</span></div>}
        {phone && <div className="flex items-center gap-1.5"><Phone className="w-2.5 h-2.5 text-violet-500 shrink-0" /><span className="text-[9px] font-medium text-violet-300">{phone}</span></div>}
        <div className="flex items-center gap-1.5"><Globe className="w-2.5 h-2.5 text-violet-500 shrink-0" /><span className="text-[9px] font-medium text-violet-300 truncate">{url}</span></div>
      </div>
      <p className="text-[7px] font-bold uppercase tracking-widest text-violet-700">Built with SeeqMe AI</p>
    </div>
    <div className="flex items-center justify-center px-5 relative z-10">
      <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.12]">
        {qr ? <div className="w-[76px] h-[76px] bg-white rounded-lg overflow-hidden p-1"><img src={qr} alt="QR" className="w-full h-full" /></div>
             : <div className="w-[76px] h-[76px] bg-white/10 animate-pulse rounded-lg" />}
      </div>
    </div>
  </div>
);

/* ── Modal ────────────────────────────────────────────────────────────────── */

const MotionDiv = motion.div as any;

const CARD_COMPONENTS: Record<CardTemplate, React.FC<CardProps>> = {
  studio: StudioCard,
  noir: NoirCard,
  pure: PureCard,
  gradient: GradientCard,
  vivid: VividCard,
};

const BusinessCardModal: React.FC<BusinessCardModalProps> = ({ isOpen, onClose, portfolio }) => {
  const liveUrl = portfolio.customDomain
    ? `https://${portfolio.customDomain}`
    : portfolio.subdomain
    ? `https://${portfolio.subdomain}.seeqme.com`
    : 'https://seeqme.com';

  const extracted = extractCardData(portfolio);

  const [appliedTemplate, setAppliedTemplate] = useState<CardTemplate>('studio');
  const [pendingTemplate, setPendingTemplate] = useState<CardTemplate | null>(null);
  const [name,  setName]  = useState(extracted.name);
  const [title, setTitle] = useState(extracted.title);
  const [email, setEmail] = useState(extracted.email);
  const [phone, setPhone] = useState(extracted.phone);
  const [qr, setQr] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const TEMPLATE_IDS = TEMPLATES.map(t => t.id);
  const previewedTemplate = pendingTemplate ?? appliedTemplate;
  const previewIdx = TEMPLATE_IDS.indexOf(previewedTemplate);
  const hasPending = pendingTemplate !== null && pendingTemplate !== appliedTemplate;

  const goNext = () => setPendingTemplate(TEMPLATE_IDS[(previewIdx + 1) % TEMPLATE_IDS.length]);
  const goPrev = () => setPendingTemplate(TEMPLATE_IDS[(previewIdx - 1 + TEMPLATE_IDS.length) % TEMPLATE_IDS.length]);
  const applyPending = () => { setAppliedTemplate(pendingTemplate!); setPendingTemplate(null); };

  useEffect(() => {
    const d = extractCardData(portfolio);
    setName(d.name);
    setTitle(d.title);
    setEmail(d.email);
    setPhone(d.phone);
  }, [portfolio]);

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(liveUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setQr).catch(console.error);
  }, [liveUrl, isOpen]);

  const cardProps: CardProps = { name, title, email, phone, url: liveUrl, qr };
  const ActiveCard = CARD_COMPONENTS[previewedTemplate];

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name || 'business'}-card.png`;
        a.click();
        URL.revokeObjectURL(url);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 3000);
        toast.success('Business card downloaded — ready to print at 300 dpi');
      }, 'image/png');
    } catch {
      toast.error('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [name]);

  const handlePrint = useCallback(() => {
    if (!cardRef.current) return;
    const html = cardRef.current.outerHTML;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <style>
        @page { size: 3.5in 2in; margin: 0; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; width: 3.5in; height: 2in; }
        body > div { transform: scale(0.74); transform-origin: center; }
      </style>
      <link rel="stylesheet" href="${window.location.origin}/assets/index.css">
      <script src="https://cdn.tailwindcss.com"></script>
    </head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 800);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

          {/* Modal */}
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-900/25 overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Accent line at top */}
            <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 via-violet-500 to-teal-500" />

            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-4.5 h-4.5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-[15px] font-black text-slate-900 tracking-tight">Business Card & QR</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Print-ready card linking to your live portfolio</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* Card preview with navigation */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-500">
                      {previewIdx + 1} / {TEMPLATES.length}
                    </span>
                    <button
                      onClick={goPrev}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all active:scale-95"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={goNext}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all active:scale-95"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card canvas */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50/80">
                  <div className="flex items-center justify-center py-5" style={{ minHeight: 200 }}>
                    <div style={{ transform: 'scale(0.87)', transformOrigin: 'center' }}>
                      <AnimatePresence mode="wait">
                        <MotionDiv
                          key={previewedTemplate}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div ref={cardRef}>
                            <ActiveCard {...cardProps} />
                          </div>
                        </MotionDiv>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Applied badge */}
                  <AnimatePresence>
                    {!hasPending && (
                      <MotionDiv
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold"
                      >
                        <CheckCheck className="w-3 h-3" /> Applied
                      </MotionDiv>
                    )}
                  </AnimatePresence>
                </div>

                {/* Apply banner */}
                <AnimatePresence>
                  {hasPending && (
                    <MotionDiv
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 flex items-center justify-between gap-3 px-4 py-3 bg-slate-900 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${TEMPLATES.find(t => t.id === pendingTemplate)?.dot}`} />
                        <span className="text-sm font-bold text-white">
                          {TEMPLATES.find(t => t.id === pendingTemplate)?.label}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          — {TEMPLATES.find(t => t.id === pendingTemplate)?.desc}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setPendingTemplate(null)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={applyPending}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-white rounded-lg text-xs font-bold transition-colors shadow-md shadow-teal-500/20"
                        >
                          <Check className="w-3.5 h-3.5" /> Apply
                        </motion.button>
                      </div>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme picker — dot indicators */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Themes</p>
                <div className="flex gap-2 flex-wrap">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setPendingTemplate(t.id === appliedTemplate ? null : t.id)}
                      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        previewedTemplate === t.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full shrink-0 ${t.dot}`} />
                      {t.label}
                      {appliedTemplate === t.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                  Browsing: <span className="text-slate-600 font-semibold">{TEMPLATES.find(t => t.id === previewedTemplate)?.label}</span>
                  {hasPending && <span className="text-teal-600 font-semibold ml-1">— tap Apply to confirm</span>}
                </p>
              </div>

              {/* Editable fields */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Card details</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Name',  value: name,  setter: setName,  placeholder: 'Jane Doe' },
                    { label: 'Title', value: title, setter: setTitle, placeholder: 'Senior Designer' },
                    { label: 'Email', value: email, setter: setEmail, placeholder: 'jane@example.com' },
                    { label: 'Phone', value: phone, setter: setPhone, placeholder: '+1 555 000 0000' },
                  ].map(({ label, value, setter, placeholder }) => (
                    <div key={label}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 focus:bg-white rounded-xl py-2.5 px-3 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-sm font-bold text-slate-700 transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-lg shadow-teal-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Rendering…</>
                  ) : downloaded ? (
                    <><Check className="w-4 h-4" /> Downloaded!</>
                  ) : (
                    <><Download className="w-4 h-4" /> Download PNG</>
                  )}
                </motion.button>
              </div>

              <p className="text-center text-[11px] text-slate-400 font-medium">
                Downloads at 3× resolution — print-ready at 300 dpi on standard 3.5" × 2" cards.
              </p>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default BusinessCardModal;
