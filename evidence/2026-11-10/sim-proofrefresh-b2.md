# sim-proofrefresh-b2: measurement-proof refresh, round 2 — LANDED

- **Run:** fleshout-loop-b-20261110T2046Z, axis scale-onramp / winnability chain
- **Worktree:** `~/workspace/worktrees/sim-proofrefresh-b`
- **Base SHA (panel generation):** `febe01d6b43fdab8abb7c661c74ebf304c8a2f37`
- **Final base (after rebase, explicit SHA):** `3daa1a9b68e87ee03b8c85411afbee71a15b45ec`
  (adoption run; the e243e2eeb base recorded below was superseded when master
  moved again — see "Round 2, regeneration on 3daa1a9b6" below).
- **Date:** 2026-11-10
- **Finding:** #2084 (open) — measurement proof stale again after Game-file moves.
- **File naming note:** the task brief names `sim-proofrefresh-b-prereg.md` /
  `sim-proofrefresh-b.md`, but those files are the LANDED record of the 1445Z
  refresh (commit f21b474e4). This round uses `-b2` suffixed files so no
  landed history is overwritten.

## What was stale, and why

`scripts/godpath/test-measurement-proof-update.js` FAILED on master `febe01d6b`
with `Error: Proof source inputs are not current`: the retained
observer-neutral maintenance proof (`evidence/2026-11-10/neutral-r127scholar.json.gz`,
pointed at by `scripts/balance-proof.json`, digest `afaa075b…`) was re-staled
by exactly two manifest-file moves since the scholarcount-a adoption
(a663f3ccf): `src/js/convo-beats.js` and `scripts/policies/competent.js`
(counterclose-a landing). Verified by comparing `B.manifest('.')` against the
retained panel's `sources`: exactly these 2 keys differ. The panel manifest
hashes every file under `src/` (plus `index.html`, `scripts/sim-harness.js`,
`scripts/sweep-compare.js`, `scripts/policies/`), so any Game/policy change
invalidates it.

Staleness chain: 2026-10-29 seven Game files stale → 1445Z refresh, full
64-case panel (`neutral-proofrefresh-b.json.gz`, base 74eccccd2, landed
f21b474e4) → scholarcount-a adoption (a663f3ccf) re-pointed at a seed-7-only
4-row panel (`neutral-r127scholar.json.gz`) → counterclose-a landing moved
the 2 files above. This round restores the canonical 64-case spec.

Pre-refresh state, measured on this branch before the panel run:
- `test-measurement-proof-update.js`: FAIL (exit 1, "Proof source inputs are not current")
- `test-measurement-workflow.js`: 8/9 — failing leg "retained neutrality proof
  covers the current Game/controller/harness inputs" (same root cause)
- `test-measurement-cache-flags.js`: 4/4
- `scripts/validate-ontology.js`: green — "All 135 systems validated"

## Panel generation

- Panel command: `node scripts/balance-panel.js --out .proofrefresh-b2-panel --n 16 --days 150`
  (policies capable,risk-aware,socialite,winseek; proof seed 7; 68 jobs:
  64 observer-on + 4 observer-off proof cases). Fresh `--out` dir — no cached
  cases reused from another tree.
- Started 21:01:26Z on base febe01d6b; finished 21:39:53Z (~38.5 min, ~1.7
  cases/min under Loop A contention). `Saved .proofrefresh-b2-panel; 64 cases,
  0 cached jobs.` No restart, no resume needed this round.
- During generation master moved, febe01d6b → `e243e2eeb` (Loop A
  sim-cookfirst-a landing, 3 commits). `git diff --name-only` between the two
  SHAs: 23 files, all `evidence/2026-11-10/*` + `scripts/cookfirst-*.js` +
  `scripts/test-cookfirst-a.js`. **No manifest file touched**, so per the
  master-move rule the panel was KEPT. The branch was rebased onto the
  explicit new master SHA e243e2eeb and all proof legs were re-run on the
  rebased branch before committing.
- Retained panel: `evidence/2026-11-10/neutral-proofrefresh-b2.json.gz`
  (64 observed cases, 0 cached; sha256
  `a02a0bffbd7614af4d4a368543c036e3fcfc8724056d4435bfe3a58bbb2c8f6d`).
  The `cases/` cache dir was NOT committed (§15); the scratch dir was deleted
  before commit.

## EPERM flap during the copy (~51 min)

- At 21:41Z the `cp` of the finished panel into `evidence/` failed with
  `Operation not permitted` and left a 0-byte destination file — a host write
  flap (O_EXCL creation refused filesystem-wide), the same class recorded in
  AGENTS.md. The failed heartbeat script (`worktree-heartbeat.sh`,
  PermissionError on the registry atomic write) confirmed it was
  filesystem-wide, not path-specific.
- Response per `local_write_flap_response`: stopped writing, removed the
  0-byte file (and the 0-byte `.tmp` left by the second attempt), probed with
  `git update-ref refs/heads/probe HEAD` every ~10 min, and copied only when
  a probe succeeded — probe and copy in one command so a brief window is used
  immediately. Probes failed 21:52Z, 22:02Z, 22:12Z, 22:22Z; the flap cleared
  at ~22:32Z and the copy landed byte-identical (sha256 matches the scratch
  panel). No panel data was lost: the scratch dir and `panel.json.gz` were
  written before the flap started.
- A later `worktree-heartbeat.sh` invocation hung with no output and was
  killed (SIGTERM); retried after the commit — see "Post-rebase re-run".

## Verdict: GO — all pre-registered legs hold

Measured on the pre-rebase branch (base febe01d6b), standalone and via the
proof test; post-rebase re-run recorded below:

- (a) `test-measurement-proof-update.js` exits 0 — **9/9**
- (b) `test-measurement-workflow.js` — **9/9**
- (c) `test-measurement-cache-flags.js` — **4/4**
- (d) Neutrality reproduction: fresh panel's neutral verdict reproduces the
  previous panel's — `match` on every proof case (capable, risk-aware,
  socialite, winseek @ seed 7), 0 warnings; the (policy, seed, match,
  warnings) tuple is identical between the two panels.
- (e) `scripts/test-proofrefresh-b2.js` — **10/10**: balance-proof-update
  validate passes on the new panel; the three proof tests pass; ontology
  green; neutrality match on every proof case; panel rows complete (64
  observed cases, 64 distinct policy/seed combos); neutrality verdict
  reproduces the previous panel; `validity.sourcesStable` true; stale-input
  negative check — the OLD panel (`neutral-r127scholar.json.gz`) FAILS
  `validate()` on the new tip with "Proof source inputs are not current",
  proving the green result is not vacuous.
- (f) `scripts/validate-ontology.js` — **green, 135 systems validated**.
- `scripts/balance-proof.json` re-points at
  `evidence/2026-11-10/neutral-proofrefresh-b2.json.gz`.

Regeneration alone moved no verdict. The measurement proof is current again;
gates that were red on the stale-proof pair should go green on this alone.

## Post-rebase re-run (to be filled after rebasing onto e243e2eeb)

- Branch rebased onto explicit master SHA e243e2eeb (read immediately before
  rebasing; never `git rebase master`). The rebase hit the documented
  stop-at-pick quirk (pick in both done and todo, worktree clean, pick
  unapplied — verified with `git diff <pick> -- <files>` non-empty); recovery
  was `git rebase --continue`, which sailed through. Rebased commit c007c5e94;
  my 5 files byte-identical between 09ded32b2 and c007c5e94
  (`git diff 09ded32b2 c007c5e94 -- <my files>` empty; the only diff between
  the two commits is the cookfirst-a base).
- Post-rebase re-run, all green on c007c5e94 (base e243e2eeb = master at
  commit time): proof-update 9/9 exit 0, workflow 9/9, cache-flags 4/4,
  ontology "All 135 systems validated", `test-proofrefresh-b2.js` 10/10.
  Panel stays valid: the cookfirst-a move touched no manifest file.
- Worktree-heartbeat retry: the earlier hung invocation was killed; heartbeat
  re-run after the rebase (see run log) — registry write succeeded, no error.

## Round 2, regeneration on 3daa1a9b6 (adoption run fleshout-loop-b-20261110T2246Z)

The 2046Z run died before committing the record above. This adoption run
verified the refresh on the rebased tip and finished it.

- Master had moved again since the e243e2eeb rebase: e243e2eeb →
  `b6cf13684` (Loop A journey-establishment r128 landing) →
  `3daa1a9b6` (Loop A sim-coverage-tier2-round-2115 evidence). The adoption
  brief assumed b6cf13684 was current; `git rev-parse master` in the MAIN
  tree immediately before rebasing read `3daa1a9b6`, so the branch was
  rebased onto the explicit new SHA 3daa1a9b6 (never `git rebase master`).
- The b6cf13684 move touched a manifest file: `src/js/game.js` (+44/−9,
  grant-rate dial). The 3daa1a9b6 move touched evidence only. Per the
  master-move rule the b2 panel (generated on febe01d6b) was STALE on the
  new tip and had to be regenerated — confirmed on the rebased tip before
  regenerating: `test-measurement-proof-update.js` FAILED with "Proof
  source inputs are not current" (exit 1).
- Rebase notes: the uncommitted b2.md completion was committed first
  (6e61d58eb, via safe-commit.sh; the post-commit `MM` index display was the
  known safe-commit index clobber — `git diff HEAD` empty, repaired with
  the `ls-tree | update-index --add --index-info` pipe). The rebase then hit
  the documented stop-at-pick quirk again (pick c007c5e94 in both done and
  todo, worktree clean); the pick was verified unapplied with
  `git diff <pick> -- <files>` (all 5 files absent from the worktree) and
  `git rebase --continue` sailed through. Rebased commits 035566211 +
  a0ef680d6; my 5 files byte-identical across the rebase (both diffs 0 lines).
- Panel regeneration: the stale scratch dir (.proofrefresh-b2-panel/, cases
  from base febe01d6b) was deleted first; fresh `--out` dir of the same name.
  Command: `node scripts/balance-panel.js --out .proofrefresh-b2-panel --n 16
  --days 150` (policies capable,risk-aware,socialite,winseek; proof seed 7;
  68 jobs: 64 observer-on + 4 observer-off proof cases). Started 23:05:05Z,
  finished 23:27Z (~22 min, ~3.1 cases/min — faster than round 2's 38.5 min;
  Loop A contention lighter this hour). `Saved .proofrefresh-b2-panel; 64
  cases, 0 cached jobs.` No restart, no resume, no flap. Master still
  3daa1a9b6 after generation (re-checked).
- Retained panel: `evidence/2026-11-10/neutral-proofrefresh-b2.json.gz`
  (same filename as the first generation — same round, regenerated on the
  new tip; old sha256 `a02a0bff…`, new sha256
  `6bfc13b62fe73e43e56751d02a4d0b37a282521b97c3a78c5498dd1016a90e6a`,
  copied byte-identical from the scratch `panel.json.gz`, verified by sha).
  `scripts/balance-proof.json` re-pointed via
  `node scripts/balance-proof-update.js evidence/2026-11-10/neutral-proofrefresh-b2.json.gz`
  (exit 0; digest-only diff). The `cases/` cache dir was NOT committed
  (§15); the scratch dir was deleted before commit.
- A sibling panel run (journey2-social, `neutral-r172social-panel`) was live
  in its own worktree during this regeneration; its processes are unrelated
  to this panel and its output was never touched.

## Verdict: GO — all pre-registered legs hold on the rebased tip (3daa1a9b6)

Measured on the rebased branch (base 3daa1a9b6 = current master at commit
time), standalone and via the proof test, after the regeneration:

- (a) `test-measurement-proof-update.js` exits 0 — **9/9**
- (b) `test-measurement-workflow.js` — **9/9**
- (c) `test-measurement-cache-flags.js` — **4/4**
- (d) Neutrality reproduction: fresh panel's neutral verdict reproduces the
  previous panel's (`neutral-r127scholar.json.gz`) — `match` on every proof
  case (capable, risk-aware, socialite, winseek @ seed 7), 0 warnings; the
  (policy, seed, match, warnings) tuple is identical between the two panels.
- (e) `scripts/test-proofrefresh-b2.js` — **10/10**: balance-proof-update
  validate passes on the new panel; the three proof tests pass; ontology
  green; neutrality match on every proof case; panel rows complete (64
  observed cases, 64 distinct policy/seed combos); neutrality verdict
  reproduces the previous panel; `validity.sourcesStable` true; stale-input
  negative check — the OLD panel (`neutral-r127scholar.json.gz`) FAILS
  `validate()` on the new tip with "Proof source inputs are not current",
  proving the green result is not vacuous.
- (f) `scripts/validate-ontology.js` — **green, 135 systems validated**.

Regeneration alone moved no verdict. The measurement proof is current again
on the live tip; gates that were red on the stale-proof pair should go green
on this alone.

## Scale-wall numbers (fresh panel corpus, 16 seeds × 4 policies, 150d, base 3daa1a9b6)

- capable: national 13/16, table 16/16, won 15/16, village-lost 0/16, median gameDays 90
- risk-aware: national 0/16, table 16/16, won 0/16, village-lost 14/16 (median lost-day 105), median gameDays 106.5
- socialite: national 0/16, table 12/16, won 0/16, village-lost 16/16 (median lost-day 101), median gameDays 100
- winseek: national 0/16, table 16/16, won 0/16, village-lost 16/16 (median lost-day 89), median gameDays 87
- Overall: national 13/64, table 60/64, won 15/64, median gameDays 91.5;
  waveReach 4: 51, 5: 13; endReason village-lost 46/64, over-other 15/64,
  survived 3/64; maxRank global 13, regional 47, village 4; maxArc 3: 4, 4: 60.
- Read: only the capable policy climbs the wall on this panel; the other
  three reach the table on most seeds but win on none and lose the village
  on nearly every seed — and they lose it LATE (median lost-day 89–105),
  not in the opening. Capable loses no village at all.
- Survival30/60 note: the prior round's survival30/60 figures are NOT
  reproduced here — the panel rows carry no survival30/60 field, and the
  prior round's analyzer definition could not be verified from the panel
  alone, so no incomparable number is asserted. The verifiable survival
  read is the village-lost count + median lost-day per policy above
  (capable 0/16 lost; the other three lose 14–16/16, late).

## Metric review

- The primary metric judged what it claimed: the proof trio + ontology, all
  pre-registered, all green with no re-scoring. No delta in the neutrality
  reproduction; no finding.
- Row-count equality with the previous panel was deliberately NOT a GO leg
  this round (pre-registered in the prereg): the previous panel is a 4-row
  seed-7-only panel, this round restores the canonical 64-case spec. The
  neutrality reproduction on the 4 proof cases is the apples-to-apples check.
- The cache-flags test's hardcoded 30s spawn timeout did not bite this run
  (4/4, no retry). The test is NOT edited.
- The flap cost this refresh ~51 min of wall time on top of the ~39 min
  panel run. The panel itself was never at risk (scratch dir intact), but
  every downstream write — copy, evidence file, re-point, commit — queues
  behind the flap clearing. Nothing new to fix here beyond the existing
  probe-and-wait rule, which was followed.

- Adoption-run addendum (2246Z, base 3daa1a9b6): the primary metric judged
  what it claimed a second time, on a fresh panel regenerated after a
  manifest-file move — proof trio + ontology + neutrality reproduction, all
  pre-registered, all green with no re-scoring. No delta in the neutrality
  reproduction; no finding. Two process notes: (1) the brief's assumed base
  (b6cf13684) was already superseded when the run started — reading master
  immediately before rebasing caught it, and the rebase target was the live
  SHA, not the brief's. (2) The rebase stop-at-pick quirk struck a second
  time on this same branch (c007c5e94, then again on the adoption rebase);
  the verify-unapplied-then-continue recovery worked both times.
  The old scale-wall section below (base febe01d6b panel) is superseded by
  the fresh-panel numbers above; it is kept as history, not overwritten.

## Scale-wall numbers (SUPERSEDED — first-generation b2 panel, base febe01d6b; see the 3daa1a9b6 numbers above)

- capable: national 15/16, table 15/16, won 15/16, survival30 11/16, survival60 8/16
- risk-aware: national 0/16, table 0/16, won 0/16, survival30 12/16, survival60 5/16
- socialite: national 0/16, table 0/16, won 0/16, survival30 6/16, survival60 0/16
- winseek: national 0/16, table 0/16, won 0/16, survival30 4/16, survival60 0/16
- Overall: national 15/64, table 15/64, won 15/64.
- Read: only the capable policy climbs the wall on this panel; the other
  three policies reach national/table on no seed. (Panel metric `wins` is
  null throughout; `won` is the per-row win flag used here.)
