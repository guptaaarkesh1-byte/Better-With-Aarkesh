import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PrincipleProgress from './PrincipleProgress';

gsap.registerPlugin(ScrollTrigger);

export default function PrinciplesContainer({ children }) {
  const container = useRef(null);
  const [activeStep, setActiveStep] = useState(1);

  useGSAP(() => {
    const panels = gsap.utils.toArray('.principle-panel');

    panels.forEach((panel, i) => {
      ScrollTrigger.create({
        trigger: panel,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => setActiveStep(i + 1),
        onEnterBack: () => setActiveStep(i + 1),
      });
    });
  }, { scope: container });

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
            <div className={`hidden lg:flex w-full justify-end pr-8 transition-opacity duration-700 ${activeStep === 5 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
