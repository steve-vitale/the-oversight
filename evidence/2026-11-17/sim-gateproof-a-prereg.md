# sim-gateproof-a — prereg (fresh full gate + measurement-proof refresh)

## Run

- **Run:** fleshout-20261117T1015Z, axis food-economy, arm sim-gateproof-a
  (tracker blanks #1 + #2: fresh full gate + measurement-proof refresh).
  Zero game-code change expected — tooling/measurement only.
- **Base SHA:** `9be3676d8` (main-tree master at run start; the worktree
  branch sim-gateproof-a was registered at this tip, tree clean). If
  master moves during the run, rebase onto the explicit master SHA at
  closeout and re-verify leg (a) on the rebased tip; the panel stays
  valid only if the move touches NO manifest file.
- **Primary metric (Part A — gate):** `node scripts/check.js --quick`
  run ONCE on this tree: 0 attributable failures beyond the standing
  profile. Standing profile from recent runs: 330/10, 333/7, 280/7 —
  all with a pre-existing parity-gear assertion and a
  measurement-proof staleness pair.
- **Primary metric (Part B — proof):** `node
  scripts/godpath/test-measurement-proof-update.js` pass/fail on the
  tip. GO = exit 0, all legs pass, after the refresh.
- **Panel spec:** seeds [7], policies [capable, risk-aware, socialite,
  winseek], days 150, origin Columbus, Ohio — via
  `node scripts/balance-panel.js --out .proofrefresh-gateproof-a-panel --n 1`
  (4 rows). This is EXACTLY the command/spec that produced the panel
  currently pointed at (neutral-r211-rebased.json.gz, 4 cases, 199s,
  journey-endgame-r211.md:324).
- **Horizon:** N/A for the gate (check.js --quick carries its own list);
  the panel carries its own 150d spec.
- **GO bar (pre-registered):** (a) test-measurement-proof-update 9/9
  exit 0 on the final tip; (b) measurement-workflow 9/9; (c)
  cache-flags 4/4 outright (2026-11-12 load-artifact lesson: if it
  fails under load, run the discriminating A/B on a quiet box before
  blaming the change); (d) neutrality reproduces the prior panel on
  every proof case, warnings 0; (e) test-gateproof-a.js 12/12 incl.
  stale-input negatives (the retained r211-rebased panel AND the b20
  panel FAIL validate() on the new tip); (f) ontology exit 0; (g) the
  gate runs once with 0 attributable failures beyond the standing
  profile — the measurement-proof staleness pair must be ABSENT after
  the refresh (its presence would be a refresh failure, not a gate
  attribution question), and the parity-gear assertion is expected to
  remain as pre-existing. Any leg miss = NO-GO, no re-scoring.

## Spec decision (brief deviation, recorded before running)

The brief names the ede1a2796 precedent (capable/seed 7/30d) and the
current proof as 01ab3e346. Both are stale: the proof was re-pointed
twice since — b20 (64-row, 2c4bf282f, Nov 15) and then r211
(`--n 1`, 4-row, seed 7 x 4 policies x 150d, panel c015d348…,
journey-endgame-r211.md:324), which is what
scripts/balance-proof.json points at on this tip. Regenerating at
capable-only/30d would SHRINK the maintained proof from 4 cohorts to
1 and 150d to 30d — a coverage regression, not a refresh. This round
regenerates at the CURRENT proof's spec (`--n 1`, seed 7, 4 policies,
150d), preserving coverage exactly; the ede1a2796 lineage (seed 7,
minimal panel) is honored. The brief's core requirements — fresh
neutral panel, do NOT re-point to 598e21bdb (its scorecard source hash
no longer matches master), proof test green after — are honored
exactly. Coordinator can overrule the spec (a re-run at the other spec
is ~1 min of panel + a re-point).

## Owed-check (run before the panel, on base 9be3676d8)

- Before: `node scripts/godpath/test-measurement-proof-update.js`
  FAILS on 9be3676d8 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the
  worktree before the panel run, matching the coordinator's baseline.
  (PENDING: manifest-diff key list vs the retained r211 panel;
  workflow 8/9 check; cache-flags owed-check score; ontology.)
- **Verdict of the owed-check: PENDING.**

## Panel (filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-gateproof-a-panel --n 1`
- (PENDING: timing, cases, sha, sourceHeadStart/End, staleness counts,
  neutrality reproduction, row movement vs r211 panel.)
- Copy the regenerated panel to
  `evidence/2026-11-17/neutral-gateproof-a.json.gz` (NEW file — do NOT
  overwrite r211/b20/b19/b18), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-17/neutral-gateproof-a.json.gz` — exit 0 expected.
  No hand-edited hashes; re-point to the NEW panel only.

## Telemetry

- `scripts/telemetry-check.js` cannot parse retained `.gz` panels
  (same limitation b11/b12/b13/b19/b20 recorded) — record that, no
  lever played so no deviation to check; the neutrality reproduction
  (leg d) is the instrument check. Baseline NOT rolled.
