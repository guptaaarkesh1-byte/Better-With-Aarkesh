import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Container from '../ui/Container';
import PhilosophyContent from './PhilosophyContent';
import PhilosophyProgress from './PhilosophyProgress';
import bgImg from '../../assets/Page3/ChatGPT Image Jul 24, 2026, 02_21_12 PM.png';

gsap.registerPlugin(ScrollTrigger);
export default function PhilosophySection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    // 1. SUNLIGHT ANIMATION
    gsap.to('.sunlight-overlay', {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%',
      },
      opacity: 1,
      duration: 1.5,
      ease: 'power2.out',
    });

    // 3. DUST PARTICLE ANIMATION
    const dustParticles = gsap.utils.toArray('.phil-dust');
    dustParticles.forEach((particle) => {
      // Very gentle upward and sideways drift
      gsap.fromTo(particle, 
        {
          opacity: gsap.utils.random(0.2, 0.5),
          scale: gsap.utils.random(0.8, 1)
        },
        {
          y: `-=${gsap.utils.random(30, 80)}`,
          x: `+=${gsap.utils.random(-40, 40)}`,
          opacity: gsap.utils.random(0.5, 1),
          scale: gsap.utils.random(1, 1.5),
          duration: gsap.utils.random(4, 8),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: gsap.utils.random(0, 2)
        }
      );
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative w-full h-screen flex flex-col overflow-hidden bg-black snap-section">
      


      {/* Main Content Area */}
      <div className="relative flex-grow flex items-center justify-center pt-20">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src={bgImg} 
            alt="Philosophy Background"
            className="w-full h-full object-contain object-middle opacity-90"
          />
          
          {/* Sunlight Overlay (Animated) */}
          <div 
            className="sunlight-overlay absolute inset-0 mix-blend-overlay opacity-0"
            style={{
              background: 'radial-gradient(ellipse at 80% 40%, rgba(255, 230, 180, 0.4) 0%, rgba(255, 230, 180, 0) 50%)'
            }}
          />

          {/* Subtle gradient to darken the image for text readability and blend with edges */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        </div>
        
        {/* Dust Particles Container (focused on the right where sunlight is) */}
        <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden mix-blend-screen">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="phil-dust absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 3}px`, // 3px to 7px (larger)
                height: `${Math.random() * 4 + 3}px`,
                backgroundColor: '#FFFFFF', // Pure white to contrast any background
                boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)', // Stronger white glow
                top: `${Math.random() * 100}%`, // Anywhere vertically
                left: `${Math.random() * 100}%`, // Anywhere horizontally (ensure we hit the window)
                opacity: 0.8, // start very visible
                // removed filter blur entirely
              }}
            />
          ))}
        </div>
        <Container className="relative z-10 w-full h-full flex items-center">
          
          {/* Left Side Content */}
          <div className="w-full lg:w-[65%] shrink-0">
            <PhilosophyContent />
          </div>

          {/* Right Side Progress */}
          <div className="hidden lg:flex w-full justify-end pr-8">
            <PhilosophyProgress />
          </div>

        </Container>
      </div>


    </section>
  );
}
