import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Trash, 
  Pen, 
  FloppyDisk, 
  X, 
  VideoCamera, 
  UploadSimple, 
  CheckCircle, 
  Clock, 
  Play, 
  ArrowUp, 
  ArrowDown, 
  ArrowClockwise, 
  Copy, 
  Sparkle, 
  Eye, 
  EyeSlash, 
  WarningCircle, 
  FileText, 
  Link as LinkIcon, 
  MagnifyingGlass, 
  FilmStrip,
  Folders,
  ChatCenteredDots,
  PushPin,
  PaperPlaneRight,
  Question,
  Heart,
  CircleNotch,
  Check,
  YoutubeLogo,
  ShieldCheck
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to extract clean YouTube video ID from any format
const extractYoutubeVideoId = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

export default function AdminCourseCurriculum() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState({});

  // Module Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleFormTitle, setModuleFormTitle] = useState('');
  const [moduleFormDesc, setModuleFormDesc] = useState('');

  // Lesson Drawer State
  const [isLessonDrawerOpen, setIsLessonDrawerOpen] = useState(false);
  const [activeModuleForLesson, setActiveModuleForLesson] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    duration: '00:00',
    isFreePreview: false,
    isPublished: true,
    resources: [],
  });

  // Video Source Provider: 'mux' | 'youtube'
  const [videoSourceType, setVideoSourceType] = useState('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');

  // Video Upload State for Mux
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeUploadingLessonId, setActiveUploadingLessonId] = useState(null);
  const [activeUploadingLessonTitle, setActiveUploadingLessonTitle] = useState('');
  const [videoStatus, setVideoStatus] = useState('none'); // 'none' | 'uploading' | 'processing' | 'ready' | 'errored'
  const [uploadError, setUploadError] = useState('');
  const [videoMetadata, setVideoMetadata] = useState({
    playbackId: '',
    assetId: '',
    duration: '',
    resolution: '',
  });

  // Resource Input State inside Lesson Drawer
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  // Video-Specific Comments Sidebar & Notifications State
  const [activeCommentsLesson, setActiveCommentsLesson] = useState(null);
  const [lessonComments, setLessonComments] = useState([]);
  const [loadingLessonComments, setLoadingLessonComments] = useState(false);
  const [sidebarReplyText, setSidebarReplyText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [isPostingSidebarReply, setIsPostingSidebarReply] = useState(false);
  const [commentSummaries, setCommentSummaries] = useState({});

  // Inline Lesson Title Quick-Editing State
  const [inlineEditingLessonId, setInlineEditingLessonId] = useState(null);
  const [inlineLessonTitle, setInlineLessonTitle] = useState('');
  const [savingInlineLesson, setSavingInlineLesson] = useState(false);

  const fileInputRef = useRef(null);
  const pollingRef = useRef(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch comment summaries across lessons to power unread red dot indicators
  const fetchCommentSummaries = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/admin/lessons-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setCommentSummaries(data.summary);
        }
      }
    } catch (err) {
      console.error('Failed to fetch comment summaries:', err);
    }
  };

  // Helper to check if a lesson has unread comments
  const hasUnreadComments = (lessonId) => {
    if (!lessonId) return false;
    const summary = commentSummaries[lessonId.toString()];
    if (!summary || !summary.totalComments || summary.totalComments === 0) return false;

    const lastSeen = localStorage.getItem(`admin_seen_comments_${lessonId}`);
    if (!lastSeen) return true;

    if (summary.latestCommentAt) {
      return new Date(summary.latestCommentAt).getTime() > new Date(lastSeen).getTime();
    }
    return false;
  };

  // Open Video-Specific Comments Sidebar
  const handleOpenCommentsSidebar = async (lesson, mod) => {
    setActiveCommentsLesson({ ...lesson, moduleTitle: mod?.title || 'Course Section' });
    setLoadingLessonComments(true);
    setSidebarReplyText('');
    setReplyingToCommentId(null);

    // Mark as seen immediately so red dot indicator clears
    localStorage.setItem(`admin_seen_comments_${lesson._id}`, new Date().toISOString());
    setCommentSummaries(prev => ({
      ...prev,
      [lesson._id.toString()]: {
        ...(prev[lesson._id.toString()] || {}),
        lastSeenAt: new Date().toISOString(),
      }
    }));

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/lesson/${lesson._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLessonComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to load lesson comments:', err);
    } finally {
      setLoadingLessonComments(false);
    }
  };

  const handleCloseCommentsSidebar = () => {
    setActiveCommentsLesson(null);
    setLessonComments([]);
    setSidebarReplyText('');
    setReplyingToCommentId(null);
  };

  const handlePostSidebarReply = async (commentId) => {
    const trimmed = sidebarReplyText.trim();
    if (!trimmed) return;
    setIsPostingSidebarReply(true);

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
        setLessonComments(prev =>
          prev.map(c => {
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
        setSidebarReplyText('');
        setReplyingToCommentId(null);
        showNotification('Instructor reply posted successfully');
      } else {
        alert(newReply.message || 'Failed to post reply');
      }
    } catch (err) {
      console.error('Reply submit error:', err);
      alert('Network error while posting reply');
    } finally {
      setIsPostingSidebarReply(false);
    }
  };

  const handleTogglePinSidebar = async (commentId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/${commentId}/pin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLessonComments(prev => {
          const updated = prev.map(c => (c._id === commentId ? { ...c, isPinned: data.isPinned } : c));
          return [...updated].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
        });
        showNotification(data.isPinned ? 'Comment pinned to top' : 'Comment unpinned');
      } else {
        showNotification(data.message || 'Failed to toggle pin state', 'error');
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
      showNotification('Network error while toggling pin', 'error');
    }
  };

  const handleToggleHideSidebar = async (commentId, isCurrentlyHidden) => {
    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = isCurrentlyHidden ? 'restore' : 'hide';
      const res = await fetch(`${API_URL}/api/comments/${commentId}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLessonComments(prev =>
          prev.map(c =>
            c._id === commentId ? { ...c, status: isCurrentlyHidden ? 'active' : 'hidden' } : c
          )
        );
        showNotification(isCurrentlyHidden ? 'Comment restored and visible to students' : 'Comment hidden from students');
      } else {
        showNotification(data.message || 'Failed to update visibility', 'error');
      }
    } catch (err) {
      console.error('Error updating comment visibility:', err);
      showNotification('Network error while updating visibility', 'error');
    }
  };

  const handleDeleteSidebarComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLessonComments(prev =>
          prev
            .filter(c => c._id !== commentId)
            .map(c => ({
              ...c,
              replies: c.replies ? c.replies.filter(r => r._id !== commentId) : [],
              replyCount: c.replies ? c.replies.filter(r => r._id !== commentId).length : (c.replyCount || 0)
            }))
        );
        showNotification('Comment deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  // Fetch Courses & select or auto-create primary course
  const fetchCoursesAndCurriculum = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/admin/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        let data = await res.json();
        
        // If no course exists, create default BWA Master Course
        if (data.length === 0) {
          const createRes = await fetch(`${API_URL}/api/admin/courses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: 'The Better Man™',
              subtitle: 'Mastering Confident Presence, Communication & Executive Magnetism',
              description: 'Comprehensive day-by-day video training masterclass.',
              price: 15000,
              duration: '6+ Hours',
              level: 'Masterclass',
              status: 'Published'
            })
          });

          if (createRes.ok) {
            const newCourse = await createRes.json();
            data = [newCourse];
          }
        }

        setCourses(data);
        const currentCourse = selectedCourse ? data.find(c => c._id === selectedCourse._id) || data[0] : data[0];
        setSelectedCourse(currentCourse);

        if (currentCourse) {
          await fetchCourseDetails(currentCourse._id);
        }
      }
    } catch (err) {
      console.error('Error loading course curriculum:', err);
      showNotification('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/admin/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const fullCourse = await res.json();
        setModules(fullCourse.modules || []);
        // Expand all modules by default
        const exp = {};
        (fullCourse.modules || []).forEach(m => { exp[m._id] = true; });
        setExpandedModules(exp);
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
    }
  };

  useEffect(() => {
    fetchCoursesAndCurriculum();
    fetchCommentSummaries();

    // Poll for new comments periodically
    const commentsInterval = setInterval(fetchCommentSummaries, 20000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      clearInterval(commentsInterval);
    };
  }, []);

  const toggleModuleExpand = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // ═══════════════════════════════════════════════════════════════
  // MODULE (DAY) ACTIONS
  // ═══════════════════════════════════════════════════════════════

  const handleOpenModuleModal = (mod = null) => {
    if (mod) {
      setEditingModule(mod);
      setModuleFormTitle(mod.title);
      setModuleFormDesc(mod.description || '');
    } else {
      setEditingModule(null);
      const nextDayNum = modules.length + 1;
      setModuleFormTitle(`Day ${nextDayNum}: `);
      setModuleFormDesc('');
    }
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleFormTitle.trim() || !selectedCourse) return;

    setSaving(true);
    const token = localStorage.getItem('adminToken');

    try {
      if (editingModule) {
        // Update Module
        const res = await fetch(`${API_URL}/api/admin/courses/modules/${editingModule._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: moduleFormTitle.trim(),
            description: moduleFormDesc.trim(),
          })
        });

        if (res.ok) {
          showNotification('Day/Section updated successfully');
          await fetchCourseDetails(selectedCourse._id);
          setIsModuleModalOpen(false);
        }
      } else {
        // Create Module
        const res = await fetch(`${API_URL}/api/admin/courses/${selectedCourse._id}/modules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: moduleFormTitle.trim(),
            description: moduleFormDesc.trim(),
          })
        });

        if (res.ok) {
          showNotification('New Day/Section added successfully');
          await fetchCourseDetails(selectedCourse._id);
          setIsModuleModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving module:', err);
      showNotification('Failed to save module', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" and all its videos?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/admin/courses/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showNotification('Section deleted');
        await fetchCourseDetails(selectedCourse._id);
      }
    } catch (err) {
      console.error('Error deleting module:', err);
      showNotification('Failed to delete module', 'error');
    }
  };

  const handleMoveModule = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const reordered = [...modules];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setModules(reordered);
    const token = localStorage.getItem('adminToken');

    try {
      await fetch(`${API_URL}/api/admin/courses/${selectedCourse._id}/modules/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ moduleIds: reordered.map(m => m._id) })
      });
    } catch (err) {
      console.error('Error reordering modules:', err);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // LESSON (VIDEO) ACTIONS & MUX DIRECT UPLOAD
  // ═══════════════════════════════════════════════════════════════

  const handleOpenLessonDrawer = (mod, lesson = null) => {
    setActiveModuleForLesson(mod);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError('');

    if (lesson) {
      setEditingLesson(lesson);
      const isYt = lesson.videoSourceType === 'youtube' || (!lesson.muxPlaybackId && !!lesson.youtubeVideoId);
      setVideoSourceType(isYt ? 'youtube' : 'mux');
      setYoutubeUrl(lesson.youtubeUrl || (lesson.youtubeVideoId ? `https://youtu.be/${lesson.youtubeVideoId}` : ''));
      setYoutubeVideoId(lesson.youtubeVideoId || '');
      setLessonForm({
        title: lesson.title,
        description: lesson.description || '',
        duration: lesson.duration || '00:00',
        isFreePreview: !!lesson.isFreePreview,
        isPublished: lesson.isPublished !== false,
        resources: lesson.resources || [],
      });
      setVideoStatus(lesson.videoStatus || (lesson.muxPlaybackId || lesson.youtubeVideoId ? 'ready' : 'none'));
      setVideoMetadata({
        playbackId: lesson.muxPlaybackId || '',
        assetId: lesson.muxAssetId || '',
        duration: lesson.duration || '',
        resolution: lesson.muxResolution || '',
      });

      // If lesson is currently processing, initiate polling
      if (lesson.videoStatus === 'processing' || lesson.videoStatus === 'uploading') {
        startStatusPolling(lesson.muxUploadId || lesson.muxAssetId);
      }
    } else {
      setEditingLesson(null);
      const lessonCount = mod.lessons?.length || 0;
      setVideoSourceType('youtube');
      setYoutubeUrl('');
      setYoutubeVideoId('');
      setLessonForm({
        title: `Video ${lessonCount + 1}: `,
        description: '',
        duration: '00:00',
        isFreePreview: false,
        isPublished: true,
        resources: [],
      });
      setVideoStatus('none');
      setVideoMetadata({ playbackId: '', assetId: '', duration: '', resolution: '' });
    }

    setIsLessonDrawerOpen(true);
  };

  const handleCloseLessonDrawer = () => {
    setIsLessonDrawerOpen(false);
    if (isUploading || videoStatus === 'processing') {
      showNotification('Video upload is continuing in the background.', 'info');
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  };

  // Start polling Mux asset status
  const startStatusPolling = (identifier) => {
    if (!identifier) return;
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_URL}/api/admin/courses/mux/asset-status/${identifier}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ready') {
            setVideoStatus('ready');
            setVideoMetadata(prev => ({
              ...prev,
              playbackId: data.playbackId || prev.playbackId,
              assetId: data.assetId || prev.assetId,
              duration: data.durationFormatted || prev.duration,
              resolution: data.resolution || prev.resolution,
            }));
            if (data.durationFormatted) {
              setLessonForm(prev => ({ ...prev, duration: data.durationFormatted }));
            }
            clearInterval(pollingRef.current);
            showNotification('Video processing complete! Playback is ready.');
            if (selectedCourse) fetchCourseDetails(selectedCourse._id);
          } else if (data.status === 'errored') {
            setVideoStatus('errored');
            setUploadError('Mux video processing failed.');
            clearInterval(pollingRef.current);
          } else {
            setVideoStatus('processing');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 4000);
  };

  const handleFileSelect = async (e, directLesson = null, directModule = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video file
    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (MP4, MOV, WebM, MKV).');
      showNotification('Please select a valid video file (MP4, MOV, WebM, MKV)', 'error');
      return;
    }

    const targetModule = directModule || activeModuleForLesson;
    let targetLesson = directLesson || editingLesson;

    // Auto-detect video duration from file metadata
    try {
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.onloadedmetadata = () => {
        window.URL.revokeObjectURL(tempVideo.src);
        const totalSecs = Math.floor(tempVideo.duration || 0);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        setLessonForm(prev => ({ ...prev, duration: formatted }));
        setVideoMetadata(prev => ({ ...prev, duration: formatted }));
      };
      tempVideo.src = URL.createObjectURL(file);
    } catch (err) {
      console.warn('Could not pre-calculate video duration from file:', err);
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setVideoStatus('uploading');

    try {
      const token = localStorage.getItem('adminToken');

      // If targetLesson does not exist yet, auto-create it in MongoDB first
      if (!targetLesson && targetModule) {
        const createRes = await fetch(`${API_URL}/api/admin/courses/modules/${targetModule._id}/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: lessonForm.title.trim() || `Video ${(targetModule.lessons?.length || 0) + 1}`,
            description: lessonForm.description || '',
            isFreePreview: !!lessonForm.isFreePreview,
            duration: '00:00'
          })
        });

        if (createRes.ok) {
          const createdLesson = await createRes.json();
          targetLesson = createdLesson;
          setEditingLesson(createdLesson);
          if (selectedCourse) fetchCourseDetails(selectedCourse._id);
        }
      }

      if (targetLesson) {
        setActiveUploadingLessonId(targetLesson._id);
        setActiveUploadingLessonTitle(targetLesson.title);
      }

      // 1. Get Direct Upload URL from backend
      const res = await fetch(`${API_URL}/api/admin/courses/mux/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lessonId: targetLesson?._id || null
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to request Mux upload URL.');
      }

      const { uploadUrl, uploadId } = await res.json();

      // 2. Upload file directly to Mux using XMLHttpRequest for live progress
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setIsUploading(false);
          setUploadProgress(100);
          setVideoStatus('processing');
          showNotification('Upload complete! Mux is now encoding the video...');

          // Start polling for asset status
          startStatusPolling(uploadId);
        } else {
          setIsUploading(false);
          setVideoStatus('errored');
          setUploadError(`Upload failed with status ${xhr.status}`);
          showNotification(`Upload failed with status ${xhr.status}`, 'error');
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setVideoStatus('errored');
        setUploadError('Network error during video upload. Please check connection and retry.');
        showNotification('Network error during video upload', 'error');
      };

      xhr.send(file);
    } catch (err) {
      console.error('Mux Direct Upload error:', err);
      setIsUploading(false);
      setVideoStatus('errored');
      setUploadError(err.message || 'Direct upload to Mux failed.');
      showNotification(err.message || 'Direct upload to Mux failed.', 'error');
    }
  };

  // Save Lesson Details
  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim() || !activeModuleForLesson) return;

    setSaving(true);
    const token = localStorage.getItem('adminToken');

    try {
      if (editingLesson) {
        // Update Lesson
        const parsedYtId = videoSourceType === 'youtube' ? (extractYoutubeVideoId(youtubeUrl) || youtubeVideoId) : '';
        const computedVideoStatus = videoSourceType === 'youtube'
          ? (parsedYtId ? 'ready' : 'none')
          : (videoStatus || editingLesson.videoStatus || 'none');

        const res = await fetch(`${API_URL}/api/admin/courses/lessons/${editingLesson._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: lessonForm.title.trim(),
            description: lessonForm.description,
            duration: lessonForm.duration || '00:00',
            isFreePreview: lessonForm.isFreePreview,
            isPublished: lessonForm.isPublished,
            videoSourceType,
            youtubeUrl: videoSourceType === 'youtube' ? youtubeUrl.trim() : '',
            youtubeVideoId: parsedYtId,
            videoStatus: computedVideoStatus,
            resources: lessonForm.resources,
          })
        });

        if (res.ok) {
          showNotification('Video lesson updated successfully');
          await fetchCourseDetails(selectedCourse._id);
          handleCloseLessonDrawer();
        }
      } else {
        // Create Lesson in Module
        const parsedYtId = videoSourceType === 'youtube' ? (extractYoutubeVideoId(youtubeUrl) || youtubeVideoId) : '';
        const computedVideoStatus = videoSourceType === 'youtube' && parsedYtId ? 'ready' : 'none';

        const res = await fetch(`${API_URL}/api/admin/courses/modules/${activeModuleForLesson._id}/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: lessonForm.title.trim(),
            description: lessonForm.description,
            isFreePreview: lessonForm.isFreePreview,
            videoSourceType,
            youtubeUrl: videoSourceType === 'youtube' ? youtubeUrl.trim() : '',
            youtubeVideoId: parsedYtId,
            videoStatus: computedVideoStatus,
            duration: lessonForm.duration || '00:00'
          })
        });

        if (res.ok) {
          const created = await res.json();
          showNotification('Video lesson saved successfully.');
          await fetchCourseDetails(selectedCourse._id);
          handleCloseLessonDrawer();
        }
      }
    } catch (err) {
      console.error('Error saving lesson:', err);
      showNotification('Failed to save lesson', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId, title) => {
    if (!window.confirm(`Are you sure you want to delete video "${title}"?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/admin/courses/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showNotification('Video lesson deleted');
        await fetchCourseDetails(selectedCourse._id);
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
      showNotification('Failed to delete lesson', 'error');
    }
  };

  const handleDuplicateLesson = async (lessonId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/admin/courses/lessons/${lessonId}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showNotification('Video lesson duplicated');
        await fetchCourseDetails(selectedCourse._id);
      }
    } catch (err) {
      console.error('Error duplicating lesson:', err);
      showNotification('Failed to duplicate lesson', 'error');
    }
  };

  const handleStartInlineEditLesson = (lesson, e) => {
    if (e) e.stopPropagation();
    setInlineEditingLessonId(lesson._id);
    setInlineLessonTitle(lesson.title || '');
  };

  const handleCancelInlineEditLesson = (e) => {
    if (e) e.stopPropagation();
    setInlineEditingLessonId(null);
    setInlineLessonTitle('');
  };

  const handleSaveInlineLessonTitle = async (lessonId, e) => {
    if (e) e.preventDefault();
    const trimmed = inlineLessonTitle.trim();
    if (!trimmed) {
      showNotification('Video title cannot be empty', 'error');
      return;
    }

    setSavingInlineLesson(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/admin/courses/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: trimmed }),
      });

      if (res.ok) {
        const updatedLesson = await res.json();
        setModules(prevModules =>
          prevModules.map(mod => ({
            ...mod,
            lessons: (mod.lessons || []).map(l =>
              l._id === lessonId ? { ...l, title: updatedLesson.title || trimmed } : l
            ),
          }))
        );
        setInlineEditingLessonId(null);
        setInlineLessonTitle('');
        showNotification('Video title updated successfully');
      } else {
        const errData = await res.json();
        showNotification(errData.message || 'Failed to update video title', 'error');
      }
    } catch (err) {
      console.error('Error updating video title inline:', err);
      showNotification('Network error updating video title', 'error');
    } finally {
      setSavingInlineLesson(false);
    }
  };

  const handleMoveLesson = async (moduleId, lessonIndex, direction) => {
    const mod = modules.find(m => m._id === moduleId);
    if (!mod || !mod.lessons) return;

    const targetIndex = lessonIndex + direction;
    if (targetIndex < 0 || targetIndex >= mod.lessons.length) return;

    const reordered = [...mod.lessons];
    const [moved] = reordered.splice(lessonIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update UI optimistically
    setModules(prev => prev.map(m => m._id === moduleId ? { ...m, lessons: reordered } : m));

    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`${API_URL}/api/admin/courses/modules/${moduleId}/lessons/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lessonIds: reordered.map(l => l._id) })
      });
    } catch (err) {
      console.error('Error reordering lessons:', err);
    }
  };

  // Add resource attachment to lesson
  const handleAddResource = () => {
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;
    setLessonForm(prev => ({
      ...prev,
      resources: [...prev.resources, { title: newResourceTitle.trim(), fileUrl: newResourceUrl.trim() }]
    }));
    setNewResourceTitle('');
    setNewResourceUrl('');
  };

  const handleRemoveResource = (index) => {
    setLessonForm(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  // Filter modules/lessons by search
  const filteredModules = modules.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchMod = m.title.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q);
    const matchLesson = m.lessons?.some(l => l.title.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q));
    return matchMod || matchLesson;
  });

  const totalLessonsCount = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const readyVideosCount = modules.reduce((acc, m) => acc + (m.lessons?.filter(l => l.videoStatus === 'ready' || l.muxPlaybackId)?.length || 0), 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans text-white">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-8 right-8 z-[250] px-5 py-3.5 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200 ${
          notification.type === 'error' 
            ? 'bg-red-500/15 border-red-500/30 text-red-300' 
            : 'bg-[#c79c6e]/15 border-[#c79c6e]/40 text-[#c79c6e]'
        }`}>
          {notification.type === 'error' ? <WarningCircle size={20} /> : <CheckCircle size={20} />}
          <span className="text-sm font-medium">{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c79c6e]/10 border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e]">
              <VideoCamera size={22} weight="light" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-white font-normal">
                Course Curriculum & Video Upload
              </h1>
              <p className="text-white/50 text-xs md:text-sm mt-1">
                Organize Day-by-Day video sections, upload videos to Mux, and attach learning worksheets.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCourseDetails(selectedCourse?._id)}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
            title="Refresh"
          >
            <ArrowClockwise size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleOpenModuleModal()}
            className="px-5 py-3 rounded-xl bg-[#c79c6e] text-black hover:bg-[#b0885e] transition-all font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(199,156,110,0.25)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" />
            <span>Add Day / Section</span>
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5">
          <span className="text-[0.68rem] font-sans uppercase tracking-widest text-white/40 block mb-1">Total Days / Sections</span>
          <span className="font-serif text-3xl text-white font-normal">{modules.length}</span>
        </div>
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5">
          <span className="text-[0.68rem] font-sans uppercase tracking-widest text-white/40 block mb-1">Total Video Lessons</span>
          <span className="font-serif text-3xl text-[#c79c6e] font-normal">{totalLessonsCount}</span>
        </div>
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5">
          <span className="text-[0.68rem] font-sans uppercase tracking-widest text-white/40 block mb-1">Video Ready</span>
          <span className="font-serif text-3xl text-emerald-400 font-normal">{readyVideosCount}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search days, video titles, topics or descriptions..."
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
        />
      </div>

      {/* Curriculum Day-by-Day List */}
      {loading ? (
        <div className="py-24 text-center text-white/40 font-sans text-sm flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin" />
          <span>Loading course curriculum...</span>
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 text-center my-6">
          <FilmStrip size={44} className="text-[#c79c6e]/50 mx-auto mb-4" weight="light" />
          <h3 className="font-serif text-2xl text-white mb-2">No Days or Sections Found</h3>
          <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
            Get started by adding your first Day (e.g. Day 1: Foundation of Presence) and uploading videos.
          </p>
          <button
            onClick={() => handleOpenModuleModal()}
            className="px-6 py-3.5 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#b0885e] transition-colors"
          >
            <Plus size={16} weight="bold" /> Add Day 1
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredModules.map((mod, modIndex) => {
            const isExpanded = !!expandedModules[mod._id];
            const lessons = mod.lessons || [];

            return (
              <div 
                key={mod._id} 
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all hover:border-[#c79c6e]/30"
              >
                {/* Module / Day Header Strip */}
                <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white/[0.03] to-transparent border-b border-white/5">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Reorder Buttons */}
                    <div className="flex sm:flex-col gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveModule(modIndex, -1)}
                        disabled={modIndex === 0}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveModule(modIndex, 1)}
                        disabled={modIndex === filteredModules.length - 1}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => toggleModuleExpand(mod._id)}
                      className="text-left flex-1 min-w-0 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-serif text-lg md:text-xl text-white font-normal group-hover:text-[#c79c6e] transition-colors truncate">
                          {mod.title}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.65rem] text-[#c79c6e] font-semibold shrink-0">
                          {lessons.length} {lessons.length === 1 ? 'Video' : 'Videos'}
                        </span>
                      </div>
                      {mod.description && (
                        <p className="text-white/50 text-xs mt-1 truncate">{mod.description}</p>
                      )}
                    </button>
                  </div>

                  {/* Day Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenLessonDrawer(mod)}
                      className="px-3.5 py-2 rounded-lg bg-[#c79c6e]/15 border border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-all text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Plus size={14} weight="bold" />
                      <span>Upload Video</span>
                    </button>

                    <button
                      onClick={() => handleOpenModuleModal(mod)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      title="Edit Day Heading"
                    >
                      <Pen size={15} />
                    </button>

                    <button
                      onClick={() => handleDeleteModule(mod._id, mod.title)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                      title="Delete Day"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>

                {/* Videos inside Day */}
                {isExpanded && (
                  <div className="p-4 md:p-6 space-y-3 bg-[#070707]/80">
                    {lessons.length === 0 ? (
                      <div className="py-8 px-4 rounded-xl border border-dashed border-white/10 text-center">
                        <VideoCamera size={28} className="text-white/30 mx-auto mb-2" />
                        <p className="text-white/50 text-xs">No videos in this section yet.</p>
                        <button
                          onClick={() => handleOpenLessonDrawer(mod)}
                          className="mt-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-xs text-[#c79c6e] font-medium inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Plus size={13} weight="bold" /> Upload First Video
                        </button>
                      </div>
                    ) : (
                      lessons.map((lesson, lessonIndex) => {
                        const isCurrentUploading = isUploading && activeUploadingLessonId === lesson._id;
                        const isCurrentProcessing = !isCurrentUploading && ((videoStatus === 'processing' && activeUploadingLessonId === lesson._id) || lesson.videoStatus === 'processing');
                        const isReady = !isCurrentUploading && !isCurrentProcessing && (lesson.videoStatus === 'ready' || !!lesson.muxPlaybackId);
                        const isErrored = !isCurrentUploading && !isCurrentProcessing && lesson.videoStatus === 'errored';

                        return (
                          <div
                            key={lesson._id}
                            className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl transition-all group relative overflow-hidden ${
                              isCurrentUploading
                                ? 'bg-gradient-to-r from-[#c79c6e]/[0.08] via-[#0e0e0e] to-[#0e0e0e] border border-[#c79c6e]/50 shadow-[0_0_25px_rgba(199,156,110,0.15)] ring-1 ring-[#c79c6e]/30'
                                : isCurrentProcessing
                                ? 'bg-gradient-to-r from-amber-500/[0.06] via-[#0e0e0e] to-[#0e0e0e] border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20'
                                : 'bg-[#0e0e0e] border border-white/5 hover:border-white/15'
                            }`}
                          >
                            {/* Left: Reorder + Video Details */}
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              {/* Reorder Lesson */}
                              <div className="flex flex-col gap-0.5 shrink-0">
                                <button
                                  onClick={() => handleMoveLesson(mod._id, lessonIndex, -1)}
                                  disabled={lessonIndex === 0 || isCurrentUploading}
                                  className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20"
                                  title="Move Video Up"
                                >
                                  <ArrowUp size={12} />
                                </button>
                                <button
                                  onClick={() => handleMoveLesson(mod._id, lessonIndex, 1)}
                                  disabled={lessonIndex === lessons.length - 1 || isCurrentUploading}
                                  className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20"
                                  title="Move Video Down"
                                >
                                  <ArrowDown size={12} />
                                </button>
                              </div>

                              {/* Video Play / Status Badge */}
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden ${
                                isCurrentUploading
                                  ? 'bg-[#c79c6e]/15 border border-[#c79c6e]/40'
                                  : isCurrentProcessing
                                  ? 'bg-amber-500/15 border border-amber-500/40'
                                  : isReady
                                  ? 'bg-black border border-white/10'
                                  : 'bg-black border border-white/10'
                              }`}>
                                {isCurrentUploading ? (
                                  <div className="flex flex-col items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[0.58rem] text-[#c79c6e] font-bold mt-0.5">{uploadProgress}%</span>
                                  </div>
                                ) : isCurrentProcessing ? (
                                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                ) : isReady ? (
                                  <Play size={18} weight="fill" className="text-[#c79c6e]" />
                                ) : (
                                  <VideoCamera size={18} className="text-white/30" />
                                )}
                              </div>

                              {/* Title & Info */}
                              <div className="min-w-0 flex-1">
                                {inlineEditingLessonId === lesson._id ? (
                                  <form
                                    onSubmit={(e) => handleSaveInlineLessonTitle(lesson._id, e)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2 py-0.5 flex-wrap"
                                  >
                                    <input
                                      type="text"
                                      autoFocus
                                      value={inlineLessonTitle}
                                      onChange={(e) => setInlineLessonTitle(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Escape') handleCancelInlineEditLesson(e);
                                      }}
                                      disabled={savingInlineLesson}
                                      placeholder="Enter video title..."
                                      className="flex-1 min-w-[220px] max-w-md bg-black/90 border border-[#c79c6e] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c79c6e]/50 font-medium"
                                    />
                                    <button
                                      type="submit"
                                      disabled={savingInlineLesson || !inlineLessonTitle.trim()}
                                      className="px-3 py-1.5 rounded-lg bg-[#c79c6e] hover:bg-[#b0885e] text-black text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                                      title="Save Title"
                                    >
                                      {savingInlineLesson ? (
                                        <CircleNotch size={14} className="animate-spin" />
                                      ) : (
                                        <Check size={14} weight="bold" />
                                      )}
                                      <span>Save</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancelInlineEditLesson}
                                      disabled={savingInlineLesson}
                                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X size={14} />
                                      <span>Cancel</span>
                                    </button>
                                  </form>
                                ) : (
                                  <div className="flex items-center gap-2 flex-wrap group/title">
                                    <button
                                      onClick={() => handleOpenLessonDrawer(mod, lesson)}
                                      className="text-sm font-medium text-white hover:text-[#c79c6e] transition-colors truncate text-left group-hover:text-[#c79c6e]"
                                      title="Click to edit video title & details"
                                    >
                                      {lesson.title}
                                    </button>

                                    {/* Inline Pencil Edit Button */}
                                    <button
                                      onClick={(e) => handleStartInlineEditLesson(lesson, e)}
                                      className="p-1 rounded bg-white/5 hover:bg-[#c79c6e]/20 text-white/40 hover:text-[#c79c6e] border border-transparent hover:border-[#c79c6e]/30 transition-all cursor-pointer"
                                      title="Quick Edit Title"
                                    >
                                      <Pen size={12} />
                                    </button>
                                    
                                    {isCurrentUploading && (
                                      <span className="px-2 py-0.5 rounded-full bg-[#c79c6e]/20 border border-[#c79c6e]/40 text-[0.62rem] text-[#c79c6e] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                        <UploadSimple size={11} weight="bold" /> Uploading ({uploadProgress}%)
                                      </span>
                                    )}

                                    {isCurrentProcessing && (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[0.62rem] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" /> Mux Encoding
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Active Upload Progress Bar directly on the row */}
                                {isCurrentUploading ? (
                                  <div className="mt-2 space-y-1.5 max-w-md">
                                    <div className="flex items-center justify-between text-[0.7rem]">
                                      <span className="text-[#c79c6e] font-medium flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#c79c6e] animate-ping" />
                                        Directly uploading video to Mux ({uploadProgress}%)...
                                      </span>
                                      <span className="text-white/40 font-mono text-[0.68rem]">{lesson.duration || 'Auto-detected'}</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                      <div 
                                        className="bg-gradient-to-r from-[#c79c6e] via-[#e5c59f] to-[#c79c6e] h-full transition-all duration-150 rounded-full shadow-[0_0_10px_rgba(199,156,110,0.6)]"
                                        style={{ width: `${uploadProgress}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : isCurrentProcessing ? (
                                  <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                                    <span className="inline-flex items-center gap-1.5 text-amber-400 text-[0.72rem] font-medium">
                                      <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                                      Mux is encoding video into adaptive streaming formats...
                                    </span>
                                    {lesson.duration && (
                                      <span className="text-white/40 flex items-center gap-1 text-[0.7rem]">
                                        <Clock size={12} /> {lesson.duration}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Clock size={12} />
                                      <span>{lesson.duration || '00:00'}</span>
                                    </div>

                                    {/* Video Status Pill */}
                                    {lesson.videoSourceType === 'youtube' || lesson.youtubeVideoId ? (
                                      <span className="inline-flex items-center gap-1 text-red-400 text-[0.7rem] bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-medium">
                                        <YoutubeLogo size={13} weight="fill" className="text-red-500" />
                                        <span>YouTube {lesson.youtubeVideoId ? 'Linked' : 'Pending'}</span>
                                      </span>
                                    ) : isReady ? (
                                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[0.7rem]">
                                        <CheckCircle size={12} weight="fill" /> Mux Ready
                                      </span>
                                    ) : isErrored ? (
                                      <span className="inline-flex items-center gap-1 text-red-400 text-[0.7rem]">
                                        <WarningCircle size={12} /> Upload / Encoding Failed
                                      </span>
                                    ) : (
                                      <span className="text-white/30 text-[0.7rem]">
                                        No video uploaded
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                              {isCurrentUploading ? (
                                <button
                                  onClick={() => handleOpenLessonDrawer(mod, lesson)}
                                  className="px-3.5 py-1.5 rounded-lg bg-[#c79c6e]/20 border border-[#c79c6e]/50 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-all text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(199,156,110,0.25)]"
                                >
                                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  <span>Uploading {uploadProgress}%</span>
                                </button>
                              ) : isCurrentProcessing ? (
                                <button
                                  onClick={() => handleOpenLessonDrawer(mod, lesson)}
                                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-all text-xs font-semibold flex items-center gap-1.5"
                                >
                                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                  <span>Processing in Mux...</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenLessonDrawer(mod, lesson)}
                                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white/80 hover:text-white transition-colors text-xs flex items-center gap-1.5"
                                >
                                  <UploadSimple size={14} />
                                  <span>{isReady ? 'Replace Video' : 'Upload Video'}</span>
                                </button>
                              )}

                              {/* View Video Comments Button */}
                              <button
                                onClick={() => handleOpenCommentsSidebar(lesson, mod)}
                                disabled={isCurrentUploading}
                                className="relative px-3 py-1.5 rounded-lg bg-[#c79c6e]/10 hover:bg-[#c79c6e]/20 text-[#c79c6e] border border-[#c79c6e]/30 hover:border-[#c79c6e]/60 transition-colors disabled:opacity-20 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                                title="View Video Comments & Discussions"
                              >
                                <ChatCenteredDots size={15} weight="bold" />
                                <span>Comments</span>
                                {hasUnreadComments(lesson._id) && (
                                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-[#0a0a0a]"></span>
                                  </span>
                                )}
                              </button>

                              {/* Edit Video Heading & Description Button */}
                              <button
                                onClick={() => handleOpenLessonDrawer(mod, lesson)}
                                disabled={isCurrentUploading}
                                className="p-2 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 text-white/60 hover:text-[#c79c6e] border border-white/5 hover:border-[#c79c6e]/30 transition-colors disabled:opacity-20"
                                title="Edit Video Heading & Details"
                              >
                                <Pen size={14} />
                              </button>

                              <button
                                onClick={() => handleDuplicateLesson(lesson._id)}
                                disabled={isCurrentUploading}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-20"
                                title="Duplicate Video"
                              >
                                <Copy size={14} />
                              </button>

                              <button
                                onClick={() => handleDeleteLesson(lesson._id, lesson.title)}
                                disabled={isCurrentUploading}
                                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors disabled:opacity-20"
                                title="Delete Video"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODULE (DAY) MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h3 className="font-serif text-2xl text-white">
                {editingModule ? 'Edit Day / Section' : 'Add New Day / Section'}
              </h3>
              <button
                onClick={() => setIsModuleModalOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Day / Section Title</label>
                <input
                  type="text"
                  required
                  value={moduleFormTitle}
                  onChange={(e) => setModuleFormTitle(e.target.value)}
                  placeholder="e.g. Day 1: Foundation of Presence"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c79c6e]/60 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Topic Overview / Description</label>
                <textarea
                  rows={3}
                  value={moduleFormDesc}
                  onChange={(e) => setModuleFormDesc(e.target.value)}
                  placeholder="Brief summary of what will be taught on this day..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c79c6e]/60 text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white text-xs font-semibold tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#b0885e] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingModule ? 'Update Day' : 'Create Day'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          LESSON & MUX VIDEO UPLOAD DRAWER
         ═══════════════════════════════════════════════════════════════ */}
      {isLessonDrawerOpen && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="bg-[#0e0e0e] border-l border-white/10 w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0e0e0e]/95 backdrop-blur-md z-10">
              <div>
                <span className="text-[0.65rem] uppercase tracking-widest text-[#c79c6e] font-semibold block mb-1">
                  {activeModuleForLesson?.title}
                </span>
                <h3 className="font-serif text-2xl text-white">
                  {editingLesson ? 'Edit Video Lesson' : 'Upload Video to Day'}
                </h3>
              </div>
              <button
                onClick={handleCloseLessonDrawer}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <form onSubmit={handleSaveLesson} className="p-6 md:p-8 space-y-6 flex-1">
              {/* Video Title */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#c79c6e] font-semibold mb-2 flex items-center gap-1.5">
                  <Pen size={13} />
                  <span>Video Title (Editable)</span>
                </label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. How Do You Turn On Your Confidence?"
                  className="w-full bg-black/60 border border-white/10 focus:border-[#c79c6e] rounded-xl px-4 py-3 text-white focus:outline-none text-sm transition-colors"
                />
              </div>

              {/* Video Description */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Description / Notes</label>
                <textarea
                  rows={3}
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Key takeaways, time-codes, or instructions for students..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c79c6e]/60 text-sm resize-none"
                />
              </div>

              {/* ── VIDEO SOURCE PROVIDER SELECTION & UPLOAD SECTION ── */}
              <div className="pt-2 pb-5 border-t border-b border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest text-[#c79c6e] font-bold flex items-center gap-2">
                    <VideoCamera size={16} /> Video Source &amp; Provider
                  </label>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                    {videoSourceType === 'youtube' ? 'YouTube Unlisted' : 'Mux Direct'}
                  </span>
                </div>

                {/* Provider Tab Buttons */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/60 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('youtube')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      videoSourceType === 'youtube'
                        ? 'bg-[#c79c6e] text-black font-bold shadow-[0_0_15px_rgba(199,156,110,0.3)]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <YoutubeLogo size={16} weight="fill" className={videoSourceType === 'youtube' ? 'text-red-600' : 'text-red-400'} />
                    <span>YouTube Video Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoSourceType('mux')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      videoSourceType === 'mux'
                        ? 'bg-[#c79c6e] text-black font-bold shadow-[0_0_15px_rgba(199,156,110,0.3)]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FilmStrip size={16} />
                    <span>Mux Direct Upload</span>
                  </button>
                </div>

                {/* ════ YOUTUBE VIDEO LINK SECTION ════ */}
                {videoSourceType === 'youtube' && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/70 font-semibold mb-2 flex items-center justify-between">
                        <span>Paste YouTube Video URL or Video ID</span>
                        <span className="text-[10px] text-[#c79c6e] font-normal lowercase">unlisted or public link</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={youtubeUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setYoutubeUrl(val);
                            const parsedId = extractYoutubeVideoId(val);
                            setYoutubeVideoId(parsedId);
                          }}
                          placeholder="e.g. https://youtu.be/dQw4w9WgXcQ or https://www.youtube.com/watch?v=..."
                          className="w-full bg-black/60 border border-white/15 focus:border-[#c79c6e] rounded-xl pl-4 pr-24 py-3 text-white focus:outline-none text-xs font-mono transition-colors"
                        />
                        {youtubeUrl && (
                          <button
                            type="button"
                            onClick={() => { setYoutubeUrl(''); setYoutubeVideoId(''); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-[10px] uppercase font-semibold"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
                        Tip: Create an <strong>Unlisted</strong> video on YouTube so it won't be searchable on public YouTube.
                      </p>
                    </div>

                    {/* YouTube Video Live Preview */}
                    {youtubeVideoId ? (
                      <div className="space-y-3 rounded-2xl border border-[#c79c6e]/30 bg-black/80 p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#c79c6e] font-semibold flex items-center gap-1.5">
                            <CheckCircle size={15} weight="fill" className="text-emerald-400" />
                            <span>YouTube Video Detected</span>
                          </span>
                          <span className="font-mono text-[11px] text-white/50 bg-white/5 px-2 py-0.5 rounded">
                            ID: {youtubeVideoId}
                          </span>
                        </div>

                        {/* 16:9 Responsive Embed Preview */}
                        <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
                            title="YouTube Preview"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>

                        {/* Security Notice */}
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2 leading-relaxed">
                          <ShieldCheck size={18} weight="bold" className="shrink-0 text-emerald-400 mt-0.5" />
                          <div>
                            <strong>Protected Course Player:</strong> When students watch inside the course classroom, title clicks, share buttons, and YouTube channel links are automatically shielded to protect your course content.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center">
                        <YoutubeLogo size={32} className="text-red-500/60 mx-auto mb-2" weight="fill" />
                        <h5 className="text-xs font-semibold text-white/80">No YouTube URL Entered</h5>
                        <p className="text-[11px] text-white/40 mt-1 max-w-xs mx-auto">
                          Paste any unlisted or public YouTube video link above to attach it to this lesson.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ════ MUX DIRECT UPLOAD SECTION ════ */}
                {videoSourceType === 'mux' && (
                  <div className="space-y-4 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="video/*"
                      className="hidden"
                    />

                    {videoStatus === 'ready' && editingLesson?.muxPlaybackId ? (
                      /* Video Ready State */
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                            <CheckCircle size={18} weight="fill" />
                            <span>✓ Mux video ready for streaming</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-[#c79c6e] hover:underline font-medium"
                          >
                            Replace Video
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs text-white/70 pt-2 border-t border-white/10 font-mono">
                          <div>
                            <span className="text-white/40 block text-[0.65rem] font-sans uppercase">Playback ID</span>
                            <span className="truncate block">{videoMetadata.playbackId || editingLesson?.muxPlaybackId || 'Generated'}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[0.65rem] font-sans uppercase">Duration</span>
                            <span>{videoMetadata.duration || lessonForm.duration || 'Auto-detected'}</span>
                          </div>
                        </div>
                      </div>
                    ) : isUploading ? (
                      /* Uploading Progress State */
                      <div className="rounded-2xl border border-[#c79c6e]/40 bg-[#c79c6e]/5 p-6 text-center">
                        <div className="w-8 h-8 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <h4 className="text-sm font-semibold text-white mb-1">Directly uploading to Mux...</h4>
                        <p className="text-xs text-white/50 mb-4">{uploadProgress}% uploaded</p>

                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#c79c6e] to-[#e5c59f] h-full transition-all duration-150 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : videoStatus === 'processing' ? (
                      /* Mux Processing State */
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
                        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <h4 className="text-sm font-semibold text-white mb-1">Mux is encoding video...</h4>
                        <p className="text-xs text-white/50 max-w-sm mx-auto">
                          Generating adaptive multi-bitrate streams. You can save and leave this page; it will complete automatically.
                        </p>
                      </div>
                    ) : (
                      /* Default Drag & Drop Upload State */
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-2xl border-2 border-dashed border-white/15 hover:border-[#c79c6e]/60 bg-white/[0.02] hover:bg-white/[0.04] p-8 text-center cursor-pointer transition-all group"
                      >
                        <UploadSimple size={32} className="text-[#c79c6e] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm font-semibold text-white mb-1">Upload lesson video to Mux</h4>
                        <p className="text-xs text-white/50 mb-3">Drag &amp; drop or Click to browse</p>
                        <span className="inline-block px-2.5 py-1 rounded bg-white/5 text-[0.65rem] uppercase tracking-wider text-white/40">
                          MP4, MOV, WebM, MKV up to 5GB
                        </span>
                      </div>
                    )}

                    {uploadError && (
                      <div className="mt-3 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                        <WarningCircle size={16} className="shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Auto Duration Box */}
              <div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/10">
                  <div>
                    <span className="block text-xs font-semibold text-white">Video Duration</span>
                    <span className="block text-[0.65rem] text-white/40">
                      {lessonForm.duration && lessonForm.duration !== '00:00'
                        ? 'Auto-detected from video'
                        : 'Calculated upon video upload'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/30 text-[#c79c6e] font-mono text-xs font-semibold">
                    {lessonForm.duration || '00:00'}
                  </span>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10 sticky bottom-0 bg-[#0e0e0e] py-4">
                <button
                  type="button"
                  onClick={handleCloseLessonDrawer}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white text-xs font-semibold tracking-wider"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#b0885e] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FloppyDisk size={16} />
                  <span>{saving ? 'Saving...' : 'Save Lesson'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* VIDEO-SPECIFIC COMMENTS SIDEBAR DRAWER */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeCommentsLesson && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/10 bg-[#0e0e0e] flex items-start justify-between gap-4 sticky top-0 z-10">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[#c79c6e] text-[10px] font-bold uppercase tracking-wider">
                    {activeCommentsLesson.moduleTitle}
                  </span>
                  <span className="text-[11px] text-white/40">
                    {activeCommentsLesson.duration || 'Video'}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-white font-normal truncate">
                  {activeCommentsLesson.title}
                </h3>
                <p className="text-xs text-white/50 mt-1 flex items-center gap-1.5">
                  <ChatCenteredDots size={14} className="text-[#c79c6e]" />
                  <span>{lessonComments.length} {lessonComments.length === 1 ? 'Comment / Discussion' : 'Comments / Discussions'}</span>
                </p>
              </div>

              <button
                onClick={handleCloseCommentsSidebar}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Close Sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comments Feed Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingLessonComments ? (
                <div className="py-20 text-center text-white/40 flex flex-col items-center justify-center gap-3">
                  <CircleNotch size={28} className="animate-spin text-[#c79c6e]" />
                  <span className="text-xs font-mono">Loading video discussions...</span>
                </div>
              ) : lessonComments.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                  <ChatCenteredDots size={36} className="text-white/20 mx-auto mb-2" />
                  <h4 className="font-serif text-base text-white mb-1">No comments for this video yet</h4>
                  <p className="text-xs text-white/40 max-w-xs mx-auto">
                    When students watch this video and post questions or thoughts, they will appear right here.
                  </p>
                </div>
              ) : (
                lessonComments.map((comment) => {
                  const isHidden = comment.status === 'hidden';
                  const isReplying = replyingToCommentId === comment._id;

                  return (
                    <div
                      key={comment._id}
                      className={`p-4 md:p-5 rounded-2xl border transition-all ${
                        comment.isPinned
                          ? 'border-[#c79c6e]/50 bg-gradient-to-r from-[#17140e] to-[#0a0a0a]'
                          : isHidden
                          ? 'border-dashed border-rose-500/30 bg-black/40 opacity-75'
                          : 'border-white/10 bg-[#0d0d0d]'
                      }`}
                    >
                      {/* Comment Header */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">{comment.userName}</span>
                            {comment.isPinned && (
                              <span className="px-2 py-0.5 rounded-full bg-[#c79c6e]/20 border border-[#c79c6e]/40 text-[#c79c6e] text-[9px] font-bold uppercase tracking-wider">
                                PINNED
                              </span>
                            )}
                            {isHidden && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[9px] font-bold uppercase tracking-wider">
                                HIDDEN
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/40">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                          </span>
                        </div>

                        {/* Quick Moderation Actions */}
                        <div className="flex items-center gap-1.5">
                          {/* Pin / Unpin Button */}
                          <button
                            onClick={() => handleTogglePinSidebar(comment._id)}
                            title={comment.isPinned ? 'Unpin from top' : 'Pin to top of video comments'}
                            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                              comment.isPinned
                                ? 'bg-[#c79c6e]/25 text-[#c79c6e] border border-[#c79c6e]/50 shadow-[0_0_10px_rgba(199,156,110,0.25)]'
                                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <PushPin size={14} weight={comment.isPinned ? 'fill' : 'regular'} />
                          </button>

                          {/* Hide / Unhide Button */}
                          <button
                            onClick={() => handleToggleHideSidebar(comment._id, isHidden)}
                            title={isHidden ? 'Restore & show to students' : 'Hide from students'}
                            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                              isHidden
                                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {isHidden ? <EyeSlash size={14} weight="fill" /> : <Eye size={14} />}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteSidebarComment(comment._id)}
                            title="Delete this comment"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/25 hover:text-rose-200 text-xs transition-all cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Comment Body */}
                      <p className="text-white/85 text-xs md:text-sm leading-relaxed whitespace-pre-wrap mb-3 bg-black/40 p-3 rounded-xl border border-white/5">
                        {comment.content}
                      </p>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-2 mb-3 pl-3 border-l-2 border-[#c79c6e]/30">
                          {comment.replies.map((reply) => {
                            const isInstructor = reply.authorRole === 'instructor' || reply.authorBadge === 'COURSE INSTRUCTOR';
                            return (
                              <div
                                key={reply._id}
                                className={`p-2.5 rounded-xl border text-xs ${
                                  isInstructor
                                    ? 'bg-gradient-to-r from-[#17140e] to-[#0a0a0a] border-[#c79c6e]/40'
                                    : 'bg-white/[0.02] border-white/5'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-white">{reply.userName}</span>
                                    {isInstructor && (
                                      <span className="px-1.5 py-0.2 rounded bg-[#c79c6e]/20 border border-[#c79c6e]/40 text-[#c79c6e] text-[8px] font-bold uppercase">
                                        INSTRUCTOR
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleDeleteSidebarComment(reply._id)}
                                    className="text-rose-400/60 hover:text-rose-400"
                                  >
                                    <Trash size={11} />
                                  </button>
                                </div>
                                <p className="text-white/80 whitespace-pre-wrap text-[11px]">{reply.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Inline Reply Form */}
                      {isReplying ? (
                        <div className="pt-2.5 border-t border-white/10 space-y-2">
                          <textarea
                            rows={2}
                            value={sidebarReplyText}
                            onChange={(e) => setSidebarReplyText(e.target.value)}
                            placeholder={`Reply as Instructor to ${comment.userName}...`}
                            className="w-full p-2.5 rounded-xl bg-black/60 border border-[#c79c6e]/40 text-white text-xs outline-none focus:border-[#c79c6e] resize-none"
                            autoFocus
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setReplyingToCommentId(null);
                                setSidebarReplyText('');
                              }}
                              className="px-3 py-1 rounded text-xs text-white/50 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={isPostingSidebarReply || !sidebarReplyText.trim()}
                              onClick={() => handlePostSidebarReply(comment._id)}
                              className="px-3.5 py-1 rounded-lg bg-[#c79c6e] text-black font-semibold text-xs uppercase flex items-center gap-1 hover:brightness-110 disabled:opacity-50"
                            >
                              {isPostingSidebarReply ? <CircleNotch size={12} className="animate-spin" /> : <PaperPlaneRight size={12} weight="fill" />}
                              <span>REPLY</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReplyingToCommentId(comment._id);
                            setSidebarReplyText('');
                          }}
                          className="px-3 py-1 rounded-lg bg-[#c79c6e]/10 border border-[#c79c6e]/30 hover:bg-[#c79c6e]/20 text-[#c79c6e] text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                          <PaperPlaneRight size={12} weight="fill" />
                          <span>Reply as Instructor</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
