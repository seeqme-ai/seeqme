import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { socialService } from '@/services/apiService';
import { toast } from 'sonner';
import {
  Network, Search, X, ArrowLeft,
  MapPin, ExternalLink, UserPlus, UserMinus,
  Users, Filter, Check, Clock, ChevronRight,
  AlertTriangle, Plus, ChevronDown, Mail,
} from 'lucide-react';

const MotionDiv = motion.div as any;
const MotionLine = motion.line as any;

/* ── Types ── */
interface MeshNode {
  id: string; userId?: string; x: number; y: number; r: number;
  color: string; label?: string; role?: string;
  location?: string; skills?: string[];
  similarity?: number; connections?: number;
  dim?: boolean; isYou?: boolean;
  isBackground?: boolean; isMock?: boolean;
}
interface MeshEdge {
  from: string; to: string; color: string; opacity: number; similarity?: number;
}

/* ─────────────────────────────────────────────────────────
   MOCK DATA — rich, professional, geographically diverse
   Shown as fallback when server has no real nodes.
   isMock is an internal flag only; nothing in the UI reveals it.
───────────────────────────────────────────────────────── */
const MOCK_NODES: MeshNode[] = [
  // ── You ──
  { id: 'you',    x: 800,  y: 500,  r: 16, color: '#14b8a6', label: 'You',        role: 'Full-Stack Engineer',  location: 'San Francisco',  skills: ['React','TypeScript','Node.js'], isYou: true },

  // ── Inner ring — high similarity (280–300 px from centre) ──
  { id: 'ada',    x: 570,  y: 330,  r: 11, color: '#8b5cf6', label: 'Ada O.',      role: 'Senior Product Designer',  location: 'Lagos',          skills: ['Figma','React','Design Systems'],  similarity: 0.91, connections: 47, isMock: true },
  { id: 'tunde',  x: 1040, y: 320,  r: 11, color: '#0ea5e9', label: 'Tunde K.',    role: 'Head of Product',           location: 'London',         skills: ['Roadmapping','SQL','OKRs'],         similarity: 0.87, connections: 83, isMock: true },
  { id: 'lena',   x: 1010, y: 660,  r: 10, color: '#14b8a6', label: 'Lena K.',     role: 'ML Engineer',               location: 'Berlin',         skills: ['PyTorch','Python','MLOps'],         similarity: 0.83, connections: 55, isMock: true },
  { id: 'james',  x: 595,  y: 675,  r: 10, color: '#f59e0b', label: 'James M.',    role: 'Founding Engineer',         location: 'New York',       skills: ['Go','Kubernetes','AWS'],            similarity: 0.80, connections: 38, isMock: true },

  // ── Middle ring — good match (330–420 px) ──
  { id: 'chioma', x: 440,  y: 490,  r: 9,  color: '#14b8a6', label: 'Chioma I.',   role: 'Frontend Developer',        location: 'Accra',          skills: ['Vue','TypeScript','TailwindCSS'],   similarity: 0.76, connections: 31, isMock: true },
  { id: 'yemi',   x: 1165, y: 480,  r: 10, color: '#8b5cf6', label: 'Yemi A.',     role: 'Startup Founder',           location: 'Lagos',          skills: ['Strategy','Fundraising','GTM'],    similarity: 0.72, connections: 119, isMock: true },
  { id: 'kemi',   x: 670,  y: 185,  r: 9,  color: '#0ea5e9', label: 'Kemi L.',     role: 'Data Scientist',            location: 'Toronto',        skills: ['Python','SQL','Tableau'],          similarity: 0.70, connections: 52, isMock: true },
  { id: 'emeka',  x: 820,  y: 835,  r: 9,  color: '#14b8a6', label: 'Emeka O.',    role: 'UX Researcher',             location: 'Amsterdam',      skills: ['Figma','Usability','Framer'],      similarity: 0.68, connections: 44, isMock: true },
  { id: 'aisha',  x: 365,  y: 650,  r: 8,  color: '#8b5cf6', label: 'Aisha M.',    role: 'Backend Engineer',          location: 'Nairobi',        skills: ['Go','PostgreSQL','Redis'],         similarity: 0.66, connections: 27, isMock: true },
  { id: 'ravi',   x: 1160, y: 715,  r: 9,  color: '#0ea5e9', label: 'Ravi S.',     role: 'DevOps Engineer',           location: 'Mumbai',         skills: ['Terraform','Docker','K8s'],        similarity: 0.69, connections: 61, isMock: true },
  { id: 'sofia',  x: 1235, y: 345,  r: 8,  color: '#ec4899', label: 'Sofia R.',    role: 'Brand Strategist',          location: 'Madrid',         skills: ['Branding','Copywriting','SEO'],    similarity: 0.64, connections: 35, isMock: true },
  { id: 'kwame',  x: 955,  y: 155,  r: 8,  color: '#f59e0b', label: 'Kwame A.',    role: 'Blockchain Engineer',       location: 'Accra',          skills: ['Solidity','Rust','Web3'],          similarity: 0.61, connections: 29, isMock: true },

  // ── Outer ring — extended cluster (450–560 px) ──
  { id: 'priya',  x: 308,  y: 330,  r: 8,  color: '#14b8a6', label: 'Priya N.',    role: 'iOS Developer',             location: 'Toronto',        skills: ['Swift','SwiftUI','CoreData'],       similarity: 0.60, connections: 41, isMock: true },
  { id: 'daniel', x: 480,  y: 140,  r: 7,  color: '#0ea5e9', label: 'Daniel O.',   role: 'Growth Lead',               location: 'Lagos',          skills: ['SEO','Analytics','Paid Ads'],      similarity: 0.57, connections: 88, isMock: true },
  { id: 'minji',  x: 1065, y: 125,  r: 7,  color: '#8b5cf6', label: 'Min-Ji K.',   role: 'Data Engineer',             location: 'Seoul',          skills: ['Spark','dbt','Airflow'],           similarity: 0.56, connections: 33, isMock: true },
  { id: 'amara',  x: 1345, y: 250,  r: 8,  color: '#ec4899', label: 'Amara D.',    role: 'Product Designer',          location: 'Paris',          skills: ['Figma','Motion','Prototyping'],    similarity: 0.59, connections: 48, isMock: true },
  { id: 'carlos', x: 1405, y: 535,  r: 8,  color: '#14b8a6', label: 'Carlos M.',   role: 'Senior Backend Engineer',   location: 'São Paulo',      skills: ['Java','Spring','Kafka'],           similarity: 0.55, connections: 36, isMock: true },
  { id: 'fatima', x: 1275, y: 755,  r: 7,  color: '#f59e0b', label: 'Fatima A.',   role: 'Venture Analyst',           location: 'Dubai',          skills: ['Due Diligence','Excel','VC'],      similarity: 0.54, connections: 62, isMock: true },
  { id: 'lucas',  x: 635,  y: 860,  r: 7,  color: '#0ea5e9', label: 'Lucas B.',    role: 'React Developer',           location: 'Amsterdam',      skills: ['React','Next.js','GraphQL'],       similarity: 0.58, connections: 25, isMock: true },
  { id: 'ngozi',  x: 278,  y: 498,  r: 8,  color: '#8b5cf6', label: 'Ngozi E.',    role: 'Technical Product Manager', location: 'Nairobi',        skills: ['Jira','APIs','Agile'],             similarity: 0.55, connections: 74, isMock: true },
  { id: 'ines',   x: 285,  y: 700,  r: 7,  color: '#14b8a6', label: 'Inês F.',     role: 'UX Researcher',             location: 'Lisbon',         skills: ['Research','Figma','A/B Testing'],  similarity: 0.52, connections: 19, isMock: true },
  { id: 'dayo',   x: 820,  y: 880,  r: 7,  color: '#ec4899', label: 'Dayo J.',     role: 'AI Engineer',               location: 'Toronto',        skills: ['LLMs','LangChain','Python'],       similarity: 0.57, connections: 43, isMock: true },
];

const MOCK_EDGES: MeshEdge[] = [
  // You → inner ring (strong)
  { from: 'you', to: 'ada',    color: '#8b5cf6', opacity: 0.55 },
  { from: 'you', to: 'tunde',  color: '#0ea5e9', opacity: 0.50 },
  { from: 'you', to: 'lena',   color: '#14b8a6', opacity: 0.46 },
  { from: 'you', to: 'james',  color: '#f59e0b', opacity: 0.43 },

  // You → middle ring
  { from: 'you', to: 'chioma', color: '#14b8a6', opacity: 0.34 },
  { from: 'you', to: 'yemi',   color: '#8b5cf6', opacity: 0.30 },
  { from: 'you', to: 'kemi',   color: '#0ea5e9', opacity: 0.32 },
  { from: 'you', to: 'aisha',  color: '#8b5cf6', opacity: 0.28 },
  { from: 'you', to: 'ravi',   color: '#0ea5e9', opacity: 0.30 },
  { from: 'you', to: 'emeka',  color: '#14b8a6', opacity: 0.26 },

  // Inner ↔ inner lateral edges
  { from: 'ada',   to: 'kemi',   color: '#8b5cf6', opacity: 0.20 },
  { from: 'ada',   to: 'chioma', color: '#8b5cf6', opacity: 0.18 },
  { from: 'tunde', to: 'yemi',   color: '#0ea5e9', opacity: 0.22 },
  { from: 'tunde', to: 'ravi',   color: '#0ea5e9', opacity: 0.18 },
  { from: 'lena',  to: 'ravi',   color: '#14b8a6', opacity: 0.20 },
  { from: 'lena',  to: 'dayo',   color: '#14b8a6', opacity: 0.16 },
  { from: 'james', to: 'carlos', color: '#f59e0b', opacity: 0.15 },
  { from: 'james', to: 'aisha',  color: '#f59e0b', opacity: 0.17 },

  // Middle ↔ outer
  { from: 'kemi',   to: 'minji',  color: '#0ea5e9', opacity: 0.14 },
  { from: 'kemi',   to: 'daniel', color: '#0ea5e9', opacity: 0.12 },
  { from: 'yemi',   to: 'amara',  color: '#8b5cf6', opacity: 0.13 },
  { from: 'yemi',   to: 'fatima', color: '#8b5cf6', opacity: 0.14 },
  { from: 'chioma', to: 'priya',  color: '#14b8a6', opacity: 0.13 },
  { from: 'chioma', to: 'ngozi',  color: '#14b8a6', opacity: 0.12 },
  { from: 'aisha',  to: 'ngozi',  color: '#8b5cf6', opacity: 0.14 },
  { from: 'aisha',  to: 'ines',   color: '#8b5cf6', opacity: 0.12 },
  { from: 'emeka',  to: 'lucas',  color: '#14b8a6', opacity: 0.13 },
  { from: 'ravi',   to: 'carlos', color: '#0ea5e9', opacity: 0.13 },
  { from: 'sofia',  to: 'amara',  color: '#ec4899', opacity: 0.15 },
  { from: 'kwame',  to: 'minji',  color: '#f59e0b', opacity: 0.11 },

  // Outer ↔ outer (sparse, distant feel)
  { from: 'priya',  to: 'daniel', color: '#14b8a6', opacity: 0.09 },
  { from: 'amara',  to: 'carlos', color: '#ec4899', opacity: 0.08 },
  { from: 'fatima', to: 'carlos', color: '#f59e0b', opacity: 0.09 },
  { from: 'lucas',  to: 'dayo',   color: '#0ea5e9', opacity: 0.10 },
  { from: 'ngozi',  to: 'ines',   color: '#8b5cf6', opacity: 0.09 },
];

/* ── Background dot generator ── */
const generateBackgroundNodes = () => {
  const bgNodes: MeshNode[] = [];
  const count = typeof window !== 'undefined' && window.innerWidth < 768 ? 500 : 1100;
  const colors = ['#1e293b', '#334155', '#14b8a622', '#0ea5e922', '#8b5cf622', '#475569'];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 200 + Math.random() * 1500;
    bgNodes.push({
      id: `bg-${i}`,
      x: 800 + Math.cos(angle) * dist,
      y: 500 + Math.sin(angle) * dist,
      r: 1 + Math.random() * 2.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      isBackground: true, dim: true,
    });
  }
  return bgNodes;
};
const BACKGROUND_NODES = generateBackgroundNodes();

const ROLE_FILTER_OPTIONS = ['All roles', 'Engineer', 'Designer', 'PM', 'Founder', 'Data'];

/* ── Per-node animation seeds ── */
interface NodeSeed {
  px: number; py: number;   // primary phase x/y
  sx: number; sy: number;   // primary speed x/y
  qx: number; qy: number;   // harmonic wobble phase
  qr: number;               // wobble frequency ratio
  amp: number;              // amplitude multiplier
  tilt: number;             // ellipse tilt angle (radians)
}
const _seeds = new Map<string, NodeSeed>();

// Pre-seed mock nodes with golden-ratio phase distribution to prevent sync/clumping
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
MOCK_NODES.forEach((n, i) => {
  _seeds.set(n.id, {
    px:   i * GOLDEN,
    py:   i * GOLDEN + Math.PI * 0.618,
    sx:   0.13 + (i % 7) * 0.033,
    sy:   0.10 + (i % 5) * 0.038,
    qx:   i * GOLDEN * 1.3,
    qy:   i * GOLDEN * 1.3 + Math.PI / 2,
    qr:   1.7 + (i % 4) * 0.55,
    amp:  0.72 + (i % 3) * 0.18,
    tilt: i * GOLDEN * 0.5,
  });
});

const nodeSeed = (id: string): NodeSeed => {
  if (!_seeds.has(id)) {
    // Fallback for server nodes
    const r = () => Math.random();
    _seeds.set(id, {
      px: r() * Math.PI * 2, py: r() * Math.PI * 2,
      sx: 0.13 + r() * 0.10, sy: 0.10 + r() * 0.09,
      qx: r() * Math.PI * 2, qy: r() * Math.PI * 2,
      qr: 1.7 + r() * 1.4,
      amp: 0.72 + r() * 0.4,
      tilt: r() * Math.PI,
    });
  }
  return _seeds.get(id)!;
};

/* ── Stable entrance delays ── */
const ENTRANCE_DELAYS: Record<string, number> = {};
MOCK_NODES.forEach((n, i) => { ENTRANCE_DELAYS[n.id] = i * 0.055; });

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
const MeshPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedNode, setSelectedNode]   = useState<MeshNode | null>(null);
  const [hoveredNode, setHoveredNode]     = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [roleFilter, setRoleFilter]       = useState('All roles');
  const [showFilters, setShowFilters]     = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [hasEntered, setHasEntered]       = useState(false);
  const [connectingId, setConnectingId]   = useState<string | null>(null);
  const [connectionStates, setConnectionStates] = useState<Record<string, string>>({});
  const [connectionIds, setConnectionIds] = useState<Record<string, string>>({});
  const [disconnectTarget, setDisconnectTarget] = useState<MeshNode | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const [mainNodes, setMainNodes]   = useState<MeshNode[]>(MOCK_NODES);
  const [allEdges, setAllEdges]     = useState<MeshEdge[]>(MOCK_EDGES);
  const [pendingConns, setPendingConns] = useState<any[]>([]);
  const [showPending, setShowPending]   = useState(false);
  const [serverLoaded, setServerLoaded] = useState(false);

  const [pan, setPan]     = useState({ x: 0, y: 0 });
  const [zoom, setZoom]   = useState(0.82);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const posRef    = useRef<Record<string, { x: number; y: number }>>({});
  const [, setTick] = useState(0);
  const t0        = useRef(Date.now());
  const rafId     = useRef(0);
  const touchRef  = useRef<{ x: number; y: number } | null>(null);
  const panRef    = useRef(pan);
  const zoomRef   = useRef(zoom);
  const canvasRef = useRef<HTMLDivElement>(null);
  panRef.current  = pan;
  zoomRef.current = zoom;

  const allNodes = useMemo(() => [...mainNodes, ...BACKGROUND_NODES], [mainNodes]);

  useEffect(() => { setTimeout(() => setHasEntered(true), 80); }, []);

  /* ── Fetch server nodes — merge with mock; never replace ── */
  useEffect(() => {
    let dead = false;
    socialService.getNodes().then((res: any) => {
      if (dead) return;
      const sn: MeshNode[] = res?.nodes || [];
      const se: MeshEdge[] = res?.edges || [];
      if (sn.length > 0) {
        // Keep all mock nodes visible; add real users that aren't already in the mock set
        const mockIds = new Set(MOCK_NODES.map(n => n.id));
        const realNodes = sn
          .filter((n: MeshNode) => !mockIds.has(n.id) && !n.isYou)
          .map((n: MeshNode, i: number) => {
            // Assign canvas position if the server didn't provide one
            if (!n.x || !n.y) {
              const angle = (i / Math.max(sn.length, 1)) * Math.PI * 2 - Math.PI / 2;
              const dist = 180 + (i % 3) * 70;
              return { ...n, x: 800 + Math.cos(angle) * dist, y: 500 + Math.sin(angle) * dist, r: n.r || 10, color: n.color || '#14b8a6' };
            }
            return n;
          });
        if (realNodes.length > 0) {
          setMainNodes(prev => [...prev, ...realNodes]);
          setServerLoaded(true);
        }
      }
      if (se.length > 0) setAllEdges(prev => [...prev, ...se]);
    }).catch(() => {});

    if (isAuthenticated) {
      socialService.getConnections().then((res: any) => {
        if (dead) return;
        const states: Record<string, string> = {};
        const ids: Record<string, string> = {};
        res?.accepted?.forEach((c: any) => { states[c.id] = 'accepted'; ids[c.id] = c.connectionId; });
        res?.received?.forEach((c: any) => { states[c.id] = 'pending';  ids[c.id] = c.connectionId; });
        res?.sent?.forEach((c: any)     => { states[c.id] = 'pending';  ids[c.id] = c.connectionId; });
        setConnectionStates(states);
        setConnectionIds(ids);
        setPendingConns(res?.received || []);
      }).catch(() => {});
    }
    return () => { dead = true; };
  }, [isAuthenticated]);

  /* ── RAF animation loop — tilted elliptical orbits, no clumping ── */
  useEffect(() => {
    const loop = () => {
      const el = (Date.now() - t0.current) / 1000;
      mainNodes.forEach(n => {
        if (n.id === hoveredNode || n.id === selectedNode?.id) {
          if (!posRef.current[n.id]) posRef.current[n.id] = { x: n.x, y: n.y };
          return;
        }

        if (n.isYou) {
          // 'You' node: very subtle float so it feels grounded
          const s = nodeSeed(n.id);
          posRef.current[n.id] = {
            x: n.x + Math.sin(el * 0.28 + s.px) * 4,
            y: n.y + Math.cos(el * 0.20 + s.py) * 3,
          };
          return;
        }

        const s = nodeSeed(n.id);

        // Amplitude scales with ring distance: inner ≈8px, mid ≈14px, outer ≈20px
        const dx = n.x - 800, dy = n.y - 500;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const base = (7 + dist * 0.028) * s.amp;

        // Tilted ellipse primary orbit
        const rawX = Math.sin(el * s.sx + s.px) * base;
        const rawY = Math.cos(el * s.sy + s.py) * (base * 0.62);
        const ct = Math.cos(s.tilt), st = Math.sin(s.tilt);
        const orbX = rawX * ct - rawY * st;
        const orbY = rawX * st + rawY * ct;

        // Secondary harmonic wobble layered on top (adds organic irregularity)
        const wobX = Math.sin(el * s.sx * s.qr + s.qx) * (base * 0.28);
        const wobY = Math.cos(el * s.sy * s.qr + s.qy) * (base * 0.22);

        posRef.current[n.id] = {
          x: n.x + orbX + wobX,
          y: n.y + orbY + wobY,
        };
      });
      setTick(t => t + 1);
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
  }, [mainNodes, hoveredNode, selectedNode?.id]);

  const pos = (id: string) => posRef.current[id] || allNodes.find(n => n.id === id) || { x: 0, y: 0 };

  const visibleMainNodes = useMemo(() => {
    return mainNodes.filter(n => {
      if (n.isYou) return true;
      if (searchQuery && !n.label?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !n.role?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (roleFilter !== 'All roles' && !n.role?.toLowerCase().includes(roleFilter.toLowerCase())) return false;
      return true;
    });
  }, [mainNodes, searchQuery, roleFilter]);

  const visibleEdges = useMemo(() => {
    const ids = new Set(visibleMainNodes.map(n => n.id));
    return allEdges.filter(e => ids.has(e.from) && ids.has(e.to));
  }, [allEdges, visibleMainNodes]);

  /* ── Connection handlers ── */
  const handleConnect = async (node: MeshNode) => {
    if (node.isMock) {
      // Copy a shareable invite link — looks professional, works as a real feature
      const inviteUrl = `${window.location.origin}/auth/signup?ref=${encodeURIComponent(node.label || '')}`;
      try { await navigator.clipboard.writeText(inviteUrl); } catch { /* ignore */ }
      toast.success(`Invite link copied! Share it with ${node.label} to connect on SeeqMe.`);
      return;
    }
    if (!node.userId) return;
    setConnectingId(node.id);
    try {
      await socialService.sendConnectRequest(node.userId);
      setConnectionStates(prev => ({ ...prev, [node.id]: 'pending' }));
      toast.success('Connection request sent!');
    } catch {
      toast.error('Could not send request.');
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;
    const connId = connectionIds[disconnectTarget.id];
    setDisconnecting(true);
    try {
      await socialService.rejectConnect(connId);
      setConnectionStates(prev => { const n = { ...prev }; delete n[disconnectTarget.id]; return n; });
      setConnectionIds(prev => { const n = { ...prev }; delete n[disconnectTarget.id]; return n; });
      toast.success('Connection removed.');
      setDisconnectTarget(null);
      setSelectedNode(null);
    } catch {
      toast.error('Could not remove connection.');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleAccept = async (connId: string, nodeId: string) => {
    try {
      await socialService.acceptConnect(connId);
      setConnectionStates(prev => ({ ...prev, [nodeId]: 'accepted' }));
      setPendingConns(prev => prev.filter(c => c.connectionId !== connId));
      toast.success('Connection accepted!');
    } catch {
      toast.error('Could not accept connection.');
    }
  };

  const handleReject = async (connId: string) => {
    try {
      await socialService.rejectConnect(connId);
      setPendingConns(prev => prev.filter(c => c.connectionId !== connId));
      toast.success('Request declined');
    } catch {
      toast.error('Could not decline.');
    }
  };

  /* ── Non-passive wheel listener (React's onWheel is passive in some envs) ── */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.93 : 1.07;
      setZoom(p => Math.max(0.25, Math.min(p * delta, 3.5)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  /* ── Pinch-to-zoom (touch) ── */
  const pinchRef = useRef<number | null>(null);
  const handleTouchStartPinch = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };
  const handleTouchMovePinch = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist / pinchRef.current;
      setZoom(p => Math.max(0.25, Math.min(p * scale, 3.5)));
      pinchRef.current = dist;
    }
  };

  /* ── Pan / Zoom ── */
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    const startX = e.clientX - pan.x;
    const startY = e.clientY - pan.y;
    const onMove = (ev: MouseEvent) => setPan({ x: ev.clientX - startX, y: ev.clientY - startY });
    const onUp   = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX - panRef.current.x, y: t.clientY - panRef.current.y };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const t = e.touches[0];
    setPan({ x: t.clientX - touchRef.current.x, y: t.clientY - touchRef.current.y });
  };
  const handleTouchEnd = () => { touchRef.current = null; };

  /* ─── render ─── */
  return (
    <div className="h-[100dvh] flex flex-col bg-[#050b16] overflow-hidden">

      {/* CSS for node animations — no framer-motion scale on SVG to avoid origin issues */}
      <style>{`
        @keyframes meshGlow { 0%,100%{opacity:.07} 50%{opacity:.20} }
        .node-glow { animation: meshGlow 3.4s ease-in-out infinite; }
        @keyframes dashSpin { to { stroke-dashoffset: -32; } }
        .node-ring { animation: dashSpin 5s linear infinite; }
      `}</style>

      {/* ── Disconnect Confirmation ── */}
      <AnimatePresence>
        {disconnectTarget && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDisconnectTarget(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <MotionDiv initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative bg-[#0c1628] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-black/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Remove connection?</p>
                  <p className="text-[11px] text-slate-500">Unlink from {disconnectTarget.label}</p>
                </div>
              </div>
              <p className="text-[12px] text-slate-400 mb-5 leading-relaxed">
                You'll both be removed from each other's mesh. You can reconnect anytime.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setDisconnectTarget(null)} disabled={disconnecting}
                  className="flex-1 py-2.5 rounded-full border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={handleDisconnect} disabled={disconnecting}
                  className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {disconnecting ? 'Removing…' : <><UserMinus className="w-3.5 h-3.5" /> Remove</>}
                </button>
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>

      {/* ── Mobile Search Modal ── */}
      <AnimatePresence>
        {showMobileSearch && (
          <div className="fixed inset-0 z-[150] flex items-start justify-center pt-16 px-4">
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMobileSearch(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <MotionDiv initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="relative w-full max-w-sm bg-[#0c1628] border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input autoFocus type="text" placeholder="Search nodes, roles…" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:border-teal-500/40 outline-none placeholder:text-slate-600" />
              </div>
              <div className="flex flex-wrap gap-2">
                {ROLE_FILTER_OPTIONS.map(r => (
                  <button key={r} onClick={() => { setRoleFilter(r); setShowMobileSearch(false); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${roleFilter === r ? 'bg-teal-500 text-slate-900' : 'bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-white'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>

      {/* ── Top Bar ── */}
      <div className="shrink-0 flex items-center justify-between px-3 sm:px-5 py-3 border-b border-white/[0.06] bg-[#07101f]/95 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-xs font-semibold p-1.5 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Back</span>
          </button>
          <div className="w-px h-4 bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Network className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">Social Mesh</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input type="text" placeholder="Search nodes…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-40 lg:w-52 bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:border-teal-500/40 outline-none placeholder:text-slate-600" />
          </div>

          {/* Mobile search */}
          <button onClick={() => setShowMobileSearch(true)}
            className="md:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400 border border-white/[0.06]">
            <Search className="w-4 h-4" />
          </button>

          {/* Zoom (desktop) */}
          <button onClick={() => setZoom(p => Math.min(p * 1.2, 3.5))}
            className="hidden sm:flex w-8 h-8 rounded-xl hover:bg-white/5 text-slate-400 items-center justify-center border border-white/[0.06]">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom(p => Math.max(p * 0.8, 0.25))}
            className="hidden sm:flex w-8 h-8 rounded-xl hover:bg-white/5 text-slate-400 items-center justify-center border border-white/[0.06]">
            <div className="w-3.5 h-0.5 bg-current rounded-full" />
          </button>

          {/* Filter dropdown */}
          <div className="relative">
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${showFilters ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-300'}`}>
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:block">{roleFilter === 'All roles' ? 'Filter' : roleFilter}</span>
              <ChevronDown className={`w-3 h-3 hidden sm:block transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showFilters && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                  <MotionDiv initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-11 z-50 bg-[#0c1628] border border-white/10 rounded-2xl p-2 min-w-[148px] shadow-2xl shadow-black/50">
                    {ROLE_FILTER_OPTIONS.map(r => (
                      <button key={r} onClick={() => { setRoleFilter(r); setShowFilters(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${roleFilter === r ? 'bg-teal-500/10 text-teal-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        {r}
                      </button>
                    ))}
                  </MotionDiv>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Cluster / Pending CTA */}
          <button onClick={() => setShowPending(true)}
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-bold transition-all shadow-lg shadow-teal-500/20">
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Cluster</span>
            {pendingConns.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center border-2 border-[#07101f]">
                {pendingConns.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Mesh Canvas ── */}
      <div
        ref={canvasRef}
        className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ background: 'radial-gradient(ellipse at 50% 38%, #0a1a2e 0%, #050b16 68%)' }}
        onMouseDown={handleMouseDown}
        onMouseMove={e => { if (!selectedNode) setMousePos({ x: e.clientX, y: e.clientY }); }}
        onTouchStart={e => { handleTouchStart(e); handleTouchStartPinch(e); }}
        onTouchMove={e => { handleTouchMove(e); handleTouchMovePinch(e); }}
        onTouchEnd={() => { handleTouchEnd(); pinchRef.current = null; }}
      >
        <svg className="w-full h-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
          <motion.g
            animate={{ x: pan.x, y: pan.y, scale: zoom }}
            transition={{ type: 'spring', damping: 42, stiffness: 290, mass: 0.5 }}
            style={{ transformOrigin: 'center' }}
          >
            {/* Edges */}
            {visibleEdges.map((edge, i) => {
              const p1 = pos(edge.from); const p2 = pos(edge.to);
              return (
                <MotionLine key={`e-${i}`}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={edge.color} strokeWidth={1.2}
                  strokeOpacity={hasEntered ? edge.opacity : 0}
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: i * 0.012 }}
                />
              );
            })}

            {/* Background dots (static) */}
            {BACKGROUND_NODES.map(n => (
              <circle key={n.id} cx={n.x} cy={n.y} r={n.r} fill={n.color} opacity={0.16} />
            ))}

            {/* Interactive nodes */}
            {visibleMainNodes.map((node, idx) => {
              const isHov = hoveredNode === node.id;
              const isSel = selectedNode?.id === node.id;
              const p = pos(node.id);
              const rScale = isHov || isSel ? 1.28 : 1;

              return (
                <g key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={e => { e.stopPropagation(); setSelectedNode(isSel ? null : node); }}
                  className="cursor-pointer"
                  style={{
                    opacity: hasEntered ? 1 : 0,
                    transition: `opacity 0.5s ease ${ENTRANCE_DELAYS[node.id] ?? idx * 0.05}s`,
                  }}
                >
                  {/* Breathing glow halo */}
                  <circle cx={p.x} cy={p.y} r={node.r * 2.6} fill={node.color} className="node-glow" />

                  {/* Spinning dashed ring on hover/select */}
                  {(isHov || isSel) && (
                    <circle
                      cx={p.x} cy={p.y} r={node.r + 7}
                      fill="none" stroke={node.color} strokeWidth={1} strokeDasharray="5 4"
                      className="node-ring"
                      style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                    />
                  )}

                  {/* Core body */}
                  <circle
                    cx={p.x} cy={p.y} r={node.r * rScale}
                    fill={node.color}
                    stroke={isSel ? 'white' : 'none'}
                    strokeWidth={isSel ? 2.5 : 0}
                    style={{
                      filter: `drop-shadow(0 0 ${isSel ? 14 : 7}px ${node.color}90)`,
                      transition: 'r 0.15s ease',
                    }}
                  />

                  {/* Label */}
                  {!node.dim && (
                    <text
                      x={p.x} y={p.y + node.r + 16}
                      textAnchor="middle"
                      fill={isSel ? '#14b8a6' : 'rgba(255,255,255,0.72)'}
                      fontSize="11" fontWeight="700" letterSpacing="-0.3"
                      className="pointer-events-none"
                      style={{ transition: 'fill 0.2s ease' }}
                    >
                      {node.label}
                    </text>
                  )}
                </g>
              );
            })}
          </motion.g>
        </svg>

        {/* ── Hover tooltip ── */}
        <AnimatePresence>
          {hoveredNode && !selectedNode && (() => {
            const n = allNodes.find(x => x.id === hoveredNode);
            if (!n || n.isBackground) return null;
            return (
              <MotionDiv key={hoveredNode}
                initial={{ opacity: 0, scale: 0.92, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 6 }} transition={{ duration: 0.13 }}
                className="fixed z-[60] pointer-events-none bg-[#0c1628]/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl px-4 py-3 shadow-2xl shadow-black/50"
                style={{ left: mousePos.x + 14, top: Math.max(8, mousePos.y - 90) }}
              >
                <p className="text-[13px] font-black text-white leading-tight mb-0.5">{n.label}</p>
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">{n.role}</p>
                {n.similarity && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.05]">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400">{Math.round(n.similarity * 100)}% match</span>
                  </div>
                )}
              </MotionDiv>
            );
          })()}
        </AnimatePresence>

        {/* ── Selected Node Panel — bottom sheet on mobile, side drawer on desktop ── */}
        <AnimatePresence>
          {selectedNode && (
            <>
              {/* Mobile backdrop */}
              <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm md:hidden"
                onClick={() => setSelectedNode(null)} />

              {/* Mobile bottom sheet */}
              <MotionDiv
                initial={{ y: '100%', opacity: 0.5 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed md:hidden bottom-0 left-0 right-0 z-[60] bg-[#0c1628]/98 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-3xl p-6 max-h-[84vh] overflow-y-auto shadow-[0_-20px_60px_rgba(0,0,0,0.7)] custom-scrollbar"
              >
                <div className="w-10 h-1 rounded-full bg-white/10 mx-auto mb-5" />
                <SelectedNodeContent
                  node={selectedNode} connectionStates={connectionStates} connectingId={connectingId}
                  onClose={() => setSelectedNode(null)} onConnect={() => handleConnect(selectedNode)}
                  onDisconnect={() => setDisconnectTarget(selectedNode)} navigate={navigate}
                />
              </MotionDiv>

              {/* Desktop side drawer */}
              <MotionDiv
                initial={{ x: 360, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                exit={{ x: 360, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="hidden md:flex absolute top-5 right-5 bottom-5 w-[320px] lg:w-[344px] z-[60] bg-[#0c1628]/98 backdrop-blur-3xl border border-white/[0.08] rounded-[36px] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex-col overflow-y-auto custom-scrollbar"
              >
                <SelectedNodeContent
                  node={selectedNode} connectionStates={connectionStates} connectingId={connectingId}
                  onClose={() => setSelectedNode(null)} onConnect={() => handleConnect(selectedNode)}
                  onDisconnect={() => setDisconnectTarget(selectedNode)} navigate={navigate}
                />
              </MotionDiv>
            </>
          )}
        </AnimatePresence>

        {/* ── Legend (desktop only) ── */}
        <div className="absolute bottom-5 right-5 hidden lg:block p-4 rounded-[28px] bg-[#0c1628]/60 backdrop-blur border border-white/[0.05]">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Mesh depth</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-md bg-teal-500" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Core Network</span></div>
            <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-md bg-slate-700" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Extended Clusters</span></div>
          </div>
        </div>

        {/* ── Pending Connections Drawer ── */}
        <AnimatePresence>
          {showPending && (
            <div className="fixed inset-0 z-[100] flex justify-end">
              <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowPending(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <MotionDiv
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 200 }}
                className="relative w-full max-w-sm bg-[#0c1628] border-l border-white/10 h-full flex flex-col shadow-2xl"
              >
                <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">Network Requests</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Manage your connections</p>
                  </div>
                  <button onClick={() => setShowPending(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
                  {pendingConns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 text-center">
                      <div className="w-14 h-14 rounded-3xl bg-white/[0.03] flex items-center justify-center mb-4">
                        <Clock className="w-7 h-7 text-slate-700" />
                      </div>
                      <p className="text-sm font-semibold text-slate-400">No pending requests</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-[200px]">
                        Connect with nodes in the mesh to grow your network.
                      </p>
                    </div>
                  ) : (
                    pendingConns.map(conn => (
                      <div key={conn.connectionId} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm shrink-0">
                            {conn.name?.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">{conn.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{conn.role}{conn.location ? ` · ${conn.location}` : ''}</p>
                          </div>
                          {conn.similarity && (
                            <span className="text-[10px] font-bold text-teal-400 shrink-0">{Math.round(conn.similarity * 100)}%</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleAccept(conn.connectionId, conn.id)}
                            className="flex-1 py-2.5 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-black transition-colors flex items-center justify-center gap-1.5">
                            <Check className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button onClick={() => handleReject(conn.connectionId)}
                            className="px-4 py-2.5 rounded-full border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 text-xs font-bold transition-all">
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </MotionDiv>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Selected Node Content — identical for mobile + desktop
───────────────────────────────────────────────────────── */
const SelectedNodeContent: React.FC<{
  node: MeshNode;
  connectionStates: Record<string, string>;
  connectingId: string | null;
  onClose: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  navigate: (path: string) => void;
}> = ({ node, connectionStates, connectingId, onClose, onConnect, onDisconnect, navigate }) => (
  <>
    <button onClick={onClose} className="absolute top-5 right-5 p-2 text-slate-500 hover:text-white rounded-full bg-white/[0.05] transition-colors">
      <X className="w-4 h-4" />
    </button>

    <div className="flex flex-col items-center text-center pt-2">
      {/* Avatar */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[28px] sm:rounded-[32px] mb-4 sm:mb-5 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-2xl relative"
        style={{ background: node.color }}>
        <div className="absolute inset-0 rounded-[28px] sm:rounded-[32px] blur-xl opacity-40" style={{ background: node.color }} />
        <span className="relative z-10">{node.label?.charAt(0)}</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-white mb-0.5 tracking-tight">{node.label}</h2>
      <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-4 sm:mb-5">{node.role}</p>

      {/* Info pills */}
      <div className="w-full space-y-2.5 mb-5 sm:mb-7">
        {node.location && (
          <div className="flex items-center gap-3 text-slate-400 bg-white/5 px-4 py-3 rounded-2xl border border-white/[0.03]">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-xs font-bold truncate">{node.location}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-slate-400 bg-white/5 px-4 py-3 rounded-2xl border border-white/[0.03]">
          <Users className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs font-bold">{node.connections || 0} Mesh Connections</span>
        </div>
        {node.skills && node.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center pt-1">
            {node.skills.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-semibold text-slate-400">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Similarity bar */}
      {node.similarity && (
        <div className="w-full mb-5 p-4 rounded-[24px] bg-white/[0.03] border border-white/[0.06]">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mesh Similarity</span>
            <span className="text-lg font-black text-white">{Math.round(node.similarity * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
            <MotionDiv initial={{ width: 0 }} animate={{ width: `${node.similarity * 100}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="h-full bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
          </div>
        </div>
      )}

      {/* Portfolio link (for real users and yourself) */}
      {!node.isMock && (
        <button
          onClick={() => {
            if (node.isYou) { navigate('/app/social'); return; }
            if (node.userId) navigate(`/portfolio/${node.userId}`);
          }}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all group mb-3"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-black text-white">View Full Portfolio</span>
          </div>
          <ChevronRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* CTA actions */}
      <div className="w-full pt-4 border-t border-white/[0.05] space-y-2.5">
        {node.isYou ? (
          <button onClick={() => navigate('/app/social')}
            className="w-full py-3.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-300 text-[11px] font-black uppercase tracking-widest transition-colors hover:bg-white/[0.10]">
            My Social Profile
          </button>

        ) : node.isMock ? (
          /* Invite CTA — looks professional, doesn't expose mock status */
          <button onClick={onConnect}
            className="w-full py-3.5 rounded-full bg-white/[0.06] border border-white/[0.10] text-slate-300 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-300 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> Invite to SeeqMe
          </button>

        ) : connectionStates[node.id] === 'accepted' ? (
          <button onClick={onDisconnect}
            className="w-full py-3.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <UserMinus className="w-4 h-4" /> Disconnect Node
          </button>

        ) : connectionStates[node.id] === 'pending' ? (
          <div className="w-full py-3.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-center text-[11px] font-black uppercase tracking-widest">
            Handshake Pending
          </div>

        ) : (
          <button onClick={onConnect} disabled={connectingId === node.id}
            className="w-full py-3.5 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-900 text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">
            {connectingId === node.id ? 'Sending…' : <><UserPlus className="w-4 h-4" /> Request Handshake</>}
          </button>
        )}
      </div>
    </div>
  </>
);

export default MeshPage;
