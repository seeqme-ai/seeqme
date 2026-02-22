import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ICONS } from '@/constants';
import { PortfolioData, LogEntry, BuildStatus, LayoutType } from '@/types';
import { generatePortfolio, refinePortfolio, redesignLayout, transformPlaceholdersToStructuredContent } from '@/services/portfolioAIService';
import { generateTemplateHTML } from '@/templates';
import { usePublicTemplates } from '@/hooks/usePublicTemplates';
import { useTemplate } from '@/context/template-context';
import { useAuth } from '@/context/auth-context';
import { portfolioService, deploymentService, domainService, sessionService, subscriptionService } from '@/services/apiService';
import Terminal from './Terminal';
import SectionEditor from '@/components/SectionEditor';
import SuccessDrawer from '@/components/SuccessDrawer';
import BuilderViewport from '@/components/builder/BuilderViewport';
import BuilderHeader from '@/components/builder/BuilderHeader';
import BuilderSidebar from '@/components/builder/BuilderSidebar';
import DeploymentModal from '@/components/builder/DeploymentModal';
import Joyride, { Step } from 'react-joyride';
import TemplateSelectorDrawer from '@/components/TemplateSelectorDrawer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import PaymentRequiredModal from '@/components/PaymentRequiredModal';
import { socketService } from '@/services/socketService';
import { renderManifest } from '@/utils/renderer';
import { RegistryMetadata } from '@/registry/metadata';
import FloatingPromptInput from '@/components/FloatingPromptInput';

const TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="template-drawer-btn"]',
    content: 'Open this to browse different templates or inject specific premium blocks (Skills, Projects, etc.) into your current portfolio.',
    disableBeacon: true,
    placement: 'right',
  },
  {
    target: '[data-tour="edit-section"]',
    content: 'Click here to customize every detail. You can edit text, swap images, and change individual section settings in real-time.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="floating-input"]',
    content: 'This is your AI command center. Ask it to "Redesign the hero" or "rewrite the bio to be more professional". Use "Build" mode to start a fresh portfolio from a prompt.',
    placement: 'top',
  },
  {
    target: '[data-tour="terminal-toggle"]',
    content: 'Watch the AI thinking process live in the console, or switch to the "Source" tab to view and (if on Pro) edit the raw HTML/CSS/JS.',
    placement: 'top',
  },
  {
    target: '[data-tour="remix-button"]',
    content: 'Not feeling the current look? Click Remix to let AI completely architecture a new visual design while keeping all your content.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="deploy-button"]',
    content: 'When you are ready, launch your site to a live URL. Your portfolio is built for speed and SEO.',
    placement: 'bottom',
  },
];

const PortfolioBuilder: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { initialData } = (location.state || {}) as { initialData?: { type: string; value: string; templateId?: string } };
  const portfolioIdFromState = initialData?.type === 'edit' ? initialData.value : undefined;
  const templateIdFromState = initialData?.type === 'template' ? (initialData.templateId || initialData.value) : undefined;
  const portfolioIdFromQuery = new URLSearchParams(location.search).get('id') || undefined;
  const { selectedTemplateId, setSelectedTemplateId, synthesisInput, setSynthesisInput } = useTemplate();
  const { templates: publicTemplates } = usePublicTemplates();
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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Check if user has seen tour
    const hasSeenTour = localStorage.getItem('seeqme_tour_seen');
    if (!hasSeenTour) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => setRunTour(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourComplete = (data: any) => {
    const { status } = data;
    if (['finished', 'skipped'].includes(status)) {
      localStorage.setItem('seeqme_tour_seen', 'true');
      setRunTour(false);
    }
  };

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
    const stableId = user?.id;

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
        setIsDeployModalOpen(false); // Close modal on success

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
      if (status !== 'idle') return

      try {
        const activeSession = await sessionService.getActiveSession();
        if (activeSession && activeSession.status === 'active') {
          addLog('Active session detected. Resuming build workflow...', 'info');

          // Reconstruct logs from session
          if (activeSession.logs && activeSession.logs.length > 0) {
            const recoveredLogs: LogEntry[] = activeSession.logs.map((l: string) => {
              // logs are in format "[HH:MM:SS] Message"
              const split = l.match(/\[(.*?)\] (.*)/);
              return {
                timestamp: split ? split[1] : new Date().toLocaleTimeString(),
                message: split ? split[2] : l,
                type: l.toLowerCase().includes('error') ? 'error' : (l.toLowerCase().includes('success') ? 'success' : 'info')
              };
            });
            setLogs(recoveredLogs);
          }

          // Hydrate portfolio data from session
          if (activeSession.portfolioId) {
            const fetchedPortfolio = await portfolioService.getPortfolio(activeSession.portfolioId);
            const sc = fetchedPortfolio.structuredContent || transformPlaceholdersToStructuredContent(fetchedPortfolio.placeholders || []);
            setData({
              ...fetchedPortfolio,
              structuredContent: sc,
              placeholders: fetchedPortfolio.placeholders || []
            });
          }

          // Subscribe to the recovered session room for future logs
          socketService.subscribeToSession(activeSession.id);

          if (activeSession.status === 'completed' || activeSession.status === 'failed') {
            setStatus('ready');
            return;
          }

          setStatus('deploying'); // Shift to active state
          setIsTerminalCollapsed(false); // Show the progress
          return;
        }
      } catch (err) {
        // No active session or fetch failed, proceed with normal init
        console.log("No active session to resume.");
      }

      // Check for autoDeploy flag from /plans successful payment redirect
      const queryParams = new URLSearchParams(window.location.search);
      const autoDeploy = queryParams.get('autoDeploy') === 'true';

      if (autoDeploy) {
        // Prevent infinite loop by clearing it from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);

        try {
          const sub = await subscriptionService.getSubscription();
          if (sub && sub.status === 'active' && sub.planId !== 'free') {
            toast.success("Payment verified! Ready to deploy.");
            // Wait for data hydration before opening modal
            setTimeout(() => {
              setIsDeployModalOpen(true);
            }, 1000);
          }
        } catch (e) { }
      }

      // Check for portfolioId in URL (for editing existing published portfolios)
      const resolvedPortfolioId = portfolioIdFromState || portfolioIdFromQuery;
      if (resolvedPortfolioId && !data) {
        try {
          setStatus('analyzing');
          addLog(`Loading portfolio ${resolvedPortfolioId} from backend...`, 'info');
          const fetchedPortfolio = await portfolioService.getPortfolio(resolvedPortfolioId);
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
          const errorMessage = error?.response?.data?.error || error?.message || 'Failed to load portfolio.';
          toast.error(errorMessage);
          addLog(`Failed to load portfolio: ${errorMessage}`, 'error');
          setStatus('idle');
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          return;
        }
      }

      const overrideTemplateId = sessionStorage.getItem('seeqme_template_override');
      const explicitTemplateId = templateIdFromState || overrideTemplateId || undefined;

      // Explicit template ID from navigation should take priority over drafts
      if (explicitTemplateId) {
        if (publicTemplates.length > 0) {
          const template = publicTemplates.find(t => t.id === explicitTemplateId);
          if (template) {
            setSelectedTemplateId(template.id);
            if (overrideTemplateId === template.id) {
              sessionStorage.removeItem('seeqme_template_override');
            }
            loadTemplate(template.id);
            return;
          }
        }
        // Wait for templates to load instead of falling back to draft
        return;
      }

      // Check for explicit template selection or synthesis from Context
      if (synthesisInput) {
        const fileData = (window as any)._pendingFile;
        handleBuild(synthesisInput, fileData ? [fileData] : undefined);
        delete (window as any)._pendingFile;
        return;
      }

      if (selectedTemplateId) {
        const template = publicTemplates.find(t => t.id === selectedTemplateId);
        if (template) {
          // Priority Check: Is there a draft, and does it match this template?
          // BUT: If the user explicitly came from landing page with a fresh template selection, we should probably favor that.
          // For now, only load draft if it's NOT an explicit landing page redirect (where initialData exists)
          const isExplicitSelection = initialData?.type === 'template';

          const savedDraft = localStorage.getItem('seeqme_portfolio_draft');
          if (savedDraft && !isExplicitSelection) {
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

      // Fallback: Check for any existing draft (e.g. returning to builder via direct URL or Edit)
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
              setIsDirty(false); // Initial load is not a new change
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
  }, [selectedTemplateId, synthesisInput, portfolioIdFromState, templateIdFromState, publicTemplates.length, navigate, location.pathname, status]);

  // Consolidate local storage, iframe, and backend sync
  useEffect(() => {
    if (data && isDirty) {
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
    const template = publicTemplates.find(t => t.id === id);
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
    setIsDirty(false); // Loading a fresh template is not an "edit" yet
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
    addLog(`Creating your portfolio...`, 'info');

    const progressSteps = [
      { p: 15, m: "Initializing  core...", t: 1000 },
      { p: 30, m: "Analyzing your professional profile...", t: 2500 },
      { p: 45, m: "Synthesizing career narrative...", t: 4000 },
      { p: 60, m: "Architecting visual structure...", t: 6000 },
      { p: 75, m: "Optimizing layout and assets...", t: 8000 },
      { p: 90, m: "Finalizing your portfolio...", t: 10000 }
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
      const template = publicTemplates.find(t => t.id === selectedTemplateId);

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
      setIsDirty(true); // AI build is a major change
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
      setIsDirty(true);
      addLog('Design updated successfully.', 'success');
    } catch (error: any) {
      timeouts.forEach(clearTimeout);
      setProgress(0);
      addLog(`ERR_REDESIGN: ${error.message}`, 'error');
      setStatus('ready');

      // Fallback to local remix if AI fails
      addLog(`LOCAL_REMIX_FB...`, 'info')

      const currentIdx = layouts.indexOf(currentLayout);
      const nextIdx = (currentIdx + 1) % layouts.length;
      const newLayout = layouts[nextIdx];
      setCurrentLayout(newLayout);
      const template = publicTemplates.find(t => t.id === selectedTemplateId);
      // Fallback: Generate valid HTML using the local engine if AI fails
      addLog(`LOCAL_GEN_FB...`, 'info')
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
      setIsDirty(true);
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

    try {
      const sub = await subscriptionService.getSubscription();
      if (!sub || sub.planId === 'free' || sub.status !== 'active') {
        setIsPaymentModalOpen(true);
        return;
      }
    } catch (e) {
      setIsPaymentModalOpen(true);
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
    setIsDirty(true);
  };

  const handleInjectBlock = (componentId: string) => {
    if (!data) return;

    const metadata = RegistryMetadata[componentId];
    if (!metadata) return;

    // Create sensible default content based on component type
    let defaultContent: any = {};

    switch (metadata.category) {
      case 'header':
        defaultContent = {
          name: 'Your Brand',
          navLinks: [
            { label: 'About', link: '#about' },
            { label: 'Projects', link: '#projects' },
            { label: 'Contact', link: '#contact' }
          ],
          cta: { text: 'Contact', link: '#contact' }
        };
        break;
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
      case 'services':
        defaultContent = {
          title: 'Services',
          description: 'Clear, outcome-focused offerings that map to real business goals.',
          items: [
            { title: 'Strategy', description: 'Positioning, messaging, and growth planning.', icon: '*' },
            { title: 'Design', description: 'Brand systems and high-converting UI.', icon: '*' },
            { title: 'Development', description: 'Fast, modern, and scalable builds.', icon: '*' }
          ],
          services: [
            { title: 'Consulting', desc: 'On-demand advisory for critical decisions.', icon: '*' },
            { title: 'Implementation', desc: 'Hands-on execution from start to finish.', icon: '*' },
            { title: 'Optimization', desc: 'Improve performance and conversion.', icon: '*' }
          ]
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
      case 'stats':
        defaultContent = {
          title: 'Impact Metrics',
          stats: [
            { label: 'Projects', value: '48+' },
            { label: 'Clients', value: '22' },
            { label: 'Years', value: '6' },
            { label: 'Awards', value: '9' }
          ],
          milestones: [
            { year: '2021', metric: '250K', description: 'Reached first major milestone' },
            { year: '2023', metric: '750K', description: 'Scaled to new markets' },
            { year: '2025', metric: '1M+', description: 'Sustained growth and impact' }
          ],
          before: [
            { metric: 'Load Time', value: '3.8s' },
            { metric: 'Conversion', value: '2.4%' },
            { metric: 'Users', value: '12K/mo' }
          ],
          after: [
            { metric: 'Load Time', value: '0.9s' },
            { metric: 'Conversion', value: '7.9%' },
            { metric: 'Users', value: '55K/mo' }
          ],
          skills: [
            { name: 'Frontend', percentage: 92 },
            { name: 'Backend', percentage: 86 },
            { name: 'Design', percentage: 88 }
          ]
        };
        break;
      case 'pricing':
        defaultContent = {
          title: 'Pricing',
          plans: [
            { name: 'Starter', price: '$499', features: ['Discovery', '1 Concept', 'Delivery'] },
            { name: 'Growth', price: '$1,499', features: ['Strategy', '3 Concepts', 'Revisions'] },
            { name: 'Scale', price: 'Custom', features: ['Full Stack', 'Ongoing Support', 'Priority'] }
          ]
        };
        break;
      case 'faq':
        defaultContent = {
          title: 'FAQ',
          items: [
            { question: 'How long does a project take?', answer: 'Most engagements run 2-6 weeks depending on scope.' },
            { question: 'Do you offer ongoing support?', answer: 'Yes. Retainers and optimization plans are available.' }
          ]
        };
        break;
      case 'logos':
        defaultContent = {
          title: 'Trusted By',
          logos: [
            { name: 'Client One', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200' },
            { name: 'Client Two', url: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=200' },
            { name: 'Client Three', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200' }
          ],
          partners: [
            { name: 'Client One', icon: 'fab fa-github' },
            { name: 'Client Two', icon: 'fab fa-figma' },
            { name: 'Client Three', icon: 'fab fa-slack' }
          ]
        };
        break;
      case 'process':
        defaultContent = {
          title: 'Process',
          steps: [
            { title: 'Discover', description: 'Align goals, define scope, and set success metrics.' },
            { title: 'Design', description: 'Create the system and validate with feedback.' },
            { title: 'Deliver', description: 'Launch, measure, and iterate.' }
          ]
        };
        break;
      case 'gallery':
        defaultContent = {
          title: 'Gallery',
          items: [
            { title: 'Project One', image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800' },
            { title: 'Project Two', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800' },
            { title: 'Project Three', image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800' }
          ]
        };
        break;
      case 'team':
        defaultContent = {
          title: 'Team',
          members: [
            { name: 'Alex Rivera', role: 'Founder', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
            { name: 'Jordan Lee', role: 'Design Lead', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
            { name: 'Sam Kim', role: 'Engineering', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }
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
      case 'cta':
        defaultContent = {
          title: 'Ready to work together?',
          description: 'Let us build something impactful. Tell me about your project.',
          buttonText: 'Start a Project',
          buttonLink: '#contact',
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'
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
    setIsDirty(true);
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-700 ${currentTheme === 'dark' ? 'bg-background text-foreground' : 'bg-background text-foreground'}`}>
      <BuilderHeader
        status={status}
        data={data}
        historyLength={history.length}
        onRemix={handleRemix}
        onUndo={handleUndo}
        onDeploy={handleDeploy}
        onOpenEditor={() => setIsEditorOpen(true)}
      />

      <div className="flex-1 mt-20 sm:mt-24 relative flex flex-col">
        <BuilderViewport
          status={status}
          data={data}
          progress={progress}
          refinementPrompt={refinementPrompt}
          isIframeLoading={isIframeLoading}
          iframeRef={iframeRef}
          onIframeLoad={() => setIsIframeLoading(false)}
        />
      </div>

      <BuilderSidebar
        isTemplateSelectorOpen={isTemplateSelectorOpen}
        onOpenTemplateSelector={() => setIsTemplateSelectorOpen(true)}
        onStartTour={() => setRunTour(true)}
      />

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

      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onConfirm={confirmDeploy}
        chosenSubdomain={chosenSubdomain}
        setChosenSubdomain={setChosenSubdomain}
        selectedDomainId={selectedDomainId}
        availableDomains={availableDomains}
      />
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

      <PaymentRequiredModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onProceed={() => {
          setIsPaymentModalOpen(false);
          navigate('/plans?redirect=/builder&autoDeploy=true');
        }}
      />
      <Joyride
        steps={TOUR_STEPS}
        run={runTour}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={(data) => {
          handleTourComplete(data);
          if (data.status === 'finished' || data.status === 'skipped') {
            localStorage.setItem('seeqme_onboarding_seen', 'true');
          }
        }}
        styles={{
          options: {
            primaryColor: '#14b8a6', // teal-500
            textColor: '#0f172a',    // slate-900
            zIndex: 100000,
          },
          buttonNext: {
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: '12px 24px',
            borderRadius: '50px',
          },
          buttonBack: {
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#64748b',
          },
          tooltipContainer: {
            textAlign: 'left',
            borderRadius: '24px',
            padding: '10px'
          },
          tooltipContent: {
            padding: '10px 0',
            fontSize: '14px',
            lineHeight: '1.6',
            fontWeight: 500,
            color: '#475569'
          },
          tooltipTitle: {
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#0f172a'
          }
        }}
      />
    </div>
  );
};

export default React.memo(PortfolioBuilder);
