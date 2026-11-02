# Prereg — sim-creekdetour-b (Loop B fleshout-20261102T1030Z, axis scale-onramp)

Committed BEFORE any judged detour sim. Run: fleshout-20261102T1030Z,
arm sim-creekdetour-b. Worktree branch: sim-creekdetour-b. POLICY /
INSTRUMENT ONLY unless a minimal game-code fix is proven with a proof
test (see below) — no game-default change on a hunch.

## Question (from Loop A 0915Z titanroute PILOT NO-GO, evidence/2026-11-02/sim-titanroute-a.md)

On seed 97307 the titanroute march was refused 20/20 days: marchWalk's
greedy step is travelTo(6,4), refused with blockType "creek" every time
((6,4) is a needsBridge creek tile), while Game.travelBlockage(6,4)
returns null for it in the probe's call shape. Two questions:
(1) Is the creek tile genuinely impassable without a bridge, or is
travelTo over-blocking a tile the scholar could walk around?
(2) Can a perception-lawful policy route around it (step-by-step
adjacent-tile movement avoiding the creek tile, or a bridge if the
village can build one) and reach the lair tile?

Canon read first: docs/CANON.md, docs/MAP.md (one map; creeks run
top-to-bottom; ~35% of creek tiles need a bridge or a swimmer;
travelTo intermediate-blockage scan covers shortest-path tiles),
docs/PERCEPTION.md (perception hints are adjacent-sense only — the
policy below does NOT use perceptionHints; it uses map terrain the
player can see on the board plus the heard lair, see §Perception law).
No titan canon doc exists in docs/ (same finding as titanroute-a);
in-code sources src/js/titans.js, src/data/titans.json,
src/js/havenGrowth.js. No creek/travel canon doc beyond MAP.md §1–2
states the bridge/swim/go-around rule — quoted in the final evidence,
not invented.

## Arms (one arm, two policies, one shared baseline)

- BASELINE: the titanroute arm unchanged — frozen stack tribfloor
  leadfeast + windefer + seatdrive + fullseat-diag, wrapped by
  scripts/policies/titanroute.js (greedy Manhattan-best marchWalk,
  stop on refusal, sound-the-call-once). Env flags:
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1 HERALD=1. DAYS=180.
- CANDIDATE (creekdetour): the same frozen stack, with the march
  replaced by scripts/policies/creekdetour.js — same lair hearing
  (scouts' say line only), same fed/watered/healthy guardrails, same
  sound-the-call-once on arrival, but the walk is:
  1. BFS over orthogonal adjacent steps from the scholar's tile to
     the heard lair, where an edge (from -> neighbor) is passable
     iff Game.travelBlockage(neighbor, from) returns null AND the
     neighbor is not in refusal memory. This is the engine's own
     "Go around" pathfinding (competent.js routeAround precedent);
     it reads map terrain, never a monster roster.
  2. Walk the BFS path hop by hop (one travelTo per adjacent hop,
     no force). If a hop is refused, record the refused tile (and
     the returned blockType) in refusal memory, re-plan from the
     current tile, and continue while hops remain (bounded: at most
     20 hops per march day, same order as the 10-hop greedy loop's
     spirit, widened because a detour is longer than a jump).
  3. Bridge fallback, ONLY if BFS finds no walkable path: if the
     scholar stands adjacent to a needsBridge creek tile that lies
     on a shortest path to the lair, and Game.woodCount() >= 4,
     buildBridge that tile (4 wood, 60 kcal, the engine's own verb)
     and then re-plan. Bridge use is recorded per march day
     (bridgeUsed: tile) and reported separately from pure-detour
     arrivals. If wood < 4, no bridge, march fails honestly.
  4. Swimmer lane: if the scholar has the swimmer ability
     (Game.hasAbility('swimmer')), travelBlockage already passes
     creeks — the BFS then routes straight through and the arrival
     is recorded as swimmer-assisted, not as a detour. (Not expected
     on these seeds; recorded if it happens.)
- No other policy difference: upkeep, fight, chores, go-home leg all
  delegate to the same base. The candidate consumes no RNG beyond
  what the base consumes (BFS tie-breaks are deterministic: lowest
  Manhattan-to-lair, then lowest x, then lowest y).

## Pilot case selection (pre-registered, before any detour run)

Screening runs use the UNCHANGED titanroute arm (baseline
characterization, not judged detour runs). Scan seeds numerically
from 97350 upward: a case is a seed where the titanroute record
shows lair heard AND >= 1 march recorded AND 0 arrivals AND >= 1
march day with steps = 0 (a blocked march). Take the first 7 such
cases, plus mandatory seed 97307, as the 8-seed pilot set. If fewer
than 7 cases appear by 97399, continue numerically past 97400 until
7 are found. Screening records are kept (perseed-creekdetour-b/
screen-*.json) and the pilot list is written into the final
evidence before judged runs are pooled. Pilot seeds are NOT chosen
by detour outcome — a seed enters the pilot on its titanroute
record alone.

## Primary metric, GO threshold, horizon

- PRIMARY METRIC (per seed): "reached" = a march day on which the
  scholar's tile after the march equals the heard lair tile, as
  recorded BOTH by the policy (march record arrived:true, position
  checked in code) AND by the instrument (driver daily-post sample
  scholar tile == lair tile). Disagreement between the two on a
  seed = NO-DATA for that seed (reported, not counted as reached).
- GO (pilot): GO iff seed 97307 is reached AND >= 6/8 pilot seeds
  are reached under the candidate. Secondary split reported for
  every reached seed: pure-detour / bridge-assisted /
  swimmer-assisted. The GO count counts reached seeds regardless of
  split (the task names detour OR bridge as the policy), but a GO
  carried entirely by bridges is reported as "GO via bridge" with
  the detour-only count stated plainly next to it.
- DIAG-GO (alternative, only if the creek is genuinely impassable):
  DIAG-GO iff the candidate reaches 0 pilot seeds AND the evidence
  proves with code citations + a replay trace that no walkable
  detour exists on 97307 (BFS over the full home board from home
  with entry-specific travelBlockage returns no path, and every
  alternative entry to the lair row is itself creek- or
  blockage-gated) AND names the exact bridge/ability that would
  open it (buildBridge cost, or swimmer acquisition). A DIAG-GO
  is a diagnosis verdict, not a routing GO, and is labeled as such.
- A miss of GO (and of DIAG-GO) is NO-GO, never re-scored against
  a friendlier metric mid-run. Metric doubts go under "metric
  review" in the final evidence, for the NEXT run.
- HORIZON: DAYS=180, death-aware (runDays ends on win/loss/over;
  the 180 cap matches titanroute-a for identical-seed
  comparability; dead villages stop simulating, +10d tail max per
  the staged method). Why 180: the titanroute march windows run
  days 59–150, and the pilot must cover the full window plus the
  post-arrival call/fight tail.
- GUARDRAIL (not the primary bar, reported): median end-gameDay
  candidate within 20 days of baseline on identical pilot seeds
  (same bar as titanroute-a GO(3)); deaths per seed reported.
- CONFIRM: NOT in this run. A GO pilot earns a confirm (12–16
  seeds, same selection rule) on a follow-up arm; a NO-GO earns a
  re-diagnosis, not a confirm spend.

## Perception law (Steve 2026-10-28)

The candidate policy may read ONLY: its own tile (Game.map.px/py),
the engine's offered steps (Game.travelTargets()), entry-specific
blockage (Game.travelBlockage(x, y, fromX, fromY)), map tiles the
BFS steps onto (Game.tileAt — board terrain the player sees on the
9x9 board), the heard lair (scouts' say line, anchored regex, as
in titanroute.js), tile-sharing seen with its own eyes
(Game.playerMonster() for the arrival/call logic, inherited from
titanroute.js), wood count (own pack/stash, for the bridge gate),
and swimmer ability (own body, via Game.hasAbility). It may NEVER
read Game.worldMonsters() or any monster roster, live herald
position, or any other village's state for routing. The proof test
asserts this: a stub Game WITHOUT worldMonsters still routes, and
a spying stub records that routing calls only the allowed reads.

## Balanced panel (§15) — limitation, stated up front

As in titanroute-a, the panel (scripts/sweep-compare.js
POLICY_REGISTRY) runs named registry policies only and cannot
express the titanroute/creekdetour composition, so no panel
compare .md is attached. The panel is the instrument and this
prereg's thresholds are the judge; where the instrument cannot
express the comparison, the instrumented driver records (per-seed
JSON, same shape as titanroute-a plus march/detour fields) are the
measurement, and the wall metrics (national/table/wins/wave reach,
median survival) are reported from them.

## Metric review (for the NEXT run, not this verdict)

- (To be filled after the pilot: selection-rule fit, horizon fit,
  bridge-vs-detour counting, refusal-memory scope.)

## Deliverables

- scripts/policies/creekdetour.js (candidate policy)
- scripts/test-creekdetour-b.js (unit proof, green before judged sims)
- scripts/creekdetour-driver-20261102.js (instrumented before/after driver)
- evidence/2026-11-02/sim-creekdetour-b.md (+ per-seed records in
  evidence/2026-11-02/perseed-creekdetour-b/)
- This prereg file, committed before any judged sim.
