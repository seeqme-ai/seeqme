import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Network } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/seeqme-logo-black.png" alt="SeeqMe" className="h-5 w-auto transition-opacity group-hover:opacity-70" />
              <span className="text-sm font-bold text-slate-700">SeeqMe</span>
            </Link>
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <Network className="w-3 h-3 text-teal-400" />
              The professional identity network
            </div>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-5 text-[12px] font-semibold text-slate-400">
            <Link to="/plans"           className="hover:text-slate-700 transition-colors">Plans</Link>
            <Link to="/templates"       className="hover:text-slate-700 transition-colors">Templates</Link>
            <Link to="/privacy-policy"  className="hover:text-slate-700 transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-slate-700 transition-colors">Terms</Link>
            <Link to="/contact"         className="hover:text-slate-700 transition-colors">Contact</Link>
          </nav>

          {/* Social */}
          <div className="flex items-center gap-2">
            {([
              { Icon: Twitter,  href: 'https://twitter.com/seeqmeai',          label: 'Twitter'  },
              { Icon: Github,   href: 'https://github.com/seeqmeai',           label: 'GitHub'   },
              { Icon: Linkedin, href: 'https://linkedin.com/company/seeqmeai', label: 'LinkedIn' },
            ] as const).map(({ Icon, href, label }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 font-medium">© {new Date().getFullYear()} SeeqMe AI. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-50" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-teal-500" />
            </span>
            <span className="text-[11px] text-slate-400 font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
