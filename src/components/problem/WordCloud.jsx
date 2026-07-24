import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import silhouetteImg from '../../assets/Page2/ChatGPT Image Jul 24, 2026, 01_49_09 PM.png';

gsap.registerPlugin(ScrollTrigger);

const WORDS = [
  { text: 'Overthinking', top: '15%', left: '40%', size: 'text-2xl', opacity: 'opacity-70' },
  { text: 'Regret', top: '10%', left: '60%', size: 'text-lg', opacity: 'opacity-40' },
  { text: 'Self doubt', top: '7%', left: '25%', size: 'text-xl', opacity: 'opacity-60' },
  { text: 'Guilt', top: '25%', left: '55%', size: 'text-2xl', opacity: 'opacity-80' },
  { text: 'Family', top: '22%', left: '75%', size: 'text-xl', opacity: 'opacity-60' },
  { text: 'Uncertainty', top: '22%', left: '88%', size: 'text-sm', opacity: 'opacity-30' },
  { text: 'Breakup', top: '35%', left: '32%', size: 'text-xl', opacity: 'opacity-90' },
  { text: 'Career pressure', top: '35%', left: '65%', size: 'text-xl', opacity: 'opacity-80' },
  { text: 'Failing', top: '35%', left: '92%', size: 'text-sm', opacity: 'opacity-20' },
  { text: 'People pleasing', top: '40%', left: '25%', size: 'text-lg', opacity: 'opacity-60' },
  { text: 'Loneliness', top: '45%', left: '80%', size: 'text-3xl', opacity: 'opacity-90' },
  { text: 'Not enough', top: '55%', left: '35%', size: 'text-lg', opacity: 'opacity-50' },
  { text: 'Past mistakes', top: '55%', left: '65%', size: 'text-lg', opacity: 'opacity-70' },
  { text: 'Judgement', top: '55%', left: '90%', size: 'text-sm', opacity: 'opacity-30' },
  { text: 'Financial stress', top: '65%', left: '25%', size: 'text-xl', opacity: 'opacity-60' },
  { text: 'Comparison', top: '70%', left: '75%', size: 'text-xl', opacity: 'opacity-50' },
  { text: 'What if?', top: '12%', left: '30%', size: 'text-sm', opacity: 'opacity-40' },
];

export default function WordCloud() {
  const container = useRef(null);

  useGSAP(() => {
    const words = gsap.utils.toArray('.floating-word');
    
    // Fade in all words when they scroll into view
    gsap.from(words, {
      opacity: 0,
      scale: 0.8,
      duration: 1.2,
      stagger: 0.03,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 75%',
      }
    });

    // Parallax floating effect for the words
    words.forEach((word) => {
      // Randomize movement per word for a visible medium-paced floating effect
      const xMove = gsap.utils.random(-25, 25);
      const yMove = gsap.utils.random(-25, 25);
      const rot = gsap.utils.random(-2, 2);
      const dur = gsap.utils.random(4, 8);

      gsap.to(word, {
        x: xMove,
        y: yMove,
        rotation: rot,
        duration: dur,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });

  }, { scope: container });

  return (
    <div ref={container} className="relative w-full h-full min-h-[60vh] flex items-center justify-center overflow-hidden">
      
      {/* Silhouette Image Full Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={silhouetteImg} 
          alt="Silhouette"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay to ensure text readability if needed */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Background Gradient / Haze */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent opacity-50 z-0 pointer-events-none" />

      {/* Background Floating Words (Blurred for depth of field) */}
      {WORDS.map((word, i) => (
        <span 
          key={`bg-${i}`}
          className={`floating-word absolute font-serif text-heading ${word.size} opacity-20 whitespace-nowrap z-0 blur-sm scale-75`}
          style={{ 
            // Shift positions so they don't perfectly align with the foreground ones
            top: `${(parseFloat(word.top) + (i % 2 === 0 ? 15 : -10) + 100) % 95}%`, 
            left: `${(parseFloat(word.left) + (i % 3 === 0 ? -20 : 25) + 100) % 95}%` 
          }}
        >
          {word.text}
        </span>
      ))}

      {/* Foreground Floating Words */}
      {WORDS.map((word, i) => (
        <span 
          key={`fg-${i}`}
          className={`floating-word absolute font-serif text-heading ${word.size} ${word.opacity} whitespace-nowrap z-10`}
          style={{ top: word.top, left: word.left }}
        >
          {word.text}
        </span>
      ))}



    </div>
  );
}
