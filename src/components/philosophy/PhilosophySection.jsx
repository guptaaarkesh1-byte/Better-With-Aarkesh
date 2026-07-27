import Container from '../ui/Container';
import PhilosophyContent from './PhilosophyContent';
import PhilosophyProgress from './PhilosophyProgress';
import bgImg from '../../assets/Page3/ChatGPT Image Jul 24, 2026, 02_21_12 PM.png';

export default function PhilosophySection() {
  return (
    <section className="relative w-full h-screen flex flex-col overflow-hidden bg-black snap-section">
      


      {/* Main Content Area */}
      <div className="relative flex-grow flex items-center justify-center pt-20">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src={bgImg} 
            alt="Philosophy Background"
            className="w-full h-full object-contain object-middle opacity-90"
          />
          {/* Subtle gradient to darken the image for text readability and blend with edges */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
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
