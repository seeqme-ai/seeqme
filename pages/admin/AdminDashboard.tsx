import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Users,
    Layout,
    MessageCircle,
    Search,
    Send,
    Zap,
    FileEdit,
    Plus,
    Loader,
    Settings
} from 'lucide-react';
import apiClient, { adminService } from '@/services/apiService';
import { db } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp, update, query, limitToLast, remove } from 'firebase/database';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import AdminLayout from '@/components/AdminLayout';
import AdminNotificationsTab from '@/pages/admin/sections/AdminNotificationsTab';
import AdminTemplatesTab from '@/pages/admin/sections/AdminTemplatesTab';
import AdminOverviewTab from '@/pages/admin/sections/AdminOverviewTab';
import AdminChatsTab from '@/pages/admin/sections/AdminChatsTab';
import AdminUsersTab from '@/pages/admin/sections/AdminUsersTab';
import AdminPortfoliosTab from '@/pages/admin/sections/AdminPortfoliosTab';
import AdminConfigTab from '@/pages/admin/sections/AdminConfigTab';
import { Registry } from '@/registry';
import { PORTFOLIO_TEMPLATES } from '@/templates';
import { renderManifest } from '@/utils/renderer';

const DEFAULT_PRICING_PLANS = [
    {
        id: 'pro',
        name: 'Professional',
        price: { usd: 3, ngn: 2000 },
        recommended: true,
        features: [
            '1 Portfolio Project',
            'Advanced Customization',
            'Priority Support',
            'Custom Domain Connection',
            'Unlimited AI Re-generations',
            'SEO Optimization Tools',
            'SeeqMe Branding'
        ],
        limits: { portfolios: 1, customDomain: true }
    },
    {
        id: 'premium',
        name: 'Premium',
        price: { usd: 5, ngn: 5000 },
        features: [
            '5 Portfolios',
            'White-label Solution',
            '24/7 Dedicated Support',
            'Multiple Custom Domains',
            'Advanced Analytics (Visitor Tracking)',
            'Priority Feature Access',
            'API Access'
        ],
        limits: { portfolios: 5, customDomain: true }
    }
];

const ADMIN_PAGE_KEYS = ['overview', 'chats', 'users', 'portfolios', 'notifications', 'templates', 'config'] as const;
type AdminPageKey = typeof ADMIN_PAGE_KEYS[number];

interface ChatSummary {
    userId: string;
    userName: string;
    lastMessage: string;
    lastTimestamp: number;
    unreadCount: number;
}

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
    isAdmin?: boolean;
}

type ConfirmAction = 'deploy' | 'create' | 'delete' | 'deleteChat' | 'deleteTemplate' | null;

interface PendingAction {
    type: ConfirmAction;
    id?: string;
}

const AdminDashboard: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'chats' | 'users' | 'portfolios' | 'config' | 'notifications' | 'templates'>('overview');
    const [users, setUsers] = useState<any[]>([]);
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
    const [targetUserId, setTargetUserId] = useState('');
    const [pendingAction, setPendingAction] = useState<PendingAction>({ type: null });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [mobileChatView, setMobileChatView] = useState<'list' | 'chat'>('list');
    const [stats, setStats] = useState<any>(null);
    const [systemConfig, setSystemConfig] = useState<any>({
        maintenanceMode: false,
        allowSignups: true,
        aiModel: 'gemini-2.5-flash',
        pricingPlans: DEFAULT_PRICING_PLANS
    });
    const [isConfigLoading, setIsConfigLoading] = useState(false);
    const [isConfigSaving, setIsConfigSaving] = useState(false);
    const [configSnapshot, setConfigSnapshot] = useState<string>('');

    const [notificationRecipientType, setNotificationRecipientType] = useState<'all' | 'selected' | 'custom'>('all');
    const [notificationSubject, setNotificationSubject] = useState('');
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationBody, setNotificationBody] = useState('');
    const [notificationCtaUrl, setNotificationCtaUrl] = useState('');
    const [notificationCtaLabel, setNotificationCtaLabel] = useState('');
    const [notificationFooterNote, setNotificationFooterNote] = useState('');
    const [notificationSelectedUsers, setNotificationSelectedUsers] = useState<string[]>([]);
    const [notificationCustomEmails, setNotificationCustomEmails] = useState('');
    const [notificationUserSearch, setNotificationUserSearch] = useState('');
    const [isNotificationSending, setIsNotificationSending] = useState(false);

    const [adminTemplates, setAdminTemplates] = useState<any[]>([]);
    const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
    const [templateId, setTemplateId] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [templateNiche, setTemplateNiche] = useState('');
    const [templatePreview, setTemplatePreview] = useState('');
    const [templateStructuredContent, setTemplateStructuredContent] = useState('');
    const [templateHtml, setTemplateHtml] = useState('');
    const [templateCss, setTemplateCss] = useState('');
    const [templateJs, setTemplateJs] = useState('');
    const [templateNotify, setTemplateNotify] = useState(false);
    const [templateNotifyTarget, setTemplateNotifyTarget] = useState<'all' | 'niche' | 'selected'>('all');
    const [templateSelectedUsers, setTemplateSelectedUsers] = useState<string[]>([]);
    const [templateHighlights, setTemplateHighlights] = useState('');
    const [templateCtaUrl, setTemplateCtaUrl] = useState('');
    const [templateCtaLabel, setTemplateCtaLabel] = useState('');
    const [templateFooterNote, setTemplateFooterNote] = useState('');
    const [isTemplateSaving, setIsTemplateSaving] = useState(false);
    const [templateUserSearch, setTemplateUserSearch] = useState('');
    const [templateValidationErrors, setTemplateValidationErrors] = useState<string[]>([]);
    const [editingTemplateDbId, setEditingTemplateDbId] = useState<string | null>(null);
    const [isSavingUserId, setIsSavingUserId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user: currentUser } = useAuth();
    const allowedAdminTabs = useMemo(() => {
        const configured = currentUser?.adminPageAccess;
        if (!Array.isArray(configured) || configured.length === 0) {
            return [...ADMIN_PAGE_KEYS] as AdminPageKey[];
        }
        return ADMIN_PAGE_KEYS.filter((key) => configured.includes(key));
    }, [currentUser?.adminPageAccess]);
    const nicheOptions = useMemo(() => {
        const base = PORTFOLIO_TEMPLATES.map((t) => t.niche).filter(Boolean);
        const admin = adminTemplates.map((t) => t.niche).filter(Boolean);
        return Array.from(new Set([...base, ...admin]));
    }, [adminTemplates]);

    useEffect(() => {
        fetchData();
        const summariesRef = ref(db, 'chat_summaries');
        const unsubscribe = onValue(summariesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const summaries = Object.values(data) as ChatSummary[];
                setChatSummaries(summaries.sort((a, b) => b.lastTimestamp - a.lastTimestamp));
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!selectedChat) return;
        const messagesRef = ref(db, `chats/${selectedChat}/messages`);
        const q = query(messagesRef, limitToLast(50));
        const unsubscribe = onValue(q, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messageList = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val,
                })) as Message[];
                setChatMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
            } else {
                setChatMessages([]);
            }
        });
        return () => unsubscribe();
    }, [selectedChat]);

    useEffect(() => {
        if (!selectedChat) return;
        const summaryRef = ref(db, `chat_summaries/${selectedChat}`);
        update(summaryRef, { unreadCount: 0 }).catch(() => null);
        setChatSummaries((prev) =>
            prev.map((summary) =>
                summary.userId === selectedChat ? { ...summary, unreadCount: 0 } : summary
            )
        );
    }, [selectedChat]);

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        const tab = path === 'admin' ? 'overview' : path;
        if (ADMIN_PAGE_KEYS.includes(tab as AdminPageKey)) {
            if (allowedAdminTabs.includes(tab as AdminPageKey)) {
                setActiveTab(tab as any);
            } else {
                const fallback = allowedAdminTabs[0] || 'overview';
                navigate(fallback === 'overview' ? '/admin' : `/admin/${fallback}`, { replace: true });
            }
        }
    }, [allowedAdminTabs, location.pathname, navigate]);

    useEffect(() => {
        if (activeTab !== 'config') return;
        const loadConfig = async () => {
            setIsConfigLoading(true);
            try {
                const config = await adminService.getSystemConfig();
                const normalized = {
                    ...config,
                    pricingPlans: config?.pricingPlans?.length ? config.pricingPlans : DEFAULT_PRICING_PLANS
                };
                setSystemConfig(normalized);
                setConfigSnapshot(JSON.stringify(normalized));
                if (!config?.pricingPlans || config.pricingPlans.length === 0) {
                    const saved = await adminService.updateSystemConfig(normalized);
                    setSystemConfig(saved);
                    setConfigSnapshot(JSON.stringify(saved));
                }
            } catch {
                toast.error('Failed to load system config');
            } finally {
                setIsConfigLoading(false);
            }
        };
        loadConfig();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'templates') return;
        const loadTemplates = async () => {
            setIsTemplatesLoading(true);
            try {
                const data = await adminService.getAdminTemplates();
                setAdminTemplates(data || []);
            } catch {
                toast.error('Failed to load templates');
            } finally {
                setIsTemplatesLoading(false);
            }
        };
        loadTemplates();
    }, [activeTab]);

    const handleTabChange = (tabId: string) => {
        const path = tabId === 'overview' ? '/admin' : `/admin/${tabId}`;
        navigate(path);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, portfoliosData, statsData] = await Promise.all([
                adminService.getUsers(),
                adminService.getAllPortfolios(),
                adminService.getStats()
            ]);
            setUsers(usersData);
            setPortfolios(portfoliosData);
            setStats(statsData);
        } catch (err) {
            toast.error('Failed to load administrative data');
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!replyMessage.trim() || !selectedChat || !currentUser) return;
        setIsSending(true);
        try {
            const chatRef = ref(db, `chats/${selectedChat}/messages`);
            await push(chatRef, {
                senderId: currentUser.id,
                senderName: 'Admin Support',
                text: replyMessage.trim(),
                timestamp: serverTimestamp(),
                isAdmin: true,
            });
            const summaryRef = ref(db, `chat_summaries/${selectedChat}`);
            await update(summaryRef, {
                lastMessage: `Admin: ${replyMessage.trim()}`,
                lastTimestamp: serverTimestamp(),
                unreadCount: 0,
            });
            setReplyMessage('');
        } catch (err) {
            toast.error('Failed to send reply');
        } finally {
            setIsSending(false);
        }
    };

    const openConfirm = (action: ConfirmAction, id?: string) => {
        setPendingAction({ type: action, id });
        setIsConfirmOpen(true);
    };

    const handleSelectChat = (id: string) => {
        setSelectedChat(id);
    };

    const handleUpdateUserPermissions = async (userId: string, roles: string[], adminPageAccess: string[]) => {
        setIsSavingUserId(userId);
        try {
            const updated = await adminService.updateUserPermissions(userId, { roles, adminPageAccess });
            setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
            toast.success('User role and page access updated.');
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Failed to update user permissions.');
        } finally {
            setIsSavingUserId(null);
        }
    };

    const validatePricingConfig = (config: any) => {
        const plans = config?.pricingPlans || [];
        if (!Array.isArray(plans) || plans.length === 0) {
            return 'Add at least one pricing plan.';
        }
        const ids = new Set<string>();
        for (const plan of plans) {
            const id = String(plan.id || '').trim();
            const name = String(plan.name || '').trim();
            if (!id) return 'Each plan needs a unique id.';
            if (ids.has(id)) return `Duplicate plan id: ${id}`;
            ids.add(id);
            if (!name) return `Plan ${id} must have a name.`;
            if (plan.price?.usd == null || plan.price?.usd < 0) return `Plan ${id} needs a valid USD price.`;
            if (plan.price?.ngn == null || plan.price?.ngn < 0) return `Plan ${id} needs a valid NGN price.`;
            if (!Array.isArray(plan.features) || plan.features.length === 0) return `Plan ${id} needs at least one feature.`;
            if (plan.limits?.portfolios == null || plan.limits?.portfolios < 0) return `Plan ${id} needs a valid portfolio limit.`;
            if (typeof plan.limits?.customDomain !== 'boolean') return `Plan ${id} must set customDomain.`;
        }
        return null;
    };

    const parseEmails = (value: string) => {
        return value
            .split(/[\n,;]+/g)
            .map((email) => email.trim())
            .filter((email) => email && email.includes('@'));
    };

    const validateTemplateManifest = (raw: any): string[] => {
        const errors: string[] = [];
        if (!raw || typeof raw !== 'object') {
            return ['Structured content must be a JSON object.'];
        }
        if (!raw.metadata || typeof raw.metadata !== 'object') {
            errors.push('Missing metadata object.');
        } else {
            if (!raw.metadata.version) errors.push('metadata.version is required.');
        }
        if (!raw.globalConfig || typeof raw.globalConfig !== 'object') {
            errors.push('Missing globalConfig object.');
        } else {
            if (!raw.globalConfig.theme) errors.push('globalConfig.theme is required.');
        }
        if (!Array.isArray(raw.sections) || raw.sections.length === 0) {
            errors.push('sections must be a non-empty array.');
        } else {
            raw.sections.forEach((section: any, idx: number) => {
                if (!section?.id) errors.push(`Section ${idx + 1} missing id.`);
                if (!section?.type) errors.push(`Section ${idx + 1} missing type.`);
                if (!section?.componentId) errors.push(`Section ${idx + 1} missing componentId.`);
                if (section?.content == null) errors.push(`Section ${idx + 1} missing content.`);
                if (section?.componentId && !section?.template) {
                    const exists = Boolean((Registry as any)[section.componentId]);
                    if (!exists) errors.push(`Section ${idx + 1} componentId "${section.componentId}" not found in registry (and no template provided).`);
                }
                if (section?.componentId === 'GEN_TEMPLATE' && !section?.template) {
                    errors.push(`Section ${idx + 1} uses GEN_TEMPLATE but has no template field.`);
                }
            });
        }
        return errors;
    };

    const handleSendAdminEmail = async () => {
        if (!notificationSubject.trim() || !notificationBody.trim()) {
            toast.error('Subject and message body are required.');
            return;
        }

        if (notificationRecipientType === 'selected' && notificationSelectedUsers.length === 0) {
            toast.error('Select at least one user.');
            return;
        }

        if (notificationRecipientType === 'custom' && parseEmails(notificationCustomEmails).length === 0) {
            toast.error('Add at least one valid email.');
            return;
        }

        const payload = {
            subject: notificationSubject.trim(),
            messageTitle: notificationTitle.trim() || 'Announcement',
            messageBody: notificationBody.trim(),
            ctaUrl: notificationCtaUrl.trim(),
            ctaLabel: notificationCtaLabel.trim() || 'Open SeeqMe',
            footerNote: notificationFooterNote.trim(),
            recipientType: notificationRecipientType,
            userIds: notificationRecipientType === 'selected' ? notificationSelectedUsers : [],
            emails: notificationRecipientType === 'custom' ? parseEmails(notificationCustomEmails) : []
        };

        setIsNotificationSending(true);
        try {
            await toast.promise(adminService.sendAdminEmail(payload), {
                loading: 'Sending email notification...',
                success: 'Email sent successfully.',
                error: 'Failed to send email.'
            });
            setNotificationSubject('');
            setNotificationTitle('');
            setNotificationBody('');
            setNotificationCtaUrl('');
            setNotificationCtaLabel('');
            setNotificationFooterNote('');
            setNotificationCustomEmails('');
            setNotificationSelectedUsers([]);
        } finally {
            setIsNotificationSending(false);
        }
    };

    const resetTemplateForm = () => {
        setTemplateId('');
        setTemplateName('');
        setTemplateNiche('');
        setTemplatePreview('');
        setTemplateStructuredContent('');
        setTemplateHtml('');
        setTemplateCss('');
        setTemplateJs('');
        setTemplateNotify(false);
        setTemplateNotifyTarget('all');
        setTemplateSelectedUsers([]);
        setTemplateHighlights('');
        setTemplateCtaUrl('');
        setTemplateCtaLabel('');
        setTemplateFooterNote('');
        setTemplateValidationErrors([]);
        setEditingTemplateDbId(null);
    };

    const handleCreateTemplate = async () => {
        if (!templateId.trim() || !templateName.trim() || !templateNiche.trim()) {
            toast.error('Template ID, name, and niche are required.');
            return;
        }
        let structuredContent: any = undefined;
        if (templateStructuredContent.trim()) {
            try {
                structuredContent = JSON.parse(templateStructuredContent);
            } catch {
                toast.error('Structured content must be valid JSON.');
                return;
            }
        }
        if (!structuredContent) {
            toast.error('Structured content is required.');
            return;
        }
        const manifestErrors = validateTemplateManifest(structuredContent);
        setTemplateValidationErrors(manifestErrors);
        if (manifestErrors.length > 0) {
            toast.error('Template JSON is missing required fields.');
            return;
        }

        if (templateNotify && templateNotifyTarget === 'selected' && templateSelectedUsers.length === 0) {
            toast.error('Select at least one user to notify.');
            return;
        }

        const normalizedHtml = templateHtml.trim() || renderManifest(structuredContent);
        const normalizedCss = templateCss || '';
        const normalizedJs = templateJs || '';

        const payload = {
            templateId: templateId.trim(),
            name: templateName.trim(),
            niche: templateNiche.trim(),
            preview: templatePreview.trim(),
            html: normalizedHtml,
            css: normalizedCss,
            js: normalizedJs,
            structuredContent,
            notify: templateNotify,
            notifyTarget: templateNotifyTarget,
            userIds: templateNotifyTarget === 'selected' ? templateSelectedUsers : [],
            highlights: templateHighlights.split('\n').map((item) => item.trim()).filter(Boolean),
            ctaUrl: templateCtaUrl.trim(),
            ctaLabel: templateCtaLabel.trim() || 'Preview Template',
            footerNote: templateFooterNote.trim()
        };

        setIsTemplateSaving(true);
        try {
            const response: any = await toast.promise(
                editingTemplateDbId
                    ? adminService.updateAdminTemplate(editingTemplateDbId, payload)
                    : adminService.createAdminTemplate(payload),
                {
                    loading: editingTemplateDbId ? 'Updating template...' : 'Saving template...',
                    success: editingTemplateDbId ? 'Template updated successfully.' : 'Template saved successfully.',
                    error: editingTemplateDbId ? 'Failed to update template.' : 'Failed to save template.'
                }
            );
            if (response?.notifyError) {
                toast.error(response.notifyError);
            }
            resetTemplateForm();
            if (activeTab === 'templates') {
                const data = await adminService.getAdminTemplates();
                setAdminTemplates(data || []);
            }
        } finally {
            setIsTemplateSaving(false);
        }
    };

    const handleEditTemplate = (tpl: any) => {
        setEditingTemplateDbId(tpl.id);
        setTemplateId(tpl.templateId || '');
        setTemplateName(tpl.name || '');
        setTemplateNiche(tpl.niche || '');
        setTemplatePreview(tpl.preview || '');
        setTemplateHtml(tpl.html || '');
        setTemplateCss(tpl.css || '');
        setTemplateJs(tpl.js || '');
        setTemplateStructuredContent(
            typeof tpl.structuredContent === 'string'
                ? tpl.structuredContent
                : JSON.stringify(tpl.structuredContent || {}, null, 2)
        );
        setTemplateNotify(false);
        setTemplateNotifyTarget('all');
        setTemplateSelectedUsers([]);
        setTemplateHighlights('');
        setTemplateCtaUrl('');
        setTemplateCtaLabel('');
        setTemplateFooterNote('');
        setTemplateUserSearch('');
        setTemplateValidationErrors([]);
    };

    const closeConfirm = () => {
        setIsConfirmOpen(false);
        setPendingAction({ type: null });
        setIsActionLoading(false);
    };

    const handleConfirm = async () => {
        setIsActionLoading(true);
        try {
            if (pendingAction.type === 'deploy' && pendingAction.id) {
                await toast.promise(adminService.deployOnBehalf(pendingAction.id), {
                    loading: 'Orchestrating deployment...',
                    success: 'Deployment live!',
                    error: 'Deployment failed.'
                });
                fetchData();
            } else if (pendingAction.type === 'create') {
                if (!targetUserId) { toast.error('Select a target user first.'); return; }
                const payload = { themeId: 'neo-brutalism', title: 'Admin Created Portfolio', targetUserId };
                await toast.promise(apiClient.post('/portfolios', payload), {
                    loading: 'Scaffolding portfolio...',
                    success: 'Portfolio created successfully!',
                    error: 'Failed to create portfolio.'
                });
                setIsCreatingPortfolio(false);
                setTargetUserId('');
                fetchData();
            } else if (pendingAction.type === 'delete' && pendingAction.id) {
                await toast.promise(adminService.deletePortfolio(pendingAction.id), {
                    loading: 'Deleting portfolio...',
                    success: 'Portfolio deleted.',
                    error: 'Deletion failed.'
                });
                fetchData();
            } else if (pendingAction.type === 'deleteChat' && pendingAction.id) {
                const chatId = pendingAction.id;
                await toast.promise(
                    Promise.all([
                        remove(ref(db, `chats/${chatId}`)),
                        remove(ref(db, `chat_summaries/${chatId}`))
                    ]),
                    {
                        loading: 'Deleting conversation...',
                        success: 'Conversation deleted.',
                        error: 'Failed to delete conversation.'
                    }
                );
                setChatMessages([]);
                setSelectedChat(null);
                setChatSummaries((prev) => prev.filter((summary) => summary.userId !== chatId));
            } else if (pendingAction.type === 'deleteTemplate' && pendingAction.id) {
                await toast.promise(adminService.deleteAdminTemplate(pendingAction.id), {
                    loading: 'Deleting template...',
                    success: 'Template deleted.',
                    error: 'Failed to delete template.'
                });
                setAdminTemplates((prev) => prev.filter((tpl) => tpl.id !== pendingAction.id));
                if (editingTemplateDbId === pendingAction.id) {
                    resetTemplateForm();
                }
            }
        } finally {
            closeConfirm();
        }
    };

    const getConfirmConfig = () => {
        switch (pendingAction.type) {
            case 'deploy':
                return {
                    title: 'Deploy Portfolio',
                    description: 'This will trigger a live deployment for this user\'s portfolio. Continue?',
                    confirmText: 'Deploy Now',
                    variant: 'info' as const,
                };
            case 'create':
                return {
                    title: 'Create Portfolio',
                    description: 'Create a new portfolio instance on behalf of the selected user?',
                    confirmText: 'Create Instance',
                    variant: 'info' as const,
                };
            case 'delete':
                return {
                    title: 'Delete Portfolio',
                    description: 'This action is permanent and cannot be undone. Are you sure?',
                    confirmText: 'Delete',
                    variant: 'danger' as const,
                    isDestructive: true,
                };
            case 'deleteChat':
                return {
                    title: 'Delete Conversation',
                    description: 'This will permanently delete all messages in this conversation. Continue?',
                    confirmText: 'Delete Chat',
                    variant: 'danger' as const,
                    isDestructive: true,
                };
            case 'deleteTemplate':
                return {
                    title: 'Delete Template',
                    description: 'This will permanently delete the template. Continue?',
                    confirmText: 'Delete Template',
                    variant: 'danger' as const,
                    isDestructive: true,
                };
            default:
                return { title: '', description: '', confirmText: 'Confirm', variant: 'info' as const };
        }
    };

    const filteredPortfolios = portfolios.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.domain?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const notificationUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(notificationUserSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(notificationUserSearch.toLowerCase())
    );


    const confirmConfig = getConfirmConfig();

    const tabs = [
        { id: 'overview', icon: Zap, label: 'Overview' },
        { id: 'chats', icon: MessageCircle, label: 'Chats' },
        { id: 'users', icon: Users, label: 'Users' },
        { id: 'portfolios', icon: Layout, label: 'Portfolios' },
        { id: 'notifications', icon: Send, label: 'Notifications' },
        { id: 'templates', icon: FileEdit, label: 'Templates' },
        { id: 'config', icon: Settings, label: 'System Config' },
    ];

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8">
                <div className="max-w-7xl mx-auto w-full px-2 flex-1 flex flex-col gap-5">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                Welcome, {currentUser?.fullName || "Admin"}
                            </h1>
                            <p className="text-slate-500 text-sm font-medium mt-0.5">Global oversight and user orchestration</p>
                        </div>

                        {activeTab === 'portfolios' && (
                            <button
                                onClick={() => setIsCreatingPortfolio(true)}
                                className="bg-teal-600 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-teal-500/10 hover:bg-teal-700 transition-colors flex items-center gap-2 self-start sm:self-auto"
                            >
                                <Plus className="w-4 h-4" /> Create for User
                            </button>
                        )}
                    </div>


                    {/* Search Bar */}
                    {(activeTab === 'users' || activeTab === 'portfolios') && (
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-medium focus:ring-0 focus:border-teal-500 transition-all shadow-sm"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-h-[400px]">
                        {loading && (
                            <div className="h-full flex items-center justify-center py-24">
                                <Loader className="text-teal-600 animate-spin" />
                            </div>
                        )}

                        {!loading && (
                            <AnimatePresence mode="wait">
                                {/* Overview */}
                                {activeTab === 'overview' && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <AdminOverviewTab stats={stats} users={users} portfolios={portfolios} />
                                    </motion.div>
                                )}

                                {/* Chats */}
                                {activeTab === 'chats' && (
                                    <motion.div
                                        key="chats"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <AdminChatsTab
                                            chatSummaries={chatSummaries}
                                            selectedChat={selectedChat}
                                            onSelectChat={handleSelectChat}
                                            chatMessages={chatMessages}
                                            replyMessage={replyMessage}
                                            onReplyMessageChange={setReplyMessage}
                                            onSendReply={handleSendReply}
                                            isSending={isSending}
                                            mobileChatView={mobileChatView}
                                            onMobileViewChange={setMobileChatView}
                                            messagesEndRef={messagesEndRef}
                                            onDeleteChat={() => {
                                                if (selectedChat) {
                                                    openConfirm('deleteChat', selectedChat);
                                                }
                                            }}
                                        />
                                    </motion.div>
                                )}

                                {/* Users */}
                                {activeTab === 'users' && (
                                    <motion.div
                                        key="users"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <AdminUsersTab
                                            users={filteredUsers}
                                            currentUserId={currentUser?.id}
                                            isSavingUserId={isSavingUserId}
                                            onSavePermissions={handleUpdateUserPermissions}
                                        />
                                    </motion.div>
                                )}

                                {/* Portfolios */}
                                {activeTab === 'portfolios' && (
                                    <motion.div
                                        key="portfolios"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <AdminPortfoliosTab
                                            portfolios={filteredPortfolios}
                                            users={users}
                                            onOpenConfirm={(type, id) => openConfirm(type, id)}
                                        />
                                    </motion.div>
                                )}

                                {/* Notifications */}
                                {activeTab === 'notifications' && (
                                    <AdminNotificationsTab
                                        recipientType={notificationRecipientType}
                                        onRecipientTypeChange={setNotificationRecipientType}
                                        subject={notificationSubject}
                                        onSubjectChange={setNotificationSubject}
                                        title={notificationTitle}
                                        onTitleChange={setNotificationTitle}
                                        body={notificationBody}
                                        onBodyChange={setNotificationBody}
                                        ctaUrl={notificationCtaUrl}
                                        onCtaUrlChange={setNotificationCtaUrl}
                                        ctaLabel={notificationCtaLabel}
                                        onCtaLabelChange={setNotificationCtaLabel}
                                        footerNote={notificationFooterNote}
                                        onFooterNoteChange={setNotificationFooterNote}
                                        selectedUsers={notificationSelectedUsers}
                                        onSelectedUsersChange={setNotificationSelectedUsers}
                                        customEmails={notificationCustomEmails}
                                        onCustomEmailsChange={setNotificationCustomEmails}
                                        userSearch={notificationUserSearch}
                                        onUserSearchChange={setNotificationUserSearch}
                                        users={notificationUsers}
                                        onSend={handleSendAdminEmail}
                                        isSending={isNotificationSending}
                                    />
                                )}

                                {/* Templates */}
                                {activeTab === 'templates' && (
                                    <AdminTemplatesTab
                                        templateId={templateId}
                                        templateName={templateName}
                                        templateNiche={templateNiche}
                                        templatePreview={templatePreview}
                                        templateStructuredContent={templateStructuredContent}
                                        templateHtml={templateHtml}
                                        templateCss={templateCss}
                                        templateJs={templateJs}
                                        templateNotify={templateNotify}
                                        templateNotifyTarget={templateNotifyTarget}
                                        templateSelectedUsers={templateSelectedUsers}
                                        templateHighlights={templateHighlights}
                                        templateCtaUrl={templateCtaUrl}
                                        templateCtaLabel={templateCtaLabel}
                                        templateFooterNote={templateFooterNote}
                                        templateUserSearch={templateUserSearch}
                                        templateValidationErrors={templateValidationErrors}
                                        editingTemplateDbId={editingTemplateDbId}
                                        nicheOptions={nicheOptions}
                                        isTemplateSaving={isTemplateSaving}
                                        isTemplatesLoading={isTemplatesLoading}
                                        adminTemplates={adminTemplates}
                                        users={users}
                                        onEditTemplate={handleEditTemplate}
                                        onCancelEdit={resetTemplateForm}
                                        onDeleteTemplate={(id) => openConfirm('deleteTemplate', id)}
                                        onTemplateIdChange={setTemplateId}
                                        onTemplateNameChange={setTemplateName}
                                        onTemplateNicheChange={setTemplateNiche}
                                        onTemplatePreviewChange={setTemplatePreview}
                                        onTemplateStructuredContentChange={(value) => {
                                            setTemplateStructuredContent(value);
                                            setTemplateValidationErrors([]);
                                        }}
                                        onTemplateHtmlChange={setTemplateHtml}
                                        onTemplateCssChange={setTemplateCss}
                                        onTemplateJsChange={setTemplateJs}
                                        onTemplateNotifyToggle={() => setTemplateNotify(!templateNotify)}
                                        onTemplateNotifyTargetChange={setTemplateNotifyTarget}
                                        onTemplateSelectedUsersChange={setTemplateSelectedUsers}
                                        onTemplateHighlightsChange={setTemplateHighlights}
                                        onTemplateCtaUrlChange={setTemplateCtaUrl}
                                        onTemplateCtaLabelChange={setTemplateCtaLabel}
                                        onTemplateFooterNoteChange={setTemplateFooterNote}
                                        onTemplateUserSearchChange={setTemplateUserSearch}
                                        onSave={handleCreateTemplate}
                                    />
                                )}

                                {/* System Config */}
                                {activeTab === 'config' && (
                                    <AdminConfigTab
                                        systemConfig={systemConfig}
                                        setSystemConfig={setSystemConfig}
                                        isConfigLoading={isConfigLoading}
                                        isConfigSaving={isConfigSaving}
                                        isDirty={configSnapshot !== JSON.stringify(systemConfig)}
                                        onSave={() => {
                                            if (!systemConfig) return;
                                            const error = validatePricingConfig(systemConfig);
                                            if (error) {
                                                toast.error(error);
                                                return;
                                            }
                                            setIsConfigSaving(true);
                                            adminService.updateSystemConfig(systemConfig)
                                                .then((updated) => {
                                                    setSystemConfig(updated);
                                                    setConfigSnapshot(JSON.stringify(updated));
                                                    toast.success('Configuration updated');
                                                })
                                                .catch(() => toast.error('Failed to update config'))
                                                .finally(() => setIsConfigSaving(false));
                                        }}
                                        defaultPlans={DEFAULT_PRICING_PLANS}
                                    />
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isCreatingPortfolio && (
                        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsCreatingPortfolio(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 40 }}
                                className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
                            >
                                <div className="p-5 sm:p-6 border-b border-slate-100">
                                    <h2 className="text-xl font-black text-slate-900">Create on Behalf</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Select a user to generate a portfolio instance for.</p>
                                </div>
                                <div className="p-5 sm:p-6 space-y-4">
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Target User</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium focus:border-teal-500 focus:ring-0"
                                        value={targetUserId}
                                        onChange={(e) => setTargetUserId(e.target.value)}
                                    >
                                        <option value="">Select a user...</option>
                                        {users.filter(u => u.isVerified).map(user => (
                                            <option key={user.id} value={user.id}>{user.fullName} ({user.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsCreatingPortfolio(false)}
                                        className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsCreatingPortfolio(false);
                                            openConfirm('create');
                                        }}
                                        disabled={!targetUserId}
                                        className="bg-teal-600 text-white font-bold px-7 py-2.5 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center gap-2 text-sm"
                                    >
                                        <Plus className="w-4 h-4" /> Create Instance
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <ConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={closeConfirm}
                    onConfirm={handleConfirm}
                    title={confirmConfig.title}
                    description={confirmConfig.description}
                    confirmText={confirmConfig.confirmText}
                    variant={confirmConfig.variant}
                    isDestructive={pendingAction.type === 'delete'}
                    isLoading={isActionLoading}
                />
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
