# africa_sahel_savanna — research notes + validation

## Species research (web, 2026-10-14)
- **Desert date (Balanites aegyptiaca)**: Sahelian/Saharan esteem; edible sweet mesocarp; kernel oil 40–51%; leaves eaten; fruit yield 100–150 kg/tree. Sources: MDPI Foods 2023 (2304-8158/13/7/1135), World Agroforestry DB.
- **Sodom apple (Calotropis procera)**: HIGHLY TOXIC — all parts, esp. latex; cardiac glycosides (calotropin, uscharin); fruit apple-sized green; ocular toxicity documented (PMC2683444). Sources: Wikipedia, dibanduherbals, growplants.
- **Egusi (Citrullus colocynthis)**: seeds must be separated from fruit and thoroughly cooked; flesh extremely bitter/toxic; staple in Sahara/Sahel; West African egusi soup. Sources: Wikipedia (Bitter-apple), phys.org 2022 (6,000-year-old egusi seeds, Libya).
- **Physic nut (Jatropha curcas)**: seeds toxic (curcin, phorbol esters); 1–3 seeds poison humans; widely planted as living fence in tropics incl. Senegal. Sources: FAO i1219e, PFAF.
- **Doum palm (Hyphaene thebaica)**: widespread Sahel (Senegal→Sudan); fruit rind chewed/soaked for sweet juice; green kernels edible; germinated shoots eaten. Sources: Wikipedia, EOL, hafir.online fact sheet.
- **Grewia tenax (godeim)**: indigenous Sudanese/Sahel fruit, edible berries processed to nectar. Source: Sudan National Food Research Centre.
- **Bitter leaf (Vernonia amygdalina)**: widely consumed West African leafy vegetable; debittered by squeeze-washing/boiling. Sources: Frontiers in Natural Products 2024, eajournals.org.
- **Cassava**: cyanide; Codex ≤10 mg/kg HCN processed; ~200 deaths/year from bad processing; peel + soak/ferment + cook. Sources: WHO guidance, atlantis-press ICESUS 2025.
- **Honey badger (Mellivora capensis)**: sub-Saharan Africa incl. Sahel; savanna/grassland; fearless, thick loose skin. Sources: GBIF, Animal Diversity Web.
- **Dorcas gazelle (Gazella dorcas)**: savanna/semi-desert, best desert-adapted gazelle. Source: Animal Diversity Web (EOL).
- Well-established without deep search (staple crops): pearl millet, sorghum, fonio, cowpea, groundnut (aflatoxin caution — FAO), baobab, tamarind, tiger nut, okra, bissap, moringa, shea, jujube, amaranth, gum arabic (Senegalia senegal), neem (medicinal), Senegal date palm, water lily (Nymphaea lotus), African wild rice (Oryza longistaminata), hanza (Boscia senegalensis), datura (tropane alkaloids — toxic), helmeted guineafowl, warthog, cape hare, vervet monkey, double-spurred francolin, Abyssinian ground hornbill, rock hyrax, African buffalo, lion, Nile tilapia, African sharptooth catfish, Nile perch.
- Cosmopolitan reuses (already in plants.json): purslane, prickly_pear, mesquite (Prosopis juliflora — invasive in Sahel, real).

## Content summary
- 30 new plants (18 safe / 7 cook / 2 caution / 3 avoid), 3 patched reuses
- 14 new animals (11 game incl. lion predator + 3 fish)
- 1 biome (sahel_savanna), 3 landing variants, 2 monster variants (dustboar, sunback)
- 3 ruins (market, school, clinic — ordinary/specific), 10 scavenge items (8 non-rare, 2 rare meds), 5-item pantry, 4 village names
- Lifeseeds: patched landings onto existing nigeria + senegal regions (both already worldRegion=africa_sahel_savanna; Lagos/Dakar each in exactly one origins[])
- Climates talk: 4 local lines; extended dry_tropical visitor lines
- Region entry: status playable, calendar dry_tropical_wet_dry kept, originTags += dakar

## Validation outputs
(pasted below after runs)

## Run 2026-10-14 (worktree region-sahel, base 7d011395)
- `node scripts/validate-regions.js --quiet` → `validate-regions: 20 regions, 2 playable, 0 errors`; `✓ africa_sahel_savanna (playable)`
- `REGION=africa_sahel_savanna node scripts/region-smoke.js` → OK (seeds 7,42,99 × 60 days, capable bot; all survived to day 60, 0 starvation deaths; landings waterhole_edge ×2, market_ruins ×1)
- `node scripts/check.js --quick` → (see below)

## Run 2026-10-14 — check.js --quick: 89 passed, 6 failed (NOT green; all 6 characterized)
Failing tests (from `node scripts/check.js --quick --timeout 300`, full log in worktree /tmp — see report):

1. **test-sprites-valid-20261014.js** — 85 failed, all mine: every new plant needs its own sprite + category sprite in src/js/sprites.js; both monsters need calm+aggro sprites. Pristine baseline: 961 passed, 0 failed. → ART TASK (out of scope for data fragments; Steve's visual-identity law wants custom art per final form).

2. **test-region-engine-20261014.js** — "FAILED: 20 regions, 1 playable". Hardcoded single-playable-region expectation; my region is the 2nd playable by design. → TEST UPDATE needed at fragment-landing time.

3. **test-region-start-20261014.js** — "FAILED: random picks cover both playable regions | shipped data: a Lagos first run lands in the eastern woodlands (no African region playable yet)". Hardcoded "no African region playable yet"; with the region playable a Lagos first run correctly lands in the Sahel (Steve's round-1 answer: first run lands in origin region). → TEST UPDATE needed at landing.

4. **test-origins-world-20261014.js** — 7 failed (pristine: 69 passed, 0 failed). Root cause: `pickLandingRegion` now randomly picks between 2 playable regions; the test calls `newGame(place, 'hay_field')` without pinning `Game.debugRegion`, so the seeded RNG lands in the Sahel and all familiarity tiers compute 'stranger'. → TEST FIX at landing: pin `Game.debugRegion='na_eastern_woodlands'` in the test.

5. **test-where-are-we-20261014.js** — TIMEOUT (killed at 120s and at 300s). Pristine baseline run launched with 590s timeout; result pending — likely box contention (8 concurrent check.js on 2 cores), not content. (The test's W8 data assertion "every playable region has its own local lines" is satisfied: climates talk.regions.africa_sahel_savanna.local added.)

6. **test-capable-greedy-20261015.js** — 2 failed with full data ("greedy reached Overtime >= 1 before sitting", "and then sat"); pristine: 13/13 green. Bisection:
   - regions/biomes/locations/climates/lifeseeds-patch only → 13/13 PASS
   - plants-patch only → PASS; animals only → PASS
   - plants.json only → 12/13 FAIL (same assertion)
   - 30 inert dummy plants (regions=['nowhere']) → 12/13 FAIL identically
   - Root cause: `plantsByFamiliarity` in newGame does a Fisher-Yates shuffle over `this.data.plants` per villager — plant COUNT changes the seeded RNG stream, so the whole 150-day sim diverges. ANY plant addition breaks this test; content-independent. Structural engine/test issue.
   - The 2nd assertion ("and then sat") was fixed by removing the 2 monsters: `monsterWavePool()` filters by wave only — `monsters.json biomes` is UNREAD (WORLD-REGIONS.md §11 engine follow-up), so dustboar/sunback spawn globally, including the woodlands. Data carries correct `biomes:["sahel_savanna"]` for when the engine reads it.

## Structural findings for the coordinator (affect ALL wave-1 regions)
- Every region's plants will break test-capable-greedy-20261015 via the newGame RNG shuffle. The test needs RNG-robustness (e.g., shuffle keyed by plant id, not list length) or re-tuning per wave.
- Every 2nd+ playable region breaks: test-region-engine, test-region-start, test-origins-world (random landing), and any sim test that doesn't pin `Game.debugRegion`.
- Every region's monsters spawn globally until the engine reads `monsters.json biomes` (§4 #20 follow-up).
- Every region's plants/monsters need sprites (test-sprites-valid) — art pass per region.
