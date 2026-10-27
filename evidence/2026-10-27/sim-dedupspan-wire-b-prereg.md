# sim-dedupspan-wire-b — PRE-REGISTRATION

Run: oversight-flesh-out-loop-b, arm sim-dedupspan-wire-b, axis food-economy.
DIAG/tooling ONLY: ZERO src/js changes in the landed commit. If wiring
genuinely required a game-code change, stop and document — it does not
here (the dedup rule is a pure function over corpus payloads).

Committed BEFORE any wired comparison run. Baseline (unwired) figures
are captured after this file, before any analyzer edit, by running the
current analyzers on the corpora below; the wired run then compares
against that baseline on identical inputs.

## Task

Wire `scripts/dedupspan-ledger-b.js` (sim-dedupspan-b, 33/33, 9954
generic residual 0) into every standing analyzer that sums
directRecords + mealDrawRecords into a ledger total, so a future
ledger run cannot re-create the +3,800-class residual by summing the
old way. Analyzers that never sum direct records are documented-only,
with the reason stated — they cannot reproduce the residual.

## Inventory (from grep + perSeed reads, before wiring)

WIRED (8 core ledger analyzers; each has a `perSeed(ps)` that adds
directRecord items to `newDraws` and, where present, to boundary
`bDraws` / raid `rBDraws` / caller-complete `cBDraws`):
1. `scripts/analyze-stockdoors-b.js` — NEW-only (no boundary legs).
2. `scripts/analyze-residualhunt-b.js` — NEW-only (no boundary legs).
3. `scripts/analyze-ledgerbound-b.js` — NEW + boundary (b) legs.
4. `scripts/analyze-raiddor-ledger-b.js` — NEW + boundary + raid (rB) legs.
5. `scripts/analyze-raidday100-b.js` — NEW + boundary + raid legs.
6. `scripts/analyze-raidday100-general-b.js` — same leg shape as (5).
7. `scripts/analyze-raidday100-judge-b.js` — same leg shape as (5).
8. `scripts/analyze-raidcallers-b.js` — NEW + boundary + raid + caller-complete (cB) legs.

DOCUMENTED-ONLY (never sum directRecords; meal-only or OLD-definition
instruments, so the direct+meal double-count cannot occur in them):
- `scripts/analyze-driedpath-b.js`, `analyze-bothgrow-b.js`,
  `analyze-cattailband-b.js`, `analyze-lqpersist-b.js`,
  `analyze-mealdraw-b.js`, `analyze-mealdraw-reprereg-b.js` —
  iterate mealDrawRecords only (driedpath is the OLD-definition
  control: pantryDraw-only draws, no direct leg at all).
- `scripts/analyze-spoilvol-b.js`, `analyze-smoke-eq-b.js` — no
  directRecords reference at all (checked by grep).
- Capture scripts (`stockdoors-capture*.js`, `mealdraw-capture.js`)
  and sweep scripts only PRODUCE the records; they do not sum them
  into a ledger total, so they are out of scope (wiring a producer
  would change corpora, not totals).
- `scripts/dedupspan-ledger-b.js` itself is the rule, not a consumer.

## Wiring design (fixed before running)

- New shared helper `scripts/dedupspan-apply-b.js`: wraps
  `applySpanDedup(ps)`, aggregates its exclusions by family
  (famOf, isDried as in the analyzers), and returns a plain-object
  summary. It does NOT change the rule.
- Each wired analyzer's `perSeed`, after its direct loop and BEFORE
  its residual loop: subtract the exclusions from `newDraws`
  (and `newDriedDraws` for dried items), record
  `newDrawsPreDedup` / `newDriedDrawsPreDedup` and
  `spanDedupKcal` / `spanDedupDriedKcal` per family, and attach
  `spanDedup` (the summary) to the returned object.
  `directKcal` itself is NOT rewritten: it remains the raw direct
  total, so `newDraws = meal + other + drawSpoiled + directKcal
  - spanDedupKcal` is auditable from the returned fields.
- Each boundary analyzer, after its boundary `bFam` accumulation
  and BEFORE its boundary-residual loop: subtract the
  day-<=100 exclusions from `bFam.draws` / `bFam.dDraws`.
  Raid (rB) and caller-complete (cB) legs derive from the boundary
  draws, so they inherit the correction; no separate raid/caller
  patch. Boundary closing is untouched (the excluded items are
  direct records, not day-100 meal draws).
- GUARD (no silent assumption): `spanDedup.status` is
  `applied` when the payload carries nestEvents, `no-span-data`
  when it does not (figures are then exactly the old figures, and
  the status says dedup could not run — a span double-count, if
  one existed, would be undetectable on that corpus), and
  `applied-with-ambiguity` when any span was ambiguous (the rule
  already fails closed on ambiguity: that span excludes nothing).
  The analyzer headers document this status contract.
- The span-log foodState gap is NOT chased as a game-code change
  (task rule 4): if wiring touches the match key it is noted as a
  follow-up in evidence only. The match key stays the module's
  four-field key.

## Primary metric

Per-corpus, per-analyzer, per-family `newDraws` / `newResidual`
(and, where present, `bResidual` / `rBResidual` / `cBResidual`)
wired vs unwired on identical payloads.

## GO thresholds (bound; a miss is NO-GO, never re-scored)

- GO1 (coverage): all 8 wired analyzers expose `spanDedup` on
  every `perSeed` return, with pre-dedup fields preserved.
- GO2 (9954 span corpus): on
  `evidence/2026-10-27/sim-9954cultnest-b-replay/9954cultnest-b-belongseek-nofeast-s9954.json`,
  for EVERY wired analyzer: generic `newDraws` = unwired − 3,800
  exactly; generic `newResidual` = unwired − 3,800 exactly; and
  every boundary/raid/caller generic residual present =
  unwired − 3,800 exactly. (Per sim-dedupspan-b: correct-alignment
  generic residual 3,800 → 0; boundary 3,700 → −100, the already-
  proven day-100 inflow timing gap, not a new residual.)
- GO3 (no other movement): on the 9954 corpus, every non-generic
  family figure is bit-identical wired vs unwired, and every
  dried figure is identical; on every bare corpus below, EVERY
  figure is bit-identical wired vs unwired except the added
  `spanDedup` / pre-dedup fields.
- GO4 (bare corpora): every bare-corpus `perSeed` return has
  `spanDedup.status === 'no-span-data'` and
  `totalExcludedKcal === 0`.
- GO5 (proof + hygiene): `node scripts/test-dedupspan-wire-b.js`
  passes all checks, exit 0; `node scripts/test-dedupspan-b.js`
  still 33/33; zero src/js files in the commit; no existing
  analyzer's non-ledger behavior (legs, verdicts on bare corpora)
  changes.

## Corpora (all already on master; none fabricated)

- C1 (span): 9954 cultnest replay (above), 1 seed.
- C2 (bare): `evidence/2026-10-27/sim-raidcallers-b-corpus/` (8 seeds).
- C3 (bare): `evidence/2026-10-27/sim-raiddor-ledger-b-corpus/`.
- C4 (bare): `evidence/2026-10-26/sim-stockdoors-b-corpus/`.
- C5 (bare): `evidence/2026-10-27/sim-ledgerbound-b-corpus/`.
- C6 (bare): `evidence/2026-10-27/sim-residualhunt-b-corpus/`.
- C7 (bare): `evidence/2026-10-27/sim-raidday100-b-corpus/`,
  `sim-raidday100-general-b-corpus/`, `sim-raidday100-judge-b-corpus/`.
- Confirm corpora (`*-confirm-corpus`) are spot-checked only if a
  bare corpus above is unavailable; otherwise they are not needed.

## Policies / seeds

No game policy is involved: this is a tooling arm over fixed
corpora. "Seeds" above are corpus files. No fresh sim band is run,
so no new wall band exists for this arm; wall numbers are the
reused raidcallers numbers (see evidence file), not re-judged.

## Reachability verdict basis

Reachability is not re-measured by this arm (tooling-only, no game
change, no fresh band). The verdict records the reused corpus and
states that no new wall band exists — per the task's reporting rule.

## Metric review placeholder

Filled in the evidence file after the wired run, not here.
