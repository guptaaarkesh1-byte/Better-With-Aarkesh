import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Container from '../ui/Container';
import Button from '../ui/Button';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '../../utils/cn';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookmarkSimple, List, X, User, LockKey, SignOut, ArrowRight } from '@phosphor-icons/react';
import { useBooking } from '../../context/BookingContext';
import LoginModal from './LoginModal';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Coaching', href: '/#coaching' },
  { label: 'About', href: '/#meet-aarkesh' },
  { label: 'Testimonials', href: '/#testimonials' },
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
  const location = useLocation();
  const navigate = useNavigate();
  const { openBookingModal } = useBooking();
  const showMyJourney = location.pathname === '/' || location.pathname === '/library' || location.pathname === '/my-journey';

  useEffect(() => {
    const handleScroll = () => {
      // Trigger the blurred navbar much earlier, e.g., after 50px of scroll
      setScrolled(window.scrollY > 50);
      
      if (window.scrollY < 200) {
        setActiveSection('');
      }
    };
    window.addEventListener('scroll', handleScroll);
    // Call once on mount to handle initial load
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') return;

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

    // Fallback if hash exists on load
    if (location.hash) {
      setActiveSection(location.hash.replace('#', ''));
    }

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

  return (
    <header
      ref={navRef}
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-500',
        scrolled ? 'py-4' : 'py-6'
      )}
    >
      {/* Background blur layer */}
      <div 
        className={cn(
          'absolute inset-0 transition-all duration-500',
          scrolled ? 'bg-black/40 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/10' : 'bg-transparent opacity-0'
        )} 
      />
      
      <Container className="relative flex items-center justify-between">
        <div className="flex-shrink-0">
          <Link to="/" className="font-serif text-2xl text-white tracking-tight relative z-10 flex items-center">
            BetterWith<span className="text-white/60">Aarkesh</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center justify-center gap-10 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => {
            let active = false;
            if (location.pathname === '/') {
              if (link.href === '/') {
                active = activeSection === '';
              } else if (link.href.includes('#')) {
                active = activeSection === link.href.replace('/#', '');
              }
            } else {
              active = location.pathname === link.href;
            }

            return (
              <Link
                key={link.label}
                to={link.href}
                className={`font-sans text-xs uppercase tracking-widest relative pb-1 group transition-colors duration-300 ${
                  active ? 'text-[#c79c6e]' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
                <span 
                  className={`absolute left-0 bottom-0 w-full h-[1px] bg-[#c79c6e] origin-left transition-transform duration-300 ease-out ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} 
                />
              </Link>
            );
          })}
        </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-shrink-0 items-center justify-end gap-4">
              {showMyJourney && (
                <>
                  {!isLoggedIn ? (
                    <Button 
                      variant="outline" 
                      className="text-[0.65rem] px-5 py-[0.65rem] flex items-center gap-2 border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-[#050505]"
                      onClick={() => setShowLoginModal(true)}
                    >
                      <User size={14} weight="light" /> LOGIN
                    </Button>
                  ) : (
                    <div className="relative group">
                      <Button 
                        variant="outline" 
                        className="text-[0.65rem] px-5 py-[0.65rem] flex items-center gap-2 border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-[#050505]"
                        onClick={() => {
                          navigate('/my-journey');
                        }}
                      >
                        <BookmarkSimple size={14} weight="light" /> MY JOURNEY
                      </Button>
                      
                      {/* Account Menu Dropdown */}
                      <div className="absolute top-full right-0 pt-4 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex flex-col pointer-events-none group-hover:pointer-events-auto z-[200]">
                        <div className="rounded-lg border border-[#c79c6e]/30 bg-[#0a0a0a]/95 backdrop-blur-xl p-2 shadow-[0_0_40px_rgba(199,156,110,0.15)] flex flex-col">
                          <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-white/50 mb-2 mt-2 px-3">
                            AARKESH
                          </span>
                          
                          <button 
                            onClick={() => navigate('/my-journey/settings')}
                            className="flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-white/70 hover:text-white hover:bg-white/5 transition-colors w-full text-left px-3 py-3 rounded"
                          >
                            <User size={16} /> PROFILE & SETTINGS
                          </button>
                          
                          <button 
                            onClick={() => navigate('/my-journey/settings?tab=SECURITY')}
                            className="flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-white/70 hover:text-white hover:bg-white/5 transition-colors w-full text-left px-3 py-3 rounded mb-2"
                          >
                            <LockKey size={16} /> PRIVACY
                          </button>
                          
                          <div className="w-full h-[1px] bg-white/10 my-1"></div>
                          
                          <button 
                            onClick={() => {
                              localStorage.removeItem('token');
                              localStorage.removeItem('userInfo');
                              setIsLoggedIn(false);
                              navigate('/');
                            }}
                            className="flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white hover:bg-[#c79c6e]/10 transition-colors w-full text-left px-3 py-3 rounded mt-1"
                          >
                            <SignOut size={16} weight="bold" /> LOG OUT
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
                  "text-[0.65rem] transition-all flex items-center gap-2",
                  scrolled 
                    ? "bg-[#c79c6e] text-black border-transparent px-6 py-[0.7rem] hover:bg-[#b0885e]" 
                    : "border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black bg-transparent px-5 py-[0.65rem]"
                )}
                onClick={() => navigate('/book')}
              >
                BOOK A SESSION {scrolled && <ArrowRight size={14} weight="bold" />}
              </Button>
            </div>

            {/* Mobile Hamburger Icon */}
            <div className="lg:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white focus:outline-none p-1 transition-transform active:scale-95"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={28} weight="light" /> : <List size={28} weight="light" />}
              </button>
            </div>
          </div>
      </Container>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-[-1] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center lg:hidden w-full h-[100dvh] px-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] origin-top",
          mobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-[10vh] scale-95 pointer-events-none"
        )}
      >
        <nav className="flex flex-col items-center gap-8 w-full mt-12 overflow-y-auto pb-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-3xl font-serif text-white hover:text-accent-gold transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="w-12 h-[1px] bg-accent-gold/30 my-4" />

          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            {showMyJourney && (
              <Button 
                variant="outline" 
                className="w-full text-center border-[#c79c6e]/40 text-[#c79c6e] py-4 text-xs tracking-[0.15em] flex justify-center items-center gap-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/my-journey');
                }}
              >
                <BookmarkSimple size={16} weight="light" /> MY JOURNEY
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full text-center border-[#c79c6e]/40 text-[#c79c6e] py-4 text-xs tracking-[0.15em] flex justify-center" 
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/book');
              }}
            >
              BOOK A SESSION
            </Button>
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
