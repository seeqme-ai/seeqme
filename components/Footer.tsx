import React from 'react';
import { Instagram } from 'lucide-react';
import { ICONS } from '@/constants';

const Footer: React.FC = () => {
    return (
        <footer className="px-6 md:px-12 mt-20 border-t border-border bg-gradient-to-b from-transparent to-primary/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Branding & Socials */}
                    <div className="col-span-1 sm:col-span-2 space-y-8 mt-10">
                        <div className="flex items-center gap-4">
                            <img src="/seeqme-logo-black.png" alt="SeeqMe Logo" className="h-8 w-auto block" />
                            <span className="text-lg font-bold tracking-tight text-foreground">SeeqMe</span>
                        </div>

                        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                            Elevating professional identities through generative intelligence. Build your digital legacy in minutes, not days.
                        </p>

                        <div className="flex gap-3">
                            {[
                                { Icon: Instagram, label: 'Instagram' },
                                { Icon: ICONS.Linkedin, label: 'LinkedIn' },
                                { Icon: ICONS.Share, label: 'Share' }
                            ].map(({ Icon, label }) => (
                                <button
                                    key={label}
                                    className="p-3 bg-background rounded-xl hover:bg-teal-500/10 text-muted-foreground hover:text-teal-500 transition-all border border-border group"
                                    aria-label={label}
                                >
                                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Legal */}
                    <div className="space-y-6 mt-14">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">
                            Compliance
                        </h4>
                        <nav className="flex flex-col gap-4 text-sm text-muted-foreground">
                            <a href="/privacy-policy" className="hover:text-foreground hover:translate-x-1 transition-all">Privacy Policy</a>
                            <a href="/terms-of-service" className="hover:text-foreground hover:translate-x-1 transition-all">Terms of Service</a>
                        </nav>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 mb-10 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <span>© {new Date().getFullYear()} SEEQME AI</span>
                        <span className="hidden md:block text-border">•</span>
                        <span>ALL RIGHTS RESERVED.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
