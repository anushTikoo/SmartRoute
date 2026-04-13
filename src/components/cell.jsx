/**
 * Color mapping for terrain weights.
 * Each weight (1-9) has a background color representing terrain difficulty.
 * This object is defined outside the component for easy modification.
 *
 * Color progression: easier terrain (brown/green) -> harder terrain (yellow/orange/red)
 * - Weight 1: Brown (easiest terrain, like dirt/plains)
 * - Weight 2: Light green (grassland)
 * - Weight 3: Green (light forest/meadow)
 * - Weight 5: Yellow (hills)
 * - Weight 7: Orange (mountains)
 * - Weight 9: Dark red/maroon (most difficult terrain)
 */
const WEIGHT_COLORS = {
  1: 'bg-amber-700',      // Brown (easiest)
  2: 'bg-lime-400',       // Light green
  3: 'bg-green-500',      // Green
  5: 'bg-yellow-400',     // Yellow
  7: 'bg-orange-500',     // Orange
  9: 'bg-red-800',        // Dark red (hardest)
};

/**
 * Text color mapping for weights to ensure readability on colored backgrounds.
 * Dark backgrounds get white text, light backgrounds get dark text.
 */
const WEIGHT_TEXT_COLORS = {
  1: 'text-white',        // White on brown
  2: 'text-gray-900',     // Dark on light green
  3: 'text-white',        // White on green
  5: 'text-gray-900',     // Dark on yellow
  7: 'text-white',        // White on orange
  9: 'text-white',        // White on dark red
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
function Cell({ row, col, isStart, isFinish, isWall, isVisited, isInPath, weight, showVisited, onClick }) {
  // Base cell styling with position relative for z-index layering
  let cellClass = "w-6 h-6 border border-gray-300 flex items-center justify-center text-xs font-bold cursor-pointer select-none relative ";

  if (isStart) {
    // Start node: bright green with thick white ring, shadow, and slight scale for prominence
    // The white ring creates contrast against any terrain color
    // Shadow adds depth perception, z-10 ensures it layers above adjacent cells
    cellClass += "bg-green-500 text-white ring-2 ring-white ring-offset-1 shadow-lg shadow-green-500/50 z-10 scale-105";
  } else if (isFinish) {
    // Finish node: bright red with thick white ring, shadow, and pulsing animation
    // Pulse animation draws attention to the goal
    // Multiple visual cues (ring, shadow, animation) ensure it's noticeable against any background
    cellClass += "bg-red-500 text-white ring-2 ring-white ring-offset-1 shadow-lg shadow-red-500/50 z-10 scale-105 animate-pulse";
  } else if (isWall) {
    cellClass += "bg-gray-800";
  } else if (isInPath) {
    // Shortest path: bright yellow with dark border and shadow for visibility
    // The ring-1 creates a crisp outline that separates path from terrain
    // Shadow provides elevation to distinguish from flat terrain cells
    // z-10 ensures path segments layer correctly at intersections
    cellClass += "bg-yellow-300 text-black ring-2 ring-black shadow-md shadow-yellow-500/50 z-10 scale-105 font-extrabold";
  } else if (isVisited && showVisited) {
    // Visited node styling is applied ONLY when showVisited is true.
    // When showVisited is false, visited nodes fall through to weight-based coloring,
    // effectively "hiding" the visited state and showing terrain colors instead.
    // This is useful after animation completes to focus on the path vs terrain.
    cellClass += "bg-blue-400 text-white";
  } else {
    // Apply weight-based coloring for normal cells and visited cells when showVisited is false.
    // This shows the terrain type (brown for easy, red for hard, etc.)
    // Use the weight color mapping, fallback to white if weight not in mapping (e.g., Infinity)
    const weightColor = WEIGHT_COLORS[weight] || 'bg-white';
    const textColor = WEIGHT_TEXT_COLORS[weight] || 'text-gray-700';
    cellClass += `${weightColor} ${textColor}`;
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

export default Cell;
