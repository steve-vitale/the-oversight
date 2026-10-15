# nomad-core: The Long Way Home road state machine (2026-10-15)

Worker stream: road state machine for the nomad ending (docs/WORLD-REGIONS.md §6).
Worker C owns the ending scene; Worker B owns road gameplay/UI. This stream is
the state machine + Game.nomad API they build on.

## What was built

**New module `src/js/nomad.js`** (@ontology `system: nomad`, 111/111 validated):
`Game.nomad = { canLeave(), start(), addLeg(regionId, kinName), enterLeg(i),
departLeg(), daily(), endRoad(reason), party(), endingData(), onRoad(),
markKinFound(name, relation, fate), addFood(kcal), nomadKill(id, cause) }`.

`state.road = { active, partyIds, bearerId, fallen:[], supplies:{food},
legs:[{regionId, kinName, status}], legIndex, daysOnRoad,
villageLeft:{leaderId, leftDay, strength, abandoned, fate, fateLine},
foundKin:[], log:[], endReason, tableGivenUp }`.

**Wiring:**
- `index.html`: nomad.js loads after world.js.
- `src/js/game.js` `endDay()`: guarded 3-line hook — `if (nomad.onRoad()) nomad.daily()`.
  Verified live: one endDay ticked daysOnRoad 0→1, food 24000→16000 (4×2000).
- `check-wired.js src/js/nomad.js`: 0 unwired.

**Haven leave option:** `canLeave()` is the gate — `{ok}` only at global rank
(`scaleRank()==='global'`) with ≥1 living scattered kin whose region is known
(state.world). Otherwise `{ok:false, reason:'rank'|'no_known_kin'|'on_road'}`.
The DOM Haven menu (app.js) is Worker B's stream; it reads canLeave() to
show/hide. Before the gate passes, the option does not exist in the UI.

## Spec compliance (WORLD-REGIONS.md §6)

- Leave: `start()` calls `tableFail('left')` (guarded), sets tableGivenUp.
- Village: appoints highest-trust stayer as leader (mantle rule: trust decides,
  proven: leader === sorted-by-trust stayer). Departure strength recorded;
  fate resolves at endRoad: thrived/survived/fell + fateLine for the epilogue.
- Abandonment: leaving with <7 days of village food stores = abandonment;
  recorded via `ledgerAdd('nomad','left:abandoned'|'left:quiet')` (ledgerEvents).
  Dark ending iff village fell or abandoned.
- Party: bearer (player) + up to 3 volunteers; villagers with scattered kin of
  their own volunteer first (parity). Carries ~30% of pantry in whole items.
- Legs: addLeg validates region + no dupes; enterLeg switches state.region and
  calls genMap() (region's 9×9 via the region engine); departLeg closes.
- Upkeep: 2000 kcal/member/day; starving day kills one (bearer last); mantle
  passes inside the party via mantleBecome + villagerId swap; empty party →
  endRoad('wiped').
- endingData(): {reason, daysOnRoad, foundKin, partySurvivors, fallen, village
  {leaderId, leaderName, fate, fateLine, abandoned}, dark, log} — Worker C's input.
- markKinFound() marks the world kin entry found (keepsake/reunion integration).

## Simplifications (documented, not hidden)

- Village fate is deterministic from departure strength + days on road, NOT a
  full catch-up sim of the village (spec says "played out"; a live 100-day sim
  of the player's own village risks state corruption — noted for later).
- Party members are NOT removed from village.roster (narratively away; tracked
  in road.partyIds). If road gameplay needs them gone from village sims, that's
  Worker B integration.
- playerDeath (ledger.js) does not yet consult onRoad() — if the bearer dies
  through normal play (not nomadKill), the mantle would pass to the village,
  not the party. Integration point flagged for Worker B/C.
- Keepsake-bond trail sharpening is Worker C (reunion scene) territory.

## Proofs (all RED→GREEN, seeded harness, full script list)

- scripts/test-nomad-leave-20261015.js: 19/19 (gating ×3 reasons, start effects,
  ~30% carry from pantry, leader rule, no re-leave)
- scripts/test-nomad-legs-20261015.js: 20/20 (addLeg validation/dupes, enterLeg
  region switch + 9×9 gen, departLeg, second leg)
- scripts/test-nomad-upkeep-20261015.js: 20/20 (daily depletion exact, one
  starvation death/day bearer-last, mantle inside party, wiped, addFood)
- scripts/test-nomad-village-20261015.js: 20/20 (leader=mantle rule, strong→
  thrived/not-dark, starving→abandoned/dark, markKinFound, endingData shape)
- One real bug caught by tests: abandonment threshold let headcount mask an
  empty pantry — fixed to food-runway <7 days.
- check.js --quick: 92 passed, 2 failed — the 2 are the known pre-existing
  test-where-are-we RNG flakes (fail identically on master without this work;
  standing follow-up). Nomad tests added to green-list.txt (`quick` tag):
  `check.js --only nomad` → 4 passed in 7s.

## Did NOT touch (Codex's lane)

src/data/godpaths.json, src/data/table-endings.json, scripts/godpath/,
src/js/godpath.js, src/js/godhood.js — verified no diff.

## Files changed

- src/js/nomad.js (new)
- index.html (script tag)
- src/js/game.js (3-line endDay hook)
- scripts/test-nomad-{leave,legs,upkeep,village}-20261015.js (new)
- evidence/2026-10-15/nomad-core.md (this file)
