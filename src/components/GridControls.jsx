import { ALGORITHMS, EDIT_MODES } from '../constants/grid';

function AlgorithmButton({ algo, label, currentAlgorithm, isRunning, onSelect }) {
  const isActive = currentAlgorithm === algo;

  return (
    <button
      onClick={() => onSelect(algo)}
      disabled={isRunning}
      className={`px-3 py-2 rounded text-sm transition-all border ${isActive
          ? 'bg-blue-500 text-white border-blue-400'
          : 'bg-[#1E293B] text-gray-300 border-gray-600 hover:bg-[#334155]'
        }`}
    >
      {label} </button>
  );
}

function EditModeButton({ mode, label, currentMode, isRunning, onSelect }) {
  const isActive = currentMode === mode;

  return (
    <button
      onClick={() => onSelect(mode)}
      disabled={isRunning}
      className={`px-3 py-2 rounded text-sm transition-all border ${isActive
          ? 'bg-green-500 text-white border-green-400'
          : 'bg-[#1E293B] text-gray-300 border-gray-600 hover:bg-[#334155]'
        }`}
    >
      {label} </button>
  );
}

export function GridControls({
  mapSeed,
  setMapSeed,
  onGenerateMap,
  onRandomizeMap,
  algorithm,
  onAlgorithmChange,
  onRunAlgorithm,
  onResetGrid,
  isRunning,
  editMode,
  setEditMode,
  showVisitedNodes,
  setShowVisitedNodes,
}) {

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

  return (<div className="flex flex-col gap-5">

    ```
    {/* CONFIG PANEL */}
    <div className="bg-[#020617] p-4 rounded-lg border border-gray-700">

      <p className="text-xs text-gray-400 mb-2">CONFIGURATION PANEL</p>

      <input
        type="text"
        value={mapSeed}
        onChange={(e) => setMapSeed(e.target.value)}
        disabled={isRunning}
        placeholder="Map Seed"
        className="w-full mb-3 p-2 bg-[#1E293B] text-white rounded border border-gray-600 outline-none"
      />

      <div className="flex gap-2 mb-3">
        <button
          onClick={onGenerateMap}
          disabled={isRunning}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Generate
        </button>
        <button
          onClick={onRandomizeMap}
          disabled={isRunning}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
        >
          Randomize
        </button>
      </div>

      <button
        onClick={onRunAlgorithm}
        disabled={isRunning}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-2 rounded text-white mb-2"
      >
        {isRunning ? 'Running...' : `Run ${getAlgorithmDisplayName()}`}
      </button>

      <div className="flex gap-2">
        <button
          onClick={onResetGrid}
          disabled={isRunning}
          className="flex-1 bg-[#1E293B] py-2 rounded text-white"
        >
          Reset
        </button>
        <button
          onClick={() => setShowVisitedNodes(prev => !prev)}
          disabled={isRunning}
          className="flex-1 bg-[#1E293B] py-2 rounded text-white"
        >
          {showVisitedNodes ? 'Hide Nodes' : 'Show Nodes'}
        </button>
      </div>
    </div>

    {/* ALGORITHM SELECTOR */}
    <div className="bg-[#020617] p-4 rounded-lg border border-gray-700">
      <p className="text-xs text-gray-400 mb-2">ALGORITHM</p>

      <div className="flex flex-wrap gap-2">
        <AlgorithmButton
          algo={ALGORITHMS.DIJKSTRA}
          label="Dijkstra"
          currentAlgorithm={algorithm}
          isRunning={isRunning}
          onSelect={onAlgorithmChange}
        />
        <AlgorithmButton
          algo={ALGORITHMS.BFS}
          label="BFS"
          currentAlgorithm={algorithm}
          isRunning={isRunning}
          onSelect={onAlgorithmChange}
        />
        <AlgorithmButton
          algo={ALGORITHMS.ASTAR}
          label="A*"
          currentAlgorithm={algorithm}
          isRunning={isRunning}
          onSelect={onAlgorithmChange}
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
    </div>

    {/* EDIT MODE */}
    <div className="bg-[#020617] p-4 rounded-lg border border-gray-700">
      <p className="text-xs text-gray-400 mb-2">EDIT MODE</p>

      <div className="grid grid-cols-2 gap-2">
        <EditModeButton
          mode={EDIT_MODES.WALL}
          label="Wall"
          currentMode={editMode}
          isRunning={isRunning}
          onSelect={setEditMode}
        />
        <EditModeButton
          mode={EDIT_MODES.WEIGHT}
          label="Terrain"
          currentMode={editMode}
          isRunning={isRunning}
          onSelect={setEditMode}
        />
        <EditModeButton
          mode={EDIT_MODES.START}
          label="Start"
          currentMode={editMode}
          isRunning={isRunning}
          onSelect={setEditMode}
        />
        <EditModeButton
          mode={EDIT_MODES.FINISH}
          label="Finish"
          currentMode={editMode}
          isRunning={isRunning}
          onSelect={setEditMode}
        />
      </div>
    </div>

  </div>


  );
}
