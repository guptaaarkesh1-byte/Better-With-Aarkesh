import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, CalendarBlank, User, LockKey } from '@phosphor-icons/react';

export default function ClosingNavigation() {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 w-full min-h-[100dvh] flex flex-col px-4 md:px-8 py-24 mx-auto border-t border-white/5 bg-[#050505]/40 backdrop-blur-sm">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full flex-1 justify-between">
        
        <div className="flex flex-col items-start w-full">
          <span className="font-sans text-[0.7rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-4 block">
            MY JOURNEY
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-[1.1] mb-4">
            Where would you like to go next?
          </h2>
          <p className="font-sans text-white/70 text-base md:text-lg font-light leading-relaxed max-w-lg mb-12">
            Continue exploring, prepare for a conversation, or simply leave things here for now.
          </p>

          {/* 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16 items-start">
            
            {/* Card 1: EXPLORE THE LIBRARY */}
            <div 
              onClick={() => navigate('/library')}
              className="group border border-[#c79c6e]/20 hover:border-[#c79c6e] rounded-xl p-8 bg-transparent flex flex-col transition-all duration-500 cursor-pointer hover:bg-[#c79c6e]/5 hover:shadow-[0_0_30px_rgba(199,156,110,0.05)] relative overflow-hidden"
            >
              {/* Header & Title */}
              <div className="w-full flex flex-col h-[80px] shrink-0">
                <BookOpen size={24} weight="light" className="text-[#c79c6e] mb-6" />
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">
                  EXPLORE THE LIBRARY
                </span>
              </div>
              
              {/* Expandable Details */}
              <div className="w-full grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out">
                <div className="overflow-hidden flex flex-col pt-6 mt-6 border-t border-white/5">
                  <p className="font-serif text-white/80 text-sm leading-relaxed mb-8 pr-4">
                    Perspectives, videos and tools for what you are facing.
                  </p>
                  <div className="mt-auto font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-2">
                    OPEN LIBRARY <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: BOOK A CONVERSATION */}
            <div 
              onClick={() => navigate('/book')}
              className="group border border-[#c79c6e]/20 hover:border-[#c79c6e] rounded-xl p-8 bg-transparent flex flex-col transition-all duration-500 cursor-pointer hover:bg-[#c79c6e]/5 hover:shadow-[0_0_30px_rgba(199,156,110,0.05)] relative overflow-hidden"
            >
              {/* Header & Title */}
              <div className="w-full flex flex-col h-[80px] shrink-0">
                <CalendarBlank size={24} weight="light" className="text-[#c79c6e] mb-6" />
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">
                  BOOK A CONVERSATION
                </span>
              </div>
              
              {/* Expandable Details */}
              <div className="w-full grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out">
                <div className="overflow-hidden flex flex-col pt-6 mt-6 border-t border-white/5">
                  <p className="font-serif text-white/80 text-sm leading-relaxed mb-8 pr-4">
                    Make space for a focused, honest conversation.
                  </p>
                  <div className="mt-auto font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-2">
                    VIEW AVAILABILITY <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: ACCOUNT & PRIVACY */}
            <div className="group border border-[#c79c6e]/20 hover:border-[#c79c6e] rounded-xl p-8 bg-transparent flex flex-col transition-all duration-500 cursor-pointer hover:bg-[#c79c6e]/5 hover:shadow-[0_0_30px_rgba(199,156,110,0.1)] relative overflow-hidden">
              
              {/* Header & Title */}
              <div className="w-full flex flex-col h-[80px] shrink-0 relative z-10">
                <User size={24} weight="light" className="text-[#c79c6e] mb-6 shrink-0" />
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] shrink-0">
                  ACCOUNT & PRIVACY
                </span>
              </div>
              
              {/* Expandable Details */}
              <div className="w-full grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out relative z-10">
                <div className="overflow-hidden flex flex-col pt-6 mt-6 border-t border-white/5">
                  <p className="font-serif text-white/80 text-sm leading-relaxed mb-6 pr-4">
                    Manage your details, preferences and privacy controls.
                  </p>
                  
                  <div className="flex flex-col gap-3 mb-6">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/my-journey/settings?tab=PROFILE'); }}
                      className="flex items-center gap-4 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors w-full text-left font-medium"
                    >
                      <User size={16} /> PROFILE & SETTINGS
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/my-journey/settings?tab=SECURITY'); }}
                      className="flex items-center gap-4 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors w-full text-left font-medium"
                    >
                      <LockKey size={16} /> PRIVACY CONTROLS
                    </button>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/my-journey/settings'); }}
                    className="mt-auto font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-2 pt-4 border-t border-white/5 w-full"
                  >
                    OPEN ACCOUNT <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Subtle Glow */}
              <div className="absolute left-0 bottom-0 w-full h-1/2 bg-[#c79c6e]/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col w-full mt-auto pt-16">
          <p className="font-serif italic text-white/40 text-lg mb-8">
            Your journey will be here when you return.
          </p>
        </div>

      </div>
    </section>
  );
}
