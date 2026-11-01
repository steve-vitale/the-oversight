# sim-scholaraway-b — PREREGISTRATION (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1130Z,
axis food-economy, arm sim-scholaraway-b. Answers Loop B 1030Z round
next blank #5, "scholar presence before any scholar-supply lever":
evidence/2026-11-01/sim-supplyleg-b.md finding "SCHOLAR-AWAY
STRUCTURAL ZERO" — scholar-unload exactly 0.0% on every seed
51101-51108 under competent play, with seed 51105's transcript
explaining it (the competent scholar camps wild all month, no
homecoming unload ever fires), plus the scholar's "Hunger gnaws. The
pack is thin…" line repeating verbatim near-daily on away stretches.

DIAG ONLY: no src/js changes, no policy-default flips, no edits to any
existing policy file or existing script. New files only: this prereg,
the scholaraway trace driver, the scholaraway analyzer, the proof test
(including the positive control), evidence, censuses/corpora.

## Canon note (read first)

docs/CANON.md read. NO canon doc defines "scholar presence" or
"scholar-away" as a system — docs/MAP.md covers travel and the way
home, docs/PARTY.md covers villagers, neither names a scholar-presence
rule. Presence definitions below come from the code's own gates, not
invented canon:
- `Game.playerAtHaven()` (game.js): Manhattan distance from the
  scholar's own map position (`Game.map.px/py`) to the home village
  tile (`Game.state.village.px/py`, default 4/4) <= 1. This is a
  narration-presence gate, NOT being home.
- `Game.returnToVillage()` (game.js): fires when the scholar walks
  onto the haven tile (travelTo PIN) and pools the pack haul into the
  home pantry via `depositPantryPieces` (the unload path supplyleg
  classified by stack). It is ALSO called on the game-over path
  (game.js, status path) — those calls are counted separately and
  NEVER count as homecomings (see below).
- The scholar is the player character: there is NO scholar assignment
  field. "What the scholar is doing while away" is therefore read
  from the scholar's own position plus the scholar's own day narration
  (say lines), never from a roster, list, or NPC assignment table.
  That is the honest limit of this instrument, stated here, not
  papered over.

## PERCEPTION LAW (Steve 2026-10-28, load-bearing)

Villagers know who's around only through their own senses. This
census judges scholar presence ONLY from the scholar's own state:
`Game.map.px/py` (the scholar's own tile), `Game.state.village.px/py`
(the home tile the scholar lives on), `Game.playerAtHaven()` (derived
from those two), `Game.state.scholar.lastHavenDay`, and the scholar's
own say lines. No global roster, no village-member list, no
list-fed shortcut is consulted anywhere in the driver. The driver
READS these fields and WRAPS (counts only) `returnToVillage` and
`depositPantryPieces`; it never moves the scholar, never calls
travelTo/returnToVillage/eat, never changes game state. Wrapper
neutrality is a pilot gate (G3), not an assumption.

## Primary metric

Per seed, over a 30-day competent-policy window: the scholar-presence
census —
- haven-evenings: evenings (after the policy's daily() returns, same
  sleep-phase point as supplyleg's evenings) on which the scholar's
  own tile IS the haven tile (`map.px == village.px AND map.py ==
  village.py`). This is the primary presence count: a night spent
  home is a night the scholar could unload.
- at-haven-evenings (secondary): evenings with `playerAtHaven()`
  true (distance <= 1, includes adjacent tiles). Reported separately;
  adjacent is NOT home — the adjacent-tile fix (sim-adjacenttile-b)
  proved a villager one tile from home is still away.
- homecoming events: wrapped `returnToVillage` calls with
  `Game.over` false at entry. Death-path calls (`Game.over` true)
  are logged separately and excluded from this count.
- unload kcal: `depositPantryPieces` kcal into the home village
  while inside a (non-death-path) `returnToVillage` call, plus any
  deposit whose stack matches /returnToVillage/ (supplyleg's rule,
  belt and braces). Must reconcile with supplyleg's 0.0% on the same
  seeds.
- longest wild stretch: longest run of consecutive evenings NOT on
  the haven tile, within the seed's lived window.
- away activity: per away-evening, the day's say-line buckets
  (forage, teach, travel, camp-wild, hunger, combat, other — a day
  may hit several buckets) plus evening state (scholar kcal, pack
  kcal, insideTent, Manhattan distance from haven).

## Question and verdict rule (fixed now, never after seeing numbers)

Question: is scholar-away STRUCTURAL (the mechanics keep the scholar
wild — e.g. the competent base has no standing go-home rule, the day
ends wherever the ticks run out, and return fires only on a haven-tile
step) or seed variance (some seeds home, some not)? A structural-zero
bar must separate those two — a low mean alone never suffices.

STRUCTURAL iff ALL of:
(a) homecoming events = 0 on >= 7 of 8 pilot seeds;
(b) unload kcal = 0 on 8 of 8 pilot seeds;
(c) haven-evenings <= 2 on every pilot seed (spawn-day / edge
    tolerance — the scholar starts at home and may spend a night or
    two there before leaving);
(d) a NAMED mechanism, from code read plus census, that explains
    why the scholar stays wild (not just "the numbers are low").
VARIANCE (structural hypothesis NO-GO) iff anything else: homecomings
on >= 2 seeds, or haven-evenings > 2 on >= 2 seeds, or unload > 0 on
any seed in a pattern inconsistent with (a)-(c).

## GO / NO-GO and confirm band

- Pilot GO (STRUCTURAL at pilot) -> confirm on 16 FRESH seeds
  51109-51124, same policy, same 30d window. Confirm bar for the
  structural claim: homecomings 0 on >= 14/16 seeds AND unload 0 on
  16/16 AND haven-evenings <= 2 on >= 14/16. If confirm misses, the
  structural claim is DOWNGRADED to variance in the evidence — the
  pilot numbers are never re-scored against a friendlier bar.
- Pilot VARIANCE -> NO-GO / killed-at-pilot: NO confirm spend, land
  evidence only with the variance verdict. A miss is NO-GO, never
  re-scored against a friendlier metric mid-run.
- Either verdict requires the sense pass (below) to be a complete
  result.

## Pilot gates (before any judged verdict)

STOP (no confirm, report as the result) if any gate fails:
  (1) POSITIVE CONTROL: the proof test's constructed homecoming
      (load a game, give the scholar pack food, call
      returnToVillage, assert the wrapper records a homecoming event
      AND unload kcal > 0) is green BEFORE any judged sim. A zero
      without a proven recorder is not a zero.
  (2) COMPLETE CAPTURE: every pilot seed yields >= 1 evening
      snapshot with non-missing map coords, haven coords, and
      playerAtHaven value, plus a say-line capture. Missing coords
      on any seed = the instrument is blind there; stop.
  (3) INSTRUMENT NEUTRALITY: the driver contains no travelTo,
      returnToVillage, eat, or other state-moving call in the judged
      path (wrappers count only; the positive control's direct
      returnToVillage call lives ONLY in the proof test, never in
      the driver). Verified by code read, stated in evidence.

## Horizon + why

30 days, death-aware: villages that die stop simulating (no fixed
200d; a dead village contributes its days-alive only, flagged, never
padded; +10d tail max is moot — death ends the run). 30d matches
the supplyleg window exactly, so unload numbers reconcile seed for
seed, and keeps the band inside the early game where the scale wall
bites.

## Seeds and policies

Pilot seeds (reuse supplyleg, for seed-for-seed reconciliation):
51101, 51102, 51103, 51104, 51105, 51106, 51107, 51108.
Confirm seeds (only if pilot GO): 51109-51124 (16 fresh seeds).
Policy: competent ONLY (scripts/policies/competent.js, verbatim).
Env contract (FATAL if violated; mirrors supplyleg's substrate, plus
the standing-home gate made explicit — competent base defaults):
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=competent, DAYS=30
  COMPETENT_STANDING_HOME, COMPETENT_ROUTE_AROUND,
  COMPETENT_TRIPHOME_ROUTE_AROUND, WOODCARRY, WOODWARM,
  MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB, FEDEVENING
  must NOT be 1.
Note: COMPETENT_STANDING_HOME=1 would ADD a standing go-home rule
that the competent base does not have; running with it on would
measure a different policy, not the one that produced supplyleg's
zero. It stays off by this contract, and the mechanism section must
say so.

## Sense pass (SENSE-TESTING LAW)

Read the scholar's transcript lines on at least 2 seeds, end to end
for the away stretch: judge whether the away scholar reads like a
person with a reason to stay out (a trip, a task, a place to be) or
like a policy that never issues the walk-home order; and count
whether the "Hunger gnaws. The pack is thin…" line recurs verbatim
(supplyleg's robotic note, to confirm or refute on these seeds).

## Balanced panel (§15) — declared inapplicable, with reason

No panel compare is built for this arm. §15 panels compare a base
panel against a lever-applied panel on identical seeds; this arm
applies NO lever and changes NO game code or policy — it is a
single-arm presence census on the current base. There is no second
panel to compare, and fabricating one (e.g. comparing pilot seeds
against confirm seeds as "before/after") would misrepresent two
independent seed bands as a lever effect. The prereg verdict rule
above is the judge; the panel instrument has no applicable input
here. This declaration is made BEFORE judging, not after seeing
numbers.

## Wall numbers

This 30d pre-seat window CANNOT measure the scale wall (national /
table / wins): no seed can reach national in 30 days. The evidence
will report what runDays actually returns in-window (endReason,
daysAlive, maxWaveUnlocked, waveKills) and state plainly that wall
movement is not measured — never claim wall movement from this
window.

## Metric review (for the NEXT run; this run judges against the header above)

- (Pre-run note) If haven-evenings <= 2 proves too loose/tight once
  real spawn behavior is seen (e.g. the scholar routinely spends the
  first several nights home before leaving), the NEXT run should
  re-derive the tolerance from the spawn-day distribution, not from
  this run's verdict needs. Do not adjust it mid-run.
- (Pre-run note) Adjacent-tile evenings (playerAtHaven true, not on
  tile) may prove to be the interesting middle category — a scholar
  camped one tile out. If the census shows many adjacent evenings,
  the NEXT run should ask whether adjacency should count as
  "functionally home" for unload purposes; this run counts it as
  away, per the adjacent-tile fix.
- (Pre-run note) The positive control proves the recorder, not the
  engine path: a constructed returnToVillage call is not evidence
  that normal play ever steps onto the haven tile. The structural
  mechanism must come from code + census, not from the control.
