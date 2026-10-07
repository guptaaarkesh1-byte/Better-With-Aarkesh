import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import defaultBgImg from '../../assets/Page6/coaching-process.webp';
import { resolveImageUrl } from '../../utils/imageUrl';
import { 
  ChatTeardropText, 
  MagnifyingGlass, 
  Compass, 
  Flag, 
  ChartLineUp
} from '@phosphor-icons/react';

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
      
      {/* Background Image & Soft Blends */}
      <div className="absolute inset-0 z-0 pointer-events-none block overflow-hidden">
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
        
        {/* Soft edge blends */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f5f1e8] via-[#f5f1e8]/30 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#f5f1e8]/40 to-transparent" />
      </div>

      {/* Main Content Area */}
      <div className="relative flex-grow flex items-center py-10 sm:py-14 lg:py-16">
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
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-medium tracking-tight leading-[1.08] mb-3 sm:mb-4 flex flex-col items-start coaching-fade"
              style={{ 
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: data.headingFontSize ? `${data.headingFontSize}px` : undefined
              }}
            >
              <span className="text-[#111010] pb-0.5">{data.headingLine1 || 'A proven process'}</span>
              <span className="text-[#c9542f] not-italic font-medium pb-0.5">{data.headingAccent || 'built around you.'}</span>
            </h2>

            <p 
              className="font-serif font-normal tracking-wide leading-snug mb-4 sm:mb-5 coaching-fade max-w-lg"
              style={{ 
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: data.descriptionFontSize ? `${data.descriptionFontSize}px` : undefined
              }}
            >
              <span className="italic text-[#111010] block" style={{ fontSize: data.descriptionFontSize ? `${data.descriptionFontSize}px` : undefined }}>
                {data.subtitle?.includes('to where you want to be') ? (
                  <>
                    {data.subtitle.split('to where you want to be')[0].trim()}
                    <br />
                    to where you want to be.
                  </>
                ) : data.subtitle?.includes('you want to be') ? (
                  <>
                    {data.subtitle.split('you want to be')[0].trim()}
                    <br />
                    you want to be{data.subtitle.split('you want to be').slice(1).join('you want to be')}
                  </>
                ) : (
                  data.subtitle || (
                    <>
                      A clear path from where you are,<br />
                      to where you want to be.
                    </>
                  )
                )}
              </span>
              <span className="font-serif font-normal not-italic text-[#7a756b] mt-1.5 inline-block" style={{ fontSize: data.descriptionFontSize ? `${data.descriptionFontSize}px` : undefined }}>
                {data.subnote || 'Simple. Effective.'}
              </span>
            </p>

            {/* Grid Stepper: Compact & Responsive 3 rows x 2 columns with 5th item spanning 2 cols wide */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-3.5 max-w-xl lg:max-w-2xl">
              {steps.map((step, i) => {
                const Icon = ICONS[i % ICONS.length];
                const isActive = activeStep === i;
                const isWide = i === 4;
                return (
                  <div 
                    key={i} 
                    onClick={() => setActiveStep(isActive ? null : i)}
                    className={`coaching-step w-full ${
                      isWide ? 'col-span-1 md:col-span-2' : 'col-span-1'
                    } relative z-50 flex group rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'bg-[#fbf0eb] border border-[#c9542f]/50 shadow-[0_4px_16px_rgba(201, 84, 47,0.12)]' 
                        : 'bg-white/90 border border-black/8 hover:bg-white hover:border-[#c9542f]/35 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                    } ${isWide ? 'flex-col items-center justify-center' : 'flex-row gap-2.5 sm:gap-3 items-center'}`}
                  >
                    {isWide ? (
                      /* Point 5 Centered Layout */
                      <div className="w-full flex flex-col items-center justify-center text-center">
                        <div className="flex items-center justify-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isActive 
                              ? 'border border-[#c9542f] bg-[#c9542f] text-white shadow-xs' 
                              : 'border border-black/10 bg-[#f5f1e8] text-[#111010] group-hover:border-[#c9542f]/40 group-hover:text-[#c9542f]'
                          }`}>
                            <Icon className="text-base transition-transform duration-300 group-hover:scale-110" weight="regular" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans text-[0.64rem] tracking-widest font-bold text-[#c9542f]">{step.num || `0${i+1}`}</span>
                            <span className="font-sans text-[0.68rem] uppercase tracking-[0.16em] font-bold text-[#111010]">{step.title}</span>
                          </div>
                        </div>
                        <div className={`grid transition-[grid-template-rows] duration-300 ease-out w-full ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] group-hover:grid-rows-[1fr]'}`}>
                          <div className="overflow-hidden">
                            <p className={`text-[#4a463e] text-xs font-light leading-relaxed transition-opacity duration-300 delay-75 pt-1.5 text-center max-w-lg mx-auto ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              {step.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Points 1 - 4 Standard Layout */
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
