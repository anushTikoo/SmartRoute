/**
 * GridControls Component
 * 
 * This component contains all the interactive controls for the grid:
 * - Map seed input and generation buttons
 * - Algorithm execution buttons
 * - Algorithm selection
 * - Edit mode selection
 * - Visited nodes toggle
 * 
 * Separating the UI controls keeps the main Grid component clean and focused
 * on the overall layout and state composition.
 */

import { ALGORITHMS, EDIT_MODES } from '../constants/grid';

/**
 * Button component for selecting the active algorithm.
 * Highlights when selected and restores that algorithm's visualization.
 * 
 * @param {Object} props
 * @param {string} props.algo - Algorithm identifier
 * @param {string} props.label - Display label
 * @param {string} props.currentAlgorithm - Currently selected algorithm
 * @param {boolean} props.isRunning - Whether an algorithm is currently running
 * @param {function} props.onSelect - Callback when button is clicked
 * @param {string} props.activeColor - Tailwind class for active state background
 */
function AlgorithmButton({ algo, label, currentAlgorithm, isRunning, onSelect, activeColor }) {
  const isActive = currentAlgorithm === algo;
  
  return (
    <button
      onClick={() => onSelect(algo)}
      disabled={isRunning}
      className={`px-3 py-1 rounded text-sm transition-colors ${
        isActive ? `${activeColor} text-white` : 'bg-gray-200 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Button component for selecting the edit mode.
 * 
 * @param {Object} props
 * @param {string} props.mode - Edit mode identifier
 * @param {string} props.label - Display label
 * @param {string} props.currentMode - Currently selected edit mode
 * @param {boolean} props.isRunning - Whether an algorithm is currently running
 * @param {function} props.onSelect - Callback when button is clicked
 * @param {string} props.activeColor - Tailwind class for active state background
 */
function EditModeButton({ mode, label, currentMode, isRunning, onSelect, activeColor }) {
  const isActive = currentMode === mode;
  
  return (
    <button
      onClick={() => onSelect(mode)}
      disabled={isRunning}
      className={`px-3 py-1 rounded text-sm transition-colors ${
        isActive ? `${activeColor} text-white` : 'bg-gray-200 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Main controls component that renders all grid control UI elements.
 * 
 * @param {Object} props - All control props from the parent Grid component
 */
export function GridControls({
  // Map generation props
  mapSeed,
  setMapSeed,
  onGenerateMap,
  onRandomizeMap,
  
  // Algorithm execution props
  algorithm,
  onAlgorithmChange,
  onRunAlgorithm,
  onResetGrid,
  isRunning,
  
  // Edit mode props
  editMode,
  setEditMode,
  
  // Visited nodes toggle props
  showVisitedNodes,
  setShowVisitedNodes,
}) {
  /**
   * Gets the display name for the current algorithm for the Run button.
   */
  const getAlgorithmDisplayName = () => {
    switch (algorithm) {
      case ALGORITHMS.DIJKSTRA:
        return 'Dijkstra';
      case ALGORITHMS.ASTAR:
        return 'A*';
      case ALGORITHMS.ASTAR_WEIGHTED:
        return 'Weighted A*';
      case ALGORITHMS.BFS:
        return 'BFS';
      default:
        return 'Algorithm';
    }
  };

  return (
    <>
      {/* Map Seed Controls */}
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
          onClick={onGenerateMap}
          disabled={isRunning}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title="Generate map from current seed"
        >
          Generate
        </button>
        <button
          onClick={onRandomizeMap}
          disabled={isRunning}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title="Generate a random map with a new seed"
        >
          Randomize
        </button>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onRunAlgorithm}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isRunning ? 'Running...' : `Run ${getAlgorithmDisplayName()}`}
        </button>
        <button
          onClick={onResetGrid}
          disabled={isRunning}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Visited Nodes Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowVisitedNodes(prev => !prev)}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            showVisitedNodes ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={showVisitedNodes ? 'Hide visited nodes (showing terrain colors)' : 'Show visited nodes explored by algorithm'}
        >
          {showVisitedNodes ? 'Hide Visited Nodes' : 'Show Visited Nodes'}
        </button>
      </div>

      {/* Algorithm Selection */}
      <div className="flex gap-2 flex-wrap justify-center">
        <AlgorithmButton
          algo={ALGORITHMS.DIJKSTRA}
          label="Dijkstra (weighted)"
          currentAlgorithm={algorithm}
          isRunning={isRunning}
          onSelect={onAlgorithmChange}
          activeColor="bg-green-500"
        />
        <AlgorithmButton
          algo={ALGORITHMS.BFS}
          label="BFS (unweighted)"
          currentAlgorithm={algorithm}
          isRunning={isRunning}
          onSelect={onAlgorithmChange}
          activeColor="bg-purple-500"
        />
        <AlgorithmButton
          algo={ALGORITHMS.ASTAR}
          label="A* (Manhattan)"
          currentAlgorithm={algorithm}
          isRunning={isRunning}
          onSelect={onAlgorithmChange}
          activeColor="bg-orange-500"
        />
        <AlgorithmButton
          algo={ALGORITHMS.ASTAR_WEIGHTED}
          label="Weighted A* (ε=3.0)"
          currentAlgorithm={algorithm}
          isRunning={isRunning}
          onSelect={onAlgorithmChange}
          activeColor="bg-red-500"
        />
      </div>

      {/* Edit Mode Selection */}
      <div className="flex gap-2 flex-wrap justify-center">
        <span className="text-sm font-semibold self-center">Edit Mode:</span>
        <EditModeButton
          mode={EDIT_MODES.WALL}
          label="Wall"
          currentMode={editMode}
          isRunning={isRunning}
          onSelect={setEditMode}
          activeColor="bg-gray-800"
        />
        <EditModeButton
          mode={EDIT_MODES.WEIGHT}
          label="Weight (click to cycle)"
          currentMode={editMode}
          isRunning={isRunning}
          onSelect={setEditMode}
          activeColor="bg-orange-500"
        />
        <EditModeButton
          mode={EDIT_MODES.START}
          label="Move Start"
          currentMode={editMode}
          isRunning={isRunning}
          onSelect={setEditMode}
          activeColor="bg-green-500"
        />
        <EditModeButton
          mode={EDIT_MODES.FINISH}
          label="Move Finish"
          currentMode={editMode}
          isRunning={isRunning}
          onSelect={setEditMode}
          activeColor="bg-red-500"
        />
      </div>
    </>
  );
}
