# sim-awayeve-b — matched-seed census comparison (NOT a panel comparison)

Arm: sim-awayeve-b, base 6409c13128f3f986f9a7f6b756483a8aeb07d18c,
30d, bands A1 17543-17550 (pilot) + A2 17551-17566 (confirm),
24 seeds x 4 policies = 96 judged legs, 2,856 evenings.
Method: per-policy censuses from scripts/analyze-awayeve-b.js
on the pilot and confirm corpora; the pooled census per
policy is the concatenation of the two cells' perSeed
arrays with totals recomputed as sums/merges (file
sim-awayeve-b-census-pooled-<policy>-30d.json, whose
corpusDir field states this method). No panel result is
claimed: see the §15 declaration in the prereg and the
evidence file. Matched seeds share the RNG seed, NOT the
trajectory — policies diverge from day 1 (wrappers act
during daily), so contrasts are distributional, except
where a single seed-day pair is cited as a direct
contrast (17563 day 5, below).

## Pooled away share by policy (identical seeds)

| policy | legs | evenings | haven | road | away | away share |
|---|---|---|---|---|---|---|
| P1 nighttravel-stack | 24 | 714 | 683 | 0 | 31 | 4.3% |
| P3 deed-seeking | 24 | 720 | 249 | 0 | 471 | 65.4% |
| BARE competent-only | 24 | 708 | 671 | 0 | 37 | 5.2% |
| creekseek-stack | 24 | 714 | 679 | 0 | 35 | 4.9% |

## Per-band split (never pooled away in the verdict)

| policy | A1 away / evenings | A2 away / evenings |
|---|---|---|
| P1 | 21 / 234 (9.0%) | 10 / 480 (2.1%) |
| P3 | 170 / 240 (70.8%) | 301 / 480 (62.7%) |
| BARE | 13 / 228 (5.7%) | 24 / 480 (5.0%) |
| creekseek | 21 / 234 (9.0%) | 14 / 480 (2.9%) |

The P1-vs-BARE contrast FLIPS by band (A1: P1 +8 away;
A2: P1 -14 away), so no systematic "evening step raises
(or lowers) away share" claim is supported. What IS
systematic is the STORY: P1 away nights are
return-attempted 30/31 (all out-of-reach; the 1
exception is the blocked-combat 17563 day-4 evening,
whose outcome is travel-refused), while BARE away
nights are no-return-step 35/37 (blocked-combat 2).
The evening step converts no-attempt nights into
attempted nights; whether a given seed ends up with
more or fewer away evenings is seed-driven.

## Creekseek-vs-P1 (the strandwide delta, re-measured on away evenings)

Pooled: creekseek 35 away vs P1 31 (+4), creek away
24 vs 20 (+4), forest_floor away 11 vs 11 (same),
episodes 7 vs 7 with identical end splits
(SUCCESSION 5, WALK-HOME 2). Pilot: IDENTICAL on
every number (21 away, same days, same episodes).
Confirm: the whole +4 sits on ONE seed, 17563
(P1 away days [4, 6, 7, 8]; creekseek [4, 6-12]):
creekseek's single successful move in 714 evenings
(day 5, forest_floor (5,3) -> creek (4,3), a VISIT —
evening at haven on both policies) precedes a 4-day
longer second episode at the (2,0) creek (same
vessel gen_ocpths4 survives days 9-12 on creekseek;
on P1 the successor wakes at haven on day 9). The
delta is one extended episode, not new departures
and not a new seed.

Creekseek move records, pooled (714 evenings):
at-haven skip 676, already-creek 13 (pilot) + 11
(confirm) = 24, combat skip 2, no-creek-offered 10
(all pilot), attempted-but-refused 1 (17563 day 4),
moved-to-creek 1 (17563 day 5). Successful moves:
1 in 714 evenings.

## P3-vs-BARE (what deed patrols do to evenings)

Pooled: P3 471 away (65.4%, 23/24 seeds) vs BARE 37
(5.2%, 6/24 seeds). P3 away tiles span 8 types
(forest_floor 255, grove 56, trail_edge 55, creek
68, ruin 32, meadow 2, wetland 2, thicket 1) vs
BARE's 2 (forest_floor 28, creek 9). P3 episodes:
116 (WALK-HOME 56, SUCCESSION 49, HORIZON 11);
BARE episodes: 7 (SUCCESSION 5, HORIZON 2,
WALK-HOME 0). P3's away life starts on day 5 on
nearly every seed and cycles in ~5-day patrol
rhythms ([5-7], [10-12], [15-17], [19-21], [22-24],
[26-29] shapes recur). The one seed where patrols
add nothing: 17563, where BARE and P3 away days and
episodes are IDENTICAL ([4-9], [11-19], both
SUCCESSION) — the villager is already out all day,
so patrols change no evening.

## What ends days away, by policy (pooled)

- P1: return-attempted 30 (out-of-reach 30; the
  single travel-refused OUTCOME, 17563 day 4, sits
  under blocked-combat by the prereg's ordering
  rule) + blocked-combat 1. Departures 7,
  continuations 24. Tiles: creek 20, forest_floor 11.
- P3: no-return-step 465 + blocked-combat 6.
  Departures 116, continuations 355. Day shape
  among away evenings: forage delta > 0 on 468/471,
  patrol delta > 0 on 162/471, travel lines on
  471/471, blocked-crossing flag on 80/471.
- BARE: no-return-step 35 + blocked-combat 2.
  Departures 7, continuations 30. Tiles: creek 9,
  forest_floor 28.
- creekseek: return-attempted 34 (out-of-reach 34;
  same blocked-combat 17563 day-4 evening as P1)
  + blocked-combat 1. Departures 7, continuations 28.

Zeros that are findings, not gaps: road evenings
0/2,856; tent-camp evenings 0; woke-at-haven-same-
vessel stories 0; detour outcomes 0; tripHomeDetours
signals 0; UNCLASSIFIED evenings 0 (completeness
100% on all four policies, both bands).

## Return stories (pooled)

| policy | failed-return | no-attempt | walked-home-next-day | ended-other | still-away-at-horizon |
|---|---|---|---|---|---|
| P1 | 24 | 0 | 2 | 5 (succession) | 0 |
| P3 | 0 | 352 | 56 | 52 (succession 49, blocked-combat-cont. 3) | 11 |
| BARE | 0 | 28 | 0 | 7 (succession 5, blocked-combat-cont. 2) | 2 |
| creekseek | 28 | 0 | 2 | 5 (succession) | 0 |

P3 departures 116 vs genuine absences 114: the gap
is exactly 2 sleep-return-class evenings that are
succession mornings (17555 day 10 ruin, 17559 day 22
forest_floor) — vessel-changed haven mornings, not
walks home. P1/BARE/creekseek departures equal
their genuine counts (7/7 each).

## Base check (not judged, reported as drift)

P1 17523 and creekseek 17523 on this base reproduce
strandwide EXACTLY (P1: 8 creek evenings, 7
confirmed, 7 FAILED-RETURN, episode days 7-13
SUCCESSION; creekseek: 13 / 11 / 11, episodes days
7-13 and 18-21, both SUCCESSION). Zero drift
ee159dbc3 -> 6409c1312 on the named seed. Awayeve
cross-read on the same legs: P1 10 away evenings
(8 creek + 2 trail_edge, all return-attempted);
creekseek 13 away (all creek, all return-attempted).
