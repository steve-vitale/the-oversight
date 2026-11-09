# sim-measureproof-refresh-b — measurement-proof refresh (evidence)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T1330Z.
Worker tree: ~/workspace/worktrees/sim-measureproof-refresh-b, branch
sim-measureproof-refresh-b. Base: master `c6dd255b9` (verified by
`git log --oneline -1`; worktree was created at `04d0bac8c`, one commit
behind, and fast-forwarded to `c6dd255b9` at run start — the 1230Z
adoption closeout). Scope: MEASUREMENT/PROOF MAINTENANCE ONLY — ZERO
src/js gameplay changes. Full pre-registration (binding):
`evidence/2026-11-09/sim-measureproof-refresh-b-prereg.md`.

## Status: TRIAL VERIFIED GREEN — awaiting coordinator message

The trial regeneration on the current base is verified green (below).
The FINAL panel is NOT yet committed, per the prereg's critical
sequencing: a second worker (sim-partyup-fieldfights-b) is landing a
game-code change in parallel, and the final panel MUST be generated
on the FINAL merged master AFTER that merge lands. The coordinator
will send either "party-up landed — re-derive now" or "party-up
killed — commit as-is". Until then the worktree holds only the
committed prereg + this evidence file + the trial log; the trial
panel bytes are retained at
`/tmp/neutral-measureproof-refresh-b-trial/panel.json.gz` (digest
`6f15c045ebbfcac0314da28d04c73761cc9d10bb7ba55aa4292b76b3650b58e3`).
If the run ends without the message, this file + the trial state is
the ready-to-merge record and the coordinator decides.

## What was stale (verified on c6dd255b9 before any regeneration)

- `node scripts/godpath/test-measurement-proof-update.js` — exit 1 at
  load: "Proof source inputs are not current".
- `node scripts/godpath/test-measurement-workflow.js` — 8 passed,
  1 failed: "retained neutrality proof covers the current
  Game/controller/harness inputs". The other 8 checks passed.
- Retained panel: `evidence/2026-11-09/neutral-r162-rebased3.json.gz`
  (r162 third refresh, commit `4fcd2ecbb`, built on tree `8419eefa4`).
  Manifest diff panel-vs-current shows exactly ONE moved input:
  `scripts/policies/scalecourt-traderoad-r113.js` (scale r113 landing
  `5b8ff908e`, after the panel was built). No other manifest source
  moved. The 598e21bdb panel was NOT reused: the Oct 29 rebuild header
  in the convergence tracker records it as SUPERSEDED (its panel's
  scorecard source hash no longer matches master). Staleness was also
  re-confirmed in `evidence/2026-11-09/sim-takeseat-pricedseat-b.md`
  on `8419eefa4` (same two failures).

## Trial regeneration (on base c6dd255b9 + prereg commit 0751ff81c)

Procedure (same as the r162 refresh, commit `4fcd2ecbb`):

- `node scripts/balance-panel.js --out
  /tmp/neutral-measureproof-refresh-b-trial --seeds 7 --policies
  capable,risk-aware,socialite,winseek --days 150` — 8 child jobs,
  4 cases, 0 cached, ~9.3 min under heavy box load (parallel worker
  running). Log:
  `evidence/2026-11-09/neutral-measureproof-refresh-b-trial.log`
  ("Saved /tmp/neutral-measureproof-refresh-b-trial; 4 cases, 0
  cached jobs.").
- Trial panel: 4 rows (seed 7 × 4 policies × 150d),
  `sourcesStable: true`, neutrality all four cohorts `match: true`,
  0 warnings; `sourceHeadStart == sourceHeadEnd == 0751ff81c`
  (the worktree HEAD at generation time, i.e. base + prereg commit).
- Trial verification (panel temporarily copied into the worktree at
  the intended final path, `balance-proof-update.js` run, then the
  trial state reverted so nothing uncommitted remains):
  - `node scripts/balance-proof-update.js
    evidence/2026-11-09/neutral-measureproof-refresh-b.json.gz` —
    accepted; new `balance-proof.json` panelDigest
    `6f15c045ebbfcac0314da28d04c73761cc9d10bb7ba55aa4292b76b3650b58e3`,
    all eight normalized sources recorded (only
    `scalecourt-traderoad-r113.js` differs from the r162 panel's
    pointer set — the moved input is now current).
  - `node scripts/godpath/test-measurement-proof-update.js` —
    **9/9 PASS**.
  - `node scripts/godpath/test-measurement-workflow.js` —
    **9/9 PASS**.
- After verification, `scripts/balance-proof.json` was restored to
  HEAD and the trial panel file removed from the tree; `git status`
  clean apart from the committed evidence below. No test file was
  touched: both proof tests are pure validators of the retained
  panel + `balance-proof.json` with no hardcoded panel/seed
  expectations, so no test-expectation update was owed.

## Prereg bars — trial verdict

- (a) `test-measurement-proof-update.js` green — TRIAL PASS (9/9).
- (b) `test-measurement-workflow.js` 9/9 — TRIAL PASS (9/9).
- (c) Regenerated panel's sources match current master inputs —
  TRIAL PASS (manifest equality at generation time; neutrality
  4/4 match, sourcesStable true). Final bar (c) must be re-checked
  against the FINAL merged master at commit time.
- (d) Zero gameplay change — HOLDS SO FAR: the only files the final
  commit will touch are `scripts/balance-proof.json`, the new panel
  file, and evidence. No src/js, no policies, no test files.

## Wall numbers

n/a — no game change, no new sims beyond the proof panel itself.
No wall numbers are claimed.

## Metric review

- The prereg's bars hold as written; nothing was re-scored. The two
  failing checks before regeneration were the same pre-existing
  staleness the prior runs recorded, not a broken drive or a broken
  test.
- No assertion was loosened; no test file was edited.
- Open item carried forward (not this run's to fix): the
  takeseat/feareddoor live-leg pins on seed 53001 remain stale
  (sim-takeseat-pricedseat-b findings) — untouched here, as this
  run is proof maintenance only.

## Village assessment in plain words

No villages were simulated beyond the proof panel itself — this run
checked the ruler, not the village. The ruler was one policy file
out of date (the scale r113 traderoad policy landed after the last
proof panel was built), so the two proof checks that guard it
correctly refused to pass. A fresh panel built on the current base
puts the ruler back in date, and both checks go green on the trial.
The final panel still waits on the party-up landing, because a
ruler dated today goes out of date again the moment that game-code
change lands.

## Run notes (infrastructure)

- Index clobber struck on the prereg commit (safe-commit left the
  committed file as staged-deleted + untracked); repaired with the
  documented pipe after verifying hash-object == HEAD blob
  (`15169f29…`); `git status --short` empty, `git diff HEAD` empty
  after.
- No EPERM flap encountered this run.
- `node scripts/check.js --quick` NOT yet run: it is the final gate
  after the coordinator's message, on the final panel against the
  final master (the trial was verified with the two proof tests
  directly; --quick under the parallel worker's load would also
  risk the concurrent-jest rule).
- Worktree state at this writing: HEAD `0751ff81c` (prereg) + this
  evidence file + trial log to be committed; `balance-proof.json`
  at its stale HEAD state until the final panel commit.

## Final panel (coordinator closeout, run fleshout-loop-b-20261109T1530Z)

The coordinator's message is: **party-up KILLED — no game-code landing.**
The 1330Z arm sim-partyup-fieldfights-b was killed at pilot (armed pre-90
wild 77 vs control 86, bar 51.6; floor 3/8 vs 4; branch deleted, no trace
in master), so the "final merged master" is the master tip after the
sickness arm landed — `89e9b9bf1` — and the final panel was regenerated on
the rebased branch (`5c4b3e738` prereg + `7940d73f2` evidence, clean rebase
onto `89e9b9bf1`, no stop-at-pick quirk).

- Regeneration: `node scripts/balance-panel.js --out
  /tmp/neutral-measureproof-refresh-b-final --seeds 7 --policies
  capable,risk-aware,socialite,winseek --days 150` — exit 0, 4 cases,
  0 cached jobs, ~90s. Panel: 4 rows (seed 7 × 4 policies × 150d),
  `sourcesStable: true`, neutrality all four cohorts `match: true`,
  0 warnings; `sourceHeadStart == sourceHeadEnd == 7940d73f2` (the
  rebased branch HEAD at generation time).
- The /tmp trial panel from the 1330Z run is GONE (wiped by a sibling
  /tmp cleanup); its digest `6f15c045…` is a cross-check only. The final
  panel was regenerated from scratch — nothing was recovered from /tmp.
- Installed at `evidence/2026-11-09/neutral-measureproof-refresh-b.json.gz`
  (sha256 `ddac3956cfb293018d52545cd671488bb0ecdefd21e601b1006447f01a318a17`).
  `node scripts/balance-proof-update.js <panel>` accepted it; new
  `balance-proof.json` panelDigest `ddac3956…`, all eight normalized
  sources recorded (only `scalecourt-traderoad-r113.js` differs from the
  r162 panel's pointer set — the moved input is now current).
- Final verification on the rebased branch (before merge):
  - `node scripts/godpath/test-measurement-proof-update.js` — **9/9 PASS**.
  - `node scripts/godpath/test-measurement-workflow.js` — **9/9 PASS**.
- Master tip was re-checked immediately before the merge
  (`89e9b9bf1`, unchanged since regeneration) — no manifest input moved
  between generation and merge.

## Prereg bars — final verdict

- (a) `test-measurement-proof-update.js` green — PASS (9/9).
- (b) `test-measurement-workflow.js` 9/9 — PASS (9/9).
- (c) Regenerated panel's sources match current master inputs — PASS
  (manifest equality at generation time; neutrality 4/4 match,
  sourcesStable true; sourceHeadEnd is the rebased branch HEAD, which
  becomes the merged master tip on ff-only merge).
- (d) Zero gameplay change — HOLDS: `git diff --stat` against the rebase
  base shows only `scripts/balance-proof.json`, the new panel file, and
  evidence (prereg + evidence + trial log). No src/js, no policies, no
  test files.
