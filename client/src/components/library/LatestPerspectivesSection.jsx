import React, { useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  ArrowRight,
  BookmarkSimple,
  PlayCircle
} from '@phosphor-icons/react';

// Placeholders for content thumbnails
import thumb1 from '../../assets/PerspectivePage/recognition/emotional_exhaustion.png';
import thumb2 from '../../assets/PerspectivePage/recognition/comparison.png';
import thumb3 from '../../assets/PerspectivePage/recognition/holding_it_in.png';

gsap.registerPlugin(ScrollTrigger);

const allPerspectives = [
  {
    id: 1,
    type: 'article',
    format: 'ARTICLE',
    duration: '7 MIN',
    title: 'Why insight alone does not change a pattern',
    quote: 'Understanding a pattern is\nnot the same as changing it.',
    image: thumb1
  },
  {
    id: 2,
    type: 'video',
    format: 'VIDEO',
    duration: '9 MIN',
    title: 'The familiarity that keeps pulling you back',
    quote: 'We return to what we know, even if it hurts.',
    image: thumb2
  },
  {
    id: 3,
    type: 'article',
    format: 'ARTICLE',
    duration: '6 MIN',
    title: 'A person can be sincere and still be wrong',
    quote: 'Honesty does not make every\ninterpretation accurate.',
    image: thumb3
  },
  {
    id: 4,
    type: 'video',
    format: 'VIDEO',
    duration: '8 MIN',
    title: 'When clarity asks something of you',
    quote: 'Seeing the truth means you\nmust eventually act on it.',
    image: thumb1
  },
  {
    id: 5,
    type: 'video',
    format: 'VIDEO',
    duration: '11 MIN',
    title: 'Why the same conflict keeps returning',
    quote: 'An unresolved core will\nalways find a new surface.',
    image: thumb2
  }
];

export default function LatestPerspectivesSection() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [hoveredCard, setHoveredCard] = useState(null);
  
  const containerRef = useRef(null);
  const gridContainerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.latest-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.latest-card', 
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

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    gsap.to(gridContainerRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.3,
      onComplete: () => {
        setActiveTab(tab);
        gsap.fromTo(gridContainerRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, delay: 0.1 }
        );
      }
    });
  };

  const displayItems = useMemo(() => {
    if (activeTab === 'ALL') return allPerspectives.slice(0, 3);
    if (activeTab === 'READ') return allPerspectives.filter(p => p.type === 'article').slice(0, 3);
    if (activeTab === 'WATCH') return allPerspectives.filter(p => p.type === 'video').slice(0, 3);
    return [];
  }, [activeTab]);

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-32 pb-12 flex flex-col items-center px-6 md:px-16 lg:px-24 border-t border-white/5">
      
      <div className="w-full max-w-6xl flex flex-col flex-1 h-full">
        {/* Header Area */}
        <div className="latest-header mb-12 flex flex-col items-start z-10 opacity-0 w-full relative">
          
          <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
            LATEST PERSPECTIVES
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1] mb-10">
            New ways to look at<br />
            what may already feel familiar.
          </h2>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-white/10 w-full md:w-auto pr-8">
            {['ALL', 'READ', 'WATCH'].map(tab => (
              <button 
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`font-sans text-[0.65rem] uppercase tracking-widest font-semibold pb-3 border-b-2 transition-all duration-300 relative translate-y-[1px]
                  ${activeTab === tab 
                    ? 'text-[#c79c6e] border-[#c79c6e]' 
                    : 'text-white/40 border-transparent hover:text-white/70'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full flex-1 relative md:min-h-[450px]">
          <div ref={gridContainerRef} className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:absolute md:inset-0">
            {displayItems.map((item) => (
              <div 
                key={item.id}
                className={`latest-card relative w-full h-[400px] rounded-sm bg-[#050505]/60 backdrop-blur-md border flex flex-col overflow-hidden transition-all duration-500 ease-out cursor-pointer z-10
                  ${hoveredCard === item.id 
                    ? 'border-[#c79c6e]/80 shadow-[0_0_30px_rgba(199,156,110,0.15)] bg-black scale-[1.01]' 
                    : 'border-white/10 hover:border-white/20'
                  }
                `}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image / Hover Content Area */}
                <div className="relative w-full h-[55%] border-b border-white/10 overflow-hidden bg-[#0a0a0a]">
                  
                  {/* Default Image State */}
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className={`w-full h-full object-cover transition-all duration-700 absolute inset-0 ${hoveredCard === item.id ? 'opacity-10 scale-105' : 'opacity-60 scale-100'}`}
                  />
                  
                  {/* Default Icons */}
                  <div className={`absolute inset-0 transition-opacity duration-300 ${hoveredCard === item.id ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="absolute inset-0 bg-black/20" />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle size={40} weight="light" className="text-white/80" />
                      </div>
                    )}
                  </div>

                  {/* Bookmark Icon (Always visible) */}
                  <button className={`absolute top-4 right-4 z-20 transition-colors duration-300 ${hoveredCard === item.id ? 'text-[#c79c6e]' : 'text-white/50 hover:text-white'}`}>
                    <BookmarkSimple size={20} weight="light" />
                  </button>

                  {/* Hover State Content */}
                  <div className={`absolute inset-0 p-6 flex flex-col justify-center items-start transition-all duration-500 delay-100 z-10
                    ${hoveredCard === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}>
                    <p className="font-serif text-[1.1rem] leading-snug text-white/90 whitespace-pre-line mb-6">
                      {item.quote}
                    </p>
                    <div className="flex items-center gap-2 text-[#c79c6e]">
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold">
                        OPEN PERSPECTIVE
                      </span>
                      <ArrowRight size={12} weight="bold" />
                    </div>
                  </div>
                </div>
                
                {/* Info Area */}
                <div className="w-full h-[45%] p-6 flex flex-col justify-start">
                  <span className={`font-sans text-[0.6rem] uppercase tracking-widest font-semibold mb-3 block transition-colors duration-300 ${hoveredCard === item.id ? 'text-[#c79c6e]' : 'text-[#c79c6e]/80'}`}>
                    {item.format} &nbsp;•&nbsp; {item.duration}
                  </span>
                  <h4 className="font-serif text-[1.25rem] text-white/90 font-light leading-snug">
                    {item.title}
                  </h4>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Footer Link */}
        <div className="w-full flex justify-center mt-12 z-10">
          <button className="flex items-center gap-2 text-[#c79c6e] hover:text-white transition-colors duration-300">
            <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">
              {activeTab === 'WATCH' ? 'VIEW ALL VIDEOS' : activeTab === 'READ' ? 'VIEW ALL ARTICLES' : 'EXPLORE ALL PERSPECTIVES'}
            </span>
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>

      </div>
    </section>
  );
}
