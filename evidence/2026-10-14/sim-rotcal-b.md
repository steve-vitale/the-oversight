# ROT A/A CALIBRATION — fresh-rot noise floor (fleshout-b instrument)
2026-10-14 (run-b-20261014-0230) | axis: food-economy | instrument: sim-rotcal-b

## Context
The hungerdepth arm (evidence/2026-10-14/sim-hungerdepth-b.md) was NO-GO
on an absolute fresh-rot kcal guardrail (1.278x vs 1.15x bound) where the
+561k rot delta was dominated by ONE seed's longevity cascade (belo-11:
armed 180d vs control 98d — only 3 exemptions fired; mechanism bound the
direct effect at ~174k kcal, so the 589k delta was village-lifespan, not
mechanism). Its metric review assigns this run's job: the rot guardrail
should be per-villager-day (or per-day-alive) AND carry a p90 |Δrot| A/A
calibration, exactly as the throttle-aa run calibrated days and starvation
rate (evidence/2026-10-14/sim-throttle-aa-b.md). This run is that
calibration — NO game-code changes, instrument-only.

## Canon
docs/CANON.md read. No canon doc covers rot measurement instrumentation;
nothing here invents game canon. (Pre-run check recorded per canon rule.)

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sweep spend
- Question: what is the rerun noise floor of fresh-rot kcal on the
  food-economy control suite (landed throttle, no env gates), so a future
  rot guardrail can carry a calibrated p90 |Δrot| bound?
- Design: the SAME 16-run control suite run TWICE in separate node
  invocations — 8 seeds (11/22/33/44/55/66/77/88) x leadcourt/belongseek,
  180d death-aware (dead villages stop, +10d tail max), identical seeds both
  invocations. 32 runs total.
- Per seed+policy per invocation recorded: absolute fresh-rot kcal,
  fresh-rot per villager-day, fresh-rot per day-alive, starvation deaths,
  villager-days, days survived.
- Calibration: per-seed |Δ| between invocations for each rot form — mean
  |Δ|, p90 |Δ|, max |Δ| for absolute kcal, per-villager-day, per-day-alive
  (p90 convention matches throttle-aa: sorted[min(n-1, floor(0.9n))]).
  Bifurcating seeds flagged per the seed-88-class nondeterminism item:
  fight-heavy trajectories carry genuine rerun noise even post-detfix.
- Instrument-honesty: SMOKE=1 gate before sweep spend (fail loudly if
  policy-less); named-export policy unwrap — `const { leadcourt } =
  require('./policies/leadcourt')`, NEVER Object.assign({}, require(...))
  (sim-findings #69). Both invocations post-detfix verified (r26
  determinism fix landed on master as 46c8fbf1 — same code both sides).
- DIAGNOSTIC GO (pre-registered): >=14/16 seeds paired across both
  invocations AND the p90 |Δ| table published for all three rot forms AND
  a recommended guardrail form written for future runs. A "GO" means the
  calibration is publishable, not a lever landed.

## Method
scripts/measure-rotcal-20261014.js (A/A runner + calibration analyzer):
SMOKE mode gates policies; INV=a|b runs the 16-run sweep per invocation
(per-seed JSON to evidence/2026-10-14/rotcal-aa-perseed/, sweep logs
rotcal-a.log / rotcal-b.log); CAL=1 pairs invocations and publishes the
calibration table + recommended guardrail form. Rot instrumentation
matches hungerdepth's: classify at sweep time by foodState —
preserved/rendered keep, everything else rots fresh (diag-kcal-r8-20261012
classification).

## Instrument-honesty gate
- `SMOKE=1 node scripts/measure-rotcal-20261014.js`: ALL GREEN (8/8) —
  both policies unwrap to a real `daily`, the harness invokes it
  (meanCalls/day 4.5), and >=1 policy-origin deliberate act fires
  (policyActs=2132 both policies). The suite cannot run policy-less.
- Determinism fix: worktree HEAD includes 46c8fbf1 (r26 _cxSortIds
  contest determinism fix) — both invocations run the identical post-fix
  code. (Verified pre-sweep via git log.)
- Env-gate discipline: the runner REFUSES if HUNGERDEPTH, HUNGERXEMPT, or
  PRODTHROTTLE_OFF is set — landed-throttle control only, no levers.

## Results — invocation aggregates
16-run control suite × 2 invocations, landed throttle, no env gates,
identical seeds both invocations. Per-seed JSON:
evidence/2026-10-14/rotcal-aa-perseed/ (32 files); sweep logs
rotcal-a.log / rotcal-b.log.

| metric | invocation A | invocation B | A↔B ratio (A/A "effect") |
|---|---|---|---|
| fresh-rot kcal (total) | 2161.5k | 2210.5k | 1.023× |
| fresh-rot per villager-day | 1747.34 | 1658.31 | 0.949× |
| starvation deaths | 17 | 20 | — |
| villager-days | 1237 | 1333 | — |
| median survival | 100d | 123d | — |

Reading note: the AGGREGATE A/A ratio is quiet (1.023× absolute) — the
bifurcations mostly cancel in aggregate. But guardrails judge armed vs
control on paired seeds, so the honest unit is the PER-SEED |Δ| below.

## Calibration table — per-seed |Δ| between invocations (n=16 pairs)
All 16 seeds paired across both invocations (16/16 ≥ 14: diagnostic-GO
criterion 1 met). p90 convention matches throttle-aa:
sorted[min(n-1, floor(0.9n))].

| rot form | mean |Δ| | p90 |Δ| | max |Δ| |
|---|---|---|---|
| absolute kcal | 11,000 | 63,051 | 102,224 |
| per villager-day | 97.3 | 563.6 | 969.6 |
| per day-alive | 109.9 | 496.0 | 1125.7 |

Relative |Δ| (fraction of invocation-A value):

| rot form | mean rel |Δ| | p90 rel |Δ| | max rel |Δ| |
|---|---|---|---|
| absolute kcal | 0.437 | 0.316 | 6.605 |
| per villager-day | 0.161 | 0.335 | 2.222 |
| per day-alive | 0.237 | 0.507 | 3.141 |

Diagnostic-GO criterion 2 met: p90 |Δ| table published for all three
forms. (Criterion 3: recommended guardrail form, below.)

Survival noise for reference: mean |Δdays| = 8d, p90 |Δdays| = 35d,
max 82d — notably LARGER than the throttle-aa calibration's p90
|Δdays| = 3d. The noise floor is suite- and run-dependent; this suite
(180d death-aware, leadcourt/belongseek) bifurcates more. Do not reuse
throttle-aa's 3d blindly for rot-suite judgments.

## Per-seed notes — bifurcations
Distribution is BIMODAL, not Gaussian: 12/16 pairs byte-identical
(Δ=0), 1 pair trivial drift (belo-44: Δ=414 kcal at identical 180d —
not a bifurcation), 3 pairs genuinely bifurcated. The detfix narrowed
but did NOT eliminate rerun noise: post-46c8fbf1, identical seed+policy
still takes a different trajectory on ~1/5 of seeds. Suspected residual
source (not proven this run): Date.now()-embedded villager IDs are still
ordered by ID string somewhere outside contests — r26 fixed only
_cxSortIds. Flagged for the findings backlog.

- **belo-11** (the hungerdepth cascade seed): A d=98 rotF=15,477 (vd=61,
  village-lost) vs B d=180 rotF=117,701 (vd=144, SURVIVED).
  Δdays=82, ΔrotF=102,224, relVd|Δ|=2.222. This is the exact seed where
  the killed arm's +589k delta concentrated (armed 180d vs control 98d
  there). The A/A shows the suite takes that trajectory split ON ITS OWN —
  the "longevity cascade" direction exists in the control, no lever needed.
- **lead-33**: A d=90 rotF=199,723 vs B d=125 rotF=136,672. Δdays=35,
  ΔrotF=63,051, relVd|Δ|=0.335. The p90-DEFINING pair: 15th order
  statistic in a 16-pair set, so the whole calibrated bound hangs on this
  one seed's bifurcation.
- **lead-11**: A d=163 rotF=151,185 vs B d=152 rotF=161,499. Δdays=11
  (flagged by the dDays>10 rule), ΔrotF=10,314 — but relVd|Δ|=0.002:
  the rot RATE barely moved across an 11-day survival bifurcation. This
  is the strongest evidence in this run that the per-villager-day form
  is the honest guardrail: survival bifurcated, rate didn't.

## Recommended guardrail form (calibrated)
Primary (diagnostic-GO criterion 3 met):
  armed_rot_per_vd ≤ control_rot_per_vd × **1.335**
  — one-sided; multiplier = 1 + p90 rel|Δ| (0.335) from this calibration.
For reference only (the absolute form is not recommended — see judgment):
  armed_rot ≤ control_rot × 1.316 (1 + p90 rel|Δ| = 0.316).
Design note for the next run: re-calibrate when the suite changes
(seeds, policies, horizon, or any post-detfix code motion); 1.335 is a
calibration OF THIS SUITE, not a constant. And judge on paired seeds —
aggregate ratios hide bifurcation (1.023× aggregate vs 1.335 p90 seed).

## Are absolute-kcal guardrails ever honest for longevity-touching levers?
Judgment, with numbers: NO, not as a ratio guardrail — and the
hand-set 1.15× was ~4× tighter than the suite's own noise.

- The hungerdepth arm missed at absolute 1.278× vs the hand-set 1.15×
  bound. This calibration says the suite's own p90 relative |Δ| on
  absolute rot is **0.316** — ratios up to 1.316 are the A/A noise floor.
  The lever's "miss" (1.278) sat INSIDE the noise floor of the
  instrument judging it. The bound was never honest.
- Rate normalization helps but does not rescue the verdict: per-vd
  miss was 1.186×, per-day 1.195× — both above 1.15, but the calibrated
  per-vd p90 noise is **0.335** (ratio 1.335): even the rate-normalized
  miss was plausibly noise, not lever effect. Under §14 the NO-GO
  stands (pre-registered, never re-scored) — but the NEXT run's
  guardrail must be the calibrated one, not the hand-set one.
- Absolute rot scales with villager-days by construction (belo-11: more
  days alive → more rot, no lever involved). For any lever that touches
  longevity — food, starvation, combat survival — absolute-kcal
  guardrails punish survival itself. Use per-villager-day × 1.335 (this
  calibration). Reserve absolute kcal for levers that cannot move
  lifespan (pure preservation/processing mechanics), and even then pair
  it with the calibrated 1.316 multiplier, not a hand-set 1.15.

## Village assessment
Across 32 runs: 12/16 seed-policies byte-identical across invocations —
the suite is deterministic on ~3/4 of seeds, bifurcating on the
fight-heavy remainder (lead-11/33, belo-11). Where trajectories match,
rot is EXACTLY reproducible (13 runs Δ=0, 1 run Δ=414 kcal at 180d —
spoilage accounting is deterministic to the kcal). The rot instrument
is the honest part; the trajectory is the noisy part. No villager-
behavior sense-testing was in this run's scope (rot instrument only —
the task briefed measurement, not a lever, and the instrument records
only rot/starvation fields by design).

## Wall numbers
Not measured by this instrument (rot-only recorder: rot + starvation
fields by design). Reference, same suite yesterday (hungerdepth control,
identical seeds/policies/horizon): national 9/16, table 0, wins 0,
wave-4 reach 4/16, wave-5 0, median survival 115d. The scale wall
stands.

## Telemetry deviation check
`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-14/rotcal-aa-perseed/*.json' --metrics
national,table,wins,exiled` → **LOUD: national disappeared: baseline 8
-> current 0 (n=32 files). INVESTIGATED SAME-RUN: instrument artifact,
not a real deviation.** The rotcal runner records only rot/starvation
fields (national/table/wins are absent = 0 in the per-seed JSON by
construction); the hungerdepth control measured national 9/16 on this
exact suite yesterday. No baseline roll, nothing to explain — but this
is a standing caution: running telemetry-check against a narrow
instrument's output manufactures LOUD lines. Pair the check to the
instrument's recorded fields.

## Metric review
(mandatory) Doubts about THIS calibration, for the NEXT run:
1. The p90 multiplier (1.335) is the 15th order statistic of 16 pairs —
   it is lead-33's bifurcation (relVd 0.335) almost alone. With 16
   pairs the p90 is inherently seed-lottery-sensitive: swap which 3
   seeds bifurcate and the multiplier swings. A future run with budget
   should widen to more seeds before treating 1.335 as settled; until
   then, re-calibrate per suite rather than hard-coding.
2. Absolute-kcal relative p90 (0.316) < per-vd relative p90 (0.335) —
   counterintuitive, since per-vd should be the more stable form. It
   happens because belo-11's bifurcation dominates per-vd max
   (relVd 2.222) while absolute's spread is diluted by large
   denominators. The per-vd form is still the recommended primary
   (lead-11: survival bifurcated, rate didn't) — but report both.
3. Residual bifurcation source is unproven. If a future entropy-hunt
   round nails the remaining Date.now()-ID ordering, the floor drops
   and this calibration supersedes. Proposed metric revision for the
   NEXT rot calibration: re-run A/A post-any-determinism-work and
   compare p90s, rather than stacking corrections on this one.
None of this revises today's verdict (diagnostic, not a lever).

## Verdict
**diagnostic GO** — publishable calibration. 16/16 seeds paired
(≥14 criterion), p90 |Δ| table published for all three rot forms, and
the recommended guardrail form written with the calibrated multiplier
(armed_rot_per_vd ≤ control_rot_per_vd × 1.335). No lever landed
(none was run). Convergence state: instrument published; the
food-economy axis's next rot-guarded arm should pre-register the
calibrated per-vd guardrail.
