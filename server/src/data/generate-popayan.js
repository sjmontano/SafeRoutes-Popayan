import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let NODES, EDGES, ZONES, INTERSECTION_INDEX, STREET_INDEX;
let REPORT_TYPES, landmarkNodes;

try {
  const raw = JSON.parse(readFileSync(join(__dirname, 'popayan-graph.json'), 'utf8'));

  NODES = raw.nodes;
  EDGES = raw.edges;
  ZONES = raw.zones;
  INTERSECTION_INDEX = new Map(raw.intersectionIndex);
  STREET_INDEX = new Map(raw.streetIndex);

  REPORT_TYPES = {
    ROBO: { label: 'Robo / Hurto', baseWeight: 0.9, color: '#DC2626' },
    ACOSO: { label: 'Acoso Callejero', baseWeight: 0.8, color: '#F65B7F' },
    ZONA_OSCURA: { label: 'Zona Oscura', baseWeight: 0.6, color: '#5E3A8A' },
    SOSPECHOSO: { label: 'Actividad Sospechosa', baseWeight: 0.7, color: '#F59E0B' },
    ACCIDENTE: { label: 'Accidente Vial', baseWeight: 0.4, color: '#3B82F6' },
    OTRO: { label: 'Otro Incidente', baseWeight: 0.5, color: '#6B7280' },
    HOMICIDIO: { label: 'Homicidio', baseWeight: 1.0, color: '#000000' },
    VIOLENCIA: { label: 'Violencia Intrafamiliar', baseWeight: 0.7, color: '#7C3AED' },
    DELITO_SEXUAL: { label: 'Delito Sexual', baseWeight: 0.95, color: '#991B1B' },
    MICROTRAFICO: { label: 'Microtráfico', baseWeight: 0.8, color: '#B45309' },
  };

  landmarkNodes = { parque_caldas: 'n0' };

} catch {
  const rawGeo = JSON.parse(readFileSync(join(__dirname, 'popayan-streets.geojson'), 'utf8'));

  const coordKey = (lat, lng) => `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const nodeMap = new Map();
  NODES = [];
  let nodeIdCounter = 0;

  function getOrCreateNode(lat, lng) {
    const key = coordKey(lat, lng);
    if (nodeMap.has(key)) return nodeMap.get(key);
    const id = `n${nodeIdCounter++}`;
    const node = { id, lat, lng };
    nodeMap.set(key, id);
    NODES.push(node);
    return id;
  }

  function getZone(lat, lng) {
    const cx = 2.44170, cy = -76.60640;
    const dy = (lat - cx) / 0.00075;
    const dx = (lng - cy) / -0.00082;
    const cl = Math.round(dy + 5);
    const c = Math.round(dx + 6);
    if (cl >= -2 && cl <= 12 && c >= 1 && c <= 7) return { name: 'Centro Histórico', id: 'centro_historico', risk: 0.30, commerce: 0.95, police: 0.90, cai: true, illum: 0.85 };
    if (cl <= -2 && c >= 1 && c <= 8) return { name: 'Pandiguando/Bolívar (ALTO RIESGO)', id: 'comuna_6', risk: 0.75, commerce: 0.25, police: 0.20, cai: false, illum: 0.25 };
    if (cl <= -2 && c >= 8 && c <= 16) return { name: 'La Esmeralda (ALTO RIESGO)', id: 'comuna_7', risk: 0.78, commerce: 0.28, police: 0.22, cai: false, illum: 0.28 };
    if (cl >= 15 && cl <= 35 && c >= 14 && c <= 22) return { name: 'Alfonso López (ALTO RIESGO)', id: 'comuna_8', risk: 0.80, commerce: 0.20, police: 0.15, cai: false, illum: 0.20 };
    if (cl >= 22 && cl <= 38 && c >= 14 && c <= 22) return { name: 'Sur Occidente (ALTO RIESGO)', id: 'comuna_9', risk: 0.72, commerce: 0.30, police: 0.25, cai: false, illum: 0.30 };
    if (cl >= 0 && cl <= 8 && c >= 0 && c <= 2) return { name: 'El Empedrado', id: 'empedrado', risk: 0.42, commerce: 0.45, police: 0.38, cai: false, illum: 0.35 };
    if (cl >= -1 && cl <= 15 && c >= 7 && c <= 13) return { name: 'La Pamba', id: 'la_pamba', risk: 0.52, commerce: 0.50, police: 0.40, cai: false, illum: 0.45 };
    if (cl >= 22 && cl <= 40 && c >= 3 && c <= 14) return { name: 'Bello Horizonte', id: 'bello_horizonte', risk: 0.55, commerce: 0.45, police: 0.38, cai: false, illum: 0.42 };
    if (cl >= 25 && cl <= 42 && c >= 6 && c <= 14) return { name: 'Campo Bello', id: 'campo_bello', risk: 0.60, commerce: 0.35, police: 0.30, cai: false, illum: 0.35 };
    if (cl >= 16 && cl <= 28 && c >= 3 && c <= 15) return { name: 'Prados Norte/Modelo', id: 'comuna_1n', risk: 0.48, commerce: 0.65, police: 0.55, cai: true, illum: 0.65 };
    return { name: 'Popayán Urbano', id: 'urbano', risk: 0.50, commerce: 0.55, police: 0.45, cai: false, illum: 0.50 };
  }

  function isValidStreet(name) {
    if (!name || name.trim() === '') return false;
    const n = name.toLowerCase();
    return n.includes('calle') || n.includes('carrera') || n.includes('cra ') || n.includes('cra.') ||
           n.includes('avenida') || n.includes('via ') || n.includes('vía ') || n.includes('diagonal') ||
           n.includes('transversal') || n.includes('circunvalar') || n.includes('variante') ||
           n.includes('autopista') || n.includes('camino');
  }

  function normalizeStreetName(name) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/^carrera\s+/i, 'cra ').replace(/^cra\.\s*/i, 'cra ').replace(/^calle\s+/i, 'calle ')
      .replace(/^avenida\s+/i, 'av ').replace(/^diagonal\s+/i, 'dg ').replace(/^transversal\s+/i, 'tv ')
      .replace(/^circunvalar\s+/i, 'circunvalar ').replace(/^variante\s+/i, 'variante ')
      .replace(/^autopista\s+/i, 'autopista ').replace(/^camino\s+/i, 'camino ')
      .replace(/^via\s+/i, 'via ').replace(/^vía\s+/i, 'via ')
      .replace(/\s+/g, ' ').trim();
  }

  function makeIntersectionKey(s1, s2) {
    return `${normalizeStreetName(s1)} & ${normalizeStreetName(s2)}`;
  }

  function displayIntersectionName(s1, s2) {
    const format = (s) => {
      let str = s.trim();
      if (str.toLowerCase().startsWith('cra')) str = 'Cra' + str.slice(3);
      else if (str.toLowerCase().startsWith('carrera')) str = 'Carrera' + str.slice(7);
      else str = str.charAt(0).toUpperCase() + str.slice(1);
      return str;
    };
    const a = format(s1), b = format(s2);
    const aIsC = a.toLowerCase().startsWith('calle') || a.toLowerCase().startsWith('dg') || a.toLowerCase().startsWith('tv');
    const bIsC = b.toLowerCase().startsWith('calle') || b.toLowerCase().startsWith('dg') || b.toLowerCase().startsWith('tv');
    if (aIsC && !bIsC) return `${a} × ${b}`;
    if (!aIsC && bIsC) return `${b} × ${a}`;
    if (aIsC && bIsC) {
      const nA = parseInt(a.replace(/\D/g, '')) || 0;
      const nB = parseInt(b.replace(/\D/g, '')) || 0;
      return nA <= nB ? `${a} × ${b}` : `${b} × ${a}`;
    }
    return `${a} × ${b}`;
  }

  EDGES = [];
  let ec = 0;
  const FILTERED = new Set(['service', 'track']);

  for (const feat of rawGeo.features) {
    if (!feat.geometry || feat.geometry.type !== 'LineString') continue;
    const hw = feat.properties?.highway || '';
    if (FILTERED.has(hw)) continue;
    const name = feat.properties?.name || '';
    const isNamed = name && name.trim() !== '';
    if (hw === 'residential' && !isNamed) continue;
    if ((hw === 'footway' || hw === 'path' || hw === 'steps' || hw === 'cycleway' || hw === 'pedestrian') && !isNamed) continue;
    if (hw === 'unclassified' && !isNamed) continue;
    const coords = feat.geometry.coordinates;
    const highway = feat.properties?.highway || '';
    const simplified = [coords[0]];
    for (let i = 1; i < coords.length - 1; i++) {
      const prev = simplified[simplified.length - 1];
      const next = coords[i + 1];
      const curr = coords[i];
      const d1 = Math.hypot(curr[0] - prev[0], curr[1] - prev[1]);
      const d2 = Math.hypot(next[0] - curr[0], next[1] - curr[1]);
      if (d1 < 0.00003 || d2 < 0.00003) continue;
      simplified.push(curr);
    }
    simplified.push(coords[coords.length - 1]);
    for (let i = 0; i < simplified.length - 1; i++) {
      const [lng1, lat1] = simplified[i];
      const [lng2, lat2] = simplified[i + 1];
      const from = getOrCreateNode(lat1, lng1);
      const to = getOrCreateNode(lat2, lng2);
      ec++; EDGES.push({ id: `e${ec}`, from, to, name: name || highway, highway });
      ec++; EDGES.push({ id: `e${ec}`, from: to, to: from, name: name || highway, highway });
    }
  }

  const nodeStreets = new Map();
  for (const edge of EDGES) {
    if (!edge.name || !isValidStreet(edge.name)) continue;
    for (const nodeId of [edge.from, edge.to]) {
      if (!nodeStreets.has(nodeId)) nodeStreets.set(nodeId, new Set());
      nodeStreets.get(nodeId).add(edge.name);
    }
  }

  INTERSECTION_INDEX = new Map();
  STREET_INDEX = new Map();

  for (const n of NODES) {
    const z = getZone(n.lat, n.lng);
    n.zone = z.name;
    n.zoneId = z.id;
    const streets = nodeStreets.get(n.id);
    if (streets && streets.size >= 2) {
      const names = [...streets];
      const best = [...names].sort((a, b) => {
        const aOk = isValidStreet(a) ? 0 : 1;
        const bOk = isValidStreet(b) ? 0 : 1;
        if (aOk !== bOk) return aOk - bOk;
        return b.length - a.length;
      });
      const mp = best.slice(0, 2);
      n.name = displayIntersectionName(mp[0], mp[1]);
      for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) {
          if (!isValidStreet(names[i]) || !isValidStreet(names[j])) continue;
          const k1 = makeIntersectionKey(names[i], names[j]);
          const k2 = makeIntersectionKey(names[j], names[i]);
          const entry = { nodeId: n.id, name: displayIntersectionName(names[i], names[j]), lat: n.lat, lng: n.lng, zone: n.zone };
          if (!INTERSECTION_INDEX.has(k1)) INTERSECTION_INDEX.set(k1, []);
          INTERSECTION_INDEX.get(k1).push(entry);
          if (k1 !== k2) { if (!INTERSECTION_INDEX.has(k2)) INTERSECTION_INDEX.set(k2, []); INTERSECTION_INDEX.get(k2).push(entry); }
        }
      }
    } else if (streets && streets.size === 1) {
      n.name = [...streets][0];
    } else {
      n.name = `Intersección #${n.id.slice(1)}`;
    }
    if (streets) {
      for (const street of streets) {
        if (!isValidStreet(street)) continue;
        const norm = normalizeStreetName(street);
        const entry = { nodeId: n.id, name: n.name, lat: n.lat, lng: n.lng, zone: n.zone, street };
        if (!STREET_INDEX.has(norm)) STREET_INDEX.set(norm, []);
        STREET_INDEX.get(norm).push(entry);
      }
    }
  }

  ZONES = [
    { id: 'centro_historico', name: 'Centro Histórico', riskLevel: 0.30, commercePresence: 0.95, policePresence: 0.90, caiNearby: true, illumination: 0.85 },
    { id: 'comuna_6', name: 'Pandiguando/Bolívar (ALTO RIESGO)', riskLevel: 0.75, commercePresence: 0.25, policePresence: 0.20, caiNearby: false, illumination: 0.25 },
    { id: 'comuna_7', name: 'La Esmeralda (ALTO RIESGO)', riskLevel: 0.78, commercePresence: 0.28, policePresence: 0.22, caiNearby: false, illumination: 0.28 },
    { id: 'comuna_8', name: 'Alfonso López (ALTO RIESGO)', riskLevel: 0.80, commercePresence: 0.20, policePresence: 0.15, caiNearby: false, illumination: 0.20 },
    { id: 'comuna_9', name: 'Sur Occidente (ALTO RIESGO)', riskLevel: 0.72, commercePresence: 0.30, policePresence: 0.25, caiNearby: false, illumination: 0.30 },
    { id: 'empedrado', name: 'El Empedrado', riskLevel: 0.42, commercePresence: 0.45, policePresence: 0.38, caiNearby: false, illumination: 0.35 },
    { id: 'la_pamba', name: 'La Pamba', riskLevel: 0.52, commercePresence: 0.50, policePresence: 0.40, caiNearby: false, illumination: 0.45 },
    { id: 'bello_horizonte', name: 'Bello Horizonte', riskLevel: 0.55, commercePresence: 0.45, policePresence: 0.38, caiNearby: false, illumination: 0.42 },
    { id: 'campo_bello', name: 'Campo Bello', riskLevel: 0.60, commercePresence: 0.35, policePresence: 0.30, caiNearby: false, illumination: 0.35 },
    { id: 'comuna_1n', name: 'Prados Norte/Modelo', riskLevel: 0.48, commercePresence: 0.65, policePresence: 0.55, caiNearby: true, illumination: 0.65 },
    { id: 'urbano', name: 'Popayán Urbano', riskLevel: 0.50, commercePresence: 0.55, policePresence: 0.45, caiNearby: false, illumination: 0.50 },
  ];

  REPORT_TYPES = {
    ROBO: { label: 'Robo / Hurto', baseWeight: 0.9, color: '#DC2626' },
    ACOSO: { label: 'Acoso Callejero', baseWeight: 0.8, color: '#F65B7F' },
    ZONA_OSCURA: { label: 'Zona Oscura', baseWeight: 0.6, color: '#5E3A8A' },
    SOSPECHOSO: { label: 'Actividad Sospechosa', baseWeight: 0.7, color: '#F59E0B' },
    ACCIDENTE: { label: 'Accidente Vial', baseWeight: 0.4, color: '#3B82F6' },
    OTRO: { label: 'Otro Incidente', baseWeight: 0.5, color: '#6B7280' },
    HOMICIDIO: { label: 'Homicidio', baseWeight: 1.0, color: '#000000' },
    VIOLENCIA: { label: 'Violencia Intrafamiliar', baseWeight: 0.7, color: '#7C3AED' },
    DELITO_SEXUAL: { label: 'Delito Sexual', baseWeight: 0.95, color: '#991B1B' },
    MICROTRAFICO: { label: 'Microtráfico', baseWeight: 0.8, color: '#B45309' },
  };

  landmarkNodes = { parque_caldas: 'n0' };
}

const NODE_MAP = {};
for (const n of NODES) NODE_MAP[n.id] = n;

const ZONE_BY_NAME = {};
for (const z of ZONES) ZONE_BY_NAME[z.name] = z;

function getZoneForNode(nodeId) {
  const n = NODE_MAP[nodeId];
  if (!n) return ZONES[0];
  return ZONE_BY_NAME[n.zone] || ZONES[0];
}

function normalizeStreetName(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/^carrera\s+/i, 'cra ').replace(/^cra\.\s*/i, 'cra ')
    .replace(/^calle\s+/i, 'calle ').replace(/^avenida\s+/i, 'av ')
    .replace(/^diagonal\s+/i, 'dg ').replace(/^transversal\s+/i, 'tv ')
    .replace(/^circunvalar\s+/i, 'circunvalar ').replace(/^variante\s+/i, 'variante ')
    .replace(/^autopista\s+/i, 'autopista ').replace(/^camino\s+/i, 'camino ')
    .replace(/^via\s+/i, 'via ').replace(/^vía\s+/i, 'via ')
    .replace(/\s+/g, ' ').trim();
}

console.log(`Graph ready: ${NODES.length} nodes, ${EDGES.length} edges, ${INTERSECTION_INDEX.size} intersections`);

export { NODES, EDGES, ZONES, REPORT_TYPES, getZoneForNode, landmarkNodes, INTERSECTION_INDEX, STREET_INDEX, normalizeStreetName };
