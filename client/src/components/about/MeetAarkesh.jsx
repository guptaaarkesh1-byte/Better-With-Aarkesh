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

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

gsap.registerPlugin(ScrollTrigger);


const resolveMeetImg = (url, fallback) => {
  if (!url) return fallback;
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';
  if (url.includes('localhost:5000/uploads/')) return url.replace('http://localhost:5000/uploads/', `${apiUrl}/uploads/`);
  if (url.startsWith('/uploads/')) return `${apiUrl}${url}`;
  return url;
};

const getInitialAboutData = () => {
  try {
    const cached = localStorage.getItem('cached_about_data');
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return null;
};

export default function MeetAarkesh() {
  const container = useRef(null);
  const [aboutData, setAboutData] = useState(getInitialAboutData);
  const [isMiddleHovered, setIsMiddleHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAboutData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-settings/about`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setAboutData(data);
          try {
            localStorage.setItem('cached_about_data', JSON.stringify(data));
          } catch (e) {}
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
  const rawSubheading = aboutData?.subheading || 'Different lenses. Same mission your growth.';
  const subheading = rawSubheading.replace(/—\s*|--\s*/g, ' ');
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
      bgImg: resolveMeetImg(pilotData.bgImg, pilotImg),
      imgPos: 'object-center'
    },
    {
      title: coachData.title || 'COACH',
      icon: Crosshair,
      sub1: coachData.sub1 || 'ICF certified life coach.',
      sub2: coachData.sub2 || 'Evidence based. Human first.',
      highlight: coachData.highlight || 'I walk beside you, not ahead of you.',
      bgImg: resolveMeetImg(coachData.bgImg, coachImg),
      imgPos: 'object-[center_85%]'
    },
    {
      title: humanData.title || 'HUMAN',
      icon: Heart,
      sub1: humanData.sub1 || 'Flaws. Lessons. Growth.',
      sub2: humanData.sub2 || 'Still figuring things out.',
      highlight: humanData.highlight || 'Just like you.',
      bgImg: resolveMeetImg(humanData.bgImg, humanImg),
      imgPos: 'object-center'
    }
  ];

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true,
      }
    });

    tl.fromTo('.meet-header',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }
    )
    .fromTo('.role-pane',
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.12 },
      "-=0.3"
    )
    .fromTo('.meet-footer',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      "-=0.2"
    );
  }, { scope: container, dependencies: [aboutData] });

  return (
    <section ref={container} id="meet-aarkesh" className="relative w-full h-auto lg:h-screen min-h-screen flex flex-col bg-[#f5f1e8] overflow-hidden snap-section">
      
      {/* Top Header: Only MEET AARKESH in top white/cream space */}
      <div className="flex flex-col items-center justify-center text-center z-20 px-6 pt-5 sm:pt-7 pb-3 sm:pb-4 meet-header shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="h-[2px] w-8 sm:w-10 bg-[#c9542f]" />
          <span 
            className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-medium tracking-tight text-[#c9542f]"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            {eyebrowText}
          </span>
          <div className="h-[2px] w-8 sm:w-10 bg-[#c9542f]" />
        </div>
      </div>

      {/* Mobile Subheading (Visible on mobile screens) */}
      <div className="flex md:hidden flex-col items-center justify-center text-center z-20 px-6 pb-5">
        <h2 
          className="font-serif text-2xl sm:text-3xl font-medium tracking-tight mb-1 text-[#111010]"
          style={{ fontFamily: 'Fraunces, Georgia, serif' }}
        >
          {headingLine}
        </h2>
        <p className="text-[#555047] text-xs sm:text-sm font-light tracking-wide">
          {subheading}
        </p>
      </div>

      {/* Grid Panes */}
      <div className="w-full flex-grow flex flex-col md:flex-row border-y border-black/10 min-h-0 relative">
        
        {roles.map((role, i) => {
          const Icon = role.icon;
          return (
            <div 
              key={i} 
              className="role-pane relative h-[45vh] md:h-auto md:flex-1 min-h-0 flex flex-col items-center justify-end pb-12 md:pb-16 p-6 group overflow-hidden border-b md:border-b-0 md:border-r border-black/10 last:border-none cursor-pointer bg-[#f5f1e8]"
              onMouseEnter={() => { if (i === 1) setIsMiddleHovered(true); }}
              onMouseLeave={() => { if (i === 1) setIsMiddleHovered(false); }}
            >
              {/* Background Image - Full Visibility */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={role.bgImg} 
                  alt={role.title} 
                  className={`w-full h-full object-cover ${role.imgPos || 'object-center'} opacity-100 contrast-[1.02] will-change-transform transition-transform duration-[1.2s] ease-out group-hover:scale-105`} 
                />
              </div>

              {/* Clean bottom gradient only on hover for legible text - No glow, no full-card fog */}
              <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#f5f1e8] via-[#f5f1e8]/70 to-transparent opacity-0 group-hover:opacity-100 z-0 pointer-events-none transition-opacity duration-300 ease-out" />

              {/* Three roles. One purpose. Heading inside the middle column image */}
              {i === 1 && (
                <>
                  <div 
                    className={`hidden md:flex absolute top-5 sm:top-6 lg:top-8 inset-x-0 flex-col items-center justify-center text-center z-20 px-4 sm:px-6 transition-all duration-300 ease-out pointer-events-none ${
                      isMiddleHovered ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
                    }`}
                  >
                    <h2 
                      className="font-serif text-xl sm:text-2xl md:text-[1.65rem] lg:text-[1.95rem] font-medium tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]"
                      style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                    >
                      {headingLine}
                    </h2>
                  </div>

                  <div 
                    className={`hidden md:flex absolute top-[52%] inset-x-0 flex-col items-center justify-center text-center z-20 px-4 transition-all duration-300 ease-out pointer-events-none ${
                      isMiddleHovered ? 'opacity-0 -translate-y-4' : 'opacity-100 -translate-y-1/2'
                    }`}
                    style={{ transform: isMiddleHovered ? 'translateY(-1rem)' : 'translateY(-50%)' }}
                  >
                    <p className="text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.75)] text-xs md:text-[0.88rem] font-normal tracking-wide max-w-[90%] mx-auto">
                      {subheading}
                    </p>
                  </div>
                </>
              )}

              <div className="relative z-10 flex flex-col items-center text-center transition-transform duration-500 ease-out group-hover:-translate-y-2">
                <div className="w-12 h-12 rounded-full border border-[#c9542f]/30 bg-white/95 shadow-md flex items-center justify-center mb-3 sm:mb-4 group-hover:border-[#c9542f] group-hover:bg-[#c9542f] group-hover:text-white transition-colors duration-300">
                  <Icon className="text-[#c9542f] group-hover:text-white text-2xl transition-colors duration-300" weight="regular" />
                </div>
                
                <h3 
                  className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[2.3rem] tracking-widest font-bold mb-3 sm:mb-4 leading-tight transition-all duration-300 select-none group-hover:scale-105"
                  style={{
                    color: '#111010',
                    WebkitTextStroke: '0.45px #ffffff',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 0 6px rgba(255, 255, 255, 0.25)',
                    fontFamily: 'Fraunces, Georgia, serif'
                  }}
                >
                  {role.title}
                </h3>
                
                <div className="flex flex-col items-center gap-1.5 sm:gap-2 opacity-0 transform translate-y-6 transition-all duration-400 ease-out group-hover:opacity-100 group-hover:translate-y-0 h-0 group-hover:h-auto overflow-hidden group-hover:overflow-visible px-4">
                  <p className="text-[#111010] font-semibold text-sm sm:text-base md:text-[1.05rem] leading-snug">{role.sub1}</p>
                  <p className="text-[#2b2723] font-medium text-sm sm:text-base md:text-[0.98rem] leading-snug mb-2">{role.sub2}</p>
                  <p className="text-[#c9542f] font-serif italic text-base sm:text-lg md:text-xl lg:text-[1.25rem] font-bold leading-normal">{role.highlight}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Banner */}
      <div className="w-full bg-[#ede7d8] border-b border-black/10 meet-footer shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-5 sm:py-7 flex flex-col xl:flex-row items-center justify-between gap-6 lg:gap-8">
          
          {/* Left Side: Mission */}
          <div className="flex-1 shrink-0 flex flex-col items-start w-full xl:w-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[1.5px] w-6 bg-[#c9542f] origin-left" />
              <span className="font-sans text-xs sm:text-[0.75rem] uppercase tracking-[0.25em] font-bold text-[#c9542f]">
                {aboutData?.missionEyebrow || 'BEYOND THE ROLES'}
              </span>
            </div>
            
            <h3 className="font-serif text-xl sm:text-2xl md:text-[1.65rem] text-[#111010] tracking-tight leading-tight mb-2">
              {missionHeading}
            </h3>
            
            <p className="text-[#555047] font-light text-xs sm:text-sm md:text-[0.92rem] max-w-xl leading-relaxed mt-1">
              {missionDescription}
            </p>
          </div>

          {/* Right Side: Features */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 md:gap-10 w-full xl:w-auto xl:border-l border-black/10 xl:pl-10">
            <div className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-full border border-[#c9542f]/30 flex items-center justify-center shrink-0 transition-colors group-hover:border-[#c9542f] group-hover:bg-[#fbf0eb] bg-white shadow-xs">
                <Compass size={20} className="text-[#c9542f]" weight="regular" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-sm sm:text-base font-semibold text-[#111010] mb-0.5">Real experience</span>
                <span className="text-[#555047] text-xs sm:text-[0.82rem] font-light leading-snug">Life in high-pressure<br/>environments.</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-full border border-[#c9542f]/30 flex items-center justify-center shrink-0 transition-colors group-hover:border-[#c9542f] group-hover:bg-[#fbf0eb] bg-white shadow-xs">
                <Brain size={20} className="text-[#c9542f]" weight="regular" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-sm sm:text-base font-semibold text-[#111010] mb-0.5">Deep training</span>
                <span className="text-[#555047] text-xs sm:text-[0.82rem] font-light leading-snug">Backed by science.<br/>Rooted in empathy.</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-full border border-[#c9542f]/30 flex items-center justify-center shrink-0 transition-colors group-hover:border-[#c9542f] group-hover:bg-[#fbf0eb] bg-white shadow-xs">
                <Users size={20} className="text-[#c9542f]" weight="regular" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-sm sm:text-base font-semibold text-[#111010] mb-0.5">Relatable approach</span>
                <span className="text-[#555047] text-xs sm:text-[0.82rem] font-light leading-snug">No jargon. No masks.<br/>Just real conversations.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
