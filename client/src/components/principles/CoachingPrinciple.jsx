import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import defaultBgImg from '../../assets/Page6/ChatGPT Image Jul 24, 2026, 03_28_41 PM.webp';
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
        start: 'top 75%',
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
    <section ref={container} id="coaching" className="principle-panel relative w-full h-auto lg:h-screen min-h-screen flex flex-col overflow-hidden bg-black snap-start">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none block">
        <img 
          src={data.bgImg || defaultBgImg} 
          alt="Coaching Process"
          className="w-full h-full object-cover lg:object-contain opacity-30 lg:opacity-100 object-center lg:object-[80%_center]"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 75%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 75%, transparent 95%)'
          }}
        />
        {/* Global contrast overlay layer */}
        <div 
          className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300" 
          style={{ opacity: 'var(--overlay-opacity, 0.4)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 lg:via-black/40 to-black/40 lg:to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 lg:from-transparent via-transparent to-black" />
      </div>

      {/* Main Content Area */}
      <div className="relative flex-grow flex items-center py-20 lg:py-24">
        <Container className="relative z-10 w-full flex items-center">
          
          <div className="w-full lg:w-[85%] xl:w-[80%] shrink-0 lg:pr-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4 coaching-fade">
              <div className="h-[1px] w-8 bg-accent-gold origin-left" />
              <span className="font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.25em] font-semibold text-accent-gold">
                {data.eyebrowText || 'THE COACHING PROCESS'}
              </span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-[4rem] font-medium tracking-tight leading-[1.1] mb-2 flex flex-col items-start coaching-fade">
              <span className="text-white pb-1">{data.headingLine1 || 'A proven process'}</span>
              <span className="text-accent-gold italic font-light pb-1">{data.headingAccent || 'built around you.'}</span>
            </h2>

            <p className="text-white text-lg lg:text-xl font-serif font-light tracking-wide leading-relaxed mb-4 coaching-fade max-w-lg">
              <span className="italic text-xl lg:text-2xl">{data.subtitle || 'A clear path from where you are, to where you want to be.'}</span><br />
              <br />
              {data.subnote || 'Simple. Effective.'}
            </p>

            {/* Grid Stepper */}
            <div className="relative flex flex-wrap justify-center gap-x-6 gap-y-4 lg:gap-x-8 lg:gap-y-6 mt-4">
              {steps.map((step, i) => {
                const Icon = ICONS[i % ICONS.length];
                const isActive = activeStep === i;
                return (
                  <div 
                    key={i} 
                    onClick={() => setActiveStep(isActive ? null : i)}
                    className={`coaching-step w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.35rem)] relative z-50 flex gap-3 items-start group rounded-xl p-4 transition-all duration-500 cursor-pointer ${isActive ? 'bg-[#111111] border border-accent-gold/30' : 'bg-[#0a0a0a] border border-white/10 hover:bg-[#111111] hover:border-accent-gold/30'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 bg-black ${isActive ? 'border border-accent-gold bg-accent-gold/10' : 'border border-accent-gold/30 group-hover:border-accent-gold group-hover:bg-accent-gold/10'}`}>
                      <Icon className={`text-accent-gold text-lg transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} weight="regular" />
                    </div>
                    <div className="flex flex-col justify-center min-h-[40px]">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-[0.65rem] tracking-widest text-accent-gold">{step.num || `0${i+1}`}</span>
                        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-white">{step.title}</span>
                      </div>
                      <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] group-hover:grid-rows-[1fr]'}`}>
                        <div className="overflow-hidden">
                          <p className={`text-paragraph text-xs font-light leading-relaxed transition-opacity duration-500 delay-100 pt-2 ${isActive ? 'opacity-80' : 'opacity-0 group-hover:opacity-80'}`}>
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
