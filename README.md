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

## 🧮 Game Rules

### 🔢 Operator Merging
- An operator tile (`+`, `−`, `×`, `÷`) merges with one adjacent tile in the direction of movement to form a result
- The result is calculated using:
  - `+` → A + B
  - `−` → |A − B|
  - `×` → A × B
  - `÷` → A ÷ B (only if divisible evenly either way)
- Only one merge per tile per move
- Result is clamped to the range 

### 🧮 Tile Spawning
- New tiles spawn with values `2` (90%) or `4` (10%) in random empty cells

### 🎮 Movement & Board
- 4×4 grid with classic swipe mechanics
- Tiles move as far as possible in the selected direction
- No diagonal movement or chain reactions

### 📈 Scoring
- Score increases by the value of the merged result
- Subtraction and division **decrease score** by the result instead
- Score cannot fall below 0
- High score is saved to local storage

### 🟡 Warnings & Penalties
- Weak merges using `−` or `÷` that produce results below a dynamic threshold trigger a warning
- You have 3 warnings total
- After warnings are used, further weak merges deduct 10 moves from the move limit
- Repeating violations causes **elimination**

### 🎯 Move Limit & Progression
- You have **180 total moves** (only consumed when tiles successfully move or merge)
- The minimum required tile value increases every 10 moves
- If you fail to promote any tile to meet the threshold in time, the game ends

### 🏁 Win Condition
- Win by creating a tile with value **2048** or higher
- After winning, you can opt into **Endless Mode**

### 🧠 AI Modes (Planned)
Autoplay is under development. Planned modes include:
- Random: selects a move at random
- Smart: evaluates the best scoring option
- Pattern: follows fixed directional logic

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