# sim-proofrefresh-b15 — prereg (measurement proof regeneration, round 15)

## Run

- **Run:** fleshout-loop-b-20261114T0730Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b15 (tracker blank #2:
  "proof refresh round 15 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 14 was GO 12/12 on its panel tip
  97929b5d3 AND on the final tip 8c83b6a9a (master did not move during
  round 14 — first clean final-tip GO since round 10). Round 15 is owed
  immediately and follows the proven round-11/12/13/14 pattern exactly
  (regen + re-point + 6 GO legs), on the current tip.
  Full prereg committed first:
  `evidence/2026-11-14/sim-proofrefresh-b15-prereg.md`.
- **Base SHA:** `2de44bad8` (journey-establishment r137 closeout; local
  master at worktree registration, ahead of origin/master 249da4729
  which is an ancestor — the local merges since the last batch ship
  are not yet pushed; ship loop owns pushes). If master moves during
  the run, rebase onto the explicit master SHA at closeout and
  re-verify leg (a) on the rebased tip; the panel stays valid only if
  the move touches NO manifest file. A version-bump move touches the
  2 version-stamp manifest keys (finding #2316) and would make the
  panel stale on the final tip — in that case do NOT merge a NO-GO;
  report stale-key counts (b14 vs b15) and whether merging still
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
  blaming the change); (d) neutrality reproduces the prior panel on
  every proof case, warnings 0; (e) test-proofrefresh-b15.js 12/12
  incl. stale-input negatives (the retained b14 panel AND the b13
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.

## Owed-check (run before the panel, on base 2de44bad8)

- `node scripts/godpath/test-measurement-proof-update.js` FAILS, exit 1,
  "Proof source inputs are not current"
  (`scripts/balance-proof-update.js:8`) — expected before the panel
  run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b14 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b14.json.gz`, sha256
  `63351ce634740e723570f412b1bf0238c90a0bcd4a482cb4d7e42c62e0f95f8b`):
  exactly **2 manifest keys differ** (of 526 total on the tip; 526 in
  the b14 panel):

  - `src/js/abilityActions.js` — sim-rageprecheck-b (e73ee835d):
    refuse Unleash Rage re-press while rageActive live
    (panel `fabd5737483f…`, tip `29515be97914…`)
  - `src/js/conversation.js` — journey-landing r131 HEED fix
    (63c051206): warn_you warning now engages the want
    (panel `02474e4acb9f…`, tip `2c015eb7cea2…`)

  Both are real game-code changes since the b14 panel (rageprecheck
  engine precheck + HEED want-engagement). No version-stamp key is
  stale on this tip. Observer and contract digests still match the
  b14 panel (observer f37e5ce03414…, contract 37bbb0fad947…).
  The staleness is the source manifest only: 2 real game-code changes.
  **Verdict of the owed-check: OWED.** Panels at b14 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel (to be filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b15-panel --n 16 --days 150`
- The `cases/` cache in `.proofrefresh-b15-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- Copy the regenerated panel to
  `evidence/2026-11-14/neutral-proofrefresh-b15.json.gz` (NEW file — do
  NOT overwrite b14/b13/b12), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-14/neutral-proofrefresh-b15.json.gz` — exit 0.
  No hand-edited hashes; re-point to the NEW panel only.

## Telemetry

- `scripts/telemetry-check.js` cannot parse the retained .gz panel
  (same limitation b11/b12/b13/b14 recorded) — record that, no lever
  played so no deviation to check; the neutrality reproduction (leg d)
  is the instrument check. Baseline NOT rolled.
