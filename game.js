import { setupDevModeUI, logEvent } from './devMode.js';
import {
  setupGameUI,
  updateScoreDisplay,
  updateEndlessModeIndicator,
  ensureTooltipArea,
  showEndBanner,
  showFirstTimeOverlay,
  setupBonusPointsCounter,
  updateBonusPoints as _updateBonusPoints
} from './ui.js';
import { tryMerge, applyOp } from './tileUtils.js';
// === Game Constants and Config ===
const gridSize = 4;
const operations = ['+', '-', '*', '/'];

// === Animation Speed Constants ===
const tileAnimationSpeed = 60; // in milliseconds

// === Game State ===
let grid = [];
let tiles = [];
// Map to track DOM elements for tiles
const tileElements = new Map();
let score = 0;
let highScore = localStorage.getItem('fusionHighScore') ? parseInt(localStorage.getItem('fusionHighScore')) : 0;
let largestTile = 0;
let moveIndex = 0;
let gameStartMoveIndex = 0;

let bonusPoints = 0;

// === Gameplay Settings ===
let inEndlessMode = false;
let moveLimitEnabled = true;
let moveLimit = 180;

// === Gameplay Flags and Trackers ===
let inputLock = false;

// === Initialization on Window Load ===
window.onload = () => {
  setupDevModeUI(showEndBanner);
  setupGameUI();
  showFirstTimeOverlay();
  document.addEventListener('keydown', handleInput);
};

// === Start a New Game ===
function startGame({ moveLimitEnabled: mEnabled = true, moveLimit: ml = 180 } = {}) {
  moveLimitEnabled = inEndlessMode ? false : mEnabled;
  moveLimit = inEndlessMode ? Infinity : ml;

  // Remove endless mode indicator if present
  const indicator = document.getElementById('endless-indicator');
  if (indicator) indicator.remove();

  // Reset game state
  grid = Array(gridSize * gridSize).fill(null);
  tiles = [];
  score = 0;
  largestTile = 0;
  moveIndex = 0;
  gameStartMoveIndex = 0;

  // Bonus points system
  bonusPoints = 0;
  setupBonusPointsCounter();
  _updateBonusPoints(bonusPoints);

  // Show info box if hidden
  const infoBox = document.getElementById('info-box');
  if (infoBox && infoBox.style.display === 'none') {
    infoBox.style.display = 'block';
  }

  document.getElementById('win-lose-banner')?.remove();

  // Setup UI and spawn initial tiles
  updateScoreDisplay(0, highScore);
  updateEndlessModeIndicator(inEndlessMode);
  spawnTile();
  spawnTile();
  drawTiles();

  // Unlock input and expose global game state
  inputLock = false;
  window.grid = grid;
  window.tiles = tiles;
  window.checkGameEnd = checkGameEnd;
}

function spawnTile() {
  const emptyIndexes = grid.map((v, i) => v === null ? i : null).filter(i => i !== null);
  if (emptyIndexes.length === 0) return;

  const index = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  if (grid[index] !== null) return; // ensure it's still empty

  const value = Math.random() < 0.9 ? 2 : 4; // classic 2048 behavior
  // 15% chance to spawn an operator tile
  const isOpTile = Math.random() < 0.15;
  const op = isOpTile ? operations[Math.floor(Math.random() * operations.length)] : null;
  const tile = {
    id: crypto.randomUUID(),
    value,
    op,
    index,
    justSpawned: true
  };
  grid[index] = tile;
  tiles.push(tile);
  if (value > largestTile) largestTile = value;
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  logEvent(`[SPAWN] Spawned ${value}${op ? " (" + op + ")" : ""} at index ${index} (row: ${row}, col: ${col})`);

  // Draw tiles immediately (no delay)
  drawTiles();
}

function handleInput(e) {
  if (document.getElementById('win-lose-banner')) return;

  const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  if (!keys.includes(e.key)) return;
  e.preventDefault();

  if (inputLock) return;

  processInput(e.key);
}

function processInput(key) {
  let moved = false;
  switch (key) {
    case 'ArrowLeft': moved = move(0, -1); break;
    case 'ArrowRight': moved = move(0, 1); break;
    case 'ArrowUp': moved = move(-1, 0); break;
    case 'ArrowDown': moved = move(1, 0); break;
  }

  if (!moved) return;

  inputLock = true;
  inputLock = false;
  console.log(`\n=== MOVE ${++moveIndex} ===`);

  const highest = Math.max(...tiles.map(t => t.value));
  if (!inEndlessMode && moveIndex >= moveLimit && highest < 2048) {
    showEndBanner('Move Limit Reached', startGame);
    inputLock = true;
    return;
  }

  setTimeout(() => {
    spawnTile();
    logEvent(`[INFO] Largest tile: ${largestTile}`);
    checkGameEnd();
  }, tileAnimationSpeed);

  if (!inEndlessMode && moveIndex >= moveLimit) {
    if (highest < 2048) {
      showEndBanner('Move Limit Reached', startGame);
      inputLock = true;
      return;
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
          if (tile.blocking) break; // Prevent blocked tiles from moving
          grid[ty * gridSize + tx] = tile;
          grid[ny * gridSize + nx] = null;
          logEvent(`[MOVE] Moved tile from (${ny}, ${nx}) to (${ty}, ${tx})`);
          tile.index = ty * gridSize + tx;
          nx = tx; ny = ty;
          moved = true;
        } else {
          if (tile.blocking || target.blocking) break;
          const result = tryMerge(tile, target);
          if (result !== null) {
            const mergeValue = typeof result === 'object' ? result.value : result;
            const isBlocking = typeof result === 'object' && result.blocking;

            // Capture tile.op before clearing for scoring logic
            const originalOp = tile.op;

            tile.value = isBlocking ? 0 : mergeValue;
            tile.op = null;

            if (isBlocking) {
              tile.blocking = true;
              tile.op = null; // Remove operator
            } else {
              delete tile.blocking;
            }

            grid[ny * gridSize + nx] = null;
            grid[ty * gridSize + tx] = tile;
            tile.index = ty * gridSize + tx;
            // Animation: set justMerged flag for merge
            tile.justMerged = true;
            // Delay removal of target tile for animation
            const targetId = target.id;
            // Hide the merged-away tile immediately
            const targetEl = tileElements.get(targetId);
            if (targetEl) {
              targetEl.style.opacity = '0';
            }
            drawTiles(); // show the overlap frame
            setTimeout(() => {
              tiles = tiles.filter(t => t.id !== targetId);
              drawTiles(); // redraw without merged tile
            }, tileAnimationSpeed); // match animation duration
            moved = true;

            // Use originalOp for scoring logic
            if (originalOp === '-' || originalOp === '/') {
              score -= mergeValue;
              if (score < 0) score = 0;
            } else {
              score += mergeValue;
            }

            if (mergeValue > largestTile) largestTile = mergeValue;
            logEvent(`[MERGE] Merged tiles to ${mergeValue}${isBlocking ? ' (blocking)' : ''} at index ${ty * gridSize + tx}`);

            // Bonus points system
            if (!isBlocking && mergeValue >= 64) {
              bonusPoints++;
              _updateBonusPoints(bonusPoints);
              showBonusPointsChange(+1);
            }
          }
          break;
        }
      }
    }
  }

  tryConsumeBonusForUnblock();
  return moved;
}


function drawTiles() {
  const gridEl = document.getElementById('grid');
  // gridEl.innerHTML = '';
  const tileSize = 80;
  const gap = 8;

  // Render background grid tiles
  // These are static and can be cleared/re-added, but leave main grid contents persistent
  // Remove previous backgrounds
  Array.from(gridEl.querySelectorAll('.background-tile')).forEach(el => el.remove());
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

  // Track which tiles are present after this draw
  const existingTiles = new Set();

  for (let tile of tiles) {
    existingTiles.add(tile.id);
    let div = tileElements.get(tile.id);
    const tileIndex = grid.findIndex(t => t === tile);
    const x = tileIndex % gridSize;
    const y = Math.floor(tileIndex / gridSize);
    let isNew = false;
    // If DOM element doesn't exist, create and add to grid
    if (!div) {
      div = document.createElement('div');
      tileElements.set(tile.id, div);
      const transform = `translate(${x * (tileSize + gap)}px, ${y * (tileSize + gap)}px)`;
      // Set transform and transition BEFORE any class/appends
      div.style.transform = transform;
      div.style.transition = 'none';
      div.classList.value = 'tile';
      gridEl.appendChild(div);
      isNew = true;
    } else {
      // For existing tile, update transform and transition BEFORE class changes
      const transform = `translate(${x * (tileSize + gap)}px, ${y * (tileSize + gap)}px)`;
      div.style.transform = transform;
      div.style.transition = `transform ${tileAnimationSpeed}ms ease-out`;
    }
    // Remove all classes except 'tile'
    div.className = 'tile';
    div.innerHTML = '';
    div.style.position = 'absolute';
    div.style.width = `${tileSize}px`;
    div.style.height = `${tileSize}px`;
    div.style.lineHeight = `${tileSize}px`;
    div.style.textAlign = 'center';
    div.style.fontSize = '24px';
    // Set z-index for stacking order
    div.style.zIndex = 10 + tile.value;
    if (tile.blocking) {
      div.classList.add('blocking');
      div.innerText = '❌';
      tile.op = null;
      continue; // Skip normal tile rendering
    }
    const tileClass = 'tile-' + tile.value;
    div.classList.add(tileClass);
    // --- Begin: wrap tile contents in .tile-inner and apply tile-spawn there ---
    const inner = document.createElement('div');
    inner.classList.add('tile-inner');
    if (tile.justSpawned) {
      inner.classList.add('tile-spawn');
      tile.justSpawned = false;
    }
    if (tile.justMerged) {
      inner.classList.add('tile-merge');
      tile.justMerged = false;
    }
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
      inner.appendChild(number);

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
      inner.appendChild(badge);
      // Tooltip hover logic removed for now
    } else {
      inner.innerText = tile.value;
    }
    div.appendChild(inner);
    // --- End: .tile-inner wrapping and animation ---
    // No need for separate transition handling for isNew; handled above
  }

  // Remove orphaned DOM elements
  for (const [id, el] of tileElements.entries()) {
    if (!existingTiles.has(id)) {
      el.classList.add('tile-remove'); // Add fade-out CSS class (to be defined in CSS)
      setTimeout(() => {
        el.remove();
        tileElements.delete(id);
      }, 200); // Wait for animation to finish
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
  if (moveEl) moveEl.innerText = `Moves Left: ${moveLimit - moveIndex}`;

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
  // Endless mode: Only lose if grid is full and no valid moves remain. No win triggers.
  if (inEndlessMode) {
    const emptyExists = grid.some(t => t == null);
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
          // Skip blocking tiles for merge checks
          if (tile.blocking || neighbor.blocking) continue;
          if (tile.value === neighbor.value) return;
          if (tile.op || neighbor.op) {
            if (tryMerge(tile, neighbor) !== null) return;
          }
        }
      }
    }
    // No empty spaces and no valid moves: lose in endless mode
    showEndBanner('Game Over', startGame);
    inputLock = true;
    return;
  }
  // Normal mode: win and lose conditions
  const winMin = 2048;
  const hasWinningTile = tiles.some(t => t.value === winMin);
  if (hasWinningTile) {
    showEndBanner('You Win!', startGame);
    inputLock = true;
    return;
  }
  const emptyExists = grid.some(t => t == null);
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
        // Skip blocking tiles for merge checks
        if (tile.blocking || neighbor.blocking) continue;
        if (tile.value === neighbor.value) return;
        if (tile.op || neighbor.op) {
          if (tryMerge(tile, neighbor) !== null) return;
        }
      }
    }
  }
  showEndBanner('Game Over', startGame);
  inputLock = true;
}

export function launchGame({ endlessMode = false, moveLimitEnabled = true, moveLimit: customMoveLimit = 180 } = {}) {
  inEndlessMode = endlessMode;
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  startGame({ moveLimitEnabled, moveLimit: customMoveLimit });
}

export function setInputLock(state) {
  inputLock = state;
}
// === Bonus: Try to consume bonus points to remove blocking tiles ===
function tryConsumeBonusForUnblock() {
  if (bonusPoints >= 2) {
    const blockingTileIndex = tiles.findIndex(t => t.blocking);
    if (blockingTileIndex === -1) return;

    const blockingTile = tiles[blockingTileIndex];
    grid[blockingTile.index] = null;
    tiles.splice(blockingTileIndex, 1);
    bonusPoints -= 2;
    _updateBonusPoints(bonusPoints);
    showBonusPointsChange(-2);
    // Animation for removing the blocking tile
    const div = tileElements.get(blockingTile.id);
    if (div) {
      div.classList.add('blocker-removal');
      setTimeout(() => {
        div.remove();
        tileElements.delete(blockingTile.id);
        drawTiles(); // Redraw after animation completes
      }, 300);
    } else {
      drawTiles(); // fallback if div is not found
    }
    logEvent(`[BONUS] Removed blocking tile at index ${blockingTile.index}`);
  }
}