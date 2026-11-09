# sim-sitmetric-sweep-b — PRE-REGISTRATION (binding, §14)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T0330Z, axis
scale-onramp / winnability chain. Worker tree:
~/workspace/worktrees/sim-sitmetric-sweep-b, branch sim-sitmetric-sweep-b.
Base: master `55b5e5aae`. Scope: MEASUREMENT FIX only —
`scripts/lib/balance-scorecard.js` + `scripts/test-sitmetric-sweep-b.js`
(+ proof-refresh files if bar 3 requires them). ZERO src/js.

## The gap (from sim-sitmetric-b, Metric review + Blanks filled)

The §15 panel compare (`comparePanels`) now surfaces raw table
invitations alongside ruling-665 sittings per policy (`tableReach`,
sim-sitmetric-b). The sweep-corpus compare (`compareSweepCorpora`,
reached via `comparePanels` routing when both inputs are sweep-shaped)
does NOT: it judges `table` as the raw `row.table` flag
(`sweepMetric`: `row.table ?? row.tableInvited`) and prints nothing
else about the table. A sweep corpus where villages are invited and
never sit reads exactly like one where they are never invited. The
same side-by-side treatment is owed there.

Honest definitions (verified in code before writing this header):
- `row.table` (true sweep rows) = INVITATION ever observed
  (`tableWaiting` ever set; `scripts/sweep-compare.js:236-237`), NOT a
  sitting. `row.entered` = sat (`pg.tableDone` ever set).
- Sitstep instrument rows (the takeseat / feareddoor / darkwit /
  fightloop perseed corpora) carry no flat `table` / `entered` fields;
  they carry `daily` snapshots with `tableWaiting` / `tableDone` on
  every day, plus `takeseatStats.seatTaken`, `sitAttempts`, and the
  priced `finalSeat`. They ARE sweep-shaped (`isSweepRow`: flat row,
  policy/arm + seed, no `.row` / `.metrics`), so `comparePanels`
  routes them to the sweep path.
- `finalSeat` = seat TAKEN, `finalSeatPriced` = seat PRICED
  (sim-sitmetric-b). The sweep sittings count must use the TAKEN
  reading (`seatTakenOf` signals in `scripts/lib/seat-taken.js`),
  never the priced `finalSeat`.

## Primary metric

GO threshold — ALL four bars must hold, judged exactly as written:

1. The known cases read correctly on the sweep path (both legs fed to
   `comparePanels` → `compareSweepCorpora`; each arm's two legs share
   one policy label in the test so seeds pair — see Method):
   takeseat baseline invited **5/8** + sat **0/8** (invited count
   verified pre-prereg by read-only inspection of that leg's daily
   `tableWaiting`); takeseat armed invited 5/8 + sat 5/8; feareddoor
   seed 53210 invited on BOTH legs, sat on NEITHER (checked as a
   one-row before/after compare of that seed); darkwit 53201-baseline
   leg invited 3/8 + sat 0/8 (checked as a self-compare of that leg);
   darkwit fresh pair (seeds 53701–53708, pilot-baseline-fresh vs
   pilot-armed-fresh) sat 0/8 baseline and 5/8 armed. Judged `table`
   metric values byte-identical to the pre-change goldens (recorded
   from the unmodified code before the fix, see Method) on EVERY
   re-run corpus pair (takeseat, feareddoor, darkwit fresh pair,
   darkwit 53201-baseline self-compare, fightloop
   baseline/candidate).
2. Proof: `scripts/test-sitmetric-sweep-b.js` green, including (a) a
   broken-compare sensitivity — the invitation signal hidden from the
   fixture rows → `tableReach` is null (no invented counts, no false
   0); and (b) a judged-value-invariance check across all committed
   sweep corpora re-run in (1) — the full judged metrics arrays equal
   the pre-change goldens.
3. If the scorecard edit invalidates the retained observer-neutral
   maintenance proof (expected — it did for sim-sitmetric-b, whose
   scorecard edit changed an observer-file hash): refresh via the
   sanctioned `scripts/balance-proof-update.js` route with a fresh
   real panel, starting from the CURRENT proof (the fda320ccf refresh
   after the fightblend landing — never re-point to an older one).
   Both measurement tests 9/9 after the refresh
   (`scripts/test-measurement-workflow.js`,
   `scripts/test-measurement-proof-update.js`).
4. No historical verdict overturned: re-run the takeseat /
   feareddoor / darkwit analyzers on their existing corpora and
   confirm their verdicts stand (outputs identical — the analyzers
   are untouched; the only permitted change is none).

## Method

- Record the pre-change goldens FIRST (after this prereg is
  committed, before any scorecard edit): run the unmodified
  `compareSweepCorpora` on each corpus pair in (1) and store the
  judged `table` metric values (plus the full judged metrics arrays)
  as golden constants inside `scripts/test-sitmetric-sweep-b.js`.
  Goldens are a baseline record of the OLD code, not a verdict.
- Fix, in `compareSweepCorpora` only: attach a per-policy
  `tableReach` in the SAME shape as the §15 one —
  `{ invitedBefore, invitedAfter, sittingsBefore, sittingsAfter,
  cases, note }` — display only, never a contract metric, never part
  of the decision. Null when neither leg carries the invitation
  signal, so a missing flag is never printed as a false 0.
  Derivation per row (the row's own signals only, never invented):
  invited = `row.table` if present, else `row.tableInvited` if
  present, else `daily` tableWaiting-ever (true if any daily snapshot
  has `tableWaiting` true, false if daily snapshots exist and none
  does, null if no signal at all); sittings = `row.entered` if
  present, else the taken-signal (a `seatTaken` boolean, or
  `takeseatStats.seatTaken > 0`, or a `sitAttempts` entry with
  `ok: true`, or a `daily` entry with `tableDone: true` — the
  `seatTakenOf` signal set) true/false, null if no taken/not-taken
  signal at all. `markdown()` already renders `p.tableReach` for any
  policy — verify it renders for sweep reports; no markdown change
  unless the verification shows one is needed, in which case it is
  recorded here as an amendment, not silently added.
- Observer-file boundary (deliberate): `scripts/lib/seat-taken.js`
  is NOT in the `balance-panel.js` observerFiles list, so the sweep
  derivation is mirrored INLINE in the scorecard (which IS a listed
  observer file) with a comment citing `seat-taken.js` as canonical —
  NOT a runtime require of an unlisted file, which would let the
  compare change without invalidating the proof. A cross-check test
  asserts the inline sittings derivation agrees with `seatTakenOf`
  on every row of every re-run corpus, so drift is caught, not
  silent.
- Pairing: the arm corpora carry different policy names per leg
  (e.g. linkfeast-baseline vs linkfeast-armed), and the sweep compare
  pairs by policy+seed — so the test presents each arm's two legs
  under ONE shared policy label (the corpus files are untouched; the
  label is a test-side presentation choice, recorded in the test).
  The library does NOT rename policies.
- Re-run each touched analyzer read-only on its existing corpus and
  diff the output; the ONLY permitted change is none.
- Regression suites after the change (same pass counts as base
  where deterministic): `scripts/godpath/test-balance-scorecard.js`,
  `scripts/godpath/test-panel-contract-rulings.js`,
  `scripts/test-comparecontract-a.js`, `scripts/test-flippanel-b.js`,
  `scripts/test-flipsocial-b.js`, `scripts/test-sitmetric-b.js`.

## Other consumers (pre-run read-only inspection)

- `scripts/telemetry-check.js` does NOT consume compare output: it
  aggregates per-seed rows directly and never requires
  `balance-scorecard`. This change adds a field to the compare
  output only; sweep rows are untouched, so telemetry-check sees
  nothing new. No telemetry baseline is changed, silently or
  otherwise.
- `scripts/balance-windows.js` reads only `validity.decision` from
  `comparePanels` — the new display field is ignored there.
- `scripts/balance-panel.js` writes the compare report; the §15
  `tableReach` already flows through it the same way, so no new
  handling is needed.
- The only reader of the new field is `markdown()`, which already
  renders `p.tableReach` (added by sim-sitmetric-b).

## Guardrails

- `scripts/balance-metrics.json` untouched. Ruling 665 untouched.
  No `src/js` change. No push, no version bump, no live verification
  — report "done, pending coordinator landing".
- A miss on any of bars (1)–(4) is NO-GO, never re-scored (§14). A
  metric that proves wrong goes under "metric review" for the NEXT
  run. No verdict is re-scored.
- The expected invited counts in bar 1 are hypotheses from the
  sim-sitmetric-b priced counts (takeseat baseline/armed priced 5/8,
  darkwit 53201-baseline priced 3/8, darkwit armed priced 5/8,
  fightloop baseline priced 8/8 / candidate 7/8, feareddoor 53210
  priced on both legs; all taken counts already established there):
  they hold only if invitation-ever coincides with priced on these
  corpora. The takeseat-baseline 5/8 is pinned (verified pre-prereg).
  If any other count differs, the run reports the measured count and
  the hypothesis is what failed — the judged values (bar 1, second
  half) still bind. The sat counts are pinned throughout: they are
  the aligned-seat verdicts sim-sitmetric-b already established.

## Metric review (pre-run note)

The sweep `table` metric itself stays the raw invitation flag — that
is the existing judged definition on this path, and changing it would
be a re-score, not a display fix. The side-by-side line is what makes
the invited-vs-sat divergence visible without moving the judge. The
open question for the next run is whether any arm SHOULD judge on
sittings on the sweep path (a contract change, Steve-call), not
whether this run moves it.
