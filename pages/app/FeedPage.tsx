import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { socialService } from '@/services/apiService';
import { toast } from 'sonner';
import {
  ArrowLeft, Send, Heart, MessageSquare, Share2,
  Network, TrendingUp, MoreHorizontal, Image as ImageIcon,
  Link as LinkIcon, ChevronRight, Bookmark, Trash2, Copy, Share,
  X, Check, ExternalLink, Bell, Edit3, Reply
} from 'lucide-react';
import { cloudinaryService } from '@/services/cloudinaryService';
import { socketService } from '@/services/socketService';
import { PostSkeleton, ImageSkeleton } from '@/components/Skeletons';

const MotionDiv = motion.div as any;

/* ── Types ── */
interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  authorId: string;
  originalPostId?: string;
  author: string;
  role: string;
  location: string;
  avatar: string;
  similarity: number;
  content: string;
  tag?: string;
  media?: string;
  link?: string;
  linkPreview?: {
    url: string;
    title: string;
    description: string;
    image: string;
    siteName: string;
  };
  likes: number;
  comments: Comment[];
  reposts: number;
  time: string;
  slug: string;
  liked?: boolean;
  savedBy?: string[];
  repostedBy?: string; // Virtual for UI
}

const CATEGORIES = ['Opinion', 'Case Study', 'Engineering', 'Startup', 'Design', 'Product', 'News'];

const REALISTIC_POSTS: Post[] = [
  {
    id: 'm1',
    authorId: 'a1',
    author: 'Sarah Chen',
    role: 'Principal Design Engineer',
    location: 'Singapore',
    avatar: '#8b5cf6',
    similarity: 94,
    content: "Just finished refactoring our design system's token architecture. Moving from static variables to a multi-tiered semantic system has reduced our UI debt by nearly 40%. The key was establishing a 'base -> semantic -> component' flow that designers actually enjoy using in Figma. \n\nHas anyone else experimented with automated token syncing between Figma and Style Dictionary recently?",
    tag: 'Design',
    likes: 124,
    comments: [],
    reposts: 12,
    time: '2h ago',
    slug: 'sarah-chen-design-tokens'
  },
  {
    id: 'm2',
    authorId: 'a2',
    author: 'Marcus Thorne',
    role: 'Product Lead @ SeeqMe',
    location: 'London',
    avatar: '#0ea5e9',
    similarity: 88,
    content: "The future of networking isn't about having 500+ connections; it's about the density of your professional cluster. We're seeing that users with smaller, high-similarity meshes are 3x more likely to secure high-value partnerships than those with broad, generic networks. \n\nQuality over quantity is finally being mathematically enforced by the Mesh.",
    tag: 'Product',
    likes: 245,
    comments: [],
    reposts: 56,
    time: '5h ago',
    slug: 'marcus-thorne-mesh-density'
  },
  {
    id: 'm3',
    authorId: 'a3',
    author: 'Elena Rodriguez',
    role: 'AI Research Lead',
    location: 'Madrid',
    avatar: '#14b8a6',
    similarity: 72,
    content: "Agentic workflows are completely shifting how we think about IDEs. We're no longer just 'autocompleting' code; we're collaborating with agents that understand the broader architectural context. The next step is better state management for these agents so they can handle multi-file refactors without losing the mental model of the system.",
    tag: 'Engineering',
    likes: 89,
    comments: [],
    reposts: 8,
    time: '8h ago',
    slug: 'elena-rodriguez-agentic-workflows'
  },
  {
    id: 'm4',
    authorId: 'a4',
    author: 'David Okoro',
    role: 'Venture Partner',
    location: 'Lagos',
    avatar: '#f59e0b',
    similarity: 65,
    content: "The tech ecosystem in West Africa is maturing rapidly. We're seeing a shift from simple consumer-facing apps to deep infrastructure solutions in logistics and fintech. The resilience shown by founders in this macro environment is nothing short of incredible. Looking for early-stage teams building the 'rails' for the next decade.",
    tag: 'Startup',
    likes: 167,
    comments: [],
    reposts: 31,
    time: '1d ago',
    slug: 'david-okoro-africa-tech'
  }
];

/* ── Components ── */

const DeleteModal: React.FC<{ isOpen: boolean; onConfirm: () => void; onClose: () => void }> = ({ isOpen, onConfirm, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-lg p-6 w-full max-w-sm border border-slate-200" style={{boxShadow:'0 4px 16px rgba(0,0,0,0.08)'}}>
          <h3 className="text-base font-bold text-slate-900 mb-2">Delete post?</h3>
          <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-[50px] bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-[50px] bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors">Delete</button>
          </div>
        </MotionDiv>
      </div>
    )}
  </AnimatePresence>
);

const LinkPreviewCard: React.FC<{ preview: Post['linkPreview'] }> = ({ preview }) => {
  if (!preview) return null;
  return (
    <a href={preview.url} target="_blank" rel="noopener noreferrer" className="block mb-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 transition-all group">
      {preview.image && (
        <div className="aspect-[1.91/1] w-full overflow-hidden border-b border-slate-100">
          <img src={preview.image} alt={preview.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{preview.siteName || new URL(preview.url).hostname}</p>
        <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{preview.title}</p>
        <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{preview.description}</p>
      </div>
    </a>
  );
};

const ImageWithSkeleton: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
      {!loaded && <ImageSkeleton />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-auto max-h-[450px] object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'}`}
      />
    </div>
  );
};

const PostCard: React.FC<{ post: Post; i: number; onDelete: (id: string) => void }> = ({ post, i, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.savedBy?.includes(user?.id || '') || false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  // Sync local state with prop updates for real-time reactivity
  useEffect(() => {
    setLikeCount(post.likes);
    setComments(post.comments || []);
  }, [post.likes, post.comments]);

  const isOwner = user?.id === post.authorId;

  const toggleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(p => wasLiked ? p - 1 : p + 1);
    try {
      if (wasLiked) await socialService.unlikePost(post.id);
      else await socialService.likePost(post.id);
    } catch { setLiked(wasLiked); setLikeCount(p => wasLiked ? p + 1 : p - 1); }
  };

  const handleRepost = async () => {
    setShowMenu(false);
    try {
      await socialService.repostPost(post.id);
      toast.success('Reposted to your cluster!');
    } catch { toast.error('Could not repost.'); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/app/feed/post/${post.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.author + ' on SeeqMe',
          text: post.content.substring(0, 100),
          url: url,
        });
      } catch { }
    } else {
      copyLink();
    }
  };

  const toggleSave = async () => {
    const wasSaved = saved;
    setSaved(!wasSaved);
    try { await socialService.savePost(post.id); toast.success(wasSaved ? 'Removed from bookmarks' : 'Saved to bookmarks'); }
    catch { setSaved(wasSaved); }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    const content = commentText;
    const tempId = 'temp-c-' + Date.now();
    const optimisticComment: Comment = {
      id: tempId,
      postId: post.id,
      parentId: replyTo?.id || undefined,
      authorId: user?.id || 'you',
      author: user?.fullName || 'You',
      avatar: '#14b8a6',
      content,
      createdAt: 'Just now'
    };

    setComments(prev => [...prev, optimisticComment]);
    setCommentText('');
    setReplyTo(null);

    try {
      const res = await socialService.commentOnPost(post.id, content, replyTo?.id);
      if (res?.comment) {
        setComments(prev => prev.map(c => c.id === tempId ? res.comment : c));
        toast.success('Thought shared');
      }
    } catch { 
      toast.error('Could not add comment'); 
      setComments(prev => prev.filter(c => c.id !== tempId));
      setCommentText(content);
    }
  };

  const handleUpdate = async () => {
    try {
      await socialService.updatePost(post.id, editContent);
      setIsEditing(false);
      post.content = editContent; // Optimistic update
      toast.success('Broadcast updated');
    } catch { toast.error('Update failed'); }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/app/feed/post/${post.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
    setShowMenu(false);
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04, duration: 0.3 }}
      className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
            style={{ background: post.avatar }}
          >
            {post.author.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">{post.author}</p>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 text-teal-600 border border-teal-100 tabular-nums">
                {post.similarity}% match
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{post.role} · {post.location} · {post.time}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-300 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-50"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <MotionDiv initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 top-10 w-44 bg-white border border-slate-200 rounded-lg z-40 p-1 overflow-hidden" style={{boxShadow:'0 4px 16px rgba(0,0,0,0.08)'}}>
                  <button onClick={copyLink} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all">
                    <Copy className="w-4 h-4" /> Copy link
                  </button>
                  <button onClick={handleShare} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all">
                    <Share className="w-4 h-4" /> Share
                  </button>
                  <button onClick={handleRepost} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all">
                    <Share2 className="w-4 h-4" /> Repost
                  </button>
                  {isOwner && (
                    <>
                      <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all">
                        <Edit3 className="w-4 h-4" /> Edit post
                      </button>
                      <button onClick={() => { onDelete(post.id); setShowMenu(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" /> Delete post
                      </button>
                    </>
                  )}
                </MotionDiv>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-medium focus:border-teal-400 outline-none resize-none"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleUpdate} className="px-4 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-sm">Save</button>
            <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-lg">Cancel</button>
          </div>
        </div>
      ) : (
        <p
          onClick={() => navigate(`/app/feed/post/${post.slug}`)}
          className="text-[14px] text-slate-700 font-medium leading-relaxed whitespace-pre-line mb-4 cursor-pointer hover:text-slate-900 transition-colors"
        >
          {post.content}
        </p>
      )}

      {post.media && (
        <div className="mb-4">
          <ImageWithSkeleton src={post.media} alt="Post content" />
        </div>
      )}

      <LinkPreviewCard preview={post.linkPreview} />

      {post.link && !post.linkPreview && (
        <a href={post.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-4 hover:bg-slate-100 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-teal-500 shadow-sm">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-900 truncate">{post.link}</p>
            <p className="text-[10px] text-slate-400 font-medium">Click to open link</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-300 mr-1" />
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <button onClick={toggleLike} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${liked ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-rose-400 hover:bg-rose-50/50'}`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            {likeCount}
          </button>
          <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${showComments ? 'text-teal-500 bg-teal-50' : 'text-slate-400 hover:text-teal-400 hover:bg-teal-50/50'}`}>
            <MessageSquare className="w-4 h-4" />
            {comments.length}
          </button>
          <button onClick={toggleSave} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${saved ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-400 hover:bg-amber-50/50'}`}>
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            Save
          </button>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-100">
          <Network className="w-3 h-3 text-teal-400" />
          {post.similarity}% Match
        </div>
      </div>

      {/* Threaded Comments */}
      <AnimatePresence>
        {showComments && (
          <MotionDiv initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 pt-4 border-t border-slate-50">
            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto px-1 custom-scrollbar">
              {comments.length === 0 ? (
                <p className="text-center py-4 text-[11px] text-slate-400 font-medium">No comments yet. Start the thread!</p>
              ) : (
                comments.filter(c => !c.parentId).map((c) => (
                  <div key={c.id} className="space-y-3">
                    <div className="flex gap-3 items-start group">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-black" style={{ background: c.avatar }}>
                        {c.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="bg-slate-50 rounded-2xl rounded-tl-none p-3 border border-slate-100/50">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[11px] font-bold text-slate-900">{c.author}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{c.createdAt}</p>
                          </div>
                          <p className="text-[12px] text-slate-600 leading-relaxed font-medium">{c.content}</p>
                        </div>
                        <button onClick={() => { setReplyTo(c); setCommentText(`@${c.author.split(' ')[0]} `); }} className="mt-1 ml-1 text-[10px] font-bold text-slate-400 hover:text-teal-500 flex items-center gap-1 transition-colors">
                          <Reply className="w-3 h-3" /> Reply
                        </button>
                      </div>
                    </div>

                    {/* Nested Replies */}
                    {comments.filter(reply => reply.parentId === c.id).map(reply => (
                      <div key={reply.id} className="flex gap-3 items-start ml-8">
                        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-black" style={{ background: reply.avatar }}>
                          {reply.author.charAt(0)}
                        </div>
                        <div className="flex-1 bg-white rounded-2xl rounded-tl-none p-2.5 border border-slate-100">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-bold text-slate-800">{reply.author}</p>
                            <p className="text-[8px] text-slate-400 font-medium">{reply.createdAt}</p>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
            {/* Comment Input */}
            {replyTo && (
              <div className="flex items-center justify-between bg-teal-50 px-3 py-1.5 rounded-t-xl border-x border-t border-teal-100 mx-10">
                <p className="text-[10px] font-bold text-teal-600">Replying to {replyTo.author}</p>
                <button onClick={() => { setReplyTo(null); setCommentText(''); }} className="text-teal-400 hover:text-teal-600"><X className="w-3 h-3" /></button>
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              <div className="w-7 h-7 rounded-full bg-teal-500 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                {user?.fullName?.charAt(0) || 'Y'}
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  placeholder="Add a thought..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/20 transition-all placeholder:text-slate-300"
                />
                <button onClick={handleComment} disabled={!commentText.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-500 disabled:opacity-30 hover:scale-110 transition-transform">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

/* ── Main Feed Page ── */

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [trending, setTrending] = useState<{ tag: string, posts: number }[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('For You');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAttach, setShowAttach] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [composerFocused, setComposerFocused] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [feedRes, trendRes, suggestRes, notifRes] = await Promise.all([
          activeTab === 'Following' ? socialService.getFollowingFeed() :
            activeTab === 'Trending' ? socialService.getTrending() : socialService.getFeed(),
          socialService.getTrending(),
          socialService.getSuggested(),
          socialService.getNotifications()
        ]);

        const sp: Post[] = feedRes?.posts || [];
        if (sp.length === 0 && activeTab === 'For You') {
          setAllPosts(REALISTIC_POSTS);
        } else {
          setAllPosts(sp);
        }
        if (trendRes?.trending) setTrending(trendRes.trending);
        if (suggestRes?.suggested) setSuggested(suggestRes.suggested);
        if (notifRes?.notifications) setNotifications(notifRes.notifications);
      } catch (e) {
        console.error(e);
        setAllPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Socket Listeners for Real-time Mesh
    const handleNewPost = (post: Post) => {
      setAllPosts(prev => {
        if (prev.find(p => p.id === post.id || p.slug === post.slug)) return prev;
        return [post, ...prev];
      });
    };

    const handleLikeUpdate = ({ postId, likes }: { postId: string, likes: number }) => {
      setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, likes } : p));
    };

    const handleCommentUpdate = ({ postId, comment }: { postId: string, comment: Comment }) => {
      setAllPosts(prev => prev.map(p => {
        if (p.id === postId) {
          if (p.comments.find(c => c.id === comment.id)) return p;
          return { ...p, comments: [...p.comments, comment] };
        }
        return p;
      }));
    };

    socketService.on('new_post', handleNewPost);
    socketService.on('post_liked', handleLikeUpdate);
    socketService.on('post_unliked', handleLikeUpdate);
    socketService.on('post_commented', handleCommentUpdate);

    return () => {
      socketService.off('new_post', handleNewPost);
      socketService.off('post_liked', handleLikeUpdate);
      socketService.off('post_unliked', handleLikeUpdate);
      socketService.off('post_commented', handleCommentUpdate);
    };
  }, [activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await cloudinaryService.uploadFile(file);
      setMediaUrl(res.secureUrl);
      setShowAttach(true);
      toast.success('Image optimized & uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePost = async () => {
    if (!draft.trim()) return;
    
    const content = draft;
    const mUrl = mediaUrl;
    const lUrl = linkUrl;
    const tag = selectedTag;
    
    // Optimistic Update
    const tempId = 'temp-' + Date.now();
    const optimisticPost: Post = {
      id: tempId,
      authorId: user?.id || 'you',
      author: user?.fullName || 'You',
      role: 'Member',
      location: '',
      avatar: '#14b8a6',
      similarity: 100,
      content,
      tag,
      media: mUrl,
      link: lUrl,
      likes: 0,
      comments: [],
      reposts: 0,
      time: 'Just now',
      slug: tempId
    };

    setAllPosts(prev => [optimisticPost, ...prev]);
    setDraft('');
    setSelectedTag('');
    setMediaUrl('');
    setLinkUrl('');
    setShowAttach(false);
    
    setIsPosting(true);
    try {
      const res = await socialService.createPost(content, mUrl, tag, lUrl);
      if (res?.post) {
        setAllPosts(prev => prev.map(p => p.id === tempId ? res.post : p));
        toast.success('Broadcasted to your cluster!');
      }
    } catch { 
      toast.error('Could not post. Try again later.');
      setAllPosts(prev => prev.filter(p => p.id !== tempId));
      setDraft(content);
      setMediaUrl(mUrl);
      setLinkUrl(lUrl);
      setSelectedTag(tag);
    }
    finally { setIsPosting(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await socialService.deletePost(deleteId);
      setAllPosts(prev => prev.filter(p => p.id !== deleteId));
      toast.success('Post removed');
    } catch { toast.error('Could not delete post'); }
    finally { setDeleteId(null); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DeleteModal isOpen={!!deleteId} onConfirm={confirmDelete} onClose={() => setDeleteId(null)} />

      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => navigate('/')} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tracking-tight">Feed</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* User avatar (mobile) */}
            {user && (
              <button onClick={() => navigate('/app/social')} className="sm:hidden w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.fullName?.charAt(0) || 'Y'}
              </button>
            )}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors relative">
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <MotionDiv initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="fixed sm:absolute right-0 sm:right-0 top-14 sm:top-auto sm:mt-2 left-0 sm:left-auto w-full sm:w-80 bg-white border-t sm:border border-slate-200 sm:rounded-xl z-50 overflow-hidden"
                      style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cluster Pulse</p>
                        <button onClick={async () => { await socialService.markNotificationsRead(); setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); }} className="text-[10px] font-bold text-teal-500 hover:text-teal-600 transition-colors">Clear all</button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                            <p className="text-[11px] text-slate-400">Quiet in your mesh for now.</p>
                          </div>
                        ) : notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 flex items-start gap-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-teal-50/30' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600">
                              {n.fromName?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] text-slate-600 leading-snug">
                                <span className="font-bold text-slate-900">{n.fromName}</span> {n.message}
                              </p>
                              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide mt-1">Just now</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </MotionDiv>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[11px] font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* ── Main Feed ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Composer */}
            <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${composerFocused || draft ? 'border-slate-300 shadow-[0_2px_16px_rgba(0,0,0,0.07)]' : 'border-slate-200 shadow-sm'}`}>

              {/* Write area */}
              <div className="p-4 sm:p-5">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {user?.fullName?.charAt(0) || 'Y'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <AnimatePresence>
                      {(composerFocused || draft) && (
                        <MotionDiv initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="flex items-center gap-1.5 mb-2">
                            <p className="text-[11px] font-bold text-slate-800">{user?.fullName || 'You'}</p>
                            <span className="text-slate-200">·</span>
                            <span className="text-[10px] text-teal-600 font-semibold">Broadcasting to cluster</span>
                          </div>
                        </MotionDiv>
                      )}
                    </AnimatePresence>
                    <textarea
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onFocus={() => setComposerFocused(true)}
                      onBlur={() => setComposerFocused(false)}
                      placeholder="Share an insight, update, or thought with your cluster…"
                      rows={composerFocused || draft ? 4 : 2}
                      className="w-full bg-transparent border-none focus:outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 resize-none leading-relaxed transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Media / link attachment */}
              <AnimatePresence>
                {showAttach && (
                  <MotionDiv initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mx-4 mb-3 rounded-2xl bg-slate-50 border border-slate-100 p-3">
                      {mediaUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200">
                          <img src={mediaUrl} className="w-full h-auto max-h-52 object-cover" alt="Attached" />
                          <button onClick={() => setMediaUrl('')}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Link URL</label>
                          <input
                            type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                            placeholder="Paste a URL to attach…"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:border-teal-400 focus:ring-1 focus:ring-teal-400/20 outline-none placeholder:text-slate-300 transition-all"
                          />
                        </div>
                      )}
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>

              {/* Category tag picker — shown when focused or draft exists */}
              <AnimatePresence>
                {(composerFocused || draft || selectedTag) && (
                  <MotionDiv initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0 mr-0.5">Tag</span>
                      {CATEGORIES.map(tag => (
                        <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                          className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${selectedTag === tag ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-teal-200 hover:text-teal-600 hover:bg-teal-50/50'}`}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>

              {/* Action bar */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-0.5">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Attach image"
                    className={`p-2 rounded-xl transition-all ${isUploading ? 'opacity-40 cursor-not-allowed' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}
                  >
                    {isUploading
                      ? <div className="w-4 h-4 border-2 border-slate-300 border-t-teal-500 rounded-full animate-spin" />
                      : <ImageIcon className="w-4 h-4" />
                    }
                  </button>
                  <button
                    onClick={() => setShowAttach(!showAttach)}
                    title="Attach link"
                    className={`p-2 rounded-xl transition-all ${showAttach ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  {draft && (
                    <span className={`text-[10px] font-semibold tabular-nums transition-colors ${draft.length > 450 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {500 - draft.length}
                    </span>
                  )}
                  <button
                    onClick={handlePost}
                    disabled={!draft.trim() || isPosting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-bold disabled:opacity-30 transition-all active:scale-[0.97] shadow-sm"
                  >
                    {isPosting ? (
                      <>
                        <div className="w-3 h-3 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" />
                        Posting…
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        Broadcast
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Tab selector */}
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl overflow-hidden">
              {['For You', 'Following', 'Trending'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Feed Posts */}
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : allPosts.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm font-medium text-slate-400 mb-2">No posts yet in your cluster.</p>
                  <p className="text-xs text-slate-400">Be the first to broadcast something!</p>
                </div>
              ) : (
                allPosts.map((post, i) => <PostCard key={post.id} post={post} i={i} onDelete={setDeleteId} />)
              )}
            </div>

            {allPosts.length > 0 && (
              <div className="flex justify-center py-4">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors">
                  Load more <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">

            {/* Personal Cluster Stats */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Network Position</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {user?.fullName?.charAt(0) || 'Y'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName || 'Mesh Member'}</p>
                  <p className="text-[11px] text-teal-600 mt-0.5 font-medium">Active in Cluster</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-100">
                  <p className="text-base font-bold text-teal-700">12</p>
                  <p className="text-[10px] text-teal-600 font-semibold mt-0.5">Nodes</p>
                </div>
                <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                  <p className="text-base font-bold text-violet-700">92%</p>
                  <p className="text-[10px] text-violet-600 font-semibold mt-0.5">Avg Match</p>
                </div>
              </div>
              <button onClick={() => navigate('/app/mesh')} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-sm font-semibold transition-colors">
                <Network className="w-4 h-4" />
                Visualize Cluster
              </button>
            </div>

            {/* Trending Topics */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trending</p>
                <TrendingUp className="w-4 h-4 text-teal-500" />
              </div>
              <div className="space-y-4">
                {trending.length > 0 ? trending.slice(0, 5).map(({ tag, posts }, i) => (
                  <div key={tag} onClick={() => setActiveTab('Trending')} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-200 group-hover:text-teal-300 transition-colors w-5">0{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">#{tag}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{posts} posts</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                )) : (
                  <div className="space-y-3">
                    {['Design', 'Engineering', 'Startup', 'AI', 'Product'].map((t, i) => (
                      <div key={t} className="flex items-center gap-3 opacity-40">
                        <span className="text-xs font-black text-slate-400 w-5">0{i + 1}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-500">#{t}</p>
                          <p className="text-[10px] text-slate-400">— posts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Connections */}
            {suggested.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Suggested</p>
                <div className="space-y-3">
                  {suggested.slice(0, 3).map((s) => (
                    <div key={s.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ background: s.avatar || '#0ea5e9' }}>
                          {s.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{s.role} · {s.similarity}%</p>
                        </div>
                      </div>
                      <button className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors border border-slate-100 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/app/mesh')} className="w-full mt-4 py-2 text-[11px] text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center gap-1.5">
                  Grow your network <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
