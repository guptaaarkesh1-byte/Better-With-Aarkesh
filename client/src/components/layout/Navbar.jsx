import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookmarkSimple, List, X, User, LockKey, SignOut, ArrowRight, Play } from '@phosphor-icons/react';
import Container from '../ui/Container';
import LoginModal from './LoginModal';

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
  const [activeSection, setActiveSection] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('token') ? true : false;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navRef = useRef(null);
  const isManualNavRef = useRef(false);
  const manualNavTimerRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Re-check auth status when route changes or auth event fires
  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    handleAuthChange();
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
      
      if (isManualNavRef.current) return;
      if (window.scrollY < 200 && !location.hash) {
        setActiveSection('');
      }
    };
    window.addEventListener('scroll', handleScroll);
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
  if (location.pathname.startsWith('/course') || location.pathname.startsWith('/courses') || location.pathname === '/library' || location.pathname.startsWith('/articles')) return null;

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
          scrolled || location.pathname === '/my-journey'
            ? 'py-2 bg-[#f5f1e8]/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-b border-black/8' 
            : 'py-2.5 sm:py-3.5 bg-[#f5f1e8]/90 backdrop-blur-md border-b border-black/6'
        )}
      >
        <Container className="flex flex-col gap-2">
          {/* Top Row: Brand Logo & Right Action Buttons */}
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="text-[26px] sm:text-[32px] md:text-[36px] font-semibold text-[#111010] tracking-tight relative z-10 flex items-center whitespace-nowrap leading-tight"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                BetterWith<em className="text-[#802673] font-normal not-italic italic ml-0.5" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Aarkesh</em>
              </Link>
            </div>

            {/* Right Action Controls */}
            <div className="flex-shrink-0 flex items-center gap-3 sm:gap-4">
              <div className="hidden md:flex items-center gap-3">
                {/* Course Button */}
                <button
                  onClick={() => navigate('/course')}
                  className="px-4 py-1.5 rounded-sm border border-black/20 text-[#111010] hover:border-[#802673] hover:text-[#802673] font-sans text-[0.7rem] uppercase tracking-[0.18em] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play size={13} weight="fill" /> COURSE
                </button>

                {/* My Journey / Login */}
                {!isLoggedIn ? (
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-1.5 rounded-sm border border-black/20 text-[#111010] hover:border-[#802673] hover:text-[#802673] font-sans text-[0.7rem] uppercase tracking-[0.18em] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <User size={14} weight="regular" /> LOGIN
                  </button>
                ) : (
                  <div className="relative group">
                    <button
                      onClick={() => navigate('/my-journey')}
                      className="px-4 py-1.5 rounded-sm border border-black/20 text-[#111010] group-hover:border-[#802673] group-hover:text-[#802673] font-sans text-[0.7rem] uppercase tracking-[0.18em] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookmarkSimple size={14} weight="regular" /> MY JOURNEY
                    </button>
                    
                    {/* Account Dropdown */}
                    <div className="absolute top-full right-0 pt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex flex-col pointer-events-none group-hover:pointer-events-auto z-[200]">
                      <div className="rounded-xl border border-black/10 bg-[#ffffff] p-2 shadow-2xl flex flex-col">
                        <span className="font-sans text-[0.65rem] uppercase tracking-[0.18em] font-semibold text-black/50 mb-2 mt-2 px-3 truncate">
                          {JSON.parse(localStorage.getItem('userInfo') || '{}')?.fullName || 'MY ACCOUNT'}
                        </span>

                        <button 
                          onClick={() => navigate('/my-journey/settings')}
                          className="flex items-center gap-3 font-sans text-[0.7rem] uppercase tracking-[0.15em] text-black/80 hover:text-black hover:bg-black/5 transition-colors w-full text-left px-3 py-2 rounded-lg"
                        >
                          <User size={14} /> PROFILE & SETTINGS
                        </button>
                        
                        <button 
                          onClick={() => navigate('/my-journey/settings?tab=SECURITY')}
                          className="flex items-center gap-3 font-sans text-[0.7rem] uppercase tracking-[0.15em] text-black/80 hover:text-black hover:bg-black/5 transition-colors w-full text-left px-3 py-2 rounded-lg mb-1"
                        >
                          <LockKey size={14} /> PRIVACY
                        </button>
                        
                        <div className="w-full h-[1px] bg-black/10 my-1"></div>
                        
                        <button 
                          onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('userInfo');
                            setIsLoggedIn(false);
                            window.dispatchEvent(new Event('auth-change'));
                            navigate('/');
                          }}
                          className="flex items-center gap-3 font-sans text-[0.7rem] uppercase tracking-[0.15em] font-bold text-[#802673] hover:bg-[#802673]/10 transition-colors w-full text-left px-3 py-2 rounded-lg mt-1"
                        >
                          <SignOut size={14} weight="bold" /> LOG OUT
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Book a Session Button */}
                <button 
                  onClick={() => navigate('/book')}
                  className="px-4 py-1.5 rounded-sm border border-black/20 text-[#111010] hover:border-[#802673] hover:text-[#802673] hover:bg-[#f6eaf4] font-sans text-[0.7rem] uppercase tracking-[0.18em] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  BOOK A SESSION
                </button>
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
          <div className="hidden md:flex items-center justify-center w-full pt-1.5 border-t border-black/8">
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
                      'font-sans text-[0.72rem] lg:text-[0.76rem] uppercase tracking-[0.22em] transition-colors duration-300 relative py-1 px-1.5 flex items-center justify-center',
                      active
                        ? 'text-[#111010] font-bold'
                        : 'text-[#555047] hover:text-[#111010] font-semibold'
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
          "fixed inset-0 z-[95] bg-[#f5f1e8]/98 backdrop-blur-2xl flex flex-col items-center justify-center md:hidden w-full h-[100dvh] px-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-top",
          mobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-6 pointer-events-none"
        )}
      >
        <nav className="flex flex-col items-center gap-5 w-full mt-12 overflow-y-auto pb-10">
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
                  "text-2xl font-serif transition-colors duration-300 relative py-1 px-4 flex items-center justify-center",
                  active 
                    ? "text-[#802673] font-semibold underline underline-offset-8" 
                    : "text-[#111010]/80 hover:text-[#111010]"
                )}
                onClick={() => {
                  handleNavClick(link.href);
                  setMobileMenuOpen(false);
                }}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          <div className="w-16 h-[1px] bg-black/10 my-2" />

          <div className="flex flex-col items-center gap-3.5 w-full max-w-xs">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/course');
              }}
              className="w-full text-center py-3 text-xs font-bold uppercase tracking-[0.18em] border border-black/20 rounded-sm text-[#111010] flex items-center justify-center gap-2"
            >
              <Play size={14} weight="fill" /> COURSE
            </button>

            <Link
              to="/my-journey"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 text-xs font-bold uppercase tracking-[0.18em] border border-black/20 rounded-sm text-[#111010] flex items-center justify-center gap-2"
            >
              <BookmarkSimple size={14} weight="regular" /> MY JOURNEY
            </Link>

            <button 
              className="w-full text-center bg-[#111010] text-[#f5f1e8] py-3.5 rounded-sm text-xs font-bold uppercase tracking-[0.18em] shadow-md"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/book');
              }}
            >
              BOOK A SESSION
            </button>
          </div>
        </nav>
      </div>

      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          onSuccess={(data) => {
            setIsLoggedIn(true);
            setShowLoginModal(false);
            if (data?.isRegister) {
              setToastMessage('Account created successfully');
            } else {
              setToastMessage('Logged in successfully');
            }
            setTimeout(() => setToastMessage(''), 4000);
            navigate('/my-journey');
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-white/95 backdrop-blur-xl border border-black/10 px-6 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-lg transition-all duration-300">
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.2em] text-[#111010] flex items-center gap-3 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#802673] animate-pulse"></span>
            {toastMessage}
          </p>
        </div>,
        document.body
      )}
    </>
  );
}
