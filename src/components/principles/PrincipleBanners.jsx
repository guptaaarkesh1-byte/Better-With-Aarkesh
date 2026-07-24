import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Play, ArrowRight } from '@phosphor-icons/react';

export default function PrincipleBanners({ 
  bannerTitle, 
  bannerIcon: BannerIcon, 
  bannerSteps, 
  transitionText,
  activeStep,
  customTransitionFlow
}) {
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
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex flex-col xl:flex-row flex-wrap items-center justify-between gap-8 xl:gap-4 w-full">
          
          {/* Title */}
          <div className="flex items-center gap-3 shrink-0 lg:w-1/6">
            <BannerIcon className="text-accent-gold text-xl" weight="fill" />
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-accent-gold font-semibold" dangerouslySetInnerHTML={{ __html: bannerTitle }} />
          </div>

          <div className="hidden xl:block w-[1px] h-12 bg-white/10 shrink-0" />

          {/* Steps */}
          {bannerSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-center gap-4 flex-1 justify-center relative min-w-[200px]">
                <Icon className="text-accent-gold/70 text-2xl" weight={step.iconWeight || "regular"} />
                <p className="text-paragraph text-xs leading-relaxed max-w-[200px]">
                  {step.text}
                </p>
                {/* Separator between steps */}
                {index < bannerSteps.length - 1 && (
                  <div className="hidden xl:block absolute -right-2 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-white/5 shrink-0" />
                )}
              </div>
            );
          })}

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
                {transitionText}
              </p>
            </div>
          </div>

          {customTransitionFlow ? (
            customTransitionFlow
          ) : (
            <div className="flex items-center gap-4 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium">
              <span className={activeStep === 1 ? 'text-accent-gold' : 'text-white/30'}>THINK</span>
              <ArrowRight className="text-white/20" />
              <span className={activeStep === 2 ? 'text-accent-gold' : 'text-white/30'}>FEEL</span>
              <ArrowRight className="text-white/20" />
              <span className={activeStep === 3 ? 'text-accent-gold' : 'text-white/30'}>DECIDE</span>
              <ArrowRight className="text-white/20" />
              <span className={activeStep === 4 ? 'text-accent-gold' : 'text-white/30'}>COACHING</span>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
