# sim-scale-onramp round 1115Z (coordinator evidence, written 2026-10-28 in the teleingest landing run)

Coordinator round, axis scale-onramp. This file records the 1115Z round,
which was verified but never committed because the container EPERM flap
blocked all .git writes at the time. It is committed alongside the
teleingest landing (run fleshout-20261028T1315Z), which closes the two
items this round held open. Full detail lives in the convergence tracker
review for run fleshout-loop-b-20261028T1115Z and in
hidden_files/run-1215-notes.md.

## What landed in this round's window

- sim-fullseat-stage-a: TABLE.md full-seat stage >= 3 -> >= 2 per
  deedGateReady fixture proof (22/22); audit only, zero src/js.
  Landed a55b293ca (on master before this round's holds were recorded).

## What this round held (both now landed by the 1315Z run)

- sim-partyfinish-a — VERIFIED, NOT LANDED at 1115Z/1215Z: cornered-party
  hold mechanism (fieldFights.js +37/-5, havenGrowth.js lingererSortie
  passes cornered=true), sortie-only driver, counted-finish GO.
  Proof 12/12, analyzer GO on the stored corpus (counted finishes 18 vs
  baseline 0; median 140 vs 146; starvation 1 vs 1). Landed by the 1315Z
  run as 37aa0a4fb (rebased onto master, proof + analyzer re-run, fresh
  single-seed armed reproduction seed 75101: 162d, wave 4, lesser win,
  pf counters identical to the stored row). [needs-eyes] (combat change).
- sim-teleingest-a — HELD, NOT MERGED at 1115Z/1215Z: telemetry-check
  --sweep-rows schema-aligned ingest (seed-row filter, national ->
  nationalEver / wins -> won aliases, wall line, underscore-baseline
  preservation). Landed by the 1315Z run via cherry-pick onto master with
  the sibling recorder-corpus guard (9ea8fbbd4) composed in: guard runs
  on the filtered seed rows, master's underscore-preserving
  update-baseline kept. Proofs on the merged checkout: test-teleingest.js
  21/21, test-telemetry-check.js 12/12, recorder-guard proof 8/8,
  check.js --only telemetry green.

## Wall (bands cited, never pooled)

- Partyfinish armed band: natEver 8/8, natFinal 6/8, table 7/8,
  entered 5/8, wins 5/8 (all lesser), wave 4 8/8, wave 5 0/8,
  median 140d, starvation 1.
- Full seat still 0 everywhere judged; wave 5 still unreached as a
  judged outcome. scale-onramp stays converging (NOT converged):
  the party-finishing mechanism is now landed, but the full seat is
  still 0 and wave 5 still unreached.

## Telemetry deviation check

Deferred by this round to the teleingest landing proof (no new corpus
existed in this round). The 1315Z run ran it: on the tbovertime corpus
(--sweep-rows) 2 LOUD lines (table 16 -> 4, wins 16 -> 3), both REGIME
artifacts of a pre-seat substrate vs the WINSEAT baseline (the baseline
itself says not to compare pre-seat substrates against it); on the
partyfinish armed corpus, see the 1315Z run evidence. Baseline NOT
rolled in either case.
