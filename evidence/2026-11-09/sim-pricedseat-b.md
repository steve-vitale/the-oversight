# sim-pricedseat-b — the takeseat analyzer earned-count repair (evidence)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T0630Z, axis
scale-onramp / winnability chain. Worker tree:
~/workspace/worktrees/sim-pricedseat-b, branch sim-pricedseat-b.
Base: master `ba21ca026`. Scope: MEASUREMENT FIX only —
`scripts/lib/seat-taken.js` (pricedSeatOf) + the three seat-counting
analyzers' substrate-sanity earned counts + `scripts/test-pricedseat-b.js`.
ZERO src/js. NO scorecard change. No new sims: the repair is proven
by re-judging the existing committed corpora.
**Verdict: GO on prereg bars 1–5; NO-GO on bar 6 as written — the two
measurement tests fail on a PRE-EXISTING cause (the retained proof is
stale against `src/js/conversation.js`, changed on master after the
proof panel was built), not on this arm's change. See Metric review.
The repair itself is proven correct on every known case; the landing
call belongs to the coordinator.** Full pre-registration (binding):
evidence/2026-11-09/sim-pricedseat-b-prereg.md.

## What was wrong

The takeseat analyzer's substrate-sanity bar ("baseline lesser
>=3/8") counted TAKEN seats as EARNED. `analyzeSeed` sets
`finalSeat: alignedSeat(o)` — the seat actually taken — and the
sanity count read `r.finalSeat === 'lesser' || 'full'`. On the
takeseat baseline leg (sitting switched off, 5 lesser seats PRICED,
0 taken) the bar read 0/8 against the recorded earned 5/8, flipping
the analyzer's overall verdict GO → "NO-GO (substrate — sit drive
unjudged)" although the primary (sat 5/8 armed vs 0/8 baseline),
guard (8/8) and cost bar all still passed. The same mislabeling sat
in the feareddoor/darkwit analyzers' `baseSeatsEarned` fields
(feareddoor read 5 taken where priced is 6; darkwit fresh read 5
where priced is also 5).

Root cause, in one line: `pricedSeatOf` in `scripts/lib/seat-taken.js`
read ONLY `row.finalSeat`. That is the priced seat on OLD corpora —
but on NEW-instrument rows `finalSeat` is the TAKEN seat and the
priced seat lives in `finalSeatPriced`. The analyzers had no priced
reading to count at all.

## What changed (file + function)

- `scripts/lib/seat-taken.js` `pricedSeatOf`: prefers
  `row.finalSeatPriced` when it is present and yields a seat string,
  else falls back to `row.finalSeat` (string or `{seat}` object, as
  before). One derivation now reads the priced seat on both corpus
  generations. `seatTakenOf` and `alignedSeat` untouched — verified
  unchanged on every existing `test-sitmetric-b.js` fixture (34/34
  still green) and on the new-row shapes in the proof test.
- `scripts/takeseat-b-analyze-20261107.js`,
  `scripts/feareddoor-b-analyze-20261107.js`,
  `scripts/darkwit-b-analyze-20261107.js` `analyzeSeed`: each row now
  carries BOTH fields — `finalSeat: alignedSeat(o)` (taken) and
  `finalSeatPriced: pricedSeatOf(o)` (earned) — and the
  substrate-sanity `baseSeats` count reads `r.finalSeatPriced`
  instead of `r.finalSeat`. Nothing else in the analyzers moves: the
  wall's `lesserSeats`/`fullSeats` keep counting the TAKEN seat, the
  guards keep their existing seat comparison, the primary/guard/cost
  bars and sanity thresholds are untouched. The analyzers already
  required `lib/seat-taken.js`; the import extends to `pricedSeatOf`
  — no new dependency, and no require from the scorecard (hard
  boundary: `seat-taken.js` is NOT in `balance-panel.js`'s
  observerFiles list; the scorecard is untouched by this arm).
- `scripts/test-pricedseat-b.js` (NEW): 33/33 PASS (see Proof).

No src/js change proved necessary. No push, no version bump, no live
verification — done, pending coordinator landing.

## Before / after on the known cases

Pre-repair analyzer outputs (recorded after the prereg commit, before
any repair edit) vs post-repair, same corpora, same seeds:

| analyzer | before overall | before `baseSeatsEarned` | after overall | after `baseSeatsEarned` |
|---|---|---|---|---|
| takeseat (8 seeds) | NO-GO (substrate) | 0/8 | **GO** | **5/8** |
| feareddoor (12 seeds) | NO-GO | 5/12 | NO-GO | **6/12** |
| darkwit fresh pair (8 seeds) | NO-GO | 5/8 | NO-GO | 5/8 (unchanged) |

Per-row earned/taken on the known corpora (through the repaired
`analyzeSeed` / `pricedSeatOf`):
- takeseat baseline 5/8 earned + 0/8 taken; armed 5/8 + 5/8.
- darkwit 53201-baseline leg 3/8 earned + 0/8 taken (per-row read —
  `perseed-darkwit-b-armed` does not exist, so the darkwit analyzer
  cannot run on its defaults).
- feareddoor seed 53210, both legs: earned 'lesser', taken 'none'.
- feareddoor baseline 6/12 earned + 5/12 taken.
- darkwit fresh baseline 5/8 earned, fresh armed 6/8 earned.

Diff discipline (verified by a before/after JSON diff of the full
analyzer outputs): the ONLY changes are `baseSeatsEarned` (0→5,
5→6, 5→5) and the takeseat overall (NO-GO (substrate) → GO). Every
other verdict field, both walls, and every per-seed row are
byte-identical modulo the new `finalSeatPriced` field on each row.

## Proof

`scripts/test-pricedseat-b.js` — **33/33 PASS**: pricedSeatOf
fixtures on both corpus generations (10, incl. new-row
`finalSeatPriced` preferred over a taken `finalSeat`, empty/null
`finalSeatPriced` falling back, no-signal null, and `alignedSeat`
unchanged on every new-row shape); known-case earned/taken counts on
the real corpora (9, incl. the 53210 single-seed case and the
per-row `finalSeatPriced` fields); the three analyzer verdicts
re-run (3: takeseat GO with sanity 5/8, feareddoor NO-GO with sanity
6/12, darkwit fresh NO-GO with sanity 5/8); six-pair invariance
through the unchanged scorecard (6: full judged-metrics digests
identical to the sweep-b goldens — takeseat / darkwit-53201 /
fightloop `460a36fd…`, feareddoor `eeaa356c…`, darkwit-fresh
`f202d5ba…`, feareddoor-53210 `53b95785…`); cross-check that
`pricedSeatOf` agrees with the raw `finalSeat` on every old-corpus
row (1 check over 80 rows, 0 disagreements).

## Regression results

Analyzer + compare suites (prereg bar 6 list) — all green at the
recorded counts:
- `scripts/test-sitmetric-b.js`: 34/34 PASS.
- `scripts/test-sitmetric-sweep-b.js`: 30/30 PASS.
- `scripts/test-takeseat-b-20261107.js`: 23 checks passed (incl. the
  live leg: seed 53001 reproduces baseline exactly, earns no seat in
  either leg).
- `scripts/test-feareddoor-b-20261107.js`: 33 checks passed.
- `scripts/test-darkwit-b-20261107.js`: 23 checks passed.
- `scripts/godpath/test-balance-scorecard.js`: 35/35 PASS.
- `scripts/godpath/test-panel-contract-rulings.js`: 9/9 PASS.
- `scripts/test-comparecontract-a.js`: 25/25 PASS.
- `scripts/godpath/test-measurement-workflow.js`: 8 passed, **1
  failed** — "retained neutrality proof covers the current
  Game/controller/harness inputs".
- `scripts/godpath/test-measurement-proof-update.js`: **fails at
  load** — "Proof source inputs are not current".

The two measurement failures are PRE-EXISTING on base `ba21ca026`,
not caused by this arm. Diagnosis (verified, not assumed): the
manifest (`B.manifest`) vs the retained panel's sources differ in
exactly ONE input — `src/js/conversation.js`. That file is
unmodified in this worktree (ZERO src/js in this diff) and its last
change (`f496b0072`, journey crisis r156, foreign-phrase dedupe) is
an ancestor of the base — it landed on master AFTER the sweep-b
proof panel was built (panel `evidence/2026-11-09/
neutral-sitmetric-sweep-20261109/panel.json.gz`), so the retained
proof is stale against current master. None of this arm's files is
a proof input (`observerFiles` is 7 files + `balance-metrics.json`;
`seat-taken.js` and the three analyzers are not among them), so the
manifest computed on pristine HEAD is byte-identical to the one
computed now — the tests fail identically with or without this arm.
Per the prereg, this is stop-and-report, NOT a refresh-to-fit: no
proof refresh was attempted. The refresh (a fresh real neutral panel
via the sanctioned `balance-proof-update.js` route) is owed by the
next run that touches a proof input or by the coordinator — it is
independent of this repair.

## Analyzer re-runs (bars 2–3) — verdicts as computed

- **takeseat: GO** (was NO-GO (substrate)). Primary sat 5/8 armed
  vs 0/8 baseline, pass; sanity baseSeatsEarned 5/8, pass; guard
  8/8; costBar pass (starvation 3 → 1, arm-only 0; median 116.5d →
  150d; pairDays 65 ≥ 14).
- **feareddoor: NO-GO stands.** Primary fails as recorded (feared
  entered 5/5, feared wins 5/5, wins 5 vs 5, winDelta 0). Sanity
  passes (baseSeatsEarned 6, baseSat 5, armedSat 5); guard 12/12;
  costBar passes.
- **darkwit fresh pair: NO-GO at pilot stands.** Primary fails as
  recorded (dark entered 0/8 armed, dark wins 0, winDelta −3).
  Sanity passes (baseSeatsEarned 5, baseSat 5, armedSat 2); guard
  8/8; costBar fails on starvation (5 vs 1, arm-only 5), as
  recorded.

The sim-sitmetric-sweep-b verdict (NO-GO on bars 1 and 4 as written)
stands as recorded and is NOT re-scored here: this arm delivers the
repaired analyzer, and the takeseat GO above is the repair's computed
output on the existing corpora, not a rewrite of that run's verdict.

## Wall numbers (this run's re-judged corpora)

No new sims: nothing moves. The re-run corpora (national / tableSat
/ wins, wave 4–5 unlocks, median survival):
- takeseat: baseline national 0/8, sat 0/8, wins 0/8, wave-4 7/8,
  wave-5 3/8, median 116.5d; armed national 0/8, sat 5/8, wins 0/8,
  wave-4 7/8, wave-5 4/8, median 150d. Invitations 5/8 both legs.
- feareddoor: national 0/12 both legs, sat 5/12 both legs, wins
  5/12 both legs, wave-4 12/12, wave-5 4/12, median 112.5d both
  legs. Invitations observed 4/12 (the end-of-run note from
  sweep-b still applies).
- darkwit fresh: baseline national 0/8, sat 5/8, wins 5/8, wave-4
  8/8, wave-5 5/8, median 90.5d; armed national 0/8, sat 2/8, wins
  2/8, wave-4 8/8, wave-5 4/8, median 86d.
- No telemetry deviation check was run: there is no new per-seed
  evidence glob for `telemetry-check.js` — this run re-judged
  existing corpora only.

## Metric review

- Bars 1–5 all hold exactly as pre-registered: the earned counts
  match the recorded counts on every known corpus (including the
  corrected darkwit-fresh expectation, sittings 5/8 → 2/8, which
  this arm does not re-litigate); the takeseat verdict computes GO;
  the feareddoor/darkwit verdicts stand with only `baseSeatsEarned`
  moving; the six sweep pairs judge identically to their goldens;
  the proof test is 33/33 green.
- **Bar 6 MISSES as written: the two measurement tests do not read
  9/9.** The cause is pre-existing base staleness (see Regression
  results), not this arm: the retained proof was built before
  `src/js/conversation.js` changed on master, and no file this arm
  touches is a proof input. Per §14 this is recorded here as a miss
  on bar 6 as written, NOT re-scored: the run verdict is NO-GO on
  bar 6, and the repair is not held hostage to a refresh this arm
  was explicitly forbidden to perform (prereg: "a stop-and-report,
  not a refresh-to-fit"). Proposed for the next run: refresh the
  retained proof with a fresh real neutral panel built on current
  master — that refresh covers the current inputs regardless of
  whether this repair lands first, since this repair touches no
  proof input.
- The takeseat overall flipping to GO is the repair's EXPECTED
  outcome, not a re-score: the sweep-b bar-4 re-run established
  that every other bar already passed and only the mislabeled
  sanity count failed. The repaired run computed GO with no other
  field moving, exactly as the prereg's metric-review note
  anticipated.

## Village assessment in plain words

No new villages were simulated — this run fixed the ruler, not the
village. What it found while measuring the ruler: the analyzer was
calling a priced seat a taken seat in reverse — after
sim-sitmetric-b correctly stopped counting priced seats as sits, the
sanity bar that needed the PRICED reading was left counting the
taken one, so a whole baseline leg that had earned five seats read
as having earned none, and the verdict flipped on a bookkeeping
error while every real number underneath it still passed. Now the
two readings sit side by side on every analyzed row — what the
table priced, and what anyone actually sat in — and the takeseat
verdict reads GO on the same villages, with the same sits, that it
read NO-GO on before. Nothing about any village changed; the count
did.

## Blanks filled or documented

- FILLED (measured): the takeseat analyzer's substrate-sanity
  earned count reads the priced seat (5/8 baseline, 0/8 taken) and
  its verdict computes GO; the same mislabeling repaired in the
  feareddoor (6/12) and darkwit (fresh 5/8) analyzers, whose
  verdicts stand.
- FILLED (measured): `pricedSeatOf` reads the priced seat on both
  corpus generations (old rows via raw `finalSeat`, new rows via
  `finalSeatPriced`), with `alignedSeat`/`seatTakenOf` semantics
  unchanged; cross-checked on all 80 re-run corpus rows.
- FILLED (measured): the six sweep-corpus pairs judge identically
  to their recorded goldens through the unchanged scorecard — the
  repair moves no judged value.
- DOCUMENTED (not built): the retained measurement proof is stale
  on current master (`src/js/conversation.js` changed after the
  proof panel was built) — a fresh real neutral panel refresh is
  owed by the next run that touches a proof input or by the
  coordinator; this arm was forbidden to refresh-to-fit and did
  not.
- DOCUMENTED (not built): the sweep path's `tableReach` line shows
  invited + sittings but not earned (priced) counts — adding an
  earned count there would change an observer file and invalidate
  the retained proof; proposed for the next run as a finding.
- DOCUMENTED (not built): the takeseat/feareddoor guard clauses
  compare the RAW corpus `finalSeat` between legs (priced on old
  corpora, taken-object on new) — inconsistent with the analyzer's
  aligned/taken reading, though it passes on the known corpora
  either way.
- DOCUMENTED (not built): `perseed-darkwit-b-armed` does not exist,
  so the darkwit analyzer cannot run on its defaults — the
  53201-baseline leg can only be judged per-row, not through a full
  analyzer verdict.

## Findings for the backlog

- [open] 2026-11-09 — sweep tableReach shows no earned count —
  the sweep-corpus compare's `tableReach` line shows invitations
  and sittings but not priced (earned) seats, so a corpus where
  villages earn seats and never sit still reads identically to one
  where they earn none. Adding an earned count means a scorecard
  change (observer file) plus a proof refresh; proposed for the
  next run, not built here (sim-pricedseat-b evidence).
- [open] 2026-11-09 — analyzer guard compares raw finalSeat —
  the takeseat/feareddoor guard clauses compare the RAW corpus
  `finalSeat` between legs, which is the PRICED seat on old corpora
  and the TAKEN seat (object) on new ones, while the analyzer's own
  `finalSeat` field is the aligned/taken seat. The comparison passes
  on the known corpora either way, but the two readings should be
  named explicitly in the guard (sim-pricedseat-b evidence).
- [open] 2026-11-09 — retained measurement proof stale on master —
  `src/js/conversation.js` (journey crisis r156, f496b0072) landed
  after the sweep-b proof panel was built, so
  `test-measurement-workflow.js` (8/9) and
  `test-measurement-proof-update.js` (load failure) fail on current
  master with "Proof source inputs are not current". The refresh (a
  fresh real neutral panel via `scripts/balance-proof-update.js`)
  is owed; it is independent of the pricedseat repair, which touches
  no proof input (sim-pricedseat-b evidence).
- [open] 2026-11-09 — darkwit analyzer has no default armed leg —
  `perseed-darkwit-b-armed` does not exist, so the darkwit analyzer
  cannot run on its defaults; the 53201-baseline leg is only
  judgeable per-row. Either commit a default armed leg or re-point
  the defaults at the fresh pair (sim-pricedseat-b evidence).

## Convergence

scale-onramp stays converging (NOT converged): the metric gap is
closed on the analyzer side, but the underlying picture is
unchanged — the full seat is still unreached, wins still come only
through the lesser seat, and the re-run corpora still sit 0–5 per
leg. No src/js change; nothing held unlanded except the
coordinator's landing call on the bar-6 miss (pre-existing cause,
see Metric review).

## Run notes (infrastructure)

- EPERM flap / index clobber: the prereg's safe-commit left the
  index showing the committed file as staged-deleted (the
  index-clobber class); repaired with `git ls-tree -r HEAD --
  <path> | git update-index --add --index-info`, verified
  hash-object == HEAD blob, `git status --short` empty, `git diff
  HEAD` empty. The /tmp scratch writes for the analyzer runs all
  succeeded (no preload needed this run).
