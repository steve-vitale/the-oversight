# sim-pricedseat-b — PRE-REGISTRATION (binding, §14)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T0630Z, axis
scale-onramp / winnability chain. Worker tree:
~/workspace/worktrees/sim-pricedseat-b, branch sim-pricedseat-b.
Base: master `ba21ca026`. Scope: MEASUREMENT FIX only —
`scripts/lib/seat-taken.js` (pricedSeatOf) + the three seat-counting
analyzers' substrate-sanity earned counts
(`scripts/takeseat-b-analyze-20261107.js`,
`scripts/feareddoor-b-analyze-20261107.js`,
`scripts/darkwit-b-analyze-20261107.js`) + `scripts/test-pricedseat-b.js`.
ZERO src/js. NO scorecard change. No new sims: the repair is proven
by re-judging the existing committed corpora.

## The defect (from sim-sitmetric-sweep-b, bar 4 re-run)

The takeseat analyzer's substrate-sanity bar ("baseline lesser
>=3/8") counts TAKEN seats as EARNED: `analyzeSeed` sets
`finalSeat: alignedSeat(o)` (the seat actually taken, per
sim-sitmetric-b), and the sanity count reads `r.finalSeat ===
'lesser' || 'full'`. On the takeseat baseline leg — sitting switched
off, 5 lesser seats PRICED, 0 taken — the sanity bar reads 0/8
against the recorded earned 5/8, flipping the analyzer's overall
verdict GO → "NO-GO (substrate — sit drive unjudged)" although the
primary (sat 5/8 armed vs 0/8 baseline), guard (8/8) and cost bar all
still pass. The same mislabeling sits in the feareddoor/darkwit
analyzers' `baseSeatsEarned` fields (feareddoor reads 5 taken where
priced is 6; darkwit fresh reads 5 where priced is also 5) — no
verdict flips there, but the field is wrong in the same way.

## Honest definitions (verified in code before writing this header)

- OLD corpora (all committed perseed corpora, written by the
  pre-sitmetric-b instrument): `row.finalSeat` is the PRICED seat —
  the raw `Game.tableSeat()` object `{seat, detail}` — and there is
  no `finalSeatPriced` field and no `seatTaken` boolean. Verified by
  read-only inspection: takeseat baseline priced 5/8, armed 5/8;
  darkwit 53201-baseline priced 3/8; feareddoor baseline priced 6/12
  (seed 53210 priced 'lesser', taken 0); darkwit fresh baseline
  priced 5/8, fresh armed priced 6/8.
- NEW corpora (written by the fixed instrument,
  `sitstep-instrument-20261107.js` finalize): `row.finalSeat` is the
  TAKEN seat (`{seat: 'none', ...}` when nothing was taken),
  `row.finalSeatPriced` is the PRICED seat (the same `tableSeat()`
  object), `row.seatTaken` is the taken boolean. No new corpus is
  committed yet; the repair must read BOTH shapes correctly.
- `pricedSeatOf(row)` in `scripts/lib/seat-taken.js` currently reads
  ONLY `row.finalSeat` (string or `{seat}` object). That is the
  priced seat on old rows — and the TAKEN seat on new rows. The
  repair is to prefer `row.finalSeatPriced` when present and fall
  back to `row.finalSeat` when absent, so one derivation reads the
  priced seat on both corpus generations. `alignedSeat`/`seatTakenOf`
  semantics are unchanged by this (verified in the proof test:
  every existing `test-sitmetric-b.js` helper fixture still reads
  identically).
- The "earned" count is the PRICED count: a seat the table priced
  for the run, whether or not anyone sat in it. The "taken" count
  stays `alignedSeat` / `takeseatStats.seatTaken`. The two readings
  stay separate fields on every analyzed row (`finalSeat` = taken,
  `finalSeatPriced` = priced) — never merged, never redefined.

## Primary metric

GO threshold — ALL bars must hold, judged exactly as written:

1. Earned counts equal the recorded earned counts on the known
   corpora, read through the REPAIRED analyzers'
   `substrateSanity.baseSeatsEarned` (and, for the single-seed case,
   through `analyzeSeed` on that row):
   - takeseat baseline **5/8 earned + 0/8 taken** (armed 5/8 earned
     + 5/8 taken, recorded for the same run).
   - darkwit 53201-baseline leg **3/8 earned + 0/8 taken** (per-row
     read — `perseed-darkwit-b-armed` does not exist, so the darkwit
     analyzer cannot run on its defaults; the leg is judged through
     `analyzeSeed`/`pricedSeatOf` on its 8 rows).
   - feareddoor seed 53210, both legs: earned **'lesser'**, taken
     **'none'**.
   - feareddoor baseline **6/12 earned** (taken 5/12).
   - darkwit fresh baseline **5/8 earned** (fresh armed 6/8 earned).
2. The takeseat verdict computes **GO** under the repaired analyzer
   (primary sat 5/8 vs 0/8, sanity 5/8, guard 8/8, costBar pass —
   all as recorded in the sweep-b re-run except the sanity count,
   which is the defect). This is the re-judgment this arm delivers;
   it does NOT re-score sim-sitmetric-sweep-b's verdict (see Metric
   review).
3. The feareddoor and darkwit verdicts STAND, with ONLY
   `baseSeatsEarned` changing: feareddoor stays **NO-GO** (primary
   fails: winDelta 0), baseSeatsEarned 5 → 6; darkwit fresh stays
   **NO-GO at pilot** (primary fails: dark entered 0/8 armed),
   baseSeatsEarned 5 → 5 (unchanged). No other verdict field moves
   on any re-run.
4. All six corpus pairs from sim-sitmetric-sweep-b judge identically
   to their recorded goldens through the UNCHANGED scorecard
   (full judged-metrics sha256 digests, from
   `scripts/test-sitmetric-sweep-b.js`): takeseat `460a36fd…`,
   feareddoor `eeaa356c…`, darkwit-fresh `f202d5ba…`,
   darkwit-53201 `460a36fd…`, feareddoor-53210 `53b95785…`,
   fightloop `460a36fd…`; decisions `review_required` on all six.
5. Proof: `scripts/test-pricedseat-b.js` green, including (a) unit
   legs on the known cases (old-row priced, new-row
   `finalSeatPriced` preferred over a taken `finalSeat`, null/edge
   rows, `alignedSeat` unchanged on every fixture); (b) the
   re-judged goldens byte-identical except the corrected earned
   counts; (c) the six-pair invariance check of bar 4 re-run inside
   the proof test itself.
6. Regression suites green at the recorded counts:
   `scripts/test-sitmetric-b.js` 34/34,
   `scripts/test-sitmetric-sweep-b.js` 30/30,
   `scripts/test-takeseat-b-20261107.js` (23 checks, incl. its live
   leg), `scripts/test-feareddoor-b-20261107.js` 33,
   `scripts/test-darkwit-b-20261107.js` 23,
   `scripts/godpath/test-balance-scorecard.js` 35/35,
   `scripts/godpath/test-panel-contract-rulings.js` 9/9,
   `scripts/test-comparecontract-a.js` 25/25,
   `scripts/test-measurement-workflow.js` 9/9 and
   `scripts/test-measurement-proof-update.js` 9/9 (the scorecard is
   untouched, so the retained proof must stay valid — if either
   measurement test fails, the run stops and reports it, it does not
   refresh the proof to fit).

## Method

- Record the pre-repair analyzer outputs FIRST (after this prereg is
  committed, before any repair edit): run the three analyzers
  unmodified on their corpora and store the verdict fields
  (overall, baseSeatsEarned, baseSat, armedSat, primary, guard,
  costBar pass) as the before-record in the evidence file. The
  darkwit default pair cannot run (`perseed-darkwit-b-armed` does
  not exist); its before-record is the fresh pair with explicit
  dirs, as the sweep-b re-run did.
- Fix, in `scripts/lib/seat-taken.js` only, `pricedSeatOf`: prefer
  `row.finalSeatPriced` when it is present (non-null and yielding a
  seat string), else fall back to `row.finalSeat` (string or
  `{seat}` object, as today). `seatTakenOf` and `alignedSeat`
  untouched. Comment cites the two corpus generations.
- Fix, in each of the three analyzers, `analyzeSeed`: add
  `finalSeatPriced: pricedSeatOf(o)` next to the existing
  `finalSeat: alignedSeat(o)`, and count the substrate-sanity
  `baseSeats` from `r.finalSeatPriced` instead of `r.finalSeat`.
  Nothing else in the analyzers moves: the wall's
  `lesserSeats`/`fullSeats` keep counting the TAKEN seat
  (`r.finalSeat`), the guard keeps its existing seat comparison,
  the primary/guard/cost bars are untouched, and the sanity bar
  thresholds are untouched. The analyzers already require
  `lib/seat-taken.js`; the import extends to `pricedSeatOf` — no new
  dependency, and no require from the scorecard (hard boundary:
  `seat-taken.js` is NOT in `balance-panel.js`'s observerFiles list,
  so the scorecard must NOT require it; this arm does not touch the
  scorecard at all).
- Re-run the three analyzers on the same corpora and diff the
  verdicts against the before-record; the ONLY permitted changes
  are the `baseSeatsEarned` values in bar 1/3 and the takeseat
  overall flipping to GO in bar 2.
- Re-judge the six sweep pairs through the unchanged
  `comparePanels` and compare the full judged-metrics digests to
  the goldens in bar 4.
- No new sims. No corpus file is modified. The analyzers write
  their scratch JSON to /tmp as usual (the EPERM flap may refuse
  that write; if so, re-run with the sweep-b preload that skips
  ONLY the /tmp scratch write, computation untouched, and say so).

## Other consumers (pre-run read-only inspection)

- `scripts/test-sitmetric-b.js` pins `pricedSeatOf` on old-row
  shapes (`finalSeat` only, no `finalSeatPriced`) and on
  `alignedSeat` fixtures — the fallback preserves all of them.
  No other file requires `pricedSeatOf` today (grep: only
  `seat-taken.js` itself and `test-sitmetric-b.js`).
- The 11 analyzers sim-sitmetric-b switched to `alignedSeat` keep
  reading the TAKEN seat through `finalSeat`; only the three
  analyzers whose sanity bar needs the EARNED reading gain a
  `finalSeatPriced` field. The other eight analyzers are untouched
  (their `finalSeat`-based counts are sit counts, which is correct
  for them).
- `scripts/telemetry-check.js` aggregates per-seed rows directly
  and never reads analyzer output; nothing here changes a corpus
  row. No telemetry baseline is changed.
- The scorecard is untouched, so `scripts/balance-proof.json`
  stays valid and no proof refresh is owed. (If a measurement test
  fails anyway, that is a stop-and-report, not a refresh-to-fit.)

## Guardrails

- `scripts/balance-metrics.json` untouched. Ruling 665 untouched.
  Contract digest unchanged. No `src/js` change. No push, no
  version bump, no live verification — report "done, pending
  coordinator landing".
- A miss on any of bars (1)–(6) is NO-GO, never re-scored (§14). A
  metric that proves wrong goes under "metric review" for the NEXT
  run. No verdict is re-scored — in particular, the
  sim-sitmetric-sweep-b verdict (NO-GO on bars 1 and 4 as written)
  stands as recorded; this arm delivers the repaired analyzer, and
  the takeseat GO in bar 2 is the repair's computed output on the
  existing corpora, not a rewrite of that run's verdict.
- The earned counts in bar 1 are pinned from the recorded evidence
  (sim-sitmetric-b's priced/aligned table + sim-takeseat-b /
  sim-darkwit-b / sim-feareddoor-b) and verified pre-prereg by
  read-only inspection of the corpus rows. If any measured count
  differs, the run reports the measured count and the hypothesis is
  what failed — the repair is judged against the pinned counts, not
  re-fitted to whatever it reads.

## Metric review (pre-run note)

- The takeseat overall flipping to GO under the repaired analyzer
  is the repair's EXPECTED outcome, not a re-score: the
  sweep-b bar-4 re-run established that every other bar already
  passes and only the mislabeled sanity count fails. If the
  repaired run computes anything other than GO for takeseat (e.g.
  the guard or cost bar moves), that is a NO-GO on bar 2 and the
  run reports the full verdict diff.
- The darkwit 53201-baseline leg has no armed leg to pair with
  (no `perseed-darkwit-b-armed` dir), so its earned count is
  verified per-row, not through a full analyzer verdict. The
  darkwit verdict that "stands" in bar 3 is the fresh pair's, as
  re-run by sweep-b.
- The sweep path's `tableReach` line shows invited + sittings but
  not earned (priced) counts. Adding an earned count there would
  change an observer file and invalidate the retained proof the
  sweep-b coordinator just refreshed — out of this arm's scope. It
  is proposed for the next run as a finding, not built here.
- The takeseat/feareddoor guard clauses compare the RAW corpus
  `finalSeat` between legs (priced on old corpora, taken-object on
  new). That comparison is not the assigned defect and is not
  changed here; it passes on the known corpora either way. Noted
  as a finding for the backlog.
