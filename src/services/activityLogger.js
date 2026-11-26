import { apiRequest } from './apiClient';

let cachedCoords = null;

function formatLogDate(d = new Date()) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

function formatLogTime(d = new Date()) {
  return d.toTimeString().split(' ')[0];
}

function getDeviceSummary() {
  if (typeof navigator === 'undefined') return 'Web Client';
  const ua = navigator.userAgent || '';
  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  let os = platform || 'Unknown OS';
  if (/Windows NT 10/i.test(ua)) os = 'Microsoft Windows NT 10.0';
  else if (/Android/i.test(ua)) os = 'Android Mobile';
  else if (/iPhone|iPad/i.test(ua)) os = 'Apple iOS';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';

  return `${os} (${browser})`;
}

function tryGetCoords() {
  if (cachedCoords) return Promise.resolve(cachedCoords);
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 1800);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        cachedCoords = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5))
        };
        resolve(cachedCoords);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { maximumAge: 60000, timeout: 1500, enableHighAccuracy: false }
    );
  });
}

/**
 * Non-blocking logger that records auditor login/logout and audit milestones
 * (with GPS location, device, and server-captured IP address) to /api/map/logs.
 */
export async function logAuditorActivity({
  auditor,
  storeName,
  branchCode = '',
  auditAppId = '',
  activity,
  session = 'Round Three 2026'
}) {
  if (!auditor || !activity) return;
  try {
    const coords = await tryGetCoords();
    const now = new Date();
    const payload = {
      auditor,
      storeName: storeName || 'KFC Store',
      branchCode,
      auditAppId,
      date: formatLogDate(now),
      time: formatLogTime(now),
      activity,
      session,
      device: getDeviceSummary(),
      ...(coords
        ? {
            lat: coords.lat,
            lng: coords.lng,
            location: `GPS Location: ${coords.lat},${coords.lng}`
          }
        : {})
    };
    await apiRequest('/map/logs', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch {
    // Non-blocking: never interrupt the auditor workflow if telemetry fails
  }
}
