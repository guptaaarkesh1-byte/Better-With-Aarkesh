import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function TransitionIntro({ problemData = {} }) {
  const container = useRef(null);
  const mouseRef = useRef(null);

  const transEyebrow = problemData.transEyebrow || "CLARITY ISN'T LUCK.";
  const transHeading = problemData.transHeading || "It's a skill. And it";
  const rawAccent = problemData.transAccent || "Changes Everything.";
  const transAccent = (rawAccent === "changes everything." || rawAccent === "Changes everything.") ? "Changes Everything." : rawAccent;

  useGSAP(() => {
    // Reveal animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 80%',
      }
    });

    tl.fromTo('.trans-eyebrow',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.trans-scroll',
      { opacity: 0 },
      { opacity: 1, duration: 1 },
      "+=0.5"
    );

    // Mouse scroll animation
    gsap.to(mouseRef.current, {
      y: 6,
      repeat: -1,
      yoyo: true,
      duration: 1.2,
      ease: 'power1.inOut'
    });

  }, { scope: container, dependencies: [transEyebrow, transHeading, transAccent] });

  return (
    <div 
      ref={container} 
      className="relative w-full flex flex-col items-center justify-center text-center px-5 py-5 sm:py-6 lg:py-7 bg-[#f5f1e8]/30 border-t border-black/6"
    >
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className="trans-eyebrow font-sans text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-[#c9542f] mb-1.5 inline-block">
          {transEyebrow}
        </span>

        <h2 className="font-serif text-[clamp(22px,5.5vw,30px)] md:text-3xl lg:text-[34px] font-normal tracking-tight text-[#111010] mb-2 leading-tight" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          <span>{transHeading} </span>
          <span className="relative inline uppercase text-[#c9542f] not-italic font-medium">
            {transAccent}
          </span>
        </h2>

        <div className="trans-scroll flex items-center gap-2 mt-1">
          <div className="w-4 h-7 rounded-full border border-black/20 flex justify-center p-0.5 bg-white/80 shadow-xs">
            <div ref={mouseRef} className="w-1 h-1.5 bg-[#111010] rounded-full animate-wheel" />
          </div>
          <span className="font-sans text-[10px] tracking-[0.22em] text-[#555047] font-semibold uppercase">Scroll to continue</span>
        </div>
      </div>
    </div>
  );
}
