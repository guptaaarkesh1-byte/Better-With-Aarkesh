import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
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
  CaretUp, 
  CaretDown, 
  LockKey, 
  Mountains, 
  Path, 
  Kanban, 
  Sun,
  FolderOpen,
  EnvelopeSimple,
  ShareNetwork,
  ArrowRight,
  InstagramLogo,
  YoutubeLogo,
  XLogo,
  LinkedinLogo,
  FacebookLogo,
  SpotifyLogo,
  DiscordLogo,
  TiktokLogo,
  Globe,
  Pen,
  Minus,
  TextT,
  ArrowCounterClockwise,
  Lightning,
  CheckSquare,
  Square,
  ArrowDown,
  Faders
} from '@phosphor-icons/react';

// Exact Default Assets from Frontend Website
import defaultHeroImg from '../../../client/src/assets/hero.webp';
import defaultTransImg from '../../../client/src/assets/Page2/bottom.webp';
import defaultThinkImg from '../../../client/src/assets/Page3/think-clearly.png';
import defaultFeelImg from '../../../client/src/assets/Page4/feel-honestly.webp';
import defaultDecideImg from '../../../client/src/assets/Page5/decide-intentionally.jpg';
import defaultCoachingProcessImg from '../../../client/src/assets/Page6/coaching-process.webp';
import defaultCoachingJourneyImg from '../../../client/src/assets/Page7/coaching-journey.webp';
import defaultPilotImg from '../../../client/src/assets/Page8/pilot.webp';
import defaultCoachImg from '../../../client/src/assets/Page8/Coach.webp';
import defaultHumanImg from '../../../client/src/assets/Page8/human.webp';
import defaultTestimonialsImg from '../../../client/src/assets/Page9/testimonials-doorway.webp';
import defaultCtaImg from '../../../client/src/assets/Page10/next-chapter-cozy.webp';
import { API_URL } from '../utils/apiUrl';

const SIDEBAR_TABS = [
  { id: 'masterTypography', label: 'Master Font Studio', icon: <Faders size={18} weight="bold" />, description: 'Universal font size control for all home sections', badge: 'MASTER' },
  { id: 'hero', label: 'Hero Section', icon: <Desktop size={18} />, description: 'Main banner, title & background' },
  { id: 'problem', label: 'Problem Statement', icon: <Compass size={18} />, description: 'Core struggle & transition' },
  { id: 'think', label: 'Principle 01: Think', icon: <Brain size={18} />, description: 'Cognitive clarity & noise reduction' },
  { id: 'feel', label: 'Principle 02: Feel', icon: <Heart size={18} />, description: 'Emotional sovereignty & depth' },
  { id: 'decide', label: 'Principle 03: Decide', icon: <Crosshair size={18} />, description: 'Aligned action & conviction' },
  { id: 'coachingProcess', label: 'Coaching Process', icon: <Kanban size={18} />, description: '5-step proven methodology & lounge visual' },
  { id: 'coachingJourney', label: 'Coaching Journey', icon: <Mountains size={18} />, description: 'Mountain path, 4 journey nodes & pillars' },
  { id: 'about', label: 'Meet Aarkesh', icon: <ChatCircleText size={18} />, description: 'Coach 3 roles & story' },
  { id: 'testimonials', label: 'Testimonials', icon: <Quotes size={18} />, description: 'Client reviews & words' },
  { id: 'cta', label: 'Final Call to Action', icon: <MegaphoneSimple size={18} />, description: 'Bottom booking banner' },
  { id: 'faq', label: 'FAQ Section', icon: <Question size={18} />, description: 'Frequently asked questions' },
  { id: 'footer', label: 'Footer Section', icon: <FolderOpen size={18} />, description: 'Brand bio, contact email, copyright text & footer links' },
];

// Reusable Image Editor Component with Prominent Dimensions & < 2 MB Enforcement
function ImageEditorCard({
  title = 'Background Image',
  dimensions = '1536 × 1024 px (16:9 / 3:2)',
  orientation = 'Landscape (Horizontal)',
  maxSize = 'Under 2 MB',
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
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageUrl, fallbackUrl]);

  const getFullSrc = (src) => {
    if (!src) return '';
    if (typeof src !== 'string') return src;
    if (
      src.startsWith('data:') || 
      src.startsWith('blob:') || 
      src.startsWith('http://') || 
      src.startsWith('https://') ||
      src.startsWith('/@fs') ||
      src.startsWith('/@id') ||
      src.startsWith('/src') ||
      src.startsWith('/node_modules') ||
      src.startsWith('/@vite')
    ) {
      return src;
    }
    if (src.startsWith('/uploads/') || src.startsWith('/images/')) {
      return `${API_URL}${src}`;
    }
    if (src.startsWith('/')) {
      return `${API_URL}${src}`;
    }
    return src;
  };

  const primarySrc = getFullSrc(imageUrl);
  const secondarySrc = getFullSrc(fallbackUrl);
  const displayImage = imgError ? secondarySrc : (primarySrc || secondarySrc);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c9542f]">
          <ImageIcon size={16} />
          <span>{title}</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#c9542f]/10 border border-[#c9542f]/30 text-[0.62rem] font-mono font-bold text-[#c9542f]">
          {dimensions}
        </span>
      </div>

      {/* Specifications Box */}
      <div className="bg-[#faf7f0] border border-[#c9542f]/30 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-xs">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-stone-500 text-[0.6rem] uppercase font-bold tracking-wider">Dimensions</span>
            <span className="text-stone-900 font-mono font-bold text-xs truncate">
              {dimensions.includes('(') ? dimensions.split('(')[0].trim() : dimensions}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-stone-500 text-[0.6rem] uppercase font-bold tracking-wider">Orientation</span>
            <span className="text-stone-900 font-semibold text-xs truncate">{orientation}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-stone-500 text-[0.6rem] uppercase font-bold tracking-wider">File Size</span>
            <span className="text-[#c9542f] font-mono font-bold text-xs">{maxSize}</span>
          </div>
        </div>
        <p className="text-[0.68rem] text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200 leading-relaxed font-medium">
          💡 <strong className="text-stone-900">Tip:</strong> {tip}
        </p>
      </div>

      {/* Image Preview Box */}
      <div className={`w-full ${aspectRatio} rounded-xl overflow-hidden relative border border-stone-200 bg-stone-100 group flex items-center justify-center shadow-inner`}>
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt={title}
              onError={() => {
                if (!imgError && secondarySrc && displayImage !== secondarySrc) {
                  setImgError(true);
                }
              }}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {/* Live Contrast Overlay Darkness */}
            <div 
              className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
              style={{ opacity: (overlayOpacity || 40) / 100 }}
            />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
              <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[0.6rem] font-mono text-white border border-white/20 font-semibold">
                {imageUrl ? 'Custom Upload / URL' : 'Default Asset'}
              </span>
              <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[0.6rem] font-mono text-white border border-white/20 font-semibold">
                {dimensions.includes('(') ? dimensions.split('(')[0].trim() : dimensions}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2 p-6">
            <ImageIcon size={28} />
            <span className="text-xs font-medium">No image uploaded</span>
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
            <span>Uploading (&lt; 2 MB)...</span>
          </>
        ) : (
          <>
            <UploadSimple size={16} weight="bold" />
            <span>Upload Image (Under 2 MB)</span>
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

// Reusable Live Typography Controller Card (Exclusive for Home Page Sections)
function TypographyControllerCard({
  title = 'Section Typography & Font Sizes (Home Exclusive)',
  eyebrowFontSize = 14,
  headingFontSize = 64,
  descriptionFontSize = 20,
  wordFontSize = 18,
  buttonFontSize = 14,
  defaultEyebrowSize = 14,
  defaultHeadingSize = 64,
  defaultDescriptionSize = 20,
  defaultWordSize = 18,
  defaultButtonSize = 14,
  onEyebrowSizeChange,
  onHeadingSizeChange,
  onDescriptionSizeChange,
  onWordSizeChange,
  onButtonSizeChange,
  showWordSizeControl = false,
  showButtonSizeControl = false,
  buttonPreviewText = 'SCROLL FOR NEXT PRINCIPLE',
  previewEyebrow = 'CLARITY. HONESTY. INTENTION.',
  previewHeading = 'Clarity changes',
  previewAccent = 'everything.',
  previewDescription = 'A space to think clearly, feel honestly and decide intentionally.'
}) {
  const currentEyebrow = Number(eyebrowFontSize) || defaultEyebrowSize;
  const currentHeading = Number(headingFontSize) || defaultHeadingSize;
  const currentDescription = Number(descriptionFontSize) || defaultDescriptionSize;
  const currentWord = Number(wordFontSize) || defaultWordSize;
  const currentButton = Number(buttonFontSize) || defaultButtonSize;

  const handleReset = () => {
    if (onEyebrowSizeChange) onEyebrowSizeChange(defaultEyebrowSize);
    if (onHeadingSizeChange) onHeadingSizeChange(defaultHeadingSize);
    if (onDescriptionSizeChange) onDescriptionSizeChange(defaultDescriptionSize);
    if (showWordSizeControl && onWordSizeChange) onWordSizeChange(defaultWordSize);
    if (showButtonSizeControl && onButtonSizeChange) onButtonSizeChange(defaultButtonSize);
  };

  const isCustomized = (
    currentEyebrow !== defaultEyebrowSize ||
    currentHeading !== defaultHeadingSize ||
    currentDescription !== defaultDescriptionSize ||
    (showWordSizeControl && currentWord !== defaultWordSize) ||
    (showButtonSizeControl && currentButton !== defaultButtonSize)
  );

  return (
    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
          <TextT size={18} weight="bold" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isCustomized && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[0.65rem] text-[#c79c6e] font-semibold transition-all cursor-pointer"
              title="Reset all font sizes to default"
            >
              <ArrowCounterClockwise size={12} />
              <span>Reset Sizes</span>
            </button>
          )}
          <span className="px-2 py-0.5 rounded bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.62rem] font-mono font-bold text-[#c79c6e]">
            Live Sizing Control
          </span>
        </div>
      </div>

      {/* Font Size Sliders & Steppers Grid */}
      <div className={`grid grid-cols-1 ${(showWordSizeControl || showButtonSizeControl) ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3'} gap-5`}>
        
        {/* 1. Tagline / Eyebrow Text Size */}
        <div className="bg-[#050505] border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-white/70">
              1. Tagline / Eyebrow
            </span>
            <span className="text-xs font-mono font-bold text-[#c79c6e]">
              {currentEyebrow}px
            </span>
          </div>

          <p className="text-[0.68rem] text-white/40 leading-snug">
            Controls top uppercase tracking tagline across all sections.
          </p>

          {/* Stepper & Slider */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onEyebrowSizeChange && onEyebrowSizeChange(Math.max(10, currentEyebrow - 1))}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Decrease 1px"
            >
              <Minus size={14} weight="bold" />
            </button>

            <input
              type="range"
              min={10}
              max={28}
              step={1}
              value={currentEyebrow}
              onChange={(e) => onEyebrowSizeChange && onEyebrowSizeChange(Number(e.target.value))}
              className="flex-1 accent-[#c79c6e] cursor-pointer"
            />

            <button
              type="button"
              onClick={() => onEyebrowSizeChange && onEyebrowSizeChange(Math.min(28, currentEyebrow + 1))}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Increase 1px"
            >
              <Plus size={14} weight="bold" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
            {[11, 12, 13, 14, 16, 18].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onEyebrowSizeChange && onEyebrowSizeChange(size)}
                className={`text-[0.62rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                  currentEyebrow === size
                    ? 'bg-[#c79c6e] text-black font-bold'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        {/* 2. Main Heading Text Size */}
        <div className="bg-[#050505] border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-white/70">
              2. Main Heading
            </span>
            <span className="text-xs font-mono font-bold text-[#c79c6e]">
              {currentHeading}px
            </span>
          </div>

          <p className="text-[0.68rem] text-white/40 leading-snug">
            Controls main bold Fraunces serif headline + accent text.
          </p>

          {/* Stepper & Slider */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onHeadingSizeChange && onHeadingSizeChange(Math.max(24, currentHeading - 2))}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Decrease 2px"
            >
              <Minus size={14} weight="bold" />
            </button>

            <input
              type="range"
              min={24}
              max={96}
              step={1}
              value={currentHeading}
              onChange={(e) => onHeadingSizeChange && onHeadingSizeChange(Number(e.target.value))}
              className="flex-1 accent-[#c79c6e] cursor-pointer"
            />

            <button
              type="button"
              onClick={() => onHeadingSizeChange && onHeadingSizeChange(Math.min(96, currentHeading + 2))}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Increase 2px"
            >
              <Plus size={14} weight="bold" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
            {[36, 44, 52, 60, 64, 72].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onHeadingSizeChange && onHeadingSizeChange(size)}
                className={`text-[0.62rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                  currentHeading === size
                    ? 'bg-[#c79c6e] text-black font-bold'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        {/* 3. Short Paragraph / Description Text Size */}
        <div className="bg-[#050505] border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-white/70">
              3. Description / Para
            </span>
            <span className="text-xs font-mono font-bold text-[#c79c6e]">
              {currentDescription}px
            </span>
          </div>

          <p className="text-[0.68rem] text-white/40 leading-snug">
            Controls subtext, quote paragraphs, and descriptive copy.
          </p>

          {/* Stepper & Slider */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onDescriptionSizeChange && onDescriptionSizeChange(Math.max(12, currentDescription - 1))}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Decrease 1px"
            >
              <Minus size={14} weight="bold" />
            </button>

            <input
              type="range"
              min={12}
              max={36}
              step={1}
              value={currentDescription}
              onChange={(e) => onDescriptionSizeChange && onDescriptionSizeChange(Number(e.target.value))}
              className="flex-1 accent-[#c79c6e] cursor-pointer"
            />

            <button
              type="button"
              onClick={() => onDescriptionSizeChange && onDescriptionSizeChange(Math.min(36, currentDescription + 1))}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Increase 1px"
            >
              <Plus size={14} weight="bold" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
            {[14, 16, 18, 20, 22, 24].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onDescriptionSizeChange && onDescriptionSizeChange(size)}
                className={`text-[0.62rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                  currentDescription === size
                    ? 'bg-[#c79c6e] text-black font-bold'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        {/* 4. Floating Words Text Size (Optional - Problem Statement exclusive) */}
        {showWordSizeControl && (
          <div className="bg-[#050505] border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-white/70">
                4. Floating Words
              </span>
              <span className="text-xs font-mono font-bold text-[#c79c6e]">
                {currentWord}px
              </span>
            </div>

            <p className="text-[0.68rem] text-white/40 leading-snug">
              Controls uniform font size of all floating thought words.
            </p>

            {/* Stepper & Slider */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onWordSizeChange && onWordSizeChange(Math.max(10, currentWord - 1))}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Decrease 1px"
              >
                <Minus size={14} weight="bold" />
              </button>

              <input
                type="range"
                min={10}
                max={36}
                step={1}
                value={currentWord}
                onChange={(e) => onWordSizeChange && onWordSizeChange(Number(e.target.value))}
                className="flex-1 accent-[#c79c6e] cursor-pointer"
              />

              <button
                type="button"
                onClick={() => onWordSizeChange && onWordSizeChange(Math.min(36, currentWord + 1))}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Increase 1px"
              >
                <Plus size={14} weight="bold" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
              {[12, 14, 16, 18, 20, 24].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onWordSizeChange && onWordSizeChange(size)}
                  className={`text-[0.62rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                    currentWord === size
                      ? 'bg-[#c79c6e] text-black font-bold'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Scroll Button & Arrow Text Size (Optional - Principle sections exclusive) */}
        {showButtonSizeControl && (
          <div className="bg-[#050505] border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-white/70">
                4. Scroll Button &amp; Arrow
              </span>
              <span className="text-xs font-mono font-bold text-[#c79c6e]">
                {currentButton}px
              </span>
            </div>

            <p className="text-[0.68rem] text-white/40 leading-snug">
              Controls button text size and scales the circular arrow button proportionally.
            </p>

            {/* Stepper & Slider */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onButtonSizeChange && onButtonSizeChange(Math.max(10, currentButton - 1))}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Decrease 1px"
              >
                <Minus size={14} weight="bold" />
              </button>

              <input
                type="range"
                min={10}
                max={26}
                step={1}
                value={currentButton}
                onChange={(e) => onButtonSizeChange && onButtonSizeChange(Number(e.target.value))}
                className="flex-1 accent-[#c79c6e] cursor-pointer"
              />

              <button
                type="button"
                onClick={() => onButtonSizeChange && onButtonSizeChange(Math.min(26, currentButton + 1))}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Increase 1px"
              >
                <Plus size={14} weight="bold" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
              {[11, 12, 13, 14, 16, 18].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onButtonSizeChange && onButtonSizeChange(size)}
                  className={`text-[0.62rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                    currentButton === size
                      ? 'bg-[#c79c6e] text-black font-bold'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Real-time Visual Preview Canvas */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[0.68rem] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
            <Eye size={13} className="text-[#c79c6e]" />
            <span>Live Visual Preview (Exact Home Styling &amp; Colors)</span>
          </span>
          <span className="text-[0.62rem] text-white/40">
            Rendered with authentic Fraunces Serif &amp; Inter Typography
          </span>
        </div>

        <div className="bg-[#f5f1e8] border border-[#c9542f]/30 rounded-xl p-6 sm:p-8 text-[#111010] shadow-inner overflow-hidden flex flex-col gap-3">
          {/* Eyebrow preview */}
          <div className="flex items-center gap-3">
            <div className="h-[1.5px] w-7 bg-[#c9542f] origin-left shrink-0" />
            <span
              className="font-sans font-bold uppercase tracking-[0.25em] text-[#c9542f] transition-all"
              style={{ fontSize: `${currentEyebrow}px` }}
            >
              {previewEyebrow || 'CLARITY. HONESTY. INTENTION.'}
            </span>
          </div>

          {/* Heading preview */}
          <h3
            className="font-serif font-medium tracking-tight text-[#111010] leading-[1.1] transition-all"
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: `${Math.min(currentHeading, 54)}px`,
            }}
          >
            {previewHeading}{' '}
            {previewAccent && (
              <span className="text-[#c9542f] font-medium not-italic">
                {previewAccent}
              </span>
            )}
          </h3>

          {/* Description preview */}
          <p
            className="font-serif font-normal text-[#4a463e] tracking-wide leading-relaxed max-w-xl transition-all"
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: `${currentDescription}px`,
            }}
          >
            {previewDescription}
          </p>

          {/* Floating Words Live Preview Badge Strip */}
          {showWordSizeControl && (
            <div className="pt-3.5 mt-1 border-t border-[#c9542f]/20 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[0.62rem] font-sans uppercase tracking-widest text-[#c9542f] font-bold">
                Floating Words Live Preview:
              </span>
              {[
                { text: 'Overthinking', color: '#c9542f' },
                { text: 'Loneliness', color: '#c9542f' },
                { text: 'Family', color: '#047857' },
                { text: 'Breakup', color: '#be185d' },
                { text: 'What if?', color: '#5b67ca' },
                { text: 'Self doubt', color: '#2b2823' },
              ].map((item, idx) => (
                <span
                  key={idx}
                  className="font-serif font-medium transition-all select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                  style={{
                    color: item.color,
                    fontSize: `${currentWord}px`
                  }}
                >
                  {item.text}
                </span>
              ))}
            </div>
          )}

          {/* Scroll Button & Arrow Live Preview Strip */}
          {showButtonSizeControl && (
            <div className="pt-3.5 mt-1 border-t border-[#c9542f]/20 flex items-center gap-3.5">
              <div 
                className="rounded-full border border-black/20 bg-white/70 flex items-center justify-center shrink-0 shadow-xs"
                style={{
                  width: `${Math.round(currentButton * 3.4)}px`,
                  height: `${Math.round(currentButton * 3.4)}px`,
                }}
              >
                <ArrowDown size={Math.max(13, Math.round(currentButton * 1.4))} weight="bold" className="text-[#111010]" />
              </div>
              <span 
                className="font-sans uppercase tracking-[0.25em] text-[#111010] font-bold"
                style={{ fontSize: `${currentButton}px` }}
              >
                {buttonPreviewText || 'SCROLL FOR NEXT PRINCIPLE'}
              </span>
            </div>
          )}
        </div>
      </div>
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
  const { showToast: showGlobalToast, showSuccess, showError } = useToast();

  const fileInputRef = useRef(null);

  // Show Toast Helper (routed to global ToastContext)
  const showToast = (message, type = 'success') => {
    if (type === 'error') showError(message);
    else if (type === 'info') showGlobalToast(message, 'info');
    else showSuccess(message);
  };

  const [globalVisuals, setGlobalVisuals] = useState({
    contrast: 100,
    brightness: 100,
    overlayDarkness: 40,
    saturation: 100,
  });

  const [footerBrandSettings, setFooterBrandSettings] = useState({
    brandDescription: 'Authentic 1-on-1 mentorship, transformational coaching & self-mastery courses designed to quiet inner noise, dissolve reactive patterns, and elevate your presence.',
    brandEmail: 'coaching@aarkeshgupta.com',
    copyrightText: '© 2026 Better With Aarkesh. All rights reserved.',
    columnTitleFontSize: 14,
    bioFontSize: 16,
    linksFontSize: 16,
    brandTitleFontSize: 36,
    copyrightFontSize: 14,
  });
  const [footerColumns, setFooterColumns] = useState([]);
  const [footerSocials, setFooterSocials] = useState([]);
  const [isSavingFooter, setIsSavingFooter] = useState(false);

  // Master Typography Studio State
  const [masterEyebrowSize, setMasterEyebrowSize] = useState(14);
  const [masterHeadingSize, setMasterHeadingSize] = useState(64);
  const [masterDescriptionSize, setMasterDescriptionSize] = useState(18);
  const [masterButtonSize, setMasterButtonSize] = useState(14);
  const [isSavingMaster, setIsSavingMaster] = useState(false);
  const [selectedMasterSections, setSelectedMasterSections] = useState({
    hero: true,
    problem: true,
    think: true,
    feel: true,
    decide: true,
    coachingProcess: true,
    coachingJourney: true,
    about: true,
    testimonials: true,
    cta: true,
    faq: true,
    footer: true,
  });

  const handleToggleMasterSection = (key) => {
    setSelectedMasterSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectAllMasterSections = (val) => {
    setSelectedMasterSections({
      hero: val,
      problem: val,
      think: val,
      feel: val,
      decide: val,
      coachingProcess: val,
      coachingJourney: val,
      about: val,
      testimonials: val,
      cta: val,
      faq: val,
      footer: val,
    });
  };

  const handleApplyMasterTypography = async () => {
    if (!allSections) return;
    try {
      setIsSavingMaster(true);
      const token = localStorage.getItem('adminToken');
      const updatedAllSections = JSON.parse(JSON.stringify(allSections));
      const endpointsToSave = new Set();

      if (selectedMasterSections.hero) {
        updatedAllSections.hero = {
          ...(updatedAllSections.hero || {}),
          eyebrowFontSize: masterEyebrowSize,
          headingFontSize: masterHeadingSize,
          descriptionFontSize: masterDescriptionSize,
        };
        endpointsToSave.add('hero');
      }

      if (selectedMasterSections.problem) {
        updatedAllSections.problem = {
          ...(updatedAllSections.problem || {}),
          eyebrowFontSize: masterEyebrowSize,
          headingFontSize: masterHeadingSize,
          descriptionFontSize: masterDescriptionSize,
        };
        endpointsToSave.add('problem');
      }

      if (selectedMasterSections.think || selectedMasterSections.feel || selectedMasterSections.decide) {
        updatedAllSections.principles = {
          ...(updatedAllSections.principles || {}),
        };
        if (selectedMasterSections.think) {
          updatedAllSections.principles.think = {
            ...(updatedAllSections.principles.think || {}),
            eyebrowFontSize: masterEyebrowSize,
            headingFontSize: masterHeadingSize,
            descriptionFontSize: masterDescriptionSize,
            buttonFontSize: masterButtonSize,
          };
        }
        if (selectedMasterSections.feel) {
          updatedAllSections.principles.feel = {
            ...(updatedAllSections.principles.feel || {}),
            eyebrowFontSize: masterEyebrowSize,
            headingFontSize: masterHeadingSize,
            descriptionFontSize: masterDescriptionSize,
            buttonFontSize: masterButtonSize,
          };
        }
        if (selectedMasterSections.decide) {
          updatedAllSections.principles.decide = {
            ...(updatedAllSections.principles.decide || {}),
            eyebrowFontSize: masterEyebrowSize,
            headingFontSize: masterHeadingSize,
            descriptionFontSize: masterDescriptionSize,
            buttonFontSize: masterButtonSize,
          };
        }
        endpointsToSave.add('principles');
      }

      if (selectedMasterSections.coachingProcess) {
        updatedAllSections.coachingProcess = {
          ...(updatedAllSections.coachingProcess || {}),
          eyebrowFontSize: masterEyebrowSize,
          headingFontSize: masterHeadingSize,
          descriptionFontSize: masterDescriptionSize,
        };
        endpointsToSave.add('coachingProcess');
      }

      if (selectedMasterSections.coachingJourney) {
        updatedAllSections.coachingJourney = {
          ...(updatedAllSections.coachingJourney || {}),
          eyebrowFontSize: masterEyebrowSize,
          headingFontSize: masterHeadingSize,
          descriptionFontSize: masterDescriptionSize,
        };
        endpointsToSave.add('coachingJourney');
      }

      if (selectedMasterSections.about) {
        updatedAllSections.about = {
          ...(updatedAllSections.about || {}),
          eyebrowFontSize: masterEyebrowSize,
          headingFontSize: masterHeadingSize,
          descriptionFontSize: masterDescriptionSize,
        };
        endpointsToSave.add('about');
      }

      if (selectedMasterSections.testimonials) {
        updatedAllSections.testimonials = {
          ...(updatedAllSections.testimonials || {}),
          eyebrowFontSize: masterEyebrowSize,
          headingFontSize: masterHeadingSize,
          descriptionFontSize: masterDescriptionSize,
        };
        endpointsToSave.add('testimonials');
      }

      if (selectedMasterSections.cta) {
        updatedAllSections.cta = {
          ...(updatedAllSections.cta || {}),
          eyebrowFontSize: masterEyebrowSize,
          headingFontSize: masterHeadingSize,
          descriptionFontSize: masterDescriptionSize,
        };
        endpointsToSave.add('cta');
      }

      if (selectedMasterSections.faq) {
        updatedAllSections.faq = {
          ...(updatedAllSections.faq || {}),
          eyebrowFontSize: masterEyebrowSize,
          headingFontSize: masterHeadingSize,
          descriptionFontSize: masterDescriptionSize,
        };
        endpointsToSave.add('faq');
      }

      if (selectedMasterSections.footer) {
        const updatedFooter = {
          ...footerBrandSettings,
          columnTitleFontSize: masterEyebrowSize,
          bioFontSize: masterDescriptionSize,
          linksFontSize: Math.max(13, masterDescriptionSize - 2),
          brandTitleFontSize: Math.min(masterHeadingSize, 42),
          copyrightFontSize: Math.max(11, masterEyebrowSize - 1),
        };
        setFooterBrandSettings(updatedFooter);
        endpointsToSave.add('footer');
        try {
          fetch(`${API_URL}/api/footer-columns/settings`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(updatedFooter),
          });
        } catch (e) {}
      }

      setAllSections(updatedAllSections);

      const res = await fetch(`${API_URL}/api/home-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedAllSections),
      });

      if (res.ok) {
        showSuccess(`⚡ Master Typography applied to ${endpointsToSave.size} section(s) & saved to MongoDB!`);
      } else {
        showError('Some sections could not be updated. Please check connection.');
      }
    } catch (err) {
      console.error('Master typography apply error:', err);
      showError('Failed to apply master typography.');
    } finally {
      setIsSavingMaster(false);
    }
  };

  // Fetch All Home Settings & Global Visuals on Load
  useEffect(() => {
    fetchAllHomeSettings();
    fetchGlobalVisuals();
    fetchFooterSettings();
  }, []);

  const fetchGlobalVisuals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/visual-settings`);
      if (res.ok) {
        const data = await res.json();
        setGlobalVisuals({
          contrast: data.contrast ?? 100,
          brightness: data.brightness ?? 100,
          overlayDarkness: data.overlayDarkness ?? 40,
          saturation: data.saturation ?? 100,
        });
      }
    } catch (e) {}
  };

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

  const fetchFooterSettings = async () => {
    try {
      const [setRes, colRes, socRes] = await Promise.all([
        fetch(`${API_URL}/api/footer-columns/settings`),
        fetch(`${API_URL}/api/footer-columns/admin`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }),
        fetch(`${API_URL}/api/social-links/admin`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      ]);
      if (setRes.ok) {
        const setData = await setRes.json();
        if (setData) setFooterBrandSettings(setData);
      }
      if (colRes.ok) {
        const colData = await colRes.json();
        if (Array.isArray(colData)) setFooterColumns(colData);
      }
      if (socRes.ok) {
        const socData = await socRes.json();
        if (Array.isArray(socData)) setFooterSocials(socData);
      }
    } catch (err) {
      console.error('Failed to fetch footer settings in Home editor:', err);
    }
  };

  const handleSaveFooterBrand = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingFooter(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/footer-columns/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(footerBrandSettings)
      });
      if (res.ok) {
        showSuccess('Footer brand settings saved & live on website!');
      } else {
        showError('Failed to save footer settings');
      }
    } catch (err) {
      showError('Error saving footer settings');
    } finally {
      setIsSavingFooter(false);
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

    // Validation: under 2 MB
    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      showToast(`Image is ${sizeMB} MB. Max allowed size is 2 MB. Please compress your image.`, 'error');
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
        if (uploadTargetField.startsWith('testimonials.items.')) {
          const parts = uploadTargetField.split('.');
          const itemIdx = parseInt(parts[2], 10);
          const propName = parts[3] || 'image';
          const copy = [...(allSections.testimonials?.items || [])];
          if (copy[itemIdx]) {
            copy[itemIdx] = { ...copy[itemIdx], [propName]: finalUrl };
            handleSectionChange('items', copy);
          }
        } else if (uploadTargetField.startsWith('principles.')) {
          const [, principleKey, field] = uploadTargetField.split('.');
          handlePrincipleChange(principleKey, field, finalUrl);
        } else if (uploadTargetField.includes('.')) {
          const [group, field] = uploadTargetField.split('.');
          handleNestedChange(group, field, finalUrl);
        } else {
          handleSectionChange(uploadTargetField, finalUrl);
        }
      }
      showToast('Image uploaded successfully (Under 2 MB)!');
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
    if (activeTab === 'masterTypography') {
      return handleApplyMasterTypography();
    }
    if (activeTab === 'footer') {
      return handleSaveFooterBrand();
    }
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

  const currentGlobalOverlayOpacity = globalVisuals.overlayDarkness ?? (currentHero.overlayOpacity ?? 40);

  const handleGlobalOverlayChange = (val) => {
    setGlobalVisuals(prev => ({ ...prev, overlayDarkness: val }));
    setAllSections(prev => ({
      ...prev,
      hero: {
        ...(prev?.hero || {}),
        overlayOpacity: val
      }
    }));
    saveGlobalVisuals({ ...globalVisuals, overlayDarkness: val });
  };

  const handleGlobalContrastChange = (val) => {
    setGlobalVisuals(prev => ({ ...prev, contrast: val }));
    saveGlobalVisuals({ ...globalVisuals, contrast: val });
  };

  const handleGlobalBrightnessChange = (val) => {
    setGlobalVisuals(prev => ({ ...prev, brightness: val }));
    saveGlobalVisuals({ ...globalVisuals, brightness: val });
  };

  const saveGlobalVisuals = async (newVisuals) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/api/visual-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newVisuals)
      });
    } catch (e) {}
  };

  return (
    <div className="w-full flex-1 flex flex-col font-sans bg-[#050505] text-white">
      
      {/* Hidden Global File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/5 px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl text-white">Home Page Editor</h1>
            <span className="px-2 py-0.5 rounded bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.65rem] font-semibold text-[#c79c6e] uppercase tracking-wider">
              {SIDEBAR_TABS.find(t => t.id === activeTab)?.label}
            </span>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            Customize content and images. All image uploads must be <strong className="text-[#c79c6e]">under 2 MB</strong> for maximum performance.
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
            disabled={isSaving || isSavingMaster}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-xs font-medium transition-all cursor-pointer"
          >
            <ArrowClockwise size={15} />
            <span>Reload</span>
          </button>

          <button
            onClick={handleSaveSection}
            disabled={isSaving || isSavingMaster}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#c79c6e] hover:bg-[#b0885e] text-black font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#c79c6e]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {(isSaving || isSavingMaster) ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>{activeTab === 'masterTypography' ? 'Saving All...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                {activeTab === 'masterTypography' ? <Lightning size={16} weight="fill" /> : <FloppyDisk size={16} weight="bold" />}
                <span>{activeTab === 'masterTypography' ? 'Apply & Save All' : 'Save Section'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout: Left Sidebar + Right Editor Body */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto items-start">
        
        {/* ─── LEFT SIDEBAR TABS (PERMANENTLY FIXED/STICKY) ─── */}
        <aside className="w-full md:w-72 lg:w-80 bg-[#080808] border-r border-white/5 p-4 lg:p-6 shrink-0 flex flex-col gap-2 md:sticky md:top-[73px] md:h-[calc(100vh-190px)] md:overflow-y-auto custom-scrollbar">
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
              <span>All uploads must be under 2 MB. Clicking 'Save Section' instantly updates MongoDB.</span>
            </div>
          </div>
        </aside>

        {/* ─── RIGHT CONTENT AREA ─── */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          
          {/* =========================================================
              0. MASTER TYPOGRAPHY STUDIO (GLOBAL HOMEPAGE CONTROLLER)
             ========================================================= */}
          {activeTab === 'masterTypography' && (
            <div className="flex flex-col gap-8 max-w-6xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#c79c6e] text-black">
                      <Faders size={20} weight="bold" />
                    </div>
                    <h2 className="font-serif text-2xl text-white">Master Font Studio</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.65rem] font-bold text-[#c79c6e] tracking-wider uppercase">
                      Universal Sync Engine
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Control and synchronize Eyebrow/Tagline, Main Heading, and Paragraph font sizes across all Home page sections simultaneously in 1 click.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setMasterEyebrowSize(14);
                      setMasterHeadingSize(64);
                      setMasterDescriptionSize(18);
                      setMasterButtonSize(14);
                      showToast('Reset master sizes to recommended standards (14px / 64px / 18px / 14px)', 'info');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all cursor-pointer"
                  >
                    <ArrowCounterClockwise size={14} />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              {/* Master Sliders Control Card */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c79c6e]">
                    <TextT size={18} weight="bold" />
                    <span>Universal Font Sizing Engine</span>
                  </div>
                  <span className="text-[0.68rem] text-white/40 font-medium">
                    Adjust sizes here, choose target sections below, then click "Apply &amp; Save All" at the top.
                  </span>
                </div>

                {/* 4 Master Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  
                  {/* 1. Master Eyebrow */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c79c6e]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                          1. Tagline / Eyebrow
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {masterEyebrowSize}px
                      </span>
                    </div>

                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls uppercase tracking taglines across all principles, hero, coaching journey &amp; CTAs.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMasterEyebrowSize(prev => Math.max(10, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>

                      <input
                        type="range"
                        min={10}
                        max={28}
                        step={1}
                        value={masterEyebrowSize}
                        onChange={(e) => setMasterEyebrowSize(Number(e.target.value))}
                        className="flex-1 accent-[#c79c6e] cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => setMasterEyebrowSize(prev => Math.min(28, prev + 1))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[11, 12, 13, 14, 16, 18].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setMasterEyebrowSize(size)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            masterEyebrowSize === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Master Main Heading */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c79c6e]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                          2. Main Headings
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {masterHeadingSize}px
                      </span>
                    </div>

                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls main bold Fraunces serif headlines across every section on the home page.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMasterHeadingSize(prev => Math.max(24, prev - 2))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Decrease 2px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>

                      <input
                        type="range"
                        min={24}
                        max={96}
                        step={1}
                        value={masterHeadingSize}
                        onChange={(e) => setMasterHeadingSize(Number(e.target.value))}
                        className="flex-1 accent-[#c79c6e] cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => setMasterHeadingSize(prev => Math.min(96, prev + 2))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Increase 2px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[36, 44, 52, 60, 64, 72].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setMasterHeadingSize(size)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            masterHeadingSize === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Master Description / Paragraph */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c79c6e]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                          3. Paragraph / Subtext
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {masterDescriptionSize}px
                      </span>
                    </div>

                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls subtext, quote paragraphs, principle summaries, and descriptive copy.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMasterDescriptionSize(prev => Math.max(12, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>

                      <input
                        type="range"
                        min={12}
                        max={36}
                        step={1}
                        value={masterDescriptionSize}
                        onChange={(e) => setMasterDescriptionSize(Number(e.target.value))}
                        className="flex-1 accent-[#c79c6e] cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => setMasterDescriptionSize(prev => Math.min(36, prev + 1))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[14, 16, 18, 20, 22, 24].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setMasterDescriptionSize(size)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            masterDescriptionSize === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Master Scroll Button & Arrow */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c79c6e]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                          4. Scroll Button &amp; Arrow
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {masterButtonSize}px
                      </span>
                    </div>

                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls "SCROLL FOR NEXT PRINCIPLE" text size and scales the circular down-arrow button proportionally.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMasterButtonSize(prev => Math.max(10, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>

                      <input
                        type="range"
                        min={10}
                        max={26}
                        step={1}
                        value={masterButtonSize}
                        onChange={(e) => setMasterButtonSize(Number(e.target.value))}
                        className="flex-1 accent-[#c79c6e] cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => setMasterButtonSize(prev => Math.min(26, prev + 1))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[11, 12, 13, 14, 16, 18].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setMasterButtonSize(size)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            masterButtonSize === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Target Sections Selector Grid */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={18} className="text-[#c79c6e]" weight="bold" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Target Home Sections ({Object.values(selectedMasterSections).filter(Boolean).length} of 12 Selected)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllMasterSections(true)}
                      className="text-[0.68rem] font-semibold px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAllMasterSections(false)}
                      className="text-[0.68rem] font-semibold px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Grid of Sections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { key: 'hero', label: 'Hero Banner', sub: 'Eyebrow, Main headline & subtext', curr: allSections.hero },
                    { key: 'problem', label: 'Problem Statement', sub: 'The real struggle & transition', curr: allSections.problem },
                    { key: 'think', label: 'Principle 01: Think', sub: 'Think clearly & cognitive clarity', curr: allSections.principles?.think },
                    { key: 'feel', label: 'Principle 02: Feel', sub: 'Feel honestly & emotional depth', curr: allSections.principles?.feel },
                    { key: 'decide', label: 'Principle 03: Decide', sub: 'Decide intentionally & conviction', curr: allSections.principles?.decide },
                    { key: 'coachingProcess', label: 'Coaching Process', sub: '5-step methodology & titles', curr: allSections.coachingProcess },
                    { key: 'coachingJourney', label: 'Coaching Journey', sub: 'Mountain path, nodes & pillars', curr: allSections.coachingJourney },
                    { key: 'about', label: 'Meet Aarkesh', sub: 'Coach story & 3 role descriptions', curr: allSections.about },
                    { key: 'testimonials', label: 'Testimonials', sub: 'Client review headlines & quotes', curr: allSections.testimonials },
                    { key: 'cta', label: 'Final Call to Action', sub: 'Next chapter booking banner', curr: allSections.cta },
                    { key: 'faq', label: 'FAQ Section', sub: 'Frequently asked questions & answers', curr: allSections.faq },
                    { key: 'footer', label: 'Website Footer', sub: 'Column titles, brand bio & links', curr: { eyebrowFontSize: footerBrandSettings.columnTitleFontSize || 14, headingFontSize: footerBrandSettings.brandTitleFontSize || 36, descriptionFontSize: footerBrandSettings.bioFontSize || 16 } },
                  ].map((sec) => {
                    const isChecked = !!selectedMasterSections[sec.key];
                    return (
                      <div
                        key={sec.key}
                        onClick={() => handleToggleMasterSection(sec.key)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-[#c79c6e]/10 border-[#c79c6e]/40 shadow-sm'
                            : 'bg-[#050505] border-white/5 hover:border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="mt-0.5 text-[#c79c6e]">
                          {isChecked ? (
                            <CheckSquare size={18} weight="fill" />
                          ) : (
                            <Square size={18} className="text-white/30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-semibold uppercase tracking-wider truncate ${
                              isChecked ? 'text-white' : 'text-white/60'
                            }`}>
                              {sec.label}
                            </span>
                          </div>
                          <p className="text-[0.68rem] text-white/40 truncate mt-0.5">
                            {sec.sub}
                          </p>
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 text-[0.62rem] font-mono text-white/50">
                            <span>Eyebrow: <strong className="text-white/80">{sec.curr?.eyebrowFontSize || 14}px</strong></span>
                            <span>•</span>
                            <span>Head: <strong className="text-white/80">{sec.curr?.headingFontSize || 64}px</strong></span>
                            <span>•</span>
                            <span>Para: <strong className="text-white/80">{sec.curr?.descriptionFontSize || 18}px</strong></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Section Live Visual Comparison Grid */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Eye size={18} className="text-[#c79c6e]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Live Multi-Section Canvas Comparison
                    </span>
                  </div>
                  <span className="text-[0.68rem] text-white/40 font-medium">
                    Previewing in real-time with master sizes: <strong className="text-[#c79c6e] font-mono">{masterEyebrowSize}px</strong> / <strong className="text-[#c79c6e] font-mono">{masterHeadingSize}px</strong> / <strong className="text-[#c79c6e] font-mono">{masterDescriptionSize}px</strong> / <strong className="text-[#c79c6e] font-mono">{masterButtonSize}px</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* Card 1: Hero Banner Preview */}
                  <div className="bg-[#f5f1e8] border border-[#c9542f]/30 rounded-xl p-6 text-[#111010] flex flex-col gap-3 shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-[#c9542f]/20">
                      <span className="text-[0.62rem] font-mono font-bold uppercase tracking-wider text-[#c9542f]">
                        Preview 1 • Hero Banner
                      </span>
                      <span className="text-[0.6rem] text-stone-500 font-mono">
                        {masterEyebrowSize}px / {masterHeadingSize}px / {masterDescriptionSize}px
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="h-[1.5px] w-6 bg-[#c9542f] origin-left shrink-0" />
                      <span
                        className="font-sans font-bold uppercase tracking-[0.25em] text-[#c9542f]"
                        style={{ fontSize: `${masterEyebrowSize}px` }}
                      >
                        CLARITY. HONESTY. INTENTION.
                      </span>
                    </div>

                    <h3
                      className="font-serif font-medium tracking-tight text-[#111010] leading-[1.1]"
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: `${Math.min(masterHeadingSize, 52)}px`,
                      }}
                    >
                      Clarity changes <span className="text-[#c9542f] font-medium not-italic">everything.</span>
                    </h3>

                    <p
                      className="font-serif font-normal text-[#4a463e] tracking-wide leading-relaxed max-w-lg"
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: `${masterDescriptionSize}px`,
                      }}
                    >
                      A space to think clearly, feel honestly and decide intentionally.
                    </p>
                  </div>

                  {/* Card 2: Principle Preview */}
                  <div className="bg-[#f5f1e8] border border-[#c9542f]/30 rounded-xl p-6 text-[#111010] flex flex-col gap-3 shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-[#c9542f]/20">
                      <span className="text-[0.62rem] font-mono font-bold uppercase tracking-wider text-[#c9542f]">
                        Preview 2 • Principle 01: Think
                      </span>
                      <span className="text-[0.6rem] text-stone-500 font-mono">
                        {masterEyebrowSize}px / {masterHeadingSize}px / {masterDescriptionSize}px / {masterButtonSize}px
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="h-[1.5px] w-6 bg-[#c9542f] origin-left shrink-0" />
                      <span
                        className="font-sans font-bold uppercase tracking-[0.25em] text-[#c9542f]"
                        style={{ fontSize: `${masterEyebrowSize}px` }}
                      >
                        PRINCIPLE 01 • THINK CLEARLY
                      </span>
                    </div>

                    <h3
                      className="font-serif font-medium tracking-tight text-[#111010] leading-[1.1]"
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: `${Math.min(masterHeadingSize, 52)}px`,
                      }}
                    >
                      Quiet the noise. <span className="text-[#c9542f] font-medium not-italic">Find truth.</span>
                    </h3>

                    <p
                      className="font-serif font-normal text-[#4a463e] tracking-wide leading-relaxed max-w-lg"
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: `${masterDescriptionSize}px`,
                      }}
                    >
                      The quality of your life is determined by the quality of your thinking. When mental chatter dissolves, deep insights emerge naturally.
                    </p>

                    {/* Live Principle Scroll Button Preview */}
                    <div className="flex items-center gap-3.5 pt-3 mt-1 border-t border-[#c9542f]/20">
                      <div 
                        className="rounded-full border border-black/20 bg-white/70 flex items-center justify-center shrink-0 shadow-xs"
                        style={{
                          width: `${Math.round(masterButtonSize * 3.4)}px`,
                          height: `${Math.round(masterButtonSize * 3.4)}px`,
                        }}
                      >
                        <ArrowDown size={Math.max(13, Math.round(masterButtonSize * 1.4))} weight="bold" className="text-[#111010]" />
                      </div>
                      <span 
                        className="font-sans uppercase tracking-[0.25em] text-[#111010] font-bold"
                        style={{ fontSize: `${masterButtonSize}px` }}
                      >
                        SCROLL FOR NEXT PRINCIPLE
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Coaching Methodology */}
                  <div className="bg-[#f5f1e8] border border-[#c9542f]/30 rounded-xl p-6 text-[#111010] flex flex-col gap-3 shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-[#c9542f]/20">
                      <span className="text-[0.62rem] font-mono font-bold uppercase tracking-wider text-[#c9542f]">
                        Preview 3 • Coaching Methodology
                      </span>
                      <span className="text-[0.6rem] text-stone-500 font-mono">
                        {masterEyebrowSize}px / {masterHeadingSize}px / {masterDescriptionSize}px
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="h-[1.5px] w-6 bg-[#c9542f] origin-left shrink-0" />
                      <span
                        className="font-sans font-bold uppercase tracking-[0.25em] text-[#c9542f]"
                        style={{ fontSize: `${masterEyebrowSize}px` }}
                      >
                        PROVEN 5-STEP METHODOLOGY
                      </span>
                    </div>

                    <h3
                      className="font-serif font-medium tracking-tight text-[#111010] leading-[1.1]"
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: `${Math.min(masterHeadingSize, 52)}px`,
                      }}
                    >
                      How transformation <span className="text-[#c9542f] font-medium not-italic">unfolds.</span>
                    </h3>

                    <p
                      className="font-serif font-normal text-[#4a463e] tracking-wide leading-relaxed max-w-lg"
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: `${masterDescriptionSize}px`,
                      }}
                    >
                      A grounded, systematic approach combining deep conversation, emotional honesty, and concrete action.
                    </p>
                  </div>

                  {/* Card 4: Final CTA Preview */}
                  <div className="bg-[#f5f1e8] border border-[#c9542f]/30 rounded-xl p-6 text-[#111010] flex flex-col gap-3 shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-[#c9542f]/20">
                      <span className="text-[0.62rem] font-mono font-bold uppercase tracking-wider text-[#c9542f]">
                        Preview 4 • Final CTA
                      </span>
                      <span className="text-[0.6rem] text-stone-500 font-mono">
                        {masterEyebrowSize}px / {masterHeadingSize}px / {masterDescriptionSize}px
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="h-[1.5px] w-6 bg-[#c9542f] origin-left shrink-0" />
                      <span
                        className="font-sans font-bold uppercase tracking-[0.25em] text-[#c9542f]"
                        style={{ fontSize: `${masterEyebrowSize}px` }}
                      >
                        A CONVERSATION CAN CHANGE EVERYTHING
                      </span>
                    </div>

                    <h3
                      className="font-serif font-medium tracking-tight text-[#111010] leading-[1.1]"
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: `${Math.min(masterHeadingSize, 52)}px`,
                      }}
                    >
                      Your next chapter <span className="text-[#c9542f] font-medium not-italic">starts here.</span>
                    </h3>

                    <p
                      className="font-serif font-normal text-[#4a463e] tracking-wide leading-relaxed max-w-lg"
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: `${masterDescriptionSize}px`,
                      }}
                    >
                      This is your space to be heard, understood, and guided forward. Let's create real change—together.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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

                {/* Right Visuals - Reusable ImageEditorCard & Position Controller */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <ImageEditorCard
                    title="Hero Banner Image"
                    dimensions="1920 × 1080 px (16:9)"
                    maxSize="Under 2 MB"
                    aspectRatio="aspect-[16/9]"
                    imageUrl={currentHero.bgImageUrl}
                    fallbackUrl={defaultHeroImg}
                    onUpload={() => triggerImageUpload('bgImageUrl')}
                    onUrlChange={(url) => handleSectionChange('bgImageUrl', url)}
                    isUploading={isUploading}
                    tip="Keep coach portrait focused towards the right half so left-side typography remains crisp."
                    overlayOpacity={currentGlobalOverlayOpacity}
                  />

                  {/* Image Vertical Position (Up / Down) Controller */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                        <SlidersHorizontal size={16} />
                        <span>Image Position (Up / Down)</span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {currentHero.imagePositionY || 0}px
                      </span>
                    </div>

                    <p className="text-[0.72rem] text-white/40 leading-relaxed">
                      Move the portrait photo up or down on the home banner (with zero white space gaps).
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSectionChange('imagePositionY', (currentHero.imagePositionY || 0) - 5)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Move Up 5px"
                      >
                        <CaretUp size={16} weight="bold" />
                      </button>

                      <input
                        type="range"
                        min={-120}
                        max={120}
                        step={2}
                        value={currentHero.imagePositionY || 0}
                        onChange={(e) => handleSectionChange('imagePositionY', Number(e.target.value))}
                        className="flex-1 accent-[#c79c6e] cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => handleSectionChange('imagePositionY', (currentHero.imagePositionY || 0) + 5)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Move Down 5px"
                      >
                        <CaretDown size={16} weight="bold" />
                      </button>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
                      {[
                        { label: 'Higher (-60px)', val: -60 },
                        { label: 'Up (-30px)', val: -30 },
                        { label: 'Default (0px)', val: 0 },
                        { label: 'Down (+30px)', val: 30 },
                        { label: 'Lower (+60px)', val: 60 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => handleSectionChange('imagePositionY', preset.val)}
                          className={`text-[0.68rem] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            (currentHero.imagePositionY || 0) === preset.val
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Section Typography & Font Size Control */}
              <TypographyControllerCard
                title="Hero Section Typography & Font Sizes (Home Exclusive)"
                eyebrowFontSize={currentHero.eyebrowFontSize}
                headingFontSize={currentHero.headingFontSize}
                descriptionFontSize={currentHero.descriptionFontSize}
                defaultEyebrowSize={14}
                defaultHeadingSize={64}
                defaultDescriptionSize={22}
                onEyebrowSizeChange={(val) => handleSectionChange('eyebrowFontSize', val)}
                onHeadingSizeChange={(val) => handleSectionChange('headingFontSize', val)}
                onDescriptionSizeChange={(val) => handleSectionChange('descriptionFontSize', val)}
                previewEyebrow={currentHero.eyebrowText || 'CLARITY. HONESTY. INTENTION.'}
                previewHeading={currentHero.headingLine1 || 'Clarity changes'}
                previewAccent={currentHero.headingAccent || 'everything.'}
                previewDescription={currentHero.description || 'A space to think clearly, feel honestly and decide intentionally.'}
              />
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

              {/* Home Section Typography & Font Size Control */}
              <TypographyControllerCard
                title="Problem Statement Typography & Font Sizes (Home Exclusive)"
                eyebrowFontSize={currentProblem.eyebrowFontSize}
                headingFontSize={currentProblem.headingFontSize}
                descriptionFontSize={currentProblem.descriptionFontSize}
                wordFontSize={currentProblem.wordFontSize}
                defaultEyebrowSize={14}
                defaultHeadingSize={56}
                defaultDescriptionSize={22}
                defaultWordSize={18}
                onEyebrowSizeChange={(val) => handleSectionChange('eyebrowFontSize', val)}
                onHeadingSizeChange={(val) => handleSectionChange('headingFontSize', val)}
                onDescriptionSizeChange={(val) => handleSectionChange('descriptionFontSize', val)}
                onWordSizeChange={(val) => handleSectionChange('wordFontSize', val)}
                showWordSizeControl={true}
                previewEyebrow={currentProblem.eyebrowText || "MAYBE YOU'VE SPENT YEARS"}
                previewHeading={currentProblem.headingLine1 || "Trying to fix what isn't the"}
                previewAccent={currentProblem.headingAccent || "real problem."}
                previewDescription={`${currentProblem.quoteItalic || "Things you carry, cloud your perspective."} ${currentProblem.quoteSubtext || "....Until you learn to see clearly"}`}
              />
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
                            placeholder="PRINCIPLE 01"
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
                      maxSize="Under 2 MB"
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

                {/* Home Section Typography & Font Size Control */}
                <TypographyControllerCard
                  title="Principle 01 (Think) Typography & Font Sizes (Home Exclusive)"
                  eyebrowFontSize={p.eyebrowFontSize}
                  headingFontSize={p.headingFontSize}
                  descriptionFontSize={p.descriptionFontSize}
                  buttonFontSize={p.buttonFontSize}
                  defaultEyebrowSize={14}
                  defaultHeadingSize={64}
                  defaultDescriptionSize={18}
                  defaultButtonSize={14}
                  onEyebrowSizeChange={(val) => handlePrincipleChange('think', 'eyebrowFontSize', val)}
                  onHeadingSizeChange={(val) => handlePrincipleChange('think', 'headingFontSize', val)}
                  onDescriptionSizeChange={(val) => handlePrincipleChange('think', 'descriptionFontSize', val)}
                  onButtonSizeChange={(val) => handlePrincipleChange('think', 'buttonFontSize', val)}
                  showButtonSizeControl={true}
                  buttonPreviewText={p.buttonText || 'SCROLL FOR NEXT PRINCIPLE'}
                  previewEyebrow={p.eyebrow || 'PRINCIPLE 01: THINK'}
                  previewHeading={p.title || 'THINK'}
                  previewAccent={p.subtitle || 'CLEARLY.'}
                  previewDescription={`${p.highlight || 'Clarity is the bridge between intention and action.'} ${p.description || 'Your mind creates stories. Some empower you, most hold you back...'}`}
                />
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
                            placeholder="PRINCIPLE 02"
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
                          placeholder="What you resist persists. What you feel fully dissolves."
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
                      maxSize="Under 2 MB"
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

                {/* Home Section Typography & Font Size Control */}
                <TypographyControllerCard
                  title="Principle 02 (Feel) Typography & Font Sizes (Home Exclusive)"
                  eyebrowFontSize={p.eyebrowFontSize}
                  headingFontSize={p.headingFontSize}
                  descriptionFontSize={p.descriptionFontSize}
                  buttonFontSize={p.buttonFontSize}
                  defaultEyebrowSize={14}
                  defaultHeadingSize={64}
                  defaultDescriptionSize={18}
                  defaultButtonSize={14}
                  onEyebrowSizeChange={(val) => handlePrincipleChange('feel', 'eyebrowFontSize', val)}
                  onHeadingSizeChange={(val) => handlePrincipleChange('feel', 'headingFontSize', val)}
                  onDescriptionSizeChange={(val) => handlePrincipleChange('feel', 'descriptionFontSize', val)}
                  onButtonSizeChange={(val) => handlePrincipleChange('feel', 'buttonFontSize', val)}
                  showButtonSizeControl={true}
                  buttonPreviewText={p.buttonText || 'SCROLL FOR NEXT PRINCIPLE'}
                  previewEyebrow={p.eyebrow || 'PRINCIPLE 02: FEEL'}
                  previewHeading={p.title || 'FEEL'}
                  previewAccent={p.subtitle || 'HONESTLY.'}
                  previewDescription={`${p.highlight || 'What you resist persists. What you feel fully dissolves.'} ${p.description || 'Emotions are signals, not dictators. Learn to sit with discomfort...'}`}
                />
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
                            placeholder="PRINCIPLE 03"
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
                          placeholder="True confidence is born from aligned decision making."
                          className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic font-serif focus:border-[#c79c6e]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Description Paragraph</label>
                        <textarea
                          rows={4}
                          value={p.description || ''}
                          onChange={(e) => handlePrincipleChange('decide', 'description', e.target.value)}
                          placeholder="Indecision is also a decision. Stop second guessing. We create personalized frameworks that give you the courage and conviction to execute fearlessly."
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
                      maxSize="Under 2 MB"
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

                {/* Home Section Typography & Font Size Control */}
                <TypographyControllerCard
                  title="Principle 03 (Decide) Typography & Font Sizes (Home Exclusive)"
                  eyebrowFontSize={p.eyebrowFontSize}
                  headingFontSize={p.headingFontSize}
                  descriptionFontSize={p.descriptionFontSize}
                  buttonFontSize={p.buttonFontSize}
                  defaultEyebrowSize={14}
                  defaultHeadingSize={64}
                  defaultDescriptionSize={18}
                  defaultButtonSize={14}
                  onEyebrowSizeChange={(val) => handlePrincipleChange('decide', 'eyebrowFontSize', val)}
                  onHeadingSizeChange={(val) => handlePrincipleChange('decide', 'headingFontSize', val)}
                  onDescriptionSizeChange={(val) => handlePrincipleChange('decide', 'descriptionFontSize', val)}
                  onButtonSizeChange={(val) => handlePrincipleChange('decide', 'buttonFontSize', val)}
                  showButtonSizeControl={true}
                  buttonPreviewText={p.buttonText || 'SCROLL FOR NEXT PRINCIPLE'}
                  previewEyebrow={p.eyebrow || 'PRINCIPLE 03: DECIDE'}
                  previewHeading={p.title || 'DECIDE'}
                  previewAccent={p.subtitle || 'INTENTIONALLY.'}
                  previewDescription={`${p.highlight || 'True confidence is born from aligned decision making.'} ${p.description || 'Indecision is also a decision. Stop second guessing...'}`}
                />
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
                      maxSize="Under 2 MB"
                      aspectRatio="aspect-[16/9]"
                      imageUrl={currentCoachingProcess.bgImg}
                      fallbackUrl={defaultCoachingProcessImg}
                      onUpload={() => triggerImageUpload('bgImg')}
                      onUrlChange={(url) => handleSectionChange('bgImg', url)}
                      isUploading={isUploading}
                      tip="Warm modern luxury consultation lounge. Subject on right."
                      overlayOpacity={currentGlobalOverlayOpacity}
                    />

                    {/* Desktop Positioning & Zoom Controls */}
                    <div className="bg-[#111111] border border-white/10 rounded-xl p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Desktop Image View Controls</span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs text-white/70">
                          <span>Zoom (Scale)</span>
                          <span className="text-[#c79c6e] font-mono">{currentCoachingProcess.imgScale || 105}%</span>
                        </div>
                        <input
                          type="range"
                          min="70"
                          max="180"
                          step="1"
                          value={currentCoachingProcess.imgScale || 105}
                          onChange={(e) => handleSectionChange('imgScale', Number(e.target.value))}
                          className="w-full accent-[#c79c6e] cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs text-white/70">
                          <span>Horizontal Position (Left ↔ Right)</span>
                          <span className="text-[#c79c6e] font-mono">{currentCoachingProcess.imgPositionX || 68}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={currentCoachingProcess.imgPositionX || 68}
                          onChange={(e) => handleSectionChange('imgPositionX', Number(e.target.value))}
                          className="w-full accent-[#c79c6e] cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs text-white/70">
                          <span>Vertical Position (Top ↕ Bottom)</span>
                          <span className="text-[#c79c6e] font-mono">{currentCoachingProcess.imgPositionY || 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={currentCoachingProcess.imgPositionY || 50}
                          onChange={(e) => handleSectionChange('imgPositionY', Number(e.target.value))}
                          className="w-full accent-[#c79c6e] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Home Section Typography & Font Size Control */}
                <TypographyControllerCard
                  title="Coaching Process Typography & Font Sizes (Home Exclusive)"
                  eyebrowFontSize={currentCoachingProcess.eyebrowFontSize}
                  headingFontSize={currentCoachingProcess.headingFontSize}
                  descriptionFontSize={currentCoachingProcess.descriptionFontSize}
                  defaultEyebrowSize={14}
                  defaultHeadingSize={56}
                  defaultDescriptionSize={18}
                  onEyebrowSizeChange={(val) => handleSectionChange('eyebrowFontSize', val)}
                  onHeadingSizeChange={(val) => handleSectionChange('headingFontSize', val)}
                  onDescriptionSizeChange={(val) => handleSectionChange('descriptionFontSize', val)}
                  previewEyebrow={currentCoachingProcess.eyebrowText || 'THE COACHING PROCESS'}
                  previewHeading={currentCoachingProcess.headingLine1 || 'A proven process'}
                  previewAccent={currentCoachingProcess.headingAccent || 'built around you.'}
                  previewDescription={`${currentCoachingProcess.subtitle || 'A clear path from where you are, to where you want to be.'} ${currentCoachingProcess.subnote || 'Simple. Effective.'}`}
                />
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
                      maxSize="Under 2 MB"
                      aspectRatio="aspect-[16/9]"
                      imageUrl={currentCoachingJourney.bgImg}
                      fallbackUrl={defaultCoachingJourneyImg}
                      onUpload={() => triggerImageUpload('bgImg')}
                      onUrlChange={(url) => handleSectionChange('bgImg', url)}
                      isUploading={isUploading}
                      tip="Majestic mountain summit with dramatic clouds and golden sunset rim light."
                      overlayOpacity={currentGlobalOverlayOpacity}
                    />

                    {/* Desktop Positioning & Zoom Controls */}
                    <div className="bg-[#111111] border border-white/10 rounded-xl p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Desktop Image View Controls</span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs text-white/70">
                          <span>Zoom (Scale)</span>
                          <span className="text-[#c79c6e] font-mono">{currentCoachingJourney.imgScale || 105}%</span>
                        </div>
                        <input
                          type="range"
                          min="70"
                          max="180"
                          step="1"
                          value={currentCoachingJourney.imgScale || 105}
                          onChange={(e) => handleSectionChange('imgScale', Number(e.target.value))}
                          className="w-full accent-[#c79c6e] cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs text-white/70">
                          <span>Horizontal Position (Left ↔ Right)</span>
                          <span className="text-[#c79c6e] font-mono">{currentCoachingJourney.imgPositionX || 80}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={currentCoachingJourney.imgPositionX || 80}
                          onChange={(e) => handleSectionChange('imgPositionX', Number(e.target.value))}
                          className="w-full accent-[#c79c6e] cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs text-white/70">
                          <span>Vertical Position (Top ↕ Bottom)</span>
                          <span className="text-[#c79c6e] font-mono">{currentCoachingJourney.imgPositionY || 35}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={currentCoachingJourney.imgPositionY || 35}
                          onChange={(e) => handleSectionChange('imgPositionY', Number(e.target.value))}
                          className="w-full accent-[#c79c6e] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Home Section Typography & Font Size Control */}
                <TypographyControllerCard
                  title="Coaching Journey Typography & Font Sizes (Home Exclusive)"
                  eyebrowFontSize={currentCoachingJourney.eyebrowFontSize}
                  headingFontSize={currentCoachingJourney.headingFontSize}
                  descriptionFontSize={currentCoachingJourney.descriptionFontSize}
                  defaultEyebrowSize={14}
                  defaultHeadingSize={56}
                  defaultDescriptionSize={18}
                  onEyebrowSizeChange={(val) => handleSectionChange('eyebrowFontSize', val)}
                  onHeadingSizeChange={(val) => handleSectionChange('headingFontSize', val)}
                  onDescriptionSizeChange={(val) => handleSectionChange('descriptionFontSize', val)}
                  previewEyebrow={currentCoachingJourney.eyebrowText || 'THE COACHING JOURNEY'}
                  previewHeading={currentCoachingJourney.headingLine1 || 'A clear process.'}
                  previewAccent={currentCoachingJourney.headingAccent || 'Real transformation.'}
                  previewDescription={currentCoachingJourney.description || "We don't do hacks. We follow a proven, human first process designed to create deep, lasting change."}
                />
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
                      placeholder="Different lenses. Same mission your growth."
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
                          orientation="Portrait (Vertical)"
                          maxSize="Under 2 MB"
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

              {/* Home Section Typography & Font Size Control */}
              <TypographyControllerCard
                title="Meet Aarkesh Typography & Font Sizes (Home Exclusive)"
                eyebrowFontSize={currentAbout.eyebrowFontSize}
                headingFontSize={currentAbout.headingFontSize}
                descriptionFontSize={currentAbout.descriptionFontSize}
                defaultEyebrowSize={14}
                defaultHeadingSize={40}
                defaultDescriptionSize={16}
                onEyebrowSizeChange={(val) => handleSectionChange('eyebrowFontSize', val)}
                onHeadingSizeChange={(val) => handleSectionChange('headingFontSize', val)}
                onDescriptionSizeChange={(val) => handleSectionChange('descriptionFontSize', val)}
                previewEyebrow={currentAbout.eyebrowText || 'MEET AARKESH'}
                previewHeading={currentAbout.headingLine || 'Three roles. One purpose.'}
                previewAccent="Behind the vision."
                previewDescription={currentAbout.subheading || 'A unique blend of cockpit discipline, psychological insight, and grounded human empathy.'}
              />
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
                  Manage the client reviews list, headline copy, and glowing background image (<strong className="text-[#c79c6e]">1920 × 1080 px, under 2 MB</strong>).
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Section Header</span>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Eyebrow Text</label>
                      <input
                        type="text"
                        value={currentTestimonials.eyebrowText || ''}
                        onChange={(e) => handleSectionChange('eyebrowText', e.target.value)}
                        placeholder="REAL STORIES. REAL CHANGE."
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Heading Line 1</label>
                        <input
                          type="text"
                          value={currentTestimonials.headingLine1 || ''}
                          onChange={(e) => handleSectionChange('headingLine1', e.target.value)}
                          placeholder="Their words."
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Heading Accent (Gold)</label>
                        <input
                          type="text"
                          value={currentTestimonials.headingAccent || ''}
                          onChange={(e) => handleSectionChange('headingAccent', e.target.value)}
                          placeholder="Their transformation."
                          className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-3 text-sm text-[#c79c6e] italic focus:border-[#c79c6e]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Description Paragraph</label>
                      <textarea
                        rows={3}
                        value={currentTestimonials.description || ''}
                        onChange={(e) => handleSectionChange('description', e.target.value)}
                        placeholder="What happens when you decide to do the work."
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c79c6e] resize-none"
                      />
                    </div>
                  </div>

                  {/* Testimonials List */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Client Reviews ({(currentTestimonials.items || []).length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newReview = { quote: '', name: '', role: '', category: 'Clarity & Direction' };
                          const updated = [newReview, ...(currentTestimonials.items || [])];
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
                          <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Review #{idx + 1}</span>
                            <div className="flex items-center gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const copy = [...currentTestimonials.items];
                                    const temp = copy[idx - 1];
                                    copy[idx - 1] = copy[idx];
                                    copy[idx] = temp;
                                    handleSectionChange('items', copy);
                                  }}
                                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5"
                                  title="Move Up"
                                >
                                  <CaretUp size={14} />
                                </button>
                              )}
                              {idx < (currentTestimonials.items || []).length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const copy = [...currentTestimonials.items];
                                    const temp = copy[idx + 1];
                                    copy[idx + 1] = copy[idx];
                                    copy[idx] = temp;
                                    handleSectionChange('items', copy);
                                  }}
                                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5"
                                  title="Move Down"
                                >
                                  <CaretDown size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = currentTestimonials.items.filter((_, i) => i !== idx);
                                  handleSectionChange('items', copy);
                                }}
                                className="text-red-400/60 hover:text-red-400 p-1 cursor-pointer ml-1"
                                title="Delete Review"
                              >
                                <Trash size={15} />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/50">Testimonial Quote</label>
                            <textarea
                              rows={3}
                              value={item.quote}
                              onChange={(e) => {
                                const copy = [...currentTestimonials.items];
                                copy[idx].quote = e.target.value;
                                handleSectionChange('items', copy);
                              }}
                              placeholder="Quote content..."
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-3 text-sm text-white/90 focus:border-[#c79c6e] focus:outline-none resize-none font-serif italic"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 items-end">
                            <div className="sm:col-span-4 flex flex-col gap-1">
                              <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/40">Name & Age</label>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => {
                                  const copy = [...currentTestimonials.items];
                                  copy[idx].name = e.target.value;
                                  handleSectionChange('items', copy);
                                }}
                                placeholder="Rohit, 32"
                                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#c79c6e]"
                              />
                            </div>
                            <div className="sm:col-span-4 flex flex-col gap-1">
                              <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/40">Profession / Role</label>
                              <input
                                type="text"
                                value={item.role}
                                onChange={(e) => {
                                  const copy = [...currentTestimonials.items];
                                  copy[idx].role = e.target.value;
                                  handleSectionChange('items', copy);
                                }}
                                placeholder="Entrepreneur"
                                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#c79c6e]"
                              />
                            </div>
                            <div className="sm:col-span-4 flex flex-col gap-1">
                              <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-[#c79c6e]">Profile Picture</label>
                              <div className="flex items-center gap-2">
                                {item.image ? (
                                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#c79c6e]/40 shrink-0 bg-black">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/40 text-xs font-serif font-medium">
                                    {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => triggerImageUpload(`testimonials.items.${idx}.image`)}
                                  className="flex-1 py-1.5 px-2 rounded bg-white/5 hover:bg-[#c79c6e]/15 border border-white/10 hover:border-[#c79c6e]/40 text-[0.72rem] text-white/80 hover:text-[#c79c6e] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  title="Upload Profile Photo (Under 200 KB)"
                                >
                                  <UploadSimple size={13} />
                                  <span className="truncate">{item.image ? 'Change' : 'Upload Photo'}</span>
                                </button>

                                {item.image && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copy = [...currentTestimonials.items];
                                      copy[idx] = { ...copy[idx], image: '' };
                                      handleSectionChange('items', copy);
                                    }}
                                    className="p-1.5 rounded text-red-400/60 hover:text-red-400 hover:bg-red-400/10 cursor-pointer"
                                    title="Remove Photo"
                                  >
                                    <Trash size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
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
                    maxSize="Under 2 MB"
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

              {/* Testimonials Typography & Font Size Control (Controls Home & Standalone Testimonials Page) */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                    <TextT size={18} weight="bold" />
                    <span>Testimonials Typography Controls (Home &amp; Testimonial Page)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSectionChange('eyebrowFontSize', 14);
                        handleSectionChange('headingFontSize', 56);
                        handleSectionChange('descriptionFontSize', 18);
                        handleSectionChange('cardQuoteFontSize', 16);
                        handleSectionChange('cardNameFontSize', 15);
                        handleSectionChange('cardRoleFontSize', 12);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[0.65rem] text-[#c79c6e] font-semibold transition-all cursor-pointer"
                      title="Reset all font sizes to default"
                    >
                      <ArrowCounterClockwise size={12} />
                      <span>Reset Sizes</span>
                    </button>
                    <span className="px-2 py-0.5 rounded bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.62rem] font-mono font-bold text-[#c79c6e]">
                      Live Synchronized Control
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* 1. Eyebrow */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">1. Tagline / Eyebrow</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {currentTestimonials.eyebrowFontSize || 14}px
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls top uppercase tagline ("REAL STORIES. REAL CHANGE.").
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSectionChange('eyebrowFontSize', Math.max(10, (currentTestimonials.eyebrowFontSize || 14) - 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <input
                        type="range"
                        min={10}
                        max={24}
                        step={1}
                        value={currentTestimonials.eyebrowFontSize || 14}
                        onChange={(e) => handleSectionChange('eyebrowFontSize', Number(e.target.value))}
                        className="flex-1 min-w-0 accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleSectionChange('eyebrowFontSize', Math.min(24, (currentTestimonials.eyebrowFontSize || 14) + 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[11, 12, 13, 14, 16, 18].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSectionChange('eyebrowFontSize', size)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            (currentTestimonials.eyebrowFontSize || 14) === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Main Heading */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">2. Main Heading</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {currentTestimonials.headingFontSize || 56}px
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls main serif title size ("Their words." / "Testimonials &amp; Stories").
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSectionChange('headingFontSize', Math.max(24, (currentTestimonials.headingFontSize || 56) - 2))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Decrease 2px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <input
                        type="range"
                        min={24}
                        max={90}
                        step={2}
                        value={currentTestimonials.headingFontSize || 56}
                        onChange={(e) => handleSectionChange('headingFontSize', Number(e.target.value))}
                        className="flex-1 min-w-0 accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleSectionChange('headingFontSize', Math.min(90, (currentTestimonials.headingFontSize || 56) + 2))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Increase 2px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[36, 44, 52, 56, 64, 72].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSectionChange('headingFontSize', size)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            (currentTestimonials.headingFontSize || 56) === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Description Subtitle */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">3. Subtitle / Description</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {currentTestimonials.descriptionFontSize || 18}px
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls sub-headline description paragraph font size.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSectionChange('descriptionFontSize', Math.max(12, (currentTestimonials.descriptionFontSize || 18) - 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <input
                        type="range"
                        min={12}
                        max={32}
                        step={1}
                        value={currentTestimonials.descriptionFontSize || 18}
                        onChange={(e) => handleSectionChange('descriptionFontSize', Number(e.target.value))}
                        className="flex-1 min-w-0 accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleSectionChange('descriptionFontSize', Math.min(32, (currentTestimonials.descriptionFontSize || 18) + 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[14, 16, 18, 20, 22, 24].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSectionChange('descriptionFontSize', size)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            (currentTestimonials.descriptionFontSize || 18) === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Card Quote Body */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">4. Card Quote Text</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {currentTestimonials.cardQuoteFontSize || 16}px
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls testimonial client quote text inside cards.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSectionChange('cardQuoteFontSize', Math.max(11, (currentTestimonials.cardQuoteFontSize || 16) - 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <input
                        type="range"
                        min={11}
                        max={26}
                        step={1}
                        value={currentTestimonials.cardQuoteFontSize || 16}
                        onChange={(e) => handleSectionChange('cardQuoteFontSize', Number(e.target.value))}
                        className="flex-1 min-w-0 accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleSectionChange('cardQuoteFontSize', Math.min(26, (currentTestimonials.cardQuoteFontSize || 16) + 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[13, 14, 15, 16, 17, 18].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSectionChange('cardQuoteFontSize', size)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            (currentTestimonials.cardQuoteFontSize || 16) === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Author Name */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">5. Author Name</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {currentTestimonials.cardNameFontSize || 15}px
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls client name &amp; age font size ("Rohit, 32").
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSectionChange('cardNameFontSize', Math.max(11, (currentTestimonials.cardNameFontSize || 15) - 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <input
                        type="range"
                        min={11}
                        max={24}
                        step={1}
                        value={currentTestimonials.cardNameFontSize || 15}
                        onChange={(e) => handleSectionChange('cardNameFontSize', Number(e.target.value))}
                        className="flex-1 min-w-0 accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleSectionChange('cardNameFontSize', Math.min(24, (currentTestimonials.cardNameFontSize || 15) + 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[13, 14, 15, 16, 17, 18].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSectionChange('cardNameFontSize', size)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            (currentTestimonials.cardNameFontSize || 15) === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 6. Author Role */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">6. Author Role</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {currentTestimonials.cardRoleFontSize || 12}px
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls client profession / role subtitle ("ENTREPRENEUR").
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSectionChange('cardRoleFontSize', Math.max(9, (currentTestimonials.cardRoleFontSize || 12) - 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <input
                        type="range"
                        min={9}
                        max={18}
                        step={1}
                        value={currentTestimonials.cardRoleFontSize || 12}
                        onChange={(e) => handleSectionChange('cardRoleFontSize', Number(e.target.value))}
                        className="flex-1 min-w-0 accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleSectionChange('cardRoleFontSize', Math.min(18, (currentTestimonials.cardRoleFontSize || 12) + 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[10, 11, 12, 13, 14, 15].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSectionChange('cardRoleFontSize', size)}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            (currentTestimonials.cardRoleFontSize || 12) === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Real-Time Canvas Preview of Testimonials */}
                <div className="bg-[#ede7d8] border border-black/10 rounded-xl p-6 text-[#111010] flex flex-col gap-6 shadow-inner select-none">
                  <div className="flex items-center justify-between pb-3 border-b border-black/10">
                    <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[#c9542f]">
                      Live Visual Canvas Preview (Home &amp; /testimonials Page)
                    </span>
                    <span className="text-[0.62rem] text-stone-500 font-mono">
                      Eyebrow: {currentTestimonials.eyebrowFontSize || 14}px • Title: {currentTestimonials.headingFontSize || 56}px • Sub: {currentTestimonials.descriptionFontSize || 18}px • Quote: {currentTestimonials.cardQuoteFontSize || 16}px
                    </span>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* Header Preview */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-[1.5px] w-5 bg-[#c9542f]" />
                        <span 
                          className="font-sans uppercase tracking-[0.22em] font-bold text-[#c9542f]"
                          style={{ fontSize: `${currentTestimonials.eyebrowFontSize || 14}px` }}
                        >
                          {currentTestimonials.eyebrowText || 'REAL STORIES. REAL CHANGE.'}
                        </span>
                      </div>
                      <h3 
                        className="font-serif text-[#111010] font-medium tracking-tight leading-[1.1]"
                        style={{ 
                          fontFamily: 'Fraunces, Georgia, serif',
                          fontSize: `${currentTestimonials.headingFontSize || 56}px` 
                        }}
                      >
                        {currentTestimonials.headingLine1 || 'Their words.'}{' '}
                        <span className="text-[#c9542f] not-italic font-medium">{currentTestimonials.headingAccent || 'Their transformation.'}</span>
                      </h3>
                      <p 
                        className="text-[#4a463e] font-serif leading-relaxed max-w-xl"
                        style={{ 
                          fontFamily: 'Fraunces, Georgia, serif',
                          fontSize: `${currentTestimonials.descriptionFontSize || 18}px` 
                        }}
                      >
                        {currentTestimonials.description || 'Real reflections and transformative journeys from people who decided to do the work.'}
                      </p>
                    </div>

                    {/* Testimonial Sample Card Preview */}
                    <div className="max-w-md bg-white/60 border border-black/10 rounded-2xl p-5 flex flex-col gap-3 shadow-xs">
                      <Quotes className="text-[#c9542f] text-2xl opacity-90" weight="fill" />
                      <p 
                        className="font-serif text-[#2b2723] font-light leading-relaxed"
                        style={{ fontSize: `${currentTestimonials.cardQuoteFontSize || 16}px` }}
                      >
                        "{(currentTestimonials.items?.[0]?.quote) || 'Aarkesh helped me see the patterns I was too close to notice. For the first time, I feel in control of my choices.'}"
                      </p>
                      <div className="flex items-center gap-3 pt-3 border-t border-black/8 mt-2">
                        <div className="w-9 h-9 rounded-full bg-[#c9542f] text-white flex items-center justify-center font-serif text-sm font-medium">
                          {(currentTestimonials.items?.[0]?.name?.charAt(0)) || 'R'}
                        </div>
                        <div className="flex flex-col">
                          <span 
                            className="font-sans text-[#111010] font-bold"
                            style={{ fontSize: `${currentTestimonials.cardNameFontSize || 15}px` }}
                          >
                            {(currentTestimonials.items?.[0]?.name) || 'Rohit, 32'}
                          </span>
                          <span 
                            className="font-sans text-[#7a756b] uppercase tracking-wider"
                            style={{ fontSize: `${currentTestimonials.cardRoleFontSize || 12}px` }}
                          >
                            {(currentTestimonials.items?.[0]?.role) || 'Entrepreneur'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================
              6. FINAL CALL TO ACTION
             ========================================================= */}
          {activeTab === 'cta' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <h2 className="font-serif text-2xl text-white">Final Call to Action Banner</h2>
                <p className="text-xs text-white/50">
                  Manage the bottom booking card, inspiring closing quotes, and background coffee/study visual (<strong className="text-[#c79c6e]">1920 × 1080 px, under 2 MB</strong>).
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
                    maxSize="Under 2 MB"
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

              {/* Home Section Typography & Font Size Control */}
              <TypographyControllerCard
                title="Final CTA Typography & Font Sizes (Home Exclusive)"
                eyebrowFontSize={currentCta.eyebrowFontSize}
                headingFontSize={currentCta.headingFontSize}
                descriptionFontSize={currentCta.descriptionFontSize}
                defaultEyebrowSize={14}
                defaultHeadingSize={64}
                defaultDescriptionSize={22}
                onEyebrowSizeChange={(val) => handleSectionChange('eyebrowFontSize', val)}
                onHeadingSizeChange={(val) => handleSectionChange('headingFontSize', val)}
                onDescriptionSizeChange={(val) => handleSectionChange('descriptionFontSize', val)}
                previewEyebrow={currentCta.eyebrowText || 'A CONVERSATION CAN CHANGE EVERYTHING'}
                previewHeading={currentCta.headingLine1 || 'Your next chapter'}
                previewAccent={currentCta.headingAccent || 'starts here.'}
                previewDescription={currentCta.description || "This is your space to be heard, understood, and guided forward. Let's create real change together."}
              />
            </div>
          )}

          {/* =========================================================
              7. FAQ SECTION
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

              {/* Home Section Typography & Font Size Control */}
              <TypographyControllerCard
                title="FAQ Section Typography & Font Sizes (Home Exclusive)"
                eyebrowFontSize={currentFaq.eyebrowFontSize}
                headingFontSize={currentFaq.headingFontSize}
                descriptionFontSize={currentFaq.descriptionFontSize}
                defaultEyebrowSize={14}
                defaultHeadingSize={56}
                defaultDescriptionSize={18}
                onEyebrowSizeChange={(val) => handleSectionChange('eyebrowFontSize', val)}
                onHeadingSizeChange={(val) => handleSectionChange('headingFontSize', val)}
                onDescriptionSizeChange={(val) => handleSectionChange('descriptionFontSize', val)}
                previewEyebrow={currentFaq.badgeText || 'FREQUENTLY ASKED QUESTIONS'}
                previewHeading={currentFaq.headingLine1 || 'Clarity before you begin.'}
                previewAccent={currentFaq.headingAccent || 'Everything you need to know.'}
                previewDescription={currentFaq.description || 'Have questions about starting your coaching journey? Here are straightforward answers.'}
              />
            </div>
          )}

          {/* =========================================================
              8. FOOTER SECTION
             ========================================================= */}
          {activeTab === 'footer' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex flex-col gap-1">
                  <h2 className="font-serif text-2xl text-white">Footer Section & Brand Settings</h2>
                  <p className="text-xs text-white/50">
                    Edit brand bio, contact email, copyright notice, and manage website footer columns & links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveFooterBrand}
                  disabled={isSavingFooter}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#c79c6e] text-black font-semibold rounded-xl hover:bg-[#c79c6e]/90 transition-colors text-xs disabled:opacity-50 shadow-lg cursor-pointer"
                >
                  <FloppyDisk size={16} weight="bold" />
                  {isSavingFooter ? 'Saving...' : 'Save Footer Settings'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Brand Text Form */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Brand Texts & Details</span>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Brand Tagline / Bio</label>
                      <textarea
                        rows={3}
                        value={footerBrandSettings.brandDescription}
                        onChange={(e) => setFooterBrandSettings({ ...footerBrandSettings, brandDescription: e.target.value })}
                        placeholder="Authentic 1-on-1 mentorship..."
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e] leading-relaxed resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Contact Email</label>
                        <input
                          type="email"
                          value={footerBrandSettings.brandEmail}
                          onChange={(e) => setFooterBrandSettings({ ...footerBrandSettings, brandEmail: e.target.value })}
                          placeholder="coaching@aarkeshgupta.com"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Copyright Notice</label>
                        <input
                          type="text"
                          value={footerBrandSettings.copyrightText}
                          onChange={(e) => setFooterBrandSettings({ ...footerBrandSettings, copyrightText: e.target.value })}
                          placeholder="© 2026 Better With Aarkesh. All rights reserved."
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media Quick View */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Active Social Media Links</span>
                      <Link
                        to="/footer-documents?tab=brand"
                        className="text-xs text-[#c79c6e] hover:underline flex items-center gap-1 font-medium"
                      >
                        Manage Social Links <ArrowRight size={14} />
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {footerSocials.length > 0 ? (
                        footerSocials.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80">
                            <ShareNetwork size={14} className="text-[#c79c6e]" />
                            <span className="capitalize">{s.platform || s.label}</span>
                            <span className="text-[10px] text-white/40">({s.isActive !== false ? 'Live' : 'Hidden'})</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-white/40 italic">No custom social links added yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Footer Columns & Advanced Management Hub */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">Website Footer Columns</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                        {footerColumns.length} Columns
                      </span>
                    </div>

                    <div className="space-y-3">
                      {footerColumns.map((col, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</span>
                            <span className="text-[10px] text-white/40">{(col.links || []).length} Links</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(col.links || []).map((l, lIdx) => {
                              const cleanSlug = (l.url || '').replace(/^\/+/, '');
                              return (
                                <Link
                                  key={lIdx}
                                  to={`/footer-documents?edit=${encodeURIComponent(cleanSlug || l.label)}`}
                                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#c79c6e]/20 border border-white/10 hover:border-[#c79c6e]/40 text-white/70 hover:text-[#c79c6e] transition-all flex items-center gap-1.5 group/l shadow-xs"
                                  title={`Click to edit "${l.label}" in Footer Documents`}
                                >
                                  <span className="truncate max-w-[140px]">{l.label}</span>
                                  <Pen size={11} className="text-white/30 group-hover/l:text-[#c79c6e] shrink-0" />
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <Link
                        to="/footer-documents?edit=contact-us"
                        className="w-full py-2.5 px-4 rounded-xl bg-[#c79c6e]/10 hover:bg-[#c79c6e]/20 border border-[#c79c6e]/30 text-[#c79c6e] text-xs font-semibold flex items-center justify-between transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <Pen size={14} />
                          <span>Edit Contact Us Page</span>
                        </span>
                        <span>→</span>
                      </Link>

                      <Link
                        to="/footer-documents"
                        className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-[#c79c6e]/15 border border-white/10 hover:border-[#c79c6e]/40 text-white hover:text-[#c79c6e] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                      >
                        <FolderOpen size={16} />
                        <span>Open Advanced Footer & Static Page Editor →</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── FOOTER TYPOGRAPHY & FONT SIZE CONTROL CARD ─── */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <TextT size={18} weight="bold" className="text-[#c79c6e]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Footer Typography &amp; Font Sizes (Universal)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFooterBrandSettings(prev => ({
                          ...prev,
                          columnTitleFontSize: 14,
                          bioFontSize: 16,
                          linksFontSize: 16,
                          brandTitleFontSize: 36,
                          copyrightFontSize: 14,
                        }));
                        showToast('Reset footer font sizes to recommended defaults (14px / 16px / 16px / 36px / 14px)', 'info');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all cursor-pointer"
                    >
                      <ArrowCounterClockwise size={13} />
                      <span>Reset Defaults</span>
                    </button>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.65rem] font-bold text-[#c79c6e] tracking-wider uppercase">
                      Live Control
                    </span>
                  </div>
                </div>

                {/* 5 Controls Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  
                  {/* 1. Column Headings */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                        1. Column Titles
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {footerBrandSettings.columnTitleFontSize || 14}px
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls COMPANY, LEGAL, QUICK LINKS header font sizes.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFooterBrandSettings(prev => ({ ...prev, columnTitleFontSize: Math.max(10, (prev.columnTitleFontSize || 14) - 1) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <input
                        type="range"
                        min={10}
                        max={24}
                        step={1}
                        value={footerBrandSettings.columnTitleFontSize || 14}
                        onChange={(e) => setFooterBrandSettings({ ...footerBrandSettings, columnTitleFontSize: Number(e.target.value) })}
                        className="flex-1 min-w-0 accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFooterBrandSettings(prev => ({ ...prev, columnTitleFontSize: Math.min(24, (prev.columnTitleFontSize || 14) + 1) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[11, 12, 13, 14, 16, 18].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFooterBrandSettings({ ...footerBrandSettings, columnTitleFontSize: size })}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            (footerBrandSettings.columnTitleFontSize || 14) === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Brand Bio */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                        2. Brand Bio / Email
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {footerBrandSettings.bioFontSize || 16}px
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls brand tagline description &amp; email copy text size.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFooterBrandSettings(prev => ({ ...prev, bioFontSize: Math.max(12, (prev.bioFontSize || 16) - 1) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <input
                        type="range"
                        min={12}
                        max={26}
                        step={1}
                        value={footerBrandSettings.bioFontSize || 16}
                        onChange={(e) => setFooterBrandSettings({ ...footerBrandSettings, bioFontSize: Number(e.target.value) })}
                        className="flex-1 min-w-0 accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFooterBrandSettings(prev => ({ ...prev, bioFontSize: Math.min(26, (prev.bioFontSize || 16) + 1) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[14, 15, 16, 17, 18, 20].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFooterBrandSettings({ ...footerBrandSettings, bioFontSize: size })}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            (footerBrandSettings.bioFontSize || 16) === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Column Links */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                        3. Footer Links
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {footerBrandSettings.linksFontSize || 16}px
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls all navigational &amp; policy link item font sizes.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFooterBrandSettings(prev => ({ ...prev, linksFontSize: Math.max(12, (prev.linksFontSize || 16) - 1) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <input
                        type="range"
                        min={12}
                        max={26}
                        step={1}
                        value={footerBrandSettings.linksFontSize || 16}
                        onChange={(e) => setFooterBrandSettings({ ...footerBrandSettings, linksFontSize: Number(e.target.value) })}
                        className="flex-1 min-w-0 accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFooterBrandSettings(prev => ({ ...prev, linksFontSize: Math.min(26, (prev.linksFontSize || 16) + 1) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[13, 14, 15, 16, 18, 20].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFooterBrandSettings({ ...footerBrandSettings, linksFontSize: size })}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            (footerBrandSettings.linksFontSize || 16) === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Brand Logo / Title */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                        4. Brand Logo Title
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {footerBrandSettings.brandTitleFontSize || 36}px
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls main "BetterWith Aarkesh" logo title size.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFooterBrandSettings(prev => ({ ...prev, brandTitleFontSize: Math.max(20, (prev.brandTitleFontSize || 36) - 2) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Decrease 2px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <input
                        type="range"
                        min={20}
                        max={56}
                        step={1}
                        value={footerBrandSettings.brandTitleFontSize || 36}
                        onChange={(e) => setFooterBrandSettings({ ...footerBrandSettings, brandTitleFontSize: Number(e.target.value) })}
                        className="flex-1 min-w-0 accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFooterBrandSettings(prev => ({ ...prev, brandTitleFontSize: Math.min(56, (prev.brandTitleFontSize || 36) + 2) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Increase 2px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[28, 32, 36, 40, 44, 48].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFooterBrandSettings({ ...footerBrandSettings, brandTitleFontSize: size })}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            (footerBrandSettings.brandTitleFontSize || 36) === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Copyright Notice */}
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                        5. Copyright Text
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                        {footerBrandSettings.copyrightFontSize || 14}px
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-white/40 leading-relaxed">
                      Controls bottom copyright text font size.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFooterBrandSettings(prev => ({ ...prev, copyrightFontSize: Math.max(10, (prev.copyrightFontSize || 14) - 1) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Decrease 1px"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <input
                        type="range"
                        min={10}
                        max={22}
                        step={1}
                        value={footerBrandSettings.copyrightFontSize || 14}
                        onChange={(e) => setFooterBrandSettings({ ...footerBrandSettings, copyrightFontSize: Number(e.target.value) })}
                        className="flex-1 min-w-0 accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFooterBrandSettings(prev => ({ ...prev, copyrightFontSize: Math.min(22, (prev.copyrightFontSize || 14) + 1) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#c79c6e] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                        title="Increase 1px"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                      {[11, 12, 13, 14, 15, 16].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFooterBrandSettings({ ...footerBrandSettings, copyrightFontSize: size })}
                          className={`text-[0.65rem] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            (footerBrandSettings.copyrightFontSize || 14) === size
                              ? 'bg-[#c79c6e] text-black font-bold shadow'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Live Real-Time Canvas Preview of Footer with Applied Sizes */}
                <div className="bg-[#ede7d8] border border-black/10 rounded-xl p-6 text-[#111010] flex flex-col gap-6 shadow-inner select-none">
                  <div className="flex items-center justify-between pb-3 border-b border-black/10">
                    <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[#c9542f]">
                      Live Visual Canvas Preview (Footer)
                    </span>
                    <span className="text-[0.62rem] text-stone-500 font-mono">
                      Title: {footerBrandSettings.brandTitleFontSize || 36}px • Bio: {footerBrandSettings.bioFontSize || 16}px • Columns: {footerBrandSettings.columnTitleFontSize || 14}px • Links: {footerBrandSettings.linksFontSize || 16}px • Copy: {footerBrandSettings.copyrightFontSize || 14}px
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left Col: Brand & Bio */}
                    <div className="md:col-span-6 flex flex-col items-start gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#fbf0eb] border border-[#e8c4e2] flex items-center justify-center text-[#c9542f]">
                          <Sparkle size={16} weight="fill" />
                        </div>
                        <span 
                          className="font-serif text-[#111010] tracking-tight leading-none"
                          style={{ fontSize: `${footerBrandSettings.brandTitleFontSize || 36}px` }}
                        >
                          BetterWith<em className="text-[#c9542f] not-italic font-normal ml-0.5" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Aarkesh</em>
                        </span>
                      </div>

                      <p 
                        className="font-sans text-[#4a463e] font-normal leading-relaxed max-w-md"
                        style={{ fontSize: `${footerBrandSettings.bioFontSize || 16}px` }}
                      >
                        {footerBrandSettings.brandDescription || 'Authentic 1-on-1 mentorship, transformational coaching & self-mastery courses.'}
                      </p>

                      <div 
                        className="flex items-center gap-2 text-[#2b2723] font-medium"
                        style={{ fontSize: `${footerBrandSettings.bioFontSize || 16}px` }}
                      >
                        <span className="text-[#c9542f]">✉</span>
                        <span>{footerBrandSettings.brandEmail || 'coaching@aarkeshgupta.com'}</span>
                      </div>
                    </div>

                    {/* Right Columns: Categories & Links */}
                    <div className="md:col-span-6 grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <h4 
                          className="font-sans uppercase tracking-[0.22em] font-bold text-[#c9542f]"
                          style={{ fontSize: `${footerBrandSettings.columnTitleFontSize || 14}px` }}
                        >
                          COMPANY
                        </h4>
                        <ul 
                          className="flex flex-col gap-1 text-[#2b2723]"
                          style={{ fontSize: `${footerBrandSettings.linksFontSize || 16}px` }}
                        >
                          <li>About Us</li>
                          <li>Contact Us</li>
                        </ul>
                      </div>

                      <div className="flex flex-col gap-2">
                        <h4 
                          className="font-sans uppercase tracking-[0.22em] font-bold text-[#c9542f]"
                          style={{ fontSize: `${footerBrandSettings.columnTitleFontSize || 14}px` }}
                        >
                          QUICK LINKS
                        </h4>
                        <ul 
                          className="flex flex-col gap-1 text-[#2b2723]"
                          style={{ fontSize: `${footerBrandSettings.linksFontSize || 16}px` }}
                        >
                          <li>Home</li>
                          <li>Coaching</li>
                          <li>Library</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Copyright Bar */}
                  <div className="pt-4 border-t border-black/10 text-center">
                    <p 
                      className="text-[#6b665d] font-sans"
                      style={{ fontSize: `${footerBrandSettings.copyrightFontSize || 14}px` }}
                    >
                      {footerBrandSettings.copyrightText || '© 2026 Better With Aarkesh. All rights reserved.'}
                    </p>
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
