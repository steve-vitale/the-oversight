# reconcile gate — 331 passed, 9 failed in 2040s (tip 7733d5cd0)

Gate: `node scripts/check.js --quick`, log `evidence/2026-11-11/reconcile-gate.log`.
Ran 12:42–13:16Z under heavy load (load avg peaked 13.64 on the 1.5-CPU box:
Loop A 1115Z arms + Loop B registering concurrently).

## The 9 failures, adjudicated

| Test | Gate result | Standalone re-run | Verdict |
|---|---|---|---|
| test-measurement-cache-flags.js | exit 1, 92.7s, 0/4 | Manual replication of all 4 legs green (both CLI configs exit 0, 4 jobs/4 keys, SIMOPT 2+2, repeat "2 cached jobs") | Load artifact (30s spawn timeout), same as r178 |
| test-occupation-panels.js | TIMEOUT 120.1s | — | Standing pre-existing failure |
| test-phone-frame-proof.js | exit 1, 9.9s, stale receipt | — | Standing pre-existing failure |
| test-trust-observer-neutrality.js | TIMEOUT 120.0s | 6/6 green, exit 0, 49s | Load artifact (documented, r178) |
| test-synergy-stall.js | TIMEOUT 120.2s | exit 0, 57s | Load artifact (documented, r178) |
| test-capable-bot-20261014.js | TIMEOUT 120.2s | 41/42: section 7 fails deterministically (see below) | Seed drift, re-seeded 81→65 (see below) |
| test-comfort-arc.js | TIMEOUT 120.1s | 9/9 green, exit 0, 72s | Load artifact |
| test-living-garden-deed-attainment.js | TIMEOUT 120.1s | exit 0, 11m07s (starved by load) | Load artifact |
| test-one-person-army-deed-attainment.js | TIMEOUT 120.2s | exit 0, 6m25s | Load artifact |

## Capable-bot: seed drift, not a regression
Standalone on the reconcile tip, section 7 ("real capable player combat earns
the food deed at first use") fails deterministically: the single recorded use
is `{"fighting":true,"before":true,"after":true,"earned":true,
"source":"v:mara_vasquez"}` — villager Mara Vasquez banks the feast deed
before the player's first combat use. The test file's own header documents
this as the seed-drift class (8 prior re-seeds; SEATBLOW-OPEN stands, a
villager banking first is legitimate play, so the fixture is re-seeded rather
than the assertion loosened). The merge commit itself notes the merged base
must be re-verified by running the test.
- Baseline check: the test passes 42/42 on master `ae53134ae`
  (log `evidence/2026-11-11/capable-bot-baseline-master.log`, scratch tree
  `capable-baseline`, released after the check).
- Fix per the file's convention: re-seed 81→65 (Cursor's OVE-161 seed — the
  merged base carries Cursor's code, so 65 restores player-first).
  Verified standalone 42/42 twice on the reconcile tip
  (log `evidence/2026-11-11/capable-bot-reseed65-final.log`).
  No assertion changed; comment history appended in the test file.

## Notably green this run (previously standing)
Measurement-proof staleness pair, mobile-combat-cadence,
establishment-r20-fixes — all pass on this tip (proof refreshed in 7733d5cd0).

## Runtime restart
A runtime/VM restart at ~13:35Z killed the first one-person-army standalone
run mid-flight (session lost, no result). State verified intact afterward
(branch tip, proof commit, gate log, registry heartbeat all present); the
run was re-done green. Nothing was lost.

## Verdict: GO (with the re-seed)
All 9 failures adjudicated: 2 standing, 6 load artifacts verified green
standalone, 1 seed drift fixed by the documented re-seed (verified 42/42).

## Owed after this gate
Master moved during the landing (b09cf584e → ae53134ae, 14 commits incl.
journey-crisis r180 touching src/js/conversation.js + convo-wants.js), so the
branch needs a second merge-forward; r180's src/js touch re-stales the proof,
so a second proof refresh + re-gate are owed before the ff-only merge.
