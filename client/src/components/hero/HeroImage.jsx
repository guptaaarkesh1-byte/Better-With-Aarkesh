import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import defaultHeroImg from '../../assets/hero-coach.webp';
import { CDN_IMAGES } from '../../utils/cdnAssets';

const HERO_CDN_IMG = CDN_IMAGES.HERO_COACH || defaultHeroImg;

export default function HeroImage({ 
  bgImageUrl = '',
  overlayOpacity = 0,
  imagePositionY = 0
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
      return HERO_CDN_IMG;
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
      {/* Character Image wrapper with position offset support */}
      <div 
        className="absolute inset-x-0 top-[75px] sm:top-[80px] md:top-[85px] lg:top-[85px] -bottom-20 flex items-end justify-end transition-transform duration-300"
        style={{
          transform: imagePositionY ? `translateY(${Number(imagePositionY)}px)` : undefined
        }}
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
          className="w-full h-full object-cover object-[70%_top] sm:object-[82%_top] md:object-[84%_top] lg:object-[82%_top]"
        />
      </div>
    </div>
  );
}
