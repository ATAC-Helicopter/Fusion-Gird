

import { tryMerge } from './tileUtils.js';
import { logEvent } from './devMode.js';

export function tryMergeInDirection(grid, tiles, dx, dy, gridSize, scoreRef, largestTileRef) {
  let merged = false;
  const moved = new Set();

  const rowRange = [...Array(gridSize).keys()];
  const colRange = [...Array(gridSize).keys()];
  if (dy > 0) rowRange.reverse();
  if (dx > 0) colRange.reverse();

  for (const y of rowRange) {
    for (const x of colRange) {
      const index = y * gridSize + x;
      const tile = grid[index];
      if (!tile) continue;

      let targetY = y + dy;
      let targetX = x + dx;

      if (
        targetY >= 0 && targetY < gridSize &&
        targetX >= 0 && targetX < gridSize
      ) {
        const targetIndex = targetY * gridSize + targetX;
        const targetTile = grid[targetIndex];
        if (!targetTile || tile === targetTile) continue;

        const result = tryMerge(tile, targetTile);
        if (result !== null && !moved.has(targetIndex)) {
          const mergedTile = { value: result, index: targetIndex };
          grid[targetIndex] = mergedTile;
          grid[index] = null;

          tiles.splice(tiles.indexOf(tile), 1);
          tiles.splice(tiles.indexOf(targetTile), 1);
          tiles.push(mergedTile);

          scoreRef.value += result;
          if (result > largestTileRef.value) largestTileRef.value = result;

          moved.add(targetIndex);
          merged = true;
          logEvent(`[MERGE] ${tile.value} with ${targetTile.value} into ${result} at ${targetIndex}`);
        }
      }
    }
  }

  return merged;
}