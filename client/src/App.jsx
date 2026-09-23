import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Library from './pages/library/Library';
import Stories from './pages/Stories';
import MyJourney from './pages/my-journey/MyJourney';
import Settings from './pages/my-journey/Settings';
import Notes from './pages/my-journey/Notes';
import Prepare from './pages/prepare/Prepare';
import Articles from './pages/articles/Articles';
import Videos from './pages/videos/Videos';
import Course from './pages/course/Course';
import CourseProfile from './pages/course/CourseProfile';
import Footer from './components/layout/Footer';
import FooterDocumentView from './pages/FooterDocumentView';
import ContactUs from './pages/ContactUs';

import { BookingProvider } from './context/BookingContext';
import { ThemeProvider } from './context/ThemeContext';
import BookingModal from './components/ui/BookingModal';

function App() {
  return (
    <ThemeProvider>
      <BookingProvider>
        <Router>
          <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<Booking />} />
            <Route path="/library" element={<Library />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/my-journey" element={<MyJourney />} />
            <Route path="/my-journey/settings" element={<Settings />} />
            <Route path="/my-journey/notes" element={<Notes />} />
            <Route path="/prepare" element={<Prepare />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/course" element={<Course />} />
            <Route path="/course/profile" element={<CourseProfile />} />

            {/* Direct Static & Policy Pages */}
            <Route path="/about-us" element={<FooterDocumentView slug="about-us" />} />
            <Route path="/about" element={<FooterDocumentView slug="about-us" />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms-and-conditions" element={<FooterDocumentView slug="terms-and-conditions" />} />
            <Route path="/privacy-policy" element={<FooterDocumentView slug="privacy-policy" />} />
            <Route path="/refund-and-cancellation" element={<FooterDocumentView slug="refund-and-cancellation" />} />
            <Route path="/refund-policy" element={<FooterDocumentView slug="refund-and-cancellation" />} />
            <Route path="/rescheduling-policy" element={<FooterDocumentView slug="rescheduling-policy" />} />

            {/* Dynamic Pages & Legal Document Route */}
            <Route path="/page/:slug" element={<FooterDocumentView />} />
            <Route path="/legal/:slug" element={<FooterDocumentView />} />
          </Routes>
          <Footer />
        </MainLayout>
        <BookingModal />
      </Router>
    </BookingProvider>
  </ThemeProvider>
  )
}

export default App;
