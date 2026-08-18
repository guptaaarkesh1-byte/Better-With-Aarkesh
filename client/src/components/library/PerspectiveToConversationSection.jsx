import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Target, Circle, CornersOut } from '@phosphor-icons/react';
import { useBooking } from '../../context/BookingContext';

gsap.registerPlugin(ScrollTrigger);

export default function PerspectiveToConversationSection() {
  const [isHovered, setIsHovered] = useState(false);
  const { openBookingModal } = useBooking();
  
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.ptc-elem', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: 'power3.out' }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-32 pb-[380px] flex flex-col items-center px-6 md:px-16 lg:px-24 border-t border-white/5">
      
      <div className="w-full max-w-5xl flex flex-col w-full h-full relative">
        
        {/* Main Content Container (Left Aligned) */}
        <div className="w-full md:w-[55%] flex flex-col items-start mt-12 relative">
          
          {/* Text Content */}
          <div className="flex flex-col items-start ptc-elem w-full">
            <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
              FROM PERSPECTIVE TO CONVERSATION
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1] mb-6">
              Some things become clearer<br />
              when they are spoken aloud.
            </h2>
            <p className="font-sans text-[0.85rem] font-light leading-relaxed text-white/60 max-w-sm mb-10">
              Content can offer a perspective. A conversation can help you examine how it applies to your life.
            </p>
          </div>

          {/* Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full ptc-elem z-20">
            <button 
              className={`w-full sm:w-auto px-8 py-3 rounded-sm border transition-all duration-500 font-sans text-[0.65rem] uppercase tracking-widest font-semibold
                ${isHovered 
                  ? 'border-transparent text-black bg-gradient-to-r from-[#c79c6e] via-[#e6c49a] to-[#c79c6e] shadow-[0_0_20px_rgba(199,156,110,0.3)]' 
                  : 'border-[#c79c6e] text-[#c79c6e] bg-transparent hover:bg-[#c79c6e]/10'
                }
              `}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              EXPLORE COACHING
            </button>
            
            <button 
              className="w-full sm:w-auto px-8 py-3 rounded-sm border transition-all duration-500 font-sans text-[0.65rem] uppercase tracking-widest font-semibold border-[#c79c6e] text-[#c79c6e] bg-transparent hover:border-transparent hover:text-black hover:bg-gradient-to-r hover:from-[#c79c6e] hover:via-[#e6c49a] hover:to-[#c79c6e] hover:shadow-[0_0_20px_rgba(199,156,110,0.3)]"
              onClick={openBookingModal}
            >
              BOOK A CONVERSATION
            </button>
          </div>

          {/* Hover Card (Appears below EXPLORE COACHING) */}
          <div 
            ref={cardRef}
            className={`w-full max-w-[340px] rounded-md bg-[#050505]/80 backdrop-blur-md border border-[#c79c6e]/50 shadow-[0_0_30px_rgba(199,156,110,0.1)] p-6 flex flex-col absolute left-0 top-[100%] mt-6 transition-all duration-500 origin-top z-10
              ${isHovered ? 'opacity-100 translate-y-0 scale-y-100 pointer-events-auto' : 'opacity-0 -translate-y-4 scale-y-95 pointer-events-none'}
            `}
          >
            <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-semibold text-[#c79c6e] mb-5">
              WHAT A CONVERSATION ADDS
            </span>
            
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <div className="w-8 h-8 rounded-full border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e]">
                  <Target size={16} weight="light" />
                </div>
                <span className="font-serif text-[0.9rem] text-white/90">Focused attention</span>
              </div>
              
              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <div className="w-8 h-8 rounded-full border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e]">
                  <Circle size={16} weight="light" />
                </div>
                <span className="font-serif text-[0.9rem] text-white/90">Honest reflection</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e]">
                  <CornersOut size={16} weight="light" />
                </div>
                <span className="font-serif text-[0.9rem] text-white/90">Space to examine what applies to your life</span>
              </div>
            </div>

            <p className="font-sans text-[0.7rem] font-light leading-relaxed text-white/50">
              Coaching does not replace your judgment.<br />
              It helps you use it more consciously.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
