import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sparkle, CaretRight, CornersOut, Target, Faders, Circle } from '@phosphor-icons/react';

export default function DynamicBanner() {
  const container = useRef(null);

  useGSAP(() => {
    // Fade in banner when it scrolls into view
    gsap.fromTo(container.current, 
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container.current,
          start: 'top 95%',
        }
      }
    );
  }, { scope: container });

  return (
    <div ref={container} className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 overflow-x-hidden">
      
      {/* Title */}
      <div className="flex items-center gap-3 shrink-0 lg:w-1/5">
        <Sparkle className="text-accent-gold text-xl" weight="fill" />
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-accent-gold font-semibold">
          DYNAMIC EXPERIENCE
        </span>
      </div>

      <div className="hidden lg:block w-[1px] h-12 bg-white/10 shrink-0" />

      {/* Step 1 */}
      <div className="flex items-center gap-4 flex-1 justify-center">
        <CornersOut className="text-accent-gold/70 text-2xl" />
        <p className="text-paragraph text-xs leading-relaxed max-w-[200px]">
          As you enter the section, the words float in from different directions.
        </p>
      </div>

      <CaretRight className="text-white/20 hidden lg:block" />

      {/* Step 2 */}
      <div className="flex items-center gap-4 flex-1 justify-center">
        <Faders className="text-accent-gold/70 text-2xl" />
        <p className="text-paragraph text-xs leading-relaxed max-w-[200px]">
          As you scroll, the words slowly drift and lose motion.
        </p>
      </div>

      <CaretRight className="text-white/20 hidden lg:block" />

      {/* Step 3 */}
      <div className="flex items-center gap-4 flex-1 justify-center">
        <Target className="text-accent-gold/70 text-2xl" />
        <p className="text-paragraph text-xs leading-relaxed max-w-[200px]">
          They gradually converge towards the center.
        </p>
      </div>

      <CaretRight className="text-white/20 hidden lg:block" />

      {/* Step 4 */}
      <div className="flex items-center gap-4 flex-1 justify-center">
        <Circle className="text-accent-gold text-xl drop-shadow-[0_0_8px_rgba(185,138,86,0.8)]" weight="fill" />
        <p className="text-paragraph text-xs leading-relaxed max-w-[200px]">
          Everything comes together to reveal one truth.
        </p>
      </div>

    </div>
  );
}
