// Dijkstra's algorithm with binary heap (min-heap) priority queue
// Time Complexity: O(E log V)

//Helps in getting the minimum weight element from the heap
class MinHeap {
  constructor() {
    this.heap = []; //Using simple array instead of a tree
  }

  //Pure Mathematics to find parent, left child, and right child indices
  // Get parent index
  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  // Get left child index
  leftChild(i) {
    return 2 * i + 1;
  }

  // Get right child index
  rightChild(i) {
    return 2 * i + 2;
  }

  // Swap two elements
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Move element up to maintain heap property
  //Helps in putting an element in the right place after it has been inserted at the end of the array.
  //Based on if it's distance is less than its parent's distance, if yes then swap and keep checking till it's not
  bubbleUp(i) {
    while (i > 0 && this.heap[this.parent(i)].distance > this.heap[i].distance) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  // Move element down to maintain heap property
  //Used when we remove the root (min distance) of the min-heap, therefore we need a new root which is the least
  //We compare the current node with its children and swap it with the smallest child, then repeat until the heap property is satisfied
  bubbleDown(i) {
    let minIndex = i;
    const left = this.leftChild(i);
    const right = this.rightChild(i);

    if (left < this.heap.length && this.heap[left].distance < this.heap[minIndex].distance) {
      minIndex = left;
    }
    if (right < this.heap.length && this.heap[right].distance < this.heap[minIndex].distance) {
      minIndex = right;
    }

    if (i !== minIndex) {
      this.swap(i, minIndex);
      this.bubbleDown(minIndex);
    }
  }

  // Insert element - O(log V)
  insert(node) {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1); //To put that in the right place
  }

  // Extract minimum element - O(log V)
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0]; //Root is the minimum element, so we store it in a var to return it
    this.heap[0] = this.heap.pop(); //Replace root with last element (incorrect placement which we will fix)
    this.bubbleDown(0); //Fixing the incorrect placement using bubble down
    return min;
  }

  // Check if heap is empty
  isEmpty() {
    return this.heap.length === 0;
  }

  // Get size
  size() {
    return this.heap.length;
  }

  // Decrease key (update distance and re-heapify) - O(log V)
  // Note: This requires finding the node first, which is O(V)
  // For true O(log V) decrease-key, we'd need a hash map

  //Used when we find a shorter path to a node, we update its distance and use bubble up to maintain heap property
  decreaseKey(node, newDistance) {
    const index = this.heap.indexOf(node);
    if (index === -1) return;

    node.distance = newDistance; //updating its distance (which is lesser then previous)
    this.bubbleUp(index); //maintaining heap property by putting it in correct position
  }
}


//ACTUAL ALGORITHM IMPLEMENTATION
export function dijkstra(grid, startNode, finishNode) {
  const visitedNodesInOrder = []; //This is just to give the visited nodes to the frontend to animate

  // Reset all nodes to prevent pollution from previous runs
  for (const row of grid) {
    for (const node of row) {
      node.distance = Infinity;
      node.isVisited = false;
      node.previousNode = null;
    }
  }

  // Initialize priority queue (min-heap)
  const pq = new MinHeap();

  startNode.distance = 0;
  pq.insert(startNode); //Inserting the start node with distance 0

  while (!pq.isEmpty()) {
    const closestNode = pq.extractMin(); //Extracting the node with minimum distance (root of heap)

    // Skip if already visited or is a wall
    if (closestNode.isVisited || closestNode.isWall) continue;

    // If we reached a node with Infinity distance, remaining are unreachable
    if (closestNode.distance === Infinity) break;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    // Found the goal
    if (closestNode === finishNode) return visitedNodesInOrder;

    // Process neighbors
    const neighbors = getNeighbors(closestNode, grid);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited || neighbor.isWall) continue;

      // Calculate distance to neighbor from current node
      const tentativeDistance = closestNode.distance + neighbor.weight;

      // If we found a shorter path to neighbor from the current node than the previous one
      if (tentativeDistance < neighbor.distance) {
        neighbor.distance = tentativeDistance; //then update its distance
        neighbor.previousNode = closestNode; //and update its previous node

        // If neighbor not in queue, add it
        if (!pq.heap.includes(neighbor)) {
          pq.insert(neighbor); //insert has bubble up already so takes care of sorting to maintain heap property
        } else {
          // Update existing node in queue
          //We updated the distance to a lower value so we need to change its position in the heap.
          pq.decreaseKey(neighbor, tentativeDistance); //decreaseKey has bubble up already so takes care of sorting to maintain heap property
        }
      }
    }
  }

  return visitedNodesInOrder;
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors;
}

export function getNodesInShortestPathOrder(finishNode) {
  // If finish node was never reached (no path exists)
  if (finishNode.previousNode === null && finishNode.distance === Infinity) {
    return [];
  }

  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
