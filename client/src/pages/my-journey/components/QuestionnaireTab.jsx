import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  PencilSimple, 
  ArrowRight, 
  Sparkle, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  Check,
  Info,
  CalendarBlank,
  MagnifyingGlass,
  X,
  CaretRight
} from '@phosphor-icons/react';
import config from '../../../data/questionnaireConfig.json';
import QuestionnaireModal from '../../../components/booking/QuestionnaireModal';
import { 
  getAllQuestions, 
  countAnsweredQuestions, 
  buildResponseContractPayload, 
  convertResponsesToDraft,
  saveQuestionnaireDraft
} from '../../../utils/questionnaireDraft';

export default function QuestionnaireTab({ user, onProfileUpdate }) {
  const navigate = useNavigate();
  const allQuestions = useMemo(() => getAllQuestions(), []);
  const [loading, setLoading] = useState(true);
  const [profileAnswers, setProfileAnswers] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDraft, setActiveDraft] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('s01');
  const [saveStatus, setSaveStatus] = useState('');
  const printContainerRef = useRef(null);
  const triggerRef = useRef(null);
  const rightContainerRef = useRef(null);
  const lastTriggerRef = useRef(null);
  const savedRightScroll = useRef(0);
  const savedWindowScroll = useRef(0);
  const lastEditedQId = useRef(null);

  const draftId = useMemo(() => `profile_q_${user?._id || 'user'}`, [user?._id]);

  // Fetch user's profile questionnaire from server
  const fetchQuestionnaire = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/questionnaire`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileAnswers(data.questionnaireAnswers);
        setCompletedAt(data.questionnaireCompletedAt);
        if (data.questionnaireAnswers) {
          const draft = convertResponsesToDraft(data.questionnaireAnswers, draftId);
          setActiveDraft(draft);
        } else {
          setActiveDraft({
            booking_draft_id: draftId,
            questionnaire_id: config.questionnaire_id || 'bwa_optional_coaching',
            content_version: config.content_version || '2026-10-16-v1',
            opened: false,
            last_screen: 'intro',
            answers: {}
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch user questionnaire:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionnaire();
  }, [user?._id]);

  // Convert raw responses into a quick lookup Map
  const responseMap = useMemo(() => {
    const map = new Map();
    if (!profileAnswers) return map;

    let rawList = [];
    if (Array.isArray(profileAnswers.responses)) {
      rawList = profileAnswers.responses;
    } else if (Array.isArray(profileAnswers.answers)) {
      rawList = profileAnswers.answers;
    } else if (Array.isArray(profileAnswers)) {
      rawList = profileAnswers;
    }

    rawList.forEach((r) => {
      if (!r) return;
      const qId = r.question_id || r.id;
      if (qId) {
        const norm = String(qId).toLowerCase();
        map.set(norm, r);
        if (norm.startsWith('q')) {
          const num = parseInt(norm.replace('q', ''), 10);
          if (!isNaN(num)) {
            map.set(`q${num}`, r);
            map.set(`q${String(num).padStart(2, '0')}`, r);
          }
        }
      }
    });

    return map;
  }, [profileAnswers]);

  // Calculate statistics across all 45 questions
  const stats = useMemo(() => {
    let answered = 0;
    let skipped = 0;
    let unanswered = 0;

    (config.sections || []).forEach((sec) => {
      (sec.questions || []).forEach((q) => {
        const resp = responseMap.get(q.id.toLowerCase()) || responseMap.get(`q${q.number}`);
        const isAns = resp && (
          resp.state === 'answered' ||
          (Array.isArray(resp.selected_option_ids) && resp.selected_option_ids.length > 0) ||
          (typeof resp.text === 'string' && resp.text.trim().length > 0)
        );
        const isSkp = resp && resp.state === 'skipped';

        if (isAns) answered++;
        else if (isSkp) skipped++;
        else unanswered++;
      });
    });

    return { answered, skipped, unanswered, total: 45 };
  }, [responseMap]);

  // Section completion statistics for Table of Contents
  const sectionStats = useMemo(() => {
    const map = {};
    (config.sections || []).forEach((sec) => {
      let secAns = 0;
      const totalQ = (sec.questions || []).length;
      (sec.questions || []).forEach((q) => {
        const resp = responseMap.get(q.id.toLowerCase()) || responseMap.get(`q${q.number}`);
        const isAns = resp && (
          resp.state === 'answered' ||
          (Array.isArray(resp.selected_option_ids) && resp.selected_option_ids.length > 0) ||
          (typeof resp.text === 'string' && resp.text.trim().length > 0)
        );
        if (isAns) secAns++;
      });
      map[sec.id] = { answered: secAns, total: totalQ, complete: secAns === totalQ };
    });
    return map;
  }, [responseMap]);

  // Handle draft changes inside the questionnaire modal
  const handleUpdateDraft = (updated) => {
    setActiveDraft(updated);
    saveQuestionnaireDraft(draftId, updated);
  };

  // Save updated questionnaire answers permanently to User profile on server
  const handleSaveToProfile = async (draftToSave) => {
    const d = draftToSave || activeDraft;
    if (!d) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const payload = buildResponseContractPayload(d, draftId);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/questionnaire`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ questionnaireAnswers: payload })
      });

      if (res.ok) {
        const data = await res.json();
        setProfileAnswers(data.questionnaireAnswers);
        setCompletedAt(data.questionnaireCompletedAt);
        setSaveStatus('Saved to profile');
        setTimeout(() => setSaveStatus(''), 4000);
        if (onProfileUpdate) onProfileUpdate();
      }
    } catch (err) {
      console.error('Failed to save questionnaire to profile:', err);
    }
  };

  const handleModalClose = () => {
    const targetScroll = savedRightScroll.current;
    const targetWindowScroll = savedWindowScroll.current;
    const targetQId = lastEditedQId.current;

    setModalOpen(false);

    if (activeDraft) {
      handleSaveToProfile(activeDraft);
    }

    // Keep the user in the exact same view without scrolling up
    const restorePosition = () => {
      if (typeof targetWindowScroll === 'number') {
        if (window.lenis) {
          window.lenis.scrollTo(targetWindowScroll, { immediate: true });
        }
        window.scrollTo({ top: targetWindowScroll, behavior: 'instant' });
      }

      if (targetQId) {
        const qEl = document.getElementById(`q-card-${targetQId}`);
        const rightEl = rightContainerRef.current;
        if (qEl && rightEl) {
          const cTop = rightEl.getBoundingClientRect().top;
          const qTop = qEl.getBoundingClientRect().top;
          const offset = qTop - cTop + rightEl.scrollTop - 20;
          rightEl.scrollTo({ top: offset, behavior: 'instant' });
          return;
        }
      }

      if (rightContainerRef.current && targetScroll != null) {
        rightContainerRef.current.scrollTop = targetScroll;
      }
    };

    requestAnimationFrame(restorePosition);
    setTimeout(restorePosition, 50);
    setTimeout(restorePosition, 150);
  };

  const openQuestionnaireAt = (screenIndex = 'review', qId = null, e = null) => {
    if (rightContainerRef.current) {
      savedRightScroll.current = rightContainerRef.current.scrollTop;
    }
    savedWindowScroll.current = window.scrollY;
    lastEditedQId.current = qId;

    if (e && e.currentTarget) {
      lastTriggerRef.current = e.currentTarget;
    } else {
      lastTriggerRef.current = triggerRef.current;
    }

    if (!activeDraft) {
      setActiveDraft({
        booking_draft_id: draftId,
        questionnaire_id: config.questionnaire_id || 'bwa_optional_coaching',
        content_version: config.content_version || '2026-10-16-v1',
        opened: true,
        last_screen: screenIndex,
        answers: {}
      });
    } else {
      setActiveDraft(prev => ({
        ...prev,
        last_screen: screenIndex
      }));
    }
    setModalOpen(true);
  };

  // Jump to specific section smoothly
  const scrollToSection = (secId) => {
    setActiveSectionId(secId);
    const el = document.getElementById(`sec-${secId}`);
    const rightEl = rightContainerRef.current;
    if (el && rightEl && rightEl.scrollHeight > rightEl.clientHeight) {
      const containerTop = rightEl.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const scrollOffset = elTop - containerTop + rightEl.scrollTop - 10;
      rightEl.scrollTo({ top: scrollOffset, behavior: 'smooth' });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Seamless scroll chaining: isolate inside container, but allow page to scroll when reaching top or bottom boundary (never lock!)
  const handleChainedWheel = (e) => {
    const el = e.currentTarget;
    if (!el) return;

    const isAtTop = el.scrollTop <= 2;
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 2;

    // Top boundary: if at top and scrolling UP -> smoothly scroll window up to banner/header (never lock!)
    if (isAtTop && e.deltaY < 0) {
      if (window.lenis) {
        window.lenis.scrollTo(Math.max(0, window.scrollY + e.deltaY), { immediate: true });
      } else {
        window.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
      return;
    }

    // Bottom boundary: if at bottom and scrolling DOWN -> smoothly scroll window down (never lock!)
    if (isAtBottom && e.deltaY > 0) {
      if (window.lenis) {
        window.lenis.scrollTo(window.scrollY + e.deltaY, { immediate: true });
      } else {
        window.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
      return;
    }

    // Actively scrolling inside the container: isolate so other column doesn't scroll
    e.stopPropagation();
  };

  // Auto-highlight active section as user scrolls through the questions
  useEffect(() => {
    if (loading) return;

    const rightEl = rightContainerRef.current;

    const handleScroll = () => {
      const isDesktopScroll = rightEl && rightEl.scrollHeight > rightEl.clientHeight;
      const containerTop = isDesktopScroll ? rightEl.getBoundingClientRect().top : 0;
      const offsetThreshold = isDesktopScroll ? 80 : 180;

      const sectionElements = (config.sections || []).map((sec) => 
        document.getElementById(`sec-${sec.id}`)
      ).filter(Boolean);

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        const rect = el.getBoundingClientRect();
        const topDiff = isDesktopScroll ? (rect.top - containerTop) : rect.top;
        if (topDiff <= offsetThreshold) {
          const secId = el.id.replace('sec-', '');
          setActiveSectionId(secId);
          break;
        }
      }
    };

    if (rightEl) {
      rightEl.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rightEl) rightEl.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading]);

  const isComplete = stats.answered === 45;
  const hasAnswers = stats.answered > 0;
  const percentComplete = Math.round((stats.answered / 45) * 100);

  if (loading) {
    return (
      <div className="w-full py-16 text-center text-[#7a756b]">
        <div className="w-9 h-9 border-2 border-[#c9542f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono uppercase tracking-wider">Loading your questionnaire...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ============================================================ */}
      {/* 1. TOP HEADER BANNER                                         */}
      {/* ============================================================ */}
      <div className="bg-[#fbf9f4] border border-[#e8e2d5] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-[#fbf0eb] text-[#c9542f] border border-[#f3d3c7]">
                v{config.content_version || '2026-10-16-v1'}
              </span>

              {isComplete ? (
                <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Check size={12} weight="bold" /> Profile Intake Complete (45/45)
                </span>
              ) : hasAnswers ? (
                <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                  In Progress ({stats.answered}/45)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-black/5 text-[#7a756b]">
                  Not Started
                </span>
              )}

              {saveStatus && (
                <span className="text-xs text-emerald-700 font-semibold animate-pulse flex items-center gap-1">
                  ✓ {saveStatus}
                </span>
              )}
            </div>

            <h1 
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1c1714] tracking-tight leading-tight"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              Coaching Intake Questionnaire
            </h1>

            <p className="text-xs sm:text-sm text-[#5f5750] leading-relaxed font-light">
              This 45-question intake is permanently linked to your profile. You only need to answer it once, and Aarkesh references your insights to prepare for every coaching conversation. You can review or edit your answers anytime.
            </p>

            {completedAt && (
              <p className="text-[0.72rem] text-[#9c9689] flex items-center gap-1.5 pt-1">
                <Clock size={14} />
                Last saved on {new Date(completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => openQuestionnaireAt(hasAnswers ? 'review' : 'intro')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#c9542f] hover:bg-[#b04523] text-white font-sans text-xs tracking-wider font-bold uppercase transition-all shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <PencilSimple size={16} weight="bold" />
              <span>
                {isComplete 
                  ? 'Review & Edit Answers' 
                  : hasAnswers 
                  ? `Continue Intake (${stats.answered}/45)` 
                  : 'Start Questionnaire'}
              </span>
            </button>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="mt-6 pt-5 border-t border-[#e8e2d5] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#1c1714]">
              {stats.answered} of 45 Questions Answered
            </span>
            <span className="font-mono text-[#c9542f] font-bold text-sm">
              {percentComplete}%
            </span>
          </div>

          <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#c9542f] transition-all duration-500 rounded-full"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN TWO-COLUMN WORKSPACE (NO WASTED LEFT/RIGHT SPACE)     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-7 items-start">
        
        {/* ─── LEFT COLUMN: INDEPENDENTLY SCROLLABLE STICKY SIDEBAR ─── */}
        <aside 
          className="space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto pr-1.5 questionnaire-sidebar-scroll overscroll-contain"
          data-lenis-prevent="true"
          onWheel={handleChainedWheel}
        >
          
          {/* Section Navigation / Table of Contents Card */}
          <div className="bg-[#faf7f2] border border-[#e8e2d5] rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 mb-3">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#1c1714]">
                Questionnaire Sections
              </h3>
              <span className="text-[0.68rem] font-bold text-[#c9542f] bg-[#fbf0eb] px-2.5 py-0.5 rounded-full border border-[#f3d3c7] whitespace-nowrap shrink-0">
                9 Sections
              </span>
            </div>

            <nav className="space-y-1.5" aria-label="Section Quick Navigation">
              {(config.sections || []).map((sec, idx) => {
                const sStat = sectionStats[sec.id] || { answered: 0, total: 5, complete: false };
                const isActive = activeSectionId === sec.id;

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2.5 cursor-pointer border ${
                      isActive 
                        ? 'bg-white text-[#c9542f] font-bold shadow-xs border-[#e8e2d5] border-l-[3px] border-l-[#c9542f]' 
                        : 'border-transparent border-l-[3px] border-l-transparent text-[#555047] hover:bg-black/5 hover:text-[#111010]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className={`font-mono text-[0.68rem] font-bold w-5 shrink-0 text-left ${isActive ? 'text-[#c9542f]' : 'text-[#9c9689]'}`}>
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span className="leading-snug truncate sm:whitespace-normal font-medium text-[12px]">{sec.title}</span>
                    </div>

                    <span className={`shrink-0 font-mono text-[0.65rem] px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${
                      sStat.complete 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : sStat.answered > 0
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-black/5 text-[#9c9689]'
                    }`}>
                      {sStat.complete ? '✓ 5/5' : `${sStat.answered}/${sStat.total}`}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Promo Card: Talk it through with Aarkesh */}
          <div className="bg-[#1c1714] text-white rounded-2xl p-6 shadow-md space-y-3">
            <h4 
              className="text-lg font-serif font-semibold text-white tracking-tight"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              Talk it through with Aarkesh
            </h4>
            <p className="text-xs text-[#d5cfc9] leading-relaxed font-light">
              Your questionnaire answers are ready. Book a 1-on-1 coaching session to explore breakthroughs and action steps.
            </p>
            <button
              type="button"
              onClick={() => navigate('/book')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c9542f] hover:bg-[#b04523] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer mt-2"
            >
              <CalendarBlank size={15} weight="bold" />
              <span>Book 1-on-1 Session</span>
            </button>
          </div>

        </aside>

        {/* ─── RIGHT COLUMN: INDEPENDENTLY SCROLLABLE SECTION & QUESTION RESPONSES ─── */}
        <div 
          ref={rightContainerRef}
          className="space-y-6 min-w-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto pr-1.5 questionnaire-sidebar-scroll overscroll-contain"
          data-lenis-prevent="true"
          onWheel={handleChainedWheel}
        >
          
          {/* Search Subheader */}
          <div className="sticky top-0 z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#faf7f2]/95 backdrop-blur-xs border border-[#e8e2d5] rounded-xl px-4 py-3 shadow-2xs">
            <div className="relative flex-1">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a756b]" />
              <input
                type="text"
                placeholder="Search questions or your written responses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-black/10 rounded-lg text-[#111010] placeholder:text-[#9c9689] focus:outline-none focus:border-[#c9542f]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7a756b] hover:text-[#111010]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs text-[#555047]">
              <span>
                <span className="hidden sm:inline">Showing: </span><strong className="text-[#111010]">{stats.answered} of 45 Answered</strong>
              </span>

              <button
                type="button"
                onClick={() => openQuestionnaireAt('review')}
                className="px-3 py-1.5 rounded-lg border border-black/15 bg-white hover:bg-black/5 text-[#c9542f] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PencilSimple size={13} />
                <span>Edit All</span>
              </button>
            </div>
          </div>

          {/* All 9 Sections */}
          <div ref={printContainerRef} className="space-y-8">
            {(config.sections || []).map((sec, secIdx) => {
              // Filter questions based on searchQuery if any
              const sectionQuestions = (sec.questions || []).filter((q) => {
                const resp = responseMap.get(q.id.toLowerCase()) || responseMap.get(`q${q.number}`);

                if (searchQuery.trim()) {
                  const query = searchQuery.toLowerCase().trim();
                  const promptMatch = q.prompt?.toLowerCase().includes(query);
                  const textMatch = typeof resp?.text === 'string' && resp.text.toLowerCase().includes(query);
                  const optionMatch = (q.options || []).some(o => 
                    o.label?.toLowerCase().includes(query) && 
                    Array.isArray(resp?.selected_option_ids) && 
                    resp.selected_option_ids.includes(o.id)
                  );
                  return promptMatch || textMatch || optionMatch;
                }

                return true;
              });

              if (sectionQuestions.length === 0) {
                return null;
              }

              const sStat = sectionStats[sec.id] || { answered: 0, total: 5, complete: false };

              return (
                <div 
                  key={sec.id} 
                  id={`sec-${sec.id}`}
                  className="section scroll-mt-6 bg-[#fbf9f4] border border-[#e8e2d5] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4"
                >
                  {/* Section Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#e8e2d5] pb-3">
                    <div>
                      <div className="text-[0.68rem] uppercase tracking-wider font-extrabold text-[#c9542f] font-mono">
                        SECTION {secIdx + 1} OF 9
                      </div>
                      <h2 
                        className="text-lg sm:text-xl font-semibold text-[#1c1714] tracking-tight mt-0.5"
                        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                      >
                        {sec.title}
                      </h2>
                      {sec.intro && (
                        <p className="text-xs text-[#7a756b] italic mt-1 font-light">
                          {sec.intro}
                        </p>
                      )}
                    </div>

                    <span className="self-start sm:self-auto shrink-0 px-2.5 py-1 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-white border border-[#e8e2d5] text-[#555047]">
                      {sStat.answered} of {sStat.total} Answered
                    </span>
                  </div>

                  {/* Question Cards List */}
                  <div className="space-y-4">
                    {sectionQuestions.map((q) => {
                      const resp = responseMap.get(q.id.toLowerCase()) || responseMap.get(`q${q.number}`);
                      const isAns = resp && (
                        resp.state === 'answered' ||
                        (Array.isArray(resp.selected_option_ids) && resp.selected_option_ids.length > 0) ||
                        (typeof resp.text === 'string' && resp.text.trim().length > 0)
                      );
                      const isSkp = resp && resp.state === 'skipped';

                      const selectedOptions = Array.isArray(resp?.selected_option_ids) ? resp.selected_option_ids : [];
                      const textAnswer = resp?.text || null;
                      const writeIns = resp?.other_text_by_option_id || {};

                      // Global index in 0..44 for modal jumping
                      const globalIdx = allQuestions.findIndex(x => x.id === q.id);

                      return (
                        <div
                          key={q.id}
                          id={`q-card-${q.id}`}
                          className={`q-box p-3.5 sm:p-5 rounded-xl border transition-all ${
                            isAns 
                              ? 'bg-white border-[#e8e2d5] shadow-xs' 
                              : 'bg-[#faf7f2]/60 border-black/5'
                          }`}
                        >
                          {/* Card Header: Full-width on mobile, side-by-side on desktop */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                            
                            {/* Mobile-only Top Bar: Question Number + Answered Badge + Edit */}
                            <div className="flex sm:hidden items-center justify-between pb-1.5 border-b border-black/5">
                              <span className="text-[#c9542f] font-mono text-xs font-bold uppercase tracking-wider">
                                Question {q.number}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wider ${
                                    isAns
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : isSkp
                                      ? 'bg-black/5 text-[#7a756b]'
                                      : 'bg-black/5 text-[#9c9689]'
                                  }`}
                                >
                                  {isAns ? 'Answered' : isSkp ? 'Skipped' : 'Unanswered'}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => openQuestionnaireAt(globalIdx >= 0 ? globalIdx : 0, q.id, e)}
                                  className="px-2 py-0.5 rounded-md border border-black/15 bg-white hover:text-[#c9542f] text-[11px] font-semibold text-[#555047] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                  title="Edit answer"
                                >
                                  <PencilSimple size={12} />
                                  <span>Edit</span>
                                </button>
                              </div>
                            </div>

                            {/* Question Prompt (100% full width on mobile!) */}
                            <div className="q-title text-sm sm:text-[15px] font-semibold text-[#111010] leading-snug flex-1">
                              <span className="hidden sm:inline text-[#c9542f] font-mono mr-2 font-bold">
                                Q{q.number}.
                              </span>
                              {q.prompt}
                            </div>

                            {/* Desktop-only Actions & Badge */}
                            <div className="hidden sm:flex items-center gap-2 shrink-0">
                              <span
                                className={`q-badge px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider ${
                                  isAns
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 b-ans'
                                    : isSkp
                                    ? 'bg-black/5 text-[#7a756b] b-skp'
                                    : 'bg-black/5 text-[#9c9689] b-una'
                                }`}
                              >
                                {isAns ? 'Answered' : isSkp ? 'Skipped' : 'Unanswered'}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => openQuestionnaireAt(globalIdx >= 0 ? globalIdx : 0, q.id, e)}
                                className="px-2.5 py-1 rounded-lg border border-black/10 hover:border-[#c9542f] bg-white hover:text-[#c9542f] text-xs font-semibold text-[#555047] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                title="Edit answer"
                              >
                                <PencilSimple size={13} />
                                <span>Edit</span>
                              </button>
                            </div>
                          </div>

                          {/* ANSWER DETAIL */}
                          {isAns && (
                            <div className="answer mt-3.5 pt-3.5 border-t border-black/5 text-xs sm:text-sm">
                              {/* Open-Ended Written Answer */}
                              {(q.type === 'long_text' || (!selectedOptions.length && textAnswer)) && (
                                <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e8e2d5] text-[#111010] whitespace-pre-wrap leading-relaxed shadow-2xs font-normal">
                                  {textAnswer || 'Response submitted'}
                                </div>
                              )}

                              {/* Multi-Select / Single Choice / Scale Options */}
                              {selectedOptions.length > 0 && (
                                <div className="space-y-2 pt-1">
                                  {selectedOptions.map((optId) => {
                                    const optDef = (q.options || []).find((o) => o.id === optId);
                                    const writeInVal = writeIns[optId];

                                    let labelDisplay = optDef?.label || optId;
                                    if (q.id === 'q39') {
                                      if (optId === 'q39_0') labelDisplay = '0 — Not at all confident';
                                      else if (optId === 'q39_10') labelDisplay = '10 — Very confident';
                                      else if (optId === 'q39_not_sure') labelDisplay = 'Not sure';
                                      else labelDisplay = `Rating: ${optDef?.label || optId}`;
                                    }

                                    return (
                                      <div key={optId} className="flex items-baseline gap-2 flex-wrap bg-[#faf7f2] px-3 py-2 rounded-lg border border-black/5">
                                        <span className="text-[#c9542f] font-bold">✓</span>
                                        <span className="font-semibold text-[#111010]">{labelDisplay}</span>
                                        {writeInVal && (
                                          <span className="text-xs text-[#555] italic bg-[#ede7dc] px-2 py-0.5 rounded font-normal">
                                            Details: "{writeInVal}"
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {!isAns && (
                            <div className="mt-2.5 text-xs text-[#9c9689] italic">
                              {isSkp ? 'You skipped this question.' : 'No response recorded yet.'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* QUESTIONNAIRE MODAL FOR EDITING ANSWERS                      */}
      {/* ============================================================ */}
      <QuestionnaireModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        draft={activeDraft}
        draftId={draftId}
        onUpdateDraft={handleUpdateDraft}
        triggerRef={lastTriggerRef.current ? lastTriggerRef : triggerRef}
      />
    </div>
  );
}
