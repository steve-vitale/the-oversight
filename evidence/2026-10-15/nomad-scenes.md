# nomad-scenes: trails + reunions + ending (2026-10-15)

Stream: trails + reunions + ending for The Long Way Home. Sibling streams:
nomad-core (src/js/nomad.js road state — not yet landed; built against the
contract `Game.nomad.endingData() -> {foundKin, villageLeft, daysOnRoad, partyIds}`),
nomad-wild (legs). Lane respected: no touches to godpaths.json,
table-endings.json, scripts/godpath/, godpath.js, godhood.js.

## What was built

New module `src/js/nomad-scenes.js` (ontology: nomad-scenes), exposed as
`Game.nomadScenes = { trailFor, sharpenTrail, reunionScene, playEnding }`.
Added to index.html after world.js (harness loads index.html order).

**Trails** (`trailFor`, `sharpenTrail`):
- Per-kin trail from lifeseed (hometown/workplace/fate line) + world region.
- L0: continent-vague, never names the region, no regionId exposed.
- L1: one road sharpening (villager/survivor/broadcast, each source once) —
  narrows via neighbors, still unnamed.
- L2: names the region. Via worn keepsake of that person at bond L2+
  (integrates `wornKeepsakes()` + `keepsakeKinPerson()` + `keepsakeLevel()`),
  or two distinct road sharpenings. Naming calls `hearOfRegion` — the
  discovery moment.
- Knowledge-gated throughout: nothing unearned is shown.

**Reunion scenes** (`reunionScene(kinName, fate)`): says the lines, returns
`{fate, title, lines, outcome, choices?}` for the road driver.
- alive → 'joined', marks kin found.
- changed → deterministic subtype (seeded hash of name): leads (choice:
  ask/leave/trade), ascended (choice: speak/leave), hostile (choice incl.
  explicit 'fight' — the caller triggers the real fight engine).
- dead → 'grave', marks found, completes a keepsake of that person if one
  exists (`nomadComplete`).
- moved → 'trail-continues', sharpens the trail, does NOT mark found.
- Voice: spare second person; scenes use only lifeseed/world facts (name,
  relation, hometown, workplace, fate line, region) — no fabricated history.

**Ending** (`playEnding(data)`): light when the left village endures
("We were never lost; we were just far apart."), dark when
`villageLeft.fate === 'fell'` (cost verse naming the village). Party
members' found kin composed into the epilogue. Handles settle-empty
gracefully.

## Proofs

- `scripts/test-nomadscenes-trails.js`: 18/18 (seed 1201); 21/21 (seed 7 —
  covers the worn-L2-keepsake positive path). Asserts L0/L1 never name the
  region, no double-counting sources, bad-source rejection, naming marks
  the region heard.
- `scripts/test-nomadscenes-reunions.js`: 24/24. All four fates; transcript
  assertions (second person, real names/relations, no fabricated-history
  patterns); changed-subtype deterministic across calls; hostile offers the
  fight choice; moved sharpens without marking found.
- `scripts/test-nomadscenes-ending.js`: 12/12. Light carries the spec line
  verbatim; dark names the fallen village and the cost; settle-empty is
  light; party epilogue names a party member's found kin; null-safe.
- `node scripts/validate-ontology.js`: 111/111 (new system registered).
- `node scripts/check-wired.js src/js/nomad-scenes.js`: 0 unwired.
- `node scripts/check.js --quick`: pending (running at commit time; module
  is additive + index.html one-line, ontology green).

## Notes / open

- Cross-module wiring to nomad.js (sibling) pending their landing; the
  contract is documented in AGENT-LANES-adjacent stream notes and in the
  module header. `Game.nomadScenes` facade is defensive (methods guard).
- `validate-data.js` still crashes on its pre-existing `spec.endsWith` bug;
  unrelated.
- RED→GREEN: one genuine cycle — the ending test caught an over-broad
  second-person assertion tripping on the `◈` scene header; scoped to
  narration lines (headers are conventional markers, cf. table.js).
