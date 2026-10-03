import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import PolicyModal from '../../components/ui/PolicyModal';
import { 
  Play, 
  CheckCircle, 
  LockKey, 
  CaretDown, 
  Clock, 
  X, 
  User, 
  Eye, 
  EyeSlash, 
  SignOut, 
  ArrowLeft, 
  ArrowRight, 
  Envelope, 
  Phone, 
  CaretLeft, 
  Sparkle,
  BookOpen,
  Users,
  Infinity,
  UsersThree,
  ShieldCheck,
  Lightning,
  PencilSimple,
  Info,
  FileText,
  ChatCenteredDots,
  Brain,
  Star,
  InstagramLogo,
  LinkedinLogo,
  XLogo,
  YoutubeLogo,
  FacebookLogo,
  SpotifyLogo,
  DiscordLogo,
  TiktokLogo,
  Globe,
  Quotes
} from '@phosphor-icons/react';
import Button from '../../components/ui/Button';
import LessonComments from '../../components/course/LessonComments';
import ProtectedYouTubePlayer from '../../components/course/ProtectedYouTubePlayer';
import CoursePaymentSuccess from './CoursePaymentSuccess';
import FlippingWordSwap from '../../components/ui/FlippingWordSwap';
import { resolvePlayableVideoId } from '../../utils/videoSecurity';
import './course-landing.css';

const renderSocialIcon = (platform, size = 16) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return <InstagramLogo size={size} />;
    case 'youtube': return <YoutubeLogo size={size} />;
    case 'x': case 'twitter': return <XLogo size={size} />;
    case 'linkedin': return <LinkedinLogo size={size} />;
    case 'facebook': return <FacebookLogo size={size} />;
    case 'spotify': return <SpotifyLogo size={size} />;
    case 'discord': return <DiscordLogo size={size} />;
    case 'tiktok': return <TiktokLogo size={size} />;
    default: return <Globe size={size} />;
  }
};

const extractYoutubeVideoId = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

// Dummy course data
const MODULES = [
  {
    id: 1,
    title: 'Module 1: The Foundation of Presence',
    duration: '45 mins',
    progress: 100,
    lessons: [
      { id: 101, title: 'Introduction to Inner Stillness', duration: '12:30', isCompleted: true, isLocked: false },
      { id: 102, title: 'Breaking the Reactive Cycle', duration: '18:15', isCompleted: true, isLocked: false },
      { id: 103, title: 'Guided Grounding Meditation', duration: '15:00', isCompleted: false, isLocked: false },
    ]
  },
  {
    id: 2,
    title: 'Module 2: Mastering Conversations',
    duration: '1h 15m',
    progress: 0,
    lessons: [
      { id: 201, title: 'The Art of Active Listening', duration: '22:10', isCompleted: false, isLocked: true },
      { id: 202, title: 'Reading Non-Verbal Cues', duration: '28:45', isCompleted: false, isLocked: true },
      { id: 203, title: 'Expressing Authentic Boundaries', duration: '24:20', isCompleted: false, isLocked: true },
    ]
  },
  {
    id: 3,
    title: 'Module 3: Leadership & Magnetism',
    duration: '1h 30m',
    progress: 0,
    lessons: [
      { id: 301, title: 'Cultivating Charisma', duration: '30:00', isCompleted: false, isLocked: true },
      { id: 302, title: 'Leading with Vulnerability', duration: '25:15', isCompleted: false, isLocked: true },
      { id: 303, title: 'The Ripple Effect', duration: '35:45', isCompleted: false, isLocked: true },
    ]
  }
];

export default function Course() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const location = useLocation();
  const isAllCoursesPage = slug === 'all' || location.pathname === '/courses' || location.pathname === '/courses/all';
  const isDetailPage = Boolean(slug) && slug !== 'all';

  const getCardThemeClass = (index) => {
    const mod = index % 3;
    if (mod === 0) return 'card-theme-black';
    if (mod === 1) return 'card-theme-purple';
    return 'card-theme-white';
  };
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(() => {
    const isPurchasedStored = localStorage.getItem('isCoursePurchased') === 'true';
    const hasToken = !!localStorage.getItem('courseToken');
    const params = new URLSearchParams(window.location.search);
    const isCheckout = params.get('checkout') === 'true' || sessionStorage.getItem('course_checkout_active') === 'true';
    const isLearn = params.get('learn') === 'true';
    return isLearn && hasToken && isPurchasedStored && !isCheckout;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('courseToken'));
  const [isPurchased, setIsPurchased] = useState(() => localStorage.getItem('isCoursePurchased') === 'true');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCheckout, setShowCheckout] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const hasToken = !!localStorage.getItem('courseToken');
    const isPurchasedStored = localStorage.getItem('isCoursePurchased') === 'true';
    const isCheckoutStored = sessionStorage.getItem('course_checkout_active') === 'true';
    return (params.get('checkout') === 'true' || isCheckoutStored) && hasToken && !isPurchasedStored;
  });
  const [checkoutAgreed, setCheckoutAgreed] = useState(false);
  const [showPreRegSuccessModal, setShowPreRegSuccessModal] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const profileMenuRef = useRef(null);
  const leftColumnRef = useRef(null);

  // Auth Modal State
  const [showCourseLogin, setShowCourseLogin] = useState(false);
  const [loginMode, setLoginMode] = useState('login');

  // Auth Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP & Forgot Password State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isForgotOtpStep, setIsForgotOtpStep] = useState(false);

  const otpRef0 = useRef(null);
  const otpRef1 = useRef(null);
  const otpRef2 = useRef(null);
  const otpRef3 = useRef(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3];

  const navigate = useNavigate();
  const [curriculumModules, setCurriculumModules] = useState(MODULES);
  const [activeModuleObj, setActiveModuleObj] = useState(MODULES[0]);
  const [activeLesson, setActiveLesson] = useState(MODULES[0]?.lessons?.[0] || null);
  const [activeModule, setActiveModule] = useState(MODULES[0].id);
  const [courseDocuments, setCourseDocuments] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [activePolicySlug, setActivePolicySlug] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState('playlist'); // 'playlist' | 'overview' | 'resources' | 'comments'
  const [landscapeView, setLandscapeView] = useState('list'); // 'list' | 'player'
  const [purchaseSuccessData, setPurchaseSuccessData] = useState(null);
  const [curriculumCards, setCurriculumCards] = useState([
    { title: 'The Foundation of Presence', description: 'Discover how to anchor yourself in any high-pressure situation with calm, unshakeable energy.' },
    { title: 'Breaking Reactive Patterns', description: 'Identify and dissolve the emotional triggers that cause you to react instead of respond.' },
    { title: 'Magnetic Communication', description: 'Develop a voice and language that people naturally lean toward and remember.' },
    { title: 'Non-Verbal Mastery', description: 'Harness the 93% of communication that happens without words — posture, eye contact, space.' },
    { title: 'Leadership from Within', description: 'Stop performing authority and start embodying it — people will follow without being asked.' },
    { title: 'Emotional Sovereignty', description: 'Condition your nervous system to stay laser-focused, composed, and mentally sharp under extreme stress.' },
    { title: 'Executive Gravitas & Charisma', description: 'Command high-stakes rooms and social dynamics with effortless poise, vocal resonance, and respect.' },
    { title: 'The Ripple Effect', description: 'Turn your internal transformation into lasting impact on every relationship and environment.' },
  ]);
  const [courseFaqs, setCourseFaqs] = useState([
    { question: 'How long do I have access to the course materials?', answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.' },
    { question: 'How do the 3 free coaching sessions work?', answer: 'Once enrolled, you can book your private 1-on-1 sessions directly with Aarkesh through your course profile dashboard.' },
    { question: 'What format is the course delivered in?', answer: 'High-definition on-demand video masterclasses with actionable workbooks, downloadable frameworks, and direct 1-on-1 coaching.' },
    { question: 'Is this course beginner-friendly?', answer: 'Absolutely. The framework starts from the fundamental psychology of presence and builds step-by-step toward advanced leadership and magnetism.' },
  ]);

  const allLessons = curriculumModules.flatMap((m) => (m.lessons || []).map((l) => ({ ...l, module: m })));
  const currentLessonIndex = allLessons.findIndex(
    (l) => (l._id || l.id)?.toString() === (activeLesson?._id || activeLesson?.id)?.toString()
  );
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const handleSelectLesson = (lesson, module) => {
    setActiveLesson(lesson);
    if (module) setActiveModuleObj(module);
    localStorage.setItem('lastActiveCourseLessonId', (lesson._id || lesson.id)?.toString());
  };

  const isComingSoon = Boolean(courseData?.isComingSoon);
  const basePrice = courseData?.price !== undefined && courseData?.price !== null ? Number(courseData.price) : 15000;
  const comparePrice = courseData?.comparePrice !== undefined && courseData?.comparePrice !== null ? Number(courseData.comparePrice) : 25000;
  const gstRate = courseData?.gstRate !== undefined && courseData?.gstRate !== null ? Number(courseData.gstRate) : 18;
  const isGstIncluded = Boolean(courseData?.isGstIncluded);

  useEffect(() => {
    const isLearn = searchParams.get('learn') === 'true';
    if (isLearn && isLoggedIn && isPurchased) {
      setShowDashboard(true);
    } else if (!isLearn) {
      setShowDashboard(false);
    }
  }, [searchParams, isLoggedIn, isPurchased]);

  useEffect(() => {
    setShowCourseLogin(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchPublishedCurriculum = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('courseToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${apiUrl}/api/courses/primary/curriculum`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.course) {
            setCourseData(data.course);
          }
          if (data && data.modules && data.modules.length > 0) {
            setCurriculumModules(data.modules);

            const savedLessonId = localStorage.getItem('lastActiveCourseLessonId');
            let matchedLesson = null;
            let matchedModule = null;

            if (savedLessonId) {
              for (const mod of data.modules) {
                const found = (mod.lessons || []).find(
                  (l) => (l._id || l.id)?.toString() === savedLessonId.toString()
                );
                if (found) {
                  matchedLesson = found;
                  matchedModule = mod;
                  break;
                }
              }
            }

            if (matchedLesson && matchedModule) {
              setActiveModuleObj(matchedModule);
              setActiveLesson(matchedLesson);
            } else {
              setActiveModuleObj(data.modules[0]);
              if (data.modules[0].lessons && data.modules[0].lessons.length > 0) {
                setActiveLesson(data.modules[0].lessons[0]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic curriculum:', err);
      }
    };

    fetchPublishedCurriculum();
    window.addEventListener('focus', fetchPublishedCurriculum);
    const interval = setInterval(fetchPublishedCurriculum, 4000);

    return () => {
      window.removeEventListener('focus', fetchPublishedCurriculum);
      clearInterval(interval);
    };
  }, [isPurchased]);

  // Reset left column scroll to top whenever active lesson changes
  useEffect(() => {
    if (leftColumnRef.current) {
      leftColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeLesson?._id, activeLesson?.id]);

  useEffect(() => {
    const fetchCourseFooter = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/footer-documents/published?category=course`);
        if (res.ok) {
          const data = await res.json();
          setCourseDocuments(data);
        }
      } catch (err) {
        console.error('Failed to fetch course footer documents:', err);
      }
    };

    const fetchSocialLinks = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/social-links`);
        if (res.ok) {
          const data = await res.json();
          setSocialLinks(data);
        }
      } catch (err) {
        console.error('Failed to fetch social links:', err);
      }
    };

    const fetchCurriculumCards = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/courses/cards/public`);
        if (res.ok) {
          const cardsData = await res.json();
          if (Array.isArray(cardsData) && cardsData.length > 0) {
            setCurriculumCards(cardsData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch curriculum cards:', err);
      }
    };

    const fetchCourseFaqs = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/courses/faqs/public`);
        if (res.ok) {
          const faqsData = await res.json();
          if (Array.isArray(faqsData) && faqsData.length > 0) {
            setCourseFaqs(faqsData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch course FAQs:', err);
      }
    };

    fetchCourseFooter();
    fetchSocialLinks();
    fetchCurriculumCards();
    fetchCourseFaqs();
  }, []);



  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [activeToc, setActiveToc] = useState('p1');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  const [isGstApplied, setIsGstApplied] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const coursesList = useMemo(() => [
    {
      slug: "better-man",
      n: "01",
      chips: ["Calm Authority", "Self-Command"],
      soon: false,
      cls: "v3",
      title: "The Better Man",
      lede: "Master the psychology of calm authority, magnetic communication and effortless self-command.",
      d: "Calm authority, magnetic communication and self-command, taught in eight modules with three private sessions.",
      sidebarChips: [
        ["Schedule", "Self-Paced"],
        ["Certificate", "Yes"],
        ["Language", "Hinglish / English"],
        ["Mentorship", "1-on-1 Live"]
      ],
      hl: [
        ["Build Real Presence", "(Not Just Theory)"],
        ["3 Private Sessions", "with Aarkesh"]
      ],
      inside: [
        "8 HD video modules & frameworks",
        "Downloadable workbooks and mental models",
        "3 private 1-on-1 coaching sessions with Aarkesh",
        "Lifetime access with all future updates"
      ],
      facts: [["8", "Modules"], ["3 Free", "1-on-1 Sessions"]],
      price: `₹${basePrice.toLocaleString('en-IN')}`,
      was: `₹${comparePrice.toLocaleString('en-IN')}`,
      cta: "Check Course",
      syllabusTitle: "Eight Modules To Total Self-Command",
      syllabusSubtitle: "A comprehensive, step-by-step roadmap from baseline nervousness to unshakeable gravitas.",
      syllabus: [
        { n: '01', t: 'The Foundation of Presence', d: 'Grounding techniques, diaphragmatic breathing under tension, and mastering the crucial first 10 seconds in any room.' },
        { n: '02', t: 'Breaking the Reactive Cycle', d: 'Identifying personal emotional triggers, pausing between impulse and response, and eliminating defensive habits.' },
        { n: '03', t: 'Mastering Vocal Gravitas & Tone', d: 'Lowering resonance, eliminating filler words, pacing your delivery, and speaking with magnetic, effortless weight.' },
        { n: '04', t: 'Non-Verbal Dominance & Spatial Calibration', d: 'Unwavering eye contact, open posture mechanics, micro-expression control, and physical composure.' },
        { n: '05', t: 'High-Stakes Conversations & Holding Frame', d: 'Navigating demanding bosses, aggressive negotiations, or emotionally volatile conversations without yielding.' },
        { n: '06', t: 'Decision Making & Decisive Action', d: 'Eliminating second-guessing, owning difficult outcomes, and leading team members or family with unhesitating clarity.' },
        { n: '07', t: 'Conflict Resolution Without Compromise', d: 'De-escalating heated confrontation while maintaining firm boundaries and achieving win-win outcomes.' },
        { n: '08', t: 'Integration & Lifetime Standard', d: 'Building your daily self-command rituals, maintaining high standards, and solidifying permanent personal gravitas.' }
      ],
      writeup: {
        chip: "CORE METHODOLOGY",
        h1: "Most Men Were Never Taught How to Hold Ground",
        lede: "True charisma is not loud. It is the unhurried certainty of a man who does not need permission to take up space.",
        p1: "When pressure spikes in a meeting, negotiation, or relationship, the natural reflex is either to collapse inward or become combative. Both signal the same underlying weakness: emotional reactivity.",
        quote: "A room doesn't respond to volume. It responds to certainty.",
        p2: "Through 8 structured modules, you dismantle the nervous system habits that cause rushing, stammering, and over-explaining. You learn how to anchor your physical presence, speak with calm resonance, and command respectful silence before uttering a single sentence.",
        distinction: "Reactive men seek approval through fast speech and validation. Anchored men lead through stillness, calibrated pauses, and clear boundaries."
      }
    },
    {
      slug: "difficult-people",
      n: "02",
      chips: ["Boundaries", "Conflict"],
      soon: true,
      cls: "v2",
      title: "Difficult People",
      lede: "Stay steady with the boss, partner or parent who pushes every button you have.",
      d: "Stay steady with the boss, partner or parent who pushes every button you have.",
      sidebarChips: [
        ["Schedule", "Self-Paced"],
        ["Certificate", "Yes"],
        ["Language", "Hinglish / English"],
        ["Access", "Lifetime"]
      ],
      hl: [
        ["Hold Your Ground", "(Without a Fight)"],
        ["2 Private Sessions", "with Aarkesh"]
      ],
      inside: [
        "6 HD video modules",
        "Downloadable conflict frameworks",
        "2 private 1-on-1 coaching sessions",
        "Lifetime access",
        "Early-access price for waitlist members"
      ],
      facts: [["6", "Modules"], ["3 Free", "1-on-1 Sessions"]],
      price: "₹3,999",
      was: "₹7,999",
      cta: "Check Course",
      syllabusTitle: "Six Modules To Emotional Sovereignty",
      syllabusSubtitle: "The practical psychological playbook to disarm manipulation, establish firm boundaries, and protect your inner peace.",
      syllabus: [
        { n: '01', t: 'Mapping Toxic Patterns & Triggers', d: 'Recognizing manipulative archetypes, passive-aggressive traps, and subtle emotional manipulation tactics before they drain you.' },
        { n: '02', t: 'The Unshakeable Boundary Framework', d: 'Setting clear, non-negotiable boundaries with bosses, partners, or parents without anger, defensiveness, or guilt.' },
        { n: '03', t: 'Disarming High-Conflict Personalities', d: 'Verbal de-escalation strategies, avoiding defensive traps, and maintaining quiet emotional detachment in heated moments.' },
        { n: '04', t: 'Holding Ground in High-Stakes Confrontations', d: 'Staying centered during intense arguments, asserting your authority, and never breaking composure under pressure.' },
        { n: '05', t: 'Navigating Difficult Workplace Dynamics', d: 'Managing micro-managers, corporate politics, and aggressive colleagues while protecting your professional standing.' },
        { n: '06', t: 'Reclaiming Your Mental Sovereignty', d: 'Overcoming post-conflict rumination, establishing internal calm, and permanent emotional freedom from difficult dynamics.' }
      ],
      writeup: {
        chip: "CONFLICT FRAMEWORK",
        h1: "Stop Absorbing Other People's Emotional Chaos",
        lede: "High-conflict personalities don't look for resolution—they look for reaction. The moment you react, you lose ground.",
        p1: "Whether it's a demanding boss, a passive-aggressive colleague, or a volatile family member, their emotional turbulence is designed to pull you off-center and put you on the defensive.",
        quote: "You don't defeat difficult people by fighting back. You defeat them by becoming impossible to trigger.",
        p2: "In this 6-module masterclass, you get the exact psychological tools to stay completely unshakeable. You will learn how to set ironclad boundaries, disarm manipulative tactics in real-time, and hold your frame without shouting or apologizing.",
        distinction: "Weak responses either explode with anger or shrink with compliance. Strategic self-command stays neutral, unbothered, and in total control."
      }
    },
    {
      slug: "decisions",
      n: "03",
      chips: ["Clarity", "Choice"],
      soon: true,
      cls: "",
      title: "Decisions",
      lede: "A clear method for the choices you keep putting off, and for living with them once made.",
      d: "A clear method for the choices you keep putting off, and for living with them once made.",
      sidebarChips: [
        ["Schedule", "Self-Paced"],
        ["Certificate", "Yes"],
        ["Language", "Hinglish / English"],
        ["Access", "Lifetime"]
      ],
      hl: [
        ["Decide With Clarity", "(Not Certainty)"],
        ["2 Private Sessions", "with Aarkesh"]
      ],
      inside: [
        "5 HD video modules",
        "Downloadable decision matrix workbooks",
        "2 private 1-on-1 coaching sessions",
        "Lifetime access",
        "Early-access price for waitlist members"
      ],
      facts: [["5", "Modules"], ["3 Free", "1-on-1 Sessions"]],
      price: "₹3,499",
      was: "₹6,999",
      cta: "Check Course",
      syllabusTitle: "Five Modules To High-Conviction Clarity",
      syllabusSubtitle: "A proven framework to overcome analysis paralysis, evaluate high-stakes tradeoffs, and execute decisions without second-guessing.",
      syllabus: [
        { n: '01', t: 'Deconstructing Analysis Paralysis', d: 'Understanding why smart people delay critical choices, the psychology of overthinking, and how fear masks itself as research.' },
        { n: '02', t: 'The 4-Step Clarity Architecture', d: 'A structured cognitive framework to filter out background noise, rank core priorities, and pinpoint optimal paths with speed.' },
        { n: '03', t: 'Risk Calibration & Asymmetric Upside', d: 'Evaluating worst-case scenarios realistically, managing regret risk, and taking calculated, high-reward decisive action.' },
        { n: '04', t: 'Execution & Living With The Choice', d: 'Ending chronic second-guessing, owning outcomes with conviction, and leading teams and family members through ambiguity.' },
        { n: '05', t: 'Building a Decisive Mindset for Life', d: 'Daily decision-making heuristics to eliminate cognitive fatigue and maintain effortless clarity across business and personal life.' }
      ],
      writeup: {
        chip: "DECISION ARCHITECTURE",
        h1: "Analysis Paralysis Is Simply Fear in Disguise",
        lede: "Great leaders do not wait for 100% certainty. They master the art of moving with high conviction through ambiguity.",
        p1: "The agonizing delay on career pivots, relationship choices, or major investments isn't a lack of information—it is fear of regret masquerading as research.",
        quote: "Indecision is the most expensive decision you will ever make.",
        p2: "Through 5 focused modules, you receive a repeatable cognitive architecture to strip away emotion, evaluate asymmetric upside, and make high-stakes choices rapidly—without second-guessing yourself once committed.",
        distinction: "Indecisive minds seek guarantees that never exist. Decisive leaders manage risk, commit with clarity, and create the outcome."
      }
    }
  ], [basePrice, comparePrice]);

  const activeCourse = useMemo(() => {
    if (!slug) return coursesList[0];
    return coursesList.find((c) => c.slug === slug) || coursesList[0];
  }, [coursesList, slug]);

  const activeCourseBasePrice = useMemo(() => {
    if (activeCourse?.slug === 'better-man') return basePrice;
    if (activeCourse?.slug === 'difficult-people') return 3999;
    if (activeCourse?.slug === 'decisions') return 3499;
    return basePrice;
  }, [activeCourse, basePrice]);

  const activeCourseComparePrice = useMemo(() => {
    if (activeCourse?.slug === 'better-man') return comparePrice;
    if (activeCourse?.slug === 'difficult-people') return 7999;
    if (activeCourse?.slug === 'decisions') return 6999;
    return comparePrice;
  }, [activeCourse, comparePrice]);

  const discountAmount = useMemo(() => {
    return appliedCoupon ? Math.round((activeCourseBasePrice * (appliedCoupon.percent || 0)) / 100) : 0;
  }, [appliedCoupon, activeCourseBasePrice]);

  const discountedBasePrice = Math.max(0, activeCourseBasePrice - discountAmount);

  const gstAmount = useMemo(() => {
    return isGstIncluded
      ? Math.round(discountedBasePrice - (discountedBasePrice / (1 + (gstRate / 100))))
      : Math.round((discountedBasePrice * gstRate) / 100);
  }, [discountedBasePrice, isGstIncluded, gstRate]);

  const baseBeforeGst = isGstIncluded ? discountedBasePrice - gstAmount : discountedBasePrice;
  const finalPayable = isGstIncluded ? discountedBasePrice : discountedBasePrice + gstAmount;

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      setCouponMsg({ type: 'error', text: 'Please enter a valid coupon code.' });
      return;
    }
    if (code === 'AARKESH50' || code === 'CLAIM50' || code === 'SHERY50') {
      setAppliedCoupon({ code, percent: 50 });
      setCouponMsg({ type: 'success', text: 'Coupon applied! 50% discount applied successfully.' });
    } else if (code === 'BETTER20') {
      setAppliedCoupon({ code, percent: 20 });
      setCouponMsg({ type: 'success', text: 'Coupon applied! 20% discount applied.' });
    } else if (code === 'WELCOME10') {
      setAppliedCoupon({ code, percent: 10 });
      setCouponMsg({ type: 'success', text: 'Coupon applied! 10% discount applied.' });
    } else {
      setCouponMsg({ type: 'error', text: 'Invalid coupon code. Try AARKESH50 or CLAIM50' });
    }
  };

  const courseThemes = {
    'better-man': {
      accent: '#C878BE',
      accentLight: '#E3B8DE',
      accentGlow: 'rgba(200, 120, 190, 0.22)',
      gradient: 'from-[#A83B96] via-[#C878BE] to-[#7A2A70]',
      buttonBg: 'bg-gradient-to-r from-[#A83B96] via-[#C878BE] to-[#7A2A70]',
      cardBg: 'bg-[#150a18]',
      outerBg: 'bg-[#0e0610]',
      border: 'border-[#C878BE]/30',
      badge: 'Full Masterclass Access',
      tagline: 'Master calm authority, presence & gravitas'
    },
    'difficult-people': {
      accent: '#A855F7',
      accentLight: '#D8B4FE',
      accentGlow: 'rgba(168, 85, 247, 0.22)',
      gradient: 'from-[#9333EA] via-[#A855F7] to-[#7E22CE]',
      buttonBg: 'bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#7E22CE]',
      cardBg: 'bg-[#140b20]',
      outerBg: 'bg-[#0c0614]',
      border: 'border-[#A855F7]/30',
      badge: 'Emotional Sovereignty',
      tagline: 'Disarm manipulation & establish unshakeable boundaries'
    },
    'decisions': {
      accent: '#38BDF8',
      accentLight: '#BAE6FD',
      accentGlow: 'rgba(56, 189, 248, 0.22)',
      gradient: 'from-[#0284C7] via-[#38BDF8] to-[#0369A1]',
      buttonBg: 'bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#0369A1]',
      cardBg: 'bg-[#081528]',
      outerBg: 'bg-[#040D1A]',
      border: 'border-[#38BDF8]/30',
      badge: 'Decision Architecture',
      tagline: 'Overcome overthinking & lead with high conviction'
    }
  };
  const activeTheme = courseThemes[activeCourse?.slug] || courseThemes['better-man'];

  const handleSelectCourse = (c) => {
    navigate(`/course/${c.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (showDashboard) return;
    const ids = ['p1', 'p2', 'p3', 'curriculum', 'faq'];
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveToc(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [showDashboard]);

  // Group published course documents dynamically by columnHeading
  const groupedColumns = React.useMemo(() => {
    const groups = {};
    courseDocuments.forEach((doc) => {
      const heading = (doc.columnHeading || 'LEGAL').trim().toUpperCase();
      if (!groups[heading]) {
        groups[heading] = [];
      }
      groups[heading].push(doc);
    });
    return groups;
  }, [courseDocuments]);

  const handleEnroll = () => {
    if (!isLoggedIn) {
      setLoginMode('register');
      setIsOtpStep(false);
      setIsForgotPassword(false);
      setIsForgotOtpStep(false);
      setError('');
      setShowPricingModal(false);
      setShowCourseLogin(true);
    } else if (isComingSoon) {
      setShowPreRegSuccessModal(true);
    } else {
      setShowPricingModal(true);
    }
  };

  const handlePurchase = () => {
    if (isComingSoon) {
      setShowPricingModal(false);
      setShowPreRegSuccessModal(true);
      return;
    }
    if (!isLoggedIn) {
      setShowPricingModal(false);
      setPendingCheckout(true);
      setShowCourseLogin(true);
    } else {
      setShowCheckout(true);
      setShowPricingModal(false);
      setSearchParams({ checkout: 'true' });
      sessionStorage.setItem('course_checkout_active', 'true');
    }
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
    sessionStorage.removeItem('course_checkout_active');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('checkout');
      return next;
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError('');

    const API_URL = import.meta.env.VITE_API_URL || '';

    const safeJson = async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server returned ${res.status}. Please ensure backend API is running and Razorpay keys are configured.`);
      }
    };

    try {
      const scriptLoaded = await new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded) throw new Error('Razorpay SDK failed to load. Please check your internet connection.');

      const keyRes = await fetch(`${API_URL}/api/payment/public-key`);
      const keyData = await safeJson(keyRes);
      if (!keyRes.ok) throw new Error(keyData.message || 'Payment gateway not configured.');

      const orderRes = await fetch(`${API_URL}/api/payment/course-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          courseSlug: activeCourse?.slug || 'better-man',
          amount: finalPayable
        })
      });
      const orderData = await safeJson(orderRes);
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create payment order');

      const options = {
        key: keyData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Better With Aarkesh',
        description: activeCourse?.title ? `${activeCourse.title} Masterclass` : 'The Better Man Masterclass',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const token = localStorage.getItem('courseToken');
            const verifyRes = await fetch(`${API_URL}/api/payment/course-verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                token: token
              })
            });
            const verifyData = await safeJson(verifyRes);
            if (verifyRes.ok && verifyData.success) {
              // Mark course as purchased
              localStorage.setItem('isCoursePurchased', 'true');
              setIsPurchased(true);
              setShowCheckout(false);
              setShowPricingModal(false);
              sessionStorage.removeItem('course_checkout_active');
              setSearchParams({});

              // Save coaching token so My Journey page shows free sessions
              if (verifyData.coachingToken) {
                localStorage.setItem('token', verifyData.coachingToken);
              }
              if (verifyData.freeSessions !== undefined) {
                localStorage.setItem('freeSessions', String(verifyData.freeSessions));
              }

              // Show success toast
              showToast('🎉 Payment Successful! Official Tax Invoice generated.');

              const invoiceData = verifyData.purchase || {
                status: 'Success',
                transactionId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: finalPayable,
                basePrice: baseBeforeGst,
                gstRate,
                gstAmount,
                isGstIncluded,
                finalAmount: finalPayable,
                purchaseDate: new Date().toISOString(),
                studentName: fullName || email?.split('@')[0] || 'Valued Student',
                studentEmail: email,
                courseTitle: activeCourse?.title || 'The Better Man™',
                invoiceItemTitle: `${activeCourse?.title || 'The Better Man™'} — Masterclass Lifetime Access`,
                invoiceItemSubtitle: 'HD video frameworks, modular curriculum, worksheets & community',
                bonusItemTitle: '3 Private 1-on-1 Executive Coaching Sessions with Aarkesh',
                bonusItemSubtitle: 'Valued at ₹15,000 — 100% Complimentary student bonus',
                freeSessionsGranted: 3
              };

              // Open invoice / success page directly
              setShowDashboard(false);
              setPurchaseSuccessData(invoiceData);
            } else {
              setError(verifyData.message || 'Payment verification failed');
            }
          } catch (err) {
            setError(err.message || 'Error verifying payment.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: { email, contact: phoneNumber },
        theme: { color: activeTheme.accent || '#C878BE' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        console.warn('Razorpay payment failed:', response);
        const failedPayload = {
          status: 'Failed',
          transactionId: response.error?.metadata?.payment_id || `failed_${Date.now().toString(36)}`,
          orderId: response.error?.metadata?.order_id || orderData.id,
          failureReason: response.error?.description || response.error?.reason || 'Transaction was declined by bank / user cancelled payment.',
          errorCode: response.error?.code || 'PAYMENT_FAILED',
          amount: finalPayable,
          basePrice: baseBeforeGst,
          gstRate,
          gstAmount,
          isGstIncluded,
          finalAmount: finalPayable,
          purchaseDate: new Date().toISOString(),
          studentName: fullName || email?.split('@')[0] || 'Valued Student',
          studentEmail: email,
          courseTitle: 'The Better Man™',
        };

        // Persist failed attempt in database for admin visibility
        try {
          fetch(`${API_URL}/api/payment/course-failed-record`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              studentName: fullName || email?.split('@')[0] || 'Student',
              razorpay_order_id: failedPayload.orderId,
              razorpay_payment_id: failedPayload.transactionId,
              error_code: failedPayload.errorCode,
              error_description: failedPayload.failureReason,
              amount: finalPayable
            })
          }).catch(e => console.warn('Failed record log err:', e));
        } catch (e) {
          console.warn('Failed to record failure:', e);
        }

        // Show inline error — no receipt page for failures
        setError(failedPayload.failureReason || 'Payment failed. Please try again.');
        setIsLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment setup failed.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('courseToken');
    const purchased = localStorage.getItem('isCoursePurchased') === 'true';
    if (token) {
      setIsLoggedIn(true);
      setIsPurchased(purchased);
      if (purchased) {
        setShowDashboard(true);
      }
      const userStr = localStorage.getItem('courseUser');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj?.email) setEmail(userObj.email);
          if (userObj?.fullName) setFullName(userObj.fullName);
          if (userObj?.phoneNumber) setPhoneNumber(userObj.phoneNumber);
        } catch (e) {}
      }
    }

    const isCheckoutParam = searchParams.get('checkout') === 'true' || sessionStorage.getItem('course_checkout_active') === 'true';
    if (isCheckoutParam && !purchased) {
      if (token) {
        setShowCheckout(true);
        if (searchParams.get('checkout') !== 'true') {
          setSearchParams({ checkout: 'true' });
        }
      } else {
        setShowCourseLogin(true);
      }
    }

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchParams]);

  // Anti-Inspect & DevTools blocker in Course Dashboard
  useEffect(() => {
    if (!showDashboard) return;

    const blockDevToolsKeys = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['u', 'U', 's', 'S'].includes(e.key)) ||
        (e.metaKey && ['u', 'U', 's', 'S'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const blockContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', blockDevToolsKeys, { capture: true });
    window.addEventListener('contextmenu', blockContextMenu);

    return () => {
      window.removeEventListener('keydown', blockDevToolsKeys, { capture: true });
      window.removeEventListener('contextmenu', blockContextMenu);
    };
  }, [showDashboard]);

  const handleLogout = () => {
    localStorage.removeItem('courseToken');
    localStorage.removeItem('isCoursePurchased');
    localStorage.removeItem('courseUser');
    sessionStorage.removeItem('course_checkout_active');
    setIsLoggedIn(false);
    setIsPurchased(false);
    setShowDashboard(false);
    setShowCheckout(false);
    setShowProfileMenu(false);
    setSearchParams({});
    showToast('Logged out successfully', 'success');
  };

  // OTP Handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value !== '' && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpValues[index] === '' && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleToggleMode = () => {
    setLoginMode(loginMode === 'login' ? 'register' : 'login');
    setIsOtpStep(false);
    setIsForgotPassword(false);
    setIsForgotOtpStep(false);
    setOtpValues(['', '', '', '']);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setEmail('');
    setPhoneNumber('');
  };

  // Auth Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (loginMode === 'register' && !isForgotPassword) {
      if (password.length < 4) { setError('Password must be at least 4 characters long'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    } else if (isForgotPassword && isForgotOtpStep) {
      if (password.length < 4) { setError('Password must be at least 4 characters long'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    }

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      let endpoint = `${API_URL}/api/course-auth/login`;
      let body = { email, password };

      if (isForgotPassword) {
        if (!isForgotOtpStep) {
          endpoint = `${API_URL}/api/course-auth/forgot-password-init`;
          body = { email };
        } else {
          endpoint = `${API_URL}/api/course-auth/forgot-password-reset`;
          body = { email, otp: otpValues.join(''), newPassword: password };
        }
      } else if (loginMode === 'register') {
        if (!isOtpStep) {
          endpoint = `${API_URL}/api/course-auth/register-init`;
          body = { fullName, email, password };
        } else {
          endpoint = `${API_URL}/api/course-auth/register-verify`;
          body = { email, otp: otpValues.join('') };
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (isForgotPassword) {
          if (!isForgotOtpStep) {
            setIsForgotOtpStep(true);
            setError('');
          } else {
            setIsForgotPassword(false);
            setIsForgotOtpStep(false);
            setLoginMode('login');
            setOtpValues(['', '', '', '']);
            setPassword('');
            setConfirmPassword('');
            setError('');
          }
        } else if (loginMode === 'register' && !isOtpStep) {
          setIsOtpStep(true);
          setError('');
        } else {
          localStorage.setItem('courseToken', data.token);
          localStorage.setItem('courseUser', JSON.stringify(data));
          if (data.isPurchased && !isComingSoon) {
            localStorage.setItem('isCoursePurchased', 'true');
            setIsPurchased(true);
          } else {
            localStorage.removeItem('isCoursePurchased');
            setIsPurchased(false);
          }
          setShowDashboard(false);
          setShowCheckout(false);
          setShowPricingModal(false);
          setShowCourseLogin(false);
          setIsLoggedIn(true);

          const successMsg = loginMode === 'register' ? 'Registration successfully' : 'Login successfully';
          showToast(successMsg, 'success');
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error, please try again later');
    } finally {
      setIsLoading(false);
    }
  };



  // ═══════════════════════════════════════════════════════════════
  // PAYMENT SUCCESS / FAILED TAX INVOICE RECEIPT VIEW
  // ═══════════════════════════════════════════════════════════════
  if (purchaseSuccessData) {
    return (
      <CoursePaymentSuccess
        purchaseData={purchaseSuccessData}
        onStartLearning={() => {
          setPurchaseSuccessData(null);
          navigate('/my-course');
        }}
        onBookSession={() => {
          setPurchaseSuccessData(null);
          navigate('/book');
        }}
        onRetryPayment={() => {
          setPurchaseSuccessData(null);
          setShowCheckout(true);
          handlePayment();
        }}
        onBackToCourse={() => {
          setPurchaseSuccessData(null);
          setShowCheckout(false);
        }}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD VIEW (purchased users)
  // ═══════════════════════════════════════════════════════════════
  if (showDashboard) {
    const resolvedActiveVid = resolvePlayableVideoId(activeLesson);
    const hasActivePlayableVideo = Boolean(
      resolvedActiveVid && 
      resolvedActiveVid.trim().length >= 8 && 
      resolvedActiveVid !== 'dummy' && 
      !resolvedActiveVid.includes('undefined')
    );

    return (
      <div className="course-landing-scope h-screen bg-[#070408] text-white flex flex-col overflow-hidden">
        <CourseNavbar
          isLoggedIn={isLoggedIn}
          isPurchased={isPurchased}
          showDashboard={showDashboard}
          setShowDashboard={setShowDashboard}
          profileMenuRef={profileMenuRef}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          handleLogout={handleLogout}
          setShowCourseLogin={setShowCourseLogin}
          completedCount={allLessons.filter(l => l.isCompleted).length}
          totalCount={allLessons.length}
        />

        {/* Main Dashboard Layout: Responsive Vertical on Mobile, Split on Desktop */}
        <div className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-66px)] sm:h-[calc(100vh-76px)] overflow-hidden" data-lenis-prevent="true">
          
          {/* ── LEFT / MAIN COLUMN (Scrollable on both mobile and desktop) ── */}
          <div 
            ref={leftColumnRef}
            data-lenis-prevent="true"
            className="flex-1 flex flex-col bg-[#070408] overflow-y-auto border-r border-white/10 scroll-smooth overscroll-contain h-full"
          >
            {/* ── 1. CINEMATIC VIDEO PLAYER ── */}
            <div className="w-full aspect-video shrink-0 bg-black relative flex items-center justify-center border-b border-white/10 overflow-hidden z-20 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
              {hasActivePlayableVideo ? (
                <ProtectedYouTubePlayer 
                  key={activeLesson?._id || activeLesson?.id || 'yt_active'}
                  lesson={activeLesson}
                  videoToken={activeLesson?.videoToken || activeLesson?.encryptedVideoToken}
                  videoId={resolvedActiveVid}
                  title={activeLesson?.title}
                />
              ) : activeLesson?.muxPlaybackId ? (
                <iframe
                  src={`https://player.mux.com/${activeLesson.muxPlaybackId}?accentColor=C878BE`}
                  className="w-full h-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  title={activeLesson.title}
                />
              ) : (
                <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#150614] via-[#0B040B] to-[#040204] overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(200,120,190,0.18),transparent_70%)]" />
                  
                  {/* Subtle Grid Background */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C878BE_1px,transparent_1px)] [background-size:24px_24px]" />
                  
                  <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C878BE]/15 border border-[#C878BE]/30 text-[#E3B8DE] text-xs font-semibold uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--head)' }}>
                      <Sparkle size={13} weight="fill" />
                      <span>{activeModuleObj?.title || 'Masterclass Session'}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl text-white font-semibold mb-3 drop-shadow-md tracking-tight" style={{ fontFamily: 'var(--head)' }}>
                      {activeLesson?.title || 'Lesson Stream Ready'}
                    </h2>
                    
                    <p className="text-white/60 text-xs sm:text-sm font-sans mb-6 max-w-md line-clamp-2">
                      {activeLesson?.description || 'Learn calm authority, magnetic communication and self-command directly with Aarkesh.'}
                    </p>

                    <button 
                      type="button"
                      onClick={() => {
                        const updated = { ...activeLesson, isCompleted: !activeLesson?.isCompleted };
                        setActiveLesson(updated);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white font-medium text-xs sm:text-sm hover:opacity-95 transition-all shadow-[0_0_30px_rgba(200,120,190,0.35)] cursor-pointer"
                      style={{ fontFamily: 'var(--head)' }}
                    >
                      <Play size={16} weight="fill" />
                      <span>Start Session</span>
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10">
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[#C878BE] font-bold mb-0.5 block" style={{ fontFamily: 'var(--head)' }}>NOW PLAYING</span>
                    <h3 className="text-sm sm:text-base text-white/90 drop-shadow-md truncate max-w-xs sm:max-w-md font-semibold" style={{ fontFamily: 'var(--head)' }}>{activeLesson?.title}</h3>
                  </div>
                </div>
              )}
            </div>

            {/* ── 2. LESSON CONTROL & QUICK NAVIGATION BAR ── */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#0C060D] border-b border-white/10 shrink-0 gap-3">
              {/* Prev Lesson */}
              <button
                type="button"
                disabled={!prevLesson}
                onClick={() => {
                  if (prevLesson) {
                    handleSelectLesson(prevLesson, prevLesson.module);
                    if (leftColumnRef.current) leftColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  prevLesson 
                    ? 'bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 cursor-pointer' 
                    : 'opacity-30 cursor-not-allowed border border-white/5 text-white/40'
                }`}
                style={{ fontFamily: 'var(--head)' }}
              >
                <ArrowLeft size={13} weight="bold" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Lesson Title & Module Info (Center on mobile/desktop) */}
              <div className="text-center truncate min-w-0 px-2">
                <span className="text-[0.62rem] uppercase tracking-[0.18em] text-[#C878BE] font-bold block truncate" style={{ fontFamily: 'var(--head)' }}>
                  {activeModuleObj?.title || 'Masterclass Curriculum'}
                </span>
                <h3 className="text-xs sm:text-sm text-white font-medium truncate" style={{ fontFamily: 'var(--head)' }}>
                  {activeLesson?.title}
                </h3>
              </div>

              {/* Next Lesson / Mark Complete */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...activeLesson, isCompleted: !activeLesson?.isCompleted };
                    setActiveLesson(updated);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    activeLesson?.isCompleted
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-[#C878BE]/15 border-[#C878BE]/40 text-[#E3B8DE] hover:bg-[#C878BE]/25'
                  }`}
                  style={{ fontFamily: 'var(--head)' }}
                >
                  <CheckCircle size={15} weight={activeLesson?.isCompleted ? 'fill' : 'regular'} />
                  <span className="hidden sm:inline">{activeLesson?.isCompleted ? 'Completed' : 'Mark Complete'}</span>
                </button>

                <button
                  type="button"
                  disabled={!nextLesson}
                  onClick={() => {
                    if (nextLesson) {
                      handleSelectLesson(nextLesson, nextLesson.module);
                      if (leftColumnRef.current) leftColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    nextLesson 
                      ? 'bg-gradient-to-r from-[#8A2E80] to-[#58184E] border border-[#C878BE]/40 text-white hover:opacity-90 shadow-md cursor-pointer' 
                      : 'opacity-30 cursor-not-allowed border border-white/5 text-white/40'
                  }`}
                  style={{ fontFamily: 'var(--head)' }}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight size={13} weight="bold" />
                </button>
              </div>
            </div>

            {/* ── 3. MOBILE TAB SELECTOR (Curriculum Playlist & Comments) ── */}
            <div className="lg:hidden flex items-center border-b border-white/10 bg-[#0A050A] px-3.5 py-2.5 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveMobileTab('playlist')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  activeMobileTab === 'playlist'
                    ? 'bg-[#C878BE]/20 border border-[#C878BE]/50 text-[#E3B8DE] shadow-sm'
                    : 'bg-white/[0.03] border border-white/5 text-white/60 hover:text-white'
                }`}
                style={{ fontFamily: 'var(--head)' }}
              >
                <Play size={13} weight="fill" />
                <span>Playlist</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono">
                  {allLessons.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMobileTab('comments')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  activeMobileTab === 'comments'
                    ? 'bg-[#C878BE]/20 border border-[#C878BE]/50 text-[#E3B8DE] shadow-sm'
                    : 'bg-white/[0.03] border border-white/5 text-white/60 hover:text-white'
                }`}
                style={{ fontFamily: 'var(--head)' }}
              >
                <ChatCenteredDots size={14} weight="bold" />
                <span>Discussions</span>
              </button>
            </div>

            {/* ── MOBILE PLAYLIST VIEW ── */}
            {activeMobileTab === 'playlist' && (
              <div className="lg:hidden p-4 space-y-4 bg-[#070408]">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-base text-white font-semibold" style={{ fontFamily: 'var(--head)' }}>Course Curriculum</h4>
                  <span className="text-xs text-[#E3B8DE] font-mono font-medium">{allLessons.filter(l => l.isCompleted).length} / {allLessons.length} Completed</span>
                </div>

                <div className="space-y-3">
                  {curriculumModules.map((module) => {
                    const isCurrentMod = activeModuleObj?._id === module._id || activeModuleObj?.id === module.id;
                    const lessons = module.lessons || [];

                    return (
                      <div key={module._id || module.id} className="border border-white/10 rounded-2xl bg-[#0F0710] overflow-hidden">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left group"
                          onClick={() => setActiveModuleObj(isCurrentMod ? null : module)}
                        >
                          <div className="pr-3">
                            <h5 className={`text-sm mb-0.5 leading-snug font-semibold ${isCurrentMod ? 'text-[#E3B8DE]' : 'text-white'}`} style={{ fontFamily: 'var(--head)' }}>
                              {module.title}
                            </h5>
                            <p className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40" style={{ fontFamily: 'var(--head)' }}>
                              {lessons.length} {lessons.length === 1 ? 'LESSON' : 'LESSONS'}
                            </p>
                          </div>
                          <CaretDown size={14} className={`text-white/40 transition-transform shrink-0 ${isCurrentMod ? 'rotate-180' : ''}`} />
                        </button>

                        {isCurrentMod && (
                          <div className="bg-[#070408] p-2 pt-0 border-t border-white/5 space-y-1">
                            {lessons.map((lesson) => {
                              const isActive = (activeLesson?._id && activeLesson._id === lesson._id) || (activeLesson?.id && activeLesson.id === lesson.id);

                              return (
                                <button
                                  key={lesson._id || lesson.id}
                                  type="button"
                                  onClick={() => {
                                    handleSelectLesson(lesson, module);
                                    if (leftColumnRef.current) {
                                      leftColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all text-left ${
                                    isActive ? 'bg-[#2E122A] border border-[#C878BE]/50 shadow-[0_0_15px_rgba(200,120,190,0.15)]' : 'hover:bg-white/5 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    {lesson.isCompleted ? (
                                      <CheckCircle size={15} weight="fill" className="text-emerald-400 shrink-0" />
                                    ) : (
                                      <Play size={14} weight={isActive ? 'fill' : 'regular'} className={`shrink-0 ${isActive ? 'text-[#C878BE]' : 'text-white/40'}`} />
                                    )}
                                    <span className={`text-xs truncate ${isActive ? 'text-white font-medium' : 'text-white/70'}`} style={{ fontFamily: 'var(--head)' }}>
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <span className="text-[0.6rem] text-white/40 whitespace-nowrap ml-2 shrink-0 font-mono">
                                    {lesson.duration || '12:00'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 4. LESSON OVERVIEW, 1-ON-1 COACHING PERKS & WORKSHEETS ── */}
            <div className="p-4 sm:p-8 space-y-6">
              {/* About Lesson Card */}
              <div className="bg-[#0E0710] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_100%_0%,rgba(200,120,190,0.12),transparent_70%)] pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[0.65rem] uppercase tracking-[0.18em] text-[#C878BE] font-bold block mb-1" style={{ fontFamily: 'var(--head)' }}>
                      SESSION OVERVIEW
                    </span>
                    <h3 className="text-xl sm:text-2xl text-white font-semibold tracking-tight" style={{ fontFamily: 'var(--head)' }}>{activeLesson?.title}</h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs uppercase tracking-[0.15em] text-white/60" style={{ fontFamily: 'var(--head)' }}>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <Clock size={15} className="text-[#C878BE]" /> {activeLesson?.duration || '15:00'}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="w-4 h-4 rounded-full bg-[#C878BE]/20 text-[#E3B8DE] flex items-center justify-center text-[8px] font-bold">A</span>
                      AARKESH GUPTA
                    </div>
                  </div>
                </div>

                <p className="text-white/75 text-sm sm:text-base leading-relaxed mb-6">
                  {activeLesson?.description || 'In this session, we dive deep into the mechanics of presence. You will learn how to anchor yourself in high-pressure situations, tune out internal noise, and project a calm, magnetic energy.'}
                </p>

                {/* 3 Complimentary 1-on-1 Mentorship Sessions Banner */}
                <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#200D1E] via-[#150914] to-[#0D050D] border border-[#C878BE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#C878BE]/20 border border-[#C878BE]/40 flex items-center justify-center text-[#E3B8DE] shrink-0">
                      <Sparkle size={20} weight="fill" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5" style={{ fontFamily: 'var(--head)' }}>3 Private 1-on-1 Mentorship Sessions Included</h4>
                      <p className="text-xs text-white/60">Schedule your private deep-dive sessions directly with Aarkesh anytime during your course access.</p>
                    </div>
                  </div>

                  <Link
                    to="/book"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(200,120,190,0.3)] shrink-0"
                    style={{ fontFamily: 'var(--head)' }}
                  >
                    <span>Schedule Session</span>
                    <ArrowRight size={13} weight="bold" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── 5. DISCUSSIONS & COMMENTS SECTION ── */}
            <div className={`${activeMobileTab === 'comments' ? 'block' : 'hidden lg:block'} p-4 sm:p-8 pt-0`}>
              <div className="bg-[#0E0710] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <ChatCenteredDots size={20} className="text-[#C878BE]" />
                  <h4 className="text-lg text-white font-semibold" style={{ fontFamily: 'var(--head)' }}>Lesson Discussion & Student Q&A</h4>
                </div>
                <LessonComments
                  lessonId={activeLesson?._id || activeLesson?.id}
                  lessonTitle={activeLesson?.title}
                  onRequireAuth={() => {
                    setShowCourseLogin(true);
                    setLoginMode('login');
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── DESKTOP RIGHT COLUMN - Curriculum Playlist & Progress ── */}
          <div 
            data-lenis-prevent="true"
            className="hidden lg:flex w-[400px] xl:w-[440px] bg-[#0A050A] flex-col h-full overflow-y-auto p-6 gap-5 border-l border-white/10 overscroll-contain"
          >
            {/* Playlist Header & Overall Progress */}
            <div className="sticky top-0 bg-[#0A050A]/95 backdrop-blur-md z-10 pb-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[0.68rem] uppercase tracking-widest text-[#E3B8DE] font-bold flex items-center gap-2" style={{ fontFamily: 'var(--head)' }}>
                  <BookOpen size={14} className="text-[#C878BE]" />
                  Masterclass Curriculum
                </h3>
                <span className="text-xs text-white/50 font-mono font-medium">
                  {allLessons.filter(l => l.isCompleted).length} / {allLessons.length} Completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#A83B96] to-[#C878BE] rounded-full transition-all duration-500"
                  style={{
                    width: `${allLessons.length > 0 ? Math.round((allLessons.filter(l => l.isCompleted).length / allLessons.length) * 100) : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Modules Accordion List */}
            <div className="flex flex-col gap-3.5">
              {curriculumModules.map((module) => {
                const isCurrentMod = activeModuleObj?._id === module._id || activeModuleObj?.id === module.id;
                const lessons = module.lessons || [];
                const completedInMod = lessons.filter(l => l.isCompleted).length;

                return (
                  <div key={module._id || module.id} className="border border-white/10 rounded-2xl bg-[#0E060F] overflow-hidden transition-colors hover:border-white/20">
                    <button
                      className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors text-left group cursor-pointer"
                      onClick={() => setActiveModuleObj(isCurrentMod ? null : module)}
                    >
                      <div className="pr-3">
                        <h4 className={`text-sm sm:text-base mb-1 transition-colors leading-snug font-semibold ${isCurrentMod ? 'text-[#E3B8DE]' : 'text-white group-hover:text-[#E3B8DE]'}`} style={{ fontFamily: 'var(--head)' }}>
                          {module.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-white/40" style={{ fontFamily: 'var(--head)' }}>
                          <span>{lessons.length} {lessons.length === 1 ? 'LESSON' : 'LESSONS'}</span>
                          <span>•</span>
                          <span className={completedInMod === lessons.length && lessons.length > 0 ? 'text-emerald-400 font-semibold' : ''}>
                            {completedInMod}/{lessons.length} DONE
                          </span>
                        </div>
                      </div>
                      <CaretDown size={15} className={`text-white/40 transition-transform shrink-0 ${isCurrentMod ? 'rotate-180 text-[#C878BE]' : ''}`} />
                    </button>

                    {isCurrentMod && (
                      <div className="bg-[#070308] p-2 pt-0 border-t border-white/5 space-y-1">
                        {lessons.map((lesson) => {
                          const isActive = (activeLesson?._id && activeLesson._id === lesson._id) || (activeLesson?.id && activeLesson.id === lesson.id);

                          return (
                            <button
                              key={lesson._id || lesson.id}
                              onClick={() => {
                                handleSelectLesson(lesson, module);
                                if (leftColumnRef.current) leftColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl transition-all text-left group cursor-pointer ${
                                isActive 
                                  ? 'bg-[#2A1026] border border-[#C878BE]/60 shadow-[0_0_20px_rgba(200,120,190,0.2)]' 
                                  : 'hover:bg-white/5 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                {lesson.isCompleted ? (
                                  <CheckCircle size={16} weight="fill" className="text-emerald-400 shrink-0" />
                                ) : (
                                  <Play size={15} weight={isActive ? 'fill' : 'regular'} className={`shrink-0 ${isActive ? 'text-[#C878BE]' : 'text-white/40 group-hover:text-white'}`} />
                                )}
                                <span className={`text-xs truncate ${isActive ? 'text-white font-semibold' : 'text-white/70 group-hover:text-white'}`} style={{ fontFamily: 'var(--head)' }}>
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-[0.62rem] text-white/40 whitespace-nowrap ml-2 shrink-0 font-mono">
                                {lesson.duration || '12:00'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="course-landing-scope">
      {/* ── Top Fixed Nav ── */}
      <header className="course-nav">
        <Link 
          className="course-logo" 
          to="/course"
          onClick={(e) => {
            setShowCourseLogin(false);
            setShowDashboard(false);
            if (location.pathname === '/course' || location.pathname === '/course/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          BetterWith<b>Aarkesh</b>
        </Link>
        <nav className="course-nav-center-links">
          <Link 
            to="/course" 
            onClick={(e) => {
              setShowCourseLogin(false);
              setShowDashboard(false);
              if (location.pathname === '/course' || location.pathname === '/course/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`course-nav-link ${location.pathname === '/course' ? 'active' : ''}`}
          >
            <FlippingWordSwap 
              word1="Home" 
              word2="Home" 
              active={location.pathname === '/course'} 
              toClassName="text-[#C878BE]"
            />
          </Link>
          <Link 
            to="/course/all" 
            onClick={(e) => {
              setShowCourseLogin(false);
              setShowDashboard(false);
              if (isAllCoursesPage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`course-nav-link ${isAllCoursesPage ? 'active' : ''}`}
          >
            <FlippingWordSwap 
              word1="Courses" 
              word2="Courses" 
              active={isAllCoursesPage} 
              toClassName="text-[#C878BE]"
            />
          </Link>
          <a 
            href="/course#faq" 
            onClick={(e) => {
              setShowCourseLogin(false);
              setShowDashboard(false);
              if (location.pathname === '/course' || location.pathname === '/course/') {
                e.preventDefault();
                const el = document.getElementById('faq');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                e.preventDefault();
                navigate('/course');
                setTimeout(() => {
                  const el = document.getElementById('faq');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }
            }}
            className="course-nav-link"
          >
            <FlippingWordSwap 
              word1="FAQ" 
              word2="FAQ" 
              toClassName="text-[#C878BE]"
            />
          </a>
        </nav>
        <div className="nav-r flex items-center gap-3">
          <button
            type="button"
            className="course-nav-check-btn"
            onClick={() => {
              setShowCourseLogin(false);
              setShowDashboard(false);
              const betterMan = coursesList.find(c => c.slug === 'better-man') || coursesList[0];
              handleSelectCourse(betterMan);
            }}
          >
            Check Course <span aria-hidden="true">→</span>
          </button>

          {isLoggedIn ? (
            <>
              {isPurchased && (
                <Link
                  to="/my-course"
                  className="course-nav-mycourse-btn"
                  title="My Enrolled Courses"
                >
                  <BookOpen size={16} weight="bold" />
                  <span>My Course</span>
                </Link>
              )}

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="course-profile-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#C878BE]/50 bg-[#120613] flex items-center justify-center text-[#E3B8DE] hover:bg-[#C878BE] hover:text-black transition-all shadow-[0_0_20px_rgba(200,120,190,0.25)] shrink-0 cursor-pointer"
                  title="Student Profile"
                >
                  <User size={17} weight="bold" />
                </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/10 bg-[#0E0610] shadow-2xl py-2 z-[100] overflow-hidden text-left">
                  <Link
                    to="/my-course"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-5 py-3 text-left font-sans text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                  >
                    <BookOpen size={18} className="text-[#C878BE]" /> My Course
                  </Link>
                  <Link
                    to="/course/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-5 py-3 text-left font-sans text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                  >
                    <User size={18} className="text-[#C878BE]" /> Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-5 py-3 text-left font-sans text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <SignOut size={18} /> Log Out
                  </button>
                </div>
              )}
            </div>
            </>
          ) : (
            <button
              type="button"
              className="sign-in-btn"
              onClick={() => {
                setLoginMode('login');
                setShowCourseLogin(true);
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <main id="top">
        {isAllCoursesPage ? (
          /* ═══════════════════════════════════════════════════════════════
             DEDICATED ALL MASTERCLASSES VIEW / CATALOG (/course/all or /courses)
             ═══════════════════════════════════════════════════════════════ */
          <section className="all-courses-sec">
            <div className="wrap">
              <button
                type="button"
                className="back-link"
                onClick={() => {
                  navigate('/course');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                ← Back to overview
              </button>

              <div className="all-courses-hero">
                <span className="tag">ALL PROGRAMS</span>
                <h1>All Masterclasses & Programs</h1>
                <p className="sub">
                  Each masterclass is an intensive, transformative curriculum paired with private 1-on-1 mentorship sessions with Aarkesh.
                </p>
              </div>

              <div className="all-courses-grid">
                {coursesList.map((c, i) => {
                  const themeCls = getCardThemeClass(i);
                  return (
                    <article className={`all-course-card ${themeCls}`} key={c.n || c.slug}>
                      {/* Thumbnail Banner */}
                      <div className={`vis ${c.cls}`} aria-hidden="true">
                        <div className="vis-badge-top">
                          {c.soon ? (
                            <span className="live-status-badge soon">Coming soon</span>
                          ) : (
                            <span className="live-status-badge live"><span className="pulse-dot"></span> Live</span>
                          )}
                        </div>
                        <span className="no">{c.n}</span>
                        <i>{c.chips[0]}</i>
                        <i>{c.chips[1]}</i>
                      </div>

                      {/* Content Body */}
                      <div className="all-course-card-content">
                        {/* Topic Tag Pills */}
                        <div className="card-tag-pills">
                          {c.chips.map((chip, ci) => (
                            <span className="card-tag-pill" key={ci}>{chip}</span>
                          ))}
                          <span className="card-tag-pill">{c.facts[0][0]} {c.facts[0][1]}</span>
                        </div>

                        {/* Title */}
                        <h3 className="card-course-title">{c.title}</h3>

                        {/* Price & Badge Row */}
                        <div className="card-price-row">
                          <div className="price-label">
                            Price <b>{c.price}</b> <s>{c.was}</s>
                          </div>
                          {c.soon ? (
                            <span className="card-discount-badge">WAITLIST</span>
                          ) : (
                            <span className="card-discount-badge">POPULAR</span>
                          )}
                        </div>

                        {/* Action CTA Button */}
                        <button
                          type="button"
                          className="card-cta-btn"
                          onClick={() => handleSelectCourse(c)}
                        >
                          Check Course <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : !isDetailPage ? (
          /* ═══════════════════════════════════════════════════════════════
             MAIN COURSES LISTING PAGE (/course)
             ═══════════════════════════════════════════════════════════════ */
          <>
            {/* ── Hero Section ── */}
            <section className="hero">
              <div className="wrap">
                <p className="tag">Learn. Practise. Lead.</p>
                <h1>
                  THE <span className="sel">BETTER</span> MAN
                </h1>
                <p className="sub">
                  Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh.
                </p>
                <div className="proof">
                  <span><b>3 private</b> 1-on-1 sessions with Aarkesh</span>
                  <span><b>Lifetime</b> access, no recurring charges</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  {isPurchased ? (
                    <button 
                      type="button" 
                      className="btn" 
                      onClick={() => navigate('/my-course')}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <BookOpen size={20} weight="fill" />
                      <span>My Course</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  ) : (
                    <>
                      <button 
                        type="button" 
                        className="btn" 
                        onClick={handleEnroll}
                      >
                        Register Now <span aria-hidden="true">→</span>
                      </button>
                      <button 
                        type="button" 
                        className="btn line" 
                        onClick={() => {
                          const betterMan = coursesList.find(c => c.slug === 'better-man') || coursesList[0];
                          handleSelectCourse(betterMan);
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(200, 120, 190, 0.4)',
                          color: '#FFFFFF'
                        }}
                      >
                        Check Course <span aria-hidden="true">→</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* ── More Masterclasses Stacked Section (Directly Below Hero Section) ── */}
            <section className="stack-sec" id="courses">
              <div className="stack">
                <h2>More Masterclasses</h2>
                <p className="lead">Each one is a standalone course with its own private sessions.</p>
                <div className="all-courses-grid">
                  {coursesList.map((c, i) => {
                    const themeCls = getCardThemeClass(i);
                    return (
                      <article className={`all-course-card ${themeCls}`} key={c.n || c.slug}>
                        {/* Thumbnail Banner */}
                        <div className={`vis ${c.cls}`} aria-hidden="true">
                          <div className="vis-badge-top">
                            {c.soon ? (
                              <span className="live-status-badge soon">Coming soon</span>
                            ) : (
                              <span className="live-status-badge live"><span className="pulse-dot"></span> Live</span>
                            )}
                          </div>
                          <span className="no">{c.n}</span>
                          <i>{c.chips[0]}</i>
                          <i>{c.chips[1]}</i>
                        </div>

                        {/* Content Body */}
                        <div className="all-course-card-content">
                          {/* Topic Tag Pills */}
                          <div className="card-tag-pills">
                            {c.chips.map((chip, ci) => (
                              <span className="card-tag-pill" key={ci}>{chip}</span>
                            ))}
                            <span className="card-tag-pill">{c.facts[0][0]} {c.facts[0][1]}</span>
                          </div>

                          {/* Title */}
                          <h3 className="card-course-title">{c.title}</h3>

                          {/* Price & Badge Row */}
                          <div className="card-price-row">
                            <div className="price-label">
                              Price <b>{c.price}</b> <s>{c.was}</s>
                            </div>
                            {c.soon ? (
                              <span className="card-discount-badge">WAITLIST</span>
                            ) : (
                              <span className="card-discount-badge">POPULAR</span>
                            )}
                          </div>

                          {/* Action CTA Button */}
                          <button
                            type="button"
                            className="card-cta-btn"
                            onClick={() => handleSelectCourse(c)}
                          >
                            Check Course <span aria-hidden="true">→</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* ── View All Masterclasses Action Button ── */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
                  <button
                    type="button"
                    className="btn dark"
                    onClick={() => {
                      navigate('/course/all');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '16px 38px',
                      fontSize: '15px',
                      fontWeight: '600',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      borderRadius: '999px',
                      background: '#0E0C0B',
                      color: '#ffffff',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                      cursor: 'pointer',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 14px 36px rgba(0, 0, 0, 0.28)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                    View All <ArrowRight size={18} weight="bold" />
                  </button>
                </div>
              </div>
            </section>

            {/* ── FAQ Section ── */}
            <section className="faq center" id="faq">
              <div className="wrap">
                <span className="label">FAQS</span>
                <h2>Frequently Asked Questions From Our Students</h2>
                <p className="lead">
                  Clear answers about the masterclass, private mentorship, and enrollment.
                </p>

                <div className="acc">
                  {(courseFaqs && courseFaqs.length > 0 ? courseFaqs : [
                    { q: 'How do the 3 private 1-on-1 sessions work?', a: 'Immediately after enrollment, you gain access to Aarkesh\'s private booking calendar. You can schedule each 1-on-1 session at dates and times that suit your schedule.' },
                    { q: 'Is this course suitable for professionals and introverts?', a: 'Yes. The curriculum is specifically designed for professionals, entrepreneurs, and introverts who want to develop natural, calm authority without acting loud or fake.' },
                    { q: 'How long do I have access to the materials?', a: 'You receive full lifetime access. You can revisit lessons, download the workbooks, and receive all future course updates at zero extra cost.' },
                    { q: 'Is there a certificate provided upon completion?', a: 'Yes. Upon completing all modules and your private sessions, you will receive an official Certificate of Completion signed by Aarkesh.' }
                  ]).map((f, idx) => (
                    <details className="a" key={idx} open={idx === 0}>
                      <summary>
                        <span className="n">Q{idx + 1}</span>
                        <span className="t">{f.q || f.question}</span>
                      </summary>
                      <p>{f.a || f.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Final Call to Action ── */}
            <section className="cta center">
              <div className="wrap">
                <div className="cta-box">
                  <span className="label" style={{ marginBottom: '16px' }}>ENROLL TODAY</span>
                  <h2>Ready To Become The Man People Trust?</h2>
                  <p className="lead">
                    Master the psychology of calm authority, magnetic communication and effortless self-command with lifetime curriculum access and 3 private 1-on-1 coaching sessions.
                  </p>
                  <div className="cta-badges">
                    <span><Users size={16} weight="fill" /> 3 Private Coaching Calls</span>
                    <span><Clock size={16} weight="fill" /> Lifetime Video Access</span>
                  </div>
                  <div>
                    {isPurchased ? (
                      <button 
                        type="button" 
                        className="btn" 
                        onClick={() => navigate('/my-course')}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <BookOpen size={20} weight="fill" />
                        <span>My Course</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    ) : isLoggedIn ? (
                      <button 
                        type="button" 
                        className="btn" 
                        onClick={() => {
                          navigate('/course/all');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Explore Courses <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <button type="button" className="btn" onClick={handleEnroll}>
                        Register Now <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* ═══════════════════════════════════════════════════════════════
             DEDICATED SINGLE-PAGE COURSE DETAILS VIEW (/course/:slug)
             ═══════════════════════════════════════════════════════════════ */
          <>
            <section className={`d-top ${activeCourse.slug === 'better-man' ? 'theme-dark' : activeCourse.slug === 'difficult-people' ? 'theme-purple' : ''}`} id="course-detail">
              <div className="wrap">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/course');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="back-link"
                >
                  ← Back to all courses
                </button>

                <div className="d-grid">
                  {/* Left Column: Preview Canvas & Title */}
                  <div>
                    <div className={`pv ${activeCourse.cls}`} aria-hidden="true">
                      <span className="big">{activeCourse.title}</span>
                      <i>{activeCourse.chips[0]}</i>
                      <i>{activeCourse.chips[1]}</i>
                      <div className="pv-center-btn">
                        <Play size={24} weight="fill" />
                      </div>
                    </div>

                    <div className="dtitle">
                      <h1>{activeCourse.title}</h1>
                      <span className={`sticker ${activeCourse.soon ? 'soon' : ''}`}>
                        {activeCourse.soon ? 'Coming soon' : 'Live now'}
                      </span>
                    </div>
                    <p className="dlede">{activeCourse.lede || activeCourse.d}</p>
                  </div>

                  {/* Right Column: Sidebar Card */}
                  <aside className="side" aria-label="Course summary">
                    {/* Key Highlights */}
                    {activeCourse.hl.map((h, idx) => (
                      <p className="hl" key={idx}>
                        <span>
                          <b>{h[0]}</b> {h[1]}
                        </span>
                      </p>
                    ))}

                    {/* Divider */}
                    <div className="div-divider">What's inside</div>

                    {/* Feature Checklist */}
                    <ul className="ck">
                      {activeCourse.inside.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>

                    {/* Pricing */}
                    <p className="sprice">
                      Price <b>{activeCourse.price}</b>
                      <s>{activeCourse.was}</s>
                      <small>(+GST)</small>
                    </p>

                    {/* Action Buttons */}
                    {activeCourse.soon ? (
                      <button
                        type="button"
                        className="btn block"
                        onClick={() => {
                          if (!isLoggedIn) {
                            setShowCourseLogin(true);
                          } else {
                            setShowPreRegSuccessModal(true);
                          }
                        }}
                      >
                        Join the Waitlist <span aria-hidden="true">→</span>
                      </button>
                    ) : isPurchased ? (
                      <button
                        type="button"
                        className="btn block"
                        onClick={() => navigate('/my-course')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <BookOpen size={20} weight="fill" />
                        <span>My Course</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn block"
                        onClick={handleEnroll}
                      >
                        {isLoggedIn ? 'Enroll Now' : 'Register Now'} <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </aside>
                </div>
              </div>
            </section>

            {/* ── Curriculum Syllabus Section on Detail Page (Scroll to view) ── */}
            <section className={`detail-syllabus-sec ${activeCourse.slug === 'better-man' ? 'theme-dark' : activeCourse.slug === 'difficult-people' ? 'theme-purple' : ''}`} id="detail-syllabus">
              <div className="wrap">
                <div className="syllabus-head">
                  <span className="syllabus-tag sel">SYLLABUS</span>
                  <h2 className="syllabus-title">{activeCourse.syllabusTitle || `${activeCourse.title} Curriculum`}</h2>
                </div>

                <div className="syllabus-points-grid">
                  {(activeCourse.syllabus || []).map((m, idx) => (
                    <div className="syllabus-point-card" key={m.n || idx}>
                      <div className="point-num">{m.n || String(idx + 1).padStart(2, '0')}</div>
                      <div className="point-body">
                        <h4 className="point-title">{m.t || m.title}</h4>
                        <p className="point-desc">{m.d || m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Editorial Writeup Section for Detail Page (Below Syllabus) ── */}
            {activeCourse.writeup && (
              <section className={`detail-writeup-sec ${activeCourse.slug === 'better-man' ? 'theme-dark' : activeCourse.slug === 'difficult-people' ? 'theme-purple' : ''}`} id="detail-writeup">
                <div className="wrap">
                  <div className="writeup-card">
                    <article className="writeup-prose">
                      <div className="writeup-header">
                        <span className="writeup-tag sel">{activeCourse.writeup.chip}</span>
                        <h2 className="writeup-title">{activeCourse.writeup.h1}</h2>
                        <p className="writeup-lede">
                          {activeCourse.writeup.lede}
                        </p>
                      </div>

                      <div className="writeup-body">
                        <p>{activeCourse.writeup.p1}</p>

                        <div className="writeup-quote-box">
                          <Quotes size={36} weight="fill" className="quote-icon" />
                          <blockquote>"{activeCourse.writeup.quote}"</blockquote>
                        </div>

                        <p>{activeCourse.writeup.p2}</p>

                        <div className="writeup-distinction">
                          <span className="distinction-badge">Key Distinction</span>
                          <p className="distinction-text">{activeCourse.writeup.distinction}</p>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Syllabus Modal */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#0c0a0e] border border-[#5A2C55] rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl">
            <button 
              type="button"
              onClick={() => setShowSyllabusModal(false)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Close syllabus"
            >
              <X size={16} />
            </button>
            <span className="label" style={{ marginBottom: '12px' }}>SYLLABUS</span>
            <h3 className="font-head text-2xl font-bold text-white mb-2">{activeCourse.title} Curriculum</h3>
            <p className="text-sm text-white/60 mb-6 font-body">Structured modules and deep-dive lessons included in this masterclass.</p>
            <div className="acc">
              {curriculumCards.map((card, idx) => (
                <details className="a" key={idx} open={idx === 0}>
                  <summary>
                    <span className="n">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="t">{card.title}</span>
                  </summary>
                  <p>{card.description}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODALS ──────────────────────────────────────────────── */}

      {/* Complete Your Purchase Checkout Modal (Theme-Adapted & Sheryians-Style Layout) */}
      {showPricingModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl overflow-y-auto overscroll-contain p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          {/* Dynamic Background Glow */}
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none"
            style={{ background: activeTheme.accentGlow }}
          />

          {/* Top Header Text */}
          <div className="relative z-10 text-center mb-4 sm:mb-6">
            <h2 
              className="text-2xl sm:text-4xl font-bold text-white tracking-tight"
              style={{ fontFamily: 'var(--head)' }}
            >
              Complete Your <span style={{ color: activeTheme.accent }}>Purchase</span>
            </h2>
          </div>

          {/* Main Container Card */}
          <div 
            className={`relative w-full max-w-4xl rounded-3xl border ${activeTheme.border} ${activeTheme.outerBg} shadow-[0_30px_100px_rgba(0,0,0,0.95)] p-6 sm:p-8 md:p-10 my-auto text-left`}
          >
            {/* Top Close Button */}
            <button 
              type="button"
              onClick={() => setShowPricingModal(false)} 
              className="absolute right-4 top-4 sm:right-6 sm:top-6 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Close modal"
            >
              <X size={17} />
            </button>

            {/* Grid: 2 Columns (Your Course on Left, Payment Details on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              
              {/* LEFT COLUMN: Your Course */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight">
                  Your Course
                </h3>

                {/* Course Display: Dummy Visual Graphic Card + Info */}
                <div className="flex flex-col gap-4">
                  {/* Dummy Graphic Card Mockup matching Course Themes */}
                  <div 
                    className="w-full aspect-[16/10] sm:aspect-[16/10.5] rounded-2xl overflow-hidden border border-white/15 relative shadow-2xl flex items-center justify-center select-none"
                    style={{
                      background: activeCourse?.slug === 'difficult-people'
                        ? 'radial-gradient(circle at 35% 25%, #2a2a2a 0%, #141414 55%, #050505 100%)'
                        : activeCourse?.slug === 'decisions'
                        ? 'radial-gradient(circle at 35% 25%, #3d246c 0%, #1d1038 55%, #080312 100%)'
                        : 'radial-gradient(circle at 35% 25%, #6A1B60 0%, #300E32 55%, #0C040E 100%)'
                    }}
                  >
                    {/* Top Right Live Badge */}
                    <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-20">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] sm:text-[11px] font-semibold backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live now
                      </span>
                    </div>

                    {/* Big Center Number */}
                    <span 
                      className="text-white font-extrabold tracking-tighter"
                      style={{ 
                        fontFamily: 'var(--head)',
                        fontSize: 'clamp(4.5rem, 9vw, 6.8rem)',
                        lineHeight: 1,
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }}
                    >
                      {activeCourse?.n || '01'}
                    </span>

                    {/* Top Right Rotated Pill */}
                    <span 
                      className="absolute right-2.5 top-[20%] -rotate-12 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold text-white shadow-xl pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, #C878BE, #7A2A70)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        fontFamily: 'var(--head)'
                      }}
                    >
                      {activeCourse?.chips?.[0] || 'Calm Authority'}
                    </span>

                    {/* Bottom Left Rotated Pill */}
                    <span 
                      className="absolute left-2.5 bottom-[18%] rotate-6 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold text-white shadow-xl pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, #8A6BFF, #3A2A86)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        fontFamily: 'var(--head)'
                      }}
                    >
                      {activeCourse?.chips?.[1] || 'Self-Command'}
                    </span>
                  </div>

                  {/* Title & Pricing */}
                  <div className="mt-1">
                    <h4 
                      className="text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight mb-1.5"
                      style={{ fontFamily: 'var(--head)' }}
                    >
                      {activeCourse.title}
                    </h4>

                    <div className="flex items-baseline gap-2.5">
                      <span className="font-sans text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        ₹{finalPayable.toLocaleString('en-IN')}
                      </span>
                      {activeCourseComparePrice > activeCourseBasePrice && (
                        <span className="font-sans text-sm text-white/40 line-through">
                          Rs.{activeCourseComparePrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Payment Details */}
              <div className="lg:col-span-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight">
                  Payment Details
                </h3>

                <div className={`rounded-2xl border border-white/10 ${activeTheme.cardBg} p-5 sm:p-6 shadow-xl`}>
                  <div className="space-y-3.5 text-xs sm:text-sm font-sans">
                    
                    {/* Base Price */}
                    <div className="flex items-center justify-between text-white/70">
                      <span>Base Price</span>
                      <span className="font-semibold text-white">₹{baseBeforeGst.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Platform Fee */}
                    <div className="flex items-center justify-between text-white/70">
                      <span>Platform fee</span>
                      <span className="font-semibold text-white">₹0</span>
                    </div>

                    {/* GST */}
                    <div className="flex items-center justify-between text-white/70">
                      <span>GST({gstRate}%)</span>
                      <span className="font-semibold text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 pt-3 my-2" />

                    {/* Total Amount */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm sm:text-base text-white">Total Amount</span>
                      <span 
                        className="font-extrabold text-xl sm:text-2xl tracking-tight"
                        style={{ color: activeTheme.accentLight }}
                      >
                        ₹{finalPayable.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>


                  {/* T&C Agreement Checkbox */}
                  <div className="mt-5 mb-1">
                    <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                      <div
                        onClick={() => setCheckoutAgreed(!checkoutAgreed)}
                        className="w-4 h-4 mt-0.5 shrink-0 rounded border flex items-center justify-center cursor-pointer transition-all"
                        style={{
                          background: checkoutAgreed ? (activeTheme.accent || '#C878BE') : 'transparent',
                          borderColor: checkoutAgreed ? (activeTheme.accent || '#C878BE') : 'rgba(255,255,255,0.25)',
                          boxShadow: checkoutAgreed ? `0 0 8px ${activeTheme.accent || '#C878BE'}60` : 'none'
                        }}
                      >
                        {checkoutAgreed && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="font-sans text-xs text-white/65 leading-relaxed group-hover:text-white/85 transition-colors">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const termsDoc = courseDocuments?.find(d =>
                              (d.slug && (d.slug.toLowerCase().includes('term') || d.slug.toLowerCase().includes('condition'))) ||
                              (d.title && (d.title.toLowerCase().includes('term') || d.title.toLowerCase().includes('condition')))
                            );
                            setActivePolicySlug(termsDoc?.slug || 'course-terms-and-conditions');
                          }}
                          className="font-semibold underline underline-offset-2 inline cursor-pointer transition-colors"
                          style={{ color: activeTheme.accentLight || '#E3B8DE' }}
                        >
                          Terms &amp; Conditions
                        </button>
                      </span>
                    </label>
                  </div>

                  {/* Error message if any */}
                  {error && (
                    <div className="text-white/70 font-sans text-xs mt-3 text-center bg-white/5 border border-white/15 rounded-xl p-2.5">
                      {error}
                    </div>
                  )}

                  {/* Proceed to checkout CTA Button */}
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={isLoading || !checkoutAgreed}
                    className={`w-full mt-4 rounded-xl ${activeTheme.buttonBg} hover:brightness-110 active:scale-[0.99] text-white py-4 font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-all shadow-[0_0_30px_rgba(200,120,190,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>PROCESSING...</span>
                      </>
                    ) : (
                      <span>Proceed to checkout</span>
                    )}
                  </button>

                  {/* Security Notice */}
                  <div className="flex items-center justify-center gap-3 text-[10px] text-white/50 mt-3 font-sans">
                    <div className="flex items-center gap-1">
                      <LockKey size={12} className="text-white/60" />
                      <span>256-Bit SSL Encrypted</span>
                    </div>
                    <span>•</span>
                    <span>Instant Lifetime Access</span>
                  </div>


                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <AuthModal
        showCourseLogin={showCourseLogin}
        setShowCourseLogin={setShowCourseLogin}
        isForgotPassword={isForgotPassword}
        setIsForgotPassword={setIsForgotPassword}
        isForgotOtpStep={isForgotOtpStep}
        handleAuthSubmit={handleAuthSubmit}
        isOtpStep={isOtpStep}
        loginMode={loginMode}
        setLoginMode={setLoginMode}
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        otpValues={otpValues}
        otpRefs={otpRefs}
        handleOtpChange={handleOtpChange}
        handleOtpKeyDown={handleOtpKeyDown}
        error={error}
        setError={setError}
        isLoading={isLoading}
        handleToggleMode={handleToggleMode}
        coursesList={coursesList}
        basePrice={basePrice}
        comparePrice={comparePrice}
      />
      <CheckoutOverlay
        showCheckout={showCheckout}
        setShowCheckout={handleCloseCheckout}
        checkoutAgreed={checkoutAgreed}
        setCheckoutAgreed={setCheckoutAgreed}
        handlePayment={handlePayment}
        isLoading={isLoading}
        error={error}
        courseData={courseData}
        onOpenTerms={() => {
          const termsDoc = courseDocuments.find(d => 
            (d.slug && (d.slug.toLowerCase().includes('term') || d.slug.toLowerCase().includes('condition'))) ||
            (d.title && (d.title.toLowerCase().includes('term') || d.title.toLowerCase().includes('condition')))
          );
          setActivePolicySlug(termsDoc?.slug || 'course-terms-and-conditions');
        }}
      />

      {/* Course Policy / T&C Modal for instant viewing with Allow & Deny actions */}
      <PolicyModal
        isOpen={!!activePolicySlug}
        onClose={() => setActivePolicySlug(null)}
        slug={activePolicySlug}
        title="Terms & Conditions"
        showActions={true}
        accentColor={activeTheme.accent || '#C878BE'}
        accentLight={activeTheme.accentLight || '#E3B8DE'}
        gradientFrom={activeTheme.accent ? activeTheme.accent + '99' : '#6A1B60'}
        gradientTo={activeTheme.accent ? activeTheme.accent + '44' : '#300E32'}
        onAgree={() => {
          setCheckoutAgreed(true);
          setActivePolicySlug(null);
        }}
        onDecline={() => {
          setCheckoutAgreed(false);
          setActivePolicySlug(null);
        }}
      />


      {/* ─── PRE-REGISTRATION CONFIRMATION MODAL ─── */}
      {showPreRegSuccessModal && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border border-amber-500/40 bg-[#0c0c0c] p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.15)] text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowPreRegSuccessModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close modal"
            >
              <X size={16} />
            </button>

            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <CheckCircle size={34} weight="fill" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#E3B8DE] font-semibold block">
                REGISTRATION CONFIRMED
              </span>
              <h3 
                className="text-2xl sm:text-3xl text-white font-bold"
                style={{ fontFamily: 'var(--head)' }}
              >
                You're Registered!
              </h3>
              <p className="font-sans text-xs sm:text-sm text-white/65 leading-relaxed max-w-sm mx-auto">
                You will be able to see the course once it is live.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPreRegSuccessModal(false)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#C878BE]/20 active:scale-[0.99]"
            >
              Got It
            </button>
          </div>
        </div>
      )}


      {/* Green Success Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#0a1f14]/95 border border-emerald-500/40 shadow-[0_10px_35px_rgba(16,185,129,0.3)] backdrop-blur-xl text-emerald-300 font-sans text-xs sm:text-sm font-semibold tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
            <CheckCircle size={18} className="text-emerald-400" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NAVBAR (POST-PURCHASE DASHBOARD) ───────────────────────────
function CourseNavbar({ isLoggedIn, isPurchased, showDashboard, setShowDashboard, profileMenuRef, showProfileMenu, setShowProfileMenu, handleLogout, setShowCourseLogin }) {
  const navigate = useNavigate();

  return (
    <header className="course-nav" style={{ position: 'relative', top: 'auto', zIndex: 50, flexShrink: 0 }}>
      {/* Brand Logo */}
      <Link 
        className="course-logo" 
        to="/course"
        onClick={(e) => {
          e.preventDefault();
          if (typeof setShowCourseLogin === 'function') setShowCourseLogin(false);
          setShowDashboard(false);
          navigate('/course');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        BetterWith<b>Aarkesh</b>
      </Link>

      {/* Center Nav: Home, Courses, FAQ */}
      <nav className="course-nav-center-links">
        <Link 
          to="/course" 
          onClick={(e) => {
            e.preventDefault();
            if (typeof setShowCourseLogin === 'function') setShowCourseLogin(false);
            setShowDashboard(false);
            navigate('/course');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="course-nav-link"
        >
          <FlippingWordSwap 
            word1="Home" 
            word2="Home" 
            toClassName="text-[#C878BE]"
          />
        </Link>
        <Link 
          to="/course/all" 
          onClick={(e) => {
            e.preventDefault();
            if (typeof setShowCourseLogin === 'function') setShowCourseLogin(false);
            setShowDashboard(false);
            navigate('/course/all');
          }}
          className="course-nav-link"
        >
          <FlippingWordSwap 
            word1="Courses" 
            word2="Courses" 
            toClassName="text-[#C878BE]"
          />
        </Link>
        <a 
          href="/course#faq" 
          onClick={(e) => {
            e.preventDefault();
            if (typeof setShowCourseLogin === 'function') setShowCourseLogin(false);
            setShowDashboard(false);
            setTimeout(() => {
              const el = document.getElementById('faq');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="course-nav-link"
        >
          <FlippingWordSwap 
            word1="FAQ" 
            word2="FAQ" 
            toClassName="text-[#C878BE]"
          />
        </a>
      </nav>

      {/* Right Controls: My Course button + round profile icon */}
      <div className="nav-r flex items-center gap-3">
        <Link
          to="/my-course"
          className="course-nav-mycourse-btn"
          title="My Enrolled Courses"
        >
          <BookOpen size={16} weight="bold" />
          <span>My Course</span>
        </Link>

        {isLoggedIn ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="course-profile-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#C878BE]/50 bg-[#120613] flex items-center justify-center text-[#E3B8DE] hover:bg-[#C878BE] hover:text-black transition-all shadow-[0_0_20px_rgba(200,120,190,0.25)] shrink-0 cursor-pointer"
              title="Student Profile"
            >
              <User size={17} weight="bold" />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/10 bg-[#0E0610] shadow-2xl py-2 z-[100] overflow-hidden text-left">
                <Link
                  to="/my-course"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-5 py-3 text-left font-sans text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                >
                  <BookOpen size={18} className="text-[#C878BE]" /> My Course
                </Link>
                <Link
                  to="/course/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-5 py-3 text-left font-sans text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                >
                  <User size={18} className="text-[#C878BE]" /> Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowDashboard(false);
                  }}
                  className="w-full px-5 py-3 text-left font-sans text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 cursor-pointer"
                >
                  <BookOpen size={18} className="text-[#C878BE]" /> Course Landing
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-5 py-3 text-left font-sans text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <SignOut size={18} /> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="sign-in-btn"
            onClick={() => setShowCourseLogin(true)}
            title="Sign In"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

// ─── AUTH MODAL ─────────────────────────────────────────────────
function AuthModal({
  showCourseLogin,
  setShowCourseLogin,
  isForgotPassword,
  setIsForgotPassword,
  isForgotOtpStep,
  handleAuthSubmit,
  isOtpStep,
  loginMode,
  setLoginMode,
  fullName,
  setFullName,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  otpValues,
  otpRefs,
  handleOtpChange,
  handleOtpKeyDown,
  error,
  setError,
  isLoading,
  handleToggleMode,
  coursesList = [],
  basePrice = 15000,
  comparePrice = 25000
}) {
  const [activeCourseIdx, setActiveCourseIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!coursesList || coursesList.length <= 1) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setActiveCourseIdx((prev) => (prev + 1) % coursesList.length);
        setIsFading(false);
      }, 350);
    }, 5000);

    return () => clearInterval(interval);
  }, [coursesList]);

  if (!showCourseLogin) return null;

  const currentCourse = (coursesList && coursesList.length > 0)
    ? coursesList[activeCourseIdx]
    : {
        title: 'The Better Man',
        soon: false,
        lede: 'Calm authority, magnetic communication and effortless self-command.',
        inside: [
          '8 HD video modules',
          'Downloadable workbooks and frameworks',
          '3 private 1-on-1 coaching sessions',
          'Lifetime access with all future updates'
        ],
        price: `₹${basePrice.toLocaleString('en-IN')}`,
        was: `₹${comparePrice.toLocaleString('en-IN')}`
      };

  return (
    <div className="auth-modal-scope">
      {/* Floating Close Button */}
      <button
        type="button"
        onClick={() => setShowCourseLogin(false)}
        className="close-btn"
        title="Close"
      >
        <X size={18} />
      </button>

      {/* ── Left Column: Form Section ── */}
      <div className="auth-l">
        <div className="fbox">
          {/* Back Navigation */}
          {isForgotPassword ? (
            <button
              type="button"
              className="back"
              onClick={() => {
                setIsForgotPassword(false);
                setIsForgotOtpStep(false);
                setError('');
              }}
            >
              ← Back to sign in
            </button>
          ) : isOtpStep ? (
            <button
              type="button"
              className="back"
              onClick={() => {
                setError('');
              }}
            >
              ← Back to details
            </button>
          ) : (
            <button
              type="button"
              className="back"
              onClick={() => setShowCourseLogin(false)}
            >
              ← Back to course
            </button>
          )}

          {/* Heading & Subtitle */}
          <h1>
            {isForgotPassword
              ? isForgotOtpStep
                ? 'Set new password'
                : 'Reset your password'
              : isOtpStep
              ? 'Verify your email'
              : loginMode === 'login'
              ? 'Welcome back'
              : 'Create your account'}
          </h1>
          <p className="sm">
            {isForgotPassword
              ? isForgotOtpStep
                ? 'Enter the 4-digit code and your new password.'
                : 'Enter your registered email to receive a reset code.'
              : isOtpStep
              ? `Enter the 4-digit code sent to ${email}`
              : loginMode === 'login'
              ? 'Sign in to continue your masterclass.'
              : 'One account for every masterclass you join.'}
          </p>

          {/* Error Message Box */}
          {error && <div className="err">{error}</div>}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} noValidate>
            {!isOtpStep && !isForgotOtpStep ? (
              <>
                {/* Full Name for Register */}
                {!isForgotPassword && loginMode === 'register' && (
                  <div className="fld">
                    <label htmlFor="reg-fullname">Full Name</label>
                    <input
                      id="reg-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>
                )}

                {/* Email Address */}
                <div className="fld">
                  <label htmlFor="auth-email">Email Address</label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                {/* Password Field */}
                {!isForgotPassword && (
                  <div className="fld">
                    <label htmlFor="auth-password">Password</label>
                    <div className="pw">
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        autoComplete={loginMode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password for Register */}
                {!isForgotPassword && loginMode === 'register' && (
                  <div className="fld">
                    <label htmlFor="auth-cpassword">Confirm Password</label>
                    <div className="pw">
                      <input
                        id="auth-cpassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me & Forgot Password for Login */}
                {!isForgotPassword && loginMode === 'login' && (
                  <div className="row">
                    <label className="chk" style={{ margin: 0 }}>
                      <input type="checkbox" defaultChecked />
                      <span>Keep me signed in</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}



                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn block"
                  style={{ width: '100%' }}
                >
                  {isLoading
                    ? 'Please wait...'
                    : isForgotPassword
                    ? 'Send Reset Code'
                    : loginMode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}{' '}
                  <span aria-hidden="true">→</span>
                </button>
              </>
            ) : (
              /* OTP verification / Forgot Password Reset form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', margin: '8px 0' }}>
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      style={{
                        width: '56px',
                        height: '56px',
                        textAlign: 'center',
                        fontSize: '22px',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        background: '#100B13',
                        border: '1px solid #3A3040',
                        color: '#fff'
                      }}
                    />
                  ))}
                </div>

                {isForgotPassword && isForgotOtpStep && (
                  <>
                    <div className="fld">
                      <label htmlFor="reset-new-pw">New Password</label>
                      <div className="pw">
                        <input
                          id="reset-new-pw"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div className="fld">
                      <label htmlFor="reset-new-cpw">Confirm New Password</label>
                      <div className="pw">
                        <input
                          id="reset-new-cpw"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn block"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {isLoading
                    ? 'Verifying...'
                    : isForgotPassword
                    ? 'Reset Password'
                    : 'Verify Code'}{' '}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </form>

          {/* Alternate Mode Switcher */}
          <p className="alt">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsForgotOtpStep(false);
                  setError('');
                }}
              >
                ← Back to Sign In
              </button>
            ) : loginMode === 'login' ? (
              <>
                New here?{' '}
                <button type="button" onClick={handleToggleMode}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={handleToggleMode}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Right Column: Aesthetic Summary Card ── */}
      <div className="auth-r">
        <div className="orb" aria-hidden="true" />
        <div className="in">
          <h2>
            {isForgotPassword
              ? 'Security & peace of mind.'
              : loginMode === 'login'
              ? 'Pick up where you left off.'
              : 'Your masterclass, ready when you are.'}
          </h2>

          <div className="sum">
            {loginMode === 'login' && !isForgotPassword ? (
              <ul className="ck">
                <li>Continue your modules from the last video</li>
                <li>Book your private sessions with Aarkesh</li>
                <li>Download your workbooks and frameworks</li>
                <li>Lifetime updates with no recurring fees</li>
              </ul>
            ) : isForgotPassword ? (
              <ul className="ck">
                <li>Instant 4-digit verification code to your email</li>
                <li>End-to-end encrypted password restoration</li>
                <li>Resume your learning seamlessly right after</li>
              </ul>
            ) : (
              <>
                <div className={`auth-modal-course-card ${isFading ? 'fading-out' : 'fading-in'}`}>
                  <span
                    className="sticker"
                    style={{
                      background: currentCourse.soon
                        ? 'rgba(255, 255, 255, 0.18)'
                        : 'linear-gradient(135deg, #B04FA6, #6E2266)'
                    }}
                  >
                    {currentCourse.soon ? 'Coming soon' : 'Live now'}
                  </span>
                  <h3>{currentCourse.title}</h3>
                  <p className="l">
                    {currentCourse.lede || currentCourse.d}
                  </p>
                  <ul className="ck">
                    {(currentCourse.inside || [
                      '8 HD video modules',
                      'Downloadable workbooks and frameworks',
                      '3 private 1-on-1 coaching sessions',
                      'Lifetime access with all future updates'
                    ]).map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                  <p className="sprice">
                    Price <b>{currentCourse.price || `₹${basePrice.toLocaleString('en-IN')}`}</b>
                    <s>{currentCourse.was || `₹${comparePrice.toLocaleString('en-IN')}`}</s>
                    <small>(+GST)</small>
                  </p>
                </div>

                {coursesList && coursesList.length > 1 && (
                  <div className="auth-course-dots">
                    {coursesList.map((c, idx) => (
                      <button
                        key={c.slug || idx}
                        type="button"
                        onClick={() => {
                          if (idx === activeCourseIdx) return;
                          setIsFading(true);
                          setTimeout(() => {
                            setActiveCourseIdx(idx);
                            setIsFading(false);
                          }, 250);
                        }}
                        className={`auth-course-dot ${idx === activeCourseIdx ? 'active' : 'inactive'}`}
                        title={c.title}
                        aria-label={`Go to ${c.title}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKOUT OVERLAY ───────────────────────────────────────────
function CheckoutOverlay({ showCheckout, setShowCheckout, checkoutAgreed, setCheckoutAgreed, handlePayment, isLoading, error, onOpenTerms, courseData }) {
  if (!showCheckout) return null;

  const basePrice = courseData?.price !== undefined ? courseData.price : 15000;
  const gstRate = courseData?.gstRate !== undefined ? courseData.gstRate : 18;
  const isGstIncluded = Boolean(courseData?.isGstIncluded);

  const gstAmount = isGstIncluded
    ? Math.round(basePrice - (basePrice / (1 + (gstRate / 100))))
    : Math.round((basePrice * gstRate) / 100);

  const baseBeforeGst = isGstIncluded ? basePrice - gstAmount : basePrice;
  const finalPayable = isGstIncluded ? basePrice : basePrice + gstAmount;

  return (
    <div className="fixed inset-0 z-[110] bg-[#050505] flex flex-col justify-between overflow-y-auto min-h-screen">
      {/* Background Ambience & Spotlights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#C878BE]/12 rounded-full blur-[150px]" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#7A2A70]/12 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#C878BE]/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Bar Navigation */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pt-8 px-6 md:px-10 relative z-20">
        <button
          onClick={() => setShowCheckout(false)}
          className="flex items-center gap-2.5 font-sans text-xs uppercase tracking-[0.2em] text-white/70 hover:text-[#E3B8DE] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> BACK TO COURSE
        </button>

        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <ShieldCheck size={16} className="text-[#C878BE]" />
          <span className="font-sans text-[0.68rem] uppercase tracking-wider text-white/80 font-medium">100% Secure Checkout</span>
        </div>
      </div>

      {/* Center Checkout Card */}
      <div className="w-full max-w-lg mx-auto px-6 py-10 relative z-10 my-auto">
        <div className="text-center mb-8">
          <span className="font-sans text-[0.68rem] uppercase tracking-[0.25em] text-[#E3B8DE] font-semibold block mb-2">
            FINAL STEP
          </span>
          <h1 
            className="text-3xl md:text-4xl text-white font-bold tracking-tight"
            style={{ fontFamily: 'var(--head)' }}
          >
            Checkout Payment
          </h1>
          <p className="font-sans text-xs md:text-sm text-white/60 mt-1.5">
            Complete your enrollment to unlock instant lifetime access.
          </p>
        </div>

        {/* Glassmorphic Payment Summary Card */}
        <div className="rounded-3xl border border-[#C878BE]/30 bg-[#0e0a16]/90 backdrop-blur-2xl p-7 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(200,120,190,0.1)]">
          {/* Item Row */}
          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            <div 
              className="w-16 h-16 rounded-xl overflow-hidden border border-[#C878BE]/40 shrink-0 relative shadow-inner flex items-center justify-center font-bold text-white text-xl"
              style={{
                background: 'radial-gradient(circle at 35% 25%, #6A1B60 0%, #300E32 55%, #0C040E 100%)',
                fontFamily: 'var(--head)'
              }}
            >
              <span>01</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2 py-0.5 rounded-full bg-[#C878BE]/20 border border-[#C878BE]/40 text-[0.65rem] text-[#E3B8DE] font-medium tracking-wide uppercase mb-1">
                Full Master Access
              </span>
              <h3 className="font-sans text-sm font-semibold text-white truncate">The Better Man™</h3>
              <p className="font-sans text-xs text-white/60 truncate">All Modules + 3 Coaching Calls + Community</p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="py-5 space-y-3 border-b border-white/10">
            {gstRate > 0 && (
              <div className="flex justify-between items-center text-xs font-sans text-white/70">
                <span>Course Base Fee</span>
                <span className="font-medium text-white">₹{baseBeforeGst.toLocaleString('en-IN')}</span>
              </div>
            )}
            {gstRate > 0 && (
              <div className="flex justify-between items-center text-xs font-sans text-white/70">
                <div className="flex items-center gap-1.5">
                  <span>GST ({gstRate}%)</span>
                  {isGstIncluded && <span className="text-[10px] text-white/40">(included)</span>}
                  <Info size={13} className="text-white/40" />
                </div>
                <span className="font-medium text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 text-white">
              <div>
                <span className="font-sans text-sm font-bold block text-white">Total Amount Due</span>
                {gstRate > 0 && (
                  <span className="font-sans text-[0.65rem] text-white/50 block">
                    {isGstIncluded ? `Inclusive of all taxes (${gstRate}% GST)` : `Includes ${gstRate}% GST`}
                  </span>
                )}
              </div>
              <span className="font-sans text-2xl md:text-3xl font-bold text-[#E3B8DE] tracking-tight">₹{finalPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-5">
            <label className="flex items-start gap-2.5 cursor-pointer mb-5 group select-none">
              <input
                type="checkbox"
                checked={checkoutAgreed}
                onChange={(e) => setCheckoutAgreed(e.target.checked)}
                className="accent-[#C878BE] rounded w-4 h-4 mt-0.5 cursor-pointer shrink-0"
              />
              <span className="font-sans text-xs text-white/75 leading-relaxed group-hover:text-white transition-colors">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onOpenTerms) onOpenTerms();
                  }}
                  className="underline text-[#E3B8DE] font-semibold hover:text-white transition-colors inline"
                >
                  Terms &amp; Conditions
                </button>
                .
              </span>
            </label>

            {error && (
              <div className="text-red-300 font-sans text-xs mb-4 text-center bg-red-500/15 border border-red-500/30 rounded-xl p-2.5">
                {error}
              </div>
            )}

            {/* CTA Button */}
            <button
              type="button"
              onClick={handlePayment}
              disabled={isLoading || !checkoutAgreed}
              className="w-full rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-4 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white transition-all shadow-[0_0_30px_rgba(200,120,190,0.35)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>{isLoading ? 'PROCESSING...' : `PAY ₹${finalPayable.toLocaleString('en-IN')} & ENROLL NOW`}</span>
              <ArrowRight size={16} weight="bold" />
            </button>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-4 text-[0.7rem] text-white/50 mt-4 font-sans">
              <div className="flex items-center gap-1.5">
                <LockKey size={13} className="text-[#C878BE]" />
                <span>256-bit SSL Encrypted</span>
              </div>
              <span className="text-white/20">•</span>
              <span>Razorpay Verified</span>
              <span className="text-white/20">•</span>
              <span>Instant Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer minimal spacing */}
      <div className="pb-6 text-center text-[0.65rem] text-white/30 font-sans relative z-10">
        Better With Aarkesh • Secure Payment Gateway
      </div>
    </div>
  );
}
