# Measurement neutrality proof refresh — sim-proofrefresh-a

Loop A run fleshout-2026-11-07T0515Z · axis scale-onramp / winnability chain ·
arm: MEASUREMENT NEUTRALITY PROOF REFRESH (#1353, tracker blank #8).
Measurement infrastructure only — no src/js change, no Game-root change.

## Pre-registration

- Primary metric: `scripts/godpath/test-measurement-proof-update.js` exit 0
  (9/9 assertions), plus the observer-neutrality set green.
- GO threshold: proof-update test green AND all five observer-neutrality
  tests green AND the diff is scripts/ + evidence/ only.
- Panel spec (same as the superseded 2026-11-05 bondinit refresh, per
  tracker header): seed 7, policies capable/risk-aware/socialite/winseeker,
  150 days, origin Columbus, Ohio. Single-seed capable/seed-7/150d spec —
  this is the maintenance proof, not a balance verdict; it exists so the
  gate can tell a real Game change from observer drift.
- Horizon/seeds: 1 seed × 4 policies + 4 observe=0 proof runs = 8 child sims.

## 1. Failure reproduced (before)

`node scripts/godpath/test-measurement-proof-update.js` → exit 1:

```
Error: Proof source inputs are not current
    at Object.validate (scripts/balance-proof-update.js:8:76)
```

The retained proof pointed at `evidence/2026-11-05/neutral-bondinit.json.gz`
(source head `f5eee88ee`). Against current master (`41007b9d4`) the panel
manifest differs in 23 files, including the tracker's 7 (build.js, game.js,
havenGrowth.js, index.html — feastBuff.js, storage.js, villager-build.js
were already captured by the Nov 5 refresh) plus, since Nov 5: app.js,
betrayal.js, comms.js, conversation.js, convo-dialogue.js, convo-wants.js,
engine/combat.js, exposure.js, fieldFights.js, finale-campaign.js, food.js,
hierarchy.js, ledger.js, sigW5.js, table.js, src/data/characterGen.json,
scripts/sweep-compare.js, scripts/policies/competent.js + huntstaff.js, and
14 newly added scripts/policies/*.js files. No re-point to the superseded
598e21bdb artifact was made or considered — its panel's scorecard source
hash no longer matches master (tracker header).

## 2. Refresh procedure followed

Per docs/MEASUREMENT.md §§14–15 and scripts/balance-proof-update.js:

```
node scripts/balance-panel.js --out /tmp/neutral-proofrefresh-a \
  --seeds 7 --policies capable,risk-aware,socialite,winseek --days 150
# → Saved /tmp/neutral-proofrefresh-a; 4 cases, 0 cached jobs. Exit 0.
#   (The builder throws on any invalid panel: sources unstable, failed
#   neutrality, cohort errors, warnings, observer errors.)

cp /tmp/neutral-proofrefresh-a/panel.json.gz \
   evidence/2026-11-07/neutral-proofrefresh-a.json.gz
node scripts/balance-proof-update.js evidence/2026-11-07/neutral-proofrefresh-a.json.gz
# → exit 0; scripts/balance-proof.json now points at the fresh panel,
#   panelDigest 2489c89cc42baeabf83c38210134e5f7c0d51a72aa53c864ebeb67ffdee9bfd8
```

The `cases/` cache stayed in /tmp and was NOT committed (per §15).

## 3. Proof result (after)

Fresh panel `evidence/2026-11-07/neutral-proofrefresh-a.json.gz`:

- sourceHeadStart == sourceHeadEnd == `41007b9d4` (current master tip)
- sourcesStable: true; 477 source inputs recorded
- neutrality: 4/4 match, 0 warnings (capable, risk-aware, socialite, winseek × seed 7)
- rows: 4, no warnings, no observer errors, no gear errors

`node scripts/godpath/test-measurement-proof-update.js` → **9 passed, 0 failed** (exit 0).

Observer-neutrality set (all exit 0):

- test-panel-contract-rulings.js — 9/9
- test-telemetry-check-recorder.js — 8/8
- test-fightopen-census-20261025.js — 15/15
- test-balance-scorecard.js — 35/35
- test-measurement-comparison.js — 14/14

`node scripts/check.js --quick` — NOT completed: still running with zero
output after ~7 minutes, killed (SIGTERM) rather than stall the run. The
required verification for this arm (proof-update test + the five
observer-neutrality tests, all green above) is unaffected; the quick check
is supplementary hygiene. The coordinator may re-run it at merge time.
Notably the change touches only scripts/balance-proof.json + evidence, so
no game behavior is in scope for the quick list.

## 4. Fresh-panel observation (instrument reading, not a verdict)

Seed-7 rows at 150d: capable won=1, entered=1, national=1 (90 days);
risk-aware won=0, national=0 (95d); socialite won=0, national=0 (122d);
winseek won=0, national=0 (90d). One seed is not a balance claim — the
capable win on seed 7 is noted only because the panel is the instrument
other runs will compare against; the winnability chain is judged by the
balanced panel, not by this maintenance proof.

## 5. Diff scope verification

Diff is scripts/ + evidence/ only:

- `scripts/balance-proof.json` — re-pointed at the fresh panel (2 lines)
- `evidence/2026-11-07/neutral-proofrefresh-a.json.gz` — fresh neutral panel
- `evidence/2026-11-07/sim-proofrefresh-a.md` — this file

Zero src/js, zero src/data, zero docs changes to game content. No proof
hashes were hand-edited — the pointer was rewritten only by
`scripts/balance-proof-update.js` after it validated the real panel.

## Metric review

The pre-registered metric (proof-update test green) was the right one: it
failed exactly on the documented staleness and passed only after a real
re-observation. No re-scoring. The single-seed spec is a known thinness of
the maintenance proof (it proves the observer is neutral, not that the
game is balanced) — that is by design; balance claims use 16-seed panels.

## Verdict

**GO — proof refreshed, ready to merge.** Branch rebased onto current
master SHA `41007b9d4`, merged locally pending ship by the coordinator.
