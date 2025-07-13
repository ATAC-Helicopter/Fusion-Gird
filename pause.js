


let isPaused = false;

function togglePauseMenu() {
  const menu = document.getElementById('pause-menu');
  if (!menu) return;

  isPaused = !isPaused;
  menu.style.display = isPaused ? 'flex' : 'none';
  inputLock = isPaused;
}

// Bind keyboard input
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    togglePauseMenu();
  }
});

// Wire pause menu buttons
window.addEventListener('DOMContentLoaded', () => {
  const btnContinue = document.getElementById('btn-continue');
  const btnNewGame = document.getElementById('btn-newgame');
  const btnQuit = document.getElementById('btn-quit');

  if (btnContinue) {
    btnContinue.onclick = () => togglePauseMenu();
  }

  if (btnNewGame) {
    btnNewGame.onclick = () => {
      togglePauseMenu();
      startGame();
    };
  }

  if (btnQuit) {
    btnQuit.onclick = () => {
      location.reload(); // or redirect to main menu if implemented
    };
  }
});