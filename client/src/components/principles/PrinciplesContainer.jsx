import React, { useRef, useState, useEffect } from 'react';
import PrincipleProgress from './PrincipleProgress';

export default function PrinciplesContainer({ children }) {
  const container = useRef(null);
  const [activeStep, setActiveStep] = useState(1);
  const [isProgressVisible, setIsProgressVisible] = useState(true);

  useEffect(() => {
    const stepMap = {
      'think-principle': 1,
      'feel-principle': 2,
      'decide-principle': 3,
      'coaching': 4,
      'coaching-journey': 4,
      'testimonials': 5,
    };

    const targetIds = [
      'think-principle',
      'feel-principle',
      'decide-principle',
      'coaching',
      'coaching-journey',
      'testimonials'
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (stepMap[id] !== undefined) {
              setActiveStep(stepMap[id]);
            }
          }
        });
      },
      {
        rootMargin: '-25% 0px -45% 0px',
        threshold: 0.1
      }
    );

    targetIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const meetSection = document.getElementById('meet-aarkesh');
    const testimonialsSection = document.getElementById('testimonials');
    if (!meetSection || !testimonialsSection) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === meetSection) {
            setIsProgressVisible(!entry.isIntersecting);
          } else if (entry.target === testimonialsSection && entry.isIntersecting) {
            setIsProgressVisible(true);
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(meetSection);
    observer.observe(testimonialsSection);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={container} 
      className="relative z-20 w-full"
    >
      {/* 
        Sticky Overlay for the Global Progress Bar 
        It sits on top of all the children (the Principle sections)
        and stays fixed on the screen while scrolling through them.
      */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <div className="sticky top-20 h-[calc(100dvh-5.5rem)] w-full flex items-center justify-end pr-6 md:pr-8 xl:pr-10 pointer-events-none">
          <div className={`hidden lg:flex transition-all duration-500 ${isProgressVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6 pointer-events-none'}`}>
            <div className="pointer-events-auto">
              <PrincipleProgress activeStep={activeStep} />
            </div>
          </div>
        </div>
      </div>

      {/* Render the principle sections (THINK, FEEL, etc.) */}
      {children}
    </div>
  );
}
