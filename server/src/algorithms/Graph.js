class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  enqueue(node, priority) {
    this.heap.push({ node, priority });
    this._siftUp(this.heap.length - 1);
  }

  dequeue() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._siftDown(0);
    }
    return top;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _siftUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[idx].priority < this.heap[parent].priority) {
        [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
        idx = parent;
      } else break;
    }
  }

  _siftDown(idx) {
    const size = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < size && this.heap[left].priority < this.heap[smallest].priority) smallest = left;
      if (right < size && this.heap[right].priority < this.heap[smallest].priority) smallest = right;
      if (smallest === idx) break;
      [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
      idx = smallest;
    }
  }
}

class Graph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyList = new Map();
  }

  addNode(id, data = {}) {
    this.nodes.set(id, { id, ...data });
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
    }
    return this;
  }

  addEdge(id, from, to, weight = 1, data = {}) {
    const edge = { id, from, to, weight, ...data };
    this.edges.set(id, edge);
    if (!this.adjacencyList.has(from)) this.adjacencyList.set(from, []);
    if (!this.adjacencyList.has(to)) this.adjacencyList.set(to, []);
    this.adjacencyList.get(from).push(edge);
    return this;
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getEdge(id) {
    return this.edges.get(id);
  }

  getNeighbors(nodeId) {
    return this.adjacencyList.get(nodeId) || [];
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  getAllEdges() {
    return Array.from(this.edges.values());
  }

  nodeCount() {
    return this.nodes.size;
  }

  edgeCount() {
    return this.edges.size;
  }
}

export { Graph, PriorityQueue };
