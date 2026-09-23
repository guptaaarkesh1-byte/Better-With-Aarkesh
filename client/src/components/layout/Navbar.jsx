import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Container from '../ui/Container';
import Button from '../ui/Button';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '../../utils/cn';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookmarkSimple, List, X, User, LockKey, SignOut, ArrowRight, Play } from '@phosphor-icons/react';
import { useBooking } from '../../context/BookingContext';
import LoginModal from './LoginModal';
import ThemeToggle from '../ui/ThemeToggle';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Coaching', href: '/#coaching' },
  { label: 'About', href: '/#meet-aarkesh' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'LIBRARY', href: '/library' },
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
  const { openBookingModal } = useBooking();
  const showMyJourney = location.pathname === '/' || location.pathname === '/library' || location.pathname === '/my-journey';

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
      // Trigger the blurred navbar much earlier, e.g., after 50px of scroll
      setScrolled(window.scrollY > 50);
      
      if (isManualNavRef.current) return;
      if (window.scrollY < 200 && !location.hash) {
        setActiveSection('');
      }
    };
    window.addEventListener('scroll', handleScroll);
    // Call once on mount to handle initial load
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
          // If the element leaves the intersection line downwards (scrolling up)
          // The intersection line is at 30% from the top (rootMargin: '-30%...')
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

  useGSAP(() => {
    gsap.fromTo(navRef.current, 
      { y: -100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.5,
      }
    );
  });

  if (location.pathname.startsWith('/course')) return null;

  const handleNavClick = (href) => {
    let target = null;
    if (href === '/') {
      target = '';
    } else if (href.includes('#')) {
      target = href.replace('/#', '');
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
    <header
      ref={navRef}
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-500',
        scrolled 
          ? 'py-2.5 sm:py-3 bg-black/65 backdrop-blur-xl shadow-lg shadow-black/30 border-b border-white/10' 
          : 'py-3 sm:py-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent'
      )}
    >
      <Container className="relative flex flex-col gap-2.5">
        {/* Top Row: Logo & Action Buttons */}
        <div className="flex items-center justify-between w-full">
          <div className="flex-shrink-0">
            <Link to="/" className="font-serif text-xl sm:text-2xl text-white tracking-tight relative z-10 flex items-center whitespace-nowrap">
              BetterWith<span className="text-white/60">Aarkesh</span>
            </Link>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex flex-shrink-0 items-center justify-end gap-2 lg:gap-2.5">
              <Button 
                variant="outline" 
                className="text-[0.62rem] px-3.5 lg:px-4 py-1.5 lg:py-2 flex items-center gap-1.5 border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-[#050505] tracking-[0.14em]"
                onClick={() => navigate('/course')}
              >
                <Play size={13} weight="light" /> COURSE
              </Button>
              {showMyJourney && (
                <>
                  {!isLoggedIn ? (
                    <Button 
                      variant="outline" 
                      className="text-[0.62rem] px-3.5 lg:px-4 py-1.5 lg:py-2 flex items-center gap-1.5 border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-[#050505] tracking-[0.14em]"
                      onClick={() => setShowLoginModal(true)}
                    >
                      <User size={13} weight="light" /> LOGIN
                    </Button>
                  ) : (
                    <div className="relative group">
                      <Button 
                        variant="outline" 
                        className="text-[0.62rem] px-3.5 lg:px-4 py-1.5 lg:py-2 flex items-center gap-1.5 border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-[#050505] tracking-[0.14em]"
                        onClick={() => {
                          navigate('/my-journey');
                        }}
                      >
                        <BookmarkSimple size={13} weight="light" /> MY JOURNEY
                      </Button>
                      
                      {/* Account Menu Dropdown */}
                      <div className="absolute top-full right-0 pt-4 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex flex-col pointer-events-none group-hover:pointer-events-auto z-[200]">
                        <div className="rounded-lg border border-[#c79c6e]/30 bg-[#0a0a0a]/95 backdrop-blur-xl p-2 shadow-[0_0_40px_rgba(199,156,110,0.15)] flex flex-col">
                          <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-white/50 mb-2 mt-2 px-3 truncate">
                            {JSON.parse(localStorage.getItem('userInfo') || '{}')?.fullName || 'MY ACCOUNT'}
                          </span>
                          
                          <button 
                            onClick={() => navigate('/my-journey')}
                            className="flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-white/70 hover:text-white hover:bg-white/5 transition-colors w-full text-left px-3 py-2.5 rounded"
                          >
                            <BookmarkSimple size={15} /> SAVED LIBRARY
                          </button>

                          <button 
                            onClick={() => navigate('/my-journey/settings')}
                            className="flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-white/70 hover:text-white hover:bg-white/5 transition-colors w-full text-left px-3 py-2.5 rounded"
                          >
                            <User size={15} /> PROFILE & SETTINGS
                          </button>
                          
                          <button 
                            onClick={() => navigate('/my-journey/settings?tab=SECURITY')}
                            className="flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-white/70 hover:text-white hover:bg-white/5 transition-colors w-full text-left px-3 py-2.5 rounded mb-2"
                          >
                            <LockKey size={15} /> PRIVACY
                          </button>
                          
                          <div className="w-full h-[1px] bg-white/10 my-1"></div>
                          
                          <button 
                            onClick={() => {
                              localStorage.removeItem('token');
                              localStorage.removeItem('userInfo');
                              setIsLoggedIn(false);
                              window.dispatchEvent(new Event('auth-change'));
                              navigate('/');
                            }}
                            className="flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white hover:bg-[#c79c6e]/10 transition-colors w-full text-left px-3 py-2.5 rounded mt-1"
                          >
                            <SignOut size={15} weight="bold" /> LOG OUT
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <Button 
                variant="outline" 
                className={cn(
                  "text-[0.62rem] transition-all flex items-center gap-1.5 tracking-[0.14em]",
                  scrolled 
                    ? "bg-[#c79c6e] text-black border-transparent px-3.5 lg:px-4.5 py-1.5 lg:py-2 hover:bg-[#b0885e]" 
                    : "border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black bg-transparent px-3 lg:px-4 py-1.5 lg:py-2"
                )}
                onClick={() => navigate('/book')}
              >
                BOOK A SESSION {scrolled && <ArrowRight size={13} weight="bold" />}
              </Button>
              <ThemeToggle />
            </div>

            {/* Mobile / Tablet Controls (Theme toggle & Hamburger) */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle size={16} />
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white focus:outline-none p-1 transition-transform active:scale-95 cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={26} weight="light" /> : <List size={26} weight="light" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Navigation Tabs */}
        <div className="hidden md:flex items-center justify-center w-full pt-1.5 border-t border-white/[0.08]">
          <nav className="flex items-center justify-center space-x-7 lg:space-x-10 relative">
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
                    'font-sans text-[0.78rem] lg:text-[0.82rem] uppercase tracking-[0.2em] transition-colors duration-300 relative py-1 px-1 flex items-center justify-center',
                    active
                      ? 'text-[#f5dfc6] font-semibold'
                      : 'text-white/65 hover:text-white font-medium'
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeNavUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c79c6e] shadow-[0_0_8px_rgba(199,156,110,0.6)] z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </Container>

      {/* Mobile / Tablet Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-[-1] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center md:hidden w-full h-[100dvh] px-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] origin-top",
          mobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-[10vh] scale-95 pointer-events-none"
        )}
      >
        <nav className="flex flex-col items-center gap-4 w-full mt-12 overflow-y-auto pb-10">
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
                    ? "text-[#f5dfc6] font-medium" 
                    : "text-white/70 hover:text-white"
                )}
                onClick={() => {
                  handleNavClick(link.href);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="relative z-10">{link.label}</span>
                {active && (
                  <motion.div
                    layoutId="activeNavUnderlineMobile"
                    className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-[#c79c6e] shadow-[0_0_6px_rgba(199,156,110,0.5)]"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
          
          <div className="w-12 h-[1px] bg-accent-gold/30 my-2" />

          <div className="flex flex-col items-center gap-3.5 w-full max-w-xs">
            <Button 
              variant="outline" 
              className="w-full text-center border-[#c79c6e]/40 text-[#c79c6e] py-3.5 text-xs tracking-[0.15em] flex justify-center items-center gap-2"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/course');
              }}
            >
              <Play size={16} weight="light" /> COURSE
            </Button>
            {!isLoggedIn ? (
              <Button 
                variant="outline" 
                className="w-full text-center border-[#c79c6e]/40 text-[#c79c6e] py-3.5 text-xs tracking-[0.15em] flex justify-center items-center gap-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLoginModal(true);
                }}
              >
                <User size={16} weight="light" /> LOGIN
              </Button>
            ) : showMyJourney ? (
              <Button 
                variant="outline" 
                className="w-full text-center border-[#c79c6e]/40 text-[#c79c6e] py-3.5 text-xs tracking-[0.15em] flex justify-center items-center gap-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/my-journey');
                }}
              >
                <BookmarkSimple size={16} weight="light" /> MY JOURNEY
              </Button>
            ) : null}
            <Button 
              variant="outline" 
              className="w-full text-center border-[#c79c6e]/40 text-[#c79c6e] py-3.5 text-xs tracking-[0.15em] flex justify-center" 
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/book');
              }}
            >
              BOOK A SESSION
            </Button>
            
            <div className="pt-2 flex items-center justify-center">
              <ThemeToggle showLabel size={18} />
            </div>
          </div>
        </nav>
      </div>
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

      {/* Toast Notification */}
      {toastMessage && createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#c79c6e]/30 px-6 py-4 shadow-[0_0_40px_rgba(199,156,110,0.15)] transition-all duration-300">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c79c6e] animate-pulse"></span>
            {toastMessage}
          </p>
        </div>,
        document.body
      )}
    </header>
  );
}
