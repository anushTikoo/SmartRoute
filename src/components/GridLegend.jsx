/**
 * GridLegend Component
 * 
 * Displays a visual legend explaining the color coding of grid elements:
 * - Start and finish nodes
 * - Walls/obstacles
 * - Visited nodes
 * - Shortest path
 * - Terrain weights
 * 
 * Helps users understand what each visual element represents.
 */

/**
 * Individual legend item showing a colored box with a label.
 * 
 * @param {Object} props
 * @param {string} props.colorClass - Tailwind background color class for the indicator box
 * @param {React.ReactNode} props.label - Text or element to display as the label
 * @param {string} props.textClass - Optional text color class for text-based indicators
 */
function LegendItem({ colorClass, label, textClass }) {
  return (
    <div className="flex items-center gap-2">
      {textClass ? (
        <span className={`font-bold ${textClass}`}>1-9</span>
      ) : (
        <div className={`w-4 h-4 ${colorClass}`}></div>
      )}
      <span>{label}</span>
    </div>
  );
}

/**
 * Legend component displaying all grid element explanations.
 */
export function GridLegend() {
  return (
    <div className="flex gap-4 text-sm flex-wrap justify-center bg-white p-3 rounded shadow-sm border border-gray-200">
      <LegendItem 
        colorClass="bg-green-500" 
        label="Start" 
      />
      <LegendItem 
        colorClass="bg-red-500" 
        label="Finish" 
      />
      <LegendItem 
        colorClass="bg-gray-800" 
        label="Wall (obstacle)" 
      />
      <LegendItem 
        colorClass="bg-blue-400" 
        label="Visited" 
      />
      <LegendItem 
        colorClass="bg-yellow-400" 
        label="Shortest Path" 
      />
      <LegendItem 
        textClass="font-bold"
        label="Terrain Weights (procedural)" 
      />
    </div>
  );
}
