import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  User, 
  Users, 
  Shield, 
  Leaf, 
  Fingerprint, 
  Compass, 
  Cloud, 
  Star, 
  Briefcase, 
  House, 
  Heart, 
  Brain, 
  BookmarkSimple, 
  X, 
  ArrowRight,
  ArrowDown,
  Clock,
  LockKey,
  Quotes
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { id: 1, title: 'Self', icon: User, hasBookmark: true, desc: "Not every relationship problem is a relationship problem.\nSometimes it's boundaries.\nSometimes identity.\nSometimes fear.", topics: ["Self worth", "Core values", "Inner critic", "Authenticity"] },
  { id: 2, title: 'Relationships', icon: Users, hasBookmark: false, desc: "Not every relationship problem is a relationship problem.\nSometimes it's boundaries.\nSometimes identity.\nSometimes fear.", topics: ["People pleasing", "Conflict", "Emotional availability", "Expectations", "Attachment"] },
  { id: 3, title: 'Boundaries', icon: Shield, hasBookmark: false, desc: "Where you end and the world begins. Protect your energy and your peace.", topics: ["Saying no", "Protecting energy", "Communication", "Guilt"] },
  { id: 4, title: 'Growth', icon: Leaf, hasBookmark: false, desc: "The quiet, uncomfortable space between who you were and who you're becoming.", topics: ["Discomfort", "Consistency", "Learning", "Patience"] },
  { id: 5, title: 'Identity', icon: Fingerprint, hasBookmark: false, desc: "The stories you tell yourself about who you are. What happens if you change the script?", topics: ["Beliefs", "Ego", "Labels", "Redefining self"] },
  { id: 6, title: 'Decisions', icon: Compass, hasBookmark: false, desc: "Every choice is a step towards or away from yourself. Trust your internal compass.", topics: ["Clarity", "Overthinking", "Intuition", "Regret"] },
  { id: 7, title: 'Emotions', icon: Cloud, hasBookmark: false, desc: "Feelings are visitors. You don't have to invite them to live with you.", topics: ["Processing", "Reactivity", "Acceptance", "Triggers"] },
  { id: 8, title: 'Purpose', icon: Star, hasBookmark: false, desc: "Not what you do, but why you do it. Finding meaning in the everyday.", topics: ["Meaning", "Passion", "Alignment", "Contribution"] },
  { id: 9, title: 'Work', icon: Briefcase, hasBookmark: true, desc: "Your career is what you do, not who you are. Detaching self-worth from output.", topics: ["Burnout", "Ambition", "Balance", "Imposter syndrome"] },
  { id: 10, title: 'Family', icon: House, hasBookmark: false, desc: "The roots that ground us and sometimes entangle us. Navigating familial dynamics.", topics: ["Generational trauma", "Expectations", "Distance", "Acceptance"] },
  { id: 11, title: 'Healing', icon: Heart, hasBookmark: false, desc: "It's not about fixing what is broken, but discovering what was never broken.", topics: ["Forgiveness", "Time", "Grief", "Self-compassion"] },
  { id: 12, title: 'Mindset', icon: Brain, hasBookmark: false, desc: "The lens through which you view the world. Changing the lens changes the world.", topics: ["Scarcity vs Abundance", "Resilience", "Perspective", "Focus"] },
];

const bottomPoints = [
  { icon: BookmarkSimple, title: "CURATED, NOT CROWDED", desc: "Only perspectives that\ncreate real shifts." },
  { icon: Compass, title: "EXPLORE FREELY", desc: "There's no right order.\nFollow what pulls you." },
  { icon: Heart, title: "SAVE WHAT SPEAKS", desc: "Build a library that reflects\nyour journey." },
  { icon: Clock, title: "RETURN ANYTIME", desc: "Your space is always here.\nPick up where you left off." },
  { icon: LockKey, title: "YOURS. ALWAYS.", desc: "Private, personal and\njudgement-free." },
];

export default function LibrarySection() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo('.library-card', 
      { opacity: 0, y: 30, filter: 'blur(5px)' },
      { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        duration: 1.2, 
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-[#050505] pt-32 pb-12 flex flex-col items-center border-t border-white/5">
      
      {/* Header */}
      <div className="text-center mb-20 flex flex-col items-center z-10 px-6">
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] font-bold text-[#c79c6e] mb-8">
          PERSPECTIVE LIBRARY
        </span>
        <h2 className="font-serif text-3xl md:text-5xl text-white font-light tracking-wide mb-6">
          A library of perspectives.<br/>
          Not advice. Different ways of seeing.
        </h2>
        <p className="font-sans text-white/50 text-sm md:text-base font-light tracking-wide">
          Explore by what you're living,<br/>
          not what you're searching.
        </p>
      </div>

      {/* Grid */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 z-10">
        {categories.map((cat) => {
          const isDimmed = hoveredCard !== null && hoveredCard !== cat.id;
          
          return (
            <div 
              key={cat.id}
              className={`
                library-card relative group aspect-square flex flex-col items-center justify-center text-center p-6 
                border border-white/10 rounded-lg bg-black/40 backdrop-blur-sm 
                transition-all duration-700 ease-out cursor-pointer
                hover:scale-[1.05] hover:shadow-2xl hover:border-[#c79c6e]/50 hover:bg-[#0f0f0f]/80
                ${isDimmed ? '!opacity-30 !scale-95 !blur-[2px]' : ''}
              `}
              onMouseEnter={() => setHoveredCard(cat.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Subtle Bookmark indicator for explored categories */}
              {cat.hasBookmark && (
                <div className="absolute top-4 right-4 text-[#c79c6e] opacity-80">
                  <BookmarkSimple weight="fill" size={14} />
                </div>
              )}

              <cat.icon 
                size={32} 
                weight="light" 
                className={`mb-4 transition-all duration-700 ease-out ${hoveredCard === cat.id ? 'text-[#c79c6e] scale-110 -translate-y-2 opacity-0' : 'text-[#c79c6e]/70 scale-100 translate-y-0 opacity-100'}`} 
              />
              <p className={`font-sans text-xs md:text-sm text-white/70 font-light tracking-widest transition-all duration-700 ease-out ${hoveredCard === cat.id ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                {cat.title}
              </p>

              {/* Hover Pop-up */}
              <div 
                className={`
                  absolute top-0 left-0 w-full h-full md:w-[130%] md:-left-[15%] md:-top-[15%] md:h-[130%]
                  bg-[#0f0f0f]/95 backdrop-blur-md border border-[#c79c6e]/40 rounded-lg p-6 md:p-8 shadow-[0_0_40px_rgba(199,156,110,0.15)] z-50
                  flex flex-col text-left transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none
                  ${hoveredCard === cat.id ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}
                `}
              >
                <div className="flex items-center justify-between mb-4 text-[#c79c6e]">
                  <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold">{cat.title}</span>
                  <X size={14} />
                </div>
                
                <div className="flex-1 flex flex-col justify-start mt-2">
                  <p className="font-sans text-white/90 text-xs md:text-xs leading-relaxed whitespace-pre-line mb-6">
                    {cat.desc}
                  </p>
                  
                  <div className="border-t border-white/10 pt-4">
                    <span className="font-sans text-[0.55rem] uppercase tracking-widest font-semibold text-[#c79c6e] block mb-3">
                      INSIDE THIS COLLECTION
                    </span>
                    <ul className="flex flex-col gap-2">
                      {cat.topics.map((topic, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-white/40 rounded-full" />
                          <span className="font-sans text-white/70 text-[0.65rem] md:text-xs font-light">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[#c79c6e]">
                  <span className="font-sans text-[0.65rem] uppercase tracking-wider font-medium">Explore Collection</span>
                  <ArrowRight size={12} weight="bold" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll to discover */}
      <div className="mt-16 mb-16 flex flex-col items-center gap-3 z-10 opacity-70">
        <div className="w-5 h-8 border border-[#c79c6e]/50 rounded-full flex justify-center p-1">
          <div className="w-1 h-1 bg-[#c79c6e] rounded-full animate-bounce" />
        </div>
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e]">
          SCROLL TO DISCOVER
        </span>
        <ArrowDown size={14} className="text-[#c79c6e] animate-pulse" weight="bold" />
      </div>

      {/* Quote Block */}
      <div className="w-full max-w-4xl mx-auto px-6 mb-24 z-10 flex flex-col items-center md:items-start text-center md:text-left md:flex-row gap-6">
        <Quotes size={24} className="text-[#c79c6e] opacity-50 shrink-0 mt-1 hidden md:block" weight="fill" />
        <div>
          <p className="font-sans text-white/80 font-light text-sm md:text-base">
            "A library isn't meant to be finished.<br/>It's meant to be returned to."
          </p>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="w-full max-w-[90rem] mx-auto px-6 md:px-12 mt-auto pb-12">
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4 p-8 md:p-10 border border-white/10 rounded-lg bg-[#0a0a0a]/50 backdrop-blur-sm z-10">
          {bottomPoints.map((point, i) => (
            <div key={i} className="flex flex-col items-start gap-4">
              <point.icon size={26} weight="light" className="text-[#c79c6e] shrink-0" />
              <div className="flex flex-col gap-2">
                <h4 className="font-sans text-[0.6rem] uppercase tracking-widest font-medium text-[#c79c6e]">
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
