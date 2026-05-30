const OSRM_BASE = 'https://router.project-osrm.org';
const cache = new Map();

const PROFILE_MAP = { walking: 'foot', bike: 'bicycle', car: 'driving', motorcycle: 'driving' };
const SPEED_ADJUST = { walking: 1.0, bike: 1.0, car: 1.0, motorcycle: 0.7 };
const SPEED_MS = { walking: 1.4, bike: 4.2, car: 11.1, motorcycle: 13.9 };
const ROAD_FACTOR = { walking: 1.3, bike: 1.5, car: 1.6, motorcycle: 1.6 };
const MODE_LABELS = {
  walking: { label: 'Caminando' },
  bike: { label: 'Bicicleta' },
  car: { label: 'Carro' },
  motorcycle: { label: 'Moto' },
};

export function getTrafficFactor() {
  const h = new Date().getHours(), d = new Date().getDay();
  if (d === 0 || d === 6) return 0.7;
  if (h >= 7 && h < 9) return 1.5;
  if (h >= 12 && h < 14) return 1.2;
  if (h >= 17 && h < 19) return 1.6;
  if (h >= 20 || h < 6) return 0.8;
  return 1.0;
}

export function getTrafficLabel(f) {
  if (f >= 1.5) return { text: 'Tráfico Pesado', color: '#DC2626' };
  if (f >= 1.2) return { text: 'Tráfico Moderado', color: '#F59E0B' };
  if (f <= 0.8) return { text: 'Vía Despejada', color: '#16A34A' };
  return { text: 'Tráfico Normal', color: '#3B82F6' };
}

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchOSRM(lat1, lng1, lat2, lng2, profile) {
  const key = `${profile}:${lat1.toFixed(4)},${lng1.toFixed(4)}-${lat2.toFixed(4)},${lng2.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key);

  const url = `${OSRM_BASE}/route/v1/${profile}/${lng1},${lat1};${lng2},${lat2}?geometries=geojson&overview=full`;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const d = await res.json();
    if (!d.routes?.length) return null;
    const r = {
      coords: d.routes[0].geometry.coordinates.map(c => [c[1], c[0]]),
      dist: d.routes[0].distance,
      dur: d.routes[0].duration,
    };
    if (cache.size < 500) cache.set(key, r);
    return r;
  } catch { return null; }
}

export async function enrichPathWithGeometry(path, mode, graph) {
  const profile = PROFILE_MAP[mode] || 'driving';
  const adj = SPEED_ADJUST[mode] || 1.0;
  const speedMs = SPEED_MS[mode] || 1.4;
  const tf = (mode === 'car' || mode === 'motorcycle') ? getTrafficFactor() : 1.0;

  const startN = graph.getNode(path[0].from);
  const endN = graph.getNode(path[path.length - 1].to);

  const osrm = await fetchOSRM(startN.lat, startN.lng, endN.lat, endN.lng, profile);

  let allCoords, totalDist, totalDur;

  if (osrm) {
    allCoords = osrm.coords;
    totalDist = osrm.dist;
    totalDur = Math.round(osrm.dur * adj * tf);
  } else {
    allCoords = [];
    totalDist = 0;
    totalDur = 0;
    const rf = ROAD_FACTOR[mode] || 1.5;
    for (let i = 0; i < path.length; i++) {
      const fn = graph.getNode(path[i].from);
      const tn = graph.getNode(path[i].to);
      const d = haversineM(fn.lat, fn.lng, tn.lat, tn.lng);
      const roadDist = d * rf;
      totalDist += roadDist;
      totalDur += Math.round((roadDist / speedMs) * tf);
      allCoords.push([fn.lat, fn.lng]);
      if (i === path.length - 1) allCoords.push([tn.lat, tn.lng]);
    }
  }

  const segs = [];
  let distSum = 0, durSum = 0;
  for (let i = 0; i < path.length; i++) {
    const fn = graph.getNode(path[i].from);
    const tn = graph.getNode(path[i].to);
    const dd = haversineM(fn.lat, fn.lng, tn.lat, tn.lng);
    distSum += dd;
    const ratio = distSum > 0 ? dd / distSum : 1 / path.length;
    segs.push({ ...path[i], geometry: [], distanceMeters: Math.round(totalDist * ratio), durationSecs: Math.round(totalDur * ratio), trafficFactor: tf });
    if (i === path.length - 1) { distSum = 0; }
  }

  return { segments: segs, totalDistanceMeters: Math.round(totalDist), totalDurationSecs: totalDur, allCoords };
}

export function formatDuration(s) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}min`;
}

export function formatDistance(m) {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

export { MODE_LABELS, PROFILE_MAP };
