import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  CalendarBlank, BookmarkSimple, Notebook, Play,
  VideoCamera, CheckCircle, Plus, LockKey, MagnifyingGlass,
  X, SignOut, User, Lock, CaretRight, ArrowsClockwise, ArrowLeft,
  CaretDown, CaretUp, Bell, ArrowRight, Trash, Clock, NotePencil,
  DotsThreeVertical
} from '@phosphor-icons/react';
import { cn } from '../../utils/cn';
import './my-journey.css';
import RescheduleModal from './components/RescheduleModal';
import UniversalVideoModal from '../../components/ui/UniversalVideoModal';
import TinyMCEEditor from '../../components/ui/TinyMCEEditor';
import { resolveImageUrl } from '../articles/ArticleReaderView';
import ProfileTab from './components/settings/ProfileTab';
import NotificationsTab from './components/settings/NotificationsTab';
import SecurityPrivacyTab from './components/settings/SecurityPrivacyTab';
import { getEffectiveUser, clearAllAuth, isAnyUserLoggedIn } from '../../utils/authSync';

export default function MyJourney() {
  const navigate = useNavigate();
  const location = useLocation();
  const avatarRef = useRef(null);

  // Helper to parse tab name from strings / URL / state
  const parseTabName = (raw) => {
    if (!raw) return null;
    const str = String(raw).toLowerCase().trim();
    if (str.includes('course')) return 'course';
    if (str.includes('lib')) return 'library';
    if (str.includes('note')) return 'notes';
    if (str.includes('profile') || str.includes('setting')) return 'profile';
    if (str.includes('coach') || str.includes('appoint')) return 'coaching';
    return null;
  };

  const getInitialTab = () => {
    try {
      // 1. Highest priority: URL search param (?tab=course, ?tab=appointments, etc.)
      const params = new URLSearchParams(window.location.search);
      const fromUrl = parseTabName(params.get('tab'));
      if (fromUrl) return fromUrl;

      // 2. Second priority: Router location.state
      const fromState = parseTabName(location.state?.activeTab);
      if (fromState) return fromState;
    } catch (e) {
      console.error(e);
    }
    // Default is always Appointments ('coaching')
    return 'coaching';
  };

  // Active Main Section Tab: 'coaching' | 'library' | 'notes' | 'course' | 'profile'
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [settingsSubTab, setSettingsSubTab] = useState('PROFILE');

  // Sync activeTab with URL search params and history state
  useEffect(() => {
    if (activeTab) {
      const tabParamMap = {
        coaching: 'appointments',
        library: 'library',
        notes: 'notes',
        course: 'course',
        profile: 'profile'
      };

      const tabParam = tabParamMap[activeTab] || activeTab;
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('tab', tabParam);

      // Overwrite history.state so stale location.state from past navigation won't hijack tab on refresh
      const currentState = window.history.state || {};
      const updatedUsr = { ...(currentState.usr || {}), activeTab: tabParam };
      window.history.replaceState({ ...currentState, usr: updatedUsr }, '', currentUrl.pathname + currentUrl.search);
    }
  }, [activeTab]);

  // Sync activeTab when URL search query changes (e.g. user clicks Profile in navbar)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromUrl = parseTabName(params.get('tab'));
    if (fromUrl && fromUrl !== activeTab) {
      setActiveTab(fromUrl);
    }
  }, [location.search]);

  // Handle external navigation state only if URL param was not already specified
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get('tab') && location.state?.activeTab) {
      const parsed = parseTabName(location.state.activeTab);
      if (parsed && parsed !== activeTab) {
        setActiveTab(parsed);
      }
    }
  }, [location.state]);

  // Search queries per tab
  const [searchQuery, setSearchQuery] = useState('');

  // Filters per tab
  const [coachFilter, setCoachFilter] = useState('upcoming'); // 'upcoming' | 'completed' | 'rescheduled' | 'canceled'
  const [appointmentSort, setAppointmentSort] = useState('soonest'); // 'soonest' | 'today' | 'newest_booked' | 'free'
  const [libraryFilter, setLibraryFilter] = useState('bookmarked'); // 'bookmarked' | 'completed'
  const [courseFilter, setCourseFilter] = useState('all'); // 'all' | 'enrolled'

  // User Profile & Free Session Credits (Instant zero-delay initialization from cache)
  const [user, setUser] = useState(() => getEffectiveUser());
  const [freeSessionsCount, setFreeSessionsCount] = useState(() => {
    const cachedUser = getEffectiveUser();
    const stored = localStorage.getItem('freeSessions');
    if (stored !== null && stored !== undefined && stored !== '') {
      return Math.max(0, Number(stored));
    }
    return cachedUser?.freeSessions !== undefined ? Math.max(0, Number(cachedUser.freeSessions)) : 0;
  });
  const [isCoursePurchaser, setIsCoursePurchaser] = useState(() => {
    const cachedUser = getEffectiveUser();
    const isPurchased = localStorage.getItem('isCoursePurchased') === 'true';
    const purchasedCourses = localStorage.getItem('purchasedCourses');
    return isPurchased || !!purchasedCourses || !!cachedUser?.courseSessionsGranted || (Array.isArray(cachedUser?.purchasedCourses) && cachedUser.purchasedCourses.length > 0);
  });
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [selectedCoursePreview, setSelectedCoursePreview] = useState(null);

  // Click outside to close avatar dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setAvatarMenuOpen(false);
      }
    };
    if (avatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [avatarMenuOpen]);

  // Data States
  const [appointments, setAppointments] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [completedArticles, setCompletedArticles] = useState([]);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionModalTab, setSessionModalTab] = useState('details'); // 'details' | 'notes'
  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [activeModalVideo, setActiveModalVideo] = useState(null);
  const [cancelModalAppt, setCancelModalAppt] = useState(null);
  const [isCancellingSession, setIsCancellingSession] = useState(false);
  const [openCardMenuId, setOpenCardMenuId] = useState(null);

  // Close card menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.mj-card-dots-wrap')) {
        setOpenCardMenuId(null);
      }
    };
    if (openCardMenuId) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [openCardMenuId]);

  // Note Modal States
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [isNoteReadOnly, setIsNoteReadOnly] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Toast State
  const [toastMsg, setToastMsg] = useState('');

  // Coach Note Read State
  const [readCoachNotes, setReadCoachNotes] = useState(() => {
    try {
      const stored = localStorage.getItem('bwa_read_coach_notes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const markCoachNoteAsRead = (apptId) => {
    if (!apptId) return;
    setReadCoachNotes(prev => {
      const idStr = String(apptId);
      if (prev.includes(idStr)) return prev;
      const updated = [...prev, idStr];
      try {
        localStorage.setItem('bwa_read_coach_notes', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save read notes', e);
      }
      return updated;
    });
  };

  // Lock background scroll and Lenis when any modal is active
  const isAnyModalOpen = Boolean(selectedSession || noteModalOpen || rescheduleSession || activeModalVideo || cancelModalAppt);

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      if (window.lenis) {
        window.lenis.stop();
      }
    } else {
      document.body.style.overflow = '';
      if (window.lenis) {
        window.lenis.start();
      }
    }

    return () => {
      document.body.style.overflow = '';
      if (window.lenis) {
        window.lenis.start();
      }
    };
  }, [isAnyModalOpen]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Cancel Appointment API Handler
  const handleConfirmCancelSession = async () => {
    if (!cancelModalAppt) return;
    setIsCancellingSession(true);
    const API_URL = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/appointments/${cancelModalAppt._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        setAppointments(prev => prev.map(a => 
          a._id === cancelModalAppt._id ? { ...a, status: 'CANCELLED' } : a
        ));
        showToast('Session cancelled.');
        setCancelModalAppt(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to cancel session.');
      }
    } catch (err) {
      console.error('Cancel session error:', err);
      alert('Error cancelling session. Please try again.');
    } finally {
      setIsCancellingSession(false);
    }
  };

  // Seamless scroll chaining from inner grid to page when boundary is reached
  const handleGridWheel = (e) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 2;
    const isAtTop = el.scrollTop <= 0;

    if ((isAtBottom && e.deltaY > 0) || (isAtTop && e.deltaY < 0)) {
      if (window.lenis) {
        window.lenis.scrollTo(window.scrollY + e.deltaY, { immediate: true });
      } else {
        window.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
    }
  };

  // Fetch User Info
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        const freeCount = data.freeSessions !== undefined ? Math.max(0, Number(data.freeSessions)) : 0;
        setFreeSessionsCount(freeCount);
        setIsCoursePurchaser(!!data.courseSessionsGranted);
        localStorage.setItem('userInfo', JSON.stringify(data));
        localStorage.setItem('freeSessions', String(freeCount));
        if (data.courseSessionsGranted) {
          localStorage.setItem('isCoursePurchased', 'true');
        }
      } else if (res.status === 401 || res.status === 403) {
        clearAllAuth();
        setUser(null);
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  // Fetch Appointments
  const fetchAppointments = async () => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  // Fetch Library
  const fetchLibrary = async () => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!token) return;

    try {
      const [savedArtRes, savedVidRes, compArtRes, compVidRes] = await Promise.all([
        fetch(`${API_URL}/api/users/saved-articles`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/users/saved-videos`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/users/completed-articles`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/users/completed-videos`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (savedArtRes.ok) setSavedArticles(await savedArtRes.json() || []);
      if (savedVidRes.ok) setSavedVideos(await savedVidRes.json() || []);
      if (compArtRes.ok) setCompletedArticles(await compArtRes.json() || []);
      if (compVidRes.ok) setCompletedVideos(await compVidRes.json() || []);
    } catch (err) {
      console.error('Failed to fetch library:', err);
    }
  };

  // Fetch Notes
  const fetchNotes = async () => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  useEffect(() => {
    if (!isAnyUserLoggedIn()) {
      clearAllAuth();
      setUser(null);
      navigate('/', { replace: true });
      return;
    }

    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchAppointments(),
        fetchLibrary(),
        fetchNotes()
      ]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Handle Note Save / Update
  const handleSaveNote = async () => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!token) return;

    const trimmedTitle = noteTitle.trim() || 'Untitled note';
    setIsSavingNote(true);

    try {
      if (editingNote && editingNote._id) {
        // Update existing note
        const res = await fetch(`${API_URL}/api/notes/${editingNote._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: trimmedTitle,
            body: noteBody,
            content: noteBody
          })
        });
        if (res.ok) {
          const updated = await res.json();
          setNotes(prev => prev.map(n => n._id === updated._id ? updated : n));
          showToast('Note updated');
        }
      } else {
        // Create new note
        const res = await fetch(`${API_URL}/api/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: trimmedTitle,
            body: noteBody,
            content: noteBody
          })
        });
        if (res.ok) {
          const created = await res.json();
          setNotes(prev => [created, ...prev]);
          showToast('Note saved');
        }
      }
      setNoteModalOpen(false);
      setEditingNote(null);
      setNoteTitle('');
      setNoteBody('');
    } catch (err) {
      console.error('Error saving note:', err);
      showToast('Failed to save note');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Handle Delete Note
  const handleDeleteNote = async (noteId, e) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!token || !noteId) return;

    try {
      const res = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n._id !== noteId));
        if (editingNote?._id === noteId) {
          setNoteModalOpen(false);
          setEditingNote(null);
        }
        showToast('Note deleted');
      } else {
        showToast('Failed to delete note');
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      showToast('Failed to delete note');
    }
  };

  const handleOpenNoteModal = (note = null, readonly = false) => {
    setEditingNote(note);
    setNoteTitle(note ? note.title : '');
    setNoteBody(note ? (note.content || note.body || '') : '');
    setIsNoteReadOnly(readonly);
    setNoteModalOpen(true);
  };

  // Handle Remove / Bookmark Toggle
  const handleRemoveArticle = async (articleId, e) => {
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!token) return;

    setSavedArticles(prev => prev.filter(a => a._id !== articleId));
    showToast('Removed from your library');

    try {
      await fetch(`${API_URL}/api/users/save-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ articleId })
      });
    } catch (err) {
      console.error('Error removing article:', err);
    }
  };

  // Helper to parse any date string safely
  const parseAnyDate = (dateStr) => {
    if (!dateStr) return null;
    const str = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
  };

  // Helper to format date cleanly for card header pill (e.g. "Fri, Oct 16, 2026")
  const formatPillDate = (dateStr) => {
    if (!dateStr) return '';
    const d = parseAnyDate(dateStr);
    if (d) {
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return String(dateStr)
      .replace('Monday', 'Mon')
      .replace('Tuesday', 'Tue')
      .replace('Wednesday', 'Wed')
      .replace('Thursday', 'Thu')
      .replace('Friday', 'Fri')
      .replace('Saturday', 'Sat')
      .replace('Sunday', 'Sun')
      .replace('January', 'Jan')
      .replace('February', 'Feb')
      .replace('March', 'Mar')
      .replace('April', 'Apr')
      .replace('June', 'Jun')
      .replace('July', 'Jul')
      .replace('August', 'Aug')
      .replace('September', 'Sep')
      .replace('October', 'Oct')
      .replace('November', 'Nov')
      .replace('December', 'Dec');
  };

  // Helper to format full date for modal (e.g. "Friday, October 16, 2026")
  const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    const d = parseAnyDate(dateStr);
    if (d) {
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return String(dateStr);
  };

  // Helper to format time cleanly (e.g. "04:30 PM")
  const formatSessionTime = (timeStr) => {
    if (!timeStr) return '';
    const str = String(timeStr).trim();
    if (/^\d{1,2}:\d{2}$/.test(str)) {
      const [h, m] = str.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const formattedHour = h % 12 || 12;
      return `${String(formattedHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
    }
    return str;
  };

  // Helper to get timestamp for appointment date/time sorting
  const getAppointmentTimestamp = (appt) => {
    if (!appt) return 0;
    if (appt.date) {
      const timeStr = appt.time || '12:00 PM';
      const parsed = new Date(`${appt.date} ${timeStr}`);
      if (!isNaN(parsed.getTime())) {
        return parsed.getTime();
      }
      const dOnly = new Date(appt.date);
      if (!isNaN(dOnly.getTime())) {
        return dOnly.getTime();
      }
    }
    if (appt.createdAt) {
      const c = new Date(appt.createdAt);
      if (!isNaN(c.getTime())) return c.getTime();
    }
    return 0;
  };

  // Helper to check if appointment date matches today
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const now = new Date();
    const todayFormats = [
      now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      now.toISOString().split('T')[0]
    ];
    const todayDay = now.getDate();
    const todayMonth = now.toLocaleString('en-US', { month: 'long' });
    const todayYear = now.getFullYear();

    if (todayFormats.some(f => dateStr.includes(f))) return true;
    if (dateStr.includes(String(todayDay)) && dateStr.includes(todayMonth) && dateStr.includes(String(todayYear))) return true;

    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
    } catch (e) {}

    return false;
  };

  // Helper to map article / video to its canonical category & color class matching Library
  const getArticleCategoryInfo = (item) => {
    if (!item) return { name: 'Relationships', slug: 'relationships', colorClass: 'mj-c-lilac' };
    
    const catStr = (
      (typeof item.category === 'string' ? item.category : item.category?.name) || 
      item.categoryName || 
      item.categoryId || 
      item.headingId || 
      ''
    ).toLowerCase();

    const titleStr = (item.title || item.heading || '').toLowerCase();

    if (catStr.includes('relat') || titleStr.includes('conflict') || titleStr.includes('relationship') || titleStr.includes('love') || titleStr.includes('partner') || titleStr.includes('marriage')) {
      return { name: 'Relationships', slug: 'relationships', colorClass: 'mj-c-lilac' };
    }
    if (catStr.includes('self') || titleStr.includes('self') || titleStr.includes('identity') || titleStr.includes('confidence') || titleStr.includes('worth') || titleStr.includes('inner')) {
      return { name: 'Self', slug: 'self', colorClass: 'mj-c-cream' };
    }
    if (catStr.includes('chang') || titleStr.includes('change') || titleStr.includes('transition') || titleStr.includes('pivot') || titleStr.includes('reinvent')) {
      return { name: 'Change', slug: 'change', colorClass: 'mj-c-mint' };
    }
    if (catStr.includes('decis') || titleStr.includes('decision') || titleStr.includes('choice') || titleStr.includes('crossroad')) {
      return { name: 'Decisions', slug: 'decisions', colorClass: 'mj-c-peach' };
    }
    if (catStr.includes('diff') || titleStr.includes('difficult') || titleStr.includes('toxic') || titleStr.includes('boundary') || titleStr.includes('critic')) {
      return { name: 'Difficult People', slug: 'difficult-people', colorClass: 'mj-c-sand' };
    }
    if (catStr.includes('commun') || titleStr.includes('speak') || titleStr.includes('convers') || titleStr.includes('listen') || titleStr.includes('express')) {
      return { name: 'Communication', slug: 'communication', colorClass: 'mj-c-sky' };
    }

    return { name: 'Relationships', slug: 'relationships', colorClass: 'mj-c-lilac' };
  };

  // Helper to get real reading percentage from localStorage / server for an article or video
  const getItemProgress = (item) => {
    if (!item) return 0;
    if (item.status === 'completed') return 100;
    
    const keys = [item._id, item.id, item.slug, item.articleId].filter(Boolean);
    for (const k of keys) {
      try {
        const stored = localStorage.getItem(`article_progress_${k}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.percentage === 'number') {
            return parsed.percentage;
          }
        }
      } catch (e) {
        // ignore parse error
      }
    }

    if (typeof item.progress === 'number' && item.progress > 0) {
      return item.progress;
    }

    return 0;
  };

  // 6 Luxury Library Theme Colors (Light Pastel versions matching the 6 Library categories)
  const SIX_LIBRARY_PASTEL_COLORS = [
    'mj-c-peach', // 04 Decisions (Light Coral/Peach)
    'mj-c-lilac', // 01 Relationships (Light Mauve/Lilac)
    'mj-c-mint',  // 03 Change (Light Sage/Mint practical green)
    'mj-c-sand',  // 05 Difficult People (Light Warm Sand/Amber)
    'mj-c-sky',   // 06 Communication (Light Slate/Sky Blue)
    'mj-c-cream'  // 02 Self (Light Warm Cream/Pearl)
  ];

  const getCardColor = (identifier, index = 0) => {
    if (typeof index === 'number' && index >= 0) {
      return SIX_LIBRARY_PASTEL_COLORS[index % SIX_LIBRARY_PASTEL_COLORS.length];
    }
    if (!identifier) return SIX_LIBRARY_PASTEL_COLORS[0];
    let hash = 0;
    const str = String(identifier);
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % SIX_LIBRARY_PASTEL_COLORS.length;
    return SIX_LIBRARY_PASTEL_COLORS[idx];
  };

  const inr = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

  // Free Sessions Calculations
  const totalCourseCredits = 3;
  const bookedOrUsedFreeCount = appointments.filter(
    a => (a.isFreeSession || a.orderId === 'COURSE_FREE_SESSION') && a.status !== 'CANCELLED'
  ).length;
  const availableCredits = Math.max(0, freeSessionsCount);
  const usedCredits = Math.min(totalCourseCredits, totalCourseCredits - availableCredits);

  // Build Free Session Credit Cards
  const freeSessionSlots = [
    { id: 1, title: 'Session 1' },
    { id: 2, title: 'Session 2' },
    { id: 3, title: 'Session 3' }
  ].map((slot, index) => {
    const freeAppts = appointments.filter(
      a => (a.isFreeSession || a.orderId === 'COURSE_FREE_SESSION') && a.status !== 'CANCELLED'
    );
    const linkedAppt = freeAppts[index];

    if (linkedAppt) {
      if (linkedAppt.status === 'COMPLETED') {
        return { ...slot, state: 'used', date: `Held on ${linkedAppt.date}`, appt: linkedAppt };
      }
      return { ...slot, state: 'booked', date: `${linkedAppt.date}, ${linkedAppt.time}`, appt: linkedAppt };
    }
    if (index < (totalCourseCredits - usedCredits)) {
      return { ...slot, state: 'available', date: '1-on-1 with Aarkesh · 60 min' };
    }
    return { ...slot, state: 'used', date: 'Session completed' };
  });

  // Helper to identify rescheduled appointments (pending or approved/completed reschedule)
  const isRescheduledSession = (a) => Boolean(
    a.status === 'RESCHEDULED' || 
    (a.rescheduleRequest && (
      a.rescheduleRequest.status === 'PENDING' || 
      a.rescheduleRequest.status === 'pending' || 
      a.rescheduleRequest.status === 'APPROVED' || 
      a.rescheduleRequest.status === 'approved' || 
      Boolean(a.rescheduleRequest.originalDate)
    ))
  );

  // Filter Appointments
  const q = searchQuery.toLowerCase().trim();
  const filteredAppointments = appointments
    .filter(a => {
      const matchesSearch = !q || 
        (a.name && a.name.toLowerCase().includes(q)) || 
        (a.date && a.date.toLowerCase().includes(q)) || 
        (a.time && a.time.toLowerCase().includes(q)) || 
        (a.reason && a.reason.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (coachFilter === 'upcoming') {
        if (!(a.status === 'UPCOMING' || !a.status)) return false;
      } else if (coachFilter === 'completed') {
        if (a.status !== 'COMPLETED') return false;
      } else if (coachFilter === 'rescheduled') {
        if (!isRescheduledSession(a)) return false;
      } else if (coachFilter === 'canceled') {
        if (!(a.status === 'CANCELLED' || a.status === 'CANCELED')) return false;
      }

      if (appointmentSort === 'free') {
        if (!(a.isFreeSession || a.orderId === 'COURSE_FREE_SESSION')) return false;
      } else if (appointmentSort === 'today') {
        if (!isToday(a.date)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (appointmentSort === 'soonest' || appointmentSort === 'today' || appointmentSort === 'free') {
        // Soonest upcoming session date first (e.g. Oct 9 -> Oct 12 -> Oct 14...)
        return getAppointmentTimestamp(a) - getAppointmentTimestamp(b);
      }
      if (appointmentSort === 'newest_booked') {
        // Most recently created booking first
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      return 0;
    });

  // Filter Library Items
  const libraryList = libraryFilter === 'bookmarked'
    ? [
        ...savedArticles.map(a => ({ ...a, itemType: 'article', status: 'bookmarked', color: 'peach' })),
        ...savedVideos.map(v => ({ ...v, itemType: 'video', status: 'bookmarked', color: 'sky' }))
      ]
    : [
        ...completedArticles.map(a => ({ ...a, itemType: 'article', status: 'completed', color: 'lilac' })),
        ...completedVideos.map(v => ({ ...v, itemType: 'video', status: 'completed', color: 'mint' }))
      ];

  const filteredLibrary = libraryList.filter(item => {
    if (!q) return true;
    const title = item.title || item.heading || '';
    const cat = item.category?.name || item.categoryName || '';
    return title.toLowerCase().includes(q) || cat.toLowerCase().includes(q);
  });

  // Filter Notes
  const filteredNotes = notes.filter(n => {
    if (!q) return true;
    return (n.title || '').toLowerCase().includes(q) || (n.body || '').toLowerCase().includes(q);
  });

  // Course Static & Live List
  // Single Hosted Course: The Better Man
  const coursesList = [
    {
      id: 'better-man',
      title: 'The Better Man',
      kind: isCoursePurchaser ? 'enrolled' : 'live',
      price: '₹15,000',
      old: '₹20,000',
      g: 'mj-g-purple',
      link: '/course/better-man'
    }
  ];

  const filteredCourses = coursesList.filter(c => {
    if (courseFilter === 'enrolled' && c.kind !== 'enrolled') return false;
    if (!q) return true;
    return c.title.toLowerCase().includes(q);
  });

  const showSidebar = activeTab !== 'notes' && activeTab !== 'profile';

  // Counts for Sidebar Badges
  const upcomingCount = appointments.filter(a => a.status === 'UPCOMING' || !a.status).length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const rescheduledCount = appointments.filter(isRescheduledSession).length;
  const canceledCount = appointments.filter(a => a.status === 'CANCELLED' || a.status === 'CANCELED').length;

  const savedCount = savedArticles.length + savedVideos.length;
  const finishedCount = completedArticles.length + completedVideos.length;

  // Search Placeholder
  const searchPlaceholder = 
    activeTab === 'coaching' ? 'Search appointments' :
    activeTab === 'library' ? 'Search your library' :
    activeTab === 'notes' ? 'Search your notes' : 'Search courses';

  return (
    <div className="mj-container">
      <div className="mj-shell">

        {/* ─── DARK TOP BAR ─── */}
        <header className="mj-top">
          <div className="mj-top-inner">
            <div className="mj-bar">
              <div className="flex items-center gap-3 sm:gap-4">
                <Link 
                  to="/" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#f5f1e8] text-xs font-semibold tracking-wide border border-white/15 transition-all cursor-pointer shadow-xs"
                  title="Back to Home"
                >
                  <ArrowLeft size={14} weight="bold" />
                  <span>Home</span>
                </Link>

                <Link to="/" className="mj-logo">
                  BetterWith<span>Aarkesh</span>
                </Link>
              </div>

            <div className="mj-actions">
              <button 
                onClick={() => navigate('/course')}
                className="mj-btn mj-btn-primary"
              >
                <Play size={14} weight="fill" />
                <span>COURSE</span>
              </button>

              {/* User Avatar (Round Icon Only) & Luxury Dropdown */}
              <div className="relative" ref={avatarRef}>
                <div 
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  className="w-[38px] h-[38px] rounded-full bg-[#c8512d] text-white flex items-center justify-center font-bold text-sm cursor-pointer shadow-md hover:opacity-90 active:scale-95 transition-all select-none overflow-hidden relative" 
                  title={user?.fullName || 'Your Profile'}
                >
                  {user?.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt="" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                      className="w-full h-full object-cover rounded-full absolute inset-0" 
                    />
                  ) : null}
                  <span>{(user?.fullName || 'Y').charAt(0).toUpperCase()}</span>
                </div>

                {avatarMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-[290px] bg-[#faf8f6] border border-[#e4dfd9] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden z-[200] text-[#1c1714] animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-6 pb-4 text-left">
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-[46px] h-[46px] rounded-full bg-[#c8512d] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm overflow-hidden relative border border-[#e4dfd9]">
                          {user?.photoUrl ? (
                            <img 
                              src={user.photoUrl} 
                              alt="" 
                              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                              className="w-full h-full object-cover rounded-full absolute inset-0" 
                            />
                          ) : null}
                          <span>{(user?.fullName || 'Y').charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[#c8512d] text-[10.5px] font-bold tracking-[0.18em] uppercase mb-0.5">
                            WELCOME BACK
                          </p>
                          <h3 
                            className="text-[22px] font-semibold text-[#1c1714] leading-tight capitalize truncate"
                            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                          >
                            {user?.fullName ? user.fullName.split(' ')[0] : 'User'}
                          </h3>
                        </div>
                      </div>

                      {/* Continue Journey Button */}
                      <button
                        onClick={() => {
                          setAvatarMenuOpen(false);
                          setActiveTab('coaching');
                        }}
                        className="w-full h-11 rounded-full bg-[#1c1714] hover:bg-black text-white font-bold text-[11px] tracking-[0.14em] uppercase flex items-center justify-center gap-3 transition-colors cursor-pointer"
                      >
                        <span>MY JOURNEY & PROFILE</span>
                        <span className="text-base leading-none">→</span>
                      </button>
                    </div>

                    {/* Bottom Logout Row */}
                    <div className="border-t border-[#e4dfd9] px-6 py-3 bg-[#faf8f6]">
                      <button 
                        onClick={() => {
                          setAvatarMenuOpen(false);
                          localStorage.clear();
                          window.dispatchEvent(new Event('auth-change'));
                          navigate('/');
                        }}
                        className="flex items-center gap-2.5 text-[#9a918a] hover:text-[#c8512d] text-[13.5px] font-medium transition-colors w-full text-left cursor-pointer"
                      >
                        <SignOut size={18} />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Welcome + Search + Free Credits Strip */}
          <div className="mj-strip">
            <div className="mj-hello">
              <h1>
                Welcome back{(user?.fullName || user?.name) ? `, ${(user.fullName || user.name).trim().split(' ')[0]}` : ''}.
              </h1>
              <p>Your saved reads, sessions and private notes, all in one place.</p>
            </div>

            <div className="flex-1"></div>

            <label className="mj-search">
              <MagnifyingGlass size={18} weight="bold" />
              <input 
                type="search" 
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </label>

            {/* Free Sessions Chip (Only for course students / users with credits) */}
            {(isCoursePurchaser || freeSessionsCount > 0) && (
              <div className="mj-credit">
                <div className="mj-dots">
                  {[0, 1, 2].map((idx) => (
                    <i key={idx} className={idx < (totalCourseCredits - usedCredits) ? '' : 'used'} />
                  ))}
                </div>
                <div>
                  <b>{usedCredits} of {totalCourseCredits} free sessions used</b>
                  <small>{availableCredits} {availableCredits === 1 ? 'session' : 'sessions'} left in your course</small>
                </div>
              </div>
            )}
          </div>
        </div>
        </header>

        {/* ─── SECTION TABS BAR ─── */}
        <div className="mj-tabbar">
          <div className="mj-tabbar-inner">
            {activeTab === 'profile' ? (
              <button
                onClick={() => {
                  setActiveTab('coaching');
                  setSearchQuery('');
                }}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#eee7df] hover:bg-[#e4dbd0] text-[#1c1714] text-[13.5px] font-semibold tracking-wide transition-all shadow-xs cursor-pointer group"
                title="Back to Dashboard"
              >
                <ArrowLeft size={16} weight="bold" className="text-[#c8512d] transition-transform group-hover:-translate-x-1" />
                <span>Back to Dashboard</span>
              </button>
            ) : (
              <nav className="mj-tabs" role="tablist">
                <button 
                  className={`mj-tab ${activeTab === 'coaching' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('coaching'); setSearchQuery(''); }}
                >
                  <CalendarBlank size={17} weight={activeTab === 'coaching' ? 'bold' : 'regular'} />
                  <span>Appointments</span>
                </button>

                <button 
                  className={`mj-tab ${activeTab === 'library' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('library'); setSearchQuery(''); }}
                >
                  <BookmarkSimple size={17} weight={activeTab === 'library' ? 'bold' : 'regular'} />
                  <span>My library</span>
                </button>

                <button 
                  className={`mj-tab ${activeTab === 'notes' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('notes'); setSearchQuery(''); }}
                >
                  <Notebook size={17} weight={activeTab === 'notes' ? 'bold' : 'regular'} />
                  <span>My notes</span>
                </button>

                <button 
                  className={`mj-tab ${activeTab === 'course' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('course'); setSearchQuery(''); }}
                >
                  <Play size={17} weight={activeTab === 'course' ? 'fill' : 'regular'} />
                  <span>Course</span>
                </button>
              </nav>
            )}

            {/* Right End of Tab Row: Profile & Settings Button (Black) & Book a Session Button (Orange) */}
            <div className="flex items-center gap-3">
              {/* Profile & Settings Button (Black) */}
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setSearchQuery('');
                }}
                className="mj-btn h-[42px] px-6 text-[14px] font-semibold transition-all select-none bg-[#1c1714] hover:bg-black text-white shadow-sm border-0 ring-0 outline-none"
                title="Profile & Settings"
              >
                <span>Profile & Settings</span>
              </button>

              {/* Book session Button (Orange) */}
              <button 
                onClick={() => navigate('/book')}
                className="mj-btn h-[42px] px-6 text-[14px] font-semibold bg-[#c8512d] hover:bg-[#b3461f] text-white shadow-sm transition-all border-0"
              >
                <CalendarBlank size={17} weight="bold" />
                <span>BOOK SESSION</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── MAIN BODY ─── */}
        <div className="mj-body-wrap">
          <div className={`mj-body ${!showSidebar ? 'fullwidth' : ''}`}>
          
          {/* Sidebar Filters (Hidden on Notes and unpurchased Courses) */}
          {showSidebar && (
            <aside className="mj-side">
              
              {/* Promo Card: Talk it through with Aarkesh */}
              <div className="mj-promo">
                <h3>Talk it through with Aarkesh</h3>
                {availableCredits > 0 ? (
                  <>
                    <p>You have {availableCredits} free 1-on-1 {availableCredits === 1 ? 'session' : 'sessions'} left with your course.</p>
                    <button 
                      onClick={() => navigate('/book')}
                      className="mj-btn bg-[#c8512d] hover:bg-[#b3461f] text-white shadow-sm border-0"
                    >
                      BOOK FREE SESSION
                    </button>
                  </>
                ) : (
                  <>
                    <p>Book a 1-on-1 coaching session to gain clarity, direction and personal breakthroughs.</p>
                    <button 
                      onClick={() => navigate('/book')}
                      className="mj-btn bg-[#c8512d] hover:bg-[#b3461f] text-white shadow-sm border-0"
                    >
                      BOOK SESSION
                    </button>
                  </>
                )}
              </div>

              {/* Dynamic Filter Group */}
              <div className="mj-filters">
                <h4>Filters</h4>
                <div className="mj-filters-inner">
                  
                  {activeTab === 'coaching' && (
                    <div className="mj-group">
                      <span>Show</span>
                      <label className="mj-opt radio">
                        <input 
                          type="radio" 
                          name="coachFilter" 
                          checked={coachFilter === 'upcoming'}
                          onChange={() => setCoachFilter('upcoming')}
                        />
                        <span className="mj-box"></span>
                        Upcoming
                        <em>{upcomingCount}</em>
                      </label>
                      <label className="mj-opt radio">
                        <input 
                          type="radio" 
                          name="coachFilter" 
                          checked={coachFilter === 'completed'}
                          onChange={() => setCoachFilter('completed')}
                        />
                        <span className="mj-box"></span>
                        Completed
                        <em>{completedCount}</em>
                      </label>
                      <label className="mj-opt radio">
                        <input 
                          type="radio" 
                          name="coachFilter" 
                          checked={coachFilter === 'rescheduled'}
                          onChange={() => setCoachFilter('rescheduled')}
                        />
                        <span className="mj-box"></span>
                        Rescheduled
                        <em>{rescheduledCount}</em>
                      </label>
                      <label className="mj-opt radio">
                        <input 
                          type="radio" 
                          name="coachFilter" 
                          checked={coachFilter === 'canceled'}
                          onChange={() => setCoachFilter('canceled')}
                        />
                        <span className="mj-box"></span>
                        Canceled
                        <em>{canceledCount}</em>
                      </label>
                    </div>
                  )}

                  {activeTab === 'library' && (
                    <div className="mj-group">
                      <span>Status</span>
                      <label className="mj-opt radio">
                        <input 
                          type="radio" 
                          name="libraryFilter" 
                          checked={libraryFilter === 'bookmarked'}
                          onChange={() => setLibraryFilter('bookmarked')}
                        />
                        <span className="mj-box"></span>
                        Saved
                        <em>{savedCount}</em>
                      </label>
                      <label className="mj-opt radio">
                        <input 
                          type="radio" 
                          name="libraryFilter" 
                          checked={libraryFilter === 'completed'}
                          onChange={() => setLibraryFilter('completed')}
                        />
                        <span className="mj-box"></span>
                        Completed
                        <em>{finishedCount}</em>
                      </label>
                    </div>
                  )}

                  {activeTab === 'course' && (
                    <div className="mj-group">
                      <span>Show</span>
                      <label className="mj-opt radio">
                        <input 
                          type="radio" 
                          name="courseFilter" 
                          checked={courseFilter === 'all'}
                          onChange={() => setCourseFilter('all')}
                        />
                        <span className="mj-box"></span>
                        All courses
                        <em>{coursesList.length}</em>
                      </label>
                      {isCoursePurchaser && (
                        <label className="mj-opt radio">
                          <input 
                            type="radio" 
                            name="courseFilter" 
                            checked={courseFilter === 'enrolled'}
                            onChange={() => setCourseFilter('enrolled')}
                          />
                          <span className="mj-box"></span>
                          My courses
                          <em>{coursesList.filter(c => c.kind === 'enrolled').length}</em>
                        </label>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </aside>
          )}

          {/* ─── MAIN CONTENT VIEW ─── */}
          <main>

            {/* 1. APPOINTMENTS VIEW */}
            {activeTab === 'coaching' && (
              <div>
                <div className="mj-head">
                  <div className="mj-head-left">
                    <h2>
                      {coachFilter === 'upcoming' ? 'Appointments' :
                       coachFilter === 'completed' ? 'Completed sessions' :
                       coachFilter === 'rescheduled' ? 'Rescheduled sessions' : 'Canceled sessions'}
                    </h2>
                    <span className="mj-count">{filteredAppointments.length}</span>
                  </div>

                  {/* Right-aligned Sort By Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#7a7269] hidden md:inline">Sort:</span>
                    <div className="flex items-center gap-1 p-1 bg-[#ede9e4] rounded-full border border-black/5 shadow-inner">
                      <button
                        onClick={() => setAppointmentSort('soonest')}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                          appointmentSort === 'soonest'
                            ? "bg-[#1c1714] text-white shadow-sm"
                            : "text-[#5f5750] hover:text-[#1c1714]"
                        )}
                        title="Jo appointment sabse jaldi aane wala hai"
                      >
                        Soonest date
                      </button>
                      <button
                        onClick={() => setAppointmentSort('today')}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                          appointmentSort === 'today'
                            ? "bg-[#1c1714] text-white shadow-sm"
                            : "text-[#5f5750] hover:text-[#1c1714]"
                        )}
                        title="Today's appointments"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => setAppointmentSort('newest_booked')}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                          appointmentSort === 'newest_booked'
                            ? "bg-[#1c1714] text-white shadow-sm"
                            : "text-[#5f5750] hover:text-[#1c1714]"
                        )}
                        title="Recently booked"
                      >
                        Recently booked
                      </button>
                      <button
                        onClick={() => setAppointmentSort('free')}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                          appointmentSort === 'free'
                            ? "bg-[#1c1714] text-white shadow-sm"
                            : "text-[#5f5750] hover:text-[#1c1714]"
                        )}
                        title="Free course sessions"
                      >
                        Free sessions
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mj-grid-scroll" onWheel={handleGridWheel} data-lenis-prevent="true">
                  <div className="mj-grid">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appt, idx) => {
                        const isFree = Boolean(appt.isFreeSession || appt.orderId === 'COURSE_FREE_SESSION');
                        const isPendingReschedule = Boolean(
                          appt.rescheduleRequest && 
                          (appt.rescheduleRequest.status === 'PENDING' || appt.rescheduleRequest.status === 'pending')
                        );
                        const isApprovedReschedule = Boolean(
                          appt.status === 'RESCHEDULED' || 
                          (appt.rescheduleRequest && (appt.rescheduleRequest.status === 'APPROVED' || appt.rescheduleRequest.status === 'approved'))
                        );

                        const cardColor = 
                          appt.status === 'CANCELLED' || appt.status === 'CANCELED' 
                            ? 'mj-c-rose' 
                            : isPendingReschedule
                              ? 'mj-c-sand'
                              : isApprovedReschedule
                                ? 'mj-c-sky'
                                : getCardColor(appt._id || appt.date, idx);

                        const statusTag = 
                          isPendingReschedule ? 'Reschedule Pending' :
                          isApprovedReschedule ? 'Rescheduled' :
                          appt.status === 'COMPLETED' ? 'Completed' :
                          appt.status === 'CANCELLED' || appt.status === 'CANCELED' ? 'Canceled' :
                          'Upcoming';

                        const hasCoachNotes = Boolean(appt.coachNotes || appt.notes);
                        const hasUnreadCoachNote = hasCoachNotes && !readCoachNotes.includes(String(appt._id));

                        return (
                          <article key={appt._id} className="mj-card">
                            <div className={`mj-card-top ${cardColor}`}>
                              <div className="mj-row items-center justify-between">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="mj-pill">{formatPillDate(appt.date)}</span>
                                  <span className="mj-pill">
                                    {isFree ? 'Free session' : `${inr(appt.amount || (appt.duration === 90 ? 7500 : 5000))} paid`}
                                  </span>
                                </div>

                                {/* 3-Dots Action Menu (Cancel Session) */}
                                {(appt.status === 'UPCOMING' || !appt.status) && (
                                  <div className="relative mj-card-dots-wrap shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenCardMenuId(openCardMenuId === appt._id ? null : appt._id);
                                      }}
                                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#555047] hover:text-[#111010] hover:bg-black/8 transition-all cursor-pointer"
                                      title="Session options"
                                    >
                                      <DotsThreeVertical size={20} weight="bold" />
                                    </button>

                                    {openCardMenuId === appt._id && (
                                      <div className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-xl border border-black/10 py-1 min-w-[155px] animate-in fade-in zoom-in-95 duration-150">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenCardMenuId(null);
                                            setCancelModalAppt(appt);
                                          }}
                                          className="w-full text-left px-3.5 py-2 text-[13px] font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                                        >
                                          <Trash size={15} weight="bold" />
                                          <span>Cancel session</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <h3>1-on-1 coaching with Aarkesh</h3>
                              <div className="mj-meta">
                                {formatSessionTime(appt.time)} • {appt.duration || 60} min • Google Meet
                              </div>
                              {appt.createdAt && (
                                <div className="text-[11.5px] text-[#7a7269] mt-0.5 font-medium">
                                  Booked on {formatPillDate(appt.createdAt)}
                                </div>
                              )}

                              {/* Pending Reschedule Alert on Card */}
                              {isPendingReschedule && (
                                <div className="mt-2 text-xs font-semibold text-[#856404] bg-[#fff3cd] px-2.5 py-1.5 rounded-xl border border-[#ffeeba] flex items-center gap-1.5 shadow-xs">
                                  <Clock size={14} weight="bold" className="shrink-0 text-[#856404]" />
                                  <span className="line-clamp-1">
                                    Requested: <b>{formatPillDate(appt.rescheduleRequest.date)} ({formatSessionTime(appt.rescheduleRequest.time)})</b>
                                  </span>
                                </div>
                              )}

                              {/* Approved Reschedule Notice on Card */}
                              {isApprovedReschedule && appt.rescheduleRequest?.originalDate && (
                                <div className="mt-2 text-xs font-medium text-[#1e598a] bg-[#dcedfb] px-2.5 py-1 rounded-lg border border-[#bfe0f9] flex items-center gap-1.5">
                                  <CheckCircle size={13} weight="bold" className="shrink-0 text-[#1e598a]" />
                                  <span className="line-clamp-1">
                                    Rescheduled from {formatPillDate(appt.rescheduleRequest.originalDate)}
                                  </span>
                                </div>
                              )}

                              {/* Coach Note Alert on Card (Visible only when unread) */}
                              {hasUnreadCoachNote && (
                                <div className="mt-2 text-xs font-semibold text-[#0c4a6e] bg-[#e0f2fe] px-2.5 py-1.5 rounded-xl border border-[#bae6fd] flex items-center justify-between gap-1.5 shadow-xs">
                                  <div className="flex items-center gap-1.5">
                                    <NotePencil size={14} weight="bold" className="shrink-0 text-[#0284c7]" />
                                    <span>New Coach Note added</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      markCoachNoteAsRead(appt._id);
                                      setSelectedSession(appt);
                                      setSessionModalTab('notes');
                                    }}
                                    className="text-[11.5px] font-bold text-[#0284c7] hover:text-[#0369a1] underline cursor-pointer shrink-0"
                                  >
                                    View note →
                                  </button>
                                </div>
                              )}

                              <div className="mj-tags mt-2">
                                <span className={cn(
                                  "mj-tag",
                                  isPendingReschedule && "!bg-[#ffe8a1] !text-[#664d03] font-bold",
                                  isApprovedReschedule && "!bg-[#bfe0f9] !text-[#0c4a6e] font-bold"
                                )}>
                                  {statusTag}
                                </span>
                                <span className="mj-tag">{isFree ? 'Course Perk' : 'Paid'}</span>
                                {hasCoachNotes && (
                                  hasUnreadCoachNote ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        markCoachNoteAsRead(appt._id);
                                        setSelectedSession(appt);
                                        setSessionModalTab('notes');
                                      }}
                                      className="mj-tag !bg-[#bae6fd] !text-[#0369a1] font-bold cursor-pointer hover:!bg-[#90cdf4] flex items-center gap-1 transition-all"
                                    >
                                      <NotePencil size={11} weight="bold" />
                                      New note
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedSession(appt);
                                        setSessionModalTab('notes');
                                      }}
                                      className="mj-tag !bg-[#f0ede8] !text-[#5c5449] font-medium cursor-pointer hover:!bg-[#e5e0d8] flex items-center gap-1 transition-all"
                                    >
                                      <NotePencil size={11} weight="bold" />
                                      Coach note
                                    </button>
                                  )
                                )}
                              </div>
                            </div>

                            <div className="mj-card-foot">
                              {/* Direct View Coach Note Button */}
                              {hasCoachNotes && (
                                <button 
                                  type="button"
                                  onClick={() => {
                                    markCoachNoteAsRead(appt._id);
                                    setSelectedSession(appt);
                                    setSessionModalTab('notes');
                                  }}
                                  className={cn(
                                    "mj-btn font-semibold shadow-xs flex items-center justify-center gap-1.5",
                                    hasUnreadCoachNote 
                                      ? "!bg-[#0284c7] hover:!bg-[#0369a1] !text-white border-0" 
                                      : "mj-btn-line text-[#332f2b]"
                                  )}
                                >
                                  <NotePencil size={16} weight="bold" />
                                  <span>View coach note</span>
                                </button>
                              )}

                              {/* Join Session button */}
                              {(appt.status === 'UPCOMING' || appt.status === 'RESCHEDULED' || !appt.status) && (
                                <a 
                                  href={appt.meetLink || 'https://meet.google.com'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mj-btn mj-btn-primary"
                                >
                                  <VideoCamera size={17} weight="bold" />
                                  <span>Join session</span>
                                </a>
                              )}

                              <button 
                                onClick={() => {
                                  setSelectedSession(appt);
                                  setSessionModalTab('details');
                                }}
                                className="mj-btn mj-btn-dark"
                              >
                                View session details
                              </button>

                              {(appt.status === 'UPCOMING' || appt.status === 'RESCHEDULED' || !appt.status) && (
                                isPendingReschedule ? (
                                  <button 
                                    disabled
                                    className="mj-btn mj-btn-line opacity-60 cursor-not-allowed text-xs font-semibold text-[#856404]"
                                    title="A reschedule request is already under review by your coach"
                                  >
                                    <Clock size={15} weight="bold" />
                                    <span>Reschedule Pending</span>
                                  </button>
                                ) : isApprovedReschedule ? (
                                  <button 
                                    disabled
                                    className="mj-btn mj-btn-line opacity-45 cursor-not-allowed text-xs font-semibold text-[#7a7269] bg-[#f0ede8] border-[#e0dbd3]"
                                    title="This session has already been rescheduled once and cannot be rescheduled again"
                                  >
                                    <span>Already Rescheduled</span>
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => setRescheduleSession(appt)}
                                    className="mj-btn mj-btn-line"
                                  >
                                    Reschedule
                                  </button>
                                )
                              )}

                              {appt.status !== 'UPCOMING' && appt.status !== 'RESCHEDULED' && appt.status !== 'COMPLETED' && (
                                <button 
                                  onClick={() => navigate('/book')}
                                  className="mj-btn mj-btn-line"
                                >
                                  Book again
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <div className="mj-empty">
                        <h3>
                          {appointmentSort === 'today' 
                            ? 'No sessions scheduled for today' 
                            : appointmentSort === 'free' 
                              ? 'No free sessions found' 
                              : `No ${coachFilter} sessions found`}
                        </h3>
                        <p>
                          {appointmentSort === 'today'
                            ? 'You do not have any appointments scheduled for today.'
                            : appointmentSort === 'free'
                              ? 'You have not booked any free perk sessions under this filter.'
                              : coachFilter === 'upcoming' 
                                ? "You don't have any upcoming sessions scheduled right now."
                                : `No ${coachFilter} sessions to show.`}
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-4">
                          {appointmentSort !== 'soonest' ? (
                            <button 
                              onClick={() => setAppointmentSort('soonest')}
                              className="mj-btn mj-btn-line"
                            >
                              Show all
                            </button>
                          ) : (
                            <button 
                              onClick={() => navigate('/book')}
                              className="mj-btn bg-[#c8512d] hover:bg-[#b3461f] text-white shadow-sm border-0"
                            >
                              BOOK SESSION
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. LIBRARY VIEW */}
            {activeTab === 'library' && (
              <div>
                <div className="mj-head">
                  <h2>{libraryFilter === 'completed' ? 'Completed' : 'Saved for you'}</h2>
                  <span className="mj-count">{filteredLibrary.length}</span>
                </div>
                <p className="mj-sub">Articles and videos you chose to return to.</p>

                <div className="mj-grid-scroll" onWheel={handleGridWheel} data-lenis-prevent="true">
                  <div className="mj-grid">
                    {filteredLibrary.length > 0 ? (
                      filteredLibrary.map((item, idx) => {
                        const isArticle = item.itemType === 'article' || Boolean(item.categoryId);
                        const title = item.title || item.heading || 'Article';
                        const catInfo = getArticleCategoryInfo(item);
                        const progress = getItemProgress(item);

                        return (
                          <article key={item._id || idx} className="mj-card">
                            <div className={`mj-card-top ${catInfo.colorClass}`}>
                              <div className="mj-row">
                                <span className="mj-pill">
                                  {item.status === 'completed' ? 'Completed' : 'Saved'}
                                </span>
                                <button 
                                  onClick={(e) => handleRemoveArticle(item._id, e)}
                                  className="mj-icon-btn on"
                                  title="Remove bookmark"
                                >
                                  <BookmarkSimple size={16} weight="fill" />
                                </button>
                              </div>
                              <div className="mj-meta font-medium tracking-wide">{catInfo.name}</div>
                              <h3>{title}</h3>
                              <div className="mj-tags">
                                <span className="mj-tag font-medium">{catInfo.name}</span>
                                <span className="mj-tag">{isArticle ? 'Article' : 'Video'}</span>
                                <span className="mj-tag">{item.readingTime || (isArticle ? 'Read' : 'Video')}</span>
                              </div>
                            </div>

                            <div className="mj-card-foot">
                              <div className="mj-prog">
                                <b>{item.status === 'completed' ? 'Completed' : `${progress}% read`}</b>
                                <div className="mj-bar-track">
                                  <i style={{ width: `${progress}%` }}></i>
                                </div>
                              </div>

                              <button 
                                onClick={() => {
                                  if (isArticle) {
                                    navigate(`/articles?category=${item.categoryId || ''}&subCategory=${item.headingId || ''}&article=${item._id}&from=my-journey`, { state: { from: 'my-journey' } });
                                  } else if (item.videoUrl) {
                                    setActiveModalVideo(item);
                                  }
                                }}
                                className="mj-btn mj-btn-dark !flex-initial"
                              >
                                {item.status === 'completed' ? 'Read again' : progress > 0 ? 'Continue' : 'Start'}
                              </button>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <div className="mj-empty">
                        <h3>{libraryFilter === 'completed' ? 'Nothing completed yet' : 'Nothing saved yet'}</h3>
                        <p>
                          {searchQuery 
                            ? 'No results for your search. Try a different word.'
                            : 'Bookmark an article or video in the library and it will show up here.'}
                        </p>
                        <Link to="/library" className="mj-btn mj-btn-dark">
                          Browse the library
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. NOTES VIEW */}
            {activeTab === 'notes' && (
              <div>
                <div className="mj-head">
                  <h2>My notes</h2>
                  <span className="mj-count">{filteredNotes.length}</span>

                  <div className="flex-1"></div>

                  <button 
                    onClick={() => handleOpenNoteModal(null, false)}
                    className="mj-btn mj-btn-primary"
                  >
                    <Plus size={17} weight="bold" />
                    <span>Create a note</span>
                  </button>
                </div>

                <p className="mj-sub">
                  <span className="mj-lock">
                    <LockKey size={16} weight="bold" className="text-[#c8512d]" />
                    Only visible to you
                  </span>
                </p>

                <div className="mj-grid-scroll" onWheel={handleGridWheel} data-lenis-prevent="true">
                  <div className="mj-grid">
                    {filteredNotes.length > 0 ? (
                      filteredNotes.map((note, idx) => {
                        const rawText = (note.content || note.body || '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/&nbsp;/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();

                        return (
                          <article key={note._id} className="mj-card mj-note group relative flex flex-col justify-between">
                            <div className={`mj-card-top ${getCardColor(note._id || note.title || idx, idx)}`}>
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="line-clamp-2">{note.title || 'Untitled note'}</h3>
                                <button
                                  onClick={(e) => handleDeleteNote(note._id, e)}
                                  className="p-1.5 -mr-1.5 -mt-1 rounded-full text-[#7a756b] hover:text-[#c8512d] hover:bg-black/5 transition-all shrink-0 cursor-pointer"
                                  title="Delete note"
                                >
                                  <Trash size={16} weight="bold" />
                                </button>
                              </div>
                              <div className="mj-meta">
                                {note.createdAt ? `Created ${new Date(note.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Private note'}
                              </div>
                              {rawText && (
                                <p className="text-xs text-[#5f5750] line-clamp-3 mt-1.5 leading-relaxed">
                                  {rawText}
                                </p>
                              )}
                            </div>

                            <div className="mj-note-actions flex items-center gap-2">
                              <button 
                                onClick={() => handleOpenNoteModal(note, true)}
                                className="mj-btn mj-btn-line flex-1"
                              >
                                Open
                              </button>
                              <button 
                                onClick={() => handleOpenNoteModal(note, false)}
                                className="mj-btn mj-btn-dark flex-1"
                              >
                                Edit
                              </button>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <div className="mj-empty">
                        <h3>{searchQuery ? 'No notes found' : 'No notes yet'}</h3>
                        <p>Write down what you want to remember. No one else can see it.</p>
                        <button 
                          onClick={() => handleOpenNoteModal(null, false)}
                          className="mj-btn mj-btn-dark"
                        >
                          Create a note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. COURSE VIEW */}
            {activeTab === 'course' && (
              <div>
                <div className="mj-head">
                  <h2>Courses</h2>
                  <span className="mj-count">{filteredCourses.length}</span>
                </div>
                <p className="mj-sub">Learn at your own pace, or join a live batch with Aarkesh.</p>

                <div className="mj-grid-scroll" onWheel={handleGridWheel} data-lenis-prevent="true">
                  <div className="mj-grid">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((c) => {
                        const isEnrolled = c.kind === 'enrolled';
                        return (
                          <article key={c.id} className="mj-course-card">
                            <div className={`mj-cthumb ${c.g}`}>
                              <b>{c.title}</b>
                              {c.kind !== 'recorded' && (
                                <span className={`mj-badge ${isEnrolled ? 'enrolled' : ''}`}>
                                  <i></i>
                                  {isEnrolled ? 'Enrolled' : 'Live'}
                                </span>
                              )}
                            </div>

                            <h3>{c.title}</h3>

                            {isEnrolled ? (
                              <div className="mj-price">
                                <span className="font-semibold text-white/80">You are enrolled</span>
                              </div>
                            ) : (
                              <div className="mj-price">
                                <span>Price</span>
                                <strong>{c.price}</strong>
                                <s>{c.old}</s>
                              </div>
                            )}

                            <button 
                              onClick={() => {
                                navigate('/course/better-man?from=my-journey', { state: { from: 'my-journey' } });
                              }}
                              className={`mj-cbtn ${isEnrolled ? 'solid' : ''}`}
                            >
                              {isEnrolled ? 'Continue course →' : 'Check Course →'}
                            </button>
                          </article>
                        );
                      })
                    ) : (
                      <div className="mj-empty">
                        <h3>No enrolled courses found</h3>
                        <p>You have not enrolled in this course yet. Check out the curriculum and enroll to get full access.</p>
                        <button
                          onClick={() => {
                            setCourseFilter('all');
                            navigate('/course/better-man');
                          }}
                          className="mj-btn bg-[#c8512d] hover:bg-[#b3461f] text-white shadow-sm border-0"
                        >
                          Explore Course
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. PROFILE & SETTINGS VIEW */}
            {activeTab === 'profile' && (
              <div className="w-full max-w-[700px] mx-auto py-2">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-3xl font-semibold text-[#1c1714] tracking-tight">Profile & Settings</h2>
                  <p className="text-sm text-[#5f5750] mt-1">Manage your details, preferences, and account security.</p>
                </div>

                {/* Subtabs for Settings */}
                <div className="flex items-center justify-center gap-2 p-1.5 bg-[#ede9e4] rounded-full w-fit mx-auto mb-8">
                  <button
                    onClick={() => setSettingsSubTab('PROFILE')}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer",
                      settingsSubTab === 'PROFILE'
                        ? "bg-[#1c1714] text-white shadow-sm"
                        : "text-[#5f5750] hover:text-[#1c1714]"
                    )}
                  >
                    <User size={15} />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => setSettingsSubTab('NOTIFICATIONS')}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer",
                      settingsSubTab === 'NOTIFICATIONS'
                        ? "bg-[#1c1714] text-white shadow-sm"
                        : "text-[#5f5750] hover:text-[#1c1714]"
                    )}
                  >
                    <Bell size={15} />
                    <span>Notifications</span>
                  </button>

                  <button
                    onClick={() => setSettingsSubTab('SECURITY')}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer",
                      settingsSubTab === 'SECURITY'
                        ? "bg-[#1c1714] text-white shadow-sm"
                        : "text-[#5f5750] hover:text-[#1c1714]"
                    )}
                  >
                    <LockKey size={15} />
                    <span>Security & Privacy</span>
                  </button>
                </div>

                {/* Subtab Panels */}
                {settingsSubTab === 'PROFILE' && (
                  <ProfileTab user={user} onProfileUpdate={(updated) => setUser(updated)} />
                )}
                {settingsSubTab === 'NOTIFICATIONS' && (
                  <NotificationsTab />
                )}
                {settingsSubTab === 'SECURITY' && (
                  <SecurityPrivacyTab />
                )}
              </div>
            )}

          </main>
        </div>
      </div>

    </div>

      {/* ─── SESSION DETAILS MODAL ─── */}
      {selectedSession && (
        <div className="mj-overlay" onClick={() => setSelectedSession(null)} data-lenis-prevent="true">
          <div className="mj-modal mj-modal-sess" onClick={(e) => e.stopPropagation()} data-lenis-prevent="true">
            <div className="mj-sess-head">
              <div>
                <h3>1-on-1 coaching with Aarkesh</h3>
                <div className="mj-meta">
                  {formatFullDate(selectedSession.date)} • {formatSessionTime(selectedSession.time)}
                </div>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="mj-icon-btn"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Mini Tabs */}
            <div className="mj-mini-tabs">
              <button 
                className={sessionModalTab === 'details' ? 'active' : ''}
                onClick={() => setSessionModalTab('details')}
              >
                Session details
              </button>
              <button 
                className={sessionModalTab === 'notes' ? 'active' : ''}
                onClick={() => {
                  setSessionModalTab('notes');
                  if (selectedSession?._id) markCoachNoteAsRead(selectedSession._id);
                }}
              >
                Coach notes
              </button>
            </div>

            <div className="mj-modal-body" data-lenis-prevent="true">
              {sessionModalTab === 'details' ? (
                <div>
                  {/* Reschedule Request Status Box in Modal */}
                  {selectedSession.rescheduleRequest && (selectedSession.rescheduleRequest.status === 'PENDING' || selectedSession.rescheduleRequest.status === 'pending') && (
                    <div className="p-3.5 rounded-2xl bg-[#fffbeb] border border-[#fef3c7] mb-3.5 text-xs text-[#92400e]">
                      <div className="font-bold text-sm mb-1 flex items-center gap-1.5 text-[#b45309]">
                        <Clock size={16} weight="bold" /> Reschedule Request Pending Coach Review
                      </div>
                      <p>You have requested to change this session to <strong>{formatFullDate(selectedSession.rescheduleRequest.date)} at {formatSessionTime(selectedSession.rescheduleRequest.time)}</strong>.</p>
                      {selectedSession.rescheduleRequest.reason && (
                        <p className="mt-1 italic text-[#78350f]">Reason: "{selectedSession.rescheduleRequest.reason}"</p>
                      )}
                      <p className="mt-1 text-[#78350f]/80">Aarkesh will review and confirm shortly. You will also receive an email notification.</p>
                    </div>
                  )}

                  {(selectedSession.status === 'RESCHEDULED' || selectedSession.rescheduleRequest?.status === 'APPROVED' || selectedSession.rescheduleRequest?.status === 'approved') && (
                    <div className="p-3.5 rounded-2xl bg-[#ecfdf5] border border-[#d1fae5] mb-3.5 text-xs text-[#065f46]">
                      <div className="font-bold text-sm mb-1 flex items-center gap-1.5 text-[#047857]">
                        <CheckCircle size={16} weight="bold" /> Rescheduled Successfully
                      </div>
                      <p>This session is confirmed for <strong>{formatFullDate(selectedSession.date)} at {formatSessionTime(selectedSession.time)}</strong>.</p>
                      {selectedSession.rescheduleRequest?.originalDate && (
                        <p className="mt-1 text-[#047857]/80">Original slot: {formatFullDate(selectedSession.rescheduleRequest.originalDate)} at {formatSessionTime(selectedSession.rescheduleRequest.originalTime)}</p>
                      )}
                    </div>
                  )}

                  {selectedSession.rescheduleRequest?.status === 'REJECTED' && (
                    <div className="p-3.5 rounded-2xl bg-[#fef2f2] border border-[#fee2e2] mb-3.5 text-xs text-[#991b1b]">
                      <div className="font-bold text-sm mb-1 flex items-center gap-1.5 text-[#b91c1c]">
                        <X size={16} weight="bold" /> Reschedule Request Declined
                      </div>
                      <p>Your previous reschedule request was declined. Your current session remains active for <strong>{formatFullDate(selectedSession.date)} at {formatSessionTime(selectedSession.time)}</strong>.</p>
                    </div>
                  )}

                  {/* Top Action Buttons (Join, Reschedule, Cancel) */}
                  {(selectedSession.status === 'UPCOMING' || !selectedSession.status) && (
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <a 
                        href={selectedSession.meetLink || 'https://meet.google.com'}
                        target="_blank"
                        rel="noreferrer"
                        className="mj-btn mj-btn-primary flex items-center gap-2 flex-1 sm:flex-none justify-center"
                      >
                        <VideoCamera size={16} weight="bold" />
                        <span>Join session</span>
                      </a>

                      {(selectedSession.rescheduleRequest && (selectedSession.rescheduleRequest.status === 'PENDING' || selectedSession.rescheduleRequest.status === 'pending')) ? (
                        <button 
                          disabled
                          className="mj-btn mj-btn-line opacity-60 cursor-not-allowed text-xs font-semibold text-[#856404]"
                        >
                          Reschedule Pending
                        </button>
                      ) : (selectedSession.status === 'RESCHEDULED' || selectedSession.rescheduleRequest?.status === 'APPROVED' || selectedSession.rescheduleRequest?.status === 'approved' || selectedSession.rescheduleRequest?.originalDate) ? (
                        <button 
                          disabled
                          className="mj-btn mj-btn-line opacity-45 cursor-not-allowed text-xs font-semibold text-[#7a7269] bg-[#f0ede8] border-[#e0dbd3]"
                          title="This session has already been rescheduled once and cannot be rescheduled again"
                        >
                          Already Rescheduled
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            const apptToReschedule = selectedSession;
                            setSelectedSession(null);
                            setRescheduleSession(apptToReschedule);
                          }}
                          className="mj-btn mj-btn-dark"
                        >
                          Reschedule
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          const apptToCancel = selectedSession;
                          setSelectedSession(null);
                          setCancelModalAppt(apptToCancel);
                        }}
                        className="mj-btn border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold flex items-center gap-1.5"
                      >
                        <Trash size={15} weight="bold" />
                        <span>Cancel session</span>
                      </button>
                    </div>
                  )}

                  <div className="mj-rows">
                    <div>
                      <span>Date</span>
                      <b>{formatFullDate(selectedSession.date)}</b>
                    </div>
                    <div>
                      <span>Time</span>
                      <b>{formatSessionTime(selectedSession.time)}</b>
                    </div>
                    <div>
                      <span>Duration</span>
                      <b>{selectedSession.duration || 60} min</b>
                    </div>
                    <div>
                      <span>Mode</span>
                      <b>Google Meet</b>
                    </div>
                    <div>
                      <span>Coach</span>
                      <b>Aarkesh</b>
                    </div>
                    <div>
                      <span>Booking ID</span>
                      <b className="font-mono tracking-wide">
                        {selectedSession.bookingId || `BWA-${(selectedSession._id || 'BK').toString().slice(-8).toUpperCase()}`}
                      </b>
                    </div>
                    {selectedSession.createdAt && (
                      <div>
                        <span>Booked On</span>
                        <b>{formatFullDate(selectedSession.createdAt)}</b>
                      </div>
                    )}
                    {selectedSession.isFreeSession || selectedSession.orderId === 'COURSE_FREE_SESSION' ? (
                      <>
                        <div>
                          <span>Transaction ID</span>
                          <b>N/A (Complimentary Session)</b>
                        </div>
                        <div>
                          <span>Payment</span>
                          <b>Course Free Perk (100% Off)</b>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span>Transaction ID</span>
                          <b className="font-mono">
                            {selectedSession.paymentId || selectedSession.transactionId || (selectedSession.orderId ? `pay_${selectedSession.orderId.replace('order_', '')}` : `pay_${(selectedSession._id || '').slice(-14)}`)}
                          </b>
                        </div>
                        <div>
                          <span>Payment</span>
                          <b>{selectedSession.paymentMethod || 'Paid Online (UPI / Razorpay)'}</b>
                        </div>
                      </>
                    )}
                    {selectedSession.meetLink && (
                      <div>
                        <span>Meeting Link</span>
                        <a 
                          href={selectedSession.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#c8512d] font-bold underline"
                        >
                          Join Google Meet
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Fee breakdown */}
                  <div className="mj-fee">
                    <h4>Fee</h4>
                    <div>
                      <span>Session fee</span>
                      <b>{inr(selectedSession.amount || (selectedSession.duration === 90 ? 7500 : 5000))}</b>
                    </div>
                    {selectedSession.isFreeSession && (
                      <div className="minus">
                        <span>Course credit (Complimentary)</span>
                        <b>− {inr(selectedSession.amount || (selectedSession.duration === 90 ? 7500 : 5000))}</b>
                      </div>
                    )}
                    <div className="total">
                      <span>You paid</span>
                      <b>{inr(selectedSession.isFreeSession ? 0 : (selectedSession.amount || (selectedSession.duration === 90 ? 7500 : 5000)))}</b>
                    </div>
                  </div>

                  <div className="mj-sess-foot">
                    <button 
                      onClick={() => setSelectedSession(null)}
                      className="mj-btn mj-btn-line"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {selectedSession.coachNotes ? (
                    <div className="mj-coach-note">
                      <div className="mj-who">
                        <div className="mj-avatar">A</div>
                        <div>
                          <b>Shared by Aarkesh</b>
                          <small>{selectedSession.coachNotes.date || selectedSession.date}</small>
                        </div>
                      </div>
                      <p>{selectedSession.coachNotes.summary || selectedSession.coachNotes}</p>
                      {selectedSession.coachNotes.points && (
                        <>
                          <h5>What to do before we meet again</h5>
                          <ul>
                            {selectedSession.coachNotes.points.map((pt, i) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mj-empty" style={{ padding: '32px 16px' }}>
                      <h3>No notes shared yet</h3>
                      <p>
                        {selectedSession.status === 'COMPLETED'
                          ? 'Your coach has not added notes for this session yet.'
                          : 'Notes are shared by Aarkesh after a session is completed.'}
                      </p>
                    </div>
                  )}
                  <div className="mj-sess-foot">
                    <button 
                      onClick={() => setSelectedSession(null)}
                      className="mj-btn mj-btn-line"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {/* ─── CREATE / EDIT / VIEW NOTE MODAL ─── */}
      {noteModalOpen && (
        <div className="mj-overlay" onClick={() => setNoteModalOpen(false)} data-lenis-prevent="true">
          <div 
            className="mj-modal !max-w-[760px] w-full max-h-[90vh] flex flex-col overflow-hidden" 
            onClick={(e) => e.stopPropagation()} 
            data-lenis-prevent="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#e4dfd9] shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="font-serif text-2xl font-bold text-[#1c1714]">
                  {editingNote ? (isNoteReadOnly ? 'Your note' : 'Edit note') : 'New note'}
                </h3>
                <div className="mj-lock flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f6ebe1] text-[#c8512d] text-xs font-semibold">
                  <LockKey size={13} weight="bold" />
                  <span>Only visible to you</span>
                </div>
              </div>
              <button 
                onClick={() => setNoteModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#5f5750] hover:text-[#1c1714] hover:bg-black/5 transition-all cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto flex-1 py-4 flex flex-col gap-4 pr-1">
              {isNoteReadOnly ? (
                <div className="flex flex-col gap-3">
                  <h2 className="font-serif text-2xl font-bold text-[#1c1714] leading-tight">
                    {noteTitle || 'Untitled note'}
                  </h2>
                  {editingNote?.createdAt && (
                    <span className="text-xs text-[#9a918a]">
                      Created {new Date(editingNote.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                  <div 
                    className="prose prose-stone max-w-none text-[#2b2420] text-sm sm:text-base leading-relaxed mt-2 pt-3 border-t border-[#e4dfd9]"
                    dangerouslySetInnerHTML={{ __html: noteBody || '<p className="text-[#9a918a] italic">No content in this note.</p>' }}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#5f5750] uppercase tracking-wider mb-1.5">
                      Note Title
                    </label>
                    <input 
                      type="text" 
                      className="mj-field !bg-white focus:!bg-white"
                      placeholder="Title"
                      maxLength={120}
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-xs font-bold text-[#5f5750] uppercase tracking-wider mb-1">
                      Content & Thoughts
                    </label>
                    <TinyMCEEditor 
                      value={noteBody}
                      onChange={setNoteBody}
                      minHeight={320}
                      placeholder="Write your private thoughts, reflections and takeaways here..."
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-3.5 border-t border-[#e4dfd9] shrink-0 gap-3">
              {editingNote?._id ? (
                <button 
                  onClick={(e) => handleDeleteNote(editingNote._id, e)}
                  className="mj-btn text-[#c8512d] hover:bg-red-50 hover:text-red-700 font-semibold px-4 !border-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash size={16} weight="bold" />
                  <span>Delete note</span>
                </button>
              ) : <div></div>}

              <div className="flex items-center gap-2">
                {isNoteReadOnly ? (
                  <>
                    <button 
                      onClick={() => setIsNoteReadOnly(false)}
                      className="mj-btn bg-[#1c1714] hover:bg-black text-white"
                    >
                      Edit note
                    </button>
                    <button 
                      onClick={() => setNoteModalOpen(false)}
                      className="mj-btn mj-btn-line"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setNoteModalOpen(false)}
                      className="mj-btn mj-btn-line"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveNote}
                      disabled={isSavingNote}
                      className="mj-btn bg-[#c8512d] hover:bg-[#b3461f] text-white shadow-sm"
                    >
                      {isSavingNote ? 'Saving...' : 'Save note'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CANCEL SESSION CONFIRMATION MODAL ─── */}
      {cancelModalAppt && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-black/10 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => !isCancellingSession && setCancelModalAppt(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#7a7269] hover:text-[#111010] hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash size={24} weight="bold" />
            </div>

            <h3 className="font-serif text-2xl font-normal text-[#111010] mb-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Cancel Session?
            </h3>
            <p className="text-[14px] text-[#555047] leading-relaxed mb-6">
              Are you sure you want to cancel your session on <strong className="text-[#111010] font-semibold">{formatPillDate(cancelModalAppt.date)}</strong> at <strong className="text-[#111010] font-semibold">{formatSessionTime(cancelModalAppt.time)}</strong>?
              {Boolean(cancelModalAppt.isFreeSession || cancelModalAppt.orderId === 'COURSE_FREE_SESSION') && (
                <span className="block mt-2.5 text-[#b45309] font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200/70 text-xs">
                  ⚠️ Note: Free course session credits once booked are counted as used and will not be restored upon cancellation.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalAppt(null)}
                disabled={isCancellingSession}
                className="px-4 py-2.5 rounded-xl font-sans text-sm font-semibold text-[#555047] hover:bg-black/5 transition-colors cursor-pointer"
              >
                Keep Session
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelSession}
                disabled={isCancellingSession}
                className="px-5 py-2.5 rounded-xl font-sans text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                {isCancellingSession ? 'Cancelling...' : 'Yes, Cancel Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESCHEDULE MODAL ─── */}
      {rescheduleSession && (
        <RescheduleModal
          isOpen={!!rescheduleSession}
          onClose={() => setRescheduleSession(null)}
          session={rescheduleSession}
          onSuccess={() => {
            setRescheduleSession(null);
            fetchAppointments();
            showToast('Session rescheduled successfully');
          }}
        />
      )}

      {/* ─── UNIVERSAL VIDEO MODAL ─── */}
      {activeModalVideo && (
        <UniversalVideoModal 
          video={activeModalVideo}
          onClose={() => setActiveModalVideo(null)}
        />
      )}

      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMsg && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-20 bg-[#1c1714] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-2xl z-[1200] animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}

    </div>
  );
}
