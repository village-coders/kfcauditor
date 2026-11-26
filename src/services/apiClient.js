function normalizeApiBaseUrl(raw) {
  let base = String(raw || '').trim().replace(/\/+$/, '');
  if (!base) return 'http://localhost:5050/api';

  // If protocol is missing (e.g. "hfakfc-backend.onrender.com/api"), prepend https:// (or http:// for localhost)
  if (!/^https?:\/\//i.test(base) && !base.startsWith('/')) {
    const isLocal = /^(localhost|127\.0\.0\.1)(:|\/|$)/i.test(base);
    base = `${isLocal ? 'http' : 'https'}://${base}`;
  }

  // Ensure /api suffix if caller passed only the host (e.g. "https://hfakfc-backend.onrender.com")
  if (!/\/api$/i.test(base)) {
    base = `${base}/api`;
  }

  return base;
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

const SESSION_KEY = 'kfc_auditor_session';

function getAuthHeaders() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) : null;
    if (session?.token) {
      return { Authorization: `Bearer ${session.token}` };
    }
  } catch {
    // ignore
  }
  return {};
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
