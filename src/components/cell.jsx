/**
 * Cell Component - Terrain Grid with Neon Modern Aesthetic
 *
 * Features:
 * - Cell size: 32x32px (w-8 h-8) with rounded corners
 * - Terrain-appropriate colors (snow=white, road=gray, etc.)
 * - Neon glow effects for modern vibe
 * - Smooth hover animations
 *
 * Terrain Colors (weight = terrain type):
 * - 1 Road: Gray with cyan neon
 * - 2 Grass: Bright green with green neon
 * - 3 Sand: Yellow with amber neon
 * - 4 Shrub: Lime with lime neon
 * - 5 Mud: Dark brown with orange neon
 * - 6 Forest: Deep emerald with emerald neon
 * - 7 Swamp: Purple with pink neon
 * - 8 Mountain: Slate with cyan neon
 * - 9 Snow: White with ice blue neon
 */

import { memo } from 'react';

const WEIGHT_COLORS = {
  1: 'bg-gray-600',           // Road - gray asphalt
  2: 'bg-green-400',          // Grass - bright green
  3: 'bg-yellow-300',         // Sand - sandy yellow
  4: 'bg-lime-500',           // Shrub - lime green
  5: 'bg-amber-700',          // Mud - dark brown
  6: 'bg-emerald-700',        // Forest - deep green
  7: 'bg-purple-800',         // Swamp - dark purple
  8: 'bg-slate-600',          // Mountain - slate gray
  9: 'bg-slate-100',          // Snow - bright white/very light gray
};

/**
 * Neon shadow/glow effects for each terrain type.
 * Creates the modern neon vibe with colored shadows.
 */
const WEIGHT_NEON_GLOW = {
  1: 'shadow-[0_0_8px_rgba(6,182,212,0.6)] border-cyan-400',      // Cyan neon for road
  2: 'shadow-[0_0_10px_rgba(34,197,94,0.7)] border-green-300',   // Green neon for grass
  3: 'shadow-[0_0_10px_rgba(251,191,36,0.7)] border-yellow-300',  // Yellow neon for sand
  4: 'shadow-[0_0_10px_rgba(132,204,22,0.7)] border-lime-300',   // Lime neon for shrub
  5: 'shadow-[0_0_8px_rgba(249,115,22,0.6)] border-orange-400',   // Orange neon for mud
  6: 'shadow-[0_0_10px_rgba(16,185,129,0.7)] border-emerald-400', // Emerald neon for forest
  7: 'shadow-[0_0_10px_rgba(236,72,153,0.7)] border-pink-400',    // Pink neon for swamp
  8: 'shadow-[0_0_10px_rgba(34,211,238,0.7)] border-cyan-300',    // Cyan neon for mountain
  9: 'shadow-[0_0_12px_rgba(147,197,253,0.8)] border-blue-300',   // Ice blue neon for snow
};

/**
 * Cell component representing a single grid cell.
 *
 * Visual priority (highest to lowest):
 * 1. Start/Finish nodes (green/red) - always visible
 * 2. Walls (gray) - always visible
 * 3. Path nodes (yellow) - always visible when isInPath is true
 * 4. Visited nodes (blue) - visible only when showVisited is true AND isVisited is true
 * 5. Terrain weight colors - default when no special state applies
 *
 * The showVisited prop controls whether visited nodes display their blue color or revert
 * to terrain colors. This allows users to toggle the visited visualization on/off after
 * algorithm animation completes, making it easier to see the final path against terrain.
 *
 * @param {number} row - Row index of the cell
 * @param {number} col - Column index of the cell
 * @param {boolean} isStart - Whether this cell is the start node
 * @param {boolean} isFinish - Whether this cell is the finish node
 * @param {boolean} isWall - Whether this cell is a wall/obstacle
 * @param {boolean} isVisited - Whether this cell was visited by the algorithm
 * @param {boolean} isInPath - Whether this cell is part of the shortest path
 * @param {number} weight - The terrain weight (1-9, or Infinity for walls)
 * @param {boolean} showVisited - Whether to show visited node colors (false = show terrain colors instead)
 * @param {function} onClick - Click handler function
 */
/**
 * Text color mapping for weights to ensure readability on colored backgrounds.
 * Dark backgrounds get white text, light backgrounds get dark text.
 */
const WEIGHT_TEXT_COLORS = {
  1: 'text-white',        // White on gray
  2: 'text-gray-900',     // Dark on bright green
  3: 'text-gray-900',     // Dark on yellow
  4: 'text-gray-900',     // Dark on lime
  5: 'text-white',        // White on brown
  6: 'text-white',        // White on dark green
  7: 'text-white',        // White on purple
  8: 'text-white',        // White on slate
  9: 'text-gray-800',     // Dark on white snow
};

function CellComponent({ row, col, isStart, isFinish, isWall, isVisited, isInPath, weight, showVisited, onClick }) {
  // Base cell styling - dynamic size based on grid context with minimum 32px
  // Added rounded corners and thicker border for modern look
  let cellClass = "w-full aspect-square min-w-[32px] min-h-[32px] rounded border flex items-center justify-center text-[10px] font-bold cursor-pointer select-none relative transition-all duration-150 ";

  if (isStart) {
    // Start node: neon green glow with white ring
    cellClass += "bg-green-500 text-white ring-2 ring-white ring-offset-2 shadow-[0_0_15px_rgba(34,197,94,0.8)] z-20 scale-110";
  } else if (isFinish) {
    // Finish node: neon red glow with pulse animation
    cellClass += "bg-red-500 text-white ring-2 ring-white ring-offset-2 shadow-[0_0_20px_rgba(239,68,68,0.9)] z-20 scale-110 animate-pulse";
  } else if (isWall) {
    // Wall: dark with subtle border
    cellClass += "bg-gray-900 border-gray-700 shadow-inner";
  } else if (isInPath) {
    // Shortest path: bright cyan neon glow
    cellClass += "bg-cyan-300 text-gray-900 ring-2 ring-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.9)] z-10 scale-105 font-extrabold";
  } else if (isVisited && showVisited) {
    // Visited: electric blue glow
    cellClass += "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.7)]";
  } else {
    // Terrain weights with neon glow effect
    const weightColor = WEIGHT_COLORS[weight] || 'bg-gray-800';
    const textColor = WEIGHT_TEXT_COLORS[weight] || 'text-white';
    const neonGlow = WEIGHT_NEON_GLOW[weight] || 'border-gray-600';
    cellClass += `${weightColor} ${textColor} ${neonGlow} hover:scale-105 hover:z-10`;
  }

  return (
    <div
      className={cellClass}
      onClick={() => onClick(row, col)}
      title={`Weight: ${weight}`}
    >
      {!isWall && !isStart && !isFinish && weight}
    </div>
  );
}

/**
 * Custom comparison function for React.memo.
 * Only re-render if cell-specific props actually changed.
 * This prevents unnecessary re-renders during animation of other cells.
 */
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.isStart === nextProps.isStart &&
    prevProps.isFinish === nextProps.isFinish &&
    prevProps.isWall === nextProps.isWall &&
    prevProps.isVisited === nextProps.isVisited &&
    prevProps.isInPath === nextProps.isInPath &&
    prevProps.weight === nextProps.weight &&
    prevProps.showVisited === nextProps.showVisited
    // Note: onClick is not checked because it's a stable callback from useCallback
  );
};

/**
 * Memoized Cell component to prevent unnecessary re-renders.
 * During animation, only cells that change (visited/path status) will re-render,
 * significantly improving performance for the 30x30 = 900 cell grid.
 */
const Cell = memo(CellComponent, areEqual);

export default Cell;
