/**
 * Map Generator Utility
 * 
 * This module handles procedural map generation using Simplex noise.
 * It creates deterministic terrain and obstacle layouts based on a seed string.
 * 
 * The generation uses two independent noise functions:
 * - Terrain noise: Creates large, smooth regions of similar terrain weights
 * - Obstacle noise: Creates clustered impassable wall areas
 * 
 * Using seeded random generation ensures that the same seed always produces
 * the exact same map, enabling reproducible experiments and map sharing.
 */

import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

/**
 * Generates a procedural map using seeded noise for deterministic terrain and obstacles.
 * 
 * This function creates a 30x30 grid where each cell has:
 * - A weight value (1-9) determined by terrain noise for pathfinding costs
 * - An optional obstacle flag for impassable walls
 * 
 * The generation uses two independent noise instances:
 * 1. Terrain noise: Creates clusters of similar terrain weights using low-frequency sampling (0.1 scale)
 * 2. Obstacle noise: Creates natural obstacle clusters using slightly different frequency (0.12 scale)
 * 
 * Using different seeds for each noise instance ensures terrain and obstacles are decorrelated,
 * producing more natural-looking maps where obstacles don't always appear in the same terrain type.
 * 
 * @param {string} seed - The seed string for deterministic generation. Same seed always produces the same map.
 * @returns {Array<Array<Object>>} A 2D array of cell objects with weight and obstacle properties
 */
export function generateMap(seed) {
  // Create the terrain noise instance with a seed derived from the base seed + 'terrain' suffix.
  // This ensures the terrain noise is independent from obstacle noise even with the same base seed.
  // alea() creates a seeded random function that produces the same sequence for the same seed.
  const terrainNoise = createNoise2D(alea(seed + 'terrain'));
  
  // Create the obstacle noise instance with a different seed suffix for independence.
  // Using 'obstacle' suffix ensures obstacle placement is decorrelated from terrain type.
  const obstacleNoise = createNoise2D(alea(seed + 'obstacle'));

  // Generate the 30x30 grid using nested Array.from calls
  // Outer Array.from creates 30 rows (indexed by r)
  return Array.from({ length: 30 }, (_, r) =>
    // Inner Array.from creates 30 columns for each row (indexed by c)
    Array.from({ length: 30 }, (_, c) => {
      // Sample obstacle noise at coordinates scaled by 0.12 to create clustered obstacle patterns.
      // The 0.12 scale is slightly higher than terrain (0.1) to create finer, more varied obstacle clusters.
      // Lower scale values = larger, smoother features. Higher = more detailed, granular patterns.
      const obstacleVal = obstacleNoise(c * 0.12, r * 0.12);
      
      // If obstacle noise exceeds threshold (0.55), mark this cell as an impassable wall.
      // The 0.55 threshold is chosen to create ~20-30% obstacle coverage with natural clustering.
      // Cells with obstacleVal > 0.55 become walls with Infinity weight (completely impassable).
      if (obstacleVal > 0.55) return { weight: Infinity, obstacle: true };

      // Sample terrain noise at coordinates scaled by 0.1 to create large, smooth terrain regions.
      // The 0.1 scale produces continent-sized features where similar terrain types cluster together.
      // This creates natural-looking "biomes" of easy/hard traversal areas.
      const val = terrainNoise(c * 0.1, r * 0.1);
      
      // Map the continuous noise value (-1 to 1) to discrete weight categories (1-9).
      // Simplex noise typically outputs values in approximately [-1, 1] range.
      // We use threshold-based classification to create distinct terrain types:
      // - Weight 9: Very difficult terrain (val > 0.6) - highest movement cost
      // - Weight 7: Difficult terrain (val > 0.35)
      // - Weight 5: Moderate terrain (val > 0.1)
      // - Weight 3: Easy terrain (val > -0.1)
      // - Weight 2: Very easy terrain (val > -0.4)
      // - Weight 1: Easiest terrain (val <= -0.4) - lowest movement cost
      // 
      // These thresholds are tuned to produce a balanced distribution of terrain types,
      // with more moderate terrain (weights 3-5) being most common.
      if (val > 0.6)  return { weight: 9 };
      if (val > 0.35) return { weight: 7 };
      if (val > 0.1)  return { weight: 5 };
      if (val > -0.1) return { weight: 3 };
      if (val > -0.4) return { weight: 2 };
      return { weight: 1 };
    })
  );
}

/**
 * Generates a new random seed string for map generation.
 * 
 * Uses timestamp and random components to create unique seeds.
 * Each call produces a different seed, resulting in a completely different map.
 * 
 * @returns {string} A randomly generated seed string
 */
export function generateRandomSeed() {
  // Combine timestamp (for uniqueness) with random number (for extra entropy)
  // toString(36) converts to alphanumeric string for readability
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
