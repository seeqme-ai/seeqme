import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ICONS } from '@/constants';
import { PortfolioData, LogEntry, BuildStatus, LayoutType } from '@/types';
import { generatePortfolio, refinePortfolio, redesignLayout, transformPlaceholdersToStructuredContent } from '@/services/portfolioAIService';
import { PORTFOLIO_TEMPLATES, generateTemplateHTML } from '@/templates';
import { useTemplate } from '@/context/template-context';
import { useAuth } from '@/context/auth-context';
import { portfolioService, deploymentService } from '@/services/apiService';
import Terminal from './Terminal';
import SectionEditor from '@/components/SectionEditor';
import SuccessDrawer from '@/components/SuccessDrawer';
import { ShieldCheck, Check, ArrowLeft, Paperclip, FileText, X, Loader } from 'lucide-react';
import { socketService } from '@/services/socketService';
import { domainService } from '@/services/apiService';
import BuilderLoader from '@/components/BuilderLoader';
import FloatingPromptInput from '@/components/FloatingPromptInput';
import TemplateSelectorDrawer from '@/components/TemplateSelectorDrawer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { renderManifest } from '@/utils/renderer';
import { RegistryMetadata } from '@/registry/metadata';
import { getAnonymousId } from '@/lib/identify';

const MotionDiv = motion.div as any;


const PortfolioBuilder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initialData } = (location.state || {}) as { initialData?: { type: string; value: string; templateId?: string } };
  const portfolioIdFromState = initialData?.type === 'edit' ? initialData.value : undefined;

  const { selectedTemplateId, setSelectedTemplateId, synthesisInput, setSynthesisInput } = useTemplate();
  const { user } = useAuth();

  const [status, setStatus] = useState<BuildStatus>('idle');
  const [data, setData] = useState<PortfolioData | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(LayoutType.MODERN_VERTICAL);
  const [history, setHistory] = useState<PortfolioData[]>([]);
  const lastSavedData = useRef<PortfolioData | null>(null);
  const [selectedNiche, setSelectedNiche] = useState('Engineering');
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; size: number; preview?: string; url?: string; content?: string } | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [chosenSubdomain, setChosenSubdomain] = useState('');
  const [selectedDomainId, setSelectedDomainId] = useState<string>('subdomain');
  const [availableDomains, setAvailableDomains] = useState<any[]>([]);
  const [isSuccessDrawerOpen, setIsSuccessDrawerOpen] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');
  const [conflictModal, setConflictModal] = useState<{ isOpen: boolean; message: string; existingPortfolioId: string; subdomain: string } | null>(null);
  const [isDeletingExisting, setIsDeletingExisting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const layouts = Object.values(LayoutType);

  const [builderSessionId] = useState(() => {
    const saved = sessionStorage.getItem('seeqme_builder_session');
    if (saved) return saved;
    const newId = `sess_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('seeqme_builder_session', newId);
    return newId;
  });


  useEffect(() => {
    // Connect socket on mount (always for live build logs)
    const token = localStorage.getItem('token');
    const stableId = user?.id || getAnonymousId();

    socketService.connect(token || undefined, stableId);

    // Subscribe to technical session room for build logs
    socketService.subscribeToSession(builderSessionId);

    socketService.setCallbacks(
      (log) => {
        setLogs(prev => [...prev, log]);
        // Intercept success log to force UI update if explicit complete event is missed
        if (log.message?.includes('✅ Deployed!') || log.message?.includes('Site live at')) {
          setStatus('completed');
          const match = log.message.match(/https:\/\/[^\s,]+/);
          if (match) setDeployedUrl(match[0]);
          setIsSuccessDrawerOpen(true);
        }
      },
      (completeData) => {
        setDeployedUrl(completeData.url);
        setStatus('completed');
        setIsSuccessDrawerOpen(true);

        // Ensure we update our local data with final backend state
        if (completeData.portfolioId === data?.id) {
          const sc = completeData.structuredContent || transformPlaceholdersToStructuredContent(completeData.placeholders || []);
          setData(prev => prev ? ({ ...prev, structuredContent: sc }) : null);
        }

        addLog('Deployment verified. Site is now live!', 'success');
      },
      (errorData) => {
        setStatus('ready');
        setLogs(prev => [...prev, {
          message: `❌ Deployment Failed: ${errorData.error}`,
          type: 'error',
          timestamp: new Date().toLocaleTimeString()
        }]);
        toast.error(`Deployment failed: ${errorData.error}`);
      }
    );
    return () => socketService.disconnect();
  }, [user?.id, builderSessionId]);

  useEffect(() => {
    if (data?.id) {
      socketService.subscribeToPortfolio(data.id);
    }
    return () => {
      if (data?.id) socketService.unsubscribeFromPortfolio(data.id);
    };
  }, [data?.id]);



  useEffect(() => {
    const init = async () => {
      // Guard: Only perform initial loading if we are in idle state
      if (status !== 'idle') return;

      // 0. Check for portfolioId in URL (for editing existing published portfolios)
      if (portfolioIdFromState && !data) {
        try {
          addLog(`Loading portfolio ${portfolioIdFromState} from backend...`, 'info');
          const fetchedPortfolio = await portfolioService.getPortfolio(portfolioIdFromState);
          // Hydrate structuredContent if missing (legacy version)
          const structuredContent = fetchedPortfolio.structuredContent || transformPlaceholdersToStructuredContent(fetchedPortfolio.placeholders || []);
          setData({
            ...fetchedPortfolio,
            structuredContent,
            placeholders: fetchedPortfolio.placeholders || []
          });
          setStatus('ready');
          addLog('Portfolio loaded successfully from backend.', 'success');
          return;
        } catch (error: any) {
          addLog(`ERR_LOAD_PORTFOLIO: ${error?.message || 'Failed to load portfolio from backend.'}`, 'error');
          setStatus('idle');
          // If loading fails, clear the portfolioId from the URL to prevent infinite retries
          navigate(location.pathname, { replace: true });
          return;
        }
      }

      // 1. Check for explicit template selection or synthesis from Context
      if (synthesisInput) {
        const fileData = (window as any)._pendingFile;
        handleBuild(synthesisInput, fileData ? [fileData] : undefined);
        delete (window as any)._pendingFile;
        return;
      }

      if (selectedTemplateId) {
        const template = PORTFOLIO_TEMPLATES.find(t => t.id === selectedTemplateId);
        if (template) {
          // Priority Check: Is there a draft, and does it match this template?
          const savedDraft = localStorage.getItem('seeqme_portfolio_draft');
          if (savedDraft) {
            try {
              const parsed = JSON.parse(savedDraft);
              if (parsed.templateId === selectedTemplateId) {
                // Return to matching draft
                setData(parsed);
                addLog('Resumed build from last local session.', 'info');
                setStatus('ready'); // Ensure status is set correctly
                return;
              }
            } catch (e) { }
          }
          // No matching draft or forced fresh start
          loadTemplate(selectedTemplateId);
          return;
        }
      }

      // 2. Fallback: Check for any existing draft (e.g. returning to builder via direct URL or Edit)
      if (!data) {
        const savedDraft = localStorage.getItem('seeqme_portfolio_draft');
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (parsed.html && parsed.html.includes('data-field')) {
              if (!parsed.structuredContent && parsed.placeholders) {
                parsed.structuredContent = transformPlaceholdersToStructuredContent(parsed.placeholders);
              }
              setData(parsed);
              setStatus('ready'); // Ensure status is set correctly
              addLog('Resumed build from last local session.', 'info');
            } else {
              localStorage.removeItem('seeqme_portfolio_draft');
            }
          } catch (e) {
            console.error('Failed to parse saved draft:', e);
          }
        }
      }
    };

    init();
  }, [selectedTemplateId, synthesisInput, portfolioIdFromState, navigate, location.pathname, status]);

  // Consolidate local storage, iframe, and backend sync
  useEffect(() => {
    if (data) {
      localStorage.setItem('seeqme_portfolio_draft', JSON.stringify(data));
      setIsIframeLoading(true); // Trigger loader when data changes
      updateIframe(data);

      const portfolioId = data.id.startsWith('portfolio-') ? null : data.id;
      if (portfolioId && user && status === 'ready') {
        const timer = setTimeout(async () => {
          // Compare with last saved to avoid unnecessary API calls
          const scChanged = JSON.stringify(data.structuredContent) !== JSON.stringify(lastSavedData.current?.structuredContent);
          const htmlChanged = data.html !== lastSavedData.current?.html;
          const cssChanged = data.css !== lastSavedData.current?.css;

          if (!scChanged && !htmlChanged && !cssChanged) return;

          try {

            await portfolioService.updatePortfolio(portfolioId, {
              structuredContent: data.structuredContent,
              html: data.html,
              css: data.css,
              js: data.js,
              isPublished: false
            });
            lastSavedData.current = { ...data };
            addLog('Changes auto-saved.', 'success');
          } catch (err) {
            console.error('[PortfolioBuilder] Auto-save failed:', err);
            addLog('Auto-save failed.', 'error');
          }
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [data?.structuredContent, data?.html, data?.css, data?.js, data?.id, user, status]);

  // Only update lastSavedData on initial load or full data refresh (not on every typing change)
  useEffect(() => {
    if (data && !lastSavedData.current) {
      lastSavedData.current = { ...data };
    }
  }, [data?.id]);


  useEffect(() => {
    if (data && status === 'ready') {
      const tryUpdate = (attempts = 0) => {
        if (!iframeRef.current && attempts < 10) {
          setTimeout(() => tryUpdate(attempts + 1), 100);
          return;
        }
        updateIframe(data);
      };
      const timer = setTimeout(() => tryUpdate(0), 100);
      return () => clearTimeout(timer);
    }
  }, [currentTheme, currentLayout, status]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [...prev, { timestamp, type, message }]);
  };

  const loadTemplate = (id: string) => {
    setStatus('analyzing');
    const template = PORTFOLIO_TEMPLATES.find(t => t.id === id);
    if (!template) {
      addLog(`ERR_RESOLVE: Template ${id} not found.`, 'error');
      setStatus('idle');
      return;
    }

    addLog(`Loading template: ${template.name}...`);

    const sc = template.structuredContent ||
      (template.initialPlaceholders ? transformPlaceholdersToStructuredContent(template.initialPlaceholders) : {});


    const initialPortfolio: PortfolioData = {
      id: `portfolio-${Date.now()}`,
      name: template.name,
      html: template.html,
      css: template.css,
      js: '',
      structuredContent: sc,
      theme: currentTheme,
      layout: currentLayout,
      niche: template.niche,
      templateId: id
    };

    setData(initialPortfolio);
    setStatus('ready');
    addLog(`Template loaded successfully.`, 'success');
  };

  const getUpdatedHtml = (portfolio: PortfolioData): string => {
    const sc = portfolio.structuredContent;


    if (sc && (sc.metadata?.version === '2.0' || sc.metadata?.version === '1.0' || Array.isArray(sc.sections))) {
      return renderManifest(sc);
    }

    return portfolio.html || '';
  };



  const updateIframe = (portfolio: PortfolioData) => {
    if (!iframeRef.current) return;
    const sc = portfolio.structuredContent;
    if (sc && (sc.metadata?.version === '2.0' || sc.metadata?.version === '1.0' || Array.isArray(sc.sections))) {
      iframeRef.current.srcdoc = renderManifest(sc);
      return;
    }
    const finalHtml = getUpdatedHtml(portfolio);
    iframeRef.current.srcdoc = finalHtml;
  };

  const handleBuild = async (customInput?: string, files?: any[]) => {
    // If we are in the middle of a build, don't start another one
    if (status === 'synthesizing' || status === 'generating') return;

    const inputToUse = customInput || synthesisInput;
    if (!inputToUse && (!files || files.length === 0)) {
      toast.error("Please provide a prompt or a file for the build.");
      return;
    }

    setStatus('synthesizing');
    setData(null); // Clear previous portfolio data for a fresh build
    setLogs([]);   // Clear logs for fresh build
    setProgress(5);
    setIsTerminalCollapsed(false);
    addLog(`Creating your professional portfolio...`, 'info');

    const progressSteps = [
      { p: 15, m: "Initializing  core...", t: 1000 },
      { p: 30, m: "Analyzing your professional profile...", t: 2500 },
      { p: 45, m: "Synthesizing career narrative...", t: 4000 },
      { p: 60, m: "Architecting visual structure...", t: 6000 },
      { p: 75, m: "Optimizing layout and assets...", t: 8000 },
      { p: 90, m: "Finalizing your digital presence...", t: 10000 }
    ];

    const timeouts: any[] = [];
    progressSteps.forEach(step => {
      const timeout = setTimeout(() => {
        setProgress(step.p);
        addLog(step.m, 'info');
      }, step.t);
      timeouts.push(timeout);
    });

    try {
      const template = PORTFOLIO_TEMPLATES.find(t => t.id === selectedTemplateId);

      // Determine if we have a persistent portfolio ID (not a temp one based on Date.now)
      const persistentId = data?.id && !data.id.startsWith('portfolio-') ? data.id : undefined;

      const result = await generatePortfolio({
        type: 'omni',
        value: inputToUse,
        baseHtml: template?.html,
        files: files,
        sessionId: builderSessionId,
        portfolioId: persistentId,
        templateId: selectedTemplateId || undefined,
        niche: template?.niche || template?.structuredContent?.metadata?.niche || selectedNiche || undefined
      } as any);

      timeouts.forEach(clearTimeout);
      setProgress(100);

      const aiHtml = result.html || '';
      const finalHtml = aiHtml || template?.html || '';

      const completeData: PortfolioData = {
        ...result,
        id: result.portfolioId || result.id || `portfolio-${Date.now()}`,
        name: result.name || template?.name || 'My Portfolio',
        theme: currentTheme,
        layout: currentLayout,
        html: finalHtml,
        css: result.css || template?.css || '',
        js: result.js || ''
      };

      setData(completeData);
      setStatus('ready');
      setSynthesisInput('');
      setSelectedTemplateId(null);
      addLog("Build complete! Your portfolio is ready.", "success");
      setIsTerminalCollapsed(true);

    } catch (error: any) {
      timeouts.forEach(clearTimeout);
      setProgress(0);

      if (error.response && error.response.status === 402 && error.response.data && error.response.data.code === 'LIMIT_REACHED') {
        addLog(`ERR_LIMIT: ${error.response.data.error}`, "error");
        toast.error(error.response.data.error);
        navigate('/plans');
      } else {
        addLog(`ERR_SYNTHESIS: ${error?.message || error}`, "error");
        toast.error(error?.message || 'Failed to generate portfolio');
      }
      setStatus('ready');
    }
  };

  const handleRemix = async () => {
    if (!data) return;
    setHistory(prev => [...prev, { ...data }]);

    setStatus('generating');
    setProgress(10);
    setIsTerminalCollapsed(false);
    addLog('AI Protocol: Redesigning visual architecture...', 'info');

    const progressSteps = [
      { p: 25, m: "Analyzing visual hierarchy...", t: 1500 },
      { p: 50, m: "Synthesizing new design components...", t: 4000 },
      { p: 75, m: "Re-rendering UI layout...", t: 7000 },
      { p: 90, m: "Finalizing redesign polish...", t: 10000 }
    ];

    const timeouts: any[] = [];
    progressSteps.forEach(step => {
      const timeout = setTimeout(() => {
        setProgress(step.p);
        addLog(step.m, 'info');
      }, step.t);
      timeouts.push(timeout);
    });

    try {
      const redesigned = await redesignLayout(data);
      timeouts.forEach(clearTimeout);
      setProgress(100);

      setData(redesigned);
      if (redesigned.layout) setCurrentLayout(redesigned.layout);
      if (redesigned.theme) setCurrentTheme(redesigned.theme);
      setStatus('ready');
      addLog('Design updated successfully.', 'success');
    } catch (error: any) {
      timeouts.forEach(clearTimeout);
      setProgress(0);
      addLog(`ERR_REDESIGN: ${error.message}`, 'error');
      setStatus('ready');

      // Fallback to local remix if AI fails
      const currentIdx = layouts.indexOf(currentLayout);
      const nextIdx = (currentIdx + 1) % layouts.length;
      const newLayout = layouts[nextIdx];
      setCurrentLayout(newLayout);
      const template = PORTFOLIO_TEMPLATES.find(t => t.id === selectedTemplateId);
      // Fallback: Generate valid HTML using the local engine if AI fails
      const remixedHtml = generateTemplateHTML(newLayout, template?.niche || 'Engineering', currentTheme, data.structuredContent);
      setData({ ...data, html: remixedHtml, layout: newLayout });
    }
  };

  const handleUndo = async () => {
    if (!data) return;

    // If it's a real portfolio, try backend undo first
    const portfolioId = data.id.startsWith('portfolio-') ? null : data.id;
    if (portfolioId) {
      setStatus('generating');
      addLog('AI Protocol: Reverting to previous artifact state...', 'info');
      try {
        const response = await portfolioService.undoPortfolio(portfolioId);
        // After undo, we need to refresh the portfolio data
        const updated = await portfolioService.getPortfolio(portfolioId);

        // Hydrate structuredContent if missing (legacy version)
        const structuredContent = updated.structuredContent || transformPlaceholdersToStructuredContent(updated.placeholders || []);

        setData({
          ...updated,
          id: updated.id,
          html: updated.html,
          css: updated.css,
          js: updated.js,
          structuredContent,
          placeholders: updated.placeholders || []
        });
        setStatus('ready');
        addLog(`Undo successful: Returned to version ${response.version}`, 'success');
        return;
      } catch (error: any) {
        addLog(`ERR_UNDO: ${error?.message || 'Failed to revert'}`, 'error');
        setStatus('ready');
        // fall back to local history if backend undo fails
      }
    }

    if (history.length === 0) return;
    const prevData = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setData(prevData);
    setCurrentLayout(prevData.layout);
    setCurrentTheme(prevData.theme);
    addLog('Local Undo: Reverted to previous session state.', 'success');
  };

  const handleFloatingSubmit = (prompt: string, mode: 'refine' | 'new', file?: any) => {
    if (mode === 'refine') {
      submitRefinement(prompt, file);
    } else {
      handleBuild(prompt, file ? [file] : undefined);
    }
  };

  const submitRefinement = async (prompt: string, file: any) => {
    if (!data) {
      // If no data, fall back to "Build" mode automatically
      handleBuild(prompt, file ? [file] : undefined);
      return;
    }

    setStatus('generating');
    setProgress(10);
    setIsTerminalCollapsed(false);
    addLog(`Initiating refinement: "${prompt}"`, 'info');

    const progressSteps = [
      { p: 25, m: "Analyzing layout structure...", t: 1500 },
      { p: 50, m: "Synthesizing requested changes...", t: 4000 },
      { p: 75, m: "Re-rendering visual components...", t: 7000 },
      { p: 90, m: "Finalizing visual polish...", t: 10000 }
    ];

    const timeouts: any[] = [];
    progressSteps.forEach(step => {
      const timeout = setTimeout(() => {
        setProgress(step.p);
        addLog(step.m, 'info');
      }, step.t);
      timeouts.push(timeout);
    });

    try {
      let finalPrompt = prompt;
      if (file) {
        if (file.type === 'image' || file.type.startsWith('image/')) {
          finalPrompt += `\n\n[Context: User attached image: ${file.name}]\nImage URL: ${file.url || ''}`;
        } else {
          finalPrompt += `\n\n[Context: User attached document: ${file.name}]\nFile Content:\n${file.content || ''}`;
        }
      }


      const updated = await refinePortfolio(data, finalPrompt, file ? [file] : undefined);

      timeouts.forEach(clearTimeout);
      setProgress(100);

      // Force update iframe after refinement
      setData({ ...updated, theme: currentTheme, layout: currentLayout });

      // Clear inputs
      setRefinementPrompt('');
      setSelectedFile(null);

      setStatus('ready');
      addLog("Portfolio refinement successful.", "success");

      // Pulse effect on iframe to show it updated
      if (iframeRef.current) {
        iframeRef.current.style.opacity = '0.5';
        setTimeout(() => { if (iframeRef.current) iframeRef.current.style.opacity = '1'; }, 300);
      }

    } catch (error: any) {
      console.error('[PortfolioBuilder] Refinement failed:', error);
      timeouts.forEach(clearTimeout);
      setProgress(0);
      addLog(`ERR_REFINE: ${error?.message || error || 'Unknown AI error'}`, 'error');
      setStatus('ready');
      toast.error(error?.message || 'Failed to refine portfolio');
    }
  };

  const handleDeploy = async () => {
    if (!data) return;

    // Defer Auth: Show professional prompt if not authenticated
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Fetch domains on open
    try {
      const domainsData = await domainService.getDomains();
      setAvailableDomains(domainsData.domains || []);
    } catch (err) {
      console.error('Failed to fetch domains:', err);
    }

    const slug = data.subdomain || user.fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
    setChosenSubdomain(slug);
    setIsDeployModalOpen(true);
  };

  const confirmDeploy = async (subdomain: string) => {
    if (!data || !user) return;

    setIsDeployModalOpen(false);
    setStatus('deploying');
    addLog('Preparing deployment...', 'info');

    const useSubdomain = selectedDomainId === 'subdomain';
    const customDomain = availableDomains.find(d => d.id === selectedDomainId);

    try {
      // Generate HTML from Manifest V2 if needed
      const finalHtml = getUpdatedHtml(data);

      if (!finalHtml || finalHtml.trim() === '') {
        toast.error('Cannot deploy an empty portfolio. Please ensure your portfolio has content.');
        setStatus('ready');
        return;
      }

      // Update data with generated HTML
      const deployData = {
        ...data,
        html: finalHtml
      };

      const portfolioData: any = {
        name: deployData.name,
        html: deployData.html,
        css: deployData.css,
        js: deployData.js,
        subdomain: useSubdomain ? subdomain : undefined,
        customDomainId: !useSubdomain ? selectedDomainId : undefined,
        structuredContent: deployData.structuredContent,
        niche: selectedNiche || 'General',
        theme: currentTheme
      };

      // Save Portfolio - Update if already exists (created by AI), otherwise create
      let portfolioId = data.id.startsWith('portfolio-') ? null : data.id;

      if (portfolioId) {
        const updatePayload = {
          html: deployData.html,
          css: deployData.css,
          js: deployData.js,
          structuredContent: deployData.structuredContent,
          name: deployData.name,
          theme: currentTheme
        };
        await portfolioService.updatePortfolio(portfolioId, updatePayload);
      } else {
        const response = await portfolioService.createPortfolio({
          ...portfolioData,
          themeId: data.theme || 'modern',
          title: deployData.name || 'My Portfolio',
          content: JSON.stringify({ html: deployData.html, css: deployData.css, js: deployData.js })
        });
        portfolioId = response.portfolioId || response.id;
      }

      addLog(`Portfolio saved.`, 'success');

      //  Set up WebSocket for real-time deployment updates BEFORE triggering deployment
      socketService.connect(undefined, user?.id);
      socketService.subscribeToPortfolio(portfolioId as string);

      socketService.setCallbacks(
        // onLog - real-time deployment progress
        (logData: any) => {
          const message = logData.message || logData;
          const logType = logData.type || 'info';
          addLog(message, logType);
        },
        // onComplete - deployment finished successfully
        (completeData: any) => {
          const deployedUrl = completeData.url || `https://${subdomain}.seeqme.com`;
          setStatus('completed');
          setDeployedUrl(deployedUrl);
          setIsSuccessDrawerOpen(true);
          addLog(`✅ Deployed! Site live at ${deployedUrl}`, 'success');
          toast.success('Portfolio deployed successfully!');
          localStorage.removeItem('seeqme_portfolio_draft');
          socketService.unsubscribeFromPortfolio(portfolioId as string);
        },
        // onFailure - deployment failed
        (errorData: any) => {
          setStatus('ready');
          const errorMsg = errorData.error || errorData.message || 'Deployment failed';
          addLog(`❌ Deployment failed: ${errorMsg}`, 'error');
          toast.error(`Deployment failed: ${errorMsg}`);
          socketService.unsubscribeFromPortfolio(portfolioId as string);
        }
      );

      //  Open drawer immediately to show initial progress
      addLog(`Connecting to deployment service...`, 'info');
      setIsSuccessDrawerOpen(true);

      // Now trigger the deployment (WebSocket is already listening)
      addLog(`Broadcasting to ${subdomain}.seeqme.com...`, 'info');

      // Allow time for WS subscription to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (useSubdomain) {
        await deploymentService.deployPortfolio(portfolioId as string, subdomain);
      } else if (customDomain) {
        await deploymentService.deployPortfolio(portfolioId as string, undefined, selectedDomainId);
      }

      addLog(`Deployment workflow initiated.`, 'info');

      // Fallback timeout in case WebSocket events don't arrive
      setTimeout(() => {
        if (status === 'deploying') {
          addLog('Checking deployment status via fallback...', 'warn');
          deploymentService.getDeploymentStatus(portfolioId as string).then((statusData) => {
            if (statusData.status === 'completed') {
              const deployedUrl = statusData.url || `https://${subdomain}.seeqme.com`;
              setStatus('completed');
              setDeployedUrl(deployedUrl);
              addLog(`✅ Deployed! Site live at ${deployedUrl}`, 'success');
              toast.success('Portfolio deployed successfully!');
            } else if (statusData.status === 'failed') {
              setStatus('ready');
              addLog(`❌ Deployment failed`, 'error');
              toast.error('Deployment failed');
            }
          }).catch(() => {
            addLog('Could not verify deployment status. Check manually.', 'warn');
          });
        }
      }, 120000); // 2 minute fallback

    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        const { message, existingPortfolioId } = error.response.data;
        setConflictModal({
          isOpen: true,
          message: message || `The subdomain '${subdomain}' is already in use.`,
          existingPortfolioId,
          subdomain
        });
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to deploy';
        addLog(`Deployment Error: ${errorMessage}`, 'error');
        setStatus('ready');
        toast.error('Deployment initiation failed. Please check logs.');
      }
    }
  };

  const handleResolveConflict = async () => {
    if (!conflictModal) return;

    try {
      setIsDeletingExisting(true);
      addLog(`Deleting existing portfolio: ${conflictModal.existingPortfolioId}`, 'info');
      await portfolioService.deletePortfolio(conflictModal.existingPortfolioId);
      addLog('Conflict resolved. Retrying deployment...', 'success');

      const sub = conflictModal.subdomain;
      setConflictModal(null);
      confirmDeploy(sub); // Retry
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      addLog(`Failed to resolve conflict: ${errorMessage}`, 'error');
      toast.error('Could not replace existing site.');
    } finally {
      setIsDeletingExisting(false);
    }
  };

  const handleAuthConfirm = () => {
    setIsAuthModalOpen(false);
    if (data) {
      localStorage.setItem('seeqme_portfolio_draft', JSON.stringify(data));
    }
    navigate('/auth/login?redirect=/builder');
  };


  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

      } catch (error: any) {
        toast.error(error.message || 'Failed to analyze file');
        setSelectedFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleContentUpdate = (newContent: any) => {

    // Sync theme if changed in settings
    const newTheme = newContent.settings?.theme;
    if (newTheme && newTheme !== currentTheme) {
      setCurrentTheme(newTheme);
    }

    if (!data) return;

    const isV2 = newContent.metadata?.version === '2.0';

    // For V2, we generate fresh HTML using the manifest renderer to ensure
    // full structural updates and correct SEO metadata injection.
    const updatedHtml = isV2
      ? renderManifest(newContent, user?.subscription === 'free')
      : getUpdatedHtml({
        ...data,
        structuredContent: newContent,
        theme: newTheme || data.theme
      });

    setData({
      ...data,
      structuredContent: newContent,
      theme: newTheme || data.theme,
      html: updatedHtml
    });
  };

  const handleInjectBlock = (componentId: string) => {
    if (!data) return;

    const metadata = RegistryMetadata[componentId];
    if (!metadata) return;

    // Create sensible default content based on component type
    let defaultContent: any = {};

    switch (metadata.category) {
      case 'hero':
        defaultContent = {
          name: 'Your Name',
          title: 'Your Professional Title',
          bio: 'A compelling description of what you do and what makes you unique.',
          image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=800',
          ctaText: 'Get in Touch',
          ctaLink: '#contact'
        };
        break;
      case 'about':
        defaultContent = {
          title: 'About Me',
          content: 'Share your story, philosophy, and what drives you professionally.',
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
          stats: [
            { label: 'Years Experience', value: '5+' },
            { label: 'Projects Completed', value: '50+' },
            { label: 'Happy Clients', value: '100+' }
          ]
        };
        break;
      case 'skills':
        defaultContent = {
          title: 'Skills & Expertise',
          items: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Design', 'Strategy'],
          skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Design', 'Strategy']
        };
        break;
      case 'projects':
        defaultContent = {
          title: 'Featured Work',
          items: [
            {
              title: 'Project Name',
              description: 'Brief description of this amazing project and its impact.',
              technologies: 'React, Node.js, MongoDB',
              image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
              link: '#'
            }
          ]
        };
        break;
      case 'experience':
        defaultContent = {
          title: 'Experience',
          items: [
            {
              role: 'Your Role',
              company: 'Company Name',
              period: '2020 - Present',
              description: 'Key responsibilities and achievements in this role.'
            }
          ]
        };
        break;
      case 'contact':
        defaultContent = {
          title: 'Get in Touch',
          bio: 'Available for new opportunities and collaborations.',
          email: 'your.email@example.com',
          phone: '+1 (555) 123-4567',
          location: 'Your City, Country',
          socials: [
            { platform: 'LinkedIn', link: '#', url: '#' },
            { platform: 'GitHub', link: '#', url: '#' }
          ]
        };
        break;
      case 'testimonials':
        defaultContent = {
          title: 'Testimonials',
          items: [
            {
              name: 'Client Name',
              role: 'CEO, Company',
              content: 'A wonderful testimonial about your work and professionalism.',
              quote: 'A wonderful testimonial about your work and professionalism.',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
              image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
            }
          ]
        };
        break;
      default:
        defaultContent = {
          title: metadata.name,
          content: 'Add your content here using the section editor.'
        };
    }

    const newSection: any = {
      id: `section-${Date.now()}`,
      type: metadata.category,
      componentId: componentId,
      content: defaultContent,
      settings: { isVisible: true, padding: 'medium' }
    };

    const newSections = [...(data.structuredContent?.sections || []), newSection];
    const newContent = {
      ...data.structuredContent,
      sections: newSections,
      metadata: {
        ...data.structuredContent?.metadata,
        version: '1.0',
        niche: data.structuredContent?.metadata?.niche || 'General',
        generatedAt: new Date().toISOString()
      },
      globalConfig: data.structuredContent?.globalConfig || {
        theme: data.theme || 'dark',
        colorPalette: {
          primary: '#00f2ff',
          secondary: '#00d1ff',
          background: '#020617',
          surface: '#0f172a',
          text: '#94a3b8',
          heading: '#ffffff'
        },
        typography: {
          headingFont: 'Space Grotesk',
          bodyFont: 'Inter',
          monoFont: 'JetBrains Mono'
        }
      }
    };

    handleContentUpdate(newContent);
    addLog(`Injected premium ${metadata.name} block into portfolio.`, 'success');
    toast.success(`${metadata.name} added! Open the editor to customize it.`);
  };

  const handleCodeUpdate = (newHtml: string) => {
    if (!data) return;
    setData({
      ...data,
      html: newHtml
    });
  };

  const handleExport = () => {
    if (!data) return;
    addLog(`Optimizing SEO and bundling identity artifact...`, 'info');

    const pMap: Record<string, string> = {};

    // Flatten structuredContent for simple placeholder replacement
    // This is a "best effort" mapping for the legacy regex replacement in handleExport
    // New export should ideally use the DOM-based hydration, but for now we map back to keys.
    const flattenContent = (obj: any, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'string') {
          // Heuristic to match legacy placeholder IDs if possible, or just use the path
          // Legacy mappings:
          // hero.name -> HERO_NAME
          // hero.title -> HERO_TITLE
          // hero.bio -> HERO_VAL_PROP
          // hero.image -> HERO_IMG
          // contact.email -> EMAIL
          let id = prefix ? `${prefix}.${key}` : key;

          if (prefix === 'hero') {
            if (key === 'name') id = 'HERO_NAME';
            if (key === 'title') id = 'HERO_TITLE';
            if (key === 'bio') id = 'HERO_VAL_PROP';
            if (key === 'image') id = 'HERO_IMG';
          }
          if (prefix === 'contact') {
            if (key === 'email') id = 'EMAIL';
            if (key === 'phone') id = 'PHONE';
            if (key === 'location') id = 'LOCATION';
          }
          pMap[id] = value;
          pMap[prefix ? `${prefix}_${key}`.toUpperCase() : key.toUpperCase()] = value; // Also support generic keys
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenContent(value, prefix ? `${prefix}.${key}` : key);
        }
      });
    };

    if (data.structuredContent) {
      flattenContent(data.structuredContent);
    }

    const summaryText = (pMap['HERO_VAL_PROP'] || '').substring(0, 160);
    const profileImg = pMap['HERO_IMG'] || '';
    const fullName = pMap['HERO_NAME'] || 'Identity';
    const firstTitle = pMap['HERO_TITLE'] || 'Portfolio';

    let finalHtml = getUpdatedHtml(data);

    const firstName = fullName.split(' ')[0].toUpperCase();
    finalHtml = finalHtml.replace(/{FIRST_NAME}/g, firstName);

    const fullDoc = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fullName} | ${firstTitle}</title>
    <meta name="description" content="${summaryText}">
    
    <meta property="og:type" content="website">
    <meta property="og:title" content="${fullName} - Portfolio">
    <meta property="og:description" content="${summaryText}">
    <meta property="og:image" content="${profileImg}">

    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${fullName} - Portfolio">
    <meta property="twitter:description" content="${summaryText}">
    <meta property="twitter:image" content="${profileImg}">

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <style>
      html { scroll-behavior: smooth; }
      body { 
        background: ${data.theme === 'dark' ? '#020617' : '#ffffff'}; 
        color: ${data.theme === 'dark' ? 'white' : '#020617'}; 
        font-family: 'Space Grotesk', sans-serif; 
        margin: 0; padding: 0; 
      } 
      ${data.css}
      .break-words { word-break: break-word; overflow-wrap: break-word; }
    </style>
</head>
<body>
    ${finalHtml}
    <script>
      ${data.js}
    </script>
</body>
</html>`;

    const blob = new Blob([fullDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `${fullName.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`Export successful: ${filename}`, 'success');
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-700 ${currentTheme === 'dark' ? 'bg-background text-foreground' : 'bg-background text-foreground'}`}>
      <MotionDiv
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full z-[100] border-b border-border bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-teal-500/10 rounded-full transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-border hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRemix}
                className="flex items-center gap-2 bg-teal-500/10 border border-primary/20 px-4 py-2 rounded-full text-[11px] font-semibold hover:bg-teal-500/20 transition-all active:scale-95 shadow-sm"
              >
                <ICONS.Remix className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Remix Design</span>
              </button>
              {(history.length > 0 || (data && !data.id.startsWith('portfolio-'))) && (
                <button
                  onClick={handleUndo}
                  title="Undo Last Action"
                  className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 hover:bg-rose-500/20 transition-all active:scale-95"
                >
                  <ICONS.Undo className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">

            <button
              onClick={() => setIsEditorOpen(true)}
              className="flex items-center gap-2 bg-teal-500 text-white border border-primary/20 px-3 sm:px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-teal-600 transition-all active:scale-95 shadow-md"
              title="Edit Content"
            >
              <ICONS.Settings className="w-4 h-4" /> <span className="hidden sm:inline">Edit Content</span>
            </button>
            <button
              onClick={handleDeploy}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold transition-all active:scale-95 shadow-md ${status === 'deploying' ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
            >
              {status === 'deploying' ? <ICONS.Loader className="w-4 h-4 animate-spin" /> : <ICONS.Globe className="w-4 h-4" />}
              <span>
                {status === 'deploying'
                  ? 'Publishing'
                  : (data && !data.id.startsWith('portfolio-') && ((data as any).url || (data as any).subdomain || (data as any).status === 'completed') ? 'Redeploy' : 'Publish')}
              </span>
            </button>
          </div>
        </div>
      </MotionDiv>

      <div className="flex-1 mt-20 sm:mt-24 relative flex flex-col">
        <div className="flex-1 relative overflow-hidden bg-background">
          <AnimatePresence mode="wait">
            {((status === 'synthesizing' || status === 'generating') || (!data && status !== 'idle')) ? (
              <BuilderLoader
                title={status === 'generating'
                  ? (refinementPrompt ? "Refining..." : "Remixing...")
                  : "Building..."
                }
                currentStep={progress}
                totalSteps={100}
              />
            ) : (
              <MotionDiv key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
                {isIframeLoading && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm transition-all duration-500">
                    <div className="flex flex-col items-center gap-4">
                      <Loader className='text-teal-500 animate-spin' />
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  onLoad={() => setIsIframeLoading(false)}
                  className="w-full h-full border-none bg-white"
                  title="Artifact Viewport"
                />
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>


      </div>

      <FloatingPromptInput
        onSubmit={handleFloatingSubmit}
        isGenerating={status === 'generating' || status === 'synthesizing'}
        onToggleTerminal={() => setIsTerminalCollapsed(prev => !prev)}
      />

      <Terminal
        logs={logs}
        isCollapsed={isTerminalCollapsed}
        onToggle={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
        code={data ? getUpdatedHtml(data) : ''}
        onCodeChange={handleCodeUpdate}
        isPaid={user?.subscription && user.subscription !== 'free'}
      />

      {/* Force re-render of Editor when data ID changes or structural content updates */}
      <SectionEditor
        key={data?.id || 'editor'}
        structuredContent={data?.structuredContent || {}}
        onUpdate={handleContentUpdate}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />

      <TemplateSelectorDrawer
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onSelect={(id) => {
          loadTemplate(id);
          setSelectedTemplateId(id);
        }}
        onAddBlock={handleInjectBlock}
        currentTemplateId={selectedTemplateId || data?.templateId}
      />

      {/* Template Toggle Button */}
      {!isTemplateSelectorOpen && (
        <div className="fixed top-24 left-6 z-40">
          <button
            onClick={() => setIsTemplateSelectorOpen(true)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white p-3 rounded-xl shadow-lg transition-all group"
            title="Change Template"
          >
            <ICONS.Layout className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}



      {/* Deployment Modal */}
      <AnimatePresence>
        {isDeployModalOpen && (
          <div className="fixed inset-0 z-[9999] bg-white/95  backdrop-blur-3xl flex items-center justify-center p-6 text-foreground">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-white  border border-border rounded-3xl p-8 md:p-10 shadow-0"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight mb-1">Launch to Production</h2>

                </div>
                <button onClick={() => setIsDeployModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground mr-[-8px] mt-[-8px]">
                  <ICONS.X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  {selectedDomainId === 'subdomain' && (
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Configure Subdomain</label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={chosenSubdomain}
                          onChange={(e) => setChosenSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                          className="w-full bg-muted/30 border border-border rounded-xl py-3.5 px-5 text-base font-semibold text-foreground focus:border-teal-500 focus:bg-background outline-none transition-all shadow-sm"
                          placeholder="your-name"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-semibold pointer-events-none text-sm">
                          .seeqme.com
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <p className="text-[xs] text-muted-foreground font-medium">
                      <span className="text-teal-600  font-semibold">
                        {selectedDomainId === 'subdomain'
                          ? `${chosenSubdomain || '...'}.seeqme.com`
                          : availableDomains.find(d => d.id === selectedDomainId)?.domain
                        }
                      </span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/10 flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                    <ICONS.Globe className="w-4 h-4 text-teal-600 " />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Global Distribution</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your site will be optimized and deployed to our global edge network for 99.9% uptime.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setIsDeployModalOpen(false)}
                    className="flex-1 py-4 rounded-full text-sm font-semibold border border-border hover:bg-muted transition-all"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={() => confirmDeploy(chosenSubdomain)}
                    disabled={selectedDomainId === 'subdomain' && !chosenSubdomain}
                    className="flex-1 py-4 rounded-full bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-all shadow-xl disabled:opacity-50"
                  >
                    Deploy Now
                  </button>
                </div>
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
      <SuccessDrawer
        isOpen={isSuccessDrawerOpen}
        onClose={() => setIsSuccessDrawerOpen(false)}
        url={deployedUrl}
        domain={selectedDomainId === 'subdomain' ? `${chosenSubdomain}.seeqme.com` : availableDomains.find(d => d.id === selectedDomainId)?.name}
        status={status === 'completed' ? 'completed' : status === 'deploying' ? 'deploying' : 'failed'}
        logs={logs.map(l => l.message)}
      />

      <ConfirmModal
        isOpen={conflictModal?.isOpen || false}
        onClose={() => {
          setConflictModal(null);
          setStatus('ready');
        }}
        onConfirm={handleResolveConflict}
        title="Subdomain Conflict"
        description={conflictModal?.message || "There is a conflict with this subdomain."}
        confirmText={isDeletingExisting ? "Replacing..." : "Replace Existing"}
        cancelText="Cancel"
        isLoading={isDeletingExisting}
        variant="warning"
      />

      <ConfirmModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={handleAuthConfirm}
        title="Account Required"
        description="You've built an incredible portfolio! To secure your unique URL and push this site live, you'll need to create a free Seeqme account."
        confirmText="Connect Account"
        cancelText="Maybe Later"
        variant="info"
      />
    </div>
  );
};

export default React.memo(PortfolioBuilder);