import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/layout/Navbar';

gsap.registerPlugin(ScrollTrigger);

export default function MainLayout({ children }) {
  const lenisRef = useRef();

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

    // Global scroll snapper for smooth magnet effect
    const snapTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      snap: {
        snapTo: '.snap-start',
        duration: { min: 0.3, max: 0.8 },
        delay: 0.1,
        ease: 'power2.inOut'
      }
    });

    return () => {
      snapTrigger.kill();
      gsap.ticker.remove((time) => {
        lenisRef.current?.raf(time * 1000);
      });
      lenisRef.current?.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-paragraph relative selection:bg-accent-gold selection:text-black">
      <Navbar />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
    </div>
  );
}
