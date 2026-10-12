# Titan 12x12: Full Logical Grid + Variety

**Date:** 2026-10-12
**Branch:** titan-12x12
**Parent:** a52fc802 (titan visual 12x12)

## Steve's directive
- "Obvious they need to use all the cells." — Logical 12x12, not just visual.
- "Make sure these fights have a variety and are a bunch of fun."

## What was built

### 1. Logical 12x12 refactor
- `tbfight.gridSize`: 12 for titans, 9 for normal fights. Set in `startCombat` via `Game.isTitan(mid)`.
- `Game.tbGridSize()` / `Game.tbGridMax()`: helpers returning 12/11 (titan) or 9/8 (normal).
- `findPath`: uses fight grid size in combat, 9x9 on world map.
- 17 combat bounds updated: monster movement, terraforming, telegraph targeting, AI pathing.
- `titanInjectAllies`: spreads 10+ allies across full 12x12 (was clamped to 9x9).

### 2. Variety (distinct mechanics, not just stats)
- **Herald** (10 allies): Omen tutorial. Three telegraphed moves (line/burst/bloodied). Theme: ARRIVAL. Teaches positioning on 12x12.
- **Nielsen** (12 allies): Ratings game (0-100). Fight boring to win. The "bore it to death" counter is real mechanics, not sim-ignored.
- **Finale** (15 allies): Countdown apocalypse. 3-round title card, unavoidable [150,200]. Multi-stage escalation.

All three have different: ally counts (10/12/15), HP pools, move kits, themes, and win conditions.

### 3. Fun
- 12x12 gives room for flanking, retreating, spreading out — tactics matter with 10+ fighters.
- Ant-vs-titan visual (CSS): fighters 28px, titan 72px, player spotlight.
- Herald's ARRIVAL: "It is not attacking. It is ARRIVING." — the tutorial feels epic, not easy.

## Proof
- `scripts/test-titan-12x12.js`: 7/7 — gridSize 12/9, fighters at 10,10 and 11,11, findPath works.
- `scripts/test-titan-variety.js`: 12/12 — distinct kits, themes, ally counts.
- Regressions: titan-class 32/32, herald-titan 22/22, wave35-mechanics 40/40, sigW5 144/144, multi-move 139/139, multi-move-w35 216/216.

## Files
- `src/js/game.js`: gridSize in tbfight, tbGridSize/tbGridMax helpers, 17 bounds, findPath.
- `src/js/titans.js`: titanInjectAllies 12x12 spread.
- `scripts/test-titan-12x12.js`, `scripts/test-titan-variety.js`: new proof tests.
