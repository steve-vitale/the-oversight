# sim-proofrefresh-b13 — prereg (measurement proof regeneration, round 13)

## Run

- **Run:** fleshout-loop-b-20261114T0130Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b13 (tracker blank #2:
  "proof refresh round 13 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 12 landed 2026-11-13 (branch
  sim-proofrefresh-b12, panel regen on 95dbf07f3, rebased onto
  b5ae72cd4, then onto 249da4729) but was NO-GO on the final tip
  249da4729 by leg (a) alone — exactly 2 stale version-stamp keys
  (src/js/build.js, index.html) from the batch-ship version bump, no
  game-code change. Round 13 follows the proven round-11/12 pattern
  exactly (regen + re-point + 6 GO legs), on the current tip.
- **Base SHA:** `102853490` (read in the worktree at panel start;
  main-tree master at registration, unchanged at prereg time).
  If master moves during the run, rebase onto the explicit master SHA
  at closeout and re-verify leg (a) on the rebased tip; the panel stays
  valid only if the move touches NO manifest file.
- **Primary metric:** `node scripts/godpath/test-measurement-proof-update.js`
  pass/fail on the tip. GO = exit 0, all legs pass.
- **Panel spec:** seeds [7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9],
  policies [capable, risk-aware, socialite, winseek], days 150, origin
  Columbus, Ohio — via `scripts/balance-panel.js` (64 rows).
- **Horizon:** N/A (infrastructure — the panel carries its own 150d spec).
- **GO bar (pre-registered):** (a) test-measurement-proof-update 9/9
  exit 0 on the final tip; (b) measurement-workflow 9/9; (c)
  cache-flags 4/4 outright (2026-11-12 load-artifact lesson: if it
  fails under load, run the discriminating A/B on a quiet box before
  blaming the change); (d) neutrality reproduces the prior panel on
  every proof case, warnings 0; (e) test-proofrefresh-b13.js 12/12
  incl. stale-input negatives (the retained b12 panel AND the b11
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.

## Owed-check (run before the panel, on base 102853490)

- `node scripts/godpath/test-measurement-proof-update.js` FAILS, exit 1,
  "Proof source inputs are not current"
  (`scripts/balance-proof-update.js:8`) — confirmed in the worktree
  before the panel run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b12 panel's `sources`
  (`evidence/2026-11-12/neutral-proofrefresh-b12.json.gz`, sha256
  `b9bca8826cd460aff66fb6e6b8a79f3e4c5b0bbd4e7b891729ac5f1d4a0a84cc`):
  exactly **3 manifest keys differ** (of 526 total on the tip; 526 in
  the b12 panel):

  - `src/js/build.js` — batch-ship version bump 249da4729 (version
    stamp only; no game-code change)
  - `index.html` — batch-ship version bump 249da4729 (version stamp
    only; no game-code change)
  - `src/js/conversation.js` — journey-landing r130 (6ccdc325e):
    ask:village injured question gets an injured answer [needs-eyes]

  Observer and contract digests still match the b12 panel
  (observer f37e5ce0…, contract 37bbb0fa…). The staleness is the
  source manifest only: 2 version stamps + 1 real game-code change.
  **Verdict of the owed-check: OWED.** Panels at b12 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel (to be filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b13-panel --n 16 --days 150`
- The `cases/` cache in `.proofrefresh-b13-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- Copy the regenerated panel to
  `evidence/2026-11-13/neutral-proofrefresh-b13.json.gz` (NEW file — do
  NOT overwrite b12/b11/b10), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-13/neutral-proofrefresh-b13.json.gz` — exit 0.
  No hand-edited hashes; re-point to the NEW panel only.

## Telemetry

- `scripts/telemetry-check.js` cannot parse the retained .gz panel
  (same limitation b11/b12 recorded) — record that, no lever played so no
  deviation to check; the neutrality reproduction (leg d) is the
  instrument check. Baseline NOT rolled.
