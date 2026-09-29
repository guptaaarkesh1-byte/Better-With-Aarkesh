import { usePrinciplesData } from '../../hooks/usePrinciplesData';
import PrincipleSection from './PrincipleSection';
import defaultBgImg from '../../assets/Page5/decide-intentionally.jpg';
import { Sparkle, GitFork, Spiral, Target, SlidersHorizontal, ArrowRight } from '@phosphor-icons/react';

const DEFAULT_DECIDE_DATA = {
  eyebrow: 'PRINCIPLE 03',
  title: 'DECIDE',
  subtitle: 'INTENTIONALLY.',
  highlight: 'True confidence is born from aligned decision-making.',
  description: "Indecision is also a decision. Stop second-guessing. We create personalized frameworks that give you the courage and conviction to execute fearlessly.",
  closingLine: '....Then we help you walk it.',
  buttonText: '',
  bgImg: ''
};

export default function DecidePrinciple() {
  const customData = usePrinciplesData('decide');
  const data = { ...DEFAULT_DECIDE_DATA, ...customData };

  const eyebrow = data.eyebrow || 'PRINCIPLE 03';
  const headlineWhite = data.title || 'DECIDE';
  const headlineGold = data.subtitle || 'INTENTIONALLY.';
  const paragraphs = [
    `<span class='italic font-serif text-xl lg:text-2xl leading-relaxed text-[#111010] block' style='font-family: Fraunces, Georgia, serif;'>${data?.highlight || 'True confidence is born from aligned decision-making.'}</span>`,
    `<span class='font-serif text-sm sm:text-base lg:text-base font-normal not-italic text-[#4a463e] leading-relaxed block' style='font-family: Fraunces, Georgia, serif;'>${data?.description || "Indecision is also a decision. Stop second-guessing. We create personalized frameworks that give you the courage and conviction to execute fearlessly."}</span>`,
    `<span class='italic font-serif text-xl lg:text-2xl leading-relaxed text-[#c9542f] block' style='font-family: Fraunces, Georgia, serif;'>${data?.closingLine || '....Then we help you walk it.'}</span>`
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
      imagePosition="object-[65%_center] md:object-[70%_center] lg:object-[75%_center]"
    />
  );
}
