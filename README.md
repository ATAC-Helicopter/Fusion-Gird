# 🎮 Fusion Grid

A modern twist on 2048 — featuring arithmetic operations, warnings, move limits, operator tiles, blocking tiles, bonus points, and more.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🔗 Live Demo

Play it here: [Fusion Grid on GitHub Pages](https://atac-helicopter.github.io/Fusion-Gird/)

## 🧠 Game Concept

Fusion Grid reimagines 2048 by combining classic sliding tile mechanics with arithmetic operators. Operator tiles (`+`, `−`, `×`, `÷`) dynamically interact with number tiles to create new merge outcomes, introducing logical challenges to each move.

The game expands traditional 2048 gameplay by introducing:
- A difficulty system with distinct move limits (Easy, Medium, Hard, Very Hard)
- Bonus points earned from strong merges (≥64)
- Blocking tiles that must be cleared using earned bonus points
- Smooth animations and visual feedback for merges, spawns, and tile removals
- Support for endless mode after reaching 2048

Fusion Grid is designed for fast-paced play, strategic tile control, and rewarding visual feedback — all while retaining the intuitive feel of classic 2048.

## 🎮 How to Play

- Slide tiles using arrow keys (← ↑ → ↓)
- Merge tiles using visible operators
- Reach 2048 to win — or continue in Endless Mode


## 📏 Game Rules

### Operator Tiles
- Operator tiles (`+`, `−`, `×`, `÷`) merge with adjacent number tiles using their respective arithmetic operation.
- Only one merge per tile per move.
- Results must remain within valid bounds (2–4096).

### Tile Spawning
- New tiles spawn as 2 (90%) or 4 (10%) in random empty cells.
- A small percentage of tiles may spawn as operator tiles.

### Movement & Grid
- Classic 4×4 grid.
- Tiles slide in the direction pressed; merges and animations resolve smoothly.
- Only one merge per tile per move.

### Move Limit & Difficulty
- Players start with a move limit that varies by selected difficulty:
  - Easy: 999 moves
  - Medium: 300 moves
  - Hard: 150 moves
  - Very Hard: 75 moves
- Endless Mode disables the move limit.

### Bonus Points & Blocking Tiles
- Merge tiles valued 64 or higher to earn bonus points.
- Spend 2 bonus points to remove one blocking tile.
- Blocking tiles cannot move or merge and must be cleared to access blocked space.
- Blocking tiles appear randomly on some merges.

### Win Condition
- Reach the 2048 tile to win.
- Endless Mode can be activated after winning to continue playing.

### Endless Mode
- Disables move limit entirely.
- Allows infinite progression for high scores.

## ✨ Features

- ✅ Operator-based merging (+ − × ÷)
- ✅ Tile tooltips with merge previews
- ✅ Move counter and high score display
- ✅ Bonus point system for large merges
- ✅ Blocking tile mechanic with visual removal effects
- ✅ Bonus points and blocking tiles system
- ✅ Win condition and Endless Mode support
- ✅ Developer tools preconfigured
- 🧠 AI autoplay system (coming soon)
- 🧪 Base-switching system (planned)
- 🛠 Dev tools enabled for testing and debugging

## 📍 Roadmap

See [roadmap.md](roadmap.md)

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file.