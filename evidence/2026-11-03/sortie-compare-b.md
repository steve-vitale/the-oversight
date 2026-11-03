# Sortie pilot comparison — Loop A 20261103T0316Z, run sim-sortie-b (salvage of sim-sortie-a)

Prereg: `scripts/sortie-prereg-20261103.md` (committed before any judged sim,
commit e0f0d8e8). Driver: `scripts/sortie-driver-20261103.js`.
Per-seed JSONs: `evidence/2026-11-03/perseed-sortie-a/s-{baseline,variant}-s<seed>-spilot.json`.
Say transcripts: `/tmp/sortie-says-{baseline,variant}-s<seed>-spilot.json` (not in repo).

Arms: baseline = closecommit stack (leadfeast + windefer + seatdrive +
fullseat-diag + titanroute + musterclose + mustergap), mode herald, 180d
death-aware cap. Variant = baseline + `scripts/policies/sortie.js`
(`withSortie`), POLICY-SIDE ONLY. Env: FEASTSCALE_R13=1 TRIBFLOOR=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1. Seeds 98401–98408,
identical across arms. Anchor: branch sim-sortie-b (post e0f0d8e8).

NOTE on baseline offer counts: baseline shows offers=0 structurally — the
offer counter lives in the sortie policy layer, which the baseline does not
carry. Baseline 0 does NOT mean "no offers arrived"; variant offer counts
are the availability measure (offers arrived on 4 of 8 seeds).

## Per-seed table

| seed | base w4 fought | var w4 fought | base >=1 | var >=1 | var offers | var attempts | var attempt outcomes | base deaths | var deaths | base starv | var starv | base days | var days |
|------|---------------|---------------|----------|---------|------------|--------------|----------------------|-------------|------------|------------|-----------|-----------|----------|
| 98401 | 4 (reunion, suburb, eater, algorithm) | 3 (reunion, influencer, herald) | 1 | 1 | 17 | 17 | 7 ok, 3 no-fighters, 7 none | 30 | 36 | 0 | 0 | 90 | 90 |
| 98402 | 1 (strike) | 3 (strike, reunion, eulogy) | 1 | 1 | 17 | 7 | 4 ok, 1 no-fighters, 2 none | 41 | 44 | 0 | 0 | 90 | 90 |
| 98403 | 0 | 0 | 0 | 0 | 0 | 0 | — | 46 | 46 | 0 | 0 | 91 | 91 |
| 98404 | 2 (audit, herald) | 2 (audit, herald) | 1 | 1 | 0 | 0 | — | 38 | 38 | 0 | 0 | 90 | 90 |
| 98405 | 2 (reunion, algorithm) | 2 (strike, reunion) | 1 | 1 | 21 | 21 | 5 ok, 1 no-fighters, 15 none | 45 | 43 | 1 | 0 | 91 | 90 |
| 98406 | 0 | 0 | 0 | 0 | 9 | 2 | 0 ok, 2 no-fighters | 58 | 58 | 0 | 0 | 97 | 97 |
| 98407 | 0 | 0 | 0 | 0 | 0 | 0 | — | 53 | 53 | 0 | 0 | 90 | 90 |
| 98408 | 1 (eulogy) | 1 (eulogy) | 1 | 1 | 0 | 0 | — | 59 | 59 | 0 | 0 | 90 | 90 |
| TOTAL | 10 kinds | 11 kinds | 5 | 5 | 64 | 47 | 16 ok, 7 no-fighters, 24 none | 370 | 377 | 1 | 0 | median 90 | median 90 |

Seeds with zero offers in the variant (98403, 98404, 98407, 98408) have
byte-identical trajectories to baseline (same deaths, same days, same w4
list) — the control that the layer is inert without an announced offer.

## Judged verdict (prereg §GO, binding)

- (a) Seeds with >=1 wave-4 fought: variant 5 − baseline 5 = **0** (GO needs >= +2). FAIL.
- (b) Cost bar, all three legs:
  1. Total starvation deaths: variant 0 <= baseline 1 + 2. PASS.
  2. Sortie-attempt-day deaths (variant, attempt records joined to the death
     stream by game day): 12 + 5 + 0 + 0 + 9 + 1 + 0 + 0 = **27** (GO needs
     <= 2). FAIL.
  3. Median survival: variant 90d >= 0.8 × baseline 90d. PASS.
- **Verdict: KILLED.** Leg (a) fails and leg (b2) fails. No re-scoring:
  total wave-4 kinds (+1, 10 → 11) and the 98402 gain (1 → 3 kinds) are
  descriptive only, not the judged quantity.

## Wall numbers (pilot, both arms identical except where noted)

- National reach: 1/8 both (seed 98402 only, rank global; other 7 regional).
- Table: tableDone 8/8 both, tableWaiting 0/8, won flag 8/8 both.
- Wave 4 unlock: 6/8 both (98403, 98406 never unlock wave 4; unlock days
  30–84 where unlocked). Wave 5 unlock: 0/8 both; wave-5 fought: 0/8 both.
- Median survival (game days at run end): 90d both; max 97d both. Every run
  ended by win (endReason over-other, ~day 90), so the 180d cap never bound
  and "survival" here reads as days-to-win, not days-to-death.

## Death-cause shares (pilot totals, properly summed)

- Baseline (370 deaths): villager combat 208 (56%), combat 81 (22%),
  the wild 35 (9%), expedition 19 (5%), monster 12 (3%), starvation 1,
  remainder single digits (ambush, stranger, arena, alien, named monsters).
- Variant (377 deaths): villager combat 207 (55%), combat 79 (21%),
  the wild 37 (10%), expedition 19 (5%), monster 13 (3%),
  sortie combat 4 (1%), thirst 2, starvation 0.
- Note the gap between the two sortie-death lenses: deaths actually
  carrying cause "sortie combat" total 4, while the prereg's day-join
  counts 27 (every death on a sortie-attempt day, any cause). The
  verdict uses the prereg's day-join definition; see metric review in
  `sim-sortie-b.md`.
