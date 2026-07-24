import { useRef, useEffect, useState } from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '../../utils/cn';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Coaching', href: '#coaching' },
  { label: 'Perspectives', href: '#perspectives' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useGSAP(() => {
    gsap.fromTo(navRef.current, 
      { y: -100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.5,
      }
    );
  });

  return (
    <header
      ref={navRef}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-6',
        scrolled ? 'glass-nav py-4 shadow-lg shadow-black/10' : 'bg-transparent'
      )}
    >
      <Container className="flex items-center justify-between">
        <div className="flex-shrink-0">
          <a href="#" className="font-serif text-2xl tracking-normal text-heading relative z-10 flex items-center">
            Better<span className="font-sans font-light tracking-wide ml-[2px]">With</span>Aarkesh
          </a>
        </div>

        <nav className="hidden lg:flex items-center justify-center gap-10 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex flex-shrink-0 items-center justify-end">
          <Button variant="outline" className="text-[0.65rem] px-5 py-[0.65rem]">
            Book a Session
          </Button>
        </div>
      </Container>
    </header>
  );
}
