# sim-proofrefresh-b18 — prereg (measurement proof regeneration, round 18)

## Run

- **Run:** fleshout-loop-b-20261114T2230Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b18 (tracker blank #2:
  "proof refresh round 17 on the next manifest change (regenerate +
  re-point, do not hand-edit)" — round 17 was GO 12/12 on panel
  eadc86c3, merged; round 18 is owed after the next manifest change).
  Round 18 is owed NOW: the Reunion arena balance (master 3e8bf6a7c)
  changed `src/js`, re-staling the b17 panel by 4 manifest keys.
  Round 18 follows the proven
  round-11/12/13/14/15/16/17 pattern exactly (regen + re-point + 6 GO
  legs), on the current tip. Full prereg committed first:
  `evidence/2026-11-14/sim-proofrefresh-b18-prereg.md`.
- **Base SHA:** `eaa7fb431` (local master at worktree registration;
  branch tip == master tip at registration). If master moves during
  the run, rebase onto the explicit master SHA at closeout and
  re-verify leg (a) on the rebased tip; the panel stays valid only if
  the move touches NO manifest file. A version-bump move touches the
  2 version-stamp manifest keys (finding #2316) and would make the
  panel stale on the final tip — in that case do NOT merge a NO-GO;
  report stale-key counts (b17 vs b18) and whether merging still
  improves master; the coordinator decides.
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
  blaming the change — this IS the owed cache-flags quiet-box A/B,
  folded into this arm's legs, not a separate arm); (d) neutrality
  reproduces the prior panel on every proof case, warnings 0; (e)
  test-proofrefresh-b18.js 12/12 incl. stale-input negatives (the
  retained b17 panel AND the b16 panel FAIL validate() on the new
  tip); (f) ontology exit 0. Any leg miss = NO-GO, no re-scoring.

## Owed-check (run before the panel, on base eaa7fb431)

- `node scripts/godpath/test-measurement-proof-update.js` FAILS, exit 1,
  "Proof source inputs are not current"
  (`scripts/balance-proof-update.js:8`) — confirmed in the worktree
  before the panel run.
- `B.manifest('.')` vs the retained b17 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b17.json.gz`, sha256
  `eadc86c3e076c8de096968d97d28e6e87fc0c0164f89d4523f21e7d758d3ae6b`):
  exactly **4 manifest keys differ** (of 526 total on the tip; 526 in
  the b17 panel):

  - `src/js/game.js` — Reunion arena balance: mirror cap
    (0d8d3650a), arena-only clone HP x0.4 / damage x0.5 (e17c08d78),
    damage re-tune 0.5 -> 0.6 (ee8292e0b)
    (panel `2b155837ebf4…`, tip `84a25e80dbb4`)
  - `src/js/partyTactics.js` — same three Reunion arena-balance
    commits (panel `7beb2f710e66…`, tip `704ce45da663`)
  - `src/js/build.js` — version bump dcae77800 (batch ship)
    (panel `e8d585154146…`, tip `4d8491819f2a`)
  - `index.html` — version bump dcae77800 (batch ship)
    (panel `33d4677d8556…`, tip `3516fd2cc211`)

  Real game-code changes since the b17 panel (arena Reunion
  behavior: mirror cap 1, HP x0.4, damage x0.6) plus the 2
  version-stamp keys from the batch ship bump. Observer and contract
  digests still match the b17 panel (observer f37e5ce03414…,
  contract 37bbb0fad947…). The staleness is the source manifest only:
  2 real game-code keys + 2 version-stamp keys.
  **Verdict of the owed-check: OWED.** Panels at b17 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel (to be filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b18-panel --n 16 --days 150 --par 4`
- Panel logs written to ~/workspace (NOT /tmp — agent-service restarts
  wipe /tmp; resume from the worktree cases cache if killed).
- The `cases/` cache in `.proofrefresh-b18-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- Copy the regenerated panel to
  `evidence/2026-11-14/neutral-proofrefresh-b18.json.gz` (NEW file — do
  NOT overwrite b17/b16/b15), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-14/neutral-proofrefresh-b18.json.gz` — exit 0.
  No hand-edited hashes; re-point to the NEW panel only.
- Host write flap: a denied window hit runs today (per the brief);
  probe before writes that matter, write to a copy/temp+rename,
  verify size/line count after every write, wait the flap out. If
  the panel dies on EPERM, use the b15 gated retry: a 10/10
  write-probe gate immediately before launch predicts a passing
  window; resume from the worktree cases cache.

## Telemetry

- `scripts/telemetry-check.js` cannot parse the retained .gz panel
  (same limitation b11/b12/b13/b14/b15/b16/b17 recorded) — record that, no
  lever played so no deviation to check; the neutrality reproduction
  (leg d) is the instrument check. Baseline NOT rolled.
