import { apiRequest } from './apiClient';

const SESSION_KEY = 'kfc_auditor_session';
const SAVED_CREDENTIALS_KEY = 'kfc_auditor_remembered';

/**
 * Fetch stores assigned to an auditor for today's date from hfaKfc-Backend.
 */
export async function getAssignedStores(username) {
  if (!username || !username.trim()) {
    return { success: false, stores: [], message: 'Username is required' };
  }

  const cleanUsername = username.trim();

  try {
    const res = await apiRequest(`/assignments/auditor/${encodeURIComponent(cleanUsername)}`);
    const backendStores = Array.isArray(res?.data) ? res.data : [];

    if (backendStores.length > 0) {
      return {
        success: true,
        auditorName: cleanUsername,
        role: 'KFC Store Auditor',
        stores: backendStores,
        message: `${backendStores.length} store(s) assigned for today`
      };
    }

    const todayStr = new Date()
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      .replace(/ /g, '-');

    return {
      success: false,
      stores: [],
      message: `No active audit window for "${cleanUsername}" on ${todayStr}. Login is only allowed between your assigned beginning and ending dates.`
    };
  } catch {
    return {
      success: false,
      stores: [],
      message: 'Unable to reach assignment server.'
    };
  }
}

/**
 * Authenticate auditor login against hfaKfc-Backend (/api/auth/login)
 * and verify the selected store is assigned for today's date.
 */
export async function loginAuditor({ username, store, password, rememberPassword }) {
  if (!username?.trim() || !store?.trim() || !password?.trim()) {
    return {
      success: false,
      message: 'All 3 fields (Username, Store, and Password) are required.'
    };
  }

  const cleanUsername = username.trim();

  let backendUser = null;
  try {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: cleanUsername, password })
    });
    backendUser = res?.data || null;
  } catch (err) {
    if (err.status === 401 || err.status === 400) {
      return {
        success: false,
        message: err.message || 'Invalid username or password.'
      };
    }
    return {
      success: false,
      message: 'Authentication server unreachable.'
    };
  }

  let availableStores = [];
  try {
    const storeRes = await apiRequest(`/assignments/auditor/${encodeURIComponent(cleanUsername)}`);
    if (Array.isArray(storeRes?.data)) {
      availableStores = storeRes.data;
    }
  } catch {
    return {
      success: false,
      message: 'Unable to verify today’s store assignment.'
    };
  }

  if (availableStores.length === 0) {
    return {
      success: false,
      message: `No audit is active for "${cleanUsername}" today. Login is only permitted between your assigned beginning and ending dates.`
    };
  }

  const selectedStore = availableStores.find(
    (s) =>
      s.shortName?.toLowerCase() === store.toLowerCase() ||
      String(s.id) === String(store) ||
      s.name?.toLowerCase() === store.toLowerCase()
  );

  if (!selectedStore) {
    return {
      success: false,
      message: `Store "${store}" is not assigned to "${cleanUsername}" for today.`
    };
  }

  const userSession = {
    id: backendUser?.id || cleanUsername.toLowerCase(),
    token: backendUser?.token || '',
    username: backendUser?.username || cleanUsername,
    fullName: backendUser?.fullName || cleanUsername,
    role: backendUser?.role || 'KFC Store Auditor',
    email: backendUser?.email || '',
    currentStore: selectedStore,
    auditSchedule: selectedStore?.session || 'Halal & Hygiene Audit',
    loginTime: new Date().toISOString()
  };

  if (rememberPassword) {
    localStorage.setItem(
      SAVED_CREDENTIALS_KEY,
      JSON.stringify({
        username: cleanUsername,
        store: store.trim(),
        remember: true
      })
    );
  } else {
    localStorage.removeItem(SAVED_CREDENTIALS_KEY);
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));

  return {
    success: true,
    user: userSession
  };
}

export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getSavedCredentials() {
  try {
    const raw = localStorage.getItem(SAVED_CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutAuditor() {
  localStorage.removeItem(SESSION_KEY);
}
