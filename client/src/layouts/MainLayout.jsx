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
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Expose lenis globally for scroll locking in modals
    window.lenis = lenisRef.current;

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenisRef.current.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenisRef.current?.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => {
        lenisRef.current?.raf(time * 1000);
      });
      lenisRef.current?.destroy();
      window.lenis = undefined;
    };
  }, []);

  useEffect(() => {
    if (!location.hash && lenisRef.current) {
      // Snap to top immediately on route change if no hash
      lenisRef.current.scrollTo(0, { immediate: true });
      // Still refresh GSAP after a short delay to ensure correct layout
      setTimeout(() => ScrollTrigger.refresh(), 100);
    } else if (location.hash && lenisRef.current) {
      // For hash navigation, wait for GSAP to finish pinning and padding
      // otherwise it calculates the wrong scroll destination.
      setTimeout(() => {
        ScrollTrigger.refresh();
        const element = document.querySelector(location.hash);
        if (element) {
          lenisRef.current.scrollTo(element, { offset: 0, duration: 1.5 });
        }
      }, 500);
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-paragraph relative selection:bg-accent-gold selection:text-black">
      <Navbar />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
    </div>
  );
}
