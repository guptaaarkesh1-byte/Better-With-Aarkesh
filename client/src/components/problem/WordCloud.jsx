import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { resolveImageUrl } from '../../utils/imageUrl';
import silhouetteImg from '../../assets/Page2/problem_silhouette.png';

gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// 🎛️ WORD CLOUD POSITION & STYLE CONTROLS
// Original exact placement restored + fluid responsive sizing for all laptops
// =========================================================================
const WORDS = [
  // --- Left Side Words (Heading ke aas-paas) ---
  { text: 'Self doubt',       top: '1%',   left: '34%', size: 'text-base sm:text-lg md:text-xl',  opacity: 'opacity-70' },
  { text: 'What if?',         top: '10%',  left: '30%', size: 'text-xs sm:text-sm',              opacity: 'opacity-55' },
  { text: 'Breakup',          top: '35%',  left: '36%', size: 'text-base sm:text-lg md:text-xl',  opacity: 'opacity-95' },
  { text: 'Not enough',       top: '55%',  left: '35%', size: 'text-sm sm:text-base md:text-lg',  opacity: 'opacity-65' },
  { text: 'Financial stress', top: '78%',  left: '80%', size: 'text-base sm:text-lg md:text-xl',  opacity: 'opacity-70' },
  { text: 'People pleasing',  top: '90%',  left: '29%', size: 'text-sm sm:text-base md:text-lg',  opacity: 'opacity-70' },

  // --- Center Area Words (Head / Silhouette ke upar) ---
  { text: 'Overthinking',     top: '11%',  left: '40%', size: 'text-lg sm:text-xl md:text-2xl', opacity: 'opacity-85' },
  { text: 'Guilt',            top: '25%',  left: '55%', size: 'text-lg sm:text-xl md:text-2xl', opacity: 'opacity-90' },
  { text: 'Regret',           top: '10%',  left: '60%', size: 'text-sm sm:text-base md:text-lg',  opacity: 'opacity-55' },

  // --- Right Side Words ---
  { text: 'Family',           top: '22%',  left: '75%', size: 'text-base sm:text-lg md:text-xl',  opacity: 'opacity-70' },
  { text: 'Uncertainty',      top: '22%',  left: '88%', size: 'text-xs sm:text-sm',              opacity: 'opacity-45' },
  { text: 'Career pressure',  top: '35%',  left: '65%', size: 'text-base sm:text-lg md:text-xl',  opacity: 'opacity-85' },
  { text: 'Failing',          top: '35%',  left: '92%', size: 'text-xs sm:text-sm',              opacity: 'opacity-40' },
  { text: 'Loneliness',       top: '45%',  left: '80%', size: 'text-xl sm:text-2xl md:text-3xl', opacity: 'opacity-95' },
  { text: 'Past mistakes',    top: '55%',  left: '65%', size: 'text-sm sm:text-base md:text-lg',  opacity: 'opacity-80' },
  { text: 'Judgement',        top: '55%',  left: '90%', size: 'text-xs sm:text-sm',              opacity: 'opacity-50' },
  { text: 'Comparison',       top: '70%',  left: '75%', size: 'text-base sm:text-lg md:text-xl',  opacity: 'opacity-75' },
];

export default function WordCloud({ customImg = '' }) {
  const container = useRef(null);
  const imgSrc = resolveImageUrl(customImg, silhouetteImg);

  useGSAP(() => {
    const words = gsap.utils.toArray('.floating-word');
    
    // Continuous natural floating effect for all words with gentle micro-sway
    words.forEach((word) => {
      const xMove = gsap.utils.random(-14, 14);
      const yMove = gsap.utils.random(-14, 14);
      const rot = gsap.utils.random(-3, 3);
      const dur = gsap.utils.random(3.5, 6.5);
      const delay = gsap.utils.random(0, 2);

      gsap.to(word, {
        x: xMove,
        y: yMove,
        rotation: rot,
        duration: dur,
        delay: delay,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        force3D: true,
      });
    });

  }, { scope: container });

  return (
    <div ref={container} className="relative w-full h-full min-h-[60vh] flex items-center justify-center overflow-hidden">
      
      {/* Silhouette Image Full Background - 100% Clear & High Contrast */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={imgSrc} 
          alt="Silhouette" 
          onError={(e) => {
            if (e.currentTarget.src !== silhouetteImg) {
              e.currentTarget.src = silhouetteImg;
            }
          }}
          className="w-full h-full object-cover object-[58%_center] sm:object-[62%_center] lg:object-[64%_center] opacity-100 contrast-[1.05] saturate-[1.05]"
        />
      </div>

      {/* Words Container */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Background Depth Words (Subtle depth of field behind the main aura) */}
        {WORDS.filter((_, i) => i % 2 === 0).map((word, i) => {
          const topOffset = (i % 3 === 0 ? 3 : -3);
          const leftOffset = (i % 2 === 0 ? 2 : -2);
          const topNum = Math.min(88, Math.max(5, parseFloat(word.top) + topOffset));
          const leftNum = Math.min(84, Math.max(37, parseFloat(word.left) + leftOffset));
          return (
            <div 
              key={`bg-${i}`}
              className="word-track absolute"
              style={{ 
                top: `${topNum}%`, 
                left: `${leftNum}%`,
                willChange: 'transform, opacity'
              }}
            >
              <span 
                className={`floating-word inline-block font-serif text-[#c9542f] ${word.size} opacity-25 whitespace-nowrap z-0 blur-[2px] scale-90 select-none`}
              >
                {word.text}
              </span>
            </div>
          );
        })}

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
              className={`floating-word inline-block font-serif text-[#c9542f] font-medium ${word.size} ${word.opacity} whitespace-nowrap z-10 select-none drop-shadow-[0_1px_4px_rgba(201,84,47,0.15)]`}
            >
              {word.text}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
