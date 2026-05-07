import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { socialService } from '@/services/apiService';
import { toast } from 'sonner';
import {
  ArrowLeft, FileText, Bookmark, Users, Heart,
  MessageSquare, Share2, Trash2, Network, Edit3,
  Clock, ChevronRight, Check, X, Loader2,
  AlertTriangle, UserMinus, Eye,
} from 'lucide-react';

const Mv = motion.div as any;

type Tab = 'posts' | 'saved' | 'connections';


/* ── Sub-components ── */
const StatCard = ({ icon, label, value, loading, accent = 'teal' }: any) => {
  const accents: Record<string, string> = {
    teal: 'bg-teal-50 border-teal-100',
    rose: 'bg-rose-50 border-rose-100',
    blue: 'bg-blue-50 border-blue-100',
    violet: 'bg-violet-50 border-violet-100',
  };
  return (
    <div className={`border rounded-xl p-4 ${accents[accent] || accents.teal}`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">{icon}<span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span></div>
      {loading
        ? <div className="h-7 w-12 bg-slate-200 rounded animate-pulse" />
        : <p className="text-2xl font-bold text-slate-900">{value}</p>}
    </div>
  );
};

const EmptyState = ({ icon, text, cta, onCta }: any) => (
  <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-white">
    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">{icon}</div>
    <p className="text-sm font-medium text-slate-400 mb-5">{text}</p>
    <button onClick={onCta} className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors">{cta}</button>
  </div>
);

const DeleteModal = ({ show, onConfirm, onCancel, busy }: any) => (
  <AnimatePresence>
    {show && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <Mv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <Mv initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-xs shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-sm font-bold text-slate-900">Delete post?</p>
          </div>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">This will permanently remove the post and all its comments. This cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={onCancel} disabled={busy} className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={onConfirm} disabled={busy} className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Mv>
      </div>
    )}
  </AnimatePresence>
);

const EditablePost = ({ post, onSave, onCancel, saving }: any) => {
  const [val, setVal] = useState(post.content);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="space-y-2">
      <textarea ref={ref} value={val} onChange={e => setVal(e.target.value)}
        className="w-full text-sm text-slate-700 leading-relaxed border border-teal-400 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400/20 resize-none"
        rows={4} />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
          <X className="w-3 h-3" /> Cancel
        </button>
        <button onClick={() => onSave(val)} disabled={saving || !val.trim()} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

/* ── Main Component ── */
const UserSocialDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [unsaving, setUnsaving] = useState<string | null>(null);
  const [removeConnTarget, setRemoveConnTarget] = useState<any | null>(null);
  const [removingConn, setRemovingConn] = useState(false);

  const totalLikes = myPosts.reduce((s, p) => s + (p.likes || 0), 0);
  const totalComments = myPosts.reduce((s, p) => s + (p.comments?.length || 0), 0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [myPostsRes, savedRes, connRes] = await Promise.all([
          socialService.getMyPosts().catch(() => null),
          socialService.getSavedPosts().catch(() => null),
          socialService.getConnections().catch(() => null),
        ]);
        const mp: any[] = myPostsRes?.posts || [];
        const sp: any[] = savedRes?.posts || [];
        setMyPosts(mp);
        setSavedPosts(sp);
        setConnections(connRes?.accepted || []);
      } catch {
        setMyPosts([]);
        setSavedPosts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  /* ── Handlers ── */
  const handleSaveEdit = async (postId: string, content: string) => {
    setSavingId(postId);
    try {
      await socialService.updatePost(postId, content);
      setMyPosts(prev => prev.map(p => p.id === postId ? { ...p, content } : p));
      setEditingId(null);
      toast.success('Post updated');
    } catch { toast.error('Could not update post'); }
    finally { setSavingId(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await socialService.deletePost(deleteTarget);
      setMyPosts(prev => prev.filter(p => p.id !== deleteTarget));
      setDeleteTarget(null);
      toast.success('Post deleted');
    } catch { toast.error('Could not delete post'); }
    finally { setDeleting(false); }
  };

  const handleUnsave = async (postId: string) => {
    setUnsaving(postId);
    try {
      await socialService.savePost(postId); // Toggle off
      setSavedPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Removed from saved');
    } catch { toast.error('Could not unsave'); }
    finally { setUnsaving(null); }
  };

  const handleRemoveConnection = async () => {
    if (!removeConnTarget?.connectionId) return;
    setRemovingConn(true);
    try {
      await socialService.rejectConnect(removeConnTarget.connectionId);
      setConnections(prev => prev.filter(c => c.id !== removeConnTarget.id));
      setRemoveConnTarget(null);
      toast.success('Connection removed');
    } catch { toast.error('Could not remove connection'); }
    finally { setRemovingConn(false); }
  };

  const TABS = [
    { id: 'posts' as Tab, label: 'My Posts', icon: <FileText className="w-3.5 h-3.5" />, count: myPosts.length },
    { id: 'saved' as Tab, label: 'Saved', icon: <Bookmark className="w-3.5 h-3.5" />, count: savedPosts.length },
    { id: 'connections' as Tab, label: 'Connections', icon: <Users className="w-3.5 h-3.5" />, count: connections.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <DeleteModal show={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} busy={deleting} />

      {/* Remove connection modal */}
      <AnimatePresence>
        {removeConnTarget && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <Mv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRemoveConnTarget(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <Mv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-xs shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <UserMinus className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Remove connection?</p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{removeConnTarget.name}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">You'll both be removed from each other's network. You can reconnect anytime.</p>
              <div className="flex gap-2">
                <button onClick={() => setRemoveConnTarget(null)} className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleRemoveConnection} disabled={removingConn}
                  className="flex-1 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors">
                  {removingConn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                  {removingConn ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </Mv>
          </div>
        )}
      </AnimatePresence>

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 shrink-0" />
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user?.fullName?.charAt(0) || 'Y'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-none truncate max-w-[140px] sm:max-w-none">{user?.fullName || 'My Profile'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Social activity</p>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/app/feed')}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors shrink-0">
            <Network className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Open Feed</span>
            <span className="sm:hidden">Feed</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<FileText className="w-4 h-4 text-teal-600" />} label="Posts" value={myPosts.length} loading={loading} accent="teal" />
          <StatCard icon={<Heart className="w-4 h-4 text-rose-500" />} label="Likes" value={totalLikes} loading={loading} accent="rose" />
          <StatCard icon={<MessageSquare className="w-4 h-4 text-blue-500" />} label="Comments" value={totalComments} loading={loading} accent="blue" />
          <StatCard icon={<Users className="w-4 h-4 text-violet-500" />} label="Connections" value={connections.length} loading={loading} accent="violet" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs font-semibold transition-all border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-teal-600 border-teal-500 bg-teal-50/50'
                  : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50/30'
              }`}>
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">

          {loading && (
            <Mv key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded-full w-28 mb-4" />
                  <div className="h-4 bg-slate-100 rounded-full w-full mb-2" />
                  <div className="h-4 bg-slate-100 rounded-full w-3/4 mb-2" />
                  <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                </div>
              ))}
            </Mv>
          )}

          {/* ── My Posts ── */}
          {!loading && activeTab === 'posts' && (
            <Mv key="posts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {myPosts.length === 0
                ? <EmptyState icon={<FileText className="w-5 h-5 text-slate-300" />} text="You haven't posted anything yet." cta="Create a post" onCta={() => navigate('/app/feed')} />
                : myPosts.map((post, i) => (
                  <Mv key={post.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{post.timestamp || post.time || 'Recently'}</span>
                        {post.tag && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">{post.tag}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                        {editingId !== post.id && (
                          <button onClick={() => setEditingId(post.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors" title="Edit">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => setDeleteTarget(post.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {editingId === post.id ? (
                      <EditablePost post={post} saving={savingId === post.id}
                        onSave={(val: string) => handleSaveEdit(post.id, val)}
                        onCancel={() => setEditingId(null)} />
                    ) : (
                      <p onClick={() => post.slug && navigate(`/app/feed/post/${post.slug}`)}
                        className="text-sm text-slate-700 leading-relaxed cursor-pointer hover:text-slate-900 transition-colors mb-4 line-clamp-4">
                        {post.content}
                      </p>
                    )}

                    {editingId !== post.id && (
                      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Heart className="w-3.5 h-3.5" /> {post.likes || 0}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <MessageSquare className="w-3.5 h-3.5" /> {post.comments?.length || 0}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Share2 className="w-3.5 h-3.5" /> {post.reposts || 0}
                        </span>
                        {post.slug && (
                          <button onClick={() => navigate(`/app/feed/post/${post.slug}`)}
                            className="ml-auto flex items-center gap-1 text-[11px] text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        )}
                      </div>
                    )}
                  </Mv>
                ))
              }
            </Mv>
          )}

          {/* ── Saved Posts ── */}
          {!loading && activeTab === 'saved' && (
            <Mv key="saved" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {savedPosts.length === 0
                ? <EmptyState icon={<Bookmark className="w-5 h-5 text-slate-300" />} text="No saved posts yet." cta="Browse the feed" onCta={() => navigate('/app/feed')} />
                : savedPosts.map((post, i) => (
                  <Mv key={post.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">

                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {post.author && (
                          <>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: post.avatar || '#8b5cf6' }}>
                              {post.author?.charAt(0)}
                            </div>
                            <span className="text-xs font-semibold text-slate-700 truncate">{post.author}</span>
                            <span className="text-[11px] text-slate-300 shrink-0">·</span>
                          </>
                        )}
                        <span className="text-[11px] text-slate-400 shrink-0">{post.time}</span>
                        {post.tag && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-semibold hidden sm:block">{post.tag}</span>
                        )}
                      </div>
                      <button onClick={() => handleUnsave(post.id)} disabled={unsaving === post.id}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500 text-[11px] font-semibold transition-all shrink-0">
                        {unsaving === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                        <span>Unsave</span>
                      </button>
                    </div>

                    <p onClick={() => post.slug && navigate(`/app/feed/post/${post.slug}`)}
                      className="text-sm text-slate-700 leading-relaxed cursor-pointer hover:text-slate-900 transition-colors mb-3 line-clamp-3">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {post.likes || 0}</span>
                      <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {post.comments?.length || 0}</span>
                      {post.slug && (
                        <button onClick={() => navigate(`/app/feed/post/${post.slug}`)}
                          className="ml-auto flex items-center gap-1 text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </Mv>
                ))
              }
            </Mv>
          )}

          {/* ── Connections ── */}
          {!loading && activeTab === 'connections' && (
            <Mv key="connections" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              {connections.length === 0
                ? <EmptyState icon={<Users className="w-5 h-5 text-slate-300" />} text="No connections yet." cta="Explore the mesh" onCta={() => navigate('/app/mesh')} />
                : connections.map((c, i) => (
                  <Mv key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: typeof c.avatar === 'string' && c.avatar.startsWith('#') ? c.avatar : '#14b8a6' }}>
                        {c.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{c.role}{c.location ? ` · ${c.location}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {c.similarity && (
                        <span className="text-[11px] font-semibold text-teal-600 hidden sm:block">{c.similarity}% match</span>
                      )}
                      <button onClick={() => setRemoveConnTarget(c)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-full border border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500 text-[11px] font-semibold transition-all">
                        <UserMinus className="w-3 h-3" />
                        <span className="hidden sm:block">Remove</span>
                      </button>
                      <button onClick={() => navigate('/app/mesh')}
                        className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </Mv>
                ))
              }
            </Mv>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserSocialDashboard;
