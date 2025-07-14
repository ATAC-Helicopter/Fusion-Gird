import { setupDevModeUI, logEvent } from './devMode.js';
import {
  setupGameUI,
  updateScoreDisplay,
  setupWarningCounter,
  setupWarningMessageArea,
  showPenaltyBanner,
  updateEndlessModeIndicator,
  ensureTooltipArea,
  showEndBanner
} from './ui.js';
import { tryMerge, applyOp } from './tileUtils.js';
import { checkScoreForOpPrompt } from './operatorSystem.js';
let weakMergeWarningsRemaining = 3;
let lastWeakMergeTime = 0;
const gridSize = 4;
let grid = [];
let tiles = [];
let score = 0;
let highScore = localStorage.getItem('fusionHighScore') ? parseInt(localStorage.getItem('fusionHighScore')) : 0;
let nextOpThreshold = { value: 100 };
let moveIndex = 0;
let largestTile = 0;
let thresholdCheckEnabled = false;
let moveLimit = 180;
let minTileThreshold = 8;
let gameStartMoveIndex = 0;
let warningsEnabled = true;
let moveLimitEnabled = true;


const operations = ['+', '-', '*', '/'];

let inEndlessMode = false;

let inputLock = false;

window.onload = () => {
  setupDevModeUI(showEndBanner);
  setupGameUI();
  document.addEventListener('keydown', handleInput);
};




function startGame({ warningsEnabled: wEnabled = true, moveLimitEnabled: mEnabled = true } = {}) {
  warningsEnabled = inEndlessMode ? false : wEnabled;
  moveLimitEnabled = inEndlessMode ? false : mEnabled;
  inputLock = false;
  moveLimit = moveLimitEnabled ? 180 : Infinity;
  // Remove endless mode indicator if present
  const indicator = document.getElementById('endless-indicator');
  if (indicator) indicator.remove();
  grid = Array(gridSize * gridSize).fill(null);
  tiles = [];
  score = 0;
  largestTile = 0;
  moveIndex = 0;
  const infoBox = document.getElementById('info-box');
if (infoBox && infoBox.style.display === 'none') {
  infoBox.style.display = 'block';
}
  gameStartMoveIndex = 0;
  thresholdCheckEnabled = false;
  weakMergeWarningsRemaining = warningsEnabled ? 3 : 0;
  document.getElementById('win-lose-banner')?.remove();
  // Setup UI helpers
  updateScoreDisplay(0, highScore);
  setupWarningCounter(weakMergeWarningsRemaining);
  setupWarningMessageArea();
  updateEndlessModeIndicator(inEndlessMode);
  spawnTile();
  spawnTile();
  drawTiles();
}

function spawnTile() {
  const emptyIndexes = grid.map((v, i) => v === null ? i : null).filter(i => i !== null);
  if (emptyIndexes.length === 0) return;

  const index = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  if (grid[index] !== null) return; // ensure it's still empty

  const value = Math.random() < 0.9 ? 2 : 4; // classic 2048 behavior
  const tile = { value, op: null, index };
  grid[index] = tile;
  tiles.push(tile);
  if (value > largestTile) largestTile = value;
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  logEvent(`[SPAWN] Spawned ${value} at index ${index} (row: ${row}, col: ${col})`);
}

function handleInput(e) {
  if (inputLock || document.getElementById('win-lose-banner')) return;

  const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  if (!keys.includes(e.key)) return;
  e.preventDefault();

  let moved = false;
  switch (e.key) {
    case 'ArrowLeft': moved = move(0, -1); break;
    case 'ArrowRight': moved = move(0, 1); break;
    case 'ArrowUp': moved = move(-1, 0); break;
    case 'ArrowDown': moved = move(1, 0); break;
  }

  if (moved) {
    console.log(`\n=== MOVE ${++moveIndex} ===`);
    
    if (!inEndlessMode && moveIndex >= moveLimit) {
      const highest = Math.max(...tiles.map(t => t.value));
      if (highest < 2048) {
        showEndBanner('Move Limit Reached', startGame);
        inputLock = true;
        return;
      }
    }
    inputLock = true;
    spawnTile();
    checkScoreForOpPrompt(tiles, score, nextOpThreshold, operations, grid, gridSize);
    drawTiles();
    logEvent(`[INFO] Largest tile: ${largestTile}`);
    setTimeout(() => inputLock = false, 80); // debounce delay
    checkGameEnd();
    // Dynamic minimum tile threshold check
    const thresholdInterval = 10;
    const currentThreshold = minTileThreshold + Math.floor(moveIndex / thresholdInterval) * 8;
    const metThreshold = tiles.some(t => t.value >= currentThreshold);
    if (!thresholdCheckEnabled && metThreshold) {
      thresholdCheckEnabled = true;
    }
    // Weak tile elimination logic — merge-grace-period only (no persistent-tile check)
    if (!inEndlessMode && thresholdCheckEnabled) {
      const graceMoves = 14 + Math.floor(currentThreshold / 10);
      for (const tile of tiles) {
        if (tile.createdAtMove !== undefined) {
          const age = moveIndex - tile.createdAtMove;
          if (age > graceMoves && tile.value < tile.mustReachValue) {
            showEndBanner(`Eliminated — Tile ${tile.value} did not reach ${tile.mustReachValue} in time`, startGame);
            inputLock = true;
            return;
          }
        }
      }
    }
  }
}

function move(dy, dx) {
  let moved = false;
  const order = [...Array(gridSize).keys()];
  if (dy === 1 || dx === 1) order.reverse();

  for (let y of order) {
    for (let x of order) {
      let idx = y * gridSize + x;
      let tile = grid[idx];
      if (!tile) continue;

      let nx = x, ny = y;
      while (true) {
        let tx = nx + dx;
        let ty = ny + dy;
        if (tx < 0 || tx >= gridSize || ty < 0 || ty >= gridSize) break;
        let targetIdx = ty * gridSize + tx;
        let target = grid[targetIdx];

        if (!target) {
          grid[ty * gridSize + tx] = tile;
          grid[ny * gridSize + nx] = null;
          logEvent(`[MOVE] Moved tile from (${ny}, ${nx}) to (${ty}, ${tx})`);
          tile.index = ty * gridSize + tx;
          nx = tx; ny = ty;
          moved = true;
        } else {
          const result = tryMerge(tile, target);
          const mergedBySubOrDiv = (tile.op === '-' || tile.op === '/');

          const currentMinThreshold = minTileThreshold + Math.floor(moveIndex / 10) * 8;

if (
  warningsEnabled &&
  moveLimitEnabled &&
  !inEndlessMode &&
  mergedBySubOrDiv &&
  (typeof result !== 'number' || result < currentMinThreshold)
) {
  const shown = typeof result === 'number' ? result : 'invalid';

  if (weakMergeWarningsRemaining > 0) {
    if ((moveIndex - lastWeakMergeTime > 3)) {
      weakMergeWarningsRemaining--;
      lastWeakMergeTime = moveIndex;

      const warningMsg = document.getElementById('warning-msg');
      if (warningMsg) {
        const warningLine = document.createElement('div');
        warningLine.style.background = '#fff3cd';
        warningLine.style.borderRadius = '6px';
        warningLine.style.padding = '6px 12px';
        warningLine.style.marginTop = '6px';
        warningLine.style.color = '#d32f2f';
        warningLine.style.fontSize = '14px';
        warningLine.style.fontWeight = '500';
        warningLine.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        warningLine.innerHTML = `⚠️ Weak merge – result ${shown} is below minimum ${currentMinThreshold}`;
        warningMsg.appendChild(warningLine);
        warningMsg.style.display = 'block';
      }
    } // else: grace cooldown is in effect, but no penalty yet
  } else {
    if (!tile.penalized) {
      moveLimit -= 10;
      tile.penalized = true;
      showPenaltyBanner();
    } else {
      showEndBanner(`Eliminated — Resulting tile too weak (${shown} < min)`, startGame);
      inputLock = true;
      return false;
    }
  }
}
          if (result !== null) {
            tile.value = result;
            tile.op = null;
            // Remove weak tile tracking after merge
            delete tile.createdAtMove;
            delete tile.mustReachValue;
            grid[ny * gridSize + nx] = null;
            grid[ty * gridSize + tx] = tile;
            tile.index = ty * gridSize + tx;
            tiles = tiles.filter(t => t !== target);
            moved = true;
            if (tile.op === '-' || tile.op === '/') {
              score -= result;
              if (score < 0) score = 0;
            } else {
              score += result;
            }
            if (result > largestTile) largestTile = result;
            logEvent(`[MERGE] Merged tiles to ${result} at index ${ty * gridSize + tx}`);
          }
          break;
        }
      }
    }
  }

  return moved;
}


function drawTiles() {
  const gridEl = document.getElementById('grid');
  gridEl.innerHTML = '';
  const tileSize = 80;
  const gap = 8;

  // Render background grid tiles
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const bg = document.createElement('div');
      bg.className = 'tile background-tile';
      bg.style.position = 'absolute';
      bg.style.width = `${tileSize}px`;
      bg.style.height = `${tileSize}px`;
      bg.style.left = `${x * (tileSize + gap)}px`;
      bg.style.top = `${y * (tileSize + gap)}px`;
      gridEl.appendChild(bg);
    }
  }

  for (let tile of tiles) {
    const div = document.createElement('div');
    const x = tile.index % gridSize;
    const y = Math.floor(tile.index / gridSize);
    div.className = 'tile';
    const tileClass = 'tile-' + tile.value;
    div.classList.add(tileClass);

    if (tile.op) {
      div.classList.add('tile-op');
      const opClass = tile.op === '+' ? 'add' :
                      tile.op === '-' ? 'sub' :
                      tile.op === '*' ? 'mul' :
                      tile.op === '/' ? 'div' : '';
      div.classList.add(opClass);
      div.setAttribute('data-op', tile.op);
      div.setAttribute('data-power', tile.value);

      const number = document.createElement('div');
      number.className = 'tile-number';
      number.innerText = tile.value;
      div.appendChild(number);

      const badge = document.createElement('div');
      badge.className = 'op-badge';
      badge.innerText = tile.op === '+' ? '+' :
                        tile.op === '-' ? '−' :
                        tile.op === '*' ? '×' :
                        tile.op === '/' ? '÷' : tile.op;
      badge.style.position = 'absolute';
      badge.style.bottom = '-20px';
      badge.style.right = '8px';
      badge.style.fontSize = '22px';
      badge.style.fontWeight = 'bold';
      badge.style.textShadow = '0 0 3px rgba(0,0,0,0.4)';
      badge.style.color = '#000';
      div.appendChild(badge);

      let wrapper;
      let tooltip;
      if (tile.previewOp) {
        wrapper = document.createElement('div');
        wrapper.className = 'tile-wrapper has-tooltip tile-op';
        wrapper.style.position = 'absolute';
        wrapper.style.zIndex = '20';
        wrapper.style.width = `${tileSize}px`;
        wrapper.style.height = `${tileSize}px`;
        wrapper.style.left = `${x * (tileSize + gap)}px`;
        wrapper.style.top = `${y * (tileSize + gap)}px`;
        // Remove transform property if present
        wrapper.style.transform = '';

        div.style.position = 'absolute';
        div.style.top = '0';
        div.style.left = '0';

        tooltip = document.createElement('div');
        tooltip.className = 'tile-tooltip';
        tooltip.innerHTML = tile.previewOp
          .split('\n')
          .map(op => `<div class="tooltip-line">${op}</div>`)
          .join('');
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.style.display = 'none';
        tooltip.style.flexDirection = 'column';
        tooltip.style.alignItems = 'flex-start';

        // Tooltip positioning and z-index to ensure visibility above all UI elements
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '3001'; // Ensure it's above all other UI elements
        tooltip.style.top = '100%';
        tooltip.style.left = '0';
        tooltip.style.marginLeft = '0';
        tooltip.style.marginTop = '12px';
        // tooltip.style.top = '-10px';
        // tooltip.style.left = '100%';
        // tooltip.style.marginLeft = '12px';

        tooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        tooltip.style.backdropFilter = 'blur(6px)';
        tooltip.style.color = '#111';
        tooltip.style.padding = '10px 16px';
        tooltip.style.borderRadius = '12px';
        tooltip.style.border = '1px solid rgba(0,0,0,0.15)';
        tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        tooltip.style.fontSize = '15px';
        tooltip.style.fontWeight = '600';
        tooltip.style.lineHeight = '1.6';
        tooltip.style.fontFamily = 'monospace';
        // (removed tooltip.style.zIndex = '3000';)
      } else {
        wrapper = document.createElement('div');
        wrapper.className = 'tile-wrapper tile-op';
        wrapper.style.position = 'absolute';
        wrapper.style.zIndex = '20';
        wrapper.style.width = `${tileSize}px`;
        wrapper.style.height = `${tileSize}px`;
        wrapper.style.left = `${x * (tileSize + gap)}px`;
        wrapper.style.top = `${y * (tileSize + gap)}px`;
        // Remove transform property if present
        wrapper.style.transform = '';

        div.style.position = 'absolute';
        div.style.top = '0';
        div.style.left = '0';
      }

      wrapper.onmouseenter = () => {
        const tooltipArea = document.getElementById('tooltip-area');
        tooltipArea.innerHTML = '';
        // Move tooltip positioning and visibility logic after clearing innerHTML
        if (tooltip) {
          tooltipArea.appendChild(tooltip);
          tooltip.style.display = 'block';
          tooltipArea.style.display = 'block';
          tooltipArea.style.zIndex = '3002'; // Ensure above warnings
        } else {
          tooltipArea.style.display = 'none';
        }

        // Highlight target tiles
        const targetX = tile.index % gridSize;
        const targetY = Math.floor(tile.index / gridSize);
        const directions = [
          [0, -1], [0, 1], [-1, 0], [1, 0]
        ];

        for (const [dx, dy] of directions) {
          const nx = targetX + dx;
          const ny = targetY + dy;
          if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
            const neighborIndex = ny * gridSize + nx;
            const neighbor = grid[neighborIndex];
            if (neighbor && neighbor !== tile && !neighbor.op) {
              const result = applyOp(tile.value, neighbor.value, tile.op);
              if (result !== null) {
                const tileDiv = [...gridEl.children].find(child => {
                  const isWrapper = child.classList.contains('tile-wrapper');
                  if (!isWrapper || child.classList.contains('background-tile')) return false;
                  const left = parseInt(child.style.left);
                  const top = parseInt(child.style.top);
                  return left === nx * (tileSize + gap) && top === ny * (tileSize + gap);
                });
                if (tileDiv) tileDiv.classList.add('tile-highlight');
              }
            }
          }
        }
      };

      wrapper.onmouseleave = () => {
        const tooltipArea = document.getElementById('tooltip-area');
        tooltipArea.style.display = 'none';
        if (tooltip) tooltip.style.display = 'none';
        document.querySelectorAll('.tile-highlight').forEach(el => el.classList.remove('tile-highlight'));
      };

      wrapper.appendChild(div);
      gridEl.appendChild(wrapper);

      // If previewOp exists, ensure tooltip area is visible after appending tooltip
      if (tile.previewOp) {
        const tooltipArea = document.getElementById('tooltip-area');
        tooltipArea.style.display = 'block';
      }
    } else {
      div.innerText = tile.value;
      div.style.position = 'absolute';
      div.style.width = `${tileSize}px`;
      div.style.height = `${tileSize}px`;
      div.style.lineHeight = `${tileSize}px`;
      div.style.textAlign = 'center';
      div.style.fontSize = '24px';
      div.style.left = `${x * (tileSize + gap)}px`;
      div.style.top = `${y * (tileSize + gap)}px`;
      div.style.position = 'absolute';
      div.style.transform = '';
      gridEl.appendChild(div);
    }

  }

  // Update high score if necessary and update score display
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('fusionHighScore', highScore);
  }
  updateScoreDisplay(score, highScore);
  // Update goal tracker values
  const moveEl = document.getElementById('move-counter');
  const minTileEl = document.getElementById('min-tile');
  const thresholdInterval = 10;
  const currentThreshold = minTileThreshold + Math.floor(moveIndex / thresholdInterval) * 8;
  if (moveEl) moveEl.innerText = `Moves Left: ${moveLimit - moveIndex}`;
  if (minTileEl) minTileEl.innerText = `Min Tile: ${currentThreshold}`;

  // Update floating warning counter
  const warningCounter = document.getElementById('warning-counter');
  if (warningCounter) warningCounter.innerText = `⚠️ Warnings Left: ${weakMergeWarningsRemaining}`;
  // If in Endless Mode, update indicator to append warning count
  updateEndlessModeIndicator(inEndlessMode);

  // Force hide tooltip after every move
  const tooltipArea = document.getElementById('tooltip-area');
  tooltipArea.innerHTML = '';
  tooltipArea.style.display = 'none';

  // Ensure #tooltip-area exists and is after #grid in the DOM
  ensureTooltipArea();
}



function checkGameEnd() {
  if (inEndlessMode) return;
  const winMin = 2048;
const winMax = 2500;
const hasWinningTile = tiles.some(t => t.value >= winMin && t.value <= winMax);
if (hasWinningTile) {
  showEndBanner('You Win!', startGame);
  inputLock = true;
  return;
}

  const emptyExists = grid.some(t => t === null);
  if (emptyExists) return;

  // Try all possible moves
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const idx = y * gridSize + x;
      const tile = grid[idx];
      if (!tile) continue;

      for (const [dx, dy] of [[0, 1], [1, 0]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= gridSize || ny >= gridSize) continue;
        const neighbor = grid[ny * gridSize + nx];
        if (!neighbor) return;

        if (tile.value === neighbor.value) return;
        if (tile.op || neighbor.op) {
          if (tryMerge(tile, neighbor) !== null) return;
        }
      }
    }
  }

  showEndBanner('Game Over');
  showEndBanner('Game Over', startGame);
  inputLock = true;
}

export function launchGame({ endlessMode = false, warningsEnabled = true, moveLimitEnabled = true } = {}) {
  inEndlessMode = endlessMode;
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  startGame({ warningsEnabled, moveLimitEnabled });
}

export function setInputLock(state) {
  inputLock = state;
}