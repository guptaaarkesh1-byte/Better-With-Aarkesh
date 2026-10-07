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
      return <PhoneCall size={size} className="text-[#c9542f]" weight="regular" />;
    case 'chat':
    case 'discord':
    case 'community':
    case 'message':
      return <ChatCircleDots size={size} className="text-[#c9542f]" weight="regular" />;
    case 'location':
      return <MapPin size={size} className="text-[#c9542f]" weight="regular" />;
    case 'email':
    default:
      return <EnvelopeSimple size={size} className="text-[#c9542f]" weight="regular" />;
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
            value: 'coaching@aarkeshgupta.com'
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
            value: '+91 1234567890'
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
              value: 'coaching@aarkeshgupta.com'
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
              value: '+91 1234567890'
            }
          ]
        }
      ];

  return (
    <div className="w-full min-h-screen bg-[#f5f1e8] text-[#111010] pt-28 sm:pt-32 pb-24 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#c9542f]/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-40 right-10 w-[500px] h-[500px] bg-[#ede7d8] rounded-full blur-[180px] pointer-events-none" />

      {/* Subtle Background Geometric Accent */}
      <div 
        className="absolute top-16 right-6 sm:right-16 w-64 h-64 opacity-25 pointer-events-none rotate-45"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(201, 84, 47, 0.25) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      <Container className="relative z-10 flex flex-col gap-8 sm:gap-12">
        
        {/* Top Navigation Bar: Clean Back Button */}
        <div className="flex items-center justify-start w-full">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white border border-black/10 hover:border-[#c9542f]/40 text-[#111010] hover:text-[#c9542f] text-xs font-medium uppercase tracking-[0.15em] transition-all duration-200 shadow-xs cursor-pointer"
            aria-label="Go Back"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform text-[#c9542f]" />
            <span>{settings.backButtonText || 'Back'}</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c9542f]/10 border border-[#c9542f]/25 text-[#c9542f] text-xs font-sans uppercase tracking-[0.2em] font-medium">
            <Sparkle size={13} weight="fill" />
            <span>{settings.headerBadge || 'Get In Touch'}</span>
          </div>

          <h1 
            className="text-3xl sm:text-4xl md:text-5xl text-[#111010] tracking-tight leading-tight font-medium"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            {settings.headerTitle || 'How can we support you?'}
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#555047] font-normal leading-relaxed max-w-xl">
            {settings.headerSubtitle || 'Reach out to our dedicated desks for 1-on-1 coaching, sessions, and learning assistance.'}
          </p>
        </div>

        {/* ─── DYNAMIC CONTACT CARDS ─── */}
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
                className="bg-white/95 border border-[#e8e2d5] hover:border-[#c9542f]/50 rounded-[22px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-[#c9542f]/5 group relative"
              >
                <div>
                  {/* Icon */}
                  <div className="mb-4 w-12 h-12 rounded-xl bg-[#c9542f]/10 border border-[#c9542f]/20 flex items-center justify-center">
                    {getCardIcon(iconType, 26)}
                  </div>

                  {/* Title */}
                  <h3 className="font-sans text-base sm:text-[1.05rem] font-semibold text-[#111010] mb-2 tracking-tight">
                    {card.title}
                  </h3>

                  {/* Items List (Multiple Emails / Phone Numbers / Action links) */}
                  <div className="space-y-2.5 mt-2">
                    {items.map((item, itemIdx) => {
                      const copyKey = `${card.id || idx}-${itemIdx}`;
                      const isCopied = copiedIndex === copyKey;
                      const itemLink = getAutoLink(item.value, iconType);
                      const isInternal = itemLink?.startsWith('/') && !itemLink?.startsWith('//');

                      return (
                        <div key={item.id || itemIdx} className="flex items-center justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            {item.label && (
                              <span className="text-[0.68rem] text-[#736c61] uppercase tracking-wider font-semibold">
                                {item.label}
                              </span>
                            )}
                            {isInternal ? (
                              <Link
                                to={itemLink}
                                className="font-sans text-sm sm:text-[0.92rem] font-semibold text-[#c9542f] hover:text-[#a83e1b] transition-colors truncate block group-hover:underline"
                                title={item.value}
                              >
                                {item.value}
                              </Link>
                            ) : (
                              <a
                                href={itemLink}
                                className="font-sans text-sm sm:text-[0.92rem] font-semibold text-[#c9542f] hover:text-[#a83e1b] transition-colors truncate block hover:underline"
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
                              className="p-1.5 rounded-lg bg-[#f5f1e8] hover:bg-[#c9542f]/15 text-[#736c61] hover:text-[#c9542f] transition-colors shrink-0 cursor-pointer"
                              title={`Copy ${item.value}`}
                            >
                              {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subtitle / Availability */}
                {card.subtitle && (
                  <div className="mt-5 pt-3.5 border-t border-[#e8e2d5] text-xs font-sans text-[#736c61] font-normal">
                    {card.subtitle}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── ADDRESS & LOCATION SECTION (Clean Minimalist Design) ─── */}
        <div className="w-full max-w-4xl mx-auto mt-2">
          <div className="bg-white border border-[#e8e2d5] rounded-[24px] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[#e8e2d5] pb-6 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#c9542f]/10 border border-[#c9542f]/20 flex items-center justify-center text-[#c9542f] shrink-0">
                  <MapPin size={24} weight="fill" />
                </div>
                <div>
                  <h2 
                    className="text-xl sm:text-2xl text-[#111010] font-medium"
                    style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                  >
                    {settings.addressTitle || 'Registered Office & Address'}
                  </h2>
                  <p className="font-sans text-xs text-[#736c61] mt-0.5">
                    {settings.addressSubtitle || 'Official business details and communication location'}
                  </p>
                </div>
              </div>

              <Link
                to={settings.addressCtaUrl || '/book'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c9542f] hover:bg-[#b04523] text-white font-medium text-xs uppercase tracking-wider transition-all shadow-md shadow-[#c9542f]/20 shrink-0"
              >
                <span>{settings.addressCtaText || 'Book 1:1 Coaching'}</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans text-xs">
              {/* Location */}
              <div className="space-y-1.5">
                <span className="text-[#736c61] uppercase tracking-wider text-[0.72rem] block font-semibold">
                  {settings.operatingLocationLabel || 'Operating Location'}
                </span>
                <p className="text-[#111010] text-sm font-normal leading-relaxed whitespace-pre-line">
                  {settings.operatingLocation || 'Mumbai, Maharashtra, India'}
                </p>
              </div>

              {/* Hours */}
              <div className="space-y-1.5">
                <span className="text-[#736c61] uppercase tracking-wider text-[0.72rem] block font-semibold">
                  {settings.operatingHoursLabel || 'Working Hours'}
                </span>
                <p className="text-[#111010] text-sm font-normal leading-relaxed whitespace-pre-line">
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
