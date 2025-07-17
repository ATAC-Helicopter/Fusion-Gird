import { launchGame } from './game.js';

// === Element References ===
const startBtn = document.getElementById('start-btn');
const endlessBtn = document.getElementById('endless-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsBackBtn = document.getElementById('settings-back-btn');
const toggleMoveLimit = document.getElementById('toggle-move-limit');
const themeSelect = document.getElementById('theme-select');
const difficultySelect = document.getElementById('difficulty-select');

// === Button Behavior ===
startBtn.addEventListener('click', () => {
  launchGame({
    endlessMode: false,
    moveLimitEnabled: toggleMoveLimit.checked,
    moveLimit: getMoveLimitForDifficulty(getDifficultyNameFromSlider(difficultySelect.value))
  });
});

endlessBtn.addEventListener('click', () => {
  launchGame({
    endlessMode: true,
    moveLimitEnabled: toggleMoveLimit.checked,
    moveLimit: getMoveLimitForDifficulty(getDifficultyNameFromSlider(difficultySelect.value))
  });
});

settingsBtn.addEventListener('click', () => {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('settings-menu').style.display = 'flex';
});

settingsBackBtn.addEventListener('click', () => {
  document.getElementById('settings-menu').style.display = 'none';
  document.getElementById('main-menu').style.display = 'flex';
});

// === Theme Logic ===
function applyTheme(mode) {
  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    mode = prefersDark ? 'dark' : 'light';
  }
  document.body.dataset.theme = mode;
  if (mode === 'dark') {
    document.body.classList.add('theme-dark');
    document.body.classList.remove('theme-light');
  } else {
    document.body.classList.add('theme-light');
    document.body.classList.remove('theme-dark');
  }
}

// === Initialize Theme ===
const savedTheme = localStorage.getItem('fusionTheme') || 'dark';
themeSelect.value = savedTheme;
applyTheme(savedTheme);
themeSelect.addEventListener('change', () => {
  applyTheme(themeSelect.value);
  localStorage.setItem('fusionTheme', themeSelect.value);
});

document.getElementById('main-menu').style.display = 'flex';

function getMoveLimitForDifficulty(level) {
  switch (level) {
    case 'easy': return 999;
    case 'medium': return 300;
    case 'hard': return 150;
    case 'veryhard': return 75;
    default: return 300;
  }
}

// Map slider value (string/int) to difficulty name
function getDifficultyNameFromSlider(val) {
  switch (parseInt(val, 10)) {
    case 0: return 'easy';
    case 1: return 'medium';
    case 2: return 'hard';
    case 3: return 'veryhard';
    default: return 'medium';
  }
}