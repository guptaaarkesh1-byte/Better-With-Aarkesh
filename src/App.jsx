import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Perspectives from './pages/perspectives/Perspectives';
import Stories from './pages/Stories';
import Footer from './components/layout/Footer';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/perspectives" element={<Perspectives />} />
          <Route path="/stories" element={<Stories />} />
        </Routes>
        <Footer />
      </MainLayout>
    </Router>
  )
}

export default App;
