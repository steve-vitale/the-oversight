# sim-proofrefresh-b19 — prereg (measurement proof regeneration, round 19)

## Run

- **Run:** fleshout-loop-b-20261115T0310Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b19 (tracker blank #2:
  "proof refresh round 19 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 18 was GO 12/12 on panel
  cc38babf (branch sim-proofrefresh-b18), merged. Round 19 is owed
  NOW: the 0155Z Loop B round (master a4d0b2038) merged succpolity +
  holdbuild, which added policy files under scripts/policies/ that the
  proof manifest hashes, re-staling the b18 panel. Round 19 follows the
  proven round-11/12/13/14/15/16/17/18 pattern exactly (regen +
  re-point + 6 GO legs), on the current tip. Full prereg committed
  first: `evidence/2026-11-14/sim-proofrefresh-b19-prereg.md`.
- **Base SHA:** `a4d0b2038` (main-tree master at run start; the
  worktree branch was fast-forwarded from its registration point
  910bff7f4 to a4d0b2038 before the prereg — no local commits existed
  at ff time, tree clean). If master moves during the run, rebase onto
  the explicit master SHA at closeout and re-verify leg (a) on the
  rebased tip; the panel stays valid only if the move touches NO
  manifest file.
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
  every proof case, warnings 0; (e) test-proofrefresh-b19.js 12/12
  incl. stale-input negatives (the retained b18 panel AND the b17
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.
- **Negative-panel note (brief vs pattern):** the task brief names
  the b13 and b12 panels as the leg-(e) negatives, copied from the
  round-13 brief. Rounds 14–18 have since landed and the current
  retained panel (the one `scripts/balance-proof.json` points at) is
  b18, so the pattern-faithful negatives — the two most recent prior
  panels, as b13 used b12/b11 and b18 used b17/b16 — are b18 and b17.
  The b19 test checks b18/b17; the b13 and b12 negatives are ALSO
  verified (validate() must fail on both) in the owed-check and
  recorded in the evidence file, so the brief's literal requirement is
  met as well.

## Owed-check (run before the panel, on base a4d0b2038)

- `node scripts/godpath/test-measurement-proof-update.js` FAILS, exit 1,
  "Proof source inputs are not current"
  (`scripts/balance-proof-update.js:8`) — to be confirmed in the
  worktree before the panel run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b18 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b18.json.gz`, sha256
  `cc38babf2acdff069b86636e21cc4028a7c70bf858b991fbb166e769ba242786`):
  exact differing keys to be listed here after the check runs (the
  0155Z merges added `scripts/policies/competent-answercourt-b.js`,
  `scripts/policies/competent-scaleclimb-b.js`,
  `scripts/policies/competent-succpolity-b.js` — the expected staleness
  — plus any version-stamp or game-code keys that moved since the b18
  panel). The b13 panel
  (`evidence/2026-11-13/neutral-proofrefresh-b13.json.gz`) is diffed
  as well, per the brief.
- Verdict of the owed-check: to be recorded here (OWED iff the proof
  test fails and the manifest differs from the retained panel).

## Panel (to be filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b19-panel --n 16 --days 150`
- The `cases/` cache in `.proofrefresh-b19-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- Copy the regenerated panel to
  `evidence/2026-11-14/neutral-proofrefresh-b19.json.gz` (NEW file — do
  NOT overwrite b18/b17/b13/b12), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-14/neutral-proofrefresh-b19.json.gz` — exit 0.
  No hand-edited hashes; re-point to the NEW panel only.

## Telemetry

- `scripts/telemetry-check.js` cannot parse the retained .gz panel
  (same limitation b11/b12/b13 recorded) — record that, no lever played
  so no deviation to check; the neutrality reproduction (leg d) is the
  instrument check. Baseline NOT rolled.
