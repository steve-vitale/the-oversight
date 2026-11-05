# sim-approachlive-b — LIVE approach-fallback firing in sim + 12-seed guardrail re-test (Loop B run fleshout-loop-b-20261105T0930Z, winnability chain)

## Verdict

**SUBSTRATE-MISSING (per prereg bar (a)) — with the live firing PROVEN
and the guardrail breach REPLICATED.** Read the three parts separately;
each answers a different owed question, and none re-scores the others.

- FIRING QUESTION (prereg bar (a)): SUBSTRATE-MISSING. The panel's
  baseline leg (verbatim competent, current tree) staged ZERO
  true-approach turns in 62 exposures — not just zero loops, zero
  turns (old steps 0, split approach 0). There is no baseline loop
  for the armed leg to kill, so per the prereg no armed-leg GO/NO-GO
  verdict is read. This is not a fail of the fallback: the substrate
  the fleerepair corpus showed came from a DIFFERENT policy's
  trajectories (directional flee + flee repair, fallback OFF), and
  it does not reproduce under gate-off competent on the moved master.
- LIVE SIM FIRING (owed item 1): PROVEN — the first live-sim firing
  on record, by the policy's own direct counter. Armed 99606 seq 5
  (algorithm, day 92): marks 2, repicks 2, strikes 2. Armed 99609
  seq 8 (congregation, day 85): marks 1, then the fight ended fled.
  Both are branch-split true-approach fights. Two further marks fired
  on non-exposure fights (moderator wave 2; ducks wave 1, repick 1).
  Total armed marks 5, waits 0, repicks 3, frozen-wait loops 0.
- GUARDRAIL RE-TEST (owed item 2): breach REPLICATES. Totals armed 6
  vs bar baseline 1 + 2 = 3 (fail by 3); player-flagged armed 2 vs bar
  0 + 2 = 2 (pass, exactly at bar); median survival armed 83d vs bar
  0.8 x 108d = 86.4d (fail by 3.4d). This independently replicates
  sim-approachguard-b.md's 12-seed re-test on the same band (totals 7
  vs 3, median 83 vs 88.8, player-flagged 2 vs 2) on a different
  anchor. The variant stays blocked on cost; the mechanism is not
  killed (§14a has no guardrail-only kill class, and the combined
  variant carries all four gates, so the excess cannot be attributed
  to the fallback specifically).

Landing rule (prereg): on SUBSTRATE-MISSING the arm lands
instruments + evidence + corpora only. NO default flip. The variant
stays gated-off. The next run's job is a band whose BASELINE leg
stages true-approach turns (screen first — see Metric review), not
another re-test of this band's guardrails.

Convergence state: not converged — variant blocked (guardrail breach
replicated twice); live firing proven (new, this arm).

## Design (from the prereg, committed before any judged sim)

- Prereg: evidence/2026-11-05/sim-approachlive-b-prereg.md (commit
  f41015623, before any judged sim). Tooling in the same commit:
  direct-counter bus scripts/approachlive-bus-20261105.js, driver
  scripts/approachlive-driver-20261105.js, summarizer scripts/
  approachlive-summarize-20261105.js, proof scripts/
  test-approachlive-20261105.js (ALL PASS, 10 checks, re-run after
  the sweeps with no code change in between — proof stands for the
  swept corpus).
- Single-base judging: all 24 legs share anchor f4101562380d (the
  prereg commit; verified in every corpus file's anchorCommit).
  Baseline = scripts/policies/competent.js VERBATIM; armed =
  scripts/policies/competent-approachfall-b.js VERBATIM (four gates,
  DPS_RACE off). Policy-side only: ZERO src/js changes, no
  gate/price/deed/standing change, no default flip. `git diff HEAD`
  empty for both policy files, verified before and after the sweeps.
- Band: 99601-99612 (the fleerepair confirm band). Horizon 140d
  death-aware. Driver: copy of the approachbranch driver, new corpus
  dir evidence/2026-11-05/perseed-approachlive-b/, prefix
  approachlive-s, refuses to overwrite. Analyzer: branch split
  (gated = policy !== 'competent'), reused verbatim — never the
  unsplit APPROACH-STEP class. Summarizer: branch split + guardrails
  + direct-counter firing rollup + scale-wall fields, measured never
  hard-coded.
- DIRECT-COUNTER INSTRUMENT (new in this arm): the driver wraps
  policy.fight call-through (return value preserved, no RNG use, no
  mutating game call) and snapshots the policy's OWN ctx counters
  before/after every call. Attribution is by DELTA per call, keyed
  by fightId; the driver joins bus records to instrument exposures
  by fightId after runDays and embeds a per-exposure `fallback`
  rollup plus run-level `fallbackCalls`/`fallbackTotals`. 24 legs, 0
  instrument errors. Baseline marks 0 on all 12 legs (the counter
  reads 0 on the gate-off baseline, so it cannot be a proxy artifact).
- FROZEN-WAIT BOUND (pre-registered): 10 waits. A fight is a
  frozen-wait loop iff, after its first mark, waits >= 10 with zero
  repicks after the mark and no monster-geometry change after the
  first mark. The bound was never tested live: waits total 0 across
  the whole panel — the wait branch never ran in a live sim.
- BALANCED PANEL (§15): no balance-panel.js compare — the variant is
  not a registry policy (the same reason the pilot, the confirm,
  approachbranch, and approachguard documented). The comparison is
  the pre-registered per-seed table + split analyzer aggregates +
  direct-counter rollups — never a fabricated panel compare.
- TELEMETRY DEVIATION CHECK (run-book step 10): attempted; refused
  in the same tool-shape as the pilot/confirm/approachbranch/
  approachguard (see Metric review for the verbatim refusal).
  Wall numbers below are reported directly from the measured
  per-seed scale fields (scaleMeasured 12/12 both legs).

## Substrate check (§14b) — record passes, live baseline does not

Re-run of the approachbranch screen over the existing fleerepair
corpus (evidence/2026-11-04/perseed-fleerepair-a/, 40 files,
read-only): TOTALS files=40 old=38 flee=1 approach=29 other=8
oldLoops=5 trueLoops=4 — identical to approachbranch's screen.
Candidates with post-mark true-approach turns at HP >= 0.35: 99601
seq 4 (7 true-approach turns, 4 post-mark), seq 5 (7, 4), seq 6
(5, 2), 99606 seq 10 (4, 1). The substrate EXISTS in the record.

But the panel's own baseline leg — the live substrate bar — stages
ZERO of it: 0 old steps, 0 split approach turns, 0 true loops in 62
exposures over 12 seeds. The fleerepair corpus's fights happened
under the fleerepair policy (directional flee + exit-verified flee +
flee repair, approach fallback OFF); under gate-off competent on the
current tree those geometries never arise. Trajectories diverge as
master moves — the confirm's baseline (older tree) staged 18 old
steps / 9 split approach turns; approachbranch's 8-seed panel
baseline staged 0; this 12-seed baseline stages 0. The substrate is
a property of a policy x master x band combination, not of the band
alone. Bar (a) therefore fails, and the verdict is SUBSTRATE-MISSING
per the prereg — not a fail of the fallback, and not a GO.

## The live firing (owed item 1) — 99606 seq 5 in full

Armed 99606 seq 5, algorithm, day 92, player farid_ahmed's village,
fighter at full HP. The SAME fight sim-approachguard-b.md read
descriptively from the transcript alone ("rounds 2–8 trying to close
on a beast holding at (4,6), targeting tile (3,5) again and again,
then loses the fight") — this arm's direct counter now proves the
mechanism behind that reading. Exposure turns + bus calls align
by ORDER (11 calls, 11 turns, with a one-call offset at each end:
a pre-placement round-1 call with no exposure turn, and a final
strike with no bus call); the bus round labels run one ahead of
the exposure turn rounds (the bus reads the round after the call
returns, once the round has advanced — see Metric review), so the
counters below are attached by order, not by round number. The
round-1 call is a pre-placement call (player [0,0]->[4,1], delta 0)
with no exposure turn; the final strike (round 12) has no bus call.

| turn | round | HP | action | counters after (m/w/r/s) |
|------|-------|----|--------|--------------------------|
| 28 | 2 | 100 | tbPlayerMove(3,5) "No path there." | 0/0/0/1 |
| 29 | 3 | 100 | tbPlayerMove(3,5) "No path there." | 0/0/0/2 |
| 30 | 4 | 100 | tbPlayerMove(3,5) "No path there." MARK 1 | 1/0/0/3 |
| 31 | 5 | 100 | tbPlayerMove(6,2), lands (repick) | 1/0/1/3 |
| 32 | 6 | 100 | tbPlayerMove(3,5) "No path there." | 1/0/1/4 |
| 33 | 7 | 100 | tbPlayerMove(3,5) "No path there." | 1/0/1/5 |
| 34 | 8 | 100 | tbPlayerMove(3,5) "No path there." MARK 2 | 2/0/1/6 |
| 35 | 9 | 100 | tbPlayerMove(7,5), lands (repick) | 2/0/2/6 |
| 36 | 10 | 100 | tbPlayerMove(5,6), lands | 2/0/2/6 |
| 37 | 11 | 72 | tbPlayerStrike(m_0) | 2/0/2/6 |
| 38 | 12 | 35 | tbPlayerStrike(m_0) (no bus call) | 2/0/2/6 |

(m/w/r/s = marks/waits/repickSteps/stuckTurns, cumulative. The mark
fires ON the 3rd stuck turn, exactly as the code reads: turns 28-30
are the three counted stuck turns for mark 1; turns 32-34 for mark
2.)

Monster algorithm at (4,6), HP 455/850, never moves. The fighter
bumps the blocked tile (3,5) three times, steps aside to (6,2),
bumps the same tile three times from the new spot, steps aside to
(7,5), walks in to (5,6), and strikes twice — then dies (HP 100 ->
72 -> 35 -> dead; the algorithm hits hard). The fallback fired
TWICE in one live fight and broke the loop TWICE. It is not a
survival guarantee; it is a loop-breaker, and here it broke the
loop and the fighter still lost the fight.

Post-firing run, stated both ways (see Metric review): the bus
postFiringMaxRun is 3 — the turns 32-34 run (rounds 6-8) is the
run-up to MARK 2 on the post-repick geometry (player at (6,2), same
target tile (3,5) by the dx-first tie-break). The post-LAST-mark run
is 0 (repick moves on turn 35, then steps and strikes). Under the
prereg's letter ("no run of >= 3 after the firing point") the
turns 32-34 run counts; under the mechanism's intent (each mark
resets the 3-tolerance) it is the second firing's own tolerance
run, broken by that firing. Since no armed-leg verdict is read,
bar (b) is NOT judged here; the distinction is recorded for the
next run's pre-registration, not re-scored into this one.

Armed 99609 seq 8, congregation, day 85: three blocked steps to
(3,6) at HP 97/100, player (4,7), monster (4,5), marks 1 on round 3
(the 3rd stuck turn, turn 90 — the round-1 blocked step has no
exposure turn, same opening-pass shape as 99606) — then the fight
ended fled, before the blocked branch could re-pick or wait
(repicks 0, waits 0, postFiringMaxRun 0). A firing with no
follow-through: the mark fired on the last blocked turn and the
fighter left through the doors. Transcript quirk, disclosed: the
exposure's round-4 turn records the door-exit move to (4,6) rather
than a blocked (3,6) step, because the turn record opened after the
policy had already acted (the instrument's known opening-pass
shape) and then absorbed the escape; the counter reading (marks 1,
stuck 3 across the round-1..3 calls) is unaffected. Branch split
counts approachTurns 2 for this fight (turns 89-90 share target
(3,6)); it is still a true-approach fight by the pre-registered
definition (>= 1 branch-'approach' turn).

Non-exposure marks (reported, NOT primary — the primary metric
requires a branch-split true-approach fight, and these fights have
no exposure to split): armed 99601, moderator (wave 2), marks 1,
repicks 0; armed 99607, ducks_in_a_row (wave 1, 14-monster fight),
marks 1, repicks 1. The fallback also fires outside wave 4.

Firing totals: armed marks 5 (3 on true-approach exposures + 2
non-exposure), waits 0, repicks 3, stuck 9, frozen-wait loops 0,
fights with marks 4. Baseline marks 0 everywhere.

## Judged tables (12-seed panel, per-seed)

Baseline leg (competent verbatim):

| seed | days | end | TB exp | old | flee | appr | other | trueLoops | starv | starvP | maxW | standing |
|------|------|-----|--------|-----|------|------|-------|-----------|-------|--------|------|----------|
| 99601 | 116 | lost | 3 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 4 | 125 |
| 99602 | 73 | lost | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 120 |
| 99603 | 132 | lost | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 215 |
| 99604 | 140 | survived | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 150 |
| 99605 | 101 | lost | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 245 |
| 99606 | 119 | lost | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 235 |
| 99607 | 67 | lost | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 175 |
| 99608 | 67 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 100 |
| 99609 | 109 | lost | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 225 |
| 99610 | 107 | lost | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 150 |
| 99611 | 110 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 150 |
| 99612 | 45 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 70 |

Armed leg (approachfall variant):

| seed | days | end | TB exp | old | flee | appr | other | trueLoops | starv | starvP | maxW | standing | fbMarks |
|------|------|-----|--------|-----|------|------|-------|-----------|-------|--------|------|----------|---------|
| 99601 | 79 | lost | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 145 | 1* |
| 99602 | 60 | lost | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 150 | 0 |
| 99603 | 104 | lost | 9 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 4 | 225 | 0 |
| 99604 | 87 | lost | 6 | 0 | 0 | 0 | 0 | 0 | 2 | 1 | 4 | 175 | 0 |
| 99605 | 45 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 75 | 0 |
| 99606 | 94 | lost | 7 | 6 | 0 | 6 | 0 | 0 | 0 | 0 | 4 | 140 | 2 |
| 99607 | 77 | lost | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 200 | 1* |
| 99608 | 67 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 100 | 0 |
| 99609 | 87 | lost | 8 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | 4 | 135 | 1 |
| 99610 | 136 | lost | 8 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 4 | 175 | 0 |
| 99611 | 49 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 3 | 50 | 0 |
| 99612 | 87 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 3 | 120 | 0 |

(old/flee/appr/other = split counts over instrument-attached
exposures only; starv/starP = starvation deaths by the confirm's
counting rule; fbMarks = direct-counter marks in the leg, \* =
non-exposure fight only. Two legs per side have zero attached
exposures despite startCombat calls — the same instrument shape
the confirm reported. fbCalls per leg: baseline 4-597, armed
4-219; fbCalls counts every policy.fight invocation, including
non-player-turn calls that return immediately, so it is not a
turn count.)

## Prereg judgement (strict, bars as written)

(a) baseline-signal bar — baseline true-approach loops >= 1: FAIL.
    Baseline true loops 0 (and true-approach turns 0). Per the
    prereg, the verdict is SUBSTRATE-MISSING and no armed-leg
    verdict is read. The firing question, as framed comparatively,
    cannot be answered on this band.
(b) firing bar — NOT JUDGED (bar (a) fails). For the record: armed
    marks >= 1 on a true-approach fight, YES (99606 seq 5: 2;
    99609 seq 8: 1). Post-firing run: 3 by the bus's post-first-mark
    definition (the run-up to mark 2), 0 after the last mark.
    Frozen-wait loops: 0. The firing facts are reported; they are
    not converted into a GO, which would require (a) + (c) + (d).
(c) guardrail bar — RE-TEST REPORTED (owed item 2), not converted
    into a NO-GO verdict for this arm (the guard arm already owns
    that verdict on its own prereg; this arm replicates it):
    totals armed 6 <= baseline 1 + 2 = 3? NO — fail by 3.
    Player-flagged armed 2 <= baseline 0 + 2 = 2? YES — exactly
    at bar. Median armed 83d >= 0.8 x 108d = 86.4d? NO — fail by
    3.4d. The breach reproduces on a second independent 12-seed
    panel. The variant stays blocked on cost regardless of the
    firing question.
(d) zero policy/src behavior change: PASS. `git diff HEAD` empty
    for scripts/policies/competent.js and
    competent-approachfall-b.js, verified before and after the
    sweeps; anchor f4101562380d on all 24 legs.

Starvation deaths (real tele records, not a counting artifact):
baseline 99601 day 115 visjoin_71 (non-player). Armed 99603 day
103 app_mgpspj2k880; 99604 day 85 visjoin_72 and day 86 hassan_ali
(PLAYER-flagged); 99610 day 129 visjoin_122; 99611 day 20
gen_b0mmq68 (PLAYER-flagged — the early outlier the guard arm also
flagged; excluding it would not change the totals verdict, armed 5
still > bar 3); 99612 day 62 owen_smith. The guard arm's armed list
on the same band is nearly identical (7 deaths, same seeds/days
except an extra 99612 day 64 benoit_lambert) — the breach
replicates in detail, not just in totals.

## Scale-wall numbers (fresh — REPORTED, not judged)

| metric | baseline (12) | armed (12) |
|--------|---------------|------------|
| wins | 0 | 0 |
| national reached | 0 | 0 |
| table reached (sat, end-state tableDone) | 0 | 0 |
| table invited (end-state tableWaiting) | 0 | 0 |
| wave-5 UNLOCKED (seeds with maxWave >= 5) | 1 (99606) | 0 |
| wave-5 kills | 0 | 0 |
| wave-4 linked kills | 6 | 6 |
| wave-4 field fights (fieldCallsW4 total) | 63 | 39 |
| wave-4 spawns (spawnsW4 total) | 112 | 79 |
| median survival (days) | 108 | 83 |
| median standing (final) | 150 | 142.5 |
| survived to 140d | 1 (99604) | 0 |

Rank stayed 'village' on ALL 24 legs despite standing up to 245
(baseline 99605) — the same standing-without-rank pattern the
pilot, the confirm, approachbranch, and approachguard reported.
The scale wall is unchanged by this arm. Full seat still unwon,
wave-5 kills still 0.

Death-cause shares: combat dominates both legs (baseline 830
deaths: villager combat 353 / 43%, expedition 162 / 20%, combat
110 / 13%, the wild 94 / 11%, monster 58 / 7%; armed 785 deaths:
villager combat 330 / 42%, expedition 162 / 21%, combat 127 / 16%,
the wild 65 / 8%, monster 44 / 6%). Starvation is a small share in
both (1 vs 6) — the totals bar is a small-numbers guardrail, and
the breach is 6 real deaths against a bar of 3, replicated twice.

## Village assessment (plain words)

The village still mostly dies, and nothing in this arm changes
that arc: 11 of 12 villages are lost in the baseline leg
(survivor: 99604 at 140d) and all 12 in the armed leg, combat
deaths dominate, no win, no national, no table. What changed is
narrow and honestly bounded, and it is the thing four runs in a
row were owed: a fighter who really was stuck trying to reach the
beast — at full health, bumping the same blocked tile three times
— now, under the armed policy, steps aside and tries another way
in, twice, and gets to strike. That is the approach fallback doing
exactly what its card says, in a live sim, proven by its own
counter rather than by a proxy shape. The fighter still died —
the beast hits hard, and a loop-breaker is not a survival
guarantee — and the villages that carried the combined variant
still starved more and died younger, enough to breach the
pre-registered totals bar on a second independent panel. Whether
that excess is the variant's real cost or trajectory churn is
still not attributable to the fallback specifically (four gates
ride along), but it is no longer a one-run fluke: two 12-seed
panels on this band, two breaches, same shape. The blank filled
is the live firing (direct-counter, two true-approach fights).
The blanks documented are the live baseline substrate (zero
true-approach turns under gate-off competent on the current
tree — the next firing claim needs a band screened on its baseline
leg first) and the variant's cost (breach replicated, landing
blocked).

## Sense-test (SENSE-TESTING LAW): read end to end

99606 seq 5 (armed): bump, bump, bump into (3,5); step aside to
(6,2); bump, bump, bump into (3,5) from the new spot; step aside
to (7,5); walk in to (5,6); strike, strike; die. That reads as a
person: three failed tries is already patient, the fourth turn
tries another way in instead of hammering the wall, and once
adjacent the fighter fights every turn — including at HP 35 on
the last turn. No sense veto fires. The wait branch never runs
here (a reachable tile exists both times), so the frozen-geometry
wait-cycle caution remains untested in live shape — still an open
design question, not a veto on this firing.

99609 seq 8 (armed): bump, bump, bump into (3,6); mark fires;
the fighter leaves through the doors. That reads as a person
giving up and leaving after three failed tries — though the
leaving was the engine's door-exit, not a fallback wait, so the
fallback's own wait behavior still has no live transcript.

Baseline closest cases: there is no baseline approach step to
read — all 62 baseline exposures have zero approach turns. The
baseline villages die in ordinary fights, not in approach loops,
on this tree. That absence is the substrate finding itself.

## Metric review (for the NEXT run, not a re-score of this one)

- The post-firing run definition needs a second-mark refinement:
  the bus counts runs after the FIRST mark, so a second firing's
  own 3-tolerance run-up (turns 32-34 here) reads as a post-firing
  run of 3. The fight's shape is two firings, each breaking its
  run at exactly the tolerance. PROPOSAL: the next run's (b) should
  measure runs after the LAST mark, or runs that exceed 3 without
  a new mark — and pre-register which. Do not re-score this run's
  (b) (it was not judged) to accommodate it.
- Bus/exposure round labels are offset by one: the bus reads the
  round AFTER the policy call returns (once the round has
  advanced), while the exposure turn reads the round at turn-open,
  so a bus call labeled round R handled the exposure turn labeled
  round R-1. Counter-to-turn attribution must therefore join by
  ORDER, not by round number — the repick delta lands on the call
  after the repick action's turn, and the mark delta on the call
  handling the 3rd blocked step's turn. The summarizer's rollups
  (sums of deltas over call order) and firstMarkCallIdx are
  unaffected, and every total in this file was verified against
  the order-joined calls. A future consumer of the bus must not
  join on the round field.
- First-call pre-placement read: the first bus call of a fight can
  be a round-1 call with pre-placement positions (99606 seq 5
  call 0: player [0,0]->[4,1], monster (1,1)->(4,6), delta 0) —
  the fight object is still being placed when driveFights first
  invokes the policy, and the round-1 turn has no exposure turn.
  The rollup uses playerAfter/monsterAfter only, and deltas only,
  so no number is affected; but a future consumer of
  playerBefore/monsterBefore must not treat the first call's
  befores as live positions.
- The baseline-substrate vanishing is the run's methodological
  finding: a band's loop substrate does not transfer across
  policies or master moves. The fleerepair corpus (different
  policy) staged true loops; the gate-off baseline on the current
  tree stages none. PROPOSAL: future firing claims screen the
  BASELINE leg first (verbatim competent, current tree) and
  pre-register the band only if its baseline stages >= 1
  true-approach fight — a screen-first design, not a
  replay-the-old-corpus design.
- The guardrail bars are noisy at this scale, and this run proves
  it the same way the guard arm did: the SAME band's baseline
  starvation total moved 6 (confirm corpus, earlier master) -> 1
  (guard re-test) -> 1 (this run) with no policy change, while the
  armed total is 7, 7, 6 across the three panels. The armed median
  is 83d on all three. The breach replicates, but the bar's margin
  swings with the baseline's luck. The guard arm's proposal stands
  (report absolutes alongside the relative bar; any floor, e.g.
  max(baseline + 2, 5), needs a new pre-registration approved by
  the coordinator/Steve — not applied retroactively here).
- The wait branch still has NO live-sim exercise (waits 0 in 24
  legs). The frozen-wait bound (10) stands, untested. A future
  true-approach test on an all-adjacent-blocked board remains the
  way to exercise it — and must pre-register the bound, as this
  arm did.
- TELEMETRY DEVIATION CHECK (run-book step 10): scripts/
  telemetry-check.js REFUSED this corpus, verbatim: "telemetry-
  check: refusing recorder-corpus input: all 24 --current rows
  carry top-level anchorCommit, so they are sweep recorder rows,
  not runs. Recorder corpora are compared with sweep-compare
  tables, never against a run baseline here. Pass
  --allow-recorder-corpus for a same-shape recorder-vs-recorder
  compare, or --update-baseline to reseed a baseline from these
  files." --allow-recorder-corpus was not forced (it is for
  recorder-vs-recorder compares, not for a recorder corpus against
  the run-shaped scale-wall baseline). That refusal is a tool-shape
  rule, not a deviation finding; the wall numbers above are
  reported directly from the measured per-seed scale fields
  (scaleMeasured 12/12 both legs).
- check.js --quick was NOT run for this arm: it adds no src/js,
  policy-default, or game-code change (new scripts + evidence
  only), and the base's check profile is the coordinator/ship
  loop's, per the confirm's/approachbranch's precedent. The
  relevant proofs are green (below).
- Infrastructure notes (routine, for the coordinator): (1) the
  registry lock was contended for the whole run — a sibling
  worktree-reap.sh held REGISTRY.lock from 09:59 and a
  worktree-register queued behind it, so all three heartbeat
  attempts timed out at 20-25s (rc=124). No heartbeat landed this
  run; the tree was registered by the run and the panel did not
  depend on the heartbeat. Do NOT kill the sibling reaper to clear
  it. (2) Index-clobber phantom, routine, repaired once: after
  the safe-commit.sh prereg commit, the main index showed the
  just-committed files as staged-deleted while the worktree files
  existed untracked. Repaired via HEAD-blob update-index
  --cacheinfo; the commit was verified correct with `git show
  --stat` + empty `git status` + empty `git diff HEAD` before
  proceeding.

## Findings for the coordinator (do NOT edit hidden_files from this arm)

1. LIVE FIRING PROVEN (new, this arm — closes the oldest owed
   blank in the approach line): the fallback fired in a live sim
   on two true-approach fights (99606 seq 5: marks 2, repicks 2,
   strikes 2; 99609 seq 8: marks 1, then fled), plus two
   non-exposure marks. No future arm needs to re-prove that the
   fallback CAN fire live. What remains open is the COMPARATIVE
   kill claim (armed loops vs baseline loops on the same band),
   which needs a baseline-substrate band first.
2. GUARDRAIL BREACH REPLICATED (confirms sim-approachguard-b):
   second independent 12-seed panel, same band, different anchor,
   same shape (totals 6 vs bar 3, median 83 vs 86.4, player-flagged
   2 vs 2 exactly). The variant stays blocked on cost. Do not
   re-run this band's guardrails a third time without a new lever
   (standing rule: no new measurement arm on an already-proven
   constraint unless it carries a new lever to test).
3. NEXT BLANK (firing, now narrowed to the comparative claim):
   screen the BASELINE leg first — find a band (or a policy x band
   combination) whose verbatim-competent baseline stages >= 1
   true-approach fight on the current tree, then run the armed leg
   against it. The fleerepair corpus is not that band under the
   current master.
4. NEXT BLANK (cost attribution, for whoever owns the variant):
   the combined variant's starvation excess cannot be attributed
   to the fallback specifically (four gates ride along; the guard
   arm recorded the same limit). An attribution arm would need
   single-gate legs (approach-fallback alone vs flee-repair alone)
   — a new lever design, not another combined re-test.
5. CORRECTION CARRIED: none needed to prior files — this arm's
   numbers agree with the guard arm's on the shared band, and its
   firing proof extends (does not overturn) the guard arm's
   descriptive reading of 99606 seq 5.
6. Wait branch untested live: waits 0 in 24 legs. The frozen-wait
   bound (10) is pre-registered and waiting for an
   all-adjacent-blocked board test.

## Proof

`node scripts/test-approachlive-20261105.js` — ALL PASS (exit 0),
run before the panel and re-run after the sweeps with no code
change in between. Coverage: bus fixtures (snap defaults, mark +
repick + post-firing run 0, frozen-wait 11 vs bound 10 vs 9-under,
monster-move negates frozen, post-firing run 4, move resets run,
no-mark baseline); 2-day live smoke of BOTH legs into /tmp
(output shape, fallbackTotals == sum of per-call deltas,
instrumentErrors 0).

Sibling proofs, no regression (this arm changes no policy or src
file, but all five were re-run after the sweeps): `node scripts/
test-approachbranch-20261104.js` — ALL PASS; `node scripts/
test-approachbranch-replay-20261104.js` — ALL PASS; `node scripts/
test-approachfire-b-20261104.js` — ALL PASS; `node scripts/
test-approachfall-20261104.js` — ALL PASS; `node scripts/
test-approachconf-20261104.js` — ALL PASS.

Panel proof: 24 legs, 0 instrument errors, scaleMeasured 12/12
both legs; anchor f4101562380d on all 24 legs; per-seed tables
above are the summarizer's output.

## Files

- Evidence (this file): evidence/2026-11-05/sim-approachlive-b.md
- Prereg: evidence/2026-11-05/sim-approachlive-b-prereg.md
- Direct-counter bus + driver + summarizer + proof: scripts/
  approachlive-bus-20261105.js, scripts/
  approachlive-driver-20261105.js, scripts/
  approachlive-summarize-20261105.js, scripts/
  test-approachlive-20261105.js
- Panel corpus (24 files): evidence/2026-11-05/
  perseed-approachlive-b/approachlive-s996*-{baseline,armed}.json
- Panel summaries: evidence/2026-11-05/
  approachlive-panel-baseline.json,
  approachlive-panel-armed.json
- Sweep logs: evidence/2026-11-05/approachlive-sweep-baseline.log,
  approachlive-sweep-armed.log
- Variant used verbatim (untouched by this arm): scripts/policies/
  competent-approachfall-b.js, scripts/policies/competent.js
