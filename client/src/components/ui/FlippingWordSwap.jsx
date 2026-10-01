import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { cn } from '../../utils/cn';

const graphemeSegmenter =
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

function segmentCharacters(text) {
  if (!text) return [];
  if (!graphemeSegmenter) return Array.from(text);
  return Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment);
}

export function FlippingWordSwap({
  word1,
  word2 = word1,
  active = false,
  duration = 380,
  stagger = 36,
  className = '',
  toClassName = '',
  style = {},
  toStyle = {},
  onClick
}) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const swappedRef = useRef(false);
  const [isSwapped, setIsSwapped] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resolvedDuration = prefersReducedMotion
      ? 0
      : Math.max(160, duration) / 1000;
    const resolvedStagger = prefersReducedMotion
      ? 0
      : Math.max(0, stagger) / 1000;

    const context = gsap.context(() => {
      const firstWord = gsap.utils.toArray('[data-flip-word="first"]', containerRef.current);
      const secondWord = gsap.utils.toArray('[data-flip-word="second"]', containerRef.current);

      gsap.set(firstWord, {
        rotationX: 0,
        opacity: 1,
        transformOrigin: 'center top',
      });
      gsap.set(secondWord, {
        rotationX: -85,
        opacity: 0,
        transformOrigin: 'center bottom',
      });

      const timeline = gsap.timeline({ paused: true });
      timeline
        .to(firstWord, {
          rotationX: 85,
          opacity: 0,
          duration: resolvedDuration,
          stagger: resolvedStagger,
          ease: 'power2.in',
        })
        .to(
          secondWord,
          {
            rotationX: 0,
            opacity: 1,
            duration: resolvedDuration,
            stagger: resolvedStagger,
            ease: 'power2.out',
          },
          `<${resolvedDuration * 0.6}`
        );

      if (swappedRef.current || active) {
        timeline.progress(1);
      }
      timelineRef.current = timeline;
    }, containerRef);

    return () => {
      timelineRef.current = null;
      context.revert();
    };
  }, [duration, stagger, word1, word2, active]);

  useEffect(() => {
    if (active) {
      swappedRef.current = true;
      setIsSwapped(true);
      timelineRef.current?.play();
    } else if (!containerRef.current?.matches(':hover')) {
      swappedRef.current = false;
      setIsSwapped(false);
      timelineRef.current?.reverse();
    }
  }, [active]);

  const updateSwap = useCallback((next) => {
    if (active) return;
    swappedRef.current = next;
    setIsSwapped(next);

    if (next) {
      timelineRef.current?.play();
    } else {
      timelineRef.current?.reverse();
    }
  }, [active]);

  const handleClick = (e) => {
    // Trigger animation immediately on click as well
    timelineRef.current?.restart();
    if (onClick) onClick(e);
  };

  const renderCharacters = (text, layer) =>
    segmentCharacters(text).map((character, index) => (
      <span
        key={`${layer}-${index}-${character}`}
        data-flip-word={layer}
        className="inline-block whitespace-pre [backface-visibility:hidden] [will-change:transform,opacity]"
      >
        {character === ' ' ? '\u00a0' : character}
      </span>
    ));

  return (
    <span
      ref={containerRef}
      className={cn(
        'relative inline-grid cursor-pointer select-none border-0 bg-transparent p-0 align-baseline font-[inherit] leading-[inherit] tracking-[inherit]',
        'focus-visible:outline-none transition-colors duration-250',
        active ? 'text-[#C878BE] font-semibold' : 'text-white/80 hover:text-[#C878BE]',
        className
      )}
      style={style}
      onMouseEnter={() => updateSwap(true)}
      onMouseLeave={() => updateSwap(false)}
      onClick={handleClick}
    >
      <span className="col-start-1 row-start-1 inline-grid overflow-hidden [perspective:800px]">
        <span
          className="col-start-1 row-start-1 inline-flex items-baseline justify-center gap-[0.012em] whitespace-pre"
          aria-hidden="true"
        >
          {renderCharacters(word1, 'first')}
        </span>
        <span
          className={cn(
            'col-start-1 row-start-1 inline-flex items-baseline justify-center gap-[0.012em] whitespace-pre text-[#C878BE] drop-shadow-[0_0_12px_rgba(200,120,190,0.6)] font-semibold',
            toClassName
          )}
          aria-hidden="true"
          style={toStyle}
        >
          {renderCharacters(word2, 'second')}
        </span>
      </span>
    </span>
  );
}

export default FlippingWordSwap;
