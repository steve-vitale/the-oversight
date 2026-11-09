# sim-sitmetric-sweep-b — close the sweep-corpus side-by-side gap (evidence)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T0330Z, axis
scale-onramp / winnability chain. Worker tree:
~/workspace/worktrees/sim-sitmetric-sweep-b, branch sim-sitmetric-sweep-b.
Base: master `55b5e5aae`. Scope: MEASUREMENT FIX only —
`scripts/lib/balance-scorecard.js` + `scripts/test-sitmetric-sweep-b.js`
(+ proof-refresh files). ZERO src/js. No new sweep: the fix is proven
on the existing corpora plus derivation fixtures.
**Verdict: NO-GO on prereg bars 1 and 4 as literally written — both
misses are in expectations and in a predecessor's analyzer update,
not in this fix (see Metric review and Analyzer re-runs). Bar 3
(proof refresh) is DONE — completed by the coordinator after the
flap cleared (see below).** The
known cases read correctly (takeseat 5/8 + 0/8, feareddoor 53210,
darkwit 53201-baseline 3/8 + 0/8, fightloop), the judged `table`
values are byte-identical to the pre-change goldens on all six
re-run corpus pairs, the proof test is 30/30 green, and the
feareddoor and darkwit verdicts stand on re-run. The two misses:
(1) bar 1's darkwit-fresh expectation (0/8 → 5/8 sat) misidentified
the corpus — measured 5/8 → 2/8, verified true; (2) bar 4's
takeseat verdict does not stand — the analyzer's overall flips GO →
NO-GO (substrate) because sim-sitmetric-b's aligned-seat switch
made its substrate-sanity bar count taken seats as earned (0/8).
Full pre-registration (binding):
evidence/2026-11-08/sim-sitmetric-sweep-b-prereg.md.

## What was wrong

The §15 panel compare (`comparePanels`) already surfaces raw table
invitations alongside ruling-665 sittings per policy (`tableReach`,
sim-sitmetric-b). The sweep-corpus compare (`compareSweepCorpora`,
reached via `comparePanels` routing when both inputs are sweep-shaped)
did not: it judged `table` as the raw `row.table` flag
(`sweepMetric`: `row.table ?? row.tableInvited`) and printed nothing
else about the table. On the sweep path a corpus where villages are
invited and never sit read exactly like one where they are never
invited — and on the sitstep instrument corpora the judged `table`
metric read `not_observed` on every leg (those rows carry no flat
`table` flag at all), so the sweep path said nothing about the table
while the analyzers counted seats beside it.

## What changed (file + function)

- `scripts/lib/balance-scorecard.js` `compareSweepCorpora`: each
  policy now carries `tableReach` — the SAME shape as the §15 one
  (`invitedBefore` / `invitedAfter`, `sittingsBefore` /
  `sittingsAfter`, `cases`, `note`). Display only: computed from the
  rows, never a contract metric, never part of the decision (the
  review is computed from metrics only, before `tableReach` is
  attached), and `scripts/balance-metrics.json` is untouched
  (contract digest unchanged, ruling 665 untouched).
- New helpers `sweepInvitedOf` / `sweepSatOf` / `sweepTableReach`
  (exported for the proof test): the row's own signals only, never
  invented. Invited = the flat `row.table` flag, else the
  `row.tableInvited` alias, else the row's own daily snapshots
  (`tableWaiting` ever set — sitstep instrument rows carry no flat
  flag). Sittings = the flat `row.entered` flag, else the
  taken-signal set (the `seatTakenOf` signal order in
  `scripts/lib/seat-taken.js`). `tableReach` is null when neither
  leg carries the invitation signal, so a missing flag is never
  printed as a false 0. `markdown()` already renders `p.tableReach`
  for any policy — verified rendering for sweep reports, no markdown
  change was needed.
- Observer-file boundary (deliberate, recorded in the prereg): the
  sittings derivation is mirrored INLINE in the scorecard rather
  than required from `scripts/lib/seat-taken.js`, because that file
  is NOT in the `balance-panel.js` observerFiles list — a runtime
  require would let the compare change without invalidating the
  maintenance proof. A cross-check test asserts the inline mirror
  agrees with `seatTakenOf` on every row of every re-run corpus
  (73 rows, 0 disagreements), so drift is caught, not silent.
- Pairing note: the arm corpora carry different policy names per leg
  (e.g. linkfeast-baseline vs linkfeast-armed), and the sweep
  compare pairs by policy+seed — so the proof test presents each
  arm's two legs under ONE shared policy label (the corpus files are
  untouched; the label is a test-side presentation choice). The
  library does NOT rename policies.

No src/js change proved necessary. No push, no version bump, no live
verification — done, pending coordinator landing.

## Before / after on the known cases

All six re-run corpus pairs, through `comparePanels` → the sweep path:

| corpus pair | invited before → after | sittings before → after | judged `table` |
|---|---|---|---|
| takeseat baseline → armed (8 seeds) | **5/8 → 5/8** | **0/8 → 5/8** | not_observed both legs, byte-identical to golden |
| feareddoor baseline → armed (12 seeds) | **4/12 → 4/12** | **5/12 → 5/12** | not_observed both legs, byte-identical to golden |
| feareddoor seed 53210 only | **1/1 → 1/1** | **0/1 → 0/1** | not_observed, byte-identical to golden |
| darkwit 53201-baseline (self-compare, 8 seeds) | **3/8 → 3/8** | **0/8 → 0/8** | not_observed, byte-identical to golden |
| darkwit fresh pair 53701–53708 | **5/8 → 6/8** | **5/8 → 2/8** | not_observed both legs, byte-identical to golden |
| fightloop baseline → candidate (8 seeds) | **8/8 → 7/8** | **7/8 → 5/8** | not_observed, byte-identical to golden |

Decisions unchanged on all six pairs (`review_required`, from the
`not_observed` metrics — the pre-change behavior). The full judged
metrics arrays are byte-identical to the pre-change goldens on every
pair (sha256 digests: takeseat / darkwit-53201 / fightloop
`460a36fd…`, feareddoor `eeaa356c…`, darkwit-fresh `f202d5ba…`,
feareddoor-53210 `53b95785…`).

Two readings worth naming, because the side-by-side line is what
makes them visible:

1. **Feareddoor invited 4/12 while sittings are 5/12.** Two rows per
   leg (53206, 53209) priced AND took a lesser seat
   (`takeseatStats.seatTaken` 1, a successful recorded sit verb, a
   daily `tableDone`) yet NO daily snapshot ever shows
   `tableWaiting`. Both sits happened on the run's final day (day 93
   and day 102), after the last daily snapshot (91 and 100
   snapshots). The daily-snapshot invitation signal misses
   end-of-run announce-and-sit. The sittings signal is unaffected
   (the sit is recorded by the verb and the counter). The line now
   shows the divergence (4 invited, 5 sat) instead of hiding it;
   the "sat ⇒ invited" inference that would close it is proposed
   for the next run (see Metric review), not applied mid-run.
2. **Darkwit fresh pair: sittings 5/8 → 2/8.** That is the darkwit
   arm's own result (sim-darkwit-b.md: baseline 5 sits, armed 2
   walks; substrate sanity "5 lesser, 5 sat"), not a misread — the
   prereg's expectation for this pair (0/8 → 5/8) imported
   sim-sitmetric-b's conflated darkwit row, which paired the
   collapsed 53201 baseline against the fresh BASELINE as "armed".
   See Metric review.

## Proof

`scripts/test-sitmetric-sweep-b.js` — **30/30 PASS**: derivation
fixtures on synthetic rows (10, incl. the priced-is-not-invited
fixture); known-case reads + judged-value invariance on all six
re-run corpus pairs (12, incl. the full-metrics sha256 digests);
markdown rendering of the sweep reach line (2); broken-compare
sensitivity (5: invitation signal hidden → `tableReach` null with
judged values still golden and no reach line in the markdown; bare
rows with no flag → null; flat rows with the flag → counted from
the flag); cross-check of the inline sittings derivation against
canonical `seatTakenOf` on every re-run corpus row (1 check over 73
rows, 0 disagreements).

## Regression results

Panel/compare suites (prereg list) — all green at the recorded counts:
- `scripts/godpath/test-balance-scorecard.js`: 35/35 PASS.
- `scripts/godpath/test-panel-contract-rulings.js`: 9/9 PASS.
- `scripts/test-comparecontract-a.js`: 25/25 PASS (incl. "existing:
  sweep-corpus comparison still works").
- `scripts/test-flippanel-b.js`: 25/31 PASS — exactly the recorded
  count; the 6 failures ARE the recorded NO-GO verdict, not tooling
  failures.
- `scripts/test-flipsocial-b.js`: 38/50 PASS — exactly the recorded
  count; the 12 failures are the recorded verdict bars.
- `scripts/test-sitmetric-b.js`: 34/34 PASS (incl. its live leg).

[BAR 3 — DONE (coordinator resume, after the flap cleared ~05:09Z).
Fresh real neutral panel built on this branch —
`node scripts/balance-panel.js --out
evidence/2026-11-09/neutral-sitmetric-sweep-20261109 --seeds 7
--policies capable,risk-aware,socialite,winseek --days 150`:
"4 cases, 0 cached jobs", neutrality matching on all 4 policies,
sourcesStable true. `node scripts/balance-proof-update.js
evidence/2026-11-09/neutral-sitmetric-sweep-20261109/panel.json.gz`
re-pointed `scripts/balance-proof.json` from the fda320ccf proof to
the new panel (digest 4e4070afe68e561c; scorecard hash now
073eea95…). Both measurement tests read 9/9 after the refresh
(`test-measurement-workflow.js` 9 passed, 0 failed;
`test-measurement-proof-update.js` 9 passed, 0 failed). The three
analyzers were re-run WITHOUT the /tmp-write preload and confirmed
identical verdicts (takeseat NO-GO (substrate), feareddoor NO-GO,
darkwit fresh NO-GO). The panel's `cases/` cache is NOT committed.]

[DONE — bar 3 (coordinator resume, after the flap cleared ~05:09Z):
fresh real neutral panel
`evidence/2026-11-09/neutral-sitmetric-sweep-20261109/` (4 cases,
0 cached jobs, neutrality 4/4, sourcesStable true) re-pointed the
proof from fda320ccf; both measurement tests read 9/9 after. The
three analyzers were re-run without the preload and confirmed
identical verdicts.]

## Analyzer re-runs (bar 4) — takeseat verdict does NOT stand

Re-ran all three analyzers on their existing corpora (read-only on
the corpora; the analyzers write their scratch analysis JSON to
/tmp, which the EPERM flap refused at first — re-ran with a preload
that skips ONLY the /tmp scratch write, computation untouched; see
the note below. If the flap clears, re-run cleanly and confirm
identical output):

- **feareddoor: verdict STANDS — NO-GO** (the recorded verdict).
  Primary: feared entered 5/5 armed, feared wins 5/5, wins 5 vs 5,
  winDelta 0 (the "+2 more wins" clause misses, as recorded).
  Substrate sanity passes (baseSeatsEarned 5, baseSat 5, armedSat
  5); guard 12/12; costBar passes. Wall: national 0/12, tableSat
  5/12, wins 5/12, wave-4 unlock 12/12, wave-5 unlock 4/12,
  wave-5 faced 4/12, median survival 112.5d both legs.
- **darkwit (fresh pair 53701–53708): verdict STANDS — NO-GO at
  pilot** (the recorded verdict). Primary: dark witness entered 0/8
  armed, dark wins 0, winDelta −3. Substrate sanity passes
  (baseSeatsEarned 5, baseSat 5, armedSat 2); guard 8/8; costBar
  fails on starvation (5 vs 1, arm-only 5), as recorded. Wall:
  baseline national 0/8, tableSat 5/8, wins 5/8, wave-4 unlock 8/8,
  wave-5 unlock 5/8, wave-5 faced 2/8, median survival 90.5d;
  armed national 0/8, tableSat 2/8, wins 2/8, wave-4 unlock 8/8,
  wave-5 unlock 4/8, wave-5 faced 1/8, median survival 86d.
- **takeseat: verdict does NOT stand — analyzer overall flips GO →
  "NO-GO (substrate — sit drive unjudged)".** Primary still passes
  (sat 5/8 armed vs 0/8 baseline); guard 8/8; costBar passes. The
  flip is in substrate sanity: `baseSeatsEarned` reads **0/8**
  (bar ≥3/8) because the analyzer counts `finalSeat` — which
  sim-sitmetric-b redefined as the TAKEN seat — as "earned". The
  baseline earned (priced) 5 lesser seats but sat 0, so the sanity
  bar that the takeseat evidence records as "✓ 5/8" now reads 0/8.
  Root cause is sim-sitmetric-b's analyzer update, NOT this run
  (this run touches no analyzer): sim-sitmetric-b's own evidence
  says "arms that need the 'earned' reading must read
  finalSeatPriced (new corpora) or the raw priced seat (old
  corpora)" — the takeseat analyzer's substrate-sanity bar is
  precisely such an arm, and it was switched to the aligned seat
  instead. The repair (follow-up arm, not this run): the
  substrate-sanity earned count should read the priced seat
  (`pricedSeatOf`), in takeseat and — for the same mislabeling,
  though no verdict flips there — in the feareddoor/darkwit
  analyzers' `baseSeatsEarned` fields (feareddoor's reads 5, the
  taken count, where priced is 6; darkwit fresh reads 5, where
  priced is also 5). Recorded as a finding below; NOT fixed here
  (stay on axis). Wall: baseline national 0/8, tableSat 0/8, wins
  0/8, wave-4 unlock 7/8, wave-5 unlock 3/8, wave-5 faced 0/8,
  median survival 116.5d; armed national 0/8, tableSat 5/8, wins
  0/8, wave-4 unlock 7/8, wave-5 unlock 4/8, wave-5 faced 2/8,
  median survival 150d.

Flap note: the three analyzer runs above used a preload
(`/tmp/preload-skip-tmp-write.js`, not committed) that skips ONLY
`fs.writeFileSync` calls to `/tmp/*` paths — the analyzers print
their verdict on stdout after writing their scratch JSON to /tmp,
and the flap refused that write. Computation unmodified; the
verdicts above come from the analyzers' real code on the committed
corpora.

## Wall numbers (this run's judged panels)

No new sims: nothing moves. The re-run corpora as the sweep path now
reports them, with the analyzer walls alongside (national / tableSat
/ wins, wave 4–5 unlocks, median survival):
- takeseat: baseline national 0/8, sat 0/8, wins 0/8, wave-4 7/8,
  wave-5 3/8, median 116.5d; armed national 0/8, sat 5/8, wins 0/8,
  wave-4 7/8, wave-5 4/8, median 150d. Invitations 5/8 both legs.
- feareddoor: national 0/12 both legs, sat 5/12 both legs, wins
  5/12 both legs, wave-4 12/12, wave-5 4/12, median 112.5d both
  legs. Invitations observed 4/12 (see the end-of-run note above).
- darkwit fresh: baseline national 0/8, sat 5/8, wins 5/8, wave-4
  8/8, wave-5 5/8, median 90.5d; armed national 0/8, sat 2/8, wins
  2/8, wave-4 8/8, wave-5 4/8, median 86d.
- fightloop: sittings 7/8 → 5/8, invitations 8/8 → 7/8; wins on
  these corpora are unchanged (the judged `won` metric is
  byte-identical to the pre-change goldens). The measurement fix
  changes how the seat is REPORTED, not what any village did.

## Metric review

- **Bar 1 as written MISSES on one expectation: the darkwit fresh
  pair.** The prereg pinned "sat 0/8 baseline and 5/8 armed" for
  seeds 53701–53708; the measured, verified-true values are 5/8
  baseline and 2/8 armed (invited 5/8 → 6/8). The error is mine, in
  the prereg: I imported sim-sitmetric-b's darkwit row ("baseline
  3/8 → 0/8; armed 5/8 → 5/8") without noticing it conflates two
  different bands — its "baseline" is the collapsed 53201 pilot
  corpus (kept only as the collapse record) and its "armed" is the
  fresh BASELINE leg (5 priced, 5 taken), not the fresh armed leg
  (6 priced, 2 taken). The darkwit arm's own evidence
  (sim-darkwit-b.md) states the fresh pair plainly: baseline 5
  sits, armed 2 walks. The fix reads the corpora correctly; the
  expectation was wrong. Per §14 this is recorded here as a miss on
  bar 1 as written, NOT re-scored: the verdict of this run is
  NO-GO on the bar as written, and the corrected expectation
  (darkwit fresh pair: invited 5/8 → 6/8, sittings 5/8 → 2/8) is
  proposed for the NEXT run. The landing call belongs to the
  coordinator: the change itself is proven correct on every other
  known case and moves no judged value.
- **The feareddoor invitation count (4/12) is a measured count, not
  a pinned one.** The prereg's hypothesis (invited == priced, 6/12)
  fails there: 2 rows per leg sat on the final day after the last
  daily snapshot, so the snapshot signal never saw their
  invitation. The derivation as pre-registered counts only
  OBSERVED invitations, and the evidence file says so. Proposed
  revision for the next run: count a row as invited when it sat
  (a sit requires an offer — "sat ⇒ invited"), which would read
  6/12 on both feareddoor legs; that inference was NOT applied here
  because the prereg binds the derivation to observed signals only.
- The primary metric otherwise held and discriminated: the takeseat
  baseline now reads invited 5/8 + sat 0/8 side by side (the exact
  divergence the §15 compare exposed on panels), the 53210 case
  reads invited on both legs and sat on neither, and the judged
  values did not move on any pair. No re-scoring was available or
  used.
- The sweep `table` metric itself stays the raw invitation flag —
  that is the existing judged definition on this path, and changing
  it would be a re-score, not a display fix. The side-by-side line
  is what makes the invited-vs-sat divergence visible without
  moving the judge. The open question for the next run is whether
  any arm SHOULD judge on sittings on the sweep path (a contract
  change, Steve-call), not whether this run moves it.

## Village assessment in plain words

No new villages were simulated — this run fixed the ruler, not the
village. What it found while measuring the ruler: on the sweep path
the table used to be invisible twice over — the judged metric said
nothing at all on the instrument corpora (not_observed), and the
compare printed nothing beside it. Now the compare says, per leg,
how many villages were invited and how many sat. The most telling
pair is the takeseat baseline: invited five times, sat never — the
whole leg had the table in front of it and nobody took a seat. The
feareddoor legs show the opposite wrinkle: five sat while only four
invitations were ever caught on camera, because two sits happened
on the last day after the last snapshot. Both readings are now on
the record where anyone can see them.

## Blanks filled or documented

- FILLED (measured): the sweep-corpus compare surfaces raw table
  invitations alongside sittings, on all six re-run corpus pairs
  (takeseat 5/8 + 0/8 → 5/8 + 5/8; feareddoor 4/12 + 5/12 both
  legs; 53210 1/1 + 0/1 both legs; darkwit 53201-baseline 3/8 +
  0/8; darkwit fresh 5/8 + 5/8 → 6/8 + 2/8; fightloop 8/8 + 7/8 →
  7/8 + 5/8).
- FILLED (measured): judged-value invariance proven across all six
  pairs (full judged-metrics sha256 digests identical to the
  pre-change goldens; decisions unchanged).
- DOCUMENTED (not built): the takeseat analyzer's overall verdict
  flips GO → NO-GO (substrate) under sim-sitmetric-b's aligned-seat
  switch — its substrate-sanity bar counts the TAKEN seat as
  "earned" (0/8) where the takeseat evidence records earned 5/8.
  Repair (follow-up arm): the earned count should read the priced
  seat (`pricedSeatOf`); same mislabeling in the feareddoor/darkwit
  analyzers' `baseSeatsEarned` fields (no verdict flip there).
- FILLED (coordinator resume): observer-neutral maintenance proof
  refresh — fresh real neutral panel
  (`evidence/2026-11-09/neutral-sitmetric-sweep-20261109/`, 4 cases,
  neutrality 4/4, sourcesStable true) re-pointed the proof from
  fda320ccf; both measurement tests 9/9 after. The panel's `cases/`
  cache is not committed.

## Findings for the backlog

- [open] 2026-11-08 — sweep-corpus invitation signal — the
  daily-snapshot invitation derivation misses end-of-run
  announce-and-sit: 2/12 feareddoor rows per leg sat on the final
  day after the last daily snapshot, so `tableReach` reads invited
  4/12 against sittings 5/12. Proposed: count a row as invited when
  it sat ("sat ⇒ invited"), or have the instrument record an
  end-state tableWaiting/tableDone in the row (sim-sitmetric-sweep-b
  evidence; the inference was deliberately NOT applied here — the
  prereg binds the derivation to observed signals only).
- [open] 2026-11-08 — takeseat analyzer substrate sanity reads
  taken as earned — sim-sitmetric-b redefined the analyzers'
  `finalSeat` as the TAKEN seat, but the takeseat analyzer's
  substrate-sanity bar ("baseline lesser ≥3/8") needs the EARNED
  (priced) reading: it now counts 0/8 where the takeseat evidence
  records earned 5/8, flipping the analyzer's overall verdict GO →
  NO-GO (substrate) although the primary (sat 5/8 vs 0/8), guard
  (8/8) and cost bar all still pass. Repair: the earned count
  should read the priced seat (`pricedSeatOf`); same mislabeling in
  the feareddoor/darkwit analyzers' `baseSeatsEarned` fields (no
  verdict flip there — feareddoor reads 5 taken where priced is 6,
  darkwit fresh reads 5 where priced is also 5). Found by the
  sim-sitmetric-sweep-b bar-4 re-run (sim-sitmetric-b evidence +
  sim-takeseat-b.md metric review).
  sim-sitmetric-b evidence table's "darkwit baseline 3/8 → 0/8;
  armed 5/8 → 5/8" conflates two bands: the baseline is the
  collapsed 53201 pilot corpus and the "armed" is the fresh
  BASELINE leg (5 priced, 5 taken); the fresh ARMED leg is 6
  priced, 2 taken. Any future reader re-running those analyzers
  should use the fresh pair (53701–53708) and expect sittings 5/8
  → 2/8 (sim-sitmetric-sweep-b evidence + sim-darkwit-b.md).
- [open] 2026-11-08 — sweep `table` metric definition — the sweep
  path judges `table` as the raw invitation flag while the contract
  labels it "Table sitting rate (seat taken...)". The side-by-side
  line makes the divergence visible, but the judged definition
  itself is still invitation-as-sitting on true sweep rows. Whether
  any arm should judge on sittings on the sweep path is a contract
  change (Steve-call), not a display fix (sim-sitmetric-sweep-b
  metric review).

## Convergence

scale-onramp stays converging (NOT converged): the metric gap is
closed on the sweep path, but the underlying picture is unchanged
— the full seat is still unreached, wins still come only through
the lesser seat, and the re-run corpora still sit 0–5 per leg. No
src/js change; nothing held unlanded except the coordinator's
landing call on the bar-1 expectation miss (see Metric review).
