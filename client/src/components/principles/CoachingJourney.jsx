import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import defaultBgImg from '../../assets/Page7/coaching-journey.webp';
import { 
  Compass, 
  Heart, 
  GitFork, 
  Mountains,
  CalendarBlank,
  ChatTeardropText,
  ListDashes,
  TrendUp,
  Sparkle,
  ArrowDown
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ICONS = [Compass, Heart, GitFork, Mountains];

// =========================================================================
// 🎛️ DESKTOP IMAGE ZOOM & POSITION CONTROLS (Adjust values directly here!)
// =========================================================================
export const DESKTOP_IMAGE_CONTROLS = {
  zoom: 1.30,             // 🔍 Zoom / Scale: 1.0 (100%), 1.08 (108%), 1.15 (115%), 1.25 (125%)
  posX: '8%',            // ↔️ Horizontal Position: '0%' (Left), '50%' (Center), '78%' (Right), '100%' (Far Right)
  posY: '35%',            // ↕️ Vertical Position: '0%' (Top), '35%' (Upper Center), '50%' (Center)
  translateX: '-200px',      // 🎯 Fine-tune Left/Right pixel nudge: e.g. '+20px', '-40px'
  translateY: '0px',      // 🎯 Fine-tune Up/Down pixel nudge: e.g. '+15px', '-20px'
};

// =========================================================================
// 📍 4 MOUNTAIN JOURNEY NODES POSITION CONTROLS (Desktop)
// =========================================================================
export const DESKTOP_NODE_POSITIONS = [
  { top: '60%', left: '56%', mobTop: '68%', mobLeft: '50%', flip: false }, // Node 01: Clarifying
  { top: '40%', left: '46%', mobTop: '48%', mobLeft: '24%', flip: true },  // Node 02: Connect
  { top: '25%', left: '54%', mobTop: '32%', mobLeft: '28%', flip: true },  // Node 03: Create
  { top: '10%', left: '68%', mobTop: '18%', mobLeft: '78%', flip: false }, // Node 04: Commit
];

const DEFAULT_JOURNEY_DATA = {
  eyebrowText: 'THE COACHING JOURNEYS',
  headingLine1: 'A clear process.',
  headingAccent: 'Real transformation.',
  description: "We don't do hacks. We follow a proven, human-first process designed to create deep, lasting change.",
  quoteLine1: "Transformation isn't a moment.",
  quoteAccent: "It's a journey you walk with the right guide.",
  bgImg: '',
  steps: [
    { num: '01', title: 'CLARIFYING', text: "Root cause clarity.\nReal understanding." },
    { num: '02', title: 'CONNECT', text: "Emotional honesty.\nValues alignment." },
    { num: '03', title: 'CREATE', text: "Aligned decisions.\nIntentional life." },
    { num: '04', title: 'COMMIT', text: "Sustained action.\nLasting change." }
  ],
  howItWorks: [
    'Personalized coaching sessions tailored to you.',
    'Powerful conversations that create real shifts.',
    'Practical tools and frameworks you can use.',
    'Accountability that keeps you moving forward.'
  ],
  transitionAccent: 'Guided. Structured. Flexible.',
  transitionSubtext: 'A process that adapts to you—so you can create a life that lasts.'
};

export default function CoachingJourney() {
  const container = useRef(null);
  const [data, setData] = useState(DEFAULT_JOURNEY_DATA);

  useEffect(() => {
    let isMounted = true;
    const fetchJourneyData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-settings/coachingJourney`);
        if (res.ok && isMounted) {
          const json = await res.json();
          setData(prev => ({
            ...prev,
            ...json,
            steps: json.steps && json.steps.length > 0 ? json.steps : prev.steps,
            howItWorks: json.howItWorks && json.howItWorks.length > 0 ? json.howItWorks : prev.howItWorks
          }));
        }
      } catch (err) {
        console.error('Failed to load coaching journey settings:', err);
      }
    };
    fetchJourneyData();
    return () => { isMounted = false; };
  }, []);

  const rawSteps = data.steps || DEFAULT_JOURNEY_DATA.steps;

  const leftSteps = rawSteps.map((step, idx) => ({
    title: step.title,
    icon: ICONS[idx % ICONS.length],
    text: step.text
  }));

  const floatingNodes = rawSteps.map((step, idx) => {
    const pos = DESKTOP_NODE_POSITIONS[idx] || { top: '50%', left: '50%', mobTop: '50%', mobLeft: '50%', flip: false };
    return {
      num: step.num || `0${idx + 1}`,
      title: step.title,
      icon: ICONS[idx % ICONS.length],
      text: step.text,
      ...pos
    };
  });

  const howItWorks = data.howItWorks || DEFAULT_JOURNEY_DATA.howItWorks;

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true,
      }
    });

    tl.fromTo('.journey-fade',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }
    )
    .fromTo('.journey-node',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.2 },
      "-=0.4"
    )
    .fromTo('.journey-quote',
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.2"
    )
    .fromTo('.journey-bottom',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.4"
    );
  }, { scope: container, dependencies: [data] });

  return (
    <section ref={container} id="coaching-journey" className="principle-panel relative w-full h-auto lg:h-screen min-h-screen flex flex-col overflow-hidden bg-[#f5f1e8] snap-start">
      
      {/* Background Image (Desktop Only) */}
      <div className="absolute inset-0 z-0 pointer-events-none pt-8 hidden lg:block overflow-hidden">
        <img 
          src={data.bgImg || defaultBgImg} 
          alt="The Coaching Journey"
          className="w-full h-full object-cover opacity-95 will-change-transform"
          style={{
            objectPosition: `${DESKTOP_IMAGE_CONTROLS.posX} ${DESKTOP_IMAGE_CONTROLS.posY}`,
            transform: `scale(${DESKTOP_IMAGE_CONTROLS.zoom}) translate(${DESKTOP_IMAGE_CONTROLS.translateX}, ${DESKTOP_IMAGE_CONTROLS.translateY}) translateZ(0)`
          }}
        />
        {/* Soft cream gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8] via-[#f5f1e8]/85 via-30% md:via-[#f5f1e8]/50 to-transparent w-[55%] md:w-[48%] z-10" />
        
        {/* Right-to-left solid cream fade to eliminate sharp edge */}
        <div className="absolute inset-y-0 right-0 w-44 sm:w-60 lg:w-96 bg-gradient-to-l from-[#f5f1e8] via-[#f5f1e8]/95 via-25% md:via-[#f5f1e8]/60 to-transparent pointer-events-none z-10" />
        
        {/* Bottom edge blend */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f5f1e8] via-[#f5f1e8]/60 to-transparent pointer-events-none z-10" />
        
        {/* Top edge blend */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#f5f1e8]/40 to-transparent pointer-events-none z-10" />
      </div>

      {/* Main Content Area */}
      <div className="relative flex-grow flex items-start pt-14 sm:pt-16 lg:pt-14 xl:pt-18 pb-12 lg:pb-52">
        <Container className="relative z-10 w-full h-full">
          
          <div className="w-full lg:w-[55%] shrink-0 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-3 journey-fade">
              <div className="h-[1.5px] w-6 bg-[#802673] origin-left" />
              <span className="font-sans text-[0.68rem] uppercase tracking-[0.25em] font-bold text-[#802673]">
                {data.eyebrowText || 'THE COACHING JOURNEY'}
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.5rem] xl:text-[3.2rem] font-medium tracking-tight leading-[1.08] mb-2 xl:mb-3 flex flex-col items-start journey-fade">
              <span className="text-[#111010] pb-0.5">{data.headingLine1 || 'A clear process.'}</span>
              <span className="text-[#802673] italic font-light pb-0.5">{data.headingAccent || 'Real transformation.'}</span>
            </h2>

            <p className="text-[#2b2723] text-lg lg:text-xl font-serif font-light tracking-wide leading-relaxed mb-4 xl:mb-6 journey-fade max-w-xl">
              {data.description || "We don't do hacks. We follow a proven, human-first process designed to create deep, lasting change."}
            </p>

            {/* Vertical Steps (2 columns, content-fit width) */}
            <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 mt-3 xl:mt-4 journey-fade items-start">
              {/* Left Column: Clarify & Connect */}
              <div className="flex flex-col gap-y-3 items-start">
                {leftSteps.slice(0, 2).map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="w-fit flex gap-3 items-center group cursor-pointer px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl transition-colors duration-200 bg-white/90 hover:bg-white border border-black/8 hover:border-[#802673]/30 shadow-xs">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#802673]/30 bg-[#f6eaf4] flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-[#802673] group-hover:bg-[#802673] group-hover:text-white shadow-xs">
                        <Icon className="text-[#802673] group-hover:text-white text-base sm:text-lg transition-transform duration-200 group-hover:scale-110" weight="regular" />
                      </div>
                      <div className="flex flex-col justify-center pr-2">
                        <span className="font-sans text-[0.72rem] sm:text-[0.78rem] uppercase tracking-[0.18em] font-bold text-[#111010] group-hover:text-[#802673] transition-colors block whitespace-nowrap">
                          {step.title}
                        </span>
                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                          <div className="overflow-hidden">
                            <p className="text-[#4a463e] text-xs font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-pre-line pt-1">
                              {step.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Create & Commit */}
              <div className="flex flex-col gap-y-3 items-start">
                {leftSteps.slice(2, 4).map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="w-fit flex gap-3 items-center group cursor-pointer px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl transition-colors duration-200 bg-white/90 hover:bg-white border border-black/8 hover:border-[#802673]/30 shadow-xs">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#802673]/30 bg-[#f6eaf4] flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-[#802673] group-hover:bg-[#802673] group-hover:text-white shadow-xs">
                        <Icon className="text-[#802673] group-hover:text-white text-base sm:text-lg transition-transform duration-200 group-hover:scale-110" weight="regular" />
                      </div>
                      <div className="flex flex-col justify-center pr-2">
                        <span className="font-sans text-[0.72rem] sm:text-[0.78rem] uppercase tracking-[0.18em] font-bold text-[#111010] group-hover:text-[#802673] transition-colors block whitespace-nowrap">
                          {step.title}
                        </span>
                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                          <div className="overflow-hidden">
                            <p className="text-[#4a463e] text-xs font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-pre-line pt-1">
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

            {/* Mobile Image (Visible below points on mobile) */}
            <div className="block lg:hidden w-[calc(100%+2rem)] -ml-4 mt-12 relative flex justify-center pointer-events-auto">
              <img 
                src={data.bgImg || defaultBgImg} 
                alt="The Coaching Journey"
                className="w-full min-h-[85vh] object-cover opacity-60 object-[75%_top]"
                style={{
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
                }}
              />
              
              {/* Floating Nodes for Mobile */}
              {floatingNodes.map((node, i) => {
                const Icon = node.icon;
                return (
                  <div 
                    key={`mob-${i}`} 
                    className={`absolute flex items-center gap-2 z-20 group cursor-pointer ${node.flip ? 'flex-row-reverse' : ''} scale-[0.82] sm:scale-100 origin-center`}
                    style={{ 
                      top: node.mobTop, 
                      left: node.mobLeft,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="w-10 h-10 rounded-full border border-[#802673]/40 bg-white/95 shadow-md flex items-center justify-center shrink-0">
                      <Icon className="text-[#802673] text-lg" weight="regular" />
                    </div>
                    <div className="w-max select-none">
                      <div className={`flex items-center gap-1.5 mb-0.5 ${node.flip ? 'justify-end' : ''}`}>
                        {node.flip ? (
                          <>
                            <span className="font-sans text-[0.75rem] uppercase tracking-[0.18em] font-extrabold text-[#111010]">{node.title}</span>
                            <span className="font-sans text-[0.75rem] tracking-widest font-extrabold text-[#802673]">{node.num}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-sans text-[0.75rem] tracking-widest font-extrabold text-[#802673]">{node.num}</span>
                            <span className="font-sans text-[0.75rem] uppercase tracking-[0.18em] font-extrabold text-[#111010]">{node.title}</span>
                          </>
                        )}
                      </div>
                      <p className={`text-[#2b2723] text-[0.72rem] font-medium leading-tight whitespace-pre-line ${node.flip ? 'text-right' : ''}`}>
                        {node.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </Container>
      </div>

      {/* Floating Nodes (Desktop) */}
      {floatingNodes.map((node, i) => {
        const Icon = node.icon;
        return (
          <div 
            key={i} 
            className={`hidden lg:flex absolute items-center gap-3 journey-node z-20 group cursor-pointer ${node.flip ? 'flex-row-reverse' : ''}`}
            style={{ top: node.top, left: node.left }}
          >
            {/* Crisp Node Icon (Zero-lag hardware rendered) */}
            <div className="w-11 h-11 rounded-full border border-[#802673]/40 bg-white/95 flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-transform duration-200 group-hover:scale-110 group-hover:border-[#802673] group-hover:bg-white">
              <Icon className="text-[#802673] text-lg" weight="regular" />
            </div>

            {/* Crisp Text Content (No Background) */}
            <div className="w-max select-none">
              <div className={`flex items-center gap-2 mb-0.5 ${node.flip ? 'justify-end' : ''}`}>
                {node.flip ? (
                  <>
                    <span className="font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.2em] font-extrabold text-[#111010]">{node.title}</span>
                    <span className="font-sans text-xs sm:text-[0.82rem] tracking-widest font-extrabold text-[#802673]">{node.num}</span>
                  </>
                ) : (
                  <>
                    <span className="font-sans text-xs sm:text-[0.82rem] tracking-widest font-extrabold text-[#802673]">{node.num}</span>
                    <span className="font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.2em] font-extrabold text-[#111010]">{node.title}</span>
                  </>
                )}
              </div>
              <p className={`text-[#2b2723] text-xs sm:text-[0.84rem] font-semibold leading-snug whitespace-pre-line ${node.flip ? 'text-right' : ''}`}>
                {node.text}
              </p>
            </div>
          </div>
        );
      })}

      {/* Floating Quote */}
      <div className="hidden lg:block absolute bottom-[190px] xl:bottom-[210px] right-24 xl:right-32 max-w-[310px] journey-quote z-20 select-none">
        {/* Soft gradient ambient backdrop - zero cost GPU rendering */}
        <div 
          className="absolute -inset-10 pointer-events-none -z-10 rounded-full" 
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 50%, transparent 75%)' }}
        />
        <span className="font-serif text-5xl text-[#802673] leading-none block mb-2 font-normal">“</span>
        <p className="font-serif text-2xl xl:text-[1.95rem] text-[#111010] font-semibold mb-2 leading-snug">
          {data.quoteLine1 || "Transformation isn't a moment."}
        </p>
        <p className="font-serif text-2xl xl:text-[1.95rem] text-[#802673] italic font-medium leading-snug">
          {data.quoteAccent || "It's a journey you walk with the right guide."}
        </p>
      </div>

      {/* Bottom Banners */}
      <div className="absolute bottom-0 left-0 w-full z-40 journey-bottom hidden xl:block">
        
        {/* HOW IT WORKS Row */}
        <div className="w-full bg-[#ede7d8] border-t border-black/8 shadow-xs">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-5 sm:py-6 flex items-center justify-between">
            
            <div className="font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.25em] font-bold text-[#802673] pr-8 shrink-0">
              HOW IT WORKS
            </div>

            <div className="flex items-center gap-6 md:gap-10 lg:gap-12 flex-grow justify-between pl-8 border-l border-black/10">
              <div className="flex items-center gap-3.5 sm:gap-4 group">
                <CalendarBlank className="text-[#802673] text-2xl lg:text-[1.75rem] group-hover:scale-110 transition-transform shrink-0" weight="light" />
                <p className="text-[#2b2723] text-sm md:text-[0.92rem] font-light max-w-[190px] leading-snug">
                  {howItWorks[0] || 'Personalized coaching sessions tailored to you.'}
                </p>
              </div>
              
              <div className="hidden md:block text-black/25 text-2xl font-light">›</div>

              <div className="flex items-center gap-3.5 sm:gap-4 group">
                <ChatTeardropText className="text-[#802673] text-2xl lg:text-[1.75rem] group-hover:scale-110 transition-transform shrink-0" weight="light" />
                <p className="text-[#2b2723] text-sm md:text-[0.92rem] font-light max-w-[190px] leading-snug">
                  {howItWorks[1] || 'Powerful conversations that create real shifts.'}
                </p>
              </div>

              <div className="hidden md:block text-black/25 text-2xl font-light">›</div>

              <div className="flex items-center gap-3.5 sm:gap-4 group">
                <ListDashes className="text-[#802673] text-2xl lg:text-[1.75rem] group-hover:scale-110 transition-transform shrink-0" weight="light" />
                <p className="text-[#2b2723] text-sm md:text-[0.92rem] font-light max-w-[190px] leading-snug">
                  {howItWorks[2] || 'Practical tools and frameworks you can use.'}
                </p>
              </div>

              <div className="hidden md:block text-black/25 text-2xl font-light">›</div>

              <div className="flex items-center gap-3.5 sm:gap-4 group">
                <TrendUp className="text-[#802673] text-2xl lg:text-[1.75rem] group-hover:scale-110 transition-transform shrink-0" weight="light" />
                <p className="text-[#2b2723] text-sm md:text-[0.92rem] font-light max-w-[190px] leading-snug">
                  {howItWorks[3] || 'Accountability that keeps you moving forward.'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Transition Row */}
        <div className="w-full bg-[#f5f1e8] border-t border-black/8">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="w-11 h-11 rounded-full border border-[#802673]/40 flex items-center justify-center shrink-0 bg-[#f6eaf4]">
                <Sparkle className="text-[#802673] text-2xl" weight="fill" />
              </div>
              <div>
                <p className="font-serif text-[#802673] text-xl lg:text-[1.35rem] mb-0.5 italic font-medium">{data.transitionAccent || 'Guided. Structured. Flexible.'}</p>
                <p className="text-[#4a463e] text-sm md:text-[0.92rem] font-light leading-snug">
                  {data.transitionSubtext || 'A process that adapts to you—so you can create a life that lasts.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="w-10 h-10 rounded-full border border-black/20 bg-white flex items-center justify-center transition-all group-hover:border-[#802673] group-hover:bg-[#f6eaf4] group-hover:scale-105 shadow-xs">
                <ArrowDown className="text-[#111010] text-base transition-transform group-hover:text-[#802673] group-hover:translate-y-1" />
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}
