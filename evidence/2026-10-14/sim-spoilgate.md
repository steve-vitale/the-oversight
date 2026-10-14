# sim-spoilgate — policy pantry spoilage gate (finding #89)

Loop B, food-economy axis. Claim: `hidden_files/lever-claims/fleshout-b-2026-10-14T02-30-00Z.json`.
**VERDICT: KILLED AT PILOT** — baseline shows 0 spoiled pantry takes on all 16 identical-seed runs (23,168 pantry takes instrumented). The lever has nothing to bite. Killed per the pre-registered kill condition, on the measurement alone, honest. No armed side run (proves nothing when baseline is 0). Gate reverted from competent.js — no trace; scripts + this evidence survive as instruments.

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Finding**: sim-findings #89 — "Policy pantry loop eats spoiled food without checking: competentEat/mbEat score pantry items by foodState only, never spoilage" (leadcourt+mb s22 transcript, evidence/2026-10-14/sim-mantlebeat.md). mbEat no longer exists — the mantlebeat policy file was removed per kill protocol (commit 92f41eff); the live base paths are competentEat (all competent-family policies: competent, leadcourt, belongseek, winseek-derived) and seekerEat (seeker only).
- **Lever**: SPOILGATE=1 opt-in policy layer (default OFF, same pattern as COMPETENT_KITCHEN=1), in competentEat (scripts/policies/competent.js): skip spoiled pantry stacks entirely; if only spoiled food remains, the scholar goes hungry honestly with one legible beat per day ("You leave the off <name>. They'd cost you more than they'd feed."). seekerEat deliberately NOT gated (its design is risk-seeking on quirk meat — a steve-call to change).
- **Primary metric**: scholar spoiled pantry takes per run (instrumented at Game.takeFromPantry: pantry item spoiled at take time).
- **GO**: armed total == 0 AND baseline total > 0 on identical seeds.
- **Guardrail**: scholar mean kcal-as-fraction-of-cap within ±10% relative of baseline; starveDays (any villager hunger>70 at daily hook) within ±10% relative of baseline mean.
- **Horizon**: 180d death-aware. **Seeds**: 11/22/33/44/55/66/77/88 × (leadcourt, belongseek) = 16 runs, identical seeds before/after. One shared baseline.
- **Kill**: GO missed, guardrail regressed, or baseline shows 0 spoiled takes (lever has nothing to bite — kill on the measurement alone, honest).

## Canon

- docs/PRESERVATION.md: "Rot can't be smoked back into food." + the spoilage boundary (isSpoiled: spoilDay <= day).
- No-silent-actions rule + knowledge-gating: a scholar silently eating spoiled food violates both. The honest beat satisfies both.
- The village sweeps spoiled pantry stores at dawn (food.js sweepSpoiled) — this turned out to be the structural reason the lever has nothing to bite (see metric review).

## Mechanism proof (scripts/test-spoilgate-20261014.js) — 11/11 GREEN

REAL RED on gate-off behavior (= pristine, byte-identical): pantry = spoiled cooked meat (score 10) + fresh raw plant (score 2). Base took the spoiled stack **5 times** (every unit) before touching fresh food, each take discarded by eat() with a "Spoiled and discarded" note — wasted takes with trust notices, zero kcal from the spoiled units. GREEN (SPOILGATE=1): 0 spoiled takes; the honest beat fired ("You leave the off Old venison. They'd cost you more than they'd feed."); scholar still ate the fresh option (300 kcal); spoiled-only pantry → 0 takes, beat fired, scholar went hungry (kcal 0) — honest. Gate-off control: no beat even with a spoiled-only pantry (opt-in truly off). The mechanism is REAL when a spoiled stack is reachable — it just never is in honest sims (see below).

## Before/after measurement (scripts/measure-spoilgate-20261014.js)

**Baseline side only (16 runs, gate off = pristine). Armed side not run — pre-registered kill.**

| policy | seed | days | end | spoiledTakes | pantryTakes | kcalFrac | starveD | wave | nat |
|---|---|---|---|---|---|---|---|---|---|
| leadcourt | 11 | 41 | village-lost | 0 | 1056 | 0.799 | 18 | 2 | 0 |
| leadcourt | 22 | 45 | village-lost | 0 | 1452 | 0.832 | 11 | 2 | 0 |
| leadcourt | 33 | 39 | village-lost | 0 | 1137 | 0.803 | 15 | 2 | 0 |
| leadcourt | 44 | 98 | village-lost | 0 | 1293 | 0.904 | 4 | 2 | 1 |
| leadcourt | 55 | 106 | village-lost | 0 | 971 | 0.935 | 9 | 4 | 1 |
| leadcourt | 66 | 39 | village-lost | 0 | 1057 | 0.816 | 17 | 2 | 0 |
| leadcourt | 77 | 100 | village-lost | 0 | 1627 | 0.889 | 19 | 4 | 1 |
| leadcourt | 88 | 83 | village-lost | 0 | 1211 | 0.902 | 38 | 4 | 0 |
| belongseek | 11 | 34 | village-lost | 0 | 1009 | 0.806 | 30 | 2 | 0 |
| belongseek | 22 | 68 | village-lost | 0 | 1576 | 0.886 | 34 | 2 | 0 |
| belongseek | 33 | 40 | village-lost | 0 | 1128 | 0.831 | 27 | 2 | 0 |
| belongseek | 44 | 180 | survived | 0 | 1306 | 0.949 | 20 | 3 | 1 |
| belongseek | 55 | 122 | village-lost | 0 | 969 | 0.949 | 20 | 3 | 1 |
| belongseek | 66 | 43 | village-lost | 0 | 1092 | 0.827 | 15 | 2 | 0 |
| belongseek | 77 | 134 | village-lost | 0 | 3477 | 0.862 | 37 | 2 | 1 |
| belongseek | 88 | 72 | village-lost | 0 | 2807 | 0.705 | 24 | 2 | 0 |

Aggregate: spoiledTakes **0/16 runs** (23,168 pantry takes instrumented via wrapped Game.takeFromPantry + Game.isSpoiled — the wrap is verified firing, so the 0 is a real measurement, not a dead instrument). meanScholarKcalFrac 0.856, meanStarveDays 21.1. GO requires baseline >0 → **GO missed → KILL**. Guardrail unevaluated (no armed side by design).

## Wall numbers (this arm's baseline suite)

national 6/16 · table 0 · wins 0 · wave-4 unlocks 3/16 · wave5 0 · median survival 72d · max 180d (belongseek s44, the sole survivor) · exiled 0. Death causes: combat 154, villager combat 70, sickness 39, wound-wouldn't-close 32, monster 21, expedition 11+3, starvation 10, thirst 3, ambush 3, contest 3, alien 2, Choir Toad 2, Night Court 1, Ugly-Eyes 1, Chorus Line 1.

## Village assessment

A courtship-road baseline on current master: villages die village-lost by d72 median, combat the overwhelming killer (villager combat 70 + combat 154 + monster 21 + ambush 3 ≈ 69% of attributed deaths). The scholar stays well-fed (kcalFrac 0.86) while villages starve around it (mean 21 starve-days/run) — the food economy binds at the village level, not the scholar's stomach, consistent with the r16b finding. belongseek s44 survived the full 180d and reached national; leadcourt s55/s77 reached wave 4. No spoiled-food pathology anywhere in 16 long runs: the pantry loop's missing spoilage check is a real code blank (proof shows the take-and-discard waste) but it has zero measured bite because the dawn sweep owns the spoiled-pantry window.

## Blanks filled / documented

- FILLED: finding #89 measured to a kill — the policy pantry loop CAN take spoiled stacks (proof: 5/8 takes on a constructed pantry), but the exposure is 0/23,168 in honest 180d sims because the village's dawn sweepSpoiled clears spoiled pantry stores before the policy's upkeep runs. The blank is real in code, unreachable in practice. The instrument (measure script) survives for any future spoilage-window work.
- DOCUMENTED: the finding's motivating instance was MISREAD — the day-8 successor's "Took Dried beans. The Dried beans was off. Your stomach knots. (-5 health) ×3" is the `safe === false` (undercooked / needsCooking) poison roll (20% per bite), not isSpoiled. Dried beans spoilDay is d0+365 — they cannot be spoiled on day 8. The honest gap the transcript actually shows is policy willingness to eat undercooked food (score 1 fallback when hungry), a different gate than this arm built (knowledge-gating on needsCooking). Filed as a candidate for a future arm; this arm's spoilage gate could not have bitten there either.
- DOCUMENTED: mbEat no longer exists (mantlebeat policy removed per kill protocol 92f41eff) — any future reference to it should point at competentEat/seekerEat instead.
- seekerEat deliberately left ungated: its design is risk-seeking on quirk monster meat (steve-call to change).

## Metric review

The pre-registered metric behaved exactly as designed: the kill condition (baseline 0 → kill on the measurement alone) fired, and the instrument was verified live (23,168 recorded takes). Two notes for NEXT runs: (1) the exposure window is structural — spoiled pantry stacks only exist between spoil time and the next dawn sweep, and the policy's upkeep runs after the sweep; an arm wanting to bite would need to move the policy's eat beat before the sweep or widen the window (a design change, not a policy layer). (2) The finding's transcript evidence should have been mechanically verified before arming — "was off" ≠ spoiled. A 5-minute transcript-mechanism check (grep the beat's code path) would have killed this arm before any sims were run. The proof-test-first discipline caught the mechanism as real; the baseline-first discipline caught the exposure as zero.
