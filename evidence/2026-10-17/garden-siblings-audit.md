# Grid-altering actions permanence audit — garden plot + siblings

Date: 2026-10-17. Trigger: Steve's phone report — "Making a garden plot doesn't
impact the area it's utilized in. Probably no permanence. I don't see follow up
actions. Look for siblings for this error, I'm sure there are lots of grid
altering actions that aren't actually making changes."

Method: static trace of every tile/cell mutating player action in src/js/game.js,
plus a live node harness (10/10 checks green, /tmp/garden-audit-verify.js —
scratch, not committed) driving makePlot → cellActions → sow → tend → harvest →
save/load round-trip on a real newGame. Canon: docs/CANON.md (no canon doc
covers garden rendering; the mechanic itself is documented in game.js comments).

## 1. Garden plot — end-to-end trace

**The action** (game.js:19972 `makePlot()`): requires standing on the haven
TILE (`playerTile().type === 'haven'`), costs 120 kcal + 64 ticks, max 6 plots.
Pushes `{ pid: null, plantedDay: 0, lastTend: 0, lastHarvest: 0, weeds: 0,
dead: false }` into `t.plots` where `t = tileAt(4,4)` (game.js:19964
`gardenPlots()`; haven tile is at 4,4 per map gen game.js:9603).

**Persistence: WORKS** (Steve's "probably no permanence" is not the bug).
- In-session: `t.plots` lives on the tile object (`Game.map.tiles[4][4]`).
- Save/load: `syncRun()` stores the ENTIRE map in `state.run.map`
  (game.js:8132); `S.state.save` is a full `JSON.stringify(state)` with no
  tile-property pruning (engine/state.js:183); `load()` restores
  `this.map = r.map`. Live-verified: 1 plot → JSON blob → reload → 1 plot.
- Nothing ever deletes `t.plots` (no reset in enter/exitBuilding, day
  rollover, regrow, or depletion — regrow only touches `t.detailRegrow`).

**Visual: BROKEN — this is Steve's "doesn't impact the area."**
- `grep` for `gardenPlots|.plots|plotRipe` in src/js/app.js: **zero hits**.
  The grid renderer has no concept of plots. Breaking ground changes nothing
  on screen. Confirmed, not a hunch.

**Follow-ups: EXIST and WORK, but triple-gated** (this is "I don't see
follow up actions"):
- `sowPlot` / `tendGarden` / `harvestGarden` all exist, are wired in app.js
  (labels → Game methods, app.js:1223-1226), and the full
  sow→tend→harvest chain was driven live end-to-end (planted, ripened,
  harvest changed pack contents).
- BUT the buttons only render when ALL of these hold (game.js:19556-19564):
  1. Player is OUTSIDE (`insideHaven === false`) — the hall interior shows
     zero garden UI. The harness initially failed to find any actionable
     cell until the scholar was moved outside.
  2. Player stands on a `grass|dirt|clearing|plant|bush` CELL of the haven tile.
  3. `Sow seeds` additionally requires 2+ units of a KNOWN, gardenable-form
     (shoots/berries/roots) plant in inventory (`sowOptions()`).
- Net effect: make a plot with empty seed stock → the ONLY button is "Make a
  garden plot" again (verified live: `actions=["Make a garden plot"]`). The
  plot is real, persisted, and sowable later — but the UI tells you nothing
  happened and offers nothing to do.

**Garden verdict: NO-VISUAL + GATED-FOLLOWUP.** Not a persistence bug — a
rendering gap stacked on over-strict action gating.

## 2. Sibling table — every player action that alters tiles/cells

Two storage patterns exist, and the pattern predicts the bug class:

- **Pattern C (cell-type change):** writes a new cell string into the detail
  grid (`detail[cy][cx] = 'grass'`). The grid renders cell types, so these
  are ALWAYS visible. All working.
- **Pattern T (tile annotation):** writes a property on the tile object
  (`t.plots`, `t.traps`, `t.bridged`). Persists fine via `state.run.map`,
  functions fine — but the grid renderer only draws cell types and entity
  tokens, so these are ALL invisible. **This is the sibling class.**

| # | Action (label → fn) | Stores | Persists? | Grid visual? | Follow-ups? | Verdict |
|---|---|---|---|---|---|---|
| 1 | Make a garden plot → `makePlot` | `t.plots[]` (T) | ✅ verified live + save/load | ❌ 0 refs in app.js | ✅ sow/tend/harvest, triple-gated | **NO-VISUAL + GATED** |
| 2 | Set trap → `setTrap` (game.js:3475) | `t.traps[]` incl. mx,my (T) | ✅ tile, serialized | ❌ 0 refs in app.js/css | ✅ `checkTraps()` at endDay (dawn catch) | **NO-VISUAL** |
| 3 | Build bridge → `buildBridge` (game.js:10530) | `t.bridged` (T) | ✅ tile flag | ❌ no marker in any renderer | ✅ crossing works (`travelBlockage` reads it) | **NO-VISUAL-MARKER** |
| 4 | Clear brush (a while) → `clearBrush` | cell bush→grass (C) | ✅ detail cache | ✅ | n/a (+1 wood) | WORKING |
| 5 | Fell tree → `cutTree` | cell →dirt (C) | ✅ | ✅ | n/a (+wood) | WORKING |
| 6 | Start a fire (big job) → `makeFire` | cell →fire (C) + `state.fires[]` | ✅ | ✅ (`c-fire` CSS) | ✅ cook/warmth/feed | WORKING |
| 7 | Pitch tent → `pitchTent` | cell →tent (C) + `t.secrets` | ✅ | ✅ | ✅ sleep/pack-up/camp | WORKING |
| 8 | Pack tent / wreck tent / destroy cell / kill fires / break camp | cell →dirt/null (C) | ✅ | ✅ | n/a (destruction) | WORKING |
| 9 | Set up camp → `setUpCamp` | `state.camp` | ✅ serialized | ✅ (tent+fire cells) | ✅ rest/rituals | WORKING |
| 10 | Clear blockage → `clearBlockage` | deletes `t.blockFrom` (T) | ✅ | n/a (tile-level) | ✅ path opens | WORKING |

**Sibling count: 3 in the broken class** (garden plots, traps, bridges) — all
Pattern-T annotations, all persist, all function, all invisible. **Zero**
actions found in a true NO-PERM class (acts but doesn't persist): the
persistence layer (`state.run.map` full-JSON) is solid. Steve's "lots" is
directionally right about the *symptom* (invisible alterations) but the
mechanism is rendering-blindness, not lost writes.

Notes:
- Traps store `mx,my` cell coords — a per-cell trap marker is directly
  renderable today.
- Plots store NO cell coords ("behind the hall", abstract) — they need a
  tile-panel treatment or a cell assignment, not a cell marker.
- Bridges are functionally complete (crossing works); only the marker is
  missing. Lowest priority of the three.
- `bountyFor` skips haven tiles (game.js:21280) — unrelated, not a bug.

## 3. Root cause

The grid renderer (app.js) draws **cell types + entity tokens only**. Three
player systems store their alterations as **tile-object annotations**
(`t.plots`, `t.traps`, `t.bridged`) — a storage pattern the renderer cannot
see. Persistence was never broken: `syncRun` → full `JSON.stringify` →
`load()` restores `this.map` wholesale. Every Pattern-T action's *effects*
fire correctly (dawn trap catches, bridge crossings, the full
sow→tend→harvest chain). What the player experiences is an action that
spends kcal/ticks, says the right line, changes nothing on screen, and —
for the garden — offers no visible next step unless three gates happen to
align. That is exactly Steve's report, and it reproduces deterministically.

## 4. Recommended fix direction (not implemented — audit only)

1. **Render Pattern-T annotations on the grid.** Traps: small marker glyph on
   the trapped cell (`t.traps[].mx/my` already stored). Plots: the haven
   tile panel ("HAVEN — 12 souls") should carry a garden strip — "Garden: 2
   plots · 1 growing (dandelion, ripe in 4d) · 1 empty" — since plots have no
   cell coords. Bridges: a marker on the world-map tile.
2. **Surface garden follow-ups where the player already looks.** Move (or
   duplicate) Sow/Tend/Harvest into the haven tile panel instead of gating
   them behind standing-outside-on-the-right-cell-type. The cell-type gate
   is the "I don't see follow up actions" trap; the seed-stock gate
   (`sowOptions`) is honest and should stay, but say *why* ("no seed stock —
   forage 2+ units of a known gardenable plant").
3. **General rule for future tile annotations:** any new `t.*` player-facing
   state must ship with a renderer branch in the same commit — add to the
   "proof before claim" checklist (repo AGENTS.md): a tile annotation with
   no render path is a silent action, and silent actions violate Steve's
   standing rule.

Harness: 10/10 checks green (seed 20261017). Static greps: `plots`/`traps`/
`bridged` = 0 hits across app.js, tile-scenes.js, and main.css (render
layer). No fixes made, nothing committed — worktree holds only this file
(uncommitted).
