  import { useRef, useState, useEffect } from 'react';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { useGSAP } from '@gsap/react';
  import Container from '../ui/Container';
  import defaultBgImg from '../../assets/Page6/coaching-process.webp';
  import { 
    ChatTeardropText, 
    MagnifyingGlass, 
    Compass, 
    Flag, 
    ChartLineUp
  } from '@phosphor-icons/react';

  gsap.registerPlugin(ScrollTrigger);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    bgImg: '',
    steps: [
      { num: '01', title: 'CONNECT', text: 'We start with a meaningful conversation to understand what matters to you.' },
      { num: '02', title: 'CLARIFY', text: "We dig deep to bring clarity to your thoughts, patterns, and what's keeping you stuck." },
      { num: '03', title: 'ALIGN', text: 'We align your values, goals, and actions with the life you truly want to create.' },
      { num: '04', title: 'ACT', text: "You take intentional action with confidence. I'm here to guide, challenge, and support you." },
      { num: '05', title: 'EVOLVE', text: 'We reflect, recalibrate, and keep building momentum for lasting transformation.' },
    ]
  };

  export default function CoachingPrinciple() {
    const container = useRef(null);
    const [activeStep, setActiveStep] = useState(null);
    const [data, setData] = useState(DEFAULT_COACHING_DATA);

    useEffect(() => {
      let isMounted = true;
      const fetchCoachingData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-settings/coachingProcess`);
        if (res.ok && isMounted) {
          const json = await res.json();
          setData(prev => ({
            ...prev,
            ...json,
            steps: json.steps && json.steps.length > 0 ? json.steps : prev.steps
          }));
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

  return (
    <section ref={container} id="coaching" className="principle-panel relative w-full h-auto lg:h-screen min-h-screen flex flex-col overflow-hidden bg-[#f5f1e8] snap-start">
      
      {/* Background Image & Soft Blends */}
      <div className="absolute inset-0 z-0 pointer-events-none block overflow-hidden">
        <img 
          src={data.bgImg || defaultBgImg} 
          alt="Coaching Process"
          className="w-full h-full object-cover opacity-100 will-change-transform"
          style={{
            objectPosition: `${DESKTOP_IMAGE_CONTROLS.posX} ${DESKTOP_IMAGE_CONTROLS.posY}`,
            transform: `scale(${DESKTOP_IMAGE_CONTROLS.zoom}) translate(${DESKTOP_IMAGE_CONTROLS.translateX}, ${DESKTOP_IMAGE_CONTROLS.translateY}) translateZ(0)`
          }}
        />
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
      <div className="relative flex-grow flex items-center py-20 lg:py-24">
        <Container className="relative z-10 w-full flex items-center">
          
          <div className="w-full lg:w-[85%] xl:w-[80%] shrink-0 lg:pr-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4 coaching-fade">
              <div className="h-[1.5px] w-8 bg-[#802673] origin-left" />
              <span className="font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.25em] font-bold text-[#802673]">
                {data.eyebrowText || 'THE COACHING PROCESS'}
              </span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-[4rem] font-medium tracking-tight leading-[1.08] mb-2 flex flex-col items-start coaching-fade">
              <span className="text-[#111010] pb-1">{data.headingLine1 || 'A proven process'}</span>
              <span className="text-[#802673] italic font-light pb-1">{data.headingAccent || 'built around you.'}</span>
            </h2>

            <p className="text-[#2b2723] text-lg lg:text-xl font-serif font-light tracking-wide leading-relaxed mb-6 coaching-fade max-w-lg">
              <span className="italic text-xl lg:text-2xl text-[#111010]">{data.subtitle || 'A clear path from where you are, to where you want to be.'}</span><br />
              <span className="text-[#555047] text-base">{data.subnote || 'Simple. Effective.'}</span>
            </p>

            {/* Grid Stepper */}
            <div className="relative flex flex-wrap justify-start gap-x-6 gap-y-4 lg:gap-x-8 lg:gap-y-6 mt-4">
              {steps.map((step, i) => {
                const Icon = ICONS[i % ICONS.length];
                const isActive = activeStep === i;
                return (
                  <div 
                    key={i} 
                    onClick={() => setActiveStep(isActive ? null : i)}
                    className={`coaching-step w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.35rem)] relative z-50 flex gap-3.5 items-start group rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'bg-[#f6eaf4] border border-[#802673]/50 shadow-[0_6px_24px_rgba(128, 38, 115,0.12)]' 
                        : 'bg-white/85 border border-black/8 hover:bg-white hover:border-[#802673]/35 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isActive 
                        ? 'border border-[#802673] bg-[#802673] text-white shadow-xs' 
                        : 'border border-black/10 bg-[#f5f1e8] text-[#111010] group-hover:border-[#802673]/40 group-hover:text-[#802673]'
                    }`}>
                      <Icon className="text-lg transition-transform duration-300 group-hover:scale-110" weight="regular" />
                    </div>
                    <div className="flex flex-col justify-center min-h-[40px] flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-[0.68rem] tracking-widest font-bold text-[#802673]">{step.num || `0${i+1}`}</span>
                        <span className="font-sans text-[0.72rem] uppercase tracking-[0.18em] font-bold text-[#111010]">{step.title}</span>
                      </div>
                      <div className={`grid transition-[grid-template-rows] duration-400 ease-out ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] group-hover:grid-rows-[1fr]'}`}>
                        <div className="overflow-hidden">
                          <p className={`text-[#4a463e] text-xs font-light leading-relaxed transition-opacity duration-400 delay-75 pt-2 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {step.text}
                          </p>
                        </div>
                      </div>
                    </div>
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
