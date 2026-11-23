import { MOCK_AUDITORS } from '../data/mockAuditors';
import { apiRequest } from './apiClient';

const SESSION_KEY = 'kfc_auditor_session';
const SAVED_CREDENTIALS_KEY = 'kfc_auditor_remembered';

/**
 * Fetch assigned stores for an auditor by username from the shared hfaKfc-Backend.
 * Falls back to local MOCK_AUDITORS if the backend has no assignments for a demo user or is offline.
 */
export async function getAssignedStores(username) {
  if (!username || !username.trim()) {
    return { success: false, stores: [], message: 'Username is required' };
  }

  const cleanUsername = username.trim();
  const cleanKey = cleanUsername.toLowerCase();
  const mockFallback = MOCK_AUDITORS[cleanKey];

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

    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');

    return {
      success: false,
      stores: [],
      message: `No audit assigned to "${cleanUsername}" for today (${todayStr}).`
    };
  } catch {
    // Offline fallback
    if (mockFallback?.assignedStores?.length > 0) {
      return {
        success: true,
        auditorName: mockFallback.fullName,
        role: mockFallback.role,
        stores: mockFallback.assignedStores,
        message: `${mockFallback.assignedStores.length} assigned store(s) loaded (offline mode)`
      };
    }

    return {
      success: false,
      stores: [],
      message: `Unable to reach server and no offline assignment found for "${cleanUsername}".`
    };
  }
}

/**
 * Authenticate auditor login against hfaKfc-Backend (/api/auth/login).
 * Falls back to offline demo validation only if the backend server is unreachable.
 */
export async function loginAuditor({ username, store, password, rememberPassword }) {
  if (!username?.trim() || !store?.trim() || !password?.trim()) {
    return {
      success: false,
      message: 'All 3 fields (Username, Store, and Password) are required.'
    };
  }

  const cleanUsername = username.trim();
  const cleanKey = cleanUsername.toLowerCase();
  const mockAuditor = MOCK_AUDITORS[cleanKey];

  let backendUser = null;
  try {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: cleanUsername, password })
    });
    backendUser = res?.data || null;
  } catch (err) {
    // If backend explicitly rejected credentials (401/400), return that error
    if (err.status === 401 || err.status === 400) {
      return {
        success: false,
        message: err.message || 'Invalid username or password.'
      };
    }
    // Otherwise backend is offline — allow demo fallback if password >= 4 chars
    if (password.length < 4) {
      return {
        success: false,
        message: 'Password must be at least 4 characters long.'
      };
    }
  }

  // Resolve selected store details from today's backend assignment
  let availableStores = [];
  let backendReachable = false;
  try {
    const storeRes = await apiRequest(`/assignments/auditor/${encodeURIComponent(cleanUsername)}`);
    backendReachable = true;
    if (Array.isArray(storeRes?.data)) {
      availableStores = storeRes.data;
    }
  } catch {
    availableStores = mockAuditor?.assignedStores || [];
  }

  if (backendReachable && availableStores.length === 0) {
    return {
      success: false,
      message: `No audit is assigned to "${cleanUsername}" for today. Login is only permitted on the allocated audit date.`
    };
  }

  const selectedStore = availableStores.find(
    (s) =>
      s.shortName?.toLowerCase() === store.toLowerCase() ||
      String(s.id) === String(store) ||
      s.name?.toLowerCase() === store.toLowerCase()
  );

  if (backendReachable && !selectedStore) {
    return {
      success: false,
      message: `Store "${store}" is not assigned to "${cleanUsername}" for today.`
    };
  }

  const resolvedStore = selectedStore || {
    id: 'custom-store',
    name: store,
    shortName: store,
    code: 'KFC-LOC-AUDIT',
    region: 'Assigned Region'
  };

  const userSession = {
    id: backendUser?.id || cleanKey,
    token: backendUser?.token || '',
    username: backendUser?.username || mockAuditor?.username || cleanUsername,
    fullName: backendUser?.fullName || mockAuditor?.fullName || cleanUsername,
    role: backendUser?.role || mockAuditor?.role || 'KFC Store Auditor',
    email: backendUser?.email || '',
    currentStore: resolvedStore,
    auditSchedule: resolvedStore?.session || 'General Halal & Hygiene Audit',
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
