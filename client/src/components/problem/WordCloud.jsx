import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import silhouetteImg from '../../assets/Page2/ChatGPT Image Jul 24, 2026, 01_49_09 PM.webp';

gsap.registerPlugin(ScrollTrigger);

const WORDS = [
  { text: 'Overthinking', top: '15%', left: '40%', size: 'text-2xl', opacity: 'opacity-85' },
  { text: 'Regret', top: '10%', left: '60%', size: 'text-lg', opacity: 'opacity-55' },
  { text: 'Self doubt', top: '7%', left: '25%', size: 'text-xl', opacity: 'opacity-70' },
  { text: 'Guilt', top: '25%', left: '55%', size: 'text-2xl', opacity: 'opacity-90' },
  { text: 'Family', top: '22%', left: '75%', size: 'text-xl', opacity: 'opacity-70' },
  { text: 'Uncertainty', top: '22%', left: '88%', size: 'text-sm', opacity: 'opacity-45' },
  { text: 'Breakup', top: '35%', left: '32%', size: 'text-xl', opacity: 'opacity-95' },
  { text: 'Career pressure', top: '35%', left: '65%', size: 'text-xl', opacity: 'opacity-85' },
  { text: 'Failing', top: '35%', left: '92%', size: 'text-sm', opacity: 'opacity-40' },
  { text: 'People pleasing', top: '85%', left: '25%', size: 'text-lg', opacity: 'opacity-70' },
  { text: 'Loneliness', top: '45%', left: '80%', size: 'text-3xl', opacity: 'opacity-95' },
  { text: 'Not enough', top: '55%', left: '35%', size: 'text-lg', opacity: 'opacity-65' },
  { text: 'Past mistakes', top: '55%', left: '65%', size: 'text-lg', opacity: 'opacity-80' },
  { text: 'Judgement', top: '55%', left: '90%', size: 'text-sm', opacity: 'opacity-50' },
  { text: 'Financial stress', top: '78%', left: '30%', size: 'text-xl', opacity: 'opacity-70' },
  { text: 'Comparison', top: '70%', left: '75%', size: 'text-xl', opacity: 'opacity-65' },
  { text: 'What if?', top: '12%', left: '30%', size: 'text-sm', opacity: 'opacity-55' },
];

export default function WordCloud() {
  const container = useRef(null);

  useGSAP(() => {
    const words = gsap.utils.toArray('.floating-word');
    
    // Parallax floating effect for the words - paused by default until scrolled into view
    const tweens = words.map((word) => {
      const xMove = gsap.utils.random(-25, 25);
      const yMove = gsap.utils.random(-25, 25);
      const rot = gsap.utils.random(-2, 2);
      const dur = gsap.utils.random(4, 8);

      return gsap.to(word, {
        x: xMove,
        y: yMove,
        rotation: rot,
        duration: dur,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true,
        force3D: true,
      });
    });

    ScrollTrigger.create({
      trigger: container.current,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => tweens.forEach(t => t.play()),
      onLeave: () => tweens.forEach(t => t.pause()),
      onEnterBack: () => tweens.forEach(t => t.play()),
      onLeaveBack: () => tweens.forEach(t => t.pause()),
    });

  }, { scope: container });

  return (
    <div ref={container} className="relative w-full h-full min-h-[60vh] flex items-center justify-center overflow-hidden">
      
      {/* Silhouette Image Full Background with light blend */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={silhouetteImg} 
          alt="Silhouette" 
          className="w-full h-full object-cover object-top lg:object-center opacity-65"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
          }}
        />
        {/* Warm cream soft gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8] via-[#f5f1e8]/40 to-[#f5f1e8]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e8] via-transparent to-[#f5f1e8]" />
      </div>

      {/* Words Container - shifted left on mobile to prevent right edge clipping */}
      <div className="absolute inset-0 -translate-x-20 md:translate-x-0 pointer-events-none">
        {/* Background Floating Words (Blurred for depth of field) */}
        {WORDS.map((word, i) => (
          <div 
            key={`bg-${i}`}
            className="word-track absolute"
            style={{ 
              top: `${(parseFloat(word.top) + (i % 2 === 0 ? 15 : -10) + 100) % 95}%`, 
              left: `${(parseFloat(word.left) + (i % 3 === 0 ? -20 : 25) + 100) % 95}%`,
              willChange: 'transform, opacity'
            }}
          >
            <span 
              className={`floating-word inline-block font-serif text-[#111010] ${word.size} opacity-25 whitespace-nowrap z-0 blur-sm scale-75`}
            >
              {word.text}
            </span>
          </div>
        ))}

        {/* Foreground Floating Words */}
        {WORDS.map((word, i) => (
          <div 
            key={`fg-${i}`}
            className="word-track absolute"
            style={{ 
              top: word.top, 
              left: word.left,
              willChange: 'transform, opacity'
            }}
          >
            <span 
              className={`floating-word inline-block font-serif text-[#111010] font-medium ${word.size} ${word.opacity} whitespace-nowrap z-10 drop-shadow-xs`}
            >
              {word.text}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
