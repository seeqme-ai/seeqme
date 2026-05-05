import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { socialService } from '@/services/apiService';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import {
  ArrowLeft, ChevronLeft, MessageSquare, Heart, Share2, Bookmark, Send, 
  Network, MoreHorizontal, Copy, Trash2, ExternalLink,
  Link as LinkIcon, Reply, X, Bell
} from 'lucide-react';
import { socketService } from '@/services/socketService';

const MotionDiv = motion.div as any;

const MOCK_POSTS = [
  {
    id: 'm1',
    author: 'Sarah Chen',
    role: 'Principal Design Engineer',
    avatar: '#8b5cf6',
    similarity: 94,
    content: "Just finished refactoring our design system's token architecture. Moving from static variables to a multi-tiered semantic system has reduced our UI debt by nearly 40%. The key was establishing a 'base -> semantic -> component' flow that designers actually enjoy using in Figma. \n\nHas anyone else experimented with automated token syncing between Figma and Style Dictionary recently?",
    timestamp: '2h ago',
    slug: 'sarah-chen-design-tokens',
    likes: 124,
    reposts: 12,
    comments: []
  },
  {
    id: 'm2',
    author: 'Marcus Thorne',
    role: 'Product Lead @ SeeqMe',
    avatar: '#0ea5e9',
    similarity: 88,
    content: "The future of networking isn't about having 500+ connections; it's about the density of your professional cluster. We're seeing that users with smaller, high-similarity meshes are 3x more likely to secure high-value partnerships than those with broad, generic networks. \n\nQuality over quantity is finally being mathematically enforced by the Mesh.",
    timestamp: '5h ago',
    slug: 'marcus-thorne-mesh-density',
    likes: 245,
    reposts: 56,
    comments: []
  },
  {
    id: 'm3',
    author: 'Elena Rodriguez',
    role: 'AI Research Lead',
    avatar: '#14b8a6',
    similarity: 72,
    content: "Agentic workflows are completely shifting how we think about IDEs. We're no longer just 'autocompleting' code; we're collaborating with agents that understand the broader architectural context. The next step is better state management for these agents so they can handle multi-file refactors without losing the mental model of the system.",
    timestamp: '8h ago',
    slug: 'elena-rodriguez-agentic-workflows',
    likes: 89,
    reposts: 8,
    comments: []
  },
  {
    id: 'm4',
    author: 'David Okoro',
    role: 'Venture Partner',
    avatar: '#f59e0b',
    similarity: 65,
    content: "The tech ecosystem in West Africa is maturing rapidly. We're seeing a shift from simple consumer-facing apps to deep infrastructure solutions in logistics and fintech. The resilience shown by founders in this macro environment is nothing short of incredible. Looking for early-stage teams building the 'rails' for the next decade.",
    timestamp: '1d ago',
    slug: 'david-okoro-africa-tech',
    likes: 167,
    reposts: 31,
    comments: []
  }
];

const PostPage: React.FC = () => {
  const { user } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [replyTo, setReplyTo] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        const res = await socialService.getPostBySlug(slug);
        if (res?.post) {
          setPost(res.post);
          setComments(res.post.comments || []);
          setLikeCount(res.post.likes || 0);
        } else {
           // Try mock data
           const mock = MOCK_POSTS.find(p => p.slug === slug);
           if (mock) {
             setPost(mock);
             setComments(mock.comments);
             setLikeCount(mock.likes);
           }
        }
        setLoading(false);
      } catch {
        const mock = MOCK_POSTS.find(p => p.slug === slug);
        if (mock) {
          setPost(mock);
          setComments(mock.comments);
          setLikeCount(mock.likes);
        }
        setLoading(false);
      }
    };
    fetchData();

    // Socket Listeners for Real-time Post Updates
    const handleNewComment = (comment: any) => {
      setComments(prev => {
        if (prev.find(c => c.id === comment.id)) return prev;
        return [...prev, comment];
      });
    };

    const handleLikesUpdate = (likes: number) => {
      setLikeCount(likes);
    };

    socketService.on('new_comment', handleNewComment);
    socketService.on('likes_update', handleLikesUpdate);

    return () => {
      if (post?.id) socketService.unsubscribeFromPost(post.id);
      socketService.off('new_comment', handleNewComment);
      socketService.off('likes_update', handleLikesUpdate);
    };
  }, [slug, post?.id]);

  useEffect(() => {
    if (post?.id) {
      socketService.subscribeToPost(post.id);
    }
  }, [post?.id]);

  const handleComment = async () => {
    if (!comment.trim() || !post) return;
    
    const content = comment;
    const tempId = 'temp-c-' + Date.now();
    const optimisticComment = {
      id: tempId,
      postId: post.id,
      parentId: replyTo?.id,
      authorId: user?.id || 'you',
      author: user?.fullName || 'You',
      avatar: '#14b8a6',
      content,
      createdAt: new Date().toISOString()
    };

    setComments(prev => [...prev, optimisticComment]);
    setComment('');
    setReplyTo(null);

    try {
      const res = await socialService.commentOnPost(post.id, content, replyTo?.id);
      if (res?.comment) {
        setComments(prev => prev.map(c => c.id === tempId ? res.comment : c));
        toast.success('Thought added to the thread');
      }
    } catch { 
      toast.error('Could not add comment');
      setComments(prev => prev.filter(c => c.id !== tempId));
      setComment(content);
    }
  };

  const toggleLike = async () => {
    if (!post) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(p => wasLiked ? p - 1 : p + 1);
    try {
      if (wasLiked) await socialService.unlikePost(post.id);
      else await socialService.likePost(post.id);
    } catch { 
      setLiked(wasLiked); 
      setLikeCount(p => wasLiked ? p + 1 : p - 1); 
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
  </div>;

  if (!post) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
    <p className="text-slate-500 font-medium">Post not found in your cluster.</p>
    <button onClick={() => navigate('/app/feed')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold">Back to Feed</button>
  </div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Helmet>
        <title>{post.seoTitle || post.author + " on SeeqMe Mesh"}</title>
        <meta name="description" content={post.seoDesc || post.content.substring(0, 160)} />
        <meta property="og:title" content={post.seoTitle || post.author + " on SeeqMe Mesh"} />
        <meta property="og:description" content={post.seoDesc || post.content.substring(0, 160)} />
        <meta property="og:type" content="article" />
        <meta name="author" content={post.author} />
      </Helmet>

      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Post</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm shadow-slate-200/50"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-black"
                style={{ background: post.avatar || '#8b5cf6' }}
              >
                {post.author.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-slate-900">{post.author}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600 border border-teal-100">
                    {post.similarity}% match
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">{post.role} · {post.timestamp}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-[15px] text-slate-700 font-medium leading-relaxed whitespace-pre-line mb-8">
            {post.content}
          </p>

          {post.media && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100">
              <img src={post.media} alt="Content" className="w-full h-auto max-h-[500px] object-cover" />
            </div>
          )}

          {post.linkPreview ? (
            <a href={post.linkPreview.url} target="_blank" rel="noopener noreferrer" className="block mb-6 overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 transition-all group">
              {post.linkPreview.image && (
                <div className="aspect-[1.91/1] w-full overflow-hidden border-b border-slate-100">
                  <img src={post.linkPreview.image} alt={post.linkPreview.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{post.linkPreview.siteName || new URL(post.linkPreview.url).hostname}</p>
                <p className="text-base font-bold text-slate-900 mb-1.5">{post.linkPreview.title}</p>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{post.linkPreview.description}</p>
              </div>
            </a>
          ) : post.link && (
            <a href={post.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-teal-500 shadow-sm">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{post.link}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Click to explore</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300" />
            </a>
          )}

          {/* Mesh Context */}
          <div className="flex items-center gap-2 mb-8 p-4 rounded-2xl bg-teal-50/50 border border-teal-50 text-[11px] text-teal-700 font-semibold">
            <Network className="w-4 h-4 text-teal-500" />
            <span>Shared with you because of high professional similarity on SeeqMe Mesh.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button onClick={toggleLike} className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${liked ? 'text-rose-500 bg-rose-50' : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50'}`}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                {likeCount}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-slate-500 hover:text-teal-500 hover:bg-teal-50 transition-all">
                <Share2 className="w-4 h-4" />
                {post.reposts}
              </button>
            </div>
            <button className="p-2 rounded-2xl text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition-all">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </MotionDiv>

        {/* Comment Section */}
        <div className="mt-12 space-y-8">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">The Thread ({comments.length})</h2>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col gap-3 ring-4 ring-slate-50">
            {replyTo && (
              <div className="flex items-center justify-between bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">
                <p className="text-[10px] font-bold text-teal-600">Replying to {replyTo.author}</p>
                <button onClick={() => setReplyTo(null)} className="text-teal-400 hover:text-teal-600"><X className="w-3 h-3" /></button>
              </div>
            )}
            <div className="flex items-end gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-lg shadow-teal-100">
                {user?.fullName?.charAt(0) || 'Y'}
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Contribute to the conversation..."
                className="flex-1 bg-transparent border-none focus:outline-none text-[13px] font-medium text-slate-800 placeholder:text-slate-300 resize-none py-2"
                rows={1}
              />
              <button 
                onClick={handleComment}
                disabled={!comment.trim()}
                className="p-3 bg-slate-900 text-white rounded-2xl disabled:opacity-30 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {comments.length > 0 ? comments.filter(c => !c.parentId).map((c) => (
              <div key={c.id} className="space-y-6">
                <MotionDiv initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-black shadow-sm" style={{ background: c.avatar || '#8b5cf6' }}>
                    {c.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-none p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-900">{c.author}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-[13px] text-slate-600 leading-relaxed font-medium">{c.content}</p>
                    </div>
                    <button onClick={() => { setReplyTo(c); setComment(`@${c.author.split(' ')[0]} `); }} className="mt-2 ml-1 text-[10px] font-bold text-slate-400 hover:text-teal-500 flex items-center gap-1 transition-colors">
                      <Reply className="w-3.5 h-3.5" /> Reply
                    </button>
                  </div>
                </MotionDiv>

                {/* Nested Replies */}
                {comments.filter(reply => reply.parentId === c.id).map(reply => (
                  <MotionDiv initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={reply.id} className="flex gap-4 ml-12">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[11px] font-black shadow-sm" style={{ background: reply.avatar || '#14b8a6' }}>
                      {reply.author.charAt(0)}
                    </div>
                    <div className="flex-1 bg-slate-50/50 border border-slate-100 rounded-3xl rounded-tl-none p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-bold text-slate-800">{reply.author}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(reply.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-[12px] text-slate-600 leading-relaxed font-medium">{reply.content}</p>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            )) : (
              <div className="text-center py-20 bg-white/50 rounded-[40px] border border-dashed border-slate-200">
                <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400">Be the first to share your perspective.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
