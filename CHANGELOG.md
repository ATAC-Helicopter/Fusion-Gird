

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.1.0] - 2025-07-14

> ⚠️ Note: This release includes extensive feature additions and refactoring. While functionality has been manually validated, full regression testing is pending. Bugs may still be present.
>

> This release includes a full UI revamp across all screens. Elements such as the main menu, game board, warnings, score tracker, and theme system have been redesigned for clarity, responsiveness, and visual polish. All UI logic has been modularized for better maintainability.

### Added
- Introduced a fully redesigned main menu with dedicated buttons for Play, Settings, and Endless Mode.
- Added a theme selector with Light, Dark, and System options.
- Implemented a settings screen with live theme switching support.
- Integrated Endless Mode that disables warnings and penalties.
- Developed a new warning system featuring a visual counter and persistent message stack.
- Added a tracker panel to display Moves Left and Minimum Tile thresholds with improved clarity.
- Reworked the tooltip system with proper stacking and layering behavior.
- Designed color-coded glow effects for operator tiles, matched to their respective operator types.
- Synchronized tile border colors with their operator glow color for consistent styling.
- Refactored all UI logic into a separate `ui.js` module for improved code maintainability.
- Enhanced overall visual presentation, including layout, theme support, and feedback mechanisms.

### Changed
- Centralized and cleaned UI logic by moving all related functions from `game.js` to `ui.js`.
- Streamlined score and layout presentation, including spacing and visibility of UI elements.
- Improved z-index layering and interaction of tooltips relative to warnings.
- Tuned tile contrast across both light and dark themes.
- Standardized display and behavior of warnings using styled card elements.

### Fixed
- Resolved tooltip rendering issues where they were obscured by other elements.
- Corrected OP tile visuals in light mode, restoring intended glow and styling.
- Fixed initialization and update logic for move and warning counters.
- Addressed UI spacing issues under the title bar.


### Removed
- Developer mode toggle from the settings screen (now always accessible in-game).


## [1.2.0] - 2025-07-15

### Added
- Configurable win condition allowing victory for tiles within a value range (e.g., 2048–2500).  
- New info panel (“game key”) explaining tile meanings, rules, and win/lose conditions with toggle control.  
- Theme selector integrated across all views supporting Light, Dark, and System modes.  
- Persistent, styled warning display replacing popup warnings for better clarity and UI layout.  
- Complete pause menu rewrite with robust event binding; full input locking while paused.  
- Pause menu buttons fully functional with correct behaviors: Continue resumes gameplay, New Game starts fresh immediately, Quit returns cleanly to the main menu.  
- Refactored pause and UI code for better separation of concerns and maintainability.

### Changed
- Penalty and warning system updated for proper live visual feedback and integrated pause behavior.  
- Tile styling improved for better contrast and consistent glow effects across themes.  
- UI layout refined with repositioned warning panels and enhanced spacing under the game title.  
- Removed legacy pause menu escape key handling in favor of the rewritten pause system.

### Fixed
- Pause menu continue button reliably hides pause UI and resumes gameplay.  
- Fixed light mode OP tile styling and warning counter synchronization.  
- Added debug logs for pause actions and button clicks, with event binding retry logic for stability.