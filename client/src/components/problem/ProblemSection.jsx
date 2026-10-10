import { useRef, useState, useEffect } from 'react';
import Container from '../ui/Container';
import ProblemContent from './ProblemContent';
import WordCloud from './WordCloud';
import TransitionIntro from './TransitionIntro';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

export default function ProblemSection() {
  const sectionRef = useRef(null);
  const [problemData, setProblemData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_URL}/api/home-settings/problem`)
      .then(res => res.ok ? res.json() : null)
      .then(d => {
        if (d && isMounted) setProblemData(d);
      })
      .catch(err => console.error('Failed to load problem settings:', err));
    return () => { isMounted = false; };
  }, []);

  return (
    <section ref={sectionRef} id="problem" className="relative w-full bg-[#f5f1e8]">
      
      {/* Transition Intro (Statement section) - Placed at Top */}
      <div className="relative z-40 w-full bg-[#f5f1e8] border-b border-[#ebd8c5]/40">
        <TransitionIntro problemData={problemData || {}} />
      </div>

      {/* ─── MOBILE VIEW ─── */}
      <div className="block lg:hidden w-full bg-gradient-to-b from-[#fcefe0] via-[#f8dec4] to-[#f6e7d8] pt-14 pb-10 overflow-hidden">
        {/* Head */}
        <div className="px-5">
          <p className="flex items-center gap-3 font-sans font-semibold text-[11.5px] leading-snug tracking-[0.24em] uppercase text-[#B3441F] before:content-[''] before:w-7 before:h-[1.5px] before:bg-[#c9542f] before:flex-shrink-0">
            {problemData?.eyebrowText || "Maybe you've spent years"}
          </p>
          <h2 className="font-serif font-medium tracking-tight leading-[1.06] text-[clamp(30px,8.8vw,38px)] text-[#141414] mt-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {problemData?.headingLine1 || "Trying to fix what isn't the"}{' '}
            <span className="text-[#c9542f] not-italic font-medium">{problemData?.headingAccent || "real problem."}</span>
          </h2>
        </div>

        {/* Cloud Container with Floating Words */}
        <div className="relative h-[492px] mt-2.5 overflow-hidden">
          <span className="absolute font-serif font-medium text-[14.5px] whitespace-nowrap select-none" style={{ top: '14px', left: '7%', color: '#8a85d6', fontFamily: 'Fraunces, Georgia, serif' }}>What if?</span>
          <span className="absolute font-serif font-medium text-[12.5px] whitespace-nowrap select-none" style={{ top: '46px', left: '36%', color: '#4f4a45', fontFamily: 'Fraunces, Georgia, serif' }}>Self doubt</span>
          <span className="absolute font-serif font-semibold text-[17px] whitespace-nowrap select-none tracking-wide" style={{ top: '22px', right: '6%', color: '#c4713a', fontFamily: 'Fraunces, Georgia, serif' }}>Overthinking</span>
          <span className="absolute font-serif font-medium text-[13px] whitespace-nowrap select-none" style={{ top: '96px', right: '14%', color: '#6e655c', fontFamily: 'Fraunces, Georgia, serif' }}>Regret</span>
          <span className="absolute font-serif font-medium text-[14px] whitespace-nowrap select-none" style={{ top: '150px', left: '4%', color: '#c2416b', fontFamily: 'Fraunces, Georgia, serif' }}>Breakup</span>
          <span className="absolute font-serif font-medium text-[12px] whitespace-nowrap select-none" style={{ top: '208px', left: '3%', color: '#c4713a', fontFamily: 'Fraunces, Georgia, serif' }}>Not enough</span>
          <span className="absolute font-serif font-medium text-[13.5px] whitespace-nowrap select-none" style={{ top: '276px', left: '5%', color: '#2e8b57', fontFamily: 'Fraunces, Georgia, serif' }}>Past mistakes</span>
          <span className="absolute font-serif font-medium text-[13.5px] whitespace-nowrap select-none" style={{ top: '342px', left: '3%', color: '#7a6ad8', fontFamily: 'Fraunces, Georgia, serif' }}>Comparison</span>
          <span className="absolute font-serif font-medium text-[13px] whitespace-nowrap select-none" style={{ top: '416px', left: '7%', color: '#b83fc0', fontFamily: 'Fraunces, Georgia, serif' }}>People pleasing</span>
          <span className="absolute font-serif font-medium text-[13px] whitespace-nowrap select-none" style={{ top: '150px', right: '6%', color: '#3f9e6a', fontFamily: 'Fraunces, Georgia, serif' }}>Family</span>
          <span className="absolute font-serif font-medium text-[14px] whitespace-nowrap select-none" style={{ top: '196px', right: '3%', color: '#7a6ad8', fontFamily: 'Fraunces, Georgia, serif' }}>Uncertainty</span>
          <span className="absolute font-serif font-medium text-[12px] whitespace-nowrap select-none" style={{ top: '246px', right: '8%', color: '#d9546d', fontFamily: 'Fraunces, Georgia, serif' }}>Failing</span>
          <span className="absolute font-serif font-medium text-[16px] whitespace-nowrap select-none tracking-wide" style={{ top: '296px', right: '3%', color: '#d98a2b', fontFamily: 'Fraunces, Georgia, serif' }}>Career pressure</span>
          <span className="absolute font-serif font-medium text-[14.5px] whitespace-nowrap select-none" style={{ top: '346px', right: '8%', color: '#c4532c', fontFamily: 'Fraunces, Georgia, serif' }}>Loneliness</span>
          <span className="absolute font-serif font-medium text-[11.5px] whitespace-nowrap select-none" style={{ top: '394px', right: '4%', color: '#b8863f', fontFamily: 'Fraunces, Georgia, serif' }}>Judgement</span>
          <span className="absolute font-serif font-medium text-[15.5px] whitespace-nowrap select-none tracking-wide" style={{ top: '442px', right: '3%', color: '#2e8b57', fontFamily: 'Fraunces, Georgia, serif' }}>Financial stress</span>
        </div>

        {/* Bottom Caption */}
        <div className="px-5 mt-2">
          <em className="block font-serif italic font-normal text-[17px] leading-[1.5] text-[#2a2622]" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {problemData?.quoteItalic || "Things you carry, cloud your perspective."}
          </em>
          <p className="mt-3 font-serif font-normal text-[15.5px] leading-[1.6] text-[#55504a]" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {problemData?.quoteSubtext || "….Until you learn to see clearly"}
          </p>
        </div>
      </div>

      {/* ─── DESKTOP VIEW ─── */}
      <div className="hidden lg:flex relative w-full min-h-[540px] lg:h-[70vh] max-h-[720px] overflow-hidden items-center justify-center">
        
        {/* DESKTOP HEADING & PARA */}
        <Container className="grid relative z-30 w-full grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full pointer-events-none absolute inset-0">
          <div className="lg:col-span-5 relative z-40 mt-0 pointer-events-auto">
            <ProblemContent problemData={problemData || {}} />
          </div>
        </Container>

        {/* Word Cloud stretches across full width to act as background on Desktop */}
        <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
          <WordCloud 
            customImg={problemData?.bgImg || problemData?.silhouetteImg || ''} 
            wordFontSize={problemData?.wordFontSize}
          />
        </div>

      </div>

    </section>
  );
}
