import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  BookmarkSimple, 
  Clock, 
  ArrowRight,
  ArrowDown,
  X,
  BookOpen,
  PencilSimple,
  Coffee
} from '@phosphor-icons/react';
import featuredImg from '../../assets/PerspectivePage/featured_perspective.png';

gsap.registerPlugin(ScrollTrigger);

const footerPoints = [
  { icon: BookOpen, title: "ONE AT A TIME", desc: "We feature one perspective\nso you can give it your\nfull attention." },
  { icon: Clock, title: "READ AT YOUR PACE", desc: "Take a few minutes.\nOr keep it with you\nfor later." },
  { icon: BookmarkSimple, title: "SAVE WHAT MATTERS", desc: "Save it to your library\nand come back when\nyou're ready." },
  { icon: PencilSimple, title: "THINK. REFLECT. APPLY.", desc: "These aren't lessons.\nThey're mirrors." },
  { icon: Coffee, title: "RETURN WHEN YOU NEED", desc: "The right perspective\nfinds you when\nyou're ready for it." },
];

export default function FeaturedSection() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.featured-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.featured-card', 
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
      <div className="featured-header text-center mb-16 flex flex-col items-center z-10 px-6 opacity-0">
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] font-bold text-[#c79c6e] mb-8">
          FEATURED PERSPECTIVE
        </span>
        <h2 className="font-serif text-3xl md:text-5xl text-white font-light tracking-wide mb-6">
          The gap between<br/>
          knowing and living.
        </h2>
        <p className="font-sans text-white/50 text-sm md:text-base font-light tracking-wide leading-relaxed">
          Most of us know what to do.<br/>
          The real question is why we don't.
        </p>
      </div>

      {/* Featured Card */}
      <div 
        className="featured-card relative w-full max-w-4xl mx-auto px-6 mb-20 z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsHovered(true)}
      >
        <div className="w-full flex flex-col md:flex-row border border-white/10 rounded-lg bg-[#0a0a0a] backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-[#c79c6e]/50 hover:shadow-2xl hover:shadow-[#c79c6e]/5">
          
          {/* Image Half */}
          <div className="w-full md:w-1/2 h-64 md:h-[28rem] relative overflow-hidden">
            <img 
              src={featuredImg} 
              alt="Featured Perspective" 
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-105' : 'scale-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a] hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent md:hidden" />
          </div>

          {/* Content Half */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-[#0a0a0a]">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
              <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e]">
                SELF-AWARENESS
              </span>
              <BookmarkSimple size={20} className="text-[#c79c6e] opacity-70" weight="light" />
            </div>

            {/* Default State Content */}
            <div className={`flex-1 flex flex-col justify-center transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isHovered ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}`}>
              <h3 className="font-serif text-2xl md:text-3xl text-white font-light mb-4">
                The gap between<br/>
                knowing and living.
              </h3>
              <p className="font-sans text-white/70 text-sm font-light leading-relaxed mb-8">
                Awareness is the beginning.<br/>
                Alignment is the work.
              </p>
              
              <div className="flex items-center gap-2 text-white/50 mb-6">
                <Clock size={14} weight="light" />
                <span className="font-sans text-xs font-light">6 min read</span>
              </div>

              <div className="flex items-center gap-2 text-[#c79c6e]">
                <span className="font-sans text-xs font-medium uppercase tracking-wider">Read Perspective</span>
                <ArrowRight size={14} weight="bold" />
              </div>
            </div>

            {/* Hover Pop-up Content (Inside the right half) */}
            <div className={`absolute inset-0 p-8 md:p-12 bg-[#080808] border-l border-[#c79c6e]/20 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isHovered ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="flex items-center justify-between mb-6 text-[#c79c6e]">
                <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold">A PEEK INSIDE</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHovered(false);
                  }}
                  className="p-1 -mr-1 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="font-sans text-white/90 text-sm leading-relaxed mb-6">
                We overestimate how much we know, and underestimate how much we avoid.
              </p>

              <div className="w-8 h-[1px] bg-white/20 mb-6" />

              <p className="font-sans text-white/60 text-xs font-light mb-4">
                This perspective explores:
              </p>

              <ul className="flex flex-col gap-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-[#c79c6e] rounded-full" />
                  <span className="font-sans text-white/80 text-xs font-light">The comfort of knowing</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-[#c79c6e] rounded-full" />
                  <span className="font-sans text-white/80 text-xs font-light">The cost of not living it</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-[#c79c6e] rounded-full" />
                  <span className="font-sans text-white/80 text-xs font-light">Small shifts that close the gap</span>
                </li>
              </ul>

              <div className="mt-auto flex items-center gap-2 text-[#c79c6e]">
                <span className="font-sans text-xs font-medium uppercase tracking-wider">Read full perspective</span>
                <ArrowRight size={14} weight="bold" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="w-full max-w-[90rem] mx-auto px-6 md:px-12 mb-16 z-10">
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4 p-8 md:p-10 border border-white/10 rounded-lg bg-[#0a0a0a]/50 backdrop-blur-sm z-10">
          {footerPoints.map((point, i) => (
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

      {/* Scroll to read */}
      <div className="mt-8 mb-16 flex flex-col items-center gap-3 z-10 opacity-70">
        <div className="w-5 h-8 border border-[#c79c6e]/50 rounded-full flex justify-center p-1">
          <div className="w-1 h-1 bg-[#c79c6e] rounded-full animate-bounce" />
        </div>
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e]">
          SCROLL TO READ
        </span>
        <ArrowDown size={14} className="text-[#c79c6e] animate-pulse" weight="bold" />
      </div>

    </section>
  );
}
