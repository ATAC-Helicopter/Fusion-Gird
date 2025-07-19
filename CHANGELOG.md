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


## [1.2.1] - 2025-07-15

### Fixed
- Fixed "New Game" button unresponsiveness after winning to ensure it restarts the game correctly.  
- Resolved Endless Mode issue where the win condition triggered on every move; now win triggers are disabled during Endless Mode.  
- Ensured Endless Mode lose condition only triggers when no moves remain and the grid is full, preventing premature game overs.

## [1.2.2] - 2025-07-15

### Added
- First-time overlay that introduces new players to the controls (arrow keys) and game objective. The overlay appears once and is dismissed on click.

### Changed
- Tooltip ("Game Key") now includes a new first entry explaining how to move tiles with arrow keys and clarifying that WASD is not supported.

## [1.3.0] - 2025-07-15

### Added

- Blocking tiles that block movement until removed by spending bonus points.  
- Bonus points system earned by merging tiles with value ≥ 128, spendable to remove blocking tiles.  
- Info panel (“game key”) with comprehensive rules, controls, and gameplay explanations.  
- Responsive grid layout using CSS Grid for better tile alignment and centering on all screen sizes.  
- Tooltip system enhancements providing detailed merge previews on operator tiles.  
- Full pause menu system rewrite with robust input locking and improved button functionality.  

### Changed

- Win condition fixed to reaching exactly tile 2048 (previously a range).  
- Warning and penalty system enhanced with a grace period of 3 warnings for weak merges before penalties apply.  
- Endless Mode disables warnings, penalties, and blocking tiles for unrestricted play.  
- UI/UX improvements for layout consistency, theme support, and visual feedback.  

### Fixed

- Pause menu button responsiveness and event binding issues.  
- New Game button functionality after winning.  
- Endless Mode win/lose condition bugs preventing premature triggers.  
- Operator tile styling and tooltip layering issues.

## [1.4.0] - 2025-07-17

### Added

- Operator tiles now spawn with a 15% chance and apply arithmetic logic to merges.  
- Bonus points earned by merging tiles ≥ 64; 2 bonus points remove one blocking tile.  
- Blocking tile removal now features a visual fade-out animation.  
- Redesigned difficulty system with Easy, Medium, Hard, and Very Hard modes, each with distinct move limits.  
- Modernized difficulty selector using a slider UI with dynamic label updates.  
- Fully animated bonus counter that only updates visually when values change.  
- Complete removal of warning, penalty, and minimum tile systems for streamlined gameplay.  
- Updated info panel content with modern design, accurate game rules, and theme responsiveness.  
- Smooth tile movement animations for all moves and merges using persistent tile elements.  
- Pop-in and glow effect animations when tiles spawn or merge to enhance visual feedback.  

### Changed

- Merged tile and bonus logic optimized and centralized for consistency.  
- Operator spawn and bonus merge behavior now correctly preserved through all move logic.  
- UI updated to remove obsolete settings and repurpose layout to accommodate new difficulty system.  
- Dark and light themes now properly reflect across all info and overlay panels.  
- Tooltip and game key systems improved with visual and functional polish.  
- Removed all duplicate definitions of `updateBonusPoints` and unified calls to the animated UI version.  
- Bonus point award logic moved out of operator tile scope for clarity and consistency.  
- Tile creation logic refactored to avoid redraw artifacts by keeping DOM elements persistent.  

### Fixed

- Blocking tile spawn location and visual behavior bugs.  
- Bonus point counter no longer flashes incorrectly or animates on no change.  
- Difficulty selector now properly reflects game logic settings.  
- Operator tiles now render reliably in both light and dark mode.  
- Info panel now respects the current theme and loads correct rule content dynamically.

- Resolved overlapping tile artifacts caused by incorrect tile redraw logic.  
- Prevented tiles from auto-moving from the top-left corner on spawn; they now appear directly in place.  
- Prevented unintended duplicate tile spawns by improving spawn timing and placement logic.  
- Fixed rare animation stutter when multiple merges occurred in sequence.  
- Resolved score miscalculations caused by early operator clearing during merges.  
- Eliminated input lag caused by animation lock and early bonus UI updates.  
- Removed redundant `inputLock` declaration that caused TypeScript block scope errors.

## [1.4.1] - 2025-07-19

### Fixed

- Prevented tiles from merging more than once per move, ensuring consistency with classic 2048 rules.
- Fixed division logic to disallow divide-by-zero and divide-by-one operations.
- Resolved inconsistencies where operator merges created unexpected results due to unrestricted operands.
- Corrected merge behavior to clamp operator results within the valid power-of-two range only.
- First-time overlay is now properly centered on all screen sizes.
- Updated tutorial message and help/info panel to reflect correct rules for operator tiles and blocking behavior.
- Improved info box and tooltip clarity for all operator and special tile explanations.
