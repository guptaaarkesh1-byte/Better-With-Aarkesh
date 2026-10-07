import React, { useState, useEffect } from 'react';
import Container from '../ui/Container';
import { CaretDown, Sparkle } from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_FAQS = [
  {
    question: 'How does 1-on-1 coaching with Aarkesh work?',
    answer: 'Each session is a completely personalized, confidential conversation. Together, we identify subconscious blind spots, dissolve reactive emotional triggers, and create practical, actionable frameworks tailored to your unique challenges in career, relationships, and inner sovereignty.',
  },
  {
    question: 'What is the difference between life coaching and therapy?',
    answer: 'While therapy generally focuses on resolving past trauma and emotional healing, life coaching with Aarkesh is forward focused and action driven. We concentrate on where you are right now and build the emotional mastery, presence, and decision making clarity needed to shape your future.',
  },
  {
    question: 'How do I choose between a 60-minute and 90-minute session?',
    answer: 'A 60-minute session is ideal for focused problem solving, navigating a specific decision, or continuous monthly momentum. A 90-minute session is recommended for your first deep dive, allowing ample space to thoroughly map your core patterns and develop a complete transformation roadmap.',
  },
  {
    question: 'Are all our conversations confidential?',
    answer: 'Yes, 100%. Every conversation, reflection, and personal detail you share is held in absolute privacy and confidence. This is your safe, judgment free space to speak openly and authentically.',
  },
  {
    question: 'What happens after I book my session?',
    answer: 'You will receive an instant confirmation email with your calendar invite, a secure Google Meet/video link, and a brief reflection questionnaire to help you prepare your intentions before our conversation.',
  },
  {
    question: 'Can I reschedule if my schedule changes?',
    answer: 'Absolutely. You can reschedule your session anytime up to 48 hours before the appointment using the simple reschedule link in your email or through your My Journey dashboard.',
  },
];

export default function CoachingFaqSection() {
  const [data, setData] = useState(null);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-settings/faq`);
        if (res.ok && isMounted) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load FAQ section settings:', err);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const badgeText = data?.badgeText || 'Frequently Asked Questions';
  const heading1 = data?.headingLine1 || 'Clarity before you begin.';
  const headingAccent = data?.headingAccent || 'Everything you need to know.';
  const faqs = (data?.items && data.items.length > 0) ? data.items : DEFAULT_FAQS;

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="relative w-full bg-[#f5f1e8] text-[#111010] py-24 md:py-32 border-t border-black/8 overflow-hidden">
      {/* Subtle Background Warm Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c9542f]/5 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-14 md:mb-18">
          <div 
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fbf0eb] border border-[#e8c4e2] text-[#c9542f] text-[0.82rem] sm:text-[0.90rem] font-sans font-bold uppercase tracking-[0.25em] mb-4 shadow-xs"
            style={{ fontSize: data?.eyebrowFontSize ? `${data.eyebrowFontSize}px` : undefined }}
          >
            <Sparkle size={15} weight="fill" />
            <span>{badgeText}</span>
          </div>

          <h2 
            className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#111010] tracking-tight leading-tight max-w-3xl"
            style={{ 
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: data?.headingFontSize ? `${data.headingFontSize}px` : undefined 
            }}
          >
            {heading1}<br />
            <span className="text-[#c9542f] not-italic font-medium">{headingAccent}</span>
          </h2>

          <p 
            className="font-sans text-base sm:text-lg md:text-[1.05rem] text-[#555047] max-w-2xl mt-4 leading-relaxed font-light"
            style={{ fontSize: data?.descriptionFontSize ? `${data.descriptionFontSize}px` : undefined }}
          >
            {data?.description || 'Have questions about starting your coaching journey? Here are straightforward answers to help you take the first step with complete confidence.'}
          </p>
        </div>

        {/* Accordion FAQ Items */}
        <div className="flex flex-col gap-2.5 max-w-4xl mx-auto">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#fbf0eb] border-[#c9542f]/40 shadow-[0_4px_16px_rgba(201,84,47,0.06)]'
                    : 'bg-white/95 border-black/8 hover:border-black/20 shadow-xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left px-5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 cursor-pointer select-none group"
                  aria-expanded={isOpen}
                >
                  <span className={`font-serif text-base sm:text-lg md:text-[1.05rem] transition-colors leading-snug ${
                    isOpen ? 'text-[#c9542f]' : 'text-[#111010] group-hover:text-[#c9542f]'
                  }`}>
                    {faq.question}
                  </span>

                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                    isOpen
                      ? 'bg-[#c9542f] text-white border-[#c9542f] rotate-180 shadow-xs'
                      : 'bg-[#f5f1e8] text-[#111010] border-black/10 group-hover:border-[#c9542f]/40 group-hover:text-[#c9542f]'
                  }`}>
                    <CaretDown size={14} weight="bold" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-4 pt-1 text-xs sm:text-sm md:text-[0.92rem] font-sans text-[#2b2723] leading-relaxed font-light border-t border-black/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
