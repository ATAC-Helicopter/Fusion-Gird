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

function bindPauseMenuButtons() {
  const continueBtn = document.getElementById('btn-continue');
  if (continueBtn && !continueBtn.dataset.bound) {
    continueBtn.addEventListener('click', () => {
      logEvent('[DEBUG] Continue button clicked');
      resumeGame();
    });
    continueBtn.dataset.bound = 'true';
  }

  const newGameBtn = document.getElementById('btn-newgame');
  if (newGameBtn && !newGameBtn.dataset.bound) {
    newGameBtn.addEventListener('click', () => {
      logEvent('[DEBUG] New Game button clicked');
      resumeGame();
      launchGame();  // start fresh game immediately
    });
    newGameBtn.dataset.bound = 'true';
  }

  const quitBtn = document.getElementById('btn-quit');
  if (quitBtn && !quitBtn.dataset.bound) {
    quitBtn.addEventListener('click', () => {
      logEvent('[DEBUG] Quit button clicked');
      resumeGame();
      document.getElementById('app').style.display = 'none';
      document.getElementById('main-menu').style.display = 'flex';
    });
    quitBtn.dataset.bound = 'true';
  }
}

// Keyboard shortcut
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    togglePause();
  }
});

export { isPaused, pauseGame, resumeGame, togglePause };