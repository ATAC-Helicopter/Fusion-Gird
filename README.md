# 🎮 Fusion Grid

A modern twist on 2048 — featuring arithmetic operations, warnings, move limits, operator tiles, and more.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🔗 Live Demo

Play it here: [Fusion Grid on GitHub Pages](https://atac-helicopter.github.io/Fusion-Gird/)

## 🧠 Game Concept

Fusion Grid reimagines 2048 by combining classic sliding mechanics with dynamic operator tiles. Each operator tile (+, −, ×, ÷) merges with a neighbor to create a new result tile. The game adds complexity through move limits, thresholds, warnings, and a planned AI system.

## 🎮 How to Play

- Slide tiles using arrow keys (← ↑ → ↓)
- Merge tiles using visible operators
- Reach 2048 to win — or continue in Endless Mode


## Game Rules (Updated)

### Operator Merging
- Operator tiles (`+`, `−`, `×`, `÷`) merge with one adjacent tile in the direction of movement to create a new result tile.
- Results are calculated as:
  - `+`: addition
  - `−`: absolute difference
  - `×`: multiplication
  - `÷`: division (only if evenly divisible)
- Only one merge per tile per move.
- Weak merges below a dynamic threshold trigger warnings or penalties.

### Tile Spawning
- New tiles spawn as either 2 (90%) or 4 (10%) in random empty cells.

### Movement & Board
- Classic 4×4 grid.
- Tiles move fully in the chosen direction; no diagonal moves or chain reactions.

### Move Limit and Progression
- Players have 180 moves by default (disabled in Endless Mode).
- The minimum tile value required increases every 10 moves (starting at 8).
- Failure to reach this threshold within a grace period results in elimination.

### Warnings and Penalties
- Weak merges below the threshold issue warnings (up to 3 allowed).
- After warnings are used, further weak merges reduce the move limit by 10 moves.
- Repeated offenses cause elimination (game over).
- Warnings and penalties are disabled in Endless Mode.

### Win Condition
- The player wins by creating a tile with a value between 2048 and 2500 inclusive.
- After winning, Endless Mode can be enabled.

### Endless Mode
- Disables move limits, warnings, and penalties.
- Can be started from the main menu or after winning.

## ✨ Features

- ✅ Operator-based merging (+ − × ÷)
- ✅ Tile tooltips with merge previews
- ✅ Move counter and high score display
- ✅ Warning system with penalties
- ✅ Dynamic tile threshold progression
- ✅ Win condition and Endless Mode support
- ✅ Developer tools preconfigured
- 🧠 AI autoplay system (coming soon)
- 🧪 Base-switching system (planned)
- 🛠 Dev tools enabled for testing and debugging

## 📍 Roadmap

See [roadmap.md](roadmap.md)

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file.