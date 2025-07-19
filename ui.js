import { launchGame } from './game.js';

function styleButton(btn) {
  btn.style.marginTop = '16px';
  btn.style.padding = '8px 16px';
  btn.style.fontSize = '16px';
}

export function setupGameUI(moveLimit = 180, minTileThreshold = 8) {
  const gridElement = document.getElementById('grid');
  const tileSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tile-size'));
  const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap-size'));
  gridElement.style.position = 'relative';
  gridElement.style.margin = '24px auto';
  gridElement.style.display = 'block';
  // gridElement.style.width = `${(tileSize + gap) * 4 - gap}px`;
  // gridElement.style.height = `${(tileSize + gap) * 4 - gap}px`;

  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = `
      <div id="score-label">Score: 0</div>
      <div id="highscore-label">High Score: ${
        localStorage.getItem('fusionHighScore') || 0
      }</div>
    `;
    scoreEl.style.display = 'flex';
    scoreEl.style.flexDirection = 'column';
    scoreEl.style.justifyContent = 'center';
    scoreEl.style.alignItems = 'center';
    scoreEl.style.gap = '8px';
    scoreEl.style.width = '100%';
    scoreEl.style.maxWidth = '360px';
    scoreEl.style.margin = '24px auto 4px';
    scoreEl.style.fontSize = '18px';
    scoreEl.style.textAlign = 'center';
  }

  const moveEl = document.getElementById('move-counter');
  if (moveEl) moveEl.innerText = `Moves Left: ${moveLimit}`;
}
export function updateScoreDisplay(score, highScore) {
  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    scoreEl.innerHTML = `
      <div id="score-label">Score: ${score}</div>
      <div id="highscore-label">High Score: ${highScore}</div>
    `;
  }
}


export function updateEndlessModeIndicator(enabled) {
  let indicator = document.getElementById('endless-indicator');
  if (!enabled) {
    if (indicator) indicator.remove();
    return;
  }
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'endless-indicator';
    indicator.style.position = 'fixed';
    indicator.style.bottom = '12px';
    indicator.style.left = '12px';
    indicator.style.top = '';
    indicator.style.zIndex = '999';
    indicator.style.padding = '6px 12px';
    indicator.style.borderRadius = '6px';
    indicator.style.background = '#e3f2fd';
    indicator.style.color = '#1565c0';
    indicator.style.fontWeight = 'bold';
    indicator.style.boxShadow = '0 1px 6px rgba(0,0,0,0.1)';
    document.body.appendChild(indicator);
  }
  indicator.innerText = `Endless Mode`;
}
export function ensureTooltipArea() {
  let tooltipArea = document.getElementById('tooltip-area');
  if (!tooltipArea) {
    tooltipArea = document.createElement('div');
    tooltipArea.id = 'tooltip-area';
    tooltipArea.style.position = 'absolute';
    tooltipArea.style.pointerEvents = 'none';
    tooltipArea.style.zIndex = '3002';
    tooltipArea.style.top = '0';
    tooltipArea.style.left = '0';
    tooltipArea.style.display = 'none';
    document.body.appendChild(tooltipArea);
  }
  return tooltipArea;
}
export function showEndBanner(message, startGameCallback) {
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

  banner.style.display = 'flex';
  banner.style.flexDirection = 'column';
  banner.style.alignItems = 'center';
  banner.style.justifyContent = 'center';

  if (message === 'You Win!') {
    const newGameBtn = document.createElement('button');
    newGameBtn.innerText = 'New Game';
    newGameBtn.onclick = () => {
      document.getElementById('win-lose-banner')?.remove();
      if (typeof startGameCallback === 'function') startGameCallback();
    };
    styleButton(newGameBtn);
    newGameBtn.style.marginRight = '8px';

    const endlessBtn = document.createElement('button');
    endlessBtn.innerText = 'Endless Mode';
    endlessBtn.onclick = () => {
      document.getElementById('win-lose-banner')?.remove();
      launchGame({ endlessMode: true, moveLimitEnabled: false });
    };
    styleButton(endlessBtn);

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '12px';
    btnRow.appendChild(newGameBtn);
    btnRow.appendChild(endlessBtn);
    banner.appendChild(btnRow);
  } else {
    const retryBtn = document.createElement('button');
    retryBtn.innerText = 'New Game';
    retryBtn.onclick = () => {
      document.getElementById('win-lose-banner')?.remove();
      if (typeof startGameCallback === 'function') startGameCallback();
    };
    styleButton(retryBtn);
    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '12px';
    btnRow.appendChild(retryBtn);
    banner.appendChild(btnRow);
  }

  document.body.appendChild(banner);
}
export function setupInfoBox() {
  const button = document.createElement('div');
  button.id = 'info-button';
  button.style.position = 'fixed';
  button.style.top = '50%';
  button.style.left = '12px';
  button.style.transform = 'translateY(-50%)';
  button.style.zIndex = '1001';
  button.style.cursor = 'pointer';
  button.style.padding = '10px 14px';
  button.style.border = 'none';
  button.style.borderRadius = '8px';
  button.style.background = '#555';
  button.style.color = '#fff';
  button.style.fontWeight = 'bold';
  button.style.fontSize = '20px';
  button.innerText = 'ⓘ';
  document.body.appendChild(button);

  const box = document.createElement('div');
  box.id = 'info-box';
  box.style.position = 'fixed';
  box.style.top = '50%';
  box.style.left = '60px';
  box.style.transform = 'translateY(-50%)';
  box.style.zIndex = '1000';
  // Removed hardcoded dark theme styles to allow CSS theme inheritance
  // box.style.background = '#2b2b2b';
  // box.style.border = '1px solid #555';
  box.style.borderRadius = '20px';
  box.style.padding = '28px';
  box.style.width = '420px';
  box.style.boxShadow = '0 6px 14px rgba(0,0,0,0.4)';
  box.style.display = 'none';
box.innerHTML = `
    <h3 style="margin: 0 0 12px 0; color: #fff; font-size: 20px;">📘 Fusion Grid - Game Rules</h3>
    <ul style="font-size: 16px; line-height: 1.9; padding-left: 18px; color: #ddd;">
      <li><strong style="color: #fff;">Controls:</strong> Use ← ↑ → ↓ arrow keys to slide tiles.</li>
      <li><strong style="color: #fff;">Objective:</strong> Reach the 2048 tile to win. Endless Mode unlocks after victory.</li>
      <li><strong style="color: #fff;">Normal Tiles:</strong> Merge equal tiles to double their value.</li>
      <li><strong style="color: #fff;">Operator Tiles:</strong> Tiles with +, −, ×, ÷ combine adjacent values using math. Only results that are powers of 2 are valid.</li>
      <li><strong style="color: #fff;">Blocking Tiles:</strong> Created from invalid merges. They can't be moved or merged.</li>
      <li><strong style="color: #fff;">Division:</strong> Only allowed when both values are greater than 1 and divide cleanly. No ÷0 or ÷1.</li>
      <li><strong style="color: #fff;">Move Limit:</strong> Based on difficulty. Use Endless Mode for unlimited play.</li>
      <li><strong style="color: #fff;">Bonus Points:</strong> Earned from merges ≥64. Spend 2 points to clear a blocking tile.</li>
      <li><strong style="color: #fff;">Tooltips:</strong> Hover over operator tiles to preview possible results.</li>
    </ul>
  `;

  document.body.appendChild(box);

  button.onclick = () => {
    box.classList.toggle('visible');
  };
}
export function showFirstTimeOverlay() {
  if (localStorage.getItem('fusionFirstTimePlayed')) return;

  const overlay = document.createElement('div');
  overlay.id = 'first-time-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
  overlay.style.color = '#fff';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.textAlign = 'center';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0'; // ensures full viewport fill
  overlay.style.fontSize = '20px';
  overlay.style.padding = '40px';

  overlay.innerHTML = `
    <div style="max-width: 600px; padding: 32px; background: rgba(0,0,0,0.7); border-radius: 12px;">
      <h2 style="margin-bottom: 20px;">Welcome to Fusion Grid!</h2>
      <p style="font-size: 18px;">Use the ← ↑ → ↓ arrow keys to slide tiles and combine them using math! Reach the 2048 tile to win.</p>
      <p style="margin-top: 24px; font-size: 14px; color: #ccc;">Click anywhere to begin.</p>
    </div>
  `;

  overlay.addEventListener('click', () => {
    overlay.remove();
    localStorage.setItem('fusionFirstTimePlayed', 'true');
  });

  document.body.appendChild(overlay);
}
export function setupBonusPointsCounter() {
  let bonusCounter = document.getElementById('bonus-points-counter');
  if (!bonusCounter) {
    bonusCounter = document.createElement('div');
    bonusCounter.id = 'bonus-points-counter';
    bonusCounter.style.position = 'relative';
    bonusCounter.style.margin = '12px auto 0';
    bonusCounter.style.width = 'fit-content';
    bonusCounter.style.padding = '6px 12px';
    bonusCounter.style.background = '#d0f0d0'; // light green background
    bonusCounter.style.color = '#2e7d32'; // dark green text
    bonusCounter.style.fontWeight = 'bold';
    bonusCounter.style.borderRadius = '6px';
    bonusCounter.style.boxShadow = '0 1px 6px rgba(0,0,0,0.1)';
    bonusCounter.style.textAlign = 'center';
    document.body.appendChild(bonusCounter);
  }
  bonusCounter.innerText = `Bonus Points: 0`;
}

export function updateBonusPoints(value) {
  const bonusCounter = document.getElementById('bonus-points-counter');
  if (bonusCounter) {
    bonusCounter.innerText = `Bonus Points: ${value}`;
  }
}

export function showBonusPointsChange(amount) {
  const bonusCounter = document.getElementById('bonus-points-counter');
  if (!bonusCounter) return;

  const floatingText = document.createElement('div');
  floatingText.innerText = (amount > 0 ? '+' : '') + amount;
  floatingText.style.position = 'absolute';
  floatingText.style.right = '10px';
  floatingText.style.top = '-40px';
  floatingText.style.fontWeight = 'bold';
  floatingText.style.color = amount > 0 ? '#2e7d32' : '#d32f2f';
  floatingText.style.fontSize = '22px';
  floatingText.style.textShadow = '0 0 4px rgba(0,0,0,0.7)';
  floatingText.style.pointerEvents = 'none';
  floatingText.style.opacity = '1';
  floatingText.style.transition = 'transform 1s ease-out, opacity 1s ease-out';

  bonusCounter.appendChild(floatingText);

  requestAnimationFrame(() => {
    floatingText.style.transform = 'translateY(-40px)';
    floatingText.style.opacity = '0';
  });

  floatingText.addEventListener('transitionend', () => {
    floatingText.remove();
  });
}