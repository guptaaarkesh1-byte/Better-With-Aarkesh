// Centralized High-Performance Cloudinary CDN Assets
// Provides ultra-fast, globally cached WebP/AVIF delivery for all website imagery

export const CDN_IMAGES = {
  // Hero & Coach
  HERO_COACH: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791627191/better_with_aarkesh/hero/hero_portrait_aarkesh.png',
  HERO_MAIN: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791627191/better_with_aarkesh/hero/hero_portrait_aarkesh.png',
  INSTRUCTOR_AVATAR: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289654/better_with_aarkesh/client/public/instructor_avatar_3503.jpg',

  // Principles & Key Sections
  THINK_CLEARLY: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289681/better_with_aarkesh/client/src/assets/Page3/think-clearly_9629.png',
  FEEL_HONESTLY: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289687/better_with_aarkesh/client/src/assets/Page4/feel-honestly_6665.jpg',
  DECIDE_INTENTIONALLY: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289692/better_with_aarkesh/client/src/assets/Page5/decide-intentionally_1185.png',
  COACHING_PROCESS: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289659/better_with_aarkesh/client/src/assets/coaching-process_8570.png',
  COACHING_JOURNEY: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289703/better_with_aarkesh/client/src/assets/Page7/coaching-journey_2939.webp',

  // Meet Aarkesh / About
  ABOUT_PILOT: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289785/better_with_aarkesh/server/uploads/pilot_4154.webp',
  ABOUT_COACH: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289705/better_with_aarkesh/client/src/assets/Page8/Coach_4913.webp',
  ABOUT_HUMAN: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289707/better_with_aarkesh/client/src/assets/Page8/human_6915.webp',

  // Testimonials & Next Chapter
  TESTIMONIALS_DOORWAY: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289715/better_with_aarkesh/client/src/assets/Page9/testimonials-doorway_4204.webp',
  NEXT_CHAPTER_COZY: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289675/better_with_aarkesh/client/src/assets/Page10/next-chapter-cozy_4728.webp',
  PROBLEM_BOTTOM: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289677/better_with_aarkesh/client/src/assets/Page2/bottom_6752.webp',
  PROBLEM_SILHOUETTE: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289678/better_with_aarkesh/client/src/assets/Page2/problem_silhouette_7637.png',

  // Course & Library
  COURSE_HERO_BG: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289643/better_with_aarkesh/client/public/course_hero_bg_0506.jpg',
  LIBRARY_CELESTIAL: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289655/better_with_aarkesh/client/public/library_celestial_column_4421.jpg',
  LIBRARY_PREVIEW: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289656/better_with_aarkesh/client/public/library_preview_silhouette_5337.jpg',
  LIBRARY_DAY_BG: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289721/better_with_aarkesh/client/src/assets/PerspectivePage/BG/library_day_bg_0419.webp',
  EMPTY_LIBRARY_BG: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289669/better_with_aarkesh/client/src/assets/images/empty_library_bg_8993.webp',
  MY_JOURNEY_BG: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289671/better_with_aarkesh/client/src/assets/images/my-journey-bg_0883.webp',

  // Booking
  BOOKING_LAMP_BG: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289666/better_with_aarkesh/client/src/assets/images/booking_bg_lamp_6000.png',
  BOOKING_PAGE_HERO: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289657/better_with_aarkesh/client/src/assets/BookingPage/ChatGPT_Image_Jul_27__2026__02_28_05_PM_6462.png',

  // Perspective Recognition
  RECOGNITION_EMOTIONAL: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289727/better_with_aarkesh/client/src/assets/PerspectivePage/recognition/comparison_6604.webp',
  RECOGNITION_COMPARISON: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289726/better_with_aarkesh/client/src/assets/PerspectivePage/recognition/comparison_5551.jpg',
  RECOGNITION_HOLDING: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289734/better_with_aarkesh/client/src/assets/PerspectivePage/recognition/holding_it_in_3679.webp',
};

export const optimizeCloudinaryUrl = (url, width = 1920) => {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/q_auto')) return url;
  const transform = width ? `f_auto,q_auto,w_${width}` : 'f_auto,q_auto';
  return url.replace('/image/upload/', `/image/upload/${transform}/`);
};

/**
 * Returns a secure Cloudinary image URL or fallback
 */
export const getCdnImage = (key, fallback = '') => {
  if (!key) return fallback;
  if (key.startsWith('http://') || key.startsWith('https://')) return optimizeCloudinaryUrl(key);
  const src = CDN_IMAGES[key] || fallback;
  return optimizeCloudinaryUrl(src);
};

export default CDN_IMAGES;
