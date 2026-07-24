import MainLayout from './layouts/MainLayout';
import Hero from './components/hero/Hero';
import ProblemSection from './components/problem/ProblemSection';
import PrinciplesContainer from './components/principles/PrinciplesContainer';
import ThinkPrinciple from './components/principles/ThinkPrinciple';
import FeelPrinciple from './components/principles/FeelPrinciple';
import DecidePrinciple from './components/principles/DecidePrinciple';
import CoachingPrinciple from './components/principles/CoachingPrinciple';
import CoachingJourney from './components/principles/CoachingJourney';

import MeetAarkesh from './components/about/MeetAarkesh';
import TestimonialsSection from './components/testimonials/TestimonialsSection';
import FinalCtaSection from './components/cta/FinalCtaSection';
import Footer from './components/layout/Footer';

import PhilosophySection from './components/philosophy/PhilosophySection';

function App() {
  return (
    <MainLayout>
      <Hero />
      <ProblemSection />
      <PhilosophySection />
      <PrinciplesContainer>
        <ThinkPrinciple />
        <FeelPrinciple />
        <DecidePrinciple />
        <CoachingPrinciple />
        <CoachingJourney />
      </PrinciplesContainer>
      <MeetAarkesh />
      <TestimonialsSection />
      <FinalCtaSection />
      <Footer />
    </MainLayout>
  )
}

export default App;
