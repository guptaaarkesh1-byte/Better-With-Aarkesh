import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useSectionSnap() {
  useEffect(() => {
    // Wait for the DOM and styling to fully render before calculating snap points
    const initSnap = () => {
      // Refresh ScrollTrigger to ensure accurate layout calculations
      ScrollTrigger.refresh();

      const snapTrigger = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        snap: {
          snapTo: '.snap-section',
          duration: { min: 0.35, max: 0.6 },
          delay: 0.1,
          ease: 'power2.inOut',
          directional: true,
        },
      });

      return snapTrigger;
    };

    // Use requestAnimationFrame to ensure we run after layout changes
    let snapTriggerInstance = null;
    const frameId = requestAnimationFrame(() => {
      snapTriggerInstance = initSnap();
    });

    // Handle resize to refresh ScrollTrigger calculations
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (snapTriggerInstance) {
        snapTriggerInstance.kill();
      }
    };
  }, []);
}
