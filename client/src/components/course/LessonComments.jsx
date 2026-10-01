import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Heart, 
  ChatCircleDots, 
  DotsThree, 
  PencilSimple, 
  Trash, 
  PaperPlaneRight, 
  X, 
  Sparkle,
  CircleNotch,
  WarningCircle,
  Check,
  PushPin,
  EyeSlash,
  Eye,
  Question,
  ShieldCheck
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to format relative timestamps
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInSeconds / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;

  return past.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

// Helper to get initials from user name
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function LessonComments({ 
  lessonId, 
  lessonTitle = 'this lesson', 
  onRequireAuth 
}) {
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAdminView, setIsAdminView] = useState(false);

  // Comment Box State
  const [newCommentText, setNewCommentText] = useState('');
  const [commentType, setCommentType] = useState('comment'); // 'comment' | 'question'
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);

  // Edit State
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Modal State
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Three-dot dropdown menu open state
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // New comment highlight
  const [highlightedCommentId, setHighlightedCommentId] = useState(null);
  const newCommentInputRef = useRef(null);

  // Get current logged-in user details
  const getAuthDetails = useCallback(() => {
    const courseToken = localStorage.getItem('courseToken');
    const regularToken = localStorage.getItem('token');
    const token = courseToken || regularToken;

    let user = null;
    const courseUserStr = localStorage.getItem('courseUser');
    const userInfoStr = localStorage.getItem('userInfo');

    if (courseUserStr) {
      try {
        user = JSON.parse(courseUserStr);
      } catch {
        user = null;
      }
    } else if (userInfoStr) {
      try {
        user = JSON.parse(userInfoStr);
      } catch {
        user = null;
      }
    }

    return {
      isAuthenticated: !!token,
      isAdmin: false,
      token,
      user,
      userId: user?._id || user?.id || null,
      userName: user?.fullName || user?.name || 'You',
    };
  }, []);

  const auth = getAuthDetails();

  // Helper to determine if a comment was authored by the currently logged in student
  const isSelfComment = useCallback((c) => {
    if (!c) return false;

    // Administrator / Instructor comments can NEVER be deleted from the course player view
    if (
      c.authorRole === 'instructor' || 
      c.authorRole === 'admin' || 
      c.authorBadge === 'COURSE INSTRUCTOR' || 
      c.userName === 'Administrator' || 
      c.userName === 'Aarkesh (Instructor)'
    ) {
      return false;
    }

    const authState = getAuthDetails();
    if (!authState.isAuthenticated || authState.isAdmin) return false;

    const currentUserId = authState.userId ? authState.userId.toString() : null;
    const currentEmail = authState.user?.email ? authState.user.email.toLowerCase().trim() : null;

    const commentUserId = typeof c.userId === 'object' && c.userId !== null
      ? (c.userId._id || c.userId.id)?.toString()
      : c.userId?.toString();

    const commentUserEmail = c.userEmail ? c.userEmail.toLowerCase().trim() : null;

    if (currentUserId && commentUserId && currentUserId === commentUserId) {
      return true;
    }

    if (currentEmail && commentUserEmail && currentEmail === commentUserEmail) {
      return true;
    }

    return false;
  }, [getAuthDetails]);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch comments whenever lessonId changes
  useEffect(() => {
    if (!lessonId) return;

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage('');
    setPage(1);
    setNewCommentText('');
    setActiveReplyCommentId(null);
    setEditingCommentId(null);
    setOpenMenuId(null);

    const fetchLessonComments = async () => {
      try {
        const { token } = getAuthDetails();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${API_URL}/api/comments/lesson/${lessonId}?page=1&limit=20`, { headers });
        if (!res.ok) {
          throw new Error('Failed to load comments');
        }
        const data = await res.json();
        if (isMounted) {
          setComments(data.comments || []);
          setTotalComments(data.totalComments || 0);
          setHasMore(data.hasMore || false);
          setIsAdminView(!!data.isAdmin);
          setPage(1);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching comments:', err);
          setErrorMessage('Unable to load comments at this time.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLessonComments();

    return () => {
      isMounted = false;
    };
  }, [lessonId, getAuthDetails]);

  // Load More Comments
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const { token } = getAuthDetails();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_URL}/api/comments/lesson/${lessonId}?page=${nextPage}&limit=20`, { headers });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, ...(data.comments || [])]);
        setPage(nextPage);
        setHasMore(data.hasMore || false);
      }
    } catch (err) {
      console.error('Failed to load more comments:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Check auth or trigger login prompt
  const requireAuthentication = () => {
    const { isAuthenticated } = getAuthDetails();
    if (!isAuthenticated) {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        alert('Please sign in or enroll in the course to interact with comments.');
      }
      return false;
    }
    return true;
  };

  // Post Top-Level Comment / Question
  const handlePostComment = async (e) => {
    if (e) e.preventDefault();
    if (!requireAuthentication()) return;

    const trimmed = newCommentText.trim();
    if (!trimmed) return;

    setIsPosting(true);
    setErrorMessage('');

    try {
      const { token } = getAuthDetails();
      const res = await fetch(`${API_URL}/api/comments/lesson/${lessonId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          content: trimmed,
          type: commentType,
          lessonTitle,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [data, ...prev]);
        setTotalComments((prev) => prev + 1);
        setNewCommentText('');
        setHighlightedCommentId(data._id);
        setTimeout(() => setHighlightedCommentId(null), 3000);
      } else {
        setErrorMessage(data.message || 'Failed to post comment.');
      }
    } catch (err) {
      console.error('Comment submission error:', err);
      setErrorMessage('Network error while posting your comment. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // Post Reply (Student or Admin)
  const handlePostReply = async (parentCommentId) => {
    if (!requireAuthentication()) return;

    const trimmed = replyText.trim();
    if (!trimmed) return;

    setIsPostingReply(true);

    try {
      const { token, isAdmin } = getAuthDetails();
      const res = await fetch(`${API_URL}/api/comments/${parentCommentId}/reply`, {
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
            if (c._id === parentCommentId) {
              const currentReplies = c.replies || [];
              return {
                ...c,
                isAnswered: isAdmin ? true : c.isAnswered,
                replies: [...currentReplies, newReply],
                replyCount: (c.replyCount || 0) + 1,
              };
            }
            return c;
          })
        );
        setTotalComments((prev) => prev + 1);
        setReplyText('');
        setActiveReplyCommentId(null);
        setHighlightedCommentId(newReply._id);
        setTimeout(() => setHighlightedCommentId(null), 3000);
      } else {
        alert(newReply.message || 'Failed to post reply.');
      }
    } catch (err) {
      console.error('Reply submission error:', err);
      alert('Network error while posting reply.');
    } finally {
      setIsPostingReply(false);
    }
  };

  // Like / Unlike Toggle
  const handleToggleLike = async (commentId, isReply = false, parentId = null) => {
    if (!requireAuthentication()) return;

    // Optimistic UI update
    setComments((prev) =>
      prev.map((c) => {
        if (!isReply && c._id === commentId) {
          const nextHasLiked = !c.hasLiked;
          const nextCount = Math.max(0, c.likesCount + (nextHasLiked ? 1 : -1));
          return { ...c, hasLiked: nextHasLiked, likesCount: nextCount };
        }
        if (isReply && c._id === parentId && c.replies) {
          const updatedReplies = c.replies.map((r) => {
            if (r._id === commentId) {
              const nextHasLiked = !r.hasLiked;
              const nextCount = Math.max(0, r.likesCount + (nextHasLiked ? 1 : -1));
              return { ...r, hasLiked: nextHasLiked, likesCount: nextCount };
            }
            return r;
          });
          return { ...c, replies: updatedReplies };
        }
        return c;
      })
    );

    try {
      const { token } = getAuthDetails();
      const res = await fetch(`${API_URL}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Like toggle failed:', data.message);
      }
    } catch (err) {
      console.error('Like network error:', err);
    }
  };

  // Toggle Pin (Admin Only)
  const handleTogglePin = async (commentId) => {
    try {
      const { token } = getAuthDetails();
      const res = await fetch(`${API_URL}/api/comments/${commentId}/pin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => {
          const updated = prev.map((c) => (c._id === commentId ? { ...c, isPinned: data.isPinned } : c));
          // Re-sort: pinned comments first
          return [...updated].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
        });
      } else {
        alert(data.message || 'Failed to toggle pin state');
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  // Hide Comment (Admin Only)
  const handleHideComment = async (commentId) => {
    try {
      const { token } = getAuthDetails();
      const res = await fetch(`${API_URL}/api/comments/${commentId}/hide`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, status: 'hidden' } : c))
        );
      } else {
        alert(data.message || 'Failed to hide comment');
      }
    } catch (err) {
      console.error('Error hiding comment:', err);
    }
  };

  // Restore Comment (Admin Only)
  const handleRestoreComment = async (commentId) => {
    try {
      const { token } = getAuthDetails();
      const res = await fetch(`${API_URL}/api/comments/${commentId}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, status: 'active' } : c))
        );
      } else {
        alert(data.message || 'Failed to restore comment');
      }
    } catch (err) {
      console.error('Error restoring comment:', err);
    }
  };

  // Save Edit
  const handleSaveEdit = async (commentId, isReply = false, parentId = null) => {
    if (!requireAuthentication()) return;

    const trimmed = editText.trim();
    if (!trimmed) return;

    setIsSavingEdit(true);

    try {
      const { token } = getAuthDetails();
      const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => {
            if (!isReply && c._id === commentId) {
              return { ...c, content: trimmed, isEdited: true };
            }
            if (isReply && c._id === parentId && c.replies) {
              const updatedReplies = c.replies.map((r) =>
                r._id === commentId ? { ...r, content: trimmed, isEdited: true } : r
              );
              return { ...c, replies: updatedReplies };
            }
            return c;
          })
        );
        setEditingCommentId(null);
        setEditText('');
      } else {
        alert(data.message || 'Failed to update comment.');
      }
    } catch (err) {
      console.error('Edit network error:', err);
      alert('Network error while updating comment.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    setIsDeleting(true);

    try {
      const { token } = getAuthDetails();
      const res = await fetch(`${API_URL}/api/comments/${commentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        if (!commentToDelete.isReply) {
          setComments((prev) => prev.filter((c) => c._id !== commentToDelete.id));
          setTotalComments((prev) => Math.max(0, prev - (1 + (commentToDelete.replyCount || 0))));
        } else {
          setComments((prev) =>
            prev.map((c) => {
              if (c._id === commentToDelete.parentId && c.replies) {
                return {
                  ...c,
                  replies: c.replies.filter((r) => r._id !== commentToDelete.id),
                  replyCount: Math.max(0, (c.replyCount || 1) - 1),
                };
              }
              return c;
            })
          );
          setTotalComments((prev) => Math.max(0, prev - 1));
        }
        setCommentToDelete(null);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete comment.');
      }
    } catch (err) {
      console.error('Delete network error:', err);
      alert('Network error while deleting comment.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section 
      className="mt-8 pt-8 border-t border-white/10"
      aria-label="Lesson Comments Section"
    >
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[0.68rem] uppercase tracking-[0.2em] text-[#E3B8DE] font-semibold flex items-center gap-1.5">
              <Sparkle size={13} weight="fill" className="text-[#C878BE]" />
              COMMENTS & DISCUSSIONS
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#C878BE]/10 border border-[#C878BE]/20 text-[11px] text-[#E3B8DE] font-mono">
              {totalComments}
            </span>
          </div>
          <h3 
            className="text-xl md:text-2xl text-white font-bold tracking-tight"
            style={{ fontFamily: 'var(--head)' }}
          >
            Join the conversation
          </h3>
        </div>
      </div>

      {/* ── Top Level Comment Creation Box ── */}
      <div className="bg-[#0e0a16] border border-[#C878BE]/20 rounded-2xl p-4 md:p-6 shadow-xl relative focus-within:border-[#C878BE]/50 focus-within:shadow-[0_0_25px_rgba(200,120,190,0.18)] transition-all mb-8">
        <div className="flex items-start gap-3 md:gap-4">
          {/* Current User Avatar */}
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#2a1330] to-[#160b1c] border border-[#C878BE]/40 text-[#E3B8DE] flex items-center justify-center text-xs md:text-sm font-bold shrink-0 shadow-sm">
            {auth.isAuthenticated ? getInitials(auth.userName) : <ChatCircleDots size={18} />}
          </div>

          <div className="flex-1 min-w-0">
            <textarea
              ref={newCommentInputRef}
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onFocus={() => {
                if (!auth.isAuthenticated) {
                  requireAuthentication();
                }
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handlePostComment();
                }
              }}
              placeholder={`Share your thoughts about ${lessonTitle}... (Ctrl + Enter to submit)`}
              maxLength={3000}
              className="w-full bg-transparent text-white text-sm md:text-base placeholder-white/30 border-none outline-none resize-none leading-relaxed"
            />

            {/* Input Action Toolbar */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/[0.06]">
              <span className="text-[11px] text-white/30 font-mono">
                {newCommentText.length > 0 ? `${newCommentText.length}/3000` : ''}
              </span>

              <button
                type="button"
                disabled={isPosting || !newCommentText.trim()}
                onClick={handlePostComment}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] hover:from-[#BA45A7] hover:to-[#8E3283] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-2 hover:shadow-[0_0_20px_rgba(200,120,190,0.35)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                {isPosting ? (
                  <>
                    <CircleNotch size={14} className="animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <span>POST COMMENT</span>
                    <PaperPlaneRight size={14} weight="fill" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
            <WarningCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* ── Comments Feed ── */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-24 h-3 bg-white/10 rounded" />
                  <div className="w-16 h-2 bg-white/5 rounded" />
                </div>
              </div>
              <div className="w-3/4 h-3 bg-white/10 rounded" />
              <div className="w-1/2 h-3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        /* Empty State */
        <div className="p-10 md:p-14 text-center rounded-2xl bg-gradient-to-b from-[#140b20]/60 to-transparent border border-[#C878BE]/15">
          <div className="w-12 h-12 rounded-full bg-[#C878BE]/15 border border-[#C878BE]/30 text-[#E3B8DE] flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(200,120,190,0.2)]">
            <Sparkle size={22} weight="duotone" />
          </div>
          <h4 
            className="text-lg md:text-xl text-white font-semibold mb-1"
            style={{ fontFamily: 'var(--head)' }}
          >
            Start the conversation
          </h4>
          <p className="text-white/50 text-xs md:text-sm max-w-sm mx-auto leading-relaxed">
            Be the first to share your takeaways, insights, or ask a question regarding this lesson.
          </p>
        </div>
      ) : (
        /* Comments List */
        <div className="space-y-4">
          {comments.map((comment) => {
            const isInstructorComment = 
              comment.authorRole === 'instructor' || 
              comment.authorRole === 'admin' || 
              comment.authorBadge === 'COURSE INSTRUCTOR' ||
              comment.userName === 'Administrator' ||
              comment.userName === 'Aarkesh (Instructor)' ||
              comment.userEmail?.toLowerCase() === 'admin@aarkeshgupta.com' ||
              comment.userEmail?.toLowerCase() === 'admin@betterwithaarkesh.com';

            const isOwner = auth.isAdmin || (auth.userId && (comment.userId === auth.userId || comment.userId?._id === auth.userId));
            const isEditingThis = editingCommentId === comment._id;
            const isReplyingThis = activeReplyCommentId === comment._id;
            const isHighlighted = highlightedCommentId === comment._id;
            const isHidden = comment.status === 'hidden';

            return (
              <div
                key={comment._id}
                className={`p-4 md:p-6 rounded-2xl border transition-all duration-300 ${
                  isInstructorComment
                    ? 'bg-gradient-to-r from-[#200c24] via-[#16091b] to-[#0c0510] border-[#C878BE]/60 shadow-[0_0_30px_rgba(200,120,190,0.16)] ring-1 ring-[#C878BE]/30'
                    : isHighlighted
                    ? 'bg-[#0f0a1c] border-[#C878BE] shadow-[0_0_20px_rgba(200,120,190,0.25)]'
                    : 'bg-[#0c0816] border-white/10 hover:border-[#C878BE]/30'
                } ${isHidden ? 'opacity-60 border-dashed border-amber-500/40' : ''}`}
              >
                {/* ── Badges Row (Pinned / Hidden) ── */}
                {(comment.isPinned || isHidden) && (
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {comment.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C878BE]/20 border border-[#C878BE]/50 text-[#E3B8DE] text-[10px] font-bold uppercase tracking-wider">
                        <PushPin size={11} weight="fill" />
                        PINNED
                      </span>
                    )}

                    {isHidden && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
                        <EyeSlash size={11} />
                        HIDDEN FROM STUDENTS
                      </span>
                    )}
                  </div>
                )}

                {/* ── Comment Author & Header ── */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      isInstructorComment
                        ? 'bg-gradient-to-br from-[#E3B8DE] via-[#C878BE] to-[#8E3283] text-black shadow-[0_0_15px_rgba(200,120,190,0.4)] ring-2 ring-[#C878BE]/50'
                        : 'bg-gradient-to-br from-[#2a1330] to-[#160b1c] border border-[#C878BE]/40 text-[#E3B8DE]'
                    }`}>
                      {isInstructorComment ? 'A' : getInitials(comment.userName)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm md:text-base font-semibold truncate ${
                          isInstructorComment ? 'text-[#E3B8DE]' : 'text-white'
                        }`}>
                          {comment.userName}
                        </span>

                        {isInstructorComment && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm border border-[#C878BE]/30">
                            <Sparkle size={10} weight="fill" />
                            COURSE INSTRUCTOR
                          </span>
                        )}

                        {comment.isEdited && (
                          <span className="text-[10px] text-white/30 italic">
                            (edited)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-white/40">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Options Menu (Strictly only for own/self comments) */}
                  {isSelfComment(comment) && (
                    <div className="relative" ref={openMenuId === comment._id ? menuRef : null}>
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === comment._id ? null : comment._id)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label="Comment options"
                      >
                        <DotsThree size={20} weight="bold" />
                      </button>

                      {openMenuId === comment._id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-[#170e24] border border-white/15 rounded-xl shadow-2xl py-1.5 z-20 backdrop-blur-md">
                          <button
                            type="button"
                            onClick={() => {
                              setCommentToDelete({
                                id: comment._id,
                                isReply: false,
                                replyCount: comment.replyCount || 0,
                              });
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Trash size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Comment Body or Inline Edit Mode ── */}
                {isEditingThis ? (
                  <div className="space-y-3 my-2">
                    <textarea
                      rows={3}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setEditingCommentId(null);
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSaveEdit(comment._id, false);
                      }}
                      className="w-full p-3 rounded-xl bg-black/40 border border-[#C878BE]/40 text-white text-sm leading-relaxed outline-none resize-none focus:border-[#C878BE]"
                      maxLength={3000}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCommentId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Cancel (Esc)
                      </button>
                      <button
                        type="button"
                        disabled={isSavingEdit || !editText.trim()}
                        onClick={() => handleSaveEdit(comment._id, false)}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        {isSavingEdit ? <CircleNotch size={12} className="animate-spin" /> : <Check size={12} weight="bold" />}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/85 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words mb-4">
                    {comment.content}
                  </p>
                )}

                {/* ── Action Bar: Like & Reply ── */}
                <div className="flex items-center gap-3 text-xs">
                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleLike(comment._id, false)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      comment.hasLiked
                        ? 'bg-[#C878BE]/20 border-[#C878BE]/50 text-[#E3B8DE] shadow-[0_0_12px_rgba(200,120,190,0.2)]'
                        : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Heart size={14} weight={comment.hasLiked ? 'fill' : 'regular'} className={comment.hasLiked ? 'text-[#E3B8DE]' : ''} />
                    <span className="font-mono font-medium">{comment.likesCount || 0}</span>
                  </button>

                  {/* Reply Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!requireAuthentication()) return;
                      setActiveReplyCommentId(isReplyingThis ? null : comment._id);
                      setReplyText('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-white/60 hover:text-[#E3B8DE] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <ChatCircleDots size={14} />
                    <span>Reply</span>
                  </button>
                </div>

                {/* ── Inline Reply Input Box ── */}
                {isReplyingThis && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-gradient-to-br from-[#2a1330] to-[#160b1c] border border-[#C878BE]/40 text-[#E3B8DE]">
                        {getInitials(auth.userName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setActiveReplyCommentId(null);
                            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handlePostReply(comment._id);
                          }}
                          placeholder={`Reply to ${comment.userName}... (Esc to cancel)`}
                          maxLength={3000}
                          autoFocus
                          className="w-full p-3 rounded-xl bg-black/50 border border-[#C878BE]/30 text-white text-sm placeholder-white/30 focus:border-[#C878BE] outline-none resize-none leading-relaxed"
                        />
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setActiveReplyCommentId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isPostingReply || !replyText.trim()}
                            onClick={() => handlePostReply(comment._id)}
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(200,120,190,0.25)]"
                          >
                            {isPostingReply ? (
                              <CircleNotch size={12} className="animate-spin" />
                            ) : (
                              <PaperPlaneRight size={12} weight="fill" />
                            )}
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Nested Replies Thread (1-level strictly) ── */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3 pl-3 md:pl-6 border-l-2 border-[#C878BE]/30 ml-2 md:ml-3">
                    {comment.replies.map((reply) => {
                      const isInstructorReply = 
                        reply.authorRole === 'instructor' || 
                        reply.authorRole === 'admin' || 
                        reply.authorBadge === 'COURSE INSTRUCTOR' ||
                        reply.userName === 'Administrator' ||
                        reply.userName === 'Aarkesh (Instructor)' ||
                        reply.userEmail?.toLowerCase() === 'admin@aarkeshgupta.com' ||
                        reply.userEmail?.toLowerCase() === 'admin@betterwithaarkesh.com';

                      const isReplyOwner = auth.isAdmin || (auth.userId && (reply.userId === auth.userId || reply.userId?._id === auth.userId));
                      const isEditingReply = editingCommentId === reply._id;
                      const isReplyHighlighted = highlightedCommentId === reply._id;

                      return (
                        <div
                          key={reply._id}
                          className={`p-3.5 md:p-4 rounded-xl border transition-all ${
                            isInstructorReply
                              ? 'bg-gradient-to-r from-[#200c24] via-[#16091b] to-[#0c0510] border-[#C878BE]/60 shadow-[0_0_20px_rgba(200,120,190,0.15)] ring-1 ring-[#C878BE]/30'
                              : isReplyHighlighted
                              ? 'bg-[#140b20] border-[#C878BE] shadow-[0_0_15px_rgba(200,120,190,0.2)]'
                              : 'bg-white/[0.02] border-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isInstructorReply
                                  ? 'bg-gradient-to-br from-[#E3B8DE] via-[#C878BE] to-[#8E3283] text-black shadow-[0_0_12px_rgba(200,120,190,0.4)] ring-2 ring-[#C878BE]/50'
                                  : 'bg-gradient-to-br from-[#2a1330] to-[#160b1c] border border-[#C878BE]/40 text-[#E3B8DE]'
                              }`}>
                                {isInstructorReply ? 'A' : getInitials(reply.userName)}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs md:text-sm font-semibold truncate ${
                                    isInstructorReply ? 'text-[#E3B8DE]' : 'text-white'
                                  }`}>
                                    {reply.userName}
                                  </span>

                                  {isInstructorReply && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm border border-[#C878BE]/30">
                                      <Sparkle size={9} weight="fill" />
                                      COURSE INSTRUCTOR
                                    </span>
                                  )}

                                  {reply.isEdited && (
                                    <span className="text-[9px] text-white/30 italic">
                                      (edited)
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-white/40">
                                  {formatRelativeTime(reply.createdAt)}
                                </span>
                              </div>
                            </div>

                            {/* Reply Three Dots (Strictly only for own/self replies) */}
                            {isSelfComment(reply) && (
                              <div className="relative" ref={openMenuId === reply._id ? menuRef : null}>
                                <button
                                  type="button"
                                  onClick={() => setOpenMenuId(openMenuId === reply._id ? null : reply._id)}
                                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                                  aria-label="Reply options"
                                >
                                  <DotsThree size={18} weight="bold" />
                                </button>

                                {openMenuId === reply._id && (
                                  <div className="absolute right-0 top-full mt-1 w-28 bg-[#170e24] border border-white/15 rounded-xl shadow-2xl py-1 z-20">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCommentToDelete({
                                          id: reply._id,
                                          isReply: true,
                                          parentId: comment._id,
                                        });
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Trash size={13} />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Reply Body or Edit Mode */}
                          {isEditingReply ? (
                            <div className="space-y-2 my-1">
                              <textarea
                                rows={2}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') setEditingCommentId(null);
                                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                    handleSaveEdit(reply._id, true, comment._id);
                                  }
                                }}
                                className="w-full p-2.5 rounded-lg bg-black/50 border border-[#C878BE]/40 text-white text-xs leading-relaxed outline-none resize-none"
                                maxLength={3000}
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingCommentId(null)}
                                  className="px-2.5 py-1 rounded text-xs text-white/50 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isSavingEdit || !editText.trim()}
                                  onClick={() => handleSaveEdit(reply._id, true, comment._id)}
                                  className="px-3 py-1 rounded bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white font-semibold text-xs uppercase"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white/80 text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words mb-2">
                              {reply.content}
                            </p>
                          )}

                          {/* Reply Like button */}
                          <button
                            type="button"
                            onClick={() => handleToggleLike(reply._id, true, comment._id)}
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] transition-all cursor-pointer ${
                              reply.hasLiked
                                ? 'bg-[#C878BE]/20 border-[#C878BE]/50 text-[#E3B8DE]'
                                : 'bg-transparent border-white/10 text-white/50 hover:text-white'
                            }`}
                          >
                            <Heart size={12} weight={reply.hasLiked ? 'fill' : 'regular'} className={reply.hasLiked ? 'text-[#E3B8DE]' : ''} />
                            <span className="font-mono">{reply.likesCount || 0}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Pagination / Load More ── */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={handleLoadMore}
                className="px-6 py-2.5 rounded-xl bg-white/[0.04] hover:bg-[#C878BE]/10 border border-white/10 hover:border-[#C878BE]/40 text-xs font-semibold text-white/80 hover:text-[#E3B8DE] uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 mx-auto cursor-pointer shadow-sm"
              >
                {isLoadingMore ? (
                  <>
                    <CircleNotch size={14} className="animate-spin text-[#C878BE]" />
                    <span>Loading more comments...</span>
                  </>
                ) : (
                  <span>Load more comments</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {commentToDelete && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-[#130b1c] border border-[#C878BE]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 
                className="text-lg text-white font-semibold"
                style={{ fontFamily: 'var(--head)' }}
              >
                Delete comment?
              </h4>
              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-white/60 text-xs md:text-sm leading-relaxed">
              Are you sure you want to delete this comment?
              {!commentToDelete.isReply && commentToDelete.replyCount > 0
                ? ' This will also remove all nested replies.'
                : ' This action cannot be undone.'}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? <CircleNotch size={14} className="animate-spin" /> : <Trash size={14} />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
