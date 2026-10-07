import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  SignOut,
  Crown,
  BookOpen,
  Books,
  ArrowRight,
  Sparkle,
  CalendarPlus,
  Receipt,
  Printer,
  Play
} from '@phosphor-icons/react';
import FlippingWordSwap from '../../components/ui/FlippingWordSwap';
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

export default function MyCourses() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [coursesMap, setCoursesMap] = useState({});

  // Navbar Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = React.useRef(null);
  const [isSyncingCoaching, setIsSyncingCoaching] = useState(false);

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
    // Fetch dynamic course settings map for thumbnails and metadata
    const fetchCoursesMap = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/api/courses/details-settings`);
        if (res.ok) {
          const data = await res.json();
          setCoursesMap(data || {});
        }
      } catch (e) {
        console.error('Error fetching course detail settings:', e);
      }
    };
    fetchCoursesMap();
  }, []);

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
          localStorage.setItem('courseUser', JSON.stringify(data));
          if (data.isPurchased) {
            localStorage.setItem('isCoursePurchased', 'true');
          }
        } else {
          const storedUser = localStorage.getItem('courseUser');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (err) {
        console.error('Error fetching user profile for courses:', err);
        const storedUser = localStorage.getItem('courseUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
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

  const handleBookFreeSession = async () => {
    setIsSyncingCoaching(true);
    const courseEmail = user?.email || '';
    const courseName = user?.fullName || '';
    const coursePhone = user?.phoneNumber || '';
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

  const displayName = user?.fullName || 'Executive Member';
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

  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState(null);

  const [curriculums, setCurriculums] = useState({});

  useEffect(() => {
    const fetchAllCurriculums = async () => {
      try {
        const token = localStorage.getItem('courseToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const API_URL = import.meta.env.VITE_API_URL || '';
        
        const slugs = ['better-man'];
        if (Array.isArray(user?.purchasedCourses)) {
          user.purchasedCourses.forEach(s => { if (s && !slugs.includes(s)) slugs.push(s); });
        }
        if (Array.isArray(user?.enrolledCourses)) {
          user.enrolledCourses.forEach(c => { if (c?.slug && !slugs.includes(c.slug)) slugs.push(c.slug); });
        }

        const newMap = {};
        await Promise.all(
          slugs.map(async (s) => {
            try {
              const res = await fetch(`${API_URL}/api/courses/curriculum/${s}`, { headers });
              if (res.ok) {
                const data = await res.json();
                if (data && data.modules) {
                  newMap[s] = data.modules;
                }
              }
            } catch {}
          })
        );
        if (Object.keys(newMap).length > 0) {
          setCurriculums(prev => ({ ...prev, ...newMap }));
        }
      } catch (e) {
        console.error('Failed to fetch curriculums:', e);
      }
    };

    fetchAllCurriculums();
    window.addEventListener('focus', fetchAllCurriculums);
    const interval = setInterval(fetchAllCurriculums, 4000);
    return () => {
      window.removeEventListener('focus', fetchAllCurriculums);
      clearInterval(interval);
    };
  }, [user]);

  const getCourseProgress = (courseSlug = 'better-man', fallbackTotal = 1) => {
    try {
      const modules = curriculums[courseSlug];
      let completedIds = [];
      try {
        const saved = localStorage.getItem(`course_completed_lessons_${courseSlug}`) ||
                      localStorage.getItem('bwa_completed_lessons_cache') ||
                      localStorage.getItem('course_completed_lessons');
        if (saved) {
          completedIds = JSON.parse(saved);
          if (!Array.isArray(completedIds)) completedIds = [];
        }
      } catch {}

      if (Array.isArray(modules) && modules.length > 0) {
        const allLessons = modules.flatMap(m => m.lessons || []);
        const totalLessons = allLessons.length;
        if (totalLessons === 0) {
          return { percent: 0, count: 0, total: 0, modulesCount: modules.length };
        }
        const completedCount = allLessons.filter(l => {
          const lId = (l._id || l.id)?.toString();
          return Boolean(l.isCompleted || (lId && completedIds.map(String).includes(lId)));
        }).length;

        const percent = Math.min(100, Math.round((completedCount / totalLessons) * 100));
        return {
          percent,
          count: completedCount,
          total: totalLessons,
          modulesCount: modules.length
        };
      }
    } catch (e) {}
    return { percent: 0, count: 0, total: fallbackTotal || 1, modulesCount: 1 };
  };

  const enrolledCourseList = useMemo(() => {
    if (Array.isArray(user?.enrolledCourses) && user.enrolledCourses.length > 0) {
      return user.enrolledCourses.map((c) => {
        const slug = c.slug || 'better-man';
        const dynamicCourse = coursesMap[slug] || {};
        const progressInfo = getCourseProgress(slug, c.totalLessons || c.modulesCount || 1);
        const totalLessons = progressInfo.total > 0 ? progressInfo.total : 1;
        const courseImg = c.imageUrl || c.thumbnailUrl || dynamicCourse.imageUrl || dynamicCourse.thumbnailUrl || '';

        return {
          id: slug,
          slug: slug,
          title: c.title || dynamicCourse.title || (slug === 'better-man' ? 'The Better Man™' : slug),
          subtitle: `${totalLessons} High-Impact Lesson${totalLessons > 1 ? 's' : ''} • Actionable Blueprints`,
          purchaseDate: formatPurchaseDate(c.purchaseDate || user?.latestPurchase?.createdAt || user?.createdAt),
          progress: progressInfo.percent,
          completedLessonsCount: progressInfo.count,
          totalLessons: totalLessons,
          modulesCount: progressInfo.modulesCount || 1,
          image: courseImg,
          freeSessions: user?.freeSessions ?? 3,
          invoiceNumber: c.invoiceNumber || user?.latestPurchase?.invoiceNumber,
          amount: c.amount || user?.latestPurchase?.amount,
          chips: c.chips?.length ? c.chips : (dynamicCourse.chips || [])
        };
      });
    }

    if (isPurchased) {
      const purchasedSlugs = Array.isArray(user?.purchasedCourses) && user.purchasedCourses.length > 0
        ? user.purchasedCourses
        : ['better-man'];
      return purchasedSlugs.map((slug) => {
        const dynamicCourse = coursesMap[slug] || {};
        const progressInfo = getCourseProgress(slug, 1);
        const totalLessons = progressInfo.total > 0 ? progressInfo.total : 1;
        const courseImg = (dynamicCourse.imageUrl && !dynamicCourse.imageUrl.includes('unsplash.com'))
          ? dynamicCourse.imageUrl
          : ((dynamicCourse.thumbnailUrl && !dynamicCourse.thumbnailUrl.includes('unsplash.com')) ? dynamicCourse.thumbnailUrl : '');

        return {
          id: slug,
          slug: slug,
          title: dynamicCourse.title || (slug === 'better-man' ? 'The Better Man™' : slug),
          subtitle: 'Executive Masterclass Series',
          purchaseDate: formatPurchaseDate(user?.latestPurchase?.createdAt || user?.createdAt),
          progress: progressInfo.percent,
          completedLessonsCount: progressInfo.count,
          totalLessons: totalLessons,
          modulesCount: progressInfo.modulesCount || 1,
          image: courseImg,
          freeSessions: user?.freeSessions ?? 3,
          invoiceNumber: user?.latestPurchase?.invoiceNumber,
          amount: user?.latestPurchase?.amount,
          chips: dynamicCourse.chips || []
        };
      });
    }

    return [];
  }, [user, isPurchased, coursesMap, curriculums]);

  return (
    <div className="course-landing-scope min-h-screen bg-[#07040a] text-[#F5F2EB] flex flex-col relative overflow-x-hidden selection:bg-[#C878BE]/30 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#C878BE]/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[600px] h-[600px] bg-[#7A2A70]/10 rounded-full blur-[170px] pointer-events-none" />

      {/* ═══════════════════════════════════════════════════════════════
          TOP GLOBAL NAVIGATION (Unified With Home & Course Pages)
          ═══════════════════════════════════════════════════════════════ */}
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
                className="course-nav-mycourse-btn active"
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

      {/* ═══════════════════════════════════════════════════════════════
          MAIN MY COURSE DASHBOARD CONTAINER
          ═══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-28 sm:pt-32 pb-16 relative z-10">
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#C878BE] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs uppercase tracking-widest text-white/50">Loading your courses...</p>
            </div>
          </div>
        ) : !user && !localStorage.getItem('courseToken') ? (
          <div className="rounded-3xl border border-[#C878BE]/20 bg-[#0e0a16] p-10 text-center max-w-md mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#C878BE]/10 border border-[#C878BE]/30 flex items-center justify-center mx-auto mb-5 text-[#E3B8DE]">
              <BookOpen size={30} weight="light" />
            </div>
            <h2 
              className="text-2xl text-white mb-2 font-bold"
              style={{ fontFamily: 'var(--head)' }}
            >
              Sign In to View My Course
            </h2>
            <p className="text-sm text-white/60 mb-6 font-sans">
              Please sign in to access your enrolled courses, lesson progress, and 1-on-1 coaching calls.
            </p>
            <Link
              to="/course"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white font-semibold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(200,120,190,0.3)] transition-all"
            >
              Go to Course Sign In <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* ═══════════════════════════════════════════════════════════
                MY COURSE MAIN CONTAINER
                ═══════════════════════════════════════════════════════════ */}
            <div className="rounded-3xl border border-white/10 bg-[#0E0610] p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Top My Course Bar */}
              <div className="pb-4 border-b border-white/10">
                <h1 
                  className="text-2xl sm:text-3xl text-white font-bold tracking-tight"
                  style={{ fontFamily: 'var(--head)' }}
                >
                  My Course
                </h1>
                <p className="text-xs text-white/50 mt-1">Your enrolled executive masterclasses &amp; transformation roadmap</p>
              </div>

              {/* Enrolled Course Card */}
              {isPurchased ? (
                <div className="space-y-4 pt-1">
                  {enrolledCourseList.map((item) => (
                    <div 
                      key={item.id}
                      className="group rounded-2xl border border-white/10 bg-[#120916] p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:border-[#C878BE]/40 hover:shadow-[0_0_30px_rgba(200,120,190,0.15)] transition-all duration-300"
                    >
                      {/* Left: 16:9 Thumbnail Preview */}
                      <div className="relative w-full xl:w-80 h-44 sm:h-52 xl:h-40 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-gradient-to-tr from-[#160d24] via-[#2a133d] to-[#0f0717] flex items-center justify-center">
                        {item.image && item.image !== '' ? (
                          <img
                            src={resolveImageUrl(item.image)}
                            alt={item.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-tr from-[#1e0e2e] via-[#12081c] to-[#250d3a]">
                            <div className="w-12 h-12 rounded-2xl bg-[#C878BE]/15 border border-[#C878BE]/30 flex items-center justify-center text-[#E3B8DE] mb-2 shadow-[0_0_20px_rgba(200,120,190,0.2)]">
                              <Crown size={24} weight="duotone" />
                            </div>
                            <p className="text-white font-bold text-xs tracking-wider line-clamp-1 uppercase px-2" style={{ fontFamily: 'var(--head)' }}>
                              {item.title}
                            </p>
                            <span className="text-[10px] text-[#E3B8DE]/70 mt-0.5 font-mono">Masterclass Edition</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                        
                        {/* Top Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Access
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/70 z-10">
                          <span className="font-mono uppercase tracking-widest text-[#E3B8DE]">
                            {item.modulesCount} {item.modulesCount === 1 ? 'MODULE' : 'MODULES'}
                          </span>
                          <span className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] border border-white/10">Full HD</span>
                        </div>
                      </div>

                      {/* Center: Course Details & Matching Progress Bar */}
                      <div className="flex-1 min-w-0 space-y-3.5">
                        <div>
                          <h2 
                            className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-[#E3B8DE] transition-colors"
                            style={{ fontFamily: 'var(--head)' }}
                          >
                            {item.title}
                          </h2>
                          <p className="text-xs text-white/50 mt-1 font-sans">
                            Bought on {item.purchaseDate}
                          </p>
                        </div>

                        {/* Progress Bar Row */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/60 font-medium">
                              Progress <strong className="text-white">{item.progress}%</strong>
                            </span>
                            <span className="text-[11px] text-[#E3B8DE] font-mono">
                              {item.completedLessonsCount} / {item.totalLessons} Lessons
                            </span>
                          </div>
                          
                          {/* Horizontal Progress Bar Track */}
                          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-[#A83B96] via-[#C878BE] to-[#E3B8DE] transition-all duration-700"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Harmonized Matching CTA Buttons */}
                      <div className="flex flex-row xl:flex-col items-center gap-3 shrink-0 pt-2 xl:pt-0 min-w-[210px]">
                        {/* Primary Button: Resume Learning */}
                        <Link
                          to={item.slug === 'better-man' ? '/course?learn=true' : `/course/${item.slug}?learn=true`}
                          className="my-course-action-btn resume flex-1 xl:flex-none w-full"
                        >
                          <Play size={14} weight="fill" />
                          <span>Resume Learning</span>
                        </Link>

                        {/* Secondary Button: Book a Session */}
                        <button
                          type="button"
                          onClick={handleBookFreeSession}
                          disabled={isSyncingCoaching}
                          className="my-course-action-btn book flex-1 xl:flex-none w-full"
                        >
                          <CalendarPlus size={15} weight="bold" />
                          <span>{isSyncingCoaching ? 'Opening...' : 'Book a Session'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Not Enrolled Banner */
                <div className="rounded-2xl border border-[#C878BE]/30 bg-gradient-to-b from-[#140b20] to-[#0a0512] p-8 text-center space-y-4 max-w-xl mx-auto my-4">
                  <div className="w-14 h-14 rounded-full bg-[#C878BE]/15 text-[#E3B8DE] flex items-center justify-center mx-auto">
                    <Crown size={28} />
                  </div>
                  <div>
                    <h3 
                      className="text-xl text-white font-bold"
                      style={{ fontFamily: 'var(--head)' }}
                    >
                      No Enrolled Programs Found
                    </h3>
                    <p className="text-xs text-white/50 mt-1.5 font-sans leading-relaxed">
                      You have not enrolled in any masterclasses yet. Enroll now to unlock lifetime video access, blueprints, and 3 free 1-on-1 executive coaching calls.
                    </p>
                  </div>
                  <Link
                    to="/course/all"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(200,120,190,0.4)] transition-all"
                  >
                    <Crown size={16} weight="fill" /> Explore Masterclasses <ArrowRight size={14} />
                  </Link>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          INVOICE MODAL
          ═══════════════════════════════════════════════════════════════ */}
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
                  <p className="text-white/60 mt-1 font-mono">{selectedInvoiceItem?.invoiceNumber || user?.latestPurchase?.transactionId || 'pay_verified'}</p>
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
                  <p className="text-white font-semibold">{selectedInvoiceItem?.title || user?.latestPurchase?.courseTitle || 'Mastery Course Lifetime'}</p>
                  <p className="text-[#E3B8DE] font-bold">₹{((selectedInvoiceItem?.amount || user?.latestPurchase?.amount) || 11800).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
