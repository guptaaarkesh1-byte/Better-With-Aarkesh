import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import { 
  EnvelopeSimple, 
  PhoneCall, 
  ChatCircleDots, 
  MapPin, 
  Clock, 
  Copy, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Sparkle
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getCardIcon = (type, size = 28) => {
  switch (type?.toLowerCase()) {
    case 'phone':
    case 'call':
    case 'online':
    case 'offline':
      return <PhoneCall size={size} className="text-[#c79c6e]" weight="regular" />;
    case 'chat':
    case 'discord':
    case 'community':
    case 'message':
      return <ChatCircleDots size={size} className="text-[#c79c6e]" weight="regular" />;
    case 'location':
      return <MapPin size={size} className="text-[#c79c6e]" weight="regular" />;
    case 'email':
    default:
      return <EnvelopeSimple size={size} className="text-[#c79c6e]" weight="regular" />;
  }
};

const getAutoLink = (value, iconType) => {
  if (!value) return '#';
  const val = value.trim();
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  if (val.startsWith('www.')) return `https://${val}`;
  if (val.startsWith('/')) return val;
  if (val.startsWith('mailto:') || val.startsWith('tel:')) return val;
  if (val.includes('@') || iconType === 'email') {
    return `mailto:${val}`;
  }
  if (iconType === 'phone' || /^[\d\s+()\-]{7,}$/.test(val)) {
    const cleanNum = val.replace(/[^0-9+]/g, '');
    return `tel:${cleanNum}`;
  }
  return val;
};

export default function ContactUs() {
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [settings, setSettings] = useState({
    headerBadge: 'Get In Touch',
    headerTitle: 'How can we support you?',
    headerSubtitle: 'Reach out to our dedicated desks for 1-on-1 coaching, sessions, and learning assistance.',
    cards: [
      {
        id: 'card-1',
        icon: 'email',
        title: 'Email Support',
        subtitle: 'We reply within 24 hours',
        items: [
          {
            id: 'item-1',
            label: '',
            value: 'coaching@betterwithaarkesh.com'
          }
        ]
      },
      {
        id: 'card-2',
        icon: 'phone',
        title: 'Phone Support',
        subtitle: '11am - 8pm (Mon-Sat)',
        items: [
          {
            id: 'item-2',
            label: '',
            value: '1234567890'
          }
        ]
      }
    ],
    addressTitle: 'Registered Office & Address',
    addressSubtitle: 'Official business details and communication location',
    operatingLocation: 'Mumbai, Maharashtra, India',
    operatingHours: 'Monday – Saturday, 11:00 AM – 8:00 PM IST',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchContactSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/contact-settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Failed to fetch contact settings:', err);
      }
    };
    fetchContactSettings();
  }, []);

  const handleCopy = (text, idx) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const cardsList = Array.isArray(settings.cards) && settings.cards.length > 0
    ? settings.cards
    : [
        {
          id: 'card-1',
          icon: 'email',
          title: 'Email Support',
          subtitle: 'We reply within 24 hours',
          items: [
            {
              id: 'item-1',
              label: '',
              value: 'coaching@betterwithaarkesh.com'
            }
          ]
        },
        {
          id: 'card-2',
          icon: 'phone',
          title: 'Phone Support',
          subtitle: '11am - 8pm (Mon-Sat)',
          items: [
            {
              id: 'item-2',
              label: '',
              value: '1234567890'
            }
          ]
        }
      ];

  return (
    <div className="w-full min-h-screen bg-[#070707] text-white pt-24 sm:pt-32 pb-24 relative overflow-hidden font-sans">
      
      {/* Background Warm Gradient Glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[700px] h-[400px] bg-[#c79c6e]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-[#c79c6e]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Background Geometric Grid Accent (Top Right) */}
      <div 
        className="absolute top-16 right-6 sm:right-16 w-64 h-64 opacity-20 pointer-events-none rotate-45"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(199, 156, 110, 0.4) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      <Container className="relative z-10 flex flex-col gap-8 sm:gap-12">
        
        {/* Top Navigation Bar: Clean Back Button */}
        <div className="flex items-center justify-start w-full">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-[#c79c6e]/15 border border-white/10 hover:border-[#c79c6e]/30 text-white/70 hover:text-[#c79c6e] text-xs font-sans transition-all duration-200 cursor-pointer"
            aria-label="Go Back"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>{settings.backButtonText || 'Back'}</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c79c6e]/10 border border-[#c79c6e]/25 text-[#c79c6e] text-xs font-sans uppercase tracking-[0.2em]">
            <Sparkle size={13} weight="fill" />
            <span>{settings.headerBadge || 'Get In Touch'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
            {settings.headerTitle || 'How can we support you?'}
          </h1>

          <p className="font-sans text-sm sm:text-base text-white/60 font-light leading-relaxed max-w-xl">
            {settings.headerSubtitle || 'Reach out to our dedicated desks for 1-on-1 coaching, sessions, and learning assistance.'}
          </p>
        </div>

        {/* ─── DYNAMIC CONTACT CARDS (Wraps smoothly to bottom row if > 4) ─── */}
        <div className={`grid gap-5 sm:gap-6 ${
          cardsList.length === 1 
            ? 'grid-cols-1 max-w-md mx-auto w-full' 
            : cardsList.length === 2 
            ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto w-full' 
            : cardsList.length === 3 
            ? 'grid-cols-1 md:grid-cols-3' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {cardsList.map((card, idx) => {
            const iconType = card.icon || card.iconType || 'email';
            const items = Array.isArray(card.items) && card.items.length > 0
              ? card.items
              : card.highlight
              ? [{ id: '1', label: '', value: card.highlight, linkUrl: card.linkUrl }]
              : [];

            return (
              <div
                key={card.id || idx}
                className="bg-[#121111]/90 border border-[#2a2624] hover:border-[#c79c6e]/50 rounded-[20px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#c79c6e]/10 group relative"
              >
                <div>
                  {/* Icon */}
                  <div className="mb-4">
                    {getCardIcon(iconType, 30)}
                  </div>

                  {/* Title */}
                  <h3 className="font-sans text-base sm:text-[1.05rem] font-medium text-white/90 mb-2 tracking-tight">
                    {card.title}
                  </h3>

                  {/* Items List (Multiple Emails / Phone Numbers / Action links) */}
                  <div className="space-y-2.5 mt-1">
                    {items.map((item, itemIdx) => {
                      const copyKey = `${card.id || idx}-${itemIdx}`;
                      const isCopied = copiedIndex === copyKey;
                      const itemLink = getAutoLink(item.value, iconType);
                      const isInternal = itemLink?.startsWith('/') && !itemLink?.startsWith('//');

                      return (
                        <div key={item.id || itemIdx} className="flex items-center justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            {item.label && (
                              <span className="text-[0.65rem] text-white/40 uppercase tracking-wider font-medium">
                                {item.label}
                              </span>
                            )}
                            {isInternal ? (
                              <Link
                                to={itemLink}
                                className="font-sans text-sm sm:text-[0.92rem] font-semibold text-[#c79c6e] hover:text-[#e0b88d] transition-colors truncate block group-hover:underline"
                                title={item.value}
                              >
                                {item.value}
                              </Link>
                            ) : (
                              <a
                                href={itemLink}
                                className="font-sans text-sm sm:text-[0.92rem] font-semibold text-[#c79c6e] hover:text-[#e0b88d] transition-colors truncate block hover:underline"
                                title={item.value}
                              >
                                {item.value}
                              </a>
                            )}
                          </div>

                          {/* Quick 1-Click Copy Icon for Emails or Phones */}
                          {(iconType === 'email' || iconType === 'phone') && item.value && (
                            <button
                              type="button"
                              onClick={() => handleCopy(item.value, copyKey)}
                              className="p-1 rounded-md bg-white/5 hover:bg-[#c79c6e]/20 text-white/40 hover:text-[#c79c6e] transition-colors shrink-0"
                              title={`Copy ${item.value}`}
                            >
                              {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subtitle / Availability */}
                {card.subtitle && (
                  <div className="mt-5 pt-3.5 border-t border-white/[0.07] text-xs font-sans text-white/50 font-normal">
                    {card.subtitle}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── ADDRESS & LOCATION SECTION (Clean Minimalist Design) ─── */}
        <div className="w-full max-w-4xl mx-auto mt-2">
          <div className="bg-[#121111]/80 border border-[#2a2624] rounded-[22px] p-6 sm:p-8 backdrop-blur-md shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/[0.08] pb-6 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#c79c6e]/10 border border-[#c79c6e]/25 flex items-center justify-center text-[#c79c6e] shrink-0">
                  <MapPin size={22} weight="fill" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-white">
                    {settings.addressTitle || 'Registered Office & Address'}
                  </h2>
                  <p className="font-sans text-xs text-white/50 mt-0.5">
                    {settings.addressSubtitle || 'Official business details and communication location'}
                  </p>
                </div>
              </div>

              <Link
                to={settings.addressCtaUrl || '/book'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c79c6e] hover:bg-[#b0885e] text-black font-semibold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c79c6e]/10 shrink-0"
              >
                <span>{settings.addressCtaText || 'Book 1:1 Coaching'}</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans text-xs">
              {/* Location */}
              <div className="space-y-1.5">
                <span className="text-white/40 uppercase tracking-wider text-[0.7rem] block font-medium">
                  {settings.operatingLocationLabel || 'Operating Location'}
                </span>
                <p className="text-white/90 text-sm font-light leading-relaxed whitespace-pre-line">
                  {settings.operatingLocation || 'Mumbai, Maharashtra, India'}
                </p>
              </div>

              {/* Hours */}
              <div className="space-y-1.5">
                <span className="text-white/40 uppercase tracking-wider text-[0.7rem] block font-medium">
                  {settings.operatingHoursLabel || 'Working Hours'}
                </span>
                <p className="text-white/90 text-sm font-light leading-relaxed whitespace-pre-line">
                  {settings.operatingHours || 'Monday – Saturday, 11:00 AM – 8:00 PM IST'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </Container>
    </div>
  );
}
