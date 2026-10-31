# sim-strandfix-combined-b — PREREG (binding; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0117Z,
arm sim-strandfix-combined-b, axis food-economy. Worktree
sim-strandfix-combined-b. DIAG prototype: a new default-OFF
policy instrument, zero src/js changes, zero policy-default
flips, zero edits to any existing policy file. Sibling
strandfix arms (parallel round) are not imported or consumed;
the strand set is re-derived on THIS pinned base by this arm's
own OFF legs. The main tree is never touched; nothing is
merged by this worker (the coordinator merges).

## Pinned base

Worktree HEAD at prereg writing time:
52df7e732d7e31c8cb6aae92c778f00cdebf8294. The prereg commit
adds only this file, so every leg runs on pinned-base game
code verbatim, plus the new (uncommitted at leg time, committed
at closeout) prototype files listed under Instruments.

## Prior evidence read in full before designing anything

sim-kcalshort-b.md, sim-fedexile-b.md, sim-warmfuel-b.md,
sim-tickbudget-b.md, sim-strandbank-b.md (all
evidence/2026-10-30/). Priced facts the design answers to:

- ON strand (15215, nights 7-16): ticks-only 1, kcal-only 2,
  wood-only 2, both 5. kcal-short 7/10, every kcal-short
  evening at exactly 0 kcal (gap always the full 60).
  Guard strand (nights 7-9): ticks-only 1, kcal-only 2,
  rescued by a built bridge on night 10.
- Fed mornings never convert to wood-seeking (fedexile 0/4):
  the routine has NO wood move on the wake tile (0 adjacent
  sources, 8 whole-tile bigtrees, no bushes on the creek tile).
- Warmth spends 4 bridge logs (ON nights 9, 11, 12, 13).
  Protected-log counterfactual: first rescue night 10,
  sequential shortening 7, independently rescued 2 (nights 10,
  14); all 5 both-evenings stay stranded even with all 4 logs
  preserved (kcal is 0 on every one).
- Ticks: 8 ticks-short evenings; day 7 on all 4 legs is
  ROUTINE-ONLY (waits 384 + routine 81 = 465, 49 short, bridge
  wood in hand, 2254 kcal, no morning behavior fires);
  press-decisive stranding is 1 evening (guard-variant
  day 10). Budgeting the press alone still strands day 7.

## The prototype (scripts/policies/strandfix-combined-diag.js)

Default OFF (STRANDFIX=1 arms; STRANDFIX=0 delegates
untouched). On an actionable stranded field morning
(previous loop-day woodcarry record: still-refused creek
evening, villager awake in the field, not in combat, not
game-over), in order:

(a) JOINT MORNING RECOVERY, kcal first. If the sensed
window holds a known food species (plant/bush, assigned,
plantKnown), press forage + eat (17 ticks, engine prices).
Then wood-seek: walk the tile by SENSED exploration to a
standing cell adjacent to a sensed tree/bigtree and fell it
(96 ticks, 80 kcal, engine yield 4-6 for bigtree), or clear
a sensed adjacent bush (+1 wood, 32 ticks, 40 kcal) when
the deficit is exactly 1 and felling does not fit the
budget. PERCEPTION: the planner sees ONLY the union of 3x3
windows around cells visited this morning (wake cell plus
every cell actually stepped on). A bigtree the villager has
not walked near does not exist to the planner. The evening
bridge is woodcarry's existing evening step (4 logs /
60 kcal / 96 ticks); morning gains flow into it unchanged.
This file takes no evening action and imports no sibling
arm file (press logic is re-implemented here, not imported
from pressb-diag.js).

(b) TICK PRESERVATION (guardrail, stated honestly). Morning
actions are budgeted against TICK_RESERVE = 136 ticks left
(bridge need 96 + routine allowance 40, covering the
observed non-day-7 routine spend of 17-33 ticks). An action
fires only if projected ticks-left after it stays >= 136.
On a 128-tick morning the allowed spend is negative, so the
prototype does NOTHING tick-costly. This guardrail CANNOT
fix day 7: day 7 has no morning behavior to budget (press
skips 'prev-not-stranded', the hole is routine + waits with
no morning lever), and no claim to the contrary will be
made. What (b) guarantees, and what is measured, is that
the prototype never CREATES a ticks-short evening: a fell
that would eat the bridge reserve is deferred, not forced,
and every deferral is recorded.

(c) PROTECTED BRIDGE LOGS, live. The driver constructs
woodwarm with restraint R1 when STRANDFIX_PROTECT=1 (a
landed woodwarm option, not an edit): the warmth fire acts
only when the pack holds >= 5 logs, so logs 1..4 — the
bridge reserve — are never spent on strand nights. DEVIATION
FROM THE WARMFUEL COUNTERFACTUAL, disclosed here: warmfuel
held fire kcal at observed values (failed attempts still
cost 70 kcal); live R1 suppresses the attempt entirely, so
failed-fire kcal (and post-decision fire ticks) are also
saved on strand nights. The protection-only leg measures
the live effect against warmfuel's sequential prediction
(strand -> 3 still nights, bridge night 10); exact
reproduction of the counterfactual is NOT expected and is
NOT a bar (the counterfactual is accounting, not a live
leg). The exact-reproduction bar applies only to the
instrument-OFF leg vs the fresh baselines (see Det-gate).

## Substrate (all legs, asserted FATAL by the drivers)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, DAYS=30, seed bank
15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376,
15439. Death-aware horizon: the 30d ceiling IS the strand
substrate (the strand cycle 7-16 sits inside it); dead
villages stop simulating (+10d tail max is a harness
property, not a horizon extension). Detour envs forbidden
(COMPETENT_EVENING_DETOUR, COMPETENT_STANDING_HOME,
COMPETENT_ROUTE_AROUND, COMPETENT_TRIPHOME_ROUTE_AROUND
must not be 1). PRESSB must not be 1 (the strandfix driver
never wires pressb).

## Legs

Driver: scripts/strandfix-combined-trace-b.js (adapted from
tickbudget-trace-b.js: strandfix stack outside woodwarm,
restraint option, kcalshort pantry/pack snapshots, strandfix
records on evening rows; adaptation delta in its header).
Fresh baselines: scripts/woodday-trace-b.js verbatim,
OUTDIR override only, WOODDAY=0.

PILOT (gate-only, 8 seeds: 15003, 15009, 15091, 15211, 15215,
15220, 15221, 15337):
- P-ON-OFF: WOODWARM=1, STRANDFIX=0, KCAL=0, WOOD=0, PROTECT=0
- P-ON-FULL: WOODWARM=1, STRANDFIX=1, KCAL=1, WOOD=1, PROTECT=1
Pilot sniff (all must hold, else NO confirm spend):
(i) 8/8 seeds survive 30 days on both pilot legs, strandfix
+ driver errs 0; (ii) strandfix attempts exist on 15215
strand mornings on P-ON-FULL; (iii) >= 1 morning gain on
15215 pilot (press E > 0 or fell/brush wood > 0). If (iii)
fails the prototype is invisible and is KILLED AT PILOT.
Pilot files are never mixed into judged corpora. Any policy
change between pilot and confirm requires a prereg amendment
commit stating the change + reason, and a pilot re-run.

CONFIRM (10 seeds each; judged legs):
- FRESH-GUARD / FRESH-ON: woodday driver, WOODWARM=0 / 1.
- OFF-GUARD / OFF-ON: strandfix driver, STRANDFIX=0,
  KCAL=0, WOOD=0, PROTECT=0, WOODWARM=0 / 1.
- FULL-GUARD / FULL-ON: strandfix driver, STRANDFIX=1,
  KCAL=1, WOOD=1, PROTECT=1, WOODWARM=0 / 1.
- PROT-ON (protection only): STRANDFIX=0, PROTECT=1,
  WOODWARM=1. Morning components off; warmth restrained.
- MORN-ON (morning only): STRANDFIX=1, KCAL=1, WOOD=1,
  PROTECT=0, WOODWARM=1. Warmth unrestrained.
DETERMINISM: SEEDS=15215 re-run of FULL-ON into a separate
dir; the file must be byte-identical to the judged FULL-ON
15215 file.

## Primary metric + GO threshold (binding, judged exactly as written)

Primary metric: stranded nights on the strand seed(s) vs
control across guard + ON legs, with per-evening gate
decomposition (raw gates kcal / wood / ticks / warmth-log;
raw gates only, never the bridge skip reason alone).

GO iff BOTH hold:
(a) STRAND FALL: the ON strand (control ON strand nights,
expected 10 on nights 7-16) falls by >= 4 nights on the
FULL-ON leg (variant ON strand <= 6 nights). OPERATION-
ALIZATION (part of this binding prereg, same construction
as warmfuel's warmth-live clause): "majority of strand
legs" is computed over legs whose CONTROL strand length is
>= 5 — on this bank only ON qualifies (guard control strand
is 3 nights and cannot fall by 4 by construction). Guard
fall is reported alongside and is NOT in the denominator.
Under a literal both-legs reading the fall clause would be
unsatisfiable by construction; that reading is NOT the one
judged here, and the alternative verdict under it is
recorded in metric review, not substituted.
(b) BOTH-EVENING CONVERSION: at least 1 control-both
evening (ON evenings whose raw-gate class is both, i.e.
wood AND kcal failing with ticks passing — expected nights
11, 12, 13, 15, 16) is converted in the variant: the
variant evening on the SAME loop-day is rescued /
bridge-built. PREVENTION IS NOT CONVERSION: if the variant
strand ends (bridge) before the first control both-evening,
the both-evenings never occur in the variant trajectory and
clause (b) is NOT met, however large the fall in (a).
Conversions from single-gate evenings (wood-only, kcal-only,
ticks-only) count toward (a) only and never toward (b);
if every conversion is single-gate, the verdict says so
plainly and the prototype has not beaten the joint-failure
finding.

Verdict labels: GO (both clauses hold) / NO-GO (otherwise).
If (a) holds and (b) fails by prevention, the verdict is
NO-GO (prevention, not conversion) with the prevention
finding stated first in the evidence. If the pilot sniff
fails, the verdict is KILLED AT PILOT.

## Also reported (not GO clauses)

- Component attribution per converted/prevented evening:
  which morning gains (press net kcal, fell/brush wood delta)
  and which protection effect (warmth logSpent 0 vs control
  spend pattern) closed which gate deficit vs the control
  evening's gates. If conversions come only from single-gate
  evenings, say so plainly.
- Death-delay: first player:true death day per seed,
  control vs variant (CENSORED when no player death on
  either leg), for 15215 in particular.
- Wave reach (maxWaveUnlocked per seed), wall numbers
  (national/table/wins, wave reach, median survival —
  expected structural 0s on this 30d pre-seat substrate, said
  so, never claimed as a wall measurement).
- Morning conversion table: per strand morning, press fired?
  E / realized net, steps taken, fell/brush wood delta,
  tick spend, deferral reason (tick-deferred-fell/press/step,
  step-blocked, exploration-exhausted), evening outcome.
- Warmth ledger on FULL-ON and PROT-ON: acted / fireLit /
  logSpent per strand evening (protection must show 0 spends
  on strand nights, or the protection claim fails loudly).

## Det-gate (binding checks, in scripts/test-strandfix-combined-b.js)

- Instrument-OFF legs reproduce the fresh baselines EXACTLY:
  per-seed creek/still/rescued + strand nights on both legs
  (OFF-GUARD == FRESH-GUARD, OFF-ON == FRESH-ON). Any
  mismatch is a loud failure of the OFF leg, not a rounding.
- Protection-only leg is judged against warmfuel's
  sequential prediction (strand -> 3 still nights, bridge
  night 10) as a prediction with deviations explained — NOT
  as an exact-reproduction bar (see (c) deviation above).
- Determinism: FULL-ON 15215 re-run byte-identical.
- Proof suite green (pure unit tests + corpus checks).
- Tracked-diff guard: src/ clean; scripts/policies/ gains
  ONLY strandfix-combined-diag.js; no existing file modified.

## §15 balanced panel: applicability declared honestly

The official panel driver cannot express the strand stack
(strandfix policy legs + woodwarm restraint + raw-gate
evening classes on a single-seed strand). No official panel
run is claimed. The analyzer emits a paired compare .md
(control vs variant on identical seeds, per-evening gate
decomposition) attached to the evidence file — a paired
compare, never presented as an official panel run (same
standing as fedexile/tickbudget).

## Sense-testing law

Read transcripts end to end for: one converted evening (or
the preventing bridge evening if prevention is the story),
one still evening on FULL-ON, and one PROT-ON evening.
Judge meaning, coherence, relevance, consequences — never
just counts. The sense read must say whether the morning
walk + fell reads as a person working their way home or as
a robot farming, and whether the bridge evening's narration
connects the morning's work to the crossing.

## Metric review (to be completed in the evidence file)

Every evidence file carries a metric review section. The
prereg's known threshold-design notes, carried forward:
(1) the fall-clause denominator operationalization above
(literal both-legs reading unsatisfiable by construction);
(2) prevention vs conversion (clause (b) is strict
same-day by design — if the evidence argues prevention
should count, that is a revision proposal for the NEXT run,
not a re-score of this one); (3) the tick-reserve value
136 (96 + 40) is a design parameter, not a measured
constant — if the confirm legs show routine spend above 40
on strand days, the reserve must be revisited for the next
run, not adjusted mid-run.
