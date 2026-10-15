# sim-guardreplace-b — the guard WITH the calorie replacement (loop B ARM, 2026-10-15)

Claims sim-findings #338's named requirement: "PRO-CYCLICAL TAKE-BLOCK STARVES
THE SCHOLAR — Any future take-throttle needs a calorie replacement, not just
a block." Axis: food-economy. Run: fleshout-b-2026-10-15T155859Z.

Policy-side lever, zero src/js changes.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — binding, written BEFORE sims)

- **Question**: sim-trustguard-b measured a trailing-7d trust-ledger guard that
  fired exactly when the scholar was hungriest (9.8 blocks/run) and, with no
  calorie replacement, starved scholars (starvation deaths 12 vs 2, hunger-days
  flat 969 vs 968). The named requirement for ANY future take-throttle is a
  calorie replacement, not just a block. Can the same guard, rebuilt so that
  every blocked take is paired with a same-day replacement meal (a dawn wild-
  haul trip — travel out, honest forage, travel home, sort the haul at camp,
  pack it — eaten at mid-day through the proven mid-day eat mechanism), cut
  scholar hunger WITHOUT the pro-cyclical starvation?
- **Lever**: scripts/policies/guardreplace.js (gate GUARDREPLACE=1, default
  OFF), wrapping leadcourt/belongseek. Each dawn (dayPart 0, before the base
  upkeep): if the scholar needs a lunch (below 0.85×cap, pack < 400 kcal),
  read the trailing-7d net in the ENGINE's sign convention (net7 = gives7 −
  takes7) from the REAL takeHist/giveHist (src/js/game.js:14171-14230, the
  day>=day-6 window the engine's takeRate7/giveRate7 use — the dated-voluntary
  ledger the freeloader clock reads, game.js:27125, NOT the lifetime
  cumulative bar which per #339 has no take-behavior window). Project the
  candidate pantry unit (projected = net7 − candidateKcal).
  - If projected ≥ −5000 + 2000 = −3000: take normally (the proven enter →
    one honest take → pack → mid-day eat chain).
  - If projected < −3000 (RED): the wild-haul replacement is attempted
    FIRST (dawn forage trip: travel out, honest forage, travel home, sort
    the haul at camp, pack it). ONLY if the wild actually feeds the scholar
    (hauled > 0) is the pantry take BLOCKED. If the wild is bare
    (worked-out tiles, unidentifiable plants, fights), the guard STANDS
    DOWN and the scholar takes the pantry lunch — voiced honestly. **A
    block is ALWAYS paired with a secured replacement; a starvation block
    is a mechanism failure, not a guard.** (v2 design, 2026-10-15: v1
    blocked-then-hoped; the pilot showed the wild whiffs ~75% on depleted
    ground, reproducing the #338 harm. v2 inverts it: replace-then-block.)
  At most one take/day, hard. No silent actions: takes, blocks, stand-downs,
  trips, hauls, and replacement meals all narrate honestly (sense-test lines
  read in the proof transcripts).
- **PRIMARY (binding pair, BOTH must hold)**:
  (1) scholar hunger-days armed ≤ 0.80× control (pooled);
  (2) scholar starvation-deaths armed ≤ control + 2.
  (The 0.80 bar: trustguard's 0.60 bar was set against a different mechanism;
  this arm's claim is narrower — remove the starvation the block CAUSED while
  keeping the guard's ledger management. Starvation deaths are elevated to
  the primary pair per the trustguard metric review: for arms that move
  mortality, dead scholars don't accumulate hunger-days.)
- **CO-PRIMARY (binding, mechanism honesty, v2)**: the guard engages ≥ 8
  red-day decisions/run (Σ (ctx._grBlocks + ctx._grStandDowns) / 16 armed
  runs) AND every block is paired with a secured replacement (armed
  grReplKcal > 0 whenever armed grBlocks > 0). The guard must actually
  engage, and a bare block is a mechanism failure.
- **GUARDRAILS (all binding; a miss is a kill, not a re-score)**: median
  survival armed ≥ control − 10d; national armed ≥ control − 2/16; no new
  death mode (n ≥ 3 armed-only); takes/day ≤ 1 hard (in the layer).
- **GO** → commit the layer for landing. **MISS** → layer deleted per kill
  protocol, evidence + instruments only.
- **Horizon**: 180d death-aware (+10d tail). Reason: the harm this arm
  addresses (starvation deaths) and the ledger dynamics (trailing-7d) play
  out over the full run; the trustguard pilot used 180d and this arm is its
  direct answer — identical horizon keeps the comparison honest.
- **Seeds**: 11/22/33/44/55/66/77/88 × {leadcourt, belongseek} × {control,
  armed} = 32 runs, OWN control in the SAME sweep (never an inherited
  baseline — #247). This is the PILOT (8 seeds); a confirm (12–16) only
  follows a GO.
- **Det-gate**: scripts/test-guardreplace-20261015.js PART C green before
  sweep spend (16/16 byte-identical, trigger path hot).
- **SMOKE=1**: instrument-honesty (proof + sweep smoke gates).
- **Sense-test** (Steve's law): 2–3 block+replacement episodes read in the
  transcripts — the block beats and the wild-haul beats must read as a
  person managing their ledger and feeding themselves, not a robot.
- **Canon**: docs/CANON.md + docs/PRESERVATION.md read. NO food-distribution
  canon doc exists — stated here per the canon rule; no canon invented. All
  mechanics read from src/js as-is (cited in the layer header). The give
  channel (sim-findings #341) is deliberately NOT part of this arm.

## PROOF (before measurement) — v2

scripts/test-guardreplace-20261015.js — ALL GREEN (PART A fixtures, PART B
live-engine REAL RED, PART C det-gate 16/16). v2 changes from v1: the
stand-down (bare wild → take the lunch, never a starvation block).
- A1–A4: gate off = layer inert; gate on wraps (BLOCK_AT=-3000); healthy
  ledger takes (stamped, voiced).
- **A5 THE PAIRING INVARIANT (v2): block on a red ledger + secured wild-haul
  replacement — no take, block counted, trip hauled (450 kcal), packed,
  voiced; mid-day eat ate>0, counted as a replacement meal. A block without
  a secured replacement FAILS the proof.**
- **A5c STAND-DOWN HONESTY (v2): bare wild → guard stands down, pantry
  lunch taken, voiced ("the ledger will have to wait"). A guard that
  starves is the #338 harm — the stand-down is the fix.**
- A6–A9: margin boundary, one take/day, enter+take chain, mid-day wart fix.
- A10–A13: trailingNet7, picker, pre-fill ban, silent when covered.
- A14: fight → stand down + lunch (the layer never fights).
- A15: bare pantry → wild trip (not a block).
- **B1 RED: the BROKEN variant (guard WITHOUT replacement — the trustguard
  behavior) on a deep trailing-7d ledger seeded by 8 REAL takeFromPantry
  calls: blocks (net7=-4000) and the scholar gets NOTHING (pack empty, kcal
  1500→1500) — the #338 pro-cyclical starvation signature, reproduced.**
- **B1b/c GREEN: the REAL layer at the same state blocks AND the wild trip
  hauls (120 kcal), and the replacement meal feeds the scholar (ate=120).**
- B2–B5: healthy take, real takeHist, wild trip end-to-end, no repeated
  eat line.
- PART C: 16/16 byte-identical (det-gate).

## RESULTS — v2 PILOT (2026-10-15, 32 runs: 8 seeds × {leadcourt, belongseek} × {control, armed}, 180d death-aware)

v1 pilot note: the v1 pilot (block-then-hope) was abandoned mid-run after
14/32 runs when a layer edit (the v2 refactor) crashed it — v1 had already
failed in the field (wild whiffs ~75% on worked-out near-haven tiles,
reproducing the #338 harm: block days with no meal). v2 (replace-then-block
with stand-down) was proofed fresh (ALL GREEN) and piloted clean 32/32.

| metric | control (16) | armed (16) | pre-reg bar | verdict |
|---|---|---|---|---|
| scholar hunger-days | 968 | 919 | ≤ 0.80× = 774 | **MISS** (0.949×) |
| starvation deaths | 2 | 17 | ≤ control+2 = 4 | **MISS** |
| red-day decisions/run | — | 22.6 (138 blocks + 224 stand-downs) | ≥ 8 | PASS |
| blocks paired w/ replacement | — | yes (all 138) | required | PASS |
| median survival | 163d | 167d | ≥ 153d | PASS |
| national reach | 12/16 | 11/16 | ≥ 10/16 | PASS |
| new death modes | — | none | none | PASS |
| table / wins | 0 / 0 | 0 / 0 | — | — |
| wave4 / wave5 reach | 7 / 0 | 6 / 1 | — | — |

Audit totals (armed): grTakes=449, grBlocks=138, grStandDowns=224,
grWildTrips=398, grWildKcal=124,930 hauled, grReplMeals=2, grReplKcal=70
(mid-day; the base eats the packed haul at dawn via competentEat — the haul
is the replacement, not the mid-day count).

**VERDICT: KILLED.** The PRIMARY pair failed on both prongs. The guard
engages (22.6 decisions/run), every block is paired with a secured wild-haul
replacement (the #338 mechanism requirement is met), survival and national
hold — but scholar hunger barely moves (0.949×, need 0.80×) and starvation
deaths explode 17 vs 2 (need ≤ 4).

### What killed it

v2 fixed the scholar-facing harm (stand down on a bare wild → take the lunch;
scholar hunger 919 vs 968, slightly better, zero scholar starvation via the
guard). But the guard's dawn wild trips (398 across 16 runs) double-deplete
the near-haven tiles the base's evening trip also works, and the 449 pantry
takes draw the village buffer. The cost lands on the VILLAGE, not the scholar:
two seeds (s77, both policies) collapse into day-39 famines with 5 starvation
deaths each; six more runs lose 1–2 villagers to starvation on long runs
where the scholar survives to day 133–182. The scholar eats; the village
starves. A take-throttle that feeds one mouth by stripping the commons is
not a fix for #338 — it relocates the harm.

### Metric review (§14)

- The PRIMARY pair was the right bar: a hunger lever that doesn't cut hunger
  and multiplies starvation deaths is a harm, regardless of mechanism honesty.
- The CO-PRIMARY (v2: decisions/run ≥ 8 + pairing) passed and should be kept
  for any future take-throttle: it correctly distinguished "the guard engaged
  honestly" (true) from "the guard helped" (false).
- Design note for the NEXT run, not this one: the failure is structural, not
  tuning. Any dawn foraging by the scholar competes with the village's own
  foraging on the same tiles. A future replacement must come from a
  non-rivalrous source (the scholar's own stores, a trade, a gift) or not at
  all. Do not re-tune the trip radius and re-run; the commons depletion is
  the mechanism.

### Village assessment (plain words)

The guard is a conscientious ledger-keeper with an honest voice — "the
ledger's running red, so I eat from my pack today" reads like a person, and
the stand-down ("the ledger will have to wait — the wild gave nothing, so
I'll take the lunch") is exactly the honesty #338 asked for. But the village
experiences it as a second forager working the same tired ground every dawn
and a second hand in the pantry. Two villages in sixteen starved by day 39.
The scholar's own belly is marginally better; everyone else's is worse. Kill
it, keep the voice, and never fund a replacement meal by foraging harder.

## SENSE-TEST (transcripts read)

- Block beat (leadcourt s11 d7): "The ledger's running red — 3,600 kcal more
  taken than given this week. You can't in good conscience take another lunch
  from the pantry." → "You work the wild ground instead — the morning's haul
  is yours, and no one else's to count. You pack the Muscadine Grapes for the
  road — today's lunch, honestly come by. (+270 kcal)" — reads as a person
  managing a ledger. PASS.
- Stand-down beat: "The wild ground gave nothing you could use — the ledger
  will have to wait. You take the pantry lunch; an empty belly helps no one."
  — honest, no starvation block. PASS.
- The STARVING warnings on block days (d7, d28, d33) show the haul (270 kcal)
  not covering the day — the voice is honest but the calories are thin. The
  mechanism's honesty doesn't redeem its arithmetic.

## KILL

Per the pre-registered kill protocol: the layer
(scripts/policies/guardreplace.js) is deleted. This commit lands the evidence
(including the full proof scripts, the sweep, per-seed data, and transcripts)
and the test/sweep scripts only. The voice lines are preserved in the evidence
for any future take-throttle; the mechanism is not.
