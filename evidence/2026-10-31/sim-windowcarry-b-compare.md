# sim-windowcarry-b — PAIRED COMPARE (control vs variant, identical seeds)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1230Z,
arm sim-windowcarry-b, axis food-economy. Generated from
evidence/2026-10-31/sim-windowcarry-b-census-{guard,on}.json by
scripts/analyze-windowcarry-b.js. This is a paired control-vs-variant
comparison on identical seeds through the census analyzer — NOT a
balance-panel comparison (see §15 declaration in sim-windowcarry-b.md).

Det-gate: OFF reproduces control creek/still/rescued exactly on every
seed, both legs (det=true on all 16 seed-legs). Determinism: ON
variant re-run byte-identical on all 8 seeds (cmp clean).

## Guard leg (WOODWARM=0)

| seed | control still | variant still | control ticksShort | variant ticksShort | control maxWave | variant maxWave | daysAlive c/v |
|------|---------------|---------------|--------------------|--------------------|-----------------|-----------------|---------------|
| 15003 | [] | [] | 0 | 0 | 2 | 1 | 30/30 |
| 15009 | [] | [] | 0 | 0 | 2 | 3 | 30/30 |
| 15091 | [] | [] | 0 | 0 | 2 | 2 | 30/30 |
| 15211 | [] | [] | 0 | 0 | 2 | 2 | 30/30 |
| 15215 | [7,8,9] | [4,5,6] | 1 | 2 | 1 | 2 | 30/30 |
| 15220 | [] | [] | 0 | 0 | 2 | 2 | 30/30 |
| 15221 | [] | [] | 0 | 0 | 2 | 2 | 30/30 |
| 15337 | [] | [20] | 0 | 0 | 2 | 2 | 30/30 |

Median daysAlive: control 30, variant 30. Window violations: none.
Linked rescues (15215): none. Vessel deaths (player=true): 15215
control none → variant days 6, 17, 29; 15220 control none → variant
day 20; all other seeds no earlier vessel death.

## ON leg (WOODWARM=1)

| seed | control still | variant still | control ticksShort | variant ticksShort | control maxWave | variant maxWave | daysAlive c/v |
|------|---------------|---------------|--------------------|--------------------|-----------------|-----------------|---------------|
| 15003 | [] | [] | 0 | 0 | 2 | 1 | 30/30 |
| 15009 | [] | [] | 0 | 0 | 2 | 3 | 30/30 |
| 15091 | [] | [] | 0 | 0 | 2 | 2 | 30/30 |
| 15211 | [] | [] | 0 | 0 | 2 | 2 | 30/30 |
| 15215 | [7,8,9,10,11,12,13,14,15,16] | [4] | 1 | 1 | 1 | 2 | 30/30 |
| 15220 | [] | [] | 0 | 0 | 2 | 2 | 30/30 |
| 15221 | [] | [] | 0 | 0 | 2 | 2 | 30/30 |
| 15337 | [] | [20] | 0 | 0 | 2 | 2 | 30/30 |

Median daysAlive: control 30, variant 30. Window violations: none.
Linked rescues (15215): none — the variant's only rescued evening
is day 5, outside the control range 7-16. Vessel deaths
(player=true): 15215 control day 17 → variant day 13 (earlier);
15220 control none → variant day 20; all other seeds no earlier
vessel death.

## Reading

The count fall on 15215 ON is large (10 → 1) but it is a
re-timing, not a rescue of the control strand: the variant strands
on days 4-6 (guard) / day 4 (ON) instead of days 7-9 / 7-16. The
guardrail breaches are the same classes morningcarry found, in new
places: a new late still evening on 15337 (day 20, wood 0) on both
legs, a ticks-short increase on 15215 guard (1 → 2), and earlier /
new vessel deaths on 15215 and 15220. The bounded window fixed
morningcarry's 15211 breach (15211 variant still [] on both legs
here) and held the window perfectly (zero violations), but it did
not fix the re-routing: a pre-strand bank still moves the whole
early trajectory.
