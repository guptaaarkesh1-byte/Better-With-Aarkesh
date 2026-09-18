import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import bgImg from '../../assets/Page6/ChatGPT Image Jul 24, 2026, 03_28_41 PM.png';
import { 
  ChatTeardropText, 
  MagnifyingGlass, 
  Compass, 
  Flag, 
  ChartLineUp
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

export default function CoachingPrinciple() {
  const container = useRef(null);
  const [activeStep, setActiveStep] = useState(null);

  const steps = [
    { num: '01', title: 'CONNECT', icon: ChatTeardropText, text: 'We start with a meaningful conversation to understand what matters to you.' },
    { num: '02', title: 'CLARIFY', icon: MagnifyingGlass, text: "We dig deep to bring clarity to your thoughts, patterns, and what's keeping you stuck." },
    { num: '03', title: 'ALIGN', icon: Compass, text: 'We align your values, goals, and actions with the life you truly want to create.' },
    { num: '04', title: 'ACT', icon: Flag, text: "You take intentional action with confidence. I'm here to guide, challenge, and support you." },
    { num: '05', title: 'EVOLVE', icon: ChartLineUp, text: 'We reflect, recalibrate, and keep building momentum for lasting transformation.' },
  ];

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
  }, { scope: container });

  return (
    <section ref={container} id="coaching" className="principle-panel relative w-full h-auto lg:h-screen min-h-screen flex flex-col overflow-hidden bg-black snap-start">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none block">
        <img 
          src={bgImg} 
          alt="Coaching Process"
          className="w-full h-full object-cover lg:object-contain opacity-30 lg:opacity-100 object-center lg:object-[80%_center]"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 75%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 75%, transparent 95%)'
          }}
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
              <span className="font-sans text-[0.65rem] uppercase tracking-[0.3em] font-medium text-accent-gold">
                THE COACHING PROCESS
              </span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-[4rem] font-medium tracking-tight leading-[1.1] mb-2 flex flex-col items-start coaching-fade">
              <span className="text-white pb-1">A proven process</span>
              <span className="text-accent-gold italic font-light pb-1">built around you.</span>
            </h2>

            <p className="text-white text-base lg:text-lg font-serif font-light tracking-wide leading-relaxed mb-4 coaching-fade max-w-md">
              <span className="italic text-lg">A clear path from where you are, to where you want to be.</span><br />
              <br />
              Simple. Effective.
            </p>

            {/* Grid Stepper (Converted to Flex for centering the last row) */}
            <div className="relative flex flex-wrap justify-center gap-x-6 gap-y-4 lg:gap-x-8 lg:gap-y-6 mt-4">
              {steps.map((step, i) => {
                const Icon = step.icon;
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
                        <span className="font-sans text-[0.65rem] tracking-widest text-accent-gold">{step.num}</span>
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
