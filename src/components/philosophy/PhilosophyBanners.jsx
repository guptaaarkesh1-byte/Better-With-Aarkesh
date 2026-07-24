import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sparkle, SunDim, Coffee, Circle, Play, ArrowRight, TextT } from '@phosphor-icons/react';

export default function PhilosophyBanners() {
  const container = useRef(null);

  useGSAP(() => {
    // Fade in banners when scrolling into view
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
    <div ref={container} className="w-full relative z-20 shrink-0">
      
      {/* Top Banner: Dynamic Element */}
      <div className="border-t border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 overflow-x-hidden">
          
          {/* Title */}
          <div className="flex items-center gap-3 shrink-0 lg:w-1/6">
            <Sparkle className="text-accent-gold text-xl" weight="fill" />
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-accent-gold font-semibold">
              DYNAMIC<br/>ELEMENT
            </span>
          </div>

          <div className="hidden lg:block w-[1px] h-12 bg-white/10 shrink-0" />

          {/* Step 1 */}
          <div className="flex items-center gap-4 flex-1 justify-center">
            <SunDim className="text-accent-gold/70 text-2xl" />
            <p className="text-paragraph text-xs leading-relaxed max-w-[200px]">
              As you land on this section, the sunlight subtly brightens and dust particles move in the light.
            </p>
          </div>

          <div className="hidden lg:block w-[1px] h-12 bg-white/5 shrink-0" />

          {/* Step 2 */}
          <div className="flex items-center gap-4 flex-1 justify-center">
            <TextT className="text-accent-gold/70 text-3xl" weight="bold" />
            <p className="text-paragraph text-xs leading-relaxed max-w-[200px]">
              The headline fades in from the left with a gentle slide, one word at a time.
            </p>
          </div>

          <div className="hidden lg:block w-[1px] h-12 bg-white/5 shrink-0" />

          {/* Step 3 */}
          <div className="flex items-center gap-4 flex-1 justify-center">
            <Coffee className="text-accent-gold/70 text-2xl" />
            <p className="text-paragraph text-xs leading-relaxed max-w-[200px]">
              The notebook page flutters slightly as if a breeze just passed.
            </p>
          </div>

          <div className="hidden lg:block w-[1px] h-12 bg-white/5 shrink-0" />

          {/* Step 4 */}
          <div className="flex items-center gap-4 flex-1 justify-center">
            <Circle className="text-accent-gold/70 text-2xl" weight="bold" />
            <p className="text-paragraph text-xs leading-relaxed max-w-[200px]">
              The progress indicator on the right highlights "THINK" and the others remain dim.
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Banner: Transition */}
      <div className="border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-full border border-accent-gold/40 flex items-center justify-center">
              <Play className="text-accent-gold text-lg ml-1" weight="fill" />
            </div>
            <div>
              <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-accent-gold font-medium block mb-1">
                Transitions to next section:
              </span>
              <p className="text-paragraph text-xs text-white/70">
                As you scroll down, the scene slowly darkens, the text fades out, and we move into the next principle.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium">
            <span className="text-accent-gold">THINK</span>
            <ArrowRight className="text-white/20" />
            <span className="text-white/30">FEEL</span>
            <ArrowRight className="text-white/20" />
            <span className="text-white/30">DECIDE</span>
          </div>

        </div>
      </div>

    </div>
  );
}
