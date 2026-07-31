const API_BASE = import.meta.env.VITE_API_URL || '';
export const API_URL = API_BASE
  ? `${API_BASE.replace(/\/$/, '')}/api`
  : '/api';
export const UPLOAD_BASE = API_BASE.replace(/\/$/, '') || '';

export const resolveUploadUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${UPLOAD_BASE}${url.startsWith('/') ? url : `/${url}`}`;
};
