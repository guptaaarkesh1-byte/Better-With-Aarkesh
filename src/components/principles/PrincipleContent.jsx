import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowDown } from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

export default function PrincipleContent({ 
  eyebrow, 
  headlineWhite, 
  headlineGold, 
  headlineGoldItalic, 
  paragraphs, 
  buttonText 
}) {
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.phil-eyebrow',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.phil-line',
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.out' },
      "<"
    )
    .fromTo('.phil-heading-word',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 1, ease: 'power3.out', stagger: 0.2 },
      "-=0.4"
    )
    .fromTo('.phil-paragraph',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.2 },
      "-=0.6"
    )
    .fromTo('.phil-button',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
      "-=0.4"
    );
  }, { scope: container });

  return (
    <div ref={container} className="max-w-xl text-left relative z-20">
      
      <div className="flex items-center gap-4 mb-6">
        <div className="phil-line h-[1px] w-8 bg-accent-gold origin-left" />
        <span className="phil-eyebrow font-sans text-[0.65rem] uppercase tracking-[0.3em] font-medium" style={{ color: '#B98A56' }}>
          {eyebrow}
        </span>
      </div>

      <h2 className="font-serif text-4xl md:text-6xl lg:text-[4.5rem] font-medium tracking-tight leading-[1.1] mb-5 flex flex-col items-start">
        <span className={`phil-heading-word text-white overflow-hidden pb-1 ${headlineWhite === headlineWhite.toUpperCase() ? 'uppercase' : ''}`}>{headlineWhite}</span>
        <span className={`phil-heading-word overflow-hidden pb-1 ${headlineGoldItalic ? 'italic font-light' : ''} ${headlineGold === headlineGold.toUpperCase() ? 'uppercase' : ''}`} style={{ color: '#B98A56' }}>{headlineGold}</span>
      </h2>

      <div className="space-y-4 mb-6">
        {paragraphs.map((p, i) => (
          <p 
            key={i} 
            className={`phil-paragraph text-paragraph font-serif ${i === 0 ? 'text-lg lg:text-xl' : 'text-base lg:text-lg opacity-70'} font-light tracking-wide leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))}
      </div>

      <div className="phil-button flex items-center gap-4 cursor-pointer group w-fit">
        <div className="w-12 h-12 rounded-full border border-accent-gold/40 flex items-center justify-center transition-colors group-hover:border-accent-gold group-hover:bg-accent-gold/10">
          <ArrowDown className="text-accent-gold text-lg transition-transform group-hover:translate-y-1" />
        </div>
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-accent-gold font-medium">
          {buttonText}
        </span>
      </div>

    </div>
  );
}
