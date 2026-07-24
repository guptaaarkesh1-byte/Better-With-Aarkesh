import React from 'react';
import Container from '../ui/Container';
import { InstagramLogo, LinkedinLogo, XLogo } from '@phosphor-icons/react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black border-t border-white/10 pt-16 pb-8 snap-start">
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
            {['About', 'Coaching', 'Perspectives', 'Testimonials', 'FAQ'].map((link) => (
              <a 
                key={link} 
                href={`#${link.toLowerCase()}`}
                className="font-sans text-xs uppercase tracking-widest text-white/60 hover:text-accent-gold transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent-gold hover:border-accent-gold/50 hover:bg-accent-gold/10 transition-all">
              <InstagramLogo size={20} weight="light" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent-gold hover:border-accent-gold/50 hover:bg-accent-gold/10 transition-all">
              <LinkedinLogo size={20} weight="light" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent-gold hover:border-accent-gold/50 hover:bg-accent-gold/10 transition-all">
              <XLogo size={20} weight="light" />
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
          <p className="font-sans text-[0.65rem] text-white/40 tracking-wider">
            &copy; {currentYear} BetterWithAarkesh. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="font-sans text-[0.65rem] text-white/40 hover:text-white transition-colors tracking-wider">Privacy Policy</a>
            <a href="#" className="font-sans text-[0.65rem] text-white/40 hover:text-white transition-colors tracking-wider">Terms of Service</a>
          </div>
        </div>

      </Container>
    </footer>
  );
}
