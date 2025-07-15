import { setInputLock, launchGame } from './game.js';
import { logEvent } from './devMode.js';

let isPaused = false;

function setPauseState(state) {
  isPaused = state;

  const menu = document.getElementById('pause-menu');
  if (menu) {
    menu.style.display = isPaused ? 'flex' : 'none';
  }

  // Re-bind pause menu buttons every time menu is shown
  if (isPaused) {
    bindPauseMenuButtons();
  }

  setInputLock(isPaused);
  document.body.classList.toggle('paused', isPaused);

  if (isPaused) {
    document.activeElement?.blur();
  }
}

function resumeGame() {
  logEvent('[DEBUG] Resuming game');
  setPauseState(false);
}

function pauseGame() {
  logEvent('[DEBUG] Pausing game');
  setPauseState(true);
}

function togglePause() {
  logEvent(`[DEBUG] Toggling pause: ${!isPaused}`);
  setPauseState(!isPaused);
}

function bindButtonOnce(id, handler) {
  const btn = document.getElementById(id);
  if (btn && !btn.dataset.bound) {
    btn.addEventListener('click', handler);
    btn.dataset.bound = 'true';
  }
}

function bindPauseMenuButtons() {
  bindButtonOnce('btn-continue', () => {
    logEvent('[DEBUG] Continue button clicked');
    resumeGame();
  });

  bindButtonOnce('btn-newgame', () => {
    logEvent('[DEBUG] New Game button clicked');
    resumeGame();
    launchGame();
  });

  bindButtonOnce('btn-quit', () => {
    logEvent('[DEBUG] Quit button clicked');
    resumeGame();
    document.getElementById('app').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
  });
}

// Keyboard shortcut
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    togglePause();
  }
});

export { isPaused, pauseGame, resumeGame, togglePause };