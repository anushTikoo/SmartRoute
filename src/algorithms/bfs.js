export function bfs(grid, startNode, finishNode) {
  const queue = [startNode];
  const visited = new Set();
  const cameFrom = new Map();
  const visitedNodesInOrder = [];

  visited.add(`${startNode.row},${startNode.col}`);
  cameFrom.set(`${startNode.row},${startNode.col}`, null);
  visitedNodesInOrder.push(startNode);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === finishNode) {
      return {
        visitedNodes: visitedNodesInOrder,
        shortestPath: reconstructPath(cameFrom, finishNode)
      };
    }

    const neighbors = getUnvisitedNeighbors(current, grid, visited);

    for (const neighbor of neighbors) {
      if (neighbor.isWall) continue;

      const key = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        cameFrom.set(key, current);
        queue.push(neighbor);
        visitedNodesInOrder.push(neighbor);
      }
    }
  }

  return { visitedNodes: visitedNodesInOrder, shortestPath: [] }; // No path found
}

function getUnvisitedNeighbors(node, grid, visited) {
  const neighbors = [];
  const { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter(n => !visited.has(`${n.row},${n.col}`));
}

function reconstructPath(cameFrom, finishNode) {
  const path = [];
  let current = finishNode;
  const startKey = cameFrom.get(`${finishNode.row},${finishNode.col}`);

  if (startKey === undefined) return []; // No path

  while (current !== null) {
    path.unshift(current);
    current = cameFrom.get(`${current.row},${current.col}`);
  }

  return path;
}
