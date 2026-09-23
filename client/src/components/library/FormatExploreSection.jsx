import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  BookOpen, 
  Play, 
  Key, 
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  PlayCircle,
  Sparkle,
  Target,
  Stack,
  ArrowsClockwise,
  Recycle,
  X,
  BookmarkSimple
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import UniversalVideoModal from '../ui/UniversalVideoModal';
import { renderFormattedTitle } from '../../pages/articles/ArticleReaderView';
import { LIBRARY_CATEGORIES } from './LibraryDirectorySection';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Placeholders for video thumbnails
import videoThumb1 from '../../assets/PerspectivePage/recognition/emotional_exhaustion.webp';
import videoThumb2 from '../../assets/PerspectivePage/recognition/comparison.webp';
import videoThumb3 from '../../assets/PerspectivePage/recognition/holding_it_in.webp';

// Import topics for the articles list
import { topics } from '../../constants/articleTaxonomy';

gsap.registerPlugin(ScrollTrigger);

const RadarIcon = ({ size }) => (
  <div style={{ width: size, height: size }} className="relative flex items-center justify-center scale-[1.3] opacity-80 group-hover:opacity-100 transition-opacity duration-300">
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-[70%] h-[70%]">
      <line x1="50" y1="50" x2="50" y2="10" />
      <line x1="50" y1="50" x2="85" y2="25" />
      <line x1="50" y1="50" x2="95" y2="60" />
      <line x1="50" y1="50" x2="75" y2="90" />
      <line x1="50" y1="50" x2="25" y2="90" />
      <line x1="50" y1="50" x2="5" y2="60" />
      <line x1="50" y1="50" x2="15" y2="25" />
      <polygon points="50,10 85,25 95,60 75,90 25,90 5,60 15,25" opacity="0.3" />
      <polygon points="50,15 75,30 70,60 50,75 40,75 30,50 35,35" fill="rgba(199,156,110,0.1)" stroke="#c79c6e" strokeWidth="1" />
    </svg>
    <span className="absolute -top-1 text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-[#c79c6e]">Personal Growth</span>
    <span className="absolute top-[20%] right-[-10%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-right w-12 text-[#c79c6e]">Relationships</span>
    <span className="absolute top-[50%] right-[-15%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-right w-12 text-[#c79c6e]">Health<br/>& Energy</span>
    <span className="absolute bottom-[10%] right-[-5%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-right w-12 text-[#c79c6e]">Finances</span>
    <span className="absolute -bottom-1 text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-[#c79c6e]">Work & Purpose</span>
    <span className="absolute bottom-[15%] left-[-15%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-left w-12 text-[#c79c6e]">Environment</span>
    <span className="absolute top-[50%] left-[-15%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-left w-12 text-[#c79c6e]">Fun &<br/>Recreation</span>
    <span className="absolute top-[20%] left-[-10%] text-[0.25rem] tracking-[0.2em] uppercase opacity-40 text-left w-12 text-[#c79c6e]">Spirituality</span>
  </div>
);

const StackIcon = ({ size }) => (
  <div style={{ width: size, height: size }} className="relative flex items-center justify-center scale-110 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-[60%] h-[60%] text-[#c79c6e]">
      <ellipse cx="50" cy="30" rx="30" ry="10" strokeOpacity="0.8" />
      <ellipse cx="50" cy="50" rx="30" ry="10" strokeOpacity="0.5" />
      <ellipse cx="50" cy="70" rx="30" ry="10" strokeOpacity="0.2" />
    </svg>
  </div>
);

const CBTIcon = ({ size }) => (
  <div style={{ width: size, height: size }} className="relative flex items-center justify-center scale-110 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
    <Recycle className="w-[60%] h-[60%] text-[#c79c6e]" weight="regular" />
    <span className="absolute top-[5%] text-[0.3rem] tracking-[0.2em] uppercase opacity-40 text-[#c79c6e]">Thoughts</span>
    <span className="absolute bottom-[10%] left-[5%] text-[0.3rem] tracking-[0.2em] uppercase opacity-40 text-[#c79c6e]">Feelings</span>
    <span className="absolute bottom-[10%] right-[5%] text-[0.3rem] tracking-[0.2em] uppercase opacity-40 text-[#c79c6e]">Actions</span>
  </div>
);

const formats = [
  {
    id: 'latest',
    icon: Sparkle,
    title: 'LATEST',
    count: 'NEW ARRIVALS',
    desc: 'The most recent\narticles and videos.',
    action: 'EXPLORE LATEST'
  },
  {
    id: 'read',
    icon: BookOpen,
    title: 'READ',
    count: '12 ARTICLES',
    desc: 'Ideas to sit with at\nyour own pace.',
    action: 'EXPLORE ARTICLES'
  },
  {
    id: 'watch',
    icon: Play,
    title: 'WATCH',
    count: '10 VIDEOS',
    desc: 'Perspectives spoken\nand explored.',
    action: 'EXPLORE VIDEOS'
  }
];

const videos = [
  {
    id: 1,
    image: videoThumb1,
    duration: '8 MIN',
    title: 'When clarity asks something of you'
  },
  {
    id: 2,
    image: videoThumb2,
    duration: '11 MIN',
    title: 'The difference between being heard and being agreed with'
  },
  {
    id: 3,
    image: videoThumb3,
    duration: '7 MIN',
    title: 'Why familiar patterns can feel safer than healthy ones'
  }
];

const articles = [
  {
    id: 1,
    duration: '5 MIN',
    title: 'The hidden cost of holding it all together'
  },
  {
    id: 2,
    duration: '7 MIN',
    title: 'Why we apologize when we are not wrong'
  },
  {
    id: 3,
    duration: '4 MIN',
    title: 'Rest as a necessary boundary'
  }
];

const reflectionTools = [
  {
    id: 1,
    duration: '15 MIN',
    title: 'Wheel of Life',
    desc: 'Map the areas of life that\nshape your overall well-being.',
    icon: RadarIcon
  },
  {
    id: 2,
    duration: '10 MIN',
    title: 'Mindset Reflection',
    desc: 'Explore the patterns shaping\nyour thoughts and choices.',
    icon: StackIcon
  },
  {
    id: 3,
    duration: '20 MIN',
    title: 'CBT-Inspired Tools',
    desc: 'Practical frameworks to understand\nand shift unhelpful cycles.',
    icon: CBTIcon
  }
];

export default function FormatExploreSection() {
  const navigate = useNavigate();
  const [hoveredFormat, setHoveredFormat] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [dbVideos, setDbVideos] = useState([]);
  const [dbArticles, setDbArticles] = useState([]);
  const [formatSettings, setFormatSettings] = useState(null);
  
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [visibleArticleCount, setVisibleArticleCount] = useState(6);
  const [activeModalVideo, setActiveModalVideo] = useState(null);
  const [savedVideoIds, setSavedVideoIds] = useState(new Set());
  const [savedArticleIds, setSavedArticleIds] = useState(new Set());
  
  const containerRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const contentContainerRef = useRef(null);

  // Helper to safely embed YouTube/Vimeo links
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    if (url.includes('vimeo.com/')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    return url;
  };

  const handleVideoClick = (video) => {
    if (video.videoUrl && video.videoUrl.includes('instagram.com')) {
      window.open(video.videoUrl, '_blank');
    } else {
      setActiveModalVideo(video);
    }
  };

  const handleToggleSaveVideo = async (video, e) => {
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const videoId = video._id || video.id;
    if (!videoId && !video.title) return;

    const key = videoId || video.title;
    const isSaved = savedVideoIds.has(key) || (video._id && savedVideoIds.has(video._id)) || (video.title && savedVideoIds.has(video.title));

    setSavedVideoIds(prev => {
      const next = new Set(prev);
      if (isSaved) {
        if (videoId) next.delete(videoId);
        if (video._id) next.delete(video._id);
        if (video.title) next.delete(video.title);
      } else {
        if (videoId) next.add(videoId);
        if (video._id) next.add(video._id);
        if (video.title) next.add(video.title);
      }
      return next;
    });

    try {
      const res = await fetch(`${API_URL}/api/users/save-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          videoId,
          title: video.title,
          videoUrl: video.videoUrl || '',
          thumbnailUrl: video.thumbnailUrl || video.image || '',
          duration: video.duration || 'VIDEO'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.videoId) {
          setSavedVideoIds(prev => new Set([...prev, data.videoId]));
        }
      } else {
        // Revert
        setSavedVideoIds(prev => {
          const next = new Set(prev);
          if (isSaved) next.add(key);
          else next.delete(key);
          return next;
        });
      }
    } catch (err) {
      console.error('Error saving video:', err);
    }
  };

  const handleToggleSaveArticle = async (item, e) => {
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const articleId = item._id || item.id || item.slug;
    if (!articleId && !item.title) return;

    const key = articleId || item.title;
    const isSaved = savedArticleIds.has(key) || (item._id && savedArticleIds.has(item._id)) || (item.slug && savedArticleIds.has(item.slug));

    setSavedArticleIds(prev => {
      const next = new Set(prev);
      if (isSaved) {
        if (articleId) next.delete(articleId);
        if (item._id) next.delete(item._id);
        if (item.slug) next.delete(item.slug);
      } else {
        if (articleId) next.add(articleId);
        if (item._id) next.add(item._id);
        if (item.slug) next.add(item.slug);
      }
      return next;
    });

    try {
      const res = await fetch(`${API_URL}/api/users/save-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          articleId,
          title: item.title,
          category: item.categoryName || item.category || 'RELATIONSHIPS',
          excerpt: item.excerpt || item.subtitle || item.description || '',
          image: item.featuredImage || item.image || '/library_preview_silhouette.jpg',
          slug: item.slug || ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.articleId) {
          setSavedArticleIds(prev => new Set([...prev, data.articleId]));
        }
      } else {
        setSavedArticleIds(prev => {
          const next = new Set(prev);
          if (isSaved) next.add(key);
          else next.delete(key);
          return next;
        });
      }
    } catch (err) {
      console.error('Error saving article:', err);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/library-settings`)
      .then(res => res.json())
      .then(data => {
        if (data.formatExplore) {
          setFormatSettings(data.formatExplore);
        }
      })
      .catch(err => console.error('Error fetching library format settings:', err));

    fetch(`${API_URL}/api/videos/published`)
      .then(res => res.json())
      .then(data => setDbVideos(data))
      .catch(err => console.error('Error fetching videos:', err));
      
    fetch(`${API_URL}/api/articles/published`)
      .then(res => res.json())
      .then(data => setDbArticles(data))
      .catch(err => console.error('Error fetching articles:', err));

    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/users/saved-videos`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          const ids = new Set((data || []).map(v => v._id || v.id || v));
          setSavedVideoIds(ids);
        })
        .catch(err => console.error('Error fetching saved videos:', err));

      fetch(`${API_URL}/api/users/saved-articles`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          const ids = new Set((data || []).map(a => a._id || a.id || a));
          setSavedArticleIds(ids);
        })
        .catch(err => console.error('Error fetching saved articles:', err));
    }
  }, []);

  const displayVideos = dbVideos.length > 0 ? dbVideos : videos;
  const displayArticles = dbArticles.length > 0 ? dbArticles : articles;

  const allReadArticles = (() => {
    let list = [];
    LIBRARY_CATEGORIES.forEach(cat => {
      (cat.articles || []).forEach(art => {
        list.push({
          ...art,
          categoryName: (cat.title || cat.id || 'RELATIONSHIPS').toUpperCase(),
          categoryId: cat.id
        });
      });
    });

    if (dbArticles && dbArticles.length > 0) {
      dbArticles.forEach(dbA => {
        const existingIdx = list.findIndex(a => a.id === dbA._id || a.id === dbA.id || a.slug === dbA.slug);
        const catName = (dbA.categoryTitle || dbA.category || 'RELATIONSHIPS').toUpperCase();
        const artObj = {
          id: dbA._id || dbA.id || dbA.slug,
          slug: dbA.slug || dbA.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: dbA.title,
          categoryName: catName,
          category: catName,
          categoryId: dbA.categoryId || dbA.category?.toLowerCase() || 'relationships',
          headingId: dbA.headingId || '',
          featuredImage: dbA.featuredImage || dbA.image || '/library_preview_silhouette.jpg',
          image: dbA.featuredImage || dbA.image || '/library_preview_silhouette.jpg',
          excerpt: dbA.description || dbA.subtitle || dbA.excerpt || '',
          ...dbA
        };
        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], ...artObj };
        } else {
          list.unshift(artObj);
        }
      });
    }

    return list;
  })();

  const totalArticlesCount = allReadArticles.length;

  const readCategoryTabs = [
    { id: 'all', title: 'ALL' },
    ...LIBRARY_CATEGORIES.map(c => ({
      id: c.id,
      title: c.title.toUpperCase()
    }))
  ];

  const filteredReadArticles = selectedCategoryTab === 'all'
    ? allReadArticles
    : allReadArticles.filter(a => 
        (a.categoryId || '').toLowerCase() === selectedCategoryTab.toLowerCase() ||
        (a.categoryName || '').toLowerCase() === selectedCategoryTab.toLowerCase() ||
        (a.category || '').toLowerCase() === selectedCategoryTab.toLowerCase()
      );

  const isWatchCardVisible = formatSettings?.showWatchCard !== false;

  const latestItems = (() => {
    const items = [];
    const maxItems = 6;
    let artIdx = 0;
    let vidIdx = 0;
    
    while (items.length < maxItems && (artIdx < allReadArticles.length || (isWatchCardVisible && vidIdx < displayVideos.length))) {
      if (artIdx < allReadArticles.length) {
        items.push({ ...allReadArticles[artIdx], isArticleItem: true });
        artIdx++;
      }
      if (items.length < maxItems && isWatchCardVisible && vidIdx < displayVideos.length) {
        items.push({ ...displayVideos[vidIdx], isVideoItem: true });
        vidIdx++;
      }
    }
    return items.slice(0, 6);
  })();

  const formats = [
    {
      id: 'latest',
      icon: Sparkle,
      title: formatSettings?.latestCardTitle || 'LATEST',
      count: formatSettings?.latestCardSubtitle || 'NEW ARRIVALS',
      desc: formatSettings?.latestCardDesc || 'The most recent\narticles and videos.',
      action: 'EXPLORE LATEST'
    },
    {
      id: 'read',
      icon: BookOpen,
      title: formatSettings?.readCardTitle || 'READ',
      count: `${totalArticlesCount} ARTICLE${totalArticlesCount !== 1 ? 'S' : ''}`,
      desc: formatSettings?.readCardDesc || 'Ideas to sit with at\nyour own pace.',
      action: 'EXPLORE ARTICLES'
    },
    ...(isWatchCardVisible ? [{
      id: 'watch',
      icon: Play,
      title: formatSettings?.watchCardTitle || 'WATCH',
      count: `${(dbVideos.length > 0 ? dbVideos.length : videos.length)} VIDEO${(dbVideos.length > 0 ? dbVideos.length : videos.length) !== 1 ? 'S' : ''}`,
      desc: formatSettings?.watchCardDesc || 'Perspectives spoken\nand explored.',
      action: 'EXPLORE VIDEOS'
    }] : [])
  ];

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.format-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }
    )
    .fromTo('.format-card', 
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.3, 
        stagger: 0.1,
        ease: 'power3.out',
      },
      "-=0.5"
    );
  }, { scope: containerRef });

  // Handle transition between overview and specific format view
  const handleFormatSelect = (formatId) => {
    setSelectedCategoryTab('all');
    setVisibleArticleCount(6);
    const tl = gsap.timeline();
    
    // Fade out cards
    tl.to(cardsContainerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setSelectedFormat(formatId);
        // Fade in new content
        gsap.fromTo(contentContainerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', delay: 0.1 }
        );
      }
    });
  };

  const handleTabClick = (formatId) => {
    if (formatId === selectedFormat) return;
    setSelectedCategoryTab('all');
    setVisibleArticleCount(6);
    
    gsap.to(contentContainerRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.3,
      onComplete: () => {
        setSelectedFormat(formatId);
        gsap.fromTo(contentContainerRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, delay: 0.1 }
        );
      }
    });
  };

  const handleBackToOverview = () => {
    if (!contentContainerRef.current) {
      setSelectedFormat(null);
      return;
    }
    gsap.to(contentContainerRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.25,
      onComplete: () => {
        setSelectedFormat(null);
        setTimeout(() => {
          if (cardsContainerRef.current) {
            gsap.fromTo(cardsContainerRef.current,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
            );
          }
        }, 50);
      }
    });
  };

  if (formatSettings && (formatSettings.showSection === false || formatSettings.enabled === false)) {
    return null;
  }

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-32 pb-12 flex flex-col items-center px-6 md:px-16 lg:px-24 border-t border-white/5">
      
      <div className="w-full max-w-5xl flex flex-col flex-1 h-full">
        {/* Header Area */}
        <div className="format-header mb-12 flex flex-col items-start z-10 opacity-0 w-full">
          <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
            {formatSettings?.eyebrowText || 'EXPLORE BY FORMAT'}
          </span>

          <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1] mb-8">
            {formatSettings?.headingLine1 || 'Choose the form that'}<br />
            {formatSettings?.headingLine2 || 'meets you where you are.'}
          </h2>

          {/* Tabs (Only visible when a format is selected) */}
          {selectedFormat && (
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-1 mt-2 animate-in fade-in duration-500">
              <div className="flex items-center gap-8">
                {formats.map(f => ( 
                  <button 
                    key={f.id}
                    onClick={() => handleTabClick(f.id)}
                    className={`font-sans text-[0.7rem] uppercase tracking-widest font-semibold pb-2 border-b-2 -mb-[2px] transition-all duration-300 cursor-pointer
                      ${selectedFormat === f.id 
                        ? 'text-[#c79c6e] border-[#c79c6e]' 
                        : 'text-white/40 border-transparent hover:text-white/70'
                      }
                    `}
                  >
                    {f.title}
                  </button>
                ))} 
              </div>

              <button
                type="button"
                onClick={handleBackToOverview}
                className="inline-flex items-center gap-2 font-sans text-[0.68rem] uppercase tracking-[0.2em] font-medium text-white/50 hover:text-[#c79c6e] transition-colors pb-2 cursor-pointer group"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
              </button>
            </div>
          )}
        </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 relative">
        
        {/* OVERVIEW (Cards) */}
        {!selectedFormat && (
          <div 
            ref={cardsContainerRef} 
            className={`w-full grid ${formats.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-3'} gap-6`}
          >
            {formats.map((format) => (
              <div 
                key={format.id}
                className={`format-card relative w-full aspect-[4/5] px-8 py-8 pb-14 md:px-8 md:py-8 md:pb-16 rounded-md bg-[#050505]/60 backdrop-blur-md border flex flex-col items-center justify-center text-center transition-all duration-500 ease-out cursor-pointer z-10
                  ${hoveredFormat === format.id 
                    ? 'border-[#c79c6e]/80 shadow-[0_0_30px_rgba(199,156,110,0.15)] bg-black scale-[1.02]' 
                    : 'border-white/10 hover:border-white/20'
                  }
                `}
                onMouseEnter={() => setHoveredFormat(format.id)}
                onMouseLeave={() => setHoveredFormat(null)}
                onClick={() => handleFormatSelect(format.id)}
              >
                <format.icon 
                  size={32} 
                  weight="light" 
                  className={`mb-6 transition-colors duration-500 ${hoveredFormat === format.id ? 'text-[#c79c6e]' : 'text-white/70'}`} 
                />
                <h3 className="font-serif text-2xl text-white font-light tracking-wide mb-2">{format.title}</h3>
                <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-6">
                  {format.count}
                </span>
                
                <p className={`font-sans text-[0.7rem] font-light leading-relaxed whitespace-pre-line transition-colors duration-500 ${hoveredFormat === format.id ? 'text-white/90' : 'text-white/20'}`}>
                  {format.desc}
                </p>

                {/* Bottom Link (Appears on Hover) */}
                <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 overflow-hidden transition-all duration-500 ${hoveredFormat === format.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="flex items-center gap-2 text-[#c79c6e] whitespace-nowrap">
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">{format.action}</span>
                    <ArrowRight size={14} weight="bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DETAILED VIEW (The Videos/Articles) */}
        {selectedFormat && (
          <div ref={contentContainerRef} className="w-full relative pt-4">
            
            {/* LATEST TAB */}
            {selectedFormat === 'latest' && (
              <div className="flex flex-col h-full animate-in fade-in duration-500 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mb-12">
                  {latestItems.map((item, idx) => {
                    const isVideo = item.videoUrl !== undefined || item.isVideoItem;
                    const isArticle = !isVideo;
                    const isItemSaved = isVideo 
                      ? savedVideoIds.has(item._id || item.id) 
                      : savedArticleIds.has(item._id || item.id);
                    
                    return (
                    <div 
                      key={`latest-${idx}`} 
                      className="group cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1 relative"
                      onClick={() => {
                        if (isArticle) {
                          sessionStorage.setItem('library_scroll_position', window.scrollY.toString());
                          navigate(`/articles?article=${item.slug || item.id || item._id}&title=${encodeURIComponent(item.title)}`);
                        } else if (isVideo) {
                          handleVideoClick(item);
                        }
                      }}
                    >
                      <div className="w-full aspect-[16/10] bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden relative mb-4 transition-all duration-500 group-hover:border-[#c79c6e]/60 group-hover:shadow-[0_0_20px_rgba(199,156,110,0.15)]">
                        {item.featuredImage || item.image || item.thumbnailUrl ? (
                           <>
                             <img src={item.featuredImage || item.image || item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-85" />
                             <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                             {isVideo && (
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <PlayCircle size={40} weight="light" className="text-white/80 group-hover:text-[#c79c6e] group-hover:scale-110 transition-all duration-500" />
                               </div>
                             )}
                           </>
                        ) : (
                           <div className="absolute inset-0 bg-[#050505] flex items-center justify-center p-6 text-white/20 group-hover:text-[#c79c6e]/20 transition-colors">
                             {isArticle ? <BookOpen size={48} weight="thin" /> : <PlayCircle size={48} weight="thin" />}
                           </div>
                        )}

                        {/* Save / Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => isVideo ? handleToggleSaveVideo(item, e) : handleToggleSaveArticle(item, e)}
                          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black backdrop-blur-md border border-white/15 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:scale-110 active:scale-95 ${
                            isItemSaved 
                              ? 'text-[#c79c6e] border-[#c79c6e]/60 bg-black/90' 
                              : 'text-white/60 hover:text-white hover:border-white/40'
                          }`}
                          title={isItemSaved ? 'Saved in My Journey' : 'Save to My Journey'}
                        >
                          <BookmarkSimple size={16} weight={isItemSaved ? "fill" : "regular"} />
                        </button>
                      </div>
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-2 block">
                        {isArticle ? (item.categoryName || item.category || 'ARTICLE') : 'VIDEO'}
                      </span>
                      <h4 className="font-serif text-[1.3rem] text-white/90 font-light leading-snug group-hover:text-white transition-colors duration-300 pr-4">
                        {renderFormattedTitle(item.title)}
                      </h4>
                    </div>
                  )})}
                </div>
              </div>
            )}

            {/* WATCH TAB */}
            {selectedFormat === 'watch' && (
              <div className="flex flex-col h-full animate-in fade-in duration-500 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mb-12">
                  {displayVideos.map((video) => {
                    const isVideoSaved = savedVideoIds.has(video._id || video.id);
                    return (
                    <div 
                      key={video.id || video._id} 
                      className="group cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1 relative"
                      onClick={() => handleVideoClick(video)}
                    >
                      <div className="w-full aspect-[16/10] bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden relative mb-4 transition-all duration-500 group-hover:border-[#c79c6e]/60 group-hover:shadow-[0_0_20px_rgba(199,156,110,0.15)]">
                        <img 
                          src={video.image || video.thumbnailUrl} 
                          alt={video.title} 
                          className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle size={40} weight="light" className="text-white/80 group-hover:text-[#c79c6e] group-hover:scale-110 transition-all duration-500" />
                        </div>

                        {/* Save / Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleSaveVideo(video, e)}
                          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black backdrop-blur-md border border-white/15 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:scale-110 active:scale-95 ${
                            isVideoSaved 
                              ? 'text-[#c79c6e] border-[#c79c6e]/60 bg-black/90' 
                              : 'text-white/60 hover:text-white hover:border-white/40'
                          }`}
                          title={isVideoSaved ? 'Saved in My Journey' : 'Save to My Journey'}
                        >
                          <BookmarkSimple size={16} weight={isVideoSaved ? "fill" : "regular"} />
                        </button>
                      </div>
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-2 block">
                        VIDEO
                      </span>
                      <h4 className="font-serif text-[1.35rem] text-white/90 font-light leading-snug group-hover:text-white transition-colors duration-300 pr-4">
                        {renderFormattedTitle(video.title)}
                      </h4>
                    </div>
                  )})}
                </div>
              </div>
            )}

            {/* READ TAB */}
            {selectedFormat === 'read' && (
              <div className="flex flex-col h-full animate-in fade-in duration-500 pb-16">
                
                {/* 6 Category Sub-tabs Filter Row */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap mb-10 pb-4 border-b border-white/10">
                  {readCategoryTabs.map((cat) => {
                    const isCatActive = selectedCategoryTab === cat.id;
                    const catCount = cat.id === 'all' 
                      ? allReadArticles.length 
                      : allReadArticles.filter(a => 
                          (a.categoryId || '').toLowerCase() === cat.id.toLowerCase() ||
                          (a.categoryName || '').toLowerCase() === cat.title.toLowerCase() ||
                          (a.category || '').toLowerCase() === cat.title.toLowerCase()
                        ).length;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryTab(cat.id);
                          setVisibleArticleCount(6);
                        }}
                        className={`font-sans text-[0.65rem] sm:text-[0.68rem] uppercase tracking-widest font-semibold px-3.5 py-1.5 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                          isCatActive
                            ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/20 scale-[1.03]'
                            : 'bg-[#111] text-white/50 border border-white/5 hover:border-white/20 hover:text-white hover:bg-[#181818]'
                        }`}
                      >
                        <span>{cat.title}</span>
                        <span className={`text-[0.58rem] font-bold ${isCatActive ? 'text-black/80' : 'text-[#c79c6e]'}`}>
                          ({catCount})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mb-10">
                  {filteredReadArticles.slice(0, visibleArticleCount).map((item, idx) => {
                    const isArtSaved = savedArticleIds.has(item._id || item.id);
                    return (
                    <div 
                      key={item.id || item._id || item.slug || `read-${idx}`} 
                      className="group cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1 relative"
                      onClick={() => {
                        sessionStorage.setItem('library_scroll_position', window.scrollY.toString());
                        navigate(`/articles?article=${item.slug || item.id || item._id}&title=${encodeURIComponent(item.title)}`);
                      }}
                    >
                      <div className="w-full aspect-[16/10] bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden relative mb-4 transition-all duration-500 group-hover:border-[#c79c6e]/60 group-hover:shadow-[0_0_20px_rgba(199,156,110,0.15)]">
                        {item.featuredImage || item.image ? (
                          <img 
                            src={item.featuredImage || item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-85" 
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[#050505] flex items-center justify-center p-6 text-white/20 group-hover:text-[#c79c6e]/20 transition-colors">
                             <BookOpen size={48} weight="thin" />
                          </div>
                        )}

                        {/* Save / Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleSaveArticle(item, e)}
                          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black backdrop-blur-md border border-white/15 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:scale-110 active:scale-95 ${
                            isArtSaved 
                              ? 'text-[#c79c6e] border-[#c79c6e]/60 bg-black/90' 
                              : 'text-white/60 hover:text-white hover:border-white/40'
                          }`}
                          title={isArtSaved ? 'Saved in My Journey' : 'Save to My Journey'}
                        >
                          <BookmarkSimple size={16} weight={isArtSaved ? "fill" : "regular"} />
                        </button>
                      </div>
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-2 block">
                        {item.categoryName || item.category || 'ARTICLE'}
                      </span>
                      <h4 className="font-serif text-[1.3rem] text-white/90 font-light leading-snug group-hover:text-white transition-colors duration-300 pr-4">
                        {renderFormattedTitle(item.title)}
                      </h4>
                    </div>
                  )})}
                </div>

                {/* Show More Button */}
                {visibleArticleCount < filteredReadArticles.length && (
                  <div className="w-full flex justify-center pt-4 pb-8">
                    <button
                      type="button"
                      onClick={() => setVisibleArticleCount(prev => prev + 6)}
                      className="px-8 py-3 rounded-full border border-[#c79c6e]/40 hover:border-[#c79c6e] bg-[#c79c6e]/10 hover:bg-[#c79c6e] text-[#c79c6e] hover:text-black font-sans text-[0.68rem] uppercase tracking-[0.2em] font-semibold transition-all duration-300 cursor-pointer flex items-center gap-2.5 group shadow-lg shadow-black/50 hover:scale-105 active:scale-95"
                    >
                      <span>Show More Articles</span>
                      <ArrowDown size={14} weight="bold" className="group-hover:translate-y-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Modal Player */}
      {activeModalVideo && (
        <UniversalVideoModal
          video={activeModalVideo}
          onClose={() => setActiveModalVideo(null)}
        />
      )}

      </div>
    </section>
  );
}
