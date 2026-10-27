# Loop B round 2309Z — food-economy: Cattail band + (dried) path (measurement only)

Run: fleshout-loop-b-20261026T2309Z. Axis: food-economy (converging, NOT
converged). Loop A live on scale-onramp for the whole run (2141Z claim at
start, then 2317Z claim ammostorage + seq51gap, NOT touched) -> B worked
food-economy, taking the 2130Z next blanks (1) and (2), in order. Both arms
measurement only, zero src/js, no default flips, no game-code change.

## Pre-flight + race guard

- No B lock at run start. Loop A lock live at 21:41Z with its claim naming
  scale-onramp, so B took food-economy (the second non-converged axis),
  never the topmost.
- Main tree dirty at run start with loop A's untracked coordinator evidence
  (sim-scale-onramp-round-2141.md, modified 23:03Z — A actively landing).
  Per the body, B waited the 10-minute sibling-landing window instead of
  failing: at 23:19Z the tree was clean (A had landed 64089151e) and the
  run proceeded. Disk 26%. Reaper touched nothing live (active 7/16 at
  start, 10/16 at closeout with sibling A trees added).
- Master moved twice under the run before landing (ship-loop version bump
  b8f077706, journey-deepening r54 8ecaac395, zero overlap with either
  arm). Both branches rebased clean in their own worktrees, proofs
  re-ran green after every rebase, then merged --ff-only.

## Arm 1 — sim-cattailband-b (merged 98daee7a8)

DIAG-NO-GO, judged against its prereg (spoilvol legs quoted verbatim).
Substrate: paired reuse of the lqpersist band 9760–9767 (100d,
competent-nofeast), exactly as the spoilvol metric review prescribed.
Zero fresh seeds spent; spoilvol confirm reserve 9828–9839 untouched.

- Leg 1 det-gate PASS: SPOILVOL=0 vs 1 on seed 9761 byte-identical
  (inflow/mealdraw/deaths/wall); det-on run reproduces corpus 9761
  counts exactly (mealDraw 1464, inflows 266, deaths 2).
- Leg 2 sweep integrity PASS: removedNotSpoiled 0, keptSpoiled 0 over
  799 sweeps.
- Leg 3 appearance FAIL (bars it): Lamb's Quarters 1/8 (9762 only),
  Cattail 2/8 (9761, 9767) — bar is each >= 2.
- Leg 4 sink ratio UNMEASURED (leg 3 bars it). Pooled arithmetic
  (ratio 2.09 vs bar 1.50; share 0.842 vs bar 0.50) is reported in the
  arm evidence as supporting arithmetic explicitly NOT judged, since
  the LQ pool is a single seed.
- What WAS measured: Cattail sink on 9761 — 523,680 kcal in, 124,080
  eaten, 336,480 rotted in the sweep (64% of inflow), zero sweep
  violations. On 9767 the 2,880-kcal trickle is eaten almost entirely
  (0 swept): big pulses rot, small piles get eaten. Determinism:
  the re-run reproduces the lqpersist corpus inflow exactly (0
  differing channels on all 8 seeds) plus identical deaths and wave
  reach — paired reuse is proven sound, not approximate.
  (Dried)-family ledgers close (Cattail family residual -2,305 /
  0.4%, LQ family -560 / 0.1%) vs base-name residuals of -62,160 /
  -66,150.
- Sense: 9761 Cattail is a sawtooth, not a decline — pulses arrive,
  ~3k/day is eaten, whole-pile rot days (14k–32k) zero it repeatedly
  (days 25/28/31/58/72/75), arrivals rescue it next day. 61 "threw out
  spoiled stores" lines on 9761 (e.g. day 25, Chloe: "the smoke rack
  going cold") while the rack stays empty — voice without action,
  third sighting.
- Proof: scripts/test-cattailband-b.js green on the branch and
  post-rebase (leg-1 det-gate pair env-skipped on the rebase re-run;
  det-gate proven on the branch — rebase changed only version files
  + journey instrument, zero arm files).
- Wall (judged corpus, competent-nofeast, 9760–9767, 100d): national /
  table / wins 0/8; wave 4–5 0/8; wave reach 3/2/2/2/2/3/3/3; median
  survival 100d (all survived); deaths 18 (arena 6, monster 4,
  ambush 2, dehydration 2, wound 1, expedition 1, "big ugly" 1,
  "extended warranty" 1). Measurement profile, not a regression.

## Arm 2 — sim-driedpath-b (merged 2a2391492)

NO-GO, judged strictly against its prereg (no re-scoring). Substrate:
spoilvol pilot band 9820–9827 reused (100d, competent-nofeast).
Confirm band 9768–9779 NOT spent (pilot NO-GO forbids it).

- Leg 1 det-gate PASS (byte-identical, DRIEDPATH=1 vs 0 on 9820;
  reproduces corpus counts exactly: 255 inflows / 1249 mealDraw / 4
  deaths). Leg 2 coverage PASS: transformation events on 8/8 seeds
  (bar >= 7), linked post-kcal 100.0% (bar >= 95%), 893 events, 0
  unlinked, 0 player-preserve events.
- Leg 3 family closure FAIL: 0/8 seeds (bar >= 6; a seed passes only
  if ALL its focal families close), pooled |residual| 90.42% of
  pooled focal inflow (bar <= 1%). Leg 4 dried-channel closure FAIL:
  pooled |dried residual| 8.78% of pooled transformed post-kcal
  (bar <= 2%). Excluding the generic family still fails both bars
  (pooled 1.18%, dried 9.43%) — the NO-GO is robust, not a
  generic-family artifact.
- The transformation path itself is captured completely: base-channel
  ledgers close exactly (baseResidual 0) on 17/31 families, and the
  calibration family improved tenfold (9826 Lamb's Quarters 0.11% ->
  0.01%, residual -50 kcal; Purslane 9827, Burdock 9826, Muscadine
  9822 close exactly at 0). The ledgers fail because two more
  pantry doors are unrecorded: (1) stockSurplus (game.js ~28794)
  pushes villager shared surplus directly into the pantry as
  'Foraged food' 200-kcal units — this CORRECTS spoilvol's
  explanation, since opening stock is actually staples (Rice 13,000,
  Dried beans 12,000, Dried meat 8,800, Canned soup 7,500, Peanuts
  5,950 = 47,250), not Foraged food; (2) dried stock vanishes via
  direct pantry eating, alien pantry raids, and Light Fingers lifts,
  all bypassing pantryDraw (worst case: 9823 Burdock dried, 15,806
  kcal gone with 0 swept).
- Sense: day 12, seed 9820 — cook Megan takes Expedition haul (8x500
  kcal, spoil day 14), keeps 6 slabs fresh for dinner via the reserve
  split, converts 2 slabs to "Expedition haul (dried)" at 495 kcal
  each good to day 52, loss 10 kcal (preserver rate). The racks are
  basically one person's job per village (Wilhelm 139/139 on 9825;
  Hannah 101/107 on 9827) — a single-cook dependency worth noting.
- Proof: scripts/test-driedpath-b.js green on the branch and
  post-rebase (legs recomputed post-rebase: leg3 0/8, pooled 0.904,
  leg4 0.0878 — matching the NO-GO verdict).
- Wall (judged corpus, competent-nofeast, 9820–9827, 100d): national /
  table / wins 0/8; wave 4–5 0/8 (waves 2/2/3/2/3/3/2/2); median
  survival 100d (all censored); deaths 38 (sickness 17, monster 5,
  ambush 4, wound-that-wouldn't-close 4, arena 3, contest 2, sunback
  1, alien 1, dehydration 1). Rank stayed village on all 8 seeds.
  Measurement profile, not a regression.

## Village assessment (plain words)

Two food-ledger stories, both measured rather than guessed. First,
Cattail does not fade away — it arrives in big piles, the village
eats a thin daily slice, and the rest rots in whole-pile clear-outs
until the next arrival rescues the pile. The sink is enormous and
real (two-thirds of what arrived on 9761 rotted), but the comparison
the spoilvol arm wanted — Cattail's rot share against Lamb's
Quarters' — still has no band to run on, because the two plants
almost never grow in the same villages. Second, the smoke racks work
and are now fully recorded (every dried conversion captured, base
ledgers exact), yet the pantry books still will not close, because
food also slips in through a sharing door and slips out through
mouths, raids, and theft that no recorder watches. The village is
not losing food mysteriously; it is losing it through doors nobody
instrumented yet. No villager behavior in either corpus reads
robotic on the sampled records — the recurring blank is voice
without action at the rack (warnings while food rots), seen now on
three arms.

## Metric review (MEASUREMENT.md section 14)

- Both verdicts stand under their own preregs; nothing was re-scored.
  Cattailband's pooled ratio arithmetic is explicitly NOT a verdict.
  Driedpath's NO-GO survives excluding the generic family.
- Cattailband metric review (carried, not applied): the pooled
  spoil-sink comparison as barred may have no band to run on
  (Cattail and LQ grow on disjoint seeds on every observed band:
  Cattail 9761/9767 vs LQ 9762; Cattail 0/8 on the fresh spoilvol
  band; Cattail 0/12 on the lqpersist confirm band). The next arm
  needs either a both-grow band screened under its own prereg, or
  a re-barred single-seed case-study metric.
- Snapshot-basis warning (cattailband): lqpersist's "Cattail median
  stock 3,600" is the post-sweep floor on this arm's basis, not the
  day-end median (20,040 here) — stock medians must name their
  snapshot basis when quoted.
- Bonus flips mid-run (0/2/6 blocks) — what flips
  preservation_instinct remains unrecorded (carried from spoilvol).
- Balanced panel (section 15): no panel comparison exists for either
  arm — no lever, no game-code change — the det-gates are the
  before/after comparisons, as spoilvol did.

## Telemetry deviation check

On both per-seed corpora: 3 LOUD lines each (national 12->0, table
16->0, wins 16->0) — the known SEATDRIVE=0 regime artifact class
(competent-nofeast pre-seat substrate vs the WINSEAT baseline).
Baseline NOT rolled, no investigation item. No exiled lines.

## Infrastructure

- Safe-commit index clobber hit both workers' commits (staged-deletion
  variant) — repaired via HEAD-blob cacheinfo each time, commits
  verified correct, worktrees clean. No clobber on the coordinator
  commit (verified below). No EPERM flap blocked this run. No ref
  surgery performed.
- check.js --quick NOT re-run (zero src/js, zero green-list files,
  sibling loop A live); attributable evidence is the arm proofs on
  merged master.
- Worktree registration slow (~7.5 min for both trees, sibling git
  contention) — delay, not failure.

## Next blanks, in order

1. A both-grow (Cattail + Lamb's Quarters) band screened under its
   own prereg, or a re-barred single-seed case-study metric, for the
   spoil-sink comparison — do NOT spend another fresh band hoping.
2. A stockSurplus-door recorder + direct-pantry-consumption recorder
   (NPC eating, alien raids, Light Fingers lifts) before any family
   ledger is judged closed again.
3. Garden-attributed deposits with zero garden harvest (deposit-path
   trace, carried); starting-stock draw order (carried);
   spoilage-boundary split, meal vs cook (carried); ~5,900 kcal
   non-draw removal day-82/83 (carried); presence-aware share bar +
   next diversity arm; plain-silenced indistinguishability; rule-R
   voice taxonomy rebuild; scholar-donation visibility (carried).
4. The rack voice-without-action blank (narration/behavior arm, not
   a numbers lever).

food-economy stays converging (NOT converged): the meal-draw record
is closed under the three-term equation, the (dried) path is captured
and the Cattail sink is measured, but the sink comparison is still
unjudged for lack of a both-grow band and the pantry books still do
not close for lack of two more doors. scale-onramp stays converging
(untouched; sibling loop A). Claim deleted; lock deleted.
Evidence: evidence/2026-10-26/sim-food-economy-round-2309-b.md
(coordinator) + sim-cattailband-b.md + prereg + corpus +
sim-driedpath-b.md + prereg + corpus. Merged locally, pending ship.
