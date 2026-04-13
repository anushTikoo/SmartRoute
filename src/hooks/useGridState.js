/**
 * useGridState Hook
 * 
 * This custom hook manages all state related to the grid itself:
 * - Grid data structure (2D array of nodes)
 * - Start and finish node positions
 * - Map seed for procedural generation
 * - Edit mode for user interactions
 * - Visited nodes visibility toggle
 * 
 * Encapsulating grid state in a hook keeps the main Grid component cleaner
 * and makes it easier to reuse grid state logic if needed elsewhere.
 */

import { useState, useCallback } from 'react';
import { 
  DEFAULT_START_ROW, 
  DEFAULT_START_COL, 
  DEFAULT_FINISH_ROW, 
  DEFAULT_FINISH_COL,
  DEFAULT_MAP_SEED,
  EDIT_MODES,
} from '../constants/grid';
import { getInitialGrid } from '../utils/gridUtils';
import { generateRandomSeed } from '../utils/mapGenerator';

export function useGridState() {
  // State for start and finish node positions on the grid
  const [startPos, setStartPos] = useState({ 
    row: DEFAULT_START_ROW, 
    col: DEFAULT_START_COL 
  });
  const [finishPos, setFinishPos] = useState({ 
    row: DEFAULT_FINISH_ROW, 
    col: DEFAULT_FINISH_COL 
  });
  
  // State for the seed used in procedural map generation.
  // Initialized with a default seed string for consistent initial experience.
  const [mapSeed, setMapSeed] = useState(DEFAULT_MAP_SEED);
  
  // State for the grid itself, initialized lazily using the default seed.
  // The useState callback ensures generateMap is only called once during initial render.
  const [grid, setGrid] = useState(() => 
    getInitialGrid(DEFAULT_START_ROW, DEFAULT_START_COL, DEFAULT_FINISH_ROW, DEFAULT_FINISH_COL, DEFAULT_MAP_SEED)
  );
  
  // State to track if any pathfinding algorithm is currently running (for UI disabling)
  const [isRunning, setIsRunning] = useState(false);
  
  // State to control visibility of visited nodes after animation completes.
  // During animation: always true (visited nodes are shown as they are discovered)
  // After animation: defaults to false (visited nodes hidden, only path shown)
  const [showVisitedNodes, setShowVisitedNodes] = useState(true);
  
  // Current edit mode: 'wall', 'weight', 'start', or 'finish'
  const [editMode, setEditMode] = useState(EDIT_MODES.WALL);

  /**
   * Handles cell click events based on current edit mode.
   * - 'wall': Toggle wall on/off
   * - 'weight': Cycle through weight values 1-9
   * - 'start': Move start node to clicked cell
   * - 'finish': Move finish node to clicked cell
   */
  const handleCellClick = useCallback((row, col) => {
    if (isRunning) return;

    // Handle moving start node
    if (editMode === EDIT_MODES.START) {
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
    if (editMode === EDIT_MODES.FINISH) {
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

    // Handle wall toggle or weight change
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      const node = newGrid[row][col];
      if (!node.isStart && !node.isFinish) {
        newGrid[row] = [...newGrid[row]];
        if (editMode === EDIT_MODES.WALL) {
          newGrid[row][col] = { ...node, isWall: !node.isWall };
        } else {
          // Cycle weight through valid values: 1, 2, 3, 5, 7, 9
          const weightSequence = [1, 2, 3, 5, 7, 9];
          const currentIndex = weightSequence.indexOf(node.weight);
          const newWeight = weightSequence[(currentIndex + 1) % weightSequence.length];
          newGrid[row][col] = { ...node, weight: newWeight };
        }
      }
      return newGrid;
    });
  }, [isRunning, editMode, startPos, finishPos]);

  /**
   * Clears path and visited state from the grid.
   * Preserves terrain weights and wall positions.
   */
  const clearPath = useCallback(() => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row =>
        row.map(node => ({ ...node, isInPath: false, isVisited: false }))
      );
      return newGrid;
    });
  }, []);

  /**
   * Regenerates the map with a new seed and resets positions.
   * Clears all algorithm state (effectively re-runs precomputation).
   * 
   * @param {string} newSeed - The new seed to use for map generation
   */
  const regenerateMap = useCallback((newSeed) => {
    if (isRunning) return;
    
    setMapSeed(newSeed);
    setStartPos({ row: DEFAULT_START_ROW, col: DEFAULT_START_COL });
    setFinishPos({ row: DEFAULT_FINISH_ROW, col: DEFAULT_FINISH_COL });
    setGrid(getInitialGrid(DEFAULT_START_ROW, DEFAULT_START_COL, DEFAULT_FINISH_ROW, DEFAULT_FINISH_COL, newSeed));
    setShowVisitedNodes(true);
  }, [isRunning]);

  /**
   * Resets the grid to its initial state using the current seed.
   * Clears path visualizations but keeps the same map terrain.
   */
  const resetGrid = useCallback(() => {
    if (isRunning) return;
    setStartPos({ row: DEFAULT_START_ROW, col: DEFAULT_START_COL });
    setFinishPos({ row: DEFAULT_FINISH_ROW, col: DEFAULT_FINISH_COL });
    setGrid(getInitialGrid(DEFAULT_START_ROW, DEFAULT_START_COL, DEFAULT_FINISH_ROW, DEFAULT_FINISH_COL, mapSeed));
    setShowVisitedNodes(true);
  }, [isRunning, mapSeed]);

  /**
   * Generates a random seed and regenerates the map.
   */
  const randomizeMap = useCallback(() => {
    regenerateMap(generateRandomSeed());
  }, [regenerateMap]);

  return {
    // State
    grid,
    startPos,
    finishPos,
    mapSeed,
    isRunning,
    showVisitedNodes,
    editMode,
    
    // Setters
    setGrid,
    setIsRunning,
    setShowVisitedNodes,
    setEditMode,
    setMapSeed,
    
    // Actions
    handleCellClick,
    clearPath,
    regenerateMap,
    resetGrid,
    randomizeMap,
  };
}
