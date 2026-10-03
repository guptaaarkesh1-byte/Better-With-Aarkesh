import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Desktop, 
  Sparkle, 
  FloppyDisk, 
  ArrowClockwise, 
  CheckCircle, 
  ArrowSquareOut, 
  Plus, 
  Trash,
  Tag,
  CurrencyInr,
  ListNumbers,
  Quotes,
  Kanban,
  CaretRight,
  ShieldCheck,
  Check,
  Play,
  ArrowUp,
  ArrowDown
} from '@phosphor-icons/react';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SECTION_TABS = [
  {
    id: 'hero',
    label: '1. Hero & Pricing Sidebar',
    icon: <Desktop size={18} />,
    description: 'Header, thumbnail chips, price & summary card'
  },
  {
    id: 'syllabus',
    label: '2. Syllabus & Modules Grid',
    icon: <ListNumbers size={18} />,
    description: 'Syllabus title, subtitle & modular roadmap'
  },
  {
    id: 'methodology',
    label: '3. Core Methodology & Deep Dive',
    icon: <Quotes size={18} />,
    description: 'Philosophy, headline, narrative & quote box'
  }
];

export default function AdminCourseDetailEditor() {
  const { showToast } = useToast();
  const [coursesMap, setCoursesMap] = useState({});
  const [activeSlug, setActiveSlug] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const slugFromUrl = params.get('courseSlug');
      if (slugFromUrl) return slugFromUrl;
      const saved = localStorage.getItem('bwa_admin_active_course_slug');
      if (saved) return saved;
    } catch (e) {}
    return 'better-man';
  });

  const [activeSectionTab, setActiveSectionTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('sectionTab');
      if (tabFromUrl && ['hero', 'syllabus', 'methodology'].includes(tabFromUrl)) return tabFromUrl;
    } catch (e) {}
    return 'hero';
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSlug, setNewCourseSlug] = useState('');

  // Fetch all courses map
  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/courses/details-settings`);
      if (!res.ok) throw new Error('Failed to load courses');
      const data = await res.json();
      setCoursesMap(data || {});
      if (!activeSlug || !data[activeSlug]) {
        const firstSlug = Object.keys(data)[0] || 'better-man';
        setActiveSlug(firstSlug);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  // Sync state to URL and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bwa_admin_active_course_slug', activeSlug);
      const url = new URL(window.location.href);
      url.searchParams.set('courseSlug', activeSlug);
      url.searchParams.set('sectionTab', activeSectionTab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [activeSlug, activeSectionTab]);

  const currentCourse = coursesMap[activeSlug] || {};

  // Generic Field Updater
  const handleFieldChange = (field, value) => {
    setCoursesMap((prev) => ({
      ...prev,
      [activeSlug]: {
        ...(prev[activeSlug] || {}),
        [field]: value
      }
    }));
  };

  // Writeup (Methodology) Field Updater
  const handleWriteupChange = (field, value) => {
    setCoursesMap((prev) => ({
      ...prev,
      [activeSlug]: {
        ...(prev[activeSlug] || {}),
        writeup: {
          ...((prev[activeSlug] || {}).writeup || {}),
          [field]: value
        }
      }
    }));
  };

  // Highlights (hl) Updater
  const handleHlChange = (index, subIndex, value) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newHl = Array.isArray(course.hl) ? [...course.hl] : [['', ''], ['', '']];
      if (!newHl[index]) newHl[index] = ['', ''];
      newHl[index][subIndex] = value;
      return {
        ...prev,
        [activeSlug]: {
          ...course,
          hl: newHl
        }
      };
    });
  };

  // What's Inside Checklist Updaters
  const handleInsideItemChange = (index, value) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newInside = [...(course.inside || [])];
      newInside[index] = value;
      return {
        ...prev,
        [activeSlug]: { ...course, inside: newInside }
      };
    });
  };

  const handleAddInsideItem = () => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newInside = [...(course.inside || []), 'New feature or inclusion'];
      return {
        ...prev,
        [activeSlug]: { ...course, inside: newInside }
      };
    });
  };

  const handleRemoveInsideItem = (index) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newInside = (course.inside || []).filter((_, i) => i !== index);
      return {
        ...prev,
        [activeSlug]: { ...course, inside: newInside }
      };
    });
  };

  // Canvas Chips (tags on thumbnail preview)
  const handleChipChange = (index, value) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newChips = [...(course.chips || ['Tag 1', 'Tag 2'])];
      newChips[index] = value;
      return {
        ...prev,
        [activeSlug]: { ...course, chips: newChips }
      };
    });
  };

  // Syllabus Modules Updaters
  const handleSyllabusChange = (index, field, value) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newSyllabus = [...(course.syllabus || [])];
      newSyllabus[index] = { ...newSyllabus[index], [field]: value };
      return {
        ...prev,
        [activeSlug]: { ...course, syllabus: newSyllabus }
      };
    });
  };

  const handleAddSyllabusModule = () => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const currentList = course.syllabus || [];
      const nextNum = String(currentList.length + 1).padStart(2, '0');
      const newSyllabus = [
        ...currentList,
        {
          n: nextNum,
          t: 'New Masterclass Module Title',
          d: 'Detailed psychological frameworks, actionable exercises, and real-world implementation.'
        }
      ];
      return {
        ...prev,
        [activeSlug]: { ...course, syllabus: newSyllabus }
      };
    });
  };

  const handleRemoveSyllabusModule = (index) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const newSyllabus = (course.syllabus || [])
        .filter((_, i) => i !== index)
        .map((mod, i) => ({ ...mod, n: String(i + 1).padStart(2, '0') }));
      return {
        ...prev,
        [activeSlug]: { ...course, syllabus: newSyllabus }
      };
    });
  };

  const handleMoveSyllabus = (index, direction) => {
    setCoursesMap((prev) => {
      const course = prev[activeSlug] || {};
      const list = [...(course.syllabus || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      const renumbered = list.map((mod, i) => ({ ...mod, n: String(i + 1).padStart(2, '0') }));
      return {
        ...prev,
        [activeSlug]: { ...course, syllabus: renumbered }
      };
    });
  };

  // Save active course
  const handleSaveCourse = async () => {
    if (!currentCourse || !activeSlug) return;
    try {
      setSaving(true);
      setSaveSuccess(false);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/details-settings/${activeSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(currentCourse)
      });
      if (!res.ok) throw new Error('Failed to save course details');
      const data = await res.json();
      setCoursesMap((prev) => ({ ...prev, [activeSlug]: data.data }));
      setSaveSuccess(true);
      showToast(`✨ Course "${currentCourse.title || activeSlug}" saved live!`, 'success');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error saving course', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Reset active course to default
  const handleResetCourse = async () => {
    if (!window.confirm(`Are you sure you want to reset "${currentCourse.title || activeSlug}" to its default content?`)) {
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/details-settings/${activeSlug}/reset`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to reset course');
      const data = await res.json();
      setCoursesMap((prev) => ({ ...prev, [activeSlug]: data.data }));
      showToast('Course reset to original defaults', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error resetting course', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add new course handler
  const handleCreateNewCourse = () => {
    if (!newCourseTitle.trim()) {
      showToast('Please enter a course title', 'error');
      return;
    }
    const cleanSlug = (newCourseSlug.trim() || newCourseTitle.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (coursesMap[cleanSlug]) {
      showToast('A course with this URL slug already exists', 'error');
      return;
    }

    const nextCount = Object.keys(coursesMap).length + 1;
    const newCourseObj = {
      slug: cleanSlug,
      n: String(nextCount).padStart(2, '0'),
      chips: ['Leadership', 'Mastery'],
      soon: true,
      cls: 'v3',
      title: newCourseTitle.trim(),
      lede: 'Master the psychology and strategies to elevate your life, career, and inner sovereignty.',
      d: 'Comprehensive video modules with private 1-on-1 coaching sessions.',
      sidebarChips: [
        ['Schedule', 'Self-Paced'],
        ['Certificate', 'Yes'],
        ['Language', 'Hinglish / English'],
        ['Mentorship', '1-on-1 Live']
      ],
      hl: [
        ['Real-World Transformation', '(Not Just Theory)'],
        ['2 Private Sessions', 'with Aarkesh']
      ],
      inside: [
        '6 HD video modules & actionable frameworks',
        'Downloadable workbooks & mental models',
        '2 private 1-on-1 coaching sessions with Aarkesh',
        'Lifetime access with all future updates'
      ],
      facts: [['6', 'Modules'], ['2 Free', '1-on-1 Sessions']],
      price: '₹4,999',
      was: '₹9,999',
      cta: 'Check Course',
      syllabusTitle: 'Six Modules To Complete Breakthrough',
      syllabusSubtitle: 'A structured roadmap designed to shift how you communicate, decide, and execute.',
      syllabus: [
        { n: '01', t: 'The Foundation of Clarity', d: 'Dismantling mental fog, identifying core blockers, and establishing your primary focus.' },
        { n: '02', t: 'Emotional Composure Under Pressure', d: 'Conditioning your nervous system to stay steady, sharp, and deliberate.' },
        { n: '03', t: 'Strategic Execution & Momentum', d: 'Turning vision into daily disciplined action without friction or burnout.' }
      ],
      writeup: {
        chip: 'CORE METHODOLOGY',
        h1: `Why ${newCourseTitle.trim()} Changes Everything`,
        lede: 'True sovereignty is not accidental. It is the deliberate result of structured principles and consistent execution.',
        p1: 'Most people struggle not from lack of ambition, but from emotional friction and absence of a clear behavioral framework.',
        quote: 'Clarity creates courage. Courage creates momentum.',
        p2: 'Through step-by-step masterclasses, you dismantle reactive habits and install elite mental models that last a lifetime.',
        distinction: 'Reactive individuals wait for circumstances to change. Anchored leaders change their internal state first.'
      }
    };

    setCoursesMap((prev) => ({ ...prev, [cleanSlug]: newCourseObj }));
    setActiveSlug(cleanSlug);
    setShowAddCourseModal(false);
    setNewCourseTitle('');
    setNewCourseSlug('');
    showToast(`🎉 New course "${newCourseObj.title}" created! Click Save to publish.`, 'success');
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center gap-3 text-white/50">
        <ArrowClockwise size={24} className="animate-spin text-[#c79c6e]" />
        <span>Loading courses editor...</span>
      </div>
    );
  }

  const courseSlugs = Object.keys(coursesMap);
  const writeup = currentCourse.writeup || {};

  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-[#050505] text-white flex flex-col">
      {/* ── TOP ACTION & COURSE SELECTOR BAR ── */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/5 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-[57px] z-20">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <GraduationCap size={22} className="text-[#c79c6e]" />
            <h1 className="font-serif text-xl sm:text-2xl text-white font-medium">Multi-Course Editor</h1>
          </div>

          <span className="text-white/20">|</span>

          {/* Course Switcher Pills */}
          <div className="flex items-center gap-1.5 bg-[#121212] p-1 rounded-xl border border-white/10 overflow-x-auto max-w-[500px]">
            {courseSlugs.map((slug) => {
              const c = coursesMap[slug] || {};
              const isSelected = activeSlug === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setActiveSlug(slug)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#c79c6e] text-black shadow-md shadow-[#c79c6e]/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{c.title || slug}</span>
                  {c.soon ? (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase ${isSelected ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-400'}`}>
                      Soon
                    </span>
                  ) : (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase ${isSelected ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      Live
                    </span>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowAddCourseModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#c79c6e] hover:bg-[#c79c6e]/10 border border-[#c79c6e]/30 transition-colors cursor-pointer whitespace-nowrap"
              title="Create New Course"
            >
              <Plus size={13} weight="bold" />
              <span>New Course</span>
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <a
            href={`https://aarkeshgupta.com/course/${activeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <ArrowSquareOut size={15} />
            <span>View Live Course</span>
          </a>

          <button
            type="button"
            onClick={handleSaveCourse}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              saveSuccess 
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                : 'bg-[#c79c6e] hover:bg-[#b58b5e] text-black shadow-lg shadow-[#c79c6e]/20'
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
                <span>Save Course Details</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN SPLIT: LEFT SIDEBAR TABS & RIGHT EDITING FORM ── */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Section Navigation Sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 bg-[#080808] border-b lg:border-b-0 lg:border-r border-white/5 p-4 sm:p-5 flex flex-col gap-2 shrink-0">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-semibold">
              3 PAGE SECTIONS
            </span>
            <span className="text-[10px] text-[#c79c6e] font-mono">/course/{activeSlug}</span>
          </div>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {SECTION_TABS.map((tab) => {
              const isActive = activeSectionTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSectionTab(tab.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer whitespace-nowrap lg:whitespace-normal shrink-0 ${
                    isActive
                      ? 'bg-[#141014] text-white border border-[#c79c6e]/40 shadow-[0_0_20px_rgba(199,156,110,0.1)]'
                      : 'hover:bg-white/5 text-white/60 hover:text-white border border-transparent'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${isActive ? 'bg-[#c79c6e]/20 text-[#c79c6e]' : 'bg-white/5 text-white/50'}`}>
                    {tab.icon}
                  </div>
                  <div>
                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-[#c79c6e]' : 'text-white/90'}`}>
                      {tab.label}
                    </h3>
                    <p className="text-[11px] text-white/40 leading-snug mt-0.5 line-clamp-1 hidden sm:block">
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-white/5 hidden lg:block space-y-2">
            <button
              type="button"
              onClick={handleResetCourse}
              className="w-full py-2.5 px-3 rounded-lg text-xs font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowClockwise size={14} />
              <span>Reset Course to Defaults</span>
            </button>
          </div>
        </aside>

        {/* Right Editor Form Area */}
        <main className="flex-1 p-6 sm:p-8 xl:p-10 max-w-5xl overflow-y-auto">
          {/* ═══════════════════════════════════════════════════════════════
             SECTION 1: HERO & PRICING SIDEBAR (SCREENSHOT 1)
             ═══════════════════════════════════════════════════════════════ */}
          {activeSectionTab === 'hero' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              <div>
                <h2 className="font-serif text-2xl text-white">Section 1: Hero &amp; Pricing Sidebar</h2>
                <p className="text-xs text-white/50 mt-1">
                  Manage the top course title, lede statement, thumbnail tags, pricing numbers, and what's inside feature list.
                </p>
              </div>

              {/* Live Preview Box */}
              <div className="rounded-2xl border border-white/10 bg-[#0A050C] p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start shadow-2xl relative overflow-hidden">
                <div className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-widest text-[#c79c6e] bg-[#c79c6e]/10 border border-[#c79c6e]/30 px-2 py-0.5 rounded-full">
                  Live Preview
                </div>

                {/* Left Preview: Thumbnail Canvas & Title */}
                <div className="space-y-4">
                  <div className="relative aspect-[16/10] rounded-xl bg-gradient-to-br from-[#40133A] to-[#180516] border border-[#C878BE]/30 flex flex-col justify-between p-5 overflow-hidden">
                    <div className="flex justify-end gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#250921] border border-[#C878BE]/40 text-[11px] font-bold text-white shadow-md">
                        {currentCourse.chips?.[0] || 'Tag 1'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-extrabold text-white tracking-tight leading-none">
                        {currentCourse.title || 'Course Title'}
                      </h3>
                      <span className="px-2.5 py-1 rounded-md bg-[#250921] border border-[#C878BE]/40 text-[11px] font-bold text-white shadow-md">
                        {currentCourse.chips?.[1] || 'Tag 2'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-bold text-white">{currentCourse.title || 'Course Title'}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${currentCourse.soon ? 'bg-amber-500/20 text-amber-300' : 'bg-[#E3B8DE]/20 text-[#E3B8DE]'}`}>
                        {currentCourse.soon ? 'Coming Soon' : 'Live now'}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      {currentCourse.lede || currentCourse.d || 'Course lede description...'}
                    </p>
                  </div>
                </div>

                {/* Right Preview: Sidebar Highlights Card */}
                <div className="rounded-xl border border-white/10 bg-[#120714] p-5 space-y-4 shadow-xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C878BE] shadow-[0_0_8px_#C878BE]"></span>
                      <span className="text-white font-bold">{currentCourse.hl?.[0]?.[0] || 'Highlight 1'}</span>
                      <span className="text-white/50">{currentCourse.hl?.[0]?.[1] || '(Sub)'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C878BE] shadow-[0_0_8px_#C878BE]"></span>
                      <span className="text-white font-bold">{currentCourse.hl?.[1]?.[0] || 'Highlight 2'}</span>
                      <span className="text-white/50">{currentCourse.hl?.[1]?.[1] || '(Sub)'}</span>
                    </div>
                  </div>

                  <div className="text-[10px] uppercase tracking-widest text-[#E3B8DE] font-bold border-t border-white/5 pt-3">
                    WHAT'S INSIDE
                  </div>

                  <ul className="space-y-1.5 text-xs text-white/70">
                    {(currentCourse.inside || []).slice(0, 4).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={14} className="text-[#C878BE] mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-white/5 flex items-baseline gap-2">
                    <span className="text-xs text-white/50">Price</span>
                    <span className="text-lg font-bold text-[#E3B8DE]">{currentCourse.price || '₹15,000'}</span>
                    <s className="text-xs text-white/40">{currentCourse.was || '₹25,000'}</s>
                  </div>
                </div>
              </div>

              {/* Form Fields: Basic Metadata */}
              <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#c79c6e] font-bold flex items-center gap-2">
                  <Tag size={15} /> 1. Course Title &amp; Status
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Course Title</label>
                    <input
                      type="text"
                      value={currentCourse.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      placeholder="The Better Man"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-medium">URL Slug (Cannot Change)</label>
                    <input
                      type="text"
                      value={currentCourse.slug || ''}
                      disabled
                      className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 text-white/40 text-sm font-mono cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Availability Status</label>
                    <select
                      value={currentCourse.soon ? 'soon' : 'live'}
                      onChange={(e) => handleFieldChange('soon', e.target.value === 'soon')}
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60 cursor-pointer"
                    >
                      <option value="live">Live Now (Enrolling)</option>
                      <option value="soon">Coming Soon (Waitlist)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Lede Description Statement</label>
                  <textarea
                    rows={2}
                    value={currentCourse.lede || currentCourse.d || ''}
                    onChange={(e) => {
                      handleFieldChange('lede', e.target.value);
                      handleFieldChange('d', e.target.value);
                    }}
                    placeholder="Master the psychology of calm authority, magnetic communication and effortless self-command."
                    className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Thumbnail Canvas Tag #1</label>
                    <input
                      type="text"
                      value={currentCourse.chips?.[0] || ''}
                      onChange={(e) => handleChipChange(0, e.target.value)}
                      placeholder="Calm Authority"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Thumbnail Canvas Tag #2</label>
                    <input
                      type="text"
                      value={currentCourse.chips?.[1] || ''}
                      onChange={(e) => handleChipChange(1, e.target.value)}
                      placeholder="Self-Command"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60"
                    />
                  </div>
                </div>
              </div>

              {/* Form Fields: Pricing & Highlights */}
              <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#c79c6e] font-bold flex items-center gap-2">
                  <CurrencyInr size={15} /> 2. Pricing &amp; Key Highlight Bullets
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Course Offer Price</label>
                    <input
                      type="text"
                      value={currentCourse.price || ''}
                      onChange={(e) => handleFieldChange('price', e.target.value)}
                      placeholder="₹15,000"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Strikethrough Price (Was)</label>
                    <input
                      type="text"
                      value={currentCourse.was || ''}
                      onChange={(e) => handleFieldChange('was', e.target.value)}
                      placeholder="₹25,000"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60"
                    />
                  </div>
                </div>

                {/* 2 Glowing Bullet Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-3">
                    <span className="text-xs font-bold text-[#E3B8DE] uppercase tracking-wider">Top Highlight #1</span>
                    <input
                      type="text"
                      value={currentCourse.hl?.[0]?.[0] || ''}
                      onChange={(e) => handleHlChange(0, 0, e.target.value)}
                      placeholder="Bold Text (e.g. Build Real Presence)"
                      className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#c79c6e]/60"
                    />
                    <input
                      type="text"
                      value={currentCourse.hl?.[0]?.[1] || ''}
                      onChange={(e) => handleHlChange(0, 1, e.target.value)}
                      placeholder="Subtext (e.g. (Not Just Theory))"
                      className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#c79c6e]/60"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-3">
                    <span className="text-xs font-bold text-[#E3B8DE] uppercase tracking-wider">Top Highlight #2</span>
                    <input
                      type="text"
                      value={currentCourse.hl?.[1]?.[0] || ''}
                      onChange={(e) => handleHlChange(1, 0, e.target.value)}
                      placeholder="Bold Text (e.g. 3 Private Sessions)"
                      className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#c79c6e]/60"
                    />
                    <input
                      type="text"
                      value={currentCourse.hl?.[1]?.[1] || ''}
                      onChange={(e) => handleHlChange(1, 1, e.target.value)}
                      placeholder="Subtext (e.g. with Aarkesh)"
                      className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#c79c6e]/60"
                    />
                  </div>
                </div>
              </div>

              {/* Form Fields: What's Inside Checklist */}
              <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#c79c6e] font-bold flex items-center gap-2">
                    <ShieldCheck size={15} /> 3. What's Inside Features Checklist
                  </span>
                  <button
                    type="button"
                    onClick={handleAddInsideItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#c79c6e] border border-[#c79c6e]/30 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(currentCourse.inside || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-white/30 w-6 text-right shrink-0">{idx + 1}.</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleInsideItemChange(idx, e.target.value)}
                        placeholder="Feature inclusion..."
                        className="flex-1 bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#c79c6e]/60"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveInsideItem(idx)}
                        className="p-2 text-white/40 hover:text-red-400 transition-colors"
                        title="Delete Item"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
             SECTION 2: SYLLABUS & MODULES GRID (SCREENSHOT 2)
             ═══════════════════════════════════════════════════════════════ */}
          {activeSectionTab === 'syllabus' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              <div>
                <h2 className="font-serif text-2xl text-white">Section 2: Syllabus &amp; Modules Roadmap</h2>
                <p className="text-xs text-white/50 mt-1">
                  Customize the syllabus headline, roadmap subtitle, and add/edit/reorder masterclass modules.
                </p>
              </div>

              {/* Syllabus Header Settings */}
              <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#c79c6e] font-bold flex items-center gap-2">
                  <Tag size={15} /> Syllabus Section Header
                </span>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Main Syllabus Headline</label>
                  <input
                    type="text"
                    value={currentCourse.syllabusTitle || ''}
                    onChange={(e) => handleFieldChange('syllabusTitle', e.target.value)}
                    placeholder="Eight Modules To Total Self-Command"
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Syllabus Subtitle / Roadmap Description</label>
                  <textarea
                    rows={2}
                    value={currentCourse.syllabusSubtitle || ''}
                    onChange={(e) => handleFieldChange('syllabusSubtitle', e.target.value)}
                    placeholder="A comprehensive, step-by-step roadmap from baseline nervousness to unshakeable gravitas."
                    className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60 resize-none"
                  />
                </div>
              </div>

              {/* Modules List Editor */}
              <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#c79c6e] font-bold flex items-center gap-2">
                    <ListNumbers size={15} /> Masterclass Modules ({(currentCourse.syllabus || []).length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSyllabusModule}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#c79c6e] border border-[#c79c6e]/30 transition-colors cursor-pointer"
                  >
                    <Plus size={14} weight="bold" />
                    <span>Add New Module</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(currentCourse.syllabus || []).map((mod, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#141414] border border-white/5 flex flex-col gap-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md bg-[#250921] border border-[#C878BE]/40 text-xs font-mono font-bold text-[#E3B8DE]">
                          {mod.n || String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSyllabus(idx, -1)}
                            className="p-1 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (currentCourse.syllabus || []).length - 1}
                            onClick={() => handleMoveSyllabus(idx, 1)}
                            className="p-1 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSyllabusModule(idx)}
                            className="p-1 text-white/40 hover:text-red-400 transition-colors ml-1"
                            title="Delete Module"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-white/40">Module Title</label>
                        <input
                          type="text"
                          value={mod.t || ''}
                          onChange={(e) => handleSyllabusChange(idx, 't', e.target.value)}
                          placeholder="e.g. The Foundation of Presence"
                          className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-[#c79c6e]/60"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-white/40">Module Description</label>
                        <textarea
                          rows={3}
                          value={mod.d || ''}
                          onChange={(e) => handleSyllabusChange(idx, 'd', e.target.value)}
                          placeholder="Grounding techniques, diaphragmatic breathing..."
                          className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg p-3 text-white text-xs focus:outline-none focus:border-[#c79c6e]/60 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
             SECTION 3: CORE METHODOLOGY & DEEP DIVE (SCREENSHOT 3)
             ═══════════════════════════════════════════════════════════════ */}
          {activeSectionTab === 'methodology' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              <div>
                <h2 className="font-serif text-2xl text-white">Section 3: Core Methodology &amp; Deep Dive</h2>
                <p className="text-xs text-white/50 mt-1">
                  Craft the long-form narrative, quote box, and psychological breakdown that convinces students to enroll.
                </p>
              </div>

              {/* Live Preview Box of Methodology */}
              <div className="rounded-2xl border border-white/10 bg-[#0E0610] p-8 space-y-5 shadow-2xl relative">
                <div className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-widest text-[#c79c6e] bg-[#c79c6e]/10 border border-[#c79c6e]/30 px-2 py-0.5 rounded-full">
                  Live Preview
                </div>

                <span className="inline-block px-3 py-1 rounded-md border border-[#C878BE]/50 bg-[#250921] text-[10px] font-mono uppercase tracking-widest text-[#E3B8DE] font-bold">
                  {writeup.chip || 'CORE METHODOLOGY'}
                </span>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
                  {writeup.h1 || 'Most Men Were Never Taught How to Hold Ground'}
                </h3>

                <p className="text-sm font-semibold text-white/90 border-l-2 border-[#C878BE] pl-4 py-1 leading-relaxed">
                  {writeup.lede || 'True charisma is not loud. It is the unhurried certainty of a man who does not need permission to take up space.'}
                </p>

                <p className="text-xs text-white/60 leading-relaxed">
                  {writeup.p1 || 'When pressure spikes in a meeting, negotiation, or relationship...'}
                </p>

                {/* Callout Quote Box */}
                <div className="p-6 rounded-2xl bg-[#140A16] border border-[#C878BE]/30 relative my-4">
                  <Quotes size={24} weight="fill" className="text-[#C878BE]/40 mb-2" />
                  <p className="text-sm sm:text-base font-serif italic text-white/90 leading-snug">
                    "{writeup.quote || "A room doesn't respond to volume. It responds to certainty."}"
                  </p>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  {writeup.p2 || 'Through structured modules, you dismantle reactive habits...'}
                </p>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-[#E3B8DE] font-medium leading-relaxed">
                  💡 {writeup.distinction || 'Reactive men seek approval... Anchored men lead through stillness.'}
                </div>
              </div>

              {/* Form Fields for Methodology */}
              <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#c79c6e] font-bold flex items-center gap-2">
                  <Quotes size={15} /> 1. Headlines &amp; Opening Philosophy
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Eyebrow Tag Chip</label>
                    <input
                      type="text"
                      value={writeup.chip || ''}
                      onChange={(e) => handleWriteupChange('chip', e.target.value)}
                      placeholder="CORE METHODOLOGY"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Main Section Title (H1)</label>
                    <input
                      type="text"
                      value={writeup.h1 || ''}
                      onChange={(e) => handleWriteupChange('h1', e.target.value)}
                      placeholder="Most Men Were Never Taught How to Hold Ground"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Bold Opening Statement (Lede)</label>
                  <textarea
                    rows={2}
                    value={writeup.lede || ''}
                    onChange={(e) => handleWriteupChange('lede', e.target.value)}
                    placeholder="True charisma is not loud. It is the unhurried certainty of a man who does not need permission to take up space."
                    className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60 resize-none"
                  />
                </div>
              </div>

              {/* Form Fields: Narrative & Quote Box */}
              <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#c79c6e] font-bold flex items-center gap-2">
                  <Quotes size={15} /> 2. Deep Dive Narrative &amp; Callout Quote
                </span>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Narrative Paragraph #1 (The Problem)</label>
                  <textarea
                    rows={3}
                    value={writeup.p1 || ''}
                    onChange={(e) => handleWriteupChange('p1', e.target.value)}
                    placeholder="When pressure spikes in a meeting, negotiation, or relationship..."
                    className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-[#E3B8DE] font-bold">
                    Featured Callout Quote (In Glowing Box)
                  </label>
                  <input
                    type="text"
                    value={writeup.quote || ''}
                    onChange={(e) => handleWriteupChange('quote', e.target.value)}
                    placeholder="A room doesn't respond to volume. It responds to certainty."
                    className="w-full bg-[#200A1E] border border-[#C878BE]/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C878BE]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Narrative Paragraph #2 (The Solution)</label>
                  <textarea
                    rows={3}
                    value={writeup.p2 || ''}
                    onChange={(e) => handleWriteupChange('p2', e.target.value)}
                    placeholder="Through 8 structured modules, you dismantle the nervous system habits..."
                    className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Key Distinction / Bottom Summary Line</label>
                  <textarea
                    rows={2}
                    value={writeup.distinction || ''}
                    onChange={(e) => handleWriteupChange('distinction', e.target.value)}
                    placeholder="Reactive men seek approval through fast speech. Anchored men lead through stillness."
                    className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#c79c6e]/60 resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── CREATE NEW COURSE MODAL ── */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-serif text-lg text-white font-medium">Create New Masterclass</h3>
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-white/60">Masterclass / Course Title</label>
                <input
                  type="text"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Executive Gravitas & Vocal Presence"
                  className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-white/60">Custom URL Slug (Optional)</label>
                <input
                  type="text"
                  value={newCourseSlug}
                  onChange={(e) => setNewCourseSlug(e.target.value)}
                  placeholder="e.g. vocal-presence"
                  className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e] font-mono text-xs"
                />
                <span className="text-[11px] text-white/40">Will be accessible at: /course/your-slug</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewCourse}
                className="px-5 py-2 rounded-xl bg-[#c79c6e] hover:bg-[#b58b5e] text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#c79c6e]/20"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
