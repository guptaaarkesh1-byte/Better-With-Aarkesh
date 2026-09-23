import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { ArrowDown } from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

export default function PrincipleContent({ 
  id,
  eyebrow, 
  headlineWhite, 
  headlineGold, 
  headlineGoldItalic, 
  paragraphs, 
  buttonText 
}) {
  const container = useRef(null);

  useGSAP(() => {
    const isThinkPage = id === 'think-principle';

    if (isThinkPage) {
      // THINK CLEARLY PAGE: Cinematic specific text reveal
      let split = null;
      try {
        const target = container.current?.querySelectorAll('.phil-heading-word');
        if (target && target.length > 0) {
          split = new SplitType(target, { types: 'words' });
          gsap.set(container.current.querySelectorAll('.phil-heading-word .word'), { opacity: 0, y: 40, filter: 'blur(12px)' });
          gsap.set(container.current.querySelectorAll('.phil-eyebrow, .phil-line, .phil-paragraph, .phil-button'), { opacity: 1 });

          gsap.to(container.current.querySelectorAll('.phil-heading-word .word'), {
            scrollTrigger: {
              trigger: container.current,
              start: 'top 75%',
            },
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1,
            stagger: 0.12,
            ease: 'power3.out'
          });
        }
      } catch (e) {
        console.warn('SplitType error:', e);
      }

      return () => {
        if (split) {
          try { split.revert(); } catch (_) {}
        }
      };
    } else {
      // DEFAULT ANIMATION FOR OTHER PAGES
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
    }
  }, { scope: container, dependencies: [headlineWhite, headlineGold, paragraphs, eyebrow, id] });

  return (
    <div ref={container} className="max-w-xl text-left relative z-20">
      
      <div className="flex items-center gap-4 mb-6">
        <div className="phil-line h-[1px] w-8 bg-accent-gold origin-left" />
        <span className="phil-eyebrow font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.25em] font-semibold" style={{ color: '#B98A56' }}>
          {eyebrow}
        </span>
      </div>

      <h2 className="font-serif text-4xl md:text-6xl lg:text-[4.5rem] font-medium tracking-tight leading-[1.1] mb-5 flex flex-col items-start">
        <span className={`phil-heading-word text-white overflow-hidden pb-1 ${headlineWhite === headlineWhite.toUpperCase() ? 'uppercase' : ''}`}>{headlineWhite}</span>
        <span className={`phil-heading-word overflow-hidden pb-1 ${headlineGoldItalic ? 'italic font-light' : ''} ${headlineGold === headlineGold.toUpperCase() ? 'uppercase' : ''}`} style={{ color: '#B98A56' }}>{headlineGold}</span>
      </h2>

      <div className="space-y-5 mb-6">
        {paragraphs.map((p, i) => (
          <p 
            key={i} 
            className={`phil-paragraph text-paragraph font-serif ${i === 0 ? 'text-xl lg:text-2xl text-white/95' : 'text-lg lg:text-xl text-white/85'} font-light tracking-wide leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))}
      </div>

      <div className="phil-button flex items-center gap-4 sm:gap-5 cursor-pointer group w-fit pt-2">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-accent-gold/50 flex items-center justify-center transition-all duration-300 group-hover:border-accent-gold group-hover:bg-accent-gold/15 group-hover:scale-105 shadow-md">
          <ArrowDown size={22} weight="regular" className="text-accent-gold transition-transform group-hover:translate-y-1" />
        </div>
        <span className="font-sans text-xs sm:text-sm md:text-[0.85rem] uppercase tracking-[0.25em] text-accent-gold font-semibold transition-colors group-hover:text-white">
          {buttonText || 'SCROLL FOR NEXT PRINCIPLE'}
        </span>
      </div>

    </div>
  );
}
