import { INTERSECTION_INDEX, STREET_INDEX, NODES, EDGES, ZONES, normalizeStreetName } from '../data/generate-popayan.js';
import { CATEGORY_ICONS, CATEGORY_LABELS, searchLandmarks } from '../data/popayan-landmarks.js';
import { searchAddress } from './nominatimService.js';

const NODE_MAP = {};
for (const n of NODES) NODE_MAP[n.id] = n;

const ZONE_INDEX = [];
for (const z of ZONES) {
  const entry = NODES.find(n => n.zone === z.name);
  if (entry) ZONE_INDEX.push({ sanitized: sanitize(z.name), node: entry, zone: z });
}

function sanitize(q) {
  return q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

function preprocess(query) {
  let q = sanitize(query);

  q = q.replace(/\bcll\b\.?/gi, 'calle');
  q = q.replace(/\bkr\b\.?/gi, 'carrera');
  q = q.replace(/\bcra\b\.?(?=\s*\d)/gi, 'carrera');
  q = q.replace(/\bcr\b\.?(?=\s*\d)/gi, 'carrera');
  q = q.replace(/\bav\b\.?(?=\s)/gi, 'avenida');
  q = q.replace(/\bdg\b\.?(?=\s)/gi, 'diagonal');
  q = q.replace(/\btv\b\.?(?=\s)/gi, 'transversal');
  q = q.replace(/\bcv\b\.?(?=\s)/gi, 'circunvalar');

  return q;
}

function normalizeStreet(street) {
  let s = street
    .replace(/calle\s+/i, 'calle ')
    .replace(/carrera\s+/i, 'cra ')
    .replace(/\bnorte\b/gi, 'n ')
    .replace(/\bsur\b/gi, 's ')
    .replace(/\beste\b/gi, 'e ')
    .replace(/\boeste\b/gi, 'o ')
    .replace(/\s+(n|s|e|o)(?=\s|$)/gi, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return s;
}

function parseColombianQuery(raw) {
  const q = preprocess(raw);
  const streets = { calles: [], carreras: [], others: [] };

  const calleHashCraRe = /calle\s*(\d+[a-nA-N]?)\s*(norte|sur|este|oeste|n|s|e|o)?\s*#\s*(\d+[a-nA-N]?)\s*(-\s*\d+)?/gi;
  const craHashCalleRe = /carrera\s*(\d+[a-nA-N]?)\s*(norte|sur|este|oeste|n|s|e|o)?\s*#\s*(\d+[a-nA-N]?)\s*(-\s*\d+)?/gi;

  let m;
  while ((m = calleHashCraRe.exec(q)) !== null) {
    streets.calles.push(normalizeStreet(`calle ${m[1]}${m[2] ? ' ' + m[2] : ''}`));
    streets.carreras.push(normalizeStreet(`cra ${m[3]}`));
  }
  while ((m = craHashCalleRe.exec(q)) !== null) {
    streets.carreras.push(normalizeStreet(`cra ${m[1]}${m[2] ? ' ' + m[2] : ''}`));
    streets.calles.push(normalizeStreet(`calle ${m[3]}`));
  }

  if (streets.calles.length === 0 && streets.carreras.length === 0) {
    const calleRe = /calle\s*(\d+[a-nA-N]?)\s*(norte|sur|este|oeste|n|s|e|o)?/gi;
    const craRe = /carrera\s*(\d+[a-nA-N]?)\s*(norte|sur|este|oeste|n|s|e|o)?/gi;
    const avRe = /(?:avenida)\s*(\d*\s*[a-zA-Z]+(?:\s+\d+)?)/gi;
    const otherRe = /(?:diagonal|transversal|circunvalar|variante|autopista|camino|via|vía)\s*[\da-zA-Z\s]+/gi;

    while ((m = calleRe.exec(q)) !== null) streets.calles.push(normalizeStreet(`calle ${m[1]}${m[2] ? ' ' + m[2] : ''}`));
    while ((m = craRe.exec(q)) !== null) streets.carreras.push(normalizeStreet(`cra ${m[1]}${m[2] ? ' ' + m[2] : ''}`));
    while ((m = avRe.exec(q)) !== null) streets.others.push(m[0]);
    while ((m = otherRe.exec(q)) !== null) streets.others.push(m[0]);
  }

  return streets;
}

function mergeStreetNames(calles, carreras) {
  const results = [];

  if (calles.length > 0 && carreras.length > 0) {
    for (const c of calles) {
      for (const cr of carreras) {
        results.push({ type: 'intersection', calle: c, carrera: cr });
      }
    }
  } else if (calles.length > 0) {
    for (const c of calles) {
      results.push({ type: 'street', street: c, kind: 'calle' });
    }
  } else if (carreras.length > 0) {
    for (const cr of carreras) {
      results.push({ type: 'street', street: cr, kind: 'carrera' });
    }
  }

  return results;
}

function lookupIntersection(calle, carrera) {
  const key1 = `${normalizeStreetName(calle)} & ${normalizeStreetName(carrera)}`;
  const key2 = `${normalizeStreetName(carrera)} & ${normalizeStreetName(calle)}`;

  let entries = INTERSECTION_INDEX.get(key1) || INTERSECTION_INDEX.get(key2) || [];

  const seen = new Set();
  const unique = [];
  for (const e of entries) {
    if (!seen.has(e.nodeId)) {
      seen.add(e.nodeId);
      unique.push(e);
    }
  }

  return unique.slice(0, 5).map((e) => ({
    id: e.nodeId,
    name: e.name,
    zone: e.zone,
    lat: e.lat,
    lng: e.lng,
    icon: '📍',
    isIntersection: true,
  }));
}

function lookupStreet(street) {
  const norm = normalizeStreetName(street);
  let entries = STREET_INDEX.get(norm) || [];

  const seen = new Set();
  const unique = [];
  for (const e of entries) {
    if (!seen.has(e.nodeId)) {
      seen.add(e.nodeId);
      unique.push(e);
    }
  }

  return unique.slice(0, 8).map((e) => ({
    id: e.nodeId,
    name: e.name,
    zone: e.zone,
    lat: e.lat,
    lng: e.lng,
    icon: '📍',
    isStreet: true,
    street: e.street,
  }));
}

function lookupPartialStreet(query) {
  const q = sanitize(query);
  const results = [];

  for (const [norm, entries] of STREET_INDEX) {
    if (norm.includes(q)) {
      const seen = new Set();
      for (const e of entries) {
        if (seen.has(e.nodeId)) continue;
        seen.add(e.nodeId);
        results.push({
          id: e.nodeId, name: e.name, zone: e.zone, lat: e.lat, lng: e.lng,
          icon: '📍', isStreet: true, street: e.street,
        });
        if (results.length >= 8) break;
      }
    }
    if (results.length >= 8) break;
  }

  return results;
}

function lookupLandmarks(query) {
  const q = sanitize(query);
  return searchLandmarks(q).slice(0, 8).map((l) => ({
    id: l.id,
    name: l.name,
    zone: CATEGORY_LABELS[l.category] || l.category,
    lat: l.lat,
    lng: l.lng,
    icon: CATEGORY_ICONS[l.category] || '📍',
    isLandmark: true,
    landmarkId: l.id,
    category: l.category,
  }));
}

function lookupZones(query) {
  const q = sanitize(query);
  const results = [];

  for (const entry of ZONE_INDEX) {
    if (entry.sanitized.includes(q)) {
      results.push({
        id: entry.node.id,
        name: entry.zone.name,
        zone: entry.zone.name,
        lat: entry.node.lat,
        lng: entry.node.lng,
        icon: '🏘️',
        isZone: true,
      });
      if (results.length >= 5) break;
    }
  }

  return results;
}

function snapToNearestEdge(lat, lng) {
  let bestEdge = null;
  let bestDist = Infinity;
  let nearestEndpoint = null;

  for (const edge of EDGES) {
    const a = NODE_MAP[edge.from];
    const b = NODE_MAP[edge.to];
    if (!a || !b) continue;

    const dx = b.lng - a.lng;
    const dy = b.lat - a.lat;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;

    let t = ((lng - a.lng) * dx + (lat - a.lat) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const projLng = a.lng + t * dx;
    const projLat = a.lat + t * dy;

    const dLng = lng - projLng;
    const dLat = lat - projLat;
    const dist = dLng * dLng + dLat * dLat;

    if (dist < bestDist) {
      bestDist = dist;
      bestEdge = edge;
      nearestEndpoint = t < 0.5 ? edge.from : edge.to;
    }
  }

  if (!nearestEndpoint) return null;

  const node = NODE_MAP[nearestEndpoint];
  return {
    nodeId: nearestEndpoint,
    edge: bestEdge,
    node,
  };
}

async function nominatimFallback(query) {
  try {
    const addresses = await searchAddress(query);
    if (!addresses || addresses.length === 0) return [];

    return addresses.map((addr) => {
      const snapped = snapToNearestEdge(addr.lat, addr.lng);
      return {
        id: snapped ? snapped.nodeId : NODES[0]?.id || 'n0',
        name: addr.name,
        zone: addr.type || '',
        lat: addr.lat,
        lng: addr.lng,
        icon: addr.icon || '📍',
        isNominatim: true,
      };
    });
  } catch {
    return [];
  }
}

export async function unifiedSearch(query) {
  if (!query || query.length < 2) return [];

  const q = sanitize(query);
  const results = [];

  const parsed = parseColombianQuery(q);
  const streetQueries = mergeStreetNames(parsed.calles, parsed.carreras);

  for (const sq of streetQueries) {
    if (sq.type === 'intersection') {
      const hits = lookupIntersection(sq.calle, sq.carrera);
      results.push(...hits);
    } else if (sq.type === 'street') {
      const hits = lookupStreet(sq.street);
      results.push(...hits);
    }
  }

  if (results.length > 0) return deduplicate(results).slice(0, 15);

  for (const sq of streetQueries) {
    if (sq.type === 'intersection') {
      const calleHits = lookupStreet(sq.calle);
      const craHits = lookupStreet(sq.carrera);
      results.push(...calleHits, ...craHits);
    }
  }

  if (results.length > 0) return deduplicate(results).slice(0, 15);

  const partial = lookupPartialStreet(q);
  if (partial.length > 0) {
    results.push(...partial);
    return deduplicate(results).slice(0, 15);
  }

  const landmarks = lookupLandmarks(q);
  if (landmarks.length > 0) {
    for (const lm of landmarks) {
      const snapped = snapToNearestEdge(lm.lat, lm.lng);
      if (snapped) {
        lm.id = snapped.nodeId;
        lm.lat = snapped.node.lat;
        lm.lng = snapped.node.lng;
      }
    }
    results.push(...landmarks);
    return deduplicate(results).slice(0, 15);
  }

  const nominatim = await nominatimFallback(q);
  if (nominatim.length > 0) {
    results.push(...nominatim);
    return deduplicate(results).slice(0, 15);
  }

  const zones = lookupZones(q);
  if (zones.length > 0) {
    results.push(...zones);
    return deduplicate(results).slice(0, 15);
  }

  return [];
}

function deduplicate(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.landmarkId || item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export { snapToNearestEdge };
