import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkle, 
  Image as ImageIcon, 
  UploadSimple, 
  Link as LinkIcon, 
  FloppyDisk, 
  ArrowClockwise, 
  CheckCircle, 
  WarningCircle, 
  Eye, 
  SlidersHorizontal,
  Info,
  ArrowSquareOut,
  Desktop,
  ChatCircleText,
  Quotes,
  Question,
  MegaphoneSimple,
  Compass,
  Plus,
  Trash,
  AirplaneTilt,
  Crosshair,
  Heart,
  Brain,
  CaretDown,
  LockKey,
  Mountains,
  Path,
  Kanban
} from '@phosphor-icons/react';

// Exact Default Assets from Frontend Website
const defaultHeroImg = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1287&auto=format&fit=crop';
import defaultTransImg from '../../../client/src/assets/Page2/bottom.webp';
import defaultThinkImg from '../../../client/src/assets/Page3/ChatGPT Image Jul 24, 2026, 02_21_12 PM.webp';
import defaultFeelImg from '../../../client/src/assets/Page4/ChatGPT Image Jul 24, 2026, 02_41_22 PM.webp';
import defaultDecideImg from '../../../client/src/assets/Page5/ChatGPT Image Jul 24, 2026, 03_00_05 PM.webp';
import defaultCoachingProcessImg from '../../../client/src/assets/Page6/ChatGPT Image Jul 24, 2026, 03_28_41 PM.webp';
import defaultCoachingJourneyImg from '../../../client/src/assets/Page7/ChatGPT Image Jul 24, 2026, 03_42_25 PM.webp';
import defaultPilotImg from '../../../client/src/assets/Page8/pilot.webp';
import defaultCoachImg from '../../../client/src/assets/Page8/Coach.webp';
import defaultHumanImg from '../../../client/src/assets/Page8/human.webp';
import defaultTestimonialsImg from '../../../client/src/assets/Page9/ChatGPT Image Jul 24, 2026, 04_56_37 PM.webp';
import defaultCtaImg from '../../../client/src/assets/Page10/ChatGPT Image Jul 24, 2026, 05_10_01 PM.webp';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SIDEBAR_TABS = [
  { id: 'hero', label: 'Hero Section', icon: <Desktop size={18} />, description: 'Main banner, title & background' },
  { id: 'problem', label: 'Problem Statement', icon: <Compass size={18} />, description: 'Core struggle & transition' },
  { id: 'think', label: 'Principle 01: Think', icon: <Brain size={18} />, description: 'Cognitive clarity & noise reduction' },
  { id: 'feel', label: 'Principle 02: Feel', icon: <Heart size={18} />, description: 'Emotional sovereignty & depth' },
  { id: 'decide', label: 'Principle 03: Decide', icon: <Crosshair size={18} />, description: 'Aligned action & conviction' },
  { id: 'coachingProcess', label: 'Coaching Process', icon: <Kanban size={18} />, description: '5-step proven methodology & lounge visual' },
  { id: 'coachingJourney', label: 'Coaching Journey', icon: <Mountains size={18} />, description: 'Mountain path, 4 journey nodes & pillars' },
  { id: 'about', label: 'Meet Aarkesh', icon: <ChatCircleText size={18} />, description: 'Coach 3 roles & story' },
  { id: 'testimonials', label: 'Testimonials', icon: <Quotes size={18} />, description: 'Client reviews & words' },
  { id: 'faq', label: 'FAQ Section', icon: <Question size={18} />, description: 'Frequently asked questions' },
  { id: 'cta', label: 'Final Call to Action', icon: <MegaphoneSimple size={18} />, description: 'Bottom booking banner' },
];

// Reusable Image Editor Component with Prominent Dimensions & < 200 KB Enforcement
function ImageEditorCard({
  title = 'Background Image',
  dimensions = '1536 × 1024 px (16:9 / 3:2)',
  orientation = 'Landscape (Horizontal)',
  maxSize = 'Under 200 KB',
  imageUrl = '',
  fallbackUrl = '',
  aspectRatio = 'aspect-[16/9]',
  onUpload,
  onUrlChange,
  isUploading = false,
  tip = 'Keep subject focused to the right for clear text readability.',
  extraControls = null,
  overlayOpacity = 40,
}) {
  const displayImage = imageUrl || fallbackUrl;

  return (
    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
          <ImageIcon size={16} />
          <span>{title}</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/30 text-[0.62rem] font-mono font-semibold text-[#c79c6e]">
          {dimensions}
        </span>
      </div>

      {/* Specifications Box */}
      <div className="bg-gradient-to-br from-[#12100e] to-[#070707] border border-[#c79c6e]/25 rounded-xl p-3.5 flex flex-col gap-2.5">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-white/40 text-[0.6rem] uppercase tracking-wider">Dimensions</span>
            <span className="text-white font-mono font-medium text-xs truncate">{dimensions.split(' ')[0]} px</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/40 text-[0.6rem] uppercase tracking-wider">Orientation</span>
            <span className="text-white font-medium text-xs truncate">{orientation}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/40 text-[0.6rem] uppercase tracking-wider">File Size</span>
            <span className="text-[#c79c6e] font-mono font-bold text-xs">Under 200 KB</span>
          </div>
        </div>
        <p className="text-[0.68rem] text-white/50 bg-black/40 p-2 rounded border border-white/5 leading-relaxed">
          💡 <strong>Tip:</strong> {tip}
        </p>
      </div>

      {/* Image Preview Box */}
      <div className={`w-full ${aspectRatio} rounded-xl overflow-hidden relative border border-white/10 bg-black group flex items-center justify-center shadow-inner`}>
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt={title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {/* Live Contrast Overlay Darkness */}
            <div 
              className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
              style={{ opacity: (overlayOpacity || 40) / 100 }}
            />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
              <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[0.6rem] font-mono text-[#c79c6e] border border-white/10">
                {imageUrl ? 'Custom Upload / URL' : 'Default Asset'}
              </span>
              <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[0.6rem] font-mono text-white/80 border border-white/10">
                {dimensions.split(' ')[0]}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-2 p-6">
            <ImageIcon size={28} />
            <span className="text-xs">No image uploaded</span>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <button
        type="button"
        onClick={onUpload}
        disabled={isUploading}
        className="w-full py-3 rounded-lg border border-[#c79c6e]/40 bg-[#c79c6e]/10 hover:bg-[#c79c6e]/20 text-[#c79c6e] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin" />
            <span>Uploading (&lt; 200 KB)...</span>
          </>
        ) : (
          <>
            <UploadSimple size={16} weight="bold" />
            <span>Upload Image (Under 200 KB)</span>
          </>
        )}
      </button>

      {/* External URL Input with Clear / Reset Button */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-[0.68rem] font-semibold uppercase tracking-wider text-white/40">
            Or Direct Image URL
          </label>
          {imageUrl && (
            <button
              type="button"
              onClick={() => onUrlChange('')}
              className="text-[0.65rem] text-[#c79c6e] hover:underline"
            >
              Reset to Default Asset
            </button>
          )}
        </div>
        <input
          type="url"
          value={imageUrl || ''}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
        />
      </div>

      {/* Extra Controls like opacity sliders */}
      {extraControls}
    </div>
  );
}

export default function AdminHomeEditor() {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab');
      if (tabFromUrl) return tabFromUrl;
      const savedTab = localStorage.getItem('bwa_admin_home_tab');
      if (savedTab) return savedTab;
    } catch (e) {}
    return 'hero';
  });

  // Persist tab on change
  useEffect(() => {
    try {
      localStorage.setItem('bwa_admin_home_tab', activeTab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [activeTab]);

  const [allSections, setAllSections] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTargetField, setUploadTargetField] = useState(null);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch All Home Settings on Load
  useEffect(() => {
    fetchAllHomeSettings();
  }, []);

  const fetchAllHomeSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/home-settings`);
      if (res.ok) {
        const data = await res.json();
        setAllSections(data);
      }
    } catch (err) {
      console.error('Failed to fetch home settings:', err);
      showToast('Could not load current settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated Updater for Principle Sections (think, feel, decide)
  const handlePrincipleChange = (principleKey, field, value) => {
    setAllSections(prev => ({
      ...prev,
      principles: {
        ...(prev?.principles || {}),
        [principleKey]: {
          ...(prev?.principles?.[principleKey] || {}),
          [field]: value
        }
      }
    }));
  };

  // Coaching Process Step Updater
  const handleCoachingProcessStepChange = (index, field, value) => {
    setAllSections(prev => {
      const current = prev?.coachingProcess || {};
      const defaultSteps = [
        { num: '01', title: 'CONNECT', text: 'We start with a meaningful conversation to understand what matters to you.' },
        { num: '02', title: 'CLARIFY', text: "We dig deep to bring clarity to your thoughts, patterns, and what's keeping you stuck." },
        { num: '03', title: 'ALIGN', text: 'We align your values, goals, and actions with the life you truly want to create.' },
        { num: '04', title: 'ACT', text: "You take intentional action with confidence. I'm here to guide, challenge, and support you." },
        { num: '05', title: 'EVOLVE', text: 'We reflect, recalibrate, and keep building momentum for lasting transformation.' }
      ];
      const steps = [...(current.steps && current.steps.length > 0 ? current.steps : defaultSteps)];
      steps[index] = { ...steps[index], [field]: value };
      return {
        ...prev,
        coachingProcess: {
          ...current,
          steps
        }
      };
    });
  };

  // Coaching Journey Step Updater
  const handleCoachingJourneyStepChange = (index, field, value) => {
    setAllSections(prev => {
      const current = prev?.coachingJourney || {};
      const defaultSteps = [
        { num: '01', title: 'CLARIFY', text: "Root cause clarity.\nReal understanding." },
        { num: '02', title: 'CONNECT', text: "Emotional honesty.\nValues alignment." },
        { num: '03', title: 'CREATE', text: "Aligned decisions.\nIntentional life." },
        { num: '04', title: 'COMMIT', text: "Sustained action.\nLasting change." }
      ];
      const steps = [...(current.steps && current.steps.length > 0 ? current.steps : defaultSteps)];
      steps[index] = { ...steps[index], [field]: value };
      return {
        ...prev,
        coachingJourney: {
          ...current,
          steps
        }
      };
    });
  };

  // How It Works Item Updater
  const handleHowItWorksChange = (index, value) => {
    setAllSections(prev => {
      const current = prev?.coachingJourney || {};
      const defaultItems = [
        'Personalized coaching sessions tailored to you.',
        'Powerful conversations that create real shifts.',
        'Practical tools and frameworks you can use.',
        'Accountability that keeps you moving forward.'
      ];
      const howItWorks = [...(current.howItWorks && current.howItWorks.length > 0 ? current.howItWorks : defaultItems)];
      howItWorks[index] = value;
      return {
        ...prev,
        coachingJourney: {
          ...current,
          howItWorks
        }
      };
    });
  };

  // Generic Field Updater for Current Section
  const handleSectionChange = (field, value) => {
    setAllSections(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [field]: value
      }
    }));
  };

  // Nested Updater (e.g. for about.rolePilot)
  const handleNestedChange = (group, field, value) => {
    setAllSections(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [group]: {
          ...(prev[activeTab]?.[group] || {}),
          [field]: value
        }
      }
    }));
  };

  // Handle Image Upload with < 200 KB Validation
  const triggerImageUpload = (targetFieldPath) => {
    setUploadTargetField(targetFieldPath);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation: under 200 KB
    const MAX_SIZE_BYTES = 200 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeKB = (file.size / 1024).toFixed(1);
      showToast(`Image is ${sizeKB} KB. Max allowed size is 200 KB. Please compress your image.`, 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      const finalUrl = data.imageUrl?.startsWith('http') 
        ? data.imageUrl 
        : `${API_URL}${data.imageUrl}`;

      if (uploadTargetField) {
        if (uploadTargetField.startsWith('principles.')) {
          const [, principleKey, field] = uploadTargetField.split('.');
          handlePrincipleChange(principleKey, field, finalUrl);
        } else if (uploadTargetField.includes('.')) {
          const [group, field] = uploadTargetField.split('.');
          handleNestedChange(group, field, finalUrl);
        } else {
          handleSectionChange(uploadTargetField, finalUrl);
        }
      }
      showToast('Image uploaded successfully (Under 200 KB)!');
    } catch (err) {
      console.error('Image upload error:', err);
      showToast('Failed to upload image.', 'error');
    } finally {
      setIsUploading(false);
      setUploadTargetField(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save Current Section to Database
  const handleSaveSection = async () => {
    if (!allSections) return;
    const isPrinciple = ['think', 'feel', 'decide'].includes(activeTab);
    const sectionEndpoint = isPrinciple ? 'principles' : activeTab;
    const payload = allSections[sectionEndpoint];
    if (!payload) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/home-settings/${sectionEndpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      showToast(`${SIDEBAR_TABS.find(t => t.id === activeTab)?.label} saved successfully!`);
    } catch (err) {
      console.error('Save error:', err);
      showToast('Failed to save changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !allSections) {
    return (
      <div className="w-full min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-6 h-6 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-white/50">Loading Home Editor...</span>
        </div>
      </div>
    );
  }

  const currentHero = allSections.hero || {};
  const currentProblem = allSections.problem || {};
  const currentPrinciples = allSections.principles || {};
  const currentCoachingProcess = allSections.coachingProcess || {};
  const currentCoachingJourney = allSections.coachingJourney || {};
  const currentAbout = allSections.about || {};
  const currentTestimonials = allSections.testimonials || {};
  const currentFaq = allSections.faq || {};
  const currentCta = allSections.cta || {};

  const currentGlobalOverlayOpacity = currentHero.overlayOpacity ?? 40;

  const handleGlobalOverlayChange = (val) => {
    setAllSections(prev => ({
      ...prev,
      hero: {
        ...(prev?.hero || {}),
        overlayOpacity: val
      }
    }));
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      
      {/* Hidden Global File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg border backdrop-blur-xl shadow-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'error'
            ? 'bg-red-950/90 border-red-500/30 text-red-200'
            : toast.type === 'info'
            ? 'bg-blue-950/90 border-blue-500/30 text-blue-200'
            : 'bg-[#0e0e0e]/95 border-[#c79c6e]/40 text-[#c79c6e]'
        }`}>
          {toast.type === 'error' ? (
            <WarningCircle size={20} className="text-red-400" />
          ) : (
            <CheckCircle size={20} className="text-[#c79c6e]" />
          )}
          <span className="text-xs font-medium uppercase tracking-wider">{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/5 px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl text-white">Home Page Editor</h1>
            <span className="px-2 py-0.5 rounded bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.65rem] font-semibold text-[#c79c6e] uppercase tracking-wider">
              {SIDEBAR_TABS.find(t => t.id === activeTab)?.label}
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Customize content and images. All image uploads must be <strong className="text-[#c79c6e]">under 200 KB</strong> for maximum performance.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium transition-all"
          >
            <Eye size={15} />
            <span>View Live Site</span>
            <ArrowSquareOut size={13} className="opacity-60" />
          </a>

          <button
            onClick={fetchAllHomeSettings}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-xs font-medium transition-all cursor-pointer"
          >
            <ArrowClockwise size={15} />
            <span>Reload</span>
          </button>

          <button
            onClick={handleSaveSection}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#c79c6e] hover:bg-[#b0885e] text-black font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#c79c6e]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
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

      {/* Main Layout: Left Sidebar + Right Editor Body */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
        
        {/* ─── LEFT SIDEBAR TABS ─── */}
        <aside className="w-full md:w-72 lg:w-80 bg-[#080808] border-r border-white/5 p-4 lg:p-6 shrink-0 flex flex-col gap-2">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/40 px-3 py-1">
            PAGE SECTIONS
          </span>

          <div className="flex flex-col gap-1.5 mt-1">
            {SIDEBAR_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#c79c6e]/15 border border-[#c79c6e]/40 text-white shadow-lg shadow-black/40'
                      : 'border border-transparent hover:bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${
                    isActive ? 'bg-[#c79c6e] text-black' : 'bg-white/5 text-white/70'
                  }`}>
                    {tab.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-semibold uppercase tracking-wider truncate ${
                        isActive ? 'text-[#c79c6e]' : 'text-white'
                      }`}>
                        {tab.label}
                      </span>
                    </div>
                    <p className="text-[0.72rem] text-white/40 truncate mt-0.5">
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-xs text-white/50">
              <Info size={18} className="text-[#c79c6e] shrink-0" />
              <span>All uploads must be under 200 KB. Clicking 'Save Section' instantly updates MongoDB.</span>
            </div>
          </div>
        </aside>

        {/* ─── RIGHT CONTENT AREA ─── */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          
          {/* =========================================================
              1. HERO SECTION
             ========================================================= */}
          {activeTab === 'hero' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <h2 className="font-serif text-2xl text-white">Hero Banner Customizer</h2>
                <p className="text-xs text-white/50">
                  Update headlines, tagline, CTA button, and background portrait image with under 200 KB size specs.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Text Controls */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                      <Sparkle size={16} />
                      <span>Headlines & Copy</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                        Tagline / Eyebrow Text
                      </label>
                      <input
                        type="text"
                        value={currentHero.eyebrowText || ''}
                        onChange={(e) => handleSectionChange('eyebrowText', e.target.value)}
                        placeholder="CLARITY. HONESTY. INTENTION."
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                        Heading Line 1 (Main White Text)
                      </label>
                      <input
                        type="text"
                        value={currentHero.headingLine1 || ''}
                        onChange={(e) => handleSectionChange('headingLine1', e.target.value)}
                        placeholder="Clarity changes"
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">
                        Heading Accent (Italic Gold Text)
                      </label>
                      <input
                        type="text"
                        value={currentHero.headingAccent || ''}
                        onChange={(e) => handleSectionChange('headingAccent', e.target.value)}
                        placeholder="everything."
                        className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                        Description Paragraph
                      </label>
                      <textarea
                        rows={3}
                        value={currentHero.description || ''}
                        onChange={(e) => handleSectionChange('description', e.target.value)}
                        placeholder="A space to think clearly, feel honestly and decide intentionally."
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* CTA Button Card */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                      <LinkIcon size={16} />
                      <span>Action Button</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={currentHero.ctaText || ''}
                          onChange={(e) => handleSectionChange('ctaText', e.target.value)}
                          placeholder="Book a Session"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                          Button Link
                        </label>
                        <input
                          type="text"
                          value={currentHero.ctaLink || ''}
                          onChange={(e) => handleSectionChange('ctaLink', e.target.value)}
                          placeholder="/book"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Visuals - Reusable ImageEditorCard */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <ImageEditorCard
                    title="Hero Banner Image"
                    dimensions="1920 × 1080 px (16:9)"
                    maxSize="Under 200 KB"
                    aspectRatio="aspect-[16/9]"
                    imageUrl={currentHero.bgImageUrl}
                    fallbackUrl={defaultHeroImg}
                    onUpload={() => triggerImageUpload('bgImageUrl')}
                    onUrlChange={(url) => handleSectionChange('bgImageUrl', url)}
                    isUploading={isUploading}
                    tip="Keep coach portrait focused towards the right half so left-side typography remains crisp."
                    overlayOpacity={currentGlobalOverlayOpacity}
                    extraControls={
                      <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-white flex items-center gap-1.5">
                            <SlidersHorizontal size={14} className="text-[#c79c6e]" />
                            <span>Global Contrast Overlay Darkness</span>
                          </label>
                          <span className="text-xs font-mono text-[#c79c6e] font-semibold">
                            {currentGlobalOverlayOpacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          step="5"
                          value={currentGlobalOverlayOpacity}
                          onChange={(e) => handleGlobalOverlayChange(Number(e.target.value))}
                          className="w-full accent-[#c79c6e] cursor-pointer"
                        />
                        <p className="text-[0.68rem] text-white/50 leading-relaxed bg-black/40 p-2.5 rounded border border-white/5">
                          ⚡ <strong>Global Controller:</strong> Adjusting this bar sets the background contrast darkness on <strong>ALL images & sections</strong> across the entire website simultaneously.
                        </p>
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              2. PROBLEM STATEMENT
             ========================================================= */}
          {activeTab === 'problem' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <h2 className="font-serif text-2xl text-white">Problem Statement & Transition</h2>
                <p className="text-xs text-white/50">
                  Manage the pinned problem statement copy and the transition intro banner.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card 1: Problem Copy */}
                <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                    <Compass size={16} />
                    <span>Problem Heading & Quotes</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Eyebrow Text
                    </label>
                    <input
                      type="text"
                      value={currentProblem.eyebrowText || ''}
                      onChange={(e) => handleSectionChange('eyebrowText', e.target.value)}
                      placeholder="MAYBE YOU'VE SPENT YEARS"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Heading Line 1
                    </label>
                    <input
                      type="text"
                      value={currentProblem.headingLine1 || ''}
                      onChange={(e) => handleSectionChange('headingLine1', e.target.value)}
                      placeholder="Trying to fix what isn't the"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">
                      Heading Accent (Italic Gold)
                    </label>
                    <input
                      type="text"
                      value={currentProblem.headingAccent || ''}
                      onChange={(e) => handleSectionChange('headingAccent', e.target.value)}
                      placeholder="real problem."
                      className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Quote Line (Italic)
                    </label>
                    <input
                      type="text"
                      value={currentProblem.quoteItalic || ''}
                      onChange={(e) => handleSectionChange('quoteItalic', e.target.value)}
                      placeholder="Things you carry, cloud your perspective."
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Quote Subtext
                    </label>
                    <input
                      type="text"
                      value={currentProblem.quoteSubtext || ''}
                      onChange={(e) => handleSectionChange('quoteSubtext', e.target.value)}
                      placeholder="....Until you learn to see clearly"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>
                </div>

                {/* Card 2: Transition Banner Card */}
                <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                    <Sparkle size={16} />
                    <span>Transition Intro Banner</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Transition Eyebrow
                    </label>
                    <input
                      type="text"
                      value={currentProblem.transEyebrow || ''}
                      onChange={(e) => handleSectionChange('transEyebrow', e.target.value)}
                      placeholder="CLARITY ISN'T LUCK."
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Transition Heading
                    </label>
                    <input
                      type="text"
                      value={currentProblem.transHeading || ''}
                      onChange={(e) => handleSectionChange('transHeading', e.target.value)}
                      placeholder="It's a skill. And it"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">
                      Transition Accent
                    </label>
                    <input
                      type="text"
                      value={currentProblem.transAccent || ''}
                      onChange={(e) => handleSectionChange('transAccent', e.target.value)}
                      placeholder="changes everything."
                      className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              3. PRINCIPLE 01: THINK
             ========================================================= */}
          {activeTab === 'think' && (() => {
            const p = currentPrinciples.think || {};
            return (
              <div className="flex flex-col gap-8 max-w-5xl">
                <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                  <h2 className="font-serif text-2xl text-white">Principle 01: THINK (Cognitive Clarity)</h2>
                  <p className="text-xs text-white/50">
                    Manage headline copy, noise reduction quote, and wide cinematic landscape background image.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Text Controls */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                        <Brain size={16} />
                        <span>Principle Headlines & Copy</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Eyebrow</label>
                          <input
                            type="text"
                            value={p.eyebrow || ''}
                            onChange={(e) => handlePrincipleChange('think', 'eyebrow', e.target.value)}
                            placeholder="MY PHILOSOPHY"
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Main Title (White)</label>
                          <input
                            type="text"
                            value={p.title || ''}
                            onChange={(e) => handlePrincipleChange('think', 'title', e.target.value)}
                            placeholder="THINK"
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Accent Title (Gold)</label>
                          <input
                            type="text"
                            value={p.subtitle || ''}
                            onChange={(e) => handlePrincipleChange('think', 'subtitle', e.target.value)}
                            placeholder="CLEARLY."
                            className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif focus:border-[#c79c6e]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Highlight Quote (Italic)</label>
                        <input
                          type="text"
                          value={p.highlight || ''}
                          onChange={(e) => handlePrincipleChange('think', 'highlight', e.target.value)}
                          placeholder="Clarity is the bridge between intention and action."
                          className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif focus:border-[#c79c6e]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Description Paragraph</label>
                        <textarea
                          rows={4}
                          value={p.description || ''}
                          onChange={(e) => handlePrincipleChange('think', 'description', e.target.value)}
                          placeholder="Your mind creates stories. Some empower you, most hold you back..."
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e] resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Button Text</label>
                        <input
                          type="text"
                          value={p.buttonText || ''}
                          onChange={(e) => handlePrincipleChange('think', 'buttonText', e.target.value)}
                          placeholder="SCROLL FOR NEXT PRINCIPLE"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Landscape Image Card */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <ImageEditorCard
                      title="Think Scene Landscape"
                      dimensions="1536 × 1024 px (16:9 / 3:2)"
                      orientation="Landscape (Horizontal)"
                      maxSize="Under 200 KB"
                      aspectRatio="aspect-[16/9]"
                      imageUrl={p.bgImg}
                      fallbackUrl={defaultThinkImg}
                      onUpload={() => triggerImageUpload('principles.think.bgImg')}
                      onUrlChange={(url) => handlePrincipleChange('think', 'bgImg', url)}
                      isUploading={isUploading}
                      tip="Man sitting at wooden desk near window looking at sunset. Keep subject on the right side."
                      overlayOpacity={currentGlobalOverlayOpacity}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =========================================================
              4. PRINCIPLE 02: FEEL
             ========================================================= */}
          {activeTab === 'feel' && (() => {
            const p = currentPrinciples.feel || {};
            return (
              <div className="flex flex-col gap-8 max-w-5xl">
                <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                  <h2 className="font-serif text-2xl text-white">Principle 02: FEEL (Emotional Sovereignty)</h2>
                  <p className="text-xs text-white/50">
                    Manage emotional processing statement and ambient rainy evening background image.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Text Controls */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                        <Heart size={16} />
                        <span>Principle Headlines & Copy</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Eyebrow</label>
                          <input
                            type="text"
                            value={p.eyebrow || ''}
                            onChange={(e) => handlePrincipleChange('feel', 'eyebrow', e.target.value)}
                            placeholder="MY PHILOSOPHY"
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Main Title (White)</label>
                          <input
                            type="text"
                            value={p.title || ''}
                            onChange={(e) => handlePrincipleChange('feel', 'title', e.target.value)}
                            placeholder="Feel honestly."
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Accent Title (Gold)</label>
                          <input
                            type="text"
                            value={p.subtitle || ''}
                            onChange={(e) => handlePrincipleChange('feel', 'subtitle', e.target.value)}
                            placeholder="Heal deeply."
                            className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif focus:border-[#c79c6e]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Highlight Quote (Italic)</label>
                        <input
                          type="text"
                          value={p.highlight || ''}
                          onChange={(e) => handlePrincipleChange('feel', 'highlight', e.target.value)}
                          placeholder="You can't move forward, running from what you feel."
                          className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif focus:border-[#c79c6e]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Description Paragraph</label>
                        <textarea
                          rows={4}
                          value={p.description || ''}
                          onChange={(e) => handlePrincipleChange('feel', 'description', e.target.value)}
                          placeholder="Emotions are signals, not dictators. Learn to sit with discomfort..."
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e] resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Landscape Image Card */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <ImageEditorCard
                      title="Feel Scene Landscape"
                      dimensions="1536 × 1025 px (16:9 / 3:2)"
                      orientation="Landscape (Horizontal)"
                      maxSize="Under 200 KB"
                      aspectRatio="aspect-[16/9]"
                      imageUrl={p.bgImg}
                      fallbackUrl={defaultFeelImg}
                      onUpload={() => triggerImageUpload('principles.feel.bgImg')}
                      onUrlChange={(url) => handlePrincipleChange('feel', 'bgImg', url)}
                      isUploading={isUploading}
                      tip="Man in dark room sitting by window with warm lamp on right side. Keep subject on right half."
                      overlayOpacity={currentGlobalOverlayOpacity}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =========================================================
              5. PRINCIPLE 03: DECIDE
             ========================================================= */}
          {activeTab === 'decide' && (() => {
            const p = currentPrinciples.decide || {};
            return (
              <div className="flex flex-col gap-8 max-w-5xl">
                <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                  <h2 className="font-serif text-2xl text-white">Principle 03: DECIDE (Aligned Action)</h2>
                  <p className="text-xs text-white/50">
                    Manage decisive conviction copy and illuminated pathway background image.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Text Controls */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                        <Crosshair size={16} />
                        <span>Principle Headlines & Copy</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Eyebrow</label>
                          <input
                            type="text"
                            value={p.eyebrow || ''}
                            onChange={(e) => handlePrincipleChange('decide', 'eyebrow', e.target.value)}
                            placeholder="MY PHILOSOPHY"
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Main Title (White)</label>
                          <input
                            type="text"
                            value={p.title || ''}
                            onChange={(e) => handlePrincipleChange('decide', 'title', e.target.value)}
                            placeholder="DECIDE"
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Accent Title (Gold)</label>
                          <input
                            type="text"
                            value={p.subtitle || ''}
                            onChange={(e) => handlePrincipleChange('decide', 'subtitle', e.target.value)}
                            placeholder="INTENTIONALLY."
                            className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif focus:border-[#c79c6e]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Highlight Quote (Italic)</label>
                        <input
                          type="text"
                          value={p.highlight || ''}
                          onChange={(e) => handlePrincipleChange('decide', 'highlight', e.target.value)}
                          placeholder="Clarity without decision is just expensive loop."
                          className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif focus:border-[#c79c6e]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Description Paragraph</label>
                        <textarea
                          rows={4}
                          value={p.description || ''}
                          onChange={(e) => handlePrincipleChange('decide', 'description', e.target.value)}
                          placeholder="We help you align your values, weigh what matters, and choose the path you're willing to walk."
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e] resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Closing Line (Gold Accent)</label>
                        <input
                          type="text"
                          value={p.closingLine || ''}
                          onChange={(e) => handlePrincipleChange('decide', 'closingLine', e.target.value)}
                          placeholder="....Then we help you walk it."
                          className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif focus:border-[#c79c6e]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Landscape Image Card */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <ImageEditorCard
                      title="Decide Scene Landscape"
                      dimensions="1536 × 1024 px (16:9 / 3:2)"
                      orientation="Landscape (Horizontal)"
                      maxSize="Under 200 KB"
                      aspectRatio="aspect-[16/9]"
                      imageUrl={p.bgImg}
                      fallbackUrl={defaultDecideImg}
                      onUpload={() => triggerImageUpload('principles.decide.bgImg')}
                      onUrlChange={(url) => handlePrincipleChange('decide', 'bgImg', url)}
                      isUploading={isUploading}
                      tip="Man overlooking misty mountains, cinematic golden atmospheric mood. Keep focal subject to the right."
                      overlayOpacity={currentGlobalOverlayOpacity}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =========================================================
              COACHING PROCESS SECTION
             ========================================================= */}
          {activeTab === 'coachingProcess' && (() => {
            const cp = currentCoachingProcess || {};
            const defaultSteps = [
              { num: '01', title: 'CONNECT', text: 'We start with a meaningful conversation to understand what matters to you.' },
              { num: '02', title: 'CLARIFY', text: "We dig deep to bring clarity to your thoughts, patterns, and what's keeping you stuck." },
              { num: '03', title: 'ALIGN', text: 'We align your values, goals, and actions with the life you truly want to create.' },
              { num: '04', title: 'ACT', text: "You take intentional action with confidence. I'm here to guide, challenge, and support you." },
              { num: '05', title: 'EVOLVE', text: 'We reflect, recalibrate, and keep building momentum for lasting transformation.' }
            ];
            const steps = cp.steps && cp.steps.length > 0 ? cp.steps : defaultSteps;

            return (
              <div className="flex flex-col gap-8 max-w-5xl">
                <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                  <h2 className="font-serif text-2xl text-white">The Coaching Process</h2>
                  <p className="text-xs text-white/50">
                    Manage the 5-step methodology copy and the dark lounge background visual.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Headlines & 5 Steps */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Header Details */}
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                        <Kanban size={16} />
                        <span>Process Headlines</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Eyebrow Text</label>
                        <input
                          type="text"
                          value={cp.eyebrowText || ''}
                          onChange={(e) => handleSectionChange('eyebrowText', e.target.value)}
                          placeholder="THE COACHING PROCESS"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Heading Line 1</label>
                          <input
                            type="text"
                            value={cp.headingLine1 || ''}
                            onChange={(e) => handleSectionChange('headingLine1', e.target.value)}
                            placeholder="A proven process"
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Heading Accent (Gold)</label>
                          <input
                            type="text"
                            value={cp.headingAccent || ''}
                            onChange={(e) => handleSectionChange('headingAccent', e.target.value)}
                            placeholder="built around you."
                            className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif focus:border-[#c79c6e]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Subtitle / Clear Path</label>
                        <input
                          type="text"
                          value={cp.subtitle || ''}
                          onChange={(e) => handleSectionChange('subtitle', e.target.value)}
                          placeholder="A clear path from where you are, to where you want to be."
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Bottom Note</label>
                        <input
                          type="text"
                          value={cp.subnote || ''}
                          onChange={(e) => handleSectionChange('subnote', e.target.value)}
                          placeholder="Simple. Effective."
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                        />
                      </div>
                    </div>

                    {/* 5 Process Steps */}
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                          5 Process Steps
                        </span>
                        <span className="text-[0.62rem] font-mono text-white/40">Step 01 to 05</span>
                      </div>

                      <div className="flex flex-col gap-4">
                        {steps.map((step, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-[#050505] border border-white/10 flex flex-col gap-2.5">
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 rounded bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.65rem] font-mono font-bold text-[#c79c6e]">
                                {step.num || `0${idx + 1}`}
                              </span>
                              <input
                                type="text"
                                value={step.title || ''}
                                onChange={(e) => handleCoachingProcessStepChange(idx, 'title', e.target.value)}
                                placeholder="Step Title"
                                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white font-semibold uppercase tracking-wider focus:border-[#c79c6e]"
                              />
                            </div>
                            <textarea
                              rows={2}
                              value={step.text || ''}
                              onChange={(e) => handleCoachingProcessStepChange(idx, 'text', e.target.value)}
                              placeholder="Step Description..."
                              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white/80 leading-relaxed resize-none focus:border-[#c79c6e]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Landscape Image Preview Card */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <ImageEditorCard
                      title="Coaching Process Lounge Asset"
                      dimensions="1536 × 1024 px (16:9 / 3:2)"
                      orientation="Landscape (Horizontal)"
                      maxSize="Under 200 KB"
                      aspectRatio="aspect-[16/9]"
                      imageUrl={currentCoachingProcess.bgImg}
                      fallbackUrl={defaultCoachingProcessImg}
                      onUpload={() => triggerImageUpload('bgImg')}
                      onUrlChange={(url) => handleSectionChange('bgImg', url)}
                      isUploading={isUploading}
                      tip="Warm modern luxury consultation lounge. Subject on right."
                      overlayOpacity={currentGlobalOverlayOpacity}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =========================================================
              COACHING JOURNEY SECTION
             ========================================================= */}
          {activeTab === 'coachingJourney' && (() => {
            const cj = currentCoachingJourney || {};
            const defaultNodes = [
              { num: '01', title: 'CLARIFY', text: "Root cause clarity.\nReal understanding." },
              { num: '02', title: 'CONNECT', text: "Emotional honesty.\nValues alignment." },
              { num: '03', title: 'CREATE', text: "Aligned decisions.\nIntentional life." },
              { num: '04', title: 'COMMIT', text: "Sustained action.\nLasting change." }
            ];
            const nodes = cj.steps && cj.steps.length > 0 ? cj.steps : defaultNodes;

            const defaultHowItWorks = [
              'Personalized coaching sessions tailored to you.',
              'Powerful conversations that create real shifts.',
              'Practical tools and frameworks you can use.',
              'Accountability that keeps you moving forward.'
            ];
            const howItWorks = cj.howItWorks && cj.howItWorks.length > 0 ? cj.howItWorks : defaultHowItWorks;

            return (
              <div className="flex flex-col gap-8 max-w-5xl">
                <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                  <h2 className="font-serif text-2xl text-white">The Coaching Journey</h2>
                  <p className="text-xs text-white/50">
                    Manage mountain path milestones, transformation quote, and "How It Works" bottom pillars.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Copy & Nodes */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Header Details */}
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                        <Mountains size={16} />
                        <span>Journey Headlines & Quote</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Eyebrow Text</label>
                        <input
                          type="text"
                          value={cj.eyebrowText || ''}
                          onChange={(e) => handleSectionChange('eyebrowText', e.target.value)}
                          placeholder="THE COACHING JOURNEY"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Heading Line 1</label>
                          <input
                            type="text"
                            value={cj.headingLine1 || ''}
                            onChange={(e) => handleSectionChange('headingLine1', e.target.value)}
                            placeholder="A clear process."
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Heading Accent (Gold)</label>
                          <input
                            type="text"
                            value={cj.headingAccent || ''}
                            onChange={(e) => handleSectionChange('headingAccent', e.target.value)}
                            placeholder="Real transformation."
                            className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif focus:border-[#c79c6e]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Description Paragraph</label>
                        <textarea
                          rows={2}
                          value={cj.description || ''}
                          onChange={(e) => handleSectionChange('description', e.target.value)}
                          placeholder="We don't do hacks. We follow a proven, human-first process designed to create deep, lasting change."
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e] resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Floating Quote (Line 1)</label>
                          <input
                            type="text"
                            value={cj.quoteLine1 || ''}
                            onChange={(e) => handleSectionChange('quoteLine1', e.target.value)}
                            placeholder="Transformation isn't a moment."
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#c79c6e]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Quote Accent (Line 2)</label>
                          <input
                            type="text"
                            value={cj.quoteAccent || ''}
                            onChange={(e) => handleSectionChange('quoteAccent', e.target.value)}
                            placeholder="It's a journey you walk with the right guide."
                            className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-2.5 text-xs text-[#c79c6e] italic font-serif focus:border-[#c79c6e]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4 Journey Mountain Milestones */}
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                          4 Journey Milestones
                        </span>
                        <span className="text-[0.62rem] font-mono text-white/40">Node 01 to 04</span>
                      </div>

                      <div className="flex flex-col gap-4">
                        {nodes.map((node, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-[#050505] border border-white/10 flex flex-col gap-2.5">
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 rounded bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.65rem] font-mono font-bold text-[#c79c6e]">
                                {node.num || `0${idx + 1}`}
                              </span>
                              <input
                                type="text"
                                value={node.title || ''}
                                onChange={(e) => handleCoachingJourneyStepChange(idx, 'title', e.target.value)}
                                placeholder="Milestone Title"
                                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white font-semibold uppercase tracking-wider focus:border-[#c79c6e]"
                              />
                            </div>
                            <textarea
                              rows={2}
                              value={node.text || ''}
                              onChange={(e) => handleCoachingJourneyStepChange(idx, 'text', e.target.value)}
                              placeholder="Milestone Description..."
                              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white/80 leading-relaxed resize-none focus:border-[#c79c6e]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* How It Works - 4 Key Pillars */}
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                          "How It Works" 4 Key Pillars
                        </span>
                        <span className="text-[0.62rem] font-mono text-white/40">Bottom Strip</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {howItWorks.map((item, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <label className="text-[0.65rem] uppercase tracking-wider text-white/50">Pillar 0{idx + 1}</label>
                            <input
                              type="text"
                              value={item || ''}
                              onChange={(e) => handleHowItWorksChange(idx, e.target.value)}
                              className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#c79c6e]"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[0.65rem] uppercase tracking-wider text-[#c79c6e]">Transition Line (Accent)</label>
                          <input
                            type="text"
                            value={cj.transitionAccent || ''}
                            onChange={(e) => handleSectionChange('transitionAccent', e.target.value)}
                            placeholder="Guided. Structured. Flexible."
                            className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-3 py-2 text-xs text-[#c79c6e] italic focus:border-[#c79c6e]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[0.65rem] uppercase tracking-wider text-white/50">Transition Subtext</label>
                          <input
                            type="text"
                            value={cj.transitionSubtext || ''}
                            onChange={(e) => handleSectionChange('transitionSubtext', e.target.value)}
                            placeholder="A process that adapts to you..."
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#c79c6e]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Landscape Image Preview Card */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <ImageEditorCard
                      title="Mountain Journey Scene"
                      dimensions="1536 × 1024 px (16:9 / 3:2)"
                      orientation="Landscape (Horizontal)"
                      maxSize="Under 200 KB"
                      aspectRatio="aspect-[16/9]"
                      imageUrl={currentCoachingJourney.bgImg}
                      fallbackUrl={defaultCoachingJourneyImg}
                      onUpload={() => triggerImageUpload('bgImg')}
                      onUrlChange={(url) => handleSectionChange('bgImg', url)}
                      isUploading={isUploading}
                      tip="Majestic mountain summit with dramatic clouds and golden sunset rim light."
                      overlayOpacity={currentGlobalOverlayOpacity}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =========================================================
              4. MEET AARKESH
             ========================================================= */}
          {activeTab === 'about' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <h2 className="font-serif text-2xl text-white">Meet Aarkesh: Three Roles</h2>
                <p className="text-xs text-white/50">
                  Manage coach bio, 3 role cards (Pilot, Coach, Human) with dimensions <strong className="text-[#c79c6e]">800 × 1200 px (under 200 KB)</strong>, and bottom story bar.
                </p>
              </div>

              {/* Header Box */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Section Header</span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Eyebrow Text</label>
                  <input
                    type="text"
                    value={currentAbout.eyebrowText || ''}
                    onChange={(e) => handleSectionChange('eyebrowText', e.target.value)}
                    placeholder="MEET AARKESH"
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Heading Title</label>
                    <input
                      type="text"
                      value={currentAbout.headingLine || ''}
                      onChange={(e) => handleSectionChange('headingLine', e.target.value)}
                      placeholder="Three roles. One purpose."
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Subheading</label>
                    <input
                      type="text"
                      value={currentAbout.subheading || ''}
                      onChange={(e) => handleSectionChange('subheading', e.target.value)}
                      placeholder="Different lenses. Same mission—your growth."
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Roles Grid with Individual Image Editors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: 'rolePilot', name: 'PILOT', icon: AirplaneTilt, tip: 'High-stakes cockpit / sky portrait.' },
                  { key: 'roleCoach', name: 'COACH', icon: Crosshair, tip: 'Warm focused coaching portrait.' },
                  { key: 'roleHuman', name: 'HUMAN', icon: Heart, tip: 'Authentic candid lifestyle portrait.' },
                ].map(({ key, name, icon: Icon, tip }) => {
                  const roleData = currentAbout[key] || {};
                  return (
                    <div key={key} className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                          <Icon size={16} />
                          <span>{name} Role</span>
                        </div>
                        <span className="text-[0.6rem] font-mono text-[#c79c6e] font-semibold">800×1200</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[0.65rem] text-white/60 uppercase">Line 1</label>
                        <input
                          type="text"
                          value={roleData.sub1 || ''}
                          onChange={(e) => handleNestedChange(key, 'sub1', e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded px-3 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[0.65rem] text-white/60 uppercase">Line 2</label>
                        <input
                          type="text"
                          value={roleData.sub2 || ''}
                          onChange={(e) => handleNestedChange(key, 'sub2', e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded px-3 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[0.65rem] text-[#c79c6e] uppercase">Highlight</label>
                        <input
                          type="text"
                          value={roleData.highlight || ''}
                          onChange={(e) => handleNestedChange(key, 'highlight', e.target.value)}
                          className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded px-3 py-1.5 text-xs text-[#c79c6e] italic"
                        />
                      </div>

                      <div className="pt-2 border-t border-white/5">
                        <ImageEditorCard
                          title={`${name} Card Portrait`}
                          dimensions="800 × 1200 px (2:3)"
                          maxSize="Under 200 KB"
                          aspectRatio="aspect-[2/3]"
                          imageUrl={roleData.bgImg}
                          fallbackUrl={key === 'rolePilot' ? defaultPilotImg : key === 'roleCoach' ? defaultCoachImg : defaultHumanImg}
                          onUpload={() => triggerImageUpload(`${key}.bgImg`)}
                          onUrlChange={(url) => handleNestedChange(key, 'bgImg', url)}
                          isUploading={isUploading}
                          tip={tip}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Story Bar */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Bottom Story & Mission Bar</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.68rem] text-white/60 uppercase">Mission Title</label>
                    <input
                      type="text"
                      value={currentAbout.missionHeading || ''}
                      onChange={(e) => handleSectionChange('missionHeading', e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.68rem] text-white/60 uppercase">Button Text</label>
                    <input
                      type="text"
                      value={currentAbout.storyBtnText || ''}
                      onChange={(e) => handleSectionChange('storyBtnText', e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              5. TESTIMONIALS
             ========================================================= */}
          {activeTab === 'testimonials' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <h2 className="font-serif text-2xl text-white">Testimonials Section</h2>
                <p className="text-xs text-white/50">
                  Manage the client reviews list, headline copy, and glowing background image (<strong className="text-[#c79c6e]">1920 × 1080 px, under 200 KB</strong>).
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Section Header</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Heading Line 1</label>
                        <input
                          type="text"
                          value={currentTestimonials.headingLine1 || ''}
                          onChange={(e) => handleSectionChange('headingLine1', e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Heading Accent (Gold)</label>
                        <input
                          type="text"
                          value={currentTestimonials.headingAccent || ''}
                          onChange={(e) => handleSectionChange('headingAccent', e.target.value)}
                          className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Testimonials List */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Client Reviews ({(currentTestimonials.items || []).length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(currentTestimonials.items || []), { quote: 'New inspiring testimonial quote...', name: 'Client Name, 30', role: 'Profession' }];
                          handleSectionChange('items', updated);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#c79c6e]/10 hover:bg-[#c79c6e]/20 text-[#c79c6e] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Review</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {(currentTestimonials.items || []).map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#050505] border border-white/10 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-4">
                            <textarea
                              rows={2}
                              value={item.quote}
                              onChange={(e) => {
                                const copy = [...currentTestimonials.items];
                                copy[idx].quote = e.target.value;
                                handleSectionChange('items', copy);
                              }}
                              placeholder="Quote content..."
                              className="flex-1 bg-transparent border-0 text-sm text-white/90 focus:outline-none resize-none font-serif italic"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = currentTestimonials.items.filter((_, i) => i !== idx);
                                handleSectionChange('items', copy);
                              }}
                              className="text-red-400/60 hover:text-red-400 p-1 cursor-pointer"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const copy = [...currentTestimonials.items];
                                copy[idx].name = e.target.value;
                                handleSectionChange('items', copy);
                              }}
                              placeholder="Name, Age"
                              className="bg-white/5 rounded px-3 py-1.5 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={item.role}
                              onChange={(e) => {
                                const copy = [...currentTestimonials.items];
                                copy[idx].role = e.target.value;
                                handleSectionChange('items', copy);
                              }}
                              placeholder="Profession"
                              className="bg-white/5 rounded px-3 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <ImageEditorCard
                    title="Testimonials Gateway Background"
                    dimensions="1536 × 1024 px (16:9 / 3:2)"
                    orientation="Landscape (Horizontal)"
                    maxSize="Under 200 KB"
                    aspectRatio="aspect-[16/9]"
                    imageUrl={currentTestimonials.bgImg}
                    fallbackUrl={defaultTestimonialsImg}
                    onUpload={() => triggerImageUpload('bgImg')}
                    onUrlChange={(url) => handleSectionChange('bgImg', url)}
                    isUploading={isUploading}
                    tip="Cinematic glowing doorway / arch with bright beam of light on right."
                    overlayOpacity={currentGlobalOverlayOpacity}
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              6. FAQ SECTION
             ========================================================= */}
          {activeTab === 'faq' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <h2 className="font-serif text-2xl text-white">Frequently Asked Questions</h2>
                <p className="text-xs text-white/50">
                  Manage FAQ items, answers, category headlines, and optional ambient visual (<strong className="text-[#c79c6e]">1200 × 800 px, under 200 KB</strong>).
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Header Box */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Header Details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Heading Line</label>
                        <input
                          type="text"
                          value={currentFaq.headingLine1 || ''}
                          onChange={(e) => handleSectionChange('headingLine1', e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Heading Accent (Gold)</label>
                        <input
                          type="text"
                          value={currentFaq.headingAccent || ''}
                          onChange={(e) => handleSectionChange('headingAccent', e.target.value)}
                          className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FAQ Questions List */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Questions & Answers ({(currentFaq.items || []).length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(currentFaq.items || []), { question: 'New Question?', answer: 'Detailed helpful answer...' }];
                          handleSectionChange('items', updated);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#c79c6e]/10 hover:bg-[#c79c6e]/20 text-[#c79c6e] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Question</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {(currentFaq.items || []).map((faq, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#050505] border border-white/10 flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-3">
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => {
                                const copy = [...currentFaq.items];
                                copy[idx].question = e.target.value;
                                handleSectionChange('items', copy);
                              }}
                              placeholder="Question..."
                              className="flex-1 bg-white/5 rounded px-3 py-2 text-xs text-white font-semibold"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = currentFaq.items.filter((_, i) => i !== idx);
                                handleSectionChange('items', copy);
                              }}
                              className="text-red-400/60 hover:text-red-400 p-1 cursor-pointer"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={faq.answer}
                            onChange={(e) => {
                              const copy = [...currentFaq.items];
                              copy[idx].answer = e.target.value;
                              handleSectionChange('items', copy);
                            }}
                            placeholder="Answer..."
                            className="w-full bg-white/5 rounded px-3 py-2 text-xs text-white/80 leading-relaxed resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FAQ Section Image Editor */}
                <div className="lg:col-span-5">
                  <ImageEditorCard
                    title="FAQ Ambient / Visual Image"
                    dimensions="1200 × 800 px (3:2)"
                    maxSize="Under 200 KB"
                    aspectRatio="aspect-[3/2]"
                    imageUrl={currentFaq.bgImg}
                    fallbackUrl={defaultTestimonialsImg}
                    onUpload={() => triggerImageUpload('bgImg')}
                    onUrlChange={(url) => handleSectionChange('bgImg', url)}
                    isUploading={isUploading}
                    tip="Soft ambient reflection or study background behind FAQ section."
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              7. FINAL CALL TO ACTION
             ========================================================= */}
          {activeTab === 'cta' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <h2 className="font-serif text-2xl text-white">Final Call to Action Banner</h2>
                <p className="text-xs text-white/50">
                  Manage the bottom booking card, inspiring closing quotes, and background coffee/study visual (<strong className="text-[#c79c6e]">1920 × 1080 px, under 200 KB</strong>).
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Headlines & Button</span>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Eyebrow</label>
                      <input
                        type="text"
                        value={currentCta.eyebrowText || ''}
                        onChange={(e) => handleSectionChange('eyebrowText', e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Heading Line 1</label>
                        <input
                          type="text"
                          value={currentCta.headingLine1 || ''}
                          onChange={(e) => handleSectionChange('headingLine1', e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Heading Accent</label>
                        <input
                          type="text"
                          value={currentCta.headingAccent || ''}
                          onChange={(e) => handleSectionChange('headingAccent', e.target.value)}
                          className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Description</label>
                      <textarea
                        rows={3}
                        value={currentCta.description || ''}
                        onChange={(e) => handleSectionChange('description', e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Button Text</label>
                        <input
                          type="text"
                          value={currentCta.ctaText || ''}
                          onChange={(e) => handleSectionChange('ctaText', e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Button Link</label>
                        <input
                          type="text"
                          value={currentCta.ctaLink || ''}
                          onChange={(e) => handleSectionChange('ctaLink', e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Closing Quote */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Closing Footer Quote</span>
                    <input
                      type="text"
                      value={currentCta.quoteLine1 || ''}
                      onChange={(e) => handleSectionChange('quoteLine1', e.target.value)}
                      placeholder="You don't have to have it all figured out."
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={currentCta.quoteLine2 || ''}
                      onChange={(e) => handleSectionChange('quoteLine2', e.target.value)}
                      placeholder="You just have to be willing to begin."
                      className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-2.5 text-xs text-[#c79c6e] italic"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <ImageEditorCard
                    title="CTA Coffee Cup Background"
                    dimensions="1536 × 1024 px (16:9 / 3:2)"
                    orientation="Landscape (Horizontal)"
                    maxSize="Under 200 KB"
                    aspectRatio="aspect-[16/9]"
                    imageUrl={currentCta.bgImg}
                    fallbackUrl={defaultCtaImg}
                    onUpload={() => triggerImageUpload('bgImg')}
                    onUrlChange={(url) => handleSectionChange('bgImg', url)}
                    isUploading={isUploading}
                    tip="Cinematic coffee cup on wooden table with warm cafe lighting."
                    overlayOpacity={currentGlobalOverlayOpacity}
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
