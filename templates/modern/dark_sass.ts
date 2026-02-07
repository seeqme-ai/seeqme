import { Manifest } from "@/types";

export const DARK_SASS: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Tech Virtual Assistant',
        generatedAt: new Date().toISOString(),
    },
    globalConfig: {
        theme: 'dark',
        colorPalette: {
            primary: '#8b5cf6', // Violet
            secondary: '#1e1b4b', // Indigo 950
            background: '#0f172a', // Slate 900
            surface: '#1e293b', // Slate 800
            text: '#e2e8f0', // Slate 200
            heading: '#f8fafc', // Slate 50
        },
        typography: {
            headingFont: 'Inter',
            bodyFont: 'Inter',
            monoFont: 'JetBrains Mono',
        },
    },
    sections: [
        {
            id: 'header',
            type: 'header',
            componentId: 'HEADER_DARK_SASS',
            content: {
                username: 'SYSTEMS_ONLINE',
                navLinks: [
                    { label: 'Services', link: '#services' },
                    { label: 'Stack', link: '#stack' },
                    { label: 'Projects', link: '#projects' },
                    { label: 'Contact', link: '#contact' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'hero',
            type: 'hero',
            componentId: 'HERO_DARK_SASS',
            content: {
                name: 'I build the systems that run your business.',
                statusTag: 'Now accepting new system audits',
                heroTagline: 'Stop doing manual data entry. As a Tech VA & Automation Specialist, I connect your tools so you can sleep while your business scales.',
                cta: { text: 'Explore Automations', link: '#services' }
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'stack',
            type: 'skills',
            componentId: 'SKILLS_DARK_SASS',
            content: {
                title: 'Certified Expert In',
                tools: [
                    { name: 'Zapier', icon: '⚡' },
                    { name: 'Make.com', icon: '🟣' },
                    { name: 'Airtable', icon: '📊' },
                    { name: 'Notion', icon: '📝' },
                    { name: 'ClickUp', icon: '✅' },
                    { name: 'ActiveCampaign', icon: '📧' },
                    { name: 'Stripe', icon: '💳' },
                    { name: 'Shopify', icon: '🛍️' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'services',
            type: 'services',
            componentId: 'SERVICES_DARK_SASS',
            content: {
                title: 'Operations as a Service',
                label: 'I replace your chaotic spreadsheets with automated workflows.',
                services: [
                    { title: 'Tech Stack Audit', desc: 'I map out your current tools, find redundancies, and recommend a streamlined stack to save you money.', icon: '🔍', price: 'One-time: $497' },
                    { title: 'Workflow Automation', desc: 'Custom Zaps and Make scenarios to automate onboarding, invoicing, and lead follow-up.', icon: '⚙️', price: 'Project based' },
                    { title: 'System Maintenance', desc: 'Monthly retainer to ensure your automations keep running and your data stays clean.', icon: '🛠️', price: 'Starting at $1k/mo' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'projects',
            type: 'projects',
            componentId: 'PROJ_DARK_SASS',
            content: {
                title: 'Recent Builds',
                projects: [
                    { title: 'Client Onboarding System', tech: 'Automation', desc: 'Reduced onboarding time from 3 days to 5 minutes. Automatically sends contracts, generates invoices in Xero, and creates ClickUp tasks.' },
                    { title: 'CRM Two-Way Sync', tech: 'Integration', desc: 'Built a custom sync between HubSpot and a proprietary SQL database using Make.com webhooks.' }
                ]
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'contact',
            type: 'contact',
            componentId: 'CONTACT_DARK_SASS',
            content: {
                title: 'Stop drowning in admin.',
                description: 'Book a free 20-minute audit call. I\'ll tell you exactly what can be automated.',
                email: 'tech@va.com',
                label: 'Contact'
            },
            settings: { isVisible: true, padding: 'none' }
        },
        {
            id: 'footer',
            type: 'footer',
            componentId: 'FOOTER_DARK_SASS',
            content: {
                footerHeading: 'SYSTEMS_ONLINE',
                footerEmail: 'tech@va.com',
                copyright: '© 2025 SYSTEMS_ONLINE. ALL RIGHTS RESERVED.'
            },
            settings: { isVisible: true, padding: 'none' }
        }
    ]
};
