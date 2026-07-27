import { useRef } from 'react';
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
  MouseScroll
} from '@phosphor-icons/react';

// Import individual images
import pilotImg from '../../assets/Page8/pilot.png';
import coachImg from '../../assets/Page8/Coach.png';
import humanImg from '../../assets/Page8/human.png';

gsap.registerPlugin(ScrollTrigger);

export default function MeetAarkesh() {
  const container = useRef(null);

  const roles = [
    {
      title: 'PILOT',
      icon: AirplaneTilt,
      sub1: 'Years in the cockpit.',
      sub2: 'High stakes. Clear decisions.',
      highlight: 'I know what pressure feels like.',
      bgImg: pilotImg,
      imgPos: 'object-center'
    },
    {
      title: 'COACH',
      icon: Crosshair,
      sub1: 'ICF-certified life coach.',
      sub2: 'Evidence-based. Human-first.',
      highlight: 'I walk beside you, not ahead of you.',
      bgImg: coachImg,
      imgPos: 'object-top' // Moves the image down to show more of the top
    },
    {
      title: 'HUMAN',
      icon: Heart,
      sub1: 'Flaws. Lessons. Growth.',
      sub2: 'Still figuring things out.',
      highlight: 'Just like you.',
      bgImg: humanImg,
      imgPos: 'object-center'
    }
  ];

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.meet-header',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }
    )
    .fromTo('.role-pane',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 },
      "-=0.4"
    )
    .fromTo('.meet-footer',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      "-=0.2"
    );
  }, { scope: container });

  return (
    <section ref={container} id="meet-aarkesh" className="relative w-full h-screen flex flex-col bg-black overflow-hidden snap-section pt-20">
      
      {/* Grid Panes (Images fill from just below navbar to the bottom banner) */}
      <div className="w-full flex-grow flex flex-col md:flex-row border-y border-white/10 min-h-0 relative">
        
        {roles.map((role, i) => {
          const Icon = role.icon;
          return (
            <div 
              key={i} 
              className="role-pane relative flex-1 min-h-0 flex flex-col items-center justify-end pb-16 p-6 group overflow-hidden border-b md:border-b-0 md:border-r border-white/10 last:border-none"
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={role.bgImg} 
                  alt={role.title} 
                  className={`w-full h-full object-cover ${role.imgPos} opacity-70 transition-transform duration-[1.5s] ease-out group-hover:scale-105 group-hover:opacity-100`} 
                />
              </div>

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent opacity-90 z-0 transition-opacity duration-700 group-hover:opacity-70" />
              
              {/* Conditional Top Header (Only in the Middle Column) */}
              {i === 1 && (
                <div className="absolute top-12 inset-x-0 flex flex-col items-center justify-center text-center z-20 px-6 transition-opacity duration-500 ease-out group-hover:opacity-0 meet-header pointer-events-none">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-[1px] w-6 bg-accent-gold" />
                    <span className="font-sans text-[0.65rem] uppercase tracking-[0.3em] font-bold text-accent-gold">
                      MEET AARKESH
                    </span>
                    <div className="h-[1px] w-6 bg-accent-gold" />
                  </div>

                  <h2 className="font-serif text-4xl md:text-5xl lg:text-5xl font-medium tracking-tight mb-2 text-white">
                    Three roles. One purpose.
                  </h2>
                  
                  <p className="text-paragraph text-sm md:text-base font-light tracking-wide text-white/70">
                    Different lenses. Same mission—your growth.
                  </p>
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center text-center transition-transform duration-700 ease-out group-hover:-translate-y-2">
                <Icon className="text-accent-gold text-3xl mb-4 opacity-80" weight="light" />
                <h3 className="font-serif text-3xl md:text-4xl tracking-widest text-white mb-6">{role.title}</h3>
                
                <div className="flex flex-col items-center gap-2 opacity-0 transform translate-y-8 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0 h-0 group-hover:h-auto overflow-hidden group-hover:overflow-visible">
                  <p className="text-white/80 font-light text-xs md:text-sm">{role.sub1}</p>
                  <p className="text-white/80 font-light text-xs md:text-sm mb-2">{role.sub2}</p>
                  <p className="text-accent-gold font-serif italic text-sm md:text-base mb-6">{role.highlight}</p>
                  
                  <div className="flex items-center gap-3 cursor-pointer">
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-white/70 transition-colors hover:text-white">
                      EXPLORE THIS CHAPTER
                    </span>
                    <ArrowRight className="text-accent-gold text-xs" weight="light" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Banner */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/10 meet-footer shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex flex-col xl:flex-row items-center justify-between gap-6">
          
          {/* Left Side: Mission */}
          <div className="flex-1 shrink-0 flex flex-col items-start w-full xl:w-auto">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="h-[1px] w-4 bg-accent-gold origin-left" />
              <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-bold text-accent-gold">
                BEYOND THE ROLES
              </span>
            </div>
            
            <h3 className="font-serif text-lg md:text-xl text-white tracking-tight mb-1">
              The journey that shaped the mission.
            </h3>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <p className="text-white/70 font-light text-[0.65rem] max-w-sm leading-relaxed">
                From the skies to the soul—here's the story behind why I do what I do.
              </p>
              
              <button className="flex items-center gap-2 border border-accent-gold/40 rounded-sm px-4 py-1.5 transition-colors hover:border-accent-gold hover:bg-accent-gold/10 shrink-0">
                <span className="font-sans text-[0.5rem] uppercase tracking-[0.2em] font-semibold text-accent-gold">
                  READ MY STORY
                </span>
                <ArrowRight className="text-accent-gold text-[0.6rem]" />
              </button>
            </div>
          </div>

          {/* Right Side: Features */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full xl:w-auto xl:border-l border-white/10 xl:pl-8">
            
            <div className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-full border border-accent-gold/40 flex items-center justify-center shrink-0 transition-colors group-hover:border-accent-gold group-hover:bg-accent-gold/10">
                <Compass className="text-accent-gold text-base" weight="light" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xs text-white mb-0.5">Real experience</span>
                <span className="text-paragraph text-[0.6rem] font-light text-white/60 leading-tight">Life in high-pressure<br/>environments.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-full border border-accent-gold/40 flex items-center justify-center shrink-0 transition-colors group-hover:border-accent-gold group-hover:bg-accent-gold/10">
                <Brain className="text-accent-gold text-base" weight="light" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xs text-white mb-0.5">Deep training</span>
                <span className="text-paragraph text-[0.6rem] font-light text-white/60 leading-tight">Backed by science.<br/>Rooted in empathy.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-full border border-accent-gold/40 flex items-center justify-center shrink-0 transition-colors group-hover:border-accent-gold group-hover:bg-accent-gold/10">
                <Users className="text-accent-gold text-base" weight="light" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xs text-white mb-0.5">Relatable approach</span>
                <span className="text-paragraph text-[0.6rem] font-light text-white/60 leading-tight">No jargon. No masks.<br/>Just real conversations.</span>
              </div>
            </div>

          </div>

        </div>
      </div>



    </section>
  );
}
