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
- A merge only succeeds if the result is a **power of 2** (2, 4, 8, 16, ... up to 4096).
- Invalid results (e.g., 3 + 5 = 8 ✅, but 3 + 4 = 7 ❌) create a **blocking tile** (❌) which cannot move or merge.
- Division only works if both numbers are greater than 1 and the result divides evenly (no division by 0 or 1 allowed).

### Tile Spawning
- New tiles spawn as 2 (90%) or 4 (10%) in random empty cells.
- Some tiles may randomly receive operators based on chance and game state.

### Movement & Grid
- Classic 4×4 grid.
- Slide tiles using arrow keys (← ↑ → ↓).
- Tiles slide and merge only once per move, in the direction pressed.
- Movement is blocked by blocking tiles.

### Move Limit & Difficulty
- Players start with a move limit that varies by selected difficulty:
  - Easy: 999 moves
  - Medium: 300 moves
  - Hard: 150 moves
  - Very Hard: 75 moves
- Endless Mode disables the move limit.

### Bonus Points & Blocking Tiles
- Merges with values ≥64 award bonus points.
- Spend 2 bonus points to remove a blocking tile (❌).
- Blocking tiles are created from invalid merges and cannot be moved or merged.
- If a tile is trapped between blockers, it must be freed by the player.

### Win Condition
- Reach the 2048 tile to win.
- Endless Mode unlocks after winning to allow continued play.

### Endless Mode
- Disables the move limit.
- Allows infinite progression and high score chasing.

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