import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import bgImg from '../../assets/Page7/ChatGPT Image Jul 24, 2026, 03_42_25 PM.png';
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

export default function CoachingJourney() {
  const container = useRef(null);

  const leftSteps = [
    { title: 'CLARIFY', icon: Compass, text: "We get to the root.\nYou gain real clarity about what's holding you back." },
    { title: 'CONNECT', icon: Heart, text: "We go beneath the surface.\nYou reconnect with what you feel, value, and truly want." },
    { title: 'CREATE', icon: GitFork, text: "We design with intention.\nYou make aligned decisions and build a life that fits you." },
    { title: 'COMMIT', icon: Mountains, text: "We turn insight into action.\nYou build momentum and become the person you choose to be." },
  ];

  // ==========================================
  // 🛠️ FLOATING NODES CONFIGURATION
  // Use `top` and `left` to move the nodes on DESKTOP
  // Use `mobTop` and `mobLeft` to move the nodes on MOBILE
  // ==========================================
  const floatingNodes = [
    { 
      num: '01', title: 'CLARIFY', icon: Compass, text: 'Root cause clarity.\nReal understanding.', 
      top: '60%', left: '58%', 
      mobTop: '70%', mobLeft: '50%' 
    },
    { 
      num: '02', title: 'CONNECT', icon: Heart, text: 'Emotional honesty.\nValues alignment.', 
      top: '44%', left: '51%', flip: true,
      mobTop: '44%', mobLeft: '23%'
    },
    { 
      num: '03', title: 'CREATE', icon: GitFork, text: 'Aligned decisions.\nIntentional life.', 
      top: '30%', left: '57%', flip: true,
      mobTop: '30%', mobLeft: '27%'
    },
    { 
      num: '04', title: 'COMMIT', icon: Mountains, text: 'Sustained action.\nLasting change.', 
      top: '24%', left: '71%', 
      mobTop: '18%', mobLeft: '78%'
    },
  ];

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 75%',
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
  }, { scope: container });

  return (
    <section ref={container} id="coaching-journey" className="principle-panel relative w-full h-auto lg:h-screen min-h-screen flex flex-col overflow-hidden bg-black snap-start">
      
      {/* Background Image (Desktop Only) */}
      <div className="absolute inset-0 z-0 pointer-events-none pt-8 hidden lg:block">
        <img 
          src={bgImg} 
          alt="The Coaching Journey"
          className="w-full h-full object-cover opacity-90 object-[75%_top]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-black/60 to-transparent w-[50%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
      </div>

      {/* Main Content Area */}
      <div className="relative flex-grow flex items-start pt-24 pb-12 lg:pb-48">
        <Container className="relative z-10 w-full h-full">
          
          <div className="w-full lg:w-[55%] shrink-0 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4 journey-fade">
              <div className="h-[1px] w-6 bg-accent-gold origin-left" />
              <span className="font-sans text-[0.65rem] uppercase tracking-[0.3em] font-medium text-accent-gold">
                THE COACHING JOURNEY
              </span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] font-medium tracking-tight leading-[1.1] mb-4 flex flex-col items-start journey-fade">
              <span className="text-white pb-1">A clear process.</span>
              <span className="text-accent-gold italic font-light pb-1">Real transformation.</span>
            </h2>

            <p className="text-paragraph text-sm lg:text-base font-light tracking-wide leading-relaxed mb-10 journey-fade max-w-md">
              We don't do hacks. We follow a proven, human-first process designed to create deep, lasting change.
            </p>

            {/* Vertical Steps (2 columns) */}
            <div className="flex gap-x-12 mt-4 journey-fade">
              {/* Left Column: Clarify & Connect */}
              <div className="flex flex-col gap-y-5 flex-1">
                {leftSteps.slice(0, 2).map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex gap-4 items-start group cursor-pointer p-3 rounded-xl transition-all duration-500 hover:bg-white/[0.03] border border-transparent hover:border-white/5">
                      <div className="w-10 h-10 rounded-full border border-accent-gold/40 bg-black/40 backdrop-blur-sm flex items-center justify-center shrink-0 transition-colors duration-500 group-hover:border-accent-gold group-hover:bg-accent-gold/10">
                        <Icon className="text-accent-gold text-lg transition-transform duration-500 group-hover:scale-110" weight="light" />
                      </div>
                      <div className="flex flex-col justify-center min-h-[40px]">
                        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold block">
                          {step.title}
                        </span>
                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                          <div className="overflow-hidden">
                            <p className="text-paragraph text-xs font-light leading-relaxed opacity-0 group-hover:opacity-90 transition-opacity duration-500 delay-100 whitespace-pre-line pt-2">
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
              <div className="flex flex-col gap-y-5 flex-1">
                {leftSteps.slice(2, 4).map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex gap-4 items-start group cursor-pointer p-3 rounded-xl transition-all duration-500 hover:bg-white/[0.03] border border-transparent hover:border-white/5">
                      <div className="w-10 h-10 rounded-full border border-accent-gold/40 bg-black/40 backdrop-blur-sm flex items-center justify-center shrink-0 transition-colors duration-500 group-hover:border-accent-gold group-hover:bg-accent-gold/10">
                        <Icon className="text-accent-gold text-lg transition-transform duration-500 group-hover:scale-110" weight="light" />
                      </div>
                      <div className="flex flex-col justify-center min-h-[40px]">
                        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold block">
                          {step.title}
                        </span>
                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                          <div className="overflow-hidden">
                            <p className="text-paragraph text-xs font-light leading-relaxed opacity-0 group-hover:opacity-90 transition-opacity duration-500 delay-100 whitespace-pre-line pt-2">
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
                src={bgImg} 
                alt="The Coaching Journey"
                className="w-full min-h-[85vh] object-cover opacity-90 object-[75%_top]"
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
                    className={`absolute flex items-center gap-2 z-20 group cursor-pointer ${node.flip ? 'flex-row-reverse' : ''} scale-[0.65] sm:scale-90 origin-center`}
                    style={{ 
                      top: node.mobTop, 
                      left: node.mobLeft,
                      transform: 'translate(-50%, -50%)' // Center the node on its coordinate on mobile
                    }}
                  >
                    <div className="w-10 h-10 rounded-full border border-accent-gold/40 bg-black/60 backdrop-blur-md flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(185,138,86,0.3)]">
                      <Icon className="text-accent-gold text-lg" weight="light" />
                    </div>
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-2 w-max">
                      <div className={`flex items-center gap-2 mb-0.5 ${node.flip ? 'justify-end' : ''}`}>
                        {node.flip ? (
                          <>
                            <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-white">{node.title}</span>
                            <span className="font-sans text-[0.6rem] tracking-widest text-accent-gold">{node.num}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-sans text-[0.6rem] tracking-widest text-accent-gold">{node.num}</span>
                            <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-white">{node.title}</span>
                          </>
                        )}
                      </div>
                      <p className={`text-paragraph text-[0.65rem] font-light leading-tight whitespace-pre-line text-white/80 ${node.flip ? 'text-right' : ''}`}>
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

      {/* Floating Nodes (Relative to full screen width/height for accurate mountain path alignment) */}
      {floatingNodes.map((node, i) => {
        const Icon = node.icon;
        return (
          <div 
            key={i} 
            className={`hidden lg:flex absolute items-center gap-2 journey-node z-20 group cursor-pointer ${node.flip ? 'flex-row-reverse' : ''}`}
            style={{ top: node.top, left: node.left }}
          >
            <div className="w-10 h-10 rounded-full border border-accent-gold/40 bg-black/60 backdrop-blur-md flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(185,138,86,0.3)] transition-all group-hover:border-accent-gold group-hover:scale-110">
              <Icon className="text-accent-gold text-lg" weight="light" />
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-2 w-max transition-all group-hover:border-accent-gold/40 group-hover:bg-black/60">
              <div className={`flex items-center gap-2 mb-0.5 ${node.flip ? 'justify-end' : ''}`}>
                {node.flip ? (
                  <>
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-white">{node.title}</span>
                    <span className="font-sans text-[0.6rem] tracking-widest text-accent-gold">{node.num}</span>
                  </>
                ) : (
                  <>
                    <span className="font-sans text-[0.6rem] tracking-widest text-accent-gold">{node.num}</span>
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-white">{node.title}</span>
                  </>
                )}
              </div>
              <p className={`text-paragraph text-[0.65rem] font-light leading-tight whitespace-pre-line text-white/80 ${node.flip ? 'text-right' : ''}`}>
                {node.text}
              </p>
            </div>
          </div>
        );
      })}

      {/* Floating Quote */}
      <div className="hidden lg:block absolute bottom-[250px] right-12 max-w-[280px] journey-quote z-20">
        <span className="font-serif text-4xl text-accent-gold leading-none block mb-2">"</span>
        <p className="font-serif text-2xl text-white mb-2 leading-tight">Transformation isn't a moment.</p>
        <p className="font-serif text-2xl text-accent-gold italic leading-tight">It's a journey you walk with the right guide.</p>
      </div>

      {/* Bottom Banners */}
      <div className="absolute bottom-0 left-0 w-full z-40 journey-bottom hidden xl:block">
        
        {/* HOW IT WORKS Row */}
        <div className="w-full bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
            
            <div className="font-sans text-[0.65rem] uppercase tracking-[0.3em] font-bold text-accent-gold pr-8 shrink-0">
              HOW IT WORKS
            </div>

            <div className="flex items-center gap-6 md:gap-12 flex-grow justify-between pl-8 border-l border-white/10">
              <div className="flex items-center gap-4 group">
                <CalendarBlank className="text-accent-gold text-2xl group-hover:scale-110 transition-transform" weight="light" />
                <p className="text-white/80 text-xs font-light max-w-[140px] leading-relaxed">
                  Personalized coaching sessions tailored to you.
                </p>
              </div>
              
              <div className="hidden md:block text-white/20 text-xl font-light">›</div>

              <div className="flex items-center gap-4 group">
                <ChatTeardropText className="text-accent-gold text-2xl group-hover:scale-110 transition-transform" weight="light" />
                <p className="text-white/80 text-xs font-light max-w-[140px] leading-relaxed">
                  Powerful conversations that create real shifts.
                </p>
              </div>

              <div className="hidden md:block text-white/20 text-xl font-light">›</div>

              <div className="flex items-center gap-4 group">
                <ListDashes className="text-accent-gold text-2xl group-hover:scale-110 transition-transform" weight="light" />
                <p className="text-white/80 text-xs font-light max-w-[140px] leading-relaxed">
                  Practical tools and frameworks you can use.
                </p>
              </div>

              <div className="hidden md:block text-white/20 text-xl font-light">›</div>

              <div className="flex items-center gap-4 group">
                <TrendUp className="text-accent-gold text-2xl group-hover:scale-110 transition-transform" weight="light" />
                <p className="text-white/80 text-xs font-light max-w-[140px] leading-relaxed">
                  Accountability that keeps you moving forward.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Transition Row */}
        <div className="w-full bg-black border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 rounded-full border border-accent-gold/40 flex items-center justify-center shrink-0">
                <Sparkle className="text-accent-gold text-xl" weight="light" />
              </div>
              <div>
                <p className="font-serif text-accent-gold text-lg mb-0.5 italic">Guided. Structured. Flexible.</p>
                <p className="text-paragraph text-xs text-white/70">
                  A process that adapts to you—so you can create a life that lasts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 cursor-pointer group">
              <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-accent-gold font-semibold transition-colors group-hover:text-white">
               
              </span>
              <div className="w-8 h-8 rounded-full border border-accent-gold/40 flex items-center justify-center transition-colors group-hover:border-accent-gold group-hover:bg-accent-gold/10">
                <ArrowDown className="text-accent-gold text-sm transition-transform group-hover:translate-y-1" />
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}
