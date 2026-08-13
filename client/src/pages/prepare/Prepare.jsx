import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, X } from '@phosphor-icons/react';
import bgImage from '../../assets/images/my-journey-bg.png';

export default function Prepare() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white select-none relative font-sans overflow-x-hidden">
      
      {/* Background - Fixed while scrolling */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={bgImage} 
          alt="Dark Library Background" 
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
      </div>

      <section className="relative z-10 w-full min-h-[100dvh] flex flex-col px-4 md:px-8 py-24 mx-auto bg-[#050505]/40 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto flex flex-col h-full flex-1">
          
          {/* Frame C: Preparation Opened View */}
          <div className="flex w-full h-full relative animate-in fade-in duration-500">
            
            <div className="flex flex-col w-full max-w-3xl">
              
              {/* Header Badge & Back Button */}
              <div className="flex flex-col items-start gap-8 mb-12">
                <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#c79c6e]/40 rounded text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e]">
                  <span>WEDNESDAY, 12 AUGUST · 6:00 PM IST</span>
                  <span className="w-1 h-1 rounded-full bg-[#c79c6e]"></span>
                  <span className="flex items-center gap-1 font-medium">CONFIRMED <CheckCircle size={12} weight="fill"/></span>
                </div>
                
                <button 
                  onClick={() => navigate('/my-journey')}
                  className="flex items-center gap-2 text-[#c79c6e] hover:text-white transition-colors text-xs uppercase tracking-widest font-medium"
                >
                  <ArrowLeft size={16} /> BACK TO APPOINTMENT
                </button>
              </div>

              {/* Preparation Form Content */}
              <div className="mb-8">
                <span className="font-sans text-[0.7rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-4 block">
                  BEFORE WE SPEAK
                </span>
                <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-[1.1] mb-8 pr-12">
                  What feels most important to bring into this conversation?
                </h2>
                
                <textarea 
                  className="w-full bg-[#0a0a0a]/60 border border-white/10 rounded-xl p-6 min-h-[200px] text-white/80 font-serif text-lg focus:outline-none focus:border-[#c79c6e]/60 transition-colors resize-none placeholder:text-white/30"
                  placeholder="Write as much or as little as you need."
                />
                
                <p className="text-white/40 font-light text-sm mt-4">
                  Optional - Shared with Aarkesh for this conversation
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-6 mt-4">
                <button className="px-8 py-4 border border-[#c79c6e] rounded-lg text-xs uppercase tracking-widest font-medium text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-colors flex items-center justify-center gap-3 group">
                  CONTINUE <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
                </button>
                
                <button 
                  onClick={() => navigate('/my-journey')}
                  className="px-6 py-4 rounded-lg text-xs uppercase tracking-widest font-medium text-[#c79c6e]/70 hover:text-white transition-colors"
                >
                  SKIP FOR NOW
                </button>
              </div>
            </div>

            {/* Floating Coach Note */}
            <div className="absolute right-0 top-32 w-[300px] rounded-xl border border-[#c79c6e]/60 bg-[#050505] p-6 shadow-[0_0_30px_rgba(199,156,110,0.15)] hidden lg:flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c79c6e]/10 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="flex justify-between items-center mb-4 text-[#c79c6e] relative z-10">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium">
                  A NOTE FROM AARKESH
                </span>
                <button className="text-[#c79c6e]/50 hover:text-[#c79c6e] transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              <p className="font-serif text-white/80 text-sm leading-relaxed mb-6 relative z-10">
                Before our conversation, take a few quiet minutes to revisit what felt most important after our last session. You do not need to arrive with an answer.
              </p>
              
              <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-[#c79c6e]/70 relative z-10 mb-8 block">
                FOR THIS CONVERSATION
              </span>

              <button className="self-end text-[0.6rem] uppercase tracking-[0.2em] text-[#c79c6e] hover:text-white underline underline-offset-4 relative z-10 font-medium">
                COACH'S NOTES
              </button>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
