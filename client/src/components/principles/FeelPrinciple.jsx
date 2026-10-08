import { usePrinciplesData } from '../../hooks/usePrinciplesData';
import PrincipleSection from './PrincipleSection';
import defaultBgImg from '../../assets/Page4/feel-honestly.webp';
import { resolveImageUrl } from '../../utils/imageUrl';
import { Sparkle, CloudRain, Waves, Heart, SunDim } from '@phosphor-icons/react';

const DEFAULT_FEEL_DATA = {
  eyebrow: 'PRINCIPLE 02',
  title: 'Feel honestly.',
  subtitle: 'Heal deeply.',
  highlight: "What you resist persists.\nWhat you feel fully dissolves.",
  description: 'Emotions are signals, not dictators. Learn to sit with discomfort, process anxiety, and convert emotional turbulence into fuel for conscious growth.',
  buttonText: '',
  bgImg: ''
};

export default function FeelPrinciple() {
  const customData = usePrinciplesData('feel');
  const data = { ...DEFAULT_FEEL_DATA, ...customData };

  const eyebrow = data.eyebrow || 'PRINCIPLE 02';
  const headlineWhite = data.title || 'Feel honestly.';
  const headlineGold = data.subtitle || 'Heal deeply.';
  const rawHighlight = data?.highlight || "What you resist persists.\nWhat you feel fully dissolves.";
  const formattedHighlight = rawHighlight.includes('What you resist persists.') && !rawHighlight.includes('<br />') && !rawHighlight.includes('\n')
    ? rawHighlight.replace('What you resist persists.', 'What you resist persists.<br />')
    : rawHighlight.includes('\n')
      ? rawHighlight.replace(/\n/g, '<br />')
      : rawHighlight;

  const rawDescription = data?.description || 'Emotions are signals, not dictators. Learn to sit with discomfort, process anxiety, and convert emotional turbulence into fuel for conscious growth.';
  const formattedDescription = rawDescription.includes('\n')
    ? rawDescription.replace(/\n/g, '<br />')
    : rawDescription;
  const descText = formattedDescription.startsWith('....') ? formattedDescription : '....' + formattedDescription;

  const paragraphs = [
    `<span class='italic font-serif leading-relaxed text-[#111010] block hyphens-none' style='font-family: Fraunces, Georgia, serif;'>${formattedHighlight}</span>`,
    `<span class='font-serif font-normal not-italic leading-relaxed text-[#4a463e] block hyphens-none' style='font-family: Fraunces, Georgia, serif;'>${descText}</span>`
  ];
  const buttonText = data?.buttonText || '';
  const bgImg = resolveImageUrl(data?.bgImg, defaultBgImg);

  return (
    <PrincipleSection 
      id="feel-principle"
      bgImg={bgImg}
      fallbackImg={defaultBgImg}
      imagePosition="object-[70%_center] md:object-[75%_center] lg:object-[80%_center]"
      eyebrow={eyebrow}
      headlineWhite={headlineWhite}
      headlineGold={headlineGold}
      headlineGoldItalic={false}
      paragraphs={paragraphs}
      buttonText={buttonText}
      maxContentWidth="max-w-[365px]"
      eyebrowFontSize={data?.eyebrowFontSize}
      headingFontSize={data?.headingFontSize}
      descriptionFontSize={data?.descriptionFontSize}
      buttonFontSize={data?.buttonFontSize}
      activeStep={2}
      bannerTitle="DYNAMIC<br/>EXPERIENCE"
      bannerIcon={Sparkle}
      bannerSteps={[
        { icon: CloudRain, text: "As you enter this section, the window shows a storm—unprocessed emotions." },
        { icon: Waves, text: "As you scroll, the rain slows. The light softens. The room feels calmer." },
        { icon: Heart, text: "The message fades in—reminding you that feeling is the first step to real healing." },
        { icon: SunDim, text: 'The progress indicator on the right highlights "FEEL" as you arrive here.' }
      ]}
      transitionText="As you scroll, the view outside clears, and we move into the next principle."
    />
  );
}
