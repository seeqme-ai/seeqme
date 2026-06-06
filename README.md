# SeeqMe: Professional identity network

SeeqMe is a **professional identity network** that turns your CV, LinkedIn, or a simple prompt into a live, Google-indexed portfolio — deployed instantly with a shareable link. Every portfolio is a node in a discovery mesh: HR teams, recruiters, and collaborators find you based on your actual skills and work, not who you know. You don't chase opportunities. You get found.

Built on a manifest-driven architecture with native Hedera blockchain payments via the x402 protocol.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    SEEQME PLATFORM                   │
├─────────────────┬───────────────────┬────────────────┤
│   CV PIPELINE   │   MESH ENGINE     │  SOCIAL LAYER  │
│                 │                   │                │
│ Upload CV       │ Embedding Store   │ Posts          │
│ Parse & Extract │ Similarity Graph  │ Reactions      │
│ Generate Site   │ Cluster Detection │ Connections    │
│ Publish         │ Feed Ranking      │ Notifications  │
└─────────────────┴───────────────────┴────────────────┘
         │                  │                  │
         └──────────────────┴──────────────────┘
                            │
                    Mongodb 
                    Redis (cache + realtime)
                    cloudinary (assets)
```

---


### Core Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion + TanStack Query
- **Backend**: Go (Gin Gonic) — high-concurrency API, WebSocket streaming, AI orchestration
- **Database**: MongoDB — flexible site manifests, user/deployment tracking, payment records
- **Infrastructure**: GitHub (repo-per-site), Cloudflare Pages (edge hosting + DNS), Cloudinary (media)
- **AI**: Gemini / OpenAI — manifest generation, CV parsing, design synthesis

### The AI Transformation Engine
The system uses a **Manifest-Driven Architecture (Manifest V1.0)**. Instead of raw HTML, the AI generates a structured JSON manifest defining the site's components, typography, and color palette. The frontend `renderer.ts` dynamically assembles this into a premium Tailwind-based site.

1. **Analysis** — AI interprets CV/LinkedIn documents or free-form prompts
2. **Synthesis** — Generates a JSON Manifest with sections, blocks, and design tokens
3. **Rendering** — `renderer.ts` assembles the manifest into a live, editable portfolio

---

## Hedera x402 Pay-to-Deploy Integration

SeeqMe integrates the [x402 payment protocol](https://x402.org) on **Hedera mainnet** to gate portfolio deployments behind a micropayment. Users pay in HBAR; the amount is computed live from the CoinGecko HBAR/NGN exchange rate to match the plan's naira price exactly.

### How it works

```
User clicks Deploy
       │
       ▼
Frontend fetches GET /hedera/config?plan=pro
  ← { amountHbar: 18.42, amountNgn: 2000, hbarNgnRate: 108.61, ... }
       │
       ▼
User pays via HashConnect (native HBAR) or MetaMask (Hedera EVM)
  → Transaction signed on Hedera mainnet
       │
       ▼
Frontend calls POST /hedera/verify-payment { encodedPayment, planId }
       │
       ▼
Backend verifies via blocky402.com facilitator
  + cross-checks on Hedera Mirror Node (mainnet)
  + checks ±30% tolerance for rate fluctuation
  + stores payment record in MongoDB (replay prevention)
       │
       ▼
Backend triggers GitHub push → Cloudflare Pages deploy → DNS
  + WebSocket streams deployment logs to user
       │
       ▼
Portfolio live at username.seeqme.com
```

### Dynamic HBAR Pricing

HBAR amounts are never hardcoded. At every `/hedera/config` request:

| Plan | NGN Price | HBAR (example @ ₦109/HBAR) |
|------|-----------|----------------------------|
| Pro | ₦2,000 | ~18.42 HBAR |
| Premium | ₦5,000 | ~45.87 HBAR |

- Rate source: CoinGecko (`/simple/price?ids=hedera-hashgraph&vs_currencies=ngn`) with 5-minute cache
- Fallback rate: ₦150/HBAR if CoinGecko is unreachable
- Verification tolerance: ±30% to handle rate drift between display and payment

### Hedera Agent (MCP Server)

A separate [seeqme-hedera-agent](https://github.com/seeqme-io/seeqme-hedera-agent) microservice exposes the payment and deployment flow as an [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server over SSE — making the entire pay-to-deploy pipeline accessible to AI agents.

Built with `@hashgraph/hedera-agent-kit` v4.0.0.

**MCP tools exposed:**
- `get_payment_requirements` — returns live HBAR amount + x402 payment destination
- `deploy_portfolio` — verifies payment and triggers deployment
- `check_recipient_balance` — queries recipient HBAR balance on mainnet

**Endpoints:**
```
GET  /health    — liveness check
GET  /sse       — MCP SSE stream (AI agent connect point)
POST /message   — MCP message endpoint
POST /deploy    — x402 HTTP 402 pay-to-deploy endpoint
```

### Environment Variables

**Backend (`seeqme/backend/.env`):**
```env
HEDERA_NETWORK=mainnet
HEDERA_PAYMENT_ACCOUNT_ID=0.0.XXXXX
HEDERA_PAYMENT_EVM_ADDRESS=0x...
AGENT_SECRET=<shared secret with hedera-agent>
```

**Frontend (`seeqme/.env`):**
```env
VITE_HEDERA_NETWORK=mainnet
VITE_WALLETCONNECT_PROJECT_ID=<from cloud.walletconnect.com>
```

HBAR amounts, account IDs, and EVM addresses are fetched from the backend at runtime — no payment values are hardcoded in the frontend.

---

## Production Capabilities

### Automated Deployment Engine
- **GitHub Bridge** — creates a unique repo per portfolio
- **Cloudflare Pages** — provisions edge hosting and DNS automatically
- **Custom Domains** — `*.seeqme.com` subdomains and full white-label custom domain mapping
- **WebSocket Logs** — real-time deployment progress streamed to the user

### Identity & Security
- **Persistent Device IDs** — guest visitors tracked via high-entropy tokens in `localStorage`
- **Unified Identity Middleware** — Account > Device > IP hierarchy; work is never lost during signup
- **Secure Handoff** — anonymous work claimed and transferred to full accounts on signup

### Real-Time Observability
- **WebSocket Manager** — unified raw WebSocket architecture for low-latency log streaming
- **Live AI Feedback** — real-time progress during AI synthesis and deployment sequences

---

## Recent Updates

| Update | Impact |
|--------|--------|
| **Hedera x402 Integration** | Pay-to-deploy on Hedera mainnet; dynamic HBAR pricing from live exchange rate |
| **MCP Agent** | Portfolio deployment exposed as AI-callable tools via Model Context Protocol |
| **WS Unification** | Eliminated SocketIO conflicts; scalable raw WebSocket manager |
| **Manifest V1** | Component-level editing and AI remixing without losing site integrity |
| **Identity Handoff** | Guest building first, claim work on signup — reduced funnel friction |
| **Premium Registry** | Cyber, Minimalist, and Executive design aesthetics |

---

*SeeqMe — GET SEEN | GET HIRED.*
