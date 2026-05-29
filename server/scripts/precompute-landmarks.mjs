import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

function url(p) { return 'file:///' + p.replace(/\\/g, '/'); }

const { NODES, EDGES } = await import(url(join(dataDir, 'generate-popayan.js')));

const NODE_MAP = {};
for (const n of NODES) NODE_MAP[n.id] = n;

function snapToNearestEdge(lat, lng) {
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
    const dLng = lng - (a.lng + t * dx);
    const dLat = lat - (a.lat + t * dy);
    const dist = dLng * dLng + dLat * dLat;
    if (dist < bestDist) {
      bestDist = dist;
      nearestEndpoint = t < 0.5 ? edge.from : edge.to;
    }
  }
  if (!nearestEndpoint) return null;
  return {
    nodeId: nearestEndpoint,
    node: NODE_MAP[nearestEndpoint],
    distanceMeters: Math.round(Math.sqrt(bestDist) * 111320),
  };
}

const { LANDMARKS } = await import(url(join(dataDir, 'popayan-landmarks.js')));

const results = [];
let ok = 0, far = 0, noEdge = 0;
for (const lm of LANDMARKS) {
  const snapped = snapToNearestEdge(lm.lat, lm.lng);
  const entry = { ...lm };
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
