# Loop B 1735Z — scale-onramp / winnability chain: tendfloor-guard adoption NO-GO + tendbelow PILOT GO (merged locally, pending ship)

Run: fleshout-loop-b-20261104T1735Z. Axis scale-onramp (winnability-chain
re-point). Loop A live on food-economy throughout (1647Z claim at run
start, then 1836Z claim exphurt-24 + bankretain-rerun) — NOT touched.
No gate/price/deed change in either arm. No push, no bump, no live
verification (ship loop owns deploys).

## Run-start recovery

Stale-lock recovery: the previous Loop B lock (1434Z, created 14:34Z)
was 2h55m old at run start (>90-min fallback) and its tree heartbeat
was 71 min stale (>15-min guard), with no processes from that run —
dead by the body rules. Lock deleted, 1434Z claim retired to .DEAD.
Its tendseason arm had already landed (71041af7d, noted in the 1445Z
entry); its tendfloor-guard arm was stranded and is adopted here as
arm 1. Pre-flight: main tree clean, disk 28%.

## Arm 1 — sim-tendfloor-guard-adopt-b: ADOPTED, verdict NO-GO

Adoption of the dead 1434Z run's floored tend-through confirm
(prereg 0f195fb86, instruments e533b4a2e, proof 45/45). The worker
recreated the stranded branch's 5 committed files byte-identical
(blob hash) on its own branch, read-copied the dead run's 31
per-seed files from the old worktree (never modified, never
released — the old tree/branch were left for the reaper's stale
handling), and re-ran ONLY the missing cell (armed 99232: 180d,
village-lost, global, maxWave 5, drops 2 / recoveries 2, 29 tends,
0 errors). No valid file overwritten (driver refuses overwrites).

Judged EXACTLY against the prereg guards (a)–(e), 16 seeds
99217–99232, 300d death-aware, baseline = tend-through verbatim:
- (a) No survival-band regression: FAIL — regressions 99224 (C→D,
  −7d) and 99225 (B→C, −6d).
- (b) Median death-day delta ≥ −5: PASS — 0 days.
- (c) Armed pooled hold-share ≥ baseline − 0.05: FAIL — armed
  0.916 vs baseline 1.000 (bar ≥ 0.950).
- (d) Wave-facing, at most one lost per wave: PASS — W4 7 vs 7,
  W5 1 vs 0 (gain).
- (e) Drop-count guard, armed ≤ baseline + 1: FAIL — armed 3 vs
  baseline 0 (bar 1).
Verdict: NO-GO. The floored tend-through must not be cited as the
tend fix or flipped on as a default.

Wall (confirm corpus, 16 seeds/leg): wins 0/16 both legs; table not
instrumented (stated, not faked); end-state scaleRank baseline
village 6 / regional 6 / global 4 / national 0 → armed village 6 /
regional 4 / national 1 (99230) / global 5; wave unlocks (maxWave)
baseline ≥4 on 9/16, wave 5 on 0/16 → armed ≥4 on 8/16, wave 5 on
2/16 (99219, 99232); ever-facing wave 4 baseline 7/16 → armed
7/16, wave 5 baseline 0/16 → armed 1/16 (99219); median/max
survival baseline 71d / 153d → armed 83.5d / 180d; all 32 villages
village-lost, no band-A seed; combat dominates deaths (baseline
villager combat 47.9%, armed 46.1%); starvation flat at 25 deaths
each — the floor did not move starvation; ready days baseline 0 →
armed 8 (all on 99232); tend totals baseline 497 → armed 185
(−63%), armed floored-allowed tends 72 (nonzero: the floor fired).
Baseline-collapsing seed count = 0, so the floor-on-a-collapsing-
seed question (the actual 0930Z question) stays untested on this
band; the floor instead created drops where baseline held (99229
collapses day 72 after a 16-day below-floor gap at pantry 2,592;
99232 flickers with two recovered drops).

Uncertainty reported, not resolved: 67 armed tends carry a ≤13,500
snapshot pantry despite the floor gate — attributed to snapshot
timing (last daily snapshot vs the weekly tend decision),
documented in the arm evidence's metric review with a next-run
fix proposal. It does not change the verdict (guards (a), (c),
(e) fail on band-independent counts).

Commits: worker a938120d0, rebased by the coordinator onto the
ship-bump master 3a32d492f clean, proofs re-run green (adoption
68/68, stranded 45/45), merged --ff-only as e20ba529c, proof
68/68 re-run on merged master. Tree released done-merged, branch
deleted, main tree clean. One safe-commit index clobber repaired
in-worktree via HEAD-blob cacheinfo (commits always correct).
Arm evidence: evidence/2026-11-04/sim-tendfloor-guard-adopt-b.md;
corpus evidence/2026-11-04/perseed-tendfloor-guard-b/ (32 files).

## Arm 2 — sim-tendbelow-b: PILOT GO (banked, no confirm)

Tend-through restricted to links below the seasoned bar (age < 30d
OR trust < 40), re-judged on a fresh band with the tend classifier
fixed to decision time (the outer tendLink wrapper reads the live
link in the policy's own call stack — the tendseason snapshot
mislabel class produced zero mislabels here). This does NOT
re-score or cancel tendseason-b's verdict on 99209–99216; the two
pilots are on different bands with different classifiers.

Pre-registered bars, 8 pilot seeds 91501–91508 (fresh-band
verified by the worker), 16 runs, 300d death-aware, baseline =
tend-through verbatim:
- (a) No survival-band regression: PASS — 0 regressions, two
  gains (91504 D→C, 91505 D→C).
- (b) Median death-day delta ≥ −5: PASS — 0 days (deltas −21,
  −8, 0, 0, 0, +3, +21, +28).
- (c) Pooled hold-share ≥ baseline − 0.05: PASS — armed 0.974
  vs baseline 1.000 (bar ≥ 0.950).
- (d) Wave-facing guard: PASS — wave-4 faced 6 vs 6, wave-5 0
  vs 0.
- (e) Drop-count guard ≤ baseline + 1: PASS at the edge —
  armed 1 vs baseline 0.
Insufficient-data triggers: none — 0 instrument errors on all
16 runs, 5 baseline diplomacy seeds, decision records matched
tend calls 16/16, armed decision-time seasoned tends 0,
below-bar tends 90, unknown 0.

The restriction bit hard: tend calls 363 → 90 (−75%), paid tends
150 → 81, paid kcal 230,272 → 131,364.

Named costs (not hidden by the GO): one drop — 91503 collapses
(last paid tend day 56, trust 62; 59-day gap; drop day 115 at
trust 41→36, pantry 0, day-115 rescue attempt paid 0 refused);
two end-state rung downgrades (91503, 91506 global → regional —
rung is reported, not a judged leg); one 21-day shorter life
(91506, 86 → 65, holds to death). Scope limit carried from
tendseason: this band's baseline had zero collapsing seeds, so
the collapsing-seed question is still untested.

Wall (both legs): wins 0/8; lost 8/8, survived-to-horizon 0/8;
end-state scaleRank baseline global 5/8 + village 3/8
(national+ 5/8) → armed global 3/8 + regional 2/8 + village 3/8
(national+ 3/8); wave-5 unlocks 0/8, wave-5 faced 0/8, wave-4
ever-faced 6/8 → 6/8, wave-4 unlocks 6/8 → 6/8;
readiness-5-ready days 0 both; median survival 88.5 → 77.5d,
max 116 → 125d; deaths 442 → 466, combat share 62% → 64%,
starvation 4 → 4. Table/Arc reach not instrumented (stated, not
faked). Sense-test caveat: drop narration names the drifting
fire but not tending/pantry as cause — causality is carried by
trust/tend numbers only; SAY_RE still doesn't match tendLink
lines.

Commits: prereg 53303dda9 (before any judged sim), instruments +
proof 642e5fa8f (67/67, zero src/js), pilot + evidence 8f4c265c9
(17 files, 16 per-seed JSONs). Rebased by the coordinator onto
master 9f5e85b7b (Loop A 1647Z evidence) clean, merged --ff-only
as 657ed5f3b, proofs re-run green on merged master
(test-tendbelow-20261104.js 67/67; analyzer re-judges GO).
Tree released done-merged, branch deleted, main tree clean.
Safe-commit index clobber hit all three worker commits, repaired
each time via HEAD-blob cacheinfo (commits always correct).
Arm evidence: evidence/2026-11-04/sim-tendbelow-b.md; corpus
evidence/2026-11-04/perseed-tendbelow-b/; policy
scripts/policies/leadcourt-tendbelow-b.js.

## Telemetry deviation check

ATTEMPTED on both corpora, REFUSED by the tool itself
(recorder-corpus input: all rows carry top-level anchorCommit).
No --allow-recorder-corpus workaround, no compare fabricated,
baseline NOT rolled, no LOUD lines, no investigation item —
same field-shape artifact as 0930Z/1030Z/1245Z/1330Z/1326Z.

## Infrastructure

- Worktree registration under load: the second tree's first
  registration died mid-checkout when its parent process was
  killed (half-checked-out tree, no registry entry); a manual
  registry append was then clobbered by a concurrent writer's
  read-modify-write (registry atomic replace is per-file, not
  cross-writer safe — do NOT hand-append entries while other
  registrations are in flight); a second script run failed on
  the branch-exists fallback path while its checkout vanished
  (concurrent reap prune during the slow checkout is the
  suspected race). Recovery that worked: delete the branch
  (verified on master, nothing lost), re-run the script for a
  clean first-add path, verify dir complete + status clean +
  registry entry present before spawning. Total registration
  delay ~45 min; no worker work was lost.
- Master moved twice under the run (ship bump 3a32d492f, Loop A
  1647Z evidence 9f5e85b7b); both branches rebased clean (zero
  file overlap), proofs green after every rebase and on merged
  master. One coordinator proof-filename miss (ran a
  nonexistent proof file first) caught and corrected by
  re-running the correct files — recorded here, not hidden.
- Loop A 1836Z (exphurt-24 + bankretain-rerun) live at closeout,
  NOT touched. Old stranded tendfloor-guard-b tree/branch left
  for the reaper's stale handling (uncommitted corpus now
  duplicated on master via the adoption).
- Re-point queue disposition: item (1) toggle done in prior
  runs (0330Z/0445Z); item (2) flee-repair done by Loop A
  (fleerepair-confirm GO, 0820Z); item (3) standing accumulation
  covered by the 0730Z standacc adoption (veterans blocker,
  diplomacy missing). This run took the 1330Z next blanks
  instead: floor-guard confirm (adopted, NO-GO) + below-bar
  sensitivity (PILOT GO).

## Scale wall (this run's judged corpora)

Confirm corpus (32 runs): wins 0, national end-state 0 baseline
/ 1 armed, wave-5 faced 0 baseline / 1 armed, wave-5 kills 0,
median survival 71d → 83.5d. Pilot corpus (16 runs): wins 0,
national+ end-state 5/8 → 3/8, wave-5 faced 0/8 both, wave-5
kills 0, median survival 88.5d → 77.5d. Full seat still unwon,
wave-5 kills still 0 in normal play.

## Next blanks, in order

1. Tendbelow CONFIRM on a third fresh band under the fixed
   decision-time classifier — the tie-breaker between
   tendseason's band and this GO band (coordinator's call).
2. Next diplo prereg: add a rung guard (91506's
   global→regional downgrade escapes all five legs) and
   pre-state median-of-days vs median-of-deltas (days-median
   fell 88.5 → 77.5 while the judged delta-median passed at 0).
3. Floor/below-bar on a baseline-collapsing band: screen a band
   for baseline-collapsing seeds FIRST, then re-test — both
   bands so far had zero, so the collapsing-seed question is
   still untested.
4. Carried: LIVE-SIM fallback firing (1326Z #1); 12-seed
   guardrail re-test of the approach variant on 99601–99612
   (1326Z #2); BELONG clear on a belongseek substrate
   (formation leg first); 99101 hold-beat re-finding per
   anchor; wave5faced label rename.
5. NO gate/price/deed arm follows. The floored tend-through is
   NO-GO — do not cite it as the tend fix. Tendbelow is the
   live tend lever (pilot GO banked, confirm owed).

scale-onramp stays converging (NOT converged): the tend lever
now has a pilot GO with a fixed classifier, but the confirm is
owed, the full seat is still unwon, and wave-5 kills are still 0.
food-economy untouched (sibling Loop A). Claim deleted; lock
deleted.
