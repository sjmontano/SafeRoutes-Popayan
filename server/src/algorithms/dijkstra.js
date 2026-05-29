import { PriorityQueue } from './Graph.js';

export function dijkstra(graph, startNodeId, weightFn = null) {
  if (!graph.nodes.has(startNodeId)) {
    throw new Error(`Nodo origen "${startNodeId}" no existe en el grafo`);
  }

  const distances = new Map();
  const previous = new Map();
  const visited = new Set();
  const pq = new PriorityQueue();

  for (const nodeId of graph.nodes.keys()) {
    distances.set(nodeId, Infinity);
  }
  distances.set(startNodeId, 0);
  pq.enqueue(startNodeId, 0);

  while (!pq.isEmpty()) {
    const { node: current } = pq.dequeue();

    if (visited.has(current)) continue;
    visited.add(current);

    const currentDist = distances.get(current);

    for (const edge of graph.getNeighbors(current)) {
      if (visited.has(edge.to)) continue;

      const edgeWeight = weightFn ? weightFn(edge) : edge.weight;
      const newDist = currentDist + edgeWeight;

      if (newDist < distances.get(edge.to)) {
        distances.set(edge.to, newDist);
        previous.set(edge.to, { node: current, edge });
        pq.enqueue(edge.to, newDist);
      }
    }
  }

  return { distances, previous };
}

export function reconstructPath(previous, endNodeId) {
  const path = [];
  let current = endNodeId;

  while (previous.has(current)) {
    const step = previous.get(current);
    path.unshift({
      from: step.node,
      to: current,
      edge: step.edge,
    });
    current = step.node;
  }

  return path;
}

export function getTotalWeight(path) {
  return path.reduce((sum, step) => sum + step.edge.weight, 0);
}
