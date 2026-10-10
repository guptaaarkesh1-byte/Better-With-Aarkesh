import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import defaultHeroImg from '../../assets/hero-portrait.png';
import { CDN_IMAGES, optimizeCloudinaryUrl } from '../../utils/cdnAssets';

const HERO_CDN_IMG = optimizeCloudinaryUrl(CDN_IMAGES.HERO_COACH, 1920) || defaultHeroImg;

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
    return optimizeCloudinaryUrl(url, 1920);
  };

  const imgSrc = resolveHeroImg(bgImageUrl);

  return (
    <div 
      ref={container} 
      className="w-full h-auto relative overflow-hidden"
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
        className="w-full h-auto block object-contain object-right-top transition-transform duration-300"
        style={{
          transform: imagePositionY ? `translateY(${Number(imagePositionY)}px)` : undefined
        }}
      />
      {/* Bottom 5% subtle gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-[5%] bg-gradient-to-t from-[#f5f1e8] to-transparent pointer-events-none z-10" />
    </div>
  );
}
