# SIM-CRUMBDEFAULT — no-fractionating DEFAULT on the granular substrate (loop B, food-economy)

Date: 2026-10-16 · Loop: oversight-flesh-out-loop-b (ARM sim-crumbdefault-b) · Worker tree: sim-crumbdefault-b
Axis: food-economy (scale-wall lens).
Run: fleshout-loop-b-20261016T1435Z died pre-landing (stale-lock recovery by fleshout-loop-b-20261016T1722Z; coordinator verified proofs + adjudication independently, reverted the layer per the header, landing instruments + evidence only).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding, written BEFORE sims)

- **Question**: Steve's 2026-10-16 redirect — the #121 crumb fix (Steve 2026-10-14 ruling: hungry villagers take the full piece, no fractionating) as DEFAULT behavior on the granular substrate. Root cause closed by 0152a2ce: depositPantryPieces splits all deposits to <=500-kcal pieces, so a whole-piece take is bounded by piece size — the marginal-pantry cost mode that killed sim-crumbs-b (0955Z) should be bounded by construction. Re-run queued with the fix as default (no gate).
- **Lever**: src/js/game.js, two regions ONLY, no gate:
  (a) pantryDraw floor1 path: removed the stoppedForCrumbs refusal — a still-hungry villager takes the next indivisible piece whole (units=1), whether or not anything was drawn yet.
  (b) villagerMealDay takeHist call site: records min(pile.taken, dayWant) instead of pile.taken — the ruling-sanctioned overshoot is legitimate eating, not theft, and must not feed the freeloader clock. v.takes (cumulative gross) UNCHANGED.
- **PRIMARY**: absolute starvedDays armed <= control (strict).
- **COVERAGE**: control stoppedRefusals >= 20 AND control crumbs-left starvedDays >= 2; else verdict = no-coverage diagnostic → KILL as invisible.
- **HETEROGENEITY**: max per-seed (armed-control) starvedDays <= +2.
- **GUARDRAILS**: national >= control-2 (of 16); medianDays >= control-10; no new death mode (n>=3); freeloader stage>=2 counts armed <= control.
- **Verdict**: GO only if primary + coverage + heterogeneity + all guardrails.
- **Horizon**: 180d death-aware. **Seeds**: 8 FRESH seeds [3101–3108] x {leadcourt,belongseek} x {control,armed} = 32 runs, identical seeds both sides. Substrate: pre-seat courtship (SEATDRIVE=0 explicit), FEASTSCALE_R13=1.
- **Det-gate**: bit-identical reruns both sides before trusting comparisons; SMOKE honesty gate.

## Proof results (independently re-verified by the recovery coordinator via the patch dance)

scripts/test-crumbdefault-20261016.js — new-substrate fixtures (pieces <= 500 kcal, the honest pantry shape after 0152a2ce):

- RED (pristine): R1 draw want=1218 taken=1000, 218 need unmet, 1,000 fresh left, shortOfFresh=false — hungry with food in the pantry, refused. R2 takeHist records the full 500 on a 400 want (the freeloader-clock hazard). R3 crumb path drawn=1500 (refusal), takeHist=1500.
- GREEN (fix): G1 taken=1500, overshoot=282 <= piece size 500, need covered. G2 !drewAny case unchanged. G3 takeHist capped at want (400), overshoot exempted. G4 takeHist=1718 on drawn=2000. G5 v.takes gross STILL records the full draw. G6 shortOfFresh honesty (truly-empty -> true; crumbs-left shape -> false).
- DET-GATE: D1/D2 fixture byte-identical (mechanism disengaged); D3 2 seeds x 2 policies x 40d — pristine 0 firings, armed 18–26 crumb-takes per 40d (mechanism engaged, divergence expected only there).
- DETCMP: ALL GREEN. SMOKE: ALL GREEN.

## Sweep results (32 runs, identical seeds, det-gate green both sides)

| metric | control | armed | pre-reg |
|---|---|---|---|
| starvedDays (**PRIMARY**, absolute) | 37 | 41 | **NO-GO** (need <= 37) |
| stoppedRefusals / crumbTakes (**COVERAGE**) | 1439 refusals | 1289 whole-piece takes | refusals GO (>=20); crumbs-left starvedDays 0 **NO-GO** (need >=2) |
| max per-seed delta (**HETEROGENEITY**) | — | +7 (leadcourt-s3104: 1→8) | **NO-GO** (need <=+2) |
| national | 14/16 | 13/16 | GO (>=12) |
| median survival | 180d | 171d | GO (>=170) |
| new death mode | — | dehydration 3 vs 0 | **NO-GO** (n>=3 bar) |
| freeloadStage2 | 1 | 0 | GO (<=1) |
| hungryDays | 20 | 36 | — |
| table / wins | 0 / 0 both | — | (pre-seat by design) |
| wave-4 max reach | 6/16 | 8/16 | — (not pre-registered) |

Starvation paths — control: away-pack-short 5, spoiled-insufficient 4, away-pack-empty 11, empty-pantry 17, crumbs-left **0**. Armed: spoiled-insufficient 5, empty-pantry **23**, away-pack-short 8, away-pack-empty 5, crumbs-left 0.

**Verdict: NO-COVERAGE diagnostic — KILL as invisible per the pre-registered header.** Layer deleted zero-trace (game.js reverted byte-identical to HEAD); proof + sweep + analyzer + sense scripts + this evidence kept as instruments.

### Mechanism autopsy — read this before citing the lever

The behavior change is REAL and LARGE: 1,439 control refusals became 1,289 whole-piece takes across 32 runs. But on this substrate the crumbs-left path NEVER starves anyone (0 on control across 16 runs) — starvation flows through the empty-pantry channel (17 control → 23 armed) and away-pack channels. The armed side's empty-pantry starvation ROSE 17→23: the marginal-pantry cost mode from sim-crumbs-b (0955Z) REPRODUCES on the granular substrate — whole-piece takes drain marginal pantries, converting one villager's crumbs-left starvation into pantry depletion that starves others (leadcourt-s3104 +7: 1→8). The 500-kcal piece bound did not fix it; the pieces are indivisible draws against shared stock. Dehydration tripped the new-death-mode bar at exactly n=3 vs 0 (noise-floor; not a mode, noted). National/median/freeload guardrails held.

## Metric review (§14)

The coverage metric was honest — the lever engages heavily but on the starvation path that matters (empty-pantry), which it feeds rather than starves. No re-scoring: the header binds. For the NEXT run, the candidate is the 0955Z guarded-variant spec (whole-piece take only above a pantry floor — still a steve-call candidate), not a broader seed set: more seeds would not fix a coverage miss (0/16 control crumbs-left starvedDays is already decisive). Proposed metric revision: classify refusal-adjacent starvation, or pre-register the empty-pantry channel as the primary — the current primary is right; the lever is wrong.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 14/16 | 0/16 | 0/16 | 6/16 | — | 180d | 180d |
| armed | 13/16 | 0/16 | 0/16 | 8/16 | — | 171d | 180d |

Exiled: 1 control / 0 armed. Courtship substrate — scale numbers are wall-baseline-shaped; the arm moved nothing on the wall.

## Death-cause shares

control: combat 184, villager combat 150, monster 77, expedition 19, sickness 22, thirst 2, starvation 11, a wound that wouldn't close 8, the phoenix link 5, contest 9, ambush 2, The Reunion 1, The Callback 1, the night 1.
armed: combat 240, villager combat 139, monster 82, expedition 16, sickness 7, contest 11, ambush 8, starvation 6, a wound that wouldn't close 8, dehydration 3, thirst 2, the phoenix link 3, the expedition 2, the night 2, Nostalgia 1, Ugly-Eyes 1, Choir Toad 1, alien 1.
Violence-dominated collapses both sides; no starvation signal for the lever beyond the cost-mode mechanism.

## Village assessment (plain words)

Thirty-two villages. The armed ones eat the last cut on the shelf — the behavior Steve ruled for is now the default: Nino draws three 500-kcal cuts, still hungry for 218, takes the last cut whole; nobody writes the 282 in the ledger against him. It reads as people eating, not a policy executing. But the pantry pays: on the marginal-pantry seed leadcourt-s3104, the village that refused 218-kcal crumbs on control starved 8 villager-days on armed — the same food, taken earlier in bigger pieces, ran out sooner. The overshoot is bounded by piece size; the depletion is not. The fix is honest per-piece and wrong per-pantry — the guarded variant (whole-piece only above a floor) is the surviving hypothesis. Nine of sixteen seeds read 0→0 or small deltas; the harm concentrates on the marginal pantries, exactly where the 0955Z note warned.

## SENSE-TESTING verdict

Proof-phase sense beat (Nino, want 1218, 4x500 cuts) PASS — reads as a person, not a mechanic. The killed layer's narration is moot; the instruments stay for the guarded variant.
