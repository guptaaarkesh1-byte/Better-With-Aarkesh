import React from 'react';
import Container from '../ui/Container';
import PrincipleProgress from '../principles/PrincipleProgress';
import bgImg from '../../assets/Page9/ChatGPT Image Jul 24, 2026, 04_56_37 PM.png';
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

export default function TestimonialsSection() {
  const testimonials = [
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

  return (
    <section id="testimonials" className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col snap-section">
      
      {/* Background Image & Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImg} 
          alt="Glowing Doorway" 
          className="absolute right-0 top-0 h-full w-full md:w-[70%] object-cover object-right opacity-80"
        />
        {/* Horizontal Gradient fading to solid black on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
        {/* Vertical Gradient for bottom banner integration */}
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
                  <div className="h-[1px] w-4 bg-accent-gold" />
                  <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-bold text-accent-gold">
                    REAL STORIES. REAL CHANGE.
                  </span>
                </div>
                
                <h2 className="font-serif text-4xl md:text-5xl text-white font-medium tracking-tight leading-tight">
                  Their words.<br/>
                  <span className="text-accent-gold italic">Their transformation.</span>
                </h2>
                
                <p className="text-white/70 font-light text-xs md:text-sm max-w-md mt-1">
                  People from different walks of life.<br/>
                  Different challenges. Same results that matter.
                </p>
              </div>

              {/* Testimonials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {testimonials.map((t, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-accent-gold/40 transition-colors"
                  >
                    <Quotes className="text-accent-gold text-xl mb-2 opacity-80" weight="fill" />
                    
                    <p className="text-white/80 font-light text-[0.65rem] md:text-xs leading-relaxed mb-4 flex-grow">
                      {t.quote}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-auto">
                      {/* Avatar Placeholder */}
                      <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center border border-white/20 shrink-0`}>
                        <span className="font-serif text-white text-sm">{t.initial}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-sans text-accent-gold text-xs font-semibold">{t.name}</span>
                        <span className="font-sans text-white/50 text-[0.55rem] uppercase tracking-wider">{t.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Left Column CTA */}
              <div className="mt-4 border border-white/5 bg-[#0f0f0f]/60 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full border border-accent-gold flex items-center justify-center shrink-0">
                    <ChatCenteredText className="text-accent-gold text-xl" weight="light" />
                  </div>
                  <div className="flex flex-col text-center md:text-left">
                    <h3 className="font-serif text-xl md:text-2xl text-white mb-1">Your story could be next.</h3>
                    <p className="font-sans text-white/60 font-light text-xs md:text-sm">Let's work together to create your transformation.</p>
                  </div>
                </div>
                
                <Link to="/book" className="flex items-center justify-center gap-3 border border-accent-gold rounded-md px-6 py-3 transition-colors hover:bg-accent-gold/10 shrink-0 w-full md:w-auto">
                  <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold">
                    BOOK YOUR SESSION
                  </span>
                  <ArrowRight className="text-accent-gold text-sm" />
                </Link>
              </div>

            </div>

            {/* Right Side Progress Bar */}
            <div className="hidden lg:flex absolute right-12 top-28">
              <PrincipleProgress activeStep={5} />
            </div>

          </div>

          {/* Right Bottom Floater (Different Stories) */}
          <div className="hidden lg:flex absolute right-16 bottom-16 flex-col items-start gap-2">
            <Quotes className="text-accent-gold text-3xl opacity-80 mb-2" weight="fill" />
            <h3 className="font-serif text-3xl text-white">Different stories.</h3>
            <h3 className="font-serif text-3xl text-accent-gold italic">One direction—forward.</h3>
          </div>

        </Container>
      </div>
      {/* Very Bottom Features Banner */}
      <div className="relative z-10 w-full bg-black py-6 pb-10">
        <Container className="flex flex-wrap items-center justify-center md:justify-between gap-6 opacity-70">
          
          <div className="flex items-center gap-3 group">
            <ShieldCheck className="text-accent-gold text-2xl group-hover:scale-110 transition-transform" weight="light" />
            <div className="flex flex-col">
              <span className="font-sans text-white text-xs font-medium">100% Confidential</span>
              <span className="font-sans text-white/50 text-[0.65rem]">Your story stays safe.</span>
            </div>
          </div>

          <div className="hidden md:block w-[1px] h-8 bg-white/10" />

          <div className="flex items-center gap-3 group">
            <User className="text-accent-gold text-2xl group-hover:scale-110 transition-transform" weight="light" />
            <div className="flex flex-col">
              <span className="font-sans text-white text-xs font-medium">Non-Judgmental Space</span>
              <span className="font-sans text-white/50 text-[0.65rem]">Always.</span>
            </div>
          </div>

          <div className="hidden md:block w-[1px] h-8 bg-white/10" />

          <div className="flex items-center gap-3 group">
            <Star className="text-accent-gold text-2xl group-hover:scale-110 transition-transform" weight="light" />
            <div className="flex flex-col">
              <span className="font-sans text-white text-xs font-medium">Proven Approach</span>
              <span className="font-sans text-white/50 text-[0.65rem]">Backed by experience.</span>
            </div>
          </div>

          <div className="hidden lg:block w-[1px] h-8 bg-white/10" />

          <div className="flex items-center gap-3 group">
            <Handshake className="text-accent-gold text-2xl group-hover:scale-110 transition-transform" weight="light" />
            <div className="flex flex-col">
              <span className="font-sans text-white text-xs font-medium">Commitment to You</span>
              <span className="font-sans text-white/50 text-[0.65rem]">Your growth. My priority.</span>
            </div>
          </div>

          <div className="hidden lg:block w-[1px] h-8 bg-white/10" />

          <div className="flex items-center gap-3 group">
            <Heart className="text-accent-gold text-2xl group-hover:scale-110 transition-transform" weight="light" />
            <div className="flex flex-col">
              <span className="font-sans text-white text-xs font-medium">Human First</span>
              <span className="font-sans text-white/50 text-[0.65rem]">Always.</span>
            </div>
          </div>

        </Container>
      </div>

    </section>
  );
}
