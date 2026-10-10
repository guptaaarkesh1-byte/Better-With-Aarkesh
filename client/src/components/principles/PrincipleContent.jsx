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
  maxContentWidth = "max-w-[460px]",
  eyebrowFontSize,
  headingFontSize,
  descriptionFontSize,
  buttonFontSize
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

  const nextTargetMap = {
    'think-principle': 'feel-principle',
    'feel-principle': 'decide-principle',
    'decide-principle': 'coaching'
  };

  const handleNextClick = () => {
    const targetId = nextTargetMap[id] || 'coaching';
    const el = document.getElementById(targetId);
    if (el) {
      if (window.lenis) {
        window.lenis.scrollTo(el, { offset: 0, duration: 1.0 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const circlePx = buttonFontSize ? Math.round(buttonFontSize * 3.4) : null;
  const iconPx = buttonFontSize ? Math.max(13, Math.round(buttonFontSize * 1.4)) : 18;

  return (
    <div ref={container} className={`${maxContentWidth} text-left relative z-20`}>
      
      <div className="flex items-center gap-3.5 mb-4 sm:mb-6">
        <div className="phil-line h-[1.5px] w-7 bg-[#c9542f] origin-left" />
        <span 
          className="phil-eyebrow font-sans text-[0.82rem] sm:text-[0.90rem] uppercase tracking-[0.25em] font-bold text-[#c9542f]"
          style={{ fontSize: eyebrowFontSize ? `${eyebrowFontSize}px` : undefined }}
        >
          {eyebrow}
        </span>
      </div>

      <h2 
        className="font-serif text-[clamp(34px,10.6vw,56px)] md:text-5xl lg:text-6xl xl:text-[4.5rem] font-medium tracking-tight leading-[1.0] sm:leading-[1.08] mb-4 sm:mb-5 flex flex-col items-start w-fit max-w-full"
        style={{ 
          fontFamily: 'Fraunces, Georgia, serif',
          ...(headingFontSize ? { fontSize: `clamp(32px, 9.6vw, ${headingFontSize}px)` } : {})
        }}
      >
        <span className="phil-heading-word text-[#111010] pb-1 uppercase">
          {headlineWhite}
        </span>
        <span className="phil-heading-word text-[#c9542f] pb-1 not-italic font-medium uppercase">
          {headlineGold}
        </span>
      </h2>

      <div className="space-y-3.5 sm:space-y-5 mb-6 max-w-full">
        {paragraphs.map((p, i) => (
          <p 
            key={i} 
            className="phil-paragraph font-serif text-[#4a463e] text-[15.5px] lg:text-xl font-normal tracking-wide leading-[1.65]"
            style={{ 
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: descriptionFontSize ? `${descriptionFontSize}px` : undefined
            }}
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))}
      </div>

      <div 
        onClick={handleNextClick}
        className="phil-button flex items-center gap-3.5 sm:gap-5 cursor-pointer group w-fit pt-2 select-none"
      >
        <div 
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-black/20 bg-white/80 flex items-center justify-center transition-all duration-300 group-hover:border-[#c9542f] group-hover:bg-[#fbf0eb] group-hover:scale-105 shadow-xs shrink-0"
          style={circlePx ? { width: `${circlePx}px`, height: `${circlePx}px` } : undefined}
        >
          <ArrowDown size={iconPx} weight="bold" className="text-[#111010] transition-transform group-hover:text-[#c9542f] group-hover:translate-y-1" />
        </div>
        <span 
          className="font-sans text-[11px] sm:text-xs md:text-[0.82rem] uppercase tracking-[0.22em] text-[#111010] font-semibold transition-colors group-hover:text-[#c9542f]"
          style={{ fontSize: buttonFontSize ? `${buttonFontSize}px` : undefined }}
        >
          {buttonText || 'NEXT PRINCIPLE'}
        </span>
      </div>

    </div>
  );
}
