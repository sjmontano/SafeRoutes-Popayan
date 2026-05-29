import { Graph } from '../algorithms/Graph.js';
import { NODES, EDGES, ZONES, getZoneForNode } from '../data/generate-popayan.js';

const NODE_MAP = {};
for (const n of NODES) {
  NODE_MAP[n.id] = n;
}

function edgeDistanceKm(edge) {
  const a = NODE_MAP[edge.from];
  const b = NODE_MAP[edge.to];
  if (!a || !b) return 0.0008;
  const dlat = b.lat - a.lat;
  const dlng = b.lng - a.lng;
  return Math.sqrt(dlat * dlat + dlng * dlng) * 111.32;
}

const DEFAULT_WEIGHTS = {
  seguridadBase: 0.25,
  reportes: 0.25,
  hora: 0.20,
  comercio: 0.10,
  policia: 0.10,
  cai: 0.05,
  iluminacion: 0.05,
};

const reports = [];

export function addReport(report) {
  report.id = `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  report.createdAt = new Date().toISOString();
  reports.push(report);
  return report;
}

export function seedReports(seedData) {
  for (const r of seedData) {
    addReport(r);
  }
}

export function getReports() {
  return reports;
}

export function getHourFactor() {
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 6) return 1.0;
  if (hour >= 18 || hour < 8) return 0.7;
  return 0.3;
}

export function reportDecay(daysAgo) {
  if (daysAgo <= 1) return 1.0;
  if (daysAgo <= 7) return 0.8;
  if (daysAgo <= 14) return 0.5;
  if (daysAgo <= 30) return 0.3;
  return 0.05;
}

function computeSafetyWeight(edge) {
  const fromZone = getZoneForNode(edge.from);
  const hourFactor = getHourFactor();

  const seguridadBase = fromZone.riskLevel;
  const comercioInverso = 1 - fromZone.commercePresence;
  const policiaInverso = 1 - fromZone.policePresence;
  const caiFactor = fromZone.caiNearby ? 0 : 0.15;
  const iluminacionInversa = 1 - fromZone.illumination;

  const now = new Date();
  let reportesFactor = 0;
  const edgeReports = reports.filter((r) => r.edgeId === edge.id);

  if (edgeReports.length > 0) {
    const totalDecay = edgeReports.reduce((sum, report) => {
      const daysAgo = (now - new Date(report.createdAt)) / (1000 * 60 * 60 * 24);
      return sum + reportDecay(daysAgo);
    }, 0);
    reportesFactor = Math.min(1, totalDecay / edgeReports.length);
  }

  return (
    DEFAULT_WEIGHTS.seguridadBase * seguridadBase +
    DEFAULT_WEIGHTS.reportes * reportesFactor +
    DEFAULT_WEIGHTS.hora * hourFactor +
    DEFAULT_WEIGHTS.comercio * comercioInverso +
    DEFAULT_WEIGHTS.policia * policiaInverso +
    DEFAULT_WEIGHTS.cai * caiFactor +
    DEFAULT_WEIGHTS.iluminacion * iluminacionInversa
  );
}

export function calculateEdgeWeight(edge, type = 'safest') {
  const distKm = edgeDistanceKm(edge);

  if (type === 'fastest') {
    return distKm * 100;
  }

  const safety = computeSafetyWeight(edge);

  if (type === 'balanced') {
    return safety + distKm * 10;
  }

  return Math.pow(safety, 3) + distKm * 0.05;
}

const ONE_WAY_AWARE_MODES = ['car', 'motorcycle'];

export function buildGraph(routeType = 'safest', mode = 'walking') {
  const graph = new Graph();
  const oneWayAware = ONE_WAY_AWARE_MODES.includes(mode);

  for (const node of NODES) {
    graph.addNode(node.id, {
      name: node.name,
      lat: node.lat,
      lng: node.lng,
      zone: node.zone,
    });
  }

  const addedPair = new Set();

  for (const edge of EDGES) {
    if (!graph.nodes.has(edge.from) || !graph.nodes.has(edge.to)) continue;

    const pairKey = [edge.from, edge.to].sort().join('|');
    if (addedPair.has(pairKey)) continue;
    addedPair.add(pairKey);

    const weight = calculateEdgeWeight(edge, routeType);
    graph.addEdge(edge.id, edge.from, edge.to, weight, { name: edge.name });

    if (!oneWayAware) {
      const reverseId = edge.id.replace(/(\d+)$/, (_, n) => `r${n}`);
      graph.addEdge(reverseId, edge.to, edge.from, weight, { name: edge.name });
    } else {
      const reverse = EDGES.find(e => e.from === edge.to && e.to === edge.from);
      if (reverse) {
        const rw = calculateEdgeWeight(reverse, routeType);
        graph.addEdge(reverse.id, reverse.from, reverse.to, rw, { name: reverse.name });
      }
    }
  }

  return graph;
}

export function getGraphData() {
  return {
    nodes: NODES,
    edges: EDGES.map((e) => {
      const zone = getZoneForNode(e.from);
      const edgeReports = reports.filter((r) => r.edgeId === e.id);
      return {
        ...e,
        zone: zone.name,
        riskLevel: zone.riskLevel,
        reportCount: edgeReports.length,
      };
    }),
    zones: ZONES,
  };
}

export { DEFAULT_WEIGHTS };
