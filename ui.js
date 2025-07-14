


export function setupGameUI(moveLimit = 180, minTileThreshold = 8) {
  const gridElement = document.getElementById('grid');
  const tileSize = 80;
  const gap = 8;
  gridElement.style.position = 'relative';
  gridElement.style.margin = '24px auto';
  gridElement.style.display = 'block';
  gridElement.style.width = `${(tileSize + gap) * 4 - gap}px`;
  gridElement.style.height = `${(tileSize + gap) * 4 - gap}px`;

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

  const minTileEl = document.getElementById('min-tile');
  if (minTileEl) minTileEl.innerText = `Min Tile: ${minTileThreshold}`;
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

export function setupWarningCounter(remaining) {
  let warningCounter = document.getElementById('warning-counter');
  if (!warningCounter) {
    warningCounter = document.createElement('div');
    warningCounter.id = 'warning-counter';
    warningCounter.style.position = 'fixed';
    warningCounter.style.top = '12px';
    warningCounter.style.right = '12px';
    warningCounter.style.zIndex = '999';
    warningCounter.style.padding = '6px 12px';
    warningCounter.style.borderRadius = '6px';
    warningCounter.style.background = '#fff3cd';
    warningCounter.style.color = '#d32f2f';
    warningCounter.style.fontWeight = 'bold';
    warningCounter.style.boxShadow = '0 1px 6px rgba(0,0,0,0.1)';
    document.body.appendChild(warningCounter);
  }
  warningCounter.innerText = `Warnings: ${remaining}`;
}

export function setupWarningMessageArea() {
  let warningMsg = document.getElementById('warning-msg');
  if (!warningMsg) {
    warningMsg = document.createElement('div');
    warningMsg.id = 'warning-msg';
    warningMsg.style.position = 'fixed';
    warningMsg.style.top = '56px';
    warningMsg.style.right = '12px';
    warningMsg.style.zIndex = '998';
    warningMsg.style.display = 'none';
    warningMsg.style.flexDirection = 'column';
    warningMsg.style.alignItems = 'flex-end';
    warningMsg.style.maxWidth = '300px';
    document.body.appendChild(warningMsg);
  } else {
    warningMsg.innerHTML = '';
    warningMsg.style.display = 'none';
  }
}

export function showPenaltyBanner() {
  const banner = document.createElement('div');
  banner.innerText = `❗ No warnings left — 10 moves lost`;
  banner.style.position = 'fixed';
  banner.style.top = '50%';
  banner.style.left = '50%';
  banner.style.transform = 'translate(-50%, -50%)';
  banner.style.padding = '12px 24px';
  banner.style.fontSize = '20px';
  banner.style.background = '#f44336';
  banner.style.color = '#fff';
  banner.style.borderRadius = '8px';
  banner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  banner.style.zIndex = '1000';
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 2500);
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
    indicator.style.top = '12px';
    indicator.style.left = '12px';
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

  if (message === 'You Win!') {
    const newGameBtn = document.createElement('button');
    newGameBtn.innerText = 'New Game';
    newGameBtn.onclick = () => {
      document.getElementById('win-lose-banner')?.remove();
      if (typeof startGameCallback === 'function') startGameCallback();
    };
    newGameBtn.style.marginTop = '16px';
    newGameBtn.style.marginRight = '8px';
    newGameBtn.style.padding = '8px 16px';
    newGameBtn.style.fontSize = '16px';

    const endlessBtn = document.createElement('button');
    endlessBtn.innerText = 'Endless Mode';
    endlessBtn.onclick = () => {
      document.getElementById('win-lose-banner')?.remove();
      const indicator = document.getElementById('endless-indicator');
      if (!indicator) {
        const newIndicator = document.createElement('div');
        newIndicator.id = 'endless-indicator';
        newIndicator.innerText = 'ENDLESS MODE';
        newIndicator.style.position = 'fixed';
        newIndicator.style.top = '12px';
        newIndicator.style.right = '20px';
        newIndicator.style.backgroundColor = '#111';
        newIndicator.style.color = '#0f0';
        newIndicator.style.padding = '6px 12px';
        newIndicator.style.fontSize = '14px';
        newIndicator.style.fontWeight = 'bold';
        newIndicator.style.border = '1px solid #0f0';
        newIndicator.style.borderRadius = '6px';
        newIndicator.style.zIndex = '1000';
        document.body.appendChild(newIndicator);
      }
    };
    endlessBtn.style.marginTop = '16px';
    endlessBtn.style.padding = '8px 16px';
    endlessBtn.style.fontSize = '16px';

    banner.appendChild(document.createElement('br'));
    banner.appendChild(newGameBtn);
    banner.appendChild(endlessBtn);
  } else {
    const retryBtn = document.createElement('button');
    retryBtn.innerText = 'New Game';
    retryBtn.onclick = () => {
      document.getElementById('win-lose-banner')?.remove();
      if (typeof startGameCallback === 'function') startGameCallback();
    };
    retryBtn.style.marginTop = '16px';
    retryBtn.style.padding = '8px 16px';
    retryBtn.style.fontSize = '16px';
    banner.appendChild(document.createElement('br'));
    banner.appendChild(retryBtn);
  }

  document.body.appendChild(banner);
}