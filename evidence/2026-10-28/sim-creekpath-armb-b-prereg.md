# sim-creekpath-armb-b — PREREGISTRATION (committed BEFORE any judged run)

## Question
Arm A (2255Z, sim-creekpath-b) proved the strand mechanism and then failed
at confirm: daytime route-around on `walkTo` legs cut stranded evenings
9 → 3 at pilot but only 14 → 11 at confirm, because the trip-home walk is
not the only return path. The 10757 transcript showed the residual: day 25
ends at (3,3) with the day's last line a creek refusal, because the trip's
final return used a DIRECT `Game.travelTo(haven)` (forageTripSeedFirst's
return leg), not `walkTo` — so route-around never engaged. Arm B fixes the
return leg itself: every trip home tries the detour instead of one blocked
shortcut.

## Substrate (named explicitly — the 2255Z correction, carried forward)
The strand reproduces ONLY under competent + thief grant. Plain competent
ends every evening at home; insideevening ends every evening at home. The
grant is what parks the player at (3,3). All legs in this run use:
- `GRANT_THIEF=1` in scripts/creekpath-trace-b.js: `{ id: 'thief', level: 1 }`
  pushed onto the scholar's abilities before day 1. `competent.daily`
  branches on the thief ability, and the grant is the strand substrate.
- `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1` (same harness
  gates as the 2255Z census; the driver asserts them FATAL).
- `COMPETENT_ROUTE_AROUND` UNSET in every leg (Arm A's flag off — Arm B is
  tested alone, not A+B combined). The only difference between before and
  after legs is the new gate below.

## The change (policy-side, scripts/policies/competent.js trip functions ONLY)
- New gate `COMPETENT_TRIPHOME_ROUTE_AROUND=1` (default off). New helper
  `walkHome(Game, hx, hy)`: sets a module-scoped detour flag, calls the
  existing `walkTo` home walk (which honors route-around only while the
  flag is set), clears the flag, and returns the number of route-around
  steps actually taken (counted in ctx as `tripHomeDetours`). The detour
  is confined to the return leg: no other `walkTo` caller gains
  route-around from this gate.
- Direct `Game.travelTo(hx, hy)` home-returns replaced with `walkHome`:
  - `forageTripSeedFirst`: all three return sites (combat-exit return,
    post-clearing combat-exit return, final return leg).
  - `feastFightRoad`: its patrol return leg (same stranded mechanism: an
    outing that ends away because the single blocked shortcut refused).
- Deliberately left direct (and why):
  - `forageTripSeedFirst`'s catch fallback `travelTo(Game.map.px,
    Game.map.py)` — a self-travel no-op, not a return.
  - All outbound hops (patrol steps, forage picks, rubble-guard approach)
    — not home returns; out of Arm B's scope.
  - `stoneRun`'s and flee paths' existing `walkTo` home walks — already
    hop-by-hop, not direct-travelTo returns; applying the detour flag
    there is a follow-up, not this arm (named in metric review if strands
    persist through them).
- No sibling files, no src/js. scripts/creekpath-probe-b.js is reused
  unchanged. scripts/creekpath-trace-b.js gains one non-destructive field
  per evening row (`movedDuringDay`: player tile unchanged across that
  day's `daily()` call or not) — the instrument is identical across all
  legs, so before/after comparability holds.

## Legs
- BEFORE: pristine master competent.js (direct travelTo returns), gate
  unset. Banked upfront for BOTH bands before the code change, so the
  baseline is guaranteed true current-master behavior even if the branch
  moves later. Banking confirm-before upfront is not a confirm judgment:
  no confirm AFTER spend happens before a pilot pass.
- AFTER: modified competent.js with `COMPETENT_TRIPHOME_ROUTE_AROUND=1`.
- DIAGNOSTIC (not judged): modified competent.js, gate unset, pilot band
  only — splits attribution between hop-by-hop returns alone and the
  detour itself. Reported, never used to re-score the verdict.

## Primary metric (identical seeds, before/after)
Pooled STRANDED evenings = evenings ending away while the direct hop home
would be refused (probe `refused`, same census definition as 2255Z).
- PILOT BAR (10750–10757): after ≤ 50% of before, AND the strand guard
  below holds. Both must hold for a pilot GO.
- CONFIRM BAR (10758–10773, only if pilot passes): after ≤ 50% of before,
  AND the strand guard holds. Both must hold for a GO.
- A miss is NO-GO, never re-scored against a friendlier metric mid-run.

## Strand guard (trajectory-divergence guard, part of the verdict)
Per-seed strand-length table (consecutive `refused` evenings, with tile and
block kind) reported beside pooled counts, never averaged away. Guard: no
seed's longest strand may grow vs before UNLESS that seed's refused-evening
count fell. Rationale (2255Z): enabling route-around re-routes whole days,
so pooled counts mix "same days, fixed" with "different days, different
strands" — conversion is judged on strand breakage, not pooled counts
alone. A primary pass with a guard violation is NO-GO.

## No-trip days (measured separately, never silently folded in)
A no-trip / no-move day is an evening with probe `refused` where
`movedDuringDay` is false: the player never left the tile all day, so no
trip home was attempted (the day-26 class from 2255Z). Reported per leg as
its own count and share of refused evenings, in both legs. They remain
inside the pooled primary (they ARE stranded evenings), but the breakout
line lets any reader see how much of the total no return could ever fix.
A sensitivity line is also reported, not judged: pooled stranded evenings
EXCLUDING no-move days, before vs after.

## Guards (all must hold)
- G1: no starvation-death increase vs before (deaths matching
  /starv|hunger/, pooled; player starvation deaths broken out).
- G2: no death attributable to a crossing — no PLAYER death on a day with
  `tripHomeDetours > 0` or the following day (death day from the corpus
  deaths array, `player: true`).
- G3: perception-lawful only — decisions use only the player's own tile,
  home haven, and engine-offered adjacent steps (the shipped `routeAround`
  precedent: BFS over the engine's own `travelBlockage` check, walked one
  hop at a time). No roster, crew list, or snapshot is fed into any
  decision.

## Horizon + why
30 days, death-aware (runDays stops at death; dead villages contribute
only their lived evenings). Why 30: the strand appears days 25–30; a
30-day horizon covers the full pattern without a 200-day tail the
question does not need. Never a fixed 200d.

## Seeds
- PILOT: 10750–10757 (8 seeds; 10757 is the index case).
- CONFIRM: 10758–10773 (16 seeds, identical seeds before/after).
- No confirm spend on an after leg until the pilot passes its gate.

## Proof test (BEFORE any judged after-run)
scripts/test-creekpath-armb-b.js, seeds 10757 + 10767:
- Placement behavior: fresh game, player placed at the strand tile;
  gate-off `walkHome` stops dead at the refused hop (old behavior);
  gate-on `walkHome` reaches haven via the engine-clean detour when the
  probe's BFS route exists, and moves nothing when no route exists.
- Determinism + gate-off neutrality: a gate-off trace of 10757
  reproduces the 2255Z before-corpus evening probes exactly (same
  trajectory under the new instrument + gated-off code).
- 10767 placement: probe the hop from its strand tile (5,3) to haven and
  assert `walkHome` behavior consistent with the probe (reaches home iff
  a BFS route exists). If the fresh-map hop is clear, the test records
  that instead of forcing a block.
The proof must print PROOF-GREEN before any judged after leg runs.

## Sense-test
Read a sample of routed-return evenings (debug run, same substrate, seeds
10757 and 10767 if it strands): the day's last lines, the detour steps,
and the next morning — judged for meaning, not just counts. A routed
return that reads as a person walking home around a creek is a pass; a
silent teleport or a nonsensical path is a finding, even if counts move.

## Panel limitation (same as 2255Z)
No scripts/balance-panel.js compare is attached: the panel is a long-run
observer harness whose contract metrics do not include stranded evenings.
Panel-style guard metrics (deaths, starvation, wave reach) are reported
from the corpora instead. Claiming a panel run would have measured
something else.

## Metric review
(Completed in the evidence file at run end. A miss is NO-GO, never
re-scored mid-run; metric doubts go here and revisions apply to the NEXT
run.)

## Perception law (Steve 2026-10-28, binding)
Sense channels used: the player's own tile (stood on), haven (home, lived
in), adjacent engine-offered steps walked one hop at a time. The detour
BFS peeks at blockage state exactly the way competent's landed
`routeAround` already does. NEVER a roster, crew list, or snapshot into a
decision.

## Canon note (no invention)
No canon doc covers travel/pathing/blocked-path crossings. Authority:
the engine (travelBlockage / travelTo / clearBlockage / buildBridge), the
blockage card in app.js (bridge / swim / "Go around"), and
docs/TIME-ECONOMY.md (node travel free). Nothing invented.
