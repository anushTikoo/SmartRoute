import { useState, useCallback, useRef } from 'react';
import Cell from './cell';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import { bfs } from '../algorithms/bfs';
import { astar } from '../algorithms/astar';
import { astarWeighted } from '../algorithms/astar_weighted';

// Import noise generation libraries for procedural map generation
// simplex-noise provides 2D simplex noise for smooth, natural-looking terrain
// alea is a seeded random number generator that ensures reproducible results
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

const ROWS = 30;
const COLS = 30;

const DEFAULT_START_ROW = 5;
const DEFAULT_START_COL = 5;
const DEFAULT_FINISH_ROW = 25;
const DEFAULT_FINISH_COL = 25;

/**
 * Generates a procedural map using seeded noise for deterministic terrain and obstacles.
 *
 * This function creates a 30x30 grid where each cell has:
 * - A weight value (1-9) determined by terrain noise for pathfinding costs
 * - An optional obstacle flag for impassable walls
 *
 * The generation uses two independent noise instances:
 * 1. Terrain noise: Creates clusters of similar terrain weights using low-frequency sampling (0.1 scale)
 * 2. Obstacle noise: Creates natural obstacle clusters using slightly different frequency (0.12 scale)
 *
 * Using different seeds for each noise instance ensures terrain and obstacles are decorrelated,
 * producing more natural-looking maps where obstacles don't always appear in the same terrain type.
 *
 * @param {string} seed - The seed string for deterministic generation. Same seed always produces the same map.
 * @returns {Array<Array<Object>>} A 2D array of cell objects with weight and obstacle properties
 */
function generateMap(seed) {
  // Create the terrain noise instance with a seed derived from the base seed + 'terrain' suffix.
  // This ensures the terrain noise is independent from obstacle noise even with the same base seed.
  // alea() creates a seeded random function that produces the same sequence for the same seed.
  const terrainNoise = createNoise2D(alea(seed + 'terrain'));

  // Create the obstacle noise instance with a different seed suffix for independence.
  // Using 'obstacle' suffix ensures obstacle placement is decorrelated from terrain type.
  const obstacleNoise = createNoise2D(alea(seed + 'obstacle'));

  // Generate the 30x30 grid using nested Array.from calls
  // Outer Array.from creates 30 rows (indexed by r)
  return Array.from({ length: 30 }, (_, r) =>
    // Inner Array.from creates 30 columns for each row (indexed by c)
    Array.from({ length: 30 }, (_, c) => {
      // Sample obstacle noise at coordinates scaled by 0.12 to create clustered obstacle patterns.
      // The 0.12 scale is slightly higher than terrain (0.1) to create finer, more varied obstacle clusters.
      // Lower scale values = larger, smoother features. Higher = more detailed, granular patterns.
      const obstacleVal = obstacleNoise(c * 0.12, r * 0.12);

      // If obstacle noise exceeds threshold (0.55), mark this cell as an impassable wall.
      // The 0.55 threshold is chosen to create ~20-30% obstacle coverage with natural clustering.
      // Cells with obstacleVal > 0.55 become walls with Infinity weight (completely impassable).
      if (obstacleVal > 0.55) return { weight: Infinity, obstacle: true };

      // Sample terrain noise at coordinates scaled by 0.1 to create large, smooth terrain regions.
      // The 0.1 scale produces continent-sized features where similar terrain types cluster together.
      // This creates natural-looking "biomes" of easy/hard traversal areas.
      const val = terrainNoise(c * 0.1, r * 0.1);

      // Map the continuous noise value (-1 to 1) to discrete weight categories (1-9).
      // Simplex noise typically outputs values in approximately [-1, 1] range.
      // We use threshold-based classification to create distinct terrain types:
      // - Weight 9: Very difficult terrain (val > 0.6) - highest movement cost
      // - Weight 7: Difficult terrain (val > 0.35)
      // - Weight 5: Moderate terrain (val > 0.1)
      // - Weight 3: Easy terrain (val > -0.1)
      // - Weight 2: Very easy terrain (val > -0.4)
      // - Weight 1: Easiest terrain (val <= -0.4) - lowest movement cost
      //
      // These thresholds are tuned to produce a balanced distribution of terrain types,
      // with more moderate terrain (weights 3-5) being most common.
      if (val > 0.6)  return { weight: 9 };
      if (val > 0.35) return { weight: 7 };
      if (val > 0.1)  return { weight: 5 };
      if (val > -0.1) return { weight: 3 };
      if (val > -0.4) return { weight: 2 };
      return { weight: 1 };
    })
  );
}

/**
 * Creates a grid node with the specified properties.
 *
 * @param {number} row - Row index of the node
 * @param {number} col - Column index of the node
 * @param {number} startRow - Row index of the start node
 * @param {number} startCol - Column index of the start node
 * @param {number} finishRow - Row index of the finish node
 * @param {number} finishCol - Column index of the finish node
 * @param {number} weight - The terrain weight for this cell (default: 1)
 * @param {boolean} isObstacle - Whether this cell is an impassable obstacle (default: false)
 * @returns {Object} The node object with all grid properties
 */
function createNode(row, col, startRow, startCol, finishRow, finishCol, weight = 1, isObstacle = false) {
  return {
    row,
    col,
    isStart: row === startRow && col === startCol,
    isFinish: row === finishRow && col === finishCol,
    distance: Infinity,
    isVisited: false,
    isWall: isObstacle, // Map obstacle flag to isWall for compatibility with existing pathfinding
    previousNode: null,
    weight: weight,
  };
}

/**
 * Creates the initial grid with procedurally generated terrain.
 *
 * This function uses the generateMap function to create terrain and obstacles,
 * then wraps each cell in a node structure compatible with the pathfinding algorithms.
 *
 * @param {number} startRow - Row index of the start node
 * @param {number} startCol - Column index of the start node
 * @param {number} finishRow - Row index of the finish node
 * @param {number} finishCol - Column index of the finish node
 * @param {string} seed - Seed for procedural generation
 * @returns {Array<Array<Object>>} The initialized grid with terrain and obstacles
 */
function getInitialGrid(startRow, startCol, finishRow, finishCol, seed) {
  // Generate the procedural terrain map using the provided seed.
  // The seed ensures that the same input always produces the exact same output.
  // This is crucial for reproducibility - sharing a seed means sharing the exact same map.
  const mapData = generateMap(seed);

  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLS; col++) {
      // Extract weight and obstacle flag from generated map data
      const cellData = mapData[row][col];
      // Create a node that combines position info with terrain properties
      currentRow.push(createNode(row, col, startRow, startCol, finishRow, finishCol, cellData.weight, cellData.obstacle));
    }
    grid.push(currentRow);
  }
  return grid;
}

function Grid() {
  // State for start and finish node positions on the grid
  const [startPos, setStartPos] = useState({ row: DEFAULT_START_ROW, col: DEFAULT_START_COL });
  const [finishPos, setFinishPos] = useState({ row: DEFAULT_FINISH_ROW, col: DEFAULT_FINISH_COL });

  // State for the seed used in procedural map generation.
  // Initialized with a default seed string for consistent initial experience.
  // Users can change this to generate different maps or share seeds to reproduce specific maps.
  const [mapSeed, setMapSeed] = useState('default-seed-123');

  // State for the grid itself, initialized lazily using the default seed.
  // The useState callback ensures generateMap is only called once during initial render.
  const [grid, setGrid] = useState(() => getInitialGrid(DEFAULT_START_ROW, DEFAULT_START_COL, DEFAULT_FINISH_ROW, DEFAULT_FINISH_COL, 'default-seed-123'));

  // State to track if any pathfinding algorithm is currently running (for UI disabling)
  const [isRunning, setIsRunning] = useState(false);

  // State to control visibility of visited nodes after animation completes.
  // During animation: always true (visited nodes are shown as they are discovered)
  // After animation: defaults to false (visited nodes hidden, only path shown)
  // User can toggle this to review which nodes were explored by the algorithm.
  const [showVisitedNodes, setShowVisitedNodes] = useState(true);

  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [bfsResult, setBfsResult] = useState(null);
  const [astarResult, setAstarResult] = useState(null);
  const [astarWeightedResult, setAstarWeightedResult] = useState(null);
  const [dijkstraComplete, setDijkstraComplete] = useState(false);
  const [bfsComplete, setBfsComplete] = useState(false);
  const [astarComplete, setAstarComplete] = useState(false);
  const [astarWeightedComplete, setAstarWeightedComplete] = useState(false);

  // Store visited nodes and paths for each algorithm
  const [dijkstraVisitedNodes, setDijkstraVisitedNodes] = useState([]);
  const [dijkstraPath, setDijkstraPath] = useState([]);
  const [bfsVisitedNodes, setBfsVisitedNodes] = useState([]);
  const [bfsPath, setBfsPath] = useState([]);
  const [astarVisitedNodes, setAstarVisitedNodes] = useState([]);
  const [astarPath, setAstarPath] = useState([]);
  const [astarWeightedVisitedNodes, setAstarWeightedVisitedNodes] = useState([]);
  const [astarWeightedPath, setAstarWeightedPath] = useState([]);

  const [editMode, setEditMode] = useState('wall'); // 'wall', 'weight', 'start', or 'finish'
  const animationStartTime = useRef(null);

  const handleCellClick = useCallback((row, col) => {
    if (isRunning) return;

    // Handle moving start node
    if (editMode === 'start') {
      if (row === finishPos.row && col === finishPos.col) return; // Can't place on finish
      const oldStart = startPos;
      setStartPos({ row, col });
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(r => r.map(node => ({ ...node })));
        newGrid[oldStart.row][oldStart.col].isStart = false;
        newGrid[row][col].isStart = true;
        return newGrid;
      });
      return;
    }

    // Handle moving finish node
    if (editMode === 'finish') {
      if (row === startPos.row && col === startPos.col) return; // Can't place on start
      const oldFinish = finishPos;
      setFinishPos({ row, col });
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(r => r.map(node => ({ ...node })));
        newGrid[oldFinish.row][oldFinish.col].isFinish = false;
        newGrid[row][col].isFinish = true;
        return newGrid;
      });
      return;
    }

    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      const node = newGrid[row][col];
      if (!node.isStart && !node.isFinish) {
        newGrid[row] = [...newGrid[row]];
        if (editMode === 'wall') {
          newGrid[row][col] = { ...node, isWall: !node.isWall };
        } else {
          // Cycle weight 1-9
          const newWeight = node.weight >= 9 ? 1 : node.weight + 1;
          newGrid[row][col] = { ...node, weight: newWeight };
        }
      }
      return newGrid;
    });
  }, [isRunning, editMode, startPos, finishPos]);

  const clearPath = useCallback(() => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row =>
        row.map(node => ({ ...node, isInPath: false, isVisited: false }))
      );
      return newGrid;
    });
  }, []);

  // Restore visualization for a specific algorithm
  const restoreVisualization = useCallback((algo) => {
    let visitedNodes, path;
    switch (algo) {
      case 'dijkstra':
        visitedNodes = dijkstraVisitedNodes;
        path = dijkstraPath;
        break;
      case 'bfs':
        visitedNodes = bfsVisitedNodes;
        path = bfsPath;
        break;
      case 'astar':
        visitedNodes = astarVisitedNodes;
        path = astarPath;
        break;
      case 'astar-weighted':
        visitedNodes = astarWeightedVisitedNodes;
        path = astarWeightedPath;
        break;
      default:
        visitedNodes = [];
        path = [];
    }

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row =>
        row.map(node => ({ ...node, isInPath: false, isVisited: false }))
      );
      // Mark visited nodes
      visitedNodes.forEach(node => {
        newGrid[node.row][node.col] = { ...newGrid[node.row][node.col], isVisited: true };
      });
      // Mark path
      path.forEach(node => {
        newGrid[node.row][node.col] = { ...newGrid[node.row][node.col], isInPath: true };
      });
      return newGrid;
    });
  }, [dijkstraVisitedNodes, dijkstraPath, bfsVisitedNodes, bfsPath, astarVisitedNodes, astarPath, astarWeightedVisitedNodes, astarWeightedPath]);

  const runAlgorithm = useCallback(() => {
    if (isRunning) return;

    // Clear previous path
    clearPath();

    const freshGrid = getInitialGrid(startPos.row, startPos.col, finishPos.row, finishPos.col);
    // Copy wall status and weights from current grid
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        freshGrid[row][col].isWall = grid[row][col].isWall;
        freshGrid[row][col].weight = grid[row][col].weight;
      }
    }

    const startNode = freshGrid[startPos.row][startPos.col];
    const finishNode = freshGrid[finishPos.row][finishPos.col];

    let visitedNodes, shortestPath;
    if (algorithm === 'dijkstra') {
      visitedNodes = dijkstra(freshGrid, startNode, finishNode);
      shortestPath = getNodesInShortestPathOrder(finishNode);
    } else if (algorithm === 'bfs') {
      const result = bfs(freshGrid, startNode, finishNode);
      visitedNodes = result.visitedNodes;
      shortestPath = result.shortestPath;
    } else if (algorithm === 'astar') {
      const result = astar(freshGrid, startNode, finishNode);
      visitedNodes = result.visitedNodes;
      shortestPath = result.shortestPath;
    } else {
      const result = astarWeighted(freshGrid, startNode, finishNode);
      visitedNodes = result.visitedNodes;
      shortestPath = result.shortestPath;
    }

    // Check if path exists
    const hasPath = shortestPath.length > 0;

    // Calculate total weight and path length
    const weight = hasPath ? shortestPath.reduce((sum, node) => sum + node.weight, 0) : 0;
    const length = shortestPath.length;

    // Calculate time taken to reach goal (before animation starts)
    const timeToGoal = visitedNodes.length * 30; // 30ms per visited cell

    // Store result for the specific algorithm
    const visitedCount = visitedNodes.length;
    if (algorithm === 'dijkstra') {
      setDijkstraResult({ weight, length, noPath: !hasPath, timeToGoal, visitedCount });
      setDijkstraVisitedNodes(visitedNodes);
      setDijkstraPath(shortestPath);
    } else if (algorithm === 'bfs') {
      setBfsResult({ weight, length, noPath: !hasPath, timeToGoal, visitedCount });
      setBfsVisitedNodes(visitedNodes);
      setBfsPath(shortestPath);
    } else if (algorithm === 'astar') {
      setAstarResult({ weight, length, noPath: !hasPath, timeToGoal, visitedCount });
      setAstarVisitedNodes(visitedNodes);
      setAstarPath(shortestPath);
    } else {
      setAstarWeightedResult({ weight, length, noPath: !hasPath, timeToGoal, visitedCount });
      setAstarWeightedVisitedNodes(visitedNodes);
      setAstarWeightedPath(shortestPath);
    }

    setIsRunning(true);
    animationStartTime.current = Date.now();

    // First animate visited cells, then shortest path
    animateVisitedThenPath(visitedNodes, shortestPath, algorithm);
  }, [grid, isRunning, algorithm, clearPath]);

  const animateVisitedThenPath = (visitedNodes, shortestPath, algo) => {
    let step = 0;
    const visitedInterval = setInterval(() => {
      if (step >= visitedNodes.length) {
        clearInterval(visitedInterval);
        // Now animate the shortest path
        animateShortestPath(shortestPath, algo);
        return;
      }

      const node = visitedNodes[step];
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        newGrid[node.row] = [...newGrid[node.row]];
        newGrid[node.row][node.col] = {
          ...newGrid[node.row][node.col],
          isVisited: true
        };
        return newGrid;
      });

      step++;
    }, 30);
  };

  const animateShortestPath = (shortestPath, algo) => {
    // If no path, skip animation and mark complete
    if (shortestPath.length === 0) {
      setIsRunning(false);
      // After animation completes (even with no path), hide visited nodes by default
      // User can toggle them back on if they want to see explored nodes
      setShowVisitedNodes(false);
      if (algo === 'dijkstra') {
        setDijkstraComplete(true);
      } else if (algo === 'bfs') {
        setBfsComplete(true);
      } else if (algo === 'astar') {
        setAstarComplete(true);
      } else {
        setAstarWeightedComplete(true);
      }
      return;
    }

    let step = 0;
    const pathInterval = setInterval(() => {
      if (step >= shortestPath.length) {
        clearInterval(pathInterval);
        setIsRunning(false);
        // Animation complete: hide visited nodes by default, showing only the path
        // This makes the final result cleaner - users see the path clearly against terrain colors
        // They can toggle visited nodes back on using the button if they want to review algorithm exploration
        setShowVisitedNodes(false);
        if (algo === 'dijkstra') {
          setDijkstraComplete(true);
        } else if (algo === 'bfs') {
          setBfsComplete(true);
        } else if (algo === 'astar') {
          setAstarComplete(true);
        } else {
          setAstarWeightedComplete(true);
        }
        return;
      }

      const node = shortestPath[step];
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        newGrid[node.row] = [...newGrid[node.row]];
        newGrid[node.row][node.col] = {
          ...newGrid[node.row][node.col],
          isInPath: true
        };
        return newGrid;
      });

      step++;
    }, 100);
  };

  /**
   * Generates a new random seed string for map generation.
   * Uses timestamp and random components to create unique seeds.
   * Each call produces a different seed, resulting in a completely different map.
   *
   * @returns {string} A randomly generated seed string
   */
  const generateRandomSeed = useCallback(() => {
    // Combine timestamp (for uniqueness) with random number (for extra entropy)
    // toString(36) converts to alphanumeric string for readability
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }, []);

  /**
   * Regenerates the map with a new seed and resets all algorithm state.
   * This is called when the user clicks "Randomize" or manually changes the seed.
   *
   * IMPORTANT: Re-runs ALT landmark precomputation implicitly by clearing all
   * cached pathfinding results. In a full ALT (A* with Landmarks and Triangle inequality)
   * implementation, this is where landmark distances would be recomputed for the new map.
   *
   * @param {string} newSeed - The new seed to use for map generation
   */
  const regenerateMap = useCallback((newSeed) => {
    // Prevent map regeneration while algorithms are running to avoid state inconsistencies
    if (isRunning) return;

    // Update the seed state to reflect the new map
    setMapSeed(newSeed);

    // Reset start and finish positions to their defaults.
    // This ensures they don't end up inside obstacles on the new map.
    setStartPos({ row: DEFAULT_START_ROW, col: DEFAULT_START_COL });
    setFinishPos({ row: DEFAULT_FINISH_ROW, col: DEFAULT_FINISH_COL });

    // Generate a completely new grid using the provided seed.
    // The generateMap function ensures the same seed always produces the same terrain.
    setGrid(getInitialGrid(DEFAULT_START_ROW, DEFAULT_START_COL, DEFAULT_FINISH_ROW, DEFAULT_FINISH_COL, newSeed));

    // Clear all algorithm results and cached state.
    // This effectively "re-runs" precomputation by forcing algorithms to recalculate
    // on the new map topology rather than using stale cached results.
    setDijkstraResult(null);
    setBfsResult(null);
    setAstarResult(null);
    setAstarWeightedResult(null);
    setDijkstraComplete(false);
    setBfsComplete(false);
    setAstarComplete(false);
    setAstarWeightedComplete(false);

    // Clear cached visited nodes and paths for all algorithms.
    // These caches store visualization state and must be invalidated when the map changes.
    setDijkstraVisitedNodes([]);
    setDijkstraPath([]);
    setBfsVisitedNodes([]);
    setBfsPath([]);
    setAstarVisitedNodes([]);
    setAstarPath([]);
    setAstarWeightedVisitedNodes([]);
    setAstarWeightedPath([]);
  }, [isRunning]);

  /**
   * Resets the grid to its initial state using the current seed.
   * This clears path visualizations but keeps the same map terrain.
   */
  const resetGrid = useCallback(() => {
    if (isRunning) return;
    setStartPos({ row: DEFAULT_START_ROW, col: DEFAULT_START_COL });
    setFinishPos({ row: DEFAULT_FINISH_ROW, col: DEFAULT_FINISH_COL });
    // Re-generate using the current seed to maintain the same map terrain
    setGrid(getInitialGrid(DEFAULT_START_ROW, DEFAULT_START_COL, DEFAULT_FINISH_ROW, DEFAULT_FINISH_COL, mapSeed));
    setDijkstraResult(null);
    setBfsResult(null);
    setAstarResult(null);
    setAstarWeightedResult(null);
    setDijkstraComplete(false);
    setBfsComplete(false);
    setAstarComplete(false);
    setAstarWeightedComplete(false);
    // Clear cached visited nodes and paths
    setDijkstraVisitedNodes([]);
    setDijkstraPath([]);
    setBfsVisitedNodes([]);
    setBfsPath([]);
    setAstarVisitedNodes([]);
    setAstarPath([]);
    setAstarWeightedVisitedNodes([]);
    setAstarWeightedPath([]);
  }, [isRunning, mapSeed]);

  return (
    <div className="flex flex-col items-center gap-4">
      {dijkstraResult && dijkstraComplete && (
        <div className={`text-lg font-bold px-4 py-2 rounded ${dijkstraResult.noPath ? 'bg-red-100 text-red-700' : 'bg-green-100 text-gray-700'}`}>
          Dijkstra - {dijkstraResult.noPath ? (
            <span className="text-red-600">Goal not reached</span>
          ) : (
            <>
              Weight: <span className="text-blue-600">{dijkstraResult.weight}</span>
              <span className="text-gray-500 text-sm ml-2">({dijkstraResult.length} cells)</span>
              <span className="text-orange-600 text-sm ml-2">[{dijkstraResult.timeToGoal}ms]</span>
              <span className="text-gray-600 text-sm ml-2">[{dijkstraResult.visitedCount} visited]</span>
            </>
          )}
        </div>
      )}

      {bfsResult && bfsComplete && (
        <div className={`text-lg font-bold px-4 py-2 rounded ${bfsResult.noPath ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-gray-700'}`}>
          BFS - {bfsResult.noPath ? (
            <span className="text-red-600">Goal not reached</span>
          ) : (
            <>
              Weight: <span className="text-blue-600">{bfsResult.weight}</span>
              <span className="text-gray-500 text-sm ml-2">({bfsResult.length} cells)</span>
              <span className="text-orange-600 text-sm ml-2">[{bfsResult.timeToGoal}ms]</span>
              <span className="text-gray-600 text-sm ml-2">[{bfsResult.visitedCount} visited]</span>
            </>
          )}
        </div>
      )}

      {astarResult && astarComplete && (
        <div className={`text-lg font-bold px-4 py-2 rounded ${astarResult.noPath ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-gray-700'}`}>
          A* - {astarResult.noPath ? (
            <span className="text-red-600">Goal not reached</span>
          ) : (
            <>
              Weight: <span className="text-blue-600">{astarResult.weight}</span>
              <span className="text-gray-500 text-sm ml-2">({astarResult.length} cells)</span>
              <span className="text-orange-600 text-sm ml-2">[{astarResult.timeToGoal}ms]</span>
              <span className="text-gray-600 text-sm ml-2">[{astarResult.visitedCount} visited]</span>
            </>
          )}
        </div>
      )}

      {astarWeightedResult && astarWeightedComplete && (
        <div className={`text-lg font-bold px-4 py-2 rounded ${astarWeightedResult.noPath ? 'bg-red-100 text-red-700' : 'bg-red-50 text-gray-700'}`}>
          Weighted A* (ε=3.0) - {astarWeightedResult.noPath ? (
            <span className="text-red-600">Goal not reached</span>
          ) : (
            <>
              Weight: <span className="text-blue-600">{astarWeightedResult.weight}</span>
              <span className="text-gray-500 text-sm ml-2">({astarWeightedResult.length} cells)</span>
              <span className="text-orange-600 text-sm ml-2">[{astarWeightedResult.timeToGoal}ms]</span>
              <span className="text-gray-600 text-sm ml-2">[{astarWeightedResult.visitedCount} visited]</span>
            </>
          )}
        </div>
      )}

      {/* Seed input section - allows users to enter custom seeds or randomize */}
      <div className="flex gap-2 items-center bg-white p-3 rounded shadow-sm border border-gray-200">
        <label htmlFor="seed-input" className="text-sm font-semibold text-gray-700">
          Map Seed:
        </label>
        <input
          id="seed-input"
          type="text"
          value={mapSeed}
          onChange={(e) => setMapSeed(e.target.value)}
          disabled={isRunning}
          className="px-3 py-1 border border-gray-300 rounded text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Enter seed..."
          title="Enter any text to generate a specific map. Same seed = same map."
        />
        <button
          onClick={() => regenerateMap(mapSeed)}
          disabled={isRunning}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title="Generate map from current seed"
        >
          Generate
        </button>
        <button
          onClick={() => regenerateMap(generateRandomSeed())}
          disabled={isRunning}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title="Generate a random map with a new seed"
        >
          Randomize
        </button>
      </div>

      {/* Primary action buttons for running algorithms and resetting */}
      <div className="flex gap-4">
        <button
          onClick={runAlgorithm}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {isRunning ? 'Running...' : `Run ${algorithm === 'dijkstra' ? 'Dijkstra' : algorithm === 'astar' ? 'A*' : algorithm === 'astar-weighted' ? 'Weighted A*' : 'BFS'}`}
        </button>
        <button
          onClick={resetGrid}
          disabled={isRunning}
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:bg-gray-400"
        >
          Reset
        </button>
      </div>

      {/* Toggle button to show/hide visited nodes after animation completes */}
      {/* During animation this has no effect; after animation it toggles visibility */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowVisitedNodes(prev => !prev)}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${showVisitedNodes ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-700'}`}
          title={showVisitedNodes ? 'Hide visited nodes (showing terrain colors)' : 'Show visited nodes explored by algorithm'}
        >
          {showVisitedNodes ? 'Hide Visited Nodes' : 'Show Visited Nodes'}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setAlgorithm('dijkstra');
            restoreVisualization('dijkstra');
          }}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${algorithm === 'dijkstra' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Dijkstra (weighted)
        </button>
        <button
          onClick={() => {
            setAlgorithm('bfs');
            restoreVisualization('bfs');
          }}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${algorithm === 'bfs' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
        >
          BFS (unweighted)
        </button>
        <button
          onClick={() => {
            setAlgorithm('astar');
            restoreVisualization('astar');
          }}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${algorithm === 'astar' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          A* (Manhattan)
        </button>
        <button
          onClick={() => {
            setAlgorithm('astar-weighted');
            restoreVisualization('astar-weighted');
          }}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${algorithm === 'astar-weighted' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          Weighted A* (ε=3.0)
        </button>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        <span className="text-sm font-semibold self-center">Edit Mode:</span>
        <button
          onClick={() => setEditMode('wall')}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${editMode === 'wall' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
        >
          Wall
        </button>
        <button
          onClick={() => setEditMode('weight')}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${editMode === 'weight' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          Weight (click to cycle 1-9)
        </button>
        <button
          onClick={() => setEditMode('start')}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${editMode === 'start' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Move Start
        </button>
        <button
          onClick={() => setEditMode('finish')}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${editMode === 'finish' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          Move Finish
        </button>
      </div>

      {/* Legend explaining the visual elements of the grid */}
      <div className="flex gap-4 text-sm flex-wrap justify-center bg-white p-3 rounded shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500"></div>
          <span>Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500"></div>
          <span>Finish</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800"></div>
          <span>Wall (obstacle)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400"></div>
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400"></div>
          <span>Shortest Path</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">1-9</span>
          <span>Terrain Weights (procedural)</span>
        </div>
      </div>

      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {grid.map((row, rowIdx) => (
          row.map((node, colIdx) => (
            <Cell
              key={`${rowIdx}-${colIdx}`}
              row={node.row}
              col={node.col}
              isStart={node.isStart}
              isFinish={node.isFinish}
              isWall={node.isWall}
              isVisited={node.isVisited}
              isInPath={node.isInPath}
              weight={node.weight}
              showVisited={showVisitedNodes}
              onClick={handleCellClick}
            />
          ))
        ))}
      </div>
    </div>
  );
}

export default Grid;
