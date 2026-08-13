import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion } from 'framer-motion';

export default function HeroImage() {
  const container = useRef(null);
  const imageRef = useRef(null);

  useGSAP(() => {
    // Reveal animation
    gsap.fromTo(container.current,
      { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
      { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1.5, ease: 'power4.inOut', delay: 0.2 }
    );

    // Initial scale down effect for the image inside the reveal
    gsap.fromTo(imageRef.current,
      { scale: 1.2 },
      { scale: 1, duration: 2, ease: 'power3.out', delay: 0.2 }
    );

    // Slight parallax on mouse move using Framer Motion logic (we'll implement basic parallax with GSAP instead for consistency)
  }, { scope: container });

  return (
    <div 
      ref={container} 
      className="w-full h-full relative overflow-hidden bg-card"
    >
      <div className="absolute inset-0 bg-black/20 z-10 mix-blend-multiply" /> {/* Subtle shadow/contrast layer */}
      
      <motion.img
        ref={imageRef}
        src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1287&auto=format&fit=crop"
        alt="Aarkesh - Life Coach"
        className="w-full h-full object-cover object-center filter contrast-[1.05] brightness-90 saturate-[0.85]"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Heavy gradient on the left side so text is readable */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-background via-background/80 to-transparent w-full" />
      
      {/* Subtle bottom gradient to blend into next section */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
}
