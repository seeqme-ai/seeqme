
## 1. Product Vision (Refined)

Seeqme is a **professional identity network** where your CV-generated website is your node in a living mesh. The mesh surfaces similarity, enables discovery, and grows through posts — all without manual networking. You don't search for people. You *attract* them.

---

## 2. System Architecture Overview

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
                    PostgreSQL + pgvector
                    Redis (cache + realtime)
                    S3 (assets)
```

---

## 3. Data Types & Formats

### 3.1 User & Profile

```typescript
type User = {
 
}

type Profile = {
  userId: string
  displayName: string
  headline: string              // "Product Designer · Lagos"
  avatarUrl: string             // S3 key
  location: {
    city: string
    country: string
    countryCode: string         // ISO 3166-1 alpha-2
    lat?: number
    lng?: number
  }
  websiteUrl: string            // published portfolio URL
  embedding: number[]           // 1536-dim vector (OpenAI ada-002)
  embeddingUpdatedAt: ISO8601
  meshPosition: {               // 2D coords in mesh space
    x: number                   // -1.0 to 1.0 (normalised UMAP)
    y: number
  }
  visibility: 'public' | 'mesh_only' | 'private'
  verified: boolean
}
```

### 3.2 CV Extraction

```typescript
type CVExtract = {
  id: string
  userId: string
  rawText: string               // extracted from PDF/DOCX
  parsedAt: ISO8601
  
  skills: Skill[]
  experience: Experience[]
  education: Education[]
  projects: Project[]
  certifications: Certification[]
  languages: Language[]
  
  inferredIndustries: string[]  // ["fintech", "product", "saas"]
  inferredSeniority: 
    'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive'
  inferredRoles: string[]       // ["product manager", "ux designer"]
  tone: {                       // from writing style analysis
    formal: number              // 0-1
    technical: number
    creative: number
  }
  
  embeddingInput: string        // concatenated text fed to embedder
}

type Skill = {
  name: string
  category: 'technical' | 'design' | 'business' | 'soft' | 'language'
  proficiency: 'familiar' | 'proficient' | 'expert'
  yearsEstimated?: number
}

type Experience = {
  company: string
  role: string
  startDate: string             // "2021-03"
  endDate: string | 'present'
  description: string
  highlights: string[]
  industryTags: string[]
}

type Project = {
  name: string
  description: string
  tech: string[]
  url?: string
  impact?: string
}
```

### 3.3 Portfolio Site

```typescript
type PortfolioSite = {
}

type SiteSection = {
  id: string
  type: 'hero' | 'about' | 'skills' | 'experience' 
      | 'projects' | 'education' | 'posts' | 'contact'
  order: number
  visible: boolean
  content: Record<string, any>  // section-specific payload
}

type ThemeConfig = {
  colorScheme: 'light' | 'dark' | 'auto'
  accentColor: string           // hex
  fontPair: string              // e.g. "inter-playfair"
  layout: 'minimal' | 'bold' | 'editorial' | 'terminal'
  borderRadius: 'sharp' | 'soft' | 'pill'
}
```

### 3.4 Mesh Node (the core graph unit)

```typescript
type MeshNode = {
  userId: string
  embedding: number[]           // 1536-dim, stored in pgvector
  meshX: number                 // UMAP-reduced 2D position
  meshY: number
  clusterIds: string[]          // which clusters this node belongs to
  nodeWeight: number            // 0-1, based on profile completeness
                                // + activity + connections
  category: MeshCategory
  hue: string                   // derived color for rendering
  lastRecomputed: ISO8601
}

type MeshCategory = 
  'engineering' | 'design' | 'product' | 'marketing' |
  'finance' | 'operations' | 'legal' | 'creative' | 'research'

type MeshEdge = {
  id: string
  nodeA: string                 // userId
  nodeB: string                 // userId
  similarity: number            // 0-1 cosine similarity
  sharedSkills: string[]
  sharedIndustries: string[]
  edgeType: 'skill' | 'industry' | 'location' | 'hybrid'
  strength: 'weak' | 'medium' | 'strong'  // <0.4, 0.4-0.7, >0.7
  createdAt: ISO8601
}

type MeshCluster = {
  id: string
  label: string                 // auto-generated: "Lagos Fintech Builders"
  centroidX: number
  centroidY: number
  memberIds: string[]
  dominantCategory: MeshCategory
  dominantSkills: string[]
  dominantIndustries: string[]
  memberCount: number
  heatScore: number             // 0-1, activity-driven
  updatedAt: ISO8601
}
```

### 3.5 Posts

```typescript
type Post = {
  id: string
  authorId: string
  type: 'text' | 'image' | 'link' | 'project_update' | 'milestone'
  content: {
    body: string                // markdown, max 2000 chars
    imageUrls?: string[]        // max 4, S3 keys
    linkPreview?: LinkPreview
    tags: string[]              // user-added + auto-extracted
  }
  embedding: number[]           // post-level vector for mesh placement
  meshImpact: {
    landingX: number            // where comet lands in mesh
    landingY: number
    pulseRadius: number         // how far it ripples
    attractedNodes: string[]    // userIds pulled toward this post
  }
  visibility: 'public' | 'mesh_only' | 'connections'
  status: 'draft' | 'published' | 'archived'
  publishedAt: ISO8601
  stats: {
    views: number
    reactions: Record<ReactionType, number>
    reposts: number
    meshResonance: number       // how many new edges this post created
  }
}

type ReactionType = 'resonates' | 'insightful' | 'inspired' | 'congrats'

type LinkPreview = {
  url: string
  title: string
  description: string
  imageUrl?: string
  domain: string
}
```

### 3.6 Connection & Notification

```typescript
type Connection = {
  id: string
  initiatorId: string
  receiverId: string
  status: 'pending' | 'accepted' | 'ignored'
  source: 'mesh' | 'post' | 'profile_visit' | 'cluster'
  createdAt: ISO8601
  acceptedAt?: ISO8601
}

type Notification = {
  id: string
  userId: string
  type: 
    | 'new_connection'
    | 'mesh_neighbour'          // someone similar just joined
    | 'post_reaction'
    | 'profile_view'
    | 'cluster_trending'
    | 'post_resonance'          // your post attracted new nodes
  payload: Record<string, any>
  read: boolean
  createdAt: ISO8601
}
```

---

## 4. Embedding & Similarity Pipeline

```
CV Text + Skills + Projects + Tone
         │
         ▼
  Concatenate into embeddingInput:
  "{headline}. {skills joined}. {experience summaries}.
   {project descriptions}. {industries}."
         │
         ▼
  OpenAI text-embedding-ada-002 → 1536-dim vector
         │
         ▼
  Store in pgvector (profiles table)
         │
         ▼
  Nightly UMAP job: project all embeddings → 2D mesh coords
         │
         ▼
  K-means clustering → MeshCluster records
         │
         ▼
  Cosine similarity pairs → MeshEdge records (threshold > 0.35)
```

**Similarity score formula:**
```
finalSimilarity = 
  (cosineSimilarity * 0.50) +
  (sharedSkillsScore * 0.20) +
  (sharedIndustryScore * 0.15) +
  (locationProximityScore * 0.10) +
  (seniorityAlignmentScore * 0.05)
```

---

## 5. UI Architecture

### 5.1 Page Map

```
seeqme.co/
├── / (landing)
├── /onboard (CV upload → site generation)
├── /[username] (public portfolio site)
├── /app/
│   ├── /mesh (main discovery view)
│   ├── /feed (highlight feed)
│   ├── /network (connections list)
│   ├── /post/new
│   ├── /notifications
│   └── /settings/
│       ├── /profile
│       ├── /site
│       └── /account
```

### 5.2 Mesh View — UI Spec

```
┌─────────────────────────────────────────────────────────────┐
│ TOPBAR                                                       │
│ [≡ Seeqme]  [Search people or skills...]  [🔔] [Avatar]    │
├──────────┬──────────────────────────────────────┬───────────┤
│ SIDEBAR  │         MESH CANVAS                  │  PANEL    │
│          │                                      │           │
│ You      │    ·  ·    ✦                        │ (empty    │
│ [node]   │       ·✦·      ·  ·                 │  until    │
│          │   ·      ✦━━━━✦      ·              │  node     │
│ Filters  │         ·   ✦   ·                   │  clicked) │
│ ─────    │            ·                         │           │
│ □ Eng    │                  ·  ·  ✦            │           │
│ □ Design │       ·  ✦━━━━━✦                    │           │
│ □ Product│                                      │           │
│ □ Finance│                                      │           │
│          │                                      │           │
│ Location │                                      │           │
│ [Lagos ▾]│                                      │           │
│          │                                      │           │
│ Seniority│                                      │           │
│ [All   ▾]│                                      │           │
├──────────┴──────────────────────────────────────┴───────────┤
│ CLUSTER BAR: [Lagos Fintech ✦12] [Design Leaders ✦8] ...   │
└─────────────────────────────────────────────────────────────┘
```

**When a node is clicked, right panel opens:**
```
┌─────────────────────┐
│ [Avatar 48px]       │
│ Ada Obi             │
│ Product Designer    │
│ Lagos, Nigeria      │
│                     │
│ ── Shared ──────── │
│ ✦ Figma, React     │
│ ✦ Fintech, SaaS    │
│                     │
│ Similarity  ████░  │
│             82%     │
│                     │
│ [View Site →]       │
│ [Connect    +]      │
└─────────────────────┘
```

### 5.3 Feed View — UI Spec

```
┌─────────────────────────────────────────────────┐
│  HIGHLIGHT FEED                  [For You] [Hot] │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ 🔥 TRENDING IN YOUR MESH                   │ │
│ │ "Lagos Fintech Builders" cluster is         │ │
│ │ growing — 3 new members this week           │ │
│ │ [Explore cluster →]                         │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ [Ava] Ada Obi · Product Designer            │ │
│ │ 2h · 🌐 mesh resonance: 12 nodes           │ │
│ │                                             │ │
│ │ Just shipped the v2 of our onboarding       │ │
│ │ flow. Reduced drop-off by 40%...            │ │
│ │                                             │ │
│ │ ✦ resonates 24  💡 insightful 8            │ │
│ │ [Comment] [Repost] [Connect +]              │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ ┌── NEW NEIGHBOUR ────────────────────────────┐ │
│ │ Tunde just joined · 94% match              │ │
│ │ "Full-stack Engineer · Fintech · Abuja"    │ │
│ │ [View profile] [Connect]                   │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 5.4 Responsive Breakpoints

```
Mobile  < 768px   → Stack layout. Mesh = simplified 2D 
                    dot-grid. Sidebar becomes bottom sheet.
                    Panel becomes full-screen drawer.

Tablet  768-1024px → Sidebar collapses to icon rail.
                     Mesh canvas full width.
                     Panel slides over canvas.

Desktop > 1024px  → Full 3-column layout as specced above.
                    Mesh canvas interactive, zoomable.

Large   > 1440px  → Mesh canvas expands. Panel widens.
                    Cluster labels visible at default zoom.
```

---

## 6. Animation Spec

### 6.1 Mesh Canvas Animations

| Event | Animation |
|---|---|
| New user joins | Comet fires from edge, arcs to mesh position, bursts on land |
| New post published | Comet from author node, lands near cluster, ripple pulse |
| Edge forms | Line draws from node A to B with traveling dot |
| Node hovered | Orb expands 1.2×, glow intensifies, edges highlight |
| Node clicked | Camera eases to center on node, panel slides in |
| Cluster trending | Cluster label pulses, halo ring animates |
| New connection | Gold arc draws between two nodes, signal fires both ways |
| Idle field | Nodes drift gently, edges pulse slowly at 0.3 opacity |

### 6.2 Feed Animations

```
Post card enter    → fade-up 300ms ease-out, stagger 60ms per card
New neighbour card → slide-in from right 280ms, border pulses once
Trending banner    → shimmer gradient left-to-right on load
Reaction tap       → icon scales 1.4× then back, count ticks up
Comet in feed      → miniature version of mesh comet, 120px wide
```

### 6.3 Transitions

```
Route change       → fade 200ms
Panel open/close   → slide + fade 260ms cubic-bezier(0.16,1,0.3,1)
Sidebar collapse   → width 240→64px, 220ms ease
Modal              → scale 0.96→1, fade, 200ms
Mesh zoom          → smooth d3-zoom, 400ms ease
```

---

## 7. Tech Stack

### Frontend
```
Framework     Next.js 14 (App Router)
Language      TypeScript
Styling       Tailwind CSS + CSS variables
Mesh Canvas   Three.js (WebGL) → PixiJS fallback for mobile
Animations    Framer Motion (UI) + custom RAF loop (mesh)
State         Zustand + React Query
Realtime      Supabase Realtime (WebSocket)
Charts        Recharts (analytics)
```

### Backend
```
API           Next.js API routes + tRPC
Database      PostgreSQL (Supabase) + pgvector extension
Cache         Redis (Upstash) — mesh graph, session, rate limits
Storage       Supabase Storage (S3-compatible)
Auth          Supabase Auth (email + Google + LinkedIn OAuth)
Queue         Inngest — CV processing, embedding jobs, nightly UMAP
AI/ML         OpenAI ada-002 (embeddings) + GPT-4o (CV parsing)
Search        pgvector ANN search (ivfflat index)
Email         Resend
```

### Infrastructure
```
Hosting       Vercel (frontend + API)
DB            Supabase (managed Postgres)
CDN           Vercel Edge Network
Monitoring    Sentry + Vercel Analytics
UMAP Job      Python script on Fly.io (nightly cron)
```

---

## 8. Mesh Recomputation Schedule

```
Realtime     → New node added: insert embedding, 
               compute nearest neighbours (top 20 via ANN),
               create edges if similarity > 0.35

Hourly       → Recompute heatScore for clusters
               Update nodeWeight based on activity

Nightly 2am  → Full UMAP projection (all nodes → 2D coords)
               K-means re-clustering
               Prune stale edges (no activity, sim dropped)
               Generate cluster labels via GPT-4o

Weekly       → Re-embed profiles that have been updated
               Recompute full similarity matrix
```

---

## 9. Post → Mesh Mechanic

```
User writes post
      │
      ▼
Extract embedding from post text
      │
      ▼
Find top 15 nearest profile nodes via ANN search
      │
      ▼
Compute meshImpact.landingX/Y
(weighted centroid of attracted nodes)
      │
      ▼
Store attractedNodes[] on post
      │
      ▼
Publish realtime event → mesh canvas
      │
      ▼
Canvas fires comet from author node
→ lands at landingX/Y
→ ripple pulse attracts nearby nodes visually
→ edges briefly highlight between author and attracted nodes
```

---

## 10. MVP Phased Rollout

**Phase 1 — Core **
CV upload → parse → generate site → publish. Basic profile. No mesh yet.

**Phase 2 — Mesh **
Embedding pipeline. Mesh canvas with nodes, edges, clusters. Read-only — explore similar people. Connect button.

**Phase 3 — Social **
Posts. Post-as-comet. Feed view. Reactions. Reposts.

**Phase 4 — Highlight Feed & Notifications**
Heat scoring. Trending clusters. New neighbour alerts. Mesh resonance stats.

**Phase 5 — Polish & Growth (ongoing)**
Custom domains. Analytics dashboard. Recruiter/investor view. Premium plan.

