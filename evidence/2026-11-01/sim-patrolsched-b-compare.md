# sim-patrolsched-b — compare (matched-seed census, NOT a balance-panel result)

Per the prereg's §15 declaration, scripts/balance-panel.js
cannot express a 30-day per-day away-evening census or a
non-registry policy (deed-weekly), so no panel result is
claimed. This compare is the awayeve analyzer's census on
identical seeds through the patrolsched driver, both legs
on base e6a1351c7a407e99032f5a29dc0d35e13b828b64.

## Pooled (B1+B2, 24 legs per policy, 720 evenings each)

| policy | evenings | haven | road | away | away share | episodes | departures |
|---|---|---|---|---|---|---|---|
| P3 deed-seeking (3x/week) | 720 | 243 | 0 | 477 | 66.3% | 120 | 120 |
| deed-weekly (1x/week) | 720 | 417 | 0 | 303 | 42.1% | 84 | 84 |
| difference (weekly - P3) | — | +174 | 0 | -174 | -24.2 pts | -36 | -36 |

## Per-band split (never pooled away)

| band | P3 away / evenings | weekly away / evenings | drop |
|---|---|---|---|
| B1 pilot (17567-17574) | 157 / 240 (65.4%) | 93 / 240 (38.8%) | -26.7 pts |
| B2 confirm (17575-17590) | 320 / 480 (66.7%) | 210 / 480 (43.8%) | -22.9 pts |

## Per-seed pooled away counts (a = away evenings, h = haven evenings)

| seed | P3 a/h | weekly a/h | delta |
|---|---|---|---|
| 17567 | 24/6 | 14/16 | -10 |
| 17568 | 18/12 | 9/21 | -9 |
| 17569 | 18/12 | 11/19 | -7 |
| 17570 | 19/11 | 11/19 | -8 |
| 17571 | 14/16 | 3/27 | -11 |
| 17572 | 19/11 | 12/18 | -7 |
| 17573 | 23/7 | 18/12 | -5 |
| 17574 | 22/8 | 15/15 | -7 |
| 17575 | 21/9 | 11/19 | -10 |
| 17576 | 21/9 | 11/19 | -10 |
| 17577 | 26/4 | 17/13 | -9 |
| 17578 | 20/10 | 14/16 | -6 |
| 17579 | 0/30 | 0/30 | 0 |
| 17580 | 23/7 | 17/13 | -6 |
| 17581 | 21/9 | 16/14 | -5 |
| 17582 | 17/13 | 11/19 | -6 |
| 17583 | 24/6 | 15/15 | -9 |
| 17584 | 23/7 | 17/13 | -6 |
| 17585 | 26/4 | 18/12 | -8 |
| 17586 | 18/12 | 10/20 | -8 |
| 17587 | 20/10 | 15/15 | -5 |
| 17588 | 23/7 | 14/16 | -9 |
| 17589 | 18/12 | 13/17 | -5 |
| 17590 | 19/11 | 11/19 | -8 |

23 of 24 seeds drop; the exception is 17579, which ends
0 evenings away on BOTH policies (the no-away seed, as
awayeve's 17557 was). No seed rises on the weekly leg.

## Breakdowns (pooled)

Away by tile — P3: forest_floor 161, trail_edge 117,
creek 122, grove 24, ruin 14, wetland 22, meadow 17.
Weekly: forest_floor 112, trail_edge 77, creek 81,
meadow 13, ruin 8, wetland 8, thicket 4, grove 0.
The weekly leg loses the grove away evenings entirely
and roughly a third of the creek away evenings — fewer
patrols mean fewer away PLACES, not just fewer nights.

Away by start — P3: departure 120, continuation 357.
Weekly: departure 84, continuation 219. Departures
fall exactly with episodes (one departure per episode
by construction); continuations fall with episode
length (mean episode length 3.98 days P3 vs 3.61 weekly).

Away by end-cause — P3: no-return-step 472,
blocked-combat 5. Weekly: no-return-step 296,
blocked-combat 7. No return-attempted evenings on
either leg (neither policy has an evening return step),
no tent-camp evenings, no other-cause evenings.

Away by return story — P3: no-attempt 354,
walked-home-next-day 51, ended-other 56 (succession
53, blocked-combat-continuation 3), still-away-at-
horizon 16. Weekly: no-attempt 216,
walked-home-next-day 20, ended-other 44 (succession
41, blocked-combat-continuation 3), still-away-at-
horizon 23. Episode ends — P3: WALK-HOME 51,
SUCCESSION 53, HORIZON 16. Weekly: WALK-HOME 20,
SUCCESSION 41, HORIZON 23. Episode lengths — P3:
1 day 7, 2-4 days 77, 5+ days 36. Weekly: 1 day 4,
2-4 days 61, 5+ days 19.

Day shape among away evenings — P3: patrol delta > 0
on 174/477, forage delta > 0 on 474/477, travel lines
on 475/477, blocked-crossing flag on 113/477, creek
away evenings 122, camps 22, genuine absences 115
(vs 120 departures). Weekly: patrol delta > 0 on
84/303, forage delta > 0 on 290/303, travel lines on
295/303, blocked-crossing flag on 71/303, creek away
evenings 81, camps 16, genuine absences 82 (vs 84
departures). The patrolDelta away count on the weekly
leg (84) equals its episode count (84): one patrol
departure day per episode, as designed — the weekly
patrol fires once per away episode, never twice.

## Survival / cost (pooled)

All 48 legs survived the 30-day window (daysAlive
30.0 mean on both policies, endReason 'survived'
24/24 each, game-over legs 0 vs 0). The cost
guardrails pass with zero margin consumed. Death
records inside the legs (world churn, not leg-ending
deaths — the village survives by succession): 273
records P3 vs 271 weekly; villager deaths by cause —
P3: the wild 37, starvation 16, monster 11,
sickness 7, dehydration 4, arena 2, contest 2, wound
1, Lockpick 1 (81 villager deaths, 63 player-vessel);
weekly: the wild 34, starvation 7, monster 4,
dehydration 4, sickness 3, the night 3, contest 3,
other 4 (62 villager deaths, 51 player-vessel).
Starvation deaths fall (16 -> 7) rather than rise —
staying home more did not starve the village on
this band; if anything the weekly leg's villagers
die less, though death-cause counts on divergent
trajectories are descriptive, not a causal claim.

## Wall context (NOT a wall measurement)

maxWaveUnlocked per leg — P3: wave 1 on 4 legs,
wave 2 on 19, wave 3 on 1. Weekly: wave 1 on 3,
wave 2 on 19, wave 3 on 2. Wave kills pooled —
P3: wave 1: 156, wave 2: 25. Weekly: wave 1: 168,
wave 2: 25. No leg reaches wave 4 or 5 in a 30-day
pre-seat window on either policy, as expected.
National / table / wins: NOT MEASURED HERE — this
is a pre-seat away-evening census, and those numbers
are reported as not measured, never fabricated.
