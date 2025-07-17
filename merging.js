import { tryMerge } from './tileUtils.js';
import { logEvent } from './devMode.js';

export function tryMergeInDirection(grid, tiles, dx, dy, gridSize, scoreRef, largestTileRef) {
  let merged = false;
  const moved = new Set();
  const tilesToRemove = new Set();

  // Determine iteration order based on direction to ensure proper merging
  const rowRange = [...Array(gridSize).keys()];
  const colRange = [...Array(gridSize).keys()];
  if (dy > 0) rowRange.reverse();
  if (dx > 0) colRange.reverse();

  for (const y of rowRange) {
    for (const x of colRange) {
      const index = y * gridSize + x;
      const tile = grid[index];
      if (!tile) continue;
      if (tile.blocking) continue;

      let targetY = y + dy;
      let targetX = x + dx;

      if (
        targetY >= 0 && targetY < gridSize &&
        targetX >= 0 && targetX < gridSize
      ) {
        const targetIndex = targetY * gridSize + targetX;
        const targetTile = grid[targetIndex];
        if (!targetTile || tile === targetTile) continue;
        if (targetTile.blocking) continue;

        // Attempt merge if valid and target not merged yet
        const result = tryMerge(tile, targetTile);
        if (result !== null && !moved.has(targetIndex)) {
          const isBlocking = typeof result === 'object' && result.blocking;
          const mergeValue = typeof result === 'object' ? result.value : result;

          const mergedTile = {
            value: isBlocking ? 0 : mergeValue,
            index: targetIndex
          };
          if (isBlocking) {
            mergedTile.blocking = true;
          }

          grid[targetIndex] = mergedTile;
          grid[index] = null;

          // Mark tiles for removal instead of splicing directly
          tilesToRemove.add(tile);
          tilesToRemove.add(targetTile);
          tiles.push(mergedTile);

          if (!isBlocking) {
            scoreRef.value += mergeValue;
          }
          if (mergeValue > largestTileRef.value) largestTileRef.value = mergeValue;

          moved.add(targetIndex);
          merged = true;
        }
      }
    }
  }

  // Remove all tiles that were merged and replaced
  if (tilesToRemove.size > 0) {
    tiles = tiles.filter(t => !tilesToRemove.has(t));
  }

  return merged;
}