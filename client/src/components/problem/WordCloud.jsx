import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { resolveImageUrl } from '../../utils/imageUrl';
import silhouetteImg from '../../assets/Page2/problem_silhouette.png';

gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// 🎛️ WORD CLOUD CONTROLS - (Customize Positions, Sizes & Colors Here)
// =========================================================================
// • top / left   : Desktop Position in % (e.g., top: '20%', left: '70%')
// • mTop / mLeft : Mobile Position in %
// • size         : Font size in px (e.g., 18)
// • color        : Hex color code (e.g., '#c9542f')
// • opacity      : Tailwind opacity class (e.g., 'opacity-90')
// =========================================================================
export const WORDS = [
  // --- TOP SECTION ---
  { text: 'Self doubt',       top: '5%',   left: '60%', mTop: '5%',   mLeft: '48%', size: 15,   color: '#2b2823', opacity: 'opacity-85' },
  { text: 'Regret',           top: '9%',   left: '78%', mTop: '10%',  mLeft: '72%', size: 16,   color: '#475569', opacity: 'opacity-75' },
  { text: 'Uncertainty',      top: '15%',  left: '65%', mTop: '16%',  mLeft: '22%', size: 18,   color: '#4f46e5', opacity: 'opacity-70' },
  { text: 'Overthinking',     top: '17%',  left: '90%', mTop: '22%',  mLeft: '56%', size: 23,   color: '#c9542f', opacity: 'opacity-95', weight: 'font-semibold' },
  
  // --- UPPER-MID SECTION ---
  { text: 'Guilt',            top: '24%',  left: '55%', mTop: '28%',  mLeft: '14%', size: 13.5, color: '#854d0e', opacity: 'opacity-90' },
  { text: 'What if?',         top: '29%',  left: '71%', mTop: '34%',  mLeft: '68%', size: 17,   color: '#5b67ca', opacity: 'opacity-75' },
  { text: 'Family',           top: '33%',  left: '87%', mTop: '40%',  mLeft: '40%', size: 16,   color: '#047857', opacity: 'opacity-85' },

  // --- CENTER SECTION ---
  { text: 'Career pressure',  top: '38%',  left: '58%', mTop: '46%',  mLeft: '18%', size: 21,   color: '#d97706', opacity: 'opacity-90' },
  { text: 'Failing',          top: '43%',  left: '81%', mTop: '52%',  mLeft: '72%', size: 14.5, color: '#be123c', opacity: 'opacity-65' },
  { text: 'Breakup',          top: '48%',  left: '66%', mTop: '58%',  mLeft: '32%', size: 16.5, color: '#be185d', opacity: 'opacity-95' },
  { text: 'Loneliness',       top: '54%',  left: '78%', mTop: '64%',  mLeft: '66%', size: 19,   color: '#854d0e', opacity: 'opacity-95' },
  
  // --- LOWER-MID SECTION ---
  { text: 'Not enough',       top: '57%',  left: '60%', mTop: '70%',  mLeft: '14%', size: 15,   color: '#92400e', opacity: 'opacity-80' },
  { text: 'Past mistakes',    top: '64%',  left: '67%', mTop: '76%',  mLeft: '50%', size: 17,   color: '#15803d', opacity: 'opacity-85' },
  { text: 'Judgement',        top: '68%',  left: '85%', mTop: '82%',  mLeft: '76%', size: 14.5, color: '#a16207', opacity: 'opacity-70' },

  // --- BOTTOM SECTION ---
  { text: 'Comparison',       top: '80%',  left: '60%', mTop: '87%',  mLeft: '20%', size: 17.5, color: '#4f46e5', opacity: 'opacity-80' },
  { text: 'People pleasing',  top: '81%',  left: '71%', mTop: '92%',  mLeft: '58%', size: 16,   color: '#c026d3', opacity: 'opacity-85' },
  { text: 'Financial stress', top: '86%',  left: '87%', mTop: '96%',  mLeft: '18%', size: 20,   color: '#15803d', opacity: 'opacity-85' },
];

export default function WordCloud({ customImg = '', wordColor = '', wordFontSize = 18 }) {
  const container = useRef(null);
  const imgSrc = resolveImageUrl(customImg, silhouetteImg);
  const scaleRatio = (Number(wordFontSize) || 18) / 18;

  useGSAP(() => {
    const words = gsap.utils.toArray('.floating-word');
    
    // Continuous gentle floating effect with bounded motion to prevent collisions
    words.forEach((word) => {
      const xMove = gsap.utils.random(-8, 8);
      const yMove = gsap.utils.random(-8, 8);
      const rot = gsap.utils.random(-2, 2);
      const dur = gsap.utils.random(4, 7);
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
        {/* Floating Words */}
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
