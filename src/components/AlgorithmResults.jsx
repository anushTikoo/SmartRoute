export function AlgorithmResults({
  dijkstraResult,
  bfsResult,
  astarResult,
  astarWeightedResults,
  dijkstraComplete,
  bfsComplete,
  astarComplete,
}) {
  const weightedAStarEntries = Object.entries(astarWeightedResults || {})
    .map(([eps, data]) => ({ epsilon: parseFloat(eps), ...data }))
    .filter(entry => entry.complete)
    .sort((a, b) => a.epsilon - b.epsilon);

  const results = [];
  if (dijkstraComplete && dijkstraResult) results.push({ name: 'DIJKSTRA', result: dijkstraResult });
  if (bfsComplete && bfsResult) results.push({ name: 'BFS', result: bfsResult });
  if (astarComplete && astarResult) results.push({ name: 'A* MANHATTAN', result: astarResult });
  weightedAStarEntries.forEach(({ epsilon, result }) => {
    results.push({ name: `WEIGHTED A* (ε=${epsilon.toFixed(1)})`, result });
  });

  return (
    <div className="mt-auto bg-surface-container-low rounded-xl overflow-hidden flex-shrink-0 mb-4">
      <div className="bg-surface-container-high px-4 py-2 flex justify-between items-center border-b border-outline-variant/10">
        <span className="text-[10px] font-black uppercase text-primary">Live Telemetry</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse delay-75"></div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
        {results.length === 0 ? (
          <div className="flex justify-center items-center h-20">
            <span className="text-xs font-bold text-on-surface-variant uppercase">Awaiting Execution</span>
          </div>
        ) : (
          results.map(({ name, result }, idx) => (
            <div key={idx} className="space-y-2 pb-3 border-b border-outline-variant/10 last:border-0 last:pb-0">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Active Algorithm</span>
                <span className={`text-xs font-bold ${result.noPath ? 'text-error' : 'text-on-surface'}`}>{name}</span>
              </div>

              {result.noPath ? (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-medium text-error-dim uppercase tracking-wider">Status</span>
                  <span className="text-xs font-bold text-error">GOAL UNREACHABLE</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Path Cost</span>
                    <span className="text-xs font-bold text-primary">{result.weight} <span className="text-on-surface-variant">({result.length} cells)</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Cells Visited</span>
                    <span className="text-xs font-bold text-on-surface">{result.visitedCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Exec Time</span>
                    <span className="text-xs font-bold text-secondary">{result.timeToGoal}ms</span>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
