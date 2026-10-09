import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AnimatedText from '../ui/AnimatedText';
import bottomImg from '../../assets/Page2/bottom.webp';

export default function TransitionIntro({ problemData = {} }) {
  const container = useRef(null);
  const mouseRef = useRef(null);

  const transEyebrow = problemData.transEyebrow || "CLARITY ISN'T LUCK.";
  const transHeading = problemData.transHeading || "It's a skill. And it";
  const rawAccent = problemData.transAccent || "Changes Everything.";
  const transAccent = (rawAccent === "changes everything." || rawAccent === "Changes everything.") ? "Changes Everything." : rawAccent;
  const transBg = problemData.transBgImg || bottomImg;

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
    <div ref={container} className="relative flex flex-col items-center justify-center text-center px-5 py-14 lg:py-16 overflow-hidden bg-[#f5f1e8]">
      
      {/* Clean light background with subtle warm radial highlight */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[#f5f1e8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201, 84, 47,0.04)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className="trans-eyebrow font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.25em] font-bold text-[#c9542f] mb-3.5 inline-block">
          {transEyebrow}
        </span>

        <h2 className="font-serif text-[clamp(28px,8.2vw,36px)] md:text-4xl lg:text-5xl font-normal tracking-tight text-[#111010] mb-5" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          <span>{transHeading} </span>
          <span className="relative inline uppercase text-[#c9542f] not-italic font-medium">
            {transAccent}
          </span>
        </h2>

        <div className="trans-scroll flex items-center gap-3 mt-4">
          <div className="w-5 h-8 rounded-full border border-black/20 flex justify-center p-1 bg-white/80 shadow-xs">
            <div ref={mouseRef} className="w-1 h-2 bg-[#111010] rounded-full animate-wheel" />
          </div>
          <span className="font-sans text-[11px] tracking-[0.22em] text-[#555047] font-semibold uppercase">Scroll to continue</span>
        </div>
      </div>

    </div>
  );
}
