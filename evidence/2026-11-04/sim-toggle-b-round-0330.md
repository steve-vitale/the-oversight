# Loop B run fleshout-loop-b-20261104T0330Z — coordinator evidence
Axis: scale-onramp (winnability-chain re-point, queue item 1).
Arm: sim-toggle-b — r118 arm-2 sub-lever toggle run. Merged locally, pending ship.

## Stale-lock recovery (0130Z run, completed by others + this run)
- 0130Z coordinator dead (lock 02:05Z, tree heartbeats 02:12Z, both workers
  done, no processes, fracchoice corpus static). This run did NOT overwrite
  its lock or merge its arms while the separate sim-firenarr-closeout lane
  was active: that lane merged firenarr (235c8ce25 prereg + de1271d6f
  deploy, GO 8/8 emission + 8/8 identity, [needs-eyes]) and cleared the
  0130Z lock; its claim retirement was already done when this run checked
  (the .DEAD.note on file now records both dispositions, written here).
- FRACCHOICE: worker INCOMPLETE (execution timeout in Stage 1 screen; band
  83601-83800 reached seed 83776, armed leg, 176 gatecover lines, no
  verdict). Branch sim-fracchoice-b (prereg + tools committed) and worktree
  left in place; partial screen corpus copied to
  hidden_files/orphan-fracchoice-20261104/ (85M) for adoption. Its partial
  corpus must not be re-judged; a later run may adopt and complete it.
- Loop A next job (fleerepair adoption, per 0215Z tracker entry) NOT touched;
  ability-use game-code builder lane NOT touched.

## Arm verdict: CALIBRATION FAILURE at Stage 0 — stopped per prereg
Worker branch sim-toggle-b, commits be4c7f1ac (prereg) + e903a3695
(Stage 0), rebased clean onto master (r121 tip), merged --ff-only, zero
src/js in the diff (variant code restored to base; killed variants leave
no trace). Full report: evidence/2026-11-04/toggle-b.md.
- Hunk map verified from d8f334da8, zero unmapped hunks: SIGDMG (sigW4.js,
  3 hunks / 5 changes), GEAR (fieldFights.js, 7 hunks), MORALE (1 hunk),
  TRICKHOLD (1 hunk). All four single-OFF variants + alloff construct
  cleanly; alloff byte-equal to pre-arm2 blobs.
- Stage 0 gate (pilot seeds 89702/89704/89705): V-full 3/3 vs r118
  (89702 won-lesser d107, 89704 scattered d61, 89705 won-lesser d104 uw4),
  V-alloff 1/3 vs r110 (89702 scattered d62, 89704 scattered d69, 89705
  won-lesser d155 uw5). Gate FAILS on the V-alloff leg. No Stage 1/2
  spend; no sub-lever CREDITED, DESCRIPTIVE, or NON-ATTRIBUTED.
- Mechanism (finding, not re-baseline): base drift since r110. Win-plan,
  villager-agency, and other landings already move 89702 and 89704 to
  early-hunger scatters (pantry 0, 1 alive) with arm 2 removed — and
  89704 scatters with arm 2 on too, so its r110 win is not recoverable
  by arm-2 removal on this base. Any single-lever flips measured here
  would confound arm-2 effects with intervening landings.
- Scale-wall numbers (3-seed pilots, NOT wall movement): V-full lesser
  2/3, scattered 1/3, full seat 0/3, wave-5 0/3, wave-4 2/3, median 104d.
  V-alloff lesser 1/3, scattered 2/3, full seat 0/3, wave-5 1/3 (89705),
  median 69d. National/table 0/3 both. In plain words: lesser seats
  still winnable, the full seat still unwon on the pilot, and removing
  arm 2 collapses two of three pilot villages into early hunger — but
  that collapse is drifted evidence, not an arm-2 verdict.
- Sense: divergent scatters end on the honest scattering line (pantry 0,
  1 alive). Nothing robotic flagged; no sim-findings appended.
- Telemetry deviation check: declared inapplicable by the worker
  (3-seed pilots vs the same stale, regime-unrecorded endgame baseline
  r118 already flagged); no compare fabricated. §15 panels do not apply
  to this matched-classification diagnostic by design.

## Infrastructure
- Registration ~2 min (registry contention milder than prior runs).
- Rebase onto r121 tip clean (evidence/scripts only, zero overlap).
- Worker-reported safe-commit index-clobber phantoms (2x) repaired per
  house lesson, commit contents verified. Worktree verified clean at
  closeout (status empty, diff HEAD empty). No push, no bump, no live
  verification (ship loop owns deploys).

## Next blanks, in order
1. Re-register the toggle pinned at r118's exact base (master ff1725835)
   with the gate re-registered as same-base V-full vs V-alloff — r110's
   classes cannot serve as a calibration target on any later base.
2. Fracchoice adoption (0130Z orphan; corpus at
   hidden_files/orphan-fracchoice-20261104/).
3. Fleerepair adoption stays Loop A's named next job — do not duplicate.

scale-onramp stays converging (NOT converged): full seat still unwon,
wave-5 kill still 0 in normal play. food-economy untouched (sibling
Loop B lane work this run was the re-pointed winnability arm).
Claim deleted; lock deleted.
Merged locally, pending ship (toggle-b be4c7f1ac + e903a3695;
coordinator evidence this file).
