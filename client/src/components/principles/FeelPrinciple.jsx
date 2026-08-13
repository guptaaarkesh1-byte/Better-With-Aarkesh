import PrincipleSection from './PrincipleSection';
import bgImg from '../../assets/Page4/ChatGPT Image Jul 24, 2026, 02_41_22 PM.png';
import { Sparkle, CloudRain, Waves, Heart, SunDim } from '@phosphor-icons/react';

export default function FeelPrinciple() {
  return (
    <PrincipleSection 
      id="feel-principle"
      bgImg={bgImg}
      eyebrow="MY PHILOSOPHY"
      headlineWhite="Feel honestly."
      headlineGold="Heal deeply."
      headlineGoldItalic={true}
      paragraphs={[
        "<span class='italic text-lg'>You can't move forward, running from what you feel.</span>",
        "<span class='text-white text-lg'>....We create the safe space to feel it all - without judgement</span>"
      ]}
      buttonText=""
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
