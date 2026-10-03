import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import defaultHeroImg from '../../assets/hero-coach.webp';

export default function HeroImage({ 
  bgImageUrl = '',
  overlayOpacity = 0
}) {
  const container = useRef(null);
  const imageRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(container.current,
      { opacity: 0.95 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
  }, { scope: container });

  // Resolve image URL:
  const resolveHeroImg = (url) => {
    if (!url || url.includes('image-1790768916697.png') || url.includes('hero-coach')) {
      return defaultHeroImg;
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';
    if (url.includes('localhost:5000/uploads/')) {
      return url.replace('http://localhost:5000/uploads/', `${apiUrl}/uploads/`);
    }
    if (url.startsWith('/uploads/')) {
      return `${apiUrl}${url}`;
    }
    return url;
  };

  const imgSrc = resolveHeroImg(bgImageUrl);

  return (
    <div 
      ref={container} 
      className="w-full h-full relative overflow-hidden bg-[#f5f1e8]"
    >
      <img
        ref={imageRef}
        src={imgSrc}
        alt="Aarkesh - Life Coach"
        loading="eager"
        fetchPriority="high"
        decoding="sync"
        onError={(e) => {
          if (e.currentTarget.src !== defaultHeroImg) {
            e.currentTarget.src = defaultHeroImg;
          }
        }}
        className="w-full h-full object-cover object-[80%_top] sm:object-[82%_top] md:object-[82%_top] lg:object-[80%_top] pt-10 sm:pt-12 md:pt-14 lg:pt-10"
      />

      {/* Left to right gentle cream gradient to blend seamlessly into #f5f1e8 behind text */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#f5f1e8] via-[#f5f1e8]/70 md:via-[#f5f1e8]/40 to-transparent w-full" 
      />
      
      {/* Subtle bottom transition */}
      <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none bg-gradient-to-t from-[#f5f1e8] to-transparent" />
    </div>
  );
}
