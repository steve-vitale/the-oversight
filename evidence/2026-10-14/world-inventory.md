# World inventory — what is region-dependent today

*2026-10-14, read-only research for `docs/WORLD-REGIONS.md`.*


**Short answer:** the game has one environment today: Southeast‑US deciduous woodland ("Georgia creek country") on a 9x9 tile map. Where you come from (origin) works for anywhere in the world through tags, but where you land is always the same biome; only the landing zone varies. `regions.json` was written as if regions already existed, but **no game code reads it**.

## 1. regions.json, origin vs haven, originPicker
- **The 8 regions** (id, name, flavor):
  - `middle_america`: Middle America, "Missouri / Indiana / southern Illinois" (described as the default)
  - `southwest_desert`: Arizona / New Mexico
  - `pacific_northwest`: Oregon / Washington
  - `deep_south_bayou`: Louisiana bayou
  - `great_plains`: Kansas / Nebraska
  - `appalachian`: West Virginia / Kentucky hollers
  - `northeast`: Vermont / Maine
  - `florida`: Florida peninsula
- **Fields on each region:** `id, name, flavor, description, originKeys[], asOrigin, asHaven`.
  - `asOrigin` = `{knownAnimals[], knownPlants{id:level}, familiarTiles[], alienTiles[], culture}`.
  - `asHaven` = `{gen{creeks,wetlands,groveBlobs,groveSize,meadowSize,thickets,trailLines,ruinMaxDist,lootMult,stockMult}, animalAdd[], animalRemove[], animalDensity, challenge{id,name,mechanics[]}, monsters[] (2 scaffold concepts each), strategy, seasons{spring..winter text}, weather[], hazards[]}`.
  - Every plant and animal id these fields reference exists in the data. **None of the 16 regional monster ids exist** in `monsters.json` (corn_mother, dust_devil, the_mirage, …). **None of the challenge mechanics are implemented** (grep finds `harsh_winter`, `water_scarcity` etc. only in JSON).
- **Who reads it:** nobody. `game.js loadData` (~line 251) loads it into `Game.data.regions`; there are 0 readers of `data.regions`, `asOrigin` or `asHaven` in `src/js`. Old test scripts load it only as boilerplate.
  - `state.region` was once written as `'middle_america'` and later removed (see the `test-save-integrity-20261007.js` header). The one reader left is `arrivalPoolFor` (game.js ~10614), which is null-safe and checks `arrivalText.json regionOverrides`, which is `{}`.
- **Origin (where the character is from):**
  - The player picks a label in onboarding (`app.js ~813`, from `originPicker.json`: 6 continents, 47 labels: N. America 9, S. America 8, Europe 7, Africa 10, Asia 8, Oceania 5). Only the label string is stored.
  - `game.js parseOrigin(text)` matches the text against `characterGen.originKeywords` (121 keys, longest first) and returns `{raw, tags[]}`. The tags mix US states, the region ids above, and climate words (`desert, tropics, temperate, savanna, boreal…`).
  - **14 of the 47 picker labels produce no tags at all:** Caracas, Quito, Montevideo, La Paz, Oslo, Addis Ababa, Marrakech, Dakar, Casablanca, Kumasi, Dar es Salaam, Dhaka, Auckland, Wellington.
- **Haven (where they land):** `newGame(homeRegionText, locationId…)` (game.js ~1818) picks a random entry from `locations.json`: 28 landing zones (creek_bottom, ridgeline, old_suburb, cypress_slough, subway_cut…). Each has `gen` (the same schema as `asHaven.gen`), `spawnType` (`countryside`/`city`), `startMod.waterClean`, `hazard`, `tagline`. It sets `state.startLocation/startLocationName/spawnType`. Origin never affects the landing ("the scattering is random").
- **The only region-like effect of origin is familiarity:** `familiarityTier(tags)` returns local/visitor/stranger, which sets how many plants each roster member knows (3/2/1). There is also `bumpPlantFamiliarity` (~23472), the `canShow('animal')` region rule (~41025), and `scholar.originTags`.

## 2. Biomes, tiles, map
- **`biomes.json` holds one biome:** `se_woodlands`, with fields `forageTable{35 plant:weight}`, `tileTypes[8]`, `seasons{days,note}`, `weather[]`, `hazards[]`.
  - `game.js biome()` (~273) is hardcoded: `this.data.biomes.find(b => b.id==='se_woodlands')`.
  - Its only callers are `assignCellSpecies` (~9151) and `rollWildSpecies` (~9197).
  - `seasons`, `weather` and `hazards` are never read.
  - `engine/forage.js forage()` takes a biome, but the live forage sweep doesn't call it (comment at ~23640).
- **Tile types:** forest_floor, grove, meadow, thicket, wetland, creek, trail_edge, ruin, haven (pond is treated as creek for wildlife). `cell_defs.json` has `cellTypes` and `buildingRooms` (detail cells: plant/bush/tree/bigtree/…).
- **`genMap()` (~8959):**
  - Builds a seeded 9x9 grid: creek random walks, wetlands next to creeks, grove blobs, a meadow blob, thickets on the edges, trail lines.
  - Always places one ruin, using 3 hardcoded US ruinStories (barn, farmhouse, gas station) and loot from `SCAVENGED` (game.js ~168).
  - Sets stock from a hardcoded RICH table times `stockMult`, puts a breadbasket grove by the door, puts haven at (4,4), adds blockages (fallen_tree/rubble/washed_out), and seeds `initTileWildlife` per tile.
  - Result: `this.map={tiles,px,py,worldSeed,worldSize:9}`.
- **Detail grid (`genDetail`, ~9279):**
  - 9x9 cells per tile; tree species are hardcoded `oak/hickory/pine` (~9548).
  - Bushes are hardcoded `blackberry|muscadine` (~9171, ~9181, ~18980).
  - `cellPlantSpecies` maps oak to `acorn_white_oak` and hickory to `hickory_nut`.
  - Common trees known at start are hardcoded `['oak','hickory']` (~2283).
- **World edge:** `edgeExit`/`tryNodeExit` (~10210). Past the 9x9 rim the game says "The known world ends here — beyond is unmapped" (`state.worldEdgeTold`).
- **9x9 hardcoding:** about 128 `<9 / >8 / 4,4` literals in game.js, and the same pattern in 15 files. `worldSize` is read in only 1 place. The Network titan campaign assumes "one node per 3x3 sector of the 9x9".
- **Other villages:** `genVillages()` (~8117) places 3–4 villages on the same 9x9 map (names Emberhold/Stonebridge/Thornfield/Ashford, at distance ≥3 from haven). They are in `state.otherVillages`.

## 3. Flora and fauna, monsters
- **`plants.json`: 45 plants.**
  - Fields: `id, name, scientific, biomes (all 45 = ['se_woodlands']), caloriesPerUnit, unit, knowledgeLevels{1-4}, preparation, regions[], confidence, idDifficulty, description, seasons[], spoilageDays, tileAffinity[], lookalikeNote, waterContent, codex, sources, uses[{kind,minLevel}], form, edibility (safe 18/caution 10/avoid 6/cook 4/missing 7), taxon[], medicinal (11)`.
  - **The `regions` tags use a separate vocabulary:** `ohio 37, georgia 37, pacific_nw 25, columbus 23`, plus rare region ids. `pacific_nw` ≠ `pacific_northwest`; originKeywords for Portland emit both.
  - Plant `seasons` are display only (`examine.js:107`). Nothing restricts what can be foraged by season.
- **Knowledge flow:**
  - `plantsByFamiliarity` (newGame ~2171): plants whose `regions` overlap the origin tags come first.
  - `state.codex.plants` holds the player's codex.
  - `village.familiar/taught` and `journal.js:705` also read `p.regions`.
  - Place bounty is a hardcoded epithet-to-plant FAVORED table in `bountyFor` (~20629): cattail, hickory_nut, persimmon, dandelion, wild_onion, blackberry, muscadine, chickweed, wood_sorrel.
- **`animals.json`: 48 animals.**
  - Fields: `id, name, scientific, biomes (tile types), activity, calories, difficulty, method[], knowledgeLevels, unknown, emoji, behavior, behaviorDesc, fleeDifficulty, huntText, killText, tell, butcher, diseaseVector, vectorLevel, common, regions` (31 are `north_america`; 16 regional ones such as javelina, alligator, bison, moose, burmese_python).
  - **`initTileWildlife(biomeType)` (~8846) filters only by tile type,** so desert, bayou and plains species spawn on every map. Nothing implements `animalAdd/animalRemove/animalDensity`.
  - Hardcoded fish `['creek_chub','bluegill']` appear at ~3361 (checkTraps), ~6046, ~8864 and ~13431.
  - Ecology runs in `simEcology` (K=8, fish K=24). Encounters come from `encounters.js G.checkAnimals` (~1055), which overrides the game.js version.
  - Animal knowledge (`canShow` ~41025 / `encAnimalKnown`): `common` animals count as known if the region tags overlap, or if the player is North American and the animal is `north_america`; otherwise after 3 encounters.
  - Code also hardcodes `black_bear` (encounters.js 2118, 2408) and `['black_bear','wild_boar','javelina']` (food.js 546, 1143, trichinosis).
- **Monsters:** 62 in `monsters.json`. `biomes` values are se_woodlands 54, grassland 9, wastes 1, highlands 1, but **no spawn code reads monster biomes**. `pickWorldTile` (~17593) weights by tile type and `waterAffinity` only. Monsters are wave-based (`wave`), not region-based.
- **Titans:** `titans.json` has herald, nielsen, finale and `the_network`. The Network is fought across all 9 sectors (`network-campaign.js`). Titans don't depend on region.

## 4. Climate, seasons, weather, day, water
- **Weather is global and not regional:** endDay (~28141) rolls `clear 70% / rain 20% / cold 10%`.
  - Effects: `engine/calories.js` (clear: hydration ×1.5; cold: ×0.75), fire odds in rain, light ×0.7, cold shiver (~23962, 24735, 24837), rain_dancer / cold_blooded abilities.
- **There are no calendar seasons and no temperature model.** "Season = 30 days" in SCALE.md is a pacing unit only.
- **Day length is fixed:** `TIME.TICKS_PER_DAY 512` (4 parts × 128); `lightLevel()` (~17400).
- **Water:**
  - Starts at `state.village.water={clean:20+loc.startMod.waterClean, dirty:0}` (~1891).
  - Sources are creek/wetland tiles; `waterSafetyKnown` and hydration come from `calories.hydrationBurn`.
  - Rain catch only works with the ability.

## 5. Culture, people, language
- **`nameCultures.json`:** 29 cultures (`first, last, language`) and `originToCulture` (92 labels). Lookups: `cultureForOrigin` (game.js ~355), `genNameForOrigin` (~390), `guessNameGender` (~463).
  - There is no Chinese culture, even though `mandarin` and the china/beijing/shanghai keywords exist. Australia maps to `newzealander`.
- **Languages:**
  - `characterGen.languages` has 26 (english plus 25). `foreignSpeech.json` has 25 languages × 11 categories of real phrases.
  - `genCultureLanguages` (~527): native language from the culture, plus occupation `polyglot`, plus a heritage language (diaspora), plus English rolled as lingua franca (30% none / 45% partial / 30% fluent), plus a 7% chance of a language from time abroad.
  - `genRoster` guarantees at least one fully fluent English candidate (~1275). English is assumed as the shared language throughout `conversation.js` (`langExposure`, `translatorStage()` at ~5606).
  - The `translator` ability is in `abilities.json:1858` ("full translating part comes later").
- **`characterGen.json`:**
  - 55 occupations (fields: abilityWeights, backstory(ies), plantsKnown, teachTags, itemBias, intel…).
  - `originKeywords` 121, `sampleOrigins` 36.
  - `heritageMap` has 16 tag-to-people-group pairs ("the dryland clans", "the bayou families"); `heritageFor` (~301).
  - `appearancePools` has 37 entries, keyed by origin label; read by `appearanceFor`.
- **Roster:**
  - 4 candidates from the player's origin (`forceCultureMatch`) and 2 NPCs from random `sampleOrigins`.
  - Background survivors come from `background_survivors.json` (97 people, with static `origin/homeRegion`). At runtime these are overridden by `village.bgHome`, using last name → culture → a hardcoded `culturePlaces` map (~1957).
  - `villagers.json` is empty (0 entries); villagers are generated.
  - Other villages' rosters use `genNameForOrigin('village', true)`.
- **The village is already multinational.** Nationality is a string plus tags plus a culture; it is not an entity.

## 6. Food, items, ruins: US flavor
- **`SCAVENGED`** (game.js ~168): canned beans/corn/soup, jarred peaches, amoxicillin, mebendazole. `WALL_EXAMINE` describes cinderblock.
- **Ruin stories** (genMap): barn, farmhouse, gas station.
- **Starting pantry** (~1880): dried beans, rice, canned soup and similar.
- **`locations.json`:** many US landing scenes (hay field, grain silo co‑op, mill town, pecan grove, fire lookout, subway cut).
- **`books.json`** (34): "Medicinal Plants of the Southeast", "Foxfire Journal" (Appalachian), "Nana's Tuber Cards".
- **`lifeseeds.json`** places and workplaces are US.
- **Other data:** `items.json` has 215 items, `recipes.json` 36, `cooking.json` (`classes, plantClasses, monsterDiseases`) is keyed to plant ids.
- **No real brand names found.** "Burn" is the in-world disaster.

## 7. Hardcoded US / region assumptions (grep hits)
- `biome()` is hardcoded to `se_woodlands`.
- Tree species are oak/hickory/pine; bushes are blackberry/muscadine; the fish list is chub/bluegill; `bountyFor` has its FAVORED table; quests use `dandelion` (~5257, 5348).
- `betrayal.js:3045` staples list.
- Code comments state the premise: "Arizona -> Georgia creek" (~278, 2153, 2295).
- `canShow`: the `north_america` default, plus a `['united states','usa','america','canada']` check.
- `npcHomeRegion` falls back to `'somewhere'`; `bgHome` falls back to `'America'`.
- 9x9 / (4,4) literals throughout.
- `test-modifiers-depth` uses condition `biome:se_woodlands` (`engine/modifiers.js:29`).

## 8. Kin and family
- **`docs/KIN.md` (Steve canon):** the Taking happened at day zero; half of adults were taken (the "boring half") and their fate is never confirmed; their kids are in stasis pods. The kids are a moral weight with intrusions and social memory, not a meter. Only the Table can return the pods. There is a "callous oversight" epilogue and a dark child-soldier path.
- **Lifeseeds (`lifeseed.js`):**
  - `lifeseedRegion(char)` matches origin tags to `lifeseeds.regions`: 18 entries, all US (new_england … great_basin) plus `far_away` ("the old city / port town") as the fallback for every non-US origin.
  - Each region has `label, land, matchTags, towns, workplaces`.
  - The lifeseed stores `{regionId, regionLabel, regionLand, hometown, workplace, people (kin with relation and fates), places, event, wound, want, skillOrigins}`.
  - `lifeseeds.kin` fates include "is back in {town}", "somewhere west, last anyone knew", "was taken".
- **Kin only exist as backstory text.** There are no kin entities, no kin world locations, and nothing about "kin elsewhere" in game logic.
- **Relevant Steve quotes:**
  - STEVE-ANSWERS: "people got randomized and split up across the world. The family arc has to be late game content at the global stage."
  - progression.js: "Don't gate on knowledge because some places won't allow people to get knowledge unlocked in other regions."

## 9. The scale ladder and the global stage
- **`hierarchy.js scaleRank()`** returns `village / regional / national / global` from `networkLive / nationalLive / globalLive`.
- **Regional and national:** relationships among the 3–4 on‑map villages (links, tribute, covenant, trade, conquest; the polity is "1 primary + ≥3 seasoned subordinates"). `state.foreignPolities` are off‑screen bindings among those same known villages.
- **"National" means a polity of nearby fires, not a country.** No nation, country or continent entity exists anywhere.
- **Global** ("The Watchers") = `nationalLive` plus viewership ≥32. It is about audience and broadcast, not geography.
- **Rumors of "fires east"** come only from `scaleDiscovery.js` (~191–236).
- **Other global-stage pieces:** the Table (`table*.js`), the 8 alien rivals in `alienPlayers.json` (Vexari / Meridian / K'thari / Burlap), `galactic-cast.js`, and the Network titan.
- **Nothing exists beyond the 9x9 map.**

## 10. Tests that pin region-specific content
- **On the green list:**
  - `test-foreignspeech-depth-20261007.js` asserts **exactly 25 languages**.
  - `test-charactergen-appearance-20261007.js` checks that no appearance pool is removed and each has ≥5 clothing.
  - `test-background-audit-20261011.js` checks that lifeseed text uses only towns from the character's own `regionId`.
  - `test-arrivaltext-haven-pool-20261007.js` checks that `regionOverrides` exists and is an object.
  - `test-hunter-ecology-20261008.js` depends on `cottontail_rabbit` and deer in wildlife.
  - `test-save-integrity-20261007.js` checks that `arrivalPoolFor` stays null-safe.
  - `test-titan-12x12.js` and `test-multitile-20261012.js` depend on grid size.
- **Not on the green list, but they pin content:**
  - `test-lifeseed.js` expects Portland to resolve to `pacific_northwest`.
  - `test-forage-table-depth.js`, `test-plants-depth-20261007.js`, `test-forage-depth-20261007.js` all look up `se_woodlands`.
  - `test-modifiers-depth-20261007.js` uses `biome:se_woodlands`.
  - `test-animals-expand-20261007.js` expects `regions` to include `north_america`.
  - `test-animal-fixes-20261007.js`.
- **Old boilerplate:** about 20 old `test-break-*` scripts load `regions.json` by name, so the file must keep existing.

## Seams: smallest set of plug-in points for a region abstraction
1. **Active region state.** Add `state.region` (haven region id), set in `newGame` next to `startLocation`, and save it. `arrivalPoolFor` already reads it.
2. **`Game.biome()` (game.js ~273).** Resolve it as `regions[state.region].biome` instead of `se_woodlands`. This alone makes forage species vary by region (`assignCellSpecies`, `rollWildSpecies`).
3. **`newGame` landing pick (~1824).** Choose region first, then a landing zone filtered by a new `locations[].regions` field. `locParams()` (~342) merges region `asHaven.gen` with the location's `gen`.
4. **`initTileWildlife` (~8846).** Filter animals by `region.animalPool` or `animals[].regions`, apply `animalAdd/Remove/Density`, and replace the hardcoded FISH lists (4 sites) with `region.fish`.
5. **Detail species.** Move the tree list (`genDetail` ~9548), the bush pair (~9171/9181/18980), common trees (~2283) and `bountyFor` FAVORED (~20629) into biome data.
6. **endDay weather roll (~28141).** Read `region.weatherTable` (and later a season calendar plus temperature). `calories.hydrationBurn` already takes `weather`.
7. **Origin vocabulary.** Unify `plants[].regions`, `animals[].regions`, `originKeywords` tags, `lifeseeds.regions[].matchTags` and `regions.json` ids into one region/climate taxonomy, read by `parseOrigin`, `familiarityTier`, `bumpPlantFamiliarity` and `canShow('animal')`.
8. **genMap ruin/loot text and the SCAVENGED pool** become `region.ruinStories` / `region.scavenge` data.
9. **Regional monsters.** Have `pickWorldTile` / spawn selection honor `monsters[].biomes`/`regions` (currently unread), and promote `asHaven.monsters` scaffolds into `monsters.json`.
10. **Global stage (for kin across the world).** There is nothing to extend yet. Two candidate hooks: `hierarchy.js foreignPolities()` / `scaleDiscovery` rumors, and `lifeseed.people` fates. A world-level registry (`state.world.regions` with distant kin placed by region) would sit above `scaleRank()`'s `global` rung. It would also need the `9`/`(4,4)` literals turned into `map.worldSize` if other regions become walkable maps.
