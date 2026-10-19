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
  Square,
  MagnifyingGlass 
} from '@phosphor-icons/react';
import { useToast } from '../context/ToastContext';

import { API_URL } from '../utils/apiUrl';

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

const QUESTIONNAIRE_SECTIONS = [
  { id: 's01', number: 1, title: 'Your current situation', range: 'Q01–Q05' },
  { id: 's02', number: 2, title: 'The shift you want', range: 'Q06–Q10' },
  { id: 's03', number: 3, title: 'Inner world and pressure', range: 'Q11–Q15' },
  { id: 's04', number: 4, title: 'Core themes', range: 'Q16–Q20' },
  { id: 's05', number: 5, title: 'Direction and decisions', range: 'Q21–Q25' },
  { id: 's06', number: 6, title: 'Action and follow-through', range: 'Q26–Q30' },
  { id: 's07', number: 7, title: 'How we work together', range: 'Q31–Q35' },
  { id: 's08', number: 8, title: 'Logistics and format', range: 'Q36–Q40' },
  { id: 's09', number: 9, title: 'Anything else', range: 'Q41–Q45' }
];

const DEFAULT_BOOKING_SETTINGS = {
  general: {},
  step1: {},
  step2: {},
  step3: { nextSteps: [] },
  success: { nextSteps: [] }
};

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

  const [settings, setSettings] = useState(DEFAULT_BOOKING_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // ── Questionnaire State ──
  const [questionnaire, setQuestionnaire] = useState({
    title: 'Want to go deeper?',
    subtitle: 'An optional questionnaire to help me prepare for our conversation. There are 45 questions, and every question can be skipped.',
    badgeLabel: 'Optional • 45 Questions • ~25–35 mins',
    buttonText: 'Start optional questionnaire',
    resumeButtonText: 'Continue questionnaire',
    reviewButtonText: 'Review answers',
    completedText: 'Questionnaire Completed',
    submitButtonText: 'Save and return to booking',
    questions: []
  });
  const [qLoading, setQLoading] = useState(false);
  const [qSaving, setQSaving] = useState(false);
  const [qSaveSuccess, setQSaveSuccess] = useState(false);
  const [qSearch, setQSearch] = useState('');
  const [qSectionFilter, setQSectionFilter] = useState('all');

  // Fetch all booking settings on load
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/booking-settings`);
      if (!res.ok) throw new Error('Failed to load booking settings');
      const data = await res.json();
      setSettings({
        general: data?.general || {},
        step1: data?.step1 || {},
        step2: data?.step2 || {},
        step3: { ...(data?.step3 || {}), nextSteps: data?.step3?.nextSteps || [] },
        success: { ...(data?.success || {}), nextSteps: data?.success?.nextSteps || [] }
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading settings');
      setSettings(prev => prev || DEFAULT_BOOKING_SETTINGS);
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

  // Reset questionnaire to official 45 questions from backend
  const handleResetQuestionnaire = async () => {
    if (!window.confirm('Reset all questions to the official 45-question coaching questionnaire? This will restore all standard 45 questions across the 9 sections.')) {
      return;
    }
    try {
      setQLoading(true);
      const res = await fetch(`${API_URL}/api/questionnaire/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!res.ok) throw new Error('Failed to reset questionnaire');
      const data = await res.json();
      setQuestionnaire(data.data || data);
      showSuccess('Questionnaire restored to 45 official questions successfully!');
    } catch (err) {
      console.error(err);
      showError(err.message || 'Failed to reset questionnaire');
    } finally {
      setQLoading(false);
    }
  };

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
    const questions = questionnaire?.questions || [];
    const newNum = questions.length + 1;
    const newId = `q${String(newNum).padStart(2, '0')}`;
    const defaultSec = qSectionFilter !== 'all' 
      ? QUESTIONNAIRE_SECTIONS.find(s => s.id === qSectionFilter) 
      : QUESTIONNAIRE_SECTIONS[8];

    setQuestionnaire(prev => ({
      ...prev,
      questions: [
        ...(prev?.questions || []),
        {
          id: newId,
          number: newNum,
          question: 'New question text?',
          prompt: 'New question text?',
          instruction: 'Select all that apply.',
          type: 'multi_select',
          required: false,
          sectionId: defaultSec?.id || 's09',
          sectionTitle: defaultSec?.title || 'Anything else',
          options: [
            { id: `${newId}o1`, label: 'Option 1' },
            { id: `${newId}o2`, label: 'Option 2' }
          ]
        }
      ]
    }));
  };

  const removeQuestion = (qIdx) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    setQuestionnaire(prev => ({
      ...prev,
      questions: (prev?.questions || []).filter((_, i) => i !== qIdx)
    }));
  };

  const updateQuestion = (qIdx, field, value) => {
    setQuestionnaire(prev => {
      const questions = [...(prev?.questions || [])];
      questions[qIdx] = { 
        ...questions[qIdx], 
        [field]: value,
        ...(field === 'question' ? { prompt: value } : {}),
        ...(field === 'prompt' ? { question: value } : {})
      };
      return { ...prev, questions };
    });
  };

  const addOption = (qIdx) => {
    setQuestionnaire(prev => {
      const questions = [...(prev?.questions || [])];
      const q = { ...questions[qIdx] };
      const existing = q.options || [];
      if (existing.length >= 25) return prev;
      const newOptId = `${q.id || 'q'}o${existing.length + 1}_${Date.now()}`;
      q.options = [...existing, { id: newOptId, label: `Option ${existing.length + 1}` }];
      questions[qIdx] = q;
      return { ...prev, questions };
    });
  };

  const removeOption = (qIdx, oIdx) => {
    setQuestionnaire(prev => {
      const questions = [...(prev?.questions || [])];
      const q = { ...questions[qIdx] };
      if ((q.options || []).length <= 1) return prev;
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
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b border-stone-200 bg-[#faf7f2]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#c79c6e]/15 border border-[#c79c6e]/30 flex items-center justify-center shrink-0">
                      <Question size={18} className="text-[#a06235]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans text-sm font-semibold text-stone-900">Questionnaire Editor</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[#a06235] font-sans text-[0.68rem] font-bold uppercase tracking-wider">
                          {(questionnaire?.questions || []).length} Questions • 9 Sections
                        </span>
                      </div>
                      <p className="font-sans text-xs text-stone-500 mt-0.5">Manage optional coaching questionnaire questions, options, and section copy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetQuestionnaire}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:border-[#c9542f] text-stone-700 hover:text-[#c9542f] text-xs font-sans font-medium transition-all shadow-sm"
                      title="Reset all questions to default 45 questions across 9 sections"
                    >
                      <ArrowClockwise size={13} />
                      <span>Restore Default 45</span>
                    </button>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#c79c6e] text-white hover:bg-[#b0885e] text-xs font-sans font-semibold transition-all shadow-sm"
                    >
                      <Plus size={13} weight="bold" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>

                {qLoading ? (
                  <div className="flex items-center justify-center py-12 gap-3">
                    <div className="w-6 h-6 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin" />
                    <span className="text-stone-500 text-sm font-sans">Loading questionnaire...</span>
                  </div>
                ) : questionnaire ? (
                  <div className="p-6 flex flex-col gap-6 bg-[#faf8f5]">
                    {/* Banner Configuration */}
                    <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                      <span className="font-sans text-xs uppercase tracking-widest text-[#a06235] font-bold">Banner Text (shown on Step 2 page)</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-stone-600 font-medium">Banner Title</label>
                          <input type="text" value={questionnaire.title || ''} onChange={(e) => updateQField('title', e.target.value)} className="bg-white border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e]" placeholder="Want to go deeper?" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-stone-600 font-medium">Badge Label</label>
                          <input type="text" value={questionnaire.badgeLabel || ''} onChange={(e) => updateQField('badgeLabel', e.target.value)} className="bg-white border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e]" placeholder="Optional • 45 Questions • ~25–35 mins" />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                          <label className="font-sans text-xs text-stone-600 font-medium">Banner Subtitle / Description</label>
                          <textarea rows={2} value={questionnaire.subtitle || ''} onChange={(e) => updateQField('subtitle', e.target.value)} className="bg-white border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e] resize-none" placeholder="An optional questionnaire to help me prepare for our conversation..." />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-stone-600 font-medium">Start Button Text</label>
                          <input type="text" value={questionnaire.buttonText || ''} onChange={(e) => updateQField('buttonText', e.target.value)} className="bg-white border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e]" placeholder="Start optional questionnaire" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-stone-600 font-medium">Resume Button Text</label>
                          <input type="text" value={questionnaire.resumeButtonText || ''} onChange={(e) => updateQField('resumeButtonText', e.target.value)} className="bg-white border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e]" placeholder="Continue questionnaire" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-stone-600 font-medium">Review Button Text</label>
                          <input type="text" value={questionnaire.reviewButtonText || ''} onChange={(e) => updateQField('reviewButtonText', e.target.value)} className="bg-white border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e]" placeholder="Review answers" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-xs text-stone-600 font-medium">Submit / Return Button (in modal)</label>
                          <input type="text" value={questionnaire.submitButtonText || ''} onChange={(e) => updateQField('submitButtonText', e.target.value)} className="bg-white border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e]" placeholder="Save and return to booking" />
                        </div>
                      </div>
                    </div>

                    {/* Section Filter & Search */}
                    <div className="flex flex-col gap-3 bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-xs uppercase tracking-widest text-[#a06235] font-bold">Browse Questions</span>
                          <span className="text-stone-500 text-xs font-mono">({(questionnaire.questions || []).length} total)</span>
                        </div>
                        <div className="relative min-w-[220px]">
                          <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            value={qSearch}
                            onChange={(e) => setQSearch(e.target.value)}
                            placeholder="Search question prompt or ID..."
                            className="w-full bg-[#faf8f5] border border-stone-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c79c6e] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Section Tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                        <button
                          type="button"
                          onClick={() => setQSectionFilter('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-sans whitespace-nowrap transition-all ${
                            qSectionFilter === 'all'
                              ? 'bg-[#c9542f] text-white font-semibold shadow-sm'
                              : 'bg-[#faf8f5] text-stone-700 hover:text-stone-900 hover:bg-stone-200/50 border border-stone-200'
                          }`}
                        >
                          All ({ (questionnaire.questions || []).length })
                        </button>
                        {QUESTIONNAIRE_SECTIONS.map((sec) => {
                          const count = (questionnaire.questions || []).filter(q => 
                            q.sectionId === sec.id || `s0${Math.min(9, Math.ceil((q.number || 1) / 5))}` === sec.id
                          ).length;
                          return (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => setQSectionFilter(sec.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-sans whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                qSectionFilter === sec.id
                                  ? 'bg-[#c9542f] text-white font-semibold shadow-sm'
                                  : 'bg-[#faf8f5] text-stone-700 hover:text-stone-900 hover:bg-stone-200/50 border border-stone-200'
                              }`}
                            >
                              <span>{sec.number}. {sec.title}</span>
                              <span className={`text-[0.65rem] px-1.5 py-0.2 rounded-full ${qSectionFilter === sec.id ? 'bg-black/20 text-white font-bold' : 'bg-stone-200/70 text-stone-600'}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Questions Cards List */}
                    <div className="flex flex-col gap-4">
                      {(() => {
                        const allQ = questionnaire.questions || [];
                        const matched = allQ.map((q, origIdx) => ({ q, origIdx })).filter(({ q, origIdx }) => {
                          const secMatch = qSectionFilter === 'all' || q.sectionId === qSectionFilter || `s0${Math.min(9, Math.ceil((q.number || (origIdx + 1)) / 5))}` === qSectionFilter;
                          if (!secMatch) return false;
                          if (!qSearch.trim()) return true;
                          const s = qSearch.toLowerCase();
                          const text = (q.prompt || q.question || '').toLowerCase();
                          const id = (q.id || '').toLowerCase();
                          const num = String(q.number || origIdx + 1);
                          return text.includes(s) || id.includes(s) || num.includes(s);
                        });

                        if (matched.length === 0) {
                          return (
                            <div className="py-12 text-center border border-dashed border-stone-300 rounded-xl bg-white">
                              <Question size={32} className="text-stone-300 mx-auto mb-2" />
                              <p className="font-sans text-sm text-stone-500">No questions match your current filter.</p>
                              <button
                                type="button"
                                onClick={() => { setQSectionFilter('all'); setQSearch(''); }}
                                className="mt-3 text-xs text-[#c9542f] hover:underline font-sans font-medium"
                              >
                                Clear search & section filter
                              </button>
                            </div>
                          );
                        }

                        return matched.map(({ q, origIdx }) => {
                          const displayNum = q.number || origIdx + 1;
                          const qType = q.type || 'multi_select';
                          const isLongText = qType === 'long_text';
                          const isIntegerChoice = qType === 'integer_choice';
                          const maxSel = q.max_selections;

                          return (
                            <div key={q.id || origIdx} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:border-[#c79c6e]/60 transition-all">
                              {/* Top Bar - Warm Light Header */}
                              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-stone-200 bg-[#f7f4ee]">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="w-8 h-6 rounded-md bg-[#c79c6e]/20 border border-[#c79c6e]/40 flex items-center justify-center font-mono text-[0.7rem] text-[#914d1e] font-bold shrink-0">
                                    Q{String(displayNum).padStart(2, '0')}
                                  </span>
                                  <span className="font-mono text-[0.68rem] text-stone-500 font-semibold">{q.id || `q${displayNum}`}</span>
                                  {q.sectionTitle && (
                                    <span className="px-2 py-0.5 rounded bg-white border border-stone-300 text-stone-700 text-[0.65rem] font-sans font-medium">
                                      {q.sectionTitle}
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[#914d1e] text-[0.65rem] font-mono font-semibold uppercase">
                                    {isLongText ? 'Long text' : isIntegerChoice ? 'Scale 0–10' : maxSel ? `Multi (max ${maxSel})` : qType === 'single_select' ? 'Single choice' : 'Multi-select'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuestion(origIdx, 'required', !q.required)}
                                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[0.65rem] font-sans font-semibold uppercase tracking-wider transition-all ${
                                      q.required
                                        ? 'bg-amber-100 border border-amber-300 text-amber-800'
                                        : 'bg-white border border-stone-300 text-stone-600 hover:text-stone-900'
                                    }`}
                                  >
                                    {q.required ? <CheckSquare size={11} weight="fill" /> : <Square size={11} />}
                                    {q.required ? 'Required' : 'Optional'}
                                  </button>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveQuestion(origIdx, -1)}
                                    disabled={origIdx === 0}
                                    className="w-7 h-7 flex items-center justify-center rounded border border-stone-300 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
                                    title="Move up"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveQuestion(origIdx, 1)}
                                    disabled={origIdx === allQ.length - 1}
                                    className="w-7 h-7 flex items-center justify-center rounded border border-stone-300 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
                                    title="Move down"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeQuestion(origIdx)}
                                    className="w-7 h-7 flex items-center justify-center rounded border border-red-200 bg-white text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all ml-1 shadow-xs"
                                    title="Delete question"
                                  >
                                    <Trash size={12} />
                                  </button>
                                </div>
                              </div>

                              <div className="p-5 flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="font-sans text-[0.68rem] text-stone-600 uppercase tracking-wider font-semibold">Question Prompt</label>
                                  <textarea
                                    rows={2}
                                    value={q.prompt || q.question || ''}
                                    onChange={(e) => updateQuestion(origIdx, 'prompt', e.target.value)}
                                    className="bg-white border border-stone-300 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e] resize-none"
                                    placeholder="Type your question here..."
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="flex flex-col gap-1.5">
                                    <label className="font-sans text-[0.68rem] text-stone-600 uppercase tracking-wider font-semibold">Instruction / Helper Subtext</label>
                                    <input
                                      type="text"
                                      value={q.instruction || ''}
                                      onChange={(e) => updateQuestion(origIdx, 'instruction', e.target.value)}
                                      className="bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e]"
                                      placeholder="e.g. Select up to 3 / Select all that apply..."
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="font-sans text-[0.68rem] text-stone-600 uppercase tracking-wider font-semibold">Assigned Section</label>
                                    <select
                                      value={q.sectionId || 's01'}
                                      onChange={(e) => {
                                        const sec = QUESTIONNAIRE_SECTIONS.find(s => s.id === e.target.value);
                                        updateQuestion(origIdx, 'sectionId', e.target.value);
                                        if (sec) updateQuestion(origIdx, 'sectionTitle', sec.title);
                                      }}
                                      className="bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e]"
                                    >
                                      {QUESTIONNAIRE_SECTIONS.map(s => (
                                        <option key={s.id} value={s.id}>{s.number}. {s.title} ({s.range})</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* Options handling based on question type */}
                                {isLongText ? (
                                  <div className="p-3.5 rounded-lg bg-[#faf8f5] border border-stone-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-stone-600 text-xs font-sans">
                                      <NotePencil size={15} className="text-[#a06235]" />
                                      <span>Open-ended multi-line text input on client side (No MCQ choices needed).</span>
                                    </div>
                                    <span className="font-mono text-[0.68rem] text-stone-400">max: {q.max_characters || 2000} chars</span>
                                  </div>
                                ) : isIntegerChoice ? (
                                  <div className="p-3.5 rounded-lg bg-[#faf8f5] border border-stone-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-stone-600 text-xs font-sans">
                                      <Sparkle size={15} className="text-[#a06235]" />
                                      <span>0–10 numeric rating scale with explicit "Not sure" button.</span>
                                    </div>
                                    <span className="font-mono text-[0.68rem] text-[#a06235] font-semibold">0 to 10 Scale</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                      <label className="font-sans text-[0.68rem] text-stone-600 uppercase tracking-wider font-semibold">
                                        Options <span className="text-stone-400 font-normal normal-case tracking-normal">({(q.options || []).length} choices)</span>
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => addOption(origIdx)}
                                        className="flex items-center gap-1 text-[0.72rem] text-[#c9542f] hover:text-[#914d1e] font-sans font-semibold transition-colors"
                                      >
                                        <Plus size={12} weight="bold" /> Add Option
                                      </button>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      {(q.options || []).map((opt, oIdx) => (
                                        <div key={opt.id || oIdx} className="flex items-center gap-2 group">
                                          <span className="w-6 h-6 rounded border border-stone-300 bg-[#faf8f5] flex items-center justify-center font-mono text-[0.68rem] text-stone-600 font-bold shrink-0">
                                            {String.fromCharCode(65 + (oIdx % 26))}
                                          </span>
                                          <input
                                            type="text"
                                            value={opt.label || ''}
                                            onChange={(e) => updateOption(origIdx, oIdx, e.target.value)}
                                            className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e] transition-colors"
                                            placeholder={`Option ${oIdx + 1} text...`}
                                          />
                                          {opt.is_exclusive && (
                                            <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800 font-sans text-[0.62rem] font-semibold whitespace-nowrap">
                                              Exclusive
                                            </span>
                                          )}
                                          {opt.allows_write_in && (
                                            <span className="px-2 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-800 font-sans text-[0.62rem] font-semibold whitespace-nowrap">
                                              Write-in
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => removeOption(origIdx, oIdx)}
                                            disabled={(q.options || []).length <= 1}
                                            className="w-7 h-7 flex items-center justify-center rounded text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shrink-0"
                                            title="Delete option"
                                          >
                                            <Trash size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}

                      {/* Bottom Add Question Button */}
                      <button 
                        type="button" 
                        onClick={addQuestion} 
                        className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl border border-dashed border-[#c79c6e] text-[#c9542f] bg-white hover:bg-[#c79c6e]/10 text-xs font-sans font-semibold uppercase tracking-wider transition-all shadow-xs"
                      >
                        <Plus size={15} weight="bold" />
                        <span>Add Question</span>
                      </button>

                      {(questionnaire.questions || []).length > 0 && (
                        <div className="text-center">
                          <span className="font-sans text-xs text-stone-400">{(questionnaire.questions || []).length} questions total across 9 sections</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="font-sans text-sm text-stone-400">Failed to load questionnaire. Try refreshing.</p>
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
                    placeholder="You can reschedule or cancel up to 48 hours before the session."
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
                      placeholder="You can reschedule or cancel up to 48 hours before the session."
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
