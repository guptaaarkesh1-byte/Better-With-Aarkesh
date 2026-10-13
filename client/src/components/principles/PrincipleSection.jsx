import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import PrincipleContent from './PrincipleContent';
import PrincipleProgress from './PrincipleProgress';

// =========================================================================
// 🎛️ SCROLL-DRIVEN "MY IDEOLOGY" OVERLAY CONFIGURATION (THINK PRINCIPLE)
// Easily adjust the peak point, max blur amounts, and display text here
// =========================================================================
export const IDEOLOGY_CONFIG = {
  peakStart: 0.15,         // Scroll progress where blur & text reach full strength (15%)
  fadeStart: 0.40,         // Scroll progress where smooth fade-out begins (40%)
  fadeEnd: 0.75,           // Scroll progress where blur & text are completely faded out (75%)
  maxBlurDesktop: 18,      // Max blur on desktop in pixels (18px)
  maxBlurMobile: 12,       // Max blur on mobile in pixels (12px, screens < 768px)
  textMain: 'MY',          // Main title text
  textAccent: 'IDEOLOGY',  // Accent word (styled with brand accent color)
  startY: 10,              // Initial translateY at p = 0 (+10px)
  peakY: 0,                // Center translateY at p = peak (0px)
  endY: -10,               // Final translateY at p = fadeEnd (-10px)
};

gsap.registerPlugin(ScrollTrigger);
export default function PrincipleSection({
  id,
  bgImg,
  eyebrow,
  headlineWhite,
  headlineGold,
  headlineGoldItalic,
  paragraphs,
  buttonText,
  activeStep,
  bannerTitle,
  bannerIcon,
  bannerSteps,
  transitionText,
  customTransitionFlow,
  contentClassName = '',
  imagePosition = 'object-[80%_center]',
  maxContentWidth,
  eyebrowFontSize,
  headingFontSize,
  descriptionFontSize,
  buttonFontSize
}) {
  const sectionRef = useRef(null);
  const isThinkPage = id === 'think-principle';
  const isFeelPage  = id === 'feel-principle';

  // ── Image loading state ──────────────────────────────────────────────────
  // Start as loaded=true so the image is immediately visible (no opacity-0 flash).
  // If bgImg changes (API returns a different URL) we keep it visible.
  const [isLoaded, setIsLoaded] = useState(true);
  const loadedSrcRef = useRef(null);

  useEffect(() => {
    if (!bgImg) return;
    if (bgImg === loadedSrcRef.current) return; // same URL, already shown
    // New URL – keep visible; the browser handles the actual fetch.
    loadedSrcRef.current = bgImg;
  }, [bgImg]);

  useGSAP(() => {
    // === THINK PAGE ANIMATIONS ===
    if (isThinkPage) {
      if (document.querySelector('.sunlight-overlay')) {
        gsap.to('.sunlight-overlay', {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 10%',
          },
          opacity: 1,
          duration: 1.5,
          ease: 'power2.out',
        });
      }
    }
  }, { scope: sectionRef });

  useEffect(() => {
    if (!isThinkPage) return undefined;

    const overlay = sectionRef.current?.querySelector('.think-ideology-overlay');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!overlay || !sectionRef.current) return undefined;
    const title = overlay.querySelector('.think-ideology-title');

    let animationFrame = null;
    const setHidden = (y = IDEOLOGY_CONFIG.startY) => {
      overlay.style.backdropFilter = 'none';
      overlay.style.webkitBackdropFilter = 'none';
      overlay.style.backgroundColor = 'transparent';
      overlay.style.setProperty('--ideology-blur', '0px');
      overlay.style.setProperty('--ideology-opacity', '0');
      overlay.style.setProperty('--ideology-y', `${y}px`);
      overlay.style.visibility = 'hidden';
      if (title) {
        title.style.opacity = '0';
        title.style.transform = `translateY(${y}px)`;
      }
    };

    const updateOverlay = () => {
      animationFrame = null;
      if (reducedMotion.matches) {
        setHidden();
        return;
      }

      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // ─────────────────────────────────────────────────────────────────
      // PROGRESS CALCULATION:
      // p = 0: THINK section's top edge is at bottom of viewport (rect.top === vh)
      // p = 1: THINK section's top edge reaches top of viewport (rect.top === 0)
      // ─────────────────────────────────────────────────────────────────
      const rawP = 1 - rect.top / vh;
      const progress = Math.min(Math.max(rawP, 0), 1);

      const { peakStart, fadeStart, fadeEnd, startY, peakY, endY, maxBlurMobile, maxBlurDesktop } = IDEOLOGY_CONFIG;

      if (progress <= 0 || progress >= fadeEnd) {
        setHidden(progress <= 0 ? startY : endY);
        return;
      }

      const maxBlur = window.innerWidth < 768 ? maxBlurMobile : maxBlurDesktop;

      let blur = 0;
      let opacity = 0;
      let y = peakY;

      if (progress <= peakStart) {
        // Phase 1 (0 -> 0.15): Ease-in ramp up as Think enters
        const phase = progress / peakStart;
        const curve = 1 - (1 - phase) * (1 - phase);
        blur = maxBlur * curve;
        opacity = curve;
        y = startY + (peakY - startY) * curve;
      } else if (progress <= fadeStart) {
        // Phase 2 (0.15 -> 0.40): Steady full peak — strong blur & visible text
        blur = maxBlur;
        opacity = 1;
        y = peakY;
      } else {
        // Phase 3 (0.40 -> 0.75): After 40% scroll, smoothly fade out both blur and text in exact sync
        const phase = (progress - fadeStart) / (fadeEnd - fadeStart);
        const smoothDecrease = 0.5 * (1 + Math.cos(phase * Math.PI));
        blur = maxBlur * smoothDecrease;
        opacity = smoothDecrease;
        y = endY + (peakY - endY) * smoothDecrease;
      }

      const blurVal = blur.toFixed(1);
      const opVal = opacity.toFixed(3);
      const yVal = y.toFixed(1);

      // Explicitly set backdropFilter directly on style so all browsers immediately composite the blur on GPU
      overlay.style.backdropFilter = blur > 0.1 ? `blur(${blurVal}px)` : 'none';
      overlay.style.webkitBackdropFilter = blur > 0.1 ? `blur(${blurVal}px)` : 'none';
      overlay.style.backgroundColor = opacity > 0.01 ? `rgba(245, 241, 232, ${(opacity * 0.42).toFixed(3)})` : 'transparent';
      overlay.style.setProperty('--ideology-blur', `${blurVal}px`);
      overlay.style.setProperty('--ideology-opacity', opVal);
      overlay.style.setProperty('--ideology-y', `${yVal}px`);
      overlay.style.visibility = opacity > 0.005 ? 'visible' : 'hidden';

      // Explicitly set opacity and transform directly on the title element so text smoothly fades out identically to the blur
      if (title) {
        title.style.opacity = opVal;
        title.style.transform = `translateY(${yVal}px)`;
      }
    };

    const requestUpdate = () => {
      if (animationFrame === null) animationFrame = window.requestAnimationFrame(updateOverlay);
    };
    const handleMotionPreference = () => requestUpdate();

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    reducedMotion.addEventListener('change', handleMotionPreference);

    if (window.lenis) {
      window.lenis.on('scroll', requestUpdate);
    }

    requestUpdate();

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      reducedMotion.removeEventListener('change', handleMotionPreference);
      if (window.lenis) {
        window.lenis.off('scroll', requestUpdate);
      }
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, [isThinkPage]);

  /*
   * ── SECTION CLASSES ────────────────────────────────────────────────────
   *
   * Library-style stacking (Problem → Think only):
   *
   *  Problem → sticky at top:0 (pinned card)
   *  Think   → principle-slide-over (rounded top + drop-shadow card that slides over Problem)
   *  Others  → normal relative + snap-section
   */
  const sectionClass = isThinkPage
    ? 'principle-slide-over'
    : 'relative z-30 overflow-hidden snap-section';

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`principle-panel ${sectionClass} w-full h-auto lg:h-screen flex flex-col bg-[#f5f1e8] relative`}
    >

      {/* ─── MOBILE VIEW ─── */}
      <div className={`block lg:hidden w-full relative ${isThinkPage ? '' : 'border-t border-black/10'}`}>
        {/* Media Container with Image & Bottom Fade */}
        <div className="relative h-[360px] w-full overflow-hidden bg-[#ede6d8]">
          {/* Shimmer – only shown when image src is not yet known */}
          {!bgImg && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#ede6d8] via-[#f7f2e8] to-[#ede6d8] animate-pulse" />
          )}

          {bgImg && (
            <img
              src={bgImg}
              alt="Principle"
              className={`w-full h-full object-cover transition-opacity duration-700 ${imagePosition || 'object-center'}`}
            />
          )}
          {/* Bottom gradient fade */}
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#f5f1e8] via-[#f5f1e8]/80 to-transparent pointer-events-none" />
        </div>

        {/* Content Body */}
        <div className="relative -mt-[72px] px-5 pb-12 z-10">
          <PrincipleContent
            id={id}
            eyebrow={eyebrow}
            headlineWhite={headlineWhite}
            headlineGold={headlineGold}
            headlineGoldItalic={headlineGoldItalic}
            paragraphs={paragraphs}
            buttonText={buttonText}
            maxContentWidth="w-full"
            eyebrowFontSize={eyebrowFontSize}
            headingFontSize={headingFontSize}
            descriptionFontSize={descriptionFontSize}
            buttonFontSize={buttonFontSize}
          />
        </div>
      </div>

      {/* ─── DESKTOP VIEW ─── */}
      <div className={`hidden lg:flex relative flex-grow items-center justify-center pt-24 pb-16 lg:pt-28 lg:pb-20 ${contentClassName}`}>

        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[#f5f1e8]">
          {/* Shimmer – only while no src is available */}
          {!bgImg && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8] via-[#ede6d8] to-[#f5f1e8] animate-pulse" />
          )}

          {bgImg && (
            <img
              src={bgImg}
              alt="Principle Background"
              className={`w-full h-full object-cover contrast-[1.08] saturate-[1.05] ${imagePosition || 'object-[75%_center] lg:object-[78%_center]'}`}
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          )}

          {/* Left text backdrop */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8] via-[#f5f1e8]/60 via-40% to-transparent w-[48%] md:w-[38%]" />
          {/* Top edge */}
          <div className="absolute inset-x-0 top-0 h-12 lg:h-16 bg-gradient-to-b from-[#f5f1e8] to-transparent pointer-events-none z-10" />
          {/* Bottom edge */}
          <div className="absolute inset-x-0 bottom-0 h-12 lg:h-16 bg-gradient-to-t from-[#f5f1e8] to-transparent pointer-events-none z-10" />
        </div>

        <Container className="relative z-10 w-full h-full flex items-center">

          {/* Left Side Content */}
          <div className="w-full lg:w-[65%] shrink-0">
            <PrincipleContent
              id={id}
              eyebrow={eyebrow}
              headlineWhite={headlineWhite}
              headlineGold={headlineGold}
              headlineGoldItalic={headlineGoldItalic}
              paragraphs={paragraphs}
              buttonText={buttonText}
              maxContentWidth={maxContentWidth}
              eyebrowFontSize={eyebrowFontSize}
              headingFontSize={headingFontSize}
              descriptionFontSize={descriptionFontSize}
              buttonFontSize={buttonFontSize}
            />
          </div>

          {/* Right Side – reserved for global progress bar overlay */}
          <div className="hidden lg:flex w-full justify-end pr-8 pointer-events-none" />

        </Container>
      </div>

      {/* ─── SCROLL-DRIVEN BLUR + "MY IDEOLOGY" OVERLAY (THINK PRINCIPLE ONLY) ─── */}
      {isThinkPage && (
        <div
          className="think-ideology-overlay absolute inset-0 z-50 flex items-start justify-center pt-3 sm:pt-4 md:pt-5 lg:pt-6 pointer-events-none"
          aria-hidden="true"
        >
          <h2
            className="think-ideology-title uppercase font-serif text-[clamp(48px,8vw,124px)] leading-none tracking-tight font-medium text-[#111010] select-none px-4 text-center"
            style={{ opacity: 0, transform: `translateY(${IDEOLOGY_CONFIG.startY}px)` }}
          >
            {IDEOLOGY_CONFIG.textMain} <span className="text-[#c8502d] not-italic">{IDEOLOGY_CONFIG.textAccent}</span>
          </h2>
        </div>
      )}

    </section>
  );
}
