import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function ProblemContent() {
  const container = useRef(null);

  useGSAP(() => {
    // Basic reveal animation for the text when section enters
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

  }, { scope: container });

  return (
    <div ref={container} className="max-w-md pt-0 relative z-50">
      
      <div className="flex items-center gap-4 mb-4">
        <div className="prob-line h-[1px] w-8 bg-accent-gold origin-left" />
        <span className="prob-eyebrow eyebrow-text" style={{ color: '#B98A56' }}>
          MAYBE YOU'VE SPENT YEARS
        </span>
      </div>

      <h2 className="prob-heading font-serif text-4xl lg:text-5xl font-thin tracking-tight leading-[1.1] mb-6 text-heading">
        Trying to fix what isn't the <span className="italic" style={{ color: '#B98A56' }}>real problem.</span>
      </h2>

      <div className="prob-divider h-[1px] w-8 bg-white/20 origin-left mb-6" />

      <p className="prob-paragraph text-paragraph text-base lg:text-lg font-serif font-light  tracking-wide leading-snug">
      <span className="italic  text-lg">Things you carry, cloud your perspective.</span><br />
        <br />
        <span className="text-white">....Until you learn to see clearly</span>
      </p>

    </div>
  );
}
