import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AnimatedText from '../ui/AnimatedText';
import Button from '../ui/Button';

export default function HeroContent() {
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.8 });

    tl.fromTo('.hero-eyebrow', 
      { opacity: 0, x: -20 }, 
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.hero-line',
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.out' },
      "<"
    )
    .fromTo('.hero-paragraph',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.4"
    )
    .fromTo('.hero-buttons button',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
      "-=0.4"
    )
    .fromTo('.hero-scroll-indicator',
      { opacity: 0 },
      { opacity: 1, duration: 1 },
      "-=0.2"
    );

  }, { scope: container });

  return (
    <div ref={container} className="max-w-5xl pt-12 lg:pt-0">
      
      <div className="flex items-center gap-6 mb-4 lg:mb-7">
        <div className="hero-line h-[1px] w-12 bg-accent-gold origin-left" />
        <span className="hero-eyebrow eyebrow-text" style={{ color: '#B98A56' }}>
          Clarity. Honesty. Intention.
        </span>
      </div>

      <h1 className="heading-luxury mb-4">
        <AnimatedText text="Clarity changes" tag="span" className="inline-flex mr-4 md:mr-6" delay={1} />
        <AnimatedText 
          text="everything." 
          tag="span" 
          className="inline-flex text-accent-gold italic pr-4" 
          delay={1.2} 
        />
      </h1>

      <p className="hero-paragraph text-paragraph text-lg lg:text-xl font-light tracking-wide leading-relaxed max-w-md mb-8">
        A space to think clearly, feel honestly and decide intentionally.
      </p>

      <div className="hero-buttons flex flex-wrap items-center gap-6">
        <Button variant="primary" icon>
          Book a Session
        </Button>
        <Button variant="secondary" icon>
          Learn More
        </Button>
      </div>

    </div>
  );
}
