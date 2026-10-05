import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Desktop, 
  Sparkle, 
  FloppyDisk, 
  ArrowClockwise, 
  CheckCircle, 
  ArrowSquareOut, 
  Plus, 
  Trash, 
  Tag, 
  CurrencyInr, 
  ListNumbers, 
  Quotes, 
  Kanban, 
  CaretRight, 
  ShieldCheck, 
  Check, 
  Play, 
  ArrowUp, 
  ArrowDown,
  ArrowLeft,
  PencilSimple,
  MagnifyingGlass,
  BookOpen,
  Eye,
  Clock,
  SquaresFour,
  SlidersHorizontal,
  Palette,
  VideoCamera,
  YoutubeLogo,
  UploadSimple,
  Link as LinkIcon,
  FilmStrip,
  FileText,
  X,
  LockKey,
  WarningCircle,
  CaretDown,
  CaretUp,
  Pen,
  Copy,
  ChatCenteredDots,
  Image as ImageIcon,
  CloudArrowUp,
  CircleNotch
} from '@phosphor-icons/react';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return `${API_URL}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${API_URL}/${url}`;
  }
  if (url.startsWith('/')) {
    return `${API_URL}${url}`;
  }
  return `${API_URL}/${url}`;
};

export const extractMuxPlaybackId = (val) => {
  if (!val) return '';
  const clean = String(val).trim();
  if (clean.includes('stream.mux.com/')) {
    const match = clean.match(/stream\.mux\.com\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1].replace('.m3u8', '');
  }
  if (clean.includes('player.mux.com/')) {
    const match = clean.match(/player\.mux\.com\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1].split('?')[0];
  }
  if (clean.includes('mux.com/')) {
    const match = clean.match(/mux\.com\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
  }
  if (/^[a-zA-Z0-9_-]{15,60}$/.test(clean) && !clean.startsWith('http')) {
    return clean;
  }
  return '';
};

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

const SECTION_TABS = [
  {
    id: 'hero',
    label: '1. Hero & Pricing Sidebar',
    icon: <Desktop size={18} />,
    description: 'Theme style, title, tags, price & summary card'
  },
  {
    id: 'syllabus',
    label: '2. Syllabus & Modules Grid',
    icon: <ListNumbers size={18} />,
    description: 'Syllabus title, subtitle & modular roadmap'
  },
  {
    id: 'methodology',
    label: '3. Core Methodology & Deep Dive',
    icon: <Quotes size={18} />,
    description: 'Philosophy, headline, narrative & quote box'
  },
  {
    id: 'videos',
    label: '4. Upload Videos & Lessons',
    icon: <VideoCamera size={18} />,
    description: 'Upload video lectures, YouTube links, lessons & resources'
  }
];

export default function AdminCourseDetailEditor() {
  const { showToast } = useToast();
  const [coursesMap, setCoursesMap] = useState({});
  
  // viewMode: 'catalog' (card grid) | 'editor' (3-section editor)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'editor') return 'editor';
      if (view === 'catalog') return 'catalog';
    } catch (e) {}
    return 'catalog'; // default to catalog view
  });

  const [activeSlug, setActiveSlug] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const slugFromUrl = params.get('courseSlug');
      if (slugFromUrl) return slugFromUrl;
      const saved = localStorage.getItem('bwa_admin_active_course_slug');
      if (saved) return saved;
    } catch (e) {}
    return 'better-man';
  });

  const [activeSectionTab, setActiveSectionTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('sectionTab');
      if (tabFromUrl && ['hero', 'syllabus', 'methodology', 'videos'].includes(tabFromUrl)) return tabFromUrl;
    } catch (e) {}
    return 'hero';
  });

  // Filter & Search states for catalog view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'live' | 'waitlist'

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSlug, setNewCourseSlug] = useState('');
  const [newCourseTheme, setNewCourseTheme] = useState('black');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  // Video Lessons & Upload State
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingModuleModal, setEditingModuleModal] = useState(null);
  const [activeModuleIndexForLesson, setActiveModuleIndexForLesson] = useState(0);
  const [editingLessonIndex, setEditingLessonIndex] = useState(null);
  const [previewingVideo, setPreviewingVideo] = useState(null);
  const [commentsModalLesson, setCommentsModalLesson] = useState(null);
  const [expandedVideoModules, setExpandedVideoModules] = useState({});
  const [videoSearchQuery, setVideoSearchQuery] = useState('');

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    duration: '10:00',
    videoSourceType: 'youtube', // 'youtube' | 'direct' | 'mux'
    youtubeUrl: '',
    youtubeVideoId: '',
    videoUrl: '',
    muxPlaybackId: '',
    isFreePreview: false,
    resources: []
  });

  // Fetch all courses map
  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/courses/details-settings`);
      if (!res.ok) throw new Error('Failed to load courses');
      const data = await res.json();
      setCoursesMap(data || {});
      if (!activeSlug || !data[activeSlug]) {
        const firstSlug = Object.keys(data)[0] || 'better-man';
        setActiveSlug(firstSlug);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  // Sync state to URL and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bwa_admin_active_course_slug', activeSlug);
      const url = new URL(window.location.href);
      url.searchParams.set('courseSlug', activeSlug);
      url.searchParams.set('sectionTab', activeSectionTab);
      url.searchParams.set('view', viewMode);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [activeSlug, activeSectionTab, viewMode]);

  const currentCourse = coursesMap[activeSlug] || {};

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Generic Field Updater
  const handleFieldChange = (field, value) => {
    setCoursesMap((prev) => ({
      ...prev,
      [activeSlug]: {
        ...(prev[activeSlug] || {}),
        [field]: value
      }
    }));
  };

  // Course Thumbnail Image Upload Handler
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingThumbnail(true);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload thumbnail');
      const data = await res.json();
      const uploadedUrl = data.url || data.imageUrl || data.secure_url;
      if (uploadedUrl) {
        handleFieldChange('imageUrl', uploadedUrl);
        handleFieldChange('thumbnailUrl', uploadedUrl);
        showToast('Course thumbnail uploaded successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to upload thumbnail image', 'error');
    } finally {
      setUploadingThumbnail(false);
      if (e.target) e.target.value = '';
    }
  };

  // ── Mux Video Upload State for Course Trailer ──
  const [trailerUploadProgress, setTrailerUploadProgress] = useState(0);
  const [trailerVideoStatus, setTrailerVideoStatus] = useState('none'); // 'none' | 'uploading' | 'processing' | 'ready' | 'errored'
  const [trailerUploadError, setTrailerUploadError] = useState('');
  const trailerPollingRef = React.useRef(null);

  useEffect(() => {
    return () => {
      if (trailerPollingRef.current) clearInterval(trailerPollingRef.current);
    };
  }, []);

  const startTrailerPolling = (identifier) => {
    if (!identifier) return;
    if (trailerPollingRef.current) clearInterval(trailerPollingRef.current);

    trailerPollingRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_URL}/api/admin/courses/mux/asset-status/${identifier}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ready' && data.playbackId) {
            setTrailerVideoStatus('ready');
            handleFieldChange('trailerMuxPlaybackId', data.playbackId);
            handleFieldChange('muxPlaybackId', data.playbackId);
            handleFieldChange('trailerVideoUrl', data.playbackId);
            handleFieldChange('previewVideoUrl', data.playbackId);
            handleFieldChange('trailerVideoType', 'mux');
            clearInterval(trailerPollingRef.current);
            showToast('Mux trailer video processed & ready for streaming!', 'success');
          } else if (data.status === 'errored') {
            setTrailerVideoStatus('errored');
            setTrailerUploadError('Mux video encoding failed.');
            clearInterval(trailerPollingRef.current);
            showToast('Mux video processing failed.', 'error');
          } else {
            setTrailerVideoStatus('processing');
          }
        }
      } catch (err) {
        console.error('Trailer polling error:', err);
      }
    }, 3500);
  };

  // Course Trailer Mux Video Direct Upload Handler
  const handleTrailerMuxUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid video file (MP4, MOV, WebM, MKV)', 'error');
      return;
    }

    try {
      setTrailerVideoStatus('uploading');
      setTrailerUploadProgress(0);
      setTrailerUploadError('');
      const token = localStorage.getItem('adminToken');

      // 1. Get Direct Upload URL from Mux via backend
      const res = await fetch(`${API_URL}/api/admin/courses/mux/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to request Mux upload URL.');
      }

      const { uploadUrl, uploadId } = await res.json();

      // 2. Direct upload file to Mux with live % progress
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setTrailerUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setTrailerUploadProgress(100);
          setTrailerVideoStatus('processing');
          showToast('Video uploaded to Mux! Encoding stream...', 'info');
          startTrailerPolling(uploadId);
        } else {
          setTrailerVideoStatus('errored');
          setTrailerUploadError(`Upload failed with status ${xhr.status}`);
          showToast(`Upload failed with status ${xhr.status}`, 'error');
        }
      };

      xhr.onerror = () => {
        setTrailerVideoStatus('errored');
        setTrailerUploadError('Network error during video upload. Please check connection.');
        showToast('Network error during video upload', 'error');
      };

      xhr.send(file);
    } catch (err) {
      console.error('Trailer Mux upload error:', err);
      setTrailerVideoStatus('errored');
      setTrailerUploadError(err.message || 'Failed to initialize Mux upload.');
      showToast(err.message || 'Failed to initialize Mux upload.', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // ── Mux Video Upload State for Lesson Modals (Section 4) ──
  const [lessonUploadProgress, setLessonUploadProgress] = useState(0);
  const [lessonVideoStatus, setLessonVideoStatus] = useState('none'); // 'none' | 'uploading' | 'processing' | 'ready' | 'errored'
  const [lessonUploadError, setLessonUploadError] = useState('');
  const lessonPollingRef = React.useRef(null);

  useEffect(() => {
    return () => {
      if (lessonPollingRef.current) clearInterval(lessonPollingRef.current);
    };
  }, []);

  const startLessonPolling = (identifier) => {
    if (!identifier) return;
    if (lessonPollingRef.current) clearInterval(lessonPollingRef.current);

    lessonPollingRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_URL}/api/admin/courses/mux/asset-status/${identifier}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ready' && data.playbackId) {
            setLessonVideoStatus('ready');
            setLessonForm(prev => ({
              ...prev,
              muxPlaybackId: data.playbackId,
              videoSourceType: 'mux',
              duration: data.durationFormatted || prev.duration || '10:00'
            }));
            clearInterval(lessonPollingRef.current);
            showToast('Lesson video encoded by Mux and ready!', 'success');
          } else if (data.status === 'errored') {
            setLessonVideoStatus('errored');
            setLessonUploadError('Mux video processing failed.');
            clearInterval(lessonPollingRef.current);
            showToast('Mux video processing failed.', 'error');
          } else {
            setLessonVideoStatus('processing');
          }
        }
      } catch (err) {
        console.error('Lesson polling error:', err);
      }
    }, 3500);
  };

  const handleLessonMuxUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid video file (MP4, MOV, WebM, MKV)', 'error');
      return;
    }

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
      };
      tempVideo.src = URL.createObjectURL(file);
    } catch (err) {
      console.warn('Could not pre-calculate video duration from file:', err);
    }

    try {
      setLessonVideoStatus('uploading');
      setLessonUploadProgress(0);
      setLessonUploadError('');
      const token = localStorage.getItem('adminToken');

      // 1. Get Direct Upload URL from Mux via backend
      const res = await fetch(`${API_URL}/api/admin/courses/mux/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to request Mux upload URL.');
      }

      const { uploadUrl, uploadId } = await res.json();

      // 2. Direct upload to Mux via XHR
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setLessonUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setLessonUploadProgress(100);
          setLessonVideoStatus('processing');
          showToast('Lesson uploaded! Mux is now encoding the video...', 'info');
          startLessonPolling(uploadId);
        } else {
          setLessonVideoStatus('errored');
          setLessonUploadError(`Upload failed with status ${xhr.status}`);
          showToast(`Upload failed with status ${xhr.status}`, 'error');
        }
      };

      xhr.onerror = () => {
        setLessonVideoStatus('errored');
        setLessonUploadError('Network error during video upload.');
        showToast('Network error during video upload', 'error');
      };

      xhr.send(file);
    } catch (err) {
      console.error('Lesson Mux upload error:', err);
      setLessonVideoStatus('errored');
      setLessonUploadError(err.message || 'Failed to initialize Mux upload.');
      showToast(err.message || 'Failed to initialize Mux upload.', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Writeup (Methodology) Field Updater
  const handleWriteupChange = (field, value) => {
    setCoursesMap((prev) => ({
      ...prev,
      [activeSlug]: {
        ...(prev[activeSlug] || {}),
        writeup: {
          ...((prev[activeSlug] || {}).writeup || {}),
          [field]: value
        }
      }
    }));
  };

  // Highlights (hl) Updater
  const handleHlChange = (index, subIndex, value) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newHl = Array.isArray(course.hl) ? [...course.hl] : [['', ''], ['', '']];
      if (!newHl[index]) newHl[index] = ['', ''];
      newHl[index][subIndex] = value;
      return {
        ...prev,
        [activeSlug]: {
          ...course,
          hl: newHl
        }
      };
    });
  };

  // What's Inside Checklist Updaters
  const handleInsideItemChange = (index, value) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newInside = [...(course.inside || [])];
      newInside[index] = value;
      return {
        ...prev,
        [activeSlug]: { ...course, inside: newInside }
      };
    });
  };

  const handleAddInsideItem = () => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newInside = [...(course.inside || []), 'New feature or inclusion'];
      return {
        ...prev,
        [activeSlug]: { ...course, inside: newInside }
      };
    });
  };

  const handleRemoveInsideItem = (index) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newInside = (course.inside || []).filter((_, i) => i !== index);
      return {
        ...prev,
        [activeSlug]: { ...course, inside: newInside }
      };
    });
  };

  // Canvas Chips (tags on thumbnail preview)
  const handleChipChange = (index, value) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newChips = [...(course.chips || ['Tag 1', 'Tag 2'])];
      newChips[index] = value;
      return {
        ...prev,
        [activeSlug]: { ...course, chips: newChips }
      };
    });
  };

  // Syllabus Modules Updaters
  const handleSyllabusChange = (index, field, value) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newSyllabus = [...(course.syllabus || [])];
      newSyllabus[index] = { ...newSyllabus[index], [field]: value };
      return {
        ...prev,
        [activeSlug]: { ...course, syllabus: newSyllabus }
      };
    });
  };

  const handleAddSyllabusModule = () => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const currentList = course.syllabus || [];
      const nextNum = String(currentList.length + 1).padStart(2, '0');
      const newSyllabus = [
        ...currentList,
        {
          n: nextNum,
          t: 'New Masterclass Module Title',
          d: 'Detailed psychological frameworks, actionable exercises, and real-world implementation.'
        }
      ];
      return {
        ...prev,
        [activeSlug]: { ...course, syllabus: newSyllabus }
      };
    });
  };

  const handleRemoveSyllabusModule = (index) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newSyllabus = (course.syllabus || [])
        .filter((_, i) => i !== index)
        .map((mod, i) => ({ ...mod, n: String(i + 1).padStart(2, '0') }));
      return {
        ...prev,
        [activeSlug]: { ...course, syllabus: newSyllabus }
      };
    });
  };

  const handleMoveSyllabus = (index, direction) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const list = [...(course.syllabus || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      const renumbered = list.map((mod, i) => ({ ...mod, n: String(i + 1).padStart(2, '0') }));
      return {
        ...prev,
        [activeSlug]: { ...course, syllabus: renumbered }
      };
    });
  };

  // Video Modules & Upload Handlers
  const getVideoModulesList = () => {
    if (currentCourse.videoModules && Array.isArray(currentCourse.videoModules)) {
      return currentCourse.videoModules;
    }
    if (currentCourse.syllabus && Array.isArray(currentCourse.syllabus) && currentCourse.syllabus.length > 0) {
      return currentCourse.syllabus.map((s, i) => ({
        id: `mod_${i + 1}`,
        title: `Module ${s.n || String(i + 1).padStart(2, '0')}: ${s.t || 'Module Title'}`,
        duration: '45 mins',
        lessons: [
          {
            id: `les_${(i + 1) * 100 + 1}`,
            title: `Lesson 1: ${s.t || 'Introduction & Foundations'}`,
            duration: '12:30',
            videoSourceType: 'youtube',
            youtubeUrl: '',
            youtubeVideoId: '',
            videoUrl: '',
            muxPlaybackId: '',
            isFreePreview: i === 0,
            description: s.d || '',
            resources: []
          }
        ]
      }));
    }
    return [
      {
        id: `mod_1`,
        title: 'Module 01: Core Foundations',
        duration: '45 mins',
        lessons: []
      }
    ];
  };

  const handleUpdateVideoModules = (newModules) => {
    setCoursesMap((prev) => ({
      ...prev,
      [activeSlug]: {
        ...(prev[activeSlug] || {}),
        videoModules: newModules
      }
    }));
  };

  const handleAddVideoModule = () => {
    const list = [...getVideoModulesList()];
    const nextNum = list.length + 1;
    list.push({
      id: `mod_${Date.now()}`,
      title: `Module ${String(nextNum).padStart(2, '0')}: New Video Module Title`,
      duration: '45 mins',
      lessons: []
    });
    handleUpdateVideoModules(list);
    showToast('New video module added', 'success');
  };

  const handleAutoPopulateFromSyllabus = () => {
    if (!currentCourse.syllabus || currentCourse.syllabus.length === 0) {
      showToast('No syllabus modules found in Section 2 to populate from', 'error');
      return;
    }
    const populated = currentCourse.syllabus.map((s, i) => ({
      id: `mod_${Date.now()}_${i}`,
      title: `Module ${s.n || String(i + 1).padStart(2, '0')}: ${s.t}`,
      duration: '45 mins',
      lessons: [
        {
          id: `les_${Date.now()}_${i}`,
          title: `Lesson 1: Introduction to ${s.t}`,
          duration: '12:00',
          videoSourceType: 'youtube',
          youtubeUrl: '',
          youtubeVideoId: '',
          videoUrl: '',
          muxPlaybackId: '',
          isFreePreview: i === 0,
          description: s.d || '',
          resources: []
        }
      ]
    }));
    handleUpdateVideoModules(populated);
    showToast(`⚡ Populated ${populated.length} modules from Syllabus roadmap!`, 'success');
  };

  const handleDeleteVideoModule = (modIdx) => {
    if (!window.confirm('Delete this video module and its lessons?')) return;
    const list = getVideoModulesList().filter((_, idx) => idx !== modIdx);
    handleUpdateVideoModules(list);
    showToast('Module deleted', 'success');
  };

  const handleUpdateModuleTitle = (modIdx, title) => {
    const list = getVideoModulesList().map((m, idx) => idx === modIdx ? { ...m, title } : m);
    handleUpdateVideoModules(list);
  };

  const handleMoveVideoModule = (modIdx, direction) => {
    const list = [...getVideoModulesList()];
    const targetIdx = modIdx + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[modIdx];
    list[modIdx] = list[targetIdx];
    list[targetIdx] = temp;
    handleUpdateVideoModules(list);
  };

  const handleOpenAddLessonModal = (modIdx) => {
    setActiveModuleIndexForLesson(modIdx);
    setEditingLessonIndex(null);
    setLessonForm({
      title: '',
      description: '',
      duration: '10:00',
      videoSourceType: 'youtube',
      youtubeUrl: '',
      youtubeVideoId: '',
      videoUrl: '',
      muxPlaybackId: '',
      isFreePreview: false,
      resources: []
    });
    setShowLessonModal(true);
  };

  const handleOpenEditLessonModal = (modIdx, lessonIdx) => {
    setActiveModuleIndexForLesson(modIdx);
    setEditingLessonIndex(lessonIdx);
    const mod = getVideoModulesList()[modIdx];
    const lesson = mod?.lessons?.[lessonIdx] || {};
    setLessonForm({
      title: lesson.title || '',
      description: lesson.description || '',
      duration: lesson.duration || '10:00',
      videoSourceType: lesson.videoSourceType || (lesson.muxPlaybackId ? 'mux' : (lesson.videoUrl ? 'direct' : 'youtube')),
      youtubeUrl: lesson.youtubeUrl || (lesson.youtubeVideoId ? `https://www.youtube.com/watch?v=${lesson.youtubeVideoId}` : ''),
      youtubeVideoId: lesson.youtubeVideoId || extractYoutubeVideoId(lesson.youtubeUrl || ''),
      videoUrl: lesson.videoUrl || '',
      muxPlaybackId: lesson.muxPlaybackId || '',
      isFreePreview: Boolean(lesson.isFreePreview),
      resources: Array.isArray(lesson.resources) ? [...lesson.resources] : []
    });
    setShowLessonModal(true);
  };

  const handleSaveLessonModal = () => {
    if (!lessonForm.title.trim()) {
      showToast('Please enter a lesson title', 'error');
      return;
    }

    const resolvedYtId = lessonForm.videoSourceType === 'youtube'
      ? (extractYoutubeVideoId(lessonForm.youtubeUrl) || lessonForm.youtubeVideoId.trim())
      : '';

    const newLessonObj = {
      id: editingLessonIndex !== null 
        ? getVideoModulesList()[activeModuleIndexForLesson]?.lessons?.[editingLessonIndex]?.id || `les_${Date.now()}`
        : `les_${Date.now()}`,
      title: lessonForm.title.trim(),
      description: lessonForm.description.trim(),
      duration: lessonForm.duration.trim() || '10:00',
      videoSourceType: lessonForm.videoSourceType,
      youtubeUrl: lessonForm.youtubeUrl.trim(),
      youtubeVideoId: resolvedYtId,
      videoUrl: lessonForm.videoUrl.trim(),
      muxPlaybackId: lessonForm.muxPlaybackId.trim(),
      isFreePreview: Boolean(lessonForm.isFreePreview),
      resources: (lessonForm.resources || []).filter(r => r.title?.trim() || r.url?.trim())
    };

    const list = [...getVideoModulesList()];
    if (!list[activeModuleIndexForLesson]) {
      list[activeModuleIndexForLesson] = {
        id: `mod_${Date.now()}`,
        title: `Module ${activeModuleIndexForLesson + 1}`,
        lessons: []
      };
    }
    const currentLessons = [...(list[activeModuleIndexForLesson].lessons || [])];

    if (editingLessonIndex !== null) {
      currentLessons[editingLessonIndex] = newLessonObj;
    } else {
      currentLessons.push(newLessonObj);
    }

    list[activeModuleIndexForLesson] = {
      ...list[activeModuleIndexForLesson],
      lessons: currentLessons
    };

    handleUpdateVideoModules(list);
    setShowLessonModal(false);
    showToast(editingLessonIndex !== null ? 'Lesson video updated!' : 'New video lesson added!', 'success');
  };

  const handleDeleteLesson = (modIdx, lessonIdx) => {
    if (!window.confirm('Delete this video lesson?')) return;
    const list = [...getVideoModulesList()];
    if (!list[modIdx]) return;
    list[modIdx] = {
      ...list[modIdx],
      lessons: list[modIdx].lessons.filter((_, idx) => idx !== lessonIdx)
    };
    handleUpdateVideoModules(list);
    showToast('Lesson deleted', 'success');
  };

  const handleMoveLesson = (modIdx, lessonIdx, direction) => {
    const list = [...getVideoModulesList()];
    if (!list[modIdx] || !list[modIdx].lessons) return;
    const lessons = [...list[modIdx].lessons];
    const targetIdx = lessonIdx + direction;
    if (targetIdx < 0 || targetIdx >= lessons.length) return;
    const temp = lessons[lessonIdx];
    lessons[lessonIdx] = lessons[targetIdx];
    lessons[targetIdx] = temp;
    list[modIdx] = { ...list[modIdx], lessons };
    handleUpdateVideoModules(list);
  };

  const handleDuplicateLesson = (modIdx, lessonIdx) => {
    const list = [...getVideoModulesList()];
    if (!list[modIdx] || !list[modIdx].lessons) return;
    const lesson = list[modIdx].lessons[lessonIdx];
    if (!lesson) return;
    const duplicated = {
      ...lesson,
      id: `les_${Date.now()}`,
      title: `${lesson.title || 'Video Lesson'} (Copy)`
    };
    const lessons = [...list[modIdx].lessons];
    lessons.splice(lessonIdx + 1, 0, duplicated);
    list[modIdx] = { ...list[modIdx], lessons };
    handleUpdateVideoModules(list);
    showToast('Lesson duplicated successfully!', 'success');
  };

  const handleOpenEditModuleModal = (modIdx) => {
    const mod = getVideoModulesList()[modIdx];
    setEditingModuleModal({
      modIdx,
      title: mod?.title || '',
      description: mod?.description || ''
    });
  };

  const handleOpenAddModuleModal = () => {
    const list = getVideoModulesList();
    const nextNum = list.length + 1;
    setEditingModuleModal({
      modIdx: null,
      title: `Day ${nextNum}: New Section Title`,
      description: 'Master practical psychological frameworks, action models, and daily exercises.'
    });
  };

  const handleSaveModuleModal = () => {
    if (!editingModuleModal) return;
    const list = [...getVideoModulesList()];
    if (editingModuleModal.modIdx !== null && list[editingModuleModal.modIdx]) {
      list[editingModuleModal.modIdx] = {
        ...list[editingModuleModal.modIdx],
        title: editingModuleModal.title.trim() || list[editingModuleModal.modIdx].title,
        description: editingModuleModal.description.trim()
      };
      handleUpdateVideoModules(list);
      showToast('Section heading updated', 'success');
    } else {
      list.push({
        id: `mod_${Date.now()}`,
        title: editingModuleModal.title.trim() || `Day ${list.length + 1}: New Section`,
        description: editingModuleModal.description.trim(),
        lessons: []
      });
      handleUpdateVideoModules(list);
      showToast('New section added', 'success');
    }
    setEditingModuleModal(null);
  };

  // Open Editor for a specific course
  const handleOpenEditor = (slug) => {
    setActiveSlug(slug);
    setViewMode('editor');
  };

  // Toggle Live vs Waitlist status for a course directly
  const handleToggleCourseStatus = async (slugToToggle, e) => {
    if (e) e.stopPropagation();
    const course = coursesMap[slugToToggle];
    if (!course) return;
    const updatedSoon = !course.soon;
    const updatedCourse = { ...course, soon: updatedSoon };
    
    setCoursesMap((prev) => ({
      ...prev,
      [slugToToggle]: updatedCourse
    }));

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/details-settings/${slugToToggle}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedCourse)
      });
      if (!res.ok) throw new Error('Failed to update status');
      showToast(`Status updated: "${updatedCourse.title || slugToToggle}" is now ${updatedSoon ? 'Waitlist' : 'LIVE'}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error updating course status', 'error');
    }
  };

  // Delete Course
  const handleDeleteCourse = async (slugToDelete, courseTitle, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${courseTitle || slugToDelete}"? This cannot be undone.`)) {
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/details-settings/${slugToDelete}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to delete course');
      
      setCoursesMap((prev) => {
        const updated = { ...prev };
        delete updated[slugToDelete];
        return updated;
      });

      if (activeSlug === slugToDelete) {
        const remainingSlugs = Object.keys(coursesMap).filter(s => s !== slugToDelete);
        setActiveSlug(remainingSlugs[0] || 'better-man');
        setViewMode('catalog');
      }

      showToast(`Course "${courseTitle || slugToDelete}" deleted successfully`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error deleting course', 'error');
    }
  };

  // Save active course
  const handleSaveCourse = async () => {
    if (!currentCourse || !activeSlug) return;
    try {
      setSaving(true);
      setSaveSuccess(false);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/details-settings/${activeSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(currentCourse)
      });
      if (!res.ok) throw new Error('Failed to save course details');
      const data = await res.json();
      setCoursesMap((prev) => ({ ...prev, [activeSlug]: data.data }));
      setSaveSuccess(true);

      // Trigger cross-tab realtime sync for client and live preview
      try {
        localStorage.setItem('bwa_course_details_updated', Date.now().toString());
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('bwa_course_landing_channel');
          bc.postMessage({ type: 'bwa_course_details_updated', slug: activeSlug });
          bc.close();
        }
      } catch (e) {}

      showToast(`✨ Course "${currentCourse.title || activeSlug}" saved live!`, 'success');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error saving course', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Reset active course to default
  const handleResetCourse = async () => {
    if (!window.confirm(`Are you sure you want to reset "${currentCourse.title || activeSlug}" to its default content?`)) {
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/details-settings/${activeSlug}/reset`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to reset course');
      const data = await res.json();
      setCoursesMap((prev) => ({ ...prev, [activeSlug]: data.data }));
      showToast('Course reset to original defaults', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error resetting course', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add new course handler
  const handleCreateNewCourse = () => {
    if (!newCourseTitle.trim()) {
      showToast('Please enter a course title', 'error');
      return;
    }
    const cleanSlug = (newCourseSlug.trim() || newCourseTitle.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (coursesMap[cleanSlug]) {
      showToast('A course with this URL slug already exists', 'error');
      return;
    }

    const nextCount = Object.keys(coursesMap).length + 1;
    const newCourseObj = {
      slug: cleanSlug,
      n: String(nextCount).padStart(2, '0'),
      theme: newCourseTheme || 'black',
      chips: ['Leadership', 'Mastery'],
      soon: true,
      cls: 'v3',
      title: newCourseTitle.trim(),
      lede: 'Master the psychology and strategies to elevate your life, career, and inner sovereignty.',
      d: 'Comprehensive video modules with private 1-on-1 coaching sessions.',
      sidebarChips: [
        ['Schedule', 'Self-Paced'],
        ['Certificate', 'Yes'],
        ['Language', 'Hinglish / English'],
        ['Mentorship', '1-on-1 Live']
      ],
      hl: [
        ['Real-World Transformation', '(Not Just Theory)'],
        ['2 Private Sessions', 'with Aarkesh']
      ],
      inside: [
        '6 HD video modules & actionable frameworks',
        'Downloadable workbooks & mental models',
        '2 private 1-on-1 coaching sessions with Aarkesh',
        'Lifetime access with all future updates'
      ],
      facts: [['6', 'Modules'], ['2 Free', '1-on-1 Sessions']],
      price: '₹4,999',
      was: '₹9,999',
      cta: 'Check Course',
      syllabusTitle: 'Six Modules To Complete Breakthrough',
      syllabusSubtitle: 'A structured roadmap designed to shift how you communicate, decide, and execute.',
      syllabus: [
        { n: '01', t: 'The Foundation of Clarity', d: 'Dismantling mental fog, identifying core blockers, and establishing your primary focus.' },
        { n: '02', t: 'Emotional Composure Under Pressure', d: 'Conditioning your nervous system to stay steady, sharp, and deliberate.' },
        { n: '03', t: 'Strategic Execution & Momentum', d: 'Turning vision into daily disciplined action without friction or burnout.' }
      ],
      writeup: {
        chip: 'CORE METHODOLOGY',
        h1: `Why ${newCourseTitle.trim()} Changes Everything`,
        lede: 'True sovereignty is not accidental. It is the deliberate result of structured principles and consistent execution.',
        p1: 'Most people struggle not from lack of ambition, but from emotional friction and absence of a clear behavioral framework.',
        quote: 'Clarity creates courage. Courage creates momentum.',
        p2: 'Through step-by-step masterclasses, you dismantle reactive habits and install elite mental models that last a lifetime.',
        distinction: 'Reactive individuals wait for circumstances to change. Anchored leaders change their internal state first.'
      }
    };

    setCoursesMap((prev) => ({ ...prev, [cleanSlug]: newCourseObj }));
    setActiveSlug(cleanSlug);
    setViewMode('editor');
    setShowAddCourseModal(false);
    setNewCourseTitle('');
    setNewCourseSlug('');
    showToast(`🎉 New course "${newCourseObj.title}" created! Now configure its 3 sections.`, 'success');
  };

  // Helper to determine the theme of a card
  const getCardTheme = (course, index) => {
    if (course.theme) return course.theme;
    if (course.slug === 'better-man' || index % 3 === 0) return 'black';
    if (course.slug === 'difficult-people' || index % 3 === 1) return 'purple';
    return 'white';
  };

  if (loading) {
    return (
      <div className="preserve-dark w-full h-96 flex items-center justify-center gap-3 text-white bg-[#0e070e]" data-preserve-dark="true">
        <ArrowClockwise size={24} className="animate-spin text-[#c9542f]" />
        <span style={{ color: '#ffffff' }}>Loading courses library...</span>
      </div>
    );
  }

  const courseSlugs = Object.keys(coursesMap);
  const writeup = currentCourse.writeup || {};

  // Filtered courses for catalog grid
  const filteredSlugs = courseSlugs.filter((slug) => {
    const c = coursesMap[slug] || {};
    const titleMatch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || slug.toLowerCase().includes(searchQuery.toLowerCase());
    if (!titleMatch) return false;
    if (statusFilter === 'live') return !c.soon;
    if (statusFilter === 'waitlist') return !!c.soon;
    return true;
  });

  const totalCourses = courseSlugs.length;
  const liveCount = courseSlugs.filter(s => !coursesMap[s]?.soon).length;
  const waitlistCount = courseSlugs.filter(s => coursesMap[s]?.soon).length;
  const totalModules = courseSlugs.reduce((acc, s) => acc + (coursesMap[s]?.syllabus?.length || 0), 0);

  // =========================================================================
  // VIEW 1: CATALOG CARD GRID VIEW (3 CLIENT THEMES MATCHING)
  // =========================================================================
  if (viewMode === 'catalog') {
    return (
      <div 
        className="preserve-dark w-full min-h-[calc(100vh-120px)] bg-gradient-to-b from-[#180e18] via-[#0f0810] to-[#080508] text-white flex flex-col"
        data-preserve-dark="true"
      >
        {/* Top Header Banner */}
        <div className="w-full bg-[#110912]/95 backdrop-blur-md border-b border-white/10 px-6 sm:px-10 py-6 sm:py-8 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#c9542f]/20 text-[#ff7347] text-[10px] uppercase font-mono font-bold tracking-widest border border-[#c9542f]/40">
                  3-THEME COURSE CATALOG & EDITOR
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-white font-semibold flex items-center gap-3" style={{ color: '#ffffff' }}>
                <GraduationCap size={32} className="text-[#c9542f]" />
                <span style={{ color: '#ffffff' }}>Masterclasses Library</span>
              </h1>
              <p className="text-xs sm:text-sm mt-1 max-w-2xl" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                Showing your courses in their exact 3 visual themes: <strong style={{ color: '#ffffff' }}>Obsidian Black</strong>, <strong style={{ color: '#E3B8DE' }}>Royal Purple</strong>, and <strong style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.12)' }} className="px-1.5 py-0.5 rounded">Clean White</strong>. Click <strong style={{ color: '#c9542f' }}>"Edit 3-Sections"</strong> to customize.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAddCourseModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#c9542f]/25 cursor-pointer"
                style={{ color: '#ffffff' }}
              >
                <Plus size={16} weight="bold" />
                <span>Create New Masterclass</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar & Search / Filter Controls */}
          <div className="max-w-7xl mx-auto mt-6 pt-5 border-t border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Quick Metrics Chips */}
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <span className="font-serif text-base font-bold" style={{ color: '#ffffff' }}>{totalCourses}</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Courses</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }} className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-serif text-base font-bold" style={{ color: '#34d399' }}>{liveCount}</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Live Enrolling</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }} className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <span className="inline-block w-2 h-2 rounded-full bg-[#c9542f]"></span>
                <span className="font-serif text-base font-bold" style={{ color: '#c9542f' }}>{waitlistCount}</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Waitlist / Coming Soon</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }} className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <span className="font-serif text-base font-bold" style={{ color: '#E3B8DE' }}>{totalModules}</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Modules</span>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Box */}
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search course title or slug..."
                  className="w-full bg-[#181119] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c9542f] placeholder-white/30"
                  style={{ color: '#ffffff' }}
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center bg-[#181119] p-0.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'all' ? 'bg-[#c9542f] text-white' : 'text-white/60 hover:text-white'
                  }`}
                  style={{ color: statusFilter === 'all' ? '#ffffff' : 'rgba(255,255,255,0.7)' }}
                >
                  All ({totalCourses})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('live')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'live' ? 'bg-emerald-500 text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Live ({liveCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('waitlist')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'waitlist' ? 'bg-[#c9542f] text-white' : 'text-white/60 hover:text-white'
                  }`}
                  style={{ color: statusFilter === 'waitlist' ? '#ffffff' : 'rgba(255,255,255,0.7)' }}
                >
                  Coming Soon ({waitlistCount})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── COURSE CARDS GRID (EXACT 3 CLIENT THEMES) ── */}
        <div className="max-w-7xl mx-auto w-full p-6 sm:p-10 flex-1">
          {filteredSlugs.length === 0 ? (
            <div className="w-full bg-[#140c15] border border-dashed border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <GraduationCap size={40} className="text-white/20" />
              <h3 className="text-base font-semibold" style={{ color: '#ffffff' }}>No courses match your search</h3>
              <p className="text-xs max-w-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Try clearing your search query or create a new masterclass course.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="mt-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#c9542f] border border-[#c9542f]/30"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredSlugs.map((slug, idx) => {
                const c = coursesMap[slug] || {};
                const isLive = !c.soon;
                const cardTheme = getCardTheme(c, idx);

                // Setup theme-specific card container classes
                let cardBgClass = 'bg-[#0B070B] text-white border border-[#c878be]/25 shadow-2xl shadow-black/80';
                let visBgStyle = { background: 'radial-gradient(circle at 30% 25%, #8A2E80, #3D1A38 60%, #0A050A)' };
                let titleHex = '#ffffff';
                let ledeHex = 'rgba(255, 255, 255, 0.75)';
                let priceColor = 'text-[#E3B8DE]';
                let badgeClass = 'bg-[#2E1A2B] text-[#E3B8DE] border border-[#c878be]/30';

                if (cardTheme === 'purple') {
                  cardBgClass = 'bg-gradient-to-b from-[#58184E] to-[#2E0B29] text-white border border-white/20 shadow-2xl shadow-black/60';
                  visBgStyle = { background: 'radial-gradient(circle at 70% 25%, #1a1a1a, #080808 75%)' };
                  titleHex = '#ffffff';
                  ledeHex = 'rgba(255, 255, 255, 0.8)';
                  priceColor = 'text-white';
                  badgeClass = 'bg-white/95 text-[#7A2A70]';
                } else if (cardTheme === 'white') {
                  cardBgClass = 'bg-[#FFFFFF] text-[#110D13] border border-[#7A2A70]/15 shadow-2xl shadow-purple-950/15';
                  visBgStyle = { background: 'radial-gradient(circle at 30% 28%, #C878BE, #7A2A70 45%, #3D1A38 80%)' };
                  titleHex = '#110D13';
                  ledeHex = '#4A434E';
                  priceColor = 'text-[#7A2A70]';
                  badgeClass = 'bg-[#F6ECF4] text-[#7A2A70] border border-[#7A2A70]/20';
                }

                return (
                  <div
                    key={slug}
                    className={`group ${cardBgClass} rounded-[28px] p-6 transition-all duration-300 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(122,42,112,0.25)] relative overflow-hidden`}
                  >
                    {/* Top Visual Box with Huge Number & Slanted Pills or Uploaded Thumbnail */}
                    <div
                      style={(c.thumbnailUrl || c.imageUrl) ? {} : visBgStyle}
                      className="relative aspect-[16/10] rounded-[22px] mb-5 overflow-hidden flex items-center justify-center border border-white/10 group-hover:scale-[1.01] transition-transform duration-300 shadow-inner select-none bg-black"
                    >
                      {/* Top Right Live / Coming Soon Status Pill */}
                      <div className="absolute top-3 right-3 z-20">
                        {isLive ? (
                          <span 
                            onClick={(e) => handleToggleCourseStatus(slug, e)}
                            title="Click to toggle status"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#E11D48] text-[10px] font-bold uppercase tracking-wider shadow-md cursor-pointer hover:scale-105 transition-transform"
                            style={{ color: '#E11D48' }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse"></span>
                            Live
                          </span>
                        ) : (
                          <span 
                            onClick={(e) => handleToggleCourseStatus(slug, e)}
                            title="Click to toggle status"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20 shadow-md cursor-pointer hover:scale-105 transition-transform"
                            style={{ color: '#ffffff' }}
                          >
                            Coming soon
                          </span>
                        )}
                      </div>

                      {(c.thumbnailUrl || c.imageUrl) ? (
                        <img 
                          src={resolveImageUrl(c.thumbnailUrl || c.imageUrl)} 
                          alt={c.title || slug}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <>
                          {/* Center Huge Sequence Number */}
                          <span className="font-sans font-bold text-7xl sm:text-8xl text-white tracking-tighter leading-none drop-shadow-md" style={{ color: '#ffffff' }}>
                            {c.n || String(idx + 1).padStart(2, '0')}
                          </span>

                          {/* Top Right Tilted Chip Pill */}
                          {c.chips?.[0] && (
                            <span 
                              className="absolute top-4 right-1 sm:right-2 rotate-[-12deg] bg-gradient-to-br from-[#C878BE] to-[#6E2266] text-white px-3.5 py-1.5 rounded-2xl text-[11px] sm:text-xs font-semibold shadow-lg shadow-black/40 border border-white/20"
                              style={{ color: '#ffffff' }}
                            >
                              {c.chips[0]}
                            </span>
                          )}

                          {/* Bottom Left Tilted Chip Pill */}
                          {c.chips?.[1] && (
                            <span 
                              className="absolute bottom-4 left-1 sm:left-2 rotate-[9deg] bg-gradient-to-br from-[#8A6BFF] to-[#3A2A86] text-white px-3.5 py-1.5 rounded-2xl text-[11px] sm:text-xs font-semibold shadow-lg shadow-black/40 border border-white/20"
                              style={{ color: '#ffffff' }}
                            >
                              {c.chips[1]}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Course Title */}
                        <h2 
                          className="font-serif text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-2"
                          style={{ color: titleHex }}
                        >
                          {c.title || slug}
                        </h2>

                        {/* Course Short Description */}
                        <p 
                          className="text-xs sm:text-sm line-clamp-2 leading-relaxed"
                          style={{ color: ledeHex }}
                        >
                          {c.lede || c.d || 'Master the psychology and strategies to elevate your life.'}
                        </p>
                      </div>

                      {/* Price Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-baseline gap-2 font-serif text-base sm:text-lg" style={{ color: cardTheme === 'white' ? '#110D13' : '#ffffff' }}>
                          <span>Price</span>
                          <b className={`text-xl sm:text-2xl font-bold ${priceColor}`}>{c.price || '₹15,000'}</b>
                          {c.was && <s className="text-xs opacity-50">{c.was}</s>}
                        </div>
                      </div>

                      {/* Admin Action Buttons */}
                      <div className="pt-2 flex flex-col gap-2">
                        {/* Primary Button: Edit 3-Sections */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditor(slug)}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#c9542f]/25 cursor-pointer hover:scale-[1.02]"
                          style={{ color: '#ffffff' }}
                        >
                          <PencilSimple size={16} weight="bold" />
                          <span>Edit 3-Sections</span>
                          <CaretRight size={14} weight="bold" />
                        </button>

                        {/* Secondary Actions: View Live & Delete */}
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={`https://aarkeshgupta.com/course/${slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                              cardTheme === 'white'
                                ? 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                                : 'bg-white/10 hover:bg-white/15 text-white/80'
                            }`}
                          >
                            <ArrowSquareOut size={13} />
                            <span>View Live</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteCourse(slug, c.title, e)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors cursor-pointer"
                            title={`Delete course ${c.title || slug}`}
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── "+ CREATE NEW MASTERCLASS" CARD ── */}
              <div
                onClick={() => setShowAddCourseModal(true)}
                className="group bg-[#110912]/80 border-2 border-dashed border-white/15 hover:border-[#c9542f]/60 rounded-[28px] p-8 flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 cursor-pointer min-h-[440px] hover:bg-[#180e1a]"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#c9542f]/15 group-hover:bg-[#c9542f]/25 border border-[#c9542f]/30 flex items-center justify-center text-[#c9542f] transition-transform duration-300 group-hover:scale-110">
                  <Plus size={32} weight="bold" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium group-hover:text-[#c9542f] transition-colors" style={{ color: '#ffffff' }}>
                    Add New Masterclass
                  </h3>
                  <p className="text-xs max-w-xs mt-1 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Create a custom course with its own visual theme, sequence number, pricing, syllabus modules roadmap, and long-form narrative.
                  </p>
                </div>
                <span 
                  className="px-5 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#c9542f]/20 transition-all"
                  style={{ color: '#ffffff' }}
                >
                  + Create Masterclass
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── CREATE NEW COURSE MODAL ── */}
        {showAddCourseModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#140c15] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap size={22} className="text-[#c9542f]" />
                  <h3 className="font-serif text-lg font-medium" style={{ color: '#ffffff' }}>Create New Masterclass</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="text-white/40 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Masterclass Title</label>
                  <input
                    type="text"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="e.g. Executive Gravitas & Vocal Presence"
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c9542f]"
                    style={{ color: '#ffffff' }}
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Custom URL Slug (Optional)</label>
                  <input
                    type="text"
                    value={newCourseSlug}
                    onChange={(e) => setNewCourseSlug(e.target.value)}
                    placeholder="e.g. vocal-presence"
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c9542f] font-mono text-xs"
                    style={{ color: '#ffffff' }}
                  />
                  <span className="text-[11px] text-white/40">Will be accessible at: /course/your-slug</span>
                </div>

                {/* Theme Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Visual Card Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewCourseTheme('black')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        newCourseTheme === 'black'
                          ? 'bg-[#0B070B] text-white border-[#c9542f]'
                          : 'bg-[#1c121d] text-white/60 border-white/10'
                      }`}
                      style={{ color: '#ffffff' }}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#8A2E80]"></span>
                      <span>Obsidian</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewCourseTheme('purple')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        newCourseTheme === 'purple'
                          ? 'bg-[#58184E] text-white border-[#c9542f]'
                          : 'bg-[#1c121d] text-white/60 border-white/10'
                      }`}
                      style={{ color: '#ffffff' }}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#1a1a1a]"></span>
                      <span>Royal Purple</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewCourseTheme('white')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        newCourseTheme === 'white'
                          ? 'bg-white text-black border-[#c9542f]'
                          : 'bg-[#1c121d] text-white/60 border-white/10'
                      }`}
                      style={{ color: newCourseTheme === 'white' ? '#110D13' : 'rgba(255,255,255,0.7)' }}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#C878BE]"></span>
                      <span>Clean White</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewCourse}
                  className="px-5 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#c9542f]/25 cursor-pointer"
                  style={{ color: '#ffffff' }}
                >
                  Create & Open Editor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: 3-SECTION EDITOR VIEW (FOR SELECTED COURSE)
  // =========================================================================
  return (
    <div 
      className="preserve-dark w-full min-h-[calc(100vh-120px)] bg-[#0a050b] text-white flex flex-col"
      data-preserve-dark="true"
    >
      {/* ── TOP ACTION & COURSE SELECTOR BAR ── */}
      <div className="w-full bg-[#110912] border-b border-white/10 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Back to All Courses Button */}
          <button
            type="button"
            onClick={() => setViewMode('catalog')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-colors cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft size={16} weight="bold" />
            <span style={{ color: '#ffffff' }}>← All Courses</span>
          </button>

          <span className="text-white/20">|</span>

          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase font-mono tracking-widest text-white/50 font-semibold hidden sm:inline" style={{ color: 'rgba(255,255,255,0.6)' }}>Editing:</span>
            <span className="font-serif text-lg sm:text-xl font-semibold" style={{ color: '#ffffff' }}>{currentCourse.title || activeSlug}</span>
            
            {/* Interactive Coming Soon / Live Toggle in Header */}
            <button
              type="button"
              onClick={() => handleFieldChange('soon', !currentCourse.soon)}
              title={currentCourse.soon ? "Click to set course as LIVE" : "Click to set course as COMING SOON"}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase font-bold font-mono transition-all cursor-pointer hover:scale-105 shadow-sm ${
                currentCourse.soon 
                  ? 'bg-[#c9542f]/25 text-[#ff8059] border border-[#c9542f]/50 hover:bg-[#c9542f]/35' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentCourse.soon ? 'bg-[#ff8059]' : 'bg-emerald-400 animate-pulse'}`} />
              <span>{currentCourse.soon ? 'Coming Soon' : 'Live'}</span>
              <span className="text-[9px] opacity-70 ml-0.5">(Toggle)</span>
            </button>
          </div>

          <span className="text-white/20 hidden md:inline">|</span>

          {/* Quick Course Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCourseDropdown((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#181119] hover:bg-[#231725] text-white text-xs font-semibold border border-white/15 hover:border-[#c9542f]/50 transition-all cursor-pointer shadow-sm"
              style={{ backgroundColor: '#181119', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <GraduationCap size={15} className="text-[#c9542f]" />
              <span className="max-w-[140px] truncate" style={{ color: '#ffffff' }}>Switch Course</span>
              <CaretDown size={12} className={`text-white/70 transition-transform duration-200 ${showCourseDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCourseDropdown && (
              <>
                {/* Backdrop to dismiss dropdown */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowCourseDropdown(false)} 
                />

                {/* Dropdown Menu */}
                <div 
                  className="absolute left-0 top-full mt-2 w-72 bg-[#140c15] border border-white/20 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in duration-150 backdrop-blur-xl"
                  style={{ backgroundColor: '#140c15', borderColor: 'rgba(255,255,255,0.18)' }}
                >
                  <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest text-white/50 border-b border-white/10 mb-1 flex items-center justify-between">
                    <span>Select Course</span>
                    <span className="text-[#c9542f] font-bold">{courseSlugs.length} Courses</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar">
                    {courseSlugs.map((slug) => {
                      const c = coursesMap[slug] || {};
                      const isSelected = activeSlug === slug;
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => {
                            setActiveSlug(slug);
                            setShowCourseDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-[#c9542f] text-white font-bold shadow-md shadow-[#c9542f]/20'
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                          }`}
                          style={{
                            backgroundColor: isSelected ? '#c9542f' : 'transparent',
                            color: '#ffffff'
                          }}
                        >
                          <span className="truncate pr-2 font-medium" style={{ color: '#ffffff' }}>
                            {c.title || slug}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase shrink-0 font-bold ${
                            c.soon ? 'bg-black/40 text-[#ff8059] border border-[#ff8059]/30' : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {c.soon ? 'Soon' : 'Live'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <a
            href={`https://aarkeshgupta.com/course/${activeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <ArrowSquareOut size={15} />
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>View Live Course</span>
          </a>

          <button
            type="button"
            onClick={handleSaveCourse}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              saveSuccess 
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                : 'bg-[#c9542f] hover:bg-[#b54522] text-white shadow-lg shadow-[#c9542f]/25'
            }`}
            style={{ color: saveSuccess ? '#000000' : '#ffffff' }}
          >
            {saving ? (
              <>
                <ArrowClockwise size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle size={16} weight="fill" />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <FloppyDisk size={16} weight="bold" />
                <span>Save Course Details</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN SPLIT: LEFT SIDEBAR TABS & RIGHT EDITING FORM ── */}
      <div className="flex-1 flex flex-col lg:flex-row items-start">
        {/* Left Section Navigation Sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 bg-[#0e070e] border-b lg:border-b-0 lg:border-r border-white/10 p-4 sm:p-5 flex flex-col gap-2 shrink-0 lg:sticky lg:top-[69px] lg:h-[calc(100vh-69px)] lg:overflow-y-auto self-start z-30">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              4 PAGE SECTIONS
            </span>
            <span className="text-[10px] text-[#c9542f] font-mono">/course/{activeSlug}</span>
          </div>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {SECTION_TABS.map((tab) => {
              const isActive = activeSectionTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSectionTab(tab.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl text-left transition-all cursor-pointer whitespace-nowrap lg:whitespace-normal shrink-0 ${
                    isActive
                      ? 'active-tab bg-[#201120] text-white border border-[#c9542f]/60 shadow-[0_0_20px_rgba(201,84,47,0.18)]'
                      : 'bg-[#160e17] hover:bg-[#221624] text-white border border-white/10 hover:border-white/20'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#201120' : '#160e17',
                    borderColor: isActive ? 'rgba(201,84,47,0.6)' : 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                  }}
                >
                  <div 
                    className="mt-0.5 p-1.5 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: isActive ? 'rgba(201,84,47,0.25)' : 'rgba(255,255,255,0.08)',
                      color: isActive ? '#ff8059' : '#ffffff',
                      border: isActive ? '1px solid rgba(201,84,47,0.4)' : '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    {tab.icon}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 
                      className="text-xs font-bold uppercase tracking-wider sidebar-tab-title" 
                      style={{ color: isActive ? '#ff7347' : '#ffffff' }}
                    >
                      {tab.label}
                    </h3>
                    <p 
                      className="text-[11px] leading-snug line-clamp-2 hidden sm:block sidebar-tab-desc" 
                      style={{ color: isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.65)' }}
                    >
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Action Helper Box */}
          <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetCourse}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors cursor-pointer"
                title="Reset this course to factory content"
                style={{ color: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <ArrowClockwise size={14} />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleDeleteCourse(activeSlug, currentCourse.title, e)}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors cursor-pointer"
                title="Delete this course"
              >
                <Trash size={15} />
              </button>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto space-y-8 w-full max-w-none">
          {/* =========================================================================
              SECTION 1: HERO & PRICING SIDEBAR
              ========================================================================= */}
          {activeSectionTab === 'hero' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h2 className="font-serif text-2xl font-medium" style={{ color: '#ffffff' }}>Section 1: Hero & Pricing Sidebar</h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Customize the visual card theme, tags, lede statement, pricing facts, and what's included checklist.
                </p>
              </div>

              {/* Theme Selector */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4" style={{ backgroundColor: '#140c15' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                  <Palette size={16} /> Course Visual Card Theme
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('theme', 'black')}
                    className={`theme-btn-black p-3.5 rounded-2xl border flex flex-col items-start gap-2 cursor-pointer transition-all ${
                      (currentCourse.theme || 'black') === 'black'
                        ? 'border-[#c9542f] shadow-lg shadow-[#c9542f]/20 ring-2 ring-[#c9542f]/40'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      backgroundColor: '#0B070B',
                      borderColor: (currentCourse.theme || 'black') === 'black' ? '#c9542f' : 'rgba(255,255,255,0.12)',
                      color: '#ffffff',
                    }}
                  >
                    <div className="w-full h-12 rounded-xl bg-radial from-[#8A2E80] via-[#3D1A38] to-[#0A050A] flex items-center justify-center font-bold text-lg text-white" style={{ color: '#ffffff' }}>
                      01
                    </div>
                    <div>
                      <h4 className="text-xs font-bold" style={{ color: '#ffffff' }}>1. Obsidian Black</h4>
                      <p className="text-[11px]" style={{ color: 'rgba(255, 255, 255, 0.55)' }}>Purple glow banner & black card</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFieldChange('theme', 'purple')}
                    className={`theme-btn-purple p-3.5 rounded-2xl border flex flex-col items-start gap-2 cursor-pointer transition-all ${
                      currentCourse.theme === 'purple'
                        ? 'border-[#c9542f] shadow-lg shadow-[#c9542f]/20 ring-2 ring-[#c9542f]/40'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      backgroundColor: '#58184E',
                      borderColor: currentCourse.theme === 'purple' ? '#c9542f' : 'rgba(255,255,255,0.12)',
                      color: '#ffffff',
                    }}
                  >
                    <div className="w-full h-12 rounded-xl bg-radial from-[#1a1a1a] to-[#080808] flex items-center justify-center font-bold text-lg text-white" style={{ color: '#ffffff' }}>
                      02
                    </div>
                    <div>
                      <h4 className="text-xs font-bold" style={{ color: '#ffffff' }}>2. Royal Purple</h4>
                      <p className="text-[11px]" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Dark black banner & plum card</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFieldChange('theme', 'white')}
                    className={`theme-btn-white p-3.5 rounded-2xl border flex flex-col items-start gap-2 cursor-pointer transition-all ${
                      currentCourse.theme === 'white'
                        ? 'border-[#c9542f] shadow-lg shadow-[#c9542f]/20 ring-2 ring-[#c9542f]/40'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: currentCourse.theme === 'white' ? '#c9542f' : 'rgba(255,255,255,0.12)',
                      color: '#110D13',
                    }}
                  >
                    <div className="w-full h-12 rounded-xl bg-radial from-[#C878BE] via-[#7A2A70] to-[#3D1A38] flex items-center justify-center font-bold text-lg text-white" style={{ color: '#ffffff' }}>
                      03
                    </div>
                    <div>
                      <h4 className="text-xs font-bold" style={{ color: '#110D13' }}>3. Clean White</h4>
                      <p className="text-[11px]" style={{ color: '#4A434E' }}>Magenta banner & white card</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* ── COURSE THUMBNAIL & VISUAL BANNER STUDIO (MATCHING IMAGE 2) ── */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5" style={{ backgroundColor: '#140c15' }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                    <ImageIcon size={16} /> Course Thumbnail & Visual Card Studio
                  </h3>
                  <span className="text-[10px] text-white/50 font-mono">
                    {(currentCourse.thumbnailUrl || currentCourse.imageUrl) ? 'Custom Image Active' : 'Procedural Graphic Active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* LEFT: Live Interactive Preview (Matching Screenshot 2) */}
                  <div className="lg:col-span-6 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-2 self-start font-semibold">
                      LIVE THUMBNAIL PREVIEW
                    </span>

                    {/* Dark Preview Device Frame */}
                    <div className="w-full bg-[#080408] border border-white/10 rounded-[26px] p-4 sm:p-5 shadow-2xl shadow-black/80 flex flex-col gap-4">
                      {/* 16:10 Aspect Ratio Visual Banner */}
                      <div 
                        className="w-full aspect-[16/10] rounded-[20px] overflow-hidden relative shadow-inner flex items-center justify-center select-none border border-white/10 bg-black"
                        style={
                          (currentCourse.thumbnailUrl || currentCourse.imageUrl)
                            ? {}
                            : currentCourse.theme === 'purple'
                            ? { background: 'radial-gradient(circle at 70% 25%, #1a1a1a, #080808 75%)' }
                            : currentCourse.theme === 'white'
                            ? { background: 'radial-gradient(circle at 30% 28%, #C878BE, #7A2A70 45%, #3D1A38 80%)' }
                            : { background: 'radial-gradient(circle at 30% 25%, #8A2E80, #3D1A38 60%, #0A050A)' }
                        }
                      >
                        {/* Top Right Live Pill */}
                        <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-20">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#E11D48] text-[10px] font-bold uppercase tracking-wider shadow-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse"></span>
                            LIVE
                          </span>
                        </div>

                        {(currentCourse.thumbnailUrl || currentCourse.imageUrl) ? (
                          <img 
                            src={resolveImageUrl(currentCourse.thumbnailUrl || currentCourse.imageUrl)} 
                            alt={currentCourse.title || 'Course Thumbnail'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            {/* Center Big Number */}
                            <span 
                              className="font-sans font-bold text-white tracking-tighter leading-none select-none"
                              style={{ 
                                fontSize: 'clamp(3.8rem, 8vw, 5.5rem)',
                                textShadow: '0 8px 24px rgba(0,0,0,0.6)'
                              }}
                            >
                              {currentCourse.n || '01'}
                            </span>

                            {/* Top Right Tilted Chip Pill */}
                            <span 
                              className="absolute top-4 right-1 sm:right-2 rotate-[-12deg] bg-gradient-to-br from-[#C878BE] to-[#6E2266] text-white px-3 sm:px-3.5 py-1.5 rounded-2xl text-[10px] sm:text-xs font-semibold shadow-xl border border-white/20"
                            >
                              {currentCourse.chips?.[0] || 'Calm Authority'}
                            </span>

                            {/* Bottom Left Tilted Chip Pill */}
                            <span 
                              className="absolute bottom-4 left-1 sm:left-2 rotate-[9deg] bg-gradient-to-br from-[#8A6BFF] to-[#3A2A86] text-white px-3 sm:px-3.5 py-1.5 rounded-2xl text-[10px] sm:text-xs font-semibold shadow-xl border border-white/20"
                            >
                              {currentCourse.chips?.[1] || 'Self-Command'}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Bottom Info Pills Bar (Matching Image 2) */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] font-medium">
                          {currentCourse.chips?.[0] || 'Calm Authority'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] font-medium">
                          {currentCourse.chips?.[1] || 'Self-Command'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] font-medium">
                          {currentCourse.facts?.[0]?.[0] || '8'} Modules
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Upload Controls & Direct URL */}
                  <div className="lg:col-span-6 flex flex-col gap-4">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-semibold">
                      THUMBNAIL IMAGE CONTROLS
                    </span>

                    {/* Drag-and-drop / File Upload Box */}
                    <div className="bg-[#1c121d] border-2 border-dashed border-white/15 hover:border-[#c9542f]/50 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2 transition-colors relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        disabled={uploadingThumbnail}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className="w-12 h-12 rounded-xl bg-[#c9542f]/15 border border-[#c9542f]/30 flex items-center justify-center text-[#ff8059]">
                        {uploadingThumbnail ? (
                          <ArrowClockwise size={22} className="animate-spin" />
                        ) : (
                          <UploadSimple size={22} weight="bold" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {uploadingThumbnail ? 'Uploading image...' : 'Click or drag & drop to upload Thumbnail'}
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5">
                          Supports JPG, PNG, WebP (Max 5MB • 16:10 ratio recommended)
                        </p>
                      </div>
                    </div>

                    {/* Direct Image URL input */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider text-white/60">Or Enter Image URL</label>
                        {(currentCourse.thumbnailUrl || currentCourse.imageUrl) && (
                          <button
                            type="button"
                            onClick={() => {
                              handleFieldChange('imageUrl', '');
                              handleFieldChange('thumbnailUrl', '');
                              showToast('Custom thumbnail reset to default graphic', 'info');
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold cursor-pointer underline"
                          >
                            Remove Custom Image
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={currentCourse.thumbnailUrl || currentCourse.imageUrl || ''}
                        onChange={(e) => {
                          handleFieldChange('imageUrl', e.target.value);
                          handleFieldChange('thumbnailUrl', e.target.value);
                        }}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#c9542f]"
                        style={{ color: '#ffffff' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── COURSE TRAILER / PREVIEW VIDEO (PUBLIC ACCESS) ── */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5" style={{ backgroundColor: '#140c15' }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                      <FilmStrip size={16} /> Course Trailer & Preview Video (Mux Powered)
                    </h3>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      This free preview video streams via Mux adaptive HLS or YouTube when visitors click the Play button on the hero banner.
                    </p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                    (currentCourse.trailerMuxPlaybackId || currentCourse.trailerVideoUrl || currentCourse.previewVideoUrl || currentCourse.youtubeUrl)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/10 text-white/50 border border-white/10'
                  }`}>
                    {(currentCourse.trailerMuxPlaybackId || currentCourse.trailerVideoUrl || currentCourse.previewVideoUrl || currentCourse.youtubeUrl) ? 'Trailer Active' : 'No Trailer Linked'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* LEFT: Video Player Preview */}
                  <div className="lg:col-span-6 flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-semibold flex items-center justify-between">
                      <span>LIVE TRAILER PREVIEW</span>
                      {currentCourse.trailerMuxPlaybackId && (
                        <span className="text-emerald-400 font-mono text-[9px] lowercase">mux:{currentCourse.trailerMuxPlaybackId.slice(0, 8)}...</span>
                      )}
                    </span>

                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 relative flex items-center justify-center shadow-xl">
                      {(() => {
                        const rawUrl = currentCourse.trailerMuxPlaybackId || currentCourse.trailerVideoUrl || currentCourse.previewVideoUrl || currentCourse.youtubeUrl || '';
                        const muxId = extractMuxPlaybackId(rawUrl) || currentCourse.trailerMuxPlaybackId;
                        const ytId = extractYoutubeVideoId(rawUrl);

                        if (muxId) {
                          return (
                            <iframe
                              src={`https://player.mux.com/${muxId}?accentColor=C878BE`}
                              title="Trailer Mux Video Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }

                        if (ytId) {
                          return (
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`}
                              title="Trailer YouTube Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }

                        if (rawUrl && !rawUrl.startsWith('data:') && !rawUrl.startsWith('blob:') && rawUrl.includes('/')) {
                          return (
                            <video
                              src={resolveImageUrl(rawUrl)}
                              controls
                              className="w-full h-full object-contain"
                            />
                          );
                        }

                        return (
                          <div className="text-center p-6 space-y-2">
                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mx-auto">
                              <Play size={20} weight="fill" />
                            </div>
                            <p className="text-xs text-white/50">No preview video attached yet</p>
                            <p className="text-[10px] text-white/30">Upload video to Mux or paste a YouTube / Mux ID</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* RIGHT: Input & Upload Controls */}
                  <div className="lg:col-span-6 flex flex-col gap-4">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-semibold">
                      MUX &amp; VIDEO SOURCES
                    </span>

                    {/* 1. MUX DIRECT UPLOAD BOX */}
                    <div className="bg-[#1c121d] border-2 border-dashed border-white/15 hover:border-[#c9542f]/50 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-2.5 transition-colors relative group">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleTrailerMuxUpload}
                        disabled={trailerVideoStatus === 'uploading' || trailerVideoStatus === 'processing'}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
                      />

                      {trailerVideoStatus === 'uploading' ? (
                        <div className="w-full space-y-2 py-1">
                          <div className="flex items-center justify-between text-xs text-white/80 font-mono">
                            <span>Uploading video to Mux...</span>
                            <span className="text-[#ff8059] font-bold">{trailerUploadProgress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#c9542f] to-[#ff8059] transition-all duration-200"
                              style={{ width: `${trailerUploadProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-white/40">Direct streaming transfer to Mux video CDN...</p>
                        </div>
                      ) : trailerVideoStatus === 'processing' ? (
                        <div className="w-full space-y-1.5 py-1 flex flex-col items-center">
                          <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                            <CircleNotch size={16} className="animate-spin" />
                            <span>Mux is encoding video...</span>
                          </div>
                          <p className="text-[10px] text-white/40">Generating adaptive HLS video resolutions. Ready in seconds.</p>
                        </div>
                      ) : trailerVideoStatus === 'ready' && currentCourse.trailerMuxPlaybackId ? (
                        <div className="w-full space-y-1 py-0.5 flex flex-col items-center">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                            <CheckCircle size={16} weight="fill" />
                            <span>✓ Mux video active &amp; ready for streaming</span>
                          </div>
                          <p className="text-[10px] text-white/50 font-mono">
                            Playback ID: {currentCourse.trailerMuxPlaybackId}
                          </p>
                          <p className="text-[10px] text-[#ff8059]/80 mt-1">Click to upload a different video file</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-[#c9542f]/15 border border-[#c9542f]/30 flex items-center justify-center text-[#ff8059]">
                            <CloudArrowUp size={22} weight="bold" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">
                              Upload Video directly to Mux
                            </p>
                            <p className="text-[10px] text-white/40 mt-0.5">
                              MP4, MOV, WebM (Auto-transcoded to high-speed CDN stream)
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 2. Mux Playback ID or YouTube Link input */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                          <LinkIcon size={13} className="text-[#c9542f]" /> Or Paste Mux ID / YouTube Link
                        </label>
                        {(currentCourse.trailerMuxPlaybackId || currentCourse.trailerVideoUrl || currentCourse.previewVideoUrl || currentCourse.youtubeUrl) && (
                          <button
                            type="button"
                            onClick={() => {
                              handleFieldChange('trailerMuxPlaybackId', '');
                              handleFieldChange('trailerVideoUrl', '');
                              handleFieldChange('previewVideoUrl', '');
                              handleFieldChange('youtubeUrl', '');
                              setTrailerVideoStatus('none');
                              showToast('Trailer video removed', 'info');
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold cursor-pointer underline"
                          >
                            Remove Video
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={currentCourse.trailerMuxPlaybackId || currentCourse.trailerVideoUrl || currentCourse.previewVideoUrl || currentCourse.youtubeUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          const muxId = extractMuxPlaybackId(val);
                          if (muxId) {
                            handleFieldChange('trailerMuxPlaybackId', muxId);
                            handleFieldChange('trailerVideoUrl', muxId);
                            handleFieldChange('previewVideoUrl', muxId);
                            handleFieldChange('trailerVideoType', 'mux');
                          } else {
                            handleFieldChange('trailerVideoUrl', val);
                            handleFieldChange('previewVideoUrl', val);
                            handleFieldChange('youtubeUrl', val);
                          }
                        }}
                        placeholder="Mux Playback ID (e.g. EcHgOK9coz5...) or YouTube Link"
                        className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#c9542f]"
                        style={{ color: '#ffffff' }}
                      />
                      <span className="text-[10px] text-white/40">
                        Accepts Mux Playback ID, stream.mux.com URL, or YouTube video link.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Title & Slug & Sequence */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                  <Tag size={16} /> Course Identity & Headline
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Course Full Title</label>
                    <input
                      type="text"
                      value={currentCourse.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Sequence Number</label>
                    <input
                      type="text"
                      value={currentCourse.n || '01'}
                      onChange={(e) => handleFieldChange('n', e.target.value)}
                      placeholder="01"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Hero Lede Statement / Subtitle</label>
                  <textarea
                    rows={2}
                    value={currentCourse.lede || ''}
                    onChange={(e) => handleFieldChange('lede', e.target.value)}
                    placeholder="Master the psychology of calm authority..."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: '#ffffff' }}
                  />
                </div>

                {/* Floating Chips (2 tags) */}
                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-xs uppercase tracking-wider text-white/60">Tilted Banner Chips (2 tags)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={currentCourse.chips?.[0] || ''}
                      onChange={(e) => handleChipChange(0, e.target.value)}
                      placeholder="Tag 1 (Top-Right: e.g. Calm Authority)"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                    <input
                      type="text"
                      value={currentCourse.chips?.[1] || ''}
                      onChange={(e) => handleChipChange(1, e.target.value)}
                      placeholder="Tag 2 (Bottom-Left: e.g. Self-Command)"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Checkout Facts */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                  <CurrencyInr size={16} /> Pricing & Primary CTA
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Current Price</label>
                    <input
                      type="text"
                      value={currentCourse.price || ''}
                      onChange={(e) => handleFieldChange('price', e.target.value)}
                      placeholder="₹15,000"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Original Price (Strikethrough)</label>
                    <input
                      type="text"
                      value={currentCourse.was || ''}
                      onChange={(e) => handleFieldChange('was', e.target.value)}
                      placeholder="₹25,000"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white/60 text-sm line-through focus:outline-none focus:border-[#c9542f]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Button CTA Text</label>
                    <input
                      type="text"
                      value={currentCourse.cta || 'Check Course'}
                      onChange={(e) => handleFieldChange('cta', e.target.value)}
                      placeholder="Check Course"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>
                </div>

                {/* GST Settings: Toggle ON/OFF, Rate %, Tax Mode & Live Calculation */}
                {(() => {
                  const isGstOn = currentCourse.enableGst !== false && (currentCourse.gstRate === undefined || Number(currentCourse.gstRate) > 0 || currentCourse.enableGst === true);
                  const effectiveGstRate = isGstOn ? (currentCourse.gstRate !== undefined ? Number(currentCourse.gstRate) : 18) : 0;
                  const rawPrice = typeof currentCourse.price === 'number' 
                    ? currentCourse.price 
                    : Number(String(currentCourse.price || '0').replace(/[^0-9]/g, '')) || 0;
                  const isIncl = Boolean(currentCourse.isGstIncluded);
                  const calcGstAmt = isGstOn && effectiveGstRate > 0
                    ? (isIncl ? Math.round(rawPrice - (rawPrice / (1 + effectiveGstRate / 100))) : Math.round((rawPrice * effectiveGstRate) / 100))
                    : 0;
                  const calcBase = isIncl && isGstOn ? rawPrice - calcGstAmt : rawPrice;
                  const calcTotal = isIncl ? rawPrice : rawPrice + calcGstAmt;

                  return (
                    <div className="bg-[#1c121d] p-4 sm:p-5 rounded-xl border border-white/10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-white">
                              GST Tax Calculation
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                isGstOn
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-white/10 text-white/50 border border-white/10'
                              }`}
                            >
                              {isGstOn ? `GST ON (${effectiveGstRate}%)` : 'GST OFF (0%)'}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/50 mt-0.5">
                            Enable or disable GST charges and adjust tax percentage for student checkout.
                          </p>
                        </div>

                        {/* GST Toggle Button */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-white/70">
                            {isGstOn ? 'Enabled' : 'Disabled'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextState = !isGstOn;
                              setCoursesMap((prev) => ({
                                ...prev,
                                [activeSlug]: {
                                  ...(prev[activeSlug] || {}),
                                  enableGst: nextState,
                                  gstRate: nextState ? (Number(currentCourse.gstRate) || 18) : 0
                                }
                              }));
                            }}
                            className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isGstOn ? 'bg-[#c9542f]' : 'bg-white/20'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isGstOn ? 'translate-x-6' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {isGstOn ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* GST Rate Input with Presets */}
                            <div className="space-y-2">
                              <label className="text-xs uppercase tracking-wider text-white/60">
                                GST Rate Percentage (%)
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  value={currentCourse.gstRate !== undefined ? currentCourse.gstRate : 18}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? '' : Number(e.target.value);
                                    handleFieldChange('gstRate', val);
                                    handleFieldChange('enableGst', true);
                                  }}
                                  placeholder="18"
                                  className="w-full bg-[#261828] border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-semibold focus:outline-none focus:border-[#c9542f]"
                                  style={{ color: '#ffffff' }}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold font-mono">%</span>
                              </div>

                              {/* Presets */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <span className="text-[10px] uppercase font-mono text-white/40 mr-1">Presets:</span>
                                {[0, 5, 12, 18, 28].map((preset) => {
                                  const isSelected = Number(currentCourse.gstRate !== undefined ? currentCourse.gstRate : 18) === preset;
                                  return (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => {
                                        handleFieldChange('gstRate', preset);
                                        handleFieldChange('enableGst', preset > 0);
                                      }}
                                      className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                                        isSelected
                                          ? 'bg-[#c9542f] text-white border-[#c9542f] font-bold shadow-sm'
                                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                                      }`}
                                    >
                                      {preset}%
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Pricing Tax Mode (Inclusive / Exclusive) */}
                            <div className="space-y-2">
                              <label className="text-xs uppercase tracking-wider text-white/60">
                                Pricing Tax Mode
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleFieldChange('isGstIncluded', false)}
                                  className={`p-2.5 rounded-xl border text-left transition-all ${
                                    !currentCourse.isGstIncluded
                                      ? 'bg-[#c9542f]/15 border-[#c9542f] text-white ring-1 ring-[#c9542f]/40'
                                      : 'bg-[#261828] border-white/10 text-white/60 hover:text-white'
                                  }`}
                                >
                                  <div className="text-xs font-bold flex items-center justify-between">
                                    <span>+ Exclusive</span>
                                    {!currentCourse.isGstIncluded && <Check size={13} className="text-[#c9542f]" />}
                                  </div>
                                  <div className="text-[10px] text-white/50 mt-0.5">GST added over price</div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleFieldChange('isGstIncluded', true)}
                                  className={`p-2.5 rounded-xl border text-left transition-all ${
                                    currentCourse.isGstIncluded
                                      ? 'bg-[#c9542f]/15 border-[#c9542f] text-white ring-1 ring-[#c9542f]/40'
                                      : 'bg-[#261828] border-white/10 text-white/60 hover:text-white'
                                  }`}
                                >
                                  <div className="text-xs font-bold flex items-center justify-between">
                                    <span>Included</span>
                                    {currentCourse.isGstIncluded && <Check size={13} className="text-[#c9542f]" />}
                                  </div>
                                  <div className="text-[10px] text-white/50 mt-0.5">GST built into price</div>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Live Checkout Summary Preview */}
                          {rawPrice > 0 && (
                            <div className="bg-[#261828] p-3 rounded-xl border border-white/5 text-xs font-mono space-y-1.5 text-white/80">
                              <div className="text-[10px] uppercase text-white/40 tracking-wider font-sans mb-1 font-semibold">
                                Live Checkout Calculation Preview
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Base Price:</span>
                                <span>₹{calcBase.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-emerald-400">
                                <span>GST ({effectiveGstRate}%):</span>
                                <span>₹{calcGstAmt.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between font-bold text-white pt-1 border-t border-white/10">
                                <span>Student Total Payable:</span>
                                <span className="text-[#c9542f]">₹{calcTotal.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-white/40 italic py-1">
                          GST is turned OFF. Students will be charged ₹{rawPrice.toLocaleString('en-IN')} with 0% tax at checkout.
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 2 Big Highlights in Sidebar Card */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <label className="text-xs uppercase tracking-wider text-white/60">Top 2 Sidebar Highlight Bullets</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#1c121d] p-3 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] uppercase font-mono text-[#c9542f]">Highlight 1</span>
                      <input
                        type="text"
                        value={currentCourse.hl?.[0]?.[0] || ''}
                        onChange={(e) => handleHlChange(0, 0, e.target.value)}
                        placeholder="Primary title (e.g. Build Real Presence)"
                        className="w-full bg-[#261828] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        style={{ color: '#ffffff' }}
                      />
                      <input
                        type="text"
                        value={currentCourse.hl?.[0]?.[1] || ''}
                        onChange={(e) => handleHlChange(0, 1, e.target.value)}
                        placeholder="Subtitle (e.g. (Not Just Theory))"
                        className="w-full bg-[#261828] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      />
                    </div>

                    <div className="bg-[#1c121d] p-3 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] uppercase font-mono text-[#c9542f]">Highlight 2</span>
                      <input
                        type="text"
                        value={currentCourse.hl?.[1]?.[0] || ''}
                        onChange={(e) => handleHlChange(1, 0, e.target.value)}
                        placeholder="Primary title (e.g. 3 Private Sessions)"
                        className="w-full bg-[#261828] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        style={{ color: '#ffffff' }}
                      />
                      <input
                        type="text"
                        value={currentCourse.hl?.[1]?.[1] || ''}
                        onChange={(e) => handleHlChange(1, 1, e.target.value)}
                        placeholder="Subtitle (e.g. with Aarkesh)"
                        className="w-full bg-[#261828] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* What's Inside Checklist */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-white/60">"What's Inside" Feature Checklist</label>
                    <button
                      type="button"
                      onClick={handleAddInsideItem}
                      className="flex items-center gap-1 text-xs text-[#c9542f] hover:text-white cursor-pointer font-semibold"
                    >
                      <Plus size={14} /> Add Checklist Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(currentCourse.inside || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle size={16} weight="fill" className="text-[#c9542f] shrink-0" />
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleInsideItemChange(idx, e.target.value)}
                          className="flex-1 bg-[#1c121d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c9542f]"
                          style={{ color: '#ffffff' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveInsideItem(idx)}
                          className="p-2 text-white/30 hover:text-red-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 2: SYLLABUS & MODULES GRID
              ========================================================================= */}
          {activeSectionTab === 'syllabus' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h2 className="font-serif text-2xl font-medium" style={{ color: '#ffffff' }}>Section 2: Syllabus & Modules Roadmap</h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Manage the curriculum section header and each step-by-step module breakdown.
                </p>
              </div>

              {/* Section Header Controls */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                  <ListNumbers size={16} /> Section Header & Subtitle
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Syllabus Main Title</label>
                  <input
                    type="text"
                    value={currentCourse.syllabusTitle || ''}
                    onChange={(e) => handleFieldChange('syllabusTitle', e.target.value)}
                    placeholder="e.g. Eight Modules To Total Self-Command"
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-serif focus:outline-none focus:border-[#c9542f]"
                    style={{ color: '#ffffff' }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Syllabus Subtitle</label>
                  <textarea
                    rows={2}
                    value={currentCourse.syllabusSubtitle || ''}
                    onChange={(e) => handleFieldChange('syllabusSubtitle', e.target.value)}
                    placeholder="A comprehensive, step-by-step roadmap from baseline nervousness to unshakeable gravitas."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: '#ffffff' }}
                  />
                </div>
              </div>

              {/* Modules List Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                    <Kanban size={16} /> Course Modules ({(currentCourse.syllabus || []).length})
                  </h3>

                  <button
                    type="button"
                    onClick={handleAddSyllabusModule}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#c9542f]/20 cursor-pointer"
                    style={{ color: '#ffffff' }}
                  >
                    <Plus size={15} weight="bold" />
                    <span>Add New Module</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(currentCourse.syllabus || []).map((mod, idx) => (
                    <div
                      key={idx}
                      className="bg-[#140c15] border border-white/10 hover:border-[#c9542f]/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="w-8 h-8 rounded-lg bg-[#221323] border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-[#c9542f]">
                            {mod.n || String(idx + 1).padStart(2, '0')}
                          </span>

                          <input
                            type="text"
                            value={mod.t || ''}
                            onChange={(e) => handleSyllabusChange(idx, 't', e.target.value)}
                            placeholder={`Module ${idx + 1} Title`}
                            className="flex-1 bg-[#1c121d] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-[#c9542f]"
                            style={{ color: '#ffffff' }}
                          />
                        </div>

                        {/* Reorder and Delete Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSyllabus(idx, -1)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white/70"
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (currentCourse.syllabus || []).length - 1}
                            onClick={() => handleMoveSyllabus(idx, 1)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white/70"
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSyllabusModule(idx)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ml-1"
                            title="Delete Module"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Module Description */}
                      <textarea
                        rows={2}
                        value={mod.d || ''}
                        onChange={(e) => handleSyllabusChange(idx, 'd', e.target.value)}
                        placeholder="Detailed psychological frameworks, actionable exercises, and real-world implementation."
                        className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-[#c9542f] resize-none"
                        style={{ color: 'rgba(255,255,255,0.75)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 3: CORE METHODOLOGY & DEEP DIVE
              ========================================================================= */}
          {activeSectionTab === 'methodology' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h2 className="font-serif text-2xl font-medium" style={{ color: '#ffffff' }}>Section 3: Core Methodology & Deep Dive</h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Craft the long-form narrative, quote box, and psychological breakdown that convinces students to enroll.
                </p>
              </div>

              {/* Methodology Card Form */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Header Pill Tag</label>
                    <input
                      type="text"
                      value={writeup.chip || 'CORE METHODOLOGY'}
                      onChange={(e) => handleWriteupChange('chip', e.target.value)}
                      placeholder="CORE METHODOLOGY"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Main Methodology Headline (H1)</label>
                    <input
                      type="text"
                      value={writeup.h1 || ''}
                      onChange={(e) => handleWriteupChange('h1', e.target.value)}
                      placeholder="Most Men Were Never Taught How to Hold Ground"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-serif font-bold focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Opening Hook Lede</label>
                  <textarea
                    rows={2}
                    value={writeup.lede || ''}
                    onChange={(e) => handleWriteupChange('lede', e.target.value)}
                    placeholder="True charisma is not loud. It is the unhurried certainty of a man who does not need permission to take up space."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: '#ffffff' }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Narrative Paragraph 1 (The Problem)</label>
                  <textarea
                    rows={3}
                    value={writeup.p1 || ''}
                    onChange={(e) => handleWriteupChange('p1', e.target.value)}
                    placeholder="When pressure spikes in a meeting, negotiation, or relationship..."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-xs focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  />
                </div>

                {/* Highlighted Quote Box */}
                <div className="bg-[#1c121d] border border-[#c9542f]/30 rounded-2xl p-4 sm:p-5 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-1.5">
                    <Quotes size={16} /> Featured Quote Box
                  </label>
                  <textarea
                    rows={2}
                    value={writeup.quote || ''}
                    onChange={(e) => handleWriteupChange('quote', e.target.value)}
                    placeholder="A room doesn't respond to volume. It responds to certainty."
                    className="w-full bg-[#261828] border border-white/10 rounded-xl px-4 py-2.5 text-white font-serif italic text-sm focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: '#ffffff' }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Narrative Paragraph 2 (The Solution & Transformation)</label>
                  <textarea
                    rows={3}
                    value={writeup.p2 || ''}
                    onChange={(e) => handleWriteupChange('p2', e.target.value)}
                    placeholder="Through structured modules, you dismantle reactive habits..."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-xs focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Bottom Key Distinction / Takeaway</label>
                  <textarea
                    rows={2}
                    value={writeup.distinction || ''}
                    onChange={(e) => handleWriteupChange('distinction', e.target.value)}
                    placeholder="Reactive men seek approval through fast speech. Anchored men lead through stillness and calibrated pauses."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 4: UPLOAD VIDEOS & LESSONS (CURRICULUM SUITE)
              ========================================================================= */}
          {activeSectionTab === 'videos' && (() => {
            const rawModules = getVideoModulesList();
            const allLessons = rawModules.flatMap(m => m.lessons || []);
            const totalLessons = allLessons.length;
            const readyVideosCount = allLessons.filter(l => l.youtubeVideoId || l.videoUrl || l.muxPlaybackId).length;

            const q = videoSearchQuery.trim().toLowerCase();
            const filteredModules = q
              ? rawModules.filter(m => 
                  (m.title && m.title.toLowerCase().includes(q)) ||
                  (m.description && m.description.toLowerCase().includes(q)) ||
                  (m.lessons && m.lessons.some(l => 
                    (l.title && l.title.toLowerCase().includes(q)) ||
                    (l.description && l.description.toLowerCase().includes(q))
                  ))
                )
              : rawModules;

            return (
              <div className="w-full space-y-6 animate-in fade-in duration-200">
                {/* 1. TOP HEADER & ACTION BUTTONS (Matching Image 1) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#c9542f]/15 border border-[#c9542f]/30 flex items-center justify-center text-[#ff8059] shrink-0 shadow-lg shadow-[#c9542f]/10">
                      <VideoCamera size={24} />
                    </div>
                    <div>
                      <h1 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-tight">
                        Course Curriculum & Video Upload
                      </h1>
                      <p className="text-xs text-white/50 mt-0.5">
                        Organize Day-by-Day video sections, upload videos to Mux, and attach learning worksheets.
                      </p>
                    </div>
                  </div>

                  {/* Header Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={handleAutoPopulateFromSyllabus}
                      className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Sync titles from Section 2 Syllabus"
                    >
                      <Sparkle size={14} className="text-[#c9542f]" />
                      <span>Sync Syllabus</span>
                    </button>

                    <button
                      type="button"
                      onClick={fetchAllCourses}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowClockwise size={14} />
                      <span>REFRESH</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenAddModuleModal}
                      className="px-5 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#c9542f]/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus size={16} weight="bold" />
                      <span>+ ADD DAY / SECTION</span>
                    </button>
                  </div>
                </div>

                {/* 2. THREE STATS CARDS (Matching Image 1) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 shadow-lg">
                    <span className="text-[0.68rem] font-sans uppercase tracking-widest text-white/40 block mb-1 font-semibold">
                      TOTAL DAYS / SECTIONS
                    </span>
                    <span className="font-serif text-3xl sm:text-4xl text-white font-normal block">
                      {rawModules.length}
                    </span>
                  </div>

                  <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 shadow-lg">
                    <span className="text-[0.68rem] font-sans uppercase tracking-widest text-white/40 block mb-1 font-semibold">
                      TOTAL VIDEO LESSONS
                    </span>
                    <span className="font-serif text-3xl sm:text-4xl text-[#ff8059] font-normal block">
                      {totalLessons}
                    </span>
                  </div>

                  <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 shadow-lg">
                    <span className="text-[0.68rem] font-sans uppercase tracking-widest text-white/40 block mb-1 font-semibold">
                      VIDEO READY
                    </span>
                    <span className="font-serif text-3xl sm:text-4xl text-emerald-400 font-normal block">
                      {readyVideosCount}
                    </span>
                  </div>
                </div>

                {/* 3. FULL-WIDTH SEARCH BAR (Matching Image 1) */}
                <div className="relative w-full">
                  <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={videoSearchQuery}
                    onChange={(e) => setVideoSearchQuery(e.target.value)}
                    placeholder="Search days, video titles, topics or descriptions..."
                    className="w-full bg-[#140c15] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c9542f] transition-colors"
                  />
                  {videoSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setVideoSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* 4. DAY-BY-DAY / SECTION MODULES LIST (Matching Image 1) */}
                <div className="space-y-6">
                  {filteredModules.length === 0 ? (
                    <div className="bg-[#140c15] border border-dashed border-white/15 rounded-3xl p-12 text-center space-y-4">
                      <FilmStrip size={44} className="text-[#c9542f]/50 mx-auto" weight="light" />
                      <h3 className="font-serif text-2xl text-white">No Days or Sections Found</h3>
                      <p className="text-white/50 text-sm max-w-md mx-auto">
                        {videoSearchQuery 
                          ? `No sections matching "${videoSearchQuery}". Try clearing the search.`
                          : 'Get started by adding your first Day (e.g. Day 1: Foundation of Presence) and uploading videos.'}
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleOpenAddModuleModal}
                          className="px-6 py-3 rounded-xl bg-[#c9542f] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#b54522] transition-colors cursor-pointer"
                        >
                          <Plus size={16} weight="bold" /> Add Day 1
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredModules.map((mod, modIdx) => {
                      const isExpanded = expandedVideoModules[mod.id || modIdx] !== false;
                      const lessons = mod.lessons || [];

                      return (
                        <div
                          key={mod.id || modIdx}
                          className="bg-[#140c15] border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all hover:border-[#c9542f]/30"
                        >
                          {/* Module / Day Header Strip */}
                          <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white/[0.03] to-transparent border-b border-white/5">
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              {/* Reorder Up/Down Stack */}
                              <div className="flex sm:flex-col gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMoveVideoModule(modIdx, -1)}
                                  disabled={modIdx === 0}
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-20 transition-colors"
                                  title="Move Day Up"
                                >
                                  <ArrowUp size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveVideoModule(modIdx, 1)}
                                  disabled={modIdx === filteredModules.length - 1}
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-20 transition-colors"
                                  title="Move Day Down"
                                >
                                  <ArrowDown size={14} />
                                </button>
                              </div>

                              {/* Title & Description Click to Expand */}
                              <div 
                                onClick={() => setExpandedVideoModules(prev => ({ ...prev, [mod.id || modIdx]: !isExpanded }))}
                                className="flex-1 min-w-0 cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="font-serif text-lg md:text-xl text-white font-normal group-hover:text-[#ff8059] transition-colors truncate">
                                    {mod.title || `Day ${modIdx + 1}: Section Title`}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#c9542f]/15 border border-[#c9542f]/30 text-[0.68rem] text-[#ff8059] font-semibold shrink-0">
                                    {lessons.length} {lessons.length === 1 ? 'Video' : 'Videos'}
                                  </span>
                                </div>
                                <p className="text-white/50 text-xs mt-1 truncate">
                                  {mod.description || 'Master grounding techniques, psychological anchoring, and inner stillness under pressure.'}
                                </p>
                              </div>
                            </div>

                            {/* Day Action Buttons (Matching Image 1) */}
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleOpenAddLessonModal(modIdx)}
                                className="px-3.5 py-2 rounded-lg bg-[#c9542f]/15 border border-[#c9542f]/40 text-[#ff8059] hover:bg-[#c9542f] hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Plus size={14} weight="bold" />
                                <span>Upload Video</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditModuleModal(modIdx)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                                title="Edit Day Heading"
                              >
                                <Pen size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteVideoModule(modIdx)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete Day"
                              >
                                <Trash size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Videos inside Day (Matching Image 1) */}
                          {isExpanded && (
                            <div className="p-4 md:p-6 space-y-3 bg-[#0c070d]/90">
                              {lessons.length === 0 ? (
                                <div className="py-8 px-4 rounded-xl border border-dashed border-white/10 text-center">
                                  <VideoCamera size={28} className="text-white/30 mx-auto mb-2" />
                                  <p className="text-white/50 text-xs">No videos in this section yet.</p>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddLessonModal(modIdx)}
                                    className="mt-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-[#c9542f]/20 border border-white/10 hover:border-[#c9542f]/40 text-xs text-[#ff8059] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Plus size={13} weight="bold" /> Upload First Video
                                  </button>
                                </div>
                              ) : (
                                lessons.map((lesson, lessonIndex) => {
                                  const ytId = lesson.youtubeVideoId || extractYoutubeVideoId(lesson.youtubeUrl);
                                  const hasYt = Boolean(ytId);
                                  const hasDirect = Boolean(lesson.videoUrl);
                                  const hasMux = Boolean(lesson.muxPlaybackId);
                                  const isReady = hasYt || hasDirect || hasMux;

                                  return (
                                    <div
                                      key={lesson.id || lessonIndex}
                                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#1c121d] border border-white/5 hover:border-white/15 transition-all group relative overflow-hidden"
                                    >
                                      {/* Left: Reorder + Play Icon + Title + Details */}
                                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                        {/* Reorder Stack */}
                                        <div className="flex flex-col gap-0.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => handleMoveLesson(modIdx, lessonIndex, -1)}
                                            disabled={lessonIndex === 0}
                                            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20"
                                            title="Move Video Up"
                                          >
                                            <ArrowUp size={12} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleMoveLesson(modIdx, lessonIndex, 1)}
                                            disabled={lessonIndex === lessons.length - 1}
                                            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20"
                                            title="Move Video Down"
                                          >
                                            <ArrowDown size={12} />
                                          </button>
                                        </div>

                                        {/* Video Play / Thumbnail Box */}
                                        <div
                                          onClick={() => {
                                            if (hasYt) {
                                              setPreviewingVideo({ type: 'youtube', title: lesson.title, id: ytId });
                                            } else if (hasDirect) {
                                              setPreviewingVideo({ type: 'direct', title: lesson.title, url: lesson.videoUrl });
                                            }
                                          }}
                                          className="w-12 h-12 rounded-lg bg-black border border-white/10 flex items-center justify-center shrink-0 relative overflow-hidden cursor-pointer hover:border-[#c9542f]/50 transition-colors"
                                          title={isReady ? 'Click to watch preview' : 'No video stream attached'}
                                        >
                                          {isReady ? (
                                            <Play size={18} weight="fill" className="text-[#ff8059]" />
                                          ) : (
                                            <VideoCamera size={18} className="text-white/30" />
                                          )}
                                        </div>

                                        {/* Title & Metadata Details */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold text-white truncate">
                                              {lesson.title || `Video ${lessonIndex + 1}`}
                                            </h4>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenEditLessonModal(modIdx, lessonIndex)}
                                              className="text-white/40 hover:text-[#ff8059] transition-colors"
                                              title="Edit Title"
                                            >
                                              <Pen size={12} />
                                            </button>
                                          </div>

                                          <div className="flex items-center gap-3 mt-1 text-[11px] text-white/50 flex-wrap">
                                            {/* Duration */}
                                            <span className="flex items-center gap-1 font-mono">
                                              <Clock size={12} /> {lesson.duration || '12:30'}
                                            </span>

                                            {/* Status Badge */}
                                            {hasYt ? (
                                              <span className="text-emerald-400 flex items-center gap-1 font-mono font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                YouTube Ready
                                              </span>
                                            ) : hasMux ? (
                                              <span className="text-emerald-400 flex items-center gap-1 font-mono font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                Mux Ready
                                              </span>
                                            ) : hasDirect ? (
                                              <span className="text-blue-400 flex items-center gap-1 font-mono font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                Direct Video Ready
                                              </span>
                                            ) : (
                                              <span className="text-amber-400 flex items-center gap-1 font-mono">
                                                <WarningCircle size={12} /> No video attached
                                              </span>
                                            )}

                                            {/* Free Preview Pill */}
                                            {lesson.isFreePreview && (
                                              <span className="px-2 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                                                Free Preview
                                              </span>
                                            )}

                                            {/* Resources Tag */}
                                            {lesson.resources && lesson.resources.length > 0 && (
                                              <span className="text-purple-300 flex items-center gap-1">
                                                <FileText size={12} /> {lesson.resources.length} {lesson.resources.length === 1 ? 'file' : 'files'}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Right: Action Buttons (Matching Image 1) */}
                                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                                        {/* Replace / Upload Video Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditLessonModal(modIdx, lessonIndex)}
                                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                          <UploadSimple size={13} />
                                          <span>{isReady ? 'Replace Video' : 'Upload Video'}</span>
                                        </button>

                                        {/* Comments Button */}
                                        <button
                                          type="button"
                                          onClick={() => setCommentsModalLesson(lesson)}
                                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                          <ChatCenteredDots size={14} className="text-[#ff8059]" />
                                          <span>Comments</span>
                                        </button>

                                        {/* Edit Details */}
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditLessonModal(modIdx, lessonIndex)}
                                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                                          title="Edit Lesson Details"
                                        >
                                          <Pen size={14} />
                                        </button>

                                        {/* Duplicate Lesson */}
                                        <button
                                          type="button"
                                          onClick={() => handleDuplicateLesson(modIdx, lessonIndex)}
                                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                                          title="Duplicate Lesson"
                                        >
                                          <Copy size={14} />
                                        </button>

                                        {/* Delete Lesson */}
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteLesson(modIdx, lessonIndex)}
                                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors cursor-pointer"
                                          title="Delete Lesson"
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
                    })
                  )}
                </div>
              </div>
            );
          })()}
        </main>
      </div>

      {/* ── 1. DAY / SECTION HEADING EDIT MODAL ── */}
      {editingModuleModal && (
        <div className="fixed inset-0 z-[210] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140c15] border border-white/15 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingModuleModal.modIdx !== null ? 'Edit Section / Day' : 'Add New Day / Section'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingModuleModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                  Section / Day Title *
                </label>
                <input
                  type="text"
                  value={editingModuleModal.title}
                  onChange={(e) => setEditingModuleModal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Day 1: The Foundation of Presence"
                  className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9542f]"
                  style={{ color: '#ffffff' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                  Subtitle / Summary
                </label>
                <textarea
                  rows={3}
                  value={editingModuleModal.description}
                  onChange={(e) => setEditingModuleModal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Master grounding techniques, psychological anchoring, and inner stillness under pressure."
                  className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#c9542f] resize-none"
                  style={{ color: '#ffffff' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingModuleModal(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModuleModal}
                className="px-5 py-2 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#c9542f]/25"
              >
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. LESSON VIDEO ADD / EDIT MODAL ── */}
      {showLessonModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#140c15] border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#1a0f1b] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c9542f]/20 border border-[#c9542f]/40 flex items-center justify-center text-[#ff8059]">
                  <VideoCamera size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {editingLessonIndex !== null ? 'Edit Video Lesson' : 'Add New Video Lesson'}
                  </h3>
                  <p className="text-xs text-white/50">
                    Target: {getVideoModulesList()[activeModuleIndexForLesson]?.title || 'Selected Module'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Lesson Title */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. 01: Introduction to Inner Stillness"
                  className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9542f]"
                  style={{ color: '#ffffff' }}
                />
              </div>

              {/* Lesson Description */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                  Lesson Description & Key Takeaways
                </label>
                <textarea
                  rows={2}
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Key concepts, frameworks, and practical action items covered in this lecture..."
                  className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#c9542f] resize-none"
                  style={{ color: '#ffffff' }}
                />
              </div>

              {/* Video Source Box (Tabs) */}
              <div className="bg-[#1c121d] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider text-[#c9542f] font-bold flex items-center gap-1.5">
                    <VideoCamera size={16} /> Video Source Stream
                  </label>

                  {/* Provider Selector */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setLessonForm(prev => ({ ...prev, videoSourceType: 'mux' }))}
                      className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                        lessonForm.videoSourceType === 'mux'
                          ? 'bg-[#c9542f] text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Mux Direct
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonForm(prev => ({ ...prev, videoSourceType: 'youtube' }))}
                      className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                        lessonForm.videoSourceType === 'youtube'
                          ? 'bg-[#c9542f] text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      YouTube
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonForm(prev => ({ ...prev, videoSourceType: 'direct' }))}
                      className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                        lessonForm.videoSourceType === 'direct'
                          ? 'bg-[#c9542f] text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Direct MP4
                    </button>
                  </div>
                </div>

                {/* Tab 1: Mux Direct Upload */}
                {lessonForm.videoSourceType === 'mux' && (
                  <div className="space-y-3">
                    {/* Mux Upload Drop Area */}
                    <div className="bg-[#1c121d] border-2 border-dashed border-white/15 hover:border-[#c9542f]/50 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-2.5 transition-colors relative group">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleLessonMuxUpload}
                        disabled={lessonVideoStatus === 'uploading' || lessonVideoStatus === 'processing'}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
                      />

                      {lessonVideoStatus === 'uploading' ? (
                        <div className="w-full space-y-2 py-1">
                          <div className="flex items-center justify-between text-xs text-white/80 font-mono">
                            <span>Uploading video file to Mux...</span>
                            <span className="text-[#ff8059] font-bold">{lessonUploadProgress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#c9542f] to-[#ff8059] transition-all duration-200"
                              style={{ width: `${lessonUploadProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-white/40">Direct high-speed streaming transfer to Mux video CDN...</p>
                        </div>
                      ) : lessonVideoStatus === 'processing' ? (
                        <div className="w-full space-y-1.5 py-1 flex flex-col items-center">
                          <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                            <CircleNotch size={16} className="animate-spin" />
                            <span>Mux is encoding video...</span>
                          </div>
                          <p className="text-[10px] text-white/40">Generating multi-bitrate HLS streams. Ready in seconds.</p>
                        </div>
                      ) : lessonForm.muxPlaybackId ? (
                        <div className="w-full space-y-1 py-0.5 flex flex-col items-center">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                            <CheckCircle size={16} weight="fill" />
                            <span>✓ Mux video active &amp; ready for playback</span>
                          </div>
                          <p className="text-[10px] text-white/50 font-mono">
                            Playback ID: {lessonForm.muxPlaybackId}
                          </p>
                          <p className="text-[10px] text-[#ff8059]/80 mt-1">Click to upload a replacement video</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-[#c9542f]/15 border border-[#c9542f]/30 flex items-center justify-center text-[#ff8059]">
                            <CloudArrowUp size={22} weight="bold" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">
                              Upload Video directly to Mux
                            </p>
                            <p className="text-[10px] text-white/40 mt-0.5">
                              MP4, MOV, WebM (Auto-transcoded to adaptive streaming format)
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Manual Mux Playback ID input */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-white/60">Or Paste Mux Playback ID / Stream Link</label>
                        {lessonForm.muxPlaybackId && (
                          <button
                            type="button"
                            onClick={() => {
                              setLessonForm(prev => ({ ...prev, muxPlaybackId: '' }));
                              setLessonVideoStatus('none');
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold cursor-pointer underline"
                          >
                            Clear ID
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={lessonForm.muxPlaybackId}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          const muxId = extractMuxPlaybackId(val) || val;
                          setLessonForm(prev => ({ ...prev, muxPlaybackId: muxId }));
                        }}
                        placeholder="e.g. EcHgOK9coz5K4rjSwOkoE7Y7O012014022n844"
                        className="w-full bg-[#261828] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#c9542f]"
                        style={{ color: '#ffffff' }}
                      />
                    </div>

                    {/* Live Mux Preview */}
                    {lessonForm.muxPlaybackId && (
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle size={14} weight="fill" /> Mux Playback ID: <strong>{lessonForm.muxPlaybackId}</strong>
                        </span>
                        <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/15 bg-black shadow-lg">
                          <iframe
                            src={`https://player.mux.com/${lessonForm.muxPlaybackId}?accentColor=C878BE`}
                            title="Lesson Mux Preview"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: YouTube */}
                {lessonForm.videoSourceType === 'youtube' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/60">YouTube Video URL or 11-char Video ID</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={lessonForm.youtubeUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            const extractedId = extractYoutubeVideoId(val);
                            setLessonForm(prev => ({
                              ...prev,
                              youtubeUrl: val,
                              youtubeVideoId: extractedId || val
                            }));
                          }}
                          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                          className="w-full bg-[#261828] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#c9542f]"
                          style={{ color: '#ffffff' }}
                        />
                        <YoutubeLogo size={18} weight="fill" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500" />
                      </div>
                    </div>

                    {/* Live Embedded Preview */}
                    {(() => {
                      const ytId = extractYoutubeVideoId(lessonForm.youtubeUrl) || (lessonForm.youtubeVideoId?.length === 11 ? lessonForm.youtubeVideoId : '');
                      if (!ytId) return null;

                      return (
                        <div className="space-y-2 pt-2 border-t border-white/10">
                          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle size={14} weight="fill" /> Detected YouTube ID: <strong>{ytId}</strong>
                          </span>
                          <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/15 bg-black shadow-lg">
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                              title="Lesson YouTube Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Tab 3: Direct MP4 */}
                {lessonForm.videoSourceType === 'direct' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/60">Direct Video File Link (MP4 / WebM)</label>
                      <input
                        type="text"
                        value={lessonForm.videoUrl}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://your-storage-bucket.com/lesson-video.mp4"
                        className="w-full bg-[#261828] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#c9542f]"
                        style={{ color: '#ffffff' }}
                      />
                    </div>

                    {lessonForm.videoUrl && (
                      <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/15 bg-black">
                        <video
                          src={lessonForm.videoUrl}
                          controls
                          className="w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 bg-[#1a0f1b] border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLessonModal}
                className="px-6 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#c9542f]/25 cursor-pointer transition-all"
              >
                Save Lesson Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. VIDEO PLAYER PREVIEW POPUP DIALOG ── */}
      {previewingVideo && (
        <div className="fixed inset-0 z-[220] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#0f0710] border border-white/20 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#180d19] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play size={16} weight="fill" className="text-[#c9542f]" />
                <span className="text-sm font-bold text-white truncate max-w-md">
                  {previewingVideo.title || 'Video Player Preview'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingVideo(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="w-full aspect-video bg-black relative">
              {previewingVideo.muxPlaybackId ? (
                <iframe
                  src={`https://player.mux.com/${previewingVideo.muxPlaybackId}?accentColor=C878BE&autoplay=1`}
                  title={previewingVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : previewingVideo.type === 'youtube' ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${previewingVideo.id}?autoplay=1`}
                  title={previewingVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={resolveImageUrl(previewingVideo.url)}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. COMMENTS PREVIEW / QUICK INFO DIALOG ── */}
      {commentsModalLesson && (
        <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140c15] border border-white/15 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <ChatCenteredDots size={20} className="text-[#ff8059]" />
                <h3 className="text-base font-bold text-white">
                  Lesson Discussion Comments
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCommentsModalLesson(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-white/70">
                Lesson: <strong className="text-white">{commentsModalLesson.title}</strong>
              </p>
              <div className="bg-[#1c121d] p-4 rounded-xl border border-white/5 text-xs text-white/60 space-y-2">
                <p>Student comments & Q&A discussions submitted for this video lesson are managed in real-time.</p>
                <p className="text-white/40 text-[11px]">You can reply to student doubts directly from the <strong>Comments</strong> panel in your admin sidebar.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCommentsModalLesson(null)}
                className="px-5 py-2 rounded-xl bg-[#c9542f] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
