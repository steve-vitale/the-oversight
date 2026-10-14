# The World — regions, random landings, and the global stage

*2026-10-14. Design for Muse to execute against. Engine pieces marked
**[ENGINE]** are built by Claude now; pieces marked **[CONTENT]** are Muse's.*

> **Engine status (2026-10-14): DONE.** §6 registry, §7 data shape, §8
> validator, the seams in the inventory and the origin vocabulary are built.
> Adding a region is now data only: see **§11**. Proof:
> `scripts/test-region-engine-20261014.js`.

> "Please provide muse scaffolding for establishing the rest of the nations as
> starting regions and places that can be accessed. This also necessitates
> other starting flora and fauna, and we can truly have the starting
> characters be thrown into a random enviroment. What else needs to be adapted
> to the new environments? We don't need every country but take a shot at like
> all continents/subcontinents roughly." — Steve
>
> "canon is that people got randomized and split up across the world. The
> family arc has to be late game content at the global stage." — Steve

Inventory this builds on: `evidence/2026-10-14/world-inventory.md`.

---

## 1. Where we are

- **One environment.** Every run lands in Southeast-US woodland (`biomes.json`
  `se_woodlands`, hardcoded in `Game.biome()`). Trees are oak/hickory/pine,
  fish are chub/bluegill, ruins are barn/farmhouse/gas station.
- **Origins are already global.** The picker offers 47 cities on 6 continents,
  names and 25 languages follow the origin, and the village is multinational.
  But 14 picker cities produce no tags, and all non-US lifeseeds fall back to
  "the old port town".
- **`regions.json` is a ghost.** 8 US regions with rich `asOrigin`/`asHaven`
  data, read by nothing. Their 16 regional monsters and challenges don't exist.
- **No climate.** Weather is one global roll (clear 70 / rain 20 / cold 10).
  No seasons, no temperature.
- **"National" and "global" are social, not geographic.** No country,
  continent or distant place exists as an entity.

## 2. The canon this design serves

1. **The Scattering randomized people across the world.** Your origin (who you
   were) and your landing (where the System dropped you) are independent. A
   nurse from Lagos can wake in the Andes beside a herder from Mongolia.
2. **Being a stranger to the land is the early game.** What you know depends on
   where you're from; what you need depends on where you landed. The village
   is a pool of knowledge from everywhere.
3. **Your family is somewhere else in the world.** Kin were scattered too (or
   Taken: `docs/KIN.md`). Finding them is late-game, global-stage content.
4. **Other regions are real places you can reach** once you reach the global
   stage.

## 3. The world map: 20 regions

Each region is one **biome profile** (what grows, lives, and falls from the
sky) plus a **people layer** (the ruins and the leftovers of the people who
lived there). Coverage aims at every continent and subcontinent.

| # | Region id | Covers | Biome character | Signature pressure |
|---|---|---|---|---|
| 1 | `na_eastern_woodlands` | Eastern US (today's game) | Deciduous forest, creeks | The long winter |
| 2 | `na_plains` | Great Plains, Prairies | Grassland, few trees, big sky | Wind, storms, no cover |
| 3 | `na_arid` | US Southwest, N. Mexico | Desert, canyon, wash | Water |
| 4 | `na_boreal_pacific` | Pacific NW, Canada, Alaska | Temperate rainforest → taiga | Cold, damp, big predators |
| 5 | `mesoamerica_caribbean` | Central America, Caribbean | Tropical dry/wet forest, coast | Storms, insects |
| 6 | `sa_amazon` | Amazon basin | Tropical rainforest, rivers | Disease, abundance that bites |
| 7 | `sa_andes` | Andes, Altiplano | Highland, puna, terraces | Altitude, cold nights |
| 8 | `sa_pampas_patagonia` | Pampas, Patagonia | Grassland → cold steppe | Wind, distance |
| 9 | `eu_temperate` | Western/Central Europe | Broadleaf, farmland, ruins dense | Damp cold, scarce wild calories |
| 10 | `eu_mediterranean` | Med basin incl. coastal N. Africa | Scrub, olive, coast | Summer drought, fire |
| 11 | `eurasia_taiga` | Scandinavia, Russia, Siberia | Taiga, tundra edge | Deep cold, short days |
| 12 | `mena_desert` | Sahara, Arabia, Middle East | Desert, oasis, wadi | Heat, water |
| 13 | `africa_sahel_savanna` | West/East Africa savanna | Savanna, acacia, rivers | Dry season, big animals |
| 14 | `africa_congo` | Central African rainforest | Rainforest, rivers | Disease, density |
| 15 | `africa_southern` | Southern Africa | Highveld, fynbos, karoo | Drought, predators |
| 16 | `south_asia` | Indian subcontinent | Monsoon forest → plains | Monsoon, heat |
| 17 | `central_asia_highlands` | Steppe, Himalaya, Tibet | Steppe, high mountain | Cold, altitude, wind |
| 18 | `east_asia` | China, Korea, Japan | Temperate monsoon, terraces, bamboo | Monsoon floods, winters |
| 19 | `southeast_asia` | Mainland SE Asia, Indonesia, Philippines | Tropical monsoon forest, islands | Heat, storms, insects |
| 20 | `oceania` | Australia, New Zealand, Pacific islands | Eucalypt/outback; temperate islands | Water (AU), isolation |

**The 8 old US regions** in `regions.json` become **landing variants** inside
regions 1–4 (Appalachian, bayou, Florida and New England are Eastern
Woodlands variants; Plains, Southwest and Pacific NW map to their regions).
Their `asHaven.gen` numbers, seasons, weather and challenge text are the seed
content for those regions.

**Southern hemisphere** regions (6, 7, 8, 15, 20, part of 19) run their season
calendar offset by half a year.

## 4. What has to adapt to a new region (Steve: "What else needs to be adapted?")

Each item says what changes and where it lives today. **Bold** items are the
ones a region can't ship without.

| # | System | Adapts how | Lives today in |
|---|---|---|---|
| 1 | **Forage flora** | Region forage table, edible/toxic/lookalike mix, medicinal plants | `biomes.json` forageTable, `plants.json` |
| 2 | **Trees, bushes, detail cells** | Species per region (oak/hickory → baobab/acacia, bamboo, eucalyptus…) | hardcoded in `genDetail`, bush pair, common trees |
| 3 | **Game animals** | Region animal pool + density + adds/removes | `animals.json`, `initTileWildlife` |
| 4 | **Fish** | Region fish list | hardcoded chub/bluegill ×4 sites |
| 5 | **Predators & disease vectors** | Region predators (bear → big cat, croc, wolf); trichinosis/parasite list per region | `encounters.js` black_bear, `food.js` lists |
| 6 | **Climate** | Season calendar (hemisphere), temperature band, weather table per season, wet/dry seasons in the tropics | one global roll in `endDay` |
| 7 | **Water** | Abundance, safety, rain catch, wells/oases | `village.water`, creek/wetland tiles |
| 8 | **Terrain & map gen** | Tile palette and gen numbers (dunes, wadis, rice terraces, canopy). Start as **display skins over the 8 logical tile kinds**; new logical kinds later | `genMap`, `locations.json` gen |
| 9 | **Landing zones** | `locations.json` entries tagged by region | `locations.json` (28, all US-flavored) |
| 10 | **Ruins & scavenge** | Building types and their loot (canned beans → rice sacks, tinned fish, local medicines) | `SCAVENGED`, ruinStories |
| 11 | Starting pantry | What was in the bags | `newGame` pantry |
| 12 | Food culture | Regional staples and recipes become knowledge you can bring or learn | `recipes.json`, `cooking.json` |
| 13 | **Knowledge & familiarity** | Origin vs landing: same region = local, same climate family = visitor, else stranger. Sets starting plant/animal knowledge | `familiarityTier`, `plantsByFamiliarity`, `canShow('animal')` |
| 14 | Books | Regional field guides; ruins hold local-language books | `books.json` (US titles) |
| 15 | Language of the land | Signage, books, ruins text in the land's language; ties into the translator ability | `foreignSpeech.json`, `translator` |
| 16 | **Lifeseeds (backstories)** | Hometowns and workplaces for every world region, not just the US | `lifeseeds.json` (18 US + fallback) |
| 17 | Names & cultures | Fill gaps (no Chinese culture; 14 picker cities with no tags) | `nameCultures.json`, `characterGen.originKeywords` |
| 18 | Hazards & conditions | Heat stroke, altitude sickness, frostbite, malaria-like fever, venom | `statusEffects.json` |
| 19 | Region challenge | Each region's "boss": long winter, water, monsoon, altitude… | `regions.json` asHaven.challenge (unbuilt) |
| 20 | Monsters | **The System's monsters stay global** (the waves are TV, not nature). Regions add **variants** (skins + one changed mechanic) and spawn weights. The 16 scaffold monsters become variants | `monsters.json` biomes (unread) |
| 21 | Abilities | Some magic shines by region (photosynthesis in the tropics, cold_blooded in heat, water_breathing near coasts). Not changed per region; **builds adapt** | `abilities.json` |
| 22 | Jobs | Region-plausible occupations (herder, rice farmer, fisher) for villagers from there | `characterGen.json` occupations |
| 23 | Other villages | Named by survivors in the land's flavor | `genVillages` names |
| 24 | Art | Emoji/sprites for new tiles and animals; 390×844 | `sprites.js`, `app.js` |
| 25 | Sims & tests | Sweep across regions; region tag in telemetry; content validator | `scripts/` |

## 5. How it fits the rest of the game (synergy)

- **The ladder:** a job leans you into a track. Your origin decides what you
  *know*; your landing decides what you *need*. The gap between them is the
  early game, and the village closes it (teaching, theorizing, the Bond track).
- **Food is the spine:** each region has a different food problem, so the
  same "food powers abilities" thesis plays differently: abundance with
  disease (Amazon), scarcity with water (desert), feast-or-famine seasons
  (taiga, monsoon).
- **Builds:** villagers "go for a build that suits their technology"; their
  environment belongs in that too. `Game.buildScore` gets a region term:
  heat-resistant builds in the desert, cold in the taiga.
- **Keepsakes:** the thread home gets a real destination. A keepsake's place
  reveal names a **region**; the clue points at the world map.
- **The global stage:** other regions become reachable places (§6). The Table,
  titans and the Network stay global and region-neutral.
- **THE HOSTS:** the Taken come home. Scattered kin you found are already home.
  The best ending reunites both.

## 6. Places you can reach: the global stage

**[ENGINE — done: `src/js/world.js`]** A world registry, `state.world`:
- `regions`: all 20, each with `known` (heard of), `contact` (a link or relay),
  `visited`.
- `kin`: the player's (and each villager's) kin, each placed in a **seeded
  random region** at run start, with a fate: `scattered` (alive somewhere) or
  `taken` (KIN.md). Hidden until discovered.

**[CONTENT, later]** Reaching another region:
1. **Hear of it:** rumors at regional rank ("fires east" already exists in
   `scaleDiscovery.js`), alien broadcasts, keepsake clues.
2. **Reach it:** at the global stage, an **expedition** generates a 9×9 map of
   that region with the same engine, for a set number of days. You take a
   party, so muster and upkeep apply. Expeditions reuse the march rules of the
   finale campaign.
3. **What's there:** a foreign village (a rival or ally, possibly on the scale
   ladder), regional food and knowledge you can't get at home, and **kin**.
4. **The family arc:** find a kin's region → expedition → reunion event (they
   join the village, or are already dead, or have become something). Late game
   only: gated on global rank. "If you don't know, it doesn't show": the world
   map doesn't exist in the UI until the first region is heard of.

## 7. The data shape [ENGINE — done]

`src/data/regions.json` becomes the world list. One entry per region:

```json
{
  "id": "africa_sahel_savanna",
  "name": "The Sahel and the Savanna",
  "continent": "africa",
  "climateFamily": "dry_tropical",
  "hemisphere": "north",
  "status": "stub",
  "biome": "sahel_savanna",
  "originTags": ["nigeria", "lagos", "ghana", "kenya", "senegal", "savanna"],
  "neighbors": ["mena_desert", "africa_congo"],
  "climate": {
    "seasons": [{ "id": "dry", "days": 60, "temp": "hot", "weather": { "clear": 0.85, "rain": 0.05, "heat": 0.10 } },
                { "id": "wet", "days": 30, "temp": "warm", "weather": { "clear": 0.5, "rain": 0.45, "storm": 0.05 } }]
  },
  "fauna": { "game": ["…"], "fish": ["…"], "predators": ["…"], "density": 1.0 },
  "flora": { "trees": ["…"], "bushes": ["…"], "commonTrees": ["…"], "bounty": ["…"] },
  "people": { "language": "hausa", "ruins": ["…"], "scavenge": { "…": 1 }, "pantry": ["…"], "villageNames": ["…"] },
  "challenge": { "id": "dry_season", "name": "The Long Dry" },
  "landingVariants": ["…"],
  "lifeseedRegions": ["…"]
}
```

`biomes.json` holds the forage tables and tile skins per biome. `plants.json`
and `animals.json` entries list the `biomes` they belong to (they already have
the field). One tag vocabulary is shared by origin parsing, familiarity and
lifeseeds.

**Status ladder:** `stub` (exists in the world registry and as an origin,
can't be landed in), then `playable` (passes the validator; can be a random
landing), then `rich` (full content). Only `playable`+ regions are landings.

## 8. Content validator [ENGINE — done: `scripts/validate-regions.js`, smoke: `scripts/region-smoke.js`]

`node scripts/validate-regions.js` checks every region:
- Every referenced plant, animal, item, language and monster id exists.
- **Playable minimums:**
  - at least 12 edible plants, including 3 safe staples and 2 toxic
    lookalikes
  - at least 6 game animals and 2 fish
  - at least 1 predator
  - 3 trees and 2 bushes
  - weather sums to 1 in every season
  - at least 6 scavenge items and 2 ruin stories
  - at least 3 landing variants
  - at least 1 lifeseed region
- Hemisphere and season days add up to the year length.

A playable region also passes a **smoke sim**: 3 seeds × 60 days with the
capable bot, no crash, starvation not certain.

## 9. Muse's execution order [CONTENT]

Each wave ends with the validator green, a 3-region smoke sim, and a balance
note in `evidence/`.

| Wave | Regions | Why first |
|---|---|---|
| 0 | `na_eastern_woodlands` | Already exists (migrated by the engine work) |
| 1 | `africa_sahel_savanna`, `south_asia`, `eu_temperate` | The most picker origins without a home; three very different food problems |
| 2 | `sa_amazon`, `east_asia`, `mena_desert` | Abundance vs scarcity extremes; East Asia fills the missing culture |
| 3 | `na_arid`, `na_plains`, `na_boreal_pacific`, `eu_mediterranean` | Reuse the existing regions.json seed data |
| 4 | `sa_andes`, `central_asia_highlands`, `eurasia_taiga` | Altitude and deep cold need the hazard work |
| 5 | `africa_congo`, `africa_southern`, `southeast_asia`, `mesoamerica_caribbean`, `sa_pampas_patagonia`, `oceania` | Completes the map |

**Per region, about:**
- 30 plants (reuse cosmopolitan ones such as dandelion, plantain and purslane where true)
- 10 animals
- 3 fish
- 6 trees and bushes
- 3 ruins
- 10 scavenge items
- 3 landing variants
- 1 lifeseed region (towns, workplaces)
- 1 challenge
- 2 monster variants

**Accuracy matters** for real plants: edibility, lookalikes, preparation. Use
the existing `confidence` and `sources` fields, and mark anything uncertain.

**Respect:** these are real people's homes. Keep the ruins ordinary and
specific (a market, a school, a clinic, a bus depot); no stereotype props.
Religious sites appear only as quiet ruins, never as loot pinatas.

## 10. Open questions for Steve

1. **Random landing everywhere from run 1,** or does a new player land
   somewhere familiar first (e.g. their origin's region) and later runs go
   random? A random landing from run 1 is the canon; familiar-first is gentler.
2. **The Taken vs the scattered:** both exist (KIN.md's Taken plus your
   "split up across the world")? This design keeps both: scattered kin can be
   found on expeditions; the Taken come home only in THE HOSTS.
3. **Expeditions:** a temporary trip (go, come back) or relocation (move your
   village)?
4. **Does the region change the year?** A tropical wet/dry cycle instead of
   four seasons changes pacing. Is that OK?

## 11. How to add a region (Muse checklist)

Everything below is data. If you find yourself editing `game.js` to add a
region, stop: the engine already reads every field listed here (the reader
is named in brackets).

**0. Pick the region** from §3. Its stub already exists in
`src/data/regions.json` with `id, name, continent, climateFamily,
hemisphere, originTags, neighbors` (and sometimes `lifeseedRegions`,
`seedData`). Read `seedData` first: the old US regions' gen numbers,
seasons, weather and challenge text are there for regions 1–4.

**1. Plants** (`src/data/plants.json`). Add the region's plants; give each
an `edibility` (safe / caution / cook / avoid), `lookalikeNote`,
`confidence`, `sources`. Add the region's biome id to `biomes`.

**2. Biome** (`src/data/biomes.json`). A new entry `{id, name,
forageTable: {plantId: weight}, tileTypes, seasons, weather, hazards}`.
Only `forageTable` is read today [`Game.biome()` → `assignCellSpecies`,
`rollWildSpecies`].

**3. Animals** (`src/data/animals.json`). New species get `biomes` = the
tile types they live on (`meadow`, `creek`…), like the existing ones.

**4. Landing variants** (`src/data/locations.json`). At least 3 entries
`{id, name, description, tagline, gen{…}, spawnType, startMod{waterClean},
hazard}` (same schema as today's 28).

**5. Fill the region entry** in `regions.json` (shape: the
`na_eastern_woodlands` entry is the worked example):

| Field | What | Read by |
|---|---|---|
| `status` | `stub` → `playable` (only once the validator passes) → `rich` | `playableRegions`, `pickLandingRegion` |
| `biome` | the biomes.json id from step 2 | `biome()` |
| `gen` | base map numbers; a landing variant's own `gen` wins | `locParams` |
| `climate.seasons[]` | `{id, days, temp, note, weather:{kind: p}}`; days add to 365; each weather table sums to 1. `clear/rain/cold` have effects today; other kinds (`heat`, `storm`…) are rolled and stored but have no effect yet | `season()`, `rollWeather()` (endDay) |
| `climate.startDayOfYear` | optional; day 1's world day-of-year (default 0). Southern hemisphere is offset half a year automatically | `season()` |
| `fauna.animals` | every animal id that can spawn here | `initTileWildlife` |
| `fauna.add` / `fauna.remove` | ids added to / removed from that pool | `regionAnimalPool` |
| `fauna.density` | multiplies spawn counts (1 = today) | `initTileWildlife` |
| `fauna.fish` | ≥2 fish ids (creek/wetland animals) | `regionFish` (nets, rod, fish duty, water tiles) |
| `fauna.predators` | the land's apex predator(s): answers a missed strike, mauls at range ≤2 | `isRegionPredator` (encounters.js) |
| `fauna.parasites` | `{parasiteId: {meatId: chance}}` | `regionParasiteRisk` (food.js) |
| `flora.trees` | `[{id, roll, nut?}]`: each tree but the last takes its `roll` chance in order; `nut` = the plant it drops | `regionTreeRoll`, `regionTreeNut` |
| `flora.bushes` | ≥2 bush plant ids (equal odds) | `regionBushes` |
| `flora.commonTrees` | tree ids everyone knows at start | `newGame` codex |
| `flora.bounty` | `{epithet: [plantId, why]}` for tile epithets | `bountyFor` |
| `people.language` | a `characterGen.languages` id | (validator; translator later) |
| `people.ruins` | ≥2 ruin stories. Ordinary and specific (§9 Respect) | `genMap` |
| `people.scavenge` | ≥6 `{id, name, kcal, kg, text, rare?, medType?, doses?}`; `rare` items are the medicine-cabinet roll | `regionScavenge`, `scavengeItem` |
| `people.pantry` | starting bags `{name, kcalEach, units, spoilDays, safe, kg, unit, rawKcal?, cookedKcal?, needsCooking?}` | `newGame` |
| `people.villageNames` | ≥4 names for the other fires | `genVillages` |
| `landingVariants` | ≥3 locations.json ids (step 4) | `landingPool` |
| `lifeseedRegions` | ≥1 `lifeseeds.json` region id (hometowns, workplaces) | (validator; lifeseed matching is by `matchTags`) |
| `originTags` | the origin tags that mean "from here" | `originRegionsForTags`, `familiarityTier` |
| `challenge`, `monsters` | the region boss and monster variants (ids must exist in monsters.json) | not read yet |

**6. Origins.** If a city in `originPicker.json` should map here, make sure
`characterGen.originKeywords[<keyword>]` emits a tag listed in this
region's `originTags`. Familiarity follows automatically: same region =
local, same `climateFamily` = visitor, else stranger.

**7. Validate:**

```bash
node scripts/validate-regions.js
```

**8. Smoke sim** (3 seeds × 60 days, capable bot, lands in your region):

```bash
REGION=<id> node scripts/region-smoke.js
# more: REGION=<id> SEEDS=7,42,99,1234,555,777,2026,31337 DAYS=60 ORIGIN="Lagos, Nigeria" node scripts/region-smoke.js
```

To play it in the browser: `index.html?region=<id>` (sets
`Game.debugRegion` for the next new game).

**9. Checks:** `node scripts/check.js --quick`, then write the wave's
balance note in `evidence/<date>/`.

**Not data-driven yet (engine follow-ups):** the bear's maul/roar text in
`encounters.js` still says "bear" for any region predator; tile skins and new
logical tile kinds (§4 #8); monster variants and spawn weights (§4 #20);
weather kinds other than clear/rain/cold have no effects; water abundance
(§4 #7); region `challenge`.
