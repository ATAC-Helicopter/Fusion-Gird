import { setupDevModeUI, logEvent } from './devMode.js';
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


const operations = ['+', '-', '*', '/'];

let inEndlessMode = false;

let inputLock = false;

window.onload = () => {
  setupDevModeUI(showEndBanner);
  setupGameUI();
  startGame();
  document.addEventListener('keydown', handleInput);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const menu = document.getElementById('pause-menu');
      if (menu) {
        const isVisible = menu.style.display === 'flex';
        menu.style.display = isVisible ? 'none' : 'flex';
        inputLock = !isVisible;
      }
    }
  });
};

function setupGameUI() {
  const gridElement = document.getElementById('grid');
  // Center the grid horizontally and set its size
  const tileSize = 80;
  const gap = 8;
  gridElement.style.position = 'relative';
  gridElement.style.margin = '24px auto'; // centers horizontally
  gridElement.style.display = 'block';
  gridElement.style.width = `${(tileSize + gap) * gridSize - gap}px`;
  gridElement.style.height = `${(tileSize + gap) * gridSize - gap}px`;

  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = '<div id="score-label">Score: 0</div><div id="highscore-label">High Score: ' + highScore + '</div>';
    scoreEl.style.display = 'flex';
    scoreEl.style.justifyContent = 'space-between';
    scoreEl.style.width = '280px';
    scoreEl.style.margin = '0 auto';
    scoreEl.style.fontSize = '18px';
  }

  // Goal tracker UI
  const tracker = document.getElementById('goal-tracker');
  if (tracker) {
    tracker.style.display = ''; // Let the inner HTML handle layout
    tracker.style.justifyContent = '';
    tracker.style.width = '280px';
    tracker.style.margin = '8px auto';
    tracker.style.fontSize = '14px';
    tracker.innerHTML = `
      <div style="display: flex; justify-content: space-between;">
        <div id="move-counter">Moves: 0 / ${moveLimit}</div>
        <div id="tile-threshold">Min Tile: ${minTileThreshold}</div>
      </div>
      <div style="margin-top: 4px; text-align: center;" id="warnings-left">Warnings Left: ${weakMergeWarningsRemaining}</div>
    `;
  }
}

function startGame() {
  inEndlessMode = false;
  inputLock = false;
  moveLimit = 180;
  // Remove endless mode indicator if present
  const indicator = document.getElementById('endless-indicator');
  if (indicator) indicator.remove();
  grid = Array(gridSize * gridSize).fill(null);
  tiles = [];
  score = 0;
  largestTile = 0;
  moveIndex = 0;
  thresholdCheckEnabled = false;
  weakMergeWarningsRemaining = 3;
  // Update score display with high score
  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = '<div id="score-label">Score: 0</div><div id="highscore-label">High Score: ' + highScore + '</div>';
  }
  document.getElementById('win-lose-banner')?.remove();
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
        showEndBanner('Move Limit Reached');
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
            showEndBanner(`Eliminated — Tile ${tile.value} did not reach ${tile.mustReachValue} in time`);
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
            !inEndlessMode &&
            mergedBySubOrDiv &&
            (typeof result !== 'number' || result < currentMinThreshold)
          ) {
            // Only allow warning if not in grace window (4 moves since last warning)
            if (weakMergeWarningsRemaining > 0 && (moveIndex - lastWeakMergeTime > 3)) {
              const shown = typeof result === 'number' ? result : 'invalid';
              weakMergeWarningsRemaining--;
              lastWeakMergeTime = moveIndex;
              // Show a custom warning banner instead of alert
              const warningBanner = document.createElement('div');
              warningBanner.innerText = `⚠️ Weak result (${shown} < ${currentMinThreshold}). ${weakMergeWarningsRemaining} warning${weakMergeWarningsRemaining !== 1 ? 's' : ''} left.`;
              warningBanner.style.position = 'fixed';
              warningBanner.style.top = '20px';
              warningBanner.style.left = '50%';
              warningBanner.style.transform = 'translateX(-50%)';
              warningBanner.style.background = 'rgba(255, 200, 0, 0.9)';
              warningBanner.style.color = '#000';
              warningBanner.style.padding = '12px 24px';
              warningBanner.style.fontSize = '16px';
              warningBanner.style.borderRadius = '8px';
              warningBanner.style.zIndex = '1001';
              warningBanner.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
              document.body.appendChild(warningBanner);
              setTimeout(() => warningBanner.remove(), 2500);
            } else if (weakMergeWarningsRemaining <= 0 || (moveIndex - lastWeakMergeTime <= 3)) {
              if (!tile.penalized) {
                moveLimit -= 10;
                tile.penalized = true;
                const penaltyBanner = document.createElement('div');
                penaltyBanner.innerText = `❗ No warnings left — 10 moves lost`;
                penaltyBanner.style.position = 'fixed';
                penaltyBanner.style.top = '20px';
                penaltyBanner.style.left = '50%';
                penaltyBanner.style.transform = 'translateX(-50%)';
                penaltyBanner.style.background = 'rgba(255, 80, 80, 0.9)';
                penaltyBanner.style.color = '#fff';
                penaltyBanner.style.padding = '12px 24px';
                penaltyBanner.style.fontSize = '16px';
                penaltyBanner.style.borderRadius = '8px';
                penaltyBanner.style.zIndex = '1001';
                penaltyBanner.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                document.body.appendChild(penaltyBanner);
                setTimeout(() => penaltyBanner.remove(), 2500);
              } else {
                const shown = typeof result === 'number' ? result : 'invalid';
                showEndBanner(`Eliminated — Resulting tile too weak (${shown} < min)`);
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
      badge.style.textShadow = '0 0 2px black';
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

        // Removed old positioning styles:
        // tooltip.style.position = 'fixed';
        // tooltip.style.top = `${gridRect.top}px`;
        // tooltip.style.left = `${gridRect.right + 16}px`;
        // tooltip.style.transform = 'none';

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
        if (tooltip) {
          tooltipArea.appendChild(tooltip);
          tooltip.style.display = 'block';
          tooltipArea.style.display = 'block';
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
  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = '<div id="score-label">Score: ' + score + '</div><div id="highscore-label">High Score: ' + highScore + '</div>';
  }
  // Update goal tracker values
  const moveEl = document.getElementById('move-counter');
  const tileThresholdEl = document.getElementById('tile-threshold');
  const thresholdInterval = 10;
  const currentThreshold = minTileThreshold + Math.floor(moveIndex / thresholdInterval) * 8;
  if (moveEl) moveEl.innerText = `Moves: ${moveIndex} / ${moveLimit}`;
  if (tileThresholdEl) tileThresholdEl.innerText = `Min Tile: ${currentThreshold}`;

  // Update warnings left
  const warningsEl = document.getElementById('warnings-left');
  if (warningsEl) warningsEl.innerText = `Warnings Left: ${weakMergeWarningsRemaining}`;

  // Force hide tooltip after every move
  const tooltipArea = document.getElementById('tooltip-area');
  tooltipArea.innerHTML = '';
  tooltipArea.style.display = 'none';
}



function checkGameEnd() {
  if (inEndlessMode) return;
  const has2048 = tiles.some(t => t.value === 2048);
  if (has2048) {
    showEndBanner('You Win!');
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
  inputLock = true;
}

export function showEndBanner(message) {
  inputLock = true;
  // Remove any existing banner before adding a new one
  document.getElementById('win-lose-banner')?.remove();

  const banner = document.createElement('div');
  banner.id = 'win-lose-banner';
  banner.innerText = message;
  banner.style.position = 'fixed';
  banner.style.top = '50%';
  banner.style.left = '50%';
  banner.style.transform = 'translate(-50%, -50%)';
  banner.style.background = 'rgba(0, 0, 0, 0.8)';
  banner.style.color = 'white';
  banner.style.padding = '24px 48px';
  banner.style.fontSize = '32px';
  banner.style.fontWeight = 'bold';
  banner.style.borderRadius = '12px';
  banner.style.zIndex = '999';

  if (message === 'You Win!') {
    const newGameBtn = document.createElement('button');
    newGameBtn.innerText = 'New Game';
    newGameBtn.onclick = () => {
      document.getElementById('win-lose-banner')?.remove();
      startGame();
    };
    newGameBtn.style.marginTop = '16px';
    newGameBtn.style.marginRight = '8px';
    newGameBtn.style.padding = '8px 16px';
    newGameBtn.style.fontSize = '16px';

    const endlessBtn = document.createElement('button');
    endlessBtn.innerText = 'Endless Mode';
    endlessBtn.onclick = () => {
      document.getElementById('win-lose-banner')?.remove();
      inputLock = false;
      inEndlessMode = true;

      let indicator = document.getElementById('endless-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'endless-indicator';
        indicator.innerText = 'ENDLESS MODE';
        indicator.style.position = 'fixed';
        indicator.style.top = '12px';
        indicator.style.right = '20px';
        indicator.style.backgroundColor = '#111';
        indicator.style.color = '#0f0';
        indicator.style.padding = '6px 12px';
        indicator.style.fontSize = '14px';
        indicator.style.fontWeight = 'bold';
        indicator.style.border = '1px solid #0f0';
        indicator.style.borderRadius = '6px';
        indicator.style.zIndex = '1000';
        document.body.appendChild(indicator);
      }
    };
    endlessBtn.style.marginTop = '16px';
    endlessBtn.style.padding = '8px 16px';
    endlessBtn.style.fontSize = '16px';

    banner.appendChild(document.createElement('br'));
    banner.appendChild(newGameBtn);
    banner.appendChild(endlessBtn);
  } else {
    // For all other cases, always show a 'New Game' button
    const retryBtn = document.createElement('button');
    retryBtn.innerText = 'New Game';
    retryBtn.onclick = () => {
      document.getElementById('win-lose-banner')?.remove();
      startGame();
    };
    retryBtn.style.marginTop = '16px';
    retryBtn.style.padding = '8px 16px';
    retryBtn.style.fontSize = '16px';
    banner.appendChild(document.createElement('br'));
    banner.appendChild(retryBtn);
  }

  document.body.appendChild(banner);
}