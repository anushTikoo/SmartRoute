/**
 * Grid Utilities
 * 
 * This module provides utility functions for creating and manipulating grid nodes.
 * It handles the conversion from raw map data to grid node structures that are
 * compatible with the pathfinding algorithms.
 */

import { generateMap } from './mapGenerator';
import { ROWS, COLS } from '../constants/grid';

/**
 * Creates a grid node with the specified properties.
 * 
 * A node represents a single cell in the grid and contains:
 * - Position information (row, col)
 * - State flags (isStart, isFinish, isWall, isVisited)
 * - Pathfinding data (distance, previousNode)
 * - Terrain weight for weighted pathfinding
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
export function createNode(row, col, startRow, startCol, finishRow, finishCol, weight = 1, isObstacle = false) {
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
export function getInitialGrid(startRow, startCol, finishRow, finishCol, seed) {
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

/**
 * Creates a fresh grid copy with cleared path and visited states.
 * 
 * This is used before running a new algorithm to ensure clean state
 * while preserving terrain weights and wall positions.
 * 
 * @param {Array<Array<Object>>} sourceGrid - The source grid to copy wall/weight data from
 * @param {number} startRow - Row index of the start node
 * @param {number} startCol - Column index of the start node
 * @param {number} finishRow - Row index of the finish node
 * @param {number} finishCol - Column index of the finish node
 * @returns {Array<Array<Object>>} A fresh grid with copied terrain data but cleared state
 */
export function createFreshGrid(sourceGrid, startRow, startCol, finishRow, finishCol) {
  const freshGrid = getInitialGrid(startRow, startCol, finishRow, finishCol, 'temp');
  // Copy wall status and weights from the source grid
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      freshGrid[row][col].isWall = sourceGrid[row][col].isWall;
      freshGrid[row][col].weight = sourceGrid[row][col].weight;
    }
  }
  return freshGrid;
}
