import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { socialService } from '@/services/apiService';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import {
  ArrowLeft, MessageSquare, Heart, Share2, Bookmark, Send,
  Network, ExternalLink, Link as LinkIcon, Reply, X
} from 'lucide-react';
import { socketService } from '@/services/socketService';

const MotionDiv = motion.div as any;


const PostPage: React.FC = () => {
  const { user } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isRedditPost = location.pathname.includes('/reddit/');
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [redditComments, setRedditComments] = useState<any[]>([]);
  const [ourComments, setOurComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [replyTo, setReplyTo] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        if (isRedditPost) {
          const res = await socialService.getRedditPostBySlug(slug);
          if (res?.post) {
            setPost(res.post);
            setRedditComments(res.post.topComments || []);
            setOurComments(res.post.ourComments || []);
            const uid = user?.id || '';
            setLiked(res.post.ourLikes?.includes(uid) || false);
            setLikeCount(res.post.ourLikes?.length || 0);
          }
        } else {
          const res = await socialService.getPostBySlug(slug);
          if (res?.post) {
            setPost(res.post);
            setComments(res.post.comments || []);
            setLikeCount(res.post.likes || 0);
          }
        }
        setLoading(false);
      } catch {
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

    if (isRedditPost) {
      setOurComments(prev => [...prev, optimisticComment]);
    } else {
      setComments(prev => [...prev, optimisticComment]);
    }
    setComment('');
    setReplyTo(null);

    try {
      let res;
      if (isRedditPost) {
        res = await socialService.commentOnRedditPost(post.id, content);
        if (res?.comment) setOurComments(prev => prev.map(c => c.id === tempId ? res.comment : c));
      } else {
        res = await socialService.commentOnPost(post.id, content, replyTo?.id);
        if (res?.comment) setComments(prev => prev.map(c => c.id === tempId ? res.comment : c));
      }
      toast.success('Thought added to the thread');
    } catch {
      toast.error('Could not add comment');
      if (isRedditPost) {
        setOurComments(prev => prev.filter(c => c.id !== tempId));
      } else {
        setComments(prev => prev.filter(c => c.id !== tempId));
      }
      setComment(content);
    }
  };

  const toggleLike = async () => {
    if (!post) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(p => wasLiked ? p - 1 : p + 1);
    try {
      if (isRedditPost) {
        if (wasLiked) await socialService.unlikeRedditPost(post.id);
        else await socialService.likeRedditPost(post.id);
      } else {
        if (wasLiked) await socialService.unlikePost(post.id);
        else await socialService.likePost(post.id);
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount(p => wasLiked ? p + 1 : p - 1);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
  </div>;

  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-2">
        <MessageSquare className="w-6 h-6 text-slate-300" />
      </div>
      <p className="text-base font-bold text-slate-800">Post not found</p>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
        This post may have been deleted or the link is no longer valid.
      </p>
      <button
        onClick={() => navigate('/app/feed')}
        className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-full text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Helmet>
        <title>{post.seoTitle || (isRedditPost ? post.title : post.author + " on SeeqMe")}</title>
        <meta name="description" content={post.seoDesc || (isRedditPost ? post.title : post.content?.substring(0, 160))} />
        <meta property="og:title" content={post.seoTitle || (isRedditPost ? post.title : post.author + " on SeeqMe")} />
        <meta property="og:description" content={post.seoDesc || (isRedditPost ? post.selftext?.substring(0, 160) : post.content?.substring(0, 160))} />
        <meta property="og:type" content="article" />
        {isRedditPost && post.thumbnail && <meta property="og:image" content={post.thumbnail} />}
        <meta name="author" content={isRedditPost ? `u/${post.author}` : post.author} />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
        <meta property="og:url" content={`${window.location.origin}${window.location.pathname}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seoTitle || post.title || post.author + " on SeeqMe"} />
        <meta name="twitter:description" content={post.seoDesc || post.selftext?.substring(0, 160) || post.content?.substring(0, 160)} />
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
          {isRedditPost ? (
            <div className="mb-5">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100">
                  <svg className="w-3.5 h-3.5 text-orange-500" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="10" fill="currentColor"/><path fill="white" d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.07 2.13.45a1 1 0 1 0 1-.97.94.94 0 0 0-.68.28l-2.38-.5a.27.27 0 0 0-.32.2l-.73 3.44a7.14 7.14 0 0 0-3.89 1.23 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 0 0 0-.44 1.46 1.46 0 0 0 .4-1.22zm-9.4 1.31a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.58 2.63a3.55 3.55 0 0 1-2.85.79 3.55 3.55 0 0 1-2.85-.79.28.28 0 0 1 .39-.39 3.07 3.07 0 0 0 2.46.64 3.07 3.07 0 0 0 2.46-.64.28.28 0 1 1 .39.39zm-.17-1.63a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"/></svg>
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-wider">r/{post.subreddit}</span>
                </div>
                <span className="text-xs text-slate-400">u/{post.author}</span>
                <span className="flex items-center gap-1 text-xs text-orange-500 font-semibold">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  {post.score?.toLocaleString()} upvotes · {post.numComments} Reddit comments
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-snug">{post.title}</h1>
            </div>
          ) : (
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
                  
                </div>
                <p className="text-xs text-slate-400 font-medium">{post.role} · {post.timestamp}</p>
              </div>
            </div>
          </div>
          )}

          {/* Content */}
          <p className="text-[15px] text-slate-700 font-medium leading-relaxed whitespace-pre-line mb-8">
            {isRedditPost ? post.selftext : post.content}
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

          {/* Context row */}
          {isRedditPost ? (
            <a href={post.permalink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 mb-8 p-4 rounded-2xl bg-orange-50/50 border border-orange-100 text-[11px] text-orange-600 font-semibold hover:bg-orange-50 transition-colors">
              <ExternalLink className="w-4 h-4 text-orange-400" />
              <span>View original thread on Reddit</span>
            </a>
          ) : (
          <div className="flex items-center gap-2 mb-8 p-4 rounded-2xl bg-teal-50/50 border border-teal-50 text-[11px] text-teal-700 font-semibold">
            <Network className="w-4 h-4 text-teal-500" />
            <span>Shared with you because of high professional similarity on SeeqMe Mesh.</span>
          </div>
          )}

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
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {isRedditPost ? `Discussion (${ourComments.length} SeeqMe · ${post.numComments} Reddit)` : `The Thread (${comments.length})`}
            </h2>
          </div>

          {/* Reddit top comments (shown on Reddit post pages) */}
          {isRedditPost && redditComments.length > 0 && (
            <div className="space-y-3">
              <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="10" fill="#FF4500"/><path fill="white" d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.07 2.13.45a1 1 0 1 0 1-.97.94.94 0 0 0-.68.28l-2.38-.5a.27.27 0 0 0-.32.2l-.73 3.44a7.14 7.14 0 0 0-3.89 1.23 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 0 0 0-.44 1.46 1.46 0 0 0 .4-1.22zm-9.4 1.31a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.58 2.63a3.55 3.55 0 0 1-2.85.79 3.55 3.55 0 0 1-2.85-.79.28.28 0 0 1 .39-.39 3.07 3.07 0 0 0 2.46.64 3.07 3.07 0 0 0 2.46-.64.28.28 0 1 1 .39.39zm-.17-1.63a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"/></svg>
                Top Reddit Comments
              </p>
              {redditComments.map(rc => (
                <div key={rc.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center text-orange-500 text-sm font-black">
                    {rc.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-orange-50/60 border border-orange-100 rounded-3xl rounded-tl-none p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-bold text-orange-600">u/{rc.author}</p>
                      <span className="text-[10px] text-orange-400 flex items-center gap-1 font-semibold">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                        {rc.score}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{rc.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SeeqMe member comments (for Reddit posts) */}
          {isRedditPost && (
            <div>
              <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest px-1 mb-3">SeeqMe Members Take</p>
            </div>
          )}
          
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
            {(isRedditPost ? ourComments : comments).length > 0 ? (isRedditPost ? ourComments : comments).filter((c: any) => !c.parentId).map((c: any) => (
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
                {(isRedditPost ? ourComments : comments).filter((reply: any) => reply.parentId === c.id).map((reply: any) => (
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
