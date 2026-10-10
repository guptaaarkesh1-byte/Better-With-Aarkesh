import { useState, useEffect } from 'react';
import Container from '../ui/Container';
import HeroContent from './HeroContent';
import HeroImage from './HeroImage';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

const DEFAULT_HERO_DATA = {
  eyebrowText: 'CLARITY. HONESTY. INTENTION.',
  headingLine1: 'Clarity changes',
  headingAccent: 'everything.',
  description: 'A space to think clearly, feel honestly and decide intentionally.',
  ctaText: 'Book a Session',
  ctaLink: '/book',
  bgImageUrl: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791627191/better_with_aarkesh/hero/hero_portrait_aarkesh.png',
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
    <section id="home" className="relative w-full h-auto lg:min-h-[calc(100vh+80px)] bg-[#f5f1e8] snap-section">
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
      </div>

      {/* ─── MOBILE VIEW (Image starts just below navbar, 100% width, 10% bottom fade, text below) ─── */}
      <div className="block lg:hidden w-full relative pt-14 sm:pt-16 bg-[#f5f1e8]">
        <div className="relative w-full overflow-hidden">
          <img 
            src={heroData.bgImageUrl || 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791627191/better_with_aarkesh/hero/hero_portrait_aarkesh.png'}
            alt="Aarkesh"
            className="w-full h-auto object-contain block"
          />
          {/* Bottom 10% subtle gradient fade */}
          <div className="absolute inset-x-0 bottom-0 h-[10%] bg-gradient-to-t from-[#f5f1e8] via-[#f5f1e8]/60 to-transparent pointer-events-none z-10" />
        </div>

        {/* Content Body Below Image */}
        <div className="relative px-5 sm:px-8 pt-2 pb-14 sm:pb-20 z-10 bg-[#f5f1e8]">
          <HeroContent heroData={heroData} />
        </div>
      </div>
    </section>
  );
}
