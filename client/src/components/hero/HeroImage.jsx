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
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out', delay: 0.1 }
    );
  }, { scope: container, dependencies: [bgImageUrl] });

  // If bgImageUrl is provided from backend, use it; otherwise use local high-res asset
  const imgSrc = bgImageUrl || defaultHeroImg;

  return (
    <div 
      ref={container} 
      className="w-full h-full relative overflow-hidden bg-[#f5f1e8] pt-20 md:pt-24"
    >
      <img
        ref={imageRef}
        src={imgSrc}
        alt="Aarkesh - Life Coach"
        className="w-full h-full object-cover object-[85%_top] md:object-[88%_top] lg:object-[85%_top] filter contrast-[1.02] brightness-[0.99]"
      />

      {/* Left to right gentle cream gradient to ensure text on left is super readable and blends into #f5f1e8 */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#f5f1e8] via-[#f5f1e8]/75 md:via-[#f5f1e8]/40 to-transparent w-full" 
      />
      
      {/* Bottom gradient blending seamlessly into subsequent cream sections */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#f5f1e8] via-transparent to-transparent" />
    </div>
  );
}
