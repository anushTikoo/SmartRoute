/**
 * Grid Constants
 * 
 * This module contains all constant values related to the grid dimensions,
 * default positions for start and finish nodes, and other grid-related configuration.
 * 
 * Centralizing constants makes it easy to modify grid size or default positions
 * without hunting through the codebase. All grid components import from here.
 */

/** Number of rows in the grid (30x30 grid) */
export const ROWS = 30;

/** Number of columns in the grid (30x30 grid) */
export const COLS = 30;

/** Default row position for the start node (upper-left area) */
export const DEFAULT_START_ROW = 5;

/** Default column position for the start node (upper-left area) */
export const DEFAULT_START_COL = 5;

/** Default row position for the finish node (lower-right area) */
export const DEFAULT_FINISH_ROW = 25;

/** Default column position for the finish node (lower-right area) */
export const DEFAULT_FINISH_COL = 25;

/** Default seed for procedural map generation */
export const DEFAULT_MAP_SEED = 'default-seed-123';

/** Available edit modes for user interaction with the grid */
export const EDIT_MODES = {
  WALL: 'wall',
  WEIGHT: 'weight',
  START: 'start',
  FINISH: 'finish',
};

/** Available algorithm types */
export const ALGORITHMS = {
  DIJKSTRA: 'dijkstra',
  BFS: 'bfs',
  ASTAR: 'astar',
  ASTAR_WEIGHTED: 'astar-weighted',
};

/** Animation timing constants (in milliseconds) */
export const ANIMATION_TIMING = {
  /** Delay between each visited node animation step */
  VISITED_STEP_DELAY: 30,
  /** Delay between each path node animation step */
  PATH_STEP_DELAY: 100,
};
