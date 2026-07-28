import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  Heart, 
  Eye, 
  Leaf, 
  BookmarkSimple, 
  User, 
  Sun, 
  Drop, 
  Star,
  ArrowDown,
  X,
  ArrowRight
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

const questions = [
  { 
    id: 1, 
    icon: Heart, 
    text: "What if what you're feeling has a different meaning?", 
    title: "FEEL HONESTLY", 
    desc: "Get in touch with what's real, not what's easy to admit." 
  },
  { 
    id: 2, 
    icon: Eye, 
    text: "What are you not seeing clearly right now?", 
    title: "A NEW ANGLE", 
    desc: "Sometimes clarity doesn't come from knowing more.\n\nIt comes from seeing differently." 
  },
  { 
    id: 3, 
    icon: Leaf, 
    text: "Where are you choosing comfort over growth?", 
    title: "GROWTH", 
    desc: "Make choices that align with who you're becoming." 
  },
  { 
    id: 4, 
    icon: BookmarkSimple, 
    text: "What would change if you saw it from another angle?", 
    title: "SAVE & RETURN", 
    desc: "Save what speaks to you. Build your personal library." 
  },
  { 
    id: 5, 
    icon: User, 
    text: "Who would you be without the stories you tell yourself?", 
    title: "IDENTITY", 
    desc: "Explore the narratives that shape your reality." 
  },
  { 
    id: 6, 
    icon: Sun, 
    text: "What truth have you been avoiding to protect peace?", 
    title: "ILLUMINATION", 
    desc: "Bring light to the things hidden in the shadows." 
  },
  { 
    id: 7, 
    icon: Drop, 
    text: "What do you keep holding on to that holds you back?", 
    title: "RELEASE", 
    desc: "Let go of the weight that no longer serves your journey." 
  },
  { 
    id: 8, 
    icon: Star, 
    text: "What becomes possible if you let go of the need to be right?", 
    title: "POSSIBILITY", 
    desc: "Open yourself to the vast expanse of what could be." 
  },
];

// Removed bottom features

export default function QuestionsSection() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.section-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.question-card', 
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
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-24 pb-12 flex flex-col items-center">
      
      {/* Header */}
      <div className="section-header text-center mb-16 flex flex-col items-center z-10 px-6 opacity-0">
        <h2 className="font-serif text-3xl md:text-4xl text-white font-light tracking-wide mb-4">
          Every perspective<br/>
          begins with<br/>
          a question.
        </h2>
        <p className="font-sans text-white/60 text-sm font-light">
          What are you looking at today?
        </p>
      </div>

      {/* Grid */}
      <div className="relative w-full max-w-4xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 z-50">
        {questions.map((q) => {
          const isDimmed = hoveredCard !== null && hoveredCard !== q.id;
          
          return (
            <div 
              key={q.id}
              className={`
                question-card relative group aspect-[4/5] flex flex-col items-center justify-center text-center p-6 
                border border-white/10 rounded-md bg-black/40 backdrop-blur-sm 
                transition-all duration-700 ease-out cursor-pointer
                hover:scale-[1.05] hover:shadow-2xl hover:border-[#c79c6e]/50 hover:bg-[#0f0f0f]/80
                ${hoveredCard === q.id ? 'z-[60]' : 'z-10'}
                ${isDimmed ? '!opacity-30 !scale-95 !blur-[2px]' : ''}
              `}
              onMouseEnter={() => setHoveredCard(q.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <q.icon 
                size={32} 
                weight="light" 
                className={`mb-6 transition-all duration-700 ease-out ${hoveredCard === q.id ? 'text-[#c79c6e] scale-110 -translate-y-2' : 'text-[#c79c6e]/70 scale-100 translate-y-0'}`} 
              />
            <p className={`font-sans text-xs md:text-[0.7rem] text-white/70 font-light leading-relaxed transition-all duration-700 ease-out ${hoveredCard === q.id ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              {q.text}
            </p>

            {/* Hover Pop-up */}
            <div 
              className={`
                absolute top-0 left-0 w-full h-full md:w-[110%] md:-left-[5%] md:-top-[5%] md:h-[110%]
                bg-[#0f0f0f]/95 backdrop-blur-md border border-[#c79c6e]/40 rounded-lg p-6 shadow-[0_0_40px_rgba(199,156,110,0.15)] z-50
                flex flex-col text-left transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none
                ${hoveredCard === q.id ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}
              `}
            >
              <div className="flex items-center justify-between mb-4 text-[#c79c6e]">
                <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold">{q.title}</span>
                <X size={14} />
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <p className="font-sans text-white/90 text-xs leading-relaxed whitespace-pre-line">
                  {q.desc}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[#c79c6e]">
                <span className="font-sans text-[0.65rem] uppercase tracking-wider font-medium">Explore this perspective</span>
                <ArrowRight size={12} weight="bold" />
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
              These aren't just questions.<br/>
              They're doorways.<br/>
              Choose one.<br/>
              Step in.
            </p>
          </div>

          <div className="flex items-start gap-4 flex-1">
            <Eye size={24} className="text-[#c79c6e] shrink-0" weight="light" />
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[0.6rem] text-[#c79c6e] font-semibold uppercase tracking-widest">SEE DIFFERENTLY</span>
              <p className="font-sans text-[0.65rem] text-white/70 font-light leading-relaxed">Shift your viewpoint. See what you've been missing.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 flex-1">
            <Heart size={24} className="text-[#c79c6e] shrink-0" weight="light" />
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[0.6rem] text-[#c79c6e] font-semibold uppercase tracking-widest">FEEL HONESTLY</span>
              <p className="font-sans text-[0.65rem] text-white/70 font-light leading-relaxed">Get in touch with what's real, not what's easy to admit.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 flex-1">
            <Leaf size={24} className="text-[#c79c6e] shrink-0" weight="light" />
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[0.6rem] text-[#c79c6e] font-semibold uppercase tracking-widest">DECIDE INTENTIONALLY</span>
              <p className="font-sans text-[0.65rem] text-white/70 font-light leading-relaxed">Make choices that align with who you're becoming.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 flex-1">
            <BookmarkSimple size={24} className="text-[#c79c6e] shrink-0" weight="light" />
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[0.6rem] text-[#c79c6e] font-semibold uppercase tracking-widest">SAVE & RETURN</span>
              <p className="font-sans text-[0.65rem] text-white/70 font-light leading-relaxed">Save what speaks to you. Build your personal library.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll to continue */}
      <div className="mt-8 mb-16 flex flex-col items-center gap-3 z-10 opacity-70">
        <div className="w-5 h-8 border border-[#c79c6e]/50 rounded-full flex justify-center p-1">
          <div className="w-1 h-1 bg-[#c79c6e] rounded-full" />
        </div>
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e]">
          SCROLL TO CONTINUE
        </span>
        <ArrowDown size={14} className="text-[#c79c6e]" weight="bold" />
      </div>
    </section>
  );
}
