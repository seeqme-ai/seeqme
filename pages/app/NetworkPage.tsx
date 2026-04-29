import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { socialService } from '@/services/apiService';
import { toast } from 'sonner';
import {
  ArrowLeft, Search, UserPlus, Users, MapPin,
  Briefcase, Network, Check, X, Clock
} from 'lucide-react';
import { NetworkSkeleton } from '@/components/Skeletons';

const MotionDiv = motion.div as any;

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

/* ── High-fidelity mock data ── shown while server data loads / as background mesh */
const MOCK_CONNECTIONS: Connection[] = [
  { id: 'ada',    connectionId: 'mock-1', name: 'Ada Okonkwo',    role: 'Senior Designer',    location: 'Lagos, NG',     avatar: '#8b5cf6', status: 'connected',  similarity: 89, skills: ['Figma', 'React', 'CSS'] },
  { id: 'tunde',  connectionId: 'mock-2', name: 'Tunde Kareem',   role: 'Product Manager',    location: 'Abuja, NG',     avatar: '#0ea5e9', status: 'suggested',  similarity: 74, skills: ['Roadmapping', 'SQL', 'OKRs'] },
  { id: 'chioma', connectionId: 'mock-3', name: 'Chioma Ikenna',  role: 'Frontend Developer', location: 'Accra, GH',     avatar: '#14b8a6', status: 'connected',  similarity: 71, skills: ['Vue', 'TypeScript'] },
  { id: 'yemi',   connectionId: 'mock-4', name: 'Yemi Adeyemi',   role: 'Startup Founder',    location: 'London, UK',    avatar: '#f59e0b', status: 'suggested',  similarity: 63, skills: ['Strategy', 'Fundraising'] },
  { id: 'kemi',   connectionId: 'mock-5', name: 'Kemi Lawson',    role: 'Data Scientist',     location: 'Berlin, DE',    avatar: '#0ea5e9', status: 'suggested',  similarity: 68, skills: ['Python', 'ML', 'SQL'] },
  { id: 'emeka',  connectionId: 'mock-6', name: 'Emeka Okafor',   role: 'UX Designer',        location: 'New York, US',  avatar: '#14b8a6', status: 'connected',  similarity: 59, skills: ['Figma', 'Framer', 'Research'] },
  { id: 'aisha',  connectionId: 'mock-7', name: 'Aisha Mohammed', role: 'Backend Engineer',   location: 'Nairobi, KE',   avatar: '#8b5cf6', status: 'suggested',  similarity: 66, skills: ['Go', 'Postgres', 'Redis'] },
  { id: 'james',  connectionId: 'mock-8', name: 'James Osei',     role: 'Cloud Architect',    location: 'Toronto, CA',   avatar: '#f97316', status: 'suggested',  similarity: 55, skills: ['AWS', 'Terraform', 'k8s'] },
];

const NetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'suggested'>('all');

  const [accepted, setAccepted] = useState<Connection[]>(MOCK_CONNECTIONS);
  const [received, setReceived] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const res = await socialService.getConnections();
      const serverAccepted: Connection[] = (res?.accepted || []).map((c: any) => ({
        id: c.id,
        connectionId: c.connectionId,
        name: c.name || 'Unknown',
        role: c.role || 'Member',
        location: c.location || '',
        avatar: c.avatar || '#14b8a6',
        status: 'connected' as const,
        similarity: c.similarity || 50,
        skills: c.skills || [],
      }));
      const serverReceived: Connection[] = (res?.received || []).map((c: any) => ({
        id: c.id,
        connectionId: c.connectionId,
        name: c.name || 'Unknown',
        role: c.role || 'Member',
        location: c.location || '',
        avatar: c.avatar || '#8b5cf6',
        status: 'pending' as const,
        similarity: c.similarity || 50,
        skills: c.skills || [],
      }));

      // Merge: real server data prepends and deduplicates mock data
      const serverIds = new Set(serverAccepted.map(c => c.id));
      const merged = [...serverAccepted, ...MOCK_CONNECTIONS.filter(m => !serverIds.has(m.id))];
      setAccepted(merged);
      setReceived(serverReceived);
    } catch (e) {
      console.error(e);
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConnections(); }, []);

  const handleAccept = async (connId: string) => {
    try {
      await socialService.acceptConnect(connId);
      toast.success('Connection accepted');
      fetchConnections();
    } catch { toast.error('Could not accept connection'); }
  };

  const handleReject = async (connId: string) => {
    try {
      await socialService.rejectConnect(connId);
      toast.success('Request declined');
      fetchConnections();
    } catch { toast.error('Could not decline request'); }
  };

  const handleConnect = async (userId: string) => {
    try {
      await socialService.sendConnectRequest(userId);
      toast.success('Request sent');
      fetchConnections();
    } catch { toast.error('Could not send request'); }
  };

  const filtered = useMemo(() => {
    let list = [...accepted];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }
    if (statusFilter === 'suggested') list = list.filter(c => c.status === 'suggested');
    if (statusFilter === 'connected') list = list.filter(c => c.status === 'connected' || (c.status as any) === 'accepted');
    return list;
  }, [accepted, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-medium text-slate-900">Network</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/mesh')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[50px] border border-slate-200 text-slate-600 text-xs font-medium hover:border-teal-400 hover:text-teal-600 transition-colors"
          >
            <Network className="w-3.5 h-3.5" />
            Mesh view
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Pending Invitations */}
        <AnimatePresence>
          {received.length > 0 && (
            <MotionDiv initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-medium uppercase tracking-[0.6px] text-slate-500" style={{ fontFamily: 'monospace' }}>
                  Pending Invitations
                </span>
                <span className="ml-1 px-2 py-0.5 rounded-[50px] bg-amber-50 border border-amber-200 text-[11px] text-amber-700">{received.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {received.map(r => (
                  <div key={r.id} className="bg-white border border-amber-100 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: r.avatar }}>
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{r.name}</p>
                        <p className="text-[11px] text-slate-400">{r.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(r.connectionId!)} className="p-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleReject(r.connectionId!)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-teal-400 focus:ring-2 focus:ring-teal-400/10 outline-none transition-all"
            />
          </div>
          <div className="flex gap-1 border-b border-slate-200">
            {(['all', 'connected', 'suggested'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'text-slate-900 border-b-2 border-slate-900 -mb-px' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <NetworkSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((c, i) => (
              <MotionDiv
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col items-center text-center mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-semibold mb-3"
                    style={{ background: c.avatar }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <Briefcase className="w-3 h-3" />
                    {c.role}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {c.location}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-teal-600 font-medium">{c.similarity}% match</span>
                  {c.status === 'suggested' ? (
                    <button onClick={() => handleConnect(c.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[50px] bg-slate-900 hover:bg-black text-white text-xs font-medium transition-colors">
                      <UserPlus className="w-3.5 h-3.5" />
                      Connect
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-teal-500">
                      <Check className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  )}
                </div>
              </MotionDiv>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="col-span-full text-center py-16">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">No connections found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;
