/**
 * useAlgorithmRunner Hook
 *
 * This custom hook manages the execution and animation of pathfinding algorithms.
 * It handles:
 * - Running the selected algorithm (Dijkstra, BFS, A*, etc.)
 * - Animating visited nodes and the shortest path
 * - Storing results for each algorithm
 * - Restoring visualizations when switching between algorithms
 *
 * Separating this logic keeps the main Grid component focused on layout and composition.
 */

import { useState, useCallback, useRef } from 'react';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import { bfs } from '../algorithms/bfs';
import { astar } from '../algorithms/astar';
import { astarWeighted } from '../algorithms/astar_weighted';
import { ALGORITHMS, ANIMATION_TIMING } from '../constants/grid';
import { createFreshGrid } from '../utils/gridUtils';

export function useAlgorithmRunner(grid, startPos, finishPos, setGrid, isRunning, setIsRunning, setShowVisitedNodes) {
  // Currently selected algorithm
  const [algorithm, setAlgorithm] = useState(ALGORITHMS.DIJKSTRA);

  // Epsilon (weight factor) for Weighted A* algorithm
  // Range: 2 to 5. Higher values make the algorithm more greedy (faster but less optimal)
  const [epsilon, setEpsilon] = useState(3.0);

  // Results and completion state for each algorithm
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [bfsResult, setBfsResult] = useState(null);
  const [astarResult, setAstarResult] = useState(null);
  // Store multiple Weighted A* results keyed by epsilon value
  // Structure: { epsilon: { result, visitedNodes, path, complete } }
  const [astarWeightedResults, setAstarWeightedResults] = useState({});
  const [dijkstraComplete, setDijkstraComplete] = useState(false);
  const [bfsComplete, setBfsComplete] = useState(false);
  const [astarComplete, setAstarComplete] = useState(false);

  // Store visited nodes and paths for each algorithm (for visualization restoration)
  const [dijkstraVisitedNodes, setDijkstraVisitedNodes] = useState([]);
  const [dijkstraPath, setDijkstraPath] = useState([]);
  const [bfsVisitedNodes, setBfsVisitedNodes] = useState([]);
  const [bfsPath, setBfsPath] = useState([]);
  const [astarVisitedNodes, setAstarVisitedNodes] = useState([]);
  const [astarPath, setAstarPath] = useState([]);

  const animationStartTime = useRef(null);

  /**
   * Clears all algorithm results and cached data.
   * Called when regenerating or resetting the map.
   */
  const clearAlgorithmData = useCallback(() => {
    setDijkstraResult(null);
    setBfsResult(null);
    setAstarResult(null);
    setAstarWeightedResults({});
    setDijkstraComplete(false);
    setBfsComplete(false);
    setAstarComplete(false);
    setDijkstraVisitedNodes([]);
    setDijkstraPath([]);
    setBfsVisitedNodes([]);
    setBfsPath([]);
    setAstarVisitedNodes([]);
    setAstarPath([]);
  }, []);

  /**
   * Restores visualization for a specific algorithm when switching between them.
   * Updates the grid to show the cached visited nodes and path for the selected algorithm.
   */
  const restoreVisualization = useCallback((algo) => {
    let visitedNodes, path;
    switch (algo) {
      case ALGORITHMS.DIJKSTRA:
        visitedNodes = dijkstraVisitedNodes;
        path = dijkstraPath;
        break;
      case ALGORITHMS.BFS:
        visitedNodes = bfsVisitedNodes;
        path = bfsPath;
        break;
      case ALGORITHMS.ASTAR:
        visitedNodes = astarVisitedNodes;
        path = astarPath;
        break;
      case ALGORITHMS.ASTAR_WEIGHTED:
        // Get the cached result for current epsilon if it exists
        const cachedWeighted = astarWeightedResults[epsilon];
        visitedNodes = cachedWeighted?.visitedNodes || [];
        path = cachedWeighted?.path || [];
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
  }, [dijkstraVisitedNodes, dijkstraPath, bfsVisitedNodes, bfsPath, astarVisitedNodes, astarPath, astarWeightedResults, epsilon, setGrid]);

  /**
   * Handles the algorithm selection change.
   * Updates the selected algorithm and restores its visualization if available.
   */
  const handleAlgorithmChange = useCallback((newAlgorithm) => {
    setAlgorithm(newAlgorithm);
    restoreVisualization(newAlgorithm);
  }, [restoreVisualization]);

  /**
   * Animates the visited nodes being discovered by the algorithm.
   * Shows each visited node with a delay to visualize the search process.
   */
  const animateVisitedThenPath = useCallback((visitedNodes, shortestPath, algo, onComplete) => {
    let step = 0;
    const visitedInterval = setInterval(() => {
      if (step >= visitedNodes.length) {
        clearInterval(visitedInterval);
        // Now animate the shortest path
        animateShortestPath(shortestPath, algo, onComplete);
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
    }, ANIMATION_TIMING.VISITED_STEP_DELAY);
  }, [setGrid]);

  /**
   * Animates the shortest path from start to finish.
   * Called after all visited nodes have been animated.
   */
  const animateShortestPath = useCallback((shortestPath, algo, onComplete) => {
    // If no path, skip animation and mark complete
    if (shortestPath.length === 0) {
      setIsRunning(false);
      setShowVisitedNodes(false); // Hide visited nodes by default after completion
      onComplete();
      return;
    }

    let step = 0;
    const pathInterval = setInterval(() => {
      if (step >= shortestPath.length) {
        clearInterval(pathInterval);
        setIsRunning(false);
        // Animation complete: hide visited nodes by default, showing only the path
        setShowVisitedNodes(false);
        onComplete();
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
    }, ANIMATION_TIMING.PATH_STEP_DELAY);
  }, [setGrid, setIsRunning, setShowVisitedNodes]);

  /**
   * Runs the currently selected pathfinding algorithm.
   * Executes the algorithm, calculates metrics, and starts the animation.
   */
  const runAlgorithm = useCallback((clearPathFn) => {
    if (isRunning) return;

    // Clear previous path visualization
    clearPathFn();

    // Create a fresh grid copy for the algorithm (to avoid mutating display grid during algorithm)
    const freshGrid = createFreshGrid(grid, startPos.row, startPos.col, finishPos.row, finishPos.col);

    const startNode = freshGrid[startPos.row][startPos.col];
    const finishNode = freshGrid[finishPos.row][finishPos.col];

    let visitedNodes, shortestPath;

    // Execute the selected algorithm
    switch (algorithm) {
      case ALGORITHMS.DIJKSTRA:
        visitedNodes = dijkstra(freshGrid, startNode, finishNode);
        shortestPath = getNodesInShortestPathOrder(finishNode);
        break;
      case ALGORITHMS.BFS:
        const bfsResult = bfs(freshGrid, startNode, finishNode);
        visitedNodes = bfsResult.visitedNodes;
        shortestPath = bfsResult.shortestPath;
        break;
      case ALGORITHMS.ASTAR:
        const astarResult = astar(freshGrid, startNode, finishNode);
        visitedNodes = astarResult.visitedNodes;
        shortestPath = astarResult.shortestPath;
        break;
      case ALGORITHMS.ASTAR_WEIGHTED:
        const astarWeightedResult = astarWeighted(freshGrid, startNode, finishNode, epsilon);
        visitedNodes = astarWeightedResult.visitedNodes;
        shortestPath = astarWeightedResult.shortestPath;
        break;
      default:
        return;
    }

    // Calculate metrics
    const hasPath = shortestPath.length > 0;
    const weight = hasPath ? shortestPath.reduce((sum, node) => sum + node.weight, 0) : 0;
    const length = shortestPath.length;
    const timeToGoal = visitedNodes.length * ANIMATION_TIMING.VISITED_STEP_DELAY;
    const visitedCount = visitedNodes.length;

    // Store result and visited data for the specific algorithm
    const resultData = { weight, length, noPath: !hasPath, timeToGoal, visitedCount };

    switch (algorithm) {
      case ALGORITHMS.DIJKSTRA:
        setDijkstraResult(resultData);
        setDijkstraVisitedNodes(visitedNodes);
        setDijkstraPath(shortestPath);
        break;
      case ALGORITHMS.BFS:
        setBfsResult(resultData);
        setBfsVisitedNodes(visitedNodes);
        setBfsPath(shortestPath);
        break;
      case ALGORITHMS.ASTAR:
        setAstarResult(resultData);
        setAstarVisitedNodes(visitedNodes);
        setAstarPath(shortestPath);
        break;
      case ALGORITHMS.ASTAR_WEIGHTED:
        // Store result keyed by epsilon value to support multiple results
        setAstarWeightedResults(prev => ({
          ...prev,
          [epsilon]: {
            result: resultData,
            visitedNodes,
            path: shortestPath,
            complete: false
          }
        }));
        break;
    }

    setIsRunning(true);
    animationStartTime.current = Date.now();

    // Start the animation sequence
    const onComplete = () => {
      switch (algorithm) {
        case ALGORITHMS.DIJKSTRA:
          setDijkstraComplete(true);
          break;
        case ALGORITHMS.BFS:
          setBfsComplete(true);
          break;
        case ALGORITHMS.ASTAR:
          setAstarComplete(true);
          break;
        case ALGORITHMS.ASTAR_WEIGHTED:
          // Mark the current epsilon result as complete
          setAstarWeightedResults(prev => ({
            ...prev,
            [epsilon]: {
              ...prev[epsilon],
              complete: true
            }
          }));
          break;
      }
    };

    animateVisitedThenPath(visitedNodes, shortestPath, algorithm, onComplete);
  }, [grid, startPos, finishPos, algorithm, epsilon, isRunning, setGrid, setIsRunning, setShowVisitedNodes, animateVisitedThenPath]);

  return {
    // State
    algorithm,
    epsilon,
    dijkstraResult,
    bfsResult,
    astarResult,
    // Now returns all Weighted A* results keyed by epsilon
    astarWeightedResults,
    dijkstraComplete,
    bfsComplete,
    astarComplete,

    // Actions
    setAlgorithm: handleAlgorithmChange,
    setEpsilon,
    runAlgorithm,
    restoreVisualization,
    clearAlgorithmData,
  };
}
