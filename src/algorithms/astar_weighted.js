// Weighted A* (ε-admissible A*) with ε=3.0
// Uses a weighted heuristic to explore fewer nodes, trading optimality for speed

// Manhattan distance heuristic
function manhattanDistance(nodeA, nodeB) {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

export function astarWeighted(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const openSet = [startNode];
  const closedSet = new Set();
  const epsilon = 3.0; // Weight factor - makes heuristic more dominant (ε>1 = greedy)

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
  startNode.fScore = epsilon * manhattanDistance(startNode, finishNode);
  startNode.previousNode = null;

  while (openSet.length > 0) {
    // Find node with lowest fScore
    let currentNode = openSet[0];
    let currentIndex = 0;

    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].fScore < currentNode.fScore) {
        currentNode = openSet[i];
        currentIndex = i;
      }
    }

    // Remove current from openSet and add to closedSet
    openSet.splice(currentIndex, 1);
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

      const neighborKey = `${neighbor.row},${neighbor.col}`;
      const inOpenSet = openSet.some(n => n === neighbor);

      if (!inOpenSet || tentativeGScore < neighbor.gScore) {
        neighbor.previousNode = currentNode;
        neighbor.gScore = tentativeGScore;
        neighbor.fScore = neighbor.gScore + epsilon * manhattanDistance(neighbor, finishNode);

        if (!inOpenSet) {
          openSet.push(neighbor);
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
