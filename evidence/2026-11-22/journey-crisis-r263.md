# Journey — Crisis r263

**Run:** `playtest-loop-2-20261122T0300Z`, scheduled Sat 2026-11-21 21:00 CST / 03:00Z.
**Seeds:** 14596–14598 (pilot of 3). **Base:** master `4266e6cce` at prereg.
**Adoption:** (fill at closeout — the full `check.js` gate did not fit the
60-minute window; see Gate.)

**Lock discrepancy:** none. The lock file reads `playtest-loop-2-20261122T0300Z`
(created 02:57:27Z); the prereg records the same run_id. Closeout deletes
the lock only if the file matches, read in the same call as the delete
(per-line `grep -qx`).

## Leg question (prereg)

Do the two r262 fix items land and hold in the wild?

1. **FIGHT-STALL** — the unreachable-flee stuck counter keyed to monster+day
   instead of the fight object (`scripts/policies/oracleV2.js`).
2. **C3b** — the settled-closer gated on the SITTING's favor state
   (`convoCloseLine`, `src/js/conversation.js`).

**Short answer:** C3b GO — no false settlement on the panel (0 closers, 0
TRUE). FIGHT-STALL NO-GO — 5 stall-days on 3 seeds, and the flee never
fired once (`fled_unreachable` 0 panel-wide). The staged churn fixture
passes 11/11, so fight-object churn alone is not the defeat — the wild
stalls defeat the counter another way (see FIGHT-STALL).

## Panel numbers (main, seeds 14596–14598)

| Seed | End | Raids | Gorge nights | Sorties | Alive | Pantry (kcal) |
|------|-----|-------|--------------|---------|-------|---------------|
| 14596 | 91d GAME-OVER | 6 | 19 | 5 | 1 | 0 |
| 14597 | 150d horizon | 13 | 103 | 9 | 6 | 2,800 |
| 14598 | 121d GAME-OVER | 9 | 4 | 5 | 0 | 0 |

1/3 reached the 150-day horizon. 14596 starved/thirsted out (pantry 0 from
d50; thirst corpses Aisha d38, Dmitri d56, Malik d68; wound Nathan d54).
14598 wiped out entirely by d121 (18 corpses: monsters, the wild, the
arena, Leo dehydrated d67, Alba sick d17). 14597 held (6 alive, pantry
2,800). Origins fell back to St. Louis for all three seeds (the r262
driver's ORIGINS map keys only 14591–14595; origin is flavor, no crisis
metric reads it).

- DRY: 0 dry lines → deflect_q GO. LINK-ACCEPT: 0 accepts, 0 parrots.
- DODGE-ARTICLE: 3 dodge, 0 doubled → GO. DEATHCLEANUP: (see analysis).
- R181 BENCH: refused 1 (gateOneShort); NODEAWAY 1.
- C7b: 14596 buried [] (say-deaths 6, corpse list 15 — the census/say
  mismatch carried from r262 review 5); 14598 buried [Sanne, Alba, Wren].
- R70 phoenix burns 0 everywhere. R58 book check: retOk false (carried
  instrument shape).

## The two fixes in the wild

**Fix 1 (stuck-key) — DOES NOT HOLD.** `fled_unreachable` 0 in all 3
per-seed JSONs; 5 stall-days (below). The proof test passes 11/11 in its
staged fixture (churn with a stable monster set, new-day reset,
new-monster-set reset, pathable control). The wild panel defeats the
counter a different way; see FIGHT-STALL.

**Fix 2 (sitting-favor anchor) — HOLDS.** C3b-TRANSCRIPT: settledLines 6,
negation 5, vote 1, closer 0, true 0 → no settlement claim to adjudicate.
All five negations are honest ("Nobody's settled it" about the ambush /
murder of Jassim / Leo); the one vote line is "Counted." No "Good — …,
settled" line fired anywhere in 23 transcripts. The r262 false
settlement does not recur — but note the closer fired ZERO times this
panel (r262: 2), so the wild evidence is "no false settlement", not "the
closer fires correctly when it should". The proof test (4 parts) pins
both directions: withheld on broken + repay sitting, fired on fulfilled,
fired on an unrelated want thread, withheld on the r201 label match.

## FIGHT-STALL — NO-GO (5 stall-days)

Stall-days (≥10 "No path there." in a day): 14596 d39 (119), 14597 d122
(119) + d142 (13), 14598 d94 (236) + d14 (117). Total no-path lines 627
panel-wide.

Per-day fight context (from sayLines):

- **14596 d39 — THE SPOOL (119, 0 strikes).** The turn pattern is
  REC → NOPATH → REC → NOPATH … alternating with TOOFAR and REPLAY
  (1/3, 2/3, 3/3 cycles) all day. The scholar never closes, never
  strikes, never flees.
- **14597 d122 — THE STRIKE, inflatable rat (119, 0 strikes).** The rat
  posts demands (3 rounds of stillness / drop best tool); the grid goes
  on strike; abilities sputter. The barrier is SEALED — "You hurl
  yourself at the edge — the barrier holds. Sealed: no one leaves until
  this is decided." — repeated through the day. The flee cannot execute
  even if decided.
- **14597 d142 — LOCKPICK raccoon (13).** The fight RESOLVED: "PATIENT
  AIM: first strike, doubled", strikes for 34/23/21/29, "The Lockpick
  breaks and runs!" 13 no-path lines interleaved with real strikes — a
  marginal bar artifact, not a stall: the counter resets legitimately on
  strikes. The bar counts days ≥10 whatever the fight did.
- **14598 d94 — TRAVEL stall (236, 0 strikes, no fight markers).** The
  day's lines are mundane (dawn, eating plantain, waiting) — no monster,
  no fight. The scholar spent the day failing to path-walk somewhere
  (beginPathWalk, game.js:15073), 236 attempts. The FIGHT-STALL bar
  counts every "No path there." per day whatever its source, so a travel
  stall reads as a fight stall.
- **14598 d14 — THE HECKLER (117 no-path + 119 too-far, 0 strikes).**
  Same NOPATH/TOOFAR alternation as the spool.

Why the counter never fires (deduction, not yet proven): `fled_unreachable`
is 0 and NO `fled_*` key occurs in any per-seed JSON, so no flee of any
kind ran on the stall days — the counter never reached 3. The resets
available are: (a) fight-start key change, (b) a successful move, (c) a
strike, (d) an ability. Strikes are 0 and TOOFAR never moves the player
(tbPlayerMove returns false without moving when pathCost > moveLeft —
verified in game.js:38221), and out-of-range turns never reach the
ability branch. The run's `ctx` is created once per run in sim-harness
(runDays), so ctx churn is ruled out. That leaves (a): the monster SET
must be changing per REPLAY / inflate / demand cycle (the key is the
sorted monster ids + day), resetting the counter before 3. The travel
day (d94) is a separate bar-shape problem.

Next round's item: log the stuck key + `_closeStuck` per v2Fight call on
a spool/heckler stall (driver instrument) to confirm the key-churn
mechanism before re-keying — and split the FIGHT-STALL bar by source
(fight tbPlayerMove vs travel beginPathWalk) so a travel stall stops
reading as a fight stall. The rat's sealed barrier is the r262 prereg
item 26 case (pocketed flee): the policy needs a demand-meeting branch
for strike fights, or the game needs a stall-breaker — a design item,
not a policy counter tweak.

## C3b — GO

TRUE 0 (see above). Fix 2 holds. The r240 regression does not recur.

## People check — GO

All 23 transcripts read in full (7 + 8 + 8, no orphans); fabricHits 0.
23/23 endings marked (22 "(conversation ended by the engine)", 1 driver
cap break at 16 turns, 14597 d54) → WRAP GO.

What reads well:

- Callbacks work (dream→14597 d15 "You said you dream about before";
  regret→14597 d32 "Found another way to say it yet?"; sleep hope→14596
  d46 "You wanted one full night's sleep").
- Secrets hold under doubt-pressing (Sofia 14597 d25 confronts twice —
  one resolves mundane, one "We went over this"; Sam's age lie 14597 d24
  with a kept promise; Sofia's postal-worker confession 14597 d32).
- Betrayal cases run full arcs (site → press → approach → witnesses →
  vote; witness lines served: "No one saw Emma/Jassim/Leo leave. Just
  trees." — fix 4 holds).
- Favors have real arcs (Malik's fever promised d35 → fulfilled d55;
  Nina's wound promised d72; Linh's water haul with real numbers "9
  liters, 9 people" d63; Wren's forage commit honestly refused — away
  from Haven, d11).
- Grief is named and specific (Malik d55: "We lost Mara and Nathan. I do
  the headcount without thinking"; "The fire feels smaller without
  Nathan"; Akwasi d54: "We lost Jovan and Juliana").
- Mime conversations work (Ipek Turkish d63, Sigrun Norwegian d70).
- The bond proposal lands (Ella d77: "we should be bonded. Not just
  neighbors.").

Observations to name (not verdicts):

1. Closing-line duplication persists (r262 item 1): "This was good." and
   "Good talk. I feel like I know you a little better now." verbatim
   across sittings.
2. favor_requirements lines read as mechanics instructions, repeated 2×
   in one sitting when the driver re-picks the blocked choice (r262 item
   2, recurs: 14596 d35/d72, 14597 d42, 14598 d63).
3. Plant-teaching lines formulaic (r262 item 4, recurs: 14597 d54 — five
   plants in one sitting, same sentence, plant name swapped).
4. Two betrayal cases against the same victim in one sitting (r262 item
   5, recurs: 14598 d37 Akwasi case_4 + case_6).
5. NEW — dlg:more repeats the ask verbatim (14597 d42 Luis: the sickness
   ask served twice in full when pressed for more).
6. NEW — the d94 travel stall (above): 236 failed path-walks in a day
   with no fight — the driver retried an unreachable travel target all
   day. Worth a driver-side guard (stop retrying an unreachable travel
   target) independent of the fight-stall work.

## Telemetry

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/crisis.json --current
'.../journey-crisis-r262-delayed-seed*.json' --metrics defendedFights`
— **quiet** (3 files, 1 metric, no large deviations). Baseline NOT
rolled on a single pilot panel's variance.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-crisis-r263`
did NOT run in this window (registration took ~14 min on registry
contention; the pilot + people check filled the rest). The relevant
suites ran green instead: **churn 11/11, closer PASS (4 parts), r262
unreachable-flee 9/9, deflect-promise 11/11, resume-quote-kind 7/7,
witness-line 9/9** — 47 checks + closer PASS, all on the merged tip
shape. The full gate is owed by adoption (same as r262): run it
serially, classify failures, 0 attributable expected (standing set
only: measurement-proof staleness pair, phone-frame stale receipt,
deed-attainment 120s timeouts, load timeouts).

## Verdicts

| Bar | Verdict |
|-----|---------|
| DRY deflect_q | GO (0 dry lines) |
| C1 (game-over cause named) | GO (14596 thirst/wound named in corpses; 14598 wipe named) |
| C3b (false settlement) | **GO — fix 2 holds (0 closers, 0 TRUE)** |
| WRAP (unmarked endings) | GO (23/23 marked) |
| DODGE-ARTICLE | GO (3 dodge, 0 doubled) |
| LINK-ACCEPT | GO (0 accepts, 0 parrots — vacuous) |
| FIGHT-STALL | **NO-GO (5 stall-days; flee never fired)** |
| DOWNEDTWICE | GO (vacuous — 0 lines) |
| M12 (circles cap) | GO (2 circles, 0 repeats) |
| People check | GO |
| Telemetry | Quiet |
| Gate | OWED to adoption (see Gate) |

## Metric review (§14)

1. Wren-note "5x+" bar miscalibrated (r257, carried).
2. C3b instrument searches the wrong corpus (r257, carried).
3. Link-accept ECHO is an instrument gap (r257, carried).
4. Telemetry units still open: `playerFights` / `latelyDefenseCount`
   keys absent from the per-seed JSONs (r261 review 5, carried).
5. Census corpses omit scholar deaths (r257 review, carried).
6. PS4 arm not run this round (time-boxed pilot); the dir-hygiene item
   (clean `ps4/` between runs) stands.
7. FIGHT-STALL's bar counts failed closes, not unresolved fights (r262
   review 7, carried).
8. R58 refused-sortie book check reads a field the driver never
   populates (r262 review 8, carried).
9. MARCH-REFUSAL and TRAIL 3-PRESS have no dedicated analyzer section
   on this leg — judged by the people check only (r262 review 10).
10. The unreachable-flee proof fixture's churn case is added this run
    (r262 review 11) — and the wild panel shows churn-with-stable-set
    is NOT the defeat mechanism.
11. **NEW — FIGHT-STALL conflates travel and fight no-path:** 14598 d94
    (236 lines, no fight) counts as a stall-day. The bar needs a source
    split (tbPlayerMove vs beginPathWalk) before it can judge the fight
    fix.
12. **NEW — the closer fired 0 times this panel:** C3b GO rests on "no
    false settlement", not on "the closer fires correctly". A panel
    where a fulfilled favor's thread closes is needed to confirm the
    positive direction in the wild (the proof test pins it in fixture).
13. **NEW — d142 shows the bar's other edge:** 13 no-path lines in a
    fight that resolved with strikes. A day with failed closes AND real
    strikes is not a stall; the bar needs a strikes-aware reading.

## Village assessment in plain words

Three villages went into a hard winter and one came out the other side.
14597 held (6 alive, pantry 2,800). 14596 thinned to one survivor on
empty shelves (pantry 0 from day 50; thirst took Aisha, Dmitri, Malik).
14598 lost everyone by day 121 — monsters, the wild, the arena, and one
thirst death, with the last voices going quiet one by one.

The people read like people: promises are made and kept or broken and
remembered, secrets hold when pressed, betrayals get investigated and
voted on, grief names the dead by name, and a bond gets proposed out
loud. The thing that doesn't read right is the stall day: a whole day
of "No path there" while a monster stands across the field — or no
monster at all, just a path that isn't there — is not a fight, it's a
wait. And on the rat's day the door is sealed shut besides, so even
leaving isn't an option the game offers.

This leg doesn't reach the seat (crisis leg, no table road on this
panel). The binding wall carried from r262 stands: the muster never
grew and the launch decision is the wall, not the fight.

## Reachable / fun / winnable

- **Reachable:** 1/3 villages reached the 150-day horizon; the two
  losses died to named causes (thirst/wound on 14596, a full wipe with
  named killers on 14598). The crisis band is reachable.
- **Fun:** the conversation layer reads well (callbacks, secrets,
  betrayal arcs, mime, grief, a bond proposal). The fun-killer is the
  stall day: a day spent alternating "No path there" and "Too far" with
  zero strikes is dead time, not drama — and the travel-stall day is
  dead time without even a monster in it.
- **Winnable:** not decided on this leg — no table road on this panel,
  and the launch wall stands.

## Base movement

- Prereg base: master `4266e6cce` (sibling merged sim-doorflee2-b to
  master DURING this run's registration: `fc915f94d` → `4266e6cce`;
  the worktree base is the new tip).
- Fixes committed `beda0ee6d` (prereg + oracleV2 stuck-key + conversation
  sitting-favor anchor + both proof tests; 5 files, +470/−3). Safe-commit
  index clobber struck (staged-deleted + untracked duplicates, MM on both
  src files) — repaired via `git ls-tree -r HEAD | git update-index
  --add --index-info`; status + diff HEAD verified empty.
- Registration took ~14 min (registry flock held by the flesh-out loop's
  `sim-searvoice-a` register; `git worktree add` + `git reset --hard`
  grinding from 03:05Z). Heartbeat landed 03:14:53Z; hbloop
  `journey2-crisis-hbloop-r263.sh` (5-min loop, pid 15378) ran for the
  whole run.
- Rotation-b: crisis is leg 6 → 7 (read immediately before writing).
- Lock: `playtest-loop-2.lock` deleted only if the file matches
  `playtest-loop-2-20261122T0300Z`, read in the same call as the delete.
