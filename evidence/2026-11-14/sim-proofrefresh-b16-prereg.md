# sim-proofrefresh-b16 — prereg (measurement proof regeneration, round 16)

## Run

- **Run:** fleshout-loop-b-20261114T1130Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b16 (tracker blank #2:
  "proof refresh round 16 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 15 was GO 12/12 on its panel tip
  37267f43e (panel 70831cb4, merged b2b50c2cd, coordinator adoption
  re-judged the GO legs on the rebased tip). Round 16 is owed NOW:
  the fusionoffer fix (59448d248) re-staled the b15 panel by 2
  manifest keys. Round 16 follows the proven round-11/12/13/14/15
  pattern exactly (regen + re-point + 6 GO legs), on the current tip.
  Full prereg committed first:
  `evidence/2026-11-14/sim-proofrefresh-b16-prereg.md`.
- **Base SHA:** `237fb445f` (journey-scale r197 addendum; local master
  at worktree registration). If master moves during the run, rebase
  onto the explicit master SHA at closeout and re-verify leg (a) on
  the rebased tip; the panel stays valid only if the move touches NO
  manifest file. A version-bump move touches the 2 version-stamp
  manifest keys (finding #2316) and would make the panel stale on
  the final tip — in that case do NOT merge a NO-GO; report stale-key
  counts (b15 vs b16) and whether merging still improves master;
  the coordinator decides.
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
  test-proofrefresh-b16.js 12/12 incl. stale-input negatives (the
  retained b15 panel AND the b14 panel FAIL validate() on the new
  tip); (f) ontology exit 0. Any leg miss = NO-GO, no re-scoring.

## Owed-check (run before the panel, on base 237fb445f)

- `node scripts/godpath/test-measurement-proof-update.js` FAILS, exit 1,
  "Proof source inputs are not current"
  (`scripts/balance-proof-update.js:8`) — expected before the panel
  run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b15 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b15.json.gz`, sha256
  `70831cb459bed5627b7279337221e888e10f8dad30cfeb5ceda949fa5f027a67`):
  exactly **2 manifest keys differ** (of 526 total on the tip; 526 in
  the b15 panel):

  - `src/js/contests.js` — sim-fusionoffer-b (59448d248): fusion offer
    defers while a sheet is pending; prize bag gates fusion_reactor
    on pellet possession
    (panel `6d12d5c771b6…`, tip `7eb51bdb45ff…`)
  - `src/js/game.js` — sim-fusionoffer-b (59448d248), same landing
    (panel `097703a735f3…`, tip `2b155837ebf4…`)

  Both are real game-code changes since the b15 panel (the fusionoffer
  fix). No version-stamp key is stale on this tip. Observer and
  contract digests still match the b15 panel (observer f37e5ce03414…,
  contract 37bbb0fad947…). The staleness is the source manifest only:
  2 real game-code changes.
  **Verdict of the owed-check: OWED.** Panels at b15 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel (to be filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b16-panel --n 16 --days 150`
- Panel logs written to ~/workspace (NOT /tmp — the 1030Z run's regen
  was killed by an agent-service restart that wiped /tmp; resume from
  the worktree cases cache if killed).
- The `cases/` cache in `.proofrefresh-b16-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- Copy the regenerated panel to
  `evidence/2026-11-14/neutral-proofrefresh-b16.json.gz` (NEW file — do
  NOT overwrite b15/b14/b13), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-14/neutral-proofrefresh-b16.json.gz` — exit 0.
  No hand-edited hashes; re-point to the NEW panel only.

## Telemetry

- `scripts/telemetry-check.js` cannot parse the retained .gz panel
  (same limitation b11/b12/b13/b14/b15 recorded) — record that, no lever
  played so no deviation to check; the neutrality reproduction (leg d)
  is the instrument check. Baseline NOT rolled.
