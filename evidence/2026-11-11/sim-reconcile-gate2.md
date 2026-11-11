# Reconciliation gate #2 — tip ec5ee00a8 (merge of master 965e8d04e)

- Command: `node scripts/check.js --quick` in worktree
  `~/workspace/worktrees/reconcile-forward-2` (branch `reconcile-divergence`).
- Log: `evidence/2026-11-11/reconcile-gate2.log` (+ `.err`, empty).
- Result: **332 passed, 8 failed in 1240s.** (Gate #1 on 7733d5cd0:
  331/9 in 2040s — one fewer failure, ~40% faster; the load that
  produced gate #1's timeout cluster had cleared.)

## Failures (8) — all adjudicated, none new

1. `test-living-garden-deed-attainment.js` — TIMEOUT 120.1s.
   Load artifact (gate #1 identical; standalone green 11m07s on the
   gate-1 tip; no src/js change since).
2. `test-measurement-cache-flags.js` — exit 1, 74.8s, 3/4.
   Only the "both actual CLI configurations complete valid neutral
   panels" leg failed (spawns balance-panel 3x with 30s timeouts);
   the other 3 legs green. Same documented load artifact as gate #1.
   The trio test `test-proofrefresh-reconcile.js` on THIS tip passed
   cache-flags 4/4 thirty minutes earlier.
3. `test-phone-frame-proof.js` — exit 1, 8.3s. Standing pre-existing
   (stale receipt).
4. `test-occupation-panels.js` — TIMEOUT 120.1s. Standing pre-existing.
5. `test-one-person-army-deed-attainment.js` — TIMEOUT 120.1s.
   Load artifact (gate #1 identical; standalone green 6m25s).
6. `test-trust-observer-neutrality.js` — TIMEOUT 120.1s.
   Load artifact (gate #1 identical; standalone 6/6 green, 49s).
7. `test-synergy-stall.js` — TIMEOUT 120.1s.
   Load artifact (gate #1 identical; standalone exit 0, 57s).
8. `test-capable-bot-20261014.js` — TIMEOUT 120.2s, in the "short sims"
   tail (seed 42 passing) — NOT the section-7 deterministic failure.
   Load artifact. Standalone re-run on THIS tip:
   exit 0, **40 passed, 0 failed** (log
   `evidence/2026-11-11/capable-bot-gate2-standalone.log`, 56s),
   including section 7: "real capable player combat earns the food
   deed at first use". The seed-65 re-seed holds on the final tip.

## Notably green (vs gate #1)

- Measurement-proof staleness pair (proof fresh after round-3 refresh).
- `test-comfort-arc.js` (was a 120s timeout in gate #1).
- `mobile-combat-cadence`, `establishment-r20-fixes` (green both gates).

## Verdict: GO

No new failure. Every failure is a known standing item or a 120s
load-timeout artifact with a green standalone/trio run on this tip.
The branch is cleared to land.
