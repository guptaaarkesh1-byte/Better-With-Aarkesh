import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AnimatedText from '../ui/AnimatedText';
import bottomImg from '../../assets/Page2/bottom.png';

export default function TransitionIntro() {
  const container = useRef(null);
  const mouseRef = useRef(null);

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

  }, { scope: container });

  return (
    <div ref={container} className="relative flex flex-col items-center justify-center text-center px-4 py-4 lg:py-6 overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={bottomImg} 
          alt="Dust and light particles"
          className="w-full h-full object-cover object-bottom  opacity-80"
        />
        {/* Subtle gradient to blend edges if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className="trans-eyebrow font-sans text-[0.65rem] uppercase tracking-[0.3em] text-accent-gold mb-2 inline-block">
          CLARITY ISN'T LUCK.
        </span>

        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-thin tracking-tight text-heading mb-4">
          <AnimatedText text="It's a skill. And it " tag="span" className="inline-block" delay={0.2} />
          <span className="relative inline-block overflow-hidden">
            <AnimatedText 
              text="changes everything." 
              tag="span" 
              className="inline-block text-accent-gold italic" 
              delay={0.4} 
            />
            {/* Subtle underline for emphasis as seen in design */}
            <span className="absolute bottom-1 left-0 w-full h-[1px] bg-accent-gold/40" />
          </span>
        </h2>

        <div className="trans-scroll flex items-center gap-3 opacity-0 mt-2">
          <div className="w-5 h-8 rounded-full border border-white/30 flex justify-center p-1">
            <div ref={mouseRef} className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
          <span className="font-sans text-xs tracking-widest text-paragraph">Scroll to continue</span>
        </div>
      </div>

    </div>
  );
}
