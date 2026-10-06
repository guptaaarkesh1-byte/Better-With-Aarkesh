export const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://api.aarkeshgupta.com');

export default API_URL;
