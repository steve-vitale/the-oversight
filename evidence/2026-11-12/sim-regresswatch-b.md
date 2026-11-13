# sim-regresswatch-b — fresh-band reproduction of the regression_watch player named-class read

Run `fleshout-loop-b-20261112T2130Z` (Loop B, 2026-11-12 15:30 CST).
Arm: sim-regresswatch-b. Prereg: `evidence/2026-11-12/sim-regresswatch-b-prereg.md`
(committed `c6a89c0cf`).

## Verdict: NO-GO (noise) — no confirm owed

The `classAccess` row on the fresh 8-seed band reads **`no_material_signal`:
0.875 → 0.875, delta 0, 95% interval [0, 0], 8/8 paired, 8/8 tied** (0
increased, 0 decreased). Per the prereg, SIGNAL (GO for confirm) required
the pilot compare to flag `classAccess` as `regression_signal`; a watch or
no-signal is noise and the run stops there. No 16-seed confirm is owed.

This is the third read of the same row, and the third time it is not a
signal:

| Arm | Band | classAccess before → after | Status |
| --- | --- | --- | --- |
| Discovery (sim-synergydisc-b) | 190501–190508 (8) | 0.875 → 0.75 (7/8 → 6/8) | regression_watch |
| Holdout (sim-synergyholdout-b) | 190509–190524 (16) | 0.8125 → 0.625 (13/16 → 10/16) | regression_watch |
| This arm (fresh band) | 190525–190532 (8) | 0.875 → 0.875 (7/8 → 7/8) | no_material_signal |

The synergy change moved nothing on this line on a fresh band: every seed's
class-access status is identical before and after. The holdout's watch is
confirmed as trajectory noise — the scholar's godpath recognition depends on
which fights and offers the divergent trajectory serves up — not a synergy
effect. The line is closed: three reads, two watches, one flat no-signal,
zero signals. No further arm on this row is owed unless a new lever changes
the class-grant path itself.

## The overall decision is not the judge

The compare's overall decision is `review_required`, driven by four OTHER
rows, all `regression_watch` (reported here, not re-scored into the
verdict, per the prereg — only the `classAccess` row judges):

| Row | Before → after | Delta | Interval |
| --- | --- | --- | --- |
| First bearer <redacted> through day 30 | 0.875 → 0.75 | −0.125 | −0.375 to 0 |
| First bearer <redacted> through day 60 | 0.375 → 0.125 | −0.25 | −0.5 to 0 |
| Village deaths per run | 77.375 → 78.125 | +0.75 | −10.625 to 12.75 |
| Mean sampled living NPCs | 8.2325 → 7.5792 | −0.6534 | −1.4317 to 0.0817 |

All four intervals cross or touch zero; none is a signal. The day-30/day-60
bearer rows are the same trajectory-noise family as the judged row (which
bearer the divergent trajectory serves up first). They are recorded for the
next synergy follow-up, not chased here.

## Per-seed sense check (SENSE-TESTING LAW)

The metric is paired per seed: 8/8 tied means no seed gained or lost player
class access between the legs. The one seed without a player class is the
same on both legs — **seed 190531 has an empty player class list on both
legs** (the village died d87 before / d117 after; no class was ever
granted to the scholar). Every other seed holds a class on both legs
(forager/gardener and hunter/stalker dominate; explorer/cartographer and
hunter/beastmaster appear on the longer runs). The loss tracks the
trajectory — a short, hard run that never reaches a class grant — not the
synergy change, which is identical on both legs for this seed.

## Wall numbers (both legs, competent, 150d death-aware)

| | Before (`fed635f1f`) | After (`ad2bd13fd`) |
| --- | --- | --- |
| Survived | 1/8 (190532) | 4/8 |
| Village-lost | 7/8 | 4/8 |
| Median days | 124 | 150 |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |
| Wave-5 reach | 0/8 | 0/8 (max wave 4 on both legs) |

The after leg survives longer on this band (4/8 vs 1/8, median 150 vs
124d) — that is the synergy change's known survival direction on other
bands, not this arm's judged metric, and it is not claimed as a verdict
here. No village reached national or the table on either leg.

## Method (per prereg)

- Pinned-SHA legs, verified before the prereg commit: before
  `fed635f1f` (pre-synergy master), after `ad2bd13fd` (synergy tip);
  `git diff fed635f1f ad2bd13fd --stat -- src/` is exactly +92/−0 in
  `src/js/game.js` (dawn synergy resonance + `endDay()` hook). Panel
  metadata confirms the legs: before panel `sourceHeadStart/End =
  fed635f1f…`, after panel `ad2bd13fd…`.
- Both legs through `scripts/balance-panel.js` (competent only,
  `--seeds 190525–190532 --days 150`, under `setsid`).
- Panel cache artifact, verified harmless: each panel's `cases/` holds
  **9 files for 8 seeds** — seed 190525 was written twice (different
  result digests; one file carries `classes: null`, the other the
  populated class lists; same days and end reason on both legs). The
  compare pairs 8 (distinct seeds 190525–190532, eligible 8/8) and the
  classAccess row ties 8/8, so the duplicate did not move the judged
  metric. The `cases/` caches were deleted at closeout (never committed);
  only `panel.json.gz` + compare `.md`/`.json` are committed.
- No `src/` change in this arm (evidence + one proof test only).
- Flap probe passed at prereg time; the run itself saw no flap.

## Proof

- `scripts/test-regresswatch-b.js` (new): asserts the compare's
  `classAccess` row (status, values, pairs, tied), both panels' leg
  SHAs and 8 distinct competent seeds, the wall numbers above, and
  that this evidence file's verdict matches the compare. Green on the
  branch (re-run on the rebased tip before landing).
- Telemetry deviation check: ran on the panel corpus
  (`telemetry-check.js --baseline .../scale-wall.json --current
  'evidence/2026-11-12/regresswatch-b-panel-before/cases/*.json'
  --metrics national,table,wins,exiled`) — LOUD: national 12 → 0,
  table 16 → 0, wins 16 → 0 (n=9 files — the duplicate 190525 file
  is counted twice, harmless at 0). Explained, not a bug: no village
  on either leg reached national or the table (wall numbers above), so
  the current corpus is legitimately 0 on all three while the baseline
  is a competent-panel baseline where villages do reach them. Baseline
  NOT rolled.

## Metric review

- The duplicate 190525 case file (9 files, 8 seeds) is a panel-cache
  artifact worth one line in the panel tooling notes: a retried job
  writes a second case file for the same seed instead of replacing the
  first. The compare dedupes to 8 pairs and the verdict is unaffected,
  so no tooling change is owed from this arm.
- The `review_required` overall decision is driven by watch rows, not
  signals. Future readers: the overall decision is NOT the judge for
  this arm — the prereg names the `classAccess` row, and only it.
- Nothing re-scored mid-run. The prereg's NO-GO rule was applied as
  written.

## Convergence

Axis: synergy holdout follow-up (the `regression_watch` player
named-class line). State: **closed — noise, no signal on three reads**.
No confirm, no new arm. The holdout's "one line in the next synergy
follow-up" is this file.
