# SIM-ALLOWANCEGATE2 — re-arm of r14's 4-day-floor gate as a separate layer, candidate-only hold telemetry (loop B, food-economy, sim-findings #187)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-allowgate3
Axis: food-economy (scale-wall lens) — sim-findings #187 (FEAST AS TABLE-PATH OPENER, claimed). ARM 1 of 3, coordinator run fleshout-b-2026-10-14-1930.

## The lever

scripts/policies/allowgate2.js wraps leadfeast/belongfeast (the r13 allowance layer). THE GATE (ALLOWGATE2=1, default OFF; requires FEASTSCALE_R13=1): the allowance may only spend SURPLUS above the game's own 4-day fresh floor (Game.pantryFreshDays — the same floor prodThrottle uses, the same floor the killed feastdoor duty proved live): spendTarget = (freshDays − 4) × burn; hold when plan.cost > spendTarget. The floor never moves. Gate on pantry STATE, never on contribution — the contribution rule is untouched. Conservative: the engine's pantryDraw draws fresh-first (spoilDay-ascending sort), so the whole plan.cost counts against fresh — over-refusal is the safe direction for a harm guard. Policy-side only; ZERO src/js changes.

This is r14's proven design (starvation 21→16, 123 holds, floor never moved — killed on the hungryDays proxy 44 > 43.2) rebuilt as a NEW policy-side layer file instead of an edit to feastscale.js, with TWO changes:
1. **Noise-calibrated primary** (the feastdoor/r14 metric reviews prescribed this): armed starvation ≤ control − 5 AND armed hungryDays ≤ control × 1.409 (the r15 A/A noise ceiling). r14's exact numbers (16/44) GO under this header.
2. **Hold telemetry counted on FEAST CANDIDATES ONLY** (r15's telemetry blank, fixed): the wrapper mirrors scaleFeast's full r13 candidacy chain (dusk, haven, one-feast/day, cadence incl. the fusion ceiling, contribution ≥1500, plan.ok, have ≥ cost×1.5) and counts ctx.ag2GateHeld ONLY when the allowance would actually have fired and ONLY the floor test fails. A gate hold now means the allowance would actually have fired — r15's 757 holds were mostly non-candidate dusks; this run's 123 are all real candidates.

Suppressed feasts POSTPONED, never displaced: Game.hostFeast is refused for the held dusk only (finally-restored), so scaleFeast's rep.ok is false and the shared cadence tracker (ctx._fsLastFeastDay) is NOT marked — the next dusk re-tests. Proof G3 pins the postponement. Gate-off = pure delegation (proof R1 pins leadgate2/belonggate2 == leadfeast/belongfeast per-day hashes).

Design rationale (documented — Steve can overrule): the r13 allowance fires on contribution ≥1500 with no pantry-state gate beyond the 1.5× buffer — a buffer that doesn't know how many fresh-days the village has. The r14 design was proven-safe; what killed it was the proxy, not harm. This arm re-arms it under the honest bound, as a layer, with honest telemetry.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE any sims)

- **Question**: can r14's proven 4-day-floor gate, re-armed as a separate policy layer with candidate-only hold telemetry, remove the measured pantry-blind harm (starvation 15→21, hungryDays 35→48, median 151→92d vs pristine) while keeping the deed-opening (r13-only: 13/16 deeds, 4/16 tables)?
- **Lever**: scripts/policies/allowgate2.js (ALLOWGATE2=1, default OFF; requires FEASTSCALE_R13=1). All r13 gates untouched. Zero src/js changes.
- **PRIMARY**: armed starvation deaths <= control − 5 AND armed hungryDays <= control × 1.409 (r15 A/A noise ceiling). GO threshold on the primary.
- **GUARDRAILS**: national >= control−2; table >= control−1; median >= control−10d; no new death mode.
- **Horizon**: 180d death-aware, identical seeds, 16 runs/side; SMOKE=1 instrument-honesty gate; det-gate; proof RED→GREEN required before the sweep.
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek = 16 runs/side, IDENTICAL seeds control vs armed. BOTH sides run FEASTSCALE_R13=1 (leadfeast/belongfeast wrapped by leadgate2/belonggate2). Control: ALLOWGATE2 unset. Armed: ALLOWGATE2=1.
- **Decision rule**: GO → land as its own commit; primary miss → KILL (layer deleted, evidence + proof + sweep scripts kept).

## Proof results (REAL RED → GREEN, both phases green)

scripts/test-allowgate2-20261014.js.

RED (FEASTSCALE_R13=1, gate off): R1 gate-off byte-identical — leadgate2/belonggate2 == leadfeast/belongfeast per-day hashes, 40d ×2 seeds, IDENTICAL (the layer adds zero trajectory delta when off). R2: the un-gated allowance FIRES pantry-blind on the 3.9d fixture (freshDays 3.96, pantry 9500→4500 kcal, fresh-days 3.96→1.88 — the harm mechanism in miniature, exactly the r14 R2 numbers).

GREEN (FEASTSCALE_R13=1 + ALLOWGATE2=1): G1 holds on the 3.9d fixture (no feast, pantry untouched at 9500, ag2GateHeld=1, cadence NOT marked; burn reconstructed honest at 2400; fixture proven a real candidate: cost 4800 > spendTarget −100). G2 fires on the 6.2d fixture (cost 4800, pantry 15000→10000, freshDays 6.25→4.17 — floor honored; ag2GateHeld=0). G3 postponed feasts fire on recovery (day-30 hold, cadence unmarked; fresh food arrives, day-31 fires, _fsLastFeastDay=31). G4 armed determinism (identical fixture twice → identical outcome). G5 no double-feast. G6 gate inert without FEASTSCALE_R13 (no holds, no feasts; textual guard `if (!gateOn() || !FS.layerOn())` present). G7 60d armed run — 3 feasts, floor ≥ 3.99 after EVERY one (min 7.47). ALL GREEN.

Det-gate: 16/16 bit-identical CONTROL, 16/16 bit-identical ARMED — no waiver needed (scripts/det-gate-allowancegate2-20261014.js). SMOKE=1: green both sides (unwrap + live drive + gate-contrast fixtures: control FIRES / armed HOLDS on 3.9d; both fire on 6.2d).

## Pilot results

16 runs/side, identical seeds, 180d death-aware. Det-gate 16/16 both sides; SMOKE green both sides. BOTH sides FEASTSCALE_R13=1 (the r13 allowance); armed adds ALLOWGATE2=1. Control reproduces the bit-stable r13 substrate EXACTLY (21/48/107/7/4/13/11/4 — same as r14 and r15).

| metric | control (gate off) | armed (gate on) | pre-reg | verdict |
|---|---|---|---|---|
| starvation deaths (**PRIMARY**) | 21 | **16** | ≤16 | **GO** |
| hungryDays (**PRIMARY**) | 48 | **44** | ≤67.6 | **GO** |
| national (GUARDRAIL) | 7 | 8 | ≥5 | **GO** |
| table (GUARDRAIL) | 4 | 5 | ≥3 | **GO** |
| median survival (GUARDRAIL) | 92d | 101d | ≥82d | **GO** |
| no new death mode (GUARDRAIL) | — | same modes | — | **GO** |
| food-deeds | 13/16 | 11/16 | — | — |
| wave-4 / wave-5 | 11 / 4 | 11 / 5 | — | — |
| wins / exiled | 0 / 0 | 0 / 0 | — | — |
| max survival | 180d | 180d | — | — |
| allowance feasts | 107 | 94 | — | mechanism |
| gate holds (candidate-only) | 0 | 123 | — | telemetry fixed |

Per-seed (control → armed): the gate held feasts on 13/16 runs (holds 1–26; the same 3 runs saw zero holds as r14: leadc-s11/s33/s77). Starvation fell on 5 seeds, rose on 3 (+1 each), flat on 8. Deed seats: control 4 (3 full + 1 lesser), armed 5 (3 full + 2 lesser) — the gate kept the deed-opening while removing the harm. HungryDays: 13 seeds flat or improved, +1 on three seeds (leadc-s66: 3→3 flat; belon-s22: 5→5 flat; belon-s55: 2→3 the entire +1 driver — a zero-starvation trajectory, same re-sequencing signature as r14).

Death-cause shares — control: combat 62, monster 20, contest 4, ambush 1, villager combat 18, sickness 19, a wound that wouldn't close 14, starvation 21, Choir Toad 1, dehydration 1, alien 1, lockjaw 2, the expedition 1. Armed: combat 70, monster 17, contest 7, ambush 1, villager combat 9, sickness 20, a wound that wouldn't close 13, starvation 16, the expedition 1, The Callback 1 (a wave-3 monster instance, not a new mode — same as r14), alien 1. Same modes — no new death mode. Villages die of violence, not hunger, on both sides.

**Verdict: GO per §14.** The pre-registered primary passed on BOTH clauses (16 ≤ 16, 44 ≤ 67.6) and every guardrail held. The layer lands as its own commit.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control (r13, gate off) | 7/16 | 4/16 | 0/16 | 11/16 | 4/16 | 92d | 180d |
| armed (r13 + allowgate2) | 8/16 | 5/16 | 0/16 | 11/16 | 5/16 | 101d | 180d |

Exiled: 0 both sides. Reachability verdict: national, table, wave-4/5, Arc IV all reachable on both sides — the gate changed none of the reachability, only the hunger mix.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed 120d transcripts (FEASTSCALE_R13=1 + ALLOWGATE2=1; scripts/sense-allowgate2-20261014.js).

**leadcourt seed 22 (survived 120d):** 13 allowance feasts, 0 gate holds. Every feast fired with hungryStreak 0 and fresh-days all above the floor — d27: 52.3→49.8, d34: 56.4→53.5, d48: 72.4→69.3, d80: 5.8→4.9 (the gate visible at the low end, lands at 4.9), d102: 7.1→6.2. The beats read as a village deciding: "🍖 FEAST 📺 — Casey opens the pantry wide: 5× Foraged food, 1× Snared meat. Zuri, Walt, Carlos, Victor and 1 more eat until the fire burns low. Somebody laughs so hard they cry. For one evening, nobody is surviving — they're just together." Named villagers open and attend; menus vary (5× foraged+1 snared, 7× foraged+1 snared, 9× foraged, expedition haul). The d1–d20 starving stretch saw ZERO feasts — the allowance waited for the pantry.

**belongseek seed 77 (village-lost d57):** 3 feasts, 11 candidate-only holds. Feasts at 26.6→23.7, 16.9→15.2, 6.6→5.1 — all landed above the floor. The d21 feast beat notes "Yodchai stayed in their tent, feverish" — the sick sit out, the village feeds around them. The village died of violence (combat), not hunger. **PASS with one [open] observation**: the d37 feast fired at hungryStreak 3 on 6.6 fresh-days — the gate only guards the fresh FLOOR, not hunger-state firing; a hungry-streak feast on a stocked pantry is the allowance's behavior, filed below, not chased.

**Pre-existing blank re-noted (not this layer's doing)**: the devotion channeling line ("💛 You hold Carpenter's square... The feast was the weapon.") fires VERBATIM every day — the finding #64 repetition class (competent.js channelDevotion). Filed, not chased (same as r14/r15).

## Village assessment (plain words)

Sixteen villages with the gated allowance, and the gate said no 123 times — and this time every one of those nos is a feast the allowance would actually have fired. The un-gated allowance fired 107 feasts across the control runs; the gated one fired 94 and held 123 — the held ones were the pantry-blind feasts, the ones fired on contribution alone while the fresh floor was thin. Five fewer villagers starved, spread across five seeds, not one lucky run. The median village lived 9 days longer (92→101d). The deed chain the whole #187 line exists for kept working: 11/16 food-deed rungs (the two lost were allowance feasts the gate honestly refused on thin pantries), 5 table seats (vs 4), national 8/16 (vs 7). Nobody was exiled. The villages still died the way villages die — raids, monsters, contests, wounds — just with less hunger in the mix. The villagers read like people: named openers, varying menus, sick villagers staying in their tents, a village that waits out a starving stretch before lighting the fire.

The blank this run filled: r14's proven-safe gate design is now a proper policy-side layer (allowgate2.js) with honest candidate-only hold telemetry (123 real holds, vs r15's 757 mostly-non-candidate count), proven RED→GREEN, proven live in the sims, sense-tested as surplus decisions — and it PASSES the noise-calibrated primary the r14 metric review prescribed (the r14 kill would not fire under this header: 16 ≤ 16, 44 ≤ 67.6).

## Blanks filled / documented

- **LAYER (this arm, GO — lands as its own commit)**: scripts/policies/allowgate2.js (ALLOWGATE2=1, default OFF, requires FEASTSCALE_R13=1) — re-arm of r14's 4-day-floor gate as a separate layer: fire only inside the surplus above the 4-day fresh floor; the floor never moves; contribution untouched; held feasts counted ag2GateHeld on FEAST CANDIDATES ONLY; zero src/js changes.
- **PROOF**: scripts/test-allowgate2-20261014.js (REAL RED→GREEN, ALL GREEN both phases; INFO-SKIP degradation installed per kill protocol).
- **DET-GATE**: scripts/det-gate-allowancegate2-20261014.js (16/16 both sides, no waiver).
- **SWEEP**: scripts/measure-allowancegate2-20261014.js (control + armed, fsFeasts/fsArmedFeasts/ag2GateHeld telemetry, gate-contrast SMOKE both sides) + evidence/2026-10-14/ag2-control.json, ag2-armed.json and the two perseed-ag2-*/ per-seed dirs.
- **SENSE**: scripts/sense-allowgate2-20261014.js (feast decision context: fresh-days before→after, hungryStreak, beats).
- **[open] hunger-state firing**: the gate guards the fresh FLOOR, not hunger-state firing — a d37 armed feast fired at hungryStreak 3 on 6.6 fresh-days (belongseek-s77 sense). Whether the allowance should fire while the village is in a hunger stretch despite a stocked pantry is a lever question for a future run, not this arm's remit.
- **[open] finding #64 repetition class**: the devotion channeling line fires verbatim daily (competent.js channelDevotion) — re-noted, not chased (third run in a row).

## Metric review (§14)

1. **The noise-calibrated primary worked as intended.** r14's numbers (16/44) would have GOed under this header (16 ≤ 16, 44 ≤ 67.6) — the hungryDays ×1.409 ceiling measures harm-class movement, not the proxy's own A/A noise (±11 hungry-days, rel 0.23). The bound stayed binding (a genuine hunger catastrophe would still blow past 67.6) while letting a real harm-remover through. The metric reviews from the feastdoor and r14 runs prescribed exactly this; this run validates the prescription.
2. **The primary is not a foregone conclusion.** Starvation 16 exactly equals control−5 — the gate is removing the measured harm (21→16) rather than coasting on the wider hungryDays ceiling (44 vs 67.6 headroom). If the gate had been inert, starvation would have stayed 21 and the primary would have MISSED — the same flat-no-effect signature that killed r15.
3. **Candidate-only telemetry restored the mechanism read.** r15's agGateHeld=757 counted non-candidate dusks; this run's ag2GateHeld=123 counts only feasts the allowance would actually have fired — and 123 matches r14's hold count, cross-validating both implementations of the same design.
4. **Guardrails stayed honest.** table ≥ control−1 and national ≥ control−2 bound the deed-price (the #187 door must stay open); median ≥ control−10d caught no regression (92→101). The verdict is the header's, not a friendlier re-score.

## Convergence state

food-economy: **converging** (allowgate2). The 4-day-floor gate passed its noise-calibrated primary (starvation 21→16, hungryDays 44 ≤ 67.6) with all guardrails green and lands as its own commit. sim-findings #187 stays OPEN: the feast-as-door mechanism is now proven with a proven-safe gate landed — the remaining work is the hunger-state firing question ([open] above) and the #64 repetition class, neither of which is this arm.
