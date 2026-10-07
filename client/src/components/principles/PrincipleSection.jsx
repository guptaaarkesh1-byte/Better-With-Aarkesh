import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import PrincipleContent from './PrincipleContent';
import PrincipleProgress from './PrincipleProgress';

gsap.registerPlugin(ScrollTrigger);
export default function PrincipleSection({
  id,
  bgImg,
  fallbackImg,
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
  imagePosition = 'object-[80%_center]', // Shifting it slightly left from pure 'object-right'
  maxContentWidth,
  eyebrowFontSize,
  headingFontSize,
  descriptionFontSize
}) {
  const sectionRef = useRef(null);
  const isThinkPage = id === 'think-principle';
  const isDecidePage = id === 'decide-principle';

  useGSAP(() => {
    // === THINK PAGE ANIMATIONS ===
    if (isThinkPage) {
      // 1. SUNLIGHT ANIMATION
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

  return (
    <section ref={sectionRef} id={id} className="principle-panel relative w-full h-screen flex flex-col overflow-hidden bg-[#f5f1e8] snap-section">
      
      {/* Main Content Area */}
      <div className={`relative flex-grow flex items-center justify-center pb-48 ${contentClassName}`}>
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src={bgImg} 
            alt="Principle Background"
            onError={(e) => {
              if (fallbackImg && e.currentTarget.src !== fallbackImg) {
                e.currentTarget.src = fallbackImg;
              }
            }}
            className={`w-full h-full object-cover opacity-100 contrast-[1.08] saturate-[1.05] ${imagePosition || 'object-[75%_center] lg:object-[78%_center]'}`}
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />
          {/* Crisp text backdrop fade - confined to left side so right subject is 100% sharp and unfiltered */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8] via-[#f5f1e8]/60 via-40% to-transparent w-[48%] md:w-[38%]" />
          
          {/* Minimal bottom edge blend */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#f5f1e8]/40 to-transparent" />
          
          {/* Soft top edge blend */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#f5f1e8]/30 to-transparent" />
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
            />
          </div>

          {/* Right Side Empty Space for Global Progress Bar */}
          <div className="hidden lg:flex w-full justify-end pr-8 pointer-events-none">
            {/* The sticky global progress bar will overlay in this space */}
          </div>

        </Container>
      </div>

    </section>
  );
}
