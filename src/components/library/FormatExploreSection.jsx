import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  BookOpen, 
  Play, 
  Key, 
  ArrowRight,
  ArrowDown,
  PlayCircle
} from '@phosphor-icons/react';

// Placeholders for video thumbnails
import videoThumb1 from '../../assets/PerspectivePage/recognition/emotional_exhaustion.png';
import videoThumb2 from '../../assets/PerspectivePage/recognition/comparison.png';
import videoThumb3 from '../../assets/PerspectivePage/recognition/holding_it_in.png';

// Import topics for the articles list
import { topics } from './QuestionsSection';

gsap.registerPlugin(ScrollTrigger);

const formats = [
  {
    id: 'read',
    icon: BookOpen,
    title: 'READ',
    count: '12 ARTICLES',
    desc: 'Ideas to sit with at\nyour own pace.',
    action: 'EXPLORE ARTICLES'
  },
  {
    id: 'watch',
    icon: Play,
    title: 'WATCH',
    count: '10 VIDEOS',
    desc: 'Perspectives spoken\nand explored.',
    action: 'EXPLORE VIDEOS'
  },
  {
    id: 'tool',
    icon: Key,
    title: 'USE A TOOL',
    count: '3 REFLECTION TOOLS',
    desc: 'A structured way to\nexamine what is\nhappening.',
    action: 'EXPLORE TOOLS'
  }
];

const videos = [
  {
    id: 1,
    image: videoThumb1,
    duration: '8 MIN',
    title: 'When clarity asks something of you'
  },
  {
    id: 2,
    image: videoThumb2,
    duration: '11 MIN',
    title: 'The difference between being heard and being agreed with'
  },
  {
    id: 3,
    image: videoThumb3,
    duration: '7 MIN',
    title: 'Why familiar patterns can feel safer than healthy ones'
  }
];

export default function FormatExploreSection() {
  const [hoveredFormat, setHoveredFormat] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const containerRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const contentContainerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.format-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.format-card', 
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        stagger: 0.15,
        ease: 'power3.out',
      },
      "-=0.5"
    );
  }, { scope: containerRef });

  // Handle transition between overview and specific format view
  const handleFormatSelect = (formatId) => {
    const tl = gsap.timeline();
    
    // Fade out cards
    tl.to(cardsContainerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        setSelectedFormat(formatId);
        // Fade in new content
        gsap.fromTo(contentContainerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 }
        );
      }
    });
  };

  const handleTabClick = (formatId) => {
    if (formatId === selectedFormat) return;
    
    gsap.to(contentContainerRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.3,
      onComplete: () => {
        setSelectedFormat(formatId);
        gsap.fromTo(contentContainerRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, delay: 0.1 }
        );
      }
    });
  };

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-32 pb-12 flex flex-col items-center px-6 md:px-16 lg:px-24 border-t border-white/5">
      
      <div className="w-full max-w-5xl flex flex-col flex-1 h-full">
        {/* Header Area */}
        <div className="format-header mb-12 flex flex-col items-start z-10 opacity-0">
        <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
          EXPLORE BY FORMAT
        </span>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1] mb-8">
          Choose the form that<br />
          meets you where you are.
        </h2>

        {/* Tabs (Only visible when a format is selected) */}
        {selectedFormat && (
          <div className="flex items-center gap-8 mt-2 animate-in fade-in duration-500">
            {formats.map(f => (
              <button 
                key={f.id}
                onClick={() => handleTabClick(f.id)}
                className={`font-sans text-[0.7rem] uppercase tracking-widest font-semibold pb-2 border-b transition-all duration-300
                  ${selectedFormat === f.id 
                    ? 'text-[#c79c6e] border-[#c79c6e]' 
                    : 'text-white/40 border-transparent hover:text-white/70'
                  }
                `}
              >
                {f.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 relative min-h-[70vh]">
        
        {/* OVERVIEW (The 3 Cards) */}
        {!selectedFormat && (
          <div ref={cardsContainerRef} className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 absolute inset-0">
            {formats.map((format) => (
              <div 
                key={format.id}
                className={`format-card relative w-full aspect-[4/5] p-8 rounded-md bg-[#050505]/60 backdrop-blur-md border flex flex-col items-center justify-center text-center transition-all duration-500 ease-out cursor-pointer z-10
                  ${hoveredFormat === format.id 
                    ? 'border-[#c79c6e]/80 shadow-[0_0_30px_rgba(199,156,110,0.15)] bg-black scale-[1.02]' 
                    : 'border-white/10 hover:border-white/20'
                  }
                `}
                onMouseEnter={() => setHoveredFormat(format.id)}
                onMouseLeave={() => setHoveredFormat(null)}
                onClick={() => handleFormatSelect(format.id)}
              >
                <format.icon 
                  size={32} 
                  weight="light" 
                  className={`mb-6 transition-colors duration-500 ${hoveredFormat === format.id ? 'text-[#c79c6e]' : 'text-white/70'}`} 
                />
                <h3 className="font-serif text-2xl text-white font-light tracking-wide mb-2">{format.title}</h3>
                <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-6">
                  {format.count}
                </span>
                
                <p className={`font-sans text-[0.7rem] font-light leading-relaxed whitespace-pre-line transition-colors duration-500 ${hoveredFormat === format.id ? 'text-white/90' : 'text-white/20'}`}>
                  {format.desc}
                </p>

                {/* Bottom Link (Appears on Hover) */}
                <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 overflow-hidden transition-all duration-500 ${hoveredFormat === format.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="flex items-center gap-2 text-[#c79c6e] whitespace-nowrap">
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">{format.action}</span>
                    <ArrowRight size={14} weight="bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DETAILED VIEW (The Videos/Articles) */}
        {selectedFormat && (
          <div ref={contentContainerRef} className="w-full absolute inset-0 pt-4">
            {selectedFormat === 'watch' ? (
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mb-12">
                  {videos.map((video) => (
                    <div key={video.id} className="group cursor-pointer">
                      {/* Video Thumbnail */}
                      <div className="w-full aspect-[16/10] bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden relative mb-4 transition-all duration-500 group-hover:border-[#c79c6e]/50">
                        <img 
                          src={video.image} 
                          alt={video.title} 
                          className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle size={40} weight="light" className="text-white/80 group-hover:text-[#c79c6e] group-hover:scale-110 transition-all duration-500" />
                        </div>
                      </div>
                      
                      {/* Video Info */}
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-2 block">
                        VIDEO &nbsp;•&nbsp; {video.duration}
                      </span>
                      <h4 className="font-serif text-[1.35rem] text-white/90 font-light leading-snug group-hover:text-white transition-colors duration-300 pr-4">
                        {video.title}
                      </h4>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button className="flex items-center gap-2 text-[#c79c6e] hover:text-white transition-colors duration-300">
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">VIEW ALL 10 VIDEOS</span>
                    <ArrowRight size={14} weight="bold" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center border border-white/5 bg-[#050505]/30 rounded-md">
                <span className="font-sans text-xs uppercase tracking-widest text-white/30">
                  {selectedFormat} content coming soon
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Text (Only visible on overview) */}
      {!selectedFormat && (
        <div className="w-full flex justify-center mt-auto pt-16 opacity-70">
          <div className="flex flex-col items-center gap-3">
            <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e]">
              OR BEGIN WITH WHAT YOU'RE CARRYING
            </span>
            <ArrowDown size={14} className="text-[#c79c6e] animate-bounce" weight="light" />
          </div>
        </div>
      )}

      </div>
    </section>
  );
}
