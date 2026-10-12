# False "washed-out gap" warnings — root cause & fix (2026-10-12)

Steve's report (live, on phone): "random false washed out path warnings.
Frequently the west node from haven. If you go south then around, you can
see that nothing blocking exists in the other side." Screenshot showed the
nearby panel offering "🌊 Cross the washed-out gap ☉" while at Haven.

## Root cause

World-gen's BLOCKED ROADS step (game.js) checked the WRONG neighbor for its
"never block haven, never block the ruin approach" skip.

A blockage is created as `t.blockFrom = { dx: -dx, dy: -dy }`, and
`travelBlockage()` matches blockFrom against the coming-FROM side — so the
guarded approach origin is `(x-dx, y-dy)`. But the skip checked
`(x+dx, y+dy)`: the opposite tile. Net effect, exactly backwards:

- tiles next to haven COULD roll blockages guarding the haven approach
  (the design comment forbids this);
- blockages guarding harmless far-side approaches were skipped instead.

Repro (scripts/repro-washedout-falsepos.js, pre-fix, 40 worlds): 1 blockage
guarding a haven approach (seed 27: tile (3,4) washed_out — the west node
from haven, Steve's exact case), 6 guarding ruin approaches. The warning is
"false" in the design sense, and because blockages are directional, going
around (entering from another side) shows nothing blocking — his report
verbatim.

The same `blockFrom` path creates fallen_tree and rubble blockages, so the
same false-positive class applied to them; the one fix covers all three.
Creek `needsBridge` has no directional guard and was already honest.

## Fix (src/js/game.js)

1. World-gen skip now checks the actual approach-origin tile `(x-dx, y-dy)`
   for haven/ruin (bounds-checked).
2. New `Game.sweepHavenApproachBlockages()`: drops `blockFrom` entries whose
   guarded approach origin is haven or ruin. Called from `load()` so existing
   saves (including Steve's live one) heal on Continue. Idempotent.
3. Debug scenario `washedout` (src/js/debug-scenarios.js, Story category):
   wild node ≥2 from haven, a REAL washed-out gap on one exit, player at the
   grounds' west edge. Two taps in-fiction: nearby panel → cross (80 kcal).
   PLAYED by the builder (scripts/play-washedout-scenario-20261012.js, 8/8).

## Proof

- scripts/test-washedout-falsepos-20261012.js: 12/12 GREEN on fix; RED on
  pristine HEAD (T1: havenGuards=1, ruinGuards=6; sweep method absent).
- scripts/test-blocked-travel-feedback.js: 13/13 (no regression).
- Save→load round-trip in node: load() true, haven-guarding blockage swept,
  legit blockage kept, map intact.
- scripts/validate-ontology.js: 85/85.

## Not changed

- The nearby panel's offer logic: it fires iff `travelBlockage()` says the
  path is blocked — the same check `travelTo` enforces — so post-fix every
  warning is true. (It triggers on the detail-grid edge rather than travel
  intent, which is eager UX, not a false warning.)
- Creek `needsBridge` generation has no haven skip; a creek on a haven exit
  is a TRUE, visible blockage with go-around intact. Left alone.
