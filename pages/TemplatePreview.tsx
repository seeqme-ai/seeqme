import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { usePublicTemplates } from '@/hooks/usePublicTemplates';
import { portfolioService } from '@/services/apiService';
import { renderManifest } from '@/utils/renderer';
import { normalizeToManifest, normalizeSectionContent } from '@/services/portfolioAIService';
import { Manifest, ManifestSection, Portfolio, Template } from '@/types';
import { useAuth } from '@/context/auth-context';

const TemplatePreview: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [baseManifest, setBaseManifest] = useState<Manifest | null>(null);
  const { templates } = usePublicTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => searchParams.get('templateId') || '');
  const [isApplying, setIsApplying] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await portfolioService.getPortfolio(id);
        setPortfolio(data);
        const raw = data?.structuredContent || {};
        const manifest = raw?.sections ? raw : normalizeToManifest(raw, 'MODERN_VERTICAL');
        setBaseManifest(manifest);
      } catch (err) {
        toast.error('Unable to load portfolio for preview');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  useEffect(() => {
    if (!selectedTemplateId) return;
    setSearchParams((prev) => {
      prev.set('templateId', selectedTemplateId);
      return prev;
    });
  }, [selectedTemplateId, setSearchParams]);

  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [selectedTemplateId, templates]);

  const filteredTemplates = useMemo(() => {
    const query = filter.toLowerCase();
    if (query === 'all') return templates;
    return templates.filter((tpl) => tpl.niche?.toLowerCase() === query);
  }, [filter, templates]);

  const selectedTemplate = useMemo<Template | undefined>(() => {
    return templates.find((tpl) => tpl.id === selectedTemplateId);
  }, [selectedTemplateId, templates]);

  const previewManifest = useMemo(() => {
    if (!baseManifest || !selectedTemplate?.structuredContent) return baseManifest;
    const templateManifest = selectedTemplate.structuredContent as Manifest;
    return applyTemplateLayout(baseManifest, templateManifest);
  }, [baseManifest, selectedTemplate]);

  const previewHtml = useMemo(() => {
    if (!previewManifest) return '';
    return renderManifest(previewManifest, user?.subscription === 'free');
  }, [previewManifest, user?.subscription]);

  const handleApply = async () => {
    if (!id || !previewManifest || !selectedTemplate) return;
    try {
      setIsApplying(true);
      await portfolioService.updatePortfolio(id, {
        structuredContent: previewManifest,
        html: renderManifest(previewManifest, user?.subscription === 'free'),
        themeId: selectedTemplate.id
      });
      toast.success('Template applied successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to apply template');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading || !portfolio || !baseManifest) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-20 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 pb-20 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Preview Template Swap</h1>
            <p className="text-slate-500 text-sm font-medium max-w-2xl">
              See how your existing content looks inside a new layout. Your live portfolio will not change until you confirm.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="h-11 px-6 rounded-xl bg-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isApplying ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Apply Template
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <p className="text-xs font-black uppercase text-slate-400 mb-2">Template Filter</p>
              <div className="flex flex-wrap gap-2">
                {['all', ...new Set(templates.map((t) => t.niche))].map((niche) => (
                  <button
                    key={niche}
                    onClick={() => setFilter(niche)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${filter === niche ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`w-full text-left p-3 rounded-xl border text-sm font-semibold transition-all ${selectedTemplateId === tpl.id ? 'border-teal-500 bg-teal-50/60' : 'border-slate-100 bg-white hover:border-teal-300'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-900">{tpl.name}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">{tpl.niche}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">Professional layout built for modern portfolios.</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Preview</p>
                <h2 className="text-lg font-bold text-slate-900">{selectedTemplate?.name || 'Template Preview'}</h2>
              </div>
              <div className="text-[10px] font-black uppercase text-slate-400">
                {selectedTemplate?.niche || 'General'}
              </div>
            </div>
            <div className="relative h-[70vh] bg-slate-50">
              <iframe
                title="Template Preview"
                className="w-full h-full"
                srcDoc={previewHtml}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const applyTemplateLayout = (base: Manifest, template: Manifest): Manifest => {
  const userBuckets: Record<string, ManifestSection[]> = {};
  base.sections.forEach((section) => {
    const type = section.type || 'section';
    if (!userBuckets[type]) userBuckets[type] = [];
    userBuckets[type].push(section);
  });

  const usedSections = new Set<string>();
  const templateSections = template.sections.map((section) => {
    const type = section.type || 'section';
    const candidate = userBuckets[type]?.shift();
    if (candidate) {
      usedSections.add(candidate.id);
      return {
        ...section,
        content: normalizeSectionContent(section.componentId, candidate.content),
      };
    }
    return null;
  }).filter(Boolean) as ManifestSection[];

  const remainingSections = base.sections.filter((section) => !usedSections.has(section.id));

  return {
    metadata: {
      version: base.metadata?.version || '1.0',
      niche: template.metadata?.niche || base.metadata?.niche || 'General',
      generatedAt: base.metadata?.generatedAt || new Date().toISOString()
    },
    globalConfig: template.globalConfig || base.globalConfig,
    sections: [...templateSections, ...remainingSections]
  };
};

export default TemplatePreview;
