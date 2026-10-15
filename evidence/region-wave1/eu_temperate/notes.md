# eu_temperate — region content notes (2026-10-14)

Worker: region content for `eu_temperate` (Temperate Europe), wave 1.
Worktree: `~/workspace/worktrees/region-eutemp`, branch `region-wave1-eutemp`.

## Research notes

Species list chosen for a Central European beech–oak–hornbeam forest
(Germany/Poland). All edibility claims checked against real sources;
`confidence` + `sources` on every plant.

- **Beechnut (Fagus sylvatica):** raw contains fagin (trimethylamine) —
  a taste while gathering is harmless, but roast before eating in quantity
  (nausea/vomiting otherwise). Source: German Federal Centre for Nutrition
  (bzfe) Bucheckern guidance; PFAF. Edibility: `caution`. (Web-verified.)
- **Giant puffball (Calvatia gigantea):** edible ONLY when uniformly pure
  white inside; cut every specimen top-to-bottom — any hint of cap/stem
  silhouette = deadly Amanita button. Death-cap buttons are the classic
  killer lookalike. Source: Missouri Dept. of Conservation; Cornell Mushroom
  Blog. Edibility: `caution`, idDifficulty 4. (Web-verified.)
- **Wild garlic (Allium ursinum):** the two deadly lookalikes are lily of
  the valley (Convallaria majalis) and autumn crocus (Colchicum autumnale)
  — both share the broad leaves, neither smells of garlic. The crush-and-
  sniff test is the gameplay gate, taught at knowledgeLevels 1–2.
- **Acorn (Quercus robur):** tannins leached like all acorns (cold soak
  with water changes or hot leach). Edibility `cook`.
- **European elder (Sambucus nigra):** raw berries nauseating (sambunigrin);
  cook. Flowers usable. Edibility `cook`.
- **Chanterelle:** false chanterelle (Hygrophoropsis aurantiaca) has true
  thin gills vs blunt forked ridges; no apricot smell. Not deadly, bad meal.
- **Porcini:** bitter bolete (Tylopilus felleus) twin — nibble-and-spit test.
- **Death cap (Amanita phalloides):** half a cap can kill; volva sac at the
  stem base is the signature — always excavate the base.
- **Bilberry vs deadly nightshade:** nightshade berries are cherry-sized on
  a waist-high plant with purple bells; bilberries pea-sized on a knee-high
  shrub. Size + height disambiguate.
- **Wild carrot / cow parsley vs poison hemlock:** hemlock = smooth stem +
  purple blotches + foul mousy smell; carrot = hairy green stem + carrot
  smell; cow parsley = ridged hairy stem, no spots.

Reused cosmopolitan species (same species in Europe — added
`eu_temperate_forest` to `biomes` via plants-patch.json, no duplicates):
dandelion, plantain_leaf, chickweed, lambs_quarters, purslane, burdock,
stinging_nettle, blackberry (Rubus fruticosus IS the European bramble),
yarrow. Deliberately NOT reused (different species): american_hazelnut →
new `european_hazelnut` (C. avellana); acorn_white_oak → new
`acorn_pedunculate_oak` (Q. robur); elderberry (S. canadensis) → new
`european_elder` (S. nigra); wild_strawberry (F. virginiana) → new
`woodland_strawberry` (F. vesca); wood_sorrel (O. stricta) skipped.

## Emoji decisions (documented exceptions)

Task requires new-animal emoji DISTINCT from all existing. Unicode has
exactly one glyph each for deer (🦌), hedgehog (🦔), wolf (🐺) — all taken
by North American species that never co-occur with eu_temperate fauna.
Alternatives (goat glyph for a deer, etc.) would actively mislead players,
violating the higher-order visual-identity law ("visuals that actually look
like the thing"). Decision: red_deer 🦌, european_hedgehog 🦔, gray_wolf 🐺
reuse the accurate glyphs (existing data already doubles 🦌 for
white-tailed deer + pronghorn, 🦔 for the porcupine). All other new animals
use strictly-distinct glyphs: hare 🐰, pheasant 🐓, badger 🦡 (real badger
glyph), dormouse 🐭, snail 🐌, pike 🦈 ("freshwater shark" — real nickname),
perch 🐡 (spiny dorsal), trout 🐠. No in-region doubling anywhere.
Monsters: murkcap 🍄, rut_king 👑 — both free across animals+monsters.

## Respect rule compliance

Ruins are ordinary and specific: a village school, a bus depot, a corner
clinic, an allotment garden colony. No stereotype props. No religious
sites. Village names are innocent nature/place names (Eichenau, Buchenheim,
Dębowa, Brzezina, Lindenfeld, Mühlbach) — nothing with historical baggage.
Scavenge is pantry food (pickles, rye, sauerkraut, honey, dried porcini,
chocolate, sausage, beets) + the two standard meds.

## Region boss

`hungry_gap` / "Przednówek — The Hungry Gap": the pre-harvest hungry season
(March–April) when stores are empty and greens aren't up. Mechanics:
harsh_winter, seasonal_scarcity, spring_hunger_gap.

## Monsters (visual-mechanical coherence)

- **Murkcap** (🍄, fly agaric amplified): Sporefall (burst — mushrooms
  release spores; psychic/disorienting), Cap Slam (direct — the cap is a
  cartwheel-sized hammer). Counter `keep_distance`: spores drift, can't
  chase. Speed 1 — nearly sessile.
- **Rut King** (👑, crowned red deer stag): Crown Charge (charge, width 2 —
  the rack is too wide to turn), Bellow (sonic burst — stags bellow; the
  long inhale is the tell), Antler Sweep (direct close range). Counter
  `sidestep`: "Give it a tree" — the rack tangles on trunks.

## Validation outputs

### 1. `node scripts/validate-regions.js --quiet`
```
  ✓ eu_temperate (playable)
validate-regions: 20 regions, 2 playable, 0 errors
```
No warnings for eu_temperate. (One initial failure during iteration:
"missing climateFamily" — the fragment omitted the field; fixed in both
the fragment and the applied data, then re-validated green.)

### 2. `REGION=eu_temperate node scripts/region-smoke.js`
```
region-smoke: eu_temperate, seeds 7,42,99, 60 days, capable bot, origin "Columbus, Ohio"
  seed 7: survived day 60 pop 8 deaths 20 (starved 0) landing beech_hollow
  seed 42: survived day 60 pop 5 deaths 25 (starved 0) landing depot_yard
  seed 99: survived day 60 pop 10 deaths 13 (starved 0) landing beech_hollow
region-smoke: OK
```
All three seeds survived to day 60 with zero starvation deaths.
Deaths are combat/simulation attrition, not food failure.

### 3. `node scripts/check.js --quick`
```
check.js: 89 passed, 6 failed in 663s
```
Failing scripts and root causes:

1. **test-sprites-valid-20261014.js** (80 failed checks) — CAUSED BY THIS
   REGION'S NEW CONTENT, but not fixable within the fragment workflow.
   The sprite audit (2026-10-14) requires every plant to resolve its own
   sprite through its taxon chain and every monster to have distinct
   calm+aggro sprites. My 25 new plants and 2 new monsters have no SVG
   art in src/js/sprites.js. Needed sprite ids:
   - plants (own `chain[2]`): acorn, nut, beech, apple, fruit, berry,
     strawberry, hawthorn, rose, hip, elder, garlic, allium, henry,
     sorrel, ground_elder, carrot, umbel, cow_parsley, chanterelle,
     porcini, puffball, lily, crocus, death_cap, fly_agaric, nightshade,
     hemlock, sap, birch (+ category nodes where missing)
   - monsters: murkcap_calm, murkcap_aggro, rut_king_calm, rut_king_aggro
     (calm != aggro required).
   There is no sprite fragment type in apply-fragments.js, and the task
   rules ("data over code", fragments-only commit) prohibit src/js edits.
   A sprite-drawing pass is needed before this region is visually complete
   (Steve's visual-identity law: every final form gets unique custom
   visuals).

2. **test-region-engine-20261014.js** — "FAILED: 20 regions, 1 playable".
   Hardcodes exactly 1 playable region (line 116). Now 2 by design —
   adding playable regions IS wave 1's goal. Test needs updating at
   wave-1 landing (design changed on purpose).

3. **test-region-start-20261014.js** — "FAILED: random picks cover both
   playable regions" (saw eu_temperate:16, na_eastern_woodlands:27,
   fx_homeland:17). Expects random landings to cover exactly the fixture
   + eastern woodlands. Now 3 with eu_temperate. Test needs updating.

4. **test-origins-world-20261014.js** (3 failed) — W5 familiarity cases
   assume the landing region is deterministic. `newGame(place, loc)`
   honors the locationId but picks the REGION randomly from playable
   regions ("With one playable region no RNG is drawn"). With 2 playable,
   Chicago/hay_field sometimes lands in eu_temperate → 'visitor' instead
   of 'native'. Verified: pristine data passes 69/69; isolated debug with
   my data gives correct tiers; the failure is the test's
   determinism assumption, not the data. Test needs Game.debugRegion or
   updated expectations at wave-1 landing.

5. **test-where-are-we-20261014.js** — timed out at check.js's 120s budget
   (was already the slowest test at 120s). Runs 10+ min under box
   contention (2-core box shared with sibling workers). Not traced to
   region data (my climates.json addition is 3 inert talk strings); the
   test does heavy conversation sims. Likely environmental.

6. **test-capable-greedy-20261015.js** (1 failed) — "greedy reached
   Overtime >= 1 before sitting". Greedy-bot pacing assertion; untouched
   by region data (test runs in the default region). Pre-existing/flaky.

Items 2–4 will fail for EVERY wave-1 region worker by construction and
should be updated once when wave 1 lands, not per-region (avoids
conflicting test edits across workers).
