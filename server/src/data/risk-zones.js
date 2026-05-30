function inBounds(lat, lng, b) {
  return lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax;
}

const ZONE_DEFS = [
  { id: 'parque_carlos_alban', name: 'Parque Carlos Albán', riskLevel: 0.85,
    bounds: { latMin: 2.446, latMax: 2.450, lngMin: -76.601, lngMax: -76.598 } },
  { id: 'galeria_centro', name: 'Galería Centro', riskLevel: 0.65,
    bounds: { latMin: 2.439, latMax: 2.442, lngMin: -76.605, lngMax: -76.603 } },
  { id: 'galeria_esmeralda', name: 'Galería La Esmeralda', riskLevel: 0.72,
    bounds: { latMin: 2.424, latMax: 2.430, lngMin: -76.612, lngMax: -76.608 } },
  { id: 'campanario', name: 'Campanario', riskLevel: 0.15,
    bounds: { latMin: 2.454, latMax: 2.466, lngMin: -76.598, lngMax: -76.588 } },
  { id: 'parque_caldas', name: 'Parque Caldas / Torre Reloj', riskLevel: 0.20,
    bounds: { latMin: 2.440, latMax: 2.445, lngMin: -76.608, lngMax: -76.604 } },
  { id: 'parque_recuerdo', name: 'Parque del Recuerdo', riskLevel: 0.25,
    bounds: { latMin: 2.449, latMax: 2.454, lngMin: -76.600, lngMax: -76.596 } },
  { id: 'humilladero', name: 'Puente del Humilladero', riskLevel: 0.45,
    bounds: { latMin: 2.438, latMax: 2.442, lngMin: -76.606, lngMax: -76.603 } },
  { id: 'casa_mercado', name: 'Casa de la Moneda / Mercado', riskLevel: 0.40,
    bounds: { latMin: 2.443, latMax: 2.447, lngMin: -76.605, lngMax: -76.601 } },
  { id: 'bello_horizonte', name: 'Bello Horizonte', riskLevel: 0.52,
    bounds: { latMin: 2.454, latMax: 2.460, lngMin: -76.607, lngMax: -76.603 } },
  { id: 'prados_norte', name: 'Prados Norte / Modelo', riskLevel: 0.35,
    bounds: { latMin: 2.448, latMax: 2.456, lngMin: -76.612, lngMax: -76.603 } },
  { id: 'centro_historico', name: 'Centro Histórico (resto)', riskLevel: 0.30,
    bounds: { latMin: 2.436, latMax: 2.448, lngMin: -76.608, lngMax: -76.602 } },
  { id: 'empedrado', name: 'El Empedrado', riskLevel: 0.42,
    bounds: { latMin: 2.437, latMax: 2.445, lngMin: -76.602, lngMax: -76.600 } },
  { id: 'la_pamba', name: 'La Pamba', riskLevel: 0.50,
    bounds: { latMin: 2.436, latMax: 2.450, lngMin: -76.613, lngMax: -76.607 } },
  { id: 'bolivar_norte', name: 'Barrio Bolívar (Norte)', riskLevel: 0.45,
    bounds: { latMin: 2.430, latMax: 2.438, lngMin: -76.608, lngMax: -76.602 } },
  { id: 'bolivar_sur', name: 'Barrio Bolívar (Sur)', riskLevel: 0.60,
    bounds: { latMin: 2.420, latMax: 2.430, lngMin: -76.608, lngMax: -76.602 } },
  { id: 'pandiguando', name: 'Pandiguando', riskLevel: 0.75,
    bounds: { latMin: 2.414, latMax: 2.428, lngMin: -76.610, lngMax: -76.602 } },
  { id: 'esmeralda', name: 'La Esmeralda', riskLevel: 0.50,
    bounds: { latMin: 2.420, latMax: 2.437, lngMin: -76.615, lngMax: -76.608 } },
  { id: 'alfonso_lopez', name: 'Alfonso López', riskLevel: 0.78,
    bounds: { latMin: 2.448, latMax: 2.452, lngMin: -76.620, lngMax: -76.616 } },
];

const nodeZoneMap = new Map();
const zonePolygons = new Map();
let initialised = false;

function cross(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function convexHull(points) {
  if (points.length <= 3) return points.slice();
  const sorted = points.slice().sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export function initRiskZones(nodes) {
  if (initialised) return;
  initialised = true;

  const zoneNodes = new Map();
  for (const z of ZONE_DEFS) zoneNodes.set(z.id, []);

  for (const n of nodes) {
    let assigned = null;
    for (const z of ZONE_DEFS) {
      if (inBounds(n.lat, n.lng, z.bounds)) {
        assigned = z;
        break;
      }
    }
    if (assigned) {
      nodeZoneMap.set(n.id, { id: assigned.id, name: assigned.name, riskLevel: assigned.riskLevel });
      zoneNodes.get(assigned.id).push([n.lat, n.lng]);
    } else {
      nodeZoneMap.set(n.id, { id: 'urbano', name: 'Popayán Urbano', riskLevel: 0.15 });
    }
  }

  for (const z of ZONE_DEFS) {
    const pts = zoneNodes.get(z.id);
    if (pts.length >= 3) {
      zonePolygons.set(z.id, convexHull(pts));
    } else {
      const b = z.bounds;
      zonePolygons.set(z.id, [
        [b.latMin, b.lngMin],
        [b.latMin, b.lngMax],
        [b.latMax, b.lngMax],
        [b.latMax, b.lngMin],
        [b.latMin, b.lngMin],
      ]);
    }
  }

  const urbPts = [];
  for (const n of nodes) {
    if (!nodeZoneMap.get(n.id) || nodeZoneMap.get(n.id).id === 'urbano') {
      urbPts.push([n.lat, n.lng]);
    }
  }
  if (urbPts.length >= 3) {
    zonePolygons.set('urbano', convexHull(urbPts));
  }
}

function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dlat = (lat2 - lat1) * Math.PI / 180;
  const dlng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dlng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let allNodes = [];

export function setAllNodes(nodes) {
  allNodes = nodes;
}

function findNearestNode(lat, lng) {
  if (allNodes.length === 0) return null;
  let best = null;
  let bestDist = Infinity;
  for (const n of allNodes) {
    const d = haversineM(lat, lng, n.lat, n.lng);
    if (d < bestDist) { bestDist = d; best = n; }
  }
  return best;
}

export function getRiskZone(lat, lng) {
  if (initialised && allNodes.length > 0) {
    const nearest = findNearestNode(lat, lng);
    if (nearest && nodeZoneMap.has(nearest.id)) {
      return nodeZoneMap.get(nearest.id);
    }
  }

  for (const z of ZONE_DEFS) {
    if (inBounds(lat, lng, z.bounds)) {
      return { id: z.id, name: z.name, riskLevel: z.riskLevel };
    }
  }
  return { id: 'urbano', name: 'Popayán Urbano', riskLevel: 0.15 };
}

export function generateZoneGeoJSON() {
  if (!initialised) {
    const features = ZONE_DEFS.map(z => {
      const b = z.bounds;
      return {
        type: 'Feature',
        properties: {
          id: z.id, name: z.name, riskLevel: z.riskLevel,
          riskLabel: z.riskLevel < 0.3 ? 'Bajo' : z.riskLevel < 0.55 ? 'Medio' : z.riskLevel < 0.72 ? 'Alto' : 'Crítico',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [b.latMin, b.lngMin], [b.latMin, b.lngMax],
            [b.latMax, b.lngMax], [b.latMax, b.lngMin],
            [b.latMin, b.lngMin],
          ]],
        },
      };
    });
    return { type: 'FeatureCollection', features };
  }

  const features = [];
  const processed = new Set();

  for (const z of ZONE_DEFS) {
    const poly = zonePolygons.get(z.id);
    if (!poly) continue;
    processed.add(z.id);
    features.push({
      type: 'Feature',
      properties: {
        id: z.id, name: z.name, riskLevel: z.riskLevel,
        riskLabel: z.riskLevel < 0.3 ? 'Bajo' : z.riskLevel < 0.55 ? 'Medio' : z.riskLevel < 0.72 ? 'Alto' : 'Crítico',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [poly.map(p => [p[0], p[1]]).concat([poly[0]].map(p => [p[0], p[1]]))],
      },
    });
  }

  return { type: 'FeatureCollection', features };
}

export default ZONE_DEFS;
