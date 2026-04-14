import { useState, useCallback } from 'react';
import {
DEFAULT_START_ROW,
DEFAULT_START_COL,
DEFAULT_FINISH_ROW,
DEFAULT_FINISH_COL,
DEFAULT_MAP_SEED,
EDIT_MODES,
TERRAIN_TYPES
} from '../constants/grid';
import { getInitialGrid } from '../utils/gridUtils';
import { generateRandomSeed } from '../utils/mapGenerator';

export function useGridState() {

const [startPos, setStartPos] = useState({
row: DEFAULT_START_ROW,
col: DEFAULT_START_COL
});

const [finishPos, setFinishPos] = useState({
row: DEFAULT_FINISH_ROW,
col: DEFAULT_FINISH_COL
});

const [mapSeed, setMapSeed] = useState(DEFAULT_MAP_SEED);

const [grid, setGrid] = useState(() =>
getInitialGrid(
DEFAULT_START_ROW,
DEFAULT_START_COL,
DEFAULT_FINISH_ROW,
DEFAULT_FINISH_COL,
DEFAULT_MAP_SEED
)
);

const [isRunning, setIsRunning] = useState(false);
const [showVisitedNodes, setShowVisitedNodes] = useState(true);
const [editMode, setEditMode] = useState(EDIT_MODES.WALL);

/**

* HANDLE CELL CLICK
  */
  const handleCellClick = useCallback((row, col) => {
  if (isRunning) return;


// MOVE START



if (editMode === EDIT_MODES.START) {
  if (row === finishPos.row && col === finishPos.col) return;

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

// MOVE FINISH
if (editMode === EDIT_MODES.FINISH) {
  if (row === startPos.row && col === startPos.col) return;

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

// WALL / TERRAIN EDIT
setGrid(prevGrid => {
  const newGrid = [...prevGrid];
  const node = newGrid[row][col];

  if (!node.isStart && !node.isFinish) {
    newGrid[row] = [...newGrid[row]];

    if (editMode === EDIT_MODES.WALL) {
      newGrid[row][col] = {
        ...node,
        isWall: !node.isWall
      };
    } else {
      // 🔥 TERRAIN CYCLING (1 → 9)
      const newWeight = node.weight === 9 ? 1 : node.weight + 1;

      newGrid[row][col] = {
        ...node,
        weight: newWeight,
        terrain: TERRAIN_TYPES[newWeight].name
      };
    }
  }

  return newGrid;
});


}, [isRunning, editMode, startPos, finishPos]);

/**

* CLEAR PATH
  */
  const clearPath = useCallback(() => {
  setGrid(prevGrid =>
  prevGrid.map(row =>
  row.map(node => ({
  ...node,
  isInPath: false,
  isVisited: false
  }))
  )
  );
  }, []);

/**

* REGENERATE MAP
  */
  const regenerateMap = useCallback((newSeed) => {
  if (isRunning) return;


setMapSeed(newSeed);



setStartPos({ row: DEFAULT_START_ROW, col: DEFAULT_START_COL });
setFinishPos({ row: DEFAULT_FINISH_ROW, col: DEFAULT_FINISH_COL });

setGrid(getInitialGrid(
  DEFAULT_START_ROW,
  DEFAULT_START_COL,
  DEFAULT_FINISH_ROW,
  DEFAULT_FINISH_COL,
  newSeed
));

setShowVisitedNodes(true);


}, [isRunning]);

/**

* RESET GRID
  */
  const resetGrid = useCallback(() => {
  if (isRunning) return;


setStartPos({ row: DEFAULT_START_ROW, col: DEFAULT_START_COL });



setFinishPos({ row: DEFAULT_FINISH_ROW, col: DEFAULT_FINISH_COL });

setGrid(getInitialGrid(
  DEFAULT_START_ROW,
  DEFAULT_START_COL,
  DEFAULT_FINISH_ROW,
  DEFAULT_FINISH_COL,
  mapSeed
));

setShowVisitedNodes(true);


}, [isRunning, mapSeed]);

/**

* RANDOM MAP
  */
  const randomizeMap = useCallback(() => {
  regenerateMap(generateRandomSeed());
  }, [regenerateMap]);

return {
grid,
startPos,
finishPos,
mapSeed,
isRunning,
showVisitedNodes,
editMode,


setGrid,
setIsRunning,
setShowVisitedNodes,
setEditMode,
setMapSeed,

handleCellClick,
clearPath,
regenerateMap,
resetGrid,
randomizeMap,


};
}
