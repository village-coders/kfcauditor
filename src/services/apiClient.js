export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

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

