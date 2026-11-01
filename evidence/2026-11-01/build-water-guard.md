# Build arm 2 — water-guard arrival (2026-11-01)

## Question

Landing r84 proved the mechanism: the dehydration guard's walk home never
starts when the path is blocked. A fallen_tree at (3,3) refused the
homeward travelTo jump, hydration skipped 6x, arrival 0/4 for scholar Jude
on the r84 panel, and Jude died of dehydration next to a full cistern
(seed 739 shape). When the path is clear the guard arrives immediately
(seed 762 kcal skips). Fix the guard so a blocked path detours, clears,
or drinks instead of silently skipping.

## Mechanism found

Two guards share the failure class, and the standing one is the fix site:

- The r84 outing-guard (driver-only, `scripts/journey-landing-r84-20261101.js`
  outingWork water clause) calls `Game.travelTo(home)` and skips the outing
  regardless of the return. `travelTo` refuses the jump honestly
  (path_blockages_hold: the intermediate scan refuses when ANY shortest-path
  tile is blocked from a shortest-path entry), so the scholar never moves
  and the same tree refuses again the next day — the repeat-skip loop.
- The standing policy guard, `competent.js` THIRST HOME (fires in
  `competent.daily` BEFORE outingWork, so the driver guard only ever fires
  after this one already failed), walks home with `walkTo`, whose own
  comment admits it "just stops at blockages". Same loop, same death.

The game itself needs no change: `Game.walkHome` already detours, and
`Game.clearBlockage` already cuts a fallen_tree for 60 kcal (+2 wood,
permanent). The fix wires the thirst walk to use those existing behaviors.

## Fix (scripts/policies/competent.js, THIRST HOME only)

New `thirstWalkHome(Game, ctx)`, called from THIRST HOME in place of the
bare `walkTo`. No other walkTo leg changes; the global
`COMPETENT_ROUTE_AROUND` gate stays off. Order, documented in code:

1. DETOUR first — one `routeAround` BFS step (the engine's own
   `travelBlockage` check; node travel is free; the tree stays standing),
   then walk again. Costs nothing, so it goes first.
2. CLEAR only when no detour exists — name the blockage from `travelTo`'s
   own return (`{kind:'blockage', blockType, x, y}`, type read back off
   the tile as a fallback), clear it only when affordable (fallen_tree
   60 kcal, rubble 40, washed_out 80 or a 4-wood bridge; never below the
   cost), then walk again. Clearing is permanent, so later days cannot
   re-skip on the same tree. A creek is never hand-cleared (the rule
   excludes it; `clearBlockage` refuses it too) — it records blocked.
3. DRINK IN PLACE last — the existing `drinkSafe` after the walk (bottle
   or creek water buys time). If still wild, `ctx.thirstHomeBlockedType`
   names the block; never a silent skip-and-assume-arrival.

Telemetry (for future instruments): `ctx.thirstHomeDetours`,
`ctx.thirstHomeClears`, `ctx.thirstHomeBlockedN`,
`ctx.thirstHomeBlockedType`. `thirstWalkHome` is exported from
`competent.js` alongside `walkTo`/`walkHome`.

Bounds kept: no `deedGateReady`/stage/scale/gate retunes, no win-price
changes. No change to `src/js` at all — this is policy behavior, so the
player-facing game rules are untouched; the competent player simply stops
dying to a tree it could walk around or cut. The r83/r84 panels were NOT
re-run; their numbers above are cited, and the before/after below comes
from the new proof script on identical seeds.

## Proof: scripts/test-build-water-guard-20261101.js

Drives the REAL `competent.daily` (not a copy of the guard) on seed 739
plus the r84 panel seeds 759–762, in a constructed blocked-path state
(scholar wild, hydration 20, no water carried, kcal 1500 — the water-only
shape). Isolation: `COMPETENT_WARM=0` plus a recovering shield, so daily's
only movement is the thirst walk and recoverStep's homeward walk. One
child process per seed × scenario (harness rule). Scenarios:

- `tree33`: scholar (2,3), fallen_tree at (3,3) guarding the west entry,
  home (4,4) — the r84 geometry.
- `column`: scholar (2,4), a west-guarded fallen_tree on every tile of
  column x=3 — no detour exists, only clearing works.
- `clear`: scholar (2,3), no blockage — control (the seed-762 shape).

Incidental worldgen blockages are swept before planting (a seed-759 creek
on (3,4) refused the "clear" control on the first run — the sweep keeps
each case about its scenario, not its seed's map). Note: the proof's
plant gained `blockFrom.type` between the RED and GREEN runs (faithful to
worldgen, which always sets it); old code had no detour/clear path at all,
so the RED verdict is unaffected.

Before (master code, same script): 5/15 — blocked cases 0/10, scholar
never moved, hydration 20→20 on every blocked case (the r84 shape
exactly); clear controls 5/5.

After (this arm): 15/15 —

| case | seeds | outcome |
|---|---|---|
| tree33 | 739, 759, 760, 761, 762 | arrived (4,4), drank 20→70, 1 detour each, 0 clears |
| column | 739, 759, 760, 761, 762 | arrived (4,4), drank 20→70, 0 detours, 1 clear each |
| clear | 739, 759, 760, 761, 762 | arrived (4,4), drank 20→70, 0 detours, 0 clears (unchanged path) |

`node --check` passes on both changed files. Full `check.js`/jest NOT run
(per arm instructions — other arms running concurrently; only this proof
script was run, via plain node).

## Open / not done

- The r84 driver guard itself still skips unconditionally on a refused
  jump. It is measurement, not game behavior, and editing a dated driver
  post-hoc would falsify the r84 record; a future landing round should
  re-instrument (or the coordinator may queue a driver follow-up). The
  standing policy guard fixed here fires before it, so its failures
  should no longer reach the driver guard.
- `recoverStep`'s homeward `walkTo` shares the stop-at-blockage pattern
  but is out of scope for this arm (it runs after THIRST HOME, which now
  delivers the scholar home first).
- [needs-eyes]: survival feel — a thirsty competent player now cuts a
  tree or walks around one instead of dying beside it. Steve can overrule
  the detour-first call (clear-first would spend 60 kcal + a day-part
  where a sidestep exists).

## Commit

Branch `build-water-guard`, message carries `[needs-eyes]`. Coordinator
merges; this arm does not merge, push, bump, or verify live.
