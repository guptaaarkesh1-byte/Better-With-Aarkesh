import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  User, 
  Heart, 
  ArrowsLeftRight, 
  Cube, 
  Cloud, 
  LockKey, 
  Star,
  Leaf,
  ArrowDown,
  X,
  ArrowRight,
  BookmarkSimple,
  Compass
} from '@phosphor-icons/react';

// Import images
import imgPeoplePleasing from '../../assets/PerspectivePage/recognition/people_pleasing.png';
import imgMissingSomeone from '../../assets/PerspectivePage/recognition/missing_someone.png';
import imgComparison from '../../assets/PerspectivePage/recognition/comparison.png';
import imgFeelingInvisible from '../../assets/PerspectivePage/recognition/feeling_invisible.png';
import imgEmotionalExhaustion from '../../assets/PerspectivePage/recognition/emotional_exhaustion.png';
import imgHoldingItIn from '../../assets/PerspectivePage/recognition/holding_it_in.png';
import imgWantingMore from '../../assets/PerspectivePage/recognition/wanting_more.png';
import imgMomentsOfGrace from '../../assets/PerspectivePage/recognition/moments_of_grace.png';

gsap.registerPlugin(ScrollTrigger);

const recognitionItems = [
  { 
    id: 1, 
    icon: User, 
    title: "People Pleasing", 
    subtitle: "Saying yes,\nwhen you mean no.",
    image: imgPeoplePleasing,
    desc: "Sometimes saying 'yes'\nisn't kindness.\n\nSometimes it's fear.\n\nSometimes it's the belief\nthat your needs\nmatter less." 
  },
  { 
    id: 2, 
    icon: Heart, 
    title: "Missing Someone", 
    subtitle: "Carrying someone\nwho's gone.",
    image: imgMissingSomeone,
    desc: "Grief isn't just about death.\n\nIt's about the space someone leaves behind when they're no longer in your life." 
  },
  { 
    id: 3, 
    icon: ArrowsLeftRight, 
    title: "Comparison", 
    subtitle: "Measuring your\nlife against others.",
    image: imgComparison,
    desc: "The thief of joy.\n\nLooking sideways distracts you from moving forward on your own path." 
  },
  { 
    id: 4, 
    icon: Cube, 
    title: "Feeling Invisible", 
    subtitle: "Being there,\nbut unseen.",
    image: imgFeelingInvisible,
    desc: "It hurts to be in a room full of people and still feel like you're completely alone.\n\nYour presence matters, even if they don't see it." 
  },
  { 
    id: 5, 
    icon: Cloud, 
    title: "Emotional Exhaustion", 
    subtitle: "Running on empty,\ntoo often.",
    image: imgEmotionalExhaustion,
    desc: "When you've been strong for too long.\n\nIt's okay to put the weight down. You don't have to carry it all." 
  },
  { 
    id: 6, 
    icon: LockKey, 
    title: "Holding It In", 
    subtitle: "Keeping it together\nfor everyone else.",
    image: imgHoldingItIn,
    desc: "The mask is heavy.\n\nVulnerability isn't weakness, it's the courage to finally be seen as you are." 
  },
  { 
    id: 7, 
    icon: Star, 
    title: "Wanting More", 
    subtitle: "Knowing there's\nmore for you.",
    image: imgWantingMore,
    desc: "That quiet whisper telling you this isn't it.\n\nListen to it. It knows the way." 
  },
  { 
    id: 8, 
    icon: Leaf, 
    title: "Moments of Grace", 
    subtitle: "Small reminders\nthat keep you going.",
    image: imgMomentsOfGrace,
    desc: "The sudden peace in chaos.\n\nThe deep breath that finally fills your lungs. Notice them." 
  },
];

export default function RecognitionSection() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.recognition-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.recognition-card', 
      { opacity: 0, y: 40, filter: 'blur(5px)' },
      { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        duration: 1.2, 
        stagger: 0.15,
        ease: 'power3.out',
      },
      "+=0.6"
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-24 pb-12 flex flex-col items-center border-t border-white/5">
      
      {/* Header */}
      <div className="recognition-header w-full max-w-6xl mx-auto px-6 mb-16 flex flex-col items-center z-10 text-center opacity-0">
        
        <h2 className="font-serif text-3xl md:text-5xl text-white font-light tracking-wide mb-6">
          Recognition
        </h2>
        <p className="font-sans text-white/60 text-sm font-light max-w-md mx-auto">
          Some moments we all know, even if no two stories are the same.
          These are the experiences that quietly <span className="text-[#c79c6e]">connect</span> us.
        </p>
      </div>

      {/* Grid */}
      <div className="relative w-full max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 z-50">
        {recognitionItems.map((item) => {
          const isDimmed = hoveredCard !== null && hoveredCard !== item.id;
          
          return (
            <div 
              key={item.id}
              className={`
                recognition-card relative group aspect-[3/4.5] flex flex-col items-center justify-start text-center p-0 
                border border-white/10 rounded-md bg-[#0a0a0a] backdrop-blur-sm 
                transition-all duration-700 ease-out cursor-pointer overflow-hidden
                hover:scale-[1.05] hover:shadow-2xl hover:border-[#c79c6e]/50 hover:bg-[#0f0f0f]/80
                ${hoveredCard === item.id ? 'z-[60]' : 'z-10'}
                ${isDimmed ? '!opacity-30 !scale-95 !blur-[2px]' : ''}
              `}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="w-full h-1/2 overflow-hidden relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent" />
              </div>

              <div className="w-full h-1/2 flex flex-col items-center justify-start pt-2 pb-6 px-4 relative z-10 bg-[#0a0a0a]">
                <item.icon 
                  size={24} 
                  weight="light" 
                  className={`mb-3 transition-all duration-700 ease-out text-[#c79c6e] ${hoveredCard === item.id ? 'scale-110 -translate-y-1' : 'scale-100 translate-y-0'}`} 
                />
                <h3 className="font-sans text-xs md:text-sm text-white font-medium mb-2 tracking-wider">{item.title}</h3>
                <p className="font-sans text-[0.65rem] md:text-xs text-white/50 font-light leading-snug whitespace-pre-line">
                  {item.subtitle}
                </p>
              </div>

              {/* Hover Pop-up */}
              <div 
                className={`
                  absolute top-0 left-0 w-full md:w-[110%] md:-left-[5%] md:-top-[5%] h-auto min-h-full
                  bg-[#080808] border border-[#c79c6e]/80 rounded-md p-8 shadow-[0_0_30px_rgba(199,156,110,0.15)] z-50
                  flex flex-col text-left transition-all duration-500 ease-out
                  ${hoveredCard === item.id ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}
                `}
              >
                <div className="flex items-center justify-between mb-3 text-[#c79c6e]">
                  <span className="font-sans text-xs uppercase tracking-widest font-bold">{item.title.toUpperCase()}</span>
                  <X size={16} />
                </div>
                <span className="font-serif italic text-xs text-[#c79c6e] mb-6 block">
                  (Shared human emotion)
                </span>
                
                <div className="flex-1 flex flex-col justify-start">
                  <p className="font-sans text-white/90 text-xs leading-[1.8] whitespace-pre-line">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-[#c79c6e]">
                  <span className="font-sans text-xs font-medium">Explore this perspective</span>
                  <ArrowRight size={14} weight="bold" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Info Bar */}
      <div className="w-full max-w-[90rem] mx-auto px-6 md:px-12 mt-16 mb-8 z-10">
        <div className="w-full border border-white/10 rounded-lg bg-[#0a0a0a]/50 backdrop-blur-sm p-8 flex flex-col md:flex-row items-start justify-between gap-8 md:gap-4">
          
          <div className="flex items-start gap-4 flex-1">
            <BookmarkSimple size={24} className="text-[#c79c6e] shrink-0" weight="light" />
            <p className="font-sans text-[0.65rem] text-white/70 font-light leading-relaxed">
              These aren't just moments.<br/>
              They're shared parts of being human.<br/>
              See one that feels familiar?<br/>
              Explore it deeper.
            </p>
          </div>

          <div className="flex items-start gap-4 flex-1">
            <User size={24} className="text-[#c79c6e] shrink-0" weight="light" />
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[0.6rem] text-[#c79c6e] font-semibold uppercase tracking-widest">YOU ARE NOT ALONE</span>
              <p className="font-sans text-[0.65rem] text-white/70 font-light leading-relaxed">Someone else has felt this too. That's what connects us.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 flex-1">
            <Heart size={24} className="text-[#c79c6e] shrink-0" weight="light" />
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[0.6rem] text-[#c79c6e] font-semibold uppercase tracking-widest">BE SEEN, NOT FIXED</span>
              <p className="font-sans text-[0.65rem] text-white/70 font-light leading-relaxed">This is not about fixing. It's about understanding.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 flex-1">
            <Compass size={24} className="text-[#c79c6e] shrink-0" weight="light" />
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[0.6rem] text-[#c79c6e] font-semibold uppercase tracking-widest">FROM RECOGNITION COMES CLARITY</span>
              <p className="font-sans text-[0.65rem] text-white/70 font-light leading-relaxed">When we name it, we can move with it.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 flex-1">
            <Star size={24} className="text-[#c79c6e] shrink-0" weight="light" />
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[0.6rem] text-[#c79c6e] font-semibold uppercase tracking-widest">KEEP EXPLORING</span>
              <p className="font-sans text-[0.65rem] text-white/70 font-light leading-relaxed">There are more perspectives waiting for you.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll to continue */}
      <div className="mt-8 mb-16 flex flex-col items-center gap-3 z-10 opacity-70">
        <div className="w-5 h-8 border border-[#c79c6e]/50 rounded-full flex justify-center p-1">
          <div className="w-1 h-1 bg-[#c79c6e] rounded-full animate-bounce" />
        </div>
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e]">
          SCROLL TO CONTINUE
        </span>
        <ArrowDown size={14} className="text-[#c79c6e] animate-pulse" weight="bold" />
      </div>
    </section>
  );
}
