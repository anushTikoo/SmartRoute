const TERRAIN_COLORS = {
1: 'bg-amber-500',     // Road (brown)
2: 'bg-lime-400',      // Grass (green)
3: 'bg-yellow-400',    // Sand (yellow)
4: 'bg-amber-700',    // Shrub (orange)
5: 'bg-amber-800',     // Mud (dark brown)
6: 'bg-green-900',     // Forest (dark green)
7: 'bg-teal-700',      // Swamp (wet green/blue)
8: 'bg-gray-500',      // Mountain (gray)
9: 'bg-white',         // Snow (white)
};

function Cell({
row,
col,
isStart,
isFinish,
isWall,
isVisited,
isInPath,
weight,
showVisited,
onClick
}) {

let cellClass =
"w-6 h-6 border border-[#1f2937] cursor-pointer transition-all duration-150";

// START NODE
if (isStart) {
cellClass += " bg-green-500 shadow-lg shadow-green-400/60 rounded-sm";
}

// FINISH NODE
else if (isFinish) {
cellClass += " bg-red-500 shadow-lg shadow-red-400/60 rounded-sm";
}

// WALL
else if (isWall) {
cellClass += " bg-gray-900";
}

// SHORTEST PATH (GLOW EFFECT)
else if (isInPath) {
cellClass +=
" bg-yellow-300 shadow-[0_0_10px_3px_rgba(253,224,71,0.8)] scale-105 z-10";
}

// VISITED
else if (isVisited && showVisited) {
cellClass += " bg-blue-400 opacity-80";
}

// TERRAIN
else {
const color = TERRAIN_COLORS[weight] || 'bg-gray-800';
cellClass += ` ${color}`;
}

return (
<div
className="relative group"
onClick={() => onClick(row, col)}
>
{/* CELL */} <div className={cellClass}></div>

  {/* HOVER NUMBER */}
  {!isWall && !isStart && !isFinish && (
    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition pointer-events-none drop-shadow-[0_0_4px_black]">
      {weight !== Infinity ? weight : ''}
    </span>
  )}
</div>


);
}

export default Cell;
