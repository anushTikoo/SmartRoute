import { ALGORITHMS, EDIT_MODES } from '../constants/grid';

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
  epsilon,
  setEpsilon,
  editMode,
  setEditMode,
  showVisitedNodes,
  setShowVisitedNodes,
}) {
  return (
    <>
      <div className="bg-surface-container-low rounded-xl p-5 space-y-5">
        <div className="flex items-center space-x-2 text-primary">
          <span className="material-symbols-outlined text-sm" data-icon="settings_input_component">settings_input_component</span>
          <h2 className="text-xs font-bold uppercase tracking-widest">Configuration Panel</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Map Seed</label>
            <div className="flex gap-2">
              <input 
                className="bg-surface-container-highest border-none rounded text-sm w-full focus:ring-1 focus:ring-primary text-on-surface py-2 px-3 outline-none" 
                type="text" 
                value={mapSeed}
                onChange={(e) => setMapSeed(e.target.value)}
                disabled={isRunning}
              />
              <button 
                onClick={onGenerateMap}
                disabled={isRunning}
                className="bg-surface-container-high hover:bg-surface-bright p-2 rounded text-primary transition-colors cursor-pointer disabled:opacity-50"
                title="Generate map from current seed"
              >
                <span className="material-symbols-outlined text-lg" data-icon="sync">sync</span>
              </button>
              <button 
                onClick={onRandomizeMap}
                disabled={isRunning}
                className="bg-surface-container-high hover:bg-surface-bright p-2 rounded text-primary transition-colors cursor-pointer disabled:opacity-50"
                title="Generate a random map with a new seed"
              >
                <span className="material-symbols-outlined text-lg" data-icon="casino">casino</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Algorithm Selector</label>
            <div className="relative">
              <select 
                className="appearance-none bg-surface-container-highest border-none rounded text-sm w-full focus:ring-1 focus:ring-primary text-on-surface py-2.5 px-3 outline-none cursor-pointer"
                value={algorithm}
                onChange={(e) => onAlgorithmChange(e.target.value)}
                disabled={isRunning}
              >
                <option value={ALGORITHMS.ASTAR}>A* (Manhattan)</option>
                <option value={ALGORITHMS.ASTAR_WEIGHTED}>Weighted A* (epsilon = {epsilon.toFixed(1)})</option>
                <option value={ALGORITHMS.DIJKSTRA}>Dijkstra</option>
                <option value={ALGORITHMS.BFS}>BFS</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none" data-icon="expand_more">expand_more</span>
            </div>
          </div>

          {algorithm === ALGORITHMS.ASTAR_WEIGHTED && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex justify-between">
                <span>Epsilon (Heuristic Weight)</span>
                <span className="text-primary">{epsilon.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="2"
                max="5"
                step="0.1"
                value={epsilon}
                onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                disabled={isRunning}
                className="w-full accent-primary cursor-pointer disabled:opacity-50"
                title="Higher epsilon = more greedy (faster but less optimal). Range: 2 to 5."
              />
            </div>
          )}

          <div className="pt-2 grid grid-cols-2 gap-2">
            <button 
              onClick={onRunAlgorithm}
              disabled={isRunning}
              className="btn-primary-gradient col-span-2 py-3 rounded-lg font-bold text-on-primary text-sm shadow-lg shadow-primary/10 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isRunning ? 'Running...' : 'Run Algorithm'}
            </button>
            <button 
              onClick={onResetGrid}
              disabled={isRunning}
              className="bg-surface-container-high hover:bg-surface-bright py-2 rounded text-xs font-semibold text-on-surface transition-colors cursor-pointer disabled:opacity-50"
            >
              Reset
            </button>
            <button 
              onClick={() => setShowVisitedNodes(prev => !prev)}
              disabled={isRunning}
              className={`bg-surface-container-high hover:bg-surface-bright py-2 rounded text-xs font-semibold transition-colors cursor-pointer flex justify-center items-center gap-1 disabled:opacity-50 ${showVisitedNodes ? 'text-primary' : 'text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[14px]">{showVisitedNodes ? 'visibility' : 'visibility_off'}</span>
              Nodes
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl p-5 space-y-4">
        <div className="flex items-center space-x-2 text-primary">
          <span className="material-symbols-outlined text-sm" data-icon="edit_square">edit_square</span>
          <h2 className="text-xs font-bold uppercase tracking-widest">Edit Mode</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => setEditMode(EDIT_MODES.WALL)}
            disabled={isRunning}
            className={`flex items-center gap-2 p-3 rounded-lg transition-all cursor-pointer disabled:opacity-50 ${editMode === EDIT_MODES.WALL ? 'bg-surface-bright border-2 border-primary text-primary' : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-sm" data-icon="grid_view" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
            <span className="text-[10px] font-bold uppercase">Add Wall</span>
          </button>
          
          <button 
            onClick={() => setEditMode(EDIT_MODES.WEIGHT)}
            disabled={isRunning}
            className={`flex items-center gap-2 p-3 rounded-lg transition-all cursor-pointer disabled:opacity-50 ${editMode === EDIT_MODES.WEIGHT ? 'bg-surface-bright border-2 border-primary text-primary' : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-sm" data-icon="layers">layers</span>
            <span className="text-[10px] font-bold uppercase">Edit Terrain</span>
          </button>
          
          <button 
            onClick={() => setEditMode(EDIT_MODES.START)}
            disabled={isRunning}
            className={`flex items-center gap-2 p-3 rounded-lg transition-all cursor-pointer disabled:opacity-50 ${editMode === EDIT_MODES.START ? 'bg-surface-bright border-2 border-primary text-primary' : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-sm" data-icon="location_on">location_on</span>
            <span className="text-[10px] font-bold uppercase">Start Pos</span>
          </button>
          
          <button 
            onClick={() => setEditMode(EDIT_MODES.FINISH)}
            disabled={isRunning}
            className={`flex items-center gap-2 p-3 rounded-lg transition-all cursor-pointer disabled:opacity-50 ${editMode === EDIT_MODES.FINISH ? 'bg-surface-bright border-2 border-primary text-primary' : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-sm" data-icon="flag">flag</span>
            <span className="text-[10px] font-bold uppercase">Finish Pos</span>
          </button>
        </div>
        
        <p className="text-[10px] text-on-surface-variant italic text-center pt-2">
          "Click cell to toggle/change terrain"
        </p>
      </div>
    </>
  );
}
