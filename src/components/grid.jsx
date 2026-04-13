/**
 * Grid Component (Refactored)
 *
 * This is the main grid component that orchestrates the pathfinding visualization.
 * It has been refactored from ~800 lines to a clean composition of smaller modules:
 *
 * Architecture:
 * - Constants: Grid dimensions and configuration (src/constants/grid.js)
 * - Utils: Map generation and grid utilities (src/utils/)
 * - Hooks: Custom hooks for state and algorithm logic (src/hooks/)
 * - Sub-components: UI components for controls and displays (src/components/)
 *
 * The component composition follows this hierarchy:
 * Grid (orchestrator)
 *   ├── AlgorithmResults (displays metrics)
 *   ├── GridControls (user inputs)
 *   ├── GridLegend (visual guide)
 *   └── Cell[][] (the actual grid)
 *
 * State management is split between:
 * - useGridState: Grid data, positions, edit mode
 * - useAlgorithmRunner: Algorithm execution and results
 */

import Cell from './cell';
import { AlgorithmResults } from './AlgorithmResults';
import { GridControls } from './GridControls';
import { GridLegend } from './GridLegend';
import { useGridState } from '../hooks/useGridState';
import { useAlgorithmRunner } from '../hooks/useAlgorithmRunner';
import { COLS } from '../constants/grid';
import { generateRandomSeed } from '../utils/mapGenerator';

function Grid() {
  // Grid state management: positions, seed, grid data, edit mode
  const {
    grid,
    startPos,
    finishPos,
    mapSeed,
    isRunning,
    showVisitedNodes,
    editMode,
    setGrid,           // Needed for algorithm animations
    setMapSeed,
    setShowVisitedNodes,
    setEditMode,
    handleCellClick,
    clearPath,
    regenerateMap,
    resetGrid,
    setIsRunning,
  } = useGridState();

  // Algorithm execution and results management
  // This hook manages running algorithms, animations, and storing results
  const {
    algorithm,
    dijkstraResult,
    bfsResult,
    astarResult,
    astarWeightedResult,
    dijkstraComplete,
    bfsComplete,
    astarComplete,
    astarWeightedComplete,
    setAlgorithm,
    runAlgorithm,
    restoreVisualization,
    clearAlgorithmData,
  } = useAlgorithmRunner(
    grid,
    startPos,
    finishPos,
    setGrid,              // Passed for animation updates
    isRunning,            // Passed to check if already running
    setIsRunning,         // Passed to control running state
    setShowVisitedNodes   // Passed to toggle visited nodes after animation
  );

  // Handle map regeneration with algorithm data clearing
  const handleGenerateMap = () => {
    regenerateMap(mapSeed);
    clearAlgorithmData();
  };

  // Handle randomize with algorithm data clearing
  const handleRandomizeMap = () => {
    const newSeed = generateRandomSeed();
    regenerateMap(newSeed);
    clearAlgorithmData();
  };

  // Handle reset with algorithm data clearing
  const handleResetGrid = () => {
    resetGrid();
    clearAlgorithmData();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Display algorithm results (weight, path length, time, etc.) */}
      <AlgorithmResults
        dijkstraResult={dijkstraResult}
        bfsResult={bfsResult}
        astarResult={astarResult}
        astarWeightedResult={astarWeightedResult}
        dijkstraComplete={dijkstraComplete}
        bfsComplete={bfsComplete}
        astarComplete={astarComplete}
        astarWeightedComplete={astarWeightedComplete}
      />

      {/* All user controls: seed input, run buttons, algorithm select, edit mode */}
      <GridControls
        mapSeed={mapSeed}
        setMapSeed={setMapSeed}
        onGenerateMap={handleGenerateMap}
        onRandomizeMap={handleRandomizeMap}
        algorithm={algorithm}
        onAlgorithmChange={setAlgorithm}
        onRunAlgorithm={() => runAlgorithm(clearPath)}
        onResetGrid={handleResetGrid}
        isRunning={isRunning}
        editMode={editMode}
        setEditMode={setEditMode}
        showVisitedNodes={showVisitedNodes}
        setShowVisitedNodes={setShowVisitedNodes}
      />

      {/* Visual legend explaining grid elements */}
      <GridLegend />

      {/* The actual grid of cells */}
      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {grid.map((row, rowIdx) =>
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
        )}
      </div>
    </div>
  );
}

export default Grid;
