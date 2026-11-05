# Pre-registration — sim-approachlive-b (Loop B run fleshout-loop-b-20261105T0930Z, winnability chain)

Committed BEFORE any judged sim. Judge strictly against this file;
a miss is NO-GO, never re-scored against a friendlier metric mid-run.
Metric doubts go under "metric review" in the evidence file, for the
NEXT run. No gate, price, deed, standing, or win-price change. No
src/js change. No policy behavior change: sims drive the policy code
VERBATIM from the worktree (baseline = scripts/policies/competent.js;
armed = scripts/policies/competent-approachfall-b.js, four gates,
DPS_RACE off). No default flip before the verdict.

## Background read before designing

- evidence/2026-11-04/sim-approachbranch-a.md + prereg (fallback firing
  REPLAY-PROVEN on a true-approach geometry: marks 1 at turn 3,
  re-pick to (4,5), strikes turns 5-8, post-firing blocked run 0;
  pilot panel breached starvation totals 7 vs bar 4 while passing
  player-flagged 1 vs 2 and median 83d vs 74.8d; panel produced zero
  approach steps, so no LIVE SIM firing yet).
- evidence/2026-11-04/sim-approachfire-b.md + prereg (99605 seq-2
  "approach loop" is a FLEE loop, 14 flee / 0 approach; fallback
  never fired live; blocked-adjacent sensitivity proves the counter
  is live and exposes the wait branch's frozen-geometry cycle: 5
  waits -> re-probe -> 5 waits, unbounded while the monster sits
  still).
- evidence/2026-11-04/sim-approachfall-b.md + prereg (pilot GO-THIN;
  fallback never fired live; 0-vs-0 primary is no-harm, not a kill).
- evidence/2026-11-04/sim-approachconf-b.md INCLUDING its CORRECTION
  appendix (confirm's one baseline "approach-loop fight" 99605 seq 2
  is a FLEE loop; true loops in the confirm corpus number 0, not 1).
- docs/CANON.md, docs/MONSTER-WAVES.md (wave law; monster encounters
  are fought, not rolled), docs/CONTESTS.md (contests played, not RNG).
  No canon doc covers TB approach steps (pilot/confirm finding,
  re-verified). In-code law instead: src/js/game.js tbPlayerMove
  ("No path there." when findPath returns null; "Too far" when
  terrain cost exceeds moveLeft) and findPath (BFS over non-blocking
  terrain, no corner-cutting), plus Steve's 2026-11-02 ruling that
  monsters do NOT flee while players CAN. This arm is PLAYER-side
  policy only.
- Flee repair verified on master before designing: grep of
  scripts/policies/competent.js on this worktree's base finds the
  repair code (unfleeable marking, approachFallbackOn, the CLOSE THE
  DISTANCE fallback with approachFallbackMarks/Waits/RepickSteps/
  StuckTurns). The sim-fleerepair-a branch is NOT adopted and its
  worktree is NOT touched; this arm uses only the master policy code
  plus the already-landed variant file.

## The two owed items (from Loop A arm sim-approachbranch-a)

(1) LIVE SIM FIRING: no sim has yet shown the counter move. The
8-seed pilot panel produced zero approach steps on either leg.
(2) GUARDRAIL RE-TEST: the 8-seed pilot breached starvation totals
(armed 7 vs baseline 2, bar armed <= baseline + 2 = 4) while passing
player-flagged starvation (1 vs 2) and median survival (83d vs
74.8d). This arm re-tests the guardrail on the 12-seed confirm band
(99601-99612) before any land/kill decision on the variant.

## Substrate check (§14b, before any judged sim)

Re-run of the approachbranch screen over the existing fleerepair
corpus (evidence/2026-11-04/perseed-fleerepair-a/, 40 files,
read-only): TOTALS files=40 old=38 flee=1 approach=29 other=8
oldLoops=5 trueLoops=4 — byte-identical to approachbranch's screen.
Candidates with post-mark true-approach turns at HP >= 0.35:
99601 seq 4 (7 true-approach turns, 4 post-mark), seq 5 (7, 4),
seq 6 (5, 2), 99606 seq 10 (4, 1). The substrate EXISTS in the
record. The panel's own baseline leg re-verifies it on the CURRENT
tree: bar (a) below is the live substrate bar. If the panel baseline
stages zero true-approach loops, the firing question is
SUBSTRATE-MISSING, not a fail, and no verdict is read from the
armed leg.

## Direct-counter instrument (new in this arm)

scripts/approachlive-bus-20261105.js + the policy.fight wrap in
scripts/approachlive-driver-20261105.js. The driver wraps
policy.fight call-through (return value preserved, no RNG use, no
mutating game call) and snapshots the policy's OWN ctx counters
before/after every call: approachFallbackMarks,
approachFallbackWaits, approachRepickSteps, approachStuckTurns.
Only the fallback code writes these counters; reading ctx alters
no decision. Attribution is by DELTA per call, keyed by fightId;
the driver joins bus records to instrument exposures by fightId
after runDays and embeds a per-exposure `fallback` rollup plus
run-level `fallbackCalls`/`fallbackTotals`. Proof: scripts/
test-approachlive-20261105.js — ALL PASS (10 checks: bus fixtures
for marks/repick/post-firing run/frozen-wait bound + a 2-day live
smoke of both legs into /tmp, asserting the output shape and
delta-total consistency). The smoke is tooling verification, NOT a
judged leg.

TRUE-APPROACH FIGHT (for the primary metric): an instrument
exposure (wave-4 TB fight) with >= 1 branch-'approach' turn under
the branch-split analyzer (scripts/approachbranch-analyze-20261104.js,
reused verbatim — never the unsplit APPROACH-STEP class). Marks on
a fight with zero branch-'approach' turns, or on a non-exposure
fight (waves 1-3), are REPORTED (markedNonExposure) but do NOT
satisfy the primary metric: the claim is a firing on a true-approach
fight, and the 99605 seq-2 lesson is that a mark anywhere else is a
different loop class wearing the same transcript line.

## FROZEN-WAIT BOUND (pre-registered, from the approachfire caution)

FROZEN-WAIT BOUND = 10 waits. A fight is a FROZEN-WAIT LOOP iff,
after its first mark: approachFallbackWaits total >= 10 AND
approachRepickSteps after the mark == 0 AND monster geometry never
changes after the first mark (every post-mark call's monster
geometry equals the geometry at the first-mark call). A strike
after the mark needs no separate condition: the wait branch runs
only while out of range, and reaching range requires the monster
to move (geometry change) or a repick to succeed (repick >= 1).
10 is two full wait cycles (5 waits -> re-probe -> 5 waits). A
frozen-wait loop is a SECOND LOOP installed by the fallback, not a
break: if any armed true-approach fight is one, bar (b) FAILS
(sense NO-GO) even if marks fired.

## Guardrail decision (decided BEFORE running — the approachbranch metric-review question)

The totals half is judged on totals alone AND alongside the
player-flagged half: ALL THREE guardrail halves are independently
binding, and NO half's pass excuses another half's breach. The
pilot's totals breach was 7 real late-game starvation deaths
(mostly villagers, not the scholar) — a village-wide cost the
player-flagged half does not measure, so the player-flagged pass
does not soften it. Guardrail bars:

- starvation deaths, totals: armed <= baseline + 2;
- starvation deaths, player-flagged (death-tele records flagged
  player=true): armed <= baseline + 2;
- median survival: armed >= 0.8 x baseline median.

## Panel design (judged sims)

- Band: 99601-99612 (the fleerepair confirm band, where true-approach
  loops were observed). Horizon 140d death-aware. Baseline =
  competent.js verbatim vs armed = competent-approachfall-b.js
  verbatim (four gates, DPS_RACE off), identical seeds, single-base
  judging (anchor = this prereg commit's HEAD).
- Driver: scripts/approachlive-driver-20261105.js (copy of the
  approachbranch driver, new corpus dir evidence/2026-11-05/
  perseed-approachlive-b/, prefix approachlive-s, refuses to
  overwrite). Analyzer: branch split (gated = policy !==
  'competent'). Summarizer: scripts/approachlive-summarize-20261105.js
  (branch split + guardrails + direct-counter firing rollup +
  scale-wall fields, measured never hard-coded).
- Scale-wall numbers reported fresh from measured per-seed scale
  fields for both legs (wins, national, table, wave-5 unlocked /
  kills, median survival, standing).

## Pre-registered metrics

- PRIMARY: live-sim direct fallback firing — armed
  approachFallbackMarks >= 1 on at least one branch-split
  true-approach fight.
- LOOP SHAPE: no run of >= 3 identical blocked steps after the
  firing point (bus definition: consecutive post-mark calls with a
  stuck delta >= 1 while player AND monster positions are unchanged
  vs the previous call — with positions frozen the approach target
  is deterministic, so these are same-target blocked steps).
- SECONDARIES (both legs): split counts (old/flee/approach/other),
  true-approach loops, marks/waits/repicks/stuck per leg and per
  fight, frozen-wait loops, marked non-exposure fights, starvation
  totals + player-flagged, median survival, wall numbers.
- REPEAT DETERMINISM: not claimed for the panel (live sims diverge
  by design); the instrument's determinism is proven by the proof
  test's fixtures + smoke consistency (run totals equal the sum of
  per-call deltas).

## GO threshold (judge strictly)

Overall GO iff ALL hold:

(a) baseline-signal bar — baseline true-approach loops >= 1 on this
    band, split-classified. If zero, the verdict is
    SUBSTRATE-MISSING (not a fail, not a GO): the firing question
    cannot be answered on this band, and no armed-leg verdict is
    read.
(b) firing bar — armed marks >= 1 on at least one branch-split
    true-approach fight, AND no run of >= 3 identical blocked steps
    after the firing point on any marked true-approach fight, AND
    no frozen-wait loop (bound 10, above) on any marked
    true-approach fight.
(c) guardrail bar — all three halves pass (totals, player-flagged,
    median; see Guardrail decision above).
(d) zero policy/src behavior change (git diff for scripts/policies/
    competent.js and competent-approachfall-b.js is empty; the only
    new files are the bus, driver, summarizer, proof test, prereg,
    evidence, and corpus).

GO-THIN (pre-registered narrow case): (a), (c), (d) hold and the
firing bar's mark half holds, but the marked fight reaches no
strike within the panel horizon because the fallback broke the
step loop into waits WITHOUT yet producing a strike and WITHOUT
tripping the frozen-wait bound (waits < 10, geometry changed, or
repick pending). That is loop-shape broken, fight not yet fought:
THIN, stated as such.

NO-GO: (a) passes but (b) fails (fallback never fires on a live
true-approach fight — including the case where the loop breaks by
another mechanism: breaking WITHOUT firing is NO-GO for this arm's
claim, and the breaking mechanism must be named), OR (c) fails
(guardrails are metrics too, §14: a GO met with a guardrail
breached is NO-GO), OR (d) fails. A NO-GO on (b) is a verdict on
the live-firing claim for this band, NOT automatically a kill of
the fallback mechanism (the replay already proved the mechanism
fires on a true-approach geometry). A guardrail-only NO-GO is NOT
a kill class (§14a has none for it): record it as NO-GO (guardrail
breach) — mechanism alive, variant blocked — do not force it into
CONCEPT-DEAD. Kill taxonomy (§14a) is assigned at verdict time
from the failure mechanism found.

## LANDING RULE (stated in the prereg)

- On GO: the arm lands the default flip — the approach-fallback
  gate(s) ON by default in competent.js — with [needs-eyes] in the
  commit message, plus proof the flip reproduces the armed leg
  (the flipped default run on the same band shows marks >= 1 on a
  true-approach fight). The flip commit is separate from the
  instrument/evidence commits.
- On NO-GO: the variant stays gated-off; the arm lands instruments
  + evidence + corpora only. No default change of any kind.
- On SUBSTRATE-MISSING: nothing lands except instruments + evidence
  + corpora; the next run's job is a wider band screen, not a flip.

## BALANCED-PANEL NOTE (stated up front, §15)

A balance-panel.js compare is NOT run for this panel — it takes
panel.json.gz files from registry-policy runs, and the variant is
not a registry policy (the same reason the pilot, the confirm, and
approachbranch documented). The comparison is the pre-registered
per-seed table + split analyzer aggregates + direct-counter rollups
— never a fabricated panel compare. The balanced panel returns
review_required on zero-delta pilots — a known rule, not a verdict
override (§15: the panel is the instrument, never the judge).

## TELEMETRY DEVIATION CHECK (run-book step 10)

Attempt scripts/telemetry-check.js against this corpus only if the
corpus shape fits; the pilot/confirm/approachbranch all recorded
the same tool-shape refusal (sweep-recorder rows carry top-level
anchorCommit and are compared with sweep-compare tables, never
against the run-shaped scale-wall baseline). If it refuses the
recorder-corpus shape, record the refusal verbatim and report the
wall numbers directly from the measured per-seed scale fields.
--allow-recorder-corpus is NOT forced.

## Sense-test (pre-registered)

Read the armed true-approach fight transcript(s) end to end if
any fire. Sense GO requires the first post-mark turn to read as
something a person would do (try another way in via a reachable
tile, then fight; or wait for the beast to come when no tile is
reachable), not as a robot swapping one loop for another (re-picks
cycling the same failed tile, unbounded waits against a static
monster). A fallback that breaks the step loop only to install a
wait loop is a sense NO-GO even if (b) passes on the letter — the
frozen-wait bound above is the operational form of that sense rule.
If the panel produces zero approach steps, say plainly it
contributes no firing evidence; the firing claim then rests on the
replay, per the approachbranch design, and the panel judges
guardrails only.

## Scale-wall numbers

Reported fresh from measured scale fields for both legs (wins,
national, table, wave-5 unlocked/kills, median survival). If the
verdict is SUBSTRATE-MISSING, wall numbers are still reported
fresh — a 12-seed panel was run and its wall numbers are real.
