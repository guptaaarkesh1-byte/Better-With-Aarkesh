import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  BookOpen, 
  Play, 
  Key, 
  ArrowRight,
  ArrowDown,
  PlayCircle,
  Sparkle,
  Target,
  Stack,
  ArrowsClockwise,
  Recycle
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Placeholders for video thumbnails
import videoThumb1 from '../../assets/PerspectivePage/recognition/emotional_exhaustion.png';
import videoThumb2 from '../../assets/PerspectivePage/recognition/comparison.png';
import videoThumb3 from '../../assets/PerspectivePage/recognition/holding_it_in.png';

// Import topics for the articles list
import { topics } from './QuestionsSection';

gsap.registerPlugin(ScrollTrigger);

const RadarIcon = ({ size }) => (
  <div style={{ width: size, height: size }} className="relative flex items-center justify-center scale-[1.3] opacity-80 group-hover:opacity-100 transition-opacity duration-300">
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-[70%] h-[70%]">
      <line x1="50" y1="50" x2="50" y2="10" />
      <line x1="50" y1="50" x2="85" y2="25" />
      <line x1="50" y1="50" x2="95" y2="60" />
      <line x1="50" y1="50" x2="75" y2="90" />
      <line x1="50" y1="50" x2="25" y2="90" />
      <line x1="50" y1="50" x2="5" y2="60" />
      <line x1="50" y1="50" x2="15" y2="25" />
      <polygon points="50,10 85,25 95,60 75,90 25,90 5,60 15,25" opacity="0.3" />
      <polygon points="50,15 75,30 70,60 50,75 40,75 30,50 35,35" fill="rgba(199,156,110,0.1)" stroke="#c79c6e" strokeWidth="1" />
    </svg>
    <span className="absolute -top-1 text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-[#c79c6e]">Personal Growth</span>
    <span className="absolute top-[20%] right-[-10%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-right w-12 text-[#c79c6e]">Relationships</span>
    <span className="absolute top-[50%] right-[-15%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-right w-12 text-[#c79c6e]">Health<br/>& Energy</span>
    <span className="absolute bottom-[10%] right-[-5%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-right w-12 text-[#c79c6e]">Finances</span>
    <span className="absolute -bottom-1 text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-[#c79c6e]">Work & Purpose</span>
    <span className="absolute bottom-[15%] left-[-15%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-left w-12 text-[#c79c6e]">Environment</span>
    <span className="absolute top-[50%] left-[-15%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-left w-12 text-[#c79c6e]">Fun &<br/>Recreation</span>
    <span className="absolute top-[20%] left-[-10%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-left w-12 text-[#c79c6e]">Spirituality</span>
  </div>
);

const StackIcon = ({ size }) => (
  <div style={{ width: size, height: size }} className="relative flex items-center justify-center scale-110 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-[60%] h-[60%] text-[#c79c6e]">
      <ellipse cx="50" cy="30" rx="30" ry="10" strokeOpacity="0.8" />
      <ellipse cx="50" cy="50" rx="30" ry="10" strokeOpacity="0.5" />
      <ellipse cx="50" cy="70" rx="30" ry="10" strokeOpacity="0.2" />
    </svg>
  </div>
);

const CBTIcon = ({ size }) => (
  <div style={{ width: size, height: size }} className="relative flex items-center justify-center scale-110 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
    <Recycle className="w-[60%] h-[60%] text-[#c79c6e]" weight="regular" />
    <span className="absolute top-[5%] text-[0.3rem] tracking-[0.2em] uppercase opacity-40 text-[#c79c6e]">Thoughts</span>
    <span className="absolute bottom-[10%] left-[5%] text-[0.3rem] tracking-[0.2em] uppercase opacity-40 text-[#c79c6e]">Feelings</span>
    <span className="absolute bottom-[10%] right-[5%] text-[0.3rem] tracking-[0.2em] uppercase opacity-40 text-[#c79c6e]">Actions</span>
  </div>
);

const formats = [
  {
    id: 'latest',
    icon: Sparkle,
    title: 'LATEST',
    count: 'NEW ARRIVALS',
    desc: 'The most recent\nperspectives and tools.',
    action: 'EXPLORE LATEST'
  },
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

const articles = [
  {
    id: 1,
    duration: '5 MIN',
    title: 'The hidden cost of holding it all together'
  },
  {
    id: 2,
    duration: '7 MIN',
    title: 'Why we apologize when we are not wrong'
  },
  {
    id: 3,
    duration: '4 MIN',
    title: 'Rest as a necessary boundary'
  }
];

const reflectionTools = [
  {
    id: 1,
    duration: '15 MIN',
    title: 'Wheel of Life',
    desc: 'Map the areas of life that\nshape your overall well-being.',
    icon: RadarIcon
  },
  {
    id: 2,
    duration: '10 MIN',
    title: 'Mindset Reflection',
    desc: 'Explore the patterns shaping\nyour thoughts and choices.',
    icon: StackIcon
  },
  {
    id: 3,
    duration: '20 MIN',
    title: 'CBT-Inspired Tools',
    desc: 'Practical frameworks to understand\nand shift unhelpful cycles.',
    icon: CBTIcon
  }
];

export default function FormatExploreSection() {
  const navigate = useNavigate();
  const [hoveredFormat, setHoveredFormat] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [dbVideos, setDbVideos] = useState([]);
  
  const containerRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const contentContainerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/videos/published`)
      .then(res => res.json())
      .then(data => setDbVideos(data))
      .catch(err => console.error('Error fetching videos:', err));
  }, []);

  const displayVideos = dbVideos.length > 0 ? dbVideos : videos;

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.format-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }
    )
    .fromTo('.format-card', 
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.3, 
        stagger: 0.1,
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
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setSelectedFormat(formatId);
        // Fade in new content
        gsap.fromTo(contentContainerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', delay: 0.1 }
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
          { opacity: 1, y: 0, duration: 0.3, delay: 0.1 }
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
      <div className="w-full flex-1 relative md:min-h-[70vh]">
        
        {/* OVERVIEW (The 4 Cards) */}
        {!selectedFormat && (
          <div ref={cardsContainerRef} className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:absolute md:inset-0">
            {formats.map((format) => (
              <div 
                key={format.id}
                className={`format-card relative w-full aspect-[4/5] px-8 py-8 pb-14 md:px-8 md:py-8 md:pb-16 rounded-md bg-[#050505]/60 backdrop-blur-md border flex flex-col items-center justify-center text-center transition-all duration-500 ease-out cursor-pointer z-10
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
                  {format.id === 'watch' ? `${displayVideos.length} VIDEO${displayVideos.length !== 1 ? 'S' : ''}` : format.count}
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

        {/* DETAILED VIEW (The Videos/Articles/Tools) */}
        {selectedFormat && (
          <div ref={contentContainerRef} className="w-full md:absolute md:inset-0 pt-4">
            
            {/* LATEST TAB */}
            {selectedFormat === 'latest' && (
              <div className="flex flex-col h-full animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mb-12">
                  {[articles[0], displayVideos[0], reflectionTools[0]].map((item, idx) => (
                    <div key={`latest-${idx}`} className="group cursor-pointer">
                      <div className="w-full aspect-[16/10] bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden relative mb-4 transition-all duration-500 group-hover:border-[#c79c6e]/50">
                        {item.image ? (
                           <>
                             <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80" />
                             <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                             <div className="absolute inset-0 flex items-center justify-center">
                               <PlayCircle size={40} weight="light" className="text-white/80 group-hover:text-[#c79c6e] group-hover:scale-110 transition-all duration-500" />
                             </div>
                           </>
                        ) : (
                           <div className="absolute inset-0 bg-[#050505] flex items-center justify-center p-6 text-white/20 group-hover:text-[#c79c6e]/20 transition-colors">
                             <Sparkle size={48} weight="thin" />
                           </div>
                        )}
                      </div>
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-2 block">
                        LATEST &nbsp;•&nbsp; {item.duration}
                      </span>
                      <h4 className="font-serif text-[1.35rem] text-white/90 font-light leading-snug group-hover:text-white transition-colors duration-300 pr-4">
                        {item.title}
                      </h4>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <button className="flex items-center gap-2 text-[#c79c6e] hover:text-white transition-colors duration-300">
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">VIEW ALL LATEST</span>
                    <ArrowRight size={14} weight="bold" />
                  </button>
                </div>
              </div>
            )}

            {/* WATCH TAB */}
            {selectedFormat === 'watch' && (
              <div className="flex flex-col h-full animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mb-12">
                  {displayVideos.slice(0, 3).map((video) => (
                    <div 
                      key={video.id || video._id} 
                      className="group cursor-pointer"
                      onClick={() => navigate('/videos')}
                    >
                      <div className="w-full aspect-[16/10] bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden relative mb-4 transition-all duration-500 group-hover:border-[#c79c6e]/50">
                        <img 
                          src={video.image || video.thumbnailUrl} 
                          alt={video.title} 
                          className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle size={40} weight="light" className="text-white/80 group-hover:text-[#c79c6e] group-hover:scale-110 transition-all duration-500" />
                        </div>
                      </div>
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
                  <button 
                    onClick={() => navigate('/videos')}
                    className="flex items-center gap-2 text-[#c79c6e] hover:text-white transition-colors duration-300"
                  >
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">VIEW ALL VIDEOS</span>
                    <ArrowRight size={14} weight="bold" />
                  </button>
                </div>
              </div>
            )}

            {/* READ TAB */}
            {selectedFormat === 'read' && (
              <div className="flex flex-col h-full animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mb-12">
                  {articles.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                      <div className="w-full aspect-[16/10] bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden relative mb-4 transition-all duration-500 group-hover:border-[#c79c6e]/50">
                        <div className="absolute inset-0 bg-[#050505] flex items-center justify-center p-6 text-white/20 group-hover:text-[#c79c6e]/20 transition-colors">
                           <BookOpen size={48} weight="thin" />
                        </div>
                      </div>
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-2 block">
                        ARTICLE &nbsp;•&nbsp; {item.duration}
                      </span>
                      <h4 className="font-serif text-[1.35rem] text-white/90 font-light leading-snug group-hover:text-white transition-colors duration-300 pr-4">
                        {item.title}
                      </h4>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <a href="/articles?view=all" className="flex items-center gap-2 text-[#c79c6e] hover:text-white transition-colors duration-300">
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">VIEW ALL 24 ARTICLES</span>
                    <ArrowRight size={14} weight="bold" />
                  </a>
                </div>
              </div>
            )}

            {/* TOOL TAB */}
            {selectedFormat === 'tool' && (
              <div className="flex flex-col h-full animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mb-12">
                  {reflectionTools.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                      <div className="w-full aspect-[4/5] bg-[#050505]/60 backdrop-blur-md rounded-md border border-white/10 overflow-hidden relative mb-4 transition-all duration-500 group-hover:border-[#c79c6e]/80 group-hover:shadow-[0_0_30px_rgba(199,156,110,0.15)] group-hover:bg-black group-hover:scale-[1.02] flex flex-col items-center justify-center p-8 text-center">
                        <div className="text-white/40 group-hover:text-[#c79c6e] transition-colors duration-500 mb-8 w-full flex justify-center">
                           {item.icon ? <item.icon size={160} weight="thin" /> : <Key size={80} weight="thin" />}
                        </div>
                        <h4 className="font-serif text-[1.5rem] md:text-[1.75rem] text-white/90 font-light leading-snug group-hover:text-white transition-colors duration-300 mb-4">
                          {item.title}
                        </h4>
                        <p className="font-sans text-[0.75rem] text-white/40 leading-relaxed whitespace-pre-line group-hover:text-white/70 transition-colors duration-300">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <button className="flex items-center gap-2 text-[#c79c6e] hover:text-white transition-colors duration-300">
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">VIEW ALL 3 TOOLS</span>
                    <ArrowRight size={14} weight="bold" />
                  </button>
                </div>
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
