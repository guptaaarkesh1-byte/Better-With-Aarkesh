import { API_URL } from './apiUrl';
import { CDN_IMAGES, getCdnImage } from './cdnAssets';

export function resolveImageUrl(url, fallback = '') {
  // If no url, use Cloudinary fallback or standard fallback
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return getCdnImage(fallback, fallback);
  }

  const trimmed = url.trim();

  // Already a full Cloudinary / external URL
  if (trimmed.startsWith('https://res.cloudinary.com/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    if (trimmed.includes('localhost:5000/uploads/')) {
      const filename = trimmed.split('/uploads/')[1];
      const cdnUrl = getCdnImage(filename);
      if (cdnUrl) return cdnUrl;
      return trimmed.replace('http://localhost:5000/uploads/', `${API_URL}/uploads/`);
    }
    return trimmed;
  }

  // Check if filename exists in Cloudinary CDN mapping
  const baseName = trimmed.replace(/^\/?(uploads\/)?/, '');
  const cdnUrl = getCdnImage(baseName) || getCdnImage(trimmed);
  if (cdnUrl) {
    return cdnUrl;
  }

  if (trimmed.startsWith('/uploads/')) {
    return `${API_URL}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    return `${API_URL}/${trimmed}`;
  }
  
  return getCdnImage(fallback, trimmed);
}

