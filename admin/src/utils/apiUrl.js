export const API_URL = import.meta.env.VITE_API_URL || 
  ((import.meta.env.PROD || import.meta.env.MODE === 'production')
    ? 'https://api.aarkeshgupta.com'
    : (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : 'https://api.aarkeshgupta.com'));

export const LIVE_PRODUCTION_URL = 'https://aarkeshgupta.com';

export const CLIENT_URL = (() => {
  // 1. Explicit environment variable takes precedence
  if (import.meta.env.VITE_CLIENT_URL) {
    return import.meta.env.VITE_CLIENT_URL.replace(/\/+$/, '');
  }
  // 2. Production build mode always targets live production domain
  if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
    return LIVE_PRODUCTION_URL;
  }
  // 3. Deployed browser environments (non-localhost) always point to live site
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.includes('localhost')) {
      return LIVE_PRODUCTION_URL;
    }
  }
  // 4. Local development fallback
  return 'http://localhost:5173';
})();

export const getLiveSiteUrl = (path = '') => {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${CLIENT_URL}${cleanPath}`;
};

export default API_URL;
