import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import { 
  AirplaneTilt, 
  Crosshair, 
  Heart, 
  Compass, 
  Brain, 
  Users,
  ArrowRight,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

// Import default images
import pilotImg from '../../assets/Page8/pilot.webp';
import coachImg from '../../assets/Page8/Coach.webp';
import humanImg from '../../assets/Page8/human.webp';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

gsap.registerPlugin(ScrollTrigger);

export default function MeetAarkesh() {
  const container = useRef(null);
  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAboutData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-settings/about`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setAboutData(data);
        }
      } catch (err) {
        console.error('Failed to load about section:', err);
      }
    };
    fetchAboutData();
    return () => { isMounted = false; };
  }, []);

  const eyebrowText = aboutData?.eyebrowText || 'MEET AARKESH';
  const headingLine = aboutData?.headingLine || 'Three roles. One purpose.';
  const subheading = aboutData?.subheading || 'Different lenses. Same mission—your growth.';
  const missionHeading = aboutData?.missionHeading || 'The journey that shaped the mission.';
  const missionDescription = aboutData?.missionDescription || "From the skies to the soul—here's the story behind why I do what I do.";
  const storyBtnText = aboutData?.storyBtnText || 'READ MY STORY';
  const storyBtnLink = aboutData?.storyBtnLink || '/about-us';

  const pilotData = aboutData?.rolePilot || {};
  const coachData = aboutData?.roleCoach || {};
  const humanData = aboutData?.roleHuman || {};

  const roles = [
    {
      title: pilotData.title || 'PILOT',
      icon: AirplaneTilt,
      sub1: pilotData.sub1 || 'Years in the cockpit.',
      sub2: pilotData.sub2 || 'High stakes. Clear decisions.',
      highlight: pilotData.highlight || 'I know what pressure feels like.',
      bgImg: pilotData.bgImg || pilotImg,
      imgPos: 'object-center'
    },
    {
      title: coachData.title || 'COACH',
      icon: Crosshair,
      sub1: coachData.sub1 || 'ICF-certified life coach.',
      sub2: coachData.sub2 || 'Evidence-based. Human-first.',
      highlight: coachData.highlight || 'I walk beside you, not ahead of you.',
      bgImg: coachData.bgImg || coachImg,
      imgPos: 'object-top'
    },
    {
      title: humanData.title || 'HUMAN',
      icon: Heart,
      sub1: humanData.sub1 || 'Flaws. Lessons. Growth.',
      sub2: humanData.sub2 || 'Still figuring things out.',
      highlight: humanData.highlight || 'Just like you.',
      bgImg: humanData.bgImg || humanImg,
      imgPos: 'object-center'
    }
  ];

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.meet-header',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }
    )
    .fromTo('.role-pane',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 },
      "-=0.4"
    )
    .fromTo('.meet-footer',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      "-=0.2"
    );
  }, { scope: container, dependencies: [aboutData] });

  return (
    <section ref={container} id="meet-aarkesh" className="relative w-full h-auto lg:h-screen min-h-screen flex flex-col bg-black overflow-hidden snap-section pt-12 md:pt-20">
      
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="flex md:hidden flex-col items-center justify-center text-center z-20 px-6 pb-8 meet-header">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-[1px] w-6 bg-accent-gold" />
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.3em] font-bold text-accent-gold">
            {eyebrowText}
          </span>
          <div className="h-[1px] w-6 bg-accent-gold" />
        </div>

        <h2 className="font-serif text-4xl font-medium tracking-tight mb-2 text-white">
          {headingLine}
        </h2>
        
        <p className="text-paragraph text-sm font-light tracking-wide text-white/70">
          {subheading}
        </p>
      </div>

      {/* Grid Panes */}
      <div className="w-full flex-grow flex flex-col md:flex-row border-y border-white/10 min-h-0 relative">
        
        {roles.map((role, i) => {
          const Icon = role.icon;
          return (
            <div 
              key={i} 
              className="role-pane relative h-[45vh] md:h-auto md:flex-1 min-h-0 flex flex-col items-center justify-end pb-12 md:pb-16 p-6 group overflow-hidden border-b md:border-b-0 md:border-r border-white/10 last:border-none"
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={role.bgImg} 
                  alt={role.title} 
                  className={`w-full h-full object-cover ${role.imgPos} opacity-70 transition-transform duration-[1.5s] ease-out group-hover:scale-105 group-hover:opacity-100`} 
                />
              </div>

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent opacity-90 z-0 transition-opacity duration-700 group-hover:opacity-70" />
              
              {/* Conditional Top Header (Only in the Middle Column on Desktop) */}
              {i === 1 && (
                <div className="hidden md:flex absolute top-12 inset-x-0 flex-col items-center justify-center text-center z-20 px-6 transition-opacity duration-500 ease-out group-hover:opacity-0 meet-header pointer-events-none">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-[1px] w-6 bg-accent-gold" />
                    <span className="font-sans text-[0.65rem] uppercase tracking-[0.3em] font-bold text-accent-gold">
                      {eyebrowText}
                    </span>
                    <div className="h-[1px] w-6 bg-accent-gold" />
                  </div>

                  <h2 className="font-serif text-4xl md:text-5xl lg:text-5xl font-medium tracking-tight mb-2 text-white">
                    {headingLine}
                  </h2>
                  
                  <p className="text-paragraph text-sm md:text-base font-light tracking-wide text-white/70">
                    {subheading}
                  </p>
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center text-center transition-transform duration-700 ease-out group-hover:-translate-y-2">
                <Icon className="text-accent-gold text-3xl md:text-4xl mb-3 sm:mb-4 opacity-90" weight="light" />
                <h3 className="font-serif text-3xl md:text-4xl lg:text-[2.6rem] tracking-widest text-white mb-4 sm:mb-6">{role.title}</h3>
                
                <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 opacity-0 transform translate-y-8 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0 h-0 group-hover:h-auto overflow-hidden group-hover:overflow-visible px-4">
                  <p className="text-white/90 font-normal text-sm sm:text-base md:text-[1.12rem] leading-snug">{role.sub1}</p>
                  <p className="text-white/90 font-normal text-sm sm:text-base md:text-[1.12rem] leading-snug mb-2">{role.sub2}</p>
                  <p className="text-accent-gold font-serif italic text-base sm:text-lg md:text-xl lg:text-[1.35rem] font-medium leading-normal drop-shadow-sm">{role.highlight}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Banner */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/10 meet-footer shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-5 sm:py-7 flex flex-col xl:flex-row items-center justify-between gap-6 lg:gap-8">
          
          {/* Left Side: Mission */}
          <div className="flex-1 shrink-0 flex flex-col items-start w-full xl:w-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] w-6 bg-accent-gold origin-left" />
              <span className="font-sans text-xs sm:text-[0.75rem] uppercase tracking-[0.25em] font-bold text-accent-gold">
                {aboutData?.missionEyebrow || 'BEYOND THE ROLES'}
              </span>
            </div>
            
            <h3 className="font-serif text-xl sm:text-2xl md:text-[1.65rem] text-white tracking-tight leading-tight mb-2">
              {missionHeading}
            </h3>
            
            <p className="text-white/75 font-light text-xs sm:text-sm md:text-[0.92rem] max-w-xl leading-relaxed mt-1">
              {missionDescription}
            </p>
          </div>

          {/* Right Side: Features */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 md:gap-10 w-full xl:w-auto xl:border-l border-white/10 xl:pl-10">
            <div className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-full border border-accent-gold/40 flex items-center justify-center shrink-0 transition-colors group-hover:border-accent-gold group-hover:bg-accent-gold/15 bg-black/40">
                <Compass size={20} className="text-accent-gold" weight="regular" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-sm sm:text-base font-medium text-white mb-0.5">Real experience</span>
                <span className="text-paragraph text-xs sm:text-[0.82rem] font-light text-white/70 leading-snug">Life in high-pressure<br/>environments.</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-full border border-accent-gold/40 flex items-center justify-center shrink-0 transition-colors group-hover:border-accent-gold group-hover:bg-accent-gold/15 bg-black/40">
                <Brain size={20} className="text-accent-gold" weight="regular" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-sm sm:text-base font-medium text-white mb-0.5">Deep training</span>
                <span className="text-paragraph text-xs sm:text-[0.82rem] font-light text-white/70 leading-snug">Backed by science.<br/>Rooted in empathy.</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-full border border-accent-gold/40 flex items-center justify-center shrink-0 transition-colors group-hover:border-accent-gold group-hover:bg-accent-gold/15 bg-black/40">
                <Users size={20} className="text-accent-gold" weight="regular" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-sm sm:text-base font-medium text-white mb-0.5">Relatable approach</span>
                <span className="text-paragraph text-xs sm:text-[0.82rem] font-light text-white/70 leading-snug">No jargon. No masks.<br/>Just real conversations.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
