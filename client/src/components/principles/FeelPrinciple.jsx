import { usePrinciplesData } from '../../hooks/usePrinciplesData';
import PrincipleSection from './PrincipleSection';
import defaultBgImg from '../../assets/Page4/feel-honestly.webp';
import { Sparkle, CloudRain, Waves, Heart, SunDim } from '@phosphor-icons/react';

const DEFAULT_FEEL_DATA = {
  eyebrow: 'PRINCIPLE 02',
  title: 'Feel honestly.',
  subtitle: 'Heal deeply.',
  highlight: "You can't move forward, running from what you feel.",
  description: 'We create the safe space to feel it all - without judgement',
  buttonText: '',
  bgImg: ''
};

export default function FeelPrinciple() {
  const customData = usePrinciplesData('feel');
  const data = { ...DEFAULT_FEEL_DATA, ...customData };

  const eyebrow = data.eyebrow || 'PRINCIPLE 02';
  const headlineWhite = data.title || 'Feel honestly.';
  const headlineGold = data.subtitle || 'Heal deeply.';
  const paragraphs = [
    `<span class='italic text-xl lg:text-2xl leading-relaxed text-[#111010]'>${data?.highlight || "You can't move forward, running from what you feel."}</span>`,
    `<span class='text-[#3d3832] text-lg lg:text-xl leading-relaxed'>....${data?.description || "We create the safe space to feel it all - without judgement"}</span>`
  ];
  const buttonText = data?.buttonText || '';
  const bgImg = data?.bgImg || defaultBgImg;

  return (
    <PrincipleSection 
      id="feel-principle"
      bgImg={bgImg}
      imagePosition="object-[70%_center] md:object-[75%_center] lg:object-[80%_center]"
      eyebrow={eyebrow}
      headlineWhite={headlineWhite}
      headlineGold={headlineGold}
      headlineGoldItalic={true}
      paragraphs={paragraphs}
      buttonText={buttonText}
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
