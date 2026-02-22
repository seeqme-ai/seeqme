import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ExternalLink, FileEdit, Loader, Maximize2, Minimize2, Eye, Plus, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import cloudinaryService from '@/services/cloudinaryService';
import { renderManifest } from '@/utils/renderer';
import Editor from '@monaco-editor/react';

interface AdminTemplatesTabProps {
  templateId: string;
  templateName: string;
  templateNiche: string;
  templateStructuredContent: string;
  templateHtml: string;
  templateCss: string;
  templateJs: string;
  templatePreview: string;
  templateNotify: boolean;
  templateNotifyTarget: 'all' | 'niche' | 'selected';
  templateSelectedUsers: string[];
  templateHighlights: string;
  templateCtaUrl: string;
  templateCtaLabel: string;
  templateFooterNote: string;
  templateUserSearch: string;
  templateValidationErrors: string[];
  editingTemplateDbId: string | null;
  isTemplateSaving: boolean;
  isTemplatesLoading: boolean;
  adminTemplates: any[];
  users: any[];
  nicheOptions: string[];
  onTemplateIdChange: (value: string) => void;
  onTemplateNameChange: (value: string) => void;
  onTemplateNicheChange: (value: string) => void;
  onTemplateStructuredContentChange: (value: string) => void;
  onTemplateHtmlChange: (value: string) => void;
  onTemplateCssChange: (value: string) => void;
  onTemplateJsChange: (value: string) => void;
  onTemplatePreviewChange: (value: string) => void;
  onTemplateNotifyToggle: () => void;
  onTemplateNotifyTargetChange: (value: 'all' | 'niche' | 'selected') => void;
  onTemplateSelectedUsersChange: (value: string[]) => void;
  onTemplateHighlightsChange: (value: string) => void;
  onTemplateCtaUrlChange: (value: string) => void;
  onTemplateCtaLabelChange: (value: string) => void;
  onTemplateFooterNoteChange: (value: string) => void;
  onTemplateUserSearchChange: (value: string) => void;
  onEditTemplate: (template: any) => void;
  onCancelEdit: () => void;
  onDeleteTemplate: (id: string) => void;
  onSave: () => void;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const buildDefaultTemplateHtml = (manifest: any) => {
  const sections = (manifest?.sections || [])
    .map((section: any) => section.template || '')
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Template Standard Preview</title>
</head>
<body>
${sections}
</body>
</html>`;
};

const DEFAULT_TEMPLATE_MANIFEST = {
  metadata: {
    version: '1.0',
    niche: 'Product Designer',
    generatedAt: new Date().toISOString()
  },
  globalConfig: {
    theme: 'light',
    colorPalette: {
      primary: '#0f172a',
      secondary: '#64748b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      heading: '#0f172a'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
      monoFont: 'Space Mono'
    }
  },
  sections: [
    {
      id: 'header',
      type: 'header',
      componentId: 'HEADER_MINIMALIST_CREATOR',
      template: `
        <header class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
          <div class="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="#" class="text-lg font-semibold text-slate-900 tracking-tight">{{brand}}</a>
            <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
              {{#each navLinks}}
              <a href="{{link}}" class="hover:text-slate-900 transition-colors">{{label}}</a>
              {{/each}}
            </nav>
            <button class="md:hidden text-slate-900" id="mobile-menu-btn-{{id}}">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
          <div id="mobile-menu-{{id}}" class="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-6 opacity-0 pointer-events-none transition-all duration-300">
            {{#each navLinks}}
            <a href="{{link}}" class="mobile-link text-2xl font-semibold text-slate-900">{{label}}</a>
            {{/each}}
          </div>
          <script>
            (function() {
              const btn = document.getElementById('mobile-menu-btn-{{id}}');
              const menu = document.getElementById('mobile-menu-{{id}}');
              let isOpen = false;
              if (!btn || !menu) return;
              btn.addEventListener('click', () => {
                isOpen = !isOpen;
                if (isOpen) {
                  menu.classList.remove('opacity-0', 'pointer-events-none');
                } else {
                  menu.classList.add('opacity-0', 'pointer-events-none');
                }
              });
              menu.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => {
                  isOpen = false;
                  menu.classList.add('opacity-0', 'pointer-events-none');
                });
              });
            })();
          </script>
        </header>
      `,
      content: {
        brand: 'AURA',
        navLinks: [
          { label: 'About', link: '#about' },
          { label: 'Work', link: '#work' },
          { label: 'Skills', link: '#skills' },
          { label: 'Contact', link: '#contact' }
        ]
      },
      settings: { isVisible: true, padding: 'none' }
    },
    {
      id: 'hero',
      type: 'hero',
      componentId: 'HERO_MODERN_SPLIT',
      template: `
        <section class="min-h-screen pt-24 bg-slate-50 px-6 flex items-center">
          <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-6">{{label}}</p>
              <h1 class="text-5xl md:text-6xl font-serif text-slate-900 leading-tight mb-6">{{headline}}</h1>
              <p class="text-lg text-slate-600 mb-8">{{subheading}}</p>
              <div class="flex flex-wrap gap-4">
                <a href="{{primaryCta.link}}" class="px-7 py-3 bg-slate-900 text-white text-sm font-semibold rounded-full">{{primaryCta.label}}</a>
                <a href="{{secondaryCta.link}}" class="px-7 py-3 border border-slate-300 text-slate-700 text-sm font-semibold rounded-full">{{secondaryCta.label}}</a>
              </div>
              <div class="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
                {{#each stats}}
                <div><span class="text-slate-900 font-semibold">{{value}}</span> {{label}}</div>
                {{/each}}
              </div>
            </div>
            <div class="relative">
              <img src="{{image}}" class="w-full rounded-3xl shadow-xl object-cover aspect-[4/5]" />
            </div>
          </div>
        </section>
      `,
      content: {
        label: 'Product Designer',
        headline: 'Designing interfaces that move businesses forward.',
        subheading: '7+ years crafting digital products, design systems, and high-impact user experiences.',
        primaryCta: { label: 'View Portfolio', link: '#work' },
        secondaryCta: { label: 'Book a Call', link: '#contact' },
        stats: [
          { label: 'Products Shipped', value: '18' },
          { label: 'Design Systems', value: '6' },
          { label: 'NPS Impact', value: '+22%' }
        ],
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900'
      },
      settings: { isVisible: true, padding: 'none' }
    },
    {
      id: 'about',
      type: 'about',
      componentId: 'ABOUT_NARRATIVE',
      template: `
        <section class="py-24 bg-white px-6" id="about">
          <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 class="text-3xl font-serif text-slate-900 mb-4">{{title}}</h2>
              <p class="text-slate-600 leading-relaxed">{{story}}</p>
            </div>
            <div class="bg-slate-50 border border-slate-100 rounded-3xl p-8">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Capabilities</p>
              <ul class="space-y-3 text-slate-700">
                {{#each highlights}}
                <li class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-slate-900"></span>
                  <span>{{this}}</span>
                </li>
                {{/each}}
              </ul>
            </div>
          </div>
        </section>
      `,
      content: {
        title: 'Design Strategy, Delivered',
        story: 'I partner with teams to shape product direction, craft delightful flows, and elevate brand experiences across platforms.',
        highlights: [
          'Product discovery & UX audits',
          'Design systems + component libraries',
          'Cross-functional leadership'
        ]
      },
      settings: { isVisible: true, padding: 'none' }
    },
    {
      id: 'work',
      type: 'projects',
      componentId: 'PROJ_BENTO_GRID',
      template: `
        <section class="py-24 bg-slate-50 px-6" id="work">
          <div class="max-w-6xl mx-auto">
            <div class="flex items-center justify-between mb-10">
              <h2 class="text-3xl font-serif text-slate-900">{{title}}</h2>
              <p class="text-sm text-slate-500">{{subtitle}}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              {{#each projects}}
              <article class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">{{tag}}</p>
                <h3 class="text-lg font-semibold text-slate-900 mb-2">{{name}}</h3>
                <p class="text-sm text-slate-600">{{summary}}</p>
              </article>
              {{/each}}
            </div>
          </div>
        </section>
      `,
      content: {
        title: 'Selected Work',
        subtitle: 'Case studies that shipped measurable impact.',
        projects: [
          { tag: 'Fintech', name: 'Pulse Wallet', summary: 'Redesigned onboarding to cut drop-off by 31%.' },
          { tag: 'SaaS', name: 'Vista Analytics', summary: 'Unified data dashboards for 5 enterprise teams.' },
          { tag: 'E-commerce', name: 'Aurora Commerce', summary: 'Streamlined checkout flow to lift conversion.' }
        ]
      },
      settings: { isVisible: true, padding: 'none' }
    },
    {
      id: 'skills',
      type: 'skills',
      componentId: 'SKILLS_GRID_ICONS',
      template: `
        <section class="py-24 bg-white px-6" id="skills">
          <div class="max-w-6xl mx-auto">
            <h2 class="text-3xl font-serif text-slate-900 mb-10">{{title}}</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {{#each skills}}
              <div class="border border-slate-100 rounded-2xl px-4 py-4 text-sm font-semibold text-slate-700 bg-slate-50">{{this}}</div>
              {{/each}}
            </div>
          </div>
        </section>
      `,
      content: {
        title: 'Skills & Tools',
        skills: ['User Research', 'Interaction Design', 'Design Systems', 'Figma', 'Prototyping', 'Workshop Facilitation', 'User Testing', 'Product Strategy']
      },
      settings: { isVisible: true, padding: 'none' }
    },
    {
      id: 'contact',
      type: 'contact',
      componentId: 'CONTACT_FORM_FULL',
      template: `
        <section class="py-24 bg-slate-900 text-white px-6" id="contact">
          <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl font-serif mb-4">{{title}}</h2>
              <p class="text-slate-300 mb-8">{{description}}</p>
              <div class="space-y-2 text-sm">
                <p>{{email}}</p>
                <p>{{phone}}</p>
              </div>
            </div>
            <form class="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
              <input type="text" placeholder="Name" class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white" />
              <input type="email" placeholder="Email" class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white" />
              <textarea placeholder="Message" rows="4" class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white"></textarea>
              <button class="w-full py-3 rounded-xl bg-teal-400 text-slate-900 font-semibold">Send Message</button>
            </form>
          </div>
        </section>
      `,
      content: {
        title: 'Let’s build your next product.',
        description: 'Open to full-time roles and high-impact consulting engagements.',
        email: 'hello@aurastudio.com',
        phone: '+1 (555) 012-4100'
      },
      settings: { isVisible: true, padding: 'none' }
    },
    {
      id: 'footer',
      type: 'footer',
      componentId: 'FOOTER_MINIMAL',
      template: `
        <footer class="py-10 bg-white border-t border-slate-100 text-center text-sm text-slate-500">
          <p>{{copyright}}</p>
        </footer>
      `,
      content: {
        copyright: '© 2026 Aura Studio. All rights reserved.'
      },
      settings: { isVisible: true, padding: 'none' }
    }
  ]
};

const DEFAULT_TEMPLATE_HTML = buildDefaultTemplateHtml(DEFAULT_TEMPLATE_MANIFEST);
const DEFAULT_TEMPLATE_CSS = `/* Templates are Tailwind-first. Add CSS only when needed. */`;
const DEFAULT_TEMPLATE_JS = `// Add shared scripts here when needed. Inline scripts can live in section templates.`;
const DEFAULT_TEMPLATE_STRUCTURED = JSON.stringify(DEFAULT_TEMPLATE_MANIFEST, null, 2);

const stripExternalAssets = (html: string) =>
  html
    .replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, '')
    .replace(/<script[^>]+src=["'][^"']+["'][^>]*><\/script>/gi, '');

const injectPreviewAssets = (html: string, css: string, js: string) => {
  const baseTag = `<base target="_self" />`;
  const tailwindTag = `<script src="https://cdn.tailwindcss.com"></script>`;
  const styleTag = `${baseTag}${tailwindTag}<style id="template-css">${css || ''}</style>`;
  const scriptTag = `<script id="template-js">${js || ''}</script>`;

  const hasHead = /<\/head>/i.test(html);
  const hasBody = /<\/body>/i.test(html);

  let output = stripExternalAssets(html);

  if (hasHead) {
    output = output.replace(/<\/head>/i, `${styleTag}</head>`);
  } else {
    output = `${styleTag}\n${output}`;
  }

  if (hasBody) {
    output = output.replace(/<\/body>/i, `${scriptTag}</body>`);
  } else {
    output = `${output}\n${scriptTag}`;
  }

  return output;
};

const buildPreviewDoc = (html: string, css: string, js: string) => {
  const trimmed = (html || '').trim();
  const isFullDoc = /<html[\s>]/i.test(trimmed) || /<!doctype html>/i.test(trimmed);

  if (isFullDoc) {
    return injectPreviewAssets(trimmed, css, js);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<base target="_self" />
<style id="template-css">${css || ''}</style>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-slate-900">
${trimmed}
<script id="template-js">${js || ''}</script>
</body>
</html>`;
};

const AdminTemplatesTab: React.FC<AdminTemplatesTabProps> = ({
  templateId,
  templateName,
  templateNiche,
  templateStructuredContent,
  templateHtml,
  templateCss,
  templateJs,
  templatePreview,
  templateNotify,
  templateNotifyTarget,
  templateSelectedUsers,
  templateHighlights,
  templateCtaUrl,
  templateCtaLabel,
  templateFooterNote,
  templateUserSearch,
  templateValidationErrors,
  editingTemplateDbId,
  isTemplateSaving,
  isTemplatesLoading,
  adminTemplates,
  users,
  nicheOptions,
  onTemplateIdChange,
  onTemplateNameChange,
  onTemplateNicheChange,
  onTemplateStructuredContentChange,
  onTemplateHtmlChange,
  onTemplateCssChange,
  onTemplateJsChange,
  onTemplatePreviewChange,
  onTemplateNotifyToggle,
  onTemplateNotifyTargetChange,
  onTemplateSelectedUsersChange,
  onTemplateHighlightsChange,
  onTemplateCtaUrlChange,
  onTemplateCtaLabelChange,
  onTemplateFooterNoteChange,
  onTemplateUserSearchChange,
  onEditTemplate,
  onCancelEdit,
  onDeleteTemplate,
  onSave
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeEditor, setActiveEditor] = useState<'html' | 'css' | 'js' | 'manifest'>('html');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState('');
  const [isUploadingPreview, setIsUploadingPreview] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const previewInputRef = useRef<HTMLInputElement>(null);

  const filteredUsers = users.filter((u) =>
    u.fullName?.toLowerCase().includes(templateUserSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(templateUserSearch.toLowerCase())
  );

  const autoId = useMemo(() => {
    const base = [templateNiche, templateName].filter(Boolean).join('-');
    return slugify(base) || templateId;
  }, [templateNiche, templateName, templateId]);

  useEffect(() => {
    if (autoId && autoId !== templateId) {
      onTemplateIdChange(autoId);
    }
  }, [autoId, templateId, onTemplateIdChange]);

  useEffect(() => {
    if (!isEditorOpen) return;
    const isEmpty =
      !templateHtml.trim() &&
      !templateCss.trim() &&
      !templateJs.trim() &&
      !templateStructuredContent.trim();
    if (!isEmpty) return;
    onTemplateHtmlChange(DEFAULT_TEMPLATE_HTML);
    onTemplateCssChange(DEFAULT_TEMPLATE_CSS);
    onTemplateJsChange(DEFAULT_TEMPLATE_JS);
    onTemplateStructuredContentChange(DEFAULT_TEMPLATE_STRUCTURED);
  }, [
    isEditorOpen,
    templateHtml,
    templateCss,
    templateJs,
    templateStructuredContent,
    onTemplateHtmlChange,
    onTemplateCssChange,
    onTemplateJsChange,
    onTemplateStructuredContentChange
  ]);

  const editorHeight = isExpanded ? 520 : 280;

  const openPreview = () => {
    const raw = templateStructuredContent.trim();
    if (raw) {
      try {
        const manifest = JSON.parse(raw);
        setPreviewDoc(renderManifest(manifest));
        setPreviewOpen(true);
        return;
      } catch {
        // fall back to raw html/css/js
      }
    }
    setPreviewDoc(buildPreviewDoc(templateHtml, templateCss, templateJs));
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Template Studio</h3>
              <p className="text-xs text-slate-500 font-medium">Create, validate, and preview templates before publishing.</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (editingTemplateDbId) onCancelEdit();
              setIsEditorOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase bg-teal-600 text-white hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" /> Create Template
          </button>
        </div>
      </div>

      {isEditorOpen && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="text-base font-black text-slate-900">{editingTemplateDbId ? 'Editing Template' : 'New Template'}</h4>
              <p className="text-xs text-slate-500">HTML, CSS, JS, and Manifest are required.</p>
            </div>
            <div className="flex items-center gap-2">
              {editingTemplateDbId && (
                <button
                  onClick={onCancelEdit}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-slate-100 text-slate-600"
                >
                  Cancel Edit
                </button>
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-slate-100 text-slate-600"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={openPreview}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-slate-900 text-white flex items-center gap-2"
              >
                <Eye className="w-3 h-3" /> Preview
              </button>
              <button
                onClick={onSave}
                disabled={isTemplateSaving}
                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {isTemplateSaving ? 'Saving...' : editingTemplateDbId ? 'Save Changes' : 'Save Template'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Template Name</label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                value={templateName}
                onChange={(e) => onTemplateNameChange(e.target.value)}
                placeholder="Studio Edge"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Niche</label>
              <select
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                value={templateNiche}
                onChange={(e) => onTemplateNicheChange(e.target.value)}
              >
                <option value="">Select niche</option>
                {nicheOptions.map((niche) => (
                  <option key={niche} value={niche}>{niche}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Template ID (Auto)</label>
              <input
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600"
                value={autoId}
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr,2fr] gap-4 items-start">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Preview Image</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50">
                {templatePreview ? (
                  <div className="space-y-3">
                    <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-white border border-slate-200">
                      <img src={templatePreview} alt="Template preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => onTemplatePreviewChange('')}
                      className="text-[10px] font-black uppercase text-rose-500"
                    >
                      Remove Preview
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Upload a preview image for the templates listing.</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <label id='previewInp' className="text-[10px] font-black uppercase text-slate-400">Upload Preview</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id='previewInp'
                  hidden
                  ref={previewInputRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploadingPreview(true);
                    try {
                      const result = await cloudinaryService.uploadFile(file);
                      onTemplatePreviewChange(result.secureUrl || result.url);
                      toast.success('Preview uploaded.');
                    } catch (error: any) {
                      toast.error(error?.message || 'Failed to upload preview.');
                    } finally {
                      setIsUploadingPreview(false);
                    }
                  }}
                  className="w-full text-sm"
                />
                <button
                  type="button"
                  disabled={isUploadingPreview}
                  onClick={() => previewInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-slate-900 text-white disabled:opacity-60"
                >
                  {isUploadingPreview ? <Loader className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  {isUploadingPreview ? 'Uploading' : 'Upload'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">Uploads are stored in Cloudinary via the `/upload` endpoint.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['html', 'css', 'js'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveEditor(tab as any)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${activeEditor === tab ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-100 overflow-hidden">
            {activeEditor === 'html' && (
              <Editor
                height={editorHeight}
                defaultLanguage="html"
                value={templateHtml}
                onChange={(value) => onTemplateHtmlChange(value || '')}
                theme="vs-dark"
                options={{ minimap: { enabled: false }, fontSize: 12 }}
              />
            )}
            {activeEditor === 'css' && (
              <Editor
                height={editorHeight}
                defaultLanguage="css"
                value={templateCss}
                onChange={(value) => onTemplateCssChange(value || '')}
                theme="vs-dark"
                options={{ minimap: { enabled: false }, fontSize: 12 }}
              />
            )}
            {activeEditor === 'js' && (
              <Editor
                height={editorHeight}
                defaultLanguage="javascript"
                value={templateJs}
                onChange={(value) => onTemplateJsChange(value || '')}
                theme="vs-dark"
                options={{ minimap: { enabled: false }, fontSize: 12 }}
              />
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-slate-900">Structured Content</p>
                <p className="text-xs text-slate-500">Required for the section editor and template compliance.</p>
              </div>
              <button
                onClick={() => setActiveEditor('manifest' as any)}
                className="px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-slate-100 text-slate-600"
              >
                Open JSON
              </button>
            </div>
            {activeEditor === 'manifest' && (
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <Editor
                  height={editorHeight}
                  defaultLanguage="json"
                  value={templateStructuredContent}
                  onChange={(value) => onTemplateStructuredContentChange(value || '')}
                  theme="vs-dark"
                  options={{ minimap: { enabled: false }, fontSize: 12 }}
                />
              </div>
            )}
            <div className="text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-600">Manifest requirements</p>
              <p>`metadata.version`, `globalConfig.theme`, `sections[]` with `id`, `type`, `componentId`, `content`.</p>
              {templateValidationErrors.length > 0 && (
                <div className="text-red-600 font-semibold">
                  {templateValidationErrors.join(' ')}
                </div>
              )}
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Notify Users</p>
                <p className="text-xs text-slate-500">Send a launch email about this template.</p>
              </div>
              <button
                onClick={onTemplateNotifyToggle}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${templateNotify ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}
              >
                {templateNotify ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {templateNotify && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {['all', 'niche', 'selected'].map((type) => (
                    <button
                      key={type}
                      onClick={() => onTemplateNotifyTargetChange(type as any)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${templateNotifyTarget === type ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {templateNotifyTarget === 'selected' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={templateUserSearch}
                      onChange={(e) => onTemplateUserSearchChange(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                    />
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {filteredUsers.map((u) => {
                        const checked = templateSelectedUsers.includes(u.id);
                        return (
                          <label key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-teal-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                onTemplateSelectedUsersChange(
                                  e.target.checked
                                    ? [...templateSelectedUsers, u.id]
                                    : templateSelectedUsers.filter((id) => id !== u.id)
                                );
                              }}
                              className="accent-teal-600"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-800">{u.fullName}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Selected: {templateSelectedUsers.length}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Highlights (one per line)</label>
                  <textarea
                    className="w-full min-h-[120px] bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-xs font-medium focus:border-teal-500 focus:ring-0"
                    value={templateHighlights}
                    onChange={(e) => onTemplateHighlightsChange(e.target.value)}
                    placeholder="Bold hero layout\nHigh-impact project grid"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">CTA Label</label>
                    <input
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                      value={templateCtaLabel}
                      onChange={(e) => onTemplateCtaLabelChange(e.target.value)}
                      placeholder="Preview Template"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">CTA URL</label>
                    <input
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                      value={templateCtaUrl}
                      onChange={(e) => onTemplateCtaUrlChange(e.target.value)}
                      placeholder="https://seeqme.com/templates"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Footer Note</label>
                  <input
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                    value={templateFooterNote}
                    onChange={(e) => onTemplateFooterNoteChange(e.target.value)}
                    placeholder="Try it out in your builder today."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-900">Existing Templates</h3>
          {isTemplatesLoading && <Loader className="w-4 h-4 text-teal-600 animate-spin" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminTemplates.map((tpl) => (
            <div key={tpl.id} className="border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-slate-900">{tpl.name}</p>
                <span className="text-[10px] font-black uppercase text-teal-600">{tpl.niche}</span>
              </div>
              <p className="text-xs text-slate-500">ID: {tpl.templateId}</p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => {
                    if (tpl.structuredContent) {
                      try {
                        const manifest = typeof tpl.structuredContent === 'string'
                          ? JSON.parse(tpl.structuredContent)
                          : tpl.structuredContent;
                        setPreviewDoc(renderManifest(manifest));
                        setPreviewOpen(true);
                        return;
                      } catch {
                        // fall back to raw html/css/js
                      }
                    }
                    setPreviewDoc(buildPreviewDoc(tpl.html || '', tpl.css || '', tpl.js || ''));
                    setPreviewOpen(true);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-teal-600"
                >
                  Preview <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setIsEditorOpen(true);
                    onEditTemplate(tpl);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteTemplate(tpl.id)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-rose-500"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
          {!isTemplatesLoading && adminTemplates.length === 0 && (
            <div className="col-span-full text-sm text-slate-500">No templates created yet.</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {previewOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-950/60" onClick={() => setPreviewOpen(false)} />
            <div
              className={`relative bg-white shadow-2xl w-full overflow-hidden ${isPreviewExpanded ? 'h-[95vh] max-w-[96vw] rounded-2xl' : 'h-[80vh] max-w-5xl rounded-3xl'}`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">Template Preview</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                    className="text-xs font-bold text-slate-500"
                    title={isPreviewExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isPreviewExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setPreviewOpen(false)} className="text-xs font-bold text-slate-500">Close</button>
                </div>
              </div>
              <iframe
                title="template-preview"
                srcDoc={previewDoc}
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTemplatesTab;
