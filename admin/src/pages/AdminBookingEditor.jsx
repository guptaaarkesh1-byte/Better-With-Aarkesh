import React, { useState, useEffect, useRef } from 'react';
import { 
  CalendarBlank, 
  Clock, 
  User, 
  CheckCircle, 
  WarningCircle, 
  FloppyDisk, 
  ArrowClockwise, 
  Eye, 
  ArrowSquareOut, 
  SlidersHorizontal, 
  Image as ImageIcon, 
  Sparkle, 
  LockKey, 
  EnvelopeSimple, 
  ShieldCheck, 
  NotePencil, 
  Plus, 
  Trash, 
  ArrowUp, 
  ArrowDown, 
  Question, 
  CheckSquare, 
  Square 
} from '@phosphor-icons/react';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SIDEBAR_TABS = [
  { 
    id: 'step1', 
    label: 'Step 1: Choose Time', 
    icon: <CalendarBlank size={18} />, 
    description: 'Calendar, main heading & date/time slot headers' 
  },
  { 
    id: 'step2', 
    label: 'Step 2: About You', 
    icon: <User size={18} />, 
    description: 'Form labels, input placeholders & source options' 
  },
  { 
    id: 'step3', 
    label: 'Step 3: Confirm & Secure', 
    icon: <ShieldCheck size={18} />, 
    description: 'Summary labels, what happens next & policies' 
  },
  { 
    id: 'success', 
    label: 'After Payment Success', 
    icon: <CheckCircle size={18} />, 
    description: 'Reserved badge, confirmation text, 4 cards & quote' 
  },
  { 
    id: 'general', 
    label: 'General & Background', 
    icon: <SlidersHorizontal size={18} />, 
    description: 'Background image, dark overlay & privacy footer' 
  },
];

export default function AdminBookingEditor() {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab');
      if (tabFromUrl && ['step1', 'step2', 'step3', 'success', 'general'].includes(tabFromUrl)) {
        return tabFromUrl;
      }
      const savedTab = localStorage.getItem('bwa_admin_booking_tab');
      if (savedTab && ['step1', 'step2', 'step3', 'success', 'general'].includes(savedTab)) {
        return savedTab;
      }
    } catch (e) {}
    return 'step1';
  });

  // Persist tab to localStorage and URL on change
  useEffect(() => {
    try {
      localStorage.setItem('bwa_admin_booking_tab', activeTab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [activeTab]);

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // ── Questionnaire State ──
  const [questionnaire, setQuestionnaire] = useState(null);
  const [qLoading, setQLoading] = useState(false);
  const [qSaving, setQSaving] = useState(false);
  const [qSaveSuccess, setQSaveSuccess] = useState(false);

  // Fetch all booking settings on load
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/booking-settings`);
      if (!res.ok) throw new Error('Failed to load booking settings');
      const data = await res.json();
      setSettings({
        general: data.general || {},
        step1: data.step1 || {},
        step2: data.step2 || {},
        step3: { ...(data.step3 || {}), nextSteps: data.step3?.nextSteps || [] },
        success: { ...(data.success || {}), nextSteps: data.success?.nextSteps || [] }
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch questionnaire from backend
  const fetchQuestionnaire = async () => {
    try {
      setQLoading(true);
      const res = await fetch(`${API_URL}/api/questionnaire`);
      if (!res.ok) throw new Error('Failed to load questionnaire');
      const data = await res.json();
      setQuestionnaire(data);
    } catch (err) {
      console.error('Questionnaire fetch error:', err);
    } finally {
      setQLoading(false);
    }
  };

  const { showSuccess, showError } = useToast();

  // Save questionnaire to backend
  const handleSaveQuestionnaire = async () => {
    try {
      setQSaving(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/questionnaire`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(questionnaire)
      });
      if (!res.ok) throw new Error('Failed to save questionnaire');
      setQSaveSuccess(true);
      showSuccess('Questionnaire configuration saved successfully!');
      setTimeout(() => setQSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      showError(err.message || 'Failed to save questionnaire');
    } finally {
      setQSaving(false);
    }
  };

  // ── Questionnaire field helpers ──
  const updateQField = (field, value) => {
    setQuestionnaire(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    const newId = `q${Date.now()}`;
    setQuestionnaire(prev => ({
      ...prev,
      questions: [
        ...(prev?.questions || []),
        {
          id: newId,
          question: 'New question text?',
          required: false,
          options: [
            { id: `${newId}o1`, label: 'Option 1' }
          ]
        }
      ]
    }));
  };

  const removeQuestion = (qIdx) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIdx)
    }));
  };

  const updateQuestion = (qIdx, field, value) => {
    setQuestionnaire(prev => {
      const questions = [...(prev?.questions || [])];
      questions[qIdx] = { ...questions[qIdx], [field]: value };
      return { ...prev, questions };
    });
  };

  const addOption = (qIdx) => {
    setQuestionnaire(prev => {
      const questions = [...(prev?.questions || [])];
      const q = { ...questions[qIdx] };
      const existing = q.options || [];
      if (existing.length >= 5) return prev; // max 5 options
      const newOptId = `${q.id}o${Date.now()}`;
      q.options = [...existing, { id: newOptId, label: `Option ${existing.length + 1}` }];
      questions[qIdx] = q;
      return { ...prev, questions };
    });
  };

  const removeOption = (qIdx, oIdx) => {
    setQuestionnaire(prev => {
      const questions = [...(prev?.questions || [])];
      const q = { ...questions[qIdx] };
      if ((q.options || []).length <= 1) return prev; // keep at least 1
      q.options = q.options.filter((_, i) => i !== oIdx);
      questions[qIdx] = q;
      return { ...prev, questions };
    });
  };

  const updateOption = (qIdx, oIdx, value) => {
    setQuestionnaire(prev => {
      const questions = [...(prev?.questions || [])];
      const q = { ...questions[qIdx] };
      q.options = [...(q.options || [])];
      q.options[oIdx] = { ...q.options[oIdx], label: value };
      questions[qIdx] = q;
      return { ...prev, questions };
    });
  };

  const moveQuestion = (qIdx, dir) => {
    setQuestionnaire(prev => {
      const questions = [...(prev?.questions || [])];
      const swapIdx = qIdx + dir;
      if (swapIdx < 0 || swapIdx >= questions.length) return prev;
      [questions[qIdx], questions[swapIdx]] = [questions[swapIdx], questions[qIdx]];
      return { ...prev, questions };
    });
  };


  useEffect(() => {
    fetchSettings();
    fetchQuestionnaire();
  }, []);


  // Save specific step (and questionnaire if on step 2)
  const handleSaveStep = async (stepKey) => {
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      
      const promises = [
        fetch(`${API_URL}/api/booking-settings/${stepKey}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(settings[stepKey] || {})
        })
      ];

      // If on step2, also save the questionnaire simultaneously
      if (stepKey === 'step2' && questionnaire) {
        promises.push(
          fetch(`${API_URL}/api/questionnaire`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(questionnaire)
          })
        );
      }

      const results = await Promise.all(promises);
      for (const res of results) {
        if (!res.ok) throw new Error('Failed to update booking settings');
      }
      
      setSaveSuccess(true);
      showSuccess(stepKey === 'step2' 
        ? 'Step 2 & Questionnaire configuration saved successfully!' 
        : 'Booking step configuration saved and published successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save changes');
      showError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (stepKey, field, value) => {
    setSettings(prev => ({
      ...prev,
      [stepKey]: {
        ...(prev ? prev[stepKey] : {}),
        [field]: value
      }
    }));
  };

  const updateNextStepItem = (index, field, value) => {
    setSettings(prev => {
      const nextSteps = [...(prev.step3.nextSteps || [])];
      nextSteps[index] = { ...nextSteps[index], [field]: value };
      return {
        ...prev,
        step3: {
          ...prev.step3,
          nextSteps
        }
      };
    });
  };

  const addNextStepItem = () => {
    setSettings(prev => ({
      ...prev,
      step3: {
        ...prev.step3,
        nextSteps: [
          ...(prev.step3.nextSteps || []),
          { title: 'New step point', description: 'Description for this point.' }
        ]
      }
    }));
  };

  const removeNextStepItem = (index) => {
    setSettings(prev => ({
      ...prev,
      step3: {
        ...prev.step3,
        nextSteps: prev.step3.nextSteps.filter((_, i) => i !== index)
      }
    }));
  };

  const updateSuccessNextStepItem = (index, field, value) => {
    setSettings(prev => {
      const nextSteps = [...(prev.success?.nextSteps || [])];
      nextSteps[index] = { ...nextSteps[index], [field]: value };
      return {
        ...prev,
        success: {
          ...prev.success,
          nextSteps
        }
      };
    });
  };

  const addSuccessNextStepItem = () => {
    setSettings(prev => ({
      ...prev,
      success: {
        ...prev.success,
        nextSteps: [
          ...(prev.success?.nextSteps || []),
          { title: 'NEW CARD', description: 'Description for this card.' }
        ]
      }
    }));
  };

  const removeSuccessNextStepItem = (index) => {
    setSettings(prev => ({
      ...prev,
      success: {
        ...prev.success,
        nextSteps: (prev.success?.nextSteps || []).filter((_, i) => i !== index)
      }
    }));
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin" />
        <span className="text-white/40 font-sans text-sm tracking-widest uppercase">Loading Booking Content...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      
      {/* Header Bar */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/5 px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl text-white">Book a Session Editor</h1>
            <span className="px-2 py-0.5 rounded bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.65rem] font-semibold text-[#c79c6e] uppercase tracking-wider">
              {SIDEBAR_TABS.find(t => t.id === activeTab)?.label || '3-STEP CHAPTERS'}
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Customize all texts, titles, descriptions, placeholders, and notices shown across the 3 booking steps.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173/book"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium transition-all"
          >
            <Eye size={15} />
            <span>View Live Site</span>
            <ArrowSquareOut size={13} className="opacity-60" />
          </a>

          <button
            onClick={() => {
              fetchSettings();
              fetchQuestionnaire();
            }}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-xs font-medium transition-all cursor-pointer"
          >
            <ArrowClockwise size={15} />
            <span>Reload</span>
          </button>

          <button
            onClick={() => handleSaveStep(activeTab)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#c79c6e] hover:bg-[#b0885e] text-black font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#c79c6e]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FloppyDisk size={16} weight="bold" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout: Left Sidebar + Right Editor Body */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1680px] mx-auto items-start">
        
        {/* ─── LEFT SIDEBAR TABS (FIXED/STICKY) ─── */}
        <aside className="w-full md:w-72 lg:w-80 bg-[#080808] border-r border-white/5 p-4 lg:p-6 shrink-0 flex flex-col gap-2 md:sticky md:top-[81px] md:h-[calc(100vh-81px)] md:overflow-y-auto">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/40 px-3 py-1">
            PAGE SECTIONS
          </span>

          <nav className="flex flex-col gap-1.5">
            {SIDEBAR_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer border ${
                    isActive
                      ? 'bg-[#14120e] border-[#c79c6e]/40 text-[#c79c6e] shadow-lg shadow-black/40'
                      : 'bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg border ${
                    isActive 
                      ? 'bg-[#c79c6e]/15 border-[#c79c6e]/40 text-[#c79c6e]' 
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}>
                    {tab.icon}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider">{tab.label}</span>
                    <span className="text-[0.68rem] text-white/40 truncate">{tab.description}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ─── RIGHT MAIN EDITOR AREA ─── */}
        <main className="flex-1 p-6 lg:p-10 w-full min-w-0 flex flex-col gap-8">
          
          {/* Notifications */}
          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle size={20} weight="fill" />
              <span>Booking configuration updated and published successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 text-sm">
              <WarningCircle size={20} weight="fill" />
              <span>{error}</span>
            </div>
          )}
          
          {/* ================= STEP 1 EDITOR ================= */}
          {activeTab === 'step1' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h2 className="font-serif text-2xl text-white">Step 1: Choose a Time</h2>
                  <p className="font-sans text-xs text-white/40 mt-0.5">Customize chapter badge, headers, calendar subtext, and slot notices.</p>
                </div>
                <span className="px-3 py-1 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/30 text-xs font-mono text-[#c79c6e]">
                  Chapter 1 of 3
                </span>
              </div>

              {/* Step Header Block */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Top Header Section
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Chapter Badge Tag</label>
                    <input
                      type="text"
                      value={settings.step1.chapterTag || ''}
                      onChange={(e) => updateField('step1', 'chapterTag', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                      placeholder="CHAPTER 1 OF 3"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Main Step Heading</label>
                    <input
                      type="text"
                      value={settings.step1.title || ''}
                      onChange={(e) => updateField('step1', 'title', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                      placeholder="Let's Find a Time That Works"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Subtitle (Line 1)</label>
                    <input
                      type="text"
                      value={settings.step1.subtitleLine1 || ''}
                      onChange={(e) => updateField('step1', 'subtitleLine1', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                      placeholder="You don't need to have everything figured out before you begin."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Subtitle (Line 2)</label>
                    <input
                      type="text"
                      value={settings.step1.subtitleLine2 || ''}
                      onChange={(e) => updateField('step1', 'subtitleLine2', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                      placeholder="This is a space for honest conversation and real clarity."
                    />
                  </div>
                </div>
              </div>

              {/* Calendar & Slots Section */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Calendar & Slots Text
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Choose Date Section Title</label>
                    <input
                      type="text"
                      value={settings.step1.dateHeading || ''}
                      onChange={(e) => updateField('step1', 'dateHeading', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                      placeholder="CHOOSE A DATE"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Choose Time Section Title</label>
                    <input
                      type="text"
                      value={settings.step1.timeHeading || ''}
                      onChange={(e) => updateField('step1', 'timeHeading', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                      placeholder="CHOOSE A TIME"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs text-white/60">No Slots Available Empty State Notice</label>
                  <input
                    type="text"
                    value={settings.step1.noSlotsText || ''}
                    onChange={(e) => updateField('step1', 'noSlotsText', e.target.value)}
                    className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                    placeholder="No slots available on this date. Please pick another date."
                  />
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 2 EDITOR ================= */}
          {activeTab === 'step2' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h2 className="font-serif text-2xl text-white">Step 2: A Little About You</h2>
                  <p className="font-sans text-xs text-white/40 mt-0.5">Customize chapter badge, headers, input field labels, and placeholders.</p>
                </div>
                <span className="px-3 py-1 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/30 text-xs font-mono text-[#c79c6e]">
                  Chapter 2 of 3
                </span>
              </div>

              {/* Step Header Block */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Top Header Section
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Chapter Badge Tag</label>
                    <input
                      type="text"
                      value={settings.step2.chapterTag || ''}
                      onChange={(e) => updateField('step2', 'chapterTag', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                      placeholder="CHAPTER 2 OF 3"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Main Step Heading</label>
                    <input
                      type="text"
                      value={settings.step2.title || ''}
                      onChange={(e) => updateField('step2', 'title', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                      placeholder="A Little About You"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Subtitle (Line 1)</label>
                    <input
                      type="text"
                      value={settings.step2.subtitleLine1 || ''}
                      onChange={(e) => updateField('step2', 'subtitleLine1', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                      placeholder="This helps me understand you better before we meet."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Subtitle (Line 2)</label>
                    <input
                      type="text"
                      value={settings.step2.subtitleLine2 || ''}
                      onChange={(e) => updateField('step2', 'subtitleLine2', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                      placeholder="Share only what you're comfortable with."
                    />
                  </div>
                </div>
              </div>

              {/* Form Input Labels & Placeholders */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-5">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Form Field Labels & Placeholders
                </span>

                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Name Field Label</label>
                    <input
                      type="text"
                      value={settings.step2.nameLabel || ''}
                      onChange={(e) => updateField('step2', 'nameLabel', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="YOUR NAME"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Name Placeholder</label>
                    <input
                      type="text"
                      value={settings.step2.namePlaceholder || ''}
                      onChange={(e) => updateField('step2', 'namePlaceholder', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="What should I call you?"
                    />
                  </div>
                </div>

                {/* Source / Referral */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Referral Source Label</label>
                    <input
                      type="text"
                      value={settings.step2.sourceLabel || ''}
                      onChange={(e) => updateField('step2', 'sourceLabel', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="HOW DID YOU HEAR ABOUT ME? (OPTIONAL)"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Source Dropdown Default Text</label>
                    <input
                      type="text"
                      value={settings.step2.sourcePlaceholder || ''}
                      onChange={(e) => updateField('step2', 'sourcePlaceholder', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="Select an option"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Email Field Label</label>
                    <input
                      type="text"
                      value={settings.step2.emailLabel || ''}
                      onChange={(e) => updateField('step2', 'emailLabel', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="EMAIL"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Phone Field Label</label>
                    <input
                      type="text"
                      value={settings.step2.phoneLabel || ''}
                      onChange={(e) => updateField('step2', 'phoneLabel', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="PHONE NUMBER"
                    />
                  </div>
                </div>

                {/* What Brings You Here */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Reason Field Label</label>
                    <input
                      type="text"
                      value={settings.step2.reasonLabel || ''}
                      onChange={(e) => updateField('step2', 'reasonLabel', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="WHAT BRINGS YOU HERE?"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Reason Field Placeholder</label>
                    <input
                      type="text"
                      value={settings.step2.reasonPlaceholder || ''}
                      onChange={(e) => updateField('step2', 'reasonPlaceholder', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="Tell me a little about where you are right now..."
                    />
                  </div>
                </div>

                {/* Extra Notes & Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Extra Notes Label</label>
                    <input
                      type="text"
                      value={settings.step2.extraLabel || ''}
                      onChange={(e) => updateField('step2', 'extraLabel', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="ANYTHING ELSE I SHOULD KNOW? (OPTIONAL)"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Continue Button Text</label>
                    <input
                      type="text"
                      value={settings.step2.continueButtonText || ''}
                      onChange={(e) => updateField('step2', 'continueButtonText', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="CONTINUE TO CONFIRMATION"
                    />
                  </div>
                </div>
              </div>


              {/* Questionnaire Editor */}
              <div className="bg-[#0e0e0e] border border-[#c79c6e]/20 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-gradient-to-r from-[#c79c6e]/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#c79c6e]/15 border border-[#c79c6e]/30 flex items-center justify-center">
                      <Question size={16} className="text-[#c79c6e]" />
                    </div>
                    <div>
                      <span className="font-sans text-sm font-semibold text-white">Questionnaire Editor</span>
                      <p className="font-sans text-[0.68rem] text-white/40 mt-0.5">Manage optional MCQ questionnaire shown in popup</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#c79c6e]/10 border border-[#c79c6e]/25 text-[#c79c6e] font-sans text-xs font-semibold">
                      {(questionnaire?.questions || []).length} Question{(questionnaire?.questions || []).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                {qLoading ? (
                  <div className="flex items-center justify-center py-12 gap-3">
                    <div className="w-6 h-6 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin" />
                    <span className="text-white/40 text-sm font-sans">Loading questionnaire...</span>
                  </div>
                ) : questionnaire ? (
                  <div className="p-5 flex flex-col gap-6">
                    <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                      <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">Banner Text (shown on Step 2 page)</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-white/60">Banner Title</label>
                          <input type="text" value={questionnaire.title || ''} onChange={(e) => updateQField('title', e.target.value)} className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]" placeholder="Want to go deeper?" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-white/60">Badge Label</label>
                          <input type="text" value={questionnaire.badgeLabel || ''} onChange={(e) => updateQField('badgeLabel', e.target.value)} className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]" placeholder="Optional — ~30 mins" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-white/60">Banner Subtitle</label>
                          <input type="text" value={questionnaire.subtitle || ''} onChange={(e) => updateQField('subtitle', e.target.value)} className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]" placeholder="A short questionnaire..." />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-white/60">Button Text</label>
                          <input type="text" value={questionnaire.buttonText || ''} onChange={(e) => updateQField('buttonText', e.target.value)} className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]" placeholder="TAKE QUESTIONNAIRE" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-white/60">Submit Button (inside popup)</label>
                          <input type="text" value={questionnaire.submitButtonText || ''} onChange={(e) => updateQField('submitButtonText', e.target.value)} className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]" placeholder="SUBMIT & CONTINUE" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-white/60">Completed Banner Text</label>
                          <input type="text" value={questionnaire.completedText || ''} onChange={(e) => updateQField('completedText', e.target.value)} className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e]" placeholder="Questionnaire Completed" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">Questions</span>
                          <p className="font-sans text-[0.68rem] text-white/30 mt-0.5">Each question supports up to 5 MCQ options</p>
                        </div>
                        <button type="button" onClick={addQuestion} disabled={(questionnaire.questions || []).length >= 10} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#c79c6e]/40 text-[#c79c6e] text-xs font-sans font-semibold hover:bg-[#c79c6e]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                          <Plus size={14} weight="bold" />
                          Add Question
                        </button>
                      </div>

                      {(questionnaire.questions || []).length === 0 && (
                        <div className="py-10 text-center border border-dashed border-white/10 rounded-xl">
                          <Question size={32} className="text-white/20 mx-auto mb-3" />
                          <p className="font-sans text-sm text-white/30">No questions yet. Click Add Question above.</p>
                        </div>
                      )}

                      {(questionnaire.questions || []).map((q, qIdx) => (
                        <div key={q.id || qIdx} className="bg-[#111] border border-white/8 rounded-xl overflow-hidden transition-all hover:border-white/15">
                          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/5 bg-[#0d0d0d]">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-md bg-[#c79c6e]/15 border border-[#c79c6e]/25 flex items-center justify-center font-mono text-[0.65rem] text-[#c79c6e] font-bold shrink-0">{qIdx + 1}</span>
                              <button type="button" onClick={() => updateQuestion(qIdx, 'required', !q.required)} className={`flex items-center gap-1 px-2 py-1 rounded text-[0.65rem] font-sans font-semibold uppercase tracking-wider transition-all ${q.required ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' : 'bg-white/5 border border-white/10 text-white/30 hover:text-white/50'}`}>
                                {q.required ? <CheckSquare size={11} weight="fill" /> : <Square size={11} />}
                                {q.required ? 'Required' : 'Optional'}
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => moveQuestion(qIdx, -1)} disabled={qIdx === 0} className="w-7 h-7 flex items-center justify-center rounded border border-white/10 text-white/40 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"><ArrowUp size={12} /></button>
                              <button type="button" onClick={() => moveQuestion(qIdx, 1)} disabled={qIdx === (questionnaire.questions || []).length - 1} className="w-7 h-7 flex items-center justify-center rounded border border-white/10 text-white/40 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"><ArrowDown size={12} /></button>
                              <button type="button" onClick={() => removeQuestion(qIdx)} className="w-7 h-7 flex items-center justify-center rounded border border-red-500/20 text-red-400/50 hover:text-red-400 hover:border-red-500/40 transition-all ml-1"><Trash size={12} /></button>
                            </div>
                          </div>
                          <div className="p-4 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="font-sans text-[0.68rem] text-white/50 uppercase tracking-wider">Question Text</label>
                              <textarea rows={2} value={q.question || ''} onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)} className="bg-[#080808] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] resize-none" placeholder="Type your question here..." />
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <label className="font-sans text-[0.68rem] text-white/50 uppercase tracking-wider">MCQ Options <span className="text-white/25 font-normal normal-case tracking-normal">({(q.options || []).length}/5)</span></label>
                                {(q.options || []).length < 5 && (
                                  <button type="button" onClick={() => addOption(qIdx)} className="flex items-center gap-1 text-[0.68rem] text-[#c79c6e] hover:text-white font-sans font-semibold transition-colors"><Plus size={11} weight="bold" /> Add Option</button>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                {(q.options || []).map((opt, oIdx) => (
                                  <div key={opt.id || oIdx} className="flex items-center gap-2 group">
                                    <span className="w-6 h-6 rounded border border-white/10 flex items-center justify-center font-mono text-[0.65rem] text-white/30 shrink-0 bg-[#080808]">{String.fromCharCode(65 + oIdx)}</span>
                                    <input type="text" value={opt.label || ''} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} className="flex-1 bg-[#080808] border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]/50 transition-colors group-hover:border-white/15" placeholder={`Option ${oIdx + 1} text...`} />
                                    <button type="button" onClick={() => removeOption(qIdx, oIdx)} disabled={(q.options || []).length <= 1} className="w-7 h-7 flex items-center justify-center rounded text-red-400/40 hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all shrink-0"><Trash size={12} /></button>
                                  </div>
                                ))}
                              </div>
                              {(q.options || []).length >= 5 && (
                                <p className="font-sans text-[0.65rem] text-amber-400/60 mt-1">Maximum 5 options per question reached.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Bottom Add Question Button */}
                      <button 
                        type="button" 
                        onClick={addQuestion} 
                        disabled={(questionnaire.questions || []).length >= 10} 
                        className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl border border-dashed border-[#c79c6e]/30 hover:border-[#c79c6e] text-[#c79c6e] hover:bg-[#c79c6e]/10 text-xs font-sans font-semibold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={15} weight="bold" />
                        <span>Add Question</span>
                      </button>

                      {(questionnaire.questions || []).length > 0 && (
                        <div className="text-center">
                          <span className="font-sans text-[0.68rem] text-white/20">{(questionnaire.questions || []).length} question{(questionnaire.questions || []).length !== 1 ? 's' : ''} total</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="font-sans text-sm text-white/30">Failed to load questionnaire. Try refreshing.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= STEP 3 EDITOR ================= */}
          {activeTab === 'step3' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h2 className="font-serif text-2xl text-white">Step 3: Confirm & Secure Your Session</h2>
                  <p className="font-sans text-xs text-white/40 mt-0.5">Customize summary card labels, what happens next items, and rescheduling policies.</p>
                </div>
                <span className="px-3 py-1 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/30 text-xs font-mono text-[#c79c6e]">
                  Chapter 3 of 3
                </span>
              </div>

              {/* Step Header Block */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Top Header Section
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Chapter Badge Tag</label>
                    <input
                      type="text"
                      value={settings.step3.chapterTag || ''}
                      onChange={(e) => updateField('step3', 'chapterTag', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="CHAPTER 3 OF 3"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Main Step Heading</label>
                    <input
                      type="text"
                      value={settings.step3.title || ''}
                      onChange={(e) => updateField('step3', 'title', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="Confirm & Secure Your Session"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Subtitle (Line 1)</label>
                    <input
                      type="text"
                      value={settings.step3.subtitleLine1 || ''}
                      onChange={(e) => updateField('step3', 'subtitleLine1', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="Almost there. Review your session details"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Subtitle (Line 2)</label>
                    <input
                      type="text"
                      value={settings.step3.subtitleLine2 || ''}
                      onChange={(e) => updateField('step3', 'subtitleLine2', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="and let's make it official."
                    />
                  </div>
                </div>
              </div>

              {/* Session Details Card Labels */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Session Details Card Labels (Left Column)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Section Title</label>
                    <input
                      type="text"
                      value={settings.step3.sessionDetailsHeading || ''}
                      onChange={(e) => updateField('step3', 'sessionDetailsHeading', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="SESSION DETAILS"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Platform / Where Title</label>
                    <input
                      type="text"
                      value={settings.step3.whereValue || ''}
                      onChange={(e) => updateField('step3', 'whereValue', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="Google Meet"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Platform Subnote</label>
                    <input
                      type="text"
                      value={settings.step3.whereNote || ''}
                      onChange={(e) => updateField('step3', 'whereNote', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="(Link will be shared after booking)"
                    />
                  </div>
                </div>
              </div>

              {/* What Happens Next Items List */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                    What Happens Next (Right Column Items)
                  </span>
                  <button
                    type="button"
                    onClick={addNextStepItem}
                    className="flex items-center gap-1.5 text-xs text-[#c79c6e] hover:underline"
                  >
                    <Plus size={14} weight="bold" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs text-white/60">Section Title</label>
                  <input
                    type="text"
                    value={settings.step3.whatHappensNextHeading || ''}
                    onChange={(e) => updateField('step3', 'whatHappensNextHeading', e.target.value)}
                    className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                    placeholder="WHAT HAPPENS NEXT"
                  />
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  {(settings.step3.nextSteps || []).map((item, idx) => (
                    <div key={idx} className="bg-[#080808] border border-white/5 rounded-xl p-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[0.7rem] uppercase tracking-wider text-white/40">
                          Item #{idx + 1}
                        </span>
                        {settings.step3.nextSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeNextStepItem(idx)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => updateNextStepItem(idx, 'title', e.target.value)}
                          className="bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                          placeholder="Title (e.g. You'll receive a confirmation email)"
                        />
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => updateNextStepItem(idx, 'description', e.target.value)}
                          className="bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70"
                          placeholder="Description (e.g. With all the details and next steps.)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rescheduling Card & Agreement */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Rescheduling Notice & Legal Agreement
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Reschedule Section Header</label>
                    <input
                      type="text"
                      value={settings.step3.rescheduleHeading || ''}
                      onChange={(e) => updateField('step3', 'rescheduleHeading', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="NEED TO RESCHEDULE?"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Reschedule Policy Link Text</label>
                    <input
                      type="text"
                      value={settings.step3.reschedulePolicyLinkText || ''}
                      onChange={(e) => updateField('step3', 'reschedulePolicyLinkText', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="View Rescheduling Policy"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs text-white/60">Reschedule Policy Helper Text</label>
                  <input
                    type="text"
                    value={settings.step3.rescheduleText || ''}
                    onChange={(e) => updateField('step3', 'rescheduleText', e.target.value)}
                    className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                    placeholder="You can reschedule or cancel up to 24 hours before the session."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Book Button Text</label>
                    <input
                      type="text"
                      value={settings.step3.confirmButtonText || ''}
                      onChange={(e) => updateField('step3', 'confirmButtonText', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="CONFIRM & BOOK"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Free Session Button Text</label>
                    <input
                      type="text"
                      value={settings.step3.confirmFreeButtonText || ''}
                      onChange={(e) => updateField('step3', 'confirmFreeButtonText', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="CONFIRM FREE SESSION"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================= SUCCESS / AFTER PAYMENT EDITOR ================= */}
          {activeTab === 'success' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h2 className="font-serif text-2xl text-white">After Payment Success Page</h2>
                  <p className="font-sans text-xs text-white/40 mt-0.5">Customize reservation confirmation headers, thank you note, 4 next step cards, quote and buttons.</p>
                </div>
                <span className="px-3 py-1 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/30 text-xs font-mono text-[#c79c6e]">
                  Confirmed Screen
                </span>
              </div>

              {/* Main Success Header */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Top Reserved Banner & Thank You Heading
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Top Badge Tag</label>
                    <input
                      type="text"
                      value={settings.success?.badgeTag || ''}
                      onChange={(e) => updateField('success', 'badgeTag', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="YOUR SESSION IS RESERVED"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Return To Home Button Text</label>
                    <input
                      type="text"
                      value={settings.success?.backButtonText || ''}
                      onChange={(e) => updateField('success', 'backButtonText', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="RETURN TO HOME"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Main Title (Line 1)</label>
                    <input
                      type="text"
                      value={settings.success?.titleLine1 || ''}
                      onChange={(e) => updateField('success', 'titleLine1', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="Thank you for trusting me"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Main Title (Line 2)</label>
                    <input
                      type="text"
                      value={settings.success?.titleLine2 || ''}
                      onChange={(e) => updateField('success', 'titleLine2', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="with a part of your story."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Subtitle (Line 1)</label>
                    <input
                      type="text"
                      value={settings.success?.subtitleLine1 || ''}
                      onChange={(e) => updateField('success', 'subtitleLine1', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="I've sent a confirmation email with everything you'll need."
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Subtitle (Line 2)</label>
                    <input
                      type="text"
                      value={settings.success?.subtitleLine2 || ''}
                      onChange={(e) => updateField('success', 'subtitleLine2', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder={"Until then, don't worry about preparing the \"right\" answers."}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Subtitle Accent Highlight</label>
                    <input
                      type="text"
                      value={settings.success?.subtitleHighlight || ''}
                      onChange={(e) => updateField('success', 'subtitleHighlight', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="Just bring yourself."
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Card Image & Labels */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Appointment Card Details & Visual
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Card Badge Label</label>
                    <input
                      type="text"
                      value={settings.success?.appointmentCardBadge || ''}
                      onChange={(e) => updateField('success', 'appointmentCardBadge', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="YOUR APPOINTMENT"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Right Side Card Image URL</label>
                    <input
                      type="text"
                      value={settings.success?.cardImageUrl || ''}
                      onChange={(e) => updateField('success', 'cardImageUrl', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                </div>
              </div>

              {/* What Happens Next 4 Cards */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                    What Happens Next Cards
                  </span>
                  <button
                    type="button"
                    onClick={addSuccessNextStepItem}
                    className="flex items-center gap-1.5 text-xs text-[#c79c6e] hover:underline"
                  >
                    <Plus size={14} weight="bold" />
                    <span>Add Card</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs text-white/60">Section Title</label>
                  <input
                    type="text"
                    value={settings.success?.whatHappensNextHeading || ''}
                    onChange={(e) => updateField('success', 'whatHappensNextHeading', e.target.value)}
                    className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                    placeholder="WHAT HAPPENS NEXT"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {(settings.success?.nextSteps || []).map((card, idx) => (
                    <div key={idx} className="bg-[#080808] border border-white/5 rounded-xl p-4 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[0.7rem] uppercase tracking-wider text-[#c79c6e] font-semibold">
                          Card #{idx + 1}
                        </span>
                        {settings.success?.nextSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSuccessNextStepItem(idx)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={card.title || ''}
                          onChange={(e) => updateSuccessNextStepItem(idx, 'title', e.target.value)}
                          className="bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase tracking-wider font-semibold"
                          placeholder="CARD TITLE"
                        />
                        <textarea
                          rows={2}
                          value={card.description || ''}
                          onChange={(e) => updateSuccessNextStepItem(idx, 'description', e.target.value)}
                          className="bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 resize-none"
                          placeholder="Description text..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Labels */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Action Buttons Text
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Add To Calendar Button</label>
                    <input
                      type="text"
                      value={settings.success?.addToCalendarButtonText || ''}
                      onChange={(e) => updateField('success', 'addToCalendarButtonText', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="ADD TO CALENDAR"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">My Journey Button</label>
                    <input
                      type="text"
                      value={settings.success?.myJourneyButtonText || ''}
                      onChange={(e) => updateField('success', 'myJourneyButtonText', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="MY JOURNEY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Explore Library Button</label>
                    <input
                      type="text"
                      value={settings.success?.exploreLibraryButtonText || ''}
                      onChange={(e) => updateField('success', 'exploreLibraryButtonText', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="EXPLORE LIBRARY"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Create Account / Register Button</label>
                    <input
                      type="text"
                      value={settings.success?.createAccountButtonText || ''}
                      onChange={(e) => updateField('success', 'createAccountButtonText', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="CREATE ACCOUNT TO VIEW JOURNEY"
                    />
                  </div>
                </div>
              </div>

              {/* Quote Banner & Reschedule Policy */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Quote Banner & Bottom Reschedule Policy
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Quote (Line 1)</label>
                    <input
                      type="text"
                      value={settings.success?.quoteLine1 || ''}
                      onChange={(e) => updateField('success', 'quoteLine1', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="Clarity doesn't come from having all the answers."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Quote (Line 2 Accent)</label>
                    <input
                      type="text"
                      value={settings.success?.quoteLine2 || ''}
                      onChange={(e) => updateField('success', 'quoteLine2', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="It comes from asking better questions."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Change / Reschedule Heading</label>
                    <input
                      type="text"
                      value={settings.success?.changeHeading || ''}
                      onChange={(e) => updateField('success', 'changeHeading', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="NEED TO MAKE A CHANGE?"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Change Notice Text</label>
                    <input
                      type="text"
                      value={settings.success?.changeText || ''}
                      onChange={(e) => updateField('success', 'changeText', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="You can reschedule or cancel up to 24 hours before the session."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Policy Link Text</label>
                    <input
                      type="text"
                      value={settings.success?.changePolicyLinkText || ''}
                      onChange={(e) => updateField('success', 'changePolicyLinkText', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="View Rescheduling Policy →"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================= GENERAL & BACKGROUND ================= */}
          {activeTab === 'general' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h2 className="font-serif text-2xl text-white">General & Background</h2>
                  <p className="font-sans text-xs text-white/40 mt-0.5">Customize overall background image, dark overlay level, and privacy security footer.</p>
                </div>
                <span className="px-3 py-1 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/30 text-xs font-mono text-[#c79c6e]">
                  Atmosphere
                </span>
              </div>

              {/* Background Image Settings */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Page Background Visual
                </span>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs text-white/60">Custom Background Image URL (Optional)</label>
                  <input
                    type="text"
                    value={settings.general.bgImageUrl || ''}
                    onChange={(e) => updateField('general', 'bgImageUrl', e.target.value)}
                    className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                    placeholder="Leave empty to use default atmospheric desk lamp"
                  />
                  <span className="text-[0.7rem] text-white/30">Default asset: desk lamp with ambient vintage lighting.</span>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="font-sans text-xs text-white/60">Dark Overlay Opacity</label>
                    <span className="font-mono text-xs text-[#c79c6e]">{settings.general.overlayOpacity || 60}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={settings.general.overlayOpacity || 60}
                    onChange={(e) => updateField('general', 'overlayOpacity', Number(e.target.value))}
                    className="accent-[#c79c6e] cursor-pointer"
                  />
                </div>
              </div>

              {/* Privacy Footer */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">
                  Bottom Security & Privacy Notes
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Privacy Line 1</label>
                    <input
                      type="text"
                      value={settings.general.privacyNoteLine1 || ''}
                      onChange={(e) => updateField('general', 'privacyNoteLine1', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="Your information is private and only visible to me."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-white/60">Privacy Line 2</label>
                    <input
                      type="text"
                      value={settings.general.privacyNoteLine2 || ''}
                      onChange={(e) => updateField('general', 'privacyNoteLine2', e.target.value)}
                      className="bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white"
                      placeholder="It helps me show up better for you."
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="font-sans text-xs text-white/40">
              Changes will immediately reflect on the live website booking page.
            </span>
            <button
              onClick={() => handleSaveStep(activeTab)}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c79c6e] hover:bg-[#b58c5f] text-black font-sans text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(199,156,110,0.2)] disabled:opacity-50"
            >
              <FloppyDisk size={16} weight="bold" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

        </main>

      </div>

    </div>
  );
}
