import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  BookmarkSimple,
  PlayCircle
} from '@phosphor-icons/react';

// Placeholders for content thumbnails
import thumb1 from '../../assets/PerspectivePage/recognition/emotional_exhaustion.png';
import thumb2 from '../../assets/PerspectivePage/recognition/comparison.png';
import thumb3 from '../../assets/PerspectivePage/recognition/holding_it_in.png';

gsap.registerPlugin(ScrollTrigger);

const situations = [
  {
    id: '1',
    text: 'When you know something\nis wrong but cannot name it',
  },
  {
    id: '2',
    text: 'When leaving feels painful\nand staying feels dishonest',
  },
  {
    id: '3',
    text: 'When you keep questioning\nwhether you are overreacting',
  },
  {
    id: '4',
    text: 'When you understand\nthe pattern but still\nrepeat it',
  },
  {
    id: '5',
    text: 'When every available\ndecision comes with a loss',
  },
  {
    id: '6',
    text: 'When you need clarity,\nnot another opinion',
  }
];

const curatedContent = [
  {
    id: 1,
    image: thumb1,
    type: 'ARTICLE',
    duration: '7 MIN',
    title: 'Why insight alone does not change a pattern',
    hasPlay: false
  },
  {
    id: 2,
    image: thumb2,
    type: 'VIDEO',
    duration: '9 MIN',
    title: 'The familiarity that keeps pulling you back',
    hasPlay: true
  },
  {
    id: 3,
    image: thumb3,
    type: 'REFLECTION TOOL',
    duration: '12 MIN',
    title: 'Map the loop before trying to break it',
    hasPlay: false
  }
];

export default function SituationExploreSection() {
  const [hoveredSituation, setHoveredSituation] = useState(null);
  const [selectedSituation, setSelectedSituation] = useState(null);
  
  const containerRef = useRef(null);
  const gridContainerRef = useRef(null);
  const detailContainerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.situation-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.situation-card', 
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        stagger: 0.1,
        ease: 'power3.out',
      },
      "-=0.5"
    );
  }, { scope: containerRef });

  const handleSelect = (sit) => {
    gsap.to(gridContainerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        setSelectedSituation(sit);
        gsap.fromTo(detailContainerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 }
        );
      }
    });
  };

  const handleBack = () => {
    gsap.to(detailContainerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        setSelectedSituation(null);
        gsap.fromTo(gridContainerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 }
        );
      }
    });
  };

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-32 pb-12 flex flex-col items-center px-6 md:px-16 lg:px-24 border-t border-white/5">
      
      <div className="w-full max-w-5xl flex flex-col flex-1 h-full">
        {/* Header Area */}
        <div className="situation-header mb-12 flex flex-col items-start z-10 opacity-0 w-full relative">
          
          {selectedSituation && (
            <button 
              onClick={handleBack}
              className="absolute right-0 top-0 flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">BACK</span>
            </button>
          )}

          <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
            FOR WHAT YOU'RE CARRYING TODAY
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1] mb-6">
            Begin with the thought<br />
            that keeps returning.
          </h2>

          {/* Subtitle when selected */}
          {selectedSituation && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2">
              <span className="font-sans text-[0.7rem] uppercase tracking-[0.15em] font-medium text-[#c79c6e]">
                {selectedSituation.text.replace(/\n/g, ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="w-full flex-1 relative min-h-[500px]">
          
          {/* OVERVIEW (The 6 Cards) */}
          {!selectedSituation && (
            <div ref={gridContainerRef} className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 absolute inset-0">
              {situations.map((sit) => (
                <div 
                  key={sit.id}
                  className={`situation-card relative w-full p-8 md:p-10 rounded-md bg-[#050505]/60 backdrop-blur-md border flex flex-col items-center justify-center text-center transition-all duration-500 ease-out cursor-pointer z-10
                    ${hoveredSituation === sit.id 
                      ? 'border-[#c79c6e]/80 shadow-[0_0_30px_rgba(199,156,110,0.15)] bg-black scale-[1.01]' 
                      : 'border-white/10 hover:border-white/20'
                    }
                  `}
                  onMouseEnter={() => setHoveredSituation(sit.id)}
                  onMouseLeave={() => setHoveredSituation(null)}
                  onClick={() => handleSelect(sit)}
                >
                  <p className={`font-serif text-[1.15rem] leading-relaxed whitespace-pre-line transition-colors duration-500 ${hoveredSituation === sit.id ? 'text-white' : 'text-white/70'}`}>
                    {sit.text}
                  </p>

                  {/* Bottom Link (Appears on Hover) */}
                  <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 overflow-hidden transition-all duration-500 ${hoveredSituation === sit.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center gap-2 text-[#c79c6e] whitespace-nowrap mt-4">
                      <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">EXPLORE THIS</span>
                      <ArrowRight size={14} weight="bold" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DETAILED VIEW (Curated Collection) */}
          {selectedSituation && (
            <div ref={detailContainerRef} className="w-full absolute inset-0 pt-4 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {curatedContent.map((content) => (
                  <div key={content.id} className="group cursor-pointer">
                    {/* Thumbnail */}
                    <div className="w-full aspect-[4/3] bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden relative mb-4 transition-all duration-500 group-hover:border-[#c79c6e]/50">
                      <img 
                        src={content.image} 
                        alt={content.title} 
                        className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                      
                      {/* Top Right Bookmark */}
                      <button className="absolute top-4 right-4 z-20 text-white/50 hover:text-[#c79c6e] transition-colors">
                        <BookmarkSimple size={20} weight="light" />
                      </button>

                      {/* Center Play Icon (if video) */}
                      {content.hasPlay && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle size={40} weight="light" className="text-white/80 group-hover:text-[#c79c6e] group-hover:scale-110 transition-all duration-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-2 block">
                      {content.type} &nbsp;•&nbsp; {content.duration}
                    </span>
                    <h4 className="font-serif text-[1.25rem] text-white/90 font-light leading-snug group-hover:text-white transition-colors duration-300 pr-4">
                      {content.title}
                    </h4>
                  </div>
                ))}
              </div>

              <div className="w-full flex justify-center mt-4">
                <button className="flex items-center gap-2 text-[#c79c6e] hover:text-white transition-colors duration-300">
                  <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">VIEW THE FULL COLLECTION</span>
                  <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Text */}
        <div className="w-full flex justify-center mt-auto pt-16 opacity-70 z-10">
          <div className="flex flex-col items-center gap-3">
            <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e]">
              OR SEE WHAT'S NEW
            </span>
            <ArrowDown size={14} className="text-[#c79c6e] animate-bounce" weight="light" />
          </div>
        </div>

      </div>
    </section>
  );
}
