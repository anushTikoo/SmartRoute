// A* Search with binary heap (min-heap) priority queue
// Time Complexity: O(E log V)
//f(n) = g(n) + h(n)
//g(n) = cost from start to n
//h(n) = heuristic cost from n to goal
//f(n) = total estimated cost of path through n to goal
//In case of dijikstra f(n) = g(n) {h(n) = 0}

// Manhattan distance heuristic
function manhattanDistance(nodeA, nodeB) {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

// Min-Heap class for priority queue
class MinHeap {
  constructor() {
    this.heap = [];
  }

  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  leftChild(i) {
    return 2 * i + 1;
  }

  rightChild(i) {
    return 2 * i + 2;
  }

  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  bubbleUp(i) {
    while (i > 0 && this.heap[this.parent(i)].fScore > this.heap[i].fScore) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  bubbleDown(i) {
    let minIndex = i;
    const left = this.leftChild(i);
    const right = this.rightChild(i);

    if (left < this.heap.length && this.heap[left].fScore < this.heap[minIndex].fScore) {
      minIndex = left;
    }
    if (right < this.heap.length && this.heap[right].fScore < this.heap[minIndex].fScore) {
      minIndex = right;
    }

    if (i !== minIndex) {
      this.swap(i, minIndex);
      this.bubbleDown(minIndex);
    }
  }

  insert(node) {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }

  decreaseKey(node, newFScore) {
    const index = this.heap.indexOf(node);
    if (index === -1) return;
    node.fScore = newFScore;
    this.bubbleUp(index);
  }

  includes(node) {
    return this.heap.includes(node);
  }
}

export function astar(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const openSet = new MinHeap(); //The priority queue used in dijkstra too
  const closedSet = new Set(); //To keep track of nodes that have been processed

  // Reset all nodes to prevent pollution from previous runs
  for (const row of grid) {
    for (const node of row) {
      node.gScore = Infinity;
      node.fScore = Infinity;
      node.previousNode = null;
    }
  }

  // Initialize start node
  startNode.gScore = 0;
  startNode.fScore = manhattanDistance(startNode, finishNode);
  startNode.previousNode = null;
  openSet.insert(startNode);

  while (!openSet.isEmpty()) {
    // Extract node with lowest fScore - O(log V)
    const currentNode = openSet.extractMin();
    closedSet.add(`${currentNode.row},${currentNode.col}`);

    if (currentNode.isWall) continue;

    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    // Found the goal
    if (currentNode === finishNode) {
      return {
        visitedNodes: visitedNodesInOrder,
        shortestPath: reconstructPath(finishNode)
      };
    }

    // Check neighbors
    const neighbors = getUnvisitedNeighbors(currentNode, grid, closedSet);

    for (const neighbor of neighbors) {
      if (neighbor.isWall) continue;

      const tentativeGScore = currentNode.gScore + neighbor.weight;

      const inOpenSet = openSet.includes(neighbor);

      if (!inOpenSet || tentativeGScore < neighbor.gScore) {
        neighbor.previousNode = currentNode;
        neighbor.gScore = tentativeGScore;
        neighbor.fScore = neighbor.gScore + manhattanDistance(neighbor, finishNode);

        if (!inOpenSet) {
          openSet.insert(neighbor);
        } else {
          openSet.decreaseKey(neighbor, neighbor.fScore);
        }
      }
    }
  }

  // No path found
  return { visitedNodes: visitedNodesInOrder, shortestPath: [] };
}

function getUnvisitedNeighbors(node, grid, closedSet) {
  const neighbors = [];
  const { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter(n => !closedSet.has(`${n.row},${n.col}`));
}

function reconstructPath(finishNode) {
  const path = [];
  let current = finishNode;

  // Check if finish was reached
  if (finishNode.previousNode === null) {
    return [];
  }

  while (current !== null) {
    path.unshift(current);
    current = current.previousNode;
  }

  return path;
}
