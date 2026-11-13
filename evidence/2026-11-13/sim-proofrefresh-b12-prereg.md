# sim-proofrefresh-b12 — prereg (measurement proof regeneration, round 12)

## Run

- **Run:** fleshout-loop-b-20261113T2230Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b12 (tracker blank #2:
  "proof refresh round 12 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 11 landed 2026-11-13 ~22:30Z
  (branch sim-proofrefresh-b11, panel regen on 89b9030f9, rebased onto
  941eecdce); round 12 follows the proven round-11 pattern exactly
  (regen + re-point + 6 GO legs).
- **Base SHA:** `95dbf07f3` (read in the worktree at panel start;
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
  every proof case, warnings 0; (e) test-proofrefresh-b12.js 12/12
  incl. stale-input negatives (the retained b11 panel AND the b10
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.

## Owed-check (run before the panel, on base 95dbf07f3)

- `node scripts/godpath/test-measurement-proof-update.js` FAILS, exit 1,
  "Proof source inputs are not current"
  (`scripts/balance-proof-update.js:8`) — confirmed in the worktree
  before the panel run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b11 panel's `sources`
  (`evidence/2026-11-12/neutral-proofrefresh-b11.json.gz`, sha256
  `2da0e215acb37614a3aced8bc7c4e479cde72edad30a26cd3a0e922ba4e77b1e`):
  exactly **2 manifest keys differ** (of 526 total on the tip; 526 in
  the b11 panel):

  - `src/js/conversation.js` — journey-social r195 (56655e81e):
    favor-requirements spend-out fires under the door-block cycle
  - `src/js/convo-dialogue.js` — journey-social r195 (56655e81e):
    empty-recap 4-variant pool

  Observer and contract digests still match the b11 panel. The
  staleness is purely the source manifest. **Verdict of the owed-check:
  OWED.** Panels at b11 and earlier are superseded; the re-point
  target is the NEW panel only.

## Panel (to be filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b12-panel --n 16 --days 150`
- The `cases/` cache in `.proofrefresh-b12-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- Copy the regenerated panel to
  `evidence/2026-11-12/neutral-proofrefresh-b12.json.gz` (NEW file — do
  NOT overwrite b11/b10/b9), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-12/neutral-proofrefresh-b12.json.gz` — exit 0.
  No hand-edited hashes; re-point to the NEW panel only.

## Telemetry

- `scripts/telemetry-check.js` cannot parse the retained .gz panel
  (same limitation b11 recorded) — record that, no lever played so no
  deviation to check; the neutrality reproduction (leg d) is the
  instrument check. Baseline NOT rolled.
