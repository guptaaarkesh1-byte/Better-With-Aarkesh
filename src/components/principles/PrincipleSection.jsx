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
    gsap.to('.sunlight-overlay', {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 10%',
      },
      opacity: 1,
      duration: 1.5,
      ease: 'power2.out',
    });

    // 3. DUST PARTICLE ANIMATION
    const dustParticles = gsap.utils.toArray('.phil-dust');
    dustParticles.forEach((particle) => {
      gsap.fromTo(particle, 
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
        }
      );
    });
    }

    // === DECIDE PAGE ANIMATIONS ===
    if (isDecidePage) {
      const decideParticles = gsap.utils.toArray('.decide-dust');
      decideParticles.forEach((particle) => {
        gsap.fromTo(particle, 
          {
            opacity: gsap.utils.random(0.1, 0.4),
            scale: gsap.utils.random(0.5, 1)
          },
          {
            y: `-=${gsap.utils.random(40, 120)}`, // Drift straight up
            x: `+=${gsap.utils.random(-15, 15)}`,  // Very slight waver to stay in column
            opacity: gsap.utils.random(0.6, 1),
            scale: gsap.utils.random(1, 1.5),
            duration: gsap.utils.random(4, 7),
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: gsap.utils.random(0, 2),
            force3D: true,
          }
        );
      });
    }

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id={id} className="principle-panel relative w-full h-screen flex flex-col overflow-hidden bg-black snap-section">
      
      {/* Main Content Area */}
      <div className={`relative flex-grow flex items-center justify-center pb-48 ${contentClassName}`}>
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src={bgImg} 
            alt="Principle Background"
            className={`w-full h-full object-cover lg:object-contain opacity-100 ${imagePosition}`}
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 75%, transparent 95%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 75%, transparent 95%)'
            }}
          />
          {/* Subtle gradient to darken the image for text readability and blend with edges */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
        </div>

        {/* Sunlight Overlay (Animated) */}
        {isThinkPage && (
          <div 
            className="sunlight-overlay absolute inset-0 opacity-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 80% 40%, rgba(255, 230, 180, 0.15) 0%, rgba(255, 230, 180, 0) 50%)',
              willChange: 'opacity'
            }}
          />
        )}

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
            <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden">
              {[...Array(25)].map((_, i) => ( // Reduced to 25 for better performance
                <div
                  key={i}
                  className="phil-dust absolute rounded-full"
                  style={{
                    width: `${Math.random() * 2 + 1.5}px`,
                    height: `${Math.random() * 2 + 1.5}px`,
                    backgroundColor: '#FFDF99',
                    boxShadow: '0 0 3px 1px rgba(255, 223, 153, 0.3)', // Reduced glow expense
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

        {/* Decide Particles Container (For the Glowing Path) */}
        {isDecidePage && (() => {
          // ==========================================
          // 🛠️ GLOWING PATH PARTICLE CONTROLS
          // Adjust these values to align the particles exactly over the glowing path!
          // ==========================================
          const PATH_OFFSET_X = 46; // Move left/right (in %)
          const PATH_OFFSET_Y = 10; // Move up/down (in %)
          const PATH_SPREAD_X = 13;  // How wide the path particles spread out (NARROW COLUMN)
          const PATH_SPREAD_Y = 80; // How tall the path particles spread out (TALL COLUMN)
          const PATH_PARTICLE_COUNT = 75; // Number of particles
          const PATH_BEND_ANGLE = 29; // Degrees to bend the column to the right (bottom stays fixed)

          return (
            <div 
              className="absolute inset-0 z-[100] pointer-events-none overflow-hidden hidden lg:block"
              style={{ 
                transform: `rotate(${PATH_BEND_ANGLE}deg)`,
                transformOrigin: `${PATH_OFFSET_X}% 100%` // Anchor the rotation to the bottom of the column
              }}
            >
              {[...Array(PATH_PARTICLE_COUNT)].map((_, i) => (
                <div
                  key={i}
                  className="decide-dust absolute rounded-full"
                  style={{
                    width: `${Math.random() * 2 + 1.5}px`,
                    height: `${Math.random() * 2 + 1.5}px`,
                    backgroundColor: '#FFFFFF', // Bright white/gold for the path
                    boxShadow: '0 0 6px 2px rgba(255, 230, 180, 0.6)', // Bright warm glow
                    top: `${Math.random() * PATH_SPREAD_Y + PATH_OFFSET_Y}%`,
                    left: `${Math.random() * PATH_SPREAD_X + PATH_OFFSET_X}%`,
                    opacity: 0,
                    willChange: 'transform, opacity'
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
