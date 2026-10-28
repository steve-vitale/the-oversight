# sim-creekpath-b — PREREGISTRATION (committed BEFORE any judged run)

## Question
Seed 10757 sat 6 evenings at forest_floor (3,3), distance 2 from haven (4,4),
every direct hop home refused `block:creek`, all 5 tap days lost
(sim-nighttravel-rerun-b corpus, sibling branch sim-nighttravel-b).
Second blocked-path member after the 2126Z fallen-tree strand (seed 99994).
Fix class is DAYTIME CROSSING (bridge / swim / route-around), not an
evening-travel lever. This run answers, in order:

1. What produces `block:creek` — destination tile, hop edge, or an
   intermediate tile on the shortest path?
2. Does daytime travel face the same block, or only evening hops?
3. Can competent daytime trips route around it?
4. Census: how often do blocked-path refusals (creek + fallen-tree + other)
   strand travel-home, and is a creek a permanent terrain block or a
   crossable-with-cost edge?

## Canon note (no invention)
No canon doc covers travel/pathing/blocked-path crossings (CANON.md manifest
lists none; `docs/` grep for travelBlockage/needsBridge hits only SIMULATING.md
and ONTOLOGY/DEAD-LEDGER mentions). The authority used here is the engine
itself: `Game.travelBlockage` / `travelTo` / `clearBlockage` / `buildBridge`
(src/js/game.js), the blockage card in src/js/app.js (`showBlockage`: bridge /
swim / "Go around" — "there's always another way"), and docs/TIME-ECONOMY.md
(node travel is free). No canon is invented for this arm.

## Baseline policy
`competent` (scripts/policies/competent.js) with DEFAULT environment —
COMPETENT_ROUTE_AROUND unset. Deliberately NOT `capable`: capable sets
COMPETENT_ROUTE_AROUND=1, which would mask the finding. The probe is
NON-DESTRUCTIVE: it reads `Game.travelBlockage` and runs a BFS over the same
engine check, and never calls `travelTo`, so probed trajectories are identical
to plain competent. (travelBlockage is a pure read on in-bounds tiles.)

## DIAG primary metric (pilot judges the fix decision, not a game change)
- Population: every evening of a 30-day run where the player ends the day AWAY
  from haven AND the direct hop home (haven in `travelTargets()`) would be
  refused by `travelTo`'s own dest + intermediate scan. Call these
  REFUSED evenings. (Evenings where haven is not offered are out-of-reach,
  not refused — reported separately, not counted.)
- For each REFUSED evening, lawful alternatives (all engine-blessed, all
  available to a human player in daylight):
  - (a) ROUTE-AROUND: a BFS path of orthogonal, travelBlockage-clean steps
    from the player's tile to haven exists (any length; steps are walked
    one adjacent hop at a time, exactly as competent's `routeAround` and
    the card's "Go around" do).
  - (b) CROSSING FIX on the blocking tile, feasible with resources on hand
    at that evening: creek + wood >= 4 (buildBridge) or swimmer ability;
    fallen_tree / rubble / washed_out clearable by `clearBlockage`
    (washed_out scrambles with no wood; fallen_tree yields +2 wood).
- P_alt = REFUSED evenings with >= 1 lawful alternative / all REFUSED evenings,
  pooled over pilot seeds. Reported overall and by block kind, plus the
  route-around-only share and the bridge-only share.
- FIX DECISION BAR (DIAG-GO): P_alt >= 0.50 AND at least one alternative is
  implementable as the worker's OWN new policy file (no sibling-owned files:
  scripts/policies/nighttravel.js, scripts/analyze-nighttravel-b.js,
  scripts/test-nighttravel-rerun-b.js — and no src/js unless cleanly
  non-overlapping). If met, build the arm and judge it under FIX below.
  If not met, land DIAG only (measurement + design + exact next arm).

## FIX primary metric (only if DIAG-GO; identical seeds, before/after)
- Arm A (policy-side, own file): competent + daytime route-around enabled
  for the trip-home walk (the competent `routeAround` path, gated today by
  COMPETENT_ROUTE_AROUND=1 / capable) — the player walks home around the
  block during the day instead of stopping dead at the refusal.
- Primary: pooled STRANDED evenings (evenings ending away while the direct
  hop home would be refused) after <= 50% of before, identical seeds.
- Guards (all must hold): G1 no increase in starvation deaths vs before;
  G2 no death attributable to the crossing itself (death on a route-around
  step or the night after a routed return, counted by the analyzer);
  G3 perception-lawful only — decisions use only the player's own tile,
  home haven, and engine-offered adjacent steps (the competent routeAround
  precedent); NO roster, crew list, or snapshot is fed into any decision.
- If Arm A fails its bar, or the diag shows the binding cases need a bridge
  (BFS-fail + wood on hand), the landing is DIAG + a designed Arm B
  (daytime bridge walk: stand on the blocking tile's approach side,
  buildBridge, walk through) with its own prereg for the next run — Arm B is
  NOT built speculatively in this run.

## Horizon + why
30 days, death-aware (runDays stops at death; dead villages contribute only
their lived evenings). Why 30: the strand in the corpus appears days 25-30;
a 30-day horizon covers the full pattern without paying for a 200-day tail
the question does not need. Never a fixed 200d.

## Seeds
- PILOT: 10750-10757 (8 seeds, the nighttravel rerun pilot band, for direct
  comparability; 10757 is the index case).
- CONFIRM (only if a fix arm is built): 10758-10773 (16 seeds, identical
  seeds before/after).
- No confirm spend on a DIAG-only landing.

## Before/after comparison
Through scripts/balance-panel.js per MEASUREMENT.md §15 when a fix arm exists
(the panel is the instrument, the preregistered threshold is the judge; the
compare .md is attached to the evidence file). For a DIAG-only landing there
is no game/policy change to compare, so no panel run is claimed — the census
itself is the deliverable.

## Metric review
(Completed in the evidence file at run end. A miss is NO-GO, never re-scored
mid-run; metric doubts go here and revisions apply to the NEXT run.)

## Perception law (Steve 2026-10-28, binding)
Villagers know places/routes only through their own senses and experience:
tiles they have been on, a home they live in, a route they traveled.
Sense channel for this arm: the player's own tile (stood on), haven (home,
lived in), and adjacent engine-offered steps (walked one hop at a time,
discovering as they go). The diag BFS peeks at blockage state the way
competent's landed `routeAround` already does; the fix arm walks stepwise
and re-plans on refusal, so no unvisited tile's contents are ever acted on
sight-unseen. NEVER a roster, crew list, or snapshot into a decision.
