import { useRef, useState, useEffect } from 'react';
import Container from '../ui/Container';
import ProblemContent from './ProblemContent';
import WordCloud from './WordCloud';
import TransitionIntro from './TransitionIntro';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

const getInitialProblemData = () => {
  try {
    const cached = localStorage.getItem('cached_problem_settings');
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return null;
};

export default function ProblemSection() {
  const sectionRef = useRef(null);
  const [problemData, setProblemData] = useState(getInitialProblemData);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_URL}/api/home-settings/problem`)
      .then(res => res.ok ? res.json() : null)
      .then(d => {
        if (d && isMounted) {
          setProblemData(d);
          try {
            localStorage.setItem('cached_problem_settings', JSON.stringify(d));
          } catch (e) {}
        }
      })
      .catch(err => console.error('Failed to load problem settings:', err));
    return () => { isMounted = false; };
  }, []);

  return (
    <section ref={sectionRef} id="problem" className="relative w-full z-20">
      
      {/* Transition Intro (Statement section) - Starts cleanly down below Hero button on mobile; overlaps on desktop */}
      <div className="relative z-30 w-full mt-8 sm:mt-10 lg:-mt-[74px]">
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

        {/* Cloud Container with Silhouette Background Image & Floating Words */}
        <div className="relative h-[500px] mt-4 overflow-hidden">
          <WordCloud 
            customImg={problemData?.bgImg || problemData?.silhouetteImg || ''} 
            wordFontSize={problemData?.wordFontSize}
          />
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
      <div className="hidden lg:flex relative w-full min-h-[540px] lg:h-[70vh] max-h-[720px] overflow-hidden items-center justify-center bg-[#f5f1e8]">
        
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
