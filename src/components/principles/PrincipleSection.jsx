import Container from '../ui/Container';
import PrincipleContent from './PrincipleContent';
import PrincipleProgress from './PrincipleProgress';
import PrincipleBanners from './PrincipleBanners';

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
  return (
    <section id={id} className="principle-panel relative w-full h-screen flex flex-col overflow-hidden bg-black snap-section">
      
      {/* Main Content Area */}
      <div className={`relative flex-grow flex items-center justify-center pb-48 ${contentClassName}`}>
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src={bgImg} 
            alt="Principle Background"
            className={`w-full h-full object-contain opacity-100 ${imagePosition}`}
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 75%, transparent 95%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 75%, transparent 95%)'
            }}
          />
          {/* Subtle gradient to darken the image for text readability and blend with edges */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
        </div>

        <Container className="relative z-10 w-full h-full flex items-center">
          
          {/* Left Side Content */}
          <div className="w-full lg:w-[65%] shrink-0">
            <PrincipleContent 
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

      {/* Bottom Annotations / Banners */}
      <div className="absolute bottom-0 left-0 w-full z-40">
        <PrincipleBanners 
          bannerTitle={bannerTitle}
          bannerIcon={bannerIcon}
          bannerSteps={bannerSteps}
          transitionText={transitionText}
          activeStep={activeStep}
          customTransitionFlow={customTransitionFlow}
        />
      </div>

    </section>
  );
}
