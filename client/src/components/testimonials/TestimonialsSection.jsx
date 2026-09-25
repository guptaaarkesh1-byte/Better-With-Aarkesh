import React, { useState, useEffect } from 'react';
import Container from '../ui/Container';
import defaultBgImg from '../../assets/Page9/ChatGPT Image Jul 24, 2026, 04_56_37 PM.webp';
import { 
  Quotes, 
  ArrowRight, 
  ChatCenteredText, 
  ShieldCheck, 
  User, 
  Star, 
  Handshake, 
  Heart 
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_TESTIMONIALS = [
  {
    quote: "Aarkesh helped me see the patterns I was too close to notice. For the first time, I feel in control of my choices.",
    name: "Rohit, 32",
    role: "Entrepreneur",
    initial: "R",
    color: "bg-blue-900"
  },
  {
    quote: "I came in feeling lost and overwhelmed. Now I have clarity, confidence, and a life that actually feels like mine.",
    name: "Megha, 28",
    role: "Marketing Manager",
    initial: "M",
    color: "bg-purple-900"
  },
  {
    quote: "Practical. Honest. No fluff. The sessions challenge you—in the best way possible. Highly recommend.",
    name: "Vikram, 35",
    role: "Senior Pilot",
    initial: "V",
    color: "bg-green-900"
  },
  {
    quote: "I used to overthink everything. Aarkesh helped me quiet the noise and focus on what truly matters.",
    name: "Ananya, 30",
    role: "Product Designer",
    initial: "A",
    color: "bg-orange-900"
  },
  {
    quote: "The accountability and structure I got changed the game for me. I follow through now. In life and at work.",
    name: "Kunal, 29",
    role: "Software Engineer",
    initial: "K",
    color: "bg-teal-900"
  },
  {
    quote: "He doesn't just listen, he understands. And somehow, he knows exactly what you need to hear.",
    name: "Pooja, 33",
    role: "HR Leader",
    initial: "P",
    color: "bg-rose-900"
  }
];

export default function TestimonialsSection() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-settings/testimonials`);
        if (res.ok && isMounted) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load testimonials:', err);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const eyebrow = data?.eyebrowText || 'REAL STORIES. REAL CHANGE.';
  const heading1 = data?.headingLine1 || 'Their words.';
  const headingAccent = data?.headingAccent || 'Their transformation.';
  const description = data?.description || 'People from different walks of life. Different challenges. Same results that matter.';
  const bgImg = data?.bgImg || defaultBgImg;
  const testimonials = (data?.items && data.items.length > 0) ? data.items : DEFAULT_TESTIMONIALS;

  return (
    <section id="testimonials" className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col snap-section">
      
      {/* Background Image & Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImg} 
          alt="Glowing Doorway" 
          className="absolute right-0 top-0 h-full w-full md:w-[70%] object-cover object-right opacity-80"
        />
        {/* Global contrast overlay layer */}
        <div 
          className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300" 
          style={{ opacity: 'var(--overlay-opacity, 0.4)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      <div className="relative z-10 flex-grow flex flex-col pt-24 pb-6 w-full">
        <Container className="flex-grow flex flex-col justify-between">
          
          <div className="flex w-full">
            {/* Left Content (Text & Grid) */}
            <div className="w-full lg:w-[65%] xl:w-[60%] flex flex-col gap-6">
              
              {/* Header */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-6 bg-accent-gold" />
                  <span className="font-sans text-xs sm:text-[0.82rem] uppercase tracking-[0.25em] font-bold text-accent-gold">
                    {eyebrow}
                  </span>
                </div>
                
                <h2 className="font-serif text-4xl md:text-5xl text-white font-medium tracking-tight leading-tight">
                  {heading1}<br/>
                  <span className="text-accent-gold italic">{headingAccent}</span>
                </h2>
                
                <p className="text-white text-lg lg:text-xl font-serif font-light tracking-wide leading-relaxed max-w-lg mt-1">
                  {description}
                </p>
              </div>

              {/* Testimonials Grid (Latest 6 on Homepage) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mt-2">
                {testimonials.slice(0, 6).map((t, index) => {
                  const initial = t.name ? t.name.charAt(0).toUpperCase() : 'C';
                  const colors = ['bg-blue-900', 'bg-purple-900', 'bg-green-900', 'bg-orange-900', 'bg-teal-900', 'bg-rose-900'];
                  const color = t.color || colors[index % colors.length];

                  return (
                    <div 
                      key={index} 
                      className="flex flex-col bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-5 hover:border-accent-gold/40 transition-colors"
                    >
                      <Quotes className="text-accent-gold text-2xl mb-2.5 opacity-90" weight="fill" />
                      
                      <p className="text-white/90 font-light text-xs sm:text-sm md:text-[0.92rem] leading-relaxed mb-4 flex-grow">
                        {t.quote}
                      </p>
                      
                      <div className="flex items-center gap-3.5 mt-auto">
                        {t.image ? (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#c79c6e]/40 shrink-0 bg-black shadow-inner">
                            <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${color} flex items-center justify-center border border-white/20 shrink-0`}>
                            <span className="font-serif text-white text-sm sm:text-base font-medium">{initial}</span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-sans text-accent-gold text-sm sm:text-[0.92rem] font-semibold">{t.name}</span>
                          <span className="font-sans text-white/60 text-xs sm:text-[0.72rem] uppercase tracking-wider mt-0.5">{t.role}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View More Testimonials Button */}
              <div className="pt-2 flex items-center">
                <Link
                  to="/testimonials"
                  className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-[#c79c6e]/60 bg-[#c79c6e]/10 hover:bg-[#c79c6e] text-[#f4eedf] hover:text-black text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-[0_2px_15px_rgba(199,156,110,0.15)] group"
                >
                  <span>View More Testimonials</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Trust Pillars */}
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-[#c79c6e]" />
              <span className="text-xs text-white/70">100% Confidential</span>
            </div>
            <div className="flex items-center gap-3">
              <User size={20} className="text-[#c79c6e]" />
              <span className="text-xs text-white/70">Tailored 1-on-1 Sessions</span>
            </div>
            <div className="flex items-center gap-3">
              <Handshake size={20} className="text-[#c79c6e]" />
              <span className="text-xs text-white/70">Evidence-Based Coaching</span>
            </div>
            <div className="flex items-center gap-3">
              <Heart size={20} className="text-[#c79c6e]" />
              <span className="text-xs text-white/70">Empathetic & Non-Judgmental</span>
            </div>
          </div>

        </Container>
      </div>
    </section>
  );
}
