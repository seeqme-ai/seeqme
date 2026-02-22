import { useEffect, useMemo, useState } from 'react';
import { PORTFOLIO_TEMPLATES } from '@/templates';
import { templateService } from '@/services/apiService';
import { Template } from '@/types';
import { Registry } from '@/registry';

const NEW_TEMPLATE_WINDOW_HOURS = 48;

const parseStructuredContent = (value: any) => {
  if (!value) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
};

const mapAdminTemplate = (tpl: any): Template => {
  return {
    id: tpl.templateId,
    name: tpl.name,
    niche: tpl.niche,
    preview: tpl.preview || '',
    html: tpl.html || '',
    css: tpl.css || '',
    js: tpl.js || '',
    structuredContent: parseStructuredContent(tpl.structuredContent),
    createdAt: tpl.createdAt
  };
};

const withNewFlag = (tpl: Template): Template => {
  if (!tpl.createdAt) return tpl;
  const createdAt = new Date(tpl.createdAt).getTime();
  const isNew = Date.now() - createdAt <= NEW_TEMPLATE_WINDOW_HOURS * 60 * 60 * 1000;
  return { ...tpl, isNew };
};

const isRenderableSection = (section: any) => {
  if (!section) return false;
  if (section.template) return true;
  const componentId = section.componentId;
  if (!componentId) return false;
  return Boolean((Registry as any)[componentId]);
};

const isUsableTemplate = (tpl: Template) => {
  const sc: any = tpl.structuredContent;
  if (!sc || !Array.isArray(sc.sections) || sc.sections.length === 0) return false;
  return sc.sections.every(isRenderableSection);
};

export const usePublicTemplates = () => {
  const [adminTemplates, setAdminTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await templateService.getPublicTemplates();
        if (!active) return;
        const mapped = (data || []).map(mapAdminTemplate).filter(isUsableTemplate).map(withNewFlag);
        setAdminTemplates(mapped);
      } catch {
        if (active) setAdminTemplates([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const templates = useMemo(() => {
    const merged = [...adminTemplates, ...PORTFOLIO_TEMPLATES.map(withNewFlag)].filter(isUsableTemplate);
    const seen = new Set<string>();
    return merged.filter((tpl) => {
      if (!tpl?.id || seen.has(tpl.id)) return false;
      seen.add(tpl.id);
      return true;
    });
  }, [adminTemplates]);

  return { templates, loading };
};
