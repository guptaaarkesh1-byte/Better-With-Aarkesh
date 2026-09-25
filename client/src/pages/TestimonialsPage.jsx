import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/#testimonials');
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white pt-28 pb-20 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#c79c6e]/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-40 right-10 w-[500px] h-[500px] bg-[#c79c6e]/[0.03] rounded-full blur-[180px] pointer-events-none" />

      <Container className="relative z-10">
        
        {/* Navigation / Back Button Row & Heading */}
        <div className="mb-10 sm:mb-12 flex flex-col gap-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 hover:border-[#c79c6e]/60 bg-white/[0.03] hover:bg-[#c79c6e]/10 text-white/80 hover:text-[#f4eedf] text-xs uppercase tracking-[0.18em] font-medium transition-all duration-300 group w-fit"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200 text-[#c79c6e]" />
            <span>Back to Home</span>
          </button>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight">
            Testimonials
          </h1>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, index) => {
            const initial = t.name ? t.name.charAt(0).toUpperCase() : 'C';
            const colors = [
              'bg-blue-900/80', 
              'bg-purple-900/80', 
              'bg-green-900/80', 
              'bg-orange-900/80', 
              'bg-teal-900/80', 
              'bg-rose-900/80'
            ];
            const color = t.color || colors[index % colors.length];

            return (
              <div 
                key={index}
                className="flex flex-col justify-between bg-[#0e0c0a] border border-white/10 hover:border-[#c79c6e]/50 rounded-xl p-6 sm:p-7 transition-all duration-300 group hover:shadow-[0_12px_36px_rgba(0,0,0,0.7)]"
              >
                <div>
                  {/* Top Row: Quote Icon */}
                  <div className="mb-4">
                    <Quotes className="text-[#c79c6e] text-2xl opacity-90" weight="fill" />
                  </div>

                  {/* Quote Body */}
                  <p className="font-serif text-white/90 font-light text-base sm:text-[1.02rem] leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-white/10 mt-auto">
                  {t.image ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c79c6e]/40 shrink-0 bg-black shadow-inner">
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center border border-white/20 shrink-0 shadow-inner`}>
                      <span className="font-serif text-white text-base font-medium">{initial}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-sans text-[#f6cb90] text-sm font-semibold">{t.name}</span>
                    <span className="font-sans text-white/55 text-xs uppercase tracking-wider mt-0.5">{t.role}</span>
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
