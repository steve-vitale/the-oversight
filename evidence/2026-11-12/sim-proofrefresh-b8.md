# sim-proofrefresh-b8 — measurement proof regenerated on the 0436a04e0 tip (rebased to 9f19007f0)

## Prereg (summary; full text in sim-proofrefresh-b8-prereg.md)

- **Run:** fleshout-loop-b-20261112T0930Z, axis scale-onramp / winnability
  chain, arm sim-proofrefresh-b8 (tracker 0730Z next blank #2).
- **Base SHA:** `0436a04e0fbab50b86d0111aa67461c35c2fcd4b` (read in the main
  tree immediately before the panel run); branch tip equals master at run
  start — rebased mid-run onto `9f19007f02cfdf95d206cab139909bf0a6e33b26`
  (see "Master move" below).
- **Primary metric:** `node scripts/godpath/test-measurement-proof-update.js`
  pass/fail on the tip. GO = exit 0, all legs pass.
- **Panel spec:** seeds [7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9],
  policies [capable, risk-aware, socialite, winseek], days 150, origin
  Columbus, Ohio — via `scripts/balance-panel.js` (64 rows).
- **Horizon:** N/A (infrastructure — the panel carries its own 150d spec).

## Why

The retained b7 panel (`evidence/2026-11-12/neutral-proofrefresh-b7.json.gz`,
generated on the d98aae0f0-based branch) is stale on this tip.
Verified by comparing `B.manifest('.')` against the panel's `sources` —
exactly 1 manifest key differs, after 17 master commits since the b7
branch base:

- `src/js/game.js` (hash fc88aaa8… → 108f3b5f… — the sim-synergydisc-b
  dawn-resonance double-passive synergy-discovery change, ce653cdab)

Observer and contract digests still match; the staleness is purely the
source manifest. Panels at b7 and earlier are superseded; the re-point
target is the NEW panel only.

## Before / after

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  0436a04e0 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed on the branch
  before the panel run, matching the coordinator's baseline.
- After: the same test exits 0, 9 passed / 0 failed (on the rebased tip
  d199682c6).

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b8-panel --n 16 --days 150`
- Ran 10:00–10:41Z (~41 min wall, NO parent deaths, NO resumes): run
  under `setsid` from the start per the prereg, and the parent survived
  the whole run intact — unlike b7, which died silently twice before
  its final leg ran under setsid. Load avg 19–27 during the run (the
  sibling sim-synergyholdout-b panel generating concurrently in its own
  tree). The driver printed `Saved .proofrefresh-b8-panel; 64 cases,
  0 cached jobs` — a fresh `--out` dir, so all 68 jobs ran fresh this
  session (0 reused). No stale `.json.tmp` partials at any check.
- Result: `evidence/2026-11-12/neutral-proofrefresh-b8.json.gz`,
  sha256 `067ff0dbd0b27a5205b01f33c32b8ff96702762df006a6f4d8b0a40efa2f47c5`.
  The `cases/` cache in `.proofrefresh-b8-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == d9613d279` (prereg commit), `sourceHeadEnd ==
  d49c82d25` (proof-test commit) — the pre-rebase SHAs, both on the branch
  above 0436a04e0. After the mid-run rebase (see below) the manifest was
  re-verified against the panel on the rebased tip: 0 keys differ,
  observer/contract digests still match.

## Proof update

- `node scripts/balance-proof-update.js evidence/2026-11-12/neutral-proofrefresh-b8.json.gz`
  exit 0; `scripts/balance-proof.json` now points at the new panel with
  the matching panelDigest.

## Test — `scripts/test-proofrefresh-b8.js`: 11 passed, 1 failed, adjudicated

Two runs of the full 12-leg test on the rebased tip (10:46Z and 10:52Z),
both 11/12 with the same single failing leg:

- validate passes on the new panel; `test-measurement-proof-update.js`
  exit 0; `test-measurement-workflow.js` 9/9;
  `validate-ontology.js` 138 systems;
- neutrality 4/4 match; rows 64/64; neutrality reproduces the retained
  b7 panel AND the b6 panel (identical (policy, seed, match, warnings)
  tuples — regeneration moved no verdict);
- `sourcesStable` true; stale-input negative checks: the retained b7 panel
  AND the b6 panel both FAIL `validate()` on this tip with
  "Proof source inputs are not current" (green is not vacuous).
- The one failing leg, both times, is `test-measurement-cache-flags.js`:
  0/4 on the first run, 3/4 on the second (improving as load fell from
  ~22 to ~3). This is the prereg-adjudicated load artifact, not a logic
  failure: the test spawns `balance-panel.js` with a hard 30s timeout,
  and the manual replication with generous (300s) timeouts goes 4/4 —
  SIMOPT=0 spawn 40.5s, SIMOPT=1 spawn 33.2s (both over the 30s cap,
  both exit 0), repeat spawn 11.3s reusing 2 cached jobs; 4 jobs, 4
  distinct keys, 2 entries per SIMOPT value. Per prereg (c), the manual
  4/4 stands, recorded here — never a silent pass. The sibling holdout
  panel was still running during both test runs, which is why even the
  second run tripped the cap once.

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies:

- national 14/64, wins 15/64, entered 15/64 — all 15 wins from the
  capable policy (15/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 55/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc IV is also 55/64); it is NOT the entered/won count
  (entered 15/64 is the like-for-like number against b7's 16/64 and
  b5's 15/64).
- Wave reach: 14/64 reached wave 5, 63/64 reached wave 4 (the single
  miss: winseek seed 42, village-lost at d32 on wave 3).
- Max Arc: 55/64 Arc IV, 9/64 Arc III.
- Median survival 90 game-days, max 151.
- End reasons: village-lost 44, over-other 15, survived 5.
- Vests 19 total; communityLost 44.
- Per-policy median days: capable 90, risk-aware 113.5, socialite 81,
  winseek 71.
- Per-policy wave-5 reach: capable 6, risk-aware 3, socialite 5,
  winseek 0.
- Per-policy vests: capable 0, risk-aware 6, socialite 5, winseek 8.

Against b7's rows (same spec, one synergy game.js change between):
won 16→15, entered 16→15, national 15→14, table 57→55, wave-5 17→14,
vests 23→19. These are the instrument's own rows on the current tip,
reported as carried — not a balance verdict (this arm re-proves the
instrument; no lever was played, and no compare run was done on the
synergy change). No telemetry deviation check was run: the arm played
no lever and the panel is a single retained .gz, not per-seed evidence.

## Master move (during the run)

Master DID move during the panel window: `git rev-parse master` in the
main tree reads 0436a04e0 before, 9f19007f0 after — 7 Loop A
bisect-round-5 commits (sim-bisect-r5-cut1-a / cut2-a + adoption
evidence). All 29 changed files are evidence/ + bisect instrument
scripts; 0 manifest hits (verified against `B.manifest('.')`). Per the
prereg rule the panel was KEPT: the branch was rebased onto the
explicit new master SHA 9f19007f0 (clean, no conflicts, no rebase
quirk), the manifest re-verified 0 diffs on the rebased tip, and all
proof legs re-run there before committing, so the coordinator's
`--ff-only` merge stays clean.

## Verdict

**GO** — every prereg threshold (a)–(f) holds on the rebased tip
9f19007f0, with the cache-flags leg (c) standing on the prereg-authorized
manual 4/4 replication (measured spawn times 40.5s / 33.2s vs the 30s
test cap, under sibling-panel load). Proof is fresh, current, and
neutral. Ready to merge, pending ship.

## Commits (branch sim-proofrefresh-b8, base 0436a04e0 → rebased onto 9f19007f0)

- c5bbf6e02 — prereg (pre-rebase d9613d279)
- d199682c6 — proof test (12 legs) (pre-rebase d49c82d25)
- (this commit) — fresh real neutral panel + proof re-point + evidence

## Metric review

- The primary metric judged what it claimed: the proof test failed on
  the stale tip with exactly the expected manifest-mismatch error (1 key,
  src/js/game.js) and passed after a real regeneration + re-point. No
  re-scoring was needed; the neutrality-reproduction legs confirmed
  regeneration moved no verdict (b7 and b6 tuples identical to the
  fresh panel's).
- The cache-flags leg failed only on its 30s spawn timeout under
  concurrent-panel load, twice, and passed 4/4 manually with generous
  timeouts — the prereg's adjudication path, used as written. If the
  timeout keeps tripping on refresh rounds run alongside sibling panels,
  the test's 30s cap (not the cache-flag logic) is the thing to revisit
  next round.
- The setsid-from-the-start panel run survived load avg 19–27 with zero
  silent parent deaths, where b7 died twice before its setsid leg —
  the b7 precedent's prescription works; keep it for the next refresh.
- Nothing outside scope surfaced except the mid-run master move (Loop A
  bisect round 5 landing, 0 manifest files — handled by the prereg rule,
  panel kept, rebase + re-proof).
