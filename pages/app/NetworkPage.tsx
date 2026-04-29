import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { socialService } from '@/services/apiService';
import { toast } from 'sonner';
import {
  ArrowLeft, Search, UserPlus, Users, MapPin, 
  Briefcase, Network, Filter, Check, X, Clock
} from 'lucide-react';

const MotionDiv = motion.div as any;

/* ── Types ── */
interface Connection {
  id: string;
  connectionId?: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  status: 'connected' | 'pending' | 'suggested';
  similarity: number;
  skills: string[];
}

const ALL_CONNECTIONS: Connection[] = [
  { id: 'ada', name: 'Ada Okonkwo', role: 'Senior Designer', location: 'Lagos, NG', avatar: '#8b5cf6', status: 'connected', similarity: 89, skills: ['Figma', 'UI/UX'] },
  { id: 'tunde', name: 'Tunde Kayode', role: 'Product Manager', location: 'Abuja, NG', avatar: '#0ea5e9', status: 'connected', similarity: 74, skills: ['Agile', 'SQL'] },
  { id: 'chioma', name: 'Chioma Ike', role: 'Frontend Dev', location: 'Enugu, NG', avatar: '#14b8a6', status: 'suggested', similarity: 71, skills: ['React', 'Vue'] },
  { id: 'bisi', name: 'Bisi Ade', role: 'Backend Dev', location: 'Ibadan, NG', avatar: '#f43f5e', status: 'suggested', similarity: 64, skills: ['Go', 'Node'] },
];

const NetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery]   = useState('');
  const [skillFilter, setSkillFilter]   = useState('All skills');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'suggested'>('all');
  const [sortBy, setSortBy]             = useState<'similarity' | 'connections'>('similarity');
  
  const [accepted, setAccepted] = useState<Connection[]>([]);
  const [received, setReceived] = useState<Connection[]>([]);
  const [sent, setSent]         = useState<Connection[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetchConnections = async () => {
    try {
      const res = await socialService.getConnections();
      setAccepted(res?.accepted || []);
      setReceived(res?.received || []);
      setSent(res?.sent || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleAccept = async (connId: string) => {
    try {
      await socialService.acceptConnect(connId);
      toast.success('Connection accepted!');
      fetchConnections();
    } catch { toast.error('Could not accept connection'); }
  };

  const handleReject = async (connId: string) => {
    try {
      await socialService.rejectConnect(connId);
      toast.success('Connection declined');
      fetchConnections();
    } catch { toast.error('Could not reject request'); }
  };

  const handleConnect = async (userId: string) => {
    try {
      await socialService.sendConnectRequest(userId);
      toast.success('Connection request sent!');
      fetchConnections();
    } catch { toast.error('Could not send request'); }
  };

  const filtered = useMemo(() => {
    // Merge server accepted with mock
    const ids = new Set(accepted.map(a => a.id));
    let list = [...accepted, ...ALL_CONNECTIONS.filter(c => !ids.has(c.id))];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }
    if (statusFilter === 'connected')  list = list.filter(c => c.status === 'connected' || c.status === 'accepted' as any);
    if (statusFilter === 'suggested')  list = list.filter(c => c.status === 'suggested');
    
    return list;
  }, [accepted, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors text-xs font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-bold text-slate-900 tracking-tight">Network</span>
            </div>
          </div>
          <button onClick={() => navigate('/app/mesh')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 text-[11px] font-bold hover:bg-teal-100 transition-colors">
            <Network className="w-3.5 h-3.5" />
            Mesh view
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* ── Pending Invitations ── */}
        <AnimatePresence>
          {received.length > 0 && (
            <MotionDiv initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="mb-10">
              <div className="flex items-center gap-2 mb-4 px-1">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Pending Invitations</h2>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">{received.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {received.map(r => (
                  <div key={r.id} className="bg-white border border-amber-100 rounded-3xl p-4 flex items-center justify-between shadow-sm ring-1 ring-amber-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black" style={{ background: r.avatar }}>
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{r.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{r.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(r.connectionId!)} className="p-2 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all shadow-lg shadow-teal-100">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleReject(r.connectionId!)} className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* ── Controls ── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-teal-400 focus:ring-4 focus:ring-teal-400/5 outline-none transition-all"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1">
            {(['all', 'connected', 'suggested'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${statusFilter === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* ── Connections Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((c, i) => (
            <MotionDiv
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-[24px] flex items-center justify-center text-white text-xl font-black shadow-lg mx-auto transform group-hover:scale-110 transition-transform duration-300"
                  style={{ background: c.avatar }}
                >
                  {c.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 text-teal-500" />
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-base font-bold text-slate-900 mb-1">{c.name}</p>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Briefcase className="w-3 h-3" />
                  {c.role}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  <MapPin className="w-3 h-3" />
                  {c.location}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-[10px] font-bold text-teal-600 border border-teal-100">
                  <Network className="w-3 h-3" />
                  {c.similarity}% Match
                </div>
                {c.status === 'suggested' ? (
                  <button onClick={() => handleConnect(c.id)} className="p-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white transition-all shadow-lg shadow-slate-200 active:scale-95">
                    <UserPlus className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-2.5 rounded-2xl bg-slate-50 text-slate-300 border border-slate-100">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            </MotionDiv>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-slate-400">No nodes found in your filtered mesh.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;
