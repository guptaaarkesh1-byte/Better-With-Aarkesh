/**
 * Sanitizes rich-text HTML content by stripping broken, empty, or ghost image tags
 * copied from clipboard/rich-text tools like Microsoft Word or Google Docs.
 */
export const sanitizeDocumentHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  let cleaned = html;

  // 1. Remove ghost images with file://, msohtmlclip, empty, missing, or fake URLs
  cleaned = cleaned.replace(/<img[^>]*src=["'](?:file:\/\/[^"']*|msohtmlclip[^"']*|webkit-fake-url:[^"']*|blob:[^"']*|data:image\/[^"']*placeholder[^"']*|about:blank|)["'][^>]*>/gi, '');
  cleaned = cleaned.replace(/<img[^>]*src=["'][^"']*msohtmlclip[^"']*["'][^>]*>/gi, '');
  cleaned = cleaned.replace(/<img[^>]*src=["'][^"']*file:\/\/[^"']*["'][^>]*>/gi, '');
  cleaned = cleaned.replace(/<img(?![^>]*\bsrc=)[^>]*>/gi, '');
  cleaned = cleaned.replace(/<img[^>]*src=["']\s*["'][^>]*>/gi, '');

  // 2. Remove invisible 1x1 or 2px spacer PNGs copied from Word/Office suites
  cleaned = cleaned.replace(/<img[^>]*height=["'](?:0|1|2)["'][^>]*>/gi, '');
  cleaned = cleaned.replace(/<img[^>]*width=["'](?:0|1)["'][^>]*>/gi, '');
  cleaned = cleaned.replace(/<img[^>]*style=["'][^"']*(?:width:\s*0|height:\s*0|display:\s*none)[^"']*["'][^>]*>/gi, '');

  return cleaned;
};

export default sanitizeDocumentHtml;
