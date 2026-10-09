import { useState, useEffect } from 'react';
import Container from '../ui/Container';
import HeroContent from './HeroContent';
import HeroImage from './HeroImage';
import ScrollIndicator from '../ui/ScrollIndicator';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

const DEFAULT_HERO_DATA = {
  eyebrowText: 'CLARITY. HONESTY. INTENTION.',
  headingLine1: 'Clarity changes',
  headingAccent: 'everything.',
  description: 'A space to think clearly, feel honestly and decide intentionally.',
  ctaText: 'Book a Session',
  ctaLink: '/book',
  bgImageUrl: 'https://api.aarkeshgupta.com/uploads/image-1790768916697.png',
  overlayOpacity: 16,
  showScrollIndicator: true,
};

const getInitialHeroData = () => {
  try {
    const cached = localStorage.getItem('cached_hero_settings');
    if (cached) {
      return { ...DEFAULT_HERO_DATA, ...JSON.parse(cached) };
    }
  } catch (e) {}
  return DEFAULT_HERO_DATA;
};

export default function Hero() {
  const [heroData, setHeroData] = useState(getInitialHeroData);

  useEffect(() => {
    let isMounted = true;
    const fetchHeroData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-settings/hero`);
        if (res.ok && isMounted) {
          const data = await res.json();
          const merged = { ...DEFAULT_HERO_DATA, ...data };
          setHeroData(merged);
          try {
            localStorage.setItem('cached_hero_settings', JSON.stringify(merged));
          } catch (e) {}
          const opacity = ((merged.overlayOpacity !== undefined ? merged.overlayOpacity : 16) / 100);
          document.documentElement.style.setProperty('--overlay-opacity', opacity.toString());
        }
      } catch (err) {
        console.error('Failed to load hero settings:', err);
      }
    };
    fetchHeroData();
    return () => { isMounted = false; };
  }, []);

  return (
    <section id="home" className="relative min-h-[100svh] lg:h-screen pt-20 md:pt-32 pb-6 md:pb-12 flex flex-col justify-between lg:justify-center overflow-hidden bg-[#f5f1e8] snap-section">
      {/* Desktop Background Image (Kept exactly as desktop) */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <HeroImage 
          bgImageUrl={heroData.bgImageUrl} 
          overlayOpacity={heroData.overlayOpacity} 
          imagePositionY={heroData.imagePositionY || 0}
        />
      </div>

      <Container className="flex flex-col flex-grow h-full relative z-10 px-5 sm:px-8">
        <div className="flex flex-col h-full justify-between lg:justify-center relative">
          <HeroContent heroData={heroData} />

          {/* Mobile Character Figure directly beneath content */}
          <div className="block lg:hidden w-full max-w-[420px] mx-auto mt-auto pt-2 relative">
            <img 
              src={heroData.bgImageUrl || 'https://api.aarkeshgupta.com/uploads/image-1790768916697.png'}
              alt="Aarkesh with open hands, welcoming"
              className="w-full h-auto object-contain max-h-[46vh] mix-blend-multiply drop-shadow-sm mx-auto"
            />
          </div>
        </div>

        {/* Scroll Indicator at bottom middle */}
        {heroData.showScrollIndicator !== false && (
          <div className="relative lg:absolute bottom-2 lg:bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-center pointer-events-auto">
            <a 
              href="#problem" 
              className="flex flex-col items-center gap-2 font-sans font-semibold text-[9.5px] tracking-[0.3em] uppercase text-[#7a756b] hover:text-[#c9542f] transition-colors"
            >
              <span>Scroll</span>
              <i className="block w-[1.5px] h-[26px] bg-gradient-to-b from-[#c9542f] to-transparent" />
            </a>
          </div>
        )}
      </Container>
    </section>
  );
}
