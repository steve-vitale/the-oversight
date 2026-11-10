# journey-scale r127 — PRE-REGISTER (lane A, leg 3 SCALE, scholar-counts ladder-band proof)

**Run id:** laneA-20261110T1045CST (scheduled 10:45 CST 2026-11-10).
**Run:** `2026-11-10T16:46:43Z-playtest-loop-a` · worktree `journey-scale`.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master AFTER the sim-scholarcount-a landing (tip `fe45ff679`;
includes the scholar-counts fix + the r125 deepening fix).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands.**
**DELIVER OVER MEASURE (2026-11-01):** this run PROVES the landed
scholar-counts fix on the ladder band (before/after on identical seeds);
it does not re-prove a proven constraint and does NOT build a second fix
on the same band. If a defect is found, it is filed for a build run,
not fixed mid-band.

## Standing context (read before scoring)

- **r125/r126 scale (band 97901–97904, Arm A WITH wideduty):** 488 lived
  days, 0/4 alive at d140, 73 deaths, 56 cures; ladder stage 3 on 4/4
  (d29–d39), lesser seat priced 4/4 (d36–d46), full seat 0/4, rank stayed
  regional, national never fired; deaths ~93% field-fight. Wave-4 kills:
  97901: 0; 97902: 3 (2 scholar, 1 villager — the villager still living,
  the band's one living veteran); 97903: 2 (both scholar); 97904: 3.
- **sim-scholarcount-a (landed this run, adoption):** Steve RULED
  2026-11-10 that the scholar counts toward the living-veteran bar.
  `_ladderLivingVeterans` counts the living scholar (mirrors
  `standing.js`); readiness carries additive `payable`; delivery still
  pays 2 non-scholar veterans and refuses honestly with scholar+1. Its
  own band (140201–140208) went GO (peak≥1 8/8, scholar-veteran days
  97, guard + cost bar held) with NO new ready window — the binding
  constraint there was two killers alive at once, not who counts.
  This run asks whether the ladder band is different: 97902 is the
  candidate flip (scholar + living villager).
- **Carried, NOT this run's to build:** Baraka unvoiced raise ×6 in 7
  days (97902 d10–d16, French-only speaker); Stella's trap-line
  invitation swallowed by the raise-answer template (97904 d24);
  guest deaths in the village's fallen (Bing — needs its own prereg);
  the survival-collapse cause (combat side, still open); the
  scholar-payment open item (steve-call: what the scholar pays, if
  anything, when the pair is scholar+1).
- **Telemetry baseline `scale.json`** is a 646-day-regime aggregate
  (446/289/646) — the 488-day ladder band reads LOUD against it by
  regime mismatch (r126, EXPLAINED, not rolled). Expect the same.

## The band (fix proof on identical seeds)

- **Driver:** `scripts/journey-scale-r127-20261110.js` (r126 driver
  cloned, labels/EVIDIR only) + the scholarcount instrument
  (`scripts/scholarcount-a-driver.js`, required not copied: per-day
  `livingVeterans` / `livingVeteransLegacy` / `payable` + kill-time
  sampling) + r125/r126 instruments (ladder, traderoad, deathcensus).
- **Seeds: MATCHED PANEL 97901–97904** — the r112/r113/r122/r123/r125/
  r126 ladder band. **NOT a fresh band.**
- **Seed-band reuse release:** this prereg's matched-panel statement —
  the band is reused as the before/after panel for the landed
  scholar-counts fix, compared against r123/r126's published Arm A
  (WITH wideduty), following r125's and r126's identical reuse and the
  DELIVER OVER MEASURE rule (before/after on identical seeds). This is
  a matched-panel reuse, not a fresh-band claim. (Freshness per the
  local_seed_band_freshness skill was established by r126: the band
  appears only in the ladder-band preregs/run notes listed there.)
- **Horizon:** DAYCAP=180 loop-days, death-aware stop (leg window
  d80–140, +10d tail max on a dead village — MEASUREMENT.md §10).
- **Pilot:** seed 97902 first (the predicted flip seed — the pair must
  stand there). Pilot gates: crash, census errors > 0, 0 census rows,
  reconciliation residual != 0, teleOnly > 0, or 0 studies by d60 →
  STOP and diagnose (INCOMPLETE, not a verdict).

## Questions (binding)

- **Q1 TRIBUTE FLIP (primary):** on the matched ladder band, does the
  scholar-counts fix make `military_tribute` read ready on any seed
  where the legacy (payable) bar does not? **GO: ≥1 seed ever-ready
  NEW with legacy not-ready, the pair standing simultaneously (both
  living on the ready day).** Predicted: 97902 flips (scholar + living
  villager). If no seed flips, Q1 is NO-GO as written — report it,
  do not re-score. (Delivery is NOT part of Q1: delivery still needs
  2 payable veterans, so a flipped seed still refuses delivery
  honestly — record the refusal, do not count it against the flip.)
- **Q2 TRAJECTORY IDENTITY (guardrail, part of the verdict):** band
  lived days = 488, deaths = 73, cures = 56, end days
  [103,121,131,133] — bit-identical to Arm A. The fix is a pure read
  for sim trajectories (the driver's delivery verb only attempts a
  delivery at National with a ready capstone, and a refused delivery
  is a no-op — no Arm A seed delivered, and no r127 seed can deliver
  the tribute without 2 payable veterans). Any divergence
  stops the run for investigation — do not re-score.
- **Q3 MECHANISM:** cures / fever deaths / wound deaths / field-fight
  deaths vs Arm A (56/1/1/68); veteran-days counted new vs legacy per
  seed; ready-days pooled new vs legacy; deliverable-pair windows
  (legacy ≥2).
- **Q4 PEOPLE CHECK:** read the band's d90/d120 transcripts in full
  (r125/r126 Q4 protocol); senseless count 0 for clean. Note whether
  the two carried defects (Baraka unvoiced raise, Stella trap-line)
  still fire — carried, not this run's to build.
- **Q5 CENSUS:** plain-words village assessment per seed; ladder
  stage, lesser seat, national, full seat; books close on all four
  seeds; unattributed 0.

## Telemetry + checks

- `telemetry-check.js` vs `scale.json` baseline, metrics
  fightsTotal, fightsByWave.4, maxGameDay (same as r125/r126). LOUD
  lines are same-run investigation items (expect the regime-mismatch
  LOUD; EXPLAINED, baseline NOT rolled forward).
- `node scripts/check.js --quick` only if this run touches src/js
  (it should not — proof run on the landed fix). `node scripts/check.js`
  (full) before merge if any src/js changes land.

## Metric review

(To fill at closeout — metrics held, or the revision proposed for the
next run. A miss is a miss; never re-score.)
