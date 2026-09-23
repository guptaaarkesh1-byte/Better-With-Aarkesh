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
        <div className="prob-line h-[1px] w-8 bg-accent-gold origin-left" />
        <span className="prob-eyebrow eyebrow-text" style={{ color: '#B98A56' }}>
          {eyebrow}
        </span>
      </div>

      <h2 className="prob-heading font-serif text-4xl lg:text-5xl font-thin tracking-tight leading-[1.1] mb-6 text-heading">
        {heading1} <span className="italic" style={{ color: '#B98A56' }}>{headingAccent}</span>
      </h2>

      <div className="prob-divider h-[1px] w-8 bg-white/20 origin-left mb-6" />

      <p className="prob-paragraph text-paragraph text-lg lg:text-xl font-serif font-light tracking-wide leading-relaxed">
        <span className="italic text-xl lg:text-2xl">{quoteItalic}</span><br />
        <br />
        <span className="text-white text-lg lg:text-xl">{quoteSubtext}</span>
      </p>

    </div>
  );
}
