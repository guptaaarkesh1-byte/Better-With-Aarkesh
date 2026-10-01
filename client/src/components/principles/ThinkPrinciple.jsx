import { usePrinciplesData } from '../../hooks/usePrinciplesData';
import PrincipleSection from './PrincipleSection';
import defaultBgImg from '../../assets/Page3/think-clearly.png';
import { Sparkle, SunDim, TextT, Coffee, Circle } from '@phosphor-icons/react';

const DEFAULT_THINK_DATA = {
  eyebrow: 'PRINCIPLE 01',
  title: 'THINK',
  subtitle: 'CLEARLY.',
  highlight: 'Clarity is the bridge between intention and action.',
  description: 'Your mind creates stories. Some empower you, most hold you back. We dismantle unhelpful thinking patterns, dissolve mental clutter, and build sharp, intentional clarity.',
  buttonText: 'SCROLL FOR NEXT PRINCIPLE',
  bgImg: ''
};

export default function ThinkPrinciple() {
  const customData = usePrinciplesData('think');
  const data = { ...DEFAULT_THINK_DATA, ...customData };

  const eyebrow = data.eyebrow || 'PRINCIPLE 01';
  const headlineWhite = data.title || 'THINK';
  const headlineGold = data.subtitle || 'CLEARLY.';
  const rawHighlight = data?.highlight || 'Clarity is the bridge between intention and action.';
  const formattedHighlight = rawHighlight.includes('\n')
    ? rawHighlight.replace(/\n/g, '<br />')
    : rawHighlight;

  const rawDescription = data?.description || 'Your mind creates stories. Some empower you, most hold you back. We dismantle unhelpful thinking patterns, dissolve mental clutter, and build sharp, intentional clarity.';
  const formattedDescription = rawDescription.includes('\n')
    ? rawDescription.replace(/\n/g, '<br />')
    : rawDescription;
  const descText = formattedDescription.startsWith('....') ? formattedDescription : '....' + formattedDescription;

  const paragraphs = [
    `<span class='italic font-serif text-xl lg:text-2xl leading-relaxed text-[#111010] block hyphens-none' style='font-family: Fraunces, Georgia, serif;'>${formattedHighlight}</span>`,
    `<span class='font-serif text-base lg:text-lg font-normal not-italic leading-relaxed text-[#4a463e] block hyphens-none' style='font-family: Fraunces, Georgia, serif; font-style: normal;'>${descText}</span>`
  ];
  const buttonText = data?.buttonText || 'SCROLL FOR NEXT PRINCIPLE';
  const bgImg = data?.bgImg || defaultBgImg;

  return (
    <PrincipleSection 
      id="think-principle"
      bgImg={bgImg}
      imagePosition="object-[70%_center] md:object-[74%_center] lg:object-[78%_center]"
      eyebrow={eyebrow}
      headlineWhite={headlineWhite}
      headlineGold={headlineGold}
      headlineGoldItalic={false}
      paragraphs={paragraphs}
      buttonText={buttonText}
      maxContentWidth="max-w-[365px]"
      activeStep={1}
      bannerTitle="DYNAMIC<br/>ELEMENT"
      bannerIcon={Sparkle}
      bannerSteps={[
        { icon: SunDim, text: "As you land on this section, the sunlight subtly brightens and dust particles move in the light." },
        { icon: TextT, text: "The headline fades in from the left with a gentle slide, one word at a time.", iconWeight: "bold" },
        { icon: Coffee, text: "The notebook page flutters slightly as if a breeze just passed." },
        { icon: Circle, text: 'The progress indicator on the right highlights "THINK" and the others remain dim.', iconWeight: "bold" }
      ]}
      transitionText="As you scroll down, the scene slowly darkens, the text fades out, and we move into the next principle."
    />
  );
}
