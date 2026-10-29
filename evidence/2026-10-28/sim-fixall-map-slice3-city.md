# ITEM B slice 3 — City districts: pre-registration + result

Base: fixall-map slice 2 commit e1d709578 (local branch, not yet merged).
Design: travel-scale-coherence-design §B2/Q7 (city = a region kind:
districts, streets, buildings, dens, caches, with a city people layer,
built as map content, not a new mode) + docs/MAP.md §7 (city planned).

## Pre-registered district rule (fixed BEFORE the judged run)
- Scope: `beyondTile(x, y)` ONLY. The home board (0..8) never gains a
  city tile; landing and start location are unchanged (no wasteland
  starts, no landing change).
- Distance gate: a tile whose Chebyshev distance from haven is <= 12
  generates exactly as before (wild kinds + 10% building). The early
  fringe stays wilderness; cities are a journey away, which is also what
  makes walk-home/city trips meaningful.
- District field: coarse cells of 8x8 tiles. Cell (cx, cy) =
  (floor(x/8), floor(y/8)) is a city cell when a deterministic hash of
  (worldSeed, cx, cy) falls below 0.12 (~1 in 8 cells). District identity
  is the cell key itself (`district: "cx,cy"` on the tile) — two tiles in
  one cell share one district; tiles in different cells never do.
- Layout inside a city cell (local coords lx = x - 8*cx, ly = y - 8*cy,
  all from the same per-tile deterministic stream R already in
  beyondTile):
  - center 2x2 (lx in 3..4, ly in 3..4): `plaza`
  - cross streets (lx in 3..4 XOR ly in 3..4): `street`
  - elsewhere: `building` with probability 0.70, `cache` with 0.15,
    `street` (side street) with 0.15
- City tile properties:
  - `street`: stock 0 / maxStock 0, wildlife {}, no loot. Forage says
    "Bare pavement — nothing grows here." (honest, not "nothing left
    today" — pavement never regrows.)
  - `plaza`: stock 0 / maxStock 0, wildlife {}, no loot. Forage line as
    street. A plaza is map content + naming only in this slice: no
    people spawn there (a people layer without a mechanism would be a
    list-fed faucet, and is explicitly NOT built).
  - `building` (city): identical to the existing beyond `building`
    (3–5 manufactured loot + 8% rare, finite, same scavenge branch).
  - `cache`: 1–2 manufactured loot items from the same common pool,
    finite, scavenged through the ruin/building branch with its own
    words ("You dig out the stash"), NO book roll (a stash is not a
    house shelf).
- Detail grids: street/plaza read as open worn ground (dirt/grass);
  cache reads like a building (rubble/wall/dirt/grass). All walkable;
  no new blocking cell type.
- Naming: TILE_NAME street/plaza/cache; TILE_GLYPH street 🛣️, plaza
  ⛲, cache 📦; tileInfo branches for all three (cache loot-aware like
  buildings; street/plaza static). nodeEpithet cases for the three (the
  pre-existing building epithet quirk is left alone — out of scope).
- HELD in this slice (with reason, not silently dropped):
  - Dens (monster lairs): HELD — no den spawn hook exists in the monster
    system, and inventing one here would move encounter balance (panel
    delta risk) without a pre-registered encounter bar. Needs a monster-
    side design + its own proof, not a map-content commit.
  - City people layer (residents, markets, hosts): HELD — any people
    layer must trace to perception (seen arrivals, met hosts), and the
    leg-village/knower-trace work it depends on is held pending the
    Q0(a) ruling (see closeout). A city with spawned residents would be
    a list-fed faucet.
  - Interiors as separate enterable rooms: HELD — buildings are already
    "enterable" in the game's sense (you stand on the tile and work it);
    a separate interior map layer is a new mode, which the design
    forbids ("built as map content, not a new mode").

## GO thresholds (ALL must hold on EACH of seeds 7, 42, 99)
1. District coherence: every tile in one sampled far city cell shares
   one district id, and tiles in two different far city cells differ.
2. Layout: the sampled cell's center 2x2 are plazas, its cross arms are
   streets, and it contains at least one building and one cache.
3. Determinism: two runs on the same seed produce the same district map
   (same kinds for a fixed set of far coordinates — proven by a regen
   child process, same pattern as the slice-1 guard).
4. Home untouched: no tile in 0..8 changes kind vs the slice-2 base on
   the same seed (home board signature identical before/after).
5. Near fringe untouched: every tile within Chebyshev 12 of haven keeps
   the old wild generation (kinds from the old rule — proven by
   comparing against a fresh checkout of the slice-2 base? NO — the
   proof instead asserts: near tiles are never street/plaza/cache, and
   the old 10%-building wild rule still produces buildings nearby).
   (Honest note: a full before/after home-board diff is slice-4's panel
   job; here the kind-set assertions are the guard.)
6. Scavenge parity: a cache empties finitely like a building (pulls
   reduce loot to 0, then "Picked clean" naming the cache); a street
   forage names pavement and adds nothing to the pack.
7. Walkability: a scripted player walks onto a street tile and a plaza
   tile via travelTo and stands on a walkable detail cell (no strand).
8. Guards: test-map-beyond-slice.js green; check.js --quick no new
   failures vs slice-2 base; balanced panel at closeout.

## Proof
- scripts/test-city-districts.js (new, shared sim-harness only).
- Metric review: thresholds above are the judge; the panel is the
  instrument. The 0.12 district rate and the 12-tile wilderness ring
  are balance calls documented here for Steve's overrule, not canon:
  if cities feel too rare/frequent in play, the numbers move only with
  a new pre-registration, never mid-run.

## Result (filled after the run)
- PASS on seeds 7, 42, 99: scripts/test-city-districts.js, 0 failures.
  Sampled cells held 21 buildings / 5 caches (seed 99 cell 2,-3);
  district coherence, layout, regen determinism, home/fringe guards,
  cache scavenge, pavement forage, and street+plaza walks all green.
- BUG FOUND BY THE PROOF (fixed in this slice, not waived): walking onto
  a street/plaza/cache tile crashed travelTo — arrivalPoolFor() returns
  null for types with no arrival pool, and travelTo read arr.title
  unguarded. Fixed two ways: arrival pools for street/plaza/cache in
  src/data/arrivalText.json (data-first, per repo rule) AND a null guard
  in travelTo so any future type arrives without a title line instead of
  throwing. arrivalTextFor() already tolerated null; only travelTo did
  not.
- Guards: test-map-beyond-slice.js green after slice 3 (see closeout);
  check.js --quick run at closeout (see closeout for counts).
- Metric review: all 8 GO thresholds held as pre-registered. The 0.12
  district rate and 12-tile ring are balance calls for Steve's overrule
  as noted above; no threshold was moved mid-run.
