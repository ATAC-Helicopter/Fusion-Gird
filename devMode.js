export function setupDevModeUI(showEndBanner) {
  if (typeof showEndBanner !== 'function') {
    console.warn('Warning: showEndBanner function is not provided to setupDevModeUI.');
  }

  // --- Dev Mode Toggle ---
  let devToggle = document.getElementById('dev-toggle');
  if (!devToggle) {
    devToggle = document.createElement('input');
    devToggle.type = 'checkbox';
    devToggle.id = 'dev-toggle';

    const devLabel = document.createElement('label');
    devLabel.innerText = ' Dev Mode';
    devLabel.prepend(devToggle);

    devLabel.style.position = 'absolute';
    devLabel.style.top = '12px';
    devLabel.style.left = '16px';
    devLabel.style.zIndex = '200';
    document.body.appendChild(devLabel);

    devToggle.onchange = () => {
      document.getElementById('debug-panel').style.display = devToggle.checked ? 'block' : 'none';
    };
  }

  // --- Debug Panel Setup ---
  let debugWrapper = document.getElementById('debug-panel');
  if (!debugWrapper) {
    debugWrapper = document.createElement('div');
    debugWrapper.id = 'debug-panel';
    document.body.appendChild(debugWrapper);
  }
  debugWrapper.style.display = devToggle.checked ? 'block' : 'none';

  // --- Log Panel and Controls ---
  let logPanel = document.getElementById('debug-log');
  let toggle = document.getElementById('log-toggle');
  if (!logPanel) {
    logPanel = document.createElement('div');
    logPanel.id = 'debug-log';
    logPanel.style.display = 'none';

    toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.id = 'log-toggle';
    toggle.onchange = () => {
      logPanel.style.display = toggle.checked ? 'block' : 'none';
    };

    const toggleLabel = document.createElement('label');
    toggleLabel.innerText = ' Show Debug Log';
    toggleLabel.prepend(toggle);

    const copyBtn = document.createElement('button');
    copyBtn.innerText = 'Copy Log';
    copyBtn.onclick = () => {
      const logs = Array.from(logPanel.querySelectorAll('div')).map(d => d.innerText).join('\n');
      navigator.clipboard.writeText(logs);
    };

    const clearBtn = document.createElement('button');
    clearBtn.innerText = 'Clear Log';
    clearBtn.onclick = () => {
      logPanel.innerHTML = '';
    };

    debugWrapper.appendChild(toggleLabel);
    debugWrapper.appendChild(copyBtn);
    debugWrapper.appendChild(clearBtn);
    debugWrapper.appendChild(logPanel);
  }

  // --- Button Styling Helper ---
  function styleButton(button) {
    button.style.marginTop = '8px';
    button.style.padding = '6px 12px';
    button.style.fontSize = '14px';
  }

  // --- Simulate Win Button ---
  let testWinBtn = document.getElementById('simulate-win-btn');
  if (!testWinBtn) {
    testWinBtn = document.createElement('button');
    testWinBtn.id = 'simulate-win-btn';
    testWinBtn.innerText = 'Simulate Win';
    testWinBtn.onclick = () => {
      const index = window.grid.findIndex(cell => cell === null);
      if (index === -1) return;

      const tile = { value: 2048, op: null, index };
      window.grid[index] = tile;
      window.tiles.push(tile);

      if (window.checkGameEnd) {
        window.checkGameEnd();
      } else {
        showEndBanner?.('You Win!', () => location.reload());
      }
    };
    styleButton(testWinBtn);
    debugWrapper.appendChild(testWinBtn);
  }

  // --- Simulate Lose Button ---
  let testLoseBtn = document.getElementById('simulate-lose-btn');
  if (!testLoseBtn) {
    testLoseBtn = document.createElement('button');
    testLoseBtn.id = 'simulate-lose-btn';
    testLoseBtn.innerText = 'Simulate Lose';
    testLoseBtn.onclick = () => showEndBanner?.('Game Over', () => location.reload());
    styleButton(testLoseBtn);
    debugWrapper.appendChild(testLoseBtn);
  }

  debugWrapper.style.position = 'absolute';
  debugWrapper.style.left = '24px';
  debugWrapper.style.top = '60px';
  debugWrapper.style.maxWidth = '260px';
  debugWrapper.style.zIndex = '100';

  // --- Tooltip Area Setup ---
  let tooltipArea = document.getElementById('tooltip-area');
  if (!tooltipArea) {
    tooltipArea = document.createElement('div');
    tooltipArea.id = 'tooltip-area';
    tooltipArea.style.position = 'fixed';
    tooltipArea.style.top = 'calc(50% - 180px)';
    tooltipArea.style.right = 'max(24px, calc(50% - 280px))';
    tooltipArea.style.maxWidth = '300px';
    tooltipArea.style.display = 'none';
    document.body.appendChild(tooltipArea);
  }
}

export function logEvent(msg) {
  if (!document.getElementById('log-toggle')?.checked) return;
  const logPanel = document.getElementById('debug-log');
  const line = document.createElement('div');
  line.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;

  if (msg.includes('[SPAWN]')) line.classList.add('log-spawn');
  else if (msg.includes('[MERGE]')) line.classList.add('log-merge');
  else if (msg.includes('[MOVE]')) line.classList.add('log-move');
  else if (msg.includes('[OPERATOR]')) line.classList.add('log-operator');

  logPanel.appendChild(line);
  logPanel.scrollTop = logPanel.scrollHeight;
}