import { applyOp } from './tileUtils.js';
import { logEvent } from './devMode.js';

export function checkScoreForOpPrompt(tiles, score, nextOpThresholdObj, operations, grid, gridSize) {
  const randomChance = Math.random();
  if (randomChance < 0.15) { // 15% chance to spawn op tile on each move
    assignRandomOpToTile(tiles, operations, grid, gridSize);
  }
}

function assignRandomOpToTile(tiles, operations, grid, gridSize) {
  const candidates = tiles.filter(t => !t.op && !t.blocking);
  if (candidates.length === 0) return;
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  target.op = operations[Math.floor(Math.random() * operations.length)];
  logEvent(`[OPERATOR] Assigned operator ${target.op} to tile at index ${target.index}`);

  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const symbol = symbols?.[target.op] ?? target.op ?? '?';

  const targetX = target.index % gridSize;
  const targetY = Math.floor(target.index / gridSize);

  const previews = [];
  const directions = [
    [0, -1], [0, 1], [-1, 0], [1, 0]
  ];

  for (const [dx, dy] of directions) {
    const nx = targetX + dx;
    const ny = targetY + dy;
    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
      const neighborIndex = ny * gridSize + nx;
      const neighbor = grid[neighborIndex];
      if (neighbor && neighbor !== target && !neighbor.op) {
        const result = applyOp(target.value, neighbor.value, target.op);
        if (result !== null) {
          previews.push(`${target.value} ${symbol} ${neighbor.value} = ${result}`);
        }
      }
    }
  }

  if (previews.length > 0) {
    target.previewOp = previews.join('\n');
  }
}