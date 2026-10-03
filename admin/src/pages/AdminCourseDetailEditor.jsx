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
  ArrowDown,
  ArrowLeft,
  PencilSimple,
  MagnifyingGlass,
  BookOpen,
  Eye,
  Clock,
  SquaresFour,
  SlidersHorizontal,
  Palette
} from '@phosphor-icons/react';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SECTION_TABS = [
  {
    id: 'hero',
    label: '1. Hero & Pricing Sidebar',
    icon: <Desktop size={18} />,
    description: 'Theme style, title, tags, price & summary card'
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
  
  // viewMode: 'catalog' (card grid) | 'editor' (3-section editor)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'editor') return 'editor';
      if (view === 'catalog') return 'catalog';
    } catch (e) {}
    return 'catalog'; // default to catalog view
  });

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

  // Filter & Search states for catalog view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'live' | 'waitlist'

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSlug, setNewCourseSlug] = useState('');
  const [newCourseTheme, setNewCourseTheme] = useState('black');

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
      url.searchParams.set('view', viewMode);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [activeSlug, activeSectionTab, viewMode]);

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

  // Open Editor for a specific course
  const handleOpenEditor = (slug) => {
    setActiveSlug(slug);
    setViewMode('editor');
  };

  // Toggle Live vs Waitlist status for a course directly
  const handleToggleCourseStatus = async (slugToToggle, e) => {
    if (e) e.stopPropagation();
    const course = coursesMap[slugToToggle];
    if (!course) return;
    const updatedSoon = !course.soon;
    const updatedCourse = { ...course, soon: updatedSoon };
    
    setCoursesMap((prev) => ({
      ...prev,
      [slugToToggle]: updatedCourse
    }));

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/details-settings/${slugToToggle}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedCourse)
      });
      if (!res.ok) throw new Error('Failed to update status');
      showToast(`Status updated: "${updatedCourse.title || slugToToggle}" is now ${updatedSoon ? 'Waitlist' : 'LIVE'}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error updating course status', 'error');
    }
  };

  // Delete Course
  const handleDeleteCourse = async (slugToDelete, courseTitle, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${courseTitle || slugToDelete}"? This cannot be undone.`)) {
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/details-settings/${slugToDelete}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to delete course');
      
      setCoursesMap((prev) => {
        const updated = { ...prev };
        delete updated[slugToDelete];
        return updated;
      });

      if (activeSlug === slugToDelete) {
        const remainingSlugs = Object.keys(coursesMap).filter(s => s !== slugToDelete);
        setActiveSlug(remainingSlugs[0] || 'better-man');
        setViewMode('catalog');
      }

      showToast(`Course "${courseTitle || slugToDelete}" deleted successfully`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error deleting course', 'error');
    }
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
      theme: newCourseTheme || 'black',
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
    setViewMode('editor');
    setShowAddCourseModal(false);
    setNewCourseTitle('');
    setNewCourseSlug('');
    showToast(`🎉 New course "${newCourseObj.title}" created! Now configure its 3 sections.`, 'success');
  };

  // Helper to determine the theme of a card
  const getCardTheme = (course, index) => {
    if (course.theme) return course.theme;
    if (course.slug === 'better-man' || index % 3 === 0) return 'black';
    if (course.slug === 'difficult-people' || index % 3 === 1) return 'purple';
    return 'white';
  };

  if (loading) {
    return (
      <div className="preserve-dark w-full h-96 flex items-center justify-center gap-3 text-white bg-[#0e070e]" data-preserve-dark="true">
        <ArrowClockwise size={24} className="animate-spin text-[#c9542f]" />
        <span style={{ color: '#ffffff' }}>Loading courses library...</span>
      </div>
    );
  }

  const courseSlugs = Object.keys(coursesMap);
  const writeup = currentCourse.writeup || {};

  // Filtered courses for catalog grid
  const filteredSlugs = courseSlugs.filter((slug) => {
    const c = coursesMap[slug] || {};
    const titleMatch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || slug.toLowerCase().includes(searchQuery.toLowerCase());
    if (!titleMatch) return false;
    if (statusFilter === 'live') return !c.soon;
    if (statusFilter === 'waitlist') return !!c.soon;
    return true;
  });

  const totalCourses = courseSlugs.length;
  const liveCount = courseSlugs.filter(s => !coursesMap[s]?.soon).length;
  const waitlistCount = courseSlugs.filter(s => coursesMap[s]?.soon).length;
  const totalModules = courseSlugs.reduce((acc, s) => acc + (coursesMap[s]?.syllabus?.length || 0), 0);

  // =========================================================================
  // VIEW 1: CATALOG CARD GRID VIEW (3 CLIENT THEMES MATCHING)
  // =========================================================================
  if (viewMode === 'catalog') {
    return (
      <div 
        className="preserve-dark w-full min-h-[calc(100vh-120px)] bg-gradient-to-b from-[#180e18] via-[#0f0810] to-[#080508] text-white flex flex-col"
        data-preserve-dark="true"
      >
        {/* Top Header Banner */}
        <div className="w-full bg-[#110912]/95 backdrop-blur-md border-b border-white/10 px-6 sm:px-10 py-6 sm:py-8 sticky top-[57px] z-20 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#c9542f]/20 text-[#ff7347] text-[10px] uppercase font-mono font-bold tracking-widest border border-[#c9542f]/40">
                  3-THEME COURSE CATALOG & EDITOR
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-white font-semibold flex items-center gap-3" style={{ color: '#ffffff' }}>
                <GraduationCap size={32} className="text-[#c9542f]" />
                <span style={{ color: '#ffffff' }}>Masterclasses Library</span>
              </h1>
              <p className="text-xs sm:text-sm mt-1 max-w-2xl" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                Showing your courses in their exact 3 visual themes: <strong style={{ color: '#ffffff' }}>Obsidian Black</strong>, <strong style={{ color: '#E3B8DE' }}>Royal Purple</strong>, and <strong style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.12)' }} className="px-1.5 py-0.5 rounded">Clean White</strong>. Click <strong style={{ color: '#c9542f' }}>"Edit 3-Sections"</strong> to customize.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAddCourseModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#c9542f]/25 cursor-pointer"
                style={{ color: '#ffffff' }}
              >
                <Plus size={16} weight="bold" />
                <span>Create New Masterclass</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar & Search / Filter Controls */}
          <div className="max-w-7xl mx-auto mt-6 pt-5 border-t border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Quick Metrics Chips */}
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <span className="font-serif text-base font-bold" style={{ color: '#ffffff' }}>{totalCourses}</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Courses</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }} className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-serif text-base font-bold" style={{ color: '#34d399' }}>{liveCount}</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Live Enrolling</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }} className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <span className="inline-block w-2 h-2 rounded-full bg-[#c9542f]"></span>
                <span className="font-serif text-base font-bold" style={{ color: '#c9542f' }}>{waitlistCount}</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Waitlist / Coming Soon</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }} className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <span className="font-serif text-base font-bold" style={{ color: '#E3B8DE' }}>{totalModules}</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Modules</span>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Box */}
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search course title or slug..."
                  className="w-full bg-[#181119] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c9542f] placeholder-white/30"
                  style={{ color: '#ffffff' }}
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center bg-[#181119] p-0.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'all' ? 'bg-[#c9542f] text-white' : 'text-white/60 hover:text-white'
                  }`}
                  style={{ color: statusFilter === 'all' ? '#ffffff' : 'rgba(255,255,255,0.7)' }}
                >
                  All ({totalCourses})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('live')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'live' ? 'bg-emerald-500 text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Live ({liveCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('waitlist')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'waitlist' ? 'bg-[#c9542f] text-white' : 'text-white/60 hover:text-white'
                  }`}
                  style={{ color: statusFilter === 'waitlist' ? '#ffffff' : 'rgba(255,255,255,0.7)' }}
                >
                  Waitlist ({waitlistCount})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── COURSE CARDS GRID (EXACT 3 CLIENT THEMES) ── */}
        <div className="max-w-7xl mx-auto w-full p-6 sm:p-10 flex-1">
          {filteredSlugs.length === 0 ? (
            <div className="w-full bg-[#140c15] border border-dashed border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <GraduationCap size={40} className="text-white/20" />
              <h3 className="text-base font-semibold" style={{ color: '#ffffff' }}>No courses match your search</h3>
              <p className="text-xs max-w-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Try clearing your search query or create a new masterclass course.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="mt-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#c9542f] border border-[#c9542f]/30"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredSlugs.map((slug, idx) => {
                const c = coursesMap[slug] || {};
                const isLive = !c.soon;
                const cardTheme = getCardTheme(c, idx);

                // Setup theme-specific card container classes
                let cardBgClass = 'bg-[#0B070B] text-white border border-[#c878be]/25 shadow-2xl shadow-black/80';
                let visBgStyle = { background: 'radial-gradient(circle at 30% 25%, #8A2E80, #3D1A38 60%, #0A050A)' };
                let titleHex = '#ffffff';
                let ledeHex = 'rgba(255, 255, 255, 0.75)';
                let priceColor = 'text-[#E3B8DE]';
                let badgeClass = 'bg-[#2E1A2B] text-[#E3B8DE] border border-[#c878be]/30';

                if (cardTheme === 'purple') {
                  cardBgClass = 'bg-gradient-to-b from-[#58184E] to-[#2E0B29] text-white border border-white/20 shadow-2xl shadow-black/60';
                  visBgStyle = { background: 'radial-gradient(circle at 70% 25%, #1a1a1a, #080808 75%)' };
                  titleHex = '#ffffff';
                  ledeHex = 'rgba(255, 255, 255, 0.8)';
                  priceColor = 'text-white';
                  badgeClass = 'bg-white/95 text-[#7A2A70]';
                } else if (cardTheme === 'white') {
                  cardBgClass = 'bg-[#FFFFFF] text-[#110D13] border border-[#7A2A70]/15 shadow-2xl shadow-purple-950/15';
                  visBgStyle = { background: 'radial-gradient(circle at 30% 28%, #C878BE, #7A2A70 45%, #3D1A38 80%)' };
                  titleHex = '#110D13';
                  ledeHex = '#4A434E';
                  priceColor = 'text-[#7A2A70]';
                  badgeClass = 'bg-[#F6ECF4] text-[#7A2A70] border border-[#7A2A70]/20';
                }

                return (
                  <div
                    key={slug}
                    className={`group ${cardBgClass} rounded-[28px] p-6 transition-all duration-300 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(122,42,112,0.25)] relative overflow-hidden`}
                  >
                    {/* Top Visual Box with Huge Number & Slanted Pills */}
                    <div
                      style={visBgStyle}
                      className="relative aspect-[16/10] rounded-[22px] mb-5 overflow-hidden flex items-center justify-center border border-white/10 group-hover:scale-[1.01] transition-transform duration-300 shadow-inner select-none"
                    >
                      {/* Top Right Live / Coming Soon Status Pill */}
                      <div className="absolute top-3 right-3 z-20">
                        {isLive ? (
                          <span 
                            onClick={(e) => handleToggleCourseStatus(slug, e)}
                            title="Click to toggle status"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#E11D48] text-[10px] font-bold uppercase tracking-wider shadow-md cursor-pointer hover:scale-105 transition-transform"
                            style={{ color: '#E11D48' }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse"></span>
                            Live
                          </span>
                        ) : (
                          <span 
                            onClick={(e) => handleToggleCourseStatus(slug, e)}
                            title="Click to toggle status"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20 shadow-md cursor-pointer hover:scale-105 transition-transform"
                            style={{ color: '#ffffff' }}
                          >
                            Coming soon
                          </span>
                        )}
                      </div>

                      {/* Center Huge Sequence Number */}
                      <span className="font-sans font-bold text-7xl sm:text-8xl text-white tracking-tighter leading-none drop-shadow-md" style={{ color: '#ffffff' }}>
                        {c.n || String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Top Right Tilted Chip Pill */}
                      {c.chips?.[0] && (
                        <span 
                          className="absolute top-4 right-1 sm:right-2 rotate-[-12deg] bg-gradient-to-br from-[#C878BE] to-[#6E2266] text-white px-3.5 py-1.5 rounded-2xl text-[11px] sm:text-xs font-semibold shadow-lg shadow-black/40 border border-white/20"
                          style={{ color: '#ffffff' }}
                        >
                          {c.chips[0]}
                        </span>
                      )}

                      {/* Bottom Left Tilted Chip Pill */}
                      {c.chips?.[1] && (
                        <span 
                          className="absolute bottom-4 left-1 sm:left-2 rotate-[9deg] bg-gradient-to-br from-[#8A6BFF] to-[#3A2A86] text-white px-3.5 py-1.5 rounded-2xl text-[11px] sm:text-xs font-semibold shadow-lg shadow-black/40 border border-white/20"
                          style={{ color: '#ffffff' }}
                        >
                          {c.chips[1]}
                        </span>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Course Title */}
                        <h2 
                          className="font-serif text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-2"
                          style={{ color: titleHex }}
                        >
                          {c.title || slug}
                        </h2>

                        {/* Course Short Description */}
                        <p 
                          className="text-xs sm:text-sm line-clamp-2 leading-relaxed"
                          style={{ color: ledeHex }}
                        >
                          {c.lede || c.d || 'Master the psychology and strategies to elevate your life.'}
                        </p>
                      </div>

                      {/* Price Row & Tag Badge */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-baseline gap-2 font-serif text-base sm:text-lg" style={{ color: cardTheme === 'white' ? '#110D13' : '#ffffff' }}>
                          <span>Price</span>
                          <b className={`text-xl sm:text-2xl font-bold ${priceColor}`}>{c.price || '₹15,000'}</b>
                          {c.was && <s className="text-xs opacity-50">{c.was}</s>}
                        </div>

                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                          {c.soon ? 'WAITLIST' : 'POPULAR'}
                        </span>
                      </div>

                      {/* Admin Action Buttons */}
                      <div className="pt-2 flex flex-col gap-2">
                        {/* Primary Button: Edit 3-Sections */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditor(slug)}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#c9542f]/25 cursor-pointer hover:scale-[1.02]"
                          style={{ color: '#ffffff' }}
                        >
                          <PencilSimple size={16} weight="bold" />
                          <span>Edit 3-Sections</span>
                          <CaretRight size={14} weight="bold" />
                        </button>

                        {/* Secondary Actions: View Live & Delete */}
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={`https://aarkeshgupta.com/course/${slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                              cardTheme === 'white'
                                ? 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                                : 'bg-white/10 hover:bg-white/15 text-white/80'
                            }`}
                          >
                            <ArrowSquareOut size={13} />
                            <span>View Live</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteCourse(slug, c.title, e)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors cursor-pointer"
                            title={`Delete course ${c.title || slug}`}
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── "+ CREATE NEW MASTERCLASS" CARD ── */}
              <div
                onClick={() => setShowAddCourseModal(true)}
                className="group bg-[#110912]/80 border-2 border-dashed border-white/15 hover:border-[#c9542f]/60 rounded-[28px] p-8 flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 cursor-pointer min-h-[440px] hover:bg-[#180e1a]"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#c9542f]/15 group-hover:bg-[#c9542f]/25 border border-[#c9542f]/30 flex items-center justify-center text-[#c9542f] transition-transform duration-300 group-hover:scale-110">
                  <Plus size={32} weight="bold" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium group-hover:text-[#c9542f] transition-colors" style={{ color: '#ffffff' }}>
                    Add New Masterclass
                  </h3>
                  <p className="text-xs max-w-xs mt-1 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Create a custom course with its own visual theme, sequence number, pricing, syllabus modules roadmap, and long-form narrative.
                  </p>
                </div>
                <span 
                  className="px-5 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#c9542f]/20 transition-all"
                  style={{ color: '#ffffff' }}
                >
                  + Create Masterclass
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── CREATE NEW COURSE MODAL ── */}
        {showAddCourseModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#140c15] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap size={22} className="text-[#c9542f]" />
                  <h3 className="font-serif text-lg font-medium" style={{ color: '#ffffff' }}>Create New Masterclass</h3>
                </div>
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
                  <label className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Masterclass Title</label>
                  <input
                    type="text"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="e.g. Executive Gravitas & Vocal Presence"
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c9542f]"
                    style={{ color: '#ffffff' }}
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Custom URL Slug (Optional)</label>
                  <input
                    type="text"
                    value={newCourseSlug}
                    onChange={(e) => setNewCourseSlug(e.target.value)}
                    placeholder="e.g. vocal-presence"
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c9542f] font-mono text-xs"
                    style={{ color: '#ffffff' }}
                  />
                  <span className="text-[11px] text-white/40">Will be accessible at: /course/your-slug</span>
                </div>

                {/* Theme Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Visual Card Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewCourseTheme('black')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        newCourseTheme === 'black'
                          ? 'bg-[#0B070B] text-white border-[#c9542f]'
                          : 'bg-[#1c121d] text-white/60 border-white/10'
                      }`}
                      style={{ color: '#ffffff' }}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#8A2E80]"></span>
                      <span>Obsidian</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewCourseTheme('purple')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        newCourseTheme === 'purple'
                          ? 'bg-[#58184E] text-white border-[#c9542f]'
                          : 'bg-[#1c121d] text-white/60 border-white/10'
                      }`}
                      style={{ color: '#ffffff' }}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#1a1a1a]"></span>
                      <span>Royal Purple</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewCourseTheme('white')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        newCourseTheme === 'white'
                          ? 'bg-white text-black border-[#c9542f]'
                          : 'bg-[#1c121d] text-white/60 border-white/10'
                      }`}
                      style={{ color: newCourseTheme === 'white' ? '#110D13' : 'rgba(255,255,255,0.7)' }}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#C878BE]"></span>
                      <span>Clean White</span>
                    </button>
                  </div>
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
                  className="px-5 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#c9542f]/25 cursor-pointer"
                  style={{ color: '#ffffff' }}
                >
                  Create & Open Editor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: 3-SECTION EDITOR VIEW (FOR SELECTED COURSE)
  // =========================================================================
  return (
    <div 
      className="preserve-dark w-full min-h-[calc(100vh-120px)] bg-[#0a050b] text-white flex flex-col"
      data-preserve-dark="true"
    >
      {/* ── TOP ACTION & COURSE SELECTOR BAR ── */}
      <div className="w-full bg-[#110912] border-b border-white/10 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-[57px] z-20">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Back to All Courses Button */}
          <button
            type="button"
            onClick={() => setViewMode('catalog')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-colors cursor-pointer"
            style={{ color: '#ffffff' }}
          >
            <ArrowLeft size={16} weight="bold" />
            <span>← All Courses</span>
          </button>

          <span className="text-white/20">|</span>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-white/40 font-semibold hidden sm:inline">Editing:</span>
            <span className="font-serif text-lg sm:text-xl font-semibold" style={{ color: '#ffffff' }}>{currentCourse.title || activeSlug}</span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold font-mono ${currentCourse.soon ? 'bg-[#c9542f]/20 text-[#ff8059] border border-[#c9542f]/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {currentCourse.soon ? 'Waitlist' : 'Live'}
            </span>
          </div>

          <span className="text-white/20 hidden md:inline">|</span>

          {/* Quick Course Switcher Pills */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#181119] p-1 rounded-xl border border-white/10 overflow-x-auto max-w-[340px]">
            {courseSlugs.map((slug) => {
              const c = coursesMap[slug] || {};
              const isSelected = activeSlug === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setActiveSlug(slug)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#c9542f] text-white shadow-md shadow-[#c9542f]/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  style={{ color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)' }}
                >
                  <span>{c.title || slug}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <a
            href={`https://aarkeshgupta.com/course/${activeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <ArrowSquareOut size={15} />
            <span>View Live Course</span>
          </a>

          <button
            type="button"
            onClick={handleSaveCourse}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              saveSuccess 
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                : 'bg-[#c9542f] hover:bg-[#b54522] text-white shadow-lg shadow-[#c9542f]/25'
            }`}
            style={{ color: saveSuccess ? '#000000' : '#ffffff' }}
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
        <aside className="w-full lg:w-72 xl:w-80 bg-[#0e070e] border-b lg:border-b-0 lg:border-r border-white/10 p-4 sm:p-5 flex flex-col gap-2 shrink-0">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-semibold">
              3 PAGE SECTIONS
            </span>
            <span className="text-[10px] text-[#c9542f] font-mono">/course/{activeSlug}</span>
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
                      ? 'bg-[#1e101e] text-white border border-[#c9542f]/50 shadow-[0_0_20px_rgba(201,84,47,0.15)]'
                      : 'hover:bg-white/5 text-white/60 hover:text-white border border-transparent'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${isActive ? 'bg-[#c9542f]/20 text-[#c9542f]' : 'bg-white/5 text-white/50'}`}>
                    {tab.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: isActive ? '#ff7347' : '#ffffff' }}>
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

          {/* Course Status & Reset Helper Box */}
          <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">
            <div className="bg-[#181119] p-3 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-white/40">Status</span>
                <p className="text-xs font-semibold" style={{ color: '#ffffff' }}>
                  {currentCourse.soon ? 'Waitlist (Coming Soon)' : 'Live for Enrollment'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFieldChange('soon', !currentCourse.soon)}
                className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase transition-colors cursor-pointer ${
                  currentCourse.soon
                    ? 'bg-[#c9542f]/20 text-[#ff8059] hover:bg-[#c9542f]/30'
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                }`}
              >
                Toggle {currentCourse.soon ? 'to Live' : 'to Soon'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetCourse}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs transition-colors cursor-pointer"
                title="Reset this course to factory content"
              >
                <ArrowClockwise size={14} />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleDeleteCourse(activeSlug, currentCourse.title, e)}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors cursor-pointer"
                title="Delete this course"
              >
                <Trash size={15} />
              </button>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-5xl overflow-y-auto space-y-8">
          {/* =========================================================================
              SECTION 1: HERO & PRICING SIDEBAR
              ========================================================================= */}
          {activeSectionTab === 'hero' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h2 className="font-serif text-2xl font-medium" style={{ color: '#ffffff' }}>Section 1: Hero & Pricing Sidebar</h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Customize the visual card theme, tags, lede statement, pricing facts, and what's included checklist.
                </p>
              </div>

              {/* Theme Selector */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                  <Palette size={16} /> Course Visual Card Theme
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('theme', 'black')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 cursor-pointer transition-all ${
                      (currentCourse.theme || 'black') === 'black'
                        ? 'bg-[#0B070B] text-white border-[#c9542f] shadow-lg shadow-[#c9542f]/15 ring-2 ring-[#c9542f]/30'
                        : 'bg-[#1c121d] text-white/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-full h-12 rounded-xl bg-radial from-[#8A2E80] via-[#3D1A38] to-[#0A050A] flex items-center justify-center font-bold text-lg text-white">
                      01
                    </div>
                    <div>
                      <h4 className="text-xs font-bold" style={{ color: '#ffffff' }}>1. Obsidian Black</h4>
                      <p className="text-[11px] text-white/50">Purple glow banner & black card</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFieldChange('theme', 'purple')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 cursor-pointer transition-all ${
                      currentCourse.theme === 'purple'
                        ? 'bg-[#58184E] text-white border-[#c9542f] shadow-lg shadow-[#c9542f]/15 ring-2 ring-[#c9542f]/30'
                        : 'bg-[#1c121d] text-white/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-full h-12 rounded-xl bg-radial from-[#1a1a1a] to-[#080808] flex items-center justify-center font-bold text-lg text-white">
                      02
                    </div>
                    <div>
                      <h4 className="text-xs font-bold" style={{ color: '#ffffff' }}>2. Royal Purple</h4>
                      <p className="text-[11px] text-white/50">Dark black banner & plum card</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFieldChange('theme', 'white')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 cursor-pointer transition-all ${
                      currentCourse.theme === 'white'
                        ? 'bg-white text-black border-[#c9542f] shadow-lg shadow-[#c9542f]/15 ring-2 ring-[#c9542f]/30'
                        : 'bg-[#1c121d] text-white/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-full h-12 rounded-xl bg-radial from-[#C878BE] via-[#7A2A70] to-[#3D1A38] flex items-center justify-center font-bold text-lg text-white">
                      03
                    </div>
                    <div>
                      <h4 className="text-xs font-bold" style={{ color: currentCourse.theme === 'white' ? '#110D13' : '#ffffff' }}>3. Clean White</h4>
                      <p className="text-[11px]" style={{ color: currentCourse.theme === 'white' ? '#4A434E' : 'rgba(255,255,255,0.5)' }}>Magenta banner & white card</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Course Title & Slug & Sequence */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                  <Tag size={16} /> Course Identity & Headline
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Course Full Title</label>
                    <input
                      type="text"
                      value={currentCourse.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Sequence Number</label>
                    <input
                      type="text"
                      value={currentCourse.n || '01'}
                      onChange={(e) => handleFieldChange('n', e.target.value)}
                      placeholder="01"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Hero Lede Statement / Subtitle</label>
                  <textarea
                    rows={2}
                    value={currentCourse.lede || ''}
                    onChange={(e) => handleFieldChange('lede', e.target.value)}
                    placeholder="Master the psychology of calm authority..."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: '#ffffff' }}
                  />
                </div>

                {/* Floating Chips (2 tags) */}
                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-xs uppercase tracking-wider text-white/60">Tilted Banner Chips (2 tags)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={currentCourse.chips?.[0] || ''}
                      onChange={(e) => handleChipChange(0, e.target.value)}
                      placeholder="Tag 1 (Top-Right: e.g. Calm Authority)"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                    <input
                      type="text"
                      value={currentCourse.chips?.[1] || ''}
                      onChange={(e) => handleChipChange(1, e.target.value)}
                      placeholder="Tag 2 (Bottom-Left: e.g. Self-Command)"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Checkout Facts */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                  <CurrencyInr size={16} /> Pricing & Primary CTA
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Current Price</label>
                    <input
                      type="text"
                      value={currentCourse.price || ''}
                      onChange={(e) => handleFieldChange('price', e.target.value)}
                      placeholder="₹15,000"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Original Price (Strikethrough)</label>
                    <input
                      type="text"
                      value={currentCourse.was || ''}
                      onChange={(e) => handleFieldChange('was', e.target.value)}
                      placeholder="₹25,000"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white/60 text-sm line-through focus:outline-none focus:border-[#c9542f]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Button CTA Text</label>
                    <input
                      type="text"
                      value={currentCourse.cta || 'Check Course'}
                      onChange={(e) => handleFieldChange('cta', e.target.value)}
                      placeholder="Check Course"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>
                </div>

                {/* 2 Big Highlights in Sidebar Card */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <label className="text-xs uppercase tracking-wider text-white/60">Top 2 Sidebar Highlight Bullets</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#1c121d] p-3 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] uppercase font-mono text-[#c9542f]">Highlight 1</span>
                      <input
                        type="text"
                        value={currentCourse.hl?.[0]?.[0] || ''}
                        onChange={(e) => handleHlChange(0, 0, e.target.value)}
                        placeholder="Primary title (e.g. Build Real Presence)"
                        className="w-full bg-[#261828] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        style={{ color: '#ffffff' }}
                      />
                      <input
                        type="text"
                        value={currentCourse.hl?.[0]?.[1] || ''}
                        onChange={(e) => handleHlChange(0, 1, e.target.value)}
                        placeholder="Subtitle (e.g. (Not Just Theory))"
                        className="w-full bg-[#261828] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      />
                    </div>

                    <div className="bg-[#1c121d] p-3 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] uppercase font-mono text-[#c9542f]">Highlight 2</span>
                      <input
                        type="text"
                        value={currentCourse.hl?.[1]?.[0] || ''}
                        onChange={(e) => handleHlChange(1, 0, e.target.value)}
                        placeholder="Primary title (e.g. 3 Private Sessions)"
                        className="w-full bg-[#261828] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        style={{ color: '#ffffff' }}
                      />
                      <input
                        type="text"
                        value={currentCourse.hl?.[1]?.[1] || ''}
                        onChange={(e) => handleHlChange(1, 1, e.target.value)}
                        placeholder="Subtitle (e.g. with Aarkesh)"
                        className="w-full bg-[#261828] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* What's Inside Checklist */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-white/60">"What's Inside" Feature Checklist</label>
                    <button
                      type="button"
                      onClick={handleAddInsideItem}
                      className="flex items-center gap-1 text-xs text-[#c9542f] hover:text-white cursor-pointer font-semibold"
                    >
                      <Plus size={14} /> Add Checklist Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(currentCourse.inside || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle size={16} weight="fill" className="text-[#c9542f] shrink-0" />
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleInsideItemChange(idx, e.target.value)}
                          className="flex-1 bg-[#1c121d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c9542f]"
                          style={{ color: '#ffffff' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveInsideItem(idx)}
                          className="p-2 text-white/30 hover:text-red-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 2: SYLLABUS & MODULES GRID
              ========================================================================= */}
          {activeSectionTab === 'syllabus' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h2 className="font-serif text-2xl font-medium" style={{ color: '#ffffff' }}>Section 2: Syllabus & Modules Roadmap</h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Manage the curriculum section header and each step-by-step module breakdown.
                </p>
              </div>

              {/* Section Header Controls */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                  <ListNumbers size={16} /> Section Header & Subtitle
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Syllabus Main Title</label>
                  <input
                    type="text"
                    value={currentCourse.syllabusTitle || ''}
                    onChange={(e) => handleFieldChange('syllabusTitle', e.target.value)}
                    placeholder="e.g. Eight Modules To Total Self-Command"
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-serif focus:outline-none focus:border-[#c9542f]"
                    style={{ color: '#ffffff' }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Syllabus Subtitle</label>
                  <textarea
                    rows={2}
                    value={currentCourse.syllabusSubtitle || ''}
                    onChange={(e) => handleFieldChange('syllabusSubtitle', e.target.value)}
                    placeholder="A comprehensive, step-by-step roadmap from baseline nervousness to unshakeable gravitas."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: '#ffffff' }}
                  />
                </div>
              </div>

              {/* Modules List Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-2">
                    <Kanban size={16} /> Course Modules ({(currentCourse.syllabus || []).length})
                  </h3>

                  <button
                    type="button"
                    onClick={handleAddSyllabusModule}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c9542f] hover:bg-[#b54522] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#c9542f]/20 cursor-pointer"
                    style={{ color: '#ffffff' }}
                  >
                    <Plus size={15} weight="bold" />
                    <span>Add New Module</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(currentCourse.syllabus || []).map((mod, idx) => (
                    <div
                      key={idx}
                      className="bg-[#140c15] border border-white/10 hover:border-[#c9542f]/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="w-8 h-8 rounded-lg bg-[#221323] border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-[#c9542f]">
                            {mod.n || String(idx + 1).padStart(2, '0')}
                          </span>

                          <input
                            type="text"
                            value={mod.t || ''}
                            onChange={(e) => handleSyllabusChange(idx, 't', e.target.value)}
                            placeholder={`Module ${idx + 1} Title`}
                            className="flex-1 bg-[#1c121d] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-[#c9542f]"
                            style={{ color: '#ffffff' }}
                          />
                        </div>

                        {/* Reorder and Delete Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSyllabus(idx, -1)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white/70"
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (currentCourse.syllabus || []).length - 1}
                            onClick={() => handleMoveSyllabus(idx, 1)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white/70"
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSyllabusModule(idx)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ml-1"
                            title="Delete Module"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Module Description */}
                      <textarea
                        rows={2}
                        value={mod.d || ''}
                        onChange={(e) => handleSyllabusChange(idx, 'd', e.target.value)}
                        placeholder="Detailed psychological frameworks, actionable exercises, and real-world implementation."
                        className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-[#c9542f] resize-none"
                        style={{ color: 'rgba(255,255,255,0.75)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 3: CORE METHODOLOGY & DEEP DIVE
              ========================================================================= */}
          {activeSectionTab === 'methodology' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h2 className="font-serif text-2xl font-medium" style={{ color: '#ffffff' }}>Section 3: Core Methodology & Deep Dive</h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Craft the long-form narrative, quote box, and psychological breakdown that convinces students to enroll.
                </p>
              </div>

              {/* Methodology Card Form */}
              <div className="bg-[#140c15] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Header Pill Tag</label>
                    <input
                      type="text"
                      value={writeup.chip || 'CORE METHODOLOGY'}
                      onChange={(e) => handleWriteupChange('chip', e.target.value)}
                      placeholder="CORE METHODOLOGY"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Main Methodology Headline (H1)</label>
                    <input
                      type="text"
                      value={writeup.h1 || ''}
                      onChange={(e) => handleWriteupChange('h1', e.target.value)}
                      placeholder="Most Men Were Never Taught How to Hold Ground"
                      className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-serif font-bold focus:outline-none focus:border-[#c9542f]"
                      style={{ color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Opening Hook Lede</label>
                  <textarea
                    rows={2}
                    value={writeup.lede || ''}
                    onChange={(e) => handleWriteupChange('lede', e.target.value)}
                    placeholder="True charisma is not loud. It is the unhurried certainty of a man who does not need permission to take up space."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: '#ffffff' }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Narrative Paragraph 1 (The Problem)</label>
                  <textarea
                    rows={3}
                    value={writeup.p1 || ''}
                    onChange={(e) => handleWriteupChange('p1', e.target.value)}
                    placeholder="When pressure spikes in a meeting, negotiation, or relationship..."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-xs focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  />
                </div>

                {/* Highlighted Quote Box */}
                <div className="bg-[#1c121d] border border-[#c9542f]/30 rounded-2xl p-4 sm:p-5 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#c9542f] flex items-center gap-1.5">
                    <Quotes size={16} /> Featured Quote Box
                  </label>
                  <textarea
                    rows={2}
                    value={writeup.quote || ''}
                    onChange={(e) => handleWriteupChange('quote', e.target.value)}
                    placeholder="A room doesn't respond to volume. It responds to certainty."
                    className="w-full bg-[#261828] border border-white/10 rounded-xl px-4 py-2.5 text-white font-serif italic text-sm focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: '#ffffff' }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Narrative Paragraph 2 (The Solution & Transformation)</label>
                  <textarea
                    rows={3}
                    value={writeup.p2 || ''}
                    onChange={(e) => handleWriteupChange('p2', e.target.value)}
                    placeholder="Through structured modules, you dismantle reactive habits..."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-xs focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Bottom Key Distinction / Takeaway</label>
                  <textarea
                    rows={2}
                    value={writeup.distinction || ''}
                    onChange={(e) => handleWriteupChange('distinction', e.target.value)}
                    placeholder="Reactive men seek approval through fast speech. Anchored men lead through stillness and calibrated pauses."
                    className="w-full bg-[#1c121d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#c9542f] resize-none"
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
