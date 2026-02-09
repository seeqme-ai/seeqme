import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS } from '@/constants';
import { PORTFOLIO_TEMPLATES } from '@/templates';
import { useTemplate } from '@/context/template-context';
import { ArrowUpRight, Loader, Search, Filter, LayoutGrid } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

const MotionDiv = motion.div as any;

const NICHES = ['All', 'Engineering', 'Creative', 'Business', 'Finance', 'Student'];

const Templates: React.FC = () => {
    const [selectedNiche, setSelectedNiche] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [displayLimit, setDisplayLimit] = useState(12);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const loaderRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();

    const { setSelectedTemplateId, setSynthesisInput } = useTemplate();
    const navigate = useNavigate();

    // Check for template ID in URL and redirect to builder
    const templateIdFromUrl = searchParams.get('id');

    useEffect(() => {
        if (templateIdFromUrl) {
            const template = PORTFOLIO_TEMPLATES.find(t => t.id === templateIdFromUrl);
            if (template) {
                // Update document title for SEO
                document.title = `${template.name} Template - Seeqme AI`;

                // Set template context and redirect to builder
                setSelectedTemplateId(template.id);
                setSynthesisInput('');
                navigate("/builder", {
                    state: {
                        initialData: {
                            type: 'template',
                            value: template.id,
                            templateId: template.id,
                            templateName: template.name,
                            templateNiche: template.niche
                        }
                    },
                    replace: true // Replace history so back button goes to previous page, not /templates?id=...
                });
            }
        }
    }, [templateIdFromUrl, navigate, setSelectedTemplateId, setSynthesisInput]);

    const filteredTemplates = useMemo(() => {
        return PORTFOLIO_TEMPLATES.filter(tpl => {
            const matchesNiche = selectedNiche === 'All' || tpl.niche === selectedNiche;
            const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tpl.niche.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesNiche && matchesSearch;
        });
    }, [selectedNiche, searchQuery]);

    const displayedTemplates = useMemo(() => {
        return filteredTemplates.slice(0, displayLimit);
    }, [filteredTemplates, displayLimit]);

    // Infinite Scroll Logic
    useEffect(() => {
        if (!loaderRef.current) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && displayLimit < filteredTemplates.length && !isFetchingMore) {
                setIsFetchingMore(true);
                setTimeout(() => {
                    setDisplayLimit(prev => prev + 6);
                    setIsFetchingMore(false);
                }, 800);
            }
        }, { threshold: 0.1 });

        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [filteredTemplates.length, displayLimit, isFetchingMore]);

    // Reset limit when niche or search changes
    useEffect(() => {
        setDisplayLimit(12);
    }, [selectedNiche, searchQuery]);

    const handleTempClick = (initialData?: { type: string; value: string; templateId?: string }) => {
        navigate("/builder", { state: { initialData } });
    };

    return (
        <MainLayout>
            {/* Meta Tags for SEO (usually handled by React Helmet, but here we can add them to the page component for visibility) */}
            <head>
                <title>Explore Portfolio Templates - Seeqme AI</title>
                <meta name="description" content="Discover professional AI-powered portfolio templates for engineers, designers, and business professionals. Filter and find the perfect layout for your digital legacy." />
            </head>

            {/* Background Decorations */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-teal-600/5 rounded-full blur-[110px]" />
            </div>

            <section className="px-6 max-w-7xl mx-auto relative z-10">
                <div className="pt-4 pb-8">
                    <MotionDiv
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center space-y-6"
                    >

                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-950 leading-[0.9]">
                            Designed <br /> to <span className="text-transparent bg-clip-text bg-teal-600">Inspire</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                            Choose from our hand-crafted collection <br className="hidden md:block" /> Built for professionals who value digital elegance.
                        </p>
                    </MotionDiv>
                </div>

                {/* Template Selection */}
                <div id="templates" className="w-full scroll-mt-32 mt-4">
                    <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-10">


                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
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
                                        className={`px-4 py-3 rounded-full text-xs font-semibold tracking-wide transition-all border whitespace-nowrap ${selectedNiche === n ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/20' : 'bg-white border-border text-muted-foreground hover:text-foreground'}`}
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
                                    handleTempClick({ type: 'template', value: tpl.id, templateId: tpl.id });
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
            </section>
        </MainLayout>
    );
};

export default Templates;
