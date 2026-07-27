import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import ProblemContent from './ProblemContent';
import WordCloud from './WordCloud';
import TransitionIntro from './TransitionIntro';

gsap.registerPlugin(ScrollTrigger);

export default function ProblemSection() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const dustContainerRef = useRef(null);

  useGSAP(() => {
    // We create a master timeline that scrubs with scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=4000', // Pin for 4000px of scrolling
        pin: true,
        scrub: 1, // Smooth scrub
        anticipatePin: 1,
      }
    });

    const words = gsap.utils.toArray('.floating-word');

    // Stage 2: Slow motion & fade out (25-30% scroll progress approx)
    // NOTE: Removed blur() filter to vastly improve scroll performance
    tl.to(words, {
      opacity: 0.15,
      scale: 0.85,
      duration: 2,
      ease: 'power2.inOut',
      stagger: { amount: 0.5, from: 'random' }
    }, "stage2"); // Label for positioning

    // Stage 3 & 4: Magnetic Convergence & Merge Effect
    words.forEach((word) => {
      // Random offsets for organic merge
      const offsetX = gsap.utils.random(-30, 30);
      const offsetY = gsap.utils.random(-30, 30);
      const rot = gsap.utils.random(-45, 45);
      
      tl.to(word, {
        top: '50%',
        left: '50%',
        xPercent: -50,
        yPercent: -50,
        x: offsetX,
        y: offsetY,
        rotation: rot,
        opacity: 0,
        filter: 'blur(20px)',
        scale: 0.5,
        duration: 3,
        ease: 'power3.inOut'
      }, "stage3+=" + gsap.utils.random(0, 1));
    });

    // Stage 5: Golden Energy Burst
    tl.fromTo('.golden-burst', 
      { scale: 0, opacity: 0, filter: 'blur(0px)' },
      { 
        scale: 1.5, 
        opacity: 1, 
        filter: 'blur(40px)', 
        duration: 2, 
        ease: 'expo.out' 
      }, 
      "stage5-=1"
    );

    // Stage 6: Ambient Dust starts appearing
    // We'll control dust container opacity via scroll timeline
    tl.fromTo(dustContainerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.inOut' },
      "stage5"
    );

    // Independent Dust Animation (Looping infinitely, not tied to scroll)
    const dustParticles = gsap.utils.toArray('.dust-particle');
    dustParticles.forEach((particle) => {
      gsap.to(particle, {
        y: `-=${gsap.utils.random(50, 150)}`,
        x: `+=${gsap.utils.random(-50, 50)}`,
        opacity: gsap.utils.random(0.2, 0.8),
        duration: gsap.utils.random(5, 10),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: gsap.utils.random(0, 5)
      });
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative w-full bg-[#0a0a0a] h-screen flex flex-col overflow-hidden snap-section">
      
      <div ref={containerRef} className="relative flex-grow flex items-center justify-center min-h-0 pt-12 lg:pt-16 pb-0 h-full w-full">
        
        <Container className="relative z-30 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center h-full pointer-events-none">
          <div className="lg:col-span-5 relative z-40">
            <ProblemContent />
          </div>
        </Container>

        {/* Stage 5: Golden Energy Burst Element */}
        <div 
          className="golden-burst absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none z-20"
          style={{
            background: 'radial-gradient(circle, rgba(185,138,86,0.6) 0%, rgba(185,138,86,0) 70%)',
          }}
        />

        {/* Stage 6: Ambient Dust Particles */}
        <div ref={dustContainerRef} className="absolute inset-0 z-20 pointer-events-none opacity-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="dust-particle absolute rounded-full bg-[#B98A56]"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0
              }}
            />
          ))}
        </div>

        {/* Word Cloud stretches across full width to act as background */}
        <div className="absolute inset-0 z-10 h-full w-full pointer-events-none">
          <WordCloud />
        </div>

      </div>

      {/* Transition Intro */}
      <div className="relative z-40 shrink-0">
        <TransitionIntro />
      </div>

    </section>
  );
}
