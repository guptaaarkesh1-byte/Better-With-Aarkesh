import React, { useState, useEffect } from 'react';
import Container from '../ui/Container';
import defaultBgImg from '../../assets/Page10/ChatGPT Image Jul 24, 2026, 05_10_01 PM.webp';
import { 
  ArrowRight, 
  LockKey,
  CalendarBlank,
  User,
  Target
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FinalCtaSection() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-settings/cta`);
        if (res.ok && isMounted) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load final CTA settings:', err);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const eyebrow = data?.eyebrowText || 'A CONVERSATION CAN CHANGE EVERYTHING';
  const heading1 = data?.headingLine1 || 'Your next chapter';
  const headingAccent = data?.headingAccent || 'starts here.';
  const description = data?.description || "This is your space to be heard, understood, and guided forward. Let's create real change—together.";
  const ctaText = data?.ctaText || 'BOOK YOUR SESSION';
  const ctaLink = data?.ctaLink || '/book';
  const confidentialText = data?.confidentialText || '100% Confidential & Safe Space';
  const bgImg = data?.bgImg || defaultBgImg;
  const quote1 = data?.quoteLine1 || "You don't have to have it all figured out.";
  const quote2 = data?.quoteLine2 || "You just have to be willing to begin.";

  return (
    <section id="book-session" className="relative w-full min-h-screen h-auto bg-[#f5f1e8] overflow-hidden flex flex-col snap-section">
      
      {/* Background Image & Soft Cream Overlays */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImg} 
          alt="Cinematic Coffee Cup" 
          className="absolute right-0 top-0 h-full w-full md:w-[60%] object-cover object-left md:object-right opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8] via-[#f5f1e8]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f5f1e8] via-transparent to-[#f5f1e8]/30" />
      </div>

      <div className="relative z-10 flex-grow flex flex-col pt-24 pb-10 w-full">
        <Container className="flex-grow flex flex-col justify-between">
          
          {/* Top Left Content */}
          <div className="w-full lg:w-[58%] flex flex-col items-start gap-5 mt-0">
            
            {/* Header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="h-[1.5px] w-8 bg-[#c9542f]" />
                <span className="font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.25em] font-bold text-[#c9542f]">
                  {eyebrow}
                </span>
              </div>
              
              <h2 className="font-serif text-5xl md:text-6xl text-[#111010] font-medium tracking-tight leading-[1.08]">
                {heading1}<br/>
                <span className="text-[#c9542f] italic">{headingAccent}</span>
              </h2>
              
              <p className="text-[#2b2723] text-lg font-light max-w-md mt-1 leading-relaxed">
                {description}
              </p>
            </div>

            {/* CTA Button & Lock */}
            <div className="flex flex-col items-start gap-3 mt-2">
              <Link 
                to={ctaLink} 
                className="flex items-center gap-3 bg-[#111010] hover:bg-[#2b2723] rounded-full px-7 py-3.5 transition-all duration-300 shadow-[0_4px_20px_rgba(17,16,16,0.15)] group"
              >
                <span className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-[#f5f1e8]">
                  {ctaText}
                </span>
                <ArrowRight className="text-[#f5f1e8] text-sm group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex items-center gap-2 opacity-70">
                <LockKey className="text-[#c9542f] text-sm" weight="bold" />
                <span className="font-sans text-xs text-[#555047] tracking-wide">
                  {confidentialText}
                </span>
              </div>
            </div>

          </div>

          {/* Features Banner */}
          <div className="w-full mt-10 mb-8 border border-black/8 bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-black/8">
              
              <div className="flex items-start gap-4 pt-4 md:pt-0 px-2 group">
                <CalendarBlank className="text-[#c9542f] text-3xl shrink-0 group-hover:scale-110 transition-transform" weight="regular" />
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#111010] mb-1">Flexible Scheduling</span>
                  <p className="font-sans text-[#555047] text-xs leading-relaxed">Sessions around your time, your way.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-4 md:pt-0 px-2 group lg:pl-8">
                <LockKey className="text-[#c9542f] text-3xl shrink-0 group-hover:scale-110 transition-transform" weight="regular" />
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#111010] mb-1">Confidential Space</span>
                  <p className="font-sans text-[#555047] text-xs leading-relaxed">A safe, judgment-free space to share openly.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-4 md:pt-0 px-2 group lg:pl-8">
                <User className="text-[#c9542f] text-3xl shrink-0 group-hover:scale-110 transition-transform" weight="regular" />
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#111010] mb-1">Personalized Approach</span>
                  <p className="font-sans text-[#555047] text-xs leading-relaxed">Guidance tailored to you, not a one-size-fits-all plan.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-4 md:pt-0 px-2 group lg:pl-8">
                <Target className="text-[#c9542f] text-3xl shrink-0 group-hover:scale-110 transition-transform" weight="regular" />
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#111010] mb-1">Focused Sessions</span>
                  <p className="font-sans text-[#555047] text-xs leading-relaxed">60 or 90-minute sessions that create real momentum.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Quote */}
          <div className="w-full flex flex-col items-center text-center pb-2">
            <h2 className="font-serif text-2xl md:text-3xl text-[#111010] tracking-tight flex items-center gap-2">
              <span className="text-[#c9542f] text-3xl font-serif">“</span>
              {quote1}
            </h2>
            <h2 className="font-serif text-2xl md:text-3xl text-[#c9542f] italic tracking-tight flex items-center gap-2 mt-1">
              {quote2}
              <span className="text-[#c9542f] text-3xl font-serif">”</span>
            </h2>
            
            <div className="flex items-center justify-center gap-2 mt-6 opacity-60">
              <LockKey className="text-[#c9542f] text-xs" weight="fill" />
              <span className="font-sans text-[0.62rem] uppercase tracking-[0.25em] font-bold text-[#555047]">
                THIS IS YOUR JOURNEY. I'M HERE <span className="text-[#c9542f]">WALKING</span> WITH YOU.
              </span>
            </div>
          </div>

        </Container>
      </div>
    </section>
  );
}
