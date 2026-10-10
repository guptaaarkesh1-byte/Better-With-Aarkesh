import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

const DEFAULT_SECTIONS = {
  hero: {
    eyebrowText: 'CLARITY. HONESTY. INTENTION.',
    headingLine1: 'Clarity changes',
    headingAccent: 'everything.',
    description: 'A space to think clearly, feel honestly and decide intentionally.',
    ctaText: 'Book a Session',
    ctaLink: '/book',
    secondaryCtaText: '',
    secondaryCtaLink: '',
    bgImageUrl: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791627191/better_with_aarkesh/hero/hero_portrait_aarkesh.png',
    overlayOpacity: 16,
    showScrollIndicator: true,
  },
  problem: {
    eyebrowText: "MAYBE YOU'VE SPENT YEARS",
    headingLine1: "Trying to fix what isn't the",
    headingAccent: 'real problem.',
    quoteItalic: 'Things you carry, cloud your perspective.',
    quoteSubtext: '....Until you learn to see clearly',
    eyebrowFontSize: 14,
    headingFontSize: 56,
    descriptionFontSize: 22,
    wordFontSize: 18,
    bgImg: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289678/better_with_aarkesh/client/src/assets/Page2/problem_silhouette_7637.png',
    silhouetteImg: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289678/better_with_aarkesh/client/src/assets/Page2/problem_silhouette_7637.png',
    transEyebrow: "CLARITY ISN'T LUCK.",
    transHeading: "It's a skill. And it",
    transAccent: 'Changes Everything.',
    transBgImg: '',
  },
  principles: {
    think: {
      eyebrow: 'PRINCIPLE 01',
      title: 'THINK',
      subtitle: 'CLEARLY.',
      highlight: 'Clarity is the bridge between intention and action.',
      description: 'Your mind creates stories. Some empower you, most hold you back. We dismantle unhelpful thinking patterns, dissolve mental clutter, and build sharp, intentional clarity.',
      buttonText: 'SCROLL FOR NEXT PRINCIPLE',
      eyebrowFontSize: 14,
      headingFontSize: 64,
      descriptionFontSize: 18,
      buttonFontSize: 14,
      bgImg: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289681/better_with_aarkesh/client/src/assets/Page3/think-clearly_9629.png',
    },
    feel: {
      eyebrow: 'PRINCIPLE 02',
      title: 'Feel honestly.',
      subtitle: 'Heal deeply.',
      highlight: 'What you resist persists.\nWhat you feel fully dissolves.',
      description: 'Emotions are signals, not dictators. Learn to sit with discomfort, process anxiety, and convert emotional turbulence into fuel for conscious growth.',
      buttonText: '',
      eyebrowFontSize: 14,
      headingFontSize: 64,
      descriptionFontSize: 18,
      buttonFontSize: 14,
      bgImg: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289687/better_with_aarkesh/client/src/assets/Page4/feel-honestly_6665.jpg',
    },
    decide: {
      eyebrow: 'PRINCIPLE 03',
      title: 'DECIDE',
      subtitle: 'INTENTIONALLY.',
      highlight: 'True confidence is born from aligned decision making.',
      description: "Indecision is also a decision. Stop second guessing. We create personalized frameworks that give you the courage and conviction to execute fearlessly.",
      closingLine: '....Then we help you walk it.',
      buttonText: '',
      eyebrowFontSize: 14,
      headingFontSize: 64,
      descriptionFontSize: 18,
      buttonFontSize: 14,
      bgImg: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289692/better_with_aarkesh/client/src/assets/Page5/decide-intentionally_1185.png',
    }
  },
  coachingProcess: {
    eyebrowText: 'THE COACHING PROCESS',
    headingLine1: 'A proven process',
    headingAccent: 'built around you.',
    subtitle: 'A clear path from where you are, to where you want to be.',
    subnote: 'Simple. Effective.',
    bgImg: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289659/better_with_aarkesh/client/src/assets/coaching-process_8570.png',
    steps: [
      { num: '01', title: 'CONNECT', text: 'We start with a meaningful conversation to understand what matters to you.' },
      { num: '02', title: 'CLARIFY', text: "We dig deep to bring clarity to your thoughts, patterns, and what's keeping you stuck." },
      { num: '03', title: 'ALIGN', text: 'We align your values, goals, and actions with the life you truly want to create.' },
      { num: '04', title: 'ACT', text: "You take intentional action with confidence. I'm here to guide, challenge, and support you." },
      { num: '05', title: 'EVOLVE', text: 'We reflect, recalibrate, and keep building momentum for lasting transformation.' }
    ]
  },
  coachingJourney: {
    eyebrowText: 'THE COACHING JOURNEY',
    headingLine1: 'A clear process.',
    headingAccent: 'Real transformation.',
    description: "We don't do hacks. We follow a proven, human first process designed to create deep, lasting change.",
    quoteLine1: "Transformation isn't a moment.",
    quoteAccent: "It's a journey you walk with the right guide.",
    bgImg: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289703/better_with_aarkesh/client/src/assets/Page7/coaching-journey_2939.webp',
    steps: [
      { num: '01', title: 'CLARIFY', text: "Root cause clarity.\nReal understanding." },
      { num: '02', title: 'CONNECT', text: "Emotional honesty.\nValues alignment." },
      { num: '03', title: 'CREATE', text: "Aligned decisions.\nIntentional life." },
      { num: '04', title: 'COMMIT', text: "Sustained action.\nLasting change." }
    ],
    howItWorks: [
      'Personalized coaching sessions tailored to you.',
      'Powerful conversations that create real shifts.',
      'Practical tools and frameworks you can use.',
      'Accountability that keeps you moving forward.'
    ],
    transitionAccent: 'Guided. Structured. Flexible.',
    transitionSubtext: 'A process that adapts to you so you can create a life that lasts.'
  },
  about: {
    eyebrowText: 'MEET AARKESH',
    headingLine: 'Three roles. One purpose.',
    subheading: 'Different lenses. Same mission your growth.',
    rolePilot: {
      title: 'PILOT',
      sub1: 'Years in the cockpit.',
      sub2: 'High stakes. Clear decisions.',
      highlight: 'I know what pressure feels like.',
      bgImg: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289785/better_with_aarkesh/server/uploads/pilot_4154.webp',
    },
    roleCoach: {
      title: 'COACH',
      sub1: 'ICF certified life coach.',
      sub2: 'Evidence based. Human first.',
      highlight: 'I walk beside you, not ahead of you.',
      bgImg: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289705/better_with_aarkesh/client/src/assets/Page8/Coach_4913.webp',
    },
    roleHuman: {
      title: 'HUMAN',
      sub1: 'Flaws. Lessons. Growth.',
      sub2: 'Still figuring things out.',
      highlight: 'Just like you.',
      bgImg: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289707/better_with_aarkesh/client/src/assets/Page8/human_6915.webp',
    },
    missionEyebrow: 'BEYOND THE ROLES',
    missionHeading: 'The journey that shaped the mission.',
    missionDescription: "From the skies to the soul, here's the story behind why I do what I do.",
    storyBtnText: 'READ MY STORY',
    storyBtnLink: '/about-us'
  },
  testimonials: {
    eyebrowText: 'REAL STORIES. REAL CHANGE.',
    headingLine1: 'Their words.',
    headingAccent: 'Their transformation.',
    description: 'What happens when you decide to do the work.',
    bgImg: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289715/better_with_aarkesh/client/src/assets/Page9/testimonials-doorway_4204.webp',
    items: [
      {
        quote: "Aarkesh helped me see the patterns I was too close to notice. For the first time, I feel in control of my choices.",
        name: "Rohit, 32",
        role: "Entrepreneur"
      },
      {
        quote: "I came in feeling lost and overwhelmed. Now I have clarity, confidence, and a life that actually feels like mine.",
        name: "Megha, 28",
        role: "Marketing Manager"
      },
      {
        quote: "Practical. Honest. No fluff. The sessions challenge you—in the best way possible. Highly recommend.",
        name: "Vikram, 35",
        role: "Senior Pilot"
      },
      {
        quote: "I used to overthink everything. Aarkesh helped me quiet the noise and focus on what truly matters.",
        name: "Ananya, 30",
        role: "Product Designer"
      },
      {
        quote: "The accountability and structure I got changed the game for me. I follow through now. In life and at work.",
        name: "Kunal, 29",
        role: "Software Engineer"
      },
      {
        quote: "He doesn't just listen, he understands. And somehow, he knows exactly what you need to hear.",
        name: "Pooja, 33",
        role: "HR Leader"
      }
    ]
  },
  faq: {
    badgeText: 'Frequently Asked Questions',
    headingLine1: 'Clarity before you begin.',
    headingAccent: 'Everything you need to know.',
    items: [
      {
        question: 'How does 1-on-1 coaching with Aarkesh work?',
        answer: 'Each session is a completely personalized, confidential conversation. Together, we identify subconscious blind spots, dissolve reactive emotional triggers, and create practical, actionable frameworks tailored to your unique challenges in career, relationships, and inner sovereignty.'
      },
      {
        question: 'What is the difference between life coaching and therapy?',
        answer: 'While therapy generally focuses on resolving past trauma and emotional healing, life coaching with Aarkesh is forward-focused and action-driven. We concentrate on where you are right now and build the emotional mastery, presence, and decision-making clarity needed to shape your future.'
      },
      {
        question: 'How do I choose between a 60-minute and 90-minute session?',
        answer: 'A 60-minute session is ideal for focused problem-solving, navigating a specific decision, or continuous monthly momentum. A 90-minute session is recommended for your first deep dive, allowing ample space to thoroughly map your core patterns and develop a complete transformation roadmap.'
      },
      {
        question: 'Are all our conversations confidential?',
        answer: 'Yes, 100%. Every conversation, reflection, and personal detail you share is held in absolute privacy and confidence. This is your safe, judgment-free space to speak openly and authentically.'
      },
      {
        question: 'What happens after I book my session?',
        answer: 'You will receive an instant confirmation email with your calendar invite, a secure Google Meet/video link, and a brief reflection questionnaire to help you prepare your intentions before our conversation.'
      },
      {
        question: 'Can I reschedule if my schedule changes?',
        answer: 'Absolutely. You can reschedule your session anytime up to 12 hours before the appointment using the simple reschedule link in your email or through your My Journey dashboard.'
      }
    ]
  },
  cta: {
    eyebrowText: 'A CONVERSATION CAN CHANGE EVERYTHING',
    headingLine1: 'Your next chapter',
    headingAccent: 'starts here.',
    description: "This is your space to be heard, understood,\nand guided forward.\nLet's create real change together.",
    ctaText: 'BOOK YOUR SESSION',
    ctaLink: '/book',
    confidentialText: '100% Confidential & Safe Space',
    bgImg: '',
    quoteLine1: "You don't have to have it all figured out.",
    quoteLine2: "You just have to be willing to begin."
  }
};

// @desc    Get All Home Sections
// @route   GET /api/home-settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'home_all_sections_settings' });
    if (!doc) {
      return res.json(DEFAULT_SECTIONS);
    }
    // Deep merge defaults with stored data
    const result = {
      hero: { ...DEFAULT_SECTIONS.hero, ...(doc.value?.hero || {}) },
      problem: { ...DEFAULT_SECTIONS.problem, ...(doc.value?.problem || {}) },
      principles: { ...DEFAULT_SECTIONS.principles, ...(doc.value?.principles || {}) },
      coachingProcess: { ...DEFAULT_SECTIONS.coachingProcess, ...(doc.value?.coachingProcess || {}) },
      coachingJourney: { ...DEFAULT_SECTIONS.coachingJourney, ...(doc.value?.coachingJourney || {}) },
      about: { ...DEFAULT_SECTIONS.about, ...(doc.value?.about || {}) },
      testimonials: { ...DEFAULT_SECTIONS.testimonials, ...(doc.value?.testimonials || {}) },
      faq: { ...DEFAULT_SECTIONS.faq, ...(doc.value?.faq || {}) },
      cta: { ...DEFAULT_SECTIONS.cta, ...(doc.value?.cta || {}) },
    };
    res.json(result);
  } catch (err) {
    console.error('Error fetching home settings:', err);
    res.status(500).json({ message: 'Failed to fetch home settings' });
  }
});

// @desc    Get Specific Section Settings
// @route   GET /api/home-settings/:section
// @access  Public
router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const defaultSectionData = DEFAULT_SECTIONS[section] || {};
    const doc = await Settings.findOne({ key: 'home_all_sections_settings' });
    
    if (!doc || !doc.value || !doc.value[section]) {
      return res.json(defaultSectionData);
    }
    
    res.json({ ...defaultSectionData, ...doc.value[section] });
  } catch (err) {
    console.error(`Error fetching section ${req.params.section}:`, err);
    res.status(500).json({ message: 'Failed to fetch section settings' });
  }
});

// @desc    Update All Home Sections (Atomic unified batch update)
// @route   PUT /api/home-settings
// @access  Admin
router.put('/', async (req, res) => {
  try {
    const allSectionsData = req.body;
    let doc = await Settings.findOne({ key: 'home_all_sections_settings' });
    let merged = doc && doc.value ? JSON.parse(JSON.stringify(doc.value)) : { ...DEFAULT_SECTIONS };

    for (const [secKey, secVal] of Object.entries(allSectionsData)) {
      if (secVal && typeof secVal === 'object') {
        if (secKey === 'principles') {
          merged.principles = {
            ...(DEFAULT_SECTIONS.principles || {}),
            ...(merged.principles || {}),
            ...secVal,
            think: { ...(DEFAULT_SECTIONS.principles?.think || {}), ...(merged.principles?.think || {}), ...(secVal.think || {}) },
            feel: { ...(DEFAULT_SECTIONS.principles?.feel || {}), ...(merged.principles?.feel || {}), ...(secVal.feel || {}) },
            decide: { ...(DEFAULT_SECTIONS.principles?.decide || {}), ...(merged.principles?.decide || {}), ...(secVal.decide || {}) },
          };
        } else {
          merged[secKey] = {
            ...(DEFAULT_SECTIONS[secKey] || {}),
            ...(merged[secKey] || {}),
            ...secVal
          };
        }
      }
    }

    const updated = await Settings.findOneAndUpdate(
      { key: 'home_all_sections_settings' },
      { $set: { value: merged } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'All home sections updated successfully', data: updated.value });
  } catch (err) {
    console.error('Error updating all home settings:', err);
    res.status(500).json({ message: 'Failed to update all home settings' });
  }
});

// @desc    Update Specific Section Settings
// @route   PUT /api/home-settings/:section
// @access  Admin
router.put('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const sectionData = req.body;

    let doc = await Settings.findOne({ key: 'home_all_sections_settings' });
    const currentSection = (doc && doc.value && doc.value[section]) || DEFAULT_SECTIONS[section] || {};

    let mergedSection;
    if (section === 'principles' && sectionData) {
      mergedSection = {
        ...(DEFAULT_SECTIONS.principles || {}),
        ...currentSection,
        ...sectionData,
        think: { ...(DEFAULT_SECTIONS.principles?.think || {}), ...(currentSection.think || {}), ...(sectionData.think || {}) },
        feel: { ...(DEFAULT_SECTIONS.principles?.feel || {}), ...(currentSection.feel || {}), ...(sectionData.feel || {}) },
        decide: { ...(DEFAULT_SECTIONS.principles?.decide || {}), ...(currentSection.decide || {}), ...(sectionData.decide || {}) },
      };
    } else {
      mergedSection = {
        ...(DEFAULT_SECTIONS[section] || {}),
        ...currentSection,
        ...sectionData
      };
    }

    const updated = await Settings.findOneAndUpdate(
      { key: 'home_all_sections_settings' },
      { $set: { [`value.${section}`]: mergedSection } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: `${section} updated successfully`, data: updated.value?.[section] || mergedSection });
  } catch (err) {
    console.error(`Error updating section ${req.params.section}:`, err);
    res.status(500).json({ message: 'Failed to update section settings' });
  }
});

export default router;
