import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, BookmarkSimple, Sparkle, BookOpen } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import bgImage from '../../assets/PerspectivePage/Page1.png';
import continuousBg from '../../assets/PerspectivePage/BG/bg.png';
import QuestionsSection from '../../components/perspectives/QuestionsSection';
import RecognitionSection from '../../components/perspectives/RecognitionSection';
import LibrarySection from '../../components/perspectives/LibrarySection';
import FeaturedSection from '../../components/perspectives/FeaturedSection';
import SavedLibrarySection from '../../components/perspectives/SavedLibrarySection';
import SocialSection from '../../components/perspectives/SocialSection';
import InvitationSection from '../../components/perspectives/InvitationSection';
import AnimatedText from '../../components/ui/AnimatedText';

export default function Perspectives() {
  const [isHovered, setIsHovered] = useState(false);

  // Always start at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Golden Dust Particles Data (removing tailwind animation classes)
  const particles = [
    { id: 1, top: '20%', left: '15%', size: 'w-1 h-1' },
    { id: 2, top: '45%', left: '35%', size: 'w-1.5 h-1.5' },
    { id: 3, top: '70%', left: '10%', size: 'w-1 h-1' },
    { id: 4, top: '30%', left: '80%', size: 'w-2 h-2' },
    { id: 5, top: '65%', left: '60%', size: 'w-1 h-1' },
    { id: 6, top: '85%', left: '85%', size: 'w-1.5 h-1.5' },
    { id: 7, top: '15%', left: '65%', size: 'w-1 h-1' },
    { id: 8, top: '55%', left: '85%', size: 'w-1.5 h-1.5' },
    { id: 9, top: '80%', left: '40%', size: 'w-1 h-1' },
    { id: 10, top: '25%', left: '45%', size: 'w-2 h-2' },
    { id: 11, top: '50%', left: '20%', size: 'w-1 h-1' },
    { id: 12, top: '10%', left: '90%', size: 'w-1.5 h-1.5' },
    { id: 13, top: '40%', left: '10%', size: 'w-1 h-1' },
    { id: 14, top: '75%', left: '70%', size: 'w-1.5 h-1.5' },
    { id: 15, top: '85%', left: '25%', size: 'w-2 h-2' },
  ];

  // Window Light Dust Particles (Automatically spreads out within its container)
  const windowParticles = React.useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: `wp-${i}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() > 0.6 ? 'w-1.5 h-1.5' : (Math.random() > 0.8 ? 'w-2 h-2' : 'w-1 h-1')
    }));
  }, []);

  const particlesRef = useRef(null);
  const windowParticlesRef = useRef(null);
  const bgOverlayRef = useRef(null);

  useGSAP(() => {
    // Initial page load brightening effect
    gsap.to(bgOverlayRef.current, {
      opacity: 0,
      duration: 5,
      ease: 'power2.out',
    });

    const animateParticles = (ref) => {
      if (!ref.current) return;
      const elements = ref.current.children;
      Array.from(elements).forEach((el) => {
        const moveRandomly = () => {
          gsap.to(el, {
            x: `random(-100, 100)`,
            y: `random(-100, 100)`,
            duration: `random(6, 15)`,
            ease: 'sine.inOut',
            onComplete: moveRandomly
          });
        };
        
        gsap.fromTo(el, 
          { opacity: 0 },
          {
            opacity: `random(0.3, 0.8)`,
            duration: `random(2, 4)`,
            ease: 'power2.out',
            onComplete: moveRandomly
          }
        );
      });
    };

    animateParticles(particlesRef);
    animateParticles(windowParticlesRef);
  }, { scope: particlesRef });

  return (
    <div className="w-full min-h-screen bg-[#050505] overflow-x-hidden text-white select-none">
      
      {/* SECTION 1: Intro / Hotspot */}
      <section className="relative w-full h-screen overflow-hidden">
        
        {/* Background Layer with Darkening effect on hover */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
          filter: isHovered ? 'brightness(0.4) contrast(1.1)' : 'brightness(1) contrast(1)'
        }}
      >
        <img 
          src={bgImage} 
          alt="Dark Library" 
          className="w-full h-full object-cover object-center"
        />
        {/* Gradients for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
      </div>

      {/* Intro Dark Overlay (Fades out on load) */}
      <div ref={bgOverlayRef} className="absolute inset-0 bg-black z-20 pointer-events-none" />

      {/* Floating Golden Dust Particles (Global) */}
      <div ref={particlesRef} className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div 
            key={p.id}
            className={`absolute rounded-full bg-[#c79c6e] ${p.size} blur-[1px]`}
            style={{ 
              top: p.top, 
              left: p.left
            }}
          />
        ))}
      </div>

      {/* 
        WINDOW LIGHT ZONE: 
        Control the position and spread of the dense particle cluster here!
        - Change 'top-[10%]' and 'left-[5%]' to move the entire cluster around.
        - Change 'w-[35%]' and 'h-[60%]' to change how wide or tall the cluster spreads.
      */}
      <div 
        ref={windowParticlesRef} 
        className="absolute top-[10%] left-[60%] w-[35%] h-[60%] z-10 pointer-events-none"
      >
        {windowParticles.map((p) => (
          <div 
            key={p.id}
            className={`absolute rounded-full bg-[#c79c6e] ${p.size} blur-[1px]`}
            style={{ 
              top: p.top, 
              left: p.left
            }}
          />
        ))}
      </div>

      {/* Main Content Overlay */}
      <div 
        className="relative z-10 w-full h-full flex flex-col justify-center px-6 md:px-12 lg:px-16"
      >
        <div className="flex w-full items-center justify-between">
          
          {/* Left Side: Typography */}
          <div className="w-full md:w-1/2 flex flex-col items-start justify-center pointer-events-none">
            <h1 className={`font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light tracking-tight leading-[1.2] transition-opacity duration-700 ${isHovered ? 'opacity-30' : 'opacity-100'}`}>
              <AnimatedText text="Sometimes" delay={0.8} stagger={0.3} className="block" />
              <AnimatedText text="the answer" delay={1.1} stagger={0.3} className="block" />
              <AnimatedText text="isn't missing." delay={1.7} stagger={0.3} className="block" />
              <AnimatedText 
                text="The perspective is." 
                delay={2.3} 
                stagger={0.3} 
                className="text-[#c79c6e] italic mt-2 block" 
              />
            </h1>
            
            <div className={`mt-8 w-12 h-[1px] bg-[#c79c6e]/50 transition-opacity duration-700 ${isHovered ? 'opacity-30' : 'opacity-100'}`} />
          </div>
          
        </div>
      </div>

      {/* Interactive Book on Table (Hotspot) */}
      <div 
        className="absolute bottom-[10%] right-[80%] md:bottom-[15%] md:right-[35%] z-30 cursor-pointer flex items-center justify-center group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        {/* The small book icon glowing */}
        <div className={`relative flex items-center justify-center w-12 h-12 transition-all duration-700 ${isHovered ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
          <div className="absolute inset-0 bg-[#c79c6e] rounded-full blur-xl opacity-20 animate-pulse" />
          <BookOpen className="text-white/60 text-2xl relative z-10 animate-bounce" weight="light" />
        </div>

        {/* The Card expanding from the book */}
        <div 
          className={`
            absolute bottom-0 right-0 origin-bottom-right
            w-[280px] border border-[#c79c6e]/30 rounded-lg p-8 
            bg-[#0f0f0f]/80 backdrop-blur-md shadow-2xl transition-all duration-700 ease-out
            flex flex-col gap-6
            ${isHovered ? 'opacity-100 scale-100 translate-y-0 translate-x-0' : 'opacity-0 scale-0 translate-y-8 translate-x-8 pointer-events-none'}
          `}
        >
          <div className="flex items-start justify-between w-full text-[#c79c6e]">
            <Sparkle size={28} weight="light" className="opacity-80" />
            <BookmarkSimple size={24} weight="light" className="opacity-60" />
          </div>
          
          <p className="font-sans text-white/90 font-light text-sm leading-relaxed">
            Explore ideas designed to help you think more <span className="text-[#c79c6e] font-medium">clearly</span>, feel more <span className="text-[#c79c6e] font-medium">honestly</span>, and decide more intentionally.
          </p>
          
          <div className="w-full h-[1px] bg-white/10" />
          
          <p className="font-sans text-white/60 font-light text-[0.65rem] leading-relaxed uppercase tracking-wider">
            A growing library of reflections, conversations and perspectives.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <div className="w-5 h-8 border border-white/30 rounded-full flex justify-center p-1">
          <div className="w-1 h-1.5 bg-white/50 rounded-full animate-bounce" />
        </div>
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e]">
          SCROLL TO EXPLORE
        </span>
        <ArrowDown size={14} className="text-[#c79c6e] animate-pulse" weight="bold" />
      </div>


      </section>

      {/* CONTINUOUS BACKGROUND WRAPPER */}
      <div 
        className="relative w-full bg-cover bg-center bg-no-repeat bg-fixed bg-black/70 bg-blend-multiply"
        style={{ backgroundImage: `url(${continuousBg})` }}
      >
        {/* SECTION 2: Questions Grid */}
      <QuestionsSection />

      {/* SECTION 3: Recognition */}
      <RecognitionSection />

      {/* SECTION 4: The Library */}
      <LibrarySection />

      {/* SECTION 5: Featured Perspective */}
      <FeaturedSection />

      {/* SECTION 6: Saved Library Preview (Make It Yours) */}
      <SavedLibrarySection />

      {/* SECTION 7: Beyond the Website (Social) */}
      <SocialSection />

      {/* SECTION 8: The Invitation Back to You */}
      <InvitationSection />
      </div>

    </div>
  );
}
