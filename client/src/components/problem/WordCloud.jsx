import { useRef } from 'react';
import { resolveImageUrl } from '../../utils/imageUrl';
import silhouetteImg from '../../assets/Page2/problem_silhouette.png';

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
  // --- TOP SECTION (Above head / Sky cloud) ---
  { text: 'Self doubt',       top: '5%',   left: '58%', mTop: '3%',   mLeft: '28%', size: 14.5, color: '#2b2823', opacity: 'opacity-85' },
  { text: 'Regret',           top: '9%',   left: '78%', mTop: '8%',   mLeft: '72%', size: 15.5, color: '#475569', opacity: 'opacity-75' },
  { text: 'Uncertainty',      top: '15%',  left: '64%', mTop: '12%',  mLeft: '8%',  size: 16.5, color: '#4f46e5', opacity: 'opacity-70' },
  { text: 'Overthinking',     top: '17%',  left: '88%', mTop: '17%',  mLeft: '52%', size: 21,   color: '#c9542f', opacity: 'opacity-95', weight: 'font-semibold' },
  
  // --- UPPER-MID SECTION (Scattered around shoulders / upper torso) ---
  { text: 'Guilt',            top: '24%',  left: '54%', mTop: '25%',  mLeft: '14%', size: 13,   color: '#854d0e', opacity: 'opacity-90' },
  { text: 'What if?',         top: '29%',  left: '72%', mTop: '27%',  mLeft: '75%', size: 16,   color: '#5b67ca', opacity: 'opacity-75' },
  { text: 'Career pressure',  top: '36%',  left: '57%', mTop: '34%',  mLeft: '3%',  size: 18,   color: '#d97706', opacity: 'opacity-90' },
  { text: 'Family',           top: '33%',  left: '87%', mTop: '37%',  mLeft: '68%', size: 15.5, color: '#047857', opacity: 'opacity-85' },

  // --- CENTER SECTION (Organic scattered depth around torso) ---
  { text: 'Failing',          top: '43%',  left: '81%', mTop: '46%',  mLeft: '78%', size: 14,   color: '#be123c', opacity: 'opacity-65' },
  { text: 'Breakup',          top: '48%',  left: '66%', mTop: '48%',  mLeft: '12%', size: 15.5, color: '#be185d', opacity: 'opacity-95' },
  { text: 'Loneliness',       top: '54%',  left: '78%', mTop: '56%',  mLeft: '64%', size: 18,   color: '#854d0e', opacity: 'opacity-95' },
  { text: 'Not enough',       top: '57%',  left: '59%', mTop: '58%',  mLeft: '2%',  size: 14.5, color: '#92400e', opacity: 'opacity-80' },
  
  // --- LOWER SECTION (Scattered around hips and legs) ---
  { text: 'Judgement',        top: '68%',  left: '85%', mTop: '67%',  mLeft: '76%', size: 14,   color: '#a16207', opacity: 'opacity-70' },
  { text: 'Past mistakes',    top: '64%',  left: '67%', mTop: '71%',  mLeft: '14%', size: 15.5, color: '#15803d', opacity: 'opacity-85' },
  { text: 'Comparison',       top: '80%',  left: '58%', mTop: '79%',  mLeft: '3%',  size: 16,   color: '#4f46e5', opacity: 'opacity-80' },
  { text: 'People pleasing',  top: '81%',  left: '72%', mTop: '83%',  mLeft: '62%', size: 15,   color: '#c026d3', opacity: 'opacity-85' },
  { text: 'Financial stress', top: '86%',  left: '87%', mTop: '91%',  mLeft: '18%', size: 18,   color: '#15803d', opacity: 'opacity-85' },
];

export default function WordCloud({ customImg = '', wordColor = '', wordFontSize = 18 }) {
  const container = useRef(null);
  const imgSrc = resolveImageUrl(customImg, silhouetteImg);
  const scaleRatio = (Number(wordFontSize) || 18) / 18;

  return (
    <div ref={container} className="relative w-full h-full min-h-full flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes bwaFloatA {
          0%, 100% {
            transform: translate3d(0px, 0px, 0) rotate(0deg);
          }
          33% {
            transform: translate3d(4px, -6px, 0) rotate(0.6deg);
          }
          66% {
            transform: translate3d(-5px, 5px, 0) rotate(-0.5deg);
          }
        }
        @keyframes bwaFloatB {
          0%, 100% {
            transform: translate3d(0px, 0px, 0) rotate(0deg);
          }
          33% {
            transform: translate3d(-5px, -7px, 0) rotate(-0.7deg);
          }
          66% {
            transform: translate3d(5px, 4px, 0) rotate(0.5deg);
          }
        }
        @keyframes bwaFloatC {
          0%, 100% {
            transform: translate3d(0px, 0px, 0) rotate(0deg);
          }
          33% {
            transform: translate3d(5px, 6px, 0) rotate(0.6deg);
          }
          66% {
            transform: translate3d(-4px, -7px, 0) rotate(-0.6deg);
          }
        }
        @keyframes bwaFloatD {
          0%, 100% {
            transform: translate3d(0px, 0px, 0) rotate(0deg);
          }
          33% {
            transform: translate3d(-4px, 5px, 0) rotate(-0.6deg);
          }
          66% {
            transform: translate3d(5px, -6px, 0) rotate(0.6deg);
          }
        }

        ${WORDS.map((w, i) => {
          const animName = i % 4 === 0 ? 'bwaFloatA' : i % 4 === 1 ? 'bwaFloatB' : i % 4 === 2 ? 'bwaFloatC' : 'bwaFloatD';
          const duration = (10.5 + ((i * 1.37) % 5.5)).toFixed(1) + 's';
          const delay = (-1.2 * (i + 1)).toFixed(1) + 's';
          return `
          .word-pos-${i} {
            top: ${w.mTop || w.top};
            left: ${w.mLeft || w.left};
            animation: ${animName} ${duration} ease-in-out infinite alternate;
            animation-delay: ${delay};
          }
          @media (min-width: 1024px) {
            .word-pos-${i} {
              top: ${w.top};
              left: ${w.left};
            }
          }
        `;}).join('')}
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
          className="w-full h-full object-cover object-[50%_center] sm:object-[54%_center] lg:object-[64%_center] opacity-100"
        />
        {/* Top 20% seamless gradient blend */}
        <div className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-[#fcefe0] lg:from-[#f5f1e8] to-transparent pointer-events-none" />
        {/* Bottom 20% seamless gradient blend */}
        <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-[#f6e7d8] lg:from-[#f5f1e8] to-transparent pointer-events-none" />
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
