import React, { useState, useEffect } from 'react';
import Container from '../ui/Container';
import defaultBgImg from '../../assets/Page9/testimonials-doorway.webp';
import { resolveImageUrl } from '../../utils/imageUrl';
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

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

// =========================================================================
// 🎛️ DESKTOP IMAGE CONTROLS (Adjust zoom & position here!)
// =========================================================================
export const DESKTOP_IMAGE_CONTROLS = {
  zoom: 1.0,              // 🔍 Zoom / Scale: 1.0 (100%), 1.05 (105%), 1.15 (115%)
  posX: '85%',            // ↔️ Horizontal Position: '50%' (Center), '80%' (Right), '85%' (Right focused)
  posY: '35%',            // ↕️ Vertical Position: '0%' (Top), '35%' (Upper Center), '50%' (Center)
  translateX: '0px',      // 🎯 Fine-tune Left/Right pixel nudge: e.g. '+20px', '-30px'
  translateY: '0px',      // 🎯 Fine-tune Up/Down pixel nudge: e.g. '+10px', '-20px'
};

const DEFAULT_TESTIMONIALS = [
  {
    quote: "Aarkesh helped me see the patterns I was too close to notice. For the first time, I feel in control of my choices.",
    name: "Rohit, 32",
    role: "Entrepreneur",
    initial: "R",
    color: "bg-[#3d1b37]"
  },
  {
    quote: "I came in feeling lost and overwhelmed. Now I have clarity, confidence, and a life that actually feels like mine.",
    name: "Megha, 28",
    role: "Marketing Manager",
    initial: "M",
    color: "bg-[#c9542f]"
  },
  {
    quote: "Practical. Honest. No fluff. The sessions challenge you—in the best way possible. Highly recommend.",
    name: "Vikram, 35",
    role: "Senior Pilot",
    initial: "V",
    color: "bg-[#2f4a34]"
  },
  {
    quote: "I used to overthink everything. Aarkesh helped me quiet the noise and focus on what truly matters.",
    name: "Ananya, 30",
    role: "Product Designer",
    initial: "A",
    color: "bg-[#a64117]"
  },
  {
    quote: "The accountability and structure I got changed the game for me. I follow through now. In life and at work.",
    name: "Kunal, 29",
    role: "Software Engineer",
    initial: "K",
    color: "bg-[#111010]"
  },
  {
    quote: "He doesn't just listen, he understands. And somehow, he knows exactly what you need to hear.",
    name: "Pooja, 33",
    role: "HR Leader",
    initial: "P",
    color: "bg-[#3d1b37]"
  }
];

const getInitialTestimonialsData = () => {
  try {
    const cached = localStorage.getItem('cached_testimonials_data');
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return null;
};

export default function TestimonialsSection() {
  const [data, setData] = useState(getInitialTestimonialsData);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-settings/testimonials`);
        if (res.ok && isMounted) {
          const json = await res.json();
          setData(json);
          try {
            localStorage.setItem('cached_testimonials_data', JSON.stringify(json));
          } catch (e) {}
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
  const bgImg = resolveImageUrl(data?.bgImg, defaultBgImg);
  const testimonials = (data?.items && data.items.length > 0) ? data.items : DEFAULT_TESTIMONIALS;

  return (
    <section id="testimonials" className="relative w-full min-h-screen bg-[#f5f1e8] overflow-hidden flex flex-col snap-section">
      
      {/* Background Image & Soft Cream Overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={bgImg} 
          alt="Glowing Doorway" 
          onError={(e) => {
            if (e.currentTarget.src !== defaultBgImg) {
              e.currentTarget.src = defaultBgImg;
            }
          }}
          className="w-full h-full object-cover opacity-100 contrast-[1.05] saturate-[1.05] will-change-transform"
          style={{
            objectPosition: `${DESKTOP_IMAGE_CONTROLS.posX} ${DESKTOP_IMAGE_CONTROLS.posY}`,
            transform: `scale(${DESKTOP_IMAGE_CONTROLS.zoom}) translate(${DESKTOP_IMAGE_CONTROLS.translateX}, ${DESKTOP_IMAGE_CONTROLS.translateY}) translateZ(0)`
          }}
        />
        {/* Soft cream gradient only on the left for text and cards, leaving the glowing doorway and mountain 100% crystal clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8]/80 via-[#f5f1e8]/50 via-35% md:via-[#f5f1e8]/30 md:via-50% to-transparent w-full lg:w-[50%]" />
        
        {/* Minimal edge blends */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f5f1e8]/50 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#f5f1e8]/40 to-transparent" />
      </div>

      <div className="relative z-10 flex-grow flex flex-col pt-24 pb-8 w-full">
        <Container className="flex-grow flex flex-col justify-between">
          
          <div className="flex w-full">
            {/* Left Content (Text & Grid) */}
            <div className="w-full lg:w-[68%] xl:w-[62%] flex flex-col gap-6">
              
              {/* Header */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-[1.5px] w-6 bg-[#c9542f]" />
                  <span 
                    className="font-sans text-[0.82rem] sm:text-[0.90rem] uppercase tracking-[0.25em] font-bold text-[#c9542f]"
                    style={{ fontSize: data?.eyebrowFontSize ? `${data.eyebrowFontSize}px` : undefined }}
                  >
                    {eyebrow}
                  </span>
                </div>
                
                <h2 
                  className="font-serif text-[1.75rem] xs:text-[1.95rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] text-[#111010] font-medium tracking-tight leading-[1.08] mb-1 max-w-full"
                  style={{ 
                    fontFamily: 'Fraunces, Georgia, serif',
                    ...(data?.headingFontSize ? { fontSize: `clamp(1.65rem, 6.5vw, ${data.headingFontSize}px)` } : {})
                  }}
                >
                  {heading1}<br/>
                  <span className="text-[#c9542f] not-italic font-medium">{headingAccent}</span>
                </h2>
                
                <p 
                  className="text-[#4a463e] text-xl lg:text-2xl font-serif font-normal tracking-wide leading-relaxed max-w-xl mt-2"
                  style={{ 
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: data?.descriptionFontSize ? `${data.descriptionFontSize}px` : undefined 
                  }}
                >
                  {description}
                </p>
              </div>

              {/* Testimonials Grid (Translucent Glass Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {testimonials.slice(0, 6).map((t, index) => {
                  const initial = t.name ? t.name.charAt(0).toUpperCase() : 'C';
                  const colors = ['bg-[#3d1b37]', 'bg-[#c9542f]', 'bg-[#2f4a34]', 'bg-[#a64117]', 'bg-[#111010]', 'bg-[#3d1b37]'];
                  const color = t.color || colors[index % colors.length];

                  return (
                    <div 
                      key={index} 
                      className="flex flex-col bg-white/40 border border-white/70 rounded-2xl p-5 hover:border-[#c9542f]/40 hover:bg-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-200"
                    >
                      <Quotes className="text-[#c9542f] text-2xl mb-2.5 opacity-90" weight="fill" />
                      
                      <p 
                        className="text-[#2b2723] font-light text-xs sm:text-sm md:text-[0.92rem] leading-relaxed mb-4 flex-grow"
                        style={{ fontSize: data?.cardQuoteFontSize ? `${data.cardQuoteFontSize}px` : undefined }}
                      >
                        "{t.quote}"
                      </p>
                      
                      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-black/8">
                        {t.image ? (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#c9542f]/30 shrink-0 bg-white/80 shadow-xs">
                            <img src={resolveImageUrl(t.image)} alt={t.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                            <span className="font-serif text-sm sm:text-base font-medium">{initial}</span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span 
                            className="font-sans text-[#111010] text-sm sm:text-[0.92rem] font-bold"
                            style={{ fontSize: data?.cardNameFontSize ? `${data.cardNameFontSize}px` : undefined }}
                          >
                            {t.name}
                          </span>
                          <span 
                            className="font-sans text-[#7a756b] text-xs sm:text-[0.72rem] uppercase tracking-wider"
                            style={{ fontSize: data?.cardRoleFontSize ? `${data.cardRoleFontSize}px` : undefined }}
                          >
                            {t.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View More Testimonials Button */}
              <div className="pt-3 flex items-center">
                <Link
                  to="/testimonials"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#111010] hover:bg-[#2b2723] text-[#f5f1e8] text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-[0_4px_16px_rgba(17,16,16,0.15)] group"
                >
                  <span>View More Testimonials</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Trust Pillars */}
          <div className="mt-12 pt-6 border-t border-black/10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-[#c9542f]" weight="bold" />
              <span className="text-xs font-medium text-[#555047]">100% Confidential</span>
            </div>
            <div className="flex items-center gap-3">
              <User size={20} className="text-[#c9542f]" weight="bold" />
              <span className="text-xs font-medium text-[#555047]">Tailored 1-on-1 Sessions</span>
            </div>
            <div className="flex items-center gap-3">
              <Handshake size={20} className="text-[#c9542f]" weight="bold" />
              <span className="text-xs font-medium text-[#555047]">Evidence-Based Coaching</span>
            </div>
            <div className="flex items-center gap-3">
              <Heart size={20} className="text-[#c9542f]" weight="bold" />
              <span className="text-xs font-medium text-[#555047]">Empathetic & Non-Judgmental</span>
            </div>
          </div>

        </Container>
      </div>
    </section>
  );
}
