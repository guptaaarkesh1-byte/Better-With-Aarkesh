import React, { useState, useEffect, useRef } from 'react';
import { 
  Desktop, 
  Sparkle, 
  Image as ImageIcon, 
  UploadSimple, 
  FloppyDisk, 
  ArrowClockwise, 
  CheckCircle, 
  WarningCircle, 
  Eye, 
  SlidersHorizontal, 
  ArrowSquareOut, 
  MegaphoneSimple, 
  Kanban, 
  ShieldCheck, 
  Plus, 
  Trash,
  Link as LinkIcon,
  Tag,
  CursorClick,
  SquaresFour,
  Books,
  Question
} from '@phosphor-icons/react';
import { useToast } from '../context/ToastContext';

import { API_URL } from '../utils/apiUrl';

const SIDEBAR_TABS = [
  { 
    id: 'hero', 
    label: 'Hero Section', 
    icon: <Desktop size={18} />, 
    description: 'Main banner, title, badges & action buttons' 
  },
  { 
    id: 'moreCourses', 
    label: 'More Masterclasses', 
    icon: <SquaresFour size={18} />, 
    description: 'Catalog headline & subtitle on homepage' 
  },
  { 
    id: 'allCoursesPage', 
    label: 'All Programs Directory', 
    icon: <Books size={18} />, 
    description: 'Header text & description for /course/all page' 
  },
  { 
    id: 'faq', 
    label: 'FAQ Section', 
    icon: <Question size={18} />, 
    description: 'Headline, subtitle & questions answers list' 
  },
  { 
    id: 'cta', 
    label: 'Final Call to Action', 
    icon: <MegaphoneSimple size={18} />, 
    description: 'Bottom enrollment banner, badges & buttons' 
  },
];

export const DEFAULT_COURSE_LANDING_SECTIONS = {
  hero: {
    tag: 'Learn. Practise. Lead.',
    heading: 'THE *BETTER* MAN',
    headingPrefix: 'THE',
    headingSelected: 'BETTER',
    headingSuffix: 'MAN',
    subheading: 'Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh.',
    proof1Bold: '3 private',
    proof1Text: '1-on-1 sessions with Aarkesh',
    proof2Bold: 'Lifetime',
    proof2Text: 'access, no recurring charges',
    primaryBtnText: 'Register Now',
    showPrimaryBtn: true,
    secondaryBtnText: 'Check Course',
    secondaryBtnLink: '/course/better-man',
    showSecondaryBtn: true,
    navBtnText: 'Check Course',
    navBtnLink: '/course/better-man',
    showNavBtn: true,
    bgImageUrl: '',
    overlayOpacity: 40
  },
  moreCourses: {
    eyebrowText: 'MORE MASTERCLASSES',
    heading: 'More Masterclasses',
    subheading: 'Each one is a standalone course with its own private sessions.',
    viewAllBtnText: 'View All Masterclasses',
    viewAllBtnLink: '/course/all',
    showViewAllBtn: true
  },
  allCoursesPage: {
    tag: 'ALL PROGRAMS',
    heading: 'All Masterclasses & Programs',
    subheading: 'Each masterclass is an intensive, transformative curriculum paired with private 1-on-1 mentorship sessions with Aarkesh.',
    backBtnText: '← Back to overview'
  },
  faq: {
    tag: 'FAQS',
    heading: 'Frequently Asked Questions From Our Students',
    subheading: 'Clear answers about the masterclass, private mentorship, and enrollment.',
    items: [
      { question: 'How long do I have access to the course materials?', answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.' },
      { question: 'How do the 3 free coaching sessions work?', answer: 'Once enrolled, you can book your private 1-on-1 sessions directly with Aarkesh through your course profile dashboard.' },
      { question: 'What format is the course delivered in?', answer: 'High-definition on-demand video masterclasses with actionable workbooks, downloadable frameworks, and direct 1-on-1 coaching.' },
      { question: 'Is this course beginner-friendly?', answer: 'Absolutely. The framework starts from the fundamental psychology of presence and builds step-by-step toward advanced leadership and magnetism.' }
    ]
  },
  cta: {
    label: 'ENROLL TODAY',
    heading: 'Ready To Become The Man People Trust?',
    description: 'Master the psychology of calm authority, magnetic communication and effortless self-command with lifetime curriculum access and 3 private 1-on-1 coaching sessions.',
    badge1: '3 Private Coaching Calls',
    badge2: 'Lifetime Video Access',
    primaryBtnText: 'Register Now',
    exploreBtnText: 'Explore Courses',
    bgImageUrl: ''
  }
};

export const mergeWithDefaults = (storedValue) => {
  const d = DEFAULT_COURSE_LANDING_SECTIONS;
  const mergeSection = (defSec, dataSec) => {
    const res = { ...defSec, ...(dataSec || {}) };
    for (const k of Object.keys(defSec)) {
      if (typeof defSec[k] === 'string' && k !== 'bgImageUrl') {
        if (res[k] === undefined || res[k] === null || (typeof res[k] === 'string' && res[k].trim() === '')) {
          res[k] = defSec[k];
        }
      } else if (typeof defSec[k] === 'boolean') {
        if (res[k] === undefined || res[k] === null) {
          res[k] = defSec[k];
        }
      }
    }
    if (Array.isArray(defSec.items)) {
      if (dataSec && Array.isArray(dataSec.items) && dataSec.items.length > 0) {
        res.items = dataSec.items;
      } else if (!res.items || !Array.isArray(res.items) || res.items.length === 0) {
        res.items = defSec.items;
      }
    }
    return res;
  };

  return {
    hero: mergeSection(d.hero, storedValue?.hero),
    moreCourses: mergeSection(d.moreCourses, storedValue?.moreCourses),
    allCoursesPage: mergeSection(d.allCoursesPage, storedValue?.allCoursesPage),
    faq: mergeSection(d.faq, storedValue?.faq),
    cta: mergeSection(d.cta, storedValue?.cta),
  };
};

// Helper to render headlines with asterisk boxed text: "THE *BETTER* MAN"
export const renderHeadlineWithBox = (text) => {
  if (!text) return null;
  const parts = text.split(/\*([^*]+)\*/g);
  if (parts.length === 1) return <span>{text}</span>;
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <span
          key={index}
          className="relative inline-block px-3.5 py-0.5 mx-1.5 border border-[#C878BE] bg-[#2A0E28] text-white shadow-[0_0_25px_rgba(200,120,190,0.35)] align-baseline font-sans font-extrabold tracking-normal"
          style={{ color: '#ffffff', backgroundColor: '#2A0E28' }}
        >
          <span className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-white border border-[#C878BE] pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white border border-[#C878BE] pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white border border-[#C878BE] pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-white border border-[#C878BE] pointer-events-none" />
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export default function AdminCourseLandingEditor() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('editorTab');
      if (tabFromUrl && ['hero', 'moreCourses', 'allCoursesPage', 'faq', 'cta'].includes(tabFromUrl)) {
        return tabFromUrl;
      }
      const savedTab = localStorage.getItem('bwa_admin_course_editor_tab');
      if (savedTab && ['hero', 'moreCourses', 'allCoursesPage', 'faq', 'cta'].includes(savedTab)) {
        return savedTab;
      }
    } catch (e) {}
    return 'hero';
  });

  useEffect(() => {
    try {
      localStorage.setItem('bwa_admin_course_editor_tab', activeTab);
      const url = new URL(window.location.href);
      url.searchParams.set('editorTab', activeTab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [activeTab]);

  const [settings, setSettings] = useState(DEFAULT_COURSE_LANDING_SECTIONS);
  const [availableCourses, setAvailableCourses] = useState([
    { id: 'better-man', title: 'The Better Man (Primary Masterclass)', link: '/course/better-man' },
    { id: 'scroll-courses', title: '📜 Scroll to "More Masterclasses" Grid', link: '#courses' },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all course landing settings & available courses
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/courses/landing-settings`);
      if (!res.ok) throw new Error('Failed to load course page settings');
      const data = await res.json();
      setSettings(mergeWithDefaults(data));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading course settings');
      setSettings(DEFAULT_COURSE_LANDING_SECTIONS);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses/cards/public`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((c) => ({
            id: c.slug || c._id,
            title: c.title || c.headline || 'Untitled Course',
            link: c.slug ? `/course/${c.slug}` : `/course/better-man`,
          }));
          setAvailableCourses([
            { id: 'better-man', title: 'The Better Man (Primary Masterclass)', link: '/course/better-man' },
            ...mapped.filter(m => m.link !== '/course/better-man'),
            { id: 'scroll-courses', title: '📜 Scroll to "More Masterclasses" Grid', link: '#courses' },
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching available courses for dropdown:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchAvailableCourses();
  }, []);

  const handleFieldChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleHeadingChange = (value) => {
    const match = value.match(/^(.*?)\*([^*]+)\*(.*)$/);
    setSettings((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        heading: value,
        headingPrefix: match ? match[1].trim() : value,
        headingSelected: match ? match[2].trim() : '',
        headingSuffix: match ? match[3].trim() : '',
      }
    }));
  };

  const handleFaqItemChange = (index, field, value) => {
    setSettings((prev) => {
      const newItems = [...(prev.faq?.items || DEFAULT_COURSE_LANDING_SECTIONS.faq.items)];
      newItems[index] = { ...newItems[index], [field]: value };
      return {
        ...prev,
        faq: {
          ...prev.faq,
          items: newItems
        }
      };
    });
  };

  const handleAddFaqItem = () => {
    setSettings((prev) => ({
      ...prev,
      faq: {
        ...prev.faq,
        items: [
          ...(prev.faq?.items || DEFAULT_COURSE_LANDING_SECTIONS.faq.items),
          { question: 'New Question?', answer: 'Detailed answer goes here...' }
        ]
      }
    }));
  };

  const handleRemoveFaqItem = (index) => {
    setSettings((prev) => ({
      ...prev,
      faq: {
        ...prev.faq,
        items: (prev.faq?.items || DEFAULT_COURSE_LANDING_SECTIONS.faq.items).filter((_, i) => i !== index)
      }
    }));
  };

  // Image Upload Handler
  const handleImageUpload = async (file, section, field) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size must be under 2 MB', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingHeroImg(true);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload image');
      const data = await res.json();
      handleFieldChange(section, field, data.url || data.imageUrl);
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Image upload failed', 'error');
    } finally {
      setUploadingHeroImg(false);
    }
  };

  // Save current active section
  const handleSaveSection = async (sectionKey = activeTab) => {
    if (!settings || !settings[sectionKey]) return;
    try {
      setSaving(true);
      setSaveSuccess(false);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/landing-settings/${sectionKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(settings[sectionKey])
      });
      if (!res.ok) throw new Error(`Failed to save ${sectionKey} section`);
      const resData = await res.json();
      if (resData && resData.data) {
        setSettings(prev => ({ ...prev, [sectionKey]: resData.data }));
      }
      setSaveSuccess(true);
      showToast(`✨ ${SIDEBAR_TABS.find(t => t.id === sectionKey)?.label || 'Section'} saved successfully!`, 'success');

      // Cross-tab immediate notification
      try {
        localStorage.setItem('bwa_landing_settings_updated', Date.now().toString());
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('bwa_course_landing_channel');
          bc.postMessage({ section: sectionKey, timestamp: Date.now() });
          setTimeout(() => bc.close(), 500);
        }
      } catch (e) {}

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save section', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Reset section to default
  const handleResetSection = async (sectionKey = activeTab) => {
    if (!window.confirm(`Are you sure you want to reset the "${SIDEBAR_TABS.find(t => t.id === sectionKey)?.label}" to original defaults?`)) {
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/landing-settings/${sectionKey}/reset`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to reset section');
      const data = await res.json();
      setSettings(prev => ({ ...prev, [sectionKey]: data.data }));
      showToast('Section reset to default', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to reset section', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center gap-3 text-stone-500">
        <ArrowClockwise size={24} className="animate-spin text-[#c9542f]" />
        <span>Loading course landing editor...</span>
      </div>
    );
  }

  const currentHero = { ...DEFAULT_COURSE_LANDING_SECTIONS.hero, ...(settings?.hero || {}) };
  const currentMore = { ...DEFAULT_COURSE_LANDING_SECTIONS.moreCourses, ...(settings?.moreCourses || {}) };
  const currentAllCourses = { ...DEFAULT_COURSE_LANDING_SECTIONS.allCoursesPage, ...(settings?.allCoursesPage || {}) };
  const currentFaq = { ...DEFAULT_COURSE_LANDING_SECTIONS.faq, ...(settings?.faq || {}) };
  const currentCta = { ...DEFAULT_COURSE_LANDING_SECTIONS.cta, ...(settings?.cta || {}) };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-[#f5f1e8] text-stone-900 flex flex-col font-sans">
      {/* Top Header Bar */}
      <div className="w-full bg-[#faf7f0] border-b border-black/10 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl md:text-3xl text-stone-900 tracking-wide">Course Page Editor</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#c9542f]/10 text-[#c9542f] border border-[#c9542f]/30 font-bold">
              {SIDEBAR_TABS.find(t => t.id === activeTab)?.label}
            </span>
          </div>
          <p className="font-sans text-xs text-stone-500 mt-1">
            Customize all headline text, badges, action buttons, and background visuals for the Course landing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://aarkeshgupta.com/course"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-stone-50 text-stone-700 hover:text-black text-xs font-semibold border border-stone-300 transition-colors shadow-xs"
          >
            <ArrowSquareOut size={15} />
            <span>View Live Course</span>
          </a>

          <button
            type="button"
            onClick={() => fetchSettings()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-stone-50 text-stone-700 hover:text-black text-xs font-semibold border border-stone-300 transition-colors cursor-pointer shadow-xs"
            title="Reload from server"
          >
            <ArrowClockwise size={15} className={loading ? 'animate-spin' : ''} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveSection(activeTab)}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
              saveSuccess 
                ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                : 'bg-[#c9542f] hover:bg-[#a64117] text-white shadow-[#c9542f]/20'
            }`}
          >
            {saving ? (
              <>
                <ArrowClockwise size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle size={16} weight="fill" />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <FloppyDisk size={16} weight="bold" />
                <span>Save Section</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Sidebar Tabs & Right Form Content */}
      <div className="flex-1 flex flex-col lg:flex-row items-start relative">
        {/* Left Section Sidebar - Sticky on scroll */}
        <aside className="w-full lg:w-72 xl:w-80 bg-[#faf7f0] border-b lg:border-b-0 lg:border-r border-black/10 p-4 sm:p-5 flex flex-col gap-2 shrink-0 lg:sticky lg:top-0 lg:self-start lg:max-h-screen lg:overflow-y-auto">
          <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 px-3 py-1 font-bold">
            PAGE SECTIONS
          </span>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {SIDEBAR_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer whitespace-nowrap lg:whitespace-normal shrink-0 ${
                    isActive
                      ? 'bg-[#c9542f]/10 text-[#c9542f] border border-[#c9542f]/40 shadow-xs ring-1 ring-[#c9542f]/30'
                      : 'bg-white hover:bg-stone-50 text-stone-700 hover:text-black border border-stone-200'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${isActive ? 'bg-[#c9542f]/20 text-[#c9542f]' : 'bg-stone-100 text-stone-500'}`}>
                    {tab.icon}
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-[#c9542f]' : 'text-stone-800'}`}>
                      {tab.label}
                    </h3>
                    <p className="text-[11px] text-stone-500 leading-snug mt-0.5 line-clamp-1 hidden sm:block">
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-stone-200 hidden lg:block">
            <button
              type="button"
              onClick={() => handleResetSection(activeTab)}
              className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-stone-500 hover:text-red-600 hover:bg-red-50 border border-stone-200 hover:border-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer bg-white"
            >
              <ArrowClockwise size={14} />
              <span>Reset Current Section</span>
            </button>
          </div>
        </aside>

        {/* Right Content Editor Form */}
        <main className="flex-1 p-6 sm:p-8 xl:p-10 max-w-5xl overflow-y-auto">
          {/* ═══════════════════════════════════════════════════════════════
             1. HERO SECTION EDITOR
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'hero' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              {/* Section Headline */}
              <div>
                <h2 className="font-serif text-2xl text-stone-900">Hero Section</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Manage the main headline, glowing boxed text, description lede, trust pills, and action CTA buttons.
                </p>
              </div>

              {/* Live Preview Box */}
              <div className="relative rounded-2xl border border-white/10 bg-[#0C060D] p-8 overflow-hidden shadow-2xl preserve-dark">
                <div className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-widest text-[#c79c6e] bg-[#c79c6e]/10 border border-[#c79c6e]/30 px-2.5 py-1 rounded-full font-bold">
                  Live Preview
                </div>
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4 pt-2">
                  <p className="text-xs tracking-[0.2em] uppercase font-bold text-[#E3B8DE]">
                    {currentHero.tag || 'Learn. Practise. Lead.'}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2.5 flex-wrap font-sans">
                    {renderHeadlineWithBox(
                      currentHero.heading !== undefined
                        ? currentHero.heading
                        : (currentHero.headingPrefix || currentHero.headingSelected || currentHero.headingSuffix
                            ? `${currentHero.headingPrefix || ''} *${currentHero.headingSelected || ''}* ${currentHero.headingSuffix || ''}`.replace(/\*\*/g, '').trim()
                            : 'THE *BETTER* MAN')
                    )}
                  </h1>
                  <p className="text-sm text-white/70 leading-relaxed max-w-xl font-normal">
                    {currentHero.subheading || 'Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh.'}
                  </p>

                  <div className="flex items-center justify-center gap-4 flex-wrap text-xs text-white/60 pt-2">
                    <span className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                      <b className="text-white font-bold">{currentHero.proof1Bold || '3 private'}</b> {currentHero.proof1Text || '1-on-1 sessions with Aarkesh'}
                    </span>
                    <span className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                      <b className="text-[#E3B8DE] font-bold">{currentHero.proof2Bold || 'Lifetime'}</b> {currentHero.proof2Text || 'access, no recurring charges'}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
                    {currentHero.showPrimaryBtn !== false && (
                      <button type="button" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#A83B96]/30 cursor-default">
                        {currentHero.primaryBtnText || 'Register Now'} →
                      </button>
                    )}
                    {currentHero.showSecondaryBtn !== false && (
                      <button type="button" className="px-6 py-2.5 rounded-xl bg-white/5 border border-[#C878BE]/40 text-white text-xs font-bold uppercase tracking-wider cursor-default">
                        {currentHero.secondaryBtnText || 'Check Course'} →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields: Eyebrow & Headings */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
                <span className="text-xs font-mono uppercase tracking-widest text-[#c9542f] font-bold flex items-center gap-2">
                  <Tag size={16} /> 1. Headlines &amp; Tagline
                </span>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Eyebrow Tag</label>
                  <input
                    type="text"
                    value={currentHero.tag || DEFAULT_COURSE_LANDING_SECTIONS.hero.tag}
                    onChange={(e) => handleFieldChange('hero', 'tag', e.target.value)}
                    placeholder="Learn. Practise. Lead."
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                  />
                  <span className="text-[11px] text-stone-500">Small purple uppercase headline appearing directly above the main title.</span>
                </div>

                {/* Main Headline with Asterisk Box Support */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-stone-800 font-bold flex items-center gap-1.5">
                      <span>Main Headline</span>
                      <span className="text-[11px] text-[#A83B96] font-normal lowercase tracking-normal">
                        (wrap any word in <code className="bg-[#A83B96]/10 text-[#A83B96] px-1 py-0.5 rounded font-mono font-bold">*word*</code> to box it)
                      </span>
                    </label>

                    {/* Quick insert helper badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = currentHero.heading || DEFAULT_COURSE_LANDING_SECTIONS.hero.heading;
                          handleHeadingChange(currentVal ? `${currentVal} *WORD*` : '*WORD*');
                        }}
                        className="text-[11px] font-semibold text-[#A83B96] bg-[#A83B96]/10 hover:bg-[#A83B96]/20 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-[#A83B96]/30"
                      >
                        + Insert *Boxed Word*
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHeadingChange('THE *BETTER* MAN')}
                        className="text-[11px] text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        Reset: THE *BETTER* MAN
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={currentHero.heading || DEFAULT_COURSE_LANDING_SECTIONS.hero.heading}
                    onChange={(e) => handleHeadingChange(e.target.value)}
                    placeholder="e.g. THE *BETTER* MAN or *LEAD* WITH CALM"
                    className="w-full bg-[#fcfbf8] border-2 border-stone-300 focus:border-[#A83B96] rounded-xl px-4 py-3 text-stone-900 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#A83B96]/20"
                  />

                  {/* Visual Tip helper box */}
                  <div className="p-3.5 bg-[#faf7f0] border border-stone-200 rounded-xl flex items-start gap-2.5 text-xs text-stone-600">
                    <span className="text-[#A83B96] text-base leading-none mt-0.5">✦</span>
                    <div className="leading-relaxed">
                      <b>How to add the signature box:</b> Just add an asterisk <code>*</code> at the beginning and end of any word you want highlighted.
                      <span className="block mt-1.5 text-stone-600">
                        Example: <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-stone-800">THE *BETTER* MAN</code> will render <span className="font-bold text-stone-900">THE</span> <span className="inline-block px-2 py-0.5 border border-[#C878BE] rounded font-bold shadow-xs mx-1 align-baseline text-[11px]" style={{ color: '#ffffff', backgroundColor: '#2A0E28' }}>BETTER</span> <span className="font-bold text-stone-900">MAN</span> on the live website.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Subheading Description</label>
                  <textarea
                    rows={3}
                    value={currentHero.subheading || DEFAULT_COURSE_LANDING_SECTIONS.hero.subheading}
                    onChange={(e) => handleFieldChange('hero', 'subheading', e.target.value)}
                    placeholder="Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh."
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl p-4 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors resize-none font-medium"
                  />
                </div>
              </div>

              {/* Form Fields: Value Proof Highlights */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
                <span className="text-xs font-mono uppercase tracking-widest text-[#c9542f] font-bold flex items-center gap-2">
                  <ShieldCheck size={16} /> 2. Value Proof Badges (Below Subtitle)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Badge 1 */}
                  <div className="p-4 rounded-xl bg-[#faf7f0] border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Badge #1 (Private Sessions)</span>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-stone-600 font-medium">Bold Highlight</label>
                      <input
                        type="text"
                        value={currentHero.proof1Bold || DEFAULT_COURSE_LANDING_SECTIONS.hero.proof1Bold}
                        onChange={(e) => handleFieldChange('hero', 'proof1Bold', e.target.value)}
                        placeholder="3 private"
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#c9542f] font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-stone-600 font-medium">Remaining Text</label>
                      <input
                        type="text"
                        value={currentHero.proof1Text || DEFAULT_COURSE_LANDING_SECTIONS.hero.proof1Text}
                        onChange={(e) => handleFieldChange('hero', 'proof1Text', e.target.value)}
                        placeholder="1-on-1 sessions with Aarkesh"
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#c9542f] font-medium"
                      />
                    </div>
                  </div>

                  {/* Badge 2 */}
                  <div className="p-4 rounded-xl bg-[#faf7f0] border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Badge #2 (Lifetime Access)</span>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-stone-600 font-medium">Bold Highlight</label>
                      <input
                        type="text"
                        value={currentHero.proof2Bold || DEFAULT_COURSE_LANDING_SECTIONS.hero.proof2Bold}
                        onChange={(e) => handleFieldChange('hero', 'proof2Bold', e.target.value)}
                        placeholder="Lifetime"
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#c9542f] font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-stone-600 font-medium">Remaining Text</label>
                      <input
                        type="text"
                        value={currentHero.proof2Text || DEFAULT_COURSE_LANDING_SECTIONS.hero.proof2Text}
                        onChange={(e) => handleFieldChange('hero', 'proof2Text', e.target.value)}
                        placeholder="access, no recurring charges"
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#c9542f] font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields: Call-to-Action Buttons */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
                <span className="text-xs font-mono uppercase tracking-widest text-[#c9542f] font-bold flex items-center gap-2">
                  <CursorClick size={16} /> 3. Hero &amp; Navbar CTA Buttons
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Primary Hero CTA (Register) */}
                  <div className="p-4 rounded-xl bg-[#faf7f0] border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Primary Button</span>
                      <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={currentHero.showPrimaryBtn !== false}
                          onChange={(e) => handleFieldChange('hero', 'showPrimaryBtn', e.target.checked)}
                          className="rounded accent-[#c9542f]"
                        />
                        <span>Visible</span>
                      </label>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-stone-600 font-medium">Button Text</label>
                      <input
                        type="text"
                        value={currentHero.primaryBtnText || DEFAULT_COURSE_LANDING_SECTIONS.hero.primaryBtnText}
                        onChange={(e) => handleFieldChange('hero', 'primaryBtnText', e.target.value)}
                        placeholder="Register Now"
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#c9542f] font-medium"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500">Opens registration / enrollment modal directly.</p>
                  </div>

                  {/* Secondary Hero CTA (Check Course) */}
                  <div className="p-4 rounded-xl bg-[#faf7f0] border border-stone-200 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Secondary Button</span>
                      <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={currentHero.showSecondaryBtn !== false}
                          onChange={(e) => handleFieldChange('hero', 'showSecondaryBtn', e.target.checked)}
                          className="rounded accent-[#c9542f]"
                        />
                        <span>Visible</span>
                      </label>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-stone-600 font-medium">Button Text</label>
                      <input
                        type="text"
                        value={currentHero.secondaryBtnText || DEFAULT_COURSE_LANDING_SECTIONS.hero.secondaryBtnText}
                        onChange={(e) => handleFieldChange('hero', 'secondaryBtnText', e.target.value)}
                        placeholder="Check Course"
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#c9542f] font-medium"
                      />
                    </div>

                    {/* UI Course Dropdown Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-[#A83B96] font-bold flex items-center justify-between">
                        <span>Select Target Course</span>
                        <span className="text-[10px] text-stone-500 font-normal">UI Selector</span>
                      </label>
                      <select
                        value={
                          availableCourses.some(c => c.link === (currentHero.secondaryBtnLink || DEFAULT_COURSE_LANDING_SECTIONS.hero.secondaryBtnLink))
                            ? (currentHero.secondaryBtnLink || DEFAULT_COURSE_LANDING_SECTIONS.hero.secondaryBtnLink)
                            : 'custom'
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== 'custom') {
                            handleFieldChange('hero', 'secondaryBtnLink', val);
                          }
                        }}
                        className="w-full bg-white border-2 border-stone-300 focus:border-[#A83B96] rounded-lg px-3 py-2 text-stone-900 text-xs font-medium focus:outline-none transition-colors cursor-pointer"
                      >
                        <optgroup label="Available Masterclasses">
                          {availableCourses.map((c) => (
                            <option key={c.id} value={c.link}>
                              {c.title}
                            </option>
                          ))}
                        </optgroup>
                        <option value="custom">🔗 Custom Link / External URL...</option>
                      </select>

                      {/* If custom is active or selected, show manual URL field */}
                      {(!availableCourses.some(c => c.link === (currentHero.secondaryBtnLink || DEFAULT_COURSE_LANDING_SECTIONS.hero.secondaryBtnLink)) ||
                        currentHero.secondaryBtnLink === 'custom') && (
                        <div className="mt-1 flex flex-col gap-1">
                          <label className="text-[10px] text-stone-500 font-medium">Custom URL / Path</label>
                          <input
                            type="text"
                            value={currentHero.secondaryBtnLink === 'custom' ? '' : (currentHero.secondaryBtnLink || '')}
                            onChange={(e) => handleFieldChange('hero', 'secondaryBtnLink', e.target.value)}
                            placeholder="e.g. /course/better-man or https://..."
                            className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 text-xs focus:outline-none focus:border-[#c9542f]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navbar CTA Button */}
                  <div className="p-4 rounded-xl bg-[#faf7f0] border border-stone-200 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Navbar Top CTA</span>
                      <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={currentHero.showNavBtn !== false}
                          onChange={(e) => handleFieldChange('hero', 'showNavBtn', e.target.checked)}
                          className="rounded accent-[#c9542f]"
                        />
                        <span>Visible</span>
                      </label>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-stone-600 font-medium">Button Text</label>
                      <input
                        type="text"
                        value={currentHero.navBtnText || DEFAULT_COURSE_LANDING_SECTIONS.hero.navBtnText}
                        onChange={(e) => handleFieldChange('hero', 'navBtnText', e.target.value)}
                        placeholder="Check Course"
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#c9542f] font-medium"
                      />
                    </div>

                    {/* UI Course Dropdown Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-[#A83B96] font-bold flex items-center justify-between">
                        <span>Select Target Course</span>
                        <span className="text-[10px] text-stone-500 font-normal">UI Selector</span>
                      </label>
                      <select
                        value={
                          availableCourses.some(c => c.link === (currentHero.navBtnLink || DEFAULT_COURSE_LANDING_SECTIONS.hero.navBtnLink))
                            ? (currentHero.navBtnLink || DEFAULT_COURSE_LANDING_SECTIONS.hero.navBtnLink)
                            : 'custom'
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== 'custom') {
                            handleFieldChange('hero', 'navBtnLink', val);
                          }
                        }}
                        className="w-full bg-white border-2 border-stone-300 focus:border-[#A83B96] rounded-lg px-3 py-2 text-stone-900 text-xs font-medium focus:outline-none transition-colors cursor-pointer"
                      >
                        <optgroup label="Available Masterclasses">
                          {availableCourses.map((c) => (
                            <option key={c.id} value={c.link}>
                              {c.title}
                            </option>
                          ))}
                        </optgroup>
                        <option value="custom">🔗 Custom Link / External URL...</option>
                      </select>

                      {/* If custom is active, show manual URL field */}
                      {(!availableCourses.some(c => c.link === (currentHero.navBtnLink || DEFAULT_COURSE_LANDING_SECTIONS.hero.navBtnLink)) ||
                        currentHero.navBtnLink === 'custom') && (
                        <div className="mt-1 flex flex-col gap-1">
                          <label className="text-[10px] text-stone-500 font-medium">Custom URL / Path</label>
                          <input
                            type="text"
                            value={currentHero.navBtnLink === 'custom' ? '' : (currentHero.navBtnLink || '')}
                            onChange={(e) => handleFieldChange('hero', 'navBtnLink', e.target.value)}
                            placeholder="e.g. /course/better-man or https://..."
                            className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 text-xs focus:outline-none focus:border-[#c9542f]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
             2. MORE MASTERCLASSES SECTION EDITOR
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'moreCourses' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">More Masterclasses Section</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Control the section title and subtitle description directly appearing above the masterclasses card catalog.
                </p>
              </div>


              {/* Form Fields: Heading & Subtitle */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#c9542f] font-bold">
                    Section Headlines
                  </span>
                  <a
                    href="/admin/course-control"
                    className="flex items-center gap-1.5 text-xs text-[#c9542f] hover:underline font-semibold"
                  >
                    <span>Manage Masterclass Cards &amp; Pricing →</span>
                  </a>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Section Heading</label>
                  <input
                    type="text"
                    value={currentMore.heading || DEFAULT_COURSE_LANDING_SECTIONS.moreCourses.heading}
                    onChange={(e) => handleFieldChange('moreCourses', 'heading', e.target.value)}
                    placeholder="More Masterclasses"
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Subtitle / Lead Description</label>
                  <textarea
                    rows={2}
                    value={currentMore.subheading || DEFAULT_COURSE_LANDING_SECTIONS.moreCourses.subheading}
                    onChange={(e) => handleFieldChange('moreCourses', 'subheading', e.target.value)}
                    placeholder="Each one is a standalone course with its own private sessions."
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl p-4 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors resize-none font-medium"
                  />
                </div>

                {/* View All Button Controls */}
                <div className="pt-4 border-t border-stone-200 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                        Bottom "View All Masterclasses" Button
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Control the catalog button appearing below the 3 masterclasses cards grid.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentMore.showViewAllBtn !== false}
                        onChange={(e) => handleFieldChange('moreCourses', 'showViewAllBtn', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9542f]"></div>
                    </label>
                  </div>

                  {currentMore.showViewAllBtn !== false && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Button Label Text</label>
                        <input
                          type="text"
                          value={currentMore.viewAllBtnText || DEFAULT_COURSE_LANDING_SECTIONS.moreCourses.viewAllBtnText}
                          onChange={(e) => handleFieldChange('moreCourses', 'viewAllBtnText', e.target.value)}
                          placeholder="View All Masterclasses"
                          className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Button Destination Link</label>
                        <input
                          type="text"
                          value={currentMore.viewAllBtnLink || '/course/all'}
                          onChange={(e) => handleFieldChange('moreCourses', 'viewAllBtnLink', e.target.value)}
                          placeholder="/course/all"
                          className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
             3. ALL PROGRAMS / CATALOG DIRECTORY (/course/all) EDITOR
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'allCoursesPage' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">All Programs Directory Page</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Customize the title, top eyebrow badge, lead description, and back navigation text shown on the dedicated /course/all directory page.
                </p>
              </div>

              {/* Live Preview Box */}
              <div className="relative rounded-2xl border border-white/10 bg-[#0C060D] p-8 overflow-hidden shadow-2xl preserve-dark">
                <div className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-widest text-[#c79c6e] bg-[#c79c6e]/10 border border-[#c79c6e]/30 px-2.5 py-1 rounded-full font-bold">
                  Live Preview
                </div>
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4 pt-2">
                  <div className="self-start">
                    <span className="text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                      {currentAllCourses.backBtnText || DEFAULT_COURSE_LANDING_SECTIONS.allCoursesPage.backBtnText}
                    </span>
                  </div>
                  <p className="text-xs tracking-[0.2em] uppercase font-bold text-[#E3B8DE]">
                    {renderHeadlineWithBox(currentAllCourses.tag || DEFAULT_COURSE_LANDING_SECTIONS.allCoursesPage.tag)}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2.5 flex-wrap font-sans">
                    {renderHeadlineWithBox(currentAllCourses.heading || DEFAULT_COURSE_LANDING_SECTIONS.allCoursesPage.heading)}
                  </h1>
                  <p className="text-sm text-white/70 leading-relaxed max-w-xl font-normal">
                    {currentAllCourses.subheading || DEFAULT_COURSE_LANDING_SECTIONS.allCoursesPage.subheading}
                  </p>
                </div>
              </div>

              {/* Form Fields: Tag, Heading, Subheading, Back Button */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#c9542f] font-bold">
                    Directory Header Content
                  </span>
                  <a
                    href="https://aarkeshgupta.com/course/all"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#c9542f] hover:underline font-semibold"
                  >
                    <span>View /course/all Live Page →</span>
                  </a>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Eyebrow Tag Badge</label>
                  <input
                    type="text"
                    value={currentAllCourses.tag || DEFAULT_COURSE_LANDING_SECTIONS.allCoursesPage.tag}
                    onChange={(e) => handleFieldChange('allCoursesPage', 'tag', e.target.value)}
                    placeholder="ALL PROGRAMS"
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-stone-800 font-bold flex items-center gap-1.5">
                      <span>Main Heading</span>
                      <span className="text-[11px] text-[#A83B96] font-normal lowercase tracking-normal">
                        (wrap any word in <code className="bg-[#A83B96]/10 text-[#A83B96] px-1 py-0.5 rounded font-mono font-bold">*word*</code> to box it)
                      </span>
                    </label>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = currentAllCourses.heading || DEFAULT_COURSE_LANDING_SECTIONS.allCoursesPage.heading;
                          handleFieldChange('allCoursesPage', 'heading', currentVal ? `${currentVal} *PROGRAMS*` : '*PROGRAMS*');
                        }}
                        className="text-[11px] font-semibold text-[#A83B96] bg-[#A83B96]/10 hover:bg-[#A83B96]/20 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-[#A83B96]/30"
                      >
                        + Insert *Boxed Word*
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldChange('allCoursesPage', 'heading', DEFAULT_COURSE_LANDING_SECTIONS.allCoursesPage.heading)}
                        className="text-[11px] text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        Reset Default
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={currentAllCourses.heading || DEFAULT_COURSE_LANDING_SECTIONS.allCoursesPage.heading}
                    onChange={(e) => handleFieldChange('allCoursesPage', 'heading', e.target.value)}
                    placeholder="All Masterclasses & Programs"
                    className="w-full bg-[#fcfbf8] border-2 border-stone-300 focus:border-[#A83B96] rounded-xl px-4 py-3 text-stone-900 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#A83B96]/20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Subtitle / Description</label>
                  <textarea
                    rows={3}
                    value={currentAllCourses.subheading || DEFAULT_COURSE_LANDING_SECTIONS.allCoursesPage.subheading}
                    onChange={(e) => handleFieldChange('allCoursesPage', 'subheading', e.target.value)}
                    placeholder="Each masterclass is an intensive, transformative curriculum paired with private 1-on-1 mentorship sessions with Aarkesh."
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl p-4 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors resize-none font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Back Button Text</label>
                  <input
                    type="text"
                    value={currentAllCourses.backBtnText || DEFAULT_COURSE_LANDING_SECTIONS.allCoursesPage.backBtnText}
                    onChange={(e) => handleFieldChange('allCoursesPage', 'backBtnText', e.target.value)}
                    placeholder="← Back to overview"
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
             4. FAQ SECTION EDITOR
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'faq' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">FAQ Section</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Customize the headline, subtitle, and managing all questions and answers shown in the student FAQ section.
                </p>
              </div>

              {/* Section Header Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#c9542f] font-bold">
                    FAQ Section Headlines
                  </span>
                  <span className="text-xs text-stone-500">
                    Wrap any tag/word in asterisks (e.g. *FAQS*) for boxed glow styling
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Eyebrow Tag Badge</label>
                    <input
                      type="text"
                      value={currentFaq.tag || DEFAULT_COURSE_LANDING_SECTIONS.faq.tag}
                      onChange={(e) => handleFieldChange('faq', 'tag', e.target.value)}
                      placeholder="FAQS"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Section Main Heading</label>
                    <input
                      type="text"
                      value={currentFaq.heading || DEFAULT_COURSE_LANDING_SECTIONS.faq.heading}
                      onChange={(e) => handleFieldChange('faq', 'heading', e.target.value)}
                      placeholder="Frequently Asked Questions From Our Students"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={currentFaq.subheading || DEFAULT_COURSE_LANDING_SECTIONS.faq.subheading}
                    onChange={(e) => handleFieldChange('faq', 'subheading', e.target.value)}
                    placeholder="Clear answers about the masterclass, private mentorship, and enrollment."
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl p-4 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors resize-none font-medium"
                  />
                </div>
              </div>

              {/* Questions & Answers List */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[#c9542f] font-bold">
                      Questions &amp; Answers ({(currentFaq.items || DEFAULT_COURSE_LANDING_SECTIONS.faq.items).length})
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Add, edit, or remove FAQ questions displayed on the live course page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaqItem}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c9542f] hover:bg-[#a64117] text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus size={15} weight="bold" />
                    <span>Add New Question</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(currentFaq.items || DEFAULT_COURSE_LANDING_SECTIONS.faq.items).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#faf7f0] border border-stone-200 flex flex-col gap-3 relative shadow-2xs hover:border-stone-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#c9542f] px-2.5 py-0.5 rounded bg-[#c9542f]/10 border border-[#c9542f]/20">
                          Q{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaqItem(idx)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Delete FAQ"
                        >
                          <Trash size={16} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Question</label>
                        <input
                          type="text"
                          value={item.question || ''}
                          onChange={(e) => handleFaqItemChange(idx, 'question', e.target.value)}
                          placeholder="e.g. How long do I have access to the course?"
                          className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-stone-900 text-sm font-semibold focus:outline-none focus:border-[#c9542f]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Answer</label>
                        <textarea
                          rows={3}
                          value={item.answer || ''}
                          onChange={(e) => handleFaqItemChange(idx, 'answer', e.target.value)}
                          placeholder="Detailed answer for students..."
                          className="w-full bg-white border border-stone-300 rounded-xl p-3.5 text-stone-800 text-xs font-normal focus:outline-none focus:border-[#c9542f] resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
             5. FINAL CALL TO ACTION (CTA) SECTION EDITOR
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'cta' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">Final Call to Action (CTA)</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Customize the bottom enrollment banner, badges, copy, and button text before the footer.
                </p>
              </div>

              {/* Live Preview Box */}
              <div className="relative rounded-2xl border border-white/10 bg-[#0C060D] p-8 overflow-hidden shadow-2xl preserve-dark">
                <div className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-widest text-[#c79c6e] bg-[#c79c6e]/10 border border-[#c79c6e]/30 px-2.5 py-1 rounded-full font-bold">
                  Live Preview
                </div>
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3 pt-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#E3B8DE]">
                    {currentCta.label || DEFAULT_COURSE_LANDING_SECTIONS.cta.label}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white">
                    {currentCta.heading || DEFAULT_COURSE_LANDING_SECTIONS.cta.heading}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed max-w-xl">
                    {currentCta.description || DEFAULT_COURSE_LANDING_SECTIONS.cta.description}
                  </p>

                  <div className="flex items-center justify-center gap-3 flex-wrap text-xs text-white/60 pt-1">
                    <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[11px] text-white font-medium">
                      ✓ {currentCta.badge1 || DEFAULT_COURSE_LANDING_SECTIONS.cta.badge1}
                    </span>
                    <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[11px] text-white font-medium">
                      ✓ {currentCta.badge2 || DEFAULT_COURSE_LANDING_SECTIONS.cta.badge2}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
                    <button type="button" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A83B96] to-[#7A2A70] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#A83B96]/30 cursor-default">
                      {currentCta.primaryBtnText || DEFAULT_COURSE_LANDING_SECTIONS.cta.primaryBtnText} →
                    </button>
                    <button type="button" className="px-6 py-2.5 rounded-xl bg-white/5 border border-[#C878BE]/40 text-white text-xs font-bold uppercase tracking-wider cursor-default">
                      {currentCta.exploreBtnText || DEFAULT_COURSE_LANDING_SECTIONS.cta.exploreBtnText} →
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Eyebrow Label</label>
                  <input
                    type="text"
                    value={currentCta.label || DEFAULT_COURSE_LANDING_SECTIONS.cta.label}
                    onChange={(e) => handleFieldChange('cta', 'label', e.target.value)}
                    placeholder="ENROLL TODAY"
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Main Heading</label>
                  <input
                    type="text"
                    value={currentCta.heading || DEFAULT_COURSE_LANDING_SECTIONS.cta.heading}
                    onChange={(e) => handleFieldChange('cta', 'heading', e.target.value)}
                    placeholder="Ready To Become The Man People Trust?"
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Description</label>
                  <textarea
                    rows={3}
                    value={currentCta.description || DEFAULT_COURSE_LANDING_SECTIONS.cta.description}
                    onChange={(e) => handleFieldChange('cta', 'description', e.target.value)}
                    placeholder="Master the psychology of calm authority, magnetic communication and effortless self-command with lifetime curriculum access and 3 private 1-on-1 coaching sessions."
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl p-4 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors resize-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Badge 1 Text</label>
                    <input
                      type="text"
                      value={currentCta.badge1 || DEFAULT_COURSE_LANDING_SECTIONS.cta.badge1}
                      onChange={(e) => handleFieldChange('cta', 'badge1', e.target.value)}
                      placeholder="3 Private Coaching Calls"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Badge 2 Text</label>
                    <input
                      type="text"
                      value={currentCta.badge2 || DEFAULT_COURSE_LANDING_SECTIONS.cta.badge2}
                      onChange={(e) => handleFieldChange('cta', 'badge2', e.target.value)}
                      placeholder="Lifetime Video Access"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Register Button Label</label>
                    <input
                      type="text"
                      value={currentCta.primaryBtnText || DEFAULT_COURSE_LANDING_SECTIONS.cta.primaryBtnText}
                      onChange={(e) => handleFieldChange('cta', 'primaryBtnText', e.target.value)}
                      placeholder="Register Now"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-stone-700 font-bold">Explore Button Label</label>
                    <input
                      type="text"
                      value={currentCta.exploreBtnText || DEFAULT_COURSE_LANDING_SECTIONS.cta.exploreBtnText}
                      onChange={(e) => handleFieldChange('cta', 'exploreBtnText', e.target.value)}
                      placeholder="Explore Courses"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#c9542f] transition-colors font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
