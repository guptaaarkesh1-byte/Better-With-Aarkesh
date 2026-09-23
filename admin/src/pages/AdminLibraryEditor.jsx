import React, { useState, useEffect, useRef } from 'react';
import { 
  Desktop,
  Image as ImageIcon,
  UploadSimple,
  FloppyDisk,
  ArrowClockwise,
  CheckCircle,
  WarningCircle,
  Eye,
  ArrowSquareOut,
  SlidersHorizontal,
  FolderOpen
} from '@phosphor-icons/react';

// Default library hero background asset
import defaultHeroBg from '../../../client/src/assets/PerspectivePage/Page1.webp';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SIDEBAR_TABS = [
  { 
    id: 'hero', 
    label: 'Hero Section', 
    icon: <Desktop size={18} />, 
    description: 'Main title, description, search bar & atmospheric visual' 
  }
];

const DEFAULT_HERO = {
  eyebrowText: 'THE LIBRARY',
  headingLine1: 'What are you trying',
  headingLine2: 'to understand?',
  description: 'Articles, videos and reflective tools for the parts of life that are difficult to see clearly while you are living through them.',
  searchPlaceholder: "Describe what you're facing...",
  bottomPromptText: 'OR EXPLORE WHAT OTHERS OFTEN CARRY',
  bgImageUrl: '',
  overlayOpacity: 40,
};

// Reusable Image Editor Component with Under 200 KB enforcement
function ImageEditorCard({
  title = 'Hero Background Image',
  dimensions = '1920 × 1080 px (16:9)',
  orientation = 'Landscape (Horizontal)',
  maxSize = 'Under 200 KB',
  imageUrl = '',
  fallbackUrl = '',
  aspectRatio = 'aspect-[16/9]',
  onUpload,
  onUrlChange,
  isUploading = false,
  tip = 'Atmospheric dark library room with warm window glow. Keep text legible on the left.',
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

      {/* External URL Input with Reset Button */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-[0.68rem] font-semibold uppercase tracking-wider text-white/40">
            Or Direct Image URL
          </label>
          {imageUrl && (
            <button
              type="button"
              onClick={() => onUrlChange('')}
              className="text-[0.65rem] text-[#c79c6e] hover:underline cursor-pointer"
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

      {/* Extra Controls */}
      {extraControls}
    </div>
  );
}

export default function AdminLibraryEditor() {
  const [activeTab, setActiveTab] = useState('hero');
  const [allSections, setAllSections] = useState({ hero: { ...DEFAULT_HERO } });
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

  // Fetch Library Settings on Mount
  useEffect(() => {
    fetchLibrarySettings();
  }, []);

  const fetchLibrarySettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/library-settings`);
      if (res.ok) {
        const data = await res.json();
        setAllSections(data);
      }
    } catch (err) {
      console.error('Failed to fetch library settings:', err);
      showToast('Could not load current settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Generic Field Updater for Current Section
  const handleSectionChange = (field, value) => {
    setAllSections(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev?.[activeTab] || {}),
        [field]: value
      }
    }));
  };

  // Trigger Image File Picker
  const triggerImageUpload = (fieldName) => {
    setUploadTargetField(fieldName);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle File Upload with < 200 KB Validation
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict 200 KB check
    const MAX_SIZE_BYTES = 200 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      showToast(
        `File is ${(file.size / 1024).toFixed(1)} KB. Maximum allowed size is 200 KB. Please compress your image first.`,
        'error'
      );
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      if (data.imageUrl && uploadTargetField) {
        handleSectionChange(uploadTargetField, data.imageUrl);
        showToast('Image uploaded successfully (< 200 KB)!', 'success');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      showToast('Image upload failed. Check connection or try another image.', 'error');
    } finally {
      setIsUploading(false);
      setUploadTargetField(null);
    }
  };

  // Save Section Settings to Backend
  const handleSaveSection = async () => {
    try {
      setIsSaving(true);
      const sectionData = allSections[activeTab] || {};

      const res = await fetch(`${API_URL}/api/library-settings/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData),
      });

      if (res.ok) {
        showToast(`${SIDEBAR_TABS.find(t => t.id === activeTab)?.label || 'Section'} saved successfully!`, 'success');
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-3 text-white">
        <span className="w-8 h-8 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest text-white/50">Loading Library Settings...</span>
      </div>
    );
  }

  const currentHero = allSections.hero || DEFAULT_HERO;

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
            <h1 className="font-serif text-2xl text-white">Library Page Editor</h1>
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
            href="http://localhost:5173/library"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium transition-all"
          >
            <Eye size={15} />
            <span>View Live Site</span>
            <ArrowSquareOut size={13} className="opacity-60" />
          </a>

          <button
            onClick={fetchLibrarySettings}
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

          <nav className="flex flex-col gap-1">
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

        {/* ─── RIGHT SECTION EDITOR ─── */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {activeTab === 'hero' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              
              {/* Section Header */}
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <h2 className="font-serif text-2xl text-white">Hero Section Editor</h2>
                <p className="text-xs text-white/50">
                  Control the main headline question, reflective introduction text, search bar prompt, and the atmospheric background room image.
                </p>
              </div>

              {/* Grid: Form on Left, Image Card on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Text & Content Inputs */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  
                  {/* Eyebrow & Headline Card */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                      Headlines & Labels
                    </span>

                    {/* Eyebrow Text */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                        Eyebrow / Small Category Tag
                      </label>
                      <input
                        type="text"
                        value={currentHero.eyebrowText || ''}
                        onChange={(e) => handleSectionChange('eyebrowText', e.target.value)}
                        placeholder="THE LIBRARY"
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                      />
                    </div>

                    {/* Headline Line 1 & Line 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                          Heading Line 1
                        </label>
                        <input
                          type="text"
                          value={currentHero.headingLine1 || ''}
                          onChange={(e) => handleSectionChange('headingLine1', e.target.value)}
                          placeholder="What are you trying"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                          Heading Line 2
                        </label>
                        <input
                          type="text"
                          value={currentHero.headingLine2 || ''}
                          onChange={(e) => handleSectionChange('headingLine2', e.target.value)}
                          placeholder="to understand?"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                        Reflective Description / Subtitle
                      </label>
                      <textarea
                        rows={3}
                        value={currentHero.description || ''}
                        onChange={(e) => handleSectionChange('description', e.target.value)}
                        placeholder="Articles, videos and reflective tools for the parts of life that are difficult to see clearly while you are living through them."
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Search Bar & Bottom Prompts Card */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                      Search Input & Prompts
                    </span>

                    {/* Search Placeholder */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                        Search Bar Placeholder Text
                      </label>
                      <input
                        type="text"
                        value={currentHero.searchPlaceholder || ''}
                        onChange={(e) => handleSectionChange('searchPlaceholder', e.target.value)}
                        placeholder="Describe what you're facing..."
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                      />
                    </div>

                    {/* Bottom Prompt Text */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                        Bottom Scroll Prompt
                      </label>
                      <input
                        type="text"
                        value={currentHero.bottomPromptText || ''}
                        onChange={(e) => handleSectionChange('bottomPromptText', e.target.value)}
                        placeholder="OR EXPLORE WHAT OTHERS OFTEN CARRY"
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                      />
                    </div>
                  </div>

                </div>

                {/* Right Column: Hero Visual Image Editor */}
                <div className="lg:col-span-5">
                  <ImageEditorCard
                    title="Hero Room Background"
                    dimensions="1920 × 1080 px (16:9)"
                    orientation="Landscape (Horizontal)"
                    maxSize="Under 200 KB"
                    aspectRatio="aspect-[16/9]"
                    imageUrl={currentHero.bgImageUrl}
                    fallbackUrl={defaultHeroBg}
                    onUpload={() => triggerImageUpload('bgImageUrl')}
                    onUrlChange={(url) => handleSectionChange('bgImageUrl', url)}
                    isUploading={isUploading}
                    tip="Atmospheric dark library room with warm window glow. Keep text legible on the left."
                    overlayOpacity={currentHero.overlayOpacity ?? 40}
                    extraControls={
                      <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                            <SlidersHorizontal size={14} />
                            Overlay Darkness
                          </span>
                          <span className="text-xs font-mono text-[#c79c6e]">
                            {currentHero.overlayOpacity ?? 40}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={currentHero.overlayOpacity ?? 40}
                          onChange={(e) => handleSectionChange('overlayOpacity', Number(e.target.value))}
                          className="w-full accent-[#c79c6e] cursor-pointer"
                        />
                      </div>
                    }
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
