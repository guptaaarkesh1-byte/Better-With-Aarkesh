/**
 * Cross-App Authentication Synchronization Helper
 * Ensures complete synchronization between Coaching Auth and Course Auth:
 * - When logging in from either portal, both portals stay authenticated.
 * - When logging out from either portal, both portals are completely logged out in real-time.
 */

export const clearAllAuth = () => {
  // Clear Coaching Auth
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('user');
  localStorage.removeItem('freeSessions');

  // Clear Course Auth
  localStorage.removeItem('courseToken');
  localStorage.removeItem('courseUser');
  localStorage.removeItem('isCoursePurchased');
  localStorage.removeItem('purchasedCourses');

  // Clear transient booking & checkout state
  sessionStorage.removeItem('course_checkout_active');
  sessionStorage.removeItem('bookingStep');
  sessionStorage.removeItem('bookingData');

  // Clear player progress & active lesson
  localStorage.removeItem('lastActiveCourseLessonId');
  localStorage.removeItem('course_completed_lessons');
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('bwa_lesson_progress_') || k.startsWith('bwa_u_')) {
        localStorage.removeItem(k);
      }
    });
  } catch {}

  // Dispatch synchronized events across all components
  window.dispatchEvent(new Event('auth-change'));
  window.dispatchEvent(new Event('course-auth-change'));
};

export const syncLoginData = (data = {}) => {
  if (!data) return;

  // 1. Sync Coaching Token & User
  const coachingToken = data.coachingToken || data.token;
  if (coachingToken) {
    localStorage.setItem('token', coachingToken);
  }

  const effectiveUserInfo = {
    _id: data.coachingUserId || data._id || data.id,
    fullName: data.fullName || data.name || '',
    email: (data.email || '').toLowerCase().trim(),
    phoneNumber: data.phoneNumber || '',
    countryCode: data.countryCode || '+91',
    freeSessions: data.freeSessions !== undefined ? Math.max(0, Number(data.freeSessions)) : 0,
    courseSessionsGranted: data.courseSessionsGranted || false,
    isPurchased: data.isPurchased || false,
    purchasedCourses: data.purchasedCourses || []
  };

  localStorage.setItem('userInfo', JSON.stringify(effectiveUserInfo));
  if (effectiveUserInfo.freeSessions !== undefined) {
    localStorage.setItem('freeSessions', String(effectiveUserInfo.freeSessions));
  }

  // 2. Sync Course Token & User
  const courseToken = data.courseToken || (data.token && data.purchasedCourses !== undefined ? data.token : null);
  if (courseToken) {
    localStorage.setItem('courseToken', courseToken);
  } else if (coachingToken) {
    // If only coaching token is returned, keep courseToken synced with token as fallback
    localStorage.setItem('courseToken', coachingToken);
  }

  localStorage.setItem('courseUser', JSON.stringify(effectiveUserInfo));

  if (data.isPurchased) {
    localStorage.setItem('isCoursePurchased', 'true');
  }

  if (Array.isArray(data.purchasedCourses) && data.purchasedCourses.length > 0) {
    localStorage.setItem('purchasedCourses', JSON.stringify(data.purchasedCourses));
  }

  // Dispatch synchronized events across all components
  window.dispatchEvent(new Event('auth-change'));
  window.dispatchEvent(new Event('course-auth-change'));
};

export const isAnyUserLoggedIn = () => {
  return !!(localStorage.getItem('token') || localStorage.getItem('courseToken'));
};

export const getEffectiveUser = () => {
  try {
    if (!isAnyUserLoggedIn()) return null;
    const raw = localStorage.getItem('userInfo') || localStorage.getItem('courseUser');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};
