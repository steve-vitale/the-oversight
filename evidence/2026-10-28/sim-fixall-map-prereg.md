# ITEM B — MAP/URBAN FULL BUILD: pre-registration (fixall-map)

Date: 2026-10-28. Base: master 3a5c49f49. Design: goal hidden_files
travel-scale-coherence-design-20261028.md (§D slice 1 "One map, one return"
first, then Q7 city/blockage work). Canon read first: docs/CANON.md (manifest
only — no travel/map rules of its own), docs/WORLD-REGIONS.md §6 (Long Way
Home), docs/SCALE.md, docs/PERCEPTION.md. Canon silence noted, not invented:
no doc rules a compass way home, an urban region, or a return path from a
nomad leg — those are design-doc proposals, built here only where they do
not need a Steve ruling (see steve-calls below).

## Standing laws applied (not re-litigated)
- Perception law (Steve 2026-10-28): no roster/list feed into any decision.
  Walk home is the player's own action on a path the player walked; the
  villager return step retraces ground that villager already stands on
  (their own position, not a listed destination). No new list feeds.
- Gating freeze: NO seat/table/wave/polity bar changes anywhere in this
  item. Map building is not a gate change. The regional finale-omen gate
  stays untouched.
- No teleport, ever. Every return is tile-by-tile through the same
  travelTo pipeline as walking out (same costs, same encounter/monster
  rules, same blockage refusals).
- No forfeit change: the nomad DEPARTURE forfeit code path is UNTOUCHED
  until Steve rules Q0(a) (B1 split). Leg-map unification changes only
  which ground a leg generates, not what leaving costs.

## Slice 1 — "One map, one return" (§D)
### 1a. Player Walk home — Game.walkHome()
- Primary metric: walk-home completion on seeds 7, 42, 99.
- GO (ALL must hold on EACH seed): (i) a scripted player walks past the
  home edge, then walkHome() reaches the SAME haven tile; (ii) outbound
  steps and inbound steps are both real travelTo steps (no position jump
  > 1 tile in any single step; position trace checked); (iii) compass
  distance decreases monotonically along the return trace (non-increasing,
  strictly decreasing on the final step to 0); (iv) a blocked return
  (blockage placed on the homeward step) stops honestly with
  reached=false and a named block, position unchanged by the refused step.
- Cost rule (design §D says "costed exactly like the outbound trip"):
  implemented as identical travelTo calls — node travel is FREE by the
  standing rule (game.js: "NODE TRAVEL IS FREE"), so walk-home charges
  exactly what walking out charges: nothing per node jump, plus the same
  world ticks/encounters a manual walk would meet. NO new kcal tax is
  invented. If Steve wants a walk-home tax, that is a steve-call.
- Guards: test-map-beyond-slice.js re-runs green; check.js --quick shows
  no new failures vs base; balanced panel zero-delta (panel run at close).
- Proof: scripts/test-walk-home.js (new, shared sim-harness only).
- UI: compass line in app.js gains a Walk-home control calling
  Game.walkHome(). Node tests cannot prove DOM clicks; this control is
  committed [needs-eyes] for Steve's phone pass, and the engine method
  it calls is the proven part. No browser claim is made here.

### 1b. Leg-map unification — region-seeded leg ground
- Primary metric: leg determinism on seeds 7, 42, 99.
- GO (ALL must hold on EACH seed): (i) two entries to the same region
  (same run seed + same region id) produce identical leg board tile-type
  signatures; (ii) different regions may differ (sanity: the seed is not
  constant); (iii) the road's other rules are untouched (gate, party,
  forfeit, 3-day search wait — verified by diff, not re-tested here).
- Before/after: BEFORE = enterLeg() called seedless genMap() (fresh random
  board per entry — shown in the proof by two seedless genMap() boards
  differing); AFTER = region-seeded entries identical. The seed derives
  from the RUN seed (state.worldSeed, falling back to map.worldSeed) mixed
  with the region id, so a second leg in the same run re-derives the same
  ground instead of chaining off the previous leg's board seed.
- Guards: existing nomad leg tests re-run (test-nomad-legs.js); check
  --quick no new failures.
- Proof: scripts/test-leg-determinism.js (new).

### 1c. Unified map doc
- docs/MAP.md: one doc reconciling home board, beyond tiles, leg maps,
  macro map, region registry, and the perception-law constraint on later
  slices. Docs only; no code. Guard: check.js --quick green.

## Slice 2 — Villager way home (return leg unclamp, Q8 follow-up shape)
- Primary metric: a villager standing BEYOND the edge with a finished
  objective walks home tile-by-tile.
- GO (ALL must hold on seeds 7, 42, 99): (i) returning steps move at most
  1 tile per objAwayStep call and strictly reduce Chebyshev distance to
  haven over the walk (meander suppressed on the return path — the
  existing code already exempts returning walkers from the tightness
  guard; this slice extends that exemption to the clamp); (ii) the
  villager reaches haven; (iii) each step charges the same +3 hunger /
  -4 energy as any away step; (iv) OUTBOUND targeting stays clamped to
  0..8 (no new beyond-errand faucet: departures, expeditions, and
  meander/area-work keep their clamps).
- Deliberate scope cut (perception law, §F1.10): this slice unclamps ONLY
  the return. How a villager lawfully GETS beyond the edge (saw-leave
  FOLLOW, §D2) belongs to the field-party slice, not this item; the proof
  therefore positions the villager beyond the edge as a follow WOULD
  have, and proves the return only. Claiming the follow is NOT claimed.
- Implementation shape: npcSetNode gains an opt-in allowBeyond flag
  (default = today's clamp, so every existing caller is unchanged);
  objAwayStep's returning branch passes it. No other clamp moves.
- Guards: check --quick no new failures; villager objective tests green.
- Proof: scripts/test-villager-walk-home.js (new).
- Overlap note: live arms sim-nighttravel-b / sim-nighttravel-g3fix-b
  (nightly travel-home policy) may touch npcNodeTravel/objAwayStep. This
  slice touches ONLY objAwayStep's returning branch + npcSetNode's new
  optional flag. If a merge conflict lands on those lines, it fails
  loudly and is reported, not forced.

## Slice 3 — City simulation (Q7, districts as beyond tiles)
- Primary metric: city districts generate deterministically beyond the
  edge and read as a city, not the wild, on seeds 7, 42, 99.
- GO (ALL must hold on EACH seed): (i) a deterministic district field
  exists: beyond coordinates in the same coarse district cell share one
  district identity, and two runs on the same seed produce the same
  district map; (ii) district tiles use city kinds (street/building/
  plaza/cache — see proof for the exact set) instead of wild kinds, with
  buildings keeping finite scavenge (slice-1 rule) and streets walkable
  with no wild stock; (iii) the home board is byte-unchanged in kind
  (no city tile lands on 0..8, no start-location change — NO wasteland
  starts, no landing change); (iv) slice-1 guard test-map-beyond-slice.js
  still green (a building tile still generates; the crossing tile may be
  a street — the guard's kind assertion is kind-agnostic except where it
  names buildings, which the proof keeps).
- Pre-registered BEFORE writing slice-3 code: the exact district rule,
  thresholds, and kind set are fixed in the slice-3 evidence header
  before the judged run, not here, because they depend on what the
  slice-1 code review finds in beyondTile/forage. This prereg fixes the
  GO shape only; numbers are pre-registered in that header.
- Held parts (see closeout): far-village ledger, leg-village real links,
  arrival courtship advantage, establishment arrivals — each with reason.

## Slice 4 — Blockage/bridge parity beyond the edge (Q7, "one walk")
- Pre-registered in its own evidence header before the judged run (same
  pattern as slice 3): first-ring beyond tiles stay open ground so the
  slice-1 crossing guard stays green; deeper beyond tiles gain the same
  blockage/bridge rules as home tiles; the travelTo intermediate scan
  extends from the 0..8 loop to the path bounding box.
- GO shape: a beyond creek without a bridge refuses like a home creek;
  a beyond fallen-tree blockage refuses like a home one; a multi-tile
  jump past the edge no longer slips past an intermediate blockage;
  slice-1 guard still green.

## Measurement discipline
- Pilot = proof scripts on seeds 7, 42, 99 (the map slice's proven seeds).
  No sim sweep is claimed for map generation: determinism proofs are
  exact, not statistical. A balanced-panel run at closeout checks
  zero-delta on the standard panel; panel numbers are reported with
  their base.
- Every evidence file carries a metric-review section (§14). A missed bar
  is root-caused, not re-scored; kills require confirming the lever
  itself is wrong.

## Metric review (this prereg)
- Thresholds above are the judge; the balanced panel is the instrument.
  The walk-home cost rule deliberately follows the standing NODE-TRAVEL-
  IS-FREE rule rather than inventing a tax — if that reading is wrong,
  the slice-1a verdict must be re-judged, not the threshold quietly
  moved. The leg-seed derivation (run seed, not leg-board seed) is a
  design call documented here for overrule: it is what makes "same
  region, same ground" true across legs in one run.

## Steve-calls (NOT decided here)
- Q0(a) B1 split (road TRAVEL never forfeits, only final DEPARTURE):
  NOT built. Forfeit code untouched.
- Q0(b) waves-faced-on-legs counting: NOT built (default NO).
- Walk-home kcal tax: NOT built (node travel is free by standing rule).
- Which regions become playable / starting-location content: NOT built
  (home board and landing unchanged; city content is beyond-edge only).
- Arrival courtship advantage numbers / hard arrival requirement:
  NOT built (default soft-only, held pending knower-trace audit).
