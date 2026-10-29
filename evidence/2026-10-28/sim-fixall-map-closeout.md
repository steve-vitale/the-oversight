# fixall-map closeout — MAP/URBAN FULL BUILD (ITEM B)

Branch `fixall-map`, base master `3a5c49f49` (coordinator check 2026-10-28).
All slices landed to local master only, pending ship. Nothing here is live;
no push, no version bump, no live verification (ship loop owns pushes).

## Per-slice verdicts

### Slice 1a — Player Walk home — LANDED (commit 12f187434) [needs-eyes]
- `Game.walkHome(maxSteps)` in `src/js/game.js` + "Walk home" compass
  button in `src/js/app.js`. Tile-by-tile through `travelTo`, orthogonal
  steps only, blocked steps try the other axis (then, after slice 4, a
  sidestep — see slice 4 follow-up), combat/cap stop honestly.
- Cost rule: identical `travelTo` calls; node travel is free by standing
  rule, so walk-home charges what walking out charges: nothing per node
  jump. NO kcal tax invented (steve-call, see below).
- Proof `scripts/test-walk-home.js`: PASS, seeds 7/42/99. Walk past edge
  then `walkHome()` reaches the same haven tile; every step 1 tile;
  compass distance never increases on return; boxed-in return stops
  honestly with the block named; kcal unchanged (2200 -> 2200).
- Phone feel of the compass button is [needs-eyes]; node tests cannot
  prove DOM clicks and no browser claim is made.

### Slice 1b — Leg-map unification — LANDED (commit 0c5ba7a15)
- `enterLeg(i)` now calls `Game.genMap(legSeedForRegion(leg.regionId))`:
  seed from the RUN seed mixed with the region id, never from the
  previous leg's board seed. Same region, same ground, across legs.
- Bug fixed in-slice: first version read `state.worldSeed` (null in rigs)
  then fell back to the board seed `genMap` itself overwrites — seed
  drifted per leg. Fix stashes the run seed on the road state BEFORE
  `genMap` replaces the board seed.
- Road gate, party, forfeit, 3-day wait untouched. Muster rewrite NOT
  touched (field-party slice's work).
- Proof `scripts/test-leg-determinism.js`: PASS, seeds 7/42/99. Same
  region re-entry regenerates identical boards (tiles, blockages,
  bridges, stock, wildlife); different regions differ; old seedless
  boards differ (the teleport, BEFORE).

### Slice 1c — Unified map doc — LANDED (commit 86632a006)
- `docs/MAP.md` (home board, beyond tiles, leg maps, macro map, registry,
  way home) + `docs/CANON.md` manifest row. PLANNED items marked not
  built; updated as slices 3/4 landed (blockage parity, city districts).
- Canon silence noted, not invented: no doc rules a compass way home, an
  urban region, or a return path from a nomad leg.

### Slice 2 — Villager way home — LANDED (commit e1d709578), NARROWED (commit d10a2abb6)
- `npcSetNode(vid, nx, ny, allowBeyond)`: opt-in 4th parameter; default
  keeps the 0..8 clamp. Only a villager's RETURN walk passes the flag.
- `objAwayStep` returning branch: pursue unclamped toward haven; the
  final `npcSetNode` passes `returning` as the flag. Outbound pursuit,
  meander, area-work, expeditions, departures keep clamps.
- NARROWING (found by the balanced panel, see below): the first version
  also made meander outbound-only. Pre-slice-2, meander was
  `!leashed && R() < 0.35` for ALL walkers, so returning walkers
  consumed that RNG roll; suppressing it shifted the global RNG stream
  in EVERY game (all 64 panel pairs diverged). The narrowed rule:
  meander is skipped ONLY for a BEYOND-board returner (a clamped
  meander there would snap to the rim — a teleport). Home-board
  returners keep their exact old wander, roll included, so panel games
  are bit-identical to base until a villager actually stands beyond
  the edge. A beyond returner resumes base-like wandering once back
  in-board (maximal parity: from that point they are indistinguishable
  from a base villager).
- Proof `scripts/test-villager-walk-home.js`: PASS, seeds 7/42/99.
  Beyond segment straight (12,4)->(8,4); no step >1 tile per coordinate;
  arrival; ledger +3 hunger / -4 energy per CALL; default clamp holds;
  outbound stays in-board over 20 steps; BAR 5 (home parity): 5-6 of 6
  home returns per seed longer than pure pursue, i.e. meander fires.
- Deliberate scope cut: the proof positions the villager beyond the
  edge as a follow WOULD have; the follow verb itself belongs to the
  field-party slice and is NOT claimed.

### Slice 3 — City districts — LANDED (commit 71310a24) [needs-eyes]
- `beyondTile` only; home board never gains a city tile; landing/start
  unchanged. Tiles at Chebyshev <= 12 from haven generate exactly as
  before (wild + 10% building). Past the ring, coarse 8x8 cells are city
  cells on a deterministic hash (~1 in 8): center 2x2 plaza, cross
  streets, elsewhere building 0.70 / cache 0.15 / side street 0.15.
- Street/plaza: stock 0, no wildlife, no loot. City building: existing
  beyond-building loot (3-5 manufactured + 8% rare, finite). Cache: 1-2
  common manufactured loot, finite, NO rare, NO book roll.
- Names/glyphs/tileInfo/epithets for street/plaza/cache; forage branch
  for cache ("You dig out the stash", "Picked clean"); pavement forage
  says "Bare pavement — nothing grows here." and adds nothing.
- Bug fixed in-slice: walking onto a street/plaza/cache tile crashed
  `travelTo` (`arrivalPoolFor` null -> `arr.title` unguarded). Fixed
  both ways: arrival pools in `src/data/arrivalText.json` (data-first)
  AND a null guard in `travelTo` for any future type.
- Proof `scripts/test-city-districts.js`: PASS, seeds 7/42/99. District
  coherence, layout, regen determinism, no city tile on home board or
  near fringe, BFS + `travelTo` onto street/plaza, cache empties
  finitely, pavement forage honest.
- HELD in slice 3 (see held section): dens, city people layer,
  interiors as separate rooms.

### Slice 4 — Blockage/bridge parity — LANDED (commit 3f5c48445) + follow-up (commit 4924ef35c)
- Generation (`beyondTile`, wild only, draws AFTER all slice-3 fields):
  first ring (Chebyshev <= 5) exempt; deeper wild tiles p=0.12 gain
  `blockFrom` (fallen_tree/rubble/washed_out, guarded orthogonal side);
  deeper wild creek tiles p=0.35 gain `needsBridge`. City tiles never
  gain blockages/bridge demands. Structures excluded.
- Scan (`travelTo` intermediate loop): bounds moved from fixed 0..8 to
  the path bounding box (+1). Home paths sit inside 0..8, so home
  behavior is identical in effect. Beyond intermediates on a shortest
  path are generated before the check, so an ungenerated intermediate
  cannot silently pass.
- The hole it closed: a player beyond the edge jumping 2-3 tiles onto a
  revealed home tile skipped blocked beyond intermediates entirely.
- Proof `scripts/test-beyond-blockage.js`: PASS, seeds 7/42/99.
  Before/after on identical seeds (proof copied into a `git archive`
  of the slice-3 commit 71310a24): BEFORE fails 12 checks — per seed,
  no beyond blocked tile exists, no beyond needsBridge creek exists,
  and the intermediate jump SUCCEEDS (player moves onto the home
  tile). AFTER passes all bars, including intermediate refusal naming
  the intermediate's block, and the home regression still refuses.
- FOLLOW-UP (same slice, found by the slice-1a guard re-run): slice 4
  made straight-line returns blockable, and axis-aligned returns have
  no second homeward axis — one fallen tree ended the walk. `walkHome`
  now sidesteps perpendicular (toward-home side first, never revisiting
  a tile on the walk, narrated once) and stops honestly only when
  homeward steps AND both sidesteps refuse; on success the returned
  `blocked` is null (a bypassed block is not a stopping block). The
  slice-1a blocked proof now boxes the far position on all four sides
  (strictly harder conditions, same stopped-honestly behavior).
  `docs/MAP.md` walkHome paragraph updated to match.

## Balanced panel (the instrument; pre-registered thresholds the judge)
- Base panel: `git archive 3a5c49f49` root, 16 seeds x 4 policies
  (capable, risk-aware, socialite, winseek), 150 days, 64 cases.
- FIRST branch panel (pre-narrowing slice 2): all 64 paired rows
  diverged; capable `won` 0.625 -> 0.875, `national` 0.875 -> 0.625,
  `luckPit` (socialite) 0.178 -> 0.633, etc. Root cause found by
  reading the diff (not by re-scoring): the broad meander suppression
  removed a global RNG roll from every returning villager's step.
  Thresholds were NOT moved; the code was narrowed instead.
- SECOND branch panel (narrowed slice 2, commit d10a2abb6): all 64 rows
  BIT-IDENTICAL to base; every metric delta 0 across all 4 policies
  (e.g. capable `won` 0.625 -> 0.625, `national` 0.875 -> 0.875).
  Compare decision label reads `review_required` only because 16 seeds
  is screening size, not confirmation size; every metric status is
  `no_material_signal` / `descriptive` with 0 delta and 0-width
  intervals. Raw panels: goal hidden_files
  `fixall-map-panel-compare2.json/.md` (comparison) plus the two
  `panel.json.gz` roots copied alongside.
- Panel lesson recorded: a "harmless" condition reorder that drops an
  RNG roll is a gameplay change in every game that reaches that code.

## Full check (with base/run — never a count without it)
- Branch full run: `node scripts/check.js` in the worktree,
  794 passed, 268 failed in 2904s.
- Base comparison: all 268 failing jobs re-run on the master-base
  archive. 266 fail on base too (152 exit 1, 107 exit 2, 4 timeouts,
  3 exit 3 — harness `ReferenceError: Text is not defined` crashes,
  stale-proof drift such as phone-frame/measurement proofs that fail
  whenever sources change, and load timeouts). 2 pass on base
  (`test-blitz-crisis.js`, `test-determinism-gate-20261014.js`) but
  PASS standalone on branch code (22s: 22 passed, 0 failed; 20s:
  trajectories bit-identical, GREEN) — they hit the check run's 120s
  cap under load, not a regression.
- Spot-checked map-adjacent failures (`test-travel-r6.js`,
  `test-explorer-map-20261008.js`): identical `Text is not defined`
  harness crash on base and branch.
- Pre-existing failure already known from the quick run
  (`test-establishment-r20-fixes-20261020.js` FIX 2, racks-full voice
  gate) reproduced on the main tree at base `3a5c49f49` and counted
  among the 266.
- Caveat: the 266-way base comparison ran in a `git archive` copy (no
  `.git`); git-dependent tests fail there for a different reason than
  on a real checkout. The establishment test is the known git-dependent
  one and was proven pre-existing on the real main tree; the rest fail
  with matching harness/proof errors, not git errors.
- Conclusion: NO branch-caused assertion failure. The 268 are
  pre-existing on base.

## Guards re-run after all slices (worktree, sequential)
- `test-map-beyond-slice.js`, `test-city-districts.js`,
  `test-walk-home.js`, `test-villager-walk-home.js`,
  `test-leg-determinism.js`, `test-beyond-blockage.js`: all PASS,
  0 failures, seeds 7/42/99 each (final re-run after the narrowing).

## Held with reason (NOT landed — do not report as done)
- Far-village ledger (hundreds of villages as registry entries, not
  full sims): HELD — needs the knower-trace audit first (design
  §F4.4: `proposeLink`/`proposeAlliance` require `knowsVillage`, but
  this pass did not verify the proposal traces to a specific knower
  rather than village-level omniscience) plus per-knower provenance
  (which village knows of which, how — rumor from whom, visit by
  whom, when). A ledger entry must never make a village known to
  villagers who never heard of it.
- Leg villages becoming real links/opinions (design B4.1): HELD —
  needs Steve's Q0(a) ruling (below). Wiring links into a sealed,
  run-ending road would strand the feature.
- Arrival courtship advantage (soft bonus for arriving in person):
  HELD — needs the same knower-trace audit (the advantage must belong
  to the arriver or their in-person introduction). Default soft-only
  stands; the hard arrival requirement is Steve's alternative, NOT
  built.
- Establishment 0-arrivals investigation (design Q10: 0 arrivals for
  nine consecutive runs r44-r52): HELD as investigation, NOT built —
  arrivals must walk in by a perceivable approach, never teleported or
  spawned (arrival faucet OUTLAWED under perception law). Needs
  establishment-leg runs; not in this item's build slices.
- Dens (monster lairs): HELD — no den spawn hook exists in the monster
  system; inventing one would move encounter balance without a
  pre-registered encounter bar. Needs monster-side design + proof.
- City people layer (residents, markets, hosts): HELD — any people
  layer must trace to perception (seen arrivals, met hosts), and the
  leg-village/knower-trace work it depends on is held pending Q0(a).
  A city with spawned residents would be a list-fed faucet.
- Interiors as separate enterable rooms: HELD — buildings are already
  "enterable" in the game's sense (stand on the tile and work it); a
  separate interior map layer is a new mode, which the design forbids
  ("built as map content, not a new mode").
- Starting-location content / more playable regions: HELD — home board
  and landing unchanged (still eastern woodlands in practice); which
  regions become playable and what their content is needs a Steve
  call + region content work, not a map-code change.
- Nomad muster volunteer-offers rewrite (design §F1.3): NOT this item
  — belongs to the field-party slice; left untouched to avoid
  collision. Shout-answers-from-place-occupancy + FOLLOW verb (design
  §D2/Q1b): same — field-party slice; slice 2 proves only the return.

## Steve-calls (open, NOT decided here)
- Q0(a) B1 split: road TRAVEL never forfeits, only final DEPARTURE
  forfeits. NOT built; forfeit code untouched. Fallback if rejected:
  pre-departure travel feeds scale, sealed road-ending stays.
- Q0(b) Waves faced on legs count toward seat wave bars: NOT built
  (default NO; design does not depend on it).
- Walk-home kcal tax: NOT built (node travel is free by standing rule;
  inventing a tax would contradict it).
- Which regions become playable / starting-location content: NOT built.
- Arrival courtship advantage numbers / hard arrival requirement: NOT
  built (default soft-only, held pending knower-trace audit).
- City tuning numbers: the 0.12 district rate and 12-tile wilderness
  ring (slice 3), and the 5-tile blockage exemption ring (slice 4), are
  balance calls documented for Steve's overrule — they move only with
  a new pre-registration, never mid-run.
- UI feel: the Walk-home compass button (slice 1a) and city-district
  feel (slice 3) are [needs-eyes] for Steve's phone pass, not proven by
  node tests.

## Metric review (closeout)
- No threshold was moved mid-run at any point. The one mid-course
  correction (slice-2 narrowing) changed CODE to meet the
  pre-registered bar, not the bar to meet the code.
- The first panel comparison is kept in the record (goal hidden_files
  `fixall-map-panel-compare.json/.md`) as the evidence that caught the
  broad meander change; the second comparison
  (`fixall-map-panel-compare2.json/.md`) is the landing verdict.
- Index clobber hit after EVERY safe-commit (bogus staged deletions /
  MM entries for just-committed files; commits themselves verified
  correct via `git show --stat HEAD` + hash-object vs HEAD blob).
  Repaired each time with `update-index --add --cacheinfo`; never
  with `read-tree` (4.5-min restat) or `reset`.
- EPERM container flap hit repeatedly during closeout (writes to
  goal hidden_files, ~/workspace scratch, and /tmp alike, ~30+ min
  episodes). Panel runs were resumed from case cache until the flap
  cleared; no work was forced or bypassed.
