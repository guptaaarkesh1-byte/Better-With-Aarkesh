import React, { useState, useEffect } from 'react';
import Container from '../ui/Container';
import { CDN_IMAGES } from '../../utils/cdnAssets';
import { resolveImageUrl } from '../../utils/imageUrl';
import { 
  ArrowRight, 
  LockKey,
  CalendarBlank,
  User,
  Target
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const defaultBgImg = CDN_IMAGES.NEXT_CHAPTER_COZY;

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
  const rawDescription = data?.description || "This is your space to be heard, understood,\nand guided forward.\nLet's create real change together.";
  const description = rawDescription.replace(/—/g, ' ').replace(/--/g, ' ');
  const ctaText = data?.ctaText || 'BOOK YOUR SESSION';
  const ctaLink = data?.ctaLink || '/book';
  const confidentialText = data?.confidentialText || '100% Confidential & Safe Space';
  const bgImg = resolveImageUrl(data?.bgImg, defaultBgImg);
  const quote1 = data?.quoteLine1 || "You don't have to have it all figured out.";
  const quote2 = data?.quoteLine2 || "You just have to be willing to begin.";

  const renderDescription = (text) => {
    if (!text) return null;
    if (text.includes('and guided forward')) {
      return (
        <>
          <span className="block">This is your space to be heard, understood,</span>
          <span className="block">and guided forward.</span>
          <span className="block mt-1">Let's create real change together.</span>
        </>
      );
    }
    return text.split('\n').map((line, idx) => (
      <span key={idx} className="block">{line}</span>
    ));
  };

  return (
    <section id="book-session" className="relative w-full min-h-screen h-auto bg-[#f5f1e8] overflow-hidden flex flex-col snap-section">
      
      {/* ─── MOBILE VIEW (Matches user's mobile prototype) ─── */}
      <div className="block lg:hidden w-full border-t border-black/10 pb-10">
        {/* Armchair Figure */}
        <div 
          className="h-[230px] w-full overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(#000 55%, transparent)',
            maskImage: 'linear-gradient(#000 55%, transparent)'
          }}
        >
          <img 
            src={bgImg} 
            alt="Next Chapter"
            onError={(e) => {
              if (e.currentTarget.src !== defaultBgImg) {
                e.currentTarget.src = defaultBgImg;
              }
            }}
            className="w-full h-full object-cover object-[30%_50%]"
          />
        </div>

        {/* Body Overlapping */}
        <div className="-mt-[70px] px-5 relative z-10">
          <p className="flex items-center gap-3 font-sans font-semibold text-[11.5px] leading-snug tracking-[0.24em] uppercase text-[#B3441F] before:content-[''] before:w-7 before:h-[1.5px] before:bg-[#c9542f] before:flex-shrink-0">
            {eyebrow || 'A conversation can change everything'}
          </p>
          <h2 className="font-serif font-medium tracking-tight leading-[1.06] text-[clamp(34px,10vw,46px)] text-[#141414] mt-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {heading1}<br />
            <span className="text-[#c9542f] not-italic font-medium">{headingAccent}</span>
          </h2>
          <p className="font-serif font-normal text-[15.5px] leading-[1.7] text-[#55504a] my-4 max-w-lg" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {renderDescription(description)}
          </p>
          <Link
            to={ctaLink}
            className="inline-flex items-center justify-center gap-3 h-[54px] px-7 rounded-full bg-[#141414] text-[#F6F1EA] font-sans font-semibold text-[12.5px] tracking-[0.16em] uppercase shadow-[0_12px_26px_-12px_rgba(0,0,0,0.55)] cursor-pointer"
          >
            <span>Book your session</span>
            <ArrowRight size={16} weight="bold" />
          </Link>
          <p className="flex items-center gap-2 mt-3.5 font-sans font-normal text-[13px] text-[#55504a]">
            <LockKey size={15} className="text-[#B3441F]" weight="bold" />
            <span>{confidentialText}</span>
          </p>
        </div>

        {/* Quote Block */}
        <blockquote className="mt-11 mx-5 text-center">
          <p className="font-serif italic font-normal text-[22px] leading-[1.25] tracking-tight text-[#141414]" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {quote1}{' '}
            <b className="block font-serif not-italic font-semibold text-[#c9542f]">{quote2}</b>
          </p>
          <small className="block mt-3.5 font-sans font-semibold text-[10px] leading-[1.6] tracking-[0.2em] uppercase text-[#55504a]">
            THIS IS YOUR JOURNEY. I'M HERE <em className="not-italic text-[#B3441F]">WALKING</em> WITH YOU.
          </small>
        </blockquote>

        {/* Feats: 2x2 Grid */}
        <div className="mx-5 mt-8 grid grid-cols-2 bg-white rounded-[22px] shadow-[0_14px_40px_-26px_rgba(80,50,20,0.5)] overflow-hidden border border-black/8">
          <div className="p-4 flex flex-col gap-2 border-r border-b border-black/8">
            <CalendarBlank size={26} className="text-[#B3441F]" weight="regular" />
            <h3 className="font-sans font-semibold text-[11.5px] leading-snug tracking-[0.1em] uppercase text-[#141414]">Flexible scheduling</h3>
            <p className="font-sans font-normal text-[13px] leading-[1.5] text-[#55504a]">Sessions around your time, your way.</p>
          </div>
          <div className="p-4 flex flex-col gap-2 border-b border-black/8">
            <LockKey size={26} className="text-[#B3441F]" weight="regular" />
            <h3 className="font-sans font-semibold text-[11.5px] leading-snug tracking-[0.1em] uppercase text-[#141414]">Confidential space</h3>
            <p className="font-sans font-normal text-[13px] leading-[1.5] text-[#55504a]">A safe, judgment-free space to share openly.</p>
          </div>
          <div className="p-4 flex flex-col gap-2 border-r border-black/8">
            <User size={26} className="text-[#B3441F]" weight="regular" />
            <h3 className="font-sans font-semibold text-[11.5px] leading-snug tracking-[0.1em] uppercase text-[#141414]">Personalized approach</h3>
            <p className="font-sans font-normal text-[13px] leading-[1.5] text-[#55504a]">Guidance tailored to you, not a one-size-fits-all plan.</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <Target size={26} className="text-[#B3441F]" weight="regular" />
            <h3 className="font-sans font-semibold text-[11.5px] leading-snug tracking-[0.1em] uppercase text-[#141414]">Focused sessions</h3>
            <p className="font-sans font-normal text-[13px] leading-[1.5] text-[#55504a]">60 or 90-minute sessions that create real momentum.</p>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP VIEW (100% untouched desktop layout) ─── */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none overflow-hidden">
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

      <div className="hidden lg:flex relative z-20 flex-grow flex-col pt-20 sm:pt-24 pb-12 w-full">
        <Container className="flex-grow flex flex-col justify-between gap-8">
          
          {/* Top Left Content */}
          <div className="w-full lg:w-[58%] flex flex-col items-start gap-5 mt-0">
            
            {/* Header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="h-[1.5px] w-8 bg-[#c9542f]" />
                <span 
                  className="font-sans text-[0.82rem] sm:text-[0.90rem] uppercase tracking-[0.25em] font-bold text-[#c9542f]"
                  style={{ fontSize: data?.eyebrowFontSize ? `${data.eyebrowFontSize}px` : undefined }}
                >
                  {eyebrow}
                </span>
              </div>
              
              <h2 
                className="font-serif text-[1.75rem] xs:text-[1.95rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] text-[#111010] font-medium tracking-tight leading-[1.08] max-w-full"
                style={{ 
                  fontFamily: 'Fraunces, Georgia, serif',
                  ...(data?.headingFontSize ? { fontSize: `clamp(1.65rem, 6.5vw, ${data.headingFontSize}px)` } : {})
                }}
              >
                {heading1}<br/>
                <span className="text-[#c9542f] not-italic font-medium">{headingAccent}</span>
              </h2>
              
              <p 
                className="font-serif text-xl lg:text-2xl text-[#4a463e] font-normal tracking-wide leading-relaxed max-w-xl mt-2"
                style={{ 
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: data?.descriptionFontSize ? `${data.descriptionFontSize}px` : undefined 
                }}
              >
                {renderDescription(description)}
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

          {/* Middle: Inspiring Quote */}
          <div className="w-full flex flex-col items-center text-center my-3 relative py-3 px-4">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-[2.2rem] text-[#111010] italic font-normal tracking-tight flex items-center gap-2">
              <span className="text-[#c9542f] text-3xl md:text-4xl font-serif not-italic">“</span>
              {quote1}
            </h2>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-[2.2rem] text-[#c9542f] not-italic font-bold tracking-tight flex items-center gap-2 mt-1">
              {quote2}
              <span className="text-[#c9542f] text-3xl md:text-4xl font-serif not-italic">”</span>
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
