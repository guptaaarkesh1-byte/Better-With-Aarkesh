import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  Plus, 
  Trash, 
  Pen, 
  FloppyDisk, 
  X, 
  FileText,
  ShareNetwork,
  Sparkle,
  InstagramLogo,
  YoutubeLogo,
  XLogo,
  LinkedinLogo,
  FacebookLogo,
  SpotifyLogo,
  DiscordLogo,
  TiktokLogo,
  Globe,
  CheckCircle,
  ArrowSquareOut,
  CaretLeft,
  CaretRight,
  EnvelopeSimple,
  PhoneCall,
  MapPin,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  GraduationCap,
  ChatCircleDots,
  ShieldCheck,
  DotsSixVertical,
  Eye,
  EyeSlash
} from '@phosphor-icons/react';
import TiptapEditor from '../components/ui/TiptapEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_FOOTER_SECTIONS = [
  'QUICK LINKS',
  'COMPANY',
  'LEGAL'
];

const emptyDocForm = {
  id: null,
  title: '',
  slug: '',
  footerSection: 'QUICK LINKS',
  contentHtml: '',
  status: 'Published',
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
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab');
      if (tabFromUrl && ['pages', 'brand'].includes(tabFromUrl)) {
        return tabFromUrl;
      }
      const savedTab = localStorage.getItem('bwa_admin_footer_tab');
      if (savedTab && ['pages', 'brand'].includes(savedTab)) {
        return savedTab;
      }
    } catch (e) {}
    return 'pages';
  });

  // Persist tab to localStorage and URL on change
  useEffect(() => {
    try {
      localStorage.setItem('bwa_admin_footer_tab', activeTab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [activeTab]);
  
  // Data States
  const [documents, setDocuments] = useState([]);
  const [columns, setColumns] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [brandSettings, setBrandSettings] = useState({
    brandDescription: '',
    brandEmail: '',
    copyrightText: '',
  });

  // Form State
  const [docFormData, setDocFormData] = useState(emptyDocForm);

  // Dedicated Contact Page Customizer State
  const [contactCustomizer, setContactCustomizer] = useState({
    backButtonText: 'Back',
    headerBadge: 'Get In Touch',
    headerTitle: 'How can we support you?',
    headerSubtitle: 'Reach out to our dedicated desks for 1-on-1 coaching, sessions, and learning assistance.',
    
    cards: [
      {
        id: 'card-1',
        icon: 'email',
        title: 'Email Support',
        subtitle: 'We reply within 24 hours',
        items: [
          {
            id: 'item-1',
            label: '',
            value: 'coaching@betterwithaarkesh.com',
            linkUrl: 'mailto:coaching@betterwithaarkesh.com'
          }
        ]
      },
      {
        id: 'card-2',
        icon: 'phone',
        title: 'Phone Support',
        subtitle: '11am - 8pm (Mon-Sat)',
        items: [
          {
            id: 'item-2',
            label: '',
            value: '1234567890'
          }
        ]
      }
    ],

    // Address Details
    addressTitle: 'Registered Office & Address',
    addressSubtitle: 'Official business details and communication location',
    operatingLocationLabel: 'Operating Location',
    operatingLocation: 'Mumbai, Maharashtra, India',
    operatingHoursLabel: 'Working Hours',
    operatingHours: 'Monday – Saturday, 11:00 AM – 8:00 PM IST',
    addressCtaText: 'Book 1:1 Coaching',
    addressCtaUrl: '/book',
  });

  const handleAddContactCard = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      icon: 'email',
      title: 'Email Support',
      subtitle: 'We reply within 24 hours',
      items: [
        {
          id: `item-${Date.now()}-1`,
          label: '',
          value: 'coaching@betterwithaarkesh.com'
        }
      ]
    };
    setContactCustomizer(prev => ({
      ...prev,
      cards: [...(prev.cards || []), newCard]
    }));
  };

  const handleDeleteContactCard = (idx) => {
    setContactCustomizer(prev => ({
      ...prev,
      cards: (prev.cards || []).filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateContactCard = (idx, field, value) => {
    setContactCustomizer(prev => {
      const updated = [...(prev.cards || [])];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, cards: updated };
    });
  };

  const handleAddCardItem = (cardIdx) => {
    setContactCustomizer(prev => {
      const updatedCards = [...(prev.cards || [])];
      const targetCard = updatedCards[cardIdx] || {};
      const currentItems = Array.isArray(targetCard.items) ? targetCard.items : [];
      const iconType = targetCard.icon || 'email';
      const defaultVal = iconType === 'phone' ? '+91 98765 43210' : 'coaching@betterwithaarkesh.com';
      
      const newItem = {
        id: `item-${Date.now()}-${currentItems.length + 1}`,
        label: '',
        value: defaultVal
      };

      updatedCards[cardIdx] = {
        ...targetCard,
        items: [...currentItems, newItem]
      };
      return { ...prev, cards: updatedCards };
    });
  };

  const handleDeleteCardItem = (cardIdx, itemIdx) => {
    setContactCustomizer(prev => {
      const updatedCards = [...(prev.cards || [])];
      const targetCard = updatedCards[cardIdx] || {};
      const currentItems = Array.isArray(targetCard.items) ? targetCard.items : [];
      updatedCards[cardIdx] = {
        ...targetCard,
        items: currentItems.filter((_, i) => i !== itemIdx)
      };
      return { ...prev, cards: updatedCards };
    });
  };

  const handleUpdateCardItem = (cardIdx, itemIdx, field, value) => {
    setContactCustomizer(prev => {
      const updatedCards = [...(prev.cards || [])];
      const targetCard = updatedCards[cardIdx] || {};
      const currentItems = [...(Array.isArray(targetCard.items) ? targetCard.items : [])];
      if (currentItems[itemIdx]) {
        currentItems[itemIdx] = {
          ...currentItems[itemIdx],
          [field]: value
        };
      }
      updatedCards[cardIdx] = {
        ...targetCard,
        items: currentItems
      };
      return { ...prev, cards: updatedCards };
    });
  };

  // Social Modal States
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialFormData, setSocialFormData] = useState(emptySocialForm);

  // Section Modals
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [showRenameSectionModal, setShowRenameSectionModal] = useState(false);
  const [renameSectionData, setRenameSectionData] = useState({ oldName: '', newName: '' });

  // UI States
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);

  // Drag and drop for column headings
  const [draggedColIndex, setDraggedColIndex] = useState(null);
  const [dragOverColIndex, setDragOverColIndex] = useState(null);

  const handleColDragStart = (e, index) => {
    setDraggedColIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleColDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColIndex !== index) {
      setDragOverColIndex(index);
    }
  };

  const handleColDragLeave = () => {
    setDragOverColIndex(null);
  };

  const handleColDragEnd = () => {
    setDraggedColIndex(null);
    setDragOverColIndex(null);
  };

  const handleColDrop = async (e, targetIndex) => {
    e.preventDefault();
    setError(null);
    setDragOverColIndex(null);
    if (draggedColIndex === null || draggedColIndex === targetIndex) {
      setDraggedColIndex(null);
      return;
    }

    const reordered = [...columns];
    const [movedCol] = reordered.splice(draggedColIndex, 1);
    reordered.splice(targetIndex, 0, movedCol);

    setColumns(reordered);
    setDraggedColIndex(null);

    try {
      const token = localStorage.getItem('adminToken');
      const columnIds = reordered.map(c => c._id).filter(Boolean);
      if (columnIds.length > 0) {
        const res = await fetch(`${API_URL}/api/footer-columns/reorder/all`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ columnIds })
        });
        if (res.ok) {
          const updatedCols = await res.json();
          setColumns(updatedCols);
          showSuccess('Column order auto-saved & updated on live website footer!');
        }
      }
    } catch (err) {
      console.error('Failed to save column reorder:', err);
      fetchColumns();
    }
  };

  const handleSaveContactSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingSettings(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/contact-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(contactCustomizer)
      });
      if (res.ok) {
        const data = await res.json();
        setContactCustomizer(prev => ({ ...prev, ...data }));
        showSuccess('Contact Page settings saved & published to website!');
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to save contact settings');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('An error occurred while saving contact settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchDocuments();
    fetchColumns();
    fetchSocialLinks();
    fetchBrandSettings();
    fetchContactSettings();
  }, []);

  const fetchContactSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/contact-settings`);
      if (res.ok) {
        const data = await res.json();
        const cards = Array.isArray(data.cards) && data.cards.length > 0 
          ? data.cards 
          : [
              {
                id: 'card-1',
                icon: data.card1Icon || 'email',
                title: data.card1Title || 'Email Support',
                subtitle: data.card1Subtitle || 'We reply within 24 hours',
                items: [
                  {
                    id: 'item-1',
                    label: '',
                    value: data.card1Highlight || 'coaching@betterwithaarkesh.com'
                  }
                ]
              },
              {
                id: 'card-2',
                icon: data.card2Icon || 'phone',
                title: data.card2Title || 'Phone Support',
                subtitle: data.card2Subtitle || '11am - 8pm (Mon-Sat)',
                items: [
                  {
                    id: 'item-2',
                    label: '',
                    value: data.card2Highlight || '+91 98765 43210'
                  }
                ]
              }
            ];
        setContactCustomizer(prev => ({ ...prev, ...data, cards }));
      }
    } catch (err) {
      console.error('Failed to fetch contact settings:', err);
    }
  };

  const { showSuccess, showError, showInfo } = useToast();

  // ─── 1. FETCH APIS ──────────────────────────────────────────────
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
      console.error('Failed to fetch pages:', err);
    }
  };

  const fetchColumns = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/footer-columns/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setColumns(data);
      }
    } catch (err) {
      console.error('Failed to fetch columns:', err);
    }
  };

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

  const fetchBrandSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/footer-columns/settings`);
      if (res.ok) {
        const data = await res.json();
        setBrandSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch footer brand settings:', err);
    }
  };

  // ─── 2. HELPER: FIND COLUMN FOR A DOCUMENT ──────────────────────
  const findColumnForDoc = (doc) => {
    if (!doc) return 'QUICK LINKS';
    if (doc.columnHeading) return doc.columnHeading.toUpperCase();
    const slugMatch = `/${doc.slug}`;
    for (const col of columns) {
      const found = col.links?.some(l => l.url === slugMatch || l.url === doc.slug || l.label?.toLowerCase() === doc.title?.toLowerCase());
      if (found) return col.title.toUpperCase();
    }
    return 'QUICK LINKS';
  };

  // Get list of all known footer sections (columns) deduplicated
  const allFooterSections = Array.from(new Set([
    ...DEFAULT_FOOTER_SECTIONS,
    ...columns.map(c => (c.title || '').trim().toUpperCase()),
    ...documents.map(d => (d.columnHeading || '').trim().toUpperCase()).filter(Boolean)
  ])).filter(Boolean);

  // ─── 3. PAGE ACTIONS ────────────────────────────────────────────
  const handleEditDoc = (doc) => {
    const secName = findColumnForDoc(doc);
    setDocFormData({
      id: doc._id,
      title: doc.title,
      slug: doc.slug,
      footerSection: secName,
      contentHtml: doc.contentHtml || '',
      status: doc.status || 'Published',
      order: doc.order || 0,
    });
    if (doc.slug === 'contact-us' || doc.slug === 'contact') {
      fetchContactSettings();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setError(null);
  };

  const handleResetForm = () => {
    setDocFormData(emptyDocForm);
    setError(null);
  };

  const handleDeleteDoc = async (id) => {
    const docToDelete = documents.find(d => d._id === id);
    if (docToDelete && (docToDelete.slug === 'contact-us' || docToDelete.slug === 'contact')) {
      alert('Contact Us is a core system page and cannot be deleted.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      const token = localStorage.getItem('adminToken');

      const res = await fetch(`${API_URL}/api/footer-documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        // Also remove link from columns
        if (docToDelete) {
          const docUrl = `/${docToDelete.slug}`;
          for (const col of columns) {
            const hasLink = col.links?.some(l => l.url === docUrl || l.url === docToDelete.slug);
            if (hasLink) {
              const updatedLinks = col.links.filter(l => l.url !== docUrl && l.url !== docToDelete.slug);
              await fetch(`${API_URL}/api/footer-columns/${col._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ links: updatedLinks })
              });
            }
          }
        }

        showSuccess('Page deleted successfully');
        if (docFormData.id === id) handleResetForm();
        fetchDocuments();
        fetchColumns();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete page');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('An error occurred while deleting.');
    }
  };

  const handleTogglePublish = async (doc) => {
    try {
      const token = localStorage.getItem('adminToken');
      const newStatus = doc.status === 'Published' ? 'Draft' : 'Published';
      const res = await fetch(`${API_URL}/api/footer-documents/${doc._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showSuccess(`Page set to ${newStatus}`);
        fetchDocuments();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleSaveDoc = async (e) => {
    if (e) e.preventDefault();
    try {
      setError(null);
      setIsSubmittingDoc(true);
      const token = localStorage.getItem('adminToken');

      // If user is editing Contact Us page, save contact customizer directly
      if (docFormData.slug === 'contact-us' || docFormData.slug === 'contact') {
        await handleSaveContactSettings(e);
        setIsSubmittingDoc(false);
        return;
      }
      
      if (!docFormData.title.trim()) {
        setError('Page Title is required to create a new static page.');
        setIsSubmittingDoc(false);
        return;
      }

      let slug = docFormData.slug.trim().replace(/^\/+/, '');
      if (!slug && docFormData.title) {
        slug = docFormData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }

      const sectionName = (docFormData.footerSection || 'Quick Links').trim();

      const payload = {
        title: docFormData.title.trim(),
        slug,
        columnHeading: sectionName,
        contentHtml: docFormData.contentHtml,
        status: docFormData.status,
        order: Number(docFormData.order) || 0,
        category: 'general'
      };

      const url = docFormData.id 
        ? `${API_URL}/api/footer-documents/${docFormData.id}`
        : `${API_URL}/api/footer-documents`;
        
      const method = docFormData.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const savedDoc = await res.json();

      if (res.ok) {
        // ─── SYNC LINK TO FOOTER COLUMN AUTOMATICALLY ───
        const docUrl = `/${slug}`;
        const linkObj = {
          label: payload.title,
          url: docUrl,
          type: 'internal',
          order: payload.order || 0
        };

        // Find or create target column (case-insensitive)
        let targetCol = columns.find(c => c.title.toLowerCase() === sectionName.toLowerCase());

        if (!targetCol) {
          const newColRes = await fetch(`${API_URL}/api/footer-columns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              title: sectionName.toUpperCase(),
              order: columns.length + 1,
              links: [linkObj]
            })
          });
          if (newColRes.ok) {
            targetCol = await newColRes.json();
          }
        } else {
          // Update target column links
          const otherLinks = (targetCol.links || []).filter(l => l.url !== docUrl && l.url !== slug && l.label?.toLowerCase() !== payload.title.toLowerCase());
          otherLinks.push(linkObj);

          await fetch(`${API_URL}/api/footer-columns/${targetCol._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ links: otherLinks })
          });
        }

        // Remove from other columns if section changed
        for (const col of columns) {
          if (targetCol && col._id !== targetCol._id) {
            const hasOld = col.links?.some(l => l.url === docUrl || l.url === slug || (docFormData.id && l.label?.toLowerCase() === docFormData.title?.toLowerCase()));
            if (hasOld) {
              const cleanedLinks = col.links.filter(l => l.url !== docUrl && l.url !== slug && l.label?.toLowerCase() !== docFormData.title?.toLowerCase());
              await fetch(`${API_URL}/api/footer-columns/${col._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ links: cleanedLinks })
              });
            }
          }
        }

        if (slug === 'contact-us' || slug === 'contact') {
          try {
            await fetch(`${API_URL}/api/contact-settings`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(contactCustomizer)
            });
          } catch (cErr) {
            console.error('Failed to sync contact settings:', cErr);
          }
        }

        showSuccess(docFormData.id ? 'Page updated successfully!' : 'Page created & added to footer!');
        handleResetForm();
        fetchDocuments();
        fetchColumns();
        fetchContactSettings();
      } else {
        setError(savedDoc.message || 'Failed to save page');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('An error occurred while saving.');
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const handleCreateNewSection = async (e) => {
    if (e) e.preventDefault();
    if (!newSectionName.trim()) return;
    try {
      const cleanName = newSectionName.trim().toUpperCase();
      const token = localStorage.getItem('adminToken');
      
      const res = await fetch(`${API_URL}/api/footer-columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: cleanName,
          order: columns.length + 1,
          links: []
        })
      });

      if (res.ok) {
        showSuccess(`New column "${cleanName}" added!`);
        setDocFormData(prev => ({ ...prev, footerSection: cleanName }));
        setNewSectionName('');
        setShowNewSectionModal(false);
        fetchColumns();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add new section');
      }
    } catch (err) {
      setError('An error occurred while adding column');
    }
  };

  const handleOpenRenameSection = (sectionName) => {
    const target = sectionName || docFormData.footerSection || 'QUICK LINKS';
    setRenameSectionData({
      oldName: target,
      newName: target
    });
    setShowRenameSectionModal(true);
  };

  const handleExecuteRenameSection = async (e) => {
    if (e) e.preventDefault();
    const { oldName, newName } = renameSectionData;
    if (!newName.trim() || newName.trim().toUpperCase() === oldName.toUpperCase()) {
      setShowRenameSectionModal(false);
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/footer-columns/rename-section`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          oldName: oldName.trim(),
          newName: newName.trim().toUpperCase()
        })
      });

      if (res.ok) {
        showSuccess(`Section renamed from "${oldName}" to "${newName.trim().toUpperCase()}"!`);
        if (docFormData.footerSection?.toUpperCase() === oldName.toUpperCase()) {
          setDocFormData(prev => ({ ...prev, footerSection: newName.trim().toUpperCase() }));
        }
        setShowRenameSectionModal(false);
        fetchColumns();
        fetchDocuments();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to rename section');
      }
    } catch (err) {
      setError('An error occurred while renaming section');
    }
  };

  const handleDeleteSectionTag = async (sectionName) => {
    if (!window.confirm(`Are you sure you want to delete the "${sectionName}" column from the footer?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const col = columns.find(c => c.title.toLowerCase() === sectionName.toLowerCase());
      if (col) {
        await fetch(`${API_URL}/api/footer-columns/${col._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        showSuccess(`Footer section "${sectionName}" removed`);
        fetchColumns();
      }
    } catch (err) {
      setError('Failed to delete section');
    }
  };

  // ─── 4. BRAND & SOCIAL SETTINGS ─────────────────────────────────
  const handleSaveBrandSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/footer-columns/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(brandSettings)
      });
      if (res.ok) {
        showSuccess('Footer brand text settings saved successfully!');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to save settings');
      }
    } catch (err) {
      setError('An error occurred while saving brand settings');
    } finally {
      setIsSavingSettings(false);
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
      console.error('Toggle error:', err);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(documents.length / itemsPerPage) || 1;
  const paginatedDocs = documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col flex-1 bg-[#050505] p-6 text-white min-h-0 overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto space-y-8">
        

        {/* Global Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Top 2 Tabs (Pages vs Brand & Social) */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('brand')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'brand'
                  ? 'bg-[#c79c6e] text-black shadow-md font-semibold'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkle size={18} weight={activeTab === 'brand' ? 'fill' : 'regular'} />
              <span>Brand Text &amp; Social Links</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'brand' ? 'bg-black/20 text-black' : 'bg-white/10 text-white/70'
              }`}>
                {socialLinks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pages')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'pages'
                  ? 'bg-[#c79c6e] text-black shadow-md font-semibold'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText size={18} weight={activeTab === 'pages' ? 'fill' : 'regular'} />
              <span>Static Pages &amp; Footer</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'pages' ? 'bg-black/20 text-black' : 'bg-white/10 text-white/70'
              }`}>
                {documents.length}
              </span>
            </button>
          </div>

          {activeTab === 'brand' && (
            <button
              onClick={() => handleOpenSocialModal()}
              className="flex items-center gap-2 px-4 py-2 bg-[#c79c6e] text-black font-semibold rounded-xl hover:bg-[#c79c6e]/90 transition-colors text-sm"
            >
              <Plus size={16} weight="bold" />
              Add Social Link
            </button>
          )}
        </div>

        {/* ─── TAB 1: STATIC PAGE CREATOR & PAGES LIBRARY ─────────── */}
        {activeTab === 'pages' && (
          <div className="space-y-10">
            
            {/* 1. TOP CARD: CREATE / EDIT STATIC PAGE FORM */}
            <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="font-serif text-2xl text-white">
                    {docFormData.id ? 'Edit Static Page' : 'Create Static Page'}
                  </h2>
                  <p className="text-white/40 text-xs mt-1">
                    Select a footer section, customize the slug, and compose rich-text page content
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {docFormData.id && (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors"
                    >
                      Clear / New
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveDoc}
                    disabled={isSubmittingDoc}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#c79c6e] text-black font-semibold rounded-xl text-sm hover:bg-[#b0885e] transition-all disabled:opacity-50 shadow-lg shadow-[#c79c6e]/10"
                  >
                    <FloppyDisk size={16} weight="bold" />
                    {isSubmittingDoc ? 'Saving...' : (docFormData.id ? 'Update Page' : 'Save Page')}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveDoc} className="space-y-6 font-sans">
                {/* Row 1: Footer Section & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Footer Section with Dropdown, Rename, and Add New Options */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-sans text-white/60">
                        Footer Section / Column
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setNewSectionName('');
                          setShowNewSectionModal(true);
                        }}
                        className="text-xs text-[#c79c6e] hover:underline flex items-center gap-1 font-medium transition-colors"
                      >
                        <Plus size={14} weight="bold" />
                        <span>Add New Column</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {/* Clean Select Dropdown */}
                      <select
                        value={docFormData.footerSection}
                        onChange={(e) => {
                          if (e.target.value === '__NEW__') {
                            setNewSectionName('');
                            setShowNewSectionModal(true);
                          } else {
                            setDocFormData({ ...docFormData, footerSection: e.target.value });
                          }
                        }}
                        className="w-full bg-[#141414] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e] cursor-pointer"
                      >
                        {allFooterSections.map((secName) => (
                          <option key={secName} value={secName} className="bg-[#141414] text-white">
                            {secName}
                          </option>
                        ))}
                        <option value="__NEW__" className="bg-[#141414] text-[#c79c6e] font-semibold">
                          + Create New Column / Heading...
                        </option>
                      </select>

                      {/* Rename Button for currently selected Section */}
                      <button
                        type="button"
                        onClick={() => handleOpenRenameSection(docFormData.footerSection)}
                        title="Rename this Column Heading"
                        className="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-[#c79c6e]/20 text-white/70 hover:text-[#c79c6e] border border-white/10 hover:border-[#c79c6e]/40 transition-colors flex items-center justify-center shrink-0"
                      >
                        <Pen size={16} />
                      </button>
                    </div>

                    {/* Section Quick Tags with Drag & Drop Reordering, Click to Select, and ✏️ to Rename */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[0.68rem] text-white/50 font-sans">
                        <span>Drag &amp; drop column pills to change order on website footer:</span>
                        <span className="text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-[0.62rem]">
                          ✓ Auto-Saves Live on Drop
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {columns.map((col, idx) => {
                          const secName = col.title;
                          const isSelected = (docFormData.footerSection || '').toLowerCase() === secName.toLowerCase();
                          const isDraggingThis = draggedColIndex === idx;
                          const isDragOverThis = dragOverColIndex === idx;

                          return (
                            <div
                              key={col._id || secName}
                              draggable={true}
                              onDragStart={(e) => handleColDragStart(e, idx)}
                              onDragOver={(e) => handleColDragOver(e, idx)}
                              onDragLeave={handleColDragLeave}
                              onDrop={(e) => handleColDrop(e, idx)}
                              onDragEnd={handleColDragEnd}
                              onClick={() => setDocFormData({ ...docFormData, footerSection: secName })}
                              className={`group px-3 py-1.5 rounded-lg text-xs font-medium cursor-grab active:cursor-grabbing transition-all flex items-center gap-1.5 border select-none ${
                                isDraggingThis
                                  ? 'opacity-30 border-dashed border-[#c79c6e] scale-95'
                                  : isDragOverThis
                                  ? 'border-[#c79c6e] bg-[#c79c6e]/25 scale-105 shadow-xl shadow-[#c79c6e]/30 ring-2 ring-[#c79c6e]'
                                  : isSelected
                                  ? 'bg-[#c79c6e]/20 border-[#c79c6e] text-[#c79c6e]'
                                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                              }`}
                              title="Drag & drop to reorder column order in footer; click to select"
                            >
                              <DotsSixVertical size={14} className="text-white/40 group-hover:text-[#c79c6e] cursor-grab active:cursor-grabbing shrink-0 transition-colors" weight="bold" />
                              <span>{secName}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenRenameSection(secName);
                                }}
                                className="text-white/30 hover:text-[#c79c6e] p-0.5 transition-colors"
                                title={`Rename "${secName}"`}
                              >
                                <Pen size={12} />
                              </button>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            setNewSectionName('');
                            setShowNewSectionModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-dashed border-white/20 text-white/50 hover:text-[#c79c6e] hover:border-[#c79c6e]/50 transition-colors flex items-center gap-1"
                        >
                          <Plus size={12} weight="bold" />
                          <span>New Column</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-sans text-white/60 mb-2">
                      Status
                    </label>
                    <select
                      value={docFormData.status}
                      onChange={(e) => setDocFormData({ ...docFormData, status: e.target.value })}
                      className="w-full bg-[#141414] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e] cursor-pointer"
                    >
                      <option value="Published" className="bg-[#141414]">Published</option>
                      <option value="Draft" className="bg-[#141414]">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Page Title & Page Name (Slug) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Page Title */}
                  <div>
                    <label className="block text-xs font-sans text-white/60 mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      required
                      value={docFormData.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        const autoSlug = !docFormData.id && (!docFormData.slug || docFormData.slug === docFormData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
                          ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                          : docFormData.slug;
                        setDocFormData({ ...docFormData, title: val, slug: autoSlug });
                      }}
                      placeholder="e.g. About Us"
                      className="w-full bg-[#141414] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>

                  {/* Page Name (Slug) */}
                  <div>
                    <label className="block text-xs font-sans text-white/60 mb-2">
                      Page Name (Slug)
                    </label>
                    <div className="flex items-center bg-[#141414] border border-white/15 rounded-xl px-4 py-3 text-sm focus-within:border-[#c79c6e]">
                      <span className="text-white/40 font-mono text-xs pr-1">/</span>
                      <input
                        type="text"
                        required
                        value={docFormData.slug}
                        onChange={(e) => setDocFormData({ ...docFormData, slug: e.target.value.replace(/^\/+/, '') })}
                        placeholder="about-us"
                        className="w-full bg-transparent font-mono text-sm text-[#c79c6e] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Page Content Editor OR Visual Contact Customizer */}
                {docFormData.slug === 'contact-us' || docFormData.slug === 'contact' ? (
                  <div className="space-y-6 pt-2 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#c79c6e]/10 border border-[#c79c6e]/25 px-4 py-3.5 rounded-xl">
                      <div className="flex items-center gap-2.5 text-[#c79c6e]">
                        <Sparkle size={20} weight="fill" />
                        <div className="text-xs">
                          <span className="font-semibold block text-white">Contact Page Visual Customizer</span>
                          <span className="text-white/60">Customize headers, support cards, phone/emails, and registered office details.</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveContactSettings}
                        disabled={isSavingSettings}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c79c6e] text-black font-semibold rounded-lg hover:bg-[#b0885e] transition-all text-xs shrink-0 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <FloppyDisk size={14} weight="bold" />
                        <span>{isSavingSettings ? 'Saving...' : 'Save Contact Settings'}</span>
                      </button>
                    </div>

                    {/* 1. Header & Navigation Customizer */}
                    <div className="bg-[#121212] border border-white/10 rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-2 text-[#c79c6e]">
                        <ArrowLeft size={16} />
                        <h4 className="font-serif text-sm uppercase tracking-wider">Top Navigation &amp; Page Header</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Back Button Text</label>
                          <input
                            type="text"
                            value={contactCustomizer.backButtonText || 'Back'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, backButtonText: e.target.value })}
                            placeholder="Back"
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Badge Tag</label>
                          <input
                            type="text"
                            value={contactCustomizer.headerBadge || 'Get In Touch'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, headerBadge: e.target.value })}
                            placeholder="Get In Touch"
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Main Headline</label>
                          <input
                            type="text"
                            value={contactCustomizer.headerTitle || 'How can we support you?'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, headerTitle: e.target.value })}
                            placeholder="How can we support you?"
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs text-white/60 mb-1">Header Subtitle</label>
                          <textarea
                            rows={2}
                            value={contactCustomizer.headerSubtitle || 'Reach out to our dedicated desks for 1-on-1 coaching, sessions, and learning assistance.'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, headerSubtitle: e.target.value })}
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e] leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Interactive Support Cards (Dynamic List: Multiple Cards + Multiple Emails/Phones Per Card) */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-sm text-[#c79c6e] uppercase tracking-wider">
                              Contact Support Cards ({contactCustomizer.cards?.length || 0})
                            </h4>
                            <span className="text-[0.68rem] text-white/40 font-sans hidden sm:inline">
                              (Add multiple emails &amp; phone numbers per card; wraps to bottom row if &gt; 4)
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddContactCard}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#c79c6e] text-black font-semibold rounded-lg hover:bg-[#b0885e] transition-colors text-xs cursor-pointer shadow-md shrink-0"
                        >
                          <Plus size={14} weight="bold" />
                          <span>Add New Card</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(contactCustomizer.cards || []).map((card, cardIdx) => {
                          const iconType = card.icon || 'email';
                          const items = Array.isArray(card.items) ? card.items : [];

                          return (
                            <div key={card.id || cardIdx} className="bg-[#121212] border border-white/10 rounded-xl p-4 space-y-3.5 relative flex flex-col justify-between">
                              <div className="space-y-3">
                                {/* Card Header & Controls */}
                                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                                    {iconType === 'phone' ? (
                                      <PhoneCall size={16} className="text-[#c79c6e]" />
                                    ) : iconType === 'chat' ? (
                                      <ChatCircleDots size={16} className="text-[#c79c6e]" />
                                    ) : iconType === 'location' ? (
                                      <MapPin size={16} className="text-[#c79c6e]" />
                                    ) : (
                                      <EnvelopeSimple size={16} className="text-[#c79c6e]" />
                                    )}
                                    <span>Card #{cardIdx + 1}</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <select
                                      value={iconType}
                                      onChange={(e) => handleUpdateContactCard(cardIdx, 'icon', e.target.value)}
                                      className="bg-[#1a1a1a] text-xs text-white/80 border border-white/10 rounded px-2 py-1 focus:border-[#c79c6e]"
                                    >
                                      <option value="email">Mail Icon</option>
                                      <option value="phone">Phone Icon</option>
                                      <option value="chat">Chat Icon</option>
                                      <option value="location">Location Icon</option>
                                    </select>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteContactCard(cardIdx)}
                                      className="p-1 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                      title="Delete this entire card"
                                    >
                                      <Trash size={14} />
                                    </button>
                                  </div>
                                </div>

                                {/* Card Title */}
                                <div>
                                  <label className="block text-[0.7rem] text-white/50 mb-1">Card Title</label>
                                  <input
                                    type="text"
                                    value={card.title || ''}
                                    onChange={(e) => handleUpdateContactCard(cardIdx, 'title', e.target.value)}
                                    placeholder="e.g. Email Support / Phone Support"
                                    className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#c79c6e]"
                                  />
                                </div>

                                {/* Multiple Contact Numbers / Emails / Links Inside This Card */}
                                <div className="space-y-2 bg-[#161616]/60 border border-white/5 rounded-lg p-2.5">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[0.68rem] text-[#c79c6e] font-semibold uppercase tracking-wider">
                                      Contact Entries ({items.length})
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => handleAddCardItem(cardIdx)}
                                      className="text-[0.68rem] text-[#c79c6e] hover:text-[#e0b88d] flex items-center gap-1 font-medium underline cursor-pointer"
                                    >
                                      <Plus size={11} weight="bold" />
                                      <span>Add Another {iconType === 'phone' ? 'Phone No' : iconType === 'email' ? 'Email' : 'Link'}</span>
                                    </button>
                                  </div>

                                  {items.length === 0 ? (
                                    <div className="text-[0.68rem] text-white/40 py-1 text-center">
                                      No contact items added yet. Click "+ Add" above.
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {items.map((item, itemIdx) => (
                                        <div key={item.id || itemIdx} className="bg-[#121212] border border-white/10 rounded-lg p-2.5 space-y-2">
                                          <div className="flex items-center justify-between gap-1.5">
                                            <span className="text-[0.65rem] text-white/40 font-mono">Entry #{itemIdx + 1}</span>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteCardItem(cardIdx, itemIdx)}
                                              className="text-red-400/50 hover:text-red-400 p-0.5 cursor-pointer"
                                              title="Remove this contact entry"
                                            >
                                              <Trash size={12} />
                                            </button>
                                          </div>

                                          <div>
                                            <div className="flex items-center justify-between mb-1">
                                              <label className="block text-[0.65rem] text-white/50">
                                                {iconType === 'phone' ? 'Phone Number' : iconType === 'email' ? 'Email Address' : 'Contact Value / Link'}
                                              </label>
                                              <span className="text-[0.6rem] text-[#c79c6e]/70">
                                                {iconType === 'phone' ? '(Auto-calls on click)' : iconType === 'email' ? '(Auto-opens email client on click)' : ''}
                                              </span>
                                            </div>
                                            <input
                                              type="text"
                                              value={item.value || ''}
                                              onChange={(e) => handleUpdateCardItem(cardIdx, itemIdx, 'value', e.target.value)}
                                              placeholder={iconType === 'phone' ? '+91 98765 43210' : 'coaching@betterwithaarkesh.com'}
                                              className="w-full bg-[#191919] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#c79c6e] font-mono focus:border-[#c79c6e]"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Subtitle / Availability */}
                                <div>
                                  <label className="block text-[0.7rem] text-white/50 mb-1">Subtitle / Response Time / Timings</label>
                                  <input
                                    type="text"
                                    value={card.subtitle || ''}
                                    onChange={(e) => handleUpdateContactCard(cardIdx, 'subtitle', e.target.value)}
                                    placeholder="e.g. 11am - 8pm (Mon-Sat)"
                                    className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#c79c6e]"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Address & Registered Office Details */}
                    <div className="bg-[#121212] border border-white/10 rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-2 text-[#c79c6e]">
                        <MapPin size={16} weight="fill" />
                        <h4 className="font-serif text-sm uppercase tracking-wider">Registered Office &amp; Address Details</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Section Title</label>
                          <input
                            type="text"
                            value={contactCustomizer.addressTitle || 'Registered Office & Address'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, addressTitle: e.target.value })}
                            placeholder="Registered Office & Address"
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Section Subtitle</label>
                          <input
                            type="text"
                            value={contactCustomizer.addressSubtitle || 'Official business details and communication location'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, addressSubtitle: e.target.value })}
                            placeholder="Official business details and communication location"
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Location Label</label>
                          <input
                            type="text"
                            value={contactCustomizer.operatingLocationLabel || 'Operating Location'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, operatingLocationLabel: e.target.value })}
                            placeholder="Operating Location"
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Operating Location Address</label>
                          <input
                            type="text"
                            value={contactCustomizer.operatingLocation || 'Mumbai, Maharashtra, India'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, operatingLocation: e.target.value })}
                            placeholder="Mumbai, Maharashtra, India"
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Working Hours Label</label>
                          <input
                            type="text"
                            value={contactCustomizer.operatingHoursLabel || 'Working Hours'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, operatingHoursLabel: e.target.value })}
                            placeholder="Working Hours"
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Working Hours Schedule</label>
                          <input
                            type="text"
                            value={contactCustomizer.operatingHours || 'Monday – Saturday, 11:00 AM – 8:00 PM IST'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, operatingHours: e.target.value })}
                            placeholder="Monday – Saturday, 11:00 AM – 8:00 PM IST"
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">CTA Button Text</label>
                          <input
                            type="text"
                            value={contactCustomizer.addressCtaText || 'Book 1:1 Coaching'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, addressCtaText: e.target.value })}
                            placeholder="Book 1:1 Coaching"
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">CTA Button URL</label>
                          <input
                            type="text"
                            value={contactCustomizer.addressCtaUrl || '/book'}
                            onChange={(e) => setContactCustomizer({ ...contactCustomizer, addressCtaUrl: e.target.value })}
                            placeholder="/book"
                            className="w-full bg-[#161616] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c79c6e]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-sans text-white/60">Page Content</label>
                      <span className="text-[0.7rem] text-white/40">Tables, links, headings, and images are supported.</span>
                    </div>
                    <TiptapEditor
                      content={docFormData.contentHtml}
                      onChange={(html) => setDocFormData({ ...docFormData, contentHtml: html })}
                    />
                  </div>
                )}
              </form>
            </div>

            {/* 2. BOTTOM CARD: PAGES LIBRARY TABLE */}
            <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden shadow-xl space-y-4">
              
              {/* Table Header / Summary */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl text-white">Pages Library</h3>
                  <p className="text-white/40 text-xs mt-0.5">
                    Published and draft content with live website slugs.
                  </p>
                </div>
                <span className="text-xs font-sans font-medium text-[#c79c6e] bg-[#c79c6e]/10 border border-[#c79c6e]/30 px-3 py-1 rounded-full">
                  {documents.length} {documents.length === 1 ? 'total page' : 'total pages'}
                </span>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white/80 font-sans">
                  <thead className="bg-white/5 text-[0.7rem] text-white/50 uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4 pl-6">PAGE</th>
                      <th className="p-4">FOOTER</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4">UPDATED</th>
                      <th className="p-4 pr-6 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedDocs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-white/40 text-xs">
                          No pages created yet. Use the form above to create your first static page.
                        </td>
                      </tr>
                    ) : (
                      paginatedDocs.map((doc) => {
                        const secName = findColumnForDoc(doc);
                        const isPublished = doc.status === 'Published';
                        return (
                          <tr key={doc._id} className="hover:bg-white/[0.02] transition-colors">
                            {/* Page title & slug */}
                            <td className="p-4 pl-6">
                              <div className="flex flex-col">
                                <span className="font-semibold text-white text-sm">{doc.title}</span>
                                <a 
                                  href={`/${doc.slug}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs font-mono text-emerald-400/90 hover:underline inline-flex items-center gap-1 mt-0.5"
                                >
                                  /{doc.slug}
                                  <ArrowSquareOut size={11} className="text-emerald-400/60" />
                                </a>
                                <span className="text-[0.68rem] text-white/30 font-light mt-0.5">
                                  {doc.contentHtml ? 'Content available' : 'No summary yet.'}
                                </span>
                              </div>
                            </td>

                            {/* Footer Section */}
                            <td className="p-4">
                              <span className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-white/80 font-medium">
                                {secName}
                              </span>
                            </td>

                            {/* Status with Active Toggle Switch */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                  isPublished 
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                  {doc.status}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(doc)}
                                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                                    isPublished ? 'bg-emerald-500' : 'bg-white/20'
                                  }`}
                                  title="Toggle status"
                                >
                                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                                    isPublished ? 'right-[3px]' : 'left-[3px]'
                                  }`} />
                                </button>
                              </div>
                            </td>

                            {/* Updated / Created Date */}
                            <td className="p-4 text-xs font-mono text-white/50">
                              <div>{new Date(doc.updatedAt || Date.now()).toISOString()}</div>
                              <div className="text-[0.65rem] text-white/30 mt-0.5">
                                Created {new Date(doc.createdAt || Date.now()).toISOString()}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditDoc(doc)}
                                  className="p-2 text-white/60 hover:text-[#c79c6e] hover:bg-white/5 rounded-lg transition-colors"
                                  title="Edit Page"
                                >
                                  <Pen size={15} />
                                </button>
                                {doc.slug === 'contact-us' || doc.slug === 'contact' ? (
                                  <span 
                                    className="px-2.5 py-1 bg-[#c79c6e]/10 border border-[#c79c6e]/25 text-[#c79c6e] text-[0.68rem] font-semibold rounded-lg inline-flex items-center gap-1 select-none cursor-default"
                                    title="Core System Page (Protected from Deletion)"
                                  >
                                    <ShieldCheck size={13} weight="fill" />
                                    <span>Protected Page</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteDoc(doc._id)}
                                    className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete Page"
                                  >
                                    <Trash size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Bar */}
              <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <span>Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white transition-colors"
                  >
                    <CaretLeft size={12} /> Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white transition-colors"
                  >
                    Next <CaretRight size={12} />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ─── TAB 2: BRAND TEXT & SOCIAL LINKS ───────────────────── */}
        {activeTab === 'brand' && (
          <div className="space-y-8">
            {/* Brand Text Settings Form */}
            <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-serif text-xl text-white">Footer Brand Texts</h3>
                  <p className="text-white/50 text-xs mt-0.5">
                    Edit the tagline bio, contact email, and copyright text displayed across all website footers
                  </p>
                </div>
                <button
                  type="submit"
                  form="brandForm"
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 px-4 py-2 bg-[#c79c6e] text-black font-semibold rounded-xl hover:bg-[#c79c6e]/90 transition-colors text-sm disabled:opacity-50"
                >
                  <FloppyDisk size={16} weight="bold" />
                  {isSavingSettings ? 'Saving...' : 'Save Brand Texts'}
                </button>
              </div>

              <form id="brandForm" onSubmit={handleSaveBrandSettings} className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans text-sm">
                <div className="md:col-span-2">
                  <label className="block text-xs text-white/60 mb-1.5">Brand Tagline / Description</label>
                  <textarea
                    rows={3}
                    value={brandSettings.brandDescription}
                    onChange={(e) => setBrandSettings({ ...brandSettings, brandDescription: e.target.value })}
                    placeholder="Short description displayed under brand logo..."
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Direct Contact Email</label>
                  <input
                    type="email"
                    value={brandSettings.brandEmail}
                    onChange={(e) => setBrandSettings({ ...brandSettings, brandEmail: e.target.value })}
                    placeholder="coaching@betterwithaarkesh.com"
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Bottom Bar Copyright Text</label>
                  <input
                    type="text"
                    value={brandSettings.copyrightText}
                    onChange={(e) => setBrandSettings({ ...brandSettings, copyrightText: e.target.value })}
                    placeholder="© 2026 Better With Aarkesh. All rights reserved."
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c79c6e]"
                  />
                </div>
              </form>
            </div>

            {/* Universal Social Links Section */}
            <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-serif text-xl text-white">Universal Social Media Icons</h3>
                  <p className="text-white/50 text-xs mt-0.5">
                    Live links and icons rendered beneath the contact email in the footer
                  </p>
                </div>
                <button
                  onClick={() => handleOpenSocialModal()}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#c79c6e] text-black font-semibold rounded-xl hover:bg-[#c79c6e]/90 transition-colors text-xs"
                >
                  <Plus size={14} weight="bold" />
                  Add Social
                </button>
              </div>

              <div className="overflow-hidden border border-white/5 rounded-xl">
                <table className="w-full text-left text-sm text-white/80 font-sans">
                  <thead className="bg-white/5 text-xs text-white/50 uppercase border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Platform</th>
                      <th className="p-3.5">Label</th>
                      <th className="p-3.5">Destination URL</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {socialLinks.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-white/40 text-xs">
                          No universal social links found. Click "+ Add Social" to create one.
                        </td>
                      </tr>
                    ) : (
                      socialLinks.map((link) => (
                        <tr key={link._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                {getSocialIcon(link.platform, 16)}
                              </div>
                              <span className="font-medium text-white capitalize text-xs">{link.platform}</span>
                            </div>
                          </td>

                          <td className="p-3.5 text-xs text-white/90">{link.label}</td>

                          <td className="p-3.5 text-xs font-mono text-white/50 max-w-xs truncate">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#c79c6e] hover:underline">
                              {link.url}
                            </a>
                          </td>

                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleActiveSocial(link)}
                              className={`px-2 py-0.5 text-xs rounded-full font-medium flex items-center gap-1 transition-all ${
                                link.isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-white/10 text-white/40 border border-white/10'
                              }`}
                              title="Click to toggle visibility"
                            >
                              {link.isActive ? <Eye size={12} /> : <EyeSlash size={12} />}
                              <span>{link.isActive ? 'Active' : 'Hidden'}</span>
                            </button>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenSocialModal(link)}
                                className="p-1.5 text-white/60 hover:text-[#c79c6e] hover:bg-white/5 rounded"
                                title="Edit"
                              >
                                <Pen size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSocial(link._id)}
                                className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded"
                                title="Delete"
                              >
                                <Trash size={14} />
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
                <button onClick={() => setShowSocialModal(false)} className="text-white/40 hover:text-white">
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
                    Visible in footer (Active)
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

        {/* ─── MODAL: CREATE NEW SECTION COLUMN ──────────────────────── */}
        {showNewSectionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#101010] border border-white/15 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-white">
                  <Plus size={18} className="text-[#c79c6e]" weight="bold" />
                  <h3 className="font-serif text-lg">Add New Footer Column</h3>
                </div>
                <button
                  onClick={() => setShowNewSectionModal(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateNewSection} className="space-y-4 font-sans text-sm">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Column Heading / Section Title</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="e.g. RESOURCES, SUPPORT, SERVICES"
                    className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]"
                  />
                  <p className="text-[0.7rem] text-white/40 mt-1.5">
                    This will appear as a new column heading in the website footer.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowNewSectionModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs hover:bg-[#b0885e] transition-colors"
                  >
                    Create Column
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── MODAL: RENAME SECTION HEADING ──────────────────────────── */}
        {showRenameSectionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#101010] border border-white/15 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-white">
                  <Pen size={18} className="text-[#c79c6e]" />
                  <h3 className="font-serif text-lg">Rename Column Heading</h3>
                </div>
                <button
                  onClick={() => setShowRenameSectionModal(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleExecuteRenameSection} className="space-y-4 font-sans text-sm">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Current Heading Name</label>
                  <input
                    type="text"
                    disabled
                    value={renameSectionData.oldName}
                    className="w-full bg-[#161616]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white/50 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1">New Heading Name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={renameSectionData.newName}
                    onChange={(e) => setRenameSectionData({ ...renameSectionData, newName: e.target.value })}
                    placeholder="e.g. ABOUT US, POLICIES"
                    className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]"
                  />
                  <p className="text-[0.7rem] text-white/40 mt-1.5">
                    Renaming will update all associated static pages and website footer columns automatically.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowRenameSectionModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#c79c6e] text-black font-semibold text-xs hover:bg-[#b0885e] transition-colors"
                  >
                    Save Changes
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
