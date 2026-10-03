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
    <section className="relative min-h-[100svh] lg:h-screen pt-24 md:pt-32 pb-20 md:pb-12 flex flex-col justify-center overflow-hidden bg-background snap-section">
      <div className="absolute inset-0 z-0">
        <HeroImage 
          bgImageUrl={heroData.bgImageUrl} 
          overlayOpacity={heroData.overlayOpacity} 
        />
      </div>
      <Container className="flex flex-col flex-grow h-full relative z-10">
        
        <div className="flex flex-col h-full justify-center relative">
          <HeroContent heroData={heroData} />
        </div>

        {/* Scroll Indicator at bottom middle */}
        {heroData.showScrollIndicator !== false && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <ScrollIndicator className="hero-scroll-indicator" />
          </div>
        )}
      </Container>
    </section>
  );
}
