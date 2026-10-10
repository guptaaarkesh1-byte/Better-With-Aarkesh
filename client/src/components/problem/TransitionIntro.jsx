import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function TransitionIntro({ problemData = {} }) {
  const container = useRef(null);

  const transEyebrow = problemData.transEyebrow || "CLARITY ISN'T LUCK.";
  const transHeading = problemData.transHeading || "It's a skill. And it";
  const transAccent = problemData.transAccent !== undefined ? problemData.transAccent : "Changes Everything.";

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
    );

  }, { scope: container, dependencies: [transEyebrow, transHeading, transAccent] });

  return (
    <div 
      ref={container} 
      className="relative w-full flex flex-col items-center justify-center text-center px-5 py-3.5 sm:py-4.5 lg:py-5 bg-[#f5f1e8]/40 border-t border-black/6"
    >
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className="trans-eyebrow font-sans text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-[#c9542f] mb-1.5 inline-block">
          {transEyebrow}
        </span>

        <h2 className="font-serif text-[clamp(22px,5.5vw,30px)] md:text-3xl lg:text-[34px] font-normal tracking-tight text-[#111010] mb-0 leading-tight" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          <span>{transHeading} </span>
          <span className="relative inline text-[#c9542f] not-italic font-medium">
            {transAccent}
          </span>
        </h2>
      </div>
    </div>
  );
}
