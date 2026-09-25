import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const DEFAULT_HERO_IMG = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1287&auto=format&fit=crop';

export default function HeroImage({ 
  bgImageUrl = '',
  overlayOpacity = 40
}) {
  const container = useRef(null);
  const imageRef = useRef(null);

  useGSAP(() => {
    // Simple smooth fade-in — no scale movement
    gsap.fromTo(container.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: 'power1.inOut', delay: 0 }
    );
  }, { scope: container, dependencies: [bgImageUrl] });

  const finalOpacity = Math.max(0.1, Math.min(1, (overlayOpacity || 40) / 100));

  return (
    <div 
      ref={container} 
      className="w-full h-full relative overflow-hidden bg-card"
    >
      <div className="absolute inset-0 bg-black/20 z-10 mix-blend-multiply" />
      
      <img
        ref={imageRef}
        src={bgImageUrl || DEFAULT_HERO_IMG}
        alt="Aarkesh - Life Coach"
        className="w-full h-full object-cover object-center filter contrast-[1.05] brightness-90 saturate-[0.85]"
      />

      {/* Heavy gradient on the left side so text is readable */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-background via-background/80 to-transparent w-full transition-opacity duration-300" 
        style={{ opacity: `calc(var(--overlay-opacity, ${finalOpacity}) * 1.5)` }}
      />
      
      {/* Global contrast darkening layer */}
      <div 
        className="absolute inset-0 z-15 pointer-events-none bg-black transition-opacity duration-300" 
        style={{ opacity: `var(--overlay-opacity, ${finalOpacity})` }}
      />
      
      {/* Subtle bottom gradient to blend into next section */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
}
