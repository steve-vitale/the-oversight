# sim-proofrefresh-b20 — prereg (measurement proof regeneration, round 20)

## Run

- **Run:** fleshout-loop-b-20261115T0621Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b20 (tracker blank: "proof
  refresh round 20 on the next manifest change (regenerate + re-point,
  do not hand-edit)"). Round 19 was GO 12/12 on panel 8ea3a8bd
  (branch sim-proofrefresh-b19), merged. Round 20 is owed NOW: the
  funeral-mend landing (master b9b226430) changed src/js/hierarchy.js,
  which the proof manifest hashes, re-staling the b19 panel; the batch
  ship's index.html version stamp also moves the manifest. Round 20
  follows the proven round-13/18/19 pattern exactly (regen + re-point
  + 6 GO legs), on the current tip. Full prereg committed first:
  `evidence/2026-11-15/sim-proofrefresh-b20-prereg.md`.
- **Base SHA:** `b9b226430` (main-tree master at run start; the
  worktree branch sim-proofrefresh-b20 was registered at this tip,
  tree clean). If master moves during the run, rebase onto the
  explicit master SHA at closeout and re-verify leg (a) on the
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
  every proof case, warnings 0; (e) test-proofrefresh-b20.js 12/12
  incl. stale-input negatives (the retained b19 panel AND the b18
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.
- **Negative-panel note (brief vs pattern):** this round's brief names
  the b19 and b18 panels as the leg-(e) negatives — the two most
  recent prior panels, as b13 used b12/b11 and b19 used b18/b17. The
  b20 test checks b19/b18; the b13/b12 negatives are ALSO verified
  (validate() must fail on both) in the owed-check and recorded in
  the evidence file, matching the round-19 practice.

## Owed-check (run before the panel, on base b9b226430)

- (to be filled: proof-update FAIL exit 1 "Proof source inputs are
  not current"; workflow 8/9 with the staleness leg failing;
  B.manifest vs the retained b19 panel's sources — keys only in tip
  + keys differ, named; observer/contract digests; stale-input
  negatives b19, b18, b13, b12; pre-regeneration
  test-proofrefresh-b20.js legs before the ENOENT crash.)
- **Verdict of the owed-check: (to be filled: OWED or NOT-OWED).**
  If NOT-OWED, stop — do not regenerate a good proof.

## Panel (to be filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b20-panel --n 16 --days 150`
- (to be filled: single attempt, start/finish times, 64 cases, 0
  cached jobs, exit 0, wall time; sourceHeadStart == sourceHeadEnd;
  panel sha256; verification 0 keys differ, sourcesStable true,
  neutrality 4/4, warnings 0, tuple identical to b19 AND b18;
  0/64 rows differ vs b19; staleness counts.)
- The `cases/` cache in `.proofrefresh-b20-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- Copy the regenerated panel to
  `evidence/2026-11-15/neutral-proofrefresh-b20.json.gz` (NEW file — do
  NOT overwrite b19/b18/b13/b12), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-15/neutral-proofrefresh-b20.json.gz` — exit 0.
  No hand-edited hashes; re-point to the NEW panel only.

## Telemetry

- `scripts/telemetry-check.js` cannot parse the retained .gz panel
  (same limitation b11/b12/b13/b19 recorded) — record that, no lever
  played so no deviation to check; the neutrality reproduction
  (leg d) is the instrument check. Baseline NOT rolled.
