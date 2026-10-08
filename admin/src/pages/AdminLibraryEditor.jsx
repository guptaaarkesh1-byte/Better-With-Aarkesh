import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import {
  Sparkle,
  FloppyDisk,
  ArrowClockwise,
  ArrowSquareOut,
  FolderOpen,
  Plus,
  MagnifyingGlass,
  Pen,
  Trash,
  X,
  Article,
  Quotes,
  CheckCircle,
  Eye,
  EyeSlash,
  UploadSimple,
  BookOpen,
  Image as ImageIcon,
  ArrowLeft,
  CaretUp,
  CaretDown,
  DotsSixVertical,
  Faders,
  TextT,
  Sliders,
  Info
} from '@phosphor-icons/react';
import { CURATED_LIBRARY_ARTICLES } from '../../../client/src/constants/libraryArticlesData';
import TiptapEditor from '../components/ui/TiptapEditor';

import { API_URL } from '../utils/apiUrl';

// Left Sidebar Navigation Tabs for Library Page Editor
export const LIBRARY_SIDEBAR_TABS = [
  {
    id: 'universalTypography',
    label: 'Universal Font Size',
    icon: <Faders size={18} weight="bold" />,
    description: 'Typography scale, presets & sphere sizing',
    badge: 'STUDIO',
  },
  {
    id: 'hero',
    label: 'Hero',
    icon: <Sparkle size={18} weight="bold" />,
    description: 'Main headline, search bar & quote',
  },
  {
    id: 'articles',
    label: 'Upload Articles',
    icon: <BookOpen size={18} weight="bold" />,
    description: '6 category sections & article publishing',
  },
];

// Fixed 6 Core Categories
export const FIXED_LIBRARY_CATEGORIES = [
  {
    id: 'relationships',
    key: 'RELATIONSHIPS',
    num: '01',
    title: 'Relationships',
    numLabel: 'Relationships',
    subtitle: 'On connection, boundaries, projection, and the quiet courage of honest intimacy.',
    accent: '#d97fc8', // Original Relationships purple
    bg: '#3d1b37',
  },
  {
    id: 'self',
    key: 'SELF',
    num: '02',
    title: 'Self',
    numLabel: 'Self',
    subtitle: 'On identity, inner alignment, self-trust, and returning home to who you are.',
    accent: '#111010',
    bg: '#ffffff',
  },
  {
    id: 'change',
    key: 'CHANGE',
    num: '03',
    title: 'Change',
    numLabel: 'Change',
    subtitle: 'On life transitions, letting go, outgrowing old spaces, and starting before you feel ready.',
    accent: '#1e6830', // Deep green for admin
    bg: '#2f4a34',
  },
  {
    id: 'decisions',
    key: 'DECISIONS',
    num: '04',
    title: 'Decisions',
    numLabel: 'Decisions',
    subtitle: 'On cutting through analysis paralysis, weighing trade-offs, and choosing wholeheartedly.',
    accent: '#b84419', // Deep orange for admin
    bg: '#c85628',
  },
  {
    id: 'difficult-people',
    key: 'DIFFICULT PEOPLE',
    num: '05',
    title: 'Difficult People',
    numLabel: 'Difficult People',
    subtitle: 'On boundaries without guilt, distinguishing empathy from excusing, and preserving inner peace.',
    accent: '#8a3c10', // Deep terracotta for admin
    bg: '#f0d9c9',
  },
  {
    id: 'communication',
    key: 'COMMUNICATION',
    num: '06',
    title: 'Communication',
    numLabel: 'Communication',
    subtitle: 'On honest conversation, speaking hard truths with gentle hands, and naming repeating patterns.',
    accent: '#334155', // Deep slate for admin
    bg: '#141314',
  },
];

// Helper to render formatted italic titles (e.g. *understand*) with dynamic category accent color
export function renderFormattedTitle(text, accentColor = '#c79c6e') {
  if (!text || typeof text !== 'string') return text;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <span
          key={index}
          className="font-serif italic font-normal"
          style={{ color: accentColor }}
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}

// Helper to resolve backend upload URLs
export function resolveImageUrl(url, fallback = '/library_preview_silhouette.jpg') {
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

const DEFAULT_EDITORIAL_BLOCKS = [
  {
    id: 'block-dropcap-1',
    type: 'dropCap',
    letter: 'W',
    text: 'We like to think love is unmistakable. You feel it, you know it, and it stays.'
  },
  {
    id: 'block-p-1',
    type: 'paragraphs',
    text: '<p>But in reality, what often feels like love is attention. A few consistent messages. Someone who listens. A little curiosity about your day. Suddenly, it feels significant. It feels intimate. It feels like they care.</p><p>But attention and love are not the same thing.</p>'
  },
  {
    id: 'block-callout-1',
    type: 'callout',
    line1: 'Attention says, “You’re interesting.”',
    line2: 'Love says, “I’m in this with you.”'
  },
  {
    id: 'block-p-2',
    type: 'paragraphs',
    text: '<p>Attention comes and goes based on mood, novelty and convenience. Love stays even when the novelty fades, when things get uncomfortable, and when effort is required.</p>'
  }
];

export default function AdminLibraryEditor() {
  const { addToast } = useToast();

  // Active Sidebar Section Tab: 'universalTypography' | 'hero' | 'articles'
  const [activeTab, setActiveTab] = useState('universalTypography');

  // Mode: 'catalog' (list & hero) OR 'studio' (full article block editor)
  const [isEditingArticle, setIsEditingArticle] = useState(false);

  // Hero Section State
  const [heroSettings, setHeroSettings] = useState({
    headingText: 'What are you trying to *understand?*',
    searchPlaceholder: "Describe what you're navigating...",
  });
  const [savingHero, setSavingHero] = useState(false);

  // Active Category in Catalog View
  const [activeCategory, setActiveCategory] = useState(FIXED_LIBRARY_CATEGORIES[0]);
  const [articlesSearchQuery, setArticlesSearchQuery] = useState('');

  // Database Articles State
  const [dbArticles, setDbArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  // Drag and drop article reordering states
  const [draggedArticleIndex, setDraggedArticleIndex] = useState(null);
  const [dragOverArticleIndex, setDragOverArticleIndex] = useState(null);

  // Article Form State in Studio
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const fileInputRef = useRef(null);

  const [articleForm, setArticleForm] = useState({
    title: '',
    subtitle: '',
    categoryId: 'relationships',
    category: 'RELATIONSHIPS',
    categoryNum: '01 / 06',
    date: '12 SEP 2026',
    readTime: '6 MIN',
    status: 'Published',
    featuredImage: '',
    endingHighlight: '',
    blocks: DEFAULT_EDITORIAL_BLOCKS,
  });

  // Delete Confirmation Modal State
  const [deleteConfirmArticle, setDeleteConfirmArticle] = useState(null);

  // Universal Typography Studio State
  const [typographySettings, setTypographySettings] = useState({
    heroHeadingSize: 54,
    heroShiftY: -35,
    searchFontSize: 13,
    searchMaxWidth: 260,
    searchShiftY: -10,
    marqueeFontSize: 16,
    marqueeHeight: 52,
    categoryWordSize: 110,
    viewAllFontSize: 12,
    articleTitleSize: 17,
    articleMetaSize: 10,
    articleCountSize: 11,
    sphereSize: 320,
  });
  const [savingTypography, setSavingTypography] = useState(false);

  // Fetch Hero & Typography Settings
  const fetchHeroSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/library-settings`);
      if (res.ok) {
        const data = await res.json();
        if (data.hero) {
          setHeroSettings({
            headingText: data.hero.headingText || 'What are you trying to *understand?*',
            searchPlaceholder: data.hero.searchPlaceholder || "Describe what you're navigating...",
          });
        }
        if (data.typography) {
          setTypographySettings({
            heroHeadingSize: data.typography.heroHeadingSize ?? 54,
            heroShiftY: data.typography.heroShiftY ?? -35,
            searchFontSize: data.typography.searchFontSize ?? 13,
            searchMaxWidth: data.typography.searchMaxWidth ?? 260,
            searchShiftY: data.typography.searchShiftY ?? -10,
            marqueeFontSize: data.typography.marqueeFontSize ?? 16,
            marqueeHeight: data.typography.marqueeHeight ?? 52,
            categoryWordSize: data.typography.categoryWordSize ?? 110,
            viewAllFontSize: data.typography.viewAllFontSize ?? 12,
            articleTitleSize: data.typography.articleTitleSize ?? 17,
            articleMetaSize: data.typography.articleMetaSize ?? 10,
            articleCountSize: data.typography.articleCountSize ?? 11,
            sphereSize: data.typography.sphereSize ?? 320,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch library settings', err);
    }
  };

  // One-Click Typography Presets
  const applyTypographyPreset = (preset) => {
    if (preset === 'compact') {
      setTypographySettings({
        heroHeadingSize: 42,
        heroShiftY: -20,
        searchFontSize: 12,
        searchMaxWidth: 240,
        searchShiftY: -5,
        marqueeFontSize: 14,
        marqueeHeight: 44,
        categoryWordSize: 85,
        viewAllFontSize: 11,
        articleTitleSize: 15,
        articleMetaSize: 9,
        articleCountSize: 10,
        sphereSize: 260,
      });
      addToast('Applied Compact Preset', 'info');
    } else if (preset === 'balanced') {
      setTypographySettings({
        heroHeadingSize: 54,
        heroShiftY: -35,
        searchFontSize: 13,
        searchMaxWidth: 260,
        searchShiftY: -10,
        marqueeFontSize: 16,
        marqueeHeight: 52,
        categoryWordSize: 110,
        viewAllFontSize: 12,
        articleTitleSize: 17,
        articleMetaSize: 10,
        articleCountSize: 11,
        sphereSize: 320,
      });
      addToast('Applied Balanced Preset (Default)', 'info');
    } else if (preset === 'editorial') {
      setTypographySettings({
        heroHeadingSize: 64,
        heroShiftY: -40,
        searchFontSize: 14,
        searchMaxWidth: 300,
        searchShiftY: -15,
        marqueeFontSize: 18,
        marqueeHeight: 58,
        categoryWordSize: 128,
        viewAllFontSize: 13,
        articleTitleSize: 19,
        articleMetaSize: 10.5,
        articleCountSize: 12,
        sphereSize: 350,
      });
      addToast('Applied Bold Editorial Preset', 'info');
    } else if (preset === 'ultra') {
      setTypographySettings({
        heroHeadingSize: 72,
        heroShiftY: -50,
        searchFontSize: 15,
        searchMaxWidth: 340,
        searchShiftY: -20,
        marqueeFontSize: 20,
        marqueeHeight: 64,
        categoryWordSize: 145,
        viewAllFontSize: 14,
        articleTitleSize: 21,
        articleMetaSize: 11,
        articleCountSize: 13,
        sphereSize: 380,
      });
      addToast('Applied Ultra Impact Preset', 'info');
    }
  };

  // Save Typography Settings
  const handleSaveTypography = async () => {
    setSavingTypography(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/library-settings/typography`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(typographySettings),
      });
      if (res.ok) {
        addToast('⚡ Library Typography settings saved successfully!', 'success');
      } else {
        addToast('Failed to save typography settings', 'error');
      }
    } catch (err) {
      console.error('Failed to save typography settings', err);
      addToast('Error saving typography settings', 'error');
    } finally {
      setSavingTypography(false);
    }
  };

  // Fetch All Articles
  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const res = await fetch(`${API_URL}/api/articles`);
      if (res.ok) {
        const data = await res.json();
        setDbArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch articles', err);
      addToast('Failed to load articles from server', 'error');
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    fetchHeroSettings();
    fetchArticles();
  }, []);

  // Drag & Drop Handlers for Article Reordering
  const handleDragStart = (index, e) => {
    if (articlesSearchQuery) return;
    setDraggedArticleIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch (_) {}
  };

  const handleDragOver = (index, e) => {
    if (articlesSearchQuery) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverArticleIndex !== index) {
      setDragOverArticleIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedArticleIndex(null);
    setDragOverArticleIndex(null);
  };

  const handleDrop = async (targetIndex, e) => {
    e.preventDefault();
    if (articlesSearchQuery) return;
    if (draggedArticleIndex === null || draggedArticleIndex === targetIndex) {
      setDraggedArticleIndex(null);
      setDragOverArticleIndex(null);
      return;
    }

    const currentList = getCategoryArticles();
    const reordered = [...currentList];
    const [moved] = reordered.splice(draggedArticleIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setDraggedArticleIndex(null);
    setDragOverArticleIndex(null);

    // Optimistically update dbArticles with new orders
    const articleIds = reordered.map(a => a._id || a.id || a.slug);
    const reorderedMap = new Map();
    reordered.forEach((a, idx) => {
      const key = a._id || a.id || a.slug;
      reorderedMap.set(key, idx + 1);
    });

    setDbArticles(prev => prev.map(a => {
      const key = a._id || a.id || a.slug;
      if (reorderedMap.has(key)) {
        return { ...a, order: reorderedMap.get(key) };
      }
      return a;
    }));

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/articles/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ articleIds })
      });
      if (res.ok) {
        addToast('Article order updated and saved!', 'success');
      } else {
        throw new Error('Failed to save article order');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to save reordered articles', 'error');
      fetchArticles();
    }
  };

  // Save Hero Heading & Search Bar Settings
  const handleSaveHero = async () => {
    setSavingHero(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/library-settings/hero`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          headingText: heroSettings.headingText,
          searchPlaceholder: heroSettings.searchPlaceholder,
          headingLine1: 'What are you trying',
          headingLine2: 'to understand?'
        })
      });

      if (res.ok) {
        addToast('Hero heading and search bar settings saved!', 'success');
      } else {
        throw new Error('Failed to save hero settings');
      }
    } catch (err) {
      console.error(err);
      addToast('Error saving hero settings', 'error');
    } finally {
      setSavingHero(false);
    }
  };

  // Filter articles for active category purely from dbArticles (the source of truth)
  const getCategoryArticles = () => {
    const catId = (activeCategory.id || '').toLowerCase().replace(/\s+/g, '-');
    const catKey = (activeCategory.key || '').toUpperCase();

    // Matching DB articles
    const matchingDb = dbArticles.filter((a) => {
      const aCatId = (a.categoryId || a.category?.toLowerCase() || '').replace(/\s+/g, '-');
      const aCat = (a.category || '').toUpperCase();
      return aCatId === catId || aCatId.includes(catId) || aCat === catKey;
    });

    matchingDb.sort((a, b) => {
      const orderA = typeof a.order === 'number' && a.order > 0 ? a.order : 9999;
      const orderB = typeof b.order === 'number' && b.order > 0 ? b.order : 9999;
      if (orderA !== orderB) return orderA - orderB;
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeA - timeB;
    });

    if (!articlesSearchQuery.trim()) return matchingDb;

    const q = articlesSearchQuery.toLowerCase().trim();
    return matchingDb.filter(
      (a) =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.subtitle || '').toLowerCase().includes(q) ||
        (a.slug || '').toLowerCase().includes(q)
    );
  };

  // Open Studio for New Article (Clean Blank Slate)
  const handleOpenCreateArticle = () => {
    setEditingArticleId(null);
    setArticleForm({
      title: '',
      subtitle: '',
      categoryId: activeCategory.id,
      category: activeCategory.key,
      categoryNum: `${activeCategory.num} / 06`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      readTime: '6 MIN',
      status: 'Published',
      featuredImage: '',
      endingHighlight: '',
      blocks: [],
    });
    setIsEditingArticle(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Studio for Edit
  const handleOpenEditArticle = (article) => {
    setEditingArticleId(article._id || article.id || article.slug);

    const matchedCat = FIXED_LIBRARY_CATEGORIES.find(
      (c) => c.id === article.categoryId || c.key === (article.category || '').toUpperCase()
    ) || activeCategory;

    // Normalize blocks
    let blocks = article.blocks;
    if (!Array.isArray(blocks) || blocks.length === 0) {
      if (article.bodyHtml) {
        blocks = [
          {
            id: `block-p-${Date.now()}`,
            type: 'paragraphs',
            text: article.bodyHtml
          }
        ];
      } else {
        blocks = [];
      }
    }

    setArticleForm({
      title: article.title || '',
      subtitle: article.subtitle || article.excerpt || '',
      categoryId: matchedCat.id,
      category: matchedCat.key,
      categoryNum: `${matchedCat.num} / 06`,
      date: article.date || 'MAY 2026',
      readTime: article.readTime || '6 MIN',
      status: article.status || 'Published',
      featuredImage: article.featuredImage || article.image || '',
      endingHighlight: article.highlightText || article.endingHighlight || '',
      blocks: blocks,
    });

    setIsEditingArticle(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Block Helpers (Clean Blank Insertion)
  const handleAddBlock = (type) => {
    const newBlock = {
      id: `block-${type}-${Date.now()}`,
      type,
      ...(type === 'dropCap' ? { letter: '', text: '' } : {}),
      ...(type === 'paragraphs' ? { text: '' } : {}),
      ...(type === 'callout' ? { line1: '', line2: '' } : {}),
      ...(type === 'heading' ? { text: '' } : {}),
    };
    setArticleForm((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const handleUpdateBlock = (index, field, value) => {
    setArticleForm((prev) => {
      const nextBlocks = [...prev.blocks];
      nextBlocks[index] = {
        ...nextBlocks[index],
        [field]: value
      };
      return { ...prev, blocks: nextBlocks };
    });
  };

  const handleDeleteBlock = (index) => {
    setArticleForm((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index)
    }));
  };

  const handleDuplicateBlock = (index) => {
    setArticleForm((prev) => {
      const nextBlocks = [...prev.blocks];
      const target = nextBlocks[index];
      nextBlocks.splice(index + 1, 0, {
        ...target,
        id: `block-${target.type}-${Date.now()}`
      });
      return { ...prev, blocks: nextBlocks };
    });
  };

  const handleMoveBlock = (index, direction) => {
    setArticleForm((prev) => {
      const nextBlocks = [...prev.blocks];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= nextBlocks.length) return prev;
      const temp = nextBlocks[index];
      nextBlocks[index] = nextBlocks[targetIndex];
      nextBlocks[targetIndex] = temp;
      return { ...prev, blocks: nextBlocks };
    });
  };

  // Handle Cover Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('file', file);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (res.ok && (data?.imageUrl || data?.url)) {
        const uploadedPath = data.imageUrl || data.url;
        setArticleForm((prev) => ({
          ...prev,
          featuredImage: uploadedPath,
        }));
        addToast('Cover image uploaded successfully!', 'success');
      } else {
        throw new Error(data?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      addToast(err.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save Article (Create or Update)
  const handleSaveArticle = async (e) => {
    e?.preventDefault();
    if (!articleForm.title.trim()) {
      addToast('Please enter an article title', 'warning');
      return;
    }

    setSavingArticle(true);
    try {
      const token = localStorage.getItem('adminToken');
      const targetCat = FIXED_LIBRARY_CATEGORIES.find((c) => c.id === articleForm.categoryId) || activeCategory;

      const slug = articleForm.title
        .toLowerCase()
        .replace(/[*_\[\]\+\#]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Extract dropCap
      const dropCapBlock = articleForm.blocks.find((b) => b.type === 'dropCap');

      const payload = {
        ...(editingArticleId ? { id: editingArticleId, _id: editingArticleId } : {}),
        title: articleForm.title.trim(),
        subtitle: articleForm.subtitle.trim(),
        slug: slug || `article-${Date.now()}`,
        categoryId: targetCat.id,
        categoryTitle: targetCat.title,
        category: targetCat.key,
        categoryNum: `${targetCat.num} / 06`,
        readTime: articleForm.readTime.trim() || '6 MIN',
        date: articleForm.date.trim() || 'MAY 2026',
        status: articleForm.status,
        featuredImage: articleForm.featuredImage,
        image: articleForm.featuredImage,
        dropCap: dropCapBlock?.letter || 'W',
        dropCapText: dropCapBlock?.text || '',
        highlightText: articleForm.endingHighlight,
        blocks: articleForm.blocks,
        bodyHtml: articleForm.blocks
          .filter((b) => b.type === 'paragraphs')
          .map((b) => b.text)
          .join(''),
      };

      const res = await fetch(`${API_URL}/api/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast(editingArticleId ? 'Article updated successfully!' : 'Article published!', 'success');
        setIsEditingArticle(false);
        fetchArticles();
      } else {
        throw new Error('Failed to save article');
      }
    } catch (err) {
      console.error('Error saving article:', err);
      addToast('Error saving article', 'error');
    } finally {
      setSavingArticle(false);
    }
  };

  // Quick Toggle Status (Publish / Draft)
  const handleToggleStatus = async (article) => {
    const newStatus = article.status === 'Draft' ? 'Published' : 'Draft';
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...article,
          id: article._id || article.id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        addToast(`Article set to ${newStatus}`, 'success');
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to update status', 'error');
    }
  };

  // Delete Article Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmArticle) return;
    try {
      const token = localStorage.getItem('adminToken');
      const targetId = deleteConfirmArticle._id || deleteConfirmArticle.id || deleteConfirmArticle.slug;
      const targetSlug = deleteConfirmArticle.slug || '';
      const targetTitle = deleteConfirmArticle.title || '';

      // Immediately remove from local state so UI updates instantly
      setDbArticles((prev) =>
        prev.filter((a) => {
          if (a._id && a._id === targetId) return false;
          if (a.id && a.id === targetId) return false;
          if (targetSlug && a.slug === targetSlug) return false;
          if (targetTitle && a.title === targetTitle) return false;
          return true;
        })
      );

      const res = await fetch(`${API_URL}/api/articles/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          id: targetId,
          slug: targetSlug,
          title: targetTitle
        })
      });

      if (res.ok) {
        addToast('Article permanently deleted', 'success');
      } else {
        addToast('Article removed', 'info');
      }

      setDeleteConfirmArticle(null);
      fetchArticles();
    } catch (err) {
      console.error('Delete article error:', err);
      addToast('Failed to delete article', 'error');
    }
  };

  const categoryArticlesList = getCategoryArticles();

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#111010] font-sans pb-24">
      {/* =========================================================================
          VIEW 1: CATALOG & HERO VIEW (WHEN NOT IN STUDIO)
         ========================================================================= */}
      {!isEditingArticle ? (
        <>
          {/* Top Header */}
          <div className="border-b border-black/10 bg-[#faf7f0]/95 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest text-[#c9542f] uppercase bg-[#c9542f]/10 border border-[#c9542f]/30 px-2.5 py-0.5 rounded-full">
                  LIBRARY SECTION
                </span>
                <span className="text-stone-400 text-xs">•</span>
                <span className="text-stone-600 text-xs font-medium">6 Fixed Categories</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 font-normal mt-1">
                Library Directory & Article Studio
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  fetchHeroSettings();
                  fetchArticles();
                  addToast('Refreshed latest data', 'info');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 hover:text-black text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs"
              >
                <ArrowClockwise size={14} /> Reload
              </button>
              <a
                href="http://localhost:5173/library"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c9542f]/10 border border-[#c9542f]/30 hover:bg-[#c9542f]/20 text-[#c9542f] text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                <ArrowSquareOut size={14} /> View Live Site
              </a>
            </div>
          </div>

          {/* Main Layout: Left Sidebar + Right Editor Body */}
          <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto items-start">
            
            {/* ─── LEFT SIDEBAR TABS (STICKY) ─── */}
            <aside className="w-full md:w-72 lg:w-80 bg-[#faf7f0] border-r border-stone-200 p-4 lg:p-6 shrink-0 flex flex-col gap-2 md:sticky md:top-[73px] md:h-[calc(100vh-100px)] md:overflow-y-auto custom-scrollbar">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-stone-500 px-3 py-1">
                PAGE SECTIONS
              </span>

              <div className="flex flex-col gap-1.5 mt-1">
                {LIBRARY_SIDEBAR_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#c9542f]/10 border-2 border-[#c9542f] text-stone-900 shadow-sm'
                          : 'border border-transparent hover:bg-stone-200/50 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <div className={`mt-0.5 p-2 rounded-lg ${
                        isActive ? 'bg-[#c9542f] text-white' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {tab.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-semibold uppercase tracking-wider truncate ${
                            isActive ? 'text-[#c9542f]' : 'text-stone-900'
                          }`}>
                            {tab.label}
                          </span>
                          {tab.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#c9542f]/15 text-[#c9542f]">
                              {tab.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[0.72rem] text-stone-500 truncate mt-0.5">
                          {tab.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-stone-200">
                <div className="p-3.5 rounded-xl bg-[#f5f1e8] border border-stone-200 flex items-center gap-3 text-xs text-stone-600">
                  <Info size={18} className="text-[#c9542f] shrink-0" />
                  <span>All changes sync live to the Library frontend and database.</span>
                </div>
              </div>
            </aside>

            {/* ─── RIGHT CONTENT AREA ─── */}
            <main className="flex-1 p-6 lg:p-10 w-full min-w-0">

              {/* TAB 2: HERO SECTION (HEADER TEXTS & SEARCH BAR) */}
              {activeTab === 'hero' && (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#c9542f]/15 border border-[#c9542f]/30 flex items-center justify-center text-[#c9542f]">
                    <Sparkle size={18} weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-stone-900 tracking-wide">
                      Section Header Texts, Search Bar & Quote
                    </h2>
                    <p className="text-xs text-stone-500">
                      Customize the main library headline and search placeholder visible to users.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveHero}
                  disabled={savingHero}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c9542f] hover:bg-[#a64117] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-[#c9542f]/20 disabled:opacity-50 cursor-pointer"
                >
                  <FloppyDisk size={15} weight="bold" />
                  {savingHero ? 'Saving...' : 'Save Header Texts'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
                {/* Main Heading Text Input */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Main Hero Title
                    </label>
                    <span className="text-[11px] text-[#c9542f]">
                      Wrap words in <code className="bg-stone-100 px-1 py-0.5 rounded text-[#c9542f] font-mono">*asterisks*</code> for gold italic
                    </span>
                  </div>
                  <input
                    type="text"
                    value={heroSettings.headingText}
                    onChange={(e) => setHeroSettings({ ...heroSettings, headingText: e.target.value })}
                    placeholder="What are you trying to *understand*?"
                    className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-xl px-4 py-3 text-stone-900 text-sm outline-none transition-colors"
                  />
                  
                  {/* Live Preview */}
                  <div className="mt-2 p-4 bg-[#faf7f0] border border-stone-200 rounded-xl flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Live Visual Preview:</span>
                    <p className="font-serif text-2xl text-stone-900 font-light leading-snug">
                      {renderFormattedTitle(heroSettings.headingText || 'What are you trying to *understand*?')}
                    </p>
                  </div>
                </div>

                {/* Search Bar Placeholder Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Search Bar Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={heroSettings.searchPlaceholder}
                    onChange={(e) => setHeroSettings({ ...heroSettings, searchPlaceholder: e.target.value })}
                    placeholder="Describe what you're navigating..."
                    className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-xl px-4 py-3 text-stone-900 text-sm outline-none transition-colors"
                  />

                  {/* Live Preview */}
                  <div className="mt-2 p-4 bg-[#faf7f0] border border-stone-200 rounded-xl flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Live Search Bar Preview:</span>
                    <div className="bg-[#f5f1e8] rounded-full px-4 py-2.5 flex items-center justify-between text-[#111010] shadow-sm border border-stone-200">
                      <span className="text-xs text-[#8c867a] italic">
                        {heroSettings.searchPlaceholder || "Describe what you're navigating..."}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-[#111010] text-[#f5f1e8] flex items-center justify-center text-[10px]">
                        →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: UNIVERSAL FONT SIZE (TYPOGRAPHY & LAYOUT STUDIO) */}
          {activeTab === 'universalTypography' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#c9542f]/15 border border-[#c9542f]/30 flex items-center justify-center text-[#c9542f]">
                    <Faders size={18} weight="bold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-stone-900 tracking-wide">
                        Universal Typography & Layout Studio
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-[#c9542f]/10 text-[10px] font-bold text-[#c9542f] uppercase tracking-wider">
                        Live Sync
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      Adjust hero headline size, search bar proportions, ticker strip size, category card titles, and article fonts across the entire library.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSaveTypography}
                    disabled={savingTypography}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c9542f] hover:bg-[#a64117] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-[#c9542f]/20 disabled:opacity-50 cursor-pointer"
                  >
                    <FloppyDisk size={15} weight="bold" />
                    {savingTypography ? 'Saving...' : 'Save Typography'}
                  </button>
                </div>
              </div>

              {/* Quick Presets Bar */}
              <div className="py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-[#faf8f5] -mx-6 sm:-mx-8 px-6 sm:px-8">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600">
                  <Sparkle size={14} className="text-[#c9542f]" weight="fill" />
                  <span>One-Click Presets:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyTypographyPreset('compact')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Compact & Subtle
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTypographyPreset('balanced')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#c9542f]/40 text-[#c9542f] text-xs font-semibold hover:bg-[#c9542f]/10 transition-colors cursor-pointer"
                  >
                    Balanced (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTypographyPreset('editorial')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Bold Editorial
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTypographyPreset('ultra')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Ultra Impact
                  </button>
                </div>
              </div>

              {/* Interactive Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                
                {/* 1. Hero Section Group */}
                <div className="p-4 rounded-xl bg-[#faf7f0] border border-stone-200 flex flex-col gap-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9542f] flex items-center gap-1.5">
                    <TextT size={14} weight="bold" /> Hero Headline & Positioning
                  </span>

                  {/* Hero Heading Size */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Hero Headline Size</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.heroHeadingSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="32"
                      max="80"
                      value={typographySettings.heroHeadingSize}
                      onChange={(e) => setTypographySettings({ ...typographySettings, heroHeadingSize: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  {/* Hero Vertical Position (Shift Y) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Hero Vertical Shift</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.heroShiftY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-70"
                      max="30"
                      value={typographySettings.heroShiftY}
                      onChange={(e) => setTypographySettings({ ...typographySettings, heroShiftY: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>
                </div>

                {/* 2. Search Bar Group */}
                <div className="p-4 rounded-xl bg-[#faf7f0] border border-stone-200 flex flex-col gap-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9542f] flex items-center gap-1.5">
                    <MagnifyingGlass size={14} weight="bold" /> Search Bar Typography & Width
                  </span>

                  {/* Search Font Size */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Search Text Font Size</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.searchFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="11"
                      max="20"
                      value={typographySettings.searchFontSize}
                      onChange={(e) => setTypographySettings({ ...typographySettings, searchFontSize: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  {/* Search Bar Width */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Search Bar Max Width</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.searchMaxWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="480"
                      step="10"
                      value={typographySettings.searchMaxWidth}
                      onChange={(e) => setTypographySettings({ ...typographySettings, searchMaxWidth: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  {/* Search Vertical Shift Y */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Search Vertical Shift</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.searchShiftY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="30"
                      value={typographySettings.searchShiftY}
                      onChange={(e) => setTypographySettings({ ...typographySettings, searchShiftY: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>
                </div>

                {/* 3. Marquee Ticker Group */}
                <div className="p-4 rounded-xl bg-[#faf7f0] border border-stone-200 flex flex-col gap-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9542f] flex items-center gap-1.5">
                    <Sparkle size={14} weight="bold" /> Marquee Ticker Strip
                  </span>

                  {/* Marquee Font Size */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Ticker Text Size</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.marqueeFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="26"
                      value={typographySettings.marqueeFontSize}
                      onChange={(e) => setTypographySettings({ ...typographySettings, marqueeFontSize: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  {/* Marquee Height */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Ticker Strip Height</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.marqueeHeight}px</span>
                    </div>
                    <input
                      type="range"
                      min="36"
                      max="74"
                      value={typographySettings.marqueeHeight}
                      onChange={(e) => setTypographySettings({ ...typographySettings, marqueeHeight: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>
                </div>

                {/* 4. Giant Category Card Typography */}
                <div className="p-4 rounded-xl bg-[#faf7f0] border border-stone-200 flex flex-col gap-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9542f] flex items-center gap-1.5">
                    <BookOpen size={14} weight="bold" /> Category Card Titles
                  </span>

                  {/* Category Word Size */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Giant Category Word Size</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.categoryWordSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="160"
                      value={typographySettings.categoryWordSize}
                      onChange={(e) => setTypographySettings({ ...typographySettings, categoryWordSize: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  {/* View All Button Size */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>"VIEW ALL →" Font Size</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.viewAllFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="18"
                      value={typographySettings.viewAllFontSize}
                      onChange={(e) => setTypographySettings({ ...typographySettings, viewAllFontSize: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>
                </div>

                {/* 5. Article Rows Typography */}
                <div className="p-4 rounded-xl bg-[#faf7f0] border border-stone-200 flex flex-col gap-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9542f] flex items-center gap-1.5">
                    <Article size={14} weight="bold" /> Article Rows Inside Cards
                  </span>

                  {/* Article Title Size */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Article Title Font Size</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.articleTitleSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="13"
                      max="24"
                      value={typographySettings.articleTitleSize}
                      onChange={(e) => setTypographySettings({ ...typographySettings, articleTitleSize: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  {/* Article Meta Size */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Metadata (Read time, Tag)</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.articleMetaSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="14"
                      step="0.5"
                      value={typographySettings.articleMetaSize}
                      onChange={(e) => setTypographySettings({ ...typographySettings, articleMetaSize: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  {/* Article Count Size */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Article Count Label</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.articleCountSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="9"
                      max="16"
                      value={typographySettings.articleCountSize}
                      onChange={(e) => setTypographySettings({ ...typographySettings, articleCountSize: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>
                </div>

                {/* 6. 3D Artwork Sphere Sizing */}
                <div className="p-4 rounded-xl bg-[#faf7f0] border border-stone-200 flex flex-col gap-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9542f] flex items-center gap-1.5">
                    <Sparkle size={14} weight="bold" /> 3D Artwork Sphere Size
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>Plasma Sphere Diameter</span>
                      <span className="font-mono font-bold text-stone-900">{typographySettings.sphereSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="420"
                      step="10"
                      value={typographySettings.sphereSize}
                      onChange={(e) => setTypographySettings({ ...typographySettings, sphereSize: Number(e.target.value) })}
                      className="w-full accent-[#c9542f] cursor-pointer"
                    />
                  </div>

                  <p className="text-[11px] text-stone-500 mt-2">
                    Controls the visual dimension of the 3D plasma sphere rendered in each category section.
                  </p>
                </div>
              </div>

              {/* Real-Time Live Preview Bar */}
              <div
                className="mt-6 p-5 bg-[#111010] text-[#f5f1e8] rounded-xl flex flex-col gap-3 overflow-hidden border border-black preserve-dark"
                data-preserve-dark="true"
              >
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#c9542f]">
                  <span className="text-[#c9542f] font-bold">Live Typography Scale Preview</span>
                  <span className="text-white/40 font-mono text-[10px]">Real-Time Rendering</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 items-center">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-[10px] text-white/50 block uppercase font-mono mb-1">Hero Title:</span>
                    <p
                      className="font-serif leading-tight text-white font-normal"
                      style={{ fontSize: `${Math.min(typographySettings.heroHeadingSize, 36)}px` }}
                    >
                      What are you trying to <em className="text-[#c9542f] italic">understand?</em>
                    </p>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-[10px] text-white/50 block uppercase font-mono mb-1">Category Title:</span>
                    <p
                      className="font-black uppercase tracking-tight text-white leading-none font-sans"
                      style={{ fontSize: `${Math.min(typographySettings.categoryWordSize, 38)}px` }}
                    >
                      RELATIONSHIPS
                    </p>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-[10px] text-white/50 block uppercase font-mono mb-1">Article Title & Meta:</span>
                    <p
                      className="font-serif text-white/90 leading-tight"
                      style={{ fontSize: `${typographySettings.articleTitleSize}px` }}
                    >
                      On Saying What Matters
                    </p>
                      <span
                        className="text-white/50 uppercase font-mono mt-1 block"
                        style={{ fontSize: `${typographySettings.articleMetaSize}px` }}
                      >
                        6 MIN READ • ARTICLE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: UPLOAD ARTICLES (CATEGORY SECTIONS & ARTICLE STUDIO) */}
            {activeTab === 'articles' && (
              <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <h2 className="font-serif text-2xl text-stone-900 font-normal">
                  Category Sections & Article Studio
                </h2>
                <p className="text-xs text-stone-500">
                  Select any of the 6 fixed categories below to view its articles or open the editorial studio to publish new ones.
                </p>
              </div>

              {/* 6 Category Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {FIXED_LIBRARY_CATEGORIES.map((cat) => {
                  const isActive = activeCategory.id === cat.id;
                  const count = dbArticles.filter((a) => {
                    const aCatId = (a.categoryId || a.category?.toLowerCase() || '').replace(/\s+/g, '-');
                    const aCat = (a.category || '').toUpperCase();
                    return aCatId === cat.id || aCatId.includes(cat.id) || aCat === cat.key;
                  }).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[90px] cursor-pointer ${
                        isActive
                          ? 'bg-[#c9542f]/10 border-[#c9542f] shadow-sm ring-1 ring-[#c9542f]'
                          : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[11px] font-mono font-bold ${isActive ? 'text-[#c9542f]' : 'text-stone-500'}`}>
                          ({cat.num})
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-[#c9542f] text-white'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {count}
                        </span>
                      </div>
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider block mt-1 ${isActive ? 'text-[#c9542f]' : 'text-stone-800'}`}>
                          {cat.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CATEGORY ARTICLES LIST CONTAINER */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold font-mono tracking-widest text-[#c9542f]">
                        ({activeCategory.num}) {activeCategory.key}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs text-stone-600 font-semibold">
                        {categoryArticlesList.length} Articles Total
                      </span>
                      {!articlesSearchQuery && categoryArticlesList.length > 1 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#c9542f]/10 text-[#c9542f] px-2.5 py-0.5 rounded-full border border-[#c9542f]/20">
                          <DotsSixVertical size={13} weight="bold" /> Drag & drop cards to reorder
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 max-w-xl mt-0.5">
                      {activeCategory.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search in category */}
                    <div className="relative">
                      <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search articles..."
                        value={articlesSearchQuery}
                        onChange={(e) => setArticlesSearchQuery(e.target.value)}
                        className="bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-lg pl-8 pr-3 py-2 text-xs text-stone-900 outline-none w-48 transition-colors"
                      />
                      {articlesSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setArticlesSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* + Write / Upload Article Button */}
                    <button
                      type="button"
                      onClick={handleOpenCreateArticle}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#c9542f] hover:bg-[#a64117] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-[#c9542f]/20 cursor-pointer"
                    >
                      <Plus size={15} weight="bold" /> Write / Upload Article
                    </button>
                  </div>
                </div>

                {/* Articles Grid / List */}
                {loadingArticles ? (
                  <div className="py-16 text-center text-stone-500 text-xs flex flex-col items-center gap-3">
                    <ArrowClockwise size={22} className="animate-spin text-[#c9542f]" />
                    Loading category articles...
                  </div>
                ) : categoryArticlesList.length === 0 ? (
                  <div className="py-16 text-center text-stone-500 text-xs border border-dashed border-stone-200 rounded-xl p-8 flex flex-col items-center gap-3">
                    <BookOpen size={28} className="text-stone-300" />
                    <p>No articles found for ({activeCategory.num}) {activeCategory.title}.</p>
                    <button
                      type="button"
                      onClick={handleOpenCreateArticle}
                      className="mt-2 text-[#c9542f] hover:underline font-semibold cursor-pointer"
                    >
                      + Write the first article in this category
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryArticlesList.map((article, index) => {
                      const isPublished = article.status !== 'Draft';
                      const coverImg = resolveImageUrl(article.featuredImage || article.image);
                      const isDragging = draggedArticleIndex === index;
                      const isOver = dragOverArticleIndex === index && draggedArticleIndex !== index;

                      return (
                        <div
                          key={article._id || article.id || article.slug || index}
                          draggable={!articlesSearchQuery}
                          onDragStart={(e) => handleDragStart(index, e)}
                          onDragOver={(e) => handleDragOver(index, e)}
                          onDragEnd={handleDragEnd}
                          onDrop={(e) => handleDrop(index, e)}
                          className={`bg-[#faf7f0] rounded-xl p-5 flex flex-col justify-between gap-4 transition-all group relative overflow-hidden select-none ${
                            isDragging
                              ? 'opacity-40 scale-95 border-2 border-dashed border-[#c9542f] shadow-none cursor-grabbing'
                              : isOver
                              ? 'border-2 border-[#c9542f] shadow-xl ring-2 ring-[#c9542f]/40 scale-[1.02] bg-[#fcf4ed] cursor-grabbing'
                              : 'border border-stone-200 hover:border-[#c9542f]/40 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing'
                          }`}
                        >
                          <div className="flex flex-col gap-3">
                            {/* Cover Image & Badges */}
                            <div className="w-full h-36 rounded-lg overflow-hidden bg-stone-200 border border-stone-200 relative">
                              <img
                                src={coverImg}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.src = '/library_preview_silhouette.jpg';
                                }}
                              />
                              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-md ${
                                    isPublished
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-amber-600 text-white shadow-xs'
                                  }`}
                                >
                                  {article.status || 'Published'}
                                </span>
                              </div>

                              {/* Drag Grip Handle */}
                              {!articlesSearchQuery && (
                                <div
                                  className="absolute top-2.5 right-2.5 p-1 rounded bg-black/60 backdrop-blur-md text-white/80 hover:text-white cursor-grab active:cursor-grabbing hover:bg-black/80 transition-all shadow-xs"
                                  title="Drag & drop to reorder"
                                >
                                  <DotsSixVertical size={16} weight="bold" />
                                </div>
                              )}

                              <div className="absolute bottom-2.5 right-2.5 text-[10px] font-bold bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded">
                                {article.readTime || '6 MIN'}
                              </div>
                            </div>

                            {/* Title & Subtitle */}
                            <div>
                              <h3
                                className="font-serif text-base text-stone-900 font-semibold line-clamp-2 leading-snug transition-colors group-hover:text-[#c9542f]"
                              >
                                {renderFormattedTitle(article.title, activeCategory.accent)}
                              </h3>
                              {article.subtitle && (
                                <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                                  {renderFormattedTitle(article.subtitle, activeCategory.accent)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Card Bottom Actions */}
                          <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-stone-500 font-mono font-medium">
                              {article.date || 'MAY 2026'}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Publish/Draft Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(article)}
                                title={isPublished ? 'Switch to Draft' : 'Publish Article'}
                                className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
                                  isPublished ? 'text-emerald-600' : 'text-amber-600'
                                }`}
                              >
                                {isPublished ? <Eye size={15} /> : <EyeSlash size={15} />}
                              </button>

                              {/* Edit Article in Full Studio */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditArticle(article)}
                                title="Edit Article in Studio"
                                className="p-1.5 rounded hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                              >
                                <Pen size={15} />
                              </button>

                              {/* Delete Article */}
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmArticle(article)}
                                title="Delete Article"
                                className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  ) : (
        /* =========================================================================
            VIEW 2: FULL-PAGE ARTICLE STUDIO (STEP 1 & STEP 2 BLOCK BUILDER)
           ========================================================================= */
        (() => {
          const activeFormCategory = FIXED_LIBRARY_CATEGORIES.find((c) => c.id === articleForm.categoryId) || FIXED_LIBRARY_CATEGORIES[0];
          const currentAccent = activeFormCategory.accent || '#f3a8e2';

          return (
            <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-8 flex flex-col gap-8 animate-in fade-in duration-200">
              {/* Top Studio Header (Natural scrolling) */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-black/10">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingArticle(false)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 hover:text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                  >
                    <ArrowLeft size={14} weight="bold" /> Back to Catalog
                  </button>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider"
                      style={{
                        color: currentAccent,
                        borderColor: `${currentAccent}40`,
                        backgroundColor: `${currentAccent}15`
                      }}
                    >
                      ({activeFormCategory.num}) {activeFormCategory.key}
                    </span>
                    <h2 className="font-serif text-lg text-stone-900 font-semibold truncate max-w-md">
                      {renderFormattedTitle(articleForm.title || 'Untitled Article', currentAccent)}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingArticle(false)}
                    className="px-4 py-2.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveArticle}
                    disabled={savingArticle}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#c9542f] hover:bg-[#a64117] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-[#c9542f]/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <FloppyDisk size={16} weight="bold" />
                    <span>{savingArticle ? 'Saving...' : 'Save & Publish'}</span>
                  </button>
                </div>
              </div>

              {/* =========================================================================
                  STEP 1: ARTICLE OVERVIEW & TAXONOMY
                 ========================================================================= */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <span
                    className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    style={{ color: currentAccent }}
                  >
                    <BookOpen size={16} weight="fill" /> ARTICLE OVERVIEW & TAXONOMY
                  </span>
                  <span className="text-[11px] font-mono text-stone-500 font-semibold">Step 1 of 2</span>
                </div>

                {/* Row 1: Category Pillar & Publication Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Category Pillar
                    </label>
                    <select
                      value={articleForm.categoryId}
                      onChange={(e) => {
                        const matched = FIXED_LIBRARY_CATEGORIES.find((c) => c.id === e.target.value);
                        if (matched) {
                          setArticleForm({
                            ...articleForm,
                            categoryId: matched.id,
                            category: matched.key,
                            categoryNum: `${matched.num} / 06`,
                          });
                        }
                      }}
                      className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-xl px-4 py-3 text-stone-900 text-sm outline-none transition-colors"
                    >
                      {FIXED_LIBRARY_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.numLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Publication Date
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
                          setArticleForm({ ...articleForm, date: todayStr });
                        }}
                        className="text-[11px] hover:underline flex items-center gap-1 transition-colors font-semibold"
                        style={{ color: currentAccent }}
                      >
                        <Sparkle size={12} /> Fetch Today
                      </button>
                    </div>
                    <input
                      type="text"
                      value={articleForm.date}
                      onChange={(e) => setArticleForm({ ...articleForm, date: e.target.value })}
                      placeholder="12 SEP 2026"
                      className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-xl px-4 py-3 text-stone-900 text-sm outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Row 2: Article Title & Formatting Tip */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Article Title *
                    </label>
                    <span className="text-[11px] font-medium" style={{ color: currentAccent }}>
                      💡 Tip: Wrap in <code className="bg-stone-100 px-1 py-0.5 rounded font-mono" style={{ color: currentAccent }}>*asterisks*</code> for {activeFormCategory.title} italic highlight (e.g. *Love*)
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    placeholder="Attention *Feels* Like *Love* (But Isn't)"
                    className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-xl px-4 py-3 text-stone-900 font-serif text-lg outline-none transition-colors"
                  />
                  {/* Preview */}
                  <div className="p-3.5 bg-[#faf7f0] border border-stone-200 rounded-xl text-sm text-stone-800">
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-mono block mb-1">PREVIEW:</span>
                    <span className="font-serif text-xl text-stone-900 font-normal">
                      {renderFormattedTitle(articleForm.title || 'Untitled', currentAccent)}
                    </span>
                  </div>
                </div>

                {/* Row 3: Subtitle / Hover Card Subtext */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Article Subtitle / Hover Card Subtext *
                    </label>
                    <span className="text-[11px] font-medium" style={{ color: currentAccent }}>
                      💡 Tip: Wrap in <code className="bg-stone-100 px-1 py-0.5 rounded font-mono" style={{ color: currentAccent }}>*asterisks*</code> for {activeFormCategory.title} italic highlight
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={articleForm.subtitle}
                    onChange={(e) => setArticleForm({ ...articleForm, subtitle: e.target.value })}
                    placeholder="Why attention can feel intimate — and how a kinder, braver you can take the next step, even in uncertainty."
                    className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-xl px-4 py-3 text-stone-900 text-sm outline-none resize-y"
                  />
                  {articleForm.subtitle && (
                    <div className="p-3.5 bg-[#faf7f0] border border-stone-200 rounded-xl text-xs text-stone-800 break-words overflow-hidden">
                      <span className="text-[10px] uppercase tracking-widest text-stone-500 font-mono block mb-1">SUBTITLE PREVIEW:</span>
                      <p className="font-serif italic text-stone-800 leading-relaxed text-sm break-words" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                        {renderFormattedTitle(articleForm.subtitle, currentAccent)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Row 4: Read Time & Status & Cover Image */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Read Time
                    </label>
                    <input
                      type="text"
                      value={articleForm.readTime}
                      onChange={(e) => setArticleForm({ ...articleForm, readTime: e.target.value })}
                      placeholder="6 MIN"
                      className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-xl px-4 py-2.5 text-stone-900 text-sm outline-none font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Status
                    </label>
                    <select
                      value={articleForm.status}
                      onChange={(e) => setArticleForm({ ...articleForm, status: e.target.value })}
                      className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-xl px-4 py-2.5 text-stone-900 text-sm outline-none font-medium"
                    >
                      <option value="Published">Published (Live)</option>
                      <option value="Draft">Draft (Hidden)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Featured Cover Image
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0 relative">
                        <img
                          src={resolveImageUrl(articleForm.featuredImage)}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (!e.currentTarget.src.includes('library_preview_silhouette.jpg')) {
                              e.currentTarget.src = '/library_preview_silhouette.jpg';
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="px-3 py-1.5 rounded-lg bg-[#c9542f]/10 hover:bg-[#c9542f]/20 text-[#c9542f] border border-[#c9542f]/30 text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <UploadSimple size={13} />
                            {uploadingImage ? 'Uploading...' : 'Choose File'}
                          </button>
                          {articleForm.featuredImage && (
                            <button
                              type="button"
                              onClick={() => setArticleForm({ ...articleForm, featuredImage: '' })}
                              className="text-[11px] text-stone-500 hover:text-red-500 transition-colors font-medium cursor-pointer"
                              title="Reset to default image"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={articleForm.featuredImage || ''}
                          onChange={(e) => setArticleForm({ ...articleForm, featuredImage: e.target.value })}
                          placeholder="/library_preview_silhouette.jpg or URL"
                          className="w-full bg-[#fcfbf8] border border-stone-300 focus:border-[#c9542f] rounded-lg px-2.5 py-1 text-[11px] text-stone-900 font-mono outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  STEP 2: EDITORIAL CONTENT BLOCKS
                 ========================================================================= */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <span
                    className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    style={{ color: currentAccent }}
                  >
                    <Article size={16} weight="fill" /> EDITORIAL CONTENT BLOCKS
                  </span>
                  <span className="text-[11px] font-mono text-stone-500 font-semibold">Step 2 of 2</span>
                </div>

                {/* Block Items */}
                <div className="flex flex-col gap-5">
                  {articleForm.blocks.map((block, bIndex) => (
                    <div
                      key={block.id || bIndex}
                      className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col gap-5 shadow-sm relative overflow-hidden group"
                    >
                      {/* Block Header */}
                      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-bold text-stone-500">
                            #{bIndex + 1}
                          </span>
                          <span
                            className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border"
                            style={
                              block.type === 'dropCap' || block.type === 'callout'
                                ? {
                                    color: currentAccent,
                                    borderColor: `${currentAccent}40`,
                                    backgroundColor: `${currentAccent}15`,
                                  }
                                : {
                                    color: '#24211c',
                                    borderColor: 'rgba(0,0,0,0.15)',
                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                  }
                            }
                          >
                            {block.type === 'dropCap' && `✨ ${activeFormCategory.title.toUpperCase()} DROP CAP OPENING`}
                            {block.type === 'paragraphs' && 'PARAGRAPHS'}
                            {block.type === 'callout' && `99 ${activeFormCategory.title.toUpperCase()} LEFT-BORDER PULL QUOTE`}
                            {block.type === 'heading' && 'SECTION HEADING'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={bIndex === 0}
                            onClick={() => handleMoveBlock(bIndex, -1)}
                            className="p-1.5 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-stone-700 cursor-pointer"
                            title="Move Up"
                          >
                            <CaretUp size={14} />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={bIndex === articleForm.blocks.length - 1}
                            onClick={() => handleMoveBlock(bIndex, 1)}
                            className="p-1.5 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-stone-700 cursor-pointer"
                            title="Move Down"
                          >
                            <CaretDown size={14} />
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateBlock(bIndex)}
                            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer"
                            title="Duplicate Block"
                          >
                            Duplicate
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(bIndex)}
                            className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                            title="Delete Block"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>

                      {/* BLOCK BODY 1: CATEGORY DROP CAP */}
                      {block.type === 'dropCap' && (() => {
                        const rawText = (block.text || '').trimStart();
                        const extractedLetter = rawText ? rawText.charAt(0).toUpperCase() : '';
                        const displayLetter = block.letter || extractedLetter || '—';
                        const displayRemainingText = block.letter && rawText.toUpperCase().startsWith(block.letter.toUpperCase())
                          ? rawText.slice(block.letter.length)
                          : rawText;

                        return (
                          <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                              {/* Auto Drop Cap Letter Box */}
                              <div className="sm:col-span-2 flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: currentAccent }}>
                                  Auto Drop Cap
                                </label>
                                <div
                                  className="w-full bg-[#faf7f0] border rounded-xl py-3 flex items-center justify-center text-3xl font-serif font-normal shadow-xs select-none"
                                  style={{
                                    color: currentAccent,
                                    borderColor: `${currentAccent}60`,
                                  }}
                                >
                                  {displayLetter}
                                </div>
                                <span className="text-[10px] text-stone-500 text-center font-mono font-medium">Auto from text</span>
                              </div>

                              {/* Full Opening Sentence Input */}
                              <div className="sm:col-span-10 flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
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
                                  placeholder="Type or paste your opening sentence here (e.g. We like to think love is unmistakable. You feel it, you know it, and it stays...)"
                                  className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl p-3.5 text-sm font-serif text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c9542f] leading-relaxed resize-y"
                                />
                              </div>
                            </div>

                            {/* Live Category Drop Cap Preview */}
                            <div
                              className="p-5 rounded-xl bg-[#faf7f0] border overflow-hidden max-w-full break-words"
                              style={{ borderColor: `${currentAccent}30` }}
                            >
                              <span className="text-[10px] uppercase tracking-wider text-stone-500 font-mono font-bold block mb-2">
                                LIVE {activeFormCategory.title.toUpperCase()} DROP CAP PREVIEW:
                              </span>
                              <p className="font-serif text-lg sm:text-xl text-stone-900 leading-relaxed font-normal clear-both break-words" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                {displayLetter !== '—' && (
                                  <span
                                    className="float-left text-[3.2rem] sm:text-[3.8rem] font-serif leading-[0.76] mr-3 mt-0.5 select-none font-normal"
                                    style={{ color: currentAccent }}
                                  >
                                    {displayLetter}
                                  </span>
                                )}
                                {renderFormattedTitle(
                                  displayRemainingText || (displayLetter === '—' ? 'Opening paragraph preview will appear here as you type...' : ''),
                                  currentAccent
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* BLOCK BODY 2: PARAGRAPHS (RICH TEXT TIPTAP) */}
                      {block.type === 'paragraphs' && (
                        <div className="flex flex-col gap-2.5">
                          <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: currentAccent }}>
                            <Sparkle size={14} weight="fill" />
                            Rich Text Paragraphs & Content Editor
                          </label>
                          <TiptapEditor
                            content={block.text || ''}
                            onChange={(html) => handleUpdateBlock(bIndex, 'text', html)}
                            highlightColor={currentAccent}
                            highlightLabel={activeFormCategory.title}
                            placeholder="Write the full editorial paragraphs here. Use headings, blockquotes, bold italic words, and formatted paragraphs..."
                          />
                        </div>
                      )}

                      {/* BLOCK BODY 3: CATEGORY LEFT-BORDER PULL QUOTE */}
                      {block.type === 'callout' && (
                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                                Line 1 (Dark Italic)
                              </label>
                              <input
                                type="text"
                                value={block.line1 || ''}
                                onChange={(e) => handleUpdateBlock(bIndex, 'line1', e.target.value)}
                                placeholder="Attention says, “You’re interesting.”"
                                className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-serif italic text-stone-900 outline-none focus:border-[#c9542f]"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: currentAccent }}>
                                Line 2 ({activeFormCategory.title} Italic)
                              </label>
                              <input
                                type="text"
                                value={block.line2 || ''}
                                onChange={(e) => handleUpdateBlock(bIndex, 'line2', e.target.value)}
                                placeholder="Love says, “I’m in this with you.”"
                                style={{ color: currentAccent }}
                                className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-serif italic outline-none focus:border-[#c9542f]"
                              />
                            </div>
                          </div>

                          {/* Live Quote Preview */}
                          <div
                            className="p-5 rounded-xl bg-[#faf7f0] border-l-4 flex flex-col gap-1 font-serif text-lg overflow-hidden max-w-full break-words"
                            style={{ borderLeftColor: currentAccent }}
                          >
                            <p className="text-stone-900 italic leading-snug break-words" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                              {block.line1 || 'Attention says, “You’re interesting.”'}
                            </p>
                            {block.line2 && (
                              <p className="italic leading-snug break-words" style={{ color: currentAccent, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                {block.line2}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* BLOCK BODY 4: HEADING */}
                      {block.type === 'heading' && (
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                            Section Subheading Text
                          </label>
                          <input
                            type="text"
                            value={block.text || ''}
                            onChange={(e) => handleUpdateBlock(bIndex, 'text', e.target.value)}
                            placeholder="Why Attention Feels Like *Love*"
                            className="w-full bg-[#fcfbf8] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 font-serif text-base outline-none focus:border-[#c9542f]"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Bottom Insert Element Bar */}
                  <div
                    className="p-6 rounded-2xl border border-dashed flex flex-wrap items-center justify-center gap-3 bg-white shadow-xs"
                    style={{
                      borderColor: `${currentAccent}60`,
                    }}
                  >
                    <span className="text-xs uppercase tracking-wider text-stone-600 mr-2 font-bold">
                      Insert next element:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('dropCap')}
                      className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                      style={{
                        color: currentAccent,
                        borderColor: `${currentAccent}60`,
                        backgroundColor: `${currentAccent}15`,
                      }}
                    >
                      <Sparkle size={14} weight="fill" />
                      <span>+ {activeFormCategory.title} Drop Cap</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddBlock('callout')}
                      className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                      style={{
                        color: currentAccent,
                        borderColor: `${currentAccent}50`,
                        backgroundColor: `${currentAccent}10`,
                      }}
                    >
                      + Pull Quote
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddBlock('paragraphs')}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                    >
                      + Paragraphs
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddBlock('heading')}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                    >
                      + Heading
                    </button>
                  </div>

                  {/* Bottom Save Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-6 pb-16">
                    <button
                      type="button"
                      onClick={() => setIsEditingArticle(false)}
                      className="px-6 py-3 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors shadow-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveArticle}
                      disabled={savingArticle}
                      className="px-8 py-3 rounded-xl bg-[#c9542f] hover:bg-[#a64117] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-[#c9542f]/25 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      <FloppyDisk size={16} weight="bold" />
                      <span>{savingArticle ? 'Saving Article...' : 'Save & Publish Article'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {deleteConfirmArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-serif text-xl text-[#111010] font-bold">
              Delete Article?
            </h3>
            <p className="text-sm text-[#57534e] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#111010] font-semibold">"{deleteConfirmArticle.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmArticle(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#44403c] text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm shadow-red-600/20 transition-colors"
              >
                Delete Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
