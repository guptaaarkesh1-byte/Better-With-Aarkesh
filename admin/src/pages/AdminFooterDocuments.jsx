import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash, 
  Pen, 
  FloppyDisk, 
  X, 
  User, 
  GraduationCap, 
  ShareNetwork,
  InstagramLogo,
  YoutubeLogo,
  XLogo,
  LinkedinLogo,
  FacebookLogo,
  SpotifyLogo,
  DiscordLogo,
  TiktokLogo,
  Globe,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Eye,
  EyeSlash
} from '@phosphor-icons/react';
import TiptapEditor from '../components/ui/TiptapEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const emptyDocForm = {
  id: null,
  title: '',
  slug: '',
  columnHeading: 'LEGAL',
  contentHtml: '',
  status: 'Draft',
  category: 'coaching',
  order: 0,
};

const emptySocialForm = {
  id: null,
  platform: 'instagram',
  label: 'Instagram',
  url: '',
  isActive: true,
  order: 0,
};

// Platform options config with icons
const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: InstagramLogo, color: 'text-pink-400' },
  { id: 'youtube', name: 'YouTube', icon: YoutubeLogo, color: 'text-red-500' },
  { id: 'x', name: 'X (Twitter)', icon: XLogo, color: 'text-white' },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedinLogo, color: 'text-blue-400' },
  { id: 'facebook', name: 'Facebook', icon: FacebookLogo, color: 'text-blue-500' },
  { id: 'spotify', name: 'Spotify', icon: SpotifyLogo, color: 'text-emerald-400' },
  { id: 'discord', name: 'Discord', icon: DiscordLogo, color: 'text-indigo-400' },
  { id: 'tiktok', name: 'TikTok', icon: TiktokLogo, color: 'text-teal-400' },
  { id: 'other', name: 'Other / Website', icon: Globe, color: 'text-amber-400' },
];

export const getSocialIcon = (platform, size = 18) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return <InstagramLogo size={size} className="text-pink-400" />;
    case 'youtube': return <YoutubeLogo size={size} className="text-red-500" />;
    case 'x': case 'twitter': return <XLogo size={size} className="text-white" />;
    case 'linkedin': return <LinkedinLogo size={size} className="text-blue-400" />;
    case 'facebook': return <FacebookLogo size={size} className="text-blue-500" />;
    case 'spotify': return <SpotifyLogo size={size} className="text-emerald-400" />;
    case 'discord': return <DiscordLogo size={size} className="text-indigo-400" />;
    case 'tiktok': return <TiktokLogo size={size} className="text-teal-400" />;
    default: return <Globe size={size} className="text-[#c79c6e]" />;
  }
};

export default function AdminFooterDocuments() {
  const [documents, setDocuments] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  
  // activeCategory: 'coaching' | 'course' | 'social'
  const [activeCategory, setActiveCategory] = useState('coaching');
  
  // Document Edit State
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [docFormData, setDocFormData] = useState(emptyDocForm);

  // Social Link Modal State
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialFormData, setSocialFormData] = useState(emptySocialForm);

  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
    fetchSocialLinks();
  }, []);

  const showSuccess = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // ─── DOCUMENTS API ─────────────────────────────────────────────
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/footer-documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to fetch footer documents:', err);
    }
  };

  const handleAddNewDoc = () => {
    setDocFormData({
      ...emptyDocForm,
      category: activeCategory === 'social' ? 'coaching' : activeCategory,
      columnHeading: activeCategory === 'course' ? 'COURSE' : 'LEGAL',
    });
    setIsEditingDoc(true);
    setError(null);
  };

  const handleEditDoc = (doc) => {
    setDocFormData({
      id: doc._id,
      title: doc.title,
      slug: doc.slug,
      columnHeading: doc.columnHeading || 'LEGAL',
      contentHtml: doc.contentHtml,
      status: doc.status,
      category: doc.category || 'coaching',
      order: doc.order || 0,
    });
    setIsEditingDoc(true);
    setError(null);
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/footer-documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('Document deleted');
        fetchDocuments();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete document');
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
      setError('An error occurred while deleting.');
    }
  };

  const handleSaveDoc = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('adminToken');
      
      const payload = { ...docFormData };
      if (!payload.slug && payload.title) {
        payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }

      if (payload.columnHeading) {
        payload.columnHeading = payload.columnHeading.trim().toUpperCase();
      }

      const url = payload.id 
        ? `${API_URL}/api/footer-documents/${payload.id}`
        : `${API_URL}/api/footer-documents`;
        
      const method = payload.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setIsEditingDoc(false);
        showSuccess('Document saved successfully');
        fetchDocuments();
      } else {
        setError(data.message || 'Failed to save document');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('An error occurred while saving.');
    }
  };

  // ─── SOCIAL LINKS API ──────────────────────────────────────────
  const fetchSocialLinks = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/social-links/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSocialLinks(data);
      }
    } catch (err) {
      console.error('Failed to fetch social links:', err);
    }
  };

  const handleOpenSocialModal = (link = null) => {
    if (link) {
      setSocialFormData({
        id: link._id,
        platform: link.platform,
        label: link.label,
        url: link.url,
        isActive: link.isActive,
        order: link.order || 0,
      });
    } else {
      setSocialFormData({
        ...emptySocialForm,
        order: socialLinks.length,
      });
    }
    setShowSocialModal(true);
    setError(null);
  };

  const handleSaveSocial = async (e) => {
    e.preventDefault();
    if (!socialFormData.url.trim()) {
      setError('URL is required');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        platform: socialFormData.platform,
        label: socialFormData.label.trim() || socialFormData.platform,
        url: socialFormData.url.trim(),
        isActive: Boolean(socialFormData.isActive),
        order: Number(socialFormData.order) || 0,
      };

      const url = socialFormData.id
        ? `${API_URL}/api/social-links/${socialFormData.id}`
        : `${API_URL}/api/social-links`;
      const method = socialFormData.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowSocialModal(false);
        showSuccess(socialFormData.id ? 'Social link updated' : 'Social link added');
        fetchSocialLinks();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to save social link');
      }
    } catch (err) {
      console.error('Save social link error:', err);
      setError('An error occurred while saving.');
    }
  };

  const handleDeleteSocial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this social link?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/social-links/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('Social link deleted');
        fetchSocialLinks();
      }
    } catch (err) {
      console.error('Delete social error:', err);
      setError('Failed to delete social link');
    }
  };

  const handleToggleActiveSocial = async (link) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/social-links/${link._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !link.isActive })
      });
      if (res.ok) {
        fetchSocialLinks();
      }
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const handleMoveSocial = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= socialLinks.length) return;

    const updated = [...socialLinks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Update orders
    try {
      const token = localStorage.getItem('adminToken');
      await Promise.all(
        updated.map((l, i) =>
          fetch(`${API_URL}/api/social-links/${l._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ order: i })
          })
        )
      );
      fetchSocialLinks();
    } catch (err) {
      console.error('Reorder social error:', err);
    }
  };

  const coachingDocs = documents.filter(d => (d.category || 'coaching') === 'coaching');
  const courseDocs = documents.filter(d => d.category === 'course');
  const displayedDocs = activeCategory === 'coaching' ? coachingDocs : courseDocs;

  return (
    <div className="flex flex-col flex-1 bg-[#050505] p-6 text-white min-h-0 overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 bg-[#121212] border border-[#c79c6e]/60 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle size={20} className="text-[#c79c6e]" weight="fill" />
            <span className="text-sm font-sans font-medium">{notification}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-white">Footer Documents</h1>
            <p className="text-white/50 text-sm mt-1">
              Manage legal documents and universal social links across all website footers
            </p>
          </div>
          
          {!isEditingDoc && (
            activeCategory === 'social' ? (
              <button
                onClick={() => handleOpenSocialModal()}
                className="flex items-center gap-2 px-4 py-2 bg-[#c79c6e] text-black font-semibold rounded-md hover:bg-[#c79c6e]/90 transition-colors text-sm"
              >
                <Plus size={16} weight="bold" />
                Add Social Link
              </button>
            ) : (
              <button
                onClick={handleAddNewDoc}
                className="flex items-center gap-2 px-4 py-2 bg-[#c79c6e] text-black font-semibold rounded-md hover:bg-[#c79c6e]/90 transition-colors text-sm"
              >
                <Plus size={16} weight="bold" />
                Add {activeCategory === 'coaching' ? 'Coaching' : 'Course'} Document
              </button>
            )
          )}
        </div>

        {/* Global Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Top 3 Tabs */}
        {!isEditingDoc && (
          <div className="flex items-center gap-3 border-b border-white/10 pb-3 flex-wrap">
            {/* Tab 1: Coaching Footer */}
            <button
              onClick={() => setActiveCategory('coaching')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === 'coaching'
                  ? 'bg-[#c79c6e] text-black shadow-md font-semibold'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <User size={18} weight={activeCategory === 'coaching' ? 'fill' : 'regular'} />
              <span>Coaching Footer</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeCategory === 'coaching' ? 'bg-black/20 text-black' : 'bg-white/10 text-white/70'
              }`}>
                {coachingDocs.length}
              </span>
            </button>

            {/* Tab 2: Course Footer */}
            <button
              onClick={() => setActiveCategory('course')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === 'course'
                  ? 'bg-[#c79c6e] text-black shadow-md font-semibold'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap size={18} weight={activeCategory === 'course' ? 'fill' : 'regular'} />
              <span>Course Footer</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeCategory === 'course' ? 'bg-black/20 text-black' : 'bg-white/10 text-white/70'
              }`}>
                {courseDocs.length}
              </span>
            </button>

            {/* Tab 3: Universal Social Icons Footer */}
            <button
              onClick={() => setActiveCategory('social')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === 'social'
                  ? 'bg-[#c79c6e] text-black shadow-md font-semibold'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShareNetwork size={18} weight={activeCategory === 'social' ? 'fill' : 'regular'} />
              <span>Universal Social Icons Footer</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeCategory === 'social' ? 'bg-black/20 text-black' : 'bg-white/10 text-white/70'
              }`}>
                {socialLinks.length}
              </span>
            </button>
          </div>
        )}

        {/* ─── TAB VIEW 1 & 2: DOCUMENT MANAGEMENT (COACHING / COURSE) ─── */}
        {activeCategory !== 'social' && (
          isEditingDoc ? (
            /* Document Editor View */
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="font-serif text-xl text-white">
                  {docFormData.id ? 'Edit Document' : 'Create New Document'}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditingDoc(false)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-sm text-white/70"
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button
                    onClick={handleSaveDoc}
                    className="flex items-center gap-2 px-4 py-1.5 bg-[#c79c6e] text-black font-semibold rounded text-sm hover:bg-[#c79c6e]/90"
                  >
                    <FloppyDisk size={16} weight="bold" /> Save
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans text-white/60 mb-1">Title</label>
                  <input
                    type="text"
                    value={docFormData.title}
                    onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
                    placeholder="e.g. Terms & Conditions"
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-white/60 mb-1">Slug (URL Path)</label>
                  <input
                    type="text"
                    value={docFormData.slug}
                    onChange={(e) => setDocFormData({ ...docFormData, slug: e.target.value })}
                    placeholder="e.g. terms-and-conditions"
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-white/60 mb-1">Column Heading</label>
                  <div className="flex flex-col gap-2">
                    <select
                      value={
                        ['LEGAL', 'COURSE', 'COACHING', 'RESOURCES', 'COMMUNITY', 'SUPPORT'].includes((docFormData.columnHeading || '').toUpperCase())
                          ? (docFormData.columnHeading || '').toUpperCase()
                          : 'CUSTOM'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'CUSTOM') {
                          setDocFormData({ ...docFormData, columnHeading: '' });
                        } else {
                          setDocFormData({ ...docFormData, columnHeading: val });
                        }
                      }}
                      className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                    >
                      <option value="LEGAL">LEGAL (Default Policy Column)</option>
                      <option value="COURSE">COURSE (Course Navigation)</option>
                      <option value="COACHING">COACHING (Coaching Navigation)</option>
                      <option value="RESOURCES">RESOURCES</option>
                      <option value="COMMUNITY">COMMUNITY</option>
                      <option value="SUPPORT">SUPPORT</option>
                      <option value="CUSTOM">+ Custom Column Name...</option>
                    </select>

                    {(!['LEGAL', 'COURSE', 'COACHING', 'RESOURCES', 'COMMUNITY', 'SUPPORT'].includes((docFormData.columnHeading || '').toUpperCase()) || docFormData.columnHeading === '') && (
                      <input
                        type="text"
                        required
                        value={docFormData.columnHeading}
                        onChange={(e) => setDocFormData({ ...docFormData, columnHeading: e.target.value })}
                        placeholder="Type custom column name (e.g. EXTRAS, FAQ)"
                        className="w-full bg-[#161616] border border-[#c79c6e]/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                      />
                    )}
                  </div>
                  <span className="text-[0.65rem] text-white/40 mt-1 block">
                    Select a column heading dropdown option or enter a custom column name.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-sans text-white/60 mb-1">Status</label>
                  <select
                    value={docFormData.status}
                    onChange={(e) => setDocFormData({ ...docFormData, status: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans text-white/60 mb-1">Category</label>
                  <select
                    value={docFormData.category}
                    onChange={(e) => setDocFormData({ ...docFormData, category: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                  >
                    <option value="coaching">Coaching Footer</option>
                    <option value="course">Course Footer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans text-white/60 mb-1">Order</label>
                  <input
                    type="number"
                    value={docFormData.order}
                    onChange={(e) => setDocFormData({ ...docFormData, order: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans text-white/60 mb-2">Content</label>
                <TiptapEditor
                  content={docFormData.contentHtml}
                  onChange={(html) => setDocFormData({ ...docFormData, contentHtml: html })}
                />
              </div>
            </div>
          ) : (
            /* Documents Table View */
            <div className="bg-[#0c0c0c] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-white/80 font-sans">
                <thead className="bg-white/5 text-xs text-white/50 uppercase border-b border-white/10">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Column Heading</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Order</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayedDocs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-white/40">
                        No documents found for {activeCategory === 'coaching' ? 'Coaching' : 'Course'} footer.
                      </td>
                    </tr>
                  ) : (
                    displayedDocs.map((doc) => (
                      <tr key={doc._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-medium text-white">{doc.title}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-[#c79c6e]/15 text-[#c79c6e] border border-[#c79c6e]/30">
                            {doc.columnHeading || 'LEGAL'}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-white/50">{doc.slug}</td>
                        <td className="p-4">
                          <span className="capitalize px-2 py-0.5 text-xs rounded bg-white/10 text-white/80">
                            {doc.category || 'coaching'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 text-xs rounded font-medium ${
                              doc.status === 'Published'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-white/60">{doc.order || 0}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditDoc(doc)}
                              className="p-1.5 text-white/60 hover:text-[#c79c6e] hover:bg-white/5 rounded transition-colors"
                              title="Edit"
                            >
                              <Pen size={16} />
                            </button>
                            {(doc.category || 'coaching') !== 'coaching' && (
                              <button
                                onClick={() => handleDeleteDoc(doc._id)}
                                className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ─── TAB VIEW 3: UNIVERSAL SOCIAL ICONS MANAGEMENT ────────── */}
        {activeCategory === 'social' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs text-white/70 font-sans">
              <span>
                These social media icons are universal and will automatically display across both Coaching and Course footers with their live links.
              </span>
            </div>

            <div className="bg-[#0c0c0c] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-white/80 font-sans">
                <thead className="bg-white/5 text-xs text-white/50 uppercase border-b border-white/10">
                  <tr>
                    <th className="p-4">Platform</th>
                    <th className="p-4">Label</th>
                    <th className="p-4">Destination URL</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Order</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {socialLinks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-white/40">
                        No universal social links found. Click "+ Add Social Link" to add one.
                      </td>
                    </tr>
                  ) : (
                    socialLinks.map((link, idx) => (
                      <tr key={link._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                              {getSocialIcon(link.platform, 18)}
                            </div>
                            <span className="font-medium text-white capitalize">{link.platform}</span>
                          </div>
                        </td>

                        <td className="p-4 text-white/90">{link.label}</td>

                        <td className="p-4 text-xs font-mono text-white/50 max-w-xs truncate">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#c79c6e] hover:underline">
                            {link.url}
                          </a>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActiveSocial(link)}
                            className={`px-2.5 py-1 text-xs rounded-full font-medium flex items-center gap-1.5 transition-all ${
                              link.isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-white/10 text-white/40 border border-white/10 hover:bg-white/20'
                            }`}
                            title="Click to toggle visibility"
                          >
                            {link.isActive ? <Eye size={13} /> : <EyeSlash size={13} />}
                            <span>{link.isActive ? 'Active' : 'Hidden'}</span>
                          </button>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveSocial(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 text-white/40 hover:text-white disabled:opacity-20 rounded"
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <span className="font-mono text-xs text-white/60 px-1">{idx + 1}</span>
                            <button
                              onClick={() => handleMoveSocial(idx, 1)}
                              disabled={idx === socialLinks.length - 1}
                              className="p-1 text-white/40 hover:text-white disabled:opacity-20 rounded"
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenSocialModal(link)}
                              className="p-1.5 text-white/60 hover:text-[#c79c6e] hover:bg-white/5 rounded transition-colors"
                              title="Edit"
                            >
                              <Pen size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSocial(link._id)}
                              className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── MODAL: ADD / EDIT SOCIAL LINK ───────────────────────── */}
        {showSocialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#0e0e0e] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-serif text-lg text-white">
                  {socialFormData.id ? 'Edit Social Link' : 'Add Universal Social Link'}
                </h3>
                <button
                  onClick={() => setShowSocialModal(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveSocial} className="space-y-4 font-sans text-sm">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map((p) => {
                      const Icon = p.icon;
                      const isSelected = socialFormData.platform === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSocialFormData({
                              ...socialFormData,
                              platform: p.id,
                              label: socialFormData.label === PLATFORMS.find(x => x.id === socialFormData.platform)?.name || !socialFormData.label ? p.name : socialFormData.label
                            });
                          }}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-xs transition-all ${
                            isSelected
                              ? 'bg-[#c79c6e]/15 border-[#c79c6e] text-white font-semibold'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Icon size={20} className={p.color} />
                          <span className="text-[0.65rem] truncate">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1">Display Label</label>
                  <input
                    type="text"
                    required
                    value={socialFormData.label}
                    onChange={(e) => setSocialFormData({ ...socialFormData, label: e.target.value })}
                    placeholder="e.g. Instagram"
                    className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c79c6e]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1">Profile / Channel URL</label>
                  <input
                    type="url"
                    required
                    value={socialFormData.url}
                    onChange={(e) => setSocialFormData({ ...socialFormData, url: e.target.value })}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c79c6e]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveSocial"
                    checked={socialFormData.isActive}
                    onChange={(e) => setSocialFormData({ ...socialFormData, isActive: e.target.checked })}
                    className="accent-[#c79c6e] w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor="isActiveSocial" className="text-xs text-white/80 cursor-pointer select-none">
                    Visible in footers (Active)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowSocialModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#c79c6e] text-black font-semibold text-xs hover:bg-[#b0885e]"
                  >
                    {socialFormData.id ? 'Save Changes' : 'Add Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
