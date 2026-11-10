# sim-medheadcount-confirm-a — PRE-REGISTRATION (binding)

Run: oversight-flesh-out-loop, run fleshout-20261109T2115Z (Loop A).
Axis: food-economy (converging, NOT converged). Backlog #1920 (claimed by
this run; claim hidden_files/lever-claims/fleshout-20261109T2115Z.json).
Worker tree: ~/workspace/worktrees/sim-medheadcount-confirm-a, branch
sim-medheadcount-confirm-a. Base master: 30d95ed8c (tree base; patch base
was 8cee6a8d2 — the patch applies cleanly, verified with `git apply
--check`, no hand port needed). Policy: competent ONLY
(scripts/policies/competent.js, UNMODIFIED). Env: PLENTYDEPRI=1,
DEPOSITGATE=1. Horizon: 150d death-aware cap. Seeds: 96009–96024 (16,
confirm band — see freshness note below).

## Work order (from evidence/2026-11-09/sim-medheadcount-suite-a.md)

Complete the HELD medic-headcount lever (spawn guarantee for a medic):
apply the held game.js patch
(~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/medheadcount-a-gamejs.patch,
22 insertions / 5 deletions, forceOccIds mechanism + genRoster
guarantee); do the 3 assertion repairs + 7 seed refreshes briefed in
the suite file §Fixes (verify each of the 10 tests standalone); proof
test 7/7; full gate on a frozen tree; 16-seed confirm band before/after
judged on the G1/G2 bars below + G3 balanced panel.

Prior record: evidence/2026-11-08/sim-medheadcount-a.md (+ prereg
evidence/2026-11-08/sim-medheadcount-a-prereg.md) — pilot GO on G1/G2
(share 82.3% ≥ 70%, 0/8 zero-medic; median 130d; starvation 3),
G3 compare review_required / no regression_signal, G4 proof 7/7;
landing HELD on the gate (10 lever-attributed test failures, all
briefed with fixes in the suite file). The 82.3% pilot number must NOT
be leaned on until this confirm passes.

## Seed-band freshness (re-verified this run, per the seed-band skill)

Band 96009–96024, verified fresh 2026-11-09 ~15:40 CST in this tree:
- `grep -rhoE "\b960(0[9]|1[0-9]|2[0-4])\b"` over
  evidence/*/sim-*-prereg.md: exactly two hits — 96009 ×1 and 96024 ×1,
  both in evidence/2026-11-09/sim-wideduty-a-prereg.md, which names the
  band only to RESERVE it for this run ("96009–96024 was NOT reused —
  it is the medheadcount-suite arm's verified-fresh owed confirm band.
  The confirm band is recorded here so the next worker does not reuse
  it."). Wideduty's own confirm band is 96901–96912 (different).
- Same pattern over all of evidence/ (1359+ files): hits are corpus
  JSONs containing the numbers as data (e.g. seed 96107 in
  awayration2-b files — a different seed, word-boundary distinct), the
  suite file itself (which names the band), the wideduty prereg, and
  the sim-findings.md record-gap entry (which names the band as the
  owed confirm band). No other prereg, screen, or extension band
  claims any seed 96009–96024.
- docs/: zero hits. Goal hidden_files/: hits are the same record-gap
  entry, the wideduty reservation, and salvaged copies of unrelated
  corpora (numbers as data, not bands).
- Forbidden/contaminated-band lists: the preregs naming
  "forbidden"/"contaminat" (10 files, 2026-10-26/27) name no seed in
  96009–96024.
- CORRECTION to the suite file's §Confirm: it reported "96009–96024
  appears nowhere" — it appears in the wideduty prereg as a
  reservation FOR this confirm, not as a use. The band is fresh for
  this run; the reservation is honored, not a collision.

## Pilot-corpus recovery (record gap, sim-findings.md:1991)

The pilot corpora (evidence/2026-11-08/medheadcount-a-corpus/ +
-after/) were never committed and do not exist in this worktree or the
main tree. They survive as salvaged copies in the goal hidden_files:
hidden_files/evidence/2026-11-08/medheadcount-a/medheadcount-a-corpus/
and ...-corpus-after/. This run copies them into the worktree at the
same evidence paths (read-only restore of measured data, no
regeneration) and verifies the analyzer reproduces the quoted pilot
numbers (share 56.1%, zeroMedicSeeds 2/8, spawnSeedsWithMedic 4/8)
before relying on proof-test legs L4–L6. If the analyzer does NOT
reproduce them, the restore is rejected and the pilot numbers stay
unverifiable (reported, not re-based).

## Pre-registered header (judged bar — scaled from the 2026-11-08 prereg + suite §Confirm)

- PRIMARY (G1): medic-present village-days share ≥ 70% AND seeds with
  zero medic-days ≤ 2 of 16 (suite scaling of the 8-seed ≤1 bar).
- GUARDRAILS (G2): median survival ≥ 0.8× before-leg control;
  starvation deaths ≤ before + 4 (suite scaling of before+2); no new
  death-cause mode ≥ 2, judged by hand from the analyzer's
  deathCauses output on the MODE reading (adoption run's reading:
  collapse fight labels monster/arena/combat/wild/expedition/duel/
  raid into one 'fight' mode; flag any other cause present in after
  with count ≥2 that was absent in before). The analyzer wiring for
  this clause is owed (suite §Confirm); if it is wired in this run,
  the wiring itself is proven by the analyzer's own output on the
  pilot corpora first.
- PANEL (G3): §15 balanced panels before/after on the confirm
  corpora (scripts/balance-panel.js), compare attached; any
  regression_signal investigated, unexplained regression blocks GO.
  The pilot's seed-42 capable watch (village deaths 68.5 → 89.5 on
  one seed, expedition-led) carries to this panel read.
- PROOF (G4): scripts/test-medheadcount-a.js green (all 7 legs,
  L0–L6). L5 pins the pilot baseline (share 56.1%, zeroMedicSeeds
  2/8, spawnSeedsWithMedic 4/8); 8-seed instrument behavior stays
  byte-identical after the 16-seed generalization.
- SECONDARY (reported, not gated): wound_care / herbal_medicine
  lessons per run; triage holders who are not occupation-medics;
  medic joins by source; medic deaths; wall numbers (national /
  table / wins, wave reach 1–5, median survival).
- GO: G1 + G2 + G3 + G4 all pass. A miss is NO-GO, never re-scored.
  On NO-GO the lever is reverted from the tree before finishing and
  the evidence lands as record.
- HORIZON: 150d death-aware cap (same as the pilot; villages that
  die stop simulating). The horizon is the pilot's horizon so the
  confirm is a same-instrument re-measure on fresh seeds, not a new
  question.

## Confirm procedure (suite §Confirm, as briefed)

Generalize the instruments first (they hardcode the pilot band):
scripts/sweep-medheadcount-a.js main() FATALs unless SEEDS is exactly
96301–96308 and DAYS=150 — relax to any 8–16 seed list (keep the
96301–96308 default and DAYS=150). scripts/analyze-medheadcount-a.js
summarize() hardcodes seeds 96301–96308 and /8 denominators — accept
`--seeds <csv>` (default the pilot band) and derive denominators from
the seed count. Keep 8-seed behavior byte-identical.

Run (env PLENTYDEPRI=1 DEPOSITGATE=1, SEEDS=96009,…,96024, DAYS=150):
BASE (lever stashed) →
evidence/2026-11-09/medheadcount-confirm-before/ ; then the same with
medheadcount-confirm-after on the LEVERED tree. Then
`node scripts/analyze-medheadcount-a.js --before …-before --after
…-after --seeds 96009,…,96024`.

## Metric review (placeholder — filled at end of run)

- (to be filled)
