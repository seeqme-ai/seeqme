# SeeqMe: High-End AI Portfolio Architecture

SeeqMe is an AI platform designed to transform professional DNA into stunning, high-converting portfolios. This document details the technical architecture, recent transformations, and production capabilities of the ecosystem.

## 🏗️ Technical Architecture

### Core Stack
- **Frontend**: React 18 + Vite + Tailwind CSS. Architected with Tanstack Query for robust state management and Framer Motion for premium animations.
- **Backend**: Go (Gin Gonic) high-concurrency API server. Optimized for long-running AI orchestration and real-time event streaming.
- **Persistent Data**: MongoDB (Distributed NoSQL) for flexible site manifests and user/deployment tracking.

### The AI Transformation Engine
The system uses a **Manifest-Driven Architecture (Manifest V1.0)**. Instead of raw HTML, the AI generates a structured state of the site's "DNA":
1. **Analysis**: AI interprets documents (CVs/LinkedIn) or prompts.
2. **Synthesis**: Generates a JSON Manifest defining components, typography, and color palettes.
3. **Rendering**: The frontend `renderer.ts` dynamically assembles these into a premium Tailwind-based site.

## 🚀 Production Capabilities

### 1. Automated Deployment Engine
Seamlessly bridges the gap between AI generation and live production web-hosting:
- **GitHub Bridge**: Automatically creates unique repositories for every site.
- **Cloudflare Integration**: Provisions Pages projects and manages edge-level DNS routing.
- **Custom Domains**: Support for `*.seeqme.com` subdomains and full white-label custom domain mapping.

### 2. Production-Grade Identity
- **Persistent Device IDs**: Guest visitors are tracked using high-entropy secure tokens in `localStorage`.
- **Unified Identity Middleware**: A backend hierarchy (Account > Device > IP) that ensures work is never lost during the user conversion funnel.
- **Secure Handoff**: Anonymous work is automatically 'claimed' and transferred to full user accounts upon signup/deployment.

### 3. Real-Time Observability
- **Custom WS Manager**: A unified WebSocket architecture for streaming low-latency logs.
- **"Thinking" Progress**: Real-time feedback during AI synthesis and deployment sequences, ensuring users are never left guessing.

## 🛠️ Recent Major Transformations

| Update | Impact |
|--------|--------|
| **WS Unification** | Eliminated SocketIO conflicts; established a robust, scalable raw WebSocket manager. |
| **Shift to Manifest V1** | Enabled component-level editing and AI "remixing" without losing site integrity. |
| **Identity Handoff** | Reduced friction in the signup funnel by allowing guest building first. |
| **Header Injection** | Standardized `X-Anonymous-ID` across the entire API client for reliable guest tracking. |
| **Premium Registry** | Expanded component options to include Cyber, Minimalist, and Executive aesthetics. |

## 🏁 Production Readiness Status

**Current Status**: **[READY FOR BETA]**

- **Security**: Robust CSRF/CORS and Identity layers implemented. *Note: Server-side payment verification (Stripe/Paystack) is the final requirement for hard launch.*
- **Scalability**: MongoDB and Go are configured for high concurrent traffic.
- **Maintainability**: Modularized AI Provider and Orchestrator services.

## 🚀 What's Possible?
- **Instant Personal Branding**: From a CV PDF to a live `.com` site in under 60 seconds.
- **Niche-Specific Design**: Engineering, Creative, Professional, and Medical aesthetics auto-selected by AI.
- **Global Deployment**: Automatic CDN distribution via Cloudflare's global edge network.

---
*SeeqMe - Professional Identity, Reimagined.*
