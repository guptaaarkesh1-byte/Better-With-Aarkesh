import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { ArrowDown } from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

export default function PhilosophyContent() {
  const container = useRef(null);

  useGSAP(() => {
    // Only animate the headline text reveal
    const split = new SplitType('.phil-heading-word', { types: 'words' });

    gsap.set('.phil-heading-word .word', { opacity: 0, y: 40, filter: 'blur(12px)' });

    gsap.to('.phil-heading-word .word', {
      scrollTrigger: {
        trigger: container.current,
        start: 'top 75%',
      },
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1, // standard duration for the reveal
      stagger: 0.12,
      ease: 'power3.out'
    });

    return () => split.revert();
  }, { scope: container });

  return (
    <div ref={container} className="max-w-xl text-left relative z-20">
      
      <div className="flex items-center gap-4 mb-6">
        <div className="phil-line h-[1px] w-8 bg-accent-gold origin-left" />
        <span className="phil-eyebrow font-sans text-[0.65rem] uppercase tracking-[0.3em] font-medium" style={{ color: '#B98A56' }}>
          MY PHILOSOPHY
        </span>
      </div>

      <h2 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight leading-[1.1] mb-8 uppercase flex flex-col items-start">
        <span className="phil-heading-word text-white overflow-hidden pb-1">THINK</span>
        <span className="phil-heading-word overflow-hidden pb-1" style={{ color: '#B98A56' }}>CLEARLY.</span>
      </h2>

      <div className="space-y-6 mb-6">
        <p className="phil-paragraph text-paragraph text-lg lg:text-xl font-light tracking-wide leading-relaxed">
          Clarity begins when you stop <br className="hidden lg:block" />
          believing every thought you think.
        </p>
        <p className="phil-paragraph text-paragraph text-base lg:text-lg font-light tracking-wide leading-relaxed opacity-70">
          We slow down the noise <br className="hidden lg:block" />
          so you can see what truly matters.
        </p>
      </div>

      <div className="phil-button flex items-center gap-4 cursor-pointer group w-fit">
        <div className="w-12 h-12 rounded-full border border-accent-gold/40 flex items-center justify-center transition-colors group-hover:border-accent-gold group-hover:bg-accent-gold/10">
          <ArrowDown className="text-accent-gold text-lg transition-transform group-hover:translate-y-1" />
        </div>
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-accent-gold font-medium">
          SCROLL FOR NEXT PRINCIPLE
        </span>
      </div>

    </div>
  );
}
