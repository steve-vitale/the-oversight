# Pre-registration — sim-approachfire-b (Loop B run fleshout-loop-b-20261104T1245Z)

Committed BEFORE any replay sim. Judge strictly against this file; a miss
is NO-GO, never re-scored against a friendlier metric mid-run. Metric
doubts go under "metric review" in the evidence file, for the NEXT run.

## Background read before designing

- evidence/2026-11-04/sim-winnability-round-1212.md (confirm GO-THIN;
  the fallback never fired live; armed 99605 diverged, so no
  same-seed loop-here-broken-there pair exists).
- evidence/2026-11-04/sim-approachconf-b.md + sim-approachconf-b-prereg.md
  (instrument correction: pilot keyed on CLOSEST monster, approach
  branch keys on WEAKEST; the repick-shape proxy is PROVEN CONFOUNDED
  — it fires on the gate-off baseline 99604 seq 5 — so no firing
  claim in this arm may rest on that proxy).
- evidence/2026-11-04/sim-approachfall-b.md + prereg (the gated
  fallback in scripts/policies/competent.js, CLOSE THE DISTANCE path:
  3 zero-movement steps -> re-pick adjacent tile or WAIT).
- evidence/2026-11-04/perseed-approachconf-b/approachconf-s99605-baseline.json
  (the 99605 seq-2 baseline loop: influencer fight, day 136, target
  (0,7), 14 identical "No path there." steps, 0 strikes, death).

## Branch analysis done at prereg time (from the corpus + policy source, not a replay)

The corpus records, for all 14 player turns of 99605 seq 2: player at
(4,7), monster (influencer) at (4,5), weapon Phase blade range 1,
Chebyshev distance 2 (out of range), moveLeft 1 at each turn's action,
move tbPlayerMove(0,7) failing with "No path there.", player HP
33.88% at fight start falling to -16.12% at death, monster never
moving from (4,5), allies never moving.

Two facts from scripts/policies/competent.js fight() that shape this
prereg and must be checked by the replay, not assumed away:

1. The move target (0,7) is NOT a CLOSE THE DISTANCE target. The
   approach branch picks an adjacent tile of the weakest monster
   (here (3,6)/(4,6)/(5,6)) and steps toward it. The only branch
   issuing tbPlayerMove(0,7) from (4,7) is the legacy flee walk
   (walk to the nearest x-edge: tx = 0 when px <= 4, same row).
   The approachconf analyzer classifies a turn as APPROACH-STEP
   purely from weakest-monster out-of-range + zero-tile move-only —
   it does not record which branch issued the move. So the 99605
   seq-2 "approach loop" may in fact be a FLEE loop wearing the
   approach-step label. The replay must record the issuing branch
   (flee vs approach), not just the turn shape.
2. The fighter's HP (33.88%) sits below the policy's 35% mid-fight
   flee line for the entire fight, and the start-of-fight assessment
   also finds the fight outmatched (850 monster HP > 2.5 x 100).
   So on every turn fight() calls flee() BEFORE it ever reaches
   CLOSE THE DISTANCE. With all gates off, legacy flee() re-issues
   the (0,7) walk forever (no stuck resolution when
   COMPETENT_EXIT_VERIFIED_FLEE is off). The approach fallback can
   only run if flee() first returns false (flee repair marking the
   fight unfleeable, or a directional-flee hold) — i.e. the fallback
   may be unreachable on this exact geometry even when its own gate
   is on. The replay is designed to test exactly that, and a
   no-firing outcome is a finding about the loop's class, not a
   reason to re-score the arm against a friendlier geometry.

## Canon (read first, verified in this worktree)

- docs/CANON.md: no canon doc covers TB approach steps (pilot/
  confirm finding, re-verified). In-code law instead: src/js/game.js
  tbPlayerMove ("No path there." when findPath returns null; "Too
  far" when terrain cost exceeds moveLeft) and findPath (BFS over
  non-blocking terrain, no corner-cutting, eviction walls block),
  plus Steve's 2026-11-02 ruling that monsters do NOT flee while
  players CAN. This arm is PLAYER-side policy only.
- No gate/price/deed/standing change. No src/js change. No policy
  behavior change of any kind: the replay drives the policy code
  VERBATIM from the worktree (see Guardrails).

## Geometry reconstruction (corpus facts vs approximations)

CORPUS FACTS (copied from the 99605 baseline file, not invented):
player (4,7), HP 33.88/100 at start, 17.88 after round 13, 1.88 after
round 14, dead after round 16; monster influencer (4,5), HP 637/850,
never moves; weapon Phase blade, range 1; moveLeft 1 per player turn;
allies static at nikolai (4,4), visjoin_111 (2,5), visjoin_119 (2,4);
single monster, so weakest == only monster; 14 player turns, rounds
2-15, every move tbPlayerMove(0,7) -> "No path there.", 0 strikes,
0 waits, fighter died, one ally fled (nikolai, 18 HP).

APPROXIMATIONS (stated, with why the loop shape survives them):
- TERRAIN: the corpus records no terrain. "No path there." from
  tbPlayerMove means Game.findPath((4,7) -> (0,7)) returned null.
  The MINIMAL board assumption is: only the destination tile (0,7)
  blocks (a blocked destination alone makes BFS return null); every
  other tile is open. This is the least-invented board that
  reproduces the corpus line, and it is the PRIMARY scenario. Any
  other blocking set that also yields null for (0,7) is a
  sensitivity, not the primary.
- MAP NODE (world position, for directional flee only): not in the
  corpus. PRIMARY node is (4,2) — the latest influencer spawn tile
  before the fight (day 127 spawn at (4,2); fight day 136). The
  directional-flee outcome depends on this node, so two further
  nodes are run as SENSITIVITIES (haven (4,4) = hold; (5,5) = a
  non-havenward case), reported not judged.
- MONSTER DAMAGE: the replay drives PLAYER turns only and does NOT
  simulate monster AI. Player HP per round follows the corpus
  trajectory (33.88 until round 13, 17.88, 1.88, dead after round
  16). This preserves the flee-line condition (always < 35%) without
  inventing monster damage numbers. The replay horizon is 20 player
  turns or the corpus death round, whichever the harness reaches
  first; a strike, a wait, a barrier exit, or a re-pick ends the
  "loop shape" before that.
- ALLIES: held static, as in the corpus. Ally turns do not issue
  the player's move and cannot change the player's branch choice
  except through the occupied-tile set, which the replay includes
  (allies occupy (4,4), (2,5), (2,4); none is an approach candidate
  for monster (4,5)).

## Replay harness (scripts/probe-approachfire-b-20261104.js)

Drives the REAL policy — require() of scripts/policies/competent.js
from the worktree, never a retyped copy — turn by turn through the
reconstructed fight, for two legs on identical geometry:

- BASELINE leg: competent.js with ALL COMPETENT_* approach/flee
  gates cleared (verbatim gate-off behavior).
- ARMED leg: scripts/policies/competent-approachfall-b.js required
  verbatim (it sets exactly the four gates at require time;
  DPS_RACE stays off). No other policy file is used.

The harness supplies a faithful engine shim for exactly the engine
functions the policy calls on this path (tbFighter, tbIsPlayerTurn,
tbPlayerMove with findPath-BFS + "No path there." / "Too far"
semantics copied from game.js, tbPlayerWait, tbPlayerStrike,
tbBarrierExit, tbAfterPlayerAction via the policy's own endTurn,
equippedWeapon, findPath, tileAt, mapSeen, monsterAt, Game.map,
Game.state.scholar, Game.data.monsters). The shim does NOT decide
policy: every move/wait/strike/exit in the transcript is issued by
the policy itself. The shim records, per player turn: issuing branch
(flee vs approach vs other, read from the action the policy took
plus the policy's own ctx flags), action + args, pre/post player
position, say lines, and the direct counter readings below.

DIRECT FALLBACK COUNTER (not the confounded proxy): after every
turn the harness reads the policy's OWN ctx counters, which the
fallback code itself writes and which no other branch writes:
approachFallbackMarks (mark branch, competent.js mark line),
approachFallbackWaits (blocked-branch wait), approachRepickSteps
(blocked-branch successful re-pick step), approachStuckTurns
(primary-path zero-movement steps). A firing is marks >= 1 (the
mark is the fallback's entry point); waits/repicks are reported
alongside and must be 0 whenever marks is 0. The counter reads ctx
only — it never alters a policy decision, a move argument, or a
turn outcome. NO harness-only copy of the policy file is needed,
because the replay harness owns ctx and can read it directly; if
that proves false during the build (ctx not surfacing), STOP and
report it as the finding instead of landing a policy change.

SENSITIVITIES (reported, never judged, never substituted for the
primary): (a) map nodes (4,4) and (5,5) on the armed leg; (b)
approach-only gates (only COMPETENT_APPROACH_FALLBACK=1) on the
primary geometry, to show whether the fallback is reachable when
flee pre-emption is the only obstacle; (c) blocked-adjacent board
(all monster-adjacent tiles blocked, haven map node) on the armed
leg, to prove the direct counter CAN read >= 1 when the approach
path genuinely blocks (counter validation, not a geometry claim).

## Pre-registered metrics

- PRIMARY: direct fallback-branch executions in the PRIMARY armed
  replay = approachFallbackMarks (with waits + repick steps
  reported). Firing means marks >= 1.
- LOOP SHAPE: baseline replay must reproduce the corpus shape
  (see Baseline gate below); armed replay loop-breaking means NO
  run of >= 3 identical blocked steps to the same target AFTER the
  firing point (the fallback tolerates 3 fails before firing, so a
  run of 3 before firing is expected, never after).
- SECONDARIES (both legs, per turn): issuing branch per turn,
  actions (move target / wait / strike / barrier exit), "No path
  there." lines, zero-tile moves, strikes, max same-target blocked
  run, first turn where the loop shape breaks and how (wait,
  re-pick step, strike, barrier exit, flee walk succeeding).
- REPEAT DETERMINISM: the harness run twice produces byte-identical
  JSON + transcript (no RNG is used by the replay path; the policy
  is deterministic on fixed geometry).

## Baseline gate (must pass before any verdict is read)

The baseline replay reproduces the loop shape: 14 player turns, all
tbPlayerMove(0,7), all "No path there.", 0 strikes, 0 waits,
approachFallbackMarks == 0, approachFallbackWaits == 0,
approachRepickSteps == 0. If the baseline does NOT reproduce this
shape, the verdict is INSUFFICIENT-DATA with the reason stated —
not a GO and not a kill. The armed leg is still run and reported
for diagnosis, but it cannot rescue a failed baseline gate.

## GO threshold (judge strictly)

GO iff ALL hold on the PRIMARY scenario:
(a) baseline gate passes, AND
(b) armed primary replay shows direct fallback firing
    (approachFallbackMarks >= 1), AND
(c) armed primary replay shows the loop breaking: no run of >= 3
    identical blocked steps to the same target after the firing
    point, AND
(d) repeat replay is byte-identical, AND
(e) zero policy/src behavior change (git diff for scripts/policies/
    competent.js and competent-approachfall-b.js is empty; the only
    new files are the harness, the proof test, and evidence).

GO-THIN (pre-registered narrow case): (a), (b), (d), (e) hold and
(c) holds, but the fighter reaches no strike within the replay
horizon (the fallback breaks the loop shape into waits without yet
producing a strike — e.g. a frozen-geometry wait cycle). That is
loop-shape broken, fight not yet fought: THIN, stated as such.

NO-GO: baseline gate passes but (b) fails (fallback never fires on
the reconstructed geometry — including the case where the loop
breaks by another mechanism, e.g. flee repair or a successful flee
walk: breaking the loop WITHOUT the fallback firing is NO-GO for
this arm's claim, and the breaking mechanism must be named), OR (c)
fails (fallback fires but the >= 3 run recurs after firing), OR (e)
fails. NO-GO here is a verdict on the firing claim for this
geometry, NOT a kill of the fallback mechanism itself (the
blocked-adjacent sensitivity may still show it firing where the
approach path genuinely blocks) — the evidence must say which.

INSUFFICIENT-DATA: baseline gate fails (reason stated), or the
harness cannot drive the real policy (reason stated). No verdict
is read from sensitivities in this case.

## Sense-test (pre-registered)

Read the armed replay transcript end to end. Does the first
non-loop turn read as something a person would do (try another way
in, wait for the beast to come, run), or as a robot swapping one
loop for another (identical waits repeating, re-picks cycling the
same tiles)? A fallback that breaks the step loop only to install
a wait loop is a sense NO-GO even if (c) passes on the letter, and
will be reported as such. The baseline transcript's sense-reading
(the broken robot) is already on record from the confirm and is
re-stated, not re-litigated.

## Scale-wall numbers

This arm runs NO new sim panel (per the 1212Z blank: another band
screen is NOT the next blank). Scale-wall numbers are CARRIED from
1212Z (12 seeds: wins 0/12 both legs, national 0/12, table 0/12,
wave-5 kills 0, wave-5 unlocked 0 baseline / 2 armed, median
survival 98.5d / 98d) and reported as carried, with NO new wall
movement claimed. Say so explicitly in the evidence file.
