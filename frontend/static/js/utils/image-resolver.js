// frontend/static/js/utils/image-resolver.js
// Single place to resolve a menu item's image URL.
// Prefer `image_url`, then common filename fields, otherwise return hero fallback.

export const resolveImageUrl = (item = {}) => {

  const FALLBACK_IMAGE = '/static/assets/fallback-image.jpeg';
  if (!item || typeof item !== 'object') return FALLBACK_IMAGE;


  // 1) Backend-provided full URL
  if (typeof item.image_url === 'string' && item.image_url.trim()) {
    return item.image_url;
  }

  // 2) Common candidate fields that may contain a filename or path
  const candidates = ['image', 'filename', 'img', 'imageName', 'photo', 'imgUrl', 'imagePath'];
  for (const key of candidates) {
    const value = item[key];
    if (!value) continue;
    if (typeof value === 'string') {
      // Already an absolute path or remote URL?
      if (value.startsWith('/') || value.startsWith('http')) return value;
      // Otherwise treat it as a filename stored under /static/assets/
      return `/static/assets/${encodeURIComponent(value)}`;
    }
  }

  // 3) Nothing found: return the same hero fallback used by the renderer
  return FALLBACK_IMAGE;
}