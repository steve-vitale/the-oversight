# Action telemetry — 32-run courtship suite at 180 days

_evidence/2026-10-13/sim-action-telemetry.md — 2026-10-13_

**CORRECTION 2026-10-13 (taxonomy):** two verbs were misfiled in the
harness/analyzer category map. `corpseTakeItem` (looting corpses) was under
`social`, now `food` — this flipped the analysis: stalls are **loot-dominated**,
not social-dominated (see sim-stall-forensics.md); top-3 categories moved from
social/food/combat to food/social/combat. `studyVillageCodex` (solitary codex
study) was under `social`, now `field` alongside `readBook` — minor (590 verbs).
All tables regenerated with both fixes; no run-level numbers changed, only
category assignment.

Suite: seeds 11/22/33/44/55/66/77/88 × competent/winseek/belongseek/leadcourt, 180-day horizon,
harness sim-harness.js PLAYER-VERB TELEMETRY (origin-separated: deliberate = policy-hook
invocations only; driver = harness stand-ins; internal = game-code calls, excluded).

Caveat: counts are POLICY decisions, a proxy for the action economy's demands — a
human batches differently (fewer, bigger meals; less compulsive upkeep). What the
numbers expose is the economy's granularity: per-item eat/take verbs with no batch
actions, and late-game days dominated by social upkeep verbs.

## Headline numbers

- Median deliberate actions/day (across runs): **69**
- Total deliberate actions to day 100: median **8362** (n=9, p10 6377, p90 12725)
- Total deliberate actions to day 130: median **15075** (n=2, p10 13039, p90 15075)
- Total deliberate actions to day 180: median **0** (n=0, p10 0, p90 0)
- Top-3 action categories: **food (145,024), social (56,967), combat (44,401)**
- DayTicks utilization: median **0.766** of the 512-tick day (mean 0.762)
- Curve bend: median actions/day halves vs day 7 (217) at **day 20**
- Old upper-bound metric would have reported **158.1** verbs/day — the honest deliberate count is the number above.

## Per-policy medians

| policy | runs | median deliberate/day | median survival |
|---|---|---|---|
| competent | 8 | 65 | 105d |
| winseek | 8 | 90 | 40d |
| belongseek | 8 | 68 | 73d |
| leadcourt | 8 | 66 | 95d |

## Actions/day curve (median across runs alive that day)

| day | n | delib | food | social | field | travel | combat | water |
|---|---|---|---|---|---|---|---|---|
| 1 | 32 | 6 | 1 | 3 | 2 | 0 | 0 | 0 |
| 2 | 32 | 37 | 1 | 34 | 2 | 0 | 0 | 0 |
| 3 | 32 | 65 | 12 | 43 | 3 | 4 | 0 | 4 |
| 4 | 32 | 213 | 165 | 42 | 4 | 4 | 0 | 2 |
| 5 | 32 | 217 | 165 | 41 | 3 | 4 | 0 | 2 |
| 6 | 32 | 223 | 165 | 38 | 4 | 4 | 0 | 4 |
| 7 | 32 | 217 | 168 | 39 | 4 | 5 | 0 | 3 |
| 8 | 32 | 212 | 165 | 39 | 3 | 4 | 0 | 2 |
| 9 | 32 | 217 | 168 | 40 | 4 | 4 | 0 | 4 |
| 10 | 32 | 217 | 168 | 39 | 3 | 4 | 0 | 2 |
| 20 | 31 | 74 | 29 | 29 | 3 | 5 | 0 | 2 |
| 30 | 30 | 64 | 18 | 27 | 3 | 7 | 0 | 2 |
| 40 | 28 | 54 | 24 | 23 | 3 | 4 | 0 | 2 |
| 50 | 26 | 62 | 28 | 22 | 3 | 4 | 0 | 2 |
| 60 | 23 | 66 | 35 | 18 | 3 | 4 | 0 | 2 |
| 70 | 17 | 71 | 38 | 18 | 3 | 4 | 0 | 2 |
| 80 | 14 | 71 | 48 | 16 | 3 | 4 | 0 | 2 |
| 90 | 9 | 71 | 39 | 13 | 3 | 4 | 0 | 2 |
| 100 | 7 | 59 | 46 | 7 | 2 | 2 | 0 | 2 |
| 110 | 3 | 107 | 82 | 1 | 3 | 4 | 0 | 2 |
| 120 | 2 | 119 | 109 | 7 | 3 | 4 | 1 | 2 |

## Tedium hotspots (single day > 2× run median, no progress ±3 days)

None found.

## Stall stretches (≥7 days above-median actions, zero progress on ledger/scale/codex/standing)

- competent/s11 days 78–84: 101.7/day (run median 101) — food:78, social:15, travel:4
- winseek/s33 days 35–41: 90.9/day (run median 90) — food:53, social:20, travel:8
- belongseek/s11 days 57–63: 71/day (run median 69) — food:31, social:28, field:6
- belongseek/s33 days 60–66: 98.9/day (run median 73) — food:59, social:27, travel:9
- belongseek/s77 days 29–35: 45.9/day (run median 45) — social:25, food:12, travel:4
- leadcourt/s11 days 86–92: 78.7/day (run median 66) — food:66, travel:4, social:3
- leadcourt/s33 days 72–78: 74.4/day (run median 73) — food:46, social:12, travel:7

## What the game does on its own (internal verb traffic, excluded from deliberate)

Top internal verbs across the suite: linkWith (46,822), switchboard (18,790), stockPantry (8,089), prepStash (6,332), offerSystemQuest (2,389), villageMeal (2,357), teachPlant (298), proveWorth (125)

Driver (harness stand-in) categories: wait (6,998), show (984)

## Villager-counter GO check

- Wave-3 kills, villager-attributed (death tele cause 'patrol combat' or 'villager combat'): **0**
- Wave-3 kills, player-attributed (cause='combat'): 0
- Wave-3 kills, unattributed in death telemetry (aid-crisis/contest/agency channels call recordWaveKill without registerDeath): **6** of ledger total 6
- By policy (villager-attributed / unattributed / ledger): competent 0/2/2 · winseek 0/0/0 · belongseek 0/1/1 · leadcourt 0/3/3
- Median survival: **73d** vs standing-tune baseline 71d
- Verdict: **NO-GO** (strict rule: attributed kills > 0 AND survival >= baseline)

Reading the verdict two ways (coordinator's call):
- By the pilot's own ledger metric (wk["3"] on courtship policies, where the player
  doesn't hunt so ledger kills are villager kills): 4 villager wave-3 kills on 16
  courtship runs (belongseek s33: 1, leadcourt s88: 3), median survival 73d >= 71d — GO.
  The exact 8-run pilot subset (seeds 11-44 x leadcourt/belongseek) reproduces the
  pilot's finding: 1 ledger wave-3 kill (belongseek s33).
- By strict channel attribution (death-tele causes 'patrol combat'/'villager combat',
  the paths the new counter-execution field-fight code feeds): 0 kills in 32 runs —
  the arm's headline machinery produced no attributable wave-3 kills. All 6 ledger
  kills are ledger-only (aid-crisis/contest/agency channels call recordWaveKill
  without registerDeath, so no death record exists to attribute).
- Competent's 2 ledger kills are ambiguous (player contest kills also land
  unattributed); player TB-attributed wave-3 kills were 0/32.

## Method / proof of effect

scripts/proof-telemetry-20261013.js, all controls green on the suite base:
(A) scripted 3-day policy (2 forage + 1 eat + 1 talkTo per daily) produced exactly
12 deliberate actions with byCategory {field:6, food:3, social:3}, 9 driver waits,
3 policyCalls, and the accounting identity deliberate+driver+internal == legacy raw;
(B) idle policy produced 0 deliberate actions — internal game traffic (linkWith,
switchboard, villageMeal, offerSystemQuest, prepStash, stockPantry) never leaks in;
(C) the old upper-bound metric reported 105 "player verbs" where only 12 were deliberate;
(D) TELEMETRY_VERBS=1 vs 0 on the same seed gave byte-identical end states
(days, endReason, pop, pantry, waveKills) — instrumentation is pure passthrough, RNG untouched.
Re-entrancy rule: a verb fired from inside another verb's execution is internal by
construction (caught foreignCrisisTick calling linkWith/switchboard during waits).

## Verbs the old 11-verb list was missing

Old list: doAction, contestChoose, tbPlayerStrike, tbPlayerWait, talkTo, convoTurn, eat, takeFromPantry, donateToPantry, stealFrom, travelTo.

Audit of scripts/policies/*.js found ~60 more player verbs now instrumented, including:
cookFood, boilWater, fillWater, eatOne, takeFromPantryBulk, stockPantry, villageMeal, treatDisease,
treatVillager, useMedicine, removeTick, testMonsterMeat, setTrap, craft, makePlot, sowPlot, readBook,
sortBag, prepStash, corpseTakeItem (loot!), hostFeast, feastBurn, useAbility, activateAbility,
tbPlayerMove, tbPlayerShout, tbPlayerOfferFood, tbBarrierExit, standGround, answerDefenseCall,
askAbout, endConvo, teachPlant, teachVillager, assignTask, channelSentiment, tendLink, proposeLink,
proposeTrade, proposeCovenant, answerAidBeg/Offer/Demand/Counter/Accord, answerNationalChoice,
answerGlobalChoice, chooseTableOption, handInAidQuest, payTribute, rallyVillage, linkWith,
offerSystemQuest, pathStep, beginPathWalk, clearBlockage, faceFeastDraw, yieldChallenge, switchboard,
studyVillageCodex, proveWorth, agencyTurn. doAction kinds (forage/rest/wait/drink) now route to
categories instead of one bucket.
