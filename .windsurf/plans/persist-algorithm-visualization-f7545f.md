# Persist Algorithm Visualizations

Store and restore each algorithm's visited nodes and path visualization when switching between algorithms, clearing only on Reset/Randomize.

## Changes Required

### 1. State Management
Add state to store visitedNodes and shortestPath for each algorithm:
- `dijkstraVisitedNodes`, `dijkstraPath`
- `bfsVisitedNodes`, `bfsPath`
- `astarVisitedNodes`, `astarPath`
- `astarWeightedVisitedNodes`, `astarWeightedPath`

### 2. Restore Visualization on Algorithm Switch
When algorithm button is clicked:
- Restore that algorithm's cached visited nodes and path to the grid
- Don't clear other algorithms' cached data (just not visible)
- Remove `clearPath()` call from algorithm switch handlers

### 3. Store Visualization After Run
In `runAlgorithm`, after animation completes:
- Store visitedNodes and shortestPath for the algorithm that just ran

### 4. Rename Button
Change "Randomize" to "Reset/Randomize"

### 5. Reset Behavior
On Reset/Randomize:
- Clear all cached visited nodes and paths
- Randomize the grid (current behavior)
- Reset all completion flags

## Implementation Approach

Create helper functions:
- `restoreVisualization(algorithm)` - restores cached viz for given algorithm to grid
- Modify `clearPath()` to only clear grid state, not cached data
- Modify algorithm switch handlers to call `restoreVisualization()` instead of `clearPath()`
