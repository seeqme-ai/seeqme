import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { socialService } from '@/services/apiService';
import { toast } from 'sonner';
import {
  Network, Search, X, ArrowLeft,
  MapPin, ExternalLink, UserPlus, UserMinus,
  Users, Filter, Check, Clock, ChevronRight, AlertTriangle
} from 'lucide-react';

const MotionDiv = motion.div as any;
const MotionCircle = motion.circle as any;
const MotionLine = motion.line as any;

/* ── Types ── */
interface MeshNode {
  id: string; userId?: string; x: number; y: number; r: number;
  color: string; label?: string; role?: string;
  location?: string; skills?: string[];
  similarity?: number; connections?: number;
  dim?: boolean; isYou?: boolean;
  isBackground?: boolean;
}
interface MeshEdge {
  from: string; to: string; color: string; opacity: number; similarity?: number;
}

/* ── Initial high-fidelity data ── */
const NODES: MeshNode[] = [
  { id: 'you', x: 800, y: 500, r: 16, color: '#14b8a6', label: 'You', role: 'Full-Stack Engineer', location: 'San Francisco', skills: ['React', 'TypeScript', 'Node.js'], isYou: true },
  { id: 'ada', x: 540, y: 310, r: 10, color: '#8b5cf6', label: 'Ada O.', role: 'Senior Designer', location: 'Lagos', skills: ['Figma', 'React', 'CSS'], similarity: 0.89, connections: 34 },
  { id: 'tunde', x: 1040, y: 295, r: 10, color: '#0ea5e9', label: 'Tunde K.', role: 'Product Manager', location: 'Abuja', skills: ['Roadmapping', 'SQL', 'OKRs'], similarity: 0.74, connections: 61 },
  { id: 'chioma', x: 480, y: 650, r: 9, color: '#14b8a6', label: 'Chioma I.', role: 'Frontend Developer', location: 'Accra', skills: ['Vue', 'TypeScript', 'TailWind'], similarity: 0.71, connections: 28 },
  { id: 'yemi', x: 1090, y: 660, r: 11, color: '#8b5cf6', label: 'Yemi A.', role: 'Startup Founder', location: 'London', skills: ['Strategy', 'Fundraising'], similarity: 0.63, connections: 102 },
  { id: 'kemi', x: 670, y: 210, r: 8, color: '#0ea5e9', label: 'Kemi L.', role: 'Data Scientist', location: 'Berlin', skills: ['Python', 'ML', 'SQL'], similarity: 0.68, connections: 47 },
  { id: 'emeka', x: 820, y: 710, r: 9, color: '#14b8a6', label: 'Emeka O.', role: 'UX Designer', location: 'New York', skills: ['Figma', 'Framer', 'Research'], similarity: 0.59, connections: 39 },
  { id: 'aisha', x: 630, y: 710, r: 8, color: '#8b5cf6', label: 'Aisha M.', role: 'Backend Engineer', location: 'Nairobi', skills: ['Go', 'Postgres', 'Redis'], similarity: 0.66, connections: 22 },
];

const EDGES: MeshEdge[] = [
  { from: 'you', to: 'ada', color: '#14b8a6', opacity: 0.5, similarity: 0.89 },
  { from: 'you', to: 'tunde', color: '#0ea5e9', opacity: 0.4, similarity: 0.74 },
  { from: 'you', to: 'chioma', color: '#14b8a6', opacity: 0.35, similarity: 0.71 },
  { from: 'you', to: 'yemi', color: '#8b5cf6', opacity: 0.28, similarity: 0.63 },
  { from: 'you', to: 'kemi', color: '#0ea5e9', opacity: 0.32, similarity: 0.68 },
  { from: 'you', to: 'aisha', color: '#8b5cf6', opacity: 0.3, similarity: 0.66 },
];

/* ── Node Generator (1200 Nodes) ── */
const generateBackgroundNodes = () => {
  const bgNodes: MeshNode[] = [];
  const count = 1200;
  const colors = ['#1e293b', '#334155', '#475569', '#14b8a622', '#0ea5e922', '#8b5cf622'];
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 300 + Math.random() * 1200;
    const x = 800 + Math.cos(angle) * dist;
    const y = 500 + Math.sin(angle) * dist;
    
    bgNodes.push({
      id: `bg-${i}`,
      x, y,
      r: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      isBackground: true,
      dim: true
    });
  }
  return bgNodes;
};

const BACKGROUND_NODES = generateBackgroundNodes();

/* ── Utility ── */
const ROLE_FILTER_OPTIONS = ['All roles', 'Engineer', 'Designer', 'PM', 'Founder', 'Data'];

/* ── Animation seed per node ── */
const _seeds = new Map<string, { px: number; py: number; sx: number; sy: number }>();
const nodeSeed = (id: string) => {
  if (!_seeds.has(id)) _seeds.set(id, { px: Math.random()*Math.PI*2, py: Math.random()*Math.PI*2, sx: 0.1+Math.random()*0.15, sy: 0.08+Math.random()*0.12 });
  return _seeds.get(id)!;
};

const MeshPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);
  const [hoveredNode, setHoveredNode]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [roleFilter, setRoleFilter]     = useState('All roles');
  const [showFilters, setShowFilters]   = useState(false);
  const [hasEntered, setHasEntered]     = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectionStates, setConnectionStates] = useState<Record<string, string>>({});
  const [connectionIds, setConnectionIds] = useState<Record<string, string>>({}); // nodeId -> connectionId
  const [disconnectTarget, setDisconnectTarget] = useState<MeshNode | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const [allNodes, setAllNodes] = useState<MeshNode[]>([...NODES, ...BACKGROUND_NODES]);
  const [allEdges, setAllEdges] = useState<MeshEdge[]>(EDGES);
  const [pendingConns, setPendingConns] = useState<any[]>([]);
  const [showPending, setShowPending] = useState(false);

  const posRef = useRef<Record<string, {x:number;y:number}>>({});
  const [, setTick] = useState(0);
  const t0 = useRef(Date.now());
  const rafId = useRef(0);

  useEffect(() => {
    setTimeout(() => setHasEntered(true), 100);
  }, []);

  // Fetch & merge server data
  useEffect(() => {
    let dead = false;
    socialService.getNodes().then((res: any) => {
      if (dead) return;
      const sn: MeshNode[] = res?.nodes || [];
      const se: MeshEdge[] = res?.edges || [];
      if (sn.length) {
        const ids = new Set(NODES.map(n => n.id));
        setAllNodes(prev => [...sn.filter(n => !ids.has(n.id)), ...prev]);
      }
      if (se.length) {
        const ek = new Set(allEdges.map(e => `${e.from}-${e.to}`));
        setAllEdges(prev => [...se.filter(e => !ek.has(`${e.from}-${e.to}`)), ...prev]);
      }
    }).catch(() => {});

      if (isAuthenticated) {
        socialService.getConnections().then((res: any) => {
          if (dead) return;
          const states: Record<string, string> = {};
          const ids: Record<string, string> = {};
          res?.accepted?.forEach((c: any) => { states[c.id] = 'accepted'; ids[c.id] = c.connectionId; });
          res?.received?.forEach((c: any) => { states[c.id] = 'pending'; ids[c.id] = c.connectionId; });
          res?.sent?.forEach((c: any) => { states[c.id] = 'pending'; ids[c.id] = c.connectionId; });
          setConnectionStates(states);
          setConnectionIds(ids);
          setPendingConns(res?.received || []);
        }).catch(() => {});
      }
    return () => { dead = true; };
  }, [isAuthenticated]);

  // Optimized Animation Loop
  useEffect(() => {
    const DRIFT = 8;
    const loop = () => {
      const el = (Date.now() - t0.current) / 1000;
      // Only animate interactive nodes and a subset of background nodes for perf
      allNodes.forEach((n, i) => {
        if (n.isBackground && i % 10 !== 0) return; // Only animate 10% of BG nodes
        if (n.id === hoveredNode || n.id === selectedNode?.id) {
          if (!posRef.current[n.id]) posRef.current[n.id] = { x: n.x, y: n.y };
          return;
        }
        const s = nodeSeed(n.id);
        const d = n.isYou ? DRIFT*0.3 : n.isBackground ? DRIFT*0.5 : DRIFT;
        posRef.current[n.id] = { 
          x: n.x + Math.sin(el*s.sx+s.px)*d, 
          y: n.y + Math.cos(el*s.sy+s.py)*d 
        };
      });
      setTick(t => t+1);
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
  }, [allNodes, hoveredNode, selectedNode?.id]);

  const pos = (id: string) => posRef.current[id] || allNodes.find(n => n.id === id) || { x: 0, y: 0 };

  const visibleNodes = useMemo(() => {
    return allNodes.filter(n => {
      if (n.isBackground || n.isYou) return true;
      if (searchQuery && !n.label?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !n.role?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (roleFilter !== 'All roles' && !n.role?.toLowerCase().includes(roleFilter.toLowerCase())) return false;
      return true;
    });
  }, [allNodes, searchQuery, roleFilter]);

  const visibleEdges = useMemo(() => {
    const ids = new Set(visibleNodes.map(n => n.id));
    return allEdges.filter(e => ids.has(e.from) && ids.has(e.to));
  }, [allEdges, visibleNodes]);

  const handleConnect = async (nodeId: string) => {
    setConnectingId(nodeId);
    try {
      await socialService.sendConnectRequest(nodeId);
      setConnectionStates(prev => ({ ...prev, [nodeId]: 'pending' }));
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

  return (
    <div className="h-screen flex flex-col bg-[#060d18] overflow-hidden">

      {/* ── Disconnect Confirmation Modal ── */}
      <AnimatePresence>
        {disconnectTarget && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDisconnectTarget(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative bg-[#0c1628] border border-white/10 rounded-lg p-6 w-full max-w-sm"
              style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.6)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Remove connection?</p>
                  <p className="text-[11px] text-slate-500">This will unlink you from {disconnectTarget.label}</p>
                </div>
              </div>
              <p className="text-[12px] text-slate-400 mb-5 leading-relaxed">
                Removing this node from your cluster will stop you both from appearing in each other's mesh. You can send a new request anytime.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setDisconnectTarget(null)} disabled={disconnecting} className="flex-1 py-2.5 rounded-[50px] border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-xs font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={handleDisconnect} disabled={disconnecting} className="flex-1 py-2.5 rounded-[50px] bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {disconnecting ? 'Removing…' : <><UserMinus className="w-3.5 h-3.5" /> Remove</>}
                </button>
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>

      {/* ── Top bar ── */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-[#07101f]/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="w-px h-4 bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-bold text-white tracking-tight">Mesh</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input type="text" placeholder="Search nodes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-52 bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:border-teal-500/40 outline-none" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${showFilters ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-white/[0.04] border-white/[0.08] text-slate-400'}`}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
          <button onClick={() => setShowPending(true)} className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-bold transition-all shadow-lg shadow-teal-500/20">
            <Users className="w-3.5 h-3.5" /> 
            Connections
            {pendingConns.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center border-2 border-[#07101f]">
                {pendingConns.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Mesh Canvas ── */}
      <div className="relative flex-1 overflow-hidden cursor-move">
        <svg className="w-full h-full touch-none" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
          {/* Edges */}
          {visibleEdges.map((edge, i) => {
            const p1 = pos(edge.from);
            const p2 = pos(edge.to);
            return (
              <MotionLine key={`e-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={edge.color} strokeWidth={1} strokeOpacity={edge.opacity * (hasEntered ? 1 : 0)} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: i * 0.02 }} />
            );
          })}

          {/* Background Nodes Layer (Performance optimized) */}
          {visibleNodes.filter(n => n.isBackground).map(n => (
            <circle key={n.id} cx={pos(n.id).x} cy={pos(n.id).y} r={n.r} fill={n.color} opacity={0.4} />
          ))}

          {/* Interactive Nodes Layer */}
          {visibleNodes.filter(n => !n.isBackground).map((node) => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode?.id === node.id;
            const p = pos(node.id);

            return (
              <g key={node.id} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)} onClick={() => setSelectedNode(node)} className="cursor-pointer">
                {(isHovered || isSelected) && (
                  <MotionCircle cx={p.x} cy={p.y} r={node.r + 12} fill={node.color} opacity={0.1} initial={{ scale: 0 }} animate={{ scale: 1 }} />
                )}
                <MotionCircle cx={p.x} cy={p.y} r={node.r} fill={node.color} stroke="#fff" strokeWidth={isSelected ? 2 : 0} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: Math.random() * 0.5 }} />
                {!node.dim && (
                  <text x={p.x} y={p.y + node.r + 15} textAnchor="middle" className="text-[10px] font-bold fill-white/80 pointer-events-none tracking-tight">
                    {node.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredNode && !selectedNode && (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute pointer-events-none z-50 bg-[#0c1628]/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl p-3 shadow-2xl shadow-black/50"
              style={{
                left: pos(hoveredNode).x * (window.innerWidth / 1600) + 20,
                top: pos(hoveredNode).y * (window.innerHeight / 1000) - 40
              }}
            >
              <p className="text-xs font-black text-white">{allNodes.find(n => n.id === hoveredNode)?.label}</p>
              <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">{allNodes.find(n => n.id === hoveredNode)?.role}</p>
              {allNodes.find(n => n.id === hoveredNode)?.similarity && (
                <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-white/[0.05]">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span className="text-[9px] font-black text-slate-400">{Math.round(allNodes.find(n => n.id === hoveredNode)!.similarity! * 100)}% Similarity</span>
                </div>
              )}
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* ── Overlay Modal ── */}
        <AnimatePresence>
          {selectedNode && (
            <MotionDiv initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }} className="absolute top-4 right-4 bottom-4 w-80 bg-[#0c1628]/95 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-6 shadow-2xl z-30 flex flex-col overflow-y-auto custom-scrollbar">
              <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-full bg-white/[0.05]"><X className="w-4 h-4" /></button>
              
              <div className="pt-4">
                <div className="w-16 h-16 rounded-[24px] mb-4 flex items-center justify-center text-white text-2xl font-black shadow-lg" style={{ background: selectedNode.color }}>
                  {selectedNode.label?.charAt(0)}
                </div>
                <h2 className="text-xl font-black text-white mb-1">{selectedNode.label}</h2>
                <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-6">{selectedNode.role}</p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-400">
                    <MapPin className="w-4 h-4" /> <span className="text-xs font-medium">{selectedNode.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Users className="w-4 h-4" /> <span className="text-xs font-medium">{selectedNode.connections || 0} Connections</span>
                  </div>
                  <button
                    onClick={() => {
                      // Navigate to the user's public portfolio
                      if (selectedNode.isYou) { navigate('/app/social'); return; }
                      if (selectedNode.userId) {
                        navigate(`/portfolio/${selectedNode.userId}`);
                      } else {
                        toast.info('This mock node has no portfolio.');
                      }
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors group mt-4"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
                      <span className="text-xs font-medium text-slate-300">View Profile</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>

                {/* Compatibility */}
                {selectedNode.similarity && (
                  <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Similarity Index</span>
                      <span className="text-sm font-black text-teal-400">{Math.round(selectedNode.similarity * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                      <MotionDiv initial={{ width: 0 }} animate={{ width: `${selectedNode.similarity * 100}%` }} className="h-full bg-teal-500" />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-5 border-t border-white/[0.05] space-y-2">
                  {selectedNode.isYou ? (
                    <button onClick={() => navigate('/app/social')} className="w-full py-2.5 rounded-[50px] bg-white/[0.06] border border-white/[0.08] text-slate-300 text-xs font-medium transition-colors hover:bg-white/[0.10]">
                      My Social Activity
                    </button>
                  ) : connectionStates[selectedNode.id] === 'accepted' ? (
                    <button
                      onClick={() => setDisconnectTarget(selectedNode)}
                      className="w-full py-2.5 rounded-[50px] bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <UserMinus className="w-3.5 h-3.5" /> Disconnect
                    </button>
                  ) : connectionStates[selectedNode.id] === 'pending' ? (
                    <div className="w-full py-2.5 rounded-[50px] bg-amber-500/10 border border-amber-500/20 text-amber-400 text-center text-xs font-medium">Request Pending</div>
                  ) : (
                    <button
                      onClick={() => handleConnect(selectedNode.id)}
                      disabled={connectingId === selectedNode.id}
                      className="w-full py-2.5 rounded-[50px] bg-teal-500 hover:bg-teal-400 text-white text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {connectingId === selectedNode.id
                        ? 'Sending…'
                        : <><UserPlus className="w-3.5 h-3.5" /> Connect</>}
                    </button>
                  )}
                </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* ── Status Bar ── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full bg-[#0c1628]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Mesh</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">Active Nodes:</span>
            <span className="text-[10px] font-black text-teal-400">{allNodes.filter(n => !n.isBackground).length.toLocaleString()}</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">Your Cluster:</span>
            <span className="text-[10px] font-black text-teal-400">{allNodes.filter(n => n.similarity && n.similarity > 0.8).length} Nodes</span>
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="absolute bottom-6 right-6 hidden md:block p-4 rounded-3xl bg-[#0c1628]/60 backdrop-blur-sm border border-white/[0.05]">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Mesh Depth</p>
           <div className="space-y-2">
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500" /><span className="text-[9px] font-bold text-slate-400">Primary Hubs</span></div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-600" /><span className="text-[9px] font-bold text-slate-400">Distant Clusters</span></div>
           </div>
        </div>
      </div>

      {/* ── Pending Connections Drawer ── */}
      <AnimatePresence>
        {showPending && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPending(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <MotionDiv
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm bg-[#0c1628] border-l border-white/10 h-full flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Network Requests</h3>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manage your connections</p>
                </div>
                <button onClick={() => setShowPending(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {pendingConns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-white/[0.03] flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-slate-700" />
                    </div>
                    <p className="text-sm font-semibold text-slate-400">No pending requests</p>
                    <p className="text-xs text-slate-600 mt-1">Connect with nodes in the mesh to grow your network.</p>
                  </div>
                ) : (
                  pendingConns.map((conn) => (
                    <div key={conn.connectionId} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                          {conn.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{conn.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{conn.role} · {conn.location}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(conn.connectionId, conn.id)}
                          className="flex-1 py-2 rounded-[50px] bg-teal-500 hover:bg-teal-400 text-slate-900 text-[11px] font-black transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await socialService.rejectConnect(conn.connectionId);
                              setPendingConns(prev => prev.filter(c => c.connectionId !== conn.connectionId));
                              toast.success('Request declined');
                            } catch { toast.error('Could not decline.'); }
                          }}
                          className="px-4 py-2 rounded-[50px] border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 text-[11px] font-bold transition-all"
                        >
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
  );
};

export default MeshPage;
