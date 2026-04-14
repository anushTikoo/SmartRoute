import Grid from './components/grid'
import { GridControls } from './components/GridControls'
import { AlgorithmResults } from './components/AlgorithmResults'
import { GridLegend } from './components/GridLegend'

import { useGridState } from './hooks/useGridState'
import { useAlgorithmRunner } from './hooks/useAlgorithmRunner'
import { generateRandomSeed } from './utils/mapGenerator'

function App() {

  const {
    grid,
    startPos,
    finishPos,
    mapSeed,
    isRunning,
    showVisitedNodes,
    editMode,
    setGrid,
    setMapSeed,
    setShowVisitedNodes,
    setEditMode,
    handleCellClick,
    clearPath,
    regenerateMap,
    resetGrid,
    setIsRunning,
  } = useGridState();

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
    clearAlgorithmData,
  } = useAlgorithmRunner(
    grid,
    startPos,
    finishPos,
    setGrid,
    isRunning,
    setIsRunning,
    setShowVisitedNodes
  );

  const handleGenerateMap = () => {
    regenerateMap(mapSeed);
    clearAlgorithmData();
  };

  const handleRandomizeMap = () => {
    const newSeed = generateRandomSeed();
    regenerateMap(newSeed);
    clearAlgorithmData();
  };

  const handleResetGrid = () => {
    resetGrid();
    clearAlgorithmData();
  };

  return (<div className="min-h-screen flex bg-[#0B1220] text-white">

    ```
    {/* SIDEBAR */}
    <div className="w-[320px] p-4 bg-[#0F172A] border-r border-gray-700 flex flex-col gap-4">

      <h1 className="text-2xl font-bold text-blue-400 mb-1">
        SMARTRoute
      </h1>
      <p className="text-xs text-gray-400 mb-3">
        Pathfinding Visualizer
      </p>

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

    </div>

    {/* MAIN AREA */}
    <div className="flex-1 flex flex-col p-4 gap-4">

      {/* GRID */}
      <div className="flex justify-center items-center flex-1">
        <Grid
          grid={grid}
          handleCellClick={handleCellClick}
          showVisitedNodes={showVisitedNodes}
        />
      </div>

      {/* LEGEND */}
      <div className="w-full bg-[#020617] p-4 rounded-lg border border-gray-700">
        <GridLegend />
      </div>

    </div>

  </div>


)
}

export default App
