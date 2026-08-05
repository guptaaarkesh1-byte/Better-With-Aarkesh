import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, User, NotePencil, CalendarPlus, ArrowsClockwise, XCircle, X } from '@phosphor-icons/react';

export default function PreparationSection() {
  const navigate = useNavigate();
  const [hoveredPill, setHoveredPill] = useState(null);
  const hoverTimeout = useRef(null);
  const containerRef = useRef(null);



  const handleMouseEnterPill = (pill) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredPill(pill);
  };

  const handleMouseLeavePill = () => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredPill(null);
    }, 150); // slight delay to allow moving mouse to the card
  };

  return (
    <section ref={containerRef} className="relative z-10 w-full min-h-[100dvh] flex flex-col px-4 md:px-8 py-24 mx-auto bg-[#050505]/40 backdrop-blur-md">
      
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full flex-1">
        
        {/* Frame A & B: Appointment Summary View */}
        <div className="flex flex-col h-full flex-1 w-full max-w-4xl">
            <div className="mb-12">
              <span className="font-sans text-[0.7rem] md:text-[0.8rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-4 block">
                UPCOMING CONVERSATION
              </span>
              <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-[1.1] mb-4">
                A place has been kept<br/>for this conversation.
              </h2>
              <p className="font-sans text-white/70 text-base md:text-lg font-light leading-relaxed max-w-sm">
                Everything you need before we speak, gathered here.
              </p>
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col md:flex-row gap-8 items-start relative w-full">
              
              {/* Left Column: Appointment Card */}
              <div className="flex flex-col gap-6 w-full md:w-[400px] shrink-0">
                
                {/* Appointment Card */}
                <div className="w-full rounded-xl border border-[#c79c6e]/60 bg-[#0a0a0a]/80 backdrop-blur-xl p-8 relative overflow-hidden shadow-[0_0_20px_rgba(199,156,110,0.1)]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#c79c6e]/10 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="flex items-center gap-2 text-[#c79c6e] mb-6">
                    <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium">CONFIRMED</span>
                    <CheckCircle size={18} weight="fill" />
                  </div>
                  
                  <h3 className="font-serif text-2xl text-white mb-2 uppercase tracking-wide">
                    WEDNESDAY, 12 AUGUST
                  </h3>
                  
                  <p className="font-sans text-white/70 text-sm tracking-widest uppercase mb-2">
                    6:00 PM - 7:30 PM IST
                  </p>
                  
                  <p className="font-sans text-white/50 text-sm tracking-widest uppercase mb-6">
                    90-MINUTE CONVERSATION
                  </p>
                  
                  <div className="flex items-center gap-3 text-white/80 mb-8">
                    <User size={20} weight="light" className="text-[#c79c6e]" />
                    <span className="font-sans text-sm tracking-widest uppercase font-medium">AARKESH GUPTA</span>
                  </div>
                  
                  <button className="w-full py-4 border border-[#c79c6e]/40 rounded-lg text-xs uppercase tracking-widest font-medium text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-colors">
                    VIEW APPOINTMENT
                  </button>
                </div>

                {/* Action Pills */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button 
                    onMouseEnter={() => handleMouseEnterPill('PREPARE')}
                    onMouseLeave={handleMouseLeavePill}
                    onClick={() => navigate('/prepare')}
                    className="flex justify-center items-center gap-3 px-2 py-4 border border-[#c79c6e] text-[#c79c6e] rounded-lg text-[0.65rem] uppercase tracking-widest font-medium transition-colors hover:bg-[#c79c6e]/10 w-full"
                  >
                    <NotePencil size={18} weight="regular" />
                    PREPARE
                  </button>
                  
                  <button 
                    onMouseEnter={() => handleMouseEnterPill('CALENDAR')}
                    onMouseLeave={handleMouseLeavePill}
                    className="flex justify-center items-center gap-3 px-2 py-4 border border-white/5 text-[#c79c6e] rounded-lg text-[0.65rem] uppercase tracking-widest font-medium transition-colors hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/5 w-full"
                  >
                    <CalendarPlus size={18} weight="regular" />
                    ADD TO CALENDAR
                  </button>
                  
                  <button 
                    onMouseEnter={() => handleMouseEnterPill('RESCHEDULE')}
                    onMouseLeave={handleMouseLeavePill}
                    className="flex justify-center items-center gap-3 px-2 py-4 border border-white/5 text-[#c79c6e] rounded-lg text-[0.65rem] uppercase tracking-widest font-medium transition-colors hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/5 w-full"
                  >
                    <ArrowsClockwise size={18} weight="regular" />
                    RESCHEDULE
                  </button>
                  
                  <button 
                    onMouseEnter={() => handleMouseEnterPill('CANCEL')}
                    onMouseLeave={handleMouseLeavePill}
                    className="flex justify-center items-center gap-3 px-2 py-4 border border-white/5 text-[#c79c6e] rounded-lg text-[0.65rem] uppercase tracking-widest font-medium transition-colors hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/5 w-full"
                  >
                    <XCircle size={18} weight="regular" />
                    CANCEL
                  </button>
                </div>
              </div>

              {/* Right Column: Dynamic Hover Card */}
              <div 
                className={`hidden md:block absolute left-[432px] top-0 w-[380px] transition-all duration-300 pointer-events-none z-20 ${
                  hoveredPill ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-4'
                }`}
                onMouseEnter={() => handleMouseEnterPill(hoveredPill)}
                onMouseLeave={handleMouseLeavePill}
              >
                <div className="w-full rounded-xl border border-[#c79c6e]/60 bg-[#050505] p-8 shadow-[0_0_30px_rgba(199,156,110,0.15)] relative">
                  
                  {hoveredPill === 'PREPARE' && (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex justify-between items-start mb-6">
                        <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-[#c79c6e] max-w-[200px] leading-relaxed">
                          PREPARE FOR THE CONVERSATION
                        </span>
                        <button className="text-[#c79c6e]/50 hover:text-[#c79c6e] transition-colors" onClick={() => setHoveredPill(null)}>
                          <X size={20} />
                        </button>
                      </div>
                      <p className="font-sans text-white/80 text-sm font-light leading-relaxed mb-4">
                        Optional questions to help you gather what feels important before we speak.
                      </p>
                      <p className="font-sans text-white/50 text-xs font-light leading-relaxed mb-8">
                        Your responses here will be shared with Aarkesh.
                      </p>
                      <button 
                        onClick={() => navigate('/prepare')}
                        className="w-full py-4 border border-[#c79c6e]/60 rounded-lg text-xs uppercase tracking-widest font-medium text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-colors flex items-center justify-center gap-2"
                      >
                        BEGIN PREPARATION <span>→</span>
                      </button>
                    </div>
                  )}

                  {hoveredPill === 'CALENDAR' && (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex justify-between items-start mb-6">
                        <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-[#c79c6e] max-w-[200px] leading-relaxed">
                          ADD TO CALENDAR
                        </span>
                        <button className="text-[#c79c6e]/50 hover:text-[#c79c6e] transition-colors" onClick={() => setHoveredPill(null)}>
                          <X size={20} />
                        </button>
                      </div>
                      <p className="font-sans text-white/80 text-sm font-light leading-relaxed mb-4">
                        Sync this appointment to your preferred calendar application so you don't miss it.
                      </p>
                    </div>
                  )}

                  {hoveredPill === 'RESCHEDULE' && (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex justify-between items-start mb-6">
                        <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-[#c79c6e] max-w-[200px] leading-relaxed">
                          RESCHEDULE
                        </span>
                        <button className="text-[#c79c6e]/50 hover:text-[#c79c6e] transition-colors" onClick={() => setHoveredPill(null)}>
                          <X size={20} />
                        </button>
                      </div>
                      <p className="font-sans text-white/80 text-sm font-light leading-relaxed mb-4">
                        Need to change the time? Find a new slot that works better for your schedule.
                      </p>
                    </div>
                  )}

                  {hoveredPill === 'CANCEL' && (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex justify-between items-start mb-6">
                        <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-[#c79c6e] max-w-[200px] leading-relaxed">
                          CANCEL APPOINTMENT
                        </span>
                        <button className="text-[#c79c6e]/50 hover:text-[#c79c6e] transition-colors" onClick={() => setHoveredPill(null)}>
                          <X size={20} />
                        </button>
                      </div>
                      <p className="font-sans text-white/80 text-sm font-light leading-relaxed mb-4">
                        Cancel this upcoming conversation.
                      </p>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>

      </div>
    </section>
  );
}
