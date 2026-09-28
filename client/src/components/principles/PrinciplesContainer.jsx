import React, { useRef, useState, useEffect } from 'react';
import PrincipleProgress from './PrincipleProgress';

export default function PrinciplesContainer({ children }) {
  const container = useRef(null);
  const [activeStep, setActiveStep] = useState(1);
  const [isProgressVisible, setIsProgressVisible] = useState(true);

  useEffect(() => {
    const stepMap = [
      { step: 1, ids: ['think-principle'] },
      { step: 2, ids: ['feel-principle'] },
      { step: 3, ids: ['decide-principle'] },
      { step: 4, ids: ['coaching', 'coaching-journey'] },
      { step: 5, ids: ['testimonials'] },
    ];

    const updateActiveStep = () => {
      const scrollY = window.scrollY;
      const viewportMid = scrollY + window.innerHeight * 0.45;

      // Check if user is currently inside the "About" (Meet Aarkesh) section
      const aboutEl = document.getElementById('meet-aarkesh');
      if (aboutEl) {
        const rect = aboutEl.getBoundingClientRect();
        const top = rect.top + scrollY;
        const bottom = top + rect.height;

        if (viewportMid >= top && viewportMid < bottom) {
          setIsProgressVisible(false);
          return;
        }
      }

      // Check if within principles or testimonials
      let matchedStep = null;

      for (const item of stepMap) {
        for (const id of item.ids) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            const top = rect.top + scrollY;
            const bottom = top + rect.height;

            if (viewportMid >= top && viewportMid < bottom) {
              matchedStep = item.step;
              break;
            }
          }
        }
        if (matchedStep !== null) break;
      }

      if (matchedStep !== null) {
        setActiveStep(matchedStep);
        setIsProgressVisible(true);
      }
    };

    window.addEventListener('scroll', updateActiveStep, { passive: true });
    window.addEventListener('resize', updateActiveStep, { passive: true });
    
    // Initial calls after DOM stabilizes
    updateActiveStep();
    const t1 = setTimeout(updateActiveStep, 300);
    const t2 = setTimeout(updateActiveStep, 1000);

    return () => {
      window.removeEventListener('scroll', updateActiveStep);
      window.removeEventListener('resize', updateActiveStep);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div ref={container} className="relative w-full">
      {/* 
        Sticky Overlay for the Global Progress Bar 
        It sits on top of all the children (the Principle sections)
        and stays fixed on the screen while scrolling through them.
      */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <div className="sticky top-0 h-screen w-full">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-full flex items-center justify-end">
            <div className={`hidden lg:flex w-full justify-end pr-8 transition-all duration-500 ${isProgressVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6 pointer-events-none'}`}>
              <div className="pointer-events-auto">
                <PrincipleProgress activeStep={activeStep} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render the principle sections (THINK, FEEL, etc.) */}
      {children}
    </div>
  );
}
