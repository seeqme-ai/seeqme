import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ICONS } from '@/constants';
import { PORTFOLIO_TEMPLATES } from '@/templates';
import { useTemplate } from '@/context/template-context';
import { linkedinService } from '@/services/linkedinService';
import { useAuth } from '@/context/auth-context';
import { ArrowUpRight, Loader, Zap, Mic, Upload, Linkedin, X, Code, Layers, Instagram, Menu, Search } from 'lucide-react';
import HeroSection from '@/components/Hero';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const MotionDiv = motion.div as any;

const NICHES = ['All', 'Engineering', 'Creative', 'Business', 'Finance', 'Student',];

const PARTNERS = [
  { name: 'Paystack', logo: 'PAYSTACK' },
  { name: 'Cloudflare', logo: 'CLOUDFLARE' },
  { name: 'Cloudinary', logo: 'CLOUDINARY' },
  { name: 'Google', logo: 'GOOGLE' },
  { name: 'GitHub', logo: 'GITHUB' },
  { name: 'MongoDB', logo: 'MONGODB' },
];

interface LandingPageProps {
  onGetStarted: (initialData?: { type: string; value: string; templateId?: string }) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; size: number; preview?: string; url?: string; content?: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [displayLimit, setDisplayLimit] = useState(12);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSelectedTemplateId, setSynthesisInput } = useTemplate();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const shuffledTemplates = useMemo(() => shuffleArray(PORTFOLIO_TEMPLATES), []);

  const filteredTemplates = useMemo(() => {
    const sourceTemplates = selectedNiche === 'All' ? shuffledTemplates : PORTFOLIO_TEMPLATES;
    return sourceTemplates.filter(tpl => {
      const matchesNiche = selectedNiche === 'All' || tpl.niche === selectedNiche;
      const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.niche.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesNiche && matchesSearch;
    });
  }, [selectedNiche, searchQuery, shuffledTemplates]);

  const displayedTemplates = useMemo(() => {
    if (filteredTemplates.length === 0) return [];
    // Create an array filled with references to templates, looping over if necessary
    return Array.from({ length: displayLimit }, (_, i) => filteredTemplates[i % filteredTemplates.length]);
  }, [filteredTemplates, displayLimit]);

  // Infinite Scroll Logic
  React.useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      // Allow loading more if we have templates to show
      if (entries[0].isIntersecting && filteredTemplates.length > 0 && !isFetchingMore) {
        setIsFetchingMore(true);
        setTimeout(() => {
          setDisplayLimit(prev => prev + 6);
          setIsFetchingMore(false);
        }, 800);
      }
    }, { threshold: 0.1 });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [filteredTemplates.length, isFetchingMore]);

  // Reset limit when niche or search changes
  React.useEffect(() => {
    setDisplayLimit(12);
  }, [selectedNiche, searchQuery]);

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (e: any) => {
      setInputValue(prev => prev + " " + e.results[0][0].transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { uploadService } = await import('@/services/apiService');
      const { content } = await uploadService.extractCV(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setSelectedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        content: content,
        url: ''
      });

      toast.success(`File analyzed: ${file.name}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to analyze file');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBuild = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!inputValue && !selectedFile && !linkedInUrl) {
      toast.error("Please enter a prompt or upload your CV");
      return;
    }

    if (linkedInUrl && !linkedinService.validateUrl(linkedInUrl)) {
      toast.error("Please enter a valid LinkedIn URL.");
      return;
    }

    let fullInput = inputValue;

    if (selectedFile) {
      (window as any)._pendingFile = {
        filename: selectedFile.name,
        content: selectedFile.content || selectedFile.url,
        type: selectedFile.type
      };
      fullInput += `

[Context: CV uploaded]`;
    }

    if (linkedInUrl) fullInput += `

[Context: LinkedIn Profile ${linkedInUrl}]`;
    fullInput += `

[Niche: ${selectedNiche}]`;

    setSynthesisInput(fullInput);
    setSelectedTemplateId('');
    navigate('/builder');
  };

  return (
    <>
      <section className="px-6 max-w-7xl mx-auto flex flex-col items-center pb-32">

        <HeroSection />

        <div id="omni-bar" className="w-full max-w-4xl scroll-mt-32 mb-4">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`relative p-[1px] rounded-3xl overflow-hidden transition-all duration-700 ${isDragging ? 'scale-[1.02] shadow-[0_0_80px_rgba(20,184,166,0.3)]' : 'shadow-2xl'}`}
            onDragOver={(e: any) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e: any) => { e.preventDefault(); setIsDragging(false); }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 animate-[spin_4s_linear_infinite] opacity-[0.2]"></div>
            <div className="bg-card/80 backdrop-blur-3xl p-4 flex flex-col items-stretch gap-4 relative rounded-3xl">
              <div className="flex-1 w-full relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Describe your career goals or paste your experience..."
                  className="w-full bg-transparent border-none focus:outline-none py-6 px-4 md:px-8 text-xl font-medium placeholder:text-muted-foreground/20 resize-none h-32 md:h-40 no-scrollbar"
                />
              </div>

              <AnimatePresence>
                {selectedFile && (
                  <MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mx-4 md:mx-8 mb-4 p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="relative w-10 h-10 bg-background rounded-xl flex items-center justify-center border border-border">
                        <Code className="w-5 h-5 text-teal-500" />
                        {uploadProgress < 100 && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                            <span className="text-[8px] font-black">{uploadProgress}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{selectedFile.name}</span>
                        <span className="text-[9px] text-teal-500 uppercase font-bold">Document Analyzed</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="p-2 hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>
                  </MotionDiv>
                )}
              </AnimatePresence>

              <div className="px-4 md:px-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {/* Mic Button */}
                  <button
                    onClick={startVoice}
                    className={`p-2 rounded-2xl transition-all ${isRecording ? 'text-rose-500 bg-rose-500/10 animate-pulse' : 'text-slate-400 hover:text-teal-400 hover:bg-teal-500/10'}`}
                    title="Voice Command"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Upload CV Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-2xl text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 hover:text-teal-300 transition-all"
                    title="Upload CV"
                  >
                    <span>Upload CV</span>
                    {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,image/*,.txt" />
                  </button>

                </div>

                <button
                  onClick={handleBuild}
                  className="w-full font-bold md:w-auto px-10 py-5 bg-teal-500 text-white rounded-2xl text-[10px] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                >
                  Generate
                </button>
              </div>
            </div>
          </MotionDiv>
        </div>
        {/* Partner Marquee */}
        <section className="w-full overflow-hidden py-4 border-y border-border relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
          <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap gap-24 items-center">
            {[...PARTNERS, ...PARTNERS].map((p, idx) => (
              <div key={idx} className="flex items-center gap-4 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair">
                {/* Standardizing partner logo display */}
                <div className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{p.name}</div>
                <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </section>

        {/* Template Selection */}
        <div id="templates" className="w-full scroll-mt-32 mt-4">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-10">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Templates</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <ICONS.Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by niche..."
                  className="w-full bg-white  border border-border rounded-full py-5 pl-14 pr-8 text-sm font-medium focus:border-teal-500 outline-none shadow-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-4 sm:pb-0 no-scrollbar">
                {NICHES.map(n => (
                  <button
                    key={n}
                    onClick={() => setSelectedNiche(n)}
                    className={`px-4 py-3  rounded-full text-xs font-semibold tracking-wide transition-all border whitespace-nowrap ${selectedNiche === n ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/20' : 'bg-white border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full place-items-center">
            {displayedTemplates.map((tpl, i) => (
              <MotionDiv
                key={`${tpl.id}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i % 3 * 0.1 }}
                onClick={() => {
                  setSelectedTemplateId(tpl.id);
                  setSynthesisInput('');
                  onGetStarted({ type: 'template', value: tpl.id, templateId: tpl.id });
                }}
                className="w-full max-w-[320px] shrink-0 group rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200 transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={tpl.preview} alt={tpl.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Preview Design</span>
                    <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-white flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-tight text-slate-950">{tpl.name}</h3>
                    <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">{tpl.niche}</span>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>

          <div ref={loaderRef} className="h-20 w-full flex justify-center items-center mt-12">
            {isFetchingMore && <Loader className="w-8 h-8 animate-spin text-teal-600" />}
          </div>
        </div>

        <ConfirmModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onConfirm={() => navigate('/auth/signup')}
          title="Account Required"
          description="Please log in or create an account to generate your portfolio"
          confirmText="Log In / Sign Up"
          cancelText="Cancel"
          variant="info"
        />
      </section>

      {/* Adding a CSS animation for the gradient text in the Hero */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </>
  );
};

export default React.memo(LandingPage);