import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      { label: 'Coaching', url: '/#philosophy' },
      { label: 'Courses', url: '/course' },
      { label: 'Testimonials', url: '/#testimonials' },
      { label: 'FAQ', url: '/#faq' },
      { label: 'Library', url: '/library' },
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
    <footer className="w-full bg-[#050505] border-t border-white/10 pt-16 sm:pt-24 pb-12 relative z-30 select-none overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-[#c79c6e]/5 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10 flex flex-col gap-12 sm:gap-16">
        
        {/* Main Multi-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-14">
          
          {/* ─── COLUMN 1: Brand & Bio (Fixed comfortable width) ─── */}
          <div className="w-full lg:w-[380px] shrink-0 flex flex-col items-start gap-5 pr-0 lg:pr-6">
            <Link to="/" className="group inline-flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#c79c6e]/15 border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e] group-hover:scale-105 transition-transform">
                <Sparkle size={20} weight="fill" />
              </div>
              <span className="font-serif text-2xl sm:text-3xl text-white tracking-tight leading-none">
                BetterWith<span className="text-[#c79c6e]">Aarkesh</span>
              </span>
            </Link>

            <p className="font-sans text-sm sm:text-[0.95rem] md:text-base text-white/70 font-light leading-relaxed max-w-md">
              {brandSettings.brandDescription}
            </p>

            {/* Direct Contact Email */}
            {brandSettings.brandEmail && (
              <div className="flex items-center gap-2.5 text-sm sm:text-base font-sans text-white/80 pt-1">
                <EnvelopeSimple size={18} className="text-[#c79c6e] shrink-0" />
                <a 
                  href={`mailto:${brandSettings.brandEmail}`}
                  className="hover:text-[#c79c6e] transition-colors"
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
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#c79c6e] hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/10 transition-all text-base"
                    aria-label={s.label || s.platform}
                    title={s.label || s.platform}
                  >
                    {getSocialIcon(s.platform, 18)}
                  </a>
                ))
              ) : (
                <>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#c79c6e] hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/10 transition-all text-base"
                    aria-label="Instagram"
                  >
                    <InstagramLogo size={18} weight="light" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#c79c6e] hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/10 transition-all text-base"
                    aria-label="YouTube"
                  >
                    <YoutubeLogo size={18} weight="light" />
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#c79c6e] hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/10 transition-all text-base"
                    aria-label="X (Twitter)"
                  >
                    <XLogo size={18} weight="light" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#c79c6e] hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/10 transition-all text-base"
                    aria-label="LinkedIn"
                  >
                    <LinkedinLogo size={18} weight="light" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* ─── COLUMNS CONTAINER (Quick Links, Company, Legal, + Any Custom Columns) ─── */}
          <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-10 sm:gap-14 md:gap-20 lg:justify-end items-start w-full">
            {columns.map((col) => (
              <div 
                key={col.title} 
                className="flex flex-col items-start gap-4 min-w-[150px] sm:min-w-[180px]"
              >
                <h3 className="font-sans text-xs sm:text-[0.82rem] md:text-sm uppercase tracking-[0.22em] font-semibold text-[#c79c6e] truncate w-full">
                  {col.title}
                </h3>
                
                <ul className="flex flex-col gap-3 font-sans text-sm sm:text-[0.95rem] md:text-base text-white/75 font-light w-full">
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
                            className="hover:text-[#c79c6e] hover:underline underline-offset-4 transition-colors block truncate"
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
                            className="hover:text-[#c79c6e] hover:underline underline-offset-4 transition-colors block truncate"
                          >
                            {link.label}
                          </a>
                        </li>
                      );
                    }

                    // All internal routes (e.g. /contact-us, /about-us, /terms-and-conditions, etc.)
                    return (
                      <li key={link.label || link.url} className="truncate">
                        <Link 
                          to={link.url} 
                          className="hover:text-[#c79c6e] hover:underline underline-offset-4 transition-colors block truncate"
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

        {/* ─── BOTTOM BAR: Clean Copyright Only (No duplicate links) ─── */}
        <div className="pt-8 sm:pt-10 border-t border-white/10 flex items-center justify-center text-center font-sans">
          <p className="text-xs sm:text-sm text-white/65">
            {brandSettings.copyrightText || `© ${currentYear} Better With Aarkesh. All rights reserved.`}
          </p>
        </div>

      </Container>
    </footer>
  );
}
