# sim-takeseat-pricedseat-b — PRE-REGISTRATION (binding, §14)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T1030Z, axis
scale-onramp / winnability chain. Worker tree:
~/workspace/worktrees/sim-takeseat-pricedseat-b, branch
sim-takeseat-pricedseat-b. Base: master `8419eefa4` (verified by
`git log --oneline -1` after rebase; rebase clean, no conflicts).
Scope: VERIFICATION of the already-landed pricedseat repair — see
"State found on arrival" below. ZERO src/js. NO scorecard change. No
new sims: the verification re-judges the existing committed corpora.

## State found on arrival (read-only inspection, before any judged computation)

- Commit `9d6ebf59c` ("sim-pricedseat-b: takeseat analyzer
  earned-count repair via pricedSeatOf") IS an ancestor of master
  `8419eefa4` (verified with `git merge-base --is-ancestor`). Its
  evidence (`evidence/2026-11-09/sim-pricedseat-b.md`, prereg
  `sim-pricedseat-b-prereg.md`) and proof test
  (`scripts/test-pricedseat-b.js`) are on this base.
- Code read confirms the repair present: `scripts/lib/seat-taken.js`
  `pricedSeatOf` prefers `finalSeatPriced`, falls back to
  `finalSeat`; all three analyzers
  (`takeseat/feareddoor/darkwit-b-analyze-20261107.js`) carry
  `finalSeatPriced: pricedSeatOf(o)` on each analyzed row and count
  substrate-sanity `baseSeats` from `r.finalSeatPriced`.
- Therefore this run does NOT re-apply the repair (there is nothing
  to re-apply — the defect the brief describes is gone on this
  base). It independently RE-VERIFIES the landed repair on current
  master: re-run the proof test and the three analyzers, re-check
  the six-pair goldens, and confirm the verdicts. If any check finds
  the repair absent, regressed, or a verdict moved, that is reported
  as a finding — not silently fixed, not re-scored.

## Corrected expectations (re-derived from the evidence files, not memory)

From `evidence/2026-11-08/sim-sitmetric-sweep-b.md` (Metric review
+ Analyzer re-runs): the sweep prereg's darkwit-fresh expectation
(0/8 → 5/8 sat) was WRONG — it imported sim-sitmetric-b's conflated
darkwit row, which paired the collapsed 53201 pilot corpus against
the fresh BASELINE leg. The verified-true corrected expectation for
the fresh pair (seeds 53701–53708) is **invited 5/8 → 6/8,
sittings 5/8 → 2/8** (baseline 5 sits, armed 2 walks — the darkwit
arm's own result, sim-darkwit-b.md). This run pins the corrected
expectation, not the conflated one.

From `evidence/2026-11-09/sim-pricedseat-b.md` (Before/after +
Analyzer re-runs), the repaired analyzer outputs this run must
reproduce on current master:
- takeseat: earned **5/8** baseline + 0/8 taken; armed 5/8 + 5/8;
  overall **GO** (primary sat 5/8 vs 0/8, sanity 5/8, guard 8/8,
  costBar pass).
- feareddoor: earned **6/12** baseline, taken 5/12; overall
  **NO-GO stands** (primary fails, winDelta 0); seed 53210 both
  legs earned 'lesser', taken 'none'.
- darkwit fresh pair: earned baseline 5/8, armed 6/8; overall
  **NO-GO at pilot stands** (dark entered 0/8 armed, winDelta −3);
  sanity 5/8, baseSat 5, armedSat 2.
- darkwit 53201-baseline leg (per-row): **3/8 earned + 0/8 taken**.

Goldens (full judged-metrics sha256 digests, from
`scripts/test-sitmetric-sweep-b.js` via sim-pricedseat-b): takeseat
`460a36fd…`, feareddoor `eeaa356c…`, darkwit-fresh `f202d5ba…`,
darkwit-53201 `460a36fd…`, feareddoor-53210 `53b95785…`,
fightloop `460a36fd…`; decisions `review_required` on all six.

## Primary metric

GO threshold — ALL bars must hold, judged exactly as written:

1. Substrate-sanity reads earned matching the recorded earned count
   on the takeseat pair (5/8 baseline, 0/8 taken; armed 5/8 + 5/8)
   through the repaired analyzers' `substrateSanity.baseSeatsEarned`,
   and the corrected darkwit-fresh expectation holds (sittings
   5/8 → 2/8, invited 5/8 → 6/8); feareddoor 6/12 earned,
   53201-baseline 3/8 earned per-row.
2. Judged table values byte-identical to the pre-change goldens on
   all six corpus pairs (digests above), through the unchanged
   scorecard.
3. Decisions unchanged except the substrate flip already recorded:
   takeseat verdict computes **GO**; feareddoor **NO-GO** and darkwit
   fresh **NO-GO at pilot** stand, with ONLY `baseSeatsEarned`
   differing from the pre-repair record (0→5, 5→6, 5→5). No other
   verdict field moves.
4. Proof green: `scripts/test-pricedseat-b.js` 33/33 PASS (the landed
   proof test for this repair; the brief's filename
   `test-takeseat-pricedseat-b.js` does not exist on this base — the
   repair's proof is `test-pricedseat-b.js`, and no duplicate test
   file is created for the same repair).

## Method

- Run `scripts/test-pricedseat-b.js` (33 checks: pricedSeatOf
  fixtures, known-case earned/taken counts, the three analyzer
  verdicts, six-pair invariance, old-corpus cross-check).
- Re-run the three analyzers on their existing corpora
  (takeseat, feareddoor, darkwit fresh pair with explicit dirs) and
  diff overall / baseSeatsEarned / baseSat / armedSat / primary /
  guard / costBar against the sim-pricedseat-b record; the ONLY
  permitted difference from that record is none.
- Regression suites at the recorded counts:
  `scripts/test-sitmetric-b.js` 34/34,
  `scripts/test-sitmetric-sweep-b.js` 30/30,
  `scripts/test-takeseat-b-20261107.js` 23,
  `scripts/test-feareddoor-b-20261107.js` 33,
  `scripts/test-darkwit-b-20261107.js` 23,
  `scripts/godpath/test-balance-scorecard.js` 35/35,
  `scripts/godpath/test-panel-contract-rulings.js` 9/9,
  `scripts/test-comparecontract-a.js` 25/25.
- Also run `scripts/godpath/test-measurement-workflow.js` and
  `scripts/godpath/test-measurement-proof-update.js` and record
  their result honestly: sim-pricedseat-b found them failing on a
  PRE-EXISTING cause (retained proof stale against
  `src/js/conversation.js`, changed after the proof panel was
  built). This run does NOT refresh the proof (not authorized by
  this brief; a refresh-to-fit is forbidden by the prior prereg)
  — it records whether the staleness still holds on `8419eefa4`.
- No new sims. No corpus file is modified. No game code is touched.
  The analyzers write scratch JSON to /tmp as usual.

## Guardrails

- `scripts/balance-metrics.json` untouched. Ruling 665 untouched.
  Contract digest unchanged. No `src/js` change. No push, no
  version bump, no live verification.
- A miss on any of bars (1)–(4) is NO-GO, never re-scored (§14). If
  a bar misses because the landed repair regressed on current
  master, the run reports the regression with the moved value named
  — it does not re-apply the repair mid-run (a re-application would
  be a new change needing its own prereg).
- The sim-sitmetric-sweep-b verdict (NO-GO on bars 1 and 4 as
  written) stands as recorded; this verification does not re-score
  it. The takeseat GO is the landed repair's computed output, not a
  rewrite of that run's verdict.

## Metric review (pre-run note)

- The sweep `table` metric's raw-invitation-flag label question
  ("Table sitting rate (seat taken...)") is a Steve-call, NOT this
  run's to change; it is carried as an open question, not fixed.
- The prior run's findings are carried, not re-litigated: sweep
  `tableReach` shows no earned count; analyzer guards compare the
  raw corpus `finalSeat`; the retained measurement proof was stale
  on base `ba21ca026`; `perseed-darkwit-b-armed` does not exist.
  This run re-checks only the proof-staleness item (above) and
  records whether it still holds on `8419eefa4`.
