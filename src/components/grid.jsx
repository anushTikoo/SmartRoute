import { useState, useCallback, useRef } from 'react';
import Cell from './cell';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import { bfs } from '../algorithms/bfs';
import { astar } from '../algorithms/astar';
import { astarWeighted } from '../algorithms/astar_weighted';

const ROWS = 30;
const COLS = 30;

const DEFAULT_START_ROW = 5;
const DEFAULT_START_COL = 5;
const DEFAULT_FINISH_ROW = 25;
const DEFAULT_FINISH_COL = 25;

function createNode(row, col, startRow, startCol, finishRow, finishCol) {
  return {
    row,
    col,
    isStart: row === startRow && col === startCol,
    isFinish: row === finishRow && col === finishCol,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
    weight: Math.floor(Math.random() * 9) + 1,
  };
}

function getInitialGrid(startRow, startCol, finishRow, finishCol) {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push(createNode(row, col, startRow, startCol, finishRow, finishCol));
    }
    grid.push(currentRow);
  }
  return grid;
}

function Grid() {
  const [startPos, setStartPos] = useState({ row: DEFAULT_START_ROW, col: DEFAULT_START_COL });
  const [finishPos, setFinishPos] = useState({ row: DEFAULT_FINISH_ROW, col: DEFAULT_FINISH_COL });
  const [grid, setGrid] = useState(() => getInitialGrid(DEFAULT_START_ROW, DEFAULT_START_COL, DEFAULT_FINISH_ROW, DEFAULT_FINISH_COL));
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [bfsResult, setBfsResult] = useState(null);
  const [astarResult, setAstarResult] = useState(null);
  const [astarWeightedResult, setAstarWeightedResult] = useState(null);
  const [dijkstraComplete, setDijkstraComplete] = useState(false);
  const [bfsComplete, setBfsComplete] = useState(false);
  const [astarComplete, setAstarComplete] = useState(false);
  const [astarWeightedComplete, setAstarWeightedComplete] = useState(false);

  // Store visited nodes and paths for each algorithm
  const [dijkstraVisitedNodes, setDijkstraVisitedNodes] = useState([]);
  const [dijkstraPath, setDijkstraPath] = useState([]);
  const [bfsVisitedNodes, setBfsVisitedNodes] = useState([]);
  const [bfsPath, setBfsPath] = useState([]);
  const [astarVisitedNodes, setAstarVisitedNodes] = useState([]);
  const [astarPath, setAstarPath] = useState([]);
  const [astarWeightedVisitedNodes, setAstarWeightedVisitedNodes] = useState([]);
  const [astarWeightedPath, setAstarWeightedPath] = useState([]);

  const [editMode, setEditMode] = useState('wall'); // 'wall', 'weight', 'start', or 'finish'
  const animationStartTime = useRef(null);

  const handleCellClick = useCallback((row, col) => {
    if (isRunning) return;

    // Handle moving start node
    if (editMode === 'start') {
      if (row === finishPos.row && col === finishPos.col) return; // Can't place on finish
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

    // Handle moving finish node
    if (editMode === 'finish') {
      if (row === startPos.row && col === startPos.col) return; // Can't place on start
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

    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      const node = newGrid[row][col];
      if (!node.isStart && !node.isFinish) {
        newGrid[row] = [...newGrid[row]];
        if (editMode === 'wall') {
          newGrid[row][col] = { ...node, isWall: !node.isWall };
        } else {
          // Cycle weight 1-9
          const newWeight = node.weight >= 9 ? 1 : node.weight + 1;
          newGrid[row][col] = { ...node, weight: newWeight };
        }
      }
      return newGrid;
    });
  }, [isRunning, editMode, startPos, finishPos]);

  const clearPath = useCallback(() => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row =>
        row.map(node => ({ ...node, isInPath: false, isVisited: false }))
      );
      return newGrid;
    });
  }, []);

  // Restore visualization for a specific algorithm
  const restoreVisualization = useCallback((algo) => {
    let visitedNodes, path;
    switch (algo) {
      case 'dijkstra':
        visitedNodes = dijkstraVisitedNodes;
        path = dijkstraPath;
        break;
      case 'bfs':
        visitedNodes = bfsVisitedNodes;
        path = bfsPath;
        break;
      case 'astar':
        visitedNodes = astarVisitedNodes;
        path = astarPath;
        break;
      case 'astar-weighted':
        visitedNodes = astarWeightedVisitedNodes;
        path = astarWeightedPath;
        break;
      default:
        visitedNodes = [];
        path = [];
    }

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row =>
        row.map(node => ({ ...node, isInPath: false, isVisited: false }))
      );
      // Mark visited nodes
      visitedNodes.forEach(node => {
        newGrid[node.row][node.col] = { ...newGrid[node.row][node.col], isVisited: true };
      });
      // Mark path
      path.forEach(node => {
        newGrid[node.row][node.col] = { ...newGrid[node.row][node.col], isInPath: true };
      });
      return newGrid;
    });
  }, [dijkstraVisitedNodes, dijkstraPath, bfsVisitedNodes, bfsPath, astarVisitedNodes, astarPath, astarWeightedVisitedNodes, astarWeightedPath]);

  const runAlgorithm = useCallback(() => {
    if (isRunning) return;

    // Clear previous path
    clearPath();

    const freshGrid = getInitialGrid(startPos.row, startPos.col, finishPos.row, finishPos.col);
    // Copy wall status and weights from current grid
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        freshGrid[row][col].isWall = grid[row][col].isWall;
        freshGrid[row][col].weight = grid[row][col].weight;
      }
    }

    const startNode = freshGrid[startPos.row][startPos.col];
    const finishNode = freshGrid[finishPos.row][finishPos.col];

    let visitedNodes, shortestPath;
    if (algorithm === 'dijkstra') {
      visitedNodes = dijkstra(freshGrid, startNode, finishNode);
      shortestPath = getNodesInShortestPathOrder(finishNode);
    } else if (algorithm === 'bfs') {
      const result = bfs(freshGrid, startNode, finishNode);
      visitedNodes = result.visitedNodes;
      shortestPath = result.shortestPath;
    } else if (algorithm === 'astar') {
      const result = astar(freshGrid, startNode, finishNode);
      visitedNodes = result.visitedNodes;
      shortestPath = result.shortestPath;
    } else {
      const result = astarWeighted(freshGrid, startNode, finishNode);
      visitedNodes = result.visitedNodes;
      shortestPath = result.shortestPath;
    }

    // Check if path exists
    const hasPath = shortestPath.length > 0;

    // Calculate total weight and path length
    const weight = hasPath ? shortestPath.reduce((sum, node) => sum + node.weight, 0) : 0;
    const length = shortestPath.length;

    // Calculate time taken to reach goal (before animation starts)
    const timeToGoal = visitedNodes.length * 30; // 30ms per visited cell

    // Store result for the specific algorithm
    const visitedCount = visitedNodes.length;
    if (algorithm === 'dijkstra') {
      setDijkstraResult({ weight, length, noPath: !hasPath, timeToGoal, visitedCount });
      setDijkstraVisitedNodes(visitedNodes);
      setDijkstraPath(shortestPath);
    } else if (algorithm === 'bfs') {
      setBfsResult({ weight, length, noPath: !hasPath, timeToGoal, visitedCount });
      setBfsVisitedNodes(visitedNodes);
      setBfsPath(shortestPath);
    } else if (algorithm === 'astar') {
      setAstarResult({ weight, length, noPath: !hasPath, timeToGoal, visitedCount });
      setAstarVisitedNodes(visitedNodes);
      setAstarPath(shortestPath);
    } else {
      setAstarWeightedResult({ weight, length, noPath: !hasPath, timeToGoal, visitedCount });
      setAstarWeightedVisitedNodes(visitedNodes);
      setAstarWeightedPath(shortestPath);
    }

    setIsRunning(true);
    animationStartTime.current = Date.now();

    // First animate visited cells, then shortest path
    animateVisitedThenPath(visitedNodes, shortestPath, algorithm);
  }, [grid, isRunning, algorithm, clearPath]);

  const animateVisitedThenPath = (visitedNodes, shortestPath, algo) => {
    let step = 0;
    const visitedInterval = setInterval(() => {
      if (step >= visitedNodes.length) {
        clearInterval(visitedInterval);
        // Now animate the shortest path
        animateShortestPath(shortestPath, algo);
        return;
      }

      const node = visitedNodes[step];
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        newGrid[node.row] = [...newGrid[node.row]];
        newGrid[node.row][node.col] = {
          ...newGrid[node.row][node.col],
          isVisited: true
        };
        return newGrid;
      });

      step++;
    }, 30);
  };

  const animateShortestPath = (shortestPath, algo) => {
    // If no path, skip animation and mark complete
    if (shortestPath.length === 0) {
      setIsRunning(false);
      if (algo === 'dijkstra') {
        setDijkstraComplete(true);
      } else if (algo === 'bfs') {
        setBfsComplete(true);
      } else if (algo === 'astar') {
        setAstarComplete(true);
      } else {
        setAstarWeightedComplete(true);
      }
      return;
    }

    let step = 0;
    const pathInterval = setInterval(() => {
      if (step >= shortestPath.length) {
        clearInterval(pathInterval);
        setIsRunning(false);
        if (algo === 'dijkstra') {
          setDijkstraComplete(true);
        } else if (algo === 'bfs') {
          setBfsComplete(true);
        } else if (algo === 'astar') {
          setAstarComplete(true);
        } else {
          setAstarWeightedComplete(true);
        }
        return;
      }

      const node = shortestPath[step];
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        newGrid[node.row] = [...newGrid[node.row]];
        newGrid[node.row][node.col] = {
          ...newGrid[node.row][node.col],
          isInPath: true
        };
        return newGrid;
      });

      step++;
    }, 100);
  };

  const resetGrid = useCallback(() => {
    if (isRunning) return;
    setStartPos({ row: DEFAULT_START_ROW, col: DEFAULT_START_COL });
    setFinishPos({ row: DEFAULT_FINISH_ROW, col: DEFAULT_FINISH_COL });
    setGrid(getInitialGrid(DEFAULT_START_ROW, DEFAULT_START_COL, DEFAULT_FINISH_ROW, DEFAULT_FINISH_COL));
    setDijkstraResult(null);
    setBfsResult(null);
    setAstarResult(null);
    setAstarWeightedResult(null);
    setDijkstraComplete(false);
    setBfsComplete(false);
    setAstarComplete(false);
    setAstarWeightedComplete(false);
    // Clear cached visited nodes and paths
    setDijkstraVisitedNodes([]);
    setDijkstraPath([]);
    setBfsVisitedNodes([]);
    setBfsPath([]);
    setAstarVisitedNodes([]);
    setAstarPath([]);
    setAstarWeightedVisitedNodes([]);
    setAstarWeightedPath([]);
  }, [isRunning]);

  return (
    <div className="flex flex-col items-center gap-4">
      {dijkstraResult && dijkstraComplete && (
        <div className={`text-lg font-bold px-4 py-2 rounded ${dijkstraResult.noPath ? 'bg-red-100 text-red-700' : 'bg-green-100 text-gray-700'}`}>
          Dijkstra - {dijkstraResult.noPath ? (
            <span className="text-red-600">Goal not reached</span>
          ) : (
            <>
              Weight: <span className="text-blue-600">{dijkstraResult.weight}</span>
              <span className="text-gray-500 text-sm ml-2">({dijkstraResult.length} cells)</span>
              <span className="text-orange-600 text-sm ml-2">[{dijkstraResult.timeToGoal}ms]</span>
              <span className="text-gray-600 text-sm ml-2">[{dijkstraResult.visitedCount} visited]</span>
            </>
          )}
        </div>
      )}

      {bfsResult && bfsComplete && (
        <div className={`text-lg font-bold px-4 py-2 rounded ${bfsResult.noPath ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-gray-700'}`}>
          BFS - {bfsResult.noPath ? (
            <span className="text-red-600">Goal not reached</span>
          ) : (
            <>
              Weight: <span className="text-blue-600">{bfsResult.weight}</span>
              <span className="text-gray-500 text-sm ml-2">({bfsResult.length} cells)</span>
              <span className="text-orange-600 text-sm ml-2">[{bfsResult.timeToGoal}ms]</span>
              <span className="text-gray-600 text-sm ml-2">[{bfsResult.visitedCount} visited]</span>
            </>
          )}
        </div>
      )}

      {astarResult && astarComplete && (
        <div className={`text-lg font-bold px-4 py-2 rounded ${astarResult.noPath ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-gray-700'}`}>
          A* - {astarResult.noPath ? (
            <span className="text-red-600">Goal not reached</span>
          ) : (
            <>
              Weight: <span className="text-blue-600">{astarResult.weight}</span>
              <span className="text-gray-500 text-sm ml-2">({astarResult.length} cells)</span>
              <span className="text-orange-600 text-sm ml-2">[{astarResult.timeToGoal}ms]</span>
              <span className="text-gray-600 text-sm ml-2">[{astarResult.visitedCount} visited]</span>
            </>
          )}
        </div>
      )}

      {astarWeightedResult && astarWeightedComplete && (
        <div className={`text-lg font-bold px-4 py-2 rounded ${astarWeightedResult.noPath ? 'bg-red-100 text-red-700' : 'bg-red-50 text-gray-700'}`}>
          Weighted A* (ε=3.0) - {astarWeightedResult.noPath ? (
            <span className="text-red-600">Goal not reached</span>
          ) : (
            <>
              Weight: <span className="text-blue-600">{astarWeightedResult.weight}</span>
              <span className="text-gray-500 text-sm ml-2">({astarWeightedResult.length} cells)</span>
              <span className="text-orange-600 text-sm ml-2">[{astarWeightedResult.timeToGoal}ms]</span>
              <span className="text-gray-600 text-sm ml-2">[{astarWeightedResult.visitedCount} visited]</span>
            </>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={runAlgorithm}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {isRunning ? 'Running...' : `Run ${algorithm === 'dijkstra' ? 'Dijkstra' : algorithm === 'astar' ? 'A*' : algorithm === 'astar-weighted' ? 'Weighted A*' : 'BFS'}`}
        </button>
        <button
          onClick={resetGrid}
          disabled={isRunning}
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:bg-gray-400"
        >
          Reset/Randomize
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setAlgorithm('dijkstra');
            restoreVisualization('dijkstra');
          }}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${algorithm === 'dijkstra' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Dijkstra (weighted)
        </button>
        <button
          onClick={() => {
            setAlgorithm('bfs');
            restoreVisualization('bfs');
          }}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${algorithm === 'bfs' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
        >
          BFS (unweighted)
        </button>
        <button
          onClick={() => {
            setAlgorithm('astar');
            restoreVisualization('astar');
          }}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${algorithm === 'astar' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          A* (Manhattan)
        </button>
        <button
          onClick={() => {
            setAlgorithm('astar-weighted');
            restoreVisualization('astar-weighted');
          }}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${algorithm === 'astar-weighted' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          Weighted A* (ε=3.0)
        </button>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        <span className="text-sm font-semibold self-center">Edit Mode:</span>
        <button
          onClick={() => setEditMode('wall')}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${editMode === 'wall' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
        >
          Wall
        </button>
        <button
          onClick={() => setEditMode('weight')}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${editMode === 'weight' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          Weight (click to cycle 1-9)
        </button>
        <button
          onClick={() => setEditMode('start')}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${editMode === 'start' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Move Start
        </button>
        <button
          onClick={() => setEditMode('finish')}
          disabled={isRunning}
          className={`px-3 py-1 rounded text-sm ${editMode === 'finish' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          Move Finish
        </button>
      </div>

      <div className="flex gap-4 text-sm flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500"></div>
          <span>Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500"></div>
          <span>Finish</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800"></div>
          <span>Wall</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400"></div>
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400"></div>
          <span>Shortest Path</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">1-9</span>
          <span>Cell Weights (random)</span>
        </div>
      </div>

      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {grid.map((row, rowIdx) => (
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
              onClick={handleCellClick}
            />
          ))
        ))}
      </div>
    </div>
  );
}

export default Grid;
