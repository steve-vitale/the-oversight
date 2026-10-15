# Why some feast-fix campaigns lost their former wins

2026-10-15. Follow-up to `feast-host-audit.md`; no gameplay or policy edits.

## Reproduction and observer check

`scripts/godpath/probe-feast-outcomes.js` runs the standard campaign driver
against frozen pre-fix `ddfbd5d0` and current checkout `d08f353a` (runtime
`f8e633c5`). It records daily boundary hashes, actual hostFeast calls,
reserve-changing food calls, combat settlement, death and Table events.
It adds no telemetry, RNG or clock calls. It is a diagnostic observer,
not another policy or a substitute game harness.

Four deliberately selected lost wins, one per policy, each run before/after
with observation enabled/disabled: **16 campaigns, eight neutral pairs**.
Every standard result row and final gameplay hash reproduces its previously
saved matrix row: **16/16**. Warnings: **zero**. The hash excludes only the
existing three wall-clock pacing diagnostics; food, receipts, telemetry and
all other gameplay state remain included. Immutable Git blobs verify the
game/harness/policy source identities recorded in the diagnostic.

Validation: quick **152/152 (32s)** and full **924/924 (130s)**. Exact logs
and their hashes are retained with the evidence. No quarantines or changed
runtime assertions.

## First difference

| Case | First changed feast day | Host reserve before → after | First different daily action counts |
| --- | ---: | ---: | --- |
| capable, seed 5 | 27 | 2,353 → 2,400 (+47) | Day 72: eat 11 → 10; pantry take 10 → 9 |
| maker, seed 555 | 27 | 2,381 → 2,400 (+19) | Day 65: eat 2 → 1 |
| merchant, seed 42 | 34 | 2,377 → 2,400 (+23) | Day 91: eat 7 → 6; pantry take 6 → 5 |
| caregiver, seed 2026 | 27 | 2,345 → 2,400 (+55) | Day 69: eat 35 → 14; pantry take 33 → 13 |

In each case the full state hashes immediately before the changed feast
match. All earlier sampled daily boundaries also match (50 samples in
three cases, 64 in merchant). The same guests attend, the same pantry cost
is spent, and the armed buff is granted on both sides. The corrected serving
fills the host's small remaining reserve capacity. Merchant's earlier day-27
feast is identical because the host was already full.

The first different action *counts* occur much later than the first reserve
gain. Counts alone do not prove every intervening choice was identical;
the diagnostic retains the actual observed food/combat events as well.
The table does not attribute the later losses directly to those few calories.

## Later branches

- **Capable 5:** the old bearer dies at night on day 83. The corrected run
  instead starts a Hummice fight that day with 8 HP and survives; its first
  bearer death is combat on day 148. The old run's successor reaches and
  wins the Table on day 131. The corrected run never enters. Saving an early
  bearer can remove a successful succession trajectory.
- **Maker 555:** the first different death/combat event sequence appears
  around days 66–68. The old run reaches the Table on day 96 without a
  bearer death. The corrected run never enters and later loses bearers to
  dehydration (108) and starvation (144).
- **Merchant 42:** neither run loses its bearer. Later village events differ:
  Ruby Callaghan dies on day 103 in the corrected run, where the old event
  sequence instead proceeds to a Hushwolf death on 107. The old run enters
  the Table on 127; the corrected run does not enter.
- **Caregiver 2026:** neither run loses its bearer. Sofia Chen dies on day
  101 in the corrected run, while the old event sequence proceeds to a
  monster death on 106 and a Table win on 108. The corrected run never enters.

These are observed branches, not an isolated causal diagnosis of every
subsequent injury, death or progression gate. In particular, a later
dehydration death is not proof that the serving itself causes dehydration.
Different food actions and RNG consumption can change encounters and village
survival. The negative aggregate result (124 → 114 wins, 229 → 256 deaths)
remains unchanged and visible. Four selected cases cannot establish a
systematic population effect or explain all 31 lost wins.

The traces do rule out observation drift and an immediate missing/negative
meal, extra pantry charge, changed guest list or refused armed buff in these
four cases. Keep the paid-serving correction. No compensating reward,
threshold, policy or encounter tuning is justified by this diagnostic alone.
Proceed with the authored Garden coverage rule using real receipts; retain
campaign/succession sensitivity as a limit on balance claims.

## Artifacts and reproduction

`feast-outcome-diagnostic.json.gz` retains the complete 16-run trace;
`feast-outcome-validation.json` records source/artifact SHA256s, matrix
reproduction, neutral pairs and exact first differences. The compressed
artifact was decompressed and hash-verified against the raw output.

From the repo root, prepare an immutable archive of `ddfbd5d0`, then:

```text
node scripts/godpath/probe-feast-outcomes.js --before <frozen-root> --out <report.json> --par 4
```

Defaults are the four cases above; `--cases policy:seed,...` accepts explicit
cases. One harness per child process. The probe throws if observation changes
a campaign, retaining the diagnostic for inspection. No new phone claim is
made here; the preceding audit retains the actual phone proof.
