import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import { 
  AirplaneTilt, 
  Crosshair, 
  Heart, 
  ArrowRight,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import RoleDetailModal from './RoleDetailModal';

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

export const MEET_OVERLAY_CONFIG = {
  peakStart: 0.02,         // Section entering -> reaches full blur & text immediately
  fadeStart: 0.30,         // Smooth fade-out starts after 30% scroll
  fadeEnd: 0.60,           // Blur & text completely faded out by 60%
  maxBlurDesktop: 18,      // Max blur on desktop in pixels (18px)
  maxBlurMobile: 12,       // Max blur on mobile in pixels (12px, screens < 768px)
  textMain: 'MEET',        // Main title text
  textAccent: 'AARKESH',   // Accent word (styled with brand accent color)
  startY: 10,              // Initial translateY at p = 0 (+10px)
  peakY: 0,                // Center translateY at p = peak (0px)
  endY: -10,               // Final translateY at p = fadeEnd (-10px)
};

export default function MeetAarkesh() {
  const container = useRef(null);
  const [aboutData, setAboutData] = useState(getInitialAboutData);
  const [aboutPopupData, setAboutPopupData] = useState(null);
  const [isRoleGridHovered, setIsRoleGridHovered] = useState(false);
  const [activeRoleKey, setActiveRoleKey] = useState(null);
  const [activeRoleCardImage, setActiveRoleCardImage] = useState(null);
  const activeTriggerRef = useRef(null);

  const handleRoleClick = (role, triggerEl) => {
    // If master toggle is disabled, role cards behave as before
    if (aboutPopupData?.popup?.enabled === false) return;
    activeTriggerRef.current = triggerEl;
    setActiveRoleKey(role.key);
    setActiveRoleCardImage(role.bgImg || role.fallbackImg);
  };

  const handleCloseModal = () => {
    setActiveRoleKey(null);
  };

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

    // Fetch About Aarkesh Popup data
    fetch(`${API_URL}/api/about-popup`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && isMounted) setAboutPopupData(data);
      })
      .catch(err => console.warn('Failed to load popup data:', err));

    return () => { isMounted = false; };
  }, []);

  const rawEyebrow = (aboutData?.eyebrowText !== undefined && aboutData?.eyebrowText !== null && aboutData?.eyebrowText !== '') 
    ? aboutData.eyebrowText 
    : 'MEET AARKESH';
  const eyebrowText = rawEyebrow;
  const headingLine = aboutData?.headingLine || 'Three roles. One purpose.';
  const configuredHeadingFontSize = Number(aboutData?.headingFontSize);
  const responsiveHeadingFontSize = Number.isFinite(configuredHeadingFontSize) && configuredHeadingFontSize > 0
    ? `clamp(2rem, 6vw, ${configuredHeadingFontSize}px)`
    : undefined;
  const rawSubheading = aboutData?.subheading || 'Different lenses. Same mission your growth.';
  const subheading = rawSubheading.replace(/—\s*|--\s*/g, ' ');
  const storyBtnText = aboutData?.storyBtnText || 'READ MY STORY';
  const storyBtnLink = aboutData?.storyBtnLink || '/about-us';

  const pilotData = aboutData?.rolePilot || {};
  const coachData = aboutData?.roleCoach || {};
  const humanData = aboutData?.roleHuman || {};

  const roles = [
    {
      key: 'pilot',
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
      key: 'coach',
      title: coachData.title || 'COACH',
      icon: Crosshair,
      sub1: coachData.sub1 || 'ICF certified life coach.',
      sub2: coachData.sub2 || 'Evidence based. Human first.',
      highlight: coachData.highlight || 'I walk beside you, not ahead of you.',
      bgImg: resolveMeetImg(coachData.bgImg, coachImg),
      fallbackImg: coachImg,
      imgPos: 'object-[center_65%]'
    },
    {
      key: 'human',
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

  useEffect(() => {
    window.awOpenRole = (key) => {
      const match = roles.find(r => r.key === key?.toLowerCase());
      if (match) {
        setActiveRoleKey(match.key);
        setActiveRoleCardImage(match.bgImg || match.fallbackImg);
      }
    };

    // Auto-open if query param exists (e.g. ?popup=about or ?openAbout=true or ?openRole=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const shouldOpen = params.get('popup') === 'about' || params.get('openAbout') === 'true' || params.has('openRole');
      const roleParam = params.get('role') || params.get('openRole');
      if (shouldOpen || roleParam) {
        const target = roleParam || 'pilot';
        const match = roles.find(r => r.key === target?.toLowerCase()) || roles[0];
        if (match) {
          setTimeout(() => {
            setActiveRoleKey(match.key);
            setActiveRoleCardImage(match.bgImg || match.fallbackImg);
          }, 350);
        }
      }
    } catch (e) {}

    return () => {
      delete window.awOpenRole;
    };
  }, [roles]);

  useEffect(() => {
    const overlay = container.current?.querySelector('.meet-overlay');
    if (!overlay || !container.current) return undefined;
    const title = overlay.querySelector('.meet-overlay-title');

    // Use gsap.matchMedia for seamless switching between reduced-motion and standard motion
    const mm = gsap.matchMedia();

    // ── Reduced motion branch: Immediately visible and static ──
    mm.add('(prefers-reduced-motion: reduce)', () => {
      overlay.style.backdropFilter = 'none';
      overlay.style.webkitBackdropFilter = 'none';
      overlay.style.backgroundColor = 'transparent';
      overlay.style.visibility = 'visible';
      overlay.removeAttribute('aria-hidden');
      if (title) {
        title.style.opacity = '1';
        title.style.transform = 'none';
      }
    });

    // ── No-preference branch: Scroll-driven blur & fade animation ──
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      let animationFrame = null;

      const setHidden = (y = MEET_OVERLAY_CONFIG.startY) => {
        overlay.style.pointerEvents = 'none';
        overlay.style.backdropFilter = 'none';
        overlay.style.webkitBackdropFilter = 'none';
        overlay.style.backgroundColor = 'transparent';
        overlay.style.visibility = 'hidden';
        overlay.setAttribute('aria-hidden', 'true');
        if (title) {
          title.style.opacity = '0';
          title.style.transform = `translateY(${y}px)`;
        }
      };

      const setVisible = (blurVal, opVal, yVal, opacity, blur) => {
        overlay.style.pointerEvents = 'none';
        overlay.style.backdropFilter = blur > 0.1 ? `blur(${blurVal}px)` : 'none';
        overlay.style.webkitBackdropFilter = blur > 0.1 ? `blur(${blurVal}px)` : 'none';
        overlay.style.backgroundColor = opacity > 0.01 ? `rgba(245, 241, 232, ${(opacity * 0.42).toFixed(3)})` : 'transparent';
        overlay.style.visibility = 'visible';
        overlay.removeAttribute('aria-hidden');
        if (title) {
          title.style.opacity = opVal;
          title.style.transform = `translateY(${yVal}px)`;
        }
      };

      const updateOverlay = () => {
        animationFrame = null;
        if (!container.current) return;

        const rect = container.current.getBoundingClientRect();
        const vh = window.innerHeight || 1;

        // Fast cull: if section is offscreen, immediately return with zero work
        if (rect.bottom < -100 || rect.top > vh + 100) {
          setHidden();
          return;
        }

        const rawP = 1 - rect.top / vh;
        const progress = Math.min(Math.max(rawP, 0), 1);
        const { peakStart, fadeStart, fadeEnd, startY, peakY, endY, maxBlurMobile, maxBlurDesktop } = MEET_OVERLAY_CONFIG;

        if (progress <= 0 || progress >= fadeEnd) {
          setHidden(progress <= 0 ? startY : endY);
          return;
        }

        const maxBlur = window.innerWidth < 768 ? maxBlurMobile : maxBlurDesktop;

        let blur = 0;
        let opacity = 0;
        let y = peakY;

        if (progress <= peakStart) {
          // Phase 1 (0 -> 0.15): Ease-in ramp up as section enters
          const phase = progress / peakStart;
          const curve = 1 - (1 - phase) * (1 - phase);
          blur = maxBlur * curve;
          opacity = curve;
          y = startY + (peakY - startY) * curve;
        } else if (progress <= fadeStart) {
          // Phase 2 (0.15 -> 0.40): Steady full peak — strong blur & visible text
          blur = maxBlur;
          opacity = 1;
          y = peakY;
        } else {
          // Phase 3 (0.40 -> 0.75): After 40% scroll, smoothly fade out both blur and text
          const phase = (progress - fadeStart) / (fadeEnd - fadeStart);
          const smoothDecrease = 0.5 * (1 + Math.cos(phase * Math.PI));
          blur = maxBlur * smoothDecrease;
          opacity = smoothDecrease;
          y = endY + (peakY - endY) * smoothDecrease;
        }

        const blurVal = blur.toFixed(1);
        const opVal = opacity.toFixed(3);
        const yVal = y.toFixed(1);

        if (opacity > 0.005) {
          setVisible(blurVal, opVal, yVal, opacity, blur);
        } else {
          setHidden(yVal);
        }
      };

      const requestUpdate = () => {
        if (animationFrame === null) {
          animationFrame = window.requestAnimationFrame(updateOverlay);
        }
      };

      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', requestUpdate, { passive: true });
      ScrollTrigger.addEventListener('scroll', requestUpdate);

      if (window.lenis) {
        window.lenis.on('scroll', requestUpdate);
      }

      requestUpdate();

      return () => {
        window.removeEventListener('scroll', requestUpdate);
        window.removeEventListener('resize', requestUpdate);
        ScrollTrigger.removeEventListener('scroll', requestUpdate);
        if (window.lenis) {
          window.lenis.off('scroll', requestUpdate);
        }
        if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Reduced motion: fully visible static state
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(['.role-pane', '.meet-footer'], {
        opacity: 1,
        scale: 1,
        y: 0,
        clearProps: 'transform'
      });
    });

    // Standard motion: scroll-triggered entry
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        }
      });

      tl.fromTo('.role-pane',
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.12 }
      )
      .fromTo('.meet-footer',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
        "-=0.2"
      );
    });

    return () => mm.revert();
  }, { scope: container, dependencies: [aboutData] });

  const [openCardIndex, setOpenCardIndex] = useState(null);

  const toggleMobileCard = (index) => {
    setOpenCardIndex(openCardIndex === index ? null : index);
  };

  return (
    <section 
      ref={container} 
      id="meet-aarkesh" 
      className="principle-slide-over relative z-20 w-full !min-h-0 h-auto flex flex-col bg-[#f5f1e8] overflow-hidden snap-section"
      style={{ minHeight: 'auto' }}
    >
      <div id="about" className="absolute -top-10" />
      
      {/* ─── MOBILE VIEW (Matches user's mobile prototype) ─── */}
      <div className="block md:hidden w-full px-5 py-14 border-t border-black/10">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-center">
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
            return (
              <article 
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Open ${role.title} details`}
                data-aw-role={role.key}
                onClick={(e) => handleRoleClick(role, e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRoleClick(role, e.currentTarget);
                  }
                }}
                className="role group relative rounded-[22px] overflow-hidden aspect-[636/678] bg-[#e9dccb] isolate shadow-[0_18px_40px_-26px_rgba(90,50,20,0.55)] cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-3 focus-visible:ring-[#c4522d] focus-visible:ring-offset-2 active:scale-[0.99] select-none"
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
                  className="absolute inset-0 w-full h-full object-cover -z-20 pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Wash Gradient */}
                <div className="absolute inset-0 -z-10 transition-opacity duration-350 bg-gradient-to-t from-[rgba(247,242,235,0.96)] from-0% via-[rgba(247,242,235,0.88)] via-42% via-[rgba(247,242,235,0.65)] via-56% to-transparent to-72% pointer-events-none opacity-90 group-hover:opacity-100" />

                {/* Top-Right Tap Button */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 font-sans font-semibold text-[10px] tracking-[0.16em] uppercase text-[#4a4339] shadow-xs pointer-events-none transition-transform duration-300 group-hover:scale-105">
                  <span className="text-xs font-bold text-[#c4522d]">+</span>
                  <span>TAP</span>
                </div>

                {/* Bottom Content Area */}
                <div className="absolute inset-0 flex flex-col justify-end items-center text-center px-4 pb-[8%] pointer-events-none">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl mb-2 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.45)] bg-white/95 text-[#c9542f] group-hover:bg-[#c9542f] group-hover:text-white transition-colors duration-300 pointer-events-none">
                    <Icon size={20} weight="regular" />
                  </div>

                  <h3 
                    className="m-0 font-serif font-bold text-[25px] leading-[1.1] tracking-[0.3em] uppercase pl-[0.3em] text-[#141414] [text-shadow:0_0_9px_rgba(255,255,255,0.95),0_0_3px_rgba(255,255,255,0.95),0_1px_2px_rgba(255,255,255,0.8)] pointer-events-none group-hover:scale-105 transition-transform"
                    style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                  >
                    {role.title}
                  </h3>

                  <div className="mt-2 pointer-events-none">
                    <p className="font-sans font-normal text-[14px] leading-[1.4] text-[#1c1916]">
                      {role.sub1}<br />
                      {role.sub2}
                    </p>
                    <em className="block font-serif italic font-medium text-[16px] leading-[1.3] text-[#B3441F] mt-1.5" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                      {role.highlight}
                    </em>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ─── DESKTOP VIEW ─── */}
      {/* 🎛️ Desktop Grid Panes - Change height here: e.g. lg:h-[540px], lg:h-[580px], lg:h-[600px] */}
      <div
        className="hidden md:flex w-full h-[450px] sm:h-[480px] md:h-[510px] lg:h-[540px] flex-row border-t border-black/10 relative shrink-0"
        onMouseEnter={() => setIsRoleGridHovered(true)}
        onMouseLeave={() => setIsRoleGridHovered(false)}
      >
        
        {roles.map((role, i) => {
          const Icon = role.icon;
          return (
            <div 
              key={i} 
              role="button"
              tabIndex={0}
              aria-label={`Open ${role.title} details`}
              data-aw-role={role.key}
              onClick={(e) => handleRoleClick(role, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRoleClick(role, e.currentTarget);
                }
              }}
              className="role-pane relative h-full flex-1 min-h-0 flex flex-col items-center justify-end pb-5 sm:pb-6 md:pb-7 lg:pb-8 px-4 sm:px-6 group overflow-hidden border-r border-black/10 last:border-none cursor-pointer bg-[#f5f1e8] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#c4522d] focus-visible:ring-offset-[-2px] focus-visible:z-30 transition-all select-none"
            >
              {/* Background Image - Full Visibility with Automatic Fallback */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img 
                  src={role.bgImg || role.fallbackImg} 
                  alt={role.title} 
                  onError={(e) => {
                    if (role.fallbackImg && e.currentTarget.src !== role.fallbackImg) {
                      e.currentTarget.src = role.fallbackImg;
                    }
                  }}
                  className={`w-full h-full object-cover ${role.imgPos || 'object-center'} opacity-100 contrast-[1.02] will-change-transform transition-transform duration-[1.2s] ease-out group-hover:scale-105 pointer-events-none`} 
                />
              </div>

              {/* Clean bottom gradient only on hover for legible text */}
              <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#f5f1e8] via-[#f5f1e8]/70 to-transparent opacity-0 group-hover:opacity-100 z-0 pointer-events-none transition-opacity duration-300 ease-out" />

              <div className="relative z-10 flex flex-col items-center text-center transition-transform duration-500 ease-out group-hover:-translate-y-2 pointer-events-none">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#c9542f]/30 bg-white/95 shadow-md flex items-center justify-center mb-2 sm:mb-2.5 group-hover:border-[#c9542f] group-hover:bg-[#c9542f] group-hover:text-white transition-colors duration-300 pointer-events-none">
                  <Icon className="text-[#c9542f] group-hover:text-white text-xl sm:text-2xl transition-colors duration-300 pointer-events-none" weight="regular" />
                </div>
                
                <h3 
                  className="font-serif text-xl sm:text-2xl md:text-[1.75rem] lg:text-[1.95rem] tracking-widest font-bold mb-2 sm:mb-2.5 leading-tight transition-all duration-300 select-none group-hover:scale-105 pointer-events-none"
                  style={{
                    color: '#111010',
                    WebkitTextStroke: '0.45px #ffffff',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 0 6px rgba(255, 255, 255, 0.25)',
                    fontFamily: 'Fraunces, Georgia, serif'
                  }}
                >
                  {role.title}
                </h3>
                
                <div className="flex flex-col items-center gap-1.5 sm:gap-2 opacity-0 transform translate-y-6 transition-all duration-400 ease-out group-hover:opacity-100 group-hover:translate-y-0 h-0 group-hover:h-auto overflow-hidden group-hover:overflow-visible px-4 pointer-events-none">
                  <p className="text-[#111010] font-semibold text-xs sm:text-sm md:text-[0.95rem] leading-snug">{role.sub1}</p>
                  <p className="text-[#2b2723] font-medium text-xs sm:text-sm md:text-[0.9rem] leading-snug mb-1.5">{role.sub2}</p>
                  <p className="text-[#c9542f] font-serif italic text-sm sm:text-base md:text-lg lg:text-[1.1rem] font-bold leading-normal">{role.highlight}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div
          className={`absolute inset-x-0 top-[12%] z-30 flex -translate-y-1/2 justify-center px-4 text-center pointer-events-none transition-opacity duration-300 ${
            isRoleGridHovered ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <p
            className="m-0 max-w-[90%] font-sans text-xs md:text-[0.82rem] font-medium tracking-wide text-white select-none"
            style={{
              fontSize: aboutData?.descriptionFontSize ? `${aboutData.descriptionFontSize}px` : undefined,
              WebkitTextStroke: '0.38px #ff6b35',
              textShadow: '0 0 5px rgba(255, 107, 53, 0.9), 0 0 10px rgba(255, 122, 61, 0.65), 0 1px 3px rgba(0, 0, 0, 0.75)'
            }}
          >
            {subheading}
          </p>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="w-full bg-[#ede7d8] border-t border-b border-black/10 meet-footer shrink-0">
        <div className="w-full px-4 sm:px-6 [padding-block:clamp(1.25rem,2vw,2rem)] text-center overflow-visible">
          <h2
            className="m-0 max-w-[min(100%,1400px)] mx-auto font-serif text-lg sm:text-xl md:text-[1.35rem] lg:text-[1.55rem] font-medium tracking-tight leading-[1.12] text-[#111010] break-words"
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: responsiveHeadingFontSize,
            }}
          >
            {headingLine}
          </h2>
        </div>
      </div>

      {/* ─── SCROLL-DRIVEN BLUR + "MEET AARKESH" OVERLAY ─── */}
      <div
        className="meet-overlay absolute inset-0 z-50 flex items-start justify-center pt-3 sm:pt-4 md:pt-5 lg:pt-6 pointer-events-none"
      >
        <h2
          className="meet-overlay-title uppercase font-serif text-[clamp(48px,8vw,124px)] leading-none tracking-tight font-medium text-[#111010] select-none px-4 text-center"
          style={{
            color: '#111010',
            WebkitTextStroke: '1.1px #ffa260',
            textShadow: '0 0 6px rgba(255, 170, 100, 0.95), 0 0 14px rgba(255, 185, 125, 0.8), 0 0 25px rgba(255, 205, 150, 0.55)'
          }}
        >
          {aboutData?.overlayTitle || `${MEET_OVERLAY_CONFIG.textMain} ${MEET_OVERLAY_CONFIG.textAccent}`}
        </h2>
      </div>

      {/* ─── ROLE DETAIL POPUP MODAL ─── */}
      <RoleDetailModal
        isOpen={Boolean(activeRoleKey)}
        roleKey={activeRoleKey}
        cardImage={activeRoleCardImage}
        data={aboutPopupData}
        onClose={handleCloseModal}
        triggerRef={activeTriggerRef}
      />

    </section>
  );
}
