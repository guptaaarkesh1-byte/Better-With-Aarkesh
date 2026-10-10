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
    <section id="home" className="relative w-full min-h-[100svh] lg:min-h-[calc(100vh+80px)] h-auto bg-[#f5f1e8] snap-section">
      {/* Desktop Image (Defines section height naturally, 100% width, height: auto, uncropped) */}
      <div className="relative w-full hidden lg:block">
        <HeroImage 
          bgImageUrl={heroData.bgImageUrl} 
          overlayOpacity={heroData.overlayOpacity} 
          imagePositionY={heroData.imagePositionY || 0}
        />
      </div>

      {/* ─── DESKTOP CONTENT VIEW (Positioned at top left inside Hero, scrolls naturally) ─── */}
      <div className="hidden lg:block absolute inset-0 z-20 pointer-events-none">
        <Container className="h-full px-5 sm:px-8 pt-32 lg:pt-36 pointer-events-auto">
          <div className="flex flex-col justify-start max-w-3xl">
            <HeroContent heroData={heroData} />
          </div>
        </Container>

        {/* Scroll Indicator positioned at first viewport bottom */}
        {heroData.showScrollIndicator !== false && (
          <div className="absolute top-[calc(100vh-3.5rem)] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-center pointer-events-auto">
            <a 
              href="#problem" 
              className="flex flex-col items-center gap-2 font-sans font-semibold text-[9.5px] tracking-[0.3em] uppercase text-[#7a756b] hover:text-[#c9542f] transition-colors"
            >
              <span>Scroll</span>
              <i className="block w-[1.5px] h-[26px] bg-gradient-to-b from-[#c9542f] to-transparent" />
            </a>
          </div>
        )}
      </div>

      {/* ─── MOBILE VIEW (Image 100% width, height auto, text below, uncropped) ─── */}
      <div className="block lg:hidden w-full relative pt-16 bg-[#E4E2EA]">
        <div className="relative w-full overflow-hidden">
          <img 
            src={heroData.bgImageUrl || 'https://api.aarkeshgupta.com/uploads/image-1790768916697.png'}
            alt="Aarkesh"
            className="w-full h-auto object-contain block"
          />
          {/* Bottom 5% subtle gradient fade */}
          <div className="absolute inset-x-0 bottom-0 h-[5%] bg-gradient-to-t from-[#f5f1e8] to-transparent pointer-events-none" />
        </div>

        {/* Content Body Below Image */}
        <div className="relative -mt-6 px-5 sm:px-8 pb-12 z-10 bg-[#f5f1e8]">
          <HeroContent heroData={heroData} />
        </div>
      </div>
    </section>
  );
}
