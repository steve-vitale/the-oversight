# MEALNAME — name the food in the bulk eat beat (loop B, food-economy, 2026-10-13)

## Pre-registration (written before any sim ran)

- **Primary metric**: narration mechanism — the share of sampled bulk-eat beats that name the food eaten.
- **GO threshold**: ≥90% of sampled bulk-eat beats name the food (sample ≥100 beats across the suite) AND 8-seed before/after trajectories near-identical (gameplay summaries match within noise — median survival ±3d, no wall-metric delta). The change is narration-only by construction; the trajectory check is the safety instrument.
- **KILL threshold**: <90% naming, or any gameplay drift (median ±3d, any wall-metric delta: national/table/wins, wave 4-5 unlocks).
- **Horizon**: 180d death-aware (pacing-law maximum; dead villages stop simulating via runDays endReason — never a fixed 200d).
- **Seeds**: 11, 22, 33, 44, 55, 66, 77, 88 — IDENTICAL seeds before/after. Policies: leadcourt, belongseek (16 runs per side).
- **Lever**: game.js bulk `eat()` — record each eaten item's knowledge-gated display name (`itemDisplayName`: unknown plants show their descriptor, monster meat wears its gated name, never the true name the player hasn't earned) and render it in the final beat: "You eat smoked turkey (smoked) and garden greens (310 kcal)." instead of "You eat (310 kcal)." kcal, bankNote, spoilNote preserved. Player-facing text: commit carries [needs-eyes].
- **Canon**: docs/CANON.md ("If you don't know, it doesn't show" — knowledge gates every surface); docs/PRESERVATION.md (state suffixes honest: smoked/dried/cooked are part of the stored name).
- **Metric binding (§14)**: the above thresholds bind this run. A miss is NO-GO, never re-scored mid-run.

## Lever played

MEALNAME — the bulk `eat()` beat (game.js) now names what was eaten, knowledge-gated.

Implementation (src/js/game.js, bulk `eat()` only — `eatOne` untouched):
1. Loop collects `ateItems`: per eaten unit, `this.itemDisplayName(it)` resolved at eat time — real plants gate through `plantDisplayName` (true name only if `plantKnown`, else the honest descriptor, never the true name); `meat_*` ids wear the stored name (already gated at creation via `monsterDisplayName`, refreshed on village naming with the processing suffix `(smoked)/(cooked)/(dried)` preserved); non-plant plantIds (stone_knife etc.) and id-less items show the stored name. Units of the same stack collapse to one entry; distinct items kept in first-eaten order.
2. Final beat: `You eat smoked turkey (smoked) and garden greens (310 kcal).` — list joined with " and " (Oxford comma for 3+); kcal, bankNote, spoilNote unchanged. Fallback to the old unnamed beat only when ate>0 with no named items (cannibal-only edge) — never silent, never a paragraph.
3. Wrapped in try/catch: a naming failure can never break the meal.

Why `itemDisplayName` and not `it.name`: knowledge can change between an item's creation and its eating (identifyPlant refreshes stack names, but a stack eaten before re-render would wear a stale descriptor). `itemDisplayName` computes the CURRENT gated name at eat time — the same gate the pack UI uses. Variety across beats comes honestly from the items' state suffixes (smoked/dried/cooked), not from verb variation — "smoked turkey (smoked)" vs "turkey meat" read differently because the food IS different.

## Before/after trajectory table + wall numbers

16 runs per side, IDENTICAL seeds (11/22/33/44/55/66/77/88) × {leadcourt, belongseek}, 180d death-aware. Per-run field comparison (days, endReason, won, waveReach, maxArc, maxRank, national, table, vests): **0 diffs across all 16 runs**. Death-cause totals byte-identical. The lever touches no RNG path — expected, and now proven.

| side | median d | max d | national | table | wins | wave 4+ | beats | named |
|------|----------|-------|----------|-------|------|---------|-------|-------|
| baseline (pristine) | 65 | 165 | 4/16 | 0/16 | 0/16 | 5/16 | 1739 | 0 (0%) |
| armed (mealname) | 65 | 165 | 4/16 | 0/16 | 0/16 | 5/16 | 1739 | 1739 (100%) |

Per-policy: leadcourt median 65d both sides (national 3/8, wave4+ 5/8); belongseek median 72d both sides (national 1/8, wave4+ 0/8). Same 941/798 beat counts per policy.

GO verdict: naming 100% ≥ 90% threshold (1739/1739 beats, sample far above the ≥100 minimum); trajectories byte-identical, median ±0d, zero wall-metric delta. **GO.**

## Sampled-beat analysis (SENSE-TESTING LAW — 30 distinct beats read, 625 sampled, 0 empty names)

Beats read sensically as meals, not logs: "You eat Lamb's Quarters and Wild Onion (190 kcal)." "You eat Blackberry and Purslane (225 kcal)." "You eat Fish catch (smoked) (314 kcal)." Three-item beats take the Oxford comma honestly: "You eat Cattail, Maypop, and Muscadine Grapes (2010 kcal)." Bank beats keep the bank note intact: "You eat Rice (200 kcal). Past full — the bank takes it. (+2168 banked. The furnace roars. You feel dangerous.)"

Variety (the pantry-spoil-theater concern): beats vary honestly with item state and source — "Fish catch (smoked)" vs "Snared meat (dried)" vs "Garden harvest (dried)" vs fresh "Foraged food (500 kcal)" vs "Winner's share (alien rations) (dried)" vs the pre-existing oddity "Can labeled BEANS". Same-combo repeats across days ("Muscadine Grapes and Sassafras" on s66 and s88) are honest — the player literally ate the same meal twice; a human would say the same. Not theater.

Item-order honesty: the loop eats most-perishable first, so the beat lists the about-to-turn food first — the meal reads as "reaching for what needs eating," which is exactly the expiry-pilot behavior the backlog item complained was invisible.

Coherence notes: "You eat Dried meat and Trail mix (1400 kcal)." — "Dried meat" (stored-name prefix) vs "Snared meat (dried)" (suffix) is a pre-existing data-naming inconsistency, not introduced here; both name real distinct items. Capitalization follows the pack UI's existing convention ("Dandelion", "Rice"). No beat was a paragraph; longest sampled beat is the bank note, unchanged from before.

Knowledge gate in the wild: 0 descriptor-style beats in the 625 suite samples — the competent policies identify everything they eat. The gate is proven by the synthetic proof instead (unknown plant → "a plant with jagged leaves and a yellow flower", true name "Dandelion" never leaked).

## Sampled-beat analysis (SENSE-TESTING LAW — 30 distinct beats read, 625 sampled, 0 empty names)

(Beats section above. Villager-behavior check: this arm touches only the scholar's bulk-eat narration; villager systems are untouched — the byte-identical before/after trajectories (including all villager death causes and counts) are the proof. No separate villager audit was warranted for a narration-only lever; the robotic-meal-beat blank was on the scholar side.)

## Village assessment

The villages look exactly as they did before — because nothing changed except narration. Across 16 runs: median survival 65d (leadcourt 65, belongseek 72), max 165d; combat remains the wall (105 combat + 22 monster + 21 villager-combat deaths of 214 total); national reached 4/16 (leadcourt courts, belongseek holds 1/8); table 0/16; wins 0/16; wave 4–5 unlocked on 5/16 (all leadcourt). The blank filled is narrative, not structural: the same villages, the same deaths — but the scholar's meals now read as meals. What was missing: the WHAT of 1,739 meals. Filled.

## Blanks filled / documented

- Filled: the bulk eat beat now names what was eaten (knowledge-gated). Proof test scripts/test-mealname-20261013.js (RED-verified on pristine: beats were "You eat (120 kcal)." with no name; GREEN 14/14 armed).
- Documented (not chased — out of arm scope): item-level cook attribution doesn't exist. The beat can say "smoked turkey (smoked)" but not "smoked by Walt" — `trackMealExposure` knows `cookedByVillage` for disease exposure, but no `cookedBy` field is stored on inventory items. If Steve wants the who in meal narration, that's a game-data addition first (design call: is cook identity knowledge the player should have?).
- Documented (pre-existing, surfaced by the sense read): "Dried meat" vs "Snared meat (dried)" — two naming conventions for preserved meat in item data (prefix vs suffix). Honest (distinct items), but a future data-cleanup pass could unify on the suffix convention the smoking code already uses.
- (No further blanks from the sense read.)

## Metric review

The pre-registered metric (naming rate ≥90% on ≥100 beats) proved exactly the right instrument: 100% on 1,739 beats, and the safety instrument (byte-identical trajectories) confirmed narration-only by construction. One honest nuance: the ≥90% threshold was conservative for a deterministic code path — once the first armed beat named correctly, 100% was near-guaranteed unless an edge path (cannibal-only, unnamed items) fired, which it didn't in 1,739 beats. The synthetic proof covers the edges the suite didn't (unknown-food gating, multi-item, meat suffix). No metric revision proposed — but the next narration lever should pre-register the edge-case coverage in the synthetic proof as part of the GO bar, not just the suite census.

## Convergence state

**GO — ready to merge.** Narration-only lever: 100% naming, byte-identical gameplay trajectories, telemetry-check quiet vs the scale-wall baseline. Food-economy axis stays `converging` (this arm filled a sense blank, moved no structural metric — the wall numbers are unchanged: national 4/16, table 0/16, wins 0/16).
