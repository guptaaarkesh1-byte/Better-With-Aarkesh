import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') {
      setIsVisible(false);
      return;
    }

    let heroIntersecting = true;
    let bookIntersecting = false;

    const updateVisibility = () => {
      setIsVisible(!heroIntersecting && !bookIntersecting);
    };

    const heroEl = document.getElementById('home') || document.querySelector('section');
    const bookEl = document.getElementById('book-session') || document.getElementById('book');

    const heroObserver = new IntersectionObserver(
      (entries) => {
        heroIntersecting = entries[0]?.isIntersecting ?? false;
        updateVisibility();
      },
      { threshold: 0.25 }
    );

    const bookObserver = new IntersectionObserver(
      (entries) => {
        bookIntersecting = entries[0]?.isIntersecting ?? false;
        updateVisibility();
      },
      { threshold: 0.05 }
    );

    if (heroEl) heroObserver.observe(heroEl);
    if (bookEl) bookObserver.observe(bookEl);

    return () => {
      if (heroEl) heroObserver.unobserve(heroEl);
      if (bookEl) bookObserver.unobserve(bookEl);
    };
  }, [location.pathname]);

  if (location.pathname !== '/') return null;

  return (
    <div 
      className={`fixed left-1/2 -translate-x-1/2 bottom-4 z-40 w-[min(calc(100%-32px),398px)] md:hidden transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
    >
      <Link 
        to="/book"
        className="w-full h-14 rounded-full bg-[#141414] text-[#f5f1e8] font-sans font-semibold text-[12.5px] tracking-[0.16em] uppercase flex items-center justify-center gap-3 shadow-[0_18px_34px_-12px_rgba(0,0,0,0.6)] active:scale-[0.98] transition-transform"
      >
        <span>Book a session</span>
        <ArrowRight size={16} weight="bold" />
      </Link>
    </div>
  );
}
