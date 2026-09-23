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
        <span className="phil-eyebrow font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.25em] font-semibold" style={{ color: '#B98A56' }}>
          MY PHILOSOPHY
        </span>
      </div>

      <h2 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight leading-[1.1] mb-8 uppercase flex flex-col items-start">
        <span className="phil-heading-word text-white overflow-hidden pb-1">THINK</span>
        <span className="phil-heading-word overflow-hidden pb-1" style={{ color: '#B98A56' }}>CLEARLY.</span>
      </h2>

      <div className="space-y-6 mb-6">
        <p className="phil-paragraph text-paragraph text-xl lg:text-2xl font-light tracking-wide leading-relaxed">
          Clarity begins when you stop <br className="hidden lg:block" />
          believing every thought you think.
        </p>
        <p className="phil-paragraph text-paragraph text-lg lg:text-xl font-light tracking-wide leading-relaxed opacity-80">
          We slow down the noise <br className="hidden lg:block" />
          so you can see what truly matters.
        </p>
      </div>

      <div className="phil-button flex items-center gap-4 sm:gap-5 cursor-pointer group w-fit pt-2">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-accent-gold/50 flex items-center justify-center transition-all duration-300 group-hover:border-accent-gold group-hover:bg-accent-gold/15 group-hover:scale-105 shadow-md">
          <ArrowDown size={22} weight="regular" className="text-accent-gold transition-transform group-hover:translate-y-1" />
        </div>
        <span className="font-sans text-xs sm:text-sm md:text-[0.85rem] uppercase tracking-[0.25em] text-accent-gold font-semibold transition-colors group-hover:text-white">
          SCROLL FOR NEXT PRINCIPLE
        </span>
      </div>

    </div>
  );
}
