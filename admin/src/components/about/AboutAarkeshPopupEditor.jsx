import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { 
  Play, 
  YoutubeLogo, 
  InstagramLogo, 
  ListPlus, 
  BookOpenText, 
  Gear, 
  Eye, 
  Trash, 
  UploadSimple, 
  ArrowUp, 
  ArrowDown, 
  Star, 
  Check, 
  X, 
  Plus, 
  MagnifyingGlass, 
  ArrowsClockwise, 
  Copy, 
  WarningCircle, 
  CheckCircle,
  VideoCamera,
  FolderOpen,
  PencilSimple,
  Sparkle,
  Image as ImageIcon,
  DotsSixVertical
} from '@phosphor-icons/react';
import * as UpChunk from '@mux/upchunk';
import MuxPlayer from '@mux/mux-player-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const parseYouTubeId = (input) => {
  if (!input) return null;
  const str = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const regExp = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = str.match(regExp);
  return match ? match[1] : null;
};

export const parseInstagramCode = (input) => {
  if (!input) return null;
  const str = input.trim();
  if (/^[a-zA-Z0-9_-]{8,15}$/.test(str)) return str;
  const match = str.match(/(?:instagram\.com\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+))/);
  return match ? match[1] : null;
};

export const countWords = (sections = []) => {
  return (sections || [])
    .map(s => s.text || '')
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
};

const AboutAarkeshPopupEditor = forwardRef(function AboutAarkeshPopupEditor(
  { onOpenPreview, showToast },
  ref
) {
  // Active sub-page tab
  const [subTab, setSubTab] = useState('settings'); // 'settings' | 'intro' | 'youtube' | 'reels' | 'categories' | 'story'

  // Main state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [initialDataJson, setInitialDataJson] = useState('');

  // Unsaved changes tracking
  const currentDataJson = useMemo(() => JSON.stringify(data || {}), [data]);
  const hasUnsavedChanges = useMemo(() => {
    if (!initialDataJson || !currentDataJson) return false;
    return initialDataJson !== currentDataJson;
  }, [initialDataJson, currentDataJson]);

  // Warn before leaving if unsaved edits
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Load from API
  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/about-popup/admin`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('Failed to load About Popup data');
      const result = await res.json();
      setData(result);
      setInitialDataJson(JSON.stringify(result));
    } catch (err) {
      console.error('Error loading About Popup data:', err);
      if (showToast) showToast('Failed to load About Popup data.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save to API
  const saveData = async () => {
    if (!data) return false;
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/about-popup/admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to save About Popup settings');
      }
      const savedRes = await res.json();
      setData(savedRes.data || data);
      setInitialDataJson(JSON.stringify(savedRes.data || data));
      if (showToast) showToast('About Aarkesh settings saved successfully!');
      return true;
    } catch (err) {
      console.error('Error saving About Popup settings:', err);
      if (showToast) showToast(err.message || 'Failed to save settings.', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Expose imperative handle to parent (for top SAVE SECTION button & reload)
  useImperativeHandle(ref, () => ({
    save: saveData,
    reload: () => loadData(false),
    getData: () => data,
    hasUnsavedChanges: () => hasUnsavedChanges
  }));

  // Image Upload helper
  const uploadImage = async (file, folder = 'aarkesh/about') => {
    if (!file) return null;
    if (file.size > 2 * 1024 * 1024) {
      if (showToast) showToast('Image must be under 2 MB. Please compress it.', 'error');
      return null;
    }
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData
    });
    if (!res.ok) throw new Error('Image upload failed');
    const result = await res.json();
    return result.imageUrl?.startsWith('http') ? result.imageUrl : `${API_URL}${result.imageUrl}`;
  };

  // -------------------------------------------------------------
  // SUB-PAGE 1: INTRO VIDEO (Mux) State & Handlers
  // -------------------------------------------------------------
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState('');
  const muxPollingRef = useRef(null);

  const startMuxPolling = (identifier) => {
    if (muxPollingRef.current) clearInterval(muxPollingRef.current);
    muxPollingRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_URL}/api/about-popup/mux-status/${identifier}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          const statusData = await res.json();
          if (statusData.status === 'ready' && statusData.playbackId) {
            clearInterval(muxPollingRef.current);
            setData(prev => ({
              ...prev,
              popup: {
                ...prev.popup,
                introVideo: {
                  ...prev.popup.introVideo,
                  status: 'ready',
                  playbackId: statusData.playbackId,
                  muxAssetId: statusData.assetId || prev.popup.introVideo.muxAssetId,
                  durationSeconds: statusData.durationSeconds || 120
                }
              }
            }));
            if (showToast) showToast('Intro video processed and ready on Mux!');
          } else if (statusData.status === 'errored') {
            clearInterval(muxPollingRef.current);
            setVideoUploadError('Mux video processing failed.');
            setData(prev => ({
              ...prev,
              popup: {
                ...prev.popup,
                introVideo: { ...prev.popup.introVideo, status: 'errored' }
              }
            }));
            if (showToast) showToast('Mux video encoding failed.', 'error');
          }
        }
      } catch (pollErr) {
        console.warn('Mux polling warning:', pollErr);
      }
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (muxPollingRef.current) clearInterval(muxPollingRef.current);
    };
  }, []);

  const handleMuxVideoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingVideo(true);
      setVideoUploadProgress(0);
      setVideoUploadError('');
      const token = localStorage.getItem('adminToken');

      // 1. Get Direct Upload URL from backend
      const res = await fetch(`${API_URL}/api/about-popup/mux-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to initialize Mux direct upload.');
      }
      const { uploadUrl, uploadId } = await res.json();

      // 2. Direct upload to Mux using @mux/upchunk
      const upload = UpChunk.createUpload({
        endpoint: uploadUrl,
        file: file,
        chunkSize: 5120, // 5MB chunks
      });

      upload.on('progress', (evt) => {
        setVideoUploadProgress(Math.round(evt.detail));
      });

      upload.on('success', () => {
        setVideoUploadProgress(100);
        setIsUploadingVideo(false);
        setData(prev => ({
          ...prev,
          popup: {
            ...prev.popup,
            introVideo: {
              ...prev.popup.introVideo,
              status: 'processing',
              muxUploadId: uploadId
            }
          }
        }));
        if (showToast) showToast('Video uploaded to Mux! Processing stream...');
        startMuxPolling(uploadId);
      });

      upload.on('error', (err) => {
        console.error('UpChunk error:', err);
        setIsUploadingVideo(false);
        setVideoUploadError(err.detail?.message || 'Mux direct upload failed.');
        if (showToast) showToast('Mux direct upload failed.', 'error');
      });
    } catch (err) {
      setIsUploadingVideo(false);
      setVideoUploadError(err.message || 'Failed to upload video');
      if (showToast) showToast(err.message || 'Upload failed', 'error');
    }
  };

  const handleRemoveVideo = async () => {
    if (!window.confirm('Are you sure you want to remove the intro video?')) return;
    const assetId = data?.popup?.introVideo?.muxAssetId;
    if (assetId) {
      try {
        const token = localStorage.getItem('adminToken');
        await fetch(`${API_URL}/api/about-popup/mux-asset/${assetId}`, {
          method: 'DELETE',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
      } catch (delErr) {
        console.warn('Mux asset delete error:', delErr);
      }
    }
    setData(prev => ({
      ...prev,
      popup: {
        ...prev.popup,
        introVideo: {
          ...prev.popup.introVideo,
          muxAssetId: '',
          muxUploadId: '',
          playbackId: '',
          status: 'none'
        }
      }
    }));
    if (showToast) showToast('Intro video removed.');
  };

  // Poster upload handler
  const handlePosterUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'aarkesh/about/poster');
      if (url) {
        setData(prev => ({
          ...prev,
          popup: {
            ...prev.popup,
            introVideo: {
              ...prev.popup.introVideo,
              poster: { url, publicId: '' },
              useMuxThumbnail: false
            }
          }
        }));
        if (showToast) showToast('Poster uploaded successfully!');
      }
    } catch (err) {
      if (showToast) showToast('Failed to upload poster.', 'error');
    }
  };

  // -------------------------------------------------------------
  // SUB-PAGE 2: YOUTUBE State & Handlers
  // -------------------------------------------------------------
  const [ytForm, setYtForm] = useState({
    inputUrl: '',
    title: '',
    category: '',
    thumbnailUrl: ''
  });
  const [ytSearch, setYtSearch] = useState('');
  const [ytFilterCat, setYtFilterCat] = useState('All');
  const [ytBulkOpen, setYtBulkOpen] = useState(false);
  const [ytBulkText, setYtBulkText] = useState('');
  const [ytBulkItems, setYtBulkItems] = useState([]);
  const [editingYtId, setEditingYtId] = useState(null);

  const parsedYtId = useMemo(() => parseYouTubeId(ytForm.inputUrl), [ytForm.inputUrl]);
  const isDuplicateYt = useMemo(() => {
    if (!parsedYtId || !data?.media) return false;
    return data.media.some(m => m.type === 'youtube' && m.externalId === parsedYtId && m.id !== editingYtId);
  }, [parsedYtId, data?.media, editingYtId]);

  const handleAddYouTube = () => {
    if (!parsedYtId) {
      if (showToast) showToast('Please enter a valid YouTube URL or 11-character video ID.', 'error');
      return;
    }
    if (isDuplicateYt) {
      if (showToast) showToast('This YouTube video is already in your list!', 'error');
      return;
    }
    if (!ytForm.title.trim()) {
      if (showToast) showToast('Please enter a title for the video.', 'error');
      return;
    }
    const cat = ytForm.category || data?.popup?.categories?.[0] || 'Mindset';

    if (editingYtId) {
      setData(prev => ({
        ...prev,
        media: prev.media.map(m => m.id === editingYtId ? {
          ...m,
          externalId: parsedYtId,
          title: ytForm.title.trim(),
          category: cat,
          thumbnail: { url: ytForm.thumbnailUrl.trim(), publicId: '' }
        } : m)
      }));
      setEditingYtId(null);
      if (showToast) showToast('YouTube video updated!');
    } else {
      const newItem = {
        id: `yt_${Date.now()}`,
        type: 'youtube',
        externalId: parsedYtId,
        title: ytForm.title.trim(),
        category: cat,
        thumbnail: { url: ytForm.thumbnailUrl.trim(), publicId: '' },
        published: true,
        sortOrder: data?.media?.filter(m => m.type === 'youtube').length || 0
      };
      setData(prev => ({
        ...prev,
        media: [newItem, ...prev.media]
      }));
      if (showToast) showToast('YouTube video added!');
    }

    setYtForm({ inputUrl: '', title: '', category: '', thumbnailUrl: '' });
  };

  const handleEditYouTube = (item) => {
    setEditingYtId(item.id);
    setYtForm({
      inputUrl: item.externalId,
      title: item.title,
      category: item.category,
      thumbnailUrl: item.thumbnail?.url || ''
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Bulk YouTube parsing
  const handleParseYtBulk = () => {
    const lines = ytBulkText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = lines.map((line, idx) => {
      const id = parseYouTubeId(line);
      return {
        key: `bulk_yt_${idx}`,
        id: id || '',
        title: id ? `YouTube Video: ${id}` : line,
        category: data?.popup?.categories?.[0] || 'Mindset',
        valid: Boolean(id)
      };
    });
    setYtBulkItems(parsed);
  };

  const handleApplyYtBulk = () => {
    const validItems = ytBulkItems.filter(b => b.valid && b.id);
    if (validItems.length === 0) {
      if (showToast) showToast('No valid YouTube IDs to add.', 'error');
      return;
    }
    const newMediaItems = validItems.map((item, idx) => ({
      id: `yt_${Date.now()}_${idx}`,
      type: 'youtube',
      externalId: item.id,
      title: item.title,
      category: item.category,
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: (data?.media?.length || 0) + idx
    }));
    setData(prev => ({
      ...prev,
      media: [...newMediaItems, ...prev.media]
    }));
    setYtBulkOpen(false);
    setYtBulkText('');
    setYtBulkItems([]);
    if (showToast) showToast(`Added ${newMediaItems.length} YouTube videos!`);
  };

  // -------------------------------------------------------------
  // SUB-PAGE 3: INSTAGRAM REELS State & Handlers
  // -------------------------------------------------------------
  const [igForm, setIgForm] = useState({
    inputUrl: '',
    title: '',
    category: '',
    thumbnailUrl: ''
  });
  const [igSearch, setIgSearch] = useState('');
  const [igFilterCat, setIgFilterCat] = useState('All');
  const [igBulkOpen, setIgBulkOpen] = useState(false);
  const [igBulkText, setIgBulkText] = useState('');
  const [igBulkItems, setIgBulkItems] = useState([]);
  const [editingIgId, setEditingIgId] = useState(null);
  const [isUploadingIgThumb, setIsUploadingIgThumb] = useState(false);

  const parsedIgCode = useMemo(() => parseInstagramCode(igForm.inputUrl), [igForm.inputUrl]);

  const handleAddInstagram = () => {
    if (!parsedIgCode) {
      if (showToast) showToast('Please enter a valid Instagram reel URL or code.', 'error');
      return;
    }
    if (!igForm.title.trim()) {
      if (showToast) showToast('Please enter a title for the reel.', 'error');
      return;
    }
    const cat = igForm.category || data?.popup?.categories?.[0] || 'Relationships';

    if (editingIgId) {
      setData(prev => ({
        ...prev,
        media: prev.media.map(m => m.id === editingIgId ? {
          ...m,
          externalId: parsedIgCode,
          title: igForm.title.trim(),
          category: cat,
          thumbnail: { url: igForm.thumbnailUrl.trim(), publicId: '' }
        } : m)
      }));
      setEditingIgId(null);
      if (showToast) showToast('Instagram reel updated!');
    } else {
      const newItem = {
        id: `ig_${Date.now()}`,
        type: 'instagram',
        externalId: parsedIgCode,
        title: igForm.title.trim(),
        category: cat,
        thumbnail: { url: igForm.thumbnailUrl.trim(), publicId: '' },
        featured: false,
        published: true,
        sortOrder: data?.media?.filter(m => m.type === 'instagram').length || 0
      };
      setData(prev => ({
        ...prev,
        media: [newItem, ...prev.media]
      }));
      if (showToast) showToast('Instagram reel added!');
    }
    setIgForm({ inputUrl: '', title: '', category: '', thumbnailUrl: '' });
  };

  const handleEditInstagram = (item) => {
    setEditingIgId(item.id);
    setIgForm({
      inputUrl: item.externalId,
      title: item.title,
      category: item.category,
      thumbnailUrl: item.thumbnail?.url || ''
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Reorder & Toggle Published
  const handleTogglePublished = (id) => {
    setData(prev => ({
      ...prev,
      media: prev.media.map(m => m.id === id ? { ...m, published: m.published === false ? true : false } : m)
    }));
  };

  const handleDeleteMedia = (id) => {
    if (!window.confirm('Delete this item?')) return;
    setData(prev => ({
      ...prev,
      media: prev.media.filter(m => m.id !== id)
    }));
    if (showToast) showToast('Item deleted.');
  };

  const handleMoveMedia = (id, direction, type) => {
    setData(prev => {
      const items = [...prev.media];
      const typeItems = items.filter(m => m.type === type);
      const idx = typeItems.findIndex(m => m.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= typeItems.length) return prev;

      // Swap sortOrder
      const temp = typeItems[idx];
      typeItems[idx] = typeItems[targetIdx];
      typeItems[targetIdx] = temp;

      // Reassign sequential sortOrder
      typeItems.forEach((m, i) => { m.sortOrder = i; });

      // Merge back into media
      const otherItems = items.filter(m => m.type !== type);
      return { ...prev, media: [...typeItems, ...otherItems] };
    });
  };

  // -------------------------------------------------------------
  // CATEGORIES State & Handlers (Managed via Dropdown Modal)
  // -------------------------------------------------------------
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCat, setEditingCat] = useState({ oldVal: '', newVal: '' });
  const [reassignModal, setReassignModal] = useState({ isOpen: false, catToDelete: '', targetCat: '' });
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [draggedCatIndex, setDraggedCatIndex] = useState(null);

  const handleCatDragStart = (e, index) => {
    setDraggedCatIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCatDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCatDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedCatIndex === null || draggedCatIndex === targetIndex) return;
    setData(prev => {
      const list = [...(prev.popup?.categories || [])];
      const [draggedItem] = list.splice(draggedCatIndex, 1);
      list.splice(targetIndex, 0, draggedItem);
      return {
        ...prev,
        popup: {
          ...prev.popup,
          categories: list
        }
      };
    });
    setDraggedCatIndex(null);
  };

  const handleCatDragEnd = () => {
    setDraggedCatIndex(null);
  };

  const handleAddCategory = () => {
    const val = newCatInput.trim();
    if (!val) return;
    if (data?.popup?.categories?.includes(val)) {
      if (showToast) showToast('This category already exists.', 'error');
      return;
    }
    setData(prev => ({
      ...prev,
      popup: {
        ...prev.popup,
        categories: [...(prev.popup.categories || []), val]
      }
    }));
    setNewCatInput('');
    if (showToast) showToast(`Category "${val}" added!`);
  };

  const handleRenameCategory = (oldVal, newVal) => {
    const clean = newVal.trim();
    if (!clean || clean === oldVal) {
      setEditingCat({ oldVal: '', newVal: '' });
      return;
    }
    setData(prev => ({
      ...prev,
      popup: {
        ...prev.popup,
        categories: prev.popup.categories.map(c => c === oldVal ? clean : c)
      },
      media: prev.media.map(m => m.category === oldVal ? { ...m, category: clean } : m)
    }));
    setEditingCat({ oldVal: '', newVal: '' });
    if (showToast) showToast(`Renamed category to "${clean}"`);
  };

  const handleDeleteCategoryPrompt = (cat) => {
    const itemsUsing = data?.media?.filter(m => m.category === cat) || [];
    if (itemsUsing.length > 0) {
      const remainingCats = (data?.popup?.categories || []).filter(c => c !== cat);
      setReassignModal({
        isOpen: true,
        catToDelete: cat,
        targetCat: remainingCats[0] || 'Mindset'
      });
    } else {
      if (window.confirm(`Delete category "${cat}"?`)) {
        setData(prev => ({
          ...prev,
          popup: {
            ...prev.popup,
            categories: prev.popup.categories.filter(c => c !== cat)
          }
        }));
        if (showToast) showToast(`Deleted category "${cat}"`);
      }
    }
  };

  const handleConfirmReassignAndDelete = () => {
    const { catToDelete, targetCat } = reassignModal;
    setData(prev => ({
      ...prev,
      popup: {
        ...prev.popup,
        categories: prev.popup.categories.filter(c => c !== catToDelete)
      },
      media: prev.media.map(m => m.category === catToDelete ? { ...m, category: targetCat } : m)
    }));
    setReassignModal({ isOpen: false, catToDelete: '', targetCat: '' });
    if (showToast) showToast(`Reassigned items to "${targetCat}" and deleted "${catToDelete}".`);
  };

  const handleMoveCategory = (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= data.popup.categories.length) return;
    setData(prev => {
      const copy = [...prev.popup.categories];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return {
        ...prev,
        popup: { ...prev.popup, categories: copy }
      };
    });
  };

  // -------------------------------------------------------------
  // SUB-PAGE 5: READ MORE PAGE State & Handlers
  // -------------------------------------------------------------
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSectionCollapse = (id) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSection = () => {
    const newSec = {
      id: `sec_${Date.now()}`,
      heading: 'New Section',
      text: 'Write your paragraph here.\n\nLeave a blank line between paragraphs.',
      quote: '',
      layout: 'right',
      image: { url: '', publicId: '', caption: '' }
    };
    setData(prev => ({
      ...prev,
      story: {
        ...prev.story,
        sections: [...(prev.story?.sections || []), newSec]
      }
    }));
    if (showToast) showToast('Section added!');
  };

  const handleDuplicateSection = (sec) => {
    const dupe = {
      ...sec,
      id: `sec_${Date.now()}`,
      heading: `${sec.heading} (Copy)`
    };
    setData(prev => ({
      ...prev,
      story: {
        ...prev.story,
        sections: [...(prev.story?.sections || []), dupe]
      }
    }));
    if (showToast) showToast('Section duplicated!');
  };

  const handleDeleteSection = (id) => {
    if (!window.confirm('Delete this section?')) return;
    setData(prev => ({
      ...prev,
      story: {
        ...prev.story,
        sections: (prev.story?.sections || []).filter(s => s.id !== id)
      }
    }));
    if (showToast) showToast('Section deleted.');
  };

  const handleMoveSection = (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const sections = data?.story?.sections || [];
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    setData(prev => {
      const copy = [...prev.story.sections];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return {
        ...prev,
        story: { ...prev.story, sections: copy }
      };
    });
  };

  // -------------------------------------------------------------
  // Filtered Media Lists
  // -------------------------------------------------------------
  const youtubeList = useMemo(() => {
    const items = (data?.media || []).filter(m => m.type === 'youtube');
    const q = ytSearch.trim().toLowerCase();
    return items.filter(m => {
      const matchCat = ytFilterCat === 'All' || m.category === ytFilterCat;
      const matchQ = !q || m.title?.toLowerCase().includes(q) || m.externalId?.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [data?.media, ytSearch, ytFilterCat]);

  const reelsList = useMemo(() => {
    const items = (data?.media || []).filter(m => m.type === 'instagram');
    const q = igSearch.trim().toLowerCase();
    return items.filter(m => {
      const matchCat = igFilterCat === 'All' || m.category === igFilterCat;
      const matchQ = !q || m.title?.toLowerCase().includes(q) || m.externalId?.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [data?.media, igSearch, igFilterCat]);

  const wordCount = useMemo(() => countWords(data?.story?.sections), [data?.story?.sections]);
  const estimatedReadTime = useMemo(() => Math.max(1, Math.round(wordCount / 200)), [wordCount]);

  if (loading || !data) {
    return (
      <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
        <ArrowsClockwise size={26} className="text-[#c79c6e] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-white/50">Loading About Aarkesh Control Center...</span>
      </div>
    );
  }

  const introStatus = data?.popup?.introVideo?.status || 'none';
  const introStatusColor = 
    introStatus === 'ready' ? 'bg-emerald-500' :
    introStatus === 'processing' ? 'bg-blue-500 animate-pulse' :
    introStatus === 'uploading' ? 'bg-amber-500 animate-pulse' :
    'bg-white/30';

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Bar with Live Unsaved Changes Warning and Preview Button */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e] flex items-center gap-1.5">
            <Sparkle size={14} weight="fill" />
            <span>Popup Control Center</span>
          </span>
          {hasUnsavedChanges && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Unsaved changes</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenPreview && onOpenPreview(data, 'main')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1a1714] text-[#c79c6e] border border-[#c79c6e]/40 hover:bg-[#c79c6e] hover:text-black transition-all flex items-center gap-2 shadow-sm"
          >
            <Eye size={15} weight="bold" />
            <span>Preview Popup</span>
          </button>
        </div>
      </div>

      {/* Horizontal Sub-Navigation Pills with Live Status / Counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* 1. Popup Settings */}
        <button
          type="button"
          onClick={() => setSubTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            subTab === 'settings'
              ? 'bg-[#c79c6e] text-black font-bold shadow-lg shadow-[#c79c6e]/20'
              : 'bg-[#0f0f0f] text-white/70 hover:text-white border border-white/10'
          }`}
        >
          <Gear size={15} weight="bold" />
          <span>Popup Settings</span>
        </button>

        {/* 2. Intro Video */}
        <button
          type="button"
          onClick={() => setSubTab('intro')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            subTab === 'intro'
              ? 'bg-[#c79c6e] text-black font-bold shadow-lg shadow-[#c79c6e]/20'
              : 'bg-[#0f0f0f] text-white/70 hover:text-white border border-white/10'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${introStatusColor}`} />
          <span>Intro Video</span>
          <span className="text-[10px] opacity-75 capitalize">({introStatus})</span>
        </button>

        {/* 3. YouTube Videos */}
        <button
          type="button"
          onClick={() => setSubTab('youtube')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            subTab === 'youtube'
              ? 'bg-[#c79c6e] text-black font-bold shadow-lg shadow-[#c79c6e]/20'
              : 'bg-[#0f0f0f] text-white/70 hover:text-white border border-white/10'
          }`}
        >
          <YoutubeLogo size={15} weight="fill" />
          <span>YouTube</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
            {data.media?.filter(m => m.type === 'youtube').length || 0}
          </span>
        </button>

        {/* 4. Instagram Reels */}
        <button
          type="button"
          onClick={() => setSubTab('reels')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            subTab === 'reels'
              ? 'bg-[#c79c6e] text-black font-bold shadow-lg shadow-[#c79c6e]/20'
              : 'bg-[#0f0f0f] text-white/70 hover:text-white border border-white/10'
          }`}
        >
          <InstagramLogo size={15} weight="bold" />
          <span>Instagram Reels</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
            {data.media?.filter(m => m.type === 'instagram').length || 0}
          </span>
        </button>



        {/* 6. Read More Page */}
        <button
          type="button"
          onClick={() => setSubTab('story')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            subTab === 'story'
              ? 'bg-[#c79c6e] text-black font-bold shadow-lg shadow-[#c79c6e]/20'
              : 'bg-[#0f0f0f] text-white/70 hover:text-white border border-white/10'
          }`}
        >
          <BookOpenText size={15} weight="bold" />
          <span>Read More Page</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
            {data.story?.sections?.length || 0} sec · {wordCount}w
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. INTRO VIDEO SUB-PAGE */}
      {/* ========================================================================= */}
      {subTab === 'intro' && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">2-Minute Introduction Video (Mux Stream)</span>
                <p className="text-xs text-white/50 mt-1">
                  Upload your intro video directly to Mux with fast global HLS/MP4 delivery. Ideal length: about 2 minutes.
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                introStatus === 'ready' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                introStatus === 'processing' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                'bg-white/10 text-white/60'
              }`}>
                Status: {introStatus}
              </span>
            </div>

            {/* Direct Upload Dropzone */}
            <div className="border-2 border-dashed border-white/15 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 bg-[#070707] hover:border-[#c79c6e]/50 transition-colors">
              <VideoCamera size={34} className="text-[#c79c6e]" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-white">Upload New Intro Video</span>
                <span className="text-xs text-white/50">Accepts MP4, MOV (max 500 MB). Encoded automatically by Mux.</span>
              </div>
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#c79c6e] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#e0b284] transition-all">
                <span>Select Video File</span>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/*"
                  className="hidden"
                  onChange={handleMuxVideoFile}
                  disabled={isUploadingVideo}
                />
              </label>

              {isUploadingVideo && (
                <div className="w-full max-w-md flex flex-col gap-1.5 mt-3">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Uploading directly to Mux...</span>
                    <span>{videoUploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#c79c6e] transition-all duration-200" style={{ width: `${videoUploadProgress}%` }} />
                  </div>
                </div>
              )}

              {videoUploadError && (
                <span className="text-xs text-rose-400 mt-1">{videoUploadError}</span>
              )}
            </div>

            {/* Video Playback Details & Stream Preview */}
            {data.popup?.introVideo?.playbackId && (
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#070707] border border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 bg-black rounded overflow-hidden shrink-0 border border-white/10 relative">
                      <img
                        src={`https://image.mux.com/${data.popup.introVideo.playbackId}/thumbnail.jpg?width=160&height=100&fit_mode=smart`}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">Active Playback ID: <code>{data.popup.introVideo.playbackId}</code></span>
                      <span className="text-[11px] text-white/40">Duration: ~{Math.round(data.popup.introVideo.durationSeconds || 120)}s · Status: Ready</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash size={14} />
                      <span>Remove Video</span>
                    </button>
                  </div>
                </div>

                {/* Inline Mux Player Stream Preview */}
                <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-black max-w-lg aspect-video">
                  <MuxPlayer
                    playbackId={data.popup.introVideo.playbackId}
                    streamType="on-demand"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
            )}

            {/* Poster Image Options */}
            <div className="pt-3 border-t border-white/5">
              {/* Poster Image */}
              <div className="flex flex-col gap-1.5 max-w-xl">
                <div className="flex items-center justify-between">
                  <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Video Poster Image</label>
                  <span className="text-[11px] text-[#ffa260] font-semibold">1280 × 720 px (under 200 KB)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all flex items-center gap-1.5">
                    <UploadSimple size={14} />
                    <span>Upload Poster</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} />
                  </label>

                  {data.popup?.introVideo?.playbackId && (
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                      <input
                        type="checkbox"
                        checked={Boolean(data.popup?.introVideo?.useMuxThumbnail)}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          popup: {
                            ...prev.popup,
                            introVideo: { ...prev.popup.introVideo, useMuxThumbnail: e.target.checked }
                          }
                        }))}
                        className="rounded accent-[#c79c6e]"
                      />
                      <span>Use Mux Auto Thumbnail</span>
                    </label>
                  )}
                </div>

                {data.popup?.introVideo?.poster?.url && !data.popup?.introVideo?.useMuxThumbnail && (
                  <div className="w-32 h-18 rounded overflow-hidden border border-white/15 mt-1 relative">
                    <img src={data.popup.introVideo.poster.url} alt="Poster preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. YOUTUBE VIDEOS SUB-PAGE */}
      {/* ========================================================================= */}
      {subTab === 'youtube' && (
        <div className="flex flex-col gap-6">
          {/* Add / Edit YouTube Card */}
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                {editingYtId ? 'Edit YouTube Video' : 'Add New YouTube Video'}
              </span>
              <button
                type="button"
                onClick={() => setYtBulkOpen(!ytBulkOpen)}
                className="text-xs text-[#c79c6e] hover:underline flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Bulk Import URLs</span>
              </button>
            </div>

            {/* Bulk Import drawer */}
            {ytBulkOpen && (
              <div className="p-4 bg-[#070707] border border-white/10 rounded-xl flex flex-col gap-3">
                <span className="text-xs font-semibold text-white">Bulk Add YouTube URLs (1 per line)</span>
                <textarea
                  rows={4}
                  value={ytBulkText}
                  onChange={(e) => setYtBulkText(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=...&#10;https://youtu.be/...&#10;https://youtube.com/shorts/..."
                  className="w-full bg-[#030303] border border-white/15 rounded-lg p-3 text-xs text-white font-mono"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleParseYtBulk}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
                  >
                    Parse URLs
                  </button>
                  {ytBulkItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleApplyYtBulk}
                      className="px-3 py-1.5 rounded-lg bg-[#c79c6e] text-black text-xs font-bold"
                    >
                      Add {ytBulkItems.filter(b => b.valid).length} Videos to List
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">YouTube URL or Video ID</label>
                <input
                  type="text"
                  value={ytForm.inputUrl}
                  onChange={(e) => setYtForm(prev => ({ ...prev, inputUrl: e.target.value }))}
                  placeholder="e.g. https://www.youtube.com/watch?v=DMLGaOgTszV or DMLGaOgTszV"
                  className={`w-full bg-[#050505] border rounded-lg px-4 py-2.5 text-xs text-white ${
                    isDuplicateYt ? 'border-amber-500' : 'border-white/10 focus:border-[#c79c6e]'
                  }`}
                />
                {parsedYtId ? (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check size={12} weight="bold" /> Detected ID: <code>{parsedYtId}</code>
                  </span>
                ) : (
                  <span className="text-[11px] text-white/40">Supports regular watch URLs, youtu.be, shorts, embeds or 11-char ID.</span>
                )}
                {isDuplicateYt && (
                  <span className="text-[11px] text-amber-400">⚠️ Video with this ID is already in your list.</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Category</label>
                  <button
                    type="button"
                    onClick={() => setIsCatManagerOpen(true)}
                    className="text-[11px] text-[#c79c6e] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={11} weight="bold" />
                    <span>Manage / Add Category</span>
                  </button>
                </div>
                <select
                  value={ytForm.category || data.popup?.categories?.[0] || 'Mindset'}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setIsCatManagerOpen(true);
                    } else {
                      setYtForm(prev => ({ ...prev, category: e.target.value }));
                    }
                  }}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#c79c6e]"
                >
                  {(data.popup?.categories || []).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__ADD_NEW__">＋ Add / Reorder Categories...</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Video Title</label>
                <input
                  type="text"
                  value={ytForm.title}
                  onChange={(e) => setYtForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Mastering Calm Under Extreme Pressure: The Cockpit Framework"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#c79c6e]"
                />
              </div>

              {/* Optional Custom Thumbnail */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                    Custom Thumbnail (Optional — default is YouTube's official HQ image)
                  </label>
                  <span className="text-[11px] text-[#ffa260] font-semibold">1280 × 720 px (under 200 KB)</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all flex items-center gap-1.5">
                    <UploadSimple size={14} />
                    <span>Upload Custom Thumbnail</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file, 'aarkesh/about/thumbnails');
                          if (url) setYtForm(prev => ({ ...prev, thumbnailUrl: url }));
                        }
                      }}
                    />
                  </label>
                  {ytForm.thumbnailUrl && (
                    <button
                      type="button"
                      onClick={() => setYtForm(prev => ({ ...prev, thumbnailUrl: '' }))}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Clear Custom
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail Live Preview */}
            {parsedYtId && (
              <div className="p-3 bg-[#070707] rounded-xl border border-white/10 flex items-center gap-3">
                <div className="w-24 h-14 rounded overflow-hidden bg-black shrink-0 relative">
                  <img
                    src={ytForm.thumbnailUrl || `https://img.youtube.com/vi/${parsedYtId}/mqdefault.jpg`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 grid place-items-center bg-black/30 text-white text-xs">▶</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">{ytForm.title || 'Untitled Video'}</span>
                  <span className="text-[11px] text-white/50">{ytForm.category || 'Mindset'} · YouTube ID: <code>{parsedYtId}</code></span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <div className="flex items-center gap-2">
                {editingYtId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingYtId(null);
                      setYtForm({ inputUrl: '', title: '', category: '', thumbnailUrl: '' });
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddYouTube}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#c79c6e] text-black hover:bg-[#e0b284] transition-all"
                >
                  {editingYtId ? 'Update Video' : 'Add to YouTube List'}
                </button>
              </div>
            </div>
          </div>

          {/* YouTube Items List */}
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                YouTube Videos ({youtubeList.length})
              </span>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search title or ID..."
                  value={ytSearch}
                  onChange={(e) => setYtSearch(e.target.value)}
                  className="bg-[#050505] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white w-40 sm:w-56"
                />
                <select
                  value={ytFilterCat}
                  onChange={(e) => setYtFilterCat(e.target.value)}
                  className="bg-[#050505] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="All">All Categories</option>
                  {(data.popup?.categories || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {youtubeList.length === 0 ? (
              <div className="py-8 text-center text-xs text-white/40">
                No YouTube videos found matching your filters.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {youtubeList.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#070707] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-18 h-12 bg-black rounded overflow-hidden shrink-0 relative border border-white/10">
                        <img
                          src={item.thumbnail?.url || `https://img.youtube.com/vi/${item.externalId}/mqdefault.jpg`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-white/40 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/70">{item.category}</span>
                          <span>ID: <code>{item.externalId}</code></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Published Toggle Slider */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(item.id)}
                        className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        title={item.published !== false ? 'Published (Click to hide)' : 'Hidden (Click to publish)'}
                      >
                        <div 
                          className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                            item.published !== false ? 'bg-emerald-500' : 'bg-stone-600'
                          }`}
                        >
                          <div 
                            className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                              item.published !== false ? 'translate-x-4' : 'translate-x-0'
                            }`} 
                          />
                        </div>
                        <span className={`text-[11px] font-semibold min-w-14 text-left ${item.published !== false ? 'text-emerald-400' : 'text-stone-400'}`}>
                          {item.published !== false ? 'Published' : 'Hidden'}
                        </span>
                      </button>

                      {/* Reorder Up/Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveMedia(item.id, 'up', 'youtube')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveMedia(item.id, 'down', 'youtube')}
                        disabled={idx === youtubeList.length - 1}
                        className="p-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown size={13} />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleEditYouTube(item)}
                        className="p-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white"
                      >
                        <PencilSimple size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(item.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INSTAGRAM REELS SUB-PAGE */}
      {/* ========================================================================= */}
      {subTab === 'reels' && (
        <div className="flex flex-col gap-6">
          {/* Add / Edit Instagram Reel Card */}
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                {editingIgId ? 'Edit Instagram Reel' : 'Add New Instagram Reel'}
              </span>
              <button
                type="button"
                onClick={() => setIgBulkOpen(!igBulkOpen)}
                className="text-xs text-[#c79c6e] hover:underline flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Bulk Import Reels</span>
              </button>
            </div>

            {/* Bulk Import drawer */}
            {igBulkOpen && (
              <div className="p-4 bg-[#070707] border border-white/10 rounded-xl flex flex-col gap-3">
                <span className="text-xs font-semibold text-white">Bulk Add Instagram Reel URLs (1 per line)</span>
                <textarea
                  rows={4}
                  value={igBulkText}
                  onChange={(e) => setIgBulkText(e.target.value)}
                  placeholder="https://www.instagram.com/reel/DMLGaOgTszV/&#10;https://www.instagram.com/p/.../&#10;DMLGaOgTszV"
                  className="w-full bg-[#030303] border border-white/15 rounded-lg p-3 text-xs text-white font-mono"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const lines = igBulkText.split('\n').map(l => l.trim()).filter(Boolean);
                      const parsed = lines.map((l, i) => ({
                        key: `bulk_ig_${i}`,
                        code: parseInstagramCode(l) || '',
                        title: `Instagram Reel ${l}`,
                        category: data.popup?.categories?.[0] || 'Relationships',
                        valid: Boolean(parseInstagramCode(l))
                      }));
                      setIgBulkItems(parsed);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
                  >
                    Parse Reel URLs
                  </button>
                  {igBulkItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const valid = igBulkItems.filter(b => b.valid && b.code);
                        const newItems = valid.map((item, idx) => ({
                          id: `ig_${Date.now()}_${idx}`,
                          type: 'instagram',
                          externalId: item.code,
                          title: item.title,
                          category: item.category,
                          thumbnail: { url: '', publicId: '' },
                          featured: false,
                          published: true,
                          sortOrder: (data?.media?.length || 0) + idx
                        }));
                        setData(prev => ({ ...prev, media: [...newItems, ...prev.media] }));
                        setIgBulkOpen(false);
                        setIgBulkText('');
                        setIgBulkItems([]);
                        if (showToast) showToast(`Added ${newItems.length} Instagram reels!`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#c79c6e] text-black text-xs font-bold"
                    >
                      Add {igBulkItems.filter(b => b.valid).length} Reels to List
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Instagram Reel URL or Code</label>
                <input
                  type="text"
                  value={igForm.inputUrl}
                  onChange={(e) => setIgForm(prev => ({ ...prev, inputUrl: e.target.value }))}
                  placeholder="e.g. https://www.instagram.com/reel/DMLGaOgTszV/ or DMLGaOgTszV"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#c79c6e]"
                />
                {parsedIgCode ? (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check size={12} weight="bold" /> Extracted Code: <code>{parsedIgCode}</code>
                  </span>
                ) : (
                  <span className="text-[11px] text-white/40">Accepts instagram.com/reel/CODE/, /p/CODE/ or raw code.</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Category</label>
                  <button
                    type="button"
                    onClick={() => setIsCatManagerOpen(true)}
                    className="text-[11px] text-[#c79c6e] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={11} weight="bold" />
                    <span>Manage / Add Category</span>
                  </button>
                </div>
                <select
                  value={igForm.category || data.popup?.categories?.[0] || 'Relationships'}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setIsCatManagerOpen(true);
                    } else {
                      setIgForm(prev => ({ ...prev, category: e.target.value }));
                    }
                  }}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#c79c6e]"
                >
                  {(data.popup?.categories || []).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__ADD_NEW__">＋ Add / Reorder Categories...</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Reel Title</label>
                <input
                  type="text"
                  value={igForm.title}
                  onChange={(e) => setIgForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Some people don’t leave your life with a bang (Outgrowing connections)"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#c79c6e]"
                />
              </div>

              {/* Portrait Thumbnail Dropzone (Cloudinary) */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">
                    Upload Reel Thumbnail (Portrait 9:14)
                  </label>
                  <span className="text-[11px] text-[#ffa260] font-semibold">540 × 840 px, portrait 9:14 (under 200 KB)</span>
                </div>

                <div className="flex items-center gap-4">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                    <UploadSimple size={15} />
                    <span>{isUploadingIgThumb ? 'Uploading...' : 'Upload Thumbnail (Cloudinary)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingIgThumb}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setIsUploadingIgThumb(true);
                            const url = await uploadImage(file, 'aarkesh/about/thumbnails');
                            if (url) setIgForm(prev => ({ ...prev, thumbnailUrl: url }));
                          } finally {
                            setIsUploadingIgThumb(false);
                          }
                        }
                      }}
                    />
                  </label>

                  {igForm.thumbnailUrl && (
                    <button
                      type="button"
                      onClick={() => setIgForm(prev => ({ ...prev, thumbnailUrl: '' }))}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Clear Thumbnail
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-white/40">
                  Instagram requires login to serve automatic thumbnails. Items without an uploaded thumbnail use the elegant warm gradient placeholder tile on the site.
                </span>
              </div>
            </div>

            {/* Live Portrait Preview */}
            <div className="p-4 bg-[#070707] rounded-xl border border-white/10 flex items-center gap-4">
              <div className="w-18 h-28 rounded-lg overflow-hidden shrink-0 border border-white/10 relative" style={{
                background: 'linear-gradient(135deg, #f9c98f, #e98b5b)'
              }}>
                {igForm.thumbnailUrl ? (
                  <img src={igForm.thumbnailUrl} alt="Reel preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-white/50 text-[10px]">9:14</div>
                )}
                <div className="absolute inset-0 grid place-items-center bg-black/20 text-white text-xs">▶</div>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">{igForm.title || 'Untitled Reel'}</span>
                <span className="text-[11px] text-white/50">{igForm.category || 'Relationships'} · Code: <code>{parsedIgCode || 'Pending'}</code></span>
                {!igForm.thumbnailUrl && (
                  <span className="text-[10px] text-amber-400 mt-1 font-semibold">Will use gradient placeholder tile</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {editingIgId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingIgId(null);
                    setIgForm({ inputUrl: '', title: '', category: '', thumbnailUrl: '' });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleAddInstagram}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#c79c6e] text-black hover:bg-[#e0b284] transition-all"
              >
                {editingIgId ? 'Update Reel' : 'Add to Reels List'}
              </button>
            </div>
          </div>

          {/* Instagram Reels List */}
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                Instagram Reels ({reelsList.length})
              </span>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search title or code..."
                  value={igSearch}
                  onChange={(e) => setIgSearch(e.target.value)}
                  className="bg-[#050505] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white w-40 sm:w-56"
                />
                <select
                  value={igFilterCat}
                  onChange={(e) => setIgFilterCat(e.target.value)}
                  className="bg-[#050505] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="All">All Categories</option>
                  {(data.popup?.categories || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {reelsList.length === 0 ? (
              <div className="py-8 text-center text-xs text-white/40">
                No Instagram reels found matching your filters.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {reelsList.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#070707] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-18 rounded overflow-hidden shrink-0 relative border border-white/10" style={{
                        background: 'linear-gradient(135deg, #f9c98f, #e98b5b)'
                      }}>
                        {item.thumbnail?.url ? (
                          <img src={item.thumbnail.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-white/70 text-xs">▶</div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                          {!item.thumbnail?.url && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/60 font-mono">
                              No thumbnail
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-white/40 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/70">{item.category}</span>
                          <span>Code: <code>{item.externalId}</code></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Published Toggle Slider */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(item.id)}
                        className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        title={item.published !== false ? 'Published (Click to hide)' : 'Hidden (Click to publish)'}
                      >
                        <div 
                          className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                            item.published !== false ? 'bg-emerald-500' : 'bg-stone-600'
                          }`}
                        >
                          <div 
                            className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                              item.published !== false ? 'translate-x-4' : 'translate-x-0'
                            }`} 
                          />
                        </div>
                        <span className={`text-[11px] font-semibold min-w-14 text-left ${item.published !== false ? 'text-emerald-400' : 'text-stone-400'}`}>
                          {item.published !== false ? 'Published' : 'Hidden'}
                        </span>
                      </button>

                      {/* Reorder Up/Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveMedia(item.id, 'up', 'instagram')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveMedia(item.id, 'down', 'instagram')}
                        disabled={idx === reelsList.length - 1}
                        className="p-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown size={13} />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleEditInstagram(item)}
                        className="p-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white"
                      >
                        <PencilSimple size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(item.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* 5. READ MORE PAGE SUB-PAGE */}
      {/* ========================================================================= */}
      {subTab === 'story' && (
        <div className="flex flex-col gap-6">
          {/* Header & Meta */}
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                  Read More Page Content (Form Fields Only · No Rich Text)
                </span>
                <p className="text-xs text-white/50 mt-1">
                  Plain text only with automatic paragraph formatting. Target ~600 words for optimal engagement.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-mono text-white/80">
                  {wordCount} words (~{estimatedReadTime} min read)
                </span>
                <button
                  type="button"
                  onClick={() => onOpenPreview && onOpenPreview(data, 'story')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#c79c6e] text-black text-xs font-bold flex items-center gap-1.5"
                >
                  <Eye size={14} weight="bold" />
                  <span>Preview Read More</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Kicker (Small Top Label)</label>
                <input
                  type="text"
                  value={data.story?.kicker || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    story: { ...prev.story, kicker: e.target.value }
                  }))}
                  placeholder="My story"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#c79c6e]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Page Title</label>
                <input
                  type="text"
                  value={data.story?.title || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    story: { ...prev.story, title: e.target.value }
                  }))}
                  placeholder="The Journey Behind the Mission"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#c79c6e]"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Intro Line (Italic Lead)</label>
                <input
                  type="text"
                  value={data.story?.lead || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    story: { ...prev.story, lead: e.target.value }
                  }))}
                  placeholder="From the skies to the soul, here is the story behind why I do what I do."
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white italic focus:border-[#c79c6e]"
                />
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">
                Story Sections ({(data.story?.sections || []).length})
              </span>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#c79c6e] text-black hover:bg-[#e0b284] transition-all flex items-center gap-1.5"
              >
                <Plus size={14} weight="bold" />
                <span>Add Section</span>
              </button>
            </div>

            {(data.story?.sections || []).map((sec, idx) => {
              const isCollapsed = Boolean(collapsedSections[sec.id]);

              return (
                <div
                  key={sec.id}
                  className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-5 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <button
                      type="button"
                      onClick={() => toggleSectionCollapse(sec.id)}
                      className="flex items-center gap-2 text-left"
                    >
                      <span className="text-xs font-mono text-[#c79c6e] font-bold">
                        Section {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {sec.heading || 'Untitled Section'}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white/5 text-white/70 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, 'down')}
                        disabled={idx === (data.story?.sections?.length || 0) - 1}
                        className="p-1 rounded bg-white/5 text-white/70 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateSection(sec)}
                        title="Duplicate"
                        className="p-1 rounded bg-white/5 text-white/70 hover:text-white"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1 rounded bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="flex flex-col gap-4 pt-1">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.68rem] text-white/60 uppercase tracking-widest font-semibold">Heading</label>
                        <input
                          type="text"
                          value={sec.heading || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setData(prev => ({
                              ...prev,
                              story: {
                                ...prev.story,
                                sections: prev.story.sections.map(s => s.id === sec.id ? { ...s, heading: val } : s)
                              }
                            }));
                          }}
                          placeholder="e.g. The Sky Taught Me Calm"
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#c79c6e]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[0.68rem] text-white/60 uppercase tracking-widest font-semibold">Writeup (Paragraphs)</label>
                          <span className="text-[11px] text-white/40">Leave a blank line to start a new paragraph.</span>
                        </div>
                        <textarea
                          rows={6}
                          value={sec.text || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setData(prev => ({
                              ...prev,
                              story: {
                                ...prev.story,
                                sections: prev.story.sections.map(s => s.id === sec.id ? { ...s, text: val } : s)
                              }
                            }));
                          }}
                          placeholder="Write section narrative here..."
                          className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-xs text-white leading-relaxed font-sans"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.68rem] text-white/60 uppercase tracking-widest font-semibold">Pull Quote (Optional)</label>
                        <input
                          type="text"
                          value={sec.quote || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setData(prev => ({
                              ...prev,
                              story: {
                                ...prev.story,
                                sections: prev.story.sections.map(s => s.id === sec.id ? { ...s, quote: val } : s)
                              }
                            }));
                          }}
                          placeholder='e.g. "Calm is a skill. You can train it."'
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ffa260] italic focus:border-[#ffa260]"
                        />
                      </div>

                      {/* Image settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.68rem] text-white/60 uppercase tracking-widest font-semibold">Image Position</label>
                          <select
                            value={sec.layout || 'right'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setData(prev => ({
                                ...prev,
                                story: {
                                  ...prev.story,
                                  sections: prev.story.sections.map(s => s.id === sec.id ? { ...s, layout: val } : s)
                                }
                              }));
                            }}
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                          >
                            <option value="right">Right of text (Square 1:1, 1200×900)</option>
                            <option value="left">Left of text (Square 1:1, 1200×900)</option>
                            <option value="full">Full width below text (1600×800)</option>
                            <option value="none">No image</option>
                          </select>
                        </div>

                        {sec.layout !== 'none' && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[0.68rem] text-white/60 uppercase tracking-widest font-semibold">Section Image</label>
                              <span className="text-[11px] text-[#ffa260] font-semibold">Under 2 MB</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all flex items-center gap-1.5">
                                <UploadSimple size={13} />
                                <span>Upload Image</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const url = await uploadImage(file, 'aarkesh/about/story');
                                      if (url) {
                                        setData(prev => ({
                                          ...prev,
                                          story: {
                                            ...prev.story,
                                            sections: prev.story.sections.map(s => s.id === sec.id ? {
                                              ...s,
                                              image: { ...(s.image || {}), url }
                                            } : s)
                                          }
                                        }));
                                      }
                                    }
                                  }}
                                />
                              </label>
                              {sec.image?.url && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setData(prev => ({
                                      ...prev,
                                      story: {
                                        ...prev.story,
                                        sections: prev.story.sections.map(s => s.id === sec.id ? {
                                          ...s,
                                          image: { ...(s.image || {}), url: '' }
                                        } : s)
                                      }
                                    }));
                                  }}
                                  className="text-xs text-rose-400 hover:underline"
                                >
                                  Remove Image
                                </button>
                              )}
                            </div>
                            {sec.image?.url && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 mt-1">
                                <img src={sec.image.url} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. POPUP SETTINGS SUB-PAGE */}
      {/* ========================================================================= */}
      {subTab === 'settings' && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#c79c6e]">General Popup Behavior & Settings</span>

            {/* Master Toggle */}
            <div 
              className="p-4 rounded-xl border border-[#c79c6e]/40 flex items-center justify-between"
              style={{ backgroundColor: '#f5f1e8' }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold" style={{ color: '#111010' }}>
                  Enable About Popup on Role Cards
                </span>
                <span className="text-xs" style={{ color: '#554e44' }}>
                  When enabled, clicking Pilot, Coach, or Human cards opens this About Aarkesh popup.
                </span>
              </div>
              <input
                type="checkbox"
                checked={data.popup?.enabled !== false}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  popup: { ...prev.popup, enabled: e.target.checked }
                }))}
                className="w-5 h-5 rounded accent-[#c79c6e] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Popup Title</label>
                <input
                  type="text"
                  value={data.popup?.title || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    popup: { ...prev.popup, title: e.target.value }
                  }))}
                  placeholder="ABOUT AARKESH"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#c79c6e]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Read More Button Label</label>
                <input
                  type="text"
                  value={data.popup?.readMoreLabel || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    popup: { ...prev.popup, readMoreLabel: e.target.value }
                  }))}
                  placeholder="Read More"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#c79c6e]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/60">Grid Page Size (Items per load)</label>
                <input
                  type="number"
                  min={4}
                  max={48}
                  step={4}
                  value={data.popup?.pageSize || 12}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    popup: { ...prev.popup, pageSize: Number(e.target.value) || 12 }
                  }))}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-[#c79c6e]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                  <input
                    type="checkbox"
                    checked={data.popup?.showYoutube !== false}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      popup: { ...prev.popup, showYoutube: e.target.checked }
                    }))}
                    className="rounded accent-[#c79c6e]"
                  />
                  <span>Show YouTube Tab</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                  <input
                    type="checkbox"
                    checked={data.popup?.showInstagram !== false}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      popup: { ...prev.popup, showInstagram: e.target.checked }
                    }))}
                    className="rounded accent-[#c79c6e]"
                  />
                  <span>Show Instagram Reels Tab</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Category Manager Modal with Drag & Drop Reordering */}
      {isCatManagerOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setIsCatManagerOpen(false)}
        >
          <div 
            className="w-full max-w-lg border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col gap-4"
            style={{ backgroundColor: '#141210', color: '#ffffff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ListPlus size={18} className="text-[#c79c6e]" weight="bold" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Manage & Reorder Categories
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCatManagerOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Drag categories using the grip handle <span className="font-mono text-[#c79c6e]">⠿</span> to change their display order. This reorders filter chips on the live popup and in dropdowns.
            </p>

            {/* Quick Add Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                placeholder="New Category Name (e.g. Leadership, Habits)..."
                className="flex-1 bg-[#050505] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-[#c79c6e] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#c79c6e] text-black hover:bg-[#e0b284] transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus size={14} weight="bold" />
                <span>Add</span>
              </button>
            </div>

            {/* Draggable Category List */}
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {(data.popup?.categories || []).map((cat, idx) => {
                const countYt = data.media?.filter(m => m.type === 'youtube' && m.category === cat).length || 0;
                const countIg = data.media?.filter(m => m.type === 'instagram' && m.category === cat).length || 0;
                const totalUsed = countYt + countIg;
                const isEditing = editingCat.oldVal === cat;
                const isDragging = draggedCatIndex === idx;

                return (
                  <div
                    key={cat}
                    draggable={!isEditing}
                    onDragStart={(e) => handleCatDragStart(e, idx)}
                    onDragOver={(e) => handleCatDragOver(e, idx)}
                    onDrop={(e) => handleCatDrop(e, idx)}
                    onDragEnd={handleCatDragEnd}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                      isDragging 
                        ? 'opacity-40 border-dashed border-[#c79c6e] bg-[#c79c6e]/10' 
                        : 'bg-[#080808] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Drag Grip Handle */}
                      <div 
                        className="cursor-grab active:cursor-grabbing p-1 text-white/30 hover:text-[#c79c6e] transition-colors"
                        title="Drag to reorder"
                      >
                        <DotsSixVertical size={16} weight="bold" />
                      </div>

                      <span className="text-[11px] font-mono text-white/30 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingCat.newVal}
                            onChange={(e) => setEditingCat(prev => ({ ...prev, newVal: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameCategory(cat, editingCat.newVal);
                              if (e.key === 'Escape') setEditingCat({ oldVal: '', newVal: '' });
                            }}
                            className="bg-[#050505] border border-[#c79c6e] rounded px-2.5 py-1 text-xs text-white flex-1"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameCategory(cat, editingCat.newVal)}
                            className="px-2 py-1 rounded bg-[#c79c6e] text-black text-xs font-bold"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCat({ oldVal: '', newVal: '' })}
                            className="px-2 py-1 rounded bg-white/10 text-white text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xs font-semibold text-white truncate">{cat}</span>
                          <span className="text-[10px] text-white/40 shrink-0">
                            ({totalUsed} items)
                          </span>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Up / Down Arrow buttons */}
                        <button
                          type="button"
                          onClick={() => handleMoveCategory(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded bg-white/5 text-white/70 hover:text-white disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveCategory(idx, 'down')}
                          disabled={idx === data.popup.categories.length - 1}
                          className="p-1 rounded bg-white/5 text-white/70 hover:text-white disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown size={12} />
                        </button>

                        {/* Rename */}
                        <button
                          type="button"
                          onClick={() => setEditingCat({ oldVal: cat, newVal: cat })}
                          className="p-1 rounded bg-white/5 text-white/70 hover:text-white"
                          title="Rename"
                        >
                          <PencilSimple size={12} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCategoryPrompt(cat)}
                          className="p-1 rounded bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white"
                          title="Delete"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCatManagerOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#c79c6e] text-black hover:bg-[#e0b284]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Modal (when deleting a category that has items) */}
      {reassignModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#11100f] border border-white/20 rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 text-white">
            <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <WarningCircle size={18} weight="fill" />
              <span>Category In Use</span>
            </span>
            <p className="text-xs text-white/70 leading-relaxed">
              The category <strong>"{reassignModal.catToDelete}"</strong> is currently assigned to videos or reels. Select a new category to reassign these items to:
            </p>
            <select
              value={reassignModal.targetCat}
              onChange={(e) => setReassignModal(prev => ({ ...prev, targetCat: e.target.value }))}
              className="w-full bg-[#050505] border border-white/15 rounded-lg p-2.5 text-xs text-white"
            >
              {(data.popup?.categories || [])
                .filter(c => c !== reassignModal.catToDelete)
                .map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReassignModal({ isOpen: false, catToDelete: '', targetCat: '' })}
                className="px-4 py-2 rounded-xl text-xs bg-white/10 text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReassignAndDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#c4522d] text-white hover:bg-[#d85c33]"
              >
                Reassign & Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AboutAarkeshPopupEditor;
