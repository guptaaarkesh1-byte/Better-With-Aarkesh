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
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 80%',
      }
    });

    tl.fromTo('.prob-eyebrow', 
      { opacity: 0, x: -20 }, 
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.prob-line',
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.out' },
      "<"
    )
    .fromTo('.prob-heading',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
      "-=0.4"
    )
    .fromTo('.prob-divider',
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.out' },
      "-=0.6"
    )
    .fromTo('.prob-paragraph',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.6"
    );

  }, { scope: container, dependencies: [eyebrow, heading1, headingAccent, quoteItalic, quoteSubtext] });

  return (
    <div ref={container} className="max-w-md pt-0 relative z-50">
      
      <div className="flex items-center gap-4 mb-4">
        <div className="prob-line h-[1.5px] w-8 bg-[#c9542f] origin-left" />
        <span className="prob-eyebrow font-sans text-[0.72rem] font-bold uppercase tracking-[0.25em] text-[#c9542f]">
          {eyebrow}
        </span>
      </div>

      <h2 
        className="prob-heading font-serif text-4xl lg:text-5xl font-normal tracking-tight leading-[1.12] mb-6 text-[#111010]"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        {heading1}{' '}
        <span className="italic text-[#c9542f] font-normal not-italic" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          {headingAccent}
        </span>
      </h2>

      <div className="prob-divider h-[2px] w-10 bg-[#c9542f] origin-left mb-6" />

      <p className="prob-paragraph text-[#4a463e] text-lg lg:text-xl font-serif font-normal tracking-wide leading-relaxed">
        <span className="italic text-xl lg:text-2xl text-[#111010]">{quoteItalic}</span><br />
        <br />
        <span className="font-sans text-sm lg:text-base font-medium text-[#7a756b]">{quoteSubtext}</span>
      </p>

    </div>
  );
}
