import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Envelope,
  Phone,
  LockKey,
  SignOut,
  CaretLeft,
  Crown,
  BookOpen,
  Books,
  CheckCircle,
  Eye,
  EyeSlash,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkle,
  Clock,
  CalendarPlus,
  VideoCamera,
  Receipt,
  Printer,
  Copy,
  Check,
  FileText,
  PencilSimple,
  IdentificationBadge,
  GraduationCap,
  Sparkle as StarIcon,
  ChatCenteredText,
  MagnifyingGlass,
  ArrowsDownUp,
  MonitorPlay,
  Headphones,
  Play,
  X,
  ChatsCircle,
  LightbulbFilament,
  CheckSquareOffset,
  ImageSquare
} from '@phosphor-icons/react';
import FlippingWordSwap from '../../components/ui/FlippingWordSwap';
import './course-landing.css';

export default function CourseProfile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ONLY 2 main tabs as requested: 'BASIC_INFO' | 'MY_PROGRAMS'
  const initialTab = searchParams.get('tab') === 'MY_PROGRAMS' || searchParams.get('tab') === 'courses' ? 'MY_PROGRAMS' : 'BASIC_INFO';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [showSecuritySection, setShowSecuritySection] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPlatformOverviewModal, setShowPlatformOverviewModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Classroom Search & Sort State
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseSortOrder, setCourseSortOrder] = useState('newest');

  // Edit Profile Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Navbar Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'MY_PROGRAMS' || tabParam === 'courses' || tabParam === 'programs') {
      setActiveTab('MY_PROGRAMS');
    } else if (tabParam === 'BASIC_INFO' || tabParam === 'info' || tabParam === 'profile') {
      setActiveTab('BASIC_INFO');
    }
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('courseToken');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/api/course-auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setFullName(data.fullName || '');
          setPhoneNumber(data.phoneNumber || '');
          localStorage.setItem('courseUser', JSON.stringify(data));
          if (data.isPurchased) {
            localStorage.setItem('isCoursePurchased', 'true');
          }
        } else {
          const storedUser = localStorage.getItem('courseUser');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setFullName(parsed.fullName || '');
            setPhoneNumber(parsed.phoneNumber || '');
          }
        }
      } catch (err) {
        console.error('Error fetching course profile:', err);
        const storedUser = localStorage.getItem('courseUser');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setFullName(parsed.fullName || '');
          setPhoneNumber(parsed.phoneNumber || '');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('courseToken');
    localStorage.removeItem('isCoursePurchased');
    localStorage.removeItem('courseUser');
    navigate('/course');
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    if (!fullName.trim()) {
      setProfileErrorMsg('Full Name cannot be empty');
      return;
    }

    if (phoneNumber && phoneNumber.trim().length !== 10) {
      setProfileErrorMsg('Phone number must be exactly 10 digits');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const token = localStorage.getItem('courseToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/course-auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem('courseUser', JSON.stringify(data));
        setProfileSuccessMsg('Profile details saved successfully.');
        setIsEditingProfile(false);
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      } else {
        setProfileErrorMsg(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setProfileErrorMsg('An error occurred while saving profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!currentPassword) {
      setPasswordErrorMsg('Please enter your current password');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordErrorMsg('New password must be at least 4 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const token = localStorage.getItem('courseToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/course-auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccessMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccessMsg(''), 4000);
      } else {
        setPasswordErrorMsg(data.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error(err);
      setPasswordErrorMsg('An error occurred. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const [isSyncingCoaching, setIsSyncingCoaching] = useState(false);

  const handleBookFreeSession = async () => {
    setIsSyncingCoaching(true);
    const courseEmail = user?.email || '';
    const courseName = user?.fullName || fullName || '';
    const coursePhone = user?.phoneNumber || phoneNumber || '';
    try {
      const courseToken = localStorage.getItem('courseToken');
      if (courseToken) {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/api/course-auth/sync-coaching-account`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${courseToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          navigate(`/book?openAuth=true&authMode=register&email=${encodeURIComponent(courseEmail)}&name=${encodeURIComponent(courseName)}&phone=${encodeURIComponent(coursePhone)}`);
        } else {
          const errData = await res.json();
          alert(`Could not sync account: ${errData.message}`);
        }
      }
    } catch (err) {
      console.error('Failed to sync coaching account:', err);
      alert('Network error. Please try again.');
    } finally {
      setIsSyncingCoaching(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = user?.fullName || fullName || 'Executive Member';
  const isPurchased = user?.isPurchased || localStorage.getItem('isCoursePurchased') === 'true';

  const formatPurchaseDate = (dateStr) => {
    if (!dateStr) return 'August 29, 2025';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'August 29, 2025';
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'August 29, 2025';
    }
  };

  const getCourseProgress = () => {
    try {
      const saved = localStorage.getItem('course_completed_lessons');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) {
          return {
            percent: Math.min(100, Math.round((arr.length / 14) * 100)),
            count: arr.length
          };
        }
      }
    } catch (e) {}
    return { percent: 3.56, count: 1 };
  };

  const courseProgressInfo = getCourseProgress();

  const enrolledCourseList = useMemo(() => {
    return [
      {
        id: 'better-with-aarkesh-mastery',
        title: 'Better With Aarkesh: The Mastery Course',
        subtitle: 'Executive Life Coaching & Peak Presence Framework',
        purchaseDate: formatPurchaseDate(user?.latestPurchase?.createdAt || user?.createdAt),
        rawDate: new Date(user?.latestPurchase?.createdAt || user?.createdAt || '2025-08-29').getTime(),
        progress: courseProgressInfo.percent,
        completedLessonsCount: courseProgressInfo.count,
        totalLessons: 14,
        image: '/course_hero_bg.jpg',
        freeSessions: user?.freeSessions ?? 3
      }
    ];
  }, [user, courseProgressInfo.percent, courseProgressInfo.count]);

  const filteredCourses = useMemo(() => {
    let list = [...enrolledCourseList];
    if (courseSearchQuery.trim()) {
      const q = courseSearchQuery.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (courseSortOrder === 'newest') return b.rawDate - a.rawDate;
      return a.rawDate - b.rawDate;
    });
    return list;
  }, [enrolledCourseList, courseSearchQuery, courseSortOrder]);

  return (
    <div className="course-landing-scope min-h-screen bg-[#07040a] text-[#F5F2EB] flex flex-col relative overflow-x-hidden selection:bg-[#C878BE]/30 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#C878BE]/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[600px] h-[600px] bg-[#7A2A70]/10 rounded-full blur-[170px] pointer-events-none" />

      {/* ── Top Fixed Navigation (Exact Match with Home Page Navbar & Blur) ── */}
      <header className="course-nav">
        <Link className="course-logo" to="/">
          BetterWith<b>Aarkesh</b>
        </Link>

        {/* Center Nav Links with Permanent Fixed Text */}
        <nav className="course-nav-center-links">
          <Link
            to="/course"
            className="course-nav-link"
          >
            <FlippingWordSwap word1="HOME" word2="HOME" toClassName="text-[#C878BE]" />
          </Link>
          <Link
            to="/course/all"
            className="course-nav-link"
          >
            <FlippingWordSwap word1="COURSES" word2="COURSES" toClassName="text-[#C878BE]" />
          </Link>
          <Link
            to="/course#faq"
            className="course-nav-link"
          >
            <FlippingWordSwap word1="FAQ" word2="FAQ" toClassName="text-[#C878BE]" />
          </Link>
        </nav>

        {/* Right Controls: Avatar with Dropdown or Sign In */}
        <div className="nav-r flex items-center gap-2.5 sm:gap-3">
          <Link
            to="/library"
            className="course-nav-library-btn"
            title="Explore Library"
          >
            <Books size={16} weight="bold" />
            <span>LIBRARY</span>
          </Link>

          {localStorage.getItem('courseToken') ? (
            <>
              <Link
                to="/my-course"
                className="course-nav-mycourse-btn"
                title="My Enrolled Courses"
              >
                <BookOpen size={16} weight="bold" />
                <span>MY COURSE</span>
              </Link>

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="course-profile-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#C878BE]/50 bg-[#120613] flex items-center justify-center text-[#E3B8DE] hover:bg-[#C878BE] hover:text-black transition-all shadow-[0_0_20px_rgba(200,120,190,0.25)] shrink-0 cursor-pointer"
                  title={displayName || "Student Profile"}
                >
                  <User size={17} weight="bold" />
                </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0E0610] shadow-2xl py-2 z-[100] overflow-hidden text-left animate-fadeIn">
                  {/* User Email & Name Header */}
                  <div className="px-5 py-3 border-b border-white/10 bg-white/[0.03]">
                    <div className="text-xs font-bold text-white truncate">
                      {user?.fullName || 'Student Account'}
                    </div>
                    <div className="text-[11px] text-[#E3B8DE] font-sans truncate mt-0.5" title={user?.email}>
                      {user?.email || 'Logged In'}
                    </div>
                  </div>

                  <Link
                    to="/library"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                    style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                  >
                    <Books size={18} className="text-[#C878BE] shrink-0" />
                    <span>Library</span>
                  </Link>
                  <Link
                    to="/my-course"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                    style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                  >
                    <BookOpen size={18} className="text-[#C878BE] shrink-0" />
                    <span>My Course</span>
                  </Link>
                  <Link
                    to="/course/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full px-5 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                    style={{ fontSize: '14px', fontFamily: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)' }}
                  >
                    <User size={18} className="text-[#C878BE] shrink-0" />
                    <span>Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
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
            <Link
              to="/course"
              className="sign-in-btn"
            >
              SIGN IN
            </Link>
          )}
        </div>
      </header>

      {/* Main 2-Column Dashboard Layout with Top Spacing for Fixed Navbar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-28 sm:pt-32 pb-16 relative z-10">
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#C878BE] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs uppercase tracking-widest text-white/50">Loading your profile...</p>
            </div>
          </div>
        ) : !user && !localStorage.getItem('courseToken') ? (
          <div className="rounded-3xl border border-[#C878BE]/20 bg-[#0e0a16] p-10 text-center max-w-md mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#C878BE]/10 border border-[#C878BE]/30 flex items-center justify-center mx-auto mb-5 text-[#E3B8DE]">
              <User size={30} weight="light" />
            </div>
            <h2 
              className="text-2xl text-white mb-2 font-bold"
              style={{ fontFamily: 'var(--head)' }}
            >
              No Active Session
            </h2>
            <p className="text-sm text-white/60 mb-6 font-sans">
              You are not signed in. Please log in from the course page to access your profile and enrolled programs.
            </p>
            <Link
              to="/course"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white font-semibold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(200,120,190,0.3)] transition-all"
            >
              Go to Course <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* ================= LEFT SIDEBAR ================= */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-[#C878BE]/20 bg-gradient-to-b from-[#140b20] to-[#0a0512] p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                {/* Glow backdrop */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#C878BE]/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

                {/* Header */}
                <div className="mb-6">
                  <h2 
                    className="text-xl text-white font-bold tracking-tight"
                    style={{ fontFamily: 'var(--head)' }}
                  >
                    My Profile
                  </h2>
                  <p className="text-xs text-white/50 mt-1 font-sans">
                    Manage your personal details and coaching growth
                  </p>
                </div>

                {/* Profile Identity Card */}
                <div className="flex flex-col items-center text-center py-4 border-b border-white/10">
                  <div className="relative mb-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#A83B96] to-[#7A2A70] p-[3px] shadow-[0_0_30px_rgba(200,120,190,0.25)]">
                      <div className="w-full h-full bg-[#1b0d2a] rounded-full flex items-center justify-center text-2xl font-bold text-[#E3B8DE] uppercase">
                        {getInitials(displayName)}
                      </div>
                    </div>
                    {isPurchased && (
                      <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#C878BE] text-black flex items-center justify-center shadow-lg" title="Active Client">
                        <Crown size={15} weight="fill" />
                      </div>
                    )}
                  </div>

                  <h3 
                    className="text-xl text-white font-bold tracking-tight truncate max-w-full px-2"
                    style={{ fontFamily: 'var(--head)' }}
                  >
                    {displayName}
                  </h3>

                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] uppercase tracking-widest font-semibold bg-[#C878BE]/20 text-[#E3B8DE] border border-[#C878BE]/40 shadow-sm">
                      <Sparkle size={12} weight="fill" /> {isPurchased ? 'EXECUTIVE CLIENT' : 'COMMUNITY MEMBER'}
                    </span>
                  </div>
                </div>

                {/* Navigation Tabs (ONLY Basic Info & Course Page as requested) */}
                <div className="py-5 space-y-2">
                  <button
                    onClick={() => setActiveTab('BASIC_INFO')}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                      activeTab === 'BASIC_INFO'
                        ? 'bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white shadow-[0_0_25px_rgba(200,120,190,0.3)]'
                        : 'bg-white/[0.02] hover:bg-white/5 text-white/70 hover:text-white border border-white/5'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      activeTab === 'BASIC_INFO' ? 'bg-white/20 text-white' : 'bg-white/5 text-[#E3B8DE]'
                    }`}>
                      <User size={18} weight={activeTab === 'BASIC_INFO' ? 'fill' : 'regular'} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-wider font-semibold">Basic Info</p>
                      <p className="text-[11px] text-white/60 truncate mt-0.5">Personal details & contact</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('MY_PROGRAMS')}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                      activeTab === 'MY_PROGRAMS'
                        ? 'bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white shadow-[0_0_25px_rgba(200,120,190,0.3)]'
                        : 'bg-white/[0.02] hover:bg-white/5 text-white/70 hover:text-white border border-white/5'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      activeTab === 'MY_PROGRAMS' ? 'bg-white/20 text-white' : 'bg-white/5 text-[#E3B8DE]'
                    }`}>
                      <BookOpen size={18} weight={activeTab === 'MY_PROGRAMS' ? 'fill' : 'regular'} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-wider font-semibold">My Programs</p>
                      <p className="text-[11px] text-white/60 truncate mt-0.5">Enrolled coaching & masterclasses</p>
                    </div>
                  </button>
                </div>

                {/* Bottom Stat Boxes (Life Coaching tailored) */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                    <span className="text-2xl font-bold text-white block" style={{ fontFamily: 'var(--head)' }}>
                      {isPurchased ? (user?.enrolledCourses?.length || user?.purchasedCourses?.length || 1) : '0'}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-white/50 block mt-1">
                      Purchased Programs
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                    <span className="text-2xl font-bold text-[#E3B8DE] block" style={{ fontFamily: 'var(--head)' }}>
                      {isPurchased ? (user?.freeSessions ?? ((user?.enrolledCourses?.length || user?.purchasedCourses?.length || 1) * 3)) : '0'}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-white/50 block mt-1">
                      1-on-1 Sessions
                    </span>
                  </div>
                </div>

              </div>
            </aside>

            {/* ================= RIGHT MAIN PANE ================= */}
            <section className="lg:col-span-8 space-y-6">
              
              {/* Clean Seamless Header (Matches Reference UI) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                <div>
                  <h1 
                    className="text-2xl sm:text-3xl text-white font-bold tracking-tight"
                    style={{ fontFamily: 'var(--head)' }}
                  >
                    {activeTab === 'BASIC_INFO' ? 'Personal Information' : 'My Programs'}
                  </h1>
                  <p className="text-xs text-white/50 mt-1 font-sans">
                    {activeTab === 'BASIC_INFO' 
                      ? 'Update your personal details and contact information' 
                      : 'View your enrolled programs and coaching access'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {activeTab === 'BASIC_INFO' && (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isEditingProfile
                          ? 'bg-[#C878BE] text-black border-[#C878BE]'
                          : 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                      }`}
                    >
                      <PencilSimple size={15} />
                      <span>{isEditingProfile ? 'Editing Mode' : 'Edit Profile'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white/80 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <SignOut size={15} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>

              {/* SUCCESS / ERROR ALERTS */}
              {profileSuccessMsg && (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle size={18} weight="fill" /> {profileSuccessMsg}
                </div>
              )}
              {profileErrorMsg && (
                <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs animate-fadeIn">
                  {profileErrorMsg}
                </div>
              )}

              {/* ================= TAB 1: BASIC INFO ================= */}
              {activeTab === 'BASIC_INFO' && (
                <div className="space-y-6">
                  {/* Form Container */}
                  <div className="rounded-3xl border border-[#C878BE]/20 bg-[#0e0a16] p-6 sm:p-8 shadow-xl">
                    <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-6">
                      <div className="w-8 h-8 rounded-xl bg-[#C878BE]/20 text-[#E3B8DE] flex items-center justify-center">
                        <User size={18} weight="fill" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Personal Information</h2>
                        <p className="text-xs text-white/50">Your account identity & communication details</p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-white/60 mb-2 font-medium">
                          Full Name
                        </label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                          <input
                            type="text"
                            value={fullName}
                            disabled={!isEditingProfile}
                            onChange={(e) => setFullName(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-white placeholder-white/20 transition-all ${
                              isEditingProfile 
                                ? 'border-[#C878BE]/60 bg-white/5 focus:outline-none focus:ring-1 focus:ring-[#C878BE]' 
                                : 'border-white/5 bg-white/[0.02] text-white/80 cursor-default'
                            }`}
                            placeholder="Your Full Name"
                            required
                          />
                        </div>
                      </div>

                      {/* Email & Contact in 2 cols */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-white/60 mb-2 font-medium">
                            Email Address <span className="text-[10px] text-white/40 lowercase">(cannot be changed)</span>
                          </label>
                          <div className="relative">
                            <Envelope size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="w-full pl-11 pr-24 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-white/50 cursor-not-allowed text-sm"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[0.65rem] font-semibold uppercase tracking-wider">
                              Verified
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-widest text-white/60 mb-2 font-medium">
                            Phone Number (10 Digits)
                          </label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                            <span className="absolute left-11 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">+91</span>
                            <input
                              type="tel"
                              maxLength={10}
                              value={phoneNumber}
                              disabled={!isEditingProfile}
                              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                              className={`w-full pl-20 pr-4 py-3 rounded-xl border text-sm text-white placeholder-white/20 transition-all ${
                                isEditingProfile 
                                ? 'border-[#C878BE]/60 bg-white/5 focus:outline-none focus:ring-1 focus:ring-[#C878BE]' 
                                : 'border-white/5 bg-white/[0.02] text-white/80 cursor-default'
                              }`}
                              placeholder="9876543210"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Button when in editing mode */}
                      {isEditingProfile && (
                        <div className="pt-4 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setFullName(user?.fullName || '');
                              setPhoneNumber(user?.phoneNumber || '');
                              setIsEditingProfile(false);
                            }}
                            className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white font-semibold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(200,120,190,0.35)] transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Collapsible Security & Password Card */}
                  <div className="rounded-3xl border border-white/10 bg-[#0e0a16] p-6 sm:p-7 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 text-white/70 flex items-center justify-center">
                          <LockKey size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">Security &amp; Password</h3>
                          <p className="text-xs text-white/50">Manage your course account password</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowSecuritySection(!showSecuritySection)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
                      >
                        {showSecuritySection ? 'Hide' : 'Change Password'}
                      </button>
                    </div>

                    {showSecuritySection && (
                      <div className="mt-6 pt-6 border-t border-white/10 animate-fadeIn">
                        {passwordSuccessMsg && (
                          <div className="mb-4 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
                            <CheckCircle size={16} weight="fill" /> {passwordSuccessMsg}
                          </div>
                        )}
                        {passwordErrorMsg && (
                          <div className="mb-4 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                            {passwordErrorMsg}
                          </div>
                        )}

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2 font-medium">
                                Current Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showCurrentPassword ? 'text' : 'password'}
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  className="w-full px-4 pr-10 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:border-[#C878BE] focus:outline-none"
                                  placeholder="••••••••"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                >
                                  {showCurrentPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2 font-medium">
                                New Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showNewPassword ? 'text' : 'password'}
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full px-4 pr-10 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:border-[#C878BE] focus:outline-none"
                                  placeholder="••••••••"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                >
                                  {showNewPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2 font-medium">
                                Confirm Password
                              </label>
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:border-[#C878BE] focus:outline-none"
                                placeholder="••••••••"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              disabled={isUpdatingPassword}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white font-semibold text-xs tracking-wider uppercase hover:shadow-[0_0_15px_rgba(200,120,190,0.3)] transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= TAB 2: MY PROGRAM (ORIGINAL COMPACT CARD) ================= */}
              {activeTab === 'MY_PROGRAMS' && (
                <div className="space-y-6">
                  {isPurchased ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(Array.isArray(user?.enrolledCourses) && user.enrolledCourses.length > 0
                        ? user.enrolledCourses
                        : [{
                            slug: 'better-man',
                            title: 'Better With Aarkesh: The Mastery Course',
                            modulesCount: 8,
                            imageUrl: '',
                            lede: '4 Transformation pillars, 14 high-impact video lessons, executive blueprints & lifetime updates.'
                          }]
                      ).map((item, idx) => (
                        <div 
                          key={item.slug || idx} 
                          className="rounded-2xl border border-[#C878BE]/25 bg-gradient-to-b from-[#130a1c] to-[#09040f] overflow-hidden shadow-xl flex flex-col justify-between"
                        >
                          {/* Thumbnail Cover with Paid Badge */}
                          <div className="relative w-full h-44 sm:h-48 bg-gradient-to-tr from-[#160d24] via-[#241036] to-[#0c0514] overflow-hidden group flex items-center justify-center">
                            {item.imageUrl && item.imageUrl.trim() !== '' ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.title}
                                className="w-full h-full object-cover object-center opacity-90 group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const placeholder = e.currentTarget.parentElement?.querySelector('.no-image-box');
                                  if (placeholder) placeholder.style.display = 'flex';
                                }}
                              />
                            ) : null}

                            <div 
                              className="no-image-box flex flex-col items-center justify-center text-white/35 space-y-1.5 select-none py-6"
                              style={{ display: item.imageUrl && item.imageUrl.trim() !== '' ? 'none' : 'flex' }}
                            >
                              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#E3B8DE]/50 shadow-inner">
                                <ImageSquare size={24} weight="duotone" />
                              </div>
                              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/40">No Image</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#09040f] via-transparent to-black/30 pointer-events-none" />

                            {/* Top Badges */}
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Paid • Active
                              </span>
                            </div>

                            <div className="absolute bottom-2.5 left-4 right-4">
                              <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#E3B8DE] bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10">
                                {item.slug === 'better-man' ? 'Executive Life Coaching' : 'Masterclass Series'}
                              </span>
                            </div>
                          </div>

                          {/* Course Body Details */}
                          <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h2 
                                className="text-lg sm:text-xl text-white font-bold tracking-tight"
                                style={{ fontFamily: 'var(--head)' }}
                              >
                                {item.title}
                              </h2>
                              <p className="text-xs text-white/50 mt-1 font-sans leading-relaxed line-clamp-2">
                                {item.lede || `${item.modulesCount || 8} modular frameworks, executive blueprints & lifetime updates.`}
                              </p>
                            </div>

                            {/* Compact Meta Specs Row */}
                            <div className="grid grid-cols-3 gap-2 py-1">
                              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                <p className="text-[9px] uppercase tracking-wider text-white/40">Curriculum</p>
                                <p className="text-[11px] font-bold text-white mt-0.5">{item.modulesCount || 8} Modules</p>
                              </div>

                              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                <p className="text-[9px] uppercase tracking-wider text-white/40">Access</p>
                                <p className="text-[11px] font-bold text-white mt-0.5">Lifetime</p>
                              </div>

                              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                <p className="text-[9px] uppercase tracking-wider text-white/40">Mentorship</p>
                                <p className="text-[11px] font-bold text-[#E3B8DE] mt-0.5">3 Sessions</p>
                              </div>
                            </div>

                            {/* Primary CTA Button: GO TO COURSE */}
                            <div>
                              <Link
                                to={item.slug === 'better-man' ? '/course?learn=true' : `/course/${item.slug}?learn=true`}
                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#A83B96] via-[#C878BE] to-[#7A2A70] text-white text-xs uppercase tracking-[0.18em] font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-none"
                              >
                                <BookOpen size={16} weight="bold" /> Resume Learning <ArrowRight size={15} weight="bold" />
                              </Link>
                            </div>

                            {/* 1-on-1 Coaching Sessions Bonus Box */}
                            <div className="rounded-xl border border-[#C878BE]/20 bg-white/[0.02] p-3.5 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#E3B8DE]">
                                  <Sparkle size={12} weight="fill" className="text-[#C878BE]" /> 3 Free 1-on-1 Sessions
                                </div>
                                <span className="text-[10px] font-semibold text-[#E3B8DE] bg-[#C878BE]/15 px-2 py-0.5 rounded border border-[#C878BE]/30">
                                  3 Sessions Included
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-3 pt-1">
                                <p className="text-[11px] text-white/50 font-sans leading-tight">
                                  Schedule your private executive session with Aarkesh at ₹0.
                                </p>
                                <button
                                  onClick={handleBookFreeSession}
                                  disabled={isSyncingCoaching}
                                  className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-[#A83B96] via-[#C878BE] to-[#7A2A70] hover:from-[#BA42A7] hover:to-[#8E3283] text-white text-xs uppercase tracking-[0.18em] font-bold shadow-[0_0_15px_rgba(200,120,190,0.3)] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(200,120,190,0.5)] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                                >
                                  <CalendarPlus size={15} weight="bold" /> {isSyncingCoaching ? 'Opening...' : 'Book Call'}
                                </button>
                              </div>
                            </div>

                            {/* Official Tax Invoice Link */}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                              <span className="text-[11px] text-white/40 font-mono truncate max-w-[200px]">
                                Txn: {user?.latestPurchase?.transactionId?.slice(0, 14) || 'pay_verified'}...
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowInvoiceModal(true)}
                                className="text-[11px] text-[#E3B8DE] hover:text-white hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Receipt size={13} /> View Invoice
                              </button>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Not Enrolled Banner */
                    <div className="max-w-[480px] rounded-2xl border border-[#C878BE]/30 bg-gradient-to-b from-[#140b20] to-[#0a0512] p-6 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-[#C878BE]/15 text-[#E3B8DE] flex items-center justify-center mx-auto">
                        <Crown size={24} />
                      </div>
                      <div>
                        <h2 
                          className="text-lg text-white font-bold"
                          style={{ fontFamily: 'var(--head)' }}
                        >
                          Unlock The Mastery Course
                        </h2>
                        <p className="text-xs text-white/50 mt-1 font-sans">
                          Enroll now for full lifetime video access and 3 free 1-on-1 coaching calls.
                        </p>
                      </div>
                      <Link
                        to="/course?checkout=true"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(200,120,190,0.4)] transition-all"
                      >
                        <Crown size={15} weight="fill" /> Enroll Now <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              )}

            </section>
          </div>
        )}
      </main>

      {/* Invoice Modal if user wants to view receipt */}
      {showInvoiceModal && isPurchased && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#0e0a16] border border-[#C878BE]/40 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--head)' }}>
                Official Tax Invoice
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-start pb-4 border-b border-white/5">
                <div>
                  <p className="font-bold text-sm text-white">Better With Aarkesh</p>
                  <p className="text-white/50">Executive Gravitas &amp; Life Coaching</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">PAID</span>
                  <p className="text-white/60 mt-1 font-mono">{user?.latestPurchase?.transactionId || 'pay_verified'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <p className="text-white/40 uppercase tracking-wider text-[10px]">Client</p>
                  <p className="text-white font-semibold">{displayName}</p>
                  <p className="text-white/60">{user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 uppercase tracking-wider text-[10px]">Program</p>
                  <p className="text-white font-semibold">Mastery Course Lifetime</p>
                  <p className="text-[#E3B8DE] font-bold">₹{(user?.latestPurchase?.amount || 11800).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

