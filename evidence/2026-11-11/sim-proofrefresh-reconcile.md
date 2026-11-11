# sim-proofrefresh-reconcile — measurement proof regenerated on the reconcile tip

## Why
The retained b4 panel (`evidence/2026-11-11/neutral-proofrefresh-b4.json.gz`)
is stale on this tip: the reconciliation merge (`1f289e2c7`, master `b09cf584e`
into `reconcile-divergence`) brought in manifest inputs it never saw
(Cursor's `villager-brain.js`, `person-trust.js`, `companion-score.js`, plus
the Nov 10–11 landings touching `game.js`, `convo-*.js`, `favor-*.js`), and
the re-pin (`ec7b0bae5`, person-trust EAT 59 / FORAGE 2 / HAUL 0) touched the
person-trust baseline. Per the manifest rule a src/js touch at landing
requires a fresh proof.

## Panel
- Command: `node scripts/balance-panel.js --out .proofrefresh-reconcile-panel --n 16 --days 150`
- Ran 11:35–12:30Z (~55 min) under Loop A + Loop B load; no flap crash, no retry needed.
- Result: `Saved .proofrefresh-reconcile-panel; 64 cases, 0 cached jobs.`
  64 rows, 64 distinct policy/seed combos, `validity.sourcesStable: true`,
  neutrality 4/4 match (capable/risk-aware/socialite/winseek @ seed 7),
  `sourceHeadStart == sourceHeadEnd == ec7b0bae5`.
- Retained panel (byte copy of `.proofrefresh-reconcile-panel/panel.json.gz`):
  `evidence/2026-11-11/neutral-reconcile.json.gz`,
  sha256 `39b5e2826527b0323014fc1e8549028d10a8005d50dfb0bd5495911b302981e6`.
  The `cases/` cache in `.proofrefresh-reconcile-panel/` is NOT committed.

## Proof update
- `node scripts/balance-proof-update.js evidence/2026-11-11/neutral-reconcile.json.gz`
  exit 0; `scripts/balance-proof.json` now points at the new panel with the
  matching panelDigest.

## Test — `scripts/test-proofrefresh-reconcile.js`: 11 passed, 1 failed
- validate passes on the new panel; `test-measurement-proof-update.js` exit 0;
  `test-measurement-workflow.js` 9/9; `validate-ontology.js` 138 systems;
  neutrality 4/4; rows 64/64; neutrality reproduces the b4 panel and the b2
  panel; `sourcesStable` true; stale-input negative checks: the b4 panel AND
  the b2 panel both FAIL `validate()` on this tip with
  "Proof source inputs are not current" (green is not vacuous).
- The 1 failure is `test-measurement-cache-flags.js` 0/4 — adjudicated as the
  known 30s spawn-timeout load artifact (same as r178 gate 2): the test spawns
  `balance-panel.js` three times with `timeout: 30000`, and under the current
  Loop A + Loop B load each spawn exceeds 30s (standalone run took 91.5s of
  three 30s timeouts). Manual replication of all four legs with generous time
  is green: both CLI configs exit 0, 4 jobs / 4 distinct keys, SIMOPT 2+2,
  repeat prints "2 cached jobs". Effective trio: 9/9 + 9/9 + 4/4-manual.

## Verdict
Proof is fresh, current, and neutral on the reconcile tip. Ready for the gate.
