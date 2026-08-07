import PrincipleSection from './PrincipleSection';
import bgImg from '../../assets/Page5/ChatGPT Image Jul 24, 2026, 03_00_05 PM.png';
import { Sparkle, GitFork, Spiral, Target, SlidersHorizontal, ArrowRight } from '@phosphor-icons/react';

export default function DecidePrinciple() {
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
      eyebrow="MY PHILOSOPHY"
      headlineWhite="DECIDE"
      headlineGold="INTENTIONALLY."
      headlineGoldItalic={false}
      paragraphs={[
        "Clarity without decision is just <br className='hidden lg:block' /> an expensive loop.",
        "We help you align your values, <br className='hidden lg:block' /> weigh what matters, and choose <br className='hidden lg:block' /> the path you're willing to walk.",
        "<span class='text-accent-gold'>Then we help you walk it.</span>"
      ]}
      buttonText=""
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
