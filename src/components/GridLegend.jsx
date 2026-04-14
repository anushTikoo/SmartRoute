/**

* GridLegend Component (Styled - Dark UI)
*
* Matches SmartRoute design:
* * Terrain Complexity Index
* * Path Glossary
    */

function LegendBox({ color, label }) {
  return (<div className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded ${color}`}></div> <span className="text-gray-300 text-sm">{label}</span> </div>
  );
}

export function GridLegend() {
  return (<div className="flex justify-between flex-wrap gap-6 text-sm">

    ```
    {/* LEFT: TERRAIN INDEX */}
    <div>
      <p className="text-xs text-gray-400 mb-2">TERRAIN COMPLEXITY INDEX</p>

      <div className="flex flex-wrap gap-3">
        <LegendBox color="bg-green-500" label="W1 Road" />
        <LegendBox color="bg-lime-400" label="W2 Grass" />
        <LegendBox color="bg-yellow-400" label="W3 Sand" />
        <LegendBox color="bg-orange-500" label="W4 Shrub" />
        <LegendBox color="bg-amber-700" label="W5 Mud" />
        <LegendBox color="bg-green-900" label="W6 Forest" />
        <LegendBox color="bg-teal-700" label="W7 Swamp" />
        <LegendBox color="bg-gray-500" label="W8 Mountain" />
        <LegendBox color="bg-white border border-gray-400" label="W9 Snow" />
        <LegendBox color="bg-gray-800" label="Wall" />
      </div>
    </div>

    {/* RIGHT: PATH LEGEND */}
    <div>
      <p className="text-xs text-gray-400 mb-2">PATH GLOSSARY</p>

      <div className="flex flex-col gap-2">
        <LegendBox color="bg-yellow-400" label="Shortest Path" />
        <LegendBox color="bg-blue-400" label="Visited" />
        <LegendBox color="bg-green-500" label="Start Node" />
        <LegendBox color="bg-red-500" label="Finish Node" />
      </div>
    </div>

  </div>


);
}
