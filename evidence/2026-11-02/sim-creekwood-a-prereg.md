# Prereg — sim-creekwood-a (Loop B fleshout-20261102T1155Z, axis scale-onramp)

Committed BEFORE any judged creekwood sim. Run: fleshout-20261102T1155Z,
arm sim-creekwood-a. Worktree branch: sim-creekwood-a. POLICY /
INSTRUMENT ONLY — zero src/js changes (no new system; see §Wood leg
for why takeWood/cutTree need no engine change).

## Blank taken (from the 1030Z closeout, scale-onramp blank #2)

Seed 97396: its lair tile (6,4) IS itself a needsBridge creek tile,
and (5,4) is a second needsBridge creek — a double-creek wall.
Under the creekdetour policy it never arrives, and woodCount = 0
on all 17 bridge-eligible march days, so even the single-creek
bridge fallback fails honestly. This arm builds two legs, measured
SEPARATELY and never bundled into one verdict:

(a) walk-toward-then-bridge — bridge the first creek, walk onto
it, bridge the second, so a lair tile that is itself a creek
becomes enterable. Creekdetour's bridge fallback bridges at most
once per march and only from an adjacent tile, so it cannot cross
two creeks in series: after bridging (5,4) it still finds no BFS
path (the lair (6,4) is itself gated) and stops. Creekwood loops:
bridge an adjacent needsBridge creek, and when no path exists and
no adjacent creek remains, ADVANCE along the best reachable tile
strictly closer (Manhattan) to the lair — onto a just-built bridge
when that is the step — then bridge again. At most 8
bridge/advance rounds per march day, hop cap 20, replan cap 3
(same caps as creekdetour, plus the advance loop).

(b) a wood-gathering leg — when wood < 8 at a march day (two
bridges' worth; 4 wood per bridge + 60 kcal per MAP.md /
creekdetour evidence), route to gather wood BEFORE the march
using ONLY existing engine verbs: Game.takeWood() (up to 4 logs
from the village pile per call, 2 kg each, carry-gated — no
position gate in code) repeated until wood >= 8 or a call adds
nothing (pile empty or carry-full, recorded from wood/pile
deltas). Game.cutTree is an existing engine verb too, but it is
NOT used in this leg: it requires standing on a grove tile with a
tree cell within Chebyshev 1 of the scholar's micro-position and
costs a day-part, which a march-day evening leg cannot honestly
drive. If the pile is empty on 97396, the wood leg fails
honestly and the arm reports DIAG (see below) — no verb is
invented, no state is edited outside engine verbs.

## Canon read first

docs/CANON.md, docs/MAP.md §1–2 (creeks top-to-bottom, ~35% of
creek tiles need a bridge or a swimmer; bridge it, swim it, or go
around; buildBridge = 4 wood + 60 kcal + 96 ticks), the creekdetour
evidence + prereg (this worktree, evidence/2026-11-02/
sim-creekdetour-b.md, sim-creekdetour-b-prereg.md), and the 1030Z
closeout (sim-scale-onramp-round-1030.md). No titan canon doc
exists in docs/ (same finding as creekdetour/titanroute); in-code
sources src/js/titans.js, src/data/titans.json. No creek/travel
canon doc beyond MAP.md §1–2 states the bridge/swim/go-around
rule — quoted in the final evidence, not invented.

## Arms (one candidate, one shared baseline)

- BASELINE (creekdetour): the frozen stack tribfloor leadfeast +
  windefer + seatdrive + fullseat-diag, wrapped by
  scripts/policies/creekdetour.js (BFS detour + refusal memory +
  single-bridge fallback + swimmer lane, same sound-the-call-once
  rule). Env flags: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1. DAYS=180.
- CANDIDATE (creekwood): the same frozen stack, with the march
  replaced by scripts/policies/creekwood.js — same lair hearing
  (scouts' say line only), same fed/watered/healthy guardrails,
  same sound-the-call-once on arrival, but the march is:
  1. Wood leg (above) before the march, every march day wood < 8.
  2. Walk-toward-then-bridge march (above) instead of
     creekdetour's single-bridge march. Detour BFS, refusal
     memory, and swimmer lane are otherwise identical to
     creekdetour, so non-two-creek seeds should behave the same
     except where the wood leg fires.
- No other policy difference: upkeep, fight, chores, go-home leg
  all delegate to the same base. The candidate consumes no RNG
  beyond what the base consumes (deterministic tie-breaks).

## Primary metric, GO threshold, horizon, guardrail

- PRIMARY METRIC (per seed): "reached" = a march day on which the
  scholar's tile after the march equals the heard lair tile, as
  recorded BOTH by the policy (march record arrived:true,
  position checked in code) AND by the instrument (driver
  daily-post sample scholar tile == lair tile). Disagreement =
  NO-DATA for that seed (reported, not counted as reached).
- PILOT GO (all three must hold):
  1. Seed 97396 arrives under creekwood, AND
  2. >= 1 bridge is built in sim on the pilot band (the bridge
     leg actually fires in sim, not unit-only), AND
  3. the bridge leg fires on at least one seed (a march record
     with bridgesUsed non-empty; on 97396 this is the arrival
     path, on any other seed it is still a firing).
  The pilot GO does NOT require >= 6/8 reached: this arm's bar is
  the named two-creek seed plus a fired bridge leg, not a repeat
  of creekdetour's breadth bar. The full 8-seed reached split is
  still reported.
- GUARDRAIL (not the primary bar, reported): median end-gameDay
  candidate within 20 days of baseline on identical pilot seeds,
  AND village-lost count <= baseline on the pilot band.
  (Village-lost = endReason indicating village loss; reported per
  seed so the guardrail is auditable, not just a median.)
- HORIZON: DAYS=180, death-aware (runDays ends on win/loss/over;
  dead villages stop simulating, +10d tail max per the staged
  method). Why 180: identical to creekdetour, whose march windows
  run days 59–150 and whose pilot this band reuses.
- ARRIVAL SPLIT RULE (reported for every reached seed, never
  pooled silently): detour-only / bridge-assisted / swimmer-
  assisted. A bridge-assisted arrival = arrived AND the walked
  path steps on a tile bridged by this policy (this run or an
  earlier march day). A swimmer-assisted arrival = arrived AND
  the walked path steps on an unbridged needsBridge creek tile
  while the scholar has swimmer. Swimmer arrivals NEVER carry
  the GO bar. The confirm bar counts bridge-assisted arrivals
  explicitly (see below).
- CONFIRM GO (only if pilot GO): bridge-assisted arrival on
  >= 50% of two-creek-wall confirm seeds, same guardrail
  (median end-day within 20d AND village-lost <= baseline).
  Confirm seeds: 12–16 fresh seeds under creekdetour's screening
  rule (geometry nomination + full-run confirmation, deviations
  disclosed), restricted to two-creek-wall cases (lair tile
  itself a needsBridge creek, or no walkable path without
  bridging >= 2 creeks in series — the case rule is stated in
  the confirm section of the final evidence BEFORE confirm sims
  are pooled, since the pilot cannot pre-register a case count
  it has not seen).
- A miss of GO is NO-GO, never re-scored against a friendlier
  metric mid-run. Metric doubts go under "metric review" in the
  final evidence, for the NEXT run.
- DIAG (alternative, only if the wood leg cannot fire): DIAG
  iff creekwood reaches 0 two-creek seeds AND the evidence
  names the exact binding mechanism (pile empty on every march
  day, carry-full, or no adjacent bridgeable creek after
  advance) with per-march-day wood/pile numbers. A DIAG is a
  diagnosis verdict, not a routing GO, and is labeled as such.
  In that case the bridge leg alone is judged on wood-rich
  seeds (unit proof + any pilot seed where a bridge fires).

## Pilot band (pre-registered, before any creekwood run)

8 seeds = 97396 + 97307, 97422, 97449, 97474, 97489, 97514, 97599
(the creekdetour confirmed cases). Pilot seeds are NOT chosen by
creekwood outcome — they are the creekdetour pilot set plus the
named two-creek seed, fixed here.

## Wood instrumentation (creekdetour's metric-review requirement)

The driver records wood at first march day in BOTH arms: the
instrument samples Game.woodCount() and state.village.wood
(pile) on every daily-pre, and the per-seed record reports the
values on the first march day (first day a march record exists)
for baseline and candidate alike. Creekdetour's own baseline
records lacked this; this arm re-runs the creekdetour arm on the
identical pilot seeds with the instrumented driver so the
before/after wood comparison is real, not borrowed.

## Perception law (Steve 2026-10-28)

The candidate policy may read ONLY: its own tile, the engine's
offered steps, entry-specific travelBlockage, board tiles the
BFS steps onto (terrain the player sees on the 9x9 board), the
heard lair (scouts' say line, anchored regex, as in
creekdetour.js), tile-sharing seen with its own eyes
(Game.playerMonster() for the arrival/call logic, inherited),
its own wood count + village pile size for the takeWood gate
(own pack + the village's own pile — the pile the scholar's own
village keeps, read only to decide a takeWood call, never
another village's state), and its own swimmer ability. It may
NEVER read Game.worldMonsters() or any monster roster, a live
herald position, or any other village's state for routing. The
proof test asserts this: a stub Game WITHOUT worldMonsters still
routes, and a spying stub records that routing calls only the
allowed reads (tileAt, travelBlockage, travelTo, hasAbility,
woodCount, buildBridge, takeWood, say).

## Balanced panel (§15) — limitation, stated up front

As in creekdetour, no panel compare .md is attached: the panel
runs named registry policies only and cannot express the
creekdetour/creekwood composition, so running it would measure
something else. The panel is the instrument and this prereg's
thresholds are the judge; the instrumented driver records
(per-seed JSON) are the measurement, and the wall metrics
(national/table/wins/wave reach, median survival) are reported
from them.

## Metric review (for the NEXT run, not this verdict)

- (To be filled after the pilot: GO-bar fit for a single-seed
  blank, wood-leg scope (pile vs cut-own), bridge/advance
  counting, confirm case-rule fit.)

## Deliverables

- scripts/policies/creekwood.js (candidate policy)
- scripts/test-creekwood-a.js (unit proof, green before judged sims)
- scripts/creekwood-driver-20261102.js (instrumented before/after driver)
- evidence/2026-11-02/sim-creekwood-a.md (+ per-seed records in
  evidence/2026-11-02/perseed-creekwood-a/)
- This prereg file, committed before any judged sim.
