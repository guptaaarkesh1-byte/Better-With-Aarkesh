import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, BookmarkSimple, Sparkle, BookOpen, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import bgImage from '../../assets/PerspectivePage/Page1.png';
import continuousBg from '../../assets/PerspectivePage/BG/library_day_bg.png';
import QuestionsSection from '../../components/library/QuestionsSection';
import FeaturedSection from '../../components/library/FeaturedSection';
import FormatExploreSection from '../../components/library/FormatExploreSection';
import SituationExploreSection from '../../components/library/SituationExploreSection';
import LatestPerspectivesSection from '../../components/library/LatestPerspectivesSection';
import ToolsReflectionSection from '../../components/library/ToolsReflectionSection';
import LibraryInvitationSection from '../../components/library/LibraryInvitationSection';
import PerspectiveToConversationSection from '../../components/library/PerspectiveToConversationSection';
import AnimatedText from '../../components/ui/AnimatedText';

export default function Library() {
  const [isHovered, setIsHovered] = useState(false);
  const hotspotRef = useRef(null);

  // Handle click outside to close on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hotspotRef.current && !hotspotRef.current.contains(event.target)) {
        setIsHovered(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

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
  const heroRef = useRef(null);

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
  });

  useGSAP(() => {
    if (!heroRef.current) return;
    const tl = gsap.timeline({ delay: 2 });
    
    tl.to('.library-text', {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out'
    })
    .to('.heading-word', {
      x: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.4,
      ease: 'power3.out'
    }, "-=0.4")
    .to('.hero-content', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    }, "-=0.2");
  }, { scope: heroRef });

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
            className={`absolute rounded-full bg-[#c79c6e] ${p.size}`}
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
            className={`absolute rounded-full bg-[#c79c6e] ${p.size}`}
            style={{ 
              top: p.top, 
              left: p.left
            }}
          />
        ))}
      </div>

      {/* Main Content Overlay */}
      <div 
        ref={heroRef}
        className="relative z-10 w-full h-full flex flex-col justify-center px-4 md:px-8 pt-16 pb-12"
      >
        <div className="w-full md:w-[75%] lg:w-[65%] flex flex-col items-start justify-center">
          
          <span className="library-text opacity-0 font-sans text-[0.7rem] md:text-[0.75rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-6 block">
            The Library
          </span>

          <h1 className="font-serif text-5xl md:text-[4.5rem] lg:text-[5rem] text-white tracking-tight leading-[1.05] mb-6">
            <span className="heading-word inline-block opacity-0 -translate-x-4 mr-[0.25em]">What</span>
            <span className="heading-word inline-block opacity-0 -translate-x-4 mr-[0.25em]">are</span>
            <span className="heading-word inline-block opacity-0 -translate-x-4 mr-[0.25em]">you</span>
            <span className="heading-word inline-block opacity-0 -translate-x-4 mr-[0.25em]">trying</span>
            <br className="hidden md:block"/>
            <span className="heading-word inline-block opacity-0 -translate-x-4 mr-[0.25em]">to</span>
            <span className="heading-word inline-block opacity-0 -translate-x-4">understand?</span>
          </h1>

          <div className="hero-content opacity-0 translate-y-4 w-full">
            <p className="font-sans text-white/60 text-lg md:text-xl font-light leading-relaxed mb-12 max-w-lg">
              Articles, videos and reflective tools for the parts of life that are difficult to see clearly while you are living through them.
            </p>

            <div className="w-fit max-w-full">
              <div className="w-full relative mb-6 group">
                <input 
                  type="text" 
                  placeholder="Describe what you're facing..."
                  className="w-full bg-[#050505]/60 border border-[#c79c6e]/30 rounded-lg px-6 py-5 text-white placeholder-white/40 font-light text-lg focus:outline-none focus:border-[#c79c6e]/70 transition-all duration-300 backdrop-blur-sm pr-16"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c79c6e] hover:text-white transition-colors p-2">
                  <ArrowRight size={24} weight="light" />
                </button>
              </div>

              <div className="w-full">
                <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-5 block">
                  Not sure where to begin?
                </span>
                <div className="flex gap-3 md:gap-4 w-full overflow-x-auto no-scrollbar pb-2">
                  {['I feel stuck', 'A relationship is confusing me', 'I have a decision to make'].map((topic, i) => (
                    <button 
                      key={i}
                      className="px-5 py-3 md:px-6 border border-[#c79c6e]/30 rounded-md bg-[#050505]/40 hover:bg-[#c79c6e]/10 text-white/80 hover:text-white text-sm font-light transition-all duration-300 backdrop-blur-sm whitespace-nowrap shrink-0"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4">
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]/80">
          Or explore what others often carry
        </span>
        <ArrowDown size={18} className="text-[#c79c6e]/80 animate-bounce" weight="light" />
      </div>


      </section>

      {/* CONTINUOUS BACKGROUND WRAPPER */}
      <div 
        className="relative w-full bg-cover bg-center bg-no-repeat bg-fixed bg-black/40 bg-blend-overlay"
        style={{ backgroundImage: `url(${continuousBg})` }}
      >
        {/* SECTION 2: Featured Perspective */}
      <FeaturedSection />

      {/* SECTION 3: Explore By Situation */}
      <SituationExploreSection />

      {/* SECTION 4: Questions Grid */}
      <QuestionsSection />

      {/* SECTION 5: Explore By Format */}
      <FormatExploreSection />

      {/* SECTION 8: Library Invitation */}
      <LibraryInvitationSection />
      
      {/* SECTION 9: Perspective To Conversation */}
      <PerspectiveToConversationSection />
      </div>

    </div>
  );
}
