import React from 'react';
import { BookmarkSimple, PlayCircle, Faders } from '@phosphor-icons/react';

export default function ContinueSection() {
  return (
    <section className="relative z-10 w-full min-h-[100dvh] flex flex-col px-4 md:px-8 py-24 mx-auto bg-[#050505]/60 backdrop-blur-sm">
      
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full flex-1">
        
        {/* Header Section */}
        <div className="w-full max-w-2xl flex flex-col items-start justify-center mb-12">
          <span className="font-sans text-[0.7rem] md:text-[0.8rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-4 block">
            CONTINUE WHERE YOU LEFT
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-[1.1] mb-4">
            Return to what still deserves your attention.
          </h2>
          <p className="font-sans text-white/70 text-base md:text-lg font-light leading-relaxed max-w-lg">
            Your place is kept across Perspectives, videos and reflection tools.
          </p>
        </div>

        {/* Cards Grid */}
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-auto mb-auto items-start">
          
          {/* Card 1: PERSPECTIVE */}
          <div className="group border border-white/5 hover:border-[#c79c6e] rounded-xl p-8 bg-[#050505] flex flex-col transition-all duration-500 ease-in-out cursor-pointer hover:shadow-[0_0_30px_rgba(199,156,110,0.15)] relative overflow-hidden">
            
            {/* Header & Title */}
            <div className="w-full flex flex-col h-[180px] shrink-0">
              <div className="w-full flex justify-between items-center mb-6 text-[#c79c6e]">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium">PERSPECTIVE</span>
                <BookmarkSimple size={24} weight="light" />
              </div>
              <h3 className="font-serif text-3xl text-white pr-4 leading-tight line-clamp-3">
                When you understand the pattern but still repeat it
              </h3>
            </div>
            
            {/* Expandable Details */}
            <div className="w-full grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out">
              <div className="overflow-hidden flex flex-col pt-6 mt-6 border-t border-white/5">
                <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-2">
                  PATTERNS · BEHAVIOURAL PATTERNS
                </span>
                <span className="text-white/60 font-light text-xs mb-4">
                  Last opened 2 August
                </span>
                <p className="text-white/80 font-light text-sm mb-6 pb-6 border-b border-white/10">
                  Resume at: Why insight alone doesn't create change
                </p>
                <button className="w-full py-4 bg-[#c79c6e]/10 border border-[#c79c6e] rounded-lg text-xs uppercase tracking-widest font-medium text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-colors flex items-center justify-center gap-3">
                  CONTINUE READING <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: VIDEO */}
          <div className="group border border-white/5 hover:border-white/30 rounded-xl p-8 bg-[#050505] flex flex-col transition-all duration-500 ease-in-out cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden">
            
            {/* Header & Title */}
            <div className="w-full flex flex-col h-[180px] shrink-0">
              <div className="w-full flex justify-between items-center mb-6 text-[#c79c6e]">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium">VIDEO</span>
                <PlayCircle size={24} weight="light" />
              </div>
              <h3 className="font-serif text-3xl text-white pr-4 leading-tight line-clamp-3">
                Change without an audience
              </h3>
            </div>

            {/* Expandable Details */}
            <div className="w-full grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out">
              <div className="overflow-hidden flex flex-col pt-6 mt-6 border-t border-white/5">
                <p className="text-white/50 font-light text-sm mb-6">
                  04:18 remaining
                </p>
                <button className="w-full py-4 border border-white/20 hover:border-white/50 rounded-lg text-xs uppercase tracking-widest font-medium text-white/80 hover:text-white transition-colors flex items-center justify-center gap-3">
                  CONTINUE WATCHING <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: REFLECTION TOOL */}
          <div className="group border border-white/5 hover:border-white/30 rounded-xl p-8 bg-[#050505] flex flex-col transition-all duration-500 ease-in-out cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden">
            
            {/* Header & Title */}
            <div className="w-full flex flex-col h-[180px] shrink-0">
              <div className="w-full flex justify-between items-center mb-6 text-[#c79c6e]">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium">REFLECTION TOOL</span>
                <Faders size={24} weight="light" /> 
              </div>
              <h3 className="font-serif text-3xl text-white pr-4 leading-tight line-clamp-3">
                Wheel of Life
              </h3>
            </div>

            {/* Expandable Details */}
            <div className="w-full grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out">
              <div className="overflow-hidden flex flex-col pt-6 mt-6 border-t border-white/5">
                <p className="text-white/50 font-light text-sm mb-6">
                  Step 3 of 8
                </p>
                <button className="w-full py-4 border border-white/20 hover:border-white/50 rounded-lg text-xs uppercase tracking-widest font-medium text-white/80 hover:text-white transition-colors flex items-center justify-center gap-3">
                  RESUME EXERCISE <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
