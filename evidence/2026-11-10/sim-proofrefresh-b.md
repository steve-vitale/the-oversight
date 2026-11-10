# sim-proofrefresh-b: measurement-proof refresh — LANDED

- **Run:** fleshout-loop-b-20261110T1445Z, axis scale-onramp / winnability chain
- **Worktree:** `~/workspace/worktrees/sim-proofrefresh-b`
- **Adopted by the main session** from the timed-out 1445Z run (coordinator's timeout report; worker state verified in-tree before closeout). The 1445Z coordinator's other arm (sim-choketrace-b) landed separately as `74eccccd2`.

## What was stale, and why

`scripts/godpath/test-measurement-proof-update.js` FAILED on master `3838d86dc`
with `Error: Proof source inputs are not current`: the retained
observer-neutral maintenance proof (`evidence/2026-11-10/neutral-vetcount-b.json.gz`,
pointed at by `scripts/balance-proof.json`) was re-staled by exactly one
Game-file move — `src/js/hierarchy.js` +104 from Loop A's answermail-drive-a
landing. The panel manifest hashes every file under `src/` (plus `index.html`,
`scripts/sim-harness.js`, `scripts/sweep-compare.js`, `scripts/policies/`), so
any Game change invalidates it.

Pre-refresh state, measured on the branch before the panel run:
- `test-measurement-proof-update.js`: FAIL (exit 1, "Proof source inputs are not current")
- `test-measurement-workflow.js`: 8/9 — failing leg "retained neutrality proof
  covers the current Game/controller/harness inputs" (same root cause)
- `test-measurement-cache-flags.js`: 4/4

## Panel generation

- Panel command: `node scripts/balance-panel.js --out <scratch> --n 16 --days 150`
  (policies capable,risk-aware,socialite,winseek; proof seed 7; 64 cases).
- First attempt started on base `3838d86dc`; at ~42 min in master moved to
  `46459ac83` (Loop A tendexact-a landing, touching manifest file
  `src/js/hierarchy.js`), so the in-flight panel was killed at 35/68 cases
  and regenerated once on the new tip. No case output from the aborted run
  was reused.
- The regeneration was interrupted by a runtime restart after 42m50s
  (no `panel.json.gz` written). Recovered state verified before resuming:
  `cases/` held 64 valid files, 64 distinct policy/seed/observe combos;
  only 4 jobs missing (winseek seeds 5, 6, 8, 9, observer-on). Resumed with
  the IDENTICAL command and the SAME `--out` dir — the tool's own cache path,
  which re-validates every cached case (key, identity incl. source/observer/
  contract digests, resultDigest, policy/seed) and throws on mismatch. No case
  from another tree was reused. The 4 missing jobs were computed fresh.
- During regeneration master moved again, `46459ac83` → `74eccccd2`
  (Loop B choketrace-b landing, evidence + `scripts/choketrace-b-*.js` only).
  `git diff --name-only` between the two SHAs: only `evidence/2026-11-10/*`
  and `scripts/choketrace-b-{analyze,driver}.js` + `scripts/test-choketrace-b.js`.
  **No manifest file touched**, so per the master-move rule the panel was KEPT.
  The branch was rebased onto the explicit current master SHA `74eccccd2` and
  all proof legs were re-run on the rebased branch before committing.
- Retained panel: `evidence/2026-11-10/neutral-proofrefresh-b.json.gz`
  (64 observed cases, 0 cached at final generation count). The `cases/` cache
  dir was NOT committed (§15); the scratch dir was deleted before commit.

## Verdict: GO — all pre-registered legs hold

Re-run by the main session on the rebased branch (base `74eccccd2`, = current
master at merge time), standalone and via the proof test:

- (a) `test-measurement-proof-update.js` exits 0 — **9/9**
- (b) `test-measurement-workflow.js` — **9/9**
- (c) `test-measurement-cache-flags.js` — **4/4** (no retry needed; the
  prereg's 30s-spawn-timeout load caveat did not bite on these runs)
- (d) Neutrality reproduction: fresh panel's neutral verdict reproduces the
  previous panel's — `match` on every proof case (capable, risk-aware,
  socialite, winseek @ seed 7), 0 warnings; row count 64 vs 64.
- (e) `scripts/test-proofrefresh-b.js` — **9/9**: balance-proof-update
  validate passes on the new panel; the three proof tests pass; neutrality
  match on every proof case; panel rows complete (64 observed cases, 64
  distinct policy/seed combos); row count matches the previous panel;
  `validity.sourcesStable` true.
- `scripts/balance-proof.json` re-points at
  `evidence/2026-11-10/neutral-proofrefresh-b.json.gz` (2-line diff).

Regeneration alone moved no verdict. The measurement proof is current again;
gates that were red on the stale-proof pair should go green on this alone.

## Metric review

- The primary metric judged what it claimed: the proof trio + the
  neutrality-reproduction legs, all pre-registered, all green with no
  re-scoring. No delta in the neutrality reproduction; no finding.
- The cache-flags test's hardcoded 30s spawn timeout remains a load artifact
  (documented in the prereg; it passed 4/4 here). It is not edited — no
  loosening an assertion to go green.
- The abort-and-regenerate cost this refresh ~2.5 hours of wall time across
  the aborted run, the restart resume, and the rebase. A Game-file move
  mid-panel run is the expensive case; nothing new to fix here beyond the
  existing master-move rule, which was followed.

## Scale-wall numbers (choketrace corpus, for the round record)

8 seeds, competent, 150d: national 0/8, table 0/8, wins 0/8, wave-4
unlocked 8/8, wave-5 1/8, median survival 125.5d, tribute ever-ready 2/8.
