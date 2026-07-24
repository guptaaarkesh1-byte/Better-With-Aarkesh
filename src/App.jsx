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

function App() {
  return (
    <MainLayout>
      <Hero />
      <ProblemSection />
      <PrinciplesContainer>
        <ThinkPrinciple />
        <FeelPrinciple />
        <DecidePrinciple />
        <CoachingPrinciple />
        <CoachingJourney />
      </PrinciplesContainer>
      <MeetAarkesh />
    </MainLayout>
  )
}

export default App;
