/**
 * AlgorithmResults Component
 * 
 * Displays the results of pathfinding algorithm executions.
 * Shows metrics like total weight, path length, execution time, and nodes visited.
 * Each algorithm has its own color scheme for easy identification.
 * 
 * Results are only shown after an algorithm has completed running.
 */

import { ALGORITHMS } from '../constants/grid';

/**
 * Individual result display card for a single algorithm.
 * 
 * @param {Object} props
 * @param {string} props.name - Display name of the algorithm
 * @param {Object} props.result - Result data object with weight, length, noPath, timeToGoal, visitedCount
 * @param {boolean} props.isComplete - Whether the algorithm has finished running
 * @param {string} props.bgColor - Background color class for the card (e.g., 'bg-green-100')
 * @param {string} props.accentColor - Accent color class for the algorithm name (e.g., 'text-green-600')
 */
function ResultCard({ name, result, isComplete, bgColor, accentColor }) {
  if (!result || !isComplete) return null;

  return (
    <div className={`text-lg font-bold px-4 py-2 rounded ${result.noPath ? 'bg-red-100 text-red-700' : bgColor}`}>
      {name} - {result.noPath ? (
        <span className="text-red-600">Goal not reached</span>
      ) : (
        <>
          Weight: <span className="text-blue-600">{result.weight}</span>
          <span className="text-gray-500 text-sm ml-2">({result.length} cells)</span>
          <span className="text-orange-600 text-sm ml-2">[{result.timeToGoal}ms]</span>
          <span className="text-gray-600 text-sm ml-2">[{result.visitedCount} visited]</span>
        </>
      )}
    </div>
  );
}

/**
 * Container component that displays results for all four algorithms.
 * 
 * @param {Object} props
 * @param {Object} props.dijkstraResult - Dijkstra algorithm result
 * @param {Object} props.bfsResult - BFS algorithm result  
 * @param {Object} props.astarResult - A* algorithm result
 * @param {Object} props.astarWeightedResult - Weighted A* algorithm result
 * @param {boolean} props.dijkstraComplete - Whether Dijkstra has completed
 * @param {boolean} props.bfsComplete - Whether BFS has completed
 * @param {boolean} props.astarComplete - Whether A* has completed
 * @param {boolean} props.astarWeightedComplete - Whether Weighted A* has completed
 */
export function AlgorithmResults({
  dijkstraResult,
  bfsResult,
  astarResult,
  astarWeightedResult,
  dijkstraComplete,
  bfsComplete,
  astarComplete,
  astarWeightedComplete,
}) {
  return (
    <>
      <ResultCard
        name="Dijkstra"
        result={dijkstraResult}
        isComplete={dijkstraComplete}
        bgColor="bg-green-100 text-gray-700"
        accentColor="text-green-600"
      />
      
      <ResultCard
        name="BFS"
        result={bfsResult}
        isComplete={bfsComplete}
        bgColor="bg-purple-100 text-gray-700"
        accentColor="text-purple-600"
      />
      
      <ResultCard
        name="A*"
        result={astarResult}
        isComplete={astarComplete}
        bgColor="bg-orange-100 text-gray-700"
        accentColor="text-orange-600"
      />
      
      <ResultCard
        name="Weighted A* (ε=3.0)"
        result={astarWeightedResult}
        isComplete={astarWeightedComplete}
        bgColor="bg-red-50 text-gray-700"
        accentColor="text-red-600"
      />
    </>
  );
}
