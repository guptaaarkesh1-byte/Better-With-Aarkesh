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
  SlidersHorizontal
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
  
  // viewMode: 'catalog' (card grid) | 'editor' (3-section editor)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'editor') return 'editor';
      if (view === 'catalog') return 'catalog';
    } catch (e) {}
    return 'catalog'; // default to catalog view as requested!
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
      showToast(`Status updated: "${updatedCourse.title || slugToToggle}" is now ${updatedSoon ? 'Waitlist / Soon' : 'LIVE'}!`, 'success');
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

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center gap-3 text-white/50 bg-[#050505]">
        <ArrowClockwise size={24} className="animate-spin text-[#c79c6e]" />
        <span>Loading courses library...</span>
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

  // Gradient themes helper
  const getBannerGradient = (cls, slug) => {
    if (cls === 'v1' || slug === 'better-man') return 'from-[#2e0828] via-[#170928] to-[#0a0518] border-purple-500/20';
    if (cls === 'v2' || slug === 'difficult-people') return 'from-[#0b2239] via-[#09152b] to-[#040817] border-cyan-500/20';
    if (cls === 'v3' || slug === 'decisions') return 'from-[#062c21] via-[#081f1d] to-[#040d12] border-emerald-500/20';
    return 'from-[#2a1708] via-[#1c100b] to-[#0e0705] border-[#c79c6e]/30';
  };

  // =========================================================================
  // VIEW 1: CATALOG CARD GRID VIEW
  // =========================================================================
  if (viewMode === 'catalog') {
    return (
      <div className="w-full min-h-[calc(100vh-120px)] bg-[#050505] text-white flex flex-col">
        {/* Top Header Banner */}
        <div className="w-full bg-[#0a0a0a] border-b border-white/5 px-6 sm:px-10 py-6 sm:py-8 sticky top-[57px] z-20 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#c79c6e]/15 text-[#c79c6e] text-[10px] uppercase font-mono font-bold tracking-widest border border-[#c79c6e]/30">
                  COURSE CATALOG & 3-SECTIONS BUILDER
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-white font-medium flex items-center gap-3">
                <GraduationCap size={30} className="text-[#c79c6e]" />
                Masterclasses Library
              </h1>
              <p className="text-white/50 text-xs sm:text-sm mt-1 max-w-2xl">
                Click <strong className="text-white font-medium">"Edit 3-Sections"</strong> on any course card below to customize its Hero & Pricing Sidebar, Syllabus Roadmap, and Core Methodology long-form page.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAddCourseModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c79c6e] hover:bg-[#b58b5e] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#c79c6e]/20 cursor-pointer"
              >
                <Plus size={16} weight="bold" />
                <span>Create New Masterclass</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar & Search / Filter Controls */}
          <div className="max-w-7xl mx-auto mt-6 pt-5 border-t border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Quick Metrics Chips */}
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="font-serif text-base text-white font-bold">{totalCourses}</span>
                <span>Total Courses</span>
              </div>
              <span className="text-white/10 hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-serif text-base text-emerald-400 font-bold">{liveCount}</span>
                <span>Live Enrolling</span>
              </div>
              <span className="text-white/10 hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="font-serif text-base text-amber-400 font-bold">{waitlistCount}</span>
                <span>Waitlist / Coming Soon</span>
              </div>
              <span className="text-white/10 hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="font-serif text-base text-[#c79c6e] font-bold">{totalModules}</span>
                <span>Total Modules</span>
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
                  className="w-full bg-[#141414] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c79c6e] placeholder-white/30"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center bg-[#141414] p-0.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'all' ? 'bg-[#c79c6e] text-black' : 'text-white/60 hover:text-white'
                  }`}
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
                    statusFilter === 'waitlist' ? 'bg-amber-500 text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Waitlist ({waitlistCount})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── COURSE CARDS GRID ── */}
        <div className="max-w-7xl mx-auto w-full p-6 sm:p-10 flex-1">
          {filteredSlugs.length === 0 ? (
            <div className="w-full bg-[#0d0d0d] border border-dashed border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <GraduationCap size={40} className="text-white/20" />
              <h3 className="text-base font-semibold text-white/80">No courses match your search</h3>
              <p className="text-xs text-white/40 max-w-sm">
                Try clearing your search query or create a new masterclass course.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="mt-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#c79c6e] border border-[#c79c6e]/30"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSlugs.map((slug) => {
                const c = coursesMap[slug] || {};
                const isLive = !c.soon;
                const moduleCount = c.syllabus?.length || 0;
                const bannerStyle = getBannerGradient(c.cls, slug);

                return (
                  <div
                    key={slug}
                    className="group bg-[#0e0e0e] border border-white/10 hover:border-[#c79c6e]/60 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col shadow-xl hover:shadow-[0_10px_35px_rgba(199,156,110,0.12)] hover:-translate-y-1"
                  >
                    {/* Top Artwork / Thumbnail Banner */}
                    <div className={`p-6 bg-gradient-to-br ${bannerStyle} border-b relative overflow-hidden flex flex-col justify-between min-h-[175px]`}>
                      {/* Ambient background glow & texture */}
                      <div className="absolute inset-0 bg-radial from-white/[0.04] to-transparent pointer-events-none" />
                      
                      {/* Top Header Row in Card Banner */}
                      <div className="flex items-center justify-between gap-2 relative z-10">
                        {/* Course Number & Slug Badge */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white/70 px-2 py-0.5 rounded-md bg-black/40 border border-white/10">
                            #{c.n || '01'}
                          </span>
                          <span className="font-mono text-[11px] text-white/40 tracking-wider">
                            /{slug}
                          </span>
                        </div>

                        {/* Interactive Status Pill */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleCourseStatus(slug, e)}
                          title="Click to toggle Live ↔ Waitlist status"
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                            isLive
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                          <span>{isLive ? 'LIVE' : 'WAITLIST'}</span>
                        </button>
                      </div>

                      {/* Course Title & Category Chips */}
                      <div className="relative z-10 mt-4 space-y-2.5">
                        <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug group-hover:text-[#c79c6e] transition-colors line-clamp-2">
                          {c.title || slug}
                        </h2>

                        {/* Category chips / Tags */}
                        {Array.isArray(c.chips) && c.chips.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {c.chips.map((chip, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-black/50 text-[10px] font-medium text-white/80 border border-white/10"
                              >
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Body - Metadata & Summary */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                      {/* Course Short Lede */}
                      <p className="text-white/60 text-xs sm:text-sm leading-relaxed line-clamp-2 min-h-[40px]">
                        {c.lede || c.d || 'Master the psychology and strategies to elevate your life and career.'}
                      </p>

                      {/* 4-Column Mini Stats Grid */}
                      <div className="grid grid-cols-2 gap-2.5 bg-[#141414] p-3 rounded-2xl border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-mono text-white/40">Enrollment Fee</span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="font-serif text-sm font-bold text-white">{c.price || '₹15,000'}</span>
                            {c.was && <span className="text-[11px] text-white/30 line-through">{c.was}</span>}
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-mono text-white/40">Curriculum</span>
                          <span className="font-serif text-sm font-bold text-[#c79c6e] mt-0.5">
                            {moduleCount} Modules
                          </span>
                        </div>

                        <div className="flex flex-col border-t border-white/5 pt-2">
                          <span className="text-[10px] uppercase font-mono text-white/40">Format</span>
                          <span className="text-xs text-white/70 font-medium mt-0.5">
                            {c.sidebarChips?.[0]?.[1] || 'Self-Paced'}
                          </span>
                        </div>

                        <div className="flex flex-col border-t border-white/5 pt-2">
                          <span className="text-[10px] uppercase font-mono text-white/40">Mentorship</span>
                          <span className="text-xs text-white/70 font-medium mt-0.5">
                            {c.facts?.[1]?.[0] || '2'} {c.facts?.[1]?.[1] || '1-on-1 Sessions'}
                          </span>
                        </div>
                      </div>

                      {/* Key Highlights Bullet points */}
                      {Array.isArray(c.hl) && c.hl.length > 0 && (
                        <div className="space-y-1.5">
                          {c.hl.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] text-white/70">
                              <CheckCircle size={13} weight="fill" className="text-[#c79c6e] shrink-0" />
                              <span className="line-clamp-1">{item[0]} <span className="text-white/40">{item[1]}</span></span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-white/5 flex flex-col gap-2.5">
                        {/* Primary Action: Edit 3-Sections */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditor(slug)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#c79c6e] hover:bg-[#b58b5e] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#c79c6e]/20 cursor-pointer group-hover:scale-[1.02]"
                        >
                          <PencilSimple size={15} weight="bold" />
                          <span>Edit 3-Sections</span>
                          <CaretRight size={14} weight="bold" className="ml-0.5" />
                        </button>

                        {/* Secondary Actions: View Live & Delete */}
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={`https://aarkeshgupta.com/course/${slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium border border-white/5 transition-colors"
                          >
                            <ArrowSquareOut size={13} />
                            <span>View Live</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteCourse(slug, c.title, e)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/20 transition-colors cursor-pointer"
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
                className="group bg-[#0a0a0a] border-2 border-dashed border-white/10 hover:border-[#c79c6e]/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 cursor-pointer min-h-[400px] hover:bg-[#110f11]"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#c79c6e]/10 group-hover:bg-[#c79c6e]/20 border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e] transition-transform duration-300 group-hover:scale-110">
                  <Plus size={32} weight="bold" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white font-medium group-hover:text-[#c79c6e] transition-colors">
                    Add New Masterclass
                  </h3>
                  <p className="text-white/40 text-xs max-w-xs mt-1 leading-relaxed">
                    Create a custom course with a dedicated URL, pricing structure, interactive syllabus roadmap, and long-form narrative.
                  </p>
                </div>
                <span className="px-4 py-2 rounded-xl bg-white/5 group-hover:bg-[#c79c6e] group-hover:text-black text-xs font-bold uppercase tracking-wider text-[#c79c6e] border border-[#c79c6e]/30 transition-all">
                  + Create Masterclass
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── CREATE NEW COURSE MODAL ── */}
        {showAddCourseModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap size={20} className="text-[#c79c6e]" />
                  <h3 className="font-serif text-lg text-white font-medium">Create New Masterclass</h3>
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
                  <label className="text-xs uppercase tracking-wider text-white/60">Masterclass Title</label>
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
                  className="px-5 py-2 rounded-xl bg-[#c79c6e] hover:bg-[#b58b5e] text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#c79c6e]/20 cursor-pointer"
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
    <div className="w-full min-h-[calc(100vh-120px)] bg-[#050505] text-white flex flex-col">
      {/* ── TOP ACTION & COURSE SELECTOR BAR ── */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/5 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-[57px] z-20">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Back to All Courses Button */}
          <button
            type="button"
            onClick={() => setViewMode('catalog')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>All Courses</span>
          </button>

          <span className="text-white/20">|</span>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-white/40 font-semibold hidden sm:inline">Editing:</span>
            <span className="font-serif text-lg sm:text-xl text-[#c79c6e] font-semibold">{currentCourse.title || activeSlug}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold font-mono ${currentCourse.soon ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {currentCourse.soon ? 'Waitlist' : 'Live'}
            </span>
          </div>

          <span className="text-white/20 hidden md:inline">|</span>

          {/* Quick Course Switcher Pills */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#121212] p-1 rounded-xl border border-white/10 overflow-x-auto max-w-[340px]">
            {courseSlugs.map((slug) => {
              const c = coursesMap[slug] || {};
              const isSelected = activeSlug === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setActiveSlug(slug)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#c79c6e] text-black shadow-md shadow-[#c79c6e]/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
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

          {/* Course Status & Reset Helper Box */}
          <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
            <div className="bg-[#121212] p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-white/40">Status</span>
                <p className="text-xs font-semibold text-white">
                  {currentCourse.soon ? 'Waitlist (Coming Soon)' : 'Live for Enrollment'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFieldChange('soon', !currentCourse.soon)}
                className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase transition-colors cursor-pointer ${
                  currentCourse.soon
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
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
                <h2 className="font-serif text-2xl text-white font-medium">Section 1: Hero & Pricing Sidebar</h2>
                <p className="text-xs text-white/50 mt-1">
                  Customize the hero banner, tags, lede statement, pricing facts, and what's included checklist.
                </p>
              </div>

              {/* Course Title & Slug & Sequence */}
              <div className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e] flex items-center gap-2">
                  <Tag size={16} /> Course Identity
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Course Full Title</label>
                    <input
                      type="text"
                      value={currentCourse.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Sequence Number</label>
                    <input
                      type="text"
                      value={currentCourse.n || '01'}
                      onChange={(e) => handleFieldChange('n', e.target.value)}
                      placeholder="01"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#c79c6e]"
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
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c79c6e] resize-none"
                  />
                </div>

                {/* Chips / Category tags */}
                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-xs uppercase tracking-wider text-white/60">Canvas Preview Chips (2 tags)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={currentCourse.chips?.[0] || ''}
                      onChange={(e) => handleChipChange(0, e.target.value)}
                      placeholder="Tag 1 (e.g. Calm Authority)"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-[#c79c6e]"
                    />
                    <input
                      type="text"
                      value={currentCourse.chips?.[1] || ''}
                      onChange={(e) => handleChipChange(1, e.target.value)}
                      placeholder="Tag 2 (e.g. Self-Command)"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Checkout Facts */}
              <div className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e] flex items-center gap-2">
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
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Original Price (Strikethrough)</label>
                    <input
                      type="text"
                      value={currentCourse.was || ''}
                      onChange={(e) => handleFieldChange('was', e.target.value)}
                      placeholder="₹25,000"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white/60 text-sm line-through focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Button CTA Text</label>
                    <input
                      type="text"
                      value={currentCourse.cta || 'Check Course'}
                      onChange={(e) => handleFieldChange('cta', e.target.value)}
                      placeholder="Check Course"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>
                </div>

                {/* 2 Big Highlights in Sidebar Card */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Top 2 Sidebar Highlight Bullets</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#141414] p-3 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] uppercase font-mono text-[#c79c6e]">Highlight 1</span>
                      <input
                        type="text"
                        value={currentCourse.hl?.[0]?.[0] || ''}
                        onChange={(e) => handleHlChange(0, 0, e.target.value)}
                        placeholder="Primary title (e.g. Build Real Presence)"
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={currentCourse.hl?.[0]?.[1] || ''}
                        onChange={(e) => handleHlChange(0, 1, e.target.value)}
                        placeholder="Subtitle (e.g. (Not Just Theory))"
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70"
                      />
                    </div>

                    <div className="bg-[#141414] p-3 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] uppercase font-mono text-[#c79c6e]">Highlight 2</span>
                      <input
                        type="text"
                        value={currentCourse.hl?.[1]?.[0] || ''}
                        onChange={(e) => handleHlChange(1, 0, e.target.value)}
                        placeholder="Primary title (e.g. 3 Private Sessions)"
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={currentCourse.hl?.[1]?.[1] || ''}
                        onChange={(e) => handleHlChange(1, 1, e.target.value)}
                        placeholder="Subtitle (e.g. with Aarkesh)"
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70"
                      />
                    </div>
                  </div>
                </div>

                {/* What's Inside Checklist */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-white/60">"What's Inside" Feature Checklist</label>
                    <button
                      type="button"
                      onClick={handleAddInsideItem}
                      className="flex items-center gap-1 text-xs text-[#c79c6e] hover:text-white cursor-pointer"
                    >
                      <Plus size={14} /> Add Checklist Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(currentCourse.inside || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle size={16} weight="fill" className="text-[#c79c6e] shrink-0" />
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleInsideItemChange(idx, e.target.value)}
                          className="flex-1 bg-[#151515] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
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
                <h2 className="font-serif text-2xl text-white font-medium">Section 2: Syllabus & Modules Roadmap</h2>
                <p className="text-xs text-white/50 mt-1">
                  Manage the curriculum section header and each step-by-step module breakdown.
                </p>
              </div>

              {/* Section Header Controls */}
              <div className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e] flex items-center gap-2">
                  <ListNumbers size={16} /> Section Header & Subtitle
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Syllabus Main Title</label>
                  <input
                    type="text"
                    value={currentCourse.syllabusTitle || ''}
                    onChange={(e) => handleFieldChange('syllabusTitle', e.target.value)}
                    placeholder="e.g. Eight Modules To Total Self-Command"
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-serif focus:outline-none focus:border-[#c79c6e]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Syllabus Subtitle</label>
                  <textarea
                    rows={2}
                    value={currentCourse.syllabusSubtitle || ''}
                    onChange={(e) => handleFieldChange('syllabusSubtitle', e.target.value)}
                    placeholder="A comprehensive, step-by-step roadmap from baseline nervousness to unshakeable gravitas."
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#c79c6e] resize-none"
                  />
                </div>
              </div>

              {/* Modules List Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e] flex items-center gap-2">
                    <Kanban size={16} /> Course Modules ({(currentCourse.syllabus || []).length})
                  </h3>

                  <button
                    type="button"
                    onClick={handleAddSyllabusModule}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c79c6e] hover:bg-[#b58b5e] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#c79c6e]/20 cursor-pointer"
                  >
                    <Plus size={15} weight="bold" />
                    <span>Add New Module</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(currentCourse.syllabus || []).map((mod, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0e0e0e] border border-white/10 hover:border-[#c79c6e]/30 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="w-8 h-8 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-[#c79c6e]">
                            {mod.n || String(idx + 1).padStart(2, '0')}
                          </span>

                          <input
                            type="text"
                            value={mod.t || ''}
                            onChange={(e) => handleSyllabusChange(idx, 't', e.target.value)}
                            placeholder={`Module ${idx + 1} Title`}
                            className="flex-1 bg-[#151515] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-[#c79c6e]"
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
                        className="w-full bg-[#151515] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-[#c79c6e] resize-none"
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
                <h2 className="font-serif text-2xl text-white font-medium">Section 3: Core Methodology & Deep Dive</h2>
                <p className="text-xs text-white/50 mt-1">
                  Craft the long-form narrative, quote box, and psychological breakdown that convinces students to enroll.
                </p>
              </div>

              {/* Methodology Card Form */}
              <div className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Header Pill Tag</label>
                    <input
                      type="text"
                      value={writeup.chip || 'CORE METHODOLOGY'}
                      onChange={(e) => handleWriteupChange('chip', e.target.value)}
                      placeholder="CORE METHODOLOGY"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-white/60">Main Methodology Headline (H1)</label>
                    <input
                      type="text"
                      value={writeup.h1 || ''}
                      onChange={(e) => handleWriteupChange('h1', e.target.value)}
                      placeholder="Most Men Were Never Taught How to Hold Ground"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-serif font-bold focus:outline-none focus:border-[#c79c6e]"
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
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c79c6e] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Narrative Paragraph 1 (The Problem)</label>
                  <textarea
                    rows={3}
                    value={writeup.p1 || ''}
                    onChange={(e) => handleWriteupChange('p1', e.target.value)}
                    placeholder="When pressure spikes in a meeting, negotiation, or relationship..."
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-xs focus:outline-none focus:border-[#c79c6e] resize-none"
                  />
                </div>

                {/* Highlighted Quote Box */}
                <div className="bg-[#141215] border border-[#c79c6e]/20 rounded-2xl p-4 sm:p-5 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e] flex items-center gap-1.5">
                    <Quotes size={16} /> Featured Quote Box
                  </label>
                  <textarea
                    rows={2}
                    value={writeup.quote || ''}
                    onChange={(e) => handleWriteupChange('quote', e.target.value)}
                    placeholder="A room doesn't respond to volume. It responds to certainty."
                    className="w-full bg-[#1c181f] border border-white/10 rounded-xl px-4 py-2.5 text-white font-serif italic text-sm focus:outline-none focus:border-[#c79c6e] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Narrative Paragraph 2 (The Solution & Transformation)</label>
                  <textarea
                    rows={3}
                    value={writeup.p2 || ''}
                    onChange={(e) => handleWriteupChange('p2', e.target.value)}
                    placeholder="Through structured modules, you dismantle reactive habits..."
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-xs focus:outline-none focus:border-[#c79c6e] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/60">Bottom Key Distinction / Takeaway</label>
                  <textarea
                    rows={2}
                    value={writeup.distinction || ''}
                    onChange={(e) => handleWriteupChange('distinction', e.target.value)}
                    placeholder="Reactive men seek approval through fast speech. Anchored men lead through stillness and calibrated pauses."
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#c79c6e] resize-none"
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
