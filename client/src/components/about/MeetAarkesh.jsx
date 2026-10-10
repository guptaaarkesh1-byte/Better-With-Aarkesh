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

import { CDN_IMAGES } from '../../utils/cdnAssets';

const pilotImg = CDN_IMAGES.ABOUT_PILOT;
const coachImg = CDN_IMAGES.ABOUT_COACH;
const humanImg = CDN_IMAGES.ABOUT_HUMAN;

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

gsap.registerPlugin(ScrollTrigger);


const resolveMeetImg = (url, fallback) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return fallback;
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

  const rawEyebrow = (aboutData?.eyebrowText !== undefined && aboutData?.eyebrowText !== null && aboutData?.eyebrowText !== '') 
    ? aboutData.eyebrowText 
    : 'MEET AARKESH';
  const eyebrowText = rawEyebrow;
  const headingLine = aboutData?.headingLine || 'Three roles. One purpose.';
  const rawSubheading = aboutData?.subheading || 'Different lenses. Same mission your growth.';
  const subheading = rawSubheading.replace(/—\s*|--\s*/g, ' ');
  const missionHeading = aboutData?.missionHeading || 'The journey that shaped the mission.';
  const rawMissionDescription = aboutData?.missionDescription || "From the skies to the soul, here's the story behind why I do what I do.";
  const missionDescription = rawMissionDescription.replace(/—\s*|--\s*/g, ', ').replace(/,\s*,/g, ',');
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
      fallbackImg: pilotImg,
      imgPos: 'object-center'
    },
    {
      title: coachData.title || 'COACH',
      icon: Crosshair,
      sub1: coachData.sub1 || 'ICF certified life coach.',
      sub2: coachData.sub2 || 'Evidence based. Human first.',
      highlight: coachData.highlight || 'I walk beside you, not ahead of you.',
      bgImg: resolveMeetImg(coachData.bgImg, coachImg),
      fallbackImg: coachImg,
      imgPos: 'object-[center_85%]'
    },
    {
      title: humanData.title || 'HUMAN',
      icon: Heart,
      sub1: humanData.sub1 || 'Flaws. Lessons. Growth.',
      sub2: humanData.sub2 || 'Still figuring things out.',
      highlight: humanData.highlight || 'Just like you.',
      bgImg: resolveMeetImg(humanData.bgImg, humanImg),
      fallbackImg: humanImg,
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

  const [openCardIndex, setOpenCardIndex] = useState(null);

  const toggleMobileCard = (index) => {
    setOpenCardIndex(openCardIndex === index ? null : index);
  };

  return (
    <section ref={container} id="meet-aarkesh" className="relative w-full h-auto lg:h-screen min-h-screen flex flex-col bg-[#f5f1e8] overflow-hidden snap-section">
      
      {/* ─── MOBILE VIEW (Matches user's mobile prototype) ─── */}
      <div className="block md:hidden w-full px-5 py-14 border-t border-black/10">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center gap-2.5 w-full max-w-sm mx-auto">
            <div className="h-[1.5px] w-6 sm:w-8 bg-[#c9542f] shrink-0" />
            <h2 
              className="font-serif font-medium text-[clamp(17px,4.8vw,23px)] uppercase tracking-[0.14em] text-[#B3441F] whitespace-pre leading-none m-0"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              {eyebrowText}
            </h2>
            <div className="h-[1.5px] w-6 sm:w-8 bg-[#c9542f] shrink-0" />
          </div>
          <div className="mt-3.5 text-center">
            <p className="font-serif font-medium text-[20px] sm:text-[22px] leading-[1.25] tracking-tight text-[#141414]">
              {headingLine || 'Three roles. One purpose.'}
            </p>
            <small className="block mt-2 font-sans font-normal text-sm leading-[1.5] text-[#55504a]">
              {subheading || 'Different lenses. Same mission: your growth.'}
            </small>
          </div>
        </div>

        {/* 3 Role Cards Stacked */}
        <div className="flex flex-col gap-4.5 mt-7">
          {roles.map((role, i) => {
            const Icon = role.icon;
            const isOpen = openCardIndex === i;
            return (
              <article 
                key={i}
                onClick={() => toggleMobileCard(i)}
                className={`role relative rounded-[22px] overflow-hidden aspect-[636/678] bg-[#e9dccb] isolate shadow-[0_18px_40px_-26px_rgba(90,50,20,0.55)] cursor-pointer transition-all duration-300 ${
                  isOpen ? 'is-open' : ''
                }`}
              >
                {/* Background Photo */}
                <img 
                  src={role.bgImg || role.fallbackImg} 
                  alt={role.title} 
                  onError={(e) => {
                    if (role.fallbackImg && e.currentTarget.src !== role.fallbackImg) {
                      e.currentTarget.src = role.fallbackImg;
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-cover -z-20"
                />

                {/* Wash Gradient (Fades in on tap/hover) */}
                <div className={`absolute inset-0 -z-10 transition-opacity duration-350 bg-gradient-to-t from-[rgba(247,242,235,0.97)] from-0% via-[rgba(247,242,235,0.94)] via-38% via-[rgba(247,242,235,0.72)] via-52% to-transparent to-68% ${
                  isOpen ? 'opacity-100' : 'opacity-0'
                }`} />

                {/* Top-Right Tap Button */}
                <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 font-sans font-semibold text-[10px] tracking-[0.16em] uppercase text-[#4a4339] shadow-xs pointer-events-none transition-opacity duration-250 ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`}>
                  <span className="text-xs font-bold">+</span>
                  <span>TAP</span>
                </div>

                {/* Bottom Content Area */}
                <div className={`absolute inset-0 flex flex-col justify-end items-center text-center px-4 transition-all duration-350 ${
                  isOpen ? 'pb-[6%]' : 'pb-[15%]'
                }`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl mb-2 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.45)] transition-colors duration-300 ${
                    isOpen ? 'bg-[#c9542f] text-white' : 'bg-white/95 text-[#c9542f]'
                  }`}>
                    <Icon size={20} weight="regular" />
                  </div>

                  <h3 
                    className="m-0 font-serif font-bold text-[25px] leading-[1.1] tracking-[0.3em] uppercase pl-[0.3em] text-[#141414] [text-shadow:0_0_9px_rgba(255,255,255,0.95),0_0_3px_rgba(255,255,255,0.95),0_1px_2px_rgba(255,255,255,0.8)]"
                    style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                  >
                    {role.title}
                  </h3>

                  {/* Expandable Drawer Content */}
                  <div className={`grid transition-[grid-template-rows,opacity] duration-350 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
                  }`}>
                    <div className="overflow-hidden">
                      <p className="font-sans font-normal text-[14.5px] leading-[1.5] text-[#1c1916] mt-2.5">
                        {role.sub1}<br />
                        {role.sub2}
                      </p>
                      <em className="block font-serif italic font-medium text-[17px] leading-[1.35] text-[#B3441F] mt-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                        {role.highlight}
                      </em>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ─── DESKTOP VIEW (100% untouched desktop layout) ─── */}
      {/* Top Header: Only MEET AARKESH in top white/cream space */}
      <div className="hidden md:flex flex-col items-center justify-center text-center z-20 px-6 pt-5 sm:pt-7 pb-3 sm:pb-4 meet-header shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="h-[2px] w-8 sm:w-10 bg-[#c9542f]" />
          <span 
            className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-medium tracking-tight text-[#c9542f] whitespace-pre"
            style={{ 
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: aboutData?.eyebrowFontSize ? `${aboutData.eyebrowFontSize}px` : undefined 
            }}
          >
            {eyebrowText}
          </span>
          <div className="h-[2px] w-8 sm:w-10 bg-[#c9542f]" />
        </div>
      </div>

      {/* Desktop Grid Panes */}
      <div className="hidden md:flex w-full flex-grow flex-row border-y border-black/10 min-h-0 relative">
        
        {roles.map((role, i) => {
          const Icon = role.icon;
          return (
            <div 
              key={i} 
              className="role-pane relative h-auto flex-1 min-h-0 flex flex-col items-center justify-end pb-12 md:pb-16 p-6 group overflow-hidden border-r border-black/10 last:border-none cursor-pointer bg-[#f5f1e8]"
              onMouseEnter={() => { if (i === 1) setIsMiddleHovered(true); }}
              onMouseLeave={() => { if (i === 1) setIsMiddleHovered(false); }}
            >
              {/* Background Image - Full Visibility with Automatic Fallback */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={role.bgImg || role.fallbackImg} 
                  alt={role.title} 
                  onError={(e) => {
                    if (role.fallbackImg && e.currentTarget.src !== role.fallbackImg) {
                      e.currentTarget.src = role.fallbackImg;
                    }
                  }}
                  className={`w-full h-full object-cover ${role.imgPos || 'object-center'} opacity-100 contrast-[1.02] will-change-transform transition-transform duration-[1.2s] ease-out group-hover:scale-105`} 
                />
              </div>

              {/* Clean bottom gradient only on hover for legible text */}
              <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#f5f1e8] via-[#f5f1e8]/70 to-transparent opacity-0 group-hover:opacity-100 z-0 pointer-events-none transition-opacity duration-300 ease-out" />

              {/* Three roles. One purpose. Heading inside the middle column image */}
              {i === 1 && (
                <>
                  <div 
                    className={`flex absolute top-5 sm:top-6 lg:top-8 inset-x-0 flex-col items-center justify-center text-center z-20 px-4 sm:px-6 transition-all duration-300 ease-out pointer-events-none ${
                      isMiddleHovered ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
                    }`}
                  >
                    <h2 
                      className="font-serif text-xl sm:text-2xl md:text-[1.65rem] lg:text-[1.95rem] font-medium tracking-tight text-white select-none"
                      style={{ 
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: aboutData?.headingFontSize ? `${aboutData.headingFontSize}px` : undefined,
                        WebkitTextStroke: '0.55px #ff6b35',
                        textShadow: '0 0 6px rgba(255, 107, 53, 0.95), 0 0 14px rgba(255, 122, 61, 0.75), 0 0 22px rgba(255, 87, 34, 0.5), 0 2px 4px rgba(0, 0, 0, 0.75)'
                      }}
                    >
                      {headingLine}
                    </h2>
                  </div>

                  <div 
                    className={`flex absolute top-[52%] inset-x-0 flex-col items-center justify-center text-center z-20 px-4 transition-all duration-300 ease-out pointer-events-none ${
                      isMiddleHovered ? 'opacity-0 -translate-y-4' : 'opacity-100 -translate-y-1/2'
                    }`}
                    style={{ transform: isMiddleHovered ? 'translateY(-1rem)' : 'translateY(-50%)' }}
                  >
                    <p 
                      className="text-white text-xs md:text-[0.88rem] font-medium tracking-wide max-w-[90%] mx-auto select-none"
                      style={{ 
                        fontSize: aboutData?.descriptionFontSize ? `${aboutData.descriptionFontSize}px` : undefined,
                        WebkitTextStroke: '0.38px #ff6b35',
                        textShadow: '0 0 5px rgba(255, 107, 53, 0.9), 0 0 10px rgba(255, 122, 61, 0.65), 0 1px 3px rgba(0, 0, 0, 0.75)'
                      }}
                    >
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
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-1 sm:py-1.5 lg:py-2 flex flex-col xl:flex-row items-center justify-start gap-4 lg:gap-6 xl:gap-8">
          
          {/* Left Side: Mission */}
          <div className="shrink-0 flex flex-col items-start w-full xl:w-auto max-w-lg">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="h-[1.5px] w-4 bg-[#c9542f] origin-left" />
              <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-bold text-[#c9542f]">
                {aboutData?.missionEyebrow || 'BEYOND THE ROLES'}
              </span>
            </div>
            
            <h3 className="font-serif text-base sm:text-lg md:text-[1.25rem] text-[#111010] tracking-tight leading-tight mb-0.5">
              {missionHeading}
            </h3>
            
            <p className="text-[#555047] font-light text-[10.5px] sm:text-[11.5px] max-w-lg leading-snug">
              {missionDescription}
            </p>
          </div>

          {/* Right Side: Features */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 lg:gap-6 w-full xl:w-auto xl:border-l border-black/10 xl:pl-6 lg:pl-4">
            <div className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="w-8 h-8 rounded-full border border-[#c9542f]/30 flex items-center justify-center shrink-0 transition-colors group-hover:border-[#c9542f] group-hover:bg-[#fbf0eb] bg-white shadow-xs">
                <Compass size={16} className="text-[#c9542f]" weight="regular" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[12px] sm:text-[13px] font-semibold text-[#111010] leading-tight mb-0.5">Real experience</span>
                <span className="text-[#555047] text-[9.5px] sm:text-[10.5px] font-light leading-tight">Life in high-pressure<br/>environments.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="w-8 h-8 rounded-full border border-[#c9542f]/30 flex items-center justify-center shrink-0 transition-colors group-hover:border-[#c9542f] group-hover:bg-[#fbf0eb] bg-white shadow-xs">
                <Brain size={16} className="text-[#c9542f]" weight="regular" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[12px] sm:text-[13px] font-semibold text-[#111010] leading-tight mb-0.5">Deep training</span>
                <span className="text-[#555047] text-[9.5px] sm:text-[10.5px] font-light leading-tight">Backed by science.<br/>Rooted in empathy.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="w-8 h-8 rounded-full border border-[#c9542f]/30 flex items-center justify-center shrink-0 transition-colors group-hover:border-[#c9542f] group-hover:bg-[#fbf0eb] bg-white shadow-xs">
                <Users size={16} className="text-[#c9542f]" weight="regular" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[12px] sm:text-[13px] font-semibold text-[#111010] leading-tight mb-0.5">Relatable approach</span>
                <span className="text-[#555047] text-[9.5px] sm:text-[10.5px] font-light leading-tight">No jargon. No masks.<br/>Just real conversations.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
