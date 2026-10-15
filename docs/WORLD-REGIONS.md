# The World — regions, random landings, and the global stage

*2026-10-14. Design for Muse to execute against. Engine pieces marked
**[ENGINE]** are built by Claude now; pieces marked **[CONTENT]** are Muse's.*

> **Engine status (2026-10-14): DONE.** §6 registry, §7 data shape, §8
> validator, the seams in the inventory and the origin vocabulary are built.
> Adding a region is now data only: see **§11**. Proof:
> `scripts/test-region-engine-20261014.js`.
>
> **Follow-ups (2026-10-14): DONE.** First-run landing (Q1), real-date
> season and climate calendars (Q4): `src/data/climates.json`,
> `world.js` (`firstRunLanding`, `regionCalendar`, `calendarStartFor`).
> Proof: `scripts/test-region-start-20261014.js`.

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
| 13 | **Knowledge & familiarity** | Origin vs landing, five tiers (2026-10-14): native (your lifeseed sub-area lists this landing variant) > local (same region) > neighbor (`neighbors`, either side) > visitor (same climate family) > stranger. Each tier's starting plants, plant level, animal naming and home-game depth are data (`characterGen.familiarity`) | `familiarityTier`, `familiarityTierDef`, `plantsByFamiliarity`, `canShow('animal')` |
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

### The Long Way Home: the nomad ending (Steve 2026-10-14)

> "Expedition is leaving your village as a nomad to find remaining family.
> That should be another bonus ending. Seek out and find family according to
> backstory and where they went." / "Yes both groups exist." — Steve

**Who is where:**
- **The Taken** are off-world (`region: null`). Only THE HOSTS brings them
  home.
- **The scattered** are somewhere on Earth. Only the nomad road finds them.

**The choice: leave.** Late game only: available from the global rank, and
only once you know at least one living kin's region. Before that it doesn't
exist in the UI. It's a Haven option like the Table, never a prompt.
- **You walk away.** The village stays and appoints a new leader from its own
  people, by the same rules as the mantle passing. Its fate is played out
  without you and told in the epilogue. Leaving a strong village is a quiet
  goodbye; leaving a starving one is abandonment, and the ledger remembers.
- **Who comes with you:** a small party of volunteers. Villagers with
  scattered kin of their own volunteer first: parity, they want their
  families too. The party uses finale-march rules: muster, upkeep, food
  carried, the dead stay dead.
- **Leaving gives up the Table** (`tableFail('left')` style), and the Table
  can't be entered while you're on the road. The nomad road is its own ending,
  not an add-on to a Table path.

**The road: legs, one region each.**
1. **Where to go comes from backstory.**
   - Each kin's lifeseed (hometown, workplace, the fate line such as
     "somewhere west, last anyone knew") plus their world region give a
     *trail*.
   - The first clue is vague: the continent or the neighbors.
   - Clues sharpen with keepsake bond. A worn keepsake of that person at L2+
     names the region.
   - People met on the road sharpen them too: a foreign village, a survivor,
     an alien broadcast.
2. **Each leg** generates that region's 9×9 map with the region engine, where
   you live as nomads for days or weeks:
   - forage what you don't know, since you're a stranger here
   - meet the local village (trade, fight, or join briefly)
   - waves still come, because the System's show runs everywhere
3. **Finding them:** a reunion scene. Fates come from the backstory and the
   run:

   | Fate | What happens |
   |---|---|
   | Alive | They join the party |
   | Changed | They lead a village, ascended, or are hostile: a choice, sometimes a fight |
   | Already dead | Their grave, and a keepsake you can now complete |
   | They moved on | The trail continues |

**The ending: "The Long Way Home."** It's reached when you find every living
scattered kin you can, or choose to stop and settle where you are.
- **Light (you found them and made a new home):** "We were never lost; we
  were just far apart."
- **Dark (you left a village to die to do it):** you have your family, and
  you know what it cost.
- Party members' found kin appear in the epilogue too.

It's still losable: the party can starve or be wiped on the road. The mantle
passes inside the party; if no one is left, the road ends.

**How it connects to the rest:**
- **Keepsakes:** they finally go somewhere. Bond sharpens the trail, and a
  reunion completes or evolves them.
- **Regions:** this is the reason to visit them. It's also the strongest test
  of "a stranger in a strange land".
- **Villager parity:** villagers seek their own kin too. One may ask leave to
  go, or join you.
- **Builds:** field, social and strange builds are best on the road; combat
  builds keep the party alive.
- **THE HOSTS:** brings home the Taken. Combining both (the key *and* the road)
  is the open question in §10.

**Needs content:** at least 2 more playable regions (wave 1). The engine can
be built against fixture regions before then.

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

## 10. Questions for Steve

1. **ANSWERED.** Random landing everywhere from run 1, or familiar first?
   Steve: "Maybe first run let them land in the origin they choose a
   character from. Random after."
   **Built:** a device's first run lands in the player's origin region when
   it is playable; otherwise the nearest playable region (same
   `climateFamily`, then same continent, the origin's neighbors first, then
   `na_eastern_woodlands`). Later runs are random among playable regions.
   `Game.debugRegion` / `?region=` still wins. "First run" = no run counted
   under localStorage `oversight.runs.v1` and no save or tombstone on the
   device (so people who already played aren't treated as new). The meta
   store (`oversight.meta.v1`) is not used: it promises newGame never reads
   it. Telemetry `region_start.why` = `first_run_origin` (with `via`:
   `origin`/`climate`/`continent`/`default`/`no_origin`) | `random` |
   `debug`. Today only the eastern woodlands is playable, so every first run
   still lands there.
2. **ANSWERED.** The Taken vs the scattered: Steve: "Yes both groups exist."
3. **ANSWERED (not built here).** Expeditions: Steve: "Expedition is leaving
   your village as a nomad to find remaining family. That should be another
   bonus ending. Seek out and find family according to backstory and where
   they went."
4. **ANSWERED.** Does the region change the year? Steve: "Yes that's okay to
   run a wet/dry year. Whenever the player starts, should be the season the
   game starts in. Like it happened right when they started playing, for
   immersion."
   **Built:** climate calendars per `climateFamily` in
   `src/data/climates.json` (four-season, continental, Mediterranean,
   boreal long winter, arid hot/cool, savanna wet/dry, tropical wet/dry,
   monsoon hot/wet/cool, highland wet/dry, summer-rain wet/dry). Day 1's
   season is the real-world season (UTC date) at run start for the landing
   region, saved as `state.calendarStart`. Seasons then advance with game
   days. Saves from before this keep the old rule (day 1 = the first day of
   spring). The eastern woodlands' weather tables are unchanged, so only
   the season label moves. Same 16 seeds × 60 days, capable bot: identical
   runs (`evidence/2026-10-14/region-start.md`).

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
| `climate.calendar` | a `src/data/climates.json` calendar id (default: `familyCalendar[climateFamily]`). Gives the month map (real month → season) and, if the region lists no seasons, the seasons too. Every stub already names one | `regionCalendar`, `calendarStartFor` |
| `climate.seasons[]` | optional override of the calendar's seasons: `{id, days, temp, note, weather:{kind: p}}`, in year order; days add to 365; each weather table sums to 1; ids must match the calendar's month map. `clear/rain/cold` have effects today; other kinds (`heat`, `storm`…) are rolled and stored but have no effect yet | `season()`, `rollWeather()` (endDay) |
| `climate.months` | optional: 12 season ids, Jan..Dec, in this region's own (local) frame. Overrides the calendar's month map. Calendar month maps are written for the north; a southern region reads them six months on | `regionCalendar` |
| `climate.startDayOfYear` | legacy: day 1's day-of-year for saves from before the real-date start (and regions with no month map). New runs start on the real-world season | `season()` |
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

**6b. Climate calendar.** Most regions only need `climate.calendar` (already
set on every stub). To write a new calendar, add it to
`src/data/climates.json`: seasons in year order (days add to 365, weather
sums to 1) and a 12-month `months` map (northern frame) where each season is
one unbroken run of months, in season order. The validator checks all of it.

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
