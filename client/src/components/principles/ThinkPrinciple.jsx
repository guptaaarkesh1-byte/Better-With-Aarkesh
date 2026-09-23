import { useState, useEffect } from 'react';
import PrincipleSection from './PrincipleSection';
import defaultBgImg from '../../assets/Page3/ChatGPT Image Jul 24, 2026, 02_21_12 PM.webp';
import { Sparkle, SunDim, TextT, Coffee, Circle } from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_THINK_DATA = {
  eyebrow: 'MY PHILOSOPHY',
  title: 'THINK',
  subtitle: 'CLEARLY.',
  highlight: 'Clarity is the bridge between intention and action.',
  description: 'Your mind creates stories. Some empower you, most hold you back. We dismantle unhelpful thinking patterns, dissolve mental clutter, and build sharp, intentional clarity.',
  buttonText: 'SCROLL FOR NEXT PRINCIPLE',
  bgImg: ''
};

export default function ThinkPrinciple() {
  const [data, setData] = useState(DEFAULT_THINK_DATA);

  useEffect(() => {
    fetch(`${API_URL}/api/home-settings/principles`)
      .then(res => res.ok ? res.json() : null)
      .then(d => {
        if (d?.think) setData(prev => ({ ...prev, ...d.think }));
      })
      .catch(() => {});
  }, []);

  const eyebrow = data.eyebrow || 'MY PHILOSOPHY';
  const headlineWhite = data.title || 'THINK';
  const headlineGold = data.subtitle || 'CLEARLY.';
  const paragraphs = [
    `<span class='italic text-lg'>${data?.highlight || 'Clarity is the bridge between intention and action.'}</span>`,
    `<span class='text-white text-lg'>....${data?.description || 'Your mind creates stories. Some empower you, most hold you back. We dismantle unhelpful thinking patterns, dissolve mental clutter, and build sharp, intentional clarity.'}</span>`
  ];
  const buttonText = data?.buttonText || 'SCROLL FOR NEXT PRINCIPLE';
  const bgImg = data?.bgImg || defaultBgImg;

  return (
    <PrincipleSection 
      id="think-principle"
      bgImg={bgImg}
      eyebrow={eyebrow}
      headlineWhite={headlineWhite}
      headlineGold={headlineGold}
      headlineGoldItalic={false}
      paragraphs={paragraphs}
      buttonText={buttonText}
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
