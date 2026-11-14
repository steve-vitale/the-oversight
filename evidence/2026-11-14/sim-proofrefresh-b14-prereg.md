# sim-proofrefresh-b14 — prereg (measurement proof regeneration, round 14)

## Run

- **Run:** fleshout-loop-b-20261114T0330Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b14 (tracker blank #2:
  "proof refresh round 14 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 13 was GO 12/12 on its panel tip
  102853490 but NO-GO on the final tip 62c19318e by leg (a) alone —
  exactly 1 stale version key (src/js/abilityActions.js, the
  sim-retribution-b fix: defer retribution death lines until after the
  RETRIBUTION summary). Round 14 is owed immediately and follows the
  proven round-11/12/13 pattern exactly (regen + re-point + 6 GO legs),
  on the current tip.
- **Base SHA:** `8c83b6a9a266b32cc0b0c1e51f2aa794998facc1` (journey-scale
  r196 addendum; main-tree master at worktree fast-forward, unchanged
  at prereg time). Master moved since round 13's final tip
  (transplant landings + journey-scale r196). If master moves during
  the run, rebase onto the explicit master SHA at closeout and
  re-verify leg (a) on the rebased tip; the panel stays valid only if
  the move touches NO manifest file.
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
  every proof case, warnings 0; (e) test-proofrefresh-b14.js 12/12
  incl. stale-input negatives (the retained b13 panel AND the b12
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.

## Owed-check (run before the panel, on base 8c83b6a9a)

- `node scripts/godpath/test-measurement-proof-update.js` FAILS, exit 1,
  "Proof source inputs are not current"
  (`scripts/balance-proof-update.js:8`) — expected before the panel
  run, matching the coordinator's baseline (round 13 NO-GO on
  62c19318e by exactly the abilityActions.js key).
- `B.manifest('.')` vs the retained b13 panel's `sources`
  (`evidence/2026-11-13/neutral-proofrefresh-b13.json.gz`, sha256
  `c70edd6f811a111b6335459a2cf228f8802d45532fcd781ba117fa5b18d6e8ea`):
  exactly **1 manifest key differs** (of 526 total on the tip; 526 in
  the b13 panel):

  - `src/js/abilityActions.js` — sim-retribution-b (62c19318e):
    defer retribution death lines until after the RETRIBUTION summary
    (panel `b32275f576ce…`, tip `fabd5737483f…`)

  The transplant landings + journey-scale r196 moves since 62c19318e
  touched NO manifest file: the staleness on this tip is exactly the
  same single key round 13 closed with. Fewer stale keys than the
  brief's "expect MORE than 1" — the moves were evidence/test/driver
  scripts only.
  Observer and contract digests still match the b13 panel
  (observer f37e5ce03414…, contract 37bbb0fad947…). The staleness is
  the source manifest only: 1 real game-code change, no version stamp.
  **Verdict of the owed-check: OWED.** Panels at b13 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel (to be filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b14-panel --n 16 --days 150`
- The `cases/` cache in `.proofrefresh-b14-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- Copy the regenerated panel to
  `evidence/2026-11-14/neutral-proofrefresh-b14.json.gz` (NEW file — do
  NOT overwrite b13/b12/b11), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-14/neutral-proofrefresh-b14.json.gz` — exit 0.
  No hand-edited hashes; re-point to the NEW panel only.

## Telemetry

- `scripts/telemetry-check.js` cannot parse the retained .gz panel
  (same limitation b11/b12/b13 recorded) — record that, no lever played
  so no deviation to check; the neutrality reproduction (leg d) is the
  instrument check. Baseline NOT rolled.
