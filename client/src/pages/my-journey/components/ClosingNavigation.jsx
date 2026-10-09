import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, CalendarBlank, User, LockKey } from '@phosphor-icons/react';

export default function ClosingNavigation() {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 w-full flex flex-col px-4 sm:px-6 md:px-8 py-16 md:py-24 mx-auto border-t border-black/10">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full flex-1 justify-between">
        
        <div className="flex flex-col items-start w-full">
          <span className="font-sans text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] font-semibold text-[#c9542f] mb-3 md:mb-4 block">
            MY JOURNEY
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#111010] tracking-tight leading-[1.15] mb-3 md:mb-4">
            Where would you like to go next?
          </h2>
          <p className="font-sans text-[#555047] text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-xl mb-8 md:mb-12">
            Continue exploring, prepare for a conversation, or simply leave things here for now.
          </p>

          {/* 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full mb-10 md:mb-16 items-start">
            
            {/* Card 1: EXPLORE THE LIBRARY */}
            <div 
              onClick={() => navigate('/library')}
              className="group border border-black/10 hover:border-[#c9542f]/50 rounded-2xl p-6 sm:p-7 md:p-8 bg-white flex flex-col transition-all duration-300 cursor-pointer hover:shadow-lg relative overflow-hidden"
            >
              {/* Header & Title */}
              <div className="w-full flex flex-col min-h-0 md:h-[90px] shrink-0">
                <BookOpen size={26} weight="light" className="text-[#c9542f] mb-3 md:mb-5 md:w-7 md:h-7" />
                <span className="font-sans text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold text-[#c9542f]">
                  EXPLORE THE LIBRARY
                </span>
              </div>
              
              {/* Details */}
              <div className="w-full block md:grid md:grid-rows-[0fr] md:opacity-0 md:group-hover:grid-rows-[1fr] md:group-hover:opacity-100 transition-all duration-500 ease-in-out">
                <div className="overflow-hidden flex flex-col pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-black/10">
                  <p className="font-serif text-[#555047] text-sm sm:text-base leading-relaxed mb-4 sm:mb-8 pr-2 sm:pr-4">
                    Perspectives, videos and tools for what you are facing.
                  </p>
                  <div className="mt-auto font-sans text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold text-[#c9542f] flex items-center gap-2">
                    OPEN LIBRARY <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: BOOK A CONVERSATION */}
            <div 
              onClick={() => navigate('/book')}
              className="group border border-black/10 hover:border-[#c9542f]/50 rounded-2xl p-6 sm:p-7 md:p-8 bg-white flex flex-col transition-all duration-300 cursor-pointer hover:shadow-lg relative overflow-hidden"
            >
              {/* Header & Title */}
              <div className="w-full flex flex-col min-h-0 md:h-[90px] shrink-0">
                <CalendarBlank size={26} weight="light" className="text-[#c9542f] mb-3 md:mb-5 md:w-7 md:h-7" />
                <span className="font-sans text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold text-[#c9542f]">
                  BOOK A CONVERSATION
                </span>
              </div>
              
              {/* Details */}
              <div className="w-full block md:grid md:grid-rows-[0fr] md:opacity-0 md:group-hover:grid-rows-[1fr] md:group-hover:opacity-100 transition-all duration-500 ease-in-out">
                <div className="overflow-hidden flex flex-col pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-black/10">
                  <p className="font-serif text-[#555047] text-sm sm:text-base leading-relaxed mb-4 sm:mb-8 pr-2 sm:pr-4">
                    Make space for a focused, honest conversation.
                  </p>
                  <div className="mt-auto font-sans text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold text-[#c9542f] flex items-center gap-2">
                    VIEW AVAILABILITY <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: ACCOUNT & PRIVACY */}
            <div className="group border border-black/10 hover:border-[#c9542f]/50 rounded-2xl p-6 sm:p-7 md:p-8 bg-white flex flex-col transition-all duration-300 cursor-pointer hover:shadow-lg relative overflow-hidden">
              
              {/* Header & Title */}
              <div className="w-full flex flex-col min-h-0 md:h-[90px] shrink-0 relative z-10">
                <User size={26} weight="light" className="text-[#c9542f] mb-3 md:mb-5 shrink-0 md:w-7 md:h-7" />
                <span className="font-sans text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold text-[#c9542f] shrink-0">
                  ACCOUNT & PRIVACY
                </span>
              </div>
              
              {/* Details */}
              <div className="w-full block md:grid md:grid-rows-[0fr] md:opacity-0 md:group-hover:grid-rows-[1fr] md:group-hover:opacity-100 transition-all duration-500 ease-in-out relative z-10">
                <div className="overflow-hidden flex flex-col pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-black/10">
                  <p className="font-serif text-[#555047] text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 pr-2 sm:pr-4">
                    Manage your details, preferences and privacy controls.
                  </p>
                  
                  <div className="flex flex-col gap-3 mb-5 sm:mb-6">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/my-journey?tab=profile'); }}
                      className="flex items-center gap-3 sm:gap-4 font-sans text-xs sm:text-sm uppercase tracking-[0.18em] text-[#555047] hover:text-[#111010] transition-colors w-full text-left font-medium"
                    >
                      <User size={17} /> PROFILE & SETTINGS
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/my-journey?tab=profile'); }}
                      className="flex items-center gap-3 sm:gap-4 font-sans text-xs sm:text-sm uppercase tracking-[0.18em] text-[#555047] hover:text-[#111010] transition-colors w-full text-left font-medium"
                    >
                      <LockKey size={17} /> PRIVACY CONTROLS
                    </button>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/my-journey?tab=profile'); }}
                    className="mt-auto font-sans text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold text-[#c9542f] flex items-center gap-2 pt-3 sm:pt-4 border-t border-black/10 w-full"
                  >
                    OPEN ACCOUNT <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col w-full mt-auto pt-8 sm:pt-16">
          <p className="font-serif italic text-[#7a756b] text-lg sm:text-xl md:text-2xl mb-4 sm:mb-8 text-center sm:text-left">
            Your journey will be here when you return.
          </p>
        </div>

      </div>
    </section>
  );
}
