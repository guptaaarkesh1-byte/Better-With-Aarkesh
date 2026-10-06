import React, { useState, useEffect } from 'react';
import Container from '../ui/Container';
import defaultBgImg from '../../assets/Page10/next-chapter-cozy.webp';
import { resolveImageUrl } from '../../utils/imageUrl';
import { 
  ArrowRight, 
  LockKey,
  CalendarBlank,
  User,
  Target
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

// =========================================================================
// 🎛️ DESKTOP IMAGE CONTROLS (Adjust zoom & position here!)
// =========================================================================
export const DESKTOP_IMAGE_CONTROLS = {
  zoom: 1.0,              // 🔍 Zoom / Scale: 1.0 (100%), 1.05 (105%), 1.15 (115%)
  posX: '85%',            // ↔️ Horizontal Position: '50%' (Center), '85%' (Right), '100%' (Far Right)
  posY: '45%',            // ↕️ Vertical Position: '0%' (Top), '45%' (Center), '100%' (Bottom)
  translateX: '0px',      // 🎯 Fine-tune Left/Right pixel nudge: e.g. '+20px', '-30px'
  translateY: '0px',      // 🎯 Fine-tune Up/Down pixel nudge: e.g. '+10px', '-20px'
};

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
  const rawDescription = data?.description || "This is your space to be heard, understood, and guided forward. Let's create real change together.";
  const description = rawDescription.replace(/—/g, ' ').replace(/--/g, ' ');
  const ctaText = data?.ctaText || 'BOOK YOUR SESSION';
  const ctaLink = data?.ctaLink || '/book';
  const confidentialText = data?.confidentialText || '100% Confidential & Safe Space';
  const bgImg = resolveImageUrl(data?.bgImg, defaultBgImg);
  const quote1 = data?.quoteLine1 || "You don't have to have it all figured out.";
  const quote2 = data?.quoteLine2 || "You just have to be willing to begin.";

  return (
    <section id="book-session" className="relative w-full min-h-screen h-auto bg-[#f5f1e8] overflow-hidden flex flex-col snap-section">
      
      {/* Background Image & Soft Cream Overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={bgImg} 
          alt="Your next chapter starts here" 
          onError={(e) => {
            if (e.currentTarget.src !== defaultBgImg) {
              e.currentTarget.src = defaultBgImg;
            }
          }}
          className="w-full h-full object-cover opacity-100 contrast-[1.02] saturate-[1.03] will-change-transform"
          style={{
            objectPosition: `${DESKTOP_IMAGE_CONTROLS.posX} ${DESKTOP_IMAGE_CONTROLS.posY}`,
            transform: `scale(${DESKTOP_IMAGE_CONTROLS.zoom}) translate(${DESKTOP_IMAGE_CONTROLS.translateX}, ${DESKTOP_IMAGE_CONTROLS.translateY}) translateZ(0)`
          }}
        />
        {/* Soft cream gradient on the left side to blend seamlessly with the text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8] via-[#f5f1e8]/90 via-30% md:via-[#f5f1e8]/40 md:via-48% to-transparent w-full lg:w-[55%]" />
        
        {/* Rich bottom white/cream fade ensuring bottom quote & features are 100% readable */}
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#f5f1e8] via-[#f5f1e8]/95 via-45% md:via-[#f5f1e8]/75 md:via-70% to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#f5f1e8]/40 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-20 flex-grow flex flex-col pt-20 sm:pt-24 pb-12 w-full">
        <Container className="flex-grow flex flex-col justify-between gap-8">
          
          {/* Top Left Content */}
          <div className="w-full lg:w-[58%] flex flex-col items-start gap-5 mt-0">
            
            {/* Header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="h-[1.5px] w-8 bg-[#c9542f]" />
                <span className="font-sans text-[0.82rem] sm:text-[0.90rem] uppercase tracking-[0.25em] font-bold text-[#c9542f]">
                  {eyebrow}
                </span>
              </div>
              
              <h2 
                className="font-serif text-4xl md:text-6xl lg:text-[4.5rem] text-[#111010] font-medium tracking-tight leading-[1.08]"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                {heading1}<br/>
                <span className="text-[#c9542f] not-italic font-medium">{headingAccent}</span>
              </h2>
              
              <p 
                className="font-serif text-xl lg:text-2xl text-[#4a463e] font-normal tracking-wide leading-relaxed max-w-xl mt-2"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                {description}
              </p>
            </div>

            {/* CTA Button & Lock */}
            <div className="flex flex-col items-start gap-3 mt-2">
              <Link 
                to={ctaLink} 
                className="flex items-center gap-3 bg-[#111010] hover:bg-[#2b2723] rounded-full px-7 py-3.5 transition-colors duration-200 shadow-[0_4px_20px_rgba(17,16,16,0.15)] group"
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

          {/* Middle: Inspiring Quote (Above the bottom bar with clear luminous backdrop) */}
          <div className="w-full flex flex-col items-center text-center my-3 relative py-3 px-4">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-[2.2rem] text-[#111010] font-semibold tracking-tight flex items-center gap-2">
              <span className="text-[#c9542f] text-3xl md:text-4xl font-serif">“</span>
              {quote1}
            </h2>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-[2.2rem] text-[#c9542f] italic font-medium tracking-tight flex items-center gap-2 mt-1">
              {quote2}
              <span className="text-[#c9542f] text-3xl md:text-4xl font-serif">”</span>
            </h2>
            
            <div className="flex items-center justify-center gap-2 mt-3 opacity-80">
              <LockKey className="text-[#c9542f] text-xs" weight="fill" />
              <span className="font-sans text-[0.65rem] uppercase tracking-[0.25em] font-bold text-[#2b2723]">
                THIS IS YOUR JOURNEY. I'M HERE <span className="text-[#c9542f]">WALKING</span> WITH YOU.
              </span>
            </div>
          </div>

          {/* Bottom: Features Banner */}
          <div className="w-full border border-black/8 bg-white/95 rounded-2xl p-6 shadow-xs">
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

        </Container>
      </div>
    </section>
  );
}
