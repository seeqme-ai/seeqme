import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
  time?: string;
  timestamp?: string;
  slug: string;
  liked?: boolean;
  savedBy?: string[];
  repostedBy?: string; // Virtual for UI
  createdAt?: string;
  seoTitle?: string;
  seoDesc?: string;
}

interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
}

interface RedditPost {
  id: string;
  redditId: string;
  subreddit: string;
  title: string;
  selftext: string;
  author: string;
  score: number;
  numComments: number;
  thumbnail?: string;
  url: string;
  permalink: string;
  slug: string;
  seoTitle: string;
  seoDesc: string;
  category: string;
  topComments: RedditComment[];
  ourComments: Comment[];
  ourLikes: string[];
}

const isLikelyImageUrl = (url?: string) => {
  if (!url) return false;
  const normalized = url.toLowerCase().split('?')[0];
  return normalized.includes('i.redd.it/') ||
    normalized.includes('preview.redd.it/') ||
    normalized.endsWith('.jpg') ||
    normalized.endsWith('.jpeg') ||
    normalized.endsWith('.png') ||
    normalized.endsWith('.webp') ||
    normalized.endsWith('.gif');
};

const CATEGORIES = ['Opinion', 'Case Study', 'Engineering', 'Startup', 'Design', 'Product', 'News'];

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
    try { await socialService.savePost(post.id);  }
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
        // Remove the optimistic comment and add the real one
        setComments(prev => {
          const filtered = prev.filter(c => c.id !== tempId);
          return [...filtered, res.comment];
        });
        toast.success('Thought shared');
      } else {
        throw new Error('No comment returned');
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
              
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{post.role} · {post.location} · {post.time || post.timestamp}</p>
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

/* ── Reddit Badge ── */
const RedditBadge: React.FC<{ subreddit: string }> = ({ subreddit }) => (
  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100">
    <svg className="w-3 h-3 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="10" r="10" className="text-orange-500" fill="currentColor" />
      <path fill="white" d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.07 2.13.45a1 1 0 1 0 1-.97.94.94 0 0 0-.68.28l-2.38-.5a.27.27 0 0 0-.32.2l-.73 3.44a7.14 7.14 0 0 0-3.89 1.23 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 0 0 0-.44 1.46 1.46 0 0 0 .4-1.22zm-9.4 1.31a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.58 2.63a3.55 3.55 0 0 1-2.85.79 3.55 3.55 0 0 1-2.85-.79.28.28 0 0 1 .39-.39 3.07 3.07 0 0 0 2.46.64 3.07 3.07 0 0 0 2.46-.64.28.28 0 1 1 .39.39zm-.17-1.63a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" />
    </svg>
    <span className="text-[9px] font-black text-orange-500 uppercase tracking-wider">r/{subreddit}</span>
  </div>
);

/* ── Reddit Post Card ── */
const RedditPostCard: React.FC<{ post: RedditPost; i: number }> = ({ post, i }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.ourLikes?.includes(user?.id || '') || false);
  const [likeCount, setLikeCount] = useState(post.score || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [ourComments, setOurComments] = useState<Comment[]>(post.ourComments || []);
  const [redditComments, setRedditComments] = useState<RedditComment[]>(post.topComments || []);

  const toggleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(p => wasLiked ? p - 1 : p + 1);
    try {
      if (wasLiked) await socialService.unlikeRedditPost(post.id);
      else await socialService.likeRedditPost(post.id);
    } catch {
      setLiked(wasLiked);
      setLikeCount(p => wasLiked ? p + 1 : p - 1);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const content = commentText;
    const tempId = 'temp-rc-' + Date.now();
    const optimistic: Comment = {
      id: tempId, postId: post.id, authorId: user?.id || 'you',
      author: user?.fullName || 'You', avatar: '#14b8a6',
      content, createdAt: 'Just now'
    };
    setOurComments(prev => [...prev, optimistic]);
    setCommentText('');
    try {
      const res = await socialService.commentOnRedditPost(post.id, content);
      if (res?.comment) setOurComments(prev => prev.map(c => c.id === tempId ? res.comment : c));
    } catch {
      toast.error('Could not add comment');
      setOurComments(prev => prev.filter(c => c.id !== tempId));
      setCommentText(content);
    }
  };

  const mediaUrl = post.thumbnail?.startsWith('http')
    ? post.thumbnail
    : (isLikelyImageUrl(post.url) ? post.url : '');

  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (!next) return;
    if (redditComments.length > 0) return;
    try {
      const res = await socialService.getRedditPostBySlug(post.slug);
      const fetched = res?.post?.topComments || [];
      if (fetched.length > 0) setRedditComments(fetched);
    } catch {
      // Keep card usable even if background comment refresh fails.
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04, duration: 0.3 }}
      className="bg-white border border-slate-200 rounded-lg p-5 hover:border-orange-200 transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <RedditBadge subreddit={post.subreddit} />
          <span className="text-[10px] text-slate-400 font-medium">u/{post.author}</span>
          <span className="text-[10px] text-slate-300">·</span>
          <div className="flex items-center gap-1 text-[10px] text-orange-500 font-semibold">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            {post.score.toLocaleString()} upvotes
          </div>
        </div>
        <button
          onClick={() => navigate(`/app/feed/reddit/${post.slug}`)}
          className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-50"
          title="View full post"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <p
        onClick={() => navigate(`/app/feed/reddit/${post.slug}`)}
        className="text-[14px] font-bold text-slate-900 leading-snug mb-3 cursor-pointer hover:text-orange-600 transition-colors"
      >
        {post.title}
      </p>

      {/* Body text (truncated) */}
      {post.selftext && (
        <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-3 line-clamp-3 whitespace-pre-line">
          {post.selftext}
        </p>
      )}

      {/* Thumbnail */}
      {mediaUrl && (
        <div className="mb-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
          <img
            src={mediaUrl}
            alt={post.title}
            className="w-full h-auto max-h-[420px] object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-slate-100">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${liked ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-rose-400 hover:bg-rose-50/50'}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {likeCount}
        </button>
        <button
          onClick={toggleComments}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${showComments ? 'text-teal-500 bg-teal-50' : 'text-slate-400 hover:text-teal-400 hover:bg-teal-50/50'}`}
        >
          <MessageSquare className="w-4 h-4" />
          {post.numComments}
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <MotionDiv initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 pt-4 border-t border-slate-50">
            {/* Reddit top comments */}
            {redditComments.length > 0 && (
              <div className="mb-4">
                <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="10" fill="#FF4500"/><path fill="white" d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.07 2.13.45a1 1 0 1 0 1-.97.94.94 0 0 0-.68.28l-2.38-.5a.27.27 0 0 0-.32.2l-.73 3.44a7.14 7.14 0 0 0-3.89 1.23 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 0 0 0-.44 1.46 1.46 0 0 0 .4-1.22zm-9.4 1.31a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.58 2.63a3.55 3.55 0 0 1-2.85.79 3.55 3.55 0 0 1-2.85-.79.28.28 0 0 1 .39-.39 3.07 3.07 0 0 0 2.46.64 3.07 3.07 0 0 0 2.46-.64.28.28 0 1 1 .39.39zm-.17-1.63a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"/></svg>
                  Top Reddit Comments
                </p>
                <div className="space-y-2">
                  {redditComments.slice(0, 3).map(rc => (
                    <div key={rc.id} className="flex gap-2 p-2.5 rounded-xl bg-orange-50/50 border border-orange-100/50">
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center text-orange-500 text-[9px] font-black">
                        {rc.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-orange-600 mb-0.5">u/{rc.author}</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">{rc.body}</p>
                        <p className="text-[9px] text-orange-400 mt-1 flex items-center gap-1">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                          {rc.score}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Our platform comments */}
            {ourComments.length > 0 && (
              <div className="mb-3 space-y-2">
                <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">Comment your take</p>
                {ourComments.map(c => (
                  <div key={c.id} className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-black" style={{ background: c.avatar || '#14b8a6' }}>
                      {c.author.charAt(0)}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl rounded-tl-none p-2.5 border border-slate-100/50">
                      <p className="text-[10px] font-bold text-slate-900 mb-0.5">{c.author}</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full bg-teal-500 flex-shrink-0 flex items-center justify-center text-white text-[9px] font-black">
                {user?.fullName?.charAt(0) || 'Y'}
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                  placeholder="Add your take…"
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
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>([]);
  const [trending, setTrending] = useState<{ tag: string, posts: number }[]>([]);
  const [selectedTrendingTag, setSelectedTrendingTag] = useState('');
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
        let feedPromise;
        if (activeTab === 'Following') {
          feedPromise = socialService.getFollowingFeed();
        } else if (activeTab === 'Trending') {
          feedPromise = socialService.getTrendingFeed(selectedTrendingTag || undefined);
        } else {
          feedPromise = socialService.getFeed();
        }

        const [feedRes, trendRes, suggestRes, notifRes, redditRes] = await Promise.all([
          feedPromise,
          socialService.getTrending(),
          socialService.getSuggested(),
          socialService.getNotifications(),
          socialService.getRedditFeed(activeTab === 'Trending' ? 'hot' : 'all'),
        ]);

        const sp: Post[] = feedRes?.posts || [];
        const rp: RedditPost[] = feedRes?.redditPosts || redditRes?.redditPosts || [];

        setAllPosts(sp);
        setRedditPosts(rp);

        if (trendRes?.trending) setTrending(trendRes.trending);
        if (suggestRes?.suggested) setSuggested(suggestRes.suggested);
        if (notifRes?.notifications) setNotifications(notifRes.notifications);
      } catch (e) {
        console.error(e);
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
  }, [activeTab, selectedTrendingTag]);

  const visibleTrending = useMemo(() => {
    const available = new Set(
      allPosts
        .map((p) => (p.tag || '').trim().toLowerCase())
        .filter(Boolean)
    );
    return trending.filter((t) => available.has((t.tag || '').trim().toLowerCase()));
  }, [trending, allPosts]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await cloudinaryService.uploadFile(file);
      setMediaUrl(res.secureUrl);
      setShowAttach(true);
      
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
        setAllPosts(prev => {
          const withoutTemp = prev.filter(p => p.id !== tempId);
          const exists = withoutTemp.some(p => p.id === res.post.id || p.slug === res.post.slug);
          if (exists) return withoutTemp;
          return [res.post, ...withoutTemp];
        });
        toast.success('Posted to your feed!');
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
      <Helmet>
        <title>Professional Feed — SeeqMe</title>
        <meta name="description" content="Explore trending professional insights, discussions, and posts on SeeqMe." />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href={`${window.location.origin}/app/feed`} />
        <meta property="og:title" content="Professional Feed — SeeqMe" />
        <meta property="og:description" content="Explore trending professional insights, discussions, and posts on SeeqMe." />
        <meta property="og:url" content={`${window.location.origin}/app/feed`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "SeeqMe Feed",
            url: `${window.location.origin}/app/feed`,
            description: "Professional feed with trending posts and discussions.",
          })}
        </script>
      </Helmet>
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
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</p>
                        <button onClick={async () => { await socialService.markNotificationsRead(); setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); }} className="text-[10px] font-bold text-teal-500 hover:text-teal-600 transition-colors">Clear all</button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                            <p className="text-[11px] text-slate-400">No Notifications Yet.</p>
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
                            <span className="text-[10px] text-teal-600 font-semibold">Posting to feed</span>
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
                        Post
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
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab !== 'Trending') setSelectedTrendingTag('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Trending' && selectedTrendingTag && (
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Showing posts for <span className="font-bold text-slate-900">#{selectedTrendingTag}</span>
                </p>
                <button
                  onClick={() => setSelectedTrendingTag('')}
                  className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Feed Posts — interleave Reddit every 3 in-app posts */}
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : allPosts.length === 0 && redditPosts.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-5 h-5 text-teal-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    {activeTab === 'Following' ? 'Nothing from your connections yet.' : 'The feed is warming up.'}
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {activeTab === 'Following'
                      ? 'Connect with more nodes in the Mesh and their posts will appear here.'
                      : 'Be the first to broadcast something to your cluster.'}
                  </p>
                </div>
              ) : (
                (() => {
                  const items: React.ReactNode[] = [];
                  let ri = 0;
                  allPosts.forEach((post, i) => {
                    items.push(<PostCard key={post.id} post={post} i={i} onDelete={setDeleteId} />);
                    // Insert a Reddit post every 3 in-app posts
                    if ((i + 1) % 3 === 0 && ri < redditPosts.length) {
                      items.push(<RedditPostCard key={redditPosts[ri].id} post={redditPosts[ri]} i={ri} />);
                      ri++;
                    }
                  });
                  // Append remaining Reddit posts at the end
                  for (; ri < redditPosts.length; ri++) {
                    items.push(<RedditPostCard key={redditPosts[ri].id} post={redditPosts[ri]} i={ri} />);
                  }
                  return items;
                })()
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

            {/* Trending Topics — only shown when real data exists */}
            {visibleTrending.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trending</p>
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                </div>
                <div className="space-y-4">
                  {visibleTrending.slice(0, 5).map(({ tag, posts }, i) => (
                    <div
                      key={tag}
                      onClick={() => {
                        setSelectedTrendingTag(tag);
                        setActiveTab('Trending');
                      }}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-200 group-hover:text-teal-300 transition-colors w-5">0{i + 1}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">#{tag}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{posts} posts</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

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
