import { useRef } from 'react';
import { FiArrowDown } from 'react-icons/fi';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function ScrollIndicator({ className }) {
  const arrowRef = useRef(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: -10,
      duration: 1.5,
      delay: 1.2,
      ease: 'power2.out'
    });

    gsap.to(arrowRef.current, {
      y: 10,
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: 'power1.inOut'
    });
  });

  return (
    <div ref={containerRef} className={`flex flex-col items-center gap-3 ${className}`}>
      <span className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-[#111010]/60 font-semibold">SCROLL</span>
      <div className="w-[1px] h-10 bg-black/15 relative overflow-hidden">
        <div ref={arrowRef} className="absolute top-0 text-[#c9542f] text-sm left-1/2 -translate-x-1/2">
          <FiArrowDown strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
