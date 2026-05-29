function coord(calle, carrera) {
  const lat = 2.43850 + calle * 0.00075;
  const lng = -76.60350 - carrera * 0.00082;
  return { lat: Math.round(lat * 1e7) / 1e7, lng: Math.round(lng * 1e7) / 1e7 };
}

function zoneFor(carrera, calle) {
  if (carrera >= 1 && carrera <= 7 && calle >= 0 && calle <= 14) return 'Centro Histórico';
  if (carrera >= 8 && carrera <= 13 && calle >= 0 && calle <= 16) return 'La Pamba';
  if (carrera >= 11 && carrera <= 17 && calle >= 0 && calle <= 18) return 'Modelo';
  if (carrera >= 1 && carrera <= 5 && calle >= 15 && calle <= 28) return 'El Cadillal';
  if (carrera >= 5 && carrera <= 11 && calle >= 16 && calle <= 32) return 'Campo Bello';
  if (carrera >= 0 && carrera <= 2 && calle >= 0 && calle <= 12) return 'El Empedrado';
  if (carrera >= 12 && carrera <= 18 && calle >= 0 && calle <= 14) return 'La Esmeralda';
  if (carrera >= 16 && carrera <= 21 && calle >= 6 && calle <= 26) return 'Bello Horizonte';
  if (carrera >= 7 && carrera <= 13 && calle >= 16 && calle <= 27) return 'María Occidente';
  if (carrera >= 14 && carrera <= 19 && calle >= 14 && calle <= 24) return 'Prados del Norte';
  if (carrera >= 0 && carrera <= 4 && calle >= -4 && calle <= -1) return 'Pandiguando';
  if (carrera >= 8 && carrera <= 14 && calle >= -4 && calle <= -1) return 'Las Ferias';
  return 'Centro Histórico';
}

const BARRIO_NAMES = {
  'Centro Histórico': 'Centro Histórico',
  'La Pamba': 'La Pamba',
  'Modelo': 'Modelo',
  'Campo Bello': 'Campo Bello',
  'El Empedrado': 'El Empedrado',
  'El Cadillal': 'El Cadillal',
  'La Esmeralda': 'La Esmeralda',
  'Bello Horizonte': 'Bello Horizonte',
  'María Occidente': 'María Occidente',
  'Prados del Norte': 'Prados del Norte',
  'Pandiguando': 'Pandiguando',
  'Las Ferias': 'Las Ferias',
};

const ZONES = [
  { id: 'centro_historico', name: 'Centro Histórico', riskLevel: 0.30, commercePresence: 0.95, policePresence: 0.90, caiNearby: true, illumination: 0.85 },
  { id: 'la_pamba', name: 'La Pamba', riskLevel: 0.50, commercePresence: 0.55, policePresence: 0.45, caiNearby: false, illumination: 0.50 },
  { id: 'modelo', name: 'Modelo', riskLevel: 0.55, commercePresence: 0.65, policePresence: 0.55, caiNearby: true, illumination: 0.60 },
  { id: 'campo_bello', name: 'Campo Bello', riskLevel: 0.72, commercePresence: 0.30, policePresence: 0.25, caiNearby: false, illumination: 0.30 },
  { id: 'el_empedrado', name: 'El Empedrado', riskLevel: 0.42, commercePresence: 0.45, policePresence: 0.38, caiNearby: false, illumination: 0.35 },
  { id: 'el_cadillal', name: 'El Cadillal', riskLevel: 0.60, commercePresence: 0.48, policePresence: 0.40, caiNearby: false, illumination: 0.45 },
  { id: 'la_esmeralda', name: 'La Esmeralda', riskLevel: 0.65, commercePresence: 0.42, policePresence: 0.35, caiNearby: false, illumination: 0.40 },
  { id: 'bello_horizonte', name: 'Bello Horizonte', riskLevel: 0.78, commercePresence: 0.20, policePresence: 0.18, caiNearby: false, illumination: 0.25 },
  { id: 'maria_occidente', name: 'María Occidente', riskLevel: 0.58, commercePresence: 0.50, policePresence: 0.42, caiNearby: false, illumination: 0.48 },
  { id: 'prados_norte', name: 'Prados del Norte', riskLevel: 0.45, commercePresence: 0.55, policePresence: 0.50, caiNearby: true, illumination: 0.55 },
  { id: 'pandiguando', name: 'Pandiguando', riskLevel: 0.70, commercePresence: 0.25, policePresence: 0.22, caiNearby: false, illumination: 0.28 },
  { id: 'las_ferias', name: 'Las Ferias', riskLevel: 0.62, commercePresence: 0.50, policePresence: 0.40, caiNearby: false, illumination: 0.45 },
];

const REPORT_TYPES = {
  ROBO: { label: 'Robo / Hurto', baseWeight: 0.9, color: '#DC2626' },
  ACOSO: { label: 'Acoso Callejero', baseWeight: 0.8, color: '#F65B7F' },
  ZONA_OSCURA: { label: 'Zona Oscura', baseWeight: 0.6, color: '#5E3A8A' },
  SOSPECHOSO: { label: 'Actividad Sospechosa', baseWeight: 0.7, color: '#F59E0B' },
  ACCIDENTE: { label: 'Accidente Vial', baseWeight: 0.4, color: '#3B82F6' },
  OTRO: { label: 'Otro Incidente', baseWeight: 0.5, color: '#6B7280' },
};

const MIN_CALLE = -4;
const MAX_CALLE = 33;
const MIN_CARRERA = 0;
const MAX_CARRERA = 22;

const NODES = [];
const nodeMap = {};

function nodeId(calle, carrera) {
  return `n_${calle}_${carrera}`;
}

function nodeName(calle, carrera) {
  const calleName = calle === 0 ? 'Calle 0' : calle > 0 ? `Calle ${calle}` : `Calle ${Math.abs(calle)} Sur`;
  const carreraName = carrera === 0 ? 'Cra 0' : `Cra ${carrera}`;
  return `${calleName} con ${carreraName}`;
}

for (let calle = MIN_CALLE; calle <= MAX_CALLE; calle++) {
  for (let carrera = MIN_CARRERA; carrera <= MAX_CARRERA; carrera++) {
    const { lat, lng } = coord(calle, carrera);
    const zone = zoneFor(carrera, calle);
    const id = nodeId(calle, carrera);
    const name = nodeName(calle, carrera);

    NODES.push({ id, calle, carrera, name, lat, lng, zone });
    nodeMap[id] = { calle, carrera, lat, lng, zone };
  }
}

const EDGES = [];
let edgeCounter = 0;

function addEdge(fromId, toId) {
  const a = nodeMap[fromId];
  const b = nodeMap[toId];
  if (!a || !b) return;
  edgeCounter++;
  EDGES.push({
    id: `e${String(edgeCounter).padStart(5, '0')}`,
    from: fromId,
    to: toId,
    name: `${a.calle !== b.calle ? nodeName(a.calle, a.carrera) : ''} ${a.calle !== b.calle ? '→' : '↓'} ${nodeName(b.calle, b.carrera)}`,
  });
}

for (let calle = MIN_CALLE; calle <= MAX_CALLE; calle++) {
  for (let carrera = MIN_CARRERA; carrera < MAX_CARRERA; carrera++) {
    addEdge(nodeId(calle, carrera), nodeId(calle, carrera + 1));
    addEdge(nodeId(calle, carrera + 1), nodeId(calle, carrera));
  }
}

for (let carrera = MIN_CARRERA; carrera <= MAX_CARRERA; carrera++) {
  for (let calle = MIN_CALLE; calle < MAX_CALLE; calle++) {
    addEdge(nodeId(calle, carrera), nodeId(calle + 1, carrera));
    addEdge(nodeId(calle + 1, carrera), nodeId(calle, carrera));
  }
}

function getZoneForNode(nodeId) {
  const node = NODES.find((n) => n.id === nodeId);
  if (!node) return ZONES[0];
  return ZONES.find((z) => z.name === node.zone) || ZONES[0];
}

function getZoneId(nodeId) {
  const node = NODES.find((n) => n.id === nodeId);
  if (!node) return 'centro_historico';
  const zone = ZONES.find((z) => z.name === node.zone);
  return zone ? zone.id : 'centro_historico';
}

const landmarkNodes = {
  parque_caldas: nodeId(9, 6),
  torre_reloj: nodeId(10, 7),
  puente_humilladero: nodeId(3, 2),
  universidad_cauca: nodeId(8, 5),
  terminal_transportes: nodeId(24, 18),
  centro_comercial: nodeId(13, 10),
  aeropuerto: nodeId(30, 4),
  hospital: nodeId(15, 7),
  coliseo: nodeId(20, 15),
  estadio: nodeId(22, 11),
};

console.log(`Generated ${NODES.length} nodes, ${EDGES.length} edges, ${ZONES.length} zones`);
console.log(`Landmarks: ${Object.keys(landmarkNodes).join(', ')}`);

export { NODES, EDGES, ZONES, REPORT_TYPES, getZoneForNode, getZoneId, landmarkNodes };
