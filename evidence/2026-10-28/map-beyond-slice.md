# Map/urban first slice: beyond-edge + building — measured results

Date: 2026-10-28. Worktree: `tackle-map` (branch `tackle-map`, owner
`oversight-coord`). Base: master 77e5a262c (before slice). Pre-registration:
`evidence/2026-10-28/map-beyond-slice-prereg.md` (commit fe3e64ee, made
before any judged sweep). Design adopted: the 2026-10-27 map/urban design,
with corrections C1–C8 recorded in
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/coord-map-design.md`
(no home re-key; viewport not sliding array; per-tile beyond generation;
no blockages/bridges beyond the edge in slice 1; one `building` kind, not a
district; compass reporting, not auto-walk; building wildlife may be empty;
panel guardrail added).

## What the slice is, in plain words

The world no longer ends at the edge of the home board. Walk past it and
new ground is generated — meadows, forest, creeks, and occasionally a
standing building at the wild fringe. Only the 9 tiles by 9 around you are
ever shown, so the screen is unchanged. The compass now always tells you
which way home is and how far, even on a fresh game (it previously showed
nothing until a village position was recorded, which a fresh game never
does). A building can be searched like a ruin: canned food, jars, cloth,
tools, medicine — and when it is empty, it stays empty. Wild ground, by
contrast, grows back.

## Bars 1–5 (pre-registered) — all pass

Proof: `node scripts/test-map-beyond-slice.js` in the worktree.
Result: **PASS, 117 checks, 0 failures, exit 0**, on seeds 7, 42, 99.

- BAR 1 (expansion): from a fresh game, stepped past the old edge in at
  least one direction onto a generated tile with a kind, a stock value,
  and a wildlife population object. Seed 7: west to (-1,4), meadow,
  stock 25/25, striped skunk. Seed 42: east to (9,4), meadow, 22/22,
  striped skunk. Seed 99: east to (9,4), a building, 15/15, no wildlife
  (legitimate for a building — C5/C7).
- BAR 2 (moving window): after crossing, the visible 9x9 window is
  centered on the player, home is outside the window, and the compass
  reports direction + distance > 0 (seed 7: →5; seed 42: ←5; seed 99:
  verified the same way). The generated beyond tile is deterministic:
  a fresh process regenerating the same coordinates matches kind, stock
  (after the arrival detail step), loot, and wildlife species, within the
  one-animal ecology rule below.
- BAR 3 (urban difference): a distant building's scavenge pulls return
  manufactured goods and reduce its loot to zero; an empty pull says
  "Picked clean. Nothing left in this building." and loot stays 0 after
  leaving and returning. In the same run, a home grove depleted to 0
  regrew to stock ≥ 1 after the regrow step. Example pulls: "You pry open
  a cabinet: Canned soup (+450 kcal). Chicken soup. Tastes like before."
  and "Jarred peaches (+700 kcal). Home-canned. Whoever sealed this knew
  what they were doing. That's everything. This building is done."
- BAR 4 (no regressions): game starts; haven at the center of the
  starting window; guaranteed ruin within Manhattan 3 of haven and the
  breadbasket grove still generate; gating untouched — the diff contains
  zero deed/gate/readiness tokens (verified by diff, not assertion alone).
- BAR 5 (sense test): transcript below, read by the worker. It reads like
  a player experience: the game says the world continues, names the city
  tile, names what was found, and says what is left.

### Transcript (seed 7, abridged to the crossing and the scavenge)

```
  Travel 1 tile to forest floor. ... (walk to the rim)
  New ground — the world keeps going past the old edge. The compass still knows the way home.
  Travel 1 tile to meadow.
  ... (walk home, then to the building)
  forest floor. A standing building. There might be supplies left.
  You pry open a cabinet: Canned soup (+450 kcal). Chicken soup. Tastes like before.
  You pry open a cabinet: Jarred peaches (+700 kcal). Home-canned. Whoever sealed this knew what they were doing.
  You pry open a cabinet: Jarred peaches (+700 kcal). Home-canned. Whoever sealed this knew what they were doing. That's everything. This building is done.
  Picked clean. Nothing left in this building.
```

Seeds 42 and 99 carry the same beats (crossing line, building named,
cabinet finds, picked-clean line).

### Two mechanisms found during the proof (not slice bugs)

1. Detail-grid stock override: walking onto a tile replaces its abstract
   stock with the detail-grid plant count ("the world is the truth").
   The determinism check therefore regenerates the tile AND runs the
   arrival detail step before comparing — visited vs visited.
2. Living ecology on arrival: stepping onto a tile runs checkAnimals
   (encounters.js wrapper), which takes one individual out of the tile
   population onto the detail grid as a live animal. A visited tile may
   therefore hold exactly one fewer animal than a fresh regeneration, of
   the spawned species. The proof asserts species keys equal and counts
   within that one spawned animal. This also proves beyond tiles join
   the ecology: animals spawn from beyond-tile populations.
3. Combat interrupting multi-pull scavenging: every scavenge pull costs
   64 ticks, and the living world's monsters close in during those
   ticks, so a fight can engage mid-scavenge. That is the world working
   as designed, but it stalls a loot-finiteness observation behind a
   fight. The proof therefore positions directly (as debug scenarios do)
   on a distant building (≥ 12 steps from haven) for the scavenge phase
   and fails loudly on combat instead of spinning silently. Walking is
   proven separately by bars 1–2. No encounter state is manipulated.

## Panel guardrail (correction C8) — measured, with a pre-registration defect named

Before: master base 77e5a262c (frozen export, its own balance-panel).
After: slice worktree. Policies capable, risk-aware; 60 days. Two panel
sizes were run (the second is a labeled extension, same bar, more data —
not a re-score: the bar never changed, and the 3-seed screen is kept
intact below).

- Screen (pre-registered): seeds 7, 42, 99. Before:
  `map-panel-before` (6 cases); after: `map-panel-after` (6 cases).
  Compare `map-panel-compare`: decision `review_required`, errors [].
  Every paired delta is exactly 0 (all 29 metrics, both policies).
- Standard screen (extension): the tool's default 16 seeds
  (7, 42, 99, 1234, 555, 777, 2026, 31337, 1, 2, 3, 4, 5, 6, 8, 9 —
  includes the pre-registered seeds). Before: `map-panel-before16`
  (32 cases); after: `map-panel-after16` (32 cases). Compare
  `map-panel-compare16`: decision `review_required`, errors [].
  Every paired delta is exactly 0 again (both policies, all metrics).

Why `review_required` and not `no_material_signal`: the comparator
returns `review_required` whenever any metric's status is outside
{descriptive, no_material_signal}. At 16 seeds the only such metrics
are luck percentiles — hunt/fish `not_observed` (the bots never take
those routes on EITHER side, so there is nothing to compare) and
trap/pit `insufficient` (delta 0, too few eligible pairs for a verdict).
No survival, progression, community, resource, or gear metric moved at
either size. The verdict label is therefore an instrument-coverage
abstention, not a game signal.

Pre-registration defect (stated, not hidden): C8 as written demanded
the literal `no_material_signal` string from a 3-seed screen, but the
instrument requires 64 seeds for confirmation size AND a verdict on
every metric including luck routes the bots never take — so the string
is structurally near-unreachable for this comparison even at 16 seeds
(the 64-seed run is predicted to return the same label via the same
unobserved luck routes, at ~4x the cost). The guardrail's substance —
no metric worsened, no material signal — holds at both sizes with zero
deltas and zero errors, and the worker's review of the flagged items
found coverage limits only. This is reported as guardrail-satisfied in
substance with the label and the defect stated plainly, so the call can
be overruled to NO-GO if the letter is to bind. A guardrail breach
(a worsened metric) would still be NO-GO; none occurred.

## Metric review (MEASUREMENT.md §14 — required even when metrics hold)

No metric moved at either panel size: all paired deltas 0, both
policies, 60 days, seeds 7/42/99 and the 16-seed standard screen.
Survival (bearer day-30/day-60, deaths), community (living NPCs,
loss), resources (reserve/hydration/HP/hunger samples), progression
(table entry/invitation, national access, named-class access, tier-3+
gear), and ability events are identical before and after. The slice
changes where players can walk, not how survival or progression
measure — and the sim policies never walk past the home board in
60 days, so the beyond-edge code paths are unexercised by bots (their
proof is the node proof above, not the panel). Luck percentiles are
the only metrics the instrument could not verdict, identically on both
sides (hunt/fish never observed; trap/pit too few pairs); no luck
conclusion is drawn from them.

## Regression check (check.js --quick, worktree)

Full run after the slice: 278 passed, 9 failed (1876s; an earlier run
gave 279/8 — the one-suite difference is the load flake below). None of
the 9 is caused by the slice; each was checked against the frozen base
(77e5a262c export) or by re-running it alone:

- hide-discovery, measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels: fail on the frozen base too
  (same assertions) — pre-existing.
- measurement-comparison: fails on a stale retained-panel digest for
  `scripts/sim-harness.js`, a file this slice does not touch —
  pre-existing staleness class.
- phone-frame-proof: retained receipt already stale for `index.html`,
  a file this slice does not touch — pre-existing staleness; the slice
  adds `arrivalText.json` and `app.js` to the stale-input list. A full
  refresh needs the browser receipt recipe (parent item, not doable
  from this worker).
- establishment-r20: same cooking-voice assertion in both runs; the
  slice diff contains zero cook/racks lines — pre-existing.
- measurement-cache-flags: failed under triple-job load, passes alone
  in the worktree (24s, 4/4) — load flake, not a regression.
- No travel/map suite failed. `node scripts/check-wired.js src/js/game.js`
  flags 17 unwired functions, none of them the slice's new helpers
  (beyondTile/mapWindow/homeVector are called from game/app code).
  `node scripts/validate-regions.js`: 20 regions, 0 errors.
  `node --check` passes on game.js and app.js.

check.js is therefore NOT green as a whole; the red is pre-existing
plus one load flake, and this is stated rather than claimed away.

## What remains unbuilt (plainly — the slice is not the whole map)

- The full city: district generation, street networks, building
  interiors, dens/squatters, caches, collapse/clearing.
- The desert biome and its water-clock rules.
- The far-village ledger (hundreds of villages as cards + rumors).
- Generation continuity passes (creeks/roads flowing across the window),
  blockages and bridges beyond the edge.
- The compass auto-walk home and any earned homeward ability.
- The viable-start guard as a generator check (today's breadbasket +
  guaranteed ruin already cover the wild case; city/desert versions
  arrive with those biomes).
- Starting-location-mattering measurement (day-7/day-30 by start type) —
  needs city and desert starts to exist first.
- Road food as a system (pack/caches/hospitality for multi-day trips).
- Any 100x100-style cap: none by design; sparse storage only, and its
  save-size number is still unmeasured (first long-walk sim will set it).
- The `tbBarrierExit` 0..8 world-edge guard is stale for beyond-edge
  fights (fleeing past the edge during combat would hit the old
  refusal) — open follow-up, not fixed in this slice.

## Files in this slice

- `src/js/game.js` (+164/−~35): beyond generation + storage, viewport,
  home vector, edge crossing, building scavenge branch, building tile
  info, load backfill, beyond-aware neighbor lookup.
- `src/js/app.js` (+43/−changed): map overlay renders the viewport;
  compass uses the home vector.
- `src/data/arrivalText.json` (+9): building arrival texts.
- `scripts/test-map-beyond-slice.js` (new): proof, 117 checks.
- `evidence/2026-10-28/map-beyond-slice.md` (this file): results.
- `evidence/2026-10-28/map-beyond-slice-prereg.md` (committed earlier):
  pre-registration.
