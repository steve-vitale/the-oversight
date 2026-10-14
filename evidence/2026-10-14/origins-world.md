# Origins ↔ world regions in sync — proof notes (2026-10-14) [needs-eyes]

> "Yes the local visitor map looks okay just maybe not granular enough or
> synced to our available starting options. Flesh out where it needs to be to
> make sense, either with starting characters or new locations to originate."
> — Steve (STEVE-ANSWERS round 3). Eastern fauna trim: approved, same round.

Proof: `scripts/test-origins-world-20261014.js` (green list, quick; 69 checks).
Validator: `node scripts/validate-regions.js` now checks origin coverage.

## 1. Origins cover the world (47 → 69 picker labels)

Every picker label's keyword carries its region id (`originKeywords`), and a
region-id tag claims that region outright (+100 in `originRegionsForTags`), so
every label maps to exactly one region, no ties. The validator enforces it.

| Region | Picker origins |
|---|---|
| na_eastern_woodlands | Miami, Chicago, Houston, New Orleans, Brooklyn, rural Vermont |
| na_plains | **Omaha**, **Winnipeg** |
| na_arid | Tucson, **Phoenix**, **Monterrey** |
| na_boreal_pacific | Portland, **Vancouver**, **Anchorage** |
| mesoamerica_caribbean | Mexico City, Caracas |
| sa_amazon | **Manaus**, **Iquitos**, **Belém** |
| sa_andes | Lima, Bogotá, Quito, La Paz |
| sa_pampas_patagonia | Buenos Aires, Montevideo, São Paulo (moved off the Amazon) |
| eu_temperate | Berlin, Warsaw, Kyiv, rural Ireland |
| eu_mediterranean | Rome, Istanbul (tie with MENA resolved), Marrakech, Casablanca |
| eurasia_taiga | Oslo, **Arkhangelsk**, **Novosibirsk** |
| mena_desert | Cairo, **Riyadh** |
| africa_sahel_savanna | Lagos, Nairobi, Accra, Kumasi, Addis Ababa, Dakar, Dar es Salaam |
| africa_congo | **Kinshasa**, **Kisangani** |
| africa_southern | **Johannesburg**, **Cape Town** |
| south_asia | Mumbai, Dhaka, **Delhi** |
| central_asia_highlands | **Almaty**, **Astana** |
| east_asia | Tokyo, Seoul, **Beijing**, **Shanghai**, **Chengdu** |
| southeast_asia | Jakarta, Bangkok, Manila, Hanoi |
| oceania | Auckland, Sydney, Melbourne, Wellington, rural New Zealand |

Deliberate calls:
- Houston is the Gulf Coast woodlands (bayou country), with its own lifeseed
  sub-area (`gulf_coast`, plus Galveston/Beaumont/Port Arthur). Before, it
  tied three regions, and its backstory came from the Southwest.
- São Paulo goes to sa_pampas_patagonia. It has a humid-subtropical climate
  like Buenos Aires, and its lifeseed sub-area is São Paulo state. It is not
  a perfect fit (Atlantic forest); see NEEDS-STEVE.
- "Iquitos" contains "quito". Quito's region tag sits on the `ecuador` keyword
  instead, and the validator caught the clash.

**Data per origin:**
- Six new name cultures: chinese (Mandarin), russian (Russian), congolese
  (French), south_african (English), kazakh (Russian), saudi (Arabic). Each
  has ≥150 real first names and ≥150 real surnames.
- No new language: 25 is still pinned.
- Cultures can list their female names (`fem`), so pronouns are no longer
  guessed for them. `femSurname: slavic` gives Anna Ivanova.
- 33 new appearance pools: the 22 new labels plus 11 old picker labels that
  had none. Each has ordinary clothing, ≥5 items.
- Four new heritageMap tags.
- `culturePlaces` (bgHome) moved from code into nameCultures data.

## 2. Lifeseeds for the world

`lifeseeds.json` gained 52 sub-areas, so every world region has at least one.
- Each sub-area has a `worldRegion`, real towns, ordinary workplaces, and an
  `origins` list (the picker labels it owns).
- US entries got `worldRegion`. The eastern ones also got `landings`.
- Brooklyn had fallen through to `far_away`. It now has `new_york_metro`.

`lifeseedRegion` resolves in this order:
1. The exact label.
2. Sub-areas of the origin's world region, by matchTags.
3. Global matchTags.
4. `far_away`, now only the last resort.

The hometown always comes from the character's own region. Towns were chosen
to avoid the background-audit C9 false positives: no town shares a name with
a culture name or a heritage city. The proof test checks the second.

## 3. Starting characters span the world

- `sampleOrigins` now lists all 69 cities.
- `npcOriginPick` draws region-first: every region is equally likely, then a
  city inside it. It uses ONE RNG draw, the same budget as the old uniform
  pick. Over 3000 draws all 20 regions appear and none passes 8%.
- Background survivors: three new ones, from Kinshasa, Almaty and Omaha.
- Survivors with a known home speak their home's language. Before, the
  surname decided it: Sofia Chen from Shanghai was English-only. A surname
  from elsewhere is now the family's heritage language.

## 4. Granular familiarity (data: `characterGen.familiarity`)

| Tier | Rule | Plants | Codex level | Animal names | Home-game depth |
|---|---|---|---|---|---|
| native | your lifeseed sub-area lists THIS landing (e.g. New Orleans → cypress_slough; Chicago → hay_field) | 4 | 2 | every common animal of the landing pool | L1 on the common pool |
| local | same world region | 3 | 1 | landing pool | — |
| neighbor | `regions[].neighbors`, either side | 2 | 1 | continent rule (old) | — |
| visitor | same climateFamily | 2 | 1 | continent rule | — |
| stranger | anything else | 1 | 1 | continent rule | — |

What changes:
- Portland in the eastern woodlands moves from visitor to neighbor (the
  region-engine test was updated). The counts didn't change.
- Old saves (no `scholar.famTier`) keep the old animal rule.
- Eastern landing variants by sub-area:
  - new_england: alder_marsh, beaver_pond, mill_town, lookout_tower, orchard_row
  - deep_south: pine_flat, pecan_grove, swamp_hummock, cypress_slough, creek_bottom, market_row
  - midwest: hay_field, grain_silo, rail_yard, floodplain, school_yard
  - mid_atlantic: ridgeline, river_bluff, mill_town, lookout_tower, quarry_edge, junkyard_edge
  - florida: swamp_hummock, pine_flat, cypress_slough
  - ozarks: river_bluff, limestone_glade, cedar_thicket, old_campground
  - great_lakes: beaver_pond, alder_marsh, rail_yard, warehouse_row
  - gulf_coast: cypress_slough, swamp_hummock, floodplain, warehouse_row
  - new_york_metro: subway_cut, warehouse_row, rail_yard, old_suburb, hospital_grounds
- The sim harness origin, Columbus, is native on the five midwest landings
  and local on the rest.

## 5. Eastern fauna: real eastern species only

- The base list went from 48 animals to 34.
- Moved to their own regions (stub fauna, not playable yet):
  - bison, pronghorn, prairie dog → na_plains
  - javelina, roadrunner, gila monster → na_arid
  - Roosevelt elk, spotted owl, moose, snowshoe hare → na_boreal_pacific
- Landing variants add their own animals (`fauna.variants`, read by
  `regionAnimalPool`):
  - cypress_slough and swamp_hummock add the alligator and nutria
  - alder_marsh and beaver_pond add moose and snowshoe hare
- Florida panther and Burmese python have no eastern home until a Florida
  (Everglades) landing exists.
- Trichinosis is data: eastern boar 0.25 and bear 0.35; javelina only in
  na_arid. The literal fallback table is used only when no regions.json is
  loaded.

Bug found and fixed along the way:
- `simEcology`'s daily re-seed let ANY biome-matching animal "wander in" and
  ignored the region pool, so bison would have come back within a season.
  It now honours the pool.
- Other villages' animal lore does too.

## 6. Validator (`validate-regions.js`)

Every region has:
- ≥2 picker origins
- a lifeseed sub-area
- a name culture

Every picker label:
- names exactly one region id and resolves to it with no tie
- is owned by exactly one lifeseed sub-area in that region
- has a culture

Lifeseed landings must be the region's landing variants.
`fauna.variants` must be landing variants with real animals.
The familiarity block must list the five tiers.

## 7. Sims: 8 seeds × 150 days, capable bot (Columbus)

| | won | medD | maxD | maxWave | nat% | inv% | sat% | delib/d |
|---|---|---|---|---|---|---|---|---|
| before (149b2c4a) | 4/8 | 97 | 150 | 5 | 75 | 50 | 50 | 63 |
| after | 4/8 | 100 | 150 | 5 | 88 | 50 | 50 | 63.4 |

Per seed:
- Different seeds win: before 42, 777, 2026, 31337; after 7, 42, 1234, 2026.
- Seed 555 lives 51 → 88 days. Seed 777 goes 100 → 77.

The roster's RNG draws changed, so every seed lands somewhere else. The
spread is per-seed noise, with no direction.
- Player deaths by dehydration: 0 → 5 runs.
- Villager thirst deaths: 1 → 0.

That is worth a larger sweep before reading anything into it.

## 8. Tests touched (deliberate change, same commit)

Every one below broke because a fixed seed now draws a different roster,
landing or map. The fix pins the state the test needs; no assertion was
loosened.
- test-region-engine: 47 → 69 labels; Portland neighbor; the fixture brings
  its own picker/lifeseed/culture data.
- test-barrier-grid-bound: a village sat on the crossing tile.
- test-parity: the "weakest" is judged at resolve time.
- test-phoenix-gear: pin the burn victim.
- test-brawler-proof: one cautious yielder.
- test-journey-deepening: warm listener.
- test-favor-system: shared language.
- test-inffight-class: the old ≤30 total-damage proxy is replaced by "no
  damage after the opening" (stricter).
- test-aid-comms: talker ≠ weakest.
- test-break-food: strip the occupation's preserve_food skill.
- test-convo-engine-taught: calm needs, clear the replanted seed.
- test-break-social-r12: steady first hearer.
- test-contend-arc: game text fix, below.
- test-dialog-phase2: a fresh convo resets exchanges.
- test-dps-race-r1: seeds re-derived: 11→13, 22→23, 44→46.
- test-drifter-link-courtship: compares means over 40 calls; the single
  calls compared noise from an un-reseedable RNG.
- test-est-settled-favor-engage: steady voice.
- test-forager-strip-regrow: no open quest mid-measure.
- test-miser-cache-honesty: the rotten item is really past date.
- test-practice-deeds: no starting stalk/track skills.
- test-scalecourt-climb: only the target village is known.
- test-social-animals: stranger tier, no tracker background.
- test-social-gossip: retell until fragments fire.
- test-socialite-r9: daylight steal.
- test-trapline-set: pin the craft roll.
- test-trust-news-witnesses: pick a traveller.
- test-village-animal-depth: rabbits on the hunting ground.
- test-worldedge-9x9: open ground at (8,4).

Small game fixes those tests exposed:
- `pickFresh` no longer opens a new cycle with the line that closed the last
  one (an immediate verbatim repeat).
- The second contender-leave line now says they take only their own things.
- A tactic-only monster move with no damage range (the landlord's
  Jurisdiction Spread) no longer throws mid-turn.

`check.js` (full): green except:
- known reds: godpath/validate, godpath/ladder
- flaky under load, each passes standalone: deterministic-clock,
  simopt-trajectory, examine-recognition, past-deflect-gate, hunter-ecology
- test-charactergen-appearance: it diffs against HEAD ("no pools added") and
  passes once committed

## Known gaps (non-critical)

- `regions.json` `lifeseedRegions` was not edited (coordination: only
  originTags/fauna/neighbors). lifeseeds' `worldRegion` is authoritative. A
  mismatch is a validator warning.
- No new languages, so these two use Russian, a real everyday language of
  both cities: Kazakh speakers (Almaty, Astana) and Mongolia. Kathmandu and
  Ulaanbaatar are background-survivor homes only, mapped to central Asia.
- Some old picker labels still borrow a neighbour's culture:
  - Dakar uses ghanaian; Dar es Salaam uses kenyan
  - Quito and La Paz use peruvian; Montevideo uses argentine
  - Sydney and Melbourne use newzealander
- Tbilisi, Georgia (a background survivor) still reads as the US state.
