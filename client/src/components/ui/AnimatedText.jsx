import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '../../utils/cn';

gsap.registerPlugin(useGSAP);

export default function AnimatedText({ text, className, tag: Tag = 'p', delay = 0, stagger = 0.15 }) {
  const container = useRef(null);

  useGSAP(() => {
    gsap.fromTo('.word', 
      { x: -30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: 'power4.out',
        stagger: stagger,
        delay: delay,
      }
    );
  }, { scope: container });

  const words = text.split(' ');

  return (
    <Tag ref={container} className={cn('overflow-hidden flex flex-wrap', className)}>
      {words.map((word, i) => (
        <span key={i} className="word inline-block mr-[0.25em] pb-[0.1em]">
          {word}
        </span>
      ))}
    </Tag>
  );
}
