# Pre-registration: map/urban first slice (tackle-map)

Date: 2026-10-28. Design adopted:
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/map-urban-design-20261027.md`
(2026-10-27), with corrections C1-C8 recorded in
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/coord-map-design.md`
before any measurement below. This file is committed BEFORE any judged
sweep. Per docs/MEASUREMENT.md §14, these bars bind: a miss is NO-GO,
never re-scored mid-run. Metric review lives in the results file.

## Slice under test

World coordinates extend past the 9x9 home board (haven stays at 4,4);
beyond tiles generate deterministically from (worldSeed, x, y) and are
stored sparsely in `map.beyond`; the visible window is a 9x9 viewport
centered on the player; the compass reports the way home; one new city
tile kind, `building`, scavenges finite manufactured loot through the
existing ruin-scavenge branch. No gating value changes.

## Binding bars (from the 2026-10-27 design §12, corrections applied)

- BAR 1 (expansion): from a fresh game, the player steps past today's
  edge in at least one direction and arrives on a generated tile that
  was not in the original 9x9 board. Pass: the crossing succeeds and
  the new tile has a kind, a stock value, and a wildlife population
  object (C7: a `building` crossing tile's wildlife object may be
  empty; populated wildlife is asserted on wilderness beyond tiles).
- BAR 2 (moving window): after crossing, the visible 9x9 window is
  centered on the player's new position (viewport, C2), and home is
  outside the window but still reported by the compass with a
  direction and a distance > 0. Pass: window moved AND compass reports
  home direction + distance > 0.
- BAR 3 (urban difference): a `building` tile's scavenge pull returns
  a manufactured good (can, tool, cloth, or medicine) and REDUCES that
  tile's remaining loot; a second pull on the same tile after emptying
  returns nothing, while a wild grove tile's forage pull still regrows
  (stock returns after the regrow step). Pass: finite urban loot AND
  regrowing wild forage, both observed in the same proof run.
- BAR 4 (no regressions, guardrail): the existing game still starts,
  the haven still sits at the center of the starting window, the
  guaranteed ruin and breadbasket grove still generate, and no gating
  value changes (deedGateReady, scale, stage, readiness, table prices
  untouched — verified by diff, not by assertion alone). Pass: all hold.
- BAR 5 (sense test): a human-readable transcript of the crossing and
  the scavenge reads like a player experience — the game SAYS the
  world continues, SAYS what the city tile is, and SAYS what was found
  and what is left. Pass: transcript present in evidence, read by the
  worker, no silent numbers.

## Panel guardrail (C8, added before measurement)

Balanced panel (`scripts/balance-panel.js`), before = master HEAD at
slice start, after = slice HEAD: seeds 7,42,99, policies
capable + risk-aware, 60 days. GO requires bars 1-5 AND panel compare
decision `no_material_signal`, or a material signal attributable
solely to beyond-edge crossings with no survival/progression metric
worsened. A guardrail breach is NO-GO even if bars 1-5 pass.

## Proof protocol

- Proof test: `scripts/test-map-beyond-slice.js` on the shared
  `scripts/sim-harness.js` (`loadGame` + `setupGame`), seeds 7, 42, 99.
  Determinism: same (seed, x, y) regenerated in a fresh load must be
  identical in kind and loot.
- `node scripts/check.js --quick` after the change; closest regression
  suites named in the results file.
- Verdict rule: all five bars + panel guardrail must pass for GO. Any
  miss = HELD/NO-GO with root cause; the design is not killed on a
  missed bar (kill discipline: root-cause first).

## Metric review (filled in after the run, never before)

See `evidence/2026-10-28/map-beyond-slice.md`.
