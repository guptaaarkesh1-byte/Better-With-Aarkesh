export function resolveImageUrl(url, fallback = '') {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';
  
  if (url.includes('localhost:5000/uploads/')) {
    return url.replace('http://localhost:5000/uploads/', `${apiUrl}/uploads/`);
  }
  
  if (url.startsWith('/uploads/')) {
    return `${apiUrl}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${apiUrl}/${url}`;
  }
  
  return url;
}
