import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import { 
  Quotes, 
  ArrowLeft
} from '@phosphor-icons/react';

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

export default function TestimonialsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
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

  // ONLY show exact testimonials saved in admin / database (fallback to initial only before fetch)
  const testimonials = (data?.items && Array.isArray(data.items)) ? data.items : DEFAULT_TESTIMONIALS;


  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#111010] pt-28 pb-20 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#c9542f]/[0.03] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-40 right-10 w-[500px] h-[500px] bg-[#ede7d8] rounded-full blur-[180px] pointer-events-none" />

      <Container className="relative z-10">
        
        {/* Navigation / Back Button Row & Heading */}
        <div className="mb-10 sm:mb-12 flex flex-col gap-6">
          <Link
            to="/#testimonials"
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-black/10 hover:border-[#c9542f]/40 bg-white/90 hover:bg-white text-[#111010] hover:text-[#c9542f] text-xs uppercase tracking-[0.18em] font-medium transition-all duration-300 shadow-xs group w-fit cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200 text-[#c9542f]" />
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="h-[1.5px] w-6 bg-[#c9542f]" />
              <span 
                className="font-sans text-[0.82rem] sm:text-[0.90rem] uppercase tracking-[0.25em] font-bold text-[#c9542f]"
                style={{ fontSize: data?.eyebrowFontSize ? `${data.eyebrowFontSize}px` : undefined }}
              >
                {data?.eyebrowText || 'REAL STORIES. REAL CHANGE.'}
              </span>
            </div>
            
            <h1 
              className="font-serif text-4xl md:text-6xl lg:text-[4.5rem] text-[#111010] font-medium tracking-tight leading-[1.08] mb-1"
              style={{ 
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: data?.headingFontSize ? `${data.headingFontSize}px` : undefined 
              }}
            >
              {data?.headingLine1 ? (
                <>
                  {data.headingLine1}{' '}
                  <span className="text-[#c9542f] not-italic font-medium">{data.headingAccent || ''}</span>
                </>
              ) : (
                <>
                  Testimonials &amp; <span className="text-[#c9542f] not-italic font-medium">Stories</span>
                </>
              )}
            </h1>
            
            <p 
              className="text-[#4a463e] font-serif text-xl lg:text-2xl font-normal max-w-xl mt-2 leading-relaxed"
              style={{ 
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: data?.descriptionFontSize ? `${data.descriptionFontSize}px` : undefined 
              }}
            >
              {data?.description || 'Real reflections and transformative journeys from people who decided to do the work.'}
            </p>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, index) => {
            const initial = t.name ? t.name.charAt(0).toUpperCase() : 'C';
            const colors = [
              'bg-[#c9542f]', 
              'bg-[#3d1b37]', 
              'bg-[#2f4a34]', 
              'bg-[#a64117]', 
              'bg-[#111010]', 
              'bg-[#c9542f]'
            ];
            const color = t.color || colors[index % colors.length];

            return (
              <div 
                key={index}
                className="flex flex-col justify-between bg-white/40 border border-white/70 hover:border-[#c9542f]/40 rounded-2xl p-6 sm:p-7 transition-all duration-300 group hover:bg-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_32px_rgba(201, 84, 47,0.08)] hover:-translate-y-1"
              >
                <div>
                  {/* Top Row: Quote Icon */}
                  <div className="mb-3">
                    <Quotes className="text-[#c9542f] text-2xl opacity-90 group-hover:scale-110 transition-transform duration-300" weight="fill" />
                  </div>

                  {/* Quote Body */}
                  <p 
                    className="font-serif text-[#2b2723] font-light text-base sm:text-[1.02rem] leading-relaxed mb-6"
                    style={{ fontSize: data?.cardQuoteFontSize ? `${data.cardQuoteFontSize}px` : undefined }}
                  >
                    "{t.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-black/6 mt-auto">
                  {t.image ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c9542f]/30 shrink-0 bg-white shadow-xs">
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                      <span className="font-serif text-white text-base font-medium">{initial}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span 
                      className="font-sans text-[#111010] text-sm sm:text-[0.94rem] font-bold"
                      style={{ fontSize: data?.cardNameFontSize ? `${data.cardNameFontSize}px` : undefined }}
                    >
                      {t.name}
                    </span>
                    <span 
                      className="font-sans text-[#7a756b] text-xs uppercase tracking-wider mt-0.5"
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

      </Container>
    </div>
  );
}
