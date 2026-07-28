import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  BookmarkSimple, 
  Clock, 
  ArrowRight,
  ArrowDown,
  X,
  PencilSimple,
  Heart,
  FolderSimple,
  CaretRight,
  BookOpenText,
  Check,
  Star
} from '@phosphor-icons/react';
import featuredImg from '../../assets/PerspectivePage/featured_perspective.png';
import boundariesImg from '../../assets/PerspectivePage/saved_boundaries.png';
import decisionsImg from '../../assets/PerspectivePage/saved_decisions.png';

const savedItems = [
  {
    id: 'self-awareness',
    category: 'SELF-AWARENESS',
    title: 'The gap between\nknowing and living.',
    image: featuredImg,
    readTime: '6 min read',
    savedTime: 'Saved 3 days ago'
  },
  {
    id: 'boundaries',
    category: 'BOUNDARIES',
    title: 'Not every "yes"\nis yours.',
    image: boundariesImg,
    readTime: '8 min read',
    savedTime: 'Saved 5 days ago'
  },
  {
    id: 'decisions',
    category: 'DECISIONS',
    title: 'Clarity comes\nfrom direction,\nnot motivation.',
    image: decisionsImg,
    readTime: '7 min read',
    savedTime: 'Saved 1 week ago'
  }
];

const footerPoints = [
  { icon: BookmarkSimple, title: "SAVED FOR LATER", desc: "Return when you're\nready. Nothing is lost." },
  { icon: PencilSimple, title: "ADD YOUR NOTES", desc: "Make it personal.\nCapture what matters\nto you." },
  { icon: Clock, title: "CONTINUE ANYTIME", desc: "Pick up exactly where\nyou left off." },
  { icon: Heart, title: "LET IT SINK IN", desc: "Good perspectives need\ntime to become real." },
  { icon: FolderSimple, title: "YOUR LIBRARY GROWS", desc: "The more you explore,\nthe more it reflects you." },
];

export default function SavedLibrarySection() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.saved-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.saved-card', 
      { opacity: 0, y: 40, filter: 'blur(5px)' },
      { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        duration: 1.2, 
        stagger: 0.1,
        ease: 'power3.out',
      },
      "+=0.4"
    );
  }, { scope: containerRef });

  return (
    <section id="saved-library" ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-20 pb-8 flex flex-col items-center border-t border-white/5">
      
      {/* Header */}
      <div className="saved-header text-center mb-8 flex flex-col items-center z-10 px-6 opacity-0">
        <h2 className="font-serif text-2xl md:text-4xl text-white font-light tracking-wide mb-4">
          Keep what speaks to you.<br/>
          Build a library that<br/>
          reflects your journey.
        </h2>
        <p className="font-sans text-white/50 text-xs md:text-sm font-light tracking-wide leading-relaxed">
          Save perspectives. Return to them.<br/>
          Let them work with you over time.
        </p>
      </div>

      {/* Content Container */}
      <div className="w-full max-w-[90rem] mx-auto px-6 md:px-12 mb-8 z-10">
        
        {/* Section Title & View All */}
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-bold text-[#c79c6e]">
            YOUR LIBRARY PREVIEW
          </span>
          <div className="flex items-center gap-2 text-[#c79c6e] cursor-pointer hover:opacity-80 transition-opacity">
            <span className="font-sans text-[0.6rem] uppercase tracking-wider font-semibold">View all</span>
            <ArrowRight size={12} weight="bold" />
          </div>
        </div>

        {/* Grid of Saved Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 group/grid">
          {savedItems.map((item, index) => {
            const isLastInRow = (index + 1) % 3 === 0;
            return (
            <div 
              key={item.id}
              className="
                saved-card relative group flex flex-col p-4 
                border border-white/10 rounded-lg bg-[#0a0a0a] backdrop-blur-sm z-10
                transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer
                group-hover/grid:opacity-30 group-hover/grid:scale-95 group-hover/grid:blur-[2px]
                hover:!opacity-100 hover:!scale-[1.05] hover:!blur-none hover:!shadow-2xl hover:!border-[#c79c6e]/50 hover:!bg-[#0f0f0f]/80 hover:!z-[60]
              "
            >
              {/* Image */}
              <div className="w-full aspect-video rounded-md overflow-hidden relative mb-4">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-2 right-2">
                  <BookmarkSimple size={18} className="text-[#c79c6e]" weight="fill" />
                </div>
              </div>

              {/* Text Content */}
              <span className="font-sans text-[0.5rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-2">
                {item.category}
              </span>
              <h4 className="font-serif text-base text-white font-light whitespace-pre-line mb-4">
                {item.title}
              </h4>
              <div className="mt-auto flex items-center gap-2 text-white/50">
                <Clock size={12} weight="light" />
                <span className="font-sans text-[0.65rem] font-light">{item.readTime}</span>
              </div>

              {/* Hover Pop-up Menu */}
              <div 
                className={`
                  absolute top-1/2 -translate-y-1/2 w-[240px]
                  bg-[#080808] border border-[#c79c6e]/20 rounded-lg p-6 shadow-2xl z-50
                  flex flex-col text-left transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-none
                  opacity-0 scale-90
                  group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                  left-1/2 -translate-x-1/2 group-hover:-translate-x-1/2
                  ${isLastInRow 
                    ? "md:left-auto md:right-[70%] md:-translate-x-4 md:group-hover:translate-x-0" 
                    : "md:left-[70%] md:-translate-x-[-1rem] md:group-hover:translate-x-0"}
                `}
              >
                <div className="flex items-start justify-between mb-6">
                  <h4 className="font-serif text-sm text-white font-light whitespace-pre-line">
                    {item.title}
                  </h4>
                  <X size={14} className="text-white/50 hover:text-white cursor-pointer mt-1" />
                </div>

                <ul className="flex flex-col gap-4 mb-6">
                  <li className="flex items-center gap-3 text-white/80 hover:text-[#c79c6e] transition-colors cursor-pointer">
                    <BookOpenText size={16} weight="light" />
                    <span className="font-sans text-xs font-light">Continue reading</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/80 hover:text-[#c79c6e] transition-colors cursor-pointer">
                    <PencilSimple size={16} weight="light" />
                    <span className="font-sans text-xs font-light">Add a note</span>
                  </li>
                  <li className="flex items-center gap-3 text-[#c79c6e] cursor-pointer">
                    <BookmarkSimple size={16} weight="fill" />
                    <span className="font-sans text-xs font-light">Bookmark</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/80 hover:text-[#c79c6e] transition-colors cursor-pointer">
                    <Check size={16} weight="light" />
                    <span className="font-sans text-xs font-light">Mark as read</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/80 hover:text-[#c79c6e] transition-colors cursor-pointer">
                    <Star size={16} weight="light" />
                    <span className="font-sans text-xs font-light">Remove from library</span>
                  </li>
                </ul>

                <div className="flex items-center gap-2 text-white/40 border-t border-white/10 pt-4 mt-auto">
                  <Clock size={12} weight="light" />
                  <span className="font-sans text-[0.65rem] font-light">{item.savedTime}</span>
                </div>
              </div>

            </div>
          )})}
        </div>

        {/* Call to action Banner */}
        <div className="mt-6 w-full border border-[#c79c6e]/30 rounded-lg p-4 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-between cursor-pointer group hover:bg-[#0f0f0f] hover:border-[#c79c6e]/50 transition-all duration-500">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-[#c79c6e]/50 flex items-center justify-center bg-[#c79c6e]/10">
              <BookmarkSimple size={18} className="text-[#c79c6e]" weight="light" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-white text-base font-light">You've saved 6 perspectives</span>
              <span className="font-sans text-white/50 text-[0.65rem] font-light">Keep going. You're building something meaningful.</span>
            </div>
          </div>
          <CaretRight size={18} className="text-[#c79c6e] transition-transform duration-500 group-hover:translate-x-2" weight="light" />
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="w-full max-w-[90rem] mx-auto px-6 md:px-12 mb-8 z-10">
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 p-6 border border-white/10 rounded-lg bg-[#0a0a0a]/50 backdrop-blur-sm z-10">
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

      {/* Scroll to continue */}
      <div className="mt-4 mb-8 flex flex-col items-center gap-3 z-10 opacity-70">
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
