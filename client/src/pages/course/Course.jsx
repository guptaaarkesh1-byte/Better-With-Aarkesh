import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import PolicyModal from '../../components/ui/PolicyModal';
import { clearAllAuth, syncLoginData, isAnyUserLoggedIn } from '../../utils/authSync';
import { COUNTRY_CODES } from '../../utils/countryCodes';
import { 
  Play, 
  CheckCircle, 
  LockKey, 
  CaretDown, 
  Clock, 
  X, 
  User, 
  Eye, 
  EyeSlash, 
  SignOut, 
  ArrowLeft, 
  ArrowRight, 
  Envelope, 
  Phone, 
  CaretLeft, 
  Sparkle,
  BookOpen,
  Books,
  Users,
  Infinity,
  UsersThree,
  ShieldCheck,
  Lightning,
  PencilSimple,
  NotePencil,
  Info,
  FileText,
  ChatCenteredDots,
  Brain,
  Star,
  InstagramLogo,
  LinkedinLogo,
  XLogo,
  YoutubeLogo,
  FacebookLogo,
  SpotifyLogo,
  DiscordLogo,
  TiktokLogo,
  Globe,
  Quotes,
  CornersOut,
  VideoCamera,
  CalendarPlus,
  List,
  Pause,
  ArrowCounterClockwise,
  ArrowClockwise,
  SpeakerHigh,
  SpeakerSlash
} from '@phosphor-icons/react';
import Button from '../../components/ui/Button';
import LessonComments from '../../components/course/LessonComments';
import MuxPlayer from '@mux/mux-player-react';
import ProtectedYouTubePlayer from '../../components/course/ProtectedYouTubePlayer';
import CoursePaymentSuccess from './CoursePaymentSuccess';
import FlippingWordSwap from '../../components/ui/FlippingWordSwap';
import { resolvePlayableVideoId } from '../../utils/videoSecurity';
import { API_URL } from '../../utils/apiUrl';
import './course-landing.css';

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const apiUrl = API_URL;
  if (url.startsWith('/')) {
    return `${apiUrl}${url}`;
  }
  return `${apiUrl}/${url}`;
};

// Helper to render headlines with asterisk boxed text: "THE *BETTER* MAN" -> THE <span className="sel">BETTER</span> MAN
export const renderCourseHeadline = (text) => {
  if (!text) return null;
  const parts = text.split(/\*([^*]+)\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <span key={index} className="sel">
          {part}
        </span>
      );
    }
    return part;
  });
};

const renderSocialIcon = (platform, size = 16) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return <InstagramLogo size={size} />;
    case 'youtube': return <YoutubeLogo size={size} />;
    case 'x': case 'twitter': return <XLogo size={size} />;
    case 'linkedin': return <LinkedinLogo size={size} />;
    case 'facebook': return <FacebookLogo size={size} />;
    case 'spotify': return <SpotifyLogo size={size} />;
    case 'discord': return <DiscordLogo size={size} />;
    case 'tiktok': return <TiktokLogo size={size} />;
    default: return <Globe size={size} />;
  }
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

// Default 8-module masterclass curriculum fallback
const MODULES = [
  {
    id: 1,
    title: 'Module 01: The Foundation of Presence',
    duration: '12:30',
    progress: 0,
    lessons: [
      { id: 'l1', title: 'Lesson 1: The Foundation of Presence', duration: '12:30', isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 2,
    title: 'Module 02: Breaking the Reactive Cycle',
    duration: '12:30',
    progress: 0,
    lessons: [
      { id: 'l2', title: 'Lesson 1: Breaking the Reactive Cycle', duration: '12:30', isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 3,
    title: 'Module 03: Mastering Vocal Gravitas & Tone',
    duration: '12:30',
    progress: 0,
    lessons: [
      { id: 'l3', title: 'Lesson 1: Mastering Vocal Gravitas & Tone', duration: '12:30', isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 4,
    title: 'Module 04: Non-Verbal Dominance & Spatial Calibration',
    duration: '12:30',
    progress: 0,
    lessons: [
      { id: 'l4', title: 'Lesson 1: Non-Verbal Dominance & Spatial Calibration', duration: '12:30', isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 5,
    title: 'Module 05: High-Stakes Conversations & Holding Frame',
    duration: '12:30',
    progress: 0,
    lessons: [
      { id: 'l5', title: 'Lesson 1: High-Stakes Conversations & Holding Frame', duration: '12:30', isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 6,
    title: 'Module 06: Decision Making & Decisive Action',
    duration: '12:30',
    progress: 0,
    lessons: [
      { id: 'l6', title: 'Lesson 1: Decision Making & Decisive Action', duration: '12:30', isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 7,
    title: 'Module 07: Conflict Resolution Without Compromise',
    duration: '12:30',
    progress: 0,
    lessons: [
      { id: 'l7', title: 'Lesson 1: Conflict Resolution Without Compromise', duration: '12:30', isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 8,
    title: 'Module 08: Integration & Lifetime Standard',
    duration: '12:30',
    progress: 0,
    lessons: [
      { id: 'l8', title: 'Lesson 1: Integration & Lifetime Standard', duration: '12:30', isCompleted: false, isLocked: false }
    ]
  }
];

export default function Course() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const location = useLocation();
  const isAllCoursesPage = slug === 'all' || location.pathname === '/courses' || location.pathname === '/courses/all';
  const isDetailPage = Boolean(slug) && slug !== 'all';

  const getCardThemeClass = (c, index) => {
    const t = (c?.theme || c?.cardTheme || c?.heroSection?.cardTheme || '').toLowerCase().trim();
    if (t === 'white' || t === 'whi' || t === 'clean white') return 'card-theme-white';
    if (t === 'purple' || t === 'roy' || t === 'royal' || t === 'royal purple') return 'card-theme-purple';
    if (t === 'black' || t === 'obs' || t === 'obsidian' || t === 'obsidian black') return 'card-theme-black';
    return 'card-theme-purple';
  };

  const getBannerCls = (c) => {
    const t = (c?.theme || c?.cardTheme || c?.heroSection?.cardTheme || '').toLowerCase().trim();
    if (t === 'white' || t === 'whi' || t === 'clean white') return '';
    if (t === 'purple' || t === 'roy' || t === 'royal' || t === 'royal purple') return 'v2';
    if (t === 'black' || t === 'obs' || t === 'obsidian' || t === 'obsidian black') return 'v3';
    return c?.cls || 'v2';
  };
  const [showPricingModal, setShowPricingModal] = useState(false);
  const getPurchasedSlugs = () => {
    try {
      const u = JSON.parse(localStorage.getItem('courseUser') || '{}');
      if (Array.isArray(u.purchasedCourses) && u.purchasedCourses.length > 0) return u.purchasedCourses;
    } catch {}
    return localStorage.getItem('isCoursePurchased') === 'true' ? ['better-man'] : [];
  };
  const [purchasedCourses, setPurchasedCourses] = useState(getPurchasedSlugs);

  const [showDashboard, setShowDashboard] = useState(() => {
    const isPurchasedStored = localStorage.getItem('isCoursePurchased') === 'true';
    const hasToken = !!localStorage.getItem('courseToken');
    const params = new URLSearchParams(window.location.search);
    const isCheckout = params.get('checkout') === 'true' || sessionStorage.getItem('course_checkout_active') === 'true';
    const isLearn = params.get('learn') === 'true';
    return isLearn && hasToken && isPurchasedStored && !isCheckout;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('courseToken'));
  const [isPurchased, setIsPurchased] = useState(() => localStorage.getItem('isCoursePurchased') === 'true');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCheckout, setShowCheckout] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const hasToken = !!localStorage.getItem('courseToken');
    const isPurchasedStored = localStorage.getItem('isCoursePurchased') === 'true';
    const isCheckoutStored = sessionStorage.getItem('course_checkout_active') === 'true';
    return (params.get('checkout') === 'true' || isCheckoutStored) && hasToken && !isPurchasedStored;
  });
  const [checkoutAgreed, setCheckoutAgreed] = useState(false);
  const [showPreRegSuccessModal, setShowPreRegSuccessModal] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [isPlayingInlineTrailer, setIsPlayingInlineTrailer] = useState(false);
  const profileMenuRef = useRef(null);
  const leftColumnRef = useRef(null);

  const [freeSessionsRemaining, setFreeSessionsRemaining] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('courseUser') || '{}');
      if (u.freeSessions !== undefined) return Number(u.freeSessions);
      const fs = localStorage.getItem('freeSessions');
      if (fs !== null && !isNaN(Number(fs))) return Number(fs);
    } catch {}
    return 3;
  });

  // Sync user profile on mount & focus to get accurate purchasedCourses and freeSessions remaining
  const syncProfile = useCallback(async () => {
    const token = localStorage.getItem('courseToken');
    if (!token) return;
    try {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/course-auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('courseUser', JSON.stringify(data));
        if (data.isPurchased) {
          localStorage.setItem('isCoursePurchased', 'true');
          setIsPurchased(true);
        }
        if (Array.isArray(data.purchasedCourses)) {
          setPurchasedCourses(data.purchasedCourses);
        }
        if (data.freeSessions !== undefined) {
          const count = Math.max(0, Number(data.freeSessions));
          setFreeSessionsRemaining(count);
          localStorage.setItem('freeSessions', String(count));
        }
      }
    } catch (e) {
      console.warn('Error syncing profile:', e);
    }
  }, []);

  useEffect(() => {
    syncProfile();
    const handleFocus = () => syncProfile();
    const handleAuthEvent = () => {
      const hasAuth = isAnyUserLoggedIn();
      const isPurchasedStored = localStorage.getItem('isCoursePurchased') === 'true';
      setIsLoggedIn(hasAuth);
      setIsPurchased(isPurchasedStored);
      if (!hasAuth) {
        setShowDashboard(false);
        setShowCheckout(false);
        setShowProfileMenu(false);
      } else {
        syncProfile();
      }
    };
    const handleStorage = (e) => {
      if (e.key === 'freeSessions' || e.key === 'courseUser' || e.key === 'token' || e.key === 'courseToken') {
        handleAuthEvent();
      }
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('auth-change', handleAuthEvent);
    window.addEventListener('course-auth-change', handleAuthEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('auth-change', handleAuthEvent);
      window.removeEventListener('course-auth-change', handleAuthEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncProfile]);

  // Auth Modal State
  const [showCourseLogin, setShowCourseLogin] = useState(false);
  const [loginMode, setLoginMode] = useState('login');

  // Auth Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // OTP & Forgot Password State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isForgotOtpStep, setIsForgotOtpStep] = useState(false);

  const otpRef0 = useRef(null);
  const otpRef1 = useRef(null);
  const otpRef2 = useRef(null);
  const otpRef3 = useRef(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3];

  const navigate = useNavigate();

  const handleExitToMainHome = useCallback((e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setShowDashboard(false);
    setShowCheckout(false);
    setShowCourseLogin(false);
    try {
      sessionStorage.removeItem('course_checkout_active');
    } catch {}
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [navigate]);

  const handleExitToCourseHome = useCallback((e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setShowDashboard(false);
    setShowCheckout(false);
    setShowCourseLogin(false);
    try {
      sessionStorage.removeItem('course_checkout_active');
      window.history.replaceState(null, '', '/course');
    } catch {}
    navigate('/course', { replace: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [navigate]);

  const handleExitToAllCourses = useCallback((e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setShowDashboard(false);
    setShowCheckout(false);
    setShowCourseLogin(false);
    try {
      sessionStorage.removeItem('course_checkout_active');
      window.history.replaceState(null, '', '/course/all');
    } catch {}
    navigate('/course/all', { replace: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [navigate]);

  const handleExitToFaq = useCallback((e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setShowDashboard(false);
    setShowCheckout(false);
    setShowCourseLogin(false);
    try {
      sessionStorage.removeItem('course_checkout_active');
      window.history.replaceState(null, '', '/course');
    } catch {}
    navigate('/course', { replace: true });
    setTimeout(() => {
      const el = document.getElementById('faq');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  }, [navigate]);
  const getUserCourseKey = (suffix) => {
    try {
      const u = JSON.parse(localStorage.getItem('courseUser') || localStorage.getItem('userInfo') || '{}');
      const id = u.email ? u.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_') : (u._id || 'guest');
      return `bwa_u_${id}_${suffix}`;
    } catch {
      return `bwa_u_guest_${suffix}`;
    }
  };

  const [curriculumModules, setCurriculumModules] = useState(() => {
    try {
      const cached = sessionStorage.getItem('bwa_curriculum_cache_' + (slug || 'better-man'));
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [activeModuleObj, setActiveModuleObj] = useState(() => {
    try {
      const cached = sessionStorage.getItem('bwa_curriculum_cache_' + (slug || 'better-man'));
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch {}
    return null;
  });
  const [activeLesson, setActiveLesson] = useState(() => {
    try {
      const cached = sessionStorage.getItem('bwa_curriculum_cache_' + (slug || 'better-man'));
      if (cached) {
        const parsed = JSON.parse(cached);
        const lastId = localStorage.getItem(getUserCourseKey('lastActiveCourseLessonId'));
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (lastId) {
            for (const mod of parsed) {
              const found = (mod.lessons || []).find(l => (l._id || l.id)?.toString() === lastId.toString());
              if (found) return found;
            }
          }
          if (parsed[0]?.lessons?.length > 0) return parsed[0].lessons[0];
        }
      }
    } catch {}
    return null;
  });
  const [activeModule, setActiveModule] = useState(null);
  const [courseDocuments, setCourseDocuments] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [activePolicySlug, setActivePolicySlug] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState('playlist'); // 'playlist' | 'overview' | 'resources' | 'comments'
  const [landscapeView, setLandscapeView] = useState('list'); // 'list' | 'player'
  const [purchaseSuccessData, setPurchaseSuccessData] = useState(null);
  
  // Clean Player State
  const [playerTab, setPlayerTab] = useState('overview'); // 'overview' | 'discussion' | 'notes'
  const [openPlayerModules, setOpenPlayerModules] = useState(() => [0, 1, 2, 3, 4, 5, 6, 7]);
  const [lessonNotes, setLessonNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bwa_lesson_notes_v2') || '{}');
    } catch {
      return {};
    }
  });
  const [notesSavedStatus, setNotesSavedStatus] = useState('Saved ✓');
  const notesSaveTimeoutRef = useRef(null);
  const notesTextareaRef = useRef(null);

  // Video Resume & Progress Tracking
  const muxPlayerRef = useRef(null);
  const [resumePrompt, setResumePrompt] = useState(null);

  useEffect(() => {
    const lesId = activeLesson?._id || activeLesson?.id;
    if (!lesId) {
      setResumePrompt(null);
      return;
    }
    const saved = Number(localStorage.getItem(getUserCourseKey(`lesson_progress_${lesId}`))) || 0;
    if (saved > 6) {
      const mins = Math.floor(saved / 60);
      const secs = Math.floor(saved % 60);
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      setResumePrompt({ time: saved, formatted });
    } else {
      setResumePrompt(null);
    }
  }, [activeLesson?._id, activeLesson?.id]);

  const handleResumeClick = () => {
    if (resumePrompt && muxPlayerRef.current) {
      try {
        muxPlayerRef.current.currentTime = resumePrompt.time;
        muxPlayerRef.current.play?.();
      } catch {}
    }
    setResumePrompt(null);
  };

  const handleStartOverClick = () => {
    if (muxPlayerRef.current) {
      try {
        muxPlayerRef.current.currentTime = 0;
        muxPlayerRef.current.play?.();
      } catch {}
    }
    const lesId = activeLesson?._id || activeLesson?.id;
    if (lesId) {
      localStorage.removeItem(getUserCourseKey(`lesson_progress_${lesId}`));
    }
    setResumePrompt(null);
  };

  const handleNotesChange = (lessonId, text) => {
    setNotesSavedStatus('Saving…');
    setLessonNotes((prev) => {
      const updated = { ...prev, [lessonId]: text };
      if (notesSaveTimeoutRef.current) clearTimeout(notesSaveTimeoutRef.current);
      notesSaveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem('bwa_lesson_notes_v2', JSON.stringify(updated));
        } catch {}
        setNotesSavedStatus('Saved ✓');
      }, 500);
      return updated;
    });
  };

  const handleInsertTimestamp = (lessonId) => {
    const ta = notesTextareaRef.current;
    if (!ta) return;
    const durStr = activeLesson?.duration || '00:00';
    const s = ta.selectionStart || 0;
    const e = ta.selectionEnd || 0;
    const ts = `[${durStr}] `;
    const curVal = lessonNotes[lessonId] || '';
    const newVal = curVal.slice(0, s) + ts + curVal.slice(e);
    handleNotesChange(lessonId, newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + ts.length, s + ts.length);
    }, 50);
  };

  const togglePlayerModule = (modIdx) => {
    setOpenPlayerModules((prev) => 
      prev.includes(modIdx) ? prev.filter((i) => i !== modIdx) : [...prev, modIdx]
    );
  };

  const toggleLessonCompletionLocal = (lesson) => {
    if (!lesson) return;
    const targetId = (lesson._id || lesson.id)?.toString();
    const isNowCompleted = !lesson.isCompleted;
    const updatedLesson = { ...lesson, isCompleted: isNowCompleted };
    setActiveLesson(updatedLesson);

    setCurriculumModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        lessons: (mod.lessons || []).map((l) =>
          ((l._id || l.id)?.toString() === targetId)
            ? { ...l, isCompleted: isNowCompleted }
            : l
        )
      }))
    );

    try {
      const completedIds = JSON.parse(localStorage.getItem('bwa_completed_lessons_cache') || '[]');
      const nextCompleted = isNowCompleted
        ? [...new Set([...completedIds, targetId])]
        : completedIds.filter(id => id !== targetId);
      localStorage.setItem('bwa_completed_lessons_cache', JSON.stringify(nextCompleted));
      const targetSlug = slug && slug !== 'all' ? slug : 'better-man';
      localStorage.setItem(`course_completed_lessons_${targetSlug}`, JSON.stringify(nextCompleted));
      localStorage.setItem('course_completed_lessons', JSON.stringify(nextCompleted));
    } catch {}

    // Persist to backend progress API
    try {
      const token = localStorage.getItem('courseToken');
      if (token) {
        const targetCourseId = activeCourse?._id || activeCourse?.slug || (slug && slug !== 'all' ? slug : 'better-man');
        fetch(`${API_URL}/api/courses/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            courseId: targetCourseId,
            lessonId: targetId,
            isCompleted: isNowCompleted
          })
        }).catch(() => {});
      }
    } catch {}

    showToast(isNowCompleted ? 'Lesson marked as completed ✓' : 'Marked as incomplete');
  };

  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [demoSpeed, setDemoSpeed] = useState(1);
  const [demoMuted, setDemoMuted] = useState(false);

  const lessonSeconds = useMemo(() => {
    if (!activeLesson?.duration) return 750;
    const parts = String(activeLesson.duration).split(':');
    if (parts.length === 2) return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
    if (parts.length === 3) return (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
    return 750;
  }, [activeLesson?.duration]);

  const formatSeconds = (sec) => {
    sec = Math.floor(sec || 0);
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!demoPlaying) return;
    const interval = setInterval(() => {
      setDemoProgress((prev) => {
        if (prev >= lessonSeconds) {
          setDemoPlaying(false);
          if (!activeLesson?.isCompleted) {
            toggleLessonCompletionLocal(activeLesson);
          }
          return lessonSeconds;
        }
        return Math.min(lessonSeconds, prev + 1 * demoSpeed);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [demoPlaying, lessonSeconds, demoSpeed, activeLesson]);

  useEffect(() => {
    setDemoPlaying(false);
    setDemoProgress(0);
  }, [activeLesson?._id, activeLesson?.id]);

  const [curriculumCards, setCurriculumCards] = useState([
    { title: 'The Foundation of Presence', description: 'Discover how to anchor yourself in any high-pressure situation with calm, unshakeable energy.' },
    { title: 'Breaking Reactive Patterns', description: 'Identify and dissolve the emotional triggers that cause you to react instead of respond.' },
    { title: 'Magnetic Communication', description: 'Develop a voice and language that people naturally lean toward and remember.' },
    { title: 'Non-Verbal Mastery', description: 'Harness the 93% of communication that happens without words — posture, eye contact, space.' },
    { title: 'Leadership from Within', description: 'Stop performing authority and start embodying it — people will follow without being asked.' },
    { title: 'Emotional Sovereignty', description: 'Condition your nervous system to stay laser-focused, composed, and mentally sharp under extreme stress.' },
    { title: 'Executive Gravitas & Charisma', description: 'Command high-stakes rooms and social dynamics with effortless poise, vocal resonance, and respect.' },
    { title: 'The Ripple Effect', description: 'Turn your internal transformation into lasting impact on every relationship and environment.' },
  ]);
  const [courseFaqs, setCourseFaqs] = useState([
    { question: 'How long do I have access to the course materials?', answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.' },
    { question: 'How do the 3 free coaching sessions work?', answer: 'Once enrolled, you can book your private 1-on-1 sessions directly with Aarkesh through your course profile dashboard.' },
    { question: 'What format is the course delivered in?', answer: 'High-definition on-demand video masterclasses with actionable workbooks, downloadable frameworks, and direct 1-on-1 coaching.' },
    { question: 'Is this course beginner-friendly?', answer: 'Absolutely. The framework starts from the fundamental psychology of presence and builds step-by-step toward advanced leadership and magnetism.' },
  ]);

  const [courseDetailsMap, setCourseDetailsMap] = useState(() => {
    try {
      const cached = localStorage.getItem('bwa_course_details_map_cache');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [landingSettings, setLandingSettings] = useState(() => {
    const defaultSettings = {
      hero: {
        tag: 'Learn. Practise. Lead.',
        tagSize: 14,
        heading: 'THE *BETTER* MAN',
        headingPrefix: 'THE',
        headingSelected: 'BETTER',
        headingSuffix: 'MAN',
        headingSize: 56,
        subheading: 'Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh.',
        subheadingSize: 18,
        proof1Bold: '3 private',
        proof1Text: '1-on-1 sessions with Aarkesh',
        proof2Bold: 'Lifetime',
        proof2Text: 'access, no recurring charges',
        proofSize: 13,
        primaryBtnText: 'Register Now',
        showPrimaryBtn: true,
        secondaryBtnText: 'Check Course',
        secondaryBtnLink: '/course/better-man',
        showSecondaryBtn: true,
        navBtnText: 'Check Course',
        navBtnLink: '/course/better-man',
        showNavBtn: true,
        buttonSize: 14,
        bgImageUrl: '',
        overlayOpacity: 40
      },
      moreCourses: {
        eyebrowText: 'MORE MASTERCLASSES',
        eyebrowSize: 14,
        heading: 'More Masterclasses',
        headingSize: 44,
        subheading: 'Each one is a standalone course with its own private sessions.',
        subheadingSize: 16,
        viewAllBtnText: 'View All Masterclasses',
        showViewAllBtn: true,
        buttonSize: 14,
      },
      allCoursesPage: {
        tag: 'ALL PROGRAMS',
        tagSize: 14,
        heading: 'All Masterclasses & Programs',
        headingSize: 48,
        subheading: 'Each masterclass is an intensive, transformative curriculum paired with private 1-on-1 mentorship sessions with Aarkesh.',
        subheadingSize: 16,
        backBtnText: '← Back to overview',
        buttonSize: 14,
      },
      faq: {
        tag: 'FAQS',
        tagSize: 14,
        heading: 'Frequently Asked Questions From Our Students',
        headingSize: 40,
        subheading: 'Clear answers about the masterclass, private mentorship, and enrollment.',
        subheadingSize: 16,
        questionSize: 17,
        answerSize: 15,
        items: [
          { question: 'How long do I have access to the course materials?', answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.' },
          { question: 'How do the 3 private 1-on-1 sessions work?', answer: 'Immediately after enrollment, you gain access to Aarkesh\'s private booking calendar. You can schedule each 1-on-1 session at dates and times that suit your schedule.' },
          { question: 'Is this course suitable for professionals and introverts?', answer: 'Yes. The curriculum is specifically designed for professionals, entrepreneurs, and introverts who want to develop natural, calm authority without acting loud or fake.' },
          { question: 'Is there a certificate provided upon completion?', answer: 'Yes. Upon completing all modules and your private sessions, you will receive an official Certificate of Completion signed by Aarkesh.' }
        ]
      },
      cta: {
        label: 'ENROLL TODAY',
        labelSize: 14,
        heading: 'Ready To Become The Man People Trust?',
        headingSize: 48,
        description: 'Master the psychology of calm authority, magnetic communication and effortless self-command with lifetime curriculum access and 3 private 1-on-1 coaching sessions.',
        descriptionSize: 17,
        badge1: '3 Private Coaching Calls',
        badge2: 'Lifetime Video Access',
        badgeSize: 13,
        primaryBtnText: 'Register Now',
        exploreBtnText: 'Explore Courses',
        buttonSize: 15,
        bgImageUrl: ''
      }
    };

    try {
      const cached = localStorage.getItem('bwa_course_landing_settings_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...defaultSettings,
          ...parsed,
          hero: { ...defaultSettings.hero, ...(parsed?.hero || {}) },
          moreCourses: { ...defaultSettings.moreCourses, ...(parsed?.moreCourses || {}) },
          allCoursesPage: { ...defaultSettings.allCoursesPage, ...(parsed?.allCoursesPage || {}) },
          faq: { ...defaultSettings.faq, ...(parsed?.faq || {}) },
          cta: { ...defaultSettings.cta, ...(parsed?.cta || {}) },
        };
      }
    } catch {}
    return defaultSettings;
  });

  const allLessons = curriculumModules.flatMap((m) => (m.lessons || []).map((l) => ({ ...l, module: m })));
  const currentLessonIndex = allLessons.findIndex(
    (l) => (l._id || l.id)?.toString() === (activeLesson?._id || activeLesson?.id)?.toString()
  );
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const handleSelectLesson = (lesson, module) => {
    setActiveLesson(lesson);
    if (module) setActiveModuleObj(module);
    localStorage.setItem('lastActiveCourseLessonId', (lesson._id || lesson.id)?.toString());
  };

  const isComingSoon = Boolean(courseData?.isComingSoon);
  const basePrice = courseData?.price !== undefined && courseData?.price !== null ? Number(courseData.price) : 15000;
  const comparePrice = courseData?.comparePrice !== undefined && courseData?.comparePrice !== null ? Number(courseData.comparePrice) : 25000;
  const gstRate = courseData?.gstRate !== undefined && courseData?.gstRate !== null ? Number(courseData.gstRate) : 18;
  const isGstIncluded = Boolean(courseData?.isGstIncluded);

  useEffect(() => {
    const isLearn = searchParams.get('learn') === 'true';
    if (isLearn && isLoggedIn && isPurchased) {
      setShowDashboard(true);
    } else if (!isLearn) {
      setShowDashboard(false);
    }
  }, [searchParams, isLoggedIn, isPurchased]);

  useEffect(() => {
    setShowCourseLogin(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchPublishedCurriculum = async () => {
      try {
        const apiUrl = API_URL;
        const token = localStorage.getItem('courseToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const targetSlug = slug && slug !== 'all' ? slug : 'better-man';
        const res = await fetch(`${apiUrl}/api/courses/curriculum/${targetSlug}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.course) {
            setCourseData(data.course);
          }
          if (data && data.modules && data.modules.length > 0) {
            let completedIds = [];
            try {
              completedIds = JSON.parse(localStorage.getItem('bwa_completed_lessons_cache') || '[]');
            } catch {}

            const mergedModules = data.modules.map(m => ({
              ...m,
              lessons: (m.lessons || []).map(l => {
                const lId = (l._id || l.id)?.toString();
                const isDone = Boolean(l.isCompleted || completedIds.includes(lId));
                return { ...l, isCompleted: isDone };
              })
            }));

            setCurriculumModules(mergedModules);
            setOpenPlayerModules(data.modules.map((_, i) => i));
            try {
              sessionStorage.setItem('bwa_curriculum_cache_' + targetSlug, JSON.stringify(mergedModules));
            } catch {}

            const allValidLessonIds = new Set(mergedModules.flatMap(m => (m.lessons || []).map(l => (l._id || l.id)?.toString())));
            const currentActiveId = (activeLesson?._id || activeLesson?.id)?.toString();
            const isCurrentActiveValid = currentActiveId && allValidLessonIds.has(currentActiveId);

            const savedLessonId = localStorage.getItem('lastActiveCourseLessonId');
            let matchedLesson = null;
            let matchedModule = null;

            if (savedLessonId && allValidLessonIds.has(savedLessonId.toString())) {
              for (const mod of mergedModules) {
                const found = (mod.lessons || []).find(
                  (l) => (l._id || l.id)?.toString() === savedLessonId.toString()
                );
                if (found) {
                  matchedLesson = found;
                  matchedModule = mod;
                  break;
                }
              }
            }

            if (matchedLesson && matchedModule) {
              setActiveModuleObj(matchedModule);
              setActiveLesson(matchedLesson);
            } else if (!isCurrentActiveValid) {
              // Automatically activate the first real lesson with video!
              setActiveModuleObj(mergedModules[0]);
              if (mergedModules[0]?.lessons?.length > 0) {
                const firstRealLesson = mergedModules[0].lessons[0];
                setActiveLesson(firstRealLesson);
                localStorage.setItem('lastActiveCourseLessonId', (firstRealLesson._id || firstRealLesson.id)?.toString());
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic curriculum:', err);
      }
    };

    fetchPublishedCurriculum();
    window.addEventListener('focus', fetchPublishedCurriculum);
    const interval = setInterval(fetchPublishedCurriculum, 4000);

    return () => {
      window.removeEventListener('focus', fetchPublishedCurriculum);
      clearInterval(interval);
    };
  }, [isPurchased, slug]);

  // Reset scroll to top whenever active lesson or dashboard changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (leftColumnRef.current) {
      leftColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeLesson?._id, activeLesson?.id, showDashboard]);

  // Keyboard shortcuts for clean player
  useEffect(() => {
    if (!showDashboard) return;
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === 'n' && nextLesson) {
        handleSelectLesson(nextLesson, nextLesson.module);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (key === 'p' && prevLesson) {
        handleSelectLesson(prevLesson, prevLesson.module);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (key === 'm' && activeLesson) {
        toggleLessonCompletionLocal(activeLesson);
      } else if (key === 'f') {
        const stage = document.querySelector('.player-stage');
        if (stage) {
          if (document.fullscreenElement) {
            document.exitFullscreen?.();
          } else {
            stage.requestFullscreen?.();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDashboard, nextLesson, prevLesson, activeLesson]);

  useEffect(() => {
    const fetchCourseFooter = async () => {
      try {
        const apiUrl = API_URL;
        const res = await fetch(`${apiUrl}/api/footer-documents/published?category=course`);
        if (res.ok) {
          const data = await res.json();
          setCourseDocuments(data);
        }
      } catch (err) {
        console.error('Failed to fetch course footer documents:', err);
      }
    };

    const fetchSocialLinks = async () => {
      try {
        const apiUrl = API_URL;
        const res = await fetch(`${apiUrl}/api/social-links`);
        if (res.ok) {
          const data = await res.json();
          setSocialLinks(data);
        }
      } catch (err) {
        console.error('Failed to fetch social links:', err);
      }
    };

    const fetchCurriculumCards = async () => {
      try {
        const apiUrl = API_URL;
        const res = await fetch(`${apiUrl}/api/courses/cards/public`);
        if (res.ok) {
          const cardsData = await res.json();
          if (Array.isArray(cardsData) && cardsData.length > 0) {
            setCurriculumCards(cardsData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch curriculum cards:', err);
      }
    };

    const fetchCourseFaqs = async () => {
      try {
        const apiUrl = API_URL;
        const res = await fetch(`${apiUrl}/api/courses/faqs/public`);
        if (res.ok) {
          const faqsData = await res.json();
          if (Array.isArray(faqsData) && faqsData.length > 0) {
            setCourseFaqs(faqsData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch course FAQs:', err);
      }
    };

    const fetchLandingSettings = async () => {
      try {
        const apiUrl = API_URL;
        const res = await fetch(`${apiUrl}/api/courses/landing-settings`);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            setLandingSettings((prev) => {
              const updated = {
                ...prev,
                ...data,
                hero: { ...(prev?.hero || {}), ...(data?.hero || {}) },
                moreCourses: { ...(prev?.moreCourses || {}), ...(data?.moreCourses || {}) },
                allCoursesPage: { ...(prev?.allCoursesPage || {}), ...(data?.allCoursesPage || {}) },
                faq: { ...(prev?.faq || {}), ...(data?.faq || {}) },
                cta: { ...(prev?.cta || {}), ...(data?.cta || {}) },
              };
              try {
                localStorage.setItem('bwa_course_landing_settings_cache', JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch course landing settings:', err);
      }
    };

    const fetchCourseDetailsMap = async () => {
      try {
        const apiUrl = API_URL;
        const res = await fetch(`${apiUrl}/api/courses/details-settings`);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            setCourseDetailsMap(data);
            try {
              localStorage.setItem('bwa_course_details_map_cache', JSON.stringify(data));
            } catch {}
          }
        }
      } catch (err) {
        console.error('Failed to fetch course details map:', err);
      }
    };

    fetchLandingSettings();
    fetchCourseDetailsMap();
    window.addEventListener('focus', fetchLandingSettings);
    window.addEventListener('focus', fetchCourseDetailsMap);

    const handleStorage = (e) => {
      if (e.key === 'bwa_landing_settings_updated' || e.key === 'bwa_course_details_updated') {
        fetchLandingSettings();
        fetchCourseDetailsMap();
      }
    };
    window.addEventListener('storage', handleStorage);

    let bc;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('bwa_course_landing_channel');
        bc.onmessage = () => {
          fetchLandingSettings();
          fetchCourseDetailsMap();
        };
      }
    } catch (e) {}

    const interval = setInterval(() => {
      fetchLandingSettings();
      fetchCourseDetailsMap();
    }, 3000);

    fetchCourseFooter();
    fetchSocialLinks();
    fetchCurriculumCards();
    fetchCourseFaqs();

    return () => {
      window.removeEventListener('focus', fetchLandingSettings);
      window.removeEventListener('focus', fetchCourseDetailsMap);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [location.pathname]);



  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [activeToc, setActiveToc] = useState('p1');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  const [isGstApplied, setIsGstApplied] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const coursesList = useMemo(() => {
    const defaultList = [
      {
        slug: "better-man",
        n: "01",
        theme: "roy",
        chips: ["Calm Authority", "Self-Command"],
        soon: false,
        cls: "v3",
        title: "The Better Man",
        lede: "Master the psychology of calm authority, magnetic communication and effortless self-command.",
        d: "Calm authority, magnetic communication and self-command, taught in eight modules with three private sessions.",
        sidebarChips: [
          ["Schedule", "Self-Paced"],
          ["Certificate", "Yes"],
          ["Language", "Hinglish / English"],
          ["Mentorship", "1-on-1 Live"]
        ],
        hl: [
          ["Build Real Presence", "(Not Just Theory)"],
          ["5 Private Sessions", "with Aarkesh"]
        ],
        inside: [
          "8 HD video modules & frameworks",
          "Downloadable workbooks and mental models",
          "5 private 1-on-1 coaching sessions with Aarkesh",
          "Lifetime access with all future updates"
        ],
        facts: [["8", "Modules"], ["5 Free", "1-on-1 Sessions"]],
        price: `₹${basePrice.toLocaleString('en-IN')}`,
        was: `₹${comparePrice.toLocaleString('en-IN')}`,
        cta: "Check Course",
        syllabusTitle: "Eight Modules To Total Self-Command",
        syllabusSubtitle: "A comprehensive, step-by-step roadmap from baseline nervousness to unshakeable gravitas.",
        syllabus: [
          { n: '01', t: 'The Foundation of Presence', d: 'Grounding techniques, diaphragmatic breathing under tension, and mastering the crucial first 10 seconds in any room.' },
          { n: '02', t: 'Breaking the Reactive Cycle', d: 'Identifying personal emotional triggers, pausing between impulse and response, and eliminating defensive habits.' },
          { n: '03', t: 'Mastering Vocal Gravitas & Tone', d: 'Lowering resonance, eliminating filler words, pacing your delivery, and speaking with magnetic, effortless weight.' },
          { n: '04', t: 'Non-Verbal Dominance & Spatial Calibration', d: 'Unwavering eye contact, open posture mechanics, micro-expression control, and physical composure.' },
          { n: '05', t: 'High-Stakes Conversations & Holding Frame', d: 'Navigating demanding bosses, aggressive negotiations, or emotionally volatile conversations without yielding.' },
          { n: '06', t: 'Decision Making & Decisive Action', d: 'Eliminating second-guessing, owning difficult outcomes, and leading team members or family with unhesitating clarity.' },
          { n: '07', t: 'Conflict Resolution Without Compromise', d: 'De-escalating heated confrontation while maintaining firm boundaries and achieving win-win outcomes.' },
          { n: '08', t: 'Integration & Lifetime Standard', d: 'Building your daily self-command rituals, maintaining high standards, and solidifying permanent personal gravitas.' }
        ],
        writeup: {
          chip: "CORE METHODOLOGY",
          h1: "Most Men Were Never Taught How to Hold Ground",
          lede: "True charisma is not loud. It is the unhurried certainty of a man who does not need permission to take up space.",
          p1: "When pressure spikes in a meeting, negotiation, or relationship, the natural reflex is either to collapse inward or become combative. Both signal the same underlying weakness: emotional reactivity.",
          quote: "A room doesn't respond to volume. It responds to certainty.",
          p2: "Through 8 structured modules, you dismantle the nervous system habits that cause rushing, stammering, and over-explaining. You learn how to anchor your physical presence, speak with calm resonance, and command respectful silence before uttering a single sentence.",
          distinction: "Reactive men seek approval through fast speech and validation. Anchored men lead through stillness, calibrated pauses, and clear boundaries."
        }
      }
    ];

    if (!courseDetailsMap || Object.keys(courseDetailsMap).length === 0) {
      return defaultList;
    }

    const mergedList = defaultList
      .filter(item => !courseDetailsMap || courseDetailsMap[item.slug] !== undefined)
      .map(item => {
        const dynamicCourse = courseDetailsMap[item.slug];
        if (!dynamicCourse) return item;

        const includeFree = dynamicCourse.includeFreeSessions !== undefined 
          ? Boolean(dynamicCourse.includeFreeSessions) 
          : (dynamicCourse.pricingSection?.includeFreeSessions !== undefined ? Boolean(dynamicCourse.pricingSection.includeFreeSessions) : true);

        const freeCount = dynamicCourse.freeSessionsCount !== undefined 
          ? Number(dynamicCourse.freeSessionsCount) 
          : (dynamicCourse.pricingSection?.freeSessionsCount !== undefined ? Number(dynamicCourse.pricingSection.freeSessionsCount) : 5);

        const effectiveFreeCount = includeFree ? freeCount : 0;

        const rawInside = dynamicCourse.inside || item.inside || [];
        const dynamicInside = rawInside.map(str => {
          if (typeof str === 'string' && str.toLowerCase().includes('private 1-on-1')) {
            return effectiveFreeCount > 0 
              ? `${effectiveFreeCount} private 1-on-1 coaching sessions with Aarkesh`
              : 'Direct instructor Q&A with lifetime updates';
          }
          return str;
        });

        const rawHl = dynamicCourse.hl || item.hl || [];
        const dynamicHl = rawHl.map(pair => {
          if (Array.isArray(pair) && pair[0] && typeof pair[0] === 'string' && pair[0].toLowerCase().includes('private session')) {
            return effectiveFreeCount > 0 
              ? [`${effectiveFreeCount} Private Session${effectiveFreeCount > 1 ? 's' : ''}`, pair[1] || 'with Aarkesh']
              : ['Direct Q&A Access', 'with Aarkesh'];
          }
          return pair;
        });

        const dynamicFacts = dynamicCourse.facts || [
          ["8", "Modules"],
          effectiveFreeCount > 0 ? [`${effectiveFreeCount} Free`, "1-on-1 Sessions"] : ["Direct", "Q&A Access"]
        ];

        return {
          ...item,
          ...dynamicCourse,
          includeFreeSessions: includeFree,
          freeSessionsCount: effectiveFreeCount,
          theme: dynamicCourse.theme || dynamicCourse.cardTheme || dynamicCourse.heroSection?.cardTheme || item.theme,
          enableGst: dynamicCourse.enableGst !== undefined ? dynamicCourse.enableGst : dynamicCourse.pricingSection?.enableGst ?? item.enableGst,
          gstRate: dynamicCourse.gstRate !== undefined ? dynamicCourse.gstRate : dynamicCourse.pricingSection?.gstRate ?? item.gstRate,
          isGstIncluded: dynamicCourse.isGstIncluded !== undefined 
            ? dynamicCourse.isGstIncluded 
            : (dynamicCourse.pricingSection?.gstMode ? dynamicCourse.pricingSection.gstMode === 'included' : item.isGstIncluded),
          price: dynamicCourse.price || (dynamicCourse.pricingSection?.currentPrice ? `₹${Number(dynamicCourse.pricingSection.currentPrice).toLocaleString('en-IN')}` : item.price),
          was: dynamicCourse.was || (dynamicCourse.pricingSection?.originalPrice ? `₹${Number(dynamicCourse.pricingSection.originalPrice).toLocaleString('en-IN')}` : item.was),
          writeup: { ...(item.writeup || {}), ...(dynamicCourse.writeup || {}) },
          syllabus: dynamicCourse.syllabus || item.syllabus,
          inside: dynamicInside,
          hl: dynamicHl,
          facts: dynamicFacts,
          chips: dynamicCourse.chips || item.chips,
          sidebarChips: dynamicCourse.sidebarChips || item.sidebarChips
        };
      });

    // Newly created courses from admin (excluding deleted ones and baseline)
    const newCourses = [];
    Object.keys(courseDetailsMap).forEach(slug => {
      if (slug !== 'better-man' && slug !== 'difficult-people' && slug !== 'decisions' && !defaultList.some(item => item.slug === slug)) {
        newCourses.push(courseDetailsMap[slug]);
      }
    });

    // Sort newest courses first (reverse chronological) so new courses appear on the LEFT
    newCourses.reverse();
    newCourses.sort((a, b) => {
      const dateA = new Date(a?.createdAt || 0).getTime();
      const dateB = new Date(b?.createdAt || 0).getTime();
      if (dateA && dateB && dateA !== dateB) return dateB - dateA;
      return 0;
    });

    // New courses go to the LEFT, baseline/older courses (The Better Man) go to the RIGHT
    const fullList = [...newCourses, ...mergedList];

    return fullList.filter(item => item && item.hidden !== true && item.isPublished !== false && item.slug !== 'difficult-people' && item.slug !== 'decisions');
  }, [basePrice, comparePrice, courseDetailsMap]);

  const activeCourse = useMemo(() => {
    if (!slug) return coursesList[0];
    const foundInList = coursesList.find((c) => c.slug === slug);
    if (courseDetailsMap && courseDetailsMap[slug]) {
      const dynamicCourse = courseDetailsMap[slug];
      const includeFree = dynamicCourse.includeFreeSessions !== undefined 
        ? Boolean(dynamicCourse.includeFreeSessions) 
        : (dynamicCourse.pricingSection?.includeFreeSessions !== undefined ? Boolean(dynamicCourse.pricingSection.includeFreeSessions) : true);

      const freeCount = dynamicCourse.freeSessionsCount !== undefined 
        ? Number(dynamicCourse.freeSessionsCount) 
        : (dynamicCourse.pricingSection?.freeSessionsCount !== undefined ? Number(dynamicCourse.pricingSection.freeSessionsCount) : (foundInList?.freeSessionsCount ?? 5));

      const effectiveFreeCount = includeFree ? freeCount : 0;

      const rawInside = dynamicCourse.inside || foundInList?.inside || [];
      const dynamicInside = rawInside.map(str => {
        if (typeof str === 'string' && str.toLowerCase().includes('private 1-on-1')) {
          return effectiveFreeCount > 0 
            ? `${effectiveFreeCount} private 1-on-1 coaching sessions with Aarkesh`
            : 'Direct instructor Q&A with lifetime updates';
        }
        return str;
      });

      const rawHl = dynamicCourse.hl || foundInList?.hl || [];
      const dynamicHl = rawHl.map(pair => {
        if (Array.isArray(pair) && pair[0] && typeof pair[0] === 'string' && pair[0].toLowerCase().includes('private session')) {
          return effectiveFreeCount > 0 
            ? [`${effectiveFreeCount} Private Session${effectiveFreeCount > 1 ? 's' : ''}`, pair[1] || 'with Aarkesh']
            : ['Direct Q&A Access', 'with Aarkesh'];
        }
        return pair;
      });

      const dynamicFacts = dynamicCourse.facts || foundInList?.facts || [
        ["8", "Modules"],
        effectiveFreeCount > 0 ? [`${effectiveFreeCount} Free`, "1-on-1 Sessions"] : ["Direct", "Q&A Access"]
      ];

      return {
        ...(foundInList || {}),
        ...dynamicCourse,
        includeFreeSessions: includeFree,
        freeSessionsCount: effectiveFreeCount,
        theme: dynamicCourse.theme || dynamicCourse.cardTheme || dynamicCourse.heroSection?.cardTheme || foundInList?.theme || 'roy',
        cardTheme: dynamicCourse.cardTheme || dynamicCourse.theme || dynamicCourse.heroSection?.cardTheme || foundInList?.cardTheme,
        enableGst: dynamicCourse.enableGst !== undefined ? dynamicCourse.enableGst : dynamicCourse.pricingSection?.enableGst ?? foundInList?.enableGst,
        gstRate: dynamicCourse.gstRate !== undefined ? dynamicCourse.gstRate : dynamicCourse.pricingSection?.gstRate ?? foundInList?.gstRate,
        isGstIncluded: dynamicCourse.isGstIncluded !== undefined 
          ? dynamicCourse.isGstIncluded 
          : (dynamicCourse.pricingSection?.gstMode ? dynamicCourse.pricingSection.gstMode === 'included' : foundInList?.isGstIncluded),
        writeup: { ...(foundInList?.writeup || {}), ...(dynamicCourse.writeup || {}) },
        syllabus: dynamicCourse.syllabus || foundInList?.syllabus,
        inside: dynamicInside,
        hl: dynamicHl,
        facts: dynamicFacts,
        chips: dynamicCourse.chips || foundInList?.chips,
        sidebarChips: dynamicCourse.sidebarChips || foundInList?.sidebarChips
      };
    }
    if (foundInList) return foundInList;
    return {
      slug: slug,
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      price: '₹4,999',
      was: '₹9,999',
      soon: true,
      theme: 'white',
      n: '01',
      chips: [],
      hl: [],
      inside: [],
      syllabus: []
    };
  }, [coursesList, courseDetailsMap, slug]);

  const isThisCoursePurchased = useMemo(() => {
    const targetSlug = activeCourse?.slug || 'better-man';
    return purchasedCourses.includes(targetSlug);
  }, [purchasedCourses, activeCourse?.slug]);

  const hasAnyCoursePurchased = useMemo(() => {
    return (Array.isArray(purchasedCourses) && purchasedCourses.length > 0) || isPurchased;
  }, [purchasedCourses, isPurchased]);

  // Sync custom course video modules if defined in course settings
  useEffect(() => {
    if (activeCourse?.videoModules && Array.isArray(activeCourse.videoModules) && activeCourse.videoModules.length > 0) {
      setCurriculumModules(activeCourse.videoModules);
      const currentModExists = activeCourse.videoModules.some(m => String(m.id || m._id) === String(activeModuleObj?.id || activeModuleObj?._id));
      if (!currentModExists && activeCourse.videoModules[0]) {
        setActiveModuleObj(activeCourse.videoModules[0]);
        if (activeCourse.videoModules[0].lessons?.length > 0) {
          setActiveLesson(activeCourse.videoModules[0].lessons[0]);
        }
      }
    }
  }, [activeCourse?.slug, activeCourse?.videoModules]);

  const detailThemeClass = useMemo(() => {
    const t = (activeCourse?.theme || activeCourse?.cardTheme || activeCourse?.heroSection?.cardTheme || activeCourse?.cls || '').toLowerCase().trim();
    if (t === 'black' || t === 'obs' || t === 'obsidian' || t === 'obsidian black' || t === 'v3') return 'theme-dark';
    if (t === 'purple' || t === 'roy' || t === 'royal' || t === 'royal purple' || t === 'v2') return 'theme-purple';
    if (t === 'white' || t === 'whi' || t === 'clean white') return '';
    return '';
  }, [activeCourse]);

  const activeCourseBasePrice = useMemo(() => {
    const rawP = activeCourse?.pricingSection?.currentPrice ?? activeCourse?.price ?? activeCourse?.rawPrice;
    if (rawP !== undefined && rawP !== null && rawP !== '') {
      const parsed = typeof rawP === 'number'
        ? rawP
        : Number(String(rawP).replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (activeCourse?.slug === 'better-man') return basePrice;
    if (activeCourse?.slug === 'difficult-people') return 3999;
    if (activeCourse?.slug === 'decisions') return 3499;
    return basePrice;
  }, [activeCourse, basePrice]);

  const activeCourseComparePrice = useMemo(() => {
    const rawW = activeCourse?.pricingSection?.originalPrice ?? activeCourse?.was ?? activeCourse?.rawWas;
    if (rawW !== undefined && rawW !== null && rawW !== '') {
      const parsed = typeof rawW === 'number'
        ? rawW
        : Number(String(rawW).replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (activeCourse?.slug === 'better-man') return comparePrice;
    if (activeCourse?.slug === 'difficult-people') return 7999;
    if (activeCourse?.slug === 'decisions') return 6999;
    return comparePrice;
  }, [activeCourse, comparePrice]);

  const activeCourseDynamicFreeCount = useMemo(() => {
    const includeFree = activeCourse?.includeFreeSessions !== undefined 
      ? Boolean(activeCourse.includeFreeSessions) 
      : (activeCourse?.pricingSection?.includeFreeSessions !== undefined ? Boolean(activeCourse.pricingSection.includeFreeSessions) : true);

    if (!includeFree) return 0;

    const freeVal = activeCourse?.freeSessionsCount !== undefined 
      ? Number(activeCourse.freeSessionsCount) 
      : (activeCourse?.pricingSection?.freeSessionsCount !== undefined ? Number(activeCourse.pricingSection.freeSessionsCount) : 5);

    return isNaN(freeVal) ? 0 : Math.max(0, freeVal);
  }, [activeCourse]);

  const currentGstRate = useMemo(() => {
    const isGstOn = activeCourse?.enableGst !== undefined 
      ? Boolean(activeCourse.enableGst)
      : (activeCourse?.pricingSection?.enableGst !== undefined ? Boolean(activeCourse.pricingSection.enableGst) : (gstRate > 0));
    if (!isGstOn) return 0;
    const rateVal = activeCourse?.gstRate ?? activeCourse?.pricingSection?.gstRate;
    if (rateVal !== undefined && rateVal !== null && rateVal !== '') {
      const r = Number(rateVal);
      return isNaN(r) ? 0 : r;
    }
    return gstRate;
  }, [activeCourse, gstRate]);

  const currentIsGstIncluded = useMemo(() => {
    if (activeCourse?.isGstIncluded !== undefined) return Boolean(activeCourse.isGstIncluded);
    if (activeCourse?.pricingSection?.gstMode) return activeCourse.pricingSection.gstMode === 'included';
    if (activeCourse?.gstMode) return activeCourse.gstMode === 'included';
    return isGstIncluded;
  }, [activeCourse, isGstIncluded]);

  const discountAmount = useMemo(() => {
    return appliedCoupon ? Math.round((activeCourseBasePrice * (appliedCoupon.percent || 0)) / 100) : 0;
  }, [appliedCoupon, activeCourseBasePrice]);

  const discountedBasePrice = Math.max(0, activeCourseBasePrice - discountAmount);

  const gstAmount = useMemo(() => {
    if (currentGstRate <= 0) return 0;
    return currentIsGstIncluded
      ? Math.round(discountedBasePrice - (discountedBasePrice / (1 + (currentGstRate / 100))))
      : Math.round((discountedBasePrice * currentGstRate) / 100);
  }, [discountedBasePrice, currentIsGstIncluded, currentGstRate]);

  const baseBeforeGst = (currentIsGstIncluded && currentGstRate > 0) ? discountedBasePrice - gstAmount : discountedBasePrice;
  const finalPayable = currentIsGstIncluded ? discountedBasePrice : (discountedBasePrice + gstAmount);

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      setCouponMsg({ type: 'error', text: 'Please enter a valid coupon code.' });
      return;
    }
    if (code === 'AARKESH50' || code === 'CLAIM50' || code === 'SHERY50') {
      setAppliedCoupon({ code, percent: 50 });
      setCouponMsg({ type: 'success', text: 'Coupon applied! 50% discount applied successfully.' });
    } else if (code === 'BETTER20') {
      setAppliedCoupon({ code, percent: 20 });
      setCouponMsg({ type: 'success', text: 'Coupon applied! 20% discount applied.' });
    } else if (code === 'WELCOME10') {
      setAppliedCoupon({ code, percent: 10 });
      setCouponMsg({ type: 'success', text: 'Coupon applied! 10% discount applied.' });
    } else {
      setCouponMsg({ type: 'error', text: 'Invalid coupon code. Try AARKESH50 or CLAIM50' });
    }
  };

  const courseThemes = {
    'better-man': {
      accent: '#C878BE',
      accentLight: '#E3B8DE',
      accentGlow: 'rgba(200, 120, 190, 0.22)',
      gradient: 'from-[#A83B96] via-[#C878BE] to-[#7A2A70]',
      buttonBg: 'bg-gradient-to-r from-[#A83B96] via-[#C878BE] to-[#7A2A70]',
      cardBg: 'bg-[#150a18]',
      outerBg: 'bg-[#0e0610]',
      border: 'border-[#C878BE]/30',
      badge: 'Full Masterclass Access',
      tagline: 'Master calm authority, presence & gravitas'
    },
    'difficult-people': {
      accent: '#A855F7',
      accentLight: '#D8B4FE',
      accentGlow: 'rgba(168, 85, 247, 0.22)',
      gradient: 'from-[#9333EA] via-[#A855F7] to-[#7E22CE]',
      buttonBg: 'bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#7E22CE]',
      cardBg: 'bg-[#140b20]',
      outerBg: 'bg-[#0c0614]',
      border: 'border-[#A855F7]/30',
      badge: 'Emotional Sovereignty',
      tagline: 'Disarm manipulation & establish unshakeable boundaries'
    },
    'decisions': {
      accent: '#38BDF8',
      accentLight: '#BAE6FD',
      accentGlow: 'rgba(56, 189, 248, 0.22)',
      gradient: 'from-[#0284C7] via-[#38BDF8] to-[#0369A1]',
      buttonBg: 'bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#0369A1]',
      cardBg: 'bg-[#081528]',
      outerBg: 'bg-[#040D1A]',
      border: 'border-[#38BDF8]/30',
      badge: 'Decision Architecture',
      tagline: 'Overcome overthinking & lead with high conviction'
    }
  };
  const activeTheme = courseThemes[activeCourse?.slug] || courseThemes['better-man'];

  const handleSelectCourse = (c) => {
    navigate(`/course/${c.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (showDashboard) return;
    const ids = ['p1', 'p2', 'p3', 'curriculum', 'faq'];
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveToc(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [showDashboard]);

  // Group published course documents dynamically by columnHeading
  const groupedColumns = React.useMemo(() => {
    const groups = {};
    courseDocuments.forEach((doc) => {
      const heading = (doc.columnHeading || 'LEGAL').trim().toUpperCase();
      if (!groups[heading]) {
        groups[heading] = [];
      }
      groups[heading].push(doc);
    });
    return groups;
  }, [courseDocuments]);

  const handleEnroll = () => {
    if (!isLoggedIn) {
      setLoginMode('register');
      setIsOtpStep(false);
      setIsForgotPassword(false);
      setIsForgotOtpStep(false);
      setError('');
      setShowPricingModal(false);
      setShowCourseLogin(true);
    } else if (isComingSoon) {
      setShowPreRegSuccessModal(true);
    } else {
      setShowPricingModal(true);
    }
  };

  const handlePurchase = () => {
    if (isComingSoon) {
      setShowPricingModal(false);
      setShowPreRegSuccessModal(true);
      return;
    }
    if (!isLoggedIn) {
      setShowPricingModal(false);
      setPendingCheckout(true);
      setShowCourseLogin(true);
    } else {
      setShowCheckout(true);
      setShowPricingModal(false);
      setSearchParams({ checkout: 'true' });
      sessionStorage.setItem('course_checkout_active', 'true');
    }
  };

  const handleCloseCheckout = () => {
    setIsLoading(false);
    setError('');
    setShowCheckout(false);
    sessionStorage.removeItem('course_checkout_active');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('checkout');
      return next;
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError('');

    const API_URL = import.meta.env.VITE_API_URL || '';

    const safeJson = async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server returned ${res.status}. Please ensure backend API is running and Razorpay keys are configured.`);
      }
    };

    try {
      const scriptLoaded = await new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded) throw new Error('Razorpay SDK failed to load. Please check your internet connection.');

      const keyRes = await fetch(`${API_URL}/api/payment/public-key`);
      const keyData = await safeJson(keyRes);
      if (!keyRes.ok) throw new Error(keyData.message || 'Payment gateway not configured.');

      const orderRes = await fetch(`${API_URL}/api/payment/course-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          courseSlug: activeCourse?.slug || 'better-man',
          amount: finalPayable
        })
      });
      const orderData = await safeJson(orderRes);
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create payment order');

      const options = {
        key: keyData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Better With Aarkesh',
        description: activeCourse?.title ? `${activeCourse.title} Masterclass` : 'The Better Man Masterclass',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const token = localStorage.getItem('courseToken');
            const verifyRes = await fetch(`${API_URL}/api/payment/course-verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                token: token,
                courseSlug: activeCourse?.slug || 'better-man',
                amount: finalPayable
              })
            });
            const verifyData = await safeJson(verifyRes);
            if (verifyRes.ok && verifyData.success) {
              // Mark course as purchased
              localStorage.setItem('isCoursePurchased', 'true');
              setIsPurchased(true);
              const targetSlug = activeCourse?.slug || 'better-man';
              const updatedPurchasedSlugs = verifyData.purchasedCourses || [targetSlug];
              setPurchasedCourses(prev => Array.from(new Set([...(prev || []), ...updatedPurchasedSlugs])));
              try {
                const storedUser = JSON.parse(localStorage.getItem('courseUser') || '{}');
                storedUser.isPurchased = true;
                storedUser.purchasedCourses = Array.from(new Set([...(storedUser.purchasedCourses || []), ...updatedPurchasedSlugs]));
                localStorage.setItem('courseUser', JSON.stringify(storedUser));
              } catch {}

              setShowCheckout(false);
              setShowPricingModal(false);
              sessionStorage.removeItem('course_checkout_active');
              setSearchParams({});

              // Save coaching token so My Journey page shows free sessions
              if (verifyData.coachingToken) {
                localStorage.setItem('token', verifyData.coachingToken);
              }
              if (verifyData.freeSessions !== undefined) {
                localStorage.setItem('freeSessions', String(verifyData.freeSessions));
              }

              // Show success toast
              showToast('🎉 Payment Successful! Official Tax Invoice generated.');

              const dynamicFreeCount = activeCourse?.freeSessionsCount !== undefined 
                ? Number(activeCourse.freeSessionsCount) 
                : (activeCourse?.pricingSection?.freeSessionsCount !== undefined ? Number(activeCourse.pricingSection.freeSessionsCount) : 5);

              const invoiceData = verifyData.purchase ? {
                ...verifyData.purchase,
                freeSessionsGranted: verifyData.purchase.freeSessionsGranted !== undefined ? Number(verifyData.purchase.freeSessionsGranted) : dynamicFreeCount,
                bonusItemTitle: dynamicFreeCount > 0 ? `${dynamicFreeCount} Private 1-on-1 Executive Coaching Sessions with Aarkesh` : 'Direct Instructor Q&A & Lifetime Updates',
                bonusItemSubtitle: dynamicFreeCount > 0 ? `Valued at ₹${(dynamicFreeCount * 5000).toLocaleString('en-IN')} — 100% Complimentary student bonus` : 'Included with your enrollment'
              } : {
                status: 'Success',
                transactionId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: finalPayable,
                basePrice: baseBeforeGst,
                gstRate: currentGstRate,
                gstAmount,
                isGstIncluded: currentIsGstIncluded,
                finalAmount: finalPayable,
                purchaseDate: new Date().toISOString(),
                studentName: fullName || email?.split('@')[0] || 'Valued Student',
                studentEmail: email,
                courseTitle: activeCourse?.title || 'The Better Man™',
                invoiceItemTitle: `${activeCourse?.title || 'The Better Man™'} — Masterclass Lifetime Access`,
                invoiceItemSubtitle: 'HD video frameworks, modular curriculum, worksheets & community',
                bonusItemTitle: dynamicFreeCount > 0 ? `${dynamicFreeCount} Private 1-on-1 Executive Coaching Sessions with Aarkesh` : 'Direct Instructor Q&A & Lifetime Updates',
                bonusItemSubtitle: dynamicFreeCount > 0 ? `Valued at ₹${(dynamicFreeCount * 5000).toLocaleString('en-IN')} — 100% Complimentary student bonus` : 'Included with your enrollment',
                freeSessionsGranted: dynamicFreeCount
              };

              if (verifyData.freeSessions !== undefined) {
                const count = Math.max(0, Number(verifyData.freeSessions));
                setFreeSessionsRemaining(count);
                localStorage.setItem('freeSessions', String(count));
              }

              // Open invoice / success page directly
              setShowDashboard(false);
              setPurchaseSuccessData(invoiceData);
            } else {
              setError(verifyData.message || 'Payment verification failed');
            }
          } catch (err) {
            setError(err.message || 'Error verifying payment.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: { email, contact: phoneNumber },
        theme: { color: activeTheme.accent || '#C878BE' },
        modal: {
          ondismiss: function () {
            console.log('Razorpay checkout cancelled/dismissed by user');
            setIsLoading(false);
          },
          escape: true,
          backdropclose: false
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        console.warn('Razorpay payment failed:', response);
        const failedPayload = {
          status: 'Failed',
          transactionId: response.error?.metadata?.payment_id || `failed_${Date.now().toString(36)}`,
          orderId: response.error?.metadata?.order_id || orderData.id,
          failureReason: response.error?.description || response.error?.reason || 'Transaction was declined by bank / user cancelled payment.',
          errorCode: response.error?.code || 'PAYMENT_FAILED',
          amount: finalPayable,
          basePrice: baseBeforeGst,
          gstRate: currentGstRate,
          gstAmount,
          isGstIncluded: currentIsGstIncluded,
          finalAmount: finalPayable,
          purchaseDate: new Date().toISOString(),
          studentName: fullName || email?.split('@')[0] || 'Valued Student',
          studentEmail: email,
          courseTitle: 'The Better Man™',
        };

        // Persist failed attempt in database for admin visibility
        try {
          fetch(`${API_URL}/api/payment/course-failed-record`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              studentName: fullName || email?.split('@')[0] || 'Student',
              razorpay_order_id: failedPayload.orderId,
              razorpay_payment_id: failedPayload.transactionId,
              error_code: failedPayload.errorCode,
              error_description: failedPayload.failureReason,
              amount: finalPayable
            })
          }).catch(e => console.warn('Failed record log err:', e));
        } catch (e) {
          console.warn('Failed to record failure:', e);
        }

        // Show inline error — no receipt page for failures
        setError(failedPayload.failureReason || 'Payment failed. Please try again.');
        setIsLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment setup failed.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('courseToken');
    const purchased = localStorage.getItem('isCoursePurchased') === 'true';
    if (token) {
      setIsLoggedIn(true);
      setIsPurchased(purchased);
      const isLearnParam = searchParams.get('learn') === 'true';
      if (purchased && isLearnParam) {
        setShowDashboard(true);
      }
      const userStr = localStorage.getItem('courseUser');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj?.email) setEmail(userObj.email);
          if (userObj?.fullName) setFullName(userObj.fullName);
          if (userObj?.phoneNumber) setPhoneNumber(userObj.phoneNumber);
        } catch (e) {}
      }
    }

    const isCheckoutParam = searchParams.get('checkout') === 'true' || sessionStorage.getItem('course_checkout_active') === 'true';
    if (isCheckoutParam && !purchased) {
      if (token) {
        setShowCheckout(true);
        if (searchParams.get('checkout') !== 'true') {
          setSearchParams({ checkout: 'true' });
        }
      } else {
        setShowCourseLogin(true);
      }
    }

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchParams]);

  // Anti-Inspect & DevTools blocker in Course Dashboard
  useEffect(() => {
    if (!showDashboard) return;

    const blockDevToolsKeys = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['u', 'U', 's', 'S'].includes(e.key)) ||
        (e.metaKey && ['u', 'U', 's', 'S'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const blockContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', blockDevToolsKeys, { capture: true });
    window.addEventListener('contextmenu', blockContextMenu);

    return () => {
      window.removeEventListener('keydown', blockDevToolsKeys, { capture: true });
      window.removeEventListener('contextmenu', blockContextMenu);
    };
  }, [showDashboard]);

  const handleLogout = () => {
    clearAllAuth();
    setIsLoggedIn(false);
    setIsPurchased(false);
    setShowDashboard(false);
    setShowCheckout(false);
    setShowProfileMenu(false);
    setSearchParams({});
    showToast('Logged out successfully', 'success');
  };

  // OTP Handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value !== '' && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpValues[index] === '' && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleToggleMode = () => {
    setLoginMode(loginMode === 'login' ? 'register' : 'login');
    setIsOtpStep(false);
    setIsForgotPassword(false);
    setIsForgotOtpStep(false);
    setOtpValues(['', '', '', '']);
    setError('');
    setFieldErrors({});
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setEmail('');
    setCountryCode('+91');
    setPhoneNumber('');
  };

  // Auth Submit
  const handleAuthSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setError('');

    const cleanPhone = (phoneNumber || '').replace(/\D/g, '');
    const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
    const errs = {};

    if (loginMode === 'register' && !isForgotPassword) {
      if (!isOtpStep) {
        if (!fullName.trim()) errs.fullName = true;
        if (!email.trim() || !isValidEmail(email)) errs.email = true;
        if (!cleanPhone || cleanPhone.length !== 10) errs.phoneNumber = true;
        if (!password || password.length < 4) errs.password = true;
        if (!confirmPassword || password !== confirmPassword) errs.confirmPassword = true;

        if (Object.keys(errs).length > 0) {
          setFieldErrors(errs);
          if (Object.keys(errs).length >= 2) {
            setError('Please fill in all required fields correctly');
          } else if (errs.fullName) {
            setError('Please enter your full name');
          } else if (errs.email) {
            setError(!email.trim() ? 'Please enter your email address' : 'Please enter a valid email address');
          } else if (errs.phoneNumber) {
            setError(!cleanPhone ? 'Please enter your mobile number' : 'Mobile number must be exactly 10 digits');
          } else if (errs.password) {
            setError(!password ? 'Please enter a password' : 'Password must be at least 4 characters long');
          } else if (errs.confirmPassword) {
            setError(!confirmPassword ? 'Please confirm your password' : 'Passwords do not match');
          }
          return;
        }
      } else {
        if (otpValues.join('').length !== 4) {
          errs.otp = true;
          setFieldErrors(errs);
          setError('Please enter the 4-digit OTP');
          return;
        }
      }
    } else if (loginMode === 'login' && !isForgotPassword) {
      if (!email.trim() || !isValidEmail(email)) errs.email = true;
      if (!password) errs.password = true;
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setError('Please enter your email and password');
        return;
      }
    } else if (isForgotPassword) {
      if (!isForgotOtpStep) {
        if (!email.trim() || !isValidEmail(email)) {
          errs.email = true;
          setFieldErrors(errs);
          setError(!email.trim() ? 'Please enter your email address' : 'Please enter a valid email address');
          return;
        }
      } else {
        if (otpValues.join('').length !== 4) errs.otp = true;
        if (!password || password.length < 4) errs.password = true;
        if (!confirmPassword || password !== confirmPassword) errs.confirmPassword = true;
        if (Object.keys(errs).length > 0) {
          setFieldErrors(errs);
          if (errs.otp) setError('Please enter the 4-digit OTP');
          else if (errs.password) setError(!password ? 'Please enter a new password' : 'Password must be at least 4 characters long');
          else if (errs.confirmPassword) setError(!confirmPassword ? 'Please confirm your new password' : 'Passwords do not match');
          return;
        }
      }
    }

    setFieldErrors({});

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      let endpoint = `${API_URL}/api/course-auth/login`;
      let body = { email, password };

      if (isForgotPassword) {
        if (!isForgotOtpStep) {
          endpoint = `${API_URL}/api/course-auth/forgot-password-init`;
          body = { email };
        } else {
          endpoint = `${API_URL}/api/course-auth/forgot-password-reset`;
          body = { email, otp: otpValues.join(''), newPassword: password };
        }
      } else if (loginMode === 'register') {
        if (!isOtpStep) {
          endpoint = `${API_URL}/api/course-auth/register-init`;
          body = { fullName, email, password, countryCode, phoneNumber: cleanPhone };
        } else {
          endpoint = `${API_URL}/api/course-auth/register-verify`;
          body = { email, otp: otpValues.join('') };
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (isForgotPassword) {
          if (!isForgotOtpStep) {
            setIsForgotOtpStep(true);
            setError('');
          } else {
            setIsForgotPassword(false);
            setIsForgotOtpStep(false);
            setLoginMode('login');
            setOtpValues(['', '', '', '']);
            setPassword('');
            setConfirmPassword('');
            setError('');
          }
        } else if (loginMode === 'register' && !isOtpStep) {
          setIsOtpStep(true);
          setError('');
        } else {
          syncLoginData(data);
          if (data.freeSessions !== undefined) {
            const count = Math.max(0, Number(data.freeSessions));
            setFreeSessionsRemaining(count);
          }
          const userSlugs = Array.isArray(data.purchasedCourses) && data.purchasedCourses.length > 0
            ? data.purchasedCourses
            : (data.isPurchased ? ['better-man'] : []);
          setPurchasedCourses(userSlugs);
          if (data.isPurchased && !isComingSoon) {
            setIsPurchased(true);
          } else {
            setIsPurchased(false);
          }
          setShowDashboard(false);
          setShowCheckout(false);
          setShowPricingModal(false);
          setShowCourseLogin(false);
          setIsLoggedIn(true);

          const successMsg = loginMode === 'register' ? 'Registration successfully' : 'Login successfully';
          showToast(successMsg, 'success');
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error, please try again later');
    } finally {
      setIsLoading(false);
    }
  };



  // ═══════════════════════════════════════════════════════════════
  // PAYMENT SUCCESS / FAILED TAX INVOICE RECEIPT VIEW
  // ═══════════════════════════════════════════════════════════════
  if (purchaseSuccessData) {
    return (
      <CoursePaymentSuccess
        purchaseData={purchaseSuccessData}
        onStartLearning={() => {
          setPurchaseSuccessData(null);
          navigate('/my-course');
        }}
        onBookSession={() => {
          setPurchaseSuccessData(null);
          navigate('/book');
        }}
        onRetryPayment={() => {
          setPurchaseSuccessData(null);
          setShowCheckout(true);
          handlePayment();
        }}
        onBackToCourse={() => {
          setPurchaseSuccessData(null);
          setShowCheckout(false);
        }}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD VIEW (purchased users)
  // ═══════════════════════════════════════════════════════════════
  if (showDashboard) {
    const resolvedActiveVid = resolvePlayableVideoId(activeLesson);
    const hasActivePlayableVideo = Boolean(
      resolvedActiveVid && 
      typeof resolvedActiveVid === 'string' &&
      /^[a-zA-Z0-9_-]{11}$/.test(resolvedActiveVid.trim()) &&
      resolvedActiveVid !== 'dummy'
    );
    const activeMuxPlaybackId = activeLesson?.muxPlaybackId || activeLesson?.src?.val || activeLesson?.src?.playbackId || (typeof activeLesson?.videoUrl === 'string' && !activeLesson?.videoUrl.includes('youtube') && !activeLesson?.videoUrl.includes('youtu.be') ? activeLesson.videoUrl : null);
    const hasMux = Boolean(activeMuxPlaybackId && typeof activeMuxPlaybackId === 'string' && activeMuxPlaybackId.trim() && !activeMuxPlaybackId.includes('dummy'));

    const completedCount = allLessons.filter(l => l.isCompleted).length;
    const totalCount = allLessons.length;
    const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const remainingCount = totalCount - completedCount;

    // Find module index of active lesson
    const activeModIndex = curriculumModules.findIndex(m => 
      (m._id || m.id)?.toString() === (activeModuleObj?._id || activeModuleObj?.id)?.toString()
    );
    const displayModNum = activeModIndex >= 0 ? activeModIndex + 1 : 1;
    const lessonNumInMod = (activeModuleObj?.lessons || []).findIndex(
      l => (l._id || l.id)?.toString() === (activeLesson?._id || activeLesson?.id)?.toString()
    ) + 1 || (currentLessonIndex + 1);

    const formattedLessonNumber = String(currentLessonIndex >= 0 ? currentLessonIndex + 1 : 1).padStart(2, '0');

    return (
      <div className="course-landing-scope min-h-screen bg-[#060309] text-[#F6EEF8] flex flex-col font-sans">
        {/* ── 1. FIXED TOP HEADER ── */}
        <header className="player-hdr">
          <Link 
            className="player-logo" 
            to="/"
            onClick={handleExitToMainHome}
          >
            BetterWith<b>Aarkesh</b>
          </Link>
          <nav className="player-nav">
            <button 
              type="button"
              className="bg-transparent border-0 p-0 text-[#A99AB0] hover:text-[#F6EEF8] font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
              onClick={handleExitToCourseHome}
            >
              HOME
            </button>
            <button 
              type="button"
              className="bg-transparent border-0 p-0 text-[#A99AB0] hover:text-[#F6EEF8] font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
              onClick={handleExitToAllCourses}
            >
              COURSES
            </button>
            <button 
              type="button"
              className="bg-transparent border-0 p-0 text-[#A99AB0] hover:text-[#F6EEF8] font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
              onClick={handleExitToFaq}
            >
              FAQ
            </button>
          </nav>
          <div className="player-hr flex items-center gap-2.5">
            <Link to="/library" className="player-pill" title="Explore Articles & Library">
              <Books size={16} weight="bold" />
              <span>LIBRARY</span>
            </Link>
            <Link to="/my-course" className="player-pill on" title="My Enrolled Courses">
              <BookOpen size={16} weight="bold" />
              <span>MY COURSE</span>
            </Link>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="player-avt cursor-pointer hover:border-[#C878BE] transition-colors"
                title="Student Profile"
              >
                <User size={18} weight="bold" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0E0610] shadow-2xl py-2 z-[100] overflow-hidden text-left">
                  {/* User Email & Name Header */}
                  <div className="px-5 py-3 border-b border-white/10 bg-white/[0.03]">
                    <div className="text-xs font-bold text-white truncate">
                      {(() => { try { return JSON.parse(localStorage.getItem('courseUser') || '{}').fullName || 'Student Account'; } catch { return 'Student Account'; } })()}
                    </div>
                    <div className="text-[11px] text-[#E3B8DE] font-sans truncate mt-0.5" title={(() => { try { return JSON.parse(localStorage.getItem('courseUser') || '{}').email || ''; } catch { return ''; } })()}>
                      {(() => { try { return JSON.parse(localStorage.getItem('courseUser') || '{}').email || 'Logged In'; } catch { return 'Logged In'; } })()}
                    </div>
                  </div>

                  <Link
                    to="/my-course"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                    style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                  >
                    <BookOpen size={18} className="text-[#C878BE] shrink-0" />
                    <span>My Course</span>
                  </Link>
                  <Link
                    to="/course/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                    style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                  >
                    <User size={18} className="text-[#C878BE] shrink-0" />
                    <span>Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-5 py-3 text-left text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer bg-transparent border-none outline-none"
                    style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                  >
                    <SignOut size={18} className="text-red-400 shrink-0" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── 2. SUB BAR (Breadcrumb & Progress) ── */}
        <div className="player-sub-bar">
          <div className="player-crumb">
            <Link to="/my-course">
              <ArrowLeft size={16} />
              <span>My Course</span>
            </Link>
            <span>/</span>
            <b>{activeCourse?.title || 'The Better Man'}</b>
          </div>
          <div className="player-subp">
            <span>Lesson {currentLessonIndex + 1} of {totalCount}</span>
            <div className="player-progress-track">
              <i className="player-progress-fill" style={{ width: `${overallPct}%` }} />
            </div>
            <span>{overallPct}%</span>
          </div>
        </div>

        {/* ── 3. MAIN SHELL (STAGE + META + TABS + SIDEBAR) ── */}
        <div className="player-shell">
          {/* Main Stage & Content Area */}
          <main>
            {/* Video Stage */}
            <div className={`player-stage ${demoPlaying ? 'playing' : ''}`}>
              {hasActivePlayableVideo ? (
                <ProtectedYouTubePlayer 
                  key={activeLesson?._id || activeLesson?.id || 'yt_active'}
                  lesson={activeLesson}
                  videoToken={activeLesson?.videoToken || activeLesson?.encryptedVideoToken}
                  videoId={resolvedActiveVid}
                  title={activeLesson?.title}
                />
              ) : hasMux ? (
                <div className="w-full h-full relative group">
                  <MuxPlayer
                    ref={muxPlayerRef}
                    playbackId={activeMuxPlaybackId}
                    metadata={{
                      video_title: activeLesson?.title || 'Lesson Video',
                      player_name: 'Better With Aarkesh Course Player'
                    }}
                    streamType="on-demand"
                    accentColor="#C878BE"
                    startTime={Number(localStorage.getItem(`bwa_lesson_progress_${activeLesson?._id || activeLesson?.id}`)) || 0}
                    onTimeUpdate={(e) => {
                      const t = e.target.currentTime;
                      const dur = e.target.duration;
                      const lesId = activeLesson?._id || activeLesson?.id;
                      if (lesId && t > 2) {
                        if (dur && t >= dur - 5) {
                          localStorage.removeItem(`bwa_lesson_progress_${lesId}`);
                        } else {
                          localStorage.setItem(`bwa_lesson_progress_${lesId}`, Math.floor(t));
                        }
                      }
                    }}
                    onEnded={() => {
                      const lesId = activeLesson?._id || activeLesson?.id;
                      if (lesId) localStorage.removeItem(`bwa_lesson_progress_${lesId}`);
                      toggleLessonCompletionLocal(activeLesson);
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      maxHeight: '100%',
                      maxWidth: '100%',
                      display: 'block'
                    }}
                    className="w-full h-full"
                  />

                  {/* Elegant Resume Prompt Toast */}
                  {resumePrompt && (
                    <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 z-40 bg-[#160B1C]/95 border border-[#C878BE]/50 shadow-2xl backdrop-blur-md rounded-xl p-3 sm:p-4 flex items-center justify-between gap-4 text-white transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#C878BE]/20 border border-[#C878BE]/40 flex items-center justify-center text-[#E090D6] flex-none">
                          <Clock size={18} weight="bold" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[#E090D6] font-semibold uppercase tracking-wider">Resume Playback?</p>
                          <p className="text-xs text-white/80 truncate">
                            You left off at <strong className="text-white font-mono">{resumePrompt.formatted}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-none">
                        <button
                          type="button"
                          onClick={handleResumeClick}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#B8449F] to-[#7D2B8B] hover:brightness-110 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Play size={13} weight="fill" /> Resume
                        </button>
                        <button
                          type="button"
                          onClick={handleStartOverClick}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A99AB0] hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
                          title="Start from beginning"
                        >
                          <ArrowCounterClockwise size={13} /> Restart
                        </button>
                        <button
                          type="button"
                          onClick={() => setResumePrompt(null)}
                          className="p-1.5 text-white/50 hover:text-white rounded-lg transition-colors cursor-pointer"
                          aria-label="Dismiss"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-[#1b0a24] via-[#100617] to-[#0a030f] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(196,91,184,0.18)_0%,transparent_70%)] pointer-events-none" />
                  <div className="relative z-10 max-w-lg space-y-3 flex flex-col items-center justify-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C878BE]/15 border border-[#C878BE]/30 text-[#E090D6] text-xs font-semibold uppercase tracking-wider">
                      <Sparkle size={14} weight="fill" />
                      Day {displayModNum} · Lesson {lessonNumInMod}
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-serif tracking-tight max-w-md">
                      {activeLesson?.title || 'Lesson Overview'}
                    </h2>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Meta Row */}
            <div className="player-meta">
              <div>
                <div className="player-k">
                  Day {displayModNum} · {activeModuleObj?.title || 'Course Curriculum'}
                </div>
                <h1>{activeLesson?.title || 'Lesson Overview'}</h1>
                <div className="player-chips">
                  <span className="player-chip">
                    <Clock size={14} className="text-[#C878BE]" />
                    <span>{activeLesson?.duration || '15:00'}</span>
                  </span>
                  <span className="player-chip">
                    <User size={14} className="text-[#C878BE]" />
                    <span>Aarkesh Gupta</span>
                  </span>
                </div>
              </div>

              <div className="player-acts">
                <button 
                  type="button" 
                  className="player-btn player-ib"
                  aria-label="Previous lesson"
                  disabled={!prevLesson}
                  onClick={() => {
                    if (prevLesson) {
                      handleSelectLesson(prevLesson, prevLesson.module);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <ArrowLeft size={18} weight="bold" />
                </button>

                <button 
                  type="button" 
                  className={`player-btn ${activeLesson?.isCompleted ? 'player-done' : ''}`}
                  onClick={() => toggleLessonCompletionLocal(activeLesson)}
                >
                  <CheckCircle size={16} weight={activeLesson?.isCompleted ? 'fill' : 'regular'} />
                  <span>{activeLesson?.isCompleted ? 'Completed' : 'Mark complete'}</span>
                </button>

                <button 
                  type="button" 
                  className="player-btn player-pri"
                  disabled={!nextLesson}
                  onClick={() => {
                    if (nextLesson) {
                      handleSelectLesson(nextLesson, nextLesson.module);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <span>Next lesson</span>
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="player-kbd">
              <span><kbd>N</kbd> <kbd>P</kbd> next / previous</span>
              <span><kbd>M</kbd> mark complete</span>
              <span><kbd>F</kbd> fullscreen</span>
            </div>

            {/* Discussion & Student Comments */}
            <div className="player-panel" style={{ paddingTop: '28px' }}>
              <LessonComments
                courseSlug={slug || 'better-man'}
                courseTitle={courseData?.title || 'The Better Man'}
                lessonId={activeLesson?._id || activeLesson?.id}
                lessonTitle={activeLesson?.title}
                onRequireAuth={() => {
                  setShowCourseLogin(true);
                  setLoginMode('login');
                }}
              />
            </div>
          </main>

          {/* ── 4. RIGHT SIDEBAR (Curriculum & Sessions) ── */}
          <aside className="player-side" aria-label="Course curriculum">
            {/* Progress Card */}
            <div className="player-card player-prog">
              <div className="t">
                <b>
                  <List size={15} weight="bold" />
                  Curriculum
                </b>
                <span>{completedCount} / {totalCount} completed</span>
              </div>
              <div className="bar">
                <i style={{ width: `${overallPct}%` }} />
              </div>
              <div className="s">
                <span>{overallPct}% complete</span>
                <span>{completedCount === totalCount ? 'All done' : `${remainingCount} lessons left`}</span>
              </div>
            </div>

            {/* Modules Accordion Cards */}
            {curriculumModules.map((module, di) => {
              const modLessons = module.lessons || [];
              const modCompletedCount = modLessons.filter(l => l.isCompleted).length;
              const isOpen = openPlayerModules.includes(di);

              return (
                <div key={module._id || module.id || di} className={`player-card player-day ${isOpen ? 'open' : ''}`}>
                  <button 
                    type="button"
                    className="player-dh"
                    aria-expanded={isOpen}
                    onClick={() => togglePlayerModule(di)}
                  >
                    <div>
                      <div className="k">Day {di + 1}</div>
                      <div className="tt">{module.title}</div>
                    </div>
                    <div className="r">
                      <span>{modCompletedCount}/{modLessons.length}</span>
                      <CaretDown size={18} className="transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="player-ls">
                      {modLessons.map((l, li) => {
                        const isCur = (l._id || l.id)?.toString() === (activeLesson?._id || activeLesson?.id)?.toString();
                        const done = Boolean(l.isCompleted);

                        return (
                          <button
                            key={l._id || l.id || li}
                            type="button"
                            className={`${isCur ? 'cur' : ''} ${done ? 'isdone' : ''}`}
                            onClick={() => {
                              handleSelectLesson(l, module);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <span className={`player-st ${done ? 'done' : isCur ? 'now' : ''}`}>
                              {done ? (
                                <CheckCircle size={13} weight="fill" />
                              ) : isCur ? (
                                <Play size={10} weight="fill" />
                              ) : (
                                li + 1
                              )}
                            </span>
                            <span className="ti">{l.title}</span>
                            <span className="du">{l.duration || '12:00'}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Private Sessions Booking Card (Only shown if student has remaining sessions > 0) */}
            {freeSessionsRemaining > 0 && (
              <div className="player-card player-sess">
                <div>
                  <b>{freeSessionsRemaining} private 1-on-1 {freeSessionsRemaining === 1 ? 'session' : 'sessions'}</b>
                  <span>Included with your course access</span>
                </div>
                <Link to="/book" className="player-btn player-pri player-btn-sm" style={{ textDecoration: 'none' }}>
                  <CalendarPlus size={15} weight="bold" />
                  <span>Schedule</span>
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="course-landing-scope">
      {/* ── Top Fixed Nav ── */}
      <header className="course-nav">
        <Link 
          className="course-logo" 
          to="/"
          onClick={handleExitToMainHome}
        >
          BetterWith<b>Aarkesh</b>
        </Link>
        <nav className="course-nav-center-links">
          <Link 
            to="/course" 
            onClick={handleExitToCourseHome}
            className={`course-nav-link ${location.pathname === '/course' && !searchParams.get('learn') ? 'active' : ''}`}
          >
            <FlippingWordSwap 
              word1="HOME" 
              word2="HOME" 
              active={location.pathname === '/course' && !searchParams.get('learn')} 
              toClassName="text-[#C878BE]"
            />
          </Link>
          <Link 
            to="/course/all" 
            onClick={handleExitToAllCourses}
            className={`course-nav-link ${isAllCoursesPage ? 'active' : ''}`}
          >
            <FlippingWordSwap 
              word1="COURSES" 
              word2="COURSES" 
              active={isAllCoursesPage} 
              toClassName="text-[#C878BE]"
            />
          </Link>
          <a 
            href="/course#faq" 
            onClick={handleExitToFaq}
            className="course-nav-link"
          >
            <FlippingWordSwap 
              word1="FAQ" 
              word2="FAQ" 
              toClassName="text-[#C878BE]"
            />
          </a>
        </nav>
        <div className="nav-r flex items-center gap-2.5 sm:gap-3">
          <Link
            to="/library"
            className="course-nav-library-btn"
            title="Explore Library"
          >
            <Books size={16} weight="bold" />
            <span>LIBRARY</span>
          </Link>

          {isLoggedIn ? (
            <>
              {hasAnyCoursePurchased && (
                <Link
                  to="/my-course"
                  className="course-nav-mycourse-btn"
                  title="My Enrolled Courses"
                >
                  <BookOpen size={16} weight="bold" />
                  <span>MY COURSE</span>
                </Link>
              )}

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="course-profile-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#C878BE]/50 bg-[#120613] flex items-center justify-center text-[#E3B8DE] hover:bg-[#C878BE] hover:text-black transition-all shadow-[0_0_20px_rgba(200,120,190,0.25)] shrink-0 cursor-pointer"
                  title="Student Profile"
                >
                  <User size={17} weight="bold" />
                </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0E0610] shadow-2xl py-2 z-[100] overflow-hidden text-left">
                  {/* User Email & Name Header */}
                  <div className="px-5 py-3 border-b border-white/10 bg-white/[0.03]">
                    <div className="text-xs font-bold text-white truncate">
                      {(() => { try { return JSON.parse(localStorage.getItem('courseUser') || '{}').fullName || 'Student Account'; } catch { return 'Student Account'; } })()}
                    </div>
                    <div className="text-[11px] text-[#E3B8DE] font-sans truncate mt-0.5" title={(() => { try { return JSON.parse(localStorage.getItem('courseUser') || '{}').email || ''; } catch { return ''; } })()}>
                      {(() => { try { return JSON.parse(localStorage.getItem('courseUser') || '{}').email || 'Logged In'; } catch { return 'Logged In'; } })()}
                    </div>
                  </div>

                  <Link
                    to="/library"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                    style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                  >
                    <Books size={18} className="text-[#C878BE] shrink-0" />
                    <span>Library</span>
                  </Link>
                  <Link
                    to="/my-course"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                    style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                  >
                    <BookOpen size={18} className="text-[#C878BE] shrink-0" />
                    <span>My Course</span>
                  </Link>
                  <Link
                    to="/course/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                    style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                  >
                    <User size={18} className="text-[#C878BE] shrink-0" />
                    <span>Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-5 py-3 text-left text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer bg-transparent border-none outline-none"
                    style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                  >
                    <SignOut size={18} className="text-red-400 shrink-0" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
            </>
          ) : (
            <button
              type="button"
              className="sign-in-btn"
              onClick={() => {
                setLoginMode('login');
                setShowCourseLogin(true);
              }}
            >
              SIGN IN
            </button>
          )}
        </div>
      </header>

      <main id="top">
        {isAllCoursesPage ? (
          /* ═══════════════════════════════════════════════════════════════
             DEDICATED ALL MASTERCLASSES VIEW / CATALOG (/course/all or /courses)
             ═══════════════════════════════════════════════════════════════ */
          <section className="all-courses-sec">
            <div className="wrap">
              <button
                type="button"
                className="back-link"
                style={{ fontSize: landingSettings?.allCoursesPage?.buttonSize ? `${landingSettings.allCoursesPage.buttonSize}px` : undefined }}
                onClick={() => {
                  navigate('/course');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {landingSettings?.allCoursesPage?.backBtnText || '← Back to overview'}
              </button>

              <div className="all-courses-hero">
                <span className="tag" style={{ fontSize: landingSettings?.allCoursesPage?.tagSize ? `${landingSettings.allCoursesPage.tagSize}px` : undefined }}>{renderCourseHeadline(landingSettings?.allCoursesPage?.tag || 'ALL PROGRAMS')}</span>
                <h1 style={{ fontSize: landingSettings?.allCoursesPage?.headingSize ? `${landingSettings.allCoursesPage.headingSize}px` : undefined }}>{renderCourseHeadline(landingSettings?.allCoursesPage?.heading || 'All Masterclasses & Programs')}</h1>
                <p className="sub" style={{ fontSize: landingSettings?.allCoursesPage?.subheadingSize ? `${landingSettings.allCoursesPage.subheadingSize}px` : undefined }}>
                  {landingSettings?.allCoursesPage?.subheading || 'Each masterclass is an intensive, transformative curriculum paired with private 1-on-1 mentorship sessions with Aarkesh.'}
                </p>
              </div>

              <div className={`all-courses-grid ${coursesList.length === 1 ? 'single-course-centered' : ''}`}>
                {coursesList.map((c, i) => {
                  const themeCls = getCardThemeClass(c, i);
                  const bannerCls = getBannerCls(c);
                  return (
                    <article className={`all-course-card ${themeCls}`} key={c.n || c.slug}>
                      {/* Thumbnail Banner */}
                      <div className={`vis ${bannerCls}`} aria-hidden="true" style={(c.thumbnailUrl || c.imageUrl) ? { padding: 0, overflow: 'hidden' } : {}}>
                        <div className="vis-badge-top">
                          {c.soon ? (
                            <span className="live-status-badge soon">Coming soon</span>
                          ) : (
                            <span className="live-status-badge live"><span className="pulse-dot"></span> Live</span>
                          )}
                        </div>
                        {(c.thumbnailUrl || c.imageUrl) ? (
                          <img 
                            src={resolveImageUrl(c.thumbnailUrl || c.imageUrl)} 
                            alt={c.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <>
                            <span className="no">{c.n}</span>
                            <i>{c.chips?.[0]}</i>
                            <i>{c.chips?.[1]}</i>
                          </>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="all-course-card-content">
                        {/* Title */}
                        <h3 className="card-course-title">{c.title}</h3>

                        {/* Price Row */}
                        <div className="card-price-row">
                          <div className="price-label">
                            Price <b>{c.price}</b> <s>{c.was}</s>
                          </div>
                        </div>

                        {/* Action CTA Button */}
                        <button
                          type="button"
                          className="card-cta-btn"
                          onClick={() => handleSelectCourse(c)}
                        >
                          Check Course <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : !isDetailPage ? (
          /* ═══════════════════════════════════════════════════════════════
             MAIN COURSES LISTING PAGE (/course)
             ═══════════════════════════════════════════════════════════════ */
          <>
            {/* ── Hero Section ── */}
            <section 
              className="hero"
              style={landingSettings?.hero?.bgImageUrl ? { 
                backgroundImage: `url(${landingSettings.hero.bgImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : {}}
            >
              <div className="wrap">
                <p 
                  className="tag"
                  style={{ fontSize: landingSettings?.hero?.tagSize ? `${landingSettings.hero.tagSize}px` : undefined }}
                >
                  {landingSettings?.hero?.tag || 'Learn. Practise. Lead.'}
                </p>
                <h1
                  style={{ fontSize: landingSettings?.hero?.headingSize ? `${landingSettings.hero.headingSize}px` : undefined }}
                >
                  {renderCourseHeadline(
                    landingSettings?.hero?.heading ||
                    (landingSettings?.hero?.headingPrefix
                      ? `${landingSettings.hero.headingPrefix} *${landingSettings.hero.headingSelected || 'BETTER'}* ${landingSettings.hero.headingSuffix || 'MAN'}`
                      : 'THE *BETTER* MAN')
                  )}
                </h1>
                <p 
                  className="sub"
                  style={{ fontSize: landingSettings?.hero?.subheadingSize ? `${landingSettings.hero.subheadingSize}px` : undefined }}
                >
                  {landingSettings?.hero?.subheading || 'Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh.'}
                </p>
                <div 
                  className="proof"
                  style={{ fontSize: landingSettings?.hero?.proofSize ? `${landingSettings.hero.proofSize}px` : undefined }}
                >
                  <span><b>{landingSettings?.hero?.proof1Bold || '3 private'}</b> {landingSettings?.hero?.proof1Text || '1-on-1 sessions with Aarkesh'}</span>
                  <span><b>{landingSettings?.hero?.proof2Bold || 'Lifetime'}</b> {landingSettings?.hero?.proof2Text || 'access, no recurring charges'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  {hasAnyCoursePurchased ? (
                    <button 
                      type="button" 
                      className="btn" 
                      onClick={() => navigate('/my-course')}
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
                        fontSize: landingSettings?.hero?.buttonSize ? `${landingSettings.hero.buttonSize}px` : undefined 
                      }}
                    >
                      <BookOpen size={20} weight="fill" />
                      <span>My Course</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  ) : isLoggedIn ? (
                    <button 
                      type="button" 
                      className="btn" 
                      onClick={() => {
                        const link = landingSettings?.hero?.secondaryBtnLink || '/course/better-man';
                        if (link.startsWith('#')) {
                          const el = document.querySelector(link);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        } else if (link.startsWith('http://') || link.startsWith('https://')) {
                          window.location.href = link;
                        } else {
                          const targetPath = link.startsWith('/') ? link : `/course/${link}`;
                          navigate(targetPath);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      style={{ fontSize: landingSettings?.hero?.buttonSize ? `${landingSettings.hero.buttonSize}px` : undefined }}
                    >
                      {landingSettings?.hero?.secondaryBtnText || 'Check Course'} <span aria-hidden="true">→</span>
                    </button>
                  ) : (
                    <>
                      {landingSettings?.hero?.showPrimaryBtn !== false && (
                        <button 
                          type="button" 
                          className="btn" 
                          onClick={handleEnroll}
                          style={{ fontSize: landingSettings?.hero?.buttonSize ? `${landingSettings.hero.buttonSize}px` : undefined }}
                        >
                          {landingSettings?.hero?.primaryBtnText || 'Register Now'} <span aria-hidden="true">→</span>
                        </button>
                      )}
                      {landingSettings?.hero?.showSecondaryBtn !== false && (
                        <button 
                          type="button" 
                          className="btn line" 
                          onClick={() => {
                            const link = landingSettings?.hero?.secondaryBtnLink || '/course/better-man';
                            if (link.startsWith('#')) {
                              const el = document.querySelector(link);
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            } else if (link.startsWith('http://') || link.startsWith('https://')) {
                              window.location.href = link;
                            } else {
                              const targetPath = link.startsWith('/') ? link : `/course/${link}`;
                              navigate(targetPath);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(200, 120, 190, 0.4)',
                            color: '#FFFFFF',
                            fontSize: landingSettings?.hero?.buttonSize ? `${landingSettings.hero.buttonSize}px` : undefined
                          }}
                        >
                          {landingSettings?.hero?.secondaryBtnText || 'Check Course'} <span aria-hidden="true">→</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* ── More Masterclasses Stacked Section (Directly Below Hero Section) ── */}
            <section className="stack-sec" id="courses">
              <div className="stack">
                {landingSettings?.moreCourses?.eyebrowText && (
                  <p 
                    className="tag" 
                    style={{ 
                      textAlign: 'center', 
                      marginBottom: '8px',
                      fontSize: landingSettings?.moreCourses?.eyebrowSize ? `${landingSettings.moreCourses.eyebrowSize}px` : undefined 
                    }}
                  >
                    {renderCourseHeadline(landingSettings.moreCourses.eyebrowText)}
                  </p>
                )}
                <h2
                  style={{ fontSize: landingSettings?.moreCourses?.headingSize ? `${landingSettings.moreCourses.headingSize}px` : undefined }}
                >
                  {renderCourseHeadline(landingSettings?.moreCourses?.heading || 'More Masterclasses')}
                </h2>
                <p 
                  className="lead"
                  style={{ fontSize: landingSettings?.moreCourses?.subheadingSize ? `${landingSettings.moreCourses.subheadingSize}px` : undefined }}
                >
                  {landingSettings?.moreCourses?.subheading || 'Each one is a standalone course with its own private sessions.'}
                </p>
                <div className={`all-courses-grid ${coursesList.slice(0, 3).length === 1 ? 'single-course-centered' : ''}`}>
                  {coursesList.slice(0, 3).map((c, i) => {
                    const themeCls = getCardThemeClass(c, i);
                    const bannerCls = getBannerCls(c);
                    return (
                      <article className={`all-course-card ${themeCls}`} key={c.n || c.slug}>
                        {/* Thumbnail Banner */}
                        <div className={`vis ${bannerCls}`} aria-hidden="true" style={(c.thumbnailUrl || c.imageUrl) ? { padding: 0, overflow: 'hidden' } : {}}>
                          <div className="vis-badge-top">
                            {c.soon ? (
                              <span className="live-status-badge soon">Coming soon</span>
                            ) : (
                              <span className="live-status-badge live"><span className="pulse-dot"></span> Live</span>
                            )}
                          </div>
                          {(c.thumbnailUrl || c.imageUrl) ? (
                            <img 
                              src={resolveImageUrl(c.thumbnailUrl || c.imageUrl)} 
                              alt={c.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            <>
                              <span className="no">{c.n}</span>
                              <i>{c.chips?.[0]}</i>
                              <i>{c.chips?.[1]}</i>
                            </>
                          )}
                        </div>

                        {/* Content Body */}
                        <div className="all-course-card-content">
                          {/* Title */}
                          <h3 className="card-course-title">{c.title}</h3>

                          {/* Price Row */}
                          <div className="card-price-row">
                            <div className="price-label">
                              Price <b>{c.price}</b> <s>{c.was}</s>
                            </div>
                          </div>

                          {/* Action CTA Button */}
                          <button
                            type="button"
                            className="card-cta-btn"
                            onClick={() => handleSelectCourse(c)}
                          >
                            Check Course <span aria-hidden="true">→</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* ── View All Masterclasses Action Button ── */}
                {landingSettings?.moreCourses?.showViewAllBtn !== false && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
                    <button
                      type="button"
                      className="btn dark"
                      onClick={() => {
                        const link = landingSettings?.moreCourses?.viewAllBtnLink || '/course/all';
                        navigate(link);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '16px 38px',
                        fontSize: '15px',
                        fontWeight: '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        borderRadius: '999px',
                        background: '#0E0C0B',
                        color: '#ffffff',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                        cursor: 'pointer',
                        fontSize: landingSettings?.moreCourses?.buttonSize ? `${landingSettings.moreCourses.buttonSize}px` : undefined,
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 14px 36px rgba(0, 0, 0, 0.28)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                      }}
                    >
                      {landingSettings?.moreCourses?.viewAllBtnText || 'View All Masterclasses'} <ArrowRight size={18} weight="bold" />
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* ── FAQ Section ── */}
            <section className="faq center" id="faq">
              <div className="wrap">
                <span 
                  className="label"
                  style={{ fontSize: landingSettings?.faq?.tagSize ? `${landingSettings.faq.tagSize}px` : undefined }}
                >
                  {landingSettings?.faq?.tag?.replace(/\*/g, '') || 'FAQS'}
                </span>
                <h2
                  style={{ fontSize: landingSettings?.faq?.headingSize ? `${landingSettings.faq.headingSize}px` : undefined }}
                >
                  {renderCourseHeadline(landingSettings?.faq?.heading || 'Frequently Asked Questions From Our Students')}
                </h2>
                <p 
                  className="lead"
                  style={{ fontSize: landingSettings?.faq?.subheadingSize ? `${landingSettings.faq.subheadingSize}px` : undefined }}
                >
                  {landingSettings?.faq?.subheading || 'Clear answers about the masterclass, private mentorship, and enrollment.'}
                </p>

                <div className="acc">
                  {((landingSettings?.faq?.items && Array.isArray(landingSettings.faq.items) && landingSettings.faq.items.length > 0)
                    ? landingSettings.faq.items
                    : (courseFaqs && courseFaqs.length > 0 ? courseFaqs : [
                        { question: 'How long do I have access to the course materials?', answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.' },
                        { question: `How do the ${activeCourseDynamicFreeCount > 0 ? `${activeCourseDynamicFreeCount} ` : ''}private 1-on-1 sessions work?`, answer: 'Immediately after enrollment, you gain access to Aarkesh\'s private booking calendar. You can schedule each 1-on-1 session at dates and times that suit your schedule.' },
                        { question: 'Is this course suitable for professionals and introverts?', answer: 'Yes. The curriculum is specifically designed for professionals, entrepreneurs, and introverts who want to develop natural, calm authority without acting loud or fake.' },
                        { question: 'Is there a certificate provided upon completion?', answer: 'Yes. Upon completing all modules and your private sessions, you will receive an official Certificate of Completion signed by Aarkesh.' }
                      ])
                  ).map((f, idx) => (
                    <details className="a" key={idx} open={idx === 0}>
                      <summary>
                        <span 
                          className="t font-serif"
                          style={{ fontSize: landingSettings?.faq?.questionSize ? `${landingSettings.faq.questionSize}px` : undefined }}
                        >
                          {f.question || f.q}
                        </span>
                        <div className="faq-caret-circle">
                          <CaretDown size={17} weight="bold" />
                        </div>
                      </summary>
                      <div className="faq-answer-wrap">
                        <p
                          style={{ fontSize: landingSettings?.faq?.answerSize ? `${landingSettings.faq.answerSize}px` : undefined }}
                        >
                          {f.answer || f.a}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Final Call to Action ── */}
            <section className="cta center">
              <div className="wrap">
                <div className="cta-box">
                  <span 
                    className="label" 
                    style={{ 
                      marginBottom: '16px',
                      fontSize: landingSettings?.cta?.labelSize ? `${landingSettings.cta.labelSize}px` : undefined 
                    }}
                  >
                    {renderCourseHeadline(landingSettings?.cta?.label || 'ENROLL TODAY')}
                  </span>
                  <h2
                    style={{ fontSize: landingSettings?.cta?.headingSize ? `${landingSettings.cta.headingSize}px` : undefined }}
                  >
                    {renderCourseHeadline(landingSettings?.cta?.heading || 'Ready To Become The Man People Trust?')}
                  </h2>
                  <p 
                    className="lead"
                    style={{ fontSize: landingSettings?.cta?.descriptionSize ? `${landingSettings.cta.descriptionSize}px` : undefined }}
                  >
                    {landingSettings?.cta?.description || 'Master the psychology of calm authority, magnetic communication and effortless self-command with lifetime curriculum access and private 1-on-1 coaching sessions.'}
                  </p>
                  <div className="cta-badges">
                    {landingSettings?.cta?.badge1 && (
                      <span
                        style={{ fontSize: landingSettings?.cta?.badgeSize ? `${landingSettings.cta.badgeSize}px` : undefined }}
                      >
                        <Users size={16} weight="fill" /> {landingSettings.cta.badge1}
                      </span>
                    )}
                    {landingSettings?.cta?.badge2 && (
                      <span
                        style={{ fontSize: landingSettings?.cta?.badgeSize ? `${landingSettings.cta.badgeSize}px` : undefined }}
                      >
                        <Clock size={16} weight="fill" /> {landingSettings.cta.badge2}
                      </span>
                    )}
                  </div>
                  <div>
                    {hasAnyCoursePurchased ? (
                      <button 
                        type="button" 
                        className="btn" 
                        onClick={() => navigate('/my-course')}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '8px',
                          fontSize: landingSettings?.cta?.buttonSize ? `${landingSettings.cta.buttonSize}px` : undefined 
                        }}
                      >
                        <BookOpen size={20} weight="fill" />
                        <span>My Course</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    ) : isLoggedIn ? (
                      <button 
                        type="button" 
                        className="btn" 
                        onClick={() => {
                          navigate('/course/all');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{ fontSize: landingSettings?.cta?.buttonSize ? `${landingSettings.cta.buttonSize}px` : undefined }}
                      >
                        {landingSettings?.cta?.exploreBtnText || 'Explore Courses'} <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="btn" 
                        onClick={handleEnroll}
                        style={{ fontSize: landingSettings?.cta?.buttonSize ? `${landingSettings.cta.buttonSize}px` : undefined }}
                      >
                        {landingSettings?.cta?.primaryBtnText || 'Register Now'} <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* ═══════════════════════════════════════════════════════════════
             DEDICATED SINGLE-PAGE COURSE DETAILS VIEW (/course/:slug)
             ═══════════════════════════════════════════════════════════════ */
          <>
            <section className={`d-top ${detailThemeClass}`} id="course-detail">
              <div className="wrap">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/course');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="back-link"
                >
                  ← Back to all courses
                </button>

                <div className="d-grid">
                  {/* Left Column: Preview Canvas & Title */}
                  <div>
                    <div 
                      className={`pv ${getBannerCls(activeCourse)} group select-none relative`} 
                      style={{
                        padding: 0,
                        overflow: 'hidden',
                        aspectRatio: '16/10',
                        borderRadius: '20px',
                        background: '#000000',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
                      }}
                    >
                      {isPlayingInlineTrailer ? (
                        /* ── INLINE VIDEO PLAYER (SHORT/COMPACT HERO BOX) ── */
                        <div className="w-full h-full relative bg-black flex items-center justify-center">
                          {(() => {
                            const rawTrailer = activeCourse?.trailer ||
                                              activeCourse?.trailerVideo ||
                                              activeCourse?.heroSection?.trailerVideo ||
                                              activeCourse?.trailerMuxPlaybackId || 
                                              activeCourse?.muxPlaybackId ||
                                              activeCourse?.trailerVideoUrl || 
                                              activeCourse?.previewVideoUrl || 
                                              activeCourse?.videoUrl ||
                                              activeCourse?.youtubeUrl || 
                                              activeCourse?.videoModules?.[0]?.lessons?.[0]?.muxPlaybackId || 
                                              activeCourse?.videoModules?.[0]?.lessons?.[0]?.youtubeUrl || 
                                              activeCourse?.videoModules?.[0]?.lessons?.[0]?.videoUrl || 
                                              '';
                            const muxId = extractMuxPlaybackId(rawTrailer) || 
                                          extractMuxPlaybackId(activeCourse?.trailerVideo) ||
                                          extractMuxPlaybackId(activeCourse?.heroSection?.trailerVideo) ||
                                          extractMuxPlaybackId(activeCourse?.trailer) ||
                                          activeCourse?.trailerMuxPlaybackId || 
                                          activeCourse?.muxPlaybackId || 
                                          activeCourse?.videoModules?.[0]?.lessons?.[0]?.muxPlaybackId;
                            const ytId = extractYoutubeVideoId(rawTrailer);

                            if (muxId) {
                              return (
                                <iframe
                                  src={`https://player.mux.com/${muxId}?accentColor=C878BE&autoplay=1`}
                                  title={activeCourse?.title || 'Course Preview Trailer'}
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                  allowFullScreen
                                />
                              );
                            }

                            if (ytId) {
                              return (
                                <iframe
                                  src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                                  title={activeCourse?.title || 'Course Preview'}
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                  allowFullScreen
                                />
                              );
                            }

                            if (rawTrailer && !rawTrailer.startsWith('data:') && !rawTrailer.startsWith('blob:') && rawTrailer.includes('/')) {
                              return (
                                <video
                                  src={resolveImageUrl(rawTrailer)}
                                  controls
                                  autoPlay
                                  className="w-full h-full object-contain"
                                />
                              );
                            }

                            return (
                              <div className="text-center p-6 space-y-2">
                                <VideoCamera size={36} className="text-white/40 mx-auto" />
                                <p className="text-white text-xs font-medium">Trailer Video Coming Soon</p>
                                <button 
                                  type="button" 
                                  onClick={() => setIsPlayingInlineTrailer(false)}
                                  className="text-[10px] text-[#ff8059] underline cursor-pointer"
                                >
                                  Back to Thumbnail
                                </button>
                              </div>
                            );
                          })()}

                          {/* Top-Right Close Button */}
                          <div className="absolute top-2.5 right-2.5 z-30">
                            <button
                              type="button"
                              onClick={() => setIsPlayingInlineTrailer(false)}
                              className="w-7 h-7 rounded-full bg-black/80 hover:bg-black text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-xl"
                              title="Close video"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── THUMBNAIL / GRAPHIC WITH GLOWING CENTER PLAY BUTTON ── */
                        <div 
                          className="w-full h-full relative cursor-pointer flex items-center justify-center"
                          onClick={() => setIsPlayingInlineTrailer(true)}
                          title="Click to play preview video"
                        >
                          {(activeCourse.thumbnailUrl || activeCourse.imageUrl) ? (
                            <img 
                              src={resolveImageUrl(activeCourse.thumbnailUrl || activeCourse.imageUrl)} 
                              alt={activeCourse.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            <>
                              <span className="big">{activeCourse.n || '01'}</span>
                              <i>{activeCourse.chips?.[0]}</i>
                              <i>{activeCourse.chips?.[1]}</i>
                            </>
                          )}

                          {/* Top Right Live / Coming Soon Status Pill */}
                          <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-20 pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] sm:text-[11px] font-semibold backdrop-blur-md">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              {activeCourse.soon ? 'Coming soon' : 'Live now'}
                            </span>
                          </div>

                          {/* Glowing Centered Play Button */}
                          <div className="pv-center-btn" title="Click to play video">
                            <Play size={24} weight="fill" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="dtitle">
                      <h1>{activeCourse.title}</h1>
                      <span className={`sticker ${activeCourse.soon ? 'soon' : ''}`}>
                        {activeCourse.soon ? 'Coming soon' : 'Live now'}
                      </span>
                    </div>
                    <p className="dlede">{activeCourse.lede || activeCourse.d}</p>
                  </div>

                  {/* Right Column: Sidebar Card */}
                  <aside className="side" aria-label="Course summary">
                    {/* Key Highlights */}
                    {(activeCourse.hl || []).map((h, idx) => (
                      <p className="hl" key={idx}>
                        <span>
                          <b>{h?.[0]}</b> {h?.[1]}
                        </span>
                      </p>
                    ))}

                    {/* Divider */}
                    <div className="div-divider">What's inside</div>

                    {/* Feature Checklist */}
                    <ul className="ck">
                      {(activeCourse.inside || []).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>

                    {/* Pricing */}
                    <p className="sprice">
                      Price <b>₹{activeCourseBasePrice.toLocaleString('en-IN')}</b>
                      {activeCourseComparePrice > activeCourseBasePrice && (
                        <s>₹{activeCourseComparePrice.toLocaleString('en-IN')}</s>
                      )}
                      <small>
                        {currentGstRate <= 0
                          ? ''
                          : currentIsGstIncluded
                          ? '(incl. GST)'
                          : '(+GST)'}
                      </small>
                    </p>

                    {/* Action Buttons */}
                    {activeCourse.soon ? (
                      <button
                        type="button"
                        disabled
                        className="btn block btn-coming-soon select-none"
                      >
                        Coming Soon
                      </button>
                    ) : isThisCoursePurchased ? (
                      <button
                        type="button"
                        className="btn block"
                        onClick={() => navigate('/my-course')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <BookOpen size={20} weight="fill" />
                        <span>My Course</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn block"
                        onClick={handleEnroll}
                      >
                        {isLoggedIn ? 'Enroll Now' : 'Register Now'} <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </aside>
                </div>
              </div>
            </section>

            {/* ── Curriculum Syllabus Section on Detail Page (Scroll to view) ── */}
            <section className={`detail-syllabus-sec ${detailThemeClass}`} id="detail-syllabus">
              <div className="wrap">
                <div className="syllabus-head">
                  <span className="syllabus-tag sel">SYLLABUS</span>
                  <h2 className="syllabus-title">{activeCourse.syllabusTitle || `${activeCourse.title} Curriculum`}</h2>
                </div>

                <div className="syllabus-points-grid">
                  {(activeCourse.syllabus || []).map((m, idx) => (
                    <div className="syllabus-point-card" key={m.n || idx}>
                      <div className="point-num">{m.n || String(idx + 1).padStart(2, '0')}</div>
                      <div className="point-body">
                        <h4 className="point-title">{m.t || m.title}</h4>
                        <p className="point-desc">{m.d || m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Editorial Writeup Section for Detail Page (Below Syllabus) ── */}
            {activeCourse.writeup && (
              <section className={`detail-writeup-sec ${detailThemeClass}`} id="detail-writeup">
                <div className="wrap">
                  <div className="writeup-card">
                    <article className="writeup-prose">
                      <div className="writeup-header">
                        <span className="writeup-tag sel">{activeCourse.writeup.chip}</span>
                        <h2 className="writeup-title">{activeCourse.writeup.h1}</h2>
                        <p className="writeup-lede">
                          {activeCourse.writeup.lede}
                        </p>
                      </div>

                      <div className="writeup-body">
                        <p>{activeCourse.writeup.p1}</p>

                        <div className="writeup-quote-box">
                          <Quotes size={36} weight="fill" className="quote-icon" />
                          <blockquote>"{activeCourse.writeup.quote}"</blockquote>
                        </div>

                        <p>{activeCourse.writeup.p2}</p>

                        <div className="writeup-distinction">
                          <span className="distinction-badge">Key Distinction</span>
                          <p className="distinction-text">{activeCourse.writeup.distinction}</p>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Syllabus Modal */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#0c0a0e] border border-[#5A2C55] rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl">
            <button 
              type="button"
              onClick={() => setShowSyllabusModal(false)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Close syllabus"
            >
              <X size={16} />
            </button>
            <span className="label" style={{ marginBottom: '12px' }}>SYLLABUS</span>
            <h3 className="font-head text-2xl font-bold text-white mb-2">{activeCourse.title} Curriculum</h3>
            <p className="text-sm text-white/60 mb-6 font-body">Structured modules and deep-dive lessons included in this masterclass.</p>
            <div className="acc">
              {curriculumCards.map((card, idx) => (
                <details className="a" key={idx} open={idx === 0}>
                  <summary>
                    <span className="n">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="t">{card.title}</span>
                  </summary>
                  <p>{card.description}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODALS ──────────────────────────────────────────────── */}

      {/* Complete Your Purchase Checkout Modal (Theme-Adapted & Sheryians-Style Layout) */}
      {showPricingModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl overflow-y-auto overscroll-contain p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          {/* Dynamic Background Glow */}
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none"
            style={{ background: activeTheme.accentGlow }}
          />

          {/* Top Header Text */}
          <div className="relative z-10 text-center mb-4 sm:mb-6">
            <h2 
              className="text-2xl sm:text-4xl font-bold text-white tracking-tight"
              style={{ fontFamily: 'var(--head)' }}
            >
              Complete Your <span style={{ color: activeTheme.accent }}>Purchase</span>
            </h2>
          </div>

          {/* Main Container Card */}
          <div 
            className={`relative w-full max-w-4xl rounded-3xl border ${activeTheme.border} ${activeTheme.outerBg} shadow-[0_30px_100px_rgba(0,0,0,0.95)] p-6 sm:p-8 md:p-10 my-auto text-left`}
          >
            {/* Top Close Button */}
            <button 
              type="button"
              onClick={() => setShowPricingModal(false)} 
              className="absolute right-4 top-4 sm:right-6 sm:top-6 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Close modal"
            >
              <X size={17} />
            </button>

            {/* Grid: 2 Columns (Your Course on Left, Payment Details on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              
              {/* LEFT COLUMN: Your Course */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight">
                  Your Course
                </h3>

                {/* Course Display: Dummy Visual Graphic Card + Info */}
                <div className="flex flex-col gap-4">
                  {/* Dummy Graphic Card Mockup or Custom Uploaded Thumbnail */}
                  <div 
                    className="w-full aspect-[16/10] sm:aspect-[16/10.5] rounded-2xl overflow-hidden border border-white/15 relative shadow-2xl flex items-center justify-center select-none bg-black"
                    style={{
                      background: (activeCourse?.thumbnailUrl || activeCourse?.imageUrl) 
                        ? '#0a050b'
                        : activeCourse?.slug === 'difficult-people'
                        ? 'radial-gradient(circle at 35% 25%, #2a2a2a 0%, #141414 55%, #050505 100%)'
                        : activeCourse?.slug === 'decisions'
                        ? 'radial-gradient(circle at 35% 25%, #3d246c 0%, #1d1038 55%, #080312 100%)'
                        : 'radial-gradient(circle at 35% 25%, #6A1B60 0%, #300E32 55%, #0C040E 100%)'
                    }}
                  >
                    {/* Top Right Live Badge */}
                    <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-20">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] sm:text-[11px] font-semibold backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live now
                      </span>
                    </div>

                    {(activeCourse?.thumbnailUrl || activeCourse?.imageUrl) ? (
                      <img 
                        src={resolveImageUrl(activeCourse?.thumbnailUrl || activeCourse?.imageUrl)} 
                        alt={activeCourse.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        {/* Big Center Number */}
                        <span 
                          className="text-white font-extrabold tracking-tighter"
                          style={{ 
                            fontFamily: 'var(--head)',
                            fontSize: 'clamp(4.5rem, 9vw, 6.8rem)',
                            lineHeight: 1,
                            textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                          }}
                        >
                          {activeCourse?.n || '01'}
                        </span>

                        {/* Top Right Rotated Pill */}
                        <span 
                          className="absolute right-2.5 top-[20%] -rotate-12 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold text-white shadow-xl pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, #C878BE, #7A2A70)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            fontFamily: 'var(--head)'
                          }}
                        >
                          {activeCourse?.chips?.[0] || 'Calm Authority'}
                        </span>

                        {/* Bottom Left Rotated Pill */}
                        <span 
                          className="absolute left-2.5 bottom-[18%] rotate-6 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold text-white shadow-xl pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, #8A6BFF, #3A2A86)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            fontFamily: 'var(--head)'
                          }}
                        >
                          {activeCourse?.chips?.[1] || 'Self-Command'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title & Pricing */}
                  <div className="mt-1">
                    <h4 
                      className="text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight mb-1.5"
                      style={{ fontFamily: 'var(--head)' }}
                    >
                      {activeCourse.title}
                    </h4>

                    <div className="flex items-baseline gap-2.5">
                      <span className="font-sans text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        ₹{finalPayable.toLocaleString('en-IN')}
                      </span>
                      {activeCourseComparePrice > activeCourseBasePrice && (
                        <span className="font-sans text-sm text-white/40 line-through">
                          Rs.{activeCourseComparePrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Payment Details */}
              <div className="lg:col-span-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight">
                  Payment Details
                </h3>

                <div className={`rounded-2xl border border-white/10 ${activeTheme.cardBg} p-5 sm:p-6 shadow-xl`}>
                  <div className="space-y-3.5 text-xs sm:text-sm font-sans">
                    
                    {/* Base Price */}
                    <div className="flex items-center justify-between text-white/70">
                      <span>Base Price</span>
                      <span className="font-semibold text-white">₹{baseBeforeGst.toLocaleString('en-IN')}</span>
                    </div>

                    {/* GST */}
                    {currentGstRate > 0 && (
                      <div className="flex items-center justify-between text-white/70">
                        <span>GST({currentGstRate}%)</span>
                        <span className="font-semibold text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-white/10 pt-3 my-2" />

                    {/* Total Amount */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm sm:text-base text-white">Total Amount</span>
                      <span 
                        className="font-extrabold text-xl sm:text-2xl tracking-tight"
                        style={{ color: activeTheme.accentLight }}
                      >
                        ₹{finalPayable.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>


                  {/* T&C Agreement Checkbox */}
                  <div className="mt-5 mb-1">
                    <div className="flex items-start gap-2.5 select-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCheckoutAgreed((prev) => !prev);
                        }}
                        className="w-4 h-4 mt-0.5 shrink-0 rounded border flex items-center justify-center cursor-pointer transition-all focus:outline-none"
                        style={{
                          background: checkoutAgreed ? (activeTheme.accent || '#C878BE') : 'transparent',
                          borderColor: checkoutAgreed ? (activeTheme.accent || '#C878BE') : 'rgba(255,255,255,0.25)',
                          boxShadow: checkoutAgreed ? `0 0 8px ${activeTheme.accent || '#C878BE'}60` : 'none'
                        }}
                        title="Agree to Terms"
                      >
                        {checkoutAgreed && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>

                      <div className="font-sans text-xs text-white/65 leading-relaxed">
                        <span 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCheckoutAgreed((prev) => !prev);
                          }}
                          className="cursor-pointer hover:text-white/85 transition-colors"
                        >
                          I agree to the{' '}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const termsDoc = courseDocuments?.find(d =>
                              (d.slug && (d.slug.toLowerCase().includes('term') || d.slug.toLowerCase().includes('condition'))) ||
                              (d.title && (d.title.toLowerCase().includes('term') || d.title.toLowerCase().includes('condition')))
                            );
                            setActivePolicySlug(termsDoc?.slug || 'course-terms-and-conditions');
                          }}
                          className="font-semibold underline underline-offset-2 inline cursor-pointer transition-colors hover:brightness-125"
                          style={{ color: activeTheme.accentLight || '#E3B8DE' }}
                        >
                          Terms &amp; Conditions
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Error message if any */}
                  {error && (
                    <div className="text-white/70 font-sans text-xs mt-3 text-center bg-white/5 border border-white/15 rounded-xl p-2.5">
                      {error}
                    </div>
                  )}

                  {/* Proceed to checkout CTA Button */}
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={isLoading || !checkoutAgreed}
                    className={`w-full mt-4 rounded-xl ${activeTheme.buttonBg} hover:brightness-110 active:scale-[0.99] text-white py-4 font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-all shadow-[0_0_30px_rgba(200,120,190,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>PROCESSING...</span>
                      </>
                    ) : (
                      <span>Proceed to checkout • ₹{finalPayable.toLocaleString('en-IN')}</span>
                    )}
                  </button>

                  {/* Security Notice */}
                  <div className="flex items-center justify-center gap-3 text-[10px] text-white/50 mt-3 font-sans">
                    <div className="flex items-center gap-1">
                      <LockKey size={12} className="text-white/60" />
                      <span>256-Bit SSL Encrypted</span>
                    </div>
                    <span>•</span>
                    <span>Instant Lifetime Access</span>
                  </div>


                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── COURSE TRAILER / FREE PREVIEW VIDEO MODAL ── */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200" style={{ zIndex: 9999 }}>
          <div className="relative w-full max-w-4xl bg-[#110912] border border-white/20 rounded-3xl overflow-hidden shadow-2xl shadow-black flex flex-col max-h-[92vh]">
            {/* Top Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#c9542f]/20 border border-[#c9542f]/40 flex items-center justify-center text-[#ff8059]">
                  <Play size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {activeCourse?.title || 'Masterclass'} • Free Course Preview
                  </h3>
                  <p className="text-[11px] text-white/50">Watch the introductory trailer and overview</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTrailerModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close preview"
              >
                <X size={16} />
              </button>
            </div>

            {/* 16:9 Video Canvas */}
            <div className="w-full aspect-video bg-black relative flex items-center justify-center">
              {(() => {
                const rawTrailer = activeCourse?.trailer ||
                                  activeCourse?.trailerVideo ||
                                  activeCourse?.heroSection?.trailerVideo ||
                                  activeCourse?.trailerMuxPlaybackId || 
                                  activeCourse?.muxPlaybackId || 
                                  activeCourse?.trailerVideoUrl || 
                                  activeCourse?.previewVideoUrl || 
                                  activeCourse?.videoUrl || 
                                  activeCourse?.youtubeUrl || 
                                  activeCourse?.videoModules?.[0]?.lessons?.[0]?.muxPlaybackId || 
                                  activeCourse?.videoModules?.[0]?.lessons?.[0]?.youtubeUrl || 
                                  activeCourse?.videoModules?.[0]?.lessons?.[0]?.videoUrl || 
                                  '';
                const muxId = extractMuxPlaybackId(rawTrailer) || 
                              extractMuxPlaybackId(activeCourse?.trailerVideo) ||
                              extractMuxPlaybackId(activeCourse?.heroSection?.trailerVideo) ||
                              extractMuxPlaybackId(activeCourse?.trailer) ||
                              activeCourse?.trailerMuxPlaybackId || 
                              activeCourse?.muxPlaybackId || 
                              activeCourse?.videoModules?.[0]?.lessons?.[0]?.muxPlaybackId;
                const ytId = extractYoutubeVideoId(rawTrailer);

                if (muxId) {
                  return (
                    <iframe
                      src={`https://player.mux.com/${muxId}?accentColor=C878BE&autoplay=1`}
                      title={activeCourse?.title || 'Course Preview Trailer'}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }

                if (ytId) {
                  return (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                      title={activeCourse?.title || 'Course Preview'}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }

                if (rawTrailer && !rawTrailer.startsWith('data:') && !rawTrailer.startsWith('blob:') && rawTrailer.includes('/')) {
                  return (
                    <video
                      src={resolveImageUrl(rawTrailer)}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                }

                return (
                  <div className="text-center p-8 space-y-3">
                    <VideoCamera size={44} className="text-white/30 mx-auto" />
                    <h4 className="text-white font-medium text-base">Course Preview Video Coming Soon</h4>
                    <p className="text-white/50 text-xs max-w-sm mx-auto">
                      The masterclass trailer for {activeCourse?.title} is being prepared. You can explore the full curriculum and modules below.
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Footer CTA */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 bg-[#0c070d]">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-white/50 uppercase font-mono">Course Price:</span>
                <span className="text-lg font-bold text-white font-serif">{activeCourse?.price || '₹15,000'}</span>
                {activeCourse?.was && <s className="text-xs text-white/40">{activeCourse.was}</s>}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowTrailerModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTrailerModal(false);
                    handleEnrollClick(activeCourse);
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#c9542f]/25 cursor-pointer"
                >
                  Enroll in Masterclass →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        showCourseLogin={showCourseLogin}
        setShowCourseLogin={setShowCourseLogin}
        isForgotPassword={isForgotPassword}
        setIsForgotPassword={setIsForgotPassword}
        isForgotOtpStep={isForgotOtpStep}
        handleAuthSubmit={handleAuthSubmit}
        isOtpStep={isOtpStep}
        loginMode={loginMode}
        setLoginMode={setLoginMode}
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        countryCode={countryCode}
        setCountryCode={setCountryCode}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        otpValues={otpValues}
        otpRefs={otpRefs}
        handleOtpChange={handleOtpChange}
        handleOtpKeyDown={handleOtpKeyDown}
        error={error}
        setError={setError}
        fieldErrors={fieldErrors}
        setFieldErrors={setFieldErrors}
        isLoading={isLoading}
        handleToggleMode={handleToggleMode}
        coursesList={coursesList}
        basePrice={basePrice}
        comparePrice={comparePrice}
      />
      <CheckoutOverlay
        showCheckout={showCheckout}
        setShowCheckout={handleCloseCheckout}
        checkoutAgreed={checkoutAgreed}
        setCheckoutAgreed={setCheckoutAgreed}
        handlePayment={handlePayment}
        isLoading={isLoading}
        error={error}
        courseData={courseData}
        onOpenTerms={() => {
          const termsDoc = courseDocuments.find(d => 
            (d.slug && (d.slug.toLowerCase().includes('term') || d.slug.toLowerCase().includes('condition'))) ||
            (d.title && (d.title.toLowerCase().includes('term') || d.title.toLowerCase().includes('condition')))
          );
          setActivePolicySlug(termsDoc?.slug || 'course-terms-and-conditions');
        }}
      />

      {/* Course Policy / T&C Modal for instant viewing with Allow & Deny actions */}
      <PolicyModal
        isOpen={!!activePolicySlug}
        onClose={() => setActivePolicySlug(null)}
        slug={activePolicySlug}
        title="Terms & Conditions"
        showActions={true}
        accentColor={activeTheme.accent || '#C878BE'}
        accentLight={activeTheme.accentLight || '#E3B8DE'}
        gradientFrom={activeTheme.accent ? activeTheme.accent + '99' : '#6A1B60'}
        gradientTo={activeTheme.accent ? activeTheme.accent + '44' : '#300E32'}
        onAgree={() => {
          setCheckoutAgreed(true);
          setActivePolicySlug(null);
        }}
        onDecline={() => {
          setCheckoutAgreed(false);
          setActivePolicySlug(null);
        }}
      />


      {/* ─── PRE-REGISTRATION CONFIRMATION MODAL ─── */}
      {showPreRegSuccessModal && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border border-amber-500/40 bg-[#0c0c0c] p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.15)] text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowPreRegSuccessModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close modal"
            >
              <X size={16} />
            </button>

            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <CheckCircle size={34} weight="fill" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#E3B8DE] font-semibold block">
                REGISTRATION CONFIRMED
              </span>
              <h3 
                className="text-2xl sm:text-3xl text-white font-bold"
                style={{ fontFamily: 'var(--head)' }}
              >
                You're Registered!
              </h3>
              <p className="font-sans text-xs sm:text-sm text-white/65 leading-relaxed max-w-sm mx-auto">
                You will be able to see the course once it is live.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPreRegSuccessModal(false)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#C878BE]/20 active:scale-[0.99]"
            >
              Got It
            </button>
          </div>
        </div>
      )}


      {/* Green Success Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#0a1f14]/95 border border-emerald-500/40 shadow-[0_10px_35px_rgba(16,185,129,0.3)] backdrop-blur-xl text-emerald-300 font-sans text-xs sm:text-sm font-semibold tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
            <CheckCircle size={18} className="text-emerald-400" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NAVBAR (POST-PURCHASE DASHBOARD) ───────────────────────────
function CourseNavbar({ isLoggedIn, isPurchased, showDashboard, setShowDashboard, profileMenuRef, showProfileMenu, setShowProfileMenu, handleLogout, setShowCourseLogin }) {
  const navigate = useNavigate();

  return (
    <header className="course-nav" style={{ position: 'relative', top: 'auto', zIndex: 50, flexShrink: 0 }}>
      {/* Brand Logo */}
      <Link 
        className="course-logo" 
        to="/"
        onClick={(e) => {
          e.preventDefault();
          if (typeof setShowCourseLogin === 'function') setShowCourseLogin(false);
          setShowDashboard(false);
          navigate('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        BetterWith<b>Aarkesh</b>
      </Link>

      {/* Center Nav: Home, Courses, FAQ */}
      <nav className="course-nav-center-links">
        <Link 
          to="/course" 
          onClick={(e) => {
            e.preventDefault();
            if (typeof setShowCourseLogin === 'function') setShowCourseLogin(false);
            setShowDashboard(false);
            navigate('/course');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="course-nav-link"
        >
          <FlippingWordSwap 
            word1="HOME" 
            word2="HOME" 
            toClassName="text-[#C878BE]"
          />
        </Link>
        <Link 
          to="/course/all" 
          onClick={(e) => {
            e.preventDefault();
            if (typeof setShowCourseLogin === 'function') setShowCourseLogin(false);
            setShowDashboard(false);
            navigate('/course/all');
          }}
          className="course-nav-link"
        >
          <FlippingWordSwap 
            word1="COURSES" 
            word2="COURSES" 
            toClassName="text-[#C878BE]"
          />
        </Link>
        <a 
          href="/course#faq" 
          onClick={(e) => {
            e.preventDefault();
            if (typeof setShowCourseLogin === 'function') setShowCourseLogin(false);
            setShowDashboard(false);
            setTimeout(() => {
              const el = document.getElementById('faq');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="course-nav-link"
        >
          <FlippingWordSwap 
            word1="FAQ" 
            word2="FAQ" 
            toClassName="text-[#C878BE]"
          />
        </a>
      </nav>

      {/* Right Controls: Library button + My Course button + round profile icon */}
      <div className="nav-r flex items-center gap-2.5 sm:gap-3">
        <Link
          to="/library"
          className="course-nav-library-btn"
          title="Explore Library"
        >
          <Books size={16} weight="bold" />
          <span>LIBRARY</span>
        </Link>

        <Link
          to="/my-course"
          className="course-nav-mycourse-btn"
          title="My Enrolled Courses"
        >
          <BookOpen size={16} weight="bold" />
          <span>MY COURSE</span>
        </Link>

        {isLoggedIn ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="course-profile-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#C878BE]/50 bg-[#120613] flex items-center justify-center text-[#E3B8DE] hover:bg-[#C878BE] hover:text-black transition-all shadow-[0_0_20px_rgba(200,120,190,0.25)] shrink-0 cursor-pointer"
              title="Student Profile"
            >
              <User size={17} weight="bold" />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0E0610] shadow-2xl py-2 z-[100] overflow-hidden text-left">
                {/* User Email & Name Header */}
                <div className="px-5 py-3 border-b border-white/10 bg-white/[0.03]">
                  <div className="text-xs font-bold text-white truncate">
                    {(() => { try { return JSON.parse(localStorage.getItem('courseUser') || '{}').fullName || 'Student Account'; } catch { return 'Student Account'; } })()}
                  </div>
                  <div className="text-[11px] text-[#E3B8DE] font-sans truncate mt-0.5" title={(() => { try { return JSON.parse(localStorage.getItem('courseUser') || '{}').email || ''; } catch { return ''; } })()}>
                    {(() => { try { return JSON.parse(localStorage.getItem('courseUser') || '{}').email || 'Logged In'; } catch { return 'Logged In'; } })()}
                  </div>
                </div>

                <Link
                  to="/library"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                  style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                >
                  <Books size={18} className="text-[#C878BE] shrink-0" />
                  <span>Library</span>
                </Link>
                <Link
                  to="/my-course"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                  style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                >
                  <BookOpen size={18} className="text-[#C878BE] shrink-0" />
                  <span>My Course</span>
                </Link>
                <Link
                  to="/course/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                  style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                >
                  <User size={18} className="text-[#C878BE] shrink-0" />
                  <span>Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowDashboard(false);
                  }}
                  className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 cursor-pointer bg-transparent border-none outline-none"
                  style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                >
                  <BookOpen size={18} className="text-[#C878BE] shrink-0" />
                  <span>Course Landing</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-5 py-3 text-left text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer bg-transparent border-none outline-none"
                  style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                >
                  <SignOut size={18} className="text-red-400 shrink-0" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="sign-in-btn"
            onClick={() => setShowCourseLogin(true)}
            title="Sign In"
          >
            SIGN IN
          </button>
        )}
      </div>
    </header>
  );
}

// ─── AUTH MODAL ─────────────────────────────────────────────────
function AuthModal({
  showCourseLogin,
  setShowCourseLogin,
  isForgotPassword,
  setIsForgotPassword,
  isForgotOtpStep,
  handleAuthSubmit,
  isOtpStep,
  loginMode,
  setLoginMode,
  fullName,
  setFullName,
  email,
  setEmail,
  countryCode = '+91',
  setCountryCode,
  phoneNumber,
  setPhoneNumber,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  otpValues,
  otpRefs,
  handleOtpChange,
  handleOtpKeyDown,
  error,
  setError,
  fieldErrors = {},
  setFieldErrors,
  isLoading,
  handleToggleMode,
  coursesList = [],
  basePrice = 15000,
  comparePrice = 25000
}) {
  const [activeCourseIdx, setActiveCourseIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!coursesList || coursesList.length <= 1) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setActiveCourseIdx((prev) => (prev + 1) % coursesList.length);
        setIsFading(false);
      }, 350);
    }, 5000);

    return () => clearInterval(interval);
  }, [coursesList]);

  if (!showCourseLogin) return null;

  const currentCourse = (coursesList && coursesList.length > 0)
    ? coursesList[activeCourseIdx]
    : {
        title: 'The Better Man',
        soon: false,
        lede: 'Calm authority, magnetic communication and effortless self-command.',
        inside: [
          '8 HD video modules',
          'Downloadable workbooks and frameworks',
          activeCourseDynamicFreeCount > 0 ? `${activeCourseDynamicFreeCount} private 1-on-1 coaching sessions` : 'Direct instructor Q&A & lifetime updates',
          'Lifetime access with all future updates'
        ],
        price: `₹${basePrice.toLocaleString('en-IN')}`,
        was: `₹${comparePrice.toLocaleString('en-IN')}`
      };

  return (
    <div className="auth-modal-scope">
      {/* Floating Close Button */}
      <button
        type="button"
        onClick={() => setShowCourseLogin(false)}
        className="close-btn"
        title="Close"
      >
        <X size={18} />
      </button>

      {/* ── Left Column: Form Section ── */}
      <div className="auth-l">
        <div className="fbox">
          {/* Back Navigation */}
          {isForgotPassword ? (
            <button
              type="button"
              className="back"
              onClick={() => {
                setIsForgotPassword(false);
                setIsForgotOtpStep(false);
                setError('');
              }}
            >
              ← Back to sign in
            </button>
          ) : isOtpStep ? (
            <button
              type="button"
              className="back"
              onClick={() => {
                setError('');
              }}
            >
              ← Back to details
            </button>
          ) : (
            <button
              type="button"
              className="back"
              onClick={() => setShowCourseLogin(false)}
            >
              ← Back to course
            </button>
          )}

          {/* Heading & Subtitle */}
          <h1>
            {isForgotPassword
              ? isForgotOtpStep
                ? 'Set new password'
                : 'Reset your password'
              : isOtpStep
              ? 'Verify your email'
              : loginMode === 'login'
              ? 'Welcome back'
              : 'Create your account'}
          </h1>
          <p className="sm">
            {isForgotPassword
              ? isForgotOtpStep
                ? 'Enter the 4-digit code and your new password.'
                : 'Enter your registered email to receive a reset code.'
              : isOtpStep
              ? `Enter the 4-digit code sent to ${email}`
              : loginMode === 'login'
              ? 'Sign in to continue your masterclass.'
              : 'One account for every masterclass you join.'}
          </p>

          {/* Error Message Box */}
          {error && <div className="err">{error}</div>}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} noValidate>
            {!isOtpStep && !isForgotOtpStep ? (
              <>
                {/* Full Name for Register */}
                {!isForgotPassword && loginMode === 'register' && (
                  <div className="fld">
                    <label htmlFor="reg-fullname">Full Name</label>
                    <input
                      id="reg-fullname"
                      type="text"
                      required
                      className={fieldErrors.fullName ? 'has-error' : ''}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: false }));
                      }}
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>
                )}

                {/* Email Address */}
                <div className="fld">
                  <label htmlFor="auth-email">Email Address</label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    className={fieldErrors.email ? 'has-error' : ''}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: false }));
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                {/* Phone Number with Country Code Dropdown for Register */}
                {!isForgotPassword && loginMode === 'register' && (
                  <div className="fld">
                    <label htmlFor="reg-phone">Phone Number</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        id="reg-country-code"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        style={{
                          width: '120px',
                          flexShrink: 0,
                          height: '46px',
                          background: '#100B13',
                          border: '1px solid #3A3040',
                          borderRadius: '10px',
                          color: '#fff',
                          padding: '0 8px',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                        aria-label="Country Code"
                      >
                        {COUNTRY_CODES.map((c, idx) => (
                          <option key={`${c.code}-${idx}`} value={c.code} style={{ background: '#100B13', color: '#fff' }}>
                            {c.label || `${c.code} (${c.name})`}
                          </option>
                        ))}
                      </select>
                      <input
                        id="reg-phone"
                        type="tel"
                        required
                        maxLength={10}
                        className={fieldErrors.phoneNumber ? 'has-error' : ''}
                        value={phoneNumber}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhoneNumber(digitsOnly);
                          if (fieldErrors.phoneNumber) setFieldErrors(prev => ({ ...prev, phoneNumber: false }));
                        }}
                        placeholder="98765 43210 (10 digits)"
                        autoComplete="tel-national"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                )}

                {/* Password Field */}
                {!isForgotPassword && (
                  <div className="fld">
                    <label htmlFor="auth-password">Password</label>
                    <div className="pw">
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className={fieldErrors.password ? 'has-error' : ''}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: false }));
                        }}
                        placeholder="Enter password"
                        autoComplete={loginMode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password for Register */}
                {!isForgotPassword && loginMode === 'register' && (
                  <div className="fld">
                    <label htmlFor="auth-cpassword">Confirm Password</label>
                    <div className="pw">
                      <input
                        id="auth-cpassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className={fieldErrors.confirmPassword ? 'has-error' : ''}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: false }));
                        }}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me & Forgot Password for Login */}
                {!isForgotPassword && loginMode === 'login' && (
                  <div className="row">
                    <label className="chk" style={{ margin: 0 }}>
                      <input type="checkbox" defaultChecked />
                      <span>Keep me signed in</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}



                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn block"
                  style={{ width: '100%' }}
                >
                  {isLoading
                    ? 'Please wait...'
                    : isForgotPassword
                    ? 'Send Reset Code'
                    : loginMode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}{' '}
                  <span aria-hidden="true">→</span>
                </button>
              </>
            ) : (
              /* OTP verification / Forgot Password Reset form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', margin: '8px 0' }}>
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      style={{
                        width: '56px',
                        height: '56px',
                        textAlign: 'center',
                        fontSize: '22px',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        background: '#100B13',
                        border: '1px solid #3A3040',
                        color: '#fff'
                      }}
                    />
                  ))}
                </div>

                {isForgotPassword && isForgotOtpStep && (
                  <>
                    <div className="fld">
                      <label htmlFor="reset-new-pw">New Password</label>
                      <div className="pw">
                        <input
                          id="reset-new-pw"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div className="fld">
                      <label htmlFor="reset-new-cpw">Confirm New Password</label>
                      <div className="pw">
                        <input
                          id="reset-new-cpw"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn block"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {isLoading
                    ? 'Verifying...'
                    : isForgotPassword
                    ? 'Reset Password'
                    : 'Verify Code'}{' '}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </form>

          {/* Alternate Mode Switcher */}
          <p className="alt">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsForgotOtpStep(false);
                  setError('');
                }}
              >
                ← Back to Sign In
              </button>
            ) : loginMode === 'login' ? (
              <>
                New here?{' '}
                <button type="button" onClick={handleToggleMode}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={handleToggleMode}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Right Column: Aesthetic Summary Card ── */}
      <div className="auth-r">
        <div className="orb" aria-hidden="true" />
        <div className="in">
          <h2>
            {isForgotPassword
              ? 'Security & peace of mind.'
              : loginMode === 'login'
              ? 'Pick up where you left off.'
              : 'Your masterclass, ready when you are.'}
          </h2>

          <div className="sum">
            {loginMode === 'login' && !isForgotPassword ? (
              <ul className="ck">
                <li>Continue your modules from the last video</li>
                <li>Book your private sessions with Aarkesh</li>
                <li>Download your workbooks and frameworks</li>
                <li>Lifetime updates with no recurring fees</li>
              </ul>
            ) : isForgotPassword ? (
              <ul className="ck">
                <li>Instant 4-digit verification code to your email</li>
                <li>End-to-end encrypted password restoration</li>
                <li>Resume your learning seamlessly right after</li>
              </ul>
            ) : (
              <>
                <div className={`auth-modal-course-card ${isFading ? 'fading-out' : 'fading-in'}`}>
                  <span
                    className="sticker"
                    style={{
                      background: currentCourse.soon
                        ? 'rgba(255, 255, 255, 0.18)'
                        : 'linear-gradient(135deg, #B04FA6, #6E2266)'
                    }}
                  >
                    {currentCourse.soon ? 'Coming soon' : 'Live now'}
                  </span>
                  <h3>{currentCourse.title}</h3>
                  <p className="l">
                    {currentCourse.lede || currentCourse.d}
                  </p>
                  <ul className="ck">
                    {(currentCourse.inside || [
                      '8 HD video modules',
                      'Downloadable workbooks and frameworks',
                      activeCourseDynamicFreeCount > 0 ? `${activeCourseDynamicFreeCount} private 1-on-1 coaching sessions` : 'Direct instructor Q&A & lifetime updates',
                      'Lifetime access with all future updates'
                    ]).map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                  <p className="sprice">
                    Price <b>{currentCourse.price || `₹${basePrice.toLocaleString('en-IN')}`}</b>
                    <s>{currentCourse.was || `₹${comparePrice.toLocaleString('en-IN')}`}</s>
                    <small>(+GST)</small>
                  </p>
                </div>

                {coursesList && coursesList.length > 1 && (
                  <div className="auth-course-dots">
                    {coursesList.map((c, idx) => (
                      <button
                        key={c.slug || idx}
                        type="button"
                        onClick={() => {
                          if (idx === activeCourseIdx) return;
                          setIsFading(true);
                          setTimeout(() => {
                            setActiveCourseIdx(idx);
                            setIsFading(false);
                          }, 250);
                        }}
                        className={`auth-course-dot ${idx === activeCourseIdx ? 'active' : 'inactive'}`}
                        title={c.title}
                        aria-label={`Go to ${c.title}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKOUT OVERLAY ───────────────────────────────────────────
function CheckoutOverlay({ showCheckout, setShowCheckout, checkoutAgreed, setCheckoutAgreed, handlePayment, isLoading, error, onOpenTerms, courseData }) {
  if (!showCheckout) return null;

  const basePrice = courseData?.price !== undefined ? courseData.price : 15000;
  const gstRate = courseData?.gstRate !== undefined ? courseData.gstRate : 18;
  const isGstIncluded = Boolean(courseData?.isGstIncluded);

  const gstAmount = isGstIncluded
    ? Math.round(basePrice - (basePrice / (1 + (gstRate / 100))))
    : Math.round((basePrice * gstRate) / 100);

  const baseBeforeGst = isGstIncluded ? basePrice - gstAmount : basePrice;
  const finalPayable = isGstIncluded ? basePrice : basePrice + gstAmount;

  return (
    <div className="fixed inset-0 z-[110] bg-[#050505] flex flex-col justify-between overflow-y-auto min-h-screen">
      {/* Background Ambience & Spotlights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#C878BE]/12 rounded-full blur-[150px]" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#7A2A70]/12 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#C878BE]/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Bar Navigation */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pt-8 px-6 md:px-10 relative z-20">
        <button
          onClick={() => setShowCheckout(false)}
          className="flex items-center gap-2.5 font-sans text-xs uppercase tracking-[0.2em] text-white/70 hover:text-[#E3B8DE] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> BACK TO COURSE
        </button>

        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <ShieldCheck size={16} className="text-[#C878BE]" />
          <span className="font-sans text-[0.68rem] uppercase tracking-wider text-white/80 font-medium">100% Secure Checkout</span>
        </div>
      </div>

      {/* Center Checkout Card */}
      <div className="w-full max-w-lg mx-auto px-6 py-10 relative z-10 my-auto">
        <div className="text-center mb-8">
          <span className="font-sans text-[0.68rem] uppercase tracking-[0.25em] text-[#E3B8DE] font-semibold block mb-2">
            FINAL STEP
          </span>
          <h1 
            className="text-3xl md:text-4xl text-white font-bold tracking-tight"
            style={{ fontFamily: 'var(--head)' }}
          >
            Checkout Payment
          </h1>
          <p className="font-sans text-xs md:text-sm text-white/60 mt-1.5">
            Complete your enrollment to unlock instant lifetime access.
          </p>
        </div>

        {/* Glassmorphic Payment Summary Card */}
        <div className="rounded-3xl border border-[#C878BE]/30 bg-[#0e0a16]/90 backdrop-blur-2xl p-7 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(200,120,190,0.1)]">
          {/* Item Row */}
          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            <div 
              className="w-16 h-16 rounded-xl overflow-hidden border border-[#C878BE]/40 shrink-0 relative shadow-inner flex items-center justify-center font-bold text-white text-xl"
              style={{
                background: 'radial-gradient(circle at 35% 25%, #6A1B60 0%, #300E32 55%, #0C040E 100%)',
                fontFamily: 'var(--head)'
              }}
            >
              <span>01</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2 py-0.5 rounded-full bg-[#C878BE]/20 border border-[#C878BE]/40 text-[0.65rem] text-[#E3B8DE] font-medium tracking-wide uppercase mb-1">
                Full Master Access
              </span>
              <h3 className="font-sans text-sm font-semibold text-white truncate">The Better Man™</h3>
              <p className="font-sans text-xs text-white/60 truncate">All Modules + 3 Coaching Calls + Community</p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="py-5 space-y-3 border-b border-white/10">
            {gstRate > 0 && (
              <div className="flex justify-between items-center text-xs font-sans text-white/70">
                <span>Course Base Fee</span>
                <span className="font-medium text-white">₹{baseBeforeGst.toLocaleString('en-IN')}</span>
              </div>
            )}
            {gstRate > 0 && (
              <div className="flex justify-between items-center text-xs font-sans text-white/70">
                <div className="flex items-center gap-1.5">
                  <span>GST ({gstRate}%)</span>
                  {isGstIncluded && <span className="text-[10px] text-white/40">(included)</span>}
                  <Info size={13} className="text-white/40" />
                </div>
                <span className="font-medium text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 text-white">
              <div>
                <span className="font-sans text-sm font-bold block text-white">Total Amount Due</span>
                {gstRate > 0 && (
                  <span className="font-sans text-[0.65rem] text-white/50 block">
                    {isGstIncluded ? `Inclusive of all taxes (${gstRate}% GST)` : `Includes ${gstRate}% GST`}
                  </span>
                )}
              </div>
              <span className="font-sans text-2xl md:text-3xl font-bold text-[#E3B8DE] tracking-tight">₹{finalPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-5">
            <label className="flex items-start gap-2.5 cursor-pointer mb-5 group select-none">
              <input
                type="checkbox"
                checked={checkoutAgreed}
                onChange={(e) => setCheckoutAgreed(e.target.checked)}
                className="accent-[#C878BE] rounded w-4 h-4 mt-0.5 cursor-pointer shrink-0"
              />
              <span className="font-sans text-xs text-white/75 leading-relaxed group-hover:text-white transition-colors">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onOpenTerms) onOpenTerms();
                  }}
                  className="underline text-[#E3B8DE] font-semibold hover:text-white transition-colors inline"
                >
                  Terms &amp; Conditions
                </button>
                .
              </span>
            </label>

            {error && (
              <div className="text-red-300 font-sans text-xs mb-4 text-center bg-red-500/15 border border-red-500/30 rounded-xl p-2.5">
                {error}
              </div>
            )}

            {/* CTA Button */}
            <button
              type="button"
              onClick={handlePayment}
              disabled={isLoading || !checkoutAgreed}
              className="w-full rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-4 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white transition-all shadow-[0_0_30px_rgba(200,120,190,0.35)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>{isLoading ? 'PROCESSING...' : `PAY ₹${finalPayable.toLocaleString('en-IN')} & ENROLL NOW`}</span>
              <ArrowRight size={16} weight="bold" />
            </button>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-4 text-[0.7rem] text-white/50 mt-4 font-sans">
              <div className="flex items-center gap-1.5">
                <LockKey size={13} className="text-[#C878BE]" />
                <span>256-bit SSL Encrypted</span>
              </div>
              <span className="text-white/20">•</span>
              <span>Razorpay Verified</span>
              <span className="text-white/20">•</span>
              <span>Instant Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer minimal spacing */}
      <div className="pb-6 text-center text-[0.65rem] text-white/30 font-sans relative z-10">
        Better With Aarkesh • Secure Payment Gateway
      </div>
    </div>
  );
}
