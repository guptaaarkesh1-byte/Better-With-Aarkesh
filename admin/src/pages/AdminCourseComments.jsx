import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChatCenteredDots, 
  Question, 
  PushPin, 
  EyeSlash, 
  Eye, 
  Trash, 
  PaperPlaneRight, 
  Sparkle, 
  CircleNotch, 
  MagnifyingGlass, 
  ArrowClockwise, 
  CheckCircle,
  Funnel,
  WarningCircle
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return past.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function AdminCourseComments() {
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [totalUnanswered, setTotalUnanswered] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all' | 'unanswered' | 'answered' | 'pinned' | 'hidden'
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Inline Admin Reply State
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchAdminComments = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        filter,
        ...(search ? { search } : {}),
      });

      const res = await fetch(`${API_URL}/api/comments/admin/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setTotalComments(data.totalComments || 0);
        setTotalUnanswered(data.totalUnanswered || 0);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load admin comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchAdminComments(1);
  }, [fetchAdminComments]);

  // Admin Reply Action
  const handlePostReply = async (commentId) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    setIsSubmittingReply(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: trimmed }),
      });

      const newReply = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id === commentId) {
              return {
                ...c,
                isAnswered: true,
                replies: [...(c.replies || []), newReply],
                replyCount: (c.replyCount || 0) + 1,
              };
            }
            return c;
          })
        );
        if (totalUnanswered > 0) setTotalUnanswered((prev) => Math.max(0, prev - 1));
        setReplyText('');
        setReplyingCommentId(null);
      } else {
        alert(newReply.message || 'Failed to submit instructor reply');
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      alert('Network error while posting reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (commentId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/${commentId}/pin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, isPinned: data.isPinned } : c))
        );
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  // Hide / Restore
  const handleToggleHide = async (commentId, isCurrentlyHidden) => {
    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = isCurrentlyHidden ? 'restore' : 'hide';
      const res = await fetch(`${API_URL}/api/comments/${commentId}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId ? { ...c, status: isCurrentlyHidden ? 'active' : 'hidden' } : c
          )
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Delete
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this comment and its replies?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setTotalComments((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-6xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-[#c79c6e] font-semibold flex items-center gap-1.5">
              <Sparkle size={14} weight="fill" />
              COMMUNITY MODERATION
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-white">Course Discussions & Q&A</h1>
          <p className="font-sans text-xs md:text-sm text-white/50 mt-1">
            Answer student questions, pin valuable answers, and moderate lesson discussions.
          </p>
        </div>

        <button
          onClick={() => fetchAdminComments(page)}
          className="self-start md:self-auto px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors"
        >
          <ArrowClockwise size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111] p-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {[
            { id: 'all', label: 'All', count: totalComments },
            { id: 'unanswered', label: 'Unanswered Q&A', count: totalUnanswered, highlight: true },
            { id: 'answered', label: 'Answered' },
            { id: 'pinned', label: 'Pinned' },
            { id: 'hidden', label: 'Hidden' },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider whitespace-nowrap flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-[#c79c6e] text-black shadow-md shadow-[#c79c6e]/20'
                    : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive
                      ? 'bg-black/20 text-black'
                      : tab.highlight && tab.count > 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <MagnifyingGlass size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAdminComments(1)}
            placeholder="Search comments or students..."
            className="w-full bg-[#080808] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-[#c79c6e]/50"
          />
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-white/40 gap-3">
          <CircleNotch size={28} className="animate-spin text-[#c79c6e]" />
          <span className="text-xs uppercase tracking-widest font-mono">Loading discussions...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0a0a0a] border border-white/5 p-8">
          <ChatCenteredDots size={36} className="text-white/20 mx-auto mb-3" />
          <h3 className="font-serif text-lg text-white font-normal mb-1">No comments found</h3>
          <p className="text-xs text-white/40 max-w-sm mx-auto">
            {filter === 'unanswered'
              ? 'Great job! All student questions have been answered.'
              : 'No student discussions match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isHidden = comment.status === 'hidden';
            const isReplying = replyingCommentId === comment._id;

            return (
              <div
                key={comment._id}
                className={`p-6 rounded-2xl bg-[#0a0a0a] border transition-all ${
                  comment.isPinned
                    ? 'border-[#c79c6e]/50 bg-gradient-to-r from-[#17140e] to-[#0a0a0a]'
                    : isHidden
                    ? 'border-dashed border-rose-500/30 opacity-75'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {/* Header & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1c1a17] to-[#0f0e0c] border border-[#c79c6e]/30 text-[#c79c6e] flex items-center justify-center text-xs font-serif font-bold shrink-0">
                      {getInitials(comment.userName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{comment.userName}</span>
                        {comment.userEmail && (
                          <span className="text-xs text-white/40 font-mono">({comment.userEmail})</span>
                        )}
                        {comment.type === 'question' && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            comment.isAnswered
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                              : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                          }`}>
                            {comment.isAnswered ? '✓ ANSWERED' : 'UNANSWERED QUESTION'}
                          </span>
                        )}
                        {comment.isPinned && (
                          <span className="px-2 py-0.5 rounded-full bg-[#c79c6e]/20 border border-[#c79c6e]/50 text-[#c79c6e] text-[9px] font-bold uppercase tracking-wider">
                            PINNED
                          </span>
                        )}
                        {isHidden && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] font-bold uppercase tracking-wider">
                            HIDDEN
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-white/40 mt-0.5">
                        <span>{formatRelativeTime(comment.createdAt)}</span>
                        {comment.lessonTitle && (
                          <>
                            <span>•</span>
                            <span className="text-[#c79c6e]/80 truncate max-w-xs">{comment.lessonTitle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() => handleTogglePin(comment._id)}
                      title={comment.isPinned ? 'Unpin comment' : 'Pin comment to top'}
                      className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                        comment.isPinned
                          ? 'bg-[#c79c6e]/20 text-[#c79c6e] border border-[#c79c6e]/40'
                          : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <PushPin size={14} weight={comment.isPinned ? 'fill' : 'regular'} />
                      <span className="hidden md:inline">{comment.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleHide(comment._id, isHidden)}
                      title={isHidden ? 'Restore comment' : 'Hide comment'}
                      className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                        isHidden
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {isHidden ? <Eye size={14} /> : <EyeSlash size={14} />}
                      <span className="hidden md:inline">{isHidden ? 'Restore' : 'Hide'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      title="Delete comment"
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash size={14} />
                      <span className="hidden md:inline">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap mb-4 bg-black/30 p-3.5 rounded-xl border border-white/5">
                  {comment.content}
                </p>

                {/* Replies Thread */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="space-y-2.5 mb-4 pl-4 border-l-2 border-[#c79c6e]/30">
                    {comment.replies.map((reply) => {
                      const isInstructor = reply.authorRole === 'instructor' || reply.authorBadge === 'COURSE INSTRUCTOR';
                      return (
                        <div
                          key={reply._id}
                          className={`p-3 rounded-xl border text-xs leading-relaxed ${
                            isInstructor
                              ? 'bg-gradient-to-r from-[#17140e] to-[#0a0a0a] border-[#c79c6e]/40'
                              : 'bg-white/[0.02] border-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{reply.userName}</span>
                              {isInstructor && (
                                <span className="px-1.5 py-0.2 rounded bg-[#c79c6e]/20 border border-[#c79c6e]/40 text-[#c79c6e] text-[8px] font-bold uppercase tracking-wider">
                                  INSTRUCTOR
                                </span>
                              )}
                              <span className="text-[10px] text-white/40">{formatRelativeTime(reply.createdAt)}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(reply._id)}
                              className="text-rose-400/60 hover:text-rose-400 p-1"
                              title="Delete reply"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                          <p className="text-white/80 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Inline Instructor Reply Box */}
                {isReplying ? (
                  <div className="pt-3 border-t border-white/10 space-y-2.5">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Write an instructor response to ${comment.userName}...`}
                      className="w-full p-3.5 rounded-xl bg-black/60 border border-[#c79c6e]/40 text-white text-xs placeholder-white/30 outline-none focus:border-[#c79c6e] leading-relaxed resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setReplyingCommentId(null);
                          setReplyText('');
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs text-white/60 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isSubmittingReply || !replyText.trim()}
                        onClick={() => handlePostReply(comment._id)}
                        className="px-4 py-1.5 rounded-lg bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50"
                      >
                        {isSubmittingReply ? <CircleNotch size={13} className="animate-spin" /> : <PaperPlaneRight size={13} weight="fill" />}
                        <span>POST INSTRUCTOR REPLY</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-white/40">
                      {comment.replyCount || 0} {comment.replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                    <button
                      onClick={() => {
                        setReplyingCommentId(comment._id);
                        setReplyText('');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#c79c6e]/10 border border-[#c79c6e]/30 hover:bg-[#c79c6e]/20 text-[#c79c6e] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <PaperPlaneRight size={13} weight="fill" />
                      <span>Reply as Instructor</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => fetchAdminComments(page - 1)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs disabled:opacity-30 disabled:pointer-events-none"
              >
                Previous
              </button>
              <span className="text-xs text-white/50 font-mono px-3">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchAdminComments(page + 1)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs disabled:opacity-30 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
