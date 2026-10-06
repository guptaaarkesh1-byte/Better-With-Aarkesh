import { usePrinciplesData } from '../../hooks/usePrinciplesData';
import PrincipleSection from './PrincipleSection';
import defaultBgImg from '../../assets/Page5/decide-intentionally.jpg';
import { resolveImageUrl } from '../../utils/imageUrl';
import { Sparkle, GitFork, Spiral, Target, SlidersHorizontal, ArrowRight } from '@phosphor-icons/react';

const DEFAULT_DECIDE_DATA = {
  eyebrow: 'PRINCIPLE 03',
  title: 'DECIDE',
  subtitle: 'INTENTIONALLY.',
  highlight: 'True confidence is born from aligned decision making.',
  description: "Indecision is also a decision. Stop second guessing. We create personalized frameworks that give you the courage and conviction to execute fearlessly.",
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
  const rawHighlight = (data?.highlight || 'True confidence is born from aligned decision making.').replace(/decision-making/g, 'decision making');
  const formattedHighlight = rawHighlight.includes('born from aligned')
    ? rawHighlight.replace('born from aligned', 'born from<br />aligned')
    : rawHighlight.includes('\n')
      ? rawHighlight.replace(/\n/g, '<br />')
      : rawHighlight;

  const rawDescription = (data?.description || "Indecision is also a decision. Stop second guessing. We create personalized frameworks that give you the courage and conviction to execute fearlessly.").replace(/second-guessing/g, 'second guessing');
  let formattedDescription = rawDescription;
  if (formattedDescription.includes('Indecision is also a decision. Stop')) {
    formattedDescription = formattedDescription.replace('Indecision is also a decision. Stop', 'Indecision is also a decision.<br />Stop');
  } else if (formattedDescription.includes('Indecision is also a decision.')) {
    formattedDescription = formattedDescription.replace('Indecision is also a decision.', 'Indecision is also a decision.<br />');
  }
  if (formattedDescription.includes('\n')) {
    formattedDescription = formattedDescription.replace(/\n/g, '<br />');
  }

  const paragraphs = [
    `<span class='italic font-serif text-xl lg:text-2xl leading-relaxed text-[#111010] block hyphens-none' style='font-family: Fraunces, Georgia, serif;'>${formattedHighlight}</span>`,
    `<span class='font-serif text-base lg:text-lg font-normal not-italic leading-relaxed text-[#4a463e] block hyphens-none' style='font-family: Fraunces, Georgia, serif; font-style: normal;'>${formattedDescription}</span>`,
    `<span class='italic font-serif text-xl lg:text-2xl leading-relaxed text-[#c9542f] block hyphens-none' style='font-family: Fraunces, Georgia, serif;'>${data?.closingLine || '....Then we help you walk it.'}</span>`
  ];
  const buttonText = data?.buttonText || '';
  const bgImg = resolveImageUrl(data?.bgImg, defaultBgImg);

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
      fallbackImg={defaultBgImg}
      eyebrow={eyebrow}
      headlineWhite={headlineWhite}
      headlineGold={headlineGold}
      headlineGoldItalic={false}
      paragraphs={paragraphs}
      buttonText={buttonText}
      maxContentWidth="max-w-[365px]"
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
