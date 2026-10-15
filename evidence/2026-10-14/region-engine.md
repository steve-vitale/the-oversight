# Region engine — proof notes (2026-10-14)

Design: `docs/WORLD-REGIONS.md` (engine items now marked done; Muse checklist §11).
Inventory: `evidence/2026-10-14/world-inventory.md`.

## What was built

| Piece | Where |
|---|---|
| 20-region world list; eastern woodlands holds today's environment as data; 8 old US regions kept as `seedData` | `src/data/regions.json` |
| Seams: `state.region`, landing pick, `biome()`, wildlife pool/density, fish, predator, parasites, trees/nuts, bushes, common trees, bounty, ruins, scavenge, pantry, village names, weather by season | `src/js/game.js` (`regionDef` … `rollWeather`), `encounters.js`, `food.js` |
| Debug override | `Game.debugRegion`, `index.html?region=<id>` |
| One origin vocabulary + familiarity by region | `parseOrigin().regions`, `originRegionsForTags`, `familiarityTier` |
| World registry + kin | `src/js/world.js` |
| Keepsake thread names the kin region once known | `keepsakes.js keepsakeClues` |
| Validator / smoke sim | `scripts/validate-regions.js`, `scripts/region-smoke.js` |
| Proof test | `scripts/test-region-engine-20261014.js` (92 checks) |

## Zero behaviour change (the seams commit)

Method: same 8 seeds (7, 42, 99, 1234, 555, 777, 2026, 31337), origin
"Columbus, Ohio", capable bot, 60 days, harness `scripts/sim-harness.js`.
Before = `origin/master` at c25dd26c, after = the seams commit 75ceb5f4.
Compared per seed: landing, genMap tiles (types, wildlife, stock, loot,
ruin story), starting pantry, the whole map after 60 days (lazy detail
grids: tree/bush/plant species), the telemetry type/day stream, end
reason, population, deaths, pantry kcal, codex size, and an md5 of every
top-level state key (minus `pacing`, which is wall-clock and differs
run-to-run on the same code).

Result: **identical on all 8 seeds, every field, every state key.**

## Deliberate changes after that

**Familiarity (origin region vs landing region).** Columbus/Ohio stays
local. Miami, Chicago, Houston, New Orleans, Brooklyn and rural Vermont go
stranger → local; Portland goes local → visitor; Berlin, Warsaw, Kyiv,
rural Ireland, Tokyo and Seoul go stranger → visitor. Everyone else stays
stranger. Starting known plants follow the tier (3/2/1), so runs with an
affected roster NPC diverge.

24 seeds × 60 days, capable bot:

| | survived | pop | deaths | pantry kcal | codex |
|---|---|---|---|---|---|
| before | 23/24 | 7.4 | 24.0 | 59,695 | 24.1 |
| after familiarity | 20/24 | 7.0 | 25.5 | 56,727 | 24.6 |

Per-seed population ranges from 1 to 11 in both columns. The difference
is within that spread, but a larger sweep should confirm it.

**region_start telemetry.** The extra `tele()` call takes one tick of the
harness's counting `Date.now`, which shifts every timestamp-derived id
by one. Game RNG is untouched. Seven of 8 seeds keep identical run
metrics. Seed 777 diverges through id-order-sensitive conversation line
picks. This is a harness clock artifact; in the browser `Date.now` is
wall-clock anyway.

## Origin → region (all 47 picker labels)

N. America: Portland → na_boreal_pacific; Miami, Chicago, Houston (tie
with plains/arid; first listed wins), New Orleans, Brooklyn, rural Vermont →
na_eastern_woodlands; Tucson → na_arid; Mexico City → mesoamerica_caribbean.
S. America: São Paulo → sa_amazon; Buenos Aires, Montevideo →
sa_pampas_patagonia; Lima, Bogotá, Quito, La Paz → sa_andes; Caracas →
mesoamerica_caribbean. Europe: Berlin, Warsaw, Kyiv, rural Ireland →
eu_temperate; Oslo → eurasia_taiga; Istanbul (tie with mena), Rome →
eu_mediterranean. Africa: Lagos, Nairobi, Accra, Kumasi, Addis Ababa,
Dakar, Dar es Salaam → africa_sahel_savanna; Cairo → mena_desert;
Marrakech, Casablanca → eu_mediterranean. Asia: Tokyo, Seoul → east_asia;
Mumbai, Dhaka → south_asia; Jakarta, Bangkok, Manila, Hanoi →
southeast_asia. Oceania: all five → oceania.

## Known gaps (logged, non-critical)

- The eastern woodlands `fauna.animals` lists all 48 animals, because
  today's map spawns bison, javelina, alligators and pythons in Georgia
  creek country. Trimming that list is a content call, and it changes
  behaviour.
- The maul/roar text in `encounters.js` says "bear" for any region predator.
- Weather kinds other than clear/rain/cold are rolled and stored but have no
  effect yet. Tile skins, monster variants, water abundance and region
  `challenge` are not read yet.
- Kin who died before the sky changed (lifeseed fates with "buried" or
  "died") are not placed in the world.
