# sim-creekpath-b — creek blocked-path: DIAG-GO, fix arm NO-GO at confirm

## Verdict
- DIAG: GO. Pilot P_alt = 1.000 (9/9 refused evenings had a lawful daytime
  alternative); pooled pilot+confirm census P_alt = 1.000 (23/23 refused
  evenings across the before legs — every refused hop had a route-around).
- FIX ARM A (competent + daytime route-around on trip-home walks):
  pilot GO (stranded evenings 9 → 3, bar ≤ 4) but CONFIRM NO-GO
  (stranded evenings 14 → 11, bar ≤ 7; only a 21% reduction).
  Per the prereg bar, Arm A is KILLED and leaves no trace: its policy file
  is deleted, not committed. This landing is MEASUREMENT + DESIGN ONLY.
- The game change, if any, belongs to the next arm (below), not this one.

## The four diag questions, answered
1. WHAT PRODUCES `block:creek`? An INTERMEDIATE tile, not the destination
   and not an edge. Proof (scripts/test-creekpath-b.js, PROOF-GREEN):
   fresh game seed 10757, player placed at (3,3), hop to haven (4,4):
   probe and engine agree — `block:creek` at tile (3,4), leg
   intermediate. (3,4) is a creek tile with `needsBridge` (35% of creek
   tiles roll this at world-gen); the player has no swimmer ability and
   no bridge. The destination (4,4, haven) is clean; the other shortest
   path (3,3)→(4,3)→(4,4) is clean too. `travelTo` refuses when ANY
   shortest-path intermediate is blocked — it never tries the other
   shortest path. A creek is a CROSSABLE-WITH-COST edge, not permanent
   terrain: bridge (4 wood, 60 kcal), swim (swimmer ability, 20 kcal),
   or go around — the blockage card itself offers all three.
2. DAYTIME vs EVENING? The same block, identically. `travelBlockage`
   takes no time input; the engine check is time-agnostic. Evening hops
   only OBSERVE the strand — daytime trips create it, because the
   trip-home walk stops dead at the refusal (see 3).
3. CAN COMPETENT DAYTIME TRIPS ROUTE AROUND IT? Only with the opt-in
   flag. Default competent: `walkTo` stops dead at the first refused step
   (no route-around). With COMPETENT_ROUTE_AROUND=1 (the flag capable
   sets), `walkTo` BFS-steps around via `routeAround` — competent's own
   shipped code, the card's "Go around" button made automatic.
4. CENSUS: across 24 before-leg seeds (8 pilot + 16 confirm, 30 days,
   competent + thief-grant substrate — see Metric review), 23 refused
   evenings, ALL intermediate-leg: creek 14, rubble 5, washed_out 4
   (pilot before-leg: creek 6, rubble 3; confirm before-leg: creek 8,
   rubble 2, washed_out 4).
   Route-around existed for 23/23; crossing-fix feasible for only 9/23
   (rubble/washed_out clearable; every creek case had wood 0 and no
   swimmer, so bridge/swim were infeasible — the route is the only
   alternative for creeks). Strands run 2–8 evenings at one tile
   (10767: 8 evenings at wetland (5,3); 10757: 6 at forest_floor (3,3)).

## Before/after (identical seeds, thief-grant substrate, 30 days)
Primary (prereg): pooled STRANDED evenings = evenings ending away while
the direct hop home would be refused. Bar: after ≤ 50% of before.
Guards: G1 no starvation-death increase; G2 no crossing-attributable
death; G3 perception-lawful only.

| band | before | after | bar | verdict |
|---|---|---|---|---|
| pilot 10750–10757 | 9 (10752: 3 rubble, 10757: 6 creek) | 3 (10757: 3 creek; 10752: 0) | ≤ 4 | GO (67% cut) |
| confirm 10758–10773 | 14 (10762: 4, 10767: 8, 10772: 2) | 11 (10767: 9, 10772: 2, 10762: 0) | ≤ 7 | NO-GO (21% cut) |
| pooled | 23 | 14 | ≤ 11 | NO-GO (39% cut) |

Guards (confirm): G1 starvation deaths 8 → 7 (hold); G2 player deaths
17 → 14, no death on a routed-return day identified (hold); G3 hold —
decisions use only the player's own tile, home haven, and engine-offered
adjacent steps (competent's shipped routeAround mechanism).
No guard violation; the failure is the primary alone.

## Why Arm A only half-works (the residual mechanism)
Transcript read, creekpath-10757 days 25–28 (debug run, same substrate):
- Day 25 ends at (3,3) with the day's LAST line "The creek runs fast
  here" — a trip's final return used a DIRECT `Game.travelTo(haven)`
  (forageTripSeedFirst's return leg), not `walkTo`, so route-around
  never engaged. Day 28 shows the detour working ("Travel 1 tile to
  grove… Travel 1 tile to Haven… 'Knew you'd walk back in'").
- Day 26 has NO travel at all: the player spends the day looting and
  talking at (3,3) — some days daily never attempts a trip home.
So route-around fixes only the `walkTo` legs. Direct-travelTo returns
and no-trip days still strand. A second mechanism also showed up in
confirm: enabling route-around changes whole daytime trajectories
(10767: deaths 28 → 4, wave reach 2 → 1, strand 8 evenings → 3 strands
of ≤ 3 plus one extra refused evening) — before/after on stranded
evenings is confounded by trajectory divergence, not a clean
ceteris-paribus. The next arm's prereg must carry a divergence guard
(per-seed strand lengths reported beside pooled counts, never averaged
away silently).

## Sense-testing (transcripts read, not just counts)
- The strand itself is SILENT from the villager's side: day 25's last
  line is the refusal, then nothing — no "I'll camp here", no plan for
  tomorrow, no complaint. The engine narrates honestly; the villager
  never reacts to being stuck. That missing reaction is a blank (the
  fix arm, not a narration pass, is the answer — but a stranded
  villager who never comments on 6 nights away is a sense gap worth
  one line when the next arm lands).
- Village life around it is coherent: Dina mimes across the Russian
  gap ("pointing at themselves, then at you, then toward the hollow"),
  garden work, orders, squirrel gifts, gossip that mutates by the fire
  ("barely the same story now"). Villagers act like people; the travel
  system is what strands them, not their behavior.
- 10770's before leg is a useful control: 3 away evenings with hop
  CLEAR (expeditions, not strands) — away ≠ stranded, and the probe
  keeps them separate.

## Village assessment (plain words)
The village itself is healthy in these runs: every pilot seed survived
30 days, median survival 30 days, wave 2 reached in most seeds, wave-1
kills throughout. The blank is narrow and specific: a villager one tile
from home, with an open two-step detour, can sit away for a week
because the trip home tries one blocked shortcut and gives up. Food
was never the binding constraint here (wood 0 at every creek refusal
is a bridge-feasibility note, not starvation — starvation deaths were
zero in the pilot). The fix is a walk-home that tries the other way
round, not more food, not a new system.

## Wall numbers (this run's horizon)
30-day horizon, so scale metrics are out of reach by construction:
national / table / wins = NOT MEASURED here (not zero — a 30-day run
cannot reach them; the long-run scale wall is the coordinator's
loop-level number, not this arm's). Measured: wave reach max 2
(wave-2 kills in most seeds), median survival 30 days (pilot) /
30 days (confirm; two village-lost ends at 28 and 22 days),
death-cause shares dominated by villager combat, starvation 0 (pilot) /
8 before → 7 after (confirm, pooled).

## Metric review (binding; a miss is NO-GO, never re-scored)
- PREREG DEVIATION (disclosed, not a re-score): the prereg baseline was
  plain competent, but the reported strand did NOT reproduce under
  plain competent OR insideevening — both ended every evening at home.
  It reproduced EXACTLY (10757 days 25–30 at (3,3), same tile, same
  block, same route) only after adding the nighttravel corpus driver's
  thief-ability grant. Competent.daily branches on the thief ability,
  and the grant is what parks the player at (3,3). The census therefore
  ran under competent + thief grant (the corpus substrate). The metric
  (P_alt) and all bars are unchanged; only the substrate is corrected,
  and the negative control (ungranted pilot: 3 refused evenings, all
  rubble, on 10752 alone) is committed beside it. Next preregs for
  blocked-path work must name the grant explicitly.
- PANEL LIMITATION: no scripts/balance-panel.js compare is attached.
  The panel is a long-run observer harness whose contract metrics do
  not include stranded evenings; this arm's primary is a bespoke
  census on identical seeds with the preregistered threshold as judge.
  Panel-style guard metrics (deaths, starvation, wave reach) are
  reported from the corpora instead. Claiming a panel run would have
  measured something else.
- TRAJECTORY DIVERGENCE (metric doubt for the NEXT run): enabling
  route-around re-routes whole days, so pooled stranded evenings mix
  "same days, fixed" with "different days, different strands". The
  next prereg should add a per-seed strand-length table as a guard
  and judge conversion on strand breakage, not pooled counts alone.
- NO metric was re-scored mid-run. The pilot GO did not carry the arm
  past the confirm NO-GO.

## Next arm (exact; for the next run's prereg)
ARM B — route-around-aware trip returns (design, NOT built here).
- Change (policy-side, scripts/policies/competent.js trip functions
  ONLY — no sibling files, no src/js): replace direct
  `Game.travelTo(hx, hy)` home-returns in competent trip functions
  (starting with forageTripSeedFirst's return leg) with the
  `walkTo` home walk (which honors route-around), so every trip home
  tries the detour instead of one blocked shortcut. No-trip days
  (day-26 class) are measured separately, not silently folded in.
- Metric: pooled stranded evenings, identical seeds, bar after ≤ 50%
  of before, PLUS per-seed strand-length guard (no seed's longest
  strand may grow vs before unless its count falls).
- Band: pilot 10750–10757, confirm 10758–10773, same thief-grant
  substrate (named in the prereg this time), 30 days, death-aware.
- Files: scripts/policies/competent.js (trip returns only),
  scripts/creekpath-probe-b.js (reuse — committed here),
  scripts/test-*.js proof on 10757 + 10767 before any judged run.
- Why this arm and not a bridge arm: every creek refusal had wood 0,
  so a bridge arm would first need a wood-gathering behavior — a
  bigger build for a rarer payoff than fixing the return leg.

## Perception law statement
Sense channels used: the player's own tile (stood on), haven (home,
lived in), adjacent engine-offered steps walked one hop at a time.
The diag BFS uses the same engine blockage check competent's shipped
routeAround already uses. No roster, crew list, or snapshot was fed
into any decision in this run.

## Canon note
No canon doc covers travel/pathing/blocked-path crossings (CANON.md
manifest lists none). Authority used: the engine (travelBlockage /
travelTo / clearBlockage / buildBridge), the blockage card in app.js
(bridge / swim / "Go around"), and TIME-ECONOMY.md (node travel free).
Nothing invented.

## Infrastructure notes (loud)
- worktree-heartbeat.sh hung on its registry lock twice in this run
  (first attempt killed after 60s; second completed but its
  heartbeat line was not visible in output). Registry read-back shows
  sim-creekpath-b heartbeat 2026-10-28T23:00:16Z, status active —
  verified by read, not trusted from the script's output.
- safe-commit index clobber (known class): after the prereg commit,
  this worktree's index showed the committed prereg as staged-deleted
  while the worktree file was byte-identical to HEAD (hashes matched:
  e685bbb033573254440c197a164e12a2649007f1). Repaired with
  `git update-index --add --cacheinfo` per the standing lesson; the
  commit itself was correct. The coordinator should verify HEAD, not
  the index, after merging.

## Evidence / tooling (committed on branch sim-creekpath-b)
- Prereg: evidence/2026-10-28/sim-creekpath-b-prereg.md
- This file: evidence/2026-10-28/sim-creekpath-b.md
- Probe (shared): scripts/creekpath-probe-b.js
- Census driver: scripts/creekpath-trace-b.js
- Analyzer: scripts/analyze-creekpath-b.js
- Proof: scripts/test-creekpath-b.js (PROOF-GREEN, 9/9 checks)
- Corpora: evidence/2026-10-28/sim-creekpath-b-corpus-competent/ (ungranted pilot, negative control),
  sim-creekpath-b-corpus-competent-thief/ (pilot before),
  sim-creekpath-b-corpus-creekpath/ (pilot after — Arm A, killed),
  sim-creekpath-b-corpus-insideevening/ + -insideevening-thief/ (reproduction experiment),
  sim-creekpath-b-confirm-competent/ (confirm before),
  sim-creekpath-b-confirm-creekpath/ (confirm after — Arm A, killed).
- NOT committed (killed arm, leaves no trace): scripts/policies/creekpath.js — deleted.
