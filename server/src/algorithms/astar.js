import { PriorityQueue } from './Graph.js';

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function astar(graph, startNodeId, endNodeId, weightFn = null) {
  if (!graph.nodes.has(startNodeId)) {
    throw new Error(`Nodo origen "${startNodeId}" no existe`);
  }
  if (!graph.nodes.has(endNodeId)) {
    throw new Error(`Nodo destino "${endNodeId}" no existe`);
  }

  const targetNode = graph.getNode(endNodeId);
  const gScore = new Map();
  const fScore = new Map();
  const previous = new Map();
  const closedSet = new Set();
  const openSet = new PriorityQueue();

  for (const nodeId of graph.nodes.keys()) {
    gScore.set(nodeId, Infinity);
    fScore.set(nodeId, Infinity);
  }

  gScore.set(startNodeId, 0);

  const startNode = graph.getNode(startNodeId);
  const hStart = haversineDistance(startNode.lat, startNode.lng, targetNode.lat, targetNode.lng) * 0.0001;
  fScore.set(startNodeId, hStart);
  openSet.enqueue(startNodeId, fScore.get(startNodeId));

  while (!openSet.isEmpty()) {
    const { node: current } = openSet.dequeue();

    if (current === endNodeId) {
      const path = [];
      let node = endNodeId;
      while (previous.has(node)) {
        const step = previous.get(node);
        path.unshift({
          from: step.node,
          to: node,
          edge: step.edge,
        });
        node = step.node;
      }
      return {
        path,
        totalWeight: gScore.get(endNodeId),
        visitedCount: closedSet.size,
      };
    }

    if (closedSet.has(current)) continue;
    closedSet.add(current);

    for (const edge of graph.getNeighbors(current)) {
      if (closedSet.has(edge.to)) continue;

      const edgeWeight = weightFn ? weightFn(edge) : edge.weight;
      const tentativeG = gScore.get(current) + edgeWeight;

      if (tentativeG < gScore.get(edge.to)) {
        gScore.set(edge.to, tentativeG);
        previous.set(edge.to, { node: current, edge });

        const neighbor = graph.getNode(edge.to);
        const h = haversineDistance(neighbor.lat, neighbor.lng, targetNode.lat, targetNode.lng) * 0.0001;
        const f = tentativeG + h;

        fScore.set(edge.to, f);
        openSet.enqueue(edge.to, f);
      }
    }
  }

  return null;
}
