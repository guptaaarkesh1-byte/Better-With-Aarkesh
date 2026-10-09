import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import ProblemContent from './ProblemContent';
import WordCloud from './WordCloud';
import TransitionIntro from './TransitionIntro';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

gsap.registerPlugin(ScrollTrigger);

export default function ProblemSection() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const dustContainerRef = useRef(null);
  const [problemData, setProblemData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_URL}/api/home-settings/problem`)
      .then(res => res.ok ? res.json() : null)
      .then(d => {
        if (d && isMounted) setProblemData(d);
      })
      .catch(err => console.error('Failed to load problem settings:', err));
    return () => { isMounted = false; };
  }, []);

  useGSAP(() => {
    // We create a master timeline that scrubs with scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=1600',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
      }
    });

    const tracks = gsap.utils.toArray('.word-track');

    // Stage 2: Slow motion & fade out (25-30% scroll progress approx)
    tl.to(tracks, {
      opacity: 0.2,
      scale: 0.85,
      duration: 2,
      ease: 'power2.inOut',
      stagger: { amount: 0.5, from: 'random' },
      force3D: true
    }, "stage2");

    // Stage 3 & 4: Magnetic Convergence & Merge Effect
    const parentRect = containerRef.current?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight, left: 0, top: 0 };
    const centerX = parentRect.width / 2;
    const centerY = parentRect.height / 2;

    tracks.forEach((track) => {
      const offsetX = gsap.utils.random(-25, 25);
      const offsetY = gsap.utils.random(-25, 25);
      const rot = gsap.utils.random(-35, 35);
      
      const rect = track.getBoundingClientRect();
      const elemX = rect.left - parentRect.left + rect.width / 2;
      const elemY = rect.top - parentRect.top + rect.height / 2;
      const deltaX = (centerX - elemX) + offsetX;
      const deltaY = (centerY - elemY) + offsetY;

      tl.to(track, {
        x: deltaX,
        y: deltaY,
        rotation: rot,
        opacity: 0,
        scale: 0.35,
        duration: 3,
        ease: 'power3.inOut',
        force3D: true
      }, "stage3+=" + gsap.utils.random(0, 1));
    });

    // Stage 5: Warm Terracotta Energy Burst
    tl.fromTo('.golden-burst', 
      { scale: 0, opacity: 0 },
      { 
        scale: 1.6, 
        opacity: 0.9, 
        duration: 2, 
        ease: 'expo.out',
        force3D: true 
      }, 
      "stage5-=1"
    );

    // Stage 6: Ambient Dust starts appearing
    tl.fromTo(dustContainerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.inOut', force3D: true },
      "stage5"
    );

    // Independent Dust Animation (Looping infinitely, only while in viewport)
    const dustParticles = gsap.utils.toArray('.dust-particle');
    const dustTweens = dustParticles.map((particle) => {
      return gsap.to(particle, {
        y: `-=${gsap.utils.random(50, 150)}`,
        x: `+=${gsap.utils.random(-50, 50)}`,
        opacity: gsap.utils.random(0.3, 0.8),
        duration: gsap.utils.random(5, 10),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: gsap.utils.random(0, 5),
        paused: true,
        force3D: true
      });
    });

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => dustTweens.forEach(t => t.play()),
      onLeave: () => dustTweens.forEach(t => t.pause()),
      onEnterBack: () => dustTweens.forEach(t => t.play()),
      onLeaveBack: () => dustTweens.forEach(t => t.pause()),
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="problem" className="relative w-full bg-[#f5f1e8] h-auto lg:h-screen flex flex-col overflow-hidden snap-section">
      
      {/* ─── MOBILE VIEW (Matches user's mobile design prototype exactly) ─── */}
      <div className="block lg:hidden w-full bg-gradient-to-b from-[#fcefe0] via-[#f8dec4] to-[#f6e7d8] pt-14 pb-10 overflow-hidden">
        {/* Head */}
        <div className="px-5">
          <p className="flex items-center gap-3 font-sans font-semibold text-[11.5px] leading-snug tracking-[0.24em] uppercase text-[#B3441F] before:content-[''] before:w-7 before:h-[1.5px] before:bg-[#c9542f] before:flex-shrink-0">
            {problemData?.eyebrowText || "Maybe you've spent years"}
          </p>
          <h2 className="font-serif font-medium tracking-tight leading-[1.06] text-[clamp(30px,8.8vw,38px)] text-[#141414] mt-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {problemData?.headingLine1 || "Trying to fix what isn't the"}{' '}
            <span className="text-[#c9542f] not-italic font-medium">{problemData?.headingAccent || "real problem."}</span>
          </h2>
        </div>

        {/* Cloud Container with Floating Words */}
        <div className="relative h-[492px] mt-2.5 overflow-hidden">
          {/* 16 Floating Words in Cloud with Custom Color & Drift Animation & Varied Sizes */}
          <span className="absolute font-serif font-medium text-[14.5px] whitespace-nowrap animate-drift select-none" style={{ top: '14px', left: '7%', color: '#8a85d6', animationDelay: '0.2s', fontFamily: 'Fraunces, Georgia, serif' }}>What if?</span>
          <span className="absolute font-serif font-medium text-[12.5px] whitespace-nowrap animate-drift select-none" style={{ top: '46px', left: '36%', color: '#4f4a45', animationDelay: '1.1s', fontFamily: 'Fraunces, Georgia, serif' }}>Self doubt</span>
          <span className="absolute font-serif font-semibold text-[17px] whitespace-nowrap animate-drift select-none tracking-wide" style={{ top: '22px', right: '6%', color: '#c4713a', animationDelay: '0.6s', fontFamily: 'Fraunces, Georgia, serif' }}>Overthinking</span>
          <span className="absolute font-serif font-medium text-[13px] whitespace-nowrap animate-drift select-none" style={{ top: '96px', right: '14%', color: '#6e655c', animationDelay: '1.6s', fontFamily: 'Fraunces, Georgia, serif' }}>Regret</span>
          <span className="absolute font-serif font-medium text-[14px] whitespace-nowrap animate-drift select-none" style={{ top: '150px', left: '4%', color: '#c2416b', animationDelay: '0.9s', fontFamily: 'Fraunces, Georgia, serif' }}>Breakup</span>
          <span className="absolute font-serif font-medium text-[12px] whitespace-nowrap animate-drift select-none" style={{ top: '208px', left: '3%', color: '#c4713a', animationDelay: '2.0s', fontFamily: 'Fraunces, Georgia, serif' }}>Not enough</span>
          <span className="absolute font-serif font-medium text-[13.5px] whitespace-nowrap animate-drift select-none" style={{ top: '276px', left: '5%', color: '#2e8b57', animationDelay: '0.4s', fontFamily: 'Fraunces, Georgia, serif' }}>Past mistakes</span>
          <span className="absolute font-serif font-medium text-[13.5px] whitespace-nowrap animate-drift select-none" style={{ top: '342px', left: '3%', color: '#7a6ad8', animationDelay: '1.3s', fontFamily: 'Fraunces, Georgia, serif' }}>Comparison</span>
          <span className="absolute font-serif font-medium text-[13px] whitespace-nowrap animate-drift select-none" style={{ top: '416px', left: '7%', color: '#b83fc0', animationDelay: '0.7s', fontFamily: 'Fraunces, Georgia, serif' }}>People pleasing</span>
          <span className="absolute font-serif font-medium text-[13px] whitespace-nowrap animate-drift select-none" style={{ top: '150px', right: '6%', color: '#3f9e6a', animationDelay: '1.8s', fontFamily: 'Fraunces, Georgia, serif' }}>Family</span>
          <span className="absolute font-serif font-medium text-[14px] whitespace-nowrap animate-drift select-none" style={{ top: '196px', right: '3%', color: '#7a6ad8', animationDelay: '0.3s', fontFamily: 'Fraunces, Georgia, serif' }}>Uncertainty</span>
          <span className="absolute font-serif font-medium text-[12px] whitespace-nowrap animate-drift select-none" style={{ top: '246px', right: '8%', color: '#d9546d', animationDelay: '1.2s', fontFamily: 'Fraunces, Georgia, serif' }}>Failing</span>
          <span className="absolute font-serif font-medium text-[16px] whitespace-nowrap animate-drift select-none tracking-wide" style={{ top: '296px', right: '3%', color: '#d98a2b', animationDelay: '0.8s', fontFamily: 'Fraunces, Georgia, serif' }}>Career pressure</span>
          <span className="absolute font-serif font-medium text-[14.5px] whitespace-nowrap animate-drift select-none" style={{ top: '346px', right: '8%', color: '#c4532c', animationDelay: '2.1s', fontFamily: 'Fraunces, Georgia, serif' }}>Loneliness</span>
          <span className="absolute font-serif font-medium text-[11.5px] whitespace-nowrap animate-drift select-none" style={{ top: '394px', right: '4%', color: '#b8863f', animationDelay: '0.5s', fontFamily: 'Fraunces, Georgia, serif' }}>Judgement</span>
          <span className="absolute font-serif font-medium text-[15.5px] whitespace-nowrap animate-drift select-none tracking-wide" style={{ top: '442px', right: '3%', color: '#2e8b57', animationDelay: '1.5s', fontFamily: 'Fraunces, Georgia, serif' }}>Financial stress</span>
        </div>

        {/* Bottom Caption */}
        <div className="px-5 mt-2">
          <em className="block font-serif italic font-normal text-[17px] leading-[1.5] text-[#2a2622]" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {problemData?.quoteItalic || "Things you carry, cloud your perspective."}
          </em>
          <p className="mt-3 font-serif font-normal text-[15.5px] leading-[1.6] text-[#55504a]" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {problemData?.quoteSubtext || "….Until you learn to see clearly"}
          </p>
        </div>
      </div>

      {/* ─── DESKTOP PINNED VIEW (100% untouched for desktop / laptop) ─── */}
      <div ref={containerRef} className="hidden lg:flex relative w-full h-full flex-grow flex-col items-center justify-center">
        
        {/* DESKTOP HEADING & PARA */}
        <Container className="grid relative z-30 w-full grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full pointer-events-none absolute inset-0">
          <div className="lg:col-span-5 relative z-40 mt-0 pointer-events-auto">
            <ProblemContent problemData={problemData || {}} />
          </div>
        </Container>

        {/* Stage 5: Energy Burst Element */}
        <div 
          className="golden-burst absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none z-20"
          style={{
            background: 'radial-gradient(circle, rgba(201, 84, 47,0.7) 0%, rgba(201, 84, 47,0.25) 35%, rgba(201, 84, 47,0) 70%)',
            willChange: 'transform, opacity'
          }}
        />

        {/* Stage 6: Ambient Dust Particles */}
        <div ref={dustContainerRef} className="absolute inset-0 z-20 pointer-events-none opacity-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="dust-particle absolute rounded-full bg-[#c9542f]"
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

        {/* Word Cloud stretches across full width to act as background on Desktop */}
        <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
          <WordCloud 
            customImg={problemData?.bgImg || problemData?.silhouetteImg || ''} 
            wordFontSize={problemData?.wordFontSize}
          />
        </div>

      </div>

      {/* Transition Intro (Statement section) */}
      <div className="relative z-40 shrink-0 bg-[#f5f1e8]">
        <TransitionIntro problemData={problemData || {}} />
      </div>

    </section>
  );
}
