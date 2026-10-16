import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/layout/Navbar';
import FloatingCTA from '../components/ui/FloatingCTA';

gsap.registerPlugin(ScrollTrigger);

export default function MainLayout({ children }) {
  const lenisRef = useRef();
  const location = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    lenisRef.current = new Lenis({
      duration: 0.75,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.2,
      infinite: false,
    });

    // Expose lenis globally for scroll locking in modals & manual scrolling
    window.lenis = lenisRef.current;

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenisRef.current.on('scroll', ScrollTrigger.update);

    // Bind Lenis directly to GSAP Ticker for smooth 60fps/120fps frame synchronization
    const updateLenis = (time) => {
      lenisRef.current?.raf(time * 1000);
    };
    gsap.ticker.add(updateLenis);
    // Refresh ScrollTrigger when fonts and DOM layout are fully prepared
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    const handleMotionChange = () => {
      ScrollTrigger.refresh();
    };
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      gsap.ticker.remove(updateLenis);
      lenisRef.current?.destroy();
      window.lenis = undefined;
    };
  }, []);

  // Handle route change and cross-page hash navigation accurately
  useEffect(() => {
    if (location.hash) {
      const targetHash = location.hash;
      const scrollToTarget = (immediate = false) => {
        const element = document.querySelector(targetHash);
        if (element) {
          ScrollTrigger.refresh();
          // Keep hash targets below the fixed navigation bar rather than
          // hiding the beginning of a section behind it.
          const navHeight = document.querySelector('header')?.offsetHeight || 0;
          if (lenisRef.current) {
            lenisRef.current.scrollTo(element, { 
              offset: -navHeight,
              duration: immediate ? 0 : 0.9, 
              immediate: immediate 
            });
          } else {
            element.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
          }
        }
      };

      // Multi-stage alignment ensuring accuracy after dynamic mounts & image layouts
      const t1 = setTimeout(() => scrollToTarget(false), 80);
      const t2 = setTimeout(() => scrollToTarget(false), 300);
      const t3 = setTimeout(() => scrollToTarget(false), 650);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      const isArticleResume = location.pathname === '/articles' && (
        location.search.includes('resumeProgress=') ||
        Boolean(location.state?.resumeProgress)
      );

      if (!isArticleResume) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        if (lenisRef.current) {
          lenisRef.current.scrollTo(0, { immediate: true });
        }
      }
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }, [location.pathname, location.hash, location.search]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f5f1e8] text-paragraph relative selection:bg-accent-gold selection:text-black">
      <Navbar />
      <main className="w-full flex-grow flex flex-col">
        {children}
      </main>
      <FloatingCTA />
    </div>
  );
}
