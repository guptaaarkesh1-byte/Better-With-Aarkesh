import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Container from '../ui/Container';
import { 
  InstagramLogo, 
  LinkedinLogo, 
  XLogo, 
  YoutubeLogo, 
  EnvelopeSimple,
  Sparkle,
  Globe,
  FacebookLogo,
  SpotifyLogo,
  DiscordLogo,
  TiktokLogo
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_FOOTER_COLUMNS = [
  {
    title: 'QUICK LINKS',
    links: [
      { label: 'Home', url: '/' },
      { label: 'About Aarkesh', url: '/#meet-aarkesh' },
      { label: 'Coaching', url: '/#coaching' },
      { label: 'Courses', url: '/course' },
      { label: 'Testimonials', url: '/#testimonials' },
      { label: 'Library', url: '/library' },
      { label: 'FAQ', url: '/#faq' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'About Us', url: '/about-us' },
      { label: 'Contact Us', url: '/contact-us' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Terms & Conditions', url: '/terms-and-conditions' },
      { label: 'Privacy Policy', url: '/privacy-policy' },
      { label: 'Refund & Cancellation Policy', url: '/refund-and-cancellation' },
    ],
  },
];

export const getSocialIcon = (platform, size = 16) => {
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
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const [columns, setColumns] = useState(DEFAULT_FOOTER_COLUMNS);
  const [socialLinks, setSocialLinks] = useState([]);
  const [brandSettings, setBrandSettings] = useState({
    brandDescription: 'Authentic 1-on-1 mentorship, transformational coaching & self-mastery courses designed to quiet inner noise, dissolve reactive patterns, and elevate your presence.',
    brandEmail: 'coaching@betterwithaarkesh.com',
    copyrightText: `© ${currentYear} Better With Aarkesh. All rights reserved.`,
  });

  useEffect(() => {
    // Fetch dynamic footer columns
    const fetchFooterData = async () => {
      try {
        const [colRes, socRes, setRes] = await Promise.all([
          fetch(`${API_URL}/api/footer-columns`),
          fetch(`${API_URL}/api/social-links`),
          fetch(`${API_URL}/api/footer-columns/settings`)
        ]);

        if (colRes.ok) {
          const colData = await colRes.json();
          if (Array.isArray(colData) && colData.length > 0) {
            setColumns(colData);
          }
        }

        if (socRes.ok) {
          const socData = await socRes.json();
          if (Array.isArray(socData) && socData.length > 0) {
            setSocialLinks(socData.filter(s => s.isActive !== false));
          }
        }

        if (setRes.ok) {
          const setData = await setRes.json();
          if (setData) {
            setBrandSettings(prev => ({ ...prev, ...setData }));
          }
        }
      } catch (err) {
        // Quiet fallback to defaults
      }
    };

    fetchFooterData();
  }, [currentYear]);

  return (
    <footer className="w-full bg-[#ede7d8] border-t border-black/10 pt-16 sm:pt-24 pb-12 relative z-30 select-none overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-[#c9542f]/5 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10 flex flex-col gap-12 sm:gap-16">
        
        {/* Main Multi-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-14">
          
          {/* ─── COLUMN 1: Brand & Bio ─── */}
          <div className="w-full lg:w-[420px] shrink-0 flex flex-col items-start gap-6 pr-0 lg:pr-6">
            <Link to="/" className="group inline-flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#fbf0eb] border border-[#e8c4e2] flex items-center justify-center text-[#c9542f] group-hover:scale-105 transition-transform shadow-xs">
                <Sparkle size={22} weight="fill" />
              </div>
              <span className="font-serif text-3xl sm:text-4xl text-[#111010] tracking-tight leading-none">
                BetterWith<em className="text-[#c9542f] not-italic font-normal italic">Aarkesh</em>
              </span>
            </Link>

            <p className="font-sans text-base sm:text-[1.05rem] text-[#4a463e] font-normal leading-relaxed max-w-lg">
              {brandSettings.brandDescription}
            </p>

            {/* Direct Contact Email */}
            {brandSettings.brandEmail && (
              <div className="flex items-center gap-3 text-base sm:text-lg font-sans text-[#2b2723] pt-1">
                <EnvelopeSimple size={22} className="text-[#c9542f] shrink-0" weight="bold" />
                <a 
                  href={`mailto:${brandSettings.brandEmail}`}
                  className="hover:text-[#c9542f] transition-colors font-medium underline-offset-4 hover:underline"
                >
                  {brandSettings.brandEmail}
                </a>
              </div>
            )}

            {/* Universal Social Media Icons */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {socialLinks.length > 0 ? (
                socialLinks.map((s) => (
                  <a
                    key={s._id || s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/90 border border-black/10 flex items-center justify-center text-[#111010] hover:text-[#c9542f] hover:border-[#c9542f]/40 hover:bg-[#fbf0eb] hover:scale-105 transition-all text-lg shadow-xs"
                    aria-label={s.label || s.platform}
                    title={s.label || s.platform}
                  >
                    {getSocialIcon(s.platform, 20)}
                  </a>
                ))
              ) : (
                <>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/90 border border-black/10 flex items-center justify-center text-[#111010] hover:text-[#c9542f] hover:border-[#c9542f]/40 hover:bg-[#fbf0eb] hover:scale-105 transition-all text-lg shadow-xs"
                    aria-label="Instagram"
                  >
                    <InstagramLogo size={20} weight="light" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/90 border border-black/10 flex items-center justify-center text-[#111010] hover:text-[#c9542f] hover:border-[#c9542f]/40 hover:bg-[#fbf0eb] hover:scale-105 transition-all text-lg shadow-xs"
                    aria-label="YouTube"
                  >
                    <YoutubeLogo size={20} weight="light" />
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/90 border border-black/10 flex items-center justify-center text-[#111010] hover:text-[#c9542f] hover:border-[#c9542f]/40 hover:bg-[#fbf0eb] hover:scale-105 transition-all text-lg shadow-xs"
                    aria-label="X (Twitter)"
                  >
                    <XLogo size={20} weight="light" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/90 border border-black/10 flex items-center justify-center text-[#111010] hover:text-[#c9542f] hover:border-[#c9542f]/40 hover:bg-[#fbf0eb] hover:scale-105 transition-all text-lg shadow-xs"
                    aria-label="LinkedIn"
                  >
                    <LinkedinLogo size={20} weight="light" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* ─── COLUMNS CONTAINER ─── */}
          <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-10 sm:gap-14 md:gap-20 lg:justify-end items-start w-full">
            {columns.map((col) => (
              <div 
                key={col.title} 
                className="flex flex-col items-start gap-5 min-w-[160px] sm:min-w-[190px]"
              >
                <h3 className="font-sans text-sm sm:text-[0.95rem] uppercase tracking-[0.22em] font-bold text-[#c9542f] truncate w-full">
                  {col.title}
                </h3>
                
                <ul className="flex flex-col gap-3.5 font-sans text-base sm:text-[1.05rem] text-[#2b2723] font-normal leading-relaxed w-full">
                  {(col.links || []).map((link) => {
                    const isExternalHttp = link.url?.startsWith('http://') || link.url?.startsWith('https://');
                    const isMailto = link.url?.startsWith('mailto:');
                    const isHash = link.url?.startsWith('#');

                    if (isExternalHttp) {
                      return (
                        <li key={link.label || link.url} className="truncate">
                          <a 
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#c9542f] hover:underline underline-offset-4 transition-colors block truncate"
                          >
                            {link.label}
                          </a>
                        </li>
                      );
                    }

                    if (isMailto || isHash) {
                      return (
                        <li key={link.label || link.url} className="truncate">
                          <a 
                            href={link.url}
                            className="hover:text-[#c9542f] hover:underline underline-offset-4 transition-colors block truncate"
                          >
                            {link.label}
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={link.label || link.url} className="truncate">
                        <Link 
                          to={link.url} 
                          className="hover:text-[#c9542f] hover:underline underline-offset-4 transition-colors block truncate"
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* ─── BOTTOM BAR: Clean Copyright Only ─── */}
        <div className="pt-8 sm:pt-10 border-t border-black/10 flex items-center justify-center text-center font-sans">
          <p className="text-sm sm:text-base text-[#6b665d]">
            {brandSettings.copyrightText || `© ${currentYear} Better With Aarkesh. All rights reserved.`}
          </p>
        </div>

      </Container>
    </footer>
  );
}
