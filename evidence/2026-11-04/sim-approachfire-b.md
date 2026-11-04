# sim-approachfire-b — LIVE approach-fallback firing replay (Loop B run fleshout-loop-b-20261104T1245Z)

## Verdict

**NO-GO (prereg-gated, for the firing claim on this geometry — NOT a
kill of the fallback mechanism).** The prereg (evidence/2026-11-04/
sim-approachfire-b-prereg.md, committed before any replay) required,
on the PRIMARY reconstructed scenario: baseline gate passes AND armed
direct fallback firing (approachFallbackMarks >= 1) AND no run of >= 3
identical blocked steps after the firing point. The baseline gate
passes exactly, but the armed primary replay shows marks 0, waits 0,
repicks 0: the fallback never fires, because it is never reached.
The loop breaks anyway — in 2 turns, by the directional flee path
(step to (4,8), barrier exit) — but per the prereg, breaking the loop
WITHOUT the fallback firing is NO-GO for this arm's claim, and the
breaking mechanism is named here, not hidden behind the break.

The deeper finding, which is the actual blank filled: **the 99605
seq-2 "approach loop" is not an approach loop at all.** Every one of
its 14 turns issues from the FLEE branch (legacy walk to the nearest
x-edge, target (0,7)), never from CLOSE THE DISTANCE. The approachconf
analyzer labels a turn APPROACH-STEP from weakest-monster out-of-range
+ zero-tile move-only alone — it does not record which branch issued
the move — so a flee walk by a hurt fighter standing out of range
wears the approach-step label. The approach fallback sits downstream
of flee() in fight(): flee() runs first on every turn while HP is
below 35% (here 33.88% at fight start, falling), and with the gates
off it returns true forever, so CLOSE THE DISTANCE — and its
fallback — never runs. The fallback was built for a loop class this
fight does not belong to. What kills THIS loop in the armed policy
is the flee repair / directional flee (already landed), not the
approach fallback. Citing 99605 seq 2 as an approach-loop kill, by
any arm, would be wrong.

No gate/price/deed/standing change. No src/js change. No policy
change: `git diff HEAD` for scripts/policies/competent.js and
competent-approachfall-b.js is empty (proven in the proof test).
Landing remains the coordinator's --ff-only merge, pending ship. No
push, no version bump, no live verification.

## Design (from the prereg, committed before any replay)

- Prereg: evidence/2026-11-04/sim-approachfire-b-prereg.md (commit
  de8e5777e, before any replay run). Harness: scripts/
  probe-approachfire-b-20261104.js. Proof: scripts/
  test-approachfire-b-20261104.js (ALL PASS, re-run below).
- Replay, not a band screen: the 99605 seq-2 geometry is driven turn
  by turn through the REAL policy, require()d verbatim from the
  worktree — baseline = competent.js with all gates cleared; armed =
  scripts/policies/competent-approachfall-b.js required verbatim
  (four gates, DPS_RACE off). No hand-edited policy copy exists.
- DIRECT COUNTER (not the confounded proxy): after every turn the
  harness reads the policy's OWN ctx counters — approachFallbackMarks
  (the fallback's entry point), approachFallbackWaits,
  approachRepickSteps, approachStuckTurns. Only the fallback code
  writes them. The counter reads ctx only and alters no decision.
  No harness-only policy copy was needed, because the replay harness
  owns ctx and can read it directly — the prereg's stop-condition
  for that case never triggered.
- Engine shim: implements exactly the engine functions the policy
  calls on this path, with game.js semantics for findPath (BFS,
  non-blocking cells, no corner-cutting) and tbPlayerMove ("No path
  there." on null path; "Too far" when path cost exceeds moveLeft;
  monster-occupied destination refused; otherwise step tile by
  tile). Every move/wait/strike/exit in the transcript is issued by
  the policy itself; the shim never decides.

## Geometry reconstruction (corpus facts vs approximations)

CORPUS FACTS (from approachconf-s99605-baseline.json, exposure seq 2):
influencer fight, day 136, player (4,7) HP 33.88/100 at start, monster
(4,5) HP 637/850 never moving, Phase blade range 1, Chebyshev distance
2 (out of range), moveLeft 1 per player turn, allies static at
nikolai (4,4), visjoin_111 (2,5), visjoin_119 (2,4), single monster
(so weakest == only monster), 14 player turns rounds 2-15, every move
tbPlayerMove(0,7) -> "No path there.", 0 strikes, 0 waits, fighter
died (HP -16.12 after round 16), one ally fled.

APPROXIMATIONS (stated in the prereg, kept here):
- TERRAIN: the corpus records none. PRIMARY board blocks only (0,7)
  — the minimal board reproducing "No path there." (a blocked
  destination alone makes BFS return null); every other tile open.
- MAP NODE (directional flee only): not in the corpus. PRIMARY node
  (4,2) — the latest influencer spawn tile before the fight (day 127
  spawn at (4,2)). Haven (4,4) and (5,5) run as sensitivities.
- MONSTER DAMAGE: not simulated. Player HP per round follows the
  corpus trajectory (33.88 until round 13, 17.88, 1.88, dead after
  round 16), preserving the < 35% flee-line condition. Post-horizon
  armed turns (beyond the corpus death round) are decision-only:
  strike counts there are NOT kill claims, since monster damage is
  not simulated and monster HP is held at 637.
- ALLIES: held static, as in the corpus. The occupied-tile set
  includes them; none is a monster-adjacent approach candidate.

## Judged replays (PRIMARY scenario: map (4,2), blocked (0,7))

BASELINE leg (verbatim competent, gates off) — BASELINE GATE PASSES:
14 player turns, every turn branch=flee, tbPlayerMove(0,7),
"No path there.", 0 strikes, 0 waits, 0 barrier exits, max
same-target blocked run 14, direct counters marks 0 / waits 0 /
repicks 0 / stuckTurns 0. This is the corpus shape turn for turn,
including the issuing branch the corpus instrument never recorded.
Full transcript: evidence/2026-11-04/perseed-approachfire-b/
approachfire-primary-baseline.txt (JSON alongside).

ARMED leg (variant file verbatim) — loop broken, fallback NOT fired:
- Turn 1: branch flee, tbPlayerMove(4,8) — the directional flee step
  toward the havenward edge (south from map (4,2)), succeeding on the
  open board. No "No path there.".
- Turn 2: branch flee-exit, tbBarrierExit(0,1) — the fight ends by
  exit. Counters still marks 0 / waits 0 / repicks 0.
- Max same-target blocked run 0, strikes 0 (the fight exits before
  any strike), barrier exits 1.
Full transcript: perseed-approachfire-b/approachfire-primary-armed.txt.

PREREG JUDGEMENT: (a) baseline gate passes. (b) FAILS — marks 0, so
no firing. (c) is moot without a firing point (and the loop shape
does not recur at all). (d) repeat replay byte-identical (proof
test). (e) zero policy change (proof test). Verdict: NO-GO for the
firing claim on this geometry. The loop's breaker is the directional
flee, a mechanism that was already landed — not the approach
fallback. The fallback is not killed by this verdict: the
blocked-adjacent sensitivity below shows it firing where the approach
path genuinely blocks.

## Sensitivities (reported, never judged, never substituted)

Map node (4,4) haven, armed: flee() holds at haven (no havenward
push), so turn 1 runs CLOSE THE DISTANCE: tbPlayerMove(3,6)
succeeds, then 19 strikes. Marks 0. The approach path works the
moment flee stops pre-empting it — and still the fallback does not
fire, because the approach step itself succeeds on the open board.

Map node (5,5), armed: directional flee walks west (3,7), (2,7),
(1,7), then hits the blocked (0,7) twice; on the third stuck flee
turn the flee repair marks the fight unfleeable and falls through
IN THE SAME TURN to an approach step (2,6) (branch label
flee-repair-fallthrough), then an approach step to (3,5), then 13
strikes. Max same-target blocked run 2. Marks 0. Again the loop
breaks by flee repair + a succeeding approach step, not by the
approach fallback. Across all three map nodes the armed outcome
varies (exit / hold-and-fight / walk-then-fight) but the approach
counter stays 0 — the NO-GO is robust to the map-node approximation,
not an artifact of it.

Approach-only gates (only COMPETENT_APPROACH_FALLBACK=1, primary
geometry): the loop persists 20/20 turns, all flee, marks 0. This is
the cleanest statement of the pre-emption: turning on the approach
fallback ALONE changes nothing on this geometry, because flee()
never returns false without the flee gates, so CLOSE THE DISTANCE
never runs. Any future "approach fallback" test that leaves the flee
gates off is testing a branch that cannot be reached.

Blocked-adjacent board (map (4,4), all monster-adjacent tiles
blocked, armed) — COUNTER VALIDATION, not a geometry claim: the
direct counter DOES read: marks 3, waits 15, repicks 0, stuckTurns 5.
Transcript shape: 3 failed approach steps to (3,6) -> mark ->
5 waits -> 1 re-probe fail -> mark -> 5 waits -> 1 re-probe fail ->
mark -> waits. Max same-target blocked run 3 (the tolerated pre-mark
run); after the first mark, only single re-probe steps recur, so the
prereg's post-firing run condition would hold here. This proves the
counter is live (it is not a dead 0) and the fallback's wait branch
does execute when the approach path genuinely blocks and flee is
held. It does NOT prove the fallback fires on the reconstructed
99605 geometry — that board invents blocking the corpus never
records, and it is reported as a sensitivity for exactly that reason.

## Counter readings (all legs)

| leg / scenario | marks | waits | repicks | stuckTurns | maxRun | strikes | exits |
|----------------|-------|-------|---------|------------|--------|---------|-------|
| baseline, primary | 0 | 0 | 0 | 0 | 14 | 0 | 0 |
| armed, primary (4,2) | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| armed, haven (4,4) | 0 | 0 | 0 | 0 | 0 | 19* | 0 |
| armed, node55 (5,5) | 0 | 0 | 0 | 0 | 2 | 13* | 0 |
| armed, approach-only | 0 | 0 | 0 | 0 | 20 | 0 | 0 |
| armed, blocked-adjacent | 3 | 15 | 0 | 5 | 3 | 0 | 0 |

\* Decision-only strikes past the corpus death horizon (monster
damage not simulated; not kill claims). Baseline gate-off counter
readings are 0 on every counter, as required — the counter reads 0
on the gate-off baseline replay, so it cannot be a proxy artifact.

## Sense-test (SENSE-TESTING LAW): read end to end

Baseline transcript (replay): fourteen identical turns — move toward
(0,7), "No path there.", no strike, no wait, no re-pick — then the
corpus death. It reads as a broken robot, exactly as the confirm
read the live transcript. The replay adds the missing diagnosis: the
robot is a hurt fighter trying to run (flee branch, HP below the
flee line) and walking into a wall, not a fighter trying to close
in. A person at 34% HP with a blocked escape would stop walking
into the wall after the third failure — which is what the armed
policy does on every sensitivity (exit, hold-and-fight, or
repair-and-fight).

Armed primary transcript: step south to the edge, push through the
barrier, gone. That reads as a person fleeing, not as a repaired
approach — because it IS a flee, and no approach repair is involved.
No sense veto fires on it; there is simply no fallback behavior to
veto or to praise.

The one sense caution in this arm belongs to the blocked-adjacent
sensitivity, not to the primary verdict: there the fallback's wait
branch cycles 5 waits -> 1 failed re-probe -> 5 waits, against a
monster the replay holds static (as the corpus holds it). Waiting
for a beast to come while the beast never moves reads, in that
frozen geometry, as patience turning into a second loop — the wait
branch's design bet is that the monster's turn changes the geometry,
and in a geometry where nothing ever moves, that bet never pays.
In a live fight the monster does move (in the corpus fight it
happens not to, for 14 rounds), so this is a caution about the wait
branch's worst case, not a veto: a wait cycle that never sees a
geometry change should eventually do something else (strike-anyway
is a documented no-op out of range; a second fallback after N
frozen waits is the open design question, named in Metric review,
not decided here).

## Scale-wall numbers (CARRIED from 1212Z — NO new panel, NO new movement)

This arm runs NO new sim panel, per the 1212Z blank (another band
screen is NOT the next blank). The numbers below are carried from
the 1212Z confirm corpus (12 seeds) and NO new wall movement is
claimed:
wins 0/12 both legs, national 0/12, table 0/12, full seat 0, wave-5
kills 0, wave-5 unlocked 0 baseline / 2 armed, median survival
98.5d / 98d. Full seat still unwon, wave-5 kills still 0. This arm
neither moves nor re-measures the wall.

## Village assessment (plain words)

Nothing about the village's arc changes in this arm — it is a replay,
not a sim, and it makes no claim about villages living longer or
winning more. What changes is the diagnosis of one famous death:
the fighter who died repeating "No path there." fourteen times was
not stuck trying to reach the beast. He was hurt, trying to run,
and the escape road was walled. The armed policy saves him three
different ways depending on where the fight sits (out the barrier,
stand and fight at haven, or walk until the flee repair hands him
his weapon back) — but none of those three is the approach fallback
doing anything. The blank filled is the loop's true class (flee, not
approach) and a working direct counter for future firing claims. The
blank documented is still the live approach-fallback firing: it has
now been shown to fire on a constructed blocked board, but never on
a reconstructed live geometry, because no reconstructed live geometry
so far has actually reached the approach branch while blocked.

## Metric review (for the NEXT run, not a re-score of this one)

- The approachconf analyzer's APPROACH-STEP class is OVERBROAD and
  should be split before any future loop claim leans on it: it must
  record the issuing branch (flee vs CLOSE THE DISTANCE), or at
  minimum exclude turns where the fighter is below the flee line
  and the move target is an edge tile (the legacy flee shape). As
  it stands, a flee loop by a hurt out-of-range fighter counts as an
  approach loop, and that mislabeling is what sent two runs (pilot
  band discussion, confirm band) looking for an approach fix to a
  flee problem. The repick-shape proxy was already proven
  confounded; the approach-step class itself now needs the same
  correction, in the analyzer, not in the policy.
- The prereg's GO bar was the right bar and it did its job: a
  loop-break without a firing is NO-GO, stated plainly, rather than
  a soft GO on the strength of the break. Keep that discipline —
  a future arm that shows an armed break must still show the counter
  before it claims the fallback did the breaking.
- The wait branch's frozen-geometry cycle (5 waits -> re-probe ->
  5 waits, unbounded while the monster sits still) deserves a
  pre-registered bound in the next true-approach test: how many
  frozen waits before the verdict calls it a second loop? The
  current code has no such bound beyond the re-probe cadence.
- The replay harness's engine shim is honest about its limits:
  no difficult terrain, no moderator, no eviction wall, no monster
  AI, barrier push treated as fight exit. None of those limits
  touches the primary verdict (the baseline shape reproduces
  exactly, and the armed counter is 0 across three map nodes), but
  a future replay that needs push/chase semantics (does the
  influencer chase across the barrier?) needs the real engine's
  tbBarrierExit, not the shim's exit assumption.
- TELEMETRY DEVIATION CHECK (run-book step 10): not applicable —
  this arm produces a replay corpus, not a sweep recorder corpus,
  and runs no panel; wall numbers are carried, not measured (see
  above). No telemetry-check run was fabricated for it.

## Next blank (named, NOT run)

The live approach-fallback firing on a TRUE approach geometry: a
fight where flee does NOT pre-empt (fighter HP >= 35% and not
outmatched at fight start, so fight() reaches CLOSE THE DISTANCE),
the weakest monster out of range, and the approach step blocked on
a board the corpus actually records (terrain included). Two routes,
in order: (1) search the existing approachconf corpus for a fight
whose turns are approach-branch steps (not flee walks) that block
— the analyzer's branch split above is the prerequisite, and the
search must re-classify before it claims a candidate; (2) if no
such fight exists in the corpus, construct a true-approach replay
(high-HP fighter, blocked adjacent tiles, monster static) through
the same direct-counter harness and show mark -> re-pick or wait
breaking it. What is NOT the next blank: another band screen, a
re-pick-proxy count, or citing the blocked-adjacent sensitivity
as a live firing.

## Carried blanks (named only, not chased)

From 1212Z, in order after this arm's blank: (2) BELONG-direction
zombie clear and/or a survival-first substrate pre-registered for
>= 200d life; (3) floored tend-through variant with death-day deltas
+ wave-facing guard; (4) BELONG-tending gap — belongseek panel with
a policy that tends subordinate links; (5) 99101 hold-beat case
re-finding per anchor; (6) wave5faced label rename. NO gate/price/
deed arm follows.

## Proof

`node scripts/test-approachfire-b-20261104.js` — ALL PASS (exit 0).
Coverage: policy files unmodified vs HEAD; baseline gate (14x (0,7)
flee turns, No-path x14, counters 0); armed primary (2 turns,
directional flee + barrier exit, marks 0); repeat determinism (both
primary legs byte-identical across fresh runs); counter validation
(blocked-adjacent marks 3, waits 15, max run after first mark 1);
approach-only persistence (20/20 flee, marks 0); haven sensitivity
(step (3,6), strikes, marks 0).

Sibling proofs, no regression (this arm changes no policy or src
file, but both were re-run): `node scripts/
test-approachfall-20261104.js` — ALL PASS; `node scripts/
test-approachconf-20261104.js` — ALL PASS.

check.js --quick was NOT run for this arm: it adds no src/js,
policy-default, or game-code change (new scripts + evidence only),
and the base's check profile is the coordinator/ship loop's, per the
confirm's precedent. The relevant proofs above are green.

## Files

- Evidence (this file): evidence/2026-11-04/sim-approachfire-b.md
- Prereg: evidence/2026-11-04/sim-approachfire-b-prereg.md
- Harness: scripts/probe-approachfire-b-20261104.js
- Proof: scripts/test-approachfire-b-20261104.js
- Corpus (12 files): evidence/2026-11-04/perseed-approachfire-b/
  (approachfire-{primary-baseline, primary-armed, haven-armed,
  node55-armed, primary-armed-approach-only,
  blocked-adjacent-armed}.{json,txt})
- Variant used verbatim (untouched by this arm): scripts/policies/
  competent-approachfall-b.js, scripts/policies/competent.js
