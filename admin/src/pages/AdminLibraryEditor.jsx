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
  FolderOpen,
  Plus,
  MagnifyingGlass,
  Pen,
  Trash,
  X,
  Sparkle,
  Article,
  Quotes,
  CaretRight,
  CaretUp,
  CaretDown,
  ArrowLeft,
  BookOpen,
  Play,
  TextAa,
  ListPlus,
  TextB,
  TextItalic,
  TextT,
  DotsSixVertical
} from '@phosphor-icons/react';

// Default library hero background asset
import defaultHeroBg from '../../../client/src/assets/PerspectivePage/Page1.webp';
import { CURATED_LIBRARY_ARTICLES } from '../../../client/src/constants/libraryArticlesData';
import TiptapEditor from '../components/ui/TiptapEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to resolve backend upload URLs (/uploads/...) to full API URL
export function resolveImageUrl(url, fallback = '') {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return `${API_URL}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${API_URL}/${url}`;
  }
  return url;
}

const SIDEBAR_TABS = [
  {
    id: 'directory',
    label: 'Library Section',
    icon: <FolderOpen size={18} />,
    description: 'Section heading texts, search bar & full article library manager'
  },
  {
    id: 'formatExplore',
    label: 'Explore by Format',
    icon: <Sparkle size={18} />,
    description: 'Headlines, descriptions & 3 format cards (Latest, Read, Watch)'
  }
];

// Helper function to render gold italic highlight, bold, and larger text formatting
export function renderFormattedTitle(text) {
  if (!text || typeof text !== 'string') return text;

  // Function to recursively parse formatting tokens
  const parseTokens = (str, keyPrefix = 'rt') => {
    if (!str) return [];
    
    // Match bold (**...**), extra large (++...++), large (+...+), gold italic (*...* or [...]), italic (_..._)
    const tokenRegex = /(\*\*(.+?)\*\*|\+\+([^+]+?)\+\+|\+([^+]+?)\+|\*([^*]+?)\*|\[([^\]]+?)\]|_([^_]+?)_)/g;
    
    const elements = [];
    let lastIndex = 0;
    let match;
    let count = 0;

    while ((match = tokenRegex.exec(str)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        elements.push(str.substring(lastIndex, matchIndex));
      }

      const raw = match[0];
      const key = `${keyPrefix}-${count++}`;

      if (raw.startsWith('**') && raw.endsWith('**')) {
        const inner = raw.slice(2, -2);
        elements.push(
          <strong key={key} className="text-white font-bold font-serif">
            {parseTokens(inner, key)}
          </strong>
        );
      } else if (raw.startsWith('++') && raw.endsWith('++')) {
        const inner = raw.slice(2, -2);
        elements.push(
          <span key={key} className="text-2xl sm:text-3xl text-white font-serif leading-relaxed font-normal">
            {parseTokens(inner, key)}
          </span>
        );
      } else if (raw.startsWith('+') && raw.endsWith('+')) {
        const inner = raw.slice(1, -1);
        elements.push(
          <span key={key} className="text-xl sm:text-2xl text-white font-serif leading-relaxed font-normal">
            {parseTokens(inner, key)}
          </span>
        );
      } else if ((raw.startsWith('*') && raw.endsWith('*')) || (raw.startsWith('[') && raw.endsWith(']'))) {
        const inner = raw.slice(1, -1);
        elements.push(
          <span key={key} className="italic text-[#c79c6e] font-serif font-normal">
            {parseTokens(inner, key)}
          </span>
        );
      } else if (raw.startsWith('_') && raw.endsWith('_')) {
        const inner = raw.slice(1, -1);
        elements.push(
          <em key={key} className="italic text-white/95 font-serif font-normal">
            {parseTokens(inner, key)}
          </em>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < str.length) {
      elements.push(str.substring(lastIndex));
    }

    return elements.length > 0 ? elements : str;
  };

  return parseTokens(text);
}

export const DEFAULT_DIRECTORY_CATEGORIES = [
  { id: 'relationships', key: 'RELATIONSHIPS', num: '01', title: 'Relationships', subtitle: 'On love, friendship and what it means to stay close.' },
  { id: 'self', key: 'SELF', num: '02', title: 'Self', subtitle: 'On identity, self-trust and becoming a steadier you.' },
  { id: 'change', key: 'CHANGE', num: '03', title: 'Change', subtitle: 'On letting go, starting over and becoming who you want to be.' },
  { id: 'decisions', key: 'DECISIONS', num: '04', title: 'Decisions', subtitle: 'On better thinking, trade-offs and choosing a life you mean.' },
  { id: 'difficult-people', key: 'DIFFICULT PEOPLE', num: '05', title: 'Difficult People', subtitle: 'On boundaries, perspective and dealing with the hard ones.' },
  { id: 'communication', key: 'COMMUNICATION', num: '06', title: 'Communication', subtitle: 'On saying what matters, listening and being understood.' },
];

const CATEGORIES_LIST = [
  { id: 'RELATIONSHIPS', label: '01 Relationships', num: '01 / 06' },
  { id: 'SELF', label: '02 Self', num: '02 / 06' },
  { id: 'CHANGE', label: '03 Change', num: '03 / 06' },
  { id: 'DECISIONS', label: '04 Decisions', num: '04 / 06' },
  { id: 'DIFFICULT PEOPLE', label: '05 Difficult People', num: '05 / 06' },
  { id: 'COMMUNICATION', label: '06 Communication', num: '06 / 06' },
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

const DEFAULT_DIRECTORY = {
  eyebrowText: 'IDEAS FOR A MORE THOUGHTFUL LIFE',
  headingText: 'Library',
  description: 'A collection of ideas about how we think, relate, choose and change.',
  searchPlaceholder: "Describe what you're facing...",
  quoteText: '“A quieter mind builds a braver, kinder life.”',
  quoteAuthor: '— Aarkesh Gupta',
  categories: DEFAULT_DIRECTORY_CATEGORIES
};

const DEFAULT_FORMAT_EXPLORE = {
  eyebrowText: 'EXPLORE BY FORMAT',
  headingLine1: 'Choose the form that',
  headingLine2: 'meets you where you are.',
  latestCardTitle: 'LATEST',
  latestCardSubtitle: 'NEW ARRIVALS',
  latestCardDesc: 'The most recent\narticles and videos.',
  readCardTitle: 'READ',
  readCardSubtitle: '18 ARTICLES',
  readCardDesc: 'Ideas to sit with at\nyour own pace.',
  watchCardTitle: 'WATCH',
  watchCardSubtitle: '10 VIDEOS',
  watchCardDesc: 'Perspectives spoken\nand explored.',
  showWatchCard: true,
  showSection: true
};

const SAMPLE_EDITORIAL_BLOCKS = [
  {
    id: 'block-dropcap-1',
    type: 'dropCap',
    letter: 'W',
    text: 'e like to think love is unmistakable. You feel it, you know it, and it stays.'
  },
  {
    id: 'block-p-1',
    type: 'paragraphs',
    text: 'But in reality, what often feels like love is attention. A few consistent messages. Someone who listens. A little curiosity about your day. Suddenly, it feels significant. It feels intimate. It feels like they care.\n\nBut attention and love are not the same thing.'
  },
  {
    id: 'block-heading-1',
    type: 'heading',
    text: 'Why Attention Feels Like *Love*'
  },
  {
    id: 'block-p-2',
    type: 'paragraphs',
    text: 'Humans are wired for connection. Attention activates the same reward pathways in the brain as food, touch and other forms of pleasure. When someone pays attention to us, especially in a world where most people are distracted, it feels good. Really good.\n\nIt can feel like we’ve been seen. Chosen. Understood.\n\nBut here’s the catch: attention is about the present. Love is about the future.'
  },
  {
    id: 'block-callout-1',
    type: 'callout',
    line1: 'Attention says, “You’re interesting.”',
    line2: 'Love says, “I’m in this with you.”'
  },
  {
    id: 'block-p-3',
    type: 'paragraphs',
    text: 'Attention comes and goes based on mood, novelty and convenience. Love stays even when the novelty fades, when things get uncomfortable, and when effort is required.\n\nThe confusion happens because attention is often the first step toward love. It’s the doorway. But walking through the door and staying inside the room are two very different things.'
  }
];

const SAMPLE_EDITORIAL_ARTICLE = {
  id: 'rel-sample-' + Date.now(),
  slug: 'attention-feels-like-love',
  category: 'RELATIONSHIPS',
  categoryNum: '01 / 06',
  date: '12 SEP 2026',
  title: 'Attention Feels Like *Love* (But Isn’t)',
  subtitle: 'Why attention can feel intimate, why it makes us vulnerable, and how to recognize when presence is merely entertaining rather than enduring.',
  quote: '“Attention is a moment. Love is an enduring choice.”',
  image: '/library_preview_silhouette.jpg',
  blocks: SAMPLE_EDITORIAL_BLOCKS,
  dropCap: 'W',
  dropCapText: 'e like to think love is unmistakable. You feel it, you know it, and it stays.',
};

// Helper to get auto-formatted current publication date (e.g. "23 SEP 2026")
export const getAutoPublicationDate = () => {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

const emptyArticleForm = {
  id: '',
  slug: '',
  category: 'RELATIONSHIPS',
  categoryNum: '01 / 06',
  date: getAutoPublicationDate(),
  title: '',
  subtitle: '',
  excerpt: '',
  highlightText: '',
  quote: '',
  image: '',
  blocks: [
    {
      id: 'block-dropcap-' + Date.now(),
      type: 'dropCap',
      letter: 'W',
      text: ''
    },
    {
      id: 'block-p-' + (Date.now() + 1),
      type: 'paragraphs',
      text: ''
    }
  ],
  dropCap: '',
  dropCapText: '',
  paragraphsAfterDropCap: [],
  sections: []
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
  const displayImage = resolveImageUrl(imageUrl || fallbackUrl);

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

      {extraControls}
    </div>
  );
}

export default function AdminLibraryEditor() {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab');
      if (tabFromUrl && ['directory', 'formatExplore'].includes(tabFromUrl)) {
        return tabFromUrl;
      }
      const savedTab = localStorage.getItem('bwa_admin_library_tab');
      if (savedTab && ['directory', 'formatExplore'].includes(savedTab)) {
        return savedTab;
      }
    } catch (e) {}
    return 'directory';
  });

  const [allSections, setAllSections] = useState({
    hero: { ...DEFAULT_HERO },
    directory: { ...DEFAULT_DIRECTORY },
    formatExplore: { ...DEFAULT_FORMAT_EXPLORE }
  });

  const [articlesList, setArticlesList] = useState(CURATED_LIBRARY_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const catFromUrl = params.get('category');
      if (catFromUrl) return catFromUrl;
      const savedCat = localStorage.getItem('bwa_admin_library_cat');
      if (savedCat) return savedCat;
    } catch (e) {}
    return 'relationships';
  });
  const [articleSearch, setArticleSearch] = useState('');

  // Persist tab and category to localStorage and URL on change
  useEffect(() => {
    try {
      localStorage.setItem('bwa_admin_library_tab', activeTab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem('bwa_admin_library_cat', selectedCategory);
      const url = new URL(window.location.href);
      url.searchParams.set('category', selectedCategory);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [selectedCategory]);

  // Video Management State for Card 3 (Watch)
  const [libraryVideos, setLibraryVideos] = useState([]);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    duration: '8 MIN',
    videoUrl: '',
    thumbnailUrl: '',
    description: '',
    muxUploadId: '',
    muxAssetId: '',
    muxPlaybackId: '',
    status: 'Published'
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadStatusText, setVideoUploadStatusText] = useState('');
  const [isVideoSaving, setIsVideoSaving] = useState(false);
  const [previewingVideo, setPreviewingVideo] = useState(null);
  const videoFileInputRef = useRef(null);
  const videoThumbInputRef = useRef(null);

  // Handle Category Info Field Change (num, title, subtitle)
  const handleCategoryInfoChange = (categoryId, field, value) => {
    setAllSections(prev => {
      const currentCats = prev.directory?.categories && prev.directory.categories.length > 0 
        ? prev.directory.categories 
        : DEFAULT_DIRECTORY_CATEGORIES;
      const updatedCats = currentCats.map(c => 
        ((c.id || '').toLowerCase() === (categoryId || '').toLowerCase() || (c.key || '').toLowerCase() === (categoryId || '').toLowerCase())
          ? { ...c, [field]: value }
          : c
      );
      return {
        ...prev,
        directory: {
          ...prev.directory,
          categories: updatedCats
        }
      };
    });
  };

  // Save Category Settings to Backend
  const handleSaveCategorySettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/library-settings/directory`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(allSections.directory)
      });
      if (res.ok) {
        showToast('Category details updated & saved live!', 'success');
      } else {
        showToast('Failed to save category details', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving category details', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Add New Category
  const handleCreateCategory = () => {
    const currentCats = allSections.directory?.categories && allSections.directory.categories.length > 0 
      ? [...allSections.directory.categories] 
      : [...DEFAULT_DIRECTORY_CATEGORIES];

    const nextIndex = currentCats.length + 1;
    const nextNum = nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`;
    const newCatId = `category-${Date.now()}`;
    const newCategory = {
      id: newCatId,
      key: `CATEGORY_${nextIndex}`,
      num: nextNum,
      title: `New Category ${nextIndex}`,
      subtitle: 'Description of this new category topic and focus area.',
    };

    const updatedCats = [...currentCats, newCategory];

    setAllSections(prev => ({
      ...prev,
      directory: {
        ...prev.directory,
        categories: updatedCats
      }
    }));

    setSelectedCategory(newCatId);
    showToast(`Created category #${nextNum}. Remember to click "Save Category Info".`, 'info');
  };

  // Delete Category
  const handleDeleteCategory = (catId) => {
    const currentCats = allSections.directory?.categories && allSections.directory.categories.length > 0 
      ? [...allSections.directory.categories] 
      : [...DEFAULT_DIRECTORY_CATEGORIES];

    if (currentCats.length <= 1) {
      showToast('You must keep at least one category in the library.', 'error');
      return;
    }

    const target = currentCats.find(c => c.id === catId || c.key === catId);
    if (window.confirm(`Are you sure you want to remove the "${target?.title || 'Category'}" category?`)) {
      const updatedCats = currentCats.filter(c => c.id !== catId && c.key !== catId);
      
      setAllSections(prev => ({
        ...prev,
        directory: {
          ...prev.directory,
          categories: updatedCats
        }
      }));

      if (selectedCategory === catId || selectedCategory === target?.key) {
        setSelectedCategory(updatedCats[0]?.id || updatedCats[0]?.key || 'relationships');
      }

      showToast('Category removed from list. Click "Save Category Info" to persist.', 'info');
    }
  };

  // Drag & Drop for Categories in Left Sidebar
  const [draggedCatIndex, setDraggedCatIndex] = useState(null);
  const [dragOverCatIndex, setDragOverCatIndex] = useState(null);

  const handleDragStartCat = (e, index) => {
    e.dataTransfer.setData('text/plain', String(index));
    setDraggedCatIndex(index);
  };

  const handleDragOverCat = (e, index) => {
    e.preventDefault();
    if (dragOverCatIndex !== index) {
      setDragOverCatIndex(index);
    }
  };

  const handleDropCat = (e, targetIndex) => {
    e.preventDefault();
    if (draggedCatIndex === null || draggedCatIndex === targetIndex) {
      setDraggedCatIndex(null);
      setDragOverCatIndex(null);
      return;
    }

    const currentCats = allSections.directory?.categories && allSections.directory.categories.length > 0 
      ? [...allSections.directory.categories] 
      : [...DEFAULT_DIRECTORY_CATEGORIES];

    const reordered = [...currentCats];
    const [movedItem] = reordered.splice(draggedCatIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    // Auto-resequence numbers in sequential order: 01, 02, 03...
    const resequenced = reordered.map((cat, idx) => {
      const numStr = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
      return {
        ...cat,
        num: numStr
      };
    });

    setAllSections(prev => ({
      ...prev,
      directory: {
        ...prev.directory,
        categories: resequenced
      }
    }));

    setDraggedCatIndex(null);
    setDragOverCatIndex(null);
    showToast('Categories reordered & renumbered (01, 02...)! Click "Save Category Info" to persist.', 'info');
  };

  const handleDragEndCat = () => {
    setDraggedCatIndex(null);
    setDragOverCatIndex(null);
  };

  const handleMoveCategory = (currIndex, direction) => {
    const targetIndex = direction === 'up' ? currIndex - 1 : currIndex + 1;
    const currentCats = allSections.directory?.categories && allSections.directory.categories.length > 0 
      ? [...allSections.directory.categories] 
      : [...DEFAULT_DIRECTORY_CATEGORIES];

    if (targetIndex < 0 || targetIndex >= currentCats.length) return;

    const reordered = [...currentCats];
    const [movedItem] = reordered.splice(currIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    const resequenced = reordered.map((cat, idx) => ({
      ...cat,
      num: idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`
    }));

    setAllSections(prev => ({
      ...prev,
      directory: {
        ...prev.directory,
        categories: resequenced
      }
    }));

    showToast('Category moved & renumbered!', 'info');
  };

  // Drag & Drop for Articles within Active Category
  const [draggedArtIndex, setDraggedArtIndex] = useState(null);
  const [dragOverArtIndex, setDragOverArtIndex] = useState(null);

  const handleDragStartArt = (e, index) => {
    e.dataTransfer.setData('text/plain', String(index));
    setDraggedArtIndex(index);
  };

  const handleDragOverArt = (e, index) => {
    e.preventDefault();
    if (dragOverArtIndex !== index) {
      setDragOverArtIndex(index);
    }
  };

  const handleDropArt = (e, targetIndex, currentCategoryArticles, activeCatObj) => {
    e.preventDefault();
    if (draggedArtIndex === null || draggedArtIndex === targetIndex) {
      setDraggedArtIndex(null);
      setDragOverArtIndex(null);
      return;
    }

    const reorderedCategoryArticles = [...currentCategoryArticles];
    const [movedArticle] = reorderedCategoryArticles.splice(draggedArtIndex, 1);
    reorderedCategoryArticles.splice(targetIndex, 0, movedArticle);

    // Update full articles list placing reordered active category articles first
    setArticlesList(prev => {
      const otherArticles = prev.filter(a => {
        const aCat = (a.categoryId || a.category || '').toLowerCase();
        const targetId = (activeCatObj.id || '').toLowerCase();
        const targetKey = (activeCatObj.key || '').toLowerCase();
        const targetTitle = (activeCatObj.title || '').toLowerCase();
        return !(aCat === targetId || aCat === targetKey || aCat === targetTitle);
      });
      return [...reorderedCategoryArticles, ...otherArticles];
    });

    setDraggedArtIndex(null);
    setDragOverArtIndex(null);
    showToast('Article order updated!', 'success');
  };

  const handleDragEndArt = () => {
    setDraggedArtIndex(null);
    setDragOverArtIndex(null);
  };

  const handleMoveArticle = (currIndex, direction, currentCategoryArticles, activeCatObj) => {
    const targetIndex = direction === 'up' ? currIndex - 1 : currIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentCategoryArticles.length) return;

    const reorderedCategoryArticles = [...currentCategoryArticles];
    const [movedArticle] = reorderedCategoryArticles.splice(currIndex, 1);
    reorderedCategoryArticles.splice(targetIndex, 0, movedArticle);

    setArticlesList(prev => {
      const otherArticles = prev.filter(a => {
        const aCat = (a.categoryId || a.category || '').toLowerCase();
        const targetId = (activeCatObj.id || '').toLowerCase();
        const targetKey = (activeCatObj.key || '').toLowerCase();
        const targetTitle = (activeCatObj.title || '').toLowerCase();
        return !(aCat === targetId || aCat === targetKey || aCat === targetTitle);
      });
      return [...reorderedCategoryArticles, ...otherArticles];
    });
  };
  
  // Editorial Article Studio State
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [articleForm, setArticleForm] = useState(emptyArticleForm);
  const [editorViewMode, setEditorViewMode] = useState('editor'); // 'editor' | 'preview' | 'split'

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
    fetchArticles();
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/videos`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setLibraryVideos(data);
      }
    } catch (err) {
      console.log('Error fetching videos');
    }
  };

  const handleVideoUrlChange = (url) => {
    let autoThumb = '';
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const ytId = ytMatch[1];
      autoThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    setVideoForm(prev => ({
      ...prev,
      videoUrl: url,
      thumbnailUrl: autoThumb || prev.thumbnailUrl
    }));
  };

  const handleOpenCreateVideo = () => {
    setVideoForm({
      title: '',
      duration: '8 MIN',
      videoUrl: '',
      thumbnailUrl: '',
      description: '',
      muxUploadId: '',
      muxAssetId: '',
      muxPlaybackId: '',
      status: 'Published'
    });
    setEditingVideoId(null);
    setVideoFile(null);
    setVideoUploadProgress(0);
    setVideoUploadStatusText('');
    setIsEditingVideo(true);
  };

  const handleEditVideo = (vid) => {
    setVideoForm({
      title: vid.title || '',
      duration: vid.duration || '8 MIN',
      videoUrl: vid.videoUrl || '',
      thumbnailUrl: vid.thumbnailUrl || '',
      description: vid.description || '',
      muxUploadId: vid.muxUploadId || '',
      muxAssetId: vid.muxAssetId || '',
      muxPlaybackId: vid.muxPlaybackId || '',
      status: vid.status || 'Published'
    });
    setEditingVideoId(vid._id || vid.id);
    setVideoFile(null);
    setVideoUploadProgress(0);
    setVideoUploadStatusText('');
    setIsEditingVideo(true);
  };

  const handleSaveVideo = async (e) => {
    e?.preventDefault();
    if (!videoForm.title.trim()) {
      showToast('Video title is required', 'error');
      return;
    }

    if (!videoFile && !videoForm.videoUrl && !videoForm.muxPlaybackId && !editingVideoId) {
      showToast('Please select a video file for Mux or provide a video link', 'error');
      return;
    }

    try {
      setIsVideoSaving(true);
      const token = localStorage.getItem('adminToken');
      let muxUploadId = videoForm.muxUploadId || '';
      let muxAssetId = videoForm.muxAssetId || '';
      let muxPlaybackId = videoForm.muxPlaybackId || '';
      let autoDuration = videoForm.duration || '8 MIN';
      let autoThumbnail = videoForm.thumbnailUrl || '';

      // Direct upload video to Mux
      if (videoFile) {
        setVideoUploadProgress(5);
        setVideoUploadStatusText('Step 1/3: Requesting secure Mux upload URL...');
        
        let uploadUrlRes = await fetch(`${API_URL}/api/videos/mux-upload-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
        });

        if (!uploadUrlRes.ok) {
          // Fallback to course admin mux upload route
          uploadUrlRes = await fetch(`${API_URL}/api/admin/courses/mux/upload-url`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
          });
        }

        const rawUploadText = await uploadUrlRes.text();
        let uploadData;
        try {
          uploadData = JSON.parse(rawUploadText);
        } catch (err) {
          throw new Error('Server returned non-JSON response. Please ensure backend server is restarted.');
        }

        if (!uploadUrlRes.ok || !uploadData.uploadUrl) {
          throw new Error(uploadData.message || 'Could not start Mux direct upload. Please check Mux credentials.');
        }

        muxUploadId = uploadData.uploadId;
        setVideoUploadProgress(10);
        setVideoUploadStatusText('Step 2/3: Uploading video file to Mux...');

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadData.uploadUrl, true);
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const pct = 10 + Math.round((event.loaded / event.total) * 75);
              setVideoUploadProgress(pct);
              const mbUploaded = (event.loaded / (1024 * 1024)).toFixed(1);
              const mbTotal = (event.total / (1024 * 1024)).toFixed(1);
              setVideoUploadStatusText(`Step 2/3: Uploading to Mux: ${pct}% (${mbUploaded}MB / ${mbTotal}MB)`);
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setVideoUploadProgress(88);
              setVideoUploadStatusText('Step 3/3: Upload completed! Mux is processing video (88%)...');
              resolve();
            } else {
              reject(new Error(`Mux upload failed with status ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error('Mux upload network error'));
          xhr.send(videoFile);
        });

        setVideoUploadStatusText('Step 3/3: Mux is transcoding & generating adaptive stream (90%)...');

        // Poll for ready status (up to 15 attempts)
        for (let i = 0; i < 15; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          const stepPct = Math.min(98, 90 + i);
          setVideoUploadProgress(stepPct);
          setVideoUploadStatusText(`Step 3/3: Syncing Mux video stream (${stepPct}%)...`);
          try {
            let statusRes = await fetch(`${API_URL}/api/videos/mux-asset-status/${muxUploadId}`, {
              headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });
            if (!statusRes.ok) {
              statusRes = await fetch(`${API_URL}/api/admin/courses/mux/asset-status/${muxUploadId}`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
              });
            }
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              if (statusData.playbackId) {
                muxPlaybackId = statusData.playbackId;
                muxAssetId = statusData.assetId || '';
                if (statusData.duration) autoDuration = statusData.duration;
                if (statusData.thumbnailUrl && !autoThumbnail) autoThumbnail = statusData.thumbnailUrl;
                setVideoUploadProgress(99);
                setVideoUploadStatusText('Mux stream ready! Saving to library...');
                break;
              }
            }
          } catch (err) {
            console.log('Polling status error', err);
          }
        }
      }

      const payload = {
        ...videoForm,
        muxUploadId,
        muxAssetId,
        muxPlaybackId,
        duration: autoDuration,
        thumbnailUrl: autoThumbnail || (muxPlaybackId ? `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg` : videoForm.thumbnailUrl),
        videoUrl: muxPlaybackId ? `https://stream.mux.com/${muxPlaybackId}.m3u8` : videoForm.videoUrl,
      };

      const url = editingVideoId ? `${API_URL}/api/videos/${editingVideoId}` : `${API_URL}/api/videos`;
      const method = editingVideoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const resText = await res.text();
      let resData = {};
      try {
        resData = JSON.parse(resText);
      } catch (e) {}

      if (res.ok) {
        showToast(editingVideoId ? 'Video updated successfully!' : 'Video uploaded to Mux & published successfully!', 'success');
        setIsEditingVideo(false);
        setEditingVideoId(null);
        setVideoFile(null);
        setVideoUploadProgress(0);
        setVideoUploadStatusText('');
        setVideoForm({
          title: '',
          duration: '8 MIN',
          videoUrl: '',
          thumbnailUrl: '',
          description: '',
          muxUploadId: '',
          muxAssetId: '',
          muxPlaybackId: '',
          status: 'Published'
        });
        fetchVideos();
      } else {
        throw new Error(resData.message || 'Failed to save video in database');
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error saving video', 'error');
    } finally {
      setIsVideoSaving(false);
      setVideoUploadProgress(0);
      setVideoUploadStatusText('');
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/videos/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        showToast('Video deleted successfully', 'success');
        fetchVideos();
      } else {
        showToast('Failed to delete video', 'error');
      }
    } catch (err) {
      showToast('Error deleting video', 'error');
    }
  };

  const handleVideoThumbUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoForm(prev => ({ ...prev, thumbnailUrl: typeof reader.result === 'string' ? reader.result : '' }));
      showToast('Thumbnail image selected!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const fetchLibrarySettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/library-settings`);
      if (res.ok) {
        const data = await res.json();
        setAllSections({
          hero: { ...DEFAULT_HERO, ...(data.hero || {}) },
          directory: { ...DEFAULT_DIRECTORY, ...(data.directory || {}) },
          formatExplore: { ...DEFAULT_FORMAT_EXPLORE, ...(data.formatExplore || {}) }
        });

      }
    } catch (err) {
      console.error('Failed to fetch library settings:', err);
      showToast('Could not load current settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/articles`);
      if (res.ok) {
        const dbArticles = await res.json();
        if (Array.isArray(dbArticles) && dbArticles.length > 0) {
          const merged = [...CURATED_LIBRARY_ARTICLES];
          dbArticles.forEach(dbA => {
            const idx = merged.findIndex(m => m.id === dbA._id || m.id === dbA.id || m.slug === dbA.slug);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...dbA, id: dbA._id || dbA.id };
            } else {
              // Prepend newly fetched articles to rank them at the top (#1)
              merged.unshift({ ...dbA, id: dbA._id || dbA.id });
            }
          });
          setArticlesList(merged);
        }
      }
    } catch (err) {
      console.log('Using default curated articles');
    }
  };

  // Generic Field Updater for Current Section
  const handleSectionChange = (sectionKey, field, value) => {
    setAllSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...(prev?.[sectionKey] || {}),
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

  // Handle File Upload (Keeps 200 KB as informational recommendation)
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        if (uploadTargetField === 'articleImage') {
          setArticleForm(prev => ({ ...prev, image: data.imageUrl }));
          showToast('Article image uploaded successfully!', 'success');
        } else {
          handleSectionChange(activeTab, uploadTargetField, data.imageUrl);
          showToast('Image uploaded successfully!', 'success');
        }
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

  // Open Article Form
  const handleOpenCreateArticle = () => {
    setArticleForm({
      ...emptyArticleForm,
      id: 'art-' + Date.now(),
      slug: 'article-' + Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    });
    setEditorViewMode('editor');
    setIsEditingArticle(true);
  };

  // Load Sample Template
  const handleLoadSampleTemplate = () => {
    setArticleForm({
      ...SAMPLE_EDITORIAL_ARTICLE,
      id: 'art-' + Date.now(),
      slug: 'article-' + Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    });
    showToast('Loaded luxury editorial template!', 'info');
  };

  const handleEditArticle = (art) => {
    // Extract blocks if present, or convert from sections/dropCap
    let blocks = [];

    if (art.blocks && art.blocks.length > 0) {
      blocks = art.blocks.map(b => ({ ...b }));
    } else {
      // Build blocks from dropCap & sections
      if (art.dropCap) {
        blocks.push({
          id: 'block-dropcap-' + Date.now(),
          type: 'dropCap',
          letter: art.dropCap,
          text: art.dropCapText || ''
        });
      }
      if (art.paragraphsAfterDropCap && art.paragraphsAfterDropCap.length > 0) {
        blocks.push({
          id: 'block-p-intro-' + Date.now(),
          type: 'paragraphs',
          text: art.paragraphsAfterDropCap.join('\n\n')
        });
      }
      if (art.sections && art.sections.length > 0) {
        art.sections.forEach((sec, sIdx) => {
          if (sec.heading || sec.headingMain) {
            blocks.push({
              id: `block-h-${sIdx}-${Date.now()}`,
              type: 'heading',
              text: sec.heading || `${sec.headingMain || ''} *${sec.headingItalic || ''}*`.trim()
            });
          }
          if (sec.paragraphs && sec.paragraphs.length > 0) {
            blocks.push({
              id: `block-p-${sIdx}-${Date.now()}`,
              type: 'paragraphs',
              text: sec.paragraphs.join('\n\n')
            });
          }
          if (sec.callout && (sec.callout.line1 || sec.callout.line2)) {
            blocks.push({
              id: `block-c-${sIdx}-${Date.now()}`,
              type: 'callout',
              line1: sec.callout.line1 || '',
              line2: sec.callout.line2 || ''
            });
          }
          if (sec.followUpParagraphs && sec.followUpParagraphs.length > 0) {
            blocks.push({
              id: `block-fp-${sIdx}-${Date.now()}`,
              type: 'paragraphs',
              text: sec.followUpParagraphs.join('\n\n')
            });
          }
        });
      } else if (art.bodyText || art.bodyHtml) {
        const rawText = (art.bodyText || art.bodyHtml).replace(/<[^>]*>?/gm, '');
        blocks.push({
          id: 'block-body-' + Date.now(),
          type: 'paragraphs',
          text: rawText
        });
      }
    }

    if (blocks.length === 0) {
      blocks = [
        { id: 'block-' + Date.now(), type: 'dropCap', letter: 'W', text: '' },
        { id: 'block-' + (Date.now() + 1), type: 'paragraphs', text: '' }
      ];
    }

    let initialTitle = art.title || '';
    if (initialTitle.toLowerCase().includes('attention feels like love') && !initialTitle.includes('*')) {
      initialTitle = initialTitle.replace(/love/i, '*Love*');
    }

    setArticleForm({
      id: art.id || art._id || 'art-' + Date.now(),
      slug: art.slug || (art.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: art.category || 'RELATIONSHIPS',
      categoryNum: art.categoryNum || '01 / 06',
      date: art.date || '12 SEP 2026',
      title: initialTitle,
      subtitle: art.subtitle || art.excerpt || art.description || '',
      excerpt: art.excerpt || art.subtitle || art.description || '',
      highlightText: art.highlightText || '',
      quote: art.quote || '',
      image: art.image || art.featuredImage || '/library_preview_silhouette.jpg',
      blocks: blocks,
      dropCap: art.dropCap || 'W',
      dropCapText: art.dropCapText || '',
    });
    setEditorViewMode('editor');
    setIsEditingArticle(true);
  };

  // Modular Block Helpers
  const handleAddBlock = (type, index = null) => {
    const newBlock = {
      id: 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: type,
      letter: type === 'dropCap' ? 'W' : undefined,
      text: '',
      line1: type === 'callout' ? '' : undefined,
      line2: type === 'callout' ? '' : undefined,
    };

    setArticleForm(prev => {
      const newBlocks = [...(prev.blocks || [])];
      if (index !== null && index >= 0) {
        newBlocks.splice(index + 1, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }
      return { ...prev, blocks: newBlocks };
    });
  };

  const handleUpdateBlock = (index, field, value) => {
    setArticleForm(prev => {
      const updated = [...(prev.blocks || [])];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return { ...prev, blocks: updated };
    });
  };

  const handleDeleteBlock = (index) => {
    if ((articleForm.blocks || []).length <= 1) {
      showToast('Article must have at least one content block', 'error');
      return;
    }
    setArticleForm(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, idx) => idx !== index)
    }));
  };

  const handleMoveBlock = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= (articleForm.blocks || []).length) return;
    
    setArticleForm(prev => {
      const newBlocks = [...prev.blocks];
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[targetIdx];
      newBlocks[targetIdx] = temp;
      return { ...prev, blocks: newBlocks };
    });
  };

  const handleDuplicateBlock = (index) => {
    setArticleForm(prev => {
      const source = prev.blocks[index];
      const copy = {
        ...source,
        id: 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)
      };
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index + 1, 0, copy);
      return { ...prev, blocks: newBlocks };
    });
    showToast('Block duplicated!', 'info');
  };

  // Text Selection / Wrapping Formatter Helper for Blocks
  const handleApplyFormattingToBlock = (bIndex, field, startTag, endTag, defaultText = 'text') => {
    const currentVal = articleForm.blocks?.[bIndex]?.[field] || '';
    const element = document.getElementById(`block-field-${bIndex}-${field}`);
    
    if (element && typeof element.selectionStart === 'number' && typeof element.selectionEnd === 'number') {
      const start = element.selectionStart;
      const end = element.selectionEnd;
      const selectedText = currentVal.substring(start, end);
      const textToWrap = selectedText.length > 0 ? selectedText : defaultText;
      const newText = currentVal.substring(0, start) + `${startTag}${textToWrap}${endTag}` + currentVal.substring(end);
      
      handleUpdateBlock(bIndex, field, newText);
      
      setTimeout(() => {
        element.focus();
        const newCursorPos = start + startTag.length + textToWrap.length + endTag.length;
        element.setSelectionRange(newCursorPos, newCursorPos);
      }, 50);
    } else {
      const newText = currentVal ? `${currentVal} ${startTag}${defaultText}${endTag}` : `${startTag}${defaultText}${endTag}`;
      handleUpdateBlock(bIndex, field, newText);
    }
  };

  // Text Selection / Wrapping Formatter Helper for Article Title
  const handleApplyFormattingToTitle = (startTag, endTag, defaultText = 'Love') => {
    const currentVal = articleForm.title || '';
    const element = document.getElementById('article-title-input');
    
    if (element && typeof element.selectionStart === 'number' && typeof element.selectionEnd === 'number') {
      const start = element.selectionStart;
      const end = element.selectionEnd;
      const selectedText = currentVal.substring(start, end);
      const textToWrap = selectedText.length > 0 ? selectedText : defaultText;
      const newText = currentVal.substring(0, start) + `${startTag}${textToWrap}${endTag}` + currentVal.substring(end);
      
      setArticleForm(prev => ({ ...prev, title: newText }));
      
      setTimeout(() => {
        element.focus();
        const newCursorPos = start + startTag.length + textToWrap.length + endTag.length;
        element.setSelectionRange(newCursorPos, newCursorPos);
      }, 50);
    } else {
      setArticleForm(prev => ({
        ...prev,
        title: currentVal ? `${currentVal} ${startTag}${defaultText}${endTag}` : `${startTag}${defaultText}${endTag}`
      }));
    }
  };

  // Save Article
  const handleSaveArticle = async (e) => {
    if (e) e.preventDefault();
    if (!articleForm.title.trim()) {
      showToast('Please enter an article title', 'error');
      return;
    }

    const newSlug = articleForm.slug || articleForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Clean blocks
    const cleanedBlocks = (articleForm.blocks || []).map(b => {
      if (b.type === 'heading') {
        return { ...b, text: (b.text || '').trim() };
      }
      if (b.type === 'callout') {
        return { ...b, line1: (b.line1 || '').trim(), line2: (b.line2 || '').trim() };
      }
      if (b.type === 'dropCap') {
        return { ...b, letter: (b.letter || 'W').trim().charAt(0), text: (b.text || '').trim() };
      }
      if (b.type === 'paragraphs') {
        const pArr = (b.text || '').split('\n\n').map(p => p.trim()).filter(Boolean);
        return { ...b, text: b.text || '', paragraphs: pArr };
      }
      return b;
    }).filter(b => {
      if (b.type === 'heading') return Boolean(b.text);
      if (b.type === 'callout') return Boolean(b.line1 || b.line2);
      if (b.type === 'dropCap') return Boolean(b.letter || b.text);
      if (b.type === 'paragraphs') return Boolean(b.text);
      return true;
    });

    const articleDate = (articleForm.date || '').trim() || getAutoPublicationDate();

    const updatedArticle = {
      ...articleForm,
      date: articleDate,
      slug: newSlug,
      title: articleForm.title.trim(),
      subtitle: articleForm.subtitle.trim(),
      excerpt: (articleForm.excerpt || articleForm.subtitle).trim(),
      highlightText: (articleForm.highlightText || '').trim(),
      quote: articleForm.quote.trim(),
      blocks: cleanedBlocks,
      status: 'Published'
    };

    // Update local state list
    setArticlesList(prev => {
      const idx = prev.findIndex(a => a.id === updatedArticle.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedArticle;
        return copy;
      }
      return [updatedArticle, ...prev];
    });

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/api/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...updatedArticle,
          categoryId: updatedArticle.category.toLowerCase(),
          headingId: updatedArticle.category.toLowerCase(),
          featuredImage: updatedArticle.image,
        })
      });
    } catch (err) {
      console.log('Saved to local session');
    }

    showToast('Article saved & published in luxury format!', 'success');
    setIsEditingArticle(false);
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this article?')) return;

    // Remove from local state immediately (optimistic)
    setArticlesList(prev => prev.filter(a => a.id !== id && a._id !== id));
    showToast('Deleting article...', 'info');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        showToast('Article permanently deleted!', 'success');
      } else {
        // If 404, article wasn't in DB (was a local/curated article), that's fine
        const data = await res.json().catch(() => ({}));
        if (res.status === 404) {
          showToast('Article removed (was not in database)', 'info');
        } else {
          // Revert optimistic removal on error
          showToast(`Delete failed: ${data.message || 'Server error'}`, 'error');
          fetchArticles(); // re-fetch to restore correct state
        }
      }
    } catch (err) {
      console.error('Delete article error:', err);
      showToast('Article removed from view (offline mode)', 'info');
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
  const currentDirectory = allSections.directory || DEFAULT_DIRECTORY;
  const currentFormatExplore = allSections.formatExplore || DEFAULT_FORMAT_EXPLORE;

  const categoriesList = currentDirectory.categories && currentDirectory.categories.length > 0
    ? currentDirectory.categories
    : DEFAULT_DIRECTORY_CATEGORIES;

  const activeCategoryObj = categoriesList.find(c => 
    (c.id || '').toLowerCase() === (selectedCategory || '').toLowerCase() || 
    (c.key || '').toLowerCase() === (selectedCategory || '').toLowerCase()
  ) || categoriesList[0];

  // Articles belonging to the selected category
  const categoryArticles = articlesList.filter(a => {
    const aCat = (a.categoryId || a.category || '').toLowerCase();
    const targetId = (activeCategoryObj.id || '').toLowerCase();
    const targetKey = (activeCategoryObj.key || '').toLowerCase();
    const targetTitle = (activeCategoryObj.title || '').toLowerCase();
    const matchesCategory = aCat === targetId || aCat === targetKey || aCat === targetTitle;

    if (!articleSearch.trim()) return matchesCategory;
    const q = articleSearch.toLowerCase();
    return matchesCategory && (
      (a.title || '').toLowerCase().includes(q) ||
      (a.subtitle || '').toLowerCase().includes(q) ||
      (a.excerpt || '').toLowerCase().includes(q)
    );
  });

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
            ? 'bg-[#18140e]/95 border-[#c79c6e]/40 text-[#c79c6e]'
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
              {isEditingArticle ? 'Article Editorial Studio' : SIDEBAR_TABS.find(t => t.id === activeTab)?.label}
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
            onClick={() => {
              fetchLibrarySettings();
              fetchArticles();
            }}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-xs font-medium transition-all cursor-pointer"
          >
            <ArrowClockwise size={15} />
            <span>Reload</span>
          </button>

          {!isEditingArticle && (
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
          )}
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
              const isActive = activeTab === tab.id && !isEditingArticle;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsEditingArticle(false);
                  }}
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

          {/* Quick Info Box in Sidebar */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-b from-[#12100d] to-[#080808] border border-[#c79c6e]/20 flex flex-col gap-2.5">
            <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#c79c6e] flex items-center gap-1.5">
              <Sparkle size={14} />
              Editorial Text Formatting
            </span>
            <p className="text-[0.72rem] text-white/60 leading-relaxed">
              Wrap any word in <strong className="text-white font-mono">*asterisks*</strong> in headings or titles to render it in <em className="text-[#c79c6e] font-serif">Gold Italic Serif</em> on the reader view!
            </p>
          </div>
        </aside>

        {/* ─── RIGHT SECTION EDITOR ─── */}
        <main className="flex-1 p-6 lg:p-10 w-full min-w-0">
          
          {/* =========================================================
              1. LIBRARY SECTION & ARTICLE CATALOG
             ========================================================= */}
          {activeTab === 'directory' && !isEditingArticle && (
            <div className="flex flex-col gap-8 max-w-6xl animate-in fade-in duration-300">
              
              {/* Section Header */}
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <h2 className="font-serif text-2xl text-white">Library Directory & Article Studio</h2>
                <p className="text-xs text-white/50">
                  Manage the main Library section headers, search bar placeholder, quotes, and write or edit articles in the signature editorial format.
                </p>
              </div>

              {/* Section 2 Header Texts Editor Card */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                    Section Header Texts, Search Bar & Quote
                  </span>
                  <button
                    onClick={handleSaveSection}
                    disabled={isSaving}
                    className="px-3.5 py-1.5 rounded-lg bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#b0885e] transition-colors cursor-pointer"
                  >
                    Save Header Texts
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      value={currentDirectory.eyebrowText || ''}
                      onChange={(e) => handleSectionChange('directory', 'eyebrowText', e.target.value)}
                      placeholder="IDEAS FOR A MORE THOUGHTFUL LIFE"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Main Section Title
                    </label>
                    <input
                      type="text"
                      value={currentDirectory.headingText || ''}
                      onChange={(e) => handleSectionChange('directory', 'headingText', e.target.value)}
                      placeholder="Library"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Section Description
                    </label>
                    <input
                      type="text"
                      value={currentDirectory.description || ''}
                      onChange={(e) => handleSectionChange('directory', 'description', e.target.value)}
                      placeholder="A collection of ideas about how we think, relate, choose and change."
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>

                  {/* Search Bar Placeholder Text */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">
                      Search Bar Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={currentDirectory.searchPlaceholder || ''}
                      onChange={(e) => handleSectionChange('directory', 'searchPlaceholder', e.target.value)}
                      placeholder="Describe what you're facing..."
                      className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Right Inspiring Quote
                    </label>
                    <input
                      type="text"
                      value={currentDirectory.quoteText || ''}
                      onChange={(e) => handleSectionChange('directory', 'quoteText', e.target.value)}
                      placeholder="“A quieter mind builds a braver, kinder life.”"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white italic placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Quote Author
                    </label>
                    <input
                      type="text"
                      value={currentDirectory.quoteAuthor || ''}
                      onChange={(e) => handleSectionChange('directory', 'quoteAuthor', e.target.value)}
                      placeholder="— Aarkesh Gupta"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* =========================================================
                  2-COLUMN CATEGORIES & ARTICLES STUDIO (MASTER-DETAIL)
                 ========================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 1. LEFT SIDEBAR: Categories with + Add Category button */}
                <div className="lg:col-span-4 xl:col-span-3.5 flex flex-col gap-3 bg-[#0c0c0c] border border-white/10 rounded-2xl p-4 sticky top-6 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 px-1">
                    <span className="text-[0.68rem] font-mono uppercase tracking-widest font-semibold text-[#c79c6e] flex items-center gap-1.5">
                      <Sparkle size={13} weight="fill" />
                      {categoriesList.length} Categories
                    </span>
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-2.5 py-1 rounded bg-[#c79c6e]/15 hover:bg-[#c79c6e] text-[#c79c6e] hover:text-black font-semibold text-[0.65rem] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 border border-[#c79c6e]/30 shadow-sm"
                      title="Add New Category Pillar"
                    >
                      <Plus size={12} weight="bold" />
                      <span>+ New</span>
                    </button>
                  </div>

                  {/* Category Items */}
                  <div className="flex flex-col gap-2">
                    {categoriesList.map((cat, catIdx) => {
                      const isSel = (cat.id || '').toLowerCase() === (activeCategoryObj.id || '').toLowerCase() ||
                                    (cat.key || '').toLowerCase() === (activeCategoryObj.id || '').toLowerCase();
                      const count = articlesList.filter(a => {
                        const aCat = (a.categoryId || a.category || '').toLowerCase();
                        return aCat === (cat.id || '').toLowerCase() || aCat === (cat.key || '').toLowerCase() || aCat === (cat.title || '').toLowerCase();
                      }).length;

                      const isDragging = draggedCatIndex === catIdx;
                      const isDragOver = dragOverCatIndex === catIdx;

                      return (
                        <div
                          key={cat.id || cat.key || catIdx}
                          draggable
                          onDragStart={(e) => handleDragStartCat(e, catIdx)}
                          onDragOver={(e) => handleDragOverCat(e, catIdx)}
                          onDrop={(e) => handleDropCat(e, catIdx)}
                          onDragEnd={handleDragEndCat}
                          className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all border group/cat relative ${
                            isDragging
                              ? 'opacity-40 scale-[0.98] border-dashed border-[#c79c6e]'
                              : isDragOver
                              ? 'border-[#c79c6e] bg-[#c79c6e]/15 scale-[1.01]'
                              : isSel
                              ? 'bg-gradient-to-r from-[#1f1913] to-[#12100e] border-[#c79c6e]/70 shadow-[0_0_25px_rgba(199,156,110,0.18)] ring-1 ring-[#c79c6e]/30'
                              : 'bg-[#060606] border-white/5 hover:border-white/20 hover:bg-white/[0.03] text-white/70 hover:text-white'
                          }`}
                        >
                          {/* Drag Grab Handle & Order Controls */}
                          <div className="flex items-center gap-1.5 shrink-0 pr-1">
                            <div 
                              className="cursor-grab active:cursor-grabbing p-1 text-white/30 hover:text-[#c79c6e] transition-colors"
                              title="Drag to reorder category"
                            >
                              <DotsSixVertical size={16} weight="bold" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={catIdx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveCategory(catIdx, 'up');
                                }}
                                className="text-white/30 hover:text-[#c79c6e] disabled:opacity-10 transition-colors p-0.5"
                                title="Move Category Up"
                              >
                                <CaretUp size={11} weight="bold" />
                              </button>
                              <button
                                type="button"
                                disabled={catIdx === categoriesList.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveCategory(catIdx, 'down');
                                }}
                                className="text-white/30 hover:text-[#c79c6e] disabled:opacity-10 transition-colors p-0.5"
                                title="Move Category Down"
                              >
                                <CaretDown size={11} weight="bold" />
                              </button>
                            </div>
                          </div>

                          {/* Category Button Trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat.id || cat.key);
                              setArticleSearch('');
                            }}
                            className="flex-1 flex items-center justify-between text-left min-w-0 cursor-pointer pl-1"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`font-serif text-lg font-bold shrink-0 ${isSel ? 'text-[#c79c6e]' : 'text-[#c79c6e]/50'}`}>
                                {cat.num || (catIdx + 1 < 10 ? `0${catIdx + 1}` : `${catIdx + 1}`)}
                              </span>
                              <div className="flex flex-col min-w-0">
                                <span className={`text-xs sm:text-sm font-serif font-medium truncate ${isSel ? 'text-white' : 'text-white/80 group-hover/cat:text-white'}`}>
                                  {cat.title}
                                </span>
                                <span className="text-[0.65rem] text-white/40 truncate max-w-[130px] sm:max-w-[150px]">
                                  {cat.subtitle}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-mono font-medium ${
                                isSel ? 'bg-[#c79c6e]/25 text-[#c79c6e]' : 'bg-white/5 text-white/40'
                              }`}>
                                {count}
                              </span>
                              <CaretRight size={13} className={isSel ? 'text-[#c79c6e]' : 'text-white/20'} />
                            </div>
                          </button>
                        </div>
                      );
                    })}

                    {/* Bottom Add New Category Button */}
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#c79c6e]/40 hover:border-[#c79c6e] bg-[#c79c6e]/5 hover:bg-[#c79c6e]/15 text-[#c79c6e] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
                    >
                      <Plus size={14} weight="bold" />
                      <span>+ Add New Category</span>
                    </button>
                  </div>
                </div>

                {/* 2. RIGHT CONTENT: Category Edit & Row Articles List */}
                <div className="lg:col-span-8 xl:col-span-8.5 flex flex-col gap-6 min-w-0">
                  
                  {/* Category Details & Customization Card */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-3xl text-[#c79c6e] font-bold">
                          {activeCategoryObj.num || '01'}
                        </span>
                        <div className="flex flex-col">
                          <h3 className="font-serif text-xl text-white">
                            {activeCategoryObj.title} Settings
                          </h3>
                          <span className="text-xs text-white/50">
                            Edit category number, name, and subtitle shown on the frontend Library Directory.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        {categoriesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(activeCategoryObj.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs transition-all cursor-pointer border border-red-500/20"
                            title="Delete this Category"
                          >
                            <Trash size={14} />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleSaveCategorySettings}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c79c6e] text-black hover:bg-[#b0885e] font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#c79c6e]/10 disabled:opacity-50"
                        >
                          <FloppyDisk size={15} weight="bold" />
                          <span>{isSaving ? 'Saving...' : 'Save Category Info'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Inputs for Numbering, Name, and Description */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-3 flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                          Numbering *
                        </label>
                        <input
                          type="text"
                          value={activeCategoryObj.num || ''}
                          onChange={(e) => handleCategoryInfoChange(activeCategoryObj.id, 'num', e.target.value)}
                          placeholder="01"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-base font-serif text-[#c79c6e] placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                        />
                      </div>

                      <div className="sm:col-span-9 flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          value={activeCategoryObj.title || ''}
                          onChange={(e) => handleCategoryInfoChange(activeCategoryObj.id, 'title', e.target.value)}
                          placeholder="Relationships"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                        />
                      </div>

                      <div className="sm:col-span-12 flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                          Category Description / Subtitle *
                        </label>
                        <textarea
                          rows={2}
                          value={activeCategoryObj.subtitle || ''}
                          onChange={(e) => handleCategoryInfoChange(activeCategoryObj.id, 'subtitle', e.target.value)}
                          placeholder="On love, friendship and what it means to stay close."
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="p-4 rounded-xl bg-[#060606] border border-[#c79c6e]/20 flex items-start gap-4 mt-1">
                      <span className="font-serif text-3xl sm:text-4xl text-[#c79c6e] font-normal shrink-0">
                        {activeCategoryObj.num || '01'}
                      </span>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-serif text-xl sm:text-2xl text-white font-normal">
                          {activeCategoryObj.title}
                        </h4>
                        <p className="font-serif text-white/70 text-xs sm:text-sm font-light leading-relaxed">
                          {activeCategoryObj.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Articles in This Selected Category - Clean Row List */}
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <Article size={20} className="text-[#c79c6e]" />
                        <h3 className="font-serif text-lg sm:text-xl text-white">
                          Articles in {activeCategoryObj.title} ({categoryArticles.length})
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Search Input */}
                        <div className="relative w-44 sm:w-56">
                          <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                          <input
                            type="text"
                            value={articleSearch}
                            onChange={(e) => setArticleSearch(e.target.value)}
                            placeholder="Search in category..."
                            className="w-full bg-[#050505] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setArticleForm({
                              ...emptyArticleForm,
                              category: (activeCategoryObj.key || activeCategoryObj.id).toUpperCase(),
                              categoryNum: `01 / 03`,
                              id: 'art-' + Date.now(),
                              slug: '',
                              title: '',
                              subtitle: '',
                              excerpt: '',
                              highlightText: '',
                              quote: '',
                              image: '',
                              date: getAutoPublicationDate(),
                              blocks: [
                                {
                                  id: 'block-dropcap-' + Date.now(),
                                  type: 'dropCap',
                                  letter: 'W',
                                  text: ''
                                },
                                {
                                  id: 'block-p-' + (Date.now() + 1),
                                  type: 'paragraphs',
                                  text: ''
                                }
                              ],
                              dropCap: 'W',
                              dropCapText: '',
                              paragraphsAfterDropCap: [],
                              sections: []
                            });
                            setIsEditingArticle(true);
                            setEditorViewMode('editor');
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#c79c6e] text-black hover:bg-[#b0885e] font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md shadow-[#c79c6e]/10"
                        >
                          <Plus size={14} weight="bold" />
                          <span>+ Add Article</span>
                        </button>
                      </div>
                    </div>

                    {/* Articles Rows with Drag & Drop & Move Controls */}
                    {categoryArticles.length === 0 ? (
                      <div className="p-8 rounded-xl border border-white/5 bg-[#050505] text-center text-white/40 text-xs flex flex-col items-center gap-2">
                        <Article size={28} />
                        <span>No articles in {activeCategoryObj.title} yet.</span>
                      </div>
                    ) : (
                      <div className="flex flex-col divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-[#070707]">
                        {categoryArticles.map((art, idx) => {
                          const isDraggingArt = draggedArtIndex === idx;
                          const isDragOverArt = dragOverArtIndex === idx;

                          return (
                            <div
                              key={art.id || art._id || idx}
                              draggable
                              onDragStart={(e) => handleDragStartArt(e, idx)}
                              onDragOver={(e) => handleDragOverArt(e, idx)}
                              onDrop={(e) => handleDropArt(e, idx, categoryArticles, activeCategoryObj)}
                              onDragEnd={handleDragEndArt}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 gap-3 transition-all group relative ${
                                isDraggingArt
                                  ? 'opacity-40 bg-[#12100e] scale-[0.99] border-dashed border-[#c79c6e]'
                                  : isDragOverArt
                                  ? 'bg-[#c79c6e]/15 border-l-4 border-l-[#c79c6e]'
                                  : 'hover:bg-white/[0.03]'
                              }`}
                            >
                              {/* Heading line + details + Drag Handle */}
                              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                
                                {/* Drag & Drop Handle & Move Arrows */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <div
                                    className="cursor-grab active:cursor-grabbing p-1 text-white/20 group-hover:text-[#c79c6e] transition-colors"
                                    title="Drag to reorder article rank"
                                  >
                                    <DotsSixVertical size={16} weight="bold" />
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveArticle(idx, 'up', categoryArticles, activeCategoryObj)}
                                      className="text-white/20 hover:text-[#c79c6e] disabled:opacity-10 transition-colors p-0.5"
                                      title="Move Article Up"
                                    >
                                      <CaretUp size={10} weight="bold" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === categoryArticles.length - 1}
                                      onClick={() => handleMoveArticle(idx, 'down', categoryArticles, activeCategoryObj)}
                                      className="text-white/20 hover:text-[#c79c6e] disabled:opacity-10 transition-colors p-0.5"
                                      title="Move Article Down"
                                    >
                                      <CaretDown size={10} weight="bold" />
                                    </button>
                                  </div>
                                </div>

                                <span className="font-mono text-xs text-[#c79c6e] font-semibold px-2 py-1 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/20 shrink-0">
                                  #{idx + 1}
                                </span>

                                <div className="flex flex-col min-w-0 flex-1">
                                  <h4 className="font-serif text-base sm:text-lg text-white group-hover:text-[#c79c6e] transition-colors font-normal truncate">
                                    {renderFormattedTitle(art.title)}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[0.7rem] text-white/40 mt-0.5">
                                    <span>{art.readTime || '6 MIN READ'}</span>
                                    <span>·</span>
                                    <span>{art.date || '12 SEP 2026'}</span>
                                    {art.highlightText && (
                                      <>
                                        <span>·</span>
                                        <span className="text-[#c79c6e] italic font-serif truncate max-w-[220px]">
                                          {art.highlightText}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-2">
                                <a
                                  href={`http://localhost:5173/articles?article=${art.slug || art.id}&title=${encodeURIComponent(art.title)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
                                  title="Preview on Live Site"
                                >
                                  <Eye size={14} />
                                  <span className="hidden sm:inline">Preview</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handleEditArticle(art)}
                                  className="px-3 py-1.5 rounded-lg bg-[#c79c6e]/15 hover:bg-[#c79c6e] text-[#c79c6e] hover:text-black text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-[#c79c6e]/30"
                                  title="Edit Article"
                                >
                                  <Pen size={14} />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteArticle(art.id || art._id)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 transition-colors cursor-pointer"
                                  title="Delete Article"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* =========================================================
              3. EXPLORE BY FORMAT SECTION EDITOR
             ========================================================= */}
          {activeTab === 'formatExplore' && !isEditingArticle && (
            <div className="flex flex-col gap-8 max-w-5xl animate-in fade-in duration-300">
              
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex flex-col gap-1">
                  <h2 className="font-serif text-2xl text-white">Explore by Format Section Editor</h2>
                  <p className="text-xs text-white/50">
                    Customize the section title, eyebrow label, and texts for the interactive format cards (Latest, Read, Watch).
                  </p>
                </div>

                {/* Whole Section Visibility Toggle */}
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#0c0c0c] border border-white/10 shadow-sm self-start sm:self-auto">
                  <span className="text-xs font-sans font-medium uppercase tracking-wider text-white/70">
                    Section Status: <span className={`font-bold ${currentFormatExplore.showSection !== false ? 'text-[#c79c6e]' : 'text-white/40'}`}>
                      {currentFormatExplore.showSection !== false ? 'VISIBLE (ON)' : 'HIDDEN (OFF)'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSectionChange('formatExplore', 'showSection', currentFormatExplore.showSection === false ? true : false)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      currentFormatExplore.showSection !== false ? 'bg-[#c79c6e]' : 'bg-white/20'
                    }`}
                    role="switch"
                    aria-checked={currentFormatExplore.showSection !== false}
                    title={currentFormatExplore.showSection !== false ? 'Turn OFF to hide entire Explore by Format section' : 'Turn ON to show Explore by Format section'}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                        currentFormatExplore.showSection !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Main Headline & Eyebrow Card */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                  Main Section Headings
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      value={currentFormatExplore.eyebrowText || ''}
                      onChange={(e) => handleSectionChange('formatExplore', 'eyebrowText', e.target.value)}
                      placeholder="EXPLORE BY FORMAT"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Heading Line 1
                    </label>
                    <input
                      type="text"
                      value={currentFormatExplore.headingLine1 || ''}
                      onChange={(e) => handleSectionChange('formatExplore', 'headingLine1', e.target.value)}
                      placeholder="Choose the form that"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Heading Line 2
                    </label>
                    <input
                      type="text"
                      value={currentFormatExplore.headingLine2 || ''}
                      onChange={(e) => handleSectionChange('formatExplore', 'headingLine2', e.target.value)}
                      placeholder="meets you where you are."
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Top Row: Card 1 (Latest) & Card 2 (Read) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. LATEST CARD */}
                <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Sparkle size={18} className="text-[#c79c6e]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">
                      Card 1: Latest
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Title
                    </label>
                    <input
                      type="text"
                      value={currentFormatExplore.latestCardTitle || ''}
                      onChange={(e) => handleSectionChange('formatExplore', 'latestCardTitle', e.target.value)}
                      placeholder="LATEST"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Subtitle / Tag
                    </label>
                    <input
                      type="text"
                      value={currentFormatExplore.latestCardSubtitle || ''}
                      onChange={(e) => handleSectionChange('formatExplore', 'latestCardSubtitle', e.target.value)}
                      placeholder="NEW ARRIVALS"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={currentFormatExplore.latestCardDesc || ''}
                      onChange={(e) => handleSectionChange('formatExplore', 'latestCardDesc', e.target.value)}
                      placeholder="The most recent articles and videos."
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* 2. READ CARD */}
                <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <BookOpen size={18} className="text-[#c79c6e]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">
                      Card 2: Read
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Title
                    </label>
                    <input
                      type="text"
                      value={currentFormatExplore.readCardTitle || ''}
                      onChange={(e) => handleSectionChange('formatExplore', 'readCardTitle', e.target.value)}
                      placeholder="READ"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                        Subtitle / Tag
                      </label>
                      <span className="text-[0.62rem] text-[#c79c6e] uppercase tracking-wider font-semibold">
                        Dynamic Counter
                      </span>
                    </div>
                    <div className="w-full bg-[#050505]/80 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white/80 flex items-center justify-between">
                      <span className="font-mono text-xs text-[#c79c6e] font-semibold">
                        {articlesList.length > 0 ? `${articlesList.length} ARTICLES` : '18 ARTICLES'}
                      </span>
                      <span className="text-[0.65rem] text-white/40 uppercase tracking-widest">Auto-Calculated</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={currentFormatExplore.readCardDesc || ''}
                      onChange={(e) => handleSectionChange('formatExplore', 'readCardDesc', e.target.value)}
                      placeholder="Ideas to sit with at your own pace."
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors resize-none leading-relaxed"
                    />
                  </div>
                </div>

              </div>

              {/* Shifted Below: CARD 3: WATCH & VIDEO UPLOAD CONTROLS */}
              <div className="bg-[#0c0c0c] border border-[#c79c6e]/20 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#c79c6e]/10 flex items-center justify-center text-[#c79c6e]">
                      <Play size={18} weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-white">Card 3: Watch & Video Upload Manager</h3>
                      <p className="text-xs text-white/50">Manage Watch card texts and upload/manage watchable video perspectives.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Show/Hide Watch Card Toggle */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#050505] border border-white/10">
                      <span className="text-[0.68rem] font-sans font-medium uppercase tracking-wider text-white/70">
                        Watch Card: <span className={`font-bold ${currentFormatExplore.showWatchCard !== false ? 'text-[#c79c6e]' : 'text-white/40'}`}>
                          {currentFormatExplore.showWatchCard !== false ? 'ON' : 'OFF'}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSectionChange('formatExplore', 'showWatchCard', currentFormatExplore.showWatchCard === false ? true : false)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          currentFormatExplore.showWatchCard !== false ? 'bg-[#c79c6e]' : 'bg-white/20'
                        }`}
                        role="switch"
                        aria-checked={currentFormatExplore.showWatchCard !== false}
                        title={currentFormatExplore.showWatchCard !== false ? 'Turn OFF to hide Watch Card from Explore section' : 'Turn ON to show Watch Card in Explore section'}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                            currentFormatExplore.showWatchCard !== false ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenCreateVideo}
                      className="px-4 py-2 rounded-lg bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#b0885e] transition-all cursor-pointer flex items-center gap-1.5 shadow-md self-start sm:self-auto"
                    >
                      <Plus size={15} weight="bold" />
                      <span>Upload New Video</span>
                    </button>
                  </div>
                </div>

                {/* Card 3 Texts Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-white/5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Card Title
                    </label>
                    <input
                      type="text"
                      value={currentFormatExplore.watchCardTitle || ''}
                      onChange={(e) => handleSectionChange('formatExplore', 'watchCardTitle', e.target.value)}
                      placeholder="WATCH"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                        Card Subtitle / Tag
                      </label>
                      <span className="text-[0.62rem] text-[#c79c6e] uppercase tracking-wider font-semibold">
                        Dynamic Counter
                      </span>
                    </div>
                    <div className="w-full bg-[#050505]/80 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white/80 flex items-center justify-between">
                      <span className="font-mono text-xs text-[#c79c6e] font-semibold">
                        {libraryVideos.length} {libraryVideos.length === 1 ? 'VIDEO' : 'VIDEOS'}
                      </span>
                      <span className="text-[0.65rem] text-white/40 uppercase tracking-widest">Auto-Calculated</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                      Card Description
                    </label>
                    <input
                      type="text"
                      value={currentFormatExplore.watchCardDesc || ''}
                      onChange={(e) => handleSectionChange('formatExplore', 'watchCardDesc', e.target.value)}
                      placeholder="Perspectives spoken and explored."
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors"
                    />
                  </div>
                </div>

                {/* Video Upload & Edit Form Modal / Panel */}
                {isEditingVideo && (
                  <form onSubmit={handleSaveVideo} className="bg-[#14100c] border border-[#c79c6e]/40 rounded-xl p-5 md:p-6 flex flex-col gap-5 animate-in fade-in duration-200 shadow-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="font-sans text-xs uppercase tracking-widest font-semibold text-[#c79c6e]">
                        {editingVideoId ? 'Edit Video' : 'Upload / Add Video'}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setIsEditingVideo(false); setEditingVideoId(null); }}
                        className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/70">
                        Video Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={videoForm.title}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. When clarity asks something of you"
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                      />
                    </div>

                    {/* Video Source: Mux File Upload or Video URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/70 flex items-center justify-between">
                          <span>Upload Video File (Saves to Mux)</span>
                          {videoFile && <span className="text-[0.62rem] text-[#c79c6e] font-normal">Ready to upload</span>}
                        </label>
                        <div className="flex items-center gap-2.5">
                          <input
                            type="file"
                            ref={videoFileInputRef}
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setVideoFile(file);
                                if (!videoForm.title) {
                                  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                                  setVideoForm(prev => ({ ...prev, title: nameWithoutExt }));
                                }
                                showToast(`Selected video: ${file.name}`, 'info');
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => videoFileInputRef.current?.click()}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#c79c6e]/60 text-xs text-white hover:text-[#c79c6e] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <UploadSimple size={15} />
                            <span className="truncate max-w-[200px]">{videoFile ? videoFile.name : 'Choose MP4 / Video File for Mux...'}</span>
                          </button>
                          {videoFile && (
                            <button
                              type="button"
                              onClick={() => { setVideoFile(null); if (videoFileInputRef.current) videoFileInputRef.current.value = ''; }}
                              className="text-xs text-red-400 hover:underline px-1 py-2 cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {videoUploadProgress > 0 && (
                          <div className="flex flex-col gap-1 mt-1.5">
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <div className="bg-[#c79c6e] h-full transition-all duration-300" style={{ width: `${videoUploadProgress}%` }} />
                            </div>
                            <span className="text-[0.65rem] text-[#c79c6e] font-mono">{videoUploadStatusText || `${videoUploadProgress}%`}</span>
                          </div>
                        )}
                        {videoForm.muxPlaybackId && !videoFile && (
                          <span className="text-[0.62rem] text-emerald-400 flex items-center gap-1 mt-1">
                            ✓ Linked with Mux (Playback ID: {videoForm.muxPlaybackId.slice(0, 8)}...)
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/70">
                          Or Video Link (YouTube / Instagram / Direct URL)
                        </label>
                        <input
                          type="url"
                          value={videoForm.videoUrl}
                          onChange={(e) => handleVideoUrlChange(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                        />
                      </div>
                    </div>

                    {/* Thumbnail Upload & Preview */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/70">
                        Upload Video Thumbnail
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <input
                          type="file"
                          ref={videoThumbInputRef}
                          accept="image/*"
                          onChange={handleVideoThumbUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => videoThumbInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#c79c6e]/50 text-xs text-white hover:text-[#c79c6e] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <ImageIcon size={15} />
                          <span>Upload Thumbnail Image</span>
                        </button>
                        <input
                          type="url"
                          value={videoForm.thumbnailUrl}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                          placeholder="Or paste thumbnail image URL..."
                          className="flex-1 w-full bg-[#050505] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                        />
                      </div>
                      {videoForm.thumbnailUrl && (
                        <div className="w-32 h-20 rounded-lg border border-white/15 overflow-hidden mt-1 bg-black/50 shadow-md">
                          <img src={videoForm.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Prominent Live Progress Bar Box during Upload/Transcoding */}
                    {isVideoSaving && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#1c160f] to-[#120e0a] border border-[#c79c6e]/50 flex flex-col gap-3 animate-in fade-in duration-200 shadow-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-4 h-4 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                              {videoFile ? 'Mux Video Upload & Transcoding' : 'Saving Video...'}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#c79c6e] px-2 py-0.5 rounded bg-black/60 border border-[#c79c6e]/30">
                            {videoUploadProgress > 0 ? `${videoUploadProgress}%` : 'Processing...'}
                          </span>
                        </div>

                        <div className="w-full bg-black/70 rounded-full h-3 overflow-hidden border border-white/10 p-[1px]">
                          <div 
                            className="bg-gradient-to-r from-[#c79c6e] via-[#e4be93] to-[#c79c6e] h-full transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(199,156,110,0.5)]" 
                            style={{ width: `${Math.max(6, videoUploadProgress)}%` }} 
                          />
                        </div>

                        <p className="text-[0.72rem] text-white/80 font-mono flex items-center justify-between">
                          <span>{videoUploadStatusText || 'Uploading video to Mux cloud and generating HLS stream...'}</span>
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-white/70">Status:</label>
                        <select
                          value={videoForm.status}
                          disabled={isVideoSaving}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, status: e.target.value }))}
                          className="bg-[#050505] border border-white/10 rounded px-2.5 py-1 text-xs text-white cursor-pointer disabled:opacity-50"
                        >
                          <option value="Published">Published</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={isVideoSaving}
                          onClick={() => { setIsEditingVideo(false); setEditingVideoId(null); setVideoFile(null); }}
                          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold cursor-pointer disabled:opacity-40"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isVideoSaving}
                          className="px-5 py-2.5 rounded-lg bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#b0885e] transition-colors cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isVideoSaving ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              <span>{videoUploadProgress > 0 ? `Uploading (${videoUploadProgress}%)...` : 'Processing...'}</span>
                            </>
                          ) : (
                            <>
                              <FloppyDisk size={14} weight="bold" />
                              <span>{editingVideoId ? 'Update Video' : 'Save & Publish Video'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Videos List Grid */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Uploaded Videos ({libraryVideos.length})
                    </span>
                  </div>

                  {libraryVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {libraryVideos.map((vid) => (
                        <div key={vid._id || vid.id} className="bg-[#050505] border border-white/10 rounded-xl p-3 flex flex-col gap-2 group hover:border-[#c79c6e]/40 transition-colors">
                          <div 
                            className="w-full aspect-[16/10] bg-black/40 rounded overflow-hidden relative cursor-pointer group/thumb"
                            onClick={() => setPreviewingVideo(vid)}
                          >
                            {vid.thumbnailUrl ? (
                              <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500 opacity-80" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/20">
                                <Play size={28} />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/thumb:bg-black/10 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white group-hover/thumb:scale-110 group-hover/thumb:border-[#c79c6e] group-hover/thumb:text-[#c79c6e] transition-all">
                                <Play size={18} weight="fill" />
                              </div>
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[0.6rem] text-white font-mono">
                              {vid.muxPlaybackId ? 'MUX' : (vid.duration || 'VIDEO')}
                            </span>
                          </div>

                          <div className="flex flex-col flex-1 justify-between">
                            <div>
                              <h4 
                                className="font-serif text-sm text-white font-normal line-clamp-1 group-hover:text-[#c79c6e] transition-colors cursor-pointer"
                                onClick={() => setPreviewingVideo(vid)}
                              >
                                {vid.title}
                              </h4>
                              {vid.muxPlaybackId ? (
                                <p className="text-[0.65rem] text-emerald-400 mt-0.5 font-mono">
                                  ✓ Mux Video • {vid.duration || 'Ready'}
                                </p>
                              ) : vid.videoUrl && (
                                <p className="text-[0.65rem] text-white/40 truncate mt-0.5">
                                  {vid.videoUrl}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                              <span className={`text-[0.6rem] px-2 py-0.5 rounded uppercase font-semibold ${
                                vid.status === 'Published' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' : 'bg-white/5 text-white/50'
                              }`}>
                                {vid.status || 'Published'}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewingVideo(vid)}
                                  className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-[#c79c6e] transition-colors cursor-pointer"
                                  title="Play Preview"
                                >
                                  <Play size={14} weight="fill" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEditVideo(vid)}
                                  className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-[#c79c6e] transition-colors cursor-pointer"
                                  title="Edit Video"
                                >
                                  <Pen size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVideo(vid._id || vid.id)}
                                  className="p-1.5 rounded hover:bg-red-950/50 text-white/60 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Delete Video"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-white/10 rounded-xl text-center flex flex-col items-center gap-2">
                      <Play size={28} className="text-white/20" />
                      <p className="text-xs text-white/40">No videos uploaded yet in the library.</p>
                      <button
                        type="button"
                        onClick={handleOpenCreateVideo}
                        className="text-xs text-[#c79c6e] hover:underline font-semibold cursor-pointer"
                      >
                        Upload the first video
                      </button>
                    </div>
                  )}
                </div>

                {/* Admin Video Player Preview Modal */}
                {previewingVideo && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
                    <div 
                      className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer" 
                      onClick={() => setPreviewingVideo(null)}
                    />
                    
                    <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl z-10 flex flex-col">
                      <button 
                        className="absolute top-4 right-4 z-20 w-9 h-9 bg-black/70 hover:bg-[#c79c6e]/30 text-white hover:text-[#c79c6e] backdrop-blur flex items-center justify-center rounded-full transition-colors cursor-pointer"
                        onClick={() => setPreviewingVideo(null)}
                      >
                        <X size={18} />
                      </button>

                      {previewingVideo.muxPlaybackId ? (
                        <iframe 
                          src={`https://player.mux.com/${previewingVideo.muxPlaybackId}.html`}
                          title={previewingVideo.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                        />
                      ) : (
                        <iframe 
                          src={
                            previewingVideo.videoUrl?.includes('youtube.com/watch?v=')
                              ? previewingVideo.videoUrl.replace('watch?v=', 'embed/')
                              : previewingVideo.videoUrl?.includes('youtu.be/')
                              ? previewingVideo.videoUrl.replace('youtu.be/', 'youtube.com/embed/')
                              : previewingVideo.videoUrl
                          } 
                          title={previewingVideo.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                          allowFullScreen
                        />
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* =========================================================
              4. EDITORIAL ARTICLE STUDIO & MODULAR BLOCK BUILDER
             ========================================================= */}
          {activeTab === 'directory' && isEditingArticle && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
              
              {/* Studio Header Bar */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 sticky top-[77px] bg-[#050505]/95 backdrop-blur-md z-10 py-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingArticle(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={15} />
                    <span>Back to Catalog</span>
                  </button>
                  <h2 className="font-serif text-lg sm:text-xl text-white">
                    {articleForm.title ? renderFormattedTitle(articleForm.title) : 'New Editorial Article'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleSaveArticle}
                  className="px-6 py-2.5 rounded-lg bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#b0885e] transition-all cursor-pointer shadow-lg shadow-[#c79c6e]/20 flex items-center gap-1.5"
                >
                  <FloppyDisk size={16} weight="bold" />
                  <span>Save & Publish</span>
                </button>
              </div>

              {/* Main Clean Article Editor Form */}
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
                
                {/* Top Metadata Card */}
                <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e] flex items-center gap-2">
                      <BookOpen size={16} />
                      Article Overview & Taxonomy
                    </span>
                    <span className="text-[0.62rem] font-mono text-white/40">Step 1 of 2</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">
                        Category Pillar
                      </label>
                      <select
                        value={articleForm.category}
                        onChange={(e) => {
                          const found = CATEGORIES_LIST.find(c => c.id === e.target.value);
                          setArticleForm({ 
                            ...articleForm, 
                            category: e.target.value,
                            categoryNum: found?.num || '01 / 06'
                          });
                        }}
                        className="w-full bg-[#050505] border border-[#c79c6e]/40 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c79c6e] cursor-pointer"
                      >
                        <option value="RELATIONSHIPS">01 Relationships (01 / 06)</option>
                        <option value="SELF">02 Self (02 / 06)</option>
                        <option value="CHANGE">03 Change (03 / 06)</option>
                        <option value="DECISIONS">04 Decisions (04 / 06)</option>
                        <option value="DIFFICULT PEOPLE">05 Difficult People (05 / 06)</option>
                        <option value="COMMUNICATION">06 Communication (06 / 06)</option>
                      </select>
                    </div>

                    {/* Article Date */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                          Publication Date
                        </label>
                        <button
                          type="button"
                          onClick={() => setArticleForm(prev => ({ ...prev, date: getAutoPublicationDate() }))}
                          className="text-[0.62rem] text-[#c79c6e] hover:underline cursor-pointer flex items-center gap-1 font-mono"
                          title="Auto-fetch today's current date"
                        >
                          <Sparkle size={11} weight="fill" />
                          <span>Fetch Today</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={articleForm.date || ''}
                        onChange={(e) => setArticleForm({ ...articleForm, date: e.target.value })}
                        placeholder={getAutoPublicationDate()}
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                      />
                    </div>
                  </div>

                  {/* Main Article Title */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                        Article Title *
                      </label>
                      <span className="text-[0.68rem] text-[#c79c6e]">
                        💡 Tip: Wrap in <strong className="text-white font-mono">*asterisks*</strong> for gold italic (e.g. *Love*)
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={articleForm.title}
                      onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                      placeholder="Attention Feels Like *Love* (But Isn't)"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-base text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                    />

                    {articleForm.title && (
                      <div className="p-3 rounded-lg bg-[#050505] border border-white/5 flex items-center gap-2.5">
                        <span className="text-[0.62rem] uppercase tracking-wider text-white/40 font-mono shrink-0">Preview:</span>
                        <h3 className="font-serif text-base sm:text-lg text-white font-normal truncate">
                          {renderFormattedTitle(articleForm.title)}
                        </h3>
                      </div>
                    )}
                  </div>

                  {/* Subtitle / Hover Subtext */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                        Article Subtitle / Hover Card Subtext *
                      </label>
                      <span className="text-[0.68rem] text-[#c79c6e]">
                        💡 Tip: Wrap in <strong className="text-white font-mono">*asterisks*</strong> for gold italic highlight
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={articleForm.subtitle || articleForm.excerpt || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setArticleForm({ ...articleForm, subtitle: val, excerpt: val });
                      }}
                      placeholder="Why attention can feel intimate — and how a kinder, braver you can take the next step,"
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] resize-none leading-relaxed"
                    />

                    {/* Gold Highlight Text (Optional ending accent) */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
                      <div className="sm:col-span-12 flex flex-col gap-1">
                        <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#c79c6e]">
                          Gold Italic Ending Highlight (Optional)
                        </label>
                        <input
                          type="text"
                          value={articleForm.highlightText || ''}
                          onChange={(e) => setArticleForm({ ...articleForm, highlightText: e.target.value })}
                          placeholder="even in uncertainty."
                          className="w-full bg-[#050505] border border-[#c79c6e]/30 rounded-lg px-3.5 py-2 text-xs text-[#c79c6e] placeholder-[#c79c6e]/30 focus:outline-none focus:border-[#c79c6e]"
                        />
                      </div>
                    </div>

                    {/* Live Preview of Subtext as shown on Hover Popup & Article Page */}
                    {(articleForm.subtitle || articleForm.excerpt) && (
                      <div className="p-3.5 rounded-xl bg-[#11100e] border border-[#c79c6e]/20 flex flex-col gap-1.5 mt-1">
                        <span className="text-[0.62rem] uppercase tracking-wider text-[#c79c6e] font-mono flex items-center gap-1.5">
                          <Sparkle size={12} weight="fill" />
                          Live Hover Card Subtext Preview:
                        </span>
                        <p className="font-serif text-white/80 text-xs sm:text-[0.84rem] font-normal leading-relaxed">
                          {renderFormattedTitle(articleForm.subtitle || articleForm.excerpt)}
                          {articleForm.highlightText && (
                            <>
                              {' '}
                              <span className="text-[#c79c6e] italic font-serif">
                                {articleForm.highlightText}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Framed Artwork Visual Upload */}
                  <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">
                        Featured Artwork Visual (&lt; 200 KB)
                      </label>
                      <span className="text-[0.62rem] font-mono text-white/40">1200 × 750 px</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-4 aspect-[16/11] rounded-xl overflow-hidden border border-[#c79c6e]/30 bg-black flex items-center justify-center relative">
                        {articleForm.image ? (
                          <img
                            src={resolveImageUrl(articleForm.image)}
                            alt="Article preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={28} className="text-white/20" />
                        )}
                      </div>

                      <div className="sm:col-span-8 flex flex-col gap-2.5">
                        <button
                          type="button"
                          onClick={() => triggerImageUpload('articleImage')}
                          disabled={isUploading}
                          className="py-2.5 px-4 rounded-lg border border-[#c79c6e]/40 bg-[#c79c6e]/10 hover:bg-[#c79c6e]/20 text-[#c79c6e] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <UploadSimple size={15} weight="bold" />
                          <span>Upload Artwork Image (Under 200 KB)</span>
                        </button>

                        <input
                          type="text"
                          value={articleForm.image}
                          onChange={(e) => setArticleForm({ ...articleForm, image: e.target.value })}
                          placeholder="/library_preview_silhouette.jpg or URL"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── MODULAR CONTENT BLOCKS BUILDER ─── */}
                <div className="flex flex-col gap-5">
                  
                  {/* Content Blocks List */}
                  {articleForm.blocks?.map((block, bIndex) => (
                    <div
                      key={block.id || bIndex}
                      className="bg-[#0c0c0c] border border-white/10 hover:border-[#c79c6e]/40 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 transition-all relative group"
                    >
                      {/* Block Header Controls */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[0.62rem] font-mono text-white/50">
                            #{bIndex + 1}
                          </span>



                          {block.type === 'callout' && (
                            <span className="px-2.5 py-0.5 rounded bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.65rem] font-semibold text-[#c79c6e] uppercase tracking-wider flex items-center gap-1">
                              <Quotes size={13} weight="bold" />
                              Gold Left-Border Pull Quote
                            </span>
                          )}

                          {block.type === 'paragraphs' && (
                            <span className="px-2.5 py-0.5 rounded bg-white/10 border border-white/15 text-[0.65rem] font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1">
                              <Article size={13} />
                              Paragraphs
                            </span>
                          )}

                          {block.type === 'dropCap' && (
                            <span className="px-2.5 py-0.5 rounded bg-[#c79c6e]/20 border border-[#c79c6e]/40 text-[0.65rem] font-semibold text-[#c79c6e] uppercase tracking-wider flex items-center gap-1">
                              <Sparkle size={13} />
                              Golden Drop Cap Opening
                            </span>
                          )}
                        </div>

                        {/* Move Up, Down, Duplicate, Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(bIndex, 'up')}
                            disabled={bIndex === 0}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <CaretUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(bIndex, 'down')}
                            disabled={bIndex === (articleForm.blocks.length - 1)}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <CaretDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateBlock(bIndex)}
                            className="p-1.5 rounded bg-white/5 hover:bg-[#c79c6e]/20 text-white/60 hover:text-[#c79c6e] cursor-pointer text-[0.65rem] font-mono px-2"
                            title="Duplicate Block"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(bIndex)}
                            className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 cursor-pointer"
                            title="Delete Block"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>



                      {/* ─── BLOCK BODY TYPE: GOLD PULL QUOTE / CALLOUT ─── */}
                      {block.type === 'callout' && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-[#12100d] to-[#070707] border border-[#c79c6e]/30 flex flex-col gap-3.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/60">
                                Line 1 (White Italic)
                              </label>
                              <input
                                type="text"
                                value={block.line1 || ''}
                                onChange={(e) => handleUpdateBlock(bIndex, 'line1', e.target.value)}
                                placeholder="Attention says, “You’re interesting.”"
                                className="w-full bg-[#050505] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs font-serif italic text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#c79c6e]">
                                Line 2 (Gold Italic)
                              </label>
                              <input
                                type="text"
                                value={block.line2 || ''}
                                onChange={(e) => handleUpdateBlock(bIndex, 'line2', e.target.value)}
                                placeholder="Love says, “I’m in this with you.”"
                                className="w-full bg-[#050505] border border-[#c79c6e]/40 rounded-lg px-3.5 py-2.5 text-xs font-serif italic text-[#c79c6e] placeholder-white/20 focus:outline-none focus:border-[#c79c6e]"
                              />
                            </div>
                          </div>

                          {/* Callout Live Box Preview */}
                          {(block.line1 || block.line2) && (
                            <div className="border-l-2 border-[#c79c6e] pl-4 py-2 my-1 flex flex-col gap-1 bg-black/40 rounded-r">
                              {block.line1 && (
                                <p className="font-serif text-sm sm:text-base text-white/90 italic font-normal">
                                  {block.line1}
                                </p>
                              )}
                              {block.line2 && (
                                <p className="font-serif text-sm sm:text-base text-[#c79c6e] italic font-normal">
                                  {block.line2}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ─── BLOCK BODY TYPE: PARAGRAPHS (RICH TEXT EDITOR) ─── */}
                      {block.type === 'paragraphs' && (
                        <div className="flex flex-col gap-2.5">
                          <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e] flex items-center gap-1.5">
                            <Sparkle size={13} weight="fill" />
                            Rich Text Paragraphs & Content Editor
                          </label>
                          <TiptapEditor
                            value={block.text || ''}
                            onChange={(html) => handleUpdateBlock(bIndex, 'text', html)}
                          />
                        </div>
                      )}

                      {/* ─── BLOCK BODY TYPE: DROP CAP ─── */}
                      {block.type === 'dropCap' && (() => {
                        const rawText = (block.text || '').trimStart();
                        // Auto-extract starting letter if not manually set
                        const extractedLetter = rawText ? rawText.charAt(0).toUpperCase() : '';
                        const displayLetter = block.letter || extractedLetter || '—';
                        const displayRemainingText = block.letter && rawText.startsWith(block.letter)
                          ? rawText.slice(block.letter.length)
                          : (rawText.length > 1 ? rawText.slice(1) : '');

                        return (
                          <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                              
                              {/* Auto-Fetched Starting Letter Indicator */}
                              <div className="sm:col-span-2 flex flex-col gap-1.5">
                                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#c79c6e]">
                                  Auto Drop Cap
                                </label>
                                <div className="w-full bg-[#050505] border border-[#c79c6e]/40 rounded-lg py-2.5 flex items-center justify-center text-2xl font-serif text-[#c79c6e] font-normal shadow-inner select-none">
                                  {displayLetter}
                                </div>
                                <span className="text-[0.6rem] text-white/40 text-center font-mono">Auto from text</span>
                              </div>

                              {/* Full Opening Sentence Input */}
                              <div className="sm:col-span-10 flex flex-col gap-1.5">
                                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                                  Opening Sentence / First Paragraph
                                </label>
                                <textarea
                                  rows={3}
                                  value={block.text || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const firstChar = val.trimStart().charAt(0).toUpperCase();
                                    handleUpdateBlock(bIndex, 'text', val);
                                    if (firstChar) {
                                      handleUpdateBlock(bIndex, 'letter', firstChar);
                                    }
                                  }}
                                  placeholder="Type or paste your opening sentence here (e.g. We like to think love is unmistakable...)"
                                  className="w-full bg-[#050505] border border-white/10 rounded-lg p-3.5 text-sm font-serif text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] leading-relaxed resize-y"
                                />
                              </div>
                            </div>

                            {/* Live Golden Drop Cap Preview */}
                            <div className="p-4 rounded-xl bg-[#050505] border border-[#c79c6e]/20">
                              <span className="text-[0.62rem] uppercase tracking-wider text-white/40 font-mono block mb-1">Live Drop Cap Preview:</span>
                              <p className="font-serif text-base sm:text-lg text-white/85 leading-relaxed font-normal">
                                {displayLetter !== '—' && (
                                  <span className="float-left text-4xl sm:text-5xl font-serif text-[#c79c6e] leading-none pr-2.5 select-none font-normal">
                                    {displayLetter}
                                  </span>
                                )}
                                {renderFormattedTitle(displayRemainingText || (displayLetter === '—' ? 'Opening paragraph preview will appear here as you type...' : ''))}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                    </div>
                  ))}

                  {/* Bottom Add Bar */}
                  <div className="p-4 rounded-xl border border-dashed border-[#c79c6e]/30 bg-[#c79c6e]/5 flex flex-wrap items-center justify-center gap-2.5">
                    <span className="text-xs uppercase tracking-wider text-white/50 mr-2">Insert next element:</span>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('dropCap')}
                      className="px-3 py-1.5 rounded-lg bg-[#c79c6e]/20 hover:bg-[#c79c6e]/30 text-[#c79c6e] border border-[#c79c6e]/40 text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Sparkle size={13} weight="fill" />
                      <span>+ Golden Drop Cap</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddBlock('callout')}
                      className="px-3 py-1.5 rounded-lg bg-[#c79c6e]/15 hover:bg-[#c79c6e]/25 text-[#c79c6e] border border-[#c79c6e]/30 text-xs font-medium cursor-pointer"
                    >
                      + Pull Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('paragraphs')}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-xs font-medium cursor-pointer"
                    >
                      + Paragraphs
                    </button>
                  </div>

                </div>

                {/* Bottom Save Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 pb-12">
                  <button
                    type="button"
                    onClick={() => setIsEditingArticle(false)}
                    className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveArticle}
                    className="px-8 py-3 rounded-lg bg-[#c79c6e] hover:bg-[#b0885e] text-black font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#c79c6e]/20 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <FloppyDisk size={16} weight="bold" />
                    <span>Save & Publish Article</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}



