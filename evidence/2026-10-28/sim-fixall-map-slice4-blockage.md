# ITEM B slice 4 — Blockage/bridge parity beyond the edge: pre-registration

Base: fixall-map slice 3 commit 71310a24 (local branch, not yet merged).
Design: travel-scale-coherence-design §B2/B7.12 ("beyond tiles gain the
same blockage/bridge rules as home tiles; the intermediate-blockage scan
extends to beyond coordinates") + docs/MAP.md §2 limit (the asymmetry this
slice closes).

## Pre-registered rule (fixed BEFORE the judged run)
- Generation (`beyondTile`, wild tiles only, deterministic from the same
  per-tile stream R):
  - First ring exempt: a beyond tile at Chebyshev distance <= 5 from
    haven (the rim-adjacent ring the slice-1 crossing steps onto) never
    gains a blockage or a bridge demand. The slice-1 crossing guard
    stays green by construction, not by luck.
  - Deeper wild tiles (Chebyshev > 5): with probability 0.12 the tile
    gains a `blockFrom` (same kinds/distribution as home generation:
    roll < 0.40 fallen_tree, < 0.70 rubble, else washed_out; the guarded
    approach side is one of the 4 orthogonal sides, drawn from R).
  - Deeper wild `creek` tiles: with probability 0.35 the tile gains
    `needsBridge` (the home generation rate).
  - City tiles (street/plaza/building/cache) never gain blockages or
    bridge demands: city ground is open ground by design. A fallen tree
    ON a street is plausible flavor, but it would make the city-walk
    proof path-dependent; streets stay open in this slice.
- Scan (`travelTo` intermediate-blockage loop):
  - The loop bounds move from the fixed 0..8 box to the path bounding
    box (min/max of origin and destination, expanded by 1). For any path
    inside the home board the box is inside 0..8, so home behavior is
    byte-identical in effect.
  - Beyond intermediates on a shortest path are generated before the
    check (only when outside 0..8 and not yet generated), so an
    un-generated intermediate cannot silently pass as "no blockage".
  - The shortest-path filters (dS/dT/dE) are unchanged — the bounds
    change only which tiles are ITERATED, never which tiles can refuse.
- Why this matters (the hole, stated plainly): today a player standing
  beyond the edge can jump 2–3 tiles onto a revealed home tile, and the
  scan only looks at home-board intermediates — a blocked beyond tile
  on that jump is skipped clean over. After this slice the same jump
  refuses, honestly, naming the block.

## GO thresholds (ALL must hold on EACH of seeds 7, 42, 99)
1. Destination parity: a beyond fallen-tree tile refuses entry from its
   guarded side (travelTo returns the block, player unmoved, blockType
   named); a beyond creek with needsBridge refuses a non-swimmer the
   same way a home creek does.
2. Intermediate parity (the hole, closed): a 2-tile jump from beyond
   onto a revealed home tile, over a beyond intermediate whose blockFrom
   guards the jump's approach side, REFUSES with the intermediate's
   block — and the identical scenario on the slice-3 base SUCCEEDS
   (before/after on identical seeds, via a git-archive scratch copy of
   the slice-3 commit running the same proof).
3. First-ring exemption: no sampled first-ring (Chebyshev == 5) beyond
   tile carries blockFrom or needsBridge.
4. City exemption: no tile of a sampled city cell carries blockFrom or
   needsBridge.
5. Determinism: a regen child reproduces blockFrom/needsBridge for a
   sampled blocked beyond tile.
6. Home-identical: a home-board multi-tile jump over a home intermediate
   blockage still refuses exactly as before (regression check via the
   existing travel tests + the slice-1 guard).
7. Guards: test-map-beyond-slice.js green; test-city-districts.js green;
   check.js full run at closeout (see closeout for counts).

## Proof
- scripts/test-beyond-blockage.js (new, shared sim-harness only; regen
  child pattern as in slice 1/3 proofs).
- Metric review: thresholds above are the judge. The 0.12 blockage rate
  and 0.35 bridge rate mirror home generation exactly (not new balance
  numbers); the 5-tile exemption ring is the one new call, documented
  here for Steve's overrule.

## Result (filled after the run)
- AFTER (slice-4 code): PASS on seeds 7, 42, 99, 0 failures. Every bar
  held: destination refusal (fallen_tree/rubble by seed), creek bridge
  refusal, intermediate refusal with the intermediate's block
  (e.g. {"x":9,"y":4,"blockType":"fallen_tree"}), first-ring 40/40
  unblocked, city cells 0 blocked, regen blockFrom/needsBridge matched,
  home regression refused with the home intermediate's block.
- BEFORE (slice-3 commit 71310a24, same proof copied into a git-archive
  scratch copy): 12 failures, all in the expected places — per seed,
  no beyond blocked tile exists, no beyond needsBridge creek exists,
  and the intermediate jump SUCCEEDS (travelTo returns undefined, the
  player moves onto the home tile). The hole was real, and this slice
  closes it without touching home behavior (home regression passes on
  both base and slice-4 code).
- No threshold was moved mid-run. The intermediate scenario's blockFrom
  is set by the proof (to isolate the SCAN from generation); generation
  of beyond blockages is proven separately by bars 1a/1b/5.

## Amendment (same slice, found by the slice-1a guard re-run)
- Slice 4 changed what walkHome can meet: a straight-line return can
  now hit a fallen tree, and the slice-1a walkHome had no second
  homeward axis on axis-aligned returns — it stopped at the first
  block. walkHome now sidesteps perpendicular (toward-home side first,
  never revisiting a tile on the walk, narrated once) and stops honestly
  only when homeward steps AND both sidesteps refuse; on success the
  returned `blocked` is null (a bypassed block is not a stopping block).
- The slice-1a blocked proof was updated to match: it now boxes the far
  position on all four sides instead of blocking only the homeward
  candidates. The slice-1a bar (iv) is therefore read as "a fully
  boxed-in return stops honestly", and the slice-1a proof + slice-4
  proof + city proof + slice-1 guard all re-ran green after the change.
  This is a documented evolution of the walkHome rule under slice 4's
  new reality, not a loosened assertion: the blocked-stop behavior is
  still proven, under strictly harder conditions (a full box).
