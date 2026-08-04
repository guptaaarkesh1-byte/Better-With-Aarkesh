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
    };
  }, []);

  useEffect(() => {
    if (location.hash && lenisRef.current) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          lenisRef.current.scrollTo(element, { offset: 0, duration: 1.5 });
        }
      }, 100);
    } else if (!location.hash && lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
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
