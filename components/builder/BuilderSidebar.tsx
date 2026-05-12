import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout, Layers, Eye, EyeOff, ChevronUp, ChevronDown,
  PanelLeftClose, PanelLeft,
  PanelTop, Home, User, Wrench, FolderOpen, Briefcase,
  Phone, PanelBottom, MessageSquare, BarChart2, Settings2,
  MousePointer2, Images, HelpCircle, Award, GitBranch, Users,
  Tag, BookOpen, Play, FileText,
  Pencil, Wand2, TerminalSquare,
} from 'lucide-react';

const MotionDiv = motion.div as any;

const SECTION_ICONS: Record<string, React.ElementType> = {
  header:       PanelTop,
  hero:         Home,
  about:        User,
  skills:       Wrench,
  projects:     FolderOpen,
  experience:   Briefcase,
  contact:      Phone,
  footer:       PanelBottom,
  testimonials: MessageSquare,
  stats:        BarChart2,
  services:     Settings2,
  cta:          MousePointer2,
  gallery:      Images,
  faq:          HelpCircle,
  logos:        Award,
  process:      GitBranch,
  team:         Users,
  pricing:      Tag,
  blog:         BookOpen,
  video:        Play,
};

const SECTION_LABELS: Record<string, string> = {
  header: 'Header', hero: 'Hero', about: 'About', skills: 'Skills',
  projects: 'Projects', experience: 'Experience', contact: 'Contact', footer: 'Footer',
  testimonials: 'Testimonials', stats: 'Stats', services: 'Services', cta: 'Call to Action',
  gallery: 'Gallery', faq: 'FAQ', logos: 'Logos', process: 'Process', team: 'Team',
  pricing: 'Pricing', blog: 'Blog', video: 'Video',
};

interface BuilderSidebarProps {
  isTemplateSelectorOpen: boolean;
  onOpenTemplateSelector: () => void;
  onStartTour?: () => void;
  onOpenEditor?: () => void;
  onToggleFloatingPrompt?: () => void;
  onToggleTerminal?: () => void;
  isFloatingPromptVisible?: boolean;
  isTerminalVisible?: boolean;
  manifest?: any;
  onSectionClick?: (sectionType: string) => void;
  onSectionVisibilityToggle?: (sectionIndex: number) => void;
  onSectionReorder?: (fromIndex: number, toIndex: number) => void;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

/* ── Tooltip wrapper ── */
const SidebarBtn: React.FC<{
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  tourAttr?: string;
}> = ({ icon: Icon, label, active, onClick, tourAttr }) => (
  <div className="relative group">
    <button
      data-tour={tourAttr}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
        active
          ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/30'
          : 'bg-slate-50 hover:bg-teal-50 hover:text-teal-600 text-slate-400'
      }`}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
    {/* Tooltip */}
    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
      <div className="px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-lg">
        {label}
      </div>
    </div>
  </div>
);

const BuilderSidebar: React.FC<BuilderSidebarProps> = ({
  isTemplateSelectorOpen,
  onOpenTemplateSelector,
  onStartTour,
  onOpenEditor,
  onToggleFloatingPrompt,
  onToggleTerminal,
  isFloatingPromptVisible,
  isTerminalVisible,
  manifest,
  onSectionClick,
  onSectionVisibilityToggle,
  onSectionReorder,
  iframeRef,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (isTemplateSelectorOpen) return null;

  const sections = manifest?.sections || [];

  const handleSectionClick = (section: any) => {
    setActiveSection(section.id || section.type);
    if (iframeRef?.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SEEQME_HIGHLIGHT', sectionId: section.type },
        '*'
      );
    }
    onSectionClick?.(section.type);
  };

  const handleReorder = (fromIndex: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= sections.length) return;
    onSectionReorder?.(fromIndex, toIndex);
  };

  const handleVisibilityToggle = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onSectionVisibilityToggle?.(index);
  };

  return (
    <div className="fixed top-[57px] left-0 bottom-0 z-40 flex">
      {/* Collapsed strip — 4 tool icons */}
      <div className="flex flex-col items-center gap-2 py-4 px-2 bg-white border-r border-slate-100 w-12 shrink-0 shadow-sm">
        {/* 1. Section Editor */}
        <SidebarBtn
          icon={Pencil}
          label="Editor"
          onClick={() => onOpenEditor?.()}
          tourAttr="sidebar-edit"
        />

        {/* 2. Blocks / Templates */}
        <SidebarBtn
          icon={Layout}
          label="Blocks"
          active={isExpanded}
          onClick={() => setIsExpanded(v => !v)}
          tourAttr="sidebar-blocks"
        />

        {/* 3. AI Edit */}
        <SidebarBtn
          icon={Wand2}
          label="AI Edit"
          active={isFloatingPromptVisible}
          onClick={() => onToggleFloatingPrompt?.()}
          tourAttr="sidebar-ai"
        />

        {/* 4. Console */}
        <SidebarBtn
          icon={TerminalSquare}
          label="Console"
          active={isTerminalVisible}
          onClick={() => onToggleTerminal?.()}
          tourAttr="sidebar-console"
        />

        {/* Section count badge */}
        {sections.length > 0 && (
          <div className="w-5 h-5 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-[9px] font-black mt-1">
            {sections.length}
          </div>
        )}
      </div>

      {/* Expanded panel — sections list (shown when Blocks icon is active) */}
      <AnimatePresence>
        {isExpanded && (
          <MotionDiv
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 208, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="overflow-hidden bg-white border-r border-slate-100 flex flex-col h-full shadow-lg shadow-slate-900/5"
          >
            <div className="px-4 py-3.5 border-b border-slate-50 shrink-0 flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                Sections · {sections.length}
              </p>
              <button
                onClick={onOpenTemplateSelector}
                className="text-[9px] font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wider"
              >
                + Add Block
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-1.5">
              {sections.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-xs text-slate-400">No sections yet</p>
                </div>
              ) : (
                sections.map((section: any, index: number) => {
                  const isVisible = section.settings?.isVisible !== false;
                  const sectionType = section.type || 'section';
                  const Icon = SECTION_ICONS[sectionType] || FileText;
                  const label = SECTION_LABELS[sectionType] || sectionType;
                  const isActive = activeSection === (section.id || section.type);

                  return (
                    <div
                      key={section.id || index}
                      onClick={() => handleSectionClick(section)}
                      className={`group flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-teal-50 border-l-2 border-teal-500'
                          : 'hover:bg-slate-50 border-l-2 border-transparent'
                      } ${!isVisible ? 'opacity-40' : ''}`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-3 h-3" />
                      </div>

                      <span className={`flex-1 text-xs font-semibold truncate ${
                        isActive ? 'text-teal-700' : 'text-slate-700'
                      }`}>
                        {label}
                      </span>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <div className="flex flex-col">
                          <button
                            onClick={(e) => handleReorder(index, 'up', e)}
                            disabled={index === 0}
                            className="p-0.5 hover:text-teal-600 disabled:opacity-20 transition-colors text-slate-400"
                          >
                            <ChevronUp className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={(e) => handleReorder(index, 'down', e)}
                            disabled={index === sections.length - 1}
                            className="p-0.5 hover:text-teal-600 disabled:opacity-20 transition-colors text-slate-400"
                          >
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <button
                          onClick={(e) => handleVisibilityToggle(index, e)}
                          className={`p-0.5 transition-colors ${
                            isVisible ? 'text-slate-400 hover:text-slate-700' : 'text-rose-400 hover:text-rose-600'
                          }`}
                        >
                          {isVisible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-50 shrink-0">
              <p className="text-[9px] text-slate-400 text-center leading-relaxed tracking-wide">
                Click a section to highlight it
              </p>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(BuilderSidebar);
