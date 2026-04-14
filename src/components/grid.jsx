import Cell from './cell';
import { COLS } from '../constants/grid';

function Grid({ grid, handleCellClick, showVisitedNodes }) {

return (
<div
className="grid gap-[1px] bg-gray-700 p-1 rounded-lg shadow-lg"
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
)} </div>
);
}

export default Grid;
