import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import {
  Faders,
  Sparkle,
  FloppyDisk,
  ArrowClockwise,
  ArrowSquareOut,
  Desktop,
  List,
  FolderOpen,
  Question,
  MegaphoneSimple,
  Plus,
  Minus,
  Trash,
  TextT,
  Info,
  CheckSquareOffset,
  Square,
  Lightning,
  ArrowCounterClockwise,
  CheckCircle,
  Eye,
  Clock,
  Users
} from '@phosphor-icons/react';
import { API_URL } from '../utils/apiUrl';

// Left Sidebar Sections for Course Landing Page
export const COURSE_CATALOG_TABS = [
  {
    id: 'masterTypography',
    label: 'Master Font Studio',
    icon: <Faders size={18} weight="bold" />,
    description: 'Universal font size control for all course sections',
    badge: 'MASTER',
  },
  {
    id: 'hero',
    label: 'Hero Banner',
    icon: <Desktop size={18} />,
    description: 'Main title, proof points & buttons',
  },
  {
    id: 'moreCourses',
    label: 'More Masterclasses',
    icon: <List size={18} />,
    description: 'Catalog grid title & subtitle',
  },
  {
    id: 'allCoursesPage',
    label: 'All Programs Page',
    icon: <FolderOpen size={18} />,
    description: 'Header for /course/all page',
  },
  {
    id: 'faq',
    label: 'FAQ Section',
    icon: <Question size={18} />,
    description: 'Frequently asked questions',
  },
  {
    id: 'cta',
    label: 'Final Call to Action',
    icon: <MegaphoneSimple size={18} />,
    description: 'Bottom enrollment banner',
  },
];

export const TARGET_COURSE_SECTIONS = [
  { id: 'hero', name: 'Hero Banner', desc: 'Main headline, proof points & CTAs' },
  { id: 'moreCourses', name: 'More Masterclasses', desc: 'Catalog grid headline & subtitle' },
  { id: 'allCoursesPage', name: 'All Programs Page', desc: 'Header for /course/all directory' },
  { id: 'faq', name: 'FAQ Section', desc: 'Questions accordion titles & answers' },
  { id: 'cta', name: 'Final Call to Action', desc: 'Enrollment banner headline & badges' },
];

// Helper to render headlines with asterisk boxed text: "THE *BETTER* MAN"
export const renderCourseHeadline = (text) => {
  if (!text) return null;
  const parts = text.split(/\*([^*]+)\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <span
          key={index}
          className="border border-[#c878be]/70 px-2 py-0.5 rounded bg-[#3d1b37]/60 text-[#f3a8e2] font-semibold mx-1"
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

export default function AdminCourseLandingCatalogEditor() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('masterTypography');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Master Font Studio Universal State
  const [masterEyebrowSize, setMasterEyebrowSize] = useState(14);
  const [masterHeadingSize, setMasterHeadingSize] = useState(54);
  const [masterDescriptionSize, setMasterDescriptionSize] = useState(17);
  const [masterButtonSize, setMasterButtonSize] = useState(14);
  const [masterPreviewTab, setMasterPreviewTab] = useState('hero'); // 'hero' | 'moreCourses' | 'allCoursesPage' | 'faq' | 'cta'
  const [selectedTargetSections, setSelectedTargetSections] = useState([
    'hero',
    'moreCourses',
    'allCoursesPage',
    'faq',
    'cta',
  ]);

  // Existing Courses List for Redirect Dropdown
  const [coursesList, setCoursesList] = useState([
    { slug: 'better-man', title: 'The Better Man' },
    { slug: 'authority-engine', title: 'Authority Engine' },
    { slug: 'boundary-mastery', title: 'Boundary Mastery' },
    { slug: 'decisions', title: 'Decision Architecture' }
  ]);

  const fetchCoursesList = async () => {
    try {
      const detailsRes = await fetch(`${API_URL}/api/courses/details-settings`);
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        const list = Object.keys(detailsData).map((slug) => ({
          slug,
          title: detailsData[slug]?.hero?.heading || detailsData[slug]?.title || slug
        }));
        if (list.length > 0) {
          setCoursesList(list);
          return;
        }
      }
      const cardsRes = await fetch(`${API_URL}/api/courses/cards/public`);
      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        if (Array.isArray(cardsData) && cardsData.length > 0) {
          setCoursesList(
            cardsData.map((c) => ({
              slug: c.slug || c._id,
              title: c.title || c.heading || c.slug
            }))
          );
        }
      }
    } catch (err) {
      console.error('Error fetching courses list for dropdown:', err);
    }
  };

  // Fetch Settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/courses/landing-settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings({
          masterTypography: data.masterTypography || {
            masterEyebrowSize: 14,
            masterHeadingSize: 54,
            masterDescriptionSize: 17,
            masterButtonSize: 14,
          },
          hero: data.hero || {
            tag: 'Learn. Practise. Lead.',
            tagSize: 14,
            heading: 'THE *BETTER* MAN',
            headingSize: 56,
            headingPrefix: 'THE',
            headingSelected: 'BETTER',
            headingSuffix: 'MAN',
            subheading: 'Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh.',
            subheadingSize: 18,
            proof1Bold: '3 private',
            proof1Text: '1-on-1 sessions with Aarkesh',
            proof2Bold: 'Lifetime',
            proof2Text: 'access, no recurring charges',
            proofSize: 14,
            primaryBtnText: 'Register Now',
            showPrimaryBtn: true,
            secondaryBtnText: 'Check Course',
            secondaryBtnLink: '/course/better-man',
            showSecondaryBtn: true,
            buttonSize: 14,
            bgImageUrl: '',
            overlayOpacity: 40,
          },
          moreCourses: data.moreCourses || {
            eyebrowText: 'MORE MASTERCLASSES',
            eyebrowSize: 14,
            heading: 'More Masterclasses',
            headingSize: 44,
            subheading: 'Each one is a standalone course with its own private sessions.',
            subheadingSize: 16,
            viewAllBtnText: 'View All Masterclasses',
            viewAllBtnLink: '/course/all',
            showViewAllBtn: true,
            buttonSize: 14,
          },
          allCoursesPage: data.allCoursesPage || {
            tag: 'ALL PROGRAMS',
            tagSize: 14,
            heading: 'All Masterclasses & Programs',
            headingSize: 48,
            subheading: 'Each masterclass is an intensive, transformative curriculum paired with private 1-on-1 mentorship sessions with Aarkesh.',
            subheadingSize: 16,
            backBtnText: '← Back to overview',
            buttonSize: 14,
          },
          faq: data.faq || {
            tag: 'FAQS',
            tagSize: 14,
            heading: 'Frequently Asked Questions From Our Students',
            headingSize: 40,
            subheading: 'Clear answers about the masterclass, private mentorship, and enrollment.',
            subheadingSize: 16,
            questionSize: 17,
            answerSize: 15,
            items: [
              { question: 'How long do I have access to the course materials?', answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.' },
              { question: 'How do the 3 free coaching sessions work?', answer: 'Once enrolled, you can book your private 1-on-1 sessions directly with Aarkesh through your course profile dashboard.' },
            ],
          },
          cta: data.cta || {
            label: 'ENROLL TODAY',
            labelSize: 14,
            heading: 'Ready To Become The Man People Trust?',
            headingSize: 48,
            description: 'Master the psychology of calm authority, magnetic communication and effortless self-command with lifetime curriculum access and 3 private 1-on-1 coaching sessions.',
            descriptionSize: 17,
            badge1: '3 Private Coaching Calls',
            badge2: 'Lifetime Video Access',
            badgeSize: 13,
            primaryBtnText: 'Register Now',
            exploreBtnText: 'Explore Courses',
            buttonSize: 15,
            bgImageUrl: '',
          },
        });

        if (data.masterTypography) {
          setMasterEyebrowSize(data.masterTypography.masterEyebrowSize || 14);
          setMasterHeadingSize(data.masterTypography.masterHeadingSize || 54);
          setMasterDescriptionSize(data.masterTypography.masterDescriptionSize || 17);
          setMasterButtonSize(data.masterTypography.masterButtonSize || 14);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load course catalog settings', 'error');
    } finally {
      setLoading(false);
      setDirty(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCoursesList();
  }, []);

  const updateField = (path, val) => {
    setSettings((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      const keys = path.split('.');
      const last = keys.pop();
      let target = copy;
      keys.forEach((k) => {
        if (!target[k]) target[k] = {};
        target = target[k];
      });
      target[last] = val;
      return copy;
    });
    setDirty(true);
  };

  // Immediate Universal Font Sync across selected sections
  const updateMasterSizes = (newEyebrow, newHeading, newDesc, newBtn, targets = selectedTargetSections) => {
    const eb = newEyebrow !== undefined ? newEyebrow : masterEyebrowSize;
    const hd = newHeading !== undefined ? newHeading : masterHeadingSize;
    const ds = newDesc !== undefined ? newDesc : masterDescriptionSize;
    const bt = newBtn !== undefined ? newBtn : masterButtonSize;

    if (newEyebrow !== undefined) setMasterEyebrowSize(eb);
    if (newHeading !== undefined) setMasterHeadingSize(hd);
    if (newDesc !== undefined) setMasterDescriptionSize(ds);
    if (newBtn !== undefined) setMasterButtonSize(bt);

    setSettings((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      copy.masterTypography = {
        masterEyebrowSize: eb,
        masterHeadingSize: hd,
        masterDescriptionSize: ds,
        masterButtonSize: bt,
      };

      if (targets.includes('hero')) {
        copy.hero = {
          ...copy.hero,
          tagSize: eb,
          headingSize: hd,
          subheadingSize: ds,
          proofSize: Math.max(12, eb - 1),
          buttonSize: bt,
        };
      }
      if (targets.includes('moreCourses')) {
        copy.moreCourses = {
          ...copy.moreCourses,
          eyebrowSize: eb,
          headingSize: Math.round(hd * 0.82),
          subheadingSize: Math.max(14, ds - 1),
          buttonSize: bt,
        };
      }
      if (targets.includes('allCoursesPage')) {
        copy.allCoursesPage = {
          ...copy.allCoursesPage,
          tagSize: eb,
          headingSize: Math.round(hd * 0.88),
          subheadingSize: Math.max(14, ds - 1),
          buttonSize: bt,
        };
      }
      if (targets.includes('faq')) {
        copy.faq = {
          ...copy.faq,
          tagSize: eb,
          headingSize: Math.round(hd * 0.74),
          subheadingSize: Math.max(14, ds - 1),
          questionSize: ds,
          answerSize: Math.max(13, ds - 2),
        };
      }
      if (targets.includes('cta')) {
        copy.cta = {
          ...copy.cta,
          labelSize: eb,
          headingSize: Math.round(hd * 0.88),
          descriptionSize: ds,
          badgeSize: Math.max(11, eb - 1),
          buttonSize: bt,
        };
      }

      return copy;
    });
    setDirty(true);
  };

  // Toggle Target Section for Master Font Sync
  const toggleTargetSection = (id) => {
    const next = selectedTargetSections.includes(id)
      ? selectedTargetSections.filter((s) => s !== id)
      : [...selectedTargetSections, id];
    setSelectedTargetSections(next);
    updateMasterSizes(masterEyebrowSize, masterHeadingSize, masterDescriptionSize, masterButtonSize, next);
  };

  const handleSelectAllSections = () => {
    const all = TARGET_COURSE_SECTIONS.map((s) => s.id);
    setSelectedTargetSections(all);
    updateMasterSizes(masterEyebrowSize, masterHeadingSize, masterDescriptionSize, masterButtonSize, all);
  };

  const handleDeselectAllSections = () => {
    setSelectedTargetSections([]);
  };

  // Explicit Apply Master Typography Button (with Toast)
  const handleApplyMasterTypography = () => {
    if (selectedTargetSections.length === 0) {
      addToast('Please select at least 1 section to apply master font sizes.', 'warning');
      return;
    }
    updateMasterSizes(masterEyebrowSize, masterHeadingSize, masterDescriptionSize, masterButtonSize);
    addToast(
      `Synchronized font sizes across ${selectedTargetSections.length} course section(s)! Click Save to persist.`,
      'success'
    );
  };

  // Helper to retrieve current live font sizes for a section
  const getSectionLiveSizes = (secId) => {
    if (!settings) return { tag: 14, head: 56, sub: 18, btn: 14 };
    switch (secId) {
      case 'hero':
        return {
          tag: settings.hero?.tagSize || 14,
          head: settings.hero?.headingSize || 56,
          sub: settings.hero?.subheadingSize || 18,
          btn: settings.hero?.buttonSize || 14,
        };
      case 'moreCourses':
        return {
          tag: settings.moreCourses?.eyebrowSize || 14,
          head: settings.moreCourses?.headingSize || 44,
          sub: settings.moreCourses?.subheadingSize || 16,
          btn: settings.moreCourses?.buttonSize || 14,
        };
      case 'allCoursesPage':
        return {
          tag: settings.allCoursesPage?.tagSize || 14,
          head: settings.allCoursesPage?.headingSize || 48,
          sub: settings.allCoursesPage?.subheadingSize || 16,
          btn: settings.allCoursesPage?.buttonSize || 14,
        };
      case 'faq':
        return {
          tag: settings.faq?.tagSize || 14,
          head: settings.faq?.headingSize || 40,
          sub: settings.faq?.questionSize || 17,
          btn: settings.faq?.answerSize || 15,
        };
      case 'cta':
        return {
          tag: settings.cta?.labelSize || 14,
          head: settings.cta?.headingSize || 48,
          sub: settings.cta?.descriptionSize || 17,
          btn: settings.cta?.buttonSize || 15,
        };
      default:
        return { tag: 14, head: 56, sub: 18, btn: 14 };
    }
  };

  // Save All Settings to Backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      await Promise.all([
        fetch(`${API_URL}/api/courses/landing-settings/hero`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(settings.hero),
        }),
        fetch(`${API_URL}/api/courses/landing-settings/moreCourses`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(settings.moreCourses),
        }),
        fetch(`${API_URL}/api/courses/landing-settings/allCoursesPage`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(settings.allCoursesPage),
        }),
        fetch(`${API_URL}/api/courses/landing-settings/faq`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(settings.faq),
        }),
        fetch(`${API_URL}/api/courses/landing-settings/cta`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(settings.cta),
        }),
      ]);

      try {
        localStorage.setItem('bwa_course_landing_settings_cache', JSON.stringify(settings));
      } catch {}

      setDirty(false);
      addToast('Course catalog settings and font sizes saved successfully!', 'success');
    } catch (err) {
      console.error('Save error:', err);
      addToast('Error saving catalog settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-600 font-mono text-sm">
          <span className="w-5 h-5 border-2 border-[#c9542f] border-t-transparent rounded-full animate-spin" />
          <span>Loading course landing editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#111010] font-sans pb-24">
      {/* Top Header Bar */}
      <div className="border-b border-black/10 bg-[#faf7f0]/95 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-[#c9542f] uppercase bg-[#c9542f]/10 border border-[#c9542f]/30 px-2.5 py-0.5 rounded-full">
              COURSE SECTION
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-600 text-xs font-medium">Landing Page Studio</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 font-normal mt-1">
            Course Catalog Page Editor (/course)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              fetchSettings();
              addToast('Refreshed latest data', 'info');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 hover:text-black text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs"
          >
            <ArrowClockwise size={14} /> Reload
          </button>
          <a
            href="http://localhost:5173/course"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c9542f]/10 border border-[#c9542f]/30 hover:bg-[#c9542f]/20 text-[#c9542f] text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            <ArrowSquareOut size={14} /> View /course page
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c9542f] hover:bg-[#a64117] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-[#c9542f]/20 disabled:opacity-50 cursor-pointer"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>{saving ? 'Saving...' : activeTab === 'masterTypography' ? 'Apply & Save All' : 'Save Section'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Sidebar + Right Editor Body */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto items-start">
        
        {/* ─── LEFT SIDEBAR TABS (STICKY) ─── */}
        <aside className="w-full md:w-72 lg:w-80 bg-[#faf7f0] border-r border-stone-200 p-4 lg:p-6 shrink-0 flex flex-col gap-2 md:sticky md:top-[73px] md:h-[calc(100vh-100px)] md:overflow-y-auto custom-scrollbar">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-stone-500 px-3 py-1">
            PAGE SECTIONS
          </span>

          <div className="flex flex-col gap-1.5 mt-1">
            {COURSE_CATALOG_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#c9542f]/10 border-2 border-[#c9542f] text-stone-900 shadow-sm'
                      : 'border border-transparent hover:bg-stone-200/50 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <div
                    className={`mt-0.5 p-2 rounded-lg ${
                      isActive ? 'bg-[#c9542f] text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {tab.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider truncate ${
                          isActive ? 'text-[#c9542f]' : 'text-stone-900'
                        }`}
                      >
                        {tab.label}
                      </span>
                      {tab.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#c9542f]/15 text-[#c9542f]">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[0.72rem] text-stone-500 truncate mt-0.5">
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-stone-200">
            <div className="p-3.5 rounded-xl bg-[#f5f1e8] border border-stone-200 flex items-center gap-3 text-xs text-stone-600">
              <Info size={18} className="text-[#c9542f] shrink-0" />
              <span>All font sizing &amp; section changes instantly sync to MongoDB and the live /course page.</span>
            </div>
          </div>
        </aside>

        {/* ─── RIGHT CONTENT AREA ─── */}
        <main className="flex-1 p-6 lg:p-10 w-full min-w-0">
          
          {/* =========================================================================
              0. MASTER FONT STUDIO (GLOBAL COURSE CONTROLLER)
             ========================================================================= */}
          {activeTab === 'masterTypography' && (
            <div className="flex flex-col gap-8 max-w-6xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#c9542f] text-white">
                      <Faders size={20} weight="bold" />
                    </div>
                    <h2 className="font-serif text-2xl text-stone-900">Master Font Studio</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#c9542f]/10 border border-[#c9542f]/30 text-[0.65rem] font-bold text-[#c9542f] tracking-wider uppercase">
                      Universal Sync Engine
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Control and synchronize Eyebrow/Tagline, Main Heading, Subheading, and Button font sizes across all Course page sections simultaneously in 1 click.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setMasterEyebrowSize(14);
                      setMasterHeadingSize(54);
                      setMasterDescriptionSize(17);
                      setMasterButtonSize(14);
                      addToast('Reset master sizes to standard defaults (14px / 54px / 17px / 14px)', 'info');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-medium transition-all cursor-pointer shadow-xs"
                  >
                    <ArrowCounterClockwise size={14} />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              {/* Universal Sizing Engine Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c9542f]">
                    <TextT size={18} weight="bold" />
                    <span>Universal Font Sizing Engine</span>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    Adjust sizes here, select target sections below, then click "Apply to Selected Sections".
                  </span>
                </div>

                {/* 4 Master Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {/* 1. Master Eyebrow */}
                  <div className="bg-[#faf7f0] border border-stone-200 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c9542f]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                          1. Tagline / Eyebrow
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c9542f]/10 text-[#c9542f] border border-[#c9542f]/30">
                        {masterEyebrowSize}px
                      </span>
                    </div>

                    <p className="text-[0.7rem] text-stone-500 leading-relaxed">
                      Controls uppercase tracking tags across Hero, More Masterclasses, FAQs &amp; CTAs.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => updateMasterSizes(Math.max(10, masterEyebrowSize - 1), undefined, undefined, undefined)}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <Minus size={14} weight="bold" />
                      </button>

                      <input
                        type="range"
                        min={10}
                        max={28}
                        step={1}
                        value={masterEyebrowSize}
                        onChange={(e) => updateMasterSizes(Number(e.target.value), undefined, undefined, undefined)}
                        className="flex-1 accent-[#c9542f] cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => updateMasterSizes(Math.min(28, masterEyebrowSize + 1), undefined, undefined, undefined)}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-stone-200">
                      {[11, 12, 13, 14, 16, 18].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updateMasterSizes(size, undefined, undefined, undefined)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            masterEyebrowSize === size
                              ? 'bg-[#c9542f] text-white font-bold shadow-xs'
                              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Master Main Heading */}
                  <div className="bg-[#faf7f0] border border-stone-200 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c9542f]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                          2. Main Headings
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c9542f]/10 text-[#c9542f] border border-[#c9542f]/30">
                        {masterHeadingSize}px
                      </span>
                    </div>

                    <p className="text-[0.7rem] text-stone-500 leading-relaxed">
                      Controls bold Fraunces/Sans headlines across Hero, Catalog, FAQs &amp; Enrollment sections.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => updateMasterSizes(undefined, Math.max(24, masterHeadingSize - 2), undefined, undefined)}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <Minus size={14} weight="bold" />
                      </button>

                      <input
                        type="range"
                        min={24}
                        max={84}
                        step={2}
                        value={masterHeadingSize}
                        onChange={(e) => updateMasterSizes(undefined, Number(e.target.value), undefined, undefined)}
                        className="flex-1 accent-[#c9542f] cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => updateMasterSizes(undefined, Math.min(84, masterHeadingSize + 2), undefined, undefined)}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-stone-200">
                      {[36, 44, 52, 60, 64, 72].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updateMasterSizes(undefined, size, undefined, undefined)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            masterHeadingSize === size
                              ? 'bg-[#c9542f] text-white font-bold shadow-xs'
                              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Master Paragraph */}
                  <div className="bg-[#faf7f0] border border-stone-200 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c9542f]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                          3. Subheading / Subtext
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c9542f]/10 text-[#c9542f] border border-[#c9542f]/30">
                        {masterDescriptionSize}px
                      </span>
                    </div>

                    <p className="text-[0.7rem] text-stone-500 leading-relaxed">
                      Controls descriptive paragraphs, subtitle explanations, and FAQ answer text.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => updateMasterSizes(undefined, undefined, Math.max(12, masterDescriptionSize - 1), undefined)}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <Minus size={14} weight="bold" />
                      </button>

                      <input
                        type="range"
                        min={12}
                        max={28}
                        step={1}
                        value={masterDescriptionSize}
                        onChange={(e) => updateMasterSizes(undefined, undefined, Number(e.target.value), undefined)}
                        className="flex-1 accent-[#c9542f] cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => updateMasterSizes(undefined, undefined, Math.min(28, masterDescriptionSize + 1), undefined)}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-stone-200">
                      {[14, 16, 17, 18, 20, 22].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updateMasterSizes(undefined, undefined, size, undefined)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            masterDescriptionSize === size
                              ? 'bg-[#c9542f] text-white font-bold shadow-xs'
                              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Master Buttons & Badges */}
                  <div className="bg-[#faf7f0] border border-stone-200 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c9542f]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                          4. Buttons &amp; Badges
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c9542f]/10 text-[#c9542f] border border-[#c9542f]/30">
                        {masterButtonSize}px
                      </span>
                    </div>

                    <p className="text-[0.7rem] text-stone-500 leading-relaxed">
                      Controls button labels (Register Now, Check Course), proof point badges, and card pill buttons.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => updateMasterSizes(undefined, undefined, undefined, Math.max(10, masterButtonSize - 1))}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <Minus size={14} weight="bold" />
                      </button>

                      <input
                        type="range"
                        min={10}
                        max={24}
                        step={1}
                        value={masterButtonSize}
                        onChange={(e) => updateMasterSizes(undefined, undefined, undefined, Number(e.target.value))}
                        className="flex-1 accent-[#c9542f] cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => updateMasterSizes(undefined, undefined, undefined, Math.min(24, masterButtonSize + 1))}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-stone-200">
                      {[11, 12, 13, 14, 15, 16].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updateMasterSizes(undefined, undefined, undefined, size)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            masterButtonSize === size
                              ? 'bg-[#c9542f] text-white font-bold shadow-xs'
                              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target Course Sections Selector */}
                <div className="pt-4 border-t border-stone-200 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                        Target Course Sections ({selectedTargetSections.length} of {TARGET_COURSE_SECTIONS.length} selected)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllSections}
                        className="text-xs font-semibold text-[#c9542f] hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-stone-300">•</span>
                      <button
                        type="button"
                        onClick={handleDeselectAllSections}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {TARGET_COURSE_SECTIONS.map((sec) => {
                      const isSelected = selectedTargetSections.includes(sec.id);
                      const secSizes = getSectionLiveSizes(sec.id);
                      return (
                        <div
                          key={sec.id}
                          onClick={() => toggleTargetSection(sec.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 select-none ${
                            isSelected
                              ? 'bg-[#c9542f]/10 border-[#c9542f] shadow-xs'
                              : 'bg-[#faf7f0] border-stone-200 hover:border-stone-300 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-[#c9542f]' : 'text-stone-700'}`}>
                              {sec.name}
                            </span>
                            {isSelected ? (
                              <CheckSquareOffset size={16} weight="fill" className="text-[#c9542f]" />
                            ) : (
                              <Square size={16} className="text-stone-400" />
                            )}
                          </div>
                          <p className="text-[0.68rem] text-stone-500 line-clamp-1">
                            {sec.desc}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap text-[0.65rem] text-stone-600 pt-1 border-t border-stone-200/60 font-mono">
                            <span>Eyebrow: <b>{secSizes.tag}px</b></span>
                            <span>•</span>
                            <span>Head: <b>{secSizes.head}px</b></span>
                            <span>•</span>
                            <span>Para: <b>{secSizes.sub}px</b></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Apply Engine Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleApplyMasterTypography}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#a64117] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-[#c9542f]/20 transition-all cursor-pointer"
                    >
                      <Lightning size={16} weight="fill" />
                      <span>Apply to Selected Sections</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-Time Live Visual Typography Preview Switcher */}
              <div
                className="p-6 bg-[#0B070B] text-white rounded-2xl border border-white/10 flex flex-col gap-4 shadow-xl preserve-dark"
                data-preserve-dark="true"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-[#c878be]">
                    <Sparkle size={16} weight="fill" />
                    <span>Universal Live Typography Preview</span>
                  </div>

                  {/* Section Preview Switcher Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: 'hero', label: 'Hero Banner' },
                      { id: 'moreCourses', label: 'Masterclasses Grid' },
                      { id: 'allCoursesPage', label: 'All Programs' },
                      { id: 'faq', label: 'FAQ Section' },
                      { id: 'cta', label: 'Final CTA' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setMasterPreviewTab(tab.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                          masterPreviewTab === tab.id
                            ? 'bg-[#c878be] text-[#0B070B] shadow-sm'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. Hero Preview Mode */}
                {masterPreviewTab === 'hero' && (
                  <div className="flex flex-col items-center text-center gap-3.5 py-6 max-w-3xl mx-auto">
                    <span
                      className="font-mono uppercase font-bold tracking-widest text-[#f3a8e2]"
                      style={{ fontSize: `${settings.hero?.tagSize || masterEyebrowSize}px` }}
                    >
                      {settings.hero?.tag || 'Learn. Practise. Lead.'}
                    </span>

                    <h1
                      className="font-sans font-black tracking-tight text-white leading-tight uppercase"
                      style={{ fontSize: `${settings.hero?.headingSize || masterHeadingSize}px` }}
                    >
                      {renderCourseHeadline(settings.hero?.heading || 'THE *BETTER* MAN')}
                    </h1>

                    <p
                      className="text-white/75 font-light leading-relaxed max-w-2xl"
                      style={{ fontSize: `${settings.hero?.subheadingSize || masterDescriptionSize}px` }}
                    >
                      {settings.hero?.subheading || 'Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh.'}
                    </p>

                    <div
                      className="flex flex-wrap items-center justify-center gap-4 text-white/70 text-xs pt-1"
                      style={{ fontSize: `${settings.hero?.proofSize || masterEyebrowSize}px` }}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f3a8e2]"></span>
                        <b className="text-white font-semibold">{settings.hero?.proof1Bold || '3 private'}</b> {settings.hero?.proof1Text || '1-on-1 sessions with Aarkesh'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f3a8e2]"></span>
                        <b className="text-white font-semibold">{settings.hero?.proof2Bold || 'Lifetime'}</b> {settings.hero?.proof2Text || 'access, no recurring charges'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5 mt-2">
                      <button
                        type="button"
                        className="px-6 py-2.5 rounded-full bg-linear-to-r from-[#a83b96] to-[#7a2a70] text-white font-bold tracking-wider uppercase shadow-lg shadow-[#a83b96]/30"
                        style={{ fontSize: `${settings.hero?.buttonSize || masterButtonSize}px` }}
                      >
                        {settings.hero?.primaryBtnText || 'Register Now'} →
                      </button>
                      <button
                        type="button"
                        className="px-6 py-2.5 rounded-full bg-white/5 border border-[#c878be]/40 text-white font-semibold"
                        style={{ fontSize: `${settings.hero?.buttonSize || masterButtonSize}px` }}
                      >
                        {settings.hero?.secondaryBtnText || 'Check Course'} →
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. More Masterclasses Preview Mode */}
                {masterPreviewTab === 'moreCourses' && (
                  <div className="flex flex-col items-center text-center gap-4 py-4 max-w-3xl mx-auto w-full">
                    <span
                      className="font-mono uppercase font-bold tracking-widest text-[#f3a8e2]"
                      style={{ fontSize: `${settings.moreCourses?.eyebrowSize || masterEyebrowSize}px` }}
                    >
                      {settings.moreCourses?.eyebrowText || 'MORE MASTERCLASSES'}
                    </span>

                    <h2
                      className="font-sans font-black tracking-tight text-white leading-tight uppercase"
                      style={{ fontSize: `${settings.moreCourses?.headingSize || Math.round(masterHeadingSize * 0.82)}px` }}
                    >
                      {renderCourseHeadline(settings.moreCourses?.heading || 'More *Masterclasses*')}
                    </h2>

                    <p
                      className="text-white/70 font-light leading-relaxed"
                      style={{ fontSize: `${settings.moreCourses?.subheadingSize || Math.max(14, masterDescriptionSize - 1)}px` }}
                    >
                      {settings.moreCourses?.subheading || 'Each one is a standalone course with its own private sessions.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-2 text-left">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                        <span className="px-2 py-0.5 self-start rounded-full bg-[#f3a8e2]/10 text-[#f3a8e2] border border-[#f3a8e2]/20 text-[10px] font-mono font-bold">COURSE 01</span>
                        <h3 className="text-white font-serif text-base font-bold">The Better Man</h3>
                        <p className="text-white/60 text-xs">Calm authority, magnetic presence &amp; self-command.</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                        <span className="px-2 py-0.5 self-start rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold">COURSE 02</span>
                        <h3 className="text-white font-serif text-base font-bold">High-Stakes Influence</h3>
                        <p className="text-white/60 text-xs">Negotiation, boardroom gravity &amp; persuasive mastery.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-semibold mt-2"
                      style={{ fontSize: `${settings.moreCourses?.buttonSize || masterButtonSize}px` }}
                    >
                      {settings.moreCourses?.viewAllBtnText || 'View All Masterclasses'} →
                    </button>
                  </div>
                )}

                {/* 3. All Programs Preview Mode */}
                {masterPreviewTab === 'allCoursesPage' && (
                  <div className="flex flex-col gap-4 py-4 max-w-3xl mx-auto w-full">
                    <span
                      className="text-white/60 text-xs cursor-default self-start"
                      style={{ fontSize: `${settings.allCoursesPage?.buttonSize || masterButtonSize}px` }}
                    >
                      {settings.allCoursesPage?.backBtnText || '← Back to overview'}
                    </span>

                    <div className="flex flex-col items-center text-center gap-2.5">
                      <span
                        className="font-mono uppercase font-bold tracking-widest text-[#f3a8e2]"
                        style={{ fontSize: `${settings.allCoursesPage?.tagSize || masterEyebrowSize}px` }}
                      >
                        {settings.allCoursesPage?.tag || 'ALL PROGRAMS'}
                      </span>

                      <h1
                        className="font-sans font-black tracking-tight text-white leading-tight uppercase"
                        style={{ fontSize: `${settings.allCoursesPage?.headingSize || Math.round(masterHeadingSize * 0.88)}px` }}
                      >
                        {renderCourseHeadline(settings.allCoursesPage?.heading || 'All *Masterclasses* & Programs')}
                      </h1>

                      <p
                        className="text-white/70 font-light leading-relaxed max-w-2xl"
                        style={{ fontSize: `${settings.allCoursesPage?.subheadingSize || Math.max(14, masterDescriptionSize - 1)}px` }}
                      >
                        {settings.allCoursesPage?.subheading || 'Each masterclass is an intensive, transformative curriculum paired with private 1-on-1 mentorship sessions with Aarkesh.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. FAQ Preview Mode */}
                {masterPreviewTab === 'faq' && (
                  <div className="flex flex-col items-center text-center gap-3 py-4 max-w-3xl mx-auto w-full">
                    <span
                      className="font-mono uppercase font-bold tracking-widest text-[#f3a8e2]"
                      style={{ fontSize: `${settings.faq?.tagSize || masterEyebrowSize}px` }}
                    >
                      {settings.faq?.tag?.replace(/\*/g, '') || 'FAQS'}
                    </span>

                    <h2
                      className="font-sans font-black tracking-tight text-white leading-tight uppercase"
                      style={{ fontSize: `${settings.faq?.headingSize || Math.round(masterHeadingSize * 0.74)}px` }}
                    >
                      {renderCourseHeadline(settings.faq?.heading || 'Frequently Asked *Questions*')}
                    </h2>

                    <p
                      className="text-white/70 font-light leading-relaxed"
                      style={{ fontSize: `${settings.faq?.subheadingSize || Math.max(14, masterDescriptionSize - 1)}px` }}
                    >
                      {settings.faq?.subheading || 'Clear answers about the masterclass, private mentorship, and enrollment.'}
                    </p>

                    <div className="flex flex-col gap-2.5 w-full pt-2 text-left">
                      <div className="bg-white/5 border border-[#c878be]/30 rounded-xl p-3.5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-white font-semibold" style={{ fontSize: `${settings.faq?.questionSize || masterDescriptionSize}px` }}>
                          <span>How do the 1-on-1 private coaching sessions work?</span>
                          <span className="text-[#f3a8e2] font-mono text-base">−</span>
                        </div>
                        <p className="text-white/70 font-light leading-relaxed border-t border-white/10 pt-1.5" style={{ fontSize: `${settings.faq?.answerSize || Math.max(13, masterDescriptionSize - 2)}px` }}>
                          Upon enrollment, you gain access to Aarkesh private booking calendar to schedule your sessions at your convenience.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Final CTA Preview Mode */}
                {masterPreviewTab === 'cta' && (
                  <div className="flex flex-col items-center text-center gap-3.5 py-4 max-w-3xl mx-auto w-full">
                    <span
                      className="font-mono uppercase font-bold tracking-widest text-[#f3a8e2]"
                      style={{ fontSize: `${settings.cta?.labelSize || masterEyebrowSize}px` }}
                    >
                      {settings.cta?.label || 'THE NEXT CHAPTER'}
                    </span>

                    <h2
                      className="font-sans font-black tracking-tight text-white leading-tight uppercase"
                      style={{ fontSize: `${settings.cta?.headingSize || Math.round(masterHeadingSize * 0.88)}px` }}
                    >
                      {renderCourseHeadline(settings.cta?.heading || 'Transform How You Show Up, Speak, & *Lead*')}
                    </h2>

                    <p
                      className="text-white/70 font-light leading-relaxed max-w-2xl"
                      style={{ fontSize: `${settings.cta?.descriptionSize || masterDescriptionSize}px` }}
                    >
                      {settings.cta?.description || 'Enroll today for lifetime video access, private 1-on-1 mentorship calls with Aarkesh, and community access.'}
                    </p>

                    <div className="flex items-center gap-3.5 mt-2">
                      <button
                        type="button"
                        className="px-6 py-2.5 rounded-full bg-linear-to-r from-[#a83b96] to-[#7a2a70] text-white font-bold tracking-wider uppercase shadow-lg shadow-[#a83b96]/30"
                        style={{ fontSize: `${settings.cta?.buttonSize || masterButtonSize}px` }}
                      >
                        {settings.cta?.primaryBtnText || 'Register Now'} →
                      </button>
                      <button
                        type="button"
                        className="px-6 py-2.5 rounded-full bg-white/5 border border-[#c878be]/40 text-white font-semibold"
                        style={{ fontSize: `${settings.cta?.buttonSize || masterButtonSize}px` }}
                      >
                        {settings.cta?.exploreBtnText || 'Explore Courses'} →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              1. HERO BANNER SECTION
             ========================================================================= */}
          {activeTab === 'hero' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">Catalog Hero Banner</h2>
                <p className="text-xs text-stone-500 mt-1">The main hero banner shown at the top of the /course catalog landing page.</p>
              </div>

              {/* Individual Font Sizing Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c9542f]">
                    <Faders size={16} weight="bold" />
                    <span>Hero Section Font Sizing Controls</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Tagline Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.hero?.tagSize || 14}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={settings.hero?.tagSize || 14}
                      onChange={(e) => updateField('hero.tagSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Main Title Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.hero?.headingSize || 56}px</span>
                    </div>
                    <input
                      type="range"
                      min="28"
                      max="84"
                      value={settings.hero?.headingSize || 56}
                      onChange={(e) => updateField('hero.headingSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Subheading Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.hero?.subheadingSize || 18}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="26"
                      value={settings.hero?.subheadingSize || 18}
                      onChange={(e) => updateField('hero.subheadingSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Button Font Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.hero?.buttonSize || 14}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="22"
                      value={settings.hero?.buttonSize || 14}
                      onChange={(e) => updateField('hero.buttonSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Live Visual Hero Preview */}
              <div
                className="p-6 sm:p-8 bg-[#0B070B] text-white rounded-2xl border border-white/10 flex flex-col gap-4 shadow-xl preserve-dark"
                data-preserve-dark="true"
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c878be] pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Eye size={16} weight="fill" />
                    <span>Live Hero Banner Preview</span>
                  </div>
                  <span className="text-white/40 font-mono text-[10px]">Real-Time Scale</span>
                </div>

                <div className="flex flex-col items-center text-center gap-3.5 py-6 max-w-3xl mx-auto">
                  <span
                    className="font-mono uppercase font-bold tracking-widest text-[#f3a8e2]"
                    style={{ fontSize: `${settings.hero?.tagSize || 14}px` }}
                  >
                    {settings.hero?.tag || 'Learn. Practise. Lead.'}
                  </span>

                  <h1
                    className="font-sans font-black tracking-tight text-white leading-tight uppercase"
                    style={{ fontSize: `${settings.hero?.headingSize || 56}px` }}
                  >
                    {renderCourseHeadline(settings.hero?.heading || 'THE *BETTER* MAN')}
                  </h1>

                  <p
                    className="text-white/75 font-light leading-relaxed max-w-2xl"
                    style={{ fontSize: `${settings.hero?.subheadingSize || 18}px` }}
                  >
                    {settings.hero?.subheading || 'Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh.'}
                  </p>

                  <div
                    className="flex flex-wrap items-center justify-center gap-4 text-white/70 text-xs pt-1"
                    style={{ fontSize: `${settings.hero?.proofSize || 13}px` }}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f3a8e2]"></span>
                      <b className="text-white font-semibold">{settings.hero?.proof1Bold || '3 private'}</b> {settings.hero?.proof1Text || '1-on-1 sessions with Aarkesh'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f3a8e2]"></span>
                      <b className="text-white font-semibold">{settings.hero?.proof2Bold || 'Lifetime'}</b> {settings.hero?.proof2Text || 'access, no recurring charges'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 mt-2">
                    <button
                      type="button"
                      className="px-6 py-2.5 rounded-full bg-linear-to-r from-[#a83b96] to-[#7a2a70] text-white font-bold tracking-wider uppercase shadow-lg shadow-[#a83b96]/30"
                      style={{ fontSize: `${settings.hero?.buttonSize || 14}px` }}
                    >
                      {settings.hero?.primaryBtnText || 'Register Now'} →
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2.5 rounded-full bg-white/5 border border-[#c878be]/40 text-white font-semibold"
                      style={{ fontSize: `${settings.hero?.buttonSize || 14}px` }}
                    >
                      {settings.hero?.secondaryBtnText || 'Check Course'} →
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Form */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 pb-3 border-b border-stone-100">
                  Headline, Subheading &amp; Proof Points
                </h3>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Eyebrow Tag</label>
                    <input
                      type="text"
                      value={settings.hero?.tag || ''}
                      onChange={(e) => updateField('hero.tag', e.target.value)}
                      placeholder="Learn. Practise. Lead."
                      className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-xl px-4 py-3 text-stone-900 text-sm outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Main Headline (Wrap Boxed Word in *Asterisks*)
                      </label>
                      <span className="text-[11px] text-[#c9542f]">Example: THE *BETTER* MAN</span>
                    </div>
                    <input
                      type="text"
                      value={settings.hero?.heading || ''}
                      onChange={(e) => updateField('hero.heading', e.target.value)}
                      placeholder="THE *BETTER* MAN"
                      className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-xl px-4 py-3 text-stone-900 text-sm outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Subheading Description</label>
                    <textarea
                      rows={3}
                      value={settings.hero?.subheading || ''}
                      onChange={(e) => updateField('hero.subheading', e.target.value)}
                      className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-xl px-4 py-3 text-stone-900 text-sm outline-none resize-y"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Proof Point 1 Bold</label>
                    <input
                      type="text"
                      value={settings.hero?.proof1Bold || ''}
                      onChange={(e) => updateField('hero.proof1Bold', e.target.value)}
                      placeholder="3 private"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    />
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700 mt-2">Proof Point 1 Text</label>
                    <input
                      type="text"
                      value={settings.hero?.proof1Text || ''}
                      onChange={(e) => updateField('hero.proof1Text', e.target.value)}
                      placeholder="1-on-1 sessions with Aarkesh"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Proof Point 2 Bold</label>
                    <input
                      type="text"
                      value={settings.hero?.proof2Bold || ''}
                      onChange={(e) => updateField('hero.proof2Bold', e.target.value)}
                      placeholder="Lifetime"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    />
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700 mt-2">Proof Point 2 Text</label>
                    <input
                      type="text"
                      value={settings.hero?.proof2Text || ''}
                      onChange={(e) => updateField('hero.proof2Text', e.target.value)}
                      placeholder="access, no recurring charges"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Primary Button Label</label>
                    <input
                      type="text"
                      value={settings.hero?.primaryBtnText || 'Register Now'}
                      onChange={(e) => updateField('hero.primaryBtnText', e.target.value)}
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Secondary Button Label</label>
                    <input
                      type="text"
                      value={settings.hero?.secondaryBtnText || 'Check Course'}
                      onChange={(e) => updateField('hero.secondaryBtnText', e.target.value)}
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                {/* Secondary Button Redirect Target (Existing Course Dropdown) */}
                <div className="flex flex-col gap-2.5 p-4 bg-[#faf7f0] border border-stone-200 rounded-xl mt-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                      <span>Redirect Target Course ("{settings.hero?.secondaryBtnText || 'Check Course'}")</span>
                    </label>
                    <span className="text-[11px] font-mono font-bold text-[#c9542f] bg-[#c9542f]/10 px-2.5 py-0.5 rounded-full border border-[#c9542f]/20">
                      Redirect: {settings.hero?.secondaryBtnLink || '/course/better-man'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Choose which course page opens when visitors click "{settings.hero?.secondaryBtnText || 'Check Course'}".
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold uppercase text-stone-600">Select Existing Course</span>
                      <select
                        value={
                          coursesList.some((c) => `/course/${c.slug}` === settings.hero?.secondaryBtnLink || c.slug === settings.hero?.secondaryBtnLink)
                            ? (settings.hero?.secondaryBtnLink?.startsWith('/course/') ? settings.hero.secondaryBtnLink : `/course/${settings.hero?.secondaryBtnLink}`)
                            : (settings.hero?.secondaryBtnLink?.startsWith('#') ? '#more-courses' : 'custom')
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '#more-courses') {
                            updateField('hero.secondaryBtnLink', '#more-courses');
                          } else if (val === 'custom') {
                            // keep custom
                          } else {
                            updateField('hero.secondaryBtnLink', val);
                          }
                        }}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-900 focus:outline-none focus:border-[#c9542f] cursor-pointer"
                      >
                        <optgroup label="Existing Courses">
                          {coursesList.map((c) => (
                            <option key={c.slug} value={`/course/${c.slug}`}>
                              {c.title} ({c.slug})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Other Actions">
                          <option value="#more-courses">Scroll Down to Catalog (#more-courses)</option>
                          <option value="custom">Custom URL / Path...</option>
                        </optgroup>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold uppercase text-stone-600">Direct URL / Route Path</span>
                      <input
                        type="text"
                        value={settings.hero?.secondaryBtnLink || '/course/better-man'}
                        onChange={(e) => updateField('hero.secondaryBtnLink', e.target.value)}
                        placeholder="/course/better-man"
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-mono text-stone-900 focus:outline-none focus:border-[#c9542f]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              2. MORE MASTERCLASSES SECTION
             ========================================================================= */}
          {activeTab === 'moreCourses' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">More Masterclasses Grid</h2>
                <p className="text-xs text-stone-500 mt-1">Headline and section introduction for the course catalog grid on the /course page.</p>
              </div>

              {/* Individual Font Sizing Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c9542f]">
                    <Faders size={16} weight="bold" />
                    <span>More Masterclasses Font Sizing Controls</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Eyebrow Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.moreCourses?.eyebrowSize || 14}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={settings.moreCourses?.eyebrowSize || 14}
                      onChange={(e) => updateField('moreCourses.eyebrowSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Heading Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.moreCourses?.headingSize || 44}px</span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="64"
                      value={settings.moreCourses?.headingSize || 44}
                      onChange={(e) => updateField('moreCourses.headingSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Subheading Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.moreCourses?.subheadingSize || 16}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={settings.moreCourses?.subheadingSize || 16}
                      onChange={(e) => updateField('moreCourses.subheadingSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Button Font Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.moreCourses?.buttonSize || 14}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="22"
                      value={settings.moreCourses?.buttonSize || 14}
                      onChange={(e) => updateField('moreCourses.buttonSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Live Visual More Masterclasses Preview */}
              <div
                className="p-6 sm:p-8 bg-[#0B070B] text-white rounded-2xl border border-white/10 flex flex-col gap-6 shadow-xl preserve-dark"
                data-preserve-dark="true"
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c878be] pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Eye size={16} weight="fill" />
                    <span>Live Masterclasses Grid Preview</span>
                  </div>
                  <span className="text-white/40 font-mono text-[10px]">Real-Time Scale</span>
                </div>

                <div className="flex flex-col items-center text-center gap-2.5 max-w-2xl mx-auto">
                  <span
                    className="font-mono uppercase font-bold tracking-widest text-[#f3a8e2]"
                    style={{ fontSize: `${settings.moreCourses?.eyebrowSize || 14}px` }}
                  >
                    {settings.moreCourses?.eyebrowText || 'MORE MASTERCLASSES'}
                  </span>

                  <h2
                    className="font-sans font-black tracking-tight text-white leading-tight uppercase"
                    style={{ fontSize: `${settings.moreCourses?.headingSize || 44}px` }}
                  >
                    {renderCourseHeadline(settings.moreCourses?.heading || 'More *Masterclasses*')}
                  </h2>

                  <p
                    className="text-white/70 font-light leading-relaxed"
                    style={{ fontSize: `${settings.moreCourses?.subheadingSize || 16}px` }}
                  >
                    {settings.moreCourses?.subheading || 'Each one is a standalone course with its own private sessions.'}
                  </p>
                </div>

                {/* Mock Course Cards Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto w-full pt-2">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-[#f3a8e2]/10 text-[#f3a8e2] border border-[#f3a8e2]/20 text-[10px] font-mono font-bold">COURSE 01</span>
                      <span className="text-white font-mono font-bold text-sm">₹4,999</span>
                    </div>
                    <div>
                      <h3 className="text-white font-serif text-lg font-bold">The Better Man</h3>
                      <p className="text-white/60 text-xs mt-1">Calm authority, magnetic presence &amp; self-command.</p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-white/50 border-t border-white/10 pt-3">
                      <span>3 Private 1-on-1 Calls</span>
                      <span className="text-[#f3a8e2] font-semibold">View Course →</span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold">COURSE 02</span>
                      <span className="text-white font-mono font-bold text-sm">₹6,499</span>
                    </div>
                    <div>
                      <h3 className="text-white font-serif text-lg font-bold">High-Stakes Influence</h3>
                      <p className="text-white/60 text-xs mt-1">Negotiation, boardroom gravity &amp; persuasive mastery.</p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-white/50 border-t border-white/10 pt-3">
                      <span>4 Private 1-on-1 Calls</span>
                      <span className="text-[#f3a8e2] font-semibold">View Course →</span>
                    </div>
                  </div>
                </div>

                {settings.moreCourses?.showViewAllBtn !== false && (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold transition-all"
                      style={{ fontSize: `${settings.moreCourses?.buttonSize || 14}px` }}
                    >
                      {settings.moreCourses?.viewAllBtnText || 'View All Masterclasses'} →
                    </button>
                  </div>
                )}
              </div>

              {/* Content Form */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 pb-3 border-b border-stone-100">
                  Section Header &amp; View All Button
                </h3>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Eyebrow Tag</label>
                    <input
                      type="text"
                      value={settings.moreCourses?.eyebrowText || ''}
                      onChange={(e) => updateField('moreCourses.eyebrowText', e.target.value)}
                      placeholder="MORE MASTERCLASSES"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Headline</label>
                    <input
                      type="text"
                      value={settings.moreCourses?.heading || ''}
                      onChange={(e) => updateField('moreCourses.heading', e.target.value)}
                      placeholder="More Masterclasses"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Subheading Description</label>
                    <textarea
                      rows={2}
                      value={settings.moreCourses?.subheading || ''}
                      onChange={(e) => updateField('moreCourses.subheading', e.target.value)}
                      placeholder="Each one is a standalone course with its own private sessions."
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm resize-y"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                        "View All Masterclasses" Button
                      </span>
                      <p className="text-xs text-stone-500 mt-0.5">Show or hide the button placed below the course cards.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.moreCourses?.showViewAllBtn !== false}
                        onChange={(e) => updateField('moreCourses.showViewAllBtn', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9542f]"></div>
                    </label>
                  </div>

                  {settings.moreCourses?.showViewAllBtn !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Button Text</label>
                        <input
                          type="text"
                          value={settings.moreCourses?.viewAllBtnText || 'View All Masterclasses'}
                          onChange={(e) => updateField('moreCourses.viewAllBtnText', e.target.value)}
                          className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Button Link</label>
                        <input
                          type="text"
                          value={settings.moreCourses?.viewAllBtnLink || '/course/all'}
                          onChange={(e) => updateField('moreCourses.viewAllBtnLink', e.target.value)}
                          className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              3. ALL PROGRAMS DIRECTORY PAGE
             ========================================================================= */}
          {activeTab === 'allCoursesPage' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">All Programs Directory Page (/course/all)</h2>
                <p className="text-xs text-stone-500 mt-1">Headers and description for the full course directory view.</p>
              </div>

              {/* Individual Font Sizing Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c9542f]">
                    <Faders size={16} weight="bold" />
                    <span>All Programs Header Font Sizing Controls</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Tag Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.allCoursesPage?.tagSize || 14}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={settings.allCoursesPage?.tagSize || 14}
                      onChange={(e) => updateField('allCoursesPage.tagSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Heading Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.allCoursesPage?.headingSize || 48}px</span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="72"
                      value={settings.allCoursesPage?.headingSize || 48}
                      onChange={(e) => updateField('allCoursesPage.headingSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Subheading Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.allCoursesPage?.subheadingSize || 16}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={settings.allCoursesPage?.subheadingSize || 16}
                      onChange={(e) => updateField('allCoursesPage.subheadingSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Live Visual All Programs Header Preview */}
              <div
                className="p-6 sm:p-8 bg-[#0B070B] text-white rounded-2xl border border-white/10 flex flex-col gap-6 shadow-xl preserve-dark"
                data-preserve-dark="true"
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c878be] pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Eye size={16} weight="fill" />
                    <span>Live All Programs Header Preview (/course/all)</span>
                  </div>
                  <span className="text-white/40 font-mono text-[10px]">Real-Time Scale</span>
                </div>

                <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
                  <button
                    type="button"
                    className="self-start text-white/60 hover:text-white transition-colors cursor-default"
                    style={{ fontSize: `${settings.allCoursesPage?.buttonSize || 14}px` }}
                  >
                    {settings.allCoursesPage?.backBtnText || '← Back to overview'}
                  </button>

                  <div className="flex flex-col items-center text-center gap-2.5">
                    <span
                      className="font-mono uppercase font-bold tracking-widest text-[#f3a8e2]"
                      style={{ fontSize: `${settings.allCoursesPage?.tagSize || 14}px` }}
                    >
                      {settings.allCoursesPage?.tag || 'ALL PROGRAMS'}
                    </span>

                    <h1
                      className="font-sans font-black tracking-tight text-white leading-tight uppercase"
                      style={{ fontSize: `${settings.allCoursesPage?.headingSize || 48}px` }}
                    >
                      {renderCourseHeadline(settings.allCoursesPage?.heading || 'All *Masterclasses* & Programs')}
                    </h1>

                    <p
                      className="text-white/70 font-light leading-relaxed max-w-2xl"
                      style={{ fontSize: `${settings.allCoursesPage?.subheadingSize || 16}px` }}
                    >
                      {settings.allCoursesPage?.subheading || 'Each masterclass is an intensive, transformative curriculum paired with private 1-on-1 mentorship sessions with Aarkesh.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Tag</label>
                  <input
                    type="text"
                    value={settings.allCoursesPage?.tag || ''}
                    onChange={(e) => updateField('allCoursesPage.tag', e.target.value)}
                    placeholder="ALL PROGRAMS"
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Heading</label>
                  <input
                    type="text"
                    value={settings.allCoursesPage?.heading || ''}
                    onChange={(e) => updateField('allCoursesPage.heading', e.target.value)}
                    placeholder="All Masterclasses & Programs"
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Subheading</label>
                  <textarea
                    rows={3}
                    value={settings.allCoursesPage?.subheading || ''}
                    onChange={(e) => updateField('allCoursesPage.subheading', e.target.value)}
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              4. FAQ SECTION
             ========================================================================= */}
          {activeTab === 'faq' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">Catalog FAQ Section</h2>
                <p className="text-xs text-stone-500 mt-1">Frequently asked questions shown at the bottom of the /course landing page.</p>
              </div>

              {/* Individual Font Sizing Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c9542f]">
                    <Faders size={16} weight="bold" />
                    <span>FAQ Section Font Sizing Controls</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Tag Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.faq?.tagSize || 14}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={settings.faq?.tagSize || 14}
                      onChange={(e) => updateField('faq.tagSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Heading Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.faq?.headingSize || 40}px</span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="60"
                      value={settings.faq?.headingSize || 40}
                      onChange={(e) => updateField('faq.headingSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Question Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.faq?.questionSize || 17}px</span>
                    </div>
                    <input
                      type="range"
                      min="13"
                      max="24"
                      value={settings.faq?.questionSize || 17}
                      onChange={(e) => updateField('faq.questionSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Answer Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.faq?.answerSize || 15}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="22"
                      value={settings.faq?.answerSize || 15}
                      onChange={(e) => updateField('faq.answerSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Live Visual FAQ Preview */}
              <div
                className="p-6 sm:p-8 bg-[#0B070B] text-white rounded-2xl border border-white/10 flex flex-col gap-6 shadow-xl preserve-dark"
                data-preserve-dark="true"
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c878be] pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Eye size={16} weight="fill" />
                    <span>Live FAQ Section Preview</span>
                  </div>
                  <span className="text-white/40 font-mono text-[10px]">Real-Time Scale</span>
                </div>

                <div className="flex flex-col items-center text-center gap-2.5 max-w-2xl mx-auto">
                  <span
                    className="font-mono uppercase font-bold tracking-widest text-[#f3a8e2]"
                    style={{ fontSize: `${settings.faq?.tagSize || 14}px` }}
                  >
                    {settings.faq?.tag?.replace(/\*/g, '') || 'FAQS'}
                  </span>

                  <h2
                    className="font-sans font-black tracking-tight text-white leading-tight uppercase"
                    style={{ fontSize: `${settings.faq?.headingSize || 40}px` }}
                  >
                    {renderCourseHeadline(settings.faq?.heading || 'Frequently Asked *Questions*')}
                  </h2>

                  <p
                    className="text-white/70 font-light leading-relaxed"
                    style={{ fontSize: `${settings.faq?.subheadingSize || 16}px` }}
                  >
                    {settings.faq?.subheading || 'Clear answers about the masterclass, private mentorship, and enrollment.'}
                  </p>
                </div>

                {/* Sample FAQ Accordion Items */}
                <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full pt-2">
                  <div className="bg-white/5 border border-[#c878be]/30 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-white font-semibold" style={{ fontSize: `${settings.faq?.questionSize || 17}px` }}>
                      <span>{settings.faq?.items?.[0]?.question || 'How do the 1-on-1 private coaching sessions work?'}</span>
                      <span className="text-[#f3a8e2] font-mono text-lg">−</span>
                    </div>
                    <p className="text-white/70 font-light leading-relaxed border-t border-white/10 pt-2" style={{ fontSize: `${settings.faq?.answerSize || 15}px` }}>
                      {settings.faq?.items?.[0]?.answer || 'Upon enrollment, you gain access to Aarkesh private booking calendar to schedule your sessions at your convenience.'}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between text-white/90 font-semibold" style={{ fontSize: `${settings.faq?.questionSize || 17}px` }}>
                    <span>{settings.faq?.items?.[1]?.question || 'How long do I have access to the video modules?'}</span>
                    <span className="text-white/40 font-mono text-lg">+</span>
                  </div>
                </div>
              </div>

              {/* FAQ Content & Items */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 pb-3 border-b border-stone-100">
                  Header Texts &amp; Questions List
                </h3>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Tag / Eyebrow Badge</label>
                    <input
                      type="text"
                      value={settings.faq?.tag || ''}
                      onChange={(e) => updateField('faq.tag', e.target.value)}
                      placeholder="FAQS"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Heading</label>
                    <input
                      type="text"
                      value={settings.faq?.heading || ''}
                      onChange={(e) => updateField('faq.heading', e.target.value)}
                      placeholder="Frequently Asked Questions From Our Students"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Subheading Description</label>
                    <textarea
                      rows={2}
                      value={settings.faq?.subheading || ''}
                      onChange={(e) => updateField('faq.subheading', e.target.value)}
                      placeholder="Clear answers about the masterclass, private mentorship, and enrollment."
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm resize-y"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Questions &amp; Answers ({settings.faq?.items?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const items = settings.faq?.items || [];
                        updateField('faq.items', [...items, { question: 'New Question', answer: 'Answer text...' }]);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c9542f]/10 hover:bg-[#c9542f]/20 text-[#c9542f] text-xs font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      <Plus size={14} weight="bold" /> Add FAQ item
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {(settings.faq?.items || []).map((it, i) => (
                      <div key={i} className="bg-[#faf7f0] border border-stone-200 rounded-xl p-4 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-[#c9542f]">FAQ {i + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = settings.faq.items.filter((_, idx) => idx !== i);
                              updateField('faq.items', next);
                            }}
                            className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                            title="Delete item"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={it.question}
                          onChange={(e) => updateField(`faq.items.${i}.question`, e.target.value)}
                          placeholder="Question"
                          className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-medium"
                        />
                        <textarea
                          rows={2}
                          value={it.answer}
                          onChange={(e) => updateField(`faq.items.${i}.answer`, e.target.value)}
                          placeholder="Answer"
                          className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs resize-y"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              5. FINAL CALL TO ACTION
             ========================================================================= */}
          {activeTab === 'cta' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">Final Call to Action</h2>
                <p className="text-xs text-stone-500 mt-1">The bottom enrollment banner on the /course catalog page.</p>
              </div>

              {/* Individual Font Sizing Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c9542f]">
                    <Faders size={16} weight="bold" />
                    <span>CTA Section Font Sizing Controls</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Label Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.cta?.labelSize || 14}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={settings.cta?.labelSize || 14}
                      onChange={(e) => updateField('cta.labelSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Heading Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.cta?.headingSize || 48}px</span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="72"
                      value={settings.cta?.headingSize || 48}
                      onChange={(e) => updateField('cta.headingSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Description Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.cta?.descriptionSize || 17}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="26"
                      value={settings.cta?.descriptionSize || 17}
                      onChange={(e) => updateField('cta.descriptionSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf7f0] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Button Font Size</span>
                      <span className="font-mono font-bold text-stone-900">{settings.cta?.buttonSize || 15}px</span>
                    </div>
                    <input
                      type="range"
                      min="11"
                      max="24"
                      value={settings.cta?.buttonSize || 15}
                      onChange={(e) => updateField('cta.buttonSize', Number(e.target.value))}
                      className="accent-[#c9542f] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Live Visual Final CTA Preview */}
              <div
                className="p-6 sm:p-8 bg-[#0B070B] text-white rounded-2xl border border-white/10 flex flex-col gap-6 shadow-xl preserve-dark"
                data-preserve-dark="true"
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c878be] pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Eye size={16} weight="fill" />
                    <span>Live Call to Action Banner Preview</span>
                  </div>
                  <span className="text-white/40 font-mono text-[10px]">Real-Time Scale</span>
                </div>

                <div className="flex flex-col items-center text-center gap-3.5 max-w-3xl mx-auto py-4">
                  <span
                    className="font-mono uppercase font-bold tracking-widest text-[#f3a8e2]"
                    style={{ fontSize: `${settings.cta?.labelSize || 14}px` }}
                  >
                    {settings.cta?.label || 'THE NEXT CHAPTER'}
                  </span>

                  <h2
                    className="font-sans font-black tracking-tight text-white leading-tight uppercase"
                    style={{ fontSize: `${settings.cta?.headingSize || 48}px` }}
                  >
                    {renderCourseHeadline(settings.cta?.heading || 'Transform How You Show Up, Speak, & *Lead*')}
                  </h2>

                  <p
                    className="text-white/70 font-light leading-relaxed max-w-2xl"
                    style={{ fontSize: `${settings.cta?.descriptionSize || 17}px` }}
                  >
                    {settings.cta?.description || 'Enroll today for lifetime video access, private 1-on-1 mentorship calls with Aarkesh, and community access.'}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    {settings.cta?.badge1 && (
                      <span
                        className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 font-medium"
                        style={{ fontSize: `${settings.cta?.badgeSize || 13}px` }}
                      >
                        ✓ {settings.cta.badge1}
                      </span>
                    )}
                    {settings.cta?.badge2 && (
                      <span
                        className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 font-medium"
                        style={{ fontSize: `${settings.cta?.badgeSize || 13}px` }}
                      >
                        ✓ {settings.cta.badge2}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3.5 mt-2">
                    <button
                      type="button"
                      className="px-6 py-2.5 rounded-full bg-linear-to-r from-[#a83b96] to-[#7a2a70] text-white font-bold tracking-wider uppercase shadow-lg shadow-[#a83b96]/30"
                      style={{ fontSize: `${settings.cta?.buttonSize || 15}px` }}
                    >
                      {settings.cta?.primaryBtnText || 'Register Now'} →
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2.5 rounded-full bg-white/5 border border-[#c878be]/40 text-white font-semibold"
                      style={{ fontSize: `${settings.cta?.buttonSize || 15}px` }}
                    >
                      {settings.cta?.exploreBtnText || 'Explore Courses'} →
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Form */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Eyebrow Label</label>
                  <input
                    type="text"
                    value={settings.cta?.label || ''}
                    onChange={(e) => updateField('cta.label', e.target.value)}
                    placeholder="ENROLL TODAY"
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Heading</label>
                  <input
                    type="text"
                    value={settings.cta?.heading || ''}
                    onChange={(e) => updateField('cta.heading', e.target.value)}
                    placeholder="Ready To Become The Man People Trust?"
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Description</label>
                  <textarea
                    rows={3}
                    value={settings.cta?.description || ''}
                    onChange={(e) => updateField('cta.description', e.target.value)}
                    className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-sm resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Badge 1</label>
                    <input
                      type="text"
                      value={settings.cta?.badge1 || ''}
                      onChange={(e) => updateField('cta.badge1', e.target.value)}
                      placeholder="3 Private Coaching Calls"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Badge 2</label>
                    <input
                      type="text"
                      value={settings.cta?.badge2 || ''}
                      onChange={(e) => updateField('cta.badge2', e.target.value)}
                      placeholder="Lifetime Video Access"
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Primary Button Text</label>
                    <input
                      type="text"
                      value={settings.cta?.primaryBtnText || 'Register Now'}
                      onChange={(e) => updateField('cta.primaryBtnText', e.target.value)}
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Explore Button Text</label>
                    <input
                      type="text"
                      value={settings.cta?.exploreBtnText || 'Explore Courses'}
                      onChange={(e) => updateField('cta.exploreBtnText', e.target.value)}
                      className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
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
