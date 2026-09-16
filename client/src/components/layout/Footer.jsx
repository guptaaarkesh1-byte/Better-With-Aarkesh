import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Container from '../ui/Container';
import { 
  InstagramLogo, 
  LinkedinLogo, 
  XLogo, 
  YoutubeLogo, 
  FacebookLogo, 
  SpotifyLogo, 
  DiscordLogo, 
  TiktokLogo, 
  Globe 
} from '@phosphor-icons/react';

const renderSocialIcon = (platform, size = 18) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return <InstagramLogo size={size} weight="light" />;
    case 'youtube': return <YoutubeLogo size={size} weight="light" />;
    case 'x': case 'twitter': return <XLogo size={size} weight="light" />;
    case 'linkedin': return <LinkedinLogo size={size} weight="light" />;
    case 'facebook': return <FacebookLogo size={size} weight="light" />;
    case 'spotify': return <SpotifyLogo size={size} weight="light" />;
    case 'discord': return <DiscordLogo size={size} weight="light" />;
    case 'tiktok': return <TiktokLogo size={size} weight="light" />;
    default: return <Globe size={size} weight="light" />;
  }
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [footerLinks, setFooterLinks] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/footer-documents/published?category=coaching`);
        if (res.ok) {
          const data = await res.json();
          setFooterLinks(data);
        }
      } catch (err) {
        console.error('Failed to fetch coaching footer links', err);
      }
    };

    const fetchSocialLinks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/social-links`);
        if (res.ok) {
          const data = await res.json();
          setSocialLinks(data);
        }
      } catch (err) {
        console.error('Failed to fetch social links in Footer:', err);
      }
    };

    fetchLinks();
    fetchSocialLinks();
  }, [API_URL]);

  const location = useLocation();
  // Do not render coaching footer on course pages
  if (location.pathname.startsWith('/course')) return null;

  return (
    <footer className="w-full bg-black border-t border-white/10 pt-16 pb-10 snap-start relative z-20">
      <Container className="flex flex-col gap-10">
        
        {/* Top Section: Brand, Navigation & Socials */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center lg:items-start gap-1.5">
            <Link to="/" className="font-serif text-2xl text-white tracking-tight hover:opacity-90 transition-opacity">
              BetterWith<span className="text-[#c79c6e]">Aarkesh</span>
            </Link>
            <span className="font-sans text-[0.65rem] text-white/50 tracking-widest uppercase">
              1:1 Life Coaching &amp; Transformational Mentorship
            </span>
          </div>

          {/* Coaching Navigation Quick Links */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap justify-center items-center gap-5 sm:gap-7 text-xs font-sans uppercase tracking-widest text-white/60">
            <Link to="/" className="hover:text-accent-gold transition-colors">Home</Link>
            <a href="/#meet-aarkesh" className="hover:text-accent-gold transition-colors">About</a>
            <a href="/#coaching" className="hover:text-accent-gold transition-colors">Coaching</a>
            <Link to="/book" className="hover:text-accent-gold transition-colors text-[#c79c6e]">Book Session</Link>
            <Link to="/library" className="hover:text-accent-gold transition-colors">Library</Link>
            <a href="/#testimonials" className="hover:text-accent-gold transition-colors">Testimonials</a>
            <a href="/#contact" className="hover:text-accent-gold transition-colors">Contact</a>
          </nav>

          {/* Universal Social Icons */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {socialLinks.length > 0 ? (
              socialLinks.map((s) => (
                <a 
                  key={s._id || s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label || s.platform}
                  title={s.label || s.platform}
                  className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center text-white/60 hover:text-accent-gold hover:border-accent-gold/50 hover:bg-accent-gold/10 transition-all"
                >
                  {renderSocialIcon(s.platform, 17)}
                </a>
              ))
            ) : (
              <>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent-gold hover:border-accent-gold/50 hover:bg-accent-gold/10 transition-all" aria-label="Instagram">
                  <InstagramLogo size={17} weight="light" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent-gold hover:border-accent-gold/50 hover:bg-accent-gold/10 transition-all" aria-label="LinkedIn">
                  <LinkedinLogo size={17} weight="light" />
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent-gold hover:border-accent-gold/50 hover:bg-accent-gold/10 transition-all" aria-label="X">
                  <XLogo size={17} weight="light" />
                </a>
              </>
            )}
          </div>

        </div>

        {/* Bottom Legal Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <p className="font-sans text-[0.68rem] text-white/40 tracking-wider">
            &copy; {currentYear} Better With Aarkesh. All rights reserved.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {footerLinks.length > 0 ? (
              footerLinks.map(link => (
                <Link 
                  key={link.slug} 
                  to={`/${link.slug}`} 
                  className="font-sans text-[0.68rem] text-white/40 hover:text-white transition-colors tracking-wider"
                >
                  {link.title}
                </Link>
              ))
            ) : (
              <>
                <Link to="/terms-and-conditions" className="font-sans text-[0.68rem] text-white/40 hover:text-white transition-colors tracking-wider">Terms &amp; Conditions</Link>
                <Link to="/privacy-policy" className="font-sans text-[0.68rem] text-white/40 hover:text-white transition-colors tracking-wider">Privacy Policy</Link>
                <Link to="/refund-and-cancellation" className="font-sans text-[0.68rem] text-white/40 hover:text-white transition-colors tracking-wider">Refund Policy</Link>
                <Link to="/shipping-policy" className="font-sans text-[0.68rem] text-white/40 hover:text-white transition-colors tracking-wider">Shipping Policy</Link>
              </>
            )}
          </div>
        </div>

      </Container>
    </footer>
  );
}
