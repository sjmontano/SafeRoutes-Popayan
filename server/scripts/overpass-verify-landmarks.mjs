import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'src', 'data');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function normalizeName(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

async function queryOverpass(overpassQl) {
  const url = `${OVERPASS_URL}?data=${encodeURIComponent(overpassQl)}`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'SafeRoutesPopayan/1.0', 'Accept': 'application/json' },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Overpass ${resp.status}: ${text.slice(0, 200)}`);
  }
  return resp.json();
}

const { LANDMARKS: ORIG_LANDMARKS } = await import(url(join(dataDir, 'popayan-landmarks.js')));

const LANDMARKS = ORIG_LANDMARKS.map(l => ({ ...l }));

const R = 500;

function buildBatchQuery(landmarks, startIdx, count) {
  const parts = [];
  const batch = landmarks.slice(startIdx, startIdx + count);
  for (const lm of batch) {
    const nameEscaped = escapeRegex(lm.name);
    parts.push(`  nwr(around:${R}, ${lm.lat}, ${lm.lng})["name"~"${nameEscaped}", i];`);
  }
  return `[out:json][timeout:120];(\n${parts.join('\n')}\n);out center qt;`;
}

function scoreNameMatch(osmName, landmarkName) {
  const os = normalizeName(osmName);
  const lm = normalizeName(landmarkName);
  if (os === lm) return 1.0;
  const lmWords = lm.split(/\s+/).filter(Boolean);
  const matched = lmWords.filter(w => os.includes(w)).length;
  return matched / lmWords.length;
}

async function verifyAll() {
  const updates = [];
  const BATCH = 15;
  const DELAY_MS = 3000;

  for (let i = 0; i < LANDMARKS.length; i += BATCH) {
    const q = buildBatchQuery(LANDMARKS, i, BATCH);
    console.log(`Querying batch ${Math.floor(i/BATCH)+1}/${Math.ceil(LANDMARKS.length/BATCH)} (landmarks ${i+1}-${Math.min(i+BATCH, LANDMARKS.length)})...`);

    let data;
    try {
      data = await queryOverpass(q);
    } catch (err) {
      console.error(`  Batch ${Math.floor(i/BATCH)+1} failed:`, err.message);
      await new Promise(r => setTimeout(r, DELAY_MS));
      continue;
    }

    const batch = LANDMARKS.slice(i, i + BATCH);
    for (let j = 0; j < batch.length; j++) {
      const lm = batch[j];
      const results = data.elements
        .filter(e => {
          const elat = e.type === 'node' ? e.lat : e.center?.lat;
          const elng = e.type === 'node' ? e.lon : e.center?.lon;
          if (elat == null) return false;
          const dist = haversine(lm.lat, lm.lng, elat, elng);
          return dist < R;
        })
        .map(e => ({
          ...e,
          matchScore: scoreNameMatch(e.tags?.name || '', lm.name),
          elat: e.type === 'node' ? e.lat : e.center?.lat,
          elng: e.type === 'node' ? e.lon : e.center?.lon,
          distFromOrig: haversine(lm.lat, lm.lng,
            e.type === 'node' ? e.lat : e.center?.lat,
            e.type === 'node' ? e.lon : e.center?.lon),
        }))
        .sort((a, b) => b.matchScore - a.matchScore || a.distFromOrig - b.distFromOrig);

      const best = results[0];
      if (best && best.matchScore >= 0.5 && best.distFromOrig > 20) {
        const globalIdx = i + j;
        const orig = ORIG_LANDMARKS[globalIdx];
        const distFromOrig = haversine(orig.lat, orig.lng, best.elat, best.elng);
        updates.push({
          idx: globalIdx,
          id: lm.id,
          name: lm.name,
          oldLat: orig.lat,
          oldLng: orig.lng,
          newLat: best.elat,
          newLng: best.elng,
          osmType: best.type,
          osmId: best.id,
          osmName: best.tags?.name || '(sin nombre)',
          distMeters: Math.round(distFromOrig),
          matchScore: best.matchScore,
        });
        LANDMARKS[globalIdx].lat = best.elat;
        LANDMARKS[globalIdx].lng = best.elng;
        LANDMARKS[globalIdx]._osmType = best.type;
        LANDMARKS[globalIdx]._osmId = best.id;
      } else if (!best) {
        console.log(`  No match for: ${lm.name}`);
      }
    }

    console.log(`  Batch done, found ${updates.filter(u => u.idx >= i && u.idx < i + BATCH).length} updates in this batch`);
    if (i + BATCH < LANDMARKS.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  return updates;
}

function url(p) { return 'file:///' + p.replace(/\\/g, '/'); }

const updates = await verifyAll();

console.log(`\n=== UPDATES: ${updates.length} ===`);
for (const u of updates) {
  console.log(`${u.id.padEnd(25)} ${u.distMeters}m | ${u.name.padEnd(45)} | (${u.oldLat.toFixed(5)}, ${u.oldLng.toFixed(5)}) → (${u.newLat.toFixed(5)}, ${u.newLng.toFixed(5)}) | OSM:${u.osmType}/${u.osmId} "${u.osmName}"`);
}

const { NODES, EDGES } = await import(url(join(dataDir, 'generate-popayan.js')));
const NODE_MAP = {};
for (const n of NODES) NODE_MAP[n.id] = n;

function snapToNearestEdge(lat, lng) {
  let bestDist = Infinity, nearestEndpoint = null;
  for (const edge of EDGES) {
    const a = NODE_MAP[edge.from], b = NODE_MAP[edge.to];
    if (!a || !b) continue;
    const dx = b.lng - a.lng, dy = b.lat - a.lat;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;
    let t = ((lng - a.lng) * dx + (lat - a.lat) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const dLng = lng - (a.lng + t * dx);
    const dLat = lat - (a.lat + t * dy);
    const dist = dLng * dLng + dLat * dLat;
    if (dist < bestDist) { bestDist = dist; nearestEndpoint = t < 0.5 ? edge.from : edge.to; }
  }
  if (!nearestEndpoint) return null;
  return { nodeId: nearestEndpoint, node: NODE_MAP[nearestEndpoint], distanceMeters: Math.round(Math.sqrt(bestDist) * 111320) };
}

const results = [];
let ok = 0, far = 0, noEdge = 0;
for (const lm of LANDMARKS) {
  const snapped = snapToNearestEdge(lm.lat, lm.lng);
  const entry = { ...lm };
  delete entry._osmType;
  delete entry._osmId;
  if (snapped && snapped.distanceMeters < 150) {
    entry.nodeId = snapped.nodeId;
    ok++;
  } else {
    entry.nodeId = null;
    if (snapped) far++; else noEdge++;
  }
  results.push(entry);
  const status = snapped && snapped.distanceMeters < 150 ? 'OK' : (snapped ? 'FAR' : 'NO');
  const zone = snapped?.node?.zone || '-';
  const dist = snapped ? String(snapped.distanceMeters).padStart(4) : '   -';
  console.log(`${status} ${dist}m | ${lm.name.padEnd(45)} | ${zone}`);
}

const CATEGORY_ICONS = {
  turismo: 'IconBuildingMonument', cultura: 'IconMasksTheater', restaurante: 'IconRestaurant', hotel: 'IconBuilding',
  comercio: 'IconBuildingStore', transporte: 'IconBus', salud: 'IconHeartPlus', educacion: 'IconSchool',
  gobierno: 'IconBuildingGovernment', deporte: 'IconBallFootball', parque: 'IconTree', banco: 'IconBuildingBank',
  barrio: 'IconBuildings', religion: 'IconChurch', entierro: 'IconCross',
};

const CATEGORY_LABELS = {
  turismo: 'Turismo', cultura: 'Cultura', restaurante: 'Restaurantes',
  hotel: 'Hoteles', comercio: 'Comercio', transporte: 'Transporte',
  salud: 'Salud', educacion: 'Educación', gobierno: 'Gobierno',
  deporte: 'Deportes', parque: 'Parques', banco: 'Bancos',
  barrio: 'Barrios', religion: 'Religión', entierro: 'Cementerio',
};

let out = 'const LANDMARKS = ' + JSON.stringify(results, null, 2) + ';\n\n';
out += 'const CATEGORY_ICONS = ' + JSON.stringify(CATEGORY_ICONS, null, 2) + ';\n\n';
out += 'const CATEGORY_LABELS = ' + JSON.stringify(CATEGORY_LABELS, null, 2) + ';\n\n';

out += `function findNearestNode(lat, lng, nodes) {
  let best = null, bestDist = Infinity;
  for (const n of nodes) {
    const d = (n.lat - lat) ** 2 + (n.lng - lng) ** 2;
    if (d < bestDist) { bestDist = d; best = n; }
  }
  return best;
}

function searchLandmarks(query) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
  const words = q.split(/\\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return LANDMARKS.filter(l => {
    const name = l.name.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
    const cat = l.category.toLowerCase();
    return name.includes(q) || words.every(w => name.includes(w)) || cat.includes(q);
  });
}

export { LANDMARKS, CATEGORY_ICONS, CATEGORY_LABELS, searchLandmarks, findNearestNode };
`;

writeFileSync(join(dataDir, 'popayan-landmarks.js'), out, 'utf8');
console.log(`\nDone! ${results.length} landmarks: ${ok} OK, ${far} FAR, ${noEdge} NO_EDGE`);
