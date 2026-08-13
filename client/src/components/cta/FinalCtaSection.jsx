import React from 'react';
import Container from '../ui/Container';
import bgImg from '../../assets/Page10/ChatGPT Image Jul 24, 2026, 05_10_01 PM.png';
import { 
  ArrowRight, 
  LockKey,
  CalendarBlank,
  User,
  Target
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function FinalCtaSection() {
  return (
    <section id="book-session" className="relative w-full min-h-screen h-auto bg-[#050505] overflow-hidden flex flex-col snap-section">
      
      {/* Background Image & Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImg} 
          alt="Cinematic Coffee Cup" 
          className="absolute right-0 top-0 h-full w-full md:w-[65%] object-cover object-left md:object-right opacity-90"
        />
        {/* Horizontal Gradient fading to solid dark on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/95 to-transparent" />
        {/* Vertical Gradient for bottom quote integration */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />
      </div>

      <div className="relative z-10 flex-grow flex flex-col pt-24 pb-6 w-full">
        <Container className="flex-grow flex flex-col justify-between">
          
          {/* Top Left Content */}
          <div className="w-full lg:w-[55%] flex flex-col items-start gap-5 mt-0">
            
            {/* Header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-8 bg-accent-gold" />
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.3em] font-bold text-accent-gold">
                  A CONVERSATION CAN CHANGE EVERYTHING
                </span>
              </div>
              
              <h2 className="font-serif text-5xl md:text-6xl text-white font-medium tracking-tight leading-[1.1]">
                Your next chapter<br/>
                <span className="text-accent-gold italic">starts here.</span>
              </h2>
              
              <p className="font-libertinus text-white/80 font-light text-sm md:text-base max-w-md mt-1 leading-relaxed">
                This is your space to be heard,<br/>
                understood, and guided forward.<br/>
                Let's create real change—together.
              </p>
            </div>

            {/* CTA Button & Lock */}
            <div className="flex flex-col items-start gap-3 mt-1">
              <Link to="/book" className="flex items-center gap-3 bg-[#a37946] rounded-sm px-6 py-3 transition-colors hover:bg-[#c29158] shadow-[0_0_15px_rgba(163,121,70,0.3)]">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-bold text-white">
                  BOOK YOUR SESSION
                </span>
                <ArrowRight className="text-white text-sm" />
              </Link>
              
              <div className="flex items-center gap-2 opacity-60">
                <LockKey className="text-white text-sm" weight="light" />
                <span className="font-sans text-[0.65rem] text-white tracking-wider">
                  100% Confidential & Safe Space
                </span>
              </div>
            </div>

          </div>

          {/* Features Banner */}
          <div className="w-full mt-8 mb-6 border border-white/5 bg-white/[0.02] backdrop-blur-md rounded-lg p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
              
              {/* Feature 1 */}
              <div className="flex items-start gap-4 pt-4 md:pt-0 px-2 group">
                <CalendarBlank className="text-accent-gold text-3xl shrink-0 group-hover:scale-110 transition-transform" weight="light" />
                <div className="flex flex-col">
                  <span className="font-sans text-[0.65rem] font-bold uppercase tracking-widest text-accent-gold mb-1">Flexible Scheduling</span>
                  <p className="font-sans text-white/60 text-xs leading-relaxed">Sessions around your time, your way.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 pt-4 md:pt-0 px-2 group lg:pl-8">
                <div className="relative shrink-0 group-hover:scale-110 transition-transform">
                  <div className="absolute inset-0 bg-accent-gold/20 rotate-45 rounded-sm" />
                  <LockKey className="text-accent-gold text-3xl relative z-10" weight="light" />
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-[0.65rem] font-bold uppercase tracking-widest text-accent-gold mb-1">Confidential Space</span>
                  <p className="font-sans text-white/60 text-xs leading-relaxed">A safe, judgment-free space to share openly.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4 pt-4 md:pt-0 px-2 group lg:pl-8">
                <User className="text-accent-gold text-3xl shrink-0 group-hover:scale-110 transition-transform" weight="light" />
                <div className="flex flex-col">
                  <span className="font-sans text-[0.65rem] font-bold uppercase tracking-widest text-accent-gold mb-1">Personalized Approach</span>
                  <p className="font-sans text-white/60 text-xs leading-relaxed">Guidance tailored to you, not a one-size-fits-all plan.</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-4 pt-4 md:pt-0 px-2 group lg:pl-8">
                <Target className="text-accent-gold text-3xl shrink-0 group-hover:scale-110 transition-transform" weight="light" />
                <div className="flex flex-col">
                  <span className="font-sans text-[0.65rem] font-bold uppercase tracking-widest text-accent-gold mb-1">Focused Sessions</span>
                  <p className="font-sans text-white/60 text-xs leading-relaxed">60 or 90-minute sessions that create real momentum.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Quote */}
          <div className="w-full flex flex-col items-center text-center pb-2">
            <h2 className="font-serif text-2xl md:text-3xl text-white tracking-tight flex items-center gap-3">
              <span className="text-accent-gold opacity-80 text-3xl mt-1 font-serif">"</span>
              You don't have to have it all figured out.
            </h2>
            <h2 className="font-serif text-2xl md:text-3xl text-accent-gold italic tracking-tight flex items-center gap-3 mt-1">
              You just have to be willing to begin.
              <span className="text-accent-gold opacity-80 text-3xl mt-1 font-serif">"</span>
            </h2>
            
            <div className="flex items-center justify-center gap-2 mt-6 opacity-50">
              <LockKey className="text-white text-xs" weight="fill" />
              <span className="font-sans text-[0.6rem] uppercase tracking-[0.25em] font-semibold text-white">
                THIS IS YOUR JOURNEY. I'M HERE <span className="text-accent-gold">WALKING</span> WITH YOU.
              </span>
            </div>
          </div>

        </Container>
      </div>
    </section>
  );
}
