import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  Key, 
  FloppyDisk, 
  LockKey, 
  Eye, 
  EyeSlash, 
  Globe, 
  FileText, 
  CheckCircle, 
  Sparkle, 
  CreditCard,
  Moon,
  Sun,
  Image as ImageIcon,
  UploadSimple,
  Trash,
  DotsThreeVertical,
  Check,
  ShieldCheck
} from '@phosphor-icons/react';
import AdminBreadcrumb from '../components/ui/AdminBreadcrumb';
import { API_URL } from '../utils/apiUrl';
import AuthorizedAdminsManager from './AuthorizedAdminsManager';

const SETTING_TABS = [
  {
    id: 'admins',
    label: 'Authorized Admins',
    subLabel: 'Admin Whitelist & OTP',
    icon: ShieldCheck
  },
  {
    id: 'password',
    label: 'Security & Password',
    subLabel: 'Admin Credentials',
    icon: LockKey
  },
  {
    id: 'razorpay',
    label: 'Payment Gateway',
    subLabel: 'Razorpay API Keys',
    icon: CreditCard
  },
  {
    id: 'tinymce',
    label: 'TinyMCE API Key',
    subLabel: 'Rich Text License',
    icon: FileText
  },
  {
    id: 'seo',
    label: 'SEO',
    subLabel: 'Meta Tags & Search',
    icon: Globe
  }
];

const DEFAULT_SEO = {
  siteName: 'Better With Aarkesh',
  canonicalUrl: 'https://aarkeshgupta.com',
  metaTitle: 'Better With Aarkesh - Life & Executive Coaching | Aarkesh Gupta',
  metaDescription: 'Transform your mindset, communication, and executive presence with Aarkesh Gupta. Explore 1-on-1 life coaching, executive mentorship, and masterclasses.',
  favicon: '/favicon.svg',
  sitelinks: {
    sitelink1: {
      badge: 'Sitelink 1: Book 1-on-1 Coaching',
      badgeColor: 'purple',
      title: 'Book a Session',
      description: 'Schedule a private 1-on-1 life and clarity coaching session with Aarkesh Gupta ...',
      url: '/book'
    },
    sitelink2: {
      badge: 'Sitelink 2: Masterclass / Course',
      badgeColor: 'blue',
      title: 'The Better Man Masterclass',
      description: 'Access the flagship video masterclass and lifetime transformative curriculum ...',
      url: '/course'
    },
    sitelink3: {
      badge: 'Sitelink 3: Principles & Library',
      badgeColor: 'orange',
      title: 'Principles & Articles',
      description: 'Read thought-provoking principles, reflections, and timeless frameworks ...',
      url: '/library'
    },
    sitelink4: {
      badge: 'Sitelink 4: About Aarkesh',
      badgeColor: 'amber',
      title: 'About Aarkesh Gupta',
      description: 'Learn about Aarkesh Gupta, personal coaching philosophy, and executive mentorship.',
      url: '/about-us'
    }
  }
};

export default function AdminSettings() {
  const { showSuccess, showError } = useToast();
  const [activePill, setActivePill] = useState('seo'); // default to SEO

  // Razorpay State
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // TinyMCE State
  const [tinymceApiKey, setTinymceApiKey] = useState('');
  const [isTinyMCELoading, setIsTinyMCELoading] = useState(false);

  // SahiJob Style SEO State
  const [seoForm, setSeoForm] = useState(DEFAULT_SEO);
  const [googlePreviewTheme, setGooglePreviewTheme] = useState('dark'); // 'dark' | 'light'
  const [isSeoSaving, setIsSeoSaving] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const faviconFileInputRef = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = API_URL;

      // Fetch Razorpay
      const res = await fetch(`${apiUrl}/api/payment/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRazorpayKeyId(data.keyId || '');
        setRazorpayKeySecret(data.keySecret || '');
      }

      // Fetch TinyMCE Settings
      const resTiny = await fetch(`${apiUrl}/api/visual-settings/tinymce`);
      if (resTiny.ok) {
        const dataTiny = await resTiny.json();
        if (dataTiny.apiKey && dataTiny.apiKey !== 'no-api-key') {
          setTinymceApiKey(dataTiny.apiKey);
        }
      }

      // Fetch SEO Settings
      const resSeo = await fetch(`${apiUrl}/api/seo-settings`);
      if (resSeo.ok) {
        const dataSeo = await resSeo.json();
        setSeoForm({
          ...DEFAULT_SEO,
          ...dataSeo,
          sitelinks: {
            ...DEFAULT_SEO.sitelinks,
            ...(dataSeo.sitelinks || {})
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    }
  };

  // --- Handlers ---
  const handleSaveRazorpay = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/payment/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ keyId: razorpayKeyId, keySecret: razorpayKeySecret })
      });

      if (res.ok) {
        showSuccess('Payment gateway credentials saved successfully!');
      } else {
        showError('Failed to save payment gateway credentials.');
      }
    } catch (error) {
      console.error(error);
      showError('Network error while saving settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters.');
      return;
    }
    setIsPasswordLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/auth/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res.ok) {
        showSuccess('Admin password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        showError(data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error(error);
      showError('Network error while changing password.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleTinyMCESave = async (e) => {
    e.preventDefault();
    setIsTinyMCELoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/visual-settings/tinymce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apiKey: tinymceApiKey })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('tinymce_api_key', data.apiKey || tinymceApiKey);
        showSuccess('TinyMCE API key saved successfully!');
      } else {
        showError('Failed to save TinyMCE API key.');
      }
    } catch (error) {
      console.error(error);
      showError('Network error while saving TinyMCE settings.');
    } finally {
      setIsTinyMCELoading(false);
    }
  };

  const handleSeoFieldChange = (field, value) => {
    setSeoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file (.png, .ico, .svg, .jpg).');
      return;
    }

    setIsUploadingFavicon(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = data.imageUrl || data.url;
        if (uploadedUrl) {
          handleSeoFieldChange('favicon', uploadedUrl);
          showSuccess('Favicon uploaded successfully!');
        } else {
          showError('Upload completed but no image URL was returned.');
        }
      } else {
        showError('Failed to upload favicon.');
      }
    } catch (err) {
      console.error(err);
      showError('Network error while uploading favicon.');
    } finally {
      setIsUploadingFavicon(false);
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = '';
    }
  };

  const handleSaveSeo = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSeoSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/seo-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(seoForm)
      });

      if (res.ok) {
        showSuccess('SEO settings saved! Google search metadata is updated.');
      } else {
        showError('Failed to save SEO settings.');
      }
    } catch (err) {
      console.error(err);
      showError('Network error while saving SEO settings.');
    } finally {
      setIsSeoSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500 font-sans">
      
      {/* Top Breadcrumb */}
      <AdminBreadcrumb items={['SETTINGS', SETTING_TABS.find(t => t.id === activePill)?.label?.toUpperCase() || 'SEO']} />

      {/* 2-Column Split: Left Sidebar + Right Settings Content */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        
        {/* ─── LEFT SIDEBAR (EXACT SAHIJOB STYLE) ─── */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col gap-4 lg:sticky lg:top-20">
          
          <div className="flex flex-col gap-2">
            {SETTING_TABS.map((tab) => {
              const isActive = activePill === tab.id;
              const IconComp = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePill(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#fef3ee] border border-[#fbd4c2] text-[#c8532f] shadow-xs'
                      : 'bg-white border border-transparent hover:border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                    isActive ? 'text-[#c8532f] bg-[#fbe7dd]' : 'text-stone-400'
                  }`}>
                    <IconComp size={20} weight={isActive ? 'bold' : 'regular'} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold block truncate leading-tight ${
                      isActive ? 'text-[#c8532f]' : 'text-stone-800'
                    }`}>
                      {tab.label}
                    </span>
                    <span className="text-[11px] text-stone-400 block truncate mt-0.5">
                      {tab.subLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* System Automation Bottom Widget (Admin Orange Theme) */}
          <div className="p-4 rounded-2xl bg-[#fef5f0] border border-[#fbd6c4] flex flex-col gap-1.5 text-left mt-2">
            <div className="flex items-center gap-2 text-[#c8532f] font-bold text-xs">
              <Sparkle size={15} weight="fill" />
              <span>System Automation</span>
            </div>
            <p className="text-[11px] text-[#8c371b] leading-relaxed">
              Keep your portal database and search ranking optimized.
            </p>
          </div>

        </aside>

        {/* ─── RIGHT CONTENT AREA ─── */}
        <main className="flex-1 w-full min-w-0 flex flex-col gap-6">

          {/* ============================================================== */}
          {/* TAB 1: SEO (EXACT SAHIJOB STYLE) */}
          {/* ============================================================== */}
          {activePill === 'seo' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">

              {/* CARD 1: LIVE GOOGLE SEARCH RESULT PREVIEW */}
              <div className="bg-white border border-stone-200/80 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col gap-5">
                
                {/* Header with Dark / Light Mode Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkle size={18} className="text-[#c8532f]" />
                      <h2 className="font-serif text-xl md:text-2xl font-bold text-stone-900">
                        Live Google Search Result Preview
                      </h2>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      This preview shows how {seoForm.siteName || 'Better With Aarkesh'} appears on Google search results after your changes are saved.
                    </p>
                  </div>

                  {/* Dark Mode / Light Mode Toggle Pill Container */}
                  <div className="flex bg-[#f1f5f9] p-1 rounded-xl border border-stone-200 shrink-0 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setGooglePreviewTheme('dark')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        googlePreviewTheme === 'dark' 
                          ? 'bg-[#0f172a] text-white shadow-xs' 
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Moon size={14} weight="fill" />
                      <span>Google Dark Mode</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setGooglePreviewTheme('light')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        googlePreviewTheme === 'light' 
                          ? 'bg-white text-stone-900 shadow-xs' 
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Sun size={14} weight="bold" />
                      <span>Google Light Mode</span>
                    </button>
                  </div>
                </div>

                {/* Google SERP Preview Box (Exact Google SERP Layout) */}
                <div className={`p-6 sm:p-8 rounded-2xl transition-colors font-sans flex flex-col gap-3 shadow-md ${
                  googlePreviewTheme === 'dark' ? 'bg-[#202124] text-white' : 'bg-white text-stone-900 border border-stone-200'
                }`}>
                  
                  {/* Top Line: Favicon + Brand Name + URL + 3 Dots */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                        googlePreviewTheme === 'dark' ? 'bg-[#303134]' : 'bg-stone-100'
                      }`}>
                        {seoForm.favicon ? (
                          <img 
                            src={seoForm.favicon.startsWith('/') ? `${seoForm.favicon}?v=2` : seoForm.favicon} 
                            alt="Favicon" 
                            className="w-4 h-4 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-xs font-bold text-[#c8532f]">B</span>
                        )}
                      </div>

                      <div className="flex flex-col leading-tight">
                        <span className={`text-sm font-medium ${googlePreviewTheme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                          {seoForm.siteName || 'Better With Aarkesh'}
                        </span>
                        <span className={`text-xs font-mono truncate max-w-sm ${googlePreviewTheme === 'dark' ? 'text-[#bdc1c6]' : 'text-stone-500'}`}>
                          {seoForm.canonicalUrl || 'https://aarkeshgupta.com'}
                        </span>
                      </div>
                    </div>

                    <DotsThreeVertical size={18} className={googlePreviewTheme === 'dark' ? 'text-[#9aa0a6]' : 'text-stone-400'} />
                  </div>

                  {/* Google Blue Title Link */}
                  <h3 className={`text-xl sm:text-[22px] font-normal leading-snug hover:underline cursor-pointer pt-1 ${
                    googlePreviewTheme === 'dark' ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
                  }`}>
                    {seoForm.metaTitle || 'Better With Aarkesh - Life & Executive Coaching | Aarkesh Gupta'}
                  </h3>

                  {/* Google Description Snippet */}
                  <p className={`text-sm sm:text-[14px] leading-relaxed ${
                    googlePreviewTheme === 'dark' ? 'text-[#bdc1c6]' : 'text-[#4d5156]'
                  }`}>
                    <strong>{seoForm.siteName || 'Better With Aarkesh'}:</strong>{' '}
                    {seoForm.metaDescription || 'Transform your mindset, communication, and executive presence with Aarkesh Gupta. Explore 1-on-1 life coaching, executive mentorship, and masterclasses.'}
                  </p>

                </div>

              </div>

              {/* CARD 2: FAVICON UPLOAD */}
              <div className="bg-white border border-stone-200/80 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#fef3ee] text-[#c8532f] flex items-center justify-center shrink-0">
                    <ImageIcon size={22} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-stone-900">Favicon Upload</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Upload your official site icon. Google displays this favicon beside your website title in search results.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col md:flex-row items-center gap-6">
                  
                  {/* Favicon Box with Active Badge */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-stone-300 flex items-center justify-center p-2 shadow-xs">
                      {seoForm.favicon ? (
                        <img 
                          src={seoForm.favicon.startsWith('/') ? `${seoForm.favicon}?v=2` : seoForm.favicon} 
                          alt="Current Favicon" 
                          className="w-10 h-10 object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <ImageIcon size={28} className="text-stone-300" />
                      )}
                    </div>
                    {seoForm.favicon && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#c8532f] text-white flex items-center justify-center shadow-xs">
                        <Check size={14} weight="bold" />
                      </div>
                    )}
                  </div>

                  {/* Actions & URL Input */}
                  <div className="flex-1 w-full flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        {seoForm.favicon ? 'Custom Favicon Active' : 'Default Favicon Active'}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Recommended: Square image (.png, .ico, .svg, .jpg), at least 48x48px or 96x96px.
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <input 
                        type="file"
                        ref={faviconFileInputRef}
                        accept="image/png, image/x-icon, image/svg+xml, image/jpeg, image/webp"
                        onChange={handleFaviconUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => faviconFileInputRef.current?.click()}
                        disabled={isUploadingFavicon}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8532f] hover:bg-[#a94326] text-white text-xs font-bold tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <UploadSimple size={15} weight="bold" />
                        {isUploadingFavicon ? 'Uploading...' : 'Upload Favicon Image'}
                      </button>

                      {seoForm.favicon && (
                        <button
                          type="button"
                          onClick={() => handleSeoFieldChange('favicon', '')}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Trash size={15} />
                          <span>Remove Favicon</span>
                        </button>
                      )}
                    </div>

                    <input 
                      type="text"
                      value={seoForm.favicon}
                      onChange={(e) => handleSeoFieldChange('favicon', e.target.value)}
                      placeholder="/favicon.svg or https://..."
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-stone-900 text-xs font-mono placeholder-stone-400 focus:outline-none focus:border-[#c8532f]"
                    />
                  </div>

                </div>
              </div>

              {/* CARD 3: MAIN GOOGLE SEARCH RESULT DETAILS (EXACT SAHIJOB STYLE) */}
              <div className="bg-white border border-stone-200/80 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#fef3ee] text-[#c8532f] flex items-center justify-center shrink-0">
                    <Globe size={22} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-stone-900">Main Google Search Result Details</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Controls the title and description shown on Google search results (replaces old default contact info).
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Row 1: Site Brand Name + Official URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700">Site Brand Name</label>
                      <input 
                        type="text"
                        value={seoForm.siteName}
                        onChange={(e) => handleSeoFieldChange('siteName', e.target.value)}
                        placeholder="Better With Aarkesh"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 text-sm focus:outline-none focus:bg-white focus:border-[#c8532f]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700">Official Website URL</label>
                      <input 
                        type="url"
                        value={seoForm.canonicalUrl}
                        onChange={(e) => handleSeoFieldChange('canonicalUrl', e.target.value)}
                        placeholder="https://aarkeshgupta.com"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 text-sm font-mono focus:outline-none focus:bg-white focus:border-[#c8532f]"
                      />
                    </div>
                  </div>

                  {/* Row 2: Google Search Title */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700">Google Search Title (Meta Title)</label>
                      <span className={`text-[11px] font-mono font-semibold ${
                        seoForm.metaTitle.length > 60 ? 'text-amber-600' : 'text-[#c8532f]'
                      }`}>
                        {seoForm.metaTitle.length} / 60 characters recommended
                      </span>
                    </div>
                    <input 
                      type="text"
                      value={seoForm.metaTitle}
                      onChange={(e) => handleSeoFieldChange('metaTitle', e.target.value)}
                      placeholder="Better With Aarkesh - Life & Executive Coaching | Aarkesh Gupta"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 text-sm focus:outline-none focus:bg-white focus:border-[#c8532f] font-medium"
                    />
                  </div>

                  {/* Row 3: Google Search Description */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700">Google Search Description (Meta Description)</label>
                      <span className={`text-[11px] font-mono font-semibold ${
                        seoForm.metaDescription.length > 160 ? 'text-amber-600' : 'text-[#c8532f]'
                      }`}>
                        {seoForm.metaDescription.length} / 160 characters recommended
                      </span>
                    </div>
                    <textarea 
                      rows={3}
                      value={seoForm.metaDescription}
                      onChange={(e) => handleSeoFieldChange('metaDescription', e.target.value)}
                      placeholder="Search and apply description..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 text-sm focus:outline-none focus:bg-white focus:border-[#c8532f] leading-relaxed"
                    />
                  </div>
                </div>

              </div>

              {/* SAVE ACTION BAR (ORANGE ADMIN THEME) */}
              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-10">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckCircle size={17} className="text-[#c8532f]" />
                  <span>Saves directly to MongoDB and immediately serves to Googlebot and live search crawlers.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reset all SEO to recommended defaults?')) {
                        setSeoForm(DEFAULT_SEO);
                        showSuccess('Reset to defaults.');
                      }
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset Defaults
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSeo}
                    disabled={isSeoSaving}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-[#c8532f] hover:bg-[#a94326] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <FloppyDisk size={16} />
                    {isSeoSaving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: PASSWORD & SECURITY TAB */}
          {/* ============================================================== */}
          {activePill === 'password' && (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col gap-6 animate-in fade-in duration-300">
              
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#fef3ee] text-[#c8532f] flex items-center justify-center">
                  <LockKey size={22} />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-stone-900 font-bold">Admin Security & Password</h2>
                  <p className="text-xs text-stone-500 mt-0.5">Change your master admin login credentials</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 mt-1">
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] uppercase tracking-wider text-stone-600 font-bold flex items-center gap-1.5">
                    <Key size={13} className="text-[#c8532f]" /> Current Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pr-12 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c8532f] focus:bg-white transition-colors text-sm"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[11px] uppercase tracking-wider text-stone-600 font-bold flex items-center gap-1.5">
                      <Key size={13} className="text-[#c8532f]" /> New Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 6 characters)"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pr-12 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c8532f] focus:bg-white transition-colors text-sm"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none cursor-pointer"
                      >
                        {showNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[11px] uppercase tracking-wider text-stone-600 font-bold flex items-center gap-1.5">
                      <Key size={13} className="text-[#c8532f]" /> Re-enter New Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pr-12 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c8532f] focus:bg-white transition-colors text-sm"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-stone-100">
                  <button 
                    type="submit"
                    disabled={isPasswordLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c8532f] text-white hover:bg-[#a94326] font-sans text-xs uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <LockKey size={16} />
                    {isPasswordLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: RAZORPAY GATEWAY TAB */}
          {/* ============================================================== */}
          {activePill === 'razorpay' && (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col gap-6 animate-in fade-in duration-300">
              
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#fef3ee] text-[#c8532f] flex items-center justify-center">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-stone-900 font-bold">Razorpay Payment Gateway</h2>
                  <p className="text-xs text-stone-500 mt-0.5">Manage live / test payment keys for coaching bookings and course purchases</p>
                </div>
              </div>

              <form onSubmit={handleSaveRazorpay} className="flex flex-col gap-5 mt-1">
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] uppercase tracking-wider text-stone-600 font-bold flex items-center gap-1.5">
                    <Key size={13} className="text-[#c8532f]" /> Razorpay Key ID
                  </label>
                  <input 
                    type="text" 
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                    placeholder="rzp_test_... or rzp_live_..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c8532f] focus:bg-white transition-colors font-mono text-sm"
                    required
                  />
                  <span className="text-[11px] text-stone-400">Available from Razorpay Dashboard &gt; Settings &gt; API Keys</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] uppercase tracking-wider text-stone-600 font-bold flex items-center gap-1.5">
                    <Key size={13} className="text-[#c8532f]" /> Razorpay Key Secret
                  </label>
                  <div className="relative">
                    <input 
                      type={showRazorpaySecret ? "text" : "password"}
                      value={razorpayKeySecret}
                      onChange={(e) => setRazorpayKeySecret(e.target.value)}
                      placeholder="Enter your Razorpay Secret Key"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pr-12 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c8532f] focus:bg-white transition-colors font-mono text-sm"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none cursor-pointer"
                    >
                      {showRazorpaySecret ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-stone-100">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c8532f] text-white hover:bg-[#a94326] font-sans text-xs uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <FloppyDisk size={16} />
                    {isLoading ? 'Saving Credentials...' : 'Save Razorpay Credentials'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: TINYMCE API KEY TAB */}
          {/* ============================================================== */}
          {activePill === 'tinymce' && (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col gap-6 animate-in fade-in duration-300">
              
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#fef3ee] text-[#c8532f] flex items-center justify-center">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-stone-900 font-bold">TinyMCE Rich Text Editor</h2>
                  <p className="text-xs text-stone-500 mt-0.5">Configure your API Key for articles, library blogs, and footer document editors</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 leading-relaxed">
                If you do not have an API key or leave this empty, the editor operates in open mode without locking the rich text content. Adding your verified domain key prevents watermark notices.
              </div>

              <form onSubmit={handleTinyMCESave} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] uppercase tracking-wider text-stone-600 font-bold">
                    TinyMCE API Key
                  </label>
                  <input 
                    type="text"
                    value={tinymceApiKey}
                    onChange={(e) => setTinymceApiKey(e.target.value)}
                    placeholder="e.g. j3wb3qfjfsjor8dgmndqixpa3nc1oeiq1kg6uay66wypfg6c or leave empty"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c8532f] focus:bg-white transition-colors font-mono text-sm"
                  />
                  <span className="text-[11px] text-stone-500 mt-1">
                    Get your free API key at <a href="https://www.tiny.cloud" target="_blank" rel="noreferrer" className="text-[#c8532f] underline font-medium">tiny.cloud</a> and whitelist your domain (e.g. <code>aarkeshgupta.com</code>).
                  </span>
                </div>

                <div className="flex justify-end pt-3 border-t border-stone-100">
                  <button 
                    type="submit"
                    disabled={isTinyMCELoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c8532f] text-white hover:bg-[#a94326] font-sans text-xs uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <FloppyDisk size={16} />
                    {isTinyMCELoading ? 'Saving Key...' : 'Save TinyMCE Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* ============================================================== */}
          {/* TAB: AUTHORIZED ADMINS (OTP & WHITELIST)                       */}
          {/* ============================================================== */}
          {activePill === 'admins' && (
            <AuthorizedAdminsManager />
          )}

        </main>
      </div>

    </div>
  );
}
