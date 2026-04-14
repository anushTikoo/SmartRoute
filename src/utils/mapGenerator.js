/**
 * Map Generator with Object-based Terrain System (1–9)
 */
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import { TERRAIN_TYPES } from '../constants/grid';

export function generateMap(seed) {
  const terrainNoise = createNoise2D(alea(seed + 'terrain'));
  const obstacleNoise = createNoise2D(alea(seed + 'obstacle'));

  return Array.from({ length: 30 }, (_, r) =>
    Array.from({ length: 30 }, (_, c) => {

      // 1. Handle Obstacles
      const obstacleVal = obstacleNoise(c * 0.12, r * 0.12);
      if (obstacleVal > 0.55) {
        return {
          row: r,
          col: c,
          weight: Infinity,
          terrain: "wall",
          obstacle: true
        };
      }

      // 2. Map Noise to Keys 1 through 9
      const val = terrainNoise(c * 0.1, r * 0.1);
      const normalized = (val + 1) / 2; // Range 0.0 to 1.0

      // Math.floor(0.99 * 9) + 1 = 9
      // Math.floor(0.01 * 9) + 1 = 1
      let weightKey = Math.floor(normalized * 9) + 1;

      // Clamp for safety
      if (weightKey < 1) weightKey = 1;
      if (weightKey > 9) weightKey = 9;

      // 3. Access the Object using the key (1-9)
      const terrain = TERRAIN_TYPES[weightKey];

      // 4. Return data
      return {
        row: r,
        col: c,
        weight: terrain ? terrain.cost : 1, // Fallback to 1 if missing
        terrain: terrain ? terrain.name : "road",
        obstacle: false
      };
    })
  );
}

export function generateRandomSeed() {
  return Math.random().toString(36).substring(2, 9);
}