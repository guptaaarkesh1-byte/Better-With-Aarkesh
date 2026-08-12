import { useRef, useEffect, useState } from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '../../utils/cn';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookmarkSimple, List, X, User, LockKey, SignOut, ArrowRight } from '@phosphor-icons/react';
import { useBooking } from '../../context/BookingContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#meet-aarkesh' },
  { label: 'Coaching', href: '/#coaching' },
  { label: 'LIBRARY', href: '/library' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'FAQ', href: '/#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { openBookingModal } = useBooking();
  const showMyJourney = location.pathname === '/' || location.pathname === '/library' || location.pathname === '/my-journey';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight - 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-500 py-6',
        scrolled ? 'bg-gradient-to-b from-[#090909]/90 to-transparent backdrop-blur-[12px] py-4 shadow-lg shadow-black/10' : 'bg-transparent'
      )}
    >
      <Container className="flex items-center justify-between">
        <div className="flex-shrink-0">
          <Link to="/" className="font-serif text-2xl text-white tracking-tight relative z-10 flex items-center">
            BetterWith<span className="text-white/60">Aarkesh</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center justify-center gap-10 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => {
            let active = false;
            if (link.href === '/') {
              // Home should only be active if there is no hash
              active = location.pathname === '/' && (!location.hash || location.hash === '');
            } else if (link.href.includes('#')) {
              active = location.pathname === '/' && location.hash === link.href.replace('/', '');
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
                      
                      <button className="flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white hover:bg-[#c79c6e]/10 transition-colors w-full text-left px-3 py-3 rounded mt-1">
                        <SignOut size={16} weight="bold" /> LOG OUT
                      </button>
                    </div>
                  </div>
                </div>
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
    </header>
  );
}
