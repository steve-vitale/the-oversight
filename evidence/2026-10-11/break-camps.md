# break-it: camps & structures — 2026-10-11

Target system 6 (camps & structures). One worker, deep. Canon: docs/CANON.md
read first. **No dedicated camp/structures canon doc exists** — the standing
rules applied are Steve's laws from memory/DECISIONS ("havens are the ONLY
unbreakable human structures", "a shitty breakable version of a haven", one
camp at a time). Nothing invented; where canon was silent the existing code
comments (prior break-it camps runs R10–R13, camps-2…camps-9) were treated as
the design record.

## Attacks

### EXPLOIT — break/rebuild loop (HELD)
pitch → setUpCamp → packTent(struck) × 2 cycles. Tent units conserved exactly
(2→2, no duplication), kcal strictly spent (5000→4900, −50/cycle pitch cost),
struck camp deleted not phantom, struck fire honestly keeps burning
(ledger+grid agree). No free resources anywhere in the loop. Storm-break
wrecks tents outright (no tent return) — pure loss. **Verdict: held.**

### SOFTLOCK — destroyed mid-occupancy, re-break (HELD)
Inside tent + camp + storm breakCamp('the storm tore through it'): player
evicted with the honest "crawl out" line, insideTent nulled, camp deleted.
Re-breaking a gone camp: silent no-op, no throw. **Verdict: held** (prior
runs' camps-9 eviction + sleep mid-destruction wake already covered; verified
live again).

### HONESTY — alien burn phantom fire (BROKE → FIXED, C1)
`apPlaygroundBurn` (alienPlayers.js) writes `bd[by][bx] = 'rubble'` directly,
bypassing destroyCell. It did not skip player 'fire' cells and never purged
`state.fires`: the grid cell became rubble while the tracked entry stayed
live. Result: `playerFireAt` true on rubble → "Feed the fire" offered on ash,
fuel spent into the void ("The fire takes it" — a lie), while
`hasCampfireNearby` (grid-checked) said no fire. Ledger/grid split brain.
**Fix:** when the burn takes a player fire cell, purge the tracked entry
(same class as destroyCell's smashed-fire purge) and say "Your fire dies in
the burn — the cell is rubble now, the flame gone with it." Commit 74d7ebc7.
Proof: scripts/test-break-camps-20261011.js — 3 C1 assertions failed before
the fix, 31/31 pass after, across seeds 20261011/7/99.

### UNBREAKABLE — haven truly unbreakable (HELD)
destroyCell on hall/bunk/door cells: refuses, cell byte-identical. Alien burn
on the haven tile: refuses outright (`tile.type === 'haven'` guard).
Bulldozer/bulldoze path routes through destroyCell's guard. No other human
structure is accidentally unbreakable (unbreakable list is haven-interior
cells + lodge + alien 'sanct'/'base'; player tents/fires break). **Verdict:
held.**

### DEAD-CODE — camp verbs wired (HELD)
breakCamp, setUpCamp, packTent, pitchTent, enterTent, destroyCell,
hasCampfireNearby, canSetUpCamp all live functions; every one executed its
real path at runtime in the proof (not just defined). UI dispatch verified:
'Pitch tent'/'Pack up tent'/'Set up camp' labels all dispatch in app.js.
Camp call sites: storms (2), wreckTent, destroyCell, scorchCells,
packTent(struck), setUpCamp abandon, alien beam, ledger death path.
**Verdict: held — nothing dead.**

### Other notes
- No camp storage exists: `state.camp` = {px, py, condition} only. Food lives
  in inventory/prepStash/pantry — "food in camp storage" is N/A by design.
- No voluntary "break camp" button exists (by design — camps die to
  storms/monsters/the world; abandonment happens via new-camp setup).
- `s.burnedTiles` is write-only outside alienPlayers (no consumer) — adjacent
  system (alien players), noted not fixed.
- The burn's feed line "torched the old camp area" fires even where no camp
  stood — diegetic System voice, not a mechanics promise; left as flavor.
- Regression: test-break-alien-20261010.js has 1 pre-existing failure
  ("apMaybeActivate activates someone", seed 20261010) — fails identically
  on the pristine tree, unrelated to this fix. r13 alien suite 75/75,
  camps-20261010 suite 71/71.

## Commits
- 74d7ebc7 — break-it camps 2026-10-11: alien burn phantom-fire honesty kill
  (src/js/alienPlayers.js + scripts/test-break-camps-20261011.js)
- Status: ready to merge, pending ship.
