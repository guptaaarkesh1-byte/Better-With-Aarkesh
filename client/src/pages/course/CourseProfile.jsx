import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Envelope,
  Phone,
  LockKey,
  SignOut,
  CaretLeft,
  Crown,
  BookOpen,
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
  DownloadSimple
} from '@phosphor-icons/react';

export default function CourseProfile() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('PROFILE'); // 'PROFILE' | 'ENROLLMENT' | 'BILLING' | 'SECURITY'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedTxn, setCopiedTxn] = useState(false);

  // Edit Profile Form State
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
          // Fallback to local storage
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
    e.preventDefault();
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
        setProfileSuccessMsg('Profile updated successfully.');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      } else {
        setProfileErrorMsg(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setProfileErrorMsg('An error occurred. Please try again.');
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
      setPasswordErrorMsg('New password must be at least 4 characters long');
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
          // Account synced and 3 free sessions granted on backend.
          // We intentionally do NOT set the token in localStorage here,
          // so that the user is forced to manually log in on the booking page.
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

  const handleBackToCourse = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/course');
    }
  };

  const isPurchased = user?.isPurchased || localStorage.getItem('isCoursePurchased') === 'true';

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F2EB] font-sans selection:bg-[#c79c6e]/30 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <header className="flex-none h-[72px] border-b border-white/10 bg-[#0a0a0a] px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <Link to="/course" className="font-serif text-2xl text-white tracking-tight flex items-center hover:opacity-80 transition-opacity">
          BetterWith<span className="text-white/60">Aarkesh</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-[0.65rem] font-sans font-semibold uppercase tracking-[0.18em] px-3.5 py-2 rounded-lg border border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-all flex items-center gap-2 hover:scale-105 shadow-[0_0_20px_rgba(199,156,110,0.1)]"
          >
            <ArrowLeft size={14} weight="bold" /> COACHING
          </Link>
          <button
            onClick={handleBackToCourse}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors"
          >
            <BookOpen size={16} className="text-[#c79c6e]" /> Back to Course
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
          >
            <SignOut size={15} /> Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Navigation Breadcrumb below navbar */}
        <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5 text-white/60">
            <CaretLeft size={14} weight="bold" className="text-[#c79c6e]" /> Coaching
          </Link>
          <span>/</span>
          <button onClick={handleBackToCourse} className="hover:text-white transition-colors">
            Course
          </button>
          <span>/</span>
          <span className="text-[#c79c6e]">Student Profile</span>
        </div>

        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs uppercase tracking-widest text-white/50">Loading profile...</p>
            </div>
          </div>
        ) : !user && !localStorage.getItem('courseToken') ? (
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-10 text-center max-w-md mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5 text-[#c79c6e]">
              <User size={30} weight="light" />
            </div>
            <h2 className="font-serif text-2xl text-white mb-2">No Active Session</h2>
            <p className="text-sm text-white/60 mb-6">
              You are not logged into the course. Please log in from the course dashboard to view and manage your profile.
            </p>
            <Link
              to="/course"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#d8ae80] transition-colors"
            >
              Go to Course <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Header Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#121212] to-[#0a0a0a] p-6 md:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#c79c6e]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
              
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#c79c6e] bg-[#1a1714] flex items-center justify-center text-[#c79c6e] font-serif text-2xl md:text-3xl font-bold shadow-[0_0_30px_rgba(199,156,110,0.25)]">
                      {getInitials(user?.fullName || 'Student')}
                    </div>
                    {isPurchased && (
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#c79c6e] text-black flex items-center justify-center shadow-lg" title="Full Lifetime Access">
                        <Crown size={15} weight="fill" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="font-serif text-2xl md:text-3xl text-white font-medium">
                        {user?.fullName || 'Course Student'}
                      </h1>
                      {isPurchased && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] uppercase tracking-wider font-semibold bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                          <Sparkle size={12} weight="fill" /> Enrolled Member
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60 mt-1 flex items-center gap-2">
                      <Envelope size={15} className="text-white/40" /> {user?.email || 'N/A'}
                    </p>
                    {user?.phoneNumber && (
                      <p className="text-xs text-white/40 mt-1 flex items-center gap-2">
                        <Phone size={14} className="text-white/40" /> +91 {user?.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto pt-2 md:pt-0 border-t border-white/5 md:border-t-0">
                  {isPurchased ? (
                    <Link
                      to="/course"
                      className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#c79c6e] text-black text-xs font-semibold uppercase tracking-wider hover:bg-[#d8ae80] transition-colors shadow-lg"
                    >
                      <BookOpen size={16} weight="bold" /> Resume Course
                    </Link>
                  ) : (
                    <Link
                      to="/course?checkout=true"
                      className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#c79c6e] text-black text-xs font-semibold uppercase tracking-wider hover:bg-[#d8ae80] transition-colors shadow-lg"
                    >
                      <Crown size={16} weight="fill" /> Unlock Course
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('PROFILE')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium transition-all whitespace-nowrap ${
                  activeTab === 'PROFILE'
                    ? 'bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30 shadow-[0_0_20px_rgba(199,156,110,0.1)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <User size={16} /> Account Details
              </button>
              <button
                onClick={() => setActiveTab('ENROLLMENT')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium transition-all whitespace-nowrap ${
                  activeTab === 'ENROLLMENT'
                    ? 'bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30 shadow-[0_0_20px_rgba(199,156,110,0.1)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Crown size={16} /> Course & Access
              </button>
              <button
                onClick={() => setActiveTab('BILLING')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium transition-all whitespace-nowrap ${
                  activeTab === 'BILLING'
                    ? 'bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30 shadow-[0_0_20px_rgba(199,156,110,0.1)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Receipt size={16} /> Invoices & Billing
              </button>
              <button
                onClick={() => setActiveTab('SECURITY')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium transition-all whitespace-nowrap ${
                  activeTab === 'SECURITY'
                    ? 'bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30 shadow-[0_0_20px_rgba(199,156,110,0.1)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <LockKey size={16} /> Security
              </button>
            </div>

            {/* TAB 1: Account Details */}
            {activeTab === 'PROFILE' && (
              <div className="w-full">
                <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 md:p-8 shadow-xl w-full">
                  <div className="mb-6">
                    <h2 className="font-serif text-xl text-white">Personal Information</h2>
                    <p className="text-xs text-white/50 mt-1">
                      Update your profile information associated with your course student account.
                    </p>
                  </div>

                  {profileSuccessMsg && (
                    <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle size={18} weight="fill" /> {profileSuccessMsg}
                    </div>
                  )}

                  {profileErrorMsg && (
                    <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                      {profileErrorMsg}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                        Full Name
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 focus:border-[#c79c6e] focus:outline-none focus:ring-1 focus:ring-[#c79c6e] transition-all text-sm"
                          placeholder="Your Full Name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                        Email Address <span className="text-xs text-white/40 font-normal lowercase">(cannot be changed)</span>
                      </label>
                      <div className="relative">
                        <Envelope size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-11 pr-24 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-white/50 cursor-not-allowed text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[0.65rem] font-semibold uppercase tracking-wider">
                          Verified
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                        Phone Number (10 Digits)
                      </label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <span className="absolute left-11 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phoneNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setPhoneNumber(val);
                          }}
                          className="w-full pl-20 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 focus:border-[#c79c6e] focus:outline-none focus:ring-1 focus:ring-[#c79c6e] transition-all text-sm tracking-wide"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="px-6 py-3 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#d8ae80] transition-colors disabled:opacity-50"
                      >
                        {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: Course & Access */}
            {activeTab === 'ENROLLMENT' && (
              <div className="w-full space-y-6">
                {isPurchased ? (
                  <>
                    {/* 1. Current Purchased Course Card */}
                    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 md:p-8 shadow-xl w-full">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] font-semibold">
                              Current Enrolled Course
                            </span>
                          </div>
                          <h2 className="font-serif text-2xl md:text-3xl text-white font-medium">
                            Better With Aarkesh: The Mastery Course
                          </h2>
                          <p className="text-xs text-white/50 mt-1">
                            Complete access to all modules, video lectures, action blueprints, and lifetime updates.
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-3">
                          <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                            <CheckCircle size={16} weight="fill" /> Active • Lifetime Access
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider mb-1">
                            <BookOpen size={16} className="text-[#c79c6e]" /> Curriculum
                          </div>
                          <p className="text-base font-serif text-white">4 Core Modules</p>
                          <p className="text-xs text-white/40 mt-0.5">14 In-depth Lessons</p>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider mb-1">
                            <Clock size={16} className="text-[#c79c6e]" /> Access Type
                          </div>
                          <p className="text-base font-serif text-white">Full Lifetime Access</p>
                          <p className="text-xs text-white/40 mt-0.5">Self-paced learning</p>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider mb-1">
                            <Crown size={16} className="text-[#c79c6e]" /> Community
                          </div>
                          <p className="text-base font-serif text-white">Direct Guidance</p>
                          <p className="text-xs text-white/40 mt-0.5">Aarkesh Mentorship</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-xs text-white/50">
                          Ready to resume watching and studying your course materials?
                        </p>
                        <Link
                          to="/course"
                          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold tracking-wider uppercase transition-colors"
                        >
                          <BookOpen size={15} /> Open Course Player <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* 2. Free 3 Coaching Sessions Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-[#c79c6e]/30 bg-gradient-to-br from-[#141210] via-[#0d0c0a] to-[#0a0a0a] p-6 md:p-8 shadow-[0_0_50px_rgba(199,156,110,0.1)] w-full">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-[#c79c6e]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/40 text-[#c79c6e] text-[0.65rem] font-semibold uppercase tracking-[0.2em]">
                              <Sparkle size={13} weight="fill" /> Course Bonus
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[0.65rem] font-semibold uppercase tracking-wider">
                              <CheckCircle size={13} weight="fill" /> {user?.freeSessions ?? 3} of 3 Available
                            </span>
                          </div>

                          <h3 className="font-serif text-2xl md:text-3xl text-white font-normal tracking-tight">
                            3 Complimentary 1-on-1 Coaching Sessions
                          </h3>

                          <p className="text-xs md:text-sm text-white/70 font-sans leading-relaxed">
                            As an enrolled student, you receive 3 private 1-on-1 coaching sessions with Aarkesh at ₹0. To claim and schedule your sessions, click below and <span className="text-[#c79c6e] font-medium">log in or register using your course email (<span className="underline">{user?.email}</span>)</span> on the booking portal.
                          </p>

                          {/* Step-by-Step Info Box */}
                          <div className="p-3 rounded-xl border border-[#c79c6e]/20 bg-white/[0.02] flex flex-col gap-1.5 text-xs text-white/70">
                            <span className="text-[0.68rem] uppercase tracking-wider text-[#c79c6e] font-semibold flex items-center gap-1.5">
                              <Sparkle size={12} weight="fill" /> How to schedule your session:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[0.72rem] text-white/60">
                              <div className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                                <strong className="text-white">1. Click Button:</strong> Redirect to booking page
                              </div>
                              <div className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                                <strong className="text-white">2. Same Email:</strong> Register to claim 3 sessions
                              </div>
                              <div className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                                <strong className="text-white">3. Book at ₹0:</strong> 3 free sessions applied
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                              <CheckCircle size={14} weight="fill" className="text-[#c79c6e]" /> {user?.freeSessions ?? 3} Free Credits Left
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                              <CheckCircle size={14} weight="fill" className="text-[#c79c6e]" /> Direct Mentorship
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                              <CheckCircle size={14} weight="fill" className="text-[#c79c6e]" /> ₹0 Direct Booking
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-start lg:items-end gap-2 pt-2 lg:pt-0">
                          <button
                            onClick={handleBookFreeSession}
                            disabled={isSyncingCoaching}
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-[0.18em] hover:bg-[#d8ae80] hover:scale-[1.02] transition-all shadow-[0_0_25px_rgba(199,156,110,0.25)] disabled:opacity-50"
                          >
                            <CalendarPlus size={16} weight="bold" /> {isSyncingCoaching ? 'Opening Booking...' : 'Book Free Session'} <ArrowRight size={15} weight="bold" />
                          </button>
                          <span className="text-[0.68rem] text-white/40 tracking-wide">
                            Included with your course • ₹0 checkout
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Quick Bill / Tax Receipt Link Card */}
                    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#c79c6e]/10 border border-[#c79c6e]/25 flex items-center justify-center text-[#c79c6e] shrink-0">
                          <Receipt size={22} weight="fill" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-semibold text-sm">Course Tax Invoice &amp; Payment Receipt</h4>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold font-mono">PAID</span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">
                            Transaction ID: <span className="font-mono text-white/80">{user?.latestPurchase?.transactionId || user?.latestPurchase?.razorpayPaymentId || 'pay_verified'}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab('BILLING')}
                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[#c79c6e] hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <FileText size={15} />
                        <span>View Full Invoice &amp; Bill</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  /* Course Purchase Card for unpurchased users */
                  <div className="relative overflow-hidden rounded-2xl border border-[#c79c6e]/40 bg-gradient-to-br from-[#15120f] via-[#0d0c0a] to-[#0a0a0a] p-8 md:p-12 shadow-[0_0_50px_rgba(199,156,110,0.15)] w-full">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#c79c6e]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/40 text-[#c79c6e] text-xs font-semibold uppercase tracking-[0.2em]">
                          <Crown size={14} weight="fill" /> Course Access
                        </div>

                        <h2 className="font-serif text-3xl md:text-4xl text-white font-normal tracking-tight">
                          Unlock Better With Aarkesh: The Mastery Course
                        </h2>

                        <p className="text-sm md:text-base text-white/70 font-sans leading-relaxed">
                          You haven't unlocked the Mastery Course yet. Enroll today to get instant lifetime access to the complete video curriculum, action blueprints, and 3 complimentary 1-on-1 private coaching sessions with Aarkesh.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div className="flex items-center gap-2.5 text-xs text-white/70 bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
                            <BookOpen size={16} className="text-[#c79c6e] shrink-0" /> 4 Modules & 14 Lessons
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-white/70 bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
                            <Sparkle size={16} weight="fill" className="text-[#c79c6e] shrink-0" /> 3 Free 1-on-1 Sessions
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-white/70 bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
                            <Crown size={16} weight="fill" className="text-[#c79c6e] shrink-0" /> Lifetime Full Access
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-start lg:items-end gap-3 pt-4 lg:pt-0">
                        <Link
                          to="/course?checkout=true"
                          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-[0.2em] hover:bg-[#d8ae80] hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(199,156,110,0.3)]"
                        >
                          <Crown size={16} weight="fill" /> Purchase Course Now <ArrowRight size={16} weight="bold" />
                        </Link>
                        <span className="text-[0.7rem] text-white/40 tracking-wider">
                          Instant access upon checkout
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Invoices & Billing */}
            {activeTab === 'BILLING' && (
              <div className="w-full space-y-6">
                {isPurchased ? (
                  <div className="space-y-6">
                    {/* Header with Print CTA */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 print:hidden">
                      <div>
                        <h2 className="font-serif text-2xl text-white">Course Tax Invoice &amp; Receipts</h2>
                        <p className="text-xs text-white/50 mt-1">
                          Official tax invoice and Razorpay transaction receipt for your lifetime enrollment.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Printer size={16} />
                        <span>Print / Save PDF</span>
                      </button>
                    </div>

                    {/* Official Tax Invoice Card */}
                    {(() => {
                      const latest = user?.latestPurchase || {};
                      const txnId = latest.transactionId || latest.razorpayPaymentId || 'pay_verified_success';
                      const orderId = latest.razorpayOrderId || 'order_verified';
                      const finalAmount = latest.amount || user?.coursePricing?.price || 11800;
                      const gstRate = user?.coursePricing?.gstRate !== undefined ? user.coursePricing.gstRate : 18;
                      const isGstIncluded = Boolean(user?.coursePricing?.isGstIncluded);
                      const basePrice = isGstIncluded ? finalAmount : Math.round(finalAmount / (1 + (gstRate / 100)));
                      const gstAmount = finalAmount - basePrice;
                      
                      const purchaseDate = latest.purchaseDate ? new Date(latest.purchaseDate) : (latest.createdAt ? new Date(latest.createdAt) : new Date());
                      const formattedDate = purchaseDate.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const invoiceNumber = `INV-${purchaseDate.getFullYear()}${String(purchaseDate.getMonth() + 1).padStart(2, '0')}-${txnId.slice(-6).toUpperCase()}`;

                      const invoiceHeading = latest.invoiceItemTitle || user?.coursePricing?.invoiceItemTitle || (latest.courseTitle ? `${latest.courseTitle} — Masterclass Lifetime Access` : 'The Better Man™ — Masterclass Lifetime Access');
                      const invoiceSubtitle = latest.invoiceItemSubtitle || user?.coursePricing?.invoiceItemSubtitle || 'Complete modular video lessons, action blueprints & community';
                      const bonusHeading = latest.bonusItemTitle || user?.coursePricing?.bonusItemTitle || '3 Private 1-on-1 Executive Coaching Sessions with Aarkesh';
                      const bonusSubtitle = latest.bonusItemSubtitle || user?.coursePricing?.bonusItemSubtitle || 'Valued at ₹15,000 — 100% Complimentary student bonus';

                      const handleCopyTxn = () => {
                        navigator.clipboard.writeText(txnId);
                        setCopiedTxn(true);
                        setTimeout(() => setCopiedTxn(false), 2500);
                      };

                      return (
                        <div 
                          id="profile-invoice-card"
                          className="rounded-3xl border border-[#c79c6e]/30 bg-[#0a0a0a]/95 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-gray-300 print:shadow-none"
                        >
                          <div className="absolute top-0 right-0 w-36 h-36 bg-[#c79c6e]/10 blur-3xl pointer-events-none print:hidden" />

                          {/* Invoice Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-white/10 print:border-gray-300">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-serif text-xl sm:text-2xl text-white font-bold tracking-tight print:text-black">
                                  Better With Aarkesh
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[#c79c6e]/20 text-[#c79c6e] text-[10px] font-mono font-bold tracking-wider print:border print:border-gray-400">
                                  OFFICIAL INVOICE
                                </span>
                              </div>
                              <p className="font-sans text-xs text-white/50 print:text-gray-600">
                                Executive Leadership, Communication &amp; Gravitas Coaching
                              </p>
                              <p className="font-sans text-[11px] text-white/40 print:text-gray-500 mt-0.5">
                                support@aarkeshgupta.com · https://aarkeshgupta.com
                              </p>
                            </div>

                            <div className="sm:text-right space-y-1 font-mono text-xs">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px] tracking-widest border border-emerald-500/30 print:text-emerald-700 print:border-emerald-600">
                                <span>PAID IN FULL</span>
                              </div>
                              <div className="text-white/80 print:text-gray-800 pt-1">
                                <span className="text-white/40 print:text-gray-500">Invoice: </span>
                                <strong>{invoiceNumber}</strong>
                              </div>
                              <div className="text-white/60 print:text-gray-600 text-[11px]">
                                {formattedDate}
                              </div>
                            </div>
                          </div>

                          {/* Billed To & Payment Metadata */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-white/10 print:border-gray-300 text-xs">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase tracking-widest text-[#c79c6e] font-semibold block print:text-[#916b3f]">
                                BILLED TO (STUDENT)
                              </span>
                              <p className="font-semibold text-white text-sm print:text-black">{user?.fullName || 'Valued Student'}</p>
                              <p className="text-white/60 print:text-gray-600">{user?.email}</p>
                              {user?.phoneNumber && (
                                <p className="text-white/40 print:text-gray-500 text-[11px]">+91 {user?.phoneNumber}</p>
                              )}
                              <p className="text-white/40 print:text-gray-500 text-[11px]">Enrollment: <span className="text-emerald-400 font-semibold print:text-emerald-700">Lifetime Active</span></p>
                            </div>

                            <div className="space-y-1 sm:text-right">
                              <span className="text-[10px] uppercase tracking-widest text-[#c79c6e] font-semibold block print:text-[#916b3f]">
                                PAYMENT TRANSACTION DETAILS
                              </span>
                              <div className="flex items-center sm:justify-end gap-1.5 font-mono text-white/90 print:text-black">
                                <span>ID: {txnId}</span>
                                <button
                                  type="button"
                                  onClick={handleCopyTxn}
                                  className="p-1 text-white/50 hover:text-white transition-colors print:hidden"
                                  title="Copy Transaction ID"
                                >
                                  {copiedTxn ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                </button>
                              </div>
                              <p className="text-white/50 print:text-gray-600 font-mono text-[11px]">Order: {orderId}</p>
                              <p className="text-white/40 print:text-gray-500 text-[11px]">Gateway: Razorpay 256-bit Secure</p>
                            </div>
                          </div>

                          {/* Itemized Table */}
                          <div className="py-6 border-b border-white/10 print:border-gray-300">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-white/10 print:border-gray-300 text-[10px] uppercase tracking-widest text-white/40 print:text-gray-500">
                                  <th className="pb-3 font-semibold">Description</th>
                                  <th className="pb-3 text-center font-semibold">Qty</th>
                                  <th className="pb-3 text-right font-semibold">Amount (INR)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 print:divide-gray-200">
                                <tr>
                                  <td className="py-3 pr-4">
                                    <span className="font-semibold text-white block print:text-black">
                                      {invoiceHeading}
                                    </span>
                                    <span className="text-[11px] text-white/50 print:text-gray-500 block">
                                      {invoiceSubtitle}
                                    </span>
                                  </td>
                                  <td className="py-3 text-center text-white/70 print:text-gray-700 font-mono">1</td>
                                  <td className="py-3 text-right font-mono text-white print:text-black">
                                    ₹{basePrice.toLocaleString('en-IN')}
                                  </td>
                                </tr>

                                <tr>
                                  <td className="py-2.5 pr-4">
                                    <span className="text-white/80 print:text-gray-800">
                                      Goods &amp; Services Tax (GST @ {gstRate}%)
                                    </span>
                                    {isGstIncluded && (
                                      <span className="text-[10px] text-white/40 print:text-gray-500 ml-1.5">(Inclusive)</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 text-center text-white/50 print:text-gray-500 font-mono">-</td>
                                  <td className="py-2.5 text-right font-mono text-white/90 print:text-black">
                                    ₹{gstAmount.toLocaleString('en-IN')}
                                  </td>
                                </tr>

                                {bonusHeading && (
                                  <tr>
                                    <td className="py-2.5 pr-4">
                                      <span className="text-emerald-400 font-semibold print:text-emerald-700 flex items-center gap-1.5">
                                        <Sparkle size={13} weight="fill" />
                                        {bonusHeading}
                                      </span>
                                      {bonusSubtitle && (
                                        <span className="text-[11px] text-white/40 print:text-gray-500 block">
                                          {bonusSubtitle}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 text-center text-emerald-400 print:text-emerald-700 font-mono">3</td>
                                    <td className="py-2.5 text-right font-mono font-bold text-emerald-400 print:text-emerald-700">
                                      FREE (₹0)
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Total Calculations */}
                          <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="text-xs text-white/50 print:text-gray-600 max-w-sm">
                              <p>
                                Official tax invoice and proof of enrollment. All sales are authenticated via Razorpay.
                              </p>
                            </div>

                            <div className="w-full sm:w-auto space-y-1.5 sm:text-right font-mono text-xs">
                              <div className="flex justify-between sm:justify-end gap-6 text-white/70 print:text-gray-700">
                                <span>Subtotal:</span>
                                <span>₹{basePrice.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between sm:justify-end gap-6 text-white/70 print:text-gray-700">
                                <span>GST ({gstRate}%):</span>
                                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="pt-2 border-t border-white/10 print:border-gray-300 flex justify-between sm:justify-end gap-6 text-base font-bold text-white print:text-black">
                                <span>Total Paid:</span>
                                <span className="text-[#c79c6e] font-bold text-lg print:text-black">
                                  ₹{finalAmount.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mx-auto">
                      <Receipt size={28} />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white">No Purchase Invoices Found</h3>
                      <p className="text-xs text-white/50 mt-1 max-w-md mx-auto">
                        You have not purchased the course yet. Once you enroll, your official tax invoices and transaction IDs will appear here.
                      </p>
                    </div>
                    <Link
                      to="/course?checkout=true"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c79c6e] text-black text-xs font-semibold uppercase tracking-wider hover:bg-[#d8ae80] transition-colors"
                    >
                      <Crown size={15} weight="fill" /> Unlock Course &amp; Enroll
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Security & Password */}
            {activeTab === 'SECURITY' && (
              <div className="w-full">
                <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 md:p-8 shadow-xl w-full">
                  <div className="mb-6">
                    <h2 className="font-serif text-xl text-white">Change Password</h2>
                    <p className="text-xs text-white/50 mt-1">
                      Choose a strong, unique password to protect your course account.
                    </p>
                  </div>

                  {passwordSuccessMsg && (
                    <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle size={18} weight="fill" /> {passwordSuccessMsg}
                    </div>
                  )}

                  {passwordErrorMsg && (
                    <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                      {passwordErrorMsg}
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-5">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                        Current Password
                      </label>
                      <div className="relative">
                        <LockKey size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-11 pr-11 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 focus:border-[#c79c6e] focus:outline-none focus:ring-1 focus:ring-[#c79c6e] transition-all text-sm"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        >
                          {showCurrentPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                        New Password
                      </label>
                      <div className="relative">
                        <LockKey size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-11 pr-11 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 focus:border-[#c79c6e] focus:outline-none focus:ring-1 focus:ring-[#c79c6e] transition-all text-sm"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        >
                          {showNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <LockKey size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 focus:border-[#c79c6e] focus:outline-none focus:ring-1 focus:ring-[#c79c6e] transition-all text-sm"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="px-6 py-3 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#d8ae80] transition-colors disabled:opacity-50"
                      >
                        {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
