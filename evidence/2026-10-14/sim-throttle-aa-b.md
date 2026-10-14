# THROTTLE A/A REPEAT — variance-calibrated guardrail re-confirm (fleshout-b)
2026-10-14 (run 2026-10-14T05:53Z) | axis: food-economy | arm: throttle-aa-b
(measurement/instrument-only arm — no game-code changes)

## Context
The throttle-confirm NO-GO (evidence/2026-10-14/sim-throttleconfirm-b.md,
lever landed afb736e6): primary held (−41.1% fresh-rot, 2.7× GO) but median
survival −14d (bound ≥−10d) and starvation 26→38 (bound ≤32.5) breached the
pre-registered guardrails. The confirm's own §14 metric review (points 2, 3,
6) prescribed exactly this run: an A/A repeat (same side, twice) to measure
the suite's own variance, starvation deaths per 100 villager-days as the
denominator-aware metric, and variance-calibrated median bounds.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE analysis
- Question: are the confirm's two guardrail misses inside the suite's own
  noise floor? Calibrate the bounds from an A/A repeat, then re-adjudicate
  the EXISTING confirm data against the calibrated bounds.
- Lever: landed PRODTHROTTLE as-is (current tip, UNCHANGED — tooling/
  instrument-only arm).
- A/A DESIGN: the landed throttle run TWICE on the same seed set —
  seeds 101/202/303/404/505/606/707/808 × leadcourt/belongseek (16 runs
  each), 180d death-aware, IDENTICAL seeds both A-runs.
- CALIBRATION (pre-registered rule): G1 median bound = before_median −
  ceil(p90 of |per-seed A/A day deltas|) (one-sided; improvement never
  fails). G2 starvation bound = before starve-per-100-village-days +
  p90 of |per-seed A/A per-100-day starve-rate deltas| (denominator-aware;
  the per-100-villager-day rate is also instrumented and reported).
- VERDICT RULE (§14 binding): PROMOTE the lever to confirmed iff PRIMARY
  ≥15% reduction (already measured −41.1%) AND the calibrated guardrails
  pass (G1, G2, plus the previously-passing national/hungryDays/combat as
  consistency). Else the NO-GO verdict stands and the question closes as
  "cost is real". A miss is NO-GO — never re-scored mid-run.
- Instrument-honesty: SMOKE=1 gate before any sweep spend (finding #69);
  named-export policy unwrap; test-throttle-aa-20261014.js asserts the A/A
  delta distribution is centered ~0 (sign test, NOT exact equality —
  long fight-heavy trajectories have a genuine noise floor).
- Wall numbers reported: national/table/wins, wave 4-5 unlocks,
  median/max survival, death-cause shares, exiled. Sweep logs to
  evidence/2026-10-14/ (never /tmp — VM reboots wipe /tmp).

## Instrument-honesty gate (BEFORE any sweep spend)
- `SMOKE=1 SIDE=on node scripts/test-throttleconfirm-20261014.js`: ALL
  GREEN — landed shape (pantryFreshDays() > 4) asserted in source,
  engaged()==true on a 10-day pantry / false on empty, #69 unwrap
  RED/GREEN, SMOKE=1 policies genuinely drive.
- The throttle code is UNCHANGED since the confirm
  (`git log -S prodThrottleEngaged bcdc9115..HEAD` — empty; the only
  game.js commits since are journey-scale r2, inffight #102, combat-survival
  — none touch the throttle).

## A/A results (both runs on the landed throttle, current tip)

| metric | A/A-a | A/A-b | Δ (b−a) |
|---|---|---|---|
| median survival | 98d | 98d | 0d |
| max survival | 180d | 180d | 0d |
| national | 7/16 | 7/16 | 0 |
| table / wins | 0 / 0 | 0 / 0 | — |
| exiled | 3 | 3 | 0 |
| wave-4 reach | 5/16 | 6/16 | +1 |
| wave-5 reach | 0/16 | 0/16 | — |
| starvation deaths | 24 | 24 | 0 |
| starvation/100 villager-days | 0.179 | 0.179 | 0.000 |
| rotFresh | 1943.1k | 1968.9k | +25.8k (+1.3%) |
| redirects | 3,985 | 4,038 | +53 (+1.3%) |
| hungryDays | 38 | 35 | −3 |

`scripts/test-throttle-aa-20261014.js`: IDENTITY GREEN — 13/16 pairs
bit-identical (days, starvation, rot, villager-days); no systematic drift
(sign test p=1.000 on days, starvation, rotFresh, villager-days; median
Δ = 0 on all four families).

## Noise-floor measurement (the honest calibration)
- |Δdays| per seed: mean 1.2d, p50 0d, **p90 3d**, p95 13d, max 13d
- |Δstarve| per seed: p50 0, **p90 2**
- |Δ starve-rate| per 100 village-days: p50 0.000, **p90 1.130**, max 3.516
- |Δ starve-rate| per 100 villager-days: p50 0.000, **p90 0.144**

The three non-identical pairs (leadcourt-101: 60→73d; belongseek-505:
151→148d; belongseek-808: 177→180d) are genuine trajectory bifurcation
on rerun — notably leadcourt-101 reproduced BYTE-IDENTICAL across the
confirm's VM reboot but bifurcates here, so the noise source is real and
seed-dependent (fight-heavy trajectories), not a clock artifact. It is
also SMALL: the suite is highly deterministic, and the measured noise
floor is tight.

CALIBRATED GUARDRAILS (from the pre-registered p90 rules):
- **G1 median survival: armed_median ≥ before_median − 3d** (one-sided;
  ceil of p90 |Δdays|)
- **G2 starvation: armed rate ≤ before rate + 1.130** per 100
  village-days (p90 of |per-seed rate Δ|)

`scripts/calibrate-throttle-aa-20261014.js` → evidence/2026-10-14/throttle-aa-calibration.json.

## Re-adjudication of the confirm data (variance-calibrated)
`scripts/adjudicate-throttleconfirm-calibrated-20261014.js` against
throttleconfirm-before.json / throttleconfirm-armed.json:

| check | result |
|---|---|
| PRIMARY: armed rotFresh ≤ 0.85×before | PASS — 4773.7k vs 8098.4k = **−41.1%** |
| G1 median: armed ≥ 136 − 3 = 133d | **FAIL** — armed 122d (Δ=−14d) |
| G2 starvation/100d: armed ≤ 0.837 + 1.130 = 1.967 | PASS — 1.274 (Δ=+0.437; counts 38 vs 26 over 2982/3107 village-days) |
| national ≥ before−2 | PASS — 18 vs 16 |
| hungryDays ≤ before+max(5,10%) | PASS — 56 vs 52 |
| combat deaths no 2× explosion | PASS — 191 vs 188 |

## Verdict: NO-GO stands — "cost is real" (§14 binding)
The A/A repeat DISPROVED the comfort hypothesis. The noise floor is
small (p90 |Δdays| = 3d) and the confirm's median miss (−14d) is ~4.7×
the p90 single-seed swing — not noise, a real cost. The calibrated
median bound is TIGHTER than the hand-set ±10d it replaces (−3d), and
−14d fails it decisively.

The starvation miss partially dissolves under the denominator: once
starvation is measured per 100 village-days (metric review point 2's
prescription), the armed rate 1.274 vs before 0.837 (Δ=+0.437) sits
inside the calibrated bound (+1.130) — the raw-count miss 26→38 was
partly an artifact of armed villages having fewer village-days (2982
vs 3107, i.e. dying earlier), exactly the trajectory-divergence pattern
the confirm's metric review suspected. G2 PASSES calibrated.

Per the pre-registered verdict rule, G1 FAIL → NO-GO. The question
closes: the lever's median-survival cost is real. The throttle stays
landed (afb736e6) — the confirm never un-landed it — but it is not
promoted to confirmed. The two live options remain the confirm's: a
fresh lever run on the thinner-buffer cost (the pilot's proposed
"exempt redirect while any villager is actively hungry" arm), or a
Steve/coordinator call.

## Wall numbers (scale wall — A/A-a / A/A-b, throttle-ON)
national 7/16 / 7/16, table 0, wins 0, exiled 3 / 3, wave4 5/16 / 6/16,
wave5 0 / 0, median/max survival 98/180d both, hungryDays 38 / 35.
Death-cause shares (a→b): combat 88→81, villager combat 18→18,
starvation 24→24, monster 22→23, contest 7→10, sickness 4→4, wound
7→7, lockjaw 3→5, Ugly-Eyes 1→0, The Terms of Service 1→1,
wound_fever 1→1, expedition 1→0. The mortality wall rules as before:
~14/16 runs end village-lost; nobody reached the table or won on
either A-run.

## Village assessment (plain words)
Throttled villages are surplus villages: the redirect fired ~4,000
times per 16-run suite (vs 8,636 on the 24-run confirm — same rate),
and the pantry stops being a mountain. Villages here are weaker than
the confirm's fresh seeds (median 98d vs 136d; national 7/16 vs
16-18/24) — the A/A seed set is just harder, or the master moved.
Villagers still live full lives: courtship ran on every belongseek
seed, contests chose 30 times on the leadcourt-303 sample, talk/gossip
beat continuously (84 talkTo/endConvo pairs on the confirm's
leadcourt-808 sample), villages reached national on 7/16 and global
rank on several seeds.

But the divergence the confirm flagged is real and visible here too:
per-seed outcomes swing hard under identical treatment — and now we
know that swing is NOT just treatment-divergence, because even the
same treatment re-run bifurcates on some seeds (leadcourt-101 lived
60d then 73d). Long runs have a genuine chaotic component on
fight-heavy trajectories. Against that, the A/A medians were rock
steady (98d both) while the confirm's armed median slid 14d — the
slide is treatment, not luck.

The sense-test (leadcourt-303, 82d, current tip) reads as people, not
tokens: "🌿 Catalina checks the pantry before heading out — the
shelves are full, ~5 days of fresh on hand… leaves the fish nets
standing and turns to the wood run instead. The pantry can't take
more; the wild will keep." Named villagers and strangers alike narrate
the redirect; the day-count is honest (5-6 days, gate is >4). The
redirected labor is real work (wood/stone/water), and villagers still
forage normally below the gate. The throttle does not read as
starvation-by-design on the day-to-day level — which makes the
measured median cost a downstream-of-divergence effect worth a
dedicated lever, not a reason to doubt the narration.

## Blanks filled / documented
- FILLED: scripts/sweep-throttle-aa-20261014.js — A/A sweep instrument
  (measure-prodthrottle patterns + per-run villager-days denominator +
  per-seed wall-clock; sweep logs to evidence/, never /tmp).
- FILLED: scripts/test-throttle-aa-20261014.js — A/A identity assertion
  (seed-set identity, sign-test no-systematic-drift on days/starvation/
  rot/villager-days, noise-floor summary).
- FILLED: scripts/calibrate-throttle-aa-20261014.js — variance
  calibration → calibrated guardrails JSON.
- FILLED: scripts/adjudicate-throttleconfirm-calibrated-20261014.js —
  re-adjudication of the confirm data vs calibrated bounds (exit 1 =
  NO-GO stands).
- DOCUMENTED (not chased — instrument arm, out of axis scope):
  1. EXILE SEED-RECURRENCE: the telemetry LOUD line (exiled 0→3 vs
     scale-wall.json) is EXPLAINED — same-seed recurrence, not a new
     regression: s303 exiled on BOTH A/A runs (leadcourt + belongseek)
     and on the confirm's armed side (leadcourt-303, belongseek-303);
     s202 exiled once. The throttle may shift moot-exile outcomes on
     exile-prone seeds (the confirm's before-side exiled s101 only),
     but the base is tiny (1→3 on 24 seeds) and exile was never a
     pre-registered guardrail. Possible lever: moot-exile fairness on
     throttle-shifted food-taking accounting (sim-findings: moot-exile
     fair-share is steve-call).
  2. PERF: no finding-#109 blowup this run — max per-seed wall clock
     10.8s (177d belongseek-808); median 5.6s; both 16-run sweeps
     completed in ~1.5 min each. The ~50× leadcourt-202 pathology did
     not recur on these seeds/tip.
  3. DETERMINISM CAVEAT: leadcourt-101 reproduced byte-identical across
     the confirm's VM reboot but bifurcated 60→73d between my two A-runs
     — fight-heavy trajectories carry genuine rerun noise even with
     seeded RNG. The A/A design absorbs this (it measures it); single
     paired-seed comparisons should not be over-read.

## Metric review (§14)
1. The A/A repeat was the right prescription — and it returned the
   opposite of comfort: the noise floor is small, so both original
   guardrail misses were REAL, and the hand-set −10d median bound was
   too LOOSE, not too tight. Calibrated: −3d. Anti-drift held: the
   verdict binds against the pre-registered rule, and the rule produced
   NO-GO rather than the hoped-for promotion.
2. Starvation per 100 villager-days is the right metric and is now
   instrumented (villagerDays from harness pop samples). The confirm
   re-adjudication used per-100 village-days (confirm rows lack
   villager-days) — identical-seed pairing keeps it honest; the
   calibrated G2 PASSES. Recommend the per-100-villager-day variant
   (p90 noise 0.144 measured) for future runs.
3. The p90 |per-seed Δ| derivation is deliberately conservative for a
   guardrail: it fails only when the observed effect exceeds the suite's
   own p90 single-seed swing. It is calibrated on n=16 pairs from one
   realization — future replications could refine it, but it will not
   be re-scored mid-run.
4. Seed-set honesty: the A/A ran 8 of the confirm's 12 seeds
   (101/202/303/404/505/606/707/808) — enough for the noise floor,
   but the bound generalizes to the full suite by construction.

## Convergence state
food-economy: throttle-confirm NO-GO (killed-at-guardrail) STANDS after
variance-calibrated re-adjudication (2026-10-14) — primary held
(−41.1%), median cost −14d real vs calibrated −3d bound, starvation
cost dissolves under the denominator (G2 passes calibrated). The lever
stays landed, un-promoted. Next: hungry-exempt arm or Steve/coordinator
call.

## Limitation (stated honestly, per the assignment)
Master moved between the confirm and this run (loop-A r24 landings:
journey-scale, inffight #102, combat-survival; plus ship-loop commits).
The throttle code itself is byte-unchanged (`git log -S`
prodThrottleEngaged: empty), but the A/A noise floor is measured on the
current tip — an estimate of the confirm suite's noise floor, not
identical to it. Do not over-claim: the conclusion "cost is real" rests
on the A/A's small measured noise (p90 3d) against the confirm's −14d,
and that gap is far larger than any tip drift could plausibly explain.
