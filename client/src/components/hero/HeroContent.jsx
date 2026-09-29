import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';

export default function HeroContent({ heroData = {} }) {
  const container = useRef(null);

  const eyebrow = heroData.eyebrowText || 'CLARITY. HONESTY. INTENTION.';
  const heading1 = heroData.headingLine1 || 'Clarity changes';
  const headingAccent = heroData.headingAccent || 'everything.';
  const description = heroData.description || 'A space to think clearly, feel honestly and decide intentionally.';
  const ctaText = heroData.ctaText || 'Book a Session';
  const ctaLink = heroData.ctaLink || '/book';

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.4 });

    tl.fromTo('.hero-eyebrow', 
      { opacity: 0, x: -16 }, 
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.hero-line',
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.out' },
      "<"
    )
    .fromTo('.hero-heading',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
      "-=0.4"
    )
    .fromTo('.hero-paragraph',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.5"
    )
    .fromTo('.hero-btn',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      "-=0.4"
    );

  }, { scope: container, dependencies: [eyebrow, heading1, headingAccent, description] });

  return (
    <div ref={container} className="max-w-3xl mt-4 sm:mt-8">
      
      <div className="flex items-center gap-4 mb-4 lg:mb-6">
        <div className="hero-line h-[1.5px] w-10 bg-[#c9542f] origin-left" />
        <span className="hero-eyebrow font-sans text-[0.82rem] sm:text-[0.90rem] font-bold uppercase tracking-[0.25em] text-[#c9542f]">
          {eyebrow}
        </span>
      </div>

      <h1 
        className="hero-heading font-serif text-4xl md:text-6xl lg:text-[4.5rem] leading-[1.08] text-[#111010] font-medium tracking-tight mb-6"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        {heading1}{' '}
        <span className="text-[#c9542f] font-medium not-italic" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          {headingAccent}
        </span>
      </h1>

      <p 
        className="hero-paragraph font-serif text-xl lg:text-2xl text-[#4a463e] font-normal tracking-wide leading-relaxed max-w-xl mb-10"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        {description.includes('\n') ? (
          description.split('\n').map((line, idx) => (
            <span key={idx} className="block">{line}</span>
          ))
        ) : description.includes('and decide') ? (
          <>
            {description.split('and decide')[0].trim()}
            <br />
            and decide {description.split('and decide').slice(1).join('and decide').trim()}
          </>
        ) : (
          description
        )}
      </p>

      <div className="hero-btn flex items-center gap-5">
        <Link 
          to={ctaLink}
          className="inline-flex items-center gap-3 bg-[#111010] text-[#f5f1e8] hover:bg-[#c9542f] px-8 py-4 rounded-full font-sans text-[12.5px] font-bold uppercase tracking-[0.08em] transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-xl hover:translate-y-[-2px] cursor-pointer"
        >
          <span>{ctaText}</span>
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>

    </div>
  );
}
