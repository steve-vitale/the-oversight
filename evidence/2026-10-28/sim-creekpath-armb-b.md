# sim-creekpath-armb-b — route-around-aware trip returns: GO (pilot + confirm)

## Verdict
- PILOT (10750–10757): GO. Pooled stranded evenings 9 → 3, bar ≤ 4;
  strand guard holds on every seed; G1 hold (0 → 0); G2 hold (no player
  death on a detour day); G3 hold by construction.
- CONFIRM (10758–10773): GO. Pooled stranded evenings 14 → 4, bar ≤ 7
  (a 71% cut); strand guard holds on every seed; G1 hold (8 → 7
  starvation deaths, player 2 → 1); G2 adjudicated HOLD on investigated
  evidence (see below — the single detector hit is a death identical in
  the before leg, not attributable to any crossing); G3 hold.
- POOLED pilot+confirm: 23 → 7 stranded evenings (a 70% cut).
- The arm is READY TO MERGE as committed (gate default off in the policy
  file; the measured effect is with `COMPETENT_TRIPHOME_ROUTE_AROUND=1` —
  see Landing note). The residual strands are a characterized next arm
  (Arm C, designed below, NOT built here).

## What changed (policy-side, scripts/policies/competent.js ONLY)
- New helper `walkHome(Game, hx, hy)` + gate
  `COMPETENT_TRIPHOME_ROUTE_AROUND=1` (default off): sets a module-scoped
  detour flag, calls the existing `walkTo` home walk (which honors
  route-around only while the flag is set), clears the flag, and returns
  the number of route-around steps actually taken (banked in
  `ctx.tripHomeDetours` for the census). The detour is confined to the
  return leg — no other `walkTo` caller gains route-around from this gate.
- Direct `Game.travelTo(hx, hy)` home-returns replaced with `walkHome`:
  `forageTripSeedFirst` (all three return sites) and `feastFightRoad`
  (patrol return). Deliberately left direct: the catch fallback self-travel
  (a no-op, not a return); all outbound hops; `stoneRun`/flee `walkTo`
  home walks (already hop-by-hop, detour flag not applied — a follow-up
  candidate, named below).
- Instrument: scripts/creekpath-trace-b.js gains `movedDuringDay` (player
  tile unchanged across that day's `daily()` call) and `tripHomeDetours`
  per evening row — non-destructive reads, identical across all legs.
  scripts/creekpath-probe-b.js reused unchanged. No sibling files, no src/js.

## Before/after (identical seeds, competent + thief-grant substrate, 30 days)
Substrate (prereg, named explicitly): `GRANT_THIEF=1` — `{ id: 'thief',
level: 1 }` pushed before day 1; plain competent ends every evening at
home, so the strand reproduces only under this grant. Harness gates
`COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1` all legs;
`COMPETENT_ROUTE_AROUND` unset all legs (Arm A tested alone, not A+B).

| band | before | after | bar | verdict |
|---|---|---|---|---|
| pilot 10750–10757 | 9 (10752: 3 rubble, 10757: 6 creek) | 3 (10752: 3 rubble; 10757: 0) | ≤ 4 | GO (67% cut) |
| confirm 10758–10773 | 14 (10762: 4, 10767: 8, 10772: 2) | 4 (10762: 4; 10767: 0, 10772: 0) | ≤ 7 | GO (71% cut) |
| pooled | 23 | 7 | ≤ 11 | GO (70% cut) |

Sensitivity (excl no-move days, reported not judged): pilot 2 → 1,
confirm 3 → 1, pooled 5 → 2. The cut holds on move-days alone.

## Per-seed strand table (confirm; pilot strands in the analyzer output)
Before: 10762 len 4 at trail_edge (5,5), washed_out@5,4; 10767 len 8 at
wetland (5,3), creek@4,3; 10772 len 2 at trail_edge (4,1), rubble@4,2.
After: 10762 len 4 UNCHANGED (same tile, same block, same days 13–16);
10767 len 0 (detour day 4, 1 step); 10772 len 0 (see G2 note — the day-10
detour served an away-origin return, and the strand's root day still broke
because the player ended day 10 at hop-clear (4,3) instead of refused
(4,1), then ended day 12 at home). No seed's longest strand grew; the
strand guard holds everywhere, pilot and confirm.

## Attribution (diagnostic gate-off leg, pilot band, not judged)
Modified code with the gate UNSET reproduces the before leg exactly
(10757: 6 refused, 10752: 3 refused; deaths identical). Hop-by-hop
returns alone fix NOTHING — the detour is the entire effect. This is the
cleanest attribution in the creekpath series: Arm B's gain is the detour,
not the walk.

## Guards
- G1 (starvation): pilot 0 → 0; confirm 8 → 7 (player 2 → 1). HOLD.
- G2 (crossing-attributable death): the analyzer's naive detector fired
  ONCE (confirm seed 10772, player death day 11, starvation, detour day
  10). Investigated, it is NOT attributable to any crossing, and the
  verdict rests on that investigation (disclosed here, not hidden):
  - The day-11 starvation death is IDENTICAL in the before leg: same day,
    same cause, same kcal path (588 → 106 → death). A death that happens
    with or without the detour cannot be attributed to the detour.
  - The day-10 detour was not even a home return: the player started day
    10 away (day-9 combat stranded them at (4,3)), so the trip's origin —
    and `walkHome`'s target — was the away tile (4,3). The 2 detour steps
    served an away-origin return. The player ended day 10 at hop-clear
    (4,3) instead of refused (4,1) and ended day 12 at home.
  - Node travel is free (TIME-ECONOMY.md): the detour cost the player
    nothing — kcal at every observed evening is identical across legs.
  - No death occurred ON a detour step anywhere in the run; no other
    player death falls on or after a detour day in either band.
  - Detector flaw for the next run (metric review): the naive "death on
    detour day or next day" rule cannot distinguish a new death from a
    carried-over one. Next G2 must count only player deaths on/after
    detour days that do NOT also occur in the before leg on the same day
    with the same cause.
  - STRICT-LITERAL NOTE: read as a pure coincidence rule with no
    before-leg comparison, G2 would say VIOLATION and the verdict would
    be NO-GO. The coordinator may overrule to that reading; the evidence
    for the adjudication above is in the corpora (10772 before/after
    evening rows days 8–13, deaths arrays).
- G3 (perception-lawful): HOLD by construction — own tile, home haven,
  engine-offered adjacent steps only (the shipped `routeAround`
  precedent: BFS over the engine's own `travelBlockage` check, walked one
  hop at a time). No roster, crew list, or snapshot fed into any decision.

## No-trip days (measured separately, never silently folded in)
No-move refused evenings (player never left the tile that day, so no trip
home was attempted — the day-26 class): pilot before 7/9, after 2/3;
confirm before 11/14, after 3/4; pooled before 18/23, after 5/7. Most
stranded evenings in BOTH legs are no-move days: the strand's first day
is a failed return, and the following days the villager simply never
attempts a trip home. Arm B breaks strands at their root (the return leg)
but cannot touch no-move continuation days — that is Arm C's work (below).

## The residual mechanism (why 10752 + 10762 still strand)
Both residual seeds are the same shape, byte-identical trajectories
across before/after/diag legs (10762 deaths 14 = 14, same player deaths):
- Root day: the player MOVED (movedDuringDay=true) but took ZERO detour
  steps — the return that failed was not a covered trip return (not
  forageTripSeedFirst/feastFightRoad), even though a BFS route existed
  (10752: len 5 around rubble@2,4; 10762: len 2 around washed_out@5,4).
- Continuation days: no-move, no trip attempted, nothing targets home.
- The policy has NO standing "go home" rule: returns only happen inside
  trips, and trips originate wherever the player woke up. When a player
  starts the day away (combat, expedition), trips return to the away
  origin — home is never the target.
- Starkest single case (10772 day 11, after leg): a starving villager
  (106 kcal) at hop-CLEAR (4,3), one step from home, who never moves all
  day and starves — because no trip fired and nothing else says "go home".

## Sense-testing (transcripts read, not just counts)
- 10757 day 25 (detour day, gate on): the trip forages out to (3,3), the
  direct hop home is refused with the honest line "The creek runs fast
  here — no crossing without a bridge or a swim", then "Travel 1 tile to
  grove" → (4,3), "Travel 1 tile to Haven" → home, "You walk back into
  Haven. 18 Codex entries. The village is glad to see you." A person
  walking home around a creek, narrated step by step — no silent
  teleport, no nonsense path. (The Hummice follows and stops at the
  treeline; the refusal line still speaks before the detour, as it should.)
- 10767 day 4 (detour day): forage at wetland (5,3), same honest refusal,
  detour via creek (5,4), "Travel 1 tile to Haven", "You walk back into
  Haven." The 8-evening strand never forms. Village life around it is
  coherent (gossip mutating by the fire, named villagers, journal notes).
- PASS on meaning. One instrument note: the debug transcript prints some
  lines twice (two travel-to-creek legs in one day, repeated gossip) —
  that is the debug instrument's capture, not a game narration bug; the
  detour sequence itself is single and clean.

## Trajectory divergence (disclosed, not hidden)
Breaking strands re-routes whole villages, as 2255Z warned: 10767 deaths
28 → 10 with the player starvation death eliminated (wave reach held at
2); 10770 deaths 14 → 6 with both player deaths eliminated; 10757 deaths
11 → 6. Conversely 10772 deaths 10 → 17 with a new day-28 successor death
("the wild") 18 days after the detour — divergence noise, not a guard hit
(no detour day nearby, successor not the detoured player). Median
survival 30 days in both bands, both legs; wave reach max 2 (pilot) / 3
(confirm 10772 after, on the diverged path). Nothing here overturns the
primary, but pooled counts alone would hide all of it — hence the strand
table.

## Village assessment (plain words)
The village is healthy in these runs — every pilot seed survived 30 days,
confirm median survival 30 days, wave-2 kills throughout. The blank Arm B
filled is narrow and specific: a trip home that tried one blocked shortcut
and gave up. Now the trip home tries the other way round, and the
week-long creek strands are gone — the index case (10757, six nights at
(3,3)) and the eight-night wetland strand (10767) both break on the first
detoured return. What remains is not a pathing failure but a missing
habit: villagers have no standing rule to go home. When nothing calls
for a trip, an away villager just stays away — even starving, even with
a clear hop home. That is the next blank, and it is bigger than the detour.

## Wall numbers (this run's horizon)
30-day horizon, so scale metrics are out of reach by construction:
national / table / wins = NOT MEASURED here (not zero — a 30-day run
cannot reach them; the long-run scale wall is the coordinator's
loop-level number, not this arm's). Measured: wave reach max 2 (pilot) /
3 (confirm, diverged 10772), median survival 30 days both bands both
legs, starvation deaths 8 → 7 (confirm), player starvation deaths 2 → 1.

## Metric review (binding; a miss is NO-GO, never re-scored)
- No metric was re-scored mid-run. Primary, strand guard, and G1 passed
  as written. G2 is adjudicated, not re-scored: the prereg's G2 definition
  is attributability ("no death attributable to the crossing itself"),
  and the before leg supplies the counterfactual — the single detector
  hit is the same death without the crossing. The strict-literal reading
  (coincidence rule, no counterfactual) is disclosed above for overrule.
- G2 DETECTOR REVISION (for the next run): count only player deaths on
  or after detour days that do NOT also occur in the before leg on the
  same day with the same cause. A detector that fires on identical
  outcomes in both legs is a broken instrument, not a safety signal.
- DETOUR-DAY DEFINITION REVISION: `tripHomeDetours > 0` counts detours
  on returns to ANY trip origin, including away origins (10772 day 10).
  Next runs should record the walkHome TARGET (home vs away origin) so
  "routed home return" and "routed away return" are never conflated again.
- PANEL LIMITATION (same as 2255Z): no scripts/balance-panel.js compare
  is attached — the panel's contract metrics do not include stranded
  evenings; panel-style guard metrics (deaths, starvation, wave reach)
  are reported from the corpora instead.

## Next arm (exact; design, NOT built here)
ARM C — the standing go-home rule (the 10752/10762 residual + the
10772-day-11 starvation case).
- Change (policy-side, competent.js daily flow ONLY): when the player
  starts the day away from haven and no trip fires that day, walk home
  (walkHome, detour flag on) as a standing step — not trip-coupled.
  Alternatively or additionally: anchor trip origins to haven when the
  player starts away (return target = haven, not the away tile), and
  extend the detour flag to `stoneRun`'s walkTo home walks.
- Metric: pooled stranded evenings on the SAME bands + substrate, bar
  after ≤ 50% of the Arm B after-leg (the new baseline); strand guard
  unchanged; no-move refused evenings as a PRIMARY breakout (Arm C's
  target is exactly the no-move class, so the breakout becomes the story,
  not a footnote); G2 with the revised counterfactual counting above.
- Why this arm and not more detour coverage: the detour already works
  wherever a covered return runs (10757, 10767, 10772's root day all
  break). The remaining strands never RUN a covered return — no return
  leg, covered or not, can fix a day with no return attempt.

## Landing note (for the coordinator)
- Branch sim-creekpath-armb-b is READY TO MERGE as committed: prereg
  358ed1934, code+tools b56b806e, evidence+corpora in the final commit
  below. The gate defaults OFF in the policy file, so merging changes no
  measured behavior until a driver sets
  `COMPETENT_TRIPHOME_ROUTE_AROUND=1` — if the intent is that trips
  always detour home, the landing should flip the default (or the ship
  loop's harness should set the gate); that call is the coordinator's,
  not a silent default change by this worker.
- Proof: scripts/test-creekpath-armb-b.js PROOF-GREEN (9/9 checks: 10757
  + 10767 placement behavior gate-off/gate-on, gate-off trace reproduces
  the 2255Z before-corpus evening probes exactly).
- No push, no version bump, no live verification (ship loop owns those).
  Report: merged locally, pending ship (once the coordinator merges).

## Perception law statement
Sense channels used: the player's own tile (stood on), haven (home, lived
in), adjacent engine-offered steps walked one hop at a time. The detour
BFS peeks at blockage state exactly as competent's landed `routeAround`
already does. No roster, crew list, or snapshot was fed into any decision.

## Canon note
No canon doc covers travel/pathing/blocked-path crossings. Authority:
the engine (travelBlockage / travelTo / clearBlockage / buildBridge), the
blockage card in app.js (bridge / swim / "Go around"), and
docs/TIME-ECONOMY.md (node travel free). Nothing invented.

## Evidence / tooling (committed on branch sim-creekpath-armb-b)
- Prereg: evidence/2026-10-28/sim-creekpath-armb-b-prereg.md
- This file: evidence/2026-10-28/sim-creekpath-armb-b.md
- Change: scripts/policies/competent.js (walkHome + trip returns only)
- Instrument: scripts/creekpath-trace-b.js (movedDuringDay, tripHomeDetours)
- Analyzer: scripts/analyze-creekpath-armb-b.js
- Proof: scripts/test-creekpath-armb-b.js (PROOF-GREEN, 9/9 checks)
- Sense-test instrument: scripts/creekpath-transcript-armb-b.js
- Corpora: evidence/2026-10-28/sim-creekpath-armb-b-corpus-before-pilot/
  (8 seeds, pristine), -before-confirm/ (16 seeds, pristine),
  -after-pilot/ (8 seeds, gate on), -after-confirm/ (16 seeds, gate on),
  -diag-gateoff-pilot/ (8 seeds, modified code gate off, diagnostic).
