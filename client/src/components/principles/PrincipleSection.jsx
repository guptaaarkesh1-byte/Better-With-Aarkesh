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
  imagePosition = 'object-[80%_center]' // Shifting it slightly left from pure 'object-right'
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

    // 3. DUST PARTICLE ANIMATION
    const dustParticles = gsap.utils.toArray('.phil-dust');
    const particleTweens = dustParticles.map((particle) => {
      return gsap.fromTo(particle, 
        {
          opacity: gsap.utils.random(0.2, 0.5),
          scale: gsap.utils.random(0.8, 1)
        },
        {
          y: `-=${gsap.utils.random(30, 80)}`,
          x: `-=${gsap.utils.random(10, 40)}`,
          opacity: gsap.utils.random(0.5, 1),
          scale: gsap.utils.random(1, 1.5),
          duration: gsap.utils.random(4, 8),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: gsap.utils.random(0, 2),
          force3D: true, // Hardware acceleration
          paused: true
        }
      );
    });

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => particleTweens.forEach(t => t.play()),
      onLeave: () => particleTweens.forEach(t => t.pause()),
      onEnterBack: () => particleTweens.forEach(t => t.play()),
      onLeaveBack: () => particleTweens.forEach(t => t.pause()),
    });
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
            className={`w-full h-full object-cover opacity-95 md:opacity-100 ${imagePosition || 'object-[75%_center] lg:object-[78%_center]'}`}
          />
          {/* Subtle left-to-right fade so text remains 100% readable while the image on the right is crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8] via-[#f5f1e8]/85 md:via-[#f5f1e8]/50 to-transparent w-[60%] md:w-[50%]" />
          
          {/* Soft bottom edge blend */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f5f1e8] via-[#f5f1e8]/40 to-transparent" />
          
          {/* Soft top edge blend */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#f5f1e8]/60 to-transparent" />
        </div>



        {/* Dust Particles Container */}
        {isThinkPage && (() => {
          // ==========================================
          // 🛠️ DUST PARTICLE POSITION CONTROLS
          // Adjust these values to move the dust area!
          // ==========================================
          const DUST_OFFSET_X = 35; // Move left/right (currently shifted 15% from the left)
          const DUST_OFFSET_Y = 10; // Move up/down (currently shifted 15% from the top)
          const DUST_SPREAD_X = 35; // How wide the dust spreads out (width in %)
          const DUST_SPREAD_Y = 70; // How tall the dust spreads out (height in %)

          return (
            <div className="absolute inset-0 z-[100] pointer-events-none">
              {[...Array(25)].map((_, i) => ( // Reduced to 25 for better performance
                <div
                  key={i}
                  className="phil-dust absolute rounded-full"
                  style={{
                    width: `${Math.random() * 2 + 1.5}px`,
                    height: `${Math.random() * 2 + 1.5}px`,
                    backgroundColor: '#FFDF99',
                    // boxShadow: '0 0 3px 1px rgba(255, 223, 153, 0.3)', // Removed glow for performance
                    top: `${Math.random() * DUST_SPREAD_Y + DUST_OFFSET_Y}%`,
                    left: `${Math.random() * DUST_SPREAD_X + DUST_OFFSET_X}%`,
                    opacity: 0.5,
                    willChange: 'transform, opacity' // Hint for GPU
                  }}
                />
              ))}
            </div>
          );
        })()}

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
