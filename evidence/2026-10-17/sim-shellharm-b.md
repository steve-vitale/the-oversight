# sim-shellharm-b — harm-model diagnostic for the sim-shellcounter-b kill (loop B, axis food-economy)

DIAGNOSTIC (read-only instrumentation, no behavior change). Resolves the harm
model behind the sim-shellcounter-b kill (evidence/2026-10-17/sim-shellcounter-b.md):
the counter-shelling layer killed zero-trace at pilot on a REAL guardrail miss —
starvation deaths 22 vs 7 (pooled Δ=15; villager-only 18 vs 5, Δ=13), paired sign
1/6/9 — while the pantry gained ~671k shelled kcal and the scholar drew 298k less.
WHY did starvation rise when food rose?

## PRE-REGISTERED (binding, docs/MEASUREMENT.md §§14-15 — written 2026-10-17 16:55 CDT, before any sim)

- PRIMARY: share of the pooled control→armed starvation delta explained by an
  identified mechanism. GO target: **≥80% of the delta attributed** to a named
  mechanism (collapse-tail re-timing / neutral-perturbation timing replication /
  food-channel displacement). Villager-only deaths (exclude the scholar) are the
  harm read; pooled is reported for continuity with the original verdict.
- SUB-METRICS:
  (a) per-pair villager-starvation deaths split pre-collapse (day < villageLostDay)
      vs collapse-tail (day ≥ villageLostDay; day ≥ 9999-normalized for never-lost);
  (b) neutral-perturbation replication: perturb−control Δ per pair, direction and
      magnitude vs shell−control Δ, on the same seeds;
  (c) food-channel: pantry displacement (scholar takes control−armed, villager takes
      totals, per pair), pre-collapse lean-day pantry levels armed vs control,
      biggest-sheller pairs (s7308-belongfeast etc.) starvation vs paired controls;
  (d) collapse timing: villageLostDay and first-pantry-empty day per arm per pair
      (armed earlier/later/same).
- VERDICT CLASSES (mutually exclusive, judged in this order):
  1. GENUINE HARM — a food-channel or systematic mechanism explains ≥80% of Δ
     (e.g. displacement ≤ 0, or pre-collapse lean-day pantry systematically lower armed).
  2. TAIL-TIMING NOISE — ≥80% of Δ is collapse-tail deaths and/or the neutral
     perturbation replicates the shell-arm shift (same direction, ≥50% magnitude)
     on the famine-prone pairs. The guardrail counted the wrong thing: tail
     deaths are a different regime, and the arm's true perturbation is time, not food.
  3. UNRESOLVED-BUT-SCOPED — residual after all three lenses, bounded in size,
     with the exact scope of what a revival must measure.
- HORIZON: 180d death-aware (runDays stops on village death +10d tail). Never a fixed horizon.
- SEEDS: 7301–7308 × {leadfeast, belongfeast} × {control, shell-armed, perturb-armed}
  = 48 runs, own in-sweep controls, identical seeds. Substrate FEASTSCALE_R13=1,
  SEATDRIVE=0, mode leanwinter — identical to the original corpus.
- INSTRUMENTS: scripts/policies/shellcounter.js (faithful reconstruction of the
  killed layer, read-only diagnostic instrument, never landed); scripts/policies/perturbdawn.js
  (neutral 4-tick dawn busywork: identical gates, no shelling, no put-away, no kcal
  change — isolates the timing vector from the food channel);
  scripts/sweep-shellharm-b.js (extended death/collapse/pantry telemetry);
  scripts/test-shellharm-b.js (instrument proof: fidelity RED/GREEN both layers,
  det-gate byte-identical gates-off, attribution unit test).
- SENSE-TESTING LAW: read the death beats of the extra starvation cases — do they
  read as the shelling taking food out of mouths, or as chaos? Reported below.
- §15: the official balance-panel driver cannot express this arm (same deviation as
  shellcounter-b: policy-side layers, FEASTSCALE_R13 substrate, leadfeast/belongfeast
  not panel policies, contract lacks starvation/shelled-kcal/pantry metrics). Light
  per-seed panel-schema JSONs (control/shell/perturb) + compare .md in
  evidence/2026-10-17/panel-shellharm/; pre-registered metrics judged directly.

## Instruments
[pending sweep]

## Before / after
[pending sweep]

## Attribution breakdown
[pending sweep]

## Sense-test (death beats)
[pending sweep]

## Harm-model verdict
[pending sweep]

## Revival guardrail spec (for the future lever revival)
[pending sweep]

## Metric review
[pending sweep]

## Reachability / wall numbers
[pending sweep]

## Village assessment (plain words)
[pending sweep]

## Recovery status (2026-10-18, run fleshout-b-20261017T2320Z)

This diagnostic was inherited from dead run fleshout-b-20261017T2122Z (stale-lock recovery). The 48-run sweep (7301-7308 x {leadfeast,belongfeast} x {control,shell,perturb}) is PARTIAL: 19/48 per-seed files complete on master 213fdda2+ (substrate-consistent; contaminated mid-rebase outputs were discarded and re-run).

The sweep did not finish within this run's window (box overloaded, ~6h projected). The 19 completed files are committed here; the next loop-B run resumes with SEEDS/POLICIES/ARMS env targeting the missing 29.

Missing (29): control s7305-s7308 (both policies), shell s7302-s7308 (both policies), perturb s7302-s7308 (both policies). [Exact missing list to be computed by the resuming run from the per-seed dir.]
