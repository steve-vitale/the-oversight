# nomad-wild: leg content for The Long Way Home (2026-10-15)

Worker stream: leg content. Sibling (nomad-core) owns `src/js/nomad.js` (road
state) — not yet landed; this module guards every sibling access and tests
against a stubbed `state.road`.

## What was built — src/js/nomad-wild.js (new, ontology system #111)

**Party forage as strangers** (`partyForage`, `strangerForageMult`):
- Each member yields ~1200 kcal/day × knowledge factor × 0.75 stranger mult.
- Stranger = knows <3 of the leg region's plants → 0.5 knowledge factor;
  rises toward 1.0 as they learn. Handling teaches: one new leg-region
  plant per member per day (via `bumpPlantFamiliarity`).
- Kcal feeds `state.road.supplies`; honest narration ("nothing familiar").

**Foreign-village encounters** (`genLegVillage`, `tradeWith`, `fightVillage`, `joinVillage`):
- One village per leg: name from region village names, 6-10 pop, pantry,
  mood (-2..2, starts wary), and a named speaker with a role — people, not
  spreadsheets.
- Trade: barter pack kcal for village kcal at mood-driven rates (wary 0.8 →
  warm 1.4); warm villages sometimes teach a local plant (knowledge is the
  real trade good). Refuses honestly when broke or pantry empty.
- Fight: real blow-by-blow via `Game.fieldFight` (party fighters vs village
  defenders); winning raids the pantry but the moral ledger remembers;
  losing costs 25% of packs. Never an outcome table.
- Join briefly: rest up to 7 days, resupply from their pantry, mood decays
  with lingering; hostile villages refuse.

**Waves still come** (`legWaveLevel`): unlocks key off day floors + kill
ledger, which the road never bypasses — verified readable on legs.

**Travel events** (`travelEvent`): one beat per departure — weather (kcal
effects), a stranger on the road (names a scattered kin; calls
`Game.nomadScenes.sharpenTrail` guarded), or an alien broadcast.

**Daily tick** (`daily`): forage → supplies; party eats 2000 kcal/mouth;
starvation narrated honestly (never silent), supplies floored at 0; joined
village ticks down; wave level reported. Called from sibling's
`nomad.daily()` when it lands.

## Proofs (all RED→GREEN)

- `scripts/test-nomadwild-forage.js`: 9/9 — stranger mult 0.75, supplies
  grow, knowledgeable party out-forages strangers, handling teaches.
- `scripts/test-nomadwild-village.js`: 17/17 — village generates as people;
  trade/trade-refusal/join/refusal all narrate with village+speaker names.
- `scripts/test-nomadwild-travel.js`: 17/17 — 3 event kinds; sharpenTrail
  guarded (no crash without sibling); called with kin name when present.
- `scripts/test-nomadwild-waves.js`: 10/10 — wave level tracks unlocks;
  daily eats, starves honestly, floors at 0.
- Sense check: full transcript read — party/village/broadcast lines have
  voice and name their subjects; no fabricated history.
- RED demonstrated by running all four with the module removed
  (Game.nomadWild undefined → TypeError); GREEN after restore.
- `node scripts/check-wired.js src/js/nomad-wild.js`: 0 unwired.
- `node scripts/validate-ontology.js`: 111/111 systems.

## Notes / gaps

- `genLegVillage` reads `regionVillageNames()` from the ACTIVE region; the
  sibling's `enterLeg` should set `state.region` to the leg region first
  (noted for nomad-core).
- `fightVillage` not yet covered by a live-fight proof test (fieldFight
  needs full combat setup); the path is wired and guarded. A fight proof
  should ride along with nomad-core's integration test.
- Did not touch: godpaths.json, table-endings.json, godpath scripts,
  godpath.js, godhood.js (Codex's lane).
