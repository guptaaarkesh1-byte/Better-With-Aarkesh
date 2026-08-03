import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Library from './pages/library/Library';
import Stories from './pages/Stories';
import Footer from './components/layout/Footer';

import { BookingProvider } from './context/BookingContext';
import BookingModal from './components/ui/BookingModal';

function App() {
  return (
    <BookingProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<Booking />} />
            <Route path="/library" element={<Library />} />
            <Route path="/stories" element={<Stories />} />
          </Routes>
          <Footer />
        </MainLayout>
        <BookingModal />
      </Router>
    </BookingProvider>
  )
}

export default App;
