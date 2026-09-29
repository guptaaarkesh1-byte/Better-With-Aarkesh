import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowDown } from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

export default function PrincipleContent({ 
  id,
  eyebrow, 
  headlineWhite, 
  headlineGold, 
  headlineGoldItalic, 
  paragraphs, 
  buttonText,
  maxContentWidth = "max-w-[460px]"
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
      { opacity: 0, y: 25, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.18 },
      "-=0.4"
    )
    .fromTo('.phil-paragraph',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.2 },
      "-=0.5"
    )
    .fromTo('.phil-button',
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
      "-=0.4"
    );
  }, { scope: container, dependencies: [headlineWhite, headlineGold, paragraphs, eyebrow, id] });

  return (
    <div ref={container} className={`${maxContentWidth} text-left relative z-20`}>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="phil-line h-[1.5px] w-8 bg-[#c9542f] origin-left" />
        <span className="phil-eyebrow font-sans text-[0.82rem] sm:text-[0.90rem] uppercase tracking-[0.25em] font-bold text-[#c9542f]">
          {eyebrow}
        </span>
      </div>

      <h2 
        className="font-serif text-4xl md:text-6xl lg:text-[4.5rem] font-medium tracking-tight leading-[1.08] mb-5 flex flex-col items-start w-fit"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        <span className={`phil-heading-word text-[#111010] whitespace-nowrap overflow-hidden pb-1 ${headlineWhite === headlineWhite?.toUpperCase() ? 'uppercase' : ''}`}>
          {headlineWhite}
        </span>
        <span className={`phil-heading-word text-[#c9542f] whitespace-nowrap overflow-hidden pb-1 not-italic font-medium ${headlineGold === headlineGold?.toUpperCase() ? 'uppercase' : ''}`}>
          {headlineGold}
        </span>
      </h2>

      <div className="space-y-5 mb-6 max-w-full">
        {paragraphs.map((p, i) => (
          <p 
            key={i} 
            className="phil-paragraph font-serif text-[#4a463e] font-normal tracking-wide leading-relaxed"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))}
      </div>

      <div className="phil-button flex items-center gap-4 sm:gap-5 cursor-pointer group w-fit pt-2">
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full border border-black/20 bg-white/60 flex items-center justify-center transition-all duration-300 group-hover:border-[#c9542f] group-hover:bg-[#fbf0eb] group-hover:scale-105 shadow-xs">
          <ArrowDown size={20} weight="bold" className="text-[#111010] transition-transform group-hover:text-[#c9542f] group-hover:translate-y-1" />
        </div>
        <span className="font-sans text-xs sm:text-sm md:text-[0.82rem] uppercase tracking-[0.25em] text-[#111010] font-bold transition-colors group-hover:text-[#c9542f]">
          {buttonText || 'SCROLL FOR NEXT PRINCIPLE'}
        </span>
      </div>

    </div>
  );
}
