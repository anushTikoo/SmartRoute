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
    epsilon,
    dijkstraResult,
    bfsResult,
    astarResult,
    astarWeightedResults,
    dijkstraComplete,
    bfsComplete,
    astarComplete,
    setAlgorithm,
    setEpsilon,
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
    <>
      {/* Left Column: All Controls, Telemetry & Legends */}
      <div className="flex flex-col w-[380px] space-y-6 shrink-0 z-10 h-full overflow-y-auto pr-2 custom-scrollbar pb-6">
        {/* Header Section */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-primary-container rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" data-icon="route">route</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-on-surface leading-none uppercase">SmartRoute</h1>
            <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Pathfinding Visualizer</span>
          </div>
        </div>

        {/* Real-time Stats at the very top under title */}
        <AlgorithmResults
          dijkstraResult={dijkstraResult}
          bfsResult={bfsResult}
          astarResult={astarResult}
          astarWeightedResults={astarWeightedResults}
          dijkstraComplete={dijkstraComplete}
          bfsComplete={bfsComplete}
          astarComplete={astarComplete}
        />

        {/* Configuration & Edit Controls */}
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
          epsilon={epsilon}
          setEpsilon={setEpsilon}
          editMode={editMode}
          setEditMode={setEditMode}
          showVisitedNodes={showVisitedNodes}
          setShowVisitedNodes={setShowVisitedNodes}
        />

        {/* Terrain Definitions & Path Legend moved here */}
        <GridLegend />
      </div>

      {/* Center: Visualizer Canvas + Map directly taking full height */}
      <div className="flex-grow flex flex-col overflow-hidden h-full">
        {/* Grid Container */}
        <div className="relative flex-grow rounded-2xl overflow-hidden shadow-inner flex flex-col">
          {/* Background Image Layer */}
          <div className="sticky top-0 left-0 w-full h-[0px] z-0 mix-blend-screen opacity-20 pointer-events-none">
            <img className="absolute top-0 left-0 w-[4000px] h-[4000px] max-w-none object-cover" src="https://lh3.googleusercontent.com/aida/ADBb0ug6v50FQ9IqQw6e5Zesxuagf0jsz3_RG2X3sPii9F6iz1MPVryxQnO6_2qc8OArHoIl9tG2zZ60jqpZZE3SX4yheTWPlwe_O2dZNJgj7ek2W9-znGeV74TLq-CND5dch3niwyvIVgOedAocMOgh70iKGndDFmcrHM12JyhqvwhjQvygzfw-2a_tm8BjC-DPGjMrYMAG1qzFWoF0mYE6EznOoNqn9AbYNhQoht4KU8QJXSTr8WtCFapSntg0wu1D9ddL9TnuJxbiIw" alt="Background" />
          </div>

          {/* The Grid Cells */}
          <div className="relative z-10 w-full h-full min-h-0 overflow-auto custom-scrollbar flex items-start justify-start">
            <div
              className="grid gap-0 min-w-full min-h-full w-max h-max"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(32px, 1fr))` }}
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

          {/* Floating Legend Labels */}
          <div className="absolute top-6 right-6 flex flex-wrap items-center gap-4 px-4 py-2 bg-surface-container-high/90 backdrop-blur rounded-lg border border-outline-variant/20 shadow-2xl z-20">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-500 ring-2 ring-white ring-offset-1 shadow-[0_0_10px_rgba(34,197,94,0.8)] border border-transparent"></span>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter">Start</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-500 ring-1 ring-white ring-offset-1 shadow-[0_0_10px_rgba(239,68,68,0.9)] border border-transparent"></span>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter">Finish</span>
            </div>
            <div className="w-px h-3 bg-outline-variant/30"></div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)] border border-blue-400"></span>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-cyan-300 ring-1 ring-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.9)] border border-transparent"></span>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter">Shortest Path</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Grid;
