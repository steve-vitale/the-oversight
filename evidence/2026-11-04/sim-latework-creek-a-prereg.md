# sim-latework-creek-a — PREREGISTRATION (binding; committed BEFORE any judged sim)

Run: oversight-flesh-out-loop, run fleshout-20261104T2230Z, arm
sim-latework-creek-a, axis food-economy. Worktree sim-latework-a.
Coordinator merges via --ff-only; nothing is pushed, bumped, or
live-verified by this worker; report 'merged locally, pending ship'
readiness. Main tree never touched; no hidden_files, registry, or
other worktree touched.

## Blank (from evidence/2026-11-04/sim-bankretain-rerun-a.md §4 + §6)

"LATE-WORK LINE HARDCODED 'AT THE CREEK' — late-work line still
says 'at the creek' on forest_floor evenings (voice-only)."
Quoted instance: seed 16505 loop-day 59 forest_floor evening
(2 gathers, 0 forages): "You work late at the creek — 2 deadfall
gathers and 0 forages — until the night is too far gone for real
sleep."

## Premise correction (found while locating the line)

The task brief said "find the exact line in src/js". It is NOT
in src/js. Repo-wide grep for "work late" finds exactly one
emitter: scripts/policies/bankfood-diag.js:371, inside the
bankfood evening bank/flip handler (a sim policy wrapper, env-gated
BANKFOOD=1). No shipped game-code line carries this wording, so
there is no src/js line to fix; the fix lands in the policy that
speaks the line in sim transcripts. This is still voice-only:
the line is narration spoken through Game.say, and the change
touches no mechanic, number, gate, or price. Every other
narration line in the file is left byte-identical (the file's
only other say-adjacent text is the morning pack-eat path, which
this arm does not touch).

## Canon read first

docs/CANON.md read. No canon doc covers evening late-work
narration lines: docs/SYSTEM-VOICE.md is the System voice bible
(voice recipe, accent-tourist direction), not this line, and
docs/PRESERVATION.md covers the food ladder, not narration.
No canon is invented. Terrain names used by the fix are only
names the engine already carries: src/js/game.js TILE_NAME
(forest_floor 'forest floor', grove 'grove', meadow 'meadow',
thicket 'thicket', wetland 'wetland', creek 'creek', trail_edge
'trail edge', ruin 'ruin', haven 'Haven', building 'building',
street 'street', plaza 'plaza', cache 'buried cache').

## Fix design (voice-only)

At the say site, read the player's CURRENT tile at say time
(Game.playerTile() — after any evening walk, this is where the
work happened), falling back to the evening-start tile type
already captured in the handler, then to a neutral phrasing
with no place name:

- creek -> "You work late at the creek — ..." (BYTE-IDENTICAL
  to the old line, including counts and tail clause).
- forest_floor -> "You work late on the forest floor — ..."
- grove/meadow/thicket -> "in the grove/meadow/thicket"
- wetland/ruin/street/plaza/building/cache -> "at the
  wetland / old place / old street / old plaza / building /
  buried cache" (ruin uses the engine's TILE_NAME-adjacent
  narration name 'the old place' only if TILE_NAME says ruin;
  see implementation note — the fix uses TILE_NAME values
  verbatim and adds only the preposition).
- haven -> "at Haven".
- unknown/null tile type -> "You work late — ..." (no place
  name; never a wrong place name).
The place phrase is computed by a small exported pure helper
so the fixture can test it without a full sim. The evening
record also gains sayPlace (the tile type used) so the sweep
can audit emitted text against the recorded place.

Implementation note: prepositions are grammar, not terrain
names; no new terrain name is introduced. If a TILE_NAME
value is ever renamed in game code, the helper's copy goes
stale — flagged as a follow-up note in the evidence, not
fixed by reaching into the Game closure (TILE_NAME is not a
Game method and the policy must not depend on closure
internals).

## Primary metric (binding)

Count of late-work lines on non-creek evenings that name the
wrong place, i.e. emitted lines containing "at the creek"
whose work tile type is not 'creek'.

## GO threshold (binding)

- Fixtures: 0 hardcoded-creek lines on forest_floor AND on
  every other non-creek terrain type in TILE_NAME; creek
  evenings still emit the byte-identical old line; unknown /
  throwing tile reads emit the neutral no-place line.
- Sweep (regression check): 0 late-work lines in the 8-seed
  corpus that say "at the creek" while their record's
  sayPlace is not 'creek'; every emitted late-work line's
  place phrase matches its recorded sayPlace; no evening
  handler errors attributable to the change.
- NO-GO if any fixture fails, if a creek evening changes
  wording, or if the sweep shows a wrong-place line.

## Instruments

- Fixture (proof instrument): NEW scripts/test-latework-creek-a.js
  — stub-Game tests of the exported place helper for every
  TILE_NAME terrain type + null/throwing tile, plus a
  byte-identity check of the creek line.
- Sweep (regression check): UNCHANGED driver
  scripts/bankfood-trace-b.js, DAYS=60 (death-aware: dead
  villages stop; +10d tail max), pilot seeds 15003, 15376,
  15009, 15091, 15211, 15215, 15220, 15221, guard leg
  (WOODWARM=0), BANKFOOD=1, env gates COMPETENT_FEAST=0
  SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel
  WOODCARRY=1. OUTDIR
  evidence/2026-11-04/sim-latework-creek-a-corpus.
- Regression over narration tests runnable without concurrent
  jest: scripts/test-bankfood-b.js,
  scripts/test-upkeepbreakfast-a.js, scripts/test-upkeepgate-b.js
  (node, --cacheDirectory=/tmp/jest-cache-sim-latework-a if
  any jest path is used; never concurrent jest).
- Balanced panel (§15): not applicable — this is a
  narration-text fix in a sim policy, not a game-code balance
  change; no before/after gameplay comparison is claimed.

## Metric review

To be written in the evidence file after the run.
