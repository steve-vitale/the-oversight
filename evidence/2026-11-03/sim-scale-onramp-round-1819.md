# Scale-onramp round — Loop A run fleshout-20261103T1819Z (2 arms LANDED, merged locally pending ship)

Axis: scale-onramp (standing directive: the scale wall; topmost converging
axis, not live-claimed). Sibling Loop B live on food-economy (1630Z claim,
arms sim-awayration2-b + sim-streakfree-b) was NOT touched; win lanes,
gap lanes, and journey lanes were NOT touched. Rotation left at 3
(convergence work does not cycle it).

Base: run started at master 4d595ebe6. Gearbar rebased onto b8ea04cd9
(sibling gap-hidecraft, zero overlap); w4convert rebased onto 9d489bcd3
(sibling journey-establishment r82, zero overlap). Both rebases clean,
proofs re-run green after every rebase and on merged master.

## Pre-registration (shared band, both arms)

- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM, default env.
- Seeds: 99101–99108 — the SAME band as the vetbar pilot/census
  (evidence/2026-11-03/sim-vetbar-a.md), so gear and conversion numbers
  pair with vetbar's veteran numbers at band level. Caveat proven by
  arm 2 (below): pairing is band-level, NOT trajectory-identical —
  the base moved since vetbar, so identical seeds no longer trace
  identical villages.
- Horizon: 140 days, death-aware (dead villages stop simulating; never
  a fixed 200d).
- Hard limits honored by both arms: no readyDemand, t4/t5, or plentyCap
  change; no win-price or deed-gate change; no wild-router ally-join
  code; no field-fight damage/staying code; no national-standing code;
  no veteran-counting code; no Loop B food-economy code. Gearbar owns
  wear/equip reading; w4convert is diag-only (zero src/js) and changes
  no wearing code.

## Arm 1 — sim-gearbar-a: CLEAN KILL, no fix, no confirm

Prereg 570c0d175, instruments 4ec954720, pilot + evidence f52622f9f,
landing note e4af49bfb (rebased hashes; zero src/js). Proof
`scripts/test-gearbar-20261103.js` 16/16 on the branch, post-rebase,
and on merged master.

Per-seed gear bars (demands armored 4 / armed 6; end = last snapshot
with >=1 living fighter):

| seed | days | end | maxWave | end armored/armed | max armored (day) | max armed (day) | living end |
|------|------|-----|---------|-------------------|-------------------|-----------------|------------|
| 99101 | 71 | lost | 4 | 1 / 1 | 7 (42) | 12 (2) | 1 |
| 99102 | 108 | lost | 4 | 1 / 2 | 7 (63) | 12 (2) | 2 |
| 99103 | 85 | lost | 3 | 0 / 2 | 4 (24) | 11 (2) | 2 |
| 99104 | 97 | lost | 4 | 2 / 2 | 7 (78) | 12 (4) | 2 |
| 99105 | 100 | lost | 4 | 6 / 7 | 6 (37) | 12 (2) | 7 |
| 99106 | 95 | lost | 4 | 1 / 1 | 8 (31) | 12 (2) | 1 |
| 99107 | 80 | lost | 4 | 4 / 7 | 5 (66) | 11 (5) | 7 |
| 99108 | 71 | lost | 4 | 5 / 5 | 8 (67) | 12 (2) | 5 |

Phase 1 SUCCEEDS as a diagnostic: 0 instrument errors, gate == recount
on every daily snapshot (~700 total, 0 mismatch days), 0 worn-gear-missed
flags, every end shortfall fighter classified (0 unclassified).
Both gear bars are met transiently on 8/8 seeds; at end, armored met
3/8, armed met 2/8. End reason classes over 27 living end fighters:
armor meets 20, wears-below-demand 2 (one fighter at P14, a single point
short), owns-not-worn 5 — all five duplicate spares (pack copy of an
already-worn item or a weaker same-slot piece); armed shortfall
fighters: 0 on every seed. Owns-vs-wears at end (all seeds): armor worn
66 / pack 57 / stash 2 / communal 0; weapons total 63. Communal stash 0
at end everywhere; village wood 151–1395 (whittle never wood-blocked);
bark recipe known all seeds, hide 6/8.

Phase 2 NOT triggered: gate mismatches 0, worn-gear-missed 0, and the
persistent mechanism-class runs collapse on inspection — the
overwhelming majority are duplicate spares the mechanism correctly
leaves unworn, and all four genuine-improvement traces resolve within
a day (stormcloak P15 worn next day, ap 1→18; witness-coat P15 worn
next day, ap 5→17; scar wraps into an empty hands slot worn next day,
ap 14→24; good-boots arriving while away worn on return gear-up,
ap 27). No repro failure, so no fix, no confirm, and no balanced-panel
comparison fabricated (stated explicitly in the arm evidence).

Plain-words finding: villages do not fail readiness-5 for lack of
gear-making or gear-wearing — gear is plentiful and both bars are met
transiently everywhere. Bars decay as fighters die, and collapsed
villages (1–2 living) arithmetically cannot meet demands sized for a
full roster. The binding bars on seeds that get close are elsewhere:
99105 meets both gear bars with standing 195 but veterans 0; 99107
meets all four bars for five days but standing is 150, not the 199
the door needs — readiness-ready alone does not release, by design.

## Arm 2 — sim-w4convert-a: DIAG-GO, current anchor only

Prereg 5f3c6e182, instruments 142b78992, evidence 7442058d5 (rebased
hashes; diag-only, zero src/js). Proof
`scripts/test-w4convert-20261103.js` 8/8 on the branch, post-rebase,
and on merged master.

### The headline: the vetbar band does not reproduce — proven, not assumed

This arm's judged leg (competent verbatim, 99101–99108, 140d) gave
35 spawns / 23 turn-based starts / 5 field fights / 2 kills / 8 villages
lost / median 90d, vs vetbar's 71 / 37 / 33 / 5 / 7 lost + 1 survived /
median 111d. Cause proven by control: the UNMODIFIED vetbar census
driver at this anchor reproduces the new numbers exactly on all 8
seeds (days, end reason, spawns, TB starts, field fights, kills all
identical), and game code landed between anchors (src/js/win-plan.js
new, plus table.js, villager-agency.js, villager-objectives.js,
ledger.js via the journey-landing r74 rebase). Harness mode string
ruled out (seed alone feeds RNG; vetbar's own pilot vs census
matched). Consequence, binding on every later run: this split is the
CURRENT-ANCHOR split, not a re-description of vetbar's exposures, and
vetbar's 70 exposures must not be cited as the current baseline. A
calibration-gate proposal for the next prereg and a [open] entry in
`hidden_files/sim-findings.md` record this (entry added by the arm).

### Current-anchor split (28 exposures, 2 kills = 0.0714 kills/exposure)

Per-seed (spawns / TB / field / exposures / kills): 99101: 10/10/2/12/0;
99102: 5/5/0/5/0; 99103: 0/0/0/0/0 (no wave-4 activity, maxWave 3);
99104: 2/0/0/0/0 (2 spawns never fought, fate UNRECORDED); 99105:
3/0/3/3/0; 99106: 9/5/0/5/0; 99107: 3/2/0/2/2; 99108: 3/1/0/1/0.
Outcome classes: died 24, fled 2, kill 2; zero routed, monster-fled,
evaded, already-dead, unended, or unresolved. tbCalls == tbStarted
(23 == 23), so the census-vs-started definitional gap contributes zero.

- Fight type: turn-based 2/23 (0.087); field 0/5. All kills are
  turn-based.
- Party at start: solo 0/15; +ally 2/13 (0.154). By type: TB solo 0/14;
  TB +ally 2/9 (0.222); field solo 0/1; field +ally 0/4. Party is the
  only split with any kills.
- Lead gear: DEGENERATE — all 28 leads read armed AND armored
  (armorP 6–67, weapons stone knife to Phase blade). Ready-geared
  (armorP>=15 + armed) 2/23 vs not-ready-geared 0/5. Geared leads still
  lose 20/23 ready-geared fights: gear does not differentiate leads
  at this anchor.
- Monster: eater 0/5, algorithm 0/8, reunion 0/4, eulogy 0/5; suburb
  1/4, congregation 1/1, influencer 0/1.

### Killer-death split (second failure, judged separately)

Both killers on 99107, BOTH ALIVE at horizon end — no attrition failure
at this anchor (vs vetbar's 4/5 dead): sam_wilson, day 74, suburb, via
companion, alive; ursula_weber, day 76, congregation, via player,
alive. Causes UNRECORDED (no death events — still living); mandatory
vs voluntary arena participation UNRECORDED throughout, as
pre-registered. Notably 99107 reached readiness-5-ready days 76–80
(veterans 2/2, armored 4/4, armed 6–7/6, tricks 20/3) and still lost on
day 80; 99105 ends short on veterans alone.

Verdict DIAG-GO (current anchor only): 0 instrument errors, 0 orphan
TB ends, 0 unlinked kills, 0 dropped rows, 0 unclassified exposures,
0 unclassified killers; reconciliation explained (diverged-with-cause,
control-proven). No fix in this arm by design.

## Wall numbers (this run's judged corpora, current anchor)

Wins 0/8 on both arms. Villages lost 8/8 (w4convert leg); gearbar
median survival 90d (max 108). National / table: not instrumented by
these arms (they instrument readiness-5, the gate before them).
Readiness-5-ready days: 6 snapshots on 99107 (days 76–80, both arms
agree). Wave-5 unlocks 0/8, wave-5 faced 0/8, wave-4 faced on 7/8 seeds.
These are the current-anchor baseline the next arms measure against,
not a claim that the wall moved. Vetbar's numbers (median 111d,
5 kills, 4/5 killers dead) are the PREVIOUS anchor and must not be
pooled with these.

## Village assessment (plain words)

Picture eight villages playing competently for up to 140 days. All
eight die; the median village lasts 90 days. Their fighters are not
naked — armor and weapons are plentiful, both gear bars are met at
some point everywhere, and when a better piece turns up it is worn
within a day. What kills them is wave-4 fighting itself: of 28 fights
against wave-4 beasts, villagers win 2, both with allies beside them
and none alone, and 21 of 23 turn-based fights are lost outright.
The one village that does everything right — two living veterans,
full armor, full weapons, tricks to spare — still dies five days
after its door-ready week because its standing (150) is far from the
199 the door needs. Gear is solved; veterans are the remaining
readiness bar on the closest seeds; but the deeper wall is that
villages lose the fights that would make veterans, and die before
their standing climbs to the door.

## Sense-testing

Both arms read people-like behavior and flagged nothing robotic.
Gearbar: improvements worn within a day, spares carried, last
survivors found in good armor with the dead village's spares;
say-line samples coherent in-fiction, no gear-specific flag.
W4convert: named companion killing blow, succession death spiral on
99101 with engine-recorded causes ("the wild" / "monster" /
"sickness"); the sense-test failure, if any, is the opposite of
robotic — villagers fight, die, and are succeeded, and still the
village cannot bank veterans or survive to the door.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- Band reuse without a calibration gate is now a proven trap: the
  same seeds on a moved base trace different villages (median 90d vs
  111d). The NEXT prereg on any reused band must rerun the prior
  instrument on at least one seed at the new anchor before the judged
  leg, and must state whether its baseline is band-level or
  trajectory-identical. This run's verdicts stand on their own
  preregs; nothing here re-scores vetbar.
- Gearbar's prereg-literal owns-not-worn class should be refined to
  slot-wise gain before reuse (duplicate spares dominate it).
- W4convert's split (conversion per exposure AND killer survival
  judged separately) worked exactly as the vetbar metric review
  proposed; keep the two failures separate in the next arm's prereg.
- Per-exposure kill rate 0.0714 (2/28) numerically equals vetbar's
  5/70 — descriptive only, never pooled (n=28 vs 70, different
  anchors).

## Telemetry deviation check

Prescribed invocation run at closeout against the scale-wall
(WINSEAT) baseline with the w4convert per-seed glob: the tool REFUSED
the input ("recorder-corpus input: all 8 rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs"). No LOUD
lines, no metric deviation to investigate, baseline NOT rolled — the
same refusal class as prior runs, and a winseat comparison of
diagnostic instrument corpora would be a regime artifact in any case.

## Infrastructure

- Worktree registration stalled behind sibling registry activity:
  gearbar ~17 min, w4convert ~15 min, one heartbeat ~100 s. No lock
  forced, no sibling process touched; both registrations completed
  in order.
- Safe-commit index clobber hit all 7 worker commits (repaired via
  HEAD-blob cacheinfo each time, commits verified correct); no
  clobber on the coordinator commit — verified below.
- Master moved twice under the run from sibling lanes (gap-hidecraft
  b8ea04cd9, journey-establishment r82 9d489bcd3), zero file overlap
  with either arm; both branches rebased clean in their own
  worktrees, proofs green after every rebase and on merged master.
- check.js --quick NOT re-run: zero src/js in either arm, zero
  default flips, standing 280/7 pre-existing profile recorded by
  prior runs; both arms' own proofs green on merged master
  (gearbar 16/16, w4convert 8/8).

## Next blanks, in order

1. Turn-based lethality arm: TB lost 21/23 at this anchor. Coordinate
   with the win-fielddmg lane or charter a named TB arm; re-baseline
   first (calibration gate), and judge kills per TB exposure with
   party split kept.
2. Party arm via the win-allyjoin lane: kills only with allies
   (2/13) vs solo (0/15). The party lever, not a gear lever, is the
   live conversion lead.
3. NO gear-wearing arm (leads already geared; gearbar clean-killed
   it) and NO killer-survival arm (2/2 killers alive at this anchor).
4. Calibration-gate rule (above) adopted for all future band reuse.
5. Readiness-5 release re-measure after blanks 1–2, before any
   gate/price discussion (gates and prices stay untouched unless
   Steve orders otherwise).

scale-onramp stays converging (NOT converged): gear is proven
plentiful and correctly worn, veterans and TB lethality are now the
measured wall, but wins remain 0, the full seat remains unreached,
and wave 5 remains unfaced in normal play. food-economy untouched
(sibling Loop B lane). Claim deleted; lock deleted.

Merged locally, pending ship (both arms: gearbar clean kill +
w4convert diag-go). The ship loop owns version bumps, pushes, and
live verification.
