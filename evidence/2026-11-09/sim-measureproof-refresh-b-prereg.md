# sim-measureproof-refresh-b — prereg (measurement/proof maintenance ONLY)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T1330Z.
Worker tree: ~/workspace/worktrees/sim-measureproof-refresh-b, branch
sim-measureproof-refresh-b. Base: master `c6dd255b9` (verified by
`git log --oneline -1` after fast-forward from `04d0bac8c`; the worktree
was created one commit behind master, the 1230Z adoption closeout).
Scope: MEASUREMENT/PROOF MAINTENANCE ONLY — ZERO src/js gameplay
changes, zero policy changes. Files touched: the proof inputs/panel
outputs (`scripts/balance-proof.json`, one new neutral panel file) and
this evidence pair only — never a gameplay file, never a loosened
assertion.

## What is stale (verified on c6dd255b9 before any regeneration)

- `node scripts/godpath/test-measurement-proof-update.js` — exit 1 at
  load: "Proof source inputs are not current"
  (`scripts/balance-proof-update.js:8`, manifest vs panel sources).
- `node scripts/godpath/test-measurement-workflow.js` — 8 passed,
  1 failed: "retained neutrality proof covers the current
  Game/controller/harness inputs". All other 8 checks pass.
- Retained panel: `evidence/2026-11-09/neutral-r162-rebased3.json.gz`
  (r162 third refresh, commit `4fcd2ecbb`, built on tree `8419eefa4`).
  Manifest diff panel-vs-current shows exactly ONE moved input:
  `scripts/policies/scalecourt-traderoad-r113.js` (scale r113 landing
  `5b8ff908e`, after the panel was built). No other manifest source
  moved. The 598e21bdb panel is NOT reused: the Oct 29 rebuild header
  in the convergence tracker records it as SUPERSEDED (its panel's
  scorecard source hash no longer matches master); re-pointing to it
  would regress. The re-confirmed staleness is also recorded in
  `evidence/2026-11-09/sim-takeseat-pricedseat-b.md` (§ Regression
  results + Findings: `src/js/conversation.js` change, same two
  failures on `8419eefa4`).

## Procedure (same as the r162 refresh, commit 4fcd2ecbb)

1. Fresh REAL neutral panel via `scripts/balance-panel.js` — seed 7 ×
   4 policies (capable, risk-aware, socialite, winseek) × 150d, the
   same spec as the three r162 refreshes — into a /tmp directory.
2. Copy `panel.json.gz` to
   `evidence/2026-11-09/neutral-measureproof-refresh-b.json.gz`.
3. `node scripts/balance-proof-update.js
   evidence/2026-11-09/neutral-measureproof-refresh-b.json.gz` —
   validates the panel (manifest match, observer/contract digests,
   neutrality per cohort, no warnings/errors) and rewrites
   `scripts/balance-proof.json`.
4. Verify: proof pair green + `node scripts/check.js --quick` (or the
   narrower proof checks if --quick is blocked by the parallel
   worker; never concurrent jest).

## Acceptance bars (judge the run against these, §14 binding)

- (a) `test-measurement-proof-update.js` green.
- (b) `test-measurement-workflow.js` 9/9 green.
- (c) The regenerated panel's sources match current master inputs
      (manifest equality at generation time; panel sourceHeadEnd ==
      the master the panel is committed against).
- (d) Zero gameplay change: `git diff --stat` against base shows only
      `scripts/balance-proof.json`, the new panel file, and evidence.

## Critical sequencing (party-up landing in parallel)

A second worker (sim-partyup-fieldfights-b) is landing a GAME-CODE
change in parallel. The FINAL panel MUST be generated on the FINAL
merged master AFTER the party-up merge lands — otherwise it goes
stale again the moment that merge lands. So: prep + a TRIAL
generation now on the current base, verify the trial goes green,
then WAIT for the coordinator's message before committing the final
panel ("party-up landed — re-derive now" or "party-up killed —
commit as-is"). Do NOT commit the final panel before that message.
If the run ends without the message, report READY-TO-MERGE with the
trial state and the coordinator decides.

## Wall numbers

n/a — no game change, no new sims beyond the proof panel itself.
State that in the evidence file; do not invent wall numbers.

## Metric review (to fill in the evidence file)

- If any bar misses, record it here as a miss, NOT re-scored.
- If the proof test encodes stale expectations (not just a stale
  panel pointer), update the test in the same commit and say so
  plainly; never loosen an assertion just to go green.
