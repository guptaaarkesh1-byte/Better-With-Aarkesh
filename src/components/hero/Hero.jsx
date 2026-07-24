import Container from '../ui/Container';
import HeroContent from './HeroContent';
import HeroImage from './HeroImage';
import ScrollIndicator from '../ui/ScrollIndicator';

export default function Hero() {
  return (
    <section className="relative h-screen pt-32 pb-12 flex flex-col justify-center overflow-hidden bg-background snap-section">
      <div className="absolute inset-0 z-0">
        <HeroImage />
      </div>
      <Container className="flex flex-col flex-grow h-full relative z-10">
        
        <div className="flex flex-col h-full justify-center relative">
          <HeroContent />
        </div>

        {/* Scroll Indicator at bottom middle */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <ScrollIndicator className="hero-scroll-indicator" />
        </div>
      </Container>
    </section>
  );
}
