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
        console.error('Failed to fetch footer links', err);
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
  if (location.pathname.startsWith('/course')) return null;

  return (
    <footer className="w-full bg-black border-t border-white/10 pt-16 pb-8 snap-start relative z-20">
      <Container className="flex flex-col gap-12">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Logo */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-serif text-2xl text-white tracking-tight">
              BetterWith<span className="text-white/60">Aarkesh</span>
            </span>
            <span className="font-sans text-xs text-white/50 tracking-widest uppercase">
              Transform your life
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {[
              { label: 'About', href: '/#meet-aarkesh' },
              { label: 'Coaching', href: '/#coaching' },
              { label: 'Library', href: '/library' },
              { label: 'Testimonials', href: '/#testimonials' },
              { label: 'FAQ', href: '/#faq' }
            ].map((link) => (
              <a 
                key={link.label} 
                href={link.href}
                className="font-sans text-xs uppercase tracking-widest text-white/60 hover:text-accent-gold transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

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
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent-gold hover:border-accent-gold/50 hover:bg-accent-gold/10 transition-all"
                >
                  {renderSocialIcon(s.platform, 18)}
                </a>
              ))
            ) : (
              <>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent-gold hover:border-accent-gold/50 hover:bg-accent-gold/10 transition-all" aria-label="Instagram">
                  <InstagramLogo size={18} weight="light" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent-gold hover:border-accent-gold/50 hover:bg-accent-gold/10 transition-all" aria-label="LinkedIn">
                  <LinkedinLogo size={18} weight="light" />
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent-gold hover:border-accent-gold/50 hover:bg-accent-gold/10 transition-all" aria-label="X">
                  <XLogo size={18} weight="light" />
                </a>
              </>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
          <p className="font-sans text-[0.65rem] text-white/40 tracking-wider">
            &copy; {currentYear} BetterWithAarkesh. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.length > 0 ? (
              footerLinks.map(link => (
                <Link 
                  key={link.slug} 
                  to={`/legal/${link.slug}`} 
                  className="font-sans text-[0.65rem] text-white/40 hover:text-white transition-colors tracking-wider"
                >
                  {link.title}
                </Link>
              ))
            ) : (
              <>
                <a href="#" className="font-sans text-[0.65rem] text-white/40 hover:text-white transition-colors tracking-wider">Privacy Policy</a>
                <a href="#" className="font-sans text-[0.65rem] text-white/40 hover:text-white transition-colors tracking-wider">Terms of Service</a>
              </>
            )}
          </div>
        </div>

      </Container>
    </footer>
  );
}

