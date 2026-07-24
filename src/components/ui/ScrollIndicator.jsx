import { useRef } from 'react';
import { FiArrowDown } from 'react-icons/fi';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function ScrollIndicator({ className }) {
  const arrowRef = useRef(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    // Fade in the scroll indicator on mount
    gsap.from(containerRef.current, {
      opacity: 0,
      y: -10,
      duration: 1.5,
      delay: 1.5, // appear after main hero content
      ease: 'power2.out'
    });

    // Arrow bounce animation
    gsap.to(arrowRef.current, {
      y: 10,
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: 'power1.inOut'
    });
  });

  return (
    <div ref={containerRef} className={`flex flex-col items-center gap-4 ${className}`}>
      <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-white">Scroll</span>
      <div className="w-[1px] h-12 bg-white/40 relative overflow-hidden">
        <div ref={arrowRef} className="absolute top-0 text-white text-lg left-1/2 -translate-x-1/2">
          <FiArrowDown strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
