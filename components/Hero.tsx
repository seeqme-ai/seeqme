import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Globe, MousePointer2 } from 'lucide-react';

const HeroSection = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40, rotateX: 45 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: { type: "spring", damping: 12, stiffness: 100 }
        },
    };

    return (
        <section className="relative flex flex-col items-center justify-center overflow-hidden py-20 px-4">

            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] bg-teal-500/20 rounded-full blur-[120px]"
                />
            </div>


            <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                <FloatingChip icon={<Zap className="w-4 h-4" />} text="AI Optimized" top="15%" left="5%" delay={0} />
                <FloatingChip icon={<ShieldCheck className="w-4 h-4" />} text="SEO Ready" top="50%" left="10%" delay={1} />
                <FloatingChip icon={<Globe className="w-4 h-4" />} text="Custom Domains" top="30%" right="5%" delay={0.5} />
                <FloatingChip icon={<MousePointer2 className="w-4 h-4" />} text="Drag & Drop" bottom="15%" right="0" delay={1.5} />
            </div>

            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-20 text-center max-w-6xl mx-auto"
            >

                <h1 className="text-5xl md:text-[7vw] font-black tracking-tighter leading-[0.85] mb-8 uppercase text-slate-900">
                    Build your <br />
                    <span className="relative">
                        <span className="text-transparent bg-clip-text bg-teal-600">
                            Identity
                        </span>
                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                            <path d="M1 11C50 3.5 150 3.5 299 11" stroke="url(#paint0_linear)" strokeWidth="3" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="paint0_linear" x1="1" y1="11" x2="299" y2="11" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#0D9488" stopOpacity="0" />
                                    <stop offset="0.5" stopColor="#0D9488" />
                                    <stop offset="1" stopColor="#0D9488" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </span>
                    <br /> in Minutes
                </h1>

                <motion.p
                    variants={itemVariants}
                    className="text-lg md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed"
                >
                    The <span className="text-slate-900  font-bold">AI-native</span> designer that  craft a professional identity that stands out
                </motion.p>


                {/* <motion.div variants={itemVariants} className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-6">


                    <div className="flex items-center -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white  bg-slate-200" />
                        ))}
                        <p className="ml-4 text-sm font-bold text-slate-400">
                            Joined by <span className="text-slate-900 ">2,400+</span> creators
                        </p>
                    </div>
                </motion.div> */}
            </motion.div>
        </section>
    );
};

// Sub-component for those floating "substance" chips
const FloatingChip = ({ icon, text, top, left, right, bottom, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
            opacity: 1,
            scale: 1,
            y: [0, -15, 0]
        }}
        transition={{
            opacity: { duration: 0.5, delay },
            scale: { duration: 0.5, delay },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay }
        }}
        style={{ position: 'absolute', top, left, right, bottom }}
        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] z-10"
    >
        <div className="text-teal-500">{icon}</div>
        <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{text}</span>
    </motion.div>
);

export default HeroSection;