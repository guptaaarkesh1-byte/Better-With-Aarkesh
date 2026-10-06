import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import Icon from '../components/common/AdminIcons';
import AdminConfirmModal from '../components/common/AdminConfirmModal';
import AdminDrawer from '../components/common/AdminDrawer';
import AdminStickyBar from '../components/common/AdminStickyBar';
import AdminCourseStudents from './AdminCourseStudents';
import AdminCourseLandingCatalogEditor from './AdminCourseLandingCatalogEditor';
import AdminCourseComments from './AdminCourseComments';

import { API_URL } from '../utils/apiUrl';

const STEPS = [
  ['basics', 'layout', 'Basics', 'Title, description, status', 'Course page'],
  ['visuals', 'img', 'Card image & trailer', 'Thumbnail, theme, preview video', ''],
  ['pricing', 'rupee', 'Pricing & GST', 'What students pay', ''],
  ['landing', 'list', 'Landing page content', 'Roadmap, benefits, story', ''],
  ['lessons', 'video', 'Lessons & videos', 'What students watch after buying', 'Course content']
];

const inr = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

function srcInfo(v) {
  v = (v || '').trim();
  if (!v) return null;
  if (/(youtube\.com|youtu\.be)/.test(v) || /^[\w-]{11}$/.test(v)) return { t: 'YouTube', ok: true };
  if (/stream\.mux\.com/.test(v) || /^[A-Za-z0-9]{20,}$/.test(v)) return { t: 'Mux', ok: true };
  return { t: 'Not recognised', ok: false };
}

export default function AdminCourseEditor() {
  const { showSuccess, showError, showInfo } = useToast();
  const [subTab, setSubTab] = useState('editor'); // 'editor' | 'students' | 'faq'
  const [coursesList, setCoursesList] = useState([]);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState('better-man');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [step, setStep] = useState('basics');

  // Create New Course Modal State
  const [createCourseModalOpen, setCreateCourseModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSlug, setNewCourseSlug] = useState('');

  // Course Form State
  const [courseData, setCourseData] = useState({
    title: 'The Better Man',
    seq: '01',
    lede: 'Master the psychology of calm authority, magnetic communication and effortless self-command.',
    tags: ['Leadership', 'Mastery'],
    hl: [['Real-World Transformation', '(Not Just Theory)'], ['3 Private Sessions', 'with Aarkesh']],
    price: 4999,
    orig: 9999,
    cta: 'Check Course',
    gst: true,
    rate: 18,
    mode: 'included',
    theme: 'whi',
    thumb: '',
    thumbName: '',
    trailer: '',
    live: true,
    road: {
      title: 'Six Modules To Complete Breakthrough',
      sub: 'A structured roadmap designed to shift how you communicate, decide, and execute.',
      mods: [
        { t: 'The Foundation of Clarity', d: 'Dismantling mental fog, identifying core blockers, and establishing primary focus.' },
        { t: 'Emotional Composure Under Pressure', d: 'Conditioning your nervous system to stay steady, sharp, and deliberate.' },
        { t: 'Strategic Execution & Momentum', d: 'Turning vision into daily disciplined action without friction or burnout.' }
      ]
    },
    inside: [
      '6 HD video modules & actionable frameworks',
      'Downloadable workbooks & mental models',
      '3 private 1-on-1 coaching sessions with Aarkesh',
      'Lifetime access with all future updates'
    ],
    story: {
      pill: 'CORE METHODOLOGY',
      h: 'Why The Better Man Changes Everything',
      hook: 'True sovereignty is not accidental. It is the deliberate result of structured principles and consistent execution.',
      p1: 'Most people struggle not from lack of ambition, but from emotional friction and absence of a clear behavioral framework.',
      quote: 'Clarity creates courage. Courage creates momentum.',
      p2: 'Through step-by-step masterclasses, you dismantle reactive habits and install elite mental models that last a lifetime.',
      take: 'Reactive individuals wait for circumstances to change. Anchored leaders change their internal state first.'
    },
    days: [
      {
        id: 'd1',
        t: 'Module 01: The Foundation of Clarity',
        open: true,
        lessons: [{ id: 'l1', t: 'Lesson 1: The Foundation of Clarity', desc: '', dur: '12:30', free: true, src: null }]
      }
    ]
  });

  // Accordion state for Landing Page step
  const [acc, setAcc] = useState({ road: true, inside: false, story: false });

  // Lessons Search & Filter
  const [lessonQuery, setLessonQuery] = useState('');
  const [lessonFilter, setLessonFilter] = useState('all'); // 'all' | 'novid' | 'free'

  // Lesson Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLessonInfo, setDrawerLessonInfo] = useState(null); // { di, li, form, type, file, isUploading }

  // Confirm Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: true });

  // Trailer Mux Upload State
  const [trailerVideoStatus, setTrailerVideoStatus] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'ready' | 'errored'
  const [trailerUploadProgress, setTrailerUploadProgress] = useState(0);
  const [trailerUploadError, setTrailerUploadError] = useState('');
  const trailerFileInputRef = useRef(null);
  const trailerPollingRef = useRef(null);

  // Lesson Video Mux Upload State
  const [lessonVideoStatus, setLessonVideoStatus] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'ready' | 'errored'
  const [lessonUploadProgress, setLessonUploadProgress] = useState(0);
  const [lessonUploadError, setLessonUploadError] = useState('');
  const lessonFileInputRef = useRef(null);
  const lessonPollingRef = useRef(null);

  // Landing Page Overview Settings (e.g. Show/Hide "View All Masterclasses" Button)
  const [landingSettings, setLandingSettings] = useState({
    showViewAllBtn: true,
    viewAllBtnText: 'View All Masterclasses',
    viewAllBtnLink: '/course/all'
  });

  useEffect(() => {
    return () => {
      if (trailerPollingRef.current) clearInterval(trailerPollingRef.current);
      if (lessonPollingRef.current) clearInterval(lessonPollingRef.current);
    };
  }, []);

  const startTrailerPolling = (identifier) => {
    if (!identifier) return;
    if (trailerPollingRef.current) clearInterval(trailerPollingRef.current);

    trailerPollingRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_URL}/api/admin/courses/mux/asset-status/${identifier}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ready' && data.playbackId) {
            setTrailerVideoStatus('ready');
            updateField('trailer', data.playbackId);
            clearInterval(trailerPollingRef.current);
            showSuccess('Mux trailer video processed & ready for streaming!');
          } else if (data.status === 'errored') {
            setTrailerVideoStatus('errored');
            setTrailerUploadError('Mux video encoding failed.');
            clearInterval(trailerPollingRef.current);
            showError('Mux video processing failed.');
          } else {
            setTrailerVideoStatus('processing');
          }
        }
      } catch (err) {
        console.error('Trailer polling error:', err);
      }
    }, 3500);
  };

  const handleTrailerMuxUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showError('Please select a valid video file (MP4, MOV, WebM, MKV)');
      return;
    }

    try {
      setTrailerVideoStatus('uploading');
      setTrailerUploadProgress(0);
      setTrailerUploadError('');
      const token = localStorage.getItem('adminToken');

      // 1. Get Direct Upload URL from Mux via backend
      const res = await fetch(`${API_URL}/api/admin/courses/mux/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to request Mux upload URL.');
      }

      const { uploadUrl, uploadId } = await res.json();

      // 2. Direct upload file to Mux with live % progress
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setTrailerUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setTrailerUploadProgress(100);
          setTrailerVideoStatus('processing');
          showSuccess('Video uploaded to Mux! Encoding stream...');
          startTrailerPolling(uploadId);
        } else {
          setTrailerVideoStatus('errored');
          setTrailerUploadError(`Upload failed with status ${xhr.status}`);
          showError(`Upload failed with status ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        setTrailerVideoStatus('errored');
        setTrailerUploadError('Network error during video upload. Please check connection.');
        showError('Network error during video upload');
      };

      xhr.send(file);
    } catch (err) {
      console.error('Trailer Mux upload error:', err);
      setTrailerVideoStatus('errored');
      setTrailerUploadError(err.message || 'Failed to initialize Mux upload.');
      showError(err.message || 'Failed to initialize Mux upload.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const startLessonPolling = (identifier, fileName, targetDi, targetLi) => {
    if (!identifier) return;
    if (lessonPollingRef.current) clearInterval(lessonPollingRef.current);

    lessonPollingRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_URL}/api/admin/courses/mux/asset-status/${identifier}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ready' && data.playbackId) {
            setLessonVideoStatus('ready');
            const readySrc = {
              type: 'mux',
              val: data.playbackId,
              playbackId: data.playbackId,
              assetId: data.assetId,
              fileName: fileName || 'Uploaded Video',
              status: 'ready'
            };

            // Update Drawer
            setDrawerLessonInfo(prev => {
              if (!prev) return prev;
              if (prev.di === targetDi && prev.li === targetLi) {
                return {
                  ...prev,
                  val: data.playbackId,
                  file: fileName || 'Uploaded Video',
                  src: readySrc,
                  remove: false
                };
              }
              return prev;
            });

            // Update CourseData Directly
            if (targetDi !== undefined && targetLi !== undefined) {
              setCourseData(prev => {
                const copy = JSON.parse(JSON.stringify(prev));
                if (copy.days?.[targetDi]?.lessons?.[targetLi]) {
                  copy.days[targetDi].lessons[targetLi].src = readySrc;
                  if (data.durationFormatted && (!copy.days[targetDi].lessons[targetLi].dur || copy.days[targetDi].lessons[targetLi].dur === '12:30')) {
                    copy.days[targetDi].lessons[targetLi].dur = data.durationFormatted;
                  }
                }
                return copy;
              });
              setDirty(true);
            }

            clearInterval(lessonPollingRef.current);
            showSuccess('Lesson video processed & ready for streaming!');
          } else if (data.status === 'errored') {
            setLessonVideoStatus('errored');
            setLessonUploadError('Video encoding failed on server.');
            clearInterval(lessonPollingRef.current);
            showError('Lesson video processing failed.');
          } else {
            setLessonVideoStatus('processing');
          }
        }
      } catch (err) {
        console.error('Lesson polling error:', err);
      }
    }, 3000);
  };

  const handleLessonFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(file.name);
    if (!isVideo) {
      showError('Please select a valid video file (MP4, MOV, WebM, MKV)');
      return;
    }

    const curDi = drawerLessonInfo?.di;
    const curLi = drawerLessonInfo?.li;

    // Auto-detect duration from video file
    try {
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoEl.src);
        const durationSec = Math.round(videoEl.duration || 0);
        if (durationSec > 0) {
          const mins = Math.floor(durationSec / 60);
          const secs = durationSec % 60;
          const durFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
          setDrawerLessonInfo(prev => prev ? ({ ...prev, dur: durFormatted }) : prev);
          if (curDi !== undefined && curLi !== undefined) {
            setCourseData(prev => {
              const copy = JSON.parse(JSON.stringify(prev));
              if (copy.days?.[curDi]?.lessons?.[curLi]) {
                copy.days[curDi].lessons[curLi].dur = durFormatted;
              }
              return copy;
            });
          }
        }
      };
      videoEl.src = URL.createObjectURL(file);
    } catch (err) {
      console.warn('Could not read video metadata:', err);
    }

    try {
      setLessonVideoStatus('uploading');
      setLessonUploadProgress(0);
      setLessonUploadError('');
      const token = localStorage.getItem('adminToken');

      // 1. Get Direct Upload URL from Mux via backend
      const res = await fetch(`${API_URL}/api/admin/courses/mux/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to request Mux upload URL.');
      }

      const { uploadUrl, uploadId } = await res.json();

      // 2. Direct upload file to Mux with live % progress
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setLessonUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setLessonUploadProgress(100);
          setLessonVideoStatus('processing');
          showSuccess('Video uploaded! Encoding stream with Mux...');

          const processingSrc = {
            type: 'mux',
            val: uploadId,
            uploadId,
            fileName: file.name,
            status: 'processing'
          };

          setDrawerLessonInfo(prev => prev ? ({
            ...prev,
            val: uploadId,
            file: file.name,
            src: processingSrc,
            remove: false
          }) : prev);

          if (curDi !== undefined && curLi !== undefined) {
            setCourseData(prev => {
              const copy = JSON.parse(JSON.stringify(prev));
              if (copy.days?.[curDi]?.lessons?.[curLi]) {
                copy.days[curDi].lessons[curLi].src = processingSrc;
              }
              return copy;
            });
            setDirty(true);
          }

          startLessonPolling(uploadId, file.name, curDi, curLi);
        } else {
          setLessonVideoStatus('errored');
          setLessonUploadError(`Upload failed with status ${xhr.status}`);
          showError(`Upload failed with status ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        setLessonVideoStatus('errored');
        setLessonUploadError('Network error during video upload. Please check connection.');
        showError('Network error during video upload');
      };

      xhr.send(file);
    } catch (err) {
      console.error('Lesson video upload error:', err);
      setLessonVideoStatus('errored');
      setLessonUploadError(err.message || 'Failed to initialize video upload.');
      showError(err.message || 'Failed to initialize video upload.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Fetch course list & selected course details
  const fetchCoursesAndData = useCallback(async (slugToLoad) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch all courses from both /api/admin/courses and /api/courses/details-settings
      const [coursesRes, allDetailsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/courses`, { headers }),
        fetch(`${API_URL}/api/courses/details-settings`, { headers })
      ]);

      let dbCourses = [];
      if (coursesRes.ok) {
        dbCourses = await coursesRes.json();
      }

      let allDetailsMap = {};
      if (allDetailsRes.ok) {
        allDetailsMap = await allDetailsRes.json();
      }

      // Normalize slug helper to merge duplicates like the-better-man vs better-man
      const normalizeSlug = (s, title = '') => {
        let clean = (s || '').toString().trim().toLowerCase();
        let cleanTitle = (title || '').toString().trim().toLowerCase().replace(/™|®/g, '').trim();

        if (
          clean === 'the-better-man' ||
          clean === 'betterman' ||
          clean === 'better-man' ||
          clean === 'better-man™' ||
          cleanTitle === 'the better man' ||
          cleanTitle === 'better man'
        ) {
          return 'better-man';
        }
        if (cleanTitle === 'difficult people' || clean === 'difficult-people') {
          return 'difficult-people';
        }
        if (cleanTitle === 'decisions' || clean === 'decisions') {
          return 'decisions';
        }
        return clean;
      };

      // Build unified courses list
      const combinedMap = new Map();

      // 1. Add DB courses
      dbCourses.forEach(c => {
        const slugKey = normalizeSlug(c.slug || c._id, c.title);
        if (slugKey) {
          const isLive = c.isPublished ?? true;
          combinedMap.set(slugKey, {
            _id: c._id,
            slug: slugKey,
            title: slugKey === 'better-man' ? 'The Better Man' : (c.title || slugKey),
            status: isLive ? 'live' : 'draft'
          });
        }
      });

      // 2. Add all details map courses (merge / overwrite)
      Object.entries(allDetailsMap).forEach(([slug, val]) => {
        const slugKey = normalizeSlug(slug, val?.title || val?.heroSection?.title);
        const existing = combinedMap.get(slugKey);
        const isLive = val?.live !== undefined ? val.live : (val?.isPublished !== undefined ? val.isPublished : !val?.soon);
        const isSoon = val?.soon === true;
        const status = isLive ? 'live' : (isSoon ? 'soon' : 'draft');

        combinedMap.set(slugKey, {
          _id: existing?._id || slugKey,
          slug: slugKey,
          title: slugKey === 'better-man' ? 'The Better Man' : (val?.title || val?.heroSection?.title || existing?.title || slugKey),
          status
        });
      });

      // If still empty, ensure better-man is present
      if (!combinedMap.has('better-man')) combinedMap.set('better-man', { _id: 'better-man', slug: 'better-man', title: 'The Better Man', status: 'live' });

      const loadedCoursesList = Array.from(combinedMap.values());
      setCoursesList(loadedCoursesList);

      // 2. Determine target slug
      const targetSlug = slugToLoad || (loadedCoursesList[0]?.slug) || 'better-man';
      setSelectedCourseSlug(targetSlug);

      // 3. Fetch course details for target slug
      let d = allDetailsMap[targetSlug] || {};
      const detailRes = await fetch(`${API_URL}/api/courses/details-settings/${targetSlug}`, { headers });
      if (detailRes.ok) {
        d = await detailRes.json();
      }

      const matchedCourse = dbCourses.find(c => (c.slug || c._id) === targetSlug || String(c._id) === String(targetSlug));
      let loadedDays = [];

      if (d.days && Array.isArray(d.days) && d.days.length > 0) {
        loadedDays = d.days;
      } else if (matchedCourse?._id) {
        const curRes = await fetch(`${API_URL}/api/admin/courses/${matchedCourse._id}`, { headers });
        if (curRes.ok) {
          const curData = await curRes.json();
          if (curData.modules && curData.modules.length > 0) {
            loadedDays = curData.modules.map((m, mIdx) => ({
              id: m._id || `d${mIdx + 1}`,
              t: m.title || `Module ${String(mIdx + 1).padStart(2, '0')}`,
              open: true,
              lessons: (curData.lessons || [])
                .filter(l => String(l.moduleId) === String(m._id))
                .map((l, lIdx) => ({
                  id: l._id || `l${lIdx + 1}`,
                  t: l.title || `Lesson ${lIdx + 1}`,
                  desc: l.description || '',
                  dur: l.duration || '12:30',
                  free: !!l.isFreePreview,
                  src: l.muxPlaybackId
                    ? { type: 'mux', val: l.muxPlaybackId }
                    : l.youtubeUrl || l.youtubeVideoId
                    ? { type: 'youtube', val: l.youtubeUrl || l.youtubeVideoId }
                    : l.videoUrl
                    ? { type: 'mp4', val: l.videoUrl }
                    : null
                }))
            }));
          }
        }
      }

      // Parse syllabus if present
      if (!loadedDays.length && d.syllabus && Array.isArray(d.syllabus)) {
        loadedDays = d.syllabus.map((s, idx) => ({
          id: `d_${idx + 1}`,
          t: `Module ${s.n || String(idx + 1).padStart(2, '0')}: ${s.t}`,
          open: true,
          lessons: [
            {
              id: `l_${idx + 1}`,
              t: `Lesson 1: ${s.t}`,
              desc: s.d || '',
              dur: '12:30',
              free: idx === 0,
              src: null
            }
          ]
        }));
      }

      // Clean numeric prices
      const parsePriceNum = (val, fallback) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const num = Number(val.replace(/[^\d.]/g, ''));
          return !isNaN(num) && num > 0 ? num : fallback;
        }
        return fallback;
      };

      setCourseData(prev => ({
        ...prev,
        title: d.heroSection?.title || d.title || matchedCourse?.title || targetSlug,
        seq: d.heroSection?.cardSequence || d.n || '01',
        lede: d.heroSection?.subtitle || d.lede || d.d || matchedCourse?.description || 'Master the psychology and strategies to elevate your sovereignty and leadership.',
        tags: d.heroSection?.cardTags || d.chips || ['Leadership', 'Mastery'],
        hl: d.pricingSection?.highlights || d.hl || prev.hl,
        price: parsePriceNum(d.pricingSection?.currentPrice ?? d.price, 4999),
        orig: parsePriceNum(d.pricingSection?.originalPrice ?? d.was, 9999),
        cta: d.pricingSection?.ctaText || d.cta || 'Check Course',
        gst: d.pricingSection?.enableGst ?? d.enableGst ?? true,
        rate: d.pricingSection?.gstRate ?? d.gstRate ?? 18,
        mode: d.pricingSection?.gstMode || (d.isGstIncluded ? 'included' : 'exclusive'),
        theme: d.heroSection?.cardTheme || (d.cls === 'v2' ? 'roy' : d.cls === 'v3' ? 'obs' : 'whi'),
        thumb: d.heroSection?.cardThumbnail || d.imageUrl || matchedCourse?.thumbnailUrl || '',
        thumbName: '',
        trailer: d.heroSection?.trailerVideo || matchedCourse?.trailerVideoUrl || '',
        live: d.live !== undefined ? d.live : (matchedCourse ? (matchedCourse.isPublished ?? true) : !d.soon),
        soon: d.soon === true,
        road: {
          title: d.storyRoadmapSection?.roadmapTitle || d.syllabusTitle || 'Step-By-Step Roadmap',
          sub: d.storyRoadmapSection?.roadmapSubtitle || d.syllabusSubtitle || 'A structured breakdown of core principles and actionable tools.',
          mods: d.storyRoadmapSection?.roadmapModules?.length
            ? d.storyRoadmapSection.roadmapModules
            : (d.syllabus && Array.isArray(d.syllabus))
            ? d.syllabus.map(s => ({ t: s.t, d: s.d || '' }))
            : prev.road.mods
        },
        inside: d.pricingSection?.insideChecklist?.length ? d.pricingSection.insideChecklist : d.inside || prev.inside,
        story: {
          pill: d.storyRoadmapSection?.storyPill || d.writeup?.chip || 'CORE METHODOLOGY',
          h: d.storyRoadmapSection?.storyHeading || d.writeup?.h1 || `Why ${d.title || targetSlug} Changes Everything`,
          hook: d.storyRoadmapSection?.storyHook || d.writeup?.lede || 'True sovereignty is the deliberate result of structured principles.',
          p1: d.storyRoadmapSection?.storyP1 || d.writeup?.p1 || 'Most people struggle not from lack of ambition, but from emotional friction.',
          quote: d.storyRoadmapSection?.storyQuote || d.writeup?.quote || 'Clarity creates courage. Courage creates momentum.',
          p2: d.storyRoadmapSection?.storyP2 || d.writeup?.p2 || 'Through step-by-step masterclasses, you dismantle reactive habits.',
          take: d.storyRoadmapSection?.storyTakeaway || d.writeup?.distinction || 'Reactive leaders wait for circumstances. Anchored leaders change internal state first.'
        },
        days: loadedDays.length ? loadedDays : prev.days
      }));

      // Fetch Landing Overview Settings
      try {
        const lRes = await fetch(`${API_URL}/api/courses/landing-settings`);
        if (lRes.ok) {
          const lData = await lRes.json();
          if (lData?.moreCourses) {
            setLandingSettings({
              showViewAllBtn: lData.moreCourses.showViewAllBtn !== false,
              viewAllBtnText: lData.moreCourses.viewAllBtnText || 'View All Masterclasses',
              viewAllBtnLink: lData.moreCourses.viewAllBtnLink || '/course/all'
            });
          }
        }
      } catch (e) {
        console.warn('Failed to load landing settings:', e);
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoading(false);
      setDirty(false);
    }
  }, []);

  useEffect(() => {
    fetchCoursesAndData();
  }, [fetchCoursesAndData]);

  // Sync selected course status and title with dropdown list in real-time
  useEffect(() => {
    const currentStatus = courseData.live ? 'live' : (courseData.soon ? 'soon' : 'draft');
    setCoursesList(prev => prev.map(c => {
      if (c.slug === selectedCourseSlug) {
        return { ...c, status: currentStatus, title: courseData.title || c.title };
      }
      return c;
    }));
  }, [courseData.live, courseData.soon, courseData.title, selectedCourseSlug]);

  // Create New Course
  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) {
      showError('Please enter a course title');
      return;
    }
    const slug = (newCourseSlug || newCourseTitle).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) {
      showError('Invalid course URL slug');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

      const newCoursePayload = {
        title: newCourseTitle.trim(),
        n: String(coursesList.length + 1).padStart(2, '0'),
        slug,
        lede: 'Master the psychology and strategies to elevate your sovereignty and leadership.',
        chips: ['Mastery', 'Leadership'],
        hl: [['Real-World Practical Frameworks', '(Not Just Theory)'], ['3 Private Sessions', 'with Aarkesh']],
        inside: ['HD video modules & frameworks', 'Downloadable workbooks', '3 private 1-on-1 sessions', 'Lifetime access'],
        price: 4999,
        orig: 9999,
        enableGst: true,
        gstRate: 18,
        isGstIncluded: false,
        cta: 'Check Course',
        soon: false,
        syllabusTitle: 'Complete Step-By-Step Roadmap',
        syllabusSubtitle: 'A structured breakdown of core principles and actionable tools.',
        syllabus: [
          { n: '01', t: 'The Foundation of Clarity', d: 'Establishing primary baseline focus and eliminating fog.' },
          { n: '02', t: 'Emotional Composure Under Pressure', d: 'Conditioning your nervous system to stay steady.' },
          { n: '03', t: 'Strategic Execution & Momentum', d: 'Turning vision into daily disciplined action.' }
        ],
        writeup: {
          chip: 'CORE METHODOLOGY',
          h1: `Why ${newCourseTitle.trim()} Changes Everything`,
          lede: 'True sovereignty is the deliberate result of structured principles.',
          p1: 'Most people struggle not from lack of ambition, but from emotional friction.',
          quote: 'Clarity creates courage. Courage creates momentum.',
          p2: 'Through step-by-step masterclasses, you dismantle reactive habits.',
          distinction: 'Reactive leaders wait for circumstances. Anchored leaders change internal state first.'
        }
      };

      const res = await fetch(`${API_URL}/api/courses/details-settings/${slug}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(newCoursePayload)
      });

      if (!res.ok) throw new Error('Failed to create new course');
      showSuccess(`Course "${newCourseTitle}" created successfully!`);
      setCreateCourseModalOpen(false);
      setNewCourseTitle('');
      setNewCourseSlug('');
      fetchCoursesAndData(slug);
    } catch (err) {
      showError('Error creating course. Please try again.');
    }
  };

  // Delete Current Course
  const handleDeleteCurrentCourse = () => {
    if (coursesList.length <= 1) {
      showError('You must keep at least one course.');
      return;
    }

    const currentSlug = selectedCourseSlug;
    const currentTitle = courseData.title || currentSlug;

    setModalConfig({
      isOpen: true,
      title: `Delete course "${currentTitle}"?`,
      message: `Are you sure you want to permanently delete "${currentTitle}" (${currentSlug})? All landing page content, syllabus, lessons, and settings for this course will be permanently removed.`,
      confirmText: 'Delete Course',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('adminToken');
          const headers = { Authorization: `Bearer ${token}` };

          // 1. Delete from Settings collection
          await fetch(`${API_URL}/api/courses/details-settings/${currentSlug}`, {
            method: 'DELETE',
            headers
          }).catch(() => {});

          // 2. Also delete from MongoDB Course collection
          const currentCourseObj = coursesList.find(c => c.slug === currentSlug);
          if (currentCourseObj?._id && currentCourseObj._id !== currentSlug) {
            await fetch(`${API_URL}/api/admin/courses/${currentCourseObj._id}`, {
              method: 'DELETE',
              headers
            }).catch(() => {});
          }

          showSuccess(`Course "${currentTitle}" deleted.`);
          setModalConfig({ isOpen: false });

          // Immediate local state update
          const remaining = coursesList.filter(c => c.slug !== currentSlug);
          setCoursesList(remaining);

          const nextSlug = remaining[0]?.slug || 'better-man';
          setSelectedCourseSlug(nextSlug);
          fetchCoursesAndData(nextSlug);
        } catch (err) {
          showError('Error deleting course.');
        }
      },
      onCancel: () => setModalConfig({ isOpen: false })
    });
  };

  // Handle Save
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

      // 1. Save Landing & Detail settings
      const payload = {
        title: courseData.title,
        lede: courseData.lede,
        d: courseData.lede,
        chips: courseData.tags,
        price: inr(courseData.price),
        was: courseData.orig ? inr(courseData.orig) : undefined,
        rawPrice: Number(courseData.price) || 0,
        rawWas: Number(courseData.orig) || 0,
        enableGst: Boolean(courseData.gst),
        gstRate: Number(courseData.rate) || 0,
        isGstIncluded: courseData.mode === 'included',
        gstMode: courseData.mode,
        cta: courseData.cta,
        hl: courseData.hl,
        inside: courseData.inside,
        imageUrl: courseData.thumb,
        thumbnailUrl: courseData.thumb,
        trailer: courseData.trailer,
        trailerVideo: courseData.trailer,
        trailerVideoUrl: courseData.trailer,
        trailerMuxPlaybackId: courseData.trailer,
        soon: !courseData.live,
        hidden: !courseData.live,
        isPublished: courseData.live,
        live: courseData.live,
        theme: courseData.theme,
        cardTheme: courseData.theme,
        cls: courseData.theme === 'roy' ? 'v2' : courseData.theme === 'obs' ? 'v3' : '',
        days: courseData.days,
        heroSection: {
          title: courseData.title,
          cardSequence: courseData.seq,
          subtitle: courseData.lede,
          cardTags: courseData.tags,
          cardTheme: courseData.theme,
          cardThumbnail: courseData.thumb,
          trailerVideo: courseData.trailer
        },
        pricingSection: {
          currentPrice: Number(courseData.price) || 0,
          originalPrice: Number(courseData.orig) || 0,
          ctaText: courseData.cta,
          enableGst: Boolean(courseData.gst),
          gstRate: Number(courseData.rate) || 0,
          gstMode: courseData.mode,
          highlights: courseData.hl,
          insideChecklist: courseData.inside
        },
        storyRoadmapSection: {
          roadmapTitle: courseData.road.title,
          roadmapSubtitle: courseData.road.sub,
          roadmapModules: courseData.road.mods,
          storyPill: courseData.story.pill,
          storyHeading: courseData.story.h,
          storyHook: courseData.story.hook,
          storyP1: courseData.story.p1,
          storyQuote: courseData.story.quote,
          storyP2: courseData.story.p2,
          storyTakeaway: courseData.story.take
        }
      };

      const res = await fetch(`${API_URL}/api/courses/details-settings/${selectedCourseSlug}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update course details');

      // 2. Save landing overview settings (including View All Masterclasses button visibility)
      try {
        await fetch(`${API_URL}/api/courses/landing-settings`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            moreCourses: {
              showViewAllBtn: landingSettings.showViewAllBtn,
              viewAllBtnText: landingSettings.viewAllBtnText || 'View All Masterclasses',
              viewAllBtnLink: landingSettings.viewAllBtnLink || '/course/all'
            }
          })
        });
      } catch (e) {
        console.warn('Failed to save landing settings:', e);
      }

      setDirty(false);
      showSuccess('All course changes saved successfully!');
    } catch (err) {
      console.error('Save error:', err);
      showError('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty) handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dirty, courseData]);

  // Calculations
  const calc = () => {
    const p = Number(courseData.price) || 0;
    const r = courseData.gst ? (Number(courseData.rate) || 0) / 100 : 0;
    if (!courseData.gst) return { base: p, gst: 0, total: p };
    if (courseData.mode === 'included') {
      const b = Math.round(p / (1 + r));
      return { base: b, gst: p - b, total: p };
    }
    const g = Math.round(p * r);
    return { base: p, gst: g, total: p + g };
  };

  const allLessons = courseData.days.flatMap(d => d.lessons);
  const readyLessonsCount = allLessons.filter(l => l.src).length;

  const checks = [
    { k: 'title', l: 'Title & short description', ok: !!(courseData.title.trim() && courseData.lede.trim()), step: 'basics' },
    { k: 'thumb', l: 'Card thumbnail image', ok: !!courseData.thumb, step: 'visuals' },
    { k: 'price', l: 'Price', ok: Number(courseData.price) > 0, step: 'pricing' },
    { k: 'road', l: 'Landing page content', ok: courseData.road.mods.length > 0 && !!courseData.story.h.trim(), step: 'landing' },
    { k: 'vid', l: `Videos attached (${readyLessonsCount}/${allLessons.length})`, ok: allLessons.length > 0 && readyLessonsCount === allLessons.length, step: 'lessons' },
    { k: 'trailer', l: 'Trailer video', ok: !!(courseData.trailer && srcInfo(courseData.trailer)?.ok), step: 'visuals', opt: true }
  ];

  const requiredChecks = checks.filter(c => !c.opt);
  const completedCount = requiredChecks.filter(c => c.ok).length;
  const issues = requiredChecks.filter(c => !c.ok);

  const courseStatus = courseData.live ? 'live' : (courseData.soon ? 'soon' : 'draft');

  const handleStatusChange = (newStatus) => {
    if (newStatus === courseStatus) return;

    if (newStatus === 'live') {
      if (issues.length > 0) {
        setModalConfig({
          isOpen: true,
          title: `Go live with ${issues.length} item${issues.length > 1 ? 's' : ''} unfinished?`,
          message: 'Students will be able to see and buy this course while these items are missing:',
          children: (
            <ul style={{ paddingLeft: '20px', margin: '8px 0 16px', color: '#5b4d43' }}>
              {issues.map((it, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{it.l}</li>
              ))}
            </ul>
          ),
          confirmText: 'Go live anyway',
          cancelText: 'Fix these first',
          isDanger: true,
          onConfirm: () => {
            setCourseData(prev => ({ ...prev, live: true, soon: false, hidden: false }));
            setDirty(true);
            setModalConfig({ isOpen: false });
            showSuccess('Course is now Live & Public');
          },
          onCancel: () => {
            setModalConfig({ isOpen: false });
            setStep(issues[0].step);
          }
        });
        return;
      }
      setCourseData(prev => ({ ...prev, live: true, soon: false, hidden: false }));
      setDirty(true);
      showSuccess('Course is now Live & Public');
    } else if (newStatus === 'soon') {
      setCourseData(prev => ({ ...prev, live: false, soon: true, hidden: false }));
      setDirty(true);
      showSuccess('Course is marked as Coming Soon');
    } else {
      setCourseData(prev => ({ ...prev, live: false, soon: false, hidden: true }));
      setDirty(true);
      showSuccess('Course moved to Draft (Hidden from catalog)');
    }
  };

  // Helper for input updates
  const updateField = (path, val) => {
    setCourseData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      const last = keys.pop();
      let target = copy;
      keys.forEach(k => {
        target = target[k];
      });
      target[last] = val;
      return copy;
    });
    setDirty(true);
  };

  // Array movers
  const moveItem = (arr, i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    const res = [...arr];
    [res[i], res[j]] = [res[j], res[i]];
    return res;
  };

  // Thumbnail upload
  const fileInputRef = useRef(null);
  const handleThumbUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.type)) {
      showError('Please choose a JPG, PNG or WebP image');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showError('Image is larger than 15 MB');
      return;
    }

    try {
      showInfo('Uploading image...');
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const uploadedUrl = data.url || data.imageUrl || data.filePath;
      if (uploadedUrl) {
        updateField('thumb', uploadedUrl);
        updateField('thumbName', file.name);
        showSuccess('Thumbnail uploaded successfully');
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (err) {
      console.error('Image upload failed, falling back to local preview:', err);
      const reader = new FileReader();
      reader.onload = () => {
        updateField('thumb', reader.result);
        updateField('thumbName', file.name);
        showSuccess('Thumbnail loaded');
      };
      reader.readAsDataURL(file);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Open Lesson Drawer
  const openLessonDrawer = (di, li, focus = 'title') => {
    const l = courseData.days[di]?.lessons?.[li];
    if (!l) return;
    setLessonVideoStatus(l.src?.val ? 'ready' : 'idle');
    setLessonUploadProgress(0);
    setLessonUploadError('');
    setDrawerLessonInfo({
      di,
      li,
      focus,
      t: l.t,
      desc: l.desc || '',
      dur: l.dur || '12:30',
      src: l.src || null,
      val: l.src?.val || '',
      file: l.src?.fileName || (l.src?.type === 'mp4' ? l.src.val : ''),
      remove: false
    });
    setDrawerOpen(true);

    if (focus === 'video') {
      setTimeout(() => {
        lessonFileInputRef.current?.click();
      }, 150);
    }
  };

  // Fix Issue Action
  const handleFixIssue = (issue) => {
    const target = issue || issues[0];
    if (!target) return;

    setStep(target.step);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (target.k === 'vid') {
      let found = false;
      for (let di = 0; di < courseData.days.length; di++) {
        const d = courseData.days[di];
        for (let li = 0; li < (d.lessons || []).length; li++) {
          if (!d.lessons[li].src) {
            openLessonDrawer(di, li, 'video');
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found && courseData.days.length > 0 && courseData.days[0].lessons?.length > 0) {
        openLessonDrawer(0, 0, 'video');
      }
    } else if (target.k === 'thumb') {
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 150);
    } else if (target.k === 'road') {
      setAcc(prev => ({ ...prev, road: true }));
    }
  };

  // Save Lesson from Drawer
  const saveLessonFromDrawer = () => {
    if (!drawerLessonInfo) return;
    const { di, li, t, desc, dur, val, file, src: currentSrc, remove } = drawerLessonInfo;
    const title = (t || '').trim();
    const duration = (dur || '').trim();

    if (!title) {
      showError('Lesson title is required');
      return;
    }
    if (duration && !/^\d{1,3}:[0-5]\d(:[0-5]\d)?$/.test(duration)) {
      showError('Please enter duration in mm:ss format (e.g. 12:30)');
      return;
    }

    let src = null;
    if (!remove) {
      if (currentSrc && (currentSrc.val || currentSrc.uploadId || currentSrc.playbackId)) {
        src = currentSrc;
      } else if (val && val.trim()) {
        src = { type: 'mux', val: val.trim(), fileName: file || 'Lesson Video', status: 'ready' };
      }
    }

    setCourseData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (copy.days?.[di]?.lessons?.[li]) {
        const target = copy.days[di].lessons[li];
        target.t = title;
        target.desc = desc || '';
        target.dur = duration || target.dur || '12:30';
        target.src = src;
      }
      return copy;
    });

    setDirty(true);
    setDrawerOpen(false);
    setDrawerLessonInfo(null);
    showSuccess('Lesson updated successfully');
  };

  const calculated = calc();
  const discPercent = courseData.orig > courseData.price && courseData.price > 0
    ? Math.round((1 - courseData.price / courseData.orig) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bwa-sv dirty">
          <i /> Loading course details...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Sub Tabs */}
      <div className="bwa-subtabs">
        <button
          type="button"
          className={subTab === 'editor' ? 'on' : ''}
          onClick={() => setSubTab('editor')}
        >
          Course editor
        </button>
        <button
          type="button"
          className={subTab === 'catalog' ? 'on' : ''}
          onClick={() => setSubTab('catalog')}
        >
          Catalog page (/course)
        </button>
        <button
          type="button"
          className={subTab === 'students' ? 'on' : ''}
          onClick={() => setSubTab('students')}
        >
          Students &amp; purchases
        </button>
        <button
          type="button"
          className={subTab === 'comments' ? 'on' : ''}
          onClick={() => setSubTab('comments')}
        >
          Discussions &amp; comments
        </button>
      </div>

      {subTab === 'catalog' ? (
        <AdminCourseLandingCatalogEditor />
      ) : subTab === 'students' ? (
        <div className="p-6 md:p-8 max-w-[1500px] mx-auto">
          <AdminCourseStudents />
        </div>
      ) : subTab === 'comments' ? (
        <div className="p-6 md:p-8 max-w-[1500px] mx-auto">
          <AdminCourseComments />
        </div>
      ) : (
        <>
          {/* Sticky Course Bar */}
          <AdminStickyBar
            title={courseData.title || 'Untitled course'}
            statusMode="live-switch"
            status={courseStatus}
            onStatusChange={handleStatusChange}
            dirty={dirty}
            isSaving={saving}
            onSave={handleSave}
            extraRight={
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    className="bwa-sel"
                    aria-label="Switch course"
                    value={selectedCourseSlug}
                    onChange={(e) => fetchCoursesAndData(e.target.value)}
                    style={{ minWidth: '220px', fontWeight: 600 }}
                  >
                    {coursesList.map(c => {
                      const tag = c.status === 'live' ? '● Live' : c.status === 'soon' ? '⏳ Coming soon' : '○ Draft';
                      return (
                        <option key={c._id || c.slug} value={c.slug}>
                          {c.title} ({tag})
                        </option>
                      );
                    })}
                  </select>

                  <button
                    type="button"
                    className="bwa-btn"
                    onClick={() => {
                      setNewCourseTitle('');
                      setNewCourseSlug('');
                      setCreateCourseModalOpen(true);
                    }}
                    title="Create a new course"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Icon name="plus" size={14} /> New Course
                  </button>

                  <button
                    type="button"
                    className="bwa-btn danger"
                    onClick={handleDeleteCurrentCourse}
                    title={`Delete "${courseData.title}"`}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '9px 12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    aria-label="Delete course"
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>

                <a
                  href={`/course/${selectedCourseSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bwa-btn"
                >
                  Preview as student
                </a>
              </>
            }
          />

          {/* 2-Column Body */}
          <div className="bwa-body nop">
            {/* Left Nav */}
            <aside className="bwa-left">
              {STEPS.map(([id, icon, name, subtitle, group]) => {
                const isCurrent = step === id;
                const checkMap = { basics: 'title', pricing: 'price', visuals: 'thumb', landing: 'road', lessons: 'vid' };
                const checkObj = checks.find(c => c.k === checkMap[id]);
                const isOk = checkObj ? checkObj.ok : true;

                return (
                  <React.Fragment key={id}>
                    {group && (
                      <div className={`bwa-grp ${id === 'lessons' ? 'g2' : ''}`}>
                        {group === 'Course page' ? 'Course page · before purchase' : 'Course content · after purchase'}
                      </div>
                    )}
                    <button
                      type="button"
                      className={`bwa-ni ${isCurrent ? 'on' : ''}`}
                      onClick={() => {
                        setStep(id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <span className="ico">
                        <Icon name={icon} size={18} />
                      </span>
                      <span>
                        <b>{name}</b>
                        <small>{subtitle}</small>
                      </span>
                      <span className={`st bwa-st ${isOk ? 'ok' : 'no'}`}>
                        <Icon name={isOk ? 'check' : 'alert'} size={12} />
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}

              {/* Readiness Card */}
              <div className="bwa-ready">
                <div className="h">
                  <b>Ready to publish</b>
                  <span style={{ color: 'var(--muted)', fontSize: '13px' }}>
                    {completedCount}/{requiredChecks.length}
                  </span>
                </div>
                <div className="bwa-pbar">
                  <i style={{ width: `${(completedCount / requiredChecks.length) * 100}%` }} />
                </div>
                {checks.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    className="bwa-ri"
                    onClick={() => handleFixIssue(c)}
                  >
                    <span className={`st bwa-st ${c.ok ? 'ok' : 'no'}`}>
                      <Icon name={c.ok ? 'check' : 'alert'} size={11} />
                    </span>
                    <span className="t">{c.l}</span>
                    {c.opt && <em>optional</em>}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Center Form */}
            <main className="bwa-main">
              {courseData.live && issues.length > 0 && (
                <div className="bwa-banner">
                  <span style={{ color: 'var(--amber)' }}>
                    <Icon name="alert" size={18} />
                  </span>
                  <div>
                    <b>This course is Live but not ready</b>
                    <span>
                      Students can buy it while {issues.length} item{issues.length > 1 ? 's are' : ' is'} unfinished (
                      {issues.map(i => i.l.replace(/ \(.*\)/, '').toLowerCase()).join(', ')}
                      ).
                    </span>
                  </div>
                  <button
                    type="button"
                    className="bwa-btn sm"
                    onClick={() => handleFixIssue(issues[0])}
                  >
                    Fix now
                  </button>
                </div>
              )}

              {/* Step 1: Basics */}
              {step === 'basics' && (
                <div>
                  <h1>Basics</h1>
                  <p className="bwa-lead">The essentials students see first on the course card and the top of the landing page.</p>

                  {/* Visibility & Publishing Status */}
                  <div className="bwa-card">
                    <div className="bwa-row">
                      <div>
                        <h3>Course Visibility &amp; Status</h3>
                        <p className="sub" style={{ margin: 0 }}>
                          Control how this course is displayed across the catalog and website.
                        </p>
                      </div>
                      <div>
                        <span className={courseStatus === 'live' ? 'bwa-chip g' : courseStatus === 'soon' ? 'bwa-chip a' : 'bwa-chip'}>
                          {courseStatus === 'live' ? '● Live & Public' : courseStatus === 'soon' ? '⏳ Coming Soon' : '○ Hidden / Draft'}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {/* Option 1: Live */}
                      <div
                        onClick={() => handleStatusChange('live')}
                        style={{
                          border: courseStatus === 'live' ? '2px solid var(--accent)' : '1px solid var(--line)',
                          background: courseStatus === 'live' ? '#fcf8f4' : '#fff',
                          borderRadius: '8px',
                          padding: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <input
                            type="radio"
                            name="courseVisibility"
                            checked={courseStatus === 'live'}
                            onChange={() => handleStatusChange('live')}
                          />
                          <b style={{ color: 'var(--ink)' }}>Live (Published)</b>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', paddingLeft: '22px' }}>
                          Visible on <code>/course</code> catalog and home page. Students can purchase and enroll immediately.
                        </p>
                      </div>

                      {/* Option 2: Coming Soon */}
                      <div
                        onClick={() => handleStatusChange('soon')}
                        style={{
                          border: courseStatus === 'soon' ? '2px solid var(--accent)' : '1px solid var(--line)',
                          background: courseStatus === 'soon' ? '#fcf8f4' : '#fff',
                          borderRadius: '8px',
                          padding: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <input
                            type="radio"
                            name="courseVisibility"
                            checked={courseStatus === 'soon'}
                            onChange={() => handleStatusChange('soon')}
                          />
                          <b style={{ color: 'var(--ink)' }}>Coming Soon</b>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', paddingLeft: '22px' }}>
                          Visible on the catalog with a "Coming Soon" badge. Students can preview the roadmap and waitlist.
                        </p>
                      </div>

                      {/* Option 3: Draft / Hidden */}
                      <div
                        onClick={() => handleStatusChange('draft')}
                        style={{
                          border: courseStatus === 'draft' ? '2px solid var(--accent)' : '1px solid var(--line)',
                          background: courseStatus === 'draft' ? '#fcf8f4' : '#fff',
                          borderRadius: '8px',
                          padding: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <input
                            type="radio"
                            name="courseVisibility"
                            checked={courseStatus === 'draft'}
                            onChange={() => handleStatusChange('draft')}
                          />
                          <b style={{ color: 'var(--ink)' }}>Hidden (Draft)</b>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', paddingLeft: '22px' }}>
                          Completely hidden from catalog and search. Ideal while preparing lessons or retiring an old course.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bwa-card">
                    <h3>Course identity</h3>
                    <p className="sub">Name and short pitch.</p>
                    <div className="bwa-grid2" style={{ gridTemplateColumns: '2fr 1fr' }}>
                      <div className="bwa-f">
                        <label>Course title</label>
                        <input
                          type="text"
                          value={courseData.title}
                          onChange={(e) => updateField('title', e.target.value)}
                          placeholder="e.g. The Better Man"
                        />
                      </div>
                      <div className="bwa-f">
                        <label>Card number</label>
                        <input
                          type="text"
                          value={courseData.seq}
                          onChange={(e) => updateField('seq', e.target.value)}
                          placeholder="01"
                        />
                        <div className="hint">Big number on the course card, e.g. 01</div>
                      </div>
                    </div>
                    <div className="bwa-f">
                      <label>Short description</label>
                      <textarea
                        rows={3}
                        value={courseData.lede}
                        onChange={(e) => updateField('lede', e.target.value)}
                        placeholder="One or two sentences under the title on the landing page."
                      />
                      <div className="hint">One or two sentences under the title on the landing page.</div>
                    </div>
                  </div>

                  <div className="bwa-card">
                    <h3>Pricing sidebar highlights</h3>
                    <p className="sub">Two key benefits shown beside the price. Each has a bold first line and a lighter second line.</p>
                    <div className="bwa-grid2">
                      <div>
                        <div className="bwa-f">
                          <label>Highlight 1</label>
                          <input
                            type="text"
                            value={courseData.hl[0]?.[0] || ''}
                            onChange={(e) => updateField('hl.0.0', e.target.value)}
                            placeholder="Real-World Transformation"
                          />
                        </div>
                        <div className="bwa-f">
                          <input
                            type="text"
                            value={courseData.hl[0]?.[1] || ''}
                            onChange={(e) => updateField('hl.0.1', e.target.value)}
                            placeholder="(Not Just Theory)"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="bwa-f">
                          <label>Highlight 2</label>
                          <input
                            type="text"
                            value={courseData.hl[1]?.[0] || ''}
                            onChange={(e) => updateField('hl.1.0', e.target.value)}
                            placeholder="3 Private Sessions"
                          />
                        </div>
                        <div className="bwa-f">
                          <input
                            type="text"
                            value={courseData.hl[1]?.[1] || ''}
                            onChange={(e) => updateField('hl.1.1', e.target.value)}
                            placeholder="with Aarkesh"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone: Delete Course */}
                  <div className="bwa-card" style={{ borderColor: 'rgba(186, 26, 26, 0.25)', background: '#fff9f8' }}>
                    <div className="bwa-row">
                      <div>
                        <h3 style={{ color: 'var(--err, #ba1a1a)' }}>Danger zone</h3>
                        <p className="sub" style={{ margin: 0 }}>
                          Permanently delete <strong>"{courseData.title}"</strong> ({selectedCourseSlug}) and remove its roadmap, pricing, and content.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="bwa-btn danger"
                        onClick={handleDeleteCurrentCourse}
                      >
                        <Icon name="trash" size={14} /> Delete this course
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Card image & trailer */}
              {step === 'visuals' && (
                <div>
                  <h1>Card image &amp; trailer</h1>
                  <p className="bwa-lead">How the course looks in the catalog, plus the free preview video on the landing page.</p>

                  <div className="bwa-card">
                    <h3>Card theme</h3>
                    <p className="sub">Pick the colour style of the course card.</p>
                    <div className="bwa-rc">
                      {[
                        ['obs', 'Obsidian black', 'Purple glow banner, black card', 'linear-gradient(135deg,#6a1f7a,#0a050d)'],
                        ['roy', 'Royal purple', 'Dark banner, plum card', 'linear-gradient(135deg,#0b0610,#4a1048)'],
                        ['whi', 'Clean white', 'Magenta banner, white card', 'linear-gradient(135deg,#c06ab8,#6f2a82)']
                      ].map(([id, n, d, g]) => (
                        <button
                          key={id}
                          type="button"
                          className={`bwa-rcard ${courseData.theme === id ? 'on' : ''}`}
                          onClick={() => updateField('theme', id)}
                        >
                          <span className="tick"><Icon name="check" size={12} /></span>
                          <div className="bwa-sw3" style={{ background: g }}>{courseData.seq}</div>
                          <b>{n}</b>
                          <small>{d}</small>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bwa-card">
                    <h3>Thumbnail image</h3>
                    <p className="sub">Shown on the course card instead of the theme banner. JPG, PNG or WebP, up to 5 MB, 16:10 works best.</p>

                    {courseData.thumb ? (
                      <div className="bwa-file">
                        <div className="th" style={{ backgroundImage: `url('${courseData.thumb}')` }} />
                        <b>{courseData.thumbName || courseData.thumb}</b>
                        <button
                          type="button"
                          className="bwa-btn sm danger"
                          onClick={() => {
                            updateField('thumb', '');
                            updateField('thumbName', '');
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div
                          className="bwa-dz"
                          tabIndex={0}
                          role="button"
                          aria-label="Upload thumbnail"
                          onClick={() => fileInputRef.current?.click()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              fileInputRef.current?.click();
                            }
                          }}
                        >
                          <div className="ico"><Icon name="upload" size={22} /></div>
                          <b>Click or drag an image here</b>
                          <small>JPG, PNG, WebP · max 5 MB</small>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/png,image/jpeg,image/webp"
                          hidden
                          onChange={handleThumbUpload}
                        />

                        <div className="bwa-f" style={{ marginTop: '14px' }}>
                          <label>Or paste an image URL</label>
                          <input
                            type="text"
                            placeholder="https://… or /uploads/image.png"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                updateField('thumb', e.target.value.trim());
                                updateField('thumbName', '');
                              }
                            }}
                          />
                          <div className="hint">Press Enter to apply.</div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bwa-card">
                    <div className="bwa-row">
                      <div>
                        <h3>Trailer video</h3>
                        <p className="sub" style={{ margin: '0 0 16px' }}>Free preview that plays when visitors click Play on the landing page.</p>
                      </div>
                      {srcInfo(courseData.trailer) ? (
                        <span className={`bwa-chip ${srcInfo(courseData.trailer).ok ? 'g' : 'r'}`}>
                          {srcInfo(courseData.trailer).ok ? `● ${srcInfo(courseData.trailer).t} detected` : srcInfo(courseData.trailer).t}
                        </span>
                      ) : (
                        <span className="bwa-chip n">No trailer</span>
                      )}
                    </div>

                    {/* Mux Video File Upload Dropzone */}
                    <div
                      className="bwa-dz"
                      tabIndex={0}
                      role="button"
                      aria-label="Upload trailer video directly to Mux"
                      onClick={() => trailerFileInputRef.current?.click()}
                      style={{ marginBottom: '16px', background: '#faf6f0' }}
                    >
                      <div className="ico" style={{ color: 'var(--accent)' }}>
                        <Icon name="video" size={26} />
                      </div>
                      <b>Upload Local Video directly to Mux</b>
                      <small>MP4, MOV, WebM, MKV · High-speed HLS streaming with global CDN</small>
                    </div>

                    <input
                      type="file"
                      ref={trailerFileInputRef}
                      accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
                      hidden
                      onChange={handleTrailerMuxUpload}
                    />

                    {/* Live Upload & Processing Bar */}
                    {trailerVideoStatus === 'uploading' && (
                      <div style={{ marginBottom: '16px', padding: '12px 14px', background: '#f5f0e8', borderRadius: '8px', border: '1px solid var(--line)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Uploading to Mux...</span>
                          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{trailerUploadProgress}%</span>
                        </div>
                        <div className="bwa-pbar">
                          <i style={{ width: `${trailerUploadProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {trailerVideoStatus === 'processing' && (
                      <div style={{ marginBottom: '16px', padding: '12px 14px', background: '#fdf9ea', borderRadius: '8px', border: '1px solid #f2e2a8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--amber)' }}><Icon name="alert" size={18} /></span>
                        <div style={{ fontSize: '13px', color: '#684d00' }}>
                          <b>Mux is processing and encoding your trailer...</b><br />
                          This usually takes 10–30 seconds. The playback ID will be attached automatically once ready.
                        </div>
                      </div>
                    )}

                    {trailerVideoStatus === 'errored' && (
                      <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#fbeaea', borderRadius: '8px', border: '1px solid #f5c2c2', color: 'var(--err)', fontSize: '13px' }}>
                        <b>Upload Error:</b> {trailerUploadError || 'Failed to upload video to Mux.'}
                      </div>
                    )}

                    <div className="bwa-f">
                      <label>Or paste a Mux playback ID, Mux stream URL or YouTube link</label>
                      <input
                        type="text"
                        value={courseData.trailer}
                        onChange={(e) => updateField('trailer', e.target.value)}
                        placeholder="e.g. nv1DXr61Ab00KZ8wMs7v5Wb1gkn02Jbw801Tdt01G57Gw8k or https://youtube.com/watch?v=..."
                      />
                      <div className="hint">We detect whether it's Mux or YouTube automatically.</div>
                    </div>

                    {courseData.trailer && (
                      <button
                        type="button"
                        className="bwa-btn sm danger"
                        onClick={() => {
                          updateField('trailer', '');
                          setTrailerVideoStatus('idle');
                        }}
                      >
                        Remove trailer
                      </button>
                    )}
                  </div>

                  {/* View All Masterclasses Button Toggle Card */}
                  <div className="bwa-card">
                    <div className="bwa-row">
                      <div>
                        <h3>"View All Masterclasses" Button</h3>
                        <p className="sub" style={{ margin: 0 }}>
                          Show or hide the bottom button (<strong>VIEW ALL MASTERCLASSES →</strong>) on the main course catalog page.
                        </p>
                      </div>
                      <label className="bwa-row" style={{ gap: '10px', fontWeight: 600 }}>
                        <span>{landingSettings.showViewAllBtn ? 'Shown' : 'Hidden'}</span>
                        <span className="bwa-sw">
                          <input
                            type="checkbox"
                            checked={landingSettings.showViewAllBtn}
                            onChange={(e) => {
                              setLandingSettings(prev => ({ ...prev, showViewAllBtn: e.target.checked }));
                              setDirty(true);
                            }}
                            aria-label="Toggle View All Masterclasses button"
                          />
                          <i />
                        </span>
                      </label>
                    </div>

                    {landingSettings.showViewAllBtn && (
                      <div style={{ marginTop: '16px' }} className="bwa-grid2">
                        <div className="bwa-f">
                          <label>Button text</label>
                          <input
                            type="text"
                            value={landingSettings.viewAllBtnText}
                            onChange={(e) => {
                              setLandingSettings(prev => ({ ...prev, viewAllBtnText: e.target.value }));
                              setDirty(true);
                            }}
                            placeholder="View All Masterclasses"
                          />
                        </div>
                        <div className="bwa-f">
                          <label>Button Link</label>
                          <input
                            type="text"
                            value={landingSettings.viewAllBtnLink}
                            onChange={(e) => {
                              setLandingSettings(prev => ({ ...prev, viewAllBtnLink: e.target.value }));
                              setDirty(true);
                            }}
                            placeholder="/course/all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & GST */}
              {step === 'pricing' && (
                <div>
                  <h1>Pricing &amp; GST</h1>
                  <p className="bwa-lead">Set the price and decide how GST is handled. The preview shows exactly what a student pays at checkout.</p>

                  <div className="bwa-card">
                    <h3>Price</h3>
                    <p className="sub">The strikethrough price is optional and only shown for the discount.</p>
                    <div className="bwa-grid3">
                      <div className="bwa-f">
                        <label>Current price</label>
                        <div className="bwa-pre">
                          <b>₹</b>
                          <input
                            type="number"
                            min={0}
                            value={courseData.price}
                            onChange={(e) => updateField('price', Number(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="bwa-f">
                        <label>Original price <span>optional</span></label>
                        <div className="bwa-pre">
                          <b>₹</b>
                          <input
                            type="number"
                            min={0}
                            value={courseData.orig || ''}
                            onChange={(e) => updateField('orig', Number(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="bwa-f">
                        <label>Button text</label>
                        <input
                          type="text"
                          value={courseData.cta}
                          onChange={(e) => updateField('cta', e.target.value)}
                        />
                      </div>
                    </div>
                    {discPercent > 0 && (
                      <div style={{ marginTop: '6px' }}>
                        <span className="bwa-chip g">{discPercent}% off shown on card</span>
                      </div>
                    )}
                  </div>

                  <div className="bwa-card">
                    <div className="bwa-row">
                      <div>
                        <h3>GST</h3>
                        <p className="sub" style={{ margin: 0 }}>Charge GST at checkout.</p>
                      </div>
                      <label className="bwa-row" style={{ gap: '10px', fontWeight: 600 }}>
                        <span>{courseData.gst ? 'On' : 'Off'}</span>
                        <span className="bwa-sw">
                          <input
                            type="checkbox"
                            checked={courseData.gst}
                            onChange={(e) => updateField('gst', e.target.checked)}
                            aria-label="Toggle GST"
                          />
                          <i />
                        </span>
                      </label>
                    </div>

                    {courseData.gst && (
                      <div style={{ marginTop: '18px' }} className="bwa-grid2">
                        <div>
                          <div className="bwa-f">
                            <label>GST rate (%)</label>
                            <input
                              type="number"
                              min={0}
                              value={courseData.rate}
                              onChange={(e) => updateField('rate', Number(e.target.value) || 0)}
                            />
                          </div>
                          <div className="bwa-presets">
                            {[0, 5, 12, 18, 28].map(r => (
                              <button
                                key={r}
                                type="button"
                                className={`bwa-pill ${Number(courseData.rate) === r ? 'on' : ''}`}
                                onClick={() => updateField('rate', r)}
                              >
                                {r}%
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="bwa-f">
                            <label>How is GST applied?</label>
                          </div>
                          <div className="bwa-rc" style={{ gridTemplateColumns: '1fr' }}>
                            <button
                              type="button"
                              className={`bwa-rcard ${courseData.mode === 'included' ? 'on' : ''}`}
                              onClick={() => updateField('mode', 'included')}
                            >
                              <span className="tick"><Icon name="check" size={12} /></span>
                              <b style={{ margin: 0 }}>Included in price</b>
                              <small>Student pays the price you set. GST is carved out of it.</small>
                            </button>
                            <button
                              type="button"
                              className={`bwa-rcard ${courseData.mode === 'exclusive' ? 'on' : ''}`}
                              onClick={() => updateField('mode', 'exclusive')}
                            >
                              <span className="tick"><Icon name="check" size={12} /></span>
                              <b style={{ margin: 0 }}>Added on top</b>
                              <small>GST is added to the price at checkout.</small>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bwa-calc" aria-live="polite">
                      <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '.04em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                        Checkout preview
                      </div>
                      <div>
                        <span>Base price</span>
                        <span>{inr(calculated.base)}</span>
                      </div>
                      {courseData.gst && (
                        <div>
                          <span>GST ({courseData.rate}%)</span>
                          <span>{inr(calculated.gst)}</span>
                        </div>
                      )}
                      <div className="tot">
                        <span>Student pays</span>
                        <span>{inr(calculated.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Landing page content */}
              {step === 'landing' && (
                <div>
                  <h1>Landing page content</h1>
                  <p className="bwa-lead">The sales content visitors read before buying.</p>

                  <div className="bwa-banner info">
                    <span style={{ color: 'var(--blue)' }}>
                      <Icon name="info" size={18} />
                    </span>
                    <div>
                      <b>Roadmap vs. Lessons</b>
                      The roadmap here is a marketing summary. Real videos and lessons live in{' '}
                      <button
                        type="button"
                        onClick={() => setStep('lessons')}
                        style={{ color: 'var(--blue)', fontWeight: 600, background: 'none', border: 0, padding: 0, textDecoration: 'underline' }}
                      >
                        Lessons &amp; videos
                      </button>.
                    </div>
                  </div>

                  {/* Accordion 1: Roadmap */}
                  <div className={`bwa-acc ${acc.road ? 'open' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setAcc(p => ({ ...p, road: !p.road }))}
                      aria-expanded={acc.road}
                    >
                      <div>
                        <h3>Roadmap</h3>
                        <small>{courseData.road.mods.length} modules</small>
                      </div>
                      <Icon name="down" size={18} className="cv" />
                    </button>
                    <div className="bd">
                      <div style={{ paddingTop: '14px' }}>
                        <div className="bwa-f">
                          <label>Section title</label>
                          <input
                            type="text"
                            value={courseData.road.title}
                            onChange={(e) => updateField('road.title', e.target.value)}
                          />
                        </div>
                        <div className="bwa-f">
                          <label>Section subtitle</label>
                          <textarea
                            rows={2}
                            value={courseData.road.sub}
                            onChange={(e) => updateField('road.sub', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="bwa-row" style={{ marginTop: '8px', marginBottom: '8px' }}>
                        <b>Modules ({courseData.road.mods.length})</b>
                        <div className="bwa-acts">
                          <button
                            type="button"
                            className="bwa-btn sm"
                            onClick={() => {
                              setModalConfig({
                                isOpen: true,
                                title: 'Replace roadmap from lessons?',
                                message: 'Roadmap module titles will be rebuilt from your lesson modules. Descriptions are kept where titles match.',
                                confirmText: 'Replace roadmap',
                                isDanger: false,
                                onConfirm: () => {
                                  const newMods = courseData.days.map(d => {
                                    const t = d.t.replace(/^Module \d+:\s*/, '');
                                    const old = courseData.road.mods.find(m => m.t === t);
                                    return { t, d: old ? old.d : '' };
                                  });
                                  updateField('road.mods', newMods);
                                  setModalConfig({ isOpen: false });
                                  showSuccess('Roadmap updated from lessons');
                                },
                                onCancel: () => setModalConfig({ isOpen: false })
                              });
                            }}
                          >
                            Fill from lessons
                          </button>
                          <button
                            type="button"
                            className="bwa-btn sm pri"
                            onClick={() => {
                              updateField('road.mods', [...courseData.road.mods, { t: 'New module', d: '' }]);
                            }}
                          >
                            <Icon name="plus" size={14} /> Add module
                          </button>
                        </div>
                      </div>

                      {courseData.road.mods.map((m, i) => (
                        <div key={i} className="bwa-mod">
                          <div className="n">{String(i + 1).padStart(2, '0')}</div>
                          <div>
                            <input
                              type="text"
                              value={m.t}
                              onChange={(e) => updateField(`road.mods.${i}.t`, e.target.value)}
                              aria-label="Module title"
                            />
                            <input
                              type="text"
                              value={m.d}
                              onChange={(e) => updateField(`road.mods.${i}.d`, e.target.value)}
                              aria-label="Module description"
                              placeholder="One line description"
                            />
                          </div>
                          <div className="bwa-acts">
                            <button
                              type="button"
                              className="bwa-ib"
                              disabled={i === 0}
                              onClick={() => updateField('road.mods', moveItem(courseData.road.mods, i, -1))}
                              aria-label="Move up"
                            >
                              <Icon name="up" size={14} />
                            </button>
                            <button
                              type="button"
                              className="bwa-ib"
                              disabled={i === courseData.road.mods.length - 1}
                              onClick={() => updateField('road.mods', moveItem(courseData.road.mods, i, 1))}
                              aria-label="Move down"
                            >
                              <Icon name="down" size={14} />
                            </button>
                            <button
                              type="button"
                              className="bwa-ib del"
                              onClick={() => {
                                setModalConfig({
                                  isOpen: true,
                                  title: 'Delete this module?',
                                  message: `“${m.t}” will be removed from the landing page roadmap.`,
                                  confirmText: 'Delete',
                                  isDanger: true,
                                  onConfirm: () => {
                                    const next = courseData.road.mods.filter((_, idx) => idx !== i);
                                    updateField('road.mods', next);
                                    setModalConfig({ isOpen: false });
                                    showSuccess('Module deleted');
                                  },
                                  onCancel: () => setModalConfig({ isOpen: false })
                                });
                              }}
                              aria-label="Delete"
                            >
                              <Icon name="trash" size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accordion 2: Inside Checklist */}
                  <div className={`bwa-acc ${acc.inside ? 'open' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setAcc(p => ({ ...p, inside: !p.inside }))}
                      aria-expanded={acc.inside}
                    >
                      <div>
                        <h3>What's inside checklist</h3>
                        <small>{courseData.inside.length} benefits</small>
                      </div>
                      <Icon name="down" size={18} className="cv" />
                    </button>
                    <div className="bd">
                      <p className="sub" style={{ margin: '14px 0 0' }}>Ticked benefits shown in the pricing card.</p>
                      {courseData.inside.map((t, i) => (
                        <div key={i} className="bwa-chk">
                          <span className="bwa-st"><Icon name="check" size={12} /></span>
                          <input
                            type="text"
                            value={t}
                            onChange={(e) => updateField(`inside.${i}`, e.target.value)}
                            aria-label={`Benefit ${i + 1}`}
                          />
                          <button
                            type="button"
                            className="bwa-ib del"
                            onClick={() => {
                              const next = courseData.inside.filter((_, idx) => idx !== i);
                              updateField('inside', next);
                            }}
                            aria-label="Delete"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bwa-btn sm"
                        style={{ marginTop: '12px' }}
                        onClick={() => updateField('inside', [...courseData.inside, 'New benefit'])}
                      >
                        <Icon name="plus" size={14} /> Add benefit
                      </button>
                    </div>
                  </div>

                  {/* Accordion 3: Story & Methodology */}
                  <div className={`bwa-acc ${acc.story ? 'open' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setAcc(p => ({ ...p, story: !p.story }))}
                      aria-expanded={acc.story}
                    >
                      <div>
                        <h3>Story &amp; methodology</h3>
                        <small>Headline, narrative and quote</small>
                      </div>
                      <Icon name="down" size={18} className="cv" />
                    </button>
                    <div className="bd">
                      <div style={{ paddingTop: '14px' }}>
                        <div className="bwa-grid2">
                          <div className="bwa-f">
                            <label>Small label above headline</label>
                            <input
                              type="text"
                              value={courseData.story.pill}
                              onChange={(e) => updateField('story.pill', e.target.value)}
                            />
                          </div>
                          <div className="bwa-f">
                            <label>Headline</label>
                            <input
                              type="text"
                              value={courseData.story.h}
                              onChange={(e) => updateField('story.h', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="bwa-f">
                          <label>Opening line</label>
                          <textarea
                            rows={2}
                            value={courseData.story.hook}
                            onChange={(e) => updateField('story.hook', e.target.value)}
                          />
                        </div>
                        <div className="bwa-f">
                          <label>The problem</label>
                          <textarea
                            rows={3}
                            value={courseData.story.p1}
                            onChange={(e) => updateField('story.p1', e.target.value)}
                          />
                        </div>
                        <div className="bwa-f">
                          <label>Highlighted quote</label>
                          <textarea
                            rows={2}
                            value={courseData.story.quote}
                            onChange={(e) => updateField('story.quote', e.target.value)}
                          />
                        </div>
                        <div className="bwa-f">
                          <label>The solution</label>
                          <textarea
                            rows={3}
                            value={courseData.story.p2}
                            onChange={(e) => updateField('story.p2', e.target.value)}
                          />
                        </div>
                        <div className="bwa-f">
                          <label>Key takeaway</label>
                          <textarea
                            rows={2}
                            value={courseData.story.take}
                            onChange={(e) => updateField('story.take', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Lessons & videos */}
              {step === 'lessons' && (
                <div>
                  <h1>Lessons &amp; videos</h1>
                  <p className="bwa-lead">What students watch after they buy. Add a video to every lesson before going live.</p>

                  {/* KPI Stats */}
                  <div className="bwa-stats">
                    <div className="bwa-stat">
                      <b>{courseData.days.length}</b>
                      <span>Modules</span>
                    </div>
                    <div className="bwa-stat">
                      <b>{allLessons.length}</b>
                      <span>Lessons</span>
                    </div>
                  </div>

                  {/* Search & Filter Toolbar */}
                  <div className="bwa-tools">
                    <div className="s">
                      <input
                        type="search"
                        placeholder="Search modules and lessons"
                        value={lessonQuery}
                        onChange={(e) => setLessonQuery(e.target.value)}
                        aria-label="Search"
                      />
                    </div>
                    <div className="bwa-seg">
                      <button
                        type="button"
                        className={lessonFilter === 'all' ? 'on' : ''}
                        onClick={() => setLessonFilter('all')}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className={lessonFilter === 'novid' ? 'on' : ''}
                        onClick={() => setLessonFilter('novid')}
                      >
                        Needs video ({allLessons.length - readyLessonsCount})
                      </button>
                    </div>
                    <button
                      type="button"
                      className="bwa-btn pri"
                      onClick={() => {
                        const n = courseData.days.length + 1;
                        updateField('days', [
                          ...courseData.days,
                          {
                            id: `d${Date.now()}`,
                            t: `Module ${String(n).padStart(2, '0')}: New module`,
                            open: true,
                            lessons: []
                          }
                        ]);
                        showSuccess('New module added');
                      }}
                    >
                      <Icon name="plus" size={15} /> Add module
                    </button>
                  </div>

                  {/* Modules & Lessons List */}
                  <div>
                    {courseData.days.map((d, di) => {
                      const ql = lessonQuery.trim().toLowerCase();
                      const ls = d.lessons
                        .map((l, li) => ({ l, li }))
                        .filter(({ l }) => {
                          if (lessonFilter === 'novid' && l.src) return false;
                          if (ql) {
                            return l.t.toLowerCase().includes(ql) || d.t.toLowerCase().includes(ql);
                          }
                          return true;
                        });

                      if ((ql || lessonFilter !== 'all') && !ls.length) return null;

                      const readyInModule = d.lessons.filter(l => l.src).length;

                      return (
                        <div key={d.id || di} className="bwa-day">
                          <div className="bwa-dhd">
                            <span className="n">Module {di + 1}</span>
                            <input
                              type="text"
                              value={d.t}
                              onChange={(e) => updateField(`days.${di}.t`, e.target.value)}
                              aria-label="Module title"
                            />
                            <span className={`bwa-chip ${readyInModule === d.lessons.length && readyInModule ? 'g' : 'a'}`}>
                              {readyInModule}/{d.lessons.length} videos
                            </span>
                            <div className="bwa-acts">
                              <button
                                type="button"
                                className="bwa-ib"
                                disabled={di === 0}
                                onClick={() => updateField('days', moveItem(courseData.days, di, -1))}
                                aria-label="Move module up"
                              >
                                <Icon name="up" size={14} />
                              </button>
                              <button
                                type="button"
                                className="bwa-ib"
                                disabled={di === courseData.days.length - 1}
                                onClick={() => updateField('days', moveItem(courseData.days, di, 1))}
                                aria-label="Move module down"
                              >
                                <Icon name="down" size={14} />
                              </button>
                              <button
                                type="button"
                                className="bwa-ib del"
                                onClick={() => {
                                  setModalConfig({
                                    isOpen: true,
                                    title: 'Delete this module?',
                                    message: `“${d.t}” and its ${d.lessons.length} lesson${d.lessons.length === 1 ? '' : 's'} will be removed.`,
                                    confirmText: 'Delete',
                                    isDanger: true,
                                    onConfirm: () => {
                                      const next = courseData.days.filter((_, idx) => idx !== di);
                                      updateField('days', next);
                                      setModalConfig({ isOpen: false });
                                      showSuccess('Module deleted');
                                    },
                                    onCancel: () => setModalConfig({ isOpen: false })
                                  });
                                }}
                                aria-label="Delete module"
                              >
                                <Icon name="trash" size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Lesson rows */}
                          {ls.map(({ l, li }) => (
                            <div key={l.id || li} className="bwa-lr">
                              <div className={`vi ${l.src ? 'ok' : 'no'}`}>
                                <Icon name={l.src ? 'check' : 'video'} size={18} />
                              </div>
                              <div className="info">
                                <input
                                  type="text"
                                  value={l.t}
                                  onChange={(e) => updateField(`days.${di}.lessons.${li}.t`, e.target.value)}
                                  aria-label="Lesson title"
                                />
                                <div className="meta">
                                  <span>{l.dur}</span>
                                  {l.src ? (
                                    <span className="bwa-chip g">
                                      {l.src.type === 'mp4' ? 'Uploaded file' : l.src.type}
                                    </span>
                                  ) : (
                                    <span className="bwa-chip a">No video yet</span>
                                  )}
                                </div>
                              </div>

                              <div className="bwa-acts">
                                <button
                                  type="button"
                                  className={`bwa-btn sm ${l.src ? '' : 'pri'}`}
                                  onClick={() => openLessonDrawer(di, li, 'video')}
                                >
                                  <Icon name={l.src ? 'edit' : 'upload'} size={14} />
                                  {l.src ? 'Replace video' : 'Add video'}
                                </button>
                                <button
                                  type="button"
                                  className="bwa-ib"
                                  onClick={() => openLessonDrawer(di, li, 'details')}
                                  aria-label="Edit lesson details"
                                  title="Edit details"
                                >
                                  <Icon name="edit" size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="bwa-ib"
                                  onClick={() => {
                                    const copyLessons = [...d.lessons];
                                    copyLessons.splice(li + 1, 0, {
                                      ...l,
                                      id: `l${Date.now()}`,
                                      t: l.t + ' (copy)',
                                      src: null,
                                      free: false
                                    });
                                    updateField(`days.${di}.lessons`, copyLessons);
                                    showSuccess('Lesson duplicated (video not copied)');
                                  }}
                                  aria-label="Duplicate lesson"
                                  title="Duplicate"
                                >
                                  <Icon name="copy" size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="bwa-ib del"
                                  onClick={() => {
                                    setModalConfig({
                                      isOpen: true,
                                      title: 'Delete this lesson?',
                                      message: `“${l.t}”${l.src ? ' and its attached video' : ''} will be removed.`,
                                      confirmText: 'Delete',
                                      isDanger: true,
                                      onConfirm: () => {
                                        const next = d.lessons.filter((_, idx) => idx !== li);
                                        updateField(`days.${di}.lessons`, next);
                                        setModalConfig({ isOpen: false });
                                        showSuccess('Lesson deleted');
                                      },
                                      onCancel: () => setModalConfig({ isOpen: false })
                                    });
                                  }}
                                  aria-label="Delete lesson"
                                  title="Delete"
                                >
                                  <Icon name="trash" size={14} />
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            className="bwa-addl"
                            onClick={() => {
                              updateField(`days.${di}.lessons`, [
                                ...d.lessons,
                                {
                                  id: `l${Date.now()}`,
                                  t: `Lesson ${d.lessons.length + 1}: New lesson`,
                                  desc: '',
                                  dur: '0:00',
                                  free: false,
                                  src: null
                                }
                              ]);
                              showSuccess('Lesson added to module');
                            }}
                          >
                            <Icon name="plus" size={14} /> Add lesson to this module
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </main>
          </div>
        </>
      )}

      {/* Lesson Drawer */}
      <AdminDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerLessonInfo(null);
        }}
        title={drawerLessonInfo?.src ? 'Edit lesson' : 'Add video'}
        subtitle={drawerLessonInfo ? courseData.days[drawerLessonInfo.di]?.t : ''}
        footer={
          <>
            <button
              type="button"
              className="bwa-btn"
              onClick={() => {
                setDrawerOpen(false);
                setDrawerLessonInfo(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bwa-btn pri"
              onClick={saveLessonFromDrawer}
            >
              Save lesson
            </button>
          </>
        }
      >
        {drawerLessonInfo && (
          <div>
            <div className="bwa-f">
              <label>Lesson title</label>
              <input
                type="text"
                value={drawerLessonInfo.t || ''}
                onChange={(e) => setDrawerLessonInfo(prev => ({ ...prev, t: e.target.value }))}
              />
            </div>

            <div className="bwa-f">
              <label>Description &amp; key takeaways <span>shown under the video</span></label>
              <textarea
                rows={3}
                value={drawerLessonInfo.desc || ''}
                onChange={(e) => setDrawerLessonInfo(prev => ({ ...prev, desc: e.target.value }))}
              />
            </div>

            <div className="bwa-card" style={{ padding: '16px 18px', marginTop: '18px' }}>
              <div className="bwa-row" style={{ marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '17px' }}>Lesson Video</h3>
                  <p className="sub" style={{ margin: 0 }}>Upload a local video file (MP4, MOV, WebM, MKV).</p>
                </div>
                {drawerLessonInfo.src && !drawerLessonInfo.remove ? (
                  <span className="bwa-chip g">● Video attached</span>
                ) : (
                  <span className="bwa-chip a">No video</span>
                )}
              </div>

              {drawerLessonInfo.src && !drawerLessonInfo.remove && (
                <div className="bwa-cur" style={{ marginBottom: '14px' }}>
                  <span>
                    <Icon name="check" size={14} /> {drawerLessonInfo.file || (drawerLessonInfo.src.type === 'mux' ? `Mux Stream (${String(drawerLessonInfo.src.val).slice(0, 16)}...)` : 'Video Attached')}
                  </span>
                  <button
                    type="button"
                    className="bwa-btn sm danger"
                    onClick={() => {
                      setDrawerLessonInfo(prev => ({ ...prev, remove: true, val: '', file: '', src: null }));
                      setLessonVideoStatus('idle');
                    }}
                  >
                    Remove video
                  </button>
                </div>
              )}

              {/* Video File Upload Dropzone */}
              <div
                className="bwa-dz"
                tabIndex={0}
                role="button"
                aria-label="Upload lesson video"
                onClick={() => lessonFileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    lessonFileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleLessonFileUpload({ target: { files: e.dataTransfer.files } });
                  }
                }}
                style={{ padding: '22px', background: '#faf6f0', border: '2px dashed var(--line)', cursor: 'pointer' }}
              >
                <div className="ico" style={{ color: 'var(--accent)', marginBottom: '8px' }}>
                  <Icon name="video" size={28} />
                </div>
                <b>{drawerLessonInfo.src && !drawerLessonInfo.remove ? 'Replace video file' : 'Click or drop video file here to upload'}</b>
                <small>MP4, MOV, WebM, MKV · High-speed HLS streaming with global CDN</small>
              </div>

              <input
                type="file"
                ref={lessonFileInputRef}
                accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
                hidden
                onChange={handleLessonFileUpload}
              />

              <div className="bwa-f" style={{ marginTop: '14px' }}>
                <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Or enter Mux Playback ID / Stream URL</label>
                <input
                  type="text"
                  placeholder="e.g. nv1DXr61Ab00KZ8wMs7v5Wb1gkn02Jbw801Tdt01G57Gw8k"
                  value={drawerLessonInfo.src?.val || drawerLessonInfo.val || ''}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setDrawerLessonInfo(prev => ({
                      ...prev,
                      val,
                      src: val ? { type: 'mux', val, fileName: 'Mux Stream', status: 'ready' } : null,
                      remove: !val
                    }));
                  }}
                />
              </div>

              {/* Live Upload Progress */}
              {lessonVideoStatus === 'uploading' && (
                <div style={{ marginTop: '14px', padding: '12px 14px', background: '#f5f0e8', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Uploading lesson video...</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{lessonUploadProgress}%</span>
                  </div>
                  <div className="bwa-pbar">
                    <i style={{ width: `${lessonUploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Encoding / Processing Status */}
              {lessonVideoStatus === 'processing' && (
                <div style={{ marginTop: '14px', padding: '12px 14px', background: '#fdf9ea', borderRadius: '8px', border: '1px solid #f2e2a8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--amber)' }}><Icon name="alert" size={18} /></span>
                  <div style={{ fontSize: '13px', color: '#684d00' }}>
                    <b>Processing and encoding video...</b><br />
                    This takes 10–30 seconds. Video will attach automatically once ready.
                  </div>
                </div>
              )}

              {/* Error Status */}
              {lessonVideoStatus === 'errored' && (
                <div style={{ marginTop: '14px', padding: '10px 14px', background: '#fbeaea', borderRadius: '8px', border: '1px solid #f5c2c2', color: 'var(--err)', fontSize: '13px' }}>
                  <b>Upload Error:</b> {lessonUploadError || 'Failed to upload video.'}
                </div>
              )}
            </div>

            <div className="bwa-grid2" style={{ marginTop: '16px' }}>
              <div className="bwa-f">
                <label>Duration <span>mm:ss</span></label>
                <input
                  type="text"
                  value={drawerLessonInfo.dur || ''}
                  onChange={(e) => setDrawerLessonInfo(prev => ({ ...prev, dur: e.target.value }))}
                  placeholder="12:30"
                />
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>

      {/* Create New Course Modal */}
      <AdminConfirmModal
        isOpen={createCourseModalOpen}
        title="Create New Course / Masterclass"
        message="Enter the title for the new course. A URL slug will be created automatically."
        confirmText="Create & Open Editor"
        cancelText="Cancel"
        isDanger={false}
        onConfirm={handleCreateCourse}
        onCancel={() => {
          setCreateCourseModalOpen(false);
          setNewCourseTitle('');
          setNewCourseSlug('');
        }}
      >
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="bwa-f">
            <label>Course Title <span style={{ color: 'var(--err)' }}>*</span></label>
            <input
              type="text"
              value={newCourseTitle}
              onChange={(e) => {
                const val = e.target.value;
                setNewCourseTitle(val);
                setNewCourseSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
              }}
              placeholder="e.g. Emotional Sovereignty"
              autoFocus
            />
          </div>
          <div className="bwa-f">
            <label>URL Slug (link path: <code>/course/{"<slug>"}</code>)</label>
            <input
              type="text"
              value={newCourseSlug}
              onChange={(e) => setNewCourseSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'))}
              placeholder="e.g. emotional-sovereignty"
            />
            <div className="hint">This determines the course landing page URL.</div>
          </div>
        </div>
      </AdminConfirmModal>

      {/* Reusable Confirm Modal */}
      <AdminConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        isDanger={modalConfig.isDanger}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      >
        {modalConfig.children}
      </AdminConfirmModal>
    </div>
  );
}
