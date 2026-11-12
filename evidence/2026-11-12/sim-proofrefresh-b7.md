# sim-proofrefresh-b7 — measurement proof regenerated on the d98aae0f0 tip

## Prereg (summary; full text in sim-proofrefresh-b7-prereg.md)

- **Run:** fleshout-loop-b-20261112T0730Z, axis scale-onramp / winnability
  chain, arm sim-proofrefresh-b7 (tracker 1830Z next blank #1, re-opened).
- **Base SHA:** `d98aae0f03a900d41b6b563288db732457f69aa0` (read in the main
  tree immediately before the panel run); branch tip equals master at run
  start — no rebase needed.
- **Primary metric:** `node scripts/godpath/test-measurement-proof-update.js`
  pass/fail on the tip. GO = exit 0, all legs pass.
- **Panel spec:** seeds [7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9],
  policies [capable, risk-aware, socialite, winseek], days 150, origin
  Columbus, Ohio — via `scripts/balance-panel.js` (64 rows).
- **Horizon:** N/A (infrastructure — the panel carries its own 150d spec).

## Why

The retained b6 panel (`evidence/2026-11-11/neutral-proofrefresh-b6.json.gz`,
generated on the 1f27fd269-based branch, rebased) is stale on this tip.
Verified by comparing `B.manifest('.')` against the panel's `sources` —
exactly 14 manifest keys differ, after 68 master commits since the b6
branch base (journey-endgame r181–r185, sim-bisect adoptions,
sim-mcconfirm legs, sim-findings, sim-medname, and others):

- `src/data/regions.json`, `src/data/statusEffects.json`
- `src/js/bond-initiation.js`, `build.js`, `conversation.js`,
  `convo-beats.js`, `game.js`, `progression.js`, `storage.js`, `table.js`,
  `villager-agency.js`
- `scripts/policies/competent.js` (hash changed; the old content now
  lives under the new manifest key `scripts/policies/competent-r126.js`)
- `index.html`

Observer and contract digests still match; the staleness is purely the
source manifest. Panels at b6 and earlier are superseded; the re-point
target is the NEW panel only.

## Before / after

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  d98aae0f0 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed on the branch
  before the panel run, matching the coordinator's baseline.
- After: the same test exits 0, 9 passed / 0 failed.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b7-panel --n 16 --days 150`
- Ran 07:48–08:23Z (~35 min wall, two silent parent deaths mid-run):
  the first parent process died silently at 49/68 cached cases (last case
  written 08:02, found dead 08:09, empty stderr, no `.error.json`, memory
  fine at 4.5 GB available — cause undetermined, not OOM by the numbers);
  resumed in the same `--out` dir, the 49 cached cases reused. The resumed
  parent died the same silent way at 65/68 cached cases (3 in-flight
  `.json.tmp` partials, winseek seeds 6/8/9); the 3 stale `.tmp` files were
  removed per the b6 adoption precedent and the panel was resumed a second
  time under `setsid`, which completed: `Saved .proofrefresh-b7-panel;
  64 cases, 65 cached jobs.` Load avg 3–13 during the run (Loop A
  sim-synergydisc-b cache-flags work running in parallel). The double
  silent death under load is recorded here, not chased — the panel's own
  case cache made every resume exact, and the finished panel validates
  clean (see below). Worth a look before the next refresh if it recurs.
- Result: `evidence/2026-11-12/neutral-proofrefresh-b7.json.gz`,
  sha256 `67736e5343826e0c632fe08fadd6a131482a9a177184fcc4eb3ceee9468d9a65`.
  The `cases/` cache in `.proofrefresh-b7-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == sourceHeadEnd == b11f65862` (proof-test commit) —
  both on the branch above d98aae0f0; the manifest is identical across
  them (prereg + test commits touch only evidence/ and a scripts/test
  file outside the manifest).

## Proof update

- `node scripts/balance-proof-update.js evidence/2026-11-12/neutral-proofrefresh-b7.json.gz`
  exit 0; `scripts/balance-proof.json` now points at the new panel with
  the matching panelDigest.

## Test — `scripts/test-proofrefresh-b7.js`: 12 passed, 0 failed

On the tip, all legs green with no adjudication needed — including
`test-measurement-cache-flags.js` 4/4 (load had cleared enough for its
30s spawns):

- validate passes on the new panel; `test-measurement-proof-update.js`
  exit 0; `test-measurement-workflow.js` 9/9;
  `test-measurement-cache-flags.js` 4/4; `validate-ontology.js` 138 systems;
- neutrality 4/4 match; rows 64/64; neutrality reproduces the retained
  b6 panel AND the b5 panel (identical (policy, seed, match, warnings)
  tuples — regeneration moved no verdict);
- `sourcesStable` true; stale-input negative checks: the retained b6 panel
  AND the b5 panel both FAIL `validate()` on this tip with
  "Proof source inputs are not current" (green is not vacuous).

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies:

- national 15/64, wins 16/64, entered 16/64 — all 16 wins from the
  capable policy (16/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 57/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc IV is also 57/64); it is NOT the entered/won count
  the b5 note reported as "table 15/64" (there, table == entered == won).
  Reported with the field meaning stated so the two rounds stay comparable:
  entered 16/64 is the like-for-like number against b5's 15/64.
- Wave reach: 17/64 reached wave 5, 64/64 reached wave 4.
- Max Arc: 57/64 Arc IV, 7/64 Arc III.
- Median survival 90 game-days, max 150.
- End reasons: village-lost 41, over-other 16, survived 7.
- Vests 23 total; communityLost 41.
- Per-policy median days: capable 90, risk-aware 139, socialite 88.5,
  winseek 74.
- Per-policy wave-5 reach: capable 6, risk-aware 6, socialite 5,
  winseek 0.

These are the instrument's own rows on the current tip, reported as carried
— not a balance verdict (this arm re-proves the instrument; no lever was
played). No telemetry deviation check was run: the arm played no lever and
the panel is a single retained .gz, not per-seed evidence.

## Master move (during the run)

Master did NOT move during the panel window: `git rev-parse master` in the
main tree reads d98aae0f0 before and after. No rebase, no regeneration.

## Verdict

**GO** — every prereg threshold (a)–(f) holds on the tip d98aae0f0.
Proof is fresh, current, and neutral. Ready to merge, pending ship.

## Commits (branch sim-proofrefresh-b7, base d98aae0f0)

- 4948ea966 — prereg
- b11f65862 — proof test (12 legs)
- (this commit) — fresh real neutral panel + proof re-point + evidence

## Metric review

- The primary metric judged what it claimed: the proof test failed on the
  stale tip with exactly the expected manifest-mismatch error (14 keys)
  and passed after a real regeneration + re-point. No re-scoring was
  needed; the cache-flags leg passed outright this round (no load-artifact
  adjudication), and the neutrality-reproduction legs confirmed
  regeneration moved no verdict.
- No delta in neutrality reproduction (b6 and b5 tuples identical to the
  fresh panel's).
- Nothing outside scope surfaced except the two silent panel-parent deaths
  mid-run (49/68, then 65/68) under heavy parallel load — the panel's own
  case cache made every resume exact; recorded here, not chased. If it
  recurs on the next refresh, the first suspect is the runtime reaping
  long background parents under load, not the driver (no error output,
  no `.error.json`, memory fine).
