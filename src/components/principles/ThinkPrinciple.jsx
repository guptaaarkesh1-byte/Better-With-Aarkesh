import PrincipleSection from './PrincipleSection';
import bgImg from '../../assets/Page3/ChatGPT Image Jul 24, 2026, 02_21_12 PM.png';
import { Sparkle, SunDim, TextT, Coffee, Circle } from '@phosphor-icons/react';

export default function ThinkPrinciple() {
  return (
    <PrincipleSection 
      id="think-principle"
      bgImg={bgImg}
      eyebrow="MY PHILOSOPHY"
      headlineWhite="THINK"
      headlineGold="CLEARLY."
      headlineGoldItalic={false}
      paragraphs={[
        "<span class='italic text-white text-base'>Slow down the noise. Stop believing every thought you think.</span>",
        "<span class='text-2xl'>....See what truly matters</span>"
      ]}
      buttonText="SCROLL FOR NEXT PRINCIPLE"
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
