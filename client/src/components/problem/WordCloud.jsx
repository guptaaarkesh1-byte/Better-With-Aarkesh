import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { resolveImageUrl } from '../../utils/imageUrl';
import silhouetteImg from '../../assets/Page2/problem_silhouette.png';

gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// 🎛️ WORD CLOUD POSITION & STYLE CONTROLS
// Responsive desktop & mobile coordinate positioning with varied font sizes
// =========================================================================
const WORDS = [
  // --- Upper Cloud & Crown ---
  { text: 'Self doubt',       top: '2%',   left: '34%', mTop: '4%',   mLeft: '46%', opacity: 'opacity-85', color: '#2b2823', size: 15 },
  { text: 'What if?',         top: '10%',  left: '30%', mTop: '8%',   mLeft: '12%', opacity: 'opacity-75', color: '#5b67ca', size: 19 },
  { text: 'Regret',           top: '10%',  left: '60%', mTop: '7%',   mLeft: '70%', opacity: 'opacity-75', color: '#374151', size: 16 },
  { text: 'Overthinking',     top: '11%',  left: '40%', mTop: '13%',  mLeft: '34%', opacity: 'opacity-95', color: '#c9542f', size: 24, weight: 'font-semibold' },
  { text: 'Guilt',            top: '25%',  left: '55%', mTop: '18%',  mLeft: '22%', opacity: 'opacity-90', color: '#854d0e', size: 13 },
  { text: 'Family',           top: '22%',  left: '75%', mTop: '19%',  mLeft: '68%', opacity: 'opacity-85', color: '#047857', size: 16 },
  { text: 'Uncertainty',      top: '22%',  left: '88%', mTop: '26%',  mLeft: '72%', opacity: 'opacity-70', color: '#4f46e5', size: 18 },

  // --- Mid Body & Chest (Left & Right Flanks) ---
  { text: 'Breakup',          top: '35%',  left: '36%', mTop: '32%',  mLeft: '8%',  opacity: 'opacity-95', color: '#be185d', size: 17.5 },
  { text: 'Career pressure',  top: '35%',  left: '65%', mTop: '36%',  mLeft: '65%', opacity: 'opacity-90', color: '#d97706', size: 21 },
  { text: 'Failing',          top: '35%',  left: '92%', mTop: '43%',  mLeft: '74%', opacity: 'opacity-65', color: '#be123c', size: 14 },
  { text: 'Loneliness',       top: '45%',  left: '80%', mTop: '46%',  mLeft: '14%', opacity: 'opacity-95', color: '#854d0e', size: 18.5 },
  { text: 'Past mistakes',    top: '55%',  left: '65%', mTop: '54%',  mLeft: '64%', opacity: 'opacity-85', color: '#15803d', size: 17 },
  { text: 'Not enough',       top: '55%',  left: '35%', mTop: '58%',  mLeft: '6%',  opacity: 'opacity-80', color: '#92400e', size: 14.5 },

  // --- Lower Torso & Legs ---
  { text: 'Judgement',        top: '55%',  left: '90%', mTop: '64%',  mLeft: '74%', opacity: 'opacity-70', color: '#a16207', size: 14 },
  { text: 'Comparison',       top: '70%',  left: '75%', mTop: '72%',  mLeft: '18%', opacity: 'opacity-80', color: '#4f46e5', size: 17 },
  { text: 'Financial stress', top: '78%',  left: '80%', mTop: '80%',  mLeft: '66%', opacity: 'opacity-85', color: '#15803d', size: 20 },
  { text: 'People pleasing',  top: '90%',  left: '29%', mTop: '88%',  mLeft: '28%', opacity: 'opacity-85', color: '#c026d3', size: 16.5 },
];

export default function WordCloud({ customImg = '', wordColor = '', wordFontSize = 18 }) {
  const container = useRef(null);
  const imgSrc = resolveImageUrl(customImg, silhouetteImg);
  const scaleRatio = (Number(wordFontSize) || 18) / 18;

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
      <style>{`
        ${WORDS.map((w, i) => `
          .word-pos-${i} {
            top: ${w.mTop || w.top};
            left: ${w.mLeft || w.left};
          }
          @media (min-width: 1024px) {
            .word-pos-${i} {
              top: ${w.top};
              left: ${w.left};
            }
          }
        `).join('')}
      `}</style>
      
      {/* Silhouette Image Full Background - Perfectly Centered on Mobile, Shifted to Right on Desktop */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={imgSrc} 
          alt="Silhouette" 
          onError={(e) => {
            if (e.currentTarget.src !== silhouetteImg) {
              e.currentTarget.src = silhouetteImg;
            }
          }}
          className="w-full h-full object-cover object-[50%_center] sm:object-[54%_center] lg:object-[64%_center] opacity-100 contrast-[1.05] saturate-[1.05]"
        />
      </div>

      {/* Words Container */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Background Depth Words (Subtle depth of field behind the main aura) */}
        {WORDS.filter((_, i) => i % 2 === 0).map((word, i) => {
          const origIdx = i * 2;
          const fontSizePx = (word.size || 18) * scaleRatio;
          return (
            <div 
              key={`bg-${i}`}
              className={`word-track absolute word-pos-${origIdx}`}
              style={{ 
                willChange: 'transform, opacity'
              }}
            >
              <span 
                className={`floating-word inline-block font-serif ${word.weight || 'font-medium'} opacity-25 whitespace-nowrap z-0 blur-[2px] scale-90 select-none`}
                style={{ 
                  color: wordColor || word.color,
                  fontSize: `${fontSizePx}px`
                }}
              >
                {word.text}
              </span>
            </div>
          );
        })}

        {/* Foreground Floating Words */}
        {WORDS.map((word, i) => {
          const fontSizePx = (word.size || 18) * scaleRatio;
          return (
            <div 
              key={`fg-${i}`}
              className={`word-track absolute word-pos-${i}`}
              style={{ 
                willChange: 'transform, opacity'
              }}
            >
              <span 
                className={`floating-word inline-block font-serif ${word.weight || 'font-medium'} ${word.opacity} whitespace-nowrap z-10 select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]`}
                style={{ 
                  color: wordColor || word.color,
                  fontSize: `${fontSizePx}px`
                }}
              >
                {word.text}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
