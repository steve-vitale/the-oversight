# BUILD ARM 4 — HERALD STEERING (2026-11-01)

## Question
The precise full-seat gap from endgame r95: wave 5 unlocks, veterans bank,
the table announces, the village sits — and no wave-5 monster is ever met.
The heraldplace arm measured the upstream cause: Herald lairs sit 3–4 tiles
east of Haven, the Herald moves as a symmetric random walk with no steering,
and shared-tile contact happens on only 1/8 seeds. Raid pinning is already
proven as the arrival path once the Herald IS on the Haven tile — the gap is
getting it there.

## Mechanism found (read, not re-measured)
- Placement: `titanPlace()` in `src/js/titans.js` puts the Herald at
  `titanPlacementTile(3)` — 3 east of the scholar/Haven tile, nearest legal
  site. (Confirmed in code; heraldplace's 1/8 contact rate is reused, not
  re-run, per the arm brief.)
- Movement: `wanderWorldMonsters()` in `src/js/game.js` — every world
  monster, per world tick, moves with probability 0.35 by one step drawn
  uniformly from the four cardinal directions, blocked only by the map edge,
  safe tiles (Haven and other villages), and occupied tiles. No monster
  identity, no destination, no bias anywhere in the loop. That is the whole
  mechanism: a pure symmetric walk, so a Herald starting 3 east of Haven
  diffuses over the whole 9×9 instead of coming home.
- Bounds respected: the fix touches movement only. No teleporting (every
  step still changes exactly one coordinate by 1), no deedGateReady / stage /
  scale / gate retunes, no win-price changes, and no roster or list feeds
  the decision — the target is Haven's map tile (`state.village.px/py`,
  the convention the rest of `game.js` uses), a place, not a list of people.

## Fix (`src/js/game.js`, `wanderWorldMonsters`)
For a world monster whose id is `herald`, half the time a step is drawn
from the Haven-ward directions (the cardinal steps that reduce Manhattan
distance to Haven) instead of all four directions. Same 0.35 move chance,
same one-tile step, same edge / safe-tile / occupied-tile blocks — so the
Herald still wanders (about half its steps still move away from Haven in
equilibrium) and still can never step onto Haven's own tile. A bias, not a
homing missile. Other monsters are untouched: the steering branch only runs
for `m.id === 'herald'`.

## Proof
Script: `scripts/test-build-herald-steer-20261101.js` (plain node, no
check.js/jest — skipped per the arm brief while sibling arms run).
Method: 8 fixed seeds (96101–96108). Fresh game per seed, world monsters
cleared, one subject spawned at Haven+3 east, scholar camped one tile east
of Haven (on the drift path), then 3000 `wanderWorldMonsters()` calls.
Metrics: mean Manhattan distance to Haven over all ticks, ticks to first
reach distance ≤ 1, ticks ending on the scholar's tile (contact proxy),
teleports, Haven-tile entries.

Before (current master, script gates FAIL — RED):
- pooled approach share 0.499 (perfectly symmetric), mean distance to
  Haven 4.55, early (first-200-tick) mean distance 4.18,
  max first-passage to distance ≤ 1 across seeds 714 ticks,
  contact ticks 295 total / 36.9 per seed, 0 teleports, 0 Haven entries.

After (this fix, script gates PASS — GREEN), identical seeds:
- pooled approach share 0.501, mean distance to Haven 1.77,
  early mean distance 1.81, max first-passage 44 ticks,
  contact ticks 3589 total / 448.6 per seed (12.2× the old level),
  ticks at distance 1 from Haven ≈ 1550 of 3000 per seed,
  0 teleports, 0 Haven entries.

Why approach share stays ~0.50 after the fix (not a failed gate): in the
steady state any walk — drifted or not — approaches as often as it retreats
(a birth–death chain in equilibrium has balanced flows). The signature of
drift is the stationary distribution itself: mean distance collapsing from
4.55 to 1.77 and first passage from up to 714 ticks to at most 44. The
script therefore gates on mean distance (≤ 2.5) and first passage
(≤ 150 ticks), and reports approach share as a diagnostic only. An earlier
version of the script gated on approach share ≥ 0.60; it failed on the
fixed code for exactly this equilibrium reason, and the gate was corrected
with the reason recorded here — the mechanism was never in doubt (contact
rose 12.2× on the same run).

Control (drift is Herald-only): `MONSTER=gallowdeer` on the fixed code
reproduces the OLD herald run's aggregate numbers exactly (295 contact
ticks, mean distance 4.55, approach share 0.499) and passes its control
gate (mean distance ≥ 3.5). Non-Herald movement is bit-for-bit unchanged.

Guards on both runs: no teleports, never enters Haven's tile, still
wanders (per-seed retreat share ≈ 0.50 in equilibrium — about half its
steps still move away from Haven).

## Verdict
GO — landed-ready for coordinator merge. Expected result change: the
Herald now lingers at Haven's door instead of diffusing across the map, so
shared-tile contacts (and hence wave-5 facings via the proven raid-pinning
path) should rise sharply from the heraldplace 1/8-seed level. Full-game
contact rates still need a live panel re-measurement after merge; this arm
proves the movement mechanism, not a full-run contact rate.

## Commit
Branch: `build-herald-steer` (worktree `~/workspace/worktrees/build-herald-steer`).
Commit: TBD — filled in by the follow-up evidence commit (see below).
Files: `src/js/game.js`, `scripts/test-build-herald-steer-20261101.js`,
`evidence/2026-11-01/build-herald-steer.md`.
Checks run: `node --check` on both changed files (clean); proof script
before (FAIL) and after (PASS) on identical seeds; control run PASS.
Not run per the arm brief: `check.js`, jest.
