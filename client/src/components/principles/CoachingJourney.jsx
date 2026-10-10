import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import { CDN_IMAGES } from '../../utils/cdnAssets';
import { resolveImageUrl } from '../../utils/imageUrl';
import { 
  Compass, 
  Heart, 
  GitFork, 
  Mountains,
  CalendarBlank,
  ChatTeardropText,
  ListDashes,
  TrendUp,
  Sparkle
} from '@phosphor-icons/react';

const defaultBgImg = CDN_IMAGES.COACHING_JOURNEY;

gsap.registerPlugin(ScrollTrigger);

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

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
// 📍 1. MOUNTAIN 4 POINTS KO EK SAATH MOVE KARNE KA OPTION (Right Side Nodes)
// Change moveX / moveY here to move ALL 4 mountain points together!
// =========================================================================
export const ALL_4_MOUNTAIN_POINTS_CONTROLS = {
  // ↔️ Left (-) ya Right (+) move karein: e.g. '-60px', '+40px', '-5%'
  moveX: '110px',

  // ↕️ Up (-) ya Down (+) move karein: e.g. '-40px', '+50px', '-3%'
  moveY: '40px',
};

// =========================================================================
// 📍 2. HEADING KE NEECHE WALE 4 POINTS (Left Side Step Buttons)
// Change moveX / moveY here to move the 4 left step cards together!
// =========================================================================
export const LEFT_4_STEPS_PILLS_CONTROLS = {
  // ↔️ Left (-) ya Right (+) move karein: e.g. '-30px', '+40px', '20px'
  moveX: '0px',

  // ↕️ Up (-) ya Down (+) move karein: e.g. '-20px', '+30px'
  moveY: '0px',
};

// =========================================================================
// 📍 3. MOUNTAIN KE HAR POINT KI INDIVIDUAL POSITIONS (All on Right Side)
// =========================================================================
export const DESKTOP_NODE_POSITIONS = [
  // 📍 Point 1: CLARIFYING
  { 
    name: '01 CLARIFYING',
    top: '65%',           // Base Up/Down
    left: '55%',          // Base Left/Right
    flip: false,          // Card text side (false = Right, true = Left)
    mobTop: '68%',
    mobLeft: '50%',
  },

  // 📍 Point 2: CONNECT
  { 
    name: '02 CONNECT',
    top: '48%',
    left: '55%',
    flip: false,
    mobTop: '50%',
    mobLeft: '50%',
  },

  // 📍 Point 3: CREATE
  { 
    name: '03 CREATE',
    top: '31%',
    left: '55%',
    flip: false,
    mobTop: '32%',
    mobLeft: '50%',
  },

  // 📍 Point 4: COMMIT
  { 
    name: '04 COMMIT',
    top: '14%',
    left: '55%',
    flip: false,
    mobTop: '14%',
    mobLeft: '50%',
  },
];

// =========================================================================
// 💬 FLOATING QUOTE POSITION CONTROLS (Desktop)
// =========================================================================
export const DESKTOP_QUOTE_CONTROLS = {
  bottom: '230px',      // ↕️ Position from bottom (e.g. '200px', '220px', '250px')
  right: '12%',          // ↔️ Position from right (e.g. '8%', '10%', '12%')
};

const DEFAULT_JOURNEY_DATA = {
  eyebrowText: 'THE COACHING JOURNEYS',
  headingLine1: 'A clear process.',
  headingAccent: 'Real transformation.',
  description: "We don't do hacks. We follow a proven, human first process designed to create deep, lasting change.",
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
  transitionSubtext: 'A process that adapts to you so you can create a life that lasts.'
};

const resolveJourneyImg = (url) => {
  if (!url) return defaultBgImg;
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';
  if (url.includes('localhost:5000/uploads/')) return url.replace('http://localhost:5000/uploads/', `${apiUrl}/uploads/`);
  if (url.startsWith('/uploads/')) return `${apiUrl}${url}`;
  return url;
};

const getInitialJourneyData = () => {
  try {
    const cached = localStorage.getItem('cached_coaching_journey');
    if (cached) {
      return { ...DEFAULT_JOURNEY_DATA, ...JSON.parse(cached) };
    }
  } catch (e) {}
  return DEFAULT_JOURNEY_DATA;
};

export default function CoachingJourney() {
  const container = useRef(null);
  const [data, setData] = useState(getInitialJourneyData);
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchJourneyData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-settings/coachingJourney`);
        if (res.ok && isMounted) {
          const json = await res.json();
          setData(prev => {
            const updated = {
              ...prev,
              ...json,
              steps: json.steps && json.steps.length > 0 ? json.steps : prev.steps,
              howItWorks: json.howItWorks && json.howItWorks.length > 0 ? json.howItWorks : prev.howItWorks
            };
            try {
              localStorage.setItem('cached_coaching_journey', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
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

  const resolvedJourneySrc = resolveImageUrl(data.bgImg, defaultBgImg);

  return (
    <section ref={container} id="coaching-journey" className="principle-panel relative w-full h-auto lg:h-screen min-h-screen flex flex-col overflow-hidden bg-[#f5f1e8] snap-start">
      
      {/* Background Image (Desktop Only) */}
      <div className="absolute inset-0 z-0 pointer-events-none pt-8 hidden lg:block overflow-hidden">
        {resolvedJourneySrc ? (
          <img 
            src={resolvedJourneySrc} 
            alt="The Coaching Journey"
            onLoad={() => setIsImgLoaded(true)}
            onError={(e) => {
              if (e.currentTarget.src !== defaultBgImg) {
                e.currentTarget.src = defaultBgImg;
              }
            }}
            className={`w-full h-full object-cover will-change-transform transition-opacity duration-700 ${
              isImgLoaded ? 'opacity-95' : 'opacity-0'
            }`}
            style={{
              objectPosition: `${DESKTOP_IMAGE_CONTROLS.posX} ${DESKTOP_IMAGE_CONTROLS.posY}`,
              transform: `scale(${DESKTOP_IMAGE_CONTROLS.zoom}) translate(${DESKTOP_IMAGE_CONTROLS.translateX}, ${DESKTOP_IMAGE_CONTROLS.translateY}) translateZ(0)`
            }}
          />
        ) : null}
        {/* Soft cream gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8] via-[#f5f1e8]/85 via-30% md:via-[#f5f1e8]/50 to-transparent w-[55%] md:w-[48%] z-10" />
        
        {/* Subtle Bottom edge blend */}
        <div className="absolute inset-x-0 bottom-0 h-16 lg:h-20 bg-gradient-to-t from-[#f5f1e8] to-transparent pointer-events-none z-10" />
        
        {/* Subtle Top edge blend */}
        <div className="absolute inset-x-0 top-0 h-12 lg:h-16 bg-gradient-to-b from-[#f5f1e8] to-transparent pointer-events-none z-10" />
      </div>

      {/* Main Content Area */}
      <div className="relative flex-grow flex items-start pt-14 sm:pt-16 lg:pt-14 xl:pt-18 pb-12 lg:pb-52">
        <Container className="relative z-10 w-full h-full">
          
          <div className="w-full lg:w-[55%] shrink-0 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-3 journey-fade">
              <div className="h-[1.5px] w-6 bg-[#c9542f] origin-left" />
              <span 
                className="font-sans text-[0.82rem] sm:text-[0.90rem] uppercase tracking-[0.25em] font-bold text-[#c9542f]"
                style={{ fontSize: data.eyebrowFontSize ? `${data.eyebrowFontSize}px` : undefined }}
              >
                {data.eyebrowText || 'THE COACHING JOURNEY'}
              </span>
            </div>

            <h2 
              className="font-serif text-[1.75rem] xs:text-[1.95rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] font-medium tracking-tight leading-[1.08] mb-5 sm:mb-6 flex flex-col items-start journey-fade max-w-full"
              style={{ 
                fontFamily: 'Fraunces, Georgia, serif',
                ...(data.headingFontSize ? { fontSize: `clamp(1.65rem, 6.5vw, ${data.headingFontSize}px)` } : {})
              }}
            >
              <span className="text-[#111010] pb-0.5">{data.headingLine1 || 'A clear process.'}</span>
              <span className="text-[#c9542f] not-italic font-medium pb-0.5">{data.headingAccent || 'Real transformation.'}</span>
            </h2>

            <p 
              className="font-serif text-base lg:text-lg text-[#4a463e] font-normal tracking-wide leading-relaxed mb-5 xl:mb-7 journey-fade max-w-lg"
              style={{ 
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: data.descriptionFontSize ? `${data.descriptionFontSize}px` : undefined
              }}
            >
              {(data.description || "We don't do hacks. We follow a proven, human first process designed to create deep, lasting change.").replace(/human-first/g, 'human first')}
            </p>

            {/* 4 Steps in 2 Columns Grid */}
            <div 
              className="grid grid-cols-2 gap-2 sm:gap-3.5 mt-3 xl:mt-4 journey-fade items-start w-full max-w-md lg:max-w-lg"
              style={{
                transform: `translate(${LEFT_4_STEPS_PILLS_CONTROLS.moveX || '0px'}, ${LEFT_4_STEPS_PILLS_CONTROLS.moveY || '0px'})`
              }}
            >
              {leftSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="w-full flex gap-2 sm:gap-3 items-center group cursor-pointer px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl transition-colors duration-200 bg-white/90 hover:bg-white border border-black/8 hover:border-[#c9542f]/30 shadow-xs">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#c9542f]/30 bg-[#fbf0eb] flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-[#c9542f] group-hover:bg-[#c9542f] group-hover:text-white shadow-xs">
                      <Icon className="text-[#c9542f] group-hover:text-white text-sm sm:text-lg transition-transform duration-200 group-hover:scale-110" weight="regular" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 pr-1 sm:pr-2">
                      <span className="font-sans text-[0.68rem] sm:text-[0.78rem] uppercase tracking-[0.14em] sm:tracking-[0.18em] font-bold text-[#111010] group-hover:text-[#c9542f] transition-colors block truncate">
                        {step.title}
                      </span>
                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                        <div className="overflow-hidden">
                          <p className="text-[#4a463e] text-[0.7rem] sm:text-xs font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-pre-line pt-1">
                            {step.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile View (Matches user's mobile prototype) */}
            <div className="block lg:hidden w-full mt-6">
              {/* Mountain Climb Figure */}
              <div 
                className="relative w-full aspect-[560/772] mt-4 overflow-hidden rounded-2xl"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 9%, #000 93%, transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, transparent 0%, #000 9%, #000 93%, transparent 100%)'
                }}
              >
                <img 
                  src={resolveJourneyImg(data.bgImg)} 
                  alt="The Coaching Journey"
                  onError={(e) => {
                    if (e.currentTarget.src !== defaultBgImg) {
                      e.currentTarget.src = defaultBgImg;
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-cover object-[72%_center]"
                />

                {/* 4 Stops along the path on mobile */}
                {/* 01 Clarifying */}
                <div className="absolute inset-x-0 top-[83.8%] h-0 pointer-events-auto">
                  <div className="absolute left-[28%] top-0 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-[rgba(255,251,244,0.94)] border border-white/95 text-[#c9542f] shadow-[0_0_0_6px_rgba(255,255,255,0.26),0_8px_20px_-6px_rgba(255,150,60,0.6)]">
                    <Compass size={20} weight="regular" />
                  </div>
                  <div className="absolute left-[35%] w-[58%] top-0 -translate-y-1/2 p-2.5 bg-[rgba(255,251,244,0.88)] backdrop-blur-md border border-white/90 rounded-2xl shadow-[0_10px_26px_-16px_rgba(120,70,20,0.5)]">
                    <h3 className="font-sans font-bold text-[11px] leading-tight tracking-[0.2em] uppercase text-[#1c1916]">
                      <i className="not-italic text-[#B3441F] mr-1.5">01</i>CLARIFYING
                    </h3>
                    <p className="font-sans font-medium text-[12.5px] leading-snug text-[#3b352e] mt-1">
                      Root cause clarity. Real understanding.
                    </p>
                  </div>
                </div>

                {/* 02 Connect */}
                <div className="absolute inset-x-0 top-[62.4%] h-0 pointer-events-auto">
                  <div className="absolute left-[28%] top-0 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-[rgba(255,251,244,0.94)] border border-white/95 text-[#c9542f] shadow-[0_0_0_6px_rgba(255,255,255,0.26),0_8px_20px_-6px_rgba(255,150,60,0.6)]">
                    <Heart size={20} weight="regular" />
                  </div>
                  <div className="absolute left-[35%] w-[58%] top-0 -translate-y-1/2 p-2.5 bg-[rgba(255,251,244,0.88)] backdrop-blur-md border border-white/90 rounded-2xl shadow-[0_10px_26px_-16px_rgba(120,70,20,0.5)]">
                    <h3 className="font-sans font-bold text-[11px] leading-tight tracking-[0.2em] uppercase text-[#1c1916]">
                      <i className="not-italic text-[#B3441F] mr-1.5">02</i>CONNECT
                    </h3>
                    <p className="font-sans font-medium text-[12.5px] leading-snug text-[#3b352e] mt-1">
                      Emotional honesty. Values alignment.
                    </p>
                  </div>
                </div>

                {/* 03 Create */}
                <div className="absolute inset-x-0 top-[41.1%] h-0 pointer-events-auto">
                  <div className="absolute left-[28%] top-0 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-[rgba(255,251,244,0.94)] border border-white/95 text-[#c9542f] shadow-[0_0_0_6px_rgba(255,255,255,0.26),0_8px_20px_-6px_rgba(255,150,60,0.6)]">
                    <GitFork size={20} weight="regular" />
                  </div>
                  <div className="absolute left-[35%] w-[58%] top-0 -translate-y-1/2 p-2.5 bg-[rgba(255,251,244,0.88)] backdrop-blur-md border border-white/90 rounded-2xl shadow-[0_10px_26px_-16px_rgba(120,70,20,0.5)]">
                    <h3 className="font-sans font-bold text-[11px] leading-tight tracking-[0.2em] uppercase text-[#1c1916]">
                      <i className="not-italic text-[#B3441F] mr-1.5">03</i>CREATE
                    </h3>
                    <p className="font-sans font-medium text-[12.5px] leading-snug text-[#3b352e] mt-1">
                      Aligned decisions. Intentional life.
                    </p>
                  </div>
                </div>

                {/* 04 Commit */}
                <div className="absolute inset-x-0 top-[19.6%] h-0 pointer-events-auto">
                  <div className="absolute left-[28%] top-0 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-[rgba(255,251,244,0.94)] border border-white/95 text-[#c9542f] shadow-[0_0_0_6px_rgba(255,255,255,0.26),0_8px_20px_-6px_rgba(255,150,60,0.6)]">
                    <Mountains size={20} weight="regular" />
                  </div>
                  <div className="absolute left-[35%] w-[58%] top-0 -translate-y-1/2 p-2.5 bg-[rgba(255,251,244,0.88)] backdrop-blur-md border border-white/90 rounded-2xl shadow-[0_10px_26px_-16px_rgba(120,70,20,0.5)]">
                    <h3 className="font-sans font-bold text-[11px] leading-tight tracking-[0.2em] uppercase text-[#1c1916]">
                      <i className="not-italic text-[#B3441F] mr-1.5">04</i>COMMIT
                    </h3>
                    <p className="font-sans font-medium text-[12.5px] leading-snug text-[#3b352e] mt-1">
                      Sustained action. Lasting change.
                    </p>
                  </div>
                </div>
              </div>

              {/* HOW IT WORKS Container for Mobile */}
              <div className="mt-6 bg-[#EDE5D6] rounded-[22px] p-5">
                <p className="flex items-center gap-3 font-sans font-semibold text-[11.5px] leading-snug tracking-[0.24em] uppercase text-[#B3441F] mb-4 before:content-[''] before:w-7 before:h-[1.5px] before:bg-[#c9542f] before:flex-shrink-0">
                  HOW IT WORKS
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 font-sans text-sm leading-snug text-[#2d2923]">
                    <CalendarBlank size={22} className="text-[#B3441F]" weight="regular" />
                    <span>Personalized coaching sessions tailored to you.</span>
                  </div>
                  <div className="flex flex-col gap-2 font-sans text-sm leading-snug text-[#2d2923]">
                    <ChatTeardropText size={22} className="text-[#B3441F]" weight="regular" />
                    <span>Powerful conversations that create real shifts.</span>
                  </div>
                  <div className="flex flex-col gap-2 font-sans text-sm leading-snug text-[#2d2923]">
                    <ListDashes size={22} className="text-[#B3441F]" weight="regular" />
                    <span>Practical tools and frameworks you can use.</span>
                  </div>
                  <div className="flex flex-col gap-2 font-sans text-sm leading-snug text-[#2d2923]">
                    <TrendUp size={22} className="text-[#B3441F]" weight="regular" />
                    <span>Accountability that keeps you moving forward.</span>
                  </div>
                </div>
              </div>

              {/* Guided Footer */}
              <p className="flex items-center gap-2.5 mt-5 font-serif italic font-medium text-[19px] leading-snug text-[#B3441F]">
                <Sparkle size={22} weight="fill" className="shrink-0" />
                <span>Guided. Structured. Flexible.</span>
              </p>
            </div>
          </div>

        </Container>
      </div>

      {/* 📍 ALL 4 MOUNTAIN POINTS CONTAINER (Desktop) - Controlled by ALL_4_MOUNTAIN_POINTS_CONTROLS */}
      <div 
        className="hidden lg:block absolute inset-0 pointer-events-none z-20"
        style={{
          transform: `translate(${ALL_4_MOUNTAIN_POINTS_CONTROLS.moveX || '0px'}, ${ALL_4_MOUNTAIN_POINTS_CONTROLS.moveY || '0px'})`
        }}
      >
        {floatingNodes.map((node, i) => {
          const Icon = node.icon;
          return (
            <div 
              key={i} 
              className="absolute flex items-center journey-node group cursor-pointer pointer-events-auto"
              style={{ 
                top: node.top, 
                left: node.left,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Crisp Node Icon (Zero-lag hardware rendered, centered on the straight vertical axis) */}
              <div className="w-11 h-11 rounded-full border border-[#c9542f]/40 bg-white/70 flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all duration-200 group-hover:scale-110 group-hover:border-[#c9542f] group-hover:bg-white/90 z-10">
                <Icon className="text-[#c9542f] text-lg" weight="regular" />
              </div>

              {/* Pure Translucent Text Card (Zero blur, clear glass) */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 w-max select-none bg-white/35 border border-white/70 rounded-2xl px-4 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] group-hover:bg-white/55 group-hover:border-[#c9542f]/40 transition-all duration-200 ${
                  node.flip 
                    ? 'right-[calc(100%+0.75rem)] text-right' 
                    : 'left-[calc(100%+0.75rem)] text-left'
                }`}
              >
                <div className={`flex items-center gap-2 mb-0.5 ${node.flip ? 'justify-end' : 'justify-start'}`}>
                  {node.flip ? (
                    <>
                      <span className="font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.2em] font-extrabold text-[#111010]">{node.title}</span>
                      <span className="font-sans text-xs sm:text-[0.82rem] tracking-widest font-extrabold text-[#c9542f]">{node.num}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-sans text-xs sm:text-[0.82rem] tracking-widest font-extrabold text-[#c9542f]">{node.num}</span>
                      <span className="font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.2em] font-extrabold text-[#111010]">{node.title}</span>
                    </>
                  )}
                </div>
                <p className={`text-[#2b2723] text-xs sm:text-[0.84rem] font-semibold leading-snug whitespace-pre-line ${node.flip ? 'text-right' : 'text-left'}`}>
                  {node.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>



      {/* Bottom Banners */}
      <div className="absolute bottom-0 left-0 w-full z-40 journey-bottom hidden xl:block">
        
        {/* HOW IT WORKS Row */}
        <div className="w-full bg-[#ede7d8] border-t border-black/8 shadow-xs">
          <Container className="pr-44 xl:pr-56 py-2.5 sm:py-3 flex items-center justify-start">
            
            <div className="font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.25em] font-bold text-[#c9542f] pr-6 lg:pr-8 shrink-0">
              HOW IT WORKS
            </div>

            <div className="flex items-center gap-4 md:gap-6 lg:gap-8 flex-grow justify-between pl-6 lg:pl-8 border-l border-black/10">
              <div className="flex items-center gap-2.5 sm:gap-3 group">
                <CalendarBlank className="text-[#c9542f] text-xl lg:text-[1.3rem] group-hover:scale-110 transition-transform shrink-0" weight="light" />
                <p className="text-[#2b2723] text-xs md:text-[13px] font-light max-w-[170px] leading-snug">
                  {howItWorks[0] || 'Personalized coaching sessions tailored to you.'}
                </p>
              </div>
              
              <div className="hidden md:block text-black/25 text-lg font-light">›</div>

              <div className="flex items-center gap-2.5 sm:gap-3 group">
                <ChatTeardropText className="text-[#c9542f] text-xl lg:text-[1.3rem] group-hover:scale-110 transition-transform shrink-0" weight="light" />
                <p className="text-[#2b2723] text-xs md:text-[13px] font-light max-w-[170px] leading-snug">
                  {howItWorks[1] || 'Powerful conversations that create real shifts.'}
                </p>
              </div>

              <div className="hidden md:block text-black/25 text-lg font-light">›</div>

              <div className="flex items-center gap-2.5 sm:gap-3 group">
                <ListDashes className="text-[#c9542f] text-xl lg:text-[1.3rem] group-hover:scale-110 transition-transform shrink-0" weight="light" />
                <p className="text-[#2b2723] text-xs md:text-[13px] font-light max-w-[170px] leading-snug">
                  {howItWorks[2] || 'Practical tools and frameworks you can use.'}
                </p>
              </div>

              <div className="hidden md:block text-black/25 text-lg font-light">›</div>

              <div className="flex items-center gap-2.5 sm:gap-3 group">
                <TrendUp className="text-[#c9542f] text-xl lg:text-[1.3rem] group-hover:scale-110 transition-transform shrink-0" weight="light" />
                <p className="text-[#2b2723] text-xs md:text-[13px] font-light max-w-[170px] leading-snug">
                  {howItWorks[3] || 'Accountability that keeps you moving forward.'}
                </p>
              </div>
            </div>

          </Container>
        </div>

        {/* Transition Row */}
        <div className="w-full bg-[#f5f1e8] border-t border-black/8">
          <Container className="pr-44 xl:pr-56 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-start gap-4">
            
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#c9542f]/40 flex items-center justify-center shrink-0 bg-[#fbf0eb]">
                <Sparkle className="text-[#c9542f] text-lg" weight="fill" />
              </div>
              <p className="flex flex-wrap items-baseline gap-x-2 text-xs md:text-sm leading-snug">
                <span className="font-serif text-[#c9542f] text-sm lg:text-[1.05rem] not-italic font-medium">
                  {((data.transitionAccent || 'Guided. Structured. Flexible.').replace(/[.:\s]+$/, ''))}:
                </span>
                <span className="text-[#4a463e] font-light">
                  {(data.transitionSubtext || 'A process that adapts to you so you can create a life that lasts.').replace(/—|--/g, ' ')}
                </span>
              </p>
            </div>

          </Container>
        </div>

      </div>

    </section>
  );
}
