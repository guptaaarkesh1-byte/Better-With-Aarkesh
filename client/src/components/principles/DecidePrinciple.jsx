import { useState, useEffect } from 'react';
import PrincipleSection from './PrincipleSection';
import defaultBgImg from '../../assets/Page5/ChatGPT Image Jul 24, 2026, 03_00_05 PM.webp';
import { Sparkle, GitFork, Spiral, Target, SlidersHorizontal, ArrowRight } from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_DECIDE_DATA = {
  eyebrow: 'MY PHILOSOPHY',
  title: 'DECIDE',
  subtitle: 'INTENTIONALLY.',
  highlight: 'Clarity without decision is just expensive loop.',
  description: "We help you align your values, weigh what matters, and choose the path you're willing to walk.",
  closingLine: '....Then we help you walk it.',
  buttonText: '',
  bgImg: ''
};

export default function DecidePrinciple() {
  const [data, setData] = useState(DEFAULT_DECIDE_DATA);

  useEffect(() => {
    fetch(`${API_URL}/api/home-settings/principles`)
      .then(res => res.ok ? res.json() : null)
      .then(d => {
        if (d?.decide) setData(prev => ({ ...prev, ...d.decide }));
      })
      .catch(() => {});
  }, []);

  const eyebrow = data.eyebrow || 'MY PHILOSOPHY';
  const headlineWhite = data.title || 'DECIDE';
  const headlineGold = data.subtitle || 'INTENTIONALLY.';
  const paragraphs = [
    `<span class='italic text-xl lg:text-2xl leading-relaxed'>${data?.highlight || 'Clarity without decision is just expensive loop.'}</span>`,
    `<span class='text-lg lg:text-xl leading-relaxed'>${data?.description || "We help you align your values, weigh what matters, and choose the path you're willing to walk."}</span>`,
    `<span class='text-accent-gold text-xl lg:text-2xl font-medium'>${data?.closingLine || '....Then we help you walk it.'}</span>`
  ];
  const buttonText = data?.buttonText || '';
  const bgImg = data?.bgImg || defaultBgImg;

  const customFlow = (
    <div className="flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium">
      <div className="w-24 md:w-48 border-t border-dashed border-accent-gold/50" />
      <ArrowRight className="text-accent-gold mr-2" />
      <span className="text-accent-gold">COACHING</span>
    </div>
  );

  return (
    <PrincipleSection 
      id="decide-principle"
      bgImg={bgImg}
      eyebrow={eyebrow}
      headlineWhite={headlineWhite}
      headlineGold={headlineGold}
      headlineGoldItalic={false}
      paragraphs={paragraphs}
      buttonText={buttonText}
      activeStep={3}
      bannerTitle="DYNAMIC<br/>EXPERIENCE"
      bannerIcon={Sparkle}
      bannerSteps={[
        { icon: GitFork, text: "As this section loads, three paths slowly reveal themselves." },
        { icon: Spiral, text: "Ambient particles drift towards the right path, signaling alignment." },
        { icon: Target, text: "As you scroll, distractions fade and the right path brightens." },
        { icon: SlidersHorizontal, text: 'The progress indicator highlights "DECIDE" as you arrive here.' }
      ]}
      transitionText="As you scroll past the illuminated path, the scene moves you forward on your journey."
      customTransitionFlow={customFlow}
      contentClassName="pt-20"
      imagePosition="object-center"
    />
  );
}
