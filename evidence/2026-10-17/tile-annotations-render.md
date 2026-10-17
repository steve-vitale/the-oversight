# Tile-annotation render fix — garden plots, traps, bridges (2026-10-17)

Trigger: Steve's phone report — "Making a garden plot doesn't impact the
area it's utilized in. Probably no permanence. I don't see follow up
actions. Look for siblings."

Root cause (audit: evidence/2026-10-17/garden-siblings-audit.md):
RENDERING-BLINDNESS, not lost writes. `t.plots`, `t.traps`, `t.bridged`
all persist correctly (verified across save/load), but the grid renderer
had zero branches for tile annotations — spending kcal/ticks changed
nothing on screen. Cell-type changes (clearBrush, cutTree, etc.) all work
and were NOT in scope.

## What changed

**game.js** (new methods, all pure/testable):
- `trapMarkerAt(cx, cy)` — corner-badge 🪤 overlay HTML for the player's
  own traps on the current tile. Diegetic, ungated (you set it, you know
  it). '' on untrapped cells.
- `gardenStatus()` — pure plot data: counts + per-plot lines with
  knowledge-gated plant names (plantCalledName) and growth state
  (growing / ripe in Nd / ripe / thirsty).
- `gardenGate(action)` — {ok, reason, short} for make/sow/tend/harvest.
  The seed-stock gate stays but says WHY: "No seed stock — forage 2+
  units of a known gardenable plant (shoots, berries, roots)."
- `gardenStripHtml()` — the haven panel's garden section: "🌱 Garden:
  N plots · <per-plot states> · N empty" + data-garden buttons. Gated
  buttons render ghosted with the gate in the label AND aloud on tap —
  no silent dead-ends.
- `bridgeBadgeHTML(x, y)` — 🌉 badge HTML for bridged world-map tiles.

**app.js** (thin wiring):
- renderDetail: `g += Game.trapMarkerAt(cx, cy)` per cell (guarded).
- panelHaven: `${Game.gardenStripHtml()}` after the water line (guarded).
- `gardenTap(action)` + `document.querySelectorAll('[data-garden]')`
  wiring — gates re-checked at tap time, gated taps say the reason aloud.
- renderMap: bridge badge over visited tiles via
  `Game.bridgeBadgeHTML(x, y)` (guarded), tile gets position:relative
  only when a badge is present.

The old cell-action gating (game.js cellActions: stand outside on
grass/dirt/clearing/plant/bush) is UNCHANGED — the haven panel is now the
garden's discoverable home; the cell buttons remain as honest shortcuts.

## Proof

`node scripts/test-tile-annotations-20261017.js` — 45/45 GREEN:
- trap marker renders on the trapped cell, names the trap, absent
  elsewhere; survives save/load round-trip.
- garden strip: empty state → plot count/empty after makePlot → per-plot
  growth line after sow ("Dandelion (ripe in 7d)"); strip + buttons
  survive save/load.
- every gate names itself: sow/no-seed-stock (with remedy), tend/nothing-
  planted, tend/tended-today, harvest/nothing-ripe, make/6-plot-cap.
- bridge badge renders/titles/clears correctly.
- static: all four renderer call sites present in app.js.

`node scripts/check.js --quick`: 96 passed, 1 failed — the 1 is the
pre-existing test-sprites-valid-20261014 (dustboar/sunback/sweeps_week/
cliffhanger), identical on pristine master, unrelated to this change.

## Metric review

No balance change: this is render-only. Trap/garden/bridge mechanics,
costs, and gates are untouched — the same actions that already worked now
show themselves. The cellActions gating was deliberately left alone (both
surfaces coexist).

## For Steve's phone ([needs-eyes])

1. Set a trap → the trapped cell should show a small 🪤 badge (corner).
2. Make a garden plot → the HAVEN panel should show a "🌱 Garden:" line
   with plot count and state; Sow/Tend/Harvest buttons appear there with
   honest gate labels ("Sow seeds (no seed stock)").
3. Build a bridge → the world map tile should show a 🌉 badge.
