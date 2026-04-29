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
  AlertTriangle, UserMinus, TrendingUp, Eye,
} from 'lucide-react';

const Mv = motion.div as any;

type Tab = 'posts' | 'saved' | 'connections';

/* ─── tiny sub-components ─── */
const StatCard = ({ icon, label, value, loading }: any) => (
  <div className="bg-white border border-slate-200 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[11px] text-slate-400">{label}</span></div>
    <p className="text-2xl font-semibold text-slate-900">{loading ? '–' : value}</p>
  </div>
);

const EmptyState = ({ icon, text, cta, onCta }: any) => (
  <div className="text-center py-16 border border-dashed border-slate-200 rounded-lg bg-white">
    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">{icon}</div>
    <p className="text-sm text-slate-400 mb-4">{text}</p>
    <button onClick={onCta} className="px-5 py-2 rounded-[50px] bg-slate-900 text-white text-xs font-medium hover:bg-black transition-colors">{cta}</button>
  </div>
);

/* ─── Delete confirmation modal ─── */
const DeleteModal = ({ show, onConfirm, onCancel, busy }: any) => (
  <AnimatePresence>
    {show && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <Mv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <Mv initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-lg border border-slate-200 p-6 w-full max-w-xs" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Delete post?</p>
          </div>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">This will permanently remove the post and all its comments. This cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={onCancel} disabled={busy} className="flex-1 py-2 rounded-[50px] border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={onConfirm} disabled={busy} className="flex-1 py-2 rounded-[50px] bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Mv>
      </div>
    )}
  </AnimatePresence>
);

/* ─── Inline edit textarea ─── */
const EditablePost = ({ post, onSave, onCancel, saving }: any) => {
  const [val, setVal] = useState(post.content);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="space-y-2">
      <textarea ref={ref} value={val} onChange={e => setVal(e.target.value)}
        className="w-full text-sm text-slate-700 leading-relaxed border border-teal-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400/20 resize-none"
        rows={4} />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 rounded-[50px] border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors">
          <X className="w-3 h-3" /> Cancel
        </button>
        <button onClick={() => onSave(val)} disabled={saving || !val.trim()} className="flex items-center gap-1 px-3 py-1.5 rounded-[50px] bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const UserSocialDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Unsave state
  const [unsaving, setUnsaving] = useState<string | null>(null);

  // Remove connection state
  const [removeConnTarget, setRemoveConnTarget] = useState<any | null>(null);
  const [removingConn, setRemovingConn] = useState(false);

  const totalLikes   = myPosts.reduce((s, p) => s + (p.likes || 0), 0);
  const totalComments = myPosts.reduce((s, p) => s + (p.comments?.length || 0), 0);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [feedRes, connRes] = await Promise.all([
          socialService.getFeed(),
          socialService.getConnections(),
        ]);
        const all: any[] = feedRes?.posts || [];
        setMyPosts(all.filter(p => p.authorId === user.id));
        setSavedPosts(all.filter(p => Array.isArray(p.savedBy) && p.savedBy.includes(user.id)));
        setConnections(connRes?.accepted || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, [user?.id]);

  /* ── handlers ── */
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
      // unsave = save toggle — backend uses addToSet so call save again removes nothing, we just remove locally
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
    { id: 'posts' as Tab,       label: 'My Posts',     icon: <FileText className="w-3.5 h-3.5" />,  count: myPosts.length },
    { id: 'saved' as Tab,       label: 'Saved',        icon: <Bookmark className="w-3.5 h-3.5" />,   count: savedPosts.length },
    { id: 'connections' as Tab, label: 'Connections',  icon: <Users className="w-3.5 h-3.5" />,      count: connections.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Delete confirmation */}
      <DeleteModal show={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} busy={deleting} />

      {/* Remove connection modal */}
      <AnimatePresence>
        {removeConnTarget && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <Mv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRemoveConnTarget(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <Mv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg border border-slate-200 p-6 w-full max-w-xs" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <UserMinus className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Remove connection?</p>
                  <p className="text-[11px] text-slate-400">{removeConnTarget.name}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">You'll both be removed from each other's network. You can reconnect anytime.</p>
              <div className="flex gap-2">
                <button onClick={() => setRemoveConnTarget(null)} className="flex-1 py-2 rounded-[50px] border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50">Cancel</button>
                <button onClick={handleRemoveConnection} disabled={removingConn}
                  className="flex-1 py-2 rounded-[50px] bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors">
                  {removingConn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                  {removingConn ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </Mv>
          </div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.fullName?.charAt(0) || 'Y'}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 leading-none">{user?.fullName || 'My Profile'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Social activity</p>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/app/feed')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[50px] bg-slate-900 hover:bg-black text-white text-xs font-medium transition-colors">
            <Network className="w-3.5 h-3.5" /> Open Feed
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<FileText className="w-4 h-4 text-teal-500" />}    label="Posts"       value={myPosts.length}    loading={loading} />
          <StatCard icon={<Heart className="w-4 h-4 text-rose-400" />}       label="Total Likes" value={totalLikes}         loading={loading} />
          <StatCard icon={<MessageSquare className="w-4 h-4 text-blue-500" />} label="Comments"  value={totalComments}      loading={loading} />
          <StatCard icon={<Users className="w-4 h-4 text-violet-500" />}     label="Connections" value={connections.length} loading={loading} />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}>
              {tab.icon}{tab.label}
              {tab.count > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-[50px] bg-slate-100 text-slate-500 text-[10px]">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">

          {/* ── Loading ── */}
          {loading && (
            <Mv key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded w-24 mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
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
                    className="bg-white border border-slate-200 rounded-lg p-5 group">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        {post.timestamp || post.time || 'Recently'}
                        {post.tag && <span className="px-2 py-0.5 rounded-[50px] border border-slate-100 text-slate-400 text-[10px]">{post.tag}</span>}
                      </div>
                      {/* Action buttons — show on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

                    {/* Content — editable or display */}
                    {editingId === post.id ? (
                      <EditablePost post={post} saving={savingId === post.id}
                        onSave={(val: string) => handleSaveEdit(post.id, val)}
                        onCancel={() => setEditingId(null)} />
                    ) : (
                      <p onClick={() => navigate(`/app/feed/post/${post.slug}`)}
                        className="text-sm text-slate-700 leading-relaxed cursor-pointer hover:text-slate-900 transition-colors mb-4 line-clamp-4">
                        {post.content}
                      </p>
                    )}

                    {/* Engagement footer */}
                    {editingId !== post.id && (
                      <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Heart className="w-3.5 h-3.5" /> {post.likes || 0}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <MessageSquare className="w-3.5 h-3.5" /> {post.comments?.length || 0}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Share2 className="w-3.5 h-3.5" /> {post.reposts || 0}
                        </span>
                        <button onClick={() => navigate(`/app/feed/post/${post.slug}`)}
                          className="ml-auto flex items-center gap-1 text-[11px] text-teal-600 hover:text-teal-700 transition-colors">
                          View <ChevronRight className="w-3 h-3" />
                        </button>
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
                    className="bg-white border border-slate-200 rounded-lg p-5 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold" style={{ background: post.avatar || '#8b5cf6' }}>
                          {post.author?.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-slate-700">{post.author}</span>
                        <span className="text-[11px] text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400">{post.time}</span>
                      </div>
                      <button onClick={() => handleUnsave(post.id)} disabled={unsaving === post.id}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-[50px] border border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500 text-[11px] transition-all">
                        {unsaving === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Unsave
                      </button>
                    </div>
                    <p onClick={() => navigate(`/app/feed/post/${post.slug}`)}
                      className="text-sm text-slate-700 leading-relaxed cursor-pointer hover:text-slate-900 transition-colors mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {post.comments?.length || 0}</span>
                      <button onClick={() => navigate(`/app/feed/post/${post.slug}`)}
                        className="ml-auto flex items-center gap-1 text-teal-600 hover:text-teal-700 transition-colors">
                        View <ChevronRight className="w-3 h-3" />
                      </button>
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
                    className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                        style={{ background: typeof c.avatar === 'string' && c.avatar.startsWith('#') ? c.avatar : '#14b8a6' }}>
                        {c.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-400">{c.role}{c.location ? ` · ${c.location}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.similarity && <span className="text-[11px] text-teal-600 hidden sm:block">{c.similarity}% match</span>}
                      <button onClick={() => setRemoveConnTarget(c)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-[50px] border border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500 text-[11px] transition-all">
                        <UserMinus className="w-3 h-3" /> Remove
                      </button>
                      <button onClick={() => navigate('/app/mesh')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
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
