# sim-stockdoor-b — the stockSurplus fourth door, recorded (INSTRUMENT ONLY, no game change)

Run: oversight-flesh-out-loop-b, axis food-economy, arm
sim-stockdoor-b. Takes the 1730Z arm's still-missing instrument
field: a stockSurplus door record in the inflow capture, so the
seed 9750 days 83–84 residual pair can be re-judged from inflow
records alone. Predecessors: sim-inflow-b + sim-inflowtrail-b-land
+ sim-preservesched-b (1630Z) + sim-preservesched-resid-b (1730Z,
DIAG-NO-GO).
Instrument: `scripts/stockdoor-capture.js` (new: recorder-side
wrapper around `Game.stockSurplus`, the nightly meal's surplus
path). Sweep: `scripts/sweep-stockdoor-b.js` (identical band to
the resid band, plus the stockdoor install; substrate, inflow,
and resid captures reused UNCHANGED; zero src/js changes).
Analyzer: `scripts/analyze-stockdoor-b.js`. Proof:
`scripts/test-stockdoor-b.js` (see "Reproduction check" — 23
PASS, 2 FAIL, both failures the single named leg below).
Canon: docs/CANON.md + docs/PRESERVATION.md (ladder: cleaned 2d <
cooked 5d < smoked 30d; smoking 16 ticks; "rot can't be smoked
back into food").

## Pre-registration (binding, MEASUREMENT.md §14 — written BEFORE the sweep ran)

Full text: evidence/2026-10-26/sim-stockdoor-b-prereg.md
(written before any sim ran in this arm; the sweep ran after it).

Band: identical seeds/policies to the resid band — seeds
9750–9757, competent-nofeast (COMPETENT_FEAST=0, FEASTSCALE_R13
unset/0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1), 100d, CAP=1.
This 8-seed band IS the pilot gate.

Control (must pass before any residual judgment): the
PRE-FOURTH-DOOR view — counting only the stock, deposit, and
pantryAdd doors — re-derives 327/289/38, lag 1x32/2x4/3x1/4x1,
coverage 36/38, residuals exactly (9750,83) and (9750,84); plus
the determinism leg (new corpus matches the resid-b corpus on
every game-output field on all 8 seeds).

Primary metric: re-judgment of the residual pair with the
fourth-door record in place. GO iff ALL five hold: (1) control
passes exactly; (2) seed 9750's day-82 stockSurplus records total
exactly 2000 kcal stored, every record spoilDay 85, name
'Foraged food', spoilDay = vDay + 3; (3) day-83 bound piles
exactly the 200x10@85 stack matching the day-82 record on units,
spoilDay, and kcal; (4) day-84 bound piles exactly the 5-stack
3567-kcal decomposition with each component's source door record
present; (5) determinism leg passes. Any miss is NO-GO, never
re-scored.

## Control: PASS — exactly, including determinism

| check | resid-b (1730Z) | new (stockdoor) |
|---|---|---|
| bound / attributed / unattributed | 327 / 289 / 38 | 327 / 289 / 38 |
| attribution-flag reproduction | 0 mismatches | 0 mismatches |
| lag distribution (38) | 1x32 / 2x4 / 3x1 / 4x1 | 1x32 / 2x4 / 3x1 / 4x1 |
| median lag | 1.0 | 1.0 |
| coverage (36/38) | 94.7% | 94.7% |
| residuals | (9750,83), (9750,84) | (9750,83), (9750,84) |
| deaths / wall | 43; national 0, table 0, win 0 | 43; national 0, table 0, win 0 |
| determinism vs resid-b corpus | — | 8/8 seeds identical on dayTable classes, attribution flags, days alive, deaths, death causes, rank, waveReach, national/table/win, endReason |

Instrument legs: resid join 0 misses; ctxKcalMatch 0 mismatches
over 1,536 lines; no truncation flag on any file (inflow,
resid, stockdoor, cook, event). The stockdoor wrapper moved
nothing: the only per-seed differences from the resid-b corpus
are the added `stockdoorRecords` field and run timings, both
instrument output. No confirm band was spent — the pilot's
determinism leg passed, so the brief's confirm condition did
not trigger.

No game-code hook was needed. The brief's conditional hook path
did not trigger: recorder-side replay sees `stockSurplus`
plainly (it is a plain `Game` method returning kcal stored, and
the wrapper calls it with identical arguments and return value).
Zero src/js changes in this arm.

## Verdict: NO-GO — on one leg, literally, and the leg is the prereg's own assumption

Judged against the header only, never re-scored: NO-GO. Four of
the five GO legs pass exactly; leg 2 fails on its number:

- Leg 1 (control): PASS, exactly (above).
- Leg 2 (fourth-door record): FAIL on the total. Seed 9750's
  day-82 stockSurplus records are four calls, all 'Foraged food',
  all vDay 82, all spoilDay 85, all with spoilDay = vDay + 3 —
  but they total 2800 kcal stored, not 2000:
  give 536 → stored 600; give 171 → 200; give 908 → 800; give
  1233 → 1200. The clock, the door, and the name are all exactly
  as pre-registered; only the gross total differs.
- Leg 3 (day-83 accounting): PASS, exactly. Every bound line on
  day 83 faces exactly the 200-kcal x 10 stack at spoilDay 85
  with no granaryDays (2000 kcal): Sierra racks-full res2, Sierra
  plain res3, Malik plain res1.
- Leg 4 (day-84 accounting): PASS, exactly. Every bound line on
  day 84 faces exactly 3567 kcal in five stacks: the same
  meal-surplus 200x10@85 (no granaryDays) + day-80 granary stock
  178 + 189 @86 granaryDays 3 + ripened day-74 Winner's share
  300x2 @86 granaryDays 3, two stacks. Source records present:
  day-80 stock-door total 367 (records 178 + 189, exactly the
  pile's pieces); day-74 Winner's share pantryAdd total 2400
  (four 600-kcal records).
- Leg 5 (determinism): PASS, exactly (above).

So the fourth-door record DOES name the day-82 stack and DOES
account for both residual days at the pile level — but the
prereg equated the night's gross stored total with the pile
that survives to the next day's cook, and that equation is
false. The meal both stores surplus and eats dinner from the
same pantry in the same night.

## The mechanism, in plain words (gross vs net)

The village's night meal is a two-way door in one night: early
villagers put surplus back (2800 kcal on night 82, fourteen
200-kcal units at spoilDay 85), and later villagers eat dinner
out of the same pantry — including some of what was just put
back. By the first cook line of day 83, four of the fourteen
units (800 kcal) are gone, eaten in the same night's later
draws, and the day-79 granary pieces (122 + 220 kcal, spoilDay
85, granaryDays 3) are gone too — which is why the day-82
first-cook snapshot shows only the 122/220 granary pieces at
spoilDay 85, and the day-83 snapshot shows only the 200x10
meal-surplus stack. The cook on day 83 is not working from
"the day-82 surplus" as a lump sum; she is working from what
the night left behind.

Corroboration that this is systematic, not a one-night quirk:
night 81 stored 3000 kcal of meal surplus (600 + 600 + 0 + 600 +
1200, spoilDay 84) — and the day-82 first-cook snapshot shows
NO 200-unit stack at spoilDay 84 at all. That whole night's
surplus was eaten before the next day's cook. A night's gross
meal-surplus write is an upper bound on what survives, never
the surviving pile itself. Any future inflow accounting that
equates stockSurplus writes with surviving pantry stock will
overcount — by 800 kcal on night 82, by the full 3000 on night
81.

What the instrument does and does not close: the fourth door is
now a first-class inflow record (day, vDay, give, stored,
spoilDay, on every call, with the spoilDay = vDay + 3 invariant
holding on every record in the corpus). What it does not record
is the meal's draws — the 800-kcal gap is located by window
(the only consumers between the night-82 stores and the
day-83 first-cook snapshot are the night-82 meal's later
draws), not by a draw record. Closing that gap needs a meal-draw
record, which is a new instrument, not a re-score of this one.

## Sense samples (plain words — meaning, not just counts)

- Seed 9750, day 83 (the residual focus, new corpus): Sierra
  smokes in the morning, then hits the wall and says so
  honestly: "The racks are already full (13,033 kcal kept —
  more than the haven can eat before it turns), so Sierra left
  the fresh pile for tonight's dinner instead of smoking it
  onto the rot pile." The "fresh pile" is the village's own
  leftovers from the night before, net of what the night itself
  ate. Nothing here suggests hidden stock or food from
  nowhere: it is a village eating its own stores in order, and
  the cook deciding the remainder is dinner, not smoke.
- Seed 9755, days 39–41 (fresh sample, new corpus): Otto hits
  the same wall three days running — "The racks are already
  full (20,139 / 21,259 / 20,468 kcal kept…), so Otto left the
  fresh pile for tonight's dinner instead of smoking it onto
  the rot pile." The sentence is a fixed template with fresh
  numbers each day. It reads honestly every time — the numbers
  move, the situation is real — but a village hearing the
  identical sentence three mornings running is a candidate for
  voice variety. Noted in the out-of-arm section, not chased
  here: the line is honest, and repetition with true numbers is
  not robotic behavior in the sense the law targets (no filler
  loops, no static menus, no fabricated history).

Sense judgment: the story coheres, and it coheres better than
the 1730Z version in one respect: the "mystery" stack now has a
door record with a day, a clock, and a gross total — and the
gap between gross and surviving pile is itself a village
behavior (the night eats its own surplus), not an instrument
failure. No robotic, static, or repeated behavior is flagged as
a blank in the residual days.

## Village assessment (what the village looked like)

Seed 9750 (the residual seed): survived the full 100d horizon,
village rank, wave 3 reached, no national/table/win. Five
deaths: monster 2, ambush 1, the arena 1, a wound that wouldn't
close 1 — a village losing people to the world and the show,
not to hunger: no starvation or dehydration deaths on this
seed. The cook, Sierra, is unskilled at preserving (rough job,
15-day shelf); haven tier 3 (the granary stands: +3 days on
fresh stores). Knowledge/capabilities missing on this seed: a
skilled preserver, and anything past wave 3 — the scale wall
stands here as everywhere on this band.

Band (8 seeds, competent-nofeast, 100d): 6 villages survived to
the horizon, 2 lost early (9751 at day 48, 9754 at day 97).
Median survival 100d (censored at the horizon). Deaths 43
total; top causes: the arena 15, starvation 7, monster 4, a
wound that wouldn't close 4, sickness 4, ambush 3, dehydration
3, old stare 1, alien 1, lockjaw 1. Wave reach: wave 3 on 4
seeds (9750, 9753, 9754, 9755), wave 2 on the rest; wave 4/5 on
none. Rank stayed village on all 8 seeds. Arc II/III/IV and
regional-stage reach are not recorded in this corpus (its
top-level fields carry waveReach, rank, national, table, win
only) and are not estimated here. Who thrived: the villages
that reached wave 3 with a granary and a working cook; who
died and why: the arena and starvation dominate the band's
deaths — the show takes people, and the food economy still
starves villages that cannot keep the pantry ahead of the
throttle. The blank this run filled is a measurement blank
(the fourth-door record), not a village-capability blank; the
village's own blanks (skilled preserver, wave 4+) are
documented, not filled.

## Reachability verdict

On this band, reachable: waves 1–3, village rank, haven tier 3,
the full preserve ladder as used by villagers (smoking at the
rough and skilled rates is exercised daily). NOT reached on this
band: waves 4–5, regional → national, the table, the win flag,
Arc II/III/IV (not recorded). The scale wall stands on this
band; this arm closes a food-economy measurement blank (the
fourth door is now recorded), it does not move the wall
numbers.

## Wall numbers (new corpus, competent-nofeast, seeds 9750–9757)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave reach:
wave 3 on 4 seeds, wave 2 on the rest. Median survival: 100d
(censored at the 100d horizon; 2 villages lost early — 9751 at
day 48, 9754 at day 97). Deaths 43 total (causes above). Rank
village on all 8 seeds.

## Metric review

- The pre-registered metric did its job and the bar was
  honored: the control reproduced exactly (36/38, same
  residuals), the determinism leg is clean (8/8 seeds, every
  game-output field), both pile accountings are exact, and the
  literal verdict is NO-GO on leg 2 alone. The verdict is not
  borderline-sensitive in the direction that matters: leg 2
  fails by 800 kcal (2800 vs 2000), a full four 200-kcal units,
  not a rounding edge. No re-scoring was done: the pile-level
  accounting is reported as findings, and the NO-GO stands.
- Metric doubt, stated honestly: leg 2 equated two different
  quantities — the night's gross meal-surplus writes and the
  pile that survives to the next day's cook. The instrument
  records the first; the cook sees the second; the night's own
  draws sit between them. The metric was not wrong to demand a
  named fourth-door record — that demand is what produced the
  2800-kcal gross, the per-call give/stored split, and the
  clock invariant — but its gross-equals-pile form guaranteed a
  miss once the night proved to eat its own surplus (night 81:
  3000 stored, zero surviving). Proposed revision for the NEXT
  run: judge the pile match (every bound line's eligible pile
  decomposes into named door records, with the meal-surplus
  component matched on spoilDay and stack shape, not on gross
  total), report gross stored and surviving pile as separate
  numbers, and — if the 800-kcal gap itself is to be closed —
  add a meal-draw record to the instrument so the night's draws
  are first-class evidence rather than window inference.
- No revision is applied to THIS run's verdict. The 36/38
  corpus, the SPOIL-CLOCK + RACKS-FULL rule, and the resid arm's
  DIAG-NO-GO verdict are untouched; the candidate revision
  above is a proposal for the next run's pre-registration, not
  an edit to prior evidence.
- Out-of-arm observations (logged here for the coordinator to
  append to sim-findings.md; NOT chased in this run):
  - Meal-surplus gross vs net: a night's stockSurplus writes
    overstate surviving pantry stock (night 82: 2800 written,
    2000 surviving; night 81: 3000 written, zero surviving).
    Any future inflow accounting that equates fourth-door
    writes with surviving stock will overcount.
  - The racks-full voice is a fixed template with daily
    numbers (seed 9755: Otto, days 39–41, identical sentence,
    moving numbers). Honest and informative, but a candidate
    for voice variety if the template ever reads stale.

## Reproduction check (this run)

- Analyzer `scripts/analyze-stockdoor-b.js` runs read-only
  against the new corpus and prints the control, the
  fourth-door records, the bound-line piles, and the literal
  verdict (NO-GO, leg 2).
- Proof `scripts/test-stockdoor-b.js` requires the analyzer and
  asserts: control neutrality 327/289/38, attribution-flag
  reproduction (0 mismatches), lag distribution exactly
  1x32/2x4/3x1/4x1, median lag 1.0, coverage 36/38, residuals
  exactly (9750,83) and (9750,84), instrument legs (ctxKcalMatch
  0 mismatches over 1,536 lines, resid join 0 misses, no
  truncation flags), corpus validity (8 files, all carrying
  stockdoorRecords), fourth-door clock invariant (spoilDay =
  vDay + 3 on every record), day-82 records all spoilDay 85 /
  vDay 82 / 'Foraged food', day-83 piles exactly 200x10@85,
  day-84 piles exactly the 5-stack 3567 decomposition, day-84
  sources (day-80 stock 367, day-74 Winner pantryAdd 2400),
  determinism vs the resid-b corpus (8/8 seeds), wall numbers,
  and the verdict flag. Run in this worktree: 23 PASS, 2 FAIL —
  the day-82 gross-total check (2800 vs 2000) and the verdict
  flag (NO-GO, not GO), exit 1. The two failures ARE the
  verdict: the proof encodes the prereg, and the prereg's leg
  2 failed. Every other check passes.
- Sweep: 8 seeds, ~2 min total, no truncation, no write
  failures. No game harness changes, zero src/js changes, no
  jest run (nothing to test in js — the proof is node, not
  jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- Per-seed corpus: evidence/2026-10-26/
  sim-stockdoor-b-corpus/ (8 files, stockdoor-b-cap1 band).
