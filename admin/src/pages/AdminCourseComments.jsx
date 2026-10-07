import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../utils/apiUrl';
import './AdminCourseComments.css';

// SVG Icons
const Icon = ({ name, size = 16, className = '', fill = 'none' }) => {
  const icons = {
    heart: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>,
    pin: <><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z"/><path d="M12 14v7"/></>,
    check: <path d="M20 6L9 17l-5-5"/>,
    checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></>,
    reply: <><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
    sparkle: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icons[name] || null}
    </svg>
  );
};

// Human-friendly time formatting
const formatTimeAgo = (dateVal) => {
  if (!dateVal) return 'just now';
  const t = new Date(dateVal).getTime();
  const diff = Date.now() - t;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  const d = new Date(t);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatFullDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function AdminCourseComments() {
  const { showSuccess, showError, showInfo } = useToast();

  const [courses, setCourses] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedLesson, setSelectedLesson] = useState('all');
  const [activeTab, setActiveTab] = useState('needs'); // 'needs' | 'all' | 'answered' | 'pinned' | 'hidden'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected comment for active conversation
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  // Reply Composer
  const [replyText, setReplyText] = useState('');
  const [markAnsweredOnReply, setMarkAnsweredOnReply] = useState(true);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Delete Confirm Modal
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // 0. Fetch Global Comment Settings
  const fetchCommentSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/comments/settings`);
      if (res.ok) {
        const data = await res.json();
        setCommentsEnabled(data.enabled !== false);
      }
    } catch (err) {
      console.error('Failed to load comment settings:', err);
    }
  }, []);

  useEffect(() => {
    fetchCommentSettings();
  }, [fetchCommentSettings]);

  // Master Toggle Handler (Turn Comment Section ON / OFF)
  const handleToggleCommentsEnabled = async () => {
    const nextState = !commentsEnabled;
    setIsTogglingStatus(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: nextState }),
      });

      if (res.ok) {
        const data = await res.json();
        setCommentsEnabled(data.enabled !== false);
        if (data.enabled !== false) {
          showSuccess('Course Comments are now ENABLED for all students.');
        } else {
          showInfo('Course Comments are now TURNED OFF. Students cannot view or post comments.');
        }
      } else {
        showError('Failed to update comment section status.');
      }
    } catch (err) {
      console.error('Error toggling comment status:', err);
      showError('Network error while toggling comment status.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // 1. Fetch Course Tree
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_URL}/api/courses/details-settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const map = await res.json();
          const list = Object.entries(map).map(([slug, val]) => {
            const lessonsList = [];
            (val.days || []).forEach((d, dIdx) => {
              (d.lessons || []).forEach((l, lIdx) => {
                lessonsList.push({
                  id: l.id || `${slug}-l${dIdx + 1}-${lIdx + 1}`,
                  title: l.t || `Lesson ${lIdx + 1}`,
                  module: d.t || `Module ${dIdx + 1}`
                });
              });
            });

            if (!lessonsList.length) {
              lessonsList.push({
                id: `${slug}-l1`,
                title: 'Lesson 1: Overview',
                module: 'Module 1'
              });
            }

            return {
              id: slug,
              name: val.title || slug,
              lessons: lessonsList
            };
          });
          setCourses(list);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    fetchCourses();
  }, []);

  // 2. Fetch Comments
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: '1',
        limit: '150',
        ...(selectedCourse !== 'all' ? { courseSlug: selectedCourse } : {}),
        ...(selectedLesson !== 'all' ? { lessonId: selectedLesson } : {}),
        ...(searchQuery ? { search: searchQuery } : {})
      });

      const res = await fetch(`${API_URL}/api/comments/admin/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourse, selectedLesson, searchQuery]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Real-time live websocket sync
  useEffect(() => {
    const socketUrl = API_URL.startsWith('http') ? API_URL : window.location.origin;
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.emit('join_admin');

    socket.on('comment:new', (newComment) => {
      setComments((prev) => {
        if (prev.some((c) => c._id === newComment._id)) return prev;
        return [newComment, ...prev];
      });
      showInfo(`New comment from ${newComment.userName}`);
    });

    socket.on('comment:reply', ({ parentCommentId, reply, isAnswered }) => {
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === parentCommentId) {
            const currentReplies = c.replies || [];
            if (currentReplies.some((r) => r._id === reply._id)) return c;
            return {
              ...c,
              isAnswered: isAnswered !== undefined ? isAnswered : c.isAnswered,
              replies: [...currentReplies, reply],
              replyCount: (c.replyCount || 0) + 1,
            };
          }
          return c;
        })
      );
    });

    socket.on('comment:liked', ({ commentId, likesCount }) => {
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId) {
            return { ...c, likesCount };
          }
          if (c.replies?.some((r) => r._id === commentId)) {
            return {
              ...c,
              replies: c.replies.map((r) => (r._id === commentId ? { ...r, likesCount } : r)),
            };
          }
          return c;
        })
      );
    });

    socket.on('comment:pinned', ({ commentId, isPinned }) => {
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, isPinned } : c))
      );
    });

    socket.on('comment:status', ({ commentId, status }) => {
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, status } : c))
      );
    });

    socket.on('comment:deleted', ({ commentId, parentId }) => {
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === parentId
              ? { ...c, replies: (c.replies || []).filter((r) => r._id !== commentId) }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    });

    socket.on('comments:settings_updated', (data) => {
      if (data && typeof data.enabled === 'boolean') {
        setCommentsEnabled(data.enabled);
      }
    });

    return () => socket.disconnect();
  }, [showInfo]);

  // Helpers
  const hasInstructorReply = (c) =>
    c.replies?.some(r => r.authorRole === 'instructor' || r.authorRole === 'admin' || r.by === 'instructor');

  const isNeedsReply = (c) =>
    c.status !== 'hidden' && !c.isAnswered && !hasInstructorReply(c);

  const isAnswered = (c) =>
    c.isAnswered || hasInstructorReply(c);

  const getCourseTitle = (slug) => {
    const found = courses.find(c => c.id === slug || c.id?.toLowerCase() === (slug || '').toLowerCase());
    return found ? found.name : slug || 'Course';
  };

  const getLessonTitle = (slug, lid) => {
    const foundCourse = courses.find(c => c.id === slug || c.id?.toLowerCase() === (slug || '').toLowerCase());
    if (!foundCourse) return lid || 'Lesson';
    const foundLesson = foundCourse.lessons.find(l => l.id === lid);
    return foundLesson ? `${foundLesson.module} • ${foundLesson.title}` : lid || 'Lesson';
  };

  // Filter Comments by Tab and Search
  const filteredComments = comments.filter((c) => {
    if (selectedCourse !== 'all' && (c.courseSlug || 'better-man').toLowerCase() !== selectedCourse.toLowerCase()) {
      return false;
    }
    if (selectedLesson !== 'all' && c.lessonId !== selectedLesson) {
      return false;
    }

    if (activeTab === 'needs' && !isNeedsReply(c)) return false;
    if (activeTab === 'answered' && (!isAnswered(c) || c.status === 'hidden')) return false;
    if (activeTab === 'pinned' && !c.isPinned) return false;
    if (activeTab === 'hidden' && c.status !== 'hidden') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchContent = (c.content || '').toLowerCase().includes(q);
      const matchName = (c.userName || '').toLowerCase().includes(q);
      const matchEmail = (c.userEmail || '').toLowerCase().includes(q);
      if (!matchContent && !matchName && !matchEmail) return false;
    }

    return true;
  }).sort((a, b) => {
    if (b.isPinned !== a.isPinned) return b.isPinned ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Keep first comment selected if current selected is invalid
  useEffect(() => {
    if (filteredComments.length > 0) {
      if (!selectedCommentId || !filteredComments.some(c => c._id === selectedCommentId)) {
        setSelectedCommentId(filteredComments[0]._id);
      }
    } else {
      setSelectedCommentId(null);
    }
  }, [filteredComments, selectedCommentId]);

  const activeComment = comments.find(c => c._id === selectedCommentId);

  // Available lessons for dropdown
  const currentCourseLessons = selectedCourse === 'all'
    ? []
    : courses.find(c => c.id === selectedCourse)?.lessons || [];

  // Actions: Heart / Like
  const handleToggleLike = async (target, isReply = false, parentId = null) => {
    const targetId = target._id || target.id;
    if (!targetId) return;

    setComments(prev =>
      prev.map(item => {
        if (!isReply && item._id === targetId) {
          const nextHasLiked = !item.hasLiked;
          const nextCount = Math.max(0, (item.likesCount || 0) + (nextHasLiked ? 1 : -1));
          return { ...item, hasLiked: nextHasLiked, likesCount: nextCount };
        }
        if (isReply && item._id === parentId && item.replies) {
          return {
            ...item,
            replies: item.replies.map(r => {
              if ((r._id || r.id) === targetId) {
                const nextHasLiked = !r.hasLiked;
                const nextCount = Math.max(0, (r.likesCount || 0) + (nextHasLiked ? 1 : -1));
                return { ...r, hasLiked: nextHasLiked, likesCount: nextCount };
              }
              return r;
            })
          };
        }
        return item;
      })
    );

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/${targetId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(data.hasLiked ? 'Hearted ❤️' : 'Removed Heart');
      }
    } catch (err) {
      showError('Failed to update heart');
    }
  };

  // Actions: Pin
  const handleTogglePin = async (c) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/${c._id}/pin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setComments(prev => prev.map(item => item._id === c._id ? { ...item, isPinned: !item.isPinned } : item));
        showSuccess(c.isPinned ? 'Unpinned' : 'Pinned to Top 📌');
      }
    } catch {
      showError('Failed to toggle pin');
    }
  };

  // Actions: Mark Answered
  const handleToggleAnswered = async (c) => {
    const nextState = !c.isAnswered;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/${c._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAnswered: nextState })
      });
      if (res.ok) {
        setComments(prev => prev.map(item => item._id === c._id ? { ...item, isAnswered: nextState } : item));
        showSuccess(nextState ? 'Marked as Answered ✅' : 'Marked as Needs Reply ⏳');
      }
    } catch {
      showError('Failed to update status');
    }
  };

  // Actions: Hide / Unhide
  const handleToggleHide = async (c) => {
    const isHidden = c.status === 'hidden';
    const endpoint = isHidden ? 'restore' : 'hide';
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/${c._id}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setComments(prev => prev.map(item => item._id === c._id ? { ...item, status: isHidden ? 'active' : 'hidden' } : item));
        showSuccess(isHidden ? 'Comment is now visible to students' : 'Comment is now hidden from students');
      }
    } catch {
      showError('Failed to toggle visibility');
    }
  };

  // Actions: Delete
  const handleDeleteComment = (commentId) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete this comment?',
      message: 'This will permanently remove the student question and all replies.',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('adminToken');
          const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            setComments(prev => prev.filter(c => c._id !== commentId));
            showSuccess('Comment deleted');
          }
        } catch {
          showError('Failed to delete comment');
        }
      }
    });
  };

  // Actions: Send Instructor Reply
  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || !activeComment) return;

    setIsSendingReply(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/${activeComment._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: text })
      });

      if (res.ok) {
        const newReply = await res.json();
        setComments(prev => prev.map(c => {
          if (c._id === activeComment._id) {
            return {
              ...c,
              isAnswered: markAnsweredOnReply ? true : c.isAnswered,
              replies: [...(c.replies || []), newReply]
            };
          }
          return c;
        }));
        setReplyText('');
        showSuccess('Reply sent as Aarkesh (Instructor) 🚀');
      }
    } catch {
      showError('Failed to send reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  // Quick reply chips
  const quickTemplates = [
    'Thanks for sharing this! 🙌',
    'Great question! We cover this deeply in the next lesson.',
    'Let us discuss this in our next 1-on-1 session.',
    'You can check the workbook in the Resources tab for this.'
  ];

  // Counts for tabs
  const countNeedsReply = comments.filter(isNeedsReply).length;
  const countAnswered = comments.filter(c => isAnswered(c) && c.status !== 'hidden').length;
  const countPinned = comments.filter(c => c.isPinned).length;
  const countHidden = comments.filter(c => c.status === 'hidden').length;

  return (
    <div className="easy-comm-root">
      {/* ── 1. Top Header & Primary Controls ── */}
      <header className="easy-header">
        <div className="easy-header-left">
          <div className="easy-title-badge">
            <span className="live-dot" title="Live real-time updates active"></span>
            <h1>Student Questions &amp; Comments</h1>
          </div>
          <p className="easy-subtitle">
            Interact with students, answer questions, and give hearts to comments.
          </p>
        </div>

        {/* Quick Dropdown Selectors for Courses & Lessons & Master Switch */}
        <div className="easy-header-filters">
          <div className="easy-filter-box">
            <label>Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedLesson('all');
              }}
            >
              <option value="all">📚 All Courses ({courses.length})</option>
              {courses.map(co => (
                <option key={co.id} value={co.id}>{co.name}</option>
              ))}
            </select>
          </div>

          {selectedCourse !== 'all' && (
            <div className="easy-filter-box">
              <label>Lesson</label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
              >
                <option value="all">📖 All Lessons</option>
                {currentCourseLessons.map(l => (
                  <option key={l.id} value={l.id}>{l.module} • {l.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Master Comment Section Toggle */}
          <div className="easy-master-toggle-box">
            <label>Discussions</label>
            <button
              type="button"
              role="switch"
              aria-checked={commentsEnabled}
              disabled={isTogglingStatus}
              onClick={handleToggleCommentsEnabled}
              className={`easy-master-switch-btn ${commentsEnabled ? 'is-on' : 'is-off'}`}
              title={commentsEnabled ? 'Comments are ON. Click to Turn OFF across all courses.' : 'Comments are OFF. Click to Turn ON for students.'}
            >
              <span className="easy-switch-knob"></span>
              <span className="easy-switch-label">
                {commentsEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Global Alert Banner when Comments are Disabled ── */}
      {!commentsEnabled && (
        <div className="easy-global-alert-banner">
          <div className="banner-content-wrap">
            <span className="banner-emoji">⚠️</span>
            <div className="banner-text">
              <strong>Course Discussions &amp; Comments are currently TURNED OFF</strong>
              <p>Students cannot see or post comments across courses. Existing comments remain safely saved. Toggle back ON anytime to restore student access.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleCommentsEnabled}
            disabled={isTogglingStatus}
            className="banner-turn-on-btn"
          >
            Turn ON Now
          </button>
        </div>
      )}

      {/* ── 2. Filter Bar & Search ── */}
      <div className="easy-toolbar">
        <div className="easy-tab-pills">
          <button
            type="button"
            className={`easy-tab-btn ${activeTab === 'needs' ? 'active' : ''} ${countNeedsReply > 0 ? 'alert' : ''}`}
            onClick={() => setActiveTab('needs')}
          >
            ⏳ Needs Reply
            <span className="easy-tab-count">{countNeedsReply}</span>
          </button>

          <button
            type="button"
            className={`easy-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            💬 All Comments
            <span className="easy-tab-count">{comments.length}</span>
          </button>

          <button
            type="button"
            className={`easy-tab-btn ${activeTab === 'answered' ? 'active' : ''}`}
            onClick={() => setActiveTab('answered')}
          >
            ✅ Answered
            <span className="easy-tab-count">{countAnswered}</span>
          </button>

          <button
            type="button"
            className={`easy-tab-btn ${activeTab === 'pinned' ? 'active' : ''}`}
            onClick={() => setActiveTab('pinned')}
          >
            📌 Pinned
            <span className="easy-tab-count">{countPinned}</span>
          </button>

          {countHidden > 0 && (
            <button
              type="button"
              className={`easy-tab-btn ${activeTab === 'hidden' ? 'active' : ''}`}
              onClick={() => setActiveTab('hidden')}
            >
              🚫 Hidden
              <span className="easy-tab-count">{countHidden}</span>
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="easy-search-wrapper">
          <Icon name="search" size={16} className="easy-search-icon" />
          <input
            type="search"
            placeholder="Search student name, email, or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="easy-clear-search" onClick={() => setSearchQuery('')}>
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Main Workspace Split ── */}
      <main className="easy-workspace">
        {/* Left: Comment Feed List */}
        <section className="easy-feed-panel">
          <div className="easy-feed-header">
            <span className="easy-feed-count">
              <b>{filteredComments.length}</b> {filteredComments.length === 1 ? 'comment' : 'comments'}
            </span>
            {(selectedCourse !== 'all' || selectedLesson !== 'all' || searchQuery) && (
              <button
                type="button"
                className="easy-reset-link"
                onClick={() => {
                  setSelectedCourse('all');
                  setSelectedLesson('all');
                  setSearchQuery('');
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="easy-feed-list">
            {isLoading ? (
              <div className="easy-empty-feed">
                <p>Loading comments...</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="easy-empty-feed">
                <div className="easy-empty-icon">🎉</div>
                <h3>No comments found</h3>
                <p>
                  {activeTab === 'needs'
                    ? 'Great job! All questions have been answered.'
                    : 'Try changing your search or filter options.'}
                </p>
              </div>
            ) : (
              filteredComments.map((c) => {
                const isSelected = selectedCommentId === c._id;
                const needsAns = isNeedsReply(c);

                return (
                  <article
                    key={c._id}
                    className={`easy-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCommentId(c._id)}
                  >
                    <div className="easy-card-top">
                      <div className="easy-card-user">
                        <div className="easy-avatar">{getInitials(c.userName)}</div>
                        <div>
                          <div className="easy-user-name">{c.userName}</div>
                          <div className="easy-user-lesson">
                            {getLessonTitle(c.courseSlug, c.lessonId)}
                          </div>
                        </div>
                      </div>
                      <span className="easy-card-time">{formatTimeAgo(c.createdAt)}</span>
                    </div>

                    <p className="easy-card-text">{c.content}</p>

                    <div className="easy-card-bottom">
                      <div className="easy-card-badges">
                        {c.isPinned && <span className="easy-badge pin">📌 Pinned</span>}
                        {needsAns ? (
                          <span className="easy-badge alert">⏳ Needs Reply</span>
                        ) : isAnswered(c) ? (
                          <span className="easy-badge success">✅ Answered</span>
                        ) : null}
                      </div>

                      <div className="easy-card-stats">
                        {/* Interactive Heart Button on List Card */}
                        <button
                          type="button"
                          className={`easy-card-heart ${c.hasLiked ? 'liked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLike(c);
                          }}
                          title={c.hasLiked ? 'Remove Heart' : 'Heart this comment'}
                        >
                          <Icon name="heart" size={13} fill={c.hasLiked ? 'currentColor' : 'none'} />
                          <span>{c.likesCount || 0}</span>
                        </button>

                        <span className="easy-card-replies" title="Replies">
                          <Icon name="chat" size={13} />
                          <span>{c.replies?.length || 0}</span>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* Right: Full Conversation Detail View */}
        <section className="easy-detail-panel">
          {!activeComment ? (
            <div className="easy-detail-empty">
              <div className="easy-detail-empty-icon">👈</div>
              <h3>Select a student comment</h3>
              <p>Click on any comment from the left list to read the full thread, give a heart, or post a reply.</p>
            </div>
          ) : (
            <div className="easy-detail-content">
              {/* Context bar with Lesson link */}
              <div className="easy-lesson-bar">
                <div className="easy-lesson-info">
                  <span className="easy-course-name">{getCourseTitle(activeComment.courseSlug)}</span>
                  <span className="easy-sep">›</span>
                  <span className="easy-lesson-name">{getLessonTitle(activeComment.courseSlug, activeComment.lessonId)}</span>
                </div>

                <a
                  href={`/course?learn=true`}
                  target="_blank"
                  rel="noreferrer"
                  className="easy-view-lesson-btn"
                  title="Open this lesson in player"
                >
                  <span>Open Lesson</span>
                  <Icon name="external" size={13} />
                </a>
              </div>

              {/* Main Student Question Box */}
              <div className="easy-question-card">
                {/* Student Info */}
                <div className="easy-student-header">
                  <div className="easy-avatar large">{getInitials(activeComment.userName)}</div>
                  <div className="easy-student-details">
                    <div className="easy-student-name">
                      <b>{activeComment.userName}</b>
                      <span className="easy-badge student">Student</span>
                      {activeComment.isPinned && <span className="easy-badge pin">📌 Pinned to Top</span>}
                    </div>
                    <div className="easy-student-email">{activeComment.userEmail || 'Student'}</div>
                    <div className="easy-student-date">
                      <Icon name="clock" size={12} />
                      <span>{formatFullDate(activeComment.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Comment Body */}
                <div className="easy-comment-bubble">
                  <p>{activeComment.content}</p>
                </div>

                {/* Main Action Bar for Admin */}
                <div className="easy-actions-bar">
                  {/* Big Heart Button */}
                  <button
                    type="button"
                    className={`easy-action-btn heart ${activeComment.hasLiked ? 'active' : ''}`}
                    onClick={() => handleToggleLike(activeComment)}
                    title="Give Heart / Like to this comment"
                  >
                    <Icon name="heart" size={16} fill={activeComment.hasLiked ? 'currentColor' : 'none'} />
                    <span>{activeComment.hasLiked ? 'Hearted ❤️' : 'Heart'} ({activeComment.likesCount || 0})</span>
                  </button>

                  {/* Mark Answered Button */}
                  <button
                    type="button"
                    className={`easy-action-btn answer ${isAnswered(activeComment) ? 'active' : ''}`}
                    onClick={() => handleToggleAnswered(activeComment)}
                  >
                    <Icon name="checkCircle" size={16} />
                    <span>{isAnswered(activeComment) ? 'Answered ✅' : 'Mark Answered'}</span>
                  </button>

                  {/* Pin to Top */}
                  <button
                    type="button"
                    className={`easy-action-btn pin ${activeComment.isPinned ? 'active' : ''}`}
                    onClick={() => handleTogglePin(activeComment)}
                    title="Pin this question at the top of the lesson"
                  >
                    <Icon name="pin" size={15} />
                    <span>{activeComment.isPinned ? 'Pinned' : 'Pin'}</span>
                  </button>

                  {/* Hide from students */}
                  <button
                    type="button"
                    className={`easy-action-btn hide ${activeComment.status === 'hidden' ? 'active' : ''}`}
                    onClick={() => handleToggleHide(activeComment)}
                  >
                    <Icon name={activeComment.status === 'hidden' ? 'eye' : 'eyeOff'} size={15} />
                    <span>{activeComment.status === 'hidden' ? 'Unhide' : 'Hide'}</span>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    className="easy-action-btn delete"
                    onClick={() => handleDeleteComment(activeComment._id)}
                    title="Delete permanently"
                  >
                    <Icon name="trash" size={15} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Discussion Replies List */}
              <div className="easy-replies-section">
                <div className="easy-replies-heading">
                  <h3>Replies &amp; Discussion</h3>
                  <span className="easy-reply-badge">{activeComment.replies?.length || 0}</span>
                </div>

                {(!activeComment.replies || activeComment.replies.length === 0) ? (
                  <div className="easy-no-replies">
                    <p>No replies yet. Type a response below to help this student.</p>
                  </div>
                ) : (
                  <div className="easy-replies-list">
                    {activeComment.replies.map((reply) => {
                      const isInstructor =
                        reply.authorRole === 'instructor' ||
                        reply.authorRole === 'admin' ||
                        reply.by === 'instructor';

                      return (
                        <div
                          key={reply._id || reply.id}
                          className={`easy-reply-card ${isInstructor ? 'instructor' : 'student'}`}
                        >
                          <div className="easy-reply-top">
                            <div className="easy-reply-author">
                              <div className={`easy-avatar sm ${isInstructor ? 'instructor' : ''}`}>
                                {getInitials(reply.userName || reply.name)}
                              </div>
                              <div>
                                <span className="easy-author-name">
                                  {reply.userName || reply.name}
                                </span>
                                {isInstructor && (
                                  <span className="easy-badge instructor">✨ Instructor (Aarkesh)</span>
                                )}
                              </div>
                            </div>
                            <span className="easy-reply-time">{formatTimeAgo(reply.createdAt || reply.at)}</span>
                          </div>

                          <p className="easy-reply-content">{reply.content || reply.text}</p>

                          {/* Heart button on reply */}
                          <div className="easy-reply-foot">
                            <button
                              type="button"
                              className={`easy-reply-heart ${reply.hasLiked ? 'liked' : ''}`}
                              onClick={() => handleToggleLike(reply, true, activeComment._id)}
                              title="Heart this reply"
                            >
                              <Icon name="heart" size={13} fill={reply.hasLiked ? 'currentColor' : 'none'} />
                              <span>{reply.likesCount || 0}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Easy Reply Composer */}
              <div className="easy-composer">
                <div className="easy-composer-header">
                  <div className="easy-composer-title">
                    <span className="easy-dot-online"></span>
                    <b>Reply as Aarkesh (Instructor)</b>
                  </div>
                </div>

                {/* Quick 1-Click Templates */}
                <div className="easy-templates-row">
                  <span className="easy-templates-label">Quick message:</span>
                  <div className="easy-templates-chips">
                    {quickTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="easy-template-chip"
                        onClick={() => setReplyText(prev => (prev ? prev + ' ' : '') + template)}
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  id="bwa-reply-input"
                  rows={3}
                  placeholder={`Write your answer to ${activeComment.userName.split(' ')[0]}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleSendReply();
                    }
                  }}
                />

                <div className="easy-composer-footer">
                  <label className="easy-checkbox-label">
                    <input
                      type="checkbox"
                      checked={markAnsweredOnReply}
                      onChange={(e) => setMarkAnsweredOnReply(e.target.checked)}
                    />
                    <span>Mark as answered after replying</span>
                  </label>

                  <button
                    type="button"
                    className="easy-send-btn"
                    disabled={!replyText.trim() || isSendingReply}
                    onClick={handleSendReply}
                  >
                    <Icon name="send" size={15} />
                    <span>{isSendingReply ? 'Sending...' : 'Send Reply'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Confirmation Modal */}
      {modalConfig.isOpen && (
        <div className="easy-modal-backdrop">
          <div className="easy-modal-box">
            <h3>{modalConfig.title}</h3>
            <p>{modalConfig.message}</p>
            <div className="easy-modal-actions">
              <button
                type="button"
                className="easy-modal-cancel"
                onClick={() => setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="easy-modal-delete"
                onClick={() => {
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                  setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null });
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
