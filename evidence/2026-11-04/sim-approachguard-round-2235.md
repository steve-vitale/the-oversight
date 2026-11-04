# Loop B run fleshout-loop-b-20261104T2235Z — coordinator closeout
Axis: scale-onramp (winnability-chain re-point). Arm: sim-approachguard-b —
12-seed guardrail re-test of the combined approachfall variant, owed by
sim-approachbranch-a (1326Z NO-GO guardrail breach). Merged locally,
pending ship. No push, no bump, no live verification (ship loop owns
deploys).

## Worker result (branch sim-approachguard-b, policy-side only, zero src/js)
Worker evidence: evidence/2026-11-04/sim-approachguard-b.md +
sim-approachguard-b-prereg.md (committed before any judged sim).
Corpus: evidence/2026-11-04/perseed-approachguard-b/ (24 files, 12+12).

- Band 99601–99612 (pre-stated confirm band, reuse by design), 140d
  death-aware, baseline competent.js verbatim vs armed
  competent-approachfall-b.js verbatim (four gates, DPS_RACE off).
  Single sweep anchor e44da039d8c7; game + policy bytes verified
  identical prereg-base..HEAD.
- Guardrail verdict: NO-GO. (a) Starvation totals armed 7 vs bar
  baseline+2 = 3 — FAIL by 4. (b) Player-flagged starvation armed 2
  vs bar 2 — PASS, exactly at bar. (c) Median survival armed 83d vs
  bar 0.8 × 111d = 88.8d — FAIL by 5.8d. Second consecutive breach on
  the totals half (branch pilot: armed 7 vs bar 4). The variant stays
  blocked; the fallback mechanism is NOT killed (replay-proven by
  approachbranch, and this panel cannot attribute the excess to the
  fallback specifically — four gates carried, trajectories diverge).
- Sense-test: all 7 armed starvation deaths are real tele records
  (days 20–129, 5 seeds), not a counting artifact.
- Metric review (worker's, for the NEXT pre-registration, not applied
  here): the same band's baseline starvation total moved 6 (confirm
  corpus) → 1 (this run) with no policy change, and the armed median
  is 83d on both the pilot and this re-test while the baseline median
  rose 93.5d → 111d — the relative bars swing with baseline luck.
  Proposal: report absolutes alongside, and consider a floor for the
  totals bar only with coordinator/Steve approval. Not adopted here.

## Scale-wall numbers (reported, not judged)
Wins 0/12 both legs. National 0/12, table 0/12 both legs. Wave-5
unlocked: baseline 2 (99604, 99606), armed 0. Wave-5 kills 0 both legs.
Wave-4 linked kills: baseline 10, armed 7. Median survival:
baseline 111d (1 survived to 140d), armed 83d (0 survived). Full seat
still unwon, wave-5 kill still 0 in normal play.

## Coordinator verification (independent of the worker's report)
- Master unmoved during the run (3f92c4d3d at start and at merge);
  branch merged --ff-only, clean. Commits: e52c9fb43 prereg,
  d68c42db5 tooling, e44da039d anchor note, 3d207778f evidence.
- Proof re-run in the worktree before merge: ALL PASS (corpus files
  share one anchor, game + policies identical anchor..HEAD and
  prereg-base..HEAD, driver/summarizer target only the new corpus).
- Main tree clean after merge (`git status --short` empty).

## Telemetry deviation check
`telemetry-check.js` REFUSED the corpus (recorder-corpus input: all
24 rows carry top-level anchorCommit — sweep recorder rows, not runs).
Same refusal class as prior approach arms. No compare fabricated,
baseline NOT rolled, no --allow-recorder-corpus override: the
guardrail judgement above is the pre-registered per-seed table, per
§15's stated panel limitation for non-registry variants.

## Next blanks, in order
1. Approach-variant cost: the totals-bar question is now a
   twice-breached, baseline-luck-sensitive bar — the next arm needs a
   revised pre-registration (absolutes alongside relatives, and a
   coordinator/Steve decision on a totals-bar floor) before any
   further land/kill decision. Do NOT re-run the same bar a third
   time unchanged.
2. Standing accumulation part 2 (tracker carried blank): re-measure
   release once a village both meets wave 4 and keeps two killers
   alive — still unmet (max living wave-4 killers here are not the
   binding read; standaccum found veterans binding at 0–1 of 2).
3. Tend arms from 1434Z are closed (tendseason INSUFFICIENT-DATA /
   NO-GO-shaped, no confirm; tendfloor-guard band-blocked) — do not
   revive without a fresh band and a new prereg.

scale-onramp stays converging (NOT converged): full seat still unwon,
wave-5 kill still 0. food-economy untouched. Claim deleted; lock
deleted.
Merged locally, pending ship (approachguard e52c9fb43 + d68c42db5 +
e44da039d + 3d207778f; coordinator evidence this file).
