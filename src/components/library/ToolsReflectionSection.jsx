import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  ArrowRight,
  BookmarkSimple,
  Target,
  Stack,
  Recycle
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

const WheelOfLifeDiagram = () => (
  <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
    <div className="absolute inset-0 rounded-full border border-[#c79c6e]/30" />
    <div className="absolute inset-[16.6%] rounded-full border border-[#c79c6e]/20" />
    <div className="absolute inset-[33.3%] rounded-full border border-[#c79c6e]/15" />
    <div className="absolute inset-[50%] rounded-full border border-[#c79c6e]/10" />
    <div className="absolute inset-[66.6%] rounded-full border border-[#c79c6e]/5" />
    
    {/* Spokes */}
    <div className="absolute w-full h-[1px] bg-[#c79c6e]/30 rotate-0" />
    <div className="absolute w-full h-[1px] bg-[#c79c6e]/30 rotate-45" />
    <div className="absolute w-full h-[1px] bg-[#c79c6e]/30 rotate-90" />
    <div className="absolute w-full h-[1px] bg-[#c79c6e]/30 rotate-135" />

    {/* Labels */}
    <span className="absolute -top-8 text-[0.45rem] uppercase tracking-widest text-[#c79c6e] whitespace-nowrap">Personal Growth</span>
    <span className="absolute top-[10%] -right-16 text-[0.45rem] uppercase tracking-widest text-[#c79c6e] whitespace-nowrap">Relationships</span>
    <span className="absolute top-[50%] -right-20 -translate-y-1/2 text-[0.45rem] uppercase tracking-widest text-[#c79c6e] text-center whitespace-nowrap">Health<br/>& Energy</span>
    <span className="absolute bottom-[10%] -right-12 text-[0.45rem] uppercase tracking-widest text-[#c79c6e] whitespace-nowrap">Finances</span>
    <span className="absolute -bottom-8 text-[0.45rem] uppercase tracking-widest text-[#c79c6e] whitespace-nowrap">Work & Purpose</span>
    <span className="absolute bottom-[10%] -left-16 text-[0.45rem] uppercase tracking-widest text-[#c79c6e] whitespace-nowrap">Environment</span>
    <span className="absolute top-[50%] -left-20 -translate-y-1/2 text-[0.45rem] uppercase tracking-widest text-[#c79c6e] text-center whitespace-nowrap">Fun &<br/>Recreation</span>
    <span className="absolute top-[10%] -left-12 text-[0.45rem] uppercase tracking-widest text-[#c79c6e] whitespace-nowrap">Spirituality</span>
    
    {/* Center highlighted shape - matching screenshot */}
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
      <polygon 
        points="50,50 50,15 80,20 90,50 75,85 50,75 25,75 20,50 30,30" 
        fill="#c79c6e" 
        fillOpacity="0.15" 
        stroke="#c79c6e" 
        strokeWidth="0.5" 
      />
    </svg>
  </div>
);

const MindsetDiagram = () => (
  <div className="relative w-full max-w-[200px] aspect-square flex flex-col items-center justify-center gap-2">
    <div className="w-[140px] h-[40px] rounded-[100%] border border-[#c79c6e]/40 absolute top-10 shadow-[0_10px_20px_rgba(199,156,110,0.1)]" />
    <div className="w-[160px] h-[50px] rounded-[100%] border border-[#c79c6e]/20 absolute top-20" />
    <div className="w-[180px] h-[60px] rounded-[100%] border border-[#c79c6e]/10 absolute top-32" />
  </div>
);

const CBTDiagram = () => (
  <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center">
    <Recycle size={140} weight="thin" className="text-[#c79c6e]/40" />
    <span className="absolute top-[15%] text-[0.4rem] uppercase tracking-widest text-[#c79c6e]">Thoughts</span>
    <span className="absolute bottom-[25%] right-[10%] text-[0.4rem] uppercase tracking-widest text-[#c79c6e]">Actions</span>
    <span className="absolute bottom-[25%] left-[10%] text-[0.4rem] uppercase tracking-widest text-[#c79c6e]">Feelings</span>
  </div>
);

const tools = [
  {
    id: 'wheel',
    icon: Target,
    diagram: <WheelOfLifeDiagram />,
    title: 'Wheel of Life',
    desc: 'Map the areas of life that\nshape your overall well-being.',
    duration: '8 MIN',
    previewTitle: 'See where your attention\nis going — and where it\nmay be missing.',
    previewDesc: 'A reflective exercise,\nnot a diagnostic assessment.'
  },
  {
    id: 'mindset',
    icon: Stack,
    diagram: <MindsetDiagram />,
    title: 'Mindset Reflection',
    desc: 'Explore the patterns shaping\nyour thoughts and choices.',
    duration: '10 MIN',
    previewTitle: 'Uncover the beliefs\nthat drive your daily\nreactions.',
    previewDesc: 'A guided journey into your internal narrative.'
  },
  {
    id: 'cbt',
    icon: Recycle,
    diagram: <CBTDiagram />,
    title: 'CBT-Inspired Tools',
    desc: 'Practical frameworks to understand\nand shift unhelpful cycles.',
    duration: '15 MIN',
    previewTitle: 'Break down the cycle\nof thoughts, feelings,\nand behaviors.',
    previewDesc: 'Actionable steps to reframe challenges.'
  }
];

export default function ToolsReflectionSection() {
  const [hoveredTool, setHoveredTool] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  
  const containerRef = useRef(null);
  const gridContainerRef = useRef(null);
  const previewContainerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.tools-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.tool-card', 
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

  const handleSelect = (tool) => {
    if (window.innerWidth < 768) {
      setSelectedTool(selectedTool === tool.id ? null : tool.id);
      return;
    }

    if (selectedTool === tool.id) return;

    if (!selectedTool) {
      // Transition from Overview to Preview
      gsap.to(gridContainerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          setSelectedTool(tool.id);
          gsap.fromTo(previewContainerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 }
          );
        }
      });
    } else {
      // Transition between tools in Preview state
      gsap.to('.preview-content', {
        opacity: 0,
        y: 10,
        duration: 0.3,
        onComplete: () => {
          setSelectedTool(tool.id);
          gsap.fromTo('.preview-content',
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, delay: 0.1 }
          );
        }
      });
    }
  };

  const activeToolData = tools.find(t => t.id === selectedTool);

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-32 pb-12 flex flex-col items-center px-6 md:px-16 lg:px-24 border-t border-white/5">
      
      <div className="w-full max-w-5xl flex flex-col flex-1 h-full relative">
        {/* Header Area */}
        <div className="tools-header mb-12 flex flex-col items-start z-10 opacity-0 w-full relative">
          <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
            TOOLS FOR REFLECTION
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1] mb-6">
            Some things become clearer<br />
            when you can see them laid out.
          </h2>
        </div>

        {/* Main Content Area */}
        <div className="w-full flex-1 relative min-h-[550px]">
          
          {/* OVERVIEW (The 3 Cards) */}
          <div ref={gridContainerRef} className={`w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:absolute md:inset-0 ${selectedTool ? 'md:hidden' : ''}`}>
            {tools.map((tool) => (
              <div 
                key={tool.id}
                className={`tool-card relative w-full h-auto min-h-[500px] md:h-[500px] rounded-md bg-[#050505]/60 backdrop-blur-md border flex flex-col items-center p-8 text-center transition-all duration-500 ease-out cursor-pointer z-10
                    ${hoveredTool === tool.id 
                      ? 'border-[#c79c6e]/80 shadow-[0_0_30px_rgba(199,156,110,0.15)] bg-black scale-[1.02]' 
                      : 'border-white/10 hover:border-white/20'
                    }
                  `}
                  onMouseEnter={() => setHoveredTool(tool.id)}
                  onMouseLeave={() => setHoveredTool(null)}
                  onClick={() => handleSelect(tool)}
                >
                  {/* Diagram Area */}
                  <div className="w-full h-[220px] flex items-center justify-center mb-6 scale-75 opacity-70 shrink-0">
                    {tool.diagram}
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-serif text-[1.4rem] text-white font-light tracking-wide mb-3">{tool.title}</h3>
                  <p className="font-sans text-[0.65rem] font-light leading-relaxed whitespace-pre-line text-white/50 mb-auto">
                    {tool.desc}
                  </p>

                  {/* Bottom Link (Changes on Hover) */}
                  <div className="hidden md:flex w-full h-[60px] flex-col justify-end items-center gap-3 shrink-0 mt-4">
                    <div className={`overflow-hidden transition-all duration-500 ${hoveredTool === tool.id ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <span className="font-sans text-[0.55rem] uppercase tracking-widest font-semibold text-[#c79c6e]">
                        REFLECTION TOOL &nbsp;•&nbsp; {tool.duration}
                      </span>
                    </div>
                    
                    <div className={`flex items-center gap-2 transition-colors duration-300 ${hoveredTool === tool.id ? 'text-[#c79c6e]' : 'text-white/30'}`}>
                      {hoveredTool === tool.id && <span className="font-sans text-[0.6rem] uppercase tracking-widest font-medium">PREVIEW TOOL</span>}
                      <ArrowRight size={14} weight="light" />
                    </div>
                  </div>

                  {/* Mobile Accordion Content */}
                  <div 
                    className={`md:hidden grid transition-[grid-template-rows,opacity,margin] duration-500 w-full mt-4 ${
                      selectedTool === tool.id 
                        ? 'grid-rows-[1fr] opacity-100 mb-8' 
                        : 'grid-rows-[0fr] opacity-0 mb-0'
                    }`}
                    onClick={(e) => e.stopPropagation()} 
                  >
                    <div className="overflow-hidden flex flex-col w-full border-t border-white/10 pt-6 mt-2">
                      <span className="font-sans text-[0.55rem] uppercase tracking-[0.2em] font-semibold text-[#c79c6e] mb-4 block">
                        {tool.title}
                      </span>
                      
                      <h4 className="font-serif text-[1.35rem] text-white/90 font-light leading-[1.25] whitespace-pre-line mb-6">
                        {tool.previewTitle}
                      </h4>
                      
                      <p className="font-sans text-[0.65rem] font-light leading-relaxed whitespace-pre-line text-white/60 mb-8">
                        {tool.previewDesc}
                      </p>

                      <div className="flex flex-col gap-4 w-full">
                        <button className="flex items-center justify-center gap-3 px-6 py-4 bg-transparent border border-[#c79c6e] rounded-sm hover:bg-[#c79c6e]/10 transition-colors w-full group">
                          <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">BEGIN REFLECTION</span>
                          <ArrowRight size={14} weight="bold" className="text-[#c79c6e]" />
                        </button>
                        
                        <button className="flex items-center justify-center gap-3 px-6 py-4 bg-transparent border border-white/10 rounded-sm w-full">
                          <BookmarkSimple size={14} weight="light" className="text-white/50" />
                          <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium text-white/50">SAVE TO MY LIBRARY</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          {/* DETAILED VIEW (Preview Card - DESKTOP ONLY) */}
          {selectedTool && (
            <div ref={previewContainerRef} className="hidden md:flex w-full md:absolute md:inset-0 pt-4 flex-col opacity-0">
              
              {/* The Big Preview Card */}
              <div className="w-full bg-[#050505]/80 backdrop-blur-md border border-[#c79c6e]/30 rounded-md p-12 flex flex-col md:flex-row relative overflow-hidden min-h-[450px]">
                
                {/* Left Side: Content */}
                <div className="w-full md:w-[45%] flex flex-col justify-center preview-content z-10">
                  <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-[#c79c6e] mb-6">
                    {activeToolData.title}
                  </span>
                  
                  <h3 className="font-serif text-3xl md:text-[2.25rem] text-white/90 font-light leading-[1.15] whitespace-pre-line mb-8">
                    {activeToolData.previewTitle}
                  </h3>
                  
                  <p className="font-sans text-[0.7rem] font-light leading-relaxed whitespace-pre-line text-white/60 mb-12 max-w-sm">
                    {activeToolData.previewDesc}
                  </p>

                  <div className="flex flex-col gap-4 w-fit">
                    <button className="flex items-center justify-center gap-3 px-8 py-3 bg-transparent border border-[#c79c6e] rounded-sm hover:bg-[#c79c6e]/10 transition-colors group">
                      <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">BEGIN REFLECTION</span>
                      <ArrowRight size={14} weight="bold" className="text-[#c79c6e] group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button className="flex items-center justify-center gap-3 px-8 py-3 bg-transparent border border-white/10 rounded-sm hover:border-[#c79c6e]/50 transition-colors group">
                      <BookmarkSimple size={14} weight="light" className="text-white/50 group-hover:text-[#c79c6e] transition-colors" />
                      <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium text-white/50 group-hover:text-[#c79c6e] transition-colors">SAVE TO MY LIBRARY</span>
                    </button>
                  </div>
                </div>

                {/* Right Side: Diagram Graphic */}
                <div className="w-full md:w-[55%] flex items-center justify-center preview-content mt-12 md:mt-0 relative">
                  <div className="w-full max-w-[400px] flex justify-center items-center scale-110 opacity-90">
                     {activeToolData.diagram}
                  </div>
                </div>
              </div>

              {/* Bottom Tabs for switching tools */}
              <div className="w-full flex flex-wrap items-center justify-center gap-4 mt-8">
                {tools.map(tool => (
                  <button 
                    key={tool.id}
                    onClick={() => handleSelect(tool)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-sm border transition-all duration-300
                      ${selectedTool === tool.id 
                        ? 'border-[#c79c6e]/50 bg-[#c79c6e]/5 shadow-[0_0_15px_rgba(199,156,110,0.1)]' 
                        : 'border-white/10 bg-[#050505]/40 hover:border-white/30'
                      }
                    `}
                  >
                    <tool.icon size={20} weight="light" className={selectedTool === tool.id ? 'text-[#c79c6e]' : 'text-white/40'} />
                    <span className={`font-sans text-[0.65rem] uppercase tracking-widest font-medium ${selectedTool === tool.id ? 'text-[#c79c6e]' : 'text-white/40'}`}>
                      {tool.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Explore All Link (Only visible in overview) */}
        {!selectedTool && (
          <div className="w-full flex justify-center mt-auto pt-16 z-10">
            <button className="flex items-center gap-2 text-[#c79c6e] hover:text-white transition-colors duration-300">
              <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">EXPLORE ALL TOOLS</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
