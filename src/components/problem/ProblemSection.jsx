import Container from '../ui/Container';
import ProblemContent from './ProblemContent';
import WordCloud from './WordCloud';
import DynamicBanner from './DynamicBanner';
import TransitionIntro from './TransitionIntro';

export default function ProblemSection() {
  return (
    <section className="relative w-full bg-[#0a0a0a] h-screen flex flex-col overflow-hidden snap-section">
      
      {/* Top half: Split content and word cloud */}
      <div className="relative flex-grow flex items-center justify-center min-h-0 pt-12 lg:pt-16 pb-0">
        <Container className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center h-full">
          
          <div className="lg:col-span-5 relative z-20">
            <ProblemContent />
          </div>

          {/* Word Cloud stretches across full width to act as background */}
          <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
            <WordCloud />
          </div>

        </Container>
      </div>

      {/* Dynamic Banner */}
      <div className="relative z-20 border-y border-white/5 bg-black/40 backdrop-blur-sm shrink-0">
        <DynamicBanner />
      </div>

      {/* Transition Intro */}
      <div className="relative z-20 shrink-0">
        <TransitionIntro />
      </div>

    </section>
  );
}
