export const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://api.aarkeshgupta.com');

export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 
  (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5173'
    : 'https://aarkeshgupta.com');

export const getLiveSiteUrl = (path = '') => {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${CLIENT_URL}${cleanPath}`;
};

export default API_URL;
