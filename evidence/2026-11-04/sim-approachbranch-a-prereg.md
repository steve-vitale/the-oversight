# Pre-registration — sim-approachbranch-a (Loop B run fleshout-20261104T1326Z, axis scale-onramp)

Committed BEFORE any judged replay. Judge strictly against this file;
a miss is NO-GO, never re-scored against a friendlier metric mid-run.
Metric doubts go under "metric review" in the evidence file, for the
NEXT run. No gate, price, deed, standing, or win-price change. No
src/js change. No policy behavior change: replays drive the policy
code VERBATIM from the worktree.

## Background read before designing

- evidence/2026-11-04/sim-approachfire-b.md + prereg (99605 seq-2
  "approach loop" is a FLEE loop; approach fallback never fired
  live in the 99601-99612 confirm band; fallback proxy confounded;
  firing claims need the DIRECT counter; blocked-adjacent
  sensitivity proves the counter is live, not that the fallback
  fires on a live geometry).
- evidence/2026-11-04/sim-approachconf-b.md + the 2026-11-04
  CORRECTION appendix by this arm (branch split: confirm corpus old
  24 -> flee 15, approach 9, other 0; true loops 0; the confirm's
  signal fight was a flee loop, so the confirm never tested the
  fallback against a true approach loop).
- evidence/2026-11-04/sim-winnability-round-1212.md,
  sim-winnability-round-1245.md, sim-winnability-round-1030.md
  (wall numbers carried where no new panel runs).
- scripts/test-approachfire-b-20261104.js + the competent.js
  approach/flee fallback code (CLOSE THE DISTANCE path: 3
  zero-movement steps mark the fight approach-blocked; a blocked
  fight re-picks a reachable adjacent tile, else WAITS; monster
  geometry change resets state; striking out of range is a
  documented no-op, never a fallback).
- docs/CANON.md: no canon doc covers TB approach steps (pilot/
  confirm finding, re-verified). In-code law instead: src/js/
  game.js tbPlayerMove ("No path there." when findPath returns
  null; "Too far" when terrain cost exceeds moveLeft) and findPath
  (BFS over non-blocking terrain, no corner-cutting), plus Steve's
  2026-11-02 ruling that monsters do NOT flee while players CAN.
  This arm is PLAYER-side policy only.

## Step 1 result (already committed, commit 874abfc84)

The branch split (scripts/approachbranch-analyze-20261104.js, proof
scripts/test-approachbranch-20261104.js ALL PASS) re-classifies the
confirm corpus and screens three corpora. Screen pool (old
APPROACH-STEP turns, corrected analyzer):

- Confirm corpus (24 files, 99601-99612 x baseline/armed): old 24 ->
  flee 15, approach 9, other 0; true loops 0. Longest true-approach
  run 3 (99604 seq 5) — exactly the mark point, with NO post-mark
  true-approach turn (its next turn is a flee turn at HP 0.24).
- Pilot corpus (16 files, 99801-99808): old 0 under the corrected
  analyzer — no candidate there.
- Fleerepair corpus (40 files, 99101-99108 + 99601-99608 confirm
  band): old 38 -> flee 1, approach 29, other 8; true loops 4.
  Candidates with post-mark true-approach turns at HP >= 0.35:
  99601 seq 4 (7 true-approach turns, 4 post-mark), seq 5 (7, 4),
  seq 6 (5, 2), 99606 seq 10 (4, 1).

SUBSTRATE CHECK (§14b, before any judged replay): the substrate
EXISTS. The fleerepair leg ran with the approach fallback OFF, so
its true-approach loops persisted unbroken — exactly the geometry
the fallback was built for. This arm is NOT a SUBSTRATE-MISSING
report. Had the screen found zero post-mark true-approach turns,
this prereg would have ended there with SUBSTRATE-MISSING and no
replay spend.

## TRUE-APPROACH definition (judged turns only)

A player turn is TRUE-APPROACH iff ALL hold:

1. Weakest monster OUT OF RANGE at turn start (the old class's
   range condition), zero-tile move-only turn, blocked step
   ("No path there." in the corpus);
2. HP >= 35% at turn start, so the mid-fight flee line cannot
   pre-empt CLOSE THE DISTANCE on that turn;
3. NOT a fight-start outmatched turn: the fight-start assessment
   (total monster maxHp > 2.5 * player maxHp, or maxWave >= 2 with
   HP < 0.7, or HP < 0.5) runs ONLY on the fight's first fight()
   call (guarded by ctx._fightObj !== f in competent.js). Every
   recorded corpus turn begins at round >= 2, so the assessment
   has already fired before any recorded turn, and it cannot fire
   on a judged turn. (The task's "not outmatched at fight start"
   is satisfied in substance for rounds >= 2 for exactly this
   reason; the replay primes ctx._fightObj to the fight object
   before its first turn, mirroring the live fight, and an
   UNPRIMED sensitivity shows what the assessment does on turn 1
   so the priming is demonstrated, not assumed.)

Single-turn caveat (from the split analyzer): a lone true-approach
turn could in principle be a beast-trick move (tricks run before
CLOSE THE DISTANCE and move the player). Tricks are one-shot per
monster per fight (move_x2 at most 2 consecutive rounds), so a run
of >= 3 same-target true-approach turns cannot be trick-issued.
The PRIMARY geometry's run is 7 turns — the caveat does not touch
it.

## PRIMARY geometry (corpus facts vs approximations)

CORPUS FACTS (evidence/2026-11-04/perseed-fleerepair-a/
fleerepair-s99601-confirm-fleerepair.json, exposure seq 4,
influencer, day 100, policy fleerepair = directional flee +
exit-verified flee + flee repair, approach fallback OFF):

- Player (4,4), Machete range 1, speed 3 (moveLeft 3 at each
  turn's action), HP 100 (rounds 2-4) then 56 (rounds 5-8) then 25
  (round 9); monster influencer (4,6), HP 322/850, NEVER moves;
  Chebyshev distance 2 (out of range) on every turn; single
  monster, so weakest == only monster.
- 8 player turns, rounds 2-9: every move tbPlayerMove(3,5) ->
  "No path there.", 0 strikes, 0 waits; fighter died (HP -7 at
  end, round 9); ally ivy_wang FLED in round 1 (npcTurn pre (6,5)
  -> post (3,2) fled), before the first recorded player turn.
- Branch split: turns 22-28 (rounds 2-8) are TRUE-APPROACH (HP
  1.00/1.00/1.00/0.56/0.56/0.56/0.56); turn 29 (round 9, HP 0.25)
  is 'other' under gated rules (flee may fall through).
  Post-mark true-approach turns: 4 (rounds 5-8, HP 0.56).
- Why (3,5) fails live: the policy's approach choice ignores
  terrain and picks the nearest monster-adjacent tile ((3,5) wins
  the dx=-1-first tie among (3,5)/(4,5)/(5,5) at Chebyshev 1 from
  (4,4)); the engine's tbPlayerMove says "No path there." iff
  findPath returns null. Ally ivy fled round 1 and the monster
  sits at (4,6), so no fighter occupies (3,5): the live board
  blocks (3,5) itself or a corner-cut side ((4,5)/(3,4)) of the
  diagonal step. The replay's PRIMARY board blocks (3,5) only —
  the minimal board reproducing the corpus line — and the
  corner-cut board (blocking (4,5) instead) runs as a sensitivity.

APPROXIMATIONS (stated, with why the judged turns survive them):

- TERRAIN: the corpus records no terrain. PRIMARY blocks (3,5)
  only; every other tile open. The judged firing happens on turn
  4 (first post-mark turn), before any turn whose outcome could
  depend on wider terrain.
- ALLIES: none in the replay. Ivy fled round 1, before the first
  recorded player turn, so no ally occupies any approach
  candidate during judged turns. (The approachfall armed leg's
  99601 fights differ in trajectory and are NOT this geometry.)
- MONSTER DAMAGE: not simulated. Player HP per replay turn
  follows the corpus trajectory (turns 1-3: 100; turns 4-7: 56;
  turn 8: 25). The monster is held static at (4,6), HP 322, as in
  the corpus. Strikes in the armed leg are decision-only, never
  kill claims (monster HP is not decremented, monster damage is
  not simulated).
- MAP NODE (directional flee only): not in the corpus. Flee
  never runs during judged turns 1-7 (HP >= 0.35 throughout, DPS
  race off, fight-assess off), so the primary node is arbitrary
  for the verdict; PRIMARY uses haven (4,4) and a (4,2) node runs
  as a sensitivity for the post-corpus turn 8 only.
- FIGHT-START PRIMING: ctx._fightObj is set to the fight object
  before replay turn 1 (see TRUE-APPROACH §3). The UNPRIMED
  sensitivity runs the same geometry with fresh ctx to show the
  assessment's turn-1 behavior; it is reported, never judged, and
  never substituted for the primary.

## Replay harness (scripts/probe-approachbranch-a-20261104.js)

Drives the REAL policy — require() of scripts/policies/
competent.js (baseline) or scripts/policies/
competent-approachfall-b.js (armed) from the worktree, never a
retyped copy — turn by turn through the primary geometry, 8
judged turns (corpus rounds 2-9). The harness supplies a faithful
engine shim for exactly the engine functions the policy calls on
this path (tbFighter, tbIsPlayerTurn, tbPlayerMove with
findPath-BFS + "No path there." / "Too far" semantics copied from
game.js, tbPlayerWait, tbPlayerStrike, tbBarrierExit,
tbAfterPlayerAction via the policy's own endTurn,
equippedWeapon, findPath, tileAt, mapSeen, monsterAt, Game.map,
Game.state.scholar, Game.data.monsters). The shim does NOT decide
policy: every move/wait/strike/exit is issued by the policy
itself. Fixed-seed deterministic RNG is installed before the
policy require so repeat runs are byte-identical.

DIRECT FALLBACK COUNTER (not the confounded proxy): after every
turn the harness reads the policy's OWN ctx counters, written only
by the fallback code — approachFallbackMarks, approachFallbackWaits,
approachRepickSteps, approachStuckTurns. Reading ctx never alters
a decision. A firing is marks >= 1 (the mark is the fallback's
entry point); waits/repicks are reported alongside.

SENSITIVITIES (reported, never judged, never substituted):
(a) seq-5 board (same positions, HP trajectory 100 x5 then 0.63
x2, 4 post-mark turns); (b) corner-cut board (block (4,5) instead
of (3,5) on the primary geometry); (c) UNPRIMED fight-start (fresh
ctx, same geometry — shows the turn-1 assessment); (d) map node
(4,2) on the primary geometry (post-corpus turn-8 variance only);
(e) approach-only gates (only COMPETENT_APPROACH_FALLBACK=1) on
the primary geometry (isolates the fallback from the other three
variant gates on approach turns).

## Pre-registered metrics

- PRIMARY: direct fallback-branch executions in the PRIMARY armed
  replay = approachFallbackMarks (waits + repick steps reported).
  Firing means marks >= 1.
- LOOP SHAPE: baseline replay must reproduce the corpus shape
  (see Baseline gate); armed replay loop-breaking means NO run of
  >= 3 identical blocked steps to the same target AFTER the firing
  point (a run of 3 before firing is expected — the fallback
  tolerates 3 fails before marking).
- SECONDARIES (both legs, per turn): issuing branch per turn
  (from the action taken + the policy's own ctx flags, as in the
  approachfire harness), actions (move target / wait / strike /
  barrier exit), "No path there." lines, zero-tile moves, strikes,
  max same-target blocked run, first turn where the loop shape
  breaks and how.
- REPEAT DETERMINISM: the harness run twice produces byte-identical
  JSON + transcript.
- PANEL (cost guardrails only, 8-seed pilot — see below):
  starvation totals, arm-only (player-flagged) starvation deaths,
  median survival, on identical seeds baseline vs armed.

## Baseline gate (must pass before any verdict is read)

The baseline replay (competent verbatim, all gates cleared)
reproduces the corpus shape on judged turns 1-7: every move
tbPlayerMove(3,5), every line "No path there.", 0 strikes, 0
waits, approachFallbackMarks == 0, approachFallbackWaits == 0,
approachRepickSteps == 0. (Turn 8, HP 0.25, is a legacy-flee turn
and is NOT gated: the corpus turn 29 is 'other', not a blocked
approach step.) If the baseline does NOT reproduce this shape,
the verdict is INSUFFICIENT-DATA with the reason stated — not a
GO and not a kill. The armed leg is still run and reported for
diagnosis, but it cannot rescue a failed baseline gate.

## GO threshold (judge strictly)

Overall GO iff ALL hold:

(a) baseline gate passes, AND
(b) armed primary replay shows direct fallback firing
    (approachFallbackMarks >= 1), AND
(c) armed primary replay shows the loop breaking: no run of >= 3
    identical blocked steps to the same target after the firing
    point, AND
(d) repeat replay is byte-identical, AND
(e) zero policy/src behavior change (git diff for scripts/
    policies/competent.js and competent-approachfall-b.js is
    empty; the only new files are the harness, the proof test,
    the panel driver/summarizer, and evidence), AND
(f) pilot-panel guardrails pass (below).

GO-THIN (pre-registered narrow case): (a), (b), (d), (e), (f)
hold and (c) holds, but the fighter reaches no strike within the
replay horizon (the fallback breaks the loop shape into waits
without yet producing a strike — e.g. a frozen-geometry wait
cycle). That is loop-shape broken, fight not yet fought: THIN,
stated as such.

NO-GO: baseline gate passes but (b) fails (fallback never fires
on a TRUE-approach geometry — including the case where the loop
breaks by another mechanism: breaking WITHOUT firing is NO-GO
for this arm's claim, and the breaking mechanism must be named),
OR (c) fails (fallback fires but the >= 3 run recurs after
firing), OR (e) fails, OR (f) fails (guardrails are metrics too,
§14: a GO met with a guardrail breached is NO-GO). A NO-GO on
(b)/(c) is a verdict on the firing claim for this geometry, NOT
automatically a kill of the fallback mechanism: the kill taxonomy
(§14a) is assigned at verdict time from the failure mechanism
found — CONCEPT-DEAD only if a mechanism in the fallback's own
logic explains the miss; SUBSTRATE-MISSING if the geometry turns
out not to be true-approach after all (that would contradict the
screen and must be evidenced, not asserted).

INSUFFICIENT-DATA: baseline gate fails (reason stated), or the
harness cannot drive the real policy (reason stated). No verdict
is read from sensitivities in this case.

## Pilot panel (8 seeds, AFTER the replay — confirm NOT spent here)

Only if replay bars (a)-(e) hold: an 8-seed pilot panel through
scripts/approachbranch-driver-20261104.js (a copy of the
approachconf driver writing to a NEW corpus dir,
evidence/2026-11-04/perseed-approachbranch-a/, so no confirm file
is ever overwritten), 140d death-aware horizon (the confirm
horizon, so the candidate band stays comparable), seeds
99601-99608, baseline = competent verbatim vs armed =
competent-approachfall-b verbatim, measured with the branch split
+ the confirm's scale fields. Guardrail bars (the panel's ONLY
judge role):

- starvation deaths, totals: armed <= baseline + 2;
- starvation deaths, arm-only reading (death-tele records flagged
  player=true): armed <= baseline + 2;
- median survival: armed >= 0.8 x baseline median.

BALANCED-PANEL NOTE (stated up front, §15): a balance-panel.js
compare is NOT run for this panel — it takes panel.json.gz files
from registry-policy runs, and the variant is not a registry
policy (the same reason the pilot and the confirm documented).
The comparison is the pre-registered per-seed table + split
analyzer aggregates, never a fabricated panel compare. The
balanced panel returns review_required on zero-delta pilots —
that is a KNOWN RULE, not a verdict override: per §15 the panel
is the instrument, never the judge, and a review_required status
on a secondary metric is an investigation note, not a license to
re-score the run. A zero-delta pilot therefore neither passes
nor fails this arm's verdict by itself; the guardrails above are
the panel judge, and the replay counter is the firing judge.
CONFIRM (12-16 seeds) is NOT spent in this arm under any outcome:
if the pilot passes its guardrails, the confirm is deferred to
the coordinator / next run, and this arm claims replay firing +
pilot guardrails only.

## Sense-test (pre-registered)

Read the armed replay transcript end to end. Sense GO requires
the first post-mark turn to read as something a person would do
(try another way in via a reachable tile, then fight; or wait for
the beast to come when no tile is reachable), not as a robot
swapping one loop for another (re-picks cycling the same failed
tile, unbounded waits against a static monster). A fallback that
breaks the step loop only to install a wait loop is a sense NO-GO
even if (c) passes on the letter, and will be reported as such.

## Scale-wall numbers

If the pilot panel runs, its 8-seed wall numbers (wins, national,
table, wave-5 unlocked/kills, median survival) are reported fresh
from measured scale fields and are the arm's wall numbers. If the
replay is NO-GO and no panel runs, wall numbers are CARRIED from
1212Z (12 seeds: wins 0/12 both legs, national 0/12, table 0/12,
wave-5 kills 0, wave-5 unlocked 0 baseline / 2 armed, median
survival 98.5d / 98d) with NO new wall movement claimed, stated
explicitly in the evidence file.
