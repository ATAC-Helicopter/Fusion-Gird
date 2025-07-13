export function setupDevModeUI(showEndBanner) {
  if (typeof showEndBanner !== 'function') {
    console.warn('Warning: showEndBanner function is not provided to setupDevModeUI.');
  }

  // Create and append dev mode toggle
  const devToggle = document.createElement('input');
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

  // Create or get debug panel wrapper
  let debugWrapper = document.getElementById('debug-panel');
  if (!debugWrapper) {
    debugWrapper = document.createElement('div');
    debugWrapper.id = 'debug-panel';
    document.body.appendChild(debugWrapper);
  }
  debugWrapper.style.display = 'none';

  // Create log panel and toggle
  const logPanel = document.createElement('div');
  logPanel.id = 'debug-log';
  logPanel.style.display = 'none';

  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.id = 'log-toggle';
  toggle.onchange = () => {
    logPanel.style.display = toggle.checked ? 'block' : 'none';
  };

  const toggleLabel = document.createElement('label');
  toggleLabel.innerText = ' Show Debug Log';
  toggleLabel.prepend(toggle);

  // Copy log button
  const copyBtn = document.createElement('button');
  copyBtn.innerText = 'Copy Log';
  copyBtn.onclick = () => {
    const logs = Array.from(logPanel.querySelectorAll('div')).map(d => d.innerText).join('\n');
    navigator.clipboard.writeText(logs);
  };

  // Clear log button
  const clearBtn = document.createElement('button');
  clearBtn.innerText = 'Clear Log';
  clearBtn.onclick = () => {
    logPanel.innerHTML = '';
  };

  debugWrapper.appendChild(toggleLabel);
  debugWrapper.appendChild(copyBtn);
  debugWrapper.appendChild(clearBtn);
  debugWrapper.appendChild(logPanel);

  // Simulate Win button
  const testWinBtn = document.createElement('button');
  testWinBtn.innerText = 'Simulate Win';
  testWinBtn.onclick = () => showEndBanner && showEndBanner('You Win!');
  testWinBtn.style.marginTop = '12px';
  testWinBtn.style.padding = '6px 12px';
  testWinBtn.style.fontSize = '14px';

  // Simulate Lose button
  const testLoseBtn = document.createElement('button');
  testLoseBtn.innerText = 'Simulate Lose';
  testLoseBtn.onclick = () => showEndBanner && showEndBanner('Game Over');
  testLoseBtn.style.marginTop = '8px';
  testLoseBtn.style.padding = '6px 12px';
  testLoseBtn.style.fontSize = '14px';

  debugWrapper.appendChild(testWinBtn);
  debugWrapper.appendChild(testLoseBtn);

  debugWrapper.style.position = 'absolute';
  debugWrapper.style.left = '24px';
  debugWrapper.style.top = '60px';
  debugWrapper.style.maxWidth = '260px';
  debugWrapper.style.zIndex = '100';

  // Tooltip area
  const tooltipArea = document.createElement('div');
  tooltipArea.id = 'tooltip-area';
  tooltipArea.style.position = 'fixed';
  tooltipArea.style.top = 'calc(50% - 180px)';
  tooltipArea.style.right = 'max(24px, calc(50% - 280px))';
  tooltipArea.style.maxWidth = '300px';
  tooltipArea.style.display = 'none';
  document.body.appendChild(tooltipArea);

  // Removed game-specific UI code for grid and score elements
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