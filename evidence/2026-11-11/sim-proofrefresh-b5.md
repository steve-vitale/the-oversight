# sim-proofrefresh-b5 — measurement proof regenerated on the 49ca310fa tip

## Prereg (summary; full text in sim-proofrefresh-b5-prereg.md)

- **Run:** fleshout-loop-b-20261111T1830Z, axis scale-onramp / winnability
  chain, arm 1 of 3 (sim-proofrefresh-b — tracker 1248Z/1930Z next blank #1,
  twice owed).
- **Base SHA:** `49ca310fa700013146225f61e38bc13aca13959f` (read in the main
  tree immediately before the panel run); branch rebased onto it from
  3b4aa8123 before any judged computation.
- **Primary metric:** `node scripts/godpath/test-measurement-proof-update.js`
  pass/fail on the rebased tip. GO = exit 0, all legs pass.
- **Panel spec:** seeds [7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9],
  policies [capable, risk-aware, socialite, winseek], days 150, origin
  Columbus, Ohio — via `scripts/balance-panel.js` (64 rows).
- **Horizon:** N/A (infrastructure — the panel carries its own 150d spec).

## Why

The retained reconcile panel (`evidence/2026-11-11/neutral-reconcile.json.gz`,
generated on tip 94f76882b) is stale on this tip. Verified by comparing
`B.manifest('.')` against the panel's `sources` — exactly 2 manifest keys
differ, both from the batch ship version bump (bead0e9bb, "Version bump
7094baefb-20261111-174345"):

- `src/js/build.js`
- `index.html`

No other manifest file moved between 94f76882b and 49ca310fa. The r182
commits (9dc1b15f6, d375564d8, 49ca310fa) are measurement-only
(scripts/evidence), and the vetphantom-b / tier4 / Loop A 1521Z landings in
between touched no manifest file — the version bump alone staled the proof.
Panels at 598e21bdb and earlier are superseded; the re-point target is the
NEW panel only.

## Before / after

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  49ca310fa with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed on the rebased
  branch before the panel run, matching the coordinator's baseline.
- After: the same test exits 0, 9 passed / 0 failed.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b5-panel --n 16 --days 150`
- Ran 19:33–19:55Z (~22 min incl. a container restart at ~19:37Z that
  SIGTERM'd the first attempt after 4 cases; resumed in the same out dir,
  the 4 cached cases reused — r3 precedent). Load avg 2–16 during the run.
- Result: `Saved .proofrefresh-b5-panel; 64 cases, 4 cached jobs.`
  64 rows, 64 distinct policy/seed combos, `validity.sourcesStable: true`,
  neutrality 4/4 match (capable/risk-aware/socialite/winseek @ seed 7),
  `sourceHeadStart == a30ea7030` (prereg commit),
  `sourceHeadEnd == d780a348c` (test commit) — both on the branch above
  49ca310fa; the manifest is identical across them (prereg + test commits
  touch only evidence/ and a scripts/test file outside the manifest).
- Retained panel (byte copy of `.proofrefresh-b5-panel/panel.json.gz`):
  `evidence/2026-11-11/neutral-proofrefresh-b5.json.gz`,
  sha256 `5717c4dabdab6e1472ef4ad59dda5db265ff167ad82e16e7b7a9214e419790d8`.
  The `cases/` cache in `.proofrefresh-b5-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).

## Proof update

- `node scripts/balance-proof-update.js evidence/2026-11-11/neutral-proofrefresh-b5.json.gz`
  exit 0; `scripts/balance-proof.json` now points at the new panel with the
  matching panelDigest.

## Test — `scripts/test-proofrefresh-b5.js`: 12 passed, 0 failed

On the rebased tip (see "Master move" below), all legs green with no
adjudication needed — including `test-measurement-cache-flags.js` 4/4
(load had cleared enough for its 30s spawns):

- validate passes on the new panel; `test-measurement-proof-update.js`
  exit 0; `test-measurement-workflow.js` 9/9;
  `test-measurement-cache-flags.js` 4/4; `validate-ontology.js` 138 systems;
- neutrality 4/4 match; rows 64/64; neutrality reproduces the reconcile
  panel AND the b4 panel (identical (policy, seed, match, warnings)
  tuples — regeneration moved no verdict);
- `sourcesStable` true; stale-input negative checks: the reconcile panel
  AND the b4 panel both FAIL `validate()` on this tip with
  "Proof source inputs are not current" (green is not vacuous).

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies:

- national 15/64, table 15/64, wins 15/64, entered 15/64 — all 15 from the
  capable policy (15/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- Wave reach: 18/64 reached wave 5, 46/64 reached wave 4 (every row reached
  at least wave 4).
- Max Arc: 58/64 Arc IV, 6/64 Arc III.
- Median survival 90 game-days, max 156.
- End reasons: village-lost 43, over-other 15, survived 6.
- Vests 24 total; communityLost 43.
- Per-policy median days: capable 90, risk-aware 140, socialite 89,
  winseek 78.

These are the instrument's own rows on the current tip, reported as carried
— not a balance verdict (this arm re-proves the instrument; no lever was
played).

## Master move (during the run)

Master moved once after the panel run: 49ca310fa → 3eec28a81
(sim-siegedesign-a: `evidence/2026-11-11/sim-siegedesign-a.md` +
`scripts/test-siegedesign-a.js` — evidence + scripts only, NO manifest
files). Per the prereg master-move rule: panel kept, branch rebased onto
the explicit new SHA 3eec28a81 (clean rebase, 3 commits replayed), all
proof legs re-run on the rebased tip — `test-proofrefresh-b5.js` 12/12
green there too. No regeneration was needed.

## Verdict

**GO** — every prereg threshold (a)–(f) holds on the rebased tip
3eec28a81. Proof is fresh, current, and neutral. Ready to merge, pending ship.

## Commits (branch sim-proofrefresh-b4, base 3eec28a81)

- 26560e728 — prereg
- 361a5c590 — proof test (12 legs)
- c5a23bf0c — fresh real neutral panel + proof re-point (after rebase)

## Metric review

- The primary metric judged what it claimed: the proof test failed on the
  stale tip with exactly the expected manifest-mismatch error and passed
  after a real regeneration + re-point. No re-scoring was needed; the
  cache-flags leg passed outright this round (no load-artifact
  adjudication), and the neutrality-reproduction legs confirmed
  regeneration moved no verdict.
- No delta in neutrality reproduction (reconcile and b4 tuples identical
  to the fresh panel's).
- Nothing outside scope surfaced except the container restart mid-panel
  (SIGTERM at ~19:37Z, 4 cases in) — the panel's own case cache made the
  resume exact; recorded here, not chased. The batch ship version bump
  moving `src/js/build.js` + `index.html` is the standing reason a
  version-bump-only landing still requires a proof refresh — worth
  remembering at the next ship, not a finding to chase in this arm.
