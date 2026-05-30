import express from 'express';
import {
  buildGraph,
  getGraphData,
  addReport,
  getReports,
  getHourFactor,
  calculateEdgeWeight,
} from '../services/graphService.js';
import { dijkstra, reconstructPath } from '../algorithms/dijkstra.js';
import { astar } from '../algorithms/astar.js';
import {
  enrichPathWithGeometry,
  getTrafficFactor,
  getTrafficLabel,
  MODE_LABELS,
  formatDuration,
  formatDistance,
} from '../services/osrmService.js';
import { NODES, ZONES, REPORT_TYPES, getZoneForNode } from '../data/generate-popayan.js';
import { generateZoneGeoJSON, getRiskZone, initRiskZones, setAllNodes } from '../data/risk-zones.js';
import { unifiedSearch } from '../services/searchService.js';

const router = express.Router();

initRiskZones(NODES);
setAllNodes(NODES);

router.get('/graph', (_req, res) => {
  res.json(getGraphData());
});

router.get('/graph/nodes', (_req, res) => {
  res.json(NODES);
});

router.get('/graph/zones', (_req, res) => {
  res.json(ZONES);
});

router.get('/graph/risk-zones', (_req, res) => {
  res.json(generateZoneGeoJSON());
});

router.get('/graph/report-types', (_req, res) => {
  res.json(REPORT_TYPES);
});

router.get('/graph/transport-modes', (_req, res) => {
  res.json(MODE_LABELS);
});

router.get('/graph/current-hour-factor', (_req, res) => {
  res.json({ hourFactor: getHourFactor(), hour: new Date().getHours() });
});

router.get('/traffic/current', (_req, res) => {
  const factor = getTrafficFactor();
  const label = getTrafficLabel(factor);
  res.json({ factor, ...label, hour: new Date().getHours() });
});

async function computePath(from, to, mode, routeType, graph) {
  const result = dijkstra(graph, from);
  if (result.distances.get(to) === Infinity) return null;

  const path = reconstructPath(result.previous, to);
  const enriched = await enrichPathWithGeometry(path, mode, graph);

  const pathSegments = enriched.segments.map((seg) => {
    const fromNode = graph.getNode(seg.from);
    const toNode = graph.getNode(seg.to);
    const midLat = (fromNode.lat + toNode.lat) / 2;
    const midLng = (fromNode.lng + toNode.lng) / 2;
    const zone = getRiskZone(midLat, midLng);
    const riskLabel = zone.riskLevel < 0.3 ? 'Bajo' : zone.riskLevel < 0.55 ? 'Medio' : zone.riskLevel < 0.72 ? 'Alto' : 'Crítico';
    return {
      from: seg.from,
      to: seg.to,
      edgeId: seg.edgeId,
      name: seg.name,
      weight: seg.weight,
      fromCoords: [fromNode.lat, fromNode.lng],
      toCoords: [toNode.lat, toNode.lng],
      geometry: seg.geometry,
      distanceMeters: seg.distanceMeters,
      durationSecs: seg.durationSecs,
      trafficFactor: seg.trafficFactor,
      zoneName: zone.name,
      zoneRisk: zone.riskLevel,
      riskLabel,
    };
  });

  let totalDistance = 0;
  let weightedRiskSum = 0;
  for (const seg of pathSegments) {
    const segDist = seg.distanceMeters || 1;
    totalDistance += segDist;
    weightedRiskSum += seg.zoneRisk * segDist;
  }
  const avgRisk = totalDistance > 0 ? weightedRiskSum / totalDistance : 0.15;
  const riskLabel = avgRisk < 0.3 ? 'Bajo' : avgRisk < 0.55 ? 'Medio' : avgRisk < 0.72 ? 'Alto' : 'Crítico';

  return {
    type: routeType,
    path: pathSegments,
    weightedRisk: weightedRiskSum,
    avgRisk,
    riskLabel,
    totalDistanceMeters: enriched.totalDistanceMeters,
    totalDurationSecs: enriched.totalDurationSecs,
    totalDistance: formatDistance(enriched.totalDistanceMeters),
    totalDuration: formatDuration(enriched.totalDurationSecs),
    steps: pathSegments.length,
    allCoords: enriched.allCoords,
    mode,
    trafficFactor: getTrafficFactor(),
    trafficLabel: getTrafficLabel(getTrafficFactor()),
    hourFactor: getHourFactor(),
  };
}

router.post('/route/calculate', async (req, res) => {
  try {
    const { from, to, mode = 'walking', type = 'safest' } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'Origen y destino requeridos' });

    const validModes = ['walking', 'bike', 'car', 'motorcycle'];
    if (!validModes.includes(mode)) return res.status(400).json({ error: `Modo inválido: ${mode}` });

    const validTypes = ['safest', 'fastest', 'balanced'];
    const routeType = validTypes.includes(type) ? type : 'safest';

    const graph = buildGraph(routeType, mode);
    const result = await computePath(from, to, mode, routeType, graph);

    if (!result) {
      return res.status(404).json({ error: 'No hay ruta disponible entre esos puntos' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/route/safest', async (req, res) => {
  try {
    const { from, to, mode = 'walking' } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'Origen y destino requeridos' });
    const graph = buildGraph('safest', mode);
    const result = await computePath(from, to, mode, 'safest', graph);
    if (!result) return res.status(404).json({ error: 'No hay ruta disponible' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/route/fastest', async (req, res) => {
  try {
    const { from, to, mode = 'walking' } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'Origen y destino requeridos' });
    const graph = buildGraph('fastest', mode);
    const result = await computePath(from, to, mode, 'fastest', graph);
    if (!result) return res.status(404).json({ error: 'No hay ruta disponible' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/route/balanced', async (req, res) => {
  try {
    const { from, to, mode = 'walking' } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'Origen y destino requeridos' });
    const graph = buildGraph('balanced', mode);
    const result = await computePath(from, to, mode, 'balanced', graph);
    if (!result) return res.status(404).json({ error: 'No hay ruta disponible' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/route/astar-safest', async (req, res) => {
  try {
    const { from, to, mode = 'walking' } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'Origen y destino requeridos' });

    const graph = buildGraph('safest');
    const result = astar(graph, from, to);

    if (!result) return res.status(404).json({ error: 'No hay ruta disponible' });

    const enriched = await enrichPathWithGeometry(result.path, mode, graph);
    const pathDetails = enriched.segments.map((seg) => {
      const fromNode = graph.getNode(seg.from);
      const toNode = graph.getNode(seg.to);
      const midLat = (fromNode.lat + toNode.lat) / 2;
      const midLng = (fromNode.lng + toNode.lng) / 2;
      const zone = getRiskZone(midLat, midLng);
      const riskLabel = zone.riskLevel < 0.3 ? 'Bajo' : zone.riskLevel < 0.55 ? 'Medio' : zone.riskLevel < 0.72 ? 'Alto' : 'Crítico';
      return {
        from: seg.from,
        to: seg.to,
        edgeId: seg.edgeId,
        name: seg.name,
        weight: seg.weight,
        fromCoords: [fromNode.lat, fromNode.lng],
        toCoords: [toNode.lat, toNode.lng],
        geometry: seg.geometry,
        distanceMeters: seg.distanceMeters,
        durationSecs: seg.durationSecs,
        trafficFactor: seg.trafficFactor,
        zoneName: zone.name,
        zoneRisk: zone.riskLevel,
        riskLabel,
      };
    });

    let totalDist = 0;
    let weightedRiskSum = 0;
    for (const seg of pathDetails) {
      const d = seg.distanceMeters || 1;
      totalDist += d;
      weightedRiskSum += seg.zoneRisk * d;
    }
    const avgRisk = totalDist > 0 ? weightedRiskSum / totalDist : 0.15;
    const riskLabel = avgRisk < 0.3 ? 'Bajo' : avgRisk < 0.55 ? 'Medio' : avgRisk < 0.72 ? 'Alto' : 'Crítico';

    res.json({
      type: 'astar-safest',
      path: pathDetails,
      weightedRisk: weightedRiskSum,
      avgRisk,
      riskLabel,
      totalDistanceMeters: enriched.totalDistanceMeters,
      totalDurationSecs: enriched.totalDurationSecs,
      totalDistance: formatDistance(enriched.totalDistanceMeters),
      totalDuration: formatDuration(enriched.totalDurationSecs),
      steps: pathDetails.length,
      allCoords: enriched.allCoords,
      mode,
      visitedCount: result.visitedCount,
      trafficFactor: getTrafficFactor(),
      trafficLabel: getTrafficLabel(getTrafficFactor()),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports', (_req, res) => {
  res.json(getReports());
});

router.post('/reports', (req, res) => {
  try {
    const { edgeId, type, description, username } = req.body;
    if (!edgeId || !type || !username) {
      return res.status(400).json({ error: 'edgeId, type y username son requeridos' });
    }
    if (!REPORT_TYPES[type]) {
      return res.status(400).json({ error: `Tipo de reporte inválido: ${type}` });
    }
    const report = addReport({ edgeId, type, description, username });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports/heatmap', (_req, res) => {
  const allReports = getReports();
  const heatData = [];

  for (const report of allReports) {
    const edge = getGraphData().edges.find((e) => e.id === report.edgeId);
    if (!edge) continue;
    const fromNode = NODES.find((n) => n.id === edge.from);
    const toNode = NODES.find((n) => n.id === edge.to);
    if (!fromNode || !toNode) continue;

    const midLat = (fromNode.lat + toNode.lat) / 2;
    const midLng = (fromNode.lng + toNode.lng) / 2;
    heatData.push({
      lat: midLat,
      lng: midLng,
      intensity: REPORT_TYPES[report.type]?.baseWeight || 0.5,
      type: report.type,
    });
  }

  res.json(heatData);
});

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);

  try {
    const results = await unifiedSearch(q);
    res.json(results);
  } catch {
    res.json([]);
  }
});

export default router;
