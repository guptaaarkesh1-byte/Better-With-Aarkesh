import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookmarkSimple, 
  List, 
  X, 
  User, 
  LockKey, 
  SignOut, 
  ArrowRight, 
  Play, 
  CalendarBlank, 
  CaretUp, 
  CaretDown, 
  Notebook 
} from '@phosphor-icons/react';
import Container from '../ui/Container';
import LoginModal from './LoginModal';
import { clearAllAuth, isAnyUserLoggedIn, getEffectiveUser } from '../../utils/authSync';

const NAV_LINKS = [
  { label: 'HOME', href: '/' },
  { label: 'COACHING', href: '/#coaching' },
  { label: 'ABOUT', href: '/#meet-aarkesh' },
  { label: 'TESTIMONIALS', href: '/#testimonials' },
  { label: 'LIBRARY', href: '/library' },
  { label: 'FAQ', href: '/#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(isAnyUserLoggedIn);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navRef = useRef(null);
  const userMenuRef = useRef(null);
  const isManualNavRef = useRef(false);
  const manualNavTimerRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const [newCoachNotesCount, setNewCoachNotesCount] = useState(0);
  const [freeSessionsCount, setFreeSessionsCount] = useState(0);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Compute user display details
  const effectiveUser = getEffectiveUser();
  const rawName = effectiveUser?.fullName || effectiveUser?.name || 'User';
  const userFirstName = rawName.trim().split(' ')[0].toUpperCase();
  const userDisplayName = rawName.trim().split(' ')[0];
  const userInitial = (userFirstName[0] || 'U').toUpperCase();

  // Sync profile & coach notes dynamically
  useEffect(() => {
    if (!isLoggedIn) {
      setFreeSessionsCount(0);
      setNewCoachNotesCount(0);
      return;
    }

    const currentEffective = getEffectiveUser();
    const initialCredits = Number(currentEffective?.freeSessions) || 0;
    setFreeSessionsCount(initialCredits);

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!token) return;

    // Fetch user profile for latest free sessions
    fetch(`${API_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.freeSessions !== undefined) {
          setFreeSessionsCount(Math.max(0, Number(data.freeSessions)));
        }
      })
      .catch(() => {});

    // Fetch notes to check if coach sent any notes
    fetch(`${API_URL}/api/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const coachNotes = data.filter(n => n.author === 'COACH' || n.isCoachNote || n.unread);
          setNewCoachNotesCount(coachNotes.length);
        }
      })
      .catch(() => {});
  }, [isLoggedIn, location.pathname]);

  // Re-check auth status when route changes or auth event fires
  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(isAnyUserLoggedIn());
    };
    handleAuthChange();
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('course-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('course-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
      setScrolled(currentScroll > 20);
      
      if (isManualNavRef.current) return;
      if (currentScroll < 200 && !location.hash) {
        setActiveSection('');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.hash]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection(null);
      return;
    }

    if (location.hash) {
      const hashTarget = location.hash.replace('#', '');
      isManualNavRef.current = true;
      setActiveSection(hashTarget);
      if (manualNavTimerRef.current) clearTimeout(manualNavTimerRef.current);
      manualNavTimerRef.current = setTimeout(() => {
        isManualNavRef.current = false;
      }, 1600);
    }

    const sections = NAV_LINKS
      .filter(link => link.href.startsWith('/#'))
      .map(link => link.href.replace('/#', ''));

    const PREV_SECTION = {
      'coaching': '',
      'meet-aarkesh': 'coaching',
      'testimonials': 'meet-aarkesh',
      'faq': 'testimonials'
    };

    const observer = new IntersectionObserver((entries) => {
      if (isManualNavRef.current) return;

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        } else {
          if (entry.boundingClientRect.top > (window.innerHeight * 0.3) - 10) {
            setActiveSection(prev => prev === entry.target.id ? (PREV_SECTION[entry.target.id] || '') : prev);
          }
        }
      });
    }, {
      rootMargin: '-30% 0px -70% 0px'
    });

    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [location.pathname, location.hash]);

  // Hide on dedicated pages that manage their own themed navbars
  if (location.pathname.startsWith('/course') || location.pathname.startsWith('/courses') || location.pathname.startsWith('/my-course') || location.pathname.startsWith('/my-courses') || location.pathname.startsWith('/classroom') || location.pathname === '/library' || location.pathname.startsWith('/articles') || location.pathname.startsWith('/my-journey')) return null;

  const handleNavClick = (href) => {
    let target = null;
    if (href === '/') {
      target = '';
      if (location.pathname === '/') {
        if (window.lenis) {
          window.lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } else if (href.includes('#')) {
      target = href.replace('/#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(target);
        if (el) {
          if (window.lenis) {
            window.lenis.scrollTo(el, { offset: -20, duration: 1.2 });
          } else {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }

    if (target !== null) {
      isManualNavRef.current = true;
      setActiveSection(target);
      if (manualNavTimerRef.current) clearTimeout(manualNavTimerRef.current);
      manualNavTimerRef.current = setTimeout(() => {
        isManualNavRef.current = false;
      }, 1600);
    }
  };

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-[100] transition-all duration-300',
          scrolled
            ? 'py-2 bg-[#f5f1e8] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-b border-black/10' 
            : 'py-2.5 sm:py-3.5 bg-[#f5f1e8]/70 border-b border-black/6'
        )}
      >
        <Container className="flex flex-col gap-2">
          {/* Top Row: Brand Logo & Right Action Buttons */}
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="text-[22px] sm:text-[26px] md:text-[28px] lg:text-[32px] font-semibold text-[#111010] tracking-tight relative z-10 flex items-center whitespace-nowrap leading-tight"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                BetterWith<em className="text-[#c9542f] font-normal not-italic ml-0.5" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Aarkesh</em>
              </Link>
            </div>

            {/* Right Action Controls */}
            <div className="flex-shrink-0 flex items-center gap-3 sm:gap-3.5">
              <div className="hidden md:flex items-center gap-2.5 lg:gap-3">
                {/* Course Button */}
                <button
                  onClick={() => navigate('/course')}
                  className="bg-[#c8512d] hover:bg-black text-white rounded-full px-4 lg:px-5 py-2 text-[12px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-[0_2px_8px_rgba(200,81,45,0.25)] transition-all cursor-pointer"
                >
                  <Play size={13} weight="fill" className="text-white" />
                  <span>COURSE</span>
                </button>

                {/* My Journey or Book A Session Button */}
                {isLoggedIn ? (
                  <button 
                    onClick={() => navigate('/my-journey')}
                    className="bg-[#c8512d] hover:bg-black text-white rounded-full px-4 lg:px-5 py-2 text-[12px] font-bold tracking-wider uppercase flex items-center gap-2 shadow-[0_2px_8px_rgba(200,81,45,0.25)] transition-all cursor-pointer"
                  >
                    <CalendarBlank size={15} weight="bold" className="text-white" />
                    <span>MY JOURNEY</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/book')}
                    className="bg-[#c8512d] hover:bg-black text-white rounded-full px-4 lg:px-5 py-2 text-[12px] font-bold tracking-wider uppercase flex items-center gap-2 shadow-[0_2px_8px_rgba(200,81,45,0.25)] transition-all cursor-pointer"
                  >
                    <CalendarBlank size={15} weight="bold" className="text-white" />
                    <span>BOOK A SESSION</span>
                  </button>
                )}

                {/* User Account / Login */}
                {!isLoggedIn ? (
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="bg-white border border-[#1c1714] hover:border-[#c8512d] hover:text-[#c8512d] text-[#1c1714] rounded-full px-4 py-2 text-[12px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <User size={14} weight="bold" />
                    <span>LOGIN</span>
                  </button>
                ) : (
                  <div className="relative" ref={userMenuRef}>
                    {/* User Account Pill */}
                    <button
                      onClick={() => setDropdownOpen(prev => !prev)}
                      className="bg-white border border-[#1c1714] rounded-full pl-1.5 pr-3.5 py-1 flex items-center gap-2.5 font-bold text-[12px] uppercase tracking-wider text-[#1c1714] shadow-xs hover:border-[#c8512d] transition-all cursor-pointer select-none"
                    >
                      <div className="relative w-7 h-7 rounded-full bg-[#c8512d] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {effectiveUser?.photoUrl ? (
                          <img 
                            src={effectiveUser.photoUrl} 
                            alt="" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                            className="w-full h-full object-cover rounded-full absolute inset-0" 
                          />
                        ) : null}
                        <span>{userInitial}</span>
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22c55e] border-2 border-white rounded-full z-10" />
                      </div>
                      <span>{userFirstName}</span>
                      {dropdownOpen ? (
                        <CaretUp size={13} weight="bold" className="text-[#1c1714]" />
                      ) : (
                        <CaretDown size={13} weight="bold" className="text-[#1c1714]" />
                      )}
                    </button>
                    
                    {/* Luxury Account Dropdown Card */}
                    {dropdownOpen && (
                      <div className="absolute top-full right-0 mt-3 w-[320px] bg-[#faf8f6] border border-[#e4dfd9] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header Area */}
                        <div className="p-6 pb-4">
                          <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-[46px] h-[46px] rounded-full bg-[#c8512d] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm overflow-hidden relative border border-[#e4dfd9]">
                              {effectiveUser?.photoUrl ? (
                                <img 
                                  src={effectiveUser.photoUrl} 
                                  alt="" 
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                                  className="w-full h-full object-cover rounded-full absolute inset-0" 
                                />
                              ) : null}
                              <span>{userInitial}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[#c8512d] text-[10.5px] font-bold tracking-[0.18em] uppercase mb-0.5">
                                WELCOME BACK
                              </p>
                              <h3 
                                className="text-[22px] font-semibold text-[#1c1714] leading-tight capitalize truncate"
                                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                              >
                                {userDisplayName}
                              </h3>
                            </div>
                          </div>

                          {/* Sessions Left Dots - only shown if user has free sessions left */}
                          {freeSessionsCount > 0 && (
                            <div className="flex items-center gap-1.5 text-[12px] text-[#555047] font-medium mb-4">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-all",
                                    i < freeSessionsCount
                                      ? "bg-[#c8512d]"
                                      : "border border-[#c8512d] bg-transparent"
                                  )}
                                />
                              ))}
                              <span className="ml-1 text-[#716962]">{freeSessionsCount} of 3 free sessions left</span>
                            </div>
                          )}

                          {/* Black CTA Pill */}
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              navigate('/my-journey');
                            }}
                            className={cn(
                              "w-full h-11 rounded-full bg-[#1c1714] hover:bg-black text-white font-bold text-[11px] tracking-[0.14em] uppercase flex items-center justify-center gap-3 transition-colors cursor-pointer",
                              freeSessionsCount > 0 ? "mt-0" : "mt-2"
                            )}
                          >
                            <span>MY JOURNEY & PROFILE</span>
                            <span className="text-base leading-none">→</span>
                          </button>
                        </div>

                        {/* Bottom Logout Row */}
                        <div className="border-t border-[#e4dfd9] px-6 py-3 bg-[#faf8f6]">
                          <button 
                            onClick={() => {
                              setDropdownOpen(false);
                              clearAllAuth();
                              setIsLoggedIn(false);
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
                )}
              </div>

              {/* Mobile Hamburger Toggle */}
              <div className="md:hidden flex items-center gap-2">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-[#111010] focus:outline-none p-1 transition-transform active:scale-95 cursor-pointer"
                  aria-label="Toggle Menu"
                >
                  {mobileMenuOpen ? <X size={26} weight="bold" /> : <List size={26} weight="bold" />}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Navigation Tabs (New Row below, centered with exact spacing and size) */}
          <div className="hidden md:flex items-center justify-center w-full pt-1.5 border-t border-black/10">
            <nav className="flex items-center justify-center space-x-12 lg:space-x-16 xl:space-x-20 relative">
              {NAV_LINKS.map((link) => {
                let active = false;
                if (location.pathname === '/') {
                  const currentSection = activeSection !== null && activeSection !== undefined 
                    ? activeSection 
                    : (location.hash ? location.hash.replace('#', '') : '');

                  if (link.href === '/') {
                    active = currentSection === '';
                  } else if (link.href.includes('#')) {
                    active = currentSection === link.href.replace('/#', '');
                  }
                } else {
                  active = location.pathname === link.href;
                }

                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={cn(
                      'font-sans text-[0.74rem] lg:text-[0.78rem] uppercase tracking-[0.22em] transition-all duration-300 relative py-1 px-1.5 flex items-center justify-center font-bold',
                      active
                        ? 'text-[#111010]'
                        : 'text-[#111010] hover:text-[#c8512d] opacity-85 hover:opacity-100'
                    )}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {active && (
                      <motion.div
                        layoutId="activeNavUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111010] z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <div 
        className={cn(
          "fixed inset-x-0 top-[52px] sm:top-[60px] z-[95] bg-[#f5f1e8] border-b border-black/10 flex flex-col md:hidden w-full max-h-[calc(100svh-60px)] overflow-y-auto px-5 py-4 shadow-[0_30px_40px_-30px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out origin-top",
          mobileMenuOpen ? "opacity-100 translate-y-0 visible pointer-events-auto" : "opacity-0 -translate-y-3 invisible pointer-events-none"
        )}
      >
        <nav className="flex flex-col w-full" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            let active = false;
            if (location.pathname === '/') {
              const currentSection = activeSection !== null && activeSection !== undefined 
                ? activeSection 
                : (location.hash ? location.hash.replace('#', '') : '');

              if (link.href === '/') {
                active = currentSection === '';
              } else if (link.href.includes('#')) {
                active = currentSection === link.href.replace('/#', '');
              }
            } else {
              active = location.pathname === link.href;
            }

            return (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  "py-3.5 border-b border-black/10 font-serif text-[26px] leading-[1.1] tracking-tight flex items-center justify-between transition-colors",
                  active 
                    ? "text-[#c9542f] font-medium" 
                    : "text-[#111010] hover:text-[#c9542f]"
                )}
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                onClick={() => {
                  handleNavClick(link.href);
                  setMobileMenuOpen(false);
                }}
              >
                <span>{link.label === 'HOME' ? 'Home' : link.label === 'COACHING' ? 'Coaching' : link.label === 'ABOUT' ? 'About' : link.label === 'TESTIMONIALS' ? 'Testimonials' : link.label === 'LIBRARY' ? 'Library' : 'FAQ'}</span>
                {active && <span className="w-2 h-2 rounded-full bg-[#c9542f] shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/course');
            }}
            className="h-11 rounded-full bg-[#c8512d] text-white font-medium text-[12.5px] flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm"
          >
            <Play size={14} weight="fill" />
            <span>Course</span>
          </button>

          {!isLoggedIn ? (
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                setShowLoginModal(true);
              }}
              className="h-11 rounded-full border border-[#1c1714] bg-white text-[#1c1714] font-bold text-[12px] tracking-wider uppercase flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <User size={15} weight="bold" />
              <span>LOGIN</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/my-journey');
              }}
              className="h-11 rounded-full border border-[#1c1714] bg-white text-[#1c1714] font-bold text-[12px] tracking-wider uppercase flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[#c8512d] text-white flex items-center justify-center text-[10px] font-bold">
                {userInitial}
              </div>
              <span>MY JOURNEY</span>
            </button>
          )}

          {/* Full Width Book A Session CTA */}
          <button 
            className="col-span-2 h-12 rounded-full bg-[#c8512d] text-white font-medium text-[13px] flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(200,81,45,0.3)] mt-1 transition-transform active:scale-[0.99] cursor-pointer"
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/book');
            }}
          >
            <CalendarBlank size={16} weight="bold" />
            <span>Book a session</span>
          </button>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          onSuccess={(data) => {
            setIsLoggedIn(true);
            setShowLoginModal(false);

            const effective = getEffectiveUser();
            const rawName = data?.user?.fullName || data?.user?.name || data?.fullName || data?.name || effective?.fullName || effective?.name || '';
            const firstName = rawName.trim().split(' ')[0];
            const isNew = Boolean(data?.isRegister || data?.isNewUser);

            if (isNew) {
              setToastMessage(firstName ? `Welcome to Better With Aarkesh, ${firstName}!` : 'Welcome to Better With Aarkesh!');
            } else {
              setToastMessage(firstName ? `Welcome back, ${firstName}!` : 'Welcome back!');
            }
            setTimeout(() => setToastMessage(''), 4500);
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#1c1714] text-white border border-[#c8512d]/40 px-6 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.35)] rounded-full transition-all duration-300 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
          <p className="font-sans text-[13px] tracking-wide font-medium">
            {toastMessage}
          </p>
        </div>,
        document.body
      )}
    </>
  );
}
