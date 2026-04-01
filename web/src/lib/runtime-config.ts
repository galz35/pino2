const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const ensureLeadingSlash = (value: string) => {
  if (!value) {
    return '/';
  }

  return value.startsWith('/') ? value : `/${value}`;
};

const normalizeBasePath = (value?: string) => {
  const normalized = stripTrailingSlash(ensureLeadingSlash(value || '/dev'));
  return normalized === '' ? '/' : normalized;
};

const resolveAgainstOrigin = (value: string, fallbackPath: string) => {
  const candidate = (value || fallbackPath).trim();

  if (typeof window === 'undefined') {
    return candidate;
  }

  if (/^https?:\/\//i.test(candidate)) {
    return stripTrailingSlash(candidate);
  }

  return stripTrailingSlash(new URL(candidate, window.location.origin).toString());
};

export const APP_BASENAME = normalizeBasePath(import.meta.env.VITE_APP_BASENAME);
export const API_BASE_URL = resolveAgainstOrigin(import.meta.env.VITE_API_URL || '/api-dev', '/api-dev');
export const SOCKET_URL = resolveAgainstOrigin(import.meta.env.VITE_SOCKET_URL || '/events', '/events');
export const SOCKET_PATH = ensureLeadingSlash(import.meta.env.VITE_SOCKET_PATH || '/api-dev/socket.io');

export const withAppBase = (path = '/') => {
  const normalizedPath = ensureLeadingSlash(path);

  if (APP_BASENAME === '/' || APP_BASENAME === '') {
    return normalizedPath;
  }

  if (normalizedPath === '/') {
    return APP_BASENAME;
  }

  return `${APP_BASENAME}${normalizedPath}`;
};
