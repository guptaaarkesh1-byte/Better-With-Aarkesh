import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import { CDN_IMAGES } from '../../utils/cdnAssets';
import { resolveImageUrl } from '../../utils/imageUrl';
import { 
  ChatTeardropText, 
  MagnifyingGlass, 
  Compass, 
  Flag, 
  ChartLineUp
} from '@phosphor-icons/react';

const defaultBgImg = CDN_IMAGES.COACHING_PROCESS;

gsap.registerPlugin(ScrollTrigger);

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

  const ICONS = [ChatTeardropText, MagnifyingGlass, Compass, Flag, ChartLineUp];

  // =========================================================================
  // 🎛️ DESKTOP IMAGE ZOOM & POSITION CONTROLS (Adjust values directly here!)
  // =========================================================================
  export const DESKTOP_IMAGE_CONTROLS = {
    zoom: 1.05,             // 🔍 Zoom / Scale: 1.0 (100%), 1.05 (105%), 1.15 (115%)
    posX: '68%',            // ↔️ Horizontal Position: '0%' (Left), '50%' (Center), '68%' (Custom), '100%' (Right)
    posY: '50%',            // ↕️ Vertical Position: '0%' (Top), '50%' (Center), '100%' (Bottom)
    translateX: '0px',      // 🎯 Fine-tune Left/Right pixel nudge: e.g. '+20px', '-30px'
    translateY: '0px',      // 🎯 Fine-tune Up/Down pixel nudge: e.g. '+10px', '-20px'
  };

  const DEFAULT_COACHING_DATA = {
    eyebrowText: 'THE COACHING PROCESS',
    headingLine1: 'A proven process',
    headingAccent: 'built around you.',
    subtitle: 'A clear path from where you are, to where you want to be.',
    subnote: 'Simple. Effective.',
    bgImg: 'https://api.aarkeshgupta.com/uploads/image-1790769351378.png',
    steps: [
      { num: '01', title: 'CONNECT', text: 'We start with a meaningful conversation to understand what matters to you.' },
      { num: '02', title: 'CLARIFY', text: "We dig deep to bring clarity to your thoughts, patterns, and what's keeping you stuck." },
      { num: '03', title: 'ALIGN', text: 'We align your values, goals, and actions with the life you truly want to create.' },
      { num: '04', title: 'ACT', text: "You take intentional action with confidence. I'm here to guide, challenge, and support you." },
      { num: '05', title: 'EVOLVE', text: 'We reflect, recalibrate, and keep building momentum for lasting transformation.' },
    ]
  };

  const getInitialCoachingData = () => {
    try {
      const cached = localStorage.getItem('cached_coaching_process');
      if (cached) {
        return { ...DEFAULT_COACHING_DATA, ...JSON.parse(cached) };
      }
    } catch (e) {}
    return DEFAULT_COACHING_DATA;
  };

  export default function CoachingPrinciple() {
    const container = useRef(null);
    const [activeStep, setActiveStep] = useState(null);
    const [data, setData] = useState(getInitialCoachingData);
    const [isImgLoaded, setIsImgLoaded] = useState(false);

    useEffect(() => {
      let isMounted = true;
      const fetchCoachingData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-settings/coachingProcess`);
        if (res.ok && isMounted) {
          const json = await res.json();
          setData(prev => {
            const updated = {
              ...prev,
              ...json,
              steps: json.steps && json.steps.length > 0 ? json.steps : prev.steps
            };
            try {
              localStorage.setItem('cached_coaching_process', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      } catch (err) {
        console.error('Failed to load coaching process settings:', err);
      }
    };
    fetchCoachingData();
    return () => { isMounted = false; };
  }, []);

  const steps = data.steps || DEFAULT_COACHING_DATA.steps;

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true,
      }
    });

    tl.fromTo('.coaching-fade',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15 }
    )
    .fromTo('.coaching-step',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1 },
      "-=0.4"
    );
  }, { scope: container, dependencies: [data] });

  const resolvedBgUrl = resolveImageUrl(data.bgImg, defaultBgImg);

  return (
    <section ref={container} id="coaching" className="principle-panel relative w-full h-auto lg:h-screen min-h-screen flex flex-col overflow-hidden bg-[#f5f1e8] snap-start">
      
      {/* ─── MOBILE VIEW (Matches user's mobile prototype) ─── */}
      <div className="block lg:hidden w-full border-t border-black/10 py-12 px-0">
        {/* Pad Container */}
        <div className="px-5">
          <p className="flex items-center gap-3 font-sans font-semibold text-[11.5px] leading-snug tracking-[0.24em] uppercase text-[#B3441F] before:content-[''] before:w-7 before:h-[1.5px] before:bg-[#c9542f] before:flex-shrink-0">
            {data.eyebrowText || 'THE COACHING PROCESS'}
          </p>
          <h2 className="font-serif font-medium tracking-tight leading-[1.22] text-[clamp(30px,8.5vw,38px)] text-[#141414] mt-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            <span className="block">{data.headingLine1 || 'A proven process'}</span>
            <span className="block text-[#c9542f] not-italic font-medium mt-1">{data.headingAccent || 'built around you.'}</span>
          </h2>
          <p className="font-serif italic font-normal text-[16.5px] leading-[1.6] text-[#1e1b18] mt-3.5" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {data.subtitle || 'A clear path from where you are, to where you want to be.'}
          </p>
          <p className="font-serif font-normal text-[15.5px] leading-[1.6] text-[#55504a] mt-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {data.subnote || 'Simple. Effective.'}
          </p>
        </div>

        {/* Room Figure (Cozy room) */}
        <div className="mx-5 mt-6 h-[230px] rounded-[22px] overflow-hidden relative shadow-sm">
          <img 
            src={resolvedBgUrl} 
            alt="Coaching Room" 
            className="w-full h-full object-cover object-[50%_56%]"
            onError={(e) => {
              if (e.currentTarget.src !== defaultBgImg) {
                e.currentTarget.src = defaultBgImg;
              }
            }}
          />
        </div>

        {/* Steps Grid: 2 columns with 5th spanning 2 cols */}
        <div className="grid grid-cols-2 gap-2.5 mx-5 mt-3">
          {steps.map((step, i) => {
            const Icon = ICONS[i % ICONS.length];
            const isWide = i === 4;
            const isActive = activeStep === i;
            return (
              <div 
                key={i}
                onClick={() => setActiveStep(isActive ? null : i)}
                className={`p-3 bg-white border border-black/10 rounded-2xl min-h-[66px] shadow-xs cursor-pointer transition-all ${
                  isWide ? 'col-span-2 flex flex-col items-center justify-center text-center' : 'col-span-1 flex items-center gap-3'
                } ${isActive ? 'border-[#c9542f] bg-[#fbf0eb]' : ''}`}
              >
                {isWide ? (
                  <div className="flex flex-col items-center justify-center text-center w-full">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-[#F3EBE0] text-[#4a4339] text-base">
                        <Icon size={18} weight="regular" />
                      </div>
                      <b className="font-sans font-semibold text-[11.5px] leading-snug tracking-[0.16em] uppercase text-[#141414]">
                        <i className="not-italic text-[#B3441F] mr-1.5">{step.num || `0${i+1}`}</i>
                        {step.title}
                      </b>
                    </div>
                    {isActive && (
                      <p className="text-[#4a463e] text-xs font-light leading-snug pt-1.5 text-center max-w-xs">
                        {step.text}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-[#F3EBE0] text-[#4a4339] text-lg">
                      <Icon size={20} weight="regular" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <b className="block font-sans font-semibold text-[11.5px] leading-snug tracking-[0.16em] uppercase text-[#141414] truncate">
                        <i className="not-italic text-[#B3441F] mr-1.5">{step.num || `0${i+1}`}</i>
                        {step.title}
                      </b>
                      {isActive && (
                        <p className="text-[#4a463e] text-xs font-light leading-snug pt-1">
                          {step.text}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── DESKTOP VIEW (100% untouched desktop layout) ─── */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {resolvedBgUrl ? (
          <img 
            src={resolvedBgUrl} 
            alt="Coaching Process"
            onLoad={() => setIsImgLoaded(true)}
            onError={(e) => {
              if (e.currentTarget.src !== defaultBgImg) {
                e.currentTarget.src = defaultBgImg;
              }
            }}
            className={`w-full h-full object-cover will-change-transform transition-opacity duration-700 ${
              isImgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              objectPosition: `${DESKTOP_IMAGE_CONTROLS.posX} ${DESKTOP_IMAGE_CONTROLS.posY}`,
              transform: `scale(${DESKTOP_IMAGE_CONTROLS.zoom}) translate(${DESKTOP_IMAGE_CONTROLS.translateX}, ${DESKTOP_IMAGE_CONTROLS.translateY}) translateZ(0)`
            }}
          />
        ) : null}
        {/* Left-to-right soft white/cream gradient so text and step cards remain crisp and readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8] via-[#f5f1e8]/95 via-25% md:via-[#f5f1e8]/80 md:via-40% lg:via-[#f5f1e8]/50 lg:via-55% to-transparent w-full md:w-[80%] lg:w-[68%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent w-full md:w-[55%] lg:w-[45%]" />
        
        {/* Right-to-left soft cream fade for clean right edge */}
        <div className="absolute inset-y-0 right-0 w-48 md:w-64 bg-gradient-to-l from-[#f5f1e8]/70 via-[#f5f1e8]/30 to-transparent pointer-events-none z-10" />
        
        {/* Subtle edge blends */}
        <div className="absolute inset-x-0 bottom-0 h-12 lg:h-16 bg-gradient-to-t from-[#f5f1e8] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 top-0 h-12 lg:h-16 bg-gradient-to-b from-[#f5f1e8] to-transparent pointer-events-none z-10" />
      </div>

      {/* Desktop Main Content Area */}
      <div className="hidden lg:flex relative flex-grow items-center py-10 sm:py-14 lg:py-16">
        <Container className="relative z-10 w-full flex items-center">
          
          <div className="w-full lg:w-[85%] xl:w-[80%] shrink-0 lg:pr-8">
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-2.5 sm:mb-3 coaching-fade">
              <div className="h-[1.5px] w-7 bg-[#c9542f] origin-left" />
              <span 
                className="font-sans text-[0.78rem] sm:text-[0.84rem] uppercase tracking-[0.25em] font-bold text-[#c9542f]"
                style={{ fontSize: data.eyebrowFontSize ? `${data.eyebrowFontSize}px` : undefined }}
              >
                {data.eyebrowText || 'THE COACHING PROCESS'}
              </span>
            </div>

            <h2 
              className="font-serif text-[1.25rem] xs:text-[1.4rem] sm:text-2xl md:text-4xl lg:text-[3.2rem] xl:text-[3.8rem] font-medium tracking-tight leading-[1.25] gap-2 sm:gap-3 mb-8 sm:mb-10 lg:mb-12 flex flex-col items-start coaching-fade"
              style={{ 
                fontFamily: 'Fraunces, Georgia, serif',
                ...(data.headingFontSize ? { fontSize: `clamp(1.2rem, 4.5vw, ${data.headingFontSize}px)` } : {})
              }}
            >
              <span className="text-[#111010] block">{data.headingLine1 || 'A proven process'}</span>
              <span className="text-[#c9542f] not-italic font-medium block mt-0.5">{data.headingAccent || 'built around you.'}</span>
            </h2>

            <p 
              className="font-serif font-normal tracking-wide leading-snug mb-10 sm:mb-12 lg:mb-14 coaching-fade max-w-lg"
              style={{ 
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: data.descriptionFontSize ? `${data.descriptionFontSize}px` : undefined
              }}
            >
              <span className="italic text-[#111010] block text-[17px] lg:text-[1.18rem] leading-snug" style={{ fontSize: data.descriptionFontSize ? `${data.descriptionFontSize}px` : undefined }}>
                {data.subtitle || 'A clear path from where you are, to where you want to be.'}
              </span>
              <span className="font-serif font-normal not-italic text-[#7a756b] mt-1.5 inline-block text-[15px] lg:text-[1.02rem]" style={{ fontSize: data.descriptionFontSize ? `${data.descriptionFontSize}px` : undefined }}>
                {data.subnote || 'Simple. Effective.'}
              </span>
            </p>

            {/* Grid Stepper: 3 rows x 2 columns with 5th item spanning 2 cols wide & centered */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 lg:gap-4 max-w-xl lg:max-w-2xl">
              {steps.map((step, i) => {
                const Icon = ICONS[i % ICONS.length];
                const isActive = activeStep === i;
                const isWide = i === 4;
                return (
                  <div 
                    key={i} 
                    onClick={() => setActiveStep(isActive ? null : i)}
                    className={`coaching-step w-full ${
                      isWide ? 'col-span-1 md:col-span-2 justify-center' : 'col-span-1'
                    } relative z-50 flex ${isWide ? 'flex-col items-center justify-center text-center' : 'flex-row items-center gap-2.5 sm:gap-3'} group rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'bg-[#fbf0eb] border border-[#c9542f]/50 shadow-[0_4px_16px_rgba(201, 84, 47,0.12)]' 
                        : 'bg-white/90 border border-black/8 hover:bg-white hover:border-[#c9542f]/35 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                    }`}
                  >
                    {isWide ? (
                      <div className="flex flex-col items-center justify-center text-center w-full">
                        <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isActive 
                              ? 'border border-[#c9542f] bg-[#c9542f] text-white shadow-xs' 
                              : 'border border-black/10 bg-[#f5f1e8] text-[#111010] group-hover:border-[#c9542f]/40 group-hover:text-[#c9542f]'
                          }`}>
                            <Icon className="text-sm sm:text-base transition-transform duration-300 group-hover:scale-110" weight="regular" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans text-[0.64rem] tracking-widest font-bold text-[#c9542f]">{step.num || `0${i+1}`}</span>
                            <span className="font-sans text-[0.68rem] uppercase tracking-[0.16em] font-bold text-[#111010]">{step.title}</span>
                          </div>
                        </div>
                        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] group-hover:grid-rows-[1fr]'}`}>
                          <div className="overflow-hidden">
                            <p className={`text-[#4a463e] text-xs font-light leading-relaxed transition-opacity duration-300 delay-75 pt-1.5 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} text-center max-w-md mx-auto`}>
                              {step.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isActive 
                            ? 'border border-[#c9542f] bg-[#c9542f] text-white shadow-xs' 
                            : 'border border-black/10 bg-[#f5f1e8] text-[#111010] group-hover:border-[#c9542f]/40 group-hover:text-[#c9542f]'
                        }`}>
                          <Icon className="text-base transition-transform duration-300 group-hover:scale-110" weight="regular" />
                        </div>
                        <div className="flex flex-col flex-1 justify-center">
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans text-[0.64rem] tracking-widest font-bold text-[#c9542f]">{step.num || `0${i+1}`}</span>
                            <span className="font-sans text-[0.68rem] uppercase tracking-[0.16em] font-bold text-[#111010]">{step.title}</span>
                          </div>
                          <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] group-hover:grid-rows-[1fr]'}`}>
                            <div className="overflow-hidden">
                              <p className={`text-[#4a463e] text-xs font-light leading-relaxed transition-opacity duration-300 delay-75 pt-1 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {step.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </Container>
      </div>

    </section>
  );
}
