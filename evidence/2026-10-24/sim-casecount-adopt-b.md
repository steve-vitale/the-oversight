# sim-casecount-adopt-b — full-pantry starvation case count, ADOPTED run

Run: oversight-flesh-out-loop-b-20261025T0335Z, arm sim-casecount-adopt-b,
axis food-economy. Adoption of the dead 0030Z run
(fleshout-loop-b-20261025T0030Z): its B1 corpus (94601–94632, complete)
and B2 partial (through 94653) were copied, never moved, into this
tree; the 0335Z run advanced B2 to 94655 before timing out; this
recovery re-ran the FULL B2 batch (94633–94664, deterministic
overwrite of the partial + 9 new seeds) and completed the batch
boundary. Worktree: `~/workspace/worktrees/sim-casecount-adopt-b`,
branch sim-casecount-adopt-b.

## PRE-REGISTRATION (binding; from the runner header + analyzer header)

- Policy competent only, 150d death-aware horizon, PLENTYDEPRI=1,
  DEPOSITGATE=1. Batches of 32 from 94601: B1 94601–94632, B2
  94633–94664, B3 94665–94696, B4 94697–94728. Hard cap 128 seeds.
- After each batch, count full-pantry villager starvation deaths in
  the corpus so far; STOP at the batch boundary once n >= 8.
  n < 8 at the 128-seed cap is NO-GO ON SAMPLE, not a refutation.
- FULL-PANTRY: death ctx pantryKcal >= 8000 AND freshDays >= 3.0,
  cause starvation, not the player. (Kcal-only deaths are context,
  never in the verdict denominator.)
- Classification (analyzer rules): A AWAY-RATION = awayAtDeath true OR
  away-share of window meal-days >= 0.5. B HAVEN-DISTRIBUTION = not A
  AND a haven meal-day in the window with drawn < 0.25 * needEst AND
  ate < 0.6 * needEst. C OTHER = neither.
- CASECOUNT-GO iff n >= 8 AND shareA >= 0.80. Pooled-with-prior-runs
  numbers are context ONLY, never the verdict.

## Verdict

VERDICT-RENDERED: CASECOUNT-GO — n = 8 at the B2 boundary (64 seeds),
shareA = 8/8 = 1.000.

The 8 qualifying deaths (all awayAtDeath = true, class A):

| seed | pantryKcal | freshDays | pantry items |
|------|-----------|-----------|--------------|
| 94605 | 25,750 | 5.3 | 3 |
| 94617 | 58,294 | 3.6 | 84 |
| 94629 | 16,765 | 8.1 | 12 |
| 94629 | 9,096 | 4.4 | 7 |
| 94632 | 46,902 | 99.7 | 7 |
| 94633 | 51,043 | 15.2 | 66 |
| 94635 | 41,337 | 11.3 | 48 |
| 94644 | 18,500 | 11.1 | 2 |

Zero haven-distribution (class B) cases, zero class C. The stopping
rule is met: B3/B4 were not run. This closes the question the 2330Z
confirm left open (16 fresh seeds, only 1 qualifying death, n >= 8
unmet): at a 64-seed sample the away-ration claim is confirmed, not
merely consistent.

Verdict-basis note (so this is never re-scored): batches are
cumulative per the runner's stopping rule, so the verdict rests on
the cumulative B1+B2 corpus (64 seeds). B1 was inherited from the
dead run and integrity-verified (32/32 files, all fields valid);
B2 was fully re-run by the adoption (deterministic overwrite +
completion). The B2-only count is 3 (94633, 94635, 94644) — reported
as context, NOT the verdict. Pooled with the two diag samples
(pantrystarve-b 5/5, fullpantry-diag-b 3/3), away cases stand 16/16.

## Village assessment (plain words)

Sixty-four villages on a 150-day clock with plenty-depri production
and the deposit gate both on. Most survived to day 150; waves 3–4
reached on 57/64, wave 5 on none, national/table/wins on none — this
band runs plain competent policy with no seat instruments, so the
wall numbers are substrate facts, not a regression (see telemetry).
The 8 full-pantry deaths are all travelers who died away from home
while their village pantries held 9k–58k kcal: food was home, the
villager was not. That is the away-ration mechanism in its cleanest
form — no haven-distribution failure anywhere in the sample.

## Proof

- `PLENTYDEPRI=1 DEPOSITGATE=1 SEEDS=<B1> DAYS=150 node
  scripts/test-fullpantry-casecount-b.js` => PASS 35 legs, including
  leg E live determinism (seed 94601 re-runs byte-equivalent on
  death/meal counts, no writes).
- B2 verification: 32/32 files present, seed/policy/env fields valid.
- Sweep summary `sweep-competent.json`: 64 rows, seeds 94601–94664,
  no gaps (batch-boundary prefix, as the analyzer requires).

## Analyzer C1 note (tool gap, not a corpus problem)

`node scripts/analyze-fullpantry-casecount-b.js` exits 2 on C1: it
checks the FULL PLANNED band (94601–94728, through unrun B4) against
other corpora, and B4's range overlaps awayration-cover-b's band
(94701–94732). B3/B4 were never run, so no actual collision exists:
a direct scan confirms run seeds 94601–94664 collide with NO other
corpus. Next run should scope C1 to run seeds, not the planned band.
The verdict above rests on a direct count under the analyzer's
published rules (gate + classification), not on the analyzer run.

## Telemetry deviation check

`telemetry-check.js --baseline .../scale-wall.json` vs the 64
per-seed JSONs, metrics national, table, wins, exiled. THREE LOUD
lines, all EXPLAINED as regime mismatch, baseline NOT rolled:
national 12 -> 0, table 16 -> 0, wins 16 -> 0. The scale-wall
baseline is winseat-regime-labeled; this corpus runs plain
competent policy with no seat instruments on a pre-seat substrate,
so 0/64 national/table/wins is the expected substrate reading, not
a regression. Wave reach (4 on 28/64, 5 on 0/64) matches the wall.

## Metric review

- The full-pantry question is CLOSED at n = 8: the away-ration claim
  is confirmed. Future full-pantry work should target the mechanism
  (awayration-size: low health + short away meal, pantry not the
  limiter), not recounting.
- C1's planned-band check should scope to run seeds (see above).
- B2-only vs cumulative counting is now documented explicitly so a
  later reader does not re-score the verdict on the B2 slice alone.
