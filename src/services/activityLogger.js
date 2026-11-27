import { apiRequest } from './apiClient';

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

function getPositionOnce(options) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function fetchWithTimeout(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function reverseGeocode(lat, lng) {
  // 1. OpenStreetMap Nominatim for exact real street / area / town / postcode / country anywhere
  const osmData = await fetchWithTimeout(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18`,
    3500
  );
  if (osmData?.address) {
    const a = osmData.address;
    const street = [a.house_number, a.road || a.pedestrian || a.neighbourhood || a.suburb].filter(Boolean).join(' ');
    const city = a.city || a.town || a.village || a.borough || a.county || '';
    const parts = [street, city, a.postcode, a.country_code ? a.country_code.toUpperCase() : ''].filter(Boolean);
    if (parts.length > 0) {
      return {
        address: parts.join(', '),
        postcode: a.postcode || ''
      };
    }
  }

  // 2. UK ONS Postcodes API fallback for UK coordinates
  if (lat >= 49.5 && lat <= 61.0 && lng >= -8.5 && lng <= 2.0) {
    const ukData = await fetchWithTimeout(
      `https://api.postcodes.io/postcodes?lon=${encodeURIComponent(lng)}&lat=${encodeURIComponent(lat)}&limit=1`,
      3000
    );
    const ukMatch = Array.isArray(ukData?.result) && ukData.result[0] ? ukData.result[0] : null;
    if (ukMatch) {
      const parts = [ukMatch.admin_ward, ukMatch.admin_district, ukMatch.postcode].filter(Boolean);
      return {
        address: parts.join(', '),
        postcode: ukMatch.postcode || ''
      };
    }
  }

  return {
    address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    postcode: ''
  };
}

/**
 * Captures a fresh, high-accuracy GPS fix from the auditor's device and
 * reverse-geocodes it into a readable location/postcode. Never fabricates coordinates.
 */
export async function captureAccurateLocation({ forceFresh = true, timeoutMs = 9000 } = {}) {
  const capturedAt = new Date().toISOString();
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return {
      lat: null,
      lng: null,
      accuracy: null,
      address: '',
      postcode: '',
      source: 'unavailable',
      capturedAt
    };
  }

  let pos = null;
  try {
    pos = await getPositionOnce({
      enableHighAccuracy: true,
      timeout: timeoutMs,
      maximumAge: forceFresh ? 0 : 15000
    });
  } catch {
    // Graceful second attempt using network/Wi-Fi geolocation if GPS satellite lock timed out indoors
    try {
      pos = await getPositionOnce({
        enableHighAccuracy: false,
        timeout: 4500,
        maximumAge: 30000
      });
    } catch {
      pos = null;
    }
  }

  if (!pos?.coords) {
    return {
      lat: null,
      lng: null,
      accuracy: null,
      address: '',
      postcode: '',
      source: 'unavailable',
      capturedAt
    };
  }

  const lat = Number(pos.coords.latitude.toFixed(6));
  const lng = Number(pos.coords.longitude.toFixed(6));
  const accuracy = Number.isFinite(pos.coords.accuracy) ? Math.round(pos.coords.accuracy) : null;
  const geo = await reverseGeocode(lat, lng);

  return {
    lat,
    lng,
    accuracy,
    address: geo.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    postcode: geo.postcode || '',
    source: 'gps',
    capturedAt
  };
}

/**
 * Non-blocking logger that records auditor login/logout, start/end audit timestamps,
 * accurate GPS coordinates & accuracy, reverse-geocoded location, device, and IP to /api/map/logs.
 */
export async function logAuditorActivity({
  auditor,
  storeName,
  branchCode = '',
  auditAppId = '',
  activity,
  eventType = 'milestone',
  session = 'Round Three 2026',
  startTime = '',
  endTime = '',
  capturedLocation = null
}) {
  if (!auditor || !activity) return;
  try {
    const loc =
      capturedLocation ||
      (await captureAccurateLocation({
        forceFresh: eventType === 'start' || eventType === 'end' || eventType === 'login' || eventType === 'logout',
        timeoutMs: eventType === 'start' || eventType === 'end' ? 8000 : 4000
      }));

    const now = new Date();
    const dateStr = formatLogDate(now);
    const timeStr = formatLogTime(now);
    const hasCoords = Number.isFinite(loc?.lat) && Number.isFinite(loc?.lng);
    const locationLabel = loc?.address || (hasCoords ? `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}` : '');
    const gpsSource = hasCoords ? (loc.source || 'gps') : 'unavailable';

    const isStart = eventType === 'start' || eventType === 'login';
    const isEnd = eventType === 'end' || eventType === 'logout';

    const payload = {
      auditor,
      storeName: storeName || 'KFC Store',
      branchCode,
      auditAppId,
      date: dateStr,
      time: (isEnd ? endTime : isStart ? startTime : '') || timeStr,
      activity,
      eventType,
      session,
      device: getDeviceSummary(),
      lat: hasCoords ? loc.lat : null,
      lng: hasCoords ? loc.lng : null,
      accuracy: loc?.accuracy ?? null,
      gpsSource,
      location: locationLabel,
      ...(isStart
        ? {
            startTime: startTime || timeStr,
            startDate: dateStr,
            startLat: hasCoords ? loc.lat : null,
            startLng: hasCoords ? loc.lng : null,
            startAccuracy: loc?.accuracy ?? null,
            startLocation: locationLabel,
            startGpsSource: gpsSource
          }
        : {}),
      ...(isEnd
        ? {
            endTime: endTime || timeStr,
            endDate: dateStr,
            endLat: hasCoords ? loc.lat : null,
            endLng: hasCoords ? loc.lng : null,
            endAccuracy: loc?.accuracy ?? null,
            endLocation: locationLabel,
            endGpsSource: gpsSource
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
