import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  ArrowRight,
  ArrowDown,
  X,
  CalendarBlank,
  Compass,
  Sparkle,
  Heart,
  LockKey,
  User,
  DoorOpen
} from '@phosphor-icons/react';

const coachingPillars = [
  {
    id: 'coaching',
    icon: CalendarBlank,
    title: '1:1 COACHING',
    desc: 'Personalised sessions\nbuilt around you.',
    hoverDesc: 'A dedicated space to explore where you are and where you want to be.',
    bullets: [
      'Deep, focused conversations',
      'Tailored to your specific goals',
      'Accountability and support',
      'A safe, non-judgmental space'
    ]
  },
  {
    id: 'clarity',
    icon: Compass,
    title: 'CLARITY & DIRECTION',
    desc: 'Untangle the noise.\nFind what matters.',
    hoverDesc: 'Untangle the noise.\nFind what matters.',
    bullets: [
      "Understand what's keeping you stuck",
      'Get clear on what you truly want',
      'Make decisions with confidence',
      'Create a path that fits you'
    ]
  },
  {
    id: 'change',
    icon: Sparkle,
    title: 'LASTING CHANGE',
    desc: 'Build aligned actions\nthat create real shifts.',
    hoverDesc: 'Turn insights into reality.',
    bullets: [
      'Bridge the gap between knowing and doing',
      'Develop sustainable habits',
      'Overcome inner resistance',
      'Celebrate your progress'
    ]
  }
];

const footerPoints = [
  { icon: Heart, title: "YOU DON'T HAVE TO\nFIGURE IT OUT ALONE", desc: "You just have to be\nwilling to begin." },
  { icon: LockKey, title: "YOUR SPACE IS SAFE", desc: "Confidential. Judgment-free.\nAlways." },
  { icon: User, title: "YOU SET THE PACE", desc: "This is your journey.\nYou lead." },
  { icon: Compass, title: "REAL. PRACTICAL. HUMAN.", desc: "No fluff. Just honest conversations\nand meaningful tools." },
  { icon: DoorOpen, title: "WHEN YOU'RE READY", desc: "This space will be here,\nwaiting." },
];

export default function InvitationSection() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.invitation-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.invitation-card', 
      { opacity: 0, y: 40, filter: 'blur(5px)' },
      { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        duration: 1.2, 
        ease: 'power3.out',
      },
      "+=0.4"
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-32 pb-12 flex flex-col items-center border-t border-white/5">
      
      {/* Header */}
      <div className="invitation-header text-center mb-16 flex flex-col items-center z-10 px-6 opacity-0">
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] font-bold text-[#c79c6e] mb-6">
          THE NEXT STEP
        </span>
        <h2 className="font-serif text-3xl md:text-5xl text-white font-light tracking-wide mb-6">
          Insights are the beginning.<br/>
          Change is where you<br/>
          come home to yourself.
        </h2>
        <p className="font-sans text-white/50 text-sm md:text-base font-light tracking-wide leading-relaxed">
          Coaching is a space for what<br/>
          you're ready to transform.
        </p>
      </div>



      {/* The Big Card */}
      <div className="invitation-card relative w-full max-w-4xl mx-auto px-6 mb-24 z-10">
        <div className="w-full border border-white/10 rounded-xl bg-[#0a0a0a]/80 backdrop-blur-md p-8 md:p-12 flex flex-col items-center">
          
          {/* 3 Columns Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 mb-16 group/grid">
            {coachingPillars.map((pillar, index) => {
              const isFirst = index === 0;
              const isLast = index === 2;
              
              return (
              <div 
                key={pillar.id}
                className="
                  relative group flex flex-col items-center text-center p-4 
                  transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer
                  group-hover/grid:opacity-30 group-hover/grid:scale-95 group-hover/grid:blur-[2px]
                  hover:!opacity-100 hover:!scale-[1.05] hover:!blur-none hover:!z-[60]
                "
              >
                <div className="w-16 h-16 mb-6 flex items-center justify-center">
                  <pillar.icon size={40} className="text-[#c79c6e] opacity-80 group-hover:opacity-100 transition-opacity" weight="light" />
                </div>
                <h4 className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-semibold text-[#c79c6e] mb-4">
                  {pillar.title}
                </h4>
                <p className="font-sans text-white/70 text-xs md:text-sm font-light whitespace-pre-line leading-relaxed">
                  {pillar.desc}
                </p>

                {/* Hover Pop-up Menu */}
                <div 
                  className={`
                    absolute top-1/2 -translate-y-1/2 w-[280px]
                    bg-[#080808] border border-[#c79c6e]/40 rounded-xl p-8 shadow-2xl z-50
                    flex flex-col text-left transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-none
                    opacity-0 scale-90
                    group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                    left-1/2 -translate-x-1/2 group-hover:-translate-x-1/2
                    ${isFirst 
                      ? "md:left-full md:-translate-x-8 md:group-hover:translate-x-0" 
                      : isLast 
                        ? "md:left-auto md:right-full md:translate-x-8 md:group-hover:translate-x-0"
                        : "md:left-1/2 md:-translate-x-1/2"}
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-semibold text-[#c79c6e]">
                      {pillar.title}
                    </span>
                    <X size={14} className="text-white/50 hover:text-white cursor-pointer" />
                  </div>

                  <p className="font-sans text-white/90 text-sm leading-relaxed whitespace-pre-line mb-6">
                    {pillar.hoverDesc}
                  </p>

                  <div className="w-full h-[1px] bg-white/10 mb-6" />

                  <ul className="flex flex-col gap-4 mb-8">
                    {pillar.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-1 h-1 bg-[#c79c6e] rounded-full shrink-0" />
                        <span className="font-sans text-white/70 text-xs font-light leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex items-center gap-2 text-[#c79c6e] group/link cursor-pointer w-max">
                    <span className="font-sans text-xs font-medium tracking-wider">Learn more</span>
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-1" weight="bold" />
                  </div>
                </div>

              </div>
            )})}
          </div>

          {/* Big Action Button */}
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            <button className="w-full py-4 border border-[#c79c6e]/50 text-[#c79c6e] font-sans text-[0.7rem] uppercase tracking-[0.2em] font-semibold rounded-md hover:bg-[#c79c6e] hover:text-[#050505] transition-colors duration-500 mb-4">
              BOOK A DISCOVERY SESSION
            </button>
            <span className="font-sans text-white/40 text-xs font-light">
              No pressure. Just a conversation.
            </span>
          </div>
          
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="w-full max-w-[90rem] mx-auto px-6 md:px-12 pb-12 z-10">
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4 p-8 md:p-10 border border-white/10 rounded-xl bg-[#0a0a0a]/50 backdrop-blur-sm z-10">
          {footerPoints.map((point, i) => (
            <div key={i} className="flex flex-col items-start gap-4">
              <point.icon size={26} weight="light" className="text-[#c79c6e] shrink-0" />
              <div className="flex flex-col gap-2">
                <h4 className="font-sans text-[0.6rem] uppercase tracking-widest font-medium text-[#c79c6e] whitespace-pre-line">
                  {point.title}
                </h4>
                <p className="font-sans text-white/60 text-[0.65rem] md:text-[0.6rem] font-light leading-relaxed whitespace-pre-line">
                  {point.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
