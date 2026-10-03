import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/layout/Navbar';

gsap.registerPlugin(ScrollTrigger);

export default function MainLayout({ children }) {
  const lenisRef = useRef();
  const location = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    lenisRef.current = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      autoRaf: true,
      infinite: false,
    });

    // Expose lenis globally for scroll locking in modals & manual scrolling
    window.lenis = lenisRef.current;

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenisRef.current.on('scroll', () => {
      ScrollTrigger.update();
    });

    return () => {
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
          if (lenisRef.current) {
            lenisRef.current.scrollTo(element, { 
              offset: 0, 
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
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f1e8] text-paragraph relative selection:bg-accent-gold selection:text-black">
      <Navbar />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
    </div>
  );
}
