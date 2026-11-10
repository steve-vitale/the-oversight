# sim-proofrefresh-b2: measurement-proof refresh, round 2 — LANDED

- **Run:** fleshout-loop-b-20261110T2046Z, axis scale-onramp / winnability chain
- **Worktree:** `~/workspace/worktrees/sim-proofrefresh-b`
- **Base SHA (panel generation):** `febe01d6b43fdab8abb7c661c74ebf304c8a2f37`
- **Final base (after rebase, explicit SHA):** `e243e2eeb8ec19eef252bd0bee71701c044b384c`
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

## Scale-wall numbers (fresh panel corpus, 16 seeds × 4 policies, 150d)

- capable: national 15/16, table 15/16, won 15/16, survival30 11/16, survival60 8/16
- risk-aware: national 0/16, table 0/16, won 0/16, survival30 12/16, survival60 5/16
- socialite: national 0/16, table 0/16, won 0/16, survival30 6/16, survival60 0/16
- winseek: national 0/16, table 0/16, won 0/16, survival30 4/16, survival60 0/16
- Overall: national 15/64, table 15/64, won 15/64.
- Read: only the capable policy climbs the wall on this panel; the other
  three policies reach national/table on no seed. (Panel metric `wins` is
  null throughout; `won` is the per-row win flag used here.)
