import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function ProblemContent({ problemData = {} }) {
  const container = useRef(null);

  const eyebrow = problemData.eyebrowText || "MAYBE YOU'VE SPENT YEARS";
  const heading1 = problemData.headingLine1 || "Trying to fix what isn't the";
  const headingAccent = problemData.headingAccent || "real problem.";
  const quoteItalic = problemData.quoteItalic || "Things you carry, cloud your perspective.";
  const quoteSubtext = problemData.quoteSubtext || "....Until you learn to see clearly";

  useGSAP(() => {
    // Smooth reveal when section is viewed
    gsap.fromTo(container.current, 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.1 }
    );
  }, { scope: container, dependencies: [eyebrow, heading1, headingAccent, quoteItalic, quoteSubtext] });

  return (
    <div ref={container} className="max-w-lg lg:max-w-xl pt-0 relative z-50">
      
      <div className="flex items-center gap-4 mb-4">
        <div className="prob-line h-[1.5px] w-8 bg-[#c9542f] origin-left" />
        <span className="prob-eyebrow font-sans text-[0.82rem] sm:text-[0.90rem] font-bold uppercase tracking-[0.25em] text-[#c9542f]">
          {eyebrow}
        </span>
      </div>

      <h2 
        className="prob-heading font-serif text-4xl md:text-6xl lg:text-[4.5rem] font-medium tracking-tight leading-[1.08] mb-6 text-[#111010]"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        {heading1}{' '}
        <span className="text-[#c9542f] font-medium not-italic" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          {headingAccent}
        </span>
      </h2>

      <div className="prob-divider h-[2px] w-10 bg-[#c9542f] origin-left mb-6" />

      <p 
        className="prob-paragraph font-serif text-xl lg:text-2xl text-[#4a463e] font-normal tracking-wide leading-relaxed"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        <span className="italic text-[#111010] block mb-3" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          {quoteItalic}
        </span>
        <span className="text-[#4a463e] not-italic block" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          {quoteSubtext}
        </span>
      </p>

    </div>
  );
}
